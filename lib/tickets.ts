import "server-only";
import { db } from "./db";
import type { Prisma } from "@/generated/prisma/client";
import { type Actor, canAccess, allowedActor } from "./policy";
import { HttpError } from "./http";
export function ticketScope(user: Actor): Prisma.TicketWhereInput {
  if (!allowedActor(user)) return { id: "__denied__" };
  return user.role === "ADMIN" ? {} : user.role === "PROFESSIONAL" ? { assignedProfessionalId: user.id } : { requesterId: user.id };
}
export async function ticketTransaction<T>(user: Actor, id: string, work: (tx: Prisma.TransactionClient, ticket: Awaited<ReturnType<Prisma.TransactionClient["ticket"]["findUniqueOrThrow"]>>) => Promise<T>) {
  return db().$transaction(async tx => {
    await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
    const current = await tx.user.findUnique({ where: { id: user.id }, include: { professionalProfile: true } });
    await tx.$queryRaw`SELECT "id" FROM "Ticket" WHERE "id" = ${id} FOR UPDATE`;
    const ticket = await tx.ticket.findUnique({ where: { id } });
    if (!current || current.role !== user.role || !ticket || !canAccess(current, ticket)) throw new HttpError(404, "Pratica non trovata.");
    return work(tx, ticket);
  }, { timeout: 15000 });
}
export async function ticketDetail(user: Actor, id: string) {
  return db().ticket.findFirst({ where: { id, ...ticketScope(user) }, include: {
    requester: { select: { firstName: true, lastName: true, email: true, businessProfile: { select: { companyName: true } } } },
    assignedProfessional: { select: { firstName: true, lastName: true, professionalProfile: { select: { profession: true } } } },
    messages: { where: user.role === "USER" ? { internalOnly: false } : {}, orderBy: { createdAt: "asc" }, include: { author: { select: { firstName: true, lastName: true, role: true } } } },
    attachments: { where: user.role === "USER" ? { OR: [{ messageId: null }, { message: { internalOnly: false } }] } : {}, orderBy: { createdAt: "desc" } },
    events: { where: user.role === "USER" ? { OR: [{ type: { not: "MESSAGE_ADDED" } }, { note: null }, { note: { not: "internal" } }] } : {}, orderBy: { createdAt: "desc" }, include: { actor: { select: { firstName: true, lastName: true, role: true } } } },
  } });
}

import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { sessionUser, area } from "@/lib/auth";
import { sameOrigin, readForm, rateLimit, HttpError, errorResponse } from "@/lib/http";
import { categories, statuses, priorities } from "@/lib/labels";
import { canAssign, canTransition } from "@/lib/policy";
import { ticketTransaction } from "@/lib/tickets";
import { validatedFile } from "@/lib/files";
import { upload, remove, storageConfigured } from "@/lib/storage";
import { emailSchema } from "@/lib/validation";
import { mailConfigured, sendToken } from "@/lib/mail";
const idSchema = z.string().min(1).max(100);
const categorySchema = z.enum(Object.keys(categories) as [keyof typeof categories, ...Array<keyof typeof categories>]);
const statusSchema = z.enum(Object.keys(statuses) as [keyof typeof statuses, ...Array<keyof typeof statuses>]);
const prioritySchema = z.enum(Object.keys(priorities) as [keyof typeof priorities, ...Array<keyof typeof priorities>]);
export const runtime = "nodejs";
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    sameOrigin(request);
    const user = await sessionUser();
    if (!user) throw new HttpError(401, "Accedi per continuare.");
    const { action } = await context.params;
    await rateLimit(`portal:${user.id}`, 80, 60);
    const form = await readForm(request, action === "upload" ? 11 * 1024 * 1024 : 32768);
    const values = Object.fromEntries(form);
    if (action === "create-ticket") {
      if (user.role !== "USER" || !user.accountType || !user.privacyAcceptedAt || !user.termsAcceptedAt) throw new HttpError(403, "Completa prima il tuo profilo.");
      await rateLimit(`tickets:${user.id}`, 20, 86400);
      const v = z.object({ subject: z.string().trim().min(5).max(200), description: z.string().trim().min(20).max(10000), category: categorySchema }).parse(values);
      const ticket = await db().ticket.create({ data: { ...v, code: `AST-${new Date().getUTCFullYear()}-${randomUUID().replaceAll("-", "").slice(0,12).toUpperCase()}`, requesterId: user.id, events: { create: { actorId: user.id, type: "CREATED" } } } });
      return Response.json({ redirect: `/area-riservata/pratiche/${ticket.id}` });
    }
    if (["message", "status", "priority", "assign", "upload"].includes(action)) {
      const id = idSchema.parse(values.ticketId);
      if (action === "upload") {
        if (!storageConfigured()) throw new HttpError(503, "Caricamento documenti non ancora disponibile.");
        const file = form.get("file");
        if (!(file instanceof File)) throw new HttpError(400, "Seleziona un documento.");
        const bytes = new Uint8Array(await file.arrayBuffer());
        let name; try { name = validatedFile(file.name, file.type, bytes); } catch (e) { throw new HttpError(400, (e as Error).message); }
        const key = `tickets/${id}/${randomUUID()}`;
        // Authorization before storage access, repeated under lock before recording metadata.
        await ticketTransaction(user, id, async (_tx, ticket) => { if (ticket.status === "CLOSED") throw new HttpError(400, "La pratica è chiusa."); });
        await upload(key, bytes, file.type);
        try {
          await ticketTransaction(user, id, async (tx, ticket) => {
            if (ticket.status === "CLOSED") throw new HttpError(400, "La pratica è chiusa.");
            const total = await tx.ticketAttachment.aggregate({ where: { ticketId: id }, _sum: { sizeBytes: true }, _count: true });
            if (total._count >= 50 || (total._sum.sizeBytes || 0) + bytes.length > 100 * 1024 * 1024) throw new HttpError(400, "Limite documenti raggiunto per questa pratica.");
            await tx.ticketAttachment.create({ data: { ticketId: id, uploaderId: user.id, originalName: name, storageKey: key, mimeType: file.type, sizeBytes: bytes.length } });
            await tx.ticketEvent.create({ data: { ticketId: id, actorId: user.id, type: "ATTACHMENT_ADDED" } });
          });
        } catch (e) { await remove(key).catch(() => undefined); throw e; }
      } else {
        await ticketTransaction(user, id, async (tx, ticket) => {
          if (action === "message") {
            if (ticket.status === "CLOSED") throw new HttpError(400, "La pratica è chiusa.");
            const body = z.string().trim().min(1).max(10000).parse(values.body);
            const internalOnly = values.internalOnly === "on";
            if (internalOnly && user.role === "USER") throw new HttpError(403, "Operazione non consentita.");
            await tx.ticketMessage.create({ data: { ticketId: id, authorId: user.id, body, internalOnly } });
            await tx.ticketEvent.create({ data: { ticketId: id, actorId: user.id, type: "MESSAGE_ADDED", note: internalOnly ? "internal" : null } });
          }
          if (action === "status") {
            const status = statusSchema.parse(values.status);
            if (!canTransition(user.role, ticket.status, status)) throw new HttpError(403, "Passaggio di stato non consentito.");
            const type = status === "CLOSED" ? "CLOSED" : ticket.status === "CLOSED" ? "REOPENED" : "STATUS_CHANGED";
            await tx.ticket.update({ where: { id }, data: { status, resolvedAt: ["RESOLVED", "CLOSED"].includes(status) ? ticket.resolvedAt || new Date() : null, closedAt: status === "CLOSED" ? new Date() : null } });
            await tx.ticketEvent.create({ data: { ticketId: id, actorId: user.id, type, fromValue: ticket.status, toValue: status } });
            if (ticket.status === "CLOSED" && ticket.assignedProfessionalId) {
              await tx.ticket.update({ where: { id }, data: { assignedProfessionalId: null, assignedAt: null } });
              await tx.ticketEvent.create({ data: { ticketId: id, actorId: user.id, type: "UNASSIGNED", fromValue: ticket.assignedProfessionalId } });
            }
          }
          if (action === "priority") {
            if (user.role !== "ADMIN") throw new HttpError(403, "Operazione riservata ad ASTREA.");
            const priority = prioritySchema.parse(values.priority);
            await tx.ticket.update({ where: { id }, data: { priority } });
            await tx.ticketEvent.create({ data: { ticketId: id, actorId: user.id, type: "PRIORITY_CHANGED", fromValue: ticket.priority, toValue: priority } });
          }
          if (action === "assign") {
            const assignedProfessionalId = z.string().max(100).parse(values.professionalId) || null;
            if (user.role !== "ADMIN" || (assignedProfessionalId && !canAssign(user.role, ticket.status))) throw new HttpError(403, "ASTREA può assegnare un professionista solo dopo la presa in carico.");
            if (assignedProfessionalId) {
              await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${assignedProfessionalId} FOR UPDATE`;
              const professional = await tx.user.findFirst({ where: { id: assignedProfessionalId, role: "PROFESSIONAL", active: true, professionalProfile: { enabled: true } } });
              if (!professional) throw new HttpError(400, "Professionista non disponibile.");
            }
            await tx.ticket.update({ where: { id }, data: { assignedProfessionalId, assignedAt: assignedProfessionalId ? new Date() : null } });
            await tx.ticketEvent.create({ data: { ticketId: id, actorId: user.id, type: assignedProfessionalId ? "ASSIGNED" : "UNASSIGNED", fromValue: ticket.assignedProfessionalId, toValue: assignedProfessionalId } });
          }
        });
      }
      return Response.json({ redirect: `${area(user.role)}/pratiche/${id}` });
    }
    if (user.role !== "ADMIN") throw new HttpError(403, "Operazione riservata ad ASTREA.");
    if (action === "create-professional") {
      if (!mailConfigured()) throw new HttpError(503, "Configura l'invio email per invitare i professionisti.");
      const v = z.object({ email: emailSchema, firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().min(1).max(100), profession: z.string().trim().min(2).max(150), expertise: z.string().max(1000).default("") }).parse(values);
      const professional = await db().user.create({ data: { email: v.email, firstName: v.firstName, lastName: v.lastName, role: "PROFESSIONAL", professionalProfile: { create: { profession: v.profession, expertise: v.expertise.split(",").map(s=>s.trim()).filter(Boolean), enabled: false } } } });
      try { await sendToken(professional.email, "invite"); } catch { return Response.json({ message: "Account creato e disabilitato. L'invito non è stato inviato: riprova dall'elenco." }); }
      return Response.json({ redirect: "/admin/professionisti" });
    }
    if (action === "toggle-professional") {
      const id = idSchema.parse(values.userId); const enabled = values.enabled === "true";
      await db().$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${id} FOR UPDATE`;
        const target = await tx.user.findFirst({ where: { id, role: "PROFESSIONAL" } });
        if (!target) throw new HttpError(404, "Professionista non trovato.");
        await tx.professionalProfile.update({ where: { userId: id }, data: { enabled } });
        if (!enabled) await tx.session.deleteMany({ where: { userId: id } });
      });
      return Response.json({ redirect: "/admin/professionisti" });
    }
    if (action === "invite-professional") {
      const target = await db().user.findFirst({ where: { id: idSchema.parse(values.userId), role: "PROFESSIONAL" } });
      if (!target) throw new HttpError(404, "Professionista non trovato.");
      await rateLimit(`invite:${target.id}`, 3, 3600); await sendToken(target.email, "invite");
      return Response.json({ message: "Invito inviato." });
    }
    throw new HttpError(404, "Operazione non disponibile.");
  } catch (error) { return errorResponse(error); }
}

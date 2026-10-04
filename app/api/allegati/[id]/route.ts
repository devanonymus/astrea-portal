import { sessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ticketScope } from "@/lib/tickets";
import { download } from "@/lib/storage";
import { HttpError, errorResponse } from "@/lib/http";
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await sessionUser(); if (!user) throw new HttpError(401, "Accesso richiesto.");
    const { id } = await context.params;
    const attachment = await db().ticketAttachment.findFirst({ where: { id, ticket: ticketScope(user), ...(user.role === "USER" ? { OR: [{ messageId: null }, { message: { internalOnly: false } }] } : {}) } });
    if (!attachment) throw new HttpError(404, "Documento non trovato.");
    return new Response(null, { status: 302, headers: { Location: await download(attachment.storageKey, attachment.originalName), "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" } });
  } catch (e) { return errorResponse(e); }
}

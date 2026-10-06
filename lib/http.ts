import "server-only";
import { z } from "zod";
import { db } from "./db";
import { appOrigin, digest } from "./auth";
export class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== appOrigin()) throw new HttpError(403, "Richiesta non consentita.");
}
export async function readForm(request: Request, limit = 32768) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data") && !contentType.startsWith("application/x-www-form-urlencoded")) throw new HttpError(415, "Formato della richiesta non supportato.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Richiesta vuota.");
  const parts: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > limit) { await reader.cancel(); throw new HttpError(413, "Richiesta troppo grande."); }
    parts.push(value);
  }
  const body = Buffer.concat(parts);
  try { return await new Request(request.url, { method: "POST", headers: { "content-type": contentType }, body }).formData(); }
  catch { throw new HttpError(400, "Modulo non valido."); }
}
export async function rateLimit(key: string, max = 10, seconds = 900) {
  const hashed = digest(key);
  const rows = await db().$queryRaw<{ count: number }[]>`
    INSERT INTO "SecurityRateLimit" ("key", "count", "expires") VALUES (${hashed}, 1, NOW() + ${seconds} * INTERVAL '1 second')
    ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "SecurityRateLimit"."expires" < NOW() THEN 1 ELSE "SecurityRateLimit"."count" + 1 END,
    "expires" = CASE WHEN "SecurityRateLimit"."expires" < NOW() THEN NOW() + ${seconds} * INTERVAL '1 second' ELSE "SecurityRateLimit"."expires" END RETURNING "count"`;
  if (rows[0].count > max) throw new HttpError(429, "Troppi tentativi. Riprova più tardi.");
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError) return Response.json({ error: error.issues[0]?.message || "Controlla i campi inseriti." }, { status: 400 });
  // Never return driver errors, connection strings or provider responses.
  return Response.json({ error: "Operazione non riuscita. Riprova più tardi." }, { status: 503 });
}

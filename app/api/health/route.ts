import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  try { await db().$queryRaw`SELECT "key" FROM "SecurityRateLimit" LIMIT 0`; return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ status: "unavailable" }, { status: 503 }); }
}

import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";
import { allowedActor, type Actor } from "./policy";

export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const secretToken = () => randomBytes(32).toString("base64url");
export const cookieName = process.env.NODE_ENV === "production" ? "__Host-astrea-session" : "astrea-session";
export const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
const oauthPrefix = process.env.NODE_ENV === "production" ? "__Host-astrea-oauth-" : "astrea-oauth-";
export const oauthCookies = { state: `${oauthPrefix}state`, verifier: `${oauthPrefix}verifier`, nonce: `${oauthPrefix}nonce`, link: `${oauthPrefix}link` };
export const area = (role: Actor["role"]) => role === "ADMIN" ? "/admin" : role === "PROFESSIONAL" ? "/professionista" : "/area-riservata";
export async function sessionUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
  const session = await db().session.findUnique({ where: { sessionToken: digest(token) }, include: { user: { include: { professionalProfile: true } } } });
  if (!session || session.expires <= new Date() || !allowedActor(session.user)) return null;
  return session.user;
}
export async function requireUser(role?: Actor["role"]) {
  const user = await sessionUser();
  if (!user) redirect("/accedi");
  if (role && user.role !== role) redirect(area(user.role));
  return user;
}
export async function createSession(userId: string) {
  const token = secretToken();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  await db().session.create({ data: { userId, sessionToken: digest(token), expires } });
  (await cookies()).set(cookieName, token, { ...cookieOptions, expires });
}
export async function deleteSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await db().session.deleteMany({ where: { sessionToken: digest(token) } });
  jar.set(cookieName, "", { ...cookieOptions, maxAge: 0 });
}
export function appOrigin() {
  const url = new URL(process.env.APP_URL || "http://localhost:3000");
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") throw new Error("APP_URL richiede HTTPS in produzione.");
  return url.origin;
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { googleIdentity } from "@/lib/google";
import { db } from "@/lib/db";
import { appOrigin, area, cookieOptions, createSession, deleteSession, oauthCookies, sessionUser } from "@/lib/auth";
import { allowedActor } from "@/lib/policy";
export async function GET(request: Request) {
  const jar = await cookies();
  const state = jar.get(oauthCookies.state)?.value;
  const verifier = jar.get(oauthCookies.verifier)?.value;
  const nonce = jar.get(oauthCookies.nonce)?.value;
  const linkUserId = jar.get(oauthCookies.link)?.value;
  jar.set(oauthCookies.state, "", { ...cookieOptions, maxAge: 0 });
  jar.set(oauthCookies.verifier, "", { ...cookieOptions, maxAge: 0 });
  jar.set(oauthCookies.nonce, "", { ...cookieOptions, maxAge: 0 });
  jar.set(oauthCookies.link, "", { ...cookieOptions, maxAge: 0 });
  try {
    const url = new URL(request.url); const code = url.searchParams.get("code");
    if (!state || !verifier || !nonce || !code || url.searchParams.get("state") !== state) throw new Error("OAuth non valido.");
    const profile = z.object({ sub: z.string().min(1), email: z.email().transform(v => v.toLowerCase()), email_verified: z.literal(true), given_name: z.string().max(100).optional(), family_name: z.string().max(100).optional() }).parse(await googleIdentity(code, verifier, nonce));
    const account = await db().oAuthAccount.findUnique({ where: { provider_providerAccountId: { provider: "google", providerAccountId: profile.sub } }, include: { user: { include: { professionalProfile: true } } } });
    if (linkUserId) {
      const current = await sessionUser();
      if (!current || current.id !== linkUserId || current.email !== profile.email || (account && account.userId !== current.id)) throw new Error("Collegamento non consentito.");
      if (!account) await db().oAuthAccount.create({ data: { userId: current.id, provider: "google", providerAccountId: profile.sub } });
      return NextResponse.redirect(`${appOrigin()}${area(current.role)}`);
    }
    let user = account?.user;
    if (!user) {
      // Do not silently link a password account just because Google returns the same email.
      if (await db().user.findUnique({ where: { email: profile.email } })) return NextResponse.redirect(`${appOrigin()}/accedi?errore=account-esistente`);
      user = await db().user.create({ data: { email: profile.email, emailVerified: new Date(), firstName: profile.given_name, lastName: profile.family_name, oauthAccounts: { create: { provider: "google", providerAccountId: profile.sub } } }, include: { professionalProfile: true } });
    }
    if (!allowedActor(user)) throw new Error("Account non abilitato.");
    await deleteSession(); await createSession(user.id);
    return NextResponse.redirect(`${appOrigin()}${user.role === "USER" && !user.accountType ? "/completa-profilo" : area(user.role)}`);
  } catch { return NextResponse.redirect(`${appOrigin()}/accedi?errore=accesso-google`); }
}

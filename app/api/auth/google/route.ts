import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieOptions, appOrigin, secretToken, oauthCookies } from "@/lib/auth";
import { googleAuthorization, googleConfigured } from "@/lib/google";
export async function GET() {
  if (!googleConfigured()) return NextResponse.redirect(`${appOrigin()}/accedi?errore=google-non-disponibile`);
  const state = secretToken(); const verifier = secretToken(); const nonce = secretToken();
  const jar = await cookies();
  jar.set(oauthCookies.state, state, { ...cookieOptions, maxAge: 600 });
  jar.set(oauthCookies.verifier, verifier, { ...cookieOptions, maxAge: 600 });
  jar.set(oauthCookies.nonce, nonce, { ...cookieOptions, maxAge: 600 });
  return NextResponse.redirect(googleAuthorization(state, verifier, nonce));
}

import "server-only";
import { createHash } from "node:crypto";
import { createRemoteJWKSet } from "jose";
import { verifyGoogleToken } from "./google-token";
import { appOrigin } from "./auth";
export function googleConfigured() { return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET); }
const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
const callback = () => `${appOrigin()}/api/auth/google/callback`;
export function googleAuthorization(state: string, verifier: string, nonce: string) {
  if (!googleConfigured()) throw new Error("Google non configurato.");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: callback(), response_type: "code", scope: "openid email profile", state, nonce, code_challenge_method: "S256", code_challenge: createHash("sha256").update(verifier).digest("base64url") }).toString();
  return url;
}
export async function googleIdentity(code: string, verifier: string, nonce: string) {
  if (!googleConfigured()) throw new Error("Google non configurato.");
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: callback(), grant_type: "authorization_code", code, code_verifier: verifier }), signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("Accesso Google non riuscito.");
  const tokens = await response.json(); if (typeof tokens.id_token !== "string") throw new Error("Identità non verificata.");
  return verifyGoogleToken(tokens.id_token, jwks, process.env.GOOGLE_CLIENT_ID!, nonce);
}

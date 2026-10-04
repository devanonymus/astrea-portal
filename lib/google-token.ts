import { jwtVerify, type JWTVerifyGetKey } from "jose";
export async function verifyGoogleToken(token: string, getKey: JWTVerifyGetKey, audience: string, nonce: string) {
  const { payload } = await jwtVerify(token, getKey, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience, algorithms: ["RS256"], requiredClaims: ["exp", "iat", "sub", "nonce"] });
  if (payload.nonce !== nonce || (payload.azp && payload.azp !== audience) || (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== audience)) throw new Error("Identità non verificata.");
  return payload;
}

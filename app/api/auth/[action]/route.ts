import { cookies } from "next/headers";
import { hash, verify } from "@node-rs/argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { area, cookieName, cookieOptions, createSession, deleteSession, digest, sessionUser, oauthCookies } from "@/lib/auth";
import { googleConfigured } from "@/lib/google";
import { sameOrigin, readForm, rateLimit, HttpError, errorResponse } from "@/lib/http";
import { emailSchema, passwordSchema, registerSchema, profileSchema, completeProfileSchema } from "@/lib/validation";
import { mailConfigured, sendToken } from "@/lib/mail";
import { allowedActor } from "@/lib/policy";

export const runtime = "nodejs";
const hashOptions = { memoryCost: 19456, timeCost: 2, parallelism: 1 };
let dummy: Promise<string> | undefined;
export async function POST(request: Request, context: { params: Promise<{ action: string }> }) {
  try {
    sameOrigin(request);
    const { action } = await context.params;
    const form = await readForm(request);
    const values = Object.fromEntries(form);
    if (["login", "register", "forgot", "reset", "verify"].includes(action)) {
      await rateLimit(`auth-global:${action}`, 500, 60);
      const identity = typeof values.email === "string" ? values.email.toLowerCase().slice(0,254) : typeof values.token === "string" ? values.token : "unknown";
      await rateLimit(`auth:${action}:${identity}`, action === "login" ? 10 : 5);
    }
    if (action === "register") {
      const v = registerSchema.parse(values);
      const passwordHash = await hash(v.password, hashOptions);
      let user;
      try {
        user = await db().user.create({ data: {
          email: v.email, passwordHash, firstName: v.firstName, lastName: v.lastName, phone: v.phone || null,
          accountType: v.accountType, privacyAcceptedAt: new Date(), termsAcceptedAt: new Date(),
          ...(v.accountType === "BUSINESS" ? { businessProfile: { create: { companyName: v.companyName, vatNumber: v.vatNumber, contactFirstName: v.firstName, contactLastName: v.lastName } } } : { citizenProfile: { create: {} } }),
        } });
      } catch { throw new HttpError(400, "Registrazione non riuscita. Verifica i dati o accedi al tuo account."); }
      if (mailConfigured()) await sendToken(user.email, "verify").catch(() => undefined);
      await deleteSession(); await createSession(user.id);
      return Response.json({ redirect: "/area-riservata" });
    }
    if (action === "login") {
      const v = z.object({ email: emailSchema, password: z.string().min(1).max(128) }).parse(values);
      const user = await db().user.findUnique({ where: { email: v.email }, include: { professionalProfile: true } });
      dummy ||= hash("invalid-credentials-dummy-password", hashOptions);
      const valid = await verify(user?.passwordHash || await dummy, v.password).catch(() => false);
      if (!user || !valid || !allowedActor(user)) throw new HttpError(401, "Email o password non corrette, oppure account non abilitato.");
      await deleteSession(); await createSession(user.id);
      return Response.json({ redirect: area(user.role) });
    }
    if (action === "logout") { await deleteSession(); return Response.json({ redirect: "/accedi" }); }
    if (action === "forgot") {
      if (!mailConfigured()) throw new HttpError(503, "Il recupero password non è ancora disponibile. Contatta ASTREA.");
      const email = emailSchema.parse(values.email);
      const user = await db().user.findUnique({ where: { email } });
      if (user?.active) await sendToken(email, "reset").catch(() => undefined);
      return Response.json({ message: "Se l'indirizzo è registrato, riceverai un collegamento per reimpostare la password." });
    }
    if (action === "reset" || action === "verify") {
      const token = z.string().regex(/^[A-Za-z0-9_-]{43}$/).parse(values.token);
      const passwordHash = action === "reset" ? await hash(passwordSchema.parse(values.password), hashOptions) : undefined;
      await db().$transaction(async tx => {
        const record = await tx.verificationToken.findUnique({ where: { token: digest(token) } });
        const validPurpose = action === "verify" ? ["verify"] : ["reset", "invite"];
        if (!record || record.expires <= new Date() || !validPurpose.includes(record.identifier.split(":")[0])) throw new HttpError(400, "Collegamento scaduto o già utilizzato.");
        const removed = await tx.verificationToken.deleteMany({ where: { token: digest(token), expires: { gt: new Date() } } });
        if (removed.count !== 1) throw new HttpError(400, "Collegamento già utilizzato.");
        const email = record.identifier.slice(record.identifier.indexOf(":") + 1);
        const user = await tx.user.update({ where: { email }, data: action === "verify" ? { emailVerified: new Date() } : { passwordHash, ...(record.identifier.startsWith("invite:") ? { emailVerified: new Date() } : {}) } });
        if (action === "reset") {
          await tx.session.deleteMany({ where: { userId: user.id } });
          await tx.verificationToken.deleteMany({ where: { identifier: { in: [`reset:${email}`, `invite:${email}`] } } });
        }
      });
      if (action === "reset") (await cookies()).set(cookieName, "", { ...cookieOptions, maxAge: 0 });
      return Response.json({ message: action === "reset" ? "Password aggiornata. Ora puoi accedere." : "Email verificata.", redirect: "/accedi" });
    }
    const user = await sessionUser();
    if (!user) throw new HttpError(401, "Accedi per continuare.");
    if (action === "link-google") {
      if (!googleConfigured()) throw new HttpError(503, "Google non disponibile.");
      (await cookies()).set(oauthCookies.link, user.id, { ...cookieOptions, maxAge: 600 });
      return Response.json({ redirect: "/api/auth/google", external: true });
    }
    if (action === "resend-verification") {
      await rateLimit(`verify-send:${user.id}`, 3, 3600);
      if (!mailConfigured()) throw new HttpError(503, "Invio email non ancora disponibile.");
      if (!user.emailVerified) await sendToken(user.email, "verify");
      return Response.json({ message: "Controlla la tua casella email." });
    }
    if (action === "profile") {
      const v = profileSchema.parse(values);
      await db().user.update({ where: { id: user.id }, data: { ...v, ...(user.accountType === "BUSINESS" ? { businessProfile: { update: { contactFirstName: v.firstName, contactLastName: v.lastName } } } : {}) } });
      return Response.json({ message: "Profilo aggiornato." });
    }
    if (action === "complete-profile") {
      if (user.role !== "USER" || user.accountType) throw new HttpError(403, "Operazione non consentita.");
      const v = completeProfileSchema.parse(values);
      await db().user.update({ where: { id: user.id, accountType: null }, data: { firstName: v.firstName, lastName: v.lastName, phone: v.phone, accountType: v.accountType, privacyAcceptedAt: new Date(), termsAcceptedAt: new Date(), ...(v.accountType === "BUSINESS" ? { businessProfile: { create: { companyName: v.companyName, vatNumber: v.vatNumber, contactFirstName: v.firstName, contactLastName: v.lastName } } } : { citizenProfile: { create: {} } }) } });
      return Response.json({ redirect: "/area-riservata" });
    }
    throw new HttpError(404, "Operazione non disponibile.");
  } catch (error) { return errorResponse(error); }
}

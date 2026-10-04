import "server-only";
import nodemailer from "nodemailer";
import { db } from "./db";
import { appOrigin, digest, secretToken } from "./auth";
export function mailConfigured() { return !!(process.env.SMTP_HOST && process.env.SMTP_FROM); }
export async function sendToken(email: string, purpose: "reset" | "verify" | "invite") {
  if (!mailConfigured()) throw new Error("Invio email non configurato.");
  const token = secretToken(); const identifier = `${purpose}:${email}`;
  await db().verificationToken.create({ data: { identifier, token: digest(token), expires: new Date(Date.now() + 60 * 60 * 1000) } });
  const path = purpose === "verify" ? "/verifica-email" : "/reimposta-password";
  const link = `${appOrigin()}${path}?token=${token}&purpose=${purpose}`;
  const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_PORT === "465", requireTLS: process.env.SMTP_PORT !== "465" && !["localhost", "127.0.0.1"].includes(process.env.SMTP_HOST || ""), auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined, connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000 });
  try { await transport.sendMail({ from: process.env.SMTP_FROM, to: email, subject: purpose === "verify" ? "Verifica la tua email · ASTREA" : "Imposta la tua password · ASTREA", text: `Apri questo collegamento entro un'ora:\n${link}\n\nSe non hai richiesto questa operazione, ignora questa email.` }); }
  catch { await db().verificationToken.deleteMany({ where: { token: digest(token) } }); throw new Error("Invio email non riuscito."); }
}

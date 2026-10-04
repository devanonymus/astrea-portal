import { z } from "zod";
export const emailSchema = z.email().max(254).transform(v => v.toLowerCase().trim());
export const passwordSchema = z.string().min(12, "La password deve avere almeno 12 caratteri.").max(128);
const name = z.string().trim().min(1).max(100);
const registrationBase = z.object({ accountType: z.enum(["CITIZEN", "BUSINESS"]), firstName: name, lastName: name, email: emailSchema, password: passwordSchema, phone: z.string().trim().max(30).default(""), privacy: z.literal("on"), terms: z.literal("on"), companyName: z.string().trim().max(200).default(""), vatNumber: z.string().trim().default("") });
export const registerSchema = registrationBase.superRefine((v,c) => {
  if (v.accountType === "BUSINESS" && (!v.companyName || !/^\d{11}$/.test(v.vatNumber))) c.addIssue({ code: "custom", message: "Inserisci ragione sociale e Partita IVA italiana di 11 cifre." });
});
export const completeProfileSchema = registrationBase.omit({ password: true, email: true }).superRefine((v,c) => {
  if (v.accountType === "BUSINESS" && (!v.companyName || !/^\d{11}$/.test(v.vatNumber))) c.addIssue({ code: "custom", message: "Inserisci ragione sociale e Partita IVA italiana di 11 cifre." });
});
export const profileSchema = z.object({ firstName: name, lastName: name, phone: z.string().trim().max(30) });

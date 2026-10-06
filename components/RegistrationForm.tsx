"use client";
import { useState } from "react";
import Link from "next/link";
import PortalForm from "./PortalForm";
import { Field } from "./Fields";
export default function RegistrationForm({ business = false, complete = false, firstName = "", lastName = "" }: { business?: boolean; complete?: boolean; firstName?: string; lastName?: string }) {
  const [type, setType] = useState(business ? "BUSINESS" : "CITIZEN");
  return <PortalForm endpoint={`/api/auth/${complete ? "complete-profile" : "register"}`} submit={complete ? "Completa il profilo" : "Crea account"}>
    <label className="field"><span>Tipo di account</span><select name="accountType" value={type} onChange={e=>setType(e.target.value)}><option value="CITIZEN">Cittadino</option><option value="BUSINESS">Impresa</option></select></label>
    {type === "BUSINESS" && <><Field name="companyName" label="Ragione sociale" /><Field name="vatNumber" label="Partita IVA (11 cifre)" minLength={11} maxLength={11} /></>}
    <div className="grid gap-5 sm:grid-cols-2"><Field name="firstName" label={type === "BUSINESS" ? "Nome referente" : "Nome"} value={firstName} maxLength={100} autoComplete="given-name" /><Field name="lastName" label={type === "BUSINESS" ? "Cognome referente" : "Cognome"} value={lastName} maxLength={100} autoComplete="family-name" /></div>
    {!complete && <><Field name="email" label="Email" type="email" maxLength={254} autoComplete="email" /><Field name="password" label="Password (almeno 12 caratteri)" type="password" minLength={12} maxLength={128} autoComplete="new-password" /></>}
    <Field name="phone" label="Telefono" type="tel" required={false} maxLength={30} autoComplete="tel" />
    <label className="flex items-start gap-3"><input type="checkbox" name="privacy" required className="mt-1" /><span>Ho letto l&apos;<Link href="/privacy" className="underline">informativa privacy</Link>.</span></label>
    <label className="flex items-start gap-3"><input type="checkbox" name="terms" required className="mt-1" /><span>Accetto i <Link href="/termini" className="underline">termini dello Sportello</Link>.</span></label>
  </PortalForm>;
}

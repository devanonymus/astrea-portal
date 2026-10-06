/* eslint-disable @next/next/no-html-link-for-pages -- OAuth must start with a full navigation, never prefetch. */
import Link from "next/link";
import { redirect } from "next/navigation";
import PageFrame from "@/components/PageFrame";
import PortalForm from "@/components/PortalForm";
import { Field } from "@/components/Fields";
import { sessionUser, area } from "@/lib/auth";
import { googleConfigured } from "@/lib/google";
export const metadata = { title: "Accedi", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const user = await sessionUser(); if (user) redirect(user.role === "USER" && !user.accountType ? "/completa-profilo" : area(user.role));
  const { errore } = await searchParams;
  return <PageFrame title="Accedi" description="Segui le tue pratiche e le comunicazioni con ASTREA."><div className="panel max-w-xl">
    {errore && <p role="alert" className="mb-5">{errore === "account-esistente" ? "Questo indirizzo ha già un account. Accedi con email e password." : "Accesso Google non riuscito o non disponibile. Riprova con email e password."}</p>}
    <PortalForm endpoint="/api/auth/login" submit="Accedi"><Field name="email" label="Email" type="email" autoComplete="username" maxLength={254} /><Field name="password" label="Password" type="password" autoComplete="current-password" maxLength={128} /></PortalForm>
    {googleConfigured() && <a href="/api/auth/google" className="button button-secondary mt-5">Accedi con Google</a>}
    <div className="mt-8 flex flex-wrap gap-5 text-sm underline"><Link href="/recupera-password">Password dimenticata?</Link><Link href="/registrazione">Crea un account</Link></div>
  </div></PageFrame>;
}

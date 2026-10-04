import Link from "next/link";
import PageFrame from "./PageFrame";
import { requireUser, area } from "@/lib/auth";
import { db } from "@/lib/db";
import { ticketScope } from "@/lib/tickets";
import type { Actor } from "@/lib/policy";
import { statuses, date } from "@/lib/labels";
import { googleConfigured } from "@/lib/google";
import PortalForm from "./PortalForm";
export default async function Dashboard({ role }: { role: Actor["role"] }) {
  const user = await requireUser(role); const where = ticketScope(user); const base = area(role);
  const [groups, recent] = await Promise.all([db().ticket.groupBy({ by: ["status"], where, _count: true }), db().ticket.findMany({ where, orderBy: { updatedAt: "desc" }, take: 5, select: { id: true, code: true, subject: true, status: true, updatedAt: true } })]);
  return <PageFrame title={role === "ADMIN" ? "Coordinamento ASTREA" : role === "PROFESSIONAL" ? "Le pratiche assegnate" : "La tua area personale"} description={role === "ADMIN" ? "Valuta le richieste, coordina le competenze e segui ogni pratica." : role === "PROFESSIONAL" ? "Consulta le richieste che ASTREA ha affidato a te." : "Un percorso chiaro, dall'invio della richiesta alla sua chiusura."}>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(statuses).map(([key,label])=><div key={key} className="panel"><p>{label}</p><p className="mt-3 font-serif text-4xl text-astrea-green">{groups.find(g=>g.status === key)?._count || 0}</p></div>)}</div>
    {googleConfigured() && <section className="panel mt-8"><h2 className="font-serif text-2xl">Accesso con Google</h2><p className="my-4">Puoi collegare il tuo account Google usando lo stesso indirizzo email con cui sei registrato.</p><PortalForm endpoint="/api/auth/link-google" submit="Collega Google"><span className="text-sm">Il ruolo e le autorizzazioni del tuo account restano quelli definiti da ASTREA.</span></PortalForm></section>}
    <div className="mt-10 flex flex-wrap gap-4"><Link className="button" href={`${base}/pratiche`}>Tutte le pratiche</Link>{role === "USER" && <Link className="button button-secondary" href={`${base}/pratiche/nuova`}>Nuova pratica</Link>}</div>
    <h2 className="mt-12 font-serif text-3xl text-astrea-navy">Ultimi aggiornamenti</h2><div className="mt-5 space-y-3">{recent.length ? recent.map(t=><Link key={t.id} href={`${base}/pratiche/${t.id}`} className="panel block hover:border-astrea-green"><p className="text-sm">{t.code} · {statuses[t.status]}</p><h3 className="mt-2 text-lg font-semibold">{t.subject}</h3><p className="mt-2 text-sm">{date(t.updatedAt)}</p></Link>) : <p className="panel">Non ci sono ancora pratiche.</p>}</div>
  </PageFrame>;
}

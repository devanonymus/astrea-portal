import Link from "next/link";
import PageFrame from "./PageFrame";
import { Select, Field } from "./Fields";
import { requireUser, area } from "@/lib/auth";
import { db } from "@/lib/db";
import { ticketScope } from "@/lib/tickets";
import type { Actor } from "@/lib/policy";
import { categories, statuses, priorities, date } from "@/lib/labels";
import type { Prisma } from "@/generated/prisma/client";
type Query = Record<string, string | string[] | undefined>;
export default async function TicketList({ role, query }: { role: Actor["role"]; query: Query }) {
  const user = await requireUser(role); const base = area(role);
  const str = (key: string) => typeof query[key] === "string" ? (query[key] as string).slice(0,200) : "";
  const page = Math.max(1, Math.min(10000, parseInt(str("page")) || 1));
  const filters: Prisma.TicketWhereInput = { ...ticketScope(user) };
  const status = str("status"); if (status in statuses) filters.status = status as keyof typeof statuses;
  const category = str("category"); if (category in categories) filters.category = category as keyof typeof categories;
  if (role === "ADMIN") {
    const priority = str("priority"); if (priority in priorities) filters.priority = priority as keyof typeof priorities;
    if (str("requester")) filters.requester = { email: { contains: str("requester"), mode: "insensitive" } };
    if (str("professional")) filters.assignedProfessional = { email: { contains: str("professional"), mode: "insensitive" } };
  }
  const [tickets,total] = await Promise.all([db().ticket.findMany({ where: filters, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page-1)*20, take: 20, select: { id: true, code: true, subject: true, category: true, status: true, priority: true, createdAt: true } }), db().ticket.count({ where: filters })]);
  const pageLink = (n: number) => { const search = new URLSearchParams(); for (const k of ["status","category","priority","requester","professional"]) if (str(k)) search.set(k,str(k)); search.set("page",String(n)); return `${base}/pratiche?${search}`; };
  return <PageFrame title="Pratiche" parent={{ href: base, label: "Dashboard" }}><form method="get" className="panel portal-form mb-8"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><Select name="status" label="Stato" options={statuses} value={status} empty="Tutti gli stati" /><Select name="category" label="Categoria" options={categories} value={category} empty="Tutte le categorie" />{role === "ADMIN" && <><Select name="priority" label="Priorità" options={priorities} value={str("priority")} empty="Tutte le priorità" /><Field name="requester" label="Email richiedente" required={false} value={str("requester")} /><Field name="professional" label="Email professionista" required={false} value={str("professional")} /></>}</div><button className="button">Filtra</button><Link href={`${base}/pratiche`} className="ml-5 underline">Azzera filtri</Link></form>
    <p className="mb-5">{total} pratiche · pagina {page}</p><div className="space-y-4">{tickets.map(t=><Link href={`${base}/pratiche/${t.id}`} key={t.id} className="panel block hover:border-astrea-green"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm">{t.code} · {categories[t.category]}</p><h2 className="mt-3 font-serif text-2xl text-astrea-navy">{t.subject}</h2></div><span className="badge">{statuses[t.status]}</span></div><p className="mt-4 text-sm">{date(t.createdAt)}{role === "ADMIN" ? ` · Priorità ${priorities[t.priority]}` : ""}</p></Link>)}{!tickets.length && <p className="panel">Nessuna pratica corrisponde ai filtri.</p>}</div>
    <nav aria-label="Paginazione" className="mt-8 flex gap-5">{page > 1 && <Link href={pageLink(page-1)} className="underline">Pagina precedente</Link>}{page*20 < total && <Link href={pageLink(page+1)} className="underline">Pagina successiva</Link>}</nav>
  </PageFrame>;
}

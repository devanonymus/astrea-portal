import Link from "next/link";
import PageFrame from "@/components/PageFrame";
import { Field, Select } from "@/components/Fields";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { date } from "@/lib/labels";
import type { Prisma } from "@/generated/prisma/client";
export const metadata = { title: "Cittadini e imprese" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; page?: string }> }) {
  await requireUser("ADMIN"); const query = await searchParams;
  const q = typeof query.q === "string" ? query.q.slice(0,200) : ""; const type = ["CITIZEN","BUSINESS"].includes(query.type || "") ? query.type : "";
  const page = Math.max(1,Math.min(10000,parseInt(query.page || "") || 1));
  const where: Prisma.UserWhereInput = { role: "USER", ...(type ? { accountType: type as "CITIZEN" | "BUSINESS" } : {}), ...(q ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { businessProfile: { companyName: { contains: q, mode: "insensitive" } } }] } : {}) };
  const [users,total] = await Promise.all([db().user.findMany({ where, select: { id: true, firstName: true, lastName: true, email: true, accountType: true, createdAt: true, businessProfile: { select: { companyName: true, vatNumber: true } }, _count: { select: { requestedTickets: true } } }, orderBy: { createdAt: "desc" }, take: 20, skip: (page-1)*20 }),db().user.count({ where })]);
  const link = (n:number)=>`/admin/utenti?${new URLSearchParams({q,type:type || "",page:String(n)})}`;
  return <PageFrame title="Cittadini e imprese" description="Anagrafica degli utenti registrati allo Sportello."><form className="panel portal-form mb-6"><div className="grid gap-5 sm:grid-cols-2"><Field name="q" label="Email o ragione sociale" value={q} required={false} /><Select name="type" label="Tipo" options={{ CITIZEN: "Cittadino", BUSINESS: "Impresa" }} value={type} empty="Tutti" /></div><button className="button">Cerca</button></form><p className="mb-5">{total} utenti</p><div className="grid gap-5 md:grid-cols-2">{users.map(u=><article className="panel" key={u.id}><h2 className="font-serif text-2xl">{u.businessProfile?.companyName || `${u.firstName || ""} ${u.lastName || ""}`}</h2><p className="mt-3">{u.email}</p><p className="mt-2">{u.accountType === "BUSINESS" ? `Impresa · P. IVA ${u.businessProfile?.vatNumber}` : "Cittadino"}</p><p className="mt-2 text-sm">Registrato il {date(u.createdAt)}</p><Link className="mt-4 inline-block underline" href={`/admin/pratiche?requester=${encodeURIComponent(u.email)}`}>{u._count.requestedTickets} pratiche</Link></article>)}</div><nav className="mt-8 flex gap-5" aria-label="Paginazione">{page>1 && <Link href={link(page-1)}>Precedenti</Link>}{page*20<total && <Link href={link(page+1)}>Successivi</Link>}</nav></PageFrame>;
}

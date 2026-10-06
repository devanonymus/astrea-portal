import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, area } from "@/lib/auth";
import type { Actor } from "@/lib/policy";
import PortalForm from "./PortalForm";
export default async function PrivateLayout({ role, children }: { role: Actor["role"]; children: React.ReactNode }) {
  const user = await requireUser(role);
  if (role === "USER" && !user.accountType) redirect("/completa-profilo");
  const base = area(role);
  return <><div className="border-b border-astrea-line bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-5"><nav aria-label="Area riservata" className="flex flex-wrap gap-5 text-sm font-semibold"><Link href={base}>Dashboard</Link><Link href={`${base}/pratiche`}>Pratiche</Link>{role === "USER" && <><Link href={`${base}/pratiche/nuova`}>Nuova pratica</Link><Link href={`${base}/profilo`}>Profilo</Link></>}{role === "ADMIN" && <><Link href="/admin/professionisti">Professionisti</Link><Link href="/admin/utenti">Utenti</Link></>}</nav><PortalForm endpoint="/api/auth/logout" submit="Esci"><span className="text-sm">{user.firstName || user.email}</span></PortalForm></div></div>{children}</>;
}

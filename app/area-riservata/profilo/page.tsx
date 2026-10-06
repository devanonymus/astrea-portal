import PageFrame from "@/components/PageFrame";
import PortalForm from "@/components/PortalForm";
import { Field } from "@/components/Fields";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
export const metadata = { title: "Il tuo profilo" };
export default async function Page() {
  const user = await requireUser("USER"); const business = await db().businessProfile.findUnique({ where: { userId: user.id } });
  return <PageFrame title="Il tuo profilo"><div className="panel max-w-2xl"><p className="mb-5">{user.email} · {user.accountType === "BUSINESS" ? "Impresa" : "Cittadino"}</p>{business && <p className="mb-5">{business.companyName} · P. IVA {business.vatNumber}</p>}<PortalForm endpoint="/api/auth/profile" submit="Aggiorna profilo"><Field name="firstName" label="Nome" value={user.firstName} maxLength={100} /><Field name="lastName" label="Cognome" value={user.lastName} maxLength={100} /><Field name="phone" label="Telefono" type="tel" value={user.phone} required={false} maxLength={30} /></PortalForm><p className="mt-8">Email {user.emailVerified ? "verificata" : "non ancora verificata"}.</p>{!user.emailVerified && <div className="mt-4"><PortalForm endpoint="/api/auth/resend-verification" submit="Invia email di verifica"><span className="text-sm">Conferma il tuo indirizzo.</span></PortalForm></div>}</div></PageFrame>;
}

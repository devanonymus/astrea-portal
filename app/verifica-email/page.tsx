import PageFrame from "@/components/PageFrame";
import PortalForm from "@/components/PortalForm";
export const metadata = { title: "Verifica email", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <PageFrame title="Verifica il tuo indirizzo email"><div className="panel max-w-xl"><p className="mb-5">Conferma per completare la verifica. Il collegamento è valido per un&apos;ora.</p><PortalForm endpoint="/api/auth/verify" submit="Conferma email"><input type="hidden" name="token" value={token || ""} /></PortalForm></div></PageFrame>; }

import PageFrame from "@/components/PageFrame";
import PortalForm from "@/components/PortalForm";
import { Field } from "@/components/Fields";
export const metadata = { title: "Imposta password", robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token } = await searchParams; return <PageFrame title="Imposta la password"><div className="panel max-w-xl"><PortalForm endpoint="/api/auth/reset" submit="Salva password"><input type="hidden" name="token" value={token || ""} /><Field name="password" label="Nuova password (almeno 12 caratteri)" type="password" minLength={12} maxLength={128} autoComplete="new-password" /></PortalForm></div></PageFrame>; }

import PageFrame from "@/components/PageFrame";
import PortalForm from "@/components/PortalForm";
import { Field } from "@/components/Fields";
export const metadata = { title: "Recupera password", robots: { index: false } };
export default function Page() { return <PageFrame title="Recupera la password" description="Ricevi un collegamento monouso per scegliere una nuova password."><div className="panel max-w-xl"><PortalForm endpoint="/api/auth/forgot" submit="Invia collegamento"><Field name="email" label="Email" type="email" maxLength={254} autoComplete="email" /></PortalForm></div></PageFrame>; }

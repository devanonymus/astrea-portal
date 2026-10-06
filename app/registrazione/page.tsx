/* eslint-disable @next/next/no-html-link-for-pages -- OAuth must start with a full navigation, never prefetch. */
import PageFrame from "@/components/PageFrame";
import RegistrationForm from "@/components/RegistrationForm";
import { googleConfigured } from "@/lib/google";
export const metadata = { title: "Registrazione", description: "Registrati come cittadino o impresa allo Sportello Tecnologico ASTREA." };
export default async function Page({ searchParams }: { searchParams: Promise<{ tipo?: string }> }) {
  const { tipo } = await searchParams;
  return <PageFrame title="Registrazione" description="Crea il tuo account cittadino o impresa. ASTREA valuterà le richieste e coordinerà gli eventuali professionisti."><div className="panel max-w-2xl"><RegistrationForm business={tipo === "impresa"} />{googleConfigured() && <a className="button button-secondary mt-6" href="/api/auth/google">Continua con Google</a>}</div></PageFrame>;
}

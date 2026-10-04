import Link from "next/link";
import PageFrame from "@/components/PageFrame";
export const metadata = { title: "Contatti", description: "Entra in contatto con ASTREA e lo Sportello Tecnologico." };
export default function Page() {
  const email = process.env.CONTACT_EMAIL;
  return <PageFrame title="Parliamo delle tue esigenze" description="ASTREA è un punto di incontro tra persone, competenze e territorio."><div className="grid gap-6 md:grid-cols-2"><section className="panel"><h2 className="font-serif text-3xl">Sportello Tecnologico</h2><p className="mt-5 leading-7">Per richieste di orientamento, esigenze tecniche o proposte, utilizza lo Sportello. Potrai seguire lo stato e tutte le comunicazioni dalla tua area personale.</p><Link href="/sportello-tecnologico" className="button mt-7">Vai allo Sportello</Link></section><section className="panel"><h2 className="font-serif text-3xl">Associazione</h2><p className="mt-5 leading-7">Per informazioni sull&apos;associazione e proposte di collaborazione:</p>{email ? <a href={`mailto:${email}`} className="mt-5 inline-block underline break-all">{email}</a> : <p className="mt-5">I recapiti istituzionali saranno pubblicati dopo la conferma di ASTREA.</p>}</section></div></PageFrame>;
}

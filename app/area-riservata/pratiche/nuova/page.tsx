import PageFrame from "@/components/PageFrame";
import PortalForm from "@/components/PortalForm";
import { Field, Select, Textarea } from "@/components/Fields";
import { categories } from "@/lib/labels";
import { requireUser } from "@/lib/auth";
export const metadata = { title: "Nuova pratica" };
export default async function Page() {
  await requireUser("USER");
  return <PageFrame title="Nuova pratica" description="Descrivi la tua esigenza. ASTREA riceverà e valuterà la richiesta, decidendo l'eventuale assegnazione a un professionista." parent={{ href: "/area-riservata/pratiche", label: "Pratiche" }}><div className="panel max-w-3xl"><PortalForm endpoint="/api/portal/create-ticket" submit="Invia ad ASTREA"><Select name="category" label="Categoria" options={categories} /><Field name="subject" label="Oggetto" minLength={5} maxLength={200} /><Textarea name="description" label="Descrizione dell'esigenza" minLength={20} /><p className="text-sm">Dopo l&apos;invio puoi aggiungere documenti dalla pagina della pratica.</p></PortalForm></div></PageFrame>;
}

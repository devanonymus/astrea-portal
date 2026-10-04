import Link from "next/link";
import PageFrame from "@/components/PageFrame";
export default function NotFound() { return <PageFrame title="Pagina non trovata" description="Il contenuto richiesto non è disponibile oppure non hai accesso a questa pratica."><Link className="button" href="/">Torna alla homepage</Link></PageFrame>; }

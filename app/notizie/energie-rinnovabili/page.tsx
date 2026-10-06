import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["notizie/energie-rinnovabili"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/notizie/energie-rinnovabili" } };
export default function Page() { return <EditorialPage slug="notizie/energie-rinnovabili" />; }

import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["attivita-dei-soci"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/attivita-dei-soci" } };
export default function Page() { return <EditorialPage slug="attivita-dei-soci" />; }

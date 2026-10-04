import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["le-mie-proposte"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/le-mie-proposte" } };
export default function Page() { return <EditorialPage slug="le-mie-proposte" />; }

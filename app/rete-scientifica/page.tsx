import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["rete-scientifica"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/rete-scientifica" } };
export default function Page() { return <EditorialPage slug="rete-scientifica" />; }

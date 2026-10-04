import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["proposte-di-astrea"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/proposte-di-astrea" } };
export default function Page() { return <EditorialPage slug="proposte-di-astrea" />; }

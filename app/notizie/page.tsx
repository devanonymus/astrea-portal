import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["notizie"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/notizie" } };
export default function Page() { return <EditorialPage slug="notizie" />; }

import EditorialPage from "@/components/EditorialPage";
import { publicContent } from "@/lib/public-content";
const content = publicContent["chi-siamo"];
export const metadata = { title: content.title, description: content.description, alternates: { canonical: "/chi-siamo" } };
export default function Page() { return <EditorialPage slug="chi-siamo" />; }

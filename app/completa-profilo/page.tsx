import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageFrame from "@/components/PageFrame";
import RegistrationForm from "@/components/RegistrationForm";
export const metadata = { title: "Completa il profilo", robots: { index: false } };
export default async function Page() {
  const user = await requireUser("USER"); if (user.accountType) redirect("/area-riservata");
  return <PageFrame title="Completa il profilo" description="Scegli il tipo di account e conferma i tuoi dati per utilizzare lo Sportello."><div className="panel max-w-2xl"><RegistrationForm complete firstName={user.firstName || ""} lastName={user.lastName || ""} /></div></PageFrame>;
}

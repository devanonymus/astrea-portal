import TicketDetail from "@/components/TicketDetail";
export const metadata = { title: "Dettaglio pratica" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <TicketDetail role="PROFESSIONAL" id={(await params).id} />; }

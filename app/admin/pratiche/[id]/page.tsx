import TicketDetail from "@/components/TicketDetail";
export const metadata = { title: "Dettaglio pratica" };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <TicketDetail role="ADMIN" id={(await params).id} />; }

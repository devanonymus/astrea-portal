import TicketList from "@/components/TicketList";
export const metadata = { title: "Pratiche" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) { return <TicketList role="PROFESSIONAL" query={await searchParams} />; }

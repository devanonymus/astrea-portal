import PrivateLayout from "@/components/PrivateLayout";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) { return <PrivateLayout role="ADMIN">{children}</PrivateLayout>; }

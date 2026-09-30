import type { Metadata } from "next";
import "./globals.css";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "ASTREA | Territorio, Ricerca, Energia e Ambiente",
    template: "%s | ASTREA",
  },
  description:
    "ASTREA è l'Associazione per lo Sviluppo del Territorio, la Ricerca, l'Energia e l'Ambiente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
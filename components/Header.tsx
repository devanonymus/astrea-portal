import Link from "next/link";

const navigation = [
  { label: "Chi siamo", href: "/chi-siamo" },
  { label: "Rete scientifica", href: "/rete-scientifica" },
  { label: "Attività", href: "/attivita" },
  { label: "Notizie", href: "/notizie" },
  { label: "Contatti", href: "/contatti" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-astrea-line bg-astrea-ivory/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-astrea-green text-lg font-bold text-white">
            A
          </div>

          <div>
            <div className="font-serif text-xl font-bold tracking-[0.08em] text-astrea-navy">
              ASTREA
            </div>

            <div className="hidden text-[9px] uppercase tracking-[0.16em] text-astrea-text/70 sm:block">
              Territorio · Ricerca · Energia · Ambiente
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-astrea-navy transition hover:text-astrea-green"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/accedi"
            className="hidden text-sm font-semibold text-astrea-navy transition hover:text-astrea-green sm:block"
          >
            Accedi
          </Link>

          <Link
            href="/sportello-tecnologico"
            className="rounded-full bg-astrea-green px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-astrea-green-dark"
          >
            Sportello
          </Link>
        </div>
      </div>
    </header>
  );
}

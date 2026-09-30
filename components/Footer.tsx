import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-astrea-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <div className="font-serif text-3xl font-bold tracking-wide">
            ASTREA
          </div>

          <p className="mt-5 max-w-xl leading-7 text-white/70">
            Associazione per lo Sviluppo del Territorio, la Ricerca,
            l&apos;Energia e l&apos;Ambiente. Associazione culturale senza fini
            di lucro.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Esplora
          </h2>

          <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/chi-siamo">Chi siamo</Link>
            <Link href="/rete-scientifica">Rete scientifica</Link>
            <Link href="/attivita">Attività</Link>
            <Link href="/notizie">Notizie</Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
            Sportello
          </h2>

          <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/sportello-tecnologico">
              Apri una richiesta
            </Link>
            <Link href="/accedi">Area personale</Link>
            <Link href="/contatti">Contatti</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-white/50 md:flex-row md:justify-between lg:px-8">
          <span>© 2026 ASTREA</span>
          <span>Associazione culturale senza fini di lucro</span>
        </div>
      </div>
    </footer>
  );
}

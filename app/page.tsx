import Link from "next/link";

const sectors = [
  {
    number: "01",
    title: "Territorio e ambiente",
    description:
      "Analisi, pianificazione e iniziative per uno sviluppo territoriale sostenibile.",
  },
  {
    number: "02",
    title: "Energia",
    description:
      "Transizione energetica, efficienza, fonti rinnovabili e innovazione.",
  },
  {
    number: "03",
    title: "Ricerca",
    description:
      "Competenze scientifiche e interdisciplinari al servizio del territorio.",
  },
  {
    number: "04",
    title: "Tecnologie innovative",
    description:
      "Strumenti digitali e nuove tecnologie per cittadini, imprese e comunità.",
  },
  {
    number: "05",
    title: "Sviluppo locale",
    description:
      "Progetti, conoscenza e collaborazione per la crescita delle comunità.",
  },
  {
    number: "06",
    title: "Tutela e conservazione",
    description:
      "Valorizzazione del patrimonio ambientale, culturale e paesaggistico.",
  },
];

export default function Home() {
  return (
    <main id="contenuto">
      {/* HERO */}
      <section className="editorial-gradient grid-pattern relative overflow-hidden text-white">
        <div className="mx-auto max-w-7xl px-5 py-24 md:py-32 lg:px-8 lg:py-40">
          <div className="max-w-4xl">
            <p className="mb-7 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
              Associazione culturale · Italia
            </p>

            <h1 className="font-serif text-5xl leading-[1.04] tracking-tight sm:text-6xl lg:text-8xl">
              Conoscenza e innovazione
              <span className="block text-[#a8c9b8]">
                al servizio del territorio.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/75 md:text-xl">
              ASTREA mette in relazione ricerca, competenze professionali,
              imprese, cittadini e istituzioni per trasformare conoscenza e
              innovazione in opportunità concrete.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/sportello-tecnologico"
                className="rounded-full bg-white px-7 py-3.5 text-sm font-bold text-astrea-navy transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Accedi allo Sportello Tecnologico
              </Link>

              <Link
                href="/chi-siamo"
                className="rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Conosci ASTREA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[0.75fr_1.25fr] lg:px-8 lg:py-28">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-astrea-green">
              La nostra missione
            </p>
          </div>

          <div>
            <h2 className="max-w-4xl font-serif text-4xl leading-tight text-astrea-navy md:text-5xl">
              Un luogo di incontro tra competenze scientifiche, territorio e
              società.
            </h2>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-astrea-text">
              ASTREA è un&apos;associazione culturale senza fini di lucro che
              promuove ricerca, informazione, confronto e progettualità nei
              settori strategici per lo sviluppo del territorio.
            </p>
          </div>
        </div>
      </section>

      {/* SPORTELLO */}
      <section className="bg-astrea-ivory py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="overflow-hidden rounded-[2.5rem] bg-astrea-navy text-white shadow-soft">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12 lg:p-16">
                <span className="inline-flex rounded-full border border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  Nuovo servizio
                </span>

                <h2 className="mt-7 font-serif text-4xl leading-tight md:text-5xl">
                  Sportello Tecnologico ASTREA
                </h2>

                <p className="mt-6 max-w-xl text-lg leading-8 text-white/70">
                  Un punto di accesso digitale per mettere cittadini e imprese
                  in contatto con ASTREA e con la sua rete di competenze
                  professionali.
                </p>

                <Link
                  href="/sportello-tecnologico"
                  className="mt-9 inline-flex rounded-full bg-astrea-green px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#4d806c]"
                >
                  Apri una richiesta →
                </Link>
              </div>

              <div className="border-t border-white/10 bg-white/[0.04] p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-16">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  Come funziona
                </p>

                <div className="mt-8 space-y-8">
                  {[
                    ["01", "Invia la richiesta", "Descrivi l'esigenza dalla tua area personale."],
                    ["02", "ASTREA la valuta", "La richiesta viene esaminata e presa in carico."],
                    ["03", "Competenza dedicata", "ASTREA può assegnarla al professionista più adatto."],
                  ].map(([number, title, text]) => (
                    <div
                      key={number}
                      className="grid grid-cols-[45px_1fr] gap-4"
                    >
                      <span className="font-serif text-xl text-[#a8c9b8]">
                        {number}
                      </span>

                      <div>
                        <h3 className="font-semibold">{title}</h3>
                        <p className="mt-1 text-sm leading-6 text-white/80">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SETTORI */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-astrea-green">
              Ambiti di intervento
            </p>

            <h2 className="mt-4 font-serif text-4xl text-astrea-navy md:text-5xl">
              Competenze diverse per affrontare problemi complessi.
            </h2>
          </div>

          <div className="mt-14 grid border-l border-t border-astrea-line md:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector) => (
              <article
                key={sector.number}
                className="group min-h-64 border-b border-r border-astrea-line p-8 transition hover:bg-astrea-ivory lg:p-10"
              >
                <span className="text-xs font-bold tracking-widest text-astrea-green">
                  {sector.number}
                </span>

                <h3 className="mt-12 font-serif text-2xl text-astrea-navy">
                  {sector.title}
                </h3>

                <p className="mt-4 leading-7 text-astrea-text">
                  {sector.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* RETE */}
      <section className="bg-astrea-green py-20 text-white lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              Rete scientifica
            </p>

            <h2 className="mt-5 font-serif text-4xl leading-tight md:text-5xl">
              Una rete multidisciplinare di conoscenze e professionalità.
            </h2>
          </div>

          <div>
            <p className="max-w-xl text-lg leading-8 text-white/75">
              Professionisti, ricercatori ed esperti contribuiscono alle
              attività dell&apos;associazione mettendo competenze diverse al
              servizio di progetti, iniziative e richieste provenienti dal
              territorio.
            </p>

            <Link
              href="/rete-scientifica"
              className="mt-8 inline-flex border-b border-white pb-1 text-sm font-bold"
            >
              Esplora la rete scientifica →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-astrea-ivory">
        <div className="mx-auto max-w-7xl px-5 py-20 text-center lg:px-8 lg:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-astrea-green">
            Hai un&apos;esigenza?
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight text-astrea-navy md:text-5xl">
            Parla con ASTREA attraverso il nuovo Sportello Tecnologico.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8">
            Lo sportello è pensato per cittadini e imprese che cercano
            orientamento e competenze specialistiche.
          </p>

          <Link
            href="/sportello-tecnologico"
            className="mt-9 inline-flex rounded-full bg-astrea-navy px-8 py-4 text-sm font-bold text-white transition hover:bg-astrea-green"
          >
            Vai allo Sportello
          </Link>
        </div>
      </section>
    </main>
  );
}

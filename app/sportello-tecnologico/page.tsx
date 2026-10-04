import Link from "next/link";

export const metadata = { title: "Sportello Tecnologico", description: "Invia una richiesta ad ASTREA e segui valutazione, presa in carico e comunicazioni dalla tua area personale." };

const areas = [
  "Territorio e ambiente",
  "Energia e sostenibilità",
  "Tecnologie e innovazione",
  "Ricerca e progettazione",
  "Sviluppo locale",
  "Tutela e conservazione",
];

export default function SportelloTecnologicoPage() {
  return (
    <main id="contenuto">
      {/* HERO */}
      <section className="editorial-gradient grid-pattern text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
              ASTREA · Servizi digitali
            </p>

            <h1 className="mt-6 font-serif text-5xl leading-tight md:text-6xl lg:text-7xl">
              Sportello
              <span className="block text-[#a8c9b8]">Tecnologico.</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/75">
              Un punto di accesso unico per cittadini e imprese che hanno
              bisogno di orientamento, competenze specialistiche e supporto
              nei settori di attività di ASTREA.
            </p>
          </div>
        </div>
      </section>

      {/* SCELTA UTENTE */}
      <section className="bg-astrea-ivory py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-astrea-green">
              Inizia da qui
            </p>

            <h2 className="mt-4 font-serif text-4xl leading-tight text-astrea-navy md:text-5xl">
              Come possiamo aiutarti?
            </h2>

            <p className="mt-5 text-lg leading-8 text-astrea-text">
              Seleziona il profilo che ti rappresenta. Dopo la registrazione
              potrai inviare una richiesta e seguirne l&apos;avanzamento dalla
              tua area personale.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Link
              href="/registrazione?tipo=cittadino"
              className="group rounded-[2rem] border border-astrea-line bg-white p-8 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-astrea-green/10 text-xl font-bold text-astrea-green">
                01
              </div>

              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-astrea-green">
                Privati
              </p>

              <h3 className="mt-3 font-serif text-3xl text-astrea-navy">
                Sono un cittadino
              </h3>

              <p className="mt-5 max-w-xl leading-7 text-astrea-text">
                Invia una richiesta ad ASTREA, allega eventuali documenti e
                consulta comunicazioni, aggiornamenti e stato della pratica.
              </p>

              <div className="mt-10 flex items-center justify-between border-t border-astrea-line pt-6">
                <span className="font-semibold text-astrea-navy">
                  Accedi allo Sportello
                </span>
                <span className="text-2xl text-astrea-green transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>

            <Link
              href="/registrazione?tipo=impresa"
              className="group rounded-[2rem] bg-astrea-navy p-8 text-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-soft sm:p-10"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-xl font-bold text-[#a8c9b8]">
                02
              </div>

              <p className="mt-10 text-xs font-bold uppercase tracking-[0.2em] text-[#a8c9b8]">
                Aziende e organizzazioni
              </p>

              <h3 className="mt-3 font-serif text-3xl">
                Sono un&apos;impresa
              </h3>

              <p className="mt-5 max-w-xl leading-7 text-white/70">
                Presenta esigenze tecniche e progettuali e accedi alla rete di
                competenze coordinata da ASTREA.
              </p>

              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
                <span className="font-semibold">
                  Accedi allo Sportello
                </span>
                <span className="text-2xl text-[#a8c9b8] transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          </div>

          <div className="mt-8 text-center text-sm text-astrea-text">
            Hai già un account?{" "}
            <Link
              href="/accedi"
              className="font-bold text-astrea-green hover:underline"
            >
              Accedi alla tua area personale
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="bg-white py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-astrea-green">
                Il processo
              </p>

              <h2 className="mt-4 font-serif text-4xl leading-tight text-astrea-navy">
                Una richiesta.
                <br />
                Un percorso chiaro.
              </h2>
            </div>

            <div className="border-t border-astrea-line">
              {[
                [
                  "01",
                  "Invio",
                  "Descrivi la tua esigenza e invia la richiesta ad ASTREA.",
                ],
                [
                  "02",
                  "Valutazione",
                  "ASTREA analizza la richiesta e ne definisce l'ambito.",
                ],
                [
                  "03",
                  "Presa in carico",
                  "La pratica viene gestita direttamente o assegnata a un professionista della rete.",
                ],
                [
                  "04",
                  "Gestione",
                  "Segui stato, comunicazioni e aggiornamenti dalla tua area personale.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="grid gap-4 border-b border-astrea-line py-7 sm:grid-cols-[70px_180px_1fr]"
                >
                  <span className="font-serif text-xl text-astrea-green">
                    {number}
                  </span>
                  <h3 className="font-semibold text-astrea-navy">{title}</h3>
                  <p className="leading-7 text-astrea-text">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AMBITI */}
      <section className="bg-astrea-ivory py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-astrea-green">
                Competenze
              </p>

              <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight text-astrea-navy md:text-5xl">
                Gli ambiti dello Sportello.
              </h2>

              <p className="mt-6 max-w-xl text-lg leading-8">
                Non devi sapere in anticipo quale professionista contattare.
                ASTREA riceve la richiesta, la valuta e individua il percorso
                più appropriato.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {areas.map((area, index) => (
                <div
                  key={area}
                  className="flex min-h-28 items-end rounded-2xl border border-astrea-line bg-white p-6"
                >
                  <div>
                    <span className="text-xs font-bold text-astrea-green">
                      0{index + 1}
                    </span>
                    <h3 className="mt-2 font-serif text-xl text-astrea-navy">
                      {area}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AREA RISERVATA */}
      <section className="bg-astrea-green text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              Sei già registrato?
            </p>

            <h2 className="mt-3 font-serif text-3xl md:text-4xl">
              Consulta le tue richieste.
            </h2>
          </div>

          <Link
            href="/accedi"
            className="inline-flex self-start rounded-full bg-white px-7 py-3.5 text-sm font-bold text-astrea-navy transition hover:-translate-y-0.5 md:self-auto"
          >
            Accedi all&apos;area personale
          </Link>
        </div>
      </section>
    </main>
  );
}

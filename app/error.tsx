"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="contenuto" className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-serif text-4xl">Servizio temporaneamente non disponibile</h1><p className="my-6">Non è stato possibile completare la richiesta. Riprova tra poco.</p><button className="button" onClick={reset}>Riprova</button></main>; }

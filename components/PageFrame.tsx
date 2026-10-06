import Link from "next/link";
export default function PageFrame({ title, description, children, parent }: { title: string; description?: string; children: React.ReactNode; parent?: { href: string; label: string } }) {
  return <main id="contenuto" className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-20">
    <nav aria-label="Percorso di navigazione" className="mb-8 text-sm"><ol className="flex flex-wrap gap-2"><li><Link href="/" className="underline">Home</Link></li>{parent && <li><span aria-hidden="true"> / </span><Link href={parent.href} className="underline">{parent.label}</Link></li>}<li aria-current="page"><span aria-hidden="true"> / </span>{title}</li></ol></nav>
    <h1 className="font-serif text-4xl leading-tight text-astrea-navy md:text-6xl">{title}</h1>
    {description && <p className="mt-6 max-w-3xl text-lg leading-8">{description}</p>}
    <div className="mt-10">{children}</div>
  </main>;
}

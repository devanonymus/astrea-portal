import Link from "next/link";
import PageFrame from "./PageFrame";
import { publicContent } from "@/lib/public-content";
export default function EditorialPage({ slug }: { slug: string }) {
  const content = publicContent[slug];
  return <PageFrame title={content.title} description={content.description} parent={slug.startsWith("notizie/") ? { href: "/notizie", label: "Notizie" } : undefined}><div className="grid gap-8 lg:grid-cols-[1fr_300px]"><div className="space-y-6">{content.sections.map((s,i)=><section className="panel" key={s.title}><span className="text-sm font-semibold text-astrea-green">0{i+1}</span><h2 className="mt-4 font-serif text-3xl text-astrea-navy">{s.title}</h2><p className="mt-5 max-w-3xl text-lg leading-8">{s.text}</p></section>)}</div><aside className="self-start border-l-2 border-astrea-green pl-6"><h2 className="font-serif text-2xl text-astrea-navy">Esplora</h2><div className="mt-5 space-y-4">{content.links?.map(link=><Link href={link.href} className="block py-2 font-semibold text-astrea-green underline underline-offset-4" key={link.href}>{link.label} →</Link>)}</div></aside></div></PageFrame>;
}

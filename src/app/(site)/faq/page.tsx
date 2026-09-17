import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { getFAQ } from "@/lib/data";

export const metadata: Metadata = { title: "FAQ – Questions fréquentes", description: "Réponses aux questions fréquentes sur les admissions, les frais, les diplômes et la vie étudiante au Groupe ISI." };

export default async function FAQPage() {
  const faq = await getFAQ();
  const cats = Array.from(new Set(faq.map((f) => f.categorie)));
  const jsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.reponse } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title="Questions fréquentes" subtitle="Tout ce que vous devez savoir sur les admissions, les frais, les diplômes et la vie étudiante." items={[{ label: "FAQ" }]} />
      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-4">
          <nav className="lg:col-span-1" aria-label="Catégories FAQ">
            <ul className="scrollbar-hide flex gap-2 overflow-x-auto lg:sticky lg:top-24 lg:flex-col">
              {cats.map((c) => <li key={c}><a href={`#faq-${c.toLowerCase().replace(/\s+/g, "-")}`} className="block whitespace-nowrap rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary-50">{c}</a></li>)}
            </ul>
          </nav>
          <div className="space-y-12 lg:col-span-3">
            {cats.map((c) => (
              <div key={c} id={`faq-${c.toLowerCase().replace(/\s+/g, "-")}`} className="scroll-mt-28">
                <SectionHeading label={c} title={c} align="left" className="mb-6" />
                <Accordion items={faq.filter((f) => f.categorie === c).map((f) => ({ id: f.id, title: f.question, content: f.reponse }))} />
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section variant="surface" padding="md" className="text-center">
        <MessageCircleQuestion className="mx-auto h-12 w-12 text-secondary" />
        <h2 className="mt-4 text-2xl font-extrabold text-primary">Vous ne trouvez pas la réponse à votre question ?</h2>
        <p className="mt-2 text-muted">Notre équipe des admissions est à votre disposition du lundi au samedi.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3"><Button href="/contact" variant="secondary">Nous contacter</Button><Link href="/pre-inscription" className="inline-flex h-11 items-center rounded-full border-2 border-primary px-6 text-sm font-bold text-primary hover:bg-primary hover:text-white">Pré-inscription</Link></div>
      </Section>
    </>
  );
}

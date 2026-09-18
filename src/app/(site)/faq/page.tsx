import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Tabs } from "@/components/ui/Tabs";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { getFAQ } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Questions fréquentes sur la vie de campus, l'institut, les programmes, les clubs et organisations du Groupe ISI.",
};

export default async function FaqPage() {
  const faqs = await getFAQ();
  const categories = Array.from(new Set(faqs.map((f) => f.categorie)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.reponse },
    })),
    url: absoluteUrl("/faq"),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title="FAQ" items={[{ label: "FAQ" }]} image="/media/img-2298-1.jpg" />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container narrow>
          <Tabs
            tabs={categories.map((c) => ({
              id: c,
              label: c,
              count: faqs.filter((f) => f.categorie === c).length,
              content: <Accordion items={faqs.filter((f) => f.categorie === c).map((f) => ({ id: f.id, title: f.question, content: f.reponse }))} />,
            }))}
          />

          <div className="mt-14 rounded-lg bg-primary px-8 py-10 text-center text-white">
            <h2 className="font-heading text-[24px] font-semibold text-white lg:text-[30px]">Vous ne trouvez pas votre réponse ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-white/80">
              Notre équipe vous répond sous 48 h ouvrées, par téléphone, par email ou directement sur l&apos;un de nos campus.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="secondary" arrow>
                Nous contacter
              </Button>
              <Button href="/preinscription" variant="outline-white" arrow>
                Se préinscrire
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

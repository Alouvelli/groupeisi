import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Tabs";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { InfoRequestForm } from "@/components/forms/InfoRequestForm";
import { getProgrammes, getFAQ, getSettings, getCampus } from "@/lib/data";
import { formatFCFA } from "@/lib/utils";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "Frais d'études",
  description:
    "Grille des frais de scolarité du Groupe ISI : coût annuel, droits d'inscription et mensualité pour les licences, bachelors et masters.",
};

/** Regroupements de la grille tarifaire, repris de la page « Frais d'études ». */
const GROUPES: { id: string; label: string; slugs: string[]; titrePrefix?: string }[] = [
  {
    id: "licence-1-2",
    label: "Licence 1 & 2",
    slugs: ["licence-genie-logiciel", "licence-reseaux-informatiques", "licence-infographie-multimedia"],
    titrePrefix: "Licence 1 (ou 2) en ",
  },
  { id: "bachelor", label: "Bachelor", slugs: ["bachelor-data-science-big-data"] },
  {
    id: "licence-3",
    label: "Licence 3",
    slugs: ["licence-cybersecurite", "licence-reseaux-telecommunications"],
    titrePrefix: "Licence 3 en ",
  },
  {
    id: "master",
    label: "Master",
    slugs: ["master-genie-logiciel", "master-reseaux-systemes-informatiques", "cycle-ingenieur-techniques-informatiques"],
  },
  { id: "master-dsia", label: "Master Data Science & IA", slugs: ["master-data-science-intelligence-artificielle"] },
];

function FeeCard({ titre, annuel, inscription, mensualite }: { titre: string; annuel: number | null; inscription: number | null; mensualite: number | null }) {
  return (
    <article className="rounded-lg border border-line bg-white p-7 transition hover:shadow-card">
      <h4 className="font-heading text-[20px] font-semibold leading-[1.3] text-dark">{titre}</h4>
      <dl className="mt-5 space-y-3 text-[15px]">
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <dt className="text-body">Coût annuel :</dt>
          <dd className="font-heading text-[18px] font-semibold text-primary">{formatFCFA(annuel)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
          <dt className="text-body">Droits d&apos;inscription :</dt>
          <dd className="font-medium text-dark">{formatFCFA(inscription)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-body">Mensualité :</dt>
          <dd className="font-medium text-dark">{formatFCFA(mensualite)}</dd>
        </div>
      </dl>
    </article>
  );
}

export default async function FraisEtudesPage() {
  const [programmes, faqs, settings, campus] = await Promise.all([getProgrammes(), getFAQ(), getSettings(), getCampus()]);
  const bySlug = new Map(programmes.map((p) => [p.slug, p]));

  const tabs = GROUPES.map((g) => {
    const items = g.slugs.map((s) => bySlug.get(s)).filter(Boolean) as typeof programmes;
    return {
      id: g.id,
      label: g.label,
      content: (
        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <FeeCard
              key={p.id}
              titre={g.titrePrefix ? `${g.titrePrefix}${p.titre.replace(/^Licence (Professionnelle |professionnelle )?en /i, "")}` : p.titre}
              annuel={g.id === "licence-1-2" ? 895000 : p.fraisScolarite}
              inscription={p.fraisInscription}
              mensualite={g.id === "licence-1-2" ? 80000 : p.fraisMensualite}
            />
          ))}
        </div>
      ),
    };
  }).filter((t) => t.content.props.children.length > 0);

  return (
    <>
      <PageHeader title="Frais d'études" items={[{ label: "Frais d'études" }]} image="/media/img-2024-1.jpg" />

      <section className="bg-white section-y">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>Opportunités d&apos;études à ISI</SectionLabel>
              <AnimatedHeading className="section-title">Des frais transparents et des paiements échelonnés</AnimatedHeading>
              <p className="mt-5 text-[15px] leading-7 text-body">
                Notre institut s&apos;engage à faire progresser les connaissances grâce à une recherche innovante, interdisciplinaire et à fort impact.
                Animés par une vision d&apos;excellence académique, nous réunissons des professeurs talentueux, des chercheurs dévoués et des étudiants
                curieux afin d&apos;explorer des idées qui façonnent l&apos;avenir. Grâce à des laboratoires de pointe, des centres de recherche modernes
                et des partenariats solides avec l&apos;industrie, nous fournissons les ressources nécessaires pour transformer les théories en solutions
                concrètes.
              </p>
              <Button href="/preinscription" className="mt-8" arrow>
                Se préinscrire
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg">
              <Image src="/media/img-2024-1.jpg" alt="" width={960} height={640} className="h-auto w-full object-cover" />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface section-y">
        <Container>
          <div className="mb-10 max-w-3xl">
            <SectionLabel>Tarifs {settings.anneeAcademique}</SectionLabel>
            <AnimatedHeading className="section-title">Découvrez les frais de nos programmes d&apos;étude</AnimatedHeading>
            <p className="mt-4 text-base leading-7 text-body">
              Nous soutenons activement la recherche à tous les niveaux, des licences aux masters avancés, en garantissant des opportunités
              d&apos;apprentissage pratique, de découverte et de leadership.
            </p>
          </div>
          <Tabs tabs={tabs} align="left" />
          <p className="mt-8 text-[15px] text-body">
            Nos partenaires 3FPT et les Mairies octroient des bourses chaque année à des centaines d&apos;étudiants.
          </p>
        </Container>
      </section>

      <section className="bg-white section-y">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>FAQ</SectionLabel>
              <AnimatedHeading className="section-title mb-8">Questions fréquentes</AnimatedHeading>
              <Accordion items={faqs.slice(0, 5).map((f) => ({ id: f.id, title: f.question, content: f.reponse }))} />
            </div>
            <div>
              <SectionLabel>Se préinscrire</SectionLabel>
              <AnimatedHeading className="section-title mb-8">Demander des informations</AnimatedHeading>
              <div className="rounded-xl border border-line bg-white p-6 shadow-card sm:p-8">
                <InfoRequestForm
                  compact
                  formations={programmes.map((p) => ({ id: p.id, titre: p.titre }))}
                  campus={campus.map((c) => ({ id: c.id, nom: c.nom }))}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

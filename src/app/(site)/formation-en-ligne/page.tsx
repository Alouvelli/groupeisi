import type { Metadata } from "next";
import { ArrowUpRight, BadgeCheck, CalendarClock, Gauge, GraduationCap, Infinity as InfinityIcon, Mail, MonitorPlay, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/Section";
import { getSettings } from "@/lib/data";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "Formation en ligne",
  description:
    "Licences, masters et certificats du Groupe ISI entièrement à distance : génie informatique, intelligence artificielle, réseaux et systèmes, finance et comptabilité.",
  alternates: { canonical: "/formation-en-ligne" },
};

/** Offre à distance reprise de la page « Formation en ligne » de groupeisi.com. */
const CURSUS: { niveau: string; Icon: typeof GraduationCap; intitules: string[] }[] = [
  {
    niveau: "Nos licences à distance",
    Icon: GraduationCap,
    intitules: [
      "Licence Génie Informatique",
      "Licence Intelligence Artificielle & Ingénierie de données",
      "Licence Réseaux & Systèmes",
      "Licence Finance et Comptabilité",
    ],
  },
  {
    niveau: "Nos masters à distance",
    Icon: MonitorPlay,
    intitules: [
      "Master Génie Informatique",
      "Master Intelligence Artificielle & Ingénierie de données",
      "Master Réseaux & Systèmes",
      "Master Finance et Comptabilité",
    ],
  },
  {
    niveau: "Nos certificats",
    Icon: BadgeCheck,
    intitules: ["Certification en Python", "Certificat en Data Management", "Certificat en Data Visualisation"],
  },
];

const ATOUTS = [
  { Icon: InfinityIcon, titre: "Accès illimité", texte: "Les cours, supports et enregistrements restent disponibles pendant toute la durée de votre formation." },
  { Icon: Gauge, titre: "Apprentissage à votre rythme", texte: "Vous avancez à votre façon, en conciliant vos études avec votre activité professionnelle." },
  { Icon: BadgeCheck, titre: "Certificats reconnus", texte: "Les diplômes délivrés sont les mêmes qu'en présentiel, reconnus par l'ANAQ-Sup et le CAMES." },
  { Icon: CalendarClock, titre: "Admission en continu", texte: "Les inscriptions sont ouvertes toute l'année, avec un encadrement personnalisé." },
];

export default async function FormationEnLignePage() {
  const settings = await getSettings();
  const plateforme = settings.elearningUrl ?? "https://elearning-groupeisi.com/";

  return (
    <>
      <PageHeader
        title="Formation en ligne"
        subtitle="Étudiez confortablement depuis chez vous et à votre propre rythme, avec la plateforme de formation à distance du Groupe ISI."
        items={[{ label: "Nos formations", href: "/formations" }, { label: "Formation en ligne" }]}
        image="/media/mg-8766-cr3-at-2025-copie.jpg"
      />

      <section className="bg-white section-y">
        <Container>
          <div className="grid gap-[30px] lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SectionLabel>Formation ouverte et à distance</SectionLabel>
              <AnimatedHeading className="section-title">Apprenez à votre façon avec l&apos;ISI</AnimatedHeading>
              <p className="mt-5 text-base leading-7 text-body">
                L&apos;Institut Supérieur d&apos;Informatique vous offre des options d&apos;études flexibles adaptées à votre réalité. Profitez
                d&apos;une formation de qualité, entièrement à distance, et avancez à votre façon.
              </p>
              <p className="mt-4 text-base leading-7 text-body">
                Le Groupe ISI attire chaque année des milliers d&apos;étudiants pour son vaste choix de programmes et de cours en ligne. Son admission
                en continu et la personnalisation de son encadrement comptent parmi ses nombreux avantages.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href={plateforme} external>
                  Accéder à la plateforme <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Button>
                <Button href="/preinscription?mode=EN_LIGNE" variant="outline" arrow>
                  S&apos;inscrire en ligne
                </Button>
              </div>
            </div>

            <aside className="rounded-lg bg-primary p-7 text-white">
              <h3 className="font-heading text-[20px] font-semibold text-white">Prêt à vous inscrire ?</h3>
              <p className="mt-2 text-[15px] text-white/80">
                Contactez le responsable de formation ou commencez votre inscription dès maintenant.
              </p>
              <ul className="mt-5 space-y-3 text-[15px]">
                {settings.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="transition hover:text-secondary">
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    <a href={`mailto:${settings.email}`} className="break-all transition hover:text-secondary">
                      {settings.email}
                    </a>
                  </li>
                )}
              </ul>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-surface section-y">
        <Container>
          <div className="mb-8 max-w-3xl lg:mb-10">
            <SectionLabel>Nos formations</SectionLabel>
            <AnimatedHeading className="section-title">Les cursus proposés à distance</AnimatedHeading>
            <p className="mt-4 text-[15px] leading-7 text-body">
              Découvrez les différentes formations à distance que le Groupe ISI propose, du premier cycle au master, ainsi que les certificats courts.
            </p>
          </div>
          <div className="grid gap-[30px] lg:grid-cols-3">
            {CURSUS.map(({ niveau, Icon, intitules }) => (
              <article key={niveau} className="rounded-lg border border-line bg-white p-7">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-5 font-heading text-[20px] font-semibold text-dark">{niveau}</h3>
                <ul className="mt-4 space-y-2.5 text-[15px] text-body">
                  {intitules.map((i) => (
                    <li key={i} className="border-b border-line pb-2.5 last:border-0 last:pb-0">
                      {i}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white section-y">
        <Container>
          <div className="mb-8 max-w-3xl lg:mb-10">
            <SectionLabel>Pourquoi nous choisir ?</SectionLabel>
            <AnimatedHeading className="section-title">Une formation à distance sans compromis</AnimatedHeading>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
            {ATOUTS.map(({ Icon, titre, texte }) => (
              <div key={titre} className="rounded-lg border border-line bg-white p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary-50 text-secondary-dark">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-[18px] font-semibold text-dark">{titre}</h3>
                <p className="mt-1.5 text-[15px] leading-7 text-body">{texte}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

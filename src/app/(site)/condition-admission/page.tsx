import type { Metadata } from "next";
import Image from "next/image";
import { Check, FileText, GraduationCap, Users } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { PreInscriptionCTA } from "@/components/sections/PreInscriptionCTA";
import { getSettings, getFAQ, getProgrammesForForm, getCampus } from "@/lib/data";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "Conditions d'admission",
  description:
    "Conditions d'admission au Groupe ISI : niveaux requis, pièces à fournir, procédure de pré-inscription et calendrier des rentrées.",
};

const EXIGENCES = [
  {
    titre: "1. Qualifications académiques",
    items: [
      "Baccalauréat (toutes séries) ou diplôme admis en équivalence pour les licences et bachelors.",
      "Licence (Bac+3) ou diplôme équivalent dans le domaine pour les masters.",
      "Passerelles possibles pour les titulaires d'un BTS/DUT vers la 3e année de licence.",
    ],
  },
  {
    titre: "2. Pièces à fournir",
    items: [
      "Fiche de pré-inscription complétée",
      "Copies légalisées des diplômes et relevés de notes",
      "Copie de la pièce d'identité ou du passeport",
      "Extrait de naissance",
      "Deux photos d'identité",
      "Reçu de paiement des droits d'inscription",
    ],
  },
  {
    titre: "3. Étude de dossier",
    items: [
      "Les candidatures sont examinées par le chef de département concerné.",
      "Certains programmes peuvent exiger un entretien de motivation.",
      "Le respect des exigences minimales garantit l'admission.",
    ],
  },
  {
    titre: "4. Étudiants étrangers",
    items: [
      "Passeport en cours de validité",
      "Lettre d'admission délivrée par l'institut",
      "Justificatifs de prise en charge",
      "Accompagnement pour les démarches de visa et de logement",
    ],
  },
];

const ETAPES = [
  {
    num: "01",
    titre: "Préparer son dossier",
    texte: "Réunissez vos relevés de notes, diplômes, pièce d'identité et photos avant de commencer votre demande.",
  },
  {
    num: "02",
    titre: "Remplir la pré-inscription en ligne",
    texte: "Complétez le formulaire de pré-inscription avec vos informations personnelles, académiques et la formation visée.",
  },
  {
    num: "03",
    titre: "Déposer les pièces et régler les droits",
    texte: "Déposez votre dossier sur l'un de nos campus et réglez les droits d'inscription pour finaliser votre candidature.",
  },
  {
    num: "04",
    titre: "Recevoir la réponse d'admission",
    texte: "Après étude du dossier, l'institut vous informe par email ou par téléphone de votre admission et des prochaines étapes.",
  },
];

const PROFILS = [
  { titre: "Licence & Bachelor", texte: "Commencez votre parcours avec des conditions d'entrée accessibles dès le baccalauréat.", image: "/media/img-2024-1.jpg", icone: GraduationCap },
  { titre: "Master", texte: "Poursuivez en master professionnel après une licence dans le domaine, sur dossier et entretien.", image: "/media/mg-9941-cr3-at-2025.jpg", icone: FileText },
  { titre: "Étudiants étrangers", texte: "Rejoignez une communauté de plus de trente nationalités, accompagnée dans ses démarches.", image: "/media/img-2298-1.jpg", icone: Users },
];

export default async function ConditionAdmissionPage() {
  const [settings, faqs, formations, campus] = await Promise.all([getSettings(), getFAQ(), getProgrammesForForm(), getCampus()]);
  const faqAdmission = faqs.filter((f) => /admission|bourse|programme/i.test(f.question + f.categorie)).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Conditions d'admission"
        subtitle="Les prérequis, les pièces à fournir et la procédure pour rejoindre le Groupe ISI."
        items={[{ label: "Conditions d'admission" }]}
        image="/media/img-2024-1.jpg"
      />

      <section className="bg-white section-y">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>Admissions {settings.anneeAcademique}</SectionLabel>
              <AnimatedHeading className="section-title">Exigences et calendrier</AnimatedHeading>
              <p className="mt-5 text-[15px] leading-7 text-body">
                Nos conditions d&apos;admission sont conçues pour rester transparentes, compétitives et accessibles aux étudiants de tous horizons.
                Chaque programme précise le niveau requis, les pièces à fournir et les modalités d&apos;étude du dossier. Les candidats sont
                accompagnés par la scolarité et par le chef de département concerné.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/preinscription" arrow>
                  Se préinscrire
                </Button>
                <Button href="/telechargements" variant="outline" arrow>
                  Télécharger la fiche
                </Button>
              </div>
            </div>
            <div className="grid gap-[30px] sm:grid-cols-2">
              {EXIGENCES.map((e) => (
                <div key={e.titre} className="rounded-lg border border-line bg-white p-6">
                  <h3 className="font-heading text-[18px] font-semibold text-dark">{e.titre}</h3>
                  <ul className="mt-3 space-y-2">
                    {e.items.map((i) => (
                      <li key={i} className="flex gap-2.5 text-[15px] leading-6 text-body">
                        <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface section-y">
        <Container>
          <div className="mb-8 max-w-3xl lg:mb-10">
            <SectionLabel>Procédure</SectionLabel>
            <AnimatedHeading className="section-title">Comment s&apos;inscrire en 4 étapes</AnimatedHeading>
          </div>
          <ol className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((e) => (
              <li key={e.num} className="rounded-lg border border-line bg-white p-7">
                <span className="font-heading text-[34px] font-semibold leading-none text-primary/25">{e.num}</span>
                <h3 className="mt-4 font-heading text-[18px] font-semibold text-dark">{e.titre}</h3>
                <p className="mt-2.5 text-[15px] leading-7 text-body">{e.texte}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white section-y">
        <Container>
          <div className="mb-8 max-w-3xl lg:mb-10">
            <SectionLabel>Profils</SectionLabel>
            <AnimatedHeading className="section-title">Quel que soit votre parcours</AnimatedHeading>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
            {PROFILS.map(({ titre, texte, image, icone: Icon }) => (
              <article key={titre} className="group overflow-hidden rounded-lg border border-line bg-white">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image src={image} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-heading text-[20px] font-semibold text-dark">{titre}</h3>
                  <p className="mt-2.5 text-[15px] leading-7 text-body">{texte}</p>
                  <Button href="/preinscription" variant="link" className="mt-4" arrow>
                    Se préinscrire
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {faqAdmission.length > 0 && (
            <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <div>
                <SectionLabel>FAQ</SectionLabel>
                <AnimatedHeading className="section-title">Questions fréquentes</AnimatedHeading>
                <p className="mt-4 text-[15px] leading-7 text-body">
                  Vous ne trouvez pas votre réponse ? La scolarité vous répond du lundi au vendredi de 8h à 18h.
                </p>
              </div>
              <Accordion items={faqAdmission.map((f) => ({ id: f.id, title: f.question, content: f.reponse }))} />
            </div>
          )}
        </Container>
      </section>

      <PreInscriptionCTA
        anneeAcademique={settings.anneeAcademique}
        ouvertes={settings.inscriptionsOuvertes}
        formations={formations.map((f) => ({ id: f.id, titre: f.titre }))}
        campus={campus.map((c) => ({ id: c.id, nom: c.nom }))}
      />
    </>
  );
}

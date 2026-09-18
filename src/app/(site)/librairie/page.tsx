import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { NewsSection } from "@/components/sections/NewsSection";
import { getDocuments, getLatestPosts } from "@/lib/data";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "Librairie",
  description: "La librairie du Groupe ISI : ressources documentaires, brochures, règlements et supports de formation à télécharger.",
};

const COLLECTIONS = [
  {
    titre: "Ouvrages académiques",
    description: "Manuels et références des programmes d'informatique, de réseaux, de data science et de gestion.",
    image: "/media/img-8837-cr3-dxo-deepprime-dxo.jpg",
  },
  {
    titre: "Revues & publications",
    description: "Articles, mémoires et travaux de recherche des étudiants et enseignants de l'institut.",
    image: "/media/img-9253-cr3-dxo-deepprimexd-dxo.jpg",
  },
  {
    titre: "Ressources numériques",
    description: "Supports de cours, tutoriels et accès aux plateformes partenaires (Cisco NetAcad, Huawei Talent).",
    image: "/media/img-1923.jpg",
  },
];

const CHIFFRES = [
  { valeur: "200 +", titre: "Ouvrages disponibles", description: "Accès sur place et espaces de travail." },
  { valeur: "25", titre: "Postes de consultation", description: "Un environnement d'apprentissage." },
  { valeur: "1200 +", titre: "Ressources numériques", description: "Supports pour approfondir les cours." },
  { valeur: "1000 +", titre: "Étudiants accueillis", description: "Un pôle de partage de la connaissance." },
];

export default async function LibrairiePage() {
  const [documents, posts] = await Promise.all([getDocuments(), getLatestPosts(4)]);

  return (
    <>
      <PageHeader title="Librairie" items={[{ label: "Librairie" }]} image="/media/img-8837-cr3-dxo-deepprime-dxo.jpg" />

      <section className="bg-white section-y">
        <Container>
          <div className="max-w-3xl">
            <SectionLabel>Librairie du Groupe ISI</SectionLabel>
            <AnimatedHeading className="section-title">Un espace de travail et de documentation</AnimatedHeading>
            <p className="mt-5 text-base leading-7 text-body">
              La librairie met à disposition des étudiants les ouvrages, revues et ressources numériques nécessaires à leur parcours. Elle accueille
              également les travaux de recherche menés au sein des départements du Groupe ISI.
            </p>
          </div>

          <div className="mt-12 grid gap-8 rounded-lg border border-line bg-surface px-6 py-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
            {CHIFFRES.map((c) => (
              <div key={c.titre}>
                <p className="font-heading text-[40px] font-semibold leading-none text-primary">{c.valeur}</p>
                <h4 className="mt-3 font-heading text-[18px] font-semibold text-dark">{c.titre}</h4>
                <p className="mt-1 text-sm text-body">{c.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface section-y">
        <Container>
          <div className="mb-8 max-w-3xl lg:mb-10">
            <SectionLabel>Collections</SectionLabel>
            <AnimatedHeading className="section-title">Nos collections</AnimatedHeading>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
            {COLLECTIONS.map((c) => (
              <article key={c.titre} className="group overflow-hidden rounded-lg border border-line bg-white">
                <Image src={c.image} alt="" width={600} height={400} className="aspect-[3/2] w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="p-6">
                  <h3 className="font-heading text-[20px] font-semibold text-dark">{c.titre}</h3>
                  <p className="mt-2.5 text-[15px] leading-7 text-body">{c.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white section-y">
        <Container>
          <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <SectionLabel>Téléchargements</SectionLabel>
              <AnimatedHeading className="section-title">Documents utiles</AnimatedHeading>
            </div>
            <Button href="/telechargements" arrow className="shrink-0">
              Tous les documents
            </Button>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-2">
            {documents.slice(0, 4).map((d) => (
              <DocumentCard key={d.id} titre={d.titre} description={d.description} fichier={d.fichier} format={d.format} taille={d.taille} type={d.type} />
            ))}
          </div>
        </Container>
      </section>

      <NewsSection posts={posts.map((p) => ({ titre: p.titre, slug: p.slug, extrait: p.extrait, image: p.image, publishedAt: p.publishedAt, tempsLecture: p.tempsLecture, categorie: p.categorie }))} title="Lisez nos dernières actualités" />
    </>
  );
}

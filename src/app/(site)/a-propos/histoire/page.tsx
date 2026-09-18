import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AproposNav } from "@/components/layout/AproposNav";
import { getGalleryImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Histoire",
  description:
    "Depuis plus de 27 ans, l'Institut Supérieur d'Informatique « ISI » s'engage dans la formation des jeunes cadres africains : prix, distinctions et étapes marquantes.",
};

/** Distinctions et étapes reprises de la frise de la page « Histoire ». */
const TIMELINE: { annee: string; image: string; faits: { titre: string; date?: string; texte: string }[] }[] = [
  {
    annee: "2024",
    image: "/media/img-2247-1.jpg",
    faits: [
      {
        titre: "Lauréat du 2e Prix Gov'athon 2024",
        date: "Décembre 2024",
        texte:
          "L'Institut Supérieur d'Informatique (ISI) s'est distingué de manière remarquable en plaçant quatre projets innovants en finale. Et mieux encore, en remportant le deuxième prix avec le projet FIRNDE BI qui vise à faciliter l'accès aux diplômes et certificats.",
      },
      {
        titre: "Lauréat du 2e Prix Challenge Pitch 2024",
        date: "Juillet 2024",
        texte:
          "L'ISI s'est encore distingué en remportant le deuxième prix du Challenge Pitch, organisé par Jokkolabs et l'USAID EI, dans le cadre de la Semaine mondiale de l'entrepreneuriat.",
      },
    ],
  },
  {
    annee: "2023",
    image: "/media/img-2033-1.jpg",
    faits: [
      {
        titre: "Prix Quality Achievements Awards à Dubaï",
        texte:
          "Le Groupe ISI reçoit le prestigieux prix « Quality Achievements Awards 2023 ». À l'hôtel Dusit Thani, le monde des affaires international s'est réuni pour célébrer l'excellence lors des Quality Achievements Awards 2023. Parmi les lauréats, le Groupe ISI s'est démarqué, affirmant sa position de leader en matière de qualité et d'innovation.",
      },
    ],
  },
  {
    annee: "2020",
    image: "/media/mg-0041-cr3-at-2025-at-2025.jpg",
    faits: [
      {
        titre: "Meilleure Académie Huawei",
        texte:
          "L'ISI est distinguée comme la meilleure académie Huawei, consolidant notre réputation d'excellence dans les technologies de l'information. Cette reconnaissance souligne notre engagement continu envers la qualité de l'enseignement et de la formation.",
      },
    ],
  },
  {
    annee: "2019",
    image: "/media/img-1573.jpg",
    faits: [{ titre: "Intégration Académie HUAWEI", texte: "L'ISI devient Académie HUAWEI en 2019." }],
  },
  {
    annee: "2018",
    image: "/media/mg-0035-cr3-at-2025-at-2025.jpg",
    faits: [
      {
        titre: "Champion du Resakss Data Challenge",
        texte:
          "L'ISI remporte le premier prix du Resakss Data Challenge de l'Union Africaine et de l'IFPRI, recevant des félicitations de Son Excellence le Président de la République, soulignant notre engagement envers l'excellence dans le domaine des données et de l'innovation.",
      },
    ],
  },
  {
    annee: "2017",
    image: "/media/mg-0035-cr3-at-2025-at-2025.jpg",
    faits: [
      {
        titre: "Champion de l'Innovation Éducative",
        texte:
          "L'ISI a été distingué comme l'entreprise la plus dynamique et innovante dans le secteur de l'éducation, honoré lors du gala des Top 100 entreprises les plus innovantes et dynamiques au Sénégal et dans l'espace UEMOA.",
      },
    ],
  },
  {
    annee: "2016",
    image: "/media/img-1714-1.jpg",
    faits: [
      {
        titre: "Meilleure École IT au Gala des TIC Set Awards",
        texte:
          "L'ISI a été honorée du trophée de la meilleure école IT lors du gala des TIC Set Awards au Sénégal, marquant notre engagement constant envers l'excellence éducative dans le domaine des technologies de l'information.",
      },
    ],
  },
  {
    annee: "2015",
    image: "/media/img-2377-1.jpg",
    faits: [
      {
        titre: "Au sommet de l'excellence CISCO",
        texte:
          "Notre académie s'est distinguée comme la meilleure institution CISCO d'excellence en Afrique subsaharienne, démontrant notre engagement exceptionnel envers la formation et l'innovation dans le domaine des technologies de l'information.",
      },
    ],
  },
];

export default async function HistoirePage() {
  const gallery = await getGalleryImages();

  return (
    <>
      <PageHeader title="Histoire" items={[{ label: "À propos", href: "/a-propos" }, { label: "Histoire" }]} image="/media/img-9163.jpg" />
      <AproposNav />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-lg">
              <Image src="/media/img-9163.jpg" alt="Campus siège du Groupe ISI" width={960} height={640} className="h-auto w-full object-cover" />
            </div>
            <div>
              <SectionLabel>Notre parcours</SectionLabel>
              <h2 className="section-title">Histoire du Groupe ISI</h2>
              <div className="prose-isi mt-5">
                <p>
                  Depuis plus de 27 ans, l&apos;Institut Supérieur d&apos;Informatique « ISI » s&apos;engage dans la formation des jeunes cadres
                  africains. Avec l&apos;ambition du PDG, l&apos;institut vise à diversifier l&apos;offre de formation au Sénégal et dans la
                  sous-région. Au fil des années, l&apos;ISI a su se développer et compte aujourd&apos;hui 9 campus, réunissant plus de trente
                  nationalités, formant ainsi une belle et dynamique famille isienne.
                </p>
                <p>
                  Le groupe ISI bénéficie de l&apos;expertise de professeurs de très haut niveau universitaire, spécialisés dans divers domaines de
                  l&apos;informatique et de la gestion. L&apos;institut trouve ses origines en 1988, sous l&apos;appellation JET INFORMATIQUE, une
                  initiative portée par de jeunes étudiants de l&apos;Université Cheikh Anta Diop de Dakar, en collaboration avec leurs homologues de
                  l&apos;Université Laval, au Québec.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Frise des distinctions */}
      <section className="bg-surface py-16 lg:py-[100px]">
        <Container>
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Distinctions</SectionLabel>
            <h2 className="section-title">Nos prix et reconnaissances</h2>
          </div>

          <ol className="relative space-y-12 border-l-2 border-line pl-6 sm:pl-10">
            {TIMELINE.map((t) => (
              <li key={t.annee} className="relative">
                <span className="absolute -left-[33px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary sm:-left-[49px]" aria-hidden>
                  <span className="h-2 w-2 rounded-full bg-secondary" />
                </span>
                <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                  <div>
                    <p className="font-heading text-[30px] font-semibold leading-none text-primary">{t.annee}</p>
                    <Image src={t.image} alt="" width={420} height={300} className="mt-4 aspect-[4/3] w-full rounded-lg object-cover" />
                  </div>
                  <div className="space-y-6">
                    {t.faits.map((f) => (
                      <article key={f.titre} className="rounded-lg border border-line bg-white p-6">
                        {f.date && <span className="text-[13px] font-medium uppercase tracking-wide text-primary">{f.date}</span>}
                        <h3 className="mt-1 font-heading text-[20px] font-semibold text-dark">{f.titre}</h3>
                        <p className="mt-2.5 text-[15px] leading-7 text-body">{f.texte}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {gallery.slice(4, 8).map((g) => (
              <Image key={g.src} src={g.src} alt={g.alt} width={500} height={380} className="aspect-[4/3] w-full rounded-lg object-cover" />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/galerie" arrow>
              Découvrir la vie de campus
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

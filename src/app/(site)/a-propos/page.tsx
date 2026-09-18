import type { Metadata } from "next";
import Image from "next/image";
import { Award, Briefcase, Play, Quote } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AproposNav } from "@/components/layout/AproposNav";
import { IconBoxes } from "@/components/sections/AboutSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { getSettings, getTestimonials, getGalleryImages } from "@/lib/data";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "À ISI, l'éducation va au-delà des manuels et des salles de classe : programmes de calibre international, installations de pointe et communauté de plus de trente nationalités.",
};

/** Distinctions listées sur la page « Présentation » de groupeisi.com. */
const PALMES: { annee: string; texte: string }[] = [
  { annee: "2015", texte: "Meilleure académie d'excellence CISCO au niveau de l'Afrique subsaharienne." },
  { annee: "2016", texte: "Trophée de la meilleure école IT lors du gala des TIC Set Awards organisé au Sénégal." },
  {
    annee: "2017",
    texte:
      "Entreprise la plus dynamique et la plus innovante du secteur de l'éducation, lors du gala des 100 entreprises les plus innovantes du Sénégal et de l'espace UEMOA.",
  },
  { annee: "2018", texte: "Premier prix du Resakss Data Challenge de l'Union africaine et de l'IFPRI." },
  { annee: "2019", texte: "Meilleure académie Huawei." },
];

/** Missions de la Cellule d'Orientation et d'Insertion Professionnelle. */
const COIP = [
  "Suivre l'étudiant depuis son entrée à l'ISI jusqu'à son insertion professionnelle",
  "Informer sur les filières d'études, les orientations et réorientations possibles ainsi que sur les métiers auxquels conduisent les formations",
  "Aider les étudiants dans leur future insertion professionnelle et leur faciliter l'accès au monde professionnel",
  "Créer des partenariats avec les entreprises et proposer des offres de stages et d'emplois",
  "Animer la plateforme des anciens diplômés de l'ISI",
];

export default async function AproposPage() {
  const [settings, testimonials, gallery] = await Promise.all([getSettings(), getTestimonials(6), getGalleryImages()]);

  return (
    <>
      <PageHeader title="À propos" items={[{ label: "À propos" }]} image="/media/img-9163.jpg" />
      <AproposNav />

      <section className="bg-white section-y">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-lg">
              <Image src="/media/km-1.jpg" alt="Campus du Groupe ISI" width={960} height={620} className="h-auto w-full object-cover" />
            </div>
            <div>
              <SectionLabel>Groupe ISI</SectionLabel>
              <AnimatedHeading className="section-title">À propos de ISI</AnimatedHeading>
              <div className="prose-isi mt-5">
                <p>
                  Situé au Km1, avenue Cheikh Anta Diop, l&apos;Institut Supérieur d&apos;Informatique est sous la tutelle du Ministère de
                  l&apos;Enseignement supérieur privé, signataire de tous les diplômes délivrés, sous le contrôle de l&apos;ANAQ-Sup. L&apos;ISI
                  contribue depuis plus de 27 ans à la formation des jeunes cadres africains et compte aujourd&apos;hui 9 campus où se côtoient plus
                  de trente nationalités. Ses diplômes de licence et de master sont reconnus à la fois par le monde de l&apos;entreprise et par les
                  instances d&apos;accréditation nationale (ANAQ-Sup) et panafricaine (CAMES).
                </p>
                <p>
                  À ISI, l&apos;éducation va au-delà des manuels et des salles de classe. Nous croyons qu&apos;il faut donner aux étudiants les moyens
                  d&apos;explorer leurs passions, de remettre en question les conventions et de découvrir leur potentiel grâce à des expériences
                  significatives. Nos professeurs distingués sont des chefs de file dans leurs domaines respectifs et se consacrent à offrir une
                  éducation de calibre mondial qui intègre la théorie à un soutien pratique et à l&apos;application. Avec des installations de pointe,
                  des laboratoires modernes et un environnement d&apos;apprentissage dynamique, nous veillons à ce que chaque étudiant dispose des
                  outils et du soutien nécessaires pour exceller sur le plan académique et personnel.
                </p>
              </div>

              <figure className="mt-8 border-l-4 border-primary bg-surface px-6 py-6">
                <Quote className="h-7 w-7 text-primary" aria-hidden />
                <blockquote className="mt-3 text-[15px] italic leading-7 text-body">
                  À l&apos;ISI, nous ne nous contentons pas de transmettre des connaissances. Nous préparons nos étudiants à devenir les leaders de
                  demain, capables de comprendre, d&apos;anticiper et d&apos;agir dans un monde en constante mutation. Grâce à une approche pédagogique
                  axée sur les compétences numériques, l&apos;intelligence artificielle, la cybersécurité, les data sciences ou encore les technologies
                  émergentes, nous formons une nouvelle génération de professionnels responsables, agiles et résolument tournés vers l&apos;avenir.
                </blockquote>
                <figcaption className="mt-4 font-heading text-[18px] font-semibold text-dark">– Abdou Sambe</figcaption>
              </figure>

              <p className="mt-8 text-[15px] leading-7 text-body">
                Notre communauté diversifiée accueille des étudiants du monde entier, favorisant les échanges culturels et la compréhension mutuelle.
                Grâce à des collaborations internationales, des initiatives de recherche et des pôles d&apos;innovation, nous offrons aux étudiants la
                possibilité de s&apos;engager face aux enjeux mondiaux et de contribuer à des solutions durables. L&apos;excellence et l&apos;inclusion
                sont au cœur du groupe ISI.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Chiffres clés + visuels */}
      <section className="bg-surface section-y">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="grid grid-cols-2 gap-5">
              <Image src="/media/img-2247-full.jpg" alt="" width={600} height={780} className="h-full w-full rounded-lg object-cover" />
              <Image src="/media/z3a6098-1.jpg" alt="" width={600} height={780} className="mt-8 h-full w-full rounded-lg object-cover" />
            </div>
            <div>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  { v: `+ ${new Intl.NumberFormat("fr-FR").format(settings.statEtudiants)}`, l: "Étudiants inscrits" },
                  { v: `${settings.statCampus}`, l: "Campus" },
                  { v: `+ ${settings.statPartenaires}`, l: "Partenaires" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-line bg-white px-5 py-6 text-center">
                    <p className="font-heading text-[30px] font-semibold leading-none text-primary">{s.v}</p>
                    <p className="mt-2 text-[15px] text-body">{s.l}</p>
                  </div>
                ))}
              </div>

              <h3 className="mt-10 font-heading text-[26px] font-semibold text-dark lg:text-[30px]">Notre Vision</h3>
              <p className="mt-4 text-[15px] leading-7 text-body">
                Notre vision est de créer un monde où l&apos;éducation permet à chaque individu d&apos;atteindre son plein potentiel. Nous aspirons à
                être une institution mondiale de premier plan, reconnue pour son excellence académique, son innovation et sa responsabilité sociale.
                Notre objectif est de former des penseurs créatifs, des leaders éthiques et des apprenants tout au long de leur vie, qui contribuent
                positivement à la société.
              </p>
            </div>
          </div>

          <div className="mt-14">
            <IconBoxes
              items={[
                {
                  titre: "Accessibilité",
                  description: "ISI propose des frais de scolarité transparents et compétitifs, ainsi que des modalités de paiement flexibles.",
                  icone: "award",
                },
                {
                  titre: "Programmes",
                  description: "À ISI, nous proposons des programmes universitaires de calibre international et un encadrement professoral expert.",
                  icone: "graduation",
                },
                {
                  titre: "Vie étudiante",
                  description: "ISI, pour ses étudiants, va au-delà des études en proposant des activités et des événements culturels dynamiques.",
                  icone: "users",
                },
              ]}
            />
          </div>
        </Container>
      </section>

      {/* Palmes et reconnaissances + COIP */}
      <section className="bg-white section-y">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>Distinctions</SectionLabel>
              <AnimatedHeading className="section-title">Palmes et reconnaissances</AnimatedHeading>
              <p className="mt-5 text-[15px] leading-7 text-body">
                L&apos;excellence académique des programmes du Groupe ISI a été distinguée à plusieurs reprises au Sénégal et à l&apos;échelle du
                continent.
              </p>
              <ul className="mt-8 space-y-5">
                {PALMES.map(({ annee, texte }) => (
                  <li key={annee} className="flex gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Award className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-[15px] leading-7 text-body">
                      <strong className="font-heading text-[17px] font-semibold text-dark">{annee}</strong>
                      <span className="block">{texte}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionLabel>Insertion professionnelle</SectionLabel>
              <AnimatedHeading className="section-title">La cellule COIP</AnimatedHeading>
              <p className="mt-5 text-[15px] leading-7 text-body">
                La Cellule d&apos;Orientation et d&apos;Insertion Professionnelle accompagne chaque étudiant, de son entrée à l&apos;ISI jusqu&apos;à
                son premier emploi.
              </p>
              <ul className="mt-6 space-y-3">
                {COIP.map((m) => (
                  <li key={m} className="flex gap-3 text-[15px] leading-7 text-body">
                    <Briefcase className="mt-1.5 h-4 w-4 shrink-0 text-secondary-dark" aria-hidden />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 rounded-lg border-l-4 border-secondary bg-secondary-50 px-6 py-5 text-[15px] leading-7 text-body">
                Plus de 80 % de nos diplômés décrochent leur premier emploi dès la fin de leurs études. Nos étudiants sont accompagnés par des cours de
                développement personnel et par un réseau de partenaires parmi les plus grandes entreprises du Sénégal et de la sous-région.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Les 72H du Groupe ISI */}
      <section className="bg-white section-y">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <AnimatedHeading className="section-title" as="h3">Les 72H du Groupe ISI</AnimatedHeading>
              <p className="mt-5 text-[15px] leading-7 text-body">
                Notre communauté diversifiée accueille des étudiants du monde entier, favorisant les échanges culturels et la compréhension mutuelle.
                Grâce à des collaborations internationales, des initiatives de recherche et des pôles d&apos;innovation, nous offrons aux étudiants la
                possibilité de s&apos;engager face aux enjeux mondiaux et de contribuer à des solutions durables.
              </p>
              <Button href="/evenements" className="mt-8" arrow>
                Voir nos évènements
              </Button>
            </div>
            <div className="relative overflow-hidden rounded-lg">
              <Image src="/media/img-2298-1.jpg" alt="Les 72H du Groupe ISI" width={960} height={620} className="h-auto w-full object-cover" />
              {settings.heroVideoUrl && (
                <a
                  href={settings.heroVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Regarder la vidéo des 72H du Groupe ISI"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-fg">
                    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary" aria-hidden />
                    <Play className="relative h-7 w-7" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>

      <TestimonialsSection
        testimonials={testimonials.slice(0, 4).map((t) => ({
          nom: t.nom,
          role: t.role,
          contenu: t.contenu,
          photo: t.photo,
          note: t.note,
          entreprise: t.entreprise,
        }))}
        label="Témoignages"
        title="Ils nous ont fait confiance"
        description="À ISI, nos étudiants sont au cœur de tout ce que nous faisons. Leurs histoires reflètent notre mission : autonomiser, inspirer et préparer."
        variant="surface"
      />

      <section className="bg-white pb-16 lg:pb-[100px]">
        <Container>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {gallery.slice(0, 4).map((g) => (
              <Image key={g.src} src={g.src} alt={g.alt} width={500} height={380} className="aspect-[4/3] w-full rounded-lg object-cover" />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/galerie" arrow>
              Découvrir la vie au sein de nos campus
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}

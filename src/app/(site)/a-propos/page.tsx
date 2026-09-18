import type { Metadata } from "next";
import Image from "next/image";
import { Play, Quote } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AproposNav } from "@/components/layout/AproposNav";
import { IconBoxes } from "@/components/sections/AboutSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { getSettings, getTestimonials, getGalleryImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "À ISI, l'éducation va au-delà des manuels et des salles de classe : programmes de calibre international, installations de pointe et communauté de plus de trente nationalités.",
};

export default async function AproposPage() {
  const [settings, testimonials, gallery] = await Promise.all([getSettings(), getTestimonials(6), getGalleryImages()]);

  return (
    <>
      <PageHeader title="À propos" items={[{ label: "À propos" }]} image="/media/img-9163.jpg" />
      <AproposNav />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-lg">
              <Image src="/media/km-1.jpg" alt="Campus du Groupe ISI" width={960} height={620} className="h-auto w-full object-cover" />
            </div>
            <div>
              <SectionLabel>Groupe ISI</SectionLabel>
              <h2 className="section-title">À propos de ISI</h2>
              <div className="prose-isi mt-5">
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
      <section className="bg-surface py-16 lg:py-[100px]">
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

      {/* Les 72H du Groupe ISI */}
      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="section-title">Les 72H du Groupe ISI</h3>
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

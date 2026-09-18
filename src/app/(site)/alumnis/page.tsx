import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { EventCard } from "@/components/cards/EventCard";
import { NewsSection } from "@/components/sections/NewsSection";
import { getAlumni, getSettings, getEvenements, getLatestPosts, getGalleryImages } from "@/lib/data";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "Nos Alumnis",
  description:
    "Avec plus de 20 000 diplômés à travers le monde, le réseau des anciens de l'ISI constitue une richesse inestimable, reflet de la qualité de notre pédagogie.",
};

export default async function AlumnisPage() {
  const [alumni, settings, events, posts, gallery] = await Promise.all([
    getAlumni(),
    getSettings(),
    getEvenements({ upcoming: true, take: 3 }),
    getLatestPosts(4),
    getGalleryImages(),
  ]);

  return (
    <>
      <PageHeader
        title="Nos Alumnis"
        subtitle="Fort de plus de 30 ans d'histoire, l'ISI s'impose comme un acteur de référence dans l'enseignement supérieur."
        items={[{ label: "Nos Alumnis" }]}
        image="/media/dsc-0071-1.jpg"
      />

      <section className="bg-white section-y">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>Réseau Alumni</SectionLabel>
              <AnimatedHeading className="section-title">Une communauté mondiale</AnimatedHeading>
              <div className="prose-isi mt-5">
                <p>
                  Fort de plus de 30 ans d&apos;histoire et d&apos;un héritage remarquable, l&apos;Institut Supérieur d&apos;Informatique (ISI)
                  s&apos;impose comme un acteur de référence dans l&apos;enseignement supérieur, notamment dans les domaines de l&apos;informatique et
                  de la gestion. Avec plus de 20 000 diplômés à travers le monde, le réseau des anciens de l&apos;ISI constitue une richesse
                  inestimable, reflet de la qualité de notre pédagogie et de notre engagement en faveur de l&apos;excellence.
                </p>
                <p>
                  Issus de formations en Génie Logiciel, Informatique de Gestion, Réseaux Informatiques ou encore Gestion des Entreprises, nos alumni
                  incarnent les valeurs fondamentales de l&apos;ISI : rigueur, innovation, leadership et engagement.
                </p>
                <h3>Faire partie d&apos;une communauté mondiale</h3>
                <p>
                  Intégrer le Groupe ISI, c&apos;est embrasser bien plus qu&apos;une simple formation. C&apos;est entrer dans une communauté mondiale
                  d&apos;excellence, où les frontières géographiques s&apos;effacent devant la passion partagée pour l&apos;informatique, la gestion et
                  les technologies de pointe.
                </p>
                <h3>Partager son expérience pour le bénéfice des étudiants</h3>
                <p>
                  Au sein du Groupe ISI, nous croyons fermement en la force du partage d&apos;expérience pour nourrir l&apos;épanouissement académique
                  et professionnel de nos étudiants. Chaque membre de notre communauté est invité à contribuer à cette culture d&apos;entraide et
                  d&apos;apprentissage continu.
                </p>
              </div>
            </div>
            <div className="grid gap-5">
              <Image src="/media/dsc-0071-1.jpg" alt="" width={960} height={620} className="h-auto w-full rounded-lg object-cover" />
              <div className="grid grid-cols-2 gap-5">
                <Image src="/media/img-9447-cr3-dxo-deepprimexd.jpg" alt="" width={480} height={320} className="h-auto w-full rounded-lg object-cover" />
                <Image src="/media/img-9510-cr3-dxo-deepprimexd.jpg" alt="" width={480} height={320} className="h-auto w-full rounded-lg object-cover" />
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  { v: "20 000 +", l: "Diplômés" },
                  { v: `${settings.statCampus}`, l: "Campus" },
                  { v: `${settings.statInsertion} %`, l: "Insertion" },
                ].map((s) => (
                  <div key={s.l} className="rounded-lg border border-line bg-surface px-5 py-6 text-center">
                    <p className="font-heading text-[26px] font-semibold leading-none text-primary">{s.v}</p>
                    <p className="mt-2 text-[15px] text-body">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface section-y">
        <Container>
          <div className="mb-8 max-w-3xl lg:mb-10">
            <SectionLabel>Portraits</SectionLabel>
            <AnimatedHeading className="section-title">Nos Alumnis</AnimatedHeading>
            <p className="mt-4 text-base leading-7 text-body">
              Nos alumnis les plus distingués incarnent l&apos;excellence dans tous les secteurs d&apos;activité, menant l&apos;innovation, la recherche
              et la créativité à l&apos;échelle mondiale. Leurs réalisations inspirent les générations futures.
            </p>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
            {alumni.map((a) => (
              <AlumniCard
                key={a.id}
                prenom={a.prenom}
                nom={a.nom}
                slug={a.slug}
                promotion={a.promotion}
                programme={a.programme}
                poste={a.poste}
                entreprise={a.entreprise}
                ville={a.ville}
                pays={a.pays}
                photo={a.photo}
                temoignage={a.temoignage}
              />
            ))}
          </div>
        </Container>
      </section>

      {events.length > 0 && (
        <section className="bg-white section-y">
          <Container>
            <div className="mb-8 max-w-3xl lg:mb-10">
              <SectionLabel>Upcoming Events</SectionLabel>
              <AnimatedHeading className="section-title">Participez à nos prochains événements</AnimatedHeading>
            </div>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <EventCard key={e.id} titre={e.titre} slug={e.slug} description={e.description} image={e.image} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-surface section-y">
        <Container>
          <AnimatedHeading className="section-title mb-7">Galerie photos des alumnis</AnimatedHeading>
          <div className="grid gap-5 sm:grid-cols-3">
            {gallery.slice(0, 3).map((g) => (
              <Image key={g.src} src={g.src} alt={g.alt} width={600} height={420} className="aspect-[4/3] w-full rounded-lg object-cover" />
            ))}
          </div>
        </Container>
      </section>

      <NewsSection
        posts={posts.map((p) => ({ titre: p.titre, slug: p.slug, extrait: p.extrait, image: p.image, publishedAt: p.publishedAt, categorie: p.categorie }))}
        label="Actus Alumnis"
        title="Lisez nos dernières actualités"
        variant="white"
      />
    </>
  );
}

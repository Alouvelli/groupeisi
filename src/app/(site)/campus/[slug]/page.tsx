import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { EventCard } from "@/components/cards/EventCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { GallerySection } from "@/components/sections/GallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { getCampusBySlug, getCampus, getTestimonials } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCampusBySlug(slug);
  if (!c) return { title: "Campus introuvable" };
  return {
    title: c.nom,
    description: c.description.slice(0, 160),
    alternates: { canonical: `/campus/${c.slug}` },
    openGraph: { title: c.nom, description: c.description.slice(0, 160), images: c.image ? [{ url: c.image }] : undefined },
  };
}

export default async function CampusDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [campus, testimonials] = await Promise.all([getCampusBySlug(slug), getTestimonials(4)]);
  if (!campus) notFound();
  const autres = (await getCampus()).filter((c) => c.slug !== campus.slug).slice(0, 3);

  const stats = [
    campus.statCampus ? { valeur: String(campus.statCampus), titre: "Campus académiques", description: "(Siège, Fass, ISI24)" } : null,
    campus.statDepartements ? { valeur: String(campus.statDepartements), titre: "Départements pédagogiques" } : null,
    campus.statFormations ? { valeur: String(campus.statFormations), titre: "Formations académiques" } : null,
    campus.statEtudiants ? { valeur: campus.statEtudiants, titre: "Étudiants inscrits dans notre campus" } : null,
  ].filter(Boolean) as { valeur: string; titre: string; description?: string }[];

  const galerie = [campus.image, ...campus.images].filter(Boolean).map((src) => ({ src: src as string, alt: campus.nom, categorie: "Campus" }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: campus.nom,
    address: { "@type": "PostalAddress", streetAddress: campus.adresse, addressLocality: campus.ville, addressCountry: campus.pays },
    telephone: campus.telephone ?? undefined,
    email: campus.email ?? undefined,
    url: absoluteUrl(`/campus/${campus.slug}`),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader title={campus.nom} items={[{ label: "Nos campus", href: "/campus" }, { label: campus.nom }]} image={campus.image} />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-lg">
              <Image src={campus.image || "/media/img-9163.jpg"} alt={campus.nom} width={960} height={640} className="h-auto w-full object-cover" />
            </div>
            <div>
              <SectionLabel>{campus.ville}</SectionLabel>
              <h2 className="section-title">{campus.nom}</h2>
              <p className="mt-5 text-base leading-7 text-body">{campus.description}</p>

              {campus.directeurNom && (
                <div className="mt-8 flex items-center gap-5 rounded-lg border border-line bg-surface p-5">
                  {campus.directeurPhoto && (
                    <Image src={campus.directeurPhoto} alt={campus.directeurNom} width={120} height={120} className="h-20 w-20 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-heading text-[20px] font-semibold text-dark">{campus.directeurNom}</p>
                    <p className="text-[15px] text-body">{campus.directeurPoste}</p>
                  </div>
                </div>
              )}

              <ul className="mt-8 space-y-3 text-[15px] text-body">
                <li className="flex gap-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /> {campus.adresse}
                </li>
                {campus.telephone && (
                  <li className="flex gap-3">
                    <Phone className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <a href={`tel:${campus.telephone.replace(/[^+\d]/g, "")}`} className="transition hover:text-primary">
                      {campus.telephone}
                    </a>
                  </li>
                )}
                {campus.email && (
                  <li className="flex gap-3">
                    <Mail className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <a href={`mailto:${campus.email}`} className="transition hover:text-primary">
                      {campus.email}
                    </a>
                  </li>
                )}
              </ul>

              <Button href="/preinscription" className="mt-8" arrow>
                Se préinscrire sur ce campus
              </Button>
            </div>
          </div>

          {campus.contenu && <div className="prose-isi mt-14 max-w-none" dangerouslySetInnerHTML={{ __html: campus.contenu }} />}

          {(campus.mission.length > 0 || campus.vision.length > 0) && (
            <div className="mt-14 grid gap-[30px] lg:grid-cols-2">
              {campus.mission.length > 0 && (
                <div className="rounded-lg border border-line bg-surface p-8">
                  <h3 className="font-heading text-[24px] font-semibold text-dark">Mission</h3>
                  <ul className="mt-4 space-y-2.5">
                    {campus.mission.map((m) => (
                      <li key={m} className="flex gap-2.5 text-[15px] leading-7 text-body">
                        <Check className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {campus.vision.length > 0 && (
                <div className="rounded-lg border border-line bg-surface p-8">
                  <h3 className="font-heading text-[24px] font-semibold text-dark">Vision</h3>
                  <ul className="mt-4 space-y-2.5">
                    {campus.vision.map((m) => (
                      <li key={m} className="flex gap-2.5 text-[15px] leading-7 text-body">
                        <Check className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden /> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {stats.length > 0 && (
            <div className="mt-14 grid gap-8 rounded-lg bg-primary px-6 py-10 text-white sm:grid-cols-2 sm:px-10 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.titre}>
                  <p className="font-heading text-[40px] font-semibold leading-none text-secondary">{s.valeur}</p>
                  <h4 className="mt-3 font-heading text-[18px] font-semibold text-white">{s.titre}</h4>
                  {s.description && <p className="mt-1 text-sm text-white/75">{s.description}</p>}
                </div>
              ))}
            </div>
          )}

          {campus.equipements.length > 0 && (
            <div className="mt-14">
              <h3 className="font-heading text-[24px] font-semibold text-dark">Équipements</h3>
              <ul className="mt-5 flex flex-wrap gap-3">
                {campus.equipements.map((e) => (
                  <li key={e} className="rounded-full border border-line bg-white px-5 py-2 text-[15px] text-body">
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {campus.mapEmbedUrl && (
            <div className="mt-14 overflow-hidden rounded-lg border border-line">
              <iframe src={campus.mapEmbedUrl} title={`Carte – ${campus.nom}`} loading="lazy" className="h-[380px] w-full border-0" />
            </div>
          )}
        </Container>
      </section>

      {campus.programmes.length > 0 && (
        <section className="bg-surface py-16 lg:py-[100px]">
          <Container>
            <div className="mb-12 max-w-3xl">
              <SectionLabel>Programmes &amp; Études</SectionLabel>
              <h2 className="section-title">Formations &amp; Programmes</h2>
            </div>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {campus.programmes.slice(0, 6).map((p) => (
                <ProgramCard
                  key={p.id}
                  variant="tile"
                  titre={p.titre}
                  slug={p.slug}
                  niveau={p.niveau}
                  duree={p.duree}
                  accroche={p.accroche}
                  description={p.description}
                  image={p.image}
                  departement={p.departement}
                />
              ))}
            </div>
            {campus.programmes.length > 6 && (
              <div className="mt-10 text-center">
                <Button href={`/formations?campus=${campus.slug}`} arrow>
                  Voir les {campus.programmes.length} formations du campus
                </Button>
              </div>
            )}
          </Container>
        </section>
      )}

      {campus.personnes.length > 0 && (
        <section className="bg-white py-16 lg:py-[100px]">
          <Container>
            <h2 className="section-title mb-10">L&apos;équipe du campus</h2>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {campus.personnes.map((p) => (
                <TeamCard
                  key={p.id}
                  prenom={p.prenom}
                  nom={p.nom}
                  slug={p.slug}
                  poste={p.poste}
                  photo={p.photo}
                  email={p.email}
                  telephone={p.telephone}
                  linkedin={p.linkedin}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {campus.evenements.length > 0 && (
        <section className="bg-surface py-16 lg:py-[100px]">
          <Container>
            <h2 className="section-title mb-10">Prochains événements sur ce campus</h2>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {campus.evenements.map((e) => (
                <EventCard key={e.id} titre={e.titre} slug={e.slug} description={e.description} image={e.image} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {galerie.length > 1 && <GallerySection images={galerie} categories={[]} />}

      <TestimonialsSection
        testimonials={testimonials.map((t) => ({ nom: t.nom, role: t.role, contenu: t.contenu, photo: t.photo, note: t.note, entreprise: t.entreprise }))}
        label="Commentaires des étudiants"
        title="Le parcours de nos diplômés"
        description="Inscrivez-vous dès maintenant pour commencer votre parcours académique transformateur avec nous."
        variant="surface"
      />

      {autres.length > 0 && (
        <section className="bg-white py-16 lg:py-[100px]">
          <Container>
            <h2 className="section-title mb-10">Nos autres campus</h2>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {autres.map((c) => (
                <CampusCardLite key={c.id} nom={c.nom} slug={c.slug} image={c.image} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function CampusCardLite({ nom, slug, image }: { nom: string; slug: string; image?: string | null }) {
  return (
    <a href={`/campus/${slug}`} className="group relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-lg bg-primary p-[30px]">
      <Image src={image || "/media/img-9163.jpg"} alt="" fill sizes="33vw" className="-z-10 object-cover transition duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 -z-10 bg-gradient-to-b from-night/0 via-night/20 to-night/90" aria-hidden />
      <h4 className="font-heading text-[22px] font-semibold text-white">{nom}</h4>
    </a>
  );
}

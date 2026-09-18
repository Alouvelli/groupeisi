import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { EventCard } from "@/components/cards/EventCard";
import { getEvenementBySlug, getEvenements, getSettings } from "@/lib/data";
import { absoluteUrl, formatDate } from "@/lib/utils";
import { AnimatedHeading, ReadingProgress } from "@/components/motion";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvenementBySlug(slug);
  if (!e) return { title: "Évènement introuvable" };
  return {
    title: e.titre,
    description: e.description.slice(0, 160),
    alternates: { canonical: `/evenements/${e.slug}` },
    openGraph: { title: e.titre, description: e.description.slice(0, 160), images: e.image ? [{ url: e.image }] : undefined },
  };
}

export default async function EvenementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [evenement, settings] = await Promise.all([getEvenementBySlug(slug), getSettings()]);
  if (!evenement) notFound();
  const autres = (await getEvenements({ take: 4 })).filter((e) => e.slug !== evenement.slug).slice(0, 3);

  const debut = new Date(evenement.dateDebut);
  const fin = evenement.dateFin ? new Date(evenement.dateFin) : null;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evenement.titre)}&dates=${debut
    .toISOString()
    .replace(/[-:]|\.\d{3}/g, "")}/${(fin ?? debut).toISOString().replace(/[-:]|\.\d{3}/g, "")}&details=${encodeURIComponent(
    evenement.description,
  )}&location=${encodeURIComponent(evenement.lieu ?? "")}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: evenement.titre,
    description: evenement.description,
    startDate: debut.toISOString(),
    endDate: (fin ?? debut).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: evenement.lieu ?? settings.siteName, address: evenement.lieu ?? "" },
    image: evenement.image ? absoluteUrl(evenement.image) : undefined,
    organizer: { "@type": "Organization", name: settings.siteName, url: absoluteUrl("/") },
    url: absoluteUrl(`/evenements/${evenement.slug}`),
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader
        title={evenement.titre}
        items={[{ label: "Évènements", href: "/evenements" }, { label: evenement.titre }]}
        image={evenement.image}
      />

      <section className="bg-white section-y">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <div>
              {evenement.image && (
                <Image src={evenement.image} alt={evenement.titre} width={1100} height={640} className="mb-10 h-auto w-full rounded-lg object-cover" priority />
              )}
              <AnimatedHeading className="section-title">{evenement.titre}</AnimatedHeading>
              <p className="mt-5 text-base leading-7 text-body">{evenement.description}</p>
              {evenement.contenu && <div className="prose-isi mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: evenement.contenu }} />}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-lg border border-line bg-surface p-7">
                <ul className="space-y-4 text-[15px]">
                  <li className="flex gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="block font-medium text-dark">Date</span>
                      {formatDate(evenement.dateDebut)}
                    </span>
                  </li>
                  {evenement.heure && (
                    <li className="flex gap-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        <span className="block font-medium text-dark">Horaires</span>
                        {evenement.heure}
                      </span>
                    </li>
                  )}
                  {evenement.lieu && (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        <span className="block font-medium text-dark">Lieu</span>
                        {evenement.lieu}
                      </span>
                    </li>
                  )}
                </ul>
                <Button href={evenement.lienInscription ?? gcal} external className="mt-7 w-full" arrow>
                  S&apos;inscrire à l&apos;événement
                </Button>
              </div>

              {evenement.lieu && (
                <div className="overflow-hidden rounded-lg border border-line">
                  <h3 className="border-b border-line px-6 py-4 font-heading text-[18px] font-semibold text-dark">Trouver le lieu</h3>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(evenement.lieu)}&t=m&z=14&output=embed&iwloc=near`}
                    title={`Carte – ${evenement.lieu}`}
                    loading="lazy"
                    className="h-[260px] w-full border-0"
                  />
                </div>
              )}

              <div className="rounded-lg border border-line p-7">
                <h3 className="font-heading text-[18px] font-semibold text-dark">Nous suivre</h3>
                <SocialLinks socials={settings} className="mt-4" itemClassName="bg-surface text-primary" />
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {autres.length > 0 && (
        <section className="bg-surface section-y">
          <Container>
            <AnimatedHeading className="section-title mb-7">Autres évènements</AnimatedHeading>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {autres.map((e) => (
                <EventCard key={e.id} titre={e.titre} slug={e.slug} description={e.description} image={e.image} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

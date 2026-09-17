import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, ArrowRight, CalendarPlus, Building2 } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EventCard } from "@/components/cards/EventCard";
import { getEvenementBySlug, getEvenements } from "@/lib/data";
import { formatDate, absoluteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = await getEvenementBySlug(slug);
  if (!e) return { title: "Événement introuvable" };
  return { title: e.titre, description: e.description, openGraph: { images: e.image ? [e.image] : undefined } };
}

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export default async function EvenementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = await getEvenementBySlug(slug);
  if (!e) notFound();
  const others = (await getEvenements({ upcoming: true, take: 4 })).filter((x) => x.id !== e.id).slice(0, 3);
  const isPast = e.dateDebut.getTime() < Date.now() - 24 * 3600 * 1000;
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(e.titre)}&dates=${icsDate(e.dateDebut)}/${icsDate(e.dateFin ?? new Date(e.dateDebut.getTime() + 2 * 3600 * 1000))}&details=${encodeURIComponent(e.description)}&location=${encodeURIComponent(e.lieu ?? "")}`;
  const jsonLd = { "@context": "https://schema.org", "@type": "Event", name: e.titre, description: e.description, startDate: e.dateDebut.toISOString(), endDate: e.dateFin?.toISOString(), image: e.image, location: { "@type": "Place", name: e.lieu ?? e.campus?.nom, address: e.campus?.adresse }, organizer: { "@type": "Organization", name: "Groupe ISI", url: absoluteUrl("/") } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title={e.titre} subtitle={e.type ?? undefined} items={[{ label: "Événements", href: "/evenements" }, { label: e.titre }]} image={e.image} />
      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {isPast && <Badge variant="neutral" className="mb-4">Événement terminé</Badge>}
            {e.image && <div className="relative aspect-[16/9] overflow-hidden rounded-3xl"><Image src={e.image} alt={e.titre} fill sizes="66vw" className="object-cover" priority /></div>}
            <p className="mt-8 text-lg font-semibold text-slate-700">{e.description}</p>
            {e.contenu && <div className="prose-isi mt-4" dangerouslySetInnerHTML={{ __html: e.contenu }} />}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line bg-white p-6 shadow-soft">
              <h3 className="text-lg font-extrabold text-primary">Informations pratiques</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <span><strong>{formatDate(e.dateDebut, "EEEE d MMMM yyyy")}</strong>{e.dateFin && e.dateFin.toDateString() !== e.dateDebut.toDateString() && <> au <strong>{formatDate(e.dateFin, "EEEE d MMMM yyyy")}</strong></>}</span></li>
                {e.heure && <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {e.heure}</li>}
                {e.lieu && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {e.lieu}</li>}
                {e.campus && <li className="flex gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <span>{e.campus.nom}<br /><span className="text-muted">{e.campus.adresse}</span></span></li>}
              </ul>
              {!isPast && e.lienInscription && <Button href={e.lienInscription} variant="secondary" className="mt-6 w-full">S&apos;inscrire à l&apos;événement <ArrowRight className="h-4 w-4" /></Button>}
              {!isPast && <Button href={gcal} external variant="outline" className="mt-2 w-full"><CalendarPlus className="h-4 w-4" /> Ajouter à mon agenda</Button>}
            </div>
          </aside>
        </div>
      </Section>
      {others.length > 0 && (
        <Section variant="surface" padding="lg">
          <SectionHeading label="Agenda" title="Autres événements à venir" />
          <div className="grid gap-6 md:grid-cols-3">{others.map((o) => <EventCard key={o.id} titre={o.titre} slug={o.slug} description={o.description} image={o.image} dateDebut={o.dateDebut} heure={o.heure} lieu={o.lieu} type={o.type} />)}</div>
        </Section>
      )}
    </>
  );
}

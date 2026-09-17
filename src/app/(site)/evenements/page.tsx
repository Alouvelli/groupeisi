import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Tabs";
import { EventCard } from "@/components/cards/EventCard";
import { getEvenements } from "@/lib/data";

export const metadata: Metadata = { title: "Événements", description: "Agenda du Groupe ISI : journées portes ouvertes, conférences, ateliers, forums entreprises et cérémonies." };

export default async function EvenementsPage() {
  const all = await getEvenements();
  const now = Date.now() - 24 * 3600 * 1000;
  const upcoming = all.filter((e) => e.dateDebut.getTime() >= now).sort((a, b) => a.dateDebut.getTime() - b.dateDebut.getTime());
  const past = all.filter((e) => e.dateDebut.getTime() < now);
  const grid = (list: typeof all) => (list.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((e) => <EventCard key={e.id} titre={e.titre} slug={e.slug} description={e.description} image={e.image} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} />)}</div> : <p className="rounded-card border border-dashed border-line p-12 text-center text-muted">Aucun événement pour le moment.</p>);
  return (
    <>
      <PageHeader title="Événements" subtitle="Journées portes ouvertes, conférences, ateliers, forums : retrouvez tout l'agenda du Groupe ISI." items={[{ label: "Actualités", href: "/actualites" }, { label: "Événements" }]} />
      <Section padding="lg">
        <SectionHeading label="Agenda" title="Nos prochains rendez-vous" />
        <Tabs tabs={[{ id: "upcoming", label: "À venir", count: upcoming.length, content: grid(upcoming) }, { id: "past", label: "Passés", count: past.length, content: grid(past) }]} />
      </Section>
    </>
  );
}

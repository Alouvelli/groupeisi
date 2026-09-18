import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { EventCard } from "@/components/cards/EventCard";
import { getEvenements } from "@/lib/data";

export const metadata: Metadata = {
  title: "Évènements",
  description: "L'agenda du Groupe ISI : cérémonies, journées portes ouvertes, conférences, hackathons et rencontres avec les entreprises.",
};

export default async function EvenementsPage() {
  const all = await getEvenements();
  const now = Date.now() - 24 * 3600 * 1000;
  const aVenir = all.filter((e) => new Date(e.dateDebut).getTime() >= now).sort((a, b) => +new Date(a.dateDebut) - +new Date(b.dateDebut));
  const passes = all.filter((e) => new Date(e.dateDebut).getTime() < now);

  return (
    <>
      <PageHeader
        title="Évènements"
        subtitle="Cérémonies, portes ouvertes, conférences et rencontres : retrouvez tous les rendez-vous du Groupe ISI."
        items={[{ label: "Évènements" }]}
        image="/media/img-1714-1.jpg"
      />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Evènements à venir</SectionLabel>
            <h2 className="section-title">Assistez à nos prochains évènements</h2>
          </div>

          {aVenir.length === 0 ? (
            <div className="rounded-lg border border-dashed border-line p-12 text-center text-body">
              Aucun événement à venir pour le moment. Consultez nos actualités pour suivre la vie de l&apos;institut.
            </div>
          ) : (
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {aVenir.map((e) => (
                <EventCard key={e.id} titre={e.titre} slug={e.slug} description={e.description} image={e.image} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {passes.length > 0 && (
        <section className="bg-surface py-16 lg:py-[100px]">
          <Container>
            <h2 className="section-title mb-10">Évènements passés</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {passes.map((e) => (
                <EventCard key={e.id} variant="row" titre={e.titre} slug={e.slug} image={e.image} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

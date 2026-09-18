import { EventCard, type EventCardProps } from "@/components/cards/EventCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

/**
 * Section « Assistez à nos prochains évènements » : fond beige,
 * titre à gauche, bouton à droite, trois cartes d'événements.
 */
export function EventsSection({
  events,
  label = "Evènements à venir",
  title = "Assistez à nos prochains évènements",
  href = "/evenements",
  cta = "Voir plus d'évènements",
}: {
  events: EventCardProps[];
  label?: string;
  title?: string;
  href?: string;
  cta?: string;
}) {
  if (!events.length) return null;
  return (
    <section className="bg-surface section-y">
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>{label}</SectionLabel>
            <AnimatedHeading className="section-title">{title}</AnimatedHeading>
          </div>
          <Button href={href} arrow className="shrink-0">
            {cta}
          </Button>
        </div>
        <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((e) => (
            <EventCard key={e.slug} {...e} />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

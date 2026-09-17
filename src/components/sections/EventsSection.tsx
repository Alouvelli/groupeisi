import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { EventCard, type EventCardProps, DateBadge } from "@/components/cards/EventCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function EventsSection({ events }: { events: EventCardProps[] }) {
  if (!events.length) return null;
  const [main, ...rest] = events;
  return (
    <Section variant="surface" padding="lg" id="evenements">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading label="Agenda" title="Événements à venir" align="left" className="mb-0" />
        <Button href="/evenements" variant="outline" className="shrink-0">Tout l&apos;agenda <CalendarDays className="h-4 w-4" /></Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Link href={`/evenements/${main.slug}`} className="group relative block h-full min-h-[380px] overflow-hidden rounded-card">
            <Image src={main.image || "/images/placeholder.svg"} alt={main.titre} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/50 to-transparent" aria-hidden />
            <DateBadge date={main.dateDebut} className="absolute left-6 top-6 w-20" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white">
              {main.type && <span className="text-xs font-bold uppercase tracking-widest text-accent">{main.type}</span>}
              <h3 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">{main.titre}</h3>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm text-white/80">{main.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent">En savoir plus <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </Link>
        </Reveal>
        <div className="flex flex-col gap-4">
          {rest.slice(0, 4).map((e, i) => (
            <Reveal key={e.slug} delay={i * 0.08}>
              <EventCard {...e} variant="row" />
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

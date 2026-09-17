import { Section, SectionHeading } from "@/components/ui/Section";
import { PartenaireLogo } from "@/components/cards/PartenaireLogo";

export function PartnersSection({ partenaires, compact = false }: { partenaires: { id: string; nom: string; logo: string; url?: string | null }[]; compact?: boolean }) {
  if (!partenaires.length) return null;
  const doubled = [...partenaires, ...partenaires];
  return (
    <Section variant="surface" padding={compact ? "sm" : "md"} id="partenaires" container={false} className="overflow-hidden">
      {!compact && <SectionHeading label="Partenaires" title="Ils nous font confiance" description="Entreprises, institutions et universités partenaires du Groupe ISI." />}
      <div className="relative" aria-label="Logos des partenaires">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-surface to-transparent" aria-hidden />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-surface to-transparent" aria-hidden />
        <div className="flex w-max gap-6 animate-marquee hover:[animation-play-state:paused]">
          {doubled.map((p, i) => (
            <PartenaireLogo key={`${p.id}-${i}`} {...p} />
          ))}
        </div>
      </div>
    </Section>
  );
}

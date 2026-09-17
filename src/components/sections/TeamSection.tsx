import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { TeamCard } from "@/components/cards/TeamCard";
import { Button } from "@/components/ui/Button";

export function TeamSection({ members }: { members: { id: string; prenom: string; nom: string; slug: string; poste: string; photo?: string | null; email?: string | null; linkedin?: string | null; departement?: { nom: string } | null }[] }) {
  if (!members.length) return null;
  return (
    <Section variant="surface" padding="lg" id="equipe">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading label="Notre équipe" title="Une direction et des enseignants engagés" align="left" className="mb-0" />
        <Button href="/equipe" variant="outline" className="shrink-0">Toute l&apos;équipe <ArrowRight className="h-4 w-4" /></Button>
      </div>
      <Stagger className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {members.map((m) => (
          <StaggerItem key={m.id}>
            <TeamCard {...m} departement={m.departement?.nom} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { DepartmentCard, type DepartmentCardProps } from "@/components/cards/DepartmentCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function DepartementsSection({ departements }: { departements: DepartmentCardProps[] }) {
  return (
    <Section variant="surface" padding="lg" id="departements">
      <SectionHeading label="Nos départements" title="Quatre pôles d'excellence pour construire votre avenir" description="Informatique, réseaux et systèmes, management, formation continue : des parcours complets et professionnalisants du BTS au Master." />
      <Stagger className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {departements.map((d) => (
          <StaggerItem key={d.slug}>
            <DepartmentCard {...d} />
          </StaggerItem>
        ))}
      </Stagger>
      <div className="mt-10 text-center">
        <Button href="/departements" variant="outline">Tous les départements <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </Section>
  );
}

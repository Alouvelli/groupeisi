import { ArrowRight, MapPin } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { CampusCard, type CampusCardProps } from "@/components/cards/CampusCard";
import { Button } from "@/components/ui/Button";

export function CampusSection({ campus }: { campus: CampusCardProps[] }) {
  const featured = campus.slice(0, 3);
  const others = campus.slice(3);
  return (
    <Section variant="surface" padding="lg" id="campus">
      <SectionHeading label="Nos campus" title="9 campus au Sénégal et en Mauritanie" description="Dakar, Keur Massar, Pikine, Kaolack, Kaffrine, Diourbel, Nouakchott, Nouadhibou : une formation de qualité près de chez vous." />
      <Stagger className="grid gap-6 md:grid-cols-3">
        {featured.map((c) => (
          <StaggerItem key={c.slug}>
            <CampusCard {...c} />
          </StaggerItem>
        ))}
      </Stagger>
      {others.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {others.map((c) => (
            <Button key={c.slug} href={`/campus/${c.slug}`} variant="white" size="sm" className="shadow-soft">
              <MapPin className="h-3.5 w-3.5 text-secondary" /> {c.ville}
            </Button>
          ))}
        </div>
      )}
      <div className="mt-10 text-center">
        <Button href="/campus" variant="outline">Découvrir tous les campus <ArrowRight className="h-4 w-4" /></Button>
      </div>
    </Section>
  );
}

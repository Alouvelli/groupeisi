import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Carousel } from "@/components/ui/Carousel";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { Button } from "@/components/ui/Button";
import type { Alumni } from "@prisma/client";

export function AlumniSection({ alumni }: { alumni: Alumni[] }) {
  if (!alumni.length) return null;
  return (
    <Section variant="white" padding="lg" id="alumni" className="overflow-hidden">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading label="Alumni" title="Nos diplômés brillent dans les meilleures entreprises" align="left" className="mb-0" />
        <Button href="/alumni" variant="outline" className="shrink-0">Le réseau alumni <ArrowRight className="h-4 w-4" /></Button>
      </div>
      <Carousel itemClassName="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" showDots={false} ariaLabel="Alumni">
        {alumni.map((a) => (
          <AlumniCard key={a.id} {...a} />
        ))}
      </Carousel>
    </Section>
  );
}

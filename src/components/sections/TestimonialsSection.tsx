import { Section, SectionHeading } from "@/components/ui/Section";
import { Carousel } from "@/components/ui/Carousel";
import { TestimonialCard } from "@/components/cards/TestimonialCard";

export function TestimonialsSection({ testimonials }: { testimonials: { id: string; nom: string; role: string; contenu: string; photo?: string | null; note: number }[] }) {
  if (!testimonials.length) return null;
  return (
    <Section variant="white" padding="lg" id="temoignages" className="overflow-hidden">
      <SectionHeading label="Témoignages" title="Ils parlent du Groupe ISI" description="Étudiants, diplômés, parents et entreprises partagent leur expérience." />
      <Carousel autoplay={6000} itemClassName="w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]" ariaLabel="Témoignages">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} {...t} />
        ))}
      </Carousel>
    </Section>
  );
}

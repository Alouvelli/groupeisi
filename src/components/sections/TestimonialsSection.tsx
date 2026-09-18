"use client";

import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Carousel } from "@/components/ui/Carousel";

export interface TestimonialItem {
  nom: string;
  role: string;
  contenu: string;
  photo?: string | null;
  note?: number;
  entreprise?: string | null;
}

/**
 * Section « Le parcours de nos diplômés » : carrousel de témoignages
 * (trois cartes visibles sur grand écran).
 */
export function TestimonialsSection({
  testimonials,
  label = "Feedback de nos étudiants",
  title = "Le parcours de nos diplômés",
  description = "Un aperçu de la manière dont nos étudiants développent et transforment leurs compétences pour avoir un impact.",
  variant = "white",
}: {
  testimonials: TestimonialItem[];
  label?: string;
  title?: string;
  description?: string;
  variant?: "white" | "surface";
}) {
  if (!testimonials.length) return null;
  return (
    <section className={variant === "surface" ? "bg-surface py-16 sm:py-20 lg:py-[100px]" : "bg-white py-16 sm:py-20 lg:py-[100px]"}>
      <Container>
        <div className="mb-12 max-w-3xl">
          <SectionLabel>{label}</SectionLabel>
          <h2 className="section-title">{title}</h2>
          {description && <p className="mt-4 text-base leading-7 text-body">{description}</p>}
        </div>
        <Carousel ariaLabel="Témoignages" itemClassName="w-[88%] sm:w-[48%] lg:w-[32.3%]" autoplay={7000}>
          {testimonials.map((t) => (
            <TestimonialCard key={t.nom + t.role} {...t} note={t.note ?? 5} />
          ))}
        </Carousel>
      </Container>
    </section>
  );
}

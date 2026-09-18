import { CampusCard, type CampusCardProps } from "@/components/cards/CampusCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

/**
 * Section « Campus & Annexes » de l'accueil : fond bleu, titre centré
 * et grille de vignettes photo (trois colonnes).
 */
export function CampusSection({
  campus,
  label = "Nos Campus",
  title = "Campus & Annexes",
  description,
}: {
  campus: CampusCardProps[];
  label?: string;
  title?: string;
  description?: string;
}) {
  if (!campus.length) return null;
  return (
    <section className="relative overflow-hidden bg-primary section-y">
      <Container>
        <div className="mb-8 max-w-3xl lg:mb-10">
          <SectionLabel light>{label}</SectionLabel>
          <AnimatedHeading className="section-title text-white">{title}</AnimatedHeading>
          {description && <p className="mt-4 text-base leading-7 text-white/80">{description}</p>}
        </div>
        <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-3">
          {campus.map((c) => (
            <CampusCard key={c.slug} {...c} />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

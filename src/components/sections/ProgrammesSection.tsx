import { ProgramCard, type ProgramCardProps } from "@/components/cards/ProgramCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

/**
 * Section « Programmes & Formations » de l'accueil : fond bleu,
 * intitulé à gauche, bouton à droite, grille de deux colonnes.
 */
export function ProgrammesSection({
  programmes,
  label = "Programmes & Formations",
  title = "Programmes & Formations",
  href = "/formations",
  cta = "Voir toutes nos Formations",
}: {
  programmes: ProgramCardProps[];
  label?: string;
  title?: string;
  href?: string;
  cta?: string;
}) {
  if (!programmes.length) return null;
  return (
    <section className="relative overflow-hidden bg-primary section-y">
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel light>{label}</SectionLabel>
            <AnimatedHeading className="section-title text-white">{title}</AnimatedHeading>
          </div>
          <Button href={href} variant="secondary" arrow className="shrink-0">
            {cta}
          </Button>
        </div>

        <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => (
            <ProgramCard key={p.slug} {...p} variant="tile" />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

import { ProgramCard, type ProgramCardProps } from "@/components/cards/ProgramCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

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
    <section className="relative overflow-hidden bg-primary py-16 sm:py-20 lg:py-[100px]">
      <Container>
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel light>{label}</SectionLabel>
            <h2 className="section-title text-white">{title}</h2>
          </div>
          <Button href={href} variant="secondary" arrow className="shrink-0">
            {cta}
          </Button>
        </div>

        <div className="grid gap-[30px] lg:grid-cols-2">
          {programmes.map((p) => (
            <ProgramCard key={p.slug} {...p} />
          ))}
        </div>
      </Container>
    </section>
  );
}

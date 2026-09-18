import { CampusCard, type CampusCardProps } from "@/components/cards/CampusCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";

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
    <section className="relative overflow-hidden bg-primary py-16 sm:py-20 lg:py-[100px]">
      <Container>
        <div className="mb-12 max-w-3xl">
          <SectionLabel light>{label}</SectionLabel>
          <h2 className="section-title text-white">{title}</h2>
          {description && <p className="mt-4 text-base leading-7 text-white/80">{description}</p>}
        </div>
        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
          {campus.map((c) => (
            <CampusCard key={c.slug} {...c} />
          ))}
        </div>
      </Container>
    </section>
  );
}

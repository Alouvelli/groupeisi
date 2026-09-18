import { NewsCard, type NewsCardProps } from "@/components/cards/NewsCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

/**
 * Section « Voir nos dernières actualités » : fond beige,
 * titre à gauche, bouton à droite, quatre cartes d'articles.
 */
export function NewsSection({
  posts,
  label = "Blog & Actualités",
  title = "Voir nos dernières actualités",
  href = "/actualites",
  cta = "Voir plus",
  variant = "surface",
}: {
  posts: NewsCardProps[];
  label?: string;
  title?: string;
  href?: string;
  cta?: string;
  variant?: "surface" | "white";
}) {
  if (!posts.length) return null;
  return (
    <section className={variant === "surface" ? "bg-surface section-y" : "bg-white section-y"}>
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>{label}</SectionLabel>
            <AnimatedHeading className="section-title">{title}</AnimatedHeading>
          </div>
          <Button href={href} arrow className="shrink-0">
            {cta}
          </Button>
        </div>
        <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((p) => (
            <NewsCard key={p.slug} {...p} />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

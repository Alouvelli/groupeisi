import { NewsCard, type NewsCardProps } from "@/components/cards/NewsCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

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
    <section className={variant === "surface" ? "bg-surface py-16 sm:py-20 lg:py-[100px]" : "bg-white py-16 sm:py-20 lg:py-[100px]"}>
      <Container>
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>{label}</SectionLabel>
            <h2 className="section-title">{title}</h2>
          </div>
          <Button href={href} arrow className="shrink-0">
            {cta}
          </Button>
        </div>
        <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
          {posts.slice(0, 4).map((p) => (
            <NewsCard key={p.slug} {...p} />
          ))}
        </div>
      </Container>
    </section>
  );
}

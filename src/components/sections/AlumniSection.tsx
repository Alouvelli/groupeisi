import { AlumniCard } from "@/components/cards/AlumniCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

export interface AlumniItem {
  prenom: string;
  nom: string;
  slug: string;
  promotion?: number | null;
  programme?: string | null;
  poste?: string | null;
  entreprise?: string | null;
  ville?: string | null;
  pays?: string | null;
  photo?: string | null;
  temoignage?: string | null;
}

/** Section « Nos Alumnis » : trois portraits d'anciens étudiants. */
export function AlumniSection({
  alumni,
  label = "Nos Alumnis",
  title = "Nos Alumnis",
  description,
  href = "/alumnis",
  cta = "Voir tous nos alumnis",
  variant = "white",
}: {
  alumni: AlumniItem[];
  label?: string;
  title?: string;
  description?: string;
  href?: string;
  cta?: string;
  variant?: "white" | "surface";
}) {
  if (!alumni.length) return null;
  return (
    <section className={variant === "surface" ? "bg-surface section-y" : "bg-white section-y"}>
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <SectionLabel>{label}</SectionLabel>
            <AnimatedHeading className="section-title">{title}</AnimatedHeading>
            {description && <p className="mt-4 text-base leading-7 text-body">{description}</p>}
          </div>
          <Button href={href} arrow className="shrink-0">
            {cta}
          </Button>
        </div>
        <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((a) => (
            <AlumniCard key={a.slug} {...a} />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

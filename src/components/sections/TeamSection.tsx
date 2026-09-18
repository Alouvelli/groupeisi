import { TeamCard } from "@/components/cards/TeamCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

export interface TeamMember {
  prenom: string;
  nom: string;
  slug: string;
  poste: string;
  photo?: string | null;
  email?: string | null;
  telephone?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  departement?: { nom: string } | string | null;
}

/**
 * Section « Nos chefs de département » : fond blanc, titre à gauche,
 * bouton à droite, trois cartes de membres.
 */
export function TeamSection({
  members,
  label = "Nos Chefs de département",
  title = "Nos chefs de département",
  href = "/equipe",
  cta = "Voir nos chefs de département",
  columns = 3,
}: {
  members: TeamMember[];
  label?: string;
  title?: string;
  href?: string;
  cta?: string;
  columns?: 3 | 4;
}) {
  if (!members.length) return null;
  return (
    <section className="bg-white section-y">
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
        <StaggerChildren className={`rail sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {members.map((m) => (
            <TeamCard
              key={m.slug}
              {...m}
              departement={typeof m.departement === "string" ? m.departement : m.departement?.nom ?? null}
            />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

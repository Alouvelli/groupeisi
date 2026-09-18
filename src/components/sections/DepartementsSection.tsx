import { DepartmentCard, type DepartmentCardProps } from "@/components/cards/DepartmentCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";

/** Section « Nos départements » : quatre cartes départements. */
export function DepartementsSection({
  departements,
  label = "Nos départements",
  title = "Quatre départements pédagogiques",
  description,
  href,
  cta,
  variant = "surface",
}: {
  departements: DepartmentCardProps[];
  label?: string;
  title?: string;
  description?: string;
  href?: string;
  cta?: string;
  variant?: "white" | "surface";
}) {
  if (!departements.length) return null;
  return (
    <section className={variant === "surface" ? "bg-surface section-y" : "bg-white section-y"}>
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <SectionLabel>{label}</SectionLabel>
            <AnimatedHeading className="section-title">{title}</AnimatedHeading>
            {description && <p className="mt-4 text-base leading-7 text-body">{description}</p>}
          </div>
          {href && cta && (
            <Button href={href} arrow className="shrink-0">
              {cta}
            </Button>
          )}
        </div>
        <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-4">
          {departements.map((d) => (
            <DepartmentCard key={d.slug} {...d} />
          ))}
        </StaggerChildren>
      </Container>
    </section>
  );
}

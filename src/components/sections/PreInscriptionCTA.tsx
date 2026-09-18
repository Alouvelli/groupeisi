import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { InfoRequestForm } from "@/components/forms/InfoRequestForm";
import { AnimatedHeading, Reveal } from "@/components/motion";

/**
 * Section « Les inscriptions sont ouvertes » : grande photo de fond,
 * titre puis formulaire de demande d'information dans une carte blanche.
 */
export function PreInscriptionCTA({
  label = "Inscrivez-vous maintenant",
  title = "Les inscriptions sont ouvertes",
  description,
  image = "/media/img-2298-1.jpg",
  formations = [],
  campus = [],
  anneeAcademique,
  ouvertes = true,
}: {
  label?: string;
  title?: string;
  description?: string;
  image?: string;
  formations?: { id: string; titre: string }[];
  campus?: { id: string; nom: string }[];
  anneeAcademique?: string;
  ouvertes?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden section-y">
      <Image src={image} alt="" fill sizes="100vw" className="-z-10 object-cover object-center" />
      <span className="absolute inset-0 -z-10 bg-white/92" aria-hidden />
      <Container>
        <div className="mb-10 text-center">
          <SectionLabel className="justify-center">{label}</SectionLabel>
          <AnimatedHeading className="section-title">{ouvertes ? title : "Les inscriptions ouvriront prochainement"}</AnimatedHeading>
          {anneeAcademique && (
            <Reveal delay={0.25}>
              <span className="mt-1 block font-heading text-[0.62em] font-medium text-body">Année académique {anneeAcademique}</span>
            </Reveal>
          )}
          {description && <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-body">{description}</p>}
        </div>

        <div className="mx-auto max-w-4xl rounded-xl bg-white p-6 shadow-card sm:p-10">
          <InfoRequestForm formations={formations} campus={campus} />
        </div>
      </Container>
    </section>
  );
}

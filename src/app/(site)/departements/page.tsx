import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { DepartmentCard } from "@/components/cards/DepartmentCard";
import { PreInscriptionCTA } from "@/components/sections/PreInscriptionCTA";
import { getDepartements, getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Départements", description: "Les départements du Groupe ISI : Génie Informatique, Réseaux et Systèmes, Management et Administration, Formation Continue." };

export default async function DepartementsPage() {
  const [departements, settings] = await Promise.all([getDepartements(), getSettings()]);
  return (
    <>
      <PageHeader title="Nos départements" subtitle="Quatre pôles d'excellence couvrant l'ensemble des métiers du numérique et du management." items={[{ label: "L'École" }, { label: "Départements" }]} />
      <Section padding="lg">
        <SectionHeading label="Départements" title="Des parcours complets du BTS au Master" description="Chaque département regroupe des formations cohérentes, encadrées par des enseignants experts et des professionnels du secteur." />
        <Stagger className="grid gap-6 sm:grid-cols-2">
          {departements.map((d) => (
            <StaggerItem key={d.id}>
              <DepartmentCard nom={d.nom} slug={d.slug} accroche={d.accroche} description={d.description} icone={d.icone} couleur={d.couleur} programmesCount={d._count.programmes} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>
      <PreInscriptionCTA anneeAcademique={settings.anneeAcademique} phone={settings.phone2 ?? settings.phone} ouvertes={settings.inscriptionsOuvertes} />
    </>
  );
}

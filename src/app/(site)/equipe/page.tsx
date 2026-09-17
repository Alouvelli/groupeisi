import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { TeamCard } from "@/components/cards/TeamCard";
import { getPersonnes } from "@/lib/data";

export const metadata: Metadata = { title: "Équipe pédagogique", description: "Direction, enseignants et personnel administratif du Groupe ISI." };

const groups = [{ type: "DIRECTION", title: "La direction", label: "Gouvernance" }, { type: "ENSEIGNANT", title: "Le corps enseignant", label: "Pédagogie" }, { type: "ADMINISTRATION", title: "L'équipe administrative", label: "Services" }] as const;

export default async function EquipePage() {
  const all = await getPersonnes();
  return (
    <>
      <PageHeader title="Notre équipe" subtitle="Une direction expérimentée, des enseignants experts et des équipes administratives à votre écoute." items={[{ label: "L'École" }, { label: "Équipe" }]} />
      {groups.map((g, i) => {
        const members = all.filter((p) => p.type === g.type);
        if (!members.length) return null;
        return (
          <Section key={g.type} variant={i % 2 ? "surface" : "white"} padding="md">
            <SectionHeading label={g.label} title={g.title} align="left" />
            <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {members.map((m) => (
                <StaggerItem key={m.id}><TeamCard prenom={m.prenom} nom={m.nom} slug={m.slug} poste={m.poste} photo={m.photo} email={m.email} linkedin={m.linkedin} departement={m.departement?.nom ?? m.campus?.nom} /></StaggerItem>
              ))}
            </Stagger>
          </Section>
        );
      })}
    </>
  );
}

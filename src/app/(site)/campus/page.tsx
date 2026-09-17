import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { CampusCard } from "@/components/cards/CampusCard";
import { getCampus } from "@/lib/data";

export const metadata: Metadata = { title: "Nos campus", description: "Les 9 campus du Groupe ISI au Sénégal (Dakar, Keur Massar, Pikine, Kaolack, Kaffrine, Diourbel) et en Mauritanie (Nouakchott, Nouadhibou)." };

export default async function CampusListPage() {
  const campus = await getCampus();
  const groups = [
    { title: "Dakar et banlieue", items: campus.filter((c) => ["Dakar", "Keur Massar", "Pikine", "Rufisque", "Guédiawaye"].includes(c.ville)) },
    { title: "Régions du Sénégal", items: campus.filter((c) => c.pays === "Sénégal" && !["Dakar", "Keur Massar", "Pikine", "Rufisque", "Guédiawaye"].includes(c.ville)) },
    { title: "Mauritanie", items: campus.filter((c) => c.pays !== "Sénégal") },
  ].filter((g) => g.items.length);
  return (
    <>
      <PageHeader title="Nos campus" subtitle="9 campus modernes au Sénégal et en Mauritanie pour étudier près de chez vous." items={[{ label: "L'École" }, { label: "Campus" }]} />
      {groups.map((g, gi) => (
        <Section key={g.title} variant={gi % 2 ? "surface" : "white"} padding="md">
          <SectionHeading label="Campus" title={g.title} align="left" />
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((c) => (
              <StaggerItem key={c.id}>
                <CampusCard nom={c.nom} slug={c.slug} ville={c.ville} pays={c.pays} adresse={c.adresse} telephone={c.telephone} image={c.image} isSiege={c.isSiege} programmesCount={c._count.programmes} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ))}
    </>
  );
}

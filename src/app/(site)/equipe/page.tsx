import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { TeamCard } from "@/components/cards/TeamCard";
import { getPersonnes } from "@/lib/data";

export const metadata: Metadata = {
  title: "Notre équipe",
  description: "La direction, les chefs de département et l'équipe pédagogique du Groupe ISI.",
};

const GROUPES = [
  { type: "DIRECTION", label: "Direction", titre: "La direction du Groupe ISI" },
  { type: "ENSEIGNANT", label: "Chefs de département", titre: "Nos chefs de département" },
  { type: "ADMINISTRATION", label: "Administration", titre: "L'équipe administrative" },
] as const;

export default async function EquipePage() {
  const personnes = await getPersonnes();

  return (
    <>
      <PageHeader
        title="Notre équipe"
        subtitle="Une équipe de direction et un corps professoral qualifié, au service de la réussite des étudiants."
        items={[{ label: "Notre équipe" }]}
        image="/media/mg-9698-cr3-at-2025-copie.jpg"
      />

      {GROUPES.map(({ type, label, titre }, i) => {
        const items = personnes.filter((p) => p.type === type);
        if (!items.length) return null;
        return (
          <section key={type} className={i % 2 === 0 ? "bg-white py-16 lg:py-[100px]" : "bg-surface py-16 lg:py-[100px]"}>
            <Container>
              <div className="mb-12 max-w-3xl">
                <SectionLabel>{label}</SectionLabel>
                <h2 className="section-title">{titre}</h2>
              </div>
              <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <TeamCard
                    key={p.id}
                    prenom={p.prenom}
                    nom={p.nom}
                    slug={p.slug}
                    poste={p.poste}
                    photo={p.photo}
                    email={p.email}
                    telephone={p.telephone}
                    linkedin={p.linkedin}
                    twitter={p.twitter}
                    departement={p.departement?.nom ?? null}
                  />
                ))}
              </div>
            </Container>
          </section>
        );
      })}
    </>
  );
}

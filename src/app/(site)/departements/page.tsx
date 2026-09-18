import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { DepartementsSection } from "@/components/sections/DepartementsSection";
import { PreInscriptionCTA } from "@/components/sections/PreInscriptionCTA";
import { getDepartements, getSettings, getProgrammesForForm, getCampus } from "@/lib/data";

export const metadata: Metadata = {
  title: "Nos départements",
  description:
    "Les quatre départements pédagogiques du Groupe ISI : Génie informatique, Réseaux et Systèmes, Gestion et Management, Intelligence Artificielle et Ingénierie des Données.",
};

export default async function DepartementsPage() {
  const [departements, settings, formations, campus] = await Promise.all([
    getDepartements(),
    getSettings(),
    getProgrammesForForm(),
    getCampus(),
  ]);

  return (
    <>
      <PageHeader
        title="Nos départements"
        subtitle="Quatre départements pédagogiques couvrent l'informatique, les réseaux, la data et le management."
        items={[{ label: "Nos départements" }]}
        image="/media/mg-0002-cr3-at-2025-at-2025-copie.jpg"
      />

      <DepartementsSection
        variant="white"
        label="Départements"
        title="Quatre départements pédagogiques"
        description="Chaque département réunit des enseignants spécialisés, des laboratoires dédiés et un catalogue de formations du Bachelor au Master."
        departements={departements.map((d) => ({
          nom: d.nom,
          slug: d.slug,
          accroche: d.accroche,
          description: d.description,
          icone: d.icone,
          couleur: d.couleur,
          image: d.image,
          programmesCount: d._count.programmes,
        }))}
      />

      <PreInscriptionCTA
        anneeAcademique={settings.anneeAcademique}
        ouvertes={settings.inscriptionsOuvertes}
        formations={formations.map((f) => ({ id: f.id, titre: f.titre }))}
        campus={campus.map((c) => ({ id: c.id, nom: c.nom }))}
      />
    </>
  );
}

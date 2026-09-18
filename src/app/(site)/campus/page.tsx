import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { CampusCard } from "@/components/cards/CampusCard";
import { PreInscriptionCTA } from "@/components/sections/PreInscriptionCTA";
import { getCampus, getSettings, getProgrammesForForm } from "@/lib/data";

export const metadata: Metadata = {
  title: "Nos campus",
  description: "Les campus et annexes du Groupe ISI : Dakar, Keur Massar, SupTech, Diourbel, Kaolack, Kaffrine, Ziguinchor, Sédhiou et la Mauritanie.",
};

export default async function CampusPage() {
  const [campus, settings, formations] = await Promise.all([getCampus(), getSettings(), getProgrammesForForm()]);

  return (
    <>
      <PageHeader
        title="Nos campus"
        subtitle={`${settings.statCampus} campus au Sénégal et en Mauritanie, réunissant plus de trente nationalités.`}
        items={[{ label: "Nos campus" }]}
        image="/media/img-9163.jpg"
      />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Campus &amp; Annexes</SectionLabel>
            <h2 className="section-title">Nos Campus :</h2>
          </div>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
            {campus.map((c) => (
              <CampusCard
                key={c.id}
                variant="detail"
                cta="Explorez davantage"
                nom={c.nom}
                slug={c.slug}
                ville={c.ville}
                pays={c.pays}
                adresse={c.adresse}
                telephone={c.telephone}
                image={c.image}
                isSiege={c.isSiege}
                programmesCount={c._count.programmes}
              />
            ))}
          </div>
        </Container>
      </section>

      <PreInscriptionCTA
        anneeAcademique={settings.anneeAcademique}
        ouvertes={settings.inscriptionsOuvertes}
        formations={formations.map((f) => ({ id: f.id, titre: f.titre }))}
        campus={campus.map((c) => ({ id: c.id, nom: c.nom }))}
      />
    </>
  );
}

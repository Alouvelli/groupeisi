import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { getDocuments } from "@/lib/data";

export const metadata: Metadata = { title: "Téléchargements", description: "Brochures, fiches d'inscription, calendrier académique et règlement intérieur du Groupe ISI à télécharger." };

const TYPE_LABELS: Record<string, string> = { BROCHURE: "Brochures", PLAQUETTE: "Plaquettes", FORMULAIRE: "Formulaires", REGLEMENT: "Règlements", CALENDRIER: "Calendriers", AUTRE: "Autres documents" };

export default async function TelechargementsPage() {
  const docs = await getDocuments();
  const types = Array.from(new Set(docs.map((d) => d.type)));
  return (
    <>
      <PageHeader title="Téléchargements" subtitle="Brochures, formulaires, calendrier académique et documents utiles." items={[{ label: "Admissions", href: "/admissions" }, { label: "Téléchargements" }]} />
      <Section padding="lg">
        <div className="mx-auto max-w-4xl space-y-12">
          {types.map((t) => (
            <div key={t}>
              <SectionHeading label="Documents" title={TYPE_LABELS[t] ?? t} align="left" className="mb-6" />
              <div className="grid gap-4">{docs.filter((d) => d.type === t).map((d) => <DocumentCard key={d.id} titre={d.titre} description={d.description} fichier={d.fichier} format={d.format} taille={d.taille} type={d.type} />)}</div>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

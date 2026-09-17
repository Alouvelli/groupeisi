import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Mentions légales", robots: { index: false } };

export default async function MentionsLegalesPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Mentions légales" items={[{ label: "Mentions légales" }]} />
      <Section padding="lg">
        <div className="prose-isi mx-auto max-w-3xl">
          <h2>Éditeur du site</h2>
          <p><strong>{s.siteName}</strong> – Institut Supérieur d&apos;Informatique<br />{s.address}<br />Téléphone : {s.phone}<br />Email : {s.email}</p>
          <h2>Hébergement</h2>
          <p>Le site est hébergé sur une infrastructure conteneurisée (Docker) administrée par le Groupe ISI.</p>
          <h2>Propriété intellectuelle</h2>
          <p>L&apos;ensemble des contenus (textes, images, logos, vidéos) présents sur ce site est la propriété exclusive du Groupe ISI ou de ses partenaires. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
          <h2>Données personnelles</h2>
          <p>Les informations collectées via les formulaires (pré-inscription, contact, newsletter) sont destinées aux services des admissions et de la communication du Groupe ISI et peuvent être synchronisées avec son système de gestion (ERP/CRM). Conformément à la loi n° 2008-12 du 25 janvier 2008 sur la protection des données à caractère personnel (Sénégal), vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en écrivant à {s.email}.</p>
        </div>
      </Section>
    </>
  );
}

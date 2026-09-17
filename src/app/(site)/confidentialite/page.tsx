import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Politique de confidentialité", robots: { index: false } };

export default async function ConfidentialitePage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Politique de confidentialité" items={[{ label: "Confidentialité" }]} />
      <Section padding="lg">
        <div className="prose-isi mx-auto max-w-3xl">
          <h2>Données collectées</h2>
          <p>Lors d&apos;une pré-inscription, nous collectons vos données d&apos;identité, de contact, votre parcours scolaire et vos choix de formation. Lors d&apos;une demande de contact ou d&apos;abonnement à la newsletter, nous collectons votre nom, votre email et votre message.</p>
          <h2>Finalités</h2>
          <ul><li>Traitement de votre candidature et suivi par le service des admissions</li><li>Réponse à vos demandes d&apos;information</li><li>Envoi d&apos;informations sur nos formations et événements (avec votre consentement)</li><li>Synchronisation avec notre système de gestion interne (ERP/CRM) pour le suivi de votre dossier</li></ul>
          <h2>Durée de conservation</h2>
          <p>Les dossiers de pré-inscription sont conservés pendant 3 ans. Les données de newsletter sont conservées jusqu&apos;à votre désabonnement.</p>
          <h2>Vos droits</h2>
          <p>Vous pouvez exercer vos droits d&apos;accès, de rectification, d&apos;opposition et de suppression en écrivant à <a href={`mailto:${s.email}`}>{s.email}</a>.</p>
          <h2>Cookies</h2>
          <p>Ce site utilise uniquement des cookies techniques nécessaires à son fonctionnement (session administrateur). Aucun cookie publicitaire n&apos;est déposé.</p>
        </div>
      </Section>
    </>
  );
}

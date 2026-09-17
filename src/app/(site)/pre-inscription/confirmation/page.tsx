import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Mail, Phone, Download, Home, FileText, Printer } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import { NIVEAU_LABELS, MODE_FORMATION_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Pré-inscription confirmée", robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ numero?: string; id?: string }> }) {
  const { numero, id } = await searchParams;
  if (!numero || !id) notFound();
  const [inscription, settings] = await Promise.all([
    prisma.inscription.findFirst({ where: { id, numero }, include: { programme: true, campus: true } }),
    getSettings(),
  ]);
  if (!inscription) notFound();
  return (
    <Section variant="surface" padding="lg">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-card border border-line bg-white p-8 text-center shadow-card sm:p-12">
          <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-10 w-10" /></span>
          <h1 className="mt-6 font-heading text-3xl font-extrabold text-primary">Pré-inscription enregistrée !</h1>
          <p className="mt-3 text-muted">Merci <strong className="text-primary">{inscription.prenom}</strong>, votre demande a bien été reçue. Conservez précieusement votre numéro de dossier :</p>
          <div className="mt-6 rounded-2xl bg-primary py-5 font-heading text-3xl font-extrabold tracking-wider text-accent">{inscription.numero}</div>
          <dl className="mt-8 grid gap-3 text-left text-sm sm:grid-cols-2">
            {[["Formation", `${inscription.programme.titre} (${NIVEAU_LABELS[inscription.programme.niveau]})`], ["Campus", inscription.campus.nom], ["Niveau d'entrée", inscription.niveauEntree], ["Rentrée", inscription.rentree], ["Mode", MODE_FORMATION_LABELS[inscription.modeFormation]], ["Date", formatDate(inscription.createdAt, "d MMMM yyyy 'à' HH:mm")]].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-surface p-3"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{k}</dt><dd className="mt-0.5 font-semibold text-primary">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-8 rounded-2xl border border-secondary/30 bg-secondary-50 p-5 text-left text-sm">
            <h2 className="flex items-center gap-2 font-extrabold text-primary"><FileText className="h-4 w-4 text-secondary" /> Prochaines étapes</h2>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700">
              <li>Un email de confirmation vient de vous être envoyé à <strong>{inscription.email}</strong>.</li>
              <li>Un conseiller admissions vous contactera sous <strong>48 heures ouvrées</strong>.</li>
              <li>Préparez vos pièces justificatives (diplôme, relevés, pièce d&apos;identité, photos).</li>
            </ol>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/telechargements" variant="primary"><Download className="h-4 w-4" /> Liste des pièces</Button>
            <Button href="/" variant="outline"><Home className="h-4 w-4" /> Retour à l&apos;accueil</Button>
          </div>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            {settings.phone2 && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {settings.phone2}</span>}
            {settings.emailAdmissions && <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {settings.emailAdmissions}</span>}
            <span className="inline-flex items-center gap-1"><Printer className="h-3.5 w-3.5" /> Imprimez cette page pour vos archives</span>
          </p>
        </div>
      </div>
    </Section>
  );
}

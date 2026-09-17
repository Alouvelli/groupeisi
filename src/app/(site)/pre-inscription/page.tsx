import type { Metadata } from "next";
import { CheckCircle2, Clock, ShieldCheck, Headset, Phone, Mail, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { PreInscriptionForm } from "@/components/forms/PreInscriptionForm";
import { getInscriptionOptions } from "@/app/actions/inscriptions";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Pré-inscription en ligne", description: "Pré-inscrivez-vous en ligne au Groupe ISI en 5 minutes : BTS, Licence, Master, certifications. Réponse sous 48 heures." };

export default async function PreInscriptionPage({ searchParams }: { searchParams: Promise<{ programme?: string; campus?: string }> }) {
  const sp = await searchParams;
  const [options, settings] = await Promise.all([getInscriptionOptions(), getSettings()]);
  return (
    <>
      <PageHeader title="Pré-inscription en ligne" subtitle={`Rentrée ${options.annee} – Remplissez le formulaire en 5 minutes, un conseiller vous recontacte sous 48 heures.`} items={[{ label: "Admissions", href: "/admissions" }, { label: "Pré-inscription" }]} image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80" />
      <Section variant="surface" padding="lg">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {options.ouvertes ? (
              <PreInscriptionForm options={options} defaultProgrammeId={sp.programme} defaultCampusId={sp.campus} />
            ) : (
              <div className="rounded-card border border-amber-300 bg-amber-50 p-8 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-amber-600" /><h2 className="mt-4 text-xl font-extrabold text-primary">Les pré-inscriptions sont actuellement fermées</h2><p className="mt-2 text-muted">Contactez le service des admissions pour être informé de la prochaine ouverture.</p></div>
            )}
          </div>
          <aside className="space-y-6">
            <div className="rounded-card border border-line bg-white p-6 shadow-soft">
              <h3 className="text-lg font-extrabold text-primary">Comment ça marche ?</h3>
              <ul className="mt-4 space-y-4 text-sm">
                {[{ Icon: CheckCircle2, t: "Remplissez le formulaire", d: "6 étapes, 5 minutes. Votre brouillon est sauvegardé automatiquement." }, { Icon: Mail, t: "Recevez votre numéro de dossier", d: "Un email de confirmation vous est envoyé immédiatement." }, { Icon: Headset, t: "Un conseiller vous appelle", d: "Sous 48 h ouvrées pour finaliser votre inscription." }, { Icon: Clock, t: "Déposez vos pièces", d: "Au campus de votre choix ou par email." }].map((s) => (
                  <li key={s.t} className="flex gap-3"><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary-50 text-secondary"><s.Icon className="h-4 w-4" /></span><div><div className="font-bold text-primary">{s.t}</div><div className="text-muted">{s.d}</div></div></li>
                ))}
              </ul>
            </div>
            <div className="rounded-card bg-primary p-6 text-white">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-white"><Headset className="h-5 w-5 text-accent" /> Besoin d&apos;aide ?</h3>
              <p className="mt-2 text-sm text-white/80">Le service des admissions est disponible du lundi au samedi.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {settings.phone2 && <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /> <a href={`tel:${settings.phone2.replace(/\s/g, "")}`}>{settings.phone2}</a></li>}
                {settings.emailAdmissions && <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /> <a href={`mailto:${settings.emailAdmissions}`}>{settings.emailAdmissions}</a></li>}
              </ul>
            </div>
            <p className="flex items-start gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /> Vos données sont protégées et utilisées uniquement pour le traitement de votre candidature.</p>
          </aside>
        </div>
      </Section>
    </>
  );
}

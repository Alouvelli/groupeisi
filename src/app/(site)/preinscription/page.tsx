import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2, Clock, Headset, Mail, Phone, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { PreInscriptionForm } from "@/components/forms/PreInscriptionForm";
import { getInscriptionOptions } from "@/app/actions/inscriptions";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Préinscription en ligne",
  description:
    "Préinscrivez-vous en ligne au Groupe ISI en 5 minutes : licences, bachelors et masters. Un conseiller vous recontacte sous 48 heures.",
};

const ETAPES = [
  { Icon: CheckCircle2, t: "Remplissez le formulaire", d: "6 étapes, 5 minutes. Votre brouillon est sauvegardé automatiquement." },
  { Icon: Mail, t: "Recevez votre numéro de dossier", d: "Un email de confirmation vous est envoyé immédiatement." },
  { Icon: Headset, t: "Un conseiller vous appelle", d: "Sous 48 h ouvrées pour finaliser votre inscription." },
  { Icon: Clock, t: "Déposez vos pièces", d: "Au campus de votre choix ou par email." },
];

export default async function PreinscriptionPage({ searchParams }: { searchParams: Promise<{ programme?: string; campus?: string }> }) {
  const sp = await searchParams;
  const [options, settings] = await Promise.all([getInscriptionOptions(), getSettings()]);

  return (
    <>
      <PageHeader
        title="Préinscription en ligne"
        subtitle={`Rentrée ${options.annee} – remplissez le formulaire en 5 minutes, un conseiller vous recontacte sous 48 heures.`}
        items={[{ label: "Conditions d'admission", href: "/condition-admission" }, { label: "Préinscription" }]}
        image="/media/img-2298-1.jpg"
      />

      <section className="bg-surface py-16 lg:py-[100px]">
        <Container>
          <div className="grid gap-[30px] lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              {options.ouvertes ? (
                <PreInscriptionForm options={options} defaultProgrammeId={sp.programme} defaultCampusId={sp.campus} />
              ) : (
                <div className="rounded-lg border border-secondary bg-secondary-50 p-8 text-center">
                  <AlertTriangle className="mx-auto h-10 w-10 text-secondary-dark" aria-hidden />
                  <h2 className="mt-4 font-heading text-[24px] font-semibold text-dark">Les préinscriptions sont actuellement fermées</h2>
                  <p className="mt-2 text-[15px] text-body">Contactez le service des admissions pour être informé de la prochaine ouverture.</p>
                </div>
              )}
            </div>

            <aside className="space-y-[30px]">
              <div className="rounded-lg border border-line bg-white p-7">
                <h3 className="font-heading text-[20px] font-semibold text-dark">Comment ça marche ?</h3>
                <ul className="mt-5 space-y-4 text-[15px]">
                  {ETAPES.map(({ Icon, t, d }) => (
                    <li key={t} className="flex gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span>
                        <span className="block font-medium text-dark">{t}</span>
                        <span className="text-body">{d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-primary p-7 text-white">
                <h3 className="flex items-center gap-2 font-heading text-[20px] font-semibold text-white">
                  <Headset className="h-5 w-5 text-secondary" aria-hidden /> Besoin d&apos;aide ?
                </h3>
                <p className="mt-2 text-[15px] text-white/80">Le service des admissions est disponible du lundi au samedi.</p>
                <ul className="mt-4 space-y-2 text-[15px]">
                  {settings.phone && (
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                      <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="transition hover:text-secondary">
                        {settings.phone}
                      </a>
                    </li>
                  )}
                  {settings.email && (
                    <li className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-secondary" aria-hidden />
                      <a href={`mailto:${settings.email}`} className="break-all transition hover:text-secondary">
                        {settings.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>

              <p className="flex items-start gap-2 text-[13px] text-muted">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden /> Vos données sont protégées et utilisées uniquement pour le
                traitement de votre candidature.
              </p>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

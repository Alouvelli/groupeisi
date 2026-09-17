import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, UserCheck, ClipboardCheck, CreditCard, GraduationCap, Percent, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { PreInscriptionCTA } from "@/components/sections/PreInscriptionCTA";
import { getFAQ, getProgrammes, getSettings } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import { formatFCFA } from "@/lib/utils";
import type { Niveau } from "@prisma/client";

export const metadata: Metadata = { title: "Admissions", description: "Conditions d'admission, procédure de pré-inscription, frais de scolarité et bourses du Groupe ISI." };

const steps = [
  { Icon: FileText, title: "1. Pré-inscription en ligne", text: "Remplissez le formulaire en ligne (5 minutes). Vous recevez immédiatement votre numéro de dossier par email." },
  { Icon: UserCheck, title: "2. Étude du dossier", text: "Notre service des admissions étudie votre candidature sous 48 h ouvrées et vous contacte pour un entretien (Masters)." },
  { Icon: ClipboardCheck, title: "3. Dépôt des pièces", text: "Déposez vos pièces justificatives au campus de votre choix ou envoyez-les par email." },
  { Icon: CreditCard, title: "4. Inscription définitive", text: "Réglez les frais d'inscription, recevez votre carte d'étudiant et votre emploi du temps. Bienvenue à ISI !" },
];

export default async function AdmissionsPage() {
  const [settings, faq, programmes] = await Promise.all([getSettings(), getFAQ(), getProgrammes()]);
  const byNiveau = (["BTS", "LICENCE", "MASTER", "CERTIFICAT", "FORMATION_CONTINUE"] as Niveau[]).map((n) => ({ niveau: n, items: programmes.filter((p) => p.niveau === n) })).filter((g) => g.items.length);
  return (
    <>
      <PageHeader title="Admissions" subtitle={`Rejoignez le Groupe ISI pour la rentrée ${settings.anneeAcademique}. Procédure simple, rapide et 100 % en ligne.`} items={[{ label: "Admissions" }]} image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=80" />

      <Section padding="lg">
        <SectionHeading label="Procédure" title="Comment s'inscrire au Groupe ISI ?" description="Quatre étapes simples pour rejoindre nos formations." />
        <Stagger className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((s) => (
            <StaggerItem key={s.title} className="relative rounded-card border border-line bg-white p-7 shadow-soft">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-50 text-secondary"><s.Icon className="h-7 w-7" /></span>
              <h3 className="mt-5 text-lg font-extrabold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-10 text-center"><Button href="/pre-inscription" variant="secondary" size="lg">Démarrer ma pré-inscription <ArrowRight className="h-5 w-5" /></Button></div>
      </Section>

      <Section variant="surface" padding="lg" id="conditions">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <SectionHeading label="Conditions" title="Conditions d'admission par niveau" align="left" />
            <div className="space-y-4">
              {[
                { t: "BTS (Bac+2)", d: "Baccalauréat toutes séries ou niveau Terminale. Admission sur dossier." },
                { t: "Licence (Bac+3)", d: "Baccalauréat toutes séries (S, L, G, T). Admission sur dossier. Passerelle en 3ème année pour les titulaires d'un BTS / DUT." },
                { t: "Master (Bac+5)", d: "Licence (Bac+3) dans le domaine ou diplôme équivalent. Admission sur dossier et entretien de motivation." },
                { t: "Certifications & formation continue", d: "Ouvertes aux étudiants et professionnels. Aucun prérequis de diplôme pour la plupart des parcours." },
              ].map((c) => (
                <div key={c.t} className="flex gap-4 rounded-2xl border border-line bg-white p-5"><GraduationCap className="mt-1 h-5 w-5 shrink-0 text-secondary" /><div><h3 className="font-extrabold text-primary">{c.t}</h3><p className="mt-1 text-sm text-muted">{c.d}</p></div></div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading label="Dossier" title="Pièces à fournir" align="left" />
            <ul className="space-y-3">
              {["Copie légalisée du diplôme du Baccalauréat (ou du dernier diplôme obtenu)", "Relevés de notes des deux dernières années", "Copie de la carte nationale d'identité ou du passeport", "Extrait de naissance", "2 photos d'identité récentes", "Reçu de paiement des frais d'inscription", "Pour les Masters : CV et lettre de motivation"].map((p, i) => (
                <li key={p} className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700 shadow-soft"><span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-extrabold text-white">{i + 1}</span> {p}</li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-secondary/30 bg-secondary-50 p-5 text-sm text-slate-700"><strong className="text-secondary-dark">Bourses d&apos;excellence :</strong> jusqu&apos;à 50 % de réduction sur la scolarité pour les meilleurs bacheliers (mention Bien et Très Bien). Réductions fratrie et facilités de paiement en 3 à 10 mensualités.</div>
          </Reveal>
        </div>
      </Section>

      <Section padding="lg" id="frais">
        <SectionHeading label="Tarifs" title="Frais de scolarité" description="Frais indicatifs par formation et par année. Facilités de paiement disponibles sur tous les campus." />
        <div className="space-y-10">
          {byNiveau.map((g) => (
            <div key={g.niveau}>
              <h3 className="mb-4 flex items-center gap-2 text-xl font-extrabold text-primary"><Percent className="h-5 w-5 text-secondary" /> {NIVEAU_LABELS[g.niveau]}</h3>
              <div className="overflow-x-auto rounded-card border border-line">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-primary text-left text-white"><tr><th className="px-4 py-3">Formation</th><th className="px-4 py-3">Durée</th><th className="px-4 py-3 text-right">Frais d&apos;inscription</th><th className="px-4 py-3 text-right">Scolarité / an</th></tr></thead>
                  <tbody>
                    {g.items.map((p) => (
                      <tr key={p.id} className="border-t border-line odd:bg-white even:bg-surface">
                        <td className="px-4 py-3 font-bold text-primary"><Link href={`/programmes/${p.slug}`} className="hover:text-secondary">{p.titre}</Link></td>
                        <td className="px-4 py-3">{p.duree}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatFCFA(p.fraisInscription)}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatFCFA(p.fraisScolarite)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section variant="surface" padding="lg">
        <SectionHeading label="FAQ" title="Questions fréquentes sur les admissions" />
        <div className="mx-auto max-w-3xl">
          <Accordion items={faq.filter((f) => ["Admissions", "Frais"].includes(f.categorie)).map((f) => ({ id: f.id, title: f.question, content: f.reponse }))} />
          <p className="mt-6 text-center text-sm text-muted"><HelpCircle className="mr-1 inline h-4 w-4" /> D&apos;autres questions ? <Link href="/faq" className="font-bold text-secondary">Consultez la FAQ complète</Link> ou <Link href="/contact" className="font-bold text-secondary">contactez-nous</Link>.</p>
        </div>
      </Section>

      <PreInscriptionCTA anneeAcademique={settings.anneeAcademique} phone={settings.phone2 ?? settings.phone} ouvertes={settings.inscriptionsOuvertes} />
    </>
  );
}

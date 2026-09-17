import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, BookOpen, Briefcase, CheckCircle2, Clock, Download, GraduationCap, MapPin, Target, Wallet, Share2 } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { getProgrammeBySlug, getProgrammes, getSettings } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import { formatFCFA, absoluteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgrammeBySlug(slug);
  if (!p) return { title: "Formation introuvable" };
  return { title: p.seoTitle ?? `${p.titre} – ${NIVEAU_LABELS[p.niveau]}`, description: p.seoDescription ?? p.accroche ?? p.description.slice(0, 160), openGraph: { images: p.image ? [p.image] : undefined } };
}

export default async function ProgrammePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProgrammeBySlug(slug);
  if (!p) notFound();
  const [settings, related] = await Promise.all([getSettings(), getProgrammes({ departement: p.departement.slug })]);
  const modules = (p.modules as { semestre: string; intitule: string; ects?: number }[] | null) ?? [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: p.titre,
    description: p.accroche ?? p.description,
    provider: { "@type": "CollegeOrUniversity", name: settings.siteName, sameAs: absoluteUrl("/") },
    educationalCredentialAwarded: p.diplome ?? NIVEAU_LABELS[p.niveau],
    timeRequired: p.duree,
    url: absoluteUrl(`/programmes/${p.slug}`),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader title={p.titre} subtitle={p.accroche ?? undefined} items={[{ label: "Formations", href: "/programmes" }, { label: NIVEAU_LABELS[p.niveau], href: `/programmes?niveau=${p.niveau}` }, { label: p.titre }]} image={p.image} />

      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{NIVEAU_LABELS[p.niveau]}</Badge>
              <Badge variant="soft">{p.departement.nom}</Badge>
              {p.accreditation && <Badge variant="success"><Award className="h-3 w-3" /> {p.accreditation}</Badge>}
            </div>
            {p.image && <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-3xl"><Image src={p.image} alt={p.titre} fill sizes="66vw" className="object-cover" priority /></div>}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { Icon: Clock, label: "Durée", value: p.duree },
                { Icon: GraduationCap, label: "Diplôme", value: p.diplome ?? NIVEAU_LABELS[p.niveau] },
                { Icon: Wallet, label: "Inscription", value: formatFCFA(p.fraisInscription) },
                { Icon: Wallet, label: "Scolarité / an", value: formatFCFA(p.fraisScolarite) },
              ].map((i) => (
                <div key={i.label} className="rounded-2xl border border-line bg-surface p-4">
                  <i.Icon className="h-5 w-5 text-secondary" />
                  <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{i.label}</div>
                  <div className="mt-0.5 text-sm font-extrabold text-primary">{i.value}</div>
                </div>
              ))}
            </div>

            <Tabs
              variant="underline"
              className="mt-10"
              tabs={[
                {
                  id: "presentation",
                  label: "Présentation",
                  content: (
                    <div>
                      <div className="prose-isi"><p className="text-lg">{p.description}</p>{p.contenu && <div dangerouslySetInnerHTML={{ __html: p.contenu }} />}</div>
                      {p.objectifs.length > 0 && (
                        <div className="mt-8">
                          <h3 className="flex items-center gap-2 text-xl font-extrabold text-primary"><Target className="h-5 w-5 text-secondary" /> Objectifs de la formation</h3>
                          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{p.objectifs.map((o) => <li key={o} className="flex items-start gap-2 rounded-xl bg-surface p-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {o}</li>)}</ul>
                        </div>
                      )}
                      {p.competences.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-xl font-extrabold text-primary">Compétences acquises</h3>
                          <div className="mt-4 flex flex-wrap gap-2">{p.competences.map((c) => <Badge key={c} variant="outline" className="normal-case tracking-normal">{c}</Badge>)}</div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  id: "programme",
                  label: "Programme",
                  content: modules.length ? (
                    <div className="overflow-hidden rounded-card border border-line">
                      <table className="w-full text-sm">
                        <thead className="bg-primary text-left text-white"><tr><th className="px-4 py-3">Semestre</th><th className="px-4 py-3">Module</th><th className="px-4 py-3 text-right">ECTS</th></tr></thead>
                        <tbody>{modules.map((m, i) => <tr key={i} className="border-t border-line odd:bg-white even:bg-surface"><td className="px-4 py-3 font-bold text-primary">{m.semestre}</td><td className="px-4 py-3">{m.intitule}</td><td className="px-4 py-3 text-right font-semibold">{m.ects ?? "–"}</td></tr>)}</tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">Le programme détaillé (maquette pédagogique) est disponible sur demande auprès du service des admissions ou dans la brochure de la formation.</p>
                  ),
                },
                {
                  id: "debouches",
                  label: "Débouchés",
                  content: (
                    <div>
                      <h3 className="flex items-center gap-2 text-xl font-extrabold text-primary"><Briefcase className="h-5 w-5 text-secondary" /> Métiers visés</h3>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">{p.debouches.map((d) => <li key={d} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold text-slate-700"><span className="h-2 w-2 rounded-full bg-secondary" /> {d}</li>)}</ul>
                      <p className="mt-6 text-sm text-muted">Taux d&apos;insertion professionnelle des diplômés ISI : <strong className="text-primary">{settings.statInsertion} %</strong> dans les 6 mois.</p>
                    </div>
                  ),
                },
                {
                  id: "admission",
                  label: "Admission",
                  content: (
                    <div className="prose-isi">
                      <h3><BookOpen className="mr-2 inline h-5 w-5 text-secondary" />Conditions d&apos;admission</h3>
                      <p>{p.conditionsAdmission}</p>
                      <h3>Pièces à fournir</h3>
                      <ul><li>Copie légalisée du diplôme requis</li><li>Relevés de notes</li><li>Copie de la pièce d&apos;identité ou du passeport</li><li>Extrait de naissance</li><li>2 photos d&apos;identité</li><li>Reçu de paiement des frais d&apos;inscription</li></ul>
                      <p><Link href="/admissions">En savoir plus sur la procédure d&apos;admission →</Link></p>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card bg-primary p-6 text-white shadow-card">
              <h3 className="text-xl font-extrabold text-white">Intéressé(e) par cette formation ?</h3>
              <p className="mt-2 text-sm text-white/80">Pré-inscrivez-vous en ligne en 5 minutes. Un conseiller vous recontacte sous 48 h.</p>
              <Button href={`/pre-inscription?programme=${p.id}`} variant="secondary" className="mt-5 w-full">Je me pré-inscris <ArrowRight className="h-4 w-4" /></Button>
              <Button href="/contact?sujet=Demande%20d'information" variant="outline-white" className="mt-2 w-full">Demander des informations</Button>
              {p.brochureUrl && <Button href={p.brochureUrl} external variant="ghost" className="mt-2 w-full text-white hover:bg-white/10"><Download className="h-4 w-4" /> Brochure PDF</Button>}
            </div>
            <div className="rounded-card border border-line p-6">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-primary"><MapPin className="h-5 w-5 text-secondary" /> Campus proposant cette formation</h3>
              <ul className="mt-4 space-y-2">
                {p.campus.map((c) => (
                  <li key={c.id}><Link href={`/campus/${c.slug}`} className="flex items-center justify-between rounded-xl bg-surface px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary-50">{c.nom.replace(/^ISI\s+/, "")} <ArrowRight className="h-4 w-4 text-secondary" /></Link></li>
                ))}
              </ul>
            </div>
            <div className="rounded-card border border-line p-6 text-sm">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-primary"><Share2 className="h-5 w-5 text-secondary" /> Partager</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="rounded-full bg-surface px-3 py-1.5 font-semibold hover:bg-primary-50" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl(`/programmes/${p.slug}`))}`}>Facebook</a>
                <a className="rounded-full bg-surface px-3 py-1.5 font-semibold hover:bg-primary-50" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(absoluteUrl(`/programmes/${p.slug}`))}`}>LinkedIn</a>
                <a className="rounded-full bg-surface px-3 py-1.5 font-semibold hover:bg-primary-50" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${p.titre} – ${absoluteUrl(`/programmes/${p.slug}`)}`)}`}>WhatsApp</a>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {related.filter((r) => r.id !== p.id).length > 0 && (
        <Section variant="surface" padding="lg">
          <SectionHeading label="À découvrir" title={`Autres formations en ${p.departement.nom}`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.filter((r) => r.id !== p.id).slice(0, 3).map((r) => (
              <ProgramCard key={r.id} titre={r.titre} slug={r.slug} niveau={r.niveau} duree={r.duree} accroche={r.accroche} description={r.description} image={r.image} accreditation={r.accreditation} campus={r.campus} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

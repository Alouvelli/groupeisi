import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Award, BookOpen, CalendarClock, Check, Clock, GraduationCap, Layers, MapPin, Wallet } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Accordion } from "@/components/ui/Accordion";
import { SectionLabel } from "@/components/ui/Section";
import { InfoRequestForm } from "@/components/forms/InfoRequestForm";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { getProgrammeBySlug, getProgrammes, getSettings } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import { absoluteUrl, formatFCFA } from "@/lib/utils";

type UE = { intitule: string; contenu?: string };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProgrammeBySlug(slug);
  if (!p) return { title: "Formation introuvable" };
  return {
    title: p.seoTitle ?? p.titre,
    description: p.seoDescription ?? p.accroche ?? p.description.slice(0, 160),
    alternates: { canonical: `/formations/${p.slug}` },
    openGraph: { title: p.titre, description: p.accroche ?? undefined, images: p.image ? [{ url: p.image }] : undefined },
  };
}

export default async function FormationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [programme, settings] = await Promise.all([getProgrammeBySlug(slug), getSettings()]);
  if (!programme) notFound();

  const autres = (await getProgrammes({ departement: programme.departement.slug })).filter((p) => p.slug !== programme.slug).slice(0, 3);
  const ues = (programme.unitesEnseignement as UE[] | null) ?? [];

  const details = [
    { icon: Clock, titre: "Durée", valeur: programme.duree },
    { icon: Layers, titre: "Crédits", valeur: programme.credits ? `${programme.credits} crédits totaux` : "—" },
    { icon: CalendarClock, titre: "Volume horaire", valeur: programme.volumeHoraire ? `${programme.volumeHoraire} heures` : "—" },
    { icon: BookOpen, titre: "UE", valeur: programme.nbUE ? `${programme.nbUE} Unités d'Enseignement` : "—" },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: programme.titre,
    description: programme.description,
    provider: { "@type": "CollegeOrUniversity", name: settings.siteName, url: absoluteUrl("/") },
    educationalCredentialAwarded: programme.diplome ?? undefined,
    url: absoluteUrl(`/formations/${programme.slug}`),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader
        title={programme.titre}
        items={[{ label: "Nos formations", href: "/formations" }, { label: NIVEAU_LABELS[programme.niveau] }]}
        image={programme.image}
      />

      {/* Sommaire ancré */}
      <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <Container>
          <nav aria-label="Sommaire de la formation" className="scrollbar-hide flex gap-1 overflow-x-auto">
            {[
              ["#sommaire", "Sommaire"],
              ["#programme", "Programme"],
              ["#couts", "Coût & Modalités"],
              ["#admissions", "Admissions"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="tab-btn">
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      <section id="sommaire" className="scroll-mt-24 bg-white py-16 lg:py-[90px]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
            <div>
              <p className="text-base leading-7 text-body">{programme.description}</p>

              <h3 className="mt-12 font-heading text-[26px] font-semibold text-dark lg:text-[30px]">Détails du programme</h3>
              <div className="mt-6 grid gap-[30px] sm:grid-cols-2">
                {details.map(({ icon: Icon, titre, valeur }) => (
                  <div key={titre} className="rounded-lg border border-line bg-white p-6">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <h4 className="mt-4 font-heading text-[20px] font-semibold text-dark">{titre}</h4>
                    <p className="mt-1 text-[15px] text-body">{valeur}</p>
                  </div>
                ))}
              </div>

              {programme.portfolioUrl && (
                <Button href={programme.portfolioUrl} external className="mt-8" variant="outline">
                  Plus de détails <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Button>
              )}

              {programme.objectifs.length > 0 && (
                <>
                  <h3 className="mt-14 font-heading text-[26px] font-semibold text-dark lg:text-[30px]">Objectifs et compétences</h3>
                  <ul className="mt-6 space-y-3">
                    {programme.objectifs.map((o) => (
                      <li key={o} className="flex gap-3 text-[15px] leading-7 text-body">
                        <Check className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Programme détaillé */}
              <div id="programme" className="scroll-mt-28">
                <h3 className="mt-14 font-heading text-[26px] font-semibold text-dark lg:text-[30px]">
                  {programme.titre} ({programme.semestres ?? 6} semestres)
                </h3>
                {programme.session && <p className="mt-2 font-heading text-[18px] font-semibold text-primary">Session : {programme.session}</p>}
                {programme.structure && (
                  <>
                    <h4 className="mt-6 font-heading text-[18px] font-semibold text-dark">Structure typique du programme</h4>
                    <ul className="mt-3 space-y-2 text-[15px] leading-7 text-body">
                      <li>
                        <strong className="font-semibold text-dark">Durée :</strong> {programme.semestres} semestres
                      </li>
                      <li>
                        <strong className="font-semibold text-dark">Crédits totaux :</strong> {programme.credits} crédits
                      </li>
                      <li>
                        <strong className="font-semibold text-dark">Structure :</strong> {programme.structure}
                      </li>
                    </ul>
                  </>
                )}

                {ues.length > 0 && (
                  <>
                    <h4 className="mt-8 font-heading text-[18px] font-semibold text-dark">Unités d&apos;enseignement</h4>
                    <Accordion
                      className="mt-4"
                      items={ues.map((u, i) => ({
                        id: `ue-${i}`,
                        title: u.intitule,
                        content: u.contenu ?? "Unité d'enseignement du programme, détaillée dans la maquette de formation.",
                      }))}
                    />
                  </>
                )}
              </div>

              {/* Coût & modalités */}
              <div id="couts" className="scroll-mt-28">
                <h3 className="mt-14 font-heading text-[26px] font-semibold text-dark lg:text-[30px]">Coût &amp; modalités</h3>
                <div className="mt-6 overflow-x-auto">
                  <table className="table-isi">
                    <tbody>
                      <tr>
                        <th scope="row">Coût annuel</th>
                        <td>{formatFCFA(programme.fraisScolarite)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Droits d&apos;inscription</th>
                        <td>{formatFCFA(programme.fraisInscription)}</td>
                      </tr>
                      <tr>
                        <th scope="row">Mensualité</th>
                        <td>{formatFCFA(programme.fraisMensualite)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-[15px] text-body">
                  Les frais de scolarité peuvent être réglés mensuellement. Consultez la page{" "}
                  <Link href="/frais-d-etudes" className="font-medium text-primary hover:underline">
                    Frais d&apos;études
                  </Link>{" "}
                  pour la grille complète.
                </p>
              </div>

              {/* Admissions */}
              <div id="admissions" className="scroll-mt-28">
                <h3 className="mt-14 font-heading text-[26px] font-semibold text-dark lg:text-[30px]">Admissions</h3>
                <p className="mt-4 text-[15px] leading-7 text-body">{programme.conditionsAdmission}</p>
                {programme.debouches.length > 0 && (
                  <>
                    <h4 className="mt-8 font-heading text-[18px] font-semibold text-dark">Débouchés</h4>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {programme.debouches.map((d) => (
                        <li key={d} className="flex gap-2.5 text-[15px] text-body">
                          <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /> {d}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <Button href={`/preinscription?programme=${programme.id}`} className="mt-8" arrow>
                  Se préinscrire à cette formation
                </Button>
              </div>
            </div>

            {/* Colonne latérale */}
            <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-lg border border-line bg-surface p-7">
                <h4 className="font-heading text-[20px] font-semibold text-dark">En bref</h4>
                <ul className="mt-5 space-y-4 text-[15px]">
                  <li className="flex gap-3">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="block font-medium text-dark">Niveau</span>
                      {NIVEAU_LABELS[programme.niveau]}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="block font-medium text-dark">Durée</span>
                      {programme.duree}
                    </span>
                  </li>
                  {programme.diplome && (
                    <li className="flex gap-3">
                      <Award className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        <span className="block font-medium text-dark">Diplôme</span>
                        {programme.diplome}
                      </span>
                    </li>
                  )}
                  <li className="flex gap-3">
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="block font-medium text-dark">Coût annuel</span>
                      {formatFCFA(programme.fraisScolarite)}
                    </span>
                  </li>
                  {programme.campus.length > 0 && (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>
                        <span className="block font-medium text-dark">Campus</span>
                        {programme.campus.map((c) => c.nom).join(", ")}
                      </span>
                    </li>
                  )}
                </ul>
                <Button href={`/preinscription?programme=${programme.id}`} className="mt-7 w-full" arrow>
                  S&apos;inscrire
                </Button>
              </div>

              <div className="rounded-lg bg-primary p-7 text-white">
                <Image src={settings.logoWhiteUrl || "/media/sans-titre-1920-x-813-px-135-x-46-px-3.png"} alt="" width={160} height={54} className="h-10 w-auto" />
                <p className="mt-5 font-heading text-[18px] font-semibold text-white">Besoin d&apos;aide ?</p>
                {settings.phone && (
                  <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="mt-3 block font-heading text-[22px] font-semibold text-secondary">
                    {settings.phone}
                  </a>
                )}
                {settings.email && (
                  <a href={`mailto:${settings.email}`} className="mt-1 block text-[15px] text-white/85 hover:text-secondary">
                    {settings.email}
                  </a>
                )}
                <Button href="/contact" variant="secondary" className="mt-6 w-full" arrow>
                  Nous contacter
                </Button>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      {/* Demande d'information */}
      <section className="bg-surface py-16 lg:py-[90px]">
        <Container narrow>
          <div className="mb-10 text-center">
            <SectionLabel className="justify-center">Se préinscrire</SectionLabel>
            <h2 className="section-title">Demander des informations sur cette formation</h2>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-card sm:p-10">
            <InfoRequestForm formations={[{ id: programme.id, titre: programme.titre }]} />
          </div>
        </Container>
      </section>

      {autres.length > 0 && (
        <section className="bg-white py-16 lg:py-[90px]">
          <Container>
            <h2 className="section-title mb-10">Autres formations du département</h2>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {autres.map((p) => (
                <ProgramCard
                  key={p.id}
                  variant="tile"
                  cta="Voir plus"
                  titre={p.titre}
                  slug={p.slug}
                  niveau={p.niveau}
                  duree={p.duree}
                  accroche={p.accroche}
                  image={p.image}
                  departement={p.departement}
                  campus={p.campus}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

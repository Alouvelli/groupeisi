import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowRight, Download } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { DynamicIcon } from "@/components/ui/Icon";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { getDepartementBySlug, getDepartements } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import type { Niveau } from "@prisma/client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDepartementBySlug(slug);
  if (!d) return { title: "Département introuvable" };
  return { title: d.seoTitle ?? `Département ${d.nom}`, description: d.seoDescription ?? d.description, openGraph: { images: d.image ? [d.image] : undefined } };
}

export default async function DepartementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDepartementBySlug(slug);
  if (!d) notFound();
  const others = (await getDepartements()).filter((x) => x.slug !== slug);
  const niveaux = (["BTS", "LICENCE", "MASTER", "CERTIFICAT", "FORMATION_CONTINUE"] as Niveau[]).filter((n) => d.programmes.some((p) => p.niveau === n));
  const grid = (list: typeof d.programmes) => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <ProgramCard key={p.id} titre={p.titre} slug={p.slug} niveau={p.niveau} duree={p.duree} accroche={p.accroche} description={p.description} image={p.image} accreditation={p.accreditation} campus={p.campus} />
      ))}
    </div>
  );

  return (
    <>
      <PageHeader title={d.nom} subtitle={d.accroche ?? undefined} items={[{ label: "Départements", href: "/departements" }, { label: d.nom }]} image={d.image} />
      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white" style={{ background: d.couleur ?? "#0b2a5b" }}><DynamicIcon name={d.icone} className="h-8 w-8" /></span>
            <h2 className="section-title mt-6">{d.description}</h2>
            {d.contenu && <div className="prose-isi mt-6" dangerouslySetInnerHTML={{ __html: d.contenu }} />}
          </div>
          <aside className="space-y-6">
            {d.image && <div className="relative aspect-[4/3] overflow-hidden rounded-3xl"><Image src={d.image} alt={d.nom} fill sizes="33vw" className="object-cover" /></div>}
            <div className="rounded-card border border-line bg-surface p-6">
              <h3 className="text-lg font-extrabold text-primary">En bref</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex justify-between border-b border-line pb-2"><span className="text-muted">Formations</span><strong>{d.programmes.length}</strong></li>
                <li className="flex justify-between border-b border-line pb-2"><span className="text-muted">Niveaux</span><strong>{niveaux.map((n) => NIVEAU_LABELS[n]).join(", ")}</strong></li>
                <li className="flex justify-between"><span className="text-muted">Enseignants</span><strong>{d.personnes.length}+</strong></li>
              </ul>
              <Button href="/pre-inscription" variant="secondary" className="mt-6 w-full">Se pré-inscrire <ArrowRight className="h-4 w-4" /></Button>
              <Button href="/telechargements" variant="ghost" className="mt-2 w-full"><Download className="h-4 w-4" /> Télécharger la brochure</Button>
            </div>
            {others.length > 0 && (
              <div className="rounded-card border border-line p-6">
                <h3 className="text-lg font-extrabold text-primary">Autres départements</h3>
                <ul className="mt-4 space-y-2">
                  {others.map((o) => (
                    <li key={o.id}><Button href={`/departements/${o.slug}`} variant="link" size="sm" className="h-auto justify-start text-left text-primary">→ {o.nom}</Button></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>

      <Section variant="surface" padding="lg">
        <SectionHeading label="Formations" title={`Les formations du département ${d.nom}`} />
        {niveaux.length > 1 ? (
          <Tabs tabs={[{ id: "all", label: "Toutes", count: d.programmes.length, content: grid(d.programmes) }, ...niveaux.map((n) => ({ id: n, label: NIVEAU_LABELS[n], count: d.programmes.filter((p) => p.niveau === n).length, content: grid(d.programmes.filter((p) => p.niveau === n)) }))]} />
        ) : (
          grid(d.programmes)
        )}
      </Section>

      {d.personnes.length > 0 && (
        <Section padding="lg">
          <SectionHeading label="Équipe" title="Les enseignants du département" />
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {d.personnes.map((p) => (
              <TeamCard key={p.id} prenom={p.prenom} nom={p.nom} slug={p.slug} poste={p.poste} photo={p.photo} email={p.email} linkedin={p.linkedin} />
            ))}
          </div>
        </Section>
      )}
    </>
  );
}

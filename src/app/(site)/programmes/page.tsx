import type { Metadata } from "next";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { getProgrammes, getDepartements, getCampus } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Niveau } from "@prisma/client";

export const metadata: Metadata = { title: "Nos formations", description: "Toutes les formations du Groupe ISI : BTS, Licences, Masters, certifications en informatique, réseaux, télécoms, cybersécurité et management." };

type Search = { niveau?: string; departement?: string; campus?: string; q?: string };

export default async function ProgrammesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [programmes, departements, campus] = await Promise.all([getProgrammes(sp), getDepartements(), getCampus()]);
  const niveaux = Object.keys(NIVEAU_LABELS) as Niveau[];
  const link = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    const merged = { ...sp, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const qs = p.toString();
    return qs ? `/programmes?${qs}` : "/programmes";
  };
  const hasFilters = Boolean(sp.niveau || sp.departement || sp.campus || sp.q);

  return (
    <>
      <PageHeader title="Nos formations" subtitle="BTS, Licences, Masters et certifications : trouvez la formation adaptée à votre projet professionnel." items={[{ label: "Formations" }]} />
      <Section padding="lg">
        <div className="grid gap-10 lg:grid-cols-4">
          <aside className="space-y-8 lg:col-span-1">
            <form action="/programmes" method="get" className="relative">
              {sp.niveau && <input type="hidden" name="niveau" value={sp.niveau} />}
              {sp.departement && <input type="hidden" name="departement" value={sp.departement} />}
              <label htmlFor="q" className="sr-only">Rechercher une formation</label>
              <input id="q" name="q" defaultValue={sp.q} placeholder="Rechercher une formation…" className="field-input rounded-full pl-11" />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </form>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-primary"><SlidersHorizontal className="h-4 w-4 text-secondary" /> Niveau</h3>
              <ul className="space-y-1">
                <li><Link href={link({ niveau: undefined })} className={cn("block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary-50", !sp.niveau && "bg-primary text-white hover:bg-primary")}>Tous les niveaux</Link></li>
                {niveaux.map((n) => (
                  <li key={n}><Link href={link({ niveau: n })} className={cn("block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary-50", sp.niveau === n && "bg-primary text-white hover:bg-primary")}>{NIVEAU_LABELS[n]}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-primary">Département</h3>
              <ul className="space-y-1">
                <li><Link href={link({ departement: undefined })} className={cn("block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary-50", !sp.departement && "bg-primary text-white hover:bg-primary")}>Tous</Link></li>
                {departements.map((d) => (
                  <li key={d.id}><Link href={link({ departement: d.slug })} className={cn("block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary-50", sp.departement === d.slug && "bg-primary text-white hover:bg-primary")}>{d.nom}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-primary">Campus</h3>
              <ul className="flex flex-wrap gap-2">
                {campus.map((c) => (
                  <li key={c.id}><Link href={link({ campus: sp.campus === c.slug ? undefined : c.slug })} className={cn("inline-block rounded-full border border-line px-3 py-1.5 text-xs font-semibold hover:bg-primary-50", sp.campus === c.slug && "border-secondary bg-secondary text-white hover:bg-secondary")}>{c.ville}</Link></li>
                ))}
              </ul>
            </div>
          </aside>
          <div className="lg:col-span-3">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted"><strong className="text-primary">{programmes.length}</strong> formation{programmes.length > 1 ? "s" : ""} {hasFilters ? "correspondent à vos critères" : "disponibles"}</p>
              {hasFilters && <Link href="/programmes" className="inline-flex items-center gap-1 text-sm font-bold text-secondary"><X className="h-4 w-4" /> Réinitialiser les filtres</Link>}
            </div>
            {programmes.length === 0 ? (
              <div className="rounded-card border border-dashed border-line p-12 text-center text-muted">Aucune formation ne correspond à votre recherche.</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {programmes.map((p) => (
                  <ProgramCard key={p.id} titre={p.titre} slug={p.slug} niveau={p.niveau} duree={p.duree} accroche={p.accroche} description={p.description} image={p.image} accreditation={p.accreditation} departement={p.departement} campus={p.campus} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}

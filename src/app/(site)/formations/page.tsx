import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { getProgrammes, getDepartements, getCampus } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Niveau } from "@prisma/client";

export const metadata: Metadata = {
  title: "Nos formations",
  description:
    "Toutes les formations du Groupe ISI : licences, bachelors et masters en génie logiciel, réseaux, cybersécurité, data science, télécommunications et management.",
};

type Search = { niveau?: string; departement?: string; campus?: string; q?: string };

export default async function FormationsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const [programmes, departements, campus] = await Promise.all([getProgrammes(sp), getDepartements(), getCampus()]);
  const niveaux = ["LICENCE", "BACHELOR", "MASTER", "INGENIEUR"] as Niveau[];

  const link = (patch: Partial<Search>) => {
    const p = new URLSearchParams();
    Object.entries({ ...sp, ...patch }).forEach(([k, v]) => v && p.set(k, v));
    const qs = p.toString();
    return qs ? `/formations?${qs}` : "/formations";
  };
  const hasFilters = Boolean(sp.niveau || sp.departement || sp.campus || sp.q);

  return (
    <>
      <PageHeader
        title="Nos formations"
        subtitle="Licences, bachelors et masters professionnels, reconnus par l'ANAQ-Sup et le CAMES."
        items={[{ label: "Nos formations" }]}
      />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid gap-10 lg:grid-cols-4 lg:gap-12">
            {/* Colonne de filtres */}
            <aside className="space-y-9 lg:col-span-1">
              <div className="flex items-center justify-between">
                <h4 className="inline-flex items-center gap-2 font-heading text-[20px] font-semibold text-dark">
                  <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden /> Filtrer par
                </h4>
                {hasFilters && (
                  <Link href="/formations" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:text-secondary-dark">
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Réinitialiser
                  </Link>
                )}
              </div>

              <form action="/formations" method="get" className="relative">
                {sp.niveau && <input type="hidden" name="niveau" value={sp.niveau} />}
                {sp.departement && <input type="hidden" name="departement" value={sp.departement} />}
                {sp.campus && <input type="hidden" name="campus" value={sp.campus} />}
                <label htmlFor="q" className="sr-only">
                  Rechercher une formation
                </label>
                <input id="q" name="q" defaultValue={sp.q} placeholder="Rechercher une formation…" className="field-input pl-11" />
                <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              </form>

              <div>
                <h5 className="mb-3 font-heading text-[18px] font-semibold text-dark">Campus</h5>
                <ul className="space-y-1.5 text-[15px]">
                  {campus.slice(0, 9).map((c) => (
                    <li key={c.id}>
                      <Link
                        href={link({ campus: sp.campus === c.slug ? undefined : c.slug })}
                        className={cn("inline-flex items-center gap-2 text-body transition hover:text-primary", sp.campus === c.slug && "font-semibold text-primary")}
                      >
                        <span className={cn("h-3.5 w-3.5 rounded-sm border", sp.campus === c.slug ? "border-primary bg-primary" : "border-line")} aria-hidden />
                        {c.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="mb-3 font-heading text-[18px] font-semibold text-dark">Départements</h5>
                <ul className="space-y-1.5 text-[15px]">
                  {departements.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={link({ departement: sp.departement === d.slug ? undefined : d.slug })}
                        className={cn("inline-flex items-start gap-2 text-body transition hover:text-primary", sp.departement === d.slug && "font-semibold text-primary")}
                      >
                        <span className={cn("mt-1 h-3.5 w-3.5 shrink-0 rounded-sm border", sp.departement === d.slug ? "border-primary bg-primary" : "border-line")} aria-hidden />
                        {d.nom}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="mb-3 font-heading text-[18px] font-semibold text-dark">Niveaux</h5>
                <ul className="space-y-1.5 text-[15px]">
                  {niveaux.map((n) => (
                    <li key={n}>
                      <Link
                        href={link({ niveau: sp.niveau === n ? undefined : n })}
                        className={cn("inline-flex items-center gap-2 text-body transition hover:text-primary", sp.niveau === n && "font-semibold text-primary")}
                      >
                        <span className={cn("h-3.5 w-3.5 rounded-sm border", sp.niveau === n ? "border-primary bg-primary" : "border-line")} aria-hidden />
                        {NIVEAU_LABELS[n]}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Résultats */}
            <div className="lg:col-span-3">
              <p className="mb-8 text-[15px] text-body">
                <strong className="font-semibold text-dark">{programmes.length}</strong> programme{programmes.length > 1 ? "s" : ""}{" "}
                {hasFilters ? "correspondent à vos critères" : "trouvés au total"}
              </p>

              {programmes.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line p-12 text-center text-body">
                  Aucune formation ne correspond à votre recherche.
                </div>
              ) : (
                <div className="grid gap-[30px] sm:grid-cols-2 xl:grid-cols-3">
                  {programmes.map((p) => (
                    <ProgramCard
                      key={p.id}
                      variant="tile"
                      cta="Voir plus"
                      titre={p.titre}
                      slug={p.slug}
                      niveau={p.niveau}
                      duree={p.duree}
                      accroche={p.accroche}
                      description={p.description}
                      image={p.image}
                      departement={p.departement}
                      campus={p.campus}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

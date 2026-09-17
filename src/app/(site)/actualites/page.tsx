import type { Metadata } from "next";
import Link from "next/link";
import { Search, Tag } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { Pagination } from "@/components/ui/Pagination";
import { NewsCard } from "@/components/cards/NewsCard";
import { getPosts, getCategories, getLatestPosts } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Actualités", description: "Toute l'actualité du Groupe ISI : admissions, événements, partenariats, réussites de nos étudiants." };

export default async function ActualitesPage({ searchParams }: { searchParams: Promise<{ page?: string; categorie?: string; q?: string; tag?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const [result, categories, latest] = await Promise.all([getPosts({ page, categorie: sp.categorie, q: sp.q, tag: sp.tag }), getCategories(), getLatestPosts(4)]);
  return (
    <>
      <PageHeader title="Actualités" subtitle="Suivez la vie du Groupe ISI : admissions, événements, partenariats et réussites." items={[{ label: "Actualités" }]} />
      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-3">
            {result.items.length === 0 ? (
              <div className="rounded-card border border-dashed border-line p-12 text-center text-muted">Aucun article trouvé.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {result.items.map((p) => (
                  <NewsCard key={p.id} titre={p.titre} slug={p.slug} extrait={p.extrait} image={p.image} publishedAt={p.publishedAt} tempsLecture={p.tempsLecture} categorie={p.categorie} />
                ))}
              </div>
            )}
            <Pagination page={result.page} pages={result.pages} basePath="/actualites" params={{ categorie: sp.categorie, q: sp.q, tag: sp.tag }} />
          </div>
          <aside className="space-y-8">
            <form action="/actualites" className="relative">
              <input name="q" defaultValue={sp.q} placeholder="Rechercher…" aria-label="Rechercher un article" className="field-input rounded-full pl-11" />
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </form>
            <div>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-primary">Catégories</h3>
              <ul className="space-y-1">
                <li><Link href="/actualites" className={cn("flex justify-between rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary-50", !sp.categorie && "bg-primary text-white hover:bg-primary")}>Toutes</Link></li>
                {categories.map((c) => (
                  <li key={c.id}><Link href={`/actualites?categorie=${c.slug}`} className={cn("flex justify-between rounded-xl px-3 py-2 text-sm font-semibold hover:bg-primary-50", sp.categorie === c.slug && "bg-primary text-white hover:bg-primary")}>{c.nom} <span className="opacity-60">{c._count.posts}</span></Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-primary">Articles récents</h3>
              <ul className="space-y-4">
                {latest.map((p) => (
                  <li key={p.id}><Link href={`/actualites/${p.slug}`} className="group block"><span className="text-xs font-semibold text-slate-400">{formatDate(p.publishedAt)}</span><span className="block text-sm font-bold text-primary group-hover:text-secondary">{p.titre}</span></Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-primary"><Tag className="h-4 w-4 text-secondary" /> Tags</h3>
              <div className="flex flex-wrap gap-2">{Array.from(new Set(latest.flatMap((p) => p.tags))).map((t) => <Link key={t} href={`/actualites?tag=${encodeURIComponent(t)}`} className="rounded-full border border-line px-3 py-1 text-xs font-semibold hover:bg-primary-50">#{t}</Link>)}</div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}

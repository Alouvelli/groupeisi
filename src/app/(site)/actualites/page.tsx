import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Pagination } from "@/components/ui/Pagination";
import { NewsCard } from "@/components/cards/NewsCard";
import { getPosts, getCategories, getLatestPosts } from "@/lib/data";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Toute l'actualité du Groupe ISI : vie de l'institut, distinctions, partenariats, sport et vie associative.",
};

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categorie?: string; q?: string; tag?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const [result, categories, latest] = await Promise.all([
    getPosts({ page, pageSize: 9, categorie: sp.categorie, q: sp.q, tag: sp.tag }),
    getCategories(),
    getLatestPosts(3),
  ]);

  return (
    <>
      <PageHeader
        title="Actualités"
        subtitle="Suivez la vie du Groupe ISI : distinctions, partenariats, vie associative et sportive."
        items={[{ label: "Actualités" }]}
        image="/media/img-2298-1.jpg"
      />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-4 lg:gap-14">
            <div className="lg:col-span-3">
              {result.items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-line p-12 text-center text-body">Aucun article trouvé.</div>
              ) : (
                <div className="grid gap-[30px] sm:grid-cols-2 xl:grid-cols-3">
                  {result.items.map((p) => (
                    <NewsCard
                      key={p.id}
                      titre={p.titre}
                      slug={p.slug}
                      extrait={p.extrait}
                      image={p.image}
                      publishedAt={p.publishedAt}
                      tempsLecture={p.tempsLecture}
                      categorie={p.categorie}
                      auteur={p.auteur?.nom}
                    />
                  ))}
                </div>
              )}
              <Pagination page={result.page} pages={result.pages} basePath="/actualites" params={{ categorie: sp.categorie, q: sp.q, tag: sp.tag }} />
            </div>

            <aside className="space-y-10">
              <div>
                <h3 className="mb-4 font-heading text-[20px] font-semibold text-dark">Rechercher</h3>
                <form action="/actualites" className="relative">
                  <label htmlFor="news-q" className="sr-only">
                    Rechercher un article
                  </label>
                  <input id="news-q" name="q" defaultValue={sp.q} placeholder="Rechercher…" className="field-input pl-11" />
                  <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                </form>
              </div>

              <div>
                <h3 className="mb-4 font-heading text-[20px] font-semibold text-dark">Catégories</h3>
                <ul className="divide-y divide-line border-y border-line">
                  <li>
                    <Link
                      href="/actualites"
                      className={cn("flex justify-between py-3 text-[15px] transition hover:text-primary", !sp.categorie ? "font-semibold text-primary" : "text-body")}
                    >
                      Toutes <span className="text-muted">{categories.reduce((n, c) => n + c._count.posts, 0)}</span>
                    </Link>
                  </li>
                  {categories.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/actualites?categorie=${c.slug}`}
                        className={cn("flex justify-between py-3 text-[15px] transition hover:text-primary", sp.categorie === c.slug ? "font-semibold text-primary" : "text-body")}
                      >
                        {c.nom} <span className="text-muted">{c._count.posts}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-4 font-heading text-[20px] font-semibold text-dark">Articles récents</h3>
                <ul className="space-y-5">
                  {latest.map((p) => (
                    <li key={p.id} className="flex gap-4">
                      <Link href={`/actualites/${p.slug}`} className="relative h-20 w-24 shrink-0 overflow-hidden rounded">
                        <Image src={p.image || "/media/img-2024-1.jpg"} alt="" fill sizes="96px" className="object-cover" />
                      </Link>
                      <div>
                        <span className="text-[13px] text-muted">{formatDate(p.publishedAt)}</span>
                        <h4 className="mt-0.5 font-heading text-[15px] font-semibold leading-snug text-dark transition hover:text-primary">
                          <Link href={`/actualites/${p.slug}`}>{p.titre}</Link>
                        </h4>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}

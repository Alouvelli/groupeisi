import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Folder, User } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { NewsCard } from "@/components/cards/NewsCard";
import { Button } from "@/components/ui/Button";
import { getPostBySlug, getRelatedPosts } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatDate, absoluteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return { title: "Article introuvable" };
  return {
    title: p.seoTitle ?? p.titre,
    description: p.seoDescription ?? p.extrait,
    alternates: { canonical: `/actualites/${p.slug}` },
    openGraph: { type: "article", publishedTime: p.publishedAt?.toISOString(), images: p.image ? [p.image] : undefined },
  };
}

export default async function ActualitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) notFound();
  const related = await getRelatedPosts(p.id, p.categorieId);
  prisma.post.update({ where: { id: p.id }, data: { vues: { increment: 1 } } }).catch(() => null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: p.titre,
    description: p.extrait,
    image: p.image ? absoluteUrl(p.image) : undefined,
    datePublished: p.publishedAt?.toISOString(),
    author: { "@type": "Organization", name: "Groupe ISI" },
    url: absoluteUrl(`/actualites/${p.slug}`),
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <PageHeader
        title={p.titre}
        items={[{ label: "Actualités", href: "/actualites" }, ...(p.categorie ? [{ label: p.categorie.nom }] : [])]}
        image={p.image}
      />

      <section className="bg-white py-16 lg:py-[90px]">
        <Container narrow>
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] font-medium text-body">
            {p.categorie && (
              <Link href={`/actualites?categorie=${p.categorie.slug}`} className="inline-flex items-center gap-1.5 transition hover:text-primary">
                <Folder className="h-4 w-4 text-primary" aria-hidden /> {p.categorie.nom}
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden /> {formatDate(p.publishedAt)}
            </span>
            {p.tempsLecture ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" aria-hidden /> {p.tempsLecture} min de lecture
              </span>
            ) : null}
            {p.auteur?.nom && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-4 w-4 text-primary" aria-hidden /> {p.auteur.nom}
              </span>
            )}
          </div>

          {p.image && (
            <Image src={p.image} alt={p.titre} width={1100} height={620} className="mb-10 h-auto w-full rounded-lg object-cover" priority />
          )}

          <p className="text-[17px] font-medium leading-8 text-dark">{p.extrait}</p>
          <div className="prose-isi mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: p.contenu }} />

          {p.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2.5 border-t border-line pt-8">
              {p.tags.map((t) => (
                <li key={t}>
                  <Link href={`/actualites?tag=${encodeURIComponent(t)}`} className="rounded-full border border-line px-4 py-1.5 text-[13px] text-body transition hover:border-primary hover:text-primary">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Button href="/actualites" variant="outline" className="mt-10">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Toutes les actualités
          </Button>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-surface py-16 lg:py-[90px]">
          <Container>
            <h2 className="section-title mb-10">Articles similaires</h2>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <NewsCard key={r.id} titre={r.titre} slug={r.slug} extrait={r.extrait} image={r.image} publishedAt={r.publishedAt} categorie={r.categorie} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}

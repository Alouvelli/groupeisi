import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, Tag, User, ArrowLeft } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { NewsCard } from "@/components/cards/NewsCard";
import { Button } from "@/components/ui/Button";
import { getPostBySlug, getRelatedPosts } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { formatDate, absoluteUrl } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) return { title: "Article introuvable" };
  return { title: p.seoTitle ?? p.titre, description: p.seoDescription ?? p.extrait, openGraph: { type: "article", publishedTime: p.publishedAt?.toISOString(), images: p.image ? [p.image] : undefined } };
}

export default async function ActualitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPostBySlug(slug);
  if (!p) notFound();
  const related = await getRelatedPosts(p.id, p.categorieId);
  prisma.post.update({ where: { id: p.id }, data: { vues: { increment: 1 } } }).catch(() => null);
  const shareUrl = absoluteUrl(`/actualites/${p.slug}`);
  const jsonLd = { "@context": "https://schema.org", "@type": "NewsArticle", headline: p.titre, description: p.extrait, image: p.image, datePublished: p.publishedAt?.toISOString(), author: { "@type": "Organization", name: "Groupe ISI" }, url: shareUrl };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative bg-primary text-white">
        {p.image && <Image src={p.image} alt="" fill sizes="100vw" className="object-cover opacity-30" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary/80 to-primary/60" />
        <Container className="relative py-16 sm:py-24">
          <Breadcrumb items={[{ label: "Actualités", href: "/actualites" }, ...(p.categorie ? [{ label: p.categorie.nom, href: `/actualites?categorie=${p.categorie.slug}` }] : []), { label: p.titre }]} className="mb-6" />
          {p.categorie && <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide text-white" style={{ background: p.categorie.couleur ?? "#f26522" }}>{p.categorie.nom}</span>}
          <h1 className="mt-4 max-w-4xl font-heading text-3xl font-extrabold text-white text-balance sm:text-4xl lg:text-5xl">{p.titre}</h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> {formatDate(p.publishedAt)}</span>
            {p.tempsLecture && <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-accent" /> {p.tempsLecture} min de lecture</span>}
            {p.auteur && <span className="inline-flex items-center gap-2"><User className="h-4 w-4 text-accent" /> {p.auteur.nom}</span>}
          </div>
        </Container>
      </div>
      <Section padding="lg">
        <div className="mx-auto max-w-3xl">
          {p.image && <div className="relative -mt-28 mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-card"><Image src={p.image} alt={p.titre} fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" /></div>}
          <p className="text-lg font-semibold leading-relaxed text-slate-700">{p.extrait}</p>
          <div className="prose-isi mt-6 text-[17px]" dangerouslySetInnerHTML={{ __html: p.contenu }} />
          {p.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-6">
              <Tag className="h-4 w-4 text-secondary" />
              {p.tags.map((t) => <Link key={t} href={`/actualites?tag=${encodeURIComponent(t)}`} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold hover:bg-primary-50">#{t}</Link>)}
            </div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <Button href="/actualites" variant="ghost"><ArrowLeft className="h-4 w-4" /> Toutes les actualités</Button>
            <div className="flex gap-2 text-sm">
              <a className="rounded-full bg-surface px-4 py-2 font-semibold hover:bg-primary-50" target="_blank" rel="noopener noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}>Facebook</a>
              <a className="rounded-full bg-surface px-4 py-2 font-semibold hover:bg-primary-50" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}>LinkedIn</a>
              <a className="rounded-full bg-surface px-4 py-2 font-semibold hover:bg-primary-50" target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${p.titre} – ${shareUrl}`)}`}>WhatsApp</a>
            </div>
          </div>
        </div>
      </Section>
      {related.length > 0 && (
        <Section variant="surface" padding="lg">
          <SectionHeading label="À lire aussi" title="Articles similaires" />
          <div className="grid gap-6 md:grid-cols-3">{related.map((r) => <NewsCard key={r.id} titre={r.titre} slug={r.slug} extrait={r.extrait} image={r.image} publishedAt={r.publishedAt} categorie={r.categorie} />)}</div>
        </Section>
      )}
    </article>
  );
}

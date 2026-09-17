import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories] = await Promise.all([prisma.post.findUnique({ where: { id } }), prisma.categorieActualite.findMany({ select: { id: true, nom: true }, orderBy: { ordre: "asc" } })]);
  if (!p) notFound();
  return (
    <>
      <PageTitle title={`Modifier : ${p.titre}`} actions={<Link href={`/actualites/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-secondary">Voir sur le site <ExternalLink className="h-4 w-4" /></Link>} />
      <PostForm id={p.id} categories={categories} defaultValues={{ titre: p.titre, slug: p.slug, extrait: p.extrait, contenu: p.contenu, image: p.image ?? "", categorieId: p.categorieId ?? "", tags: p.tags.join(", "), isPublished: p.isPublished, isFeatured: p.isFeatured, publishedAt: p.publishedAt ? new Date(p.publishedAt.getTime() - p.publishedAt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "" }} />
    </>
  );
}

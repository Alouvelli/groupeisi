"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { postSchema, type PostFormValues } from "@/lib/validations";
import { readingTime } from "@/lib/utils";
import type { ActionResult } from "./newsletter";

export async function savePost(id: string | null, input: PostFormValues): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Veuillez corriger les erreurs.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const d = parsed.data;
  const existing = await prisma.post.findUnique({ where: { slug: d.slug } });
  if (existing && existing.id !== id) return { ok: false, message: "Ce slug est déjà utilisé.", errors: { slug: ["Slug déjà utilisé"] } };
  const data = {
    titre: d.titre, slug: d.slug, extrait: d.extrait, contenu: d.contenu, image: d.image || null,
    categorieId: d.categorieId || null, tags: (d.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
    isPublished: d.isPublished, isFeatured: d.isFeatured, tempsLecture: readingTime(d.contenu),
    publishedAt: d.isPublished ? (d.publishedAt ? new Date(d.publishedAt) : existing?.publishedAt ?? new Date()) : null,
  };
  try {
    const p = id ? await prisma.post.update({ where: { id }, data }) : await prisma.post.create({ data: { ...data, auteurId: user.id } });
    revalidatePath("/admin/actualites");
    revalidatePath("/actualites");
    revalidatePath("/");
    return { ok: true, message: id ? "Article mis à jour." : "Article créé.", data: { id: p.id } };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Erreur lors de l'enregistrement." };
  }
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireUser();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  return { ok: true, message: "Article supprimé." };
}

export async function togglePostPublished(id: string): Promise<ActionResult> {
  await requireUser();
  const p = await prisma.post.findUnique({ where: { id }, select: { isPublished: true, publishedAt: true } });
  if (!p) return { ok: false, message: "Introuvable." };
  await prisma.post.update({ where: { id }, data: { isPublished: !p.isPublished, publishedAt: !p.isPublished ? (p.publishedAt ?? new Date()) : p.publishedAt } });
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  revalidatePath("/");
  return { ok: true, message: p.isPublished ? "Article dépublié." : "Article publié." };
}

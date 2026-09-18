import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ["/", "/a-propos", "/departements", "/formations", "/condition-admission", "/campus", "/actualites", "/evenements", "/alumnis", "/equipe", "/galerie", "/faq", "/preinscription", "/contact", "/telechargements", "/frais-d-etudes", "/librairie", "/temoignages", "/mot-du-president", "/a-propos/histoire", "/a-propos/administration", "/a-propos/localisation", "/mentions-legales", "/confidentialite"];
  const [deps, progs, campus, posts, events, alumni, personnes] = await Promise.all([
    prisma.departement.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.programme.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.campus.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.post.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.evenement.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.alumni.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.personne.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);
  const map = (base: string, items: { slug: string; updatedAt: Date }[], priority: number): MetadataRoute.Sitemap => items.map((i) => ({ url: absoluteUrl(`${base}/${i.slug}`), lastModified: i.updatedAt, changeFrequency: "monthly", priority }));
  return [
    ...statics.map((p) => ({ url: absoluteUrl(p), lastModified: new Date(), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...map("/departements", deps, 0.7),
    ...map("/formations", progs, 0.8),
    ...map("/campus", campus, 0.7),
    ...map("/actualites", posts, 0.6),
    ...map("/evenements", events, 0.5),
    ...map("/alumni", alumni, 0.4),
    ...map("/equipe", personnes, 0.4),
  ];
}

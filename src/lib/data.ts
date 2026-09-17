/**
 * Accès aux données pour les pages publiques (Server Components).
 */
import { cache } from "react";
import { prisma } from "./prisma";

export const getSettings = cache(async () => {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return (
    s ??
    (await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default", siteName: "Groupe ISI" },
      update: {},
    }))
  );
});

export const getNavigation = cache(async () => {
  const items = await prisma.navigationItem.findMany({
    where: { isActive: true, parentId: null },
    orderBy: { ordre: "asc" },
    include: { children: { where: { isActive: true }, orderBy: { ordre: "asc" } } },
  });
  return {
    header: items.filter((i) => i.location === "HEADER"),
    footer: items.filter((i) => i.location === "FOOTER"),
    footerSecondary: items.filter((i) => i.location === "FOOTER_SECONDARY"),
  };
});

export const getDepartements = cache(async () =>
  prisma.departement.findMany({
    where: { isActive: true },
    orderBy: { ordre: "asc" },
    include: { _count: { select: { programmes: { where: { isActive: true } } } } },
  }),
);

export const getDepartementBySlug = cache(async (slug: string) =>
  prisma.departement.findFirst({
    where: { slug, isActive: true },
    include: {
      programmes: { where: { isActive: true }, orderBy: [{ niveau: "asc" }, { ordre: "asc" }], include: { campus: { select: { id: true, nom: true, slug: true } } } },
      personnes: { where: { isActive: true }, orderBy: { ordre: "asc" }, take: 8 },
    },
  }),
);

export const getProgrammes = cache(async (filters: { niveau?: string; departement?: string; campus?: string; q?: string } = {}) =>
  prisma.programme.findMany({
    where: {
      isActive: true,
      ...(filters.niveau ? { niveau: filters.niveau as never } : {}),
      ...(filters.departement ? { departement: { slug: filters.departement } } : {}),
      ...(filters.campus ? { campus: { some: { slug: filters.campus } } } : {}),
      ...(filters.q ? { OR: [{ titre: { contains: filters.q, mode: "insensitive" } }, { description: { contains: filters.q, mode: "insensitive" } }] } : {}),
    },
    orderBy: [{ niveau: "asc" }, { ordre: "asc" }, { titre: "asc" }],
    include: { departement: { select: { id: true, nom: true, slug: true, couleur: true, icone: true } }, campus: { select: { id: true, nom: true, slug: true, ville: true } } },
  }),
);

export const getFeaturedProgrammes = cache(async (take = 6) =>
  prisma.programme.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { ordre: "asc" },
    take,
    include: { departement: { select: { nom: true, slug: true, couleur: true } }, campus: { select: { nom: true, slug: true } } },
  }),
);

export const getProgrammeBySlug = cache(async (slug: string) =>
  prisma.programme.findFirst({
    where: { slug, isActive: true },
    include: { departement: true, campus: { where: { isActive: true }, orderBy: { ordre: "asc" } } },
  }),
);

export const getProgrammesForForm = cache(async () =>
  prisma.programme.findMany({
    where: { isActive: true },
    orderBy: [{ niveau: "asc" }, { titre: "asc" }],
    select: { id: true, titre: true, niveau: true, duree: true, fraisInscription: true, departement: { select: { nom: true } }, campus: { select: { id: true, nom: true } } },
  }),
);

export const getCampus = cache(async () =>
  prisma.campus.findMany({
    where: { isActive: true },
    orderBy: [{ isSiege: "desc" }, { ordre: "asc" }],
    include: { _count: { select: { programmes: true } } },
  }),
);

export const getCampusBySlug = cache(async (slug: string) =>
  prisma.campus.findFirst({
    where: { slug, isActive: true },
    include: {
      programmes: { where: { isActive: true }, orderBy: [{ niveau: "asc" }, { ordre: "asc" }], include: { departement: { select: { nom: true, slug: true } } } },
      personnes: { where: { isActive: true }, orderBy: { ordre: "asc" }, take: 6 },
      evenements: { where: { isPublished: true, dateDebut: { gte: new Date() } }, orderBy: { dateDebut: "asc" }, take: 3 },
    },
  }),
);

export const getPosts = cache(async (opts: { page?: number; pageSize?: number; categorie?: string; q?: string; tag?: string } = {}) => {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? 9;
  const where = {
    isPublished: true,
    ...(opts.categorie ? { categorie: { slug: opts.categorie } } : {}),
    ...(opts.tag ? { tags: { has: opts.tag } } : {}),
    ...(opts.q ? { OR: [{ titre: { contains: opts.q, mode: "insensitive" as const } }, { extrait: { contains: opts.q, mode: "insensitive" as const } }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { categorie: true, auteur: { select: { nom: true, avatar: true } } },
    }),
    prisma.post.count({ where }),
  ]);
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
});

export const getLatestPosts = cache(async (take = 3) =>
  prisma.post.findMany({ where: { isPublished: true }, orderBy: { publishedAt: "desc" }, take, include: { categorie: true } }),
);

export const getPostBySlug = cache(async (slug: string) =>
  prisma.post.findFirst({ where: { slug, isPublished: true }, include: { categorie: true, auteur: { select: { nom: true, avatar: true } } } }),
);

export const getRelatedPosts = cache(async (postId: string, categorieId?: string | null, take = 3) =>
  prisma.post.findMany({
    where: { isPublished: true, id: { not: postId }, ...(categorieId ? { categorieId } : {}) },
    orderBy: { publishedAt: "desc" },
    take,
    include: { categorie: true },
  }),
);

export const getCategories = cache(async () =>
  prisma.categorieActualite.findMany({ orderBy: { ordre: "asc" }, include: { _count: { select: { posts: { where: { isPublished: true } } } } } }),
);

export const getEvenements = cache(async (opts: { upcoming?: boolean; take?: number } = {}) =>
  prisma.evenement.findMany({
    where: { isPublished: true, ...(opts.upcoming ? { dateDebut: { gte: new Date(Date.now() - 24 * 3600 * 1000) } } : {}) },
    orderBy: { dateDebut: opts.upcoming ? "asc" : "desc" },
    take: opts.take,
    include: { campus: { select: { nom: true, slug: true, ville: true } } },
  }),
);

export const getEvenementBySlug = cache(async (slug: string) =>
  prisma.evenement.findFirst({ where: { slug, isPublished: true }, include: { campus: true } }),
);

export const getPersonnes = cache(async (type?: string) =>
  prisma.personne.findMany({
    where: { isActive: true, ...(type ? { type: type as never } : {}) },
    orderBy: [{ type: "asc" }, { ordre: "asc" }],
    include: { departement: { select: { nom: true, slug: true } }, campus: { select: { nom: true, slug: true } } },
  }),
);

export const getPersonneBySlug = cache(async (slug: string) =>
  prisma.personne.findFirst({ where: { slug, isActive: true }, include: { departement: true, campus: true } }),
);

export const getAlumni = cache(async (opts: { featured?: boolean; take?: number } = {}) =>
  prisma.alumni.findMany({
    where: { isActive: true, ...(opts.featured ? { isFeatured: true } : {}) },
    orderBy: [{ isFeatured: "desc" }, { promotion: "desc" }],
    take: opts.take,
  }),
);

export const getAlumniBySlug = cache(async (slug: string) => prisma.alumni.findFirst({ where: { slug, isActive: true } }));

export const getPartenaires = cache(async () => prisma.partenaire.findMany({ where: { isActive: true }, orderBy: { ordre: "asc" } }));

export const getTestimonials = cache(async (take = 6) => prisma.testimonial.findMany({ where: { isActive: true }, orderBy: { ordre: "asc" }, take }));

export const getFAQ = cache(async () => prisma.fAQ.findMany({ where: { isActive: true }, orderBy: [{ categorie: "asc" }, { ordre: "asc" }] }));

export const getDocuments = cache(async () => prisma.document.findMany({ where: { isActive: true }, orderBy: [{ type: "asc" }, { ordre: "asc" }] }));

export const getGalleryImages = cache(async () => {
  const campus = await prisma.campus.findMany({ where: { isActive: true }, select: { nom: true, slug: true, image: true, images: true } });
  const events = await prisma.evenement.findMany({ where: { isPublished: true, image: { not: null } }, select: { titre: true, image: true }, take: 12 });
  const posts = await prisma.post.findMany({ where: { isPublished: true, image: { not: null } }, select: { titre: true, image: true }, take: 12 });
  const items: { src: string; alt: string; categorie: string }[] = [];
  for (const c of campus) {
    if (c.image) items.push({ src: c.image, alt: c.nom, categorie: "Campus" });
    for (const img of c.images) items.push({ src: img, alt: c.nom, categorie: "Campus" });
  }
  for (const e of events) if (e.image) items.push({ src: e.image, alt: e.titre, categorie: "Événements" });
  for (const p of posts) if (p.image) items.push({ src: p.image, alt: p.titre, categorie: "Vie étudiante" });
  return items;
});

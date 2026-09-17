"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { programmeSchema, type ProgrammeFormValues } from "@/lib/validations";
import type { ActionResult } from "./newsletter";

const lines = (s?: string | "") => (s ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
const num = (v: number | "" | undefined) => (v === "" || v === undefined ? null : Number(v));

export async function saveProgramme(id: string | null, input: ProgrammeFormValues): Promise<ActionResult<{ id: string }>> {
  await requireUser();
  const parsed = programmeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Veuillez corriger les erreurs.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const d = parsed.data;
  const existing = await prisma.programme.findUnique({ where: { slug: d.slug } });
  if (existing && existing.id !== id) return { ok: false, message: "Ce slug est déjà utilisé.", errors: { slug: ["Slug déjà utilisé"] } };

  const data = {
    titre: d.titre, slug: d.slug, niveau: d.niveau, duree: d.duree, departementId: d.departementId,
    accroche: d.accroche || null, description: d.description, contenu: d.contenu || null,
    objectifs: lines(d.objectifs), debouches: lines(d.debouches), competences: lines(d.competences),
    conditionsAdmission: d.conditionsAdmission || null, fraisInscription: num(d.fraisInscription), fraisScolarite: num(d.fraisScolarite),
    diplome: d.diplome || null, accreditation: d.accreditation || null, image: d.image || null, brochureUrl: d.brochureUrl || null, erpCode: d.erpCode || null,
    ordre: d.ordre, isActive: d.isActive, isFeatured: d.isFeatured,
    campus: { set: d.campusIds.map((cid) => ({ id: cid })) },
  };
  try {
    const p = id
      ? await prisma.programme.update({ where: { id }, data })
      : await prisma.programme.create({ data: { ...data, campus: { connect: d.campusIds.map((cid) => ({ id: cid })) } } });
    revalidatePath("/admin/programmes");
    revalidatePath("/programmes");
    revalidatePath("/");
    return { ok: true, message: id ? "Programme mis à jour." : "Programme créé.", data: { id: p.id } };
  } catch (err) {
    console.error(err);
    return { ok: false, message: "Erreur lors de l'enregistrement." };
  }
}

export async function deleteProgramme(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (user.role === "EDITEUR") return { ok: false, message: "Action non autorisée." };
  const count = await prisma.inscription.count({ where: { programmeId: id } });
  if (count > 0) {
    await prisma.programme.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/admin/programmes");
    return { ok: true, message: `Programme désactivé (${count} inscription(s) liée(s) : suppression impossible).` };
  }
  await prisma.programme.delete({ where: { id } });
  revalidatePath("/admin/programmes");
  revalidatePath("/programmes");
  return { ok: true, message: "Programme supprimé." };
}

export async function toggleProgramme(id: string, field: "isActive" | "isFeatured"): Promise<ActionResult> {
  await requireUser();
  const p = await prisma.programme.findUnique({ where: { id }, select: { [field]: true } as never });
  if (!p) return { ok: false, message: "Introuvable." };
  await prisma.programme.update({ where: { id }, data: { [field]: !(p as Record<string, boolean>)[field] } });
  revalidatePath("/admin/programmes");
  revalidatePath("/programmes");
  revalidatePath("/");
  return { ok: true, message: "Mis à jour." };
}

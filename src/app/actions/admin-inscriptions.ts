"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inscriptionStatutSchema } from "@/lib/validations";
import { STATUT_LABELS } from "@/lib/constants";
import { enqueueEmail, enqueueERPSync, safeEnqueue } from "@/lib/queue";
import { sendEmail, statutChangeEmail } from "@/lib/email";
import type { ActionResult } from "./newsletter";

export async function updateInscriptionStatut(input: { id: string; statut: string; notesAdmin?: string; notifierCandidat?: boolean; message?: string }): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = inscriptionStatutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Données invalides." };
  const d = parsed.data;
  const inscription = await prisma.inscription.findUnique({ where: { id: d.id }, include: { programme: true } });
  if (!inscription) return { ok: false, message: "Inscription introuvable." };

  await prisma.inscription.update({
    where: { id: d.id },
    data: { statut: d.statut, notesAdmin: d.notesAdmin || null, traiteParId: user.id, traiteAt: new Date() },
  });

  // Propagation du statut vers l'ERP (mise à jour du prospect)
  if (inscription.erpProspectId && inscription.statut !== d.statut) {
    await safeEnqueue(() => enqueueERPSync({ type: "inscription.update", inscriptionId: d.id, triggeredBy: `admin:${user.email}`, fields: { statut: d.statut } }));
  }

  if (d.notifierCandidat) {
    const mail = statutChangeEmail({ prenom: inscription.prenom, nom: inscription.nom, numero: inscription.numero, statut: STATUT_LABELS[d.statut], programme: inscription.programme.titre, message: d.message || undefined });
    const queued = await safeEnqueue(() => enqueueEmail({ to: inscription.email, ref: `inscription:${d.id}`, ...mail }));
    if (!queued) await sendEmail({ to: inscription.email, ...mail });
  }

  revalidatePath("/admin/inscriptions");
  revalidatePath(`/admin/inscriptions/${d.id}`);
  revalidatePath("/admin");
  return { ok: true, message: `Statut mis à jour : ${STATUT_LABELS[d.statut]}.` };
}

export async function deleteInscription(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (user.role === "EDITEUR") return { ok: false, message: "Action non autorisée." };
  await prisma.inscription.delete({ where: { id } });
  revalidatePath("/admin/inscriptions");
  revalidatePath("/admin");
  return { ok: true, message: "Inscription supprimée." };
}

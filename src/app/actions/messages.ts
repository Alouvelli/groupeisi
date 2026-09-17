"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "./newsletter";

export async function updateMessageStatut(id: string, statut: "NOUVEAU" | "LU" | "TRAITE"): Promise<ActionResult> {
  await requireUser();
  await prisma.contactMessage.update({ where: { id }, data: { statut } });
  revalidatePath("/admin/messages");
  return { ok: true, message: "Statut mis à jour." };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireUser();
  await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
  return { ok: true, message: "Message supprimé." };
}

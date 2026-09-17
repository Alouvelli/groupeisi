"use server";

import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validations";
import { enqueueERPSync, safeEnqueue } from "@/lib/queue";

export type ActionResult<T = undefined> = { ok: true; message: string; data?: T } | { ok: false; message: string; errors?: Record<string, string[]> };

export async function subscribeNewsletter(input: { email: string; nom?: string; source?: string }): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Adresse email invalide.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const email = parsed.data.email.toLowerCase();
  try {
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing?.isActive) return { ok: true, message: "Vous êtes déjà inscrit à notre newsletter." };
    const sub = await prisma.newsletterSubscriber.upsert({
      where: { email },
      create: { email, nom: parsed.data.nom || null, source: input.source ?? "site" },
      update: { isActive: true, nom: parsed.data.nom || undefined },
    });
    await safeEnqueue(() => enqueueERPSync({ type: "newsletter.subscribe", subscriberId: sub.id }));
    return { ok: true, message: "Merci ! Vous êtes maintenant inscrit à notre newsletter." };
  } catch (err) {
    console.error("[newsletter]", err);
    return { ok: false, message: "Une erreur est survenue. Merci de réessayer." };
  }
}

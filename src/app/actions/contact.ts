"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { contactSchema, type ContactFormValues } from "@/lib/validations";
import { enqueueEmail, enqueueERPSync, safeEnqueue } from "@/lib/queue";
import { contactAdminEmail, contactConfirmationEmail, sendEmail } from "@/lib/email";
import { env } from "@/lib/env";
import type { ActionResult } from "./newsletter";

export async function submitContact(input: ContactFormValues): Promise<ActionResult<{ id: string }>> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Veuillez corriger les erreurs du formulaire.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  if (parsed.data.website) return { ok: true, message: "Message envoyé." }; // honeypot

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;

  try {
    const msg = await prisma.contactMessage.create({
      data: { nom: parsed.data.nom, email: parsed.data.email.toLowerCase(), telephone: parsed.data.telephone || null, sujet: parsed.data.sujet, message: parsed.data.message, ipAddress: ip },
    });

    const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
    const adminTo = settings?.email || env.adminNotificationEmail;
    const adminMail = contactAdminEmail(msg);
    const userMail = contactConfirmationEmail({ nom: msg.nom, sujet: msg.sujet });

    // Emails via la queue (repli : envoi direct si Redis indisponible)
    const queued = await safeEnqueue(async () => {
      if (adminTo) await enqueueEmail({ to: adminTo, replyTo: msg.email, ref: `contact:${msg.id}`, ...adminMail });
      await enqueueEmail({ to: msg.email, ref: `contact:${msg.id}`, ...userMail });
      return true;
    });
    if (!queued) {
      if (adminTo) await sendEmail({ to: adminTo, replyTo: msg.email, ...adminMail });
      await sendEmail({ to: msg.email, ...userMail });
    }
    await safeEnqueue(() => enqueueERPSync({ type: "contact.create", contactId: msg.id }));

    return { ok: true, message: "Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.", data: { id: msg.id } };
  } catch (err) {
    console.error("[contact]", err);
    return { ok: false, message: "Une erreur est survenue lors de l'envoi. Merci de réessayer." };
  }
}

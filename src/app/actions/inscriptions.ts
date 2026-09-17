"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { inscriptionSchema, type InscriptionFormValues } from "@/lib/validations";
import { enqueueERPSync, enqueueEmail, safeEnqueue } from "@/lib/queue";
import { inscriptionConfirmationEmail, inscriptionAdminEmail, sendEmail } from "@/lib/email";
import { buildInscriptionNumero } from "@/lib/utils";
import { MODE_FORMATION_LABELS, NIVEAU_LABELS } from "@/lib/constants";
import { env } from "@/lib/env";
import type { ActionResult } from "./newsletter";

/**
 * Soumission d'une pré-inscription :
 *  1. validation zod
 *  2. création de l'inscription (numéro de dossier séquentiel)
 *  3. job BullMQ « inscription.create » (synchronisation ERP avec retry)
 *  4. emails (confirmation candidat + notification admin) via la queue,
 *     avec repli en envoi direct si Redis est indisponible
 */
export async function submitInscription(input: InscriptionFormValues): Promise<ActionResult<{ id: string; numero: string }>> {
  const parsed = inscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Veuillez corriger les erreurs du formulaire.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const d = parsed.data;
  if (d.website) return { ok: false, message: "Requête invalide." }; // honeypot

  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  if (settings && !settings.inscriptionsOuvertes) return { ok: false, message: "Les pré-inscriptions sont actuellement fermées." };

  const [programme, campus] = await Promise.all([
    prisma.programme.findFirst({ where: { id: d.programmeId, isActive: true }, include: { campus: { select: { id: true } } } }),
    prisma.campus.findFirst({ where: { id: d.campusId, isActive: true } }),
  ]);
  if (!programme) return { ok: false, message: "Formation invalide.", errors: { programmeId: ["Formation invalide"] } };
  if (!campus) return { ok: false, message: "Campus invalide.", errors: { campusId: ["Campus invalide"] } };
  if (programme.campus.length && !programme.campus.some((c) => c.id === campus.id)) {
    return { ok: false, message: "Cette formation n'est pas proposée sur le campus sélectionné.", errors: { campusId: ["Formation non proposée sur ce campus"] } };
  }

  // Anti-doublon : même email + même formation dans les dernières 24 h
  const duplicate = await prisma.inscription.findFirst({
    where: { email: d.email.toLowerCase(), programmeId: d.programmeId, createdAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) } },
    select: { numero: true, id: true },
  });
  if (duplicate) return { ok: true, message: `Votre pré-inscription a déjà été enregistrée sous le numéro ${duplicate.numero}.`, data: { id: duplicate.id, numero: duplicate.numero } };

  const h = await headers();
  const ipAddress = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? undefined;
  const userAgent = h.get("user-agent") ?? undefined;

  try {
    const year = new Date().getFullYear();
    const inscription = await prisma.$transaction(async (tx) => {
      const count = await tx.inscription.count({ where: { numero: { startsWith: `ISI-${year}-` } } });
      let numero = buildInscriptionNumero(count + 1, year);
      // sécurité en cas de collision (concurrence)
      while (await tx.inscription.findUnique({ where: { numero }, select: { id: true } })) {
        numero = buildInscriptionNumero(Number(numero.split("-")[2]) + 1, year);
      }
      return tx.inscription.create({
        data: {
          numero,
          civilite: d.civilite,
          prenom: d.prenom,
          nom: d.nom,
          dateNaissance: new Date(d.dateNaissance),
          lieuNaissance: d.lieuNaissance,
          nationalite: d.nationalite,
          numeroPiece: d.numeroPiece || null,
          email: d.email.toLowerCase(),
          telephone: d.telephone,
          telephone2: d.telephone2 || null,
          adresse: d.adresse,
          ville: d.ville,
          pays: d.pays,
          niveauEtudes: d.niveauEtudes,
          serieBac: d.serieBac || null,
          anneeBac: d.anneeBac ? Number(d.anneeBac) : null,
          mentionBac: d.mentionBac || null,
          etablissementOrigine: d.etablissementOrigine,
          dernierDiplome: d.dernierDiplome || null,
          programmeId: d.programmeId,
          campusId: d.campusId,
          niveauEntree: d.niveauEntree,
          rentree: d.rentree,
          modeFormation: d.modeFormation,
          tuteurNom: d.tuteurNom || null,
          tuteurTelephone: d.tuteurTelephone || null,
          tuteurEmail: d.tuteurEmail || null,
          tuteurLien: d.tuteurLien || null,
          sourceConnaissance: d.sourceConnaissance,
          motivation: d.motivation || null,
          besoinBourse: d.besoinBourse,
          besoinLogement: d.besoinLogement,
          newsletter: d.newsletter,
          accepteConditions: true,
          ipAddress,
          userAgent,
        },
        include: { programme: true, campus: true },
      });
    });

    // Newsletter (optionnel)
    if (d.newsletter) {
      await prisma.newsletterSubscriber.upsert({ where: { email: inscription.email }, create: { email: inscription.email, nom: `${d.prenom} ${d.nom}`, source: "pre-inscription" }, update: { isActive: true } }).catch(() => null);
    }

    // Job ERP (retry auto : 3 tentatives, backoff exponentiel)
    const job = await safeEnqueue(() => enqueueERPSync({ type: "inscription.create", inscriptionId: inscription.id, triggeredBy: "site:pre-inscription" }));
    if (job) {
      await prisma.inscription.update({ where: { id: inscription.id }, data: { erpJobId: String(job.id) } });
    } else {
      await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action: "inscription.create", status: "ERROR", message: "Redis indisponible : job non ajouté à la queue. À relancer depuis l'admin.", inscriptionId: inscription.id } });
    }

    // Emails
    const emailData = {
      id: inscription.id,
      numero: inscription.numero,
      prenom: inscription.prenom,
      nom: inscription.nom,
      email: inscription.email,
      telephone: inscription.telephone,
      programme: inscription.programme.titre,
      niveau: NIVEAU_LABELS[inscription.programme.niveau],
      campus: inscription.campus.nom,
      rentree: inscription.rentree,
      niveauEntree: inscription.niveauEntree,
      modeFormation: MODE_FORMATION_LABELS[inscription.modeFormation],
      fraisInscription: inscription.programme.fraisInscription,
      createdAt: inscription.createdAt,
    };
    const candidateMail = inscriptionConfirmationEmail(emailData);
    const adminMail = inscriptionAdminEmail(emailData);
    const adminTo = settings?.emailAdmissions || settings?.email || env.adminNotificationEmail;

    const queued = await safeEnqueue(async () => {
      await enqueueEmail({ to: inscription.email, ref: `inscription:${inscription.id}`, ...candidateMail });
      if (adminTo) await enqueueEmail({ to: adminTo, ref: `inscription:${inscription.id}`, replyTo: inscription.email, ...adminMail });
      return true;
    });
    if (!queued) {
      await sendEmail({ to: inscription.email, ...candidateMail });
      if (adminTo) await sendEmail({ to: adminTo, replyTo: inscription.email, ...adminMail });
    }
    await prisma.inscription.update({ where: { id: inscription.id }, data: { emailEnvoye: true } });

    revalidatePath("/admin");
    revalidatePath("/admin/inscriptions");

    return { ok: true, message: "Votre pré-inscription a bien été enregistrée.", data: { id: inscription.id, numero: inscription.numero } };
  } catch (err) {
    console.error("[inscription]", err);
    return { ok: false, message: "Une erreur est survenue lors de l'enregistrement. Merci de réessayer ou de nous contacter." };
  }
}

/** Options du formulaire (programmes + campus) */
export async function getInscriptionOptions() {
  const [programmes, campus, settings] = await Promise.all([
    prisma.programme.findMany({ where: { isActive: true }, orderBy: [{ niveau: "asc" }, { titre: "asc" }], select: { id: true, titre: true, niveau: true, duree: true, fraisInscription: true, campus: { select: { id: true } } } }),
    prisma.campus.findMany({ where: { isActive: true }, orderBy: [{ isSiege: "desc" }, { ordre: "asc" }], select: { id: true, nom: true, ville: true } }),
    prisma.siteSettings.findUnique({ where: { id: "default" }, select: { rentreeOptions: true, inscriptionsOuvertes: true, anneeAcademique: true } }),
  ]);
  return { programmes: programmes.map((p) => ({ ...p, campusIds: p.campus.map((c) => c.id) })), campus, rentrees: settings?.rentreeOptions ?? [], ouvertes: settings?.inscriptionsOuvertes ?? true, annee: settings?.anneeAcademique ?? "" };
}

export type InscriptionOptions = Awaited<ReturnType<typeof getInscriptionOptions>>;

/** Relance manuelle de la synchronisation ERP (admin) */
export async function resyncInscription(id: string): Promise<ActionResult> {
  const inscription = await prisma.inscription.findUnique({ where: { id }, select: { id: true, erpProspectId: true } });
  if (!inscription) return { ok: false, message: "Inscription introuvable." };
  const job = await safeEnqueue(() => enqueueERPSync({ type: inscription.erpProspectId ? "inscription.update" : "inscription.create", inscriptionId: id, triggeredBy: "admin:resync" }));
  if (!job) return { ok: false, message: "Redis indisponible : impossible d'ajouter le job." };
  await prisma.inscription.update({ where: { id }, data: { erpSyncStatus: "PENDING", erpJobId: String(job.id), erpLastError: null } });
  await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action: "resync", status: "INFO", message: "Relance manuelle demandée depuis l'admin.", inscriptionId: id, jobId: String(job.id) } as Prisma.ERPLogUncheckedCreateInput });
  revalidatePath(`/admin/inscriptions/${id}`);
  return { ok: true, message: "Synchronisation relancée." };
}

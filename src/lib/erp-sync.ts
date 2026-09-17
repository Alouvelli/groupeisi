/**
 * Logique de synchronisation ERP exécutée par le worker BullMQ.
 */
import type { Job } from "bullmq";
import type { Inscription, Programme, Campus, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { ERPClient, ERPError, ERPDisabledError, type ERPProspectPayload } from "./erp-client";
import { UnrecoverableError, type ERPSyncJobData } from "./queue";
import { CIVILITE_LABELS, MODE_FORMATION_LABELS, NIVEAU_ETUDES_LABELS, NIVEAU_LABELS, SOURCE_LABELS } from "./constants";
import { sendEmail, erpFailureEmail } from "./email";
import { env } from "./env";

type InscriptionFull = Inscription & { programme: Programme; campus: Campus };

export function buildProspectPayload(i: InscriptionFull): ERPProspectPayload {
  return {
    externalId: i.id,
    reference: i.numero,
    civilite: CIVILITE_LABELS[i.civilite],
    prenom: i.prenom,
    nom: i.nom,
    email: i.email,
    telephone: i.telephone,
    telephone2: i.telephone2,
    dateNaissance: i.dateNaissance.toISOString().slice(0, 10),
    lieuNaissance: i.lieuNaissance,
    nationalite: i.nationalite,
    adresse: i.adresse,
    ville: i.ville,
    pays: i.pays,
    niveauEtudes: NIVEAU_ETUDES_LABELS[i.niveauEtudes],
    serieBac: i.serieBac,
    anneeBac: i.anneeBac,
    etablissementOrigine: i.etablissementOrigine,
    programme: { id: i.programme.id, code: i.programme.erpCode, titre: i.programme.titre, niveau: NIVEAU_LABELS[i.programme.niveau] },
    campus: { id: i.campus.id, code: i.campus.erpCode, nom: i.campus.nom },
    niveauEntree: i.niveauEntree,
    rentree: i.rentree,
    modeFormation: MODE_FORMATION_LABELS[i.modeFormation],
    tuteur: { nom: i.tuteurNom, telephone: i.tuteurTelephone, email: i.tuteurEmail, lien: i.tuteurLien },
    source: SOURCE_LABELS[i.sourceConnaissance],
    motivation: i.motivation,
    besoinBourse: i.besoinBourse,
    besoinLogement: i.besoinLogement,
    statut: i.statut,
    createdAt: i.createdAt.toISOString(),
    tags: ["site-web", "pre-inscription", i.programme.niveau.toLowerCase()],
  };
}

async function logInfo(action: string, message: string, inscriptionId?: string, jobId?: string) {
  await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action, status: "INFO", message, inscriptionId, jobId } });
}

// ---------------------------------------------------------------------------
// Processeur principal
// ---------------------------------------------------------------------------

export async function processERPSyncJob(job: Job<ERPSyncJobData>): Promise<unknown> {
  const data = job.data;
  const jobId = String(job.id);
  const attempt = job.attemptsMade + 1;

  const client = await ERPClient.fromDatabase();
  const config = await prisma.eRPConfig.findUnique({ where: { id: "default" } });

  switch (data.type) {
    case "inscription.create":
    case "inscription.update": {
      const inscription = await prisma.inscription.findUnique({
        where: { id: data.inscriptionId },
        include: { programme: true, campus: true, mapping: true },
      });
      if (!inscription) throw new UnrecoverableError(`Inscription ${data.inscriptionId} introuvable`);

      if (!client.config.isEnabled || !client.isConfigured || config?.syncInscriptions === false) {
        await prisma.inscription.update({ where: { id: inscription.id }, data: { erpSyncStatus: "SKIPPED", erpLastError: null } });
        await logInfo(data.type, "Synchronisation ignorée : intégration ERP désactivée.", inscription.id, jobId);
        return { skipped: true };
      }

      await prisma.inscription.update({
        where: { id: inscription.id },
        data: { erpSyncStatus: "SYNCING", erpAttempts: { increment: 1 }, erpJobId: jobId },
      });

      try {
        const payload = buildProspectPayload(inscription);
        const existingId = inscription.mapping?.erpEntityId ?? inscription.erpProspectId;
        const entity =
          data.type === "inscription.update" && existingId
            ? await client.updateProspect(existingId, payload, { inscriptionId: inscription.id, jobId, attempt })
            : await client.createProspect(payload, { inscriptionId: inscription.id, jobId, attempt });

        // 1) L'appel ERP a réussi : on marque l'inscription comme synchronisée quoi qu'il arrive ensuite.
        await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            erpSyncStatus: "SYNCED",
            erpProspectId: entity.id,
            erpContactId: entity.contactId ?? inscription.erpContactId,
            erpSyncedAt: new Date(),
            erpLastError: null,
          },
        });
        await prisma.eRPConfig.upsert({ where: { id: "default" }, create: { id: "default", lastSyncAt: new Date() }, update: { lastSyncAt: new Date() } });

        // 2) Mapping inscription <-> entité ERP (un conflit d'ID ne doit pas faire échouer le job).
        try {
          await prisma.eRPMapping.upsert({
            where: { inscriptionId: inscription.id },
            create: {
              inscriptionId: inscription.id,
              erpEntityType: "prospect",
              erpEntityId: entity.id,
              erpContactId: entity.contactId ?? null,
              erpUrl: entity.url ?? null,
              erpStatus: entity.status ?? null,
              lastDirection: "OUTBOUND",
              metadata: { lastAction: data.type, jobId } as Prisma.InputJsonValue,
            },
            update: {
              erpEntityId: entity.id,
              erpContactId: entity.contactId ?? undefined,
              erpUrl: entity.url ?? undefined,
              erpStatus: entity.status ?? undefined,
              lastSyncedAt: new Date(),
              lastDirection: "OUTBOUND",
              metadata: { lastAction: data.type, jobId } as Prisma.InputJsonValue,
            },
          });
        } catch (mappingErr) {
          const conflict = await prisma.eRPMapping.findFirst({ where: { erpEntityType: "prospect", erpEntityId: entity.id }, select: { inscriptionId: true } });
          await prisma.eRPLog.create({
            data: {
              direction: "OUTBOUND",
              action: `${data.type}:mapping`,
              status: "ERROR",
              message: conflict
                ? `L'ID ERP ${entity.id} est déjà associé à l'inscription ${conflict.inscriptionId} : mapping non créé (vérifier les doublons côté ERP).`
                : `Impossible d'enregistrer le mapping : ${(mappingErr as Error).message}`,
              inscriptionId: inscription.id,
              jobId,
              attempt,
              errorMessage: (mappingErr as Error).message,
            },
          });
        }

        return { erpId: entity.id, action: data.type };
      } catch (err) {
        const message = (err as Error).message;
        const retryable = err instanceof ERPError ? err.retryable : !(err instanceof ERPDisabledError);
        const max = job.opts.attempts ?? 1;
        const exhausted = !retryable || attempt >= max;
        await prisma.inscription.update({
          where: { id: inscription.id },
          data: { erpSyncStatus: exhausted ? "FAILED" : "PENDING", erpLastError: message },
        });
        if (!retryable) throw new UnrecoverableError(message);
        throw err;
      }
    }

    case "contact.create": {
      const contact = await prisma.contactMessage.findUnique({ where: { id: data.contactId } });
      if (!contact) throw new UnrecoverableError(`Message ${data.contactId} introuvable`);
      if (!client.config.isEnabled || !client.isConfigured || config?.syncContacts === false) {
        await logInfo(data.type, "Synchronisation contact ignorée : option désactivée.", undefined, jobId);
        return { skipped: true };
      }
      try {
        const entity = await client.createContact(
          { externalId: contact.id, nom: contact.nom, email: contact.email, telephone: contact.telephone, sujet: contact.sujet, message: contact.message, source: "site-web:contact", tags: ["contact"] },
          { jobId, attempt },
        );
        await prisma.contactMessage.update({ where: { id: contact.id }, data: { erpSynced: true } });
        return { erpId: entity.id };
      } catch (err) {
        if (err instanceof ERPError && !err.retryable) throw new UnrecoverableError(err.message);
        throw err;
      }
    }

    case "newsletter.subscribe": {
      const sub = await prisma.newsletterSubscriber.findUnique({ where: { id: data.subscriberId } });
      if (!sub) throw new UnrecoverableError(`Abonné ${data.subscriberId} introuvable`);
      if (!client.config.isEnabled || !client.isConfigured || !config?.syncNewsletter) return { skipped: true };
      try {
        const entity = await client.createContact({ externalId: sub.id, nom: sub.nom ?? sub.email, email: sub.email, source: "site-web:newsletter", tags: ["newsletter"] }, { jobId, attempt });
        return { erpId: entity.id };
      } catch (err) {
        if (err instanceof ERPError && !err.retryable) throw new UnrecoverableError(err.message);
        throw err;
      }
    }

    default:
      throw new UnrecoverableError(`Type de job inconnu : ${(data as { type: string }).type}`);
  }
}

// ---------------------------------------------------------------------------
// Notification admin après épuisement des tentatives
// ---------------------------------------------------------------------------

export async function notifyERPFailure(job: Job<ERPSyncJobData>, err: Error) {
  const config = await prisma.eRPConfig.findUnique({ where: { id: "default" } });
  const inscriptionId = "inscriptionId" in job.data ? job.data.inscriptionId : undefined;
  let numero: string = job.data.type;
  let existingId: string | undefined;
  if (inscriptionId) {
    const i = await prisma.inscription.findUnique({ where: { id: inscriptionId }, select: { numero: true } });
    numero = i?.numero ?? inscriptionId;
    if (i) {
      existingId = inscriptionId;
      await prisma.inscription.update({ where: { id: inscriptionId }, data: { erpSyncStatus: "FAILED", erpLastError: err.message } }).catch(() => null);
    }
  }
  await prisma.eRPLog.create({
    data: {
      direction: "OUTBOUND",
      action: job.data.type,
      status: "ERROR",
      message: `Nombre maximal de tentatives atteint (${job.attemptsMade}/${job.opts.attempts ?? 1}). Notification admin envoyée.`,
      inscriptionId: existingId,
      jobId: String(job.id),
      attempt: job.attemptsMade,
      errorMessage: err.message,
    },
  });
  const to = config?.notifyEmail || env.adminNotificationEmail;
  if (config?.notifyOnFailure !== false && to) {
    const mail = erpFailureEmail({ numero, inscriptionId: inscriptionId ?? "", jobId: String(job.id), attempts: job.attemptsMade, error: err.message, action: job.data.type });
    await sendEmail({ to, ...mail });
  }
}

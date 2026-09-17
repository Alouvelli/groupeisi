/**
 * Webhooks entrants ERP / CRM  —  POST /api/webhooks/erp
 *
 * Sécurité : signature HMAC-SHA256 (en-tête X-Signature, secret « webhookSecret » de la config ERP).
 * Corps attendu : { "event": "prospect.updated", "id"?: "evt_…", "data": { … } }
 *
 * Événements gérés :
 *   prospect.created       -> rattache l'ID ERP à l'inscription (externalId / reference / email)
 *   prospect.updated       -> met à jour le mapping (statut ERP, contactId, url)
 *   prospect.deleted       -> marque la synchro comme SKIPPED et supprime le mapping
 *   inscription.confirmed  -> statut CONFIRMEE (+ notification candidat)
 *   inscription.accepted   -> statut ACCEPTEE
 *   inscription.rejected   -> statut REFUSEE
 *   inscription.cancelled  -> statut ANNULEE
 *   contact.created        -> marque le message de contact comme synchronisé
 *   ping                   -> test de bout en bout
 */
import { NextResponse, type NextRequest } from "next/server";
import type { Prisma, InscriptionStatut } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/erp-client";
import { env } from "@/lib/env";
import { enqueueEmail, safeEnqueue } from "@/lib/queue";
import { sendEmail, statutChangeEmail } from "@/lib/email";
import { STATUT_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

interface WebhookPayload {
  event?: string;
  type?: string;
  id?: string;
  data?: Record<string, unknown>;
}

const STATUS_EVENTS: Record<string, InscriptionStatut> = {
  "inscription.confirmed": "CONFIRMEE",
  "inscription.accepted": "ACCEPTEE",
  "inscription.rejected": "REFUSEE",
  "inscription.cancelled": "ANNULEE",
  "inscription.processing": "EN_COURS",
};

async function log(action: string, status: "SUCCESS" | "ERROR" | "INFO", message: string, extra: Partial<Prisma.ERPLogUncheckedCreateInput> = {}) {
  await prisma.eRPLog.create({ data: { direction: "INBOUND", action, status, message, ...extra } }).catch(() => null);
}

/** Retrouve l'inscription visée par un événement (externalId > reference > erpId > email). */
async function findInscription(data: Record<string, unknown>) {
  const externalId = (data.externalId ?? data.external_id) as string | undefined;
  const reference = (data.reference ?? data.numero) as string | undefined;
  const erpId = (data.id ?? data.prospectId ?? data.prospect_id) as string | undefined;
  const email = data.email as string | undefined;
  if (externalId) {
    const i = await prisma.inscription.findUnique({ where: { id: externalId } });
    if (i) return i;
  }
  if (reference) {
    const i = await prisma.inscription.findUnique({ where: { numero: reference } });
    if (i) return i;
  }
  if (erpId) {
    const i = await prisma.inscription.findFirst({ where: { OR: [{ erpProspectId: String(erpId) }, { mapping: { erpEntityId: String(erpId) } }] } });
    if (i) return i;
  }
  if (email) return prisma.inscription.findFirst({ where: { email: email.toLowerCase() }, orderBy: { createdAt: "desc" } });
  return null;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") ?? req.headers.get("x-erp-signature") ?? req.headers.get("x-hub-signature-256");
  const timestamp = req.headers.get("x-timestamp");

  const config = await prisma.eRPConfig.findUnique({ where: { id: "default" } });
  const secret = config?.webhookSecret || env.erp.webhookSecret;

  if (!secret) {
    await log("webhook", "ERROR", "Webhook rejeté : aucun secret configuré.", { statusCode: 503 });
    return NextResponse.json({ error: "Webhook non configuré" }, { status: 503 });
  }
  if (!verifyWebhookSignature(rawBody, signature, secret, timestamp)) {
    await log("webhook", "ERROR", "Signature HMAC invalide.", { statusCode: 401, requestPayload: { signature, length: rawBody.length } });
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    await log("webhook", "ERROR", "Corps JSON invalide.", { statusCode: 400 });
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const event = payload.event ?? payload.type ?? "unknown";
  const data = payload.data ?? (payload as Record<string, unknown>);
  const action = `webhook:${event}`;
  const started = Date.now();

  try {
    switch (event) {
      case "ping": {
        await log(action, "SUCCESS", "Ping reçu.", { requestPayload: payload as Prisma.InputJsonValue });
        return NextResponse.json({ ok: true, pong: true, receivedAt: new Date().toISOString() });
      }

      case "prospect.created":
      case "prospect.updated": {
        const inscription = await findInscription(data);
        if (!inscription) {
          await log(action, "ERROR", "Inscription introuvable pour cet événement.", { requestPayload: data as Prisma.InputJsonValue, statusCode: 404 });
          return NextResponse.json({ ok: false, error: "Inscription introuvable" }, { status: 404 });
        }
        const erpId = String(data.id ?? data.prospectId ?? data.prospect_id ?? inscription.erpProspectId ?? "");
        const contactId = (data.contactId ?? data.contact_id) as string | undefined;
        const erpStatus = (data.status ?? data.statut) as string | undefined;
        const url = data.url as string | undefined;
        await prisma.$transaction([
          prisma.inscription.update({ where: { id: inscription.id }, data: { erpSyncStatus: "SYNCED", erpProspectId: erpId || inscription.erpProspectId, erpContactId: contactId ?? inscription.erpContactId, erpSyncedAt: new Date(), erpLastError: null } }),
          ...(erpId
            ? [prisma.eRPMapping.upsert({
                where: { inscriptionId: inscription.id },
                create: { inscriptionId: inscription.id, erpEntityType: "prospect", erpEntityId: erpId, erpContactId: contactId ?? null, erpUrl: url ?? null, erpStatus: erpStatus ?? null, lastDirection: "INBOUND", metadata: { event, eventId: payload.id ?? null } as Prisma.InputJsonValue },
                update: { erpEntityId: erpId, erpContactId: contactId ?? undefined, erpUrl: url ?? undefined, erpStatus: erpStatus ?? undefined, lastDirection: "INBOUND", lastSyncedAt: new Date(), metadata: { event, eventId: payload.id ?? null } as Prisma.InputJsonValue },
              })]
            : []),
        ]);
        await log(action, "SUCCESS", `Prospect ${erpId} rattaché au dossier ${inscription.numero}${erpStatus ? ` (statut ERP : ${erpStatus})` : ""}.`, { inscriptionId: inscription.id, requestPayload: data as Prisma.InputJsonValue, durationMs: Date.now() - started });
        return NextResponse.json({ ok: true, inscriptionId: inscription.id, numero: inscription.numero });
      }

      case "prospect.deleted": {
        const inscription = await findInscription(data);
        if (!inscription) return NextResponse.json({ ok: true, ignored: true });
        await prisma.$transaction([
          prisma.eRPMapping.deleteMany({ where: { inscriptionId: inscription.id } }),
          prisma.inscription.update({ where: { id: inscription.id }, data: { erpSyncStatus: "SKIPPED", erpProspectId: null, erpContactId: null } }),
        ]);
        await log(action, "SUCCESS", `Prospect supprimé côté ERP pour ${inscription.numero}.`, { inscriptionId: inscription.id, requestPayload: data as Prisma.InputJsonValue });
        return NextResponse.json({ ok: true });
      }

      case "inscription.confirmed":
      case "inscription.accepted":
      case "inscription.rejected":
      case "inscription.cancelled":
      case "inscription.processing": {
        const inscription = await prisma.inscription.findFirst({ where: { OR: [{ id: (data.externalId ?? data.external_id ?? "") as string }, { numero: (data.reference ?? data.numero ?? "") as string }, { erpProspectId: String(data.prospectId ?? data.prospect_id ?? data.id ?? "") }] }, include: { programme: true } });
        if (!inscription) {
          await log(action, "ERROR", "Inscription introuvable.", { requestPayload: data as Prisma.InputJsonValue, statusCode: 404 });
          return NextResponse.json({ ok: false, error: "Inscription introuvable" }, { status: 404 });
        }
        const statut = STATUS_EVENTS[event];
        await prisma.inscription.update({ where: { id: inscription.id }, data: { statut, traiteAt: new Date(), notesAdmin: data.note ? `${inscription.notesAdmin ?? ""}\n[ERP] ${String(data.note)}`.trim() : undefined } });
        await prisma.eRPMapping.updateMany({ where: { inscriptionId: inscription.id }, data: { erpStatus: (data.status as string) ?? statut, lastDirection: "INBOUND", lastSyncedAt: new Date() } });
        if (data.notify !== false && ["CONFIRMEE", "ACCEPTEE", "REFUSEE"].includes(statut)) {
          const mail = statutChangeEmail({ prenom: inscription.prenom, nom: inscription.nom, numero: inscription.numero, statut: STATUT_LABELS[statut], programme: inscription.programme.titre, message: data.message as string | undefined });
          const queued = await safeEnqueue(() => enqueueEmail({ to: inscription.email, ref: `inscription:${inscription.id}`, ...mail }));
          if (!queued) await sendEmail({ to: inscription.email, ...mail });
        }
        await log(action, "SUCCESS", `Dossier ${inscription.numero} → ${STATUT_LABELS[statut]}.`, { inscriptionId: inscription.id, requestPayload: data as Prisma.InputJsonValue, durationMs: Date.now() - started });
        return NextResponse.json({ ok: true, inscriptionId: inscription.id, statut });
      }

      case "contact.created": {
        const externalId = (data.externalId ?? data.external_id) as string | undefined;
        if (externalId) await prisma.contactMessage.updateMany({ where: { id: externalId }, data: { erpSynced: true } });
        await log(action, "SUCCESS", `Contact ${data.id ?? ""} confirmé côté ERP.`, { requestPayload: data as Prisma.InputJsonValue });
        return NextResponse.json({ ok: true });
      }

      default: {
        await log(action, "INFO", `Événement non géré : ${event}`, { requestPayload: payload as Prisma.InputJsonValue });
        return NextResponse.json({ ok: true, ignored: true, event });
      }
    }
  } catch (err) {
    await log(action, "ERROR", (err as Error).message, { requestPayload: payload as Prisma.InputJsonValue, statusCode: 500 });
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "groupeisi-erp-webhook", methods: ["POST"], events: ["ping", "prospect.created", "prospect.updated", "prospect.deleted", ...Object.keys(STATUS_EVENTS), "contact.created"] });
}

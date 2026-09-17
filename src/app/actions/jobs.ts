"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cleanQueue, pauseQueue, removeJob, retryAllFailed, retryJob, enqueueERPSync, safeEnqueue, type QueueName } from "@/lib/queue";
import type { ActionResult } from "./newsletter";

export async function retryJobAction(queue: QueueName, jobId: string): Promise<ActionResult> {
  await requireUser();
  try {
    await retryJob(queue, jobId);
    await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action: "job.retry", status: "INFO", message: `Relance manuelle du job ${jobId} (${queue})`, jobId } });
    revalidatePath("/admin/jobs");
    return { ok: true, message: "Job relancé." };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function retryAllFailedAction(queue: QueueName): Promise<ActionResult> {
  await requireUser();
  try {
    const n = await retryAllFailed(queue);
    revalidatePath("/admin/jobs");
    return { ok: true, message: `${n} job(s) relancé(s).` };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function removeJobAction(queue: QueueName, jobId: string): Promise<ActionResult> {
  await requireUser();
  try {
    await removeJob(queue, jobId);
    revalidatePath("/admin/jobs");
    return { ok: true, message: "Job supprimé." };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function cleanQueueAction(queue: QueueName, state: "completed" | "failed"): Promise<ActionResult> {
  await requireUser();
  try {
    const ids = await cleanQueue(queue, state);
    revalidatePath("/admin/jobs");
    return { ok: true, message: `${ids.length} job(s) nettoyé(s).` };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

export async function pauseQueueAction(queue: QueueName, pause: boolean): Promise<ActionResult> {
  await requireUser();
  try {
    await pauseQueue(queue, pause);
    revalidatePath("/admin/jobs");
    return { ok: true, message: pause ? "Queue mise en pause." : "Queue reprise." };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  }
}

/** Relance la synchro de toutes les inscriptions en échec ou en attente sans job. */
export async function resyncPendingInscriptions(): Promise<ActionResult> {
  await requireUser();
  const list = await prisma.inscription.findMany({ where: { erpSyncStatus: { in: ["FAILED", "PENDING"] } }, select: { id: true, erpProspectId: true } });
  let n = 0;
  for (const i of list) {
    const job = await safeEnqueue(() => enqueueERPSync({ type: i.erpProspectId ? "inscription.update" : "inscription.create", inscriptionId: i.id, triggeredBy: "admin:bulk-resync" }));
    if (job) {
      n++;
      await prisma.inscription.update({ where: { id: i.id }, data: { erpJobId: String(job.id), erpSyncStatus: "PENDING" } });
    }
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/inscriptions");
  return { ok: true, message: `${n} synchronisation(s) relancée(s).` };
}

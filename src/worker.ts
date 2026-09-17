/**
 * Worker BullMQ : traite les jobs de synchronisation ERP et d'envoi d'emails.
 *   npm run worker         (tsx src/worker.ts)
 */
import "dotenv/config";
import { createQueueWorker, QUEUE_NAMES, pingRedis, type EmailJobData } from "./lib/queue";
import { processERPSyncJob, notifyERPFailure } from "./lib/erp-sync";
import { sendEmail } from "./lib/email";
import { prisma } from "./lib/prisma";
import type { Job } from "bullmq";

async function main() {
  const redis = await pingRedis();
  if (!redis.ok) {
    console.error(`[worker] Redis injoignable : ${redis.message}`);
    process.exit(1);
  }
  await prisma.$connect();
  console.info(`[worker] Démarrage – Redis OK, base de données OK`);

  const erpWorker = createQueueWorker(QUEUE_NAMES.ERP_SYNC, processERPSyncJob, {
    concurrency: 3,
    onMaxAttemptsReached: notifyERPFailure,
  });

  const emailWorker = createQueueWorker(
    QUEUE_NAMES.EMAILS,
    async (job: Job<EmailJobData>) => {
      const res = await sendEmail(job.data);
      if (!res.ok) throw new Error(res.error ?? "Envoi email échoué");
      return { id: res.id };
    },
    { concurrency: 5 },
  );

  console.info(`[worker] En écoute sur les queues : ${QUEUE_NAMES.ERP_SYNC}, ${QUEUE_NAMES.EMAILS}`);

  const shutdown = async (signal: string) => {
    console.info(`[worker] ${signal} reçu, arrêt en cours…`);
    await Promise.all([erpWorker.close(), emailWorker.close()]);
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[worker] Erreur fatale", err);
  process.exit(1);
});

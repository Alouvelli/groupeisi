/**
 * Queue BullMQ (Redis) : synchronisation ERP + emails.
 *
 * - Retry automatique avec backoff exponentiel (3 tentatives par défaut).
 * - Les jobs échoués sont conservés pour relance manuelle (dashboard /admin/jobs).
 * - Notification admin lorsque le nombre maximal de tentatives est atteint.
 */
import { Queue, Worker, Job, QueueEvents, UnrecoverableError, type JobsOptions, type ConnectionOptions } from "bullmq";
import IORedis from "ioredis";
import { env } from "./env";

// ---------------------------------------------------------------------------
// Connexion Redis
// ---------------------------------------------------------------------------

const globalForQueue = globalThis as unknown as {
  redis?: IORedis;
  queues?: Map<string, Queue>;
};

export function getRedisConnection(): IORedis {
  if (!globalForQueue.redis) {
    globalForQueue.redis = new IORedis(env.redisUrl, {
      maxRetriesPerRequest: null, // requis par BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy: (times) => Math.min(times * 200, 5000),
    });
    globalForQueue.redis.on("error", (err) => console.error("[redis]", err.message));
  }
  return globalForQueue.redis;
}

export const connectionOptions: ConnectionOptions = getRedisConnection() as unknown as ConnectionOptions;

// ---------------------------------------------------------------------------
// Noms et types de jobs
// ---------------------------------------------------------------------------

export const QUEUE_NAMES = {
  ERP_SYNC: "erp-sync",
  EMAILS: "emails",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export type ERPSyncJobData =
  | { type: "inscription.create"; inscriptionId: string; triggeredBy?: string }
  | { type: "inscription.update"; inscriptionId: string; triggeredBy?: string; fields?: Record<string, unknown> }
  | { type: "contact.create"; contactId: string; triggeredBy?: string }
  | { type: "newsletter.subscribe"; subscriberId: string; triggeredBy?: string };

export type EmailJobData = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Identifiant fonctionnel (ex: inscription:xxx) pour retrouver l'email dans le dashboard */
  ref?: string;
};

export type JobDataMap = {
  [QUEUE_NAMES.ERP_SYNC]: ERPSyncJobData;
  [QUEUE_NAMES.EMAILS]: EmailJobData;
};

export const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 5000 }, // 5s, 10s, 20s
  removeOnComplete: { age: 7 * 24 * 3600, count: 1000 },
  removeOnFail: false, // conservé pour relance manuelle
};

// ---------------------------------------------------------------------------
// Queues (singletons)
// ---------------------------------------------------------------------------

export function getQueue<N extends QueueName>(name: N): Queue<JobDataMap[N]> {
  if (!globalForQueue.queues) globalForQueue.queues = new Map();
  let queue = globalForQueue.queues.get(name);
  if (!queue) {
    queue = new Queue(name, {
      connection: connectionOptions,
      prefix: env.queuePrefix,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    globalForQueue.queues.set(name, queue);
  }
  return queue as Queue<JobDataMap[N]>;
}

export const erpQueue = () => getQueue(QUEUE_NAMES.ERP_SYNC);
export const emailQueue = () => getQueue(QUEUE_NAMES.EMAILS);

// ---------------------------------------------------------------------------
// Helpers d'ajout
// ---------------------------------------------------------------------------

export async function enqueueERPSync(data: ERPSyncJobData, opts: JobsOptions & { attempts?: number; delayMs?: number } = {}) {
  const { delayMs, ...rest } = opts;
  const jobName = data.type;
  const jobId = `${data.type}:${"inscriptionId" in data ? data.inscriptionId : "contactId" in data ? data.contactId : data.subscriberId}:${Date.now()}`;
  return erpQueue().add(jobName, data, { ...DEFAULT_JOB_OPTIONS, ...rest, jobId, delay: delayMs });
}

export async function enqueueEmail(data: EmailJobData, opts: JobsOptions = {}) {
  return emailQueue().add("send", data, { ...DEFAULT_JOB_OPTIONS, attempts: 5, ...opts });
}

/** Ajoute un job en tolérant l'indisponibilité de Redis (retourne null). */
export async function safeEnqueue<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    console.error("[queue] Redis indisponible, job non ajouté :", (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Lecture / administration (dashboard)
// ---------------------------------------------------------------------------

export type JobState = "waiting" | "active" | "completed" | "failed" | "delayed" | "prioritized" | "waiting-children";

export interface QueueStats {
  name: QueueName;
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  isPaused: boolean;
}

export async function getQueueStats(): Promise<QueueStats[]> {
  const names = Object.values(QUEUE_NAMES);
  return Promise.all(
    names.map(async (name) => {
      const q = getQueue(name);
      const counts = await q.getJobCounts("waiting", "active", "completed", "failed", "delayed", "prioritized");
      return {
        name,
        waiting: counts.waiting ?? 0,
        active: counts.active ?? 0,
        completed: counts.completed ?? 0,
        failed: counts.failed ?? 0,
        delayed: counts.delayed ?? 0,
        paused: counts.prioritized ?? 0,
        isPaused: await q.isPaused(),
      };
    }),
  );
}

export interface SerializedJob {
  id: string;
  queue: QueueName;
  name: string;
  state: string;
  data: unknown;
  attemptsMade: number;
  maxAttempts: number;
  failedReason?: string;
  stacktrace?: string[];
  returnvalue?: unknown;
  progress?: unknown;
  timestamp: number;
  processedOn?: number;
  finishedOn?: number;
  delay?: number;
}

export async function serializeJob(job: Job, queue: QueueName): Promise<SerializedJob> {
  const state = await job.getState();
  const data = { ...(job.data as Record<string, unknown>) };
  if (queue === QUEUE_NAMES.EMAILS) delete data.html; // trop volumineux
  return {
    id: String(job.id),
    queue,
    name: job.name,
    state,
    data,
    attemptsMade: job.attemptsMade,
    maxAttempts: job.opts.attempts ?? 1,
    failedReason: job.failedReason,
    stacktrace: job.stacktrace?.slice(0, 3),
    returnvalue: job.returnvalue,
    progress: job.progress,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
    delay: job.opts.delay,
  };
}

export async function listJobs(queue: QueueName, states: JobState[] = ["waiting", "active", "delayed", "failed", "completed"], limit = 50): Promise<SerializedJob[]> {
  const q = getQueue(queue);
  const jobs = await q.getJobs(states, 0, limit - 1, false);
  const serialized = await Promise.all(jobs.map((j) => serializeJob(j, queue)));
  return serialized.sort((a, b) => b.timestamp - a.timestamp);
}

export async function retryJob(queue: QueueName, jobId: string) {
  const job = await getQueue(queue).getJob(jobId);
  if (!job) throw new Error("Job introuvable");
  const state = await job.getState();
  if (state === "failed") {
    await job.retry();
  } else if (state === "completed") {
    await job.retry("completed");
  } else {
    throw new Error(`Impossible de relancer un job à l'état « ${state} »`);
  }
  return true;
}

export async function retryAllFailed(queue: QueueName) {
  const q = getQueue(queue);
  const failed = await q.getFailed(0, 500);
  await Promise.all(failed.map((j) => j.retry().catch(() => null)));
  return failed.length;
}

export async function removeJob(queue: QueueName, jobId: string) {
  const job = await getQueue(queue).getJob(jobId);
  if (!job) return false;
  await job.remove();
  return true;
}

export async function cleanQueue(queue: QueueName, state: "completed" | "failed", olderThanMs = 0) {
  return getQueue(queue).clean(olderThanMs, 1000, state);
}

export async function pauseQueue(queue: QueueName, pause: boolean) {
  const q = getQueue(queue);
  if (pause) await q.pause();
  else await q.resume();
}

/**
 * Teste la disponibilité de Redis sans jamais bloquer.
 *
 * BullMQ impose `maxRetriesPerRequest: null` : une commande émise alors que
 * Redis est injoignable est mise en file et réessayée indéfiniment, sans
 * jamais échouer. Sans la limite de temps ci-dessous, /api/health resterait
 * donc suspendu exactement quand Redis est en panne.
 */
export async function pingRedis(timeoutMs = 1500): Promise<{ ok: boolean; message: string }> {
  let minuteur: NodeJS.Timeout | undefined;
  try {
    const r = getRedisConnection();
    const limite = new Promise<never>((_, rejeter) => {
      minuteur = setTimeout(() => rejeter(new Error(`Redis injoignable (délai de ${timeoutMs} ms dépassé)`)), timeoutMs);
    });
    if (r.status === "wait") await Promise.race([r.connect(), limite]);
    const pong = await Promise.race([r.ping(), limite]);
    return { ok: pong === "PONG", message: pong };
  } catch (err) {
    return { ok: false, message: (err as Error).message };
  } finally {
    if (minuteur) clearTimeout(minuteur);
  }
}

// ---------------------------------------------------------------------------
// Fabrique de workers (utilisée par src/worker.ts)
// ---------------------------------------------------------------------------

export type ProcessorMap = {
  [QUEUE_NAMES.ERP_SYNC]: (job: Job<ERPSyncJobData>) => Promise<unknown>;
  [QUEUE_NAMES.EMAILS]: (job: Job<EmailJobData>) => Promise<unknown>;
};

export interface WorkerHooks<D> {
  onMaxAttemptsReached?: (job: Job<D>, err: Error) => Promise<void>;
  concurrency?: number;
}

export function createQueueWorker<N extends QueueName>(name: N, processor: ProcessorMap[N], hooks: WorkerHooks<JobDataMap[N]> = {}) {
  const worker = new Worker<JobDataMap[N]>(name, processor as (job: Job<JobDataMap[N]>) => Promise<unknown>, {
    connection: connectionOptions,
    prefix: env.queuePrefix,
    concurrency: hooks.concurrency ?? 5,
    lockDuration: 60000,
  });

  worker.on("completed", (job) => console.info(`[worker:${name}] ✔ job ${job.id} (${job.name}) terminé`));
  worker.on("failed", async (job, err) => {
    if (!job) return;
    const max = job.opts.attempts ?? 1;
    const exhausted = job.attemptsMade >= max || err instanceof UnrecoverableError;
    console.warn(`[worker:${name}] ✖ job ${job.id} (${job.name}) tentative ${job.attemptsMade}/${max} : ${err.message}`);
    if (exhausted && hooks.onMaxAttemptsReached) {
      try {
        await hooks.onMaxAttemptsReached(job, err);
      } catch (e) {
        console.error(`[worker:${name}] Erreur hook onMaxAttemptsReached`, e);
      }
    }
  });
  worker.on("error", (err) => console.error(`[worker:${name}] erreur`, err.message));
  return worker;
}

export function createQueueEvents(name: QueueName) {
  return new QueueEvents(name, { connection: connectionOptions, prefix: env.queuePrefix });
}

export { UnrecoverableError };

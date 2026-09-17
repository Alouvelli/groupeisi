import { PageTitle } from "@/components/admin/ui";
import { JobsDashboard } from "@/components/admin/JobsDashboard";
import { getQueueStats, listJobs, pingRedis, QUEUE_NAMES } from "@/lib/queue";

export default async function JobsPage() {
  const redis = await pingRedis();
  const [stats, erpJobs, emailJobs] = redis.ok ? await Promise.all([getQueueStats(), listJobs(QUEUE_NAMES.ERP_SYNC), listJobs(QUEUE_NAMES.EMAILS, undefined, 30)]) : [[], [], []];
  return (
    <>
      <PageTitle title="Jobs & Queue" description="Suivi en temps réel des jobs de synchronisation ERP et d'envoi d'emails (rafraîchissement automatique toutes les 5 secondes)." />
      <JobsDashboard initial={{ redis, stats, jobs: [...erpJobs, ...emailJobs], updatedAt: new Date().toISOString() }} />
    </>
  );
}

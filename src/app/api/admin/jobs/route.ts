import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getQueueStats, listJobs, pingRedis, QUEUE_NAMES } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const redis = await pingRedis();
  if (!redis.ok) return NextResponse.json({ redis, stats: [], jobs: [], updatedAt: new Date().toISOString() });
  const [stats, erpJobs, emailJobs] = await Promise.all([getQueueStats(), listJobs(QUEUE_NAMES.ERP_SYNC), listJobs(QUEUE_NAMES.EMAILS, undefined, 30)]);
  return NextResponse.json({ redis, stats, jobs: [...erpJobs, ...emailJobs], updatedAt: new Date().toISOString() });
}

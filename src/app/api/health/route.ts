import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pingRedis } from "@/lib/queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  let db = { ok: false, message: "" };
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = { ok: true, message: "OK" };
  } catch (err) {
    db = { ok: false, message: (err as Error).message };
  }
  const redis = await pingRedis();
  const erp = await prisma.eRPConfig.findUnique({ where: { id: "default" }, select: { isEnabled: true, lastHealthCheckOk: true, lastHealthCheckAt: true } }).catch(() => null);
  const ok = db.ok;
  return NextResponse.json(
    { status: ok ? "ok" : "degraded", uptime: process.uptime(), durationMs: Date.now() - started, services: { database: db, redis, erp: { enabled: erp?.isEnabled ?? false, lastCheckOk: erp?.lastHealthCheckOk ?? null, lastCheckAt: erp?.lastHealthCheckAt ?? null } }, timestamp: new Date().toISOString() },
    { status: ok ? 200 : 503 },
  );
}

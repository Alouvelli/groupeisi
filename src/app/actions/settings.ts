"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { erpConfigSchema, settingsSchema, type ERPConfigFormValues, type SettingsFormValues } from "@/lib/validations";
import { ERPClient, loadERPConfig } from "@/lib/erp-client";
import type { ActionResult } from "./newsletter";

export async function saveSiteSettings(input: SettingsFormValues): Promise<ActionResult> {
  await requireUser();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Veuillez corriger les erreurs.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const { rentreeOptions, ...rest } = parsed.data;
  const data = Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, v === "" ? null : v]));
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data, rentreeOptions: rentreeOptions.split(",").map((s) => s.trim()).filter(Boolean) },
    update: { ...data, rentreeOptions: rentreeOptions.split(",").map((s) => s.trim()).filter(Boolean) },
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Paramètres du site enregistrés." };
}

export async function saveERPConfig(input: ERPConfigFormValues): Promise<ActionResult> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const parsed = erpConfigSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Veuillez corriger les erreurs.", errors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  const d = parsed.data;
  const current = await prisma.eRPConfig.findUnique({ where: { id: "default" } });
  // Les secrets masqués (********) ne sont pas écrasés
  const keep = (v: string, prev?: string) => (v === "********" ? (prev ?? "") : v);
  const data = {
    ...d,
    baseUrl: d.baseUrl.replace(/\/+$/, ""),
    apiKey: keep(d.apiKey, current?.apiKey),
    apiSecret: keep(d.apiSecret, current?.apiSecret),
    webhookSecret: keep(d.webhookSecret, current?.webhookSecret),
    notifyEmail: d.notifyEmail || null,
  };
  await prisma.eRPConfig.upsert({ where: { id: "default" }, create: { id: "default", ...data }, update: data });
  await prisma.eRPLog.create({ data: { direction: "OUTBOUND", action: "config.update", status: "INFO", message: `Configuration ERP mise à jour (${d.isEnabled ? "activée" : "désactivée"}).` } });
  revalidatePath("/admin/settings");
  return { ok: true, message: "Configuration ERP enregistrée." };
}

export async function testERPConnection(): Promise<ActionResult<{ ok: boolean; message: string; status: number; durationMs: number }>> {
  await requireUser();
  const config = await loadERPConfig();
  const client = new ERPClient(config);
  const result = await client.healthCheck();
  await prisma.eRPConfig.upsert({
    where: { id: "default" },
    create: { id: "default", lastHealthCheckAt: new Date(), lastHealthCheckOk: result.ok, lastHealthCheckMessage: result.message },
    update: { lastHealthCheckAt: new Date(), lastHealthCheckOk: result.ok, lastHealthCheckMessage: result.message },
  });
  revalidatePath("/admin/settings");
  return { ok: true, message: result.ok ? `Connexion réussie (${result.durationMs} ms)` : `Échec : ${result.message}`, data: result };
}

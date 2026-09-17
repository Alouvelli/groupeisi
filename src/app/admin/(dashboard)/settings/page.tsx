import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageTitle } from "@/components/admin/ui";
import { SettingsTabs } from "@/components/admin/SettingsForms";
import { env } from "@/lib/env";
import { absoluteUrl } from "@/lib/utils";

export default async function SettingsPage() {
  const user = await requireUser();
  const [settings, erp] = await Promise.all([
    prisma.siteSettings.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} }),
    prisma.eRPConfig.upsert({ where: { id: "default" }, create: { id: "default" }, update: {} }),
  ]);
  const mask = (v: string) => (v ? "********" : "");
  return (
    <>
      <PageTitle title="Paramètres" description="Configuration du site et de l'intégration ERP / CRM." />
      <SettingsTabs
        canEditERP={user.role !== "EDITEUR"}
        webhookUrl={absoluteUrl("/api/webhooks/erp")}
        envDefaults={{ baseUrl: env.erp.baseUrl, hasApiKey: Boolean(env.erp.apiKey) }}
        site={{
          siteName: settings.siteName, tagline: settings.tagline ?? "", email: settings.email ?? "", emailAdmissions: settings.emailAdmissions ?? "", phone: settings.phone ?? "", phone2: settings.phone2 ?? "", whatsapp: settings.whatsapp ?? "", address: settings.address ?? "", horaires: settings.horaires ?? "",
          facebook: settings.facebook ?? "", instagram: settings.instagram ?? "", linkedin: settings.linkedin ?? "", youtube: settings.youtube ?? "", twitter: settings.twitter ?? "", tiktok: settings.tiktok ?? "",
          heroTitle: settings.heroTitle ?? "", heroSubtitle: settings.heroSubtitle ?? "", annonceBandeau: settings.annonceBandeau ?? "", annonceLien: settings.annonceLien ?? "", seoTitle: settings.seoTitle ?? "", seoDescription: settings.seoDescription ?? "",
          inscriptionsOuvertes: settings.inscriptionsOuvertes, anneeAcademique: settings.anneeAcademique, rentreeOptions: settings.rentreeOptions.join(", "),
          statAnnees: settings.statAnnees, statEtudiants: settings.statEtudiants, statCampus: settings.statCampus, statProgrammes: settings.statProgrammes, statInsertion: settings.statInsertion, statPartenaires: settings.statPartenaires,
        }}
        erp={{
          nom: erp.nom, isEnabled: erp.isEnabled, baseUrl: erp.baseUrl, apiKey: mask(erp.apiKey), apiSecret: mask(erp.apiSecret), webhookSecret: mask(erp.webhookSecret), authHeader: erp.authHeader, timeoutMs: erp.timeoutMs,
          syncInscriptions: erp.syncInscriptions, syncContacts: erp.syncContacts, syncProspects: erp.syncProspects, syncNewsletter: erp.syncNewsletter,
          retryAttempts: erp.retryAttempts, retryDelayMs: erp.retryDelayMs, notifyEmail: erp.notifyEmail ?? "", notifyOnFailure: erp.notifyOnFailure,
          endpointProspects: erp.endpointProspects, endpointContacts: erp.endpointContacts, endpointHealth: erp.endpointHealth,
        }}
        erpState={{ lastHealthCheckAt: erp.lastHealthCheckAt?.toISOString() ?? null, lastHealthCheckOk: erp.lastHealthCheckOk, lastHealthCheckMessage: erp.lastHealthCheckMessage, lastSyncAt: erp.lastSyncAt?.toISOString() ?? null }}
      />
    </>
  );
}

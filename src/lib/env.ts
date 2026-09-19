export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "Groupe ISI",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  queuePrefix: process.env.QUEUE_PREFIX ?? "groupeisi",
  authSecret: process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32-chars-min",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Groupe ISI <no-reply@groupeisi.com>",
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? "",
  erp: {
    baseUrl: process.env.ERP_BASE_URL ?? "",
    apiKey: process.env.ERP_API_KEY ?? "",
    apiSecret: process.env.ERP_API_SECRET ?? "",
    webhookSecret: process.env.ERP_WEBHOOK_SECRET ?? "",
    timeoutMs: Number(process.env.ERP_TIMEOUT_MS ?? 15000),
  },
  /** Clé de l'API Anthropic, utilisée par le chatbot. Absente : mode documentaire. */
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  cronSecret: process.env.CRON_SECRET ?? "",
  isProd: process.env.NODE_ENV === "production",
};

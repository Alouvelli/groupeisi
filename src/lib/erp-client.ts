/**
 * Client API ERP / CRM configurable.
 *
 * - Configuration chargée depuis la table ERPConfig (admin) avec repli sur les
 *   variables d'environnement.
 * - Signature HMAC-SHA256 de chaque requête sortante (en-tête X-Signature).
 * - Journalisation de chaque appel dans ERPLog.
 * - Distinction erreurs "retryable" (réseau, 5xx, 429) / définitives (4xx).
 */
import axios, { AxiosError, AxiosInstance, Method } from "axios";
import crypto from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { env } from "./env";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ERPClientConfig {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
  authHeader: string;
  timeoutMs: number;
  isEnabled: boolean;
  endpoints: { prospects: string; contacts: string; health: string };
}

export interface ERPProspectPayload {
  externalId: string; // id de l'inscription côté site
  reference: string; // numéro de dossier ISI-2026-00001
  civilite: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  telephone2?: string | null;
  dateNaissance: string; // ISO
  lieuNaissance: string;
  nationalite: string;
  adresse: string;
  ville: string;
  pays: string;
  niveauEtudes: string;
  serieBac?: string | null;
  anneeBac?: number | null;
  etablissementOrigine: string;
  programme: { id: string; code?: string | null; titre: string; niveau: string };
  campus: { id: string; code?: string | null; nom: string };
  niveauEntree: string;
  rentree: string;
  modeFormation: string;
  tuteur?: { nom?: string | null; telephone?: string | null; email?: string | null; lien?: string | null };
  source: string;
  motivation?: string | null;
  besoinBourse: boolean;
  besoinLogement: boolean;
  statut: string;
  createdAt: string;
  tags?: string[];
}

export interface ERPContactPayload {
  externalId: string;
  nom: string;
  email: string;
  telephone?: string | null;
  sujet?: string;
  message?: string;
  source: string;
  tags?: string[];
}

export interface ERPEntityResponse {
  id: string;
  contactId?: string;
  url?: string;
  status?: string;
  [key: string]: unknown;
}

export interface ERPResult<T> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  durationMs: number;
}

export interface ERPRequestMeta {
  action: string;
  inscriptionId?: string;
  jobId?: string;
  attempt?: number;
}

export class ERPError extends Error {
  status: number;
  retryable: boolean;
  response?: unknown;
  constructor(message: string, status = 0, retryable = true, response?: unknown) {
    super(message);
    this.name = "ERPError";
    this.status = status;
    this.retryable = retryable;
    this.response = response;
  }
}

export class ERPDisabledError extends Error {
  constructor(message = "L'intégration ERP est désactivée ou non configurée.") {
    super(message);
    this.name = "ERPDisabledError";
  }
}

// ---------------------------------------------------------------------------
// Chargement de la configuration
// ---------------------------------------------------------------------------

export async function loadERPConfig(): Promise<ERPClientConfig> {
  const db = await prisma.eRPConfig.findUnique({ where: { id: "default" } });
  return {
    baseUrl: (db?.baseUrl || env.erp.baseUrl).replace(/\/+$/, ""),
    apiKey: db?.apiKey || env.erp.apiKey,
    apiSecret: db?.apiSecret || env.erp.apiSecret,
    authHeader: db?.authHeader || "Authorization",
    timeoutMs: db?.timeoutMs || env.erp.timeoutMs,
    isEnabled: db?.isEnabled ?? Boolean(env.erp.baseUrl),
    endpoints: {
      prospects: db?.endpointProspects || "/api/prospects",
      contacts: db?.endpointContacts || "/api/contacts",
      health: db?.endpointHealth || "/api/health",
    },
  };
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class ERPClient {
  private http: AxiosInstance;

  constructor(public readonly config: ERPClientConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs,
      headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "GroupeISI-Site/1.0" },
      validateStatus: () => true,
    });
  }

  static async fromDatabase(): Promise<ERPClient> {
    return new ERPClient(await loadERPConfig());
  }

  get isConfigured() {
    return Boolean(this.config.baseUrl);
  }

  /** Signature HMAC-SHA256 : timestamp.body */
  sign(body: string, timestamp: string) {
    if (!this.config.apiSecret) return "";
    return crypto.createHmac("sha256", this.config.apiSecret).update(`${timestamp}.${body}`).digest("hex");
  }

  private authHeaders(): Record<string, string> {
    if (!this.config.apiKey) return {};
    if (this.config.authHeader.toLowerCase() === "authorization") {
      return { Authorization: `Bearer ${this.config.apiKey}` };
    }
    return { [this.config.authHeader]: this.config.apiKey };
  }

  // -------------------------------------------------------------------------

  async request<T = unknown>(method: Method, path: string, data?: unknown, meta?: ERPRequestMeta): Promise<ERPResult<T>> {
    if (!this.isConfigured) throw new ERPDisabledError("URL de l'ERP non configurée.");

    const body = data === undefined ? "" : JSON.stringify(data);
    const timestamp = Date.now().toString();
    const started = Date.now();
    let status = 0;
    let responseData: unknown;
    let errorMessage: string | undefined;

    try {
      const res = await this.http.request<T>({
        method,
        url: path,
        data: data ?? undefined,
        headers: {
          ...this.authHeaders(),
          "X-Timestamp": timestamp,
          "X-Signature": this.sign(body, timestamp),
          "X-Request-Id": crypto.randomUUID(),
        },
      });
      status = res.status;
      responseData = res.data;

      if (status >= 200 && status < 300) {
        await this.log({ meta, method, path, status, request: data, response: responseData, durationMs: Date.now() - started, ok: true });
        return { ok: true, status, data: res.data, durationMs: Date.now() - started };
      }

      errorMessage = extractErrorMessage(res.data) ?? `HTTP ${status}`;
      const retryable = status >= 500 || status === 408 || status === 429;
      await this.log({ meta, method, path, status, request: data, response: responseData, durationMs: Date.now() - started, ok: false, error: errorMessage });
      throw new ERPError(errorMessage, status, retryable, responseData);
    } catch (err) {
      if (err instanceof ERPError) throw err;
      const axiosErr = err as AxiosError;
      errorMessage = axiosErr.code === "ECONNABORTED" ? "Délai d'attente dépassé (timeout ERP)" : axiosErr.message || "Erreur réseau";
      await this.log({ meta, method, path, status: 0, request: data, durationMs: Date.now() - started, ok: false, error: errorMessage });
      throw new ERPError(errorMessage, 0, true);
    }
  }

  // -------------------------------------------------------------------------
  // Méthodes métier
  // -------------------------------------------------------------------------

  async createProspect(payload: ERPProspectPayload, meta?: Omit<ERPRequestMeta, "action">) {
    const res = await this.request<ERPEntityResponse>("POST", this.config.endpoints.prospects, payload, { ...meta, action: "createProspect" });
    return normalizeEntity(res.data);
  }

  async updateProspect(erpId: string, payload: Partial<ERPProspectPayload>, meta?: Omit<ERPRequestMeta, "action">) {
    const res = await this.request<ERPEntityResponse>("PUT", `${this.config.endpoints.prospects}/${encodeURIComponent(erpId)}`, payload, { ...meta, action: "updateProspect" });
    return normalizeEntity(res.data, erpId);
  }

  async getProspect(erpId: string, meta?: Omit<ERPRequestMeta, "action">) {
    const res = await this.request<ERPEntityResponse>("GET", `${this.config.endpoints.prospects}/${encodeURIComponent(erpId)}`, undefined, { ...meta, action: "getProspect" });
    return res.data;
  }

  async createContact(payload: ERPContactPayload, meta?: Omit<ERPRequestMeta, "action">) {
    const res = await this.request<ERPEntityResponse>("POST", this.config.endpoints.contacts, payload, { ...meta, action: "createContact" });
    return normalizeEntity(res.data);
  }

  async healthCheck(): Promise<{ ok: boolean; message: string; status: number; durationMs: number }> {
    if (!this.isConfigured) return { ok: false, message: "URL de l'ERP non configurée.", status: 0, durationMs: 0 };
    const started = Date.now();
    try {
      const res = await this.request<{ status?: string; version?: string }>("GET", this.config.endpoints.health, undefined, { action: "healthCheck" });
      const version = res.data?.version ? ` (v${res.data.version})` : "";
      return { ok: true, message: `Connexion réussie${version}`, status: res.status, durationMs: Date.now() - started };
    } catch (err) {
      const e = err as ERPError;
      return { ok: false, message: e.message, status: e.status ?? 0, durationMs: Date.now() - started };
    }
  }

  // -------------------------------------------------------------------------

  private async log(entry: {
    meta?: ERPRequestMeta;
    method: Method;
    path: string;
    status: number;
    request?: unknown;
    response?: unknown;
    durationMs: number;
    ok: boolean;
    error?: string;
  }) {
    try {
      await prisma.eRPLog.create({
        data: {
          direction: "OUTBOUND",
          action: entry.meta?.action ?? `${entry.method} ${entry.path}`,
          status: entry.ok ? "SUCCESS" : "ERROR",
          message: entry.ok ? `${entry.method} ${entry.path} → ${entry.status}` : entry.error,
          inscriptionId: entry.meta?.inscriptionId,
          jobId: entry.meta?.jobId,
          attempt: entry.meta?.attempt,
          httpMethod: String(entry.method).toUpperCase(),
          endpoint: `${this.config.baseUrl}${entry.path}`,
          statusCode: entry.status || null,
          requestPayload: sanitize(entry.request) as Prisma.InputJsonValue | undefined,
          responsePayload: sanitize(entry.response) as Prisma.InputJsonValue | undefined,
          errorMessage: entry.error,
          durationMs: entry.durationMs,
        },
      });
    } catch (e) {
      console.error("[ERP] Impossible d'écrire le log", e);
    }
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeEntity(data: ERPEntityResponse | undefined, fallbackId?: string): ERPEntityResponse {
  const d = (data ?? {}) as Record<string, unknown>;
  const nested = (d.data ?? d.prospect ?? d.contact ?? d.result ?? {}) as Record<string, unknown>;
  const id = String(d.id ?? nested.id ?? d.prospect_id ?? d.prospectId ?? fallbackId ?? "");
  if (!id) throw new ERPError("Réponse ERP invalide : identifiant manquant.", 200, false, data);
  return {
    ...d,
    id,
    contactId: (d.contactId ?? d.contact_id ?? nested.contactId ?? nested.contact_id) as string | undefined,
    url: (d.url ?? nested.url) as string | undefined,
    status: (d.status ?? nested.status) as string | undefined,
  };
}

function extractErrorMessage(data: unknown): string | undefined {
  if (!data) return undefined;
  if (typeof data === "string") return data.slice(0, 500);
  const d = data as Record<string, unknown>;
  const m = d.message ?? d.error ?? d.detail ?? d.errors;
  if (typeof m === "string") return m;
  if (m) return JSON.stringify(m).slice(0, 500);
  return undefined;
}

/** Retire les champs sensibles et tronque les charges volumineuses avant journalisation. */
function sanitize(value: unknown): unknown {
  if (value === undefined || value === null) return undefined;
  try {
    const str = JSON.stringify(value, (key, v) => (/(password|secret|token|apikey|api_key)/i.test(key) ? "***" : v));
    if (str.length > 20000) return { truncated: true, preview: str.slice(0, 20000) };
    return JSON.parse(str);
  } catch {
    return { unserializable: true };
  }
}

/** Vérifie la signature HMAC d'un webhook entrant (timing-safe). */
export function verifyWebhookSignature(rawBody: string, signature: string | null, secret: string, timestamp?: string | null): boolean {
  if (!secret) return false;
  if (!signature) return false;
  const candidates = [rawBody, timestamp ? `${timestamp}.${rawBody}` : ""].filter(Boolean);
  const provided = Buffer.from(signature.replace(/^sha256=/, ""), "hex");
  for (const c of candidates) {
    const expected = crypto.createHmac("sha256", secret).update(c).digest();
    if (expected.length === provided.length && crypto.timingSafeEqual(expected, provided)) return true;
  }
  return false;
}

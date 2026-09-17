"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Save, PlugZap, CheckCircle2, XCircle, Copy, Globe, Server, Bell, RefreshCw } from "lucide-react";
import { settingsSchema, erpConfigSchema, type SettingsFormValues, type ERPConfigFormValues } from "@/lib/validations";
import { saveSiteSettings, saveERPConfig, testERPConnection } from "@/app/actions/settings";
import { Button } from "@/components/ui/Button";
import { Panel, Pill } from "@/components/admin/ui";
import { Tabs } from "@/components/ui/Tabs";
import { formatDateTime } from "@/lib/utils";

function Input({ label, error, help, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; help?: string }) {
  return <div><label className="field-label">{label}</label><input className="field-input" {...rest} />{error ? <p className="field-error">{error}</p> : help ? <p className="field-help">{help}</p> : null}</div>;
}

export function SettingsTabs({ site, erp, erpState, canEditERP, webhookUrl, envDefaults }: { site: SettingsFormValues; erp: ERPConfigFormValues; erpState: { lastHealthCheckAt: string | null; lastHealthCheckOk: boolean | null; lastHealthCheckMessage: string | null; lastSyncAt: string | null }; canEditERP: boolean; webhookUrl: string; envDefaults: { baseUrl: string; hasApiKey: boolean } }) {
  return (
    <Tabs
      variant="underline"
      tabs={[
        { id: "erp", label: "Intégration ERP / CRM", content: <ERPForm defaults={erp} state={erpState} canEdit={canEditERP} webhookUrl={webhookUrl} envDefaults={envDefaults} /> },
        { id: "site", label: "Site & contenu", content: <SiteForm defaults={site} /> },
      ]}
    />
  );
}

function SiteForm({ defaults }: { defaults: SettingsFormValues }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), defaultValues: defaults });
  const onSubmit = async (v: SettingsFormValues) => {
    const r = await saveSiteSettings(v);
    if (r.ok) toast.success(r.message); else toast.error(r.message);
    router.refresh();
  };
  const e = (k: keyof SettingsFormValues) => errors[k]?.message as string | undefined;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-2" noValidate>
      <Panel title="Identité et coordonnées">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nom du site" error={e("siteName")} {...register("siteName")} />
          <Input label="Slogan" {...register("tagline")} />
          <Input label="Email de contact" error={e("email")} {...register("email")} />
          <Input label="Email admissions" error={e("emailAdmissions")} {...register("emailAdmissions")} />
          <Input label="Téléphone" {...register("phone")} />
          <Input label="Téléphone 2" {...register("phone2")} />
          <Input label="WhatsApp" {...register("whatsapp")} />
          <Input label="Horaires" {...register("horaires")} />
          <div className="sm:col-span-2"><Input label="Adresse" {...register("address")} /></div>
        </div>
      </Panel>
      <Panel title="Réseaux sociaux">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["facebook", "instagram", "linkedin", "youtube", "twitter", "tiktok"] as const).map((k) => <Input key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} placeholder="https://…" {...register(k)} />)}
        </div>
      </Panel>
      <Panel title="Page d'accueil et admissions">
        <div className="grid gap-4">
          <Input label="Titre du hero" {...register("heroTitle")} />
          <div><label className="field-label">Sous-titre du hero</label><textarea rows={3} className="field-input" {...register("heroSubtitle")} /></div>
          <Input label="Bandeau d'annonce" {...register("annonceBandeau")} />
          <Input label="Lien du bandeau" {...register("annonceLien")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Année académique" {...register("anneeAcademique")} />
            <Input label="Options de rentrée (séparées par des virgules)" {...register("rentreeOptions")} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("inscriptionsOuvertes")} /> Pré-inscriptions ouvertes</label>
        </div>
      </Panel>
      <Panel title="Chiffres clés et SEO">
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Années" type="number" {...register("statAnnees")} />
          <Input label="Étudiants" type="number" {...register("statEtudiants")} />
          <Input label="Campus" type="number" {...register("statCampus")} />
          <Input label="Formations" type="number" {...register("statProgrammes")} />
          <Input label="Insertion (%)" type="number" {...register("statInsertion")} />
          <Input label="Partenaires" type="number" {...register("statPartenaires")} />
        </div>
        <div className="mt-4 grid gap-4">
          <Input label="Titre SEO" {...register("seoTitle")} />
          <div><label className="field-label">Description SEO</label><textarea rows={3} className="field-input" {...register("seoDescription")} /></div>
        </div>
        <Button type="submit" variant="secondary" loading={isSubmitting} className="mt-6 w-full"><Save className="h-4 w-4" /> Enregistrer les paramètres</Button>
      </Panel>
    </form>
  );
}

function ERPForm({ defaults, state, canEdit, webhookUrl, envDefaults }: { defaults: ERPConfigFormValues; state: { lastHealthCheckAt: string | null; lastHealthCheckOk: boolean | null; lastHealthCheckMessage: string | null; lastSyncAt: string | null }; canEdit: boolean; webhookUrl: string; envDefaults: { baseUrl: string; hasApiKey: boolean } }) {
  const router = useRouter();
  const [testing, startTest] = useTransition();
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; durationMs: number } | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ERPConfigFormValues>({ resolver: zodResolver(erpConfigSchema), defaultValues: defaults });
  const onSubmit = async (v: ERPConfigFormValues) => {
    const r = await saveERPConfig(v);
    if (r.ok) toast.success(r.message); else toast.error(r.message);
    router.refresh();
  };
  const test = () => startTest(async () => {
    const r = await testERPConnection();
    if (r.ok && r.data) {
      setTestResult(r.data);
      if (r.data.ok) toast.success(r.message); else toast.error(r.message);
    } else toast.error(r.message);
    router.refresh();
  });
  const e = (k: keyof ERPConfigFormValues) => errors[k]?.message as string | undefined;
  const enabled = watch("isEnabled");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-3" noValidate>
      <fieldset disabled={!canEdit} className="space-y-6 xl:col-span-2">
        <Panel title="Connexion à l'ERP / CRM" actions={<Pill className={enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}>{enabled ? "Activée" : "Désactivée"}</Pill>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="flex items-center gap-2 rounded-xl border border-line p-3 text-sm font-semibold"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("isEnabled")} /> Activer la synchronisation avec l&apos;ERP / CRM</label></div>
            <Input label="Nom de l'intégration" {...register("nom")} />
            <Input label="URL de base de l'API" placeholder="https://erp.groupeisi.com" error={e("baseUrl")} help={envDefaults.baseUrl ? `Valeur .env par défaut : ${envDefaults.baseUrl}` : undefined} {...register("baseUrl")} />
            <Input label="Clé API" type="password" autoComplete="new-password" placeholder={envDefaults.hasApiKey ? "Définie dans .env" : ""} help="Laisser ******** pour conserver la valeur actuelle" {...register("apiKey")} />
            <Input label="En-tête d'authentification" placeholder="Authorization (Bearer) ou X-API-Key" {...register("authHeader")} />
            <Input label="Secret de signature (HMAC sortant)" type="password" autoComplete="new-password" help="Signe chaque requête : X-Signature = HMAC-SHA256(timestamp.body)" {...register("apiSecret")} />
            <Input label="Secret des webhooks (HMAC entrant)" type="password" autoComplete="new-password" help="Vérifie la signature des événements reçus" {...register("webhookSecret")} />
            <Input label="Timeout (ms)" type="number" error={e("timeoutMs")} {...register("timeoutMs")} />
          </div>
        </Panel>
        <Panel title="Endpoints">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Prospects" {...register("endpointProspects")} />
            <Input label="Contacts" {...register("endpointContacts")} />
            <Input label="Health check" {...register("endpointHealth")} />
          </div>
        </Panel>
        <Panel title="Options de synchronisation">
          <div className="grid gap-3 sm:grid-cols-2">
            {([["syncInscriptions", "Synchroniser les pré-inscriptions (prospects)"], ["syncProspects", "Mettre à jour les prospects lors des changements de statut"], ["syncContacts", "Synchroniser les messages de contact"], ["syncNewsletter", "Synchroniser les abonnés newsletter"]] as const).map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 rounded-xl border border-line p-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register(k)} /> {l}</label>
            ))}
          </div>
        </Panel>
        <Panel title="Retry et notifications">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre de tentatives" type="number" error={e("retryAttempts")} help="Backoff exponentiel : délai × 2^(n-1)" {...register("retryAttempts")} />
            <Input label="Délai initial (ms)" type="number" error={e("retryDelayMs")} {...register("retryDelayMs")} />
            <Input label="Email de notification" error={e("notifyEmail")} placeholder="admissions@groupeisi.com" {...register("notifyEmail")} />
            <label className="flex items-center gap-2 self-end rounded-xl border border-line p-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("notifyOnFailure")} /> <Bell className="h-4 w-4 text-secondary" /> Alerter après échec définitif</label>
          </div>
          {canEdit && <Button type="submit" variant="secondary" loading={isSubmitting} className="mt-6"><Save className="h-4 w-4" /> Enregistrer la configuration</Button>}
        </Panel>
      </fieldset>
      <div className="space-y-6">
        <Panel title="Test de connexion">
          <p className="text-sm text-muted">Appelle l&apos;endpoint de health check avec la configuration enregistrée.</p>
          <Button type="button" variant="primary" className="mt-4 w-full" loading={testing} onClick={test}><PlugZap className="h-4 w-4" /> Tester la connexion</Button>
          {(testResult ?? (state.lastHealthCheckOk !== null ? { ok: !!state.lastHealthCheckOk, message: state.lastHealthCheckMessage ?? "", durationMs: 0 } : null)) && (
            <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${(testResult?.ok ?? state.lastHealthCheckOk) ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              {(testResult?.ok ?? state.lastHealthCheckOk) ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
              <div><div className="font-bold">{testResult?.message ?? state.lastHealthCheckMessage}</div>{state.lastHealthCheckAt && <div className="text-xs opacity-70">Dernier test : {formatDateTime(state.lastHealthCheckAt)}</div>}</div>
            </div>
          )}
          {state.lastSyncAt && <p className="mt-3 flex items-center gap-1 text-xs text-muted"><RefreshCw className="h-3 w-3" /> Dernière synchro réussie : {formatDateTime(state.lastSyncAt)}</p>}
        </Panel>
        <Panel title="Webhook entrant">
          <p className="text-sm text-muted">Configurez cette URL dans votre ERP pour recevoir les événements (prospect.created, prospect.updated, inscription.confirmed, inscription.cancelled, contact.created).</p>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface p-3 font-mono text-xs"><Globe className="h-4 w-4 shrink-0 text-secondary" /><span className="truncate">{webhookUrl}</span><button type="button" onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("URL copiée"); }} className="ml-auto rounded-full p-1.5 hover:bg-white" aria-label="Copier"><Copy className="h-4 w-4" /></button></div>
          <p className="mt-3 text-xs text-muted">En-têtes attendus : <code>X-Signature</code> (HMAC-SHA256 hex du corps brut, ou de <code>timestamp.body</code> avec <code>X-Timestamp</code>).</p>
        </Panel>
        <Panel title="Format des requêtes sortantes">
          <div className="space-y-2 text-xs text-muted">
            <p className="flex items-center gap-1 font-bold text-primary"><Server className="h-3.5 w-3.5" /> POST {watch("endpointProspects")}</p>
            <pre className="overflow-auto rounded-xl bg-dark p-3 text-[11px] text-emerald-200">{`{
  "externalId": "cuid", "reference": "ISI-2026-00042",
  "prenom": "…", "nom": "…", "email": "…", "telephone": "…",
  "programme": { "id", "code", "titre", "niveau" },
  "campus": { "id", "code", "nom" },
  "rentree": "Octobre 2026", "statut": "NOUVELLE", …
}`}</pre>
            <p>Réponse attendue : <code>{`{ "id": "…", "contactId"?: "…", "url"?: "…" }`}</code></p>
          </div>
        </Panel>
      </div>
    </form>
  );
}

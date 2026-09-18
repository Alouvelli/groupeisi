/**
 * Envoi d'emails via Resend (avec repli console si la clé n'est pas définie).
 */
import { Resend } from "resend";
import { env } from "./env";
import { formatDate, formatFCFA } from "./utils";

let resend: Resend | null = null;
function getResend() {
  if (!env.resendApiKey) return null;
  if (!resend) resend = new Resend(env.resendApiKey);
  return resend;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getResend();
  if (!client) {
    console.info(`[email] (mode console) → ${Array.isArray(input.to) ? input.to.join(", ") : input.to} : ${input.subject}`);
    return { ok: true, id: "console" };
  }
  try {
    const res = await client.emails.send({
      from: env.emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo,
    });
    if (res.error) return { ok: false, error: res.error.message };
    return { ok: true, id: res.data?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

const BRAND = { primary: "#0b2a5b", secondary: "#f26522" };

function layout(title: string, body: string, footer?: string) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,42,91,.08)">
        <tr><td style="background:${BRAND.primary};padding:28px 32px;color:#fff">
          <div style="font-size:22px;font-weight:700;letter-spacing:.5px">GROUPE ISI</div>
          <div style="font-size:12px;opacity:.85;margin-top:4px">Institut Supérieur d'Informatique</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="font-size:20px;margin:0 0 16px;color:${BRAND.primary}">${title}</h1>
          ${body}
        </td></tr>
        <tr><td style="background:#f8fafc;padding:20px 32px;font-size:12px;color:#64748b;line-height:1.6">
          ${footer ?? `Groupe ISI – Dakar, Sénégal · <a href="${env.siteUrl}" style="color:${BRAND.secondary}">${env.siteUrl.replace(/^https?:\/\//, "")}</a><br/>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.`}
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;
}

function row(label: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";
  return `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px;width:40%">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:600">${value}</td></tr>`;
}

function button(label: string, href: string) {
  return `<p style="margin:24px 0 0"><a href="${href}" style="display:inline-block;background:${BRAND.secondary};color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:14px">${label}</a></p>`;
}

export interface InscriptionEmailData {
  numero: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  programme: string;
  niveau: string;
  campus: string;
  rentree: string;
  niveauEntree: string;
  modeFormation: string;
  fraisInscription?: number | null;
  createdAt: Date | string;
  id: string;
}

export function inscriptionConfirmationEmail(d: InscriptionEmailData) {
  const body = `
    <p>Bonjour <strong>${d.prenom} ${d.nom}</strong>,</p>
    <p>Nous avons bien reçu votre demande de pré-inscription au <strong>Groupe ISI</strong>. Votre dossier a été enregistré sous le numéro :</p>
    <p style="font-size:24px;font-weight:800;color:${BRAND.secondary};letter-spacing:1px;margin:8px 0 20px">${d.numero}</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      ${row("Formation", `${d.programme} (${d.niveau})`)}
      ${row("Campus", d.campus)}
      ${row("Niveau d'entrée", d.niveauEntree)}
      ${row("Rentrée souhaitée", d.rentree)}
      ${row("Mode de formation", d.modeFormation)}
      ${row("Frais d'inscription", d.fraisInscription ? formatFCFA(d.fraisInscription) : undefined)}
      ${row("Date de la demande", formatDate(d.createdAt, "d MMMM yyyy 'à' HH:mm"))}
    </table>
    <h2 style="font-size:16px;margin:28px 0 8px;color:${BRAND.primary}">Prochaines étapes</h2>
    <ol style="padding-left:20px;line-height:1.7;font-size:14px">
      <li>Notre service des admissions étudie votre dossier sous <strong>48 heures ouvrées</strong>.</li>
      <li>Un conseiller vous contactera par téléphone ou email pour finaliser votre inscription.</li>
      <li>Préparez vos pièces justificatives : copie du diplôme, relevés de notes, pièce d'identité, photos d'identité.</li>
    </ol>
    <p style="font-size:14px">Pour toute question, contactez le service des admissions : <a href="mailto:${env.adminNotificationEmail || "admissions@groupeisi.com"}" style="color:${BRAND.secondary}">${env.adminNotificationEmail || "admissions@groupeisi.com"}</a>.</p>
    ${button("Consulter nos formations", `${env.siteUrl}/formations`)}
  `;
  return {
    subject: `[Groupe ISI] Confirmation de votre pré-inscription – ${d.numero}`,
    html: layout("Votre pré-inscription a bien été reçue", body),
    text: `Bonjour ${d.prenom} ${d.nom}, votre pré-inscription ${d.numero} (${d.programme} – ${d.campus}, rentrée ${d.rentree}) a bien été reçue. Notre service des admissions vous contactera sous 48h ouvrées.`,
  };
}

export function inscriptionAdminEmail(d: InscriptionEmailData) {
  const adminUrl = `${env.siteUrl}/admin/inscriptions/${d.id}`;
  const body = `
    <p>Une nouvelle pré-inscription vient d'être soumise sur le site.</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      ${row("Dossier", d.numero)}
      ${row("Candidat", `${d.prenom} ${d.nom}`)}
      ${row("Email", d.email)}
      ${row("Téléphone", d.telephone)}
      ${row("Formation", `${d.programme} (${d.niveau})`)}
      ${row("Campus", d.campus)}
      ${row("Niveau d'entrée", d.niveauEntree)}
      ${row("Rentrée", d.rentree)}
      ${row("Mode", d.modeFormation)}
    </table>
    ${button("Ouvrir le dossier dans l'admin", adminUrl)}
  `;
  return {
    subject: `[Admissions] Nouvelle pré-inscription ${d.numero} – ${d.prenom} ${d.nom}`,
    html: layout("Nouvelle pré-inscription", body),
    text: `Nouvelle pré-inscription ${d.numero} : ${d.prenom} ${d.nom} (${d.email}, ${d.telephone}) – ${d.programme} / ${d.campus}. ${adminUrl}`,
  };
}

export function erpFailureEmail(d: { numero: string; inscriptionId: string; jobId?: string; attempts: number; error: string; action: string }) {
  const body = `
    <p style="color:#b91c1c;font-weight:700">La synchronisation ERP a échoué après ${d.attempts} tentative(s).</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      ${row("Action", d.action)}
      ${row("Dossier", d.numero)}
      ${row("Job", d.jobId)}
      ${row("Erreur", `<span style="color:#b91c1c">${d.error}</span>`)}
    </table>
    <p style="font-size:14px;margin-top:16px">Vous pouvez relancer le job manuellement depuis le tableau de bord des jobs.</p>
    ${button("Voir les jobs", `${env.siteUrl}/admin/jobs`)}
  `;
  return {
    subject: `[ALERTE ERP] Échec de synchronisation – ${d.numero}`,
    html: layout("Échec de synchronisation ERP", body),
    text: `Échec de synchronisation ERP pour ${d.numero} (${d.action}) après ${d.attempts} tentatives : ${d.error}`,
  };
}

export function contactAdminEmail(d: { nom: string; email: string; telephone?: string | null; sujet: string; message: string }) {
  const body = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
      ${row("Nom", d.nom)}
      ${row("Email", d.email)}
      ${row("Téléphone", d.telephone)}
      ${row("Sujet", d.sujet)}
    </table>
    <p style="margin-top:16px;white-space:pre-wrap;font-size:14px;line-height:1.6;background:#f8fafc;padding:16px;border-radius:12px">${d.message.replace(/</g, "&lt;")}</p>
  `;
  return {
    subject: `[Contact] ${d.sujet} – ${d.nom}`,
    html: layout("Nouveau message de contact", body),
    text: `${d.nom} (${d.email}${d.telephone ? ", " + d.telephone : ""}) – ${d.sujet}\n\n${d.message}`,
  };
}

export function contactConfirmationEmail(d: { nom: string; sujet: string }) {
  const body = `
    <p>Bonjour <strong>${d.nom}</strong>,</p>
    <p>Nous avons bien reçu votre message concernant « ${d.sujet} ». Notre équipe vous répondra dans les plus brefs délais.</p>
    ${button("Retour au site", env.siteUrl)}
  `;
  return { subject: "[Groupe ISI] Nous avons bien reçu votre message", html: layout("Message reçu", body), text: `Bonjour ${d.nom}, nous avons bien reçu votre message (« ${d.sujet} »). Notre équipe vous répondra rapidement.` };
}

export function statutChangeEmail(d: { prenom: string; nom: string; numero: string; statut: string; programme: string; message?: string }) {
  const body = `
    <p>Bonjour <strong>${d.prenom} ${d.nom}</strong>,</p>
    <p>Le statut de votre dossier <strong>${d.numero}</strong> (${d.programme}) a été mis à jour :</p>
    <p style="font-size:20px;font-weight:800;color:${BRAND.secondary}">${d.statut}</p>
    ${d.message ? `<p style="font-size:14px;line-height:1.6;background:#f8fafc;padding:16px;border-radius:12px">${d.message.replace(/</g, "&lt;")}</p>` : ""}
    ${button("Contacter les admissions", `${env.siteUrl}/contact`)}
  `;
  return { subject: `[Groupe ISI] Mise à jour de votre dossier ${d.numero}`, html: layout("Mise à jour de votre dossier", body), text: `Bonjour ${d.prenom}, le statut de votre dossier ${d.numero} est désormais : ${d.statut}. ${d.message ?? ""}` };
}

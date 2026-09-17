import { z } from "zod";

const phoneRegex = /^\+?[0-9\s().-]{8,20}$/;

export const inscriptionSchema = z
  .object({
    // Identité
    civilite: z.enum(["M", "MME", "MLLE"], { message: "Sélectionnez une civilité" }),
    prenom: z.string().trim().min(2, "Prénom trop court").max(80),
    nom: z.string().trim().min(2, "Nom trop court").max(80),
    dateNaissance: z
      .string()
      .min(1, "Date de naissance requise")
      .refine((v) => !Number.isNaN(Date.parse(v)), "Date invalide")
      .refine((v) => {
        const age = (Date.now() - Date.parse(v)) / (365.25 * 24 * 3600 * 1000);
        return age >= 14 && age <= 80;
      }, "Vous devez avoir entre 14 et 80 ans"),
    lieuNaissance: z.string().trim().min(2, "Lieu de naissance requis").max(120),
    nationalite: z.string().trim().min(2, "Nationalité requise").max(60),
    numeroPiece: z.string().trim().max(40).optional().or(z.literal("")),
    // Contact
    email: z.string().trim().email("Adresse email invalide").max(120),
    telephone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide"),
    telephone2: z.string().trim().regex(phoneRegex, "Numéro invalide").optional().or(z.literal("")),
    adresse: z.string().trim().min(3, "Adresse requise").max(200),
    ville: z.string().trim().min(2, "Ville requise").max(80),
    pays: z.string().trim().min(2, "Pays requis").max(60),
    // Parcours
    niveauEtudes: z.enum(["BFEM", "BAC", "BAC_PLUS_1", "BAC_PLUS_2", "BAC_PLUS_3", "BAC_PLUS_4", "BAC_PLUS_5", "AUTRE"], { message: "Niveau d'études requis" }),
    serieBac: z.string().trim().max(20).optional().or(z.literal("")),
    anneeBac: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || (/^\d{4}$/.test(v) && Number(v) >= 1980 && Number(v) <= new Date().getFullYear() + 1), "Année invalide"),
    mentionBac: z.string().trim().max(30).optional().or(z.literal("")),
    etablissementOrigine: z.string().trim().min(2, "Établissement d'origine requis").max(150),
    dernierDiplome: z.string().trim().max(150).optional().or(z.literal("")),
    // Choix
    programmeId: z.string().min(1, "Choisissez une formation"),
    campusId: z.string().min(1, "Choisissez un campus"),
    niveauEntree: z.string().min(1, "Niveau d'entrée requis"),
    rentree: z.string().min(1, "Rentrée souhaitée requise"),
    modeFormation: z.enum(["PRESENTIEL", "EN_LIGNE", "ALTERNANCE", "COURS_DU_SOIR"], { message: "Mode de formation requis" }),
    // Tuteur
    tuteurNom: z.string().trim().max(120).optional().or(z.literal("")),
    tuteurTelephone: z.string().trim().regex(phoneRegex, "Numéro invalide").optional().or(z.literal("")),
    tuteurEmail: z.string().trim().email("Email invalide").optional().or(z.literal("")),
    tuteurLien: z.string().trim().max(40).optional().or(z.literal("")),
    // Divers
    sourceConnaissance: z.enum(["SITE_WEB", "RESEAUX_SOCIAUX", "BOUCHE_A_OREILLE", "SALON_FORUM", "PRESSE_RADIO_TV", "AFFICHAGE", "ANCIEN_ETUDIANT", "AUTRE"]),
    motivation: z.string().trim().max(2000, "2000 caractères maximum").optional().or(z.literal("")),
    besoinBourse: z.boolean().default(false),
    besoinLogement: z.boolean().default(false),
    newsletter: z.boolean().default(true),
    accepteConditions: z.literal(true, { message: "Vous devez accepter les conditions" }),
    // Anti-spam (honeypot)
    website: z.string().max(0, "Spam détecté").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.niveauEtudes !== "BFEM" && data.niveauEtudes !== "AUTRE" && !data.anneeBac) {
      ctx.addIssue({ code: "custom", path: ["anneeBac"], message: "Année d'obtention du Bac requise" });
    }
  });

export type InscriptionFormValues = z.input<typeof inscriptionSchema>;
export type InscriptionParsed = z.output<typeof inscriptionSchema>;

export const contactSchema = z.object({
  nom: z.string().trim().min(2, "Nom requis").max(120),
  email: z.string().trim().email("Email invalide"),
  telephone: z.string().trim().regex(phoneRegex, "Numéro invalide").optional().or(z.literal("")),
  sujet: z.string().min(1, "Sujet requis").max(120),
  message: z.string().trim().min(10, "Message trop court (10 caractères minimum)").max(3000),
  website: z.string().max(0).optional().or(z.literal("")),
});
export type ContactFormValues = z.infer<typeof contactSchema>;

export const newsletterSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  nom: z.string().trim().max(120).optional().or(z.literal("")),
});
export type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const erpConfigSchema = z.object({
  nom: z.string().trim().min(1).max(120),
  isEnabled: z.boolean(),
  baseUrl: z.string().trim().url("URL invalide").or(z.literal("")),
  apiKey: z.string().trim().max(500),
  apiSecret: z.string().trim().max(500),
  webhookSecret: z.string().trim().max(500),
  authHeader: z.string().trim().min(1).max(60),
  timeoutMs: z.coerce.number().int().min(1000).max(120000),
  syncInscriptions: z.boolean(),
  syncContacts: z.boolean(),
  syncProspects: z.boolean(),
  syncNewsletter: z.boolean(),
  retryAttempts: z.coerce.number().int().min(1).max(10),
  retryDelayMs: z.coerce.number().int().min(1000).max(600000),
  notifyEmail: z.string().trim().email("Email invalide").or(z.literal("")),
  notifyOnFailure: z.boolean(),
  endpointProspects: z.string().trim().min(1).max(200),
  endpointContacts: z.string().trim().min(1).max(200),
  endpointHealth: z.string().trim().min(1).max(200),
});
export type ERPConfigFormValues = z.input<typeof erpConfigSchema>;

export const programmeSchema = z.object({
  titre: z.string().trim().min(3).max(150),
  slug: z.string().trim().min(2).max(150).regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
  niveau: z.enum(["BTS", "LICENCE", "MASTER", "DOCTORAT", "CERTIFICAT", "FORMATION_CONTINUE"]),
  duree: z.string().trim().min(1).max(40),
  departementId: z.string().min(1, "Département requis"),
  accroche: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().min(10),
  contenu: z.string().optional().or(z.literal("")),
  objectifs: z.string().optional().or(z.literal("")), // une ligne par élément
  debouches: z.string().optional().or(z.literal("")),
  competences: z.string().optional().or(z.literal("")),
  conditionsAdmission: z.string().optional().or(z.literal("")),
  fraisInscription: z.coerce.number().int().min(0).optional().or(z.literal("")),
  fraisScolarite: z.coerce.number().int().min(0).optional().or(z.literal("")),
  diplome: z.string().trim().max(150).optional().or(z.literal("")),
  accreditation: z.string().trim().max(80).optional().or(z.literal("")),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  brochureUrl: z.string().trim().max(500).optional().or(z.literal("")),
  erpCode: z.string().trim().max(60).optional().or(z.literal("")),
  ordre: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  campusIds: z.array(z.string()).default([]),
});
export type ProgrammeFormValues = z.input<typeof programmeSchema>;

export const postSchema = z.object({
  titre: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/, "Slug invalide"),
  extrait: z.string().trim().min(10).max(500),
  contenu: z.string().trim().min(20),
  image: z.string().trim().max(500).optional().or(z.literal("")),
  categorieId: z.string().optional().or(z.literal("")),
  tags: z.string().optional().or(z.literal("")),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  publishedAt: z.string().optional().or(z.literal("")),
});
export type PostFormValues = z.input<typeof postSchema>;

export const inscriptionStatutSchema = z.object({
  id: z.string().min(1),
  statut: z.enum(["NOUVELLE", "EN_COURS", "ACCEPTEE", "REFUSEE", "CONFIRMEE", "ANNULEE"]),
  notesAdmin: z.string().max(3000).optional().or(z.literal("")),
  notifierCandidat: z.boolean().default(false),
  message: z.string().max(2000).optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(100),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  emailAdmissions: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  phone2: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  horaires: z.string().trim().max(200).optional().or(z.literal("")),
  facebook: z.string().trim().max(300).optional().or(z.literal("")),
  instagram: z.string().trim().max(300).optional().or(z.literal("")),
  linkedin: z.string().trim().max(300).optional().or(z.literal("")),
  youtube: z.string().trim().max(300).optional().or(z.literal("")),
  twitter: z.string().trim().max(300).optional().or(z.literal("")),
  tiktok: z.string().trim().max(300).optional().or(z.literal("")),
  heroTitle: z.string().trim().max(200).optional().or(z.literal("")),
  heroSubtitle: z.string().trim().max(400).optional().or(z.literal("")),
  annonceBandeau: z.string().trim().max(200).optional().or(z.literal("")),
  annonceLien: z.string().trim().max(300).optional().or(z.literal("")),
  seoTitle: z.string().trim().max(120).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  inscriptionsOuvertes: z.boolean().default(true),
  anneeAcademique: z.string().trim().max(20),
  rentreeOptions: z.string().max(300),
  statAnnees: z.coerce.number().int().min(0),
  statEtudiants: z.coerce.number().int().min(0),
  statCampus: z.coerce.number().int().min(0),
  statProgrammes: z.coerce.number().int().min(0),
  statInsertion: z.coerce.number().int().min(0).max(100),
  statPartenaires: z.coerce.number().int().min(0),
});
export type SettingsFormValues = z.input<typeof settingsSchema>;

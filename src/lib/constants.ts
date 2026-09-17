import type {
  Civilite,
  ERPSyncStatus,
  InscriptionStatut,
  ModeFormation,
  Niveau,
  NiveauEtudes,
  SourceConnaissance,
} from "@prisma/client";

export const NIVEAU_LABELS: Record<Niveau, string> = {
  BTS: "BTS",
  LICENCE: "Licence",
  MASTER: "Master",
  DOCTORAT: "Doctorat",
  CERTIFICAT: "Certification",
  FORMATION_CONTINUE: "Formation continue",
};

export const NIVEAU_ETUDES_LABELS: Record<NiveauEtudes, string> = {
  BFEM: "BFEM / Brevet",
  BAC: "Baccalauréat",
  BAC_PLUS_1: "Bac +1",
  BAC_PLUS_2: "Bac +2 (BTS / DUT / DEUG)",
  BAC_PLUS_3: "Bac +3 (Licence)",
  BAC_PLUS_4: "Bac +4 (Maîtrise / M1)",
  BAC_PLUS_5: "Bac +5 (Master / Ingénieur)",
  AUTRE: "Autre",
};

export const MODE_FORMATION_LABELS: Record<ModeFormation, string> = {
  PRESENTIEL: "Présentiel (cours du jour)",
  COURS_DU_SOIR: "Cours du soir",
  EN_LIGNE: "En ligne / à distance",
  ALTERNANCE: "Alternance",
};

export const SOURCE_LABELS: Record<SourceConnaissance, string> = {
  SITE_WEB: "Site web / Google",
  RESEAUX_SOCIAUX: "Réseaux sociaux",
  BOUCHE_A_OREILLE: "Bouche à oreille",
  SALON_FORUM: "Salon / Forum de l'étudiant",
  PRESSE_RADIO_TV: "Presse / Radio / TV",
  AFFICHAGE: "Affichage",
  ANCIEN_ETUDIANT: "Ancien étudiant",
  AUTRE: "Autre",
};

export const CIVILITE_LABELS: Record<Civilite, string> = {
  M: "Monsieur",
  MME: "Madame",
  MLLE: "Mademoiselle",
};

export const STATUT_LABELS: Record<InscriptionStatut, string> = {
  NOUVELLE: "Nouvelle",
  EN_COURS: "En cours de traitement",
  ACCEPTEE: "Acceptée",
  REFUSEE: "Refusée",
  CONFIRMEE: "Confirmée",
  ANNULEE: "Annulée",
};

export const STATUT_COLORS: Record<InscriptionStatut, string> = {
  NOUVELLE: "bg-blue-100 text-blue-800",
  EN_COURS: "bg-amber-100 text-amber-800",
  ACCEPTEE: "bg-emerald-100 text-emerald-800",
  REFUSEE: "bg-red-100 text-red-800",
  CONFIRMEE: "bg-green-100 text-green-800",
  ANNULEE: "bg-gray-100 text-gray-700",
};

export const ERP_SYNC_LABELS: Record<ERPSyncStatus, string> = {
  PENDING: "En attente",
  SYNCING: "Synchronisation…",
  SYNCED: "Synchronisé",
  FAILED: "Échec",
  SKIPPED: "Ignoré",
};

export const ERP_SYNC_COLORS: Record<ERPSyncStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SYNCING: "bg-blue-100 text-blue-800",
  SYNCED: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-red-100 text-red-800",
  SKIPPED: "bg-slate-100 text-slate-600",
};

export const NIVEAU_ENTREE_OPTIONS = [
  "1ère année",
  "2ème année",
  "3ème année",
  "4ème année (Master 1)",
  "5ème année (Master 2)",
];

export const PAYS_OPTIONS = [
  "Sénégal",
  "Mauritanie",
  "Mali",
  "Guinée",
  "Guinée-Bissau",
  "Gambie",
  "Côte d'Ivoire",
  "Burkina Faso",
  "Niger",
  "Togo",
  "Bénin",
  "Cameroun",
  "Gabon",
  "Congo",
  "RD Congo",
  "Tchad",
  "Comores",
  "Djibouti",
  "Madagascar",
  "France",
  "Autre",
];

export const SERIE_BAC_OPTIONS = ["S1", "S2", "S3", "S4", "S5", "L1", "L2", "L'1", "G", "T1", "T2", "STEG", "STIDD", "Autre"];

export const TUTEUR_LIEN_OPTIONS = ["Père", "Mère", "Tuteur légal", "Conjoint(e)", "Frère / Sœur", "Employeur", "Moi-même", "Autre"];

export const CONTACT_SUJETS = [
  "Demande d'information",
  "Admission / Pré-inscription",
  "Frais de scolarité",
  "Formation continue / Entreprises",
  "Partenariat",
  "Stage / Emploi",
  "Réclamation",
  "Autre",
];

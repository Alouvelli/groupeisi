import type { Passage, PassageTrouve } from "./types";

/**
 * Recherche lexicale BM25 adaptée au français.
 *
 * Le corpus de l'institut tient en quelques centaines de passages : un index
 * en mémoire suffit, sans base vectorielle ni service d'embeddings. La qualité
 * vient d'ailleurs — normalisation des accents, désuffixation, mots vides et
 * surtout un lexique de synonymes du domaine, qui rapproche « combien ça
 * coûte » de « frais de scolarité ».
 */

const MOTS_VIDES = new Set([
  "a", "afin", "ai", "aux", "au", "avec", "avoir", "car", "ce", "ces", "cet", "cette", "ceux", "chez",
  "comme", "dans", "de", "des", "du", "donc", "dont", "elle", "elles", "en", "encore", "est", "et",
  "etre", "eu", "il", "ils", "je", "la", "le", "les", "leur", "leurs", "lui", "ma", "mais", "me",
  "meme", "mes", "moi", "mon", "ne", "nos", "notre", "nous", "on", "ou", "par", "pas", "pour", "qu",
  "que", "quel", "quelle", "quels", "quelles", "qui", "sa", "sans", "se", "ses", "si", "son", "sont",
  "sur", "ta", "te", "tes", "toi", "ton", "tu", "un", "une", "vos", "votre", "vous", "y", "plus",
  "tout", "tous", "toute", "toutes", "aussi", "alors", "ainsi", "cela", "ca", "the", "of", "and",
]);

/**
 * Interrogatifs que la suppression des accents rendrait indistincts d'un mot
 * vide : « où » devient « ou », qui est une conjonction. On les remplace par
 * leur intention avant d'aplatir les accents.
 */
const INTERROGATIFS: [RegExp, string][] = [
  // `\b` ne marque pas de frontière après une lettre accentuée : on borne
  // explicitement sur l'absence de lettre, sinon « où » n'est jamais reconnu.
  [/(?<!\p{L})o[ùu]\s+(?:est|sont|se trouve|se situe|puis|peut|sommes)/giu, " adresse localisation situation "],
  [/(?<!\p{L})où(?!\p{L})/giu, " adresse localisation "],
  [/(?<!\p{L})combien(?!\p{L})/giu, " combien montant nombre "],
  [/(?<!\p{L})quand(?!\p{L})/giu, " quand date calendrier periode "],
];

/** Retire les accents et la ponctuation, puis passe en minuscules. */
export function normaliser(texte: string): string {
  return INTERROGATIFS.reduce((s, [r, v]) => s.replace(r, v), texte)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’'`]/g, " ")
    .replace(/[^a-z0-9+]+/g, " ")
    .trim();
}

/**
 * Désuffixation légère.
 *
 * Volontairement prudente : elle ramène les pluriels et quelques familles
 * verbales à une racine commune sans chercher à être un vrai analyseur
 * morphologique, qui produirait plus de faux rapprochements qu'il n'en résout.
 */
function raciniser(mot: string): string {
  if (mot.length <= 4) return mot;
  for (const suffixe of ["ements", "ement", "ations", "ation", "ateurs", "ateur", "ances", "ance", "ismes", "isme", "istes", "iste", "ités", "ite", "ies", "ie", "aux", "als", "eaux", "eau", "es", "s", "x"]) {
    if (mot.endsWith(suffixe) && mot.length - suffixe.length >= 4) return mot.slice(0, mot.length - suffixe.length);
  }
  return mot;
}

/**
 * Lexique du domaine.
 *
 * Chaque entrée associe une racine à des termes équivalents : la requête est
 * étendue avec eux, ce qui permet de retrouver la bonne fiche même quand le
 * visiteur n'emploie aucun des mots du site.
 */
const SYNONYMES: Record<string, string[]> = {
  cout: ["frais", "tarif", "prix", "scolarite", "mensualite", "paiement", "cher", "montant", "budget"],
  frais: ["cout", "tarif", "prix", "scolarite", "mensualite", "inscription"],
  prix: ["cout", "frais", "tarif", "scolarite"],
  inscri: ["preinscription", "admission", "candidature", "dossier", "postuler", "integrer", "rejoindre"],
  admission: ["inscription", "condition", "dossier", "candidature", "prerequis", "acces"],
  formation: ["filiere", "programme", "cursus", "licence", "master", "diplome", "etude", "parcours"],
  filiere: ["formation", "programme", "cursus", "specialite"],
  diplome: ["licence", "master", "bachelor", "ingenieur", "certificat", "formation"],
  campus: ["site", "antenne", "etablissement", "ecole", "implantation", "adresse", "ou"],
  contact: ["telephone", "email", "mail", "joindre", "appeler", "adresse", "numero"],
  horaire: ["ouverture", "heure", "jour", "planning"],
  distance: ["ligne", "foad", "elearning", "elearn", "distanciel", "teletravail"],
  bourse: ["aide", "financement", "echelonnement", "facilite"],
  stage: ["insertion", "emploi", "entreprise", "professionnel", "coip", "carriere"],
  debouche: ["metier", "emploi", "carriere", "poste", "profession"],
  informatique: ["logiciel", "developpement", "programmation", "genie", "numerique"],
  reseau: ["telecom", "systeme", "infrastructure", "cisco"],
  data: ["donnee", "intelligence", "artificielle", "ia", "science", "big"],
  gestion: ["management", "finance", "comptabilite", "commerce", "banque", "marketing"],
  rentree: ["annee", "academique", "session", "calendrier", "debut"],
  reconnaissance: ["accreditation", "anaq", "cames", "reconnu", "agrement", "etat"],
  directeur: ["direction", "president", "responsable", "administration", "pdg"],
  alumni: ["ancien", "diplome", "gradue", "promotion", "reseau", "insertion"],
  etudiant: ["eleve", "apprenant", "effectif"],
  vie: ["association", "club", "sport", "campus", "activite"],
};

/** Découpe un texte en racines significatives. */
export function jetons(texte: string): string[] {
  return normaliser(texte)
    .split(" ")
    .filter((m) => m.length > 1 && !MOTS_VIDES.has(m))
    .map(raciniser);
}

/**
 * Index inverse du lexique : chaque racine pointe vers tout son groupe.
 *
 * Le lexique est écrit sous forme de familles, mais l'expansion doit marcher
 * dans les deux sens — « cher » est dans le groupe de « coût » et doit donc
 * ramener « frais » et « scolarité » autant que l'inverse.
 */
const VOISINS: Map<string, Set<string>> = (() => {
  const index = new Map<string, Set<string>>();
  for (const [cle, valeurs] of Object.entries(SYNONYMES)) {
    const groupe = [cle, ...valeurs].map(raciniser);
    for (const membre of groupe) {
      const actuel = index.get(membre) ?? new Set<string>();
      for (const autre of groupe) if (autre !== membre) actuel.add(autre);
      index.set(membre, actuel);
    }
  }
  return index;
})();

/** Étend une requête avec les termes voisins du lexique du domaine. */
function etendre(termes: string[]): { terme: string; poids: number }[] {
  const sortie = new Map<string, number>();
  for (const t of termes) sortie.set(t, Math.max(sortie.get(t) ?? 0, 1));
  for (const t of termes) {
    for (const v of VOISINS.get(t) ?? []) {
      if (!sortie.has(v)) sortie.set(v, 0.45); // un synonyme pèse moins qu'un mot de la question
    }
  }
  return [...sortie].map(([terme, poids]) => ({ terme, poids }));
}

const K1 = 1.4;
const B = 0.72;
/** Les mots du titre valent plusieurs occurrences dans le corps du passage. */
const POIDS_TITRE = 3;

interface Document {
  passage: Passage;
  frequences: Map<string, number>;
  longueur: number;
}

export class IndexRecherche {
  private documents: Document[] = [];
  private df = new Map<string, number>();
  private longueurMoyenne = 0;

  constructor(passages: Passage[]) {
    for (const passage of passages) {
      const corps = jetons(passage.texte);
      const titre = jetons(passage.titre);
      const cles = (passage.motsCles ?? []).flatMap(jetons);
      const tous = [...corps, ...Array(POIDS_TITRE).fill(titre).flat(), ...Array(2).fill(cles).flat()];

      const frequences = new Map<string, number>();
      for (const t of tous) frequences.set(t, (frequences.get(t) ?? 0) + 1);
      for (const t of new Set(tous)) this.df.set(t, (this.df.get(t) ?? 0) + 1);

      this.documents.push({ passage, frequences, longueur: tous.length });
    }
    this.longueurMoyenne = this.documents.reduce((n, d) => n + d.longueur, 0) / Math.max(1, this.documents.length);
  }

  get taille(): number {
    return this.documents.length;
  }

  /** Renvoie les passages les plus pertinents, du meilleur au moins bon. */
  rechercher(requete: string, limite = 10): PassageTrouve[] {
    const termes = etendre(jetons(requete));
    if (!termes.length) return [];
    const N = this.documents.length;

    const resultats: PassageTrouve[] = [];
    for (const doc of this.documents) {
      let score = 0;
      for (const { terme, poids } of termes) {
        const f = doc.frequences.get(terme);
        if (!f) continue;
        const df = this.df.get(terme) ?? 1;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        const norme = f * (K1 + 1) / (f + K1 * (1 - B + B * (doc.longueur / this.longueurMoyenne)));
        score += poids * idf * norme;
      }
      if (score > 0) resultats.push({ ...doc.passage, score: score * (doc.passage.poids ?? 1) });
    }

    return resultats.sort((a, b) => b.score - a.score).slice(0, limite);
  }
}

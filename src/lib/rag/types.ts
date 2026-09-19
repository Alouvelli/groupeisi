/**
 * Types partagés de la base de connaissances du chatbot institutionnel.
 */

/** Familles de contenu, utilisées pour pondérer la recherche et afficher la source. */
export type SourceType =
  | "formation"
  | "campus"
  | "departement"
  | "personne"
  | "actualite"
  | "evenement"
  | "faq"
  | "temoignage"
  | "alumni"
  | "document"
  | "institution"
  | "pratique";

export const LIBELLE_SOURCE: Record<SourceType, string> = {
  formation: "Formation",
  campus: "Campus",
  departement: "Département",
  personne: "Équipe",
  actualite: "Actualité",
  evenement: "Évènement",
  faq: "Question fréquente",
  temoignage: "Témoignage",
  alumni: "Alumni",
  document: "Document",
  institution: "L'institut",
  pratique: "Infos pratiques",
};

/**
 * Un passage de la base de connaissances.
 *
 * `texte` est ce que lit le modèle, `titre` et `url` ce que voit l'utilisateur.
 * `motsCles` porte les formulations que la recherche lexicale ne retrouverait
 * pas autrement (sigles, synonymes propres à une fiche).
 */
export interface Passage {
  id: string;
  type: SourceType;
  titre: string;
  url: string | null;
  texte: string;
  motsCles?: string[];
  /** Pondération de la source, au-delà du score lexical (1 = neutre). */
  poids?: number;
}

/** Passage retrouvé, accompagné de son score de pertinence. */
export interface PassageTrouve extends Passage {
  score: number;
}

/** Source affichée sous une réponse. */
export interface SourceReponse {
  titre: string;
  url: string | null;
  type: SourceType;
}

/** Un tour de conversation, tel qu'échangé avec l'API du site. */
export interface TourChat {
  role: "user" | "assistant";
  contenu: string;
}

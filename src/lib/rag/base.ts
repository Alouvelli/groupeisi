import { construireCorpus } from "./corpus";
import { IndexRecherche } from "./recherche";
import type { PassageTrouve } from "./types";

/**
 * Base de connaissances en mémoire.
 *
 * L'index se reconstruit à la première question puis toutes les quinze
 * minutes : le contenu ne change qu'au rythme des publications de la rédaction,
 * et une reconstruction complète du corpus prend quelques dizaines de
 * millisecondes. `invaliderBase` permet à l'administration de forcer la
 * reprise immédiate après une publication.
 */

const DUREE_VIE_MS = 15 * 60 * 1000;

interface Etat {
  index: IndexRecherche;
  construitLe: number;
}

const global_ = globalThis as unknown as { baseRag?: Etat; baseRagEnCours?: Promise<Etat> };

async function construire(): Promise<Etat> {
  const debut = Date.now();
  const index = new IndexRecherche(await construireCorpus());
  const etat: Etat = { index, construitLe: Date.now() };
  global_.baseRag = etat;
  console.info(`[rag] base construite : ${index.taille} passages en ${Date.now() - debut} ms`);
  return etat;
}

async function obtenirEtat(): Promise<Etat> {
  const actuel = global_.baseRag;
  if (actuel && Date.now() - actuel.construitLe < DUREE_VIE_MS) return actuel;
  // Une seule construction à la fois, même si plusieurs questions arrivent ensemble.
  if (!global_.baseRagEnCours) {
    global_.baseRagEnCours = construire().finally(() => {
      global_.baseRagEnCours = undefined;
    });
  }
  return global_.baseRagEnCours;
}

/** Force la reconstruction de l'index à la prochaine question. */
export function invaliderBase(): void {
  global_.baseRag = undefined;
}

/** Nombre de passages indexés, ou zéro si l'index n'est pas encore construit. */
export function tailleBase(): number {
  return global_.baseRag?.index.taille ?? 0;
}

/**
 * Niveaux d'étude reconnus dans une question.
 *
 * « master data science » et « licence data science » sont deux formations
 * distinctes : quand le visiteur nomme un niveau, les fiches de ce niveau
 * doivent passer devant, ce que le score lexical seul ne garantit pas.
 */
const NIVEAUX: [RegExp, RegExp][] = [
  [/\bmaster[s]?\b|\bmast[eè]re\b|\bbac ?\+ ?5\b|\bm1\b|\bm2\b/i, /master/i],
  [/\blicence[s]?\b|\bbac ?\+ ?3\b|\bl3\b/i, /licence/i],
  [/\bbachelor[s]?\b/i, /bachelor/i],
  [/\bing[ée]nieur[s]?\b|\bcycle ing/i, /ing[ée]nieur/i],
];

/** Remonte les passages dont le niveau correspond à celui nommé par la question. */
function privilegierNiveau(question: string, resultats: PassageTrouve[]): PassageTrouve[] {
  const attendus = NIVEAUX.filter(([q]) => q.test(question)).map(([, titre]) => titre);
  if (!attendus.length) return resultats;
  return resultats
    .map((p) => (p.type === "formation" && attendus.some((r) => r.test(p.titre)) ? { ...p, score: p.score * 1.35 } : p))
    .sort((a, b) => b.score - a.score);
}

/**
 * Retrouve les passages utiles à une question.
 *
 * La reformulation tient compte des tours précédents : « et à Kaolack ? » n'a
 * de sens qu'avec la question qui la précède, on concatène donc la dernière
 * question de l'utilisateur à la nouvelle avant d'interroger l'index.
 */
export async function rechercherPassages(question: string, contexteAnterieur = "", limite = 10): Promise<PassageTrouve[]> {
  const { index } = await obtenirEtat();
  const requete = contexteAnterieur ? `${contexteAnterieur} ${question}` : question;
  const resultats = privilegierNiveau(question, index.rechercher(requete, limite * 2));

  // Un même document ne doit pas monopoliser le contexte avec ses tranches.
  const parUrl = new Map<string, number>();
  const retenus: PassageTrouve[] = [];
  for (const p of resultats) {
    const cle = p.url ?? p.id;
    const n = parUrl.get(cle) ?? 0;
    if (n >= 2) continue;
    parUrl.set(cle, n + 1);
    retenus.push(p);
    if (retenus.length >= limite) break;
  }
  return retenus;
}

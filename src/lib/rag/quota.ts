/**
 * Limitation de débit du chatbot.
 *
 * Chaque question consomme un appel facturé au modèle : sans garde-fou, une
 * boucle dans un onglet suffirait à vider le budget. La fenêtre glissante est
 * tenue en mémoire du processus, ce qui protège une instance ; derrière
 * plusieurs instances, il faudra la déplacer dans Redis, déjà présent pour les
 * files d'attente.
 */

const FENETRE_MS = 60_000;
const MAX_PAR_FENETRE = 12;
const MAX_PAR_HEURE = 80;

interface Compteur {
  minute: number[];
  heure: number[];
}

const global_ = globalThis as unknown as { quotasChat?: Map<string, Compteur> };
const compteurs = (global_.quotasChat ??= new Map<string, Compteur>());

/** Purge les entrées trop anciennes pour que la table ne grossisse pas sans fin. */
function nettoyer(maintenant: number): void {
  if (compteurs.size < 500) return;
  for (const [cle, c] of compteurs) {
    if (!c.heure.some((t) => maintenant - t < 3_600_000)) compteurs.delete(cle);
  }
}

export interface Verdict {
  autorise: boolean;
  /** Secondes à attendre avant la prochaine tentative. */
  attendre: number;
}

/** Enregistre une question et dit si elle est autorisée. */
export function verifierQuota(cle: string): Verdict {
  const maintenant = Date.now();
  nettoyer(maintenant);

  const c = compteurs.get(cle) ?? { minute: [], heure: [] };
  c.minute = c.minute.filter((t) => maintenant - t < FENETRE_MS);
  c.heure = c.heure.filter((t) => maintenant - t < 3_600_000);

  if (c.minute.length >= MAX_PAR_FENETRE) {
    compteurs.set(cle, c);
    return { autorise: false, attendre: Math.ceil((FENETRE_MS - (maintenant - c.minute[0])) / 1000) };
  }
  if (c.heure.length >= MAX_PAR_HEURE) {
    compteurs.set(cle, c);
    return { autorise: false, attendre: Math.ceil((3_600_000 - (maintenant - c.heure[0])) / 1000) };
  }

  c.minute.push(maintenant);
  c.heure.push(maintenant);
  compteurs.set(cle, c);
  return { autorise: true, attendre: 0 };
}

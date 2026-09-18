/**
 * Normalise prisma/data/programmes-details.json (extraction brute des fiches
 * formation de test.groupeisi.com) en listes prêtes à être injectées par le
 * seed : suppression des phrases d'amorce, éclatement des puces collées,
 * ponctuation et majuscules homogènes.
 *
 *   node scripts/normaliser-programmes.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = new URL("../prisma/data/programmes-details.json", import.meta.url);

/** Phrases d'amorce (« le diplômé sera capable de : ») sans valeur de contenu. */
const AMORCES = [
  /^(le|la|les|ce|cette|nos|au terme|a la fin|à la fin|de mani[eè]re|en termes)\b[^.]{0,160}(suivants?|suivantes?|qui sont|capables? de|en mesure( de)?|acc[eé]der [aà] des postes tels que|exercer|occuper|devenir|domaines suivants|vise [aà]|permet [aà] l.[eé]tudiant|se pr[eé]sente comme suit)\s*:?$/i,
  /^(objectifs?|comp[eé]tences?|d[eé]bouch[eé]s?|conditions d.admission|unit[eé]s d.enseignements?)$/i,
  /^[–\-•]?\s*\(?en termes de [^)]*\)?$/i,
  /^ce (parcours|programme|cursus) est subdivis[eé]/i,
];

const FIN_PONCT = /[;,.\s]+$/;

/** Mots recollés par l'extraction Elementor du site source. */
const FUSIONS = [
  [/(?<!\p{L})aété(?!\p{L})/giu, "a été"],
  [/(?<!\p{L})apour(?!\p{L})/giu, "a pour"],
  [/(?<!\p{L})etdéveloppement(?!\p{L})/giu, "et développement"],
  [/(?<!\p{L})desdonnées(?!\p{L})/giu, "des données"],
];
const recoller = (s) => FUSIONS.reduce((t, [r, v]) => t.replace(r, v), s);

const nettoyerItem = (s) =>
  recoller(s)
    .replace(/ /g, " ")
    .replace(/^[\s•✔✓►▪◦*]+/, "")
    .replace(/^[–—-]\s+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/\s+/g, " ")
    .trim();

/** Éclate les puces collées sur une même ligne (« a • b • c », « – a – b »). */
const eclater = (s) => {
  if ((s.match(/\s•\s/g) ?? []).length >= 1) return s.split(/\s•\s/);
  if ((s.match(/\s[–—]\s/g) ?? []).length >= 2) return s.split(/\s[–—]\s/);
  if ((s.match(/\s✔\s/g) ?? []).length >= 1) return s.split(/\s✔\s/);
  return [s];
};

const majuscule = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const estAmorce = (s) => AMORCES.some((r) => r.test(s.trim()));

function normaliserListe(liste) {
  if (!Array.isArray(liste)) return [];
  const out = [];
  for (const [i, brut] of liste.entries()) {
    const base = nettoyerItem(String(brut));
    if (!base) continue;
    if (i === 0 && estAmorce(base)) continue;
    if (estAmorce(base) && base.length < 140) continue;
    for (const part of eclater(base)) {
      const item = majuscule(nettoyerItem(part).replace(FIN_PONCT, ""));
      if (item.length > 2 && !out.includes(item)) out.push(item);
    }
  }
  return out;
}

/** Les UE arrivent soit en « CODE: Intitulé », soit en lignes intitulé/description. */
function normaliserUE(liste) {
  const items = normaliserListe(liste);
  const ue = [];
  for (const item of items) {
    const m = item.match(/^(UE\s*\d*\s*:|[A-Z]{2,4}\s*:)\s*(.+)$/);
    if (m) {
      const reste = m[2];
      const idx = reste.indexOf(": ");
      ue.push(idx > 0 ? { intitule: reste.slice(0, idx).trim(), contenu: reste.slice(idx + 2).trim() } : { intitule: reste.trim() });
      continue;
    }
    // Ligne de description rattachée à la dernière UE connue.
    if (ue.length && (item.length > 90 || /^(Introduction|Principes|Gestion|Approfondissement|Concepts)\b/.test(item))) {
      const last = ue[ue.length - 1];
      last.contenu = last.contenu ? `${last.contenu} ${item}` : item;
      continue;
    }
    if (/^(Modules|Cr[eé]dits|Description|Semestre|Licence \d|Master .* [–-] M\d)/i.test(item)) continue;
    ue.push({ intitule: item });
  }
  return ue.filter((u) => u.intitule.length > 2);
}

const brut = JSON.parse(readFileSync(SRC, "utf8"));
const sortie = {};
let total = 0;
for (const [slug, v] of Object.entries(brut)) {
  const fiche = {
    source: v.source,
    titreSource: v.titreSource,
    intro: v.intro ? nettoyerItem(v.intro).replace(/[\s;,]+$/, "") : undefined,
    objectifs: normaliserListe(v.objectifs),
    competences: normaliserListe(v.competences),
    debouches: normaliserListe(v.debouches),
    admission: normaliserListe(v.admission),
    unitesEnseignement: normaliserUE(v.ue),
  };
  for (const k of ["objectifs", "competences", "debouches", "admission"]) if (!fiche[k].length) delete fiche[k];
  if (!fiche.unitesEnseignement.length) delete fiche.unitesEnseignement;
  if (!fiche.intro) delete fiche.intro;
  total += Object.values(fiche).filter(Array.isArray).reduce((n, a) => n + a.length, 0);
  sortie[slug] = fiche;
}

writeFileSync(SRC, `${JSON.stringify(sortie, null, 2)}\n`);
console.log(`${Object.keys(sortie).length} fiches, ${total} éléments normalisés.`);

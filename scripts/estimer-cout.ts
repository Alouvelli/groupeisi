/**
 * Estimation du coût d'une question du chatbot.
 *
 * Mesure la taille réelle de la consigne et du contexte assemblé, puis
 * applique les tarifs publics du modèle. Sert à dimensionner le budget avant
 * d'ouvrir l'assistant au public, et à mesurer l'effet d'un changement du
 * corpus ou du nombre de passages envoyés.
 *
 *   npx tsx scripts/estimer-cout.ts
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { preparer } from "../src/lib/rag/reponse";

/**
 * Tarifs de claude-opus-5, en dollars par million de jetons.
 * Source : platform.claude.com/docs/en/about-claude/pricing (relevé 2026-09-19).
 */
const TARIFS = { entree: 5, ecritureCache: 6.25, lectureCache: 0.5, sortie: 25 };

/**
 * Le français avec le tokeniseur récent tourne autour de 3,1 caractères par
 * jeton. C'est une approximation : le compte exact s'obtient avec l'endpoint
 * de comptage de jetons, qui demande une clé d'API.
 */
const CARACTERES_PAR_JETON = 3.1;

/** Longueur typique d'une réponse de l'assistant, volontairement courte. */
const JETONS_SORTIE = 300;

const QUESTIONS = [
  "combien coûte la licence en cybersécurité ?",
  "comment je fais pour m'inscrire ?",
  "vous avez un campus à Kaolack ?",
  "quels débouchés après un master en génie logiciel ?",
  "peut-on étudier à distance ?",
  "vos diplômes sont reconnus par l'État ?",
];

const dollars = (n: number) => `${n < 0.01 ? n.toFixed(5) : n.toFixed(4)} $`;

async function main() {
  const source = readFileSync(new URL("../src/lib/rag/reponse.ts", import.meta.url), "utf8");
  const consigne = source.split("const CONSIGNE = `")[1]?.split("`;")[0] ?? "";

  let totalContexte = 0;
  for (const q of QUESTIONS) {
    const { messages } = await preparer({ question: q, page: "/formations" });
    const dernier = messages[messages.length - 1];
    totalContexte += typeof dernier.content === "string" ? dernier.content.length : 0;
  }

  const jetonsConsigne = Math.round(consigne.length / CARACTERES_PAR_JETON);
  const jetonsContexte = Math.round(totalContexte / QUESTIONS.length / CARACTERES_PAR_JETON);

  console.log(`Consigne système : ${consigne.length} caractères, soit environ ${jetonsConsigne} jetons (mise en cache).`);
  console.log(`Contexte moyen   : ${Math.round(totalContexte / QUESTIONS.length)} caractères, soit environ ${jetonsContexte} jetons.`);
  console.log(`Réponse estimée  : ${JETONS_SORTIE} jetons.\n`);

  const cacheChaud = (jetonsConsigne * TARIFS.lectureCache) / 1e6;
  const cacheFroid = (jetonsConsigne * TARIFS.ecritureCache) / 1e6;
  const contexte = (jetonsContexte * TARIFS.entree) / 1e6;
  const sortie = (JETONS_SORTIE * TARIFS.sortie) / 1e6;

  const parQuestion = cacheChaud + contexte + sortie;
  console.log(`Coût par question (consigne en cache) : ${dollars(parQuestion)}`);
  console.log(`  dont contexte ${dollars(contexte)}, réponse ${dollars(sortie)}, consigne ${dollars(cacheChaud)}`);
  console.log(`Première question après cinq minutes d'inactivité : ${dollars(cacheFroid + contexte + sortie)}\n`);

  for (const n of [100, 500, 1000, 5000]) {
    console.log(`${String(n).padStart(5)} questions par mois : ${(parQuestion * n).toFixed(2)} $`);
  }

  const plafondHoraire = 80 * parQuestion;
  console.log(`\nPlafond par visiteur : 80 questions par heure, soit ${plafondHoraire.toFixed(2)} $ au maximum pour une seule adresse.`);
  process.exit(0);
}

main();

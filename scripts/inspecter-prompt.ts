/**
 * Inspection de la requête envoyée au modèle.
 *
 * Affiche, pour une question donnée, les passages retenus et le message
 * exactement tel qu'il partirait à l'API. Permet de vérifier l'ancrage sans
 * dépenser d'appel, et de voir tout de suite si une information manque du
 * contexte.
 *
 *   npx tsx scripts/inspecter-prompt.ts "combien coûte la licence en cybersécurité ?"
 */
import "dotenv/config";
import { preparer } from "../src/lib/rag/reponse";

async function main() {
  const question = process.argv.slice(2).join(" ") || "combien coûte la licence en cybersécurité ?";
  const { passages, messages } = await preparer({ question, page: "/formations" });

  console.log(`Question : ${question}\n`);
  console.log(`Passages retenus (${passages.length}) :`);
  for (const [i, p] of passages.entries()) {
    console.log(`  [${i + 1}] ${p.score.toFixed(2).padStart(6)}  ${p.titre} — ${p.url ?? "sans page"}`);
  }

  const dernier = messages[messages.length - 1];
  const contexte = typeof dernier.content === "string" ? dernier.content : "";
  console.log(`\nTaille du contexte : ${contexte.length} caractères, soit environ ${Math.round(contexte.length / 3.6)} jetons.`);
  console.log(`\n--- message envoyé (début) ---\n${contexte.slice(0, 900)}\n…`);
  process.exit(0);
}

main();

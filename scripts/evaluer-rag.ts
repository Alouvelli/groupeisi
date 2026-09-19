/**
 * Évaluation de la recherche du chatbot.
 *
 * Pour chaque question type, on vérifie qu'un passage attendu remonte dans les
 * premiers résultats. C'est la moitié du système qui se mesure sans appeler le
 * modèle : si la recherche ne trouve pas le bon extrait, aucune génération ne
 * rattrapera la réponse.
 *
 *   npx tsx scripts/evaluer-rag.ts
 */
import "dotenv/config";
import { construireCorpus } from "../src/lib/rag/corpus";
import { IndexRecherche } from "../src/lib/rag/recherche";

/** `attendu` : fragment attendu dans l'URL ou le titre d'un des premiers résultats. */
const QUESTIONS: { question: string; attendu: RegExp }[] = [
  { question: "combien coûte la licence en cybersécurité ?", attendu: /licence-cybersecurite/ },
  { question: "c'est cher comment les études chez vous ?", attendu: /frais-d-etudes|formations\// },
  { question: "quels sont les frais d'inscription ?", attendu: /frais-d-etudes|formations\// },
  { question: "comment je fais pour m'inscrire ?", attendu: /preinscription|condition-admission/ },
  { question: "quels documents fournir pour candidater ?", attendu: /condition-admission|preinscription|faq/ },
  { question: "vous êtes où exactement ?", attendu: /contact|campus/ },
  { question: "votre numéro de téléphone", attendu: /contact/ },
  { question: "vous avez un campus à Kaolack ?", attendu: /isi-kl|campus/ },
  { question: "est-ce qu'il y a une école à Ziguinchor", attendu: /isi-zg|campus/ },
  { question: "je veux faire de l'intelligence artificielle", attendu: /data-science|miage|department-of-data-science/ },
  { question: "formations en réseaux et télécoms", attendu: /reseaux|telecommunication/ },
  { question: "vous faites du marketing digital ?", attendu: /marketing/ },
  { question: "peut-on étudier à distance ?", attendu: /formation-en-ligne/ },
  { question: "vos diplômes sont reconnus par l'État ?", attendu: /a-propos|faq|formations\// },
  { question: "qui dirige l'institut ?", attendu: /equipe|a-propos/ },
  { question: "quels débouchés après un master en génie logiciel ?", attendu: /master-genie-logiciel/ },
  { question: "quand est la rentrée ?", attendu: /a-propos|faq|preinscription/ },
  { question: "il y a des événements bientôt ?", attendu: /evenements|actualites/ },
  { question: "parlez-moi de vos anciens étudiants", attendu: /alumni|temoignages/ },
  { question: "où télécharger la brochure ?", attendu: /telechargements|librairie/ },
  { question: "cycle ingénieur informatique", attendu: /cycle-ingenieur/ },
  { question: "licence en énergies renouvelables", attendu: /energies-renouvelables/ },
  { question: "combien d'étudiants êtes-vous ?", attendu: /a-propos/ },
  { question: "je cherche la page des actualités", attendu: /actualites|^\/$/ },
];

async function main() {
  const debutCorpus = Date.now();
  const corpus = await construireCorpus();
  const index = new IndexRecherche(corpus);
  console.log(`Corpus : ${corpus.length} passages, index construit en ${Date.now() - debutCorpus} ms\n`);

  let rang1 = 0;
  let rang3 = 0;
  let rang5 = 0;
  const echecs: string[] = [];
  let totalMs = 0;

  for (const { question, attendu } of QUESTIONS) {
    const t0 = performance.now();
    const resultats = index.rechercher(question, 5);
    totalMs += performance.now() - t0;

    // Les titres portent des accents que les motifs attendus n'ont pas.
    const sansAccent = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const rang = resultats.findIndex((r) => attendu.test(r.url ?? "") || attendu.test(sansAccent(r.titre)));
    if (rang === 0) rang1++;
    if (rang >= 0 && rang < 3) rang3++;
    if (rang >= 0) rang5++;

    const marque = rang === 0 ? "1er " : rang > 0 ? `${rang + 1}e  ` : "  — ";
    console.log(`${marque} ${question}`);
    console.log(`      → ${resultats.slice(0, 3).map((r) => `${r.titre} (${r.url ?? "—"})`).join(" · ") || "aucun résultat"}`);
    if (rang < 0) echecs.push(question);
  }

  const n = QUESTIONS.length;
  const pct = (x: number) => `${Math.round((x / n) * 100)} %`;
  console.log(`\n${n} questions · trouvé en 1re position ${pct(rang1)} · dans les 3 premiers ${pct(rang3)} · dans les 5 premiers ${pct(rang5)}`);
  console.log(`Latence moyenne de la recherche : ${(totalMs / n).toFixed(1)} ms`);
  if (echecs.length) console.log(`\nSans résultat attendu :\n- ${echecs.join("\n- ")}`);
  process.exit(echecs.length ? 1 : 0);
}

main();

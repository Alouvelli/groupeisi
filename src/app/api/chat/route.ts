import { NextResponse } from "next/server";
import { z } from "zod";
import { verifierQuota } from "@/lib/rag/quota";
import { diffuserReponse, generationDisponible, preparer, reponseDocumentaire, sourcesCitees } from "@/lib/rag/reponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  question: z.string().trim().min(2, "Question trop courte").max(1000, "Question trop longue"),
  historique: z
    .array(z.object({ role: z.enum(["user", "assistant"]), contenu: z.string().max(4000) }))
    .max(20)
    .optional(),
  page: z.string().max(200).nullable().optional(),
});

/** Événements du flux, en JSON délimité par des sauts de ligne. */
type Evenement =
  | { type: "delta"; texte: string }
  | { type: "sources"; sources: ReturnType<typeof sourcesCitees> }
  | { type: "fin" }
  | { type: "erreur"; message: string };

const encodeur = new TextEncoder();
const ligne = (e: Evenement) => encodeur.encode(`${JSON.stringify(e)}\n`);

/**
 * Point d'entrée du chatbot institutionnel.
 *
 * Retrouve les passages utiles dans la base de connaissances, les fait lire au
 * modèle et diffuse la réponse au fil de l'eau. Les sources arrivent en fin de
 * flux : elles se déduisent des numéros de citation réellement employés.
 */
export async function POST(request: Request) {
  // La validation passe avant le quota : rejeter une requête malformée ne
  // coûte rien, elle n'a donc pas à consommer le crédit du visiteur.
  let entree: z.infer<typeof schema>;
  try {
    entree = schema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const cle = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonyme";
  const quota = verifierQuota(cle);
  if (!quota.autorise) {
    return NextResponse.json(
      { message: `Vous avez posé beaucoup de questions d'affilée. Réessayez dans ${quota.attendre} secondes.` },
      { status: 429, headers: { "retry-after": String(quota.attendre) } },
    );
  }

  let prep;
  try {
    prep = await preparer({ question: entree.question, historique: entree.historique, page: entree.page });
  } catch (err) {
    console.error("[chat] base de connaissances indisponible", err);
    return NextResponse.json({ message: "Le service est momentanément indisponible." }, { status: 503 });
  }

  const flux = new ReadableStream<Uint8Array>({
    async start(controleur) {
      try {
        let sources;
        if (generationDisponible()) {
          let complet = "";
          for await (const morceau of diffuserReponse(prep)) {
            complet += morceau;
            controleur.enqueue(ligne({ type: "delta", texte: morceau }));
          }
          sources = sourcesCitees(complet, prep.passages);
        } else {
          // Sans clé d'API, le chatbot reste utile en mode documentaire : il
          // restitue les passages trouvés au lieu de les faire rédiger.
          const { texte, sources: citees } = reponseDocumentaire(prep.passages);
          controleur.enqueue(ligne({ type: "delta", texte }));
          sources = citees;
        }
        controleur.enqueue(ligne({ type: "sources", sources }));
        controleur.enqueue(ligne({ type: "fin" }));
      } catch (err) {
        console.error("[chat] échec de la génération", err);
        controleur.enqueue(
          ligne({
            type: "erreur",
            message: "Je n'arrive pas à répondre pour le moment. Le service des admissions reste joignable depuis la page Contact.",
          }),
        );
      } finally {
        controleur.close();
      }
    },
  });

  return new Response(flux, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

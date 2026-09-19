import { Fragment } from "react";

/**
 * Rendu du texte de l'assistant.
 *
 * Le modèle écrit en markdown léger : gras, listes à puces ou numérotées, et
 * appels de citation entre crochets. On les transforme en éléments React
 * plutôt qu'en HTML injecté — le texte vient d'un modèle, il n'a rien à faire
 * dans `dangerouslySetInnerHTML`.
 */

/** Découpe une ligne en segments gras et en appels de citation. */
function segments(ligne: string, cle: string) {
  const morceaux: React.ReactNode[] = [];
  const motif = /(\*\*[^*]+\*\*)|(\[\d{1,2}\])/g;
  let dernier = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = motif.exec(ligne)) !== null) {
    if (m.index > dernier) morceaux.push(ligne.slice(dernier, m.index));
    if (m[1]) {
      morceaux.push(
        <strong key={`${cle}-g${i}`} className="font-semibold text-dark">
          {m[1].slice(2, -2)}
        </strong>,
      );
    } else if (m[2]) {
      morceaux.push(
        <sup key={`${cle}-c${i}`} className="mx-0.5 text-[10px] font-semibold text-primary">
          {m[2].slice(1, -1)}
        </sup>,
      );
    }
    dernier = m.index + m[0].length;
    i++;
  }
  if (dernier < ligne.length) morceaux.push(ligne.slice(dernier));
  return morceaux;
}

export function Formatte({ texte }: { texte: string }) {
  const blocs: React.ReactNode[] = [];
  const lignes = texte.split("\n");
  let liste: { ordonnee: boolean; items: string[] } | null = null;

  const viderListe = (cle: string) => {
    if (!liste) return;
    const Balise = liste.ordonnee ? "ol" : "ul";
    blocs.push(
      <Balise key={cle} className={liste.ordonnee ? "my-2 list-decimal space-y-1 pl-5" : "my-2 list-disc space-y-1 pl-5"}>
        {liste.items.map((item, i) => (
          <li key={`${cle}-${i}`}>{segments(item, `${cle}-${i}`)}</li>
        ))}
      </Balise>,
    );
    liste = null;
  };

  for (const [i, brute] of lignes.entries()) {
    const ligne = brute.trimEnd();
    const puce = ligne.match(/^\s*[-–•*]\s+(.*)$/);
    const numero = ligne.match(/^\s*\d+[.)]\s+(.*)$/);

    if (puce || numero) {
      const ordonnee = Boolean(numero);
      if (!liste || liste.ordonnee !== ordonnee) viderListe(`l${i}`);
      liste ??= { ordonnee, items: [] };
      liste.items.push((puce?.[1] ?? numero?.[1]) as string);
      continue;
    }

    viderListe(`l${i}`);
    if (!ligne.trim()) continue;
    blocs.push(
      <p key={`p${i}`} className="my-1.5 first:mt-0 last:mb-0">
        {segments(ligne, `p${i}`)}
      </p>,
    );
  }
  viderListe("lfin");

  return <Fragment>{blocs}</Fragment>;
}

"use client";

import { useCallback, useRef, useState } from "react";
import type { SourceReponse } from "@/lib/rag/types";

export interface MessageChat {
  id: string;
  role: "user" | "assistant";
  contenu: string;
  sources?: SourceReponse[];
  erreur?: boolean;
}

const identifiant = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * État et transport de la conversation.
 *
 * La réponse arrive en JSON délimité par des sauts de ligne : chaque ligne est
 * un événement, ce qui permet d'afficher le texte au fil de l'eau puis les
 * sources une fois la réponse terminée. Un envoi en cours peut être interrompu.
 */
export function useChat(page: string | null) {
  const [messages, setMessages] = useState<MessageChat[]>([]);
  const [enCours, setEnCours] = useState(false);
  const abandon = useRef<AbortController | null>(null);

  const interrompre = useCallback(() => {
    abandon.current?.abort();
    abandon.current = null;
    setEnCours(false);
  }, []);

  const reinitialiser = useCallback(() => {
    interrompre();
    setMessages([]);
  }, [interrompre]);

  const envoyer = useCallback(
    async (question: string) => {
      const propre = question.trim();
      if (!propre || enCours) return;

      const idReponse = identifiant();
      const historique = messages.map((m) => ({ role: m.role, contenu: m.contenu }));

      setMessages((m) => [
        ...m,
        { id: identifiant(), role: "user", contenu: propre },
        { id: idReponse, role: "assistant", contenu: "" },
      ]);
      setEnCours(true);

      const controleur = new AbortController();
      abandon.current = controleur;

      const echouer = (message: string) =>
        setMessages((m) => m.map((x) => (x.id === idReponse ? { ...x, contenu: message, erreur: true } : x)));

      try {
        const reponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: propre, historique, page }),
          signal: controleur.signal,
        });

        if (!reponse.ok || !reponse.body) {
          const corps = await reponse.json().catch(() => null);
          echouer(corps?.message ?? "Le service ne répond pas pour le moment.");
          return;
        }

        const lecteur = reponse.body.getReader();
        const decodeur = new TextDecoder();
        let reste = "";

        for (;;) {
          const { done, value } = await lecteur.read();
          if (done) break;
          reste += decodeur.decode(value, { stream: true });

          const lignes = reste.split("\n");
          reste = lignes.pop() ?? ""; // la dernière ligne peut être incomplète
          for (const l of lignes) {
            if (!l.trim()) continue;
            let evenement: { type: string; texte?: string; sources?: SourceReponse[]; message?: string };
            try {
              evenement = JSON.parse(l);
            } catch {
              continue; // ligne tronquée par le réseau : on l'ignore plutôt que de casser le flux
            }
            if (evenement.type === "delta" && evenement.texte) {
              setMessages((m) => m.map((x) => (x.id === idReponse ? { ...x, contenu: x.contenu + evenement.texte } : x)));
            } else if (evenement.type === "sources") {
              setMessages((m) => m.map((x) => (x.id === idReponse ? { ...x, sources: evenement.sources } : x)));
            } else if (evenement.type === "erreur") {
              echouer(evenement.message ?? "Une erreur est survenue.");
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") echouer("La connexion a été interrompue. Réessayez dans un instant.");
      } finally {
        abandon.current = null;
        setEnCours(false);
      }
    },
    [enCours, messages, page],
  );

  return { messages, enCours, envoyer, interrompre, reinitialiser };
}

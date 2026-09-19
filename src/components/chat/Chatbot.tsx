"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, ExternalLink, MessageCircleQuestion, RotateCcw, Square, X } from "lucide-react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Formatte } from "./Formatte";
import { useChat } from "./useChat";

/** Questions proposées à l'ouverture, choisies parmi les demandes les plus courantes. */
const SUGGESTIONS = [
  "Quelles formations proposez-vous ?",
  "Combien coûte une licence ?",
  "Comment se préinscrire ?",
  "Où sont vos campus ?",
];

const courbe = [...EASE_OUT] as [number, number, number, number];

/**
 * Assistant du site.
 *
 * Bulle flottante à droite, panneau de conversation ancré au même endroit. Il
 * connaît la page consultée : la réponse peut ainsi renvoyer vers la bonne
 * section sans que le visiteur ait à se situer lui-même.
 */
export function Chatbot() {
  const page = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const [saisie, setSaisie] = useState("");
  const { messages, enCours, envoyer, interrompre, reinitialiser } = useChat(page);

  const zone = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLTextAreaElement>(null);

  // Suit le fil au fur et à mesure que la réponse s'écrit.
  useEffect(() => {
    zone.current?.scrollTo({ top: zone.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (ouvert) champ.current?.focus();
  }, [ouvert]);

  // La touche d'échappement referme le panneau, comme tout calque du site.
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  const soumettre = (texte: string) => {
    void envoyer(texte);
    setSaisie("");
  };

  return (
    <>
      {/* Bulle d'appel */}
      <motion.button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-label={ouvert ? "Fermer l'assistant" : "Poser une question à l'assistant"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-card transition-colors hover:bg-secondary hover:text-secondary-fg"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={ouvert ? "fermer" : "ouvrir"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2, ease: courbe }}
          >
            {ouvert ? <X className="h-6 w-6" aria-hidden /> : <Bot className="h-6 w-6" aria-hidden />}
          </motion.span>
        </AnimatePresence>
        {!ouvert && <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-full bg-primary" aria-hidden />}
      </motion.button>

      {/* Panneau de conversation */}
      <AnimatePresence>
        {ouvert && (
          <motion.section
            role="dialog"
            aria-label="Assistant du Groupe ISI"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.28, ease: courbe }}
            className="fixed bottom-24 right-4 z-50 flex max-h-[min(640px,calc(100vh-7.5rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card sm:right-6 sm:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-line bg-primary px-5 py-4 text-white">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-[16px] font-semibold leading-tight">Assistant Groupe ISI</span>
                <span className="block text-[12px] text-white/70">Réponses tirées du contenu du site</span>
              </span>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={reinitialiser}
                  aria-label="Effacer la conversation"
                  className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer l'assistant"
                className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </header>

            <div ref={zone} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.length === 0 && (
                <div className="text-[15px] leading-7 text-body">
                  <p>
                    Bonjour. Posez votre question sur les formations, les frais, l&apos;admission ou les campus : je réponds à partir du contenu
                    du site.
                  </p>
                  <p className="mt-4 mb-2 flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-wide text-muted">
                    <MessageCircleQuestion className="h-4 w-4 text-primary" aria-hidden /> Pour commencer
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => soumettre(s)}
                        className="rounded-full border border-line px-3 py-1.5 text-left text-[13px] text-body transition hover:border-primary hover:text-primary"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-7",
                      m.role === "user"
                        ? "bg-primary text-white"
                        : m.erreur
                          ? "border border-secondary bg-secondary-50 text-body"
                          : "bg-surface text-body",
                    )}
                  >
                    {m.role === "assistant" && !m.contenu && enCours ? (
                      <span className="flex gap-1 py-1" aria-label="L'assistant rédige sa réponse">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            animate={{ opacity: [0.25, 1, 0.25] }}
                            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                            className="h-1.5 w-1.5 rounded-full bg-primary"
                          />
                        ))}
                      </span>
                    ) : m.role === "assistant" ? (
                      <Formatte texte={m.contenu} />
                    ) : (
                      m.contenu
                    )}

                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-3 border-t border-line pt-3">
                        <p className="mb-1.5 text-[12px] font-medium uppercase tracking-wide text-muted">Sources</p>
                        <ul className="space-y-1">
                          {m.sources.map((s, i) => (
                            <li key={`${s.url ?? s.titre}-${i}`}>
                              {s.url ? (
                                <Link
                                  href={s.url}
                                  onClick={() => setOuvert(false)}
                                  className="inline-flex items-start gap-1.5 text-[13px] font-medium text-primary transition hover:text-secondary-dark"
                                >
                                  <span className="mt-0.5 text-[10px] font-semibold">{i + 1}</span>
                                  <span className="underline-offset-2 hover:underline">{s.titre}</span>
                                  <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                                </Link>
                              ) : (
                                <span className="text-[13px] text-muted">{s.titre}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                soumettre(saisie);
              }}
              className="border-t border-line p-3"
            >
              <div className="flex items-end gap-2 rounded-xl border border-line bg-white px-3 py-2 transition focus-within:border-primary">
                <label htmlFor="chat-question" className="sr-only">
                  Votre question
                </label>
                <textarea
                  id="chat-question"
                  ref={champ}
                  rows={1}
                  value={saisie}
                  onChange={(e) => {
                    setSaisie(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      soumettre(saisie);
                    }
                  }}
                  placeholder="Posez votre question…"
                  maxLength={1000}
                  className="max-h-[120px] flex-1 resize-none bg-transparent text-[15px] text-body outline-none placeholder:text-muted"
                />
                {enCours ? (
                  <button
                    type="button"
                    onClick={interrompre}
                    aria-label="Interrompre la réponse"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary transition hover:bg-line"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" aria-hidden />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!saisie.trim()}
                    aria-label="Envoyer la question"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-secondary hover:text-secondary-fg disabled:opacity-40"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </div>
              <p className="mt-2 px-1 text-[11px] leading-4 text-muted">
                Assistant automatique. Pour un dossier personnel, contactez le service des admissions.
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

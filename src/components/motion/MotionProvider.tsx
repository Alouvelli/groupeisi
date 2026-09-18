"use client";

import { MotionConfig } from "framer-motion";

/**
 * Réglage global du mouvement.
 *
 * `reducedMotion="user"` délègue à framer-motion la prise en compte de la
 * préférence système : les déplacements et mises à l'échelle sont neutralisés
 * pour qui a demandé moins d'animations, l'opacité reste animée.
 *
 * C'est aussi ce qui permet aux composants de mouvement de rendre exactement
 * le même balisage côté serveur et côté client : brancher sur la préférence
 * pour changer la structure provoquerait une erreur d'hydratation.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

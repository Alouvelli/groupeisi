"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Barre de progression de lecture, fixée sous l'en-tête.
 *
 * Utile sur les pages longues (article, fiche formation) : elle indique la
 * part déjà parcourue. Masquée quand l'utilisateur refuse les animations.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const echelle = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: echelle }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-secondary"
    />
  );
}

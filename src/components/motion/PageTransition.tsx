"use client";

import { motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

/**
 * Transition d'entrée d'une page.
 *
 * Monté par le template du groupe de routes : à chaque navigation, React
 * remonte ce composant, ce qui rejoue l'animation. Volontairement brève, pour
 * ne pas retarder la lecture.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [...EASE_OUT] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  );
}

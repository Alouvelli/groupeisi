"use client";

import { motion } from "framer-motion";
import { EASE_LONG, SEUIL_VUE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Révélation d'un visuel par un voile qui glisse.
 *
 * Un rectangle plein couvre l'image puis s'escamote dans la direction
 * choisie, pendant que l'image se désagrandit légèrement. L'ensemble reste
 * dans le flux : aucune réservation d'espace supplémentaire.
 */
export function ImageReveal({
  children,
  className,
  sens = "gauche",
  delay = 0,
  couleurVoile = "bg-primary",
}: {
  children: React.ReactNode;
  className?: string;
  sens?: "gauche" | "droite" | "haut" | "bas";
  delay?: number;
  couleurVoile?: string;
}) {
  const sortie = {
    gauche: { x: "100%" },
    droite: { x: "-100%" },
    haut: { y: "100%" },
    bas: { y: "-100%" },
  }[sens];

  const courbe = [...EASE_LONG] as [number, number, number, number];

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={SEUIL_VUE} className={cn("relative overflow-hidden", className)}>
      <motion.div
        variants={{ hidden: { scale: 1.12 }, visible: { scale: 1 } }}
        transition={{ duration: 1.2, delay, ease: courbe }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
      <motion.span
        aria-hidden
        variants={{ hidden: { x: "0%", y: "0%" }, visible: sortie }}
        transition={{ duration: 0.9, delay, ease: courbe }}
        className={cn("pointer-events-none absolute inset-0 z-10", couleurVoile)}
      />
    </motion.div>
  );
}

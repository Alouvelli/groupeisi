"use client";

import { createElement } from "react";
import { motion } from "framer-motion";
import { CASCADE, EASE_OUT, SEUIL_VUE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const motPar = {
  hidden: { opacity: 0, y: "0.55em" },
  visible: { opacity: 1, y: "0em" },
};

/**
 * Titre dont les mots montent en cascade derrière une ligne de masque.
 *
 * Chaque mot est enveloppé dans un conteneur à débordement masqué, ce qui
 * donne l'impression qu'il surgit de dessous la ligne de base. Le texte reste
 * un seul nœud pour les lecteurs d'écran grâce à aria-label.
 */
export function AnimatedHeading({
  children,
  className,
  as = "h2",
  delay = 0,
  gap = CASCADE.serre,
  once = true,
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  delay?: number;
  gap?: number;
  once?: boolean;
}) {
  const mots = children.split(" ").filter(Boolean);

  return createElement(
    as,
    { className: cn(className), "aria-label": children },
    <motion.span
      aria-hidden
      initial="hidden"
      whileInView="visible"
      viewport={{ ...SEUIL_VUE, once }}
      variants={{ visible: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      className="inline"
    >
      {mots.map((mot, i) => (
        <span key={`${mot}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            variants={motPar}
            transition={{ duration: 0.72, ease: [...EASE_OUT] as [number, number, number, number] }}
            className="inline-block"
          >
            {mot}
            {i < mots.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>,
  );
}

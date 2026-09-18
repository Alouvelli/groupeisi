"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const RESSORT_LENT = { stiffness: 180, damping: 22, mass: 0.5 };

/**
 * Légère inclinaison en trois dimensions au survol.
 *
 * L'amplitude reste sous les 6 degrés : l'objectif est de donner de la
 * matière à la carte, pas de la faire basculer. Sans effet au toucher.
 */
export function Tilt({ children, className, amplitude = 5 }: { children: React.ReactNode; className?: string; amplitude?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [amplitude, -amplitude]), RESSORT_LENT);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-amplitude, amplitude]), RESSORT_LENT);

  const suivre = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const relacher = () => {
    px.set(0);
    py.set(0);
  };

  /**
   * La perspective est portée par un conteneur ordinaire plutôt que par le
   * style du composant animé : `transformPerspective` forcerait framer-motion
   * à écrire une transformation dès le rendu serveur, alors que le premier
   * rendu du navigateur n'en produit aucune, ce qui casse l'hydratation.
   */
  return (
    <div ref={ref} onMouseMove={suivre} onMouseLeave={relacher} className={cn("[perspective:900px]", className)}>
      <motion.div style={{ rotateX, rotateY }} className="h-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

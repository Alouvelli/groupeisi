"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { RESSORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Attraction magnétique vers le curseur.
 *
 * L'élément suit le pointeur dans la limite de `force` pixels et revient à sa
 * place dès que le curseur sort. Désactivé au toucher et quand l'utilisateur
 * a demandé moins d'animations : sur ces appareils l'effet n'a pas de sens.
 */
export function Magnetic({ children, className, force = 14 }: { children: React.ReactNode; className?: string; force?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const sobre = useReducedMotion();
  const x = useSpring(useMotionValue(0), RESSORT);
  const y = useSpring(useMotionValue(0), RESSORT);

  const suivre = (e: React.MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (sobre || !el || !window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    x.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * force);
    y.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * force);
  };

  const relacher = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onMouseMove={suivre}
      onMouseLeave={relacher}
      style={{ x, y }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.span>
  );
}

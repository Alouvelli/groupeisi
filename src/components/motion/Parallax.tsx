"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { RESSORT } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Parallaxe verticale douce.
 *
 * Le contenu se déplace de `amplitude` pixels sur toute la traversée de
 * l'écran, dans le sens du défilement ou à contresens. Le ressort évite
 * l'effet saccadé propre aux parallaxes liées directement au scroll.
 */
export function Parallax({
  children,
  className,
  amplitude = 60,
  sens = "inverse",
}: {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  sens?: "inverse" | "direct";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const brut = useTransform(scrollYProgress, [0, 1], sens === "inverse" ? [amplitude, -amplitude] : [-amplitude, amplitude]);
  const y = useSpring(brut, RESSORT);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

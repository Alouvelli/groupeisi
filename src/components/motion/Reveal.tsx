"use client";

import { Children, isValidElement } from "react";
import { motion } from "framer-motion";
import { apparition, CASCADE, DUREE, SEUIL_VUE, serie, transition, type Direction } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Balise = "div" | "li" | "span" | "section" | "article" | "p";

/**
 * Apparition au défilement.
 *
 * L'élément monte et se dévoile quand il approche du champ de vision. Si
 * l'utilisateur a demandé moins d'animations, il s'affiche immédiatement.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  duration = DUREE.moyenne,
  direction = "haut",
  distance = 28,
  flou = false,
  once = true,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  flou?: boolean;
  once?: boolean;
  as?: Balise;
}) {
  const Tag = motion[as];
  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ ...SEUIL_VUE, once }}
      variants={apparition(direction, distance, flou)}
      transition={transition(duration, delay)}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}

/**
 * Conteneur d'une série d'éléments qui apparaissent l'un après l'autre.
 * À utiliser avec StaggerItem pour chaque enfant.
 */
export function Stagger({
  children,
  className,
  gap = CASCADE.normal,
  delai = 0,
  once = true,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  delai?: number;
  once?: boolean;
  as?: Balise;
}) {
  const Tag = motion[as];
  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ ...SEUIL_VUE, once }}
      variants={serie(gap, delai)}
      className={className}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "haut",
  distance = 24,
  duration = DUREE.moyenne,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  duration?: number;
  as?: Balise;
}) {
  const Tag = motion[as];
  return (
    <Tag
      variants={apparition(direction, distance)}
      transition={transition(duration)}
      className={className}
    >
      {children}
    </Tag>
  );
}

/**
 * Série dont chaque enfant direct est enveloppé automatiquement.
 *
 * Évite d'avoir à toucher aux cartes existantes : il suffit de remplacer le
 * conteneur de la grille. L'enveloppe devient l'élément direct de la grille
 * ou du rail, et hérite donc de sa largeur et de son aimantation.
 */
export function StaggerChildren({
  children,
  className,
  gap = CASCADE.normal,
  delai = 0,
  direction = "haut",
  distance = 24,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  delai?: number;
  direction?: Direction;
  distance?: number;
  once?: boolean;
}) {
  const variantesItem = apparition(direction, distance);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ ...SEUIL_VUE, once }}
      variants={serie(gap, delai)}
      className={className}
    >
      {Children.map(children, (enfant) =>
        isValidElement(enfant) ? (
          <motion.div variants={variantesItem} transition={transition(DUREE.moyenne)} className="h-full">
            {enfant}
          </motion.div>
        ) : (
          enfant
        ),
      )}
    </motion.div>
  );
}

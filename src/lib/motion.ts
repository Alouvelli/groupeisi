import type { Transition, Variants } from "framer-motion";

/**
 * Jetons de mouvement du site.
 *
 * Une seule source pour les courbes, les durées et les variantes, afin que
 * toutes les animations partagent le même caractère : entrée franche puis
 * décélération longue, jamais de rebond.
 */

/** Décélération marquée : l'élément arrive vite puis se pose. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Courbe symétrique pour les états (survol, ouverture, fermeture). */
export const EASE_SOFT = [0.4, 0, 0.2, 1] as const;
/** Entrée très amortie, réservée aux grands blocs. */
export const EASE_LONG = [0.16, 1, 0.3, 1] as const;

export const DUREE = {
  eclair: 0.18,
  courte: 0.32,
  moyenne: 0.55,
  longue: 0.8,
  scene: 1.1,
} as const;

/** Décalage entre deux éléments d'une même série. */
export const CASCADE = {
  serre: 0.045,
  normal: 0.08,
  ample: 0.12,
} as const;

/** Ressort utilisé par les effets suivant le curseur ou le défilement. */
export const RESSORT = { stiffness: 140, damping: 20, mass: 0.4 } as const;

export const transition = (duration: number = DUREE.moyenne, delay = 0, ease: readonly [number, number, number, number] = EASE_OUT): Transition => ({
  duration,
  delay,
  ease: [...ease] as [number, number, number, number],
});

export type Direction = "haut" | "bas" | "gauche" | "droite" | "aucune";

const decalage = (direction: Direction, distance: number) => {
  switch (direction) {
    case "haut":
      return { y: distance };
    case "bas":
      return { y: -distance };
    case "gauche":
      return { x: distance };
    case "droite":
      return { x: -distance };
    default:
      return {};
  }
};

/** Variantes d'apparition paramétrables, partagées par Reveal et Stagger. */
export const apparition = (direction: Direction = "haut", distance = 28, flou = false): Variants => ({
  hidden: { opacity: 0, ...decalage(direction, distance), ...(flou ? { filter: "blur(8px)" } : {}) },
  visible: { opacity: 1, x: 0, y: 0, ...(flou ? { filter: "blur(0px)" } : {}) },
});

/** Variantes immobiles, servies quand l'utilisateur refuse les animations. */
export const immobile: Variants = { hidden: { opacity: 1 }, visible: { opacity: 1 } };

/** Conteneur d'une série : orchestre ses enfants sans s'animer lui-même. */
export const serie = (gap: number = CASCADE.normal, delaiInitial = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap, delayChildren: delaiInitial } },
});

/** Marge de déclenchement : l'élément s'anime un peu avant d'être visible. */
export const SEUIL_VUE = { once: true, margin: "-12% 0px -8% 0px" } as const;

/** Agrandissement discret à l'apparition, pour les visuels. */
export const zoomDoux: Variants = {
  hidden: { opacity: 0, scale: 1.06 },
  visible: { opacity: 1, scale: 1 },
};

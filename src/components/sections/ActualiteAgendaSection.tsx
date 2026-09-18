"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EventCard, type EventCardProps } from "@/components/cards/EventCard";
import { NewsCard, type NewsCardProps } from "@/components/cards/NewsCard";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AnimatedHeading, StaggerChildren } from "@/components/motion";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Onglet = "actualites" | "agenda";

/**
 * Bloc unique « Actualités & agenda ».
 *
 * Réunit deux sections qui affichaient la même chose sous une forme voisine :
 * une rangée de cartes datées. Le basculement d'onglet remplace le contenu
 * sans déplacer le reste de la page, ce qui raccourcit nettement l'accueil.
 */
export function ActualiteAgendaSection({
  posts,
  events,
  label = "Actualités & agenda",
  title = "La vie du Groupe ISI",
}: {
  posts: NewsCardProps[];
  events: EventCardProps[];
  label?: string;
  title?: string;
}) {
  const [onglet, setOnglet] = useState<Onglet>(posts.length ? "actualites" : "agenda");

  if (!posts.length && !events.length) return null;

  const onglets: { id: Onglet; libelle: string; disponible: boolean; href: string; cta: string }[] = [
    { id: "actualites", libelle: "Dernières actualités", disponible: posts.length > 0, href: "/actualites", cta: "Toutes les actualités" },
    { id: "agenda", libelle: "Prochains évènements", disponible: events.length > 0, href: "/evenements", cta: "Tout l'agenda" },
  ];
  const actif = onglets.find((o) => o.id === onglet) ?? onglets[0];

  return (
    <section className="bg-surface section-y">
      <Container>
        <div className="mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>{label}</SectionLabel>
            <AnimatedHeading className="section-title">{title}</AnimatedHeading>
          </div>
          <Button href={actif.href} arrow className="shrink-0">
            {actif.cta}
          </Button>
        </div>

        <div role="tablist" aria-label={label} className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto">
          {onglets
            .filter((o) => o.disponible)
            .map((o) => (
              <button
                key={o.id}
                role="tab"
                type="button"
                aria-selected={onglet === o.id}
                onClick={() => setOnglet(o.id)}
                className={cn("pill-tab relative shrink-0")}
              >
                {onglet === o.id && (
                  <motion.span
                    layoutId="onglet-actualites"
                    transition={{ duration: 0.35, ease: [...EASE_OUT] as [number, number, number, number] }}
                    className="absolute inset-0 -z-10 rounded-full bg-primary"
                  />
                )}
                {o.libelle}
              </button>
            ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={onglet}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [...EASE_OUT] as [number, number, number, number] }}
          >
            {onglet === "actualites" ? (
              <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-4">
                {posts.slice(0, 4).map((p) => (
                  <NewsCard key={p.slug} {...p} />
                ))}
              </StaggerChildren>
            ) : (
              <StaggerChildren className="rail sm:grid-cols-2 lg:grid-cols-3">
                {events.slice(0, 3).map((e) => (
                  <EventCard key={e.slug} {...e} />
                ))}
              </StaggerChildren>
            )}
          </motion.div>
        </AnimatePresence>
      </Container>
    </section>
  );
}

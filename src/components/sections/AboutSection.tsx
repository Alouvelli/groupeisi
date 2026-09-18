import Image from "next/image";
import { Award, BadgeCheck, Building2, Check, GraduationCap, Trophy, Users } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Counter } from "@/components/ui/Counter";
import { AnimatedHeading, ImageReveal, Parallax, StaggerChildren } from "@/components/motion";

export interface AboutSectionProps {
  label: string;
  title: string;
  intro: string;
  /** Contenu des onglets Mission / Vision / Valeurs */
  onglets: { id: string; label: string; paragraphes: string[] }[];
  atouts: string[];
  images: [string, string];
  href?: string;
  chiffres: { valeur?: number; prefixe?: string; suffixe?: string; titre: string; description: string; icone: "users" | "award" | "trophy" }[];
}

const CHIFFRE_ICONS = { users: Users, award: BadgeCheck, trophy: Trophy } as const;

/**
 * Section « À propos du Groupe ISI » : deux visuels à gauche, texte,
 * onglets Mission / Vision / Valeurs et liste d'atouts à droite,
 * puis la bande de trois chiffres clés.
 */
export function AboutSection({ label, title, intro, onglets, atouts, images, href = "/a-propos", chiffres }: AboutSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white section-y">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Visuels */}
          <div className="relative">
            <ImageReveal className="rounded-lg" sens="gauche">
              <Image src={images[0]} alt="" width={900} height={600} className="h-auto w-full object-cover" />
            </ImageReveal>
            <Parallax amplitude={26} className="mt-6 sm:ml-16 sm:mt-8">
              <ImageReveal className="rounded-lg" sens="droite" delay={0.15}>
                <Image src={images[1]} alt="" width={760} height={520} className="h-auto w-full object-cover" />
              </ImageReveal>
            </Parallax>
            <span className="pointer-events-none absolute -left-10 top-1/3 hidden h-40 w-40 rounded-full bg-secondary/10 blur-2xl lg:block" aria-hidden />
          </div>

          {/* Texte */}
          <div>
            <SectionLabel>{label}</SectionLabel>
            <AnimatedHeading className="section-title text-balance">{title}</AnimatedHeading>
            <p className="mt-5 text-base leading-7 text-body">{intro}</p>

            <Tabs
              className="mt-8"
              variant="underline"
              align="left"
              tabs={onglets.map((o) => ({
                id: o.id,
                label: o.label,
                content: (
                  <div className="space-y-4 text-[15px] leading-7 text-body">
                    {o.paragraphes.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                ),
              }))}
            />

            <StaggerChildren className="mt-8 grid gap-3 sm:grid-cols-2" gap={0.06} distance={14}>
              {atouts.map((a) => (
                <div key={a} className="flex gap-2.5 text-[15px] text-body">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  <span>{a}</span>
                </div>
              ))}
            </StaggerChildren>

            <Button href={href} className="mt-9" arrow>
              En savoir plus
            </Button>
          </div>
        </div>
      </Container>

      {/* Chiffres clés */}
      {chiffres.length > 0 && (
        <Container className="mt-16 lg:mt-20">
          <div className="grid gap-8 rounded-lg border border-line bg-surface px-6 py-10 sm:grid-cols-3 sm:px-10">
            {chiffres.map((c) => {
              const Icon = CHIFFRE_ICONS[c.icone];
              return (
                <div key={c.titre} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" aria-hidden />
                  </span>
                  <div>
                    <h4 className="font-heading text-[20px] font-semibold text-dark">
                      {typeof c.valeur === "number" && (
                        <>
                          {c.prefixe}
                          <Counter value={c.valeur} />
                          {c.suffixe}{" "}
                        </>
                      )}
                      {c.titre}
                    </h4>
                    <p className="mt-1.5 text-[15px] leading-6 text-body">{c.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      )}
    </section>
  );
}

/** Bande de chiffres clés réutilisable (pages campus et présentation). */
export function StatsRow({
  stats,
  variant = "surface",
}: {
  stats: { valeur: string; titre: string; description?: string }[];
  variant?: "surface" | "primary";
}) {
  return (
    <div
      className={
        variant === "primary"
          ? "grid gap-8 rounded-lg bg-primary px-6 py-10 text-white sm:grid-cols-2 sm:px-10 lg:grid-cols-4"
          : "grid gap-8 rounded-lg border border-line bg-surface px-6 py-10 sm:grid-cols-2 sm:px-10 lg:grid-cols-4"
      }
    >
      {stats.map((s) => (
        <div key={s.titre}>
          <p className={variant === "primary" ? "font-heading text-[40px] font-semibold leading-none text-secondary" : "font-heading text-[40px] font-semibold leading-none text-primary"}>
            {s.valeur}
          </p>
          <h4 className={variant === "primary" ? "mt-3 font-heading text-[18px] font-semibold text-white" : "mt-3 font-heading text-[18px] font-semibold text-dark"}>{s.titre}</h4>
          {s.description && <p className={variant === "primary" ? "mt-1 text-sm text-white/75" : "mt-1 text-sm text-body"}>{s.description}</p>}
        </div>
      ))}
    </div>
  );
}

/** Trois encarts icône + texte (« Accessibilité / Programmes / Vie étudiante »). */
export function IconBoxes({
  items,
  columns = 3,
}: {
  items: { titre: string; description: string; icone?: "award" | "graduation" | "building" | "users" }[];
  columns?: 2 | 3 | 4;
}) {
  const ICONS = { award: Award, graduation: GraduationCap, building: Building2, users: Users } as const;
  return (
    <div className={`grid gap-[30px] ${columns === 2 ? "sm:grid-cols-2" : columns === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3"}`}>
      {items.map((it) => {
        const Icon = ICONS[it.icone ?? "award"];
        return (
          <div key={it.titre} className="rounded-lg border border-line bg-white p-7 transition hover:shadow-card">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-6 w-6 text-primary" aria-hidden />
            </span>
            <h4 className="mt-5 font-heading text-[20px] font-semibold text-dark">{it.titre}</h4>
            <p className="mt-2.5 text-[15px] leading-7 text-body">{it.description}</p>
          </div>
        );
      })}
    </div>
  );
}

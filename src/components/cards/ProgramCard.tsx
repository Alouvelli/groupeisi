import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, MapPin, Network } from "lucide-react";
import { NIVEAU_LABELS } from "@/lib/constants";
import { cn, truncate } from "@/lib/utils";
import type { Niveau } from "@prisma/client";

export interface ProgramCardProps {
  titre: string;
  slug: string;
  niveau: Niveau;
  duree?: string | null;
  accroche?: string | null;
  description?: string;
  image?: string | null;
  objectifs?: string[];
  departement?: { nom: string; slug: string } | null;
  campus?: { nom: string; slug: string }[];
  /** « row » : image à gauche (accueil) · « tile » : image au-dessus (catalogue) */
  variant?: "row" | "tile";
  cta?: string;
}

/**
 * Carte de formation du thème (widget « rs-programs ») : cadre blanc,
 * visuel arrondi, titre, liste d'objectifs à puces et bouton « S'inscrire ».
 */
export function ProgramCard({
  titre,
  slug,
  niveau,
  duree,
  accroche,
  description,
  image,
  objectifs = [],
  departement,
  campus = [],
  variant = "row",
  cta = "S'inscrire",
}: ProgramCardProps) {
  const puces = objectifs.length ? objectifs.slice(0, 3) : accroche ? [accroche] : description ? [truncate(description, 220)] : [];

  return (
    <article
      className={cn(
        "group flex h-full gap-[30px] rounded-xl border border-line bg-white p-3 transition hover:shadow-card",
        variant === "row" ? "flex-col sm:flex-row sm:items-center" : "flex-col",
      )}
    >
      <Link
        href={`/formations/${slug}`}
        className={cn("block shrink-0 overflow-hidden rounded-xl", variant === "row" ? "sm:w-[260px]" : "w-full")}
        tabIndex={-1}
        aria-hidden
      >
        <Image
          src={image || "/media/mg-9941-cr3-at-2025-copie.jpg"}
          alt=""
          width={600}
          height={900}
          className={cn("w-full object-cover transition duration-500 group-hover:scale-[1.03]", variant === "row" ? "h-[260px] sm:h-[335px]" : "h-[300px]")}
        />
      </Link>

      <div className={cn("flex flex-1 flex-col", variant === "row" ? "pr-0 sm:pr-[30px]" : "px-3 pb-4")}>
        <span className="mb-2 inline-flex items-center gap-2 text-[13px] font-medium uppercase tracking-wide text-primary">
          {NIVEAU_LABELS[niveau]}
          {duree ? <span className="text-body normal-case tracking-normal">· {duree}</span> : null}
        </span>
        <h4 className="mb-3 font-heading text-[20px] font-semibold leading-[1.3] text-dark transition group-hover:text-primary lg:text-[24px] lg:leading-[34px]">
          <Link href={`/formations/${slug}`}>{titre}</Link>
        </h4>

        {puces.length > 0 && (
          <ul className="mb-4 space-y-2">
            {puces.map((p, i) => (
              <li key={i} className="flex gap-2.5 text-[15px] font-medium leading-6 text-dark">
                <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{truncate(p, 160)}</span>
              </li>
            ))}
          </ul>
        )}

        {(departement || campus.length > 0) && (
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-body">
            {campus[0] && (
              <Link href={`/campus/${campus[0].slug}`} className="inline-flex items-center gap-1.5 transition hover:text-primary">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden /> {campus[0].nom}
              </Link>
            )}
            {departement && (
              <Link href={`/departements/${departement.slug}`} className="inline-flex items-center gap-1.5 transition hover:text-primary">
                <Network className="h-3.5 w-3.5 text-primary" aria-hidden /> {departement.nom}
              </Link>
            )}
          </div>
        )}

        <Link
          href={`/formations/${slug}`}
          className="mt-auto inline-flex w-fit items-center gap-2 rounded-[30px] bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-secondary hover:text-secondary-fg"
        >
          {cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

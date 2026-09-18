import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CampusCardProps {
  nom: string;
  slug: string;
  ville?: string;
  pays?: string;
  adresse?: string;
  telephone?: string | null;
  image?: string | null;
  isSiege?: boolean;
  programmesCount?: number;
  /** « tile » : vignette photo + titre superposé (accueil, page campus) */
  variant?: "tile" | "detail";
  cta?: string;
}

/**
 * Carte campus du thème (widget « rs-academic-card style-two ») :
 * photo en fond, dégradé sombre, nom en bas et lien révélé au survol.
 */
export function CampusCard({
  nom,
  slug,
  ville,
  pays,
  adresse,
  telephone,
  image,
  isSiege,
  programmesCount,
  variant = "tile",
  cta = "Découvrir le campus",
}: CampusCardProps) {
  if (variant === "detail") {
    return (
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-500 hover:-translate-y-1.5 hover:shadow-card">
        <Link href={`/campus/${slug}`} className="relative block aspect-[4/3] overflow-hidden">
          <Image
            src={image || "/media/img-9163.jpg"}
            alt={nom}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
          {isSiege && (
            <span className="absolute left-4 top-4 rounded bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-secondary-fg">Siège</span>
          )}
        </Link>
        <div className="flex flex-1 flex-col p-6">
          <h4 className="font-heading text-[20px] font-semibold text-dark transition group-hover:text-primary">
            <Link href={`/campus/${slug}`}>{nom}</Link>
          </h4>
          {(ville || pays) && <p className="mt-1 text-sm text-body">{[ville, pays].filter(Boolean).join(" · ")}</p>}
          {adresse && (
            <p className="mt-3 flex gap-2 text-[15px] text-body">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /> {adresse}
            </p>
          )}
          {telephone && (
            <p className="mt-2 flex items-center gap-2 text-[15px] text-body">
              <Phone className="h-4 w-4 shrink-0 text-primary" aria-hidden /> {telephone}
            </p>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-line pt-4 text-[15px]">
            <span className="text-body">{programmesCount ?? 0} formations</span>
            <Link href={`/campus/${slug}`} className="inline-flex items-center gap-1.5 font-medium text-primary transition hover:text-secondary-dark">
              Visiter <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group relative isolate flex min-h-[300px] flex-col justify-end overflow-hidden rounded-lg bg-primary p-[30px]")}>
      <Image
        src={image || "/media/img-9163.jpg"}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="-z-10 object-cover transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 -z-10 bg-gradient-to-b from-night/0 via-night/20 to-night/90" aria-hidden />
      <div className="transition-all duration-300 lg:-mb-[52px] lg:group-hover:mb-0">
        <h4 className="font-heading text-[22px] font-semibold text-white lg:text-[24px]">
          <Link href={`/campus/${slug}`}>{nom}</Link>
        </h4>
        <Link
          href={`/campus/${slug}`}
          className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium text-secondary transition lg:opacity-0 lg:group-hover:opacity-100"
        >
          {cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

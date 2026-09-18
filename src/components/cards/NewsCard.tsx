import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User } from "lucide-react";
import { Tilt } from "@/components/motion";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface NewsCardProps {
  titre: string;
  slug: string;
  extrait?: string;
  image?: string | null;
  publishedAt?: Date | string | null;
  tempsLecture?: number | null;
  auteur?: string | null;
  categorie?: { nom: string; slug: string; couleur?: string | null } | null;
  /** « grid » : vignette + méta (accueil) · « list » : grande carte (blog) · « row » : horizontale */
  variant?: "grid" | "list" | "row";
}

/** Pastille de catégorie, teintée avec la couleur définie en base. */
function Categorie({ nom, slug, couleur }: { nom: string; slug: string; couleur?: string | null }) {
  return (
    <Link
      href={`/actualites?categorie=${slug}`}
      style={couleur ? { backgroundColor: couleur } : undefined}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-white shadow-sm",
        "transition-transform duration-300 hover:scale-105",
        !couleur && "bg-primary",
      )}
    >
      {nom}
    </Link>
  );
}

/**
 * Carte d'actualité.
 *
 * Le visuel occupe le haut de la carte sous un voile dégradé qui porte la
 * pastille de catégorie et la date. Au survol, la carte se soulève, sa bordure
 * s'allume, un éclat la traverse, le visuel s'agrandit et la flèche avance.
 */
export function NewsCard({ titre, slug, extrait, image, publishedAt, tempsLecture, auteur, categorie, variant = "grid" }: NewsCardProps) {
  const href = `/actualites/${slug}`;
  const grand = variant === "list";

  if (variant === "row") {
    return (
      <article className="carte-vivante group flex flex-col gap-6 rounded-2xl border border-line bg-white p-4 sm:flex-row">
        <Link href={href} className="block overflow-hidden rounded-xl sm:w-2/5 sm:shrink-0">
          <span className="relative block aspect-[16/10]">
            <Image src={image || "/media/img-2024-1.jpg"} alt={titre} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover transition-transform duration-[900ms] group-hover:scale-105" />
          </span>
        </Link>
        <div className="flex flex-1 flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {categorie && <Categorie {...categorie} />}
            {publishedAt && <span className="text-[13px] text-muted">{formatDate(publishedAt)}</span>}
          </div>
          <h4 className="font-heading text-[20px] font-semibold leading-[1.3] text-dark transition-colors duration-300 group-hover:text-primary">
            <Link href={href}>{titre}</Link>
          </h4>
          {extrait && <p className="mt-3 line-clamp-2 text-[15px] leading-7 text-body">{extrait}</p>}
        </div>
      </article>
    );
  }

  return (
    <Tilt amplitude={3} className="h-full">
      <article className="carte-vivante group flex h-full flex-col rounded-2xl border border-line bg-white">
        <div className="relative overflow-hidden rounded-t-2xl">
          <Link href={href} className="block" aria-label={titre}>
            <span className={cn("relative block", grand ? "aspect-[16/9]" : "aspect-[16/10]")}>
              <Image
                src={image || "/media/img-2024-1.jpg"}
                alt={titre}
                fill
                sizes={grand ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 33vw"}
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
              />
            </span>
            <span className="voile-visuel opacity-90 group-hover:opacity-100" aria-hidden />
          </Link>

          {/* Les pastilles sont posées hors de l'ancre : une ancre ne peut pas en contenir une autre. */}
          {categorie && (
            <span className="absolute left-4 top-4 z-10">
              <Categorie {...categorie} />
            </span>
          )}

          {publishedAt && (
            <span className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-baseline gap-1.5 text-white">
              <span className="font-heading text-[15px] font-semibold">{formatDate(publishedAt, "d MMM")}</span>
              <span className="text-[13px] opacity-75">{formatDate(publishedAt, "yyyy")}</span>
            </span>
          )}

          {tempsLecture ? (
            <span className="pointer-events-none absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" aria-hidden /> {tempsLecture} min
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h4
            className={cn(
              "relative pb-4 font-heading font-semibold leading-[1.3] text-dark transition-colors duration-300 group-hover:text-primary",
              grand ? "text-[24px] lg:text-[28px]" : "text-[19px] lg:text-[21px]",
            )}
          >
            <Link href={href}>{titre}</Link>
            <span className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden />
            <span className="absolute bottom-0 left-0 h-px w-10 bg-primary transition-all duration-500 group-hover:w-full" aria-hidden />
          </h4>

          {extrait && <p className={cn("mt-4 flex-1 text-[15px] leading-7 text-body", grand ? "line-clamp-4" : "line-clamp-3")}>{extrait}</p>}

          {/* En colonne étroite, l'auteur ferait passer le pied de carte sur deux
              lignes : il n'apparaît que sur la carte mise en avant. */}
          <div className="mt-5 flex items-center justify-between gap-4">
            {auteur && grand ? (
              <span className="inline-flex min-w-0 items-center gap-2 text-[14px] font-medium text-body">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-primary">
                  <User className="h-4 w-4" aria-hidden />
                </span>
                <span className="truncate">{auteur}</span>
              </span>
            ) : (
              <span />
            )}
            <Link href={href} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[15px] font-medium text-primary transition-colors duration-300 hover:text-secondary-dark">
              Lire la suite
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </Tilt>
  );
}

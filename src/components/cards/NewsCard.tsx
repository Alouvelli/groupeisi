import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, Folder, User } from "lucide-react";
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

/**
 * Carte d'actualité du thème (widget « rs-blog-posts ») : visuel,
 * catégorie et date au-dessus du titre souligné, auteur en pied.
 */
export function NewsCard({ titre, slug, extrait, image, publishedAt, tempsLecture, auteur, categorie, variant = "grid" }: NewsCardProps) {
  const meta = (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium text-body">
      {categorie && (
        <Link href={`/actualites?categorie=${categorie.slug}`} className="inline-flex items-center gap-1.5 transition hover:text-primary">
          <Folder className="h-4 w-4 text-primary" aria-hidden /> {categorie.nom}
        </Link>
      )}
      {publishedAt && (
        <>
          {categorie && <span className="h-0.5 w-2.5 bg-line" aria-hidden />}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden /> {formatDate(publishedAt)}
          </span>
        </>
      )}
      {tempsLecture ? (
        <>
          <span className="h-0.5 w-2.5 bg-line" aria-hidden />
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" aria-hidden /> {tempsLecture} min
          </span>
        </>
      ) : null}
    </div>
  );

  return (
    <article className={cn("group flex h-full transition duration-500 hover:-translate-y-1.5", variant === "row" ? "flex-col gap-6 sm:flex-row" : "flex-col")}>
      <Link
        href={`/actualites/${slug}`}
        className={cn("relative block overflow-hidden rounded-lg", variant === "row" ? "sm:w-2/5 sm:shrink-0" : "mb-[30px]")}
      >
        <span className={cn("block", variant === "list" ? "aspect-[16/9]" : "aspect-[16/10]")}>
          <Image
            src={image || "/media/img-2024-1.jpg"}
            alt={titre}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </span>
      </Link>
      <div className="flex flex-1 flex-col">
        {meta}
        <h4
          className={cn(
            "relative pb-[22px] font-heading font-semibold leading-[1.3] text-dark transition group-hover:text-primary",
            variant === "list" ? "text-[24px] lg:text-[30px]" : "text-[20px] lg:text-[24px]",
          )}
        >
          <Link href={`/actualites/${slug}`}>{titre}</Link>
          <span className="absolute inset-x-0 bottom-0 h-px bg-black/15" aria-hidden />
          <span className="absolute bottom-0 left-0 h-px w-[70px] bg-primary transition-all duration-500 group-hover:w-full" aria-hidden />
        </h4>
        {extrait && <p className="mt-5 line-clamp-3 flex-1 text-[15px] leading-7 text-body">{extrait}</p>}
        <div className="mt-5 flex items-center justify-between gap-4">
          {auteur && (
            <span className="inline-flex items-center gap-2 text-[15px] font-medium text-body">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface text-primary">
                <User className="h-4 w-4" aria-hidden />
              </span>
              {auteur}
            </span>
          )}
          <Link href={`/actualites/${slug}`} className="inline-flex items-center gap-2 text-[15px] font-medium text-primary transition hover:text-secondary-dark">
            Lire la suite <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

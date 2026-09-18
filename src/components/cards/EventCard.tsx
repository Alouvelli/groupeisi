import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatDate } from "@/lib/utils";

export interface EventCardProps {
  titre: string;
  slug: string;
  description?: string;
  image?: string | null;
  dateDebut: Date | string;
  heure?: string | null;
  lieu?: string | null;
  type?: string | null;
  variant?: "card" | "row";
}

export function DateBadge({ date, className = "" }: { date: Date | string; className?: string }) {
  const d = typeof date === "string" ? new Date(date) : date;
  return (
    <div className={`flex flex-col items-center justify-center rounded-md bg-primary px-3 py-2 text-white ${className}`}>
      <span className="font-heading text-2xl font-semibold leading-none">{format(d, "dd")}</span>
      <span className="mt-1 text-[11px] font-medium uppercase tracking-wider">{format(d, "MMM", { locale: fr }).replace(".", "")}</span>
      <span className="text-[10px] opacity-80">{format(d, "yyyy")}</span>
    </div>
  );
}

/**
 * Carte événement du thème (widget « rs-events ») : visuel, lieu superposé,
 * date et heure au-dessus du titre, puis lien « Voir Détails ».
 */
export function EventCard({ titre, slug, description, image, dateDebut, heure, lieu, type, variant = "card" }: EventCardProps) {
  if (variant === "row") {
    return (
      <article className="group flex items-stretch gap-5 rounded-lg border border-line bg-white p-5 transition hover:shadow-card">
        <DateBadge date={dateDebut} className="w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          {type && <span className="text-[12px] font-medium uppercase tracking-wider text-primary">{type}</span>}
          <h4 className="mt-0.5 truncate font-heading text-[18px] font-semibold text-dark transition group-hover:text-primary">
            <Link href={`/evenements/${slug}`}>{titre}</Link>
          </h4>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-body">
            {heure && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" aria-hidden /> {heure}
              </span>
            )}
            {lieu && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden /> {lieu}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/evenements/${slug}`}
          aria-label={titre}
          className="hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-surface text-primary transition group-hover:bg-primary group-hover:text-white sm:inline-flex"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/evenements/${slug}`} className="relative mb-[30px] block aspect-[16/11] overflow-hidden rounded-lg">
        <Image
          src={image || "/media/img-1714-1.jpg"}
          alt={titre}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {lieu && (
          <span className="absolute left-[30px] top-[30px] inline-flex items-center gap-1.5 rounded bg-dark/70 px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5" aria-hidden /> {lieu}
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-medium text-body">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden /> {formatDate(dateDebut)}
          </span>
          {heure && (
            <>
              <span className="h-0.5 w-2.5 bg-line" aria-hidden />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" aria-hidden /> {heure}
              </span>
            </>
          )}
        </div>
        <h4 className="relative pb-[22px] font-heading text-[20px] font-semibold leading-[1.3] text-dark transition group-hover:text-primary lg:text-[24px]">
          <Link href={`/evenements/${slug}`}>{titre}</Link>
          <span className="absolute inset-x-0 bottom-0 h-px bg-black/15" aria-hidden />
          <span className="absolute bottom-0 left-0 h-px w-[70px] bg-primary transition-all duration-500 group-hover:w-full" aria-hidden />
        </h4>
        {description && <p className="mt-5 line-clamp-2 flex-1 text-[15px] leading-7 text-body">{description}</p>}
        <Link href={`/evenements/${slug}`} className="mt-4 inline-flex items-center gap-2 text-[15px] font-medium text-body transition hover:text-primary">
          Voir Détails <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

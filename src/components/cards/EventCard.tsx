import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Tilt } from "@/components/motion";
import { compteARebours, formatDate } from "@/lib/utils";

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
 * Carte évènement.
 *
 * Le bloc date se détache sur le visuel, le lieu et le compte à rebours
 * flottent en pastilles. Au survol, la carte se soulève, un éclat la traverse
 * et le bloc date passe au jaune d'accent.
 */
export function EventCard({ titre, slug, description, image, dateDebut, heure, lieu, type, variant = "card" }: EventCardProps) {
  const href = `/evenements/${slug}`;
  const bientot = compteARebours(dateDebut);

  if (variant === "row") {
    return (
      <article className="carte-vivante group flex items-stretch gap-5 rounded-xl border border-line bg-white p-5">
        <DateBadge date={dateDebut} className="w-20 shrink-0 transition-colors duration-500 group-hover:bg-secondary group-hover:text-secondary-fg" />
        <div className="min-w-0 flex-1">
          {type && <span className="text-[12px] font-medium uppercase tracking-wider text-primary">{type}</span>}
          <h4 className="mt-0.5 truncate font-heading text-[18px] font-semibold text-dark transition-colors duration-300 group-hover:text-primary">
            <Link href={href}>{titre}</Link>
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
            {bientot && <span className="font-medium text-secondary-dark">{bientot}</span>}
          </div>
        </div>
        <Link
          href={href}
          aria-label={titre}
          className="hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-surface text-primary transition-all duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-white sm:inline-flex"
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </article>
    );
  }

  return (
    <Tilt amplitude={3} className="h-full">
      <article className="carte-vivante group flex h-full flex-col rounded-2xl border border-line bg-white">
        <div className="relative overflow-hidden rounded-t-2xl">
          <Link href={href} className="block" aria-label={titre}>
            <span className="relative block aspect-[16/11]">
              <Image
                src={image || "/media/img-1714-1.jpg"}
                alt={titre}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
              />
            </span>
            <span className="voile-visuel opacity-90 group-hover:opacity-100" aria-hidden />
          </Link>

          <DateBadge
            date={dateDebut}
            className="absolute left-4 top-4 z-10 w-[62px] shadow-card transition-colors duration-500 group-hover:bg-secondary group-hover:text-secondary-fg"
          />

          {bientot && (
            <span className="absolute right-4 top-4 z-10 inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[12px] font-semibold uppercase tracking-wide text-secondary-fg shadow-sm">
              {bientot}
            </span>
          )}

          <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex flex-wrap items-center gap-2 text-white">
            {lieu && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[12px] font-medium backdrop-blur-sm">
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {lieu}
              </span>
            )}
            {heure && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/18 px-2.5 py-1 text-[12px] font-medium backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5" aria-hidden /> {heure}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          {type && <span className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-primary">{type}</span>}
          <h4 className="relative pb-4 font-heading text-[19px] font-semibold leading-[1.3] text-dark transition-colors duration-300 group-hover:text-primary lg:text-[21px]">
            <Link href={href}>{titre}</Link>
            <span className="absolute inset-x-0 bottom-0 h-px bg-line" aria-hidden />
            <span className="absolute bottom-0 left-0 h-px w-10 bg-primary transition-all duration-500 group-hover:w-full" aria-hidden />
          </h4>
          {description && <p className="mt-4 line-clamp-2 flex-1 text-[15px] leading-7 text-body">{description}</p>}
          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="text-[14px] text-muted">{formatDate(dateDebut)}</span>
            <Link href={href} className="inline-flex items-center gap-2 text-[15px] font-medium text-primary transition-colors duration-300 hover:text-secondary-dark">
              Voir les détails
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </Tilt>
  );
}

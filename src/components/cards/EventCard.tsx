import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "@/components/ui/Card";

export interface EventCardProps {
  titre: string;
  slug: string;
  description: string;
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
    <div className={`flex flex-col items-center justify-center rounded-2xl bg-secondary px-3 py-2 text-white shadow-lg shadow-secondary/30 ${className}`}>
      <span className="text-2xl font-extrabold leading-none">{format(d, "dd")}</span>
      <span className="mt-1 text-[11px] font-bold uppercase tracking-wider">{format(d, "MMM", { locale: fr }).replace(".", "")}</span>
      <span className="text-[10px] opacity-80">{format(d, "yyyy")}</span>
    </div>
  );
}

export function EventCard({ titre, slug, description, image, dateDebut, heure, lieu, type, variant = "card" }: EventCardProps) {
  if (variant === "row") {
    return (
      <Card className="flex items-stretch gap-5 p-5" hover>
        <DateBadge date={dateDebut} className="w-20 shrink-0" />
        <div className="min-w-0 flex-1">
          {type && <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">{type}</span>}
          <h3 className="mt-0.5 truncate text-lg font-extrabold text-primary transition group-hover:text-secondary">
            <Link href={`/evenements/${slug}`}>{titre}</Link>
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            {heure && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary" /> {heure}</span>}
            {lieu && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-secondary" /> {lieu}</span>}
          </div>
        </div>
        <Link href={`/evenements/${slug}`} aria-label={titre} className="hidden h-10 w-10 shrink-0 items-center justify-center self-center rounded-full bg-primary-50 text-primary transition group-hover:bg-secondary group-hover:text-white sm:inline-flex">
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>
    );
  }
  return (
    <Card className="flex h-full flex-col">
      <Link href={`/evenements/${slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image src={image || "/images/placeholder.svg"} alt={titre} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <DateBadge date={dateDebut} className="absolute left-4 top-4 w-16" />
      </Link>
      <div className="flex flex-1 flex-col p-6">
        {type && <span className="text-[11px] font-bold uppercase tracking-wider text-secondary">{type}</span>}
        <h3 className="mt-1 text-lg font-extrabold leading-snug text-primary transition group-hover:text-secondary">
          <Link href={`/evenements/${slug}`}>{titre}</Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{description}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
          {heure && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary" /> {heure}</span>}
          {lieu && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-secondary" /> {lieu}</span>}
        </div>
      </div>
    </Card>
  );
}

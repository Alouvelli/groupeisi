import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

export interface NewsCardProps {
  titre: string;
  slug: string;
  extrait: string;
  image?: string | null;
  publishedAt?: Date | string | null;
  tempsLecture?: number | null;
  categorie?: { nom: string; slug: string; couleur?: string | null } | null;
  horizontal?: boolean;
}

export function NewsCard({ titre, slug, extrait, image, publishedAt, tempsLecture, categorie, horizontal }: NewsCardProps) {
  return (
    <Card className={horizontal ? "sm:flex" : "flex h-full flex-col"}>
      <Link href={`/actualites/${slug}`} className={horizontal ? "block sm:w-2/5" : "block"}>
        <div className={horizontal ? "relative h-52 sm:h-full" : "relative aspect-[16/10] overflow-hidden"}>
          <Image src={image || "/images/placeholder.svg"} alt={titre} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          {categorie && (
            <span className="absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white" style={{ background: categorie.couleur ?? "#f26522" }}>
              {categorie.nom}
            </span>
          )}
        </div>
      </Link>
      <div className={horizontal ? "flex flex-1 flex-col p-6" : "flex flex-1 flex-col p-6"}>
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-secondary" /> {formatDate(publishedAt)}</span>
          {tempsLecture && <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-secondary" /> {tempsLecture} min</span>}
        </div>
        <h3 className="text-lg font-extrabold leading-snug text-primary transition group-hover:text-secondary">
          <Link href={`/actualites/${slug}`}>{titre}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{extrait}</p>
        <Link href={`/actualites/${slug}`} className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-secondary">
          Lire la suite <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </Card>
  );
}

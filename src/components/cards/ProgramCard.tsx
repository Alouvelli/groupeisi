import Link from "next/link";
import Image from "next/image";
import { Clock, MapPin, ArrowRight, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { NIVEAU_LABELS } from "@/lib/constants";
import type { Niveau } from "@prisma/client";

export interface ProgramCardProps {
  titre: string;
  slug: string;
  niveau: Niveau;
  duree: string;
  accroche?: string | null;
  description?: string;
  image?: string | null;
  accreditation?: string | null;
  departement?: { nom: string; couleur?: string | null } | null;
  campus?: { nom: string }[];
  compact?: boolean;
}

const niveauVariant: Record<Niveau, "primary" | "secondary" | "soft" | "softOrange" | "success" | "neutral"> = {
  BTS: "soft",
  LICENCE: "primary",
  MASTER: "secondary",
  DOCTORAT: "secondary",
  CERTIFICAT: "success",
  FORMATION_CONTINUE: "neutral",
};

export function ProgramCard({ titre, slug, niveau, duree, accroche, description, image, accreditation, departement, campus, compact }: ProgramCardProps) {
  const campusLabel = campus && campus.length > 0 ? (campus.length >= 5 ? "Tous les campus" : campus.map((c) => c.nom.replace(/^ISI\s+/, "").replace(/\s*\(.*\)$/, "")).slice(0, 2).join(", ") + (campus.length > 2 ? ` +${campus.length - 2}` : "")) : null;
  return (
    <Card className="flex h-full flex-col">
      <Link href={`/programmes/${slug}`} className="flex h-full flex-col">
        {!compact && (
          <div className="relative aspect-[16/10] overflow-hidden bg-primary-50">
            <Image src={image || "/images/placeholder.svg"} alt={titre} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" aria-hidden />
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge variant={niveauVariant[niveau]}>{NIVEAU_LABELS[niveau]}</Badge>
            </div>
            {accreditation && (
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-primary">
                <Award className="h-3.5 w-3.5 text-secondary" /> {accreditation}
              </span>
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col p-6">
          {compact && <Badge variant={niveauVariant[niveau]} className="mb-3 self-start">{NIVEAU_LABELS[niveau]}</Badge>}
          {departement && <span className="mb-1.5 text-xs font-bold uppercase tracking-wider" style={{ color: departement.couleur ?? "#f26522" }}>{departement.nom}</span>}
          <h3 className="text-lg font-extrabold leading-snug text-primary transition group-hover:text-secondary">{titre}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{accroche ?? description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-secondary" /> {duree}</span>
            {campusLabel && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-secondary" /> {campusLabel}</span>}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
            <span className="text-sm font-bold text-primary">Voir la formation</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary transition group-hover:bg-secondary group-hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

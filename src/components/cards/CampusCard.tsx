import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, ArrowRight, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface CampusCardProps {
  nom: string;
  slug: string;
  ville: string;
  pays: string;
  adresse: string;
  telephone?: string | null;
  image?: string | null;
  isSiege?: boolean;
  programmesCount?: number;
}

export function CampusCard({ nom, slug, ville, pays, adresse, telephone, image, isSiege, programmesCount }: CampusCardProps) {
  return (
    <Card className="h-full">
      <Link href={`/campus/${slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={image || "/images/placeholder.svg"} alt={nom} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" aria-hidden />
          {isSiege && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              <Star className="h-3 w-3" /> Siège
            </span>
          )}
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">{ville} · {pays}</span>
            <h3 className="mt-1 text-xl font-extrabold text-white">{nom}</h3>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="flex items-start gap-2 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {adresse}</p>
          {telephone && <p className="mt-2 flex items-center gap-2 text-sm text-muted"><Phone className="h-4 w-4 shrink-0 text-secondary" /> {telephone}</p>}
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
            <span className="font-semibold text-slate-500">{programmesCount ?? 0} formations</span>
            <span className="inline-flex items-center gap-1 font-bold text-secondary">Visiter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

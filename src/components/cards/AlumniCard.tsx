import Link from "next/link";
import Image from "next/image";
import { Briefcase, GraduationCap, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function AlumniCard({ prenom, nom, slug, promotion, programme, poste, entreprise, ville, pays, photo, temoignage }: { prenom: string; nom: string; slug: string; promotion: number; programme: string; poste?: string | null; entreprise?: string | null; ville?: string | null; pays?: string | null; photo?: string | null; temoignage?: string | null }) {
  return (
    <Card className="h-full">
      <Link href={`/alumni/${slug}`} className="flex h-full flex-col p-6">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-primary-50 ring-4 ring-primary-50">
            <Image src={photo || "/images/placeholder.svg"} alt={`${prenom} ${nom}`} fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-lg font-extrabold text-primary transition group-hover:text-secondary">{prenom} {nom}</h3>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Promotion {promotion}</p>
          </div>
        </div>
        {temoignage && <p className="mt-4 line-clamp-3 flex-1 text-sm italic leading-relaxed text-slate-600">« {temoignage} »</p>}
        <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs font-semibold text-slate-500">
          <li className="flex items-center gap-2"><GraduationCap className="h-3.5 w-3.5 text-secondary" /> {programme}</li>
          {(poste || entreprise) && <li className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-secondary" /> {[poste, entreprise].filter(Boolean).join(" · ")}</li>}
          {(ville || pays) && <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-secondary" /> {[ville, pays].filter(Boolean).join(", ")}</li>}
        </ul>
      </Link>
    </Card>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DynamicIcon } from "@/components/ui/Icon";

export interface DepartmentCardProps {
  nom: string;
  slug: string;
  accroche?: string | null;
  description: string;
  icone?: string | null;
  couleur?: string | null;
  programmesCount?: number;
}

export function DepartmentCard({ nom, slug, accroche, description, icone, couleur, programmesCount }: DepartmentCardProps) {
  const color = couleur ?? "#0b2a5b";
  return (
    <Card className="h-full">
      <Link href={`/departements/${slug}`} className="flex h-full flex-col p-7">
        <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-[2.2]" style={{ background: color }} aria-hidden />
        <span className="relative mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: color, boxShadow: `0 12px 24px -8px ${color}80` }}>
          <DynamicIcon name={icone ?? undefined} className="h-8 w-8" />
        </span>
        <h3 className="relative text-xl font-extrabold text-primary transition group-hover:text-secondary">{nom}</h3>
        {accroche && <p className="relative mt-1 text-sm font-semibold text-slate-500">{accroche}</p>}
        <p className="relative mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{description}</p>
        <div className="relative mt-5 flex items-center justify-between text-sm font-bold text-primary">
          {typeof programmesCount === "number" ? <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{programmesCount} formation{programmesCount > 1 ? "s" : ""}</span> : <span />}
          <span className="inline-flex items-center gap-1 text-secondary">
            Découvrir <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Card>
  );
}

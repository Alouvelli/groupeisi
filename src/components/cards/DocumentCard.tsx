import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function DocumentCard({ titre, description, fichier, format, taille, type }: { titre: string; description?: string | null; fichier: string; format?: string | null; taille?: string | null; type: string }) {
  return (
    <Card className="flex items-center gap-5 p-5">
      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary-50 text-secondary">
        <FileText className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{type.toLowerCase()}</span>
        <h3 className="truncate text-base font-extrabold text-primary">{titre}</h3>
        {description && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{description}</p>}
        <p className="mt-1 text-xs font-semibold text-slate-500">{[format, taille].filter(Boolean).join(" · ")}</p>
      </div>
      <a href={fichier} download target="_blank" rel="noopener noreferrer" aria-label={`Télécharger ${titre}`} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-secondary">
        <Download className="h-5 w-5" />
      </a>
    </Card>
  );
}

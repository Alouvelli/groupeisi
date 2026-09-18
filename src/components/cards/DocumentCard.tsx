import { Download, FileText } from "lucide-react";

/** Carte document téléchargeable (librairie et page Téléchargements). */
export function DocumentCard({
  titre,
  description,
  fichier,
  format,
  taille,
  type,
}: {
  titre: string;
  description?: string | null;
  fichier: string;
  format?: string | null;
  taille?: string | null;
  type: string;
}) {
  return (
    <article className="flex items-center gap-5 rounded-lg border border-line bg-white p-5 transition hover:shadow-card">
      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileText className="h-6 w-6" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-[12px] font-medium uppercase tracking-wider text-muted">{type.toLowerCase()}</span>
        <h3 className="truncate font-heading text-[18px] font-semibold text-dark">{titre}</h3>
        {description && <p className="mt-0.5 line-clamp-1 text-[15px] text-body">{description}</p>}
        <p className="mt-1 text-[13px] text-muted">{[format, taille].filter(Boolean).join(" · ")}</p>
      </div>
      <a
        href={fichier}
        download
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Télécharger ${titre}`}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-secondary hover:text-secondary-fg"
      >
        <Download className="h-5 w-5" aria-hidden />
      </a>
    </article>
  );
}

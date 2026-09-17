import Image from "next/image";
import { Quote, Star } from "lucide-react";

export function TestimonialCard({ nom, role, contenu, photo, note = 5 }: { nom: string; role: string; contenu: string; photo?: string | null; note?: number }) {
  return (
    <figure className="flex h-full flex-col rounded-card border border-line bg-white p-7 shadow-soft">
      <Quote className="h-9 w-9 text-secondary/30" aria-hidden />
      <div className="mt-2 flex gap-0.5" aria-label={`${note} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < note ? "fill-accent text-accent" : "text-slate-200"}`} />
        ))}
      </div>
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-700">« {contenu} »</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-5">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-primary-50 ring-2 ring-secondary/30">
          {photo ? <Image src={photo} alt={nom} fill sizes="48px" className="object-cover" /> : null}
        </div>
        <div>
          <div className="font-bold text-primary">{nom}</div>
          <div className="text-xs text-muted">{role}</div>
        </div>
      </figcaption>
    </figure>
  );
}

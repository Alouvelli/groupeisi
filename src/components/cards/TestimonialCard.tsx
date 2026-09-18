import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Carte témoignage du thème (widget « rs-testimonial-slider style1 ») :
 * encadré, icône de citation, note en étoiles puis auteur en pied de carte.
 */
export function TestimonialCard({
  nom,
  role,
  contenu,
  photo,
  note = 5,
  entreprise,
  className,
}: {
  nom: string;
  role: string;
  contenu: string;
  photo?: string | null;
  note?: number;
  entreprise?: string | null;
  className?: string;
}) {
  return (
    <figure className={cn("flex h-full flex-col rounded border border-line bg-white p-[30px] transition hover:shadow-soft", className)}>
      <Quote className="h-7 w-7 shrink-0 text-primary" aria-hidden />
      <blockquote className="my-4 flex-1 text-[15px] leading-7 text-body">{contenu}</blockquote>
      <div className="flex items-center gap-1" aria-label={`${note} sur 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={cn("h-4 w-4", i < Math.round(note) ? "fill-[#ff8e2b] text-[#ff8e2b]" : "text-line")} aria-hidden />
        ))}
        <span className="ml-1.5 text-[13px] font-medium text-body">{note.toFixed(1)}</span>
      </div>
      <figcaption className="mt-5 flex items-center gap-5 border-t border-line pt-5">
        <div className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-full border border-line bg-white">
          {photo ? <Image src={photo} alt={nom} fill sizes="60px" className="object-cover" /> : null}
        </div>
        <div>
          <p className="font-heading text-[18px] font-semibold text-dark">{nom}</p>
          <p className="text-[15px] text-body">{[role, entreprise].filter(Boolean).join(", ")}</p>
        </div>
      </figcaption>
    </figure>
  );
}

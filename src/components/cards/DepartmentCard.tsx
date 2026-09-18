import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/ui/Icon";

export interface DepartmentCardProps {
  nom: string;
  slug: string;
  accroche?: string | null;
  description?: string;
  icone?: string | null;
  couleur?: string | null;
  image?: string | null;
  programmesCount?: number;
}

/** Carte département : visuel, icône, nom, accroche et nombre de formations. */
export function DepartmentCard({ nom, slug, accroche, description, icone, image, programmesCount }: DepartmentCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition hover:shadow-card">
      <Link href={`/departements/${slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <Image
          src={image || "/media/mg-8766-cr3-at-2025-copie.jpg"}
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-night/70 to-transparent" aria-hidden />
        {icone && (
          <span className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary">
            <DynamicIcon name={icone} className="h-5 w-5" />
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h4 className="font-heading text-[20px] font-semibold leading-[1.3] text-dark transition group-hover:text-primary">
          <Link href={`/departements/${slug}`}>{nom}</Link>
        </h4>
        <p className="mt-3 line-clamp-4 flex-1 text-[15px] leading-7 text-body">{accroche || description}</p>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-[15px]">
          {typeof programmesCount === "number" && <span className="text-body">{programmesCount} formations</span>}
          <Link href={`/departements/${slug}`} className="inline-flex items-center gap-1.5 font-medium text-primary transition hover:text-secondary-dark">
            Découvrir <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

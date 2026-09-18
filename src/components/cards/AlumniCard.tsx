import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Briefcase, GraduationCap, MapPin } from "lucide-react";

/**
 * Carte alumni du thème : photo, nom, fonction puis lien « Voir Profil ».
 */
export function AlumniCard({
  prenom,
  nom,
  slug,
  promotion,
  programme,
  poste,
  entreprise,
  ville,
  pays,
  photo,
  temoignage,
}: {
  prenom: string;
  nom: string;
  slug: string;
  promotion?: number | null;
  programme?: string | null;
  poste?: string | null;
  entreprise?: string | null;
  ville?: string | null;
  pays?: string | null;
  photo?: string | null;
  temoignage?: string | null;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-card transition duration-500 hover:-translate-y-1.5 hover:bg-primary">
      <Link href={`/alumni/${slug}`} className="block overflow-hidden rounded-2xl">
        <Image
          src={photo || "/media/alamni-team-1.jpg"}
          alt={`${prenom} ${nom}`}
          width={600}
          height={520}
          className="aspect-[6/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-6">
        <h4 className="font-heading text-[20px] font-semibold text-dark transition group-hover:text-white">
          <Link href={`/alumni/${slug}`}>
            {prenom} {nom}
          </Link>
        </h4>
        <p className="mt-1 text-[15px] text-body transition group-hover:text-white/80">
          {[poste, entreprise].filter(Boolean).join(", ") || "Alumni du Groupe ISI"}
        </p>
        {temoignage && <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-7 text-body transition group-hover:text-white/75">{temoignage}</p>}
        <ul className="mt-4 space-y-1.5 text-[13px] text-muted transition group-hover:text-white/65">
          {programme && (
            <li className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary transition group-hover:text-secondary" aria-hidden /> {programme}
              {promotion ? ` · ${promotion}` : ""}
            </li>
          )}
          {(poste || entreprise) && (
            <li className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary transition group-hover:text-secondary" aria-hidden />
              {[poste, entreprise].filter(Boolean).join(" · ")}
            </li>
          )}
          {(ville || pays) && (
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary transition group-hover:text-secondary" aria-hidden />
              {[ville, pays].filter(Boolean).join(", ")}
            </li>
          )}
        </ul>
        <Link
          href={`/alumni/${slug}`}
          className="mt-5 inline-flex w-fit items-center gap-2 text-[15px] font-medium text-primary transition group-hover:text-secondary"
        >
          Voir Profil <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { LinkedinIcon } from "@/components/ui/SocialLinks";

export function TeamCard({ prenom, nom, slug, poste, photo, email, linkedin, departement }: { prenom: string; nom: string; slug: string; poste: string; photo?: string | null; email?: string | null; linkedin?: string | null; departement?: string | null }) {
  return (
    <Card className="h-full text-center">
      <Link href={`/equipe/${slug}`} className="relative block aspect-square overflow-hidden bg-primary-50">
        <Image src={photo || "/images/placeholder.svg"} alt={`${prenom} ${nom}`} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center gap-2 bg-gradient-to-t from-primary/90 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
          {email && <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary"><Mail className="h-4 w-4" /></span>}
          {linkedin && <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary"><LinkedinIcon className="h-4 w-4" /></span>}
        </div>
      </Link>
      <div className="p-5">
        <h3 className="text-lg font-extrabold text-primary transition group-hover:text-secondary">
          <Link href={`/equipe/${slug}`}>{prenom} {nom}</Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-secondary">{poste}</p>
        {departement && <p className="mt-1 text-xs text-muted">{departement}</p>}
      </div>
    </Card>
  );
}

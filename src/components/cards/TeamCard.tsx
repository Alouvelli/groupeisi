import Link from "next/link";
import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { LinkedinIcon, XIcon } from "@/components/ui/SocialLinks";

/**
 * Carte « membre de l'équipe » du thème (widget « rs-faculty-members ») :
 * cadre blanc, photo carrée arrondie, réseaux sociaux révélés au survol,
 * fond qui passe en bleu au survol.
 */
export function TeamCard({
  prenom,
  nom,
  slug,
  poste,
  photo,
  email,
  telephone,
  linkedin,
  twitter,
  departement,
}: {
  prenom: string;
  nom: string;
  slug: string;
  poste: string;
  photo?: string | null;
  email?: string | null;
  telephone?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  departement?: string | null;
}) {
  const socials = [
    email ? { href: `mailto:${email}`, Icon: Mail, label: "Email" } : null,
    telephone ? { href: `tel:${telephone.replace(/[^+\d]/g, "")}`, Icon: Phone, label: "Téléphone" } : null,
    twitter ? { href: twitter, Icon: XIcon, label: "X" } : null,
    linkedin ? { href: linkedin, Icon: LinkedinIcon, label: "LinkedIn" } : null,
  ].filter(Boolean) as { href: string; Icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element; label: string }[];

  return (
    <article className="group relative rounded-2xl bg-white p-3 text-center shadow-card transition duration-300 hover:bg-primary">
      <div className="relative">
        <Link href={`/equipe/${slug}`} className="block overflow-hidden rounded-2xl">
          <Image
            src={photo || "/media/ibrahima-sy-photo.jpg"}
            alt={`${prenom} ${nom}`}
            width={600}
            height={600}
            className="aspect-square w-full object-cover object-center transition duration-500"
          />
        </Link>
        {socials.length > 0 && (
          <div className="absolute bottom-7 left-0 flex flex-col gap-2 opacity-0 transition-all duration-300 group-hover:left-7 group-hover:opacity-100">
            {socials.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={`${label} – ${prenom} ${nom}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-title transition hover:bg-secondary hover:text-secondary-fg"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="px-3 pb-3 pt-8">
        <h4 className="font-heading text-[20px] font-semibold text-dark transition group-hover:text-white">
          <Link href={`/equipe/${slug}`}>
            {prenom} {nom}
          </Link>
        </h4>
        <span className="mt-1.5 block text-[15px] text-body transition group-hover:text-white/80">{poste}</span>
        {departement && <span className="mt-0.5 block text-[13px] text-muted transition group-hover:text-white/65">{departement}</span>}
      </div>
    </article>
  );
}

import Link from "next/link";
import { ArrowRight, ClipboardList, Download, UserPlus } from "lucide-react";
import { Container } from "@/components/ui/Container";

const ICONS = { admission: ClipboardList, brochure: Download, inscription: UserPlus } as const;

export interface QuickLink {
  label: string;
  href: string;
  icon: keyof typeof ICONS;
  external?: boolean;
}

/**
 * Trois accès rapides sous le bandeau d'accueil (Admission, Brochure,
 * Préinscription) : blocs bleus alignés sur trois colonnes.
 */
export function QuickLinks({ links, annee }: { links: QuickLink[]; annee?: string }) {
  return (
    <div className="relative z-10 bg-white">
      <Container className="grid gap-[30px] py-8 sm:grid-cols-3">
        {links.map(({ label, href, icon, external }) => {
          const Icon = ICONS[icon];
          const inner = (
            <>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-5 w-5 text-secondary" aria-hidden />
              </span>
              <span className="flex-1 font-heading text-[17px] font-semibold">
                {label}
                {icon === "brochure" && annee ? ` ${annee}` : ""}
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" aria-hidden />
            </>
          );
          const cls =
            "group flex items-center gap-4 rounded-md bg-primary px-5 py-4 text-white transition hover:bg-secondary hover:text-secondary-fg";
          return external ? (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
              {inner}
            </a>
          ) : (
            <Link key={label} href={href} className={cls}>
              {inner}
            </Link>
          );
        })}
      </Container>
    </div>
  );
}

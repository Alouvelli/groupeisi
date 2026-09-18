"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/a-propos", label: "À propos" },
  { href: "/a-propos/histoire", label: "Histoire" },
  { href: "/a-propos/administration", label: "Administration" },
  { href: "/a-propos/localisation", label: "Localisation" },
  { href: "/mot-du-president", label: "Mot du Président" },
];

/** Sous-navigation « ISI Inside » présente en tête des pages À propos. */
export function AproposNav() {
  const pathname = usePathname();
  return (
    <div className="border-b border-line bg-white">
      <Container className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="section-label text-[15px]">
          <GraduationCap className="h-4 w-4 text-primary" aria-hidden /> ISI Inside
        </span>
        <nav aria-label="Pages À propos">
          <ul className="scrollbar-hide flex gap-1 overflow-x-auto">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className={cn(
                    "inline-block whitespace-nowrap px-4 py-2 font-heading text-[15px] font-medium transition",
                    pathname === l.href ? "text-primary" : "text-title hover:text-primary",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </div>
  );
}

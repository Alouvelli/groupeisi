import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-white/80">
        <li>
          <Link href="/" className="inline-flex items-center gap-1 hover:text-white">
            <Home className="h-4 w-4" aria-hidden /> Accueil
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
            {item.href ? (
              <Link href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-white" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Bandeau d'en-tête des pages internes (titre + fil d'Ariane), style Univet. */
export function PageHeader({ title, subtitle, items, image }: { title: string; subtitle?: string; items: Crumb[]; image?: string | null }) {
  return (
    <section className="relative overflow-hidden bg-primary text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary-light/70" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-60" aria-hidden />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" aria-hidden />
      <Container className="relative py-16 sm:py-20">
        <Breadcrumb items={items} className="mb-4" />
        <h1 className="font-heading text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl text-balance">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-base text-white/80 sm:text-lg">{subtitle}</p>}
      </Container>
    </section>
  );
}

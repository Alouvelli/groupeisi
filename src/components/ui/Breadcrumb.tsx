import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "./Container";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items, className, light = true }: { items: Crumb[]; className?: string; light?: boolean }) {
  return (
    <nav aria-label="Fil d'Ariane" className={cn("text-[15px] font-medium", className)}>
      <ol className={cn("flex flex-wrap items-center justify-center gap-1.5", light ? "text-white/80" : "text-body")}>
        <li>
          <Link href="/" className={cn("transition", light ? "hover:text-secondary" : "hover:text-primary")}>
            Groupe ISI
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="inline-flex items-center gap-1.5">
            <ChevronRight className="h-4 w-4 opacity-70" aria-hidden />
            {item.href ? (
              <Link href={item.href} className={cn("transition", light ? "hover:text-secondary" : "hover:text-primary")}>
                {item.label}
              </Link>
            ) : (
              <span className={cn(light ? "text-secondary" : "text-primary")} aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Bandeau d'en-tête des pages internes du thème Univet :
 * photo de fond assombrie, titre centré en Bitter, fil d'Ariane.
 */
export function PageHeader({
  title,
  subtitle,
  items,
  image = "/media/img-9163.jpg",
  align = "center",
}: {
  title: string;
  subtitle?: string;
  items: Crumb[];
  image?: string | null;
  align?: "center" | "left";
}) {
  return (
    <section className="relative overflow-hidden bg-primary-dark text-white">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/80 via-primary/75 to-dark/85" aria-hidden />
      <Container className={cn("relative py-20 sm:py-24 lg:py-28", align === "center" ? "text-center" : "text-left")}>
        <h1 className="font-heading text-[36px] font-semibold leading-[1.2] text-white text-balance sm:text-[44px] sm:leading-[54px] lg:text-[52px] lg:leading-[66px]">{title}</h1>
        {subtitle && <p className={cn("mt-4 max-w-2xl text-base leading-7 text-white/85 sm:text-lg", align === "center" && "mx-auto")}>{subtitle}</p>}
        <Breadcrumb items={items} className={cn("mt-5", align === "left" && "[&_ol]:justify-start")} />
      </Container>
    </section>
  );
}

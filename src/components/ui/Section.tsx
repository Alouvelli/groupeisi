import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { GraduationCap } from "lucide-react";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "white" | "surface" | "primary" | "dark" | "gradient";
  padding?: "sm" | "md" | "lg" | "none";
  container?: boolean;
}

const variants = {
  white: "bg-white",
  surface: "bg-surface",
  primary: "bg-primary text-white",
  dark: "bg-night text-white",
  gradient: "bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white",
};
const paddings = { none: "", sm: "py-12 sm:py-16", md: "py-16 sm:py-20 lg:py-[100px]", lg: "py-20 sm:py-24 lg:py-[120px]" };

export function Section({ variant = "white", padding = "md", container = true, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn("relative", variants[variant], paddings[padding], className)} {...rest}>
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}

/** Libellé de section du thème : petite icône + texte (« prelements-heading .sub-text »). */
export function SectionLabel({ children, light = false, className }: { children: React.ReactNode; light?: boolean; className?: string }) {
  return (
    <span className={cn("section-label mb-3.5 text-[15px]", light ? "text-white" : "text-title", className)}>
      <GraduationCap className={cn("h-4 w-4", light ? "text-secondary" : "text-primary")} aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
  light = false,
  className,
  as: Tag = "h2",
  action,
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left" | "split";
  light?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
  /** Bouton affiché à droite du titre (disposition « split » du thème) */
  action?: React.ReactNode;
}) {
  if (align === "split") {
    return (
      <div className={cn("mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
        <div className="max-w-3xl">
          {label && <SectionLabel light={light}>{label}</SectionLabel>}
          <Tag className={cn("section-title text-balance", light && "text-white")}>{title}</Tag>
          {description && <p className={cn("mt-4 text-base leading-7", light ? "text-white/80" : "text-body")}>{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    );
  }
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {label && <SectionLabel light={light}>{label}</SectionLabel>}
      <Tag className={cn("section-title text-balance", light && "text-white")}>{title}</Tag>
      {description && <p className={cn("mt-4 text-base leading-7", light ? "text-white/80" : "text-body")}>{description}</p>}
    </div>
  );
}

import { cn } from "@/lib/utils";
import { Container } from "./Container";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "white" | "surface" | "primary" | "dark" | "gradient";
  padding?: "sm" | "md" | "lg" | "none";
  container?: boolean;
}

const variants = {
  white: "bg-white",
  surface: "bg-surface",
  primary: "bg-primary text-white",
  dark: "bg-dark text-white",
  gradient: "bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white",
};
const paddings = { none: "", sm: "py-10 sm:py-12", md: "py-16 sm:py-20", lg: "py-20 sm:py-28" };

export function Section({ variant = "white", padding = "md", container = true, className, children, ...rest }: SectionProps) {
  return (
    <section className={cn("relative", variants[variant], paddings[padding], className)} {...rest}>
      {container ? <Container>{children}</Container> : children}
    </section>
  );
}

export function SectionHeading({
  label,
  title,
  description,
  align = "center",
  light = false,
  className,
}: {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 max-w-3xl", align === "center" ? "mx-auto text-center" : "text-left", className)}>
      {label && (
        <span className={cn("section-label mb-3", light && "text-accent")}>
          <span className="h-px w-6 bg-current" aria-hidden />
          {label}
          {align === "center" && <span className="h-px w-6 bg-current" aria-hidden />}
        </span>
      )}
      <h2 className={cn("section-title text-balance", light && "text-white")}>{title}</h2>
      {description && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-white/80" : "text-muted")}>{description}</p>}
    </div>
  );
}

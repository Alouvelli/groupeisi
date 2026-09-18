import { cn } from "@/lib/utils";

/** Carte générique du thème : coins arrondis, bordure fine, ombre douce au survol. */
export function Card({ className, children, hover = true, ...rest }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn("group relative overflow-hidden rounded-lg border border-line bg-white transition-all duration-300", hover && "hover:shadow-card", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

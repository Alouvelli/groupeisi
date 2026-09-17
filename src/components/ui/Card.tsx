import { cn } from "@/lib/utils";

export function Card({ className, children, hover = true, ...rest }: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-card border border-line bg-white shadow-soft transition-all duration-300",
        hover && "hover:-translate-y-1.5 hover:shadow-card hover:border-primary-100",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-secondary-fg",
  soft: "bg-surface text-primary",
  softOrange: "bg-secondary-50 text-secondary-fg",
  outline: "border border-line text-body",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-surface text-body",
};

export function Badge({ variant = "soft", className, children }: { variant?: keyof typeof variants; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded px-3 py-1 text-[12px] font-medium uppercase tracking-wide", variants[variant], className)}>
      {children}
    </span>
  );
}

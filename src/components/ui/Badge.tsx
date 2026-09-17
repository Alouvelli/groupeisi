import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  soft: "bg-primary-50 text-primary",
  softOrange: "bg-secondary-50 text-secondary-dark",
  outline: "border border-line text-slate-600",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  neutral: "bg-slate-100 text-slate-700",
};

export function Badge({ variant = "soft", className, children }: { variant?: keyof typeof variants; className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", variants[variant], className)}>{children}</span>;
}

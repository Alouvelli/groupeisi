import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-extrabold text-primary sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-sm text-muted">{description}</p>}</div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatTile({ label, value, Icon, tone = "primary", hint, href }: { label: string; value: string | number; Icon: LucideIcon; tone?: "primary" | "secondary" | "success" | "danger" | "warning" | "neutral"; hint?: string; href?: string }) {
  const tones = { primary: "bg-primary-50 text-primary", secondary: "bg-secondary-50 text-secondary", success: "bg-emerald-100 text-emerald-700", danger: "bg-red-100 text-red-700", warning: "bg-amber-100 text-amber-700", neutral: "bg-slate-100 text-slate-600" };
  const body = (
    <div className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft transition hover:shadow-card">
      <span className={cn("inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", tones[tone])}><Icon className="h-6 w-6" /></span>
      <div className="min-w-0"><div className="text-2xl font-extrabold text-primary">{value}</div><div className="text-[11px] font-semibold uppercase leading-tight tracking-wider text-slate-400">{label}</div>{hint && <div className="text-xs text-muted">{hint}</div>}</div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Panel({ title, children, actions, className, padded = true }: { title?: string; children: React.ReactNode; actions?: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white shadow-soft", className)}>
      {(title || actions) && <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4"><h2 className="text-base font-extrabold text-primary">{title}</h2>{actions}</header>}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", className)}>{children}</span>;
}

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto", className)}><table className="w-full min-w-[640px] text-sm">{children}</table></div>;
}
export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400", className)}>{children}</th>;
}
export function Td({ children, className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...rest}>{children}</td>;
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-line p-10 text-center text-sm text-muted">{text}</div>;
}

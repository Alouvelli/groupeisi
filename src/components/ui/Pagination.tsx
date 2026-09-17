import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, pages, basePath, params = {} }: { page: number; pages: number; basePath: string; params?: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      <Link href={href(Math.max(1, page - 1))} aria-disabled={page === 1} className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full border border-line hover:bg-primary-50", page === 1 && "pointer-events-none opacity-40")}>
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {items.map((p, i) => {
        const prev = items[i - 1];
        return (
          <span key={p} className="inline-flex items-center gap-2">
            {prev && p - prev > 1 && <span className="px-1 text-slate-400">…</span>}
            <Link href={href(p)} aria-current={p === page ? "page" : undefined} className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold", p === page ? "bg-primary text-white" : "border border-line hover:bg-primary-50")}>
              {p}
            </Link>
          </span>
        );
      })}
      <Link href={href(Math.min(pages, page + 1))} aria-disabled={page === pages} className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full border border-line hover:bg-primary-50", page === pages && "pointer-events-none opacity-40")}>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

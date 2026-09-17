import { Counter } from "@/components/ui/Counter";
import type { LucideIcon } from "lucide-react";

export function StatCard({ value, suffix, label, Icon, light }: { value: number; suffix?: string; label: string; Icon: LucideIcon; light?: boolean }) {
  return (
    <div className={`flex items-center gap-4 rounded-2xl p-5 ${light ? "bg-white/10 text-white backdrop-blur" : "bg-white text-primary shadow-soft border border-line"}`}>
      <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${light ? "bg-secondary text-white" : "bg-secondary-50 text-secondary"}`}>
        <Icon className="h-7 w-7" />
      </span>
      <div>
        <div className="font-heading text-3xl font-extrabold leading-none sm:text-4xl">
          <Counter value={value} suffix={suffix} />
        </div>
        <div className={`mt-1.5 text-sm font-semibold ${light ? "text-white/80" : "text-muted"}`}>{label}</div>
      </div>
    </div>
  );
}

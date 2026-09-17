"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  count?: number;
}

export function Tabs({ tabs, defaultTab, className, variant = "pills" }: { tabs: Tab[]; defaultTab?: string; className?: string; variant?: "pills" | "underline" }) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className={className}>
      <div role="tablist" className={cn("scrollbar-hide flex gap-2 overflow-x-auto", variant === "underline" ? "border-b border-line" : "mb-8 justify-center")}>
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={cn(
                "whitespace-nowrap text-sm font-bold transition",
                variant === "pills" && (isActive ? "rounded-full bg-primary px-5 py-2.5 text-white shadow-lg shadow-primary/20" : "rounded-full bg-white px-5 py-2.5 text-primary border border-line hover:bg-primary-50"),
                variant === "underline" && (isActive ? "border-b-2 border-secondary px-4 py-3 text-secondary" : "border-b-2 border-transparent px-4 py-3 text-slate-500 hover:text-primary"),
              )}
            >
              {t.label}
              {typeof t.count === "number" && <span className={cn("ml-2 rounded-full px-2 py-0.5 text-[10px]", isActive ? "bg-white/20" : "bg-primary-50")}>{t.count}</span>}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className={variant === "underline" ? "pt-6" : undefined}>
        {current?.content}
      </div>
    </div>
  );
}

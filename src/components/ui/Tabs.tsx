"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  count?: number;
}

/**
 * Onglets du thème Univet :
 * - « underline » : onglets Mission / Vision / Valeurs de la page d'accueil,
 * - « pills »     : onglets pleins (Frais d'études, Galerie, FAQ).
 */
export function Tabs({
  tabs,
  defaultTab,
  className,
  variant = "pills",
  align = "center",
}: {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  variant?: "pills" | "underline";
  align?: "center" | "left";
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div className={className}>
      <div
        role="tablist"
        className={cn(
          "scrollbar-hide flex overflow-x-auto",
          variant === "underline" ? "gap-1 border-b border-line" : "mb-10 flex-wrap gap-3",
          align === "center" && variant === "pills" && "justify-center",
        )}
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(t.id)}
              className={cn("whitespace-nowrap", variant === "pills" ? "pill-tab" : "tab-btn")}
            >
              {t.label}
              {typeof t.count === "number" && (
                <span className={cn("ml-2 rounded-full px-2 py-0.5 text-[11px]", isActive ? "bg-white/20" : "bg-surface")}>{t.count}</span>
              )}
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

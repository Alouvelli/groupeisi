"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

/** Accordéon du thème : lignes encadrées, icône + / −, titre en Bitter. */
export function Accordion({ items, defaultOpen, className }: { items: AccordionItem[]; defaultOpen?: string; className?: string }) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? items[0]?.id ?? null);
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className={cn("overflow-hidden rounded-lg border bg-white transition", isOpen ? "border-primary/40 shadow-card" : "border-line")}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`acc-${item.id}`}
              className={cn(
                "flex w-full items-center justify-between gap-4 px-5 py-5 text-left font-heading text-[17px] font-semibold transition sm:px-7",
                isOpen ? "text-primary" : "text-dark hover:text-primary",
              )}
            >
              <span>{item.title}</span>
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
                  isOpen ? "bg-primary text-white" : "bg-surface text-primary",
                )}
              >
                {isOpen ? <Minus className="h-4 w-4" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`acc-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6 text-[15px] leading-7 text-body sm:px-7">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

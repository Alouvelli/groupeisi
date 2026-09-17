"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Carrousel horizontal accessible (scroll-snap) avec flèches, points et autoplay.
 */
export function Carousel({
  children,
  className,
  itemClassName,
  autoplay = 0,
  showDots = true,
  showArrows = true,
  ariaLabel = "Carrousel",
}: {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  autoplay?: number;
  showDots?: boolean;
  showArrows?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = children.length;

  const scrollTo = useCallback((i: number) => {
    const el = ref.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (child) el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  }, []);

  const go = useCallback((dir: 1 | -1) => scrollTo((index + dir + count) % count), [index, count, scrollTo]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const children = Array.from(el.children) as HTMLElement[];
      const center = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      children.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!autoplay || count < 2) return;
    const t = setInterval(() => go(1), autoplay);
    return () => clearInterval(t);
  }, [autoplay, go, count]);

  return (
    <div className={cn("relative", className)} aria-roledescription="carousel" aria-label={ariaLabel}>
      <div ref={ref} className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2">
        {children.map((child, i) => (
          <div key={i} className={cn("shrink-0 snap-start", itemClassName ?? "w-full")} aria-roledescription="slide" aria-label={`${i + 1} / ${count}`}>
            {child}
          </div>
        ))}
      </div>
      {showArrows && count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Précédent" className="absolute -left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-card transition hover:bg-primary hover:text-white lg:flex">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Suivant" className="absolute -right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-card transition hover:bg-primary hover:text-white lg:flex">
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      {showDots && count > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {children.map((_, i) => (
            <button key={i} type="button" aria-label={`Aller à la diapositive ${i + 1}`} onClick={() => scrollTo(i)} className={cn("h-2.5 rounded-full transition-all", i === index ? "w-8 bg-secondary" : "w-2.5 bg-primary/20 hover:bg-primary/40")} />
          ))}
        </div>
      )}
    </div>
  );
}

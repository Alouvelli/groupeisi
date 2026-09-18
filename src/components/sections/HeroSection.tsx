"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bandeau d'accueil : diaporama pleine largeur d'affiches (Slider Revolution
 * sur le site d'origine : uniquement des visuels, sans texte superposé).
 */
export function HeroSection({ slides, interval = 6000 }: { slides: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval]);

  if (!count) return null;

  return (
    <section className="relative isolate w-full overflow-hidden bg-primary" aria-label="Diaporama de présentation">
      <div className="relative h-[46vw] min-h-[240px] w-full sm:h-[42vw] lg:h-[min(841px,44vw)]">
        {slides.map((src, i) => (
          <Image
            key={src + i}
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className={cn("object-cover object-center transition-opacity duration-700", i === index ? "opacity-100" : "opacity-0")}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Visuel précédent"
            className="absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary transition hover:bg-secondary hover:text-secondary-fg sm:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Visuel suivant"
            className="absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary transition hover:bg-secondary hover:text-secondary-fg sm:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Aller au visuel ${i + 1}`}
                aria-current={i === index}
                className={cn("h-2 rounded-full transition-all", i === index ? "w-7 bg-secondary" : "w-2 bg-white/70 hover:bg-white")}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

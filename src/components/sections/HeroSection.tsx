"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Play, GraduationCap, MapPin, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  label: string;
  title: string;
  subtitle: string;
  image: string;
  cta: { label: string; href: string };
  cta2?: { label: string; href: string };
}

export function HeroSection({ slides, videoUrl }: { slides: HeroSlide[]; videoUrl?: string | null }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [go, paused, count]);

  const slide = slides[index];

  return (
    <section className="relative isolate min-h-[560px] overflow-hidden bg-primary text-white sm:min-h-[640px] lg:min-h-[720px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel" aria-label="À la une">
      {/* Images de fond */}
      <AnimatePresence mode="sync">
        <motion.div key={slide.image} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="absolute inset-0 -z-10">
          <Image src={slide.image} alt="" fill priority={index === 0} sizes="100vw" className="object-cover" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary-dark/95 via-primary/80 to-primary/30" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-grid opacity-50" aria-hidden />
      <div className="absolute -bottom-32 -right-32 -z-10 h-[420px] w-[420px] rounded-full bg-secondary/30 blur-3xl" aria-hidden />

      <Container className="flex min-h-[560px] items-center py-20 sm:min-h-[640px] lg:min-h-[720px]">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" /> {slide.label}
              </span>
              <h1 className="mt-6 font-heading text-4xl font-extrabold leading-[1.08] text-white text-balance sm:text-5xl lg:text-6xl xl:text-[4.25rem]">{slide.title}</h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg lg:text-xl">{slide.subtitle}</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Button href={slide.cta.href} variant="secondary" size="lg">
                  {slide.cta.label} <ArrowRight className="h-5 w-5" />
                </Button>
                {slide.cta2 && (
                  <Button href={slide.cta2.href} variant="outline-white" size="lg">
                    {slide.cta2.label}
                  </Button>
                )}
                {videoUrl && (
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-3 text-sm font-bold text-white">
                    <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-secondary">
                      <span className="absolute inset-0 rounded-full bg-white animate-pulse-ring" aria-hidden />
                      <Play className="relative h-5 w-5 fill-current" />
                    </span>
                    Voir la vidéo
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-white/80">
            <li className="inline-flex items-center gap-2"><Award className="h-4 w-4 text-accent" /> Diplômes reconnus ANAQ-Sup / CAMES</li>
            <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> 9 campus au Sénégal et en Mauritanie</li>
            <li className="inline-flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent" /> Depuis 1994</li>
          </ul>
        </div>
      </Container>

      {/* Contrôles */}
      {count > 1 && (
        <>
          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2 lg:left-auto lg:right-8 lg:translate-x-0">
            {slides.map((_, i) => (
              <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`Diapositive ${i + 1}`} aria-current={i === index} className={cn("h-2 rounded-full transition-all", i === index ? "w-10 bg-secondary" : "w-2.5 bg-white/40 hover:bg-white/70")} />
            ))}
          </div>
          <button type="button" onClick={() => go(-1)} aria-label="Diapositive précédente" className="absolute left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-secondary xl:flex">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Diapositive suivante" className="absolute right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-secondary xl:flex">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  src: string;
  alt: string;
  categorie?: string;
}

export function GalleryGrid({ images, columns = 4 }: { images: GalleryImage[]; columns?: 3 | 4 }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = (dir: 1 | -1) => setOpen((i) => (i === null ? null : (i + dir + images.length) % images.length));
  return (
    <>
      <div className={cn("grid gap-4", columns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3")}>
        {images.map((img, i) => (
          <button key={`${img.src}-${i}`} type="button" onClick={() => setOpen(i)} className={cn("group relative aspect-square overflow-hidden rounded-2xl bg-primary-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-secondary/40", i === 0 && columns === 4 && "md:col-span-2 md:row-span-2")} aria-label={`Agrandir : ${img.alt}`}>
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/80 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
              <span className="text-sm font-bold text-white">{img.alt}</span>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-dark/95 p-4" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
            <button type="button" aria-label="Fermer" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setOpen(null)}><X className="h-6 w-6" /></button>
            <button type="button" aria-label="Précédente" className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(-1); }}><ChevronLeft className="h-6 w-6" /></button>
            <button type="button" aria-label="Suivante" className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20" onClick={(e) => { e.stopPropagation(); go(1); }}><ChevronRight className="h-6 w-6" /></button>
            <motion.div key={open} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image src={images[open].src} alt={images[open].alt} fill sizes="100vw" className="object-contain" />
              <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-4 text-center text-sm font-semibold text-white">{images[open].alt}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function GallerySection({ images }: { images: GalleryImage[] }) {
  if (!images.length) return null;
  return (
    <Section variant="white" padding="lg" id="galerie">
      <SectionHeading label="Galerie" title="La vie sur nos campus" description="Laboratoires, événements, cérémonies : découvrez le quotidien des étudiants ISI en images." />
      <GalleryGrid images={images.slice(0, 8)} />
      <div className="mt-10 text-center">
        <Button href="/galerie" variant="outline"><Camera className="h-4 w-4" /> Voir toute la galerie</Button>
      </div>
    </Section>
  );
}

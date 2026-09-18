"use client";

import Image from "next/image";
import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";

export interface GalleryImage {
  src: string;
  alt: string;
  categorie?: string;
}

/**
 * Bande « Vie estudiantine » de l'accueil : défilé d'images pleine largeur
 * avec le titre de section superposé, et visionneuse au clic.
 */
export function GalleryStrip({ images, title = "Vie estudiantine" }: { images: GalleryImage[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!images.length) return null;
  const shown = images.slice(0, 6);

  return (
    <section className="relative isolate overflow-hidden bg-dark">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((img, i) => (
          <button
            key={img.src + i}
            type="button"
            onClick={() => setOpen(i)}
            className="group relative aspect-[3/4] overflow-hidden focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/60"
            aria-label={`Agrandir : ${img.alt}`}
          >
            <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 50vw, 20vw" className="object-cover transition duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 bg-dark/30 transition group-hover:bg-dark/10" aria-hidden />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100" aria-hidden>
              <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-secondary text-secondary-fg">
                <ZoomIn className="h-6 w-6" />
              </span>
            </span>
          </button>
        ))}
      </div>
      <h2 className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-heading text-[10vw] font-semibold leading-none text-white/85 drop-shadow-lg lg:text-[8vw]">
        {title}
      </h2>

      <Lightbox images={shown} index={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/** Galerie filtrable par catégorie (page /galerie). */
export function GallerySection({ images, categories }: { images: GalleryImage[]; categories?: string[] }) {
  const cats = categories ?? Array.from(new Set(images.map((i) => i.categorie).filter(Boolean) as string[]));
  const [active, setActive] = useState<string>("Toutes");
  const [open, setOpen] = useState<number | null>(null);
  const filtered = active === "Toutes" ? images : images.filter((i) => i.categorie === active);

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-[100px]">
      <Container>
        <div className="mb-10 text-center">
          <SectionLabel className="justify-center">Galerie</SectionLabel>
          <h2 className="section-title">Vie de campus</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-body">
            Découvrez la vie dans notre institut à travers des images et des souvenirs.
          </p>
        </div>

        {cats.length > 1 && (
          <div role="tablist" className="mb-10 flex flex-wrap justify-center gap-3">
            {["Toutes", ...cats].map((c) => (
              <button key={c} type="button" role="tab" aria-selected={active === c} onClick={() => setActive(c)} className="pill-tab">
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-[20px] sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={() => setOpen(i)}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-line focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
              aria-label={`Agrandir : ${img.alt}`}
            >
              <Image src={img.src} alt={img.alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute inset-0 bg-night/50 opacity-0 transition group-hover:opacity-100" aria-hidden />
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100" aria-hidden>
                <span className="flex h-[70px] w-[70px] items-center justify-center rounded-full bg-secondary text-secondary-fg">
                  <ZoomIn className="h-6 w-6" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </Container>

      <Lightbox images={filtered} index={open} onClose={() => setOpen(null)} />
    </section>
  );
}

function Lightbox({ images, index, onClose }: { images: GalleryImage[]; index: number | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {index !== null && images[index] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-dark/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={images[index].alt}
        >
          <button type="button" onClick={onClose} aria-label="Fermer" className="absolute right-5 top-5 text-white/90 transition hover:text-white">
            <X className="h-8 w-8" />
          </button>
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className={cn("relative max-h-[85vh] w-full max-w-5xl")}>
            <Image
              src={images[index].src}
              alt={images[index].alt}
              width={1600}
              height={1100}
              className="mx-auto h-auto max-h-[85vh] w-auto rounded-lg object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProgramCard, type ProgramCardProps } from "@/components/cards/ProgramCard";
import { NIVEAU_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Niveau } from "@prisma/client";

const ORDER: Niveau[] = ["LICENCE", "MASTER", "BTS", "CERTIFICAT", "FORMATION_CONTINUE"];

export function ProgrammesSection({ programmes }: { programmes: ProgramCardProps[] }) {
  const niveaux = useMemo(() => ORDER.filter((n) => programmes.some((p) => p.niveau === n)), [programmes]);
  const [active, setActive] = useState<Niveau | "ALL">("ALL");
  const visible = (active === "ALL" ? programmes : programmes.filter((p) => p.niveau === active)).slice(0, 6);

  return (
    <Section variant="white" padding="lg" id="programmes">
      <SectionHeading label="Nos formations" title="Des formations professionnalisantes du BTS au Master" description="Choisissez le parcours adapté à votre projet : diplômes d'État, licences et masters accrédités, certifications internationales." />
      <div className="scrollbar-hide mb-10 flex justify-start gap-2 overflow-x-auto sm:justify-center" role="tablist">
        {(["ALL", ...niveaux] as const).map((n) => (
          <button key={n} role="tab" aria-selected={active === n} onClick={() => setActive(n)} className={cn("whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-bold transition", active === n ? "bg-primary text-white shadow-lg shadow-primary/20" : "border border-line bg-white text-primary hover:bg-primary-50")}>
            {n === "ALL" ? "Toutes" : NIVEAU_LABELS[n]}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((p) => (
            <ProgramCard key={p.slug} {...p} />
          ))}
        </motion.div>
      </AnimatePresence>
      <div className="mt-12 text-center">
        <Button href={active === "ALL" ? "/programmes" : `/programmes?niveau=${active}`} variant="primary" size="lg">
          Voir toutes les formations <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Section>
  );
}

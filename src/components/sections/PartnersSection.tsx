import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { AnimatedHeading } from "@/components/motion";

export interface Partenaire {
  nom: string;
  logo: string;
  url?: string | null;
}

/** Bande des partenaires : défilement continu des logos. */
export function PartnersSection({
  partenaires,
  label = "Nos partenaires",
  title = "Ils nous font confiance",
  variant = "white",
}: {
  partenaires: Partenaire[];
  label?: string;
  title?: string;
  variant?: "white" | "surface";
}) {
  if (!partenaires.length) return null;
  const doubled = [...partenaires, ...partenaires];
  return (
    <section className={variant === "surface" ? "overflow-hidden bg-surface py-16 lg:py-20" : "overflow-hidden bg-white py-16 lg:py-20"}>
      <Container>
        <div className="mb-10 text-center">
          <SectionLabel className="justify-center">{label}</SectionLabel>
          <AnimatedHeading className="section-title">{title}</AnimatedHeading>
        </div>
      </Container>
      <div className="relative">
        <div className="flex w-max animate-marquee items-center gap-6">
          {doubled.map((p, i) => (
            <div key={p.nom + i} className="flex h-24 w-48 shrink-0 items-center justify-center rounded-lg border border-line bg-white px-6">
              <Image
                src={p.logo}
                alt={p.nom}
                width={160}
                height={64}
                className="h-12 w-auto object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

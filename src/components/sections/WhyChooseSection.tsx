import Image from "next/image";
import { Check, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

/**
 * Section « Pourquoi choisir ISI » : visuel avec lecteur vidéo à gauche,
 * liste d'arguments à droite.
 */
export function WhyChooseSection({
  label = "Pourquoi choisir ISI",
  title = "Une école de proximité, une reconnaissance internationale",
  description,
  image = "/media/img-2298-1.jpg",
  videoUrl,
  atouts = [],
  href = "/a-propos",
  cta = "En savoir plus",
}: {
  label?: string;
  title?: string;
  description?: string;
  image?: string;
  videoUrl?: string | null;
  atouts?: { titre: string; description?: string }[];
  href?: string;
  cta?: string;
}) {
  return (
    <section className="bg-white py-16 sm:py-20 lg:py-[100px]">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-lg">
            <Image src={image} alt="" width={960} height={720} className="h-auto w-full object-cover" />
            {videoUrl && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Voir la vidéo de présentation"
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-fg">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-secondary" aria-hidden />
                  <Play className="relative h-7 w-7" />
                </span>
              </a>
            )}
          </div>
          <div>
            <SectionLabel>{label}</SectionLabel>
            <h2 className="section-title text-balance">{title}</h2>
            {description && <p className="mt-5 text-base leading-7 text-body">{description}</p>}
            {atouts.length > 0 && (
              <ul className="mt-8 space-y-5">
                {atouts.map((a) => (
                  <li key={a.titre} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-heading text-[18px] font-semibold text-dark">{a.titre}</span>
                      {a.description && <span className="mt-1 block text-[15px] leading-7 text-body">{a.description}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Button href={href} className="mt-9" arrow>
              {cta}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

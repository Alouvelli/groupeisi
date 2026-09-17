import Image from "next/image";
import { CheckCircle2, Award, Laptop, Handshake, Globe2, Play } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  { Icon: Award, title: "Diplômes reconnus", text: "BTS d'État, Licences et Masters accrédités ANAQ-Sup, Masters reconnus par le CAMES." },
  { Icon: Laptop, title: "Pédagogie par projets", text: "Laboratoires Cisco et Huawei, incubateur ISI Lab, hackathons et certifications internationales." },
  { Icon: Handshake, title: "Insertion professionnelle", text: "Stages obligatoires, forum entreprises annuel et un réseau de plus de 120 entreprises partenaires." },
  { Icon: Globe2, title: "Un réseau régional", text: "9 campus au Sénégal et en Mauritanie, des cours du jour, du soir et à distance." },
];

export function WhyChooseSection({ image, videoUrl, annees }: { image: string; videoUrl?: string | null; annees: number }) {
  return (
    <Section variant="white" padding="lg" className="overflow-hidden">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image src={image} alt="Étudiants du Groupe ISI" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            {videoUrl && (
              <a href={videoUrl} target="_blank" rel="noopener noreferrer" aria-label="Voir la vidéo de présentation" className="absolute inset-0 flex items-center justify-center">
                <span className="relative inline-flex h-20 w-20 items-center justify-center rounded-full bg-white text-secondary shadow-2xl">
                  <span className="absolute inset-0 rounded-full bg-white animate-pulse-ring" aria-hidden />
                  <Play className="relative h-8 w-8 fill-current" />
                </span>
              </a>
            )}
          </div>
          <div className="absolute -bottom-6 -right-4 rounded-3xl bg-secondary p-6 text-white shadow-card sm:-right-6 sm:p-8 animate-float">
            <div className="font-heading text-5xl font-extrabold leading-none">{annees}<span className="text-accent">+</span></div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-wider">Années d&apos;excellence</div>
          </div>
          <div className="absolute -left-6 top-10 hidden rounded-2xl border border-line bg-white p-4 shadow-card sm:block">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-5 w-5" /></span>
              <div>
                <div className="text-sm font-extrabold text-primary">Accrédité ANAQ-Sup</div>
                <div className="text-xs text-muted">Qualité garantie par l&apos;État</div>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="section-label mb-3"><span className="h-px w-6 bg-current" /> Pourquoi choisir ISI ?</span>
            <h2 className="section-title text-balance">Une école de référence dans les TIC depuis 1994</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted">
              Le Groupe ISI accompagne chaque étudiant vers la réussite avec un enseignement professionnalisant, des équipements de pointe et un accompagnement personnalisé, du BTS au Master.
            </p>
          </Reveal>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal as="li" key={f.title} delay={i * 0.08} className="flex gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary"><f.Icon className="h-6 w-6" /></span>
                <div>
                  <h3 className="text-base font-extrabold text-primary">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-10 flex flex-wrap gap-4" delay={0.2}>
            <Button href="/presentation" variant="primary" size="lg">Découvrir le Groupe ISI</Button>
            <Button href="/admissions" variant="outline" size="lg">Conditions d&apos;admission</Button>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}

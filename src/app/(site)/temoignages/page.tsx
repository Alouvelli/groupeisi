import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { TestimonialCard } from "@/components/cards/TestimonialCard";
import { getTestimonials } from "@/lib/data";
import { AnimatedHeading } from "@/components/motion";

export const metadata: Metadata = {
  title: "Témoignages",
  description: "Les témoignages et interviews des diplômés et enseignants du Groupe ISI.",
};

/** Convertit une URL YouTube en URL d'intégration. */
function embedUrl(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

export default async function TemoignagesPage() {
  const all = await getTestimonials(50);
  const videos = all.filter((t) => t.videoUrl);
  const ecrits = all.filter((t) => !t.videoUrl);

  return (
    <>
      <PageHeader title="Témoignages" items={[{ label: "Témoignages" }]} image="/media/img-9226-cr3-dxo-deepprimexd-dxo.jpg" />

      {videos.length > 0 && (
        <section className="bg-white section-y">
          <Container>
            <div className="mb-8 max-w-3xl lg:mb-10">
              <SectionLabel>Interviews</SectionLabel>
              <AnimatedHeading className="section-title">Ils racontent leur parcours</AnimatedHeading>
            </div>
            <div className="grid gap-[30px] lg:grid-cols-2">
              {videos.map((t) => {
                const src = t.videoUrl ? embedUrl(t.videoUrl) : null;
                return (
                  <article key={t.id} className="overflow-hidden rounded-lg border border-line bg-white">
                    {src ? (
                      <iframe
                        src={src}
                        title={`Témoignage de ${t.nom}`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="aspect-video w-full border-0"
                      />
                    ) : (
                      <a href={t.videoUrl!} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center bg-surface">
                        <PlayCircle className="h-12 w-12 text-primary" aria-hidden />
                      </a>
                    )}
                    <div className="p-6">
                      <h3 className="font-heading text-[20px] font-semibold text-dark">Témoignage de {t.nom}</h3>
                      <p className="mt-1.5 text-[15px] text-body">{t.role}</p>
                      <p className="mt-3 text-[15px] leading-7 text-body">{t.contenu}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {ecrits.length > 0 && (
        <section className="bg-surface section-y">
          <Container>
            <div className="mb-8 max-w-3xl lg:mb-10">
              <SectionLabel>Feedback de nos étudiants</SectionLabel>
              <AnimatedHeading className="section-title">Le parcours de nos diplômés</AnimatedHeading>
            </div>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {ecrits.map((t) => (
                <TestimonialCard key={t.id} nom={t.nom} role={t.role} contenu={t.contenu} photo={t.photo} note={t.note} entreprise={t.entreprise} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

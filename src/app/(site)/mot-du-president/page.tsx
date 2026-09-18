import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { AproposNav } from "@/components/layout/AproposNav";
import { GallerySection } from "@/components/sections/GallerySection";
import { getGalleryImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mot du président",
  description: "Le mot d'Abdou Sambe, Président du Groupe ISI : former et bien former, pour permettre à chaque diplômé d'intégrer le tissu économique sénégalais et africain.",
};

const PARAGRAPHES = [
  "Chers bacheliers, étudiants et professionnels,",
  "À l'ère du numérique et de la transformation digitale, l'Institut Supérieur d'Informatique (ISI) s'impose comme un acteur clé de la formation supérieure au Sénégal, en Afrique et au-delà. Fort de 31 années d'expertise, l'ISI place l'innovation technologique, la maîtrise des nouvelles TIC et l'adaptabilité au cœur de son projet pédagogique.",
  "À l'ISI, nous ne nous contentons pas de transmettre des connaissances. Nous préparons nos étudiants à devenir les leaders de demain, capables de comprendre, d'anticiper et d'agir dans un monde en constante mutation. Grâce à une approche pédagogique axée sur les compétences numériques, l'intelligence artificielle, la cybersécurité, les data sciences ou encore les technologies émergentes, nous formons une nouvelle génération de professionnels responsables, agiles et résolument tournés vers l'avenir.",
  "Ouvert à tous, notre modèle inclusif permet à chaque étudiant – quel que soit son parcours – de bénéficier d'un encadrement de qualité et d'un accompagnement personnalisé. Nous croyons fermement que l'accès au savoir, conjugué à l'excellence, est la meilleure voie pour bâtir un avenir durable.",
  "Agréé et reconnu par l'État, l'ISI reste fidèle à sa mission : former et bien former, pour permettre à chaque diplômé d'intégrer avec compétence et confiance le tissu économique sénégalais et africain.",
  "Merci de faire confiance à l'ISI. Ensemble, construisons l'innovation de demain.",
];

export default async function MotDuPresidentPage() {
  const gallery = await getGalleryImages();

  return (
    <>
      <PageHeader title="Mot du Président" items={[{ label: "À propos", href: "/a-propos" }, { label: "Mot du Président" }]} image="/media/img-9163.jpg" />
      <AproposNav />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[400px_1fr] lg:gap-16">
            <div>
              <div className="overflow-hidden rounded-lg">
                <Image src="/media/m-sambe.jpg" alt="Abdou Sambe, Président du Groupe ISI" width={600} height={760} className="h-auto w-full object-cover" />
              </div>
              <h3 className="mt-6 font-heading text-[24px] font-semibold text-dark">Abdou Sambe</h3>
              <p className="mt-1 text-[15px] text-body">Président du Groupe ISI</p>
            </div>

            <div>
              <SectionLabel>Groupe ISI</SectionLabel>
              <h2 className="section-title">Mot du Président</h2>
              <div className="prose-isi mt-6">
                {PARAGRAPHES.map((p, i) => (
                  <p key={i} className={i === 0 ? "font-medium text-dark" : undefined}>
                    {p}
                  </p>
                ))}
                <p className="font-heading font-semibold text-dark">Le Président</p>
              </div>
              <div className="mt-9 flex flex-wrap gap-4">
                <Button href="/formations" arrow>
                  Découvrir nos formations
                </Button>
                <Button href="/preinscription" variant="outline" arrow>
                  Se préinscrire
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <GallerySection images={gallery} />
    </>
  );
}

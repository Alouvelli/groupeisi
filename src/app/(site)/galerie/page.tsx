import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Tabs } from "@/components/ui/Tabs";
import { GalleryGrid } from "@/components/sections/GallerySection";
import { getGalleryImages } from "@/lib/data";

export const metadata: Metadata = { title: "Galerie", description: "La vie du Groupe ISI en images : campus, laboratoires, événements et cérémonies." };

export default async function GaleriePage() {
  const images = await getGalleryImages();
  const cats = Array.from(new Set(images.map((i) => i.categorie)));
  return (
    <>
      <PageHeader title="Galerie photos" subtitle="Campus, laboratoires, événements, cérémonies : découvrez le quotidien des étudiants ISI." items={[{ label: "L'École" }, { label: "Galerie" }]} />
      <Section padding="lg">
        <SectionHeading label="En images" title="La vie sur nos campus" />
        <Tabs tabs={[{ id: "all", label: "Toutes", count: images.length, content: <GalleryGrid images={images} /> }, ...cats.map((c) => ({ id: c, label: c, count: images.filter((i) => i.categorie === c).length, content: <GalleryGrid images={images.filter((i) => i.categorie === c)} /> }))]} />
      </Section>
    </>
  );
}

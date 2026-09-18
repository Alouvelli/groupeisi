import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { GallerySection } from "@/components/sections/GallerySection";
import { getGalleryImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Galerie",
  description: "Découvrez la vie dans notre institut à travers des images et des souvenirs : vie de campus, activités académiques, classes et labos, sports universitaires.",
};

export default async function GaleriePage() {
  const images = await getGalleryImages();
  return (
    <>
      <PageHeader title="Galerie" items={[{ label: "Galerie" }]} image="/media/img-2024-1.jpg" />
      <GallerySection images={images} />
    </>
  );
}

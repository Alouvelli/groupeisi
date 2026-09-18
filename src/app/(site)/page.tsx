import type { Metadata } from "next";
import {
  getSettings,
  getFeaturedProgrammes,
  getCampus,
  getLatestPosts,
  getEvenements,
  getTestimonials,
  getPersonnes,
  getGalleryImages,
  getProgrammesForForm,
} from "@/lib/data";
import {
  AboutSection,
  CampusSection,
  EventsSection,
  GalleryStrip,
  HeroSection,
  NewsSection,
  PreInscriptionCTA,
  ProgrammesSection,
  QuickLinks,
  TeamSection,
  TestimonialsSection,
} from "@/components/sections";

export const metadata: Metadata = {
  title: "Groupe ISI – Institut de référence dans les TIC",
  description:
    "Depuis plus de 27 ans, l'Institut Supérieur d'Informatique (ISI) forme les jeunes cadres africains : licences et masters reconnus ANAQ-Sup et CAMES, 9 campus au Sénégal et en Mauritanie.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, programmes, campus, posts, events, testimonials, team, gallery, formations] = await Promise.all([
    getSettings(),
    getFeaturedProgrammes(4),
    getCampus(),
    getLatestPosts(4),
    getEvenements({ upcoming: true, take: 3 }),
    getTestimonials(6),
    getPersonnes("ENSEIGNANT").then((list) => list.filter((p) => p.isFeatured).slice(0, 3)),
    getGalleryImages(),
    getProgrammesForForm(),
  ]);

  const slides = settings.heroSlides.length
    ? settings.heroSlides
    : ["/media/site-wet-en-ligne-at-2x-at-2x.jpg", "/media/whatsapp-image-2026-07-14-at-16-49-01.jpeg", "/media/site-web-fede-at-2x.jpg"];

  return (
    <>
      <HeroSection slides={slides} />

      <QuickLinks
        annee={settings.anneeAcademique}
        links={[
          { label: "Admission", href: "/condition-admission", icon: "admission" },
          { label: "Brochure", href: "/telechargements", icon: "brochure" },
          { label: "Préinscription", href: "/preinscription", icon: "inscription" },
        ]}
      />

      <AboutSection
        label="à propos du Groupe ISI"
        title="Un institut de référence dans les TIC"
        intro="Depuis plus de 27 ans, l'Institut Supérieur d'Informatique « ISI » s'engage dans la formation des jeunes cadres africains. Avec l'ambition du PDG, l'institut vise à diversifier l'offre de formation au Sénégal et dans la sous-région. Au fil des années, l'ISI a su se développer et compte aujourd'hui 9 campus, réunissant plus de trente nationalités, formant ainsi une belle et dynamique famille isienne."
        onglets={[
          {
            id: "mission",
            label: "Mission",
            paragraphes: [
              "Grâce à son expertise et la qualité de ses services, le Groupe ISI délivre des diplômes de Licence et Master reconnus à la fois par le monde de l'entreprise et par les instances d'accréditation nationales « ANAQ-Sup » et panafricaines « CAMES ».",
            ],
          },
          {
            id: "vision",
            label: "Vision",
            paragraphes: [
              "Avec une offre de formation diversifiée dans les métiers d'avenir, une innovation permanente de ses programmes, et les brillants résultats obtenus aux différents examens et concours, l'Institut Supérieur d'Informatique « ISI » est leader dans son domaine au Sénégal et dans la sous-région.",
            ],
          },
          {
            id: "valeurs",
            label: "Valeurs",
            paragraphes: [
              "Avec l'ambition du PDG de participer à la diversification de l'offre de formation au Sénégal et dans la sous-région, l'ISI a su se développer au fil des ans, comptant ainsi en son sein 09 campus, où se côtoient plus de trente nationalités, qui constituent la belle famille isienne.",
            ],
          },
        ]}
        atouts={[
          "Diplômes reconnus par le CAMES et l'ANAQ-SUP",
          "N°1 de la formation au Sénégal et en Mauritanie",
          "Corps professoral qualifié",
          "Près de 10 campus partout dans la sous-région",
        ]}
        images={["/media/mg-9698-cr3-at-2025-copie.jpg", "/media/img-9163.jpg"]}
        href="/a-propos"
        chiffres={[
          {
            valeur: settings.statEtudiants,
            prefixe: "+ ",
            titre: "Etudiants inscrits",
            description: `Plus de ${new Intl.NumberFormat("fr-FR").format(settings.statEtudiants)} étudiants inscrits dans nos différents campus.`,
            icone: "users",
          },
          {
            titre: "Institut de référence dans les TIC",
            description: "N°1 de la formation au Sénégal et en Mauritanie.",
            icone: "award",
          },
          {
            valeur: 20,
            prefixe: "+ ",
            titre: "Distinctions remportées",
            description: "Plus de 20 distinctions remportées pour excellence et innovation.",
            icone: "trophy",
          },
        ]}
      />

      <ProgrammesSection
        programmes={programmes.map((p) => ({
          titre: p.titre,
          slug: p.slug,
          niveau: p.niveau,
          duree: p.duree,
          accroche: p.accroche,
          description: p.description,
          image: p.image,
          objectifs: p.objectifs,
          departement: p.departement ? { nom: p.departement.nom, slug: p.departement.slug } : null,
          campus: p.campus.map((c) => ({ nom: c.nom, slug: c.slug })),
        }))}
      />

      <PreInscriptionCTA
        anneeAcademique={settings.anneeAcademique}
        ouvertes={settings.inscriptionsOuvertes}
        image="/media/img-2298-1.jpg"
        formations={formations.map((f) => ({ id: f.id, titre: f.titre }))}
        campus={campus.map((c) => ({ id: c.id, nom: c.nom }))}
      />

      <TeamSection
        members={team.map((m) => ({
          prenom: m.prenom,
          nom: m.nom,
          slug: m.slug,
          poste: m.poste,
          photo: m.photo,
          email: m.email,
          telephone: m.telephone,
          linkedin: m.linkedin,
          twitter: m.twitter,
          departement: m.departement?.nom ?? null,
        }))}
      />

      <CampusSection
        campus={campus.slice(0, 6).map((c) => ({
          nom: c.nom,
          slug: c.slug,
          image: c.image,
          ville: c.ville,
          pays: c.pays,
          isSiege: c.isSiege,
          programmesCount: c._count.programmes,
        }))}
        description="Inscrivez-vous dès maintenant pour commencer votre parcours académique transformateur avec nous."
      />

      <EventsSection
        events={events.map((e) => ({
          titre: e.titre,
          slug: e.slug,
          description: e.description,
          image: e.image,
          dateDebut: e.dateDebut,
          heure: e.heure,
          lieu: e.lieu,
          type: e.type,
        }))}
      />

      <GalleryStrip images={gallery.slice(0, 5)} title="Vie estudiantine" />

      <TestimonialsSection
        testimonials={testimonials.map((t) => ({
          nom: t.nom,
          role: t.role,
          contenu: t.contenu,
          photo: t.photo,
          note: t.note,
          entreprise: t.entreprise,
        }))}
      />

      <NewsSection
        posts={posts.map((p) => ({
          titre: p.titre,
          slug: p.slug,
          extrait: p.extrait,
          image: p.image,
          publishedAt: p.publishedAt,
          tempsLecture: p.tempsLecture,
          categorie: p.categorie ? { nom: p.categorie.nom, slug: p.categorie.slug, couleur: p.categorie.couleur } : null,
        }))}
      />
    </>
  );
}

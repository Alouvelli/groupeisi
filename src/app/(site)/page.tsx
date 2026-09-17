import { getSettings, getDepartements, getFeaturedProgrammes, getCampus, getLatestPosts, getEvenements, getTestimonials, getPersonnes, getAlumni, getPartenaires, getGalleryImages } from "@/lib/data";
import { HeroSection, StatsBar, WhyChooseSection, DepartementsSection, ProgrammesSection, CampusSection, PreInscriptionCTA, NewsSection, EventsSection, TestimonialsSection, TeamSection, AlumniSection, GallerySection, PartnersSection } from "@/components/sections";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1800&q=80",
];

export default async function HomePage() {
  const [settings, departements, programmes, campus, posts, events, testimonials, team, alumni, partenaires, gallery] = await Promise.all([
    getSettings(),
    getDepartements(),
    getFeaturedProgrammes(9),
    getCampus(),
    getLatestPosts(3),
    getEvenements({ upcoming: true, take: 5 }),
    getTestimonials(6),
    getPersonnes().then((p) => p.filter((x) => x.isFeatured).slice(0, 4)),
    getAlumni({ featured: true, take: 6 }),
    getPartenaires(),
    getGalleryImages(),
  ]);

  const slides = [
    {
      label: `Rentrée ${settings.anneeAcademique}`,
      title: settings.heroTitle ?? "Construisez votre avenir dans les technologies de l'information",
      subtitle: settings.heroSubtitle ?? "Plus de 30 ans d'excellence en formation informatique, réseaux, télécoms et management.",
      image: HERO_IMAGES[0],
      cta: { label: settings.heroCtaLabel ?? "Pré-inscription en ligne", href: settings.heroCtaHref ?? "/pre-inscription" },
      cta2: { label: "Nos formations", href: "/programmes" },
    },
    {
      label: "Génie logiciel · Réseaux · Cybersécurité · Data & IA",
      title: "Des formations d'ingénieurs au cœur du numérique",
      subtitle: "Licences et Masters accrédités ANAQ-Sup et CAMES, laboratoires Cisco et Huawei, certifications internationales.",
      image: HERO_IMAGES[1],
      cta: { label: "Découvrir nos formations", href: "/programmes" },
      cta2: { label: "Nos départements", href: "/departements" },
    },
    {
      label: "9 campus · Sénégal & Mauritanie",
      title: "Une école de proximité, une reconnaissance internationale",
      subtitle: "Dakar, Keur Massar, Pikine, Kaolack, Kaffrine, Diourbel, Nouakchott, Nouadhibou : étudiez près de chez vous.",
      image: HERO_IMAGES[2],
      cta: { label: "Nos campus", href: "/campus" },
      cta2: { label: "Nous contacter", href: "/contact" },
    },
  ];

  return (
    <>
      <HeroSection slides={slides} videoUrl={settings.heroVideoUrl} />
      <StatsBar stats={{ annees: settings.statAnnees, etudiants: settings.statEtudiants, campus: settings.statCampus, programmes: settings.statProgrammes, insertion: settings.statInsertion, partenaires: settings.statPartenaires }} />
      <WhyChooseSection image="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80" videoUrl={settings.heroVideoUrl} annees={settings.statAnnees} />
      <DepartementsSection departements={departements.map((d) => ({ nom: d.nom, slug: d.slug, accroche: d.accroche, description: d.description, icone: d.icone, couleur: d.couleur, programmesCount: d._count.programmes }))} />
      <ProgrammesSection programmes={programmes.map((p) => ({ titre: p.titre, slug: p.slug, niveau: p.niveau, duree: p.duree, accroche: p.accroche, description: p.description, image: p.image, accreditation: p.accreditation, departement: p.departement, campus: p.campus }))} />
      <PreInscriptionCTA anneeAcademique={settings.anneeAcademique} phone={settings.phone2 ?? settings.phone} ouvertes={settings.inscriptionsOuvertes} image="https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=1800&q=80" />
      <CampusSection campus={campus.map((c) => ({ nom: c.nom, slug: c.slug, ville: c.ville, pays: c.pays, adresse: c.adresse, telephone: c.telephone, image: c.image, isSiege: c.isSiege, programmesCount: c._count.programmes }))} />
      <NewsSection posts={posts.map((p) => ({ titre: p.titre, slug: p.slug, extrait: p.extrait, image: p.image, publishedAt: p.publishedAt, tempsLecture: p.tempsLecture, categorie: p.categorie }))} />
      <EventsSection events={events.map((e) => ({ titre: e.titre, slug: e.slug, description: e.description, image: e.image, dateDebut: e.dateDebut, heure: e.heure, lieu: e.lieu, type: e.type }))} />
      <TestimonialsSection testimonials={testimonials} />
      <TeamSection members={team} />
      <AlumniSection alumni={alumni} />
      <GallerySection images={gallery} />
      <PartnersSection partenaires={partenaires} />
    </>
  );
}

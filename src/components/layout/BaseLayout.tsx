import { getNavigation, getSettings, getFeaturedProgrammes, getCampus, getGalleryImages } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";
import { Header, type NavItem } from "./Header";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import { WhatsAppButton } from "./WhatsAppButton";

export async function BaseLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, featured, campus, gallery] = await Promise.all([
    getSettings(),
    getNavigation(),
    getFeaturedProgrammes(4),
    getCampus(),
    getGalleryImages(),
  ]);

  const toNavItem = (item: Awaited<ReturnType<typeof getNavigation>>["header"][number]): NavItem => ({
    id: item.id,
    label: item.label,
    href: item.href,
    isExternal: item.isExternal,
    isMega: item.isMega,
    children: item.children.map((c) => ({ id: c.id, label: c.label, href: c.href, isExternal: c.isExternal, description: c.description })),
  });

  const headerNav: NavItem[] = nav.header.map(toNavItem);
  const topNav: NavItem[] = nav.topBar.map(toNavItem);

  /* Colonnes du méga-menu « Formations » : campus, formations phares, liens d'admission */
  const mega = [
    {
      title: "Campus",
      items: [{ label: "Nos campus", href: "/campus" }, ...campus.slice(0, 5).map((c) => ({ label: c.nom, href: `/campus/${c.slug}` }))],
    },
    {
      title: "Formations",
      items: [
        { label: "Toutes nos formations", href: "/formations" },
        ...featured.map((p) => ({ label: p.titre, href: `/formations/${p.slug}` })),
      ],
    },
    {
      title: "Autres",
      items: [
        { label: "Frais d'étude", href: "/frais-d-etudes" },
        { label: "Comment s'inscrire", href: "/preinscription" },
        { label: "Conditions d'admission", href: "/condition-admission" },
        { label: "S'inscrire", href: "/preinscription" },
      ],
    },
  ];

  const galerie = gallery.slice(0, 8).map((g) => g.src);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        nav={headerNav}
        topNav={topNav}
        mega={mega}
        megaImage={settings.ogImage ?? galerie[0] ?? null}
        megaImageLabel={`${new Intl.NumberFormat("fr-FR").format(settings.statEtudiants)}+ étudiants inscrits`}
        settings={{
          siteName: settings.siteName,
          logoUrl: settings.logoUrl,
          logoWhiteUrl: settings.logoWhiteUrl,
          tagline: settings.tagline,
          phone: settings.phone,
          email: settings.email,
          address: settings.address,
          annonceBandeau: settings.annonceBandeau,
          annonceLien: settings.annonceLien,
          heroCtaLabel: settings.heroCtaLabel,
          heroCtaHref: settings.heroCtaHref,
          galerie,
          facebook: settings.facebook,
          instagram: settings.instagram,
          linkedin: settings.linkedin,
          youtube: settings.youtube,
          twitter: settings.twitter,
          tiktok: settings.tiktok,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} footerNav={nav.footer} footerSecondary={nav.footerSecondary} galerie={galerie.slice(0, 4)} />
      <WhatsAppButton number={settings.whatsapp} />
      <BackToTop />
    </div>
  );
}

/** Étiquette lisible d'un niveau de formation (utilisée par le menu et les cartes). */
export const niveauLabel = (n: keyof typeof NIVEAU_LABELS) => NIVEAU_LABELS[n];

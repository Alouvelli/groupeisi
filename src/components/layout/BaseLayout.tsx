import { getNavigation, getSettings, getFeaturedProgrammes } from "@/lib/data";
import { Header, type NavItem } from "./Header";
import { Footer } from "./Footer";
import { BackToTop } from "./BackToTop";
import { WhatsAppButton } from "./WhatsAppButton";

export async function BaseLayout({ children }: { children: React.ReactNode }) {
  const [settings, nav, featured] = await Promise.all([getSettings(), getNavigation(), getFeaturedProgrammes(5)]);

  const headerNav: NavItem[] = nav.header.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    isExternal: item.isExternal,
    isMega: item.isMega,
    children: item.children.map((c) => ({ id: c.id, label: c.label, href: c.href, isExternal: c.isExternal, description: c.description })),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        nav={headerNav}
        settings={{
          siteName: settings.siteName,
          logoUrl: settings.logoUrl,
          phone: settings.phone,
          email: settings.email,
          horaires: settings.horaires,
          annonceBandeau: settings.annonceBandeau,
          annonceLien: settings.annonceLien,
          heroCtaLabel: settings.heroCtaLabel,
          heroCtaHref: settings.heroCtaHref,
          facebook: settings.facebook,
          instagram: settings.instagram,
          linkedin: settings.linkedin,
          youtube: settings.youtube,
          twitter: settings.twitter,
          tiktok: settings.tiktok,
        }}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} footerNav={nav.footer} footerSecondary={nav.footerSecondary} programmes={featured.map((p) => ({ titre: p.titre, slug: p.slug, niveau: p.niveau }))} />
      <WhatsAppButton number={settings.whatsapp} />
      <BackToTop />
    </div>
  );
}

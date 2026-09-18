"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, GraduationCap, Mail, MapPin, Menu, Phone, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SocialLinks, type Socials } from "@/components/ui/SocialLinks";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal: boolean;
  description?: string | null;
  isMega?: boolean;
  children?: NavItem[];
}

export interface HeaderProps {
  /** Menu principal (barre blanche) */
  nav: NavItem[];
  /** Liens de la barre supérieure bleue */
  topNav: NavItem[];
  /** Colonnes du méga-menu « Formations » */
  mega: { title: string; items: { label: string; href: string }[] }[];
  megaImage?: string | null;
  megaImageLabel?: string | null;
  settings: {
    siteName: string;
    logoUrl?: string | null;
    logoWhiteUrl?: string | null;
    tagline?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    annonceBandeau?: string | null;
    annonceLien?: string | null;
    heroCtaLabel?: string | null;
    heroCtaHref?: string | null;
    galerie?: string[];
  } & Socials;
}

export function Header({ nav, topNav, mega, megaImage, megaImageLabel, settings }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [offcanvas, setOffcanvas] = useState(false);
  const [search, setSearch] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOffcanvas(false);
    setSearch(false);
    setOpenSub(null);
  }, [pathname]);

  useEffect(() => {
    const locked = menuOpen || offcanvas;
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, offcanvas]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]));
  const ctaLabel = settings.heroCtaLabel ?? "Préinscription";
  const ctaHref = settings.heroCtaHref ?? "/preinscription";

  return (
    <header className="relative z-50">
      {/* Bandeau d'annonce (optionnel) */}
      {settings.annonceBandeau && (
        <div className="bg-secondary text-secondary-fg">
          <div className="container-x flex items-center justify-center gap-2 py-2 text-center text-[13px] font-medium sm:text-sm">
            <GraduationCap className="h-4 w-4 shrink-0" aria-hidden />
            <span>{settings.annonceBandeau}</span>
            {settings.annonceLien && (
              <Link href={settings.annonceLien} className="hidden items-center gap-1 underline underline-offset-4 sm:inline-flex">
                En savoir plus <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Barre supérieure bleue : accroche + liens utiles */}
      <div className="bg-primary text-white">
        <div className="container-x flex h-9 items-center justify-between gap-4">
          {settings.tagline && (
            <span className="inline-flex items-center gap-2 text-sm font-medium capitalize">
              <GraduationCap className="h-[18px] w-[18px] shrink-0" aria-hidden />
              <span className="truncate">{settings.tagline}</span>
            </span>
          )}
          <ul className="hidden items-center md:flex">
            {topNav.map((item, i) => (
              <li key={item.id} className={cn(i > 0 && "ml-3 border-l border-white/20 pl-3")}>
                <Link href={item.href} className="text-sm font-medium capitalize transition hover:text-white/65">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barre principale blanche : logo + menu + actions + CTA */}
      <div className={cn("sticky top-0 z-50 w-full bg-white transition-shadow duration-300", scrolled && "shadow-menu")}>
        <div className="container-x flex items-stretch justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center py-2" aria-label={`${settings.siteName} – Accueil`}>
            <Image
              src={settings.logoUrl || "/media/logo-isi.png"}
              alt={settings.siteName}
              width={220}
              height={90}
              priority
              className="h-14 w-auto sm:h-16 lg:h-[78px]"
            />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden items-stretch xl:flex" aria-label="Navigation principale">
            <ul className="flex items-stretch">
              {nav.map((item) => {
                const hasChildren = (item.children && item.children.length > 0) || item.isMega;
                return (
                  <li key={item.id} className="group relative flex items-stretch">
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-4 font-heading text-[15px] font-medium text-title transition group-hover:text-primary",
                        isActive(item.href) && item.href !== "#" && "text-primary",
                      )}
                    >
                      {item.label}
                      {hasChildren && <ChevronDown className="h-3.5 w-3.5 transition group-hover:rotate-180" aria-hidden />}
                    </Link>

                    {/* Méga-menu « Formations » */}
                    {item.isMega ? (
                      <div className="invisible absolute left-1/2 top-full z-50 w-[min(1180px,92vw)] -translate-x-1/2 translate-y-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="grid gap-8 rounded-b-lg bg-white p-8 shadow-menu ring-1 ring-line lg:grid-cols-[repeat(3,minmax(0,1fr))_260px]">
                          {mega.map((col) => (
                            <div key={col.title}>
                              <span className="section-label mb-4 text-[15px]">
                                <GraduationCap className="h-4 w-4 text-primary" aria-hidden /> {col.title}
                              </span>
                              <ul className="space-y-0.5">
                                {col.items.map((c) => (
                                  <li key={c.href + c.label} className="border-b border-line/70 last:border-0">
                                    <Link href={c.href} className="block py-2.5 text-[15px] text-body transition hover:text-primary">
                                      {c.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                          {megaImage && (
                            <div className="relative hidden overflow-hidden rounded-lg lg:block">
                              <Image src={megaImage} alt="" width={520} height={620} className="h-full w-full object-cover" />
                              {megaImageLabel && (
                                <span className="absolute inset-x-3 bottom-3 rounded bg-primary/90 px-3 py-2 text-center text-sm font-medium text-white">
                                  {megaImageLabel}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      hasChildren && (
                        <div className="invisible absolute left-0 top-full z-50 translate-y-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                          <ul className="w-[260px] rounded-b-lg bg-white py-1 shadow-menu ring-1 ring-line">
                            {item.children!.map((c) => (
                              <li key={c.id} className="border-b border-line/75 last:border-0">
                                <Link href={c.href} className="block px-5 py-3 text-[15px] text-body transition hover:text-primary">
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSearch((v) => !v)}
              aria-label="Rechercher"
              aria-expanded={search}
              className="hidden h-9 w-9 items-center justify-center text-title transition hover:text-primary sm:inline-flex"
            >
              {search ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <span className="hidden h-6 w-px bg-black/15 sm:block" aria-hidden />
            <button
              type="button"
              onClick={() => setOffcanvas(true)}
              aria-label="Ouvrir le panneau latéral"
              className="hidden h-9 w-9 items-center justify-center text-title transition hover:text-primary lg:inline-flex"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link
              href={ctaHref}
              className="hidden items-center gap-2.5 self-stretch bg-primary px-7 font-heading text-[15px] font-medium text-white transition hover:bg-secondary hover:text-secondary-fg lg:inline-flex"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-title/80 text-title xl:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Champ de recherche déroulant */}
        <AnimatePresence>
          {search && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute inset-x-0 top-full border-t border-line bg-white shadow-menu"
            >
              <form action="/actualites" className="container-x flex items-center gap-3 py-4">
                <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
                <input
                  type="search"
                  name="q"
                  placeholder="Rechercher une formation, une actualité…"
                  aria-label="Rechercher sur le site"
                  className="h-11 w-full border-0 bg-transparent text-[15px] outline-none placeholder:text-muted"
                />
                <Button type="submit" size="sm">
                  Rechercher
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-dark/60 xl:hidden"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col bg-white xl:hidden"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <Image src={settings.logoUrl || "/media/logo-isi.png"} alt={settings.siteName} width={160} height={60} className="h-12 w-auto" />
                <button type="button" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" className="text-title">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-5 py-4" aria-label="Navigation mobile">
                <ul className="divide-y divide-line">
                  {nav.map((item) => {
                    const children: { id: string; label: string; href: string }[] = item.isMega
                      ? mega.flatMap((c) => c.items.map((i) => ({ id: c.title + i.href + i.label, label: i.label, href: i.href })))
                      : (item.children ?? []).map((c) => ({ id: c.id, label: c.label, href: c.href }));
                    const hasChildren = children.length > 0;
                    return (
                      <li key={item.id} className="py-1">
                        <div className="flex items-center justify-between">
                          <Link href={item.href} className="block py-2.5 font-heading text-base font-medium text-title">
                            {item.label}
                          </Link>
                          {hasChildren && (
                            <button
                              type="button"
                              onClick={() => setOpenSub((v) => (v === item.id ? null : item.id))}
                              aria-label={`Afficher le sous-menu ${item.label}`}
                              aria-expanded={openSub === item.id}
                              className="p-2 text-title"
                            >
                              <ChevronDown className={cn("h-4 w-4 transition", openSub === item.id && "rotate-180")} />
                            </button>
                          )}
                        </div>
                        {hasChildren && openSub === item.id && (
                          <ul className="mb-2 space-y-1 border-l border-line pl-4">
                            {children.map((c) => (
                              <li key={c.id}>
                                <Link href={c.href} className="block py-2 text-[15px] text-body">
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="border-t border-line p-5">
                <Button href={ctaHref} className="w-full" arrow>
                  {ctaLabel}
                </Button>
                <div className="mt-4 space-y-2 text-sm text-body">
                  {settings.phone && (
                    <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" /> {settings.phone}
                    </a>
                  )}
                  {settings.email && (
                    <a href={`mailto:${settings.email}`} className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" /> {settings.email}
                    </a>
                  )}
                </div>
                <SocialLinks socials={settings} className="mt-4" itemClassName="bg-primary text-white" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Panneau latéral (offcanvas) du thème : logo, galerie, contact rapide, réseaux */}
      <AnimatePresence>
        {offcanvas && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOffcanvas(false)}
              className="fixed inset-0 z-[60] bg-dark/60"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 right-0 z-[70] w-[92%] max-w-md overflow-y-auto bg-primary px-8 py-7 text-white"
            >
              <div className="flex items-start justify-between">
                <Image
                  src={settings.logoWhiteUrl || "/media/sans-titre-1920-x-813-px-135-x-46-px-3.png"}
                  alt={settings.siteName}
                  width={200}
                  height={70}
                  className="h-12 w-auto"
                />
                <button type="button" onClick={() => setOffcanvas(false)} aria-label="Fermer le panneau" className="text-white/90">
                  <X className="h-7 w-7" />
                </button>
              </div>

              {settings.galerie && settings.galerie.length > 0 && (
                <div className="mt-8 grid grid-cols-3 gap-2.5">
                  {settings.galerie.slice(0, 6).map((src) => (
                    <Image key={src} src={src} alt="" width={150} height={150} className="aspect-square w-full rounded object-cover" />
                  ))}
                </div>
              )}

              <p className="mt-9 font-heading text-lg font-semibold text-white">Contact rapide :</p>
              <ul className="mt-4 space-y-3 text-[15px] text-white/85">
                {settings.phone && (
                  <li>
                    <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 transition hover:text-secondary">
                      <Phone className="h-4 w-4 shrink-0 text-secondary" /> {settings.phone}
                    </a>
                  </li>
                )}
                {settings.email && (
                  <li>
                    <a href={`mailto:${settings.email}`} className="flex items-center gap-3 transition hover:text-secondary">
                      <Mail className="h-4 w-4 shrink-0 text-secondary" /> {settings.email}
                    </a>
                  </li>
                )}
                {settings.address && (
                  <li className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 shrink-0 text-secondary" /> {settings.address}
                  </li>
                )}
              </ul>

              <p className="mt-8 font-heading text-lg font-semibold text-white">Suivez nous :</p>
              <SocialLinks socials={settings} className="mt-3" itemClassName="bg-white/10 text-white hover:bg-secondary hover:text-secondary-fg" withLabels />

              <Button href={ctaHref} variant="secondary" className="mt-9 w-full" arrow>
                {ctaLabel}
              </Button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

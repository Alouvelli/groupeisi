"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Clock, Mail, Menu, Phone, X, ArrowRight, Megaphone } from "lucide-react";
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
  nav: NavItem[];
  settings: {
    siteName: string;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    horaires?: string | null;
    annonceBandeau?: string | null;
    annonceLien?: string | null;
    heroCtaLabel?: string | null;
    heroCtaHref?: string | null;
  } & Socials;
}

export function Header({ nav, settings }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setOpenSub(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]));

  return (
    <header className="relative z-50">
      {/* Bandeau d'annonce */}
      {settings.annonceBandeau && (
        <div className="bg-secondary text-white">
          <div className="container-x flex items-center justify-center gap-2 py-2 text-center text-xs font-semibold sm:text-sm">
            <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
            <span>{settings.annonceBandeau}</span>
            {settings.annonceLien && (
              <Link href={settings.annonceLien} className="hidden items-center gap-1 underline underline-offset-4 sm:inline-flex">
                En savoir plus <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="hidden bg-primary-dark text-white/85 lg:block">
        <div className="container-x flex h-10 items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 hover:text-white">
                <Phone className="h-3.5 w-3.5 text-accent" /> {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 hover:text-white">
                <Mail className="h-3.5 w-3.5 text-accent" /> {settings.email}
              </a>
            )}
            {settings.horaires && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-accent" /> {settings.horaires}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/alumni" className="hover:text-white">
              Alumni
            </Link>
            <Link href="/telechargements" className="hover:text-white">
              Téléchargements
            </Link>
            <Link href="/faq" className="hover:text-white">
              FAQ
            </Link>
            <span className="h-4 w-px bg-white/20" aria-hidden />
            <SocialLinks socials={settings} itemClassName="h-7 w-7 text-white/80" />
          </div>
        </div>
      </div>

      {/* Barre principale */}
      <div className={cn("sticky top-0 z-50 w-full bg-white transition-all duration-300", scrolled ? "shadow-lg shadow-primary/5" : "border-b border-line")}>
        <div className={cn("container-x flex items-center justify-between transition-all", scrolled ? "h-16 lg:h-[72px]" : "h-[72px] lg:h-[88px]")}>
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${settings.siteName} – Accueil`}>
            <Image src={settings.logoUrl || "/images/logo-isi.svg"} alt={settings.siteName} width={200} height={58} priority className="h-11 w-auto sm:h-12 lg:h-14" />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden items-center lg:flex" aria-label="Navigation principale">
            <ul className="flex items-center gap-1">
              {nav.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                return (
                  <li key={item.id} className="group relative">
                    <Link
                      href={item.href}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-[15px] font-semibold text-primary transition hover:bg-primary-50 hover:text-secondary",
                        isActive(item.href) && "text-secondary",
                      )}
                    >
                      {item.label}
                      {hasChildren && <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" aria-hidden />}
                    </Link>
                    {hasChildren && (
                      <div className="invisible absolute left-0 top-full z-50 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                        <div className={cn("overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-card", item.isMega ? "w-[560px] grid grid-cols-2" : "w-72")}>
                          {item.children!.map((c) => (
                            <Link key={c.id} href={c.href} className="flex flex-col rounded-xl px-4 py-3 transition hover:bg-primary-50">
                              <span className="text-sm font-bold text-primary">{c.label}</span>
                              {c.description && <span className="mt-0.5 text-xs text-muted">{c.description}</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <Button href={settings.heroCtaHref || "/pre-inscription"} variant="secondary" size="md" className="hidden md:inline-flex">
              {settings.heroCtaLabel || "Pré-inscription"}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button type="button" onClick={() => setOpen(true)} aria-label="Ouvrir le menu" aria-expanded={open} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-primary hover:bg-primary-50 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-dark/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
              aria-label="Menu mobile"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <Image src={settings.logoUrl || "/images/logo-isi.svg"} alt={settings.siteName} width={160} height={46} className="h-10 w-auto" />
                <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="rounded-full p-2 text-primary hover:bg-primary-50">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  {nav.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const expanded = openSub === item.id;
                    return (
                      <li key={item.id}>
                        <div className="flex items-center">
                          <Link href={item.href} className={cn("flex-1 rounded-xl px-4 py-3 text-base font-bold text-primary", isActive(item.href) && "text-secondary")}>
                            {item.label}
                          </Link>
                          {hasChildren && (
                            <button type="button" onClick={() => setOpenSub(expanded ? null : item.id)} aria-label={`Afficher le sous-menu ${item.label}`} aria-expanded={expanded} className="rounded-full p-2 text-primary">
                              <ChevronDown className={cn("h-5 w-5 transition", expanded && "rotate-180")} />
                            </button>
                          )}
                        </div>
                        <AnimatePresence initial={false}>
                          {hasChildren && expanded && (
                            <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-4">
                              {item.children!.map((c) => (
                                <li key={c.id}>
                                  <Link href={c.href} className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-primary-50 hover:text-primary">
                                    {c.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              <div className="space-y-3 border-t border-line p-5">
                <Button href={settings.heroCtaHref || "/pre-inscription"} variant="secondary" className="w-full">
                  {settings.heroCtaLabel || "Pré-inscription en ligne"} <ArrowRight className="h-4 w-4" />
                </Button>
                {settings.phone && (
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                    <Phone className="h-4 w-4 text-secondary" /> {settings.phone}
                  </a>
                )}
                <SocialLinks socials={settings} className="justify-center" itemClassName="bg-primary-50 text-primary" />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

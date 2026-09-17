import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from "lucide-react";
import type { SiteSettings, NavigationItem } from "@prisma/client";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { NIVEAU_LABELS } from "@/lib/constants";

interface FooterProps {
  settings: SiteSettings;
  footerNav: NavigationItem[];
  footerSecondary: NavigationItem[];
  programmes: { titre: string; slug: string; niveau: keyof typeof NIVEAU_LABELS }[];
}

export function Footer({ settings, footerNav, footerSecondary, programmes }: FooterProps) {
  return (
    <footer className="relative bg-primary-dark text-white/80">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      {/* Newsletter */}
      <div className="relative border-b border-white/10">
        <Container className="flex flex-col items-center justify-between gap-6 py-10 lg:flex-row">
          <div>
            <h3 className="font-heading text-2xl font-extrabold text-white">Restez informé de nos actualités</h3>
            <p className="mt-1 text-sm text-white/70">Admissions, événements, journées portes ouvertes : recevez nos nouvelles directement par email.</p>
          </div>
          <NewsletterForm source="footer" />
        </Container>
      </div>

      <Container className="relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12">
        {/* À propos */}
        <div className="lg:col-span-4">
          <Image src={settings.logoWhiteUrl || "/images/logo-isi-white.svg"} alt={settings.siteName} width={200} height={58} className="h-14 w-auto" />
          <p className="mt-5 text-sm leading-relaxed text-white/70">{settings.description}</p>
          <SocialLinks socials={settings} className="mt-6" itemClassName="bg-white/10 text-white" />
        </div>

        {/* Liens rapides */}
        <div className="lg:col-span-2">
          <h4 className="mb-5 font-heading text-base font-bold uppercase tracking-wider text-white">Liens rapides</h4>
          <ul className="space-y-2.5 text-sm">
            {footerNav.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="inline-flex items-center gap-1.5 transition hover:text-accent">
                  <span className="h-1 w-1 rounded-full bg-secondary" aria-hidden /> {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Formations */}
        <div className="lg:col-span-3">
          <h4 className="mb-5 font-heading text-base font-bold uppercase tracking-wider text-white">Formations phares</h4>
          <ul className="space-y-2.5 text-sm">
            {programmes.map((p) => (
              <li key={p.slug}>
                <Link href={`/programmes/${p.slug}`} className="inline-flex items-center gap-1.5 transition hover:text-accent">
                  <span className="h-1 w-1 rounded-full bg-secondary" aria-hidden /> {p.titre}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/programmes" className="inline-flex items-center gap-1 font-bold text-accent hover:underline">
                Toutes les formations <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <h4 className="mb-5 font-heading text-base font-bold uppercase tracking-wider text-white">Contact</h4>
          <ul className="space-y-3.5 text-sm">
            {settings.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> <span>{settings.address}</span>
              </li>
            )}
            {settings.phone && (
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>
                  <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:text-accent">{settings.phone}</a>
                  {settings.phone2 && (
                    <>
                      <br />
                      <a href={`tel:${settings.phone2.replace(/\s/g, "")}`} className="hover:text-accent">{settings.phone2}</a>
                    </>
                  )}
                </span>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${settings.email}`} className="hover:text-accent">{settings.email}</a>
              </li>
            )}
            {settings.horaires && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> <span>{settings.horaires}</span>
              </li>
            )}
          </ul>
        </div>
      </Container>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {settings.siteName} – Institut Supérieur d&apos;Informatique. Tous droits réservés.</p>
          <ul className="flex flex-wrap items-center gap-4">
            {footerSecondary.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}

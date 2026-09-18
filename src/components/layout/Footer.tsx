import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings, NavigationItem } from "@prisma/client";
import { Container } from "@/components/ui/Container";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

interface FooterProps {
  settings: SiteSettings;
  footerNav: NavigationItem[];
  footerSecondary: NavigationItem[];
  /** Bande d'images « Découvrir la vie au sein de notre campus » */
  galerie?: string[];
}

/**
 * Pied de page du thème Univet : bande de 4 photos avec bouton centré,
 * panneau logo à gauche, coordonnées, réseaux sociaux, colonnes de liens
 * et formulaire d'inscription à la newsletter.
 */
export function Footer({ settings, footerNav, footerSecondary, galerie = [] }: FooterProps) {
  const institut = footerNav.slice(0, 3);
  const liens = footerNav.slice(3, 6);

  return (
    <>
      {/* Bande galerie + bouton */}
      {galerie.length >= 4 && (
        <section className="relative">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {galerie.slice(0, 4).map((src, i) => (
              <div key={src + i} className="relative aspect-[4/3] overflow-hidden lg:aspect-[16/11]">
                <Image src={src} alt="" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Link
              href="/galerie"
              className="rs-button bg-primary/95 px-8 text-center font-heading uppercase tracking-wide text-white backdrop-blur transition hover:bg-secondary hover:text-secondary-fg"
            >
              Découvrir la vie au sein de notre campus
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      )}

      <footer className="bg-primary text-white/80">
        <div className="grid lg:grid-cols-[360px_1fr]">
          {/* Panneau logo */}
          <div className="flex items-center justify-center bg-steel/25 px-10 py-14">
            <Image
              src={settings.logoFooterUrl || settings.logoWhiteUrl || "/media/plan-de-travail-1.png"}
              alt={settings.siteName}
              width={300}
              height={160}
              className="h-auto w-[220px]"
            />
          </div>

          <div className="px-6 py-14 sm:px-10 lg:px-14">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_repeat(3,minmax(0,1fr))]">
              {/* Coordonnées + réseaux */}
              <div className="space-y-6">
                <ul className="space-y-5 text-[15px]">
                  {settings.email && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Mail className="h-4 w-4 text-secondary" aria-hidden />
                      </span>
                      <span>
                        <span className="block font-heading text-[15px] font-semibold text-white">Email :</span>
                        <a href={`mailto:${settings.email}`} className="transition hover:text-secondary">
                          {settings.email}
                        </a>
                      </span>
                    </li>
                  )}
                  {settings.phone && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <Phone className="h-4 w-4 text-secondary" aria-hidden />
                      </span>
                      <span>
                        <span className="block font-heading text-[15px] font-semibold text-white">Téléphone :</span>
                        <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="transition hover:text-secondary">
                          {settings.phone}
                        </a>
                        {settings.phone2 && (
                          <>
                            {" · "}
                            <a href={`tel:${settings.phone2.replace(/[^+\d]/g, "")}`} className="transition hover:text-secondary">
                              {settings.phone2}
                            </a>
                          </>
                        )}
                      </span>
                    </li>
                  )}
                  {settings.address && (
                    <li className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <MapPin className="h-4 w-4 text-secondary" aria-hidden />
                      </span>
                      <span>
                        <span className="block font-heading text-[15px] font-semibold text-white">Adresse :</span>
                        {settings.address}
                      </span>
                    </li>
                  )}
                </ul>
                <div>
                  <span className="mb-3 block text-[15px]">Réseaux Sociaux :</span>
                  <SocialLinks socials={settings} shape="square" itemClassName="bg-white/10 text-white" />
                </div>
              </div>

              {/* Colonne « Notre institut » */}
              <div>
                <h4 className="mb-6 font-heading text-xl font-semibold text-white">Notre institut</h4>
                <ul className="space-y-3 text-[15px]">
                  {institut.map((item) => (
                    <li key={item.id}>
                      <Link href={item.href} className="transition hover:text-secondary">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Colonne « Liens utiles » */}
              <div>
                <h4 className="mb-6 font-heading text-xl font-semibold text-white">Liens utiles</h4>
                <ul className="space-y-3 text-[15px]">
                  {liens.map((item) => (
                    <li key={item.id}>
                      <Link href={item.href} className="transition hover:text-secondary">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Newsletter */}
              <div>
                <h4 className="mb-6 font-heading text-xl font-semibold text-white">Newsletter</h4>
                <NewsletterForm source="footer" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <Container className="flex flex-col items-center justify-between gap-3 py-5 text-sm text-white/70 sm:flex-row">
            <p>
              © {new Date().getFullYear()} {settings.siteName}. Tous droits réservés
            </p>
            {footerSecondary.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-4">
                {footerSecondary.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Container>
        </div>
      </footer>
    </>
  );
}

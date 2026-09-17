import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { getSettings, getCampus } from "@/lib/data";

export const metadata: Metadata = { title: "Contact", description: "Contactez le Groupe ISI : adresse, téléphone, email, formulaire de contact et coordonnées de nos 9 campus." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sujet?: string }> }) {
  const { sujet } = await searchParams;
  const [settings, campus] = await Promise.all([getSettings(), getCampus()]);
  const siege = campus.find((c) => c.isSiege) ?? campus[0];
  const mapUrl = siege?.latitude && siege?.longitude ? `https://www.google.com/maps?q=${siege.latitude},${siege.longitude}&z=15&output=embed` : `https://www.google.com/maps?q=${encodeURIComponent(settings.address ?? "Dakar")}&output=embed`;
  return (
    <>
      <PageHeader title="Contactez-nous" subtitle="Une question sur nos formations, les admissions ou un partenariat ? Notre équipe vous répond rapidement." items={[{ label: "Contact" }]} />
      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionHeading label="Écrivez-nous" title="Envoyez-nous un message" align="left" />
            <ContactForm defaultSujet={sujet} />
          </div>
          <aside className="space-y-6 lg:col-span-2">
            <div className="rounded-card bg-primary p-7 text-white shadow-card">
              <h3 className="text-xl font-extrabold text-white">Siège – Dakar</h3>
              <ul className="mt-5 space-y-4 text-sm">
                {settings.address && <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {settings.address}</li>}
                {settings.phone && <li className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> <span><a href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a>{settings.phone2 && <><br /><a href={`tel:${settings.phone2.replace(/\s/g, "")}`}>{settings.phone2}</a></>}</span></li>}
                {settings.email && <li className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> <span><a href={`mailto:${settings.email}`}>{settings.email}</a>{settings.emailAdmissions && <><br /><a href={`mailto:${settings.emailAdmissions}`}>{settings.emailAdmissions}</a></>}</span></li>}
                {settings.horaires && <li className="flex gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {settings.horaires}</li>}
              </ul>
              {settings.whatsapp && <a href={`https://wa.me/${settings.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-sm font-bold text-white hover:opacity-90"><MessageCircle className="h-4 w-4" /> Discuter sur WhatsApp</a>}
              <SocialLinks socials={settings} className="mt-5" itemClassName="bg-white/10 text-white" />
            </div>
            <div className="overflow-hidden rounded-card border border-line"><iframe title="Carte du siège" src={mapUrl} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></div>
          </aside>
        </div>
      </Section>
      <Section variant="surface" padding="lg">
        <SectionHeading label="Nos campus" title="Coordonnées de tous les campus" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campus.map((c) => (
            <Link key={c.id} href={`/campus/${c.slug}`} className="group rounded-card border border-line bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
              <h3 className="font-extrabold text-primary group-hover:text-secondary">{c.nom}</h3>
              <p className="mt-2 flex gap-2 text-sm text-muted"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {c.adresse}, {c.ville}</p>
              {c.telephone && <p className="mt-1 flex gap-2 text-sm text-muted"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {c.telephone}</p>}
              {c.email && <p className="mt-1 flex gap-2 text-sm text-muted"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {c.email}</p>}
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}

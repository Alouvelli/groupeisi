import type { Metadata } from "next";
import { Briefcase, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSettings, getCampus } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez le Groupe ISI : email, téléphone, adresse du siège à Dakar et coordonnées de tous nos campus.",
};

export default async function ContactPage() {
  const [settings, campus] = await Promise.all([getSettings(), getCampus()]);

  const blocs = [
    { titre: "Contact Email", icone: Mail, lignes: [{ label: settings.email ?? "", href: `mailto:${settings.email}` }] },
    {
      titre: "Téléphone",
      icone: Phone,
      lignes: [
        { label: settings.phone ?? "", href: `tel:${(settings.phone ?? "").replace(/[^+\d]/g, "")}` },
        ...(settings.phone2 ? [{ label: settings.phone2, href: `tel:${settings.phone2.replace(/[^+\d]/g, "")}` }] : []),
      ],
    },
    { titre: "Adresse", icone: MapPin, lignes: [{ label: settings.address ?? "", href: null }] },
    {
      titre: "Carrière",
      icone: Briefcase,
      lignes: [
        { label: "coip@groupeisi.com", href: "mailto:coip@groupeisi.com" },
        { label: "+221 76 450 83 97", href: "tel:+221764508397" },
      ],
    },
  ];

  return (
    <>
      <PageHeader title="Contact" items={[{ label: "Contact" }]} image="/media/img-9163.jpg" />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-4">
            {blocs.map(({ titre, icone: Icon, lignes }) => (
              <div key={titre} className="rounded-lg border border-line bg-white p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <h3 className="mt-5 font-heading text-[20px] font-semibold text-dark">{titre}</h3>
                <ul className="mt-3 space-y-1.5 text-[15px] text-body">
                  {lignes.map((l) => (
                    <li key={l.label}>
                      {l.href ? (
                        <a href={l.href} className="break-words transition hover:text-primary">
                          {l.label}
                        </a>
                      ) : (
                        l.label
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionLabel>Formulaire</SectionLabel>
              <h2 className="section-title mb-8">Entrer en contact</h2>
              <ContactForm />
            </div>
            <div className="overflow-hidden rounded-lg border border-line">
              <iframe
                src="https://maps.google.com/maps?q=Institut%20Sup%C3%A9rieur%20d%27Informatique&t=m&z=15&output=embed&iwloc=near"
                title="Carte du siège du Groupe ISI"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[460px] w-full border-0"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 lg:py-[100px]">
        <Container>
          <h2 className="section-title mb-10">Tous nos campus</h2>
          <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
            {campus.map((c) => (
              <div key={c.id} className="rounded-lg border border-line bg-white p-6">
                <h3 className="font-heading text-[18px] font-semibold text-dark">{c.nom}</h3>
                <ul className="mt-3 space-y-2 text-[15px] text-body">
                  <li className="flex gap-2.5">
                    <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /> {c.adresse}
                  </li>
                  {c.telephone && (
                    <li className="flex gap-2.5">
                      <Phone className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <a href={`tel:${c.telephone.replace(/[^+\d]/g, "")}`} className="transition hover:text-primary">
                        {c.telephone}
                      </a>
                    </li>
                  )}
                  {c.email && (
                    <li className="flex gap-2.5">
                      <Mail className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <a href={`mailto:${c.email}`} className="break-all transition hover:text-primary">
                        {c.email}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

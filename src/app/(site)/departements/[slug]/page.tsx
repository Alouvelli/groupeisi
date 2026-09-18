import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarCheck, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { getDepartementBySlug, getSettings } from "@/lib/data";
import { NIVEAU_LABELS } from "@/lib/constants";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDepartementBySlug(slug);
  if (!d) return { title: "Département introuvable" };
  return {
    title: d.seoTitle ?? d.nom,
    description: d.seoDescription ?? d.description.slice(0, 160),
    alternates: { canonical: `/departements/${d.slug}` },
  };
}

export default async function DepartementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [departement, settings] = await Promise.all([getDepartementBySlug(slug), getSettings()]);
  if (!departement) notFound();

  const parNiveau = departement.programmes.reduce<Record<string, typeof departement.programmes>>((acc, p) => {
    (acc[p.niveau] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <PageHeader title={departement.nom} items={[{ label: "Nos formations", href: "/formations" }, { label: departement.nom }]} image={departement.image} />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
            <div>
              <SectionLabel>Département</SectionLabel>
              <h2 className="section-title">{departement.nom}</h2>
              <p className="mt-5 text-base leading-7 text-body">{departement.description}</p>
              {departement.contenu && <div className="prose-isi mt-6" dangerouslySetInnerHTML={{ __html: departement.contenu }} />}
              <div className="mt-8 overflow-hidden rounded-lg">
                <Image src={departement.image || "/media/mg-0002-cr3-at-2025-at-2025-copie.jpg"} alt="" width={1000} height={620} className="h-auto w-full object-cover" />
              </div>
            </div>

            <aside className="rounded-lg bg-primary p-8 text-white lg:sticky lg:top-28">
              <p className="font-heading text-[18px] font-semibold text-white">Besoin d&apos;informations ? Contactez-nous</p>
              <a
                href={`tel:${(departement.telephone ?? settings.phone ?? "").replace(/[^+\d]/g, "")}`}
                className="mt-4 block font-heading text-[24px] font-semibold text-secondary"
              >
                {departement.telephone ?? settings.phone}
              </a>
              <a href={`mailto:${departement.email ?? settings.email}`} className="mt-2 block text-[15px] text-white/85 hover:text-secondary">
                {departement.email ?? settings.email}
              </a>
              <ul className="mt-6 space-y-3 text-[15px] text-white/85">
                <li className="flex gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden /> Du lundi au vendredi, 8h – 18h
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden /> Réponse sous 48 h ouvrées
                </li>
              </ul>
              <Button href={`mailto:${departement.email ?? settings.email}`} variant="secondary" className="mt-7 w-full">
                <CalendarCheck className="h-4 w-4" aria-hidden /> Prendre rendez-vous
              </Button>
            </aside>
          </div>
        </Container>
      </section>

      <section className="bg-surface py-16 lg:py-[100px]">
        <Container>
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Nos Formations</SectionLabel>
            <h2 className="section-title">Les formations du département</h2>
          </div>

          {Object.entries(parNiveau).map(([niveau, items]) => (
            <div key={niveau} className="mb-14 last:mb-0">
              <h3 className="mb-6 font-heading text-[24px] font-semibold text-dark">{NIVEAU_LABELS[niveau as keyof typeof NIVEAU_LABELS]}</h3>
              <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProgramCard
                    key={p.id}
                    variant="tile"
                    titre={p.titre}
                    slug={p.slug}
                    niveau={p.niveau}
                    duree={p.duree}
                    accroche={p.accroche}
                    description={p.description}
                    image={p.image}
                    campus={p.campus}
                  />
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>

      {departement.personnes.length > 0 && (
        <section className="bg-white py-16 lg:py-[100px]">
          <Container>
            <h2 className="section-title mb-10">L&apos;équipe pédagogique</h2>
            <div className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3">
              {departement.personnes.map((p) => (
                <TeamCard
                  key={p.id}
                  prenom={p.prenom}
                  nom={p.nom}
                  slug={p.slug}
                  poste={p.poste}
                  photo={p.photo}
                  email={p.email}
                  telephone={p.telephone}
                  linkedin={p.linkedin}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

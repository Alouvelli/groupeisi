import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MapPin, Phone, Mail, ArrowRight, CheckCircle2, Navigation } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgramCard } from "@/components/cards/ProgramCard";
import { TeamCard } from "@/components/cards/TeamCard";
import { EventCard } from "@/components/cards/EventCard";
import { GalleryGrid } from "@/components/sections/GallerySection";
import { getCampusBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCampusBySlug(slug);
  if (!c) return { title: "Campus introuvable" };
  return { title: c.nom, description: c.description, openGraph: { images: c.image ? [c.image] : undefined } };
}

export default async function CampusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = await getCampusBySlug(slug);
  if (!c) notFound();
  const mapUrl = c.mapEmbedUrl ?? (c.latitude && c.longitude ? `https://www.google.com/maps?q=${c.latitude},${c.longitude}&z=15&output=embed` : `https://www.google.com/maps?q=${encodeURIComponent(`${c.adresse}, ${c.ville}, ${c.pays}`)}&output=embed`);
  const gallery = [c.image, ...c.images].filter(Boolean).map((src) => ({ src: src as string, alt: c.nom }));

  return (
    <>
      <PageHeader title={c.nom} subtitle={`${c.ville}, ${c.pays}`} items={[{ label: "Campus", href: "/campus" }, { label: c.nom }]} image={c.image} />
      <Section padding="lg">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {c.isSiege && <Badge variant="secondary" className="mb-4">Siège du groupe</Badge>}
            <h2 className="section-title">{c.description}</h2>
            {c.contenu && <div className="prose-isi mt-6" dangerouslySetInnerHTML={{ __html: c.contenu }} />}
            {c.equipements.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-extrabold text-primary">Équipements et services</h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">{c.equipements.map((e) => <li key={e} className="flex items-center gap-2 rounded-xl bg-surface p-3 text-sm font-semibold text-slate-700"><CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" /> {e}</li>)}</ul>
              </div>
            )}
            {gallery.length > 1 && (
              <div className="mt-10">
                <h3 className="mb-4 text-xl font-extrabold text-primary">Le campus en images</h3>
                <GalleryGrid images={gallery} columns={3} />
              </div>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card border border-line bg-white p-6 shadow-soft">
              <h3 className="text-lg font-extrabold text-primary">Coordonnées</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <span>{c.adresse}<br />{c.ville}, {c.pays}</span></li>
                {c.telephone && <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <a href={`tel:${c.telephone.replace(/\s/g, "")}`} className="hover:text-secondary">{c.telephone}</a></li>}
                {c.email && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <a href={`mailto:${c.email}`} className="hover:text-secondary">{c.email}</a></li>}
              </ul>
              <Button href={`/pre-inscription?campus=${c.id}`} variant="secondary" className="mt-6 w-full">Se pré-inscrire sur ce campus <ArrowRight className="h-4 w-4" /></Button>
              <Button href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${c.adresse}, ${c.ville}`)}`} external variant="outline" className="mt-2 w-full"><Navigation className="h-4 w-4" /> Itinéraire</Button>
            </div>
            <div className="overflow-hidden rounded-card border border-line">
              <iframe title={`Carte ${c.nom}`} src={mapUrl} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </aside>
        </div>
      </Section>

      <Section variant="surface" padding="lg">
        <SectionHeading label="Formations" title={`Formations proposées à ${c.ville}`} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {c.programmes.map((p) => (
            <ProgramCard key={p.id} titre={p.titre} slug={p.slug} niveau={p.niveau} duree={p.duree} accroche={p.accroche} description={p.description} image={p.image} accreditation={p.accreditation} departement={p.departement} compact />
          ))}
        </div>
      </Section>

      {(c.personnes.length > 0 || c.evenements.length > 0) && (
        <Section padding="lg">
          <div className="grid gap-12 lg:grid-cols-2">
            {c.personnes.length > 0 && (
              <div>
                <SectionHeading label="Équipe" title="L'équipe du campus" align="left" />
                <div className="grid grid-cols-2 gap-4">{c.personnes.slice(0, 4).map((p) => <TeamCard key={p.id} prenom={p.prenom} nom={p.nom} slug={p.slug} poste={p.poste} photo={p.photo} email={p.email} linkedin={p.linkedin} />)}</div>
              </div>
            )}
            {c.evenements.length > 0 && (
              <div>
                <SectionHeading label="Agenda" title="Événements sur ce campus" align="left" />
                <div className="space-y-4">{c.evenements.map((e) => <EventCard key={e.id} titre={e.titre} slug={e.slug} description={e.description} dateDebut={e.dateDebut} heure={e.heure} lieu={e.lieu} type={e.type} variant="row" />)}</div>
              </div>
            )}
          </div>
        </Section>
      )}
      {c.image && <div className="relative h-72"><Image src={c.image} alt={c.nom} fill sizes="100vw" className="object-cover" /><div className="absolute inset-0 bg-primary/70" /><div className="container-x relative flex h-full items-center justify-between text-white"><h2 className="text-2xl font-extrabold text-white sm:text-3xl">Envie de rejoindre {c.nom} ?</h2><Button href="/pre-inscription" variant="secondary">Pré-inscription</Button></div></div>}
    </>
  );
}

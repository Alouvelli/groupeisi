import type { Metadata } from "next";
import { Users, Briefcase, Globe2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { AlumniCard } from "@/components/cards/AlumniCard";
import { getAlumni, getSettings } from "@/lib/data";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Alumni", description: "Le réseau des anciens étudiants du Groupe ISI : parcours, témoignages et réussites professionnelles." };

export default async function AlumniPage() {
  const [alumni, settings] = await Promise.all([getAlumni(), getSettings()]);
  return (
    <>
      <PageHeader title="Réseau Alumni" subtitle={`Plus de ${formatNumber(settings.statEtudiants)} diplômés dans les entreprises et institutions du Sénégal, d'Afrique et du monde.`} items={[{ label: "L'École" }, { label: "Alumni" }]} image="https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=1800&q=80" />
      <Section padding="md">
        <div className="grid gap-6 sm:grid-cols-3">
          {[{ Icon: Users, v: `${formatNumber(settings.statEtudiants)}+`, l: "Diplômés depuis 1994" }, { Icon: Briefcase, v: `${settings.statInsertion} %`, l: "Insertion professionnelle à 6 mois" }, { Icon: Globe2, v: "15+", l: "Pays où travaillent nos alumni" }].map((s) => (
            <div key={s.l} className="flex items-center gap-4 rounded-card border border-line bg-white p-6 shadow-soft"><span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary-50 text-secondary"><s.Icon className="h-7 w-7" /></span><div><div className="font-heading text-3xl font-extrabold text-primary">{s.v}</div><div className="text-sm text-muted">{s.l}</div></div></div>
          ))}
        </div>
      </Section>
      <Section variant="surface" padding="lg">
        <SectionHeading label="Portraits" title="Ils ont étudié à ISI" description="Découvrez les parcours de nos anciens étudiants." />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {alumni.map((a) => (
            <StaggerItem key={a.id}><AlumniCard {...a} /></StaggerItem>
          ))}
        </Stagger>
      </Section>
      <Section padding="lg" className="text-center">
        <h2 className="section-title">Vous êtes diplômé(e) du Groupe ISI ?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-muted">Rejoignez le réseau alumni pour rester en contact, partager vos offres d&apos;emploi et témoigner auprès des nouvelles promotions.</p>
        <Button href="/contact?sujet=Autre" variant="secondary" size="lg" className="mt-8">Rejoindre le réseau <ArrowRight className="h-4 w-4" /></Button>
      </Section>
    </>
  );
}

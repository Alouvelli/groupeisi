import type { Metadata } from "next";
import Image from "next/image";
import { Target, Eye, Heart, Award, Users, Lightbulb, CheckCircle2, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { StatsBar } from "@/components/sections/StatsBar";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { TeamSection } from "@/components/sections/TeamSection";
import { PreInscriptionCTA } from "@/components/sections/PreInscriptionCTA";
import { getSettings, getPersonnes, getPartenaires } from "@/lib/data";

export const metadata: Metadata = { title: "Présentation du Groupe ISI", description: "Histoire, mission, vision et valeurs du Groupe ISI, Institut Supérieur d'Informatique fondé en 1994 à Dakar." };

const values = [
  { Icon: Award, title: "Excellence", text: "Des programmes accrédités, des enseignants experts et une exigence académique constante." },
  { Icon: Lightbulb, title: "Innovation", text: "Laboratoires de pointe, incubateur ISI Lab, hackathons et veille technologique permanente." },
  { Icon: Users, title: "Proximité", text: "9 campus pour rapprocher l'enseignement supérieur des étudiants, un suivi individualisé." },
  { Icon: Heart, title: "Engagement", text: "Contribuer au développement du Sénégal et de l'Afrique par la formation de talents numériques." },
];

const timeline = [
  { year: "1994", text: "Création de l'Institut Supérieur d'Informatique à Dakar par une équipe d'ingénieurs et d'enseignants." },
  { year: "2000", text: "Ouverture des premières Licences professionnelles et de l'Académie Cisco." },
  { year: "2008", text: "Lancement des Masters professionnels en Génie Logiciel et Réseaux & Systèmes." },
  { year: "2012", text: "Expansion régionale : ouverture des campus de Kaolack, Diourbel et Kaffrine." },
  { year: "2015", text: "Implantation en Mauritanie avec les campus de Nouakchott puis Nouadhibou." },
  { year: "2017", text: "Ouverture d'ISI Keur Massar, premier institut d'informatique de la banlieue dakaroise." },
  { year: "2021", text: "Accréditation ANAQ-Sup de 8 filières et reconnaissance CAMES de plusieurs Masters." },
  { year: "2026", text: "Lancement du Master Big Data & IA et du site de pré-inscription en ligne." },
];

export default async function PresentationPage() {
  const [settings, team, partenaires] = await Promise.all([getSettings(), getPersonnes("DIRECTION"), getPartenaires()]);
  return (
    <>
      <PageHeader title="Présentation du Groupe ISI" subtitle="Un institut de référence dans les technologies de l'information et de la communication depuis 1994." items={[{ label: "L'École" }, { label: "Présentation" }]} image="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=80" />

      <Section padding="lg">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <span className="section-label mb-3"><span className="h-px w-6 bg-current" /> Qui sommes-nous ?</span>
            <h2 className="section-title">Plus de 30 ans au service de la formation en informatique et management</h2>
            <div className="prose-isi mt-6">
              <p>{settings.description}</p>
              <p>Le groupe propose des formations en 2, 3 et 5 ans dans les domaines du génie informatique, des réseaux et systèmes, des télécommunications et du management. Les diplômes délivrés sont signés par le Ministère de l&apos;Enseignement supérieur et placés sous le contrôle de l&apos;ANAQ-Sup, garantissant une qualité d&apos;enseignement reconnue.</p>
              <p>Avec 9 campus à Dakar, en banlieue, dans les régions (Kaolack, Kaffrine, Diourbel) et en Mauritanie (Nouakchott, Nouadhibou), le Groupe ISI est aujourd&apos;hui l&apos;un des premiers réseaux privés d&apos;enseignement supérieur en TIC de la sous-région.</p>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Diplômes d'État et accréditations ANAQ-Sup / CAMES", "Académie Cisco et Huawei ICT Academy", "Incubateur ISI Lab", "Cours du jour, du soir et à distance", "Réseau de 120+ entreprises partenaires", "Bourses d'excellence"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {t}</li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4" delay={0.1}>
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl"><Image src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80" alt="Étudiants ISI" fill sizes="25vw" className="object-cover" /></div>
            <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-3xl"><Image src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80" alt="Laboratoire ISI" fill sizes="25vw" className="object-cover" /></div>
          </Reveal>
        </div>
      </Section>

      <div className="bg-surface pb-16 pt-24">
        <StatsBar stats={{ annees: settings.statAnnees, etudiants: settings.statEtudiants, campus: settings.statCampus, programmes: settings.statProgrammes, insertion: settings.statInsertion, partenaires: settings.statPartenaires }} />
      </div>

      <Section padding="lg">
        <SectionHeading label="Notre ADN" title="Mission, vision et valeurs" />
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { Icon: Target, title: "Notre mission", text: "Former des professionnels compétents, opérationnels et responsables, capables d'accompagner la transformation numérique des entreprises et des administrations africaines." },
            { Icon: Eye, title: "Notre vision", text: "Être l'institut de référence en Afrique de l'Ouest dans les métiers du numérique et du management, reconnu pour la qualité de ses diplômés et son innovation pédagogique." },
            { Icon: Heart, title: "Nos engagements", text: "Un accompagnement individualisé, une insertion professionnelle facilitée et un accès à l'enseignement supérieur de qualité au plus près des territoires." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.1} className="rounded-card border border-line bg-white p-8 shadow-soft">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white"><c.Icon className="h-7 w-7" /></span>
              <h3 className="mt-5 text-xl font-extrabold text-primary">{c.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{c.text}</p>
            </Reveal>
          ))}
        </div>
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <StaggerItem key={v.title} className="flex gap-4 rounded-2xl bg-surface p-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white"><v.Icon className="h-5 w-5" /></span>
              <div><h4 className="font-extrabold text-primary">{v.title}</h4><p className="mt-1 text-sm text-muted">{v.text}</p></div>
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      <Section variant="primary" padding="lg" className="overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
        <SectionHeading label="Notre histoire" title="Les grandes étapes du Groupe ISI" light />
        <ol className="relative mx-auto max-w-4xl border-l-2 border-white/15 pl-8 sm:pl-12">
          {timeline.map((t, i) => (
            <Reveal as="li" key={t.year} delay={i * 0.05} className="relative pb-10 last:pb-0">
              <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary ring-4 ring-primary sm:-left-[57px]" aria-hidden />
              <span className="font-heading text-2xl font-extrabold text-accent">{t.year}</span>
              <p className="mt-1 text-white/85">{t.text}</p>
            </Reveal>
          ))}
        </ol>
      </Section>

      <TeamSection members={team.slice(0, 4)} />
      <PartnersSection partenaires={partenaires} />
      <PreInscriptionCTA anneeAcademique={settings.anneeAcademique} phone={settings.phone2 ?? settings.phone} ouvertes={settings.inscriptionsOuvertes} />
      <Section padding="sm" className="text-center">
        <Button href="/departements" variant="outline">Découvrir nos départements <ArrowRight className="h-4 w-4" /></Button>
      </Section>
    </>
  );
}

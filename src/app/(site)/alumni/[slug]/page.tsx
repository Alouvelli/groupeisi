import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Briefcase, GraduationCap, MapPin, Quote, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { LinkedinIcon } from "@/components/ui/SocialLinks";
import { getAlumniBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getAlumniBySlug(slug);
  if (!a) return { title: "Alumni introuvable" };
  return { title: `${a.prenom} ${a.nom} – Alumni ${a.promotion}`, description: a.temoignage ?? a.parcours ?? undefined };
}

export default async function AlumniDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getAlumniBySlug(slug);
  if (!a) notFound();
  return (
    <>
      <PageHeader title={`${a.prenom} ${a.nom}`} subtitle={`Promotion ${a.promotion} · ${a.programme}`} items={[{ label: "Alumni", href: "/alumni" }, { label: `${a.prenom} ${a.nom}` }]} />
      <Section padding="lg">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-primary-50"><Image src={a.photo || "/images/placeholder.svg"} alt={`${a.prenom} ${a.nom}`} fill sizes="33vw" className="object-cover" /></div>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex gap-3"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {a.programme} – Promotion {a.promotion}</li>
              {(a.poste || a.entreprise) && <li className="flex gap-3"><Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {[a.poste, a.entreprise].filter(Boolean).join(" · ")}</li>}
              {(a.ville || a.pays) && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {[a.ville, a.pays].filter(Boolean).join(", ")}</li>}
            </ul>
            {a.linkedin && <Button href={a.linkedin} external variant="outline" className="mt-6 w-full"><LinkedinIcon className="h-4 w-4" /> Profil LinkedIn</Button>}
          </div>
          <div className="lg:col-span-2">
            {a.temoignage && (
              <blockquote className="rounded-card border-l-4 border-secondary bg-secondary-50 p-8">
                <Quote className="h-8 w-8 text-secondary/40" />
                <p className="mt-3 text-xl font-semibold leading-relaxed text-primary">« {a.temoignage} »</p>
              </blockquote>
            )}
            {a.parcours && <div className="prose-isi mt-8"><h2>Parcours</h2><p>{a.parcours}</p></div>}
            <Button href="/alumni" variant="ghost" className="mt-8"><ArrowLeft className="h-4 w-4" /> Tous les alumni</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

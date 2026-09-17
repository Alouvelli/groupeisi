import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, MapPin, Award, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LinkedinIcon } from "@/components/ui/SocialLinks";
import { getPersonneBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPersonneBySlug(slug);
  if (!p) return { title: "Membre introuvable" };
  return { title: `${p.prenom} ${p.nom} – ${p.poste}`, description: p.bio ?? undefined };
}

export default async function PersonnePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getPersonneBySlug(slug);
  if (!p) notFound();
  return (
    <>
      <PageHeader title={`${p.prenom} ${p.nom}`} subtitle={p.poste} items={[{ label: "Équipe", href: "/equipe" }, { label: `${p.prenom} ${p.nom}` }]} />
      <Section padding="lg">
        <div className="grid gap-10 lg:grid-cols-3">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-primary-50"><Image src={p.photo || "/images/placeholder.svg"} alt={`${p.prenom} ${p.nom}`} fill sizes="33vw" className="object-cover" /></div>
            <ul className="mt-6 space-y-3 text-sm">
              {p.email && <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <a href={`mailto:${p.email}`} className="hover:text-secondary">{p.email}</a></li>}
              {p.telephone && <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> {p.telephone}</li>}
              {p.departement && <li className="flex gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <Link href={`/departements/${p.departement.slug}`} className="hover:text-secondary">{p.departement.nom}</Link></li>}
              {p.campus && <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> <Link href={`/campus/${p.campus.slug}`} className="hover:text-secondary">{p.campus.nom}</Link></li>}
            </ul>
            {p.linkedin && <Button href={p.linkedin} external variant="outline" className="mt-6 w-full"><LinkedinIcon className="h-4 w-4" /> LinkedIn</Button>}
          </div>
          <div className="lg:col-span-2">
            <span className="section-label"><span className="h-px w-6 bg-current" /> {p.poste}</span>
            {p.bio && <div className="prose-isi mt-4 text-lg"><p>{p.bio}</p></div>}
            {p.specialites.length > 0 && <div className="mt-8"><h3 className="text-lg font-extrabold text-primary">Spécialités</h3><div className="mt-3 flex flex-wrap gap-2">{p.specialites.map((s) => <Badge key={s} variant="soft" className="normal-case tracking-normal">{s}</Badge>)}</div></div>}
            {p.diplomes.length > 0 && <div className="mt-8"><h3 className="text-lg font-extrabold text-primary">Diplômes et certifications</h3><ul className="mt-3 space-y-2">{p.diplomes.map((d) => <li key={d} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Award className="h-4 w-4 text-secondary" /> {d}</li>)}</ul></div>}
            <Button href="/equipe" variant="ghost" className="mt-8"><ArrowLeft className="h-4 w-4" /> Toute l&apos;équipe</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

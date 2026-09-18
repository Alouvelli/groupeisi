import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { LinkedinIcon } from "@/components/ui/SocialLinks";
import { getPersonneBySlug, getPersonnes } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPersonneBySlug(slug);
  if (!p) return { title: "Profil introuvable" };
  return {
    title: `${p.prenom} ${p.nom}`,
    description: p.bio?.slice(0, 160) ?? p.poste,
    alternates: { canonical: `/equipe/${p.slug}` },
  };
}

export default async function PersonnePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const personne = await getPersonneBySlug(slug);
  if (!personne) notFound();
  const autres = (await getPersonnes()).filter((p) => p.slug !== personne.slug).slice(0, 3);

  return (
    <>
      <PageHeader
        title={`${personne.prenom} ${personne.nom}`}
        items={[{ label: "Notre équipe", href: "/equipe" }, { label: `${personne.prenom} ${personne.nom}` }]}
        image="/media/mg-9698-cr3-at-2025-copie.jpg"
      />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[420px_1fr] lg:gap-16">
            <div>
              <Image
                src={personne.photo || "/media/ibrahima-sy-photo.jpg"}
                alt={`${personne.prenom} ${personne.nom}`}
                width={600}
                height={600}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <div className="mt-6 rounded-lg border border-line bg-surface p-6">
                <h3 className="font-heading text-[18px] font-semibold text-dark">Informations de contact</h3>
                <ul className="mt-4 space-y-3 text-[15px] text-body">
                  {personne.email && (
                    <li className="flex gap-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <a href={`mailto:${personne.email}`} className="break-all transition hover:text-primary">
                        {personne.email}
                      </a>
                    </li>
                  )}
                  {personne.telephone && (
                    <li className="flex gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <a href={`tel:${personne.telephone.replace(/[^+\d]/g, "")}`} className="transition hover:text-primary">
                        {personne.telephone}
                      </a>
                    </li>
                  )}
                  {personne.campus && (
                    <li className="flex gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <Link href={`/campus/${personne.campus.slug}`} className="transition hover:text-primary">
                        {personne.campus.nom}
                      </Link>
                    </li>
                  )}
                  {personne.linkedin && (
                    <li className="flex gap-3">
                      <LinkedinIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <a href={personne.linkedin} target="_blank" rel="noopener noreferrer" className="transition hover:text-primary">
                        Profil LinkedIn
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <div>
              <SectionLabel>{personne.departement?.nom ?? "Groupe ISI"}</SectionLabel>
              <h2 className="section-title">
                {personne.prenom} {personne.nom}
              </h2>
              <p className="mt-2 text-[17px] font-medium text-primary">{personne.poste}</p>
              {personne.bio && <p className="mt-6 text-base leading-7 text-body">{personne.bio}</p>}

              {personne.specialites.length > 0 && (
                <>
                  <h3 className="mt-10 font-heading text-[20px] font-semibold text-dark">Spécialités</h3>
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {personne.specialites.map((s) => (
                      <li key={s} className="rounded-full border border-line px-4 py-1.5 text-[14px] text-body">
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {personne.diplomes.length > 0 && (
                <>
                  <h3 className="mt-10 font-heading text-[20px] font-semibold text-dark">Diplômes</h3>
                  <ul className="mt-4 space-y-2 text-[15px] text-body">
                    {personne.diplomes.map((d) => (
                      <li key={d}>• {d}</li>
                    ))}
                  </ul>
                </>
              )}

              {personne.departement && (
                <Button href={`/departements/${personne.departement.slug}`} className="mt-10" arrow>
                  Voir le département
                </Button>
              )}
            </div>
          </div>
        </Container>
      </section>

      {autres.length > 0 && (
        <section className="bg-surface py-16 lg:py-[100px]">
          <Container>
            <h2 className="section-title mb-10">Autres membres de l&apos;équipe</h2>
            <div className="grid gap-[30px] sm:grid-cols-3">
              {autres.map((p) => (
                <Link key={p.id} href={`/equipe/${p.slug}`} className="group flex items-center gap-4 rounded-lg border border-line bg-white p-5 transition hover:shadow-card">
                  <Image src={p.photo || "/media/ibrahima-sy-photo.jpg"} alt="" width={80} height={80} className="h-16 w-16 rounded-full object-cover" />
                  <span>
                    <span className="block font-heading text-[17px] font-semibold text-dark transition group-hover:text-primary">
                      {p.prenom} {p.nom}
                    </span>
                    <span className="block text-[14px] text-body">{p.poste}</span>
                  </span>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

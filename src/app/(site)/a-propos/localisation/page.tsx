import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { AproposNav } from "@/components/layout/AproposNav";
import { getCampus } from "@/lib/data";

export const metadata: Metadata = {
  title: "Localisation",
  description: "Retrouvez sur la carte les campus et annexes du Groupe ISI au Sénégal (Dakar, Diourbel, Kaolack, Kaffrine, Ziguinchor, Sédhiou) et en Mauritanie.",
};

export default async function LocalisationPage() {
  const campus = await getCampus();
  const zones = ["Dakar", "Annexes", "Régions", "Mauritanie"];
  const groupes = zones
    .map((z) => ({ zone: z, items: campus.filter((c) => (c.zone ?? "Régions") === z) }))
    .filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader title="Localisation" items={[{ label: "À propos", href: "/a-propos" }, { label: "Localisation" }]} image="/media/img-9163.jpg" />
      <AproposNav />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="mb-12 max-w-3xl">
            <SectionLabel>Nos implantations</SectionLabel>
            <h2 className="section-title">Nos campus sur la carte</h2>
            <p className="mt-4 text-base leading-7 text-body">
              Le Groupe ISI est présent à Dakar et dans ses annexes, dans les régions du Sénégal et en Mauritanie.
            </p>
          </div>

          <div className="space-y-14">
            {groupes.map((g) => (
              <div key={g.zone}>
                <h3 className="mb-6 font-heading text-[24px] font-semibold text-dark">{g.zone}</h3>
                <div className="grid gap-[30px] lg:grid-cols-2">
                  {g.items.map((c) => (
                    <article key={c.id} className="overflow-hidden rounded-lg border border-line bg-white">
                      <h4 className="border-b border-line px-6 py-4 font-heading text-[20px] font-semibold text-dark">Campus {c.nom.replace(/^ISI\s*/i, "")}</h4>
                      {c.mapEmbedUrl ? (
                        <iframe
                          src={c.mapEmbedUrl}
                          title={`Carte – ${c.nom}`}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="h-[280px] w-full border-0"
                        />
                      ) : (
                        <div className="flex h-[280px] items-center justify-center bg-surface text-[15px] text-body">Carte non disponible</div>
                      )}
                      <div className="space-y-2 px-6 py-5 text-[15px] text-body">
                        <p className="flex gap-2.5">
                          <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /> {c.adresse}
                        </p>
                        {c.telephone && (
                          <p className="flex gap-2.5">
                            <Phone className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <a href={`tel:${c.telephone.replace(/[^+\d]/g, "")}`} className="transition hover:text-primary">
                              {c.telephone}
                            </a>
                          </p>
                        )}
                        <Link href={`/campus/${c.slug}`} className="inline-flex pt-1 font-medium text-primary transition hover:text-secondary-dark">
                          Découvrir le campus →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

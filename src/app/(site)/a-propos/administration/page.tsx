import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/Section";
import { AproposNav } from "@/components/layout/AproposNav";
import { getCampus } from "@/lib/data";

export const metadata: Metadata = {
  title: "Administration",
  description: "Répertoire administratif du Groupe ISI : scolarité, comptabilité, direction et responsables de campus.",
};

/** Répertoire administratif repris de la page « Administration ». */
const FREQUENTS: { service: string; bureau: string; contacts: { tel: string; email: string }[] }[] = [
  {
    service: "Scolarité",
    bureau: "Rez-de-chaussée",
    contacts: [
      { tel: "+221 76 645 14 73", email: "mathiam@groupeisi.com" },
      { tel: "+221 76 645 14 75", email: "nrdiop@groupeisi.com" },
      { tel: "+221 76 623 34 84", email: "dbarry1@groupeisi.com" },
    ],
  },
  { service: "Bureau d'informations", bureau: "Rez-de-chaussée", contacts: [{ tel: "+221 76 644 85 44", email: "contact@groupeisi.com" }] },
  { service: "Comptabilité", bureau: "2e étage", contacts: [{ tel: "+221 76 153 03 05", email: "mthioune@groupeisi.com" }] },
];

const DIRECTION: [string, string][] = [
  ["Président", "asambe@groupeisi.com"],
  ["Directeur Général", "tsambe@groupeisi.com"],
  ["Directrice Administrative et Financière", "mdiop@groupeisi.com"],
  ["Directrice des Études", "agassama@groupeisi.com"],
  ["Directeur des Systèmes d'Informations", "ssouare@groupeisi.com"],
  ["Contrôleur Interne", "andao@groupeisi.com"],
  ["Cellule d'Orientation et d'Insertion Professionnelle", "coip@groupeisi.com"],
  ["Cellule Interne d'Assurance Qualité", "kba@groupeisi.com"],
];

const RESPONSABLES: [string, string | null][] = [
  ["ISI Keur Massar", "ndiouf@groupeisi.com"],
  ["ISI SupTech", "ksamb@groupeisi.com"],
  ["ISI Diourbel", "mndiaye@groupeisi.com"],
  ["ISI Kaolack", "atraore@groupeisi.com"],
  ["ISI Kaffrine", "bandiaye1@groupeisi.com"],
  ["ISI Ziguinchor", "adiop@groupeisi.com"],
  ["ISI Sédhiou", "pmane@groupeisi.com"],
  ["ISI Nouakchott", "aldiop@groupeisi.com"],
  ["ISI Nouadhibou", null],
  ["ISI CFE", "adiouf1@groupeisi.com"],
];

const Mail = ({ email }: { email: string | null }) =>
  email ? (
    <a href={`mailto:${email}`} className="text-primary transition hover:underline">
      {email}
    </a>
  ) : (
    <span className="text-muted">—</span>
  );

export default async function AdministrationPage() {
  const campus = await getCampus();

  return (
    <>
      <PageHeader title="Administration" items={[{ label: "À propos", href: "/a-propos" }, { label: "Administration" }]} image="/media/img-9163.jpg" />
      <AproposNav />

      <section className="bg-white py-16 lg:py-[100px]">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden rounded-lg">
              <Image src="/media/img-9163.jpg" alt="" width={960} height={640} className="h-auto w-full object-cover" />
            </div>
            <div>
              <SectionLabel>Nous joindre</SectionLabel>
              <h2 className="section-title">Répertoire administratif d&apos;ISI</h2>
              <p className="mt-5 text-[15px] leading-7 text-body">
                À ISI, l&apos;éducation va au-delà des manuels et des salles de classe. Nous croyons qu&apos;il faut donner aux étudiants les moyens
                d&apos;explorer leurs passions, de remettre en question les conventions et de découvrir leur potentiel grâce à des expériences
                significatives. Nos professeurs distingués sont des chefs de file dans leurs domaines respectifs et se consacrent à offrir une
                éducation de calibre mondial qui intègre la théorie à la pratique.
              </p>
            </div>
          </div>

          {/* Personnels fréquemment contactés */}
          <h3 className="mt-16 font-heading text-[20px] font-semibold text-dark">Personnels fréquemment contactés</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="table-isi">
              <thead>
                <tr>
                  <th scope="col">Département</th>
                  <th scope="col">Bureau</th>
                  <th scope="col">Téléphone</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {FREQUENTS.flatMap((f) =>
                  f.contacts.map((c, i) => (
                    <tr key={f.service + c.email}>
                      {i === 0 && (
                        <>
                          <th scope="rowgroup" rowSpan={f.contacts.length} className="bg-white font-heading text-[15px] font-semibold text-dark">
                            {f.service}
                          </th>
                          <td rowSpan={f.contacts.length}>{f.bureau}</td>
                        </>
                      )}
                      <td>
                        <a href={`tel:${c.tel.replace(/[^+\d]/g, "")}`} className="transition hover:text-primary">
                          {c.tel}
                        </a>
                      </td>
                      <td>
                        <Mail email={c.email} />
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>

          {/* Administration */}
          <h3 className="mt-14 font-heading text-[20px] font-semibold text-dark">Administration</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="table-isi">
              <thead>
                <tr>
                  <th scope="col">Entité</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {DIRECTION.map(([entite, email]) => (
                  <tr key={entite}>
                    <td className="font-medium text-dark">{entite}</td>
                    <td>
                      <Mail email={email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Responsables de campus */}
          <h3 className="mt-14 font-heading text-[20px] font-semibold text-dark">Responsables de campus</h3>
          <div className="mt-5 overflow-x-auto">
            <table className="table-isi">
              <thead>
                <tr>
                  <th scope="col">Campus</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {RESPONSABLES.map(([nom, email]) => (
                  <tr key={nom}>
                    <td className="font-medium text-dark">{nom}</td>
                    <td>
                      <Mail email={email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-[15px] text-body">
            Retrouvez l&apos;adresse et la carte de chacun de nos {campus.length} sites sur la page{" "}
            <a href="/a-propos/localisation" className="font-medium text-primary hover:underline">
              Localisation
            </a>
            .
          </p>
        </Container>
      </section>
    </>
  );
}

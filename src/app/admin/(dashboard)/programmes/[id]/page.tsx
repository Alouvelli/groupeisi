import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { ProgrammeForm } from "@/components/admin/ProgrammeForm";

export default async function EditProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, departements, campus] = await Promise.all([
    prisma.programme.findUnique({ where: { id }, include: { campus: { select: { id: true } } } }),
    prisma.departement.findMany({ select: { id: true, nom: true }, orderBy: { ordre: "asc" } }),
    prisma.campus.findMany({ select: { id: true, nom: true }, orderBy: { ordre: "asc" } }),
  ]);
  if (!p) notFound();
  return (
    <>
      <PageTitle title={`Modifier : ${p.titre}`} actions={<Link href={`/programmes/${p.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-secondary">Voir sur le site <ExternalLink className="h-4 w-4" /></Link>} />
      <ProgrammeForm
        id={p.id}
        departements={departements}
        campus={campus}
        defaultValues={{
          titre: p.titre, slug: p.slug, niveau: p.niveau, duree: p.duree, departementId: p.departementId, accroche: p.accroche ?? "", description: p.description, contenu: p.contenu ?? "",
          objectifs: p.objectifs.join("\n"), debouches: p.debouches.join("\n"), competences: p.competences.join("\n"), conditionsAdmission: p.conditionsAdmission ?? "",
          fraisInscription: p.fraisInscription ?? "", fraisScolarite: p.fraisScolarite ?? "", diplome: p.diplome ?? "", accreditation: p.accreditation ?? "", image: p.image ?? "", brochureUrl: p.brochureUrl ?? "", erpCode: p.erpCode ?? "",
          ordre: p.ordre, isActive: p.isActive, isFeatured: p.isFeatured, campusIds: p.campus.map((c) => c.id),
        }}
      />
    </>
  );
}

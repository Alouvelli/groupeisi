import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { ProgrammeForm } from "@/components/admin/ProgrammeForm";

export default async function NewProgrammePage() {
  const [departements, campus] = await Promise.all([prisma.departement.findMany({ select: { id: true, nom: true }, orderBy: { ordre: "asc" } }), prisma.campus.findMany({ select: { id: true, nom: true }, orderBy: { ordre: "asc" } })]);
  return (
    <>
      <PageTitle title="Nouveau programme" />
      <ProgrammeForm departements={departements} campus={campus} defaultValues={{ campusIds: campus.map((c) => c.id) }} />
    </>
  );
}

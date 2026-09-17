import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle, Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { NIVEAU_LABELS } from "@/lib/constants";
import { formatFCFA } from "@/lib/utils";
import { ProgrammeRowActions } from "@/components/admin/ProgrammeForm";

export default async function AdminProgrammesPage() {
  const programmes = await prisma.programme.findMany({ orderBy: [{ niveau: "asc" }, { ordre: "asc" }], include: { departement: { select: { nom: true } }, _count: { select: { inscriptions: true, campus: true } } } });
  return (
    <>
      <PageTitle title="Programmes" description={`${programmes.length} formation(s)`} actions={<Button href="/admin/programmes/new" variant="secondary" size="sm"><Plus className="h-4 w-4" /> Nouveau programme</Button>} />
      <Panel padded={false}>
        {programmes.length === 0 ? <div className="p-5"><EmptyState text="Aucun programme." /></div> : (
          <Table>
            <thead className="bg-surface"><tr><Th>Formation</Th><Th>Niveau</Th><Th>Département</Th><Th>Frais</Th><Th>Campus</Th><Th>Inscr.</Th><Th>État</Th><Th></Th></tr></thead>
            <tbody>
              {programmes.map((p) => (
                <tr key={p.id} className="border-t border-line hover:bg-surface">
                  <Td><Link href={`/admin/programmes/${p.id}`} className="font-bold text-primary hover:text-secondary">{p.titre}</Link><div className="text-xs text-muted">/{p.slug} · {p.duree}</div></Td>
                  <Td><Pill className="bg-primary-50 text-primary">{NIVEAU_LABELS[p.niveau]}</Pill></Td>
                  <Td className="text-xs">{p.departement.nom}</Td>
                  <Td className="text-xs">{formatFCFA(p.fraisInscription)}<br /><span className="text-muted">{formatFCFA(p.fraisScolarite)}/an</span></Td>
                  <Td>{p._count.campus}</Td>
                  <Td>{p._count.inscriptions}</Td>
                  <Td><div className="flex flex-wrap gap-1">{p.isActive ? <Pill className="bg-emerald-100 text-emerald-800">Actif</Pill> : <Pill className="bg-slate-100 text-slate-600">Inactif</Pill>}{p.isFeatured && <Pill className="bg-secondary-50 text-secondary">À la une</Pill>}</div></Td>
                  <Td><div className="flex items-center gap-1"><Link href={`/admin/programmes/${p.id}`} aria-label="Modifier" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary hover:bg-primary hover:text-white"><Pencil className="h-4 w-4" /></Link><ProgrammeRowActions id={p.id} isActive={p.isActive} isFeatured={p.isFeatured} /></div></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </>
  );
}

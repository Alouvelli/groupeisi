import Link from "next/link";
import { Download, Search, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle, Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { STATUT_LABELS, STATUT_COLORS, ERP_SYNC_LABELS, ERP_SYNC_COLORS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import type { InscriptionStatut, ERPSyncStatus, Prisma } from "@prisma/client";

type SP = { page?: string; statut?: string; sync?: string; q?: string; campus?: string; programme?: string };

export default async function InscriptionsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 20;
  const where: Prisma.InscriptionWhereInput = {
    ...(sp.statut ? { statut: sp.statut as InscriptionStatut } : {}),
    ...(sp.sync ? { erpSyncStatus: sp.sync as ERPSyncStatus } : {}),
    ...(sp.campus ? { campusId: sp.campus } : {}),
    ...(sp.programme ? { programmeId: sp.programme } : {}),
    ...(sp.q ? { OR: [{ numero: { contains: sp.q, mode: "insensitive" } }, { nom: { contains: sp.q, mode: "insensitive" } }, { prenom: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }, { telephone: { contains: sp.q } }] } : {}),
  };
  const [items, total, campus, programmes] = await Promise.all([
    prisma.inscription.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { programme: { select: { titre: true, niveau: true } }, campus: { select: { ville: true } } } }),
    prisma.inscription.count({ where }),
    prisma.campus.findMany({ select: { id: true, ville: true }, orderBy: { ordre: "asc" } }),
    prisma.programme.findMany({ select: { id: true, titre: true }, orderBy: { titre: "asc" } }),
  ]);
  const exportQs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "page") as [string, string][]).toString();

  return (
    <>
      <PageTitle title="Pré-inscriptions" description={`${total} dossier(s)`} actions={<Button href={`/api/admin/inscriptions/export${exportQs ? `?${exportQs}` : ""}`} variant="outline" size="sm" external><Download className="h-4 w-4" /> Export CSV</Button>} />
      <Panel className="mb-6">
        <form className="grid gap-3 md:grid-cols-6" action="/admin/inscriptions">
          <div className="relative md:col-span-2"><input name="q" defaultValue={sp.q} placeholder="N° dossier, nom, email, téléphone…" className="field-input pl-10" /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /></div>
          <select name="statut" defaultValue={sp.statut ?? ""} className="field-input"><option value="">Tous les statuts</option>{Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select name="sync" defaultValue={sp.sync ?? ""} className="field-input"><option value="">Sync ERP : toutes</option>{Object.entries(ERP_SYNC_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select name="campus" defaultValue={sp.campus ?? ""} className="field-input"><option value="">Tous les campus</option>{campus.map((c) => <option key={c.id} value={c.id}>{c.ville}</option>)}</select>
          <div className="flex gap-2"><select name="programme" defaultValue={sp.programme ?? ""} className="field-input"><option value="">Toutes formations</option>{programmes.map((p) => <option key={p.id} value={p.id}>{p.titre}</option>)}</select><Button type="submit" variant="primary" size="md">Filtrer</Button></div>
        </form>
      </Panel>
      <Panel padded={false}>
        {items.length === 0 ? <div className="p-5"><EmptyState text="Aucune inscription ne correspond aux filtres." /></div> : (
          <Table>
            <thead className="bg-surface"><tr><Th>Dossier</Th><Th>Candidat</Th><Th>Formation</Th><Th>Rentrée</Th><Th>Statut</Th><Th>ERP</Th><Th>Date</Th><Th></Th></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-line hover:bg-surface">
                  <Td><Link href={`/admin/inscriptions/${i.id}`} className="whitespace-nowrap font-mono text-xs font-bold text-primary hover:text-secondary">{i.numero}</Link></Td>
                  <Td><div className="font-semibold text-primary">{i.prenom} {i.nom}</div><div className="text-xs text-muted">{i.email} · {i.telephone}</div></Td>
                  <Td><div className="max-w-[240px] truncate">{i.programme.titre}</div><div className="text-xs text-muted">{i.campus.ville} · {i.niveauEntree}</div></Td>
                  <Td className="text-xs">{i.rentree}</Td>
                  <Td><Pill className={STATUT_COLORS[i.statut]}>{STATUT_LABELS[i.statut]}</Pill></Td>
                  <Td><Pill className={ERP_SYNC_COLORS[i.erpSyncStatus]} >{ERP_SYNC_LABELS[i.erpSyncStatus]}</Pill>{i.erpProspectId && <div className="mt-1 font-mono text-[10px] text-muted">{i.erpProspectId}</div>}</Td>
                  <Td className="text-xs text-muted">{formatDateTime(i.createdAt)}</Td>
                  <Td><Link href={`/admin/inscriptions/${i.id}`} aria-label="Voir" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary hover:bg-primary hover:text-white"><Eye className="h-4 w-4" /></Link></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="px-5 pb-5"><Pagination page={page} pages={Math.max(1, Math.ceil(total / pageSize))} basePath="/admin/inscriptions" params={sp as Record<string, string | undefined>} /></div>
      </Panel>
    </>
  );
}

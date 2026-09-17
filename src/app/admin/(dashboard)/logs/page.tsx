import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageTitle, Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/utils";
import { LogDetails } from "@/components/admin/LogDetails";
import type { ERPDirection, ERPLogStatus, Prisma } from "@prisma/client";

type SP = { page?: string; status?: string; direction?: string; action?: string };

export default async function LogsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const pageSize = 30;
  const where: Prisma.ERPLogWhereInput = {
    ...(sp.status ? { status: sp.status as ERPLogStatus } : {}),
    ...(sp.direction ? { direction: sp.direction as ERPDirection } : {}),
    ...(sp.action ? { action: { contains: sp.action, mode: "insensitive" } } : {}),
  };
  const [logs, total, stats] = await Promise.all([
    prisma.eRPLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, include: { inscription: { select: { numero: true, id: true } } } }),
    prisma.eRPLog.count({ where }),
    prisma.eRPLog.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const counts = Object.fromEntries(stats.map((s) => [s.status, s._count._all]));
  return (
    <>
      <PageTitle title="Logs de synchronisation ERP" description={`${total} entrée(s) · ${counts.SUCCESS ?? 0} succès · ${counts.ERROR ?? 0} erreurs`} />
      <Panel className="mb-6">
        <form className="grid gap-3 md:grid-cols-4" action="/admin/logs">
          <input name="action" defaultValue={sp.action} placeholder="Action (createProspect, webhook…)" className="field-input" />
          <select name="status" defaultValue={sp.status ?? ""} className="field-input"><option value="">Tous les statuts</option>{["SUCCESS", "ERROR", "RETRY", "INFO"].map((s) => <option key={s}>{s}</option>)}</select>
          <select name="direction" defaultValue={sp.direction ?? ""} className="field-input"><option value="">Sortant + entrant</option><option value="OUTBOUND">Sortant (→ ERP)</option><option value="INBOUND">Entrant (webhooks)</option></select>
          <Button type="submit" variant="primary">Filtrer</Button>
        </form>
      </Panel>
      <Panel padded={false}>
        {logs.length === 0 ? <div className="p-5"><EmptyState text="Aucun log." /></div> : (
          <Table>
            <thead className="bg-surface"><tr><Th>Date</Th><Th>Dir.</Th><Th>Action</Th><Th>Statut</Th><Th>Dossier</Th><Th>HTTP</Th><Th>Durée</Th><Th>Message</Th><Th></Th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-line align-top hover:bg-surface">
                  <Td className="whitespace-nowrap text-xs text-muted">{formatDateTime(l.createdAt)}</Td>
                  <Td><Pill className={l.direction === "INBOUND" ? "bg-purple-100 text-purple-800" : "bg-primary-50 text-primary"}>{l.direction === "INBOUND" ? "IN" : "OUT"}</Pill></Td>
                  <Td className="font-semibold text-primary">{l.action}{l.attempt ? <span className="ml-1 text-xs text-muted">#{l.attempt}</span> : null}</Td>
                  <Td><Pill className={l.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : l.status === "ERROR" ? "bg-red-100 text-red-800" : l.status === "RETRY" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"}>{l.status}</Pill></Td>
                  <Td>{l.inscription ? <Link href={`/admin/inscriptions/${l.inscription.id}`} className="font-mono text-xs text-secondary">{l.inscription.numero}</Link> : "–"}</Td>
                  <Td className="text-xs">{l.statusCode ?? "–"}</Td>
                  <Td className="text-xs">{l.durationMs ? `${l.durationMs} ms` : "–"}</Td>
                  <Td className="max-w-[280px] truncate text-xs" title={l.errorMessage ?? l.message ?? ""}>{l.errorMessage ?? l.message}</Td>
                  <Td><LogDetails request={l.requestPayload} response={l.responsePayload} endpoint={l.endpoint} method={l.httpMethod} /></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <div className="px-5 pb-5"><Pagination page={page} pages={Math.max(1, Math.ceil(total / pageSize))} basePath="/admin/logs" params={sp as Record<string, string | undefined>} /></div>
      </Panel>
    </>
  );
}

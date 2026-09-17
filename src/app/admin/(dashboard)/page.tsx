import Link from "next/link";
import { Users, UserPlus, CheckCircle2, AlertTriangle, Mail, Newspaper, Activity, Database, ArrowRight, RefreshCw, Server } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getQueueStats, pingRedis } from "@/lib/queue";
import { PageTitle, StatTile, Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { STATUT_LABELS, STATUT_COLORS, ERP_SYNC_LABELS, ERP_SYNC_COLORS } from "@/lib/constants";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [total, nouvelles, semaine, acceptees, syncGroups, messages, posts, recent, logs, erpConfig, redis, queues] = await Promise.all([
    prisma.inscription.count(),
    prisma.inscription.count({ where: { statut: "NOUVELLE" } }),
    prisma.inscription.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.inscription.count({ where: { statut: { in: ["ACCEPTEE", "CONFIRMEE"] } } }),
    prisma.inscription.groupBy({ by: ["erpSyncStatus"], _count: { _all: true } }),
    prisma.contactMessage.count({ where: { statut: "NOUVEAU" } }),
    prisma.post.count({ where: { isPublished: true } }),
    prisma.inscription.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { programme: { select: { titre: true } }, campus: { select: { ville: true } } } }),
    prisma.eRPLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.eRPConfig.findUnique({ where: { id: "default" } }),
    pingRedis(),
    getQueueStats().catch(() => []),
  ]);
  const sync = Object.fromEntries(syncGroups.map((g) => [g.erpSyncStatus, g._count._all])) as Record<string, number>;
  const erpQueue = queues.find((q) => q.name === "erp-sync");

  return (
    <>
      <PageTitle title="Tableau de bord" description="Vue d'ensemble des pré-inscriptions, de la synchronisation ERP et de l'activité du site." actions={<Button href="/admin/inscriptions" variant="primary" size="sm">Gérer les inscriptions <ArrowRight className="h-4 w-4" /></Button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Pré-inscriptions" value={total} Icon={Users} href="/admin/inscriptions" />
        <StatTile label="Nouvelles à traiter" value={nouvelles} Icon={UserPlus} tone="secondary" href="/admin/inscriptions?statut=NOUVELLE" />
        <StatTile label="Cette semaine" value={semaine} Icon={Activity} tone="success" />
        <StatTile label="Acceptées / confirmées" value={acceptees} Icon={CheckCircle2} tone="success" href="/admin/inscriptions?statut=ACCEPTEE" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Synchronisées ERP" value={sync.SYNCED ?? 0} Icon={Database} tone="success" href="/admin/inscriptions?sync=SYNCED" />
        <StatTile label="Échecs ERP" value={sync.FAILED ?? 0} Icon={AlertTriangle} tone={sync.FAILED ? "danger" : "neutral"} href="/admin/inscriptions?sync=FAILED" />
        <StatTile label="Messages non lus" value={messages} Icon={Mail} tone={messages ? "warning" : "neutral"} href="/admin/messages" />
        <StatTile label="Articles publiés" value={posts} Icon={Newspaper} href="/admin/actualites" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel title="Dernières pré-inscriptions" className="xl:col-span-2" padded={false} actions={<Link href="/admin/inscriptions" className="text-xs font-bold text-secondary">Tout voir</Link>}>
          {recent.length === 0 ? <div className="p-5"><EmptyState text="Aucune inscription pour le moment." /></div> : (
            <Table>
              <thead className="bg-surface"><tr><Th>Dossier</Th><Th>Candidat</Th><Th>Formation</Th><Th>Statut</Th><Th>ERP</Th><Th>Date</Th></tr></thead>
              <tbody>
                {recent.map((i) => (
                  <tr key={i.id} className="border-t border-line hover:bg-surface">
                    <Td><Link href={`/admin/inscriptions/${i.id}`} className="whitespace-nowrap font-mono text-xs font-bold text-primary hover:text-secondary">{i.numero}</Link></Td>
                    <Td><div className="font-semibold text-primary">{i.prenom} {i.nom}</div><div className="text-xs text-muted">{i.email}</div></Td>
                    <Td><div className="max-w-[220px] truncate">{i.programme.titre}</div><div className="text-xs text-muted">{i.campus.ville}</div></Td>
                    <Td><Pill className={STATUT_COLORS[i.statut]}>{STATUT_LABELS[i.statut]}</Pill></Td>
                    <Td><Pill className={ERP_SYNC_COLORS[i.erpSyncStatus]}>{ERP_SYNC_LABELS[i.erpSyncStatus]}</Pill></Td>
                    <Td className="text-xs text-muted">{timeAgo(i.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="État du système">
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Database className="h-4 w-4 text-primary" /> Base de données</span><Pill className="bg-emerald-100 text-emerald-800">OK</Pill></li>
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><Server className="h-4 w-4 text-primary" /> Redis / Queue</span><Pill className={redis.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>{redis.ok ? "OK" : "Hors ligne"}</Pill></li>
              <li className="flex items-center justify-between"><span className="flex items-center gap-2"><RefreshCw className="h-4 w-4 text-primary" /> Intégration ERP</span><Pill className={!erpConfig?.isEnabled ? "bg-slate-100 text-slate-600" : erpConfig.lastHealthCheckOk ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>{!erpConfig?.isEnabled ? "Désactivée" : erpConfig.lastHealthCheckOk === null ? "Non testée" : erpConfig.lastHealthCheckOk ? "Connectée" : "Erreur"}</Pill></li>
              {erpQueue && (
                <li className="rounded-xl bg-surface p-3 text-xs">
                  <div className="mb-2 font-bold text-primary">Queue erp-sync</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[["En attente", erpQueue.waiting + erpQueue.delayed], ["Actifs", erpQueue.active], ["Terminés", erpQueue.completed], ["Échoués", erpQueue.failed]].map(([l, v]) => <div key={l as string}><div className="text-lg font-extrabold text-primary">{v}</div><div className="text-[10px] text-muted">{l}</div></div>)}
                  </div>
                </li>
              )}
            </ul>
            <div className="mt-4 flex gap-2"><Button href="/admin/jobs" variant="outline" size="sm" className="flex-1">Jobs</Button><Button href="/admin/settings" variant="outline" size="sm" className="flex-1">Config ERP</Button></div>
          </Panel>
          <Panel title="Derniers logs ERP" padded={false} actions={<Link href="/admin/logs" className="text-xs font-bold text-secondary">Tout voir</Link>}>
            {logs.length === 0 ? <div className="p-5"><EmptyState text="Aucun log." /></div> : (
              <ul className="divide-y divide-line">
                {logs.map((l) => (
                  <li key={l.id} className="flex items-start gap-3 px-5 py-3 text-xs">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${l.status === "SUCCESS" ? "bg-emerald-500" : l.status === "ERROR" ? "bg-red-500" : l.status === "RETRY" ? "bg-amber-500" : "bg-slate-400"}`} />
                    <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-bold text-primary">{l.action}</span><span className="text-[10px] uppercase text-muted">{l.direction === "INBOUND" ? "← webhook" : "→ ERP"}</span></div><div className="truncate text-muted">{l.message ?? l.errorMessage}</div></div>
                    <span className="shrink-0 text-muted">{formatDateTime(l.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}

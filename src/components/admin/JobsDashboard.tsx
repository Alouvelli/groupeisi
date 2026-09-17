"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { RefreshCw, RotateCcw, Trash2, Pause, Play, Eraser, AlertTriangle, Clock, CheckCircle2, Loader2, Timer, Database } from "lucide-react";
import type { QueueStats, SerializedJob, QueueName } from "@/lib/queue";
import { retryJobAction, retryAllFailedAction, removeJobAction, cleanQueueAction, pauseQueueAction, resyncPendingInscriptions } from "@/app/actions/jobs";
import { Button } from "@/components/ui/Button";
import { Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { Modal } from "@/components/ui/Modal";
import { formatDateTime, cn } from "@/lib/utils";

export interface JobsSnapshot {
  redis: { ok: boolean; message: string };
  stats: QueueStats[];
  jobs: SerializedJob[];
  updatedAt: string;
}

const STATE_STYLE: Record<string, string> = { waiting: "bg-slate-100 text-slate-700", delayed: "bg-amber-100 text-amber-800", active: "bg-blue-100 text-blue-800", completed: "bg-emerald-100 text-emerald-800", failed: "bg-red-100 text-red-800", prioritized: "bg-slate-100 text-slate-700", "waiting-children": "bg-slate-100 text-slate-700", unknown: "bg-slate-100 text-slate-700" };
const FILTERS = ["all", "waiting", "active", "delayed", "completed", "failed"] as const;

export function JobsDashboard({ initial }: { initial: JobsSnapshot }) {
  const [data, setData] = useState<JobsSnapshot>(initial);
  const [auto, setAuto] = useState(true);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [queue, setQueue] = useState<"all" | QueueName>("all");
  const [selected, setSelected] = useState<SerializedJob | null>(null);
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/jobs", { cache: "no-store" });
      if (res.ok) setData(await res.json());
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [auto, refresh]);

  const run = (fn: () => Promise<{ ok: boolean; message: string }>) => start(async () => { const r = await fn(); if (r.ok) toast.success(r.message); else toast.error(r.message); await refresh(); });

  const jobs = data.jobs.filter((j) => (filter === "all" || j.state === filter) && (queue === "all" || j.queue === queue));
  const totals = data.stats.reduce((acc, s) => ({ waiting: acc.waiting + s.waiting + s.delayed, active: acc.active + s.active, completed: acc.completed + s.completed, failed: acc.failed + s.failed }), { waiting: 0, active: 0, completed: 0, failed: 0 });

  return (
    <div className="space-y-6">
      {!data.redis.ok && <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="h-5 w-5 shrink-0" /> Redis est injoignable ({data.redis.message}). Démarrez le service (<code className="rounded bg-white px-1">docker compose up -d redis</code>) pour traiter les jobs.</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ l: "En attente", v: totals.waiting, Icon: Clock, c: "bg-slate-100 text-slate-700" }, { l: "En cours", v: totals.active, Icon: Loader2, c: "bg-blue-100 text-blue-800" }, { l: "Terminés", v: totals.completed, Icon: CheckCircle2, c: "bg-emerald-100 text-emerald-800" }, { l: "Échoués", v: totals.failed, Icon: AlertTriangle, c: totals.failed ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700" }].map((s) => (
          <div key={s.l} className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft"><span className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl", s.c)}><s.Icon className={cn("h-6 w-6", s.l === "En cours" && s.v > 0 && "animate-spin")} /></span><div><div className="text-2xl font-extrabold text-primary">{s.v}</div><div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.l}</div></div></div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.stats.map((s) => (
          <Panel key={s.name} title={`Queue « ${s.name} »`} actions={<div className="flex items-center gap-2">{s.isPaused && <Pill className="bg-amber-100 text-amber-800">En pause</Pill>}<Button size="sm" variant="ghost" loading={pending} onClick={() => run(() => pauseQueueAction(s.name, !s.isPaused))}>{s.isPaused ? <><Play className="h-3.5 w-3.5" /> Reprendre</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}</Button></div>}>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {[["Attente", s.waiting], ["Différés", s.delayed], ["Actifs", s.active], ["Terminés", s.completed], ["Échoués", s.failed]].map(([l, v]) => <div key={l as string} className="rounded-xl bg-surface p-2"><div className="text-lg font-extrabold text-primary">{v}</div><div className="text-muted">{l}</div></div>)}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" loading={pending} disabled={!s.failed} onClick={() => run(() => retryAllFailedAction(s.name))}><RotateCcw className="h-3.5 w-3.5" /> Relancer les échoués</Button>
              <Button size="sm" variant="ghost" loading={pending} onClick={() => run(() => cleanQueueAction(s.name, "completed"))}><Eraser className="h-3.5 w-3.5" /> Nettoyer terminés</Button>
              <Button size="sm" variant="ghost" loading={pending} onClick={() => confirm("Supprimer tous les jobs échoués ?") && run(() => cleanQueueAction(s.name, "failed"))}><Trash2 className="h-3.5 w-3.5" /> Purger échoués</Button>
            </div>
          </Panel>
        ))}
      </div>

      <Panel padded={false} title="Jobs" actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" loading={pending} onClick={() => run(resyncPendingInscriptions)}><Database className="h-3.5 w-3.5" /> Resynchroniser inscriptions en échec</Button>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-muted"><input type="checkbox" className="accent-secondary" checked={auto} onChange={(e) => setAuto(e.target.checked)} /> Auto 5s</label>
          <button type="button" onClick={refresh} className="rounded-full p-2 hover:bg-surface" aria-label="Rafraîchir"><RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /></button>
        </div>
      }>
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3">
          {FILTERS.map((f) => <button key={f} type="button" onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1 text-xs font-bold", filter === f ? "bg-primary text-white" : "bg-surface text-slate-600 hover:bg-primary-50")}>{f === "all" ? "Tous" : f}</button>)}
          <span className="mx-2 h-4 w-px bg-line" />
          {(["all", "erp-sync", "emails"] as const).map((q) => <button key={q} type="button" onClick={() => setQueue(q)} className={cn("rounded-full px-3 py-1 text-xs font-bold", queue === q ? "bg-secondary text-white" : "bg-surface text-slate-600 hover:bg-secondary-50")}>{q === "all" ? "Toutes queues" : q}</button>)}
          <span className="ml-auto text-[11px] text-muted"><Timer className="mr-1 inline h-3 w-3" /> MAJ {formatDateTime(data.updatedAt)}</span>
        </div>
        {jobs.length === 0 ? <div className="p-5"><EmptyState text="Aucun job." /></div> : (
          <Table>
            <thead className="bg-surface"><tr><Th>ID</Th><Th>Queue / type</Th><Th>État</Th><Th>Tentatives</Th><Th>Créé</Th><Th>Terminé</Th><Th>Erreur</Th><Th></Th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={`${j.queue}-${j.id}`} className="border-t border-line hover:bg-surface">
                  <Td><button type="button" onClick={() => setSelected(j)} className="max-w-[200px] truncate font-mono text-xs font-bold text-primary hover:text-secondary">{j.id}</button></Td>
                  <Td><div className="text-xs font-bold text-primary">{j.queue}</div><div className="text-xs text-muted">{j.name}{j.queue === "emails" && (j.data as { ref?: string }).ref ? ` · ${(j.data as { ref?: string }).ref}` : ""}</div></Td>
                  <Td><Pill className={STATE_STYLE[j.state] ?? STATE_STYLE.unknown}>{j.state}</Pill></Td>
                  <Td className="text-xs">{j.attemptsMade} / {j.maxAttempts}</Td>
                  <Td className="text-xs text-muted">{formatDateTime(new Date(j.timestamp))}</Td>
                  <Td className="text-xs text-muted">{j.finishedOn ? formatDateTime(new Date(j.finishedOn)) : "–"}</Td>
                  <Td className="max-w-[240px] truncate text-xs text-red-700" title={j.failedReason}>{j.failedReason ?? "–"}</Td>
                  <Td><div className="flex gap-1">{(j.state === "failed" || j.state === "completed") && <button type="button" disabled={pending} title="Relancer" onClick={() => run(() => retryJobAction(j.queue, j.id))} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary hover:bg-primary hover:text-white"><RotateCcw className="h-4 w-4" /></button>}{j.state !== "active" && <button type="button" disabled={pending} title="Supprimer" onClick={() => run(() => removeJobAction(j.queue, j.id))} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /></button>}</div></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `Job ${selected.id}` : ""} size="lg">
        {selected && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2"><Pill className={STATE_STYLE[selected.state] ?? ""}>{selected.state}</Pill><Pill className="bg-surface text-slate-600">{selected.queue} · {selected.name}</Pill><Pill className="bg-surface text-slate-600">Tentatives {selected.attemptsMade}/{selected.maxAttempts}</Pill></div>
            <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Données</h4><pre className="max-h-64 overflow-auto rounded-xl bg-dark p-3 text-xs text-emerald-200">{JSON.stringify(selected.data, null, 2)}</pre></div>
            {selected.returnvalue !== undefined && selected.returnvalue !== null && <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Résultat</h4><pre className="max-h-40 overflow-auto rounded-xl bg-dark p-3 text-xs text-sky-200">{JSON.stringify(selected.returnvalue, null, 2)}</pre></div>}
            {selected.failedReason && <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Erreur</h4><pre className="max-h-40 overflow-auto rounded-xl bg-red-950 p-3 text-xs text-red-200">{selected.failedReason}{selected.stacktrace?.length ? "\n\n" + selected.stacktrace.join("\n") : ""}</pre></div>}
          </div>
        )}
      </Modal>
    </div>
  );
}

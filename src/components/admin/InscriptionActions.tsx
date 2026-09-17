"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { STATUT_LABELS } from "@/lib/constants";
import { updateInscriptionStatut, deleteInscription } from "@/app/actions/admin-inscriptions";
import { resyncInscription } from "@/app/actions/inscriptions";
import type { InscriptionStatut } from "@prisma/client";

export function InscriptionStatutForm({ id, statut, notesAdmin, canDelete }: { id: string; statut: InscriptionStatut; notesAdmin?: string | null; canDelete: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState({ statut, notesAdmin: notesAdmin ?? "", notifierCandidat: false, message: "" });

  const save = () =>
    start(async () => {
      const res = await updateInscriptionStatut({ id, ...form });
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.message);
    });
  const resync = () =>
    start(async () => {
      const res = await resyncInscription(id);
      if (res.ok) toast.success(res.message); else toast.error(res.message);
      router.refresh();
    });
  const remove = () => {
    if (!confirm("Supprimer définitivement cette inscription ?")) return;
    start(async () => {
      const res = await deleteInscription(id);
      if (res.ok) {
        toast.success(res.message);
        router.push("/admin/inscriptions");
      } else toast.error(res.message);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="field-label">Statut du dossier</label>
        <select className="field-input" value={form.statut} onChange={(e) => setForm({ ...form, statut: e.target.value as InscriptionStatut })}>{Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>
      <div>
        <label className="field-label">Notes internes</label>
        <textarea rows={4} className="field-input" value={form.notesAdmin} onChange={(e) => setForm({ ...form, notesAdmin: e.target.value })} placeholder="Suivi, appels, remarques…" />
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" checked={form.notifierCandidat} onChange={(e) => setForm({ ...form, notifierCandidat: e.target.checked })} /> Notifier le candidat par email</label>
      {form.notifierCandidat && <textarea rows={3} className="field-input" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Message personnalisé (facultatif)" />}
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" loading={pending} onClick={save}><Save className="h-4 w-4" /> Enregistrer</Button>
        <Button variant="outline" size="sm" loading={pending} onClick={resync}><RefreshCw className="h-4 w-4" /> Resynchroniser ERP</Button>
        {canDelete && <Button variant="danger" size="sm" loading={pending} onClick={remove}><Trash2 className="h-4 w-4" /> Supprimer</Button>}
      </div>
    </div>
  );
}

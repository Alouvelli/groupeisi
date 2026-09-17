"use client";

import { useState } from "react";
import { Code } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export function LogDetails({ request, response, endpoint, method }: { request: unknown; response: unknown; endpoint?: string | null; method?: string | null }) {
  const [open, setOpen] = useState(false);
  if (!request && !response) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Détails" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary hover:bg-primary hover:text-white"><Code className="h-4 w-4" /></button>
      <Modal open={open} onClose={() => setOpen(false)} title="Détails de l'appel" size="lg">
        {endpoint && <p className="mb-4 font-mono text-xs text-muted">{method} {endpoint}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div><h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Requête</h4><pre className="max-h-96 overflow-auto rounded-xl bg-dark p-4 text-xs text-emerald-200">{request ? JSON.stringify(request, null, 2) : "–"}</pre></div>
          <div><h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Réponse</h4><pre className="max-h-96 overflow-auto rounded-xl bg-dark p-4 text-xs text-sky-200">{response ? JSON.stringify(response, null, 2) : "–"}</pre></div>
        </div>
      </Modal>
    </>
  );
}

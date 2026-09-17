"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Eye, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateMessageStatut, deleteMessage } from "@/app/actions/messages";

export function MessageActions({ id, statut, email, sujet }: { id: string; statut: "NOUVEAU" | "LU" | "TRAITE"; email: string; sujet: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) => start(async () => { const r = await fn(); if (r.ok) toast.success(r.message); else toast.error(r.message); router.refresh(); });
  return (
    <div className="flex flex-wrap gap-2">
      <Button href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${sujet}`)}`} external variant="outline" size="sm"><Reply className="h-3.5 w-3.5" /> Répondre</Button>
      {statut === "NOUVEAU" && <Button variant="ghost" size="sm" loading={pending} onClick={() => run(() => updateMessageStatut(id, "LU"))}><Eye className="h-3.5 w-3.5" /> Marquer lu</Button>}
      {statut !== "TRAITE" && <Button variant="ghost" size="sm" loading={pending} onClick={() => run(() => updateMessageStatut(id, "TRAITE"))}><Check className="h-3.5 w-3.5" /> Traité</Button>}
      <Button variant="ghost" size="sm" className="text-red-600" loading={pending} onClick={() => confirm("Supprimer ce message ?") && run(() => deleteMessage(id))}><Trash2 className="h-3.5 w-3.5" /></Button>
    </div>
  );
}

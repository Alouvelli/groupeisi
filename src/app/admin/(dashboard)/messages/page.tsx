import { prisma } from "@/lib/prisma";
import { PageTitle, Panel, Pill, EmptyState } from "@/components/admin/ui";
import { MessageActions } from "@/components/admin/MessageActions";
import { formatDateTime } from "@/lib/utils";

const COLORS = { NOUVEAU: "bg-blue-100 text-blue-800", LU: "bg-amber-100 text-amber-800", TRAITE: "bg-emerald-100 text-emerald-800" };

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <>
      <PageTitle title="Messages de contact" description={`${messages.length} message(s)`} />
      {messages.length === 0 ? <EmptyState text="Aucun message." /> : (
        <div className="space-y-4">
          {messages.map((m) => (
            <Panel key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><div className="flex flex-wrap items-center gap-2"><span className="font-extrabold text-primary">{m.nom}</span><Pill className={COLORS[m.statut]}>{m.statut}</Pill>{m.erpSynced && <Pill className="bg-slate-100 text-slate-600">ERP</Pill>}</div><div className="mt-1 text-xs text-muted"><a href={`mailto:${m.email}`} className="text-secondary">{m.email}</a>{m.telephone && ` · ${m.telephone}`} · {formatDateTime(m.createdAt)}</div></div>
                <MessageActions id={m.id} statut={m.statut} email={m.email} sujet={m.sujet} />
              </div>
              <div className="mt-3 text-sm font-bold text-primary">{m.sujet}</div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{m.message}</p>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}

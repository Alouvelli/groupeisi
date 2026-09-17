import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PageTitle, Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { InscriptionStatutForm } from "@/components/admin/InscriptionActions";
import { STATUT_LABELS, STATUT_COLORS, ERP_SYNC_LABELS, ERP_SYNC_COLORS, CIVILITE_LABELS, NIVEAU_ETUDES_LABELS, MODE_FORMATION_LABELS, SOURCE_LABELS, NIVEAU_LABELS } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return <div className="grid grid-cols-3 gap-2 border-b border-line py-2 text-sm last:border-0"><dt className="text-muted">{label}</dt><dd className="col-span-2 font-semibold text-primary">{value}</dd></div>;
}

export default async function InscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const i = await prisma.inscription.findUnique({ where: { id }, include: { programme: true, campus: true, mapping: true, traitePar: { select: { nom: true } }, logs: { orderBy: { createdAt: "desc" }, take: 30 } } });
  if (!i) notFound();
  return (
    <>
      <PageTitle title={`Dossier ${i.numero}`} description={`${CIVILITE_LABELS[i.civilite]} ${i.prenom} ${i.nom} · déposé le ${formatDateTime(i.createdAt)}`} actions={<Link href="/admin/inscriptions" className="inline-flex items-center gap-1 text-sm font-bold text-secondary"><ArrowLeft className="h-4 w-4" /> Retour à la liste</Link>} />
      <div className="mb-4 flex flex-wrap gap-2"><Pill className={STATUT_COLORS[i.statut]}>{STATUT_LABELS[i.statut]}</Pill><Pill className={ERP_SYNC_COLORS[i.erpSyncStatus]}>ERP : {ERP_SYNC_LABELS[i.erpSyncStatus]}</Pill>{i.emailEnvoye && <Pill className="bg-slate-100 text-slate-600">Email de confirmation envoyé</Pill>}</div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Identité et contact"><dl>
            <Row label="Nom complet" value={`${CIVILITE_LABELS[i.civilite]} ${i.prenom} ${i.nom}`} />
            <Row label="Naissance" value={`${formatDate(i.dateNaissance)} à ${i.lieuNaissance}`} />
            <Row label="Nationalité" value={i.nationalite} />
            <Row label="Pièce d'identité" value={i.numeroPiece} />
            <Row label="Email" value={<a href={`mailto:${i.email}`} className="text-secondary">{i.email}</a>} />
            <Row label="Téléphone" value={<><a href={`tel:${i.telephone}`} className="text-secondary">{i.telephone}</a>{i.telephone2 && ` · ${i.telephone2}`}</>} />
            <Row label="Adresse" value={`${i.adresse}, ${i.ville}, ${i.pays}`} />
          </dl></Panel>
          <Panel title="Parcours scolaire"><dl>
            <Row label="Niveau d'études" value={NIVEAU_ETUDES_LABELS[i.niveauEtudes]} />
            <Row label="Baccalauréat" value={[i.serieBac, i.anneeBac, i.mentionBac].filter(Boolean).join(" · ")} />
            <Row label="Établissement d'origine" value={i.etablissementOrigine} />
            <Row label="Dernier diplôme" value={i.dernierDiplome} />
          </dl></Panel>
          <Panel title="Formation souhaitée"><dl>
            <Row label="Formation" value={<Link href={`/programmes/${i.programme.slug}`} target="_blank" className="text-secondary">{i.programme.titre} ({NIVEAU_LABELS[i.programme.niveau]})</Link>} />
            <Row label="Campus" value={i.campus.nom} />
            <Row label="Niveau d'entrée" value={i.niveauEntree} />
            <Row label="Rentrée" value={i.rentree} />
            <Row label="Mode" value={MODE_FORMATION_LABELS[i.modeFormation]} />
            <Row label="Bourse / logement" value={`${i.besoinBourse ? "Demande de bourse" : "–"} · ${i.besoinLogement ? "Besoin de logement" : "–"}`} />
          </dl></Panel>
          <Panel title="Tuteur et divers"><dl>
            <Row label="Tuteur" value={[i.tuteurNom, i.tuteurLien, i.tuteurTelephone, i.tuteurEmail].filter(Boolean).join(" · ")} />
            <Row label="Source" value={SOURCE_LABELS[i.sourceConnaissance]} />
            <Row label="Motivation" value={i.motivation && <span className="whitespace-pre-wrap font-normal">{i.motivation}</span>} />
            <Row label="Newsletter" value={i.newsletter ? "Oui" : "Non"} />
            <Row label="IP / navigateur" value={<span className="font-mono text-xs font-normal">{i.ipAddress} · {i.userAgent?.slice(0, 80)}</span>} />
          </dl></Panel>
          <Panel title="Historique de synchronisation ERP" padded={false}>
            {i.logs.length === 0 ? <div className="p-5"><EmptyState text="Aucun log pour ce dossier." /></div> : (
              <Table>
                <thead className="bg-surface"><tr><Th>Date</Th><Th>Action</Th><Th>Statut</Th><Th>Tentative</Th><Th>HTTP</Th><Th>Message</Th></tr></thead>
                <tbody>{i.logs.map((l) => <tr key={l.id} className="border-t border-line"><Td className="whitespace-nowrap text-xs text-muted">{formatDateTime(l.createdAt)}</Td><Td className="font-semibold">{l.action}</Td><Td><Pill className={l.status === "SUCCESS" ? "bg-emerald-100 text-emerald-800" : l.status === "ERROR" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-600"}>{l.status}</Pill></Td><Td>{l.attempt ?? "–"}</Td><Td>{l.statusCode ?? "–"}</Td><Td className="max-w-[320px] truncate text-xs" title={l.errorMessage ?? l.message ?? ""}>{l.errorMessage ?? l.message}</Td></tr>)}</tbody>
              </Table>
            )}
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Traitement du dossier">
            <InscriptionStatutForm id={i.id} statut={i.statut} notesAdmin={i.notesAdmin} canDelete={user.role !== "EDITEUR"} />
            {i.traitePar && <p className="mt-4 text-xs text-muted">Dernier traitement par {i.traitePar.nom} le {formatDateTime(i.traiteAt)}</p>}
          </Panel>
          <Panel title="Synchronisation ERP / CRM"><dl>
            <Row label="Statut" value={<Pill className={ERP_SYNC_COLORS[i.erpSyncStatus]}>{ERP_SYNC_LABELS[i.erpSyncStatus]}</Pill>} />
            <Row label="Tentatives" value={i.erpAttempts} />
            <Row label="ID prospect" value={i.erpProspectId && <span className="font-mono text-xs">{i.erpProspectId}</span>} />
            <Row label="ID contact" value={i.erpContactId && <span className="font-mono text-xs">{i.erpContactId}</span>} />
            <Row label="Dernière synchro" value={i.erpSyncedAt && formatDateTime(i.erpSyncedAt)} />
            <Row label="Job" value={i.erpJobId && <Link href="/admin/jobs" className="font-mono text-xs text-secondary">{i.erpJobId}</Link>} />
            <Row label="Dernière erreur" value={i.erpLastError && <span className="text-red-600">{i.erpLastError}</span>} />
            {i.mapping && <>
              <Row label="Mapping" value={`${i.mapping.erpEntityType} #${i.mapping.erpEntityId}`} />
              <Row label="Statut ERP" value={i.mapping.erpStatus} />
              <Row label="Lien ERP" value={i.mapping.erpUrl && <a href={i.mapping.erpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-secondary">Ouvrir dans l&apos;ERP <ExternalLink className="h-3 w-3" /></a>} />
            </>}
          </dl></Panel>
        </div>
      </div>
    </>
  );
}

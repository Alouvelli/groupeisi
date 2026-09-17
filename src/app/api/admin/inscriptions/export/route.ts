import { NextResponse, type NextRequest } from "next/server";
import type { InscriptionStatut, ERPSyncStatus, Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUT_LABELS, ERP_SYNC_LABELS, NIVEAU_ETUDES_LABELS, MODE_FORMATION_LABELS, SOURCE_LABELS, CIVILITE_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const where: Prisma.InscriptionWhereInput = {
    ...(sp.get("statut") ? { statut: sp.get("statut") as InscriptionStatut } : {}),
    ...(sp.get("sync") ? { erpSyncStatus: sp.get("sync") as ERPSyncStatus } : {}),
    ...(sp.get("campus") ? { campusId: sp.get("campus")! } : {}),
    ...(sp.get("programme") ? { programmeId: sp.get("programme")! } : {}),
  };
  const rows = await prisma.inscription.findMany({ where, orderBy: { createdAt: "desc" }, include: { programme: { select: { titre: true } }, campus: { select: { nom: true } } } });
  const headers = ["Numero", "Date", "Civilite", "Prenom", "Nom", "Date naissance", "Lieu naissance", "Nationalite", "Email", "Telephone", "Telephone 2", "Adresse", "Ville", "Pays", "Niveau etudes", "Serie Bac", "Annee Bac", "Etablissement", "Formation", "Campus", "Niveau entree", "Rentree", "Mode", "Tuteur", "Tel tuteur", "Source", "Bourse", "Logement", "Statut", "Sync ERP", "ID ERP"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) => [r.numero, r.createdAt.toISOString(), CIVILITE_LABELS[r.civilite], r.prenom, r.nom, r.dateNaissance.toISOString().slice(0, 10), r.lieuNaissance, r.nationalite, r.email, r.telephone, r.telephone2, r.adresse, r.ville, r.pays, NIVEAU_ETUDES_LABELS[r.niveauEtudes], r.serieBac, r.anneeBac, r.etablissementOrigine, r.programme.titre, r.campus.nom, r.niveauEntree, r.rentree, MODE_FORMATION_LABELS[r.modeFormation], r.tuteurNom, r.tuteurTelephone, SOURCE_LABELS[r.sourceConnaissance], r.besoinBourse ? "Oui" : "Non", r.besoinLogement ? "Oui" : "Non", STATUT_LABELS[r.statut], ERP_SYNC_LABELS[r.erpSyncStatus], r.erpProspectId].map(esc).join(";"));
  const csv = "﻿" + [headers.join(";"), ...lines].join("\r\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inscriptions-${new Date().toISOString().slice(0, 10)}.csv"` } });
}

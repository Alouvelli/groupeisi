import { requireUser, ROLE_LABELS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [nouvelles, messages] = await Promise.all([
    prisma.inscription.count({ where: { statut: "NOUVELLE" } }),
    prisma.contactMessage.count({ where: { statut: "NOUVEAU" } }),
  ]);
  return (
    <AdminShell user={{ nom: user.nom, email: user.email, role: ROLE_LABELS[user.role] }} badges={{ "/admin/inscriptions": nouvelles, "/admin/messages": messages }}>
      {children}
    </AdminShell>
  );
}

import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageTitle, Panel, Pill, Table, Th, Td, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { PostRowActions } from "@/components/admin/PostForm";

export default async function AdminActualitesPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" }, include: { categorie: true, auteur: { select: { nom: true } } } });
  return (
    <>
      <PageTitle title="Actualités" description={`${posts.length} article(s)`} actions={<Button href="/admin/actualites/new" variant="secondary" size="sm"><Plus className="h-4 w-4" /> Nouvel article</Button>} />
      <Panel padded={false}>
        {posts.length === 0 ? <div className="p-5"><EmptyState text="Aucun article." /></div> : (
          <Table>
            <thead className="bg-surface"><tr><Th>Titre</Th><Th>Catégorie</Th><Th>Auteur</Th><Th>Vues</Th><Th>Publication</Th><Th>État</Th><Th></Th></tr></thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-line hover:bg-surface">
                  <Td><Link href={`/admin/actualites/${p.id}`} className="font-bold text-primary hover:text-secondary">{p.titre}</Link><div className="text-xs text-muted">/{p.slug}</div></Td>
                  <Td>{p.categorie ? <Pill className="text-white" ><span style={{ color: p.categorie.couleur ?? undefined }}>{p.categorie.nom}</span></Pill> : "–"}</Td>
                  <Td className="text-xs">{p.auteur?.nom ?? "–"}</Td>
                  <Td>{p.vues}</Td>
                  <Td className="text-xs">{p.publishedAt ? formatDate(p.publishedAt) : "–"}</Td>
                  <Td><div className="flex gap-1">{p.isPublished ? <Pill className="bg-emerald-100 text-emerald-800">Publié</Pill> : <Pill className="bg-amber-100 text-amber-800">Brouillon</Pill>}{p.isFeatured && <Pill className="bg-secondary-50 text-secondary">Une</Pill>}</div></Td>
                  <Td><div className="flex items-center gap-1"><Link href={`/admin/actualites/${p.id}`} aria-label="Modifier" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary hover:bg-primary hover:text-white"><Pencil className="h-4 w-4" /></Link><PostRowActions id={p.id} isPublished={p.isPublished} /></div></Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </>
  );
}

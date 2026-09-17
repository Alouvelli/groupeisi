import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/admin/ui";
import { PostForm } from "@/components/admin/PostForm";

export default async function NewPostPage() {
  const categories = await prisma.categorieActualite.findMany({ select: { id: true, nom: true }, orderBy: { ordre: "asc" } });
  return (
    <>
      <PageTitle title="Nouvel article" />
      <PostForm categories={categories} />
    </>
  );
}

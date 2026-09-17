"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Save, Trash2, Eye, EyeOff } from "lucide-react";
import { postSchema, type PostFormValues } from "@/lib/validations";
import { savePost, deletePost, togglePostPublished } from "@/app/actions/posts";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/admin/ui";
import { slugify } from "@/lib/utils";

export function PostForm({ id, defaultValues, categories }: { id?: string; defaultValues?: Partial<PostFormValues>; categories: { id: string; nom: string }[] }) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<PostFormValues>({ resolver: zodResolver(postSchema), defaultValues: { isPublished: false, isFeatured: false, ...defaultValues } });
  const onSubmit = async (values: PostFormValues) => {
    const res = await savePost(id ?? null, values);
    if (res.ok) {
      toast.success(res.message);
      router.push("/admin/actualites");
      router.refresh();
    } else toast.error(res.message);
  };
  const e = (k: keyof PostFormValues) => errors[k]?.message as string | undefined;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-3" noValidate>
      <div className="space-y-6 xl:col-span-2">
        <Panel title="Contenu">
          <div className="space-y-4">
            <div><label className="field-label">Titre *</label><input className="field-input" {...register("titre", { onBlur: (ev) => !watch("slug") && setValue("slug", slugify(ev.target.value)) })} />{e("titre") && <p className="field-error">{e("titre")}</p>}</div>
            <div><label className="field-label">Slug *</label><input className="field-input font-mono text-xs" {...register("slug")} />{e("slug") && <p className="field-error">{e("slug")}</p>}</div>
            <div><label className="field-label">Extrait *</label><textarea rows={3} className="field-input" {...register("extrait")} />{e("extrait") && <p className="field-error">{e("extrait")}</p>}</div>
            <div><label className="field-label">Contenu (HTML) *</label><textarea rows={18} className="field-input font-mono text-xs" {...register("contenu")} />{e("contenu") && <p className="field-error">{e("contenu")}</p>}<p className="field-help">Balises acceptées : p, h2, h3, ul, ol, li, strong, em, a, blockquote, img.</p></div>
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Publication">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("isPublished")} /> Publié</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("isFeatured")} /> À la une</label>
            <div><label className="field-label">Date de publication</label><input type="datetime-local" className="field-input" {...register("publishedAt")} /></div>
          </div>
          <Button type="submit" variant="secondary" loading={isSubmitting} className="mt-5 w-full"><Save className="h-4 w-4" /> Enregistrer</Button>
        </Panel>
        <Panel title="Classement">
          <div className="space-y-4">
            <div><label className="field-label">Catégorie</label><select className="field-input" {...register("categorieId")}><option value="">–</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select></div>
            <div><label className="field-label">Tags (séparés par des virgules)</label><input className="field-input" placeholder="admissions, rentrée" {...register("tags")} /></div>
            <div><label className="field-label">Image (URL)</label><input className="field-input" placeholder="https://…" {...register("image")} /></div>
          </div>
        </Panel>
      </div>
    </form>
  );
}

export function PostRowActions({ id, isPublished }: { id: string; isPublished: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) => start(async () => { const r = await fn(); if (r.ok) toast.success(r.message); else toast.error(r.message); router.refresh(); });
  return (
    <>
      <button type="button" disabled={pending} title={isPublished ? "Dépublier" : "Publier"} onClick={() => run(() => togglePostPublished(id))} className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"} hover:opacity-80`}>{isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
      <button type="button" disabled={pending} title="Supprimer" onClick={() => confirm("Supprimer cet article ?") && run(() => deletePost(id))} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /></button>
    </>
  );
}

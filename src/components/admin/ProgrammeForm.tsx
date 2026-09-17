"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Save, Trash2, Star, Power } from "lucide-react";
import { programmeSchema, type ProgrammeFormValues } from "@/lib/validations";
import { saveProgramme, deleteProgramme, toggleProgramme } from "@/app/actions/programmes";
import { NIVEAU_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/admin/ui";
import { slugify } from "@/lib/utils";

export interface ProgrammeFormProps {
  id?: string;
  defaultValues?: Partial<ProgrammeFormValues>;
  departements: { id: string; nom: string }[];
  campus: { id: string; nom: string }[];
}

export function ProgrammeForm({ id, defaultValues, departements, campus }: ProgrammeFormProps) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProgrammeFormValues>({
    resolver: zodResolver(programmeSchema),
    defaultValues: { niveau: "LICENCE", duree: "3 ans", ordre: 0, isActive: true, isFeatured: false, campusIds: [], ...defaultValues },
  });
  const onSubmit = async (values: ProgrammeFormValues) => {
    const res = await saveProgramme(id ?? null, values);
    if (res.ok) {
      toast.success(res.message);
      router.push("/admin/programmes");
      router.refresh();
    } else toast.error(res.message);
  };
  const e = (k: keyof ProgrammeFormValues) => errors[k]?.message as string | undefined;
  const F = ({ label, name, children, className }: { label: string; name: keyof ProgrammeFormValues; children: React.ReactNode; className?: string }) => (
    <div className={className}><label className="field-label">{label}</label>{children}{e(name) && <p className="field-error">{e(name)}</p>}</div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-3" noValidate>
      <div className="space-y-6 xl:col-span-2">
        <Panel title="Informations générales">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Titre *" name="titre" className="sm:col-span-2"><input className="field-input" {...register("titre", { onBlur: (ev) => !watch("slug") && setValue("slug", slugify(ev.target.value)) })} /></F>
            <F label="Slug (URL) *" name="slug"><input className="field-input font-mono text-xs" {...register("slug")} /></F>
            <F label="Niveau *" name="niveau"><select className="field-input" {...register("niveau")}>{Object.entries(NIVEAU_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></F>
            <F label="Département *" name="departementId"><select className="field-input" {...register("departementId")}><option value="">Sélectionnez…</option>{departements.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}</select></F>
            <F label="Durée *" name="duree"><input className="field-input" placeholder="3 ans" {...register("duree")} /></F>
            <F label="Accroche" name="accroche" className="sm:col-span-2"><input className="field-input" {...register("accroche")} /></F>
            <F label="Description *" name="description" className="sm:col-span-2"><textarea rows={4} className="field-input" {...register("description")} /></F>
            <F label="Contenu détaillé (HTML)" name="contenu" className="sm:col-span-2"><textarea rows={8} className="field-input font-mono text-xs" {...register("contenu")} /></F>
          </div>
        </Panel>
        <Panel title="Pédagogie et débouchés">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Objectifs (un par ligne)" name="objectifs"><textarea rows={5} className="field-input" {...register("objectifs")} /></F>
            <F label="Débouchés (un par ligne)" name="debouches"><textarea rows={5} className="field-input" {...register("debouches")} /></F>
            <F label="Compétences (une par ligne)" name="competences"><textarea rows={4} className="field-input" {...register("competences")} /></F>
            <F label="Conditions d'admission" name="conditionsAdmission"><textarea rows={4} className="field-input" {...register("conditionsAdmission")} /></F>
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Publication">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("isActive")} /> Actif (visible sur le site)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-secondary" {...register("isFeatured")} /> Mis en avant (page d&apos;accueil)</label>
            <F label="Ordre d'affichage" name="ordre"><input type="number" className="field-input" {...register("ordre")} /></F>
          </div>
          <div className="mt-5 flex gap-2"><Button type="submit" variant="secondary" loading={isSubmitting} className="flex-1"><Save className="h-4 w-4" /> Enregistrer</Button></div>
        </Panel>
        <Panel title="Frais et diplôme">
          <div className="space-y-4">
            <F label="Frais d'inscription (FCFA)" name="fraisInscription"><input type="number" className="field-input" {...register("fraisInscription")} /></F>
            <F label="Scolarité annuelle (FCFA)" name="fraisScolarite"><input type="number" className="field-input" {...register("fraisScolarite")} /></F>
            <F label="Diplôme délivré" name="diplome"><input className="field-input" placeholder="Licence professionnelle" {...register("diplome")} /></F>
            <F label="Accréditation" name="accreditation"><input className="field-input" placeholder="ANAQ-Sup / CAMES" {...register("accreditation")} /></F>
            <F label="Code ERP" name="erpCode"><input className="field-input font-mono text-xs" placeholder="PROG-XXX" {...register("erpCode")} /></F>
          </div>
        </Panel>
        <Panel title="Médias">
          <div className="space-y-4">
            <F label="Image (URL)" name="image"><input className="field-input" placeholder="https://…" {...register("image")} /></F>
            <F label="Brochure PDF (URL)" name="brochureUrl"><input className="field-input" placeholder="/documents/…" {...register("brochureUrl")} /></F>
          </div>
        </Panel>
        <Panel title="Campus">
          <div className="grid gap-2">{campus.map((c) => <label key={c.id} className="flex items-center gap-2 text-sm"><input type="checkbox" value={c.id} className="h-4 w-4 accent-secondary" {...register("campusIds")} /> {c.nom}</label>)}</div>
          {e("campusIds") && <p className="field-error">{e("campusIds")}</p>}
        </Panel>
      </div>
    </form>
  );
}

export function ProgrammeRowActions({ id, isActive, isFeatured }: { id: string; isActive: boolean; isFeatured: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message: string }>) => start(async () => { const r = await fn(); if (r.ok) toast.success(r.message); else toast.error(r.message); router.refresh(); });
  return (
    <>
      <button type="button" disabled={pending} title={isFeatured ? "Retirer de la une" : "Mettre à la une"} onClick={() => run(() => toggleProgramme(id, "isFeatured"))} className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isFeatured ? "bg-secondary text-white" : "bg-slate-100 text-slate-500"} hover:opacity-80`}><Star className="h-4 w-4" /></button>
      <button type="button" disabled={pending} title={isActive ? "Désactiver" : "Activer"} onClick={() => run(() => toggleProgramme(id, "isActive"))} className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"} hover:opacity-80`}><Power className="h-4 w-4" /></button>
      <button type="button" disabled={pending} title="Supprimer" onClick={() => confirm("Supprimer ce programme ?") && run(() => deleteProgramme(id))} className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /></button>
    </>
  );
}

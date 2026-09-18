"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, Send, User, MapPin, GraduationCap, BookOpen, Users, MessageSquare, Lock } from "lucide-react";
import { inscriptionSchema, type InscriptionFormValues } from "@/lib/validations";
import { submitInscription, type InscriptionOptions } from "@/app/actions/inscriptions";
import { CIVILITE_LABELS, MODE_FORMATION_LABELS, NIVEAU_ENTREE_OPTIONS, NIVEAU_ETUDES_LABELS, NIVEAU_LABELS, PAYS_OPTIONS, SERIE_BAC_OPTIONS, SOURCE_LABELS, TUTEUR_LIEN_OPTIONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { cn, formatFCFA } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Identité", Icon: User, fields: ["civilite", "prenom", "nom", "dateNaissance", "lieuNaissance", "nationalite", "numeroPiece"] },
  { id: 2, title: "Coordonnées", Icon: MapPin, fields: ["email", "telephone", "telephone2", "adresse", "ville", "pays"] },
  { id: 3, title: "Parcours", Icon: GraduationCap, fields: ["niveauEtudes", "serieBac", "anneeBac", "mentionBac", "etablissementOrigine", "dernierDiplome"] },
  { id: 4, title: "Formation", Icon: BookOpen, fields: ["programmeId", "campusId", "niveauEntree", "rentree", "modeFormation"] },
  { id: 5, title: "Tuteur", Icon: Users, fields: ["tuteurNom", "tuteurTelephone", "tuteurEmail", "tuteurLien"] },
  { id: 6, title: "Finalisation", Icon: MessageSquare, fields: ["sourceConnaissance", "motivation", "besoinBourse", "besoinLogement", "newsletter", "accepteConditions"] },
] as const;

function Field({ label, required, error, help, children, className }: { label: string; required?: boolean; error?: string; help?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="field-label">
        {label} {required && <span className="text-secondary">*</span>}
      </label>
      {children}
      {error ? <p className="field-error" role="alert">{error}</p> : help ? <p className="field-help">{help}</p> : null}
    </div>
  );
}

export function PreInscriptionForm({ options, defaultProgrammeId, defaultCampusId }: { options: InscriptionOptions; defaultProgrammeId?: string; defaultCampusId?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<InscriptionFormValues>({
    resolver: zodResolver(inscriptionSchema),
    mode: "onTouched",
    defaultValues: {
      civilite: undefined,
      prenom: "", nom: "", dateNaissance: "", lieuNaissance: "", nationalite: "Sénégalaise", numeroPiece: "",
      email: "", telephone: "", telephone2: "", adresse: "", ville: "", pays: "Sénégal",
      niveauEtudes: undefined, serieBac: "", anneeBac: "", mentionBac: "", etablissementOrigine: "", dernierDiplome: "",
      programmeId: defaultProgrammeId ?? "", campusId: defaultCampusId ?? "", niveauEntree: NIVEAU_ENTREE_OPTIONS[0], rentree: options.rentrees[0] ?? "", modeFormation: "PRESENTIEL",
      tuteurNom: "", tuteurTelephone: "", tuteurEmail: "", tuteurLien: "",
      sourceConnaissance: "SITE_WEB", motivation: "", besoinBourse: false, besoinLogement: false, newsletter: true, accepteConditions: undefined as unknown as true,
      website: "",
    },
  });
  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = form;

  const programmeId = watch("programmeId");
  const campusId = watch("campusId");
  const niveauEtudes = watch("niveauEtudes");
  const selectedProgramme = useMemo(() => options.programmes.find((p) => p.id === programmeId), [options.programmes, programmeId]);
  const availableCampus = useMemo(() => (selectedProgramme && selectedProgramme.campusIds.length ? options.campus.filter((c) => selectedProgramme.campusIds.includes(c.id)) : options.campus), [selectedProgramme, options.campus]);

  useEffect(() => {
    if (campusId && !availableCampus.some((c) => c.id === campusId)) setValue("campusId", "");
  }, [availableCampus, campusId, setValue]);

  // Sauvegarde brouillon (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("isi-preinscription-draft");
      if (raw) {
        const draft = JSON.parse(raw) as Partial<InscriptionFormValues>;
        Object.entries(draft).forEach(([k, v]) => {
          if (k !== "accepteConditions" && v !== undefined && v !== "") setValue(k as FieldPath<InscriptionFormValues>, v as never);
        });
      }
    } catch {}
  }, [setValue]);
  useEffect(() => {
    const sub = watch((values) => {
      try {
        localStorage.setItem("isi-preinscription-draft", JSON.stringify(values));
      } catch {}
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const next = async () => {
    const fields = STEPS[step - 1].fields as unknown as FieldPath<InscriptionFormValues>[];
    const valid = await trigger(fields, { shouldFocus: true });
    if (!valid) {
      toast.error("Veuillez compléter les champs obligatoires.");
      return;
    }
    setStep((s) => Math.min(STEPS.length, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (values: InscriptionFormValues) => {
    setSubmitting(true);
    const res = await submitInscription(values);
    setSubmitting(false);
    if (res.ok && res.data) {
      try {
        localStorage.removeItem("isi-preinscription-draft");
      } catch {}
      toast.success(res.message);
      router.push(`/preinscription/confirmation?numero=${encodeURIComponent(res.data.numero)}&id=${res.data.id}`);
    } else {
      toast.error(res.message);
      if (!res.ok && res.errors) {
        const firstField = Object.keys(res.errors)[0];
        const stepIdx = STEPS.findIndex((s) => (s.fields as readonly string[]).includes(firstField));
        if (stepIdx >= 0) setStep(stepIdx + 1);
        Object.entries(res.errors).forEach(([k, msgs]) => form.setError(k as FieldPath<InscriptionFormValues>, { message: msgs[0] }));
      }
    }
  };

  const err = (name: FieldPath<InscriptionFormValues>) => (errors[name as keyof typeof errors]?.message as string | undefined) ?? undefined;
  const inputProps = (name: FieldPath<InscriptionFormValues>) => ({ ...register(name), "aria-invalid": Boolean(err(name)) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-card border border-line bg-white shadow-card">
      {/* Stepper */}
      <ol className="scrollbar-hide flex items-center gap-2 overflow-x-auto border-b border-line px-4 py-4 sm:px-6" aria-label="Étapes du formulaire">
        {STEPS.map((s, i) => {
          const state = s.id < step ? "done" : s.id === step ? "current" : "todo";
          return (
            <li key={s.id} className="flex items-center gap-2">
              <button type="button" onClick={() => s.id < step && setStep(s.id)} disabled={s.id > step} className={cn("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition", state === "current" && "bg-primary text-white", state === "done" && "bg-emerald-100 text-emerald-800", state === "todo" && "bg-slate-100 text-slate-500")} aria-current={state === "current" ? "step" : undefined}>
                <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px]", state === "current" ? "bg-white/20" : state === "done" ? "bg-emerald-600 text-white" : "bg-white")}>{state === "done" ? <Check className="h-3.5 w-3.5" /> : s.id}</span>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
              {i < STEPS.length - 1 && <span className="h-px w-4 bg-line sm:w-6" aria-hidden />}
            </li>
          );
        })}
      </ol>
      <div className="h-1.5 bg-slate-100"><div className="h-full bg-secondary transition-all duration-500" style={{ width: `${(step / STEPS.length) * 100}%` }} /></div>

      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <div className="mb-6 flex items-center gap-3">
              {(() => { const I = STEPS[step - 1].Icon; return <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-secondary-50 text-secondary"><I className="h-5 w-5" /></span>; })()}
              <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Étape {step} sur {STEPS.length}</p><h2 className="text-xl font-extrabold text-primary">{STEPS[step - 1].title}</h2></div>
            </div>

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Civilité" required error={err("civilite")}>
                  <div className="flex gap-2">{(Object.keys(CIVILITE_LABELS) as (keyof typeof CIVILITE_LABELS)[]).map((c) => <label key={c} className={cn("flex-1 cursor-pointer rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition", watch("civilite") === c ? "border-primary bg-primary text-white" : "border-line hover:bg-primary-50")}><input type="radio" value={c} className="sr-only" {...register("civilite")} />{CIVILITE_LABELS[c]}</label>)}</div>
                </Field>
                <Field label="Nationalité" required error={err("nationalite")}><input className="field-input" placeholder="Sénégalaise" {...inputProps("nationalite")} /></Field>
                <Field label="Prénom(s)" required error={err("prenom")}><input className="field-input" placeholder="Votre prénom" autoComplete="given-name" {...inputProps("prenom")} /></Field>
                <Field label="Nom" required error={err("nom")}><input className="field-input" placeholder="Votre nom" autoComplete="family-name" {...inputProps("nom")} /></Field>
                <Field label="Date de naissance" required error={err("dateNaissance")}><input type="date" className="field-input" max={new Date().toISOString().slice(0, 10)} {...inputProps("dateNaissance")} /></Field>
                <Field label="Lieu de naissance" required error={err("lieuNaissance")}><input className="field-input" placeholder="Ville de naissance" {...inputProps("lieuNaissance")} /></Field>
                <Field label="N° pièce d'identité / passeport" error={err("numeroPiece")} help="Facultatif à cette étape" className="sm:col-span-2"><input className="field-input" placeholder="Numéro CNI ou passeport" {...inputProps("numeroPiece")} /></Field>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Adresse email" required error={err("email")} help="Vous recevrez la confirmation à cette adresse"><input type="email" className="field-input" placeholder="vous@exemple.com" autoComplete="email" {...inputProps("email")} /></Field>
                <Field label="Téléphone (WhatsApp de préférence)" required error={err("telephone")}><input type="tel" className="field-input" placeholder="+221 77 000 00 00" autoComplete="tel" {...inputProps("telephone")} /></Field>
                <Field label="Téléphone secondaire" error={err("telephone2")}><input type="tel" className="field-input" placeholder="+221 33 000 00 00" {...inputProps("telephone2")} /></Field>
                <Field label="Pays de résidence" required error={err("pays")}><select className="field-input" {...inputProps("pays")}>{PAYS_OPTIONS.map((p) => <option key={p}>{p}</option>)}</select></Field>
                <Field label="Adresse" required error={err("adresse")} className="sm:col-span-2"><input className="field-input" placeholder="Quartier, rue, numéro…" autoComplete="street-address" {...inputProps("adresse")} /></Field>
                <Field label="Ville" required error={err("ville")}><input className="field-input" placeholder="Dakar" autoComplete="address-level2" {...inputProps("ville")} /></Field>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Niveau d'études actuel" required error={err("niveauEtudes")} className="sm:col-span-2">
                  <select className="field-input" {...inputProps("niveauEtudes")}><option value="">Sélectionnez…</option>{(Object.keys(NIVEAU_ETUDES_LABELS) as (keyof typeof NIVEAU_ETUDES_LABELS)[]).map((n) => <option key={n} value={n}>{NIVEAU_ETUDES_LABELS[n]}</option>)}</select>
                </Field>
                {niveauEtudes && niveauEtudes !== "BFEM" && (
                  <>
                    <Field label="Série du Bac" error={err("serieBac")}><select className="field-input" {...inputProps("serieBac")}><option value="">Sélectionnez…</option>{SERIE_BAC_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select></Field>
                    <Field label="Année d'obtention du Bac" required={niveauEtudes !== "AUTRE"} error={err("anneeBac")}><input inputMode="numeric" className="field-input" placeholder="2025" {...inputProps("anneeBac")} /></Field>
                    <Field label="Mention" error={err("mentionBac")}><select className="field-input" {...inputProps("mentionBac")}><option value="">–</option>{["Passable", "Assez bien", "Bien", "Très bien"].map((m) => <option key={m}>{m}</option>)}</select></Field>
                  </>
                )}
                <Field label="Établissement d'origine" required error={err("etablissementOrigine")} className={niveauEtudes && niveauEtudes !== "BFEM" ? "" : "sm:col-span-2"}><input className="field-input" placeholder="Lycée, université, école…" {...inputProps("etablissementOrigine")} /></Field>
                <Field label="Dernier diplôme obtenu" error={err("dernierDiplome")} help="Ex : BTS Informatique de Gestion, Licence 3…" className="sm:col-span-2"><input className="field-input" placeholder="Intitulé du diplôme" {...inputProps("dernierDiplome")} /></Field>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Formation souhaitée" required error={err("programmeId")} className="sm:col-span-2">
                  <select className="field-input" {...inputProps("programmeId")}>
                    <option value="">Sélectionnez une formation…</option>
                    {(["BTS", "LICENCE", "MASTER", "CERTIFICAT", "FORMATION_CONTINUE"] as const).map((n) => {
                      const list = options.programmes.filter((p) => p.niveau === n);
                      return list.length ? <optgroup key={n} label={NIVEAU_LABELS[n]}>{list.map((p) => <option key={p.id} value={p.id}>{p.titre} ({p.duree})</option>)}</optgroup> : null;
                    })}
                  </select>
                </Field>
                {selectedProgramme && (
                  <div className="rounded-xl bg-primary-50 p-4 text-sm text-primary sm:col-span-2">
                    <strong>{selectedProgramme.titre}</strong> · {NIVEAU_LABELS[selectedProgramme.niveau]} · {selectedProgramme.duree} · Frais d&apos;inscription : <strong>{formatFCFA(selectedProgramme.fraisInscription)}</strong>
                  </div>
                )}
                <Field label="Campus" required error={err("campusId")}>
                  <select className="field-input" {...inputProps("campusId")} disabled={!programmeId}><option value="">{programmeId ? "Sélectionnez un campus…" : "Choisissez d'abord une formation"}</option>{availableCampus.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}</select>
                </Field>
                <Field label="Niveau d'entrée" required error={err("niveauEntree")}><select className="field-input" {...inputProps("niveauEntree")}>{NIVEAU_ENTREE_OPTIONS.map((n) => <option key={n}>{n}</option>)}</select></Field>
                <Field label="Rentrée souhaitée" required error={err("rentree")}><select className="field-input" {...inputProps("rentree")}>{options.rentrees.map((r) => <option key={r}>{r}</option>)}</select></Field>
                <Field label="Mode de formation" required error={err("modeFormation")}><select className="field-input" {...inputProps("modeFormation")}>{(Object.keys(MODE_FORMATION_LABELS) as (keyof typeof MODE_FORMATION_LABELS)[]).map((m) => <option key={m} value={m}>{MODE_FORMATION_LABELS[m]}</option>)}</select></Field>
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <p className="text-sm text-muted sm:col-span-2">Renseignez les coordonnées de la personne responsable du financement de vos études (facultatif si vous financez vous-même votre formation).</p>
                <Field label="Nom complet du tuteur" error={err("tuteurNom")}><input className="field-input" placeholder="Prénom et nom" {...inputProps("tuteurNom")} /></Field>
                <Field label="Lien de parenté" error={err("tuteurLien")}><select className="field-input" {...inputProps("tuteurLien")}><option value="">–</option>{TUTEUR_LIEN_OPTIONS.map((t) => <option key={t}>{t}</option>)}</select></Field>
                <Field label="Téléphone du tuteur" error={err("tuteurTelephone")}><input type="tel" className="field-input" placeholder="+221 77 000 00 00" {...inputProps("tuteurTelephone")} /></Field>
                <Field label="Email du tuteur" error={err("tuteurEmail")}><input type="email" className="field-input" placeholder="tuteur@exemple.com" {...inputProps("tuteurEmail")} /></Field>
              </div>
            )}

            {step === 6 && (
              <div className="grid gap-5">
                <Field label="Comment avez-vous connu le Groupe ISI ?" required error={err("sourceConnaissance")}><select className="field-input" {...inputProps("sourceConnaissance")}>{(Object.keys(SOURCE_LABELS) as (keyof typeof SOURCE_LABELS)[]).map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}</select></Field>
                <Field label="Votre motivation / projet professionnel" error={err("motivation")} help="Quelques lignes sur vos objectifs (facultatif, 2000 caractères max)"><textarea rows={5} className="field-input resize-y" placeholder="Pourquoi souhaitez-vous suivre cette formation ?" {...inputProps("motivation")} /></Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex items-start gap-3 rounded-xl border border-line p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-secondary" {...register("besoinBourse")} /> <span><strong className="text-primary">Je souhaite candidater à une bourse</strong><br /><span className="text-muted">Bourses d&apos;excellence jusqu&apos;à 50 %</span></span></label>
                  <label className="flex items-start gap-3 rounded-xl border border-line p-4 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-secondary" {...register("besoinLogement")} /> <span><strong className="text-primary">J&apos;ai besoin d&apos;un logement</strong><br /><span className="text-muted">Orientation vers nos résidences partenaires</span></span></label>
                </div>
                <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-secondary" {...register("newsletter")} /> <span className="text-slate-700">Je souhaite recevoir les actualités et informations du Groupe ISI par email.</span></label>
                <label className={cn("flex items-start gap-3 rounded-xl border p-4 text-sm", err("accepteConditions") ? "border-red-400 bg-red-50" : "border-line bg-surface")}><input type="checkbox" className="mt-0.5 h-4 w-4 accent-secondary" {...register("accepteConditions")} /> <span className="text-slate-700">J&apos;atteste l&apos;exactitude des informations fournies et j&apos;accepte que mes données soient traitées par le Groupe ISI dans le cadre de ma candidature (<a href="/confidentialite" target="_blank" className="font-bold text-secondary">politique de confidentialité</a>). <span className="text-secondary">*</span></span></label>
                {err("accepteConditions") && <p className="field-error -mt-3">{err("accepteConditions")}</p>}
                <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
                <p className="flex items-center gap-2 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" /> Vos données sont sécurisées et transmises uniquement au service des admissions.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <Button type="button" variant="ghost" onClick={prev} disabled={step === 1}><ArrowLeft className="h-4 w-4" /> Précédent</Button>
          {step < STEPS.length ? (
            <Button type="button" variant="primary" onClick={next}>Continuer <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button type="submit" variant="secondary" size="lg" loading={submitting}><Send className="h-4 w-4" /> Envoyer ma pré-inscription</Button>
          )}
        </div>
      </div>
    </form>
  );
}

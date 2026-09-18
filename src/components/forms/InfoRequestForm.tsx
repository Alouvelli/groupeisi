"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { contactSchema, type ContactFormValues } from "@/lib/validations";
import { submitContact } from "@/app/actions/contact";
import { Button } from "@/components/ui/Button";

/**
 * Formulaire de demande d'information (section « Les inscriptions sont
 * ouvertes » de l'accueil et pages formation). Reprend la disposition du
 * formulaire du site : champs empilés et bouton pleine largeur.
 */
export function InfoRequestForm({
  formations = [],
  campus = [],
  compact = false,
}: {
  formations?: { id: string; titre: string }[];
  campus?: { id: string; nom: string }[];
  compact?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { sujet: "Demande d'information – Pré-inscription", telephone: "", website: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const res = await submitContact(values);
    if (res.ok) {
      toast.success(res.message);
      reset();
    } else toast.error(res.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className={compact ? "space-y-5" : "grid gap-5 sm:grid-cols-2"}>
        <div className={compact ? undefined : "sm:col-span-2"}>
          <label className="field-label" htmlFor="ir-nom">
            Prénom et nom *
          </label>
          <input id="ir-nom" className="field-input" placeholder="Prénom et nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom && <p className="field-error">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="ir-email">
            Email *
          </label>
          <input id="ir-email" type="email" className="field-input" placeholder="vous@exemple.com" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="ir-tel">
            Téléphone
          </label>
          <input id="ir-tel" type="tel" className="field-input" placeholder="+221 77 000 00 00" aria-invalid={!!errors.telephone} {...register("telephone")} />
          {errors.telephone && <p className="field-error">{errors.telephone.message}</p>}
        </div>
        <div className={compact ? undefined : "sm:col-span-2"}>
          <label className="field-label" htmlFor="ir-sujet">
            Formation souhaitée *
          </label>
          <select id="ir-sujet" className="field-input" aria-invalid={!!errors.sujet} {...register("sujet")}>
            <option value="Demande d'information – Pré-inscription">Demande d&apos;information générale</option>
            {formations.map((f) => (
              <option key={f.id} value={`Pré-inscription – ${f.titre}`}>
                {f.titre}
              </option>
            ))}
            {campus.length > 0 && (
              <optgroup label="Campus">
                {campus.map((c) => (
                  <option key={c.id} value={`Information campus – ${c.nom}`}>
                    {c.nom}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {errors.sujet && <p className="field-error">{errors.sujet.message}</p>}
        </div>
        <div className={compact ? undefined : "sm:col-span-2"}>
          <label className="field-label" htmlFor="ir-message">
            Votre message *
          </label>
          <textarea
            id="ir-message"
            className="field-input"
            rows={4}
            placeholder="Précisez votre niveau d'études, le campus souhaité et vos questions."
            aria-invalid={!!errors.message}
            {...register("message")}
          />
          {errors.message && <p className="field-error">{errors.message.message}</p>}
        </div>
      </div>

      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register("website")} />

      <Button type="submit" loading={isSubmitting} className="w-full" arrow>
        Envoyer ma demande
      </Button>
      <p className="field-help text-center">
        Vous pouvez aussi remplir le dossier complet de pré-inscription en ligne : un conseiller vous rappelle sous 48 h ouvrées.
      </p>
    </form>
  );
}

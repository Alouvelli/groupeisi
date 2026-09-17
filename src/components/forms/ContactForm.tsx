"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { contactSchema, type ContactFormValues } from "@/lib/validations";
import { submitContact } from "@/app/actions/contact";
import { CONTACT_SUJETS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function ContactForm({ defaultSujet }: { defaultSujet?: string }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { sujet: defaultSujet ?? CONTACT_SUJETS[0], telephone: "", website: "" },
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
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="c-nom">Nom complet *</label>
          <input id="c-nom" className="field-input" placeholder="Prénom et nom" aria-invalid={!!errors.nom} {...register("nom")} />
          {errors.nom && <p className="field-error">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="c-email">Email *</label>
          <input id="c-email" type="email" className="field-input" placeholder="vous@exemple.com" aria-invalid={!!errors.email} {...register("email")} />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="c-tel">Téléphone</label>
          <input id="c-tel" type="tel" className="field-input" placeholder="+221 77 000 00 00" aria-invalid={!!errors.telephone} {...register("telephone")} />
          {errors.telephone && <p className="field-error">{errors.telephone.message}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="c-sujet">Sujet *</label>
          <select id="c-sujet" className="field-input" aria-invalid={!!errors.sujet} {...register("sujet")}>
            {CONTACT_SUJETS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.sujet && <p className="field-error">{errors.sujet.message}</p>}
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="c-message">Message *</label>
        <textarea id="c-message" rows={6} className="field-input resize-y" placeholder="Décrivez votre demande…" aria-invalid={!!errors.message} {...register("message")} />
        {errors.message && <p className="field-error">{errors.message.message}</p>}
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
      <Button type="submit" variant="secondary" size="lg" loading={isSubmitting}>
        Envoyer le message <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

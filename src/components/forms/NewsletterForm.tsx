"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

/**
 * Formulaire newsletter du thème : champ email, bouton carré à flèche
 * et case de consentement (pied de page en bleu, variante claire ailleurs).
 */
export function NewsletterForm({
  source = "footer",
  className,
  variant = "footer",
}: {
  source?: string;
  className?: string;
  variant?: "footer" | "light";
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [pending, start] = useTransition();
  const id = useId();
  const dark = variant === "footer";

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      toast.error("Merci d'accepter la politique de confidentialité.");
      return;
    }
    start(async () => {
      const res = await subscribeNewsletter({ email, source });
      if (res.ok) {
        toast.success(res.message);
        setEmail("");
        setConsent(false);
      } else toast.error(res.message);
    });
  };

  return (
    <form onSubmit={onSubmit} className={cn("w-full max-w-md", className)}>
      <div className="flex">
        <label htmlFor={`newsletter-${id}`} className="sr-only">
          Adresse email
        </label>
        <input
          id={`newsletter-${id}`}
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse email"
          className={cn(
            "h-12 flex-1 px-4 text-sm outline-none",
            dark
              ? "border border-white/20 border-r-0 bg-white/10 text-white placeholder:text-white/60 focus:border-secondary"
              : "border border-line border-r-0 bg-white text-body placeholder:text-muted focus:border-primary",
          )}
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="S'abonner à la newsletter"
          className={cn(
            "inline-flex h-12 w-12 shrink-0 items-center justify-center transition disabled:opacity-60",
            dark ? "bg-dark text-white hover:bg-secondary hover:text-secondary-fg" : "bg-primary text-white hover:bg-secondary hover:text-secondary-fg",
          )}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-5 w-5" />}
        </button>
      </div>
      <label className={cn("mt-4 flex items-start gap-2.5 text-[13px]", dark ? "text-white/70" : "text-body")}>
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-secondary"
        />
        <span>
          J&apos;accepte la{" "}
          <Link href="/confidentialite" className={cn("underline underline-offset-2", dark ? "hover:text-secondary" : "hover:text-primary")}>
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
    </form>
  );
}

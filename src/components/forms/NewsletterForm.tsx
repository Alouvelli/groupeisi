"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { subscribeNewsletter } from "@/app/actions/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterForm({ source = "footer", className, light = true }: { source?: string; className?: string; light?: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, start] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await subscribeNewsletter({ email, source });
      if (res.ok) {
        toast.success(res.message);
        setEmail("");
      } else toast.error(res.message);
    });
  };

  return (
    <form onSubmit={onSubmit} className={cn("flex w-full max-w-md gap-2", className)}>
      <label htmlFor={`newsletter-${source}`} className="sr-only">
        Adresse email
      </label>
      <input
        id={`newsletter-${source}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Votre adresse email"
        className={cn("h-12 flex-1 rounded-full px-5 text-sm outline-none focus:ring-4", light ? "bg-white/10 text-white placeholder:text-white/50 ring-white/20 border border-white/15" : "field-input rounded-full")}
      />
      <button type="submit" disabled={pending} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-secondary px-5 text-sm font-bold text-white transition hover:bg-secondary-dark disabled:opacity-60">
        <Send className="h-4 w-4" /> <span className="hidden sm:inline">S&apos;abonner</span>
      </button>
    </form>
  );
}

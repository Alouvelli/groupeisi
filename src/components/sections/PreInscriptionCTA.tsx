import Image from "next/image";
import { ArrowRight, CalendarCheck, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function PreInscriptionCTA({ anneeAcademique, phone, image, ouvertes }: { anneeAcademique: string; phone?: string | null; image?: string; ouvertes: boolean }) {
  return (
    <section className="relative overflow-hidden bg-primary py-20 text-white">
      {image && <Image src={image} alt="" fill sizes="100vw" className="object-cover opacity-20" />}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary/80" aria-hidden />
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-secondary/40 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" aria-hidden />
      <Container className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            <CalendarCheck className="h-4 w-4" /> Rentrée {anneeAcademique}
          </span>
          <h2 className="mt-4 font-heading text-3xl font-extrabold text-white text-balance sm:text-4xl lg:text-5xl">
            {ouvertes ? "Les pré-inscriptions sont ouvertes !" : "Rejoignez le Groupe ISI"}
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Réservez votre place en quelques minutes. Un conseiller vous recontacte sous 48 heures pour finaliser votre dossier. Bourses d&apos;excellence et facilités de paiement disponibles.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col lg:items-end">
          <Button href="/pre-inscription" variant="secondary" size="lg" className="h-14 px-10 text-base">
            Je me pré-inscris <ArrowRight className="h-5 w-5" />
          </Button>
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 text-sm font-bold text-white/90 hover:text-accent">
              <Phone className="h-4 w-4 text-accent" /> {phone}
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}

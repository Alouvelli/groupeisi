import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/forms/LoginForm";

export const metadata: Metadata = { title: "Connexion – Administration", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:block">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-secondary/40 blur-3xl" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Image src="/images/logo-isi-white.svg" alt="Groupe ISI" width={200} height={58} className="h-14 w-auto" />
          <div>
            <h1 className="font-heading text-4xl font-extrabold text-white">Espace d&apos;administration</h1>
            <p className="mt-4 max-w-md text-white/80">Gestion des pré-inscriptions, des contenus du site, de la configuration ERP/CRM et du suivi des jobs de synchronisation.</p>
          </div>
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Groupe ISI</p>
        </div>
      </div>
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md rounded-card border border-line bg-white p-8 shadow-card sm:p-10">
          <Link href="/" className="lg:hidden"><Image src="/images/logo-isi.svg" alt="Groupe ISI" width={180} height={52} className="mb-6 h-12 w-auto" /></Link>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary"><ShieldCheck className="h-6 w-6" /></span>
          <h2 className="mt-4 text-2xl font-extrabold text-primary">Connexion</h2>
          <p className="mt-1 text-sm text-muted">Accès réservé au personnel autorisé du Groupe ISI.</p>
          <div className="mt-8"><LoginForm next={next} /></div>
          <p className="mt-8 text-center text-xs text-slate-400"><Link href="/" className="hover:text-primary">← Retour au site</Link></p>
        </div>
      </div>
    </div>
  );
}

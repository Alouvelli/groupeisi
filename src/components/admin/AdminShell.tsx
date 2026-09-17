"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, Newspaper, Settings, Activity, ScrollText, Mail, LogOut, Menu, X, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Tableau de bord", Icon: LayoutDashboard, exact: true },
  { href: "/admin/inscriptions", label: "Pré-inscriptions", Icon: Users },
  { href: "/admin/programmes", label: "Programmes", Icon: BookOpen },
  { href: "/admin/actualites", label: "Actualités", Icon: Newspaper },
  { href: "/admin/messages", label: "Messages", Icon: Mail },
  { href: "/admin/jobs", label: "Jobs & Queue", Icon: Activity },
  { href: "/admin/logs", label: "Logs ERP", Icon: ScrollText },
  { href: "/admin/settings", label: "Paramètres & ERP", Icon: Settings },
];

export function AdminShell({ user, children, badges }: { user: { nom: string; email: string; role: string }; children: React.ReactNode; badges?: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = NAV.find((n) => (n.exact ? pathname === n.href : pathname.startsWith(n.href)));

  const Sidebar = (
    <div className="flex h-full flex-col bg-primary-dark text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Link href="/admin"><Image src="/images/logo-isi-white.svg" alt="Groupe ISI" width={160} height={46} className="h-10 w-auto" /></Link>
        <button className="rounded-full p-2 hover:bg-white/10 lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          const badge = badges?.[n.href];
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active ? "bg-secondary text-white shadow-lg shadow-secondary/30" : "text-white/70 hover:bg-white/10 hover:text-white")}>
              <n.Icon className="h-4.5 w-4.5" /> <span className="flex-1">{n.label}</span>
              {badge ? <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", active ? "bg-white/20" : "bg-secondary text-white")}>{badge}</span> : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> Voir le site</Link>
        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-extrabold">{user.nom.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
          <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{user.nom}</div><div className="truncate text-[11px] text-white/50">{user.role}</div></div>
          <form action={logoutAction}><button type="submit" aria-label="Se déconnecter" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" /></button></form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="hidden w-64 shrink-0 lg:block lg:h-screen lg:sticky lg:top-0">{Sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-dark/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72">{Sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button className="rounded-full border border-line p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-2 text-sm text-muted"><span className="hidden sm:inline">Administration</span><ChevronRight className="hidden h-4 w-4 sm:inline" /><span className="font-bold text-primary">{current?.label ?? "Administration"}</span></div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

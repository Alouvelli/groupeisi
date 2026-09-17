import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden bg-primary py-24 text-white sm:py-32">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" aria-hidden />
      <div className="container-x relative text-center">
        <span className="font-heading text-[7rem] font-extrabold leading-none text-white/10 sm:text-[10rem]">404</span>
        <h1 className="-mt-6 font-heading text-3xl font-extrabold text-white sm:text-4xl">Page introuvable</h1>
        <p className="mx-auto mt-4 max-w-xl text-white/80">La page que vous recherchez n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil ou explorez nos formations.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="secondary"><Home className="h-4 w-4" /> Accueil</Button>
          <Button href="/programmes" variant="outline-white"><Search className="h-4 w-4" /> Nos formations</Button>
          <Link href="/contact" className="inline-flex h-11 items-center gap-2 px-4 text-sm font-bold text-white/80 hover:text-white"><ArrowLeft className="h-4 w-4" /> Contact</Link>
        </div>
      </div>
    </section>
  );
}

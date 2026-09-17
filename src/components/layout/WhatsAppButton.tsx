import { MessageCircle } from "lucide-react";

export function WhatsAppButton({ number }: { number?: string | null }) {
  if (!number) return null;
  const digits = number.replace(/[^\d]/g, "");
  return (
    <a
      href={`https://wa.me/${digits}?text=${encodeURIComponent("Bonjour, je souhaite des informations sur les formations du Groupe ISI.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-6 left-6 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card transition hover:scale-105"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" aria-hidden />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
}

import Image from "next/image";

export function PartenaireLogo({ nom, logo, url }: { nom: string; logo: string; url?: string | null }) {
  const img = <Image src={logo} alt={nom} width={160} height={64} className="h-12 w-auto object-contain opacity-80 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0" />;
  return (
    <div className="flex h-24 w-48 shrink-0 items-center justify-center rounded-2xl border border-line bg-white px-6 shadow-soft">
      {url && url !== "#" ? (
        <a href={url} target="_blank" rel="noopener noreferrer" aria-label={nom}>{img}</a>
      ) : (
        img
      )}
    </div>
  );
}

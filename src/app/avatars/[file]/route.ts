import { NextResponse } from "next/server";

/**
 * Avatar SVG généré localement à partir des initiales : /avatars/prenom-nom.svg?bg=0b2a5b
 * (évite toute dépendance à un service externe)
 */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const url = new URL(req.url);
  const bg = /^[0-9a-f]{6}$/i.test(url.searchParams.get("bg") ?? "") ? `#${url.searchParams.get("bg")}` : "#0b2a5b";
  const name = decodeURIComponent(file.replace(/\.svg$/i, "")).replace(/[-_]+/g, " ").trim();
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "ISI";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="${name.replace(/"/g, "")}">
  <rect width="256" height="256" fill="${bg}"/>
  <circle cx="128" cy="100" r="46" fill="rgba(255,255,255,0.15)"/>
  <path d="M40 232c8-52 46-80 88-80s80 28 88 80" fill="rgba(255,255,255,0.15)"/>
  <text x="128" y="146" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="700" fill="#ffffff" text-anchor="middle">${initials}</text>
</svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=31536000, immutable" } });
}

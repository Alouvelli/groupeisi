import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import { getSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

/* Polices du thème Univet (auto-hébergées, variables 400 → 700) */
const inter = localFont({
  src: [{ path: "../fonts/inter-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
});
const bitter = localFont({
  src: [{ path: "../fonts/bitter-latin.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-bitter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seoTitle ?? `${s.siteName} – Institut de référence dans les TIC`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s – ${s.siteName}` },
    description: s.seoDescription ?? s.description ?? undefined,
    keywords: s.seoKeywords?.split(",").map((k) => k.trim()),
    applicationName: s.siteName,
    openGraph: {
      type: "website",
      locale: "fr_SN",
      siteName: s.siteName,
      title,
      description: s.seoDescription ?? undefined,
      url: absoluteUrl("/"),
      images: [{ url: s.ogImage ?? "/media/img-9163.jpg", width: 1200, height: 800, alt: s.siteName }],
    },
    twitter: { card: "summary_large_image", title, description: s.seoDescription ?? undefined },
    robots: { index: true, follow: true },
    icons: { icon: [{ url: "/media/design-sans-titre.png", type: "image/png" }], apple: "/media/design-sans-titre.png" },
    alternates: { canonical: absoluteUrl("/") },
  };
}

export const viewport: Viewport = {
  themeColor: "#07294d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${bitter.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 5000, style: { borderRadius: "8px", fontSize: "14px" } }} />
      </body>
    </html>
  );
}

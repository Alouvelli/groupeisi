import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { getSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap", weight: ["500", "600", "700", "800"] });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seoTitle ?? `${s.siteName} – Institut Supérieur d'Informatique`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s | ${s.siteName}` },
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
      images: [{ url: s.ogImage ?? "/images/placeholder.svg", width: 1200, height: 800, alt: s.siteName }],
    },
    twitter: { card: "summary_large_image", title, description: s.seoDescription ?? undefined },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
    alternates: { canonical: absoluteUrl("/") },
  };
}

export const viewport: Viewport = {
  themeColor: "#0b2a5b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-white font-sans antialiased">
        {children}
        <Toaster position="top-right" toastOptions={{ duration: 5000, style: { borderRadius: "12px", fontSize: "14px" } }} />
      </body>
    </html>
  );
}

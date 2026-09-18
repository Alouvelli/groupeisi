import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "new.groupeisi.com" },
      { protocol: "https", hostname: "www.groupeisi.com" },
      { protocol: "https", hostname: "groupeisi.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  serverExternalPackages: ["bullmq", "ioredis", "@prisma/client", "bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "4mb" },
  },
  /**
   * Redirections des anciennes URL WordPress de new.groupeisi.com
   * vers les routes du site Next.js.
   */
  async redirects() {
    const map: [string, string][] = [
      ["/programmes", "/formations"],
      ["/programs/:slug", "/formations"],
      ["/faculties", "/campus"],
      ["/faculties/:slug", "/campus/:slug"],
      ["/departments/:slug", "/departements/:slug"],
      ["/faculty-members", "/equipe"],
      ["/faculty-members/:slug", "/equipe/:slug"],
      ["/all-faculty-members", "/equipe"],
      ["/team-member-2", "/equipe"],
      ["/events/:slug", "/evenements/:slug"],
      ["/alumnis-2", "/alumnis"],
      ["/alumni", "/alumnis"],
      ["/blog", "/actualites"],
      ["/blog-grid", "/actualites"],
      ["/blog-grid-3-column", "/actualites"],
      ["/preinscription-2", "/preinscription"],
      ["/pre-inscription", "/preinscription"],
      ["/apply-now", "/preinscription"],
      ["/contact-2", "/contact"],
      ["/frais-etudes", "/frais-d-etudes"],
      ["/cost-financial-aid", "/frais-d-etudes"],
      ["/admissions", "/condition-admission"],
      ["/presentation", "/a-propos"],
      ["/mission-valeur", "/a-propos"],
      ["/research", "/actualites"],
      ["/researches/:slug", "/actualites"],
      ["/notices/:slug", "/actualites"],
      ["/:year(\\d{4})/:month(\\d{2})/:day(\\d{2})/:slug", "/actualites/:slug"],
    ];
    return map
      .filter(([source, destination]) => source !== destination)
      .map(([source, destination]) => ({ source, destination, permanent: true }));
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

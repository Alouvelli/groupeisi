import { PageTransition } from "@/components/motion";

/**
 * Le template est remonté à chaque navigation, contrairement au layout.
 * C'est ce qui permet de rejouer l'animation d'entrée sur chaque page du site.
 */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

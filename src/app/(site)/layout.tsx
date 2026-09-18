import { BaseLayout } from "@/components/layout/BaseLayout";
import { MotionProvider } from "@/components/motion/MotionProvider";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <BaseLayout>{children}</BaseLayout>
    </MotionProvider>
  );
}

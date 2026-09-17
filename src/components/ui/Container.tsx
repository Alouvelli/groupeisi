import { cn } from "@/lib/utils";

export function Container({ className, children, as: Tag = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "section" | "header" | "footer" | "nav" }) {
  return <Tag className={cn("container-x", className)}>{children}</Tag>;
}

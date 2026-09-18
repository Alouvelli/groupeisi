import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  as: Tag = "div",
  narrow = false,
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "header" | "footer" | "nav";
  narrow?: boolean;
}) {
  return <Tag className={cn(narrow ? "container-narrow" : "container-x", className)}>{children}</Tag>;
}

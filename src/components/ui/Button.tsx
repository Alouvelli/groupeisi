import Link from "next/link";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "outline-white" | "ghost" | "white" | "danger" | "link";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/20 hover:-translate-y-0.5",
  secondary: "bg-secondary text-white hover:bg-secondary-dark shadow-lg shadow-secondary/30 hover:-translate-y-0.5",
  outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  "outline-white": "border-2 border-white/70 text-white hover:bg-white hover:text-primary",
  ghost: "text-primary hover:bg-primary-50",
  white: "bg-white text-primary hover:bg-slate-100 shadow-lg",
  danger: "bg-red-600 text-white hover:bg-red-700",
  link: "text-secondary hover:text-secondary-dark underline-offset-4 hover:underline px-0",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  loading?: boolean;
  external?: boolean;
}

export function Button({ variant = "primary", size = "md", href, loading, external, className, children, disabled, ...rest }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

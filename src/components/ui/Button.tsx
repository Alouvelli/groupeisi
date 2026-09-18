import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "dark" | "outline" | "outline-white" | "ghost" | "white" | "danger" | "link" | "text";
type Size = "sm" | "md" | "lg" | "icon";

/* Bouton pilule « rs-button » du thème Univet : padding 16px 25px, radius 30px, 15px/500 */
const base = "rs-button whitespace-nowrap focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-secondary hover:text-secondary-fg",
  secondary: "bg-secondary text-secondary-fg hover:bg-primary hover:text-white",
  dark: "bg-dark text-white hover:bg-primary",
  outline: "border border-primary text-primary hover:bg-primary hover:text-white",
  "outline-white": "border border-white/70 text-white hover:bg-white hover:text-primary",
  ghost: "text-primary hover:bg-primary-50",
  white: "bg-white text-title hover:bg-secondary hover:text-secondary-fg",
  danger: "bg-red-600 text-white hover:bg-red-700",
  link: "px-0 py-0 text-primary underline-offset-4 hover:underline",
  text: "px-0 py-0 text-body font-medium hover:text-primary",
};

const sizes: Record<Size, string> = {
  sm: "px-5 py-3 text-sm",
  md: "",
  lg: "px-8 py-[18px] text-base",
  icon: "h-11 w-11 p-0",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  loading?: boolean;
  external?: boolean;
  /** Ajoute la flèche « → » du thème à droite du libellé */
  arrow?: boolean;
}

export function Button({ variant = "primary", size = "md", href, loading, external, arrow, className, children, disabled, ...rest }: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      <span className="button-text">{children}</span>
      {arrow && <ArrowRight className="button-icon h-4 w-4" aria-hidden />}
    </>
  );
  if (href) {
    if (external || /^https?:\/\//.test(href)) {
      return (
        <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={classes}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {content}
    </button>
  );
}

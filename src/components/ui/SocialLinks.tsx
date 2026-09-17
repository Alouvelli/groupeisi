import { cn } from "@/lib/utils";

export interface Socials {
  facebook?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  youtube?: string | null;
  twitter?: string | null;
  tiktok?: string | null;
}

type IconProps = React.SVGProps<SVGSVGElement>;
const svg = (props: IconProps) => ({ viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true, ...props });

export const FacebookIcon = (p: IconProps) => (
  <svg {...svg(p)}><path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.4V14h2.8v8h3.3z" /></svg>
);
export const InstagramIcon = (p: IconProps) => (
  <svg {...svg(p)}><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm5-8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 2c-2.7 0-3 0-4.1.1-1 0-1.8.2-2.4.5-.7.2-1.2.6-1.8 1.1C3.2 4.3 2.8 4.9 2.6 5.5c-.3.6-.4 1.4-.5 2.4C2 9 2 9.3 2 12s0 3 .1 4.1c0 1 .2 1.8.5 2.4.2.7.6 1.2 1.1 1.8.5.5 1.1.9 1.8 1.1.6.3 1.4.4 2.4.5H12c2.7 0 3 0 4.1-.1 1 0 1.8-.2 2.4-.5.7-.2 1.2-.6 1.8-1.1.5-.5.9-1.1 1.1-1.8.3-.6.4-1.4.5-2.4V12c0-2.7 0-3-.1-4.1 0-1-.2-1.8-.5-2.4-.2-.7-.6-1.2-1.1-1.8-.5-.5-1.1-.9-1.8-1.1-.6-.3-1.4-.4-2.4-.5H12zm0 1.8h4c.9 0 1.4.2 1.8.3.4.2.7.4 1 .7.3.3.5.6.7 1 .1.4.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.4-.3 1.8-.2.4-.4.7-.7 1-.3.3-.6.5-1 .7-.4.1-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.4-.2-1.8-.3-.4-.2-.7-.4-1-.7-.3-.3-.5-.6-.7-1-.1-.4-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.4.3-1.8.2-.4.4-.7.7-1 .3-.3.6-.5 1-.7.4-.1.9-.3 1.8-.3 1-.1 1.3-.1 4-.1z" /></svg>
);
export const LinkedinIcon = (p: IconProps) => (
  <svg {...svg(p)}><path d="M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6zM8 19H5V9.5h3V19zM6.5 8.2a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5zM19 19h-3v-4.6c0-1.1 0-2.5-1.5-2.5S12.7 13 12.7 14.3V19h-3V9.5h2.9v1.3c.4-.8 1.4-1.5 2.8-1.5 3 0 3.6 2 3.6 4.6V19z" /></svg>
);
export const YoutubeIcon = (p: IconProps) => (
  <svg {...svg(p)}><path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.5 3.7 12 3.7 12 3.7s-4.5 0-7.8.2c-.5.1-1.5.1-2.3 1C1.2 5.6 1 7.2 1 7.2S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.2 7.6.2s4.5 0 7.8-.2c.5-.1 1.5-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.7 15V8.5l6.1 3.3L9.7 15z" /></svg>
);
export const XIcon = (p: IconProps) => (
  <svg {...svg(p)}><path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z" /></svg>
);
export const TiktokIcon = (p: IconProps) => (
  <svg {...svg(p)}><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.2a7.3 7.3 0 0 0 4.3 1.4V7.5a4.3 4.3 0 0 1-3.2-1.7z" /></svg>
);

export function SocialLinks({ socials, className, itemClassName }: { socials: Socials; className?: string; itemClassName?: string }) {
  const items = [
    { href: socials.facebook, Icon: FacebookIcon, label: "Facebook" },
    { href: socials.instagram, Icon: InstagramIcon, label: "Instagram" },
    { href: socials.linkedin, Icon: LinkedinIcon, label: "LinkedIn" },
    { href: socials.youtube, Icon: YoutubeIcon, label: "YouTube" },
    { href: socials.twitter, Icon: XIcon, label: "X / Twitter" },
    { href: socials.tiktok, Icon: TiktokIcon, label: "TikTok" },
  ].filter((i) => i.href);
  if (!items.length) return null;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {items.map(({ href, Icon, label }) => (
        <a key={label} href={href!} target="_blank" rel="noopener noreferrer" aria-label={label} className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-secondary hover:text-white", itemClassName)}>
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

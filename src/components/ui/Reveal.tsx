"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const variants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export function Reveal({ children, className, delay = 0, once = true, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; once?: boolean; as?: "div" | "li" | "span" }) {
  const Tag = motion[as];
  return (
    <Tag initial="hidden" whileInView="visible" viewport={{ once, margin: "-60px" }} variants={variants} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }} className={cn(className)}>
      {children}
    </Tag>
  );
}

export function Stagger({ children, className, gap = 0.08 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} transition={{ staggerChildren: gap }} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={variants} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

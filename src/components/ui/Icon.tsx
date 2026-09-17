import { Code2, Network, Briefcase, GraduationCap, Shield, Database, Cloud, Cpu, Palette, LineChart, Users, BookOpen, Award, Globe, Laptop, Wifi, Building2, type LucideProps } from "lucide-react";

const icons = { Code2, Network, Briefcase, GraduationCap, Shield, Database, Cloud, Cpu, Palette, LineChart, Users, BookOpen, Award, Globe, Laptop, Wifi, Building2 };
export type IconName = keyof typeof icons;

export function DynamicIcon({ name, ...props }: { name?: string | null } & Omit<LucideProps, "name">) {
  const Cmp = (name && icons[name as IconName]) || GraduationCap;
  return <Cmp {...props} />;
}

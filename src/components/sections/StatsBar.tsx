import { Building2, GraduationCap, Handshake, Trophy, Users, UserCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";

export interface StatsBarProps {
  stats: {
    annees: number;
    etudiants: number;
    campus: number;
    programmes: number;
    insertion: number;
    partenaires: number;
  };
  variant?: "primary" | "surface";
}

/** Bande de chiffres clés animés (présentation, campus). */
export function StatsBar({ stats, variant = "primary" }: StatsBarProps) {
  const items = [
    { value: stats.annees, suffix: " ans", label: "d'expertise", Icon: Trophy },
    { value: stats.etudiants, suffix: "+", label: "étudiants formés", Icon: Users },
    { value: stats.campus, suffix: "", label: "campus et annexes", Icon: Building2 },
    { value: stats.programmes, suffix: "+", label: "formations", Icon: GraduationCap },
    { value: stats.insertion, suffix: " %", label: "d'insertion professionnelle", Icon: UserCheck },
    { value: stats.partenaires, suffix: "+", label: "partenaires", Icon: Handshake },
  ];
  const light = variant === "primary";
  return (
    <section className={light ? "bg-primary py-12" : "bg-surface py-12"}>
      <Container>
        <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-6">
          {items.map(({ value, suffix, label, Icon }) => (
            <div key={label} className="text-center">
              <span
                className={
                  light
                    ? "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
                    : "mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
                }
              >
                <Icon className={light ? "h-6 w-6 text-secondary" : "h-6 w-6 text-primary"} aria-hidden />
              </span>
              <p className={light ? "mt-4 font-heading text-[34px] font-semibold leading-none text-white" : "mt-4 font-heading text-[34px] font-semibold leading-none text-primary"}>
                <Counter value={value} suffix={suffix} />
              </p>
              <p className={light ? "mt-2 text-sm text-white/75" : "mt-2 text-sm text-body"}>{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

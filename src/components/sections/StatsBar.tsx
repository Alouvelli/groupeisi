import { CalendarDays, Users, MapPin, BookOpen, Briefcase, Handshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { StatCard } from "@/components/cards/StatCard";

export function StatsBar({ stats }: { stats: { annees: number; etudiants: number; campus: number; programmes: number; insertion: number; partenaires: number } }) {
  const items = [
    { value: stats.annees, suffix: "+", label: "Années d'expérience", Icon: CalendarDays },
    { value: stats.etudiants, suffix: "+", label: "Diplômés formés", Icon: Users },
    { value: stats.campus, label: "Campus", Icon: MapPin },
    { value: stats.programmes, suffix: "+", label: "Formations", Icon: BookOpen },
    { value: stats.insertion, suffix: "%", label: "Insertion professionnelle", Icon: Briefcase },
    { value: stats.partenaires, suffix: "+", label: "Entreprises partenaires", Icon: Handshake },
  ];
  return (
    <div className="relative z-10 -mt-12 sm:-mt-16">
      <Container>
        <div className="grid grid-cols-1 gap-4 rounded-3xl bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 xl:p-5">
          {items.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </Container>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { NewsCard, type NewsCardProps } from "@/components/cards/NewsCard";
import { Button } from "@/components/ui/Button";

export function NewsSection({ posts }: { posts: NewsCardProps[] }) {
  return (
    <Section variant="white" padding="lg" id="actualites">
      <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading label="Actualités" title="Les dernières nouvelles du Groupe ISI" align="left" className="mb-0" />
        <Button href="/actualites" variant="outline" className="shrink-0">Toutes les actualités <ArrowRight className="h-4 w-4" /></Button>
      </div>
      <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <StaggerItem key={p.slug}>
            <NewsCard {...p} />
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

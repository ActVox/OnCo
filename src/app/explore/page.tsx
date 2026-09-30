import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { exploreSections } from "@/lib/relevance-rows";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PowerView, type PowerCancer } from "@/components/PowerView";

export const metadata: Metadata = pageMeta({ title: "Browse the corpus by cancer and kind", description: "Pick a cancer type, switch entity kind, and get a ranked, sortable, filterable list of products, technologies, targets, trials, and more, each linking to its page.", path: "/explore/" });

export default function Explore() {
  const g = graph();
  const cancers: PowerCancer[] = g.kind("cancer").map((c) => ({ id: c.id, name: c.name, group: c.group, route: routeFor(c) }));
  // The page carries the first rows of each kind and the per-cancer counts; the rest of a kind is one static file
  // (/api/v1/explore/<plural>.json, scripts/build-explore.ts) the view fetches on demand. See src/lib/explore-kinds.ts.
  const { first, counts } = exploreSections();
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Browse the corpus by cancer and kind"
        lede="Choose a cancer type (or all), switch between products, technologies, targets, trials, pairings, ideas, companies, and institutions, then sort and filter. Every row links to its page. The rank is a disclosed documentation-and-evidence score, not a measure of clinical benefit."
        right={<div className="flex flex-wrap gap-2 justify-end"><Link href="/tagged/" className="chip border bg-card border-border hover:bg-foreground/5 text-sm" title="Every tag with its count; each opens a filterable table of the records carrying it">Tags →</Link><Link href="/rankings/" className="chip border bg-card border-border hover:bg-foreground/5 text-sm" title="League tables computed from corpus counts alone, each stating its basis">Rankings →</Link><Link href="/modalities/" className="chip border bg-card border-border hover:bg-foreground/5 text-sm" title="One hub per shape of medicine: ADC, radioligand, CAR-T, bispecific, degrader and the rest, each gathering everything the corpus records about the format">Medicine types →</Link></div>} />
      <Container className="pb-16">
        <Suspense><PowerView rows={first} cancers={cancers} counts={counts} /></Suspense>
      </Container>
    </>
  );
}

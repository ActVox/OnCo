import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { ORGAN_SCHEMATICS } from "@/data/organ-schematics";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { OrganSchematic } from "@/components/OrganSchematic";

export const metadata: Metadata = pageMeta({ title: "Organ schematics", description: "Wireframe schematics of each organ where cancer arises: the subsites, which subtypes start where, and the lymph node stations a cancer drains to.", path: "/atlas/organs/" });

export default function OrganAtlasPage() {
  const g = graph();
  const covered = new Set(ORGAN_SCHEMATICS.flatMap((o) => o.cancers));
  const uncovered = g.kind("cancer").filter((c) => !covered.has(c.id));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="map"><Link href="/atlas/" className="kicker hover:text-foreground">· Organ maps: where a cancer starts and where it spreads</Link></GroupKicker>} title="Organ schematics"
        lede={`${ORGAN_SCHEMATICS.length} organ systems covering ${covered.size} cancers, drawn as rotating wireframes in the site's style. Each shows where the cancer's subtypes begin (the marked subsites) and the lymph node stations it drains to, which is what staging scans, sentinel node biopsies and radiotherapy fields are built around.`} />
      <Container className="pb-16">
        <div className="space-y-10">
          {ORGAN_SCHEMATICS.map((o) => {
            const cancers = o.cancers.map((id) => g.get(id)).filter((c): c is NonNullable<typeof c> => !!c);
            return (
              <section key={o.id} id={o.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h2 className="text-xl font-semibold tracking-tight">{o.name}</h2>
                  <div className="flex flex-wrap gap-1.5">{cancers.map((c) => <Link key={c.id} href={routeFor(c)} className="chip border bg-card border-border hover:bg-foreground/5">{c.name}</Link>)}</div>
                </div>
                <OrganSchematic organ={o} cancerId={o.cancers[0]} height="h-64 sm:h-80" />
              </section>
            );
          })}
        </div>
        {uncovered.length > 0 && <p className="text-xs text-muted mt-10">Not drawn (no single organ): {uncovered.map((c) => c.name).join(", ")}.</p>}
      </Container>
    </>
  );
}

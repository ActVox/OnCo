import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { ORGAN_SCHEMATICS } from "@/data/organ-schematics";
import { SPREAD } from "@/data/spread";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { OrganSchematic } from "@/components/OrganSchematic";
import { SpreadMap } from "@/components/SpreadMap";

export const metadata: Metadata = pageMeta({ title: "Where a cancer starts and spreads", description: "Visual atlas: organ schematics with subsites and lymph node stations, and metastatic spread maps for each cancer.", path: "/atlas/" });

export default function AtlasPage() {
  const g = graph();
  const crc = SPREAD.find((s) => s.cancer === "colorectal") ?? SPREAD[0];
  return (
    <>
      <PageHeader kicker={<GroupKicker id="map" />} title="Where a cancer starts and spreads" lede="Two ways of seeing a cancer's geography: the organ it starts in, with subsites and the lymph node stations it drains to, and the body map of where it spreads." />
      <Container className="pb-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/atlas/organs/" className="card overflow-hidden hover:shadow-md transition block">
            <OrganSchematic organ={ORGAN_SCHEMATICS[0]} compact height="h-56" />
            <div className="p-4"><div className="font-semibold">Organ schematics</div><p className="text-sm text-muted mt-1">{ORGAN_SCHEMATICS.length} organ systems, {new Set(ORGAN_SCHEMATICS.flatMap((o) => o.cancers)).size} cancers: where each subtype begins and which nodes it drains to.</p></div>
          </Link>
          <Link href="/atlas/spread/" className="card overflow-hidden hover:shadow-md transition block">
            <div className="px-16 pt-3 h-56 overflow-hidden"><SpreadMap spread={crc} cancerName={g.must(crc.cancer).name} compact /></div>
            <div className="p-4"><div className="font-semibold">Where cancers spread</div><p className="text-sm text-muted mt-1">Metastatic sites for {SPREAD.length} cancers ranked by frequency, drawn on the body map with sources.</p></div>
          </Link>
        </div>
      </Container>
    </>
  );
}

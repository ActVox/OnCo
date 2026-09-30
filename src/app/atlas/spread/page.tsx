import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { SPREAD, SPREAD_LABELS } from "@/data/spread";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { SpreadMap, WhatHelpsLine } from "@/components/SpreadMap";
import { GentleSection } from "@/components/GentleSection";
import { WhatIsBeingDone } from "@/components/WhatIsBeingDone";

export const metadata: Metadata = pageMeta({ title: SPREAD_LABELS.title, description: "For each cancer, what treats advanced disease and how detection has improved, then the sourced maps of the sites it can reach, ranked by how often, on the body map.", path: "/atlas/spread/" });

/** Detection advances named in the corpus, linked to their technology pages where one exists. */
const DETECTION: Array<{ id: string; text: string }> = [
  { id: "psma-pet", text: "PSMA PET finds prostate cancer spread years before a bone scan would, and selects who benefits from PSMA radioligand therapy." },
  { id: "whole-body-mri", text: "Whole-body MRI stages myeloma and bone disease without radiation and is replacing skeletal surveys." },
  { id: "mri", text: "Brain MRI is now part of staging for lung cancer, melanoma and HER2-positive breast cancer, so brain metastases are found small and treated with radiosurgery or brain-penetrant drugs." },
  { id: "liquid-biopsy", text: "Blood tests for tumour DNA find residual or returning disease months before scans, and steer treatment changes (SERENA-6, IMvigor011)." },
  { id: "sbrt", text: "Stereotactic radiotherapy treats a few sites of spread with curative intent in oligometastatic disease." },
];

export default function SpreadAtlasPage() {
  const g = graph();
  const entries = SPREAD.map((s) => ({ s, c: g.must(s.cancer) })).sort((a, b) => a.c.name.localeCompare(b.c.name));
  const detection = DETECTION.map((d) => ({ ...d, e: g.get(d.id) }));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="map"><Link href="/atlas/" className="kicker hover:text-foreground">· Organ maps: where a cancer starts and where it spreads</Link></GroupKicker>} title={SPREAD_LABELS.title}
        lede={`For ${entries.length} cancers: what treats advanced disease today, how detection has improved, and then, behind a click, the sourced maps of the sites each cancer can reach over the whole course of the illness. Most people reading this do not have advanced disease; where a cancer can go decides which scans are done at staging and follow-up, and every site listed has a treatment approach.`} />
      <Container className="pb-16 space-y-8">
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="card p-4 sm:p-5">
            <div className="kicker mb-1">How detection has improved</div>
            <ul className="space-y-2 text-sm leading-relaxed">
              {detection.map((d) => <li key={d.id}>{d.e ? <><Link href={routeFor(d.e)} className="font-medium hover:underline">{d.e.name}</Link>: </> : null}{d.text}</li>)}
            </ul>
          </div>
          <WhatIsBeingDone topic="spread" />
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-tight mb-1">What treats advanced disease, cancer by cancer</h2>
          <p className="text-sm text-muted mb-4 max-w-3xl">One line per cancer, from its own record, on the treatments that act on advanced disease. Open a card for the map and the ranked sites.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {entries.map(({ s, c }) => (
              <article key={s.cancer} id={s.cancer} className="card p-4">
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <Link href={routeFor(c)} className="font-medium hover:underline">{c.name}</Link>
                  <span className="text-xs text-muted whitespace-nowrap">{s.sites.length} sites recorded</span>
                </div>
                <WhatHelpsLine spread={s} />
                <GentleSection className="mt-3 border-dashed" title={`the map for ${c.name.replace(/ \(.*\)$/, "")}`} why={SPREAD_LABELS.why} reassurance={SPREAD_LABELS.reassurance}>
                  <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                    <div className="px-2"><SpreadMap spread={s} cancerName={c.name} compact /></div>
                    <div>
                      <ol className="text-sm space-y-1">
                        {s.sites.map((x) => <li key={x.region} className="flex items-baseline justify-between gap-2"><span>{x.site}</span><span className="text-xs text-muted whitespace-nowrap">{x.tier}</span></li>)}
                      </ol>
                      {s.sites.some((x) => x.pct || x.note) && <ul className="mt-2 text-xs text-muted space-y-1">{s.sites.filter((x) => x.pct || x.note).map((x) => <li key={x.region}><span className="font-medium text-foreground/80">{x.site}:</span> {[x.pct, x.note].filter(Boolean).join(". ")}</li>)}</ul>}
                      <div className="mt-2 text-[11px] text-muted">Sources: {s.sources.map((u, i) => <a key={u} href={u} rel="noopener" className="underline mr-1.5">{i + 1}</a>)}</div>
                    </div>
                  </div>
                </GentleSection>
              </article>
            ))}
          </div>
        </section>
        <p className="text-xs text-muted max-w-3xl">Tiers summarise several series (Disibio and French 2008 autopsy study; Budczies et al. 2015; Riihimäki et al. 2014-2018 Swedish registry studies; Coleman 2006 for bone). Frequencies differ between series taken at diagnosis and at autopsy, so only figures stated in a source are quoted as numbers. The &ldquo;what helps&rdquo; lines come from each cancer&apos;s standard-of-care and pipeline records on OnCo.</p>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { logoSrc } from "@/lib/logos";
import { sources } from "@/data/sources";
import { pulseAsOf, pulseItems, pulseThemes } from "@/data/pulse";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PulseBoard, type PulseSource, type RefLite } from "@/components/PulseBoard";
import { AutoPulse, type AutoPulseSnapshot } from "@/components/AutoPulse";
import { readPublicJson } from "@/lib/feed-meta";

export const metadata: Metadata = pageMeta({ title: "This month in oncology research", description: "What the leading oncology journals, preprint servers, regulators, and news outlets are saying right now, and the cross-source themes.", path: "/pulse/" });

const TYPE_OF = (tags: string[]) => tags.find((t) => ["journal", "news", "preprint", "congress", "patient", "data"].includes(t)) ?? "other";

export default function PulsePage() {
  const g = graph();
  // Sources may live in the graph (once registered) or only in sources.ts; resolve both. Journals and preprint servers
  // are their own records (kind "journal"), so items that cite one are resolved from the graph as well.
  const srcs: PulseSource[] = [];
  const seen = new Set<string>();
  for (const s of sources) { seen.add(s.id); const e = g.get(s.id); srcs.push({ id: s.id, name: s.name, url: s.url, type: TYPE_OF(s.tags ?? []), logo: logoSrc(s.id, s.url), route: e ? routeFor(e) : undefined }); }
  for (const c of g.kind("collection")) if (!seen.has(c.id)) srcs.push({ id: c.id, name: c.name, url: c.url, type: TYPE_OF(c.tags), logo: logoSrc(c.id, c.url), route: routeFor(c) });
  const cited = new Set([...pulseItems.map((it) => it.sourceId), ...pulseThemes.flatMap((t) => t.sourceIds)]);
  for (const j of g.kind("journal")) if (cited.has(j.id) && !seen.has(j.id)) { seen.add(j.id); srcs.push({ id: j.id, name: j.name, url: j.url, type: j.scope === "preprints" ? "preprint" : "journal", logo: logoSrc(j.id, j.url), route: routeFor(j) }); }

  const refs: Record<string, RefLite> = {};
  for (const it of pulseItems) for (const id of it.refs) { const e = g.get(id); if (e) refs[id] = { id, name: e.name, route: routeFor(e), kind: e.kind }; }
  for (const t of pulseThemes) for (const id of t.refs) { const e = g.get(id); if (e) refs[id] = { id, name: e.name, route: routeFor(e), kind: e.kind }; }

  const auto = readPublicJson<AutoPulseSnapshot>("pulse/auto.json");
  if (auto) for (const it of auto.items) for (const id of it.refs) { const e = g.get(id); if (e) refs[id] = { id, name: e.name, route: routeFor(e), kind: e.kind }; }

  const bySourceType = srcs.reduce<Record<string, number>>((a, s) => { a[s.type] = (a[s.type] ?? 0) + 1; return a; }, {});

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="This month in oncology research"
        lede="What the leading journals, preprint servers, regulators, congress portals, and news outlets are saying about cancer right now, item by item with links, and the themes that run across them. A human reading of the field, not a feed."
        right={<Link href="/collections/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">All sources →</Link>} />
      <Container className="pb-16">
        <PulseBoard items={pulseItems} themes={pulseThemes} sources={srcs} refs={refs} asOf={pulseAsOf} />
        <section className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1"><h2 className="text-xl font-semibold tracking-tight">Automated stream</h2>{auto && <span className="text-xs text-muted">fetched {auto.fetched} · refreshed weekly</span>}</div>
          <p className="text-sm text-muted mb-3 max-w-3xl">Everything the leading journals, the FDA Oncology Center of Excellence and two news outlets published recently, pulled from their feeds without editing and matched to OnCo objects by name. The curated board above is a reading of the field; this is the raw material it is read from.</p>
          {auto ? <AutoPulse snap={auto} refs={refs} /> : <p className="card p-4 text-sm text-muted">The automated stream is not part of this build yet; it appears after the next weekly refresh. The curated board above is complete.</p>}
        </section>
        <section className="mt-12 card p-5 text-sm text-muted max-w-3xl">
          <div className="kicker mb-1">How we read the field</div>
          <p>Each item above was read on the date shown and links to the page it came from. Sentiment is an editorial label (promising, cautious, negative, neutral) about the item&apos;s implication for patients, not a judgement of the source. Themes are synthesised across sources and given a heat score from 1 to 5 for how much of the field&apos;s attention they hold this month. Several publishers block automated reading, so journal items are drawn from PubMed records of their latest papers; news items come from the outlets&apos; own pages. The source list covers {srcs.length} outlets: {Object.entries(bySourceType).map(([t, n]) => `${n} ${t}`).join(", ")}. The curated board is rebuilt by hand when the field moves; the automated stream below it is refreshed weekly by GitHub Actions (<Link className="underline" href="/status/">feed status</Link>).</p>
        </section>
      </Container>
    </>
  );
}

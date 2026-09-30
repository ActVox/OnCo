import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { RegulatoryBrowser, type RegRow } from "@/components/RegulatoryBrowser";
import { dateKey } from "@/components/RegulatoryTimeline";
import { FdaFeed, fdaActivityByDrug, readFda } from "@/components/FdaFeed";

export const metadata: Metadata = pageMeta({ title: "Regulatory timeline", description: "Every designation, filing, approval, complete response letter, withdrawal, and label change across products, sortable and filterable, with the weekly FDA approvals feed.", path: "/regulatory/" });

export default function RegulatoryPage() {
  const g = graph();
  // A product can carry two accelerated approvals granted on one day, for different indications, so the row id
  // takes the index as well as the date and type.
  const rows: RegRow[] = g.kind("drug").flatMap((d) => d.regulatoryEvents.map((e, i) => ({ id: `${d.id}-${e.date}-${e.type}-${i}`, drugId: d.id, drug: d.name, route: routeFor(d), modality: d.modality, date: e.date, key: dateKey(e.date), type: e.type, region: e.region, note: e.note, source: e.source, ...(e.indication ? { indication: e.indication } : {}) })));
  const approvals = rows.filter((r) => r.type === "approval").length;
  const accelerated = rows.filter((r) => r.type === "accelerated-approval").length;
  const confirmed = rows.filter((r) => r.type === "conversion").length;
  const fda = readFda();
  const fdaActivity = fdaActivityByDrug(fda);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Regulatory timeline"
        lede={`${rows.length} dated events across ${new Set(rows.map((r) => r.drugId)).size} products, including ${approvals} approvals and ${accelerated} accelerated approvals of which ${confirmed} have been confirmed, plus designations, filings, complete response letters, withdrawals, and label changes. Sort by date, filter by type or region, and click through to the product. The FDA approvals feed below is refreshed weekly and shows what is new since the last build and what is not yet in the corpus.`}
        right={<Link href="/regulatory/regions/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Approvals by region →</Link>} />
      <Container className="pb-16 space-y-8">
        <FdaFeed />
        <RegulatoryBrowser rows={rows} fdaActivity={fdaActivity} fdaFetched={fda?.fetched} />
        <p className="text-xs text-muted max-w-3xl">Feed status and refresh schedule: <Link className="underline" href="/status/">when each feed last ran</Link>. Events on product pages are hand-sourced; the feed is a prompt to add them, not a replacement.</p>
      </Container>
    </>
  );
}

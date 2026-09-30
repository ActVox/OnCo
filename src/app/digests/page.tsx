import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { digests } from "@/data/digests";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { AbstractCandidates } from "@/components/AbstractCandidates";

export const metadata: Metadata = pageMeta({ title: "Congress digests", description: "What changed at each oncology congress, item by item, with sources and links to the affected objects.", path: "/digests/" });

export default function DigestsIndex() {
  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Congress digests"
        lede="Each congress, distilled to the findings that changed something in this map, with a source for every item and links to the technologies, products, and trials it touches." />
      <Container className="pb-16 space-y-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {digests.map((d) => (
            <Link key={d.id} href={`/digests/${d.id}/`} className="card p-5 hover:shadow-md transition">
              <div className="kicker mb-1">{d.dates} · {d.location}</div>
              <div className="text-lg font-semibold">{d.congress}</div>
              <p className="text-sm text-muted mt-2">{d.tldr}</p>
              <div className="text-xs text-muted mt-3">{d.items.length} items</div>
            </Link>
          ))}
        </div>
        <AbstractCandidates existingDigestIds={digests.map((d) => d.id)} />
        <p className="text-xs text-muted max-w-3xl">Digests are written by hand from sources named on each item. The candidate list above is harvested weekly from the congress supplements (DOI records via Crossref) and matched to products and trials in OnCo; it is a reading list for the editor, not a digest. Feed status: <Link className="underline" href="/status/">when each feed last ran</Link>.</p>
      </Container>
    </>
  );
}

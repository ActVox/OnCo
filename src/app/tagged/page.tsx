import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { allTags, NO_DESCRIPTION } from "@/lib/tags";
import { KIND_META, type Kind } from "@/lib/kinds";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { TagGlyph } from "@/components/TaggedBrowser";
import { Tip } from "@/components/Tip";
import { KindIcon } from "@/components/KindIcon";

export const metadata: Metadata = pageMeta({ title: "Tags", description: "Every tag in the OnCo corpus with the number of records carrying it. Each opens a filterable table of those records, whatever their kind.", path: "/tagged/" });

/** Buckets so the long tail reads as a directory rather than one wall of pills. */
const BANDS: Array<{ min: number; label: string; note: string }> = [
  { min: 100, label: "Most used", note: "Tags on a hundred records or more." },
  { min: 10, label: "Common", note: "Tags on ten to ninety-nine records." },
  { min: 2, label: "Occasional", note: "Tags on two to nine records." },
  { min: 1, label: "Singletons", note: "Tags on one record only." },
];

export default function TaggedIndex() {
  const tags = allTags();
  const records = new Set<string>();
  for (const t of tags) for (const id of t.ids) records.add(id);
  const described = tags.filter((t) => t.description !== NO_DESCRIPTION).length;
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find"><span className="chip border bg-accent-soft text-accent border-accent/30 inline-flex items-center gap-1"><TagGlyph />{tags.length} tags</span></GroupKicker>} title="Tags"
        lede={`${tags.length} tags on ${records.size.toLocaleString("en-GB")} records. A tag groups records across kinds: a cancer, its trials, the people who work on it. Each tag page is a power search over everything carrying it, with kind, cancer, phase and year filters. ${described} tags have a one-line description written from how they are used; the rest say so.`}
        right={<Link href="/explore/" className="chip border bg-card border-border hover:bg-foreground/5 text-sm" title="Pick a cancer, switch kind, get a ranked and sortable list">Browse →</Link>} />
      <Container className="pb-16 space-y-10">
        {BANDS.map((band, i) => {
          const max = i === 0 ? Infinity : BANDS[i - 1].min;
          const list = tags.filter((t) => t.count >= band.min && t.count < max);
          if (!list.length) return null;
          return (
            <section key={band.label} id={band.label.toLowerCase().replace(/\s+/g, "-")}>
              <div className="flex items-baseline gap-3 mb-3"><h2 className="text-lg font-semibold tracking-tight">{band.label}</h2><span className="text-sm text-muted tabular-nums">{list.length}</span><span className="text-sm text-muted">{band.note}</span></div>
              <ul className="flex flex-wrap gap-1.5">
                {list.map((t) => {
                  const kinds = (Object.entries(t.kinds) as Array<[Kind, number]>).sort((a, b) => b[1] - a[1]);
                  const tip = `${t.description === NO_DESCRIPTION ? "No description yet." : t.description} ${t.count.toLocaleString("en-GB")} ${t.count === 1 ? "record" : "records"}: ${kinds.map(([k, n]) => `${n} ${n === 1 ? KIND_META[k].label.toLowerCase() : KIND_META[k].plural}`).join(", ")}.`;
                  return (
                    <li key={t.slug}>
                      <Tip title={t.tag} text={tip}>
                        <Link href={`/tagged/${t.slug}/`} className="chip border bg-card border-border hover:bg-accent-soft hover:text-accent hover:border-accent/40 inline-flex items-center gap-1.5">
                          <KindIcon kind={kinds[0][0]} className="h-3.5 w-3.5 text-muted" />{t.tag}<span className="tabular-nums text-muted">{t.count.toLocaleString("en-GB")}</span>
                        </Link>
                      </Tip>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        <p className="text-xs text-muted">Tags that record how a record entered the corpus (fetcher and list names) are kept on the record for audits and the JSON API but are not listed here.</p>
      </Container>
    </>
  );
}

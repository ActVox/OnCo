import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { completeness, headline, type Coverage, type MissingItem } from "@/lib/completeness";
import { issueUrl } from "@/lib/issue-links";
import { KIND_META, type Kind } from "@/lib/schema";
import { CompletenessTable, ofText } from "@/components/CompletenessTable";
import { Container, GroupKicker, PageHeader } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "How much of what exists is in OnCo",
  description: "How much of what exists is in OnCo: every kind against a sourced count of the world (FDA-approved cancer drugs, NCI-designated centres, OECI members, MEDLINE oncology journals, ClinicalTrials.gov, and more), with the missing items named and an add-this link for each.",
  path: "/completeness/",
});

const REPO = "https://github.com/judegomila/OnCo";
const SHOW_MAX = 150;

/** The `kind` dropdown value in the new-object issue form for each OnCo kind. */
const FORM_KIND: Partial<Record<Kind, string>> = { drug: "product", paper: "key paper", section: "front" };

function addUrl(c: Coverage, m: MissingItem): string {
  const kind = c.den.kind === "none" ? undefined : (FORM_KIND[c.den.kind] ?? c.den.kind);
  return issueUrl("new-object", {
    kind,
    name: m.name,
    sources: m.url,
    why: `Listed in ${c.den.source.label} (${c.den.source.url}) but not yet in OnCo.${m.detail ? ` ${m.detail}.` : ""} Found via /completeness/#${c.den.id}.`,
  }, { title: `add: ${m.name}` });
}

function Scope({ c }: { c: Coverage }) {
  const kindLabel = c.den.kind === "none" ? null : KIND_META[c.den.kind];
  const shown = c.missing.slice(0, SHOW_MAX);
  return (
    <section id={c.den.id} className="mt-12 scroll-mt-24">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-xl font-semibold tracking-tight"><a href={`#${c.den.id}`} className="hover:underline">{c.den.scope}</a></h2>
        {kindLabel && <Link href={`/${kindLabel.route}/`} className="text-xs text-muted hover:underline">{kindLabel.plural}</Link>}
        <span className="ml-auto text-sm tabular-nums">
          <strong>{c.ours.toLocaleString("en-GB")}</strong> of {ofText(c)}{c.pct !== null && <span className="text-muted"> ({c.pct}%)</span>}
        </span>
      </div>
      <p className="text-sm text-muted mt-1 max-w-3xl">
        <span className="text-foreground">World:</span> {c.den.method} <a href={c.den.source.url} rel="noopener" className="underline">{c.den.source.label}</a>, checked on {c.den.checked}.
      </p>
      <p className="text-sm text-muted mt-1 max-w-3xl"><span className="text-foreground">OnCo:</span> {c.den.ours}</p>
      {c.den.total === null ? null : c.listed ? (
        c.missing.length === 0 ? (
          <p className="text-sm mt-3 text-emerald-700 dark:text-emerald-300">Every listed item is in OnCo.</p>
        ) : (
          <details className="mt-3" open={c.missing.length <= 40}>
            <summary className="cursor-pointer text-sm text-muted hover:text-foreground">
              {c.missing.length.toLocaleString("en-GB")} missing{c.missing.length > SHOW_MAX ? `, first ${SHOW_MAX} shown` : ""}. Each &ldquo;Add this&rdquo; opens the new-object issue form, prefilled.
            </summary>
            <ol className="mt-2 card divide-y divide-border">
              {shown.map((m, i) => (
                <li key={`${m.name}-${i}`} className="px-3 py-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                  {m.url ? <a href={m.url} rel="noopener" className="font-medium hover:underline">{m.name}</a> : <span className="font-medium">{m.name}</span>}
                  {m.detail && <span className="text-xs text-muted">{m.detail}</span>}
                  <a href={addUrl(c, m)} rel="noopener" className="ml-auto text-xs underline text-muted hover:text-foreground whitespace-nowrap" title="Opens the New object issue form, prefilled with this item and its source">Add this</a>
                </li>
              ))}
            </ol>
            {c.missing.length > SHOW_MAX && c.den.list && (
              <p className="text-xs text-muted mt-2">The full list is in <a className="underline" href={`${REPO}/blob/main/src/data/universe-lists/${c.den.list}.json`} rel="noopener">src/data/universe-lists/{c.den.list}.json</a>.</p>
            )}
          </details>
        )
      ) : (
        <p className="text-sm text-muted mt-3">The source publishes a total, not a list, so the gap ({Math.max(0, c.den.total - c.ours).toLocaleString("en-GB")}) cannot be itemised here. Propose an addition through the <a className="underline" href={issueUrl("new-object", { kind: c.den.kind === "none" ? undefined : (FORM_KIND[c.den.kind] ?? c.den.kind) })} rel="noopener">new-object form</a>.</p>
      )}
    </section>
  );
}

export default function CompletenessPage() {
  const rows = completeness();
  const h = headline(rows);
  const withDen = rows.filter((r) => r.den.total !== null);
  const listed = withDen.filter((r) => r.listed);
  const ownKinds = rows.filter((r) => r.den.total === null);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="How much of what exists is in OnCo"
        lede="Coverage gauges say whether each record is complete. This page asks the other question: of everything that exists, how much is here? Each row sets an OnCo count against a sourced count of the world, on the same scope, and names what is missing." />
      <Container className="pb-16">
        <p className="text-sm text-muted mb-6 max-w-3xl">
          Across the {listed.length} scopes with a public list, OnCo holds <strong className="text-foreground">{h.ours.toLocaleString("en-GB")}</strong> of <strong className="text-foreground">{h.total.toLocaleString("en-GB")}</strong> listed items ({h.pct}%).
          Denominators come from <a className="underline" href={`${REPO}/blob/main/src/data/universe.ts`} rel="noopener">src/data/universe.ts</a>; the lists are refreshed weekly by <code>npm run fetch:universe</code> into <a className="underline" href={`${REPO}/tree/main/src/data/universe-lists`} rel="noopener">src/data/universe-lists/</a>, and the matching lives in <a className="underline" href={`${REPO}/blob/main/src/lib/completeness.ts`} rel="noopener">src/lib/completeness.ts</a>.
          &ldquo;About&rdquo; marks a denominator that is a round figure, a search hit count, or depends on name matching. A low number is not a failing: OnCo is a curated map, not a registry, and some scopes (every interventional cancer trial, every dictionary term) are shown for scale.
        </p>
        <CompletenessTable rows={rows} linkMissing />

        <h2 className="text-2xl font-semibold tracking-tight mt-14 mb-2">Missing items by scope</h2>
        <p className="text-sm text-muted max-w-3xl">Each list is the source&apos;s items that match nothing in OnCo by name, alias, identifier or website. Matching is exact after normalisation, so a listed item can occasionally be present under a name the matcher does not know; if so, add the alias to the record instead.</p>
        {withDen.map((c) => <Scope key={c.den.id} c={c} />)}

        <h2 className="text-2xl font-semibold tracking-tight mt-14 mb-2">Kinds without an external count</h2>
        <p className="text-sm text-muted max-w-3xl mb-3">These are OnCo&apos;s own taxonomy. There is no external list of fronts, technologies, pairings, roadmaps, ideas, bottlenecks or collections to count against, so no completeness is claimed; the number is the corpus count.</p>
        <ul className="card divide-y divide-border text-sm">
          {ownKinds.map((c) => (
            <li key={c.den.id} id={c.den.id} className="px-3 py-2 flex items-baseline gap-3 scroll-mt-24">
              <span className="font-medium">{c.den.scope}</span>
              <span className="text-xs text-muted">{c.den.method}</span>
              <span className="ml-auto tabular-nums">{c.ours.toLocaleString("en-GB")}</span>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted mt-10">
          See also the <Link className="underline" href="/roadmap/#health">corpus health gauges</Link> (record-level completeness), <Link className="underline" href="/gaps/">gaps to fill</Link>, and <Link className="underline" href="/data-sources/">open data sources</Link>.
        </p>
      </Container>
    </>
  );
}

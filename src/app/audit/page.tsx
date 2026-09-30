import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { StaticTable } from "@/components/filters/StaticTable";
import { pageRows } from "@/lib/static-tables";
import { AUDIT_BROKEN_TABLE, AUDIT_MISMATCHES_TABLE, AUDIT_PATCHES_TABLE, AUDIT_STALE_TABLE, auditTables, BROKEN_COLUMNS, CHECK_LABEL, familyOf, FINDING_COLUMNS, findingsTableId, MISMATCH_COLUMNS, PATCH_COLUMNS, ROW_CAP, SEV, STALE_COLUMNS } from "@/lib/tables/audit";

export const metadata: Metadata = pageMeta({ title: "Automated checks: what the build and the weekly sweep found", description: "Automated staleness, contradiction, sourcing, hygiene, link and registry fact-check findings for the OnCo corpus.", path: "/audit/" });

export default function AuditPage() {
  // Rows are built in src/lib/tables/audit.ts, shared with scripts/build-tables.ts: each table longer than a page carries
  // its first page here and the rest in /api/v1/tables/<id>.json, fetched when the reader scrolls, filters or sorts.
  const t = auditTables();
  const { audit, fc, patches, links, byCheck, gone, blocked, moved } = t;
  const groups = (["contradiction", "sourcing", "hygiene"] as const).map((fam) => ({ fam, checks: [...byCheck.entries()].filter(([c]) => familyOf(c) === fam) }));
  const stale = audit.staleness.filter((s) => s.days > 60);
  const broken = gone;
  const mismatches = pageRows(AUDIT_MISMATCHES_TABLE, t.mismatchRows);
  const patchTable = pageRows(AUDIT_PATCHES_TABLE, t.patchRows);
  const brokenTable = pageRows(AUDIT_BROKEN_TABLE, t.brokenRows);
  const staleTable = pageRows(AUDIT_STALE_TABLE, t.staleRows);

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Automated checks: what the build and the weekly sweep found"
        lede="Automated checks run on every build (contradictions, sourcing and hygiene) and weekly against the outside world (openFDA labels, ClinicalTrials.gov, and every cited URL). Findings are candidates for review, not verdicts; confirmed errors go to the corrections log." />
      <Container className="pb-16">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 mb-8">
          <Stat label="Entities" value={audit.total} />
          <Stat label="Findings" value={audit.findings.length} />
          <Stat label="High" value={audit.findings.filter((f) => f.severity === "high").length} tone="rose" />
          <Stat label="Medium" value={audit.findings.filter((f) => f.severity === "medium").length} tone="amber" />
          <Stat label="Older than 60 days" value={stale.length} />
          <Stat label="Registry mismatches" value={fc?.mismatches.length ?? 0} />
          <Stat label="Broken links (gone or unreachable)" value={broken.length} tone={broken.length ? "rose" : undefined} /><Stat label="Refused to the checker (live to readers)" value={blocked.length} />
        </div>

        {groups.map(({ fam, checks }) => (
          <section key={fam} className="mb-12">
            <h2 className="text-xl font-semibold mb-3">{fam === "contradiction" ? "Contradictions" : fam === "sourcing" ? "Sourcing" : "Hygiene: orphans and duplicates"}</h2>
            <p className="text-sm text-muted mb-4 max-w-3xl">
              {fam === "contradiction" && "Computed from the corpus alone: status fields that disagree with approval records or the six-region table, positive trials whose primary hazard ratio is not below 1, records last checked before their latest regulatory event, standard-of-care and roadmap rows citing withdrawn items, and future years."}
              {fam === "sourcing" && "Rule one is cite it. Records with no external source at all, records whose text carries a percentage, hazard ratio, duration or price with no link behind it, and structured trial outcomes without a source."}
              {fam === "hygiene" && "Parallel editing leaves seams: records nothing links to, the same name in two kinds, names two characters apart inside a kind, two products with one development code, and spike duplicates whose values diverge (the first copy wins silently). Each row says what a merge would look like."}
            </p>
            <div className="space-y-6">
              {checks.map(([check, list]) => {
                const table = pageRows(findingsTableId(check), t.findingRows(check));
                return (
                  <details key={check} className="card" open={list.some((f) => f.severity === "high")}>
                    <summary className="cursor-pointer px-4 py-3 flex items-center gap-3"><span className={`chip ${SEV[list[0].severity]}`}>{list[0].severity}</span><span className="font-medium">{CHECK_LABEL[check] ?? check}</span><span className="text-sm text-muted">{list.length}</span></summary>
                    <div className="px-3 pb-3 pt-1"><StaticTable rows={table.rows} more={table.more} columns={FINDING_COLUMNS} noun="findings" /></div>
                    {list.length > ROW_CAP && <div className="px-4 py-3 text-xs text-muted">Showing {ROW_CAP} of {list.length}; the rest are in <a className="underline" href="/audit.json">audit.json</a>.</div>}
                  </details>
                );
              })}
              {checks.length === 0 && <div className="card p-6 text-sm text-muted">No findings.</div>}
            </div>
          </section>
        ))}

        <h2 className="text-xl font-semibold mt-12 mb-3">Registry fact checks</h2>
        {fc ? (
          <>
            <p className="text-sm text-muted mb-4 max-w-3xl">Generated {fc.generated.slice(0, 10)}: {fc.checked.drugs} products checked against openFDA labels, {fc.checked.trials} trials against ClinicalTrials.gov (status, phase, primary completion). {fc.errors.length > 0 && <>{fc.errors.length} lookups failed and were skipped.</>}</p>
            {fc.mismatches.length ? (
              <StaticTable rows={mismatches.rows} more={mismatches.more} columns={MISMATCH_COLUMNS} noun="mismatches" url />
            ) : <div className="card p-6 text-sm text-muted">No mismatches.</div>}
            {patches && patches.patches.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-8 mb-2">Proposed patches</h3>
                <p className="text-sm text-muted mb-3 max-w-3xl">Where the registry value maps unambiguously onto ours, the fact check proposes a concrete edit. Nothing is applied automatically: a maintainer applies each proposed edit by hand, which updates the record, refreshes its checked date and adds a row to the <Link className="underline" href="/corrections/">corrections log</Link>.</p>
                <StaticTable rows={patchTable.rows} more={patchTable.more} columns={PATCH_COLUMNS} noun="patches" />
              </>
            )}
          </>
        ) : <div className="card p-6 text-sm text-muted">The fact-check report is produced weekly and is not part of this build yet; it appears after the next run.</div>}

        <h2 className="text-xl font-semibold mt-12 mb-3">Broken links</h2>
        {links ? (
          <>
            <p className="text-sm text-muted mb-4 max-w-3xl">Checked {links.generated.slice(0, 10)}: {links.checked.toLocaleString("en-GB")} of {links.total.toLocaleString("en-GB")} cited URLs probed; {links.broken} did not resolve, {links.moved} redirect to a different domain, {links.archived} have a Wayback Machine copy. Replace a dead URL with the archive copy or a current source; if the fact itself changes, log it in the corrections.</p>
            {broken.length ? (
              <>
                <StaticTable rows={brokenTable.rows} more={brokenTable.more} columns={BROKEN_COLUMNS} noun="links" />
                {broken.length > ROW_CAP && <div className="px-1 py-3 text-xs text-muted">Showing {ROW_CAP} of {broken.length}; the rest are in <a className="underline" href="/links.json">links.json</a>.</div>}
              </>
            ) : <div className="card p-6 text-sm text-muted">Every checked link resolved.</div>}
            {moved.length > 0 && (
              <details className="card mt-4"><summary className="cursor-pointer px-4 py-3 text-sm font-medium">{moved.length} links redirect to a different domain</summary>
                <div className="overflow-x-auto"><table className="onco"><thead><tr><th>URL</th><th>Now at</th><th>Cited by</th></tr></thead>
                  <tbody>{moved.slice(0, ROW_CAP).map((r, i) => <tr key={i}><td className="text-xs break-all text-muted">{r.url}</td><td className="text-xs break-all"><a className="underline" href={r.finalUrl} rel="noopener">{r.finalUrl}</a></td><td>{r.refs.slice(0, 2).map((x) => <div key={`${x.id}-${x.field}`}><Link href={x.route} className="hover:underline">{x.name}</Link></div>)}</td></tr>)}</tbody></table></div>
              </details>
            )}
          </>
        ) : <div className="card p-6 text-sm text-muted">The link report is produced weekly and is not part of this build yet; it appears after the next run.</div>}

        <h2 className="text-xl font-semibold mt-12 mb-3">Staleness</h2>
        <p className="text-sm text-muted mb-4 max-w-3xl">Records by last-checked date. The site does not show dates to readers; maintainers use this list to schedule re-checks. What counts as too old for each kind, and which records are past due, is defined on the <Link className="underline" href="/freshness/">freshness page</Link>.</p>
        <StaticTable rows={staleTable.rows} more={staleTable.more} columns={STALE_COLUMNS} noun="records" defaultSort={{ key: "days", dir: -1 }} />
        <p className="text-xs text-muted mt-3">Showing the 80 oldest of {audit.total}. Full data: <a className="underline" href="/audit.json">audit.json</a> · <a className="underline" href="/factcheck.json">factcheck.json</a> · {patches && <><a className="underline" href="/factcheck-patches.json">factcheck-patches.json</a> · </>}{links && <><a className="underline" href="/links.json">links.json</a> · </>}<Link className="underline" href="/freshness/">freshness</Link> · <Link className="underline" href="/history/">recent changes</Link> · <Link className="underline" href="/corrections/">corrections log</Link>.</p>
      </Container>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "rose" | "amber" }) {
  return (
    <div className={`card p-3 ${tone === "rose" ? "border-rose-200 dark:border-rose-900" : tone === "amber" ? "border-amber-200 dark:border-amber-900" : ""}`}>
      <div className="text-2xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

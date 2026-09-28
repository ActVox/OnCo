import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { runFreshness, TRACK_META, type Freshness } from "../../../scripts/freshness";
import { StaticTable, type StaticColumn, type StaticRow } from "@/components/filters/StaticTable";

export const metadata: Metadata = pageMeta({ title: "When each record is due a re-check", description: "How old is too old for each kind of OnCo record, by review track, and which records are past their re-check date.", path: "/freshness/" });

const TRACK_CLASS: Record<string, string> = {
  clinical: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  scientific: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  regulatory: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  advocate: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  editorial: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

const SLA_COLUMNS: StaticColumn[] = [
  { key: "records", label: "Records" },
  { key: "track", label: "Track", filterable: true },
  { key: "days", label: "Max age (days)", sortable: true, numeric: true },
  { key: "critical", label: "Critical", filterable: true },
  { key: "checked", label: "Checked", sortable: true, numeric: true },
  { key: "stale", label: "Past due", sortable: true, numeric: true },
];
const STALE_COLUMNS: StaticColumn[] = [
  { key: "entity", label: "Entity" },
  { key: "critical", label: "Critical", filterable: true, hide: "hidden md:table-cell" },
  { key: "kind", label: "Kind", filterable: true, className: "text-muted" },
  { key: "sla", label: "SLA", filterable: true, className: "text-muted" },
  { key: "asOf", label: "Last checked", sortable: true, numeric: false, className: "text-muted" },
  { key: "over", label: "Days over", sortable: true, numeric: true },
];

export default function FreshnessPage() {
  // Pure function of the corpus: compute at build so the page can never be stale relative to the data.
  const f: Freshness = runFreshness();
  const shown = f.stale.slice(0, 120);
  const slaRows: StaticRow[] = f.slas.map((s) => ({
    id: s.id,
    records: s.label,
    track: { text: TRACK_META[s.track].label, chip: TRACK_CLASS[s.track] },
    days: s.days,
    critical: s.critical,
    checked: s.checked,
    stale: { text: String(s.stale), v: s.stale, strong: s.stale > 0 },
  }));
  const staleRows: StaticRow[] = shown.map((s) => ({
    id: s.id,
    entity: { text: s.name, href: s.route, strong: true },
    critical: s.critical ? { text: "critical", chip: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200" } : { text: "no", v: "no", muted: true },
    kind: s.kind,
    sla: s.sla,
    asOf: s.asOf,
    over: s.over,
  }));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="When each record is due a re-check"
        lede="Every record carries the date its facts were last checked. This page defines the maximum acceptable age for each kind of record, assigns it to a review track, and lists what is past due. Critical breaches fail the build once they exceed a limit, so the site cannot quietly go stale." />
      <Container className="pb-16">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
          <Stat label="Records under an SLA" value={f.slas.reduce((n, s) => n + s.checked, 0)} />
          <Stat label="Past due" value={f.stale.length + f.calendarStale.length} tone={f.stale.length + f.calendarStale.length ? "amber" : undefined} />
          <Stat label="Critical past due" value={f.criticalStale} tone={f.criticalStale ? "rose" : undefined} />
          <Stat label="Build limit" value={f.limit} />
          <div className={`card p-3 ${f.pass ? "border-emerald-200 dark:border-emerald-900" : "border-rose-200 dark:border-rose-900"}`}>
            <div className="text-2xl font-semibold">{f.pass ? "Pass" : "Fail"}</div>
            <div className="text-xs text-muted">CI freshness gate</div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-3">By review track</h2>
        <p className="text-sm text-muted mb-4 max-w-3xl">Tracks are the same as on the <Link className="underline" href="/review/">review queue</Link>. A track&apos;s count is the number of its records whose last check is older than the track&apos;s SLA for that kind.</p>
        <div className="card overflow-x-auto mb-10">
          <table className="onco"><thead><tr><th>Track</th><th>Owns</th><th>Checked</th><th>Past due</th><th>Critical</th></tr></thead>
            <tbody>{f.tracks.map((t) => <tr key={t.track}><td><span className={`chip ${TRACK_CLASS[t.track]}`}>{t.label}</span></td><td className="text-muted">{TRACK_META[t.track].owner}</td><td className="tabular-nums">{t.checked}</td><td className="tabular-nums">{t.stale}</td><td className="tabular-nums">{t.criticalStale}</td></tr>)}</tbody></table>
        </div>

        <h2 className="text-xl font-semibold mb-3">How old is too old, by kind</h2>
        <p className="text-sm text-muted mb-4 max-w-3xl">Days since a record was last checked before it is due for a re-check. Critical SLAs cover the records where a stale fact can mislead a reader today: approved products, open trials, cancer pages and the readout calendar.</p>
        <div className="mb-10"><StaticTable rows={slaRows} columns={SLA_COLUMNS} noun="SLAs" url /></div>

        <h2 className="text-xl font-semibold mb-3">Past due</h2>
        {f.stale.length === 0 && f.calendarStale.length === 0 ? <div className="card p-6 text-sm text-muted">Nothing is past due: every record and calendar event was checked within its SLA when this page was built ({f.today}).</div> : (
          <>
            {f.calendarStale.length > 0 && (
              <div className="card overflow-x-auto mb-6"><table className="onco"><thead><tr><th>Calendar event</th><th>Kind</th><th>Date</th><th>Days ago</th></tr></thead>
                <tbody>{f.calendarStale.map((c, i) => <tr key={i}><td><Link href="/calendar/" className="font-medium hover:underline">{c.title}</Link></td><td className="text-muted">{c.kind}</td><td className="tabular-nums text-muted">{c.date}</td><td className="tabular-nums">{c.days}</td></tr>)}</tbody></table></div>
            )}
            {shown.length > 0 && <StaticTable rows={staleRows} columns={STALE_COLUMNS} noun="records" defaultSort={{ key: "over", dir: -1 }} />}
            {f.stale.length > shown.length && <p className="text-xs text-muted mt-3">Showing the {shown.length} most overdue of {f.stale.length}.</p>}
          </>
        )}
        <p className="text-xs text-muted mt-6">Full data: <a className="underline" href="/freshness.json">freshness.json</a> · <Link className="underline" href="/audit/">audit</Link> · <Link className="underline" href="/corrections/">corrections log</Link>. Generated {f.today}.</p>
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

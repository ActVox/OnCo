"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FacetSelect } from "./filters/FacetSelect";
import { ResultsTable, Toolbar, type Column, type SortState } from "./filters/ResultsTable";
import { EVENT_LABEL, EVENT_TONE, formatDate } from "./RegulatoryTimeline";

export type RegRow = { id: string; drugId: string; drug: string; route: string; modality: string; date: string; key: string; type: keyof typeof EVENT_LABEL; region: string; note: string; source?: string; /** The indication the event is about, on the accelerated-approval rows that carry one. */ indication?: string };

/**
 * Sortable, filterable table of dated regulatory events. `fdaActivity` (product id to ISO date) comes from the
 * weekly FDA feed snapshot: products with a recent FDA notice or approved supplement get a chip, and a toggle
 * narrows the table to them so new approvals that are missing an event stand out.
 */
export function RegulatoryBrowser({ rows, fdaActivity = {}, fdaFetched }: { rows: RegRow[]; fdaActivity?: Record<string, string>; fdaFetched?: string }) {
  const [types, setTypes] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [fdaOnly, setFdaOnly] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortState>({ key: "date", dir: -1 });
  const hasFeed = Object.keys(fdaActivity).length > 0;

  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = rows.filter((r) => (!types.length || types.includes(r.type)) && (!regions.length || regions.includes(r.region)) && (!years.length || years.includes(r.key.slice(0, 4))) && (!fdaOnly || fdaActivity[r.drugId]) && (!n || `${r.drug} ${r.note} ${r.modality} ${r.indication ?? ""}`.toLowerCase().includes(n)));
    list.sort((a, b) => sort.key === "drug" ? sort.dir * a.drug.localeCompare(b.drug) : sort.dir * a.key.localeCompare(b.key) || a.drug.localeCompare(b.drug));
    return list;
  }, [rows, types, regions, years, fdaOnly, fdaActivity, q, sort]);

  const opt = (f: (r: RegRow) => string, label?: (v: string) => string) => { const m = new Map<string, number>(); for (const r of rows) m.set(f(r), (m.get(f(r)) ?? 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([v, n]) => ({ value: v, label: label ? label(v) : v, count: n })); };
  // One option list per facet, shared by the toolbar control and the column header so the two never disagree.
  const typeOptions = opt((r) => r.type, (v) => EVENT_LABEL[v as keyof typeof EVENT_LABEL]);
  const regionOptions = opt((r) => r.region);
  const yearOptions = opt((r) => r.key.slice(0, 4)).sort((a, b) => b.value.localeCompare(a.value));

  const columns: Column<RegRow>[] = [
    { key: "date", label: "Date", sortable: true, filter: { options: yearOptions, value: years, onChange: setYears }, render: (r) => <span className="font-mono text-sm whitespace-nowrap">{formatDate(r.date)}</span> },
    { key: "drug", label: "Product", sortable: true, render: (r) => <div><Link href={`${r.route}#approvals`} className="font-medium hover:underline">{r.drug}</Link>{fdaActivity[r.drugId] && <span className="chip ml-1.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" title={`FDA activity ${fdaActivity[r.drugId]} in the weekly feed`}>FDA {fdaActivity[r.drugId]}</span>}<div className="text-xs text-muted">{r.modality}</div></div> },
    { key: "type", label: "Event", filter: { options: typeOptions, value: types, onChange: setTypes }, render: (r) => <span className={`chip ${EVENT_TONE[r.type]}`}>{EVENT_LABEL[r.type]}</span> },
    { key: "region", label: "Region", filter: { options: regionOptions, value: regions, onChange: setRegions }, render: (r) => <span className="text-muted">{r.region}</span>, hide: "hidden sm:table-cell" },
    { key: "note", label: "What happened", render: (r) => <span>{r.indication && <span className="block text-xs text-muted">{r.indication}</span>}{r.note}{r.source && <> <a className="text-xs underline text-muted" href={r.source} rel="noopener">source</a></>}</span> },
  ];

  return (
    <div>
      <Toolbar count={filtered.length} total={rows.length} noun="events"
        left={<>
          <FacetSelect label="Event" options={typeOptions} value={types} onChange={(v) => setTypes(v as string[])} multi searchable={false} allLabel="Any" width="w-52" />
          <FacetSelect label="Region" options={regionOptions} value={regions} onChange={(v) => setRegions(v as string[])} multi searchable={false} allLabel="Any" width="w-40" />
          <FacetSelect label="Year" options={yearOptions} value={years} onChange={(v) => setYears(v as string[])} multi searchable={false} allLabel="Any" width="w-36" />
          {hasFeed && <label className="inline-flex items-center gap-1.5 text-sm" title={fdaFetched ? `FDA feed fetched ${fdaFetched}` : undefined}><input type="checkbox" checked={fdaOnly} onChange={(e) => setFdaOnly(e.target.checked)} /> Recent FDA activity only</label>}
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product or note…" aria-label="Filter events" className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 w-56" />
          {(types.length || regions.length || years.length || fdaOnly || q) ? <button type="button" onClick={() => { setTypes([]); setRegions([]); setYears([]); setFdaOnly(false); setQ(""); }} className="text-sm underline text-muted">Clear</button> : null}
        </>} />
      <ResultsTable columns={columns} rows={filtered} rowKey={(r) => r.id} sort={sort} onSort={(k) => setSort((s) => (s.key === k ? { key: k, dir: s.dir === 1 ? -1 : 1 } : { key: k, dir: k === "date" ? -1 : 1 }))} />
    </div>
  );
}

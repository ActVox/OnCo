"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FacetSelect } from "./filters/FacetSelect";
import { Toolbar } from "./filters/ResultsTable";
import { OUTLOOK_META, type RecoveryOutlook } from "@/data/recovery-matrix";

export type MatrixCell = {
  treatment: string; effect: string; outlook: RecoveryOutlook; line: string;
  timescale?: string; proportion?: { figure: string; cohort: string };
  source: { label: string; url: string }; also?: { label: string; url: string }; quote?: string; searched?: string;
};
export type MatrixRow = { id: string; label: string; group: string; plain: string; links: { id: string; name: string; route: string }[] };
export type MatrixColumn = { id: string; label: string; short: string; plain: string; links: { id: string; name: string; route: string }[] };

const OUTLOOK_ORDER: RecoveryOutlook[] = ["usual", "partial", "unlikely", "unknown"];

function OutlookChip({ outlook, size = "sm" }: { outlook: RecoveryOutlook; size?: "sm" | "xs" }) {
  const m = OUTLOOK_META[outlook];
  return <span className={`chip ${m.chip} ${size === "xs" ? "text-[10px]" : "text-xs"}`} title={m.blurb}>{m.label}</span>;
}

function CellBody({ c }: { c: MatrixCell }) {
  return (
    <>
      <p className="text-sm leading-relaxed">{c.line}</p>
      {c.timescale && <p className="text-sm text-muted mt-1"><span className="text-foreground">When: </span>{c.timescale}</p>}
      {c.proportion && <p className="text-sm text-muted mt-1"><span className="text-foreground">How many: </span>{c.proportion.figure} <span className="text-muted">({c.proportion.cohort})</span></p>}
      {c.quote && <p className="text-xs text-muted mt-1.5 italic leading-relaxed">&ldquo;{c.quote}&rdquo;</p>}
      {c.searched && <p className="text-xs text-muted mt-1.5">Searched: {c.searched}</p>}
      <div className="mt-1.5 flex flex-col gap-0.5">
        <a className="text-[11px] underline break-words" href={c.source.url} rel="noopener">{c.source.label}</a>
        {c.also && <a className="text-[11px] underline break-words" href={c.also.url} rel="noopener">{c.also.label}</a>}
      </div>
    </>
  );
}

/**
 * The recovery matrix, as a list by default and a grid behind a toggle. The list is the honest default: the grid
 * is mostly empty, because most treatment and effect pairs have no published recovery figure, and a reader meets
 * the answers rather than the holes. The grid is there for the comparison the list cannot make, one column at a
 * time. A blank cell in either view means no source was found, never that nothing happens.
 */
export function RecoveryMatrix({ rows, columns, cells }: { rows: MatrixRow[]; columns: MatrixColumn[]; cells: MatrixCell[] }) {
  const [view, setView] = useState<"list" | "grid">("list");
  const [groups, setGroups] = useState<string[]>([]);
  const [effects, setEffects] = useState<string[]>([]);
  const [outlooks, setOutlooks] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cells.filter((c) => {
      const row = rows.find((r) => r.id === c.treatment);
      if (!row) return false;
      if (groups.length && !groups.includes(row.group)) return false;
      if (effects.length && !effects.includes(c.effect)) return false;
      if (outlooks.length && !outlooks.includes(c.outlook)) return false;
      if (needle && !`${row.label} ${c.line} ${columns.find((e) => e.id === c.effect)?.label ?? ""}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [cells, rows, columns, groups, effects, outlooks, q]);

  const shownRows = rows.filter((r) => shown.some((c) => c.treatment === r.id));
  const shownCols = columns.filter((e) => shown.some((c) => c.effect === e.id));
  const groupOpts = [...new Set(rows.map((r) => r.group))].map((v) => ({ value: v, label: v, count: rows.filter((r) => r.group === v).length }));
  const effectOpts = columns.map((e) => ({ value: e.id, label: e.label, count: cells.filter((c) => c.effect === e.id).length }));
  const outlookOpts = OUTLOOK_ORDER.map((o) => ({ value: o, label: OUTLOOK_META[o].label, count: cells.filter((c) => c.outlook === o).length }));
  const clear = () => { setGroups([]); setEffects([]); setOutlooks([]); setQ(""); };

  return (
    <div>
      <Toolbar count={shown.length} total={cells.length} noun="answers"
        left={<>
          <FacetSelect label="Treatment group" options={groupOpts} value={groups} onChange={(v) => setGroups(v as string[])} multi searchable={false} allLabel="All" width="w-56" />
          <FacetSelect label="Lasting effect" options={effectOpts} value={effects} onChange={(v) => setEffects(v as string[])} multi allLabel="All" width="w-56" />
          <FacetSelect label="Does it come back" options={outlookOpts} value={outlooks} onChange={(v) => setOutlooks(v as string[])} multi searchable={false} allLabel="All" width="w-56" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" aria-label="Filter the matrix" className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 w-40" />
          {(groups.length || effects.length || outlooks.length || q) ? <button type="button" onClick={clear} className="text-sm underline text-muted">Clear</button> : null}
        </>}
        right={<div className="inline-flex rounded-lg border border-border overflow-hidden" role="group" aria-label="View">
          {(["list", "grid"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v}
              className={`px-3 py-1.5 text-sm ${view === v ? "bg-accent text-white" : "bg-card hover:bg-foreground/5"}`}>{v === "list" ? "List" : "Grid"}</button>
          ))}
        </div>} />

      {view === "list" ? (
        <div className="space-y-5">
          {shownRows.map((r) => (
            <section key={r.id} id={r.id} className="card p-4">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="font-semibold leading-snug">{r.label}</h3>
                <span className="kicker">{r.group}</span>
              </div>
              <p className="text-sm text-muted mt-1 leading-relaxed">{r.plain}</p>
              {/* The title is set here rather than left to ChipTitles, which would otherwise add it after hydration. */}
              {r.links.length > 0 && <div className="flex flex-wrap gap-1.5 mt-2">{r.links.map((l) => <Link key={l.id} href={l.route} title={l.name} className="chip bg-foreground/5 hover:bg-foreground/10 transition text-xs">{l.name}</Link>)}</div>}
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {shown.filter((c) => c.treatment === r.id)
                  .sort((a, b) => columns.findIndex((e) => e.id === a.effect) - columns.findIndex((e) => e.id === b.effect))
                  .map((c, i) => {
                  const col = columns.find((e) => e.id === c.effect);
                  return (
                    <li key={`${c.treatment}-${c.effect}-${i}`} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        <span className="font-medium text-sm">{col?.label ?? c.effect}</span>
                        <OutlookChip outlook={c.outlook} size="xs" />
                      </div>
                      <CellBody c={c} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {shownRows.length === 0 && <p className="text-sm text-muted">No answer in the matrix matches that. Clear the filters to see all of it.</p>}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="onco text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card z-10">Treatment</th>
                {shownCols.map((e) => <th key={e.id} className="whitespace-nowrap" title={e.plain}>{e.short}</th>)}
              </tr>
            </thead>
            <tbody>
              {shownRows.map((r) => (
                <tr key={r.id}>
                  <td className="sticky left-0 bg-card z-10 whitespace-nowrap"><span className="font-medium">{r.label}</span><div className="text-[10px] text-muted">{r.group}</div></td>
                  {shownCols.map((e) => {
                    const here = shown.filter((x) => x.treatment === r.id && x.effect === e.id);
                    if (!here.length) return <td key={e.id} className="p-1 text-center"><span className="text-muted/40" title="No source found: unknown, not none">·</span></td>;
                    const c = here[0];
                    const m = OUTLOOK_META[c.outlook];
                    const title = here.map((x) => `${OUTLOOK_META[x.outlook].label}. ${x.line}${x.timescale ? ` ${x.timescale}.` : ""} Source: ${x.source.label}`).join("\n\n");
                    return (
                      <td key={e.id} className="p-1 text-center">
                        <a href={c.source.url} rel="noopener" className={`block rounded px-1.5 py-1 ${m.chip}`} title={`${r.label}, ${e.label}:\n\n${title}`}>
                          {c.outlook === "usual" ? "Yes" : c.outlook === "partial" ? "Part" : c.outlook === "unlikely" ? "No" : "?"}
                          {here.length > 1 && <span className="text-[9px] align-super">+{here.length - 1}</span>}
                        </a>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2 text-xs text-muted flex flex-wrap items-center gap-2">
            {OUTLOOK_ORDER.map((o) => <span key={o} className={`chip ${OUTLOOK_META[o].chip} text-[10px]`}>{o === "usual" ? "Yes" : o === "partial" ? "Part" : o === "unlikely" ? "No" : "?"} {OUTLOOK_META[o].label.toLowerCase()}</span>)}
            <span className="ml-1">A dot is a cell with no source found: unknown, not none. Hover a cell for the sentence and the source; click it to open the source.</span>
          </div>
        </div>
      )}
    </div>
  );
}

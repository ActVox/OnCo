"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { biomarkers } from "@/data/biomarkers";
import { scoreRows, type MatchRow } from "@/lib/biomarker-match";
import { conditionQuery } from "@/lib/ctgov";
import { STAGES, useProfile, type Stage } from "@/lib/profile";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { ProfileBar, type ProfileCancer, type ProfileLine } from "./ProfileBar";
import { TrialFinderGeo } from "./TrialFinderGeo";
import { CaregiverPanel, type CareDetail, type QuestionItem, type SupportItem } from "./CaregiverPanel";
import { MoleculeThumb, hasMolecule } from "./MoleculeThumb";
import { TechThumb } from "./TechThumb";
import { RowVisualFallback } from "./RowVisualFallback";
import { FilterHead } from "./filters/ResultsTable";
import { countOptions, useHeaderFilters } from "./filters/useHeaderFilters";

/**
 * The visual the site already draws for this record: a technology schematic, a rotating molecule for the top
 * drug rows, else the shared kind-symbol tile (the same stand-in the index tables use), all at one size.
 */
function RowVisual({ r, rank }: { r: MatchRow; rank: number }) {
  if (r.kind === "technology") return <TechThumb id={r.id} sections={[]} name={r.name} route={r.route} className="h-9 w-12" />;
  if (r.kind === "drug" && rank < 8 && hasMolecule(r.id)) return <Link href={r.route} aria-label={`${r.name} molecule`} className="inline-flex h-9 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-card"><MoleculeThumb drugId={r.id} className="h-9 w-12" /></Link>;
  return <RowVisualFallback kind={r.kind} name={r.name} route={r.route} className="h-9 w-12" />;
}

export type SocRef = { id: string; name: string; route: string; status?: string; kind: string; technologies: string[] };
export type SocRow = { setting: string; approach: string; refs: SocRef[] };
export type NavCancer = ProfileCancer & { route: string; tldr: string; stateOfArt: string[]; soc: SocRow[]; pipeline: string[] };

/** What the static page carries: the cancer chooser and the support links. The rest is fetched per cancer. */
export type NavigatorData = {
  cancers: ProfileCancer[];
  support: SupportItem[];
};

/** One cancer's file, /api/v1/navigator/<id>.json, written by scripts/build-api.ts from src/lib/navigator-data.ts. */
export type NavigatorCancerFile = {
  cancer: NavCancer;
  /** Rows relevant to the cancer plus every caution pairing. */
  rows: MatchRow[];
  details: Record<string, CareDetail>;
  questions: QuestionItem[];
};

const EMPTY_ROWS: MatchRow[] = [];
const EMPTY_LINES: ProfileLine[] = [];
const EMPTY_DETAILS: Record<string, CareDetail> = {};
const EMPTY_QUESTIONS: QuestionItem[] = [];

let linesPromise: Promise<ProfileLine[]> | null = null;
/** The "already tried" chooser list, once per page. */
function loadLines(): Promise<ProfileLine[]> {
  if (!linesPromise) linesPromise = fetch("/api/v1/navigator/lines.json").then(async (r) => (r.ok ? ((await r.json()) as ProfileLine[]) : EMPTY_LINES)).catch(() => EMPTY_LINES);
  return linesPromise;
}
const files = new Map<string, Promise<NavigatorCancerFile | null>>();
/** One cancer's file, once per page; null when it cannot be fetched. */
function loadCancerFile(id: string): Promise<NavigatorCancerFile | null> {
  let p = files.get(id);
  if (!p) {
    p = fetch(`/api/v1/navigator/${encodeURIComponent(id)}.json`).then(async (r) => (r.ok ? ((await r.json()) as NavigatorCancerFile) : null)).catch(() => null);
    files.set(id, p);
  }
  return p;
}

const EVIDENCE: Record<string, number> = { approved: 10, "standard-of-care": 10, established: 6, "phase-3": 6, positive: 6, emerging: 3, "phase-2": 4, "phase-1": 2, preclinical: 1, concept: 0 };
const HOPEFUL = (s?: string) => !["negative", "withdrawn", "historic"].includes(s ?? "");

/** Which standard-of-care rows apply to a stage, by matching the row's setting text. */
function settingMatches(setting: string, stage: Stage): boolean {
  const s = setting.toLowerCase();
  const metastatic = /metastatic|advanced|recurrent|relapsed|unresectable|castration|later line|second|third|refractory/.test(s);
  const early = /stage i\b|stage i-|stage ii|early|localised|localized|resectable|neoadjuvant|adjuvant|screening|prevention|newly diagnosed|frontline|limited/.test(s);
  const locallyAdvanced = /stage iii|locally advanced|unresectable stage|intermediate/.test(s);
  switch (stage) {
    case "early": return early || (!metastatic && !locallyAdvanced);
    case "locally-advanced": return locallyAdvanced || (early && !/screening|prevention/.test(s));
    case "metastatic-first-line": return metastatic && !/later line|second|third|after|refractory|relapse/.test(s);
    case "metastatic-later": return metastatic;
    default: return true;
  }
}

export function Navigator({ data }: { data: NavigatorData }) {
  const [profile, , ready] = useProfile();
  const [lines, setLines] = useState<ProfileLine[]>(EMPTY_LINES);
  const [file, setFile] = useState<{ id: string; data: NavigatorCancerFile | null } | null>(null);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    void loadLines().then((l) => { if (live) setLines(l); });
    return () => { live = false; };
  }, [ready]);
  const cancerId = profile.cancerId;
  useEffect(() => {
    if (!cancerId) return;
    let live = true;
    void loadCancerFile(cancerId).then((d) => { if (live) setFile({ id: cancerId, data: d }); });
    return () => { live = false; };
  }, [cancerId]);
  const current = file && file.id === cancerId ? file : null;
  const cancer = current?.data?.cancer;
  const rows = current?.data?.rows ?? EMPTY_ROWS;
  const details = current?.data?.details ?? EMPTY_DETAILS;
  const questions = current?.data?.questions ?? EMPTY_QUESTIONS;
  const loadingCancer = !!cancerId && !current;
  const failed = !!current && !current.data;
  const selectedBm = biomarkers.filter((b) => profile.biomarkers.includes(b.id));
  const tried = useMemo(() => new Set(profile.priorLines), [profile.priorLines]);

  // Expand "tried" to the technologies/classes and targets those products belong to, for caution matching.
  const triedClasses = useMemo(() => {
    const s = new Set<string>(tried);
    for (const r of rows) if (tried.has(r.id)) { r.technologies.forEach((t) => s.add(t)); r.targets.forEach((t) => s.add(t)); }
    return s;
  }, [rows, tried]);

  const socRows = useMemo(() => cancer ? cancer.soc.filter((r) => settingMatches(r.setting, profile.stage)) : [], [cancer, profile.stage]);
  const socRefIds = useMemo(() => new Set(socRows.flatMap((r) => r.refs.map((x) => x.id))), [socRows]);
  const pipelineIds = useMemo(() => new Set(cancer?.pipeline ?? []), [cancer]);

  const options = useMemo(() => {
    if (!cancer) return [];
    const bmScores = new Map(scoreRows(rows, selectedBm, cancer.id).map((s) => [s.row.id, s]));
    return rows
      .filter((r) => (r.kind === "drug" || r.kind === "technology") && r.cancers.includes(cancer.id) && HOPEFUL(r.status) && !tried.has(r.id))
      .map((r) => {
        const bm = bmScores.get(r.id);
        const parts: Array<[string, number]> = [];
        const ev = EVIDENCE[r.status ?? ""] ?? 0; if (ev) parts.push([STATUS_LABEL[r.status ?? ""] ?? r.status ?? "", ev]);
        if (socRefIds.has(r.id)) parts.push(["standard of care for this setting", 8]);
        if (pipelineIds.has(r.id)) parts.push(["in the pipeline", 4]);
        if (bm) parts.push([`biomarker match: ${bm.hits.join(", ")}`, bm.score]);
        const score = parts.reduce((a, [, v]) => a + v, 0);
        return { r, score, parts };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.r.name.localeCompare(b.r.name));
  }, [cancer, rows, selectedBm, tried, socRefIds, pipelineIds]);

  // Header filters on the ranked options: kind, status and the reasons a row ranks.
  const hf = useHeaderFilters();
  const statusOf = (s?: string) => (s ? STATUS_LABEL[s] ?? s : "No status");
  const shownOptions = options.filter((o) => hf.pass("kind", [o.r.kind]) && hf.pass("status", [statusOf(o.r.status)]) && hf.pass("why", o.parts.map(([k]) => k)));

  const cautions = useMemo(() => rows.filter((r) => r.pair?.caution && (triedClasses.has(r.pair.a) || triedClasses.has(r.pair.b) || r.technologies.some((t) => triedClasses.has(t)) || r.targets.some((t) => triedClasses.has(t)))), [rows, triedClasses]);

  const careTreatments: CareDetail[] = useMemo(() => {
    const ids = [...profile.priorLines, ...options.slice(0, 4).map((o) => o.r.id)];
    return [...new Set(ids)].map((id) => details[id]).filter((x): x is CareDetail => !!x);
  }, [profile.priorLines, options, details]);

  return (
    <div className="space-y-8">
      <ProfileBar cancers={data.cancers} lines={lines} />

      {/* Rose is the site's "Emergency services now" palette (RedCards.tsx, RedFlagCard.tsx). A legal note in it
          teaches the reader that the alarm colour can mean nothing urgent, and it was the first rose thing a
          frightened reader met here. Neutral card; the words are unchanged. */}
      <div className="card p-4 text-sm">
        <span className="font-semibold">Not medical advice.</span> This navigator ranks what is documented in OnCo for a cancer, stage, and biomarker set. It does not know your case, your fitness, your prior responses, or local availability. Use it to prepare questions, then decide with your clinical team.
      </div>

      {!ready && <p className="text-sm text-muted">Loading your profile…</p>}
      {ready && !cancerId && (
        <div className="card p-8 text-center text-muted">Choose a cancer type in the profile bar to build the line-of-therapy view. Add stage, biomarkers, and treatments already received to sharpen it.</div>
      )}
      {ready && loadingCancer && <p className="text-sm text-muted" aria-live="polite">Loading the records for this cancer…</p>}
      {ready && failed && <div className="card p-6 text-center text-sm text-muted">The records for this cancer could not be loaded. Check your connection and choose the cancer again.</div>}

      {cancer && (
        <>
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h2 className="text-xl font-semibold"><Link href={cancer.route} className="hover:underline">{cancer.name}</Link><span className="text-muted font-normal text-base"> · {STAGES.find((s) => s.id === profile.stage)?.label}</span></h2>
              <Link href={cancer.route} className="text-sm underline">Full cancer page →</Link>
            </div>
            <p className="text-[15px]">{cancer.tldr}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Standard of care for this setting <span className="text-muted text-sm font-normal">({socRows.length} of {cancer.soc.length} settings)</span></h2>
            {socRows.length === 0 && <p className="text-sm text-muted">No standard-of-care rows match this stage; set stage to &quot;Not sure&quot; to see all.</p>}
            <div className="space-y-3">
              {socRows.map((r, i) => (
                <div key={i} className="card p-4">
                  <div className="font-medium">{r.setting}</div>
                  <p className="text-[15px] text-foreground/85 mt-1">{r.approach}</p>
                  {r.refs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.refs.map((x) => <Link key={x.id} href={x.route} className={`chip border ${tried.has(x.id) ? "line-through opacity-60 bg-foreground/5 border-border" : "bg-card border-border hover:bg-foreground/5"}`}>{x.name}{tried.has(x.id) && <span className="ml-1 no-underline">✓ tried</span>}</Link>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {cautions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Cautions</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {cautions.map((c) => <Link key={c.id} href={c.route} className="card p-4 border-amber-300 dark:border-amber-900 hover:shadow-md transition"><div className="font-medium">⚠ {c.name}</div><p className="text-sm text-muted mt-1 line-clamp-3">{c.tldr}</p></Link>)}
              </div>
            </section>
          )}

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h2 className="text-lg font-semibold">Next options, ranked <span className="text-muted text-sm font-normal tabular-nums">{hf.active ? `${shownOptions.length} of ${options.length}` : options.length}</span>{hf.active && <> <button type="button" onClick={hf.clear} className="text-sm font-normal underline text-muted">clear filters</button></>}</h2>
              <details className="text-xs text-muted"><summary className="cursor-pointer">How the rank works</summary><p className="mt-1 max-w-md">Evidence tier (approved 10 … concept 0) + 8 if it appears in the standard-of-care rows for this setting + 4 if it is in the cancer&apos;s pipeline + biomarker match points from the tumour-board matcher. It ranks documentation and evidence, not benefit for you.</p></details>
            </div>
            <div className="card overflow-x-auto">
              <table className="onco">
                <thead><tr>
                  <th>#</th>
                  <th><FilterHead label="Option" spec={hf.spec("kind", countOptions(options.map((o) => o.r.kind), { labels: { drug: "Products", technology: "Technologies" } }))} /></th>
                  <th><FilterHead label="Phase / status" spec={hf.spec("status", countOptions(options.map((o) => statusOf(o.r.status))))} /></th>
                  <th className="hidden md:table-cell"><FilterHead label="Why it ranks" spec={hf.spec("why", countOptions(options.map((o) => o.parts.map(([k]) => k))))} /></th>
                  <th>Score</th>
                </tr></thead>
                <tbody>
                  {shownOptions.slice(0, 40).map((o, i) => (
                    <tr key={o.r.id}>
                      <td className="tabular-nums text-muted">{i + 1}</td>
                      <td className="min-w-[220px]"><div className="flex items-start gap-3"><RowVisual r={o.r} rank={i} /><div><Link href={o.r.route} className="font-medium hover:underline">{o.r.name}</Link><div className="text-xs text-muted line-clamp-2 max-w-lg">{o.r.meta && <span className="text-foreground/70">{o.r.meta} · </span>}{o.r.tldr}</div></div></div></td>
                      <td>{o.r.status && <span className={`chip ${statusClass(o.r.status)}`}>{STATUS_LABEL[o.r.status] ?? o.r.status}</span>}</td>
                      <td className="hidden md:table-cell"><div className="flex flex-wrap gap-1">{o.parts.map(([k, v]) => <span key={k} className="chip bg-foreground/5 text-[10px]">{k} +{v}</span>)}</div></td>
                      <td className="tabular-nums font-semibold">{o.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {options.length === 0 && <div className="p-6 text-center text-sm text-muted">Nothing left to rank for this combination.</div>}
              {options.length > 0 && shownOptions.length === 0 && <div className="p-6 text-center text-sm text-muted">Nothing matches the header filters. <button type="button" onClick={hf.clear} className="underline">Clear them</button>.</div>}
            </div>
          </section>

          {profile.mode === "caregiver" && (
            <section>
              <h2 className="text-lg font-semibold mb-2">For caregivers</h2>
              <CaregiverPanel treatments={careTreatments} support={data.support} questions={questions} cancerName={cancer.name.replace(/\s*\(.*?\)\s*$/, "")} cancerId={cancer.id} />
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-2">Recruiting trials</h2>
            <TrialFinderGeo condition={conditionQuery(cancer.name)} title={cancer.name} />
          </section>
        </>
      )}
    </div>
  );
}

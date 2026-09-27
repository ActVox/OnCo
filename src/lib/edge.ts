/**
 * Edge: the freshest dated signals the repository already holds, gathered at build time into one feed for /edge/
 * and for /edge/feed.xml and /edge/feed.json (scripts/build-feeds.ts).
 *
 * Sources (each item carries the snapshot or record it came from; nothing is fetched here):
 *   paper       public/papers/<id>.json `recent` (Europe PMC), journal versions of tracked preprints
 *               (public/preprints/index.json `published`) and papers the roadmap watch found (public/roadmap-watch.json)
 *   preprint    public/preprints/index.json `items`
 *   approval    FDA OCE notifications (public/fda/recent.json), dated `regulatoryEvents` on products, EU rows of
 *   withdrawal  src/data/regional-approvals.ts with a year and a source
 *   result      trials with `yearReported` and structured `outcomes`
 *   law         src/data/law-wave.ts LAW_INDEX rows, dated to the year of the instrument
 *   proposal    public/proposals/latest.json (the nightly bot's proposals; not facts until applied)
 *   issue       public/newsletter/index.json
 *
 * Rules: an item without a date or a source URL is never emitted; papers are one entry per DOI however many records
 * matched them (their record chips are merged); the same URL from two sources is one item, the weightier kind kept.
 * Ranking (rankEdge): newest first, with an importance weight expressed in days so it stays modest and explainable:
 * approvals, withdrawals and phase 3 results count as two weeks fresher than their date, other results, law and
 * papers in the leading journals one week fresher, preprints one week older. Every kind keeps at least its most
 * recent few items so a filter is never empty while the source has data. Dates known only to the year or the
 * quarter rank from the first day of that period and are grouped under the year, never given an invented day.
 *
 * Server side only (reads the file system); the page and the feed script call `edgeFeed`.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { graph } from "./graph";
import { phaseLabel, routeFor } from "./kinds";
import type { Kind } from "./schema";
import { absoluteUrl } from "./seo";
import { regionalApprovals } from "@/data/regional-approvals";
import { LAW_INDEX, LAW_JURISDICTIONS } from "@/data/law-wave";
import { EDGE_KIND_META, edgeGroupKey, edgeGroupLabel, plainDate, type EdgeKind, type EdgePrecision } from "./edge-kinds";

export { EDGE_KINDS, EDGE_KIND_META, edgeDateLabel, edgeGroupKey, edgeGroupLabel, plainDate, type EdgeKind, type EdgePrecision } from "./edge-kinds";

export type EdgeRef = { id: string; kind: Kind; name: string; route: string };
export type EdgeItem = {
  /** Stable id: the source URL. */
  id: string;
  /** ISO 8601 at the precision the source gives: YYYY-MM-DD, YYYY-MM, YYYY-Qn or YYYY. */
  date: string;
  precision: EdgePrecision;
  /** First day of the period, YYYY-MM-DD; what ranking sorts on. */
  sortDate: string;
  kind: EdgeKind;
  title: string;
  /** One plain sentence built from the source's own fields. */
  sentence: string;
  /** Source URL (the paper, the notice, the register entry, the statute). */
  url: string;
  /** Journal or agency, where the source names one. */
  venue?: string;
  refs: EdgeRef[];
  doi?: string;
  /** Importance weight in days added to the date when ranking. */
  weight: number;
};

export const EDGE_PAGE_CAP = 200;
export const EDGE_FEED_CAP = 500;
/** Every kind keeps at least this many of its most recent items in the ranked list, while its source has them. */
export const EDGE_KIND_FLOOR = 15;
/** Day- and month-dated items older than this are not considered; year- and quarter-dated ones must fall in this year or last. */
const WINDOW_DAYS = 400;
/** No kind takes more than this many places in a ranked list (derivative kinds would otherwise flood a day). */
export const EDGE_KIND_CEILING: Partial<Record<EdgeKind, number>> = { proposal: 20, issue: 6, preprint: 40 };

const WEIGHT = { approval: 14, withdrawal: 14, phase3: 14, result: 7, law: 7, topJournal: 7, paper: 0, proposal: 0, issue: 0, preprint: -7 } as const;

/** Journals whose papers rank a week fresher (Europe PMC abbreviations and full titles). */
const TOP_JOURNALS = /^(n engl j med|new england journal of medicine|nejm|lancet|the lancet|lancet oncol(ogy)?|lancet haematol(ogy)?|jama|jama oncol(ogy)?|j clin oncol|journal of clinical oncology|nature|nat med|nature medicine|nat cancer|nature cancer|science|cell|cancer cell|cancer discov(ery)?|ann oncol|annals of oncology|blood|bmj|nat rev cancer|nat rev clin oncol)\.?$/i;
export const isTopJournal = (j?: string) => !!j && TOP_JOURNALS.test(j.trim());

export const todayIso = () => new Date().toISOString().slice(0, 10);

/** Parse the date forms the corpus uses; anything else (or a date after `today`) is rejected. */
export function normaliseEdgeDate(raw: string | number | undefined, today = todayIso()): { date: string; precision: EdgePrecision; sortDate: string } | null {
  if (raw === undefined || raw === null) return null;
  const s = String(raw).trim();
  let out: { date: string; precision: EdgePrecision; sortDate: string } | null = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) out = { date: s, precision: "day", sortDate: s };
  else if (/^\d{4}-\d{2}$/.test(s)) out = { date: s, precision: "month", sortDate: `${s}-01` };
  else if (/^\d{4}-Q[1-4]$/.test(s)) { const y = s.slice(0, 4); const q = Number(s.slice(6)); out = { date: s, precision: "quarter", sortDate: `${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01` }; }
  else if (/^\d{4}$/.test(s)) out = { date: s, precision: "year", sortDate: `${s}-01-01` };
  if (!out || out.sortDate > today) return null;
  const [y, m, d] = out.sortDate.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return null;
  return out;
}

export const firstSentence = (s: string) => { const m = /^(.+?[.!?])(\s|$)/.exec(s.trim()); return (m ? m[1] : s.trim()).replace(/\s+/g, " "); };
const sentenceOf = (s: string) => { const t = firstSentence(s); return /[.!?]$/.test(t) ? t : `${t}.`; };
const shortName = (s: string) => s.replace(/ \(.*\)$/, "");
const listNames = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
const normDoi = (doi?: string) => doi?.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").toLowerCase() || undefined;
const normUrl = (u: string) => u.trim().replace(/\/+$/, "").toLowerCase();

const AGENCY: Record<string, string> = { US: "FDA", USA: "FDA", EU: "EMA / European Commission", UK: "MHRA", JP: "PMDA / MHLW", Japan: "PMDA / MHLW", CN: "NMPA", China: "NMPA", AU: "TGA", IN: "CDSCO" };
const REG_TYPE: Record<string, string> = { approval: "Approval", "accelerated-approval": "Accelerated approval", conversion: "Accelerated approval confirmed", withdrawal: "Withdrawal" };
const PROPOSAL_KIND: Record<string, string> = { "regional-row": "regional approval row", "regulatory-event": "regulatory event", "trial-status": "trial status change", "drug-approval": "approval", "trial-completion": "trial completion", "new-product": "new product" };

/** Journal or agency name from a source URL's host, for items whose record does not name one. */
export function venueFromUrl(url: string): string | undefined {
  let host: string;
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { return undefined; }
  const known: Array<[RegExp, string]> = [
    [/fda\.gov$/, "FDA"], [/ema\.europa\.eu$/, "EMA"], [/ec\.europa\.eu$/, "European Commission"], [/clinicaltrials\.gov$/, "ClinicalTrials.gov"], [/nejm\.org$/, "NEJM"],
    [/thelancet\.com$/, "The Lancet"], [/jamanetwork\.com$/, "JAMA Network"], [/ascopubs\.org$/, "ASCO journals"], [/nature\.com$/, "Nature"], [/pubmed\.ncbi\.nlm\.nih\.gov$/, "PubMed"],
    [/europepmc\.org$/, "Europe PMC"], [/doi\.org$/, "DOI"], [/gov\.uk$/, "GOV.UK"], [/mhra\.gov\.uk$/, "MHRA"], [/congress\.gov$/, "Congress.gov"], [/eur-lex\.europa\.eu$/, "EUR-Lex"],
    [/legislation\.gov\.uk$/, "legislation.gov.uk"], [/nice\.org\.uk$/, "NICE"], [/pmda\.go\.jp$/, "PMDA"], [/nmpa\.gov\.cn$/, "NMPA"], [/tga\.gov\.au$/, "TGA"], [/cdsco\.gov\.in$/, "CDSCO"], [/onco\.cc$/, "OnCo"],
  ];
  return known.find(([re]) => re.test(host))?.[1] ?? host;
}

type PaperRec = { title?: string; doi?: string; pmid?: string; journal?: string; date?: string; source?: string };
type PapersFile = { id: string; kind: string; name: string; recent?: PaperRec[] };
type PreprintIndex = { items?: Array<{ id: string; doi?: string; title: string; publisher?: string; date?: string; entityIds?: string[] }>; published?: Array<{ pprId: string; doi?: string; pmid?: string; journal?: string; date?: string; title: string; entityIds?: string[] }> };
type FdaSnapshot = { oce?: Array<{ date: string; title: string; url: string; summary: string; drugIds?: string[]; cancerIds?: string[] }> };
type RoadmapWatch = { roadmaps?: Array<{ id: string; trials?: Array<{ id: string; papers?: Array<{ pmid?: string; doi?: string; title?: string; journal?: string; date?: string }> }> }> };
type Proposals = { generated?: string; proposals?: Array<{ kind: string; entityId?: string; entityName?: string; evidence?: string; sourceUrl?: string; detected?: string; proposed?: string }> };
type Issues = Array<{ date: string; title: string; summary?: string }>;

function readJson<T>(root: string, rel: string): T | null {
  const p = join(root, "public", rel);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")) as T; } catch { return null; }
}

/** Every dated, sourced item from every source, deduplicated but not yet ranked. */
export function edgeItems(root = process.cwd(), today = todayIso()): EdgeItem[] {
  const g = graph();
  const ref = (id?: string): EdgeRef | undefined => { const e = id ? g.get(id) : undefined; return e ? { id: e.id, kind: e.kind, name: shortName(e.name), route: routeFor(e) } : undefined; };
  const refs = (ids: Array<string | undefined>, max = 6): EdgeRef[] => { const seen = new Set<string>(); const out: EdgeRef[] = []; for (const id of ids) { const r = ref(id); if (r && !seen.has(r.id)) { seen.add(r.id); out.push(r); } if (out.length >= max) break; } return out; };
  const cutoff = new Date(Date.parse(`${today}T00:00:00Z`) - WINDOW_DAYS * 86_400_000).toISOString().slice(0, 10);
  const items: EdgeItem[] = [];
  const push = (it: Omit<EdgeItem, "id" | "date" | "sortDate" | "precision"> & { raw: string | number | undefined }) => {
    const d = normaliseEdgeDate(it.raw, today);
    if (!d || !it.url || !/^https?:\/\//.test(it.url) || !it.title.trim()) return;
    if (d.precision === "day" || d.precision === "month" ? d.sortDate < cutoff : Number(d.date.slice(0, 4)) < Number(today.slice(0, 4)) - 1) return;
    const { raw: _raw, ...rest } = it; void _raw;
    items.push({ ...rest, id: it.url, date: d.date, precision: d.precision, sortDate: d.sortDate, title: it.title.trim() });
  };
  const paperUrl = (p: { doi?: string; pmid?: string }) => (p.doi ? `https://doi.org/${normDoi(p.doi)}` : p.pmid ? `https://europepmc.org/article/MED/${p.pmid}` : undefined);

  // Papers from the Europe PMC snapshot, one file per record.
  const papersDir = join(root, "public", "papers");
  if (existsSync(papersDir)) {
    for (const f of readdirSync(papersDir)) {
      if (!f.endsWith(".json") || f === "index.json") continue;
      let rec: PapersFile; try { rec = JSON.parse(readFileSync(join(papersDir, f), "utf8")) as PapersFile; } catch { continue; }
      const r = ref(rec.id);
      for (const p of rec.recent ?? []) {
        const url = paperUrl(p); if (!url || !p.title || !p.date || p.date < cutoff) continue;
        const preprint = p.source === "PPR";
        push({ raw: p.date, kind: preprint ? "preprint" : "paper", title: p.title, url, doi: normDoi(p.doi), venue: p.journal, refs: r ? [r] : [],
          sentence: preprint ? `Posted as a preprint on ${plainDate(p.date)}; not peer reviewed; matched the OnCo record for ${r?.name ?? rec.name}.` : `${p.journal ? `Published in ${p.journal}` : "Indexed by Europe PMC"} on ${plainDate(p.date)}; matched the OnCo record for ${r?.name ?? rec.name}.`,
          weight: preprint ? WEIGHT.preprint : isTopJournal(p.journal) ? WEIGHT.topJournal : WEIGHT.paper });
      }
    }
  }

  // Preprints and their journal versions.
  const pre = readJson<PreprintIndex>(root, "preprints/index.json");
  for (const p of pre?.items ?? []) {
    if (!p.date || p.date < cutoff) continue;
    const rs = refs(p.entityIds ?? []);
    push({ raw: p.date, kind: "preprint", title: p.title, url: p.doi ? `https://doi.org/${normDoi(p.doi)}` : `https://europepmc.org/article/PPR/${p.id}`, doi: normDoi(p.doi), venue: p.publisher, refs: rs, weight: WEIGHT.preprint,
      sentence: `Posted on ${p.publisher ?? "a preprint server"} on ${plainDate(p.date)}; not peer reviewed${rs.length ? `; matched ${listNames(rs.slice(0, 3).map((x) => x.name))}` : ""}.` });
  }
  for (const p of pre?.published ?? []) {
    const url = paperUrl(p); if (!url || !p.date || p.date < cutoff) continue;
    const rs = refs(p.entityIds ?? []);
    push({ raw: p.date, kind: "paper", title: p.title, url, doi: normDoi(p.doi), venue: p.journal, refs: rs, weight: isTopJournal(p.journal) ? WEIGHT.topJournal : WEIGHT.paper,
      sentence: `${p.journal ? `Published in ${p.journal}` : "Published"} on ${plainDate(p.date)} after first appearing as a preprint${rs.length ? `; matched ${listNames(rs.slice(0, 3).map((x) => x.name))}` : ""}.` });
  }

  // Papers the roadmap watch found for landmark trials.
  const rw = readJson<RoadmapWatch>(root, "roadmap-watch.json");
  for (const rm of rw?.roadmaps ?? []) for (const t of rm.trials ?? []) for (const p of t.papers ?? []) {
    const url = paperUrl(p); if (!url || !p.title || !p.date || p.date < cutoff) continue;
    const trial = ref(t.id);
    push({ raw: p.date, kind: "paper", title: p.title, url, doi: normDoi(p.doi), venue: p.journal, refs: refs([t.id, rm.id]), weight: isTopJournal(p.journal) ? WEIGHT.topJournal : WEIGHT.paper,
      sentence: `${p.journal ? `Published in ${p.journal}` : "Published"} on ${plainDate(p.date)}; found by the roadmap watch for ${trial?.name ?? t.id}.` });
  }

  // FDA Oncology Center of Excellence notifications.
  const fda = readJson<FdaSnapshot>(root, "fda/recent.json");
  for (const o of fda?.oce ?? []) {
    if (!o.url || !o.title) continue;
    const withdrawal = /\bwithdraw/i.test(o.title);
    push({ raw: o.date, kind: withdrawal ? "withdrawal" : "approval", title: o.title, url: o.url, venue: "FDA", refs: refs([...(o.drugIds ?? []), ...(o.cancerIds ?? [])]), weight: WEIGHT.approval,
      sentence: o.summary ? sentenceOf(o.summary) : `Notice published by the FDA Oncology Center of Excellence on ${plainDate(o.date)}.` });
  }

  // Dated approvals and withdrawals recorded on product pages.
  for (const d of g.kind("drug")) {
    for (const e of d.regulatoryEvents) {
      // An accelerated approval and the conversion that confirmed it are approvals for the Edge's purposes; each
      // carries its own words in REG_TYPE so a reader can see which of the three a line is.
      if (!REG_TYPE[e.type] || !e.source) continue;
      push({ raw: e.date, kind: e.type === "withdrawal" ? "withdrawal" : "approval", title: `${REG_TYPE[e.type]}: ${shortName(d.name)} (${e.region})`, url: e.source, venue: AGENCY[e.region] ?? e.region, refs: refs([d.id, ...d.cancers, ...d.targets]), weight: WEIGHT.approval, sentence: sentenceOf(e.note) });
    }
  }

  // European Commission authorisations and withdrawals from the regional table.
  for (const [id, row] of Object.entries(regionalApprovals)) {
    const eu = row.EU;
    if (!eu?.year || !eu.source || !["approved", "conditional", "withdrawn"].includes(eu.status)) continue;
    const d = g.get(id); if (!d) continue;
    const withdrawn = eu.status === "withdrawn";
    push({ raw: eu.year, kind: withdrawn ? "withdrawal" : "approval", title: `${withdrawn ? "EU withdrawal" : eu.status === "conditional" ? "EU conditional authorisation" : "EU authorisation"}: ${shortName(d.name)}`, url: eu.source, venue: "European Commission (EMA opinion)", refs: refs([d.id, ...d.cancers, ...d.targets]), weight: WEIGHT.approval,
      sentence: withdrawn ? `Marketing authorisation withdrawn in the European Union in ${eu.year}${eu.note ? `: ${sentenceOf(eu.note)}` : "."}` : `${eu.status === "conditional" ? "Conditional marketing authorisation" : "Marketing authorisation"} in the European Union in ${eu.year}${eu.indication ? `, for ${eu.indication.replace(/\.$/, "")}.` : "."}` });
  }

  // Trial results: reported year plus structured outcomes.
  for (const t of g.kind("trial")) {
    if (!t.yearReported || !t.outcomes.length) continue;
    const url = t.outcomes.find((o) => o.source)?.source ?? t.links[0]?.url ?? (t.nct ? `https://clinicaltrials.gov/study/${t.nct}` : undefined);
    if (!url) continue;
    const primary = t.outcomes.find((o) => o.primary) ?? t.outcomes[0];
    const armText = primary.arms.filter((a) => a.value !== undefined).map((a) => `${a.name} ${a.value}${primary.unit ? ` ${primary.unit}` : ""}`);
    const sentence = t.result ? sentenceOf(t.result) : armText.length ? `${primary.endpoint}: ${armText.join(" versus ")}${primary.hr !== undefined ? `, hazard ratio ${primary.hr}` : ""}.` : undefined;
    if (!sentence) continue;
    const big = t.phase === "3" || t.phase === "2/3";
    push({ raw: t.yearReported, kind: "result", title: `${shortName(t.name)}: ${phaseLabel(t.phase)} result`, url, venue: venueFromUrl(url), refs: refs([t.id, ...t.drugs, ...t.cancers, ...t.targets]), weight: big ? WEIGHT.phase3 : WEIGHT.result, sentence });
  }

  // Law and policy, dated to the year of the instrument.
  for (const row of LAW_INDEX) {
    const term = g.get(row.id); if (!term) continue;
    const url = term.links.find((l) => !/wikipedia\.org/i.test(l.url))?.url ?? term.wikipedia; if (!url) continue;
    push({ raw: row.year, kind: "law", title: term.name, url, venue: `${LAW_JURISDICTIONS[row.jurisdiction]}, ${row.instrument}`, refs: refs([term.id, ...term.institutions, ...term.related], 4), weight: WEIGHT.law, sentence: sentenceOf(term.tldr) });
  }

  // The nightly bot's proposals.
  const props = readJson<Proposals>(root, "proposals/latest.json");
  for (const p of props?.proposals ?? []) {
    if (!p.sourceUrl || !p.entityName) continue;
    push({ raw: p.detected ?? props?.generated, kind: "proposal", title: `Proposed ${PROPOSAL_KIND[p.kind] ?? p.kind.replace(/-/g, " ")}: ${shortName(p.entityName)}`, url: p.sourceUrl, venue: venueFromUrl(p.sourceUrl), refs: refs([p.entityId]), weight: WEIGHT.proposal,
      sentence: p.evidence ? sentenceOf(p.evidence) : `Proposed by the nightly bot on ${p.detected ?? props?.generated ?? "an unrecorded date"}; awaiting review.` });
  }

  // Weekly issues.
  for (const i of readJson<Issues>(root, "newsletter/index.json") ?? []) {
    if (!i.date || !i.title) continue;
    push({ raw: i.date, kind: "issue", title: i.title, url: absoluteUrl(`/newsletter/${i.date}/`), venue: "OnCo weekly issue", refs: [], weight: WEIGHT.issue, sentence: i.summary ? sentenceOf(i.summary) : `Issue of ${plainDate(i.date)}.` });
  }

  return dedupeEdge(items);
}

/**
 * One item per DOI (else per kind and URL: the FDA notice and the product page's event for the same approval are one
 * item; a proposal that cites the notice stays its own item). The item with the larger weight is kept as the base;
 * record chips are merged; within one kind a day-precise date replaces a coarser one.
 */
export function dedupeEdge(items: EdgeItem[]): EdgeItem[] {
  const byKey = new Map<string, EdgeItem>();
  const order: string[] = [];
  for (const it of items) {
    const key = it.doi ? `doi:${normDoi(it.doi)}` : `${it.kind}:${normUrl(it.url)}`;
    const cur = byKey.get(key);
    if (!cur) { byKey.set(key, { ...it, refs: [...it.refs] }); order.push(key); continue; }
    const base = it.weight > cur.weight ? { ...it } : { ...cur };
    const other = it.weight > cur.weight ? cur : it;
    const seen = new Set(base.refs.map((r) => r.id));
    base.refs = [...base.refs, ...other.refs.filter((r) => !seen.has(r.id))];
    if (other.kind === base.kind && other.precision === "day" && base.precision !== "day") { base.date = other.date; base.precision = other.precision; base.sortDate = other.sortDate; }
    base.venue = base.venue ?? other.venue;
    base.doi = base.doi ?? other.doi;
    byKey.set(key, base);
  }
  return order.map((k) => byKey.get(k)!);
}

const DAY = 86_400_000;
/** Ranking score: the item's first day plus its weight in days. */
export const edgeScore = (it: Pick<EdgeItem, "sortDate" | "weight">) => Date.parse(`${it.sortDate}T00:00:00Z`) + it.weight * DAY;
const byScore = (a: EdgeItem, b: EdgeItem) => edgeScore(b) - edgeScore(a) || b.sortDate.localeCompare(a.sortDate) || a.title.localeCompare(b.title);

/**
 * The top `cap` items by score, with every kind keeping at least `floor` of its own most recent items and no kind
 * taking more than its ceiling. When the floors push the list over the cap, the lowest-scoring items of the kinds
 * that are over their floor are dropped.
 */
export function rankEdge(items: EdgeItem[], { cap = EDGE_PAGE_CAP, floor = EDGE_KIND_FLOOR, ceilings = EDGE_KIND_CEILING, today = todayIso() }: { cap?: number; floor?: number; ceilings?: Partial<Record<EdgeKind, number>>; today?: string } = {}): EdgeItem[] {
  const taken = new Map<EdgeKind, number>();
  const eligible = items.filter((it) => it.sortDate <= today).sort(byScore).filter((it) => { const n = taken.get(it.kind) ?? 0; if (n >= (ceilings[it.kind] ?? Infinity)) return false; taken.set(it.kind, n + 1); return true; });
  const chosen = new Set<EdgeItem>(eligible.slice(0, cap));
  const perKind = new Map<EdgeKind, number>();
  for (const it of eligible) { const n = perKind.get(it.kind) ?? 0; if (n < floor) { perKind.set(it.kind, n + 1); chosen.add(it); } }
  const count = new Map<EdgeKind, number>();
  for (const it of chosen) count.set(it.kind, (count.get(it.kind) ?? 0) + 1);
  const out = [...chosen].sort(byScore);
  for (let i = out.length - 1; i >= 0 && out.length > cap; i--) {
    const k = out[i].kind;
    if ((count.get(k) ?? 0) > floor) { count.set(k, count.get(k)! - 1); out.splice(i, 1); }
  }
  return out;
}

/** Every deduplicated item, memoised per process (the page and the feed files read the same snapshots). */
const memo = new Map<string, EdgeItem[]>();
export function edgeAll(root = process.cwd(), today = todayIso()): EdgeItem[] {
  const key = `${root}|${today}`;
  if (!memo.has(key)) memo.set(key, edgeItems(root, today));
  return memo.get(key)!;
}

/** The ranked feed as the page and the feed files use it: `cap` items. */
export function edgeFeed(cap = EDGE_FEED_CAP, root = process.cwd(), today = todayIso()): EdgeItem[] {
  return rankEdge(edgeAll(root, today), { cap, today });
}

/** Items grouped for display: by day, month, or year for year- and quarter-dated items; newest group first, best score first within a group. */
export function groupEdge(items: EdgeItem[]): Array<{ key: string; label: string; items: EdgeItem[] }> {
  const groups = new Map<string, EdgeItem[]>();
  for (const it of items) { const k = edgeGroupKey(it); if (!groups.has(k)) groups.set(k, []); groups.get(k)!.push(it); }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])).map(([key, xs]) => ({ key, label: edgeGroupLabel(key), items: xs.sort(byScore) }));
}

/** Items dated to a day within the last seven days (today included), counted by kind. Coarser dates are not counted. */
export function edgeWeekCounts(items: EdgeItem[], today = todayIso()): Partial<Record<EdgeKind, number>> {
  const from = new Date(Date.parse(`${today}T00:00:00Z`) - 6 * DAY).toISOString().slice(0, 10);
  const out: Partial<Record<EdgeKind, number>> = {};
  for (const it of items) if (it.precision === "day" && it.date >= from && it.date <= today) out[it.kind] = (out[it.kind] ?? 0) + 1;
  return out;
}

/** Sources footer rows, in kind order. */
export const EDGE_SOURCES = (Object.keys(EDGE_KIND_META) as EdgeKind[]).map((k) => ({ kind: k, ...EDGE_KIND_META[k] }));

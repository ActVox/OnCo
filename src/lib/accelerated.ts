/**
 * The accelerated-approval pathway as data rather than prose.
 *
 * The FDA grants an accelerated approval on a surrogate endpoint and requires a confirmatory trial. Three things can
 * then happen to that indication: it converts to traditional approval, it is withdrawn, or it stays open. The agency
 * publishes the four lists separately (verified, withdrawn, ongoing, and a fourth for supportive-care, dosing and
 * formulation approvals that are not cancer treatment indications), so the shape of the pathway is not visible from
 * any one page and no rate is published at all.
 *
 * scripts/fetch-accelerated.ts reads the four tables and writes src/data/accelerated-approvals.ts; src/data/index.ts
 * turns every row into typed `regulatoryEvents` on the product it names, so a grant, its conversion and its
 * withdrawal are dated facts on the record and not a sentence on one country page. This file holds the types, the
 * arithmetic over the rows and nothing else, so the United States page and the timeline compute the same numbers
 * from the same source.
 *
 * What the arithmetic is: each row carries the FDA's own two dates, so the interval is theirs and the median is
 * ours. An open row is measured from its grant to the day the table was read, which is a censored figure and is
 * labelled as one: those indications will only get longer, never shorter.
 */

/** Which of the FDA's four tables a row came from. */
export type AcceleratedTableId = "verified" | "withdrawn" | "ongoing" | "other";

/** What became of one accelerated approval. `open` means the confirmatory requirement is unresolved on the day the table was read. */
export type AcceleratedOutcome = "converted" | "withdrawn" | "open";

/** One accelerated-approval indication, as the FDA's table states it. Dates are ISO; `outcomeDate` is empty only when `outcome` is "open". */
export type AcceleratedRow = {
  /** Corpus product id, when the drug name matched a record; absent on a row that matches nothing in OnCo. */
  drugId?: string;
  /** The FDA's drug-name cell, e.g. "Breyanzi (lisocabtagene maraleucel)". */
  drugName: string;
  /** The generic name parsed out of the brackets, which is what the name match ran on. */
  generic?: string;
  indication: string;
  granted: string;
  outcome: AcceleratedOutcome;
  outcomeDate?: string;
  table: AcceleratedTableId;
  /** The FDA announcement the indication cell links to, where it links to one. */
  announcement?: string;
};

/** One of the four tables, with the date the agency says its content is current to. */
export type AcceleratedTable = { id: AcceleratedTableId; label: string; url: string; count: number; current: string };

const DAYS_A_YEAR = 365.25;

/** Whole days between two ISO dates. */
export const daysBetween = (from: string, to: string): number => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/** Years between two ISO dates, to one decimal place. */
export const yearsBetween = (from: string, to: string): number => daysBetween(from, to) / DAYS_A_YEAR;

/** Median of a list, or undefined when it is empty. */
export function median(xs: readonly number[]): number | undefined {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
}

/** Nearest-rank quantile, the same definition src/lib/timeline.ts uses, so two pages never disagree by a rounding rule. */
export function quantile(xs: readonly number[], q: number): number | undefined {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))];
}

/**
 * The interval a row measures, in years: grant to outcome for a closed row, grant to `readOn` for an open one. An
 * open row's figure is censored, which is why `summarise` keeps the two apart.
 */
export function intervalYears(row: AcceleratedRow, readOn: string): number {
  return yearsBetween(row.granted, row.outcomeDate ?? readOn);
}

export type AcceleratedSummary = {
  n: number;
  median?: number;
  p25?: number;
  p75?: number;
  min?: number;
  max?: number;
};

/** Count, median and quartiles of the intervals in a set of rows. */
export function summarise(rows: readonly AcceleratedRow[], readOn: string): AcceleratedSummary {
  const xs = rows.map((r) => intervalYears(r, readOn));
  return { n: xs.length, median: median(xs), p25: quantile(xs, 0.25), p75: quantile(xs, 0.75), min: xs.length ? Math.min(...xs) : undefined, max: xs.length ? Math.max(...xs) : undefined };
}

/** "2026-09-17" as "17 September 2026". */
export const longDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1)).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

/** "3.3 years (1.9 to 5.2)", or "no cases". */
export function summaryLine(s: AcceleratedSummary): string {
  if (!s.n || s.median === undefined) return "no cases";
  return `${s.median.toFixed(1)} years (${(s.p25 ?? 0).toFixed(1)} to ${(s.p75 ?? 0).toFixed(1)})`;
}

/** A regulatory event in the shape the drug schema takes, written structurally so this file does not depend on the schema. */
export type RegulatoryEventLike = { date: string; type: string; region: string; note: string; source?: string; indication?: string };

const years1 = (n: number) => `${n.toFixed(1)} ${n >= 0.95 && n < 1.05 ? "year" : "years"}`;

/** The note a newly written grant carries; an upgraded one keeps the editor's words and gains only the open clock. */
const grantNote = (r: AcceleratedRow, readOn: string) =>
  r.outcome === "open"
    ? `Accelerated approval on a surrogate endpoint; the confirmatory requirement was still open ${years1(yearsBetween(r.granted, readOn))} later, when the FDA's table was read.`
    : "Accelerated approval on a surrogate endpoint, with a confirmatory trial required.";

const closeNote = (r: AcceleratedRow) => {
  const gap = years1(yearsBetween(r.granted, r.outcomeDate!));
  return r.outcome === "converted"
    ? `Confirmed: the accelerated approval of ${r.granted.slice(0, 4)} converted to traditional approval ${gap} after it was granted.`
    : `Withdrawn: the indication came off the label ${gap} after its accelerated approval.`;
};

/**
 * A product's regulatory events with its accelerated-approval rows folded in.
 *
 * Most of these dates are already on the record as a plain "approval" or "withdrawal", written by an editor or
 * pulled from the FDA's approval notifications. Adding a second event on the same day would say the same thing
 * twice, and dropping the row would lose what the tables know, so a matching event is upgraded in place: it keeps
 * the editor's note and its source, and gains the precise type and the indication that pairs it with its outcome.
 * A date the record does not have becomes a new event. Each existing event can be claimed once, because a product
 * can hold two accelerated approvals granted on the same day for different indications, and both are real.
 */
export function mergeAcceleratedEvents(existing: readonly RegulatoryEventLike[], rows: readonly AcceleratedRow[], readOn: string): RegulatoryEventLike[] {
  const out: RegulatoryEventLike[] = existing.map((e) => ({ ...e }));
  const claimed = new Set<number>();
  const claim = (date: string, types: readonly string[]): number => {
    const i = out.findIndex((e, idx) => !claimed.has(idx) && e.date === date && types.includes(e.type));
    if (i >= 0) claimed.add(i);
    return i;
  };
  /** An event this merge wrote is claimed at once, so a second row on the same date adds its own rather than overwriting it. */
  const push = (e: RegulatoryEventLike) => { claimed.add(out.length); out.push(e); };
  const open = (r: AcceleratedRow) => (r.outcome === "open" ? ` The confirmatory requirement was still open ${years1(yearsBetween(r.granted, readOn))} later, when the FDA's table was read.` : "");
  // Grants first, so a closing event never claims the event a grant needs.
  for (const r of rows) {
    const i = claim(r.granted, ["accelerated-approval", "approval"]);
    if (i >= 0) out[i] = { ...out[i], type: "accelerated-approval", indication: r.indication, note: `${out[i].note}${open(r)}`.trim() };
    else push({ date: r.granted, type: "accelerated-approval", region: "US", note: grantNote(r, readOn), indication: r.indication, ...(r.announcement ? { source: r.announcement } : {}) });
  }
  for (const r of rows) {
    if (r.outcome === "open" || !r.outcomeDate) continue;
    const type = r.outcome === "converted" ? "conversion" : "withdrawal";
    const i = claim(r.outcomeDate, [type, r.outcome === "converted" ? "approval" : "withdrawal"]);
    if (i >= 0) out[i] = { ...out[i], type, indication: r.indication };
    else push({ date: r.outcomeDate, type, region: "US", note: closeNote(r), indication: r.indication, ...(r.announcement ? { source: r.announcement } : {}) });
  }
  // Chronological, so a new event lands where it belongs rather than at the end of a hand-written list.
  return out.sort((a, b) => sortKey(a.date).localeCompare(sortKey(b.date)));
}

/** Sort key for the loose dates regulatory events carry: 2026, 2026-03, 2026-Q2, 2026-03-09. */
function sortKey(d: string): string {
  const q = /^(\d{4})-Q([1-4])$/.exec(d);
  if (q) return `${q[1]}-${String((Number(q[2]) - 1) * 3 + 2).padStart(2, "0")}-15`;
  if (/^\d{4}$/.test(d)) return `${d}-06-30`;
  if (/^\d{4}-\d{2}$/.test(d)) return `${d}-15`;
  return d;
}

/**
 * The conversion rate over the resolved indications only: converted / (converted + withdrawn). Open indications are
 * excluded because they are not yet an outcome, and a rate that counted them as failures would fall every time the
 * agency granted a new one.
 */
export function conversionRate(rows: readonly AcceleratedRow[]): { converted: number; withdrawn: number; open: number; resolved: number; pct?: number } {
  const converted = rows.filter((r) => r.outcome === "converted").length;
  const withdrawn = rows.filter((r) => r.outcome === "withdrawn").length;
  const open = rows.filter((r) => r.outcome === "open").length;
  const resolved = converted + withdrawn;
  return { converted, withdrawn, open, resolved, pct: resolved ? (converted / resolved) * 100 : undefined };
}

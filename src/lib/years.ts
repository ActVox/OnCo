/**
 * Every dated fact the corpus holds, gathered into one shape and sorted into years.
 *
 * The corpus dates things in a dozen different fields: the `history` entries editors write on cancer records, the
 * `approvals` and `regulatoryEvents` on treatments, `yearReported` on trials, `year` on key papers, `since` on
 * technologies, `founded` on companies and journals, `funding` rounds, the dated NCCN and ESMO versions, the law
 * index, the roadmap watch items and the readout calendar. This module reads all of them, records how precisely each one is
 * known (a day, a month, a quarter or a year), and hands the result to src/data/years.ts, which turns each year
 * into a record of kind `year`. Nothing here invents a date or a fact: every event carries the id of the record it
 * was read from, and a test walks them all back to make sure they resolve.
 *
 * Pure, and it imports no data file: the caller passes the records and the side tables in. That is what lets a year
 * record be generated from `ALL_INPUTS` inside src/data/index.ts without a cycle.
 */
import type { EntityInput, YearEvent } from "./schema";
import { precisionOf, type YearEventGroup } from "./year-groups";

/** The side tables that carry dates but are not entity records. Passed in so this module imports no data. */
export type YearSideData = {
  guidelineVersions: ReadonlyArray<{ id: string; cancerId: string; body: string; version: string; date: string; anchor: string; changes: ReadonlyArray<{ kind: string; setting: string; text: string; refs: readonly string[] }> }>;
  calendar: ReadonlyArray<{ date: string; title: string; kind: string; refs: readonly string[]; note: string; confidence: string }>;
  catalysts: ReadonlyArray<{ id: string; date: string; kind: string; title: string; companies: readonly string[]; drugs: readonly string[]; refs: readonly string[]; confidence: string; note: string }>;
  registryStatus: Readonly<Record<string, { primaryCompletion?: string; primaryCompletionType?: string }>>;
  /** The law index: statutes, regulations, guidance and court rulings, each a glossary record dated to the year the instrument was made. `jurisdiction` is the readable name, not the code. */
  law: ReadonlyArray<{ id: string; jurisdiction: string; year: number; instrument: string }>;
};

/** The id and route slug of a year record. Years are their own id, so /years/1971/ is the address. */
export const yearId = (year: number): string => String(year);

/** The first year the corpus holds a record for every year without a gap. Before this, only the years with something in them. */
export const CONTINUOUS_FROM = 1900;

const trim = (s: string, max = 180): string => {
  const t = s.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = cut.lastIndexOf(". ");
  return stop > max / 2 ? cut.slice(0, stop + 1) : `${cut.replace(/[\s,;:.]+$/, "")}...`;
};
const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** A four-digit year from a date string of any of the shapes the corpus uses, or null when there is none. */
export function yearOf(date: string): number | null {
  const m = /^(\d{4})/.exec(date.trim());
  if (!m) return null;
  const y = Number(m[1]);
  return y >= 1500 && y <= 2100 ? y : null;
}

/**
 * A date string in the canonical shape (YYYY, YYYY-MM, YYYY-Qn, YYYY-MM-DD), or null when it cannot be read.
 * The corpus writes quarters both ways round ("2027-Q2" on a catalyst, "Q2 2027" in a watch item) and halves as
 * "H1 2027"; a half is recorded as its first quarter, which is the most the source supports.
 */
export function canonicalDate(raw: string): string | null {
  const s = raw.trim();
  if (/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/.test(s)) return yearOf(s) ? s : null;
  const forward = /^(\d{4})[- ]?Q([1-4])$/i.exec(s);
  if (forward) return yearOf(forward[1]) ? `${forward[1]}-Q${forward[2]}` : null;
  const backward = /^Q([1-4])[ ](\d{4})$/i.exec(s);
  if (backward) return yearOf(backward[2]) ? `${backward[2]}-Q${backward[1]}` : null;
  const half = /^H([12])[ ](\d{4})$/i.exec(s);
  if (half) return yearOf(half[2]) ? `${half[2]}-Q${half[1] === "1" ? "1" : "3"}` : null;
  return null;
}

const REG_LABEL: Record<string, string> = {
  designation: "designation", filing: "filing", pdufa: "decision date set", approval: "approval",
  "accelerated-approval": "accelerated approval", conversion: "accelerated approval confirmed",
  crl: "complete response letter", withdrawal: "withdrawal", "label-change": "label change", "advisory-committee": "advisory committee",
};

/**
 * Every dated fact in the corpus, as year events. `inputs` is the record list before validation (src/data/index.ts
 * ALL_INPUTS), so array fields may be missing and are read defensively.
 */
export function yearEvents(inputs: readonly EntityInput[], side: YearSideData): DatedEvent[] {
  const known = new Set(inputs.map((e) => e.id));
  const nameOf = new Map(inputs.map((e) => [e.id, e.name]));
  const out: DatedEvent[] = [];
  const add = (group: YearEventGroup, rawDate: string, title: string, from: string | undefined, refs: readonly string[] = [], note?: string) => {
    const date = canonicalDate(rawDate);
    const year = date ? yearOf(date) : null;
    if (!date || year === null || !title.trim()) return;
    const seen = new Set<string>();
    const clean = refs.filter((r) => known.has(r) && r !== from && !seen.has(r) && (seen.add(r), true)).slice(0, 4);
    out.push({ group, date, precision: precisionOf(date), title: trim(title, 160), ...(note ? { note: trim(note) } : {}), ...(from && known.has(from) ? { from } : {}), refs: clean, year });
  };

  for (const e of inputs) {
    switch (e.kind) {
      case "cancer": {
        for (const h of e.history ?? []) add("history", String(h.year), h.title, e.id, h.refs ?? [], h.note ? `${e.name}. ${h.note}` : e.name);
        break;
      }
      case "technology": {
        if (e.since !== undefined) add("technology", String(e.since), e.name, e.id, [], "First use in humans or first approval, as the technology record states it.");
        break;
      }
      case "drug": {
        for (const a of e.approvals ?? []) add("approval", String(a.year), `${e.name} approved in ${a.region}`, e.id, [], a.note ? `${a.indication}. ${a.note}` : a.indication);
        // The indication leads the note, ahead of the wording of the decision: a product can carry two accelerated
        // approvals granted on the same day, and the indication is the only thing that tells the two lines apart.
        // It goes first because a note is trimmed from the end.
        for (const r of e.regulatoryEvents ?? []) add("regulatory", r.date, `${e.name}: ${REG_LABEL[r.type] ?? r.type} (${r.region})`, e.id, [], r.indication ? `${r.indication.replace(/\.$/, "")}. ${r.note}` : r.note);
        break;
      }
      case "trial": {
        // The registry id stands in for a result the corpus does not hold, and tells two ingested trials apart when
        // their registry titles run to the same words for longer than a line can show.
        if (e.yearReported !== undefined) add("trial", String(e.yearReported), `${e.name} reported`, e.id, [...(e.cancers ?? []), ...(e.drugs ?? [])].slice(0, 6), e.result ?? (e.nct ? `Registry record ${e.nct}; no result is recorded here.` : undefined));
        break;
      }
      case "paper": {
        add("paper", String(e.year), e.name, e.id, [], `${e.authors.replace(/[.,;\s]+$/, "")}. ${e.journal.replace(/\.$/, "")}.`);
        break;
      }
      case "person": {
        // The person whose page lists the paper is the line's `from`, so the title links there; where several people
        // list the same paper the others join it as references (see dedupe).
        for (const p of e.papers ?? []) if (p.year) add("person-paper", String(p.year), p.title, e.id, [], p.journal);
        break;
      }
      case "company": {
        if (e.founded !== undefined) add("company", String(e.founded), `${e.name} founded`, e.id, [], e.hq);
        for (const f of e.funding ?? []) add("funding", String(f.year), `${e.name}: ${f.round}`, e.id, [], f.amountUsd ? `${usd(f.amountUsd)}${f.note ? `. ${f.note}` : ""}` : f.note);
        break;
      }
      case "journal": {
        if (e.founded !== undefined) add("journal", String(e.founded), `${e.name} founded`, e.id, [], e.publisher);
        break;
      }
      case "roadmap": {
        for (const w of e.watch ?? []) if (w.expected) add("expected", w.expected, w.item, e.id, w.refs ?? [], `Watch item on the ${e.name}.`);
        break;
      }
    }
  }

  for (const v of side.guidelineVersions) {
    const refs = [v.cancerId, ...v.changes.flatMap((c) => c.refs)];
    const counts = tally(v.changes.map((c) => c.kind));
    add("guideline", v.date, `${v.body} ${v.version} for ${nameOf.get(v.cancerId) ?? v.cancerId}`, v.cancerId, refs, `${counts}. Anchored to ${v.anchor}.`);
  }
  for (const c of side.calendar) add("expected", c.date, c.title, c.refs[0], c.refs, `${c.confidence === "confirmed" ? "Confirmed date" : "Expected date"}. ${c.note}`);
  for (const c of side.catalysts) add("expected", c.date, c.title, c.drugs[0] ?? c.companies[0], [...c.companies, ...c.drugs, ...c.refs], `${c.confidence === "confirmed" ? "Confirmed date" : "Expected date"}. ${c.note}`);
  for (const l of side.law) {
    const name = nameOf.get(l.id);
    if (name) add("law", String(l.year), name, l.id, [], `${l.jurisdiction}, ${l.instrument}.`);
  }
  for (const [id, s] of Object.entries(side.registryStatus)) {
    if (!s.primaryCompletion) continue;
    const actual = s.primaryCompletionType === "ACTUAL";
    add("expected", s.primaryCompletion, `${nameOf.get(id) ?? id}: primary completion`, id, [], `${actual ? "Actual" : "Estimated"} primary completion date on ClinicalTrials.gov.`);
  }

  return dedupe(out);
}

const usd = (n: number): string => (n >= 1e9 ? `$${(n / 1e9).toFixed(1)}bn` : n >= 1e6 ? `$${Math.round(n / 1e6)}m` : `$${Math.round(n / 1e3)}k`);

const tally = (kinds: readonly string[]): string => {
  const m = new Map<string, number>();
  for (const k of kinds) m.set(k, (m.get(k) ?? 0) + 1);
  return [...m.entries()].map(([k, n]) => `${n} row${n === 1 ? "" : "s"} ${k}`).join(", ") || "no rows recorded";
};

/**
 * One fact, once. A paper listed on three people's pages is one event with three people on it, and a paper listed on
 * a person's page that also has a record of its own is the record, because the record is the fuller entry.
 */
function dedupe(events: DatedEvent[]): DatedEvent[] {
  const papers = new Set(events.filter((e) => e.group === "paper").map((e) => `${e.year}|${norm(e.title)}`));
  const byKey = new Map<string, DatedEvent>();
  const out: DatedEvent[] = [];
  for (const e of events) {
    if (e.group === "person-paper") {
      const key = `${e.year}|${norm(e.title)}`;
      if (papers.has(key)) continue;
      const seen = byKey.get(key);
      if (seen) {
        if (e.from && e.from !== seen.from && !seen.refs.includes(e.from) && seen.refs.length < 4) seen.refs = [...seen.refs, e.from];
        continue;
      }
      byKey.set(key, e);
    }
    out.push(e);
  }
  return out;
}

/** A year event with the year it falls in, which the record itself carries once rather than on every line. */
export type DatedEvent = YearEvent & { year: number };

/** The event as it is stored on a year record: the same fact without the year, which the record already states. */
export const withoutYear = (e: DatedEvent): YearEvent => ({
  group: e.group, date: e.date, precision: e.precision, title: e.title,
  ...(e.note ? { note: e.note } : {}), ...(e.from ? { from: e.from } : {}), refs: e.refs,
});

/** Events by year, each year's list sorted by date, then by group order, then by title. */
export function byYear(events: readonly DatedEvent[]): Map<number, DatedEvent[]> {
  const out = new Map<number, DatedEvent[]>();
  for (const e of events) out.set(e.year, [...(out.get(e.year) ?? []), e]);
  for (const list of out.values()) list.sort((a, b) => a.date.localeCompare(b.date) || a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
  return out;
}

/** How many events of each group a list holds, largest first. */
export function groupCounts(events: readonly YearEvent[]): Array<[YearEventGroup, number]> {
  const m = new Map<YearEventGroup, number>();
  for (const e of events) m.set(e.group, (m.get(e.group) ?? 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** How many events are known to the day, the month, the quarter and the year. */
export function precisionCounts(events: readonly YearEvent[]): { day: number; month: number; quarter: number; year: number } {
  const out = { day: 0, month: 0, quarter: 0, year: 0 };
  for (const e of events) out[e.precision] += 1;
  return out;
}

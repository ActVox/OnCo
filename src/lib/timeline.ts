/**
 * What the timeline shows once every dated fact is in one shape: the per-year series behind the chart at
 * /timeline/, and the questions the data can and cannot answer.
 *
 * Rules this file keeps, because a timeline is the easiest place in a corpus to say something that sounds true:
 *  - every finding carries its denominator, and the denominator is the number of records the figure was computed
 *    over, not the size of the corpus;
 *  - a finding with fewer than MIN_N cases is marked unsupported and says so on the page, with its figures still
 *    shown so a reader can see how thin it is;
 *  - every finding carries a caveat naming what the figure measures about OnCo rather than about oncology. Most of
 *    these intervals are partly a measure of what has been read into the corpus, and that has to be said next to
 *    the number rather than in a footnote.
 */
import type { Graph } from "./graph";
import type { Drug, Entity, Trial, Year } from "./schema";
import { YEAR_EVENT_GROUPS, type YearEventGroup } from "./year-groups";
import { yearsBetween } from "./accelerated";
import { startYear } from "./trial-starts";
import { guidelineVersions } from "@/data/guideline-versions";
import { ACCELERATED_READ_ON, ACCELERATED_TABLES, ACCELERATED_UNMATCHED } from "@/data/accelerated-approvals";

/** Below this many cases a finding is shown but marked as not supported by the corpus. */
export const MIN_N = 30;

export type Finding = {
  id: string;
  /** The question, in the form it was asked. */
  question: string;
  /** The headline figure, short enough to sit on a tile. */
  figure: string;
  /** The answer in a sentence or two, with the figure in it. */
  answer: string;
  /** What the figure was computed over: "79 of the 1,674 targets", never "the corpus". */
  denominator: string;
  /** False when the count is below MIN_N or the shape of the data contradicts the question. */
  supported: boolean;
  /** What the number measures about the corpus rather than about oncology. */
  caveat: string;
  /** The working, where a breakdown makes the answer checkable. */
  rows?: Array<{ label: string; value: string }>;
};

const num = (n: number) => n.toLocaleString("en-GB");
const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
const quantile = (xs: readonly number[], q: number): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor(q * (s.length - 1))))];
};
const years = (n: number) => `${n} ${Math.abs(n) === 1 ? "year" : "years"}`;
/** For intervals the sources date to the day: "3.3 years", never rounded to a whole year it was not. */
const yearsOneDp = (n: number) => `${n.toFixed(1)} ${n >= 0.95 && n < 1.05 ? "year" : "years"}`;

const isDrug = (e: Entity | undefined): e is Drug => e?.kind === "drug";
const isTrial = (e: Entity | undefined): e is Trial => e?.kind === "trial";

/** Every year record, oldest first. */
export const yearRecordsOf = (g: Graph): Year[] => [...g.kind("year")].sort((a, b) => a.year - b.year);

/** One column of the chart: a year, its total, and its total per group. */
export type YearColumn = { year: number; total: number; byGroup: Record<YearEventGroup, number> };

export function series(g: Graph): YearColumn[] {
  return yearRecordsOf(g).map((y) => {
    const byGroup = Object.fromEntries(YEAR_EVENT_GROUPS.map((k) => [k, 0])) as Record<YearEventGroup, number>;
    for (const e of y.events) byGroup[e.group] += 1;
    return { year: y.year, total: y.events.length, byGroup };
  });
}

/** The four bands the chart stacks, so a column reads at a glance rather than as one sliver per group. */
export const BANDS: ReadonlyArray<{ id: string; label: string; groups: readonly YearEventGroup[]; className: string }> = [
  { id: "decisions", label: "Approvals, regulatory decisions, guidelines and law", groups: ["approval", "regulatory", "guideline", "law"], className: "fill-emerald-500" },
  { id: "evidence", label: "Trials reported", groups: ["trial"], className: "fill-indigo-500" },
  { id: "literature", label: "Papers", groups: ["paper", "person-paper"], className: "fill-sky-400" },
  { id: "rest", label: "Landmarks, technologies, companies and expected dates", groups: ["history", "technology", "company", "funding", "journal", "expected"], className: "fill-stone-400" },
];

export const bandValue = (c: YearColumn, band: (typeof BANDS)[number]): number => band.groups.reduce((s, k) => s + c.byGroup[k], 0);

/* ------------------------------------------------------------------------------------------------------------ */

/** One accelerated-approval indication as the graph now carries it: the grant, and what closed it, if anything. */
type AcceleratedPair = { id: string; name: string; indication: string; granted: string; outcome: "conversion" | "withdrawal" | "open"; closed?: string; gap: number };

/**
 * Every accelerated-approval indication in the graph, paired with the event that closed it.
 *
 * A grant is an "accelerated-approval" regulatory event; the conversion or withdrawal that closed it is an event of
 * that type on the same product carrying the same `indication` text, which is how the pair is found. An indication
 * with no closing event is open, and its clock is measured to the day the agency's tables were last read rather
 * than to today, because that is the last day the corpus knows it was still open.
 */
function acceleratedPairs(g: Graph): AcceleratedPair[] {
  const out: AcceleratedPair[] = [];
  for (const d of g.kind("drug")) {
    for (const ev of d.regulatoryEvents) {
      if (ev.type !== "accelerated-approval" || !ev.indication) continue;
      const close = d.regulatoryEvents.find((x) => (x.type === "conversion" || x.type === "withdrawal") && x.indication === ev.indication && x.date >= ev.date);
      out.push({
        id: d.id, name: d.name, indication: ev.indication, granted: ev.date,
        outcome: close ? (close.type as "conversion" | "withdrawal") : "open",
        ...(close ? { closed: close.date } : {}),
        gap: yearsBetween(ev.date, close?.date ?? ACCELERATED_READ_ON),
      });
    }
  }
  return out;
}

/** Earliest approval year across a set of products. */
const firstApprovalYear = (ds: readonly Drug[]): number | null => {
  const ys = ds.flatMap((d) => d.approvals.map((a) => a.year));
  return ys.length ? Math.min(...ys) : null;
};

/** Products tied to a target, by the target's own `drugs` array or by a product naming it. */
const drugsOf = (g: Graph, e: Entity): Drug[] => [...(g.incoming(e.id).get("drug") ?? []), ...e.drugs.map((id) => g.get(id))].filter(isDrug);

export function findings(g: Graph): Finding[] {
  const out: Finding[] = [];
  const drugs = g.kind("drug"), trials = g.kind("trial"), targets = g.kind("target"), companies = g.kind("company");

  /* 1. Target to drug ------------------------------------------------------------------------------------- */
  // The interval runs from the target's `firstDescribed` year, which is sourced on the record (the earliest sequence
  // paper UniProt cites for the protein), to the first approval of any product aimed at it. The earlier version of
  // this finding used the earliest paper the corpus holds and had to report itself unanswerable, because a target's
  // papers here are its clinical literature; the field exists so that mistake is not made again.
  const described = targets.filter((t) => t.firstDescribed !== undefined);
  const pairs: Array<{ id: string; described: number; approval: number }> = [];
  for (const t of described) {
    const approval = firstApprovalYear(drugsOf(g, t));
    if (approval !== null) pairs.push({ id: t.id, described: t.firstDescribed!, approval });
  }
  const forward = pairs.filter((p) => p.approval >= p.described);
  const backward = pairs.length - forward.length;
  const gaps = forward.map((p) => p.approval - p.described);
  const nineties = described.filter((t) => t.firstDescribed! >= 1990 && t.firstDescribed! < 2000).length;
  out.push({
    id: "target-to-drug",
    question: "How long from the first description of a target to the first approved drug against it, and is that interval shortening?",
    figure: years(median(gaps)),
    answer: `It is lengthening, not shortening, and part of that is arithmetic. The median is ${years(median(gaps))} across ${forward.length} targets whose first approval came after the protein was described, and it rises steadily with the decade of approval: ${intervalLine(forward.filter((p) => p.approval >= 2000 && p.approval < 2010).map((p) => p.approval - p.described))} for approvals in the 2000s, ${intervalLine(forward.filter((p) => p.approval >= 2010 && p.approval < 2020).map((p) => p.approval - p.described))} in the 2010s and ${intervalLine(forward.filter((p) => p.approval >= 2020).map((p) => p.approval - p.described))} in the 2020s. On ${backward} more targets the drug came first, by as much as ${years(Math.max(...pairs.filter((p) => p.approval < p.described).map((p) => p.described - p.approval), 0))}: methotrexate, mercaptopurine, the steroid receptors and the hormone therapies were in use for decades before anyone had the gene they act on.`,
    denominator: `${pairs.length} of the ${num(targets.length)} targets carry both a sourced first-description year and a product with an approval; ${num(described.length)} targets carry the year at all`,
    supported: forward.length >= MIN_N,
    caveat: `The year is the earliest paper UniProt cites for the protein's sequence, so it dates the molecule being in hand, not the biology being understood or anyone thinking of it as a target. The widening is also partly forced: an interval cannot be longer than the time since the sequence was published, and ${Math.round((nineties / described.length) * 100)} per cent of these sequences are from the 1990s, so recent approvals have more room to be slow than old ones ever had.`,
    rows: [
      { label: "Targets with a first-description year", value: `${num(described.length)} of ${num(targets.length)}` },
      { label: "Of those, with an approved product", value: num(pairs.length) },
      { label: "Drug approved before the target was described", value: `${backward} of ${pairs.length}` },
      { label: "First approval in the 2000s", value: intervalLine(forward.filter((p) => p.approval >= 2000 && p.approval < 2010).map((p) => p.approval - p.described)) },
      { label: "First approval in the 2010s", value: intervalLine(forward.filter((p) => p.approval >= 2010 && p.approval < 2020).map((p) => p.approval - p.described)) },
      { label: "First approval in the 2020s", value: intervalLine(forward.filter((p) => p.approval >= 2020).map((p) => p.approval - p.described)) },
    ],
  });

  /* 2. Trial start to readout ----------------------------------------------------------------------------- */
  // `started` is the registry's own study start date (src/lib/trial-starts.ts); `yearReported` is the year the
  // primary result was reported. Before the start date existed the corpus could not say how long any trial took.
  const started = trials.filter((t) => t.started !== undefined);
  const ran = trials.filter((t): t is Trial & { started: string; yearReported: number } => t.started !== undefined && t.yearReported !== undefined && t.yearReported >= startYear(t.started)!);
  const durations = ran.map((t) => t.yearReported - startYear(t.started)!);
  const byStart = (lo: number, hi: number) => ran.filter((t) => startYear(t.started)! >= lo && startYear(t.started)! <= hi).map((t) => t.yearReported - startYear(t.started)!);
  const phaseSet = (p: string) => ran.filter((t) => t.phase === p).map((t) => t.yearReported - startYear(t.started)!);
  const estimated = ran.filter((t) => t.startedType === "estimated").length;
  out.push({
    id: "trial-start-to-readout",
    question: "How long does a trial take, from opening to reporting its primary result?",
    figure: years(median(durations)),
    answer: `The median is ${years(median(durations))}, and the middle half runs from ${years(quantile(durations, 0.25))} to ${years(quantile(durations, 0.75))}. Phase makes almost no difference to it: ${intervalLine(phaseSet("2"))} for phase 2 and ${intervalLine(phaseSet("3"))} for phase 3. What does move is when the trial opened, and that movement is mostly an artefact: trials that opened in the 1990s took ${years(median(byStart(1990, 1999)))}, those that opened in the 2010s ${years(median(byStart(2010, 2019)))} and those that opened since 2020 ${years(median(byStart(2020, 2030)))}, because a trial that opened in 2022 can only appear here if it has already finished.`,
    denominator: `${num(ran.length)} of the ${num(trials.length)} trials carry both a registry start date and a reported year; ${num(started.length)} carry a start date at all`,
    supported: durations.length >= MIN_N,
    caveat: `This measures trials that reported, which is the whole selection problem in one sentence: a trial still running, abandoned or never published has no reported year and is absent, and the more recent the start, the more of them are missing. The start date is the registry's, the reported year is a year, so every figure is a difference of years and not of days. ${estimated === 0 ? "Every start date counted here is one the registry marks as actual or leaves unmarked; none is still a plan." : `${estimated} of these start dates are ones the registry still marks as estimated rather than actual.`}`,
    rows: [
      { label: "Opened 1990 to 1999", value: intervalLine(byStart(1990, 1999)) },
      { label: "Opened 2000 to 2009", value: intervalLine(byStart(2000, 2009)) },
      { label: "Opened 2010 to 2019", value: intervalLine(byStart(2010, 2019)) },
      { label: "Opened 2020 onwards", value: intervalLine(byStart(2020, 2030)) },
      { label: "Phase 1 and phase 1/2", value: intervalLine([...phaseSet("1"), ...phaseSet("1/2")]) },
      { label: "Phase 3", value: intervalLine(phaseSet("3")) },
    ],
  });

  /* 3. Trial readout to approval -------------------------------------------------------------------------- */
  const dated = trials.filter((t): t is Trial & { yearReported: number } => t.yearReported !== undefined);
  const readoutGaps: Array<{ gap: number; year: number }> = [];
  for (const t of dated) {
    const ys = t.drugs.map((id) => g.get(id)).filter(isDrug).flatMap((d) => d.approvals.map((a) => a.year)).filter((y) => y >= t.yearReported);
    if (ys.length) readoutGaps.push({ gap: Math.min(...ys) - t.yearReported, year: t.yearReported });
  }
  const within = readoutGaps.filter((x) => x.gap <= 1).length;
  out.push({
    id: "readout-to-approval",
    question: "How long from a trial reporting to an approval of the product it tested?",
    figure: `${years(median(readoutGaps.map((x) => x.gap)))}`,
    answer: `The median is ${years(median(readoutGaps.map((x) => x.gap)))}, and ${Math.round((within / readoutGaps.length) * 100)} per cent of these readouts have an approval in the same year or the next one. A registrational readout and the decision that follows it are two steps of one process rather than two separate events, and in a corpus that records years rather than days they usually land on the same one.`,
    denominator: `${num(readoutGaps.length)} of the ${num(dated.length)} trials with a reported year have a product approved in or after that year`,
    supported: readoutGaps.length >= MIN_N,
    caveat: "This is a measure of which trials the corpus reads. OnCo holds landmark and registrational trials, so the trials with an approval behind them are over-represented and the trials that reported and led nowhere are under-represented. The figure is the interval for trials that did lead somewhere, not the chance that a readout leads anywhere.",
    rows: [
      { label: "Readout 1990 to 2004", value: intervalLine(readoutGaps.filter((x) => x.year <= 2004).map((x) => x.gap)) },
      { label: "Readout 2005 to 2014", value: intervalLine(readoutGaps.filter((x) => x.year >= 2005 && x.year <= 2014).map((x) => x.gap)) },
      { label: "Readout 2015 onwards", value: intervalLine(readoutGaps.filter((x) => x.year >= 2015).map((x) => x.gap)) },
    ],
  });

  /* 4. Trial readout to guideline change ------------------------------------------------------------------ */
  const gl: Array<{ year: number; gap: number }> = [];
  let glNoTrial = 0;
  for (const v of guidelineVersions) {
    const ts = v.changes.flatMap((c) => c.refs).map((id) => g.get(id)).filter(isTrial).filter((t) => t.yearReported !== undefined);
    if (!ts.length) { glNoTrial += 1; continue; }
    const y = Number(v.date.slice(0, 4));
    gl.push({ year: y, gap: y - Math.max(...ts.map((t) => t.yearReported!)) });
  }
  const early = gl.filter((x) => x.year <= 2019).map((x) => x.gap), late = gl.filter((x) => x.year >= 2020).map((x) => x.gap);
  out.push({
    id: "readout-to-guideline",
    question: "Has the gap between a trial reporting and a guideline changing moved?",
    figure: years(median(gl.map((x) => x.gap))),
    answer: `It has not moved in the period the corpus covers. The median gap between the latest trial behind a guideline version and the version's own date is ${years(median(gl.map((x) => x.gap)))} across all ${gl.length} versions, ${years(median(early))} for versions dated 2019 or earlier (${early.length} versions) and ${years(median(late))} for 2020 onwards (${late.length} versions). The earlier group is too small on its own to carry a trend.`,
    denominator: `${gl.length} of the ${guidelineVersions.length} dated NCCN and ESMO versions in the corpus name at least one trial with a reported year; ${glNoTrial} name none`,
    supported: gl.length >= MIN_N,
    caveat: "The guideline history is curated by anchoring each version to the dated event behind it, usually an approval or a publication. That rule pulls the two dates together by construction, so this measures how the corpus records guideline changes at least as much as how fast guidelines move.",
    rows: [
      { label: "Versions dated 2013 to 2019", value: intervalLine(early) },
      { label: "Versions dated 2020 onwards", value: intervalLine(late) },
      { label: "Versions whose trial reported after the version date", value: `${gl.filter((x) => x.gap < 0).length} of ${gl.length}` },
    ],
  });

  /* 5. US to EU ------------------------------------------------------------------------------------------- */
  const euLag: number[] = [];
  for (const d of drugs) {
    const us = d.approvals.filter((a) => /^(US|United States|FDA)$/i.test(a.region)).map((a) => a.year);
    const eu = d.approvals.filter((a) => /^(EU|EU\/EMA|Europe|EMA)$/i.test(a.region)).map((a) => a.year);
    if (us.length && eu.length) euLag.push(Math.min(...eu) - Math.min(...us));
  }
  out.push({
    id: "us-to-eu",
    question: "How far behind the United States does the European Union approve the same product?",
    figure: years(median(euLag)),
    answer: `The median is ${years(median(euLag))}. ${euLag.filter((x) => x === 0).length} of the ${euLag.length} products carry the same year on both sides and ${euLag.filter((x) => x < 0).length} carry an earlier European year than an American one, so the two systems are closer together than the usual telling suggests.`,
    denominator: `${euLag.length} of the ${num(drugs.length)} products carry both a United States and a European Union approval year`,
    supported: euLag.length >= MIN_N,
    caveat: "Approval years here are the year of a product's first approval in each region, not of the matching indication. A product approved in America for one cancer and in Europe for another counts as a pair, which shortens the gap.",
    rows: [
      { label: "European year earlier than the American one", value: `${euLag.filter((x) => x < 0).length} of ${euLag.length}` },
      { label: "Same year", value: `${euLag.filter((x) => x === 0).length} of ${euLag.length}` },
      { label: "Quartiles of the lag", value: `${years(quantile(euLag, 0.25))} to ${years(quantile(euLag, 0.75))}` },
    ],
  });

  /* 6. Approval to England ------------------------------------------------------------------------------- */
  const niceLag: number[] = [];
  for (const d of drugs) {
    const n = d.approvals.filter((a) => /NICE/i.test(a.region)).map((a) => a.year);
    const other = d.approvals.filter((a) => !/NICE/i.test(a.region)).map((a) => a.year);
    if (n.length && other.length) niceLag.push(Math.min(...n) - Math.min(...other));
  }
  out.push({
    id: "approval-to-england",
    question: "How long from a product's first approval anywhere to its recommendation for use in England?",
    figure: years(median(niceLag)),
    answer: `The median is ${years(median(niceLag))}, over a range of ${years(Math.min(...niceLag))} to ${years(Math.max(...niceLag))}, and the middle half runs from ${years(quantile(niceLag, 0.25))} to ${years(quantile(niceLag, 0.75))}. It is the widest spread of any interval on this page: the England row is a recommendation for use in the health service rather than a licence, and it follows a licence by a year for some products and by two decades for others.`,
    denominator: `${niceLag.length} of the ${num(drugs.length)} products carry both an England (NICE) row and an approval year elsewhere`,
    supported: niceLag.length >= MIN_N,
    caveat: "NICE rows are recorded on products a deep dive has been written for, above all the cancers with a United Kingdom pathway page, so the set is not a sample of NICE's work.",
    rows: [{ label: "Quartiles", value: `${years(quantile(niceLag, 0.25))} to ${years(quantile(niceLag, 0.75))}` }],
  });

  /* 7. Accelerated approval to confirmation or withdrawal ------------------------------------------------- */
  // Read off the typed regulatory events, not off the word "accelerated" in prose: a grant is an
  // "accelerated-approval" event and the event that closed it is a "conversion" or a "withdrawal" carrying the same
  // indication text (src/lib/accelerated.ts, written from the FDA's four tables by scripts/fetch-accelerated.ts).
  const acc = acceleratedPairs(g);
  const accProducts = new Set(acc.map((a) => a.id)).size;
  const closed = acc.filter((a) => a.outcome !== "open");
  const converted = acc.filter((a) => a.outcome === "conversion");
  const pulled = acc.filter((a) => a.outcome === "withdrawal");
  const open = acc.filter((a) => a.outcome === "open");
  const rate = Math.round((converted.length / Math.max(1, closed.length)) * 100);
  const grantYears = acc.map((a) => Number(a.granted.slice(0, 4)));
  const since2020 = acc.filter((a) => Number(a.granted.slice(0, 4)) >= 2020);
  out.push({
    id: "accelerated-to-withdrawal",
    question: "How many accelerated approvals were confirmed, how many were withdrawn, and how long did each take?",
    figure: `${rate} per cent confirmed`,
    answer: `${converted.length} of the ${closed.length} resolved indications converted to traditional approval and ${pulled.length} were withdrawn, a confirmation rate of ${rate} per cent, with ${open.length} more still open. Confirmation takes a median ${yearsOneDp(median(converted.map((a) => a.gap)))} and withdrawal a median ${yearsOneDp(median(pulled.map((a) => a.gap)))}, so ${median(pulled.map((a) => a.gap)) > median(converted.map((a) => a.gap)) ? "a failure takes longer to admit than a success takes to prove" : "the two take about as long as each other"}. The open indications have been open a median ${yearsOneDp(median(open.map((a) => a.gap)))} already, and that figure only grows.`,
    denominator: `${acc.length} accelerated-approval indications on ${accProducts} products, dated ${Math.min(...grantYears)} to ${Math.max(...grantYears)}, generated from all four of the accelerated-approval tables the FDA publishes, of which ${ACCELERATED_TABLES.find((t) => t.id === "other")?.count ?? 0} are not cancer treatments (supportive care, dosing and formulation); ${ACCELERATED_UNMATCHED.length === 1 ? "one further indication on the agency's list names a product OnCo does not hold" : `${ACCELERATED_UNMATCHED.length} further indications on the agency's list name products OnCo does not hold`}`,
    supported: acc.length >= MIN_N,
    caveat: "This is the American pathway and only the American pathway: the FDA publishes the four lists, no other regulator does, and the conditional approvals of the EMA and the others are not in this count. The rate is taken over resolved indications alone, because counting the open ones as failures would make it fall every time the agency granted a new one; an open indication's clock is measured to the day the table was read, so it is a floor and not a duration.",
    rows: [
      { label: "Converted to traditional approval", value: `${converted.length}, ${intervalLineOneDp(converted.map((a) => a.gap))}` },
      { label: "Withdrawn", value: `${pulled.length}, ${intervalLineOneDp(pulled.map((a) => a.gap))}` },
      { label: "Still open when the tables were read", value: `${open.length}, open ${intervalLineOneDp(open.map((a) => a.gap))} so far` },
      { label: "Granted 2020 or later", value: `${since2020.length} of ${acc.length}, ${since2020.filter((a) => a.outcome !== "open").length} already resolved` },
      { label: "Longest run to a withdrawal", value: pulled.length ? `${[...pulled].sort((a, b) => b.gap - a.gap)[0].name}, ${yearsOneDp([...pulled].sort((a, b) => b.gap - a.gap)[0].gap)}` : "no cases" },
      { label: "Longest still open", value: open.length ? `${[...open].sort((a, b) => b.gap - a.gap)[0].name}, ${yearsOneDp([...open].sort((a, b) => b.gap - a.gap)[0].gap)}` : "no cases" },
    ],
  });

  /* 8. Company to first product --------------------------------------------------------------------------- */
  const founded = companies.filter((c) => c.founded !== undefined);
  const coGaps: number[] = [];
  for (const c of founded) {
    const ys = drugsOf(g, c).flatMap((d) => d.approvals.map((a) => a.year)).filter((y) => y >= c.founded!);
    if (ys.length) coGaps.push(Math.min(...ys) - c.founded!);
  }
  out.push({
    id: "company-to-product",
    question: "How long from a company being founded to its first approved product?",
    figure: years(median(coGaps)),
    answer: `The median is ${years(median(coGaps))}, with the middle half between ${years(quantile(coGaps, 0.25))} and ${years(quantile(coGaps, 0.75))}.`,
    denominator: `${coGaps.length} of the ${founded.length} companies with a founding year have a product with an approval dated at or after it`,
    supported: coGaps.length >= MIN_N,
    caveat: "A product is credited to every company the record links, so an acquired product counts for the acquirer too, which shortens the interval for large companies. The founding years we hold are also weighted towards companies with something to show, so the companies that never approved anything are largely absent.",
    rows: [
      { label: "First product within ten years of founding", value: `${coGaps.filter((x) => x <= 10).length} of ${coGaps.length}` },
      { label: "Longest", value: years(Math.max(...coGaps)) },
    ],
  });

  /* 9. Which decades the corpus knows least, and whether that is history or us ----------------------------- */
  const cols = series(g);
  const decade = (d: number) => cols.filter((c) => Math.floor(c.year / 10) * 10 === d);
  const totalIn = (d: number) => decade(d).reduce((s, c) => s + c.total, 0);
  const groupIn = (d: number, k: YearEventGroup) => decade(d).reduce((s, c) => s + c.byGroup[k], 0);
  const all = cols.reduce((s, c) => s + c.total, 0);
  const before2000 = cols.filter((c) => c.year < 2000).reduce((s, c) => s + c.total, 0);
  const landmarks = cols.reduce((s, c) => s + c.byGroup.history, 0);
  const landmarksBefore2000 = cols.filter((c) => c.year < 2000).reduce((s, c) => s + c.byGroup.history, 0);
  const papers = cols.reduce((s, c) => s + c.byGroup.paper + c.byGroup["person-paper"], 0);
  const papersBefore2000 = cols.filter((c) => c.year < 2000).reduce((s, c) => s + c.byGroup.paper + c.byGroup["person-paper"], 0);
  out.push({
    id: "history-or-us",
    question: "Which decades does the corpus know least about, and is that history or is it us?",
    figure: `${Math.round((before2000 / all) * 100)} per cent`,
    answer: `Everything before 2000 is ${Math.round((before2000 / all) * 100)} per cent of the ${num(all)} dated entries, against ${Math.round((landmarksBefore2000 / landmarks) * 100)} per cent of the ${num(landmarks)} landmarks that editors chose and wrote by hand. Landmarks are the one group picked for mattering rather than fetched, and they are ${Math.round((landmarksBefore2000 / landmarks) / Math.max(0.0001, papersBefore2000 / papers))} times more likely to sit before 2000 than a paper is. The thin decades are our reading, not a quiet field.`,
    denominator: `${num(all)} dated entries across ${cols.length} year records, of which ${num(landmarks)} are hand-written landmarks and ${num(papers)} are papers`,
    supported: true,
    caveat: "This compares two groups inside the corpus against each other. It shows that the fetched literature is recent and the hand-written history is not; it cannot say how much of the field before 2000 is missing, because there is nothing here to measure that against.",
    rows: [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((d) => ({
      label: `${d}s`,
      value: `${num(totalIn(d))} entries, ${num(groupIn(d, "history"))} landmarks, ${num(groupIn(d, "paper") + groupIn(d, "person-paper"))} papers`,
    })),
  });

  /* 10. Precision ------------------------------------------------------------------------------------------ */
  const yrs = yearRecordsOf(g);
  const evs = yrs.flatMap((y) => y.events);
  const day = evs.filter((e) => e.precision === "day").length;
  const dayRecent = yrs.filter((y) => y.year >= 2020).flatMap((y) => y.events).filter((e) => e.precision === "day").length;
  out.push({
    id: "precision",
    question: "How exactly does the corpus know when things happened?",
    figure: `${Math.round((evs.filter((e) => e.precision === "year").length / evs.length) * 100)} per cent to the year only`,
    answer: `Of ${num(evs.length)} dated entries, ${num(evs.filter((e) => e.precision === "year").length)} are known only to the year, ${num(evs.filter((e) => e.precision === "month").length)} to the month, ${num(evs.filter((e) => e.precision === "quarter").length)} to the quarter and ${num(day)} to the day. ${Math.round((dayRecent / Math.max(1, day)) * 100)} per cent of the day-precise entries fall in 2020 or later, because the day comes from the regulatory feeds and the readout calendar, which are the parts of the corpus that are refreshed automatically.`,
    denominator: `${num(evs.length)} dated entries across the ${yrs.length} year records`,
    supported: true,
    caveat: "Precision here is the shape of the date the source gives, not a judgement of how reliable it is. A landmark known only to the year may be far better sourced than a calendar entry known to the day.",
    rows: [
      { label: "Known to the day", value: `${num(day)} (${Math.round((day / evs.length) * 100)} per cent)` },
      { label: "Known to the month or quarter", value: num(evs.filter((e) => e.precision === "month" || e.precision === "quarter").length) },
      { label: "Known to the year only", value: num(evs.filter((e) => e.precision === "year").length) },
    ],
  });

  /* 11. The edges ----------------------------------------------------------------------------------------- */
  const withEvents = yrs.filter((y) => y.events.length > 0);
  const empty = yrs.filter((y) => y.events.length === 0);
  const ahead = yrs.filter((y) => y.year > 2026);
  out.push({
    id: "edges",
    question: "How far back and how far forward does the record run?",
    figure: `${withEvents[0].year} to ${yrs[yrs.length - 1].year}`,
    answer: `The earliest dated entry is ${withEvents[0].year} and the latest is ${yrs[yrs.length - 1].year}. Between 1900 and the last dated year every year has a record, ${empty.length} of them empty; before 1900 the corpus holds ${num(yrs.filter((y) => y.year < 1900).reduce((s, y) => s + y.events.length, 0))} entries across ${yrs.filter((y) => y.year < 1900).length} scattered years, which is a handful of landmarks rather than a year-by-year reading. ${ahead.length} years after 2026 carry ${num(ahead.reduce((s, y) => s + y.events.length, 0))} dated entries, all of them dates a source states for something still to come.`,
    denominator: `${yrs.length} year records covering ${yrs[yrs.length - 1].year - yrs[0].year + 1} calendar years`,
    supported: true,
    caveat: "The forward edge is only as long as the last registry completion date and roadmap watch item anyone has written down, so it shortens as those pass rather than as the field changes.",
    rows: [
      { label: "Years with a record", value: num(yrs.length) },
      { label: "Years with a record and nothing in them", value: `${empty.length} (${empty.map((y) => y.year).join(", ")})` },
      { label: "Busiest year", value: (() => { const top = [...yrs].sort((a, b) => b.events.length - a.events.length)[0]; return `${top.year}, ${num(top.events.length)} entries`; })() },
    ],
  });

  return out;
}

/** "n=21, median 12 years (7 to 18)", or a plain note when the set is empty. */
function intervalLine(xs: readonly number[]): string {
  if (!xs.length) return "no cases";
  if (xs.length === 1) return `1 case, ${years(xs[0])}`;
  return `n=${xs.length}, median ${years(median(xs))} (${years(quantile(xs, 0.25))} to ${years(quantile(xs, 0.75))})`;
}

/** The same line for intervals the sources date to the day. */
function intervalLineOneDp(xs: readonly number[]): string {
  if (!xs.length) return "no cases";
  if (xs.length === 1) return `1 case, ${yearsOneDp(xs[0])}`;
  return `median ${yearsOneDp(median(xs))} (${yearsOneDp(quantile(xs, 0.25))} to ${yearsOneDp(quantile(xs, 0.75))})`;
}

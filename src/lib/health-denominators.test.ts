import { describe, expect, it } from "vitest";
import { METRIC_DEFS, health } from "./health";

/**
 * Denominator drift: a percentage gauge silently changes its meaning when the population it divides by grows.
 *
 * On 23 and 24 September 2026 the corpus went from about 12,400 records to 18,160 in a day (five deep cancer dives,
 * 99 new subtype pages, a 1,447-gene catalogue layer, hundreds of papers, thousands of registry trials). Eleven
 * gauges fell below target overnight, and for four of them nothing had got worse: `target-prevalence` read 11 per
 * cent because 1,442 catalogue genes with no medicine attached had joined the 232 targets the gauge was written for,
 * and `cancer-depth` read 71 per cent because 99 pages written deliberately thin ("treated as its parent") were
 * being counted as shallow. The dashboard degraded quietly and the numbers were read as a data gap for two days.
 *
 * So each gauge's denominator is recorded here with the label that was true of it. The test fails when a denominator
 * moves by more than MAX_DRIFT and the label has not changed, which is the exact shape of that failure: more records,
 * same claim about what is being counted. Two ways out, and the choice is the point of the test:
 *
 *   - the new records are the kind the gauge asks about: update the row's `total` and say so in the commit;
 *   - they are not: change the check so it counts the right population, restate `label` to say plainly what it
 *     counts and what it leaves out, and update the row.
 *
 * Never lower `target` to make a gauge pass. A target is a promise about the corpus; the denominator is a fact
 * about it. Only one of the two is allowed to move to settle an argument.
 *
 * Labels are compared as MetricDef.label, without the parenthesised note health() appends: the note carries live
 * counts and changes on every data commit.
 */

/** How far a denominator may move before the gauge has to restate what it counts. */
const MAX_DRIFT = 0.2;

/** Recorded 2026-09-25, after the gauge review that followed the 12,400-to-18,160 growth. */
const RECORDED: Array<{ id: string; total: number; label: string }> = [
  { id: "sources", total: 18160, label: "Records with a primary source" },
  { id: "backlinks", total: 18141, label: "Records with three or more relations" },
  { id: "orphans", total: 18141, label: "Records something links to" },
  { id: "tldr", total: 18160, label: "TL;DRs that are full sentences" },
  { id: "summary", total: 18160, label: "Summaries of 300 characters or more" },
  { id: "cancer-depth", total: 453, label: "Cancers that reach a deep dive, their own or the parent's" },
  { id: "regional-approvals", total: 450, label: "Approved products with regional rows" },
  { id: "molecules", total: 1080, label: "Products with a molecule or an explained placeholder" },
  // 591 to 710 on 2 October 2026: the two Recovery and Rejuvenation rounds added 119 technology records. They
  // are the kind this gauge asks about, and almost none has a drawing of its own; they borrow one through
  // SCHEMATIC_ALIAS. So the denominator grows and the score falls, which is the true reading. The alternative,
  // excluding them, would have been the gauge flattering itself.
  { id: "schematics", total: 710, label: "Technologies with a specific schematic" },
  { id: "target-prevalence", total: 1674, label: "Targets with sourced prevalence, or with no medicine aimed at them" },
  { id: "trial-outcomes", total: 1003, label: "Trials with structured outcomes, or with no results in public" },
  { id: "institution-people", total: 700, label: "Institutions with people" },
  { id: "people-papers", total: 1567, label: "People with papers, or in a role that produces none" },
  { id: "bottleneck-ideas", total: 45, label: "Bottlenecks with ten or more ideas" },
  { id: "term-wikipedia", total: 1029, label: "Terms with a Wikipedia link, or checked and found to have none" },
  { id: "stale", total: 18160, label: "Records checked in the last 60 days" },
  { id: "kind-size", total: 18, label: "Open kinds with 25 or more records" },
  { id: "reviewed", total: 18141, label: "Records a named human reviewer has signed off" },
  { id: "simple", total: 18160, label: "Records with a simple explanation" },
  { id: "translations", total: 18160, label: "Records with a TL;DR in all eight languages" },
  { id: "provenance", total: 18160, label: "Records with git provenance" },
  { id: "papers-snapshot", total: 3798, label: "Drugs, targets, cancers and technologies with a Europe PMC snapshot" },
  { id: "citations", total: 2419, label: "Key papers with a citation count" },
  { id: "trials-snapshot", total: 1080, label: "Products with a ClinicalTrials.gov snapshot" },
  { id: "logos", total: 2078, label: "Companies, institutions and collections with a logo" },
  { id: "completeness", total: 22, label: "External denominators at least half covered" },
];

const recorded = new Map(RECORDED.map((r) => [r.id, r]));
const drift = (live: number, was: number) => (was === 0 ? (live === 0 ? 0 : 1) : Math.abs(live - was) / was);
const pct = (d: number) => `${Math.round(d * 1000) / 10}%`;

describe("health gauge denominators", () => {
  const live = health();

  it("records every gauge, and no gauge that has gone", () => {
    const liveIds = live.map((m) => m.id).sort();
    const rows = RECORDED.map((r) => r.id).sort();
    expect(rows, "add a row to RECORDED for a new gauge, and delete the row for a gauge that has gone").toEqual(liveIds);
  });

  it("no denominator has drifted more than a fifth while the label still claims the old population", () => {
    const drifted = live.flatMap((m) => {
      const was = recorded.get(m.id);
      const def = METRIC_DEFS.find((d) => d.id === m.id);
      if (!was || !def || def.label !== was.label) return [];
      const d = drift(m.total, was.total);
      return d > MAX_DRIFT ? [`${m.id}: ${was.total.toLocaleString("en-GB")} to ${m.total.toLocaleString("en-GB")} (${pct(d)}), label unchanged: "${was.label}"`] : [];
    });
    expect(drifted, `the population these gauges divide by has moved by more than ${pct(MAX_DRIFT)} and their labels still describe the old one. For each, decide whether the new records are the kind the gauge asks about. If they are, update its row in RECORDED. If they are not, fix the check and restate the label to say what it counts and what it excludes, then update the row. Do not lower the target:\n  ${drifted.join("\n  ")}`).toEqual([]);
  });

  it("a restated label comes with a refreshed denominator", () => {
    const stale = METRIC_DEFS.flatMap((d) => {
      const was = recorded.get(d.id);
      if (!was || d.label === was.label) return [];
      const m = live.find((x) => x.id === d.id);
      return [`${d.id}: label is now "${d.label}", RECORDED still says "${was.label}"${m ? ` (denominator ${m.total.toLocaleString("en-GB")}, recorded ${was.total.toLocaleString("en-GB")})` : ""}`];
    });
    expect(stale, `these gauges have been restated without updating RECORDED, so the drift check has nothing true to compare against. Copy the new label and the current denominator into the row:\n  ${stale.join("\n  ")}`).toEqual([]);
  });
});

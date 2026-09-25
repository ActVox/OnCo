import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { ACCELERATED_APPROVALS, ACCELERATED_READ_ON, ACCELERATED_TABLES, ACCELERATED_UNMATCHED } from "@/data/accelerated-approvals";
import { TARGET_FIRST_DESCRIBED } from "@/data/target-first-described";
import { TRIAL_START_DATES } from "@/data/trial-start-dates";
import { conversionRate, mergeAcceleratedEvents, type AcceleratedRow } from "./accelerated";
import { startYear } from "./trial-starts";
import { findings } from "./timeline";

/**
 * The three dated fields /timeline/ was missing, and the rules that keep them worth computing with.
 *
 * Each one exists because a question the site asks could not be answered without it, and each one can be made
 * worthless in the same way: by filling it in from something that is not a source. The tests here are about that.
 * A first-description year that came from the earliest paper OnCo holds, a trial start invented from a readout, an
 * accelerated approval inferred from the word "accelerated" in prose: all three would leave the findings looking
 * answered and lying. So every populated value has to trace to the row it was read from, and every finding that
 * uses one has to count what it says it counts.
 */
const g = graph();

describe("accelerated approvals as typed events", () => {
  const rows: AcceleratedRow[] = Object.values(ACCELERATED_APPROVALS).flat();

  it("puts every row of the FDA's four tables on the product it names", () => {
    for (const [id, rs] of Object.entries(ACCELERATED_APPROVALS)) {
      const d = g.get(id);
      expect(d?.kind, `${id} is a product`).toBe("drug");
      if (d?.kind !== "drug") continue;
      for (const r of rs) {
        expect(d.regulatoryEvents.some((e) => e.type === "accelerated-approval" && e.date === r.granted && e.indication === r.indication), `${id}: grant ${r.granted} is a dated event`).toBe(true);
        if (r.outcome === "open") continue;
        const type = r.outcome === "converted" ? "conversion" : "withdrawal";
        expect(d.regulatoryEvents.some((e) => e.type === type && e.date === r.outcomeDate && e.indication === r.indication), `${id}: ${r.outcome} ${r.outcomeDate} is a dated event`).toBe(true);
      }
    }
  });

  it("counts the same indications as the tables it was generated from", () => {
    const total = ACCELERATED_TABLES.reduce((n, t) => n + t.count, 0);
    expect(rows.length + ACCELERATED_UNMATCHED.length).toBe(total);
    // Every row carries the two things a rate is computed from: a grant date, and an outcome with a date unless open.
    for (const r of [...rows, ...ACCELERATED_UNMATCHED]) {
      expect(r.granted, `${r.drugName} grant date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (r.outcome === "open") expect(r.outcomeDate).toBeUndefined();
      else {
        expect(r.outcomeDate, `${r.drugName} ${r.outcome} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(r.outcomeDate! >= r.granted, `${r.drugName} closed on or after its grant`).toBe(true);
      }
      expect(r.granted <= ACCELERATED_READ_ON, `${r.drugName} was granted on or before the day the tables were read`).toBe(true);
    }
  });

  it("upgrades an event the record already carries rather than dating the same day twice", () => {
    const row: AcceleratedRow = { drugName: "X (x)", indication: "Widget cancer", granted: "2020-01-02", outcome: "converted", outcomeDate: "2023-01-02", table: "verified" };
    const existing = [{ date: "2020-01-02", type: "approval", region: "US", note: "FDA grants accelerated approval to x for widget cancer.", source: "https://example.org/x" }];
    const merged = mergeAcceleratedEvents(existing, [row], "2026-09-17");
    expect(merged).toHaveLength(2);
    expect(merged[0]).toMatchObject({ date: "2020-01-02", type: "accelerated-approval", indication: "Widget cancer", source: "https://example.org/x" });
    expect(merged[0].note, "the editor's words are kept").toContain("FDA grants accelerated approval");
    expect(merged[1]).toMatchObject({ date: "2023-01-02", type: "conversion", indication: "Widget cancer" });
  });

  it("keeps two approvals granted on one day apart instead of collapsing them", () => {
    const a: AcceleratedRow = { drugName: "X (x)", indication: "Cancer A", granted: "2020-01-02", outcome: "open", table: "ongoing" };
    const b: AcceleratedRow = { ...a, indication: "Cancer B" };
    const merged = mergeAcceleratedEvents([], [a, b], "2026-09-17");
    expect(merged).toHaveLength(2);
    expect(merged.map((e) => e.indication).sort()).toEqual(["Cancer A", "Cancer B"]);
  });

  it("states a confirmation rate over resolved indications only", () => {
    const r = conversionRate([...rows, ...ACCELERATED_UNMATCHED]);
    expect(r.converted + r.withdrawn).toBe(r.resolved);
    expect(r.converted + r.withdrawn + r.open).toBe(rows.length + ACCELERATED_UNMATCHED.length);
    const f = findings(g).find((x) => x.id === "accelerated-to-withdrawal")!;
    expect(f.supported).toBe(true);
    expect(f.denominator).toContain(String(rows.length));
  });
});

describe("the first-description year on targets", () => {
  const described = g.kind("target").filter((t) => t.firstDescribed !== undefined);

  it("is never taken from the earliest paper the corpus happens to hold", () => {
    for (const t of described) {
      const row = TARGET_FIRST_DESCRIBED[t.id];
      // Either the record wrote its own year with its own source, or it came from the generated file; a year with
      // neither would be a year from nowhere, which is the failure this field exists to prevent.
      expect(t.firstDescribedNote, `${t.id} names the paper the year comes from`).toBeTruthy();
      expect(t.firstDescribedSource, `${t.id} says where the year was read`).toBeTruthy();
      if (row) expect(t.firstDescribed).toBe(row.year);
    }
  });

  it("dates a molecule, not a reading: the years predate the corpus's own literature far more often than not", () => {
    // Nothing here asserts a target's year is right. What it asserts is that the field is not a copy of the earliest
    // paper OnCo holds: if it were, no target could be dated before its own first paper, and most are.
    let before = 0, compared = 0;
    for (const t of described) {
      const papers = [...(g.incoming(t.id).get("paper") ?? []), ...t.keyPapers.map((id) => g.get(id))].filter((p) => p?.kind === "paper") as Array<{ year: number }>;
      if (!papers.length) continue;
      compared += 1;
      if (t.firstDescribed! < Math.min(...papers.map((p) => p.year))) before += 1;
    }
    expect(compared).toBeGreaterThan(50);
    expect(before / compared).toBeGreaterThan(0.5);
  });

  it("is used by the timeline, with its own denominator", () => {
    const f = findings(g).find((x) => x.id === "target-to-drug")!;
    expect(f.supported).toBe(true);
    expect(f.denominator).toContain(described.length.toLocaleString("en-GB"));
  });
});

describe("the trial start date", () => {
  const started = g.kind("trial").filter((t) => t.started !== undefined);

  it("is the registry's date, at the registry's precision", () => {
    for (const t of started) {
      expect(t.started, `${t.id} start date shape`).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
      const row = TRIAL_START_DATES[t.id];
      if (!row) continue;
      expect(row.nct).toBe(t.nct);
      expect(t.started).toBe(row.started);
    }
  });

  it("never postdates the year the trial reported", () => {
    const wrong = started.filter((t) => t.yearReported !== undefined && startYear(t.started)! > t.yearReported);
    expect(wrong.map((t) => `${t.id}: started ${t.started}, reported ${t.yearReported}`)).toEqual([]);
  });

  it("is used by the timeline, with its own denominator", () => {
    const f = findings(g).find((x) => x.id === "trial-start-to-readout")!;
    expect(f.supported).toBe(true);
    expect(f.denominator).toContain(started.length.toLocaleString("en-GB"));
  });
});

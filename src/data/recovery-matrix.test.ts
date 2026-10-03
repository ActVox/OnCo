import { describe, expect, it } from "vitest";
import { graph } from "@/lib/graph";
import { SURVIVORSHIP } from "./survivorship";
import {
  ENDOCRINE_EXCEPTION, OUTLOOK_META, RECOVERY_CELLS, RECOVERY_EFFECTS, RECOVERY_THRESHOLDS, RECOVERY_TREATMENTS,
  cellsForDrug, recoveryDrugIds, recoveryFill,
} from "./recovery-matrix";

/**
 * The recovery matrix (src/data/recovery-matrix.ts, rendered at /live/recovery/): for each treatment and each
 * lasting effect, whether the function comes back.
 *
 * What this file is defending, in order of how badly it would hurt to lose it:
 *
 *  1. **Nothing without a source.** Every answer carries a source with a real URL, and every answer that is not
 *     "not established" carries a verbatim fragment of that source. Those fragments were checked by exact string
 *     match against the Europe PMC abstract or the DailyMed label text when the file was written; the test keeps
 *     the field from quietly emptying.
 *  2. **A figure keeps its cohort.** A percentage without the population it came from is not a figure, so
 *     `proportion` must carry both.
 *  3. **A gap is named, not implied.** Cells with outlook "unknown" exist to say that the literature does not
 *     answer a question readers ask, and they must say what was searched.
 *  4. **The fill rate cannot drift upward silently.** The page leads with the share of the grid that is filled.
 *     The floors below are the measurement at the last count; raise them when the matrix grows, and never lower
 *     one to make the suite pass. Shrinking the matrix is the failure this catches.
 */

const g = graph();
const effectIds = new Set(RECOVERY_EFFECTS.map((e) => e.id));
const treatmentIds = new Set(RECOVERY_TREATMENTS.map((t) => t.id));
/** Words that tell a reader how to feel about their own cancer; the corpus rule is docs/HOUSE-STYLE.md. */
const FORBIDDEN = /\b(devastating|dismal|grim|hopeless|tragic|battle|fight against cancer|lost (her|his) battle|doomed|miracle)\b/i;

describe("recovery matrix: structure", () => {
  it("has unique treatment and effect ids and every cell points at one of each", () => {
    expect(treatmentIds.size).toBe(RECOVERY_TREATMENTS.length);
    expect(effectIds.size).toBe(RECOVERY_EFFECTS.length);
    for (const c of RECOVERY_CELLS) {
      expect(treatmentIds.has(c.treatment), `unknown treatment ${c.treatment}`).toBe(true);
      expect(effectIds.has(c.effect), `unknown effect ${c.effect} on ${c.treatment}`).toBe(true);
    }
  });

  it("never repeats the same answer for the same square from the same source", () => {
    const seen = new Set<string>();
    for (const c of RECOVERY_CELLS) {
      const key = `${c.treatment}|${c.effect}|${c.source.url}`;
      expect(seen.has(key), `duplicate cell ${key}`).toBe(false);
      seen.add(key);
    }
  });

  it("gives every treatment at least one answer, so no row is an empty promise", () => {
    const empty = RECOVERY_TREATMENTS.filter((t) => !RECOVERY_CELLS.some((c) => c.treatment === t.id)).map((t) => t.id);
    expect(empty).toEqual([]);
  });

  it("agrees with the survivorship planner about what a treatment class is", () => {
    const ids = new Set(SURVIVORSHIP.map((s) => s.id));
    for (const t of RECOVERY_TREATMENTS) {
      if (t.survivorshipId) expect(ids.has(t.survivorshipId), `${t.id}: no survivorship entry ${t.survivorshipId}`).toBe(true);
    }
  });
});

describe("recovery matrix: every answer is sourced", () => {
  it("carries a source with a parseable https URL and a readable sentence", () => {
    for (const c of RECOVERY_CELLS) {
      const where = `${c.treatment}/${c.effect}`;
      expect(c.source.label.length, where).toBeGreaterThan(10);
      expect(() => new URL(c.source.url), `${where}: bad url ${c.source.url}`).not.toThrow();
      expect(c.source.url.startsWith("https://"), where).toBe(true);
      if (c.also) expect(() => new URL(c.also!.url), `${where}: bad second url`).not.toThrow();
      expect(c.line.length, `${where}: line too short`).toBeGreaterThan(40);
      expect(c.line.endsWith("."), `${where}: line is a sentence`).toBe(true);
    }
  });

  it("quotes the source verbatim for every answer that is not a named gap, and says what was searched for the gaps", () => {
    for (const c of RECOVERY_CELLS) {
      const where = `${c.treatment}/${c.effect}`;
      if (c.outlook === "unknown") {
        expect(c.searched, `${where}: a gap must say what was searched`).toBeTruthy();
      } else {
        expect(c.quote, `${where}: no verbatim fragment of the source`).toBeTruthy();
        expect(c.quote!.length, `${where}: quote too short to be a quotation`).toBeGreaterThan(20);
      }
    }
  });

  it("keeps the cohort with the figure, because a percentage without a population is not a figure", () => {
    for (const c of RECOVERY_CELLS) {
      if (!c.proportion) continue;
      const where = `${c.treatment}/${c.effect}`;
      expect(c.proportion.figure.trim().length, `${where}: empty figure`).toBeGreaterThan(3);
      expect(c.proportion.cohort.trim().length, `${where}: figure without a cohort`).toBeGreaterThan(10);
    }
  });

  it("writes in the house style: British spelling conventions, no em-dashes, no verdicts", () => {
    const prose = [
      ...RECOVERY_CELLS.flatMap((c) => [c.line, c.timescale ?? "", c.proportion?.cohort ?? "", c.searched ?? ""]),
      ...RECOVERY_TREATMENTS.flatMap((t) => [t.label, t.plain]),
      ...RECOVERY_EFFECTS.flatMap((e) => [e.label, e.plain]),
      ...RECOVERY_THRESHOLDS.flatMap((t) => [t.threshold, t.cohort]),
      ENDOCRINE_EXCEPTION.intro, ENDOCRINE_EXCEPTION.outro,
      ...ENDOCRINE_EXCEPTION.rows.flatMap((r) => [r.gland, r.what]),
    ];
    for (const s of prose) {
      expect(s.includes("—"), `em-dash in: ${s.slice(0, 60)}`).toBe(false);
      expect(FORBIDDEN.test(s), `verdict word in: ${s.slice(0, 60)}`).toBe(false);
    }
  });
});

describe("recovery matrix: every id resolves", () => {
  it("names only drugs, technologies and records that exist in the corpus", () => {
    for (const t of RECOVERY_TREATMENTS) {
      for (const d of t.drugIds) expect(g.get(d)?.kind, `${t.id}: ${d}`).toBe("drug");
      for (const r of t.relatedIds) expect(g.get(r), `${t.id}: ${r}`).toBeDefined();
    }
    for (const e of RECOVERY_EFFECTS) for (const id of e.entityIds) expect(g.get(id), `${e.id}: ${id}`).toBeDefined();
    for (const c of RECOVERY_CELLS) for (const id of c.drugIds ?? []) expect(g.get(id)?.kind, `${c.treatment}: ${id}`).toBe("drug");
  });

  it("supplements the medicines that already exist rather than inventing new ones", () => {
    const ids = recoveryDrugIds();
    expect(ids.length, "medicines gaining a recovery line").toBeGreaterThanOrEqual(71);
    for (const id of ids) expect(g.get(id)?.kind, id).toBe("drug");
    // The panel on a drug page shows the class answers unless a cell names the product.
    expect(cellsForDrug("cisplatin").length).toBeGreaterThan(3);
    expect(cellsForDrug("doxorubicin").some((c) => c.effect === "heart")).toBe(true);
  });

  it("has the three records of its own wired into the corpus", () => {
    for (const id of ["rejuv-recovery-matrix", "rejuv-recovery-endocrine-permanence", "rejuv-recovery-cumulative-dose"]) {
      const e = g.must(id);
      expect(e.kind).toBe("technology");
      expect(e.sections).toContain("rejuvenation");
      expect(e.links.length, `${id}: needs primary sources`).toBeGreaterThan(0);
    }
  });
});

describe("recovery matrix: dose thresholds and the endocrine exception", () => {
  it("gives every threshold a unique id, a real treatment and effect, a cohort and a source", () => {
    const ids = new Set<string>();
    for (const t of RECOVERY_THRESHOLDS) {
      expect(ids.has(t.id), `duplicate threshold id ${t.id}`).toBe(false);
      ids.add(t.id);
      expect(t.id.startsWith("rejuv-recovery-"), t.id).toBe(true);
      expect(treatmentIds.has(t.treatment), t.id).toBe(true);
      expect(effectIds.has(t.effect), t.id).toBe(true);
      expect(t.cohort.length, `${t.id}: a threshold needs the population it was measured in`).toBeGreaterThan(20);
      expect(() => new URL(t.source.url), `${t.id}: bad url`).not.toThrow();
      expect(t.quote, `${t.id}: no verbatim fragment`).toBeTruthy();
    }
  });

  it("states the endocrine exception with a source on every row", () => {
    expect(ENDOCRINE_EXCEPTION.rows.length).toBeGreaterThanOrEqual(5);
    expect(ENDOCRINE_EXCEPTION.intro.length).toBeGreaterThan(200);
    for (const r of ENDOCRINE_EXCEPTION.rows) {
      expect(r.id.startsWith("rejuv-recovery-endocrine-"), r.id).toBe(true);
      expect(OUTLOOK_META[r.outlook], r.id).toBeDefined();
      expect(() => new URL(r.source.url), `${r.id}: bad url`).not.toThrow();
      expect(r.quote, `${r.id}: no verbatim fragment`).toBeTruthy();
    }
    // The point of the section: the glands do not recover, and the comparison row shows what recovery looks like.
    const glands = ENDOCRINE_EXCEPTION.rows.filter((r) => r.outlook === "unlikely");
    expect(glands.length, "the pituitary, thyroid, adrenal and pancreatic rows").toBeGreaterThanOrEqual(4);
    expect(ENDOCRINE_EXCEPTION.rows.some((r) => r.outlook === "usual"), "a row showing what does recover").toBe(true);
  });
});

describe("recovery matrix: coverage is measured, not claimed", () => {
  it("computes the fill rate from the data and does not shrink", () => {
    const f = recoveryFill();
    expect(f.grid).toBe(RECOVERY_TREATMENTS.length * RECOVERY_EFFECTS.length);
    expect(f.pct).toBe(Math.round((f.squares / f.grid) * 1000) / 10);
    // Floors, measured on 2 October 2026. Raise them when the matrix grows; never lower one to pass.
    expect(f.squares, "squares of the grid with a sourced answer").toBeGreaterThanOrEqual(104);
    expect(f.sourced, "sourced answers").toBeGreaterThanOrEqual(116);
    expect(f.withProportion, "answers carrying a proportion from the source").toBeGreaterThanOrEqual(121);
    expect(f.named, "questions written out as unanswered").toBeGreaterThanOrEqual(17);
    expect(f.thresholds, "published dose thresholds").toBeGreaterThanOrEqual(23);
  });

  it("is honest that most of the grid is empty, so the page cannot read as complete", () => {
    const f = recoveryFill();
    expect(f.pct).toBeLessThan(50);
    expect(f.squares).toBeLessThan(f.grid);
  });
});

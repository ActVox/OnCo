import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { COMPLEMENTARY_INDEX, complementary } from "@/data/complementary";
import { HAIR_LOSS_CAUSES, HAIR_PROBLEMS, REGROWTH_TIMELINE, WIG_PROVISION, SCALP_COOLING_EVIDENCE, SCALP_COOLING_PRACTICAL, HAIR_PRACTICAL, COOLING_DEVICES } from "@/data/hair-loss";
import { hairQuestions, HAIR_QUESTION_SETTINGS } from "@/data/hair-questions";
import { EVIDENCE_GRADES, USE_KEYS, gradeFromTags } from "./complementary";

/**
 * Complementary and supportive approaches, and the hair-loss side data: every id resolves to the right kind,
 * every graded record carries a matching tag and a primary source, and reader-facing copy follows the house
 * rules (no em-dashes, no "spike", UK spelling for the words that differ).
 */
describe("complementary approaches", () => {
  const g = graph();

  it("covers at least 40 approaches, each a technology that exists, with a valid grade and purposes", () => {
    expect(COMPLEMENTARY_INDEX.length).toBeGreaterThanOrEqual(40);
    const ids = COMPLEMENTARY_INDEX.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of COMPLEMENTARY_INDEX) {
      const e = g.get(c.id);
      expect(e?.kind, c.id).toBe("technology");
      expect(EVIDENCE_GRADES, c.id).toContain(c.grade);
      expect(c.uses.length, c.id).toBeGreaterThan(0);
      for (const u of c.uses) expect(USE_KEYS, `${c.id}: ${u}`).toContain(u);
      expect(c.line.length, c.id).toBeGreaterThan(20);
    }
  });

  it("every record tagged complementary has a primary source, a summary of at least 300 characters, and a grade tag matching the index", () => {
    const byId = new Map(COMPLEMENTARY_INDEX.map((c) => [c.id, c]));
    for (const e of complementary) {
      if (e.kind !== "technology") continue;
      const tags = e.tags ?? [];
      expect(tags, e.id).toContain("complementary");
      expect((e.links ?? []).length, `${e.id}: needs at least one primary source`).toBeGreaterThan(0);
      expect(e.summary.length, `${e.id}: summary too short`).toBeGreaterThanOrEqual(300);
      const tagged = gradeFromTags(tags);
      expect(tagged, `${e.id}: missing evidence:<grade> tag`).toBeDefined();
      const idx = byId.get(e.id);
      expect(idx, `${e.id}: not in COMPLEMENTARY_INDEX`).toBeDefined();
      expect(idx!.grade, `${e.id}: index grade differs from tag`).toBe(tagged);
    }
  });

  it("the Johnson 2018 JNCI paper is cited by the record on alternative medicine used instead of treatment", () => {
    const e = g.must("alternative-medicine-instead-of-treatment");
    expect(e.links.some((l) => l.url.includes("10.1093/jnci/djx145"))).toBe(true);
    expect(e.keyPapers).toContain("paper-johnson-alternative-medicine-jnci-2018");
    expect(g.get("paper-johnson-alternative-medicine-jnci-2018")?.kind).toBe("paper");
  });

  it("hair-loss side data references only drugs and technologies that exist, with parseable source URLs", () => {
    const url = (u: string, where: string) => expect(() => new URL(u), `${where}: bad url ${u}`).not.toThrow();
    const ids = HAIR_LOSS_CAUSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of HAIR_LOSS_CAUSES) {
      expect(c.drugIds.length + (c.technologyIds?.length ?? 0), c.id).toBeGreaterThan(0);
      for (const id of c.drugIds) expect(g.get(id)?.kind, `${c.id} -> ${id}`).toBe("drug");
      for (const id of c.technologyIds ?? []) expect(g.get(id)?.kind, `${c.id} -> ${id}`).toBe("technology");
      url(c.source.url, c.id);
    }
    for (const p of HAIR_PROBLEMS) {
      expect(p.worksNow.length, p.id).toBeGreaterThan(0);
      expect(p.inProgress.length, p.id).toBeGreaterThan(0);
      for (const id of p.entityIds) expect(g.get(id), `${p.id} -> ${id}`).toBeDefined();
      for (const s of p.sources) url(s.url, p.id);
    }
    for (const s of REGROWTH_TIMELINE) url(s.source.url, s.when);
    for (const w of WIG_PROVISION) for (const r of w.rows) url(r.url, r.label);
    for (const r of SCALP_COOLING_EVIDENCE) url(r.source.url, r.regimen);
    for (const f of SCALP_COOLING_PRACTICAL) { url(f.source.url, f.question); if (f.also) url(f.also.url, f.question); }
    for (const r of HAIR_PRACTICAL) url(r.source.url, r.title);
  });

  it("every hair question sits in a named setting, and every setting has questions", () => {
    const settings = new Set(HAIR_QUESTION_SETTINGS);
    expect(new Set(HAIR_QUESTION_SETTINGS).size).toBe(HAIR_QUESTION_SETTINGS.length);
    expect(hairQuestions.length).toBeGreaterThanOrEqual(40);
    for (const q of hairQuestions) {
      expect(settings.has(q.setting), `unknown setting: ${q.setting}`).toBe(true);
      expect(q.question.endsWith("?"), q.question).toBe(true);
      expect(q.why.length, q.question).toBeGreaterThan(60);
    }
    for (const s of HAIR_QUESTION_SETTINGS) expect(hairQuestions.filter((q) => q.setting === s).length, s).toBeGreaterThan(0);
  });

  it("every FDA scalp cooling authorisation names its number and the year it was granted", () => {
    expect(COOLING_DEVICES.length).toBeGreaterThanOrEqual(7);
    for (const d of COOLING_DEVICES) expect(d.authorisation, d.device).toMatch(/\b(K\d{6}|DEN\d{6})\b.*\b20\d{2}$/);
  });

  it("reader-facing copy has no em-dashes, no 'spike', and uses UK spelling", () => {
    const text = JSON.stringify([complementary, COMPLEMENTARY_INDEX, HAIR_LOSS_CAUSES, HAIR_PROBLEMS, REGROWTH_TIMELINE, WIG_PROVISION, SCALP_COOLING_EVIDENCE, SCALP_COOLING_PRACTICAL, HAIR_PRACTICAL, COOLING_DEVICES, hairQuestions]);
    expect(text).not.toContain("—");
    expect(text).not.toMatch(/\bspike/i);
    expect(text).not.toMatch(/\b(randomized|behavior|tumor\b|center\b|color\b|esophag)/);
  });
});

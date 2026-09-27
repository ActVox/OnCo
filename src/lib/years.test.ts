import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { CONTINUOUS_FROM, canonicalDate, yearId, yearOf } from "./years";
import { precisionOf, YEAR_EVENT_GROUPS, dateLabel, groupPhrase } from "./year-groups";
import { BANDS, MIN_N, findings, series } from "./timeline";

/**
 * A year record holds no fact of its own: every line on it is copied from another record, and every id it names has
 * to resolve. These are the tests that keep that true, because a generated record is the easiest place in the corpus
 * for a dangling reference to hide: the graph validates the relationship arrays, and a year's events are not in one.
 */
const g = graph();
const years = [...g.kind("year")].sort((a, b) => a.year - b.year);

describe("year records", () => {
  it("exist, are ids of their own year, and are unique", () => {
    expect(years.length).toBeGreaterThan(100);
    for (const y of years) {
      expect(y.id, `${y.id} is its year`).toBe(yearId(y.year));
      expect(y.id).toMatch(/^\d{4}$/);
      expect(y.name).toContain(String(y.year));
    }
    expect(new Set(years.map((y) => y.id)).size).toBe(years.length);
  });

  it("covers every year without a gap from the year the continuous record starts", () => {
    const modern = years.filter((y) => y.year >= CONTINUOUS_FROM).map((y) => y.year);
    for (let i = 1; i < modern.length; i++) expect(modern[i], `no gap after ${modern[i - 1]}`).toBe(modern[i - 1] + 1);
    // Every year before that has something in it: an empty page there would say nothing, since the early record is a
    // scatter of landmarks rather than a year-by-year reading.
    for (const y of years.filter((y) => y.year < CONTINUOUS_FROM)) expect(y.events.length, `${y.year} is only there because it holds something`).toBeGreaterThan(0);
  });

  it("says so when a year holds nothing rather than being left out", () => {
    const empty = years.filter((y) => y.events.length === 0);
    for (const y of empty) {
      expect(y.year).toBeGreaterThanOrEqual(CONTINUOUS_FROM);
      expect(y.tldr).toMatch(/holds nothing/);
    }
  });

  it("reads every id it names back out of the graph", () => {
    for (const y of years) {
      for (const e of y.events) {
        if (e.from) expect(g.get(e.from), `${y.id}: ${e.from} in "${e.title}"`).toBeTruthy();
        for (const r of e.refs) expect(g.get(r), `${y.id}: ref ${r} in "${e.title}"`).toBeTruthy();
      }
    }
  });

  it("dates every event in its own year, in a shape that matches the precision it claims", () => {
    for (const y of years) {
      for (const e of y.events) {
        expect(yearOf(e.date), `${y.id}: ${e.date}`).toBe(y.year);
        expect(e.precision, `${y.id}: ${e.date}`).toBe(precisionOf(e.date));
        expect(canonicalDate(e.date), `${y.id}: ${e.date} is already canonical`).toBe(e.date);
        expect(YEAR_EVENT_GROUPS).toContain(e.group);
      }
    }
  });

  it("chains the years, so no year is reachable only by search", () => {
    for (const y of years) {
      expect(g.incoming(y.id).size, `${y.id} has an inbound link`).toBeGreaterThan(0);
      for (const r of y.related) expect(g.get(r)?.kind, `${y.id} relates only to its neighbours`).toBe("year");
    }
    // A chain, not a star: the first year points forwards only and the last points back only.
    expect(years[0].related).toEqual([yearId(years[1].year)]);
    expect(years[years.length - 1].related).toEqual([yearId(years[years.length - 2].year)]);
  });

  it("lists no event twice and no paper both as a record and as a person's listing", () => {
    for (const y of years) {
      // A line's identity is everything a reader sees: two approvals of one product in one region in one year are
      // two facts about two indications, and the note is what tells them apart.
      const keys = y.events.map((e) => `${e.group}|${e.date}|${e.title}|${e.from ?? ""}|${e.note ?? ""}`);
      expect(new Set(keys).size, `${y.id} has no duplicate line`).toBe(keys.length);
      const papers = new Set(y.events.filter((e) => e.group === "paper").map((e) => e.title.toLowerCase()));
      for (const e of y.events.filter((e) => e.group === "person-paper")) expect(papers.has(e.title.toLowerCase()), `${y.id}: "${e.title}" is listed twice`).toBe(false);
    }
  });
});

describe("date reading", () => {
  it("reads every shape the corpus writes a date in, and refuses the rest", () => {
    expect(canonicalDate("2011-08-26")).toBe("2011-08-26");
    expect(canonicalDate("2011-08")).toBe("2011-08");
    expect(canonicalDate("2011")).toBe("2011");
    expect(canonicalDate("2027-Q2")).toBe("2027-Q2");
    expect(canonicalDate("Q2 2027")).toBe("2027-Q2");
    expect(canonicalDate("H2 2027")).toBe("2027-Q3");
    // A NICE technology appraisal number and a premarket approval number both look like years to a loose reader.
    expect(canonicalDate("NICE TA1136")).toBeNull();
    expect(canonicalDate("P160002")).toBeNull();
    expect(canonicalDate("2019 to 2022")).toBeNull();
    expect(canonicalDate("")).toBeNull();
  });

  it("writes a date the way a reader says it", () => {
    expect(dateLabel("2011-08-26")).toBe("26 August 2011");
    expect(dateLabel("2011-08")).toBe("August 2011");
    expect(dateLabel("2027-Q2")).toBe("Q2 2027");
    expect(dateLabel("1971")).toBe("1971");
  });

  it("counts in step with its own label", () => {
    expect(groupPhrase("approval", 1)).toBe("1 approval");
    expect(groupPhrase("approval", 12)).toBe("12 approvals");
    expect(groupPhrase("history", 1)).toBe("1 landmark");
  });
});

describe("the timeline and its findings", () => {
  it("gives one column per year record, and the bands cover every group once", () => {
    const cols = series(g);
    expect(cols.length).toBe(years.length);
    expect(cols.reduce((s, c) => s + c.total, 0)).toBe(years.reduce((s, y) => s + y.events.length, 0));
    const banded = BANDS.flatMap((b) => b.groups);
    expect([...banded].sort()).toEqual([...YEAR_EVENT_GROUPS].sort());
  });

  it("states a denominator and a caveat on every finding, and marks the thin ones", () => {
    const found = findings(g);
    expect(found.length).toBeGreaterThanOrEqual(8);
    for (const f of found) {
      expect(f.question.endsWith("?"), `${f.id} asks a question`).toBe(true);
      expect(f.denominator.length, `${f.id} has a denominator`).toBeGreaterThan(20);
      expect(f.caveat.length, `${f.id} has a caveat`).toBeGreaterThan(20);
      expect(f.denominator, `${f.id} counts something`).toMatch(/\d/);
      expect(f.answer).toMatch(/\d/);
      // No em-dashes, no "as of" stamps: the same house style the corpus rules hold every rendered field to.
      for (const text of [f.question, f.answer, f.denominator, f.caveat]) {
        expect(text, `${f.id}`).not.toMatch(/[—–]/);
        expect(text, `${f.id}`).not.toMatch(/\bas of\b/i);
      }
    }
    // The two questions that were unanswerable when this page was written are answerable now, each from a field
    // added for it: `firstDescribed` on the target (src/data/target-first-described.ts) and the typed
    // accelerated-approval events on the product (src/data/accelerated-approvals.ts). The assertion is kept the
    // other way round so a regression that silently drops either field is caught here rather than on the page.
    expect(found.find((f) => f.id === "target-to-drug")?.supported).toBe(true);
    expect(found.find((f) => f.id === "accelerated-to-withdrawal")?.supported).toBe(true);
    expect(found.find((f) => f.id === "trial-start-to-readout")?.supported).toBe(true);
  });

  it("marks a finding unsupported whenever its denominator is under the minimum", () => {
    for (const f of findings(g)) {
      const n = Number((/\b(\d[\d,]*)\b/.exec(f.denominator)?.[1] ?? "0").replace(/,/g, ""));
      if (n < MIN_N) expect(f.supported, `${f.id} counts ${n}, under ${MIN_N}`).toBe(false);
    }
  });
});

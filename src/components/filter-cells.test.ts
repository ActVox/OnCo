import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef } from "./EntityBrowser";
import { buildBrowser } from "@/lib/kind-browser";
import { kindBrowser } from "@/lib/tables/kinds";
import { startupBrowser } from "@/lib/tables/startups";
import { openSourceBrowser } from "@/lib/tables/open-source";
import { softwareBrowser } from "@/lib/tables/software";
import { taggedRows, TAG_FACETS } from "@/lib/tables/tagged";
import { tagIndex } from "@/lib/tags";
import { isFacetLink, isYearRange } from "@/lib/browser-sort";
import { decadeLabel, KINDS } from "@/lib/kinds";
import { graph } from "@/lib/graph";
import UkCoverage from "@/app/coverage/uk/page";
import UsCoverage from "@/app/coverage/us/page";
import Machines from "@/app/machines/page";
import Models from "@/app/models/page";

/**
 * Cells that hold a value the table can filter by are filters (owner, 25 Sept 2026: "clicking on the year in
 * 'reported' will allow the table in trials and other ones to be filtered"). Two things have to hold for such a
 * cell to be worth anything: it has to render as a control, and the value it sets has to be one the facet holds,
 * or the reader lands on an empty table (the `/trials/?cancers=Breast cancer (all types)` bug that put `facetLabel`
 * in src/lib/kinds.ts). The first test here is the general guard: over every templated table, every filtering cell
 * points at a facet of that table and at a value the same row carries, so no filter link can come back empty.
 */

const router: AppRouterInstance = { push() {}, replace() {}, prefetch() {}, back() {}, forward() {}, refresh() {}, bfcacheId: "static" };
const render = (el: ReactElement) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, el));
vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-sans" }), Geist_Mono: () => ({ variable: "font-geist-mono" }) }));

/** The cells of the first body row, in column order (name and status come before the table's own columns). */
const cells = (html: string) => [...(html.match(/<tbody[\s\S]*?<\/tbody>/)?.[0] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1]);
const browser = (rows: BrowserRow[], facets: FacetDef[], columns: ColDef[], hideStatus = false) =>
  render(createElement(EntityBrowser, { rows, facets, columns, noun: "rows", hideStatus }));
const colIndex = (columns: ColDef[], key: string, hideStatus = false) => columns.findIndex((c) => c.key === key) + (hideStatus ? 1 : 2);

type Table = { name: string; rows: BrowserRow[]; facets: FacetDef[]; columns: ColDef[] };
const tables = (): Table[] => {
  const out: Table[] = KINDS.map((k) => ({ name: k, ...buildBrowser(k) }));
  out.push({ name: "startups", ...startupBrowser() });
  out.push({ name: "open source", ...openSourceBrowser() });
  out.push({ name: "software", ...softwareBrowser() });
  const biggestTag = [...tagIndex().values()].sort((a, b) => b.ids.length - a.ids.length)[0];
  out.push({ name: `tag ${biggestTag.slug}`, rows: taggedRows(biggestTag), facets: TAG_FACETS, columns: [] });
  return out;
};

describe("a cell that filters sets a value its facet holds", () => {
  it("every filtering cell of every templated table names a facet of that table and a value the row carries", () => {
    let checked = 0;
    for (const t of tables()) {
      const keys = new Set(t.facets.map((f) => f.key));
      for (const r of t.rows) {
        for (const [col, v] of Object.entries(r.cols)) {
          const links = Array.isArray(v) ? v.filter(isFacetLink) : isFacetLink(v) ? [v] : [];
          for (const l of links) {
            expect(keys.has(l.facet), `${t.name}.${col} filters on "${l.facet}", which is not a facet of the table`).toBe(true);
            expect((r.facets[l.facet] ?? []).includes(l.value), `${t.name} row ${r.id}: ${col} links ${l.facet}=${l.value}, which the row does not carry`).toBe(true);
            checked++;
          }
          if (isYearRange(v) && v.facet) {
            expect(keys.has(v.facet), `${t.name}.${col} year range filters on "${v.facet}", not a facet`).toBe(true);
            expect((r.facets[v.facet] ?? []).includes(String(v.first)), `${t.name} row ${r.id}: the first year is not in the ${v.facet} facet`).toBe(true);
            checked++;
          }
        }
      }
    }
    // Thousands, not a handful: the guard would pass vacuously if the cells stopped being filters.
    expect(checked).toBeGreaterThan(10000);
  });

  it("the facet counts a paged page ships hold every value its cells link to", () => {
    for (const k of ["trial", "drug", "technology", "paper"] as const) {
      const b = kindBrowser(k);
      for (const r of b.rows.slice(0, 200)) {
        for (const v of Object.values(r.cols)) {
          const links = Array.isArray(v) ? v.filter(isFacetLink) : isFacetLink(v) ? [v] : [];
          for (const l of links) expect(b.counts[l.facet]?.some(([value]) => value === l.value), `${k}: ${l.facet}=${l.value} is missing from the counts the page ships`).toBe(true);
          if (isYearRange(v) && v.facet) expect(b.counts[v.facet]?.some(([value]) => value === String(v.first)), `${k}: ${v.facet}=${v.first} is missing from the counts`).toBe(true);
        }
      }
    }
  });
});

describe("the year a trial reported filters the trials table", () => {
  const trials = buildBrowser("trial");
  const dated = trials.rows.find((r) => isFacetLink(r.cols.year))!;

  it("has a year facet whose values are the years the Reported column prints", () => {
    const facet = trials.facets.find((f) => f.key === "year");
    expect(facet, "the trials table has a Reported year facet").toBeTruthy();
    expect(facet!.label).toBe("Reported");
    const years = new Set(trials.rows.flatMap((r) => r.facets.year ?? []));
    expect(years.size).toBeGreaterThan(20);
    // Undated trials print a dash and carry no value, so the filter never offers an empty year.
    expect(years.has("")).toBe(false);
    const undated = trials.rows.find((r) => r.cols.year === undefined)!;
    expect(undated.facets.year).toEqual([]);
  });

  it("renders the year as a chip that filters by it", () => {
    const year = isFacetLink(dated.cols.year) ? dated.cols.year.value : "";
    const cell = cells(browser([dated], trials.facets, trials.columns))[colIndex(trials.columns, "year")];
    expect(cell).toContain(`aria-label="Filter by Reported: ${year}"`);
    expect(cell).toContain("aria-pressed=\"false\"");
    expect(cell).toContain(`>${year}</button>`);
  });
});

describe("a product's first approval year filters, its range does not", () => {
  const drugs = buildBrowser("drug");
  const ranged = drugs.rows.find((r) => isYearRange(r.cols.approved) && r.cols.approved.last && r.cols.approved.last !== r.cols.approved.first)!;

  it("the first year is a filter control and the muted 'to <latest>' stays plain text", () => {
    const v = ranged.cols.approved; if (!isYearRange(v)) throw new Error("not a year range");
    const cell = cells(browser([ranged], drugs.facets, drugs.columns))[colIndex(drugs.columns, "approved")];
    expect(cell).toContain("data-year-filter");
    expect(cell).toContain(`aria-label="Filter by First approval: ${v.first}"`);
    // The first year keeps its weight inside the button; the later year is text with no control of its own.
    expect(cell).toMatch(new RegExp(`<button[^>]*data-year-filter[\\s\\S]*?<span class="text-foreground"[^>]*>${v.first}</span></button>`));
    expect(cell).toMatch(new RegExp(`<span class="text-muted[^"]*"[^>]*>to ${v.last}</span>`));
    expect(cell.split(`to ${v.last}`)[1] ?? "").not.toContain("<button");
    expect(drugs.facets.find((f) => f.key === "approved")?.label).toBe("First approval");
  });

  it("products with no dated approval keep an empty cell and no year facet value", () => {
    const none = drugs.rows.find((r) => r.cols.approved === undefined)!;
    expect(none.facets.approved).toEqual([]);
  });
});

describe("a year too fine to filter by filters by its decade", () => {
  it("the Since column of the technologies table prints the year and filters the decade, as /machines/ does", () => {
    const techs = buildBrowser("technology");
    const row = techs.rows.find((r) => isFacetLink(r.cols.since))!;
    const cell = isFacetLink(row.cols.since) ? row.cols.since : undefined;
    const year = graph().kind("technology").find((t) => t.id === row.id)!;
    const since = year.kind === "technology" ? year.since : undefined;
    expect(cell!.label).toBe(String(since));
    expect(cell!.value).toBe(decadeLabel(since!));
    expect(techs.facets.find((f) => f.key === "era")?.label).toBe("First used");
    // Sixty-six distinct years, a third of them holding one record; thirteen decades, the smallest holding one.
    const decades = new Set(techs.rows.flatMap((r) => r.facets.era ?? []));
    expect(decades.size).toBeLessThan(20);
    const html = browser([row], techs.facets, techs.columns);
    expect(cells(html)[colIndex(techs.columns, "since")]).toContain(`aria-label="Filter by First used: ${decadeLabel(since!)}"`);
  });
});

describe("the hand-built browsers filter from their cells too", () => {
  const filters = (html: string) => [...html.matchAll(/aria-label="Filter by ([^:]+): ([^"]*)"/g)].map((m) => [m[1], m[2]] as const);

  it("NHS coverage filters by NICE outcome, SMC verdict and appraisal year", async () => {
    const html = render(createElement(UkCoverage));
    const keys = new Set(filters(html).map(([f]) => f));
    for (const f of ["NICE outcome", "SMC (Scotland)", "Appraisal year"]) expect(keys.has(f), f).toBe(true);
    // Every year offered is a four-digit year, never a range or a blank.
    for (const [f, v] of filters(html)) if (f === "Appraisal year") expect(v).toMatch(/^\d{4}$/);
  });

  it("United States coverage filters by Medicare part and commercial pattern", () => {
    const html = render(createElement(UsCoverage));
    const keys = new Set(filters(html).map(([f]) => f));
    for (const f of ["Medicare part", "Commercial pattern"]) expect(keys.has(f), f).toBe(true);
  });

  it("machines filter by the decade a machine was first used", () => {
    const html = render(createElement(Machines));
    const years = filters(html).filter(([f]) => f === "First used").map(([, v]) => v);
    expect(years.length).toBeGreaterThan(0);
    for (const v of years) expect(v).toMatch(/^\d{3}0s$/);
  });

  it("models and datasets filter by year and by licence family", () => {
    const html = render(createElement(Models));
    const keys = new Set(filters(html).map(([f]) => f));
    for (const f of ["Year", "Licence"]) expect(keys.has(f), f).toBe(true);
    for (const [f, v] of filters(html)) if (f === "Year") expect(v).toMatch(/^\d{4}$/);
  });
});

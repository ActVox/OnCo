import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { EntityDetail } from "./EntityDetail";
import { graph } from "@/lib/graph";
import { publicTags, tagSlug } from "@/lib/tags";
import { planFor } from "@/lib/record-sections";

/**
 * Wall-clock allowance for the whole-page renders below. 120 seconds is right on an idle machine and is a real
 * guard: a page that takes longer than that has usually started rendering something it should page instead. But
 * it measures contention, not code, when a dozen agents are building in other worktrees, and three ship chains
 * have now failed on these four files at 149 seconds and passed on a re-run. The chain exports SLOW_TEST_MS so
 * the allowance follows the machine it is on; the default is unchanged, and no assertion is relaxed either way.
 */
const SLOW_MS = Number(process.env.SLOW_TEST_MS ?? 120_000);

/**
 * The record page layout (owner, 23 Sept 2026): the section tabs were cut off at /cancers/male-breast-cancer/#care
 * because the tab bar shared a grid row with the 300 px right column. The bar now spans the full content width and
 * the two columns start beneath it, and every tag chip in the right column is a link to its /tagged/ page.
 * Since the hub-and-sections layout (src/lib/record-sections.ts) a cancer's tabs are its ten sections; `care` is
 * the standard-of-care block inside Treatment and still resolves as an element id.
 */
const router: AppRouterInstance = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), bfcacheId: "static" };
const render = (id: string) => {
  const e = graph().get(id);
  expect(e, id).toBeDefined();
  return renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(EntityDetail, { e: e! })));
};

/** `<a` opened while another `<a` is open (SVG anchors aside): the browser lifts the inner one out and hydration fails. */
function nestedAnchors(html: string): number {
  let open = 0, svg = 0, found = 0;
  for (const m of html.matchAll(/<(\/?)(a|svg)(?=[\s>/])/g)) {
    if (m[2] === "svg") { svg = Math.max(0, svg + (m[1] ? -1 : 1)); continue; }
    if (svg > 0) continue;
    if (m[1]) { open = Math.max(0, open - 1); continue; }
    if (open > 0) found++;
    open++;
  }
  return found;
}

describe("record page layout", () => {
  for (const id of ["male-breast-cancer", "trastuzumab-deruxtecan"]) {
    it(`${id}: the tab bar spans the page above the two-column grid and the aside starts below it`, () => {
      const html = render(id);
      const bar = html.indexOf("data-tabbar");
      const grid = html.indexOf("data-tab-grid");
      const aside = html.indexOf("<aside");
      expect(bar, "tab bar rendered").toBeGreaterThan(-1);
      expect(grid, "two-column grid rendered").toBeGreaterThan(-1);
      expect(aside, "aside rendered").toBeGreaterThan(-1);
      // Bar first, then the grid that holds the sections and the aside: the bar is not a child of either column.
      expect(bar).toBeLessThan(grid);
      expect(grid).toBeLessThan(aside);
      // The wrapper that sticks and bleeds into the container padding is the bar's own, outside the grid.
      const wrap = html.indexOf("tabbar-wrap");
      expect(wrap).toBeGreaterThan(-1);
      expect(wrap).toBeLessThan(grid);
      expect(html.slice(grid, aside)).toContain('id="sec-overview"');
      expect(nestedAnchors(html)).toBe(0);
    }, SLOW_MS); // The first render loads the whole graph; under a loaded machine that alone passes the default budget.
  }

  it("the #care block exists on the male breast cancer page inside Treatment, so a hash link has a section to open", () => {
    const c = graph().must("male-breast-cancer");
    expect(c.kind).toBe("cancer");
    const html = render("male-breast-cancer");
    expect(html).toContain('data-id="treating-it"');
    // A small cancer keeps Treatment inline, so the standard-of-care block is on the hub with its id.
    expect(c.kind === "cancer" && planFor(c, "treating-it").placement).toBe("inline");
    expect(html).toContain('id="sec-treating-it"');
    expect(html).toContain('id="care"');
  });

  it("every tag chip is a link to its /tagged/ page", () => {
    const g = graph();
    const e = g.entities.find((x) => publicTags(x.tags).length >= 2)!;
    const html = render(e.id);
    const block = html.slice(html.indexOf("data-tag-chips"));
    const chips = block.slice(0, block.indexOf("</div>"));
    // next/link drops the trailing slash when rendered outside the Next build (the export adds it back), so compare without it.
    const hrefs = [...chips.matchAll(/<a[^>]*href="([^"]+)"/g)].map((m) => m[1].replace(/\/$/, ""));
    expect(hrefs).toEqual(publicTags(e.tags).map((t) => `/tagged/${tagSlug(t)}`));
    expect(chips).not.toMatch(/<span[^>]*class="chip[^"]*"[^>]*>[^<]*<\/span>/);
  });
});

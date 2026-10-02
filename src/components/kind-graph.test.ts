import { describe, expect, it, vi } from "vitest";
import { treatments } from "@/lib/supportive-care";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { KindGraph, KindGraphExperiment } from "./KindGraph";
import Home from "@/app/page";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS, type Kind } from "@/lib/kinds";
import { KG_MIN_LINKS, KG_POS, KIND_GRAPH_URL, edgeHref, edgeSentence, kindGraph, kindGraphFile, linksSentence } from "@/lib/kind-graph";
import { apiFiles, openApiDocument } from "../../scripts/api-layout";

const router: AppRouterInstance = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), bfcacheId: "static" };
const render = (el: React.ReactElement) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, el));
const KB = 1024;

/**
 * The kind graph (src/lib/kind-graph.ts, src/components/KindGraph.tsx): the edge weights are the graph's
 * own link counts, every kind is a plain anchor in the server markup, the whole block stays inside its byte budget,
 * the phone entry (the body map in entry mode with the strip beneath) and the list are in the same markup, and the
 * JSON twin is registered in the API layout and checked by the mobile audit at 390 px.
 */
describe("kind graph data", () => {
  const g = graph();
  const kg = kindGraph(g);
  const edge = (a: Kind, b: Kind) => kg.edges.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))?.links ?? 0;
  /** Distinct (x, y) pairs with x of kind `a` and y of kind `b` in x's neighbours: the number the edge must equal. */
  const pairsVia = (a: Kind, b: Kind) => g.kind(a).reduce((n, x) => n + (g.neighbours(x.id).get(b)?.length ?? 0), 0);

  it("counts cancer-trial links as the graph's neighbours do", () => {
    expect(edge("cancer", "trial")).toBeGreaterThan(1000);
    expect(edge("cancer", "trial")).toBe(pairsVia("cancer", "trial"));
    expect(pairsVia("cancer", "trial")).toBe(pairsVia("trial", "cancer"));
  });

  it("counts drug-company links as the graph's neighbours do", () => {
    expect(edge("drug", "company")).toBeGreaterThan(100);
    expect(edge("drug", "company")).toBe(pairsVia("drug", "company"));
  });

  it("has one node per populated kind with its count and route, and a positive total", () => {
    for (const k of KINDS) {
      const n = kg.nodes.find((x) => x.kind === k);
      if (g.kind(k).length === 0) { expect(n).toBeUndefined(); continue; }
      // The drug node counts treatments and tests only (supportive care medicines are excluded, src/lib/supportive-care.ts).
      expect(n?.count).toBe(k === "drug" ? treatments(g).length : g.kind(k).length);
      expect(n?.route).toBe(`/${KIND_META[k].route}/`);
      expect(KG_POS[k], `${k} has a position`).toBeTruthy();
    }
    expect(kg.total).toBe(g.entities.length - (g.kind("drug").length - treatments(g).length));
    expect(kg.links).toBe(kg.edges.reduce((s, e) => s + e.links, 0));
    expect(kg.edges.map((e) => e.links)).toEqual([...kg.edges.map((e) => e.links)].sort((x, y) => y - x));
  });

  it("phrases the tooltips in words and routes edge clicks to Explore or the smaller browser", () => {
    expect(linksSentence(kg, "cancer")).toMatch(/^Cancers link to [\d,]+ \w+, [\d,]+ \w+ and [\d,]+ [\w ]+\.$/);
    expect(edgeSentence({ a: "cancer", b: "trial", links: 4002, href: "" })).toBe("Cancers link to 4,002 trials");
    const counts = Object.fromEntries(kg.nodes.map((n) => [n.kind, n.count])) as Record<Kind, number>;
    expect(edgeHref("cancer", "trial", counts)).toBe("/explore/?kind=trial");
    expect(edgeHref("drug", "cancer", counts)).toBe("/explore/");
    expect(edgeHref("cancer", "person", counts)).toBe("/cancers/");
    expect(edgeHref("drug", "trial", counts)).toBe("/drugs/");
    expect(JSON.stringify(kindGraphFile(g))).not.toMatch(/—/);
  });
});

describe("kind graph markup", () => {
  // The graph moved to /experimental-upgrades/ on 2 October 2026 (the owner: it draws a single flow and the
  // corpus has feedback loops), so the drawing is asserted on the experiment and the list on what the home page
  // renders. Both still have to hold: the drawing is not abandoned, it is parked where its objection is written.
  const html = render(createElement(KindGraphExperiment));
  const homeKinds = render(createElement(KindGraph));
  const kg = kindGraph(graph());
  // The graph SVG: from its opening tag to the close of its last group (the glyphs inside are nested <svg>s of their own).
  const svgStart = html.indexOf('<svg viewBox="0 0 1040');
  const svg = html.slice(svgStart, html.indexOf("</g></svg>", html.indexOf('class="kg-nodes"')) + 10);
  const part = (from: string, to: string) => { const i = html.indexOf(from); const j = to ? html.indexOf(to, i) : html.length; return Buffer.byteLength(html.slice(i, j < 0 ? html.length : j), "utf8"); };
  const sizes = { graph: Buffer.byteLength(svg, "utf8"), body: part('class="kg-body"', 'class="kg-list"'), list: part('class="kg-list"', "") };
  console.log(`kind graph markup: graph ${Math.round(sizes.graph / KB)} KB, body ${Math.round(sizes.body / KB)} KB, list ${Math.round(sizes.list / KB)} KB, all ${Math.round(Buffer.byteLength(html, "utf8") / KB)} KB`);

  it("draws every kind node as an anchor with its glyph, count, label and route", () => {
    for (const n of kg.nodes) {
      const i = svg.indexOf(`data-kg="${n.kind}"`);
      expect(i, `${n.kind} node`).toBeGreaterThan(0);
      const open = svg.lastIndexOf("<a ", i);
      const node = svg.slice(open, svg.indexOf("</a>", i));
      expect(node).toContain(`href="${n.route}"`);
      expect(node).toContain(`>${n.count.toLocaleString("en-GB")}</text>`);
      expect(node).toContain(`>${n.label.replace(/&/g, "&amp;")}</text>`);
      expect(node).toContain("<svg");
      expect(node).toContain(`aria-label="${n.label.replace(/&/g, "&amp;")}: ${n.count.toLocaleString("en-GB")} records. `);
    }
    expect((svg.match(/class="kg-n"/g) ?? []).length).toBe(kg.nodes.length);
  });

  it("draws the edges above the threshold as anchors with widths that grow with links", () => {
    const drawn = kg.edges.filter((e) => e.a !== e.b && e.links >= KG_MIN_LINKS);
    expect((svg.match(/class="kg-e"/g) ?? []).length).toBe(drawn.length);
    const widthOf = (a: Kind, b: Kind) => Number(/stroke-width="([\d.]+)"/.exec(svg.slice(svg.indexOf(`data-kg="${a} ${b}"`)).split('class="kg-el"')[1])?.[1]);
    const [big, small] = [drawn[0], drawn.at(-1)!];
    expect(widthOf(big.a, big.b)).toBeGreaterThan(widthOf(small.a, small.b));
    expect(svg).toContain(`href="${big.href}"`);
  });

  it("stays under 60 KB of markup and carries the list and the kind links", () => {
    expect(sizes.graph, `graph svg ${Math.round(sizes.graph / KB)} KB`).toBeLessThan(60 * KB);
    expect(sizes.graph, "the svg was found whole").toBeGreaterThan(8 * KB);
    // The list is the front page's default view (owner's call, 25 September 2026), so the static markup carries
    // the list and the graph is the view that needs a parameter. Both are in the HTML either way; only which one
    // the CSS shows without JavaScript changes.
    expect(homeKinds).toContain('aria-label="Records by kind"');
    expect(homeKinds, "no graph on the home page").not.toContain('<svg viewBox="0 0 1040');
    expect(homeKinds, "and no toggle to one").not.toContain('href="/?view=graph"');
    expect(html).toContain('data-view="list"');
    expect(html).toContain('href="/?view=graph"');
    expect(html).toContain('aria-label="Records by kind"');
    // The owner took the body pill and the JSON chip off the row above the grid on 2 October 2026, so the home
    // page no longer renders a body map; /body/ is its page. The JSON stays discoverable through the
    // <link rel="alternate"> in the head, which is what a crawler or an agent reads, so that is asserted here
    // instead of the visible chip.
    expect(html).not.toContain('data-mobile-view="body-map"');
    expect(homeKinds).toContain(`rel="alternate" type="application/json" href="${KIND_GRAPH_URL}"`);
    // And the sentence counting the corpus is gone with them.
    expect(html).not.toContain("linked records in");
  });
});

describe("home page with the kind graph", () => {
  it("shows the counts grid, not the graph, and stays inside its markup budget", () => {
    const html = render(createElement(Home));
    expect(html).toContain('aria-label="Records by kind"');
    expect(html).not.toContain("linked objects, one page each");
    // 270 KB when the graph replaced the grid (Sept 2026); the budget leaves room for the spotlight and the lists to grow.
    expect(Buffer.byteLength(html, "utf8"), `home ${Math.round(Buffer.byteLength(html, "utf8") / KB)} KB`).toBeLessThan(360 * KB);
  });

  it("is registered as an API file with an OpenAPI path, and the body map is still audited on its own page", () => {
    const counts = Object.fromEntries(KINDS.map((k, i) => [k, i + 1])) as Record<Kind, number>;
    expect(apiFiles(counts).map((f) => f.path)).toContain(KIND_GRAPH_URL);
    expect(openApiDocument(counts, { built: "2026-09-24" }).paths).toHaveProperty([KIND_GRAPH_URL]);
    const audit = readFileSync(resolve(__dirname, "../../scripts/mobile-audit.ts"), "utf8");
    // The home-page tap was retired with the body pill on 2 October 2026. The map itself is still checked at
    // 390 px, twice, on the page it lives on, so dropping the entry point did not drop the coverage.
    expect(audit).not.toMatch(/route: "\/", view: "body-map"/);
    expect(audit.match(/route: "\/body\/", view: "body-map"/g) ?? []).toHaveLength(2);
  });
});

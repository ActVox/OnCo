import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CancerMapPage, { GRAPH_JSON } from "./page";
import { GET } from "./graph.json/route";
import { cancerDag } from "@/lib/cancer-dag";

/**
 * The cancer map page: the SVG stays under its HTML budget, every node is a link with a tooltip, the four badge
 * groups are all present for the client switch to choose between, and the outline repeats the structure in plain
 * lists. Rendered with react-dom/server the way the static export renders it.
 */
describe("cancer map page", () => {
  const html = renderToStaticMarkup(createElement(CancerMapPage));
  const svg = html.slice(html.indexOf('<svg width='), html.indexOf("</svg>", html.indexOf('<svg width=')) + 6);
  const d = cancerDag();

  it("keeps the SVG under 320 KB", () => {
    // Budget raised from 300 KB on 24 Sept 2026 when wave 4 (docs/CANCER-PAGES.md) took the map from 328 to 419 cancer
    // nodes and the SVG to 300.2 KB; each new entity page adds one node, one edge and one tooltip.
    expect(svg.length).toBeGreaterThan(10_000);
    expect(svg.length, `svg ${Math.round(svg.length / 1024)} KB`).toBeLessThan(320 * 1024);
  });

  it("draws every node as a link with a tooltip and every edge as a path", () => {
    expect(svg.match(/<a href=/g)?.length).toBe(d.stats.nodes);
    expect(svg.match(/<title[ >]/g)?.length).toBe(d.stats.nodes + 1);
    expect(svg.match(/<path class="e /g)?.length).toBe(d.stats.edges);
    for (const n of d.nodes.slice(0, 20)) expect(svg).toContain(`href="${n.route}"`);
  });

  it("carries every non-zero badge on a node so the switch only toggles visibility", () => {
    const n = d.nodes.find((x) => x.layer === "cancer" && x.counts.trials && x.counts.drugs && x.counts.approvals && x.counts.ideas)!;
    // The node is found by its route, which is the only copy of its id in the markup: the `data-id` attribute that
    // used to repeat it was removed on 29 September 2026 because it cost about 14 KB and nothing else read it.
    const node = svg.slice(svg.indexOf(`href="${n.route}"`), svg.indexOf("</a>", svg.indexOf(`href="${n.route}"`)));
    for (const c of ["bt", "bd", "ba", "bi"]) expect(node).toContain(`class="b ${c}"`);
    expect(node).toContain(`>${n.counts.trials.toLocaleString("en-GB")}</text>`);
  });

  it("repeats the structure as nested lists and links the JSON twin", () => {
    expect(html).toContain('aria-label="Cancer map as a list"');
    expect(html.match(/<li class="mt-1">/g)!.length).toBeGreaterThanOrEqual(d.stats.nodes);
    expect(html).toContain(`href="${GRAPH_JSON}"`);
    expect(html).toContain('"@type":"WebPage"');
  });

  it("serves the same graph as JSON", async () => {
    const res = GET();
    expect(res.headers.get("Content-Type")).toContain("application/json");
    const body = await res.json();
    expect(body.nodes).toHaveLength(d.stats.nodes);
    expect(body.edges).toHaveLength(d.stats.edges);
    expect(body.nodes[0].url).toMatch(/^https:\/\/onco\.cc\//);
    expect(body.stats.multiParent).toBe(d.stats.multiParent);
  });
});

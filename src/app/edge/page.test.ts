import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import RootLayout from "../layout";
import EdgePage from "./page";
import { EDGE_KINDS, EDGE_KIND_META, EDGE_PAGE_CAP, edgeFeed } from "@/lib/edge";
import { countEdgeKinds, edgeTypeSlug } from "@/lib/edge-kinds";
import { FOR_ME_FIRST } from "@/components/EdgeFilter";

/**
 * /edge/ as the static export renders it: the type pills with their counts, the For you pill in its no-cancer
 * state (the profile lives in the browser, so the server never knows a cancer), and every card carrying the kind
 * and record ids the client filter reads. The markup budget keeps the 200-card page from growing by stealth.
 */

// next/font needs the Next compiler; the layout only reads the class-name variables.
vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-sans" }), Geist_Mono: () => ({ variable: "font-geist-mono" }) }));

const router: AppRouterInstance = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), bfcacheId: "static" };
const render = (el: ReactElement) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(RootLayout, null, el)));
const KB = 1024;
const esc = (s: string) => s.replace(/&/g, "&amp;");
/** next/link renders "/edge/?type=x" as "/edge?type=x" outside the Next build (trailingSlash is a build setting); both are the same page. */
const hrefRe = (path: string, query = "") => new RegExp(`href="${path.replace(/\/$/, "")}/?${query ? `\\?${query.replace(/[-]/g, "\\-")}` : ""}"`);

describe("/edge/ filter markup", () => {
  const html = render(createElement(EdgePage));
  const items = edgeFeed(EDGE_PAGE_CAP);
  const counts = countEdgeKinds(items.map((it) => ({ kind: it.kind, refIds: [] })));

  it("renders one pill per kind with its glyph, plural label and count, none pressed", () => {
    const group = html.slice(html.indexOf('aria-label="Show only"'), html.indexOf('data-edge-count'));
    for (const k of EDGE_KINDS) {
      const i = group.indexOf(`<span>${esc(EDGE_KIND_META[k].plural)}</span>`);
      expect(i, `${k} pill`).toBeGreaterThan(-1);
      expect(group.slice(i, i + 120)).toContain(`>${counts[k]}</span>`);
      expect(group.lastIndexOf(`<path d="${EDGE_KIND_META[k].path}"`, i)).toBeGreaterThan(-1);
    }
    expect(group.match(/aria-pressed="true"/g)).toBeNull();
    expect((group.match(/aria-pressed="false"/g) ?? []).length).toBe(EDGE_KINDS.length);
    expect(group).not.toContain(">Clear<");
    expect(html).toContain(`<span class="tabular-nums">${items.length}</span> items on this page.`);
  });

  it("shows For you as a link to For me with the tooltip while no cancer is chosen", () => {
    const forYou = html.match(/<a [^>]*title="Choose your cancer in For me first"[^>]*>/)?.[0];
    expect(forYou, "For you link").toBeTruthy();
    expect(forYou).toMatch(hrefRe("/for-me/"));
    expect(forYou).toContain('aria-disabled="true"');
    expect(forYou).toContain(`title="${FOR_ME_FIRST}"`);
  });

  it("gives every card its kind and record ids, and links its kind pill to the ?type= view", () => {
    const cards = html.match(/<li data-kind="[a-z]+" data-refs="[^"]*"/g) ?? [];
    expect(cards.length).toBe(items.length);
    // The filter finds a card by the records it names, so a card that names one must carry it in the markup. Some
    // cards legitimately name none: a proposal to add a product OnCo does not hold yet has no record to point at,
    // and nor does a site issue. A flat 90 per cent share failed the day a weekly run produced fifteen new-product
    // proposals, which was the measure being wrong rather than the page. So compare the markup with the feed, and
    // keep a ceiling on the unlinkable share so that refs being dropped still fails.
    const withRefs = cards.filter((c) => !/data-refs=""/.test(c)).length;
    const linkable = items.filter((it) => it.refs.length > 0).length;
    expect(withRefs, "every card that names a record carries it").toBe(linkable);
    expect(items.length - linkable, "cards that can name no record").toBeLessThan(items.length * 0.2);
    for (const k of EDGE_KINDS) if (counts[k] > 0) {
      const pill = html.match(new RegExp(`<a [^>]*data-edge-type="${k}"[^>]*>`))?.[0];
      expect(pill, `${k} kind pill`).toBeTruthy();
      expect(pill).toMatch(hrefRe("/edge/", `type=${edgeTypeSlug(k)}`));
    }
  });

  it("stays within its markup budget", () => {
    expect(Buffer.byteLength(html, "utf8"), "edge markup").toBeLessThan(420 * KB);
  });
});

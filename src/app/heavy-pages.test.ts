import { describe, expect, it, vi } from "vitest";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext, type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import RootLayout from "./layout";
import Explore from "./explore/page";
import ForMe from "./for-me/page";
import NavigatorPage from "./navigator/page";
import ExplainedPage from "./explained/page";
import IdeaRankingsPage from "./ideas/rankings/page";
import { EXPLORE_PAGE } from "@/lib/explore-kinds";
import { RANK_PAGE, rankAll } from "@/lib/idea-rankings";
import EvidencePage from "./evidence/page";
import ChinaPage from "./countries/cn/page";
import Universities from "./universities/page";
import AuditPage from "./audit/page";
import PathwayDrugsPage from "./pathway-drugs/page";
import DossierPage from "./dossiers/[id]/page";
import Startups from "./startups/page";
import Genome from "./targets/genome/page";
import { genomeHub } from "@/lib/tables/genome";
import { GENOME_TABLE } from "@/lib/genome-hub";
import { kindBrowser } from "@/lib/tables/kinds";
import { EVIDENCE_TIER_LABEL, TARGET_ROLE_LABEL, routeFor } from "@/lib/kinds";
import KindIndex from "./[kind]/page";
import EntityPage from "./[kind]/[id]/page";
import { defaultOpen, roadmapFile, WATCH_PAGE } from "@/lib/roadmap-eras";
import EngineHub from "./pipeline/engine/page";
import EngineFormat from "./pipeline/engine/[format]/page";
import { FORMATS } from "@/lib/modular-formats";
import { formatIndex } from "@/lib/modular";
import TaggedPage from "./tagged/[tag]/page";
import TimelinePage from "./timeline/page";
import { CONTINUOUS_FROM } from "@/lib/years";
import { findings, series } from "@/lib/timeline";
import { allTags } from "@/lib/tags";
import { KIND_PAGE, SECTION_PAGE, TABLE_PAGE } from "@/lib/static-tables";
import { PAGED_KINDS } from "@/lib/tables/kinds";
import { KIND_META, KINDS } from "@/lib/kinds";
import { EXPLAINED_PAGE, explainedGroups } from "@/lib/explained-data";
import { PAPER_CARDS } from "@/components/record-blocks";
import { dossierFile } from "@/components/Dossier";
import { graph } from "@/lib/graph";

/** Text as React renders it into the markup, so an assertion can look for a sentence that contains an apostrophe. */
const escapeText = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

/**
 * The four heaviest exported pages used to ship every row in the HTML (and again in the hydration payload):
 * /explore/ 10.5 MB, /for-me/ 13.2 MB, /navigator/ 8.8 MB. They now carry a first page of rows (Explore) or the
 * chooser list alone (For me, Navigator) and fetch the rest per section from static JSON. This test keeps it so.
 *
 * The RSC payload cannot be produced in vitest, but its size follows the props the pages pass, and those are what
 * the static markup renders from; a budget on the markup guards both.
 */

// next/font needs the Next compiler; the layout only reads the class-name variables.
vi.mock("next/font/google", () => ({ Geist: () => ({ variable: "font-geist-sans" }), Geist_Mono: () => ({ variable: "font-geist-mono" }) }));

const router: AppRouterInstance = { push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), bfcacheId: "static" };
const render = (el: ReactElement) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(RootLayout, null, el)));
const KB = 1024;
/**
 * How close to its budget a page may come before the test fails. A budget met exactly is a cliff edge: the next link
 * added to a roadmap, or the next wave of registry trials under a target, breaks the build with no room to think, and
 * the page gets hand-trimmed to fit rather than made robust. Failing at 85 percent of the budget catches the growth
 * while the cause can still be found and fixed. Raise it only with a measured reason, never to make a test pass.
 */
const MARGIN = 0.85;
const ROADMAP_BUDGET = 300 * KB, DOSSIER_BUDGET = 450 * KB;
/**
 * What one row of a kind browser may cost in markup, the per-row half of the 640 KB total below. The heaviest row
 * today is an idea at 5,169 bytes; the budget leaves room for about one more chip a row before it fails, which is
 * the point at which the furniture, not the corpus, is what grew. Raise it only with a measured reason.
 */
const ROW_BUDGET = 6500;
const bodyRows = (html: string) => (html.match(/<tbody[^>]*>[\s\S]*?<\/tbody>/g) ?? []).map((t) => (t.match(/<tr[\s>]/g) ?? []).length);

describe("heavy pages page their sections", () => {
  it("explore renders at most one page of rows per section plus the Show more sentinel", () => {
    const html = render(createElement(Explore));
    const rows = bodyRows(html);
    expect(rows.length).toBeGreaterThan(0);
    for (const n of rows) expect(n).toBeLessThanOrEqual(EXPLORE_PAGE);
    expect(rows[0]).toBe(EXPLORE_PAGE);
    expect(html).toContain("data-more");
    expect(html).toContain("Show 30 more");
    // Real rows for search engines: named products with their pages.
    expect(html).toMatch(/href="\/drugs\/[a-z0-9-]+\/?"/);
    expect(Buffer.byteLength(html, "utf8"), "explore markup").toBeLessThan(400 * KB);
  });

  it("for me renders the cancer tiles and none of the per-cancer lists", () => {
    const html = render(createElement(ForMe));
    expect(html).toContain("Start by choosing a cancer type above.");
    // The tile grid is real content (every cancer named with its one-line TL;DR); the lists behind each tile are not.
    expect(html).toContain("Or tap one");
    expect(html).toContain("Triple-negative breast cancer");
    expect(html).not.toContain("Coming down the pipeline");
    // 328 tiles with a TL;DR and an organ icon each: 441 KB when written, against 13.2 MB before.
    //
    // Measured without the chrome, because the chrome is not this page's. Adding one nav entry costs about
    // 118 bytes of footer markup on every page in the site, so a total including it grows whenever the site
    // gains a section and has to be raised for a reason that has nothing to do with the tile grid. That is the
    // same fault the explained page's budget had, and the same fix: measure the thing the budget is about.
    // The chrome is still watched, on its own terms, in the assertion below.
    const bare = renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, createElement(ForMe)));
    expect(Buffer.byteLength(bare, "utf8"), "for me tiles").toBeLessThan(600 * KB);
    const chrome = Buffer.byteLength(html, "utf8") - Buffer.byteLength(bare, "utf8");
    expect(chrome / KB, `the chrome around every page is ${(chrome / KB).toFixed(1)} KB`).toBeLessThan(120);
  });

  it("explained renders every cancer heading, the first ten rows of each section and the Show more sentinel", () => {
    const html = render(createElement(ExplainedPage));
    const groups = explainedGroups(graph());
    const placements = groups.reduce((n, grp) => n + grp.trials.length, 0);
    const unique = new Set(groups.flatMap((grp) => grp.trials.map((t) => t.id)));
    expect(placements).toBeGreaterThan(1000);
    // Listed once: every trial's full row is in the first cancer section it appears in (`own`); the later sections
    // list it as a pill (`refs`) that opens that row.
    expect(groups.reduce((n, grp) => n + grp.own.length, 0)).toBe(unique.size);
    expect(groups.reduce((n, grp) => n + grp.refs.length, 0)).toBe(placements - unique.size);
    // One section per cancer, in order, each with its heading, trial count and at most EXPLAINED_PAGE full rows
    // (heading, summary, page link, Open explanation pill); the rest of the rows come from /api/v1/explained/<id>.json.
    const sections = html.split('<section id="cancer-').slice(1);
    expect(sections).toHaveLength(groups.length);
    sections.forEach((s, i) => {
      const grp = groups[i];
      expect(s.startsWith(`${grp.key}"`), grp.key).toBe(true);
      expect((s.match(/<details[\s>]/g) ?? []).length, grp.key).toBe(Math.min(EXPLAINED_PAGE, grp.own.length));
      expect(s, grp.key).toContain(`>${grp.trials.length} trial`);
    });
    const firstPage = groups.reduce((n, grp) => n + Math.min(EXPLAINED_PAGE, grp.own.length), 0);
    expect(firstPage).toBeLessThan(unique.size);
    expect((html.match(/<details[\s>]/g) ?? []).length).toBe(firstPage);
    // The row's markup is bare (one class; the card, arrow and "Open explanation" pill are CSS in globals.css).
    expect((html.match(/class="explained-row"><summary><h3><a /g) ?? []).length).toBe(firstPage);
    expect(html).not.toContain("Open explanation");
    // Every section with more rows carries the IntersectionObserver sentinel and the Show more pill, and a noscript
    // list of the rows beyond the first page so that crawlers and readers without JavaScript see every trial's name
    // and page link. Pills beyond the first page also come from the file.
    const paged = groups.filter((grp) => grp.own.length > EXPLAINED_PAGE);
    expect(paged.length).toBeGreaterThan(0);
    expect((html.match(/data-more/g) ?? []).length).toBe(paged.length);
    expect(html).toContain(`Show ${EXPLAINED_PAGE} more`);
    expect((html.match(/<noscript>/g) ?? []).length).toBe(paged.length);
    expect((html.match(/<a href="#[a-z0-9-]+" class="chip explained-ref"/g) ?? []).length).toBe(groups.reduce((n, grp) => n + Math.min(EXPLAINED_PAGE, grp.refs.length), 0));
    const linked = new Set([...html.matchAll(/href="\/trials\/([a-z0-9-]+)\/?"/g)].map((m) => m[1]));
    for (const id of unique) expect(linked.has(id), id).toBe(true);
    // The explainer's own kicker and disclaimer only appear once a row is opened and its section file fetched.
    expect(html).not.toContain("In plain words</div>");
    expect(html).not.toContain("Numbers are from the trial as recorded here");
    // 14.2 MB of HTML before; 981 KB of markup with every row as a client component's props (the hydration payload
    // then adds compact JSON rather than a second copy of the tree); 1,135 KB after the standard-of-care and registry
    // waves of 22 Sept 2026. Paging the sections at EXPLAINED_PAGE rows, one sprite for the organ drawings and CSS
    // classes for the section furniture brought it under 600 KB; the markup now grows with the number of cancers
    // that have explained trials (one section each) and, through the noscript lists, slowly with the trials' names.
    // 603 KB after the registry outcomes pass of 24 Sept 2026 (130 more trials with posted results, six new sections).
    // 653 KB after the pancreatic deep dive of 24 Sept 2026 (32 hand-written trials with outcomes across the pancreatic
    // stage and biomarker sections, plus the UK, living and evidence layers); budget raised from 640 to 680 KB.
    // The total was raised three times in three waves (640, then 680, then 700 KB) and each raise was defensible,
    // which is the problem: a number that has to be raised every time the corpus learns something is measuring the
    // corpus, not the page. What a budget is for is furniture, the per-row and per-section cost that creeps up when
    // a chip gains a wrapper or a row gains an attribute. So measure that directly and let the total follow.
    //
    // The page shows at most EXPLAINED_PAGE rows and EXPLAINED_PAGE pills per cancer section, so its size is
    // sections times the cost of a section. A wave that fills an under-filled section adds rows at the known cost
    // and passes; a change that makes every row heavier fails here however few rows there are.
    const bytes = Buffer.byteLength(html, "utf8");
    const rowBytes = (html.match(/<details[\s>][\s\S]*?<\/details>/g) ?? []).reduce((n, r) => n + Buffer.byteLength(r, "utf8"), 0);
    const rowCount = (html.match(/<details[\s>]/g) ?? []).length;
    const pillBytes = [...html.matchAll(/<a href="#[a-z0-9-]+" class="chip explained-ref"[\s\S]*?<\/a>/g)].reduce((n, m) => n + Buffer.byteLength(m[0], "utf8"), 0);
    const pillCount = (html.match(/class="chip explained-ref"/g) ?? []).length;
    expect(rowBytes / rowCount, `a row costs ${(rowBytes / rowCount).toFixed(0)} bytes`).toBeLessThan(500);
    expect(pillBytes / pillCount, `a pill costs ${(pillBytes / pillCount).toFixed(0)} bytes`).toBeLessThan(120);
    expect(bytes / sections.length, `a section costs ${(bytes / sections.length / KB).toFixed(1)} KB`).toBeLessThan(9 * KB);
    // The ceiling is the point at which paging itself would have to change rather than the budget being raised.
    expect(bytes / (1024 * KB), `explained markup is ${(bytes / KB).toFixed(1)} KB of its 1 MB ceiling`).toBeLessThan(MARGIN);
  });

  it("idea rankings renders the first page of every view plus the Show more sentinel", () => {
    const html = render(createElement(IdeaRankingsPage));
    const views = rankAll(RANK_PAGE).filter((v) => v.available);
    const lists = (html.match(/<ol[^>]*data-rank-list[^>]*>[\s\S]*?<\/ol>/g) ?? []).map((l) => (l.match(/<li[\s>]/g) ?? []).length);
    // One list per available view, each capped at the first page; the default view fills its page.
    expect(lists).toHaveLength(views.length);
    expect(lists).toEqual(views.map((v) => Math.min(RANK_PAGE, v.ranked)));
    expect(lists[0]).toBe(RANK_PAGE);
    for (const v of views) expect(html).toContain(`id="h-${v.view.id}"`);
    // Every view but the default is hidden until picked; readers without JavaScript see them all through the noscript rule.
    expect((html.match(/<section[^>]*data-rank-panel[^>]*hidden/g) ?? []).length).toBe(views.length - 1);
    expect(html).toContain("[data-rank-panel][hidden]{display:block}");
    expect(html).toContain("data-more");
    expect(html).toContain("Show 30 more");
    // Real rows for search engines: named ideas with their pages and cancers.
    expect(html).toMatch(/href="\/ideas\/[a-z0-9-]+\/?"/);
    expect(html).toMatch(/href="\/cancers\/[a-z0-9-]+\/?"/);
    // 2.2 MB of HTML before (the top 50 of every view as rendered trees, twice over); 559 KB of markup when written, with the
    // first 30 of each view as compact props (155 KB) and the chip glyphs as one sprite sheet.
    expect(Buffer.byteLength(html, "utf8"), "idea rankings markup").toBeLessThan(700 * KB);
  });

  it("navigator renders the profile bar and nothing per cancer", () => {
    const html = render(createElement(NavigatorPage));
    expect(html).toContain("Not medical advice.");
    expect(Buffer.byteLength(html, "utf8"), "navigator markup").toBeLessThan(200 * KB);
  });
});

/**
 * The hand-written tables moved onto a client StaticTable in chain 97, which put every row into the page twice
 * (rendered HTML plus the hydration payload): /evidence/ 6.2 MB, /pathway-drugs/ 4.0 MB, /dossiers/pd1/ 2.1 MB,
 * /countries/cn/ 1.9 MB, /audit/ 1.6 MB, /universities/ 1.5 MB when measured on 22 Sept 2026 (docs/TABLES.md).
 * Each now carries the first TABLE_PAGE rows of every long table and fetches the rest from /api/v1/tables/
 * (src/lib/static-tables.ts, scripts/build-tables.ts). The budgets here are on the markup; the payload follows it.
 */
describe("paged tables carry one page of rows", () => {
  const pagedTable = (html: string, rows: number[], total: number) => {
    expect(rows.length).toBeGreaterThan(0);
    for (const n of rows) expect(n).toBeLessThanOrEqual(TABLE_PAGE);
    expect(html).toContain("data-more");
    expect(html).toContain(`Show ${TABLE_PAGE} more`);
    expect(html).toContain(total.toLocaleString("en-GB"));
  };

  it("evidence renders the first 30 trials of 3,000+ and the Show more sentinel", () => {
    const html = render(createElement(EvidencePage));
    const total = graph().kind("trial").length;
    expect(total).toBeGreaterThan(3000);
    pagedTable(html, bodyRows(html), total);
    expect(html).toMatch(/href="\/trials\/[a-z0-9-]+\/?"/);
    // 131 KB when written (the twelve pictograms are most of it), against 6.2 MB of HTML before.
    expect(Buffer.byteLength(html, "utf8"), "evidence markup").toBeLessThan(160 * KB);
  });

  it("china renders the first 30 key trials and every deal", () => {
    const html = render(createElement(ChinaPage));
    const rows = bodyRows(html);
    expect(rows.some((n) => n === TABLE_PAGE)).toBe(true);
    expect(html).toContain("data-more");
    expect(html).toContain(`Show ${TABLE_PAGE} more`);
    expect(Buffer.byteLength(html, "utf8"), "china markup").toBeLessThan(300 * KB);
  });

  it("universities renders one page of each of its three tables", () => {
    const html = render(createElement(Universities));
    const rows = bodyRows(html);
    expect(rows.length).toBe(3);
    for (const n of rows) expect(n).toBe(TABLE_PAGE);
    expect((html.match(/data-more/g) ?? []).length).toBe(3);
    expect(html).toMatch(/href="\/institutions\/[a-z0-9-]+\/?"/);
    expect(Buffer.byteLength(html, "utf8"), "universities markup").toBeLessThan(200 * KB);
  });

  it("audit renders at most one page per findings table", () => {
    const html = render(createElement(AuditPage));
    const rows = bodyRows(html);
    expect(rows.length).toBeGreaterThan(5);
    // The "moved links" table is plain and capped at 150; every StaticTable is paged.
    for (const n of rows) expect(n).toBeLessThanOrEqual(150);
    expect(rows.filter((n) => n > TABLE_PAGE).length).toBeLessThanOrEqual(1);
    expect(html).toContain("data-more");
    expect(Buffer.byteLength(html, "utf8"), "audit markup").toBeLessThan(450 * KB);
  });

  it("pathway drugs renders the first 30 pathways in the matrix and the first 10 node sections", () => {
    const html = render(createElement(PathwayDrugsPage));
    const rows = bodyRows(html);
    expect(rows[0]).toBe(TABLE_PAGE);
    // The matrix plus one node table per section on the page (the largest sections come first, so fewer of them).
    expect(rows.length).toBe(1 + SECTION_PAGE);
    expect((html.match(/data-more/g) ?? []).length).toBe(2);
    expect(html).toContain(`Show ${SECTION_PAGE} more`);
    expect(html).toMatch(/href="\/pathways\/[a-z0-9-]+\/?"/);
    // 320 KB when written (ten sections of the largest pathways), against 4.0 MB of HTML before.
    expect(Buffer.byteLength(html, "utf8"), "pathway drugs markup").toBeLessThan(400 * KB);
  });

  it("startups renders the first 30 startups in the browser and the investors table", () => {
    const html = render(createElement(Startups));
    const rows = bodyRows(html);
    expect(rows[0]).toBe(TABLE_PAGE);
    for (const n of rows) expect(n).toBeLessThanOrEqual(TABLE_PAGE);
    expect(html).toContain("data-more");
    expect(html).toContain(`Show ${TABLE_PAGE} more`);
    expect(html).toMatch(/href="\/companies\/[a-z0-9-]+\/?"/);
    // 1.2 MB of HTML before, the browser's rows shipped twice; the budget is on the markup.
    expect(Buffer.byteLength(html, "utf8"), "startups markup").toBeLessThan(250 * KB);
  });

  it("the open drug engine hub carries counts only, and every format page one page of grid rows", async () => {
    const hub = render(createElement(EngineHub));
    expect(hub).toContain("What open drug development means here");
    for (const f of FORMATS) expect(hub).toMatch(new RegExp(`href="/pipeline/engine/${f.id}/?"`));
    expect(Buffer.byteLength(hub, "utf8"), "engine hub markup").toBeLessThan(150 * KB);
    for (const f of FORMATS) {
      const html = render(await EngineFormat({ params: Promise.resolve({ format: f.id }) }));
      const idx = formatIndex(f.id)!;
      const rows = bodyRows(html);
      // The first tbody is the grid table (the proposals table only renders when proposals exist).
      expect(rows[0], f.id).toBe(Math.min(TABLE_PAGE, idx.cells.length));
      if (idx.cells.length > TABLE_PAGE) { expect(html, f.id).toContain("data-more"); expect(html, f.id).toContain(`Show ${Math.min(TABLE_PAGE, idx.cells.length - TABLE_PAGE)} more`); }
      // The heat grid renders every column and at most its first GRID_FIRST_ROWS rows (data-col and data-row mark the headers).
      expect((html.match(/data-col="/g) ?? []).length, f.id).toBe(idx.cols.length + 1);
      expect((html.match(/data-row="/g) ?? []).length, f.id).toBe(Math.min(40, idx.rows.length));
      expect(html, f.id).toContain('id="stopped"');
      expect(html, f.id).toContain('id="unresolved"');
      expect(html, f.id).toContain(`href="/api/v1/pipeline/engine/${f.id}.json"`);
      // Small molecules: 100 targets by 17 classes; the props for the grid and the first page of rows must stay light.
      expect(Buffer.byteLength(html, "utf8"), `engine ${f.id} markup`).toBeLessThan(450 * KB);
    }
  });

  it("the gene hub renders the first 30 genes of every role, the whole counts, the Show more sentinel and the JSON link", () => {
    const html = render(createElement(Genome));
    const hub = genomeHub();
    expect(hub.genes.length).toBeGreaterThan(1000);
    expect(hub.more).toEqual({ total: hub.genes.length, src: `/api/v1/tables/${GENOME_TABLE}.json` });
    // One section per role that has genes, in role order, each with its whole count and at most TABLE_PAGE chips.
    const sections = html.split('<section class="mt-10 scroll-mt-28" id="').slice(1);
    expect(sections).toHaveLength(hub.sections.length);
    sections.forEach((s, i) => {
      const sec = hub.sections[i];
      expect(s.startsWith(`${sec.role}"`), sec.role).toBe(true);
      expect((s.match(/class="chip border bg-card/g) ?? []).length, sec.role).toBe(Math.min(TABLE_PAGE, sec.total));
      expect(s, sec.role).toContain(`${sec.total.toLocaleString("en-GB")}</span>`);
      // The role's split by evidence tier, each a deep link into this hub.
      for (const tier of Object.keys(sec.tiers)) expect(s, `${sec.role} ${tier}`).toContain(`href="/targets/genome/?role=${sec.role}&amp;evidence=${tier}"`);
    });
    const paged = hub.sections.filter((s) => s.total > TABLE_PAGE);
    expect(paged.length).toBeGreaterThan(0);
    expect((html.match(/data-more/g) ?? []).length).toBe(paged.length);
    expect(html).toContain(`Show ${TABLE_PAGE} more`);
    expect(html).toContain(hub.genes.length.toLocaleString("en-GB"));
    // Real chips for search engines: gene symbols linking to their pages, and the role and evidence pills with counts.
    expect(html).toMatch(/href="\/targets\/[a-z0-9-]+\/?"/);
    for (const s of hub.sections) expect(html).toContain(`href="/targets/genome/?role=${s.role}"`);
    for (const tier of Object.keys(hub.tiers)) expect(html).toContain(`href="/targets/genome/?evidence=${tier}"`);
    // Crawlers and agents reach every gene without the sections' fetch.
    expect(html).toContain("data-genome-export");
    expect(html).toContain(`href="/api/v1/tables/${GENOME_TABLE}.json"`);
    // The target browser's role and evidence facets page the same set: every label the hub uses is a counted facet value in kind-targets.
    const counts = kindBrowser("target").counts;
    for (const s of hub.sections) expect(counts.role.find(([v]) => v === TARGET_ROLE_LABEL[s.role])?.[1], s.role).toBe(s.total);
    for (const [tier, n] of Object.entries(hub.tiers)) expect(counts.evidence.find(([v]) => v === EVIDENCE_TIER_LABEL[tier as keyof typeof EVIDENCE_TIER_LABEL])?.[1], tier).toBe(n);
    // 940 KB of markup (2,083 chips: 1,447 genes under every role each holds) and 2.1 MB of HTML before; the budget is on the markup.
    expect(Buffer.byteLength(html, "utf8"), "genome hub markup").toBeLessThan(600 * KB);
  });

  it("the PD-1 dossier renders the first 30 of its hundreds of trials and links its export rather than carrying it", async () => {
    const html = render(await DossierPage({ params: Promise.resolve({ id: "pd1" }) }));
    expect(html).toContain('id="trials"');
    const trials = bodyRows(html);
    for (const n of trials) expect(n).toBeLessThanOrEqual(TABLE_PAGE);
    expect(html).toContain("data-more");
    // The dossier JSON is a built file (scripts/build-api.ts), not a data: URI: the inline copy held every product,
    // trial, paper, hotspot, question and assay percent-encoded, 295 KB of 469 KB, and grew with the corpus.
    expect(html).toContain(`href="${dossierFile("pd1")}"`);
    expect(html).not.toContain("data:application/json");
    // 377 KB when written (the products matrix and resistance routes are most of it), against 2.1 MB of HTML before;
    // 170 KB once the export moved to its own file.
    expect(Buffer.byteLength(html, "utf8"), "pd1 dossier markup").toBeLessThan(DOSSIER_BUDGET);
  });

  /**
   * Every dossier, not just the largest of the day: the page grows with the corpus around its target (PD-1 passed the
   * budget when 661 colorectal registry trials landed), so the guard has to hold for whichever target grows next, and
   * with the same 15 percent margin as the roadmaps, while there is still room to fix the cause.
   */
  it("every target dossier stays 15 percent clear of its budget", async () => {
    const worst: Array<[string, number]> = [];
    for (const t of graph().kind("target")) {
      const html = render(await DossierPage({ params: Promise.resolve({ id: t.id }) }));
      worst.push([t.id, Buffer.byteLength(html, "utf8")]);
    }
    worst.sort((a, b) => b[1] - a[1]);
    const [id, bytes] = worst[0];
    expect(bytes / DOSSIER_BUDGET, `the heaviest dossier is /dossiers/${id}/ at ${(bytes / KB).toFixed(1)} KB, ${((bytes / DOSSIER_BUDGET) * 100).toFixed(1)} percent of its ${DOSSIER_BUDGET / KB} KB budget`).toBeLessThan(MARGIN);
  });
});

/**
 * The kind browsers shipped every row twice over: /trials/ 7.8 MB, /key-papers/ 3.7 MB, /ideas/ 2.9 MB, /drugs/ 2.8 MB,
 * /people/ 2.6 MB, /cancers/ 1.9 MB, /companies/ 1.7 MB, /terms/ 1.3 MB, /institutions/ 1.1 MB, /technologies/ 1.0 MB,
 * /targets/ 724 KB when measured on 22 Sept 2026 (docs/TABLES.md). Each now carries its first KIND_PAGE rows in the
 * default order plus whole-table facet counts, and fetches the rest from /api/v1/tables/kind-<route>.json
 * (src/lib/tables/kinds.ts). The budget is on the markup; the payload follows the same props.
 */
describe("kind browsers carry one page of rows", () => {
  const kindPage = (kind: (typeof KINDS)[number]) => KindIndex({ params: Promise.resolve({ kind: KIND_META[kind].route }) });

  for (const k of PAGED_KINDS) {
    it(`${KIND_META[k].route} renders the first ${KIND_PAGE} rows, the Show more sentinel and the whole-set JSON link`, async () => {
      const html = render(await kindPage(k));
      const total = graph().kind(k).length;
      expect(total).toBeGreaterThan(KIND_PAGE);
      const rows = bodyRows(html);
      expect(rows[0], "browser rows").toBe(KIND_PAGE);
      for (const n of rows) expect(n).toBeLessThanOrEqual(KIND_PAGE);
      expect(html).toContain("data-more");
      expect(html).toContain(`Show ${KIND_PAGE} more`);
      expect(html).toContain(total.toLocaleString("en-GB"));
      // Real rows for search engines: named records with their pages.
      expect(html).toMatch(new RegExp(`href="/${KIND_META[k].route}/[a-z0-9-]+/?"`));
      // Crawlers and agents reach every record without the table's fetch: the kind's JSON and CSV under /api/v1/.
      expect(html).toContain("data-kind-export");
      expect(html).toContain(`href="/api/v1/${encodeURIComponent(KIND_META[k].plural)}.json"`);
      expect(html).toContain(`href="/api/v1/${encodeURIComponent(KIND_META[k].plural)}.csv"`);
      // Budget raised from 600 to 640 KB on 24 Sept 2026 when wave 4 (docs/CANCER-PAGES.md) took the cancer browser to 435
      // records and its markup to 600.6 KB with the first page of rows unchanged at 60.
      expect(Buffer.byteLength(html, "utf8"), `${KIND_META[k].route} markup`).toBeLessThan(640 * KB);
      // What the total cannot tell apart: a browser that grows because the corpus did (more records, a longer count
      // line, more facet values in the pickers) and one that grows because every row got heavier. A page shows
      // KIND_PAGE rows whatever the corpus holds, so the cost of a row is the thing to hold down. Measured on
      // 25 Sept 2026, with the cells that hold a facet value turned into filters: ideas 5,169 B a row (six columns,
      // four of them chips), drugs 4,379 (4,053 before), trials 4,254 (3,980 before), targets 4,206, key papers
      // 3,866, cancers 3,361, people 3,341, companies 3,110, technologies 2,806 (2,584 before), institutions 2,774,
      // terms 2,016. A chip costs about 260 bytes of markup, so a column turned into a filter shows up here at once.
      const body = (html.match(/<tbody[^>]*>[\s\S]*?<\/tbody>/) ?? [""])[0];
      const perRow = Buffer.byteLength(body, "utf8") / Math.max(1, (body.match(/<tr[\s>]/g) ?? []).length);
      expect(perRow / ROW_BUDGET, `a ${KIND_META[k].route} row costs ${perRow.toFixed(0)} bytes of markup, ${((perRow / ROW_BUDGET) * 100).toFixed(1)} percent of the ${ROW_BUDGET} byte budget`).toBeLessThan(MARGIN);
    });
  }

  it("a small kind (roadmaps) still ships every row and no sentinel", async () => {
    const html = render(await kindPage("roadmap"));
    expect(bodyRows(html)[0]).toBe(graph().kind("roadmap").length);
    expect(html).not.toContain("data-more");
    expect(html).not.toContain("data-kind-export");
  });
});

/**
 * The roadmap pages grew with the deep spikes: /roadmaps/tnbc-roadmap/ was 1.0 MB on the wire and
 * /roadmaps/gallbladder-cancer-roadmap/ 680 KB (461 KB and 308 KB of markup) on 24 Sept 2026, because every era
 * rendered its records inline twice (the Steps pills and the Story cards with TL;DRs). Each era's body now sits
 * behind a "Show era" pill that fetches /api/v1/roadmaps/<id>.json (src/lib/roadmap-eras.ts), the first and the
 * current era open by default, the story's summaries and cards come from the same file and the watch table pages past
 * WATCH_PAGE: 296 KB and 215 KB of markup after. What remains is the record chrome every page carries (the Connected
 * tab and the key papers are most of it), which grows with the roadmap's links rather than with its eras.
 *
 * That chrome used to grow with the weekly citation refresh as well: every key paper was a card with its journal,
 * year, what-it-means and a "cited N times" pill whose 380-byte glyph was drawn per card, and the pill appears only
 * once Europe PMC has a count for that paper, so filling in the missing counts (scripts/fetch-citations.ts, run by
 * .github/workflows/refresh-pulse.yml) pushed /roadmaps/pancreatic-roadmap/ to 317 KB and /roadmaps/tnbc-roadmap/ to
 * 315 KB on 25 September 2026. A reference now costs the same however much is known about it: the pills carry the
 * kind's colours as one short class (`refChipClass`, src/lib/text.ts), a record shows the newest PAPER_CARDS key
 * papers as cards and the rest as pills, and the citation glyph comes from a sprite. 298 KB before and 234 KB after
 * on the pancreatic roadmap, with every count in the snapshot filled in.
 *
 * MARGIN is the second half of the guard: a page within 15 percent of the budget fails here, while there is still
 * room to fix the cause, rather than at the cliff edge where the next link added breaks the build.
 */
describe("roadmap pages collapse their eras", () => {
  const escape = escapeText;
  const roadmaps = graph().kind("roadmap");
  it("has roadmaps with more than two eras and a watch table longer than a page to test", () => {
    expect(roadmaps.length).toBeGreaterThan(20);
    expect(roadmaps.some((r) => r.steps.length > 10)).toBe(true);
    expect(roadmaps.some((r) => r.watch.length > 0)).toBe(true);
  });
  for (const r of roadmaps) {
    it(`/roadmaps/${r.id}/ keeps every era's heading and summary, opens the first and current eras, pages the watch table and stays 15 percent clear of 300 KB`, async () => {
      const html = render(await EntityPage({ params: Promise.resolve({ kind: "roadmaps", id: r.id }) }));
      // The timeline reads whole without JavaScript: every era's date range, title and summary are in the HTML.
      for (const s of r.steps) {
        expect(html, s.title).toContain(`<span class="kicker">${escape(s.era)}</span>`);
        expect(html, s.title).toContain(`<h3 class="font-semibold mt-1">${escape(s.title)}</h3>`);
        expect(html, s.title).toContain(escape(s.description));
      }
      // Eras with records carry a toggle: open (body in the HTML) for the first and the current era, closed for the rest.
      const open = defaultOpen(r).filter((i) => r.steps[i].refs.length);
      const closed = r.steps.filter((s, i) => s.refs.length && !open.includes(i));
      expect((html.match(/data-era-toggle="open"/g) ?? []).length).toBe(open.length);
      expect((html.match(/data-era-toggle="closed"/g) ?? []).length).toBe(closed.length);
      expect((html.match(/data-era-body/g) ?? []).length).toBe(open.length);
      expect(html).toContain("Show era");
      if (open.length) expect(html).toContain("Hide era");
      // The open eras' records are real links for search engines; a closed era's are not on the page.
      const first = graph().get(r.steps[0].refs[0]);
      if (first) expect(html).toMatch(new RegExp(`href="${routeFor(first).replace(/\/$/, "")}/?"`));
      // Crawlers and agents reach every era without the pills' fetch.
      expect(html).toContain("data-roadmap-export");
      expect(html).toContain(`href="${roadmapFile(r.id)}"`);
      // The watch table carries its first WATCH_PAGE rows and the Show more foot when there are more.
      expect((html.match(/data-watch-row/g) ?? []).length).toBe(Math.min(WATCH_PAGE, r.watch.length));
      if (r.watch.length > WATCH_PAGE) { expect(html).toContain("data-more"); expect(html).toContain(`Show ${Math.min(WATCH_PAGE, r.watch.length - WATCH_PAGE)} more`); }
      // A reference costs the same whatever is known about the record it points at: the key papers beyond the cards
      // are pills, and at most PAPER_CARDS citation pills are on the page however many counts the snapshot holds.
      expect((html.match(/aria-label="Cited /g) ?? []).length, `${r.id} citation pills`).toBeLessThanOrEqual(PAPER_CARDS);
      const bytes = Buffer.byteLength(html, "utf8");
      expect(bytes, `${r.id} markup`).toBeLessThan(ROADMAP_BUDGET);
      // The margin: fail while there is still room to fix the cause. Say how close the page is, so the report names it.
      expect(bytes / ROADMAP_BUDGET, `${r.id} markup is ${(bytes / KB).toFixed(1)} KB, ${((bytes / ROADMAP_BUDGET) * 100).toFixed(1)} percent of the 300 KB budget`).toBeLessThan(MARGIN);
    });
  }
});

/**
 * The tag pages (/tagged/<slug>/, src/lib/tables/tagged.ts) are mixed-kind browsers; the largest ("pipeline") covers
 * some 2,400 trials and products. Each carries its first KIND_PAGE rows plus whole-table facet counts and fetches
 * the rest from /api/v1/tables/tag-<slug>.json. The budget is on the markup of the three largest.
 */
describe("tag pages carry one page of rows", () => {
  for (const t of allTags().slice(0, 3)) {
    it(`/tagged/${t.slug}/ renders the first ${KIND_PAGE} of ${t.count} rows, the Show more sentinel and the JSON links`, async () => {
      const html = render(await TaggedPage({ params: Promise.resolve({ tag: t.slug }) }));
      expect(t.count).toBeGreaterThan(KIND_PAGE);
      const rows = bodyRows(html);
      expect(rows[0], "browser rows").toBe(KIND_PAGE);
      for (const n of rows) expect(n).toBeLessThanOrEqual(KIND_PAGE);
      expect(html).toContain("data-more");
      expect(html).toContain(`Show ${KIND_PAGE} more`);
      expect(html).toContain(t.count.toLocaleString("en-GB"));
      expect(html).toContain("data-tag-export");
      expect(html).toContain(`href="/api/v1/tagged/${t.slug}.json"`);
      expect(Buffer.byteLength(html, "utf8"), `/tagged/${t.slug}/ markup`).toBeLessThan(600 * KB);
    });
  }
});

/**
 * The timeline (/timeline/) and the year records under it (/years/<year>/, generated by src/data/years.ts).
 *
 * A year page lists everything the corpus dates to that year, so it grows with the corpus by definition and a total
 * is the wrong thing to hold: the budget is what one dated line costs, the same measure the explained page uses. The
 * row furniture is four short classes (`.yr-*` in globals.css) for the same reason the reference pills carry `.k-*`.
 * Chrome is measured on an empty year, so the per-row figure is the rows alone.
 *
 * On /timeline/, the chart is drawn as one path per band rather than a rectangle per year per band, so it costs the
 * same whether the corpus covers 134 years or 300. What grows on that page is the scrubber's two cumulative lists
 * (every product approved by the chosen year, and the derived standard of care); those are lists of records rather
 * than furniture, and they are the first thing to move to their own page if the ceiling below is approached.
 */
describe("the timeline and its years", () => {
  it("costs a fixed amount per dated line, and the chrome is the same whatever the year holds", async () => {
    const ys = [...graph().kind("year")].sort((a, b) => b.events.length - a.events.length);
    const worst = ys[0], empty = ys[ys.length - 1];
    expect(empty.events.length, "the lightest year page is an empty one").toBe(0);
    const sizeOf = async (id: string) => Buffer.byteLength(render(await EntityPage({ params: Promise.resolve({ kind: "years", id }) })), "utf8");
    const big = await sizeOf(worst.id), chrome = await sizeOf(empty.id);
    const perRow = (big - chrome) / worst.events.length;
    // 415 bytes when written, on /years/2020/ with 792 lines: a date, a title linking to the record the fact was read
    // from, a note, and up to four reference pills.
    expect(perRow, `a dated line costs ${perRow.toFixed(0)} bytes on /years/${worst.id}/ (${worst.events.length} lines)`).toBeLessThan(500);
    // The ceiling is where paging the year itself would have to change rather than the budget being raised.
    expect(big / (600 * KB), `/years/${worst.id}/ is ${(big / KB).toFixed(1)} KB of its 600 KB ceiling`).toBeLessThan(MARGIN);
    expect(chrome, "an empty year page is chrome only").toBeLessThan(120 * KB);
  });

  it("links every year, keeps the early years out of the column chart, and states every denominator on the page", () => {
    const html = render(createElement(TimelinePage));
    const cols = series(graph());
    // Every year is reachable from the page, the empty ones included.
    for (const c of cols) expect(html, `${c.year} is linked`).toMatch(new RegExp(`href="/years/${c.year}/?"`));
    expect(html).toContain(`One column a year from ${CONTINUOUS_FROM} on`);
    // Every finding states its denominator and its caveat on the page, not only in the data behind it.
    for (const f of findings(graph())) {
      expect(html, `${f.id} is on the page`).toContain(`id="${f.id}"`);
      expect(html, `${f.id} states its denominator`).toContain(escapeText(f.denominator));
    }
    // The warning chip is shown for a finding the corpus cannot support, and for no other; when every question is
    // answerable the chip is absent, which is the state to aim at rather than one to assert.
    const unsupported = findings(graph()).filter((f) => !f.supported);
    expect((html.match(/Corpus cannot support this/g) ?? []).length).toBe(unsupported.length);
    const bytes = Buffer.byteLength(html, "utf8");
    // 490 KB when written, of which 401 KB is the scrubber that was already on the page.
    expect(bytes / (640 * KB), `timeline markup is ${(bytes / KB).toFixed(1)} KB of its 640 KB ceiling`).toBeLessThan(MARGIN);
  });
});

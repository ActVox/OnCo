/**
 * Mobile audit for two-column tools (docs/MOBILE.md).
 *
 * At 390 x 844 the views below stack their columns, so a tap in the controls used to change something a screen or
 * more away. Each check scrolls a control into view, activates it the way a finger would, and then requires the
 * driven element (`[data-mobile-driven]`) to be inside the viewport, or, for the tools whose result is a running
 * count on the sticky pills, requires the live region (`[data-mobile-live]`) to be on screen and changed. Every
 * check also fails if the page itself has grown wider than the viewport.
 *
 *   npx tsx scripts/mobile-audit.ts                      # against http://localhost:3000
 *   npx tsx scripts/mobile-audit.ts http://localhost:4123
 *   BASE=https://onco.cc npx tsx scripts/mobile-audit.ts  # one request per route, nothing more
 *
 * Needs Google Chrome at the usual macOS path (or CHROME=...). Exit code 1 when any check fails.
 */
import { spawn } from "node:child_process";

const CHROME = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = (process.argv[2] ?? process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const PORT = 9378;
const HEADER = 56; // --header-h: 3.5rem

type Step = { act: "click" | "hover"; sel: string; nth?: number };
type Check = {
  route: string;
  view: string;
  label?: string;
  steps: Step[];
  /** "driven": the driven element is in the viewport after the steps; "live": the pills' live region changed and is on screen; "width": the page alone, once hydrated, is no wider than the viewport. */
  expect: "driven" | "live" | "width";
};

const v = (name: string) => `[data-mobile-view="${name}"]`;
export const CHECKS: Check[] = [
  // The home page no longer carries a body map. The owner took the "Body" pill off the row above the grid on
  // 2 October 2026, so a phone gets the list of kinds and /body/ is the body map's page. The check that used to
  // open it from the home page is gone rather than left failing; the two /body/ checks below cover the map.
  { route: "/body/", view: "body-map", label: "brain", steps: [{ act: "click", sel: `${v("body-map")} [data-mobile-control]`, nth: 0 }], expect: "driven" },
  { route: "/body/", view: "body-map", label: "mid figure", steps: [{ act: "click", sel: `${v("body-map")} [data-mobile-control]`, nth: 8 }], expect: "driven" },
  { route: "/graph/", view: "graph-explorer", label: "deep neighbour", steps: [{ act: "click", sel: `${v("graph-explorer")} aside [data-mobile-control]`, nth: 0 }, { act: "click", sel: `${v("graph-explorer")} aside [data-mobile-control]`, nth: 12 }], expect: "driven" },
  { route: "/tumor-board/", view: "tumour-board", label: "first tick", steps: [{ act: "click", sel: `${v("tumour-board")} [data-mobile-control]`, nth: 0 }], expect: "driven" },
  { route: "/query/", view: "query-builder", steps: [{ act: "click", sel: `${v("query-builder")} [data-mobile-control]`, nth: 1 }], expect: "driven" },
  { route: "/path/", view: "path-finder", steps: [{ act: "click", sel: `${v("path-finder")} [data-mobile-control]`, nth: 0 }], expect: "driven" },
  { route: "/deals/", view: "deal-flow", steps: [{ act: "hover", sel: `${v("deal-flow")} [data-mobile-control]`, nth: 0 }], expect: "driven" },
  { route: "/irae/", view: "irae-guide", steps: [{ act: "click", sel: `${v("irae-guide")} [data-mobile-control]`, nth: 3 }], expect: "driven" },
  { route: "/prep/", view: "prep-pack", steps: [{ act: "click", sel: `${v("prep-pack")} button.card`, nth: 0 }, { act: "click", sel: `${v("prep-pack")} [data-mobile-control]`, nth: 0 }], expect: "live" },
  { route: "/prep/colorectal/", view: "prep-sheet", steps: [{ act: "click", sel: `${v("prep-sheet")} [data-mobile-control]`, nth: 0 }], expect: "live" },
  { route: "/dependencies/", view: "dependency-map", label: "tap a tile", steps: [{ act: "click", sel: `${v("dependency-map")} [data-mobile-control]`, nth: 3 }], expect: "driven" },
  { route: "/resistance/", view: "resistance-map", label: "first route", steps: [{ act: "click", sel: `${v("resistance-map")} [data-mobile-control]`, nth: 0 }], expect: "driven" },
  // Record pages, one of each kind (EntityDetail and its tabs, tables and pill rows): width only. Long nowrap pills in a
  // grid card, tables and the year bars used to widen the layout viewport past the device (docs/GALLBLADDER-QA.md).
  ...([
    ["cancer", "/cancers/gallbladder/"], ["cancer", "/cancers/pancreatic/"], ["cancer", "/cancers/nsclc/"], ["drug", "/drugs/pembrolizumab/"], ["trial", "/trials/tapur/"],
    ["target", "/targets/her2/"], ["biomarker", "/biomarkers/her2-ihc-3-plus/"], ["company", "/companies/astrazeneca/"], ["institution", "/institutions/nci/"],
    ["person", "/people/thomas-powles/"], ["paper", "/key-papers/paper-haslam-jama-netw-open/"], ["idea", "/ideas/idea-bio2-let-rbe-ab-selects-protons/"], ["roadmap", "/roadmaps/global-access-roadmap/"],
    // The decisions pages: long referenced-record and guideline pills used to widen the page to 665 px (24 Sept 2026).
    ["decisions", "/cancers/gallbladder/decisions/"], ["decisions", "/cancers/tnbc/decisions/"],
  ] as const).map(([kind, route]): Check => ({ route, view: "record", label: kind, steps: [], expect: "width" })),
  // Modality hubs (src/app/modalities/): the format switcher and section bar carry data-tabbar; width only.
  { route: "/modalities/", view: "modality-hub", label: "index", steps: [], expect: "width" },
  { route: "/modalities/adc/", view: "modality-hub", label: "adc", steps: [], expect: "width" },
  { route: "/modalities/small-molecule/", view: "modality-hub", label: "small-molecule", steps: [], expect: "width" },
  // Decision aids (src/components/DecisionToolView.tsx): the result is a sticky preview above the question pills.
  { route: "/tools/gallbladder-polyp/", view: "decision-tool", label: "first pill", steps: [{ act: "click", sel: `${v("decision-tool")} [data-mobile-control]`, nth: 0 }], expect: "driven" },
  { route: "/tools/gallbladder-polyp/", view: "decision-tool", label: "last pill", steps: [{ act: "click", sel: `${v("decision-tool")} [data-mobile-control]`, nth: 17 }], expect: "driven" },
  { route: "/tools/incidental-gallbladder-cancer/", view: "decision-tool", label: "T category", steps: [{ act: "click", sel: `${v("decision-tool")} [data-mobile-control]`, nth: 2 }], expect: "driven" },
  { route: "/tools/incidental-gallbladder-cancer/", view: "decision-tool", label: "last pill", steps: [{ act: "click", sel: `${v("decision-tool")} [data-mobile-control]`, nth: 14 }], expect: "driven" },
];
/** The page itself must never scroll sideways at 390 px; wide elements scroll inside their own box (ScrollRow). */
const MAX_PAGE_WIDTH = 392;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Msg = { id?: number; result?: { result?: { value?: unknown }; targetId?: string; sessionId?: string }; error?: { message: string } };

async function main() {
  // A fresh profile each run: the prep tools remember choices in localStorage, and the checks start from empty.
  const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/cdp-profile-mobile-audit-${process.pid}`, "about:blank"], { stdio: "ignore" });
  let ver: { webSocketDebuggerUrl: string } | undefined;
  for (let i = 0; i < 40 && !ver; i++) { try { ver = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); } catch { await sleep(250); } }
  if (!ver) { chrome.kill(); throw new Error("Chrome did not start"); }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r) => { ws.onopen = r; });
  let id = 0;
  const pending = new Map<number, (m: Msg) => void>();
  ws.onmessage = (m) => { const d = JSON.parse(String(m.data)) as Msg; if (d.id && pending.has(d.id)) { pending.get(d.id)!(d); pending.delete(d.id); } };
  const send = (method: string, params: Record<string, unknown> = {}, sessionId?: string) => new Promise<Msg>((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result: t } = await send("Target.createTarget", { url: "about:blank" });
  const { result: a } = await send("Target.attachToTarget", { targetId: t!.targetId, flatten: true });
  const sid = a!.sessionId;
  const s = (m: string, p?: Record<string, unknown>) => send(m, p, sid);
  await s("Page.enable"); await s("Runtime.enable");
  await s("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: false });
  await s("Emulation.setTouchEmulationEnabled", { enabled: true });

  // ONLY=/,/body/ runs the checks of those routes alone (a dev server compiles each route on first request).
  const only = process.env.ONLY?.split(",").map((r) => r.trim()).filter(Boolean);
  const checks = only?.length ? CHECKS.filter((c) => only.includes(c.route)) : CHECKS;
  let failed = 0;
  for (const c of checks) {
    await s("Page.navigate", { url: `${BASE}${c.route}` });
    await sleep(6000);
    const r = await s("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const H = window.innerHeight, HEADER = ${HEADER};
      if (${JSON.stringify(c.expect)} === "width") {
        // The record page has hydrated when its section bar is up; then only the page width is judged.
        const bar = document.querySelector("[data-tabbar]");
        const sw = document.documentElement.scrollWidth;
        return { ok: !!bar && sw <= ${MAX_PAGE_WIDTH}, why: (bar ? "" : "section bar missing, ") + "page width " + sw + (sw <= ${MAX_PAGE_WIDTH} ? "" : " (SIDEWAYS SCROLL)") };
      }
      const view = document.querySelector(${JSON.stringify(v(c.view))});
      if (!view) return { ok: false, why: "view wrapper missing" };
      const live = view.querySelector("[data-mobile-live]");
      const before = live ? live.textContent : null;
      for (const st of ${JSON.stringify(c.steps)}) {
        const el = document.querySelectorAll(st.sel)[st.nth ?? 0];
        if (!el) return { ok: false, why: "control missing: " + st.sel + " #" + (st.nth ?? 0) };
        el.scrollIntoView({ block: "center" }); await sleep(200);
        const b = el.getBoundingClientRect();
        if (st.act === "hover") { for (const t of ["pointerover", "pointerenter", "mouseover", "mouseenter"]) el.dispatchEvent(new MouseEvent(t, { bubbles: t.endsWith("over"), clientX: b.left + 2, clientY: b.top + 2 })); if (el.focus) el.focus({ preventScroll: true }); }
        else el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
        await sleep(700);
      }
      const inView = (el) => { const r = el.getBoundingClientRect(); return r.top >= HEADER - 4 && r.top < H - 80 && r.bottom > HEADER; };
      const sw = document.documentElement.scrollWidth, narrow = sw <= ${MAX_PAGE_WIDTH};
      const width = ", page width " + sw + (narrow ? "" : " (SIDEWAYS SCROLL)");
      if (${JSON.stringify(c.expect)} === "live") {
        const bar = view.querySelector("[role=tablist]");
        if (!bar || !live) return { ok: false, why: "pills or live region missing" };
        const rb = bar.getBoundingClientRect();
        const onScreen = rb.top >= 0 && rb.bottom <= H;
        return { ok: onScreen && live.textContent !== before && narrow, why: "pills " + Math.round(rb.top) + ".." + Math.round(rb.bottom) + ", live '" + before + "' -> '" + live.textContent + "'" + width };
      }
      const d = view.querySelector("[data-mobile-driven]");
      if (!d) return { ok: false, why: "driven element missing" };
      const r = d.getBoundingClientRect();
      return { ok: inView(d) && narrow, why: "driven " + Math.round(r.top) + ".." + Math.round(r.bottom) + " of " + H + width };
    })()` });
    const out = (r.result?.result?.value ?? { ok: false, why: r.error?.message ?? "no result" }) as { ok: boolean; why: string };
    if (!out.ok) failed++;
    console.log(`${out.ok ? "PASS" : "FAIL"} ${c.route} ${c.view}${c.label ? ` (${c.label})` : ""}: ${out.why}`);
  }
  ws.close(); chrome.kill();
  if (failed) { console.error(`${failed} of ${checks.length} mobile checks failed`); process.exit(1); }
  console.log(`${checks.length} mobile checks passed`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * What a reader actually downloads, measured against the live site.
 *
 * Every page budget in the repo is on the static markup, because that is what react-dom/server can produce inside
 * vitest. `src/app/chrome-size.test.ts` says the assumption out loud: "the RSC payload cannot be rendered in
 * vitest, but the same trees drive both". On 25 September 2026 that assumption broke. `/timeline/` renders 528 KB
 * of markup, inside its 640 KB budget, and ships 2,138 KB, because the hydration payload is 1,610 KB on top. The
 * budget was guarding a quarter of the page.
 *
 * So this measures the exported page: total bytes, the markup, and the payload inlined for hydration. It is not a
 * test, because it needs the built site; run it against production or a local export and record the numbers.
 *
 *   npx tsx scripts/page-weight.ts                 # the recorded pages, against https://onco.cc
 *   npx tsx scripts/page-weight.ts --base http://localhost:3000
 *   npx tsx scripts/page-weight.ts /timeline/ /trials/
 *   npx tsx scripts/page-weight.ts --record         # write what each page weighs now into the ceiling file
 *   npx tsx scripts/page-weight.ts --check          # exit 1 if any page is heavier than its ceiling
 *
 * The ceilings live in `src/data/page-weight.json` and the weekly workflow runs `--check` against the live
 * site, which is the only place the real number can be measured. They are a ratchet: `--record` only ever
 * lowers a ceiling, and raising one means editing the file by hand and saying why in the commit. Measuring
 * without a ceiling was the whole problem; the markup budgets inside vitest have been green throughout.
 */
import { readFileSync, writeFileSync } from "node:fs";

const CEILINGS = "src/data/page-weight.json";
type Ceiling = { total: number; payload: number; measured: string };
type Ceilings = { note: string; pages: Record<string, Ceiling> };
const BASE_DEFAULT = "https://onco.cc";

/** Pages worth watching: the heaviest of each shape, not a sample. */
const PAGES = [
  "/", "/timeline/", "/years/2020/", "/for-me/", "/explore/", "/trials/", "/drugs/", "/navigator/",
  "/cancers/breast-cancer/", "/cancers/prostate/uk/", "/countries/us/", "/virotherapy/", "/explained/",
];

const KB = 1024;
const args = process.argv.slice(2);
const baseAt = args.indexOf("--base");
const base = baseAt >= 0 ? args[baseAt + 1] : BASE_DEFAULT;
const pages = args.filter((a, i) => a.startsWith("/") && i !== baseAt + 1);

async function weigh(path: string) {
  const res = await fetch(new URL(path, base), { headers: { "user-agent": "OnCo page-weight (repo script)" } });
  const html = await res.text();
  const total = Buffer.byteLength(html, "utf8");
  let payload = 0;
  for (const m of html.matchAll(/<script[\s\S]*?<\/script>/g)) payload += Buffer.byteLength(m[0], "utf8");
  return { path, status: res.status, total, payload, markup: total - payload };
}

async function main() {
  const rows = [];
  for (const p of pages.length ? pages : PAGES) rows.push(await weigh(p));
  rows.sort((a, b) => b.total - a.total);

  const n = (b: number) => `${(b / KB).toFixed(0)} KB`.padStart(8);
  console.log("total".padStart(8), "markup".padStart(8), "payload".padStart(8), " share  page");
  for (const r of rows) {
    const share = r.total ? Math.round((r.payload / r.total) * 100) : 0;
    console.log(n(r.total), n(r.markup), n(r.payload), `${String(share).padStart(4)}%  ${r.path}${r.status === 200 ? "" : ` (${r.status})`}`);
  }
  const worst = rows[0];
  console.log(`\nheaviest: ${worst.path} at ${(worst.total / KB).toFixed(0)} KB, ${(worst.payload / worst.total * 100).toFixed(0)} per cent of it the hydration payload.`);
  console.log("A budget on the markup alone does not see that share. See docs/MOBILE.md.");

  const ceilings = JSON.parse(readFileSync(CEILINGS, "utf8")) as Ceilings;
  if (args.includes("--record")) {
    const today = new Date().toISOString().slice(0, 10);
    let lowered = 0;
    for (const r of rows) {
      if (r.status !== 200) continue;
      const was = ceilings.pages[r.path];
      // A ratchet: record only when the page got lighter. A page that grew is a regression to fix, not a
      // number to update, and --check is what says so.
      if (!was || r.total < was.total) { ceilings.pages[r.path] = { total: r.total, payload: r.payload, measured: today }; lowered++; }
    }
    writeFileSync(CEILINGS, JSON.stringify(ceilings, null, 2) + "\n");
    console.log(`recorded: ${lowered} ceiling(s) lowered or added, ${rows.length - lowered} unchanged.`);
    return;
  }
  if (args.includes("--check")) {
    const over: string[] = [];
    for (const r of rows) {
      const c = ceilings.pages[r.path];
      if (!c) { over.push(`${r.path}: no ceiling recorded`); continue; }
      if (r.status !== 200) { over.push(`${r.path}: HTTP ${r.status}`); continue; }
      if (r.total > c.total) over.push(`${r.path}: ${(r.total / KB).toFixed(0)} KB against a ceiling of ${(c.total / KB).toFixed(0)} KB set on ${c.measured}`);
    }
    if (over.length) { console.error("\nPAGE-WEIGHT-OVER\n" + over.map((o) => "  " + o).join("\n")); process.exit(1); }
    console.log(`\nevery page is within its ceiling (${Object.keys(ceilings.pages).length} recorded).`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

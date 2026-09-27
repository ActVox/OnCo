/**
 * Every oncology accelerated approval and what became of it, read from the FDA's own four tables.
 *
 * The agency publishes the pathway as four separate lists and no rate at all:
 *   verified   accelerated approvals converted to traditional approval, with both dates
 *   withdrawn  accelerated approvals withdrawn, with both dates
 *   ongoing    accelerated approvals still awaiting a confirmatory result, with the grant date and the
 *              post-marketing requirement
 *   other      accelerated approvals that are not cancer treatment indications (supportive care, dosing,
 *              formulation), whose status column carries its own outcome and date
 *
 * Each row is one indication. This script parses all four, matches the drug-name cell to a corpus product by
 * generic name (then by the name without a biologic's four-letter suffix, then by brand), and writes
 * src/data/accelerated-approvals.ts. src/data/index.ts turns every matched row into typed `regulatoryEvents` on the
 * product: an "accelerated-approval" event on the grant date, and a "conversion" or "withdrawal" event carrying the
 * same `indication` text on the date that closed it. Rows that match no corpus product are kept in the file too, so
 * the denominator on /timeline/ and /countries/us/ is the agency's list and not our reading of it.
 *
 * Nothing is inferred. Every date in the output is a date in an FDA cell; the only arithmetic is in
 * src/lib/accelerated.ts, over those dates, and it is described where it is shown.
 *
 *   npx tsx scripts/fetch-accelerated.ts              fetch (or reuse the /tmp cache), report, write nothing
 *   npx tsx scripts/fetch-accelerated.ts --apply      write src/data/accelerated-approvals.ts
 *   npx tsx scripts/fetch-accelerated.ts --no-fetch   parse the /tmp cache only, fetching nothing
 *
 * Network: four GETs to www.fda.gov, one at a time, cached under /tmp/fda-accelerated/.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import type { AcceleratedOutcome, AcceleratedRow, AcceleratedTable, AcceleratedTableId } from "../src/lib/accelerated";
import { conversionRate, summarise, summaryLine } from "../src/lib/accelerated";
import { NameMatcher, UA, decodeEntities, matchableFromGraph, sleep, today } from "./feed-utils";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const noFetch = args.includes("--no-fetch");
const CACHE = "/tmp/fda-accelerated";
const OUT = join(process.cwd(), "src", "data", "accelerated-approvals.ts");
const BASE = "https://www.fda.gov/drugs/resources-information-approved-drugs";

const SOURCES: Array<{ id: AcceleratedTableId; slug: string; label: string }> = [
  { id: "verified", slug: "verified-clinical-benefit-cancer-accelerated-approvals", label: "Converted to traditional approval" },
  { id: "withdrawn", slug: "withdrawn-cancer-accelerated-approvals", label: "Withdrawn" },
  { id: "ongoing", slug: "ongoing-cancer-accelerated-approvals", label: "Still unresolved" },
  { id: "other", slug: "other-cancer-accelerated-approvals", label: "Other (supportive care, dosing and formulation)" },
];

// ---------------------------------------------------------------------------------------------------------------------
// Fetch and cache
// ---------------------------------------------------------------------------------------------------------------------
async function page(slug: string): Promise<string | null> {
  mkdirSync(CACHE, { recursive: true });
  const path = join(CACHE, `${slug}.html`);
  if (existsSync(path)) return readFileSync(path, "utf8");
  if (noFetch) return null;
  await sleep(500);
  const res = await fetch(`${BASE}/${slug}`, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!res.ok) { console.error(`${slug}: ${res.status} ${res.statusText}`); return null; }
  const html = await res.text();
  writeFileSync(path, html);
  return html;
}

// ---------------------------------------------------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------------------------------------------------
/**
 * A cell's plain text. The FDA sets compounds and ranges with en dashes ("anti-CD20"); they become hyphens here,
 * which is what the agency means and what the corpus's house style allows in a rendered field.
 */
const cellText = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, " ")).replace(/ /g, " ").replace(/[‐-―]/g, "-").replace(/\s+/g, " ").trim();

/** The rows of the page's first table, each as its cells' plain text, plus the first link inside each cell. */
function tableRows(html: string): Array<{ cells: string[]; links: Array<string | undefined> }> {
  const start = html.indexOf("<table");
  const body = html.slice(start, html.indexOf("</table>", start));
  const out: Array<{ cells: string[]; links: Array<string | undefined> }> = [];
  for (const tr of body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
    const cells: string[] = [];
    const links: Array<string | undefined> = [];
    for (const td of tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)) {
      cells.push(cellText(td[1]));
      const href = /<a[^>]*\shref="([^"]+)"/.exec(td[1])?.[1];
      links.push(href ? (href.startsWith("http") ? href : `https://www.fda.gov${href}`) : undefined);
    }
    if (cells.length) out.push({ cells, links });
  }
  return out;
}

/** "9/17/2026" or "09/17/2026" to "2026-09-17". Returns undefined for anything else, so a note never becomes a date. */
function isoDate(s: string): string | undefined {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s.trim());
  if (!m) return undefined;
  return `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}

/** The "Content current as of" date the FDA prints on the page, as ISO. */
function currentAsOf(html: string): string | undefined {
  const m = /Content current as of\s*:?\s*(?:<[^>]+>\s*)*(\d{1,2}\/\d{1,2}\/\d{4})/.exec(html);
  return m ? isoDate(m[1]) : undefined;
}

/** "Traditional Approval Granted (12/16/2022)" and "Withdrawn (12/08/2021)" in the fourth table's status column. */
function otherStatus(s: string): { outcome: AcceleratedOutcome; date?: string } {
  const m = /\((\d{1,2}\/\d{1,2}\/\d{4})\)/.exec(s);
  const date = m ? isoDate(m[1]) : undefined;
  if (/withdraw/i.test(s)) return { outcome: "withdrawn", date };
  if (/traditional approval/i.test(s)) return { outcome: "converted", date };
  return { outcome: "open" };
}

// ---------------------------------------------------------------------------------------------------------------------
// Name matching
// ---------------------------------------------------------------------------------------------------------------------
/** "Breyanzi (lisocabtagene maraleucel)" -> { brand: "Breyanzi", generic: "lisocabtagene maraleucel" }. */
function splitDrugCell(cell: string): { brand: string; generic?: string } {
  const m = /^(.*?)\s*\((.*)\)\s*$/.exec(cell.trim());
  if (!m) return { brand: cell.trim() };
  return { brand: m[1].trim(), generic: m[2].trim() };
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[‐-―]/g, "-").replace(/\s+/g, " ").replace(/\.$/, "").trim();
/** A name with its trailing parenthetical dropped: "Letrozole (and other aromatase inhibitors)" -> "letrozole". */
const baseOf = (s: string) => norm(s.replace(/\s*\([^()]*\)\s*$/, ""));
/** Salts, formulations and a biologic's four-letter suffix are naming conventions, not part of the drug's name. */
const SALTS = /\b(hcl|hydrochloride|sulfate|sulphate|mesylate|maleate|succinate|tartrate|citrate|disodium|sodium|phosphate|acetate|tosylate|dimaleate|trihydrote|trihydrate|liposomal|liposome|capsules|tablets|injection|for injection)\b/g;

/** Every form of the drug name worth matching on, most specific first. */
function genericCandidates(cell: string): string[] {
  const { brand, generic } = splitDrugCell(cell);
  const seeds = [generic, brand].filter((s): s is string => Boolean(s));
  const out: string[] = [];
  for (const seed of seeds) {
    const forms = [
      seed,
      seed.replace(/-[a-z]{4}\b/gi, ""),                       // teclistamab-cqyv -> teclistamab
      seed.replace(/^fam-/i, "").replace(/-[a-z]{4}\b/gi, ""), // fam-trastuzumab deruxtecan-nxki -> trastuzumab deruxtecan
      seed.split(/\s+and\s+/i)[0],                             // pembrolizumab and berahyaluronidase alfa-pmph
      seed.replace(/\s*\([^()]*\)/g, " "),                     // cytarabine(liposomal) -> cytarabine
    ];
    for (const f of forms) {
      for (const v of [f, f.replace(SALTS, " ")]) {
        const n = norm(v.replace(/-[a-z]{4}\b/gi, "").replace(/\s*\([^()]*\)/g, " "));
        if (n.length >= 4 && !out.includes(n)) out.push(n);
      }
    }
  }
  return out;
}

/** The brand names a product record claims, "Tabrecta / Tepmetko" and "Avastin (and biosimilars)" both reduced to plain brands. */
function brandKeys(brand: string | undefined): string[] {
  if (!brand) return [];
  return brand.split(/\s*[/;]\s*/).map((b) => baseOf(b)).filter((b) => b.length >= 3);
}

type Candidate = { id: string; nameKey: string; baseKey: string; akaKeys: string[]; brands: string[]; combination: boolean };

/**
 * Resolve an FDA drug cell to a corpus product.
 *
 * The order matters, because the corpus holds combination-regimen records ("Dabrafenib + trametinib") and
 * use-specific ones ("Bevacizumab (glioblastoma use)") beside the plain product, and a generic name matches all
 * three. A brand that only one record claims is the strongest signal the agency's cell carries; after that the
 * generic name against a record's own name, preferring the record that is only that drug. The loose whole-text
 * matcher is the last resort, and a row it cannot place is left unmatched rather than guessed.
 */
function matchDrug(cands: Candidate[], matcher: NameMatcher, cell: string): string | undefined {
  const { brand } = splitDrugCell(cell);
  const wanted = baseOf(brand);
  const byBrand = cands.filter((c) => c.brands.includes(wanted));
  if (byBrand.length === 1) return byBrand[0].id;
  const pick = (xs: Candidate[]) => (xs.length ? [...xs].sort((a, b) => Number(a.combination) - Number(b.combination) || a.id.length - b.id.length)[0].id : undefined);
  for (const gen of genericCandidates(cell)) {
    const exact = pick(cands.filter((c) => c.nameKey === gen));
    if (exact) return exact;
    const base = pick(cands.filter((c) => c.baseKey === gen));
    if (base) return base;
    const aka = pick(cands.filter((c) => c.akaKeys.includes(gen)));
    if (aka) return aka;
  }
  const byBrandAny = pick(byBrand);
  if (byBrandAny) return byBrandAny;
  for (const gen of genericCandidates(cell)) {
    const id = matcher.best(gen, ["drug"]);
    if (id) return id;
  }
  return undefined;
}

// ---------------------------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------------------------
async function main() {
  const g = graph();
  const matcher = new NameMatcher(matchableFromGraph(g.entities as never), ["drug"]);
  const cands: Candidate[] = g.kind("drug").map((d) => ({
    id: d.id,
    nameKey: norm(d.name),
    baseKey: baseOf(d.name),
    akaKeys: d.aka.map(baseOf),
    brands: brandKeys(d.brand),
    combination: /[+&]|,|\band\b/i.test(d.name),
  }));
  const tables: AcceleratedTable[] = [];
  const rows: AcceleratedRow[] = [];
  let readOn = today();
  const skipped: string[] = [];

  for (const src of SOURCES) {
    const html = await page(src.slug);
    if (!html) { console.error(`${src.id}: no page, skipping`); continue; }
    const current = currentAsOf(html);
    const parsed = tableRows(html);
    let count = 0;
    for (const { cells, links } of parsed) {
      if (cells.length < 4) continue;
      const granted = isoDate(cells[2]);
      if (!granted) { skipped.push(`${src.id}: ${cells[0]} has no grant date ("${cells[2]}")`); continue; }
      let outcome: AcceleratedOutcome, outcomeDate: string | undefined;
      if (src.id === "verified") { outcome = "converted"; outcomeDate = isoDate(cells[3]); }
      else if (src.id === "withdrawn") { outcome = "withdrawn"; outcomeDate = isoDate(cells[3]); }
      else if (src.id === "ongoing") { outcome = "open"; }
      else ({ outcome, date: outcomeDate } = otherStatus(cells[3]));
      if (outcome !== "open" && !outcomeDate) { skipped.push(`${src.id}: ${cells[0]} is ${outcome} with no date ("${cells[3]}")`); continue; }
      const { brand, generic } = splitDrugCell(cells[0]);
      const drugId = matchDrug(cands, matcher, cells[0]);
      rows.push({
        ...(drugId ? { drugId } : {}),
        drugName: cells[0].replace(/\s+/g, " ").trim(),
        ...(generic ? { generic } : {}),
        indication: cells[1],
        granted,
        outcome,
        ...(outcomeDate ? { outcomeDate } : {}),
        table: src.id,
        ...(links[1] ? { announcement: links[1] } : {}),
      });
      count += 1;
      void brand;
    }
    tables.push({ id: src.id, label: src.label, url: `${BASE}/${src.slug}`, count, current: current ?? readOn });
    if (current && current > readOn) readOn = current;
    console.log(`${src.id.padEnd(10)} ${String(count).padStart(4)} rows, content current ${current ?? "unknown"}`);
  }

  if (!rows.length) { console.error("no rows parsed; not writing"); process.exit(1); }
  // The tables are read on one day; the interval for an open indication runs to the latest date the agency says its
  // content is current to, which is the last day any of this was true.
  readOn = tables.map((t) => t.current).sort().slice(-1)[0] ?? readOn;

  const matched = rows.filter((r) => r.drugId);
  const products = new Set(matched.map((r) => r.drugId!));
  const rate = conversionRate(rows);
  console.log(`\n${rows.length} indications across ${tables.length} tables, read on ${readOn}`);
  console.log(`${matched.length} matched ${products.size} corpus products; ${rows.length - matched.length} matched nothing`);
  console.log(`converted ${rate.converted}, withdrawn ${rate.withdrawn}, open ${rate.open}; conversion rate over the ${rate.resolved} resolved: ${rate.pct?.toFixed(0)} per cent`);
  for (const t of tables) {
    const set = rows.filter((r) => r.table === t.id);
    console.log(`  ${t.id.padEnd(10)} ${summaryLine(summarise(set, readOn))}`);
  }
  if (skipped.length) { console.log(`\n${skipped.length} rows skipped:`); for (const s of skipped.slice(0, 20)) console.log(`  ${s}`); }
  const unmatchedNames = [...new Set(rows.filter((r) => !r.drugId).map((r) => r.drugName))];
  if (unmatchedNames.length) { console.log(`\n${unmatchedNames.length} drug names not in the corpus:`); for (const n of unmatchedNames) console.log(`  ${n}`); }

  if (!apply) { console.log("\nplan only; pass --apply to write src/data/accelerated-approvals.ts"); return; }

  const unmatchedCount = rows.length - matched.length;
  const byDrug = new Map<string, AcceleratedRow[]>();
  for (const r of matched) byDrug.set(r.drugId!, [...(byDrug.get(r.drugId!) ?? []), r]);
  const drugLines = [...byDrug.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    .map(([id, rs]) => `  ${JSON.stringify(id)}: ${JSON.stringify(rs.sort((a, b) => a.granted.localeCompare(b.granted)))},`);
  const unmatchedLines = rows.filter((r) => !r.drugId).sort((a, b) => a.granted.localeCompare(b.granted)).map((r) => `  ${JSON.stringify(r)},`);
  const header = `import type { AcceleratedRow, AcceleratedTable } from "@/lib/accelerated";

/**
 * GENERATED by scripts/fetch-accelerated.ts on ${today()}; do not edit by hand, re-run the script.
 *
 * Every oncology accelerated approval the FDA lists and what became of it: ${rows.length} indications across the agency's
 * four tables, ${rate.converted} converted to traditional approval, ${rate.withdrawn} withdrawn and ${rate.open} still unresolved.
 * ${matched.length} rows name a product OnCo holds (${products.size} products); the ${unmatchedCount === 1 ? "one that does not is" : `other ${unmatchedCount} are`} kept in
 * ACCELERATED_UNMATCHED so the denominator stays the agency's list rather than our reading of it.
 *
 * src/data/index.ts turns each row into typed regulatoryEvents on the product: an "accelerated-approval" event on the
 * grant date and, where the indication is closed, a "conversion" or "withdrawal" event carrying the same \`indication\`
 * text. The arithmetic over these rows lives in src/lib/accelerated.ts and is shown on /timeline/ and /countries/us/.
 */

/** The latest date the FDA says any of the four tables is current to; an open indication's interval is measured to it. */
export const ACCELERATED_READ_ON = ${JSON.stringify(readOn)};

export const ACCELERATED_TABLES: AcceleratedTable[] = [
${tables.map((t) => `  ${JSON.stringify(t)},`).join("\n")}
];

/** Accelerated-approval indications by corpus product id, oldest grant first. */
export const ACCELERATED_APPROVALS: Record<string, AcceleratedRow[]> = {
`;
  const body = `${drugLines.join("\n")}
};

/** Rows whose drug is not in OnCo. Kept so every count on the site can use the agency's denominator. */
export const ACCELERATED_UNMATCHED: AcceleratedRow[] = [
${unmatchedLines.join("\n")}
];
`;
  writeFileSync(OUT, `${header}${body}`);
  console.log(`\nwrote ${OUT} (${byDrug.size} products, ${matched.length} matched rows, ${rows.length - matched.length} unmatched)`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Is a change to the product, or to the data?
 *
 * The owner's rule, 28 September 2026: "i want them to go through my approval (not the typical data cron jobs
 * that increase freshness or coverage but the changes to the site)". So a wave of fetched trials ships without
 * him; moving a block, renaming a section or changing a component waits for him.
 *
 * The line is drawn on what a change can do to a reader, not on who made it:
 *
 *   data     a record's content, a generated artefact, a fetcher's output. It changes what the page says.
 *   product  anything that decides what a page shows, in what order, or what it is called. It changes the page.
 *
 * `src/data` is data with one exception that matters: a file there can carry a label or a section title, and
 * `src/lib/i18n` is entirely labels, so it is product. Tests and documents are neither and never gate a deploy.
 *
 *   npx tsx scripts/change-class.ts <ref>..<ref>     classify a range (defaults to origin/main..HEAD)
 */
import { execSync } from "node:child_process";

export type ChangeClass = "product" | "data" | "neither";

/** Ordered: the first rule that matches decides, so the exceptions sit above the broad strokes. */
const RULES: Array<[RegExp, ChangeClass]> = [
  [/\.test\.tsx?$/, "neither"],
  [/^docs\//, "neither"],
  [/^(README|CHANGELOG|CONTRIBUTING|AGENTS|CODE_OF_CONDUCT|LICENCE|LICENSE)/, "neither"],
  [/^\.github\//, "neither"],
  [/^src\/lib\/i18n\//, "product"],          // every label a reader reads
  [/^src\/lib\/record-sections\.ts$/, "product"],
  [/^src\/lib\/(kinds|nav|seo|search-rank|kind-browser|tables|edge|timeline)/, "product"],
  [/^src\/(components|app)\//, "product"],
  [/^src\/lib\//, "product"],                 // the rest of lib decides what renders
  [/^src\/data\//, "data"],
  [/^public\//, "data"],
  [/^scripts\//, "neither"],                  // a script is not shipped; what it writes is
  [/^package-lock\.json$/, "neither"],       // a lockfile follows package.json; the dependency change is the decision
  [/^(tsconfig|next\.config|vercel|eslint|vitest)/, "product"],
];

/**
 * `package.json` is two files in one. A dependency or a build setting changes what the site is; a line under
 * `scripts` adds a command for a person to type and cannot reach a reader. The first blocked a ship of the very
 * page the owner had asked for, so the rule reads the change rather than the filename.
 */
function packageJsonClass(): ChangeClass {
  try {
    const before = JSON.parse(execSync("git show origin/main:package.json", { encoding: "utf8" }));
    const after = JSON.parse(execSync("git show HEAD:package.json", { encoding: "utf8" }));
    delete before.scripts; delete after.scripts;
    return JSON.stringify(before) === JSON.stringify(after) ? "neither" : "product";
  } catch {
    return "product";   // cannot tell, so assume it matters
  }
}

export function classify(path: string): ChangeClass {
  if (path === "package.json") return packageJsonClass();
  for (const [re, c] of RULES) if (re.test(path)) return c;
  return "neither";
}

export function classifyRange(range: string): { product: string[]; data: string[]; neither: string[] } {
  const files = execSync(`git diff --name-only ${range}`, { encoding: "utf8" }).split("\n").filter(Boolean);
  const out = { product: [] as string[], data: [] as string[], neither: [] as string[] };
  for (const f of files) out[classify(f)].push(f);
  return out;
}

if (require.main === module) {
  const range = process.argv[2] ?? "origin/main..HEAD";
  const { product, data, neither } = classifyRange(range);
  console.log(`product ${product.length}  data ${data.length}  neither ${neither.length}   (${range})`);
  for (const f of product.slice(0, 40)) console.log("  product:", f);
  if (product.length > 40) console.log(`  ... and ${product.length - 40} more product files`);
  process.exit(product.length ? 2 : 0);
}

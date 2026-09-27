/**
 * When each trial started, from the registry.
 *
 * The corpus has dated every trial's readout and none of their starts, so it cannot say how long a single trial
 * took. ClinicalTrials.gov carries a start date on every record, at whatever precision the sponsor gave it, and
 * marks it ACTUAL or ESTIMATED. This script reads `statusModule.startDateStruct` for every trial with an NCT id and
 * writes src/data/trial-start-dates.ts; src/data/index.ts merges a row onto a trial that carries no `started` of its
 * own.
 *
 * The records are the same ones scripts/fetch-registry-outcomes.ts and scripts/fetch-registry-status.ts already
 * cache under /tmp/ctgov-cache, and the statusModule they saved carries the start date, so most of this run costs
 * nothing. Only trials in neither cache are fetched, PAGE ids at a time, PAUSE_MS apart.
 *
 * An ESTIMATED start date on a trial that has already reported is still recorded, because it is what the registry
 * says; the type travels with it so anything computed over these dates can say what it counted. Trials with no NCT
 * id, and NCT ids the API does not return, keep an empty field.
 *
 *   npx tsx scripts/fetch-trial-starts.ts              plan from the caches, fetching what is missing
 *   npx tsx scripts/fetch-trial-starts.ts --no-fetch   caches only, fetching nothing
 *   npx tsx scripts/fetch-trial-starts.ts --apply      write src/data/trial-start-dates.ts
 *   npx tsx scripts/fetch-trial-starts.ts --max=200    fetch at most 200 uncached records this run
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import type { TrialStart } from "../src/lib/trial-starts";
import { today } from "./feed-utils";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const noFetch = args.includes("--no-fetch");
const max = Number(args.find((a) => a.startsWith("--max="))?.slice(6) ?? 6000);
const CACHES = ["/tmp/ctgov-cache/results", "/tmp/ctgov-cache/status", "/tmp/ctgov-cache/start"];
const WRITE_CACHE = "/tmp/ctgov-cache/start";
const OUT = join(process.cwd(), "src", "data", "trial-start-dates.ts");

const API = "https://clinicaltrials.gov/api/v2/studies";
const FIELDS = "protocolSection.identificationModule,protocolSection.statusModule";
const UA = "OnCo fetch-trial-starts (https://onco.cc; hello@onco.cc)";
const PAUSE_MS = 250;
const PAGE = 25;

type DateStruct = { date?: string; type?: string };
type Study = { protocolSection?: { identificationModule?: { nctId?: string }; statusModule?: { startDateStruct?: DateStruct } } };
type Cached = { fetchedAt: string; study?: Study; missing?: true };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readCache(nct: string): Cached | undefined {
  for (const dir of CACHES) {
    const p = join(dir, `${nct}.json`);
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8")) as Cached;
  }
  return undefined;
}

let requests = 0;
async function fetchStudies(ncts: string[]): Promise<void> {
  requests += 1;
  const params = new URLSearchParams({ "filter.ids": ncts.join(","), fields: FIELDS, format: "json", pageSize: String(ncts.length) });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${ncts[0]}..${ncts[ncts.length - 1]}`);
  const data = (await res.json()) as { studies?: Study[] };
  const got = new Set<string>();
  const fetchedAt = today();
  for (const s of data.studies ?? []) {
    const id = s.protocolSection?.identificationModule?.nctId;
    if (!id) continue;
    writeFileSync(join(WRITE_CACHE, `${id}.json`), JSON.stringify({ fetchedAt, study: s } satisfies Cached));
    got.add(id);
  }
  for (const n of ncts) if (!got.has(n)) writeFileSync(join(WRITE_CACHE, `${n}.json`), JSON.stringify({ fetchedAt, missing: true } satisfies Cached));
}

/** "1994-12", "2019-04-15" or "2019" as the registry gives it; anything else is dropped rather than repaired. */
const cleanDate = (d: string | undefined): string | undefined => (d && /^\d{4}(-\d{2}(-\d{2})?)?$/.test(d) ? d : undefined);

async function main() {
  const g = graph();
  const trials = g.kind("trial").filter((t) => t.nct && /^NCT\d+$/.test(t.nct));
  const noNct = g.kind("trial").length - trials.length;
  const missing = trials.filter((t) => !readCache(t.nct!)).map((t) => t.nct!);
  console.log(`${trials.length} trials carry a ClinicalTrials.gov id (${noNct} do not); ${missing.length} not cached`);

  if (missing.length && !noFetch) {
    mkdirSync(WRITE_CACHE, { recursive: true });
    const todo = missing.slice(0, max);
    for (let i = 0; i < todo.length; i += PAGE) {
      await fetchStudies(todo.slice(i, i + PAGE));
      await sleep(PAUSE_MS);
      if ((i / PAGE) % 20 === 0) console.log(`  fetched ${Math.min(i + PAGE, todo.length)}/${todo.length}`);
    }
    console.log(`  ${requests} requests`);
  }

  const rows: Array<[string, TrialStart]> = [];
  let uncached = 0, notReturned = 0, noStart = 0, handWritten = 0;
  const byType = new Map<string, number>();
  const byPrecision = new Map<number, number>();
  for (const t of trials) {
    if (t.started) { handWritten += 1; continue; }
    const c = readCache(t.nct!);
    if (!c) { uncached += 1; continue; }
    if (c.missing || !c.study) { notReturned += 1; continue; }
    const s = c.study.protocolSection?.statusModule?.startDateStruct;
    const date = cleanDate(s?.date);
    if (!date) { noStart += 1; continue; }
    const type = s?.type === "ACTUAL" ? "actual" : s?.type === "ESTIMATED" ? "estimated" : undefined;
    rows.push([t.id, { started: date, ...(type ? { type } : {}), nct: t.nct! }]);
    byType.set(type ?? "unstated", (byType.get(type ?? "unstated") ?? 0) + 1);
    byPrecision.set(date.length, (byPrecision.get(date.length) ?? 0) + 1);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  console.log(`\n${rows.length} start dates read; ${handWritten} trials already carry one, ${uncached} uncached, ${notReturned} not returned by the API, ${noStart} records with no start date`);
  console.log(`type: ${[...byType.entries()].map(([k, v]) => `${k} ${v}`).join(", ")}`);
  console.log(`precision: ${[...byPrecision.entries()].sort().map(([k, v]) => `${k === 4 ? "year" : k === 7 ? "month" : "day"} ${v}`).join(", ")}`);
  const yrs = rows.map(([, r]) => Number(r.started.slice(0, 4))).sort((a, b) => a - b);
  if (yrs.length) console.log(`earliest ${yrs[0]}, median ${yrs[Math.floor(yrs.length / 2)]}, latest ${yrs[yrs.length - 1]}`);

  if (!apply) { console.log("\nplan only; pass --apply to write src/data/trial-start-dates.ts"); return; }
  const header = `import type { TrialStart } from "@/lib/trial-starts";

/**
 * GENERATED by scripts/fetch-trial-starts.ts on ${today()}; do not edit by hand, re-run the script (the records are
 * cached under /tmp/ctgov-cache, so a re-run is nearly free).
 *
 * The date each trial started, as ClinicalTrials.gov states it: ${rows.length} of the ${trials.length} trials with a registry id
 * (${g.kind("trial").length} trials in all; ${noNct} carry no ClinicalTrials.gov id). \`type\` is the registry's own ACTUAL or ESTIMATED,
 * kept so anything computed over these dates can say what it counted; ${byType.get("estimated") ?? 0} are estimated.
 * Precision is the sponsor's: ${[...byPrecision.entries()].sort().map(([k, v]) => `${v} to the ${k === 4 ? "year" : k === 7 ? "month" : "day"}`).join(", ")}.
 *
 * Merged onto the trial records by src/data/index.ts where the record carries no \`started\` of its own.
 */
export const TRIAL_START_DATES: Record<string, TrialStart> = {
`;
  const lines = rows.map(([id, r]) => `  ${JSON.stringify(id)}: ${JSON.stringify(r)},`);
  writeFileSync(OUT, `${header}${lines.join("\n")}\n};\n`);
  console.log(`\nwrote ${OUT} (${rows.length} trials)`);
}

main().catch((e) => { console.error(e); process.exit(1); });

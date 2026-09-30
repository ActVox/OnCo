/**
 * Build src/data/software.ts, the software of oncology behind /software/.
 *
 * Why a sibling of scripts/fetch-open-source.ts rather than an extension of it: that script's whole contract is the
 * GitHub API (licence as declared, stars, created and last-push dates) and it is right for projects that live in a
 * repository. Almost nothing here does. What verifies a commercial or regulated product is a different set of
 * services entirely, so the two generators share a shape and nothing else, and /open-source/ keeps its 379 records.
 *
 * Reads the curated list in scripts/software-curated.ts and, for each product, fetches three kinds of thing:
 *   - The company's own page. Establishes that the product exists and yields its claim, verbatim: the page's own
 *     meta description, or its title where there is none. Also records whether the page names the product at all.
 *   - openFDA (api.fda.gov/device/510k.json and pma.json). Every clearance, De Novo grant, approval or supplement
 *     the query returns is filtered by the curated applicant and device substrings and then recorded with its
 *     number, device name, applicant, decision and date, exactly as the database words them.
 *   - Europe PMC. The curated query is run and every hit whose title or abstract contains the curated match string
 *     is recorded with its journal, year, DOI and citation count, with preprints marked as not peer reviewed.
 *
 * `sourcing` is derived from what came back, never curated: a record with at least one clearance, paper or listing
 * is "independent"; a record with none is "self-described" and the page says so in that row. A record whose own
 * page failed but whose regulator or literature check succeeded is kept and cites that instead; a record with
 * nothing at all is skipped with the reason.
 *
 * A service that does not answer is recorded in the unverified list and the run continues: an outage at openFDA or
 * Europe PMC is a gap in a row's evidence, not a reason to refuse to build the page.
 *
 * Responses are cached under /tmp/software-cache so re-runs are free and each service sees one request per query
 * per day. Ids referenced in the curated list must exist in the corpus; the run fails otherwise.
 *
 * Run: npx tsx scripts/fetch-software.ts
 *      npx tsx scripts/fetch-software.ts --offline   (cache only; anything with no cache is skipped with a note)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { CURATED, SKIPPED, type CuratedSoftware } from "./software-curated";
import { SoftwareProductSchema, type SoftwareClearance, type SoftwareListing, type SoftwarePaper, type SoftwareProduct } from "../src/lib/schema";
import { graph } from "../src/lib/graph";

const CACHE = "/tmp/software-cache";
const OUT = join(__dirname, "..", "src", "data", "software.ts");
const UA = "OnCo/1.0 (+https://onco.cc; oncology software map; contact via https://github.com/judegomila/OnCo/issues)";
const TODAY = new Date().toISOString().slice(0, 10);
const OFFLINE = process.argv.includes("--offline");
const PAGE_DELAY_MS = 1200;
// Europe PMC throttles a burst hard and answers 503 for a while afterwards, so the literature check is deliberately slow.
const API_DELAY_MS = 2500;
const MAX_CLEARANCES = 4;
const MAX_PAPERS = 3;

mkdirSync(join(CACHE, "pages"), { recursive: true });
mkdirSync(join(CACHE, "fda"), { recursive: true });
mkdirSync(join(CACHE, "epmc"), { recursive: true });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 16);

type Fetched = { status: number; body: string };

/** 429 and the 5xx family mean "come back later", not "there is nothing here": retried, and never cached. */
const TRANSIENT = new Set([0, 429, 500, 502, 503, 504]);

async function get(kind: "pages" | "fda" | "epmc", url: string, delay: number): Promise<Fetched> {
  const file = join(CACHE, kind, `${hash(url)}.json`);
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as Fetched;
  if (OFFLINE) return { status: 0, body: "" };
  let result: Fetched = { status: 0, body: "" };
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt) await sleep(8000 * attempt);
    try {
      const r = await fetch(url, {
        headers: { "user-agent": UA, accept: kind === "pages" ? "text/html,application/xhtml+xml,*/*;q=0.8" : "application/json" },
        redirect: "follow",
        signal: AbortSignal.timeout(40_000),
      });
      result = { status: r.status, body: (await r.text()).slice(0, 2_000_000) };
    } catch (e) {
      result = { status: 0, body: String(e) };
    }
    if (!TRANSIENT.has(result.status)) break;
    if (kind === "pages" && result.status === 0) break; // a page whose host does not resolve will not resolve on a retry
  }
  if (!TRANSIENT.has(result.status)) writeFileSync(file, JSON.stringify(result));
  await sleep(delay);
  return result;
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&rsquo;/g, "'").replace(/&nbsp;/g, " ").replace(/&#8211;|&ndash;/g, "-")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ").trim();
}

function stripHtml(html: string): string {
  return decode(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "));
}

/** The page's own words: og:description, then meta description, then the title. Verbatim, only entity-decoded. */
function ownWords(html: string): string | undefined {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const pick = (test: RegExp) => {
    for (const tag of metas) {
      if (!test.test(tag)) continue;
      const content = /content\s*=\s*"([^"]*)"/i.exec(tag)?.[1] ?? /content\s*=\s*'([^']*)'/i.exec(tag)?.[1];
      const text = content ? decode(content) : "";
      if (text.length > 15) return text;
    }
    return undefined;
  };
  const og = pick(/property\s*=\s*["']og:description["']/i);
  if (og) return og;
  const desc = pick(/name\s*=\s*["']description["']/i);
  if (desc) return desc;
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const t = title ? decode(title) : "";
  return t.length > 3 ? t : undefined;
}

type FdaRow = {
  k_number?: string; pma_number?: string; supplement_number?: string;
  device_name?: string; trade_name?: string; applicant?: string;
  decision_description?: string; decision_code?: string; supplement_reason?: string;
  decision_date?: string; date_received?: string;
};

function clearanceRoute(row: FdaRow): SoftwareClearance["route"] {
  const k = row.k_number ?? "";
  if (/^DEN/i.test(k)) return "De Novo";
  if (row.pma_number) return row.supplement_number ? "PMA supplement" : "PMA";
  return "510(k)";
}

async function fdaClearances(c: CuratedSoftware, unverified: string[]): Promise<{ rows: SoftwareClearance[]; queryUrl?: string; ok: boolean }> {
  if (!c.fda) return { rows: [], ok: false };
  const url = `https://api.fda.gov/device/${c.fda.endpoint}.json?search=${encodeURIComponent(c.fda.search)}&limit=100`;
  const res = await get("fda", url, API_DELAY_MS);
  if (res.status === 404) return { rows: [], queryUrl: url, ok: false }; // openFDA answers a query with no hits with 404
  if (res.status !== 200) {
    unverified.push(`${c.name}: the FDA device database did not answer the check (openFDA returned ${res.status || "nothing"}), so any clearance it holds is not on this row.`);
    return { rows: [], queryUrl: url, ok: false };
  }
  let parsed: { results?: FdaRow[] };
  try { parsed = JSON.parse(res.body) as { results?: FdaRow[] }; } catch { return { rows: [], queryUrl: url, ok: false }; }
  const wantApplicant = c.fda.applicant?.toLowerCase();
  const wantDevice = c.fda.device?.toLowerCase();
  const seen = new Set<string>();
  const rows: SoftwareClearance[] = [];
  for (const r of parsed.results ?? []) {
    const applicant = (r.applicant ?? "").trim();
    const device = (r.device_name ?? r.trade_name ?? "").trim();
    if (!applicant || !device) continue;
    if (wantApplicant && !applicant.toLowerCase().includes(wantApplicant)) continue;
    if (wantDevice && !device.toLowerCase().includes(wantDevice)) continue;
    const base = r.k_number ?? r.pma_number;
    if (!base) continue;
    const number = r.supplement_number ? `${base}/${r.supplement_number}` : base;
    if (seen.has(number)) continue;
    const date = (r.decision_date ?? r.date_received ?? "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    seen.add(number);
    rows.push({
      authority: "FDA",
      route: clearanceRoute(r),
      number,
      device,
      applicant,
      decision: r.decision_description ?? r.supplement_reason ?? r.decision_code ?? "Recorded in the FDA device database",
      date,
      url: `https://api.fda.gov/device/${c.fda.endpoint}.json?search=${encodeURIComponent(`${r.k_number ? "k_number" : "pma_number"}:"${base}"`)}`,
    });
  }
  rows.sort((a, b) => b.date.localeCompare(a.date));
  return { rows: rows.slice(0, MAX_CLEARANCES), queryUrl: url, ok: rows.length > 0 };
}

type EpmcRow = {
  id?: string; pmid?: string; doi?: string; title?: string; abstractText?: string; pubYear?: string;
  citedByCount?: number; source?: string; journalInfo?: { journal?: { title?: string } };
};

async function papers(c: CuratedSoftware, unverified: string[]): Promise<{ rows: SoftwarePaper[]; queryUrl?: string; ok: boolean }> {
  if (!c.paperQuery) return { rows: [], ok: false };
  const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(c.paperQuery)}&format=json&pageSize=25&resultType=core&sort=${encodeURIComponent("CITED desc")}`;
  const res = await get("epmc", url, API_DELAY_MS);
  if (res.status !== 200) {
    unverified.push(`${c.name}: Europe PMC did not answer the literature check (${res.status || "no response"}), so any paper naming it is not on this row.`);
    return { rows: [], queryUrl: url, ok: false };
  }
  let parsed: { resultList?: { result?: EpmcRow[] } };
  try { parsed = JSON.parse(res.body) as { resultList?: { result?: EpmcRow[] } }; } catch { return { rows: [], queryUrl: url, ok: false }; }
  // Whole word, not substring: "Massive Bio" must not be satisfied by "massive bioinformatics", and Europe PMC's
  // own matching is loose enough that this check is what keeps another field's paper off an oncology product.
  const needle = (c.paperMatch ?? c.name).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(^|[^a-z0-9])${needle}($|[^a-z0-9])`, "i");
  const rows: SoftwarePaper[] = [];
  for (const r of parsed.resultList?.result ?? []) {
    const title = decode(r.title ?? "").replace(/\.$/, "");
    if (title.length < 6) continue;
    const haystack = `${title} ${decode(r.abstractText ?? "")}`;
    if (!match.test(haystack)) continue;
    const year = Number(r.pubYear ?? 0);
    if (!year) continue;
    const journal = r.journalInfo?.journal?.title;
    const preprint = r.source === "PPR" || /^10\.1101\//.test(r.doi ?? "") || /^10\.20944\//.test(r.doi ?? "");
    const url2 = r.doi ? `https://doi.org/${r.doi}` : r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : `https://europepmc.org/article/${r.source ?? "MED"}/${r.id ?? ""}`;
    if (!/^https:\/\//.test(url2)) continue;
    rows.push({
      title, journal: journal || undefined, year,
      doi: r.doi || undefined, pmid: r.pmid || undefined,
      citedBy: typeof r.citedByCount === "number" ? r.citedByCount : undefined,
      peerReviewed: !preprint,
      url: url2,
    });
    if (rows.length >= MAX_PAPERS) break;
  }
  return { rows, queryUrl: url, ok: rows.length > 0 };
}

async function listings(c: CuratedSoftware): Promise<{ rows: SoftwareListing[]; unverified: string[] }> {
  const rows: SoftwareListing[] = [];
  const unverified: string[] = [];
  for (const l of c.listings ?? []) {
    const res = await get("pages", l.url, PAGE_DELAY_MS);
    if (res.status !== 200) { unverified.push(`${l.body}: ${l.url} returned ${res.status || "no response"}`); continue; }
    if (!stripHtml(res.body).toLowerCase().includes(l.match.toLowerCase())) { unverified.push(`${l.body}: ${l.url} did not name "${l.match}"`); continue; }
    rows.push({ body: l.body, label: l.label, url: l.url, fetched: TODAY });
  }
  return { rows, unverified };
}

async function main() {
  const g = graph();
  const problems: string[] = [];
  const skipped: Array<{ name: string; reason: string }> = [...SKIPPED];
  const unverified: string[] = [];
  const seen = new Set<string>();
  const records: SoftwareProduct[] = [];
  const openSourceIds = new Set<string>();
  try {
    const oss = readFileSync(join(__dirname, "..", "src", "data", "open-source.ts"), "utf8");
    for (const m of oss.matchAll(/^\s{4}"id": "([a-z0-9-]+)",$/gm)) openSourceIds.add(m[1]);
  } catch { /* the open-source file is checked by its own test; a missing one is reported below */ }

  for (const c of CURATED) {
    if (seen.has(c.id)) { problems.push(`${c.id}: duplicate id`); continue; }
    seen.add(c.id);
    if (!/^https:\/\//.test(c.url)) { problems.push(`${c.id}: url must be https`); continue; }
    for (const [field, ids, kind] of [["technologies", c.technologies, "technology"], ["cancers", c.cancers, "cancer"]] as const) {
      for (const id of ids ?? []) { const e = g.get(id); if (!e || e.kind !== kind) problems.push(`${c.id}: ${field} id "${id}" is not a ${kind} in the corpus`); }
    }
    if (c.openSourceId && openSourceIds.size && !openSourceIds.has(c.openSourceId)) problems.push(`${c.id}: openSourceId "${c.openSourceId}" is not in src/data/open-source.ts`);

    let vendor = c.vendor;
    let vendorId: string | undefined;
    if (c.vendorId) {
      const e = g.get(c.vendorId);
      if (!e || (e.kind !== "company" && e.kind !== "institution")) problems.push(`${c.id}: vendorId "${c.vendorId}" is not a company or institution`);
      else { vendorId = e.id; vendor = e.name; }
    }

    const page = await get("pages", c.url, PAGE_DELAY_MS);
    let claim: SoftwareProduct["claim"];
    if (page.status === 200) {
      const text = ownWords(page.body);
      if (text) claim = { text, url: c.url, fetched: TODAY, namesProduct: stripHtml(page.body).toLowerCase().includes((c.pageMatch ?? c.name).toLowerCase()) };
    }
    // Where the company's own page did not answer, the row says so rather than leaving a silent gap in the claim column.
    const pageNote = page.status === 200 ? undefined : `The company's own page did not answer the fetch on ${TODAY} (${page.status ? `it returned ${page.status}` : "no response"}), so this row carries no claim in the company's own words and cites the source that did answer.`;

    const fda = await fdaClearances(c, unverified);
    const lit = await papers(c, unverified);
    const list = await listings(c);
    for (const u of list.unverified) unverified.push(`${c.name}: ${u}`);

    const sourcing = fda.rows.length || lit.rows.length || list.rows.length ? "independent" : "self-described";
    // The record has to cite something that answered 200 today: the company's page first, else whichever check did.
    const sourceUrl = page.status === 200 ? c.url : fda.ok ? fda.queryUrl : lit.ok ? lit.queryUrl : list.rows[0]?.url;
    if (!sourceUrl) {
      skipped.push({ name: c.name, reason: page.status === 0 ? `Nothing answered a fetch for ${c.name} on ${TODAY}: neither its own page nor a regulator or the literature.` : `${c.url} returned ${page.status} on ${TODAY} and no independent source named the product, so there was nothing to cite.` });
      console.warn(`skip ${c.id}: page ${page.status}, no independent source`);
      continue;
    }

    records.push(SoftwareProductSchema.parse({
      id: c.id, name: c.name, vendor, vendorId,
      category: c.category, segment: c.segment, summary: c.summary,
      claim, sourcing,
      clearances: fda.rows, papers: lit.rows, listings: list.rows,
      openSourceId: c.openSourceId,
      technologies: c.technologies ?? [], cancers: c.cancers ?? [],
      note: [c.note, pageNote].filter(Boolean).join(" ") || undefined,
      source: { url: sourceUrl, status: 200, fetched: TODAY },
    }));
  }

  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }

  records.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
  const independent = records.filter((r) => r.sourcing === "independent").length;
  const header = `/**
 * The software of oncology: one record per product, for /software/.
 * GENERATED by scripts/fetch-software.ts on ${TODAY} from the curated list in scripts/software-curated.ts and three
 * public services fetched the same day: the company's own page, the FDA device databases through openFDA, and
 * Europe PMC. Do not edit by hand: change the curated list and re-run.
 *
 * \`claim\` is the company's own words on the page cited, verbatim, and establishes nothing beyond what the company
 * says. \`clearances\`, \`papers\` and \`listings\` are the sources outside the company, each fetched and each checked
 * to name the product. \`sourcing\` is derived from whether any of those exist: ${independent} of ${records.length} records are
 * independently sourced, ${records.length - independent} rest on the company's own description and say so.
 * Open-source projects are not here: they are in src/data/open-source.ts and on /open-source/.
 */
import type { SoftwareProduct } from "@/lib/schema";

export const SOFTWARE_GENERATED = "${TODAY}";

/** Looked for and not recorded, with the reason: blocked, gone, out of scope, or a fetch that verified nothing. */
export const SOFTWARE_SKIPPED: Array<{ name: string; reason: string }> = ${JSON.stringify(skipped, null, 2)};

/** Sources named in the curated list that were fetched and did not name the product, so were not recorded. */
export const SOFTWARE_UNVERIFIED: string[] = ${JSON.stringify(unverified, null, 2)};

export const softwareProducts: SoftwareProduct[] = ${JSON.stringify(records, null, 2)};
`;
  writeFileSync(OUT, header);
  const byCat = new Map<string, number>();
  for (const r of records) byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
  console.log(`wrote ${records.length} records (${independent} independently sourced, ${records.length - independent} self-described), ${skipped.length} skipped`);
  for (const [k, n] of [...byCat].sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

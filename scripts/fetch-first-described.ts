/**
 * When each target was first described, from a source that says so.
 *
 * /timeline/ asks how long it takes from a target being described to a drug against it and cannot answer, because on
 * two targets in five the corpus's earliest paper postdates the first approval: our papers for a target are its
 * clinical literature, not the work that first described the protein. Taking the earliest paper we happen to hold as
 * a first description is exactly the error that finding reports, so this script does not do it.
 *
 * What it does instead: UniProt's entry for a protein cites its own literature, and the references tagged with a
 * sequence position ("NUCLEOTIDE SEQUENCE", "PROTEIN SEQUENCE") are the papers that determined the sequence, of
 * which the earliest is the cloning or sequencing paper. That year is a fact about the protein published by a curated
 * database, independent of what OnCo has read, and it is citable: the row records the paper's authors, journal, year
 * and PubMed id so a reader can check it.
 *
 * What it is not: the first description of the *biology*. p53 was seen as a 53-kilodalton band in 1979 and its cDNA
 * sequenced in 1985, and this file will say 1985. The field records that in `firstDescribedBasis: "sequence"` and the
 * note names the paper, so the figure is never mistaken for more than it is. A hand-written target may carry
 * `firstDescribedBasis: "literature"` with its own source, and the record's own value always wins.
 *
 *   npx tsx scripts/fetch-first-described.ts             fetch (or reuse the /tmp cache), report, write nothing
 *   npx tsx scripts/fetch-first-described.ts --apply     write src/data/target-first-described.ts
 *   npx tsx scripts/fetch-first-described.ts --no-fetch  use the /tmp cache only
 *
 * Network: rest.uniprot.org, one request per 100 accessions, cached as one JSON file per accession under
 * /tmp/uniprot-refs/. UniProt data is CC BY 4.0.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import type { FirstDescribedRow } from "../src/lib/first-described";
import { sleep, today } from "./feed-utils";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const noFetch = args.includes("--no-fetch");
const max = Number(args.find((a) => a.startsWith("--max="))?.slice(6) ?? 5000);
const CACHE = "/tmp/uniprot-refs";
const OUT = join(process.cwd(), "src", "data", "target-first-described.ts");
const API = "https://rest.uniprot.org/uniprotkb/search";
const UA = "OnCo fetch-first-described (https://onco.cc; hello@onco.cc)";
const BATCH = 100;
const PAUSE_MS = 400;

/** A reference position that means the paper determined the sequence, which is what dates the protein's description. */
const SEQUENCE_POSITION = /\b(NUCLEOTIDE SEQUENCE|PROTEIN SEQUENCE)\b/;

type Citation = { authors?: string[]; title?: string; journal?: string; publicationDate?: string; citationCrossReferences?: Array<{ database: string; id: string }> };
type Reference = { citation?: Citation; referencePositions?: string[] };
type Entry = { primaryAccession: string; references?: Reference[] };

const cachePath = (acc: string) => join(CACHE, `${acc}.json`);
const readCache = (acc: string): Entry | undefined => (existsSync(cachePath(acc)) ? (JSON.parse(readFileSync(cachePath(acc), "utf8")) as Entry) : undefined);

async function fetchBatch(accs: string[]): Promise<void> {
  const params = new URLSearchParams({ query: accs.map((a) => `accession:${a}`).join(" OR "), format: "json", size: String(accs.length), fields: "accession,lit_pubmed_id" });
  const res = await fetch(`${API}?${params}`, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${accs[0]}..${accs[accs.length - 1]}`);
  const data = (await res.json()) as { results?: Entry[] };
  const got = new Set<string>();
  for (const e of data.results ?? []) { writeFileSync(cachePath(e.primaryAccession), JSON.stringify(e)); got.add(e.primaryAccession); }
  // Accessions the search did not return (merged, demerged or obsolete) are cached empty so a re-run does not ask again.
  for (const a of accs) if (!got.has(a)) writeFileSync(cachePath(a), JSON.stringify({ primaryAccession: a, references: [] }));
}

/** "1985", "JUL-2004" or "15-MAR-1997" to a year. */
function yearOf(date: string | undefined): number | undefined {
  const m = /(\d{4})/.exec(date ?? "");
  const y = m ? Number(m[1]) : undefined;
  return y && y >= 1800 && y <= new Date().getFullYear() ? y : undefined;
}

/** "Zakut-Houri R.", "Oren M." -> "Zakut-Houri et al"; a single author keeps their surname. */
function authorLine(authors: string[] | undefined): string | undefined {
  const first = authors?.[0]?.replace(/\s+[A-Z].?$/, "").trim();
  if (!first) return undefined;
  return authors!.length > 1 ? `${first} et al` : first;
}

/** The earliest sequence reference on a UniProt entry, as a citable row. */
function firstDescribed(entry: Entry): Omit<FirstDescribedRow, "uniprot"> | undefined {
  const dated = (entry.references ?? [])
    .filter((r) => (r.referencePositions ?? []).some((p) => SEQUENCE_POSITION.test(p)))
    .map((r) => ({ year: yearOf(r.citation?.publicationDate), c: r.citation }))
    .filter((r): r is { year: number; c: Citation } => r.year !== undefined && r.c !== undefined)
    .sort((a, b) => a.year - b.year);
  const best = dated[0];
  if (!best) return undefined;
  const who = authorLine(best.c.authors);
  const journal = best.c.journal?.replace(/\.$/, "");
  const pmid = best.c.citationCrossReferences?.find((x) => x.database === "PubMed")?.id;
  const cite = [who, journal, String(best.year)].filter(Boolean).join(", ");
  return {
    year: best.year,
    note: `Earliest sequence paper UniProt cites for the protein: ${cite}${best.c.title ? `, "${best.c.title.replace(/\.$/, "")}"` : ""}.`,
    ...(pmid ? { pmid } : {}),
  };
}

async function main() {
  const g = graph();
  const targets = g.kind("target").filter((t) => t.uniprot).map((t) => ({ id: t.id, acc: t.uniprot! }));
  const accs = [...new Set(targets.map((t) => t.acc))];
  const missing = accs.filter((a) => !existsSync(cachePath(a)));
  console.log(`${targets.length} targets carry a UniProt accession (${accs.length} distinct); ${missing.length} not cached`);

  if (missing.length && !noFetch) {
    mkdirSync(CACHE, { recursive: true });
    let done = 0;
    for (let i = 0; i < missing.length && done < max; i += BATCH) {
      const batch = missing.slice(i, i + BATCH);
      await fetchBatch(batch);
      done += batch.length;
      await sleep(PAUSE_MS);
      if (done % 500 === 0 || done >= missing.length) console.log(`  fetched ${done}/${Math.min(missing.length, max)}`);
    }
  }

  const rows: Array<[string, FirstDescribedRow]> = [];
  let noEntry = 0, noSequenceRef = 0;
  const decades = new Map<number, number>();
  for (const t of targets) {
    const entry = readCache(t.acc);
    if (!entry) { noEntry += 1; continue; }
    const fd = firstDescribed(entry);
    if (!fd) { noSequenceRef += 1; continue; }
    rows.push([t.id, { ...fd, uniprot: t.acc }]);
    const d = Math.floor(fd.year / 10) * 10;
    decades.set(d, (decades.get(d) ?? 0) + 1);
  }
  rows.sort((a, b) => a[0].localeCompare(b[0]));
  const yrs = rows.map(([, r]) => r.year).sort((a, b) => a - b);
  console.log(`\n${rows.length} targets dated; ${noEntry} have no cached UniProt entry, ${noSequenceRef} have an entry with no sequence reference`);
  console.log(`earliest ${yrs[0]}, median ${yrs[Math.floor(yrs.length / 2)]}, latest ${yrs[yrs.length - 1]}`);
  console.log([...decades.entries()].sort((a, b) => a[0] - b[0]).map(([d, n]) => `${d}s ${n}`).join(", "));

  if (!apply) { console.log("\nplan only; pass --apply to write src/data/target-first-described.ts"); return; }
  const header = `import type { FirstDescribedRow } from "@/lib/first-described";

/**
 * GENERATED by scripts/fetch-first-described.ts on ${today()}; do not edit by hand, re-run the script (its header
 * gives the rule and its limits). UniProt data is used under CC BY 4.0.
 *
 * The year each target was first described, taken as the earliest paper UniProt cites for the protein's or its gene's
 * sequence: ${rows.length} of the ${g.kind("target").length} targets, being ${rows.length} of the ${targets.length} that carry a UniProt accession.
 * The ${g.kind("target").length - rows.length} without one keep an empty field: composite targets (BRCA1/2 together), fusions, alterations and
 * classes have no single protein to date, and ${noSequenceRef + noEntry} accessions returned no sequence paper. An empty field stays
 * empty, because the alternative is to date a protein by the earliest paper OnCo happens to hold about it, which is
 * the mistake /timeline/ reports.
 * By decade of the sequence paper: ${[...decades.entries()].sort((a, b) => a[0] - b[0]).map(([d, n]) => `${d}s ${n}`).join(", ")}.
 *
 * Merged onto the target records by src/data/index.ts where the record carries no \`firstDescribed\` of its own.
 */
export const TARGET_FIRST_DESCRIBED: Record<string, FirstDescribedRow> = {
`;
  const lines = rows.map(([id, r]) => `  ${JSON.stringify(id)}: ${JSON.stringify(r)},`);
  writeFileSync(OUT, `${header}${lines.join("\n")}\n};\n`);
  console.log(`\nwrote ${OUT} (${rows.length} targets)`);
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * Provenance: map every entity id to the last commit that touched its record, and credit contributors.
 *
 * Method: for each data file, `git blame --line-porcelain` once; find each `id: "<id>"` line and
 * the extent of its record (until the next `id: "` at the same or shallower indentation, or the
 * next top-level `}),` / `},`), then take the newest blamed commit inside that range.
 *
 * Writes public/provenance.json   { [id]: { commit, date, author, message, file } }
 * and    public/contributors.json { generated, method, contributors: [{ name, commits, records, kinds, first, last, files }] }
 *        where a record counts for an author when any surviving line of it is theirs (rendered at /contributors/).
 * Run: npm run provenance
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { graph } from "../src/lib/graph";

type Prov = { commit: string; date: string; author: string; message: string; file: string };

/**
 * Commit subjects are republished here, so anything written in one becomes a public, machine-readable artefact.
 * A commit of 10 September 2026 named a private project and that name reached public/provenance.json. The name is
 * in the repository's own history either way and rewriting public history for it would be disproportionate, but
 * this file should not repeat it, and nor should the next one. Names of the owner's private projects are redacted
 * here; add to the list rather than editing the generated file, which is rewritten on every build.
 */
const PRIVATE_NAMES = [/katsutake/gi];
const redact = (summary: string) => PRIVATE_NAMES.reduce((s, re) => s.replace(re, "a private project"), summary);

type Contributor = { name: string; commits: number; records: number; kinds: Record<string, number>; first: string; last: string; files: number };

const root = process.cwd();
/** Every data file, recursively (spikes, people, key-papers, institutions, ...); i18n and simple-text tables carry no records. */
const SKIP_DIRS = new Set(["i18n", "simple", "drafts"]);
const files: string[] = [];
const walk = (dir: string) => {
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    if (d.isDirectory()) { if (!SKIP_DIRS.has(d.name)) walk(join(dir, d.name)); }
    else if (d.name.endsWith(".ts") && !d.name.endsWith(".test.ts")) files.push(join(dir, d.name));
  }
};
walk(join(root, "src", "data"));
const g = graph();

type BlameLine = { commit: string; author: string; time: number; summary: string };

function blame(file: string): BlameLine[] {
  const out = execFileSync("git", ["blame", "--line-porcelain", "--", file], { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });
  const lines: BlameLine[] = [];
  const meta = new Map<string, { author: string; time: number; summary: string }>();
  let cur: string | null = null;
  for (const l of out.split("\n")) {
    const m = /^([0-9a-f]{40}) \d+ \d+(?: \d+)?$/.exec(l);
    if (m) { cur = m[1]; if (!meta.has(cur)) meta.set(cur, { author: "", time: 0, summary: "" }); continue; }
    if (!cur) continue;
    const mm = meta.get(cur)!;
    if (l.startsWith("author ")) mm.author = l.slice(7);
    else if (l.startsWith("author-time ")) mm.time = Number(l.slice(12));
    else if (l.startsWith("summary ")) mm.summary = l.slice(8);
    else if (l.startsWith("\t")) { lines.push({ commit: cur, ...mm }); }
  }
  return lines;
}

/** Kind from the file name when the record's lines do not say (helper-built records such as ideas.ts). */
const FILE_KIND: Record<string, string> = {
  cancers: "cancer", sections: "section", technologies: "technology", targets: "target", drugs: "drug", companies: "company", institutions: "institution",
  pathways: "pathway", terms: "term", trials: "trial", pairings: "pairing", roadmaps: "roadmap", ideas: "idea", collections: "collection", bottlenecks: "bottleneck", journals: "journal",
  "pipeline-trials": "trial", failures: "drug", groups: "institution", sources: "collection", "terms-basics": "term",
};

const iso = (t: number) => new Date(t * 1000).toISOString().slice(0, 10);

const prov: Record<string, Prov> = {};
type Acc = { commits: Set<string>; records: Set<string>; kinds: Record<string, number>; files: Set<string>; first: number; last: number };
const acc = new Map<string, Acc>();
const touch = (author: string) => { let a = acc.get(author); if (!a) { a = { commits: new Set(), records: new Set(), kinds: {}, files: new Set(), first: Number.MAX_SAFE_INTEGER, last: 0 }; acc.set(author, a); } return a; };

for (const file of files) {
  const src = readFileSync(file, "utf8").split("\n");
  let bl: BlameLine[];
  try { bl = blame(file); } catch { continue; }
  const rel = relative(root, file);
  const fileKind = FILE_KIND[basename(file, ".ts")];
  const idLines: Array<{ id: string; line: number; indent: number }> = [];
  /**
   * An entity record starts on a line carrying its id. Three forms occur:
   *   - `id: "tnbc", kind: "cancer", name: ...`   hand-written records, one line
   *   - `id: "b-tumor-heterogeneity",`            hand-written records with the id on its own line (bottlenecks, papers)
   *   - `t({"id":"ctnnb1","kind":"target",...})`  generated files (targets-genes-wave.ts and the other catalogue layers)
   * A line counts when it declares the record's `kind` or `name` (the JSON key form included), or, for the id-alone
   * form, when one of the next two lines does and the id names a record in the graph. That keeps out the supplement
   * calls (`sup<TargetInput>({ id: "ctnnb1", notes: [...] })`) and reference rows that carry an id and no record.
   * Before this, 1,441 catalogue genes and 45 bottlenecks had no provenance line although their file and commit were
   * right there in the blame.
   */
  const declares = (l: string | undefined) => !!l && /\b"?(kind|name)"?:\s?"/.test(l);
  src.forEach((l, i) => {
    const m = /^(\s*).*?\b"?id"?:\s?"([a-z0-9-]+)"/.exec(l);
    if (!m) return;
    // The record's kind or name on the same line, or on one of the next two when the id sits alone on its line.
    if (declares(l) || (g.byId.has(m[2]) && (declares(src[i + 1]) || declares(src[i + 2])))) idLines.push({ id: m[2], line: i, indent: m[1].length });
  });
  for (let k = 0; k < idLines.length; k++) {
    const { id, line } = idLines[k];
    const end = k + 1 < idLines.length ? idLines[k + 1].line : src.length;
    let best: BlameLine | null = null;
    let kind: string | undefined;
    const authorsHere = new Set<string>();
    for (let i = line; i < end && i < bl.length; i++) {
      if (!best || bl[i].time > best.time) best = bl[i];
      if (!kind) { const km = /\bkind: "([a-z]+)"/.exec(src[i]); if (km) kind = km[1]; }
      const a = touch(bl[i].author);
      a.commits.add(bl[i].commit); a.files.add(rel);
      if (bl[i].time < a.first) a.first = bl[i].time;
      if (bl[i].time > a.last) a.last = bl[i].time;
      authorsHere.add(bl[i].author);
    }
    if (!best) continue;
    const k2 = g.get(id)?.kind ?? kind ?? fileKind ?? "other";
    for (const name of authorsHere) { const a = touch(name); if (!a.records.has(id)) { a.records.add(id); a.kinds[k2] = (a.kinds[k2] ?? 0) + 1; } }
    if (prov[id] && prov[id].date >= iso(best.time)) continue; // keep newest across files
    prov[id] = { commit: best.commit.slice(0, 10), date: iso(best.time), author: best.author, message: redact(best.summary).slice(0, 120), file: rel };
  }
}

const contributors: Contributor[] = [...acc.entries()]
  .filter(([name, a]) => name && a.records.size > 0)
  .map(([name, a]) => ({ name, commits: a.commits.size, records: a.records.size, kinds: a.kinds, first: iso(a.first), last: iso(a.last), files: a.files.size }))
  .sort((x, y) => y.records - x.records || x.name.localeCompare(y.name));

mkdirSync(join(root, "public"), { recursive: true });
writeFileSync(join(root, "public", "provenance.json"), JSON.stringify(prov, null, 0));
writeFileSync(join(root, "public", "contributors.json"), JSON.stringify({ generated: new Date().toISOString(), method: "blame-lines", contributors }, null, 0));
console.log(`provenance: ${Object.keys(prov).length} entities mapped from ${files.length} files; ${contributors.length} contributors`);

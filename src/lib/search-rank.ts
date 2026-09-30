import type { Options } from "minisearch";
import type { SearchDoc } from "./search-index";

/**
 * How search results are ordered once MiniSearch has scored the words: a kind priority and a name-match boost, both
 * multipliers on the text score, so a much stronger text match can still climb past a kind above it. Shared by the
 * header palette, the search box, the search page and the 404 helper; pure functions, no MiniSearch import, so the
 * root layout keeps its small static bundle.
 */
export type SearchKind = SearchDoc["kind"];
export type Tier = 1 | 2 | 3 | 4 | 5;

/**
 * Kind priority, in the owner's words: "The patients and care helpers are the main users of this site. Reorganise
 * search results to rank objects that are more treatment, solution centric or the cancer type above less important
 * objects." So: tier 1 the cancer itself; tier 2 what can be done about it (treatments and tests, trials, technologies,
 * pairings, regimen and treatment collections, the treatment fronts, and the site's own pages such as For me,
 * Navigator, side effects and living with cancer); tier 3 the science behind it (targets, pathways, glossary terms,
 * ideas, roadmaps, bottlenecks); tier 4 who does the work (companies, institutions, people); tier 5 where it was
 * published (key papers, journals). A journal named after a cancer must not sit above the cancer.
 */
export const KIND_TIER: Record<SearchKind, Tier> = {
  cancer: 1,
  drug: 2,
  biomarker: 3,
  trial: 2,
  technology: 2,
  pairing: 2,
  collection: 2,
  section: 2,
  page: 2,
  target: 3,
  pathway: 3,
  term: 3,
  idea: 3,
  roadmap: 3,
  bottleneck: 3,
  company: 4,
  institution: 4,
  person: 4,
  paper: 5,
  journal: 5,
  // A year is a view of records that are themselves in the index, so it never outranks the record a question is about.
  year: 5,
};

/** Score multiplier per tier. Tier 5 keeps just under a third of its text score: an exact name or alias match (x3, x2) still wins. */
export const TIER_WEIGHT: Record<Tier, number> = { 1: 1, 2: 0.8, 3: 0.6, 4: 0.45, 5: 0.3 };

/**
 * How much a record's text is worth once matched, by provenance: registry-ingested trials and fetched papers carry a
 * title and little else (0.6); biomarker readouts, generated gene pages and the wave 4 cancer subtypes ("treated as
 * its parent") share names with the hand-written records they describe (0.7). One rule for both retrieval stages:
 * the concept index (semantic-docs.ts) and Ask's word search (search-client.ts askLexical). Measured 25 Sept 2026:
 * with the word stage unweighted, 132 registry trials filled the benchmark's lexical top twelves and extractive recall
 * sat at 0.409; applying this weight there took it to 0.411.
 */
export function recordWeight(kind: string, tags: readonly string[] | string): number {
  const t = typeof tags === "string" ? tags.split(/\s+/) : tags;
  if (t.includes("ctgov-ingest") || t.includes("europepmc-ingest")) return 0.6;
  // A year record is a view of records that are already in the index, and its text is the group names of what it
  // holds ("approvals", "papers", "trials reported"), which is the vocabulary of the questions themselves. At full
  // weight the 174 of them took extractive recall from 0.4346 to 0.4246, below the floor, and flattened the concept
  // index's inverse document frequency for those words. The fix is the weight, not the bar (src/lib/ask.test.ts).
  if (kind === "year") return 0.5;
  if (kind === "biomarker" || t.includes("cancer-genes-wave") || t.includes("wave4")) return 0.7;
  return 1;
}

/** Multipliers for how the query sits against the record's own name, on top of MiniSearch's field boosts. */
export const NAME_BOOST = {
  /** The query is the record's name. */
  exact: 3,
  /** The query is one of the record's aliases: less than the name, since aliases are looser ("Breast" for the journal The Breast). */
  aliasExact: 2,
  /** The name starts with the query ("breast" for "Breast cancer (all types)"). */
  namePrefix: 1.6,
  /** An alias starts with the query. */
  aliasPrefix: 1.3,
  /** Every word of the query is in the name, in order, with other words between ("laura esserman" in "Laura J. Esserman"). */
  nameInOrder: 1.5,
  /** The query is a whole word somewhere in the name ("breast" in "Male breast cancer"). */
  nameWord: 1.15,
} as const;

/**
 * The kind tier exists to break ties between records that matched the query equally well: for "breast" a
 * cancer should beat a paper with the word in its title. It is the wrong instrument when the reader has typed
 * a name. From `aliasExact` upward the tier is ignored, and a prefix match cannot be pushed below this floor.
 *
 * Found on 30 September 2026. The owner: "when typing laura esserman the first result should be that direct
 * string match". It was not. Two things were wrong and both are fixed here:
 *   1. "laura esserman" against "Laura J. Esserman" earned no name boost at all. It is not the exact name, the
 *      name does not start with it, and it is not one whole word: the middle initial defeated every rule. Hence
 *      `nameInOrder`, which is what a person types when they know who they are looking for.
 *   2. The dropdown sorted its groups by tier before score, so the LAURA trial (tier 2) was displayed above
 *      Laura J. Esserman (tier 4) even though she outscored it two to one. See `groupByKind`.
 *
 * Only an exact match on the record's own name relaxes the tier, and nothing else does. Two looser rules were
 * tried and both broke the query "breast": exempting an alias match put the journal The Breast above breast
 * cancer, because journals carry their short forms as aliases; and a floor under prefix matches put journals
 * whose names begin with "Breast" into the top five. The existing tests caught both. A one-word query is
 * exactly where the tier is doing useful work, so it keeps it.
 */

/** The MiniSearch build every consumer shares, so tests index exactly what the browser indexes. */
export const SEARCH_INDEX_OPTIONS: Options<SearchDoc> = {
  fields: ["name", "aka", "tldr", "tags", "id"],
  storeFields: ["id", "kind", "name", "aka", "tldr", "route", "status", "cancers", "parent", "tags"],
  searchOptions: { boost: { name: 4, aka: 3, id: 2 }, prefix: true, fuzzy: 0.2 },
};

/**
 * Lowercase, accents and punctuation gone, one space between words: "KEYNOTE-189" and "keynote 189" agree. A sign
 * that ends a token stays ("HER2+", "HER2\u2212"), so a biomarker state is not the bare gene, and a leading "The" is kept:
 * "The Breast" is a journal, not the query "breast" (journals carry their short forms as aliases, so "Lancet" still
 * finds The Lancet exactly).
 */
export function normaliseName(s: string): string {
  return s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/(?<=[a-z0-9])[-\u2212\u2013](?=[a-z0-9])/g, " ")
    .replace(/[^a-z0-9+\u2212-]+/g, " ")
    .trim();
}

export const tierOf = (kind: string): Tier => KIND_TIER[kind as SearchKind] ?? 3;

/** The name-match multiplier for one record against a query. Aliases arrive one per line, as search.json ships them, or as a list. */
export function nameBoost(query: string, name: string, aka?: string | string[]): number {
  const q = normaliseName(query);
  if (!q) return 1;
  const n = normaliseName(name);
  if (n === q) return NAME_BOOST.exact;
  const aliases = Array.isArray(aka) ? aka : splitAliases(aka ?? "");
  if (aliases.some((a) => normaliseName(a) === q)) return NAME_BOOST.aliasExact;
  if (n.startsWith(q)) return NAME_BOOST.namePrefix;
  if (aliases.some((a) => normaliseName(a).startsWith(q))) return NAME_BOOST.aliasPrefix;
  if (wordsInOrder(q, n) || aliases.some((a) => wordsInOrder(q, normaliseName(a)))) return NAME_BOOST.nameInOrder;
  if ((" " + n + " ").includes(" " + q + " ")) return NAME_BOOST.nameWord;
  return 1;
}

/**
 * Every word of the query appears in the name, as a whole word, in the order typed. Two words at least, so a
 * single word falls to the weaker rules above and "breast" does not claim this boost on every breast page.
 */
export function wordsInOrder(query: string, name: string): boolean {
  const qs = query.split(" ").filter(Boolean);
  if (qs.length < 2) return false;
  const ns = name.split(" ").filter(Boolean);
  let i = 0;
  for (const w of ns) if (w === qs[i] && ++i === qs.length) return true;
  return false;
}

/** The tier multiplier for a hit, given how well its name matched. See the note on TIER_EXEMPT_FROM. */
export function tierWeightFor(kind: string, boost: number): number {
  return boost === NAME_BOOST.exact ? 1 : TIER_WEIGHT[tierOf(kind)];
}

/** search.json ships aliases one per line (src/lib/search-index.ts). */
function splitAliases(aka: string): string[] {
  return aka.split("\n").map((a) => a.trim()).filter(Boolean);
}

export type Rankable = { kind: string; name: string; aka?: string | string[]; score: number };

/** Re-scores MiniSearch hits by kind tier and name match and sorts them, best first; ties keep MiniSearch's order. */
export function rankHits<T extends Rankable>(hits: readonly T[], query: string): T[] {
  return hits
    .map((h, i) => { const b = nameBoost(query, h.name, h.aka); return { h: { ...h, score: h.score * tierWeightFor(h.kind, b) * b }, i }; })
    .sort((a, b) => b.h.score - a.h.score || a.i - b.i)
    .map((x) => x.h);
}

/** Rows of one kind for the dropdown, in ranked order. */
export type KindGroup<T> = { kind: string; tier: Tier; items: T[] };

/** The dropdown shows this many rows per kind at most, so a run of one kind cannot hide the others. */
export const DROPDOWN_PER_KIND = 4;

/**
 * Groups already-ranked hits by kind for the dropdown: at most `perKind` rows of any one kind and `total` rows in all,
 * taken in ranked order, then the groups sorted by tier and, within a tier, by their best hit. The flattened groups are
 * the keyboard order.
 */
export const LEAD_MARGIN = 1.25;

export function groupByKind<T extends { kind: string; score?: number }>(hits: readonly T[], total: number, perKind = DROPDOWN_PER_KIND): KindGroup<T>[] {
  const groups = new Map<string, KindGroup<T> & { first: number }>();
  let shown = 0;
  for (let i = 0; i < hits.length && shown < total; i++) {
    const h = hits[i];
    let g = groups.get(h.kind);
    if (!g) { g = { kind: h.kind, tier: tierOf(h.kind), items: [], first: i }; groups.set(h.kind, g); }
    if (g.items.length >= perKind) continue;
    g.items.push(h);
    shown++;
  }
  // Tier order, with one exception: when the top hit beats everything outside its own kind by LEAD_MARGIN, its
  // group leads whatever its tier. Without this a reader who types a person's full name is shown a trial
  // first, because trials are tier 2 and people tier 4, and Laura J. Esserman outscored the LAURA trial two to
  // one. The margin matters: ordering on rank alone would let any hit that merely came first jump the tier,
  // and the tier is what keeps a journal called The Breast under breast cancer.
  const top = hits[0];
  const rival = hits.find((h) => h.kind !== top?.kind);
  const decisive = top?.score !== undefined && (rival?.score === undefined || top.score >= rival.score * LEAD_MARGIN);
  const lead = decisive ? top.kind : undefined;
  return [...groups.values()].filter((g) => g.items.length > 0)
    .sort((a, b) => (a.kind === lead ? -1 : b.kind === lead ? 1 : 0) || a.tier - b.tier || a.first - b.first)
    .map(({ kind, tier, items }) => ({ kind, tier, items }));
}

/** The groups' rows in display order: what ArrowUp and ArrowDown step through. */
export function flattenGroups<T>(groups: readonly KindGroup<T>[]): T[] {
  return groups.flatMap((g) => g.items);
}

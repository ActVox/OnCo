import type MiniSearch from "minisearch";
import type { SearchResult } from "minisearch";
import type { SearchDoc } from "@/lib/search-index";
import { NAME_BOOST, nameBoost, rankHits, recordWeight, SEARCH_INDEX_OPTIONS, TYPED_SEARCH_OPTIONS } from "@/lib/search-rank";
import { contentWords } from "@/lib/semantic";

/**
 * The browser-side search index: the exported /api/v1/search.json (every entity and page, one document each) inside a
 * MiniSearch instance, built once per page load and shared by the header palette, the search box, the search page,
 * Ask OnCo, the 404 helper and the WebMCP tools.
 *
 * MiniSearch itself is loaded with the first search rather than imported statically: the palette is in the root
 * layout, so anything it imports statically ships with every page, and the library is only needed once a reader types.
 */
export type SearchIndex = { ms: MiniSearch<SearchDoc>; docs: SearchDoc[]; byId: Map<string, SearchDoc> };

let cache: Promise<SearchIndex> | null = null;

export function loadSearch(): Promise<SearchIndex> {
  if (!cache) {
    const docs = fetch("/api/v1/search.json").then((r) => { if (!r.ok) throw new Error("Search index unavailable"); return r.json() as Promise<SearchDoc[]>; });
    cache = Promise.all([docs, import("minisearch")])
      .then(([docs, { default: MiniSearch }]) => {
        const ms = new MiniSearch<SearchDoc>(SEARCH_INDEX_OPTIONS);
        ms.addAll(docs);
        return { ms, docs, byId: new Map(docs.map((d) => [d.id, d])) };
      })
      .catch((error) => { cache = null; throw error; });
  }
  return cache;
}

/** A hit as the UI reads it: MiniSearch's match data plus the stored document fields. */
export type RankedHit = SearchResult & SearchDoc;

/**
 * The word search as the site shows it: MiniSearch's text scores re-weighted by kind tier and name match
 * (src/lib/search-rank.ts), best first. Every dropdown and results list should go through this rather than ms.search.
 */
export function searchRanked(ms: MiniSearch<SearchDoc>, query: string, limit?: number): RankedHit[] {
  const ranked = rankHits(ms.search(query, TYPED_SEARCH_OPTIONS) as RankedHit[], query);
  return limit === undefined ? ranked : ranked.slice(0, limit);
}

/**
 * The word search as Ask OnCo reads it, shared by the browser (/ask/, the search page), the server harness and the
 * extractive floor test: the question's function words dropped first (src/lib/semantic.ts contentWords), the hits
 * re-weighted by kind tier and name match like every other list on the site and by provenance as the concept index
 * is (search-rank.ts recordWeight), a subtype capped below its parent, pages dropped since Ask reads entity records,
 * ids only.
 */
export function askLexical(ms: MiniSearch<SearchDoc>, question: string, k: number): string[] {
  const query = contentWords(question);
  if (!query) return [];
  // Deliberately not searchRanked: that raises the weight on prefix matches for someone typing into a box, and
  // on a whole question it costs extractive recall (see TYPED_SEARCH_OPTIONS).
  const hits = rankHits(ms.search(query) as RankedHit[], query).filter((h) => h.kind !== "page");
  const byId = new Map(hits.map((h) => [String(h.id), h]));
  // A subtype's name carries its parent's name ("Large-cell lung carcinoma" under non-small-cell lung cancer), so on
  // the parent's tokens the subtypes crowd the parent out. When the parent is also a hit and the subtype matched no
  // query word the parent did not, the subtype sits just below its parent; a subtype the query names exactly, by name
  // or alias, or one that matched a word of its own ("early", "metastatic") keeps its score. Measured 24 Sept 2026 after
  // the 99 wave 4 subtype pages, which took extractive recall 0.416 to 0.403; a flat penalty on every record with a
  // parent measured 0.401 because the benchmark's expected records include subtypes.
  const capped = hits.map((h, i) => {
    const parent = h.parent ? byId.get(h.parent) : undefined;
    const weight = recordWeight(h.kind, h.tags ?? "");
    if (!parent || nameBoost(query, h.name, h.aka) >= NAME_BOOST.aliasExact) return { h, i, score: h.score * weight };
    const own = h.terms.some((t) => !parent.terms.includes(t));
    return { h, i, score: (own ? h.score : Math.min(h.score, parent.score * SUBTYPE_BELOW_PARENT)) * weight };
  });
  return capped.sort((a, b) => b.score - a.score || a.i - b.i).slice(0, k).map((x) => String(x.h.id));
}

/** A subtype that adds no matched word to its parent's scores at most this share of the parent's score. */
export const SUBTYPE_BELOW_PARENT = 0.9;

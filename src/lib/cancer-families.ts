import { graph, type Graph } from "./graph";
import type { Cancer, Entity } from "./schema";

/**
 * The family strip at the top of a cancer page: which relatives a reader meets first.
 *
 * Two decisions live here, both measured rather than chosen by taste.
 *
 * **How many.** Sixteen families carry more than six children; sarcoma has 26 and non-small-cell lung cancer 22,
 * about a thousand characters of chips before the page says anything about the cancer itself. Six chips plus the
 * parent is one line on a laptop and three on a phone, so six is the cap and the rest go behind a fold. The
 * seventy families with six or fewer children are unchanged.
 *
 * **In what order.** The children come out of the corpus in file order, which is alphabetical, and alphabetical
 * puts the rarest entity first: on /cancers/tnbc/ the strip opened with adenoid cystic and apocrine carcinoma of
 * the breast (one standard-of-care row each, no trials) and the two pages almost every reader of that page needs,
 * early and metastatic triple-negative disease, sat seventh and eighth. Ordering by how much the corpus actually
 * holds for each child fixes that without anyone having to rank cancers by hand:
 *
 *     depth = 3 x standard-of-care rows + history events + pipeline entries + trials pointing at the page
 *
 * A standard-of-care row is what a patient came for, so it counts triple; the other three count once each. The
 * weight on the rows is not load-bearing - weights of 1, 2, 3 and 4 all produce the same leaders on the three
 * families the owner checked - so the ordering is a property of the corpus, not of the multiplier:
 *
 *     triple-negative breast cancer   early (193), metastatic (186), then BRCA-associated (12)
 *     sarcoma                         osteosarcoma (45), GIST (37), Ewing sarcoma (34)
 *     non-small-cell lung cancer      EGFR-mutant (189), resectable (150), KRAS G12C (68)
 *
 * Measured 28 September 2026 by scripts/cancer-family-order.ts; src/lib/cancer-families.test.ts holds the order
 * and the cap to it. Every subtype in the corpus has a depth above zero, so the fold never hides a page that the
 * ordering could not rank.
 */
export const FAMILY_CHIPS = 6;

/** How much of this cancer the corpus holds, as the family strip orders its chips. */
export function corpusDepth(c: Cancer, g: Graph = graph()): number {
  const trials = (g.incoming(c.id).get("trial") ?? []).length;
  return 3 * c.standardOfCare.length + c.history.length + c.pipeline.length + trials;
}

/** Children of a family, deepest first; ties broken by name so the order is stable between builds. */
export function familyChildren(parentId: string, g: Graph = graph()): Cancer[] {
  const children = g.kind("cancer").filter((x) => x.parent === parentId);
  return children.sort((a, b) => corpusDepth(b, g) - corpusDepth(a, g) || a.name.localeCompare(b.name));
}

/**
 * The strip as the page renders it: the parent (always shown, it is the most useful chip), the first
 * FAMILY_CHIPS children, and the rest, which go behind a fold in the markup rather than out of it.
 */
export function familyStrip(c: Cancer, g: Graph = graph()): { parent?: Entity; shown: Cancer[]; folded: Cancer[] } {
  const children = familyChildren(c.id, g);
  return { parent: c.parent ? g.get(c.parent) : undefined, shown: children.slice(0, FAMILY_CHIPS), folded: children.slice(FAMILY_CHIPS) };
}

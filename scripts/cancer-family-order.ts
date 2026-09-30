/**
 * What the family strip at the top of a cancer page shows, and what it folds (src/lib/cancer-families.ts).
 *
 * Run it to see the ordering the page uses and the measurements behind the cap, or after a wave that adds subtypes
 * to check that a family's leaders are still the pages a reader of that page needs:
 *
 *   npx tsx scripts/cancer-family-order.ts                 # every family with a fold
 *   npx tsx scripts/cancer-family-order.ts tnbc sarcoma    # one family each, with the depth of every child
 *
 * The rule and the reason for the weights are in src/lib/cancer-families.ts; src/lib/cancer-families.test.ts
 * holds the order and the cap. This script only reports.
 */
import { graph } from "../src/lib/graph";
import { FAMILY_CHIPS, corpusDepth, familyChildren } from "../src/lib/cancer-families";
import type { Cancer } from "../src/lib/schema";

const g = graph();
const cancers = g.kind("cancer") as Cancer[];
const asked = process.argv.slice(2);
const trials = (id: string) => (g.incoming(id).get("trial") ?? []).length;
const chars = (list: Cancer[]) => list.reduce((a, k) => a + k.name.length, 0);

if (asked.length) {
  for (const id of asked) {
    const kids = familyChildren(id, g);
    if (!kids.length) { console.log(`${id}: no children`); continue; }
    console.log(`\n${id}: ${kids.length} children, ${chars(kids)} characters of chips, ${Math.max(0, kids.length - FAMILY_CHIPS)} folded`);
    kids.forEach((k, i) => {
      const mark = i < FAMILY_CHIPS ? "shown " : "folded";
      console.log(`  ${mark} ${String(corpusDepth(k, g)).padStart(4)}  care ${k.standardOfCare.length}, history ${k.history.length}, pipeline ${k.pipeline.length}, trials ${trials(k.id)}  ${k.id}`);
    });
  }
} else {
  const families = cancers
    .map((c) => ({ c, kids: familyChildren(c.id, g) }))
    .filter((f) => f.kids.length > FAMILY_CHIPS)
    .sort((a, b) => b.kids.length - a.kids.length);
  console.log(`${families.length} of ${cancers.filter((c) => familyChildren(c.id, g).length).length} families fold (more than ${FAMILY_CHIPS} children)\n`);
  console.log("children  chars  shown chars  leads with");
  for (const f of families) {
    const shown = f.kids.slice(0, FAMILY_CHIPS);
    console.log(`${String(f.kids.length).padStart(8)}${String(chars(f.kids)).padStart(7)}${String(chars(shown)).padStart(13)}  ${f.c.id}: ${shown.slice(0, 3).map((k) => k.id).join(", ")}`);
  }
}

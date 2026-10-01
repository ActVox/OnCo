import { describe, expect, it } from "vitest";
import { exportedNamedIn as namedIn } from "./propose-updates";

/**
 * The update bot reads FDA approval notices and proposes a regulatory event on the product the notice is about.
 * Which product that is was decided by matching any word of five letters or more from the record's name, brand
 * or aliases against the notice title.
 *
 * That matched a combination record whenever one of its partners was named. On 30 September 2026 and again on
 * 1 October it proposed putting
 *
 *   "FDA grants accelerated approval to vusolimogene oderparepvec-wtpg in combination with nivolumab for melanoma"
 *
 * on the page for Relatlimab + nivolumab, a different combination that had nothing to do with that approval,
 * because both contain nivolumab. Twice a person had to recognise it. It is the same shape as the `imid`
 * fragment in the red cards: a loose match that produces a confident false claim.
 */
describe("which product an FDA notice is about", () => {
  const d = (name: string, brand?: string, aka: string[] = []) => ({ name, brand, aka });
  const VUSO = "FDA grants accelerated approval to vusolimogene oderparepvec-wtpg in combination with nivolumab for melanoma";

  it("does not claim a combination because one of its partners is named", () => {
    expect(namedIn(VUSO, d("Relatlimab + nivolumab"))).toBe(false);
    expect(namedIn(VUSO, d("Nivolumab/ipilimumab"))).toBe(false);
  });

  it("claims the combination when every component is named", () => {
    expect(namedIn("FDA approves imlunestrant in combination with abemaciclib for ER-positive breast cancer", d("Imlunestrant + abemaciclib"))).toBe(true);
    expect(namedIn(VUSO, d("Vusolimogene oderparepvec and nivolumab"))).toBe(true);
  });

  it("still claims a single product named in the notice, by name, brand or alias", () => {
    expect(namedIn(VUSO, d("Nivolumab", "Opdivo"))).toBe(true);
    expect(namedIn("FDA approves belzutifan in combination with lenvatinib for renal cell carcinoma", d("Belzutifan", "Welireg"))).toBe(true);
    expect(namedIn("FDA approves lirafugratinib for cholangiocarcinoma", d("Lirafugratinib", "Lyrfigtu", ["RLY-4008"]))).toBe(true);
  });

  it("does not claim a product the notice never mentions", () => {
    expect(namedIn(VUSO, d("Pembrolizumab", "Keytruda"))).toBe(false);
  });
});

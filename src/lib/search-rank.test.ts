import { beforeAll, describe, expect, it } from "vitest";
import MiniSearch from "minisearch";
import { siteSearchDocs, type SearchDoc } from "./search-index";
import { KINDS } from "./kinds";
import { DROPDOWN_PER_KIND, flattenGroups, groupByKind, KIND_TIER, NAME_BOOST, nameBoost, normaliseName, rankHits, SEARCH_INDEX_OPTIONS, TIER_WEIGHT } from "./search-rank";

/** The real index, built exactly as the browser builds it (about half a second), so the ranking tests see the live corpus. */
let ms: MiniSearch<SearchDoc>;
const search = (q: string) => rankHits(ms.search(q) as unknown as Array<SearchDoc & { score: number }>, q);
const top = (q: string, n: number) => search(q).slice(0, n).map((h) => `${h.kind}:${h.id}`);

beforeAll(() => {
  ms = new MiniSearch<SearchDoc>(SEARCH_INDEX_OPTIONS);
  ms.addAll(siteSearchDocs());
});

describe("kind tiers", () => {
  it("cover every kind and the site pages, cancers first and journals last", () => {
    for (const k of KINDS) expect(KIND_TIER[k], k).toBeGreaterThanOrEqual(1);
    expect(KIND_TIER.page).toBe(2);
    expect(KIND_TIER.cancer).toBe(1);
    expect(KIND_TIER.drug).toBe(2);
    expect(KIND_TIER.trial).toBe(2);
    expect(KIND_TIER.target).toBe(3);
    expect(KIND_TIER.person).toBe(4);
    expect(KIND_TIER.journal).toBe(5);
    expect(KIND_TIER.paper).toBe(5);
    expect(TIER_WEIGHT[1]).toBe(1);
    for (let t = 1; t < 5; t++) expect(TIER_WEIGHT[(t + 1) as 2 | 3 | 4 | 5]).toBeLessThan(TIER_WEIGHT[t as 1 | 2 | 3 | 4]);
  });
});

describe("name match boost", () => {
  it("normalises case, punctuation and accents but keeps a trailing sign and a leading The", () => {
    expect(normaliseName("The Lancet")).toBe("the lancet");
    expect(normaliseName("KEYNOTE-189")).toBe("keynote 189");
    expect(normaliseName("Gustave Roussy")).toBe("gustave roussy");
    expect(normaliseName("Breast cancer (all types)")).toBe("breast cancer all types");
    expect(normaliseName("HER2+")).toBe("her2+");
    expect(normaliseName("HER2−")).toBe("her2−");
    expect(normaliseName("HER2-positive")).toBe("her2 positive");
    expect(normaliseName("PD-L1")).toBe("pd l1");
  });
  it("rewards the query being the name, then an alias, then a name prefix, then an alias prefix, then a whole word in the name", () => {
    expect(nameBoost("lancet", "The Lancet", "Lancet")).toBe(2);
    // A biomarker state is not the bare gene, and a journal called The Breast is not the query "breast".
    expect(nameBoost("HER2", "HER2-positive (IHC 3+ or ISH-amplified)", "HER2-positive\nHER2+\nHER2−")).toBe(1.6);
    expect(nameBoost("breast", "The Breast", "Breast (Edinburgh, Scotland)")).toBe(1.3);
    expect(nameBoost("breast", "The Breast", "Breast\nBreast (Edinburgh, Scotland)")).toBe(2);
    expect(nameBoost("breast", "Breast cancer (all types)", "Breast carcinoma\nCarcinoma of the breast")).toBe(1.6);
    expect(nameBoost("bronch", "Lung cancer (all types)", "Bronchogenic carcinoma\nLung carcinoma")).toBe(1.3);
    expect(nameBoost("breast", "Male breast cancer", "")).toBe(1.15);
    expect(nameBoost("breast", "Sacituzumab govitecan", "")).toBe(1);
    expect(nameBoost("her2", "HER2", "")).toBe(3);
    expect(nameBoost("ibc", "Inflammatory breast cancer", ["IBC", "T4d breast cancer"])).toBe(2);
    // A word inside a multi-word alias is not an exact match: "Breast cancer in men" does not make "breast" the name.
    expect(nameBoost("breast", "Male breast cancer", "Breast cancer in men")).toBe(1.3);
  });
});

describe("ranked search over the live index", () => {
  it("breast: the cancer first and no journal in the top five", () => {
    const five = top("breast", 5);
    expect(five[0]).toBe("cancer:breast-cancer");
    expect(five.some((x) => x.startsWith("journal:"))).toBe(false);
  });
  it("lung: lung cancers above every person and institution", () => {
    const all = search("lung");
    const firstCancer = all.findIndex((h) => h.kind === "cancer" && /lung/i.test(h.name));
    const firstWho = all.findIndex((h) => h.kind === "person" || h.kind === "institution");
    expect(all[0].kind).toBe("cancer");
    expect(all[0].id).toBe("lung-cancer");
    expect(firstCancer).toBeLessThan(firstWho);
  });
  it("pembrolizumab: the drug first", () => {
    expect(top("pembrolizumab", 1)).toEqual(["drug:pembrolizumab"]);
  });
  it("Lancet: the journal still first, an exact name match winning its tier penalty", () => {
    expect(top("Lancet", 1)).toEqual(["journal:lancet"]);
  });
  it("KEYNOTE-189: the trial first, above its paper", () => {
    const first = search("KEYNOTE-189")[0];
    expect(first.kind).toBe("trial");
    expect(first.name).toContain("KEYNOTE-189");
  });
  it("HER2: the target or the HER2-positive cancer subtype in the top three", () => {
    const three = search("HER2").slice(0, 3);
    expect(three.some((h) => h.id === "her2" || (h.kind === "cancer" && /HER2-positive/i.test(h.name)))).toBe(true);
  });
  it("a multiplier, not a hard sort: a strong text match can still climb past a kind above it", () => {
    // Sorted by adjusted score; the tier alone never decides, so somewhere in the corpus a lower tier precedes a higher one.
    const all = search("Lancet");
    expect(all[0].kind).toBe("journal");
    expect(all.some((h) => h.kind === "person")).toBe(true);
  });
});

describe("dropdown grouping", () => {
  const hit = (kind: string, id: string) => ({ kind, id, name: id, score: 1 });
  it("caps rows per kind, keeps the total, and orders groups by tier then best hit", () => {
    const hits = [hit("journal", "j1"), ...Array.from({ length: 6 }, (_, i) => hit("cancer", `c${i}`)), hit("drug", "d1"), hit("trial", "t1"), hit("person", "p1"), hit("drug", "d2")];
    const groups = groupByKind(hits, 8, 4);
    // Rows are taken in ranked order until the total is reached (c4, c5 over the cap, d2 past the total), then grouped.
    expect(groups.map((g) => g.kind)).toEqual(["cancer", "drug", "trial", "person", "journal"]);
    expect(groups[0].items.map((h) => h.id)).toEqual(["c0", "c1", "c2", "c3"]);
    expect(flattenGroups(groups)).toHaveLength(8);
    expect(flattenGroups(groups).map((h) => h.id)).toEqual(["c0", "c1", "c2", "c3", "d1", "t1", "p1", "j1"]);
  });
  it("shows a handful per kind in the real dropdown so cancers do not hide treatments", () => {
    const groups = groupByKind(search("breast"), 12);
    expect(groups[0].kind).toBe("cancer");
    expect(groups[0].items).toHaveLength(DROPDOWN_PER_KIND);
    expect(flattenGroups(groups)).toHaveLength(12);
    expect(groups.length).toBeGreaterThan(1);
    for (let i = 1; i < groups.length; i++) expect(groups[i].tier).toBeGreaterThanOrEqual(groups[i - 1].tier);
  });
});

describe("a name typed in full wins", () => {
  /**
   * The owner, 30 September 2026: "when typing laura esserman the first result should be that direct string
   * match, improve our search cmd k function to have better matching for direct or partial in order string
   * matching."
   *
   * Two separate faults, both held here. The score: "laura esserman" against "Laura J. Esserman" earned no
   * name boost at all, because a middle initial defeats exact, prefix and whole-word alike. The display: the
   * dropdown ordered its groups by kind tier before score, so the LAURA trial led on a page where the person
   * had twice its score.
   */
  it("scores a full name typed without the middle initial", () => {
    expect(nameBoost("laura esserman", "Laura J. Esserman")).toBe(NAME_BOOST.nameInOrder);
    expect(nameBoost("carl june", "Carl H. June")).toBe(NAME_BOOST.nameInOrder);
    // In order, not merely present: a surname before a forename is not the same claim.
    expect(nameBoost("esserman laura", "Laura J. Esserman")).toBe(1);
    // One word keeps the older, weaker rules, so "breast" does not claim this on every breast page.
    expect(nameBoost("breast", "Male breast cancer")).toBe(NAME_BOOST.nameWord);
  });

  it("puts the person first in the dropdown, ahead of a higher-tier trial", () => {
    const rows = flattenGroups(groupByKind(search("laura esserman"), 8));
    expect(rows[0]?.name).toBe("Laura J. Esserman");
    expect(rows.findIndex((r) => r.kind === "trial")).toBeGreaterThan(0);
  });

  it("only a decisive lead jumps the tier, so close scores keep the kind order", () => {
    const tie = [{ kind: "journal", id: "j", name: "j", score: 10 }, { kind: "cancer", id: "c", name: "c", score: 9 }];
    expect(groupByKind(tie, 5).map((g) => g.kind)).toEqual(["cancer", "journal"]);
    const clear = [{ kind: "person", id: "p", name: "p", score: 100 }, { kind: "cancer", id: "c", name: "c", score: 10 }];
    expect(groupByKind(clear, 5).map((g) => g.kind)).toEqual(["person", "cancer"]);
  });

  it("the tier still decides for a one-word query, so a journal stays under the cancer", () => {
    expect(top("breast", 5)[0]).toBe("cancer:breast-cancer");
    expect(top("breast", 5).some((x) => x.startsWith("journal:"))).toBe(false);
  });
});

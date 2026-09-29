import { describe, expect, it } from "vitest";
import { SOFTWARE_GENERATED, SOFTWARE_SKIPPED, SOFTWARE_UNVERIFIED, softwareProducts } from "./software";
import { openSourceProjects } from "./open-source";
import { SOFTWARE_CATEGORIES, SOFTWARE_SEGMENTS, SoftwareProductSchema } from "@/lib/schema";
import { graph } from "@/lib/graph";
import { evidenceKinds, SOFTWARE_CATEGORY_META, SOFTWARE_SEGMENT_ORDER, SOFTWARE_SOURCING_META } from "@/lib/software";
import { CURATED, SKIPPED } from "../../scripts/software-curated";

/**
 * The generated software records (src/data/software.ts) and the curated list they come from. The point of the page
 * is that a reader can tell a sourced row from an unsourced one, so the invariants are mostly about that: every
 * record's `sourcing` is derived from the sources it actually carries and cannot be asserted by a curator; every
 * clearance is an FDA number with an openFDA query behind it; every paper resolves to a DOI, a PubMed record or a
 * Europe PMC one; and a claim is always attributed to the page it was read from, never presented as a finding.
 */
describe("software products", () => {
  it("has a useful number of records generated on a plausible date", () => {
    expect(softwareProducts.length).toBeGreaterThanOrEqual(80);
    expect(SOFTWARE_GENERATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("every record validates against the schema", () => {
    for (const p of softwareProducts) expect(() => SoftwareProductSchema.parse(p), p.id).not.toThrow();
  });

  it("ids are unique kebab-case and names are unique", () => {
    const ids = softwareProducts.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    const names = softwareProducts.map((p) => p.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("every record cites a URL that answered 200 on the generation date, and every URL is https", () => {
    for (const p of softwareProducts) {
      expect(p.source.status).toBe(200);
      expect(p.source.fetched).toBe(SOFTWARE_GENERATED);
      for (const u of [p.source.url, p.claim?.url, ...p.clearances.map((c) => c.url), ...p.papers.map((x) => x.url), ...p.listings.map((l) => l.url)].filter((x): x is string => !!x)) {
        expect(u, `${p.id}: ${u}`).toMatch(/^https:\/\//);
      }
    }
  });

  it("sourcing is derived from the sources the record carries, never asserted", () => {
    for (const p of softwareProducts) {
      const hasSource = p.clearances.length + p.papers.length + p.listings.length > 0;
      expect(p.sourcing, `${p.id} carries ${hasSource ? "sources" : "no source"} but says ${p.sourcing}`).toBe(hasSource ? "independent" : "self-described");
      expect(SOFTWARE_SOURCING_META[p.sourcing]).toBeTruthy();
      const kinds = evidenceKinds(p);
      expect(kinds.length).toBeGreaterThan(0);
      expect(kinds.includes("None")).toBe(!hasSource);
    }
  });

  it("both kinds of row exist, so the distinction the page makes is a real one", () => {
    const independent = softwareProducts.filter((p) => p.sourcing === "independent");
    const self = softwareProducts.filter((p) => p.sourcing === "self-described");
    expect(independent.length).toBeGreaterThan(20);
    expect(self.length).toBeGreaterThan(0);
  });

  it("clearances are FDA numbers with the openFDA query that returned them", () => {
    for (const p of softwareProducts) {
      for (const c of p.clearances) {
        expect(c.authority).toBe("FDA");
        expect(c.number, `${p.id}: ${c.number}`).toMatch(/^(K\d{6}|DEN\d{6}|P\d{6}(\/S\d{3})?)$/i);
        expect(c.date, `${p.id}: ${c.date}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(c.url).toMatch(/^https:\/\/api\.fda\.gov\/device\/(510k|pma)\.json\?search=/);
        expect(c.device.length).toBeGreaterThan(0);
        expect(c.applicant.length).toBeGreaterThan(0);
        if (c.route === "De Novo") expect(c.number).toMatch(/^DEN/i);
        if (c.route === "PMA supplement") expect(c.number).toContain("/");
      }
    }
  });

  it("papers resolve to a real record and preprints are marked as preprints", () => {
    for (const p of softwareProducts) {
      for (const x of p.papers) {
        expect(x.year).toBeGreaterThan(1950);
        expect(x.year).toBeLessThanOrEqual(Number(SOFTWARE_GENERATED.slice(0, 4)) + 1);
        if (x.doi) expect(x.doi, `${p.id}: ${x.doi}`).toMatch(/^10\.\d{4,9}\//);
        if (x.pmid) expect(x.pmid).toMatch(/^\d+$/);
        expect(typeof x.peerReviewed).toBe("boolean");
        if (x.doi?.startsWith("10.1101/")) expect(x.peerReviewed, `${p.id}: ${x.doi} is a bioRxiv or medRxiv preprint`).toBe(false);
      }
    }
  });

  it("a claim is always attributed to the page it was read from", () => {
    for (const p of softwareProducts) {
      if (!p.claim) continue;
      expect(p.claim.fetched).toBe(SOFTWARE_GENERATED);
      expect(p.claim.text.length).toBeGreaterThan(0);
      expect(typeof p.claim.namesProduct).toBe("boolean");
      // A claim only ever comes from the company's own page, so that page is what the record cites.
      expect(p.source.url).toBe(p.claim.url);
    }
  });

  it("every corpus id referenced exists and is of the right kind", () => {
    const g = graph();
    const openSourceIds = new Set(openSourceProjects.map((o) => o.id));
    for (const p of softwareProducts) {
      for (const id of p.technologies) expect(g.get(id)?.kind, `${p.id}: technology ${id}`).toBe("technology");
      for (const id of p.cancers) expect(g.get(id)?.kind, `${p.id}: cancer ${id}`).toBe("cancer");
      if (p.vendorId) expect(["company", "institution"], `${p.id}: vendor ${p.vendorId}`).toContain(g.get(p.vendorId)?.kind);
      if (p.openSourceId) expect(openSourceIds.has(p.openSourceId), `${p.id}: openSourceId ${p.openSourceId}`).toBe(true);
    }
  });

  it("categories and segments all have display metadata, and every category is used", () => {
    for (const c of SOFTWARE_CATEGORIES) expect(SOFTWARE_CATEGORY_META[c].glyph).toMatch(/^M/);
    expect(new Set(SOFTWARE_SEGMENT_ORDER)).toEqual(new Set(SOFTWARE_SEGMENTS));
    const used = new Set(softwareProducts.map((p) => p.category));
    for (const c of SOFTWARE_CATEGORIES) expect(used.has(c), `no record in category ${c}`).toBe(true);
  });

  it("does not duplicate the open-source map, and points at it where the two meet", () => {
    const openSourceNames = new Set(openSourceProjects.map((o) => o.name.toLowerCase()));
    for (const p of softwareProducts) expect(openSourceNames.has(p.name.toLowerCase()), `${p.id} is already on /open-source/`).toBe(false);
    // The research category exists to pick up what /open-source/ excluded for being closed or commercial.
    const research = softwareProducts.filter((p) => p.category === "research-analysis");
    expect(research.length).toBeGreaterThan(4);
    for (const p of research) expect(p.note, `${p.id} needs a note saying why it is not on /open-source/`).toBeTruthy();
  });

  it("records the product from issue 63 on the footing its sources support", () => {
    const atlas = softwareProducts.find((p) => p.id === "atlas-onco");
    expect(atlas, "the Atlas record is the answer to issue 63 and has to exist").toBeTruthy();
    expect(atlas?.category).toBe("case-review");
    expect(atlas?.claim?.url).toBe("https://atlasonco.com/");
    expect(atlas?.note).toMatch(/issue 63/);
    // If nothing outside the company is ever found, the row must keep saying so rather than drift.
    if (!atlas?.clearances.length && !atlas?.papers.length && !atlas?.listings.length) expect(atlas?.sourcing).toBe("self-described");
  });

  it("every curated entry is either generated or explained in the skipped list", () => {
    const generated = new Set(softwareProducts.map((p) => p.id));
    const skippedNames = SOFTWARE_SKIPPED.map((s) => s.name.toLowerCase());
    const curatedIds = CURATED.map((c) => c.id);
    expect(new Set(curatedIds).size).toBe(curatedIds.length);
    for (const c of CURATED) {
      if (generated.has(c.id)) continue;
      const explained = skippedNames.some((n) => n.includes(c.name.toLowerCase()) || n.includes(c.id));
      expect(explained, `${c.id} (${c.name}) is neither generated nor in the skipped list`).toBe(true);
    }
    expect(SOFTWARE_SKIPPED.length).toBeGreaterThanOrEqual(SKIPPED.length);
    for (const s of SOFTWARE_SKIPPED) expect(s.reason.length).toBeGreaterThan(20);
    for (const u of SOFTWARE_UNVERIFIED) expect(u.length).toBeGreaterThan(10);
  });

  it("uses UK spelling and no em-dashes in the hand-written text", () => {
    for (const p of softwareProducts) {
      const text = [p.summary, p.note].filter(Boolean).join(" ");
      expect(text, p.id).not.toMatch(/—/);
      expect(text, p.id).not.toMatch(/\b(license|licensed by|colors?|standardized|organizations?|catalog|analyzed?)\b/);
    }
  });
});

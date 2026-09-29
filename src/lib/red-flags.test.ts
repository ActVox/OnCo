import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { isGone, isUnreachable, type LinksReport } from "../../scripts/check-links";
import { graph } from "./graph";
import { GENERAL_RED_FLAGS, redFlagSets, redFlagsFor, redFlagsForCancerId, redFlagSources, redFlagSourceUrls } from "@/data/red-flags";

describe("red flags", () => {
  it("every set has a match rule, every flag has a source URL, and copy has no em-dashes", () => {
    for (const s of redFlagSets) {
      expect(!!(s.drugIds?.length || s.modalityRe || s.cancerIds?.length), s.id).toBe(true);
      expect(s.flags.length, s.id).toBeGreaterThan(0);
      if (s.modalityRe) expect(() => new RegExp(s.modalityRe as string, "i")).not.toThrow();
      for (const f of [...s.flags, ...GENERAL_RED_FLAGS.flags]) {
        expect(f.source.url, `${s.id}: ${f.symptom}`).toMatch(/^https:\/\//);
        expect(`${f.symptom} ${f.threshold}`).not.toMatch(/—/);
      }
    }
    expect(GENERAL_RED_FLAGS.flags.length).toBeGreaterThan(3);
  });

  it("every drugId is a product in the corpus", () => {
    const g = graph();
    for (const s of redFlagSets) for (const id of s.drugIds ?? []) {
      const e = g.get(id);
      expect(e?.kind, `${s.id}: ${id}`).toBe("drug");
    }
  });

  it("cancer-scoped sets name real cancers and link to real records", () => {
    const g = graph();
    for (const s of redFlagSets) {
      for (const id of s.cancerIds ?? []) expect(g.get(id)?.kind, `${s.id}: ${id}`).toBe("cancer");
      for (const id of s.concernIds ?? []) expect(g.get(id), `${s.id}: ${id}`).toBeDefined();
    }
    expect(redFlagsForCancerId("gallbladder").map((s) => s.id)).toEqual(["biliary-cholangitis", "biliary-obstruction", "biliary-bleeding", "biliary-pain"]);
    // The family's cards reach the branch pages, as they do for prostate and lung: a triple-negative reader was
    // getting no spinal cord compression card at all. The family sepsis card stops short of this page because
    // this page has its own, naming the drugs it is given; one page, one sepsis card.
    expect(redFlagsForCancerId("tnbc").map((s) => s.id)).toEqual(["tnbc-neutropenic-sepsis", "tnbc-immune-reactions", "tnbc-adc-lung", "breast-cord-compression", "breast-lymphoedema-cellulitis", "breast-recurrence-signs"]);
    expect(redFlagsForCancerId("breast-her2-positive").map((s) => s.id)).toEqual(["breast-infection-sepsis", "breast-cord-compression", "breast-lymphoedema-cellulitis", "breast-recurrence-signs"]);
    expect(redFlagsForCancerId("pancreatic").map((s) => s.id)).toEqual(["pancreatic-cholangitis", "pancreatic-biliary-obstruction", "pancreatic-neutropenic-sepsis", "pancreatic-bleeding", "pancreatic-bowel-obstruction", "pancreatic-blood-clot"]);
    expect(redFlagsForCancerId("colorectal").map((s) => s.id)).toEqual(["colorectal-bowel-obstruction", "colorectal-perforation-peritonitis", "colorectal-neutropenic-sepsis", "colorectal-bleeding", "colorectal-stoma-emergencies", "colorectal-oxaliplatin-egfr"]);
    expect(redFlagsForCancerId("nsclc").map((s) => s.id)).toEqual(["lung-breathlessness", "lung-pneumonitis", "lung-neutropenic-sepsis", "lung-haemoptysis", "lung-svc-obstruction", "lung-spinal-cord-compression"]);
    expect(redFlagsForCancerId("sclc").map((s) => s.id)).toEqual(redFlagsForCancerId("nsclc").map((s) => s.id));
    expect(redFlagsForCancerId("prostate").map((s) => s.id)).toEqual(["prostate-cord-compression", "prostate-urinary-retention", "prostate-bone-pain", "prostate-hormone-therapy", "prostate-sexual-function", "prostate-docetaxel-sepsis"]);
    // Cord compression is the prostate emergency men are least often warned about: it leads on every prostate record that carries it.
    for (const id of ["prostate", "prostate-mhspc", "prostate-mcrpc", "prostate-nmcrpc"]) expect(redFlagsForCancerId(id)[0]?.id, id).toBe("prostate-cord-compression");
    // The breast family page carries what is shared whichever receptor result comes back; the immune-related and
    // deruxtecan lung cards stay on the subtype that prescribes those drugs.
    expect(redFlagsForCancerId("breast-cancer").map((s) => s.id)).toEqual(["breast-infection-sepsis", "breast-cord-compression", "breast-lymphoedema-cellulitis", "breast-recurrence-signs"]);
    expect(redFlagsForCancerId("mesothelioma")).toEqual([]);
  });

  it("matches the main classes by id or modality", () => {
    const g = graph();
    const pick = (id: string) => { const d = g.must(id); return d.kind === "drug" ? redFlagsFor(d.id, d.modality).map((s) => s.id) : []; };
    expect(pick("pembrolizumab")).toContain("checkpoint-inhibitors");
    expect(pick("trastuzumab-deruxtecan")).toContain("deruxtecan-adcs");
    expect(pick("enfortumab-vedotin")).toContain("adcs");
    expect(pick("axicabtagene-ciloleucel")).toContain("car-t");
    expect(pick("teclistamab")).toContain("t-cell-engagers");
    expect(pick("doxorubicin")).toContain("cytotoxic");
    expect(pick("bevacizumab")).toContain("vegf-inhibitors");
    expect(pick("osimertinib")).toContain("kinase-inhibitors");
    expect(pick("ibrutinib")).toContain("btk-inhibitors");
    expect(pick("olaparib")).toContain("parp-inhibitors");
    expect(pick("radium-223")).toContain("radioligands");
    expect(pick("venetoclax")).toContain("venetoclax");
    // A PET tracer is not a therapy and should get no class card.
    expect(pick("ga68-dotatate")).toEqual([]);
  });

  it("covers most products that carry structured toxicity data", () => {
    const g = graph();
    const withTox = g.kind("drug").filter((d) => d.toxicity.length);
    const covered = withTox.filter((d) => redFlagsFor(d.id, d.modality).length > 0);
    expect(covered.length / withTox.length).toBeGreaterThan(0.6);
  });
});

describe("red flag sources", () => {
  /** Every row, with the set it came from, so a failure names the rows a dead constant took down. */
  const rows = [GENERAL_RED_FLAGS, ...redFlagSets].flatMap((s) => s.flags.map((f) => ({ set: s.id, symptom: f.symptom, source: f.source })));

  it("every source URL is https, has a label, and is reachable in principle", () => {
    for (const r of rows) {
      expect(r.source.url, `${r.set}: ${r.symptom}`).toMatch(/^https:\/\//);
      expect(r.source.label.trim().length, `${r.set}: ${r.symptom}`).toBeGreaterThan(3);
      expect(() => new URL(r.source.url), `${r.set}: ${r.symptom}`).not.toThrow();
    }
    expect(redFlagSourceUrls().length).toBeGreaterThan(10);
    expect(redFlagSources().length).toBe(redFlagSourceUrls().length);
  });

  it("one label means one URL, so a fix to a shared constant reaches every row citing it", () => {
    const urlsByLabel = new Map<string, Set<string>>();
    for (const r of rows) urlsByLabel.set(r.source.label, (urlsByLabel.get(r.source.label) ?? new Set()).add(r.source.url));
    for (const [labelText, urls] of urlsByLabel) expect([...urls], labelText).toHaveLength(1);
  });

  it("the dead UKONS path is gone and the replacement is the toolkit PDF", () => {
    // The old URL 404s but the publisher answers with a 200 HTML page for some missing files, so this
    // is pinned by string: see the note at the top of src/data/red-flags.ts on checking content type.
    for (const r of rows) expect(r.source.url, `${r.set}: ${r.symptom}`).not.toContain("ukons.org/site/assets/files/1134/");
    const ukons = rows.filter((r) => /ukons/i.test(r.source.label));
    expect(ukons.length).toBeGreaterThan(0);
    for (const r of ukons) expect(r.source.url).toMatch(/ukons_triage_toolkit_v3_final\.pdf$/);
  });

  it("no two rows share a source URL the weekly link check has recorded as dead", () => {
    const path = join(process.cwd(), "public", "links.json");
    if (!existsSync(path)) return;
    const report = JSON.parse(readFileSync(path, "utf8")) as LinksReport;
    const byUrl = new Map(report.results.map((r) => [r.url, r]));
    const dead: string[] = [];
    for (const url of redFlagSourceUrls()) {
      const result = byUrl.get(url);
      // Not yet probed, or the site blocked our bot (403/429/5xx): neither is evidence of rot.
      if (!result || !(isGone(result) || isUnreachable(result))) continue;
      const citing = rows.filter((r) => r.source.url === url).map((r) => `${r.set}: ${r.symptom}`);
      dead.push(`${url} [${result.status}${result.softPdf404 ? " soft 404, served " + result.contentType : ""}] cited by ${citing.length} row(s): ${citing.join("; ")}`);
    }
    expect(dead, "dead red-flag sources, see public/links.json").toEqual([]);
  });
});

describe("a red card reaches only the drugs it is for", () => {
  /**
   * Cards attach to a drug by a regex over its name, aka, modality, tags and targets. On 25 September 2026 the
   * fragment `imid` was written unanchored, and those four letters sit inside **pyrimidine**: every
   * fluoropyrimidine carried the lenalidomide boxed warning, so a page about a skin cream told the reader to
   * watch for a blood clot and named three myeloma drugs. Six review passes had missed it.
   *
   * The signature is a fragment that starts *inside* a word. A fragment that runs on at the end is usually the
   * same class and is correct: "vegf" inside "vegfr", "gnrh" inside "gnrh-antagonist". So this fails only on the
   * first shape, and the two legitimate cases are named with their reason.
   */
  const ALLOWED = new Set([
    "cytotoxic:actinomycin:dactinomycin", // dactinomycin is actinomycin D, and the cytotoxic cards are right for it.
    "kinase-inhibitors:kinase inhibitor:midostaurin", // a multikinase inhibitor is a kinase inhibitor.
  ]);

  it("has no pattern fragment that matches inside an unrelated word", () => {
    const g = graph();
    const drugs = g.kind("drug");
    const text = (d: (typeof drugs)[number]) => [d.name, ...d.aka, d.modality ?? "", ...d.tags].join(" ").toLowerCase();
    const bad: string[] = [];
    for (const s of redFlagSets) {
      if (!s.modalityRe) continue;
      for (const frag of String(s.modalityRe).split("|")) {
        const f = frag.trim();
        const core = f.replace(/\\b/g, "").replace(/[$^]/g, "").replace(/s\?$/, "");
        if (!core || f.includes("\\b") || f.startsWith("^")) continue;
        const mid = new RegExp(`[a-z0-9]${core}`, "i");
        for (const d of drugs) if (mid.test(text(d)) && !ALLOWED.has(`${s.id}:${core}:${d.id}`)) bad.push(`${s.id}: "${core}" matches inside a word on ${d.id}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("a card never names a drug the reader is not taking", () => {
  /**
   * Found on 29 September 2026 while writing the lymphoma standard-of-care rows. Two class-wide sets were
   * printing another product's boxed warning on a page about a different drug:
   *   - the antibody-drug conjugate set matched every product whose modality is "ADC", so a reader on
   *     brentuximab vedotin was told to watch for the Stevens-Johnson reaction that enfortumab vedotin
   *     carries, and a reader on an investigational ADC with no warnings at all got the same card;
   *   - the differentiation-agent set matched the fragment "retinoid", so bexarotene, an RXR agonist given
   *     for cutaneous T-cell lymphoma, carried the differentiation syndrome card that belongs to ATRA and
   *     arsenic trioxide in acute promyelocytic leukaemia.
   * The fix was to attach those cards by product id. This test holds the line: a card's text may name a drug
   * only when that drug is one of the products the card reaches.
   */
  const NAMED = [
    ["enfortumab vedotin", "enfortumab-vedotin"],
    ["sacituzumab govitecan", "sacituzumab-govitecan"],
    ["brentuximab vedotin", "brentuximab-vedotin"],
    ["polatuzumab", "polatuzumab-vedotin"],
    ["bexarotene", "bexarotene"],
  ] as const;

  it("no set prints a named product's warning to a drug outside that set", () => {
    const g = graph();
    const drugs = g.kind("drug");
    const bad: string[] = [];
    for (const [phrase, drugId] of NAMED) {
      for (const s of redFlagSets) {
        const mentions = s.flags.some((f) => `${f.symptom} ${f.threshold}`.toLowerCase().includes(phrase));
        if (!mentions) continue;
        for (const d of drugs) {
          if (d.id === drugId) continue;
          if (redFlagsFor(d.id, d.modality).some((m) => m.id === s.id)) bad.push(`${s.id} names "${phrase}" and reaches ${d.id}`);
        }
      }
    }
    expect(bad.slice(0, 5)).toEqual([]);
  });

  it("differentiation syndrome reaches the differentiation agents and not the other retinoids", () => {
    const g = graph();
    const cards = (id: string) => {
      const d = g.must(id);
      return d.kind === "drug" ? redFlagsFor(d.id, d.modality).flatMap((s) => s.flags.map((f) => f.symptom)) : [];
    };
    expect(cards("tretinoin-atra")).toContain("Differentiation syndrome");
    expect(cards("arsenic-trioxide")).toContain("Differentiation syndrome");
    expect(cards("bexarotene")).not.toContain("Differentiation syndrome");
    expect(cards("acitretin")).not.toContain("Differentiation syndrome");
  });
});

import { describe, expect, it } from "vitest";
import MiniSearch from "minisearch";
import { answerText, composeAnswer, recordFromEntity, retrieveIds, sentences, type AskRecord } from "./ask";
import { benchmark, scoreAnswer } from "@/data/benchmark";
import { askEval, askEvalNew, scoreAskEval } from "@/data/ask-eval";
import { graph } from "./graph";
import { routeFor } from "./kinds";
import { searchDocs, type SearchDoc } from "./search-index";
import { SEARCH_INDEX_OPTIONS } from "./search-rank";
import { askLexical } from "./search-client";
import { buildSemanticIndex, semanticSearch } from "./semantic";
import { semanticDocs } from "./semantic-docs";
import { askHarness } from "./ask-harness";
import { analyseQuestion, classifyIntent } from "./ask-intent";
import { unknownLexiconIds } from "./ask-index-build";
import { abbreviation, decodeAskIndex, deriveAliases, encodeAskIndex, regionCode, shortName } from "./ask-index";
import { batchFromQuestion, followUpsFor, hasSurvivalFigure, regionFromQuestion } from "./ask-compose";

describe("sentences", () => {
  it("splits on sentence ends and drops fragments", () => {
    expect(sentences("Sacituzumab govitecan is a TROP2 ADC. It is approved in TNBC after two prior lines. Ok.")).toEqual([
      "Sacituzumab govitecan is a TROP2 ADC.", "It is approved in TNBC after two prior lines.",
    ]);
  });
});

describe("composeAnswer (extractive fallback)", () => {
  const records: AskRecord[] = [
    { id: "sg", kind: "drug", name: "Sacituzumab govitecan", route: "/drugs/sg/", tldr: "An antibody that carries chemotherapy to TROP2 on tumour cells.", passages: [
      { text: "An antibody that carries chemotherapy to TROP2 on tumour cells.", field: "TL;DR" },
      { text: "Sacituzumab govitecan is approved for metastatic triple-negative breast cancer after two prior therapies.", field: "summary" },
      { text: "Neutropenia and diarrhoea are the main grade 3 toxicities.", field: "summary" },
    ] },
    { id: "ascent", kind: "trial", name: "ASCENT", route: "/trials/ascent/", tldr: "The trial that proved sacituzumab govitecan in TNBC.", passages: [
      { text: "The trial that proved sacituzumab govitecan in TNBC.", field: "TL;DR" },
      { text: "ASCENT, overall survival: sacituzumab govitecan 12.1 months versus chemotherapy 6.7 months, hazard ratio 0.48.", field: "outcome" },
    ] },
  ];

  it("copies sentences verbatim with one citation per sentence, ordered by record", () => {
    const a = composeAnswer("What is the survival benefit of sacituzumab govitecan in TNBC?", records);
    expect(a.sentences.length).toBeGreaterThan(1);
    for (const s of a.sentences) expect(records.flatMap((r) => r.passages.map((p) => p.text))).toContain(s.text);
    expect(a.sentences.some((s) => s.text.startsWith("ASCENT, overall survival"))).toBe(true);
    expect(a.sources.map((s) => s.id)).toEqual(["sg", "ascent"]);
    expect(a.sentences.map((s) => s.cite)).toEqual([...a.sentences.map((s) => s.cite)].sort());
    expect(answerText(a)).toContain("[1] Sacituzumab govitecan (https://onco.cc/drugs/sg/)");
  });

  it("falls back to the top TL;DR and says so when nothing matches", () => {
    const a = composeAnswer("quantum chromodynamics", records);
    expect(a.confidence).toBe("low");
    expect(a.note).toBeDefined();
    expect(a.sentences.length).toBe(1);
    expect(a.sentences[0].field).toBe("TL;DR");
  });

  it("returns no sentences for no records", () => {
    expect(composeAnswer("anything", []).sentences).toEqual([]);
  });
});

describe("Ask index", () => {
  it("names only records that exist in the lexicon", () => {
    expect(unknownLexiconIds()).toEqual([]);
  });

  it("derives aliases from name, abbreviation, brand and code", () => {
    const a = deriveAliases({ id: "trastuzumab-deruxtecan", kind: "drug", name: "Trastuzumab deruxtecan", brand: "Enhertu", code: "DS-8201, T-DXd" });
    expect(a).toEqual(expect.arrayContaining(["Trastuzumab deruxtecan", "Enhertu", "DS-8201", "T-DXd"]));
    const c = deriveAliases({ id: "tnbc", kind: "cancer", name: "Triple-negative breast cancer (TNBC)" });
    expect(c).toEqual(expect.arrayContaining(["Triple-negative breast cancer", "TNBC", "triple-negative"]));
    expect(deriveAliases({ id: "x", kind: "term", name: "Cancer" })).toEqual([]);
  });

  it("round-trips through the compact wire format and derives routes", { timeout: 120_000 }, () => {
    const { index } = askHarness();
    const back = decodeAskIndex(JSON.parse(JSON.stringify(encodeAskIndex(index))));
    expect(back.entries.length).toBe(index.entries.length);
    const tnbc = back.entries.find((e) => e.id === "tnbc")!;
    expect(tnbc.kind).toBe("cancer");
    expect(tnbc.route).toBe("/cancers/tnbc/");
    expect(tnbc.aliases).toContain("triple-negative");
    expect(back.pairs.length).toBeGreaterThanOrEqual(benchmark.length);
  });

  it("uses the abbreviation as the short name for cancers", () => {
    expect(shortName({ kind: "cancer", name: "Triple-negative breast cancer (TNBC)" })).toBe("TNBC");
    expect(shortName({ kind: "drug", name: "Trastuzumab deruxtecan" })).toBe("Trastuzumab deruxtecan");
    expect(shortName({ kind: "technology", name: "CT (computed tomography)" })).toBe("CT");
  });
});

describe("intent and entity resolution", () => {
  it("classifies the common question shapes", () => {
    expect(classifyIntent("What does 'triple-negative' mean in breast cancer?")).toBe("define");
    expect(classifyIntent("How is TNBC treated?")).toBe("treatments");
    expect(classifyIntent("Is Enhertu approved in the UK?")).toBe("approval");
    expect(classifyIntent("How does trastuzumab deruxtecan work?")).toBe("mechanism");
    expect(classifyIntent("What are the side effects of Trodelvy?")).toBe("side-effects");
    expect(classifyIntent("What trials are open for pancreatic cancer?")).toBe("trials");
    expect(classifyIntent("Enhertu vs Trodelvy")).toBe("compare");
    expect(classifyIntent("Enhertu vs Trodelvy", 1)).not.toBe("compare");
    expect(classifyIntent("What is the survival rate for TNBC?")).toBe("prognosis");
    expect(classifyIntent("Who makes Keytruda?")).toBe("who");
    expect(classifyIntent("How much does Enhertu cost?")).toBe("cost");
    expect(classifyIntent("What did KEYNOTE-522 show?")).toBe("results");
    expect(classifyIntent("What is the standard treatment for stage II-III TNBC today?")).toBe("treatments");
  });

  it("resolves aliases, abbreviations, hyphen and quote variants", () => {
    const { index } = askHarness();
    const ids = (q: string) => analyseQuestion(q, index).entities.filter((e) => e.strong).map((e) => e.entry.id);
    expect(ids("What does 'triple-negative' mean in breast cancer?")[0]).toBe("tnbc");
    expect(ids("What does “triple negative” mean?")[0]).toBe("tnbc");
    expect(ids("Is Enhertu approved in the UK?")).toEqual(["trastuzumab-deruxtecan"]);
    expect(ids("What is HER2-low?")[0]).toBe("her2-low");
    expect(ids("What is HER2 low?")[0]).toBe("her2-low");
    expect(ids("Trodelvy side effects")).toContain("sacituzumab-govitecan");
    expect(ids("What did the VISION trial show?")).toContain("vision");
    expect(ids("What does pCR mean after chemotherapy?")[0]).toBe("pcr");
    expect(ids("Who makes Keytruda?")).toEqual(["pembrolizumab"]);
  });

  it("matches the owner's example to the curated benchmark pair", () => {
    const { index } = askHarness();
    const a = analyseQuestion("What does 'triple-negative' mean in breast cancer?", index);
    expect(a.pair?.pair.ids).toContain("tnbc");
    expect(a.pair?.similarity).toBe(1);
    // A paraphrase still matches.
    const b = analyseQuestion("What does triple-negative mean in breast cancer", index);
    expect(b.pair?.pair.ids).toContain("tnbc");
  });

  it("reads a region named in the question", () => {
    expect(regionFromQuestion("Is Enhertu approved in the UK?")).toBe("UK");
    expect(regionFromQuestion("Is Enhertu approved in Japan?")).toBe("JP");
    expect(regionFromQuestion("Is Enhertu approved?")).toBeUndefined();
  });

  it("suggests follow-ups that skip the current intent", () => {
    const f = followUpsFor({ kind: "cancer", name: "Triple-negative breast cancer (TNBC)" }, "define");
    expect(f).toContain("How is TNBC treated?");
    expect(f).toContain("What trials are open for TNBC?");
    expect(f.some((x) => x.startsWith("What is TNBC"))).toBe(false);
  });
});

describe("September 2026 kinds: intents, aliases, index extras, survival guard", () => {
  it("classifies the new question shapes", () => {
    expect(classifyIntent("Which investors back radioligand startups?")).toBe("investors");
    expect(classifyIntent("Who invests in Arcellx?")).toBe("investors");
    expect(classifyIntent("Which YC companies work on cancer?")).toBe("companies");
    expect(classifyIntent("Which YC W24 companies are working on cancer?")).toBe("companies");
    expect(classifyIntent("What did India approve for CAR-T?")).toBe("regional-approvals");
    expect(classifyIntent("Which drugs did China approve for lung cancer?")).toBe("regional-approvals");
    // No regulator named: an ordinary approval question, not a regional listing.
    expect(classifyIntent("Which TROP2 ADCs are approved for first-line metastatic triple-negative breast cancer?")).toBe("approval");
    expect(classifyIntent("What is the roadmap for radiation therapy?")).toBe("roadmap");
    expect(classifyIntent("Where is cancer surgery heading over the next decade?")).toBe("roadmap");
    expect(classifyIntent("Which journals publish oncology nursing research?")).toBe("journals");
    expect(classifyIntent("Which journals cover radiation oncology?")).toBe("journals");
    expect(classifyIntent("Is scalp cooling worth it for taxane chemo?")).toBe("evidence");
    expect(classifyIntent("Is acupuncture proven for nausea?")).toBe("evidence");
    expect(classifyIntent("Which KEGG pathway covers bladder cancer?")).toBe("define");
  });

  it("drops the evidence reading when nothing graded is named", () => {
    const { index } = askHarness();
    expect(analyseQuestion("Does Enhertu work in HER2-low breast cancer?", index).intent).not.toBe("evidence");
    expect(analyseQuestion("Does ginger help with chemo nausea?", index).intent).toBe("evidence");
  });

  it("resolves the new aliases and kinds", () => {
    const { index } = askHarness();
    const ids = (q: string) => analyseQuestion(q, index).entities.filter((e) => e.strong).map((e) => e.entry.id);
    expect(ids("Which YC companies work on cancer?")).toContain("y-combinator");
    expect(ids("Is the ketogenic diet proven for glioblastoma?")[0]).toBe("ketogenic-diet-glioblastoma");
    expect(ids("What is NexCAR19?")).toEqual(["talicabtagene-autoleucel"]);
    expect(ids("Which KEGG pathway covers bladder cancer?")[0]).toBe("bladder-cancer-signalling");
    expect(ids("What is hsa05214?")).toContain("glioma-signalling");
    expect(ids("What is the Lancet Oncology?")[0]).toBe("lancet-oncology");
    expect(ids("Does fenbendazole cure cancer?")).toContain("fenbendazole-ivermectin-repurposing-claims");
    const tmh = ids("Did low-dose nivolumab work in the Tata Memorial trial?");
    expect(tmh).toContain("low-dose-nivolumab-tmh");
    expect(tmh).not.toContain("elective-neck-dissection-tmh");
  });

  it("carries grade, batch and approved regions in the index and its wire format", () => {
    const { index } = askHarness();
    const by = (id: string) => index.entries.find((e) => e.id === id)!;
    expect(by("scalp-cooling").grade).toBe("strong");
    expect(by("st-johns-wort-interaction").grade).toBe("harm");
    expect(by("ketogenic-diet-glioblastoma").grade).toBe("insufficient");
    expect(by("granza-bio").batch).toBe("W24");
    expect(by("talicabtagene-autoleucel").regions).toContain("IN");
    expect(by("sintilimab").regions).toContain("CN");
    expect(by("tnbc").grade).toBeUndefined();
    const back = decodeAskIndex(JSON.parse(JSON.stringify(encodeAskIndex(index))));
    expect(back.entries.find((e) => e.id === "granza-bio")?.batch).toBe("W24");
    expect(back.entries.find((e) => e.id === "scalp-cooling")?.grade).toBe("strong");
    expect(back.entries.find((e) => e.id === "sintilimab")?.regions).toContain("CN");
  });

  it("treats a bracketed gloss as a gloss, not an abbreviation", () => {
    expect(abbreviation("Low-dose nivolumab plus metronomic chemotherapy (Tata Memorial)")).toBeUndefined();
    expect(abbreviation("Bladder cancer (KEGG map)")).toBeUndefined();
    expect(abbreviation("Triple-negative breast cancer (TNBC)")).toBe("TNBC");
    expect(abbreviation("Cognitive behavioural therapy for insomnia (CBT-I)")).toBe("CBT-I");
  });

  it("recognises survival and mortality figures but not trial medians or toxicity rates", () => {
    expect(hasSurvivalFigure("Five-year survival is 12%.")).toBe(true);
    expect(hasSurvivalFigure("About 2.6 million cancer deaths in 2022.")).toBe(true);
    expect(hasSurvivalFigure("People who chose alternative medicine were two and a half times as likely to die.")).toBe(true);
    expect(hasSurvivalFigure("Mortality was 96 per 100,000.")).toBe(true);
    expect(hasSurvivalFigure("Approved 2020 for pretreated metastatic TNBC (ASCENT: OS 12.1 vs 6.7 months) and 2023 for HR+/HER2- breast cancer.")).toBe(false);
    expect(hasSurvivalFigure("Neutropenia occurred in 49% of patients.")).toBe(false);
  });

  it("reads YC batches and region codes", () => {
    expect(batchFromQuestion("Which YC W24 companies work on cancer?")).toBe("W24");
    expect(batchFromQuestion("What did the S21 trial show?")).toBeUndefined();
    expect(regionCode("China")).toBe("CN");
    expect(regionCode("IN")).toBe("IN");
    expect(regionCode("Japan")).toBe("JP");
    expect(regionCode("Switzerland")).toBeUndefined();
  });
});

describe("Ask OnCo end to end, September 2026 kinds", () => {
  it("states the evidence grade first and never frames a harm-graded approach as an option", async () => {
    const a = await askHarness().ask("Is it safe to use alternative medicine instead of chemotherapy?");
    expect(a.template).toBe("evidence");
    expect(a.sentences[0].field).toBe("evidence grade");
    expect(a.sentences[0].text).toMatch(/evidence of harm or interaction/);
    expect(answerText(a)).toMatch(/does not present it as an option/);
    expect(a.sentences.some((s) => s.field === "strengths")).toBe(false);
    for (const s of a.sentences) expect(hasSurvivalFigure(s.text)).toBe(false);
  });

  it("grades an insufficient approach and says it is not a reason to use it outside a trial", async () => {
    const a = await askHarness().ask("Is the ketogenic diet proven for glioblastoma?");
    expect(a.template).toBe("evidence");
    expect(a.entities[0].id).toBe("ketogenic-diet-glioblastoma");
    expect(answerText(a)).toMatch(/insufficient evidence/);
    expect(answerText(a)).toMatch(/not a reason to use it outside a trial/);
  });

  it("lists what a regulator approved, with brand and year, and reads the drug records", async () => {
    const a = await askHarness().ask("What did India approve for CAR-T?");
    expect(a.template).toBe("regional-approvals");
    const text = answerText(a);
    expect(text).toMatch(/approved in India by the CDSCO/);
    expect(text).toMatch(/NexCAR19, 2023/);
    expect(text).toMatch(/Qartemi/);
    expect(a.consulted.some((s) => s.id === "varnimcabtagene-autoleucel")).toBe(true);
  });

  it("lists one YC batch of an investor's portfolio", async () => {
    const a = await askHarness().ask("Which YC W24 companies are working on cancer?");
    expect(a.template).toBe("companies");
    expect(answerText(a)).toMatch(/Winter 2024 \(W24\)/);
    expect(answerText(a)).toMatch(/Granza Bio/);
  });

  it("aggregates the investors behind a field's companies", async () => {
    const a = await askHarness().ask("Which investors back radioligand startups?");
    expect(a.template).toBe("investors");
    expect(answerText(a)).toMatch(/Investors backing Radioligand therapy companies/);
  });

  it("walks the roadmap built around a front", async () => {
    const a = await askHarness().ask("What is the roadmap for radiation therapy?");
    expect(a.template).toBe("roadmap");
    expect(a.sources.some((s) => s.id === "radiation-roadmap")).toBe(true);
    expect(answerText(a)).toMatch(/Coming next/);
  });

  it("matches journals on a topic and reads them", async () => {
    const a = await askHarness().ask("Which journals publish oncology nursing research?");
    expect(a.template).toBe("journals");
    expect(answerText(a)).toMatch(/Oncology nursing forum/i);
    expect(a.consulted.some((s) => s.id === "cancer-nursing")).toBe(true);
  });
});

describe("Ask OnCo end to end", () => {
  it("answers the owner's example with the TNBC TL;DR and the definition, cited", async () => {
    const a = await askHarness().ask("What does 'triple-negative' mean in breast cancer?", "UK");
    expect(a.intent).toBe("define");
    expect(a.template).toBe("define");
    expect(a.confidence).toBe("high");
    expect(a.entities[0].id).toBe("tnbc");
    expect(a.sources[0].id).toBe("tnbc");
    expect(a.sentences[0].cite).toBe(1);
    expect(a.sentences[0].text).toMatch(/lacks the three receptors \(oestrogen, progesterone, HER2\)/);
    const text = answerText(a).toLowerCase();
    for (const must of ["oestrogen", "progesterone", "her2", "er <1%", "pr <1%"]) expect(text).toContain(must);
    expect(a.followUps).toContain("How is TNBC treated?");
    expect(a.method).toMatch(/nothing is generated/);
    expect(a.readMore.some((r) => r.href === "/cancers/tnbc/")).toBe(true);
  });

  it("starts approval answers with the region the question names", async () => {
    const a = await askHarness().ask("Is Enhertu approved in the UK?", "US");
    expect(a.template).toBe("approval");
    expect(answerText(a)).toMatch(/In the United Kingdom, Trastuzumab deruxtecan is approved by the MHRA/);
  });

  it("answers prognosis questions with the state of the art first and no bare figure", async () => {
    const a = await askHarness().ask("What is the survival rate for triple negative breast cancer?");
    expect(a.template).toBe("prognosis");
    expect(a.sentences[0].field).toBe("TL;DR");
    expect(a.sentences.some((s) => s.field === "survival disclosure")).toBe(true);
    expect(a.readMore.some((r) => r.href === "/survival/")).toBe(true);
    expect(a.sentences[0].text).not.toMatch(/\d+%/);
  });

  it("compares two products side by side and links the compare page", async () => {
    const a = await askHarness().ask("Enhertu vs Trodelvy");
    expect(a.template).toBe("compare");
    expect(a.entities.map((e) => e.id).sort()).toEqual(["sacituzumab-govitecan", "trastuzumab-deruxtecan"]);
    expect(a.readMore.some((r) => r.href.startsWith("/compare/?ids="))).toBe(true);
  });

  it("falls back to sentence retrieval when nothing is named", async () => {
    const a = await askHarness().ask("Which oncology drugs were approved in the US in July 2026?");
    expect(a.sentences.length).toBeGreaterThan(0);
    for (const s of a.sentences) expect(a.sources[s.cite - 1]).toBeDefined();
  });

  it("clears the floors on the open benchmark and the natural set (before/after measured 2026-09-10)", { timeout: 120_000 }, async () => {
    const h = askHarness();
    // Before (extractive only): benchmark rubric 0.69, recall 0.41; natural rubric 0.59, recall 0.59.
    // After (this pipeline): benchmark rubric 0.83, recall 1.00 (the benchmark questions are curated pairs; with pairs
    // switched off 0.70 and 0.57); natural rubric 1.00, recall 0.93. Floors sit below so regressions fail loudly.
    let bScore = 0, bRecall = 0;
    for (const q of benchmark) {
      const a = await h.ask(q.question, "US");
      bScore += scoreAnswer(q, answerText(a)).score;
      const ids = a.consulted.map((s) => s.id);
      bRecall += q.entities.length ? q.entities.filter((id) => ids.includes(id)).length / q.entities.length : 1;
    }
    expect(bScore / benchmark.length).toBeGreaterThanOrEqual(0.76);
    expect(bRecall / benchmark.length).toBeGreaterThanOrEqual(0.9);
    let nScore = 0, nRecall = 0;
    for (const q of askEval) {
      const a = await h.ask(q.question, "US");
      const s = scoreAskEval(q, answerText(a), a.consulted.map((x) => x.id));
      nScore += s.score; nRecall += s.retrievalRecall;
    }
    expect(nScore / askEval.length).toBeGreaterThanOrEqual(0.88);
    expect(nRecall / askEval.length).toBeGreaterThanOrEqual(0.85);
  });

  it("clears the floors on the second natural set (India and China, journals, KEGG, companies, investors, complementary, roadmaps; measured 2026-09-10)", { timeout: 120_000 }, async () => {
    // Before the September 2026 work: rubric 0.74, recall 0.92. After: rubric 1.00, recall 1.00. Floors sit below.
    const h = askHarness();
    let score = 0, recall = 0;
    for (const q of askEvalNew) {
      const a = await h.ask(q.question, "US");
      const s = scoreAskEval(q, answerText(a), a.consulted.map((x) => x.id));
      score += s.score; recall += s.retrievalRecall;
    }
    expect(score / askEvalNew.length).toBeGreaterThanOrEqual(0.9);
    expect(recall / askEvalNew.length).toBeGreaterThanOrEqual(0.9);
  });

  /**
   * Extractive floor history: recall of the retrieval-only path (word search plus concept search, fused, top six) on the
   * open benchmark, as measured on each date. The floor is the last measured value minus 0.005. Before 24 Sept 2026 the
   * floor was lowered four times in four days as the corpus grew (0.3645, 0.355, 0.35, 0.33); this table exists so a
   * future drop is visible as a row, and EXTRACTIVE_FLOORS below may only go up, so a corpus change that dilutes
   * retrieval is fixed in the ranking, not by lowering the bar.
   */
  const EXTRACTIVE_RECALL_MEASURED: ReadonlyArray<{ date: string; recall: number; note: string }> = [
    { date: "2026-09-10", recall: 0.3645, note: "baseline of the retrieval-only path" },
    { date: "2026-09-17", recall: 0.3595, note: "blood-cancer subtype pages: io-40 lost checkpoint-inhibitor to bosutinib by 0.001 of concept score" },
    { date: "2026-09-23", recall: 0.3526, note: "1,447 cancer gene pages: gene symbols in aliases share the lexical hits on gene-named questions" },
    { date: "2026-09-24", recall: 0.3493, note: "gallbladder deep dive: about 160 biliary trial records repeat the landmark drug names" },
    { date: "2026-09-24", recall: 0.3343, note: "TNBC core layer: twelve subtypes and nineteen terms carry 'triple-negative breast cancer' in their names" },
    { date: "2026-09-24", recall: 0.3376, note: "TNBC deep dive: 229 registry trial records repeat pembrolizumab, sacituzumab and carboplatin" },
    { date: "2026-09-24", recall: 0.329, note: "TNBC molecular and treatment layers plus the CanSim terms, measured before the ranking fix below" },
    // Ranking fix, 24 Sept 2026: Ask's word search drops the question's function words before MiniSearch sees them
    // (semantic.ts contentWords; with prefix and fuzzy matching "what", "which", "the" and "for" out-scored record names
    // on long questions, so 177 of 220 missed records sat past lexical rank 100) and re-weights the hits by kind tier and
    // name match like every other list on the site (search-client.ts askLexical, shared by /ask/, the search page, the
    // harness and this test). Per-kind concept weights for papers, journals and the CanSim terms were measured at the
    // same time and moved recall by at most 0.002 while lowering the rubric score, so they were not added.
    { date: "2026-09-24", recall: 0.416, note: "after the ranking fix: function words dropped, kind tier and name match applied to Ask's word search" },
    { date: "2026-09-25", recall: 0.403, note: "wave 4: 99 cancer subtype pages; lung-16 lost nsclc to large-cell-lung-carcinoma, img-48 and proc-83 lost hand-written records to registry trials and ideas present in both fused lists" },
    // 25 Sept 2026: a subtype whose matched words are all its parent's sits just below the parent (askLexical,
    // SUBTYPE_BELOW_PARENT; a flat penalty on every record with a parent measured 0.401 because tnbc-early and
    // tnbc-metastatic are expected records), and the word stage applies the same provenance weight as the concept
    // index (search-rank.ts recordWeight: registry-ingested 0.6, biomarkers, gene pages and wave 4 0.7). The fusion
    // constant (RRF k 8 to 60) and a term-coverage weight were measured at the same time and changed nothing or lost.
    { date: "2026-09-25", recall: 0.411, note: "subtype capped below its parent; provenance weight shared by both stages; floor held at 0.41" },
    { date: "2026-09-24", recall: 0.408, note: "pancreatic deep dive: 284 registry trial records naming pancreatic cancer flattened the concept index's inverse document frequency for 'pancreatic' and 'locally advanced' (gi-33 lost pancreatic and panova-3), measured before the fix below" },
    // 24 Sept 2026: the concept index computes inverse document frequency over the curated records only (semantic.ts
    // buildSemanticIndex; records with a provenance weight below 1 still get vectors and are still searched). Weighting
    // the counts by provenance instead (0.6 a record) measured 0.407 and a lower registry weight (0.5) 0.408, so neither
    // was kept. Natural set 0.886 to 0.892, natural-2 0.983 to 0.978, pipeline benchmark rubric 0.841 to 0.846.
    { date: "2026-09-24", recall: 0.427, note: "inverse document frequency over curated records only; extractive rubric 0.683" },
    // 25 Sept 2026, lung molecular layer (45 landscape papers, 4 readouts, prevalence rows on 30 targets). Measured
    // 0.419 before the fix below, against 0.421 for the same corpus without the layer. The single lost record was
    // `nsclc` in lung-16: naming three to five lung investigators on each new paper diluted those people's concept
    // vectors (semantic-docs.ts appends every neighbour's name to a record's text), matthew-hellmann fell from 0.212
    // to 0.189 and john-heymach left the concept top twelve, which let ret-fusion-nsclc in, and because it also sits
    // in the word-search list it out-fused nsclc, which only had the word list. Capping the layer's papers at one
    // person each restores 0.421; two people each measured 0.419 again, so the cap is the fix and not a guess.
    { date: "2026-09-25", recall: 0.421, note: "lung molecular layer with one person named per new paper; floor held at 0.42" },
    // 25 Sept 2026, lung deep dive: 323 registry trials and 36 hand-written lung trials measured 0.4193, below the
    // floor, because IALT ("International Adjuvant Lung Cancer Trial") and KEYNOTE-091 out-matched adaura on lung-17,
    // whose name is four letters and whose aka was empty. Fixed in the record, not the bar: adaura gained the aliases
    // "Adjuvant osimertinib after complete resection of EGFR-mutant lung cancer" and "ADAURA trial".
    { date: "2026-09-25", recall: 0.4243, note: "lung deep dive plus the ADAURA aliases; extractive rubric 0.685" },
    // 25 Sept 2026, lung review (docs/LUNG-QA.md): the base records gave up eighteen lines the spikes had written in
    // full (three standard-of-care settings, seven history entries, ten open problems) and three paper records that
    // existed twice under two ids for one DOI became supplements. Removing text removes lexical matches, so the figure
    // moves; it stays above the floor and the floor is not moved.
    { date: "2026-09-25", recall: 0.422, note: "lung review: base one-liners folded into the spike rows, three duplicate paper records merged; extractive rubric 0.688" },
    // 25 Sept 2026, the corpus-wide duplicate merge (docs/DUPLICATE-RECORDS.md): 80 paper records and two trial
    // records that were the same thing under two ids were retired into their survivors. Measured 0.4238 immediately
    // before the merge and 0.4271 after it, with the rubric unchanged at 0.6875. Retiring a record usually costs
    // recall because it removes lexical matches; here it gains, because each retired record was a second index entry
    // carrying the same title and abstract as its survivor and competing with it for the same question. The floor is
    // not moved.
    { date: "2026-09-25", recall: 0.4271, note: "duplicate merge: 80 paper ids and two trial ids retired into their survivors; extractive rubric 0.6875" },
    // 25 Sept 2026, breast family review (docs/BREAST-QA.md): the base records for breast-hr-positive and
    // breast-her2-positive gave up the six and five history entries, the six standard-of-care one-liners, the five
    // open problems and the five state-of-the-art lines their spike files write in full, and three duplicate link
    // URLs came off three records. Removing text removes lexical matches, and the figure still rose, because the
    // lines removed were the short unsourced ones competing with the long sourced ones for the same question. The
    // floor rises with it, to the measurement minus 0.005 (below).
    { date: "2026-09-25", recall: 0.4326, note: "breast family review: duplicated base lines folded into the receptor spikes; extractive rubric 0.6900" },
    // 25 Sept 2026, skin round review (docs/SKIN-QA.md): the base record for skin-cancer gave up three
    // standard-of-care one-liners, seven subtype strings, two melanoma biomarker lines and the registry-counting
    // open problem that skin-core.ts writes in full; six duplicate link URLs came off three records; and one
    // glossary term that existed twice under two ids was merged. Recall rose again, for the same reason as the
    // breast round: each removed line was a second, weaker index entry competing with the long sourced one. The
    // rubric fell slightly and is well above its floor. Neither floor is moved: the measurement is 0.0071 above
    // the recall floor, inside the 0.0101 the ratchet allows.
    { date: "2026-09-25", recall: 0.4346, note: "skin round review: base one-liners folded into the skin spikes, six duplicate link URLs removed, one duplicate glossary term merged; extractive rubric 0.6875" },
    // 25 Sept 2026, the year records (src/data/years.ts): 174 generated records, one per year, each listing every
    // dated fact the corpus holds for it. At full weight they measured 0.4246, below the floor, because a year's
    // text is the names of the groups it holds ("approvals", "papers", "trials reported", "landmarks"), which is
    // the vocabulary of the questions, and 174 records carrying it flattened the concept index's inverse document
    // frequency for those words. Fixed in the ranking, not the bar: a year record now carries a provenance weight
    // of 0.5 in both retrieval stages (search-rank.ts recordWeight), because it is a view of records that are
    // themselves in the index and must never be retrieved instead of one of them. Recall and rubric are back to
    // the figures immediately before the change, so neither floor moves.
    { date: "2026-09-25", recall: 0.4346, note: "year records at a provenance weight of 0.5; extractive rubric 0.6875, both unchanged from before they were added" },
    // 25 Sept 2026, the three dated fields /timeline/ was missing: `firstDescribed` on 1,654 targets, `started` on
    // 5,788 trials, and the accelerated-approval pathway as typed regulatoryEvents on 139 products (238 indications
    // read from the four FDA tables). All three are scalars and dates on records already in the index rather than
    // new records, so nothing new competes for a question and nothing is displaced. Measured immediately before and
    // immediately after at the same figures; neither floor moves.
    { date: "2026-09-25", recall: 0.4346, note: "first-description year on targets, registry start date on trials, accelerated approvals as typed events; extractive rubric 0.6875, both unchanged" },
  ];
  /** Floors set since the ratchet began, in order. Each entry must be at least the one before it. */
  const EXTRACTIVE_FLOORS: ReadonlyArray<{ date: string; recall: number; rubric: number; change: string }> = [
    { date: "2026-09-24", recall: 0.41, rubric: 0.62, change: "function words dropped from Ask's word search; kind tier and name match applied (measured 0.416, rubric 0.676)" },
    { date: "2026-09-24", recall: 0.42, rubric: 0.65, change: "concept-index inverse document frequency over curated records only (measured 0.427, rubric 0.683)" },
    // Raised, not lowered, and not by a ranking change: the breast family review folded the short unsourced base
    // lines on the two receptor records into the long sourced spike rows, which stopped a second weak index entry
    // competing with the strong one for the same question. Measured 0.4326 and 0.6900 (scripts/ask-recall.ts), so
    // the floor moves to the measurement minus 0.005 as the note above this table asks. docs/BREAST-QA.md.
    { date: "2026-09-25", recall: 0.4275, rubric: 0.66, change: "breast family review: duplicated base lines folded into the receptor spikes (measured 0.4326, rubric 0.6900)" },
  ];

  it("only ever raises the extractive floor", () => {
    for (let i = 1; i < EXTRACTIVE_FLOORS.length; i++) {
      expect(EXTRACTIVE_FLOORS[i].recall).toBeGreaterThanOrEqual(EXTRACTIVE_FLOORS[i - 1].recall);
      expect(EXTRACTIVE_FLOORS[i].rubric).toBeGreaterThanOrEqual(EXTRACTIVE_FLOORS[i - 1].rubric);
    }
    const last = EXTRACTIVE_RECALL_MEASURED[EXTRACTIVE_RECALL_MEASURED.length - 1];
    const floor = EXTRACTIVE_FLOORS[EXTRACTIVE_FLOORS.length - 1];
    // The floor sits 0.005 under the last measurement, never above it.
    expect(floor.recall).toBeLessThanOrEqual(last.recall);
    expect(floor.recall).toBeGreaterThanOrEqual(last.recall - 0.0101);
  });

  it("keeps the extractive path at or above its floor", { timeout: 120_000 }, () => {
    const g = graph();
    // The browser's index build and Ask's word search (search-client.ts askLexical), so this measures what /ask/ runs.
    const ms = new MiniSearch<SearchDoc>(SEARCH_INDEX_OPTIONS);
    ms.addAll(searchDocs());
    const sem = buildSemanticIndex(semanticDocs());
    let score = 0, recall = 0;
    for (const q of benchmark) {
      const ids = retrieveIds(askLexical(ms, q.question, 12).map((id) => ({ id })), semanticSearch(sem, q.question, 12), 6);
      const records = ids.map((id) => { const e = g.must(id); return recordFromEntity(e, routeFor(e)); });
      score += scoreAnswer(q, answerText(composeAnswer(q.question, records))).score;
      recall += q.entities.length ? q.entities.filter((id) => ids.includes(id)).length / q.entities.length : 1;
    }
    const floor = EXTRACTIVE_FLOORS[EXTRACTIVE_FLOORS.length - 1];
    // When this fails after a corpus change, run `npx tsx scripts/ask-retrieval-diag.ts` from scripts/ to see which
    // records outrank the expected ones and fix the ranking; then append the new measurement above. Do not lower the floor.
    expect(recall / benchmark.length).toBeGreaterThanOrEqual(floor.recall);
    expect(score / benchmark.length).toBeGreaterThanOrEqual(floor.rubric);
  });
});

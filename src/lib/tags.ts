import { graph } from "./graph";
import type { Kind } from "./kinds";

/**
 * Tags that record how a record entered the corpus (which list or fetcher produced it) rather than
 * anything about the subject. They stay on the record for audits and the JSON API but are hidden from
 * reader-facing pills and excluded from similarity scoring, so two records are never "similar" merely
 * because both were gap-filled from the same list.
 */
export const INTERNAL_TAGS: ReadonlySet<string> = new Set([
  "gap-fill", "chembl-gap", "ctgov-ingest", "europepmc-ingest", "ctgov-sponsor", "nci-list", "nci-coverage", "ema-list", "spike", "cancer-genes-wave",
]);

export function isInternalTag(tag: string): boolean {
  return INTERNAL_TAGS.has(tag) || tag.startsWith("lesson:") || tag.startsWith("evidence:");
}

/** Reader-facing tags only. */
export function publicTags(tags: readonly string[]): string[] {
  return tags.filter((t) => !isInternalTag(t));
}

/**
 * The URL-safe form of a tag: lower case, runs of anything but letters and digits collapsed to one hyphen, no
 * leading or trailing hyphen. Several spellings of one tag ("global oncology", "global-oncology", "MDS" and "mds")
 * share a slug and so a page; `tagIndex()` keeps the reverse map from slug to every spelling.
 */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "tag";
}

/** The page listing every record carrying a tag. */
export const tagRoute = (tag: string): string => `/tagged/${tagSlug(tag)}/`;

/** The JSON companion of a tag page (scripts/build-api.ts). */
export const tagFile = (slug: string): string => `/api/v1/tagged/${slug}.json`;

export const NO_DESCRIPTION = "No description yet";

/**
 * One plain sentence per tag, written from how the tag is used in the corpus (which kinds carry it and what those
 * records have in common), not from any outside meaning. Tags absent here read "No description yet" on their page.
 */
export const TAG_DESCRIPTIONS: Readonly<Record<string, string>> = {
  "cansim-terms": "Glossary terms, gene targets and the hub added on 24 September 2026 from the CanSim terms map (CC BY 4.0): the vocabulary of cancer AI, each record paraphrasing the page it links.",
  biomarker: "Records that measure or score a biomarker: readouts, thresholds and the tests that report them.",
  "gallbladder-evidence": "Papers, trials and ideas added by the September 2026 gallbladder cancer deep dive, each checked against Europe PMC or ClinicalTrials.gov on the date recorded.",
  "tnbc-evidence": "Papers, roadmap and ideas added by the September 2026 triple-negative breast cancer deep dive, each checked against Europe PMC or ClinicalTrials.gov on the date recorded.",
  "colorectal-evidence": "Papers, roadmap and ideas added by the September 2026 colorectal cancer deep dive, each checked against Europe PMC or ClinicalTrials.gov on the date recorded.",
  "lymphoma-evidence": "Trials, papers, roadmap and ideas added by the autumn 2026 lymphoma deep dive, each resolved against Europe PMC or ClinicalTrials.gov on the date recorded.",
  pipeline: "Trials and products still moving through development for a cancer: recruiting, active or recently completed studies and the drugs they test.",
  leadership: "People who lead a cancer centre, department, programme or society, as recorded on their record.",
  "clinician-scientist": "People who both treat patients and run research programmes.",
  "subtype-page": "Cancers written up as a subtype of a parent cancer, with their own page and a strip back to the family.",
  wave4: "Tumour entities written in wave 4 of the content roadmap (September 2026) under the rule in docs/CANCER-PAGES.md, each with a parent cancer and a WHO or PDQ source.",
  kidney: "Kidney cancers and the people who work on them.",
  testicular: "Testicular tumours and the people who work on them.",
  supporting: "Technologies and companies that keep treatment running rather than treat directly: manufacturing, supply, logistics and tooling.",
  trialist: "People known for designing and leading clinical trials.",
  "oeci-representative": "People named as the representative of an OECI-accredited cancer centre.",
  leader: "People in a leading role at their institution: directors, heads and chairs.",
  china: "Companies, products, trials, people and institutions based in or centred on China.",
  uk: "NHS centres, charities, trials, people and decisions based in or centred on the United Kingdom.",
  "hospital-management": "People in hospital or health-system management roles.",
  "hospital management": "People in hospital or health-system management roles.",
  "registry-only": "Products and companies known so far only from a trial registry entry, with little else published.",
  "subtype-trials": "Landmark trials recorded while writing a cancer subtype page.",
  "gallbladder-deep-dive": "Registry-only phase 2 and 3 trials that name gallbladder cancer in their conditions or eligibility, recorded from ClinicalTrials.gov during the gallbladder cancer deep dive.",
  "lung-deep-dive": "Registry-only phase 2 and 3 trials that name lung, non-small-cell lung or small-cell lung cancer in their title or conditions, recorded from ClinicalTrials.gov during the lung cancer deep dive of September 2026; registry facts only, no outcomes.",
  "colorectal-deep-dive": "Registry-only phase 2 and 3 trials that name colorectal, colon or rectal cancer in their title or conditions, recorded from ClinicalTrials.gov during the colorectal cancer deep dive of September 2026; registry facts only, no outcomes.",
  "pancreatic-deep-dive": "Registry-only phase 2 and 3 trials that name pancreatic cancer in their title or conditions, recorded from ClinicalTrials.gov during the pancreatic cancer deep dive of September 2026; registry facts only, no outcomes.",
  "tnbc-deep-dive": "Registry-only phase 2 and 3 trials that name triple-negative breast cancer in their title or conditions, recorded from ClinicalTrials.gov during the triple-negative breast cancer deep dive.",
  gi: "Records covering the cancers of the digestive tract: oesophagus, stomach, pancreas, liver and bile ducts, small bowel, colon, rectum, anus and appendix, most of them added by the gastrointestinal deep dives.",
  mechanism: "Pathways and ideas that explain how a cancer process works rather than a single product.",
  paediatric: "Cancers, trials, people and institutions concerned with cancer in children and young people.",
  hero: "People shown on the heroes page: patients, pioneers, advocates and donors whose stories shaped the field.",
  immunotherapy: "People whose work centres on immunotherapy.",
  "drug-maker": "Companies that develop or make cancer drugs.",
  frontier: "Technologies at the edge of what is possible: early clinical or preclinical, not yet routine.",
  "soc-trials": "Trials that set or confirmed a standard of care, recorded while writing a cancer's standard-of-care rows.",
  "supportive-care": "Technologies, products and people concerned with side effects, symptoms and quality of life during treatment.",
  supportive: "Products and technologies used alongside cancer treatment to protect the patient or manage side effects.",
  survivorship: "What happens after treatment ends: late effects, recovery, follow-up and the life a person goes back to.",
  rejuvenation: "Records on the Recovery and Rejuvenation front: what cancer treatment takes from the body and the mind, and what comes back.",
  psychosocial: "The mind and the life around it after cancer: mood, fear of recurrence, body image, relationships, work and money.",
  complementary: "Approaches used alongside conventional treatment, each carrying an evidence grade for its stated purpose.",
  yc: "Companies that went through Y Combinator.",
  "machines-wave2": "Machines and their makers added in the second wave of the radiotherapy and imaging equipment survey.",
  law: "Glossary terms for laws, regulations and legal doctrines that shape cancer medicine.",
  "fcct-directory": "Institutions and companies listed in a directory of proton, particle and nuclear medicine centres.",
  vc: "Venture capital firms that fund cancer companies.",
  "chembl-universe": "Older cytotoxic and hormonal drugs added from the ChEMBL universe of approved oncology compounds.",
  generic: "Approved drugs available as generics.",
  "comprehensive-cancer-centre": "People working at a comprehensive cancer centre.",
  patient: "People and collections whose story is told from the patient's side.",
  surgery: "People whose work centres on surgical oncology.",
  "foundation-model": "Foundation models trained on pathology, radiology or molecular data, and the groups behind them.",
  breast: "Breast cancers and the people who work on them.",
  "breast cancer": "People whose work centres on breast cancer.",
  donor: "People who gave money that built institutes, programmes or prizes in cancer research.",
  free: "Collections that patients can use at no cost: free testing, registries and services.",
  "oeci-accredited": "Institutions accredited by the Organisation of European Cancer Institutes.",
  test: "Diagnostic tests and companion diagnostics recorded as products.",
  "subtype-drugs-wave": "Drugs added while writing cancer subtype pages, so that every named product has a record.",
  "machines-wave": "Machines and their makers added in the first wave of the imaging and radiotherapy equipment survey.",
  lung: "Lung cancers and the people who work on them.",
  source: "Collections that are sources OnCo reads from: journals, regulator news and appraisal bodies.",
  "mechanics-atlas": "Pathways drawn for the mechanics atlas of how cancer works.",
  radiotherapy: "People whose work centres on radiation oncology.",
  rare: "Cancers that are rare, where trials are small and expertise is concentrated.",
  "targeted-therapy": "People whose work centres on targeted drugs and the biomarkers that select them.",
  "radiation-wave1": "Radiotherapy technologies and terms added in the first radiation wave.",
  failure: "Trials, drugs and companies whose programme failed: negative readouts and withdrawals, kept as lessons.",
  "head-and-neck": "Head and neck cancers and the people who work on them.",
  "manufacturing-wave": "Manufacturing technologies and the companies behind them, from small-molecule synthesis to sterile injectables.",
  ai: "People, companies, institutions and technologies working on artificial intelligence in cancer care.",
  sarcoma: "Sarcomas and the people who work on them.",
  lymphoma: "People whose work centres on lymphoma.",
  "patient-org": "Patient organisations and charities recorded as collections.",
  haematologic: "Blood cancers: leukaemias, lymphomas, myeloma and myeloproliferative neoplasms.",
  "research-institute": "People based at a research institute rather than a hospital.",
  "wave5-target": "Targets added in the fifth target wave.",
  mpn: "Myeloproliferative neoplasms: the cancers, trials, terms, ideas and people concerned with them.",
  gastrointestinal: "Cancers of the digestive tract.",
  cns: "Cancers of the brain and central nervous system, and their trials.",
  melanoma: "People whose work centres on melanoma.",
  government: "People in government, regulatory or public health roles.",
  "mathematical-model": "Mathematical models of tumour growth, treatment response and resistance.",
  prostate: "People whose work centres on prostate cancer.",
  genomics: "People and fronts concerned with cancer genomics.",
  us: "Glossary terms about United States law and regulation.",
  haematology: "People whose work centres on haematology.",
  "oeci-cancer-centre": "Institutions accredited by the OECI as cancer centres.",
  "radiation-wave4": "Landmark radiotherapy trials added in the fourth radiation wave.",
  pathology: "People, technologies and companies concerned with pathology and its digitisation.",
  promising: "Technologies in early trials that the corpus marks as promising.",
  pioneer: "People who opened a field: first treatments, first trials, first movements.",
  "nhs-cancer-alliance": "The NHS cancer alliances of England, recorded as institutions.",
  "oeci-comprehensive-cancer-centre": "Institutions accredited by the OECI as comprehensive cancer centres.",
  guidelines: "People and collections that write or publish treatment guidelines.",
  news: "Collections that report oncology news.",
  "polycythaemia-vera": "Polycythaemia vera: the cancer, its trials, terms and ideas.",
  "radiation-wave2": "Landmark radiotherapy trials added in the second radiation wave.",
  endocrine: "Endocrine cancers: thyroid, neuroendocrine and adrenal.",
  driver: "Targets that are driver alterations of a cancer.",
  "adc-target": "Targets that antibody-drug conjugates are aimed at.",
  advocate: "People who used a public profile to change how cancer is talked about or funded.",
  leukaemia: "People whose work centres on leukaemia.",
  "cooperative-group": "People who lead or represent a cooperative trials group.",
  "de-escalation": "People and trials concerned with giving less treatment where it is safe to do so.",
  colorectal: "People whose work centres on colorectal cancer.",
  "open-question": "Ideas framed as open questions the field has not answered.",
  "virtual-cell": "Groups, companies, collections and technologies building virtual cell models.",
  carer: "Family members and carers whose stories are told on the heroes page.",
};

/** One tag as the site sees it: the canonical spelling, every spelling that shares the slug, and the records that carry any of them. */
export type TagEntry = {
  slug: string;
  /** The most common spelling. */
  tag: string;
  /** Every spelling with this slug, most common first. */
  variants: string[];
  /** Record ids carrying the tag, in corpus order. */
  ids: string[];
  count: number;
  kinds: Partial<Record<Kind, number>>;
  description: string;
};

let INDEX: Map<string, TagEntry> | null = null;

/** Every public tag in the corpus keyed by slug, built once. */
export function tagIndex(): Map<string, TagEntry> {
  if (INDEX) return INDEX;
  const g = graph();
  const spellings = new Map<string, Map<string, number>>();
  const ids = new Map<string, string[]>();
  const kinds = new Map<string, Partial<Record<Kind, number>>>();
  for (const e of g.entities) {
    const seen = new Set<string>();
    for (const t of publicTags(e.tags)) {
      const slug = tagSlug(t);
      const sp = spellings.get(slug) ?? new Map<string, number>();
      sp.set(t, (sp.get(t) ?? 0) + 1);
      spellings.set(slug, sp);
      if (seen.has(slug)) continue;
      seen.add(slug);
      ids.set(slug, [...(ids.get(slug) ?? []), e.id]);
      const k = kinds.get(slug) ?? {};
      k[e.kind] = (k[e.kind] ?? 0) + 1;
      kinds.set(slug, k);
    }
  }
  const out = new Map<string, TagEntry>();
  for (const [slug, sp] of spellings) {
    const variants = [...sp.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
    const description = variants.map((v) => TAG_DESCRIPTIONS[v]).find(Boolean) ?? TAG_DESCRIPTIONS[slug] ?? NO_DESCRIPTION;
    const list = ids.get(slug) ?? [];
    out.set(slug, { slug, tag: variants[0], variants, ids: list, count: list.length, kinds: kinds.get(slug) ?? {}, description });
  }
  INDEX = out;
  return out;
}

/** Every tag, most used first, then by name. */
export function allTags(): TagEntry[] {
  return [...tagIndex().values()].sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

/** Every spelling behind a slug (empty when no record carries it). */
export function tagsForSlug(slug: string): string[] {
  return tagIndex().get(slug)?.variants ?? [];
}

/** Tags that appear on the same records as this one, most shared first. */
export function relatedTags(slug: string, limit = 12): Array<{ entry: TagEntry; shared: number }> {
  const idx = tagIndex();
  const me = idx.get(slug);
  if (!me) return [];
  const g = graph();
  const tally = new Map<string, number>();
  for (const id of me.ids) {
    const e = g.get(id);
    if (!e) continue;
    for (const other of new Set(publicTags(e.tags).map(tagSlug))) if (other !== slug) tally.set(other, (tally.get(other) ?? 0) + 1);
  }
  return [...tally.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([s, shared]) => ({ entry: idx.get(s)!, shared }));
}

/** Test seam. */
export function resetTagIndex() { INDEX = null; }

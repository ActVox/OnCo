import { z } from "zod";
import { EVIDENCE_TIERS, KINDS, STATUSES, TARGET_DISTRIBUTIONS, TARGET_ROLES, TARGET_SPECIFICITIES } from "./kinds";
import { DATE_PRECISIONS, YEAR_EVENT_GROUPS } from "./year-groups";

export { KINDS, STATUSES, REL_FIELDS, KIND_META, PHASE_ORDER, routeFor, phaseLabel, normalisePhaseLabel, TARGET_ROLES, TARGET_ROLE_LABEL, EVIDENCE_TIERS, EVIDENCE_TIER_LABEL, TARGET_SPECIFICITIES, TARGET_SPECIFICITY_LABEL, TARGET_DISTRIBUTIONS, TARGET_DISTRIBUTION_LABEL } from "./kinds";
export type { Kind, Status, RelField, TargetRole, EvidenceTier, TargetSpecificity, TargetDistribution } from "./kinds";

/**
 * OnCo data model.
 *
 * Every object in the hub is an Entity with a `kind`. All entities share the base
 * fields; each kind adds a few typed fields. Relationships are expressed as arrays
 * of entity ids. Backlinks are derived at build time (see graph.ts), so a link only
 * needs to be declared once, on whichever side is most natural.
 *
 * Content rules (mirrors the Open Medical Registry):
 *  - `tldr` is for a non-technical reader. One or two plain sentences, no jargon.
 *  - `summary` is for a clinician, scientist, or engineer.
 *  - `asOf` is the date the facts were last checked. Facts change; say when.
 *  - Do not invent numbers. Prefer a source link over a remembered figure.
 */

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "ids are kebab-case");
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD");
const url = z.string().url();

export const ExternalLinkSchema = z.object({
  label: z.string().min(1),
  url,
});
export type ExternalLink = z.infer<typeof ExternalLinkSchema>;

export const TimelineEventSchema = z.object({
  year: z.union([z.number().int(), z.string()]),
  title: z.string().min(1),
  note: z.string().optional(),
  /** Entity ids this event is about. */
  refs: z.array(id).default([]),
});
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;

const Base = z.object({
  id,
  kind: z.enum(KINDS),
  name: z.string().min(1),
  aka: z.array(z.string()).default([]),
  /** Plain-language explanation for someone with no background. */
  tldr: z.string().min(1),
  /** Technical summary. Markdown-light: paragraphs separated by blank lines. */
  summary: z.string().min(1),
  status: z.enum(STATUSES).optional(),
  asOf: isoDate,
  wikipedia: url.optional(),
  links: z.array(ExternalLinkSchema).default([]),
  tags: z.array(z.string()).default([]),
  /** Free-form related entity ids (any kind). */
  related: z.array(id).default([]),
  /** Typed relationship arrays. Each holds ids of the named kind. */
  cancers: z.array(id).default([]),
  sections: z.array(id).default([]),
  technologies: z.array(id).default([]),
  targets: z.array(id).default([]),
  drugs: z.array(id).default([]),
  companies: z.array(id).default([]),
  institutions: z.array(id).default([]),
  pathways: z.array(id).default([]),
  terms: z.array(id).default([]),
  trials: z.array(id).default([]),
  people: z.array(id).default([]),
  /** Bottlenecks of the war on cancer this object bears on (ideas attack them; technologies, trials, collections relieve them). */
  bottlenecks: z.array(id).default([]),
  /** Key papers (kind "paper") this object rests on or is discussed in. */
  keyPapers: z.array(id).default([]),
  /** Journals (kind "journal") this object was published in or is tied to. */
  journals: z.array(id).default([]),
  /**
   * Upstream technologies this one cannot be delivered without (CAR-T needs apheresis, vector manufacturing,
   * cryopreservation). Meaningful on `technology` records; the dependency DAG at /dependencies/ is built from it.
   * Declared on the base so the relation arrays stay uniform (REL_FIELDS), and validated like every other id list.
   */
  dependsOn: z.array(id).default([]),
  /** Why this matters / what is hard about it. Optional editorial notes. */
  notes: z.array(z.string()).default([]),
  /** Even simpler explanation (about a 12-year-old reading age). Optional. */
  simple: z.string().optional(),
  /** Who last substantively edited this record (name or handle) and when. */
  provenance: z.object({ editedBy: z.string(), editedOn: isoDate, note: z.string().optional() }).optional(),
  /** Named probability estimate for speculative content. */
  confidence: z.object({ probability: z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]), by: z.string(), on: isoDate, note: z.string().optional() }).optional(),
});

export const CancerSchema = Base.extend({
  kind: z.literal("cancer"),
  /** ICD-O / organ system grouping, e.g. "breast", "lung", "blood". */
  group: z.string(),
  /** Roughly how common, in words. */
  burden: z.string().optional(),
  subtypes: z.array(z.string()).default([]),
  /** Key biomarkers a clinician tests for. */
  biomarkers: z.array(z.string()).default([]),
  standardOfCare: z.array(z.object({
    setting: z.string(), approach: z.string(), refs: z.array(id).default([]),
    /** Guideline mapping: NCCN category (e.g. "1", "2A", "preferred"), ESMO-MCBS grade (e.g. "A", "4"), guideline version/URL. */
    guideline: z.object({ nccn: z.string().optional(), esmoMcbs: z.string().optional(), version: z.string().optional(), url: url.optional() }).optional(),
  })).default([]),
  /** What is state of the art today, in one paragraph per point. */
  stateOfArt: z.array(z.string()).default([]),
  history: z.array(TimelineEventSchema).default([]),
  /** Pipeline and open problems: ids of drugs/technologies/trials/ideas. */
  pipeline: z.array(id).default([]),
  openProblems: z.array(z.string()).default([]),
  /**
   * The basics a newcomer needs before the treatment sections make sense: how the cancer shows itself, how it is
   * confirmed, and how it is staged. Short bulleted lines (glossary terms in them get hover explanations), with the
   * sources they were read from. Shown on the overview before the standard of care.
   */
  basics: z.object({
    symptoms: z.array(z.string()).default([]),
    diagnosis: z.array(z.string()).default([]),
    staging: z.array(z.string()).default([]),
    sources: z.array(ExternalLinkSchema).default([]),
  }).optional(),
  /**
   * Outlook in plain English: what moves survival for this cancer (stage at diagnosis, subtype, treatment) and the
   * headline population figures, with the statistics pages they were read from. Rendered behind the same survival
   * disclosure as the other averaged figures, so nobody meets a number before the context that qualifies it.
   */
  prognosis: z.object({ text: z.string().min(1), sources: z.array(ExternalLinkSchema).default([]) }).optional(),
  /** The broader cancer this record is a subtype of (pleural mesothelioma -> mesothelioma); the parent page lists its subtypes at the top. */
  parent: id.optional(),
});

export const SectionSchema = Base.extend({
  kind: z.literal("section"),
  order: z.number().int(),
  icon: z.string().optional(),
});

export const TechnologySchema = Base.extend({
  kind: z.literal("technology"),
  /** How it works, for a technical reader. */
  principle: z.string(),
  /** Which generation of the idea this is, if the field talks in generations. */
  generation: z.string().optional(),
  strengths: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  /** Year first used in humans or first approved, if meaningful. */
  since: z.union([z.number().int(), z.string()]).optional(),
});

export const TargetSchema = Base.extend({
  kind: z.literal("target"),
  /** Gene symbol / protein name. */
  symbol: z.string().optional(),
  /** Roles in cancer as the public catalogues state them (drug target, oncogene driver, tumour suppressor, biomarker or prognostic gene, fusion partner, DNA repair, immune checkpoint, antigen); several allowed. */
  role: z.array(z.enum(TARGET_ROLES)).default([]),
  /** Strongest public evidence tying the gene to cancer: approved drug, clinical evidence, driver by cohort analysis, or association only. */
  evidenceTier: z.enum(EVIDENCE_TIERS).optional(),
  /** The public sources each fact on the record was read from, with the page consulted and what it contributed. */
  sources: z.array(ExternalLinkSchema.extend({ note: z.string().optional() })).default([]),
  /**
   * Is the target unique to cancer cells, more abundant on them than on normal tissue, shared with one normal lineage,
   * present nearly everywhere, an inherited variant, or on immune or stromal cells? Set with `distribution` by
   * scripts/fetch-target-specificity.ts (src/data/target-specificity.ts) for every target with an approved or
   * clinical-stage drug; `specificityNote` says which data decided it and `specificitySources` cite them.
   */
  specificity: z.enum(TARGET_SPECIFICITIES).optional(),
  /** One cancer type, a few, or many (tumour-agnostic evidence), counted over cancer families with a prevalence row, an approval or an Open Targets association. */
  distribution: z.enum(TARGET_DISTRIBUTIONS).optional(),
  /** True when a label approval or threshold for a drug aimed at the target is tissue-agnostic (NTRK fusions, MSI-H, BRAF V600E, RET fusions, HER2 IHC 3+). */
  tumourAgnostic: z.boolean().optional(),
  /** Why the specificity and distribution read as they do, naming the data (readouts, drug mechanisms, HPA rows, UniProt disease text). Required when `specificity` or `distribution` is set. */
  specificityNote: z.string().optional(),
  /** The pages the specificity and distribution were read from. */
  specificitySources: z.array(ExternalLinkSchema.extend({ note: z.string().optional() })).default([]),
  /**
   * External gene identifiers for single-gene targets, filled by scripts/enrich-target-ids.ts from the HGNC REST API
   * (UniProt REST as fallback). Composite targets (AKT1/2/3, BRCA1, BRCA2) carry none; their per-gene ids live in
   * src/data/target-xrefs.ts. Rendered by IdentifierRow and emitted as schema:sameAs.
   */
  hgnc: z.string().regex(/^HGNC:\d+$/).optional(),
  ensembl: z.string().regex(/^ENSG\d{11}$/).optional(),
  uniprot: z.string().regex(/^[OPQ][0-9][A-Z0-9]{3}[0-9]$|^[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/).optional(),
  entrez: z.string().regex(/^\d+$/).optional(),
  /**
   * The year the target itself was first described in the literature, which is not the year of the earliest paper
   * OnCo happens to hold about it: our papers for a target are its clinical literature, so on many targets the first
   * drug precedes them. Filled by scripts/fetch-first-described.ts from UniProt's own reference list
   * (src/data/target-first-described.ts) and merged here by src/data/index.ts; left empty where no source states it,
   * because a guessed year would be computed with. `firstDescribedBasis` says what kind of description was dated and
   * `firstDescribedNote` names the paper, so the figure can be checked rather than believed.
   */
  firstDescribed: z.number().int().min(1800).max(2100).optional(),
  /** What was dated: "sequence" is the earliest paper UniProt cites for the protein or its gene sequence, the usual case; "literature" is a hand-sourced first description of the protein itself. */
  firstDescribedBasis: z.enum(["sequence", "literature"]).optional(),
  /** The paper the year comes from, named: authors, journal and year. Required when `firstDescribed` is set. */
  firstDescribedNote: z.string().optional(),
  /** Where the year was read: the UniProt entry, or the paper itself. Required when `firstDescribed` is set. */
  firstDescribedSource: url.optional(),
  biology: z.string(),
  /** Expression or alteration by cancer, free text. */
  whereFound: z.array(z.string()).default([]),
  targetClass: z.enum(["surface-antigen", "kinase", "checkpoint", "nuclear-receptor", "enzyme", "transcription", "oncogene", "tumor-suppressor", "stroma", "other"]).default("other"),
  /** Fraction of each cancer that expresses or carries the alteration, sourced. `pct` is 0-100 or a range string like "15-20". */
  prevalence: z.array(z.object({ cancerId: id, pct: z.union([z.number(), z.string()]), measure: z.string().optional(), source: url.optional(), note: z.string().optional() })).default([]),
});

export const ApprovalSchema = z.object({
  region: z.string(),
  year: z.number().int(),
  indication: z.string(),
  note: z.string().optional(),
});

export const DrugSchema = Base.extend({
  kind: z.literal("drug"),
  brand: z.string().optional(),
  code: z.string().optional(),
  /** Modality, e.g. "ADC", "small molecule", "mAb", "radioligand", "cell therapy", "vaccine", "device". */
  modality: z.string(),
  /**
   * True for a supportive care medicine: its approved indications are symptom control, toxicity rescue or prophylaxis,
   * or infection prophylaxis (antiemetics, growth factors, epoetins, bone-modifying agents, antidotes, opioids for cancer
   * pain, immunoglobulin). Set from src/data/supportive-drugs.ts; the rule the fetchers apply to indication text is
   * isSupportiveIndication in src/lib/supportive-care.ts. Supportive medicines stay in the corpus but are excluded from
   * treatment counts and rankings and carry a "Supportive care" pill so they never read as cancer treatments.
   */
  supportive: z.boolean().optional(),
  payload: z.string().optional(),
  linker: z.string().optional(),
  mechanism: z.string(),
  approvals: z.array(ApprovalSchema).default([]),
  /** Step-by-step mechanism for the animated mechanism card. */
  mechanismSteps: z.array(z.string()).default([]),
  dosing: z.object({ route: z.string(), schedule: z.string(), modifications: z.string().optional(), monitoring: z.string().optional(), source: url.optional() }).optional(),
  /** Adverse events with rates in percent, from the label or pivotal trial. */
  toxicity: z.array(z.object({ event: z.string(), anyGradePct: z.number().optional(), grade3PlusPct: z.number().optional(), source: url.optional(), note: z.string().optional() })).default([]),
  /** Cost and access by country. */
  access: z.array(z.object({ country: z.string(), listPrice: z.string().optional(), reimbursement: z.string().optional(), assistance: z.string().optional(), generic: z.boolean().optional(), source: url.optional(), asOf: isoDate.optional() })).default([]),
  /**
   * Dated regulatory events. Three of the types are the accelerated-approval pathway read one indication at a time:
   * "accelerated-approval" is the grant, "conversion" the confirmatory conversion to traditional approval, and
   * "withdrawal" the indication coming off the label. A grant and the event that closed it carry the same
   * `indication` text, which is what pairs them; a grant with neither is still open. The American rows are generated
   * from the FDA's own four accelerated-approval tables by scripts/fetch-accelerated.ts
   * (src/data/accelerated-approvals.ts) and merged onto the product here by src/data/index.ts, so they refresh with
   * the tables rather than rot in prose.
   */
  regulatoryEvents: z.array(z.object({
    date: z.string(),
    type: z.enum(["designation", "filing", "pdufa", "approval", "accelerated-approval", "conversion", "crl", "withdrawal", "label-change", "advisory-committee"]),
    region: z.string(),
    note: z.string(),
    source: url.optional(),
    /** The indication the event is about, in the source's own words. On the accelerated-approval pathway it keys a grant to the conversion or withdrawal that closed it. */
    indication: z.string().optional(),
  })).default([]),
});

/**
 * Broad company type. `investor` is a venture fund, corporate venture arm or disease foundation that finances the others; its
 * portfolio is derived from the `investors` field on the companies it backs. `cooperative-group` is an academic trials group or
 * public trial sponsor (SWOG, GORTEC, the German CLL Study Group, MRC CTU) that runs trials of other makers' products; it has no
 * products of its own, so it is not a developer type, and its trials are the `trials` field plus trial records naming it.
 */
export const COMPANY_TYPES = ["pharma", "biotech", "diagnostics", "imaging", "devices", "ai-software", "radiopharma", "cell-therapy", "cro-services", "nonprofit", "investor", "cooperative-group"] as const;
export type CompanyType = (typeof COMPANY_TYPES)[number];

/** Where a company is in its life: a venture-backed startup, a later-stage private company, listed, a large private group, acquired, or wound down. */
export const STAGES = ["startup", "growth", "public", "private-large", "acquired", "defunct"] as const;
export type Stage = (typeof STAGES)[number];

/** One financing round. `amountUsd` only when the cited source states the figure; `source` is the press release, SEC filing or trade report. */
export const FundingRoundSchema = z.object({
  /** "Seed", "Series A", "Series B", "IPO", "Grant", "Crossover", ... */
  round: z.string().min(1),
  year: z.number().int().min(1990).max(2100),
  amountUsd: z.number().positive().optional(),
  source: url,
  note: z.string().optional(),
});
export type FundingRound = z.infer<typeof FundingRoundSchema>;

export const CompanySchema = Base.extend({
  kind: z.literal("company"),
  hq: z.string(),
  country: z.string().length(2),
  companyType: z.enum(COMPANY_TYPES),
  website: url.optional(),
  ticker: z.string().optional(),
  founded: z.number().int().optional(),
  stage: z.enum(STAGES).optional(),
  /** Y Combinator batch, e.g. "W21", "S24", "X26" (Spring), "F25" (Fall). */
  ycBatch: z.string().regex(/^[WSXF]\d{2}$/, "YC batch like W21, S24, X26 or F25").optional(),
  /** Ids of investor records (companies with `companyType: "investor"`) that have backed this company. Backlinks give each investor its portfolio. */
  investors: z.array(id).default([]),
  /** Sourced financing rounds; omit rather than guess. */
  funding: z.array(FundingRoundSchema).default([]),
  /** Company id of the acquirer, when `stage` is "acquired" and the acquirer is in OnCo. */
  acquiredBy: id.optional(),
});

export const InstitutionSchema = Base.extend({
  kind: z.literal("institution"),
  city: z.string(),
  country: z.string().length(2),
  lat: z.number(),
  lng: z.number(),
  institutionType: z.enum(["cancer-center", "university", "hospital", "research-institute", "government", "consortium"]),
  website: url.optional(),
  /** NCI designation, US only. */
  nci: z.enum(["comprehensive", "clinical", "basic"]).optional(),
  /** Newsweek / Statista World's Best Specialized Hospitals 2026, Oncology rank. */
  newsweekOncology2026: z.number().int().optional(),
  /** Parent university, when the institution is a cancer centre inside one. */
  university: z.string().optional(),
  programs: z.array(z.string()).default([]),
});

export const PathwayNodeSchema = z.object({ id: z.string(), label: z.string(), x: z.number(), y: z.number(), targetId: id.optional() });
export const PathwayEdgeSchema = z.object({ from: z.string(), to: z.string(), type: z.enum(["activates", "inhibits"]).default("activates") });

export const PathwaySchema = Base.extend({
  kind: z.literal("pathway"),
  /** Layman explanation using an analogy. */
  analogy: z.string(),
  nodes: z.array(PathwayNodeSchema),
  edges: z.array(PathwayEdgeSchema),
  /** How drugs attack it. */
  interventions: z.array(z.string()).default([]),
});

export const TermSchema = Base.extend({
  kind: z.literal("term"),
  category: z.string(),
  /**
   * Date English Wikipedia was last searched for this term and found to have no article about it (title or redirect
   * matching the name or an alias, medical sense). Set by scripts/fetch-term-wikipedia.ts for its SKIP list; the
   * term-wikipedia gauge counts a term with this date as explained, and the term page says "No Wikipedia article".
   * Meaningless alongside `wikipedia`.
   */
  wikipediaChecked: isoDate.optional(),
});

export const TrialSchema = Base.extend({
  kind: z.literal("trial"),
  nct: z.string().optional(),
  phase: z.enum(["1", "1/2", "2", "2/3", "3", "4", "observational", "platform"]),
  setting: z.string(),
  sponsor: z.string().optional(),
  /** Headline result in one or two sentences, with numbers only if sourced. */
  result: z.string().optional(),
  /**
   * The date the study started, as the registry states it: "YYYY", "YYYY-MM" or "YYYY-MM-DD". Filled from the
   * ClinicalTrials.gov `startDateStruct` by scripts/fetch-trial-starts.ts (src/data/trial-start-dates.ts) and merged
   * here by src/data/index.ts; a hand-written date on the record wins. With `yearReported` it is the only way the
   * corpus can say how long a trial took, so it is never inferred from anything else.
   */
  started: z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "date like 2019, 2019-04 or 2019-04-15").optional(),
  /** Whether the registry marks the start date as the real one (ACTUAL) or a plan (ESTIMATED). */
  startedType: z.enum(["actual", "estimated"]).optional(),
  yearReported: z.number().int().optional(),
  enrolled: z.number().int().optional(),
  /**
   * What `enrolled` counts. "registry" (the default) means the ClinicalTrials.gov figure, so a gap against the
   * registry is a contradiction for scripts/roadmap-watch.ts to flag. The other values mean the figure is taken from
   * the primary paper and counts that population (patients randomised, analysed, treated, or registered on the
   * study), so a gap against the registry is expected and is reported as explained. Say why in `enrolledNote`.
   */
  enrolledBasis: z.enum(["registry", "randomised", "analysed", "treated", "registered"]).default("registry"),
  /** One sentence giving the registry figure and why it differs from `enrolled`; required when `enrolledBasis` is not "registry" (src/lib/corpus-rules.test.ts). */
  enrolledNote: z.string().optional(),
  /** Structured outcomes; values in the arm's unit (months, percent). Enables pictograms and comparisons. */
  outcomes: z.array(z.object({
    endpoint: z.string(),
    primary: z.boolean().optional(),
    unit: z.string().optional(),
    arms: z.array(z.object({ name: z.string(), n: z.number().int().optional(), value: z.number().optional(), note: z.string().optional() })).min(1),
    hr: z.number().optional(),
    ci: z.tuple([z.number(), z.number()]).optional(),
    p: z.string().optional(),
    source: url.optional(),
  })).default([]),
  /** Has an independent trial or real-world study confirmed the effect? */
  replication: z.string().optional(),
});

export const PairingSchema = Base.extend({
  kind: z.literal("pairing"),
  a: id,
  b: id,
  /** Why the pair works better than either alone. */
  rationale: z.string(),
  evidence: z.string(),
  pairingType: z.enum(["combination", "sequence", "diagnostic-therapeutic", "platform", "caution"]),
});

export const RoadmapStepSchema = z.object({
  era: z.string(),
  title: z.string(),
  description: z.string(),
  refs: z.array(id).default([]),
  status: z.enum(["historic", "current", "emerging", "speculative"]),
});

/** A dated thing to watch for on a roadmap: a readout, a decision, a completion date. `expected` is quoted from the source (a registry completion date, a meeting date), never inferred. */
export const RoadmapWatchSchema = z.object({
  item: z.string().min(1),
  expected: z.string().optional(),
  source: url.optional(),
  refs: z.array(id).default([]),
});
export type RoadmapWatch = z.infer<typeof RoadmapWatchSchema>;

export const RoadmapSchema = Base.extend({
  kind: z.literal("roadmap"),
  steps: z.array(RoadmapStepSchema).min(2),
  /** What to watch next, with expected dates where a source states them. Rendered under the steps and checked against the registries by scripts/roadmap-watch.ts. */
  watch: z.array(RoadmapWatchSchema).default([]),
});

export const IdeaSchema = Base.extend({
  kind: z.literal("idea"),
  hypothesis: z.string(),
  rationale: z.string(),
  /** What experiment or trial would confirm or kill it. */
  test: z.string(),
  maturity: z.enum(["speculative", "preclinical-evidence", "early-clinical", "being-tested-at-scale"]),
  /** Who would have to act: research, clinic, industry, regulator, payer, policy, patients, data, philanthropy. */
  actor: z.enum(["research", "clinic", "industry", "regulator", "payer", "policy", "patients", "data", "philanthropy", "engineering"]).optional(),
  /** Rough cost to try: small (<$1M), medium ($1-50M), large (>$50M). */
  cost: z.enum(["small", "medium", "large"]).optional(),
  /** Time to first evidence of impact in years. */
  horizonYears: z.number().int().min(0).max(30).optional(),
});

/** A key paper: a landmark publication explained. One page each: what it found, what it means, and what to be careful about. */
export const PaperSchema = Base.extend({
  kind: z.literal("paper"),
  journal: z.string(),
  year: z.number().int(),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  /** "Surname A, Surname B, et al." */
  authors: z.string(),
  paperType: z.enum(["rct", "meta-analysis", "observational", "real-world", "basic", "translational", "review", "guideline", "methods"]),
  /** The key results, one per item, with the numbers. */
  findings: z.array(z.string()).default([]),
  /** Plain English: what this changes for patients, clinicians or the field. */
  whatItMeans: z.string(),
  /** Limitations, open questions, disputes. */
  caveats: z.array(z.string()).default([]),
  /** Did it change guidelines or approvals? */
  changedPractice: z.boolean().optional(),
  /** Roughly how many participants, for trials and cohorts. */
  participants: z.number().int().optional(),
});

/** A journal or publication venue: where the evidence is published, with its stance, access model and the key papers it carried. */
export const JournalSchema = Base.extend({
  kind: z.literal("journal"),
  publisher: z.string(),
  url,
  issn: z.string().optional(),
  /** Broad scope: general medicine, oncology, haematology, basic science, radiology, etc. */
  scope: z.string(),
  /** Open access model: subscription, hybrid, open access, diamond. */
  access: z.enum(["subscription", "hybrid", "open-access", "diamond"]).optional(),
  founded: z.number().int().optional(),
  /** Latest impact factor or citation metric, with the year it refers to. Optional and clearly labelled. */
  impactFactor: z.object({ value: z.number(), year: z.number().int(), source: z.string().optional() }).optional(),
  /** Names as they appear in paper records, so papers can be matched to this journal. */
  matchNames: z.array(z.string()).default([]),
  society: z.string().optional(),
});

/** A bottleneck: a systemic constraint that slows the whole war on cancer. Ideas link to bottlenecks; the fixes are derived by backlink. */
export const BottleneckSchema = Base.extend({
  kind: z.literal("bottleneck"),
  /** Where in the pipeline it bites. */
  stage: z.enum(["biology", "prevention-detection", "trials", "regulation-manufacturing", "access-delivery", "data-knowledge", "funding-incentives", "people-culture"]),
  severity: z.enum(["critical", "major", "moderate"]),
  /** Numbers that show the size of the problem, each with a source. */
  metrics: z.array(z.object({ label: z.string(), value: z.string(), source: z.string().optional(), url: url.optional() })).default([]),
  /** Root causes, plain English, one per item. */
  causes: z.array(z.string()).default([]),
  /** What is already being tried and by whom. */
  currentEfforts: z.array(z.string()).default([]),
  /** What would count as the bottleneck being broken. */
  successLooksLike: z.string().optional(),
});

/**
 * How a biomarker readout is measured. Drives the measurement pill on /biomarkers/ and the parent target's
 * "Readouts and scores" strip. "Genome-wide" readouts (tumour mutational burden, ctDNA residual disease, the HRD
 * genomic scar) have no single gene; see `BiomarkerSchema.target`.
 */
export const MEASUREMENTS = ["ihc-score", "combined-positive-score", "tumour-proportion-score", "immune-cell-score", "tumour-cell-score", "fish-ratio", "sequencing-variant", "msi-status", "tmb-threshold", "methylation", "pet-tracer-expression", "copy-number", "hla-typing", "ctdna-detection", "genomic-instability-score"] as const;
export type Measurement = (typeof MEASUREMENTS)[number];
/** Readouts that measure the genome rather than one gene or protein; the only ones allowed no parent target. */
export const GENOME_WIDE_MEASUREMENTS: readonly Measurement[] = ["tmb-threshold", "ctdna-detection", "genomic-instability-score"];

/** A threshold an approval uses, quoted from the label with its URL. `drugId` and `cancerId` are corpus ids. */
export const BiomarkerThresholdSchema = z.object({
  /** The value as the label states it: "CPS >= 10", "IHC 3+", "TMB >= 10 mutations per megabase". */
  value: z.string().min(1),
  drugId: id,
  cancerId: id,
  /** FDA, EMA, MHRA, PMDA, NMPA, TGA. */
  regulator: z.string().min(1),
  /** Label or approval page the threshold was read from. */
  source: url,
  /** The label sentence carrying the threshold, verbatim (US spelling kept as printed). */
  quote: z.string().optional(),
  /** "historic" when the label has since dropped the requirement; "withdrawn" when the indication itself was withdrawn. */
  status: z.enum(["current", "historic", "withdrawn"]).default("current"),
  note: z.string().optional(),
});
export type BiomarkerThreshold = z.infer<typeof BiomarkerThresholdSchema>;

/** One row of the FDA list of cleared or approved companion diagnostic devices, for this readout. */
export const CompanionDiagnosticSchema = z.object({
  device: z.string().min(1),
  maker: z.string().min(1),
  /** Company record id, when the maker has a page. */
  companyId: id.optional(),
  /** The drug or drugs the device selects patients for, as the FDA lists them (corpus ids). */
  drugs: z.array(id).default([]),
  /** The FDA row's indication and sample column, as printed. */
  indication: z.string().min(1),
  /** PMA or 510(k) number with the approval date, as printed. */
  pma: z.string().optional(),
  source: url,
});
export type CompanionDiagnostic = z.infer<typeof CompanionDiagnosticSchema>;

/**
 * A biomarker readout: what a pathology or genomic report says about one gene or protein (PD-L1 CPS, HER2 IHC 3+,
 * EGFR exon 19 deletion), as distinct from the target itself. Every readout sits under its parent `target` (CD274
 * for the PD-L1 scores, ERBB2 for the HER2 readouts); sibling readouts of one target are listed on each other's page
 * and on the target page. Thresholds are quoted from labels; a readout with no approval says so and cites the
 * guideline or trial that defines it. Everything comes from public labels, the FDA companion diagnostic list,
 * guidelines and registries; nothing is inferred.
 */
export const BiomarkerSchema = Base.extend({
  kind: z.literal("biomarker"),
  /** Parent target id. Required unless `measurement` is genome-wide (GENOME_WIDE_MEASUREMENTS) or `noParentReason` says why there is none; checked in src/lib/biomarkers.test.ts. */
  target: id.optional(),
  /** For the rare readout with no single gene or protein that is not genome-wide either (an arm-level codeletion): why it has no parent. */
  noParentReason: z.string().min(1).optional(),
  measurement: z.enum(MEASUREMENTS),
  /** The scoring rule in plain English, with the sentence it was read from and its URL. */
  scoringRule: z.object({ text: z.string().min(1), quote: z.string().min(1), source: url, sourceLabel: z.string().min(1) }),
  thresholds: z.array(BiomarkerThresholdSchema).default([]),
  /** Where a readout has no approval threshold: the guideline or trial that defines it. */
  definedBy: z.object({ label: z.string().min(1), url }).optional(),
  /** Tumour test ids (src/data/tumour-tests.ts) that report this readout. */
  tests: z.array(z.string()).default([]),
  /** Assay registry ids (src/data/assays.ts) for this readout. */
  assays: z.array(z.string()).default([]),
  companionDiagnostics: z.array(CompanionDiagnosticSchema).default([]),
  /** What the result means for a patient, written only from the label or guideline text. */
  forPatient: z.string().min(1),
});

/**
 * One dated fact on a year record. Every field is copied from another record: `date` as that record states it
 * (a year, a month, a quarter or a day), `from` the record it was read off, `refs` the other records it is about.
 * Generated by src/data/years.ts, never hand-written, so a year cannot drift from the records it summarises.
 */
export const YearEventSchema = z.object({
  group: z.enum(YEAR_EVENT_GROUPS),
  /** YYYY, YYYY-MM, YYYY-Qn or YYYY-MM-DD, exactly as the source record gives it. */
  date: z.string().regex(/^\d{4}(?:-(?:\d{2}(?:-\d{2})?|Q[1-4]))?$/, "YYYY, YYYY-MM, YYYY-Qn or YYYY-MM-DD"),
  precision: z.enum(DATE_PRECISIONS),
  title: z.string().min(1),
  note: z.string().optional(),
  /** The record the fact was read from, where one record owns it. Calendar entries belong to the calendar rather than to a record and carry none. */
  from: id.optional(),
  /** Other records the fact is about; rendered as links on the year page. */
  refs: z.array(id).default([]),
});
export type YearEvent = z.infer<typeof YearEventSchema>;

/**
 * A year in oncology: everything the corpus dates to it, grouped by what kind of thing it was. Generated from the
 * other records (src/data/years.ts), so it holds no fact of its own; the timeline at /timeline/ runs over all of them.
 * A year with nothing in it still gets a record and says so, rather than being left out as if nothing had happened.
 */
export const YearSchema = Base.extend({
  kind: z.literal("year"),
  year: z.number().int(),
  events: z.array(YearEventSchema).default([]),
});

export const CollectionSchema = Base.extend({
  kind: z.literal("collection"),
  url,
  holds: z.string(),
  license: z.string().optional(),
  maintainer: z.string().optional(),
});

export const PersonSchema = Base.extend({
  kind: z.literal("person"),
  /** Current role and affiliation in one line, e.g. "Chief, Breast Medicine Service". */
  role: z.string(),
  /**
   * Primary affiliation id (also list in `institutions`): an institution, or a cooperative trials group, which is a
   * company record of type cooperative-group (list those in `companies`).
   */
  institutionId: id.optional(),
  specialisms: z.array(z.string()).default([]),
  /** Professional links: profile, lab, Google Scholar, ORCID, PubMed, X/LinkedIn. */
  profiles: z.array(z.object({ label: z.string(), url })).default([]),
  /** Selected publications, most recent or most cited first. */
  papers: z.array(z.object({ title: z.string(), journal: z.string().optional(), year: z.number().int().optional(), url: url.optional(), doi: z.string().optional(), note: z.string().optional() })).default([]),
  orcid: z.string().optional(),
  hIndex: z.number().int().optional(),
  /**
   * Whether an empty `papers` list is a gap. Normally derived from `role` (src/lib/person-roles.ts): administrators,
   * donors, patients, advocates and public figures are not expected to have papers. Set only where the role line
   * misleads that rule, e.g. `true` for "Founder and Director of the Institute for Protein Design" (a scientist),
   * `false` for "Chair, Board of Directors" (an administrator the rule misses).
   */
  papersExpected: z.boolean().optional(),
});

export const EntitySchema = z.discriminatedUnion("kind", [
  CancerSchema,
  SectionSchema,
  TechnologySchema,
  TargetSchema,
  DrugSchema,
  CompanySchema,
  InstitutionSchema,
  PathwaySchema,
  TermSchema,
  TrialSchema,
  PairingSchema,
  RoadmapSchema,
  IdeaSchema,
  CollectionSchema,
  PersonSchema,
  BottleneckSchema,
  PaperSchema,
  BiomarkerSchema,
  JournalSchema,
  YearSchema,
]);

export type Entity = z.infer<typeof EntitySchema>;
export type Cancer = z.infer<typeof CancerSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type Technology = z.infer<typeof TechnologySchema>;
export type Target = z.infer<typeof TargetSchema>;
export type Drug = z.infer<typeof DrugSchema>;
export type Company = z.infer<typeof CompanySchema>;
export type Institution = z.infer<typeof InstitutionSchema>;
export type Pathway = z.infer<typeof PathwaySchema>;
export type Term = z.infer<typeof TermSchema>;
export type Trial = z.infer<typeof TrialSchema>;
export type Pairing = z.infer<typeof PairingSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;
export type Idea = z.infer<typeof IdeaSchema>;
export type Collection = z.infer<typeof CollectionSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Bottleneck = z.infer<typeof BottleneckSchema>;
export type Paper = z.infer<typeof PaperSchema>;
export type Journal = z.infer<typeof JournalSchema>;
export type Biomarker = z.infer<typeof BiomarkerSchema>;
export type Year = z.infer<typeof YearSchema>;

/** Input types (before defaults are applied) — what authors write in data files. */
export type CancerInput = z.input<typeof CancerSchema>;
export type SectionInput = z.input<typeof SectionSchema>;
export type TechnologyInput = z.input<typeof TechnologySchema>;
export type TargetInput = z.input<typeof TargetSchema>;
export type DrugInput = z.input<typeof DrugSchema>;
export type CompanyInput = z.input<typeof CompanySchema>;
export type InstitutionInput = z.input<typeof InstitutionSchema>;
export type PathwayInput = z.input<typeof PathwaySchema>;
export type TermInput = z.input<typeof TermSchema>;
export type TrialInput = z.input<typeof TrialSchema>;
export type PairingInput = z.input<typeof PairingSchema>;
export type RoadmapInput = z.input<typeof RoadmapSchema>;
export type IdeaInput = z.input<typeof IdeaSchema>;
export type CollectionInput = z.input<typeof CollectionSchema>;
export type PersonInput = z.input<typeof PersonSchema>;
export type BottleneckInput = z.input<typeof BottleneckSchema>;
export type PaperInput = z.input<typeof PaperSchema>;
export type JournalInput = z.input<typeof JournalSchema>;
export type BiomarkerInput = z.input<typeof BiomarkerSchema>;
export type YearInput = z.input<typeof YearSchema>;
export type EntityInput = z.input<typeof EntitySchema>;

/**
 * Open-source projects in oncology (/open-source/). Not an entity kind: the records live in src/data/open-source.ts,
 * GENERATED by scripts/fetch-open-source.ts from the hand-curated list in scripts/open-source-curated.ts plus what
 * the GitHub API (or the project page, for projects not on GitHub) said on the day. Every record carries the URL
 * that was fetched with status 200 and the licence as the project states it.
 */
export const OPEN_SOURCE_CATEGORIES = [
  "analysis-pipeline",
  "variant-interpretation",
  "imaging-segmentation",
  "radiotherapy-planning",
  "pathology",
  "single-cell-spatial",
  "drug-discovery-chemistry",
  "trial-infrastructure",
  "data-commons",
  "clinical-decision-support",
  "patient-facing",
  "hardware",
  "standards-ontologies",
  "education",
] as const;
export type OpenSourceCategory = (typeof OPEN_SOURCE_CATEGORIES)[number];

/** How open the project is beyond the code licence: what a reader can actually take away and reuse. */
export const OPENNESS = [
  "open-code-open-data",
  "open-code-closed-data",
  "open-code",
  "open-weights",
  "gated-weights",
  "open-data",
  "access-controlled-data",
  "open-hardware",
  "open-content",
  "open-standard",
] as const;
export type Openness = (typeof OPENNESS)[number];

export const OpenSourceProjectSchema = z.object({
  id,
  name: z.string().min(1),
  /** Plain English, one or two sentences: what it does and who it is for. */
  summary: z.string().min(20),
  /** The project's own one-line description as the API or page gave it, verbatim. */
  description: z.string().optional(),
  category: z.enum(OPEN_SOURCE_CATEGORIES),
  /** SPDX id as the repository declares it, or "custom" (see licenceNote), "not stated" or "none stated". */
  licence: z.string().min(1),
  licenceNote: z.string().optional(),
  language: z.string().optional(),
  repo: url.optional(),
  homepage: url.optional(),
  /** Who maintains it, as free text; `maintainerId` when that maintainer is an institution or company in the corpus. */
  maintainer: z.string().optional(),
  maintainerId: id.optional(),
  /** Year the repository was created (the API's created_at): the closest thing to a first release the API gives. */
  since: z.number().int().min(1990).max(2100).optional(),
  /** Date of the last push (the API's pushed_at). */
  lastCommit: isoDate.optional(),
  stars: z.number().int().nonnegative().optional(),
  /** First non-Zenodo DOI named in the README or project page, when there is one. */
  doi: z.string().regex(/^10\.\d{4,9}\/\S+$/).optional(),
  cancers: z.array(id).default([]),
  targets: z.array(id).default([]),
  technologies: z.array(id).default([]),
  /** Ids from src/data/data-sources.ts this project reads, serves or is the code behind. */
  dataSources: z.array(id).default([]),
  /** Collection ids: the open database the project is the code behind, or the dataset it publishes. */
  collections: z.array(id).default([]),
  openness: z.enum(OPENNESS),
  opennessNote: z.string().optional(),
  /** False for a project listed as a model of open practice that is not about cancer (Open Source Malaria). */
  oncology: z.boolean().default(true),
  archived: z.boolean().optional(),
  source: z.object({ url, status: z.literal(200), fetched: isoDate }),
});
export type OpenSourceProject = z.infer<typeof OpenSourceProjectSchema>;
export type OpenSourceProjectInput = z.input<typeof OpenSourceProjectSchema>;

/* ------------------------------------------------------------------------------------------------
 * The software of oncology (/software/). Not an entity kind: the records live in src/data/software.ts,
 * GENERATED by scripts/fetch-software.ts from the curated list in scripts/software-curated.ts plus what
 * three public services said on the day: the vendor's own page, the FDA device databases through openFDA,
 * and Europe PMC. The open-source projects the field runs on stay in src/data/open-source.ts (/open-source/);
 * this file is the rest of the field, most of which is commercial and much of which is regulated.
 *
 * The sourcing rule, which the page states in its own voice: a company's own site establishes that a product
 * exists, what it claims to do and where it lives, and nothing more. Every claim about clearance, performance
 * or adoption has to come from `clearances`, `papers` or `listings`, each of which is a source outside the
 * company that was fetched and checked to name the product. `sourcing` is derived, never curated: a record
 * with no such source is "self-described" and says so on the page.
 * ---------------------------------------------------------------------------------------------- */

export const SOFTWARE_CATEGORIES = [
  "clinical-systems",
  "regulated-device",
  "genomics-interpretation",
  "trials-registries",
  "case-review",
  "research-analysis",
] as const;
export type SoftwareCategory = (typeof SOFTWARE_CATEGORIES)[number];

/** Finer grain inside a category: what the thing is, in the words a department would use. */
export const SOFTWARE_SEGMENTS = [
  "Oncology electronic record",
  "Chemotherapy prescribing",
  "Radiotherapy planning",
  "Radiotherapy QA and dosimetry",
  "Patient positioning and monitoring",
  "Pathology platform",
  "Radiology platform",
  "Pathology AI",
  "Radiology AI",
  "Endoscopy and dermatology AI",
  "Sequencing and variant calling",
  "Variant interpretation and reporting",
  "Comprehensive genomic profiling",
  "Trial registry",
  "Trial matching",
  "Trial conduct software",
  "Cancer registry software",
  "Real-world data platform",
  "Case review and second opinion",
  "Patient-reported outcomes",
  "Risk and decision tools",
  "Research analysis tool",
] as const;
export type SoftwareSegment = (typeof SOFTWARE_SEGMENTS)[number];

/** Whether anything outside the company backs the record up. Derived by the generator, never curated. */
export const SOFTWARE_SOURCING = ["independent", "self-described"] as const;
export type SoftwareSourcing = (typeof SOFTWARE_SOURCING)[number];

/** One clearance, grant or approval as the FDA device databases return it through openFDA. */
export const SoftwareClearanceSchema = z.object({
  authority: z.literal("FDA"),
  route: z.enum(["510(k)", "De Novo", "PMA", "PMA supplement"]),
  /** K, DEN or P number, with the supplement suffix for a PMA supplement. */
  number: z.string().min(3),
  device: z.string().min(1),
  applicant: z.string().min(1),
  /** The decision as the database words it, verbatim. */
  decision: z.string().min(1),
  date: isoDate,
  /** The openFDA query that returned this record, so a reader can run it again. */
  url,
});
export type SoftwareClearance = z.infer<typeof SoftwareClearanceSchema>;

/** A peer-reviewed or preprinted paper that names the product, as Europe PMC returned it. */
export const SoftwarePaperSchema = z.object({
  title: z.string().min(5),
  journal: z.string().optional(),
  year: z.number().int().min(1950).max(2100),
  doi: z.string().optional(),
  pmid: z.string().optional(),
  citedBy: z.number().int().nonnegative().optional(),
  /** Preprints and other non-peer-reviewed records are marked so the page does not call them evaluations. */
  peerReviewed: z.boolean(),
  url,
});
export type SoftwarePaper = z.infer<typeof SoftwarePaperSchema>;

/** A public body's page that names the product: a framework, a procurement list, a guideline, a registry. */
export const SoftwareListingSchema = z.object({
  body: z.string().min(2),
  label: z.string().min(2),
  url,
  fetched: isoDate,
});
export type SoftwareListing = z.infer<typeof SoftwareListingSchema>;

export const SoftwareProductSchema = z.object({
  id,
  name: z.string().min(1),
  /** The company, institution or public body behind it, as free text; `vendorId` when it is in the corpus. */
  vendor: z.string().min(1),
  vendorId: id.optional(),
  category: z.enum(SOFTWARE_CATEGORIES),
  segment: z.enum(SOFTWARE_SEGMENTS),
  /** OnCo's plain-English gloss of what the product is. Never a performance, adoption or regulatory claim. */
  summary: z.string().min(20),
  /** The company's own words on the page fetched, verbatim, with the URL and the date. */
  claim: z.object({ text: z.string().min(1), url, fetched: isoDate, namesProduct: z.boolean() }).optional(),
  /** Derived: "independent" when at least one clearance, paper or listing verified; otherwise "self-described". */
  sourcing: z.enum(SOFTWARE_SOURCING),
  clearances: z.array(SoftwareClearanceSchema).default([]),
  papers: z.array(SoftwarePaperSchema).default([]),
  listings: z.array(SoftwareListingSchema).default([]),
  /** The record in src/data/open-source.ts when an open-source project is the same tool or its counterpart. */
  openSourceId: z.string().optional(),
  technologies: z.array(id).default([]),
  cancers: z.array(id).default([]),
  /** Why the record reads as it does: a discontinued product, a renamed one, a fetch that could not reach a page. */
  note: z.string().optional(),
  /** The URL that established the record, fetched with status 200: the vendor page, or a regulator when it failed. */
  source: z.object({ url, status: z.literal(200), fetched: isoDate }),
});
export type SoftwareProduct = z.infer<typeof SoftwareProductSchema>;
export type SoftwareProductInput = z.input<typeof SoftwareProductSchema>;

/* ------------------------------------------------------------------------------------------------
 * Combination proposals (the open pipeline, /pipeline/engine/).
 *
 * A CombinationIdea is a hypothesis, not a corpus entity: a cell of the modular-drug permutation
 * space (ADC target x payload class, radioligand target x isotope, CAR-T target x costimulatory
 * domain, bispecific target A x target B, degrader target x E3 ligase) where both components are
 * validated but no corpus drug combines them. Each row carries the score that ranked it, the
 * corpus records its rationale rests on, and every piece of public evidence found that a company
 * or group may already be testing it. Evidence rows quote a fetched source; a row with none says so.
 * See docs/OPEN-PIPELINE.md for the scoring formula and the search method.
 * ---------------------------------------------------------------------------------------------- */

export const COMBINATION_FORMATS = ["adc", "radioligand", "car-t", "bispecific", "degrader"] as const;
export type CombinationFormat = (typeof COMBINATION_FORMATS)[number];

export const COMBINATION_EVIDENCE_KINDS = ["trial", "paper", "patent", "company-page"] as const;
export type CombinationEvidenceKind = (typeof COMBINATION_EVIDENCE_KINDS)[number];

export const COMBINATION_STATUSES = ["no public evidence", "preclinical evidence", "clinical evidence", "already in development (missed by decomposer)"] as const;
export type CombinationStatus = (typeof COMBINATION_STATUSES)[number];

/** How strongly a component is validated: by an approved drug, by a phase-3, phase-2 or phase-1/2 programme, or not at all. */
export const COMPONENT_VALIDATION_LEVELS = ["approved", "phase-3", "phase-2", "phase-1-2", "none"] as const;
export type ComponentValidationLevel = (typeof COMPONENT_VALIDATION_LEVELS)[number];

/** One fetched source. `source` is the identifier (NCT number, PMID or DOI, patent publication number, page title); `quote` is a verbatim sentence from it. */
export const CombinationEvidenceSchema = z.object({
  kind: z.enum(COMBINATION_EVIDENCE_KINDS),
  source: z.string().min(1),
  url: z.string().url().regex(/^https:\/\//, "evidence urls must be https"),
  date: isoDate,
  quote: z.string().min(1),
  /** Sponsor, assignee or author group named in the source. */
  sponsor: z.string().min(1).optional(),
  /** Reviewer's note: what this source does and does not show (e.g. "programme discontinued 2019"). */
  note: z.string().optional(),
  /** True when the source tests a neighbouring cell (same target, different partner component): kept for context, it does not set `status`. */
  adjacent: z.boolean().optional(),
});
export type CombinationEvidence = z.infer<typeof CombinationEvidenceSchema>;

const ComponentValidationSchema = z.object({
  level: z.enum(COMPONENT_VALIDATION_LEVELS),
  /**
   * Corpus drug ids that establish the level. Empty when the level rests on a fetched source instead of a
   * corpus record (a component the corpus does not yet cover, such as the VHL E3 ligase); the `evidence`
   * array must then carry the row that establishes it, which a test enforces.
   */
  via: z.array(id).default([]),
});

export const CombinationIdeaSchema = z.object({
  id,
  format: z.enum(COMBINATION_FORMATS),
  /** Human name of the construct, e.g. "PSMA ADC with a topoisomerase-I payload". */
  name: z.string().min(1),
  /**
   * Components keyed by axis. Keys per format: adc -> target, payloadClass; radioligand -> target, isotope;
   * car-t -> target, costimulatoryDomain; bispecific -> targetA, targetB; degrader -> target, e3Ligase.
   * Values are corpus ids where one exists (targets, payload-class terms, cereblon, cd28) and stable kebab-case
   * keys otherwise (lutetium-177, actinium-225, yttrium-90, iodine-131, lead-212, 4-1bb, vhl).
   */
  components: z.record(z.string(), z.string().min(1)),
  targets: z.array(id).min(1),
  cancers: z.array(id).min(1),
  /** Two plain-English sentences; every claim names the corpus record it rests on in parentheses. */
  rationale: z.string().min(1),
  /** Why the pairing is or is not plausible on first principles (internalisation, tumour restriction, antigen homogeneity, ligase expression). */
  plausibilityNote: z.string().min(1),
  validation: z.object({ a: ComponentValidationSchema, b: ComponentValidationSchema }),
  /** Score out of 100 = burden (0-40) + validationA (0-15) + validationB (0-15) + plausibility (0-30). docs/OPEN-PIPELINE.md gives the formula. */
  score: z.object({
    total: z.number().int().min(0).max(100),
    burden: z.number().int().min(0).max(40),
    /** World deaths in 2022 (GLOBOCAN) summed over the distinct sites of `cancers`; the input to `burden`. */
    worldDeaths: z.number().int().min(0),
    validationA: z.number().int().min(0).max(15),
    validationB: z.number().int().min(0).max(15),
    plausibility: z.number().int().min(0).max(30),
  }),
  evidence: z.array(CombinationEvidenceSchema).default([]),
  status: z.enum(COMBINATION_STATUSES),
  /** What would need to be true for this to work: the caveat a reader should carry away. */
  caveat: z.string().min(1),
  /** Corpus drug ids that already occupy this cell but whose record lacks the field the decomposer needs (payload, ligase). */
  decomposerMissed: z.array(id).default([]),
  /** Every corpus id the rationale and plausibility note cite, so a test can check they resolve. */
  refs: z.array(id).default([]),
  /** The search that produced `evidence`: when it ran and the query strings, so anyone can repeat it. */
  searched: z.object({ on: isoDate, ctgov: z.array(z.string()), europepmc: z.array(z.string()), patents: z.array(z.string()) }),
  asOf: isoDate,
});
export type CombinationIdea = z.infer<typeof CombinationIdeaSchema>;
export type CombinationIdeaInput = z.input<typeof CombinationIdeaSchema>;

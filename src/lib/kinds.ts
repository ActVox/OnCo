/**
 * The zod-free half of the data model: the kind and status lists, the relationship field names, KIND_META and
 * routeFor. Client components import these from here so that the header, the palette and every chip do not pull
 * zod and the validation schemas (src/lib/schema.ts) into the browser bundle of every page; schema.ts re-exports
 * them, so server code can keep importing everything from one place.
 */
export const KINDS = [
  "cancer",
  "section",
  "technology",
  "target",
  "drug",
  "company",
  "institution",
  "pathway",
  "term",
  "trial",
  "pairing",
  "roadmap",
  "idea",
  "collection",
  "person",
  "bottleneck",
  "paper",
  "journal",
  "biomarker",
  "year",
] as const;
export type Kind = (typeof KINDS)[number];

export const STATUSES = [
  "approved",
  "phase-3",
  "phase-2",
  "phase-1",
  "preclinical",
  "concept",
  "standard-of-care",
  "established",
  "emerging",
  "historic",
  "withdrawn",
  "active",
  "completed",
  "recruiting",
  "positive",
  "negative",
  "mixed",
  "planned",
] as const;
export type Status = (typeof STATUSES)[number];

/**
 * What a gene or protein does in cancer, as the public catalogues describe it. A target may carry several: a kinase
 * can be a drug target, an oncogene driver and a fusion partner at once. Labels in TARGET_ROLE_LABEL.
 */
export const TARGET_ROLES = ["drug-target", "oncogene-driver", "tumour-suppressor", "biomarker", "fusion-partner", "dna-repair", "immune-checkpoint", "antigen"] as const;
export type TargetRole = (typeof TARGET_ROLES)[number];
export const TARGET_ROLE_LABEL: Record<TargetRole, string> = {
  "drug-target": "Drug target", "oncogene-driver": "Oncogene driver", "tumour-suppressor": "Tumour suppressor", biomarker: "Biomarker or prognostic gene",
  "fusion-partner": "Fusion partner", "dna-repair": "DNA repair", "immune-checkpoint": "Immune checkpoint", antigen: "Antigen",
};
/** Strongest public evidence that ties a target to cancer, strongest first. Labels in EVIDENCE_TIER_LABEL. */
export const EVIDENCE_TIERS = ["approved-drug", "clinical-evidence", "cohort-driver", "association-only"] as const;
export type EvidenceTier = (typeof EVIDENCE_TIERS)[number];
export const EVIDENCE_TIER_LABEL: Record<EvidenceTier, string> = {
  "approved-drug": "Approved drug", "clinical-evidence": "Clinical evidence", "cohort-driver": "Driver by cohort analysis", "association-only": "Association only",
};

/**
 * How specific a target is to cancer cells: is the thing the medicine aims at unique to the tumour, more abundant on
 * the tumour than on normal tissue, shared with one normal cell lineage, present nearly everywhere, an inherited
 * variant, or a target on immune or stromal cells rather than the tumour. Filled by scripts/fetch-target-specificity.ts
 * from label readouts, drug mechanisms, the Human Protein Atlas and UniProt; labels in TARGET_SPECIFICITY_LABEL.
 */
export const TARGET_SPECIFICITIES = ["tumour-specific", "tumour-associated", "lineage-antigen", "broadly-expressed", "germline-variant", "immune-microenvironment"] as const;
export type TargetSpecificity = (typeof TARGET_SPECIFICITIES)[number];
export const TARGET_SPECIFICITY_LABEL: Record<TargetSpecificity, string> = {
  "tumour-specific": "Tumour-specific alteration",
  "tumour-associated": "Tumour-associated overexpression",
  "lineage-antigen": "Lineage antigen",
  "broadly-expressed": "Broadly expressed or essential",
  "germline-variant": "Germline variant",
  "immune-microenvironment": "Immune or microenvironment target",
};
/** How many cancer types the target matters in, from prevalence rows, approvals and Open Targets; labels in TARGET_DISTRIBUTION_LABEL. */
export const TARGET_DISTRIBUTIONS = ["one-type", "few-types", "many-types", "not-established"] as const;
export type TargetDistribution = (typeof TARGET_DISTRIBUTIONS)[number];
export const TARGET_DISTRIBUTION_LABEL: Record<TargetDistribution, string> = {
  "one-type": "One cancer type", "few-types": "A few cancer types", "many-types": "Many cancer types", "not-established": "Distribution not established",
};

/** The relationship array fields shared by every entity. */
export const REL_FIELDS = [
  "related",
  "cancers",
  "sections",
  "technologies",
  "targets",
  "drugs",
  "companies",
  "institutions",
  "pathways",
  "terms",
  "trials",
  "people",
  "bottlenecks",
  "keyPapers",
  "journals",
  "dependsOn",
] as const;
export type RelField = (typeof REL_FIELDS)[number];

export const KIND_META: Record<Kind, { plural: string; label: string; route: string; blurb: string; color: string; /** Display title where the plural is not the best public name (e.g. "Treatments & tests" for drugs, which also covers tests and devices). */ title?: string }> = {
  cancer: { plural: "cancers", label: "Cancer", route: "cancers", blurb: "One page per disease: state of the art, history, and what is coming.", color: "rose" },
  section: { plural: "fronts", label: "Front", route: "fronts", blurb: "The fronts of the war on cancer: from imaging and early detection to ADCs, radiopharma, and cell therapy.", color: "slate" },
  technology: { plural: "technologies", label: "Technology", route: "technologies", blurb: "Every way we see, measure, or attack a tumour, explained.", color: "sky" },
  target: { plural: "targets", label: "Target", route: "targets", blurb: "The molecules drugs and tracers aim at.", color: "violet" },
  drug: { plural: "drugs", label: "Treatment", route: "drugs", title: "Treatments & tests", blurb: "Approved and pipeline products, with what they hit and who makes them.", color: "emerald" },
  company: { plural: "companies", label: "Company", route: "companies", blurb: "Who is building what.", color: "amber" },
  institution: { plural: "institutions", label: "Institution", route: "institutions", blurb: "The centres and universities that matter, mapped and ranked.", color: "teal" },
  pathway: { plural: "pathways", label: "Pathway", route: "pathways", blurb: "The classic signalling circuits, drawn and explained.", color: "fuchsia" },
  term: { plural: "terms", label: "Term", route: "terms", title: "Glossary", blurb: "Glossary with plain-English TL;DRs and Wikipedia links.", color: "zinc" },
  trial: { plural: "trials", label: "Trial", route: "trials", blurb: "Landmark and current trials that define the standard of care.", color: "indigo" },
  pairing: { plural: "pairings", label: "Pairing", route: "pairings", blurb: "Things that work better together, and things that do not.", color: "orange" },
  roadmap: { plural: "roadmaps", label: "Roadmap", route: "roadmaps", blurb: "Where a technology has been and where it is heading.", color: "cyan" },
  idea: { plural: "ideas", label: "Idea", route: "ideas", blurb: "Hypotheses and new directions, linked to the evidence.", color: "lime" },
  collection: { plural: "collections", label: "Collection", route: "collections", blurb: "The open databases and registries the field runs on.", color: "stone" },
  person: { plural: "people", label: "Person", route: "people", blurb: "The clinicians and scientists doing the work: specialisms, bios, papers, and where to find them.", color: "pink" },
  journal: { plural: "journals", label: "Journal", route: "journals", blurb: "Where the evidence is published: the journals, their scope and access model, and the key papers each one carried.", color: "slate" },
  paper: { plural: "key papers", label: "Key paper", route: "key-papers", blurb: "The papers that changed practice or thinking, each explained: what it found, what it means, and what to be careful about.", color: "sky" },
  bottleneck: { plural: "bottlenecks", label: "Bottleneck", route: "bottlenecks", blurb: "The systemic constraints slowing the whole war on cancer, with the ideas that could break each one.", color: "red" },
  // "Years and the timeline" named two pages at once: this index is one record per year, and /timeline/ is the chart
  // over the whole field with the findings read off its shape. The title says which of the two a reader has reached
  // ("years of what?"); the navigation entry is "Year by year" beside "Timeline" for the same reason.
  year: { plural: "years", label: "Year", route: "years", title: "Oncology year by year", blurb: "One record per year: everything the corpus dates to it, each line linking to the record it was read from. The whole field on one chart is the timeline.", color: "stone" },
  biomarker: { plural: "biomarkers", label: "Biomarker", route: "biomarkers", title: "Biomarkers & readouts", blurb: "The readouts a pathology report gives (PD-L1 CPS, HER2 IHC 3+, MSI-high), each under its gene or protein, with the thresholds approvals use and the tests that measure them.", color: "violet" },
};

export function routeFor(e: { kind: Kind; id: string }): string {
  return `/${KIND_META[e.kind].route}/${e.id}/`;
}

/**
 * The label a table facet uses for a record: its name without a trailing parenthetical. "Lung cancer (all types)"
 * filters as "Lung cancer". Exported because the links that pre-filter a table have to build the same string: a
 * cancer page linked to `/trials/?cancers=Breast cancer (all types)` and the table, which had shortened its
 * values, matched nothing and showed an empty list.
 */
export const facetLabel = (name: string) => name.replace(/ \(.*\)$/, "");

/**
 * The decade a year belongs to, as a facet value: 1987 becomes "1980s". The one rule for the era facets, so the
 * technologies table and /machines/ bucket the same year the same way and a link from one filters the other.
 * A single year is too fine to filter a table of technologies by (two thirds of the years hold one record), so the
 * cell prints the exact year and the filter it sets is the decade.
 */
export const decadeLabel = (year: number | string) => `${String(year).slice(0, 3)}0s`;

/** Trial phase values (the `phase` enum in schema.ts) in display order: late-stage first, then platform and observational designs. */
export const PHASE_ORDER = ["3", "2/3", "platform", "2", "1/2", "1", "4", "observational"] as const;

/**
 * The same values in the order a drug meets them, earliest first. A filter is a list of the choices available,
 * and a reader scanning it is asking "how far along?", so the list should run the way time does. PHASE_ORDER is
 * the other question, "what is furthest along?", and stays as it is: a dossier's trial list leads with phase 3.
 * Phase 4 is after approval, so it follows phase 3; platform and observational designs sit outside the sequence
 * and go last.
 */
export const PHASE_FILTER_ORDER = ["1", "1/2", "2", "2/3", "3", "4", "platform", "observational"] as const;

const PHASE_LABEL: Record<string, string> = { "3": "Phase 3", "2/3": "Phase 2/3", "2": "Phase 2", "1/2": "Phase 1/2", "1": "Phase 1", "4": "Phase 4", platform: "Platform trial", observational: "Observational study" };

/** Human label for a trial phase value: "Phase 3", "Platform trial", "Observational study"; unknown values come back unchanged. */
export function phaseLabel(phase: string): string {
  return PHASE_LABEL[phase] ?? phase;
}

/**
 * Maps any historical phase facet value to the current label so shared links keep filtering: accepts the label itself
 * ("Observational study"), the raw enum value ("observational") and the old template form ("Phase observational").
 */
export function normalisePhaseLabel(value: string): string {
  const v = value.trim();
  if (Object.values(PHASE_LABEL).includes(v)) return v;
  if (v in PHASE_LABEL) return PHASE_LABEL[v];
  const m = /^Phase (.+)$/i.exec(v);
  return m && m[1] in PHASE_LABEL ? PHASE_LABEL[m[1]] : v;
}

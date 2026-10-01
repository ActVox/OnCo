/**
 * Shared constants for the lymphoma evidence files (lymphoma-evidence*.ts), facet C of the lymphoma deep dive,
 * 29 September to 1 October 2026. Not a spike: it exports no `Spike`.
 *
 * How the numbers here were obtained, and why that matters. Every ClinicalTrials.gov field (registry id, status,
 * start date, phase, enrolment, lead sponsor) was read from the ClinicalTrials.gov v2 API on 1 October 2026 and
 * cached before anything was written. Every paper was resolved through the Europe PMC REST API on the same day by
 * DOI or by title, and the figures quoted come from the indexed abstract of the record that came back, not from
 * memory. Two identifiers that looked right from memory turned out to belong to other papers: the BELINDA trial's
 * DOI is 10.1056/NEJMoa2116596 and not the number this agent first reached for, and no full publication of
 * ECHELON-3 exists under the title it was expected to carry (it is in the Journal of Clinical Oncology under
 * "Brentuximab Vedotin Combination for Relapsed Diffuse Large B-Cell Lymphoma"). That is the reason nothing below
 * is cited without a resolved identifier.
 *
 * Where a trial or a paper already has a record in the corpus it is referenced by id and supplemented, never
 * restated: 5,935 trial records and 2,540 paper records were searched by registry id, DOI and PubMed id before a
 * single new record was written.
 */
import type { TrialInput } from "@/lib/schema";

export const asOf = "2026-10-01";

export const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });
export const doi = (d: string, label: string) => ({ label, url: `https://doi.org/${d}` });
export const pubmed = (pmid: string) => ({ label: "PubMed", url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` });
export const epmc = (pmid: string) => ({ label: "Europe PMC", url: `https://europepmc.org/article/MED/${pmid}` });
export const link = (label: string, url: string) => ({ label, url });

/** The cancer records this facet links to. Every one existed in the corpus on 1 October 2026; facet A owns any new one. */
export const CX = {
  nhl: "non-hodgkin-lymphoma",
  dlbcl: "dlbcl",
  pmbcl: "primary-mediastinal-b-cell-lymphoma",
  burkitt: "burkitt-lymphoma",
  pcnsl: "primary-cns-lymphoma",
  fl: "follicular-lymphoma",
  mzl: "marginal-zone-lymphoma",
  malt: "malt-lymphoma",
  smzl: "splenic-marginal-zone-lymphoma",
  nmzl: "nodal-marginal-zone-lymphoma",
  mcl: "mantle-cell-lymphoma",
  wm: "waldenstrom",
  ptcl: "peripheral-t-cell-lymphoma",
  aitl: "angioimmunoblastic-t-cell-lymphoma",
  ctcl: "cutaneous-t-cell-lymphoma",
  sezary: "sezary-syndrome",
  hodgkin: "hodgkin-lymphoma",
  hodgkinEarly: "early-stage-classical-hodgkin-lymphoma",
  hodgkinAdvanced: "advanced-stage-classical-hodgkin-lymphoma",
  hodgkinRelapsed: "relapsed-refractory-hodgkin-lymphoma",
  nlphl: "nodular-lymphocyte-predominant-hodgkin-lymphoma",
  hiv: "hiv-associated-lymphoma",
  ptld: "post-transplant-lymphoproliferative-disorder",
} as const;

/**
 * Diseases named in the text of this facet that had no cancer record in the corpus when it was written, and that
 * facet A of the deep dive owns. They are written out in words and attached to the nearest existing record
 * (usually `peripheral-t-cell-lymphoma` or `non-hodgkin-lymphoma`) rather than linked to an id that does not
 * exist, which would fail the build. Wire them once facet A's records land.
 */
export const PENDING_CANCERS = [
  "extranodal NK/T-cell lymphoma, nasal type",
  "adult T-cell leukaemia/lymphoma (HTLV-1)",
  "anaplastic large cell lymphoma, ALK-positive and ALK-negative",
  "mycosis fungoides",
  "high-grade B-cell lymphoma with MYC and BCL2 rearrangements",
  "transformed follicular lymphoma",
] as const;

/**
 * Glossary terms named in this facet that had no record on 1 October 2026. They are spelled out where they are
 * used; existing terms (cell-of-origin, lugano-classification, deauville-score, flipi, ipi-score, ctdna, mrd,
 * crs, icans, orr, pfs, complete-response, non-inferiority, hazard-ratio, autologous-transplant,
 * maintenance-therapy, watchful-waiting, double-hit-lymphoma, and facet B's lymphoma-tx-* set) are linked by id.
 */
export const PENDING_TERMS = [
  "lymphgen", "genetic-subtypes-dlbcl", "second-malignancy", "standardised-incidence-ratio", "seamless-trial-design",
  "multiregional-clinical-trial", "ich-e17",
] as const;

/**
 * Trial records that already existed in the corpus on 1 October 2026 under a registry-generated id rather than
 * their trial name. They are supplemented in ./lymphoma-evidence.ts (acronym, headline result, outcomes, the
 * paper that reports them) instead of being written again, because a second record of the same study under a
 * better-looking id is the duplicate nothing in the build catches.
 */
export const REGISTRY_ID_TRIALS = {
  elm2: "nct03888105",
  echelon3: "nct04404283",
  inmind: "nct04680052",
  echo: "nct02972840",
} as const;

type T = Omit<TrialInput, "kind" | "asOf">;
/** Trial factory for this facet. `tags` carries the facet marker so the round can be audited later. */
export const trial = (x: T): TrialInput => ({ kind: "trial", asOf, tags: ["lymphoma-evidence"], ...x });

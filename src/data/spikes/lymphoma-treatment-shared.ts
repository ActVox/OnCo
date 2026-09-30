import type { TermInput } from "@/lib/schema";

/**
 * Constants and helpers shared by the lymphoma treatment files (./lymphoma-treatment.ts, -bcell.ts, -tcell.ts,
 * -hodgkin.ts). Not a spike: it exports no `Spike`.
 *
 * Every DOI below was resolved through the Europe PMC REST API on 29 September 2026 and the abstract read, so the
 * figures quoted in the standard-of-care rows come from the source text rather than from memory. Two PubMed ids that
 * looked right from memory turned out to belong to unrelated papers (a retinal imaging study and IBIS-II), which is
 * why nothing here is quoted without a resolved identifier.
 *
 * Where a trial or paper already has a record in the corpus it is referenced by id instead of being restated here;
 * the DOIs collected in SRC are the sources OnCo did not already hold.
 */
export const asOf = "2026-09-29";

export const doi = (label: string, id: string) => ({ label, url: `https://doi.org/${id}` });
export const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });
export const link = (label: string, url: string) => ({ label, url });
export const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });

const D = (id: string) => `https://doi.org/${id}`;

/** Sources quoted in more than one row. Each was opened on Europe PMC and its abstract read on 29 September 2026. */
export const SRC = {
  // Aggressive B-cell: first line
  flyer: D("10.1016/S0140-6736(19)33008-9"),
  calgb50303: D("10.1200/JCO.18.01994"),
  goya: D("10.1200/JCO.2017.73.3402"),
  remarc: D("10.1200/JCO.2017.72.6984"),
  polargo: D("10.1200/JCO-25-02849"),
  epcoritamabJco: D("10.1200/JCO.22.01725"),
  // CNS involvement and prophylaxis
  cnsIpi: D("10.1200/JCO.2015.65.6520"),
  cnsProphylaxis: D("10.1182/blood.2021012888"),
  ielsg32: D("10.1016/S2352-3026(16)00036-3"),
  ielsg32Long: D("10.1038/s41375-022-01582-5"),
  hovon105: D("10.1016/S1470-2045(18)30747-2"),
  // Burkitt
  burkittEpochR: D("10.1200/JCO.20.00303"),
  // Indolent B-cell
  prima2011: D("10.1016/S0140-6736(10)62175-7"),
  prima2019: D("10.1200/JCO.19.01073"),
  ardeshnaWatchWait: D("10.1016/S1470-2045(14)70027-0"),
  casuloPod24: D("10.1200/JCO.2014.59.7534"),
  trog9903: D("10.1200/JCO.2018.77.9892"),
  relevanceNejm: D("10.1056/NEJMoa1805104"),
  elara: D("10.1038/s41591-021-01622-0"),
  mosunetuzumabFl: D("10.1016/S1470-2045(22)00335-7"),
  elm2Follicular: D("10.1016/j.annonc.2024.08.2239"),
  ielsg19: D("10.1200/JCO.2016.70.6994"),
  stilNhl1: D("10.1016/S0140-6736(12)61763-2"),
  // Mantle cell
  shine: D("10.1056/NEJMoa2201817"),
  enrich: D("10.1016/S0140-6736(25)01432-1"),
  lyma: D("10.1056/NEJMoa1701769"),
  // Hodgkin
  hd16: D("10.1200/JCO.19.00964"),
  eortcH10: D("10.1200/JCO.2016.68.6394"),
  hd18: D("10.1016/S0140-6736(17)32134-7"),
  ahl2011: D("10.1016/S1470-2045(18)30784-8"),
  s1826Older: D("10.1200/JCO-25-00204"),
  nlphlBr: D("10.1111/ejh.14443"),
  // T-cell
  smile: D("10.1200/JCO.2011.35.6287"),
  jcog9801: D("10.1200/JCO.2007.11.9958"),
  mogamulizumabAtll: D("10.1111/cas.13343"),
  mfStagingValidation: D("10.1200/JCO.2009.27.7665"),
  // Supportive care
  astctGrading: D("10.1016/j.bbmt.2018.12.758"),
  bshTls: D("10.1111/bjh.13403"),
  entecavirRchop: D("10.1001/jama.2014.15704"),
  // Guideline hubs (landing pages, not appraisals; a specific NICE number is written out in full where it is used)
  nciPdqNhl: "https://www.cancer.gov/types/lymphoma/hp/adult-nhl-treatment-pdq",
  nciPdqHodgkin: "https://www.cancer.gov/types/lymphoma/hp/adult-hodgkin-treatment-pdq",
  nciPdqMf: "https://www.cancer.gov/types/lymphoma/hp/mycosis-fungoides-treatment-pdq",
  nciPdqCns: "https://www.cancer.gov/types/lymphoma/hp/primary-cns-lymphoma-treatment-pdq",
  nciPdqChildNhl: "https://www.cancer.gov/types/lymphoma/hp/child-nhl-treatment-pdq",
  nciPdqChildHodgkin: "https://www.cancer.gov/types/lymphoma/hp/child-hodgkin-treatment-pdq",
  esmoHaem: "https://www.esmo.org/guidelines/esmo-clinical-practice-guidelines-haematological-malignancies",
  bshGuidelines: "https://b-s-h.org.uk/guidelines/",
  nccnGuidelines: "https://www.nccn.org/guidelines/category_1",
};

/** Cancer record ids this spike patches. Every one exists in the corpus today; facet A owns any new cancer record. */
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
} as const;

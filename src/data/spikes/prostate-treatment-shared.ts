import type { DrugInput, TermInput, TrialInput } from "@/lib/schema";

/**
 * Constants shared by the prostate treatment files (./prostate-treatment.ts and ./prostate-treatment-trials*.ts).
 * Not a spike: registered in NON_SPIKE_FILES in scripts/spike-sources.ts.
 *
 * Every publication below was read through Europe PMC on 25 September 2026 and is quoted from its own abstract or
 * results text, not from memory. Every NICE reference number was opened on nice.org.uk and its recommendation chapter
 * read; the surprises that produced are recorded where they occur and are worth stating here, because three of them
 * contradict what the drug's label would suggest:
 *
 *   - NICE TA930 does not recommend lutetium-177 vipivotide tetraxetan (Pluvicto) for PSMA-positive
 *     hormone-relapsed metastatic prostate cancer after taxane chemotherapy and an anti-androgen.
 *   - NICE TA580 does not recommend enzalutamide for high-risk hormone-relapsed non-metastatic prostate cancer,
 *     although apalutamide (TA740) and darolutamide (TA660) are recommended in the same setting.
 *   - NICE TA546 does not recommend padeliporfin vascular-targeted photodynamic therapy for untreated low-risk
 *     localised disease, and NICE TA332 (sipuleucel-T) has been withdrawn because the marketing authorisation was.
 *   - NICE TA1032 (niraparib with abiraterone) is a terminated appraisal: the company made no evidence submission,
 *     so NICE could make no recommendation at all.
 */
export const asOf = "2026-09-25";
export const PROSTATE = "prostate";
export const MHSPC = "prostate-mhspc";
export const MCRPC = "prostate-mcrpc";
export const NMCRPC = "prostate-nmcrpc";
export const BCR = "prostate-bcr";
export const LOW_RISK = "prostate-low-risk";
export const INT_RISK = "prostate-intermediate-risk";
export const HIGH_RISK = "prostate-high-risk";

export const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });
export const isrctn = (id: string) => ({ label: `ISRCTN registry ${id}`, url: `https://www.isrctn.com/${id}` });
export const doi = (label: string, id: string) => ({ label, url: `https://doi.org/${id}` });
export const nice = (ref: string, label: string) => ({ label: `NICE ${ref.toUpperCase()}: ${label}`, url: `https://www.nice.org.uk/guidance/${ref}` });
/** Terminated appraisals live under /guidance/terminated/; /guidance/<ref> redirects there, so the address is written out. */
export const niceTerminated = (ref: string, label: string) => ({ label: `NICE ${ref.toUpperCase()}: ${label}`, url: `https://www.nice.org.uk/guidance/terminated/${ref}` });
export const D = (id: string) => `https://doi.org/${id}`;

export const t = (x: Omit<TrialInput, "kind" | "asOf">): TrialInput => ({ kind: "trial", asOf, ...x });
export const d = (x: Omit<DrugInput, "kind" | "asOf">): DrugInput => ({ kind: "drug", asOf, ...x });
export const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });

/** Papers quoted more than once, as DOIs read through Europe PMC on 25 September 2026. */
export const SRC = {
  // Localised disease: monitoring, surgery, radiotherapy
  protect15: D("10.1056/NEJMoa2214122"), protect10: D("10.1056/NEJMoa1606220"), protectPro: D("10.1056/NEJMoa1606221"),
  spcg4: D("10.1056/NEJMoa1807801"), pivot: D("10.1056/NEJMoa1615869"),
  // Screening, the trials the whole diagnostic pathway rests on
  erspc2009: D("10.1056/NEJMoa0810084"), erspc16: D("10.1016/j.eururo.2019.02.009"), plco2009: D("10.1056/NEJMoa0810696"),
  // Fractionation and technique
  chhip: D("10.1016/S1470-2045(16)30102-4"), hypoRtPc: D("10.1016/S0140-6736(19)31131-6"),
  hypoRtPcQol: D("10.1016/S1470-2045(20)30581-7"), rtog0415: D("10.1200/JCO.2016.67.0448"),
  profit: D("10.1200/JCO.2016.71.7397"), paceB: D("10.1056/NEJMoa2403365"), paceBPro: D("10.1016/j.eururo.2026.05.034"),
  ascendeRt: D("10.1016/j.ijrobp.2016.11.026"), partiqolBaseline: D("10.1016/j.ijrobp.2024.09.043"),
  padeliporfin: D("10.1016/S1470-2045(16)30661-1"),
  // Radiotherapy with androgen deprivation, and its duration
  eortc22863: D("10.1016/S1470-2045(10)70223-0"), eortc22961: D("10.1056/NEJMoa0810095"),
  eortc22991: D("10.1200/JCO.2015.64.8055"), rtog9202: D("10.1200/JCO.2007.14.9021"), rtog9408: D("10.1056/NEJMoa1012348"),
  rtog0521: D("10.1200/JCO.18.02158"), dart0105: D("10.1016/S1470-2045(15)70045-8"), spcg7: D("10.1016/S0140-6736(08)61815-2"),
  pr3pr07: D("10.1200/JCO.2014.57.7510"),
  // After prostatectomy: adjuvant and salvage radiotherapy
  radicalsRt: D("10.1016/S0140-6736(20)31553-1"), raves: D("10.1016/S1470-2045(20)30456-3"),
  getug17: D("10.1016/S1470-2045(20)30454-X"), artistic: D("10.1016/S0140-6736(20)31952-8"),
  radicalsHd: D("10.1016/S0140-6736(24)00549-X"), swog8794: D("10.1016/j.juro.2008.11.032"),
  eortc22911: D("10.1016/S0140-6736(12)61253-7"), getug16: D("10.1016/S1470-2045(19)30486-3"),
  spport: D("10.1016/S0140-6736(21)01790-6"),
  // Hormone-sensitive metastatic disease
  chaarted: D("10.1056/NEJMoa1503747"), getug15: D("10.1016/S1470-2045(12)70560-0"),
  stampedeAbi: D("10.1056/NEJMoa1702900"), stampedeRt: D("10.1016/S0140-6736(18)32486-3"),
  stampedeM0: D("10.1016/S0140-6736(21)02437-5"), stampedeMetformin: D("10.1016/S1470-2045(25)00231-1"),
  titan: D("10.1056/NEJMoa1903307"), swog9346: D("10.1056/NEJMoa1212299"),
  patchCv: D("10.1016/S0140-6736(21)00100-8"), hero: D("10.1056/NEJMoa2004325"),
  stomp: D("10.1200/JCO.2017.75.4853"), oriole: D("10.1001/jamaoncol.2020.0147"),
  // Non-metastatic castration-resistant disease
  spartan: D("10.1056/NEJMoa1715546"),
  // Castration-resistant metastatic disease
  tax327: D("10.1056/NEJMoa040720"), swog9916: D("10.1056/NEJMoa041318"), tropic: D("10.1016/S0140-6736(10)61389-X"),
  proselica: D("10.1200/JCO.2016.72.1076"), firstana: D("10.1200/JCO.2016.72.1068"), card: D("10.1056/NEJMoa1911206"),
  couAa301: D("10.1056/NEJMoa1014618"), couAa302: D("10.1056/NEJMoa1209096"), affirm: D("10.1056/NEJMoa1207506"),
  prevail: D("10.1056/NEJMoa1405095"), impact: D("10.1056/NEJMoa1001294"), triton3: D("10.1056/NEJMoa2214676"),
  peace3: D("10.1016/j.annonc.2026.02.009"),
  // Failed and stopped programmes
  era223: D("10.1016/S1470-2045(18)30860-X"), imbassador250: D("10.1038/s41591-021-01600-6"),
  keynote921: D("10.1200/JCO-24-01283"), keynote641: D("10.1016/j.annonc.2025.05.007"), keynote991: D("10.1016/j.annonc.2025.05.008"),
  armor3sv: D("10.1016/j.eururo.2019.08.034"), synergy: D("10.1016/S1470-2045(17)30168-7"), affinity: D("10.1016/S1470-2045(17)30605-8"),
  elmPc4: D("10.1016/S1470-2045(15)70027-6"), tasquinimod: D("10.1200/JCO.2016.66.9697"), comet1: D("10.1200/JCO.2015.65.5597"),
  swogS0421: D("10.1016/S1470-2045(13)70294-8"), enthuseM1: D("10.1002/cncr.27674"), prostvac: D("10.1200/JCO.18.02031"),
  ca184043: D("10.1016/S1470-2045(14)70189-5"), ready: D("10.1016/S1470-2045(13)70479-0"), calgb90401: D("10.1200/JCO.2011.39.4767"),
  // Guidelines and regulators
  ng131: "https://www.nice.org.uk/guidance/ng131",
  eauProstate: "https://uroweb.org/guidelines/prostate-cancer",
  nccnProstate: "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459",
  fdaNotices: "https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancerhematologic-malignancies-approval-notifications",
};

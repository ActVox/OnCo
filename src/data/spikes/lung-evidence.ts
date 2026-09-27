import type { EntityInput, PaperInput, RoadmapInput } from "@/lib/schema";
import type { Spike } from "./index";
import { LUNG } from "./lung-evidence-shared";
import { lungNeverSmokerPapers, lungScreeningPapers, lungSmokingPapers } from "./lung-evidence-papers-epidemiology";
import { lungChemotherapyPapers, lungDriverPapers, lungEgfrPapers, lungResistancePapers } from "./lung-evidence-papers-treatment";
import { lungImmunotherapyPapers, lungPerioperativePapers, lungSmallCellPapers, lungStageThreePapers } from "./lung-evidence-papers-immunotherapy";
import { LUNG_IDEAS, lungIdeas, lungRoadmap } from "./lung-evidence-roadmap";

/**
 * LUNG CANCER: EVIDENCE, HISTORY, ROADMAP AND IDEAS (the evidence file of the September 2026 deep dive).
 *
 * Every paper record carries verbatim metadata from the Europe PMC record read on 2026-09-25 (title, authors, journal,
 * year, DOI, PMID); summaries paraphrase the indexed abstract and findings quote only its figures. Where Europe PMC
 * indexes no abstract (Wynder and Graham 1950, Doll and Hill 1954) the record says so and carries no numbers, and
 * where Europe PMC truncates an abstract at a P value the figure after it is not quoted (FLAURA2). Registry dates in
 * the roadmap's watch list are quoted from ClinicalTrials.gov v2 records read the same day. UK and NHS specifics
 * (Targeted Lung Health Check coverage, NICE positions, molecular testing turnaround, capacity, audit indicators)
 * belong to the UK file of the deep dive and are named here only as placeholders.
 *
 * The cancer this file patches is the `lung-cancer` record (../cancer-parents-wave2.ts), the parent page covering both
 * histologies. If the record is renamed, change LUNG in ./lung-evidence-shared.ts and nothing else. Papers that belong
 * to one histology link `nsclc` or `sclc` as well.
 *
 * Lung cancer is the largest evidence base on the site, so this file prioritises the papers that changed practice over
 * completeness. Papers the corpus already held are linked by id, not repeated: Doll and Hill 1950, the fifty-year
 * British Doctors report, NLST and NELSON, Topalian 2012, KEYNOTE-001, 010, 024, 042, 189 and 407, CheckMate 017, 057,
 * 227 and 816, PACIFIC 2017 and its 2018 update, KEYNOTE-671, FLAURA and its overall survival report, AURA3, ADAURA,
 * PROFILE 1007, crizotinib and entrectinib in ROS1, LIBRETTO-001 and 431, the MET exon 14 landscape paper, dabrafenib
 * and trametinib in BRAF, DESTINY-Lung01 and 02, Beamion Lung 1, CodeBreaK 100, Ostrem's KRAS G12C chemistry,
 * IMpower133, Slotman's prophylactic cranial irradiation trial, the DLL3 expression paper and DeLLphi-304. Trial
 * records belong to the trials file of the deep dive and glossary terms to the terms file; the ids that did not yet
 * exist are listed in PENDING_TRIALS and PENDING_TERMS (./lung-evidence-shared.ts) and named in text only.
 */

export const lungEvidencePapers: PaperInput[] = [
  ...lungSmokingPapers, ...lungNeverSmokerPapers, ...lungScreeningPapers,
  ...lungChemotherapyPapers, ...lungEgfrPapers, ...lungDriverPapers, ...lungResistancePapers,
  ...lungImmunotherapyPapers, ...lungPerioperativePapers, ...lungStageThreePapers, ...lungSmallCellPapers,
];
const ROADMAP: RoadmapInput["id"] = lungRoadmap.id;

/** Records owned by other files that bear on lung cancer without linking to this roadmap (backlinks found in the 25 Sept 2026 reading). */
const backlinkSupplements: Spike["supplements"] = [
  // The cross-cancer routes this roadmap joins.
  { id: "early-detection-roadmap", cancers: [LUNG], related: [ROADMAP] } satisfies { id: string } & Partial<RoadmapInput>,
  { id: "prevention-roadmap", cancers: [LUNG], related: [ROADMAP] } satisfies { id: string } & Partial<RoadmapInput>,
  { id: "targeted-therapy-roadmap", related: [ROADMAP] } satisfies { id: string } & Partial<RoadmapInput>,
  { id: "immunotherapy-roadmap", related: [ROADMAP] } satisfies { id: string } & Partial<RoadmapInput>,
  { id: "kras-roadmap", related: [ROADMAP] } satisfies { id: string } & Partial<RoadmapInput>,
  { id: "ctdna-tests", related: [ROADMAP, LUNG_IDEAS.resistance] } satisfies { id: string } & Partial<RoadmapInput>,
  // Existing full records the deep dive read: the cancer link where it was missing, and the roadmap neighbour.
  { id: "paper-doll-hill-smoking-lung-cancer-bmj-1950", cancers: [LUNG], related: [ROADMAP, "paper-wynder-graham-tobacco-bronchiogenic-carcinoma-jama-1950"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-doll-peto-50-year-doctors-bmj-2004", cancers: [LUNG], related: [ROADMAP, "paper-peto-smoking-cessation-lung-cancer-uk-bmj-2000"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-nlst-nejm-2011", cancers: [LUNG], related: [ROADMAP, "paper-plco-chest-radiograph-lung-cancer-mortality-jama-2011", "paper-uspstf-lung-cancer-screening-jama-2021", LUNG_IDEAS.eligibility] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-nelson-nejm-2020", cancers: [LUNG], related: [ROADMAP, "paper-uspstf-lung-cancer-screening-jama-2021", LUNG_IDEAS.eligibility] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-topalian-anti-pd1-nejm-2012", cancers: [LUNG], related: [ROADMAP, "paper-herbst-impower110-atezolizumab-pd-l1-nejm-2020"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-keynote-024-nejm-2016", cancers: [LUNG], related: [ROADMAP, "paper-herbst-impower110-atezolizumab-pd-l1-nejm-2020"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-pacific-nejm-2017", cancers: [LUNG], related: [ROADMAP, "paper-spigel-pacific-five-year-survival-jco-2022", "paper-lu-laura-osimertinib-stage-iii-nejm-2024"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-checkmate-816-nejm-2022", cancers: [LUNG], related: [ROADMAP, "paper-heymach-aegean-perioperative-durvalumab-nejm-2023"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-keynote-671-n-engl-j-med-2023", cancers: [LUNG], related: [ROADMAP, "paper-heymach-aegean-perioperative-durvalumab-nejm-2023", "paper-felip-impower010-adjuvant-atezolizumab-lancet-2021"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-adaura-nejm-2020", cancers: [LUNG], related: [ROADMAP, "paper-wu-alina-adjuvant-alectinib-nejm-2024", "paper-lace-adjuvant-cisplatin-pooled-analysis-jco-2008"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-flaura-nejm-2018", cancers: [LUNG], related: [ROADMAP, "paper-planchard-flaura2-osimertinib-chemotherapy-nejm-2023", "paper-mariposa-nejm-2024"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-osimertinib-nsclc-n-engl-j-med-2017", cancers: [LUNG], related: [ROADMAP, "paper-kobayashi-egfr-t790m-gefitinib-resistance-nejm-2005"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-egfr-nsclc-n-engl-j-med-2010", cancers: [LUNG], related: [ROADMAP, "paper-mok-ipass-gefitinib-pulmonary-adenocarcinoma-nejm-2009"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-egfr-nsclc-lancet-oncol-2012", cancers: [LUNG], related: [ROADMAP, "paper-mok-ipass-gefitinib-pulmonary-adenocarcinoma-nejm-2009"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-alk-nsclc-n-engl-j-med-2013", cancers: [LUNG], related: [ROADMAP, "paper-kwak-crizotinib-alk-nsclc-nejm-2010", "paper-soda-eml4-alk-fusion-nature-2007"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-kras-nsclc-n-engl-j-med-2021", cancers: [LUNG], related: [ROADMAP, "paper-codebreak-200-lancet-2023"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-impower133-n-engl-j-med-2018", cancers: [LUNG], related: [ROADMAP, "paper-paz-ares-caspian-durvalumab-es-sclc-lancet-2019"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-tarlatamab-sclc-n-engl-j-med-2025", cancers: [LUNG], related: [ROADMAP, "paper-dellphi-301-nejm-2023"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-dll3-sclc-clin-cancer-res-2019", cancers: [LUNG], related: [ROADMAP, "paper-george-sclc-genomic-profiles-nature-2015", "paper-rudin-sclc-molecular-subtypes-nat-rev-cancer-2019"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-slotman-n-engl-j-med", cancers: [LUNG], related: [ROADMAP, "paper-auperin-prophylactic-cranial-irradiation-sclc-nejm-1999"] } satisfies { id: string } & Partial<PaperInput>,
  // The existing lung ideas are the neighbours of the new ones rather than duplicates of them.
  { id: "idea-prev-lung-screening-risk-model-eligibility", related: [ROADMAP, LUNG_IDEAS.eligibility] } satisfies { id: string } & Partial<PaperInput>,
  { id: "idea-prev-mobile-lung-screening-deprived-areas", related: [ROADMAP, LUNG_IDEAS.deprivation] } satisfies { id: string } & Partial<PaperInput>,
  { id: "idea-prev-clean-air-never-smoker-endpoints", related: [ROADMAP, LUNG_IDEAS.neverSmoker] } satisfies { id: string } & Partial<PaperInput>,
  { id: "idea-sclc-subtype-directed", related: [ROADMAP, LUNG_IDEAS.smallCell] } satisfies { id: string } & Partial<PaperInput>,
  { id: "idea-bio2-brain-met-prevention-trials", related: [ROADMAP, LUNG_IDEAS.brain] } satisfies { id: string } & Partial<PaperInput>,
];

// ======================= SPIKE =======================
const spike: Spike = {
  cancerId: LUNG,
  entities: [...lungEvidencePapers, lungRoadmap, ...lungIdeas] as EntityInput[],
  supplements: backlinkSupplements,
  patch: {
    // History entries are dated from the indexed papers linked in the roadmap. The 1950, 2004, 2011, 2015 and 2024
    // entries in ../cancer-parents-wave2.ts stand; these add the prospective epidemiology, the cytotoxic plateau, the
    // negative screening trial, the driver discoveries, the perioperative move, and the small-cell threads.
    history: [
      { year: 1954, title: "Doll and Hill follow British doctors forward", note: "The 1950 case-control studies were called artefacts, so a cohort was assembled before anybody was ill and followed to death. Wynder and Graham's 684 proven cases had appeared in JAMA four months before Doll and Hill's BMJ paper.", refs: ["paper-doll-hill-mortality-of-doctors-smoking-bmj-1954", "paper-wynder-graham-tobacco-bronchiogenic-carcinoma-jama-1950", "paper-doll-peto-50-year-doctors-bmj-2004"] },
      { year: 1995, title: "Chemotherapy is shown to help, a little", note: "9,387 patients from 52 randomised trials: a 27 percent reduction in the risk of death when chemotherapy was added to supportive care, and 5 percent absolute benefit at five years after surgery.", refs: ["paper-nsclc-collaborative-group-chemotherapy-meta-analysis-bmj-1995"] },
      { year: 1996, title: "A prevention trial finds harm", note: "CARET gave beta carotene and retinol to 18,314 smokers and asbestos workers and was stopped 21 months early: relative risk of lung cancer 1.28 and of lung cancer death 1.46.", refs: ["paper-caret-beta-carotene-retinol-lung-cancer-nejm-1996"] },
      { year: 1999, title: "Small-cell lung cancer gets its two advances", note: "Twice-daily thoracic radiotherapy raised five-year survival from 16 to 26 percent in limited-stage disease, and the prophylactic cranial irradiation overview of 987 patients showed treating a brain with no visible disease raises three-year survival from 15.3 to 20.7 percent.", refs: ["paper-turrisi-twice-daily-thoracic-radiotherapy-limited-sclc-nejm-1999", "paper-auperin-prophylactic-cranial-irradiation-sclc-nejm-1999"] },
      { year: 2002, title: "E1594: four chemotherapy regimens, one result", note: "1,207 patients, a 19 percent response rate and a median survival of 7.9 months whichever platinum doublet was used. That was as far as undirected cytotoxic treatment could go, and it is the baseline every entry after it is measured against.", refs: ["paper-schiller-ecog-1594-four-chemotherapy-regimens-nejm-2002"] },
      { year: 2006, title: "Median survival passes twelve months", note: "ECOG 4599 added bevacizumab to chemotherapy in 878 patients with non-squamous disease: 12.3 against 10.3 months, with a risk of increased treatment-related deaths.", refs: ["paper-sandler-ecog-4599-bevacizumab-nsclc-nejm-2006"] },
      { year: 2007, title: "EML4-ALK: the second driver", note: "A small inversion on chromosome 2p, found in 5 of 75 tumours, transformed fibroblasts. Crizotinib, built as a MET inhibitor, gave a 57 percent response rate in 2010 after 1,500 patients were screened to find 82.", refs: ["paper-soda-eml4-alk-fusion-nature-2007", "paper-kwak-crizotinib-alk-nsclc-nejm-2010"] },
      { year: 2008, title: "Histology chooses the drug, and the adjuvant rule is fixed", note: "Pemetrexed beat gemcitabine in adenocarcinoma (12.6 against 10.9 months) and lost in squamous disease (9.4 against 10.8); LACE pooled 4,584 resected patients for a 5.4 percent five-year gain concentrated in stage II and III.", refs: ["paper-scagliotti-cisplatin-pemetrexed-histology-jco-2008", "paper-lace-adjuvant-cisplatin-pooled-analysis-jco-2008"] },
      { year: 2009, title: "IPASS: the biomarker, not the population", note: "1,217 East Asian never-smokers and light former smokers randomised between gefitinib and chemotherapy; the benefit lived entirely in the EGFR-mutant subgroup, and EGFR testing became standard.", refs: ["paper-mok-ipass-gefitinib-pulmonary-adenocarcinoma-nejm-2009", "paper-lynch-egfr-activating-mutations-gefitinib-nejm-2004", "paper-paez-egfr-mutations-gefitinib-science-2004"] },
      { year: 2011, title: "Chest radiography is shown to do nothing", note: "PLCO randomised 154,901 people to four annual chest X-rays or usual care: 1,213 lung cancer deaths against 1,230 after 13 years. It is why low-dose computed tomography had to be proved separately.", refs: ["paper-plco-chest-radiograph-lung-cancer-mortality-jama-2011", "paper-nlst-nejm-2011"] },
      { year: 2017, title: "Stage III moves, and so does the way tumours are read", note: "PACIFIC put durvalumab after chemoradiotherapy, reaching 42.9 percent five-year survival against 33.4; ALEX moved first-line ALK treatment to a brain-penetrant drug; TRACERx showed copy-number heterogeneity carries a hazard ratio of 4.9 for recurrence or death.", refs: ["paper-spigel-pacific-five-year-survival-jco-2022", "paper-peters-alex-alectinib-crizotinib-nejm-2017", "paper-tracerx-100-nejm-2017", "paper-abbosh-phylogenetic-ctdna-lung-cancer-nature-2017"] },
      { year: 2021, title: "Screening widens, and adjuvant immunotherapy arrives", note: "The United States task force lowered eligibility to age 50 and 20 pack-years, two years after Aldrich showed 31 percent of white smokers qualified against 17 percent of Black smokers; IMpower010 showed adjuvant atezolizumab delays recurrence, mainly in PD-L1-positive stage II to IIIA disease.", refs: ["paper-uspstf-lung-cancer-screening-jama-2021", "paper-aldrich-uspstf-screening-african-american-smokers-jama-oncol-2019", "paper-felip-impower010-adjuvant-atezolizumab-lancet-2021"] },
      { year: 2023, title: "Air pollution gets a mechanism, and first-line treatment is intensified", note: "PM2.5 was shown to promote rather than initiate EGFR-driven lung cancer, with oncogenic EGFR mutations in 18 percent of histologically normal lungs; FLAURA2 and AEGEAN reported, and tarlatamab gave a 40 percent response rate in twice-treated small-cell disease.", refs: ["paper-hill-lung-adenocarcinoma-air-pollutants-nature-2023", "paper-planchard-flaura2-osimertinib-chemotherapy-nejm-2023", "paper-heymach-aegean-perioperative-durvalumab-nejm-2023", "paper-dellphi-301-nejm-2023"] },
      { year: 2024, title: "Genotype reaches the operating theatre and stage III", note: "ALINA gave adjuvant alectinib after resection of ALK-positive disease (93.8 against 63.0 percent disease-free at two years), LAURA gave osimertinib after chemoradiotherapy in EGFR-mutant stage III (39.1 against 5.6 months), MARIPOSA beat osimertinib in first line, and ADRIATIC lifted limited-stage small-cell survival from 33.4 to 55.9 months.", refs: ["paper-wu-alina-adjuvant-alectinib-nejm-2024", "paper-lu-laura-osimertinib-stage-iii-nejm-2024", "paper-mariposa-nejm-2024", "paper-adriatic-nejm-2024"] },
      { year: 2032, title: "The perioperative and first-line trials complete", note: "ADRIATIC's study completion is listed for 23 October 2026, IMpower010 for 31 August 2027, FLAURA2 for 30 September 2027, LAURA for 29 October 2027, MARIPOSA for 16 February 2028, DeLLphi-304 for 26 March 2028, AEGEAN for 11 September 2028, CROWN for 31 December 2028 and ALINA for 19 November 2031; TRACERx runs to November 2035.", refs: [ROADMAP, "alina", "crown", "mariposa"] },
    ],
    pipeline: [...lungIdeas.map((i) => i.id)],
    openProblems: [
      // The never-smoker half of this problem is the core layer's own open problem, with its cohorts (15 percent of UK
      // cases, 15 to 25 percent worldwide); it is not restated here, and the unsourced "one in five" it used to carry
      // disagreed with those figures.
      "Screening eligibility is written in pack-years, which excludes high-risk groups systematically: 31 percent of white smokers qualified against 17 percent of Black smokers in one United States cohort (Aldrich 2019), so a rule built to find the highest risk misses hardest where the risk is highest.",
      "Resistance arrives within one to three years for every targeted drug and is a heterogeneous set of diagnoses, including transformation into small-cell lung cancer in about one in seven, yet most patients move to the next line without a re-biopsy or a plasma profile to say what the tumour became.",
      "Four perioperative immunotherapy schedules (before surgery, after surgery, on both sides, and with chemotherapy) are all standard somewhere and none has been compared with another, so nobody knows which one to choose or whether the adjuvant half adds anything.",
      "Brain metastases are the dominant failure pattern in driver-positive disease and the newest inhibitors appear to prevent them, but prevention is measured as a secondary endpoint on inconsistent imaging schedules, so the size of the effect is unknown.",
      "Extensive-stage small-cell lung cancer gained two to three months of median survival from immunotherapy and still has no predictive biomarker; the four transcription-factor subtypes that might supply one have never been used prospectively to assign treatment.",
      "At the same stage and in systems free at the point of use, patients in more deprived circumstances are less likely to receive any lung cancer treatment (odds ratio 0.79), less likely to have surgery and less likely to have chemotherapy.",
    ],
    terms: ["pdl1", "tps", "tmb", "driver-mutation", "oncogene-addiction", "resistance", "ctdna", "mrd", "brain-metastases", "prophylactic-cranial-irradiation", "chemoradiation", "neoadjuvant-adjuvant", "histology", "performance-status", "clonal-evolution", "overdiagnosis", "oligometastatic", "screening"],
    technologies: ["low-dose-ct-screening", "pet", "radiotherapy", "sbrt", "imrt-igrt", "liquid-biopsy", "ngs", "wes-wgs", "ihc", "fish", "bronchoscopy", "checkpoint-inhibitor", "kinase-inhibitors", "t-cell-engager", "adc", "stereotactic-radiosurgery"],
    drugs: ["osimertinib", "amivantamab", "lazertinib", "gefitinib", "erlotinib", "afatinib", "crizotinib", "alectinib", "lorlatinib", "brigatinib", "entrectinib", "selpercatinib", "capmatinib", "tepotinib", "sotorasib", "adagrasib", "dabrafenib", "trametinib", "trastuzumab-deruxtecan", "pembrolizumab", "nivolumab", "atezolizumab", "durvalumab", "cemiplimab", "tarlatamab", "bevacizumab", "ivonescimab", "zongertinib", "datopotamab-deruxtecan", "tremelimumab", "ceritinib", "pralsetinib", "vinorelbine", "gemcitabine", "paclitaxel", "pemetrexed", "cisplatin", "carboplatin", "etoposide", "docetaxel", "topotecan", "lurbinectedin"],
    targets: ["egfr", "alk", "ros1", "ret", "met", "kras", "braf", "her2", "ntrk", "dll3", "tp53", "rb1", "pd1"],
    trials: ["nlst-nelson", "pacific", "flaura2", "mariposa", "laura", "alina", "alex", "crown", "adriatic", "caspian", "impower133", "dellphi-304", "codebreak-200", "geometry-mono-1", "lung-map"],
    bottlenecks: ["b-early-detection", "b-prevention-adoption", "b-resistance", "b-immunotherapy-response", "b-brain-delivery", "b-tumor-heterogeneity", "b-rare-cancers", "b-global-access", "b-biomarker-validation", "b-care-fragmentation", "b-toxicity-qol", "b-trial-diversity"],
    related: [ROADMAP, ...Object.values(LUNG_IDEAS)],
  },
};

export default spike;

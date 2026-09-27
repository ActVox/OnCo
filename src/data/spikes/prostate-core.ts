import type { CancerInput, TermInput } from "@/lib/schema";
import type { Spike, SpikeSupplement } from "./index";

/**
 * PROSTATE CANCER: the core layer of the deep dive (25 September 2026), written to the standard of the gallbladder,
 * triple-negative, pancreatic, colorectal and lung files. Prostate cancer is the fourth commonest cancer in the world
 * and the commonest cancer in men in the UK: 1,546,112 new cases and 419,849 deaths a year (GLOBOCAN 2024), 57,898 UK
 * cases and 12,300 UK deaths a year (Cancer Research UK). This file owns the **taxonomy** of the prostate family, and
 * the what-it-is, grading, staging and risk-band layer of the family page. It does not touch trials and drugs, the NHS
 * pathway, molecular biology, papers or decisions, which the other five layers own.
 *
 * ===================================================================================================================
 * THE TAXONOMY OF THE PROSTATE FAMILY (decided here, recorded in docs/CANCER-PAGES.md)
 * ===================================================================================================================
 * The rule (docs/CANCER-PAGES.md): a cancer record is a WHO or PDQ tumour entity and carries a `parent`; a treatment
 * setting is never a record; a molecular subgroup is an entity only when a classification names it. Prostate is the
 * family where the most classifications are in daily use at once, and unlike lung's four they do not even describe the
 * same axis. A man handed a pathology report in Britain in 2026 is holding **five** separate classifications:
 *
 *   HISTOLOGY   what the tumour is (WHO Classification of Tumours, 5th edition, 2022)
 *   GRADE       how abnormal it looks (Gleason score, and the ISUP/WHO grade groups that sit on top of it)
 *   STAGE       how far it has spread (UICC TNM, 8th edition in UK reports, 9th recommended from 1 January 2026)
 *   RISK BAND   what the three above add up to (the Cambridge Prognostic Groups in the UK, NCCN's six in the US)
 *   STATE       what the disease is doing now (hormone-sensitive or castration-resistant, metastatic or not)
 *
 * They are orthogonal. A man can be acinar adenocarcinoma, grade group 3, cT2b, Cambridge Prognostic Group 3,
 * hormone-sensitive, all at once, and each of the five will be quoted at him by a different professional. Only the
 * first is a tumour type, so only the first can generate cancer records. Five tiers, in this order:
 *
 *   1. ORGAN FAMILY PAGE.  `prostate` ("Prostate cancer") is the family page, and it is also the page for prostatic
 *      acinar adenocarcinoma, which is more than 95 percent of prostate cancer (RCPath G084, October 2024). No
 *      separate `prostate-acinar-adenocarcinoma` record is created, because it would be a near-duplicate of the family
 *      page for the 95 percent case; the name is carried in the family page's aliases and in a glossary term so that a
 *      reader who types it from a report lands on the right page. This is the opposite call from lung, where
 *      `lung-cancer` splits into `nsclc` and `sclc` before any histology, because in lung the split changes the first
 *      treatment decision and in prostate it does not: the first decision is made on grade, stage and PSA.
 *
 *   2. HISTOLOGY.  Two entities sit under the family page.
 *      `prostate-ductal-adenocarcinoma` is **created here**. The fifth edition considered folding ductal
 *      adenocarcinoma into acinar adenocarcinoma as a subtype and deliberately did not, keeping it a separate type
 *      because of its distinctive behaviour and metastatic pattern (Kench 2022). It makes less PSA, presents later,
 *      metastasises to places prostate cancer usually does not reach, and survives worse. It is the clearest case in
 *      the family of a histology that changes what should happen to a patient.
 *      `prostate-nepc` already exists and is **not** one of the four state records the brief warned about. Its subject,
 *      treatment-related neuroendocrine prostatic carcinoma, has its own section in the WHO fifth edition prostate
 *      chapter, defined as "tumours demonstrating complete neuroendocrine differentiation or partial neuroendocrine
 *      differentiation with adenocarcinoma following androgen deprivation therapy" (Kench 2022). It is a WHO entity
 *      and it stays, with its aliases widened here so that the WHO name reaches it.
 *      Everything else in the WHO prostate chapter is rare enough that a page would be thinner than the parent's
 *      section on it, so it stays a string and, where a reader meets the word on a report, a glossary term: adenoid
 *      cystic (basal cell) carcinoma (renamed in the fifth edition for its MYB::NFIB fusion), squamous cell and
 *      adenosquamous carcinoma, PIN-like carcinoma (moved in the fifth edition from a pattern of ductal carcinoma to a
 *      subtype of acinar adenocarcinoma, and graded Gleason 6 only), and the prostatic stromal tumours. Urothelial
 *      carcinoma of the prostatic urethra is covered in the urinary tract chapter of the same book, not the prostate
 *      one, so it is not a prostate cancer record here either.
 *
 *   3. GRADE IS NOT A TIER OF RECORDS, AND THE UK USES BOTH SCALES AT ONCE.  The question the brief asked, whether the
 *      corpus's grade language matches a UK report in 2026, has a precise answer: a UK report carries **both**. The
 *      Royal College of Pathologists dataset (G084, version 4, October 2024, the current standard, review due October
 *      2027) sets out the grade groups "to be used in tangent with the Gleason score", and its own proforma asks for
 *      the Gleason score and the grade group together. The corpus's `gleason-grade-group` term already says both, so
 *      it is correct and is supplemented here rather than replaced. What the corpus was missing is the two other core
 *      items the 2024 dataset added and which change management: the **percentage of Gleason pattern 4** in core
 *      biopsies, and the **presence of intraductal carcinoma or invasive cribriform carcinoma**. Both are written here
 *      as terms. Grade generates no cancer records: "Gleason 6 prostate cancer" is a grade, not a disease.
 *
 *   4. RISK BANDS ARE SETTINGS, AND BRITAIN AND AMERICA USE DIFFERENT ONES.  NICE NG131 recommendation 1.2.15 asks
 *      urological cancer MDTs to assign every newly diagnosed localised or locally advanced prostate cancer a category
 *      from its table 1, which is the five Cambridge Prognostic Groups, not the three-tier D'Amico model NG131 carried
 *      before the 2021 amendment and not NCCN's six American bands. The whole of NG131's treatment section is written
 *      in CPG numbers: active surveillance is offered in CPG 1, offered as a choice in CPG 2, considered in CPG 3 for
 *      people who decline radical treatment, and not offered in CPG 4 and 5 (1.3.8 to 1.3.12). A British reader is
 *      therefore told a number between 1 and 5 that the corpus did not hold. Under rule 2 a risk band is a setting and
 *      never a record, and the three localised records in `../prostate-subtypes.ts` (`prostate-low-risk`,
 *      `prostate-intermediate-risk`, `prostate-high-risk`) predate the rule, so they are kept for their URLs, **not
 *      added to**, and instead **mapped**: CPG 1 to the low-risk page, CPG 2 and 3 to the intermediate page, CPG 4 and
 *      5 to the high-risk page, through aliases and a note on each, so that a man told "CPG 3" can find his page. The
 *      Cambridge groups also gain a glossary term and a staging table (`prostate-cpg` in ../staging.ts) beside the
 *      NCCN one that was already there.
 *
 *   5. STAGE AND DISEASE STATE ARE SETTINGS.  `prostate-mhspc`, `prostate-nmcrpc`, `prostate-mcrpc` and
 *      `prostate-bcr` are disease states written before the rule. They are kept for their URLs and not added to; no
 *      new state record is created for any of the states the family names (high-volume, low-volume, de novo,
 *      oligometastatic, PSMA-low), and no molecular subset (BRCA-altered, PTEN-null, AR-V7 positive, MSI-high) becomes
 *      a record either. Their canonical home is the biomarker readouts and the glossary. The staging facts the four
 *      records hang off are written here instead:
 *        - UK pathology reports stage against **UICC TNM 8** (RCPath G084 names it and prints it as its appendix A).
 *        - The **9th edition** was published on 3 July 2025 and UICC recommends it take effect from 1 January 2026.
 *          For prostate, the T, N and M categories are **unchanged**; what changed is a clarification of the clinical
 *          stage grouping (and the statement that there is no pathological stage I), and a new instruction to record
 *          the imaging method as a suffix, cT2b(mr) for an MRI-derived T category and N1(PET) for a node found on
 *          PSMA PET. The reason given is that prostate is "probably the malignancy most affected by stage migration":
 *          TNM 8 set the cT category from the finger alone, and MRI and PSMA PET find more disease than a finger can,
 *          so a stage IV diagnosed on PSMA PET is not the stage IV of twenty years ago (Brierley 2026).
 *        - **NICE NG131 names no TNM edition at all.** Its CPG table uses bare T1 to T4 categories, which are the same
 *          in the 8th and 9th editions, so the guideline is not stranded by the change the way a guideline written
 *          against a revised T category would be. That is worth stating rather than leaving a reader to assume.
 *
 * WHAT ALREADY EXISTS AND IS LINKED RATHER THAN REWRITTEN. `./prostate.ts` owns the drugs, trials, targets, companies,
 * the treatment rows, the history and the pipeline, and its `summary` is carried over verbatim below (edit it there).
 * `../prostate-subtypes.ts` owns the seven risk and state pages. `../staging.ts` holds the NCCN risk table and the
 * grade group table. The glossary already holds `psa`, `gleason-grade-group`, `castration-resistance`,
 * `biochemical-recurrence`, `psa50`, `ar-v7`, `psa-kinetics`, `adt`, `arpi`, `mcrpc-mhspc`, `prostatectomy`,
 * `orchiectomy` and `active-surveillance-term`, and the technologies `active-surveillance`, `mp-mri`, `psma-pet` and
 * `androgen-deprivation`. Those are supplemented, not duplicated.
 *
 *   records patched      prostate (taxonomy, what it is, basics, staging, risk bands, outlook, FAQ),
 *                        prostate-low-risk / -intermediate-risk / -high-risk (CPG mapping),
 *                        prostate-bcr, prostate-mhspc, prostate-nmcrpc, prostate-mcrpc (vocabulary only),
 *                        prostate-nepc (WHO entity aliases and taxonomy note)
 *   records created      prostate-ductal-adenocarcinoma (WHO 2022 entity, parent prostate)
 *   terms                cambridge-prognostic-group, tnm-prostate-cancer, prostate-acinar-adenocarcinoma,
 *                        intraductal-carcinoma-prostate, cribriform-prostate-cancer, percentage-gleason-pattern-4,
 *                        psa-density, extraprostatic-extension, high-grade-pin, watchful-waiting
 *   supplements          gleason-grade-group, castration-resistance, mcrpc-mhspc, psa-kinetics,
 *                        active-surveillance-term, prostatectomy
 *
 * Every figure is quoted from the page or document named beside it: NICE NG131 read from its recommendations page, the
 * RCPath dataset read from the published PDF, the WHO fifth edition read through the open-access review by its own
 * editorial board (Kench 2022), the TNM 9th edition read through the UICC committee's own summary (Brierley 2026),
 * GLOBOCAN 2024, SEER, Cancer Research UK, the NHS prostate cancer pages, and the BJUI Compass meta-analysis of ductal
 * adenocarcinoma. Nothing is inferred and nothing is recalled.
 */
const asOf = "2026-09-25";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const doi = (label: string, d: string) => ({ label, url: `https://doi.org/${d}` });
const tags = ["gu"];

const SRC = {
  ng131: { label: "NICE NG131: prostate cancer, diagnosis and management (recommendations, including the Cambridge Prognostic Group table at 1.2.15)", url: "https://www.nice.org.uk/guidance/ng131/chapter/Recommendations" },
  rcpath: { label: "Royal College of Pathologists G084: dataset for histopathology reports for prostatic carcinoma, version 4, October 2024", url: "https://www.rcpath.org/static/8cc88604-2c8d-4df4-a99542df41c102af/G084-dataset-for-histopathology-reports-for-prostatic-carcinoma.pdf" },
  who2022: { label: "WHO Classification of Tumours, 5th edition: tumours of the prostate (IARC, 2022)", url: "https://tumourclassification.iarc.who.int/chapters/36" },
  kench2022: doi("Kench et al., Histopathology 2022: WHO Classification of Tumours fifth edition, evolving issues in the classification, diagnosis and prognostication of prostate cancer", "10.1111/his.14711"),
  netto2022: { label: "Netto et al., European Urology 2022: the 2022 WHO classification of tumours of the urinary system and male genital organs, part B (prostate and urinary tract)", url: "https://pubmed.ncbi.nlm.nih.gov/35965208/" },
  tnm9: doi("Brierley et al., International Journal of Cancer 2026: the 9th edition of the UICC TNM classification of malignant tumours, updates and rationale for change (prostate at section 10.1)", "10.1002/ijc.70561"),
  uicc9: { label: "UICC: the 9th edition of the TNM classification of malignant tumours, published 3 July 2025 and recommended to take effect from 1 January 2026", url: "https://www.uicc.org/news-and-updates/25-7-announcements/9th-edition-uicc-tnm-classification-malignant-tumours-now-available" },
  epstein2016: doi("Epstein et al., American Journal of Surgical Pathology 2016: the 2014 ISUP consensus conference on Gleason grading, and the grade group system", "10.1097/PAS.0000000000000530"),
  ductal2021: doi("Ranasinha et al., BJUI Compass 2021: ductal adenocarcinoma of the prostate, a systematic review and meta-analysis of incidence, presentation, prognosis and management", "10.1002/bco2.60"),
  globocan: { label: "GLOBOCAN prostate fact sheet (IARC Global Cancer Observatory, 2024 estimates)", url: "https://gco.iarc.who.int/media/globocan/factsheets/cancers/27-prostate-fact-sheet.pdf" },
  seer: { label: "SEER Cancer Stat Facts: prostate cancer (US incidence, stage distribution and survival by stage)", url: "https://seer.cancer.gov/statfacts/html/prost.html" },
  cruk: { label: "Cancer Research UK: prostate cancer statistics (UK incidence, mortality, survival, stage at diagnosis and route to diagnosis)", url: "https://www.cancerresearchuk.org/health-professional/cancer-statistics/statistics-by-cancer-type/prostate-cancer" },
  nhsSymptoms: { label: "NHS: symptoms of prostate cancer, and what happens at the GP appointment", url: "https://www.nhs.uk/conditions/prostate-cancer/symptoms/" },
  nccn: { label: "NCCN Guidelines: prostate cancer (the American risk groups)", url: "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1459" },
};

// ======================= NEW CANCER RECORD =======================
/**
 * Ductal adenocarcinoma is the one histological entity the corpus's prostate family was missing. The WHO fifth edition
 * considered reclassifying it as a subtype of acinar adenocarcinoma and kept it a separate type, "given its
 * distinctive clinical behaviour and metastatic pattern" (Kench 2022). It is parented to `prostate` because the family
 * page is the acinar adenocarcinoma page, and ductal disease is the exception to it.
 */
export const prostateCoreCancers: CancerInput[] = [
  { id: "prostate-ductal-adenocarcinoma", kind: "cancer", name: "Ductal adenocarcinoma of the prostate", group: "genitourinary", parent: "prostate", asOf, tags: [...tags, "subtype-page"], wikipedia: W("Prostate_cancer"),
    aka: ["Prostatic ductal adenocarcinoma", "Ductal adenocarcinoma", "Ductal prostate cancer", "Adenocarcinoma with ductal features", "Mixed acinar-ductal adenocarcinoma", "Endometrioid carcinoma of the prostate", "DAC"],
    related: ["prostate", "prostate-nepc", "prostate-high-risk", "prostate-mhspc"],
    tldr: "Ductal adenocarcinoma is a rare type of prostate cancer, roughly one case in six hundred, that grows from the larger ducts of the gland rather than from its small acini. It tends to make less PSA than ordinary prostate cancer, so it is found later and more often after it has spread, and it is treated as high-risk disease from the day it is named.",
    burden: "About 0.17 percent of prostate cancer: a systematic review of 114 studies covering 2,907,170 prostate cancers found 5,911 ductal cases, and meta-analysis of the 21 case series that counted both types consecutively gave 0.17 percent, with a range across series of 0.084 to 13.4 percent, the spread reflecting how differently the diagnosis is made rather than how differently the disease occurs. Pure ductal disease is rarer still: in 1,051 radical prostatectomy specimens from the Karolinska University Hospital, 2 (0.2 percent) were pure ductal and 84 (8 percent) mixed acinar-ductal (BJUI Compass 2021).",
    summary: [
      "What it is. Ductal adenocarcinoma of the prostate is a carcinoma of the larger, more central prostatic ducts. Under the microscope it is built of tall columnar cells with stratified nuclei arranged in papillary, cribriform, glandular or solid patterns, in contrast to the cuboidal cells in small round acini that make up ordinary, acinar prostate cancer. The fifth edition of the WHO Classification of Tumours reserves the term ductal adenocarcinoma for radical prostatectomy specimens with more than 50 percent ductal morphology, and asks for the phrase 'adenocarcinoma with ductal features' on a needle biopsy whether the biopsy is pure ductal or mixed, because a needle sees too little of the gland to know the proportion.",
      "How it differs from its parent. The fifth edition considered making ductal adenocarcinoma a subtype of acinar adenocarcinoma and decided against it, keeping it a separate type because of how differently it behaves (Kench 2022). It makes less PSA for the same amount of cancer: in a series of 371 ductal cases, ductal histology was associated with a 30 percent lower geometric mean PSA and more than twice the chance of a PSA under 4 ng/mL, independent of everything else. It presents more locally advanced (22.2 percent T3 against 8.9 percent for acinar on meta-analysis, relative risk 1.71 for T3 and 7.56 for T4) and with a 4.62 times higher relative risk of metastatic disease at diagnosis. It goes to places prostate cancer usually does not: lung, liver, brain, skin, penis, peritoneum and testis, which is why an unusual secondary tumour in a man with prostate cancer is a reason to look again at the histology.",
      "How common it is. About 0.17 percent of prostate cancer by meta-analysis, so of the order of 100 cases a year in the UK if the same proportion holds, which has not been measured directly here. Most are mixed with acinar cancer rather than pure. It is under-diagnosed by systematic biopsy: in one series using MRI-targeted biopsy, 19 of 23 ductal cases (83 percent) had been missed entirely by a prior 12-core systematic biopsy, and expert uropathologists agreed on the diagnosis in only 52 percent of cases in a 20-reader study, so the reported incidence is a floor and the range between series is wide.",
      "How it is treated. As high-risk prostate cancer, with no guideline written specifically for it and no randomised trial of its own. Radical prostatectomy or radical radiotherapy are used for localised disease and hormonal therapy with or without chemotherapy for metastatic disease; the few studies comparing surgery and radiotherapy are small and disagree, with cancer-specific survival looking worse after prostatectomy in the pooled picture. On meta-analysis five-year cancer-specific and overall survival were both worse than for acinar cancer (relative risks 0.85 and 0.83). DNA-repair alterations are commoner in ductal disease, reported in 49 percent of one series of 51 cases, and both the NCCN and the Philadelphia Prostate Cancer Consensus Conference recommend germline genetic testing for anyone whose prostate cancer shows ductal, intraductal or cribriform morphology, which is the one management change the diagnosis reliably triggers.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: ["Ductal morphology on the report: more than 50 percent ductal at prostatectomy, or 'adenocarcinoma with ductal features' on a needle biopsy", "PSA, read with caution because ductal disease makes less of it for the same tumour burden", "Germline and somatic homologous recombination and mismatch repair genes, tested because ductal morphology is one of the triggers"],
    standardOfCare: [
      { setting: "Localised", approach: "Treated as high-risk prostate cancer: radical prostatectomy or radical radiotherapy with androgen deprivation. No guideline and no randomised trial is specific to ductal histology, and the retrospective comparisons of surgery against radiotherapy are small and inconsistent.", refs: ["robotic-surgery", "imrt-igrt", "androgen-deprivation", "prostatectomy"], guideline: { version: "NCCN Guidelines: Prostate Cancer", url: SRC.nccn.url } },
      { setting: "Any stage, at diagnosis", approach: "Germline genetic testing, which the NCCN and the Philadelphia consensus conference recommend for ductal, intraductal or cribriform morphology whatever the stage.", refs: ["germline-testing", "intraductal-carcinoma-prostate", "cribriform-prostate-cancer"], guideline: { version: "NCCN Guidelines: Prostate Cancer", url: SRC.nccn.url } },
      { setting: "Metastatic", approach: "Treated as metastatic acinar prostate cancer, with androgen deprivation and an androgen receptor pathway inhibitor. In the one study that asked the question, 35 ductal cases among 634 men with de novo metastatic prostate cancer had no worse overall or cancer-specific survival than acinar cases, so the histology's disadvantage appears to be in getting to metastasis sooner rather than in behaving worse once there.", refs: ["androgen-deprivation", "psma-pet"], guideline: { version: "NCCN Guidelines: Prostate Cancer", url: SRC.nccn.url } },
    ],
    terms: ["gleason-grade-group", "intraductal-carcinoma-prostate", "cribriform-prostate-cancer", "psa", "prostate-acinar-adenocarcinoma", "tnm-prostate-cancer", "cambridge-prognostic-group"],
    technologies: ["mp-mri", "germline-testing", "histopathology-ihc"],
    notes: [
      "Ductal is not intraductal. They sound alike, they are often found in the same gland, and they mean different things. Ductal adenocarcinoma is an invasive cancer whose cells look like duct lining; intraductal carcinoma of the prostate is cancer growing inside ducts and acini that still have their own basal cell layer, a pattern reported beside an invasive cancer rather than a tumour type of its own. Both are reasons for germline testing and both mean a worse outlook, which is probably why the two words get run together.",
      "Why a needle biopsy report says 'adenocarcinoma with ductal features' instead. The WHO fifth edition reserves the term ductal adenocarcinoma for prostatectomy specimens where more than half the tumour is ductal, and asks for 'adenocarcinoma with ductal features' on needle biopsies whether the sample is pure or mixed, because a needle cannot measure the proportion in the whole gland. A report using the longer phrase is following the classification, not hedging.",
      "Why the incidence figures disagree so much. The meta-analysed range across case series is 0.084 to 13.4 percent, a spread of more than a hundredfold, and the reason is diagnostic rather than biological: there is no single agreed histological definition, twenty expert uropathologists agreed on a positive ductal diagnosis in 52 percent of cases, and systematic biopsy misses the ductal component in most cases that MRI-targeted biopsy finds. Any single number quoted for how common ductal prostate cancer is should be read as an estimate of how often it is recognised.",
    ],
    links: [SRC.ductal2021, SRC.kench2022, SRC.who2022, SRC.rcpath, SRC.netto2022],
  },
];

// ======================= TERMS =======================
export const prostateCoreTerms: TermInput[] = [
  { id: "cambridge-prognostic-group", kind: "term", asOf, name: "Cambridge Prognostic Group (CPG 1 to 5)", category: "Clinical", wikipedia: W("Prostate_cancer_staging"),
    aka: ["CPG", "CPG 1", "CPG 2", "CPG 3", "CPG 4", "CPG 5", "Cambridge Prognostic Groups", "Cambridge prognostic group", "five-tier risk stratification", "NICE risk stratification prostate"],
    tldr: "The five-band risk score the NHS uses for prostate cancer that has not spread. It combines the grade group, the PSA and the T stage into one number from 1 to 5, and NICE writes its treatment advice in those numbers rather than in low, intermediate and high risk.",
    summary: "NICE NG131 recommendation 1.2.15 asks urological cancer multidisciplinary teams to assign a risk category from its table 1 to everyone with newly diagnosed localised or locally advanced prostate cancer, and that table is the Cambridge Prognostic Groups. Group 1 is Gleason score 6 (grade group 1) and PSA under 10 micrograms per litre and stage T1 to T2. Group 2 is Gleason 3+4=7 (grade group 2) or PSA 10 to 20, with stage T1 to T2. Group 3 is Gleason 3+4=7 and PSA 10 to 20 and stage T1 to T2, or Gleason 4+3=7 (grade group 3) at stage T1 to T2. Group 4 is any one of Gleason 8 (grade group 4), PSA above 20, or stage T3. Group 5 is two or more of those three, or Gleason 9 to 10 (grade group 5), or stage T4.\n\nThe point of the five bands is that the old three-tier model, which NG131 carried until the 2021 amendment and which came from D'Amico, could not tell Gleason 3+4 from 4+3 and so put two quite different diseases in one intermediate box. The whole treatment section of NG131 is now written in CPG numbers: active surveillance is offered in CPG 1, offered as one of three equal choices in CPG 2, considered in CPG 3 for people who decline immediate radical treatment, and not offered in CPG 4 and 5 (recommendations 1.3.8 to 1.3.12); radiotherapy is combined with androgen deprivation from CPG 2 upwards, for six months, and considered for up to three years in CPG 4 and 5; isotope bone scans are not routinely offered in CPG 1 and 2. The American NCCN bands, which split intermediate risk into favourable and unfavourable and add a very high band, are a different system answering the same question, and the two do not map exactly onto each other. The Cambridge group also publishes PREDICT Prostate, a separate tool that adds the number of positive cores and the presence of intraductal or cribriform growth to produce an individual survival estimate rather than a band.",
    cancers: ["prostate", "prostate-low-risk", "prostate-intermediate-risk", "prostate-high-risk"],
    terms: ["gleason-grade-group", "psa", "tnm-prostate-cancer", "percentage-gleason-pattern-4"],
    related: ["gleason-grade-group", "psa", "active-surveillance-term", "staging-systems", "tnm-staging"],
    sections: ["diagnostics"],
    links: [SRC.ng131, SRC.rcpath, SRC.nccn],
    notes: ["The Royal College of Pathologists dataset prints both tables side by side, the older three-tier NICE table and the Cambridge groups, and notes that the Cambridge model 'does differentiate between grade group 2 and grade group 3', which the three-tier model does not."],
  },

  { id: "tnm-prostate-cancer", kind: "term", asOf, name: "TNM staging for prostate cancer, and what changed in the 9th edition", category: "Pathology", wikipedia: W("Prostate_cancer_staging"),
    aka: ["TNM prostate", "prostate TNM", "T1c", "T2b", "T3a", "T3b", "pT2", "pT3a", "pT3b", "cT2b(mr)", "N1(PET)", "TNM 9", "TNM 8", "UICC TNM prostate"],
    tldr: "The anatomical stage of prostate cancer: how far the tumour has grown (T), whether it is in the pelvic lymph nodes (N) and whether it has spread further (M). UK reports use the 8th edition; the 9th, recommended from January 2026, leaves the prostate categories alone but asks reports to say which scan the stage came from.",
    summary: "T1 is a tumour that cannot be felt or seen on imaging, with T1c the commonest entry point of all, a cancer found by needle biopsy after a raised PSA. T2 is a tumour confined within the prostate, T3a is extension through the capsule including microscopic bladder neck involvement, T3b is invasion of a seminal vesicle, and T4 is a tumour fixed to or invading the rectum, the external sphincter, the levator muscles or the pelvic wall. N1 is any regional pelvic node. M1a is a non-regional node, M1b bone and M1c anywhere else. There is no pT1 category, because the pathologist is given too little tissue to exclude a higher one, and the eighth edition removed the substaging of pT2, so a prostatectomy report says pT2 without a letter after it.\n\nThe Royal College of Pathologists dataset in force in the UK (G084, version 4, October 2024) names the UICC 8th edition and reprints it as its appendix. The 9th edition was published on 3 July 2025 and UICC recommends it take effect from 1 January 2026; for prostate the T, N and M categories are unchanged. Two things did change. The clinical stage grouping was clarified, with stage I as cT1 or cT2a, stage II as cT2 (or pT2) and cT2b or cT2c, stage III as cT3 or cT4, and stage IV as any node or any metastasis, and with a note that there is no pathological stage I. And the edition introduced imaging suffixes: a T category read from MRI is written cT2b(mr), and a node found on PSMA PET is N1(PET), stage IV(PET). The reason is that prostate is, in the TNM committee's own words, 'probably the malignancy most affected by stage migration'. The eighth edition set the clinical T category from the digital rectal examination alone; MRI and PSMA PET find disease a finger cannot, so a man staged IV on a PSMA PET in 2026 may have far less disease than a man staged IV before those scans existed, and his prognosis is not the same. NICE NG131 names no TNM edition; its Cambridge Prognostic Group table uses bare T1 to T4, which are identical in both editions, so the guideline is not stranded by the change.",
    cancers: ["prostate", "prostate-high-risk", "prostate-mhspc"],
    terms: ["cambridge-prognostic-group", "extraprostatic-extension", "gleason-grade-group", "psma-pet"],
    related: ["tnm-staging", "staging-systems", "cancer-stage", "grade-vs-stage", "extraprostatic-extension"],
    technologies: ["psma-pet", "mp-mri"],
    sections: ["diagnostics"],
    links: [SRC.tnm9, SRC.uicc9, SRC.rcpath, SRC.ng131],
  },

  { id: "prostate-acinar-adenocarcinoma", kind: "term", asOf, name: "Acinar adenocarcinoma of the prostate", category: "Pathology", wikipedia: W("Prostate_cancer"),
    aka: ["Prostatic acinar adenocarcinoma", "Acinar adenocarcinoma", "Conventional prostate adenocarcinoma", "Usual-type prostatic adenocarcinoma", "Adenocarcinoma of the prostate", "Acinar"],
    tldr: "The ordinary type of prostate cancer, more than 95 in every 100 cases. If a report says acinar adenocarcinoma it is saying the cancer is the usual kind, which is the kind every guideline, trial and survival figure for prostate cancer is about.",
    summary: "Acinar adenocarcinoma arises from the small glands, the acini, that make prostatic fluid, and accounts for more than 95 percent of prostatic carcinomas (RCPath G084). Everything written about prostate cancer without a qualifier is written about it: the Gleason grading system was built on it, the Cambridge Prognostic Groups and the NCCN bands stratify it, and the treatment trials from ProtecT to PSMAddition enrolled it. Because it is the default, the word appears on a report to distinguish it from the rare alternatives rather than to say anything about how the cancer will behave, which is decided by the grade group, the PSA and the stage.\n\nThe fifth edition of the WHO Classification of Tumours lists unusual morphologies of acinar adenocarcinoma as subtypes or as alternative histological patterns: PIN-like carcinoma, moved in this edition from being a pattern of ductal carcinoma to a subtype of acinar adenocarcinoma and graded Gleason 6 only; and atrophic, pseudohyperplastic, microcystic, foamy-gland, mucinous and signet-ring-like patterns, described so that pathologists recognise them rather than because they change management. None of these is a separate disease, and none has its own page here. The types that are separate in the fifth edition are ductal adenocarcinoma, treatment-related neuroendocrine prostatic carcinoma, adenoid cystic (basal cell) carcinoma, and squamous and adenosquamous carcinoma.",
    cancers: ["prostate", "prostate-ductal-adenocarcinoma"],
    terms: ["gleason-grade-group", "histology", "intraductal-carcinoma-prostate"],
    related: ["gleason-grade-group", "histology", "tumour-differentiation"],
    sections: ["diagnostics"],
    links: [SRC.rcpath, SRC.kench2022, SRC.who2022],
  },

  { id: "intraductal-carcinoma-prostate", kind: "term", asOf, name: "Intraductal carcinoma of the prostate (IDC-P)", category: "Pathology",
    aka: ["IDC-P", "IDC", "intraductal carcinoma", "intraductal", "intraductal prostate", "atypical intraductal proliferation", "AIP"],
    tldr: "Cancer cells filling prostate ducts and acini that still have their own outer basal cell layer. It is almost always found beside an invasive cancer, it marks a worse outlook, and on its own it is one of the reasons the NHS and the NCCN offer inherited-cancer gene testing.",
    summary: "The WHO fifth edition defines intraductal carcinoma of the prostate as a neoplastic epithelial proliferation involving pre-existing, generally expanded duct and acinar structures, with architectural and cytological atypia beyond what is acceptable for high-grade prostatic intraepithelial neoplasia: lumen-spanning solid or cribriform patterns, or loose cribriform and micropapillary patterns with enlarged nuclei. The basal cell layer is retained, which is what separates it from invasive cribriform cancer and which usually needs an immunohistochemical stain for p63 and high-molecular-weight cytokeratin to demonstrate. The fifth edition also introduces atypical intraductal proliferation for lesions with more atypia than high-grade PIN but less than IDC-P, and moves what used to be called cribriform high-grade PIN into that category.\n\nThe Royal College of Pathologists made reporting the presence of intraductal carcinoma a core item of the UK dataset in its 2024 revision, alongside invasive cribriform carcinoma and the percentage of Gleason pattern 4. Two things follow from finding it. It is associated with high-grade disease and shorter survival, so it argues against active surveillance. And both the NCCN and the Philadelphia Prostate Cancer Consensus Conference recommend germline genetic testing for anyone whose prostate cancer shows intraductal or cribriform morphology, although a large case-control study found no association between germline BRCA2 mutations and either pattern while still finding one with somatic biallelic loss in the tumour.\n\nWhether foci of IDC-P should be counted when the Gleason grade is assigned is unresolved and reported practice varies. The 2014 ISUP consensus said not to grade IDC-P without invasive carcinoma and the 2016 WHO edition went further, saying it should not be factored into grading at all; the two main urological pathology societies now diverge on the point and the fifth edition deliberately endorses neither, asking instead that pathologists state which convention their report follows. A study of biopsies from 1,031 men found that including IDC-P and invasive cribriform carcinoma in the grade group improved prediction of metastasis-free and disease-specific survival, though not of biochemical recurrence.",
    cancers: ["prostate", "prostate-ductal-adenocarcinoma", "prostate-high-risk"],
    terms: ["cribriform-prostate-cancer", "gleason-grade-group", "high-grade-pin", "percentage-gleason-pattern-4"],
    related: ["gleason-grade-group", "carcinoma-in-situ", "germline-testing"],
    technologies: ["germline-testing", "histopathology-ihc"],
    sections: ["diagnostics"],
    links: [SRC.rcpath, SRC.kench2022, SRC.who2022],
  },

  { id: "cribriform-prostate-cancer", kind: "term", asOf, name: "Cribriform growth pattern in prostate cancer", category: "Pathology",
    aka: ["cribriform", "cribriform pattern", "invasive cribriform carcinoma", "large cribriform", "small cribriform", "cribriform prostate"],
    tldr: "A sieve-like growth pattern inside prostate cancer, named for the holes punched through a sheet of tumour cells. It is the worst-behaving form of Gleason pattern 4, and finding it on a biopsy is a reason to treat rather than to watch.",
    summary: "The International Society of Urological Pathology defines the cribriform pattern as a confluent sheet of contiguous malignant epithelial cells with multiple glandular lumina easily visible at low power, with no intervening stroma or mucin separating the individual or fused glands. It is one of the morphologies inside Gleason pattern 4, and the ISUP 2014 consensus settled that any cribriform gland is assigned pattern 4 rather than pattern 3. Since then a run of studies has shown that it is the pattern that carries the risk: cribriform carcinoma in a prostatectomy specimen is associated with worse biochemical-recurrence-free, metastasis-free and disease-specific survival, and its presence in a pre-treatment biopsy predicts a higher pathological stage, upgrading at surgery and poorer outcomes after both surgery and radiotherapy. Most of that evidence is in Gleason score 7 tumours, grade groups 2 and 3, which is exactly where the decision between surveillance and treatment is made.\n\nThe Royal College of Pathologists made the presence of invasive cribriform carcinoma a core reporting item in the 2024 UK dataset, and both ISUP and the Genitourinary Pathology Society recommend excluding men whose biopsy shows it from active surveillance. Whether the size of the cribriform glands matters is unsettled: some series find no difference between large and small, one found large glands worse, and the definitions of large differ between studies, from more than twelve luminal spaces to twice the diameter of the neighbouring benign glands. The pattern is also hard to tell from intraductal carcinoma without an immunohistochemical stain for basal cells, and most of the outcome studies did not separate the two, so part of the risk attributed to cribriform growth may belong to intraductal carcinoma instead.",
    cancers: ["prostate", "prostate-low-risk", "prostate-intermediate-risk", "prostate-ductal-adenocarcinoma"],
    terms: ["gleason-grade-group", "intraductal-carcinoma-prostate", "percentage-gleason-pattern-4"],
    related: ["gleason-grade-group", "active-surveillance-term", "tumour-differentiation"],
    technologies: ["histopathology-ihc", "digital-pathology-ai"],
    sections: ["diagnostics"],
    links: [SRC.rcpath, SRC.kench2022],
  },

  { id: "percentage-gleason-pattern-4", kind: "term", asOf, name: "Percentage of Gleason pattern 4", category: "Pathology",
    aka: ["percentage pattern 4", "percent pattern 4", "% pattern 4", "pattern 4 percentage", "proportion of pattern 4", "Gleason pattern 4"],
    tldr: "How much of the cancer in a biopsy is the more aggressive pattern 4 rather than the slower pattern 3. Two men can both be told grade group 2, one with 5 per cent pattern 4 and one with 45 per cent, and the number is what separates them.",
    summary: "Grade group 2 is Gleason 3+4=7: predominantly well-formed glands with a lesser component of poorly formed, fused or cribriform glands. 'A lesser component' covers everything from a trace to just under half, and the difference matters, because a man with a few per cent of pattern 4 is a candidate for active surveillance and a man approaching half is not. The Royal College of Pathologists made the percentage of Gleason pattern 4 a core item for core biopsies in its October 2024 revision of the UK dataset, following recommendations from both ISUP and the Genitourinary Pathology Society to report it in biopsies with grade group 2 and 3 disease. The dataset notes that methods of estimating the percentage vary between pathologists, so the figure is an estimate rather than a measurement.\n\nThe number also feeds the tools that turn a report into a decision. PREDICT Prostate uses the number of positive cores and the presence of intraductal or cribriform growth alongside the grade; the Cambridge Prognostic Groups separate grade group 2 from grade group 3 precisely because Gleason 3+4 and 4+3 behave differently; and OnCo's pathology report reader asks for percentage pattern 4 by name on the prostate form. If a report does not give it and the grade group is 2 or 3, it is a reasonable thing to ask the team for.",
    cancers: ["prostate", "prostate-low-risk", "prostate-intermediate-risk"],
    terms: ["gleason-grade-group", "cribriform-prostate-cancer", "cambridge-prognostic-group"],
    related: ["gleason-grade-group", "active-surveillance-term", "tumour-grade"],
    sections: ["diagnostics"],
    links: [SRC.rcpath, SRC.epstein2016],
  },

  { id: "psa-density", kind: "term", asOf, name: "PSA density", category: "Biomarkers",
    aka: ["PSAD", "PSA density", "prostate-specific antigen density"],
    tldr: "The PSA divided by the volume of the prostate measured on the scan. A big prostate makes more PSA without any cancer in it, so dividing by size separates a raised PSA that needs a biopsy from one that does not.",
    summary: "PSA density is the serum prostate-specific antigen in nanograms per millilitre divided by the prostate volume in millilitres, taken from the multiparametric MRI. It exists because benign prostatic enlargement raises PSA on its own: a 100 mL gland with a PSA of 8 is behaving differently from a 30 mL gland with the same figure. It is used at two points. In the NCCN very low risk definition a density below 0.15 is one of the criteria, alongside clinical stage T1c, grade group 1, PSA under 10 and fewer than three positive cores with no more than half of any core involved. And it is used in deciding whether a man with a negative or equivocal MRI needs a biopsy at all, where a low density supports omitting one and a high density argues for going ahead.\n\nNICE NG131 does not set a density threshold. It offers multiparametric MRI first, reported on a five-point Likert scale, offers MRI-influenced biopsy at Likert 3 or above, and allows omitting biopsy at Likert 1 or 2 after a shared discussion of the risks and benefits, with systematic biopsy offered to anyone who still wants one; density is one of the things clinicians weigh in that discussion rather than a rule in the guideline. Density is also one of the inputs that gives the NCCN and Cambridge systems different very-low-risk populations, since the Cambridge groups do not use it.",
    cancers: ["prostate", "prostate-low-risk"],
    terms: ["psa", "psa-kinetics", "cambridge-prognostic-group"],
    related: ["psa", "psa-kinetics", "active-surveillance-term", "mp-mri"],
    technologies: ["mp-mri"],
    sections: ["diagnostics", "early-detection"],
    links: [SRC.ng131, SRC.nccn],
  },

  { id: "extraprostatic-extension", kind: "term", asOf, name: "Extraprostatic extension and seminal vesicle invasion", category: "Pathology",
    aka: ["extraprostatic extension", "EPE", "extracapsular extension", "seminal vesicle invasion", "SVI", "pT3a", "pT3b", "capsular penetration", "positive margin prostate"],
    tldr: "Whether the cancer has grown out through the wall of the prostate (pT3a) or into the seminal vesicles behind it (pT3b). Both move the stage to T3, both make recurrence more likely, and after surgery both are read alongside whether the cancer reached the cut edge.",
    summary: "The prostate has no true capsule, so extraprostatic extension means tumour beyond the boundary of the gland into the surrounding fat or the nerve bundles, and it makes the tumour T3a; the eighth edition of TNM added microscopic bladder neck involvement to the same category. Invasion of the muscular wall of a seminal vesicle is T3b. Invasion into the apex of the prostate, or into but not beyond the capsule, is explicitly not T3 and stays T2. A tumour fixed to or invading the rectum, the external sphincter, the levator muscles or the pelvic wall is T4.\n\nOn a radical prostatectomy report these sit beside the surgical margin status, which is a different question: extension describes how far the cancer grew, a positive margin describes whether the surgeon's cut passed through cancer, and a man can have one without the other. Extraprostatic extension, seminal vesicle invasion and a positive margin are the findings that raise the chance of PSA returning after surgery and that drive the discussion about adjuvant or early salvage radiotherapy. In the Cambridge Prognostic Groups, any T3 puts a man in group 4 on its own, and T4 puts him in group 5 on its own.",
    cancers: ["prostate", "prostate-high-risk", "prostate-bcr"],
    terms: ["tnm-prostate-cancer", "cambridge-prognostic-group", "biochemical-recurrence"],
    related: ["resection-margins", "tnm-staging", "prostatectomy", "perineural-invasion", "biochemical-recurrence"],
    sections: ["diagnostics", "surgery"],
    links: [SRC.rcpath, SRC.tnm9, SRC.ng131],
  },

  { id: "high-grade-pin", kind: "term", asOf, name: "High-grade prostatic intraepithelial neoplasia (HGPIN)", category: "Pathology",
    aka: ["HGPIN", "high-grade PIN", "prostatic intraepithelial neoplasia", "PIN", "high grade PIN"],
    tldr: "Abnormal cells lining prostate ducts that are not cancer and are not treated. On its own it is a finding, not a diagnosis; what matters is whether it is widespread and whether anything more atypical was seen beside it.",
    summary: "High-grade prostatic intraepithelial neoplasia is an abnormal proliferation of the cells lining prostatic ducts and acini, with the basal cell layer still present. It is a recognised precursor lesion and it has its own morphological code in the UK reporting dataset, but it is not cancer, it is not staged and it is not treated. Isolated HGPIN on a biopsy in the era of MRI-targeted sampling carries a low enough risk of a cancer being found on a repeat biopsy that it does not by itself trigger one.\n\nWhat changed in the WHO fifth edition is the boundary above it. Lesions with more atypia than HGPIN but not enough for intraductal carcinoma are now called atypical intraductal proliferation, and what used to be reported as cribriform high-grade PIN has moved into that category, because the carcinomas found beside atypical intraductal proliferation behave like those found beside intraductal carcinoma. So the three-step ladder a reader may meet on a report runs HGPIN, then atypical intraductal proliferation, then intraductal carcinoma of the prostate, and only the last two change what happens next.",
    cancers: ["prostate"],
    terms: ["intraductal-carcinoma-prostate", "cribriform-prostate-cancer"],
    related: ["carcinoma-in-situ", "dysplasia", "intraductal-carcinoma-prostate"],
    sections: ["diagnostics"],
    links: [SRC.rcpath, SRC.kench2022],
  },

  { id: "watchful-waiting", kind: "term", asOf, name: "Watchful waiting, and how it differs from active surveillance", category: "Treatment jargon", wikipedia: W("Watchful_waiting"),
    aka: ["watchful waiting", "watch and wait prostate", "deferred hormone therapy", "conservative management prostate"],
    tldr: "Two things that sound the same and are not. Active surveillance monitors a cancer closely so it can still be cured if it grows. Watchful waiting gives up the attempt at cure from the start and treats symptoms if and when they appear.",
    summary: "NICE NG131 defines watchful waiting as part of a strategy for controlling rather than curing prostate cancer, for people with localised disease who do not ever wish to have curative treatment or for whom it is not suitable. It avoids surgery and radiotherapy altogether and relies on deferred hormone therapy if the disease progresses. Follow-up can be in primary care where the local multidisciplinary team and the primary care organisation have agreed a protocol, with PSA measured at least once a year, and anyone on watchful waiting whose PSA rises rapidly or who develops bone pain should be reviewed by a member of the urological cancer team. Bone scans are offered to people who are asymptomatic but at high risk of bone complications when hormone therapy is being deferred.\n\nActive surveillance is the opposite intention. It is a monitoring programme with PSA, repeat MRI and repeat biopsy designed to catch a cancer that is changing early enough to still cure it, and NG131 offers it in Cambridge Prognostic Group 1, as one of three equal choices in group 2 and as an option in group 3 for people who decline immediate radical treatment, with a protocol that includes multiparametric MRI at 12 to 18 months. The difference matters because the two are offered to different people for different reasons, and a man told he is being watched should know which of the two he has agreed to.",
    cancers: ["prostate", "prostate-low-risk"],
    terms: ["cambridge-prognostic-group", "psa"],
    related: ["active-surveillance-term", "cambridge-prognostic-group", "hormone-therapy", "psa"],
    technologies: ["active-surveillance"],
    sections: ["surgery"],
    links: [SRC.ng131],
  },
];

// ======================= SUPPLEMENTS ONTO RECORDS OTHER FILES OWN =======================
const supplements: SpikeSupplement[] = [
  { id: "gleason-grade-group", aka: ["grade group", "grade groups", "ISUP grade group", "WHO grade group", "GG1", "GG2", "GG3", "GG4", "GG5", "Gleason 3+3", "Gleason 8", "Gleason 9", "Gleason 10"],
    terms: ["percentage-gleason-pattern-4", "cribriform-prostate-cancer", "intraductal-carcinoma-prostate", "cambridge-prognostic-group"],
    links: [SRC.rcpath, SRC.epstein2016], notes: [
      "What a UK report actually carries in 2026. Both scales, together. The Royal College of Pathologists dataset in force (G084, version 4, October 2024) sets out the grade groups to be used 'in tangent with the Gleason score', and its reporting proforma asks for the Gleason score and the grade group as separate items. Grade group 1 is Gleason 6 or less, only individual discrete well-formed glands; group 2 is 3+4=7; group 3 is 4+3=7; group 4 is Gleason 8, which is 4+4, 3+5 or 5+3; group 5 is Gleason 9 to 10. A report that gives only one of the two is unusual, and the Gleason score is the one that will appear in older notes and in the Cambridge Prognostic Group table.",
      "Two core items the 2024 UK dataset added beside the grade. In core biopsies the report must give the percentage of Gleason pattern 4, and it must state whether intraductal carcinoma or invasive cribriform carcinoma is present. Both change what should happen next: the percentage separates two men who were both told grade group 2, and either pattern argues against active surveillance and triggers an offer of germline genetic testing.",
      "Why the grade group system was invented at all. To split Gleason 7. Gleason score 7 had been treated as one group in study after study when it is plainly two, 3+4 and 4+3, with different outcomes; the grade groups separate them as groups 2 and 3, and NICE's Cambridge Prognostic Groups use exactly that split to separate CPG 2 from CPG 3. Favourable and unfavourable intermediate risk is the NCCN's language, not NICE's; the Cambridge table has no such labels.",
    ] },

  { id: "castration-resistance", aka: ["hormone-relapsed prostate cancer", "hormone-relapsed", "hormone relapsed", "hormone-refractory prostate cancer"],
    terms: ["tnm-prostate-cancer"], links: [SRC.ng131], notes: [
      "The NHS calls it something else. NICE NG131 does not use the phrase castration-resistant anywhere in its recommendations; its section is headed 'hormone-relapsed metastatic prostate cancer' and its advice on docetaxel, on genomic biomarker-based treatment and on zoledronic acid is written in those words. Castration-resistant, castration-sensitive, mCRPC and mHSPC are the words of the trials, the drug labels and the American guidelines. They mean the same thing, and a British patient may meet both in the same week from different people.",
    ] },

  { id: "mcrpc-mhspc", aka: ["hormone-relapsed", "hormone-relapsed metastatic prostate cancer", "hormone relapsed metastatic prostate cancer"], terms: ["tnm-prostate-cancer"] },

  { id: "psa-kinetics", terms: ["psa-density", "cambridge-prognostic-group"], related: ["psa-density"] },

  { id: "active-surveillance-term", terms: ["watchful-waiting", "cambridge-prognostic-group", "percentage-gleason-pattern-4"], related: ["watchful-waiting", "cambridge-prognostic-group"] },

  { id: "prostatectomy", terms: ["extraprostatic-extension", "tnm-prostate-cancer"], related: ["extraprostatic-extension"] },
];

// ======================= PATCHES =======================
/** The family page: what it is, the five classifications, the basics, the outlook and the "which page is mine" answer. */
const prostatePatch: Spike["patch"] = {
  asOf,
  aka: ["Prostatic acinar adenocarcinoma", "Acinar adenocarcinoma of the prostate", "Adenocarcinoma of the prostate", "Prostate carcinoma", "Carcinoma of the prostate", "CaP"],
  subtypes: [
    "Prostatic ductal adenocarcinoma",
    "Rare histologies, treated as they are named by the WHO fifth edition: adenoid cystic (basal cell) carcinoma, squamous and adenosquamous carcinoma, prostatic stromal sarcoma",
    "Cambridge Prognostic Group 1 to 5, the five-band NHS risk stratification of localised and locally advanced disease (NICE NG131 1.2.15)",
  ],
  biomarkers: [
    "Grade group and Gleason score together, as UK reports give both (RCPath G084, October 2024)",
    "Percentage of Gleason pattern 4, a core reporting item in core biopsies since the 2024 UK dataset",
    "Presence of intraductal carcinoma or invasive cribriform carcinoma, a core reporting item and a trigger for germline testing",
    "PSA density, the PSA divided by the MRI prostate volume, used in the very-low-risk definition and in deciding against biopsy",
    "Cambridge Prognostic Group 1 to 5, assigned by the MDT to every newly diagnosed localised or locally advanced case (NICE NG131 1.2.15)",
  ],
  basics: {
    symptoms: [
      "Prostate cancer often has no symptoms at first, because it usually starts on the outer part of the gland and does not press on the urethra until it has grown or spread (NHS)",
      "Changes in the way you pee: difficulty starting or straining, a weak flow, stop-start peeing, needing to pee urgently or often, feeling you still need to pee when you have just finished, and getting up in the night (NHS)",
      "Other symptoms: erectile dysfunction, blood in the urine or the semen, and, in advanced disease, lower back pain and losing weight without trying (NHS)",
      "These symptoms far more often mean benign prostatic enlargement, which is very common with age, than cancer; the NHS advice is not that they are alarming but that a change in them should be checked (NHS)",
      "See a GP if you are having trouble peeing or have other symptoms, if you are over 40 and genetic testing has shown you carry a faulty BRCA2 gene, or if you are worried about your risk; you can ask about a PSA test even without symptoms, and the GP will weigh your risk in deciding whether it is the right test for you (NHS)",
      "At the appointment the GP will ask whether anyone in the family has had prostate, pancreatic, ovarian or breast cancer, may examine the prostate with a gloved finger through the back passage, and may offer a PSA blood test with results in one to two weeks (NHS)",
    ],
    diagnosis: [
      "Multiparametric MRI is offered first, before any biopsy, for suspected clinically localised prostate cancer, and is reported on a five-point Likert scale rather than PI-RADS (NICE NG131 1.2.2)",
      "MRI-influenced biopsy is offered at Likert 3 or above; at Likert 1 or 2 omitting biopsy can be considered after a shared discussion of the risks and benefits, and systematic biopsy is offered to anyone who still wants one (NG131 1.2.3, 1.2.4)",
      "Mapping transperineal template biopsy is not offered as part of an initial assessment outside a trial (NG131 1.2.5)",
      "After a negative biopsy with an MRI Likert score of 3 or more, the case is discussed at the MDT with a view to repeating the biopsy; after a negative biopsy with Likert 1 or 2, PSA is repeated at 3 to 6 months (NG131 1.2.10, 1.2.12)",
      "CT is considered where MRI is contraindicated and knowing the T or N stage would change management (NG131 1.2.14)",
      "The pathology report gives the histological type, the Gleason score and the grade group, the tumour length in each core, the percentage of Gleason pattern 4 and whether intraductal or invasive cribriform carcinoma is present; on a prostatectomy specimen it adds extraprostatic extension, seminal vesicle invasion, margins and nodes (RCPath G084, October 2024)",
      "Isotope bone scans are not routinely offered in Cambridge Prognostic Group 1 or 2 (NG131 1.2.16)",
    ],
    staging: [
      "Five classifications are in use at once and they answer different questions: histology (what it is), grade (how abnormal it looks), TNM stage (how far it has spread), risk band (what those three add up to) and disease state (what it is doing now). A man can be described by all five simultaneously",
      "Grade: Gleason score and grade group together. Group 1 is Gleason 6 or less, group 2 is 3+4=7, group 3 is 4+3=7, group 4 is Gleason 8 (4+4, 3+5 or 5+3), group 5 is Gleason 9 to 10 (RCPath G084, from the ISUP 2014 consensus)",
      "Risk band in the UK: the Cambridge Prognostic Groups 1 to 5, which the MDT assigns to every newly diagnosed localised or locally advanced case, combining grade group, PSA and T stage. NICE writes its whole treatment section in these numbers (NG131 1.2.15, table 1)",
      "Stage: T1 not palpable or visible (T1c is a cancer found on biopsy after a raised PSA), T2 confined within the prostate, T3a through the capsule, T3b into a seminal vesicle, T4 fixed to or invading rectum, sphincter, levator muscles or pelvic wall; N1 any regional pelvic node; M1a non-regional node, M1b bone, M1c elsewhere. There is no pT1 category and the eighth edition removed the substaging of pT2",
      "UK pathology reports stage against UICC TNM 8, which the Royal College of Pathologists dataset names and reprints (G084, October 2024)",
      "TNM 9 was published on 3 July 2025 and UICC recommends it from 1 January 2026. The prostate T, N and M categories are unchanged; the clinical stage grouping was clarified, and reports are now asked to record the imaging method as a suffix, cT2b(mr) for MRI and N1(PET) for a node found on PSMA PET, because prostate is the malignancy most affected by stage migration (Brierley 2026)",
      "NICE NG131 names no TNM edition. Its risk table uses bare T1 to T4, which are identical in the eighth and ninth editions",
      "Disease state, which is not a stage: hormone-sensitive or castration-resistant (which NICE calls hormone-relapsed), metastatic or not, and whether the PSA alone has risen after treatment (biochemical recurrence). Each of these has its own page here",
      "In England 53 percent of prostate cancers with a known stage were diagnosed at stage I or II in 2022, against 37 percent in Scotland in 2023, 57 percent in Northern Ireland and 59 percent in Wales (Cancer Research UK)",
    ],
    sources: [SRC.ng131, SRC.rcpath, SRC.tnm9, SRC.nhsSymptoms, SRC.cruk],
  },
  openProblems: [
    "Five classifications describe one disease and no single document reconciles them. A British man holds a histological type from the WHO 2022 classification, a grade on two scales at once, a TNM stage from an edition his guideline does not name, a Cambridge Prognostic Group from NICE and a disease state from the drug labels. Each is used by a different professional and the mapping between the American and British risk systems is approximate.",
    "The staging system is being outrun by the scanners. TNM 8 set the clinical T category from a finger; MRI and PSMA PET see disease it cannot feel, and the TNM committee's own answer in the ninth edition is to record which scan produced the stage rather than to restage the disease. Two men both labelled stage IV, one by bone scan in 2015 and one by PSMA PET in 2026, do not have the same illness, and survival series that span the change cannot be pooled.",
    "Grading still has an unresolved question at its centre. Whether intraductal carcinoma should be counted when the Gleason grade is assigned is decided differently by the two main urological pathology societies, and the WHO fifth edition declined to endorse either, asking only that pathologists say which convention they used. Grade drives the risk band, which drives the treatment.",
    "Ductal histology has no trial of its own. It presents later, metastasises to unusual sites and survives worse than acinar cancer, and every treatment recommendation for it is borrowed from the disease it is not.",
  ],
  terms: ["cambridge-prognostic-group", "tnm-prostate-cancer", "prostate-acinar-adenocarcinoma", "intraductal-carcinoma-prostate", "cribriform-prostate-cancer", "percentage-gleason-pattern-4", "psa-density", "extraprostatic-extension", "high-grade-pin", "watchful-waiting", "gleason-grade-group", "psa", "castration-resistance", "biochemical-recurrence", "mcrpc-mhspc", "psa-kinetics", "active-surveillance-term", "tnm-staging", "grade-vs-stage", "tumour-grade", "prostatectomy", "orchiectomy"],
  related: ["prostate-ductal-adenocarcinoma", "prostate-nepc", "prostate-low-risk", "prostate-intermediate-risk", "prostate-high-risk", "prostate-bcr", "prostate-mhspc", "prostate-nmcrpc", "prostate-mcrpc"],
  links: [SRC.ng131, SRC.rcpath, SRC.who2022, SRC.kench2022, SRC.tnm9, SRC.uicc9, SRC.globocan, SRC.seer, SRC.cruk, SRC.nhsSymptoms, SRC.ductal2021, SRC.netto2022, SRC.epstein2016],
  notes: [
    "Which page is mine? Prostate cancer is described by five things at once, and each has its own page here. The type is almost always acinar adenocarcinoma, which is this page; if the report says ductal, or says the cancer turned neuroendocrine after hormone treatment, there is a page for each. The grade is a grade group from 1 to 5 with a Gleason score beside it. The stage is a TNM category. The risk band in Britain is a Cambridge Prognostic Group from 1 to 5, and the localised pages here are mapped to it: CPG 1 is the low-risk page, CPG 2 and 3 the intermediate-risk page, CPG 4 and 5 the high-risk page. The state is whether the cancer still responds to hormone treatment and whether it has spread, and there are pages for rising PSA after treatment, for metastatic hormone-sensitive disease, for non-metastatic and metastatic castration-resistant disease.",
    "What prostate cancer is. The prostate is a gland the size of a walnut that sits below the bladder and surrounds the top of the urethra, and it makes the fluid that carries sperm. More than 95 in every 100 prostate cancers arise in its acini, the small glands that make that fluid, which is why the ordinary type is called acinar adenocarcinoma. It usually starts on the outer part of the gland, which is why it usually causes nothing at first, and why so much of it is found by a blood test rather than by a symptom.",
    "Why the same cancer gets different risk labels on either side of the Atlantic. Britain and America stratify localised prostate cancer with different systems. NICE NG131 recommendation 1.2.15 uses the five Cambridge Prognostic Groups; the NCCN uses six bands, from very low to very high, and splits intermediate risk into favourable and unfavourable using criteria the Cambridge system does not have, including PSA density and the proportion of positive cores. NICE replaced its own three-tier table, which came from D'Amico, in the 2021 amendment because the three-tier model could not tell Gleason 3+4 from 4+3, and the Cambridge system can. A man reading an American source about his own diagnosis is reading a different map of the same ground.",
    "Is the Gleason score being replaced by the grade group? No. They are used together, and a UK report in 2026 gives both. The Royal College of Pathologists dataset sets out the grade groups to be used 'in tangent with the Gleason score', and its proforma asks for each separately. The grade groups exist to split Gleason 7, which is really two diseases, 3+4 and 4+3, into grade groups 2 and 3. NICE's Cambridge table is written with both scales in every row for the same reason: the Gleason score is what appears in older notes and in most of the literature.",
    "Why does my report mention cribriform or intraductal when my grade is only 7? Because since October 2024 the UK reporting dataset asks for it, and because within grade group 2 and 3 those patterns are where the risk sits. Invasive cribriform carcinoma is the worst-behaving form of Gleason pattern 4, and intraductal carcinoma is cancer filling ducts that still have their outer basal layer. Either one argues against active surveillance, and either one is a reason to be offered germline genetic testing under both the NCCN and the Philadelphia consensus recommendations.",
    "Grade group 1 prostate cancer and the word cancer. Grade group 1, Gleason 6, is the grade that has prompted a long argument about whether it should be called cancer at all, because left alone it very rarely spreads. NICE's answer is practical rather than semantic: Cambridge Prognostic Group 1, which is grade group 1 with a PSA under 10 and stage T1 or T2, is the one band where active surveillance is offered first and radical treatment is a fallback if surveillance is unsuitable or unacceptable to the person (NG131 1.3.8).",
    "Am I being watched, or watched and left? Active surveillance and watchful waiting are different plans with different intentions. Active surveillance monitors with PSA, repeat MRI and repeat biopsy so that a cancer that changes can still be cured. Watchful waiting, in NICE's own definition, is a strategy for controlling rather than curing, for people who do not want radical treatment or for whom it is not suitable, and relies on deferred hormone therapy. Both involve not treating today; only one keeps cure on the table.",
    "How common is it, and what is the outlook? Worldwide, 1,546,112 new cases and 419,849 deaths a year, fourth for cases among all cancers and eighth for deaths (GLOBOCAN 2024). In the UK, 57,898 new cases and 12,300 deaths a year, and 78.9 percent of men survive ten years or more; the lifetime risk of being diagnosed is 17 percent (Cancer Research UK). In the United States 333,830 cases and 36,320 deaths are projected for 2026, and 69.5 percent are found while still confined to the prostate, where five-year relative survival is 100 percent (SEER). These are averages over everybody diagnosed and they are not a personal prognosis; for most men the question the numbers raise is not whether treatment will work but whether treatment is needed at all.",
    "Why the histology tier here is short. The WHO fifth edition names ductal adenocarcinoma, treatment-related neuroendocrine prostatic carcinoma, adenoid cystic (basal cell) carcinoma, and squamous and adenosquamous carcinoma as types separate from acinar adenocarcinoma, and lists PIN-like carcinoma as a subtype of acinar adenocarcinoma with the atrophic, pseudohyperplastic, microcystic and foamy-gland appearances as patterns rather than entities. The first two have pages here because they change management; the rest are rare enough that the honest treatment is a sentence on this page and a glossary entry, not a thin page of their own. Urothelial carcinoma of the prostatic urethra is covered in the urinary tract chapter of the same classification, so it is not a prostate cancer record here.",
  ],
};

/** The three localised risk pages: mapped to the Cambridge Prognostic Groups, which is what a UK reader is told. */
const lowRiskPatch: Spike["patch"] = {
  asOf,
  aka: ["Cambridge Prognostic Group 1", "CPG 1", "CPG1 prostate cancer", "Grade group 1 prostate cancer"],
  terms: ["cambridge-prognostic-group", "percentage-gleason-pattern-4", "cribriform-prostate-cancer", "psa-density", "watchful-waiting", "tnm-prostate-cancer"],
  related: ["prostate-ductal-adenocarcinoma"],
  links: [SRC.ng131, SRC.rcpath],
  notes: [
    "What this page is called in the NHS: Cambridge Prognostic Group 1. NICE NG131 recommendation 1.2.15 defines it as Gleason score 6 (grade group 1) and PSA under 10 micrograms per litre and stage T1 to T2, all three together. For CPG 1, NG131 1.3.8 offers active surveillance, and says to consider radical prostatectomy or radical radiotherapy only if active surveillance is not suitable or not acceptable to the person. Isotope bone scans are not routinely offered (1.2.16). The NCCN's very low and low risk bands cover roughly the same ground but add PSA density and the number of positive cores, so the two systems do not select identical men.",
  ],
};

const intermediateRiskPatch: Spike["patch"] = {
  asOf,
  aka: ["Cambridge Prognostic Group 2", "Cambridge Prognostic Group 3", "CPG 2", "CPG 3", "CPG2 prostate cancer", "CPG3 prostate cancer"],
  terms: ["cambridge-prognostic-group", "percentage-gleason-pattern-4", "cribriform-prostate-cancer", "intraductal-carcinoma-prostate", "tnm-prostate-cancer"],
  related: ["prostate-ductal-adenocarcinoma"],
  links: [SRC.ng131, SRC.rcpath],
  notes: [
    "What this page is called in the NHS: Cambridge Prognostic Groups 2 and 3, the two halves of intermediate risk. NICE NG131 1.2.15 defines group 2 as Gleason 3+4=7 (grade group 2) or PSA 10 to 20, at stage T1 to T2, and group 3 as Gleason 3+4=7 and PSA 10 to 20 and stage T1 to T2, or Gleason 4+3=7 (grade group 3) at stage T1 to T2. The split exists because the old three-tier model could not tell 3+4 from 4+3. The treatment differs across the line: in CPG 2 active surveillance, radical prostatectomy and radical radiotherapy are offered as a choice (1.3.9); in CPG 3 radical treatment is offered and active surveillance is only considered for people who choose not to have it (1.3.10). Radiotherapy is combined with six months of androgen deprivation from CPG 2 upwards (1.3.28 and the radical radiotherapy recommendations).",
    "Within these two groups, two things on the pathology report move a man towards treatment rather than surveillance: the percentage of Gleason pattern 4, a core reporting item in UK core biopsies since October 2024, and the presence of invasive cribriform or intraductal carcinoma, which both ISUP and the Genitourinary Pathology Society treat as a reason to exclude a man from active surveillance.",
  ],
};

const highRiskPatch: Spike["patch"] = {
  asOf,
  aka: ["Cambridge Prognostic Group 4", "Cambridge Prognostic Group 5", "CPG 4", "CPG 5", "CPG4 prostate cancer", "CPG5 prostate cancer"],
  terms: ["cambridge-prognostic-group", "tnm-prostate-cancer", "extraprostatic-extension", "intraductal-carcinoma-prostate", "cribriform-prostate-cancer"],
  related: ["prostate-ductal-adenocarcinoma"],
  links: [SRC.ng131, SRC.rcpath],
  notes: [
    "What this page is called in the NHS: Cambridge Prognostic Groups 4 and 5. NICE NG131 1.2.15 defines group 4 as any one of Gleason 8 (grade group 4), PSA above 20 or stage T3, and group 5 as two or more of those three, or Gleason 9 to 10 (grade group 5), or stage T4. Active surveillance is not offered in either (1.3.11); radical prostatectomy or radical radiotherapy is offered where the cancer is likely to be controlled in the long term (1.3.12); radiotherapy is combined with androgen deprivation, and continuing it for up to three years is considered in CPG 4 and 5 (1.3.23); brachytherapy alone is not offered (1.3.25).",
    "Note what puts a man in group 4 on its own: a single T3, which means extraprostatic extension or seminal vesicle invasion. A stage found on MRI rather than by examination will be written cT3(mr) under the ninth edition of TNM, and the TNM committee's reason for introducing the suffix is precisely that imaging finds T3 disease a finger would have called T2.",
  ],
};

const bcrPatch: Spike["patch"] = {
  asOf,
  aka: ["Hormone-relapsed prostate cancer, PSA-only", "Rising PSA after treatment"],
  terms: ["cambridge-prognostic-group", "extraprostatic-extension", "tnm-prostate-cancer", "psa-density"],
  links: [SRC.ng131],
  notes: [
    "The findings on the prostatectomy report that raise the chance of arriving here are extraprostatic extension (pT3a), seminal vesicle invasion (pT3b) and a positive surgical margin, which are three different things: the first two say how far the cancer grew, the third says whether the surgeon's cut passed through cancer, and a man can have one without the others.",
  ],
};

/** The three state pages: vocabulary only. The disease itself is owned by ../prostate-subtypes.ts and the other layers. */
const mhspcPatch: Spike["patch"] = {
  asOf,
  aka: ["Hormone-sensitive prostate cancer", "Metastatic castration-sensitive prostate cancer"],
  terms: ["tnm-prostate-cancer", "cambridge-prognostic-group"],
  links: [SRC.tnm9],
  notes: [
    "A word of caution about what stage IV means now. The ninth edition of TNM asks that a node or metastasis found on PSMA PET be written N1(PET) or M1(PET), because prostate is the malignancy most affected by stage migration: imaging now finds small-volume disease that older staging could not see, so a man diagnosed with metastatic disease on a PSMA PET may have much less cancer than a man given the same label before those scans existed, and the older survival figures were measured on the older label (Brierley 2026).",
  ],
};

const nmcrpcPatch: Spike["patch"] = {
  asOf,
  aka: ["Non-metastatic hormone-relapsed prostate cancer", "M0 CRPC"],
  terms: ["tnm-prostate-cancer", "castration-resistance"],
  links: [SRC.ng131],
  notes: [
    "NICE calls this hormone-relapsed rather than castration-resistant. NG131's section is headed 'hormone-relapsed metastatic prostate cancer' and the phrase castration-resistant does not appear in its recommendations, while the trials, the drug labels and the American guidelines use castration-resistant throughout. They describe the same state.",
  ],
};

const mcrpcPatch: Spike["patch"] = {
  asOf,
  aka: ["Hormone-relapsed metastatic prostate cancer", "Hormone-refractory prostate cancer"],
  terms: ["tnm-prostate-cancer", "castration-resistance"],
  links: [SRC.ng131],
  notes: [
    "NICE calls this hormone-relapsed metastatic prostate cancer, which is the heading its own recommendations use; castration-resistant is the term of the trials, the labels and the American guidelines. A British patient will meet both words for the same disease.",
  ],
};

/** The neuroendocrine page: it is a WHO entity, not a disease state, and this patch says so and widens its aliases. */
const nepcPatch: Spike["patch"] = {
  asOf,
  aka: ["Treatment-related neuroendocrine prostatic carcinoma", "t-NEPC", "Treatment-emergent neuroendocrine prostate cancer", "Small cell neuroendocrine carcinoma of the prostate", "Small cell carcinoma of the prostate", "Neuroendocrine prostatic carcinoma"],
  terms: ["prostate-acinar-adenocarcinoma", "tnm-prostate-cancer", "castration-resistance"],
  related: ["prostate-ductal-adenocarcinoma"],
  links: [SRC.kench2022, SRC.rcpath, SRC.who2022],
  notes: [
    "This page is a tumour type, not a disease state. The WHO fifth edition gives treatment-related neuroendocrine prostatic carcinoma its own section inside the prostate chapter, rather than folding it into the classification's consolidated neuroendocrine chapter, because of its distinctive clinical and biological behaviour. It is defined there as tumours demonstrating complete neuroendocrine differentiation, or partial neuroendocrine differentiation with adenocarcinoma, following androgen deprivation therapy, and the definition covers both the primary and its metastases (Kench 2022).",
    "What a UK report will and will not do with it. Neuroendocrine carcinomas are not Gleason graded. The dataset in force does not ask for routine synaptophysin and chromogranin staining of ordinary prostate adenocarcinoma, because almost all of them show some neuroendocrine differentiation and there is not enough evidence that finding it changes treatment or prognosis; the stains are for tumours that already look neuroendocrine down the microscope. PSA and NKX3.1 are usually lost in these tumours, which is one of the reasons the PSA can stay low while the disease advances (RCPath G084).",
    "How common it is in the setting where it matters. Treatment-related neuroendocrine prostatic carcinoma is found in 10.5 to 17 percent of people with metastatic castration-resistant prostate cancer after treatment with androgen receptor signalling inhibitors (Kench 2022). The evidence is that these carcinomas arise by transformation of an existing adenocarcinoma rather than from neuroendocrine cells, which is what lineage plasticity means here and why it is a route to resistance rather than a second cancer.",
  ],
};

const entities = [...prostateCoreCancers, ...prostateCoreTerms];

const prostateParentSpike: Spike = { cancerId: "prostate", entities, patch: prostatePatch, supplements };
export const prostateLowRiskSpike: Spike = { cancerId: "prostate-low-risk", entities: [], patch: lowRiskPatch };
export const prostateIntermediateRiskSpike: Spike = { cancerId: "prostate-intermediate-risk", entities: [], patch: intermediateRiskPatch };
export const prostateHighRiskSpike: Spike = { cancerId: "prostate-high-risk", entities: [], patch: highRiskPatch };
export const prostateBcrSpike: Spike = { cancerId: "prostate-bcr", entities: [], patch: bcrPatch };
export const prostateMhspcSpike: Spike = { cancerId: "prostate-mhspc", entities: [], patch: mhspcPatch };
export const prostateNmcrpcSpike: Spike = { cancerId: "prostate-nmcrpc", entities: [], patch: nmcrpcPatch };
export const prostateMcrpcSpike: Spike = { cancerId: "prostate-mcrpc", entities: [], patch: mcrpcPatch };
export const prostateNepcSpike: Spike = { cancerId: "prostate-nepc", entities: [], patch: nepcPatch };

export default prostateParentSpike;

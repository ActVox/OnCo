import type { EntityInput, TermInput } from "@/lib/schema";

/**
 * Recovery and rejuvenation, facet G: second primary cancers, and the surveillance that follows treatment.
 *
 * Before this file the corpus had no record of a second primary cancer as a subject in its own right. It is the
 * largest late risk of being cured, and it is the reason most of survivorship follow-up exists: a second cancer is
 * a new disease, with its own stage and its own treatment, and finding it early is the only thing a reader or a
 * clinician can actually do about it.
 *
 * Four things are written down here that are quoted loosely everywhere else.
 *
 *  1. Every figure carries its cohort and its follow-up. A relative risk means nothing without the comparison
 *     group, the years of follow-up and the treatment era. The 1965 to 1994 Hodgkin cohorts were irradiated with
 *     fields nobody uses now; their numbers are the best evidence that exists and they do not describe a person
 *     treated today. Where a paper says that itself, this file quotes it saying so.
 *  2. The adult picture. The childhood-cancer cohorts are the best documented late-effects evidence in
 *     oncology and they belong to another facet of this round; this file covers people treated as adults, and
 *     says plainly where an adult number does not exist, which is often.
 *  3. The screening, in the form a reader can act on. The NHS very high risk breast programme has exact
 *     eligibility ages and exact tests, read off the GOV.UK protocol rather than described; the American rule
 *     differs, and where guidelines disagree this file says which, and how.
 *  4. The things that are not second cancers. Recurrence, metastasis, field cancerisation and a cancer in the
 *     other side of a paired organ are four different events with four different meanings, and news stories mix
 *     all of them up.
 *
 * Every DOI below was resolved through Crossref and every figure read from the abstract or text of the paper it
 * sits beside. Two identifiers that PubMed returns for these papers are wrong and were corrected against Crossref:
 * PubMed gives Morton's JAMA Oncology 2019 paper a Current Drug Discovery Technologies DOI and Wallis's BMJ 2016
 * meta-analysis a British Journal of Cancer one. Neither wrong DOI appears here.
 *
 * Records the corpus already held are referenced rather than rewritten: `second-cancers-after-radiotherapy`,
 * `secondary-malignancy`, `second-primary-skin-cancer`, `field-cancerisation`, `relapse-recurrence`,
 * `late-recurrence`, `survivorship-care-plan`, `lymphoma-living-hodgkin-survivorship-screening`,
 * `lymphoma-tx-hodgkin-late-effects`, and the wave-one records `rejuv-age-clonal-haematopoiesis-after-therapy`
 * and `rejuv-age-frailty-and-late-effects`.
 *
 * UK spelling. No em dashes.
 */

const asOf = "2026-10-02";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const doi = (label: string, d: string) => ({ label, url: `https://doi.org/${d}` });

/** Sections every record here carries. The `rejuvenation` front is the reason the file exists. */
const SEC = ["rejuvenation", "supportive-care"];
const PREV = ["rejuvenation", "supportive-care", "prevention"];

const T = (extra: string[] = []) => ["rejuvenation", "survivorship", "second-cancers", ...extra];
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });

// =============================================================================
// Sources used on more than one record. Each resolved through Crossref.
// =============================================================================
const DONIN_2016 = doi("Donin et al., Risk of second primary malignancies among cancer survivors in the United States, 1992 through 2008 (Cancer 2016)", "10.1002/cncr.30164");
const DONIN_2019 = doi("Donin et al., Second primary lung cancer in United States cancer survivors, 1992 to 2008 (Cancer Causes Control 2019)", "10.1007/s10552-019-01161-7");
const BERRINGTON_2011 = doi("Berrington de Gonzalez et al., Proportion of second cancers attributable to radiotherapy treatment in adults: a cohort study in the US SEER cancer registries (Lancet Oncol 2011)", "10.1016/S1470-2045(11)70061-4");
const MORTON_2019 = doi("Morton et al., Association of chemotherapy for solid tumors with development of therapy-related myelodysplastic syndrome or acute myeloid leukemia in the modern era (JAMA Oncol 2019)", "10.1001/jamaoncol.2018.5625");
const MORTON_2013 = doi("Morton et al., Evolving risk of therapy-related acute myeloid leukemia following cancer chemotherapy among adults in the United States, 1975 to 2008 (Blood 2013)", "10.1182/blood-2012-08-448068");
const SMITH_SM_2003 = doi("Smith et al., Clinical-cytogenetic associations in 306 patients with therapy-related myelodysplasia and myeloid leukemia: the University of Chicago series (Blood 2003)", "10.1182/blood-2002-11-3343");
const SMITH_RE_2003 = doi("Smith et al., Acute myeloid leukemia and myelodysplastic syndrome after doxorubicin-cyclophosphamide adjuvant therapy for operable breast cancer: the NSABP experience (JCO 2003)", "10.1200/JCO.2003.03.114");
const LEONE_2007 = doi("Leone et al., Therapy-related leukemia and myelodysplasia: susceptibility and incidence (Haematologica 2007)", "10.3324/haematol.11034");
const PEDERSEN_BJERGAARD_2008 = doi("Pedersen-Bjergaard et al., Genetics of therapy-related myelodysplasia and acute myeloid leukemia (Leukemia 2008)", "10.1038/sj.leu.2405078");
const TRAVIS_BLADDER_1995 = doi("Travis et al., Bladder and kidney cancer following cyclophosphamide therapy for non-Hodgkin's lymphoma (JNCI 1995)", "10.1093/jnci/87.7.524");
const TRAVIS_BREAST_2003 = doi("Travis et al., Breast cancer following radiotherapy and chemotherapy among young women with Hodgkin disease (JAMA 2003)", "10.1001/jama.290.4.465");
const TRAVIS_BREAST_2005 = doi("Travis et al., Cumulative absolute breast cancer risk for young women treated for Hodgkin lymphoma (JNCI 2005)", "10.1093/jnci/dji290");
const TRAVIS_LUNG_2002 = doi("Travis et al., Lung cancer following chemotherapy and radiotherapy for Hodgkin's disease (JNCI 2002)", "10.1093/jnci/94.3.182");
const TRAVIS_TESTIS_2005 = doi("Travis et al., Second cancers among 40,576 testicular cancer patients: focus on long-term survivors (JNCI 2005)", "10.1093/jnci/dji278");
const FOSSA_2005 = doi("Fossa et al., Risk of contralateral testicular cancer: a population-based study of 29,515 US men (JNCI 2005)", "10.1093/jnci/dji185");
const GRANTZAU_2015 = doi("Grantzau and Overgaard, Risk of second non-breast cancer after radiotherapy for breast cancer: a systematic review and meta-analysis of 762,468 patients (Radiother Oncol 2015)", "10.1016/j.radonc.2014.10.004");
const GRANTZAU_2016 = doi("Grantzau and Overgaard, Risk of second non-breast cancer among patients treated with and without postoperative radiotherapy for primary breast cancer: a meta-analysis of population-based studies including 522,739 patients (Radiother Oncol 2016)", "10.1016/j.radonc.2016.08.017");
const WALLIS_2016 = doi("Wallis et al., Second malignancies after radiotherapy for prostate cancer: systematic review and meta-analysis (BMJ 2016)", "10.1136/bmj.i851");
const BAXTER_2005 = doi("Baxter et al., Increased risk of rectal cancer after prostate radiation: a population-based study (Gastroenterology 2005)", "10.1053/j.gastro.2004.12.038");
const SALMINEN_2018 = doi("Salminen et al., Radiation-associated sarcoma after breast cancer in a nationwide population: increasing risk of angiosarcoma (Cancer Med 2018)", "10.1002/cam4.1698");
const STYRING_2010 = doi("Styring et al., Changing clinical presentation of angiosarcomas after breast cancer: from late tumors in edematous arms to earlier tumors on the thoracic wall (Breast Cancer Res Treat 2010)", "10.1007/s10549-009-0703-8");
const CAHAN_1948 = doi("Cahan et al., Sarcoma in irradiated bone: report of eleven cases (Cancer 1948)", "10.1002/1097-0142(194805)1:1<3::aid-cncr2820010103>3.0.co;2-7");
const SLAUGHTER_1953 = doi("Slaughter et al., Field cancerization in oral stratified squamous epithelium: clinical implications of multicentric origin (Cancer 1953)", "10.1002/1097-0142(195309)6:5<963::aid-cncr2820060515>3.0.co;2-q");
const TAKAHASHI_2017 = doi("Takahashi et al., Preleukaemic clonal haemopoiesis and risk of therapy-related myeloid neoplasms: a case-control study (Lancet Oncol 2017)", "10.1016/S1470-2045(16)30626-X");
const WEEKS_2023 = doi("Weeks et al., Prediction of risk for myeloid malignancy in clonal hematopoiesis (NEJM Evidence 2023)", "10.1056/evidoa2200310");
const MORICE_2021 = doi("Morice et al., Myelodysplastic syndrome and acute myeloid leukaemia in patients treated with PARP inhibitors: a safety meta-analysis of randomised controlled trials and a retrospective study of the WHO pharmacovigilance database (Lancet Haematol 2021)", "10.1016/S2352-3026(20)30360-4");
const PALUMBO_2014 = doi("Palumbo et al., Second primary malignancies with lenalidomide therapy for newly diagnosed myeloma: a meta-analysis of individual patient data (Lancet Oncol 2014)", "10.1016/S1470-2045(13)70609-0");
const FISHER_1994 = doi("Fisher et al., Endometrial cancer in tamoxifen-treated breast cancer patients: findings from the NSABP B-14 trial (JNCI 1994)", "10.1093/jnci/86.7.527");
const RADFORD_2015 = doi("Radford et al., Results of a trial of PET-directed therapy for early-stage Hodgkin's lymphoma, the RAPID trial (NEJM 2015)", "10.1056/NEJMoa1408648");
const CUTTER_2021 = doi("Cutter et al., Predicted risks of cardiovascular disease following chemotherapy and radiotherapy in the UK NCRI RAPID trial of PET-directed therapy for early-stage Hodgkin lymphoma (JCO 2021)", "10.1200/JCO.21.00408");
const CLEMENT_2018 = doi("Clement et al., Balancing the benefits and harms of thyroid cancer surveillance in survivors of childhood, adolescent and young adult cancer: recommendations from the International Late Effects of Childhood Cancer Guideline Harmonization Group in collaboration with the PanCareSurFup Consortium (Cancer Treat Rev 2018)", "10.1016/j.ctrv.2017.11.005");
const LAMMERS_2025 = doi("Lammers et al., Influence of survivorship care on health-related quality of life, knowledge of late effects, and distress levels among long-term Hodgkin lymphoma survivors, the INSIGHT study (Cancer Med 2025)", "10.1002/cam4.71113");
const LANDGREN_2007 = doi("Landgren et al., Risk of second malignant neoplasms among lymphoma patients with a family history of cancer (Int J Cancer 2007)", "10.1002/ijc.22414");
const SASLOW_2007 = doi("Saslow et al., American Cancer Society guidelines for breast screening with MRI as an adjunct to mammography (CA Cancer J Clin 2007)", "10.3322/canjclin.57.2.75");

const GOVUK_VHR_PROTOCOL = { label: "NHS England: Eligibility criteria and screening protocols for women at very high risk of breast cancer (updated 18 November 2025)", url: "https://www.gov.uk/government/publications/breast-screening-higher-risk-women-surveillance-protocols/tests-and-frequency-of-testing-for-women-at-very-high-risk--2" };
const GOVUK_VHR_GUIDANCE = { label: "NHS England: Protocols for surveillance of women at higher risk of developing breast cancer (updated 18 November 2025)", url: "https://www.gov.uk/government/publications/breast-screening-higher-risk-women-surveillance-protocols/protocols-for-surveillance-of-women-at-higher-risk-of-developing-breast-cancer" };
const ACS_SCREENING = { label: "American Cancer Society: Recommendations for the early detection of breast cancer", url: "https://www.cancer.org/cancer/types/breast-cancer/screening-tests-and-early-detection/american-cancer-society-recommendations-for-the-early-detection-of-breast-cancer.html" };
const COG_LTFU = { label: "Children's Oncology Group: survivorship resources and long-term follow-up guidelines", url: "https://childrensoncologygroup.org/survivorship" };
const NCI_SURVIVORSHIP = { label: "NCI: Survivorship, late effects of cancer treatment", url: "https://www.cancer.gov/about-cancer/coping/survivorship" };

// =============================================================================
// 1. WHAT THE RISK ACTUALLY IS, BY EXPOSURE
// =============================================================================
const risk: TermInput[] = [
  term({
    id: "rejuv-second-cancers-overview",
    name: "Second cancers after treatment: what the risk is, and what is done about it",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Second primary cancer", "Subsequent malignant neoplasm", "Second primary malignancy", "SPM"],
    wikipedia: W("Secondary_malignant_neoplasm"),
    tags: T(["late-effects"]),
    tldr: "A second cancer is a brand new cancer, not the first one coming back. Most are found by the ordinary routes, and some have a screening programme attached, which is the part worth asking about by name. The risk comes from three things that add together: the treatment, the thing that caused the first cancer and has not gone away, and simply having lived longer.",
    summary: `What is done about it. Three things, in order of how much they change. A treatment summary that lists what you were given, at what dose, to what part of the body, because no screening decision can be made without it. Enrolment in any screening programme your exposures qualify you for, which in the United Kingdom means the very high risk breast programme for women irradiated to the chest when young. And continued attention to the ordinary risks, because in adults treated as adults most second cancers are not caused by the treatment.

How common. In the SEER registries, 2,116,163 adults diagnosed between 1992 and 2008 with one of the ten commonest cancers were followed; 170,865 of them, 8.1 per cent, developed a second primary malignancy. Survivors of bladder cancer had the highest risk. Adjusting for age, race, grade, stage, marital status, education and income, a history of non-Hodgkin lymphoma predicted the highest risk of a second cancer (hazard ratios 2.70 in men and 2.88 in women), followed by bladder cancer (1.88 and 1.66). Among people who had two incident cancers, 13 per cent died of the first and 55 per cent of the second; lung cancer was the cause of death in 12 per cent. The authors' own summary sentence is that "nearly 1 in 12 patients diagnosed with a common cancer developed a second malignancy, the most common of which was lung cancer".

How much of it is the treatment. Less than most people assume, in adults. Across nine SEER registries, 647,672 adults diagnosed between 1973 and 2002 with one of fifteen cancers routinely treated with radiotherapy were followed for a mean of 12 years; 60,271 of them, 9 per cent, developed a second solid cancer. Comparing those who had radiotherapy with those who did not, the relative risk exceeded 1 for every first-cancer site, from 1.08 (95% CI 0.79 to 1.46) after cancers of the eye and orbit to 1.43 (1.13 to 1.84) after cancer of the testis. The excess amounted to 3,266 second solid cancers (2,862 to 3,670), which is 8 per cent (7 to 9) of all second solid cancers in people who had radiotherapy, or five excess cancers per 1,000 people treated with radiotherapy by fifteen years. The paper's conclusion is worth reading exactly: "A relatively small proportion of second cancers are related to radiotherapy in adults, suggesting that most are due to other factors, such as lifestyle or genetics."

Why the childhood numbers are so much larger, and do not transfer. A child irradiated at eight has seventy years in which a radiation-induced cancer can appear, growing tissue that is more radiosensitive, and no competing causes of death. An adult of sixty-five has none of those things. The childhood-cancer cohorts are covered elsewhere on this front; their attributable fractions, which reach 92 per cent for meningioma, are theirs and not transferable to a person treated at sixty.

The three mechanisms, each with its own record here. Cytotoxic drugs that damage DNA in blood stem cells, producing therapy-related myeloid neoplasms. Radiation, producing solid cancers in or at the edge of the treated field, decades later. And shared cause, where the smoking, alcohol, virus or inherited variant that produced the first cancer is still present and produces a second. These behave differently, appear at different times, and call for different answers.

What this is not. Not the first cancer coming back, which is recurrence; not the first cancer spreading, which is metastasis. A record below sets out the difference, because getting it wrong changes everything about what the news means.`,
    terms: ["secondary-malignancy", "late-effects", "second-cancers-after-radiotherapy", "relapse-recurrence"],
    technologies: ["survivorship-care-plan"],
    bottlenecks: ["b-survivorship", "b-early-detection"],
    related: ["rejuv-second-alkylating-agents-and-myeloid-neoplasms", "rejuv-second-topoisomerase-inhibitors-short-latency", "rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-age-smoking-and-inherited-risk", "rejuv-second-uk-very-high-risk-breast-screening", "rejuv-second-what-is-not-a-second-cancer", "rejuv-second-choices-made-at-treatment", "rejuv-age-frailty-and-late-effects"],
    links: [DONIN_2016, BERRINGTON_2011, NCI_SURVIVORSHIP],
  }),

  term({
    id: "rejuv-second-alkylating-agents-and-myeloid-neoplasms",
    name: "Alkylating agents and therapy-related myeloid neoplasms",
    category: "Side effects",
    sections: SEC,
    aka: ["t-MDS", "t-AML", "Therapy-related myelodysplastic syndrome", "Secondary leukaemia after chemotherapy"],
    wikipedia: W("Alkylating_antineoplastic_agent"),
    tags: T(["blood", "chemotherapy"]),
    tldr: "Alkylating chemotherapy can damage a blood stem cell in a way that shows up years later as myelodysplastic syndrome or acute myeloid leukaemia. It is uncommon, it depends on the total dose, and the risk falls away after about ten years. Knowing the cumulative dose you were given is the single most useful thing on your treatment summary.",
    summary: `What is done about it. Nothing is given to prevent it, so the whole of the answer sits at the time of treatment: the lowest cumulative alkylator dose that achieves the result, and an alkylator-free option where an equivalent one exists. Afterwards, a full blood count is the test, and an unexplained and persistent drop in any cell line is the reason to look further rather than wait.

The pattern. Alkylating agents and radiotherapy produce a myeloid neoplasm with a characteristic shape: a latency of several years, a phase of myelodysplasia before frank leukaemia, and losses or deletions of chromosomes 5 and 7. In 306 consecutive patients with therapy-related myelodysplasia or myeloid leukaemia referred to the University of Chicago from 1972 onwards, 240 (78 per cent) had received alkylating agents and 115 (39 per cent) topoisomerase II inhibitors. At diagnosis, 282 (92 per cent) had a clonal chromosome abnormality: chromosome 5 in 63, chromosome 7 in 85, both in 66, a recurring balanced rearrangement in 31, another clonal change in 39, and a normal karyotype in 24. Abnormalities of chromosome 5, 7 or both accounted for 76 per cent of all abnormal karyotypes. Median latency in the group without balanced rearrangements was 67 months.

Dose matters, and it has been measured. The National Surgical Adjuvant Breast and Bowel Project pooled six adjuvant trials that tested doxorubicin and cyclophosphamide at different cyclophosphamide intensities. With two or four cycles of cyclophosphamide at 2,400 mg/m2 supported by granulocyte colony-stimulating factor, the cumulative incidence of acute myeloid leukaemia or myelodysplastic syndrome at five years was 1.01 per cent (95% CI 0.63 to 1.62). With standard doxorubicin and cyclophosphamide, 600 mg/m2 every 21 days for four cycles, it was 0.21 per cent (0.11 to 0.41). Patients who also had breast radiotherapy had more secondary leukaemia than those who did not (relative risk 2.38, P = .006). The authors state that the incidence "was small relative to that of breast cancer relapse", which is the comparison a reader needs to hold both numbers at once.

How often, across all solid cancers. Among 700,612 adults aged 20 to 84 diagnosed with a first solid cancer between 2000 and 2013 in SEER, who received initial chemotherapy and survived at least a year, there were 1,619 cases of therapy-related myelodysplastic syndrome or acute myeloid leukaemia. Risk was raised after chemotherapy for 22 of 23 solid cancers, every one except colon. Relative risks ran from 1.5 to more than 10, and excess absolute risks from 1.4 to more than 15 cases per 10,000 person-years compared with the general population. The paper's estimate is that for people treated now, "approximately three-quarters of tMDS/AML cases expected to occur within the next 5 years will be attributable to chemotherapy".

What happens then, with its cohort. In the Chicago series, median survival after a diagnosis of therapy-related myelodysplasia or myeloid leukaemia was 8 months and survival at five years was under 10 per cent; that is a median in a referral series treated between 1972 and 2002, so half of those counted lived longer and treatment has changed since. In the SEER cohort treated from 2000 onwards, 1,270 of 1,619 people (78.4 per cent) had died by the end of follow-up, with a median overall survival of 7 months. Therapy-related and spontaneous myeloid neoplasms share the same genetic pathways, which is why the argument has been made for decades that they should be classified and treated the same way.

When the risk ends. The review by Leone and colleagues states that treatment for breast cancer and germ-cell tumours has been associated with a 1 to 5 per cent lifetime risk of leukaemia, and that "in all cases the risk of t-MDS/AML drops sharply by 10 years after treatment". That is the one genuinely reassuring sentence in this literature, and it is specific to the myeloid neoplasms: the solid second cancers after radiotherapy behave in the opposite way and keep rising.`,
    cancers: ["aml", "mds", "aml-secondary", "breast-cancer", "ovarian", "multiple-myeloma"],
    drugs: ["cyclophosphamide", "melphalan", "procarbazine", "mechlorethamine", "doxorubicin"],
    terms: ["secondary-malignancy", "late-effects"],
    technologies: ["cytotoxic-chemotherapy", "survivorship-care-plan"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship"],
    related: ["rejuv-second-cancers-overview", "rejuv-second-topoisomerase-inhibitors-short-latency", "rejuv-second-platinum-and-parp-inhibitors", "rejuv-second-from-clone-to-disease", "rejuv-second-choices-made-at-treatment", "rejuv-age-clonal-haematopoiesis-after-therapy"],
    links: [SMITH_SM_2003, SMITH_RE_2003, MORTON_2019, LEONE_2007, PEDERSEN_BJERGAARD_2008],
  }),

  term({
    id: "rejuv-second-topoisomerase-inhibitors-short-latency",
    name: "Topoisomerase II inhibitors and the shorter latency",
    category: "Side effects",
    sections: SEC,
    aka: ["Etoposide-related leukaemia", "11q23 therapy-related leukaemia", "KMT2A-rearranged secondary AML"],
    wikipedia: W("Topoisomerase_inhibitor"),
    tags: T(["blood", "chemotherapy"]),
    tldr: "Etoposide and the anthracyclines can cause a leukaemia too, but a different one: it arrives after about two years rather than six, it starts as acute leukaemia without a myelodysplastic phase, and it carries a balanced break in a chromosome rather than a missing piece. So the first two or three years after this chemotherapy are when a blood count matters most.",
    summary: `What is done about it. Again nothing preventive, so the answer is at the time of treatment and in the follow-up interval. Because the latency is short, a full blood count during the first years after an etoposide-containing or anthracycline-containing regimen is where an unexplained cytopenia is likely to show, and that is also the window in which a reader is most likely to still be under oncology follow-up rather than discharged.

Two diseases, not one. Drugs that poison DNA topoisomerase II, chiefly the epipodophyllotoxins etoposide and teniposide and the anthracyclines, produce a myeloid neoplasm with balanced translocations involving chromosome bands 11q23, where the KMT2A gene sits, and 21q22. Alkylating agents and radiotherapy produce the chromosome 5 and 7 losses described in the record beside this one. These were recognised as alternative genetic pathways long before the gene mutations behind them were found, and the cytogenetic pattern still depends on which class of drug was given.

The latency, measured. In the University of Chicago series of 306 patients with therapy-related myelodysplasia or myeloid leukaemia, patients whose disease carried a balanced rearrangement had a significantly shorter latency: a median of 28 months against 67 months for everyone else (P < .0001). They were also far more likely to present with acute leukaemia outright rather than with myelodysplasia first: 28 per cent of those presenting with acute leukaemia had a balanced rearrangement against 4 per cent of those presenting with myelodysplasia (P < .0001). That is the whole clinical difference in two numbers: sooner, and without a warning phase.

Where this matters most. Etoposide is used in testicular cancer, small cell lung cancer, lymphoma and several paediatric regimens, and the anthracyclines in breast cancer, lymphoma and leukaemia. In the SEER analysis of adults treated for a first solid cancer from 2000 onwards, therapy-related myeloid neoplasms were raised after chemotherapy for 22 of 23 solid cancer types, so this is not confined to the diseases where it was first described.

What is not known. There is no threshold dose of etoposide below which the risk is zero, and no test before treatment that identifies who will develop it. The populations in which cumulative-dose relationships have been measured most carefully are paediatric, and those cohorts belong to another facet of this round. For an adult asking whether their own etoposide dose was high enough to matter, the honest answer is that the number needed to answer that has not been published for most adult regimens.`,
    cancers: ["aml", "aml-secondary", "mds", "testicular", "sclc", "non-hodgkin-lymphoma"],
    drugs: ["etoposide", "doxorubicin"],
    terms: ["secondary-malignancy", "late-effects"],
    technologies: ["cytotoxic-chemotherapy", "survivorship-care-plan"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship"],
    related: ["rejuv-second-cancers-overview", "rejuv-second-alkylating-agents-and-myeloid-neoplasms", "rejuv-second-from-clone-to-disease"],
    links: [SMITH_SM_2003, PEDERSEN_BJERGAARD_2008, LEONE_2007, MORTON_2019],
  }),

  term({
    id: "rejuv-second-platinum-and-parp-inhibitors",
    name: "Platinum drugs and PARP inhibitors: the newer leukaemia risk",
    category: "Side effects",
    sections: SEC,
    aka: ["PARP inhibitor MDS risk", "Platinum-related myeloid neoplasm", "Lenalidomide second primary malignancy"],
    wikipedia: W("PARP_inhibitor"),
    tags: T(["blood", "targeted-therapy"]),
    tldr: "The leukaemia risk after chemotherapy was described in the era of mustards and etoposide, and it did not stay there. Platinum drugs carry it, PARP inhibitors raise it about two and a half times against placebo, and lenalidomide with oral melphalan raises it nearly fivefold against melphalan alone. The absolute numbers are small, but the choice of partner drug is sometimes a real decision.",
    summary: `What is done about it. For PARP inhibitors, a blood count before and during treatment and investigation of a cytopenia that does not resolve. For myeloma, the finding below changed practice: an alkylator-free partner, or cyclophosphamide instead of oral melphalan, alongside lenalidomide. These are decisions made with the treating team, and the record on choices made at treatment sets out the rest.

Platinum drugs. The SEER analysis of 700,612 adults treated for a first solid cancer between 2000 and 2013 found that use of known leukaemogenic agents in initial chemotherapy "increased substantially since 2000, most notably for gastrointestinal tract cancers (esophagus, stomach, colon, and rectum; 10% in 2000-2001 to 81% during 2012-2013)", driven by platinum compounds. The same analysis found newly emerging raised risks of therapy-related myeloid neoplasm in people treated since 2000 for oesophageal, cervical, prostate and possibly anal cancer, and since the 1990s for bone and joint and endometrial cancer. The second cancer risk of a chemotherapy era is measured a decade after that era begins, which is why the modern figures keep moving.

PARP inhibitors. A meta-analysis pooled 18 placebo-controlled randomised trials covering 7,307 patients. PARP inhibitors raised the risk of myelodysplastic syndrome or acute myeloid leukaemia against placebo, with a Peto odds ratio of 2.63 (95% CI 1.13 to 6.14, p = 0.026) and no heterogeneity between studies. The absolute incidence was 0.73 per cent (0.50 to 1.07; 21 events in 4,533 patients) in the PARP inhibitor groups and 0.47 per cent (0.26 to 0.85; three events in 2,774 patients) in the placebo groups. In the WHO pharmacovigilance database, 178 reported cases were found, 99 of myelodysplastic syndrome and 79 of acute myeloid leukaemia; median treatment duration was 9.8 months (IQR 3.6 to 17.4) and median latency from first exposure 17.8 months (8.4 to 29.2). Of 104 cases reporting an outcome, 47 (45 per cent) ended in death. Most of those patients had already had platinum chemotherapy, so the meta-analysis measures the risk of adding a PARP inhibitor on top of it rather than the risk of the drug alone.

Lenalidomide, and the partner drug. An individual-patient meta-analysis of seven randomised trials in newly diagnosed myeloma covered 3,218 treated patients, 2,620 who received lenalidomide and 598 who did not. The cumulative incidence of any second primary malignancy at five years was 6.9 per cent (5.3 to 8.5) with lenalidomide and 4.8 per cent (2.0 to 7.6) without (hazard ratio 1.55, 1.03 to 2.34, p = 0.037). Split by type, the solid second cancers were not different (3.8 against 3.4 per cent, HR 1.1, 0.62 to 2.00, p = 0.72); the haematological ones were (3.1 per cent, 1.9 to 4.3, against 1.4 per cent, 0.0 to 3.6; HR 3.8, 1.15 to 12.62, p = 0.029). The finding that mattered was which combination carried it: lenalidomide with oral melphalan raised haematological second cancer risk against melphalan alone with a hazard ratio of 4.86 (2.79 to 8.46, p < 0.0001), while lenalidomide with cyclophosphamide (HR 1.26, 0.30 to 5.38) and lenalidomide with dexamethasone (HR 0.86, 0.33 to 2.24) did not. The authors' conclusion was that alternatives such as cyclophosphamide, or alkylator-free combinations, should be considered instead of oral melphalan alongside lenalidomide.

What is not known. Whether the immunotherapies and antibody-drug conjugates now in first-line use carry any such risk is not yet measurable, because the latency is longer than their time in practice. A reader who is told that a new drug has no second cancer risk should know that the usual reason is that nobody has been followed long enough to see one.`,
    cancers: ["ovarian", "multiple-myeloma", "aml", "mds", "colorectal", "esophageal"],
    drugs: ["cisplatin", "carboplatin", "olaparib", "niraparib", "lenalidomide", "melphalan", "cyclophosphamide"],
    terms: ["secondary-malignancy", "late-effects"],
    technologies: ["survivorship-care-plan"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship"],
    related: ["rejuv-second-cancers-overview", "rejuv-second-alkylating-agents-and-myeloid-neoplasms", "rejuv-second-choices-made-at-treatment"],
    links: [MORICE_2021, PALUMBO_2014, MORTON_2019, MORTON_2013],
  }),

  term({
    id: "rejuv-second-radiotherapy-dose-field-and-age",
    name: "Radiotherapy and second cancers: field, dose and age at exposure",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Radiation-induced cancer", "Second malignancy in the radiotherapy field", "Out-of-field second cancer"],
    wikipedia: W("Radiation-induced_cancer"),
    tags: T(["radiotherapy"]),
    tldr: "A radiation-induced cancer appears in or at the edge of the treated area, usually more than ten years later, and the risk rises with the dose the organ received and falls with the age at which the person was treated. Which organs sat in the field is therefore the question that decides everything that follows, and it is answerable from the radiotherapy record.",
    summary: `What is done about it. Two things, one at the time and one afterwards. At the time: smaller fields, the modern techniques that cut dose to nearby organs, and omitting radiotherapy where an equally good option exists. Afterwards: knowing which organs were in the field, because that is what decides whether a screening programme applies. The radiotherapy department keeps the plan; a late-effects clinic or a general practitioner can request it.

The three variables, and how each behaves. Dose to the organ drives the risk, and the relationship is graded rather than threshold-like: in the SEER analysis of 647,672 five-year survivors, relative risk "was highest for organs that typically received greater than 5 Gy". Age at exposure runs the other way: the same analysis found that risk "decreased with increasing age at diagnosis". Time since treatment runs upwards: risk "increased with time since diagnosis", which is the opposite of the leukaemia pattern, where risk falls away after about ten years.

The absolute size of it in adults. Across those fifteen cancer sites, the estimated excess was 3,266 second solid cancers (95% CI 2,862 to 3,670), 8 per cent (7 to 9) of all second solid cancers in people who had radiotherapy, and five excess cancers per 1,000 people treated by fifteen years after diagnosis.

Breast cancer radiotherapy, as the worked example. A meta-analysis of 13 cohort studies covering 762,468 women found that five or more years after a breast cancer diagnosis, radiotherapy was associated with second non-breast cancer at a relative risk of 1.12 (95% CI 1.06 to 1.19), lung 1.39 (1.28 to 1.51), oesophagus 1.53 (1.01 to 2.31) and sarcoma 2.53 (1.74 to 3.70), with no significant association for thyroid. Fifteen or more years out the lung figure rose to 1.66 (1.36 to 2.01) and the oesophageal one to 2.17 (1.11 to 4.25). The same authors' later meta-analysis of 22 population-based studies compared 245,575 irradiated and 277,164 unirradiated women against general-population rates: the standardised incidence ratio for second non-breast cancer was 1.23 (1.12 to 1.36) in irradiated women and 1.08 (1.03 to 1.13) in unirradiated ones, and in irradiated women the incidence of lung, oesophageal, thyroid and connective-tissue cancers rose over time, peaking at ten to fifteen years. At fifteen years or more the summary estimates were 1.91 for lung, 2.71 for oesophagus and 3.15 for thyroid, and 6.54 for sarcoma at ten years or more. Unirradiated women had no raised risk of lung or oesophageal cancer at any point.

Pelvic radiotherapy, as the second worked example. A meta-analysis of 21 observational studies of radiotherapy for prostate cancer found raised risks, against men not irradiated, of bladder cancer (adjusted hazard ratio 1.67, 1.55 to 1.80), colorectum (1.79, 1.34 to 2.38) and rectum (1.79, 1.34 to 2.38), and no significant excess of haematological (1.64, 0.90 to 2.99) or lung cancer (1.45, 0.70 to 3.01). Across the included studies the highest reported absolute rates were 3.8 per cent for bladder, 4.2 per cent for colorectal and 1.2 per cent for rectal cancer, and the lowest were 0.1, 0.3 and 0.3 per cent, a spread the authors attribute to differing follow-up and study quality. The modality mattered: external beam radiotherapy was consistently associated with raised odds and brachytherapy was not.

The proof that it is the field and not the person. In a SEER cohort of 30,552 men treated with radiotherapy and 55,263 with surgery alone for prostate cancer between 1973 and 1994, all surviving at least five years, 1,437 colorectal cancers developed: 267 at definitely irradiated sites, 686 at potentially irradiated sites and 484 at non-irradiated sites. Radiation was associated with cancer in the irradiated rectum (adjusted hazard ratio 1.7, 1.4 to 2.2) and had no effect on the rest of the colon. A risk confined to the tissue that was irradiated, and absent from identical tissue a few centimetres away in the same person, is the cleanest evidence in this field that the radiation is the cause.

What the older cohorts cannot tell you. Every long cohort describes fields that are no longer used. Mantle fields, whole-pelvis fields and two-dimensional planning delivered much larger volumes at higher dose than modern conformal or intensity-modulated plans. Whether the smaller fields of the last twenty years have lowered the forty-year second cancer rate is not known, because nobody treated with them has yet been followed for forty years, and saying otherwise would be a guess.`,
    cancers: ["breast-cancer", "prostate", "hodgkin-lymphoma", "urothelial", "colorectal", "lung-cancer", "sarcoma"],
    terms: ["second-cancers-after-radiotherapy", "secondary-malignancy", "late-effects"],
    technologies: ["imrt-igrt", "proton-therapy", "brachytherapy", "deep-inspiration-breath-hold", "survivorship-care-plan"],
    bottlenecks: ["b-survivorship", "b-surgery-radiation-innovation"],
    keyPapers: ["paper-schaapveld-second-cancer-risk-40-years-hodgkin-nejm-2015"],
    related: ["rejuv-second-cancers-overview", "second-primary-breast-after-chest-radiotherapy", "second-primary-lung-after-chest-radiotherapy", "second-primary-sarcoma-in-the-treated-field", "second-primary-bowel-after-abdominal-radiotherapy", "rejuv-second-choices-made-at-treatment"],
    links: [BERRINGTON_2011, GRANTZAU_2015, GRANTZAU_2016, WALLIS_2016, BAXTER_2005],
  }),

  term({
    id: "rejuv-second-age-smoking-and-inherited-risk",
    name: "Age, smoking and inherited predisposition: what the treatment risk is added to",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Smoking after cancer treatment", "Family history and second cancers", "Genetic predisposition to second cancers"],
    wikipedia: W("Carcinogenesis"),
    tags: T(["prevention", "smoking"]),
    tldr: "Treatment is rarely the only cause of a second cancer, and in adults it is usually not the main one. Smoking is the clearest example: after chest radiotherapy for Hodgkin lymphoma, the risks from tobacco and from treatment appeared to multiply rather than add, which makes stopping smoking the largest single lever a survivor has over this particular risk.",
    summary: `What is done about it. Stopping smoking, with help rather than alone, because that is where the measured interaction is largest. Telling the oncology team about cancers in close relatives, because an inherited predisposition changes both the screening offered and the treatment chosen. And continuing with the ordinary population screening programmes, which survivors are more likely to drop out of, not less.

Smoking, measured against treatment. Within a population-based cohort of 19,046 people treated for Hodgkin's disease between 1965 and 1994, a case-control study compared 222 who developed lung cancer with 444 matched controls, using cumulative drug amounts, the radiation dose at the exact place in the lung where the cancer arose, and tobacco history. Alkylating agents without radiotherapy carried a relative risk of 4.2 (95% CI 2.1 to 8.8); a radiation dose of 5 Gy or more without alkylating agents carried 5.9 (2.7 to 13.5); both rose with dose (P for trend < .001). Risk after alkylating agents and radiotherapy together "was as expected if individual excess risks were summed". Tobacco use increased lung cancer risk more than twentyfold, and the authors state that "risks from smoking appeared to multiply risks from treatment". The authors also warn that the precise estimates "should be interpreted cautiously, given the possible residual and enhancing effects of tobacco", which is the honest caveat on their own finding.

Age. Two opposite effects run at once. Older age at treatment lowers the relative risk from radiotherapy, because there is less time for a radiation-induced cancer to appear and more competing causes of death; the SEER analysis of 647,672 survivors found relative risk decreasing with increasing age at diagnosis. But older age raises the background rate of every cancer, so the absolute number of second cancers in a survivor cohort is still dominated by people in their sixties and seventies. A young survivor has the higher multiple of a small number; an older survivor the smaller multiple of a large one.

Inherited predisposition. Family history is measurable as a risk factor for a second cancer in its own right. Using a population-based database of 41,181 people with Hodgkin lymphoma (7,476), non-Hodgkin lymphoma (25,941) or chronic lymphocytic leukaemia (7,764) and cancer diagnoses in 110,862 first-degree relatives, people with Hodgkin lymphoma and a family history of any cancer had a relative risk of breast cancer of 1.81 (95% CI 1.04 to 3.16) compared with those without. Among people with chronic lymphocytic leukaemia, a positive family history carried raised risks of bladder (3.53, 1.31 to 9.55) and prostate cancer (2.15, 1.17 to 3.94). The associations for non-Hodgkin lymphoma were not statistically significant. A specific inherited syndrome changes this further: a person with a pathogenic TP53 variant is both more likely to develop a radiation-induced cancer and eligible for a different screening protocol, which is why the NHS very high risk breast programme screens that group with magnetic resonance imaging alone and states that mammography is contraindicated for them.

What the evidence does not support. In the joint analysis of childhood cancer survivors cited on the frailty and late-effects record on this front, treatment and genetic predisposition accounted for most of the attributable risk of a subsequent neoplasm, and lifestyle factors contributed negligibly. Diet and exercise have the strongest evidence in survivorship for fitness, function and in colon cancer for survival; they are not where the evidence for preventing a second cancer lies. Smoking is the exception, and it is a large one.`,
    cancers: ["hodgkin-lymphoma", "lung-cancer", "nsclc", "non-hodgkin-lymphoma", "cll"],
    terms: ["secondary-malignancy", "late-effects", "second-cancers-after-radiotherapy"],
    technologies: ["smoking-cessation", "survivorship-care-plan"],
    bottlenecks: ["b-prevention-adoption", "b-hereditary-risk", "b-survivorship"],
    related: ["rejuv-second-cancers-overview", "second-primary-lung-after-chest-radiotherapy", "rejuv-age-frailty-and-late-effects", "rejuv-second-screening-after-treatment-compared"],
    links: [TRAVIS_LUNG_2002, BERRINGTON_2011, LANDGREN_2007, GOVUK_VHR_PROTOCOL],
  }),
];

// =============================================================================
// 2. THE SPECIFIC, ACTIONABLE ONES
// =============================================================================
const sites: TermInput[] = [
  term({
    id: "second-primary-breast-after-chest-radiotherapy",
    name: "Breast cancer after chest radiotherapy given young",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Breast cancer after Hodgkin lymphoma", "Breast cancer after mantle radiotherapy", "Radiation-related breast cancer"],
    wikipedia: W("Radiation-induced_cancer"),
    tags: T(["breast", "radiotherapy", "screening"]),
    tldr: "This is the second cancer with a real screening programme attached, and the one most worth asking about by name. A woman who had radiotherapy to breast tissue between the ages of 10 and 35, most often for Hodgkin lymphoma, is eligible in England for annual magnetic resonance imaging from age 25 or 30, and being missed from that list has happened often enough that asking is reasonable.",
    summary: `What is offered. In England, entry to the NHS Breast Screening Programme's very high risk pathway, which for this group means annual magnetic resonance imaging from age 25 or 30 and annual MRI plus mammography from 40. The exact ages, which depend on how old you were when irradiated, are on the screening record beside this one. Referral runs through the breast screening after radiotherapy dataset, BARD, which cross-matches cancer registry records against radiotherapy treatment records to find eligible women. Women treated for a cancer other than lymphoma are referred by their oncologist using a BARD non-lymphoma referral form.

Why the programme exists. A matched case-control study inside an international cohort of 3,817 women who survived at least a year after Hodgkin's disease diagnosed at age 30 or younger between 1965 and 1994 compared 105 who developed breast cancer with 266 who did not. A radiation dose of 4 Gy or more to the site where the breast cancer later appeared carried a relative risk of 3.2 (95% CI 1.4 to 8.2) against lower doses without alkylating agents, rising to 8.0 (2.6 to 26.4) above 40 Gy, with a dose trend at P < .001. The excess persisted 25 years or more after radiotherapy. Radiation risk "did not vary appreciably by age at exposure or reproductive history" within this already-young cohort.

The absolute numbers, which are what a woman actually wants. Using the same cohort, the authors calculated cumulative absolute risk. For a woman treated for Hodgkin lymphoma at age 25 with a chest radiation dose of at least 40 Gy and no alkylating agents, the estimated cumulative absolute risk of breast cancer was 1.4 per cent by age 35 (95% CI 0.9 to 2.1), 11.1 per cent by 45 (7.4 to 16.3) and 29.0 per cent by 55 (20.2 to 40.1). The paper states that these estimates "are applicable to HL survivors treated with regimens of the past" and that projections "should be used with caution, however, in patients treated with more recent approaches, including limited-field radiotherapy and/or ovary-sparing chemotherapy". That sentence is as important as the numbers.

The part that surprises people: chemotherapy lowered this risk. In the same study, treatment with alkylating agents alone carried a relative risk of breast cancer of 0.6 (0.2 to 2.0), and risk fell with each additional cycle of alkylating agents (P = .003). Women who received 5 Gy or more to the ovaries had a relative risk of 0.4 (0.1 to 1.1) compared with those who received less. The authors' interpretation is that "hormonal stimulation appears important for the development of radiation-induced breast cancer, as evidenced by the reduced risk associated with ovarian damage from alkylating agents or radiation". It is an uncomfortable finding: the treatment that caused early menopause also lowered this particular risk, and ovarian function after chemotherapy is covered on its own record on this front.

Who else this applies to. Any radiotherapy field that includes breast tissue in a woman under 36, not only lymphoma. The NHS guidance states that most eligible women were treated for Hodgkin or non-Hodgkin lymphoma but that "other diagnoses may also result in similar radiotherapy treatment fields", and gives a named route for checking an uncertain case. Total body irradiation before a transplant is an explicitly open question: the guidance records that women who had it "are at an elevated risk of breast cancer in the years following treatment" and that NHS England "will review the evidence to determine if previous TBI reaches the eligibility threshold for the VHR screening programme". That is a named gap in a national programme, and it is written down in the programme's own document.

The failure mode. Being eligible and never being invited. The corpus record on Hodgkin survivorship screening sets out the NHS England recall of women treated before 2003 who should have been referred and may not have been. If you had radiotherapy above the waist as a young woman and have never had a screening invitation, that is a reason to ask rather than to assume you were missed for a good reason.`,
    cancers: ["breast-cancer", "hodgkin-lymphoma", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-living-hodgkin-survivorship-screening", "lymphoma-tx-hodgkin-late-effects", "secondary-malignancy", "second-cancers-after-radiotherapy"],
    technologies: ["mri", "mammography", "survivorship-care-plan"],
    bottlenecks: ["b-survivorship", "b-early-detection", "b-care-fragmentation"],
    keyPapers: ["paper-schaapveld-second-cancer-risk-40-years-hodgkin-nejm-2015"],
    related: ["rejuv-second-uk-very-high-risk-breast-screening", "rejuv-second-screening-after-treatment-compared", "rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-cancers-overview"],
    links: [TRAVIS_BREAST_2003, TRAVIS_BREAST_2005, GOVUK_VHR_PROTOCOL, GOVUK_VHR_GUIDANCE],
  }),

  term({
    id: "second-primary-lung-after-chest-radiotherapy",
    name: "Lung cancer after chest radiotherapy and after alkylating chemotherapy",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Second primary lung cancer", "Lung cancer after Hodgkin lymphoma", "Lung cancer after breast radiotherapy"],
    wikipedia: W("Lung_cancer_screening"),
    tags: T(["lung", "radiotherapy", "smoking"]),
    tldr: "Lung cancer is the commonest cause of death among people who develop a second cancer, and chest radiotherapy raises the risk of it for more than twenty years. There is no screening programme aimed at survivors anywhere, although some survivor groups have a measured rate above the threshold at which lung screening was shown to save lives, so this is a gap rather than a settled answer.",
    summary: `What is offered. Smoking cessation support, which is the intervention with by far the largest measured effect here, and attention to a new cough, breathlessness or haemoptysis in anyone with a treated chest. In the United Kingdom, people aged 55 to 74 who have ever smoked are invited to lung health checks through the NHS targeted lung cancer screening programme on the basis of smoking history, not of previous cancer treatment. No country screens for lung cancer on the basis of having had chest radiotherapy.

The risk after chest radiotherapy for Hodgkin lymphoma. In the case-control study inside a cohort of 19,046 patients treated between 1965 and 1994, a radiation dose of 5 Gy or more to the place in the lung where the cancer later arose, without alkylating agents, carried a relative risk of 5.9 (95% CI 2.7 to 13.5). Alkylating agents without radiotherapy carried 4.2 (2.1 to 8.8), and among patients given mechlorethamine, vincristine, procarbazine and prednisone, risk rose with the cumulative amounts of mechlorethamine and of procarbazine separately (P < .001). The timing differed by cause: raised risk after alkylating agents appeared within one to four years, while the excess after radiotherapy "began 5 years after treatment and persisted for more than 20 years".

The risk after breast radiotherapy. In the meta-analysis of 762,468 women, radiotherapy was associated with second lung cancer at a relative risk of 1.39 (1.28 to 1.51) five or more years after diagnosis, rising to 1.66 (1.36 to 2.01) at fifteen years or more; unirradiated women had no raised risk of lung cancer at any point. In the later meta-analysis against general-population rates, the standardised incidence ratio for lung cancer in irradiated women at fifteen years or more was 1.91.

Why it matters more than its relative risk suggests. Among 2,116,163 American survivors of the ten commonest cancers, lung cancer was the commonest second primary and the cause of death in 12 per cent of those who had two incident cancers. In a separate SEER analysis of 1,450,837 survivors of localised non-pulmonary cancers followed from 1992 to 2008, 25,472 developed a second primary lung cancer at a mean 5.7 years (SD 3.6), and 57 per cent of them died of it.

The gap, stated as the authors stated it. That second analysis compared survivors' rates with the control arm of the National Lung Screening Trial, the trial that established that low-dose CT screening reduces lung cancer death. Survivors of cancers of the hypopharynx, oropharynx, tonsil and larynx had second primary lung cancer rates "which greatly exceeded that observed in the control arm of the NLST (572/100,000 person-years)", and survivors of bladder and oesophageal cancer had rates approaching it. The authors' conclusion was that "further study could help determine if screening for lung cancer in these cancer survivors could prevent death from lung cancer". No trial has answered that, and no programme has been built on it.

The lever that is available now. Smoking multiplied the treatment risk rather than adding to it in the Hodgkin cohort. A survivor who smokes and who had chest radiotherapy carries both, and stopping removes the larger of the two.`,
    cancers: ["lung-cancer", "nsclc", "hodgkin-lymphoma", "breast-cancer", "head-and-neck", "oropharyngeal-cancer", "urothelial", "esophageal"],
    terms: ["secondary-malignancy", "second-cancers-after-radiotherapy", "late-effects"],
    technologies: ["low-dose-ct-screening", "smoking-cessation", "survivorship-care-plan"],
    bottlenecks: ["b-early-detection", "b-survivorship", "b-prevention-adoption"],
    related: ["rejuv-second-age-smoking-and-inherited-risk", "rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-screening-after-treatment-compared", "rejuv-second-cancers-overview"],
    links: [TRAVIS_LUNG_2002, GRANTZAU_2015, GRANTZAU_2016, DONIN_2019, DONIN_2016],
  }),

  term({
    id: "second-primary-thyroid-after-neck-radiotherapy",
    name: "Thyroid cancer after neck radiotherapy, and whether to look for it",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Radiation-induced thyroid cancer", "Thyroid surveillance after radiotherapy", "Differentiated thyroid cancer in survivors"],
    wikipedia: W("Thyroid_cancer"),
    tags: T(["thyroid", "radiotherapy", "screening"]),
    tldr: "The thyroid is among the most radiation-sensitive tissues there is, and neck or upper chest radiotherapy raises the risk of thyroid cancer for decades. Whether to look for it is genuinely unsettled: the international guideline panel compared ultrasound against feeling the neck, found neither better, and wrote a decision aid instead of a recommendation.",
    summary: `What is offered. An annual thyroid function blood test after neck or upper chest radiotherapy, which is for underactive thyroid rather than for cancer and is far more often abnormal. For thyroid cancer itself, what is offered differs by country and by clinic, and the honest answer is that the question has not been settled.

The risk, where it has been measured in adults. In the meta-analysis of 22 population-based studies of women treated for breast cancer, the standardised incidence ratio for thyroid cancer in irradiated women at fifteen years or more was 3.15; in unirradiated women the overall figure was 1.21 with no remaining excess beyond ten years. The earlier meta-analysis of 13 studies found no significant association between radiotherapy and second thyroid cancer at five years or more, so two analyses by the same authors differ depending on how long the women were followed. That disagreement is the state of the evidence, not a mistake in reading it.

Why looking is harder than it sounds. Thyroid cancer is the clearest example in oncology of a disease that can be found more often without anyone living longer. Ultrasound of an irradiated neck finds small nodules in a large fraction of people; most are not cancer, and many of the cancers found would never have caused symptoms. Against that sits the fact that a differentiated thyroid cancer found late is harder to treat than one found early.

What the guideline actually says. The International Late Effects of Childhood Cancer Guideline Harmonization Group, with the PanCareSurFup Consortium, assembled 33 experts to settle this for survivors of childhood, adolescent and young adult cancer. Their finding was that of the two available surveillance strategies, thyroid ultrasound and neck palpation, "neither was shown to be superior". Rather than recommend one, they produced a decision aid to guide the clinician in counselling the survivor, and the recommendations "highlight the need for shared decision making regarding whether to undergo surveillance for DTC and in the choice of surveillance modality". A guideline that declines to recommend, and says why, is more useful than one that picks a side it cannot defend.

What this means for an adult treated as an adult. That guideline covers people treated as children, adolescents or young adults. For someone irradiated to the neck at fifty, no equivalent guideline exists, the risk is lower because age at exposure lowers it, and the default in most health systems is no thyroid cancer surveillance at all. A lump in the neck, a change in the voice, or difficulty swallowing are the reasons to be examined, in a survivor as in anyone else.`,
    cancers: ["thyroid", "hodgkin-lymphoma", "breast-cancer", "head-and-neck"],
    terms: ["secondary-malignancy", "second-cancers-after-radiotherapy", "late-effects"],
    technologies: ["ultrasound", "survivorship-care-plan"],
    bottlenecks: ["b-overdiagnosis", "b-survivorship", "b-early-detection"],
    related: ["rejuv-second-screening-after-treatment-compared", "rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-cancers-overview"],
    links: [CLEMENT_2018, GRANTZAU_2016, GRANTZAU_2015, COG_LTFU],
  }),

  term({
    id: "second-primary-sarcoma-in-the-treated-field",
    name: "Sarcoma in the radiotherapy field, and angiosarcoma of the treated breast",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Radiation-associated sarcoma", "Radiation-induced sarcoma", "Angiosarcoma after breast radiotherapy", "Cahan criteria"],
    wikipedia: W("Angiosarcoma"),
    tags: T(["sarcoma", "radiotherapy"]),
    tldr: "A sarcoma arising in tissue that was irradiated is uncommon, appears after about seven years or more, and is recognised by where it is rather than by any test. In the treated breast it most often takes the form of angiosarcoma, and because it can look like a bruise or a cluster of reddish-blue nodules it is the one second cancer a person might reasonably mistake for something harmless.",
    summary: `What to do about it. There is no screening for this and no blood test. The whole of the answer is recognising it: any new lump, thickening, bruise-like patch or cluster of reddish or bluish nodules in skin or tissue that was irradiated, appearing years after treatment, is a reason to be seen rather than watched. Treatment is surgical and is planned at a sarcoma centre, which is a referral worth asking for by name.

How it is defined. The criteria have been in use since Cahan's 1948 report of eleven cases of sarcoma in irradiated bone: the tumour arises in a field that was irradiated, after a latent period, and is histologically different from the cancer that was treated. The definition is positional, which is why knowing the field matters more here than for any other second cancer.

How often, after breast cancer. In a nationwide Finnish registry study, 132,512 women were diagnosed with invasive breast cancer between 1953 and 2014; a subsequent sarcoma was recorded in 355, and after review and exclusion 96 were confirmed as radiation-associated sarcoma at or close to the treated volume. Angiosarcoma was the commonest histology, 50 of the 96 (52 per cent), and its share rose steadily across the six decades studied as breast-conserving surgery with radiotherapy replaced mastectomy. The five-year sarcoma-specific survival among those treated with curative intent was 75.1 per cent.

How it has changed shape. In a population-based cohort from southern Sweden covering 1958 to 2008, 31 angiosarcomas developed after breast cancer, at a median age of 71. They fell into two groups. Fourteen women treated by radical mastectomy and radiotherapy between 1949 and 1988 developed angiosarcoma in a swollen arm, the pattern named Stewart-Treves syndrome, after a median of 11 years. Seventeen treated by segmental resection, anti-hormonal treatment and radiotherapy between 1980 and 2005 developed it in the irradiated field on the chest wall after a median of 7.3 years. The authors record that "the clinical presentations were heterogeneous and included hematoma-like lesions, multiple bluish-reddish nodules, and asymptomatic lumps". Overall five-year survival in that cohort was 16 per cent, in a group with a median age of 71 treated between 1958 and 2008; half of those counted lived longer, and the Finnish series treated with curative intent did considerably better.

The size of the risk, in context. In the meta-analysis of 762,468 women treated for breast cancer, radiotherapy was associated with second sarcoma at a relative risk of 2.53 (95% CI 1.74 to 3.70) at five or more years. Against general-population rates, the standardised incidence ratio for sarcoma in irradiated women at ten years or more was 6.54, while unirradiated women had an overall figure of 1.42 with no excess remaining after ten years. A relative risk of that size still describes a rare event: these are tens of cases in cohorts of a hundred thousand women.

The honest tension. Breast radiotherapy reduces local recurrence and improves survival; this is one of the costs on the other side of that ledger, and it is a small one. The reason to write it down is not to change the decision but so that a woman who finds a bruise-like patch on an irradiated chest wall eight years later knows to have it looked at.`,
    cancers: ["sarcoma", "angiosarcoma", "breast-cancer"],
    terms: ["secondary-malignancy", "second-cancers-after-radiotherapy", "late-effects"],
    technologies: ["survivorship-care-plan"],
    bottlenecks: ["b-rare-cancers", "b-survivorship", "b-early-detection"],
    related: ["rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-cancers-overview", "rejuv-second-screening-after-treatment-compared"],
    links: [SALMINEN_2018, STYRING_2010, GRANTZAU_2015, GRANTZAU_2016, CAHAN_1948],
  }),

  term({
    id: "second-primary-bowel-after-abdominal-radiotherapy",
    name: "Bowel cancer after abdominal and pelvic radiotherapy",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Rectal cancer after prostate radiotherapy", "Colorectal cancer after pelvic radiotherapy", "Bowel surveillance after abdominal radiotherapy"],
    wikipedia: W("Colonoscopy"),
    tags: T(["colorectal", "radiotherapy", "screening"]),
    tldr: "Radiotherapy to the abdomen or pelvis raises the risk of cancer in the bowel that sat in the field, and the risk is confined to the irradiated segment. For adults no country runs an organised colonoscopy programme afterwards, so bleeding or a change in bowel habit years later should be investigated rather than put down to the old treatment.",
    summary: `What is offered. The ordinary national bowel screening programme, which in England invites people from age 50, and investigation of symptoms. Colonoscopy surveillance on the basis of previous abdominal or pelvic radiotherapy is recommended in the long-term follow-up guidelines for people treated as children, and is covered on this front by the record on paediatric survivorship; for adults treated as adults, there is no equivalent organised programme in the United Kingdom, the United States or Europe. That is a gap rather than a decision against it, and it is worth naming as one.

The strongest evidence that the field is what matters. A SEER cohort compared 30,552 men treated with radiotherapy for prostate cancer with 55,263 treated by surgery alone, between 1973 and 1994, all of whom survived at least five years. Colorectal cancers developed in 1,437 men. The analysis split the bowel into three: definitely irradiated sites (the rectum), potentially irradiated sites (rectosigmoid, sigmoid and caecum) and non-irradiated sites (the rest of the colon), with 267, 686 and 484 cancers respectively. The adjusted hazard ratio for rectal cancer in the radiotherapy group against the surgery-only group was 1.7 (95% CI 1.4 to 2.2). Radiation had no effect on the rest of the colon. The authors' own conclusion is that the effect "is specific to directly irradiated tissue".

The pooled picture. A meta-analysis of 21 observational studies of prostate radiotherapy found raised risks of colorectal cancer (adjusted hazard ratio 1.79, 1.34 to 2.38) and rectal cancer (1.79, 1.34 to 2.38) against men not irradiated. Absolute rates reported across the included studies ranged from 0.3 to 4.2 per cent for colorectal and 0.3 to 1.2 per cent for rectal cancer, a spread the authors attribute to differences in follow-up and study quality. External beam radiotherapy was consistently associated with raised odds; brachytherapy was not, which is a difference with a plausible dosimetric explanation and a practical one for a man choosing between them.

Beyond prostate cancer. In the cohort of 40,576 one-year survivors of testicular cancer from fourteen registries covering 1943 to 2001, among whom 2,285 second solid cancers were recorded, the relative risk of colon cancer was 2.0 (1.7 to 2.5) and of stomach cancer 4.0 (3.2 to 4.8); cancers of the lung, colon, bladder, pancreas and stomach together accounted for almost 60 per cent of the total excess. Those men were treated with infradiaphragmatic radiotherapy fields that are rarely used now, and surveillance or carboplatin has replaced adjuvant radiotherapy for most stage I seminoma.

What a reader should take from this. Not a demand for a colonoscopy, which no guideline currently supports for an adult on this basis alone. But a change in bowel habit, blood in the stool or new abdominal pain in someone who had pelvic radiotherapy a decade or more ago is not something to attribute to radiation proctitis without looking. Late bowel effects of radiotherapy are real and are covered on their own record on this front; they are also the commonest reason a second cancer in the same tissue is explained away.`,
    cancers: ["colorectal", "prostate", "testicular", "seminoma", "cervical", "endometrial"],
    terms: ["secondary-malignancy", "second-cancers-after-radiotherapy", "late-effects"],
    technologies: ["colonoscopy", "brachytherapy", "survivorship-care-plan"],
    bottlenecks: ["b-survivorship", "b-early-detection", "b-care-fragmentation"],
    related: ["rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-screening-after-treatment-compared", "rejuv-second-cancers-overview", "rejuv-second-choices-made-at-treatment"],
    links: [BAXTER_2005, WALLIS_2016, TRAVIS_TESTIS_2005, COG_LTFU],
  }),

  term({
    id: "second-primary-bladder-after-cyclophosphamide",
    name: "Bladder cancer after cyclophosphamide",
    category: "Side effects",
    sections: SEC,
    aka: ["Cyclophosphamide bladder cancer", "Haemorrhagic cystitis and bladder cancer", "Acrolein bladder injury"],
    wikipedia: W("Cyclophosphamide"),
    tags: T(["bladder", "chemotherapy"]),
    tldr: "Cyclophosphamide is one of the few cancer drugs that has been shown to cause a specific solid cancer, in the bladder, and the risk depends steeply on the total dose given. Blood in the urine years after treatment with it is a reason to be investigated rather than reassured, and the cumulative dose on your treatment summary is what tells you where you sit.",
    summary: `What to do about it. There is no bladder screening programme for people who have had cyclophosphamide anywhere. Visible blood in the urine, or blood found on a dip test, at any point after treatment, is the signal, and it should be investigated as it would be in anyone else rather than attributed to old treatment. During treatment, generous hydration and the protective drug mesna reduce the acute bladder injury; whether they reduce the later cancer risk has not been shown.

The dose relationship, measured. Within a cohort of 6,171 people who survived at least two years after non-Hodgkin lymphoma, 48 who developed a second cancer of the urinary tract were matched to 136 controls with lymphoma who did not. Cyclophosphamide therapy carried a 4.5-fold risk of bladder cancer (95% CI 1.5 to 13.6), and the risk depended on the cumulative dose. Below 20 g in total, the risk was 2.4-fold and not statistically significant. At 20 to 49 g it was 6.0-fold (1.3 to 29) and at 50 g or more it was 14.5-fold (2.3 to 94), with a trend across dose groups at P = .004.

In absolute terms. The same analysis put it in a form a person can use: for patients given cumulative doses between 20 and 49 g, "the absolute risk of bladder cancer is on the order of three excess cancers per 100 NHL patients after 15 years of follow-up", and at 50 g or more "the excess risk increases to approximately seven excess bladder cancers per 100 NHL patients". Radiotherapy given without cyclophosphamide carried a non-significant increase, and the risk from both together was as expected if the individual excesses were added. Neither radiotherapy nor cyclophosphamide was associated with any excess of kidney cancer.

Why the bladder in particular. Cyclophosphamide is broken down to acrolein, which concentrates in urine and injures the bladder lining; this is the same mechanism as the haemorrhagic cystitis seen acutely at high doses. The mutation pattern in cyclophosphamide-associated bladder tumours differs from that in smoking-related and in schistosomiasis-related bladder cancer, which is one line of evidence that the drug and not a shared cause is responsible.

What the authors asked for. The paper's conclusion goes beyond its own data in a way worth reproducing: "The strong dose-response relationship and high absolute risk of bladder cancer underscore the importance of limiting the cumulative dose of cyclophosphamide to what is required to achieve therapeutic end points", and "long-term side effects of therapy that might be acceptable in cancer treatment may need to be re-evaluated for patients with non-neoplastic disorders". Cyclophosphamide is used in lupus, vasculitis and nephrotic syndrome as well as in cancer, and the dose relationship does not change when the indication does.

Where the dose comes from. Standard adjuvant breast cancer regimens give cumulative cyclophosphamide well below the 20 g threshold in this study; prolonged use in lymphoma, in autoimmune disease or in older regimens can exceed it. A treatment summary that records the regimen, the number of cycles and the dose per cycle is what allows that to be worked out, and a late-effects clinic or the treating centre can usually reconstruct it from the records.`,
    cancers: ["urothelial", "non-hodgkin-lymphoma", "breast-cancer"],
    drugs: ["cyclophosphamide"],
    terms: ["secondary-malignancy", "late-effects"],
    technologies: ["cytotoxic-chemotherapy", "survivorship-care-plan"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship", "b-dose-optimisation"],
    related: ["rejuv-second-alkylating-agents-and-myeloid-neoplasms", "rejuv-second-cancers-overview", "rejuv-second-choices-made-at-treatment"],
    links: [TRAVIS_BLADDER_1995, DONIN_2016],
  }),

  term({
    id: "second-primary-skin-cancer-after-cancer-treatment",
    name: "Skin cancer after cancer treatment",
    category: "Epidemiology & prevention",
    sections: PREV,
    aka: ["Basal cell carcinoma after radiotherapy", "Skin cancer in survivors", "Keratinocyte cancer after treatment"],
    wikipedia: W("Skin_cancer"),
    tags: T(["skin", "radiotherapy", "screening"]),
    tldr: "Skin cancer is the commonest second cancer after almost any treatment, and the commonest one left out of the counts, because registries record non-melanoma skin cancers inconsistently or not at all. Most are basal cell carcinomas, most are curable when treated, and the practical answer is to look at irradiated skin and to have anything that bleeds, crusts or does not heal in six weeks examined.",
    summary: `What to do about it. No country screens survivors' skin as a programme. What is offered instead is advice and access: knowing that skin inside an old radiotherapy field is the highest-risk area, protecting it from the sun, and having any new, changing or non-healing lesion looked at by a general practitioner or dermatologist. A survivor of transplant or on long-term immunosuppression has a different and larger risk, which belongs to the transplant facet of this round.

Why the numbers are unreliable, stated plainly. Basal cell carcinoma and cutaneous squamous cell carcinoma are the commonest cancers in fair-skinned populations and are either excluded from cancer registries or recorded only partially, including in SEER, which is the source of most second cancer statistics. The large cohort studies of second cancers after radiotherapy therefore count solid cancers while leaving out the commonest one. Any figure for how many survivors develop a skin cancer is an undercount, and this record would rather say that than reproduce a number whose denominator is wrong.

What is known about the radiation field. Radiation-associated keratinocyte cancers arise in irradiated skin, as the sarcomas do, and the relationship is positional in the same way. The corpus holds a record on second primary skin cancers after a first keratinocyte cancer, which is a different and much larger effect driven by ultraviolet damage across the whole exposed surface rather than by treatment; the record on field cancerisation explains why one skin cancer predicts the next. Both apply to survivors as they do to anyone else, on top of any radiotherapy effect.

The practical list. The lesions that warrant a look are a sore that does not heal within about six weeks, a lump that bleeds or crusts repeatedly, a scaly patch that persists, a mole that changes in size, shape or colour, and any new growth inside the borders of an old radiotherapy field, including inside a tattoo mark used for treatment set-up. Basal cell carcinoma, the commonest of these, grows slowly and is cured by local treatment in the great majority of cases; the reason to act early is that a small one is treated with a smaller operation.

The gap. There is no trial of skin surveillance in cancer survivors, no guideline that recommends it as a programme, and no measure of whether a yearly skin check in this group would find anything that mattered. That is the state of the evidence rather than a recommendation against looking.`,
    cancers: ["basal-cell-carcinoma", "cutaneous-scc", "melanoma", "hodgkin-lymphoma"],
    terms: ["second-primary-skin-cancer", "field-cancerisation", "secondary-malignancy", "second-cancers-after-radiotherapy", "late-effects"],
    technologies: ["survivorship-care-plan"],
    bottlenecks: ["b-early-detection", "b-survivorship", "b-data-silos"],
    related: ["rejuv-second-radiotherapy-dose-field-and-age", "rejuv-second-what-is-not-a-second-cancer", "rejuv-second-cancers-overview"],
    links: [BERRINGTON_2011, NCI_SURVIVORSHIP],
  }),
];

// =============================================================================
// 3. THE SCREENING THAT FOLLOWS
// =============================================================================
const screening: TermInput[] = [
  term({
    id: "rejuv-second-uk-very-high-risk-breast-screening",
    name: "The UK very high risk breast screening protocol after chest radiotherapy",
    category: "Clinical",
    sections: PREV,
    aka: ["NHS very high risk breast screening", "VHR breast screening", "BARD", "Breast screening after radiotherapy"],
    wikipedia: W("Breast_cancer_screening"),
    tags: T(["breast", "screening", "uk"]),
    tldr: "England runs a named screening programme for women who had radiotherapy to breast tissue when young, with exact ages and tests set out in its own documents. Surveillance begins at 25 or 30 depending on your age when irradiated, or eight years after the radiotherapy, whichever is later, and referral runs through a national dataset.",
    summary: `Who is eligible. The NHS Breast Screening Programme's very high risk pathway includes women who received radiotherapy to breast tissue during treatment for Hodgkin or non-Hodgkin lymphoma between the ages of 10 and under 36, and a smaller number who received radiotherapy to breast tissue for cancers other than lymphoma. The programme states that testing "is not applicable" to females irradiated below the age of 10.

The protocol, exactly as published. For females irradiated between the ages of 10 and under 20: annual magnetic resonance imaging from 25 to under 40, annual MRI plus mammography from 40 to under 51, and annual mammography with or without MRI from 51 to under 71. "Surveillance starts at age 25 or 8 years after first irradiation, whichever is the later." For females irradiated between the ages of 20 and under 36: annual MRI from 30 to under 40, annual MRI plus mammography from 40 to under 51, and annual mammography with or without MRI from 51 to under 71, with surveillance starting "at age 30 or 8 years after first irradiation, whichever is the later". Women over 70 who meet the eligibility criteria may be referred through the standard routes, have an initial MRI plus mammography density review, and thereafter self-refer annually if they wish to continue.

How a woman gets on the list. Referral for this group runs through BARD, the breast screening after radiotherapy dataset. BARD identifies women in England below the age of 36 treated with radiotherapy for lymphoma to sites involving breast tissue by taking cancer registry records and cross-matching them against information held at radiotherapy treatment centres and the national radiotherapy dataset. Where eligibility is confirmed, a referral form goes to the local breast screening service; where the woman is below the age of eligibility, her details are held for invitation at the right age. Oncologists wishing to refer a woman irradiated for a cancer other than lymphoma are directed to complete a BARD non-lymphoma referral form and send it to BARD to confirm eligibility.

Two things the programme says about its own limits. Where a woman meets more than one criterion, for example a BRCA1 variant and radiotherapy to breast tissue at 15, the guidance states that her protocol "should be determined on a case by case basis and reviewed by a consultant radiologist, consultant practitioner or breast clinician" rather than by a rule. And on total body irradiation before a transplant, the guidance records that these women "are at an elevated risk of breast cancer in the years following treatment" and that NHS England "will review the evidence to determine if previous TBI reaches the eligibility threshold for the VHR screening programme". That is a national programme naming a group it does not yet cover, which is more useful than a confident answer would be.

If you think you should be on it and are not. The guidance gives a route: "If a woman had radiotherapy involving breast tissue below the age of 36 years but it is unclear if she is eligible for very high risk screening within the NHS BSP, contact BARD for advice", with a named NHS address on the published page. The corpus record on Hodgkin survivorship screening describes the NHS England recall of women treated before 2003 who should have been referred and may not have been, which is the reason this paragraph exists.

What this covers and what it does not. This is England. The other UK nations run their own programmes with similar but separately published protocols. It covers breast tissue only: a woman irradiated to the chest also has the lung, thyroid and sarcoma risks covered on their own records here, and none of those has a programme attached.`,
    cancers: ["breast-cancer", "hodgkin-lymphoma", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-living-hodgkin-survivorship-screening", "secondary-malignancy", "second-cancers-after-radiotherapy"],
    technologies: ["mri", "mammography", "survivorship-care-plan"],
    bottlenecks: ["b-early-detection", "b-survivorship", "b-care-fragmentation"],
    related: ["second-primary-breast-after-chest-radiotherapy", "rejuv-second-screening-after-treatment-compared", "rejuv-second-cancers-overview"],
    links: [GOVUK_VHR_PROTOCOL, GOVUK_VHR_GUIDANCE],
  }),

  term({
    id: "rejuv-second-screening-after-treatment-compared",
    name: "Screening survivors: where the UK, American and European answers differ",
    category: "Clinical",
    sections: PREV,
    aka: ["Survivorship screening guidelines", "Late effects surveillance", "BETER consortium", "Risk-based survivorship care"],
    wikipedia: W("Cancer_screening"),
    tags: T(["screening", "survivorship"]),
    tldr: "Three systems have built screening for survivors and they do not agree. England runs an organised programme with fixed ages and automatic referral; the United States issues a guideline and leaves the arranging to the patient; the Netherlands runs a national survivorship clinic network. They differ on when to start and whom to include.",
    summary: `Breast, after chest radiotherapy: the clearest disagreement. The American Cancer Society recommends annual breast MRI plus mammogram for women at high risk "typically starting at age 30", and lists among that group women who "had radiation therapy to the chest before they were 30 years old". England screens women who had radiotherapy to breast tissue between 10 and under 36, starts at 25 for those irradiated between 10 and under 20 and at 30 for those irradiated between 20 and under 36, and in both cases not before eight years after the first irradiation. So the two differ on three things at once: the upper age of exposure that qualifies (30 in the American guideline, under 36 in England), the age at which screening begins (30 against 25 or 30), and whether a latency rule applies (England yes, the American guideline no). A woman irradiated at 33 qualifies in England and does not meet the American criterion as written.

How the arranging differs, which matters more than the ages. England identifies eligible women centrally by cross-matching cancer registry and radiotherapy records through BARD and sends a referral to the local screening service. The American guideline states that "the decision to follow this guideline should be made with a woman's healthcare providers, taking into account her personal circumstances and preferences", which puts the burden of knowing the guideline exists on the woman and her clinician. An organised programme catches people who do not know they are at risk; a guideline does not.

The Dutch model, and what it found about itself. The BETER consortium runs a nationwide survivorship care programme for survivors of Hodgkin lymphoma from five years after diagnosis, offering risk-based screening for and treatment of late effects. The INSIGHT study compared survivors who received BETER care from 2013 to 2016 (n = 251) with matched survivors who did not receive survivorship care until 2019 to 2024 (n = 119), at a median of about 25 years from diagnosis. Health-related quality of life showed no significant differences between the groups, and overall matched that of the Dutch general population. Knowledge of late effects "was suboptimal in both groups, and distress levels were similarly low". Eighty per cent of survivors perceived BETER care as beneficial, "with most individuals stating that increased knowledge outweighed potential worries". A national programme that publishes a null result about its own effect on quality of life is doing the thing this site asks of a source.

Thyroid: a guideline that declines to recommend. The International Late Effects of Childhood Cancer Guideline Harmonization Group with PanCareSurFup compared thyroid ultrasound against neck palpation for survivors of childhood, adolescent and young adult cancer and found that "neither was shown to be superior", producing a decision aid and a recommendation for shared decision making instead of a protocol.

Bowel: a recommendation for one group and silence for the other. Colonoscopy surveillance after abdominal or pelvic radiotherapy is part of the long-term follow-up guidelines for people treated as children. For adults treated as adults, no organised colonoscopy programme exists on this basis in the United Kingdom, the United States or Europe, and the national bowel screening programmes invite survivors on the same terms as everyone else.

Lung and skin: no programme anywhere. Lung cancer screening is offered on smoking history, not on treatment history, even though measured second-primary lung cancer rates in survivors of some head and neck cancers exceed the rate in the control arm of the trial that established screening works. No country screens survivors' skin.

What is shared. All three systems agree that the person needs a written treatment summary listing what they were given, at what dose and to what part of the body, and that without it none of the above can be applied. The corpus record on survivorship care plans covers what that document should contain.

What nobody has shown. No randomised trial has shown that any survivorship screening programme reduces death from a second cancer. The breast programme rests on the size of the measured risk and on the general evidence that MRI finds breast cancer earlier in high-risk women, not on a trial in irradiated survivors, and there will not be one. That is the honest basis of a programme worth being enrolled in.`,
    cancers: ["hodgkin-lymphoma", "breast-cancer", "thyroid", "colorectal", "lung-cancer"],
    terms: ["lymphoma-living-hodgkin-survivorship-screening", "secondary-malignancy", "late-effects"],
    technologies: ["survivorship-care-plan", "mri", "mammography", "colonoscopy", "low-dose-ct-screening"],
    bottlenecks: ["b-early-detection", "b-survivorship", "b-care-fragmentation", "b-regulatory-fragmentation"],
    related: ["rejuv-second-uk-very-high-risk-breast-screening", "second-primary-breast-after-chest-radiotherapy", "second-primary-thyroid-after-neck-radiotherapy", "second-primary-bowel-after-abdominal-radiotherapy", "second-primary-lung-after-chest-radiotherapy", "rejuv-second-cancers-overview"],
    links: [ACS_SCREENING, SASLOW_2007, GOVUK_VHR_PROTOCOL, LAMMERS_2025, CLEMENT_2018, COG_LTFU],
  }),
];

// =============================================================================
// 4. FROM CLONE TO DISEASE
// =============================================================================
const clone: TermInput[] = [
  term({
    id: "rejuv-second-from-clone-to-disease",
    name: "From a clone in the blood to a leukaemia: what is known, and what is done",
    category: "Clinical",
    sections: SEC,
    aka: ["CHIP progression", "Clonal haematopoiesis and therapy-related myeloid neoplasm", "Clonal haematopoiesis risk score"],
    wikipedia: W("Clonal_hematopoiesis"),
    tags: T(["blood", "biomarker"]),
    tldr: "Chemotherapy and radiotherapy select for blood stem cells carrying particular mutations, and in a small minority one of those clones becomes a leukaemia. The wave-one record on this front covers the selection; this one covers the step from clone to disease, which is where the useful question sits: most clones never progress, and nothing has been shown to stop one that does.",
    summary: `What is done about it today. Outside a research study, almost nothing, and that is the finding rather than an omission. There is no treatment shown to clear a clone, no trial showing that finding one and acting on it changes an outcome, and no guideline recommending that people be tested for it after cancer treatment. What a result does change, where one exists already, is the threshold for investigating an unexplained blood count and the weight given to alkylator exposure if further treatment is being chosen. The wave-one record on clonal haematopoiesis after cancer treatment, linked below, covers how treatment selects these clones in the first place and is not repeated here.

The step from clone to disease, measured. A case-control study at MD Anderson compared people treated for a cancer who later developed a therapy-related myeloid neoplasm with people treated for lymphoma who did not. Of 14 cases, clonal haemopoiesis was detected in pre-treatment peripheral blood in 10 (71 per cent); of 54 age-matched controls, in 17 (31 per cent). The five-year cumulative incidence of a therapy-related myeloid neoplasm was 30 per cent (95% CI 16 to 51) in people with clonal haemopoiesis against 7 per cent (2 to 21) in those without (p = 0.016). In an independent cohort of 143 lymphoma patients from a randomised front-line chemotherapy trial, five of 74 (7 per cent) developed a therapy-related myeloid neoplasm, of whom four (80 per cent) had clonal haemopoiesis, against 11 of 69 (16 per cent) among those who did not. These are small numbers, from one centre, in people selected for having stored pre-treatment blood.

How much risk a clone carries in general. Away from cancer treatment, the question has been answered at scale. Sequenced exomes from 438,890 UK Biobank participants were used to derive and validate a clonal haematopoiesis risk score. Across people with clonal haematopoiesis of indeterminate potential or clonal cytopenia of undetermined significance, ten-year probabilities of developing a myeloid neoplasm ranged from 0.0078 to 0.85, depending on which gene was mutated, how many mutations there were, the variant allele fraction, age, the presence of a cytopenia and the red cell indices. The score sorted people into low risk (10,018, 88.4 per cent), intermediate (1,196, 10.5 per cent) and high risk (123, 1.1 per cent), and most myeloid neoplasms in independent clinical cohorts occurred in the high-risk minority. The authors' framing is that the score "distinguishes a high risk minority from the majority of CHIP/CCUS which has minimal risk for progression to MN".

The limit that matters here. That score was derived in a general population, not in people who have had cancer treatment. The mutations that cytotoxic therapy selects for, in the DNA-damage genes TP53, PPM1D and CHEK2, are not the ones that dominate age-related clonal haematopoiesis, and a score trained on the latter is not known to transfer. Applying it to a survivor is an extrapolation, and anyone quoting a ten-year risk to a survivor from it should say so.

Why anyone would test at all. Two reasons, neither of them yet an indication. First, a clone found before treatment identifies a group in whom a different regimen might be preferred, which is testable and has not been tested. Second, when a therapy-related myeloid neoplasm does appear, the same mutation can usually be found in the pre-treatment sample, which establishes that the clone preceded the disease rather than arising from it. The clinical consequence of a positive test in a well person is, at present, closer to worry than to action, and a test that produces a result nobody knows how to act on is one to think about before ordering.

What would change this. A trial that enrols people with a high-risk clone after cancer treatment and randomises an intervention against observation. None has reported. Until one does, the honest position is that clonal haematopoiesis explains part of the second cancer risk and does not yet reduce it.`,
    cancers: ["aml", "mds", "aml-secondary", "non-hodgkin-lymphoma"],
    pathways: ["clonal-haematopoiesis"],
    terms: ["secondary-malignancy", "late-effects"],
    technologies: ["wes-wgs", "survivorship-care-plan"],
    bottlenecks: ["b-biomarker-validation", "b-survivorship", "b-overdiagnosis"],
    related: ["rejuv-age-clonal-haematopoiesis-after-therapy", "rejuv-second-alkylating-agents-and-myeloid-neoplasms", "rejuv-second-topoisomerase-inhibitors-short-latency", "rejuv-second-cancers-overview"],
    links: [TAKAHASHI_2017, WEEKS_2023, MORTON_2019],
  }),
];

// =============================================================================
// 5. WHAT IS NOT A SECOND CANCER
// =============================================================================
const definitions: TermInput[] = [
  term({
    id: "rejuv-second-what-is-not-a-second-cancer",
    name: "What is not a second cancer: recurrence, metastasis and field cancerisation",
    category: "Clinic basics",
    sections: SEC,
    aka: ["Second cancer versus recurrence", "New primary or metastasis", "Contralateral cancer"],
    wikipedia: W("Metastasis"),
    tags: T(["late-effects"]),
    tldr: "Four different things get called the same thing in conversation and in the news, and the difference changes what the news means. A second cancer is a new disease with its own stage and its own chance of cure. A recurrence is the first one back. A metastasis is the first one somewhere else. Field cancerisation is a whole area of tissue that was already changed before any of them.",
    summary: `Why the distinction is the first question to ask. When something new is found in a person who has had cancer, the answer to "is this the old one or a new one" decides the stage, the treatment and the outlook. A new, early, localised cancer in someone treated five years ago may be curable; the same tumour called a recurrence of a treated cancer is a different situation entirely. Pathology, imaging and sometimes molecular comparison of the two tumours decide it, and it is a reasonable question to ask the team directly: is this a new primary, or the old one.

A second primary cancer. A new cancer, arising from different cells, with a different histology or in a different organ, counted by cancer registries as a separate diagnosis under published multiple-primary rules. It is staged on its own, treated on its own and has its own prognosis. This file is about these.

A recurrence. The first cancer returning, locally, regionally or at a distance, after a period when it could not be detected. It carries the identity of the first cancer, and a late recurrence of a hormone-receptor-positive breast cancer fifteen years on is still that breast cancer. The corpus glossary entries on recurrence and on late recurrence, linked below, cover this.

A metastasis. The first cancer growing somewhere else. Breast cancer cells in the lung are breast cancer in the lung, not lung cancer, and they are treated as breast cancer. This is the confusion that appears most often in news reporting about public figures.

Field cancerisation. The idea, described by Slaughter in 1953 from oral squamous epithelium, that a whole region of tissue exposed to a carcinogen is altered before any tumour appears, so that multiple cancers arise independently from the same changed field. It explains why a head and neck cancer caused by smoking and alcohol is followed by another one in the same mucosa, and why one sun-damaged patch of skin produces a succession of keratinocyte cancers. The resulting second tumours are genuinely new primaries, but their cause is the shared field rather than the treatment. The corpus record on field cancerisation, linked below, covers the biology.

The hard case: the other side of a paired organ. A cancer in the opposite breast, kidney, lung or testis is a new primary, not a recurrence, and is usually treated as one. The numbers are instructive. Among 29,515 American men diagnosed with testicular cancer between 1973 and 2001, 175 presented with a synchronous cancer in the other testis and 287 developed one later, an observed-to-expected ratio of 12.4 (95% CI 11.0 to 13.9) and a 15-year cumulative risk of 1.9 per cent (1.7 to 2.1). Ten-year overall survival after a metachronous contralateral testicular cancer was 93 per cent (88 to 96), and after a synchronous one 85 per cent (78 to 90). A twelvefold relative risk and a 1.9 per cent absolute risk are the same finding stated two ways, and the survival figures are why that study supported not biopsying the other testis routinely.

The practical consequence. If a report says someone's cancer has "spread to the brain", that is metastasis. If it says they have "developed brain cancer", those are different claims and usually one of them is wrong. If a survivor is told they have a second cancer, the right next questions are which organ it started in, what stage it is, and whether it is being treated with the aim of cure, because the answers are frequently better than the phrase suggests.`,
    terms: ["relapse-recurrence", "metastasis", "late-recurrence", "field-cancerisation", "secondary-malignancy", "second-primary-skin-cancer"],
    cancers: ["testicular", "seminoma", "head-and-neck", "breast-cancer"],
    technologies: ["survivorship-care-plan"],
    bottlenecks: ["b-knowledge-diffusion", "b-misinformation", "b-survivorship"],
    related: ["rejuv-second-cancers-overview", "second-primary-skin-cancer-after-cancer-treatment", "rejuv-second-screening-after-treatment-compared"],
    links: [SLAUGHTER_1953, FOSSA_2005, TRAVIS_TESTIS_2005, NCI_SURVIVORSHIP],
  }),
];

// =============================================================================
// 6. CHOICES MADE AT THE TIME OF TREATMENT
// =============================================================================
const choices: TermInput[] = [
  term({
    id: "rejuv-second-choices-made-at-treatment",
    name: "Choices made at the time of treatment that change the second cancer risk",
    category: "Clinical",
    sections: SEC,
    aka: ["De-escalation and late effects", "Treatment choice and second cancers", "Omitting radiotherapy"],
    wikipedia: W("Radiation-induced_cancer"),
    tags: T(["radiotherapy", "chemotherapy"]),
    tldr: "Some of this risk is a decision rather than a fate. Where two treatments cure equally well and one carries less late risk, that is a conversation to have before treatment starts. Trials have settled several: a different partner drug in myeloma, a lower cyclophosphamide dose in breast cancer, brachytherapy rather than external beam.",
    summary: `How to use this. These are decisions made with the treating team before or during treatment, not afterwards, and in every case the first question is whether the two options really do cure equally well for the particular disease in front of you. Curing the cancer is the priority and none of what follows changes that. Where there is a real choice, the question worth asking is: does this option change my risk of a second cancer, and by how much.

Myeloma: the partner drug. The individual-patient meta-analysis of 3,218 patients found that lenalidomide with oral melphalan raised the risk of a haematological second cancer against melphalan alone with a hazard ratio of 4.86 (95% CI 2.79 to 8.46, p < 0.0001), while lenalidomide with cyclophosphamide (1.26, 0.30 to 5.38) and lenalidomide with dexamethasone (0.86, 0.33 to 2.24) did not. The authors concluded that "alternatives, such as cyclophosphamide or alkylating-free combinations, should be considered instead of oral melphalan in combination with lenalidomide for myeloma". The same drug, a different partner, a fourfold difference in risk.

Breast cancer: the cyclophosphamide dose. In the pooled NSABP adjuvant trials, intensified cyclophosphamide at 2,400 mg/m2 with growth factor support gave a five-year cumulative incidence of acute myeloid leukaemia or myelodysplastic syndrome of 1.01 per cent (0.63 to 1.62) against 0.21 per cent (0.11 to 0.41) with standard doxorubicin and cyclophosphamide. Dose intensification did not become standard, and this is part of why.

Prostate cancer: the radiotherapy modality. In the meta-analysis of 21 studies, external beam radiotherapy was consistently associated with raised odds of a second bladder or bowel cancer while brachytherapy was not. Both are offered for appropriate localised disease, and the difference is one input into a choice that also turns on urinary, bowel and sexual function and on the stage.

Early Hodgkin lymphoma: whether to irradiate at all. The RAPID trial gave 602 patients with stage IA or IIA Hodgkin lymphoma three cycles of ABVD, then randomised the 420 who were PET-negative to involved-field radiotherapy or no further treatment. At a median 60 months, three-year progression-free survival was 94.6 per cent (95% CI 91.5 to 97.7) with radiotherapy and 90.8 per cent (86.9 to 94.8) without, an absolute difference of 3.8 percentage points (-8.8 to 1.3). The trial did not show non-inferiority of omitting radiotherapy on its own terms, and its conclusion was that these patients "had a very good prognosis either with or without consolidation radiotherapy". That is a real trade-off written down with both numbers: a few percentage points of early relapse risk against a radiation exposure whose cost is paid decades later.

And what the radiation actually costs, measured in the same trial. Individual dosimetry for the 144 PET-negative RAPID patients who received involved-field radiotherapy gave an average mean heart dose of 4.0 Gy (range 0.1 to 24.0) and an average bilateral common carotid artery dose of 21.5 Gy (0.6 to 38.1). The predicted 30-year radiation-related absolute excess cardiovascular mortality averaged 0.56 per cent (0.01 to 6.79), under 0.5 per cent in 67 per cent of patients and over 1 per cent in 15 per cent; the predicted excess incidence averaged 6.24 per cent (0.31 to 31.09), under 5 per cent in 58 per cent and over 10 per cent in 24 per cent. The authors' conclusion is the model for how this decision should be made: "Predicted excess cardiovascular risk is small for most patients, so radiotherapy may provide net benefit. However, for a minority of patients receiving high doses of radiation to cardiovascular structures, it may be preferable to consider advanced radiotherapy techniques to reduce doses or to omit radiotherapy and accept the increased relapse risk." Those figures are for cardiovascular disease, which has been modelled in more detail than second cancers have; the same logic and the same dosimetry apply.

Testicular cancer: surveillance instead of adjuvant treatment. The cohort of 40,576 testicular cancer survivors found raised second solid cancer risk after radiotherapy alone (relative risk 2.0, 1.9 to 2.2), chemotherapy alone (1.8, 1.3 to 2.5) and both (2.9, 1.9 to 4.2). For a man diagnosed with seminoma at 35, the cumulative risk of a solid cancer by 75 was 36 per cent, against 23 per cent in the general population. Those men were mostly treated with adjuvant radiotherapy, which has since been largely replaced by surveillance or single-dose carboplatin for stage I disease, precisely because the cure rate was already near complete and the late cost was the only thing left to reduce.

Tamoxifen, where the trade-off goes the other way. In NSABP B-14, the average annual hazard rate of endometrial cancer through all follow-up was 1.6 per 1,000 patient-years in the randomised tamoxifen group against 0.2 in the placebo group, a relative risk of 7.5; against population rates from SEER and from the B-06 trial the relative risks were 2.2 and 2.3. Twenty-one of the 24 originally reported endometrial cancers were FIGO stage 1, and four tamoxifen-treated women died of uterine cancer. In the same trial the five-year cumulative hazard for disease-free survival in the tamoxifen group was 38 per cent lower than in the placebo group, and the authors' conclusion was that "net benefit greatly outweighs risk". The published abstract also records that some data in the paper came from an investigator who submitted fraudulent data to the NSABP, affecting records on 24 of 182 randomly assigned patients and 8 of 37 registered patients reviewed, all involving pre-randomisation characteristics; the finding has since been confirmed in much larger datasets, but the caveat belongs with the citation.

The thing that makes all of this possible. A written treatment summary. Every choice above is invisible afterwards unless someone wrote down what was given, at what dose and to what part of the body. Asking for that document at the end of treatment, and keeping it, is the single most useful thing in this whole file.`,
    cancers: ["multiple-myeloma", "breast-cancer", "prostate", "hodgkin-lymphoma", "testicular", "seminoma", "endometrial"],
    drugs: ["lenalidomide", "melphalan", "cyclophosphamide", "tamoxifen", "carboplatin"],
    terms: ["secondary-malignancy", "second-cancers-after-radiotherapy", "late-effects"],
    technologies: ["brachytherapy", "imrt-igrt", "proton-therapy", "deep-inspiration-breath-hold", "survivorship-care-plan"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship", "b-dose-optimisation", "b-surgery-radiation-innovation"],
    related: ["rejuv-second-cancers-overview", "rejuv-second-platinum-and-parp-inhibitors", "rejuv-second-alkylating-agents-and-myeloid-neoplasms", "rejuv-second-radiotherapy-dose-field-and-age", "second-primary-bladder-after-cyclophosphamide", "second-primary-bowel-after-abdominal-radiotherapy"],
    links: [PALUMBO_2014, SMITH_RE_2003, WALLIS_2016, RADFORD_2015, CUTTER_2021, TRAVIS_TESTIS_2005, FISHER_1994],
  }),
];

/**
 * Facet G of the recovery and rejuvenation round: second primary cancers, and the surveillance that follows
 * treatment. Every record here is a `term`, so none needs an entry in SCHEMATIC_ALIAS and
 * `src/data/schematics.ts` is untouched by this file.
 */
export const rejuvenationSecondCancers: EntityInput[] = [...risk, ...sites, ...screening, ...clone, ...definitions, ...choices];

export default rejuvenationSecondCancers;

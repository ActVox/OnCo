import type { TechnologyInput } from "@/lib/schema";

/**
 * Recovery after treatment, as records: the matrix itself, the endocrine exception, and the cumulative doses that
 * decide whether an organ comes back. The structured data these rest on is src/data/recovery-matrix.ts and the page
 * is /live/recovery/; these records exist so the answers are reachable from the corpus and from the front, not only
 * from the navigation.
 *
 * Every figure quoted here appears verbatim in the abstract or label cited beside it in src/data/recovery-matrix.ts,
 * and src/data/recovery-matrix.test.ts holds the shape of that file. British spelling; quotations are unaltered.
 */

const asOf = "2026-10-02";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const doi = (label: string, d: string) => ({ label, url: `https://doi.org/${d}` });
const REJ = "rejuvenation";
const SUP = "supportive-care";
const T = (grade: "strong" | "moderate", extra: string[] = []) => [REJ, "survivorship", `evidence:${grade}`, ...extra];
const tech = (x: Omit<TechnologyInput, "kind" | "asOf">): TechnologyInput => ({ kind: "technology", asOf, ...x });

export const recoveryEntities: TechnologyInput[] = [
  tech({
    id: "rejuv-recovery-matrix",
    name: "What comes back after treatment, treatment by treatment",
    sections: [REJ, SUP, "chemotherapy"],
    status: "established",
    wikipedia: W("Cancer_survivor"),
    tags: T("strong", ["late-effects"]),
    tldr: "For each treatment and each lasting effect, whether recovery is usual, partial or unlikely, how long it takes and in what proportion of people, with the source for every answer. The grid is mostly empty, because for most pairs nobody has published a recovery figure, and the page says how empty it is rather than hiding it.",
    summary: "Side effects are counted while a trial is running and reported as incidence. Almost nobody reports resolution: how many people got the function back, how long it took, and how many did not. That is the figure a person finishing treatment wants, and it is scattered through cohort studies, long-term follow-up papers and the recovery sentences buried in drug labels.\n\nThe matrix at /live/recovery/ gathers what exists: 37 treatments against 18 lasting effects, with every cell carrying whether recovery is usual, partial or unlikely, the timescale as the source states it, the proportion where a source gives one with the cohort it came from, and a verbatim fragment of the paper or label behind it. 104 of the 666 squares in the grid are filled, which is 15.6 per cent of it, and the page leads with that number because a matrix that looks complete and is half guessed is worse than no matrix. Seventeen more cells are the questions readers ask where the literature answers nothing, written out rather than left blank.\n\nSome patterns only appear when the answers sit side by side. The nerve column is the fullest and the most consistent: platinum and taxane damage recovers in most people over months, and roughly a quarter to a third are left with something lasting. The hormone column is the one most often described as reversible and is not. Hearing after cisplatin is the clearest single answer on the page, and it is the most unwelcome: it does not come back, so prevention and early detection are the whole of the subject. The columns with almost nothing in them are also informative: lymphoedema, kidneys, bladder and bone have three to four sourced answers each across 37 treatments, which is a measure of how rarely recovery is followed up rather than a measure of how rarely it matters.\n\nWhat the matrix is not: it is population data from trial and cohort populations that differ from any one reader, and a cell is an orientation for a conversation, not a prediction. The next page after this one is the survivorship planner, which gives the screening test and the interval for each late effect.",
    principle: "One row per treatment or class, one column per lasting effect, and in each cell an outlook, a timescale, a proportion with its cohort and a source. Cells are written only where a source states something about recovery; a blank is unknown, never none. The fill rate is computed from the data at build time, so the page cannot claim more coverage than it has.",
    strengths: ["Answers the question people actually ask at the end of treatment, which incidence tables do not", "Every figure carries the cohort it came from and a verbatim fragment of the source", "States its own coverage as a measured number instead of implying completeness"],
    limitations: ["Fifteen per cent of the grid is filled: most treatment and effect pairs have no published recovery figure", "Cohorts differ in age, dose and era, so cells are not comparable with each other as if they were trial arms", "Recovery of a function measured on a test is not the same as recovery as the person experiences it"],
    cancers: ["breast-hr-positive", "colorectal", "prostate", "testicular", "nsclc", "hodgkin-lymphoma"],
    drugs: ["cisplatin", "oxaliplatin", "doxorubicin", "paclitaxel", "trastuzumab", "pembrolizumab"],
    technologies: ["cardiotoxicity-surveillance-recovery", "cipn-recovery-and-treatment", "hearing-after-platinum-chemotherapy", "cancer-treatment-bone-loss", "survivorship-care-plan", "cognitive-impairment-after-cancer-treatment", "rejuv-recovery-endocrine-permanence", "rejuv-recovery-cumulative-dose"],
    terms: ["late-effects", "quality-of-life"],
    bottlenecks: ["b-survivorship", "b-toxicity-qol"],
    links: [
      doi("Incidence, prevalence, and predictors of chemotherapy-induced peripheral neuropathy: systematic review and meta-analysis (Pain 2014)", "10.1016/j.pain.2014.09.020"),
      doi("Early detection of anthracycline cardiotoxicity and improvement with heart failure therapy (Circulation 2015)", "10.1161/CIRCULATIONAHA.114.013777"),
      doi("Long-term chemotherapy-induced peripheral neuropathy after adjuvant oxaliplatin for colorectal cancer (Support Care Cancer 2022)", "10.1007/s00520-021-06502-4"),
    ],
  }),

  tech({
    id: "rejuv-recovery-endocrine-permanence",
    name: "Immune endocrine damage is usually permanent, and almost nobody is told",
    sections: [REJ, SUP, "immunotherapy"],
    status: "established",
    wikipedia: W("Hypophysitis"),
    tags: T("strong", ["late-effects", "irae"]),
    tldr: "Most immune side effects of checkpoint inhibitors settle. The hormone glands are the exception: a pituitary, thyroid, adrenal or insulin-making gland destroyed by the immune system does not grow back, and the replacement treatment that follows is usually for life. In the follow-up cohorts 83 per cent of hormone problems were still present three months after the drug stopped.",
    summary: "The consent conversation for a checkpoint inhibitor is, reasonably, about the toxicities that can kill: colitis, hepatitis, pneumonitis, myocarditis. Those are the ones that are treated with steroids and that mostly resolve. The hormone glands behave in the opposite way, and the long-term cohorts have measured it.\n\nIn 387 patients given adjuvant anti-PD-1 after melanoma surgery and followed after the drug stopped, hormone problems persisted in 73 of 88 cases (83.0 per cent), while colitis became chronic in only 6 of 44 and four of those six later resolved. An extended follow-up of 318 patients at six centres in the United States and Australia found immune side effects still present in 93 patients at a median of 1,057 days, and of the 24 still on systemic steroids, 16 were on replacement for hypophysitis or adrenal insufficiency.\n\nGland by gland the picture is consistent. In a tertiary clinic cohort of 22 people with checkpoint hypophysitis, none recovered the pituitary control of the adrenal gland during follow-up, while the thyroid axis recovered in 33 per cent and the gonadal axis in 67 per cent. Of 103 patients with checkpoint-associated thyroiditis, 2 regained their own thyroid function and 64 reached normal levels on levothyroxine. In the CANDIED cohort of checkpoint-induced insulin-dependent diabetes across five Canadian centres, every one of the 34 patients remained insulin-dependent.\n\nWhy this matters practically: the symptoms are exhaustion, nausea, dizziness and low mood, which is also what cancer treatment feels like, so the diagnosis is easy to miss and the test is a blood test. Untreated adrenal insufficiency can kill in an intercurrent illness or an operation. Replacement is cheap and effective, and nothing about any of this is an argument against a treatment that cures people who would once have died. It is an argument for saying so at the start, and for a hormone profile at the first hint rather than the third.",
    principle: "T cells released from checkpoint restraint infiltrate endocrine tissue and destroy hormone-secreting cells. The destruction is clonal and irreversible, unlike the lymphocytic inflammation of the gut or liver, which resolves when the infiltrate is suppressed. Steroids treat the inflammation but do not regenerate the gland, which is why endocrine events are the one group where guidelines allow the checkpoint inhibitor to continue: stopping it does not restore the gland, and hormone replacement controls the consequence.",
    strengths: ["The replacement treatments are cheap, well understood and effective for life", "The diagnosis is a blood test available in any hospital", "Endocrine events usually do not require the cancer treatment to be stopped"],
    limitations: ["The gland does not recover, so this is management rather than cure", "The symptoms overlap with the cancer and with treatment fatigue, so diagnosis is often late", "Most consent conversations describe immune side effects as reversible without naming the exception"],
    cancers: ["melanoma", "nsclc", "rcc", "urothelial"],
    drugs: ["pembrolizumab", "nivolumab", "ipilimumab", "atezolizumab", "durvalumab"],
    technologies: ["checkpoint-inhibitor", "survivorship-care-plan", "rejuv-recovery-matrix"],
    terms: ["irae", "late-effects"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship"],
    links: [
      doi("Chronic immune-related adverse events following adjuvant anti-PD-1 therapy for high-risk resected melanoma (JAMA Oncol 2021)", "10.1001/jamaoncol.2021.0051"),
      doi("Extended follow-up of chronic immune-related adverse events following adjuvant anti-PD-1 therapy (JAMA Netw Open 2023)", "10.1001/jamanetworkopen.2023.27145"),
      doi("Checkpoint inhibitor hypophysitis in a tertiary centre (Clin Endocrinol 2026)", "10.1111/cen.70137"),
      doi("Levothyroxine dosing in checkpoint-associated hypothyroidism (Thyroid 2022)", "10.1089/thy.2021.0685"),
      doi("Checkpoint inhibitor-induced insulin-dependent diabetes, CANDIED (Cancers 2021)", "10.3390/cancers14010089"),
    ],
  }),

  tech({
    id: "rejuv-recovery-cumulative-dose",
    name: "The cumulative dose that decides whether it comes back",
    sections: [REJ, SUP, "chemotherapy"],
    status: "established",
    wikipedia: W("Cumulative_dose"),
    tags: T("strong", ["late-effects"]),
    tldr: "For several treatments there is a published number above which lasting damage becomes much likelier: the total anthracycline dose and heart failure, the total cisplatin dose and hearing, the radiation dose to the parotid gland and dry mouth. Twenty-three thresholds are listed with their sources, because the total you have had is a question your team can answer.",
    summary: "Most late effects are dose-dependent, and for a minority of them somebody has published the dose. Those numbers belong in a patient's hands, because the total received is recorded in the notes and is the one piece of personal information that changes how much any of this applies.\n\nThe heart: the doxorubicin label estimates the probability of cardiomyopathy at 1 to 2 per cent at a cumulative 300 mg/m2, 3 to 5 per cent at 400, 5 to 8 per cent at 450 and 6 to 20 per cent at 500 mg/m2. A retrospective analysis of three randomised trials estimated 26 per cent at 550 mg/m2, against the 7 per cent at the same dose reported by the earlier large study. Those sources disagree, and the matrix prints both rather than choosing.\n\nHearing: in 1,422 cisplatin-treated testicular cancer survivors, measured hearing worsened with each additional 100 mg/m2 of cisplatin, and worsened faster in those with reduced kidney function.\n\nRadiotherapy: QUANTEC gives the dose at which an organ at risk starts to fail, and those numbers decide the plan before the first fraction. Sparing one parotid gland to a mean dose below about 20 Gy, or both below about 25 Gy, is the difference between a dry mouth that partly recovers and one that does not. Spinal cord myelopathy risk stays under 1 per cent at 54 Gy. For the heart, Darby's cohort found no threshold at all: the rate of major coronary events rose 7.4 per cent per gray of mean heart dose.\n\nFertility: a cyclophosphamide equivalent dose below 4,000 mg/m2 left sperm production normal in 31 of 35 men in the St Jude Lifetime Cohort, and the ovarian dose at which ovarian failure is immediate falls with age, from 20.3 Gy at birth to 14.3 Gy at 30.\n\nThe practical use is narrow and real: ask what your cumulative dose was, or what dose the organ at risk is planned to receive, and read your own row rather than the headline figure.",
    principle: "Late organ damage is usually a function of total exposure rather than of any single dose, because the injury accumulates in cells that do not divide and cannot be replaced: cardiomyocytes, cochlear hair cells, oocytes, salivary acinar cells. Where a threshold has been published it marks the point at which the proportion affected rises steeply, not a safe level below it, and for some effects, notably radiation coronary disease, no threshold has been found.",
    strengths: ["The number is in the notes and can be asked for", "Thresholds change the plan before treatment rather than afterwards", "They make dose capping, infusion schedule and organ sparing legible as the prevention they are"],
    limitations: ["Thresholds exist for a minority of effects, and published sources sometimes disagree", "They are population figures: individual susceptibility varies, including genetically", "For radiation coronary disease no threshold has been found, so lower is simply better"],
    cancers: ["breast-her2-positive", "testicular", "head-and-neck", "hodgkin-lymphoma", "sarcoma"],
    drugs: ["doxorubicin", "cisplatin", "cyclophosphamide", "bleomycin", "carmustine"],
    technologies: ["anthracycline-cardioprotection", "hearing-after-platinum-chemotherapy", "fertility-preservation", "imrt-igrt", "rejuv-recovery-matrix"],
    terms: ["late-effects"],
    bottlenecks: ["b-toxicity-qol", "b-survivorship"],
    links: [
      doi("Congestive heart failure in patients treated with doxorubicin: a retrospective analysis of three trials (Cancer 2003)", "10.1002/cncr.11407"),
      doi("Radiation dose-volume effects of the salivary glands, QUANTEC (Int J Radiat Oncol Biol Phys 2010)", "10.1016/j.ijrobp.2009.06.090"),
      doi("Risk of ischemic heart disease in women after radiotherapy for breast cancer (NEJM 2013)", "10.1056/NEJMoa1209825"),
      doi("Cumulative alkylating agent exposure and semen parameters in adult survivors of childhood cancer (Lancet Oncol 2014)", "10.1016/S1470-2045(14)70408-5"),
      doi("Predicting age of ovarian failure after radiation to a field that includes the ovaries (Int J Radiat Oncol Biol Phys 2005)", "10.1016/j.ijrobp.2004.11.038"),
    ],
  }),
];

/**
 * Drawings these records borrow, since none of them is a device with a mechanism of its own: the matrix reads as
 * the survivorship plan it feeds, the endocrine record as the checkpoint drawing whose toxicity it describes, and
 * the dose record as the chemotherapy scene. Required by src/data/animated-wave8.test.ts, which fails if any
 * technology falls back to a generic front schematic.
 */
export const recoverySchematicAliases: Record<string, string> = {
  "rejuv-recovery-matrix": "survivorship-care-plan",
  "rejuv-recovery-endocrine-permanence": "checkpoint-inhibitor",
  "rejuv-recovery-cumulative-dose": "cytotoxic-chemotherapy",
};

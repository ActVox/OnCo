/**
 * Parent cancer pages (17 Sept 2026): breast, lung, leukaemia and biliary tract cancer as overview records so their subtype
 * pages hang off a page that lists them, following the owner's rule that every family shows its types at the top. Each
 * overview stays short on treatment detail and points to the subtype pages that carry it. Registered in src/data/index.ts.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["parent-page"];

export const cancerParentsWave2: CancerInput[] = [
  { id: "breast-cancer", kind: "cancer", name: "Breast cancer (all types)", group: "breast", asOf, tags, wikipedia: W("Breast_cancer"),
    aka: ["TCGA-BRCA", "breast invasive carcinoma (TCGA BRCA cohort)", "Breast carcinoma", "Carcinoma of the breast"],
    // The burden is written with its cohorts and sources by the September 2026 family round
    // (src/data/spikes/breast-core.ts). The pair that stood here, "about 2.3 million new cases and 670,000 deaths"
    // and "in high-income countries about nine in ten women diagnosed are alive five years later", carried no source,
    // contradicted the sourced GLOBOCAN 2024 figures already in src/data/spikes/tnbc-core.ts, and was not true of the
    // UK on this corpus's own survival figures. The tldr below is corrected in place, because the schema requires it
    // on every cancer record: its 70 / 15 / 15 split presented three overlapping categories as a partition, and
    // hormone receptor-positive HER2-positive disease belongs to two of them at once.
    tldr: "Breast cancer is not one disease, and the result that decides which page you need is the receptor result: whether the cancer carries oestrogen and progesterone receptors, and whether it carries too much HER2. Those two answers give four boxes, not three, with a page for each. Grade and stage do not change which page you read; they change what happens on it.",
    summary: "Breast cancer arises from the milk ducts or lobules and is classified by the receptors on its cells: oestrogen and progesterone receptors, and HER2. Hormone receptor-positive, HER2-negative disease is treated with endocrine therapy and CDK4/6 inhibitors; HER2-positive disease with HER2 antibodies and antibody-drug conjugates; triple-negative disease with chemotherapy, immunotherapy and, for BRCA carriers, PARP inhibitors. Ductal carcinoma in situ is a precursor confined to the duct, and about one percent of cases occur in men. Screening mammography from around age 50, breast-conserving surgery with radiotherapy, sentinel node biopsy and genomic tests that spare chemotherapy are common to all types. Most patients present early and are cured. Metastatic disease is treated in successive lines rather than once, is controlled for years in many people, and is rarely cured; the subtype pages carry the sequence, the trials open in each line and the point at which a trial is a reasonable choice beside standard treatment.",
    // The seven page names that stood here are all in the family strip above the section, and they are now said with
    // their shares and their axis by src/data/spikes/breast-core.ts, which groups the 37 children by what a report
    // actually tells a reader: receptor result, histological type, in situ or invasive, clinical entity.
    subtypes: [],
    biomarkers: ["Oestrogen and progesterone receptors", "HER2 (including HER2-low)", "Ki-67 and grade", "Genomic recurrence scores (Oncotype DX, MammaPrint)", "BRCA1/2 and other germline variants", "PD-L1 (triple-negative)", "ESR1 and PIK3CA mutations (advanced hormone receptor-positive)"],
    standardOfCare: [
      // The "Screening" one-liner that stood here ("mammography every one to three years from around age 40 to 50
      // depending on country; MRI for high-risk women") was a strictly weaker duplicate of the screening rows and
      // the four-nation screening ages in src/data/spikes/tnbc-core.ts and tnbc-uk.ts, and of the NHS screening
      // programme layer of the September 2026 family round. The diagnosis, staging and recurrence rows that replace
      // it are in src/data/spikes/breast-core.ts; `mammography` is still reachable from them.
      { setting: "Early disease, all types", approach: "Breast-conserving surgery with radiotherapy or mastectomy, sentinel node biopsy, then treatment by receptor type on the subtype pages.", refs: ["breast-hr-positive", "breast-her2-positive", "tnbc", "hypofractionated-radiotherapy"] },
      { setting: "Ductal carcinoma in situ", approach: "Surgery with or without radiotherapy and endocrine therapy; active surveillance under study.", refs: ["ductal-carcinoma-in-situ"] },
    ],
    stateOfArt: ["Five-year survival above 90 percent in early disease across high-income countries, driven by screening, endocrine therapy and HER2-targeted drugs.", "Antibody-drug conjugates such as trastuzumab deruxtecan have redrawn the HER2 boundary and moved into HER2-low disease.", "Genomic tests spare most node-negative hormone receptor-positive patients chemotherapy.", "Omission of radiotherapy in older low-risk women and one-week hypofractionation are reducing treatment burden."],
    // Four entries were written twice. Tamoxifen 1977, CDK4/6 2015 and DESTINY-Breast04 2022 are on
    // src/data/spikes/breast-hr-positive.ts with their trials and refs; trastuzumab 1998 is on
    // breast-her2-positive.ts and again on src/data/breast-subtypes.ts; 2022 is on breast-subtypes.ts too. They are
    // removed here rather than left in both places (the lung review rule), and the classification timeline that
    // belongs to a family page, grading, staging editions and the WHO editions, is added by
    // src/data/spikes/breast-core.ts. `tamoxifen`, `trastuzumab`, `palbociclib` and `trastuzumab-deruxtecan` are all
    // still reachable from this record's pipeline and from the receptor pages.
    history: [
      { year: 1894, title: "Halsted radical mastectomy", note: "The standard operation for seventy years." },
      { year: 1985, title: "NSABP B-06: lumpectomy plus radiotherapy equals mastectomy" },
      { year: 2000, title: "Molecular subtypes described", note: "Perou and Sorlie's expression profiling defines luminal, HER2-enriched and basal-like breast cancers.", refs: ["basal-like", "pam50"] },
    ],
    pipeline: ["trastuzumab-deruxtecan","datopotamab-deruxtecan","oral-serds"],
    related: ["her2-low-metastatic-breast-cancer", "inflammatory-breast-cancer", "paget-disease-of-the-nipple", "phyllodes-tumour", "male-breast-cancer", "ductal-carcinoma-in-situ"],
    // The four one-line problems that stood here are each written with their figures on a child page or in a term:
    // incurable metastatic disease and the triple-negative outlook on src/data/spikes/tnbc-core.ts, screening
    // overdiagnosis and low-risk DCIS on the DCIS record in src/data/spikes/nci-rare-other.ts, and the survival gaps
    // in the `health-disparities` term. The five that replace them, in src/data/spikes/breast-core.ts, are the
    // family's own and carry their sources.
    openProblems: [],
    links: [{ label: "Wikipedia", url: W("Breast_cancer") }, { label: "NCI PDQ", url: "https://www.cancer.gov/types/breast" }] },
  { id: "lung-cancer", kind: "cancer", name: "Lung cancer (all types)", group: "thoracic", asOf, tags, wikipedia: W("Lung_cancer"),
    aka: ["Bronchogenic carcinoma", "Lung carcinoma"],
    burden: "The leading cause of cancer death worldwide, with about 2.5 million new cases and 1.8 million deaths a year; most cases are caused by smoking, and survival depends heavily on the stage at diagnosis.",
    tldr: "Lung cancer splits into non-small-cell (about 85 percent) and small-cell (about 15 percent) disease, which behave and are treated very differently. The subtype pages carry the detail; this page covers screening, staging and what the types share.",
    summary: "Lung cancer is divided by histology into non-small-cell lung cancer, itself split into adenocarcinoma, squamous and large-cell carcinoma, and small-cell lung cancer, a fast-growing neuroendocrine tumour almost always linked to smoking. Non-small-cell disease has more than a dozen targetable driver mutations and is treated with surgery, radiotherapy, targeted drugs and immunotherapy by stage and biology; small-cell disease is treated with chemotherapy, immunotherapy and radiotherapy and relapses quickly. Low-dose CT screening of heavy smokers cuts lung cancer deaths by about a fifth, and tobacco control remains the largest lever. Mesothelioma and thymic tumours are separate thoracic cancers.",
    subtypes: ["Non-small-cell lung cancer (adenocarcinoma, squamous, large cell)", "Small-cell lung cancer", "Carcinoid and other neuroendocrine tumours of the lung", "Pleuropulmonary blastoma (childhood)"],
    biomarkers: ["EGFR, ALK, ROS1, KRAS G12C, BRAF V600E, MET exon 14, RET, NTRK, HER2 mutations (non-small-cell)", "PD-L1 expression", "Stage by TNM and PET-CT", "Circulating tumour DNA for minimal residual disease"],
    // Standard of care, history and open problems are written in full, with their sources, by the September 2026 deep
    // dive (src/data/spikes/lung-treatment.ts, lung-core.ts, lung-living.ts and lung-evidence.ts). The three one-line
    // settings and the four one-line problems that stood here said the same things without a figure or a source, and
    // the two history entries below were written twice; every record they referenced is still reachable from the rows
    // that replaced them.
    standardOfCare: [],
    stateOfArt: ["Immunotherapy and targeted drugs have doubled or tripled survival in metastatic non-small-cell disease over a decade.", "CT screening is recommended in the United States and, since June 2022, across the four UK nations; in Europe it is still mostly not a programme, and uptake is low where it is.", "Small-cell lung cancer has gained immunotherapy and the DLL3 T-cell engager tarlatamab after decades without progress."],
    history: [
      { year: 2004, title: "EGFR mutations explain gefitinib responses", refs: ["gefitinib"] },
      { year: 2015, title: "Nivolumab approved: immunotherapy enters lung cancer", refs: ["nivolumab"] },
      { year: 2024, title: "Tarlatamab: first targeted drug for small-cell lung cancer", refs: ["tarlatamab"] },
    ],
    pipeline: ["tarlatamab","datopotamab-deruxtecan"], openProblems: [],
    links: [{ label: "Wikipedia", url: W("Lung_cancer") }, { label: "NCI PDQ", url: "https://www.cancer.gov/types/lung" }] },
  { id: "leukaemia", kind: "cancer", name: "Leukaemia (all types)", group: "haematologic", asOf, tags, wikipedia: W("Leukemia"),
    aka: ["Leukemia", "Blood cancer (leukaemias)"],
    burden: "About 490,000 new cases and 300,000 deaths a year worldwide; the commonest cancer of childhood, where most cases are now cured, and a group of very different diseases in adults.",
    tldr: "Leukaemia means cancer of the blood-forming cells, but the four main types share little beyond the name: acute lymphoblastic and acute myeloid leukaemia are emergencies treated with intensive therapy, while chronic lymphocytic and chronic myeloid leukaemia are slow diseases controlled for years with pills. Each has its own page.",
    summary: "Leukaemias arise when a blood stem cell or its progeny acquires mutations that block maturation and drive proliferation, flooding the marrow and blood with abnormal cells. They are classified by speed (acute or chronic) and lineage (lymphoid or myeloid). Acute lymphoblastic leukaemia is the commonest childhood cancer and is cured in about 90 percent of children; acute myeloid leukaemia is mainly a disease of older adults treated with intensive chemotherapy, venetoclax combinations and transplant; chronic lymphocytic leukaemia is often watched for years and then controlled with BTK and BCL2 inhibitors; chronic myeloid leukaemia became the model of targeted therapy with imatinib. Rarer forms include hairy cell leukaemia and chronic myelomonocytic leukaemia. CAR-T cells and bispecific antibodies are changing the acute leukaemias.",
    subtypes: ["Acute lymphoblastic leukaemia (ALL)", "Acute myeloid leukaemia (AML)", "Chronic lymphocytic leukaemia (CLL)", "Chronic myeloid leukaemia (CML)", "Hairy cell leukaemia", "Chronic myelomonocytic leukaemia (CMML)", "Blastic plasmacytoid dendritic cell neoplasm (BPDCN)"],
    biomarkers: ["Flow cytometry immunophenotype", "Cytogenetics and fusion genes (BCR-ABL1, PML-RARA, KMT2A)", "Mutations (FLT3, NPM1, IDH1/2, TP53, IGHV status)", "Measurable residual disease by flow or PCR"],
    standardOfCare: [
      { setting: "Diagnosis", approach: "Blood count and film, bone marrow aspirate and biopsy, flow cytometry, cytogenetics and molecular panel; the subtype then sets the pathway.", refs: ["flow-cytometry-mrd", "cytogenetics-fish"] },
      { setting: "Treatment", approach: "By type on the subtype pages: intensive chemotherapy and transplant for acute leukaemias, tyrosine kinase inhibitors for CML, BTK and BCL2 inhibitors for CLL.", refs: ["all-leukemia", "aml", "cll", "cml"] },
      { setting: "Supportive care", approach: "Growth factor support, transfusion, infection prevention and tumour lysis prophylaxis around intensive treatment.", refs: ["g-csf-growth-factors", "transfusion-support"] },
    ],
    stateOfArt: ["Childhood ALL cure rates near 90 percent through risk-adapted chemotherapy and measurable residual disease monitoring.", "CML patients live near-normal lifespans on tyrosine kinase inhibitors, and many can stop treatment.", "Venetoclax made AML treatable in older adults; CAR-T and blinatumomab rescued relapsed ALL.", "Treatment-free remission and measurable residual disease guide therapy across the chronic leukaemias."],
    history: [
      { year: 1845, title: "Virchow names leukaemia", note: "White blood in a patient's vessels described as a disease of the blood itself." },
      { year: 1948, title: "Farber induces remissions in childhood ALL with aminopterin" },
      { year: 1960, title: "Philadelphia chromosome discovered in CML" },
      { year: 2001, title: "Imatinib approved", note: "The first kinase inhibitor and the model for targeted therapy.", refs: ["imatinib"] },
      { year: 2017, title: "Tisagenlecleucel: the first CAR-T approval, for childhood ALL", refs: ["tisagenlecleucel"] },
    ],
    pipeline: ["menin-inhibitors","car-t"], openProblems: ["Adult ALL and TP53-mutated AML still have poor outcomes.", "Infant and relapsed childhood leukaemias.", "Access to CAR-T and transplant outside rich countries.", "Late effects of childhood treatment."],
    links: [{ label: "Wikipedia", url: W("Leukemia") }, { label: "NCI PDQ", url: "https://www.cancer.gov/types/leukemia" }] },
  { id: "biliary-tract-cancer", kind: "cancer", name: "Biliary tract cancer (all types)", group: "gastrointestinal", asOf, tags, wikipedia: W("Biliary_tract_cancer"),
    aka: ["Biliary cancer", "Cancers of the bile ducts, gallbladder and ampulla"],
    burden: "Around 200,000 cases a year worldwide, rare in the West and common in parts of Asia and South America; most present late and five-year survival is under 20 percent overall.",
    tldr: "Biliary tract cancers arise in the bile ducts inside or outside the liver, the gallbladder or the ampulla where the duct meets the bowel. They share short survival and the same first-line chemotherapy with immunotherapy, but differ in causes and in the targetable mutations they carry. Each has its own page.",
    summary: "Biliary tract cancers are adenocarcinomas of the bile duct system. Intrahepatic cholangiocarcinoma arises within the liver, perihilar and distal cholangiocarcinoma along the main ducts, gallbladder cancer in the gallbladder and ampullary cancer at the junction with the duodenum. Causes include liver fluke infection, primary sclerosing cholangitis, gallstones and, in Chile and India, a high background rate of gallbladder cancer. Surgery is the only cure and is possible in a minority; gemcitabine-cisplatin with durvalumab or pembrolizumab is the first-line treatment for advanced disease, and intrahepatic tumours often carry FGFR2 fusions or IDH1 mutations with approved targeted drugs. The subtype pages carry the detail.",
    subtypes: ["Cholangiocarcinoma (intrahepatic, perihilar and distal bile duct)", "Gallbladder cancer", "Ampullary cancer (ampulla of Vater)"],
    biomarkers: ["FGFR2 fusions and IDH1 mutations (intrahepatic)", "HER2 amplification (gallbladder, extrahepatic)", "Microsatellite instability", "CA 19-9"],
    standardOfCare: [
      { setting: "Resectable disease", approach: "Surgery followed by six months of capecitabine (BILCAP).", refs: ["bilcap", "capecitabine"] },
      { setting: "Advanced disease", approach: "Gemcitabine-cisplatin with durvalumab (TOPAZ-1) or pembrolizumab; targeted therapy for FGFR2 and IDH1 alterations on progression.", refs: ["cholangiocarcinoma", "gemcitabine", "cisplatin", "durvalumab"] },
      { setting: "Second line by biology", approach: "Pemigatinib or futibatinib for FGFR2 fusions, ivosidenib for IDH1 mutations, FOLFOX otherwise.", refs: ["pemigatinib", "futibatinib", "ivosidenib", "oxaliplatin"] },
    ],
    stateOfArt: ["Immunotherapy added to chemotherapy improved survival for the first time in a decade (TOPAZ-1, KEYNOTE-966).", "FGFR2 and IDH1 inhibitors made intrahepatic cholangiocarcinoma a model for molecular selection in a rare cancer.", "Liver transplantation for selected perihilar tumours and liver-directed therapy for intrahepatic disease are expanding."],
    history: [
      { year: 1965, title: "Klatskin describes perihilar cholangiocarcinoma" },
      { year: 2010, title: "ABC-02: gemcitabine-cisplatin becomes standard", refs: ["abc-02"] },
      { year: 2020, title: "Pemigatinib: first FGFR2 inhibitor approved", refs: ["pemigatinib"] },
      { year: 2022, title: "Durvalumab added to chemotherapy (TOPAZ-1)", refs: ["durvalumab"] },
    ],
    pipeline: ["pemigatinib","futibatinib","ivosidenib"], openProblems: ["Most patients are diagnosed too late for surgery.", "No screening even in high-incidence regions.", "Resistance to FGFR2 inhibitors within a year.", "Gallbladder cancer lacks any approved targeted drug."],
    links: [{ label: "Wikipedia", url: W("Biliary_tract_cancer") }, { label: "NCI PDQ: bile duct cancer", url: "https://www.cancer.gov/types/liver/patient/bile-duct-treatment-pdq" }] },
];

export const cancerParentsWave2Map: Record<string, string> = {
  "breast-hr-positive": "breast-cancer", "breast-her2-positive": "breast-cancer", tnbc: "breast-cancer", "ductal-carcinoma-in-situ": "breast-cancer", "male-breast-cancer": "breast-cancer",
  nsclc: "lung-cancer", sclc: "lung-cancer",
  "all-leukemia": "leukaemia", aml: "leukaemia", cll: "leukaemia", cml: "leukaemia", "hairy-cell-leukemia": "leukaemia", cmml: "leukaemia", bpdcn: "leukaemia",
  cholangiocarcinoma: "biliary-tract-cancer", gallbladder: "biliary-tract-cancer", ampullary: "biliary-tract-cancer",
};

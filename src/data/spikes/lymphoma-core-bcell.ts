import type { CancerInput } from "@/lib/schema";
import type { Spike } from "./index";
import { SRC, W, asOf, doi, pdqGuideline, tags, whoGuideline } from "./lymphoma-core";

/**
 * B-CELL LYMPHOMA: the entity records WHO-HAEM5 names and the corpus did not hold. Facet A of the lymphoma deep
 * dive, 29 September 2026; the family decisions and the shared sources are in ./lymphoma-core.ts.
 *
 * Nine records. Seven sit directly under `non-hodgkin-lymphoma`, beside `primary-mediastinal-b-cell-lymphoma`,
 * which is the corpus's precedent for a distinct large B-cell entity at that level. Two sit under `malt-lymphoma`,
 * which is the one place this layer reverses a wave 4 decision: gastric and ocular adnexal marginal zone lymphoma
 * become records because the first treatment decision differs from the parent's and from each other's (an
 * antibiotic against the bacterium in one, an antibiotic or radiotherapy to the orbit in the other), and because
 * one translocation predicts which gastric lymphomas antibiotics will not cure.
 *
 * What is referenced rather than restated. `dlbcl` carries the cell-of-origin and the treatment of diffuse large
 * B-cell lymphoma, including the glossary term `double-hit-lymphoma`; `primary-cns-lymphoma` carries the central
 * nervous system member of the immune-privileged family; `waldenstrom` is the corpus's lymphoplasmacytic lymphoma
 * page; `hiv-associated-lymphoma` and `post-transplant-lymphoproliferative-disorder` carry the immune-deficiency
 * settings. Treatment rows here say what is specific to the entity and route to those pages for the rest, because
 * the treatment layer (./lymphoma-treatment-bcell.ts) owns the regimens.
 *
 * Every figure below names the paper it was read from. Where no population figure exists under the entity's 2022
 * name, the record says so instead of quoting one.
 */

const PAPER = {
  llmpp: doi("Double-hit gene expression signature defines a distinct subgroup of germinal centre B-cell-like diffuse large B-cell lymphoma (Ennishi and Rosenwald, J Clin Oncol 2019)", "10.1200/JCO.18.01583"),
  pelSeer: doi("Trends in incidence and survival of patients with primary effusion lymphoma in the United States, a population-based cohort study of 236 patients (Hematological Oncology 2026)", "10.1002/hon.70168"),
  pblNcdb: doi("Epidemiologic characteristics, treatment patterns and survival of plasmablastic lymphoma in the United States, a SEER and NCDB analysis (Clinical Lymphoma Myeloma and Leukemia 2024)", "10.1016/j.clml.2023.12.014"),
  pblSeer: doi("Survival analysis in treated plasmablastic lymphoma patients, a population-based study of 248 patients (American Journal of Hematology 2020)", "10.1002/ajh.25955"),
  thrlbclGep: doi("Nodular lymphocyte predominant Hodgkin lymphoma and T-cell/histiocyte-rich large B-cell lymphoma, endpoints of a spectrum of one disease? (PLoS One 2013)", "10.1371/journal.pone.0078812"),
  ebvEurope: doi("Epstein-Barr virus-positive diffuse large B-cell lymphoma in elderly patients is rare in Western populations (Human Pathology 2010)", "10.1016/j.humpath.2009.07.024"),
  ebvMexico: doi("Geographic variation in the prevalence of Epstein-Barr virus-positive diffuse large B-cell lymphoma of the elderly, a comparison of a Mexican and a German population (Modern Pathology 2011)", "10.1038/modpathol.2011.62"),
  ielsg10: doi("First-line treatment for primary testicular diffuse large B-cell lymphoma with rituximab-CHOP, central nervous system prophylaxis and contralateral testis irradiation, IELSG-10 (Vitolo, J Clin Oncol 2011)", "10.1200/JCO.2010.31.4187"),
  ptlSeer: doi("Primary testicular diffuse large B-cell lymphoma, a population-based study of 769 patients on incidence, natural history and survival (Gundrum, J Clin Oncol 2009)", "10.1200/JCO.2009.22.5896"),
  fischbach: doi("Long-term follow-up of gastric MALT lymphoma after Helicobacter pylori eradication, 120 patients with stage I disease (Fischbach, J Clin Oncol 2005)", "10.1200/JCO.2005.02.3903"),
  oamztSalvage: doi("Salvage irradiation for ocular adnexal MALT lymphoma refractory to Chlamydia psittaci eradication, 28 patients (Advances in Radiation Oncology 2025)", "10.1016/j.adro.2025.101822"),
  oamztNoCp: doi("Lack of an association between Chlamydia psittaci and ocular adnexal lymphoma, 28 United States specimens tested by two assays (Leukemia and Lymphoma 2007)", "10.1080/10428190601132105"),
  oalTaiwan: doi("Orbital and ocular adnexal lymphoma, epidemiology and prognostic factors in 112 patients in Taiwan (Eye 2021)", "10.1038/s41433-020-01198-y"),
};

type Rec = Omit<CancerInput, "kind" | "asOf" | "group" | "tags">;
const rec = (x: Rec & { parent: string }): CancerInput => ({ kind: "cancer", asOf, group: "haematologic", tags: [...tags, "subtype-page"], ...x });

export const lymphomaCoreBcellRecords: CancerInput[] = [
  // ------------------------------------------------------------------ DOUBLE-HIT
  rec({
    id: "high-grade-b-cell-lymphoma-myc-bcl2", parent: "non-hodgkin-lymphoma",
    name: "High-grade B-cell lymphoma with MYC and BCL2 rearrangements (double-hit lymphoma)",
    wikipedia: W("Diffuse_large_B-cell_lymphoma"),
    aka: ["Double-hit lymphoma", "DHL", "HGBL-MYC/BCL2", "HGBCL-DH-BCL2", "Diffuse large B-cell lymphoma/high grade B-cell lymphoma with MYC and BCL2 rearrangements", "High-grade B-cell lymphoma with MYC and BCL2 and/or BCL6 rearrangements", "Double-hit B-cell lymphoma", "Triple-hit lymphoma"],
    tldr: "An aggressive B-cell lymphoma defined not by how it looks but by two genetic faults in the same cell: a rearrangement of MYC, which drives growth, and one of BCL2, which blocks the cell from dying. It behaves worse than ordinary diffuse large B-cell lymphoma, so finding the rearrangements changes the treatment.",
    burden: "No United Kingdom population figure exists under the name the 2022 classifications gave this entity, and the corpus does not invent one. What can be said is how often the genetics are found when they are looked for: in the gene-expression study that defined the double-hit signature, 25 of 157 germinal-centre diffuse large B-cell lymphomas carried rearrangements of both MYC and BCL2, and 27 per cent of the whole series carried the signature even though only half of those had the rearrangements. That cohort was assembled to contain the cases, so it is not a population frequency.",
    summary: [
      "What it is. Two genes have to be broken for this diagnosis. MYC is a master switch for cell growth; BCL2 is the brake on programmed cell death. A cell that is told to grow and is also prevented from dying becomes a lymphoma that behaves worse than either fault alone would predict. The rearrangements are found by fluorescence in situ hybridisation, a test done on the biopsy, and they are the diagnosis. Nothing about the way the cells look under a microscope reliably identifies them, which is why every aggressive B-cell lymphoma is now tested.",
      "How it differs from its family. It is a separate entity from diffuse large B-cell lymphoma, although it was carved out of it. WHO-HAEM5 named it diffuse large B-cell lymphoma / high-grade B-cell lymphoma with MYC and BCL2 rearrangements, so that a tumour made of large cells and one made of smaller blastoid cells can carry the same name once the genetics are known; the two books describe it as a homogeneous group with a germinal-centre gene expression profile and a close relationship to follicular lymphoma. Its gene expression overlaps that of Burkitt lymphoma, which is the other aggressive germinal-centre disease driven by MYC.",
      "Where the two classifications disagree, and why it matters to a reader. Until 2022, cases with MYC and BCL6 rearrangements were counted in the same category. Both books removed them, because their gene expression and mutations are varied and differ from the MYC and BCL2 group. WHO-HAEM5 sends them back to diffuse large B-cell lymphoma or to high-grade B-cell lymphoma not otherwise specified, chosen on how the cells look. The International Consensus Classification created a new provisional entity for them instead, called high-grade B-cell lymphoma with MYC and BCL6 rearrangements. So a person with MYC and BCL6 rearrangements may be told they have a double-hit lymphoma by one pathologist and diffuse large B-cell lymphoma by another, and both are following a 2022 classification.",
      "What the signature adds. The gene expression signature that characterises this entity can be present without the rearrangements. In the study that defined it, the signature was found in 27 per cent of germinal-centre diffuse large B-cell lymphomas, only half of which had the double rearrangement, and the people who carried the signature had worse outcomes after standard immunochemotherapy whether or not the rearrangements were there: a five-year time to progression of 57 per cent against 81 per cent. A commercial assay (the DLBCL90 NanoString panel) reproduced that result. The clinical implication is uncomfortable and honest: the test in daily use identifies some but not all of the biologically distinct group.",
      "How it is treated. More intensively than diffuse large B-cell lymphoma, with prophylaxis against spread to the brain and spinal cord, which is more likely here. The regimens and the evidence for them, which is observational rather than randomised, are written on the diffuse large B-cell lymphoma page and in the treatment layer of this family.",
    ].join("\n\n"),
    subtypes: ["Large-cell morphology, which looks like diffuse large B-cell lymphoma down the microscope", "High-grade or blastoid morphology, made of medium-sized cells", "With an additional BCL6 rearrangement, historically called triple-hit"],
    biomarkers: [
      "MYC rearrangement and BCL2 rearrangement, both by fluorescence in situ hybridisation; the diagnosis cannot be made without them",
      "BCL6 rearrangement, reported separately because the 2022 classifications moved MYC with BCL6 out of this entity",
      "Germinal-centre B-cell phenotype: CD10 positive, BCL6 positive, MUM1 usually negative",
      "The double-hit gene expression signature (DHITsig or MHG), measurable on a NanoString panel, which marks a larger group than the rearrangements do",
      "Dual expression of MYC and BCL2 protein by immunohistochemistry, which is a different and much commoner finding and is not this entity",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis", approach: "Every aggressive B-cell lymphoma biopsy is tested by fluorescence in situ hybridisation for MYC, and if MYC is rearranged, for BCL2 and BCL6. A lymphoma cannot be identified as double-hit by appearance, by immunohistochemistry for MYC and BCL2 protein, or by the cell-of-origin assay; dual protein expression is a separate and much commoner finding with its own, lesser, prognostic weight. Follicular lymphoma is excluded from the entity by both classifications even when it carries both rearrangements.", refs: ["histopathology-ihc", "myc", "bcl2", "double-hit-lymphoma", "lymphoma-classification-2022"], guideline: whoGuideline },
      { setting: "Treatment, and what is known about it", approach: "Treated more intensively than diffuse large B-cell lymphoma, and with prophylaxis against disease in the brain and spinal cord, which is more frequent here. There has never been a randomised trial confined to this entity: the intensified regimens in use were adopted from retrospective comparisons after the group was shown to do less well with standard immunochemotherapy. The regimens, the doses and the evidence behind each are on the diffuse large B-cell lymphoma page and in the treatment layer of this family.", refs: ["dlbcl", "rituximab", "lymphoma-tx-cns-prophylaxis", "lymphoma-tx-regimen-alphabet", "r-chop"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2016, title: "Carved out of diffuse large B-cell lymphoma", note: "The revised fourth edition of the WHO classification created high-grade B-cell lymphoma with MYC and BCL2 and/or BCL6 rearrangements as a category of its own, which made testing for the rearrangements routine.", refs: ["dlbcl"] },
      { year: 2019, title: "A gene expression signature wider than the rearrangements", note: "An analysis of 157 germinal-centre diffuse large B-cell lymphomas defined a 104-gene double-hit signature present in 27 per cent of them, only half of which carried the rearrangements; those with the signature had a five-year time to progression of 57 per cent against 81 per cent.", refs: ["myc", "bcl2"] },
      { year: 2022, title: "The two classifications split over MYC and BCL6", note: "Both removed cases with MYC and BCL6 rearrangements from the double-hit entity. WHO-HAEM5 reassigns them by appearance; the International Consensus Classification made them a provisional entity of their own.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "No randomised trial has ever been run in this entity. The intensified regimens used for it were adopted from retrospective comparisons, and whether they are better than standard immunochemotherapy for an individual patient is not known.",
      "The test used to make the diagnosis identifies a narrower group than the biology does: the double-hit gene expression signature marks about twice as many patients as the rearrangements do, and those extra patients have the same outcome and are treated as ordinary diffuse large B-cell lymphoma.",
      "The two 2022 classifications handle MYC with BCL6 differently, so the same biopsy can yield two different diagnoses and two different trial eligibilities.",
    ],
    related: ["dlbcl", "burkitt-lymphoma", "follicular-lymphoma", "non-hodgkin-lymphoma", "primary-mediastinal-b-cell-lymphoma"],
    terms: ["double-hit-lymphoma", "lymphoma-classification-2022", "lymphoma-indolent-versus-aggressive", "ipi-score", "lymphoma-tx-cns-prophylaxis"],
    targets: ["myc", "bcl2"], technologies: ["histopathology-ihc", "fdg-pet"],
    links: [SRC.who5, SRC.icc, PAPER.llmpp, SRC.pdq],
  }),

  // ------------------------------------------------------------------ MEDIASTINAL GREY ZONE
  rec({
    id: "mediastinal-grey-zone-lymphoma", parent: "non-hodgkin-lymphoma",
    name: "Mediastinal grey zone lymphoma",
    wikipedia: W("Primary_mediastinal_B-cell_lymphoma"),
    aka: ["Mediastinal gray zone lymphoma", "MGZL", "Grey zone lymphoma", "Gray zone lymphoma", "B-cell lymphoma, unclassifiable, with features intermediate between DLBCL and classic Hodgkin lymphoma", "B-cell lymphoma unclassifiable", "Intermediate DLBCL/CHL"],
    tldr: "A lymphoma of the chest that sits between two diseases: it has some of the features of primary mediastinal B-cell lymphoma and some of classic Hodgkin lymphoma, and a pathologist cannot put it cleanly in either. It is recognised as an entity of its own, and the 2022 classifications restricted the name to lymphomas that involve the mediastinum.",
    burden: "In the United Kingdom population series that reports lymphoma by subtype, 24 of 5,796 lymphomas (0.4 per cent) were recorded in the category then called intermediate between diffuse large B-cell and classic Hodgkin lymphoma: a crude incidence of 0.22 per 100,000 a year and a European age-standardised rate of 0.08, with men affected about twice as often as women and a median age at diagnosis of 59.3 years. Five-year relative survival in that series was 84.0 per cent, although the numbers are small and the confidence interval ran from 61 to 94 per cent.",
    summary: [
      "What it is. The mediastinum is the space in the middle of the chest between the lungs, and it contains the thymus. Two lymphomas grow there in young adults: primary mediastinal large B-cell lymphoma and nodular sclerosis classic Hodgkin lymphoma. They are biologically related, and some tumours fall between them, with the cell size and sheet-like growth of one and the surface markers of the other. WHO-HAEM5 describes it as a single biological group with a spectrum running from classic Hodgkin lymphoma to primary mediastinal B-cell lymphoma, with mediastinal grey zone lymphoma straddling the two.",
      "How it differs from its neighbours. The distinguishing feature is the mismatch between what the cells look like and what they express. Classic Hodgkin lymphoma has rare large cells in a sea of immune cells and has lost most of its B-cell programme; grey zone lymphoma keeps a high density of tumour cells and keeps the B-cell markers. The International Consensus Classification writes that requirement down: a diagnosis needs both a high density of tumour cells and strong expression of at least two B-cell markers. A tumour that looks like nodular sclerosis Hodgkin lymphoma and happens to express CD20 variably is still Hodgkin lymphoma.",
      "What changed in 2022, and it is the whole of the name. The previous name was B-cell lymphoma, unclassifiable, with features intermediate between diffuse large B-cell lymphoma and classic Hodgkin lymphoma, and it could be applied anywhere in the body. Both 2022 classifications restricted it to the mediastinum, because cases with the same appearance arising elsewhere turned out to have different gene expression and different DNA changes. Those are now classified as diffuse large B-cell lymphoma, not otherwise specified. This is one of the few places where the two classifications agree completely, and it changes the diagnosis of a real group of patients.",
      "How it presents. Almost always as a large mass in the front of the chest in a young adult, more often a man, sometimes causing swelling of the face and arms and breathlessness from pressure on the great veins, which is an emergency. Sequential cases of primary mediastinal B-cell lymphoma and nodular sclerosis Hodgkin lymphoma in the same person have been shown to share a clonal origin, which is part of the evidence that the three diseases are one biological family.",
      "How it is treated. As an aggressive B-cell lymphoma rather than as Hodgkin lymphoma: regimens built for large B-cell lymphoma, with rituximab, are preferred, because the tumour keeps its B-cell markers. There is no randomised trial in this entity and the series are small. The treatment layer of this family and the primary mediastinal B-cell lymphoma page carry the regimens.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: [
      "A high density of tumour cells, which separates it from classic Hodgkin lymphoma",
      "Strong expression of at least two B-cell markers (CD20, CD79a, PAX5), which the International Consensus Classification requires for the diagnosis",
      "CD30 and often CD15, shared with classic Hodgkin lymphoma",
      "Involvement of the mediastinum, which both 2022 classifications now require",
      "Epstein-Barr virus, which is usually negative; an EBV-positive tumour with Hodgkin-like cells is classified as EBV-positive diffuse large B-cell lymphoma instead",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis, and the trap in it", approach: "The diagnosis needs a generous biopsy, because the appearance varies across a single tumour and a core needle may sample only the part that looks like one of the neighbouring diseases. Both 2022 classifications require involvement of the mediastinum: an identical-looking tumour elsewhere in the body is diffuse large B-cell lymphoma, not otherwise specified. A nodular sclerosis classic Hodgkin lymphoma with variable CD20 expression remains Hodgkin lymphoma and is not reclassified here.", refs: ["histopathology-ihc", "cd30", "cd20", "lymphoma-classification-2022"], guideline: whoGuideline },
      { setting: "Treatment", approach: "Treated with regimens designed for aggressive large B-cell lymphoma and containing rituximab, rather than with Hodgkin lymphoma chemotherapy, because the tumour retains its B-cell programme and the surface target with it. Radiotherapy to the residual mediastinal mass is used in some series. There is no randomised trial in this entity, the published series number in the tens, and the regimen is chosen in a multidisciplinary meeting; the detail sits on the primary mediastinal B-cell lymphoma page and in the treatment layer of this family.", refs: ["primary-mediastinal-b-cell-lymphoma", "rituximab", "lymphoma-tx-regimen-alphabet", "lymphoma-tx-radiotherapy", "r-chop"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2008, title: "Named as an unclassifiable category", note: "The fourth edition of the WHO classification created B-cell lymphoma, unclassifiable, with features intermediate between diffuse large B-cell lymphoma and classic Hodgkin lymphoma, which could be diagnosed at any site.", refs: ["hodgkin-lymphoma"] },
      { year: 2021, title: "The mutational landscape of grey zone lymphoma", note: "Sequencing showed that cases arising outside the mediastinum carry different gene expression profiles and DNA alterations from those arising in it, which is the evidence both 2022 classifications used to restrict the name.", refs: ["primary-mediastinal-b-cell-lymphoma"] },
      { year: 2022, title: "Renamed and restricted to the mediastinum", note: "WHO-HAEM5 and the International Consensus Classification both adopted the name mediastinal grey zone lymphoma and both reassigned non-mediastinal cases to diffuse large B-cell lymphoma, not otherwise specified.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "No randomised trial has been run in this entity and none is likely: it is about one lymphoma in 250, so the evidence will stay observational.",
      "Pathologists disagree about the boundary with nodular sclerosis classic Hodgkin lymphoma more often than about almost any other lymphoma boundary, and the treatment that follows the two diagnoses is different.",
      "Whether radiotherapy to a residual mediastinal mass adds anything after modern immunochemotherapy has not been tested here.",
    ],
    related: ["primary-mediastinal-b-cell-lymphoma", "hodgkin-lymphoma", "dlbcl", "non-hodgkin-lymphoma", "ebv-positive-dlbcl"],
    terms: ["lymphoma-classification-2022", "lymphoma-indolent-versus-aggressive", "lugano-classification", "deauville-score", "lymphoma-tx-radiotherapy"],
    targets: ["cd30", "cd20"], technologies: ["histopathology-ihc", "fdg-pet"],
    links: [SRC.who5, SRC.icc, SRC.hmrn, SRC.pdq],
  }),

  // ------------------------------------------------------------------ PRIMARY EFFUSION LYMPHOMA
  rec({
    id: "primary-effusion-lymphoma", parent: "non-hodgkin-lymphoma",
    name: "Primary effusion lymphoma",
    wikipedia: W("Primary_effusion_lymphoma"),
    aka: ["PEL", "Body cavity-based lymphoma", "Extracavitary primary effusion lymphoma", "KSHV/HHV8-associated lymphoma", "HHV8-positive primary effusion lymphoma"],
    tldr: "A rare lymphoma that grows as fluid rather than as a lump: it fills the space around the lungs, the heart or the bowel without forming a mass. It is caused by Kaposi sarcoma herpesvirus and arises mostly in people with advanced HIV infection, and it is diagnosed by sending the fluid itself for testing.",
    burden: "In the United States, 236 adults were recorded in the SEER registries between 2001 and 2021, with a median age of 51 years and 88 per cent of them men. The age-adjusted incidence rose from 1.0 to 1.6 cases per ten million person-years between the first and second halves of that period. Five-year relative survival improved from 21 to 37 per cent across the same two periods, and median overall survival from 4 to 12 months, which the authors attribute to advances in both lymphoma treatment and HIV care.",
    summary: [
      "What it is. A large B-cell lymphoma driven by Kaposi sarcoma herpesvirus, also called human herpesvirus 8, the same virus that causes Kaposi sarcoma. The lymphoma cells float free in a body cavity and produce fluid: a pleural effusion around the lung, a pericardial effusion around the heart, or ascites in the abdomen. Classically there is no tumour mass at all, which is why the diagnosis is made on the fluid.",
      "How it differs from the lymphomas around it. WHO-HAEM5 groups it in a family of conditions caused by the same virus: multicentric Castleman disease, germinotropic lymphoproliferative disorder, primary effusion lymphoma, its extracavitary form, and KSHV/HHV8-positive diffuse large B-cell lymphoma. The classification acknowledges that the boundaries between them are not clean, that individual patients overlap, and that difficult cases should be settled in a multidisciplinary meeting rather than by rule. In particular, telling a lymph node-based extracavitary primary effusion lymphoma from a KSHV/HHV8-positive diffuse large B-cell lymphoma can be arbitrary; the International Consensus Classification prefers the latter diagnosis where Epstein-Barr virus is negative and the tumour expresses IgM lambda.",
      "The lymphoma it is most often confused with, and the 2022 change that separates them. There is a second disease that also presents as lymphoma confined to a body cavity, in older people without immune deficiency who have heart failure, kidney failure or cirrhosis causing fluid to accumulate. It is not caused by Kaposi sarcoma herpesvirus, its cells look like ordinary mature B cells rather than plasmablasts, and it behaves considerably better. WHO-HAEM5 made it a separate entity in 2022, calling it fluid overload-associated large B-cell lymphoma; the International Consensus Classification calls it primary effusion-based lymphoma that is negative for both viruses, and lists it as provisional. Distinguishing the two matters because the outlook is different.",
      "Who gets it. Most often a person with advanced, often undiagnosed, HIV infection; it also occurs after organ transplant and in older people from regions where Kaposi sarcoma herpesvirus is common, including parts of the Mediterranean and sub-Saharan Africa. In people with HIV the tumour usually carries Epstein-Barr virus as well; in older HIV-negative people it usually does not.",
      "How it is diagnosed and treated. The fluid is drained and sent for cell counts, cytology, flow cytometry and immunohistochemistry or in situ hybridisation for the virus. The cells are large and plasmablastic, usually lacking the B-cell markers (CD20 is typically negative) and carrying plasma cell markers instead, which is why anti-CD20 antibodies have no role. Treatment is combination chemotherapy together with full antiretroviral therapy where there is HIV; the regimens, which have never been compared in a randomised trial, sit in the treatment layer of this family and on the HIV-associated lymphoma page.",
    ].join("\n\n"),
    subtypes: ["Classic primary effusion lymphoma, confined to a body cavity, which is an extranodal site with no mass", "Extracavitary primary effusion lymphoma, which forms a mass with the same biology"],
    biomarkers: [
      "Kaposi sarcoma herpesvirus (human herpesvirus 8) in the tumour nuclei, by immunohistochemistry for the latency-associated nuclear antigen; this is the diagnosis",
      "Epstein-Barr virus, usually positive in people with HIV and usually negative in older people without",
      "A plasmablastic phenotype: CD45 positive, CD20 and CD79a usually negative, CD138 and MUM1 positive",
      "HIV status, which changes the whole of the management",
      "Absence of the virus, which moves the diagnosis to fluid overload-associated large B-cell lymphoma and changes the outlook",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis on the fluid", approach: "The effusion is drained and sent, fresh, for cytology, flow cytometry and immunohistochemistry. The diagnosis requires the Kaposi sarcoma herpesvirus latency-associated nuclear antigen in the tumour nuclei. A cavity lymphoma without the virus is a different disease, recognised separately in 2022, that arises in fluid overload from heart failure, kidney failure or cirrhosis and behaves better. HIV testing is part of the work-up in every case.", refs: ["hhv8-kshv", "ebv-term", "histopathology-ihc", "lymphoma-classification-2022"], guideline: whoGuideline },
      { setting: "Treatment", approach: "Combination chemotherapy, with antiretroviral therapy started or optimised at the same time where there is HIV, because controlling the HIV is part of controlling the lymphoma. Anti-CD20 antibodies have no role: the cells do not carry CD20. There has never been a randomised trial in this entity and the regimens come from series and from the HIV-associated lymphoma literature; they sit in the treatment layer of this family and on the HIV-associated lymphoma page. Entry into a trial is a reasonable first choice rather than a last resort.", refs: ["hiv-associated-lymphoma", "cyclophosphamide", "doxorubicin", "etoposide", "lymphoma-tx-regimen-alphabet"], guideline: pdqGuideline },
    ],
    history: [
      { year: 1995, title: "Kaposi sarcoma herpesvirus found in body cavity lymphomas", note: "The virus discovered in Kaposi sarcoma the year before was found in a group of lymphomas that grew in body cavities without forming a mass, which defined the disease." },
      { year: 2022, title: "Separated from the lymphoma it most resembles", note: "WHO-HAEM5 made fluid overload-associated large B-cell lymphoma a separate entity: the same presentation in an older person with heart, kidney or liver failure, without the virus, with a mature B-cell rather than plasmablastic phenotype, and with a better outlook.", refs: ["lymphoma-classification-2022"] },
      { year: 2026, title: "A population picture, and survival that has improved", note: "Across 236 United States patients diagnosed between 2001 and 2021, five-year relative survival rose from 21 to 37 per cent and median overall survival from 4 to 12 months between the first and second halves of the period.", refs: ["hiv-associated-lymphoma"] },
    ],
    openProblems: [
      "There has never been a randomised trial in primary effusion lymphoma, and median overall survival in the most recent population series was 12 months.",
      "The boundaries between the conditions caused by Kaposi sarcoma herpesvirus are acknowledged by the classification itself to be unclear, and individual patients overlap between them.",
      "The commonest route to this diagnosis is advanced, undiagnosed HIV infection, which is a failure of testing rather than of oncology.",
    ],
    related: ["hiv-associated-lymphoma", "dlbcl", "plasmablastic-lymphoma", "non-hodgkin-lymphoma", "kaposi-sarcoma"],
    terms: ["hhv8-kshv", "ebv-term", "lymphoma-classification-2022", "lymphoma-nodal-versus-extranodal", "oncogenic-viruses"],
    technologies: ["histopathology-ihc"],
    links: [SRC.who5, SRC.icc, PAPER.pelSeer, SRC.pdq],
  }),

  // ------------------------------------------------------------------ PLASMABLASTIC LYMPHOMA
  rec({
    id: "plasmablastic-lymphoma", parent: "non-hodgkin-lymphoma",
    name: "Plasmablastic lymphoma",
    wikipedia: W("Plasmablastic_lymphoma"),
    aka: ["PBL", "Plasmablastic lymphoma of the oral cavity", "Plasmablastic lymphoma, HIV-associated"],
    tldr: "An aggressive lymphoma whose cells have taken on the appearance of plasma cells, so they no longer carry the CD20 marker that most B-cell lymphoma treatments aim at. It most often starts in the mouth or jaw, and about half of people diagnosed with it have HIV.",
    summary: [
      "What it is. A large B-cell lymphoma whose cells have travelled most of the way to becoming plasma cells, the antibody factories that B cells turn into at the end of their life. That matters practically rather than philosophically: a plasma cell has switched off CD20, so rituximab and the antibody treatments that follow it cannot see the tumour. Instead the cells carry plasma cell markers, CD138 and MUM1, and the diagnosis is made on that pattern together with a very high proliferation index.",
      "Who gets it. In the largest United States analysis, 1,153 patients in SEER and 1,822 in the National Cancer Database diagnosed between 2010 and 2020, the incidence was 0.07 cases per 100,000 people a year, 77 per cent were men, and half had HIV. In an earlier SEER analysis of 248 treated patients, 82 per cent were men and 71 per cent were under 60, with the mouth and the gastrointestinal tract the commonest starting points at 23 and 19 per cent. It also occurs after organ transplant and in older people with age-related decline in immunity.",
      "The site matters. Disease starting in the mouth was associated with better survival in the SEER analysis, and with less likelihood of advanced stage and of fevers and weight loss. That is a real signal and not only a statistical one: a lump on the gum or in the jaw is noticed early.",
      "What the figures say, and why two of them disagree. The United Kingdom population series that reports lymphoma by subtype found 24 cases among 5,796 lymphomas diagnosed between 2004 and 2012, an age-standardised rate of 0.07 per 100,000, with a five-year relative survival of 17.2 per cent. The United States analysis of patients treated between 2010 and 2020 reported median overall survival of 58.6 months among those who received multi-agent chemotherapy. Those two numbers describe different things: the first is everybody diagnosed in an earlier decade, the second is the subset who were well enough to be treated with combination chemotherapy in a later one. Both are quoted here because quoting only the second would flatter the disease and quoting only the first would date it.",
      "How it is treated. More intensively than ordinary diffuse large B-cell lymphoma, because standard immunochemotherapy without rituximab does less well, and with antiretroviral therapy where there is HIV; HIV status did not affect survival in either of the United States analyses once treatment was given. Many cases carry a MYC rearrangement. Plasma-cell directed drugs such as bortezomib and lenalidomide have been added in series on the logic of the phenotype rather than on randomised evidence. The regimens are in the treatment layer of this family and on the HIV-associated lymphoma page.",
    ].join("\n\n"),
    burden: "An incidence of 0.07 cases per 100,000 people a year in the United States, from the largest analysis to date (1,153 patients in SEER and 1,822 in the National Cancer Database, 2010 to 2020); 77 per cent of patients are men and half have HIV. In the United Kingdom population series, 24 of 5,796 lymphomas diagnosed between 2004 and 2012, an age-standardised rate of 0.07 per 100,000 and a median age of 70.9 years.",
    subtypes: ["HIV-associated plasmablastic lymphoma", "Post-transplant and other immune-deficiency-associated plasmablastic lymphoma", "Plasmablastic lymphoma in an immunocompetent person, usually older"],
    biomarkers: [
      "A plasma cell phenotype: CD138 and MUM1 positive, CD20 and PAX5 usually negative, which is why anti-CD20 antibodies do not work",
      "A very high Ki-67 proliferation index, usually above 80 per cent",
      "Epstein-Barr virus by EBER in situ hybridisation, positive in most HIV-associated cases",
      "MYC rearrangement, found in a large proportion",
      "HIV status, which is positive in about half of patients and should be tested in every one",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis, and why it is missed", approach: "The cells look like plasma cells and the surface markers agree with that appearance, so the differential diagnosis includes myeloma with plasmablastic features rather than other lymphomas. What separates them is the clinical picture: a rapidly growing mass, usually in the mouth or jaw or the gut, in a younger person, often with HIV, with Epstein-Barr virus in the cells and a very high proliferation index. HIV testing belongs in every work-up.", refs: ["histopathology-ihc", "ebv-term", "multiple-myeloma", "myc"], guideline: whoGuideline },
      { setting: "Treatment", approach: "Combination chemotherapy more intensive than standard immunochemotherapy, because there is no CD20 for rituximab to attach to, together with antiretroviral therapy where there is HIV. In the two large United States analyses, HIV status did not affect survival once treatment was given. Drugs used in myeloma, such as bortezomib and lenalidomide, have been added in case series on the basis of the phenotype rather than on randomised evidence. The regimens are in the treatment layer of this family and on the HIV-associated lymphoma page.", refs: ["hiv-associated-lymphoma", "bortezomib", "lenalidomide", "cyclophosphamide", "doxorubicin", "etoposide", "lymphoma-tx-regimen-alphabet"], guideline: pdqGuideline },
    ],
    history: [
      { year: 1997, title: "Described in the mouths of people with HIV", note: "The first series described an aggressive lymphoma of the oral cavity in people with HIV whose cells had a plasma cell phenotype and did not carry CD20." },
      { year: 2020, title: "A population picture of treated patients", note: "Among 248 patients treated with chemotherapy in the SEER registries between 2010 and 2016, three-year overall survival was 54 per cent, and disease starting in the mouth carried better survival than other sites.", refs: ["hiv-associated-lymphoma"] },
      { year: 2024, title: "The largest analysis, and HIV status not a predictor", note: "Across 1,153 SEER and 1,822 National Cancer Database patients, incidence was 0.07 per 100,000 a year, median overall survival among those given multi-agent chemotherapy was 58.6 months, and HIV status had no significant effect on survival." },
    ],
    openProblems: [
      "No randomised trial has been run in plasmablastic lymphoma, and the regimens in use are chosen by analogy with other aggressive lymphomas and with myeloma.",
      "There is no surface target. Every advance in B-cell lymphoma since 1997 has depended on CD20 or CD19, and this disease expresses neither reliably.",
      "Half of patients have HIV, and the disease is a common first presentation of undiagnosed infection, so part of the burden belongs to HIV testing rather than to oncology.",
    ],
    related: ["hiv-associated-lymphoma", "dlbcl", "multiple-myeloma", "primary-effusion-lymphoma", "non-hodgkin-lymphoma"],
    terms: ["ebv-term", "lymphoma-b-versus-t-cell", "lymphoma-classification-2022", "lymphoma-nodal-versus-extranodal"],
    targets: ["myc"], technologies: ["histopathology-ihc", "fdg-pet"],
    drugs: ["bortezomib", "lenalidomide"],
    links: [SRC.who5, SRC.icc, PAPER.pblNcdb, PAPER.pblSeer, SRC.hmrn],
  }),

  // ------------------------------------------------------------------ T-CELL/HISTIOCYTE-RICH
  rec({
    id: "t-cell-histiocyte-rich-large-b-cell-lymphoma", parent: "non-hodgkin-lymphoma",
    name: "T-cell/histiocyte-rich large B-cell lymphoma",
    wikipedia: W("Diffuse_large_B-cell_lymphoma"),
    aka: ["THRLBCL", "T-cell/histiocyte-rich large B-cell lymphoma", "T-cell-rich B-cell lymphoma", "T-cell/histiocyte rich large B cell lymphoma"],
    tldr: "A lymphoma in which the cancer cells are a tiny minority of what the pathologist sees: scattered large B cells in a dense crowd of normal T cells and macrophages. It is a form of large B-cell lymphoma, it usually presents with disease in the liver, spleen or bone marrow, and it is easy to mistake for a different disease in both directions.",
    burden: "In the United Kingdom population series that reports lymphoma by subtype, 32 of 5,796 lymphomas (0.6 per cent) diagnosed between 2004 and 2012, a crude incidence of 0.30 and a European age-standardised rate of 0.10 per 100,000 a year, with a median age at diagnosis of 65.5 years. Five-year relative survival in that series was 67.9 per cent, with a wide confidence interval (46.8 to 82.0 per cent) because of the small number of patients.",
    summary: [
      "What it is. A large B-cell lymphoma in which the malignant cells make up a very small fraction of the tissue. The rest is a reaction: sheets of normal T cells and histiocytes, the tissue form of the macrophage. The diagnosis therefore depends on recognising the scattered large B cells in a background that looks inflammatory, and on the pattern of markers they carry.",
      "How it differs from its family. Ordinary diffuse large B-cell lymphoma is made of sheets of tumour cells. Here the tumour is outnumbered, and the clinical behaviour is different too: it tends to present at an advanced stage with the liver, the spleen and the bone marrow involved rather than with enlarged lymph nodes alone, and it affects men more often and at a younger age than most large B-cell lymphomas.",
      "The boundary problem, which is the most important thing on this page. T-cell/histiocyte-rich large B-cell lymphoma sits at one end of a spectrum whose other end is nodular lymphocyte predominant Hodgkin lymphoma, a condition that usually behaves indolently. WHO-HAEM5 lists six growth patterns of nodular lymphocyte predominant Hodgkin lymphoma, and the last of them, pattern E, is described as diffuse and resembling this disease. The classification states plainly that in some cases a clear distinction may not be possible, and that it is especially difficult on a small biopsy. The International Consensus Classification renamed the Hodgkin disease nodular lymphocyte predominant B-cell lymphoma partly in recognition of that relationship.",
      "The biology agrees that the boundary is soft. In a study that profiled gene expression in the tumour cells themselves, the three conditions did not cluster apart, and only a few genes were consistently different, and those only moderately. What differed was the surrounding tissue, the infiltrating T cells and histiocytes. That is an unusual situation in oncology: two diseases with different names, different stages at presentation and different treatments whose cancer cells look the same at the level of gene expression.",
      "How it is treated. As a diffuse large B-cell lymphoma, with the same immunochemotherapy, which is a reasonable approach for a disease that behaves aggressively and carries CD20. The series are small and no randomised trial has been confined to it. The regimens are on the diffuse large B-cell lymphoma page and in the treatment layer of this family.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: [
      "Scattered large B cells, fewer than about one in ten of the cells present, in a background of small T cells and histiocytes",
      "The large cells express CD20 and BCL6; nuclear BCL6 was positive in 26 of 29 cases in one series",
      "A background rich in CD8-positive T cells and CD68-positive histiocytes, which is part of the diagnosis rather than incidental",
      "Absence of the nodular meshworks of follicular dendritic cells and of the small B cells that mark nodular lymphocyte predominant Hodgkin lymphoma",
      "Epstein-Barr virus, which is characteristically negative",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis, and the two ways it goes wrong", approach: "Both errors are common and they point in opposite directions. Called inflammatory, the lymphoma is missed, because the tumour cells are a small minority and the tissue looks reactive. Called nodular lymphocyte predominant Hodgkin lymphoma, an aggressive disease is treated as an indolent one. WHO-HAEM5 states that a clear distinction from the diffuse pattern of that disease may not be possible in some cases, and that small biopsies are the hardest. A generous biopsy, read by a haematopathologist, with the surrounding cells examined as carefully as the tumour cells, is the answer the classification gives.", refs: ["histopathology-ihc", "nodular-lymphocyte-predominant-hodgkin-lymphoma", "cd20", "lymphoma-classification-2022"], guideline: whoGuideline },
      { setting: "Treatment", approach: "Treated as diffuse large B-cell lymphoma, with rituximab-containing immunochemotherapy, which is appropriate for a disease that carries CD20 and behaves aggressively. The staging usually finds advanced disease with the liver, spleen or bone marrow involved. No randomised trial has been confined to this entity; the regimens, the cycles and the evidence are on the diffuse large B-cell lymphoma page and in the treatment layer of this family.", refs: ["dlbcl", "rituximab", "r-chop", "lymphoma-tx-regimen-alphabet"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2002, title: "Recognised as heterogeneous and germinal-centre derived", note: "A review of 30 cases separated three appearances of the large cells and showed nuclear BCL6 in 26 of 29, placing the tumour cell in the germinal centre." },
      { year: 2013, title: "Gene expression finds no clear line to the Hodgkin disease", note: "Profiling the microdissected tumour cells of nodular lymphocyte predominant Hodgkin lymphoma, its diffuse pattern and this disease found no consistent differences between them; the differences were in the surrounding T cells and histiocytes.", refs: ["nodular-lymphocyte-predominant-hodgkin-lymphoma"] },
      { year: 2022, title: "The relationship written into both classifications", note: "WHO-HAEM5 tabulates six growth patterns of nodular lymphocyte predominant Hodgkin lymphoma and names the diffuse one after this disease; the International Consensus Classification renamed that disease a B-cell lymphoma partly on the strength of the relationship.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "The line between this disease and the diffuse pattern of nodular lymphocyte predominant Hodgkin lymphoma cannot always be drawn, and the two are treated differently.",
      "The cancer cells of the two conditions are not distinguishable by gene expression. What differs is the immune cells around them, and nobody knows why the same tumour cell produces an indolent disease in one person and an aggressive one in another.",
      "No trial has been confined to this entity, so the treatment is borrowed from diffuse large B-cell lymphoma on the strength of the shared surface marker.",
    ],
    related: ["dlbcl", "nodular-lymphocyte-predominant-hodgkin-lymphoma", "hodgkin-lymphoma", "non-hodgkin-lymphoma", "mediastinal-grey-zone-lymphoma"],
    terms: ["lymphoma-classification-2022", "lymphoma-b-versus-t-cell", "lymphoma-indolent-versus-aggressive", "ipi-score"],
    targets: ["cd20"], technologies: ["histopathology-ihc", "fdg-pet"],
    links: [SRC.who5, SRC.icc, PAPER.thrlbclGep, SRC.hmrn],
  }),

  // ------------------------------------------------------------------ EBV-POSITIVE DLBCL
  rec({
    id: "ebv-positive-dlbcl", parent: "non-hodgkin-lymphoma",
    name: "EBV-positive diffuse large B-cell lymphoma",
    wikipedia: W("Diffuse_large_B-cell_lymphoma"),
    aka: ["EBV-positive DLBCL", "EBV-positive diffuse large B-cell lymphoma, NOS", "EBV-positive diffuse large B-cell lymphoma of the elderly", "Epstein-Barr virus-positive diffuse large B-cell lymphoma", "EBV+ DLBCL"],
    tldr: "A diffuse large B-cell lymphoma in which Epstein-Barr virus, the virus of glandular fever, is present in the tumour cells. It is diagnosed by a stain on the biopsy, it is commoner in east Asia and Latin America than in Europe, and it is treated in the same way as diffuse large B-cell lymphoma without the virus.",
    burden: "How common it is depends on where the series was collected, which is the most useful thing to know about it. In a European tissue microarray study, 8 of 258 diffuse large B-cell lymphomas met the criteria, about 3.1 per cent. In a direct comparison of two populations, 9 of 136 Mexican cases (7 per cent) were positive against 4 of 169 German cases (2 per cent), with a median age of 66 years in Mexico and 77 in Germany. Series from east Asia, where the entity was first described, report higher proportions.",
    summary: [
      "What it is. Epstein-Barr virus infects almost everybody by adulthood and then lives quietly inside B cells for life. In a small proportion of diffuse large B-cell lymphomas the virus is present in the tumour cells themselves, detectable by a stain called EBER in situ hybridisation. WHO-HAEM5 recognises that group as an entity in its own right and, in 2022, dropped the qualifier that had restricted it to older people.",
      "How it differs from its family. Not much, in the clinic. It behaves as a diffuse large B-cell lymphoma and is treated as one. What differs is how it is recognised and how it is counted. The European study that found 3.1 per cent noted that no appearance and no immunohistochemical marker reliably identified the positive cases, and that only in situ hybridisation for the viral RNA found them; necrosis was present in two-thirds of positive cases and CD30 in half, but neither was specific. The practical recommendation that came out of that work was to run the stain on every new diffuse large B-cell lymphoma in a person over 50.",
      "Why it is the hardest entity in the classification to place. WHO-HAEM5 reorganised the lymphomas of immune deficiency and dysregulation in 2022 around a three-part description: the histological diagnosis, the virus, and the immune setting. That created an unresolved boundary, which the classification states as a question rather than hiding: should an older person with a diffuse large B-cell lymphoma carrying Epstein-Barr virus be diagnosed with this entity, or with diffuse large B-cell lymphoma arising in immune deficiency, on the assumption that their immune system has aged? The classification says the answer awaits further data and that some of the terminology is arbitrary. A reader should take from that that a label of EBV-positive diffuse large B-cell lymphoma is a description of a finding, not a different disease requiring different treatment.",
      "The boundary the other way. Lymphomatoid granulomatosis is a separate Epstein-Barr virus-driven B-cell disease that, by definition, involves the lung; a similar lesion confined to the brain or gut in somebody with an immune deficiency is classified as EBV-positive diffuse large B-cell lymphoma rather than as lymphomatoid granulomatosis. The International Consensus Classification also keeps nearly all EBV-positive diffuse large B-cell lymphomas out of the mediastinal grey zone category even when they contain Hodgkin-like cells, because the genomes differ.",
      "How it is treated. As diffuse large B-cell lymphoma, with the same immunochemotherapy. The European series found no relationship between the virus and outcome except in the subgroup with the broadest pattern of viral gene expression. The regimens are on the diffuse large B-cell lymphoma page.",
    ].join("\n\n"),
    subtypes: ["Polymorphic type, which contains a mixture of cell sizes", "Monomorphic type, which looks like ordinary diffuse large B-cell lymphoma"],
    biomarkers: [
      "Epstein-Barr virus in the tumour cells by EBER in situ hybridisation, which is the only reliable way to find it",
      "A non-germinal-centre phenotype in most cases: CD10 negative, MUM1 positive",
      "LMP1, the viral membrane protein, expressed in most positive cases",
      "CD30, expressed in about half of cases and not specific",
      "The immune setting: transplant, HIV, immunosuppressive therapy or none identified, which decides whether the diagnosis is this entity or a lymphoma of immune deficiency",
    ],
    standardOfCare: [
      { setting: "Finding it", approach: "In situ hybridisation for Epstein-Barr-encoded RNA on the biopsy. The European series that put the frequency at 3.1 per cent found that no morphological or immunohistochemical feature reliably identified the positive cases, and recommended running the stain on every new diffuse large B-cell lymphoma in a person over 50. Necrosis and CD30 expression are common in positive cases but neither is specific enough to select who to test.", refs: ["ebv-term", "histopathology-ihc", "cd30"], guideline: whoGuideline },
      { setting: "Treatment", approach: "The same immunochemotherapy as diffuse large B-cell lymphoma without the virus; the presence of Epstein-Barr virus does not currently change the regimen. Where there is an identifiable cause of immune suppression, reducing it is part of the treatment, as it is for the post-transplant lymphoproliferative disorders. The regimens are on the diffuse large B-cell lymphoma page and in the treatment layer of this family.", refs: ["dlbcl", "rituximab", "r-chop", "post-transplant-lymphoproliferative-disorder", "lymphoma-tx-regimen-alphabet"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2008, title: "Introduced as a provisional entity of the elderly", note: "The fourth edition of the WHO classification added EBV-positive diffuse large B-cell lymphoma of the elderly, largely on the strength of east Asian series." },
      { year: 2011, title: "Shown to vary by population", note: "A direct comparison found the virus in 7 per cent of 136 Mexican diffuse large B-cell lymphomas against 2 per cent of 169 German ones, with the Mexican patients a decade younger at diagnosis." },
      { year: 2022, title: "The age qualifier dropped, and the boundary left open", note: "WHO-HAEM5 renamed the entity EBV-positive diffuse large B-cell lymphoma and stated that where it ends and lymphoma of immune deficiency and dysregulation begins is not yet settled.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "The classification itself says the boundary between this entity and a lymphoma arising from an ageing immune system is arbitrary, and nobody has defined immune senescence in a way that could settle it.",
      "The virus is present in the tumour and no treatment aims at it. Virus-specific T cells and other approaches used after transplant have not been tested here.",
      "Almost all of the original evidence came from east Asia, and the frequency in European and North American populations is several times lower, so the entity's natural history outside Asia rests on small series.",
    ],
    related: ["dlbcl", "post-transplant-lymphoproliferative-disorder", "lymphomatoid-granulomatosis", "hiv-associated-lymphoma", "non-hodgkin-lymphoma"],
    terms: ["ebv-term", "lymphoma-classification-2022", "oncogenic-viruses", "lymphoma-b-versus-t-cell"],
    targets: ["cd30"], technologies: ["histopathology-ihc", "fdg-pet"],
    links: [SRC.who5, SRC.icc, PAPER.ebvEurope, PAPER.ebvMexico],
  }),

  // ------------------------------------------------------------------ PRIMARY TESTICULAR
  rec({
    id: "primary-testicular-lymphoma", parent: "non-hodgkin-lymphoma",
    name: "Primary large B-cell lymphoma of the testis",
    wikipedia: W("Primary_testicular_diffuse_large_B-cell_lymphoma"),
    aka: ["Primary testicular lymphoma", "PTL", "Primary testicular diffuse large B-cell lymphoma", "Testicular lymphoma", "Primary diffuse large B-cell lymphoma of the testis", "Primary large B-cell lymphoma of immune-privileged sites"],
    tldr: "A large B-cell lymphoma that starts in a testicle rather than in a lymph node, usually in a man over 60, and shows itself as a painless swelling. It is the commonest cancer of the testicle in older men, and it behaves as one disease with lymphoma of the brain and of the eye, which is why treatment deliberately protects both.",
    burden: "In the United States SEER registries, 769 men with primary testicular diffuse large B-cell lymphoma were identified between 1980 and 2005, with a median age at diagnosis of 68.0 years and an incidence that rose over the period; a later SEER analysis identified 1,169 patients between 1973 and 2013, median age 70 years, of whom 82.9 per cent had diffuse large B-cell lymphoma and 68.6 per cent had stage I or II disease at diagnosis. The corpus does not quote a United Kingdom incidence figure, because no source it could verify publishes one for this entity.",
    summary: [
      "What it is. A diffuse large B-cell lymphoma arising inside a testicle. It presents as a firm, usually painless swelling, and it is the commonest malignant tumour of the testis in men over 60, an age at which the germ cell tumours of younger men have become rare. The diagnosis is usually made on the testicle after it has been removed, because a solid testicular mass is removed rather than biopsied.",
      "How it differs from its family, and this is the whole of the management. The testis is an immune-privileged site: a barrier of cells keeps the immune system out, which protects developing sperm from being attacked and also shelters a lymphoma from immune surveillance and from many drugs. The brain and the inside of the eye are protected in the same way. WHO-HAEM5 recognised in 2022 that large B-cell lymphomas at those three sites are one entity, which it called primary large B-cell lymphoma of immune-privileged sites, because they share an activated B-cell phenotype, concurrent MYD88 and CD79B mutations, loss of the machinery that displays antigen to the immune system, and a habit of relapsing in each other: a testicular lymphoma comes back in the brain or in the other testicle, and a lymphoma of the eye follows or precedes one in the brain.",
      "Where the two classifications disagree. The International Consensus Classification discussed the same grouping and decided it was premature, on the grounds that lymphomas at some of those sites are heterogeneous and that a pathologist often does not know whether other sites are involved. It nevertheless recognises primary diffuse large B-cell lymphoma of the testis as a specific entity in its own right, closely related to lymphoma of the central nervous system and sharing the same genetic subgroup. So the two books agree about the biology and differ about the filing.",
      "How it is treated, and why three things are done at once. The trial that set the standard, IELSG-10, treated 53 men with stage I or II disease with six to eight cycles of rituximab with cyclophosphamide, doxorubicin, vincristine and prednisone, four doses of methotrexate into the spinal fluid, and 30 Gy of radiotherapy to the remaining testicle, with the regional lymph nodes irradiated in stage II. At a median follow-up of 65 months, five-year progression-free survival was 74 per cent and overall survival 85 per cent. Ten patients relapsed, three of them in the central nervous system, giving a five-year cumulative incidence of relapse in the brain or spinal cord of 6 per cent. No patient relapsed in the remaining testicle. Those last two numbers are the reason the regimen looks the way it does.",
      "What is still unsettled. Irradiating the remaining testicle prevents relapse there but causes infertility and low testosterone, which matters to a minority of men who are diagnosed young. Whether methotrexate into the spinal fluid is the right prophylaxis against disease in the brain, or whether high-dose intravenous methotrexate would do better, has not been settled by a randomised trial. In the SEER analysis covering 1980 to 2005, survival in testicular lymphoma did not improve after rituximab came into use in the way it did in lymphoma of the lymph nodes, which the authors noted explicitly.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: [
      "An activated B-cell (non-germinal-centre) phenotype: CD10 negative, MUM1 positive, BCL6 positive",
      "Concurrent MYD88 and CD79B mutations, the genetic signature shared with lymphoma of the brain and of the eye",
      "Loss of MHC class I and II and of beta-2-microglobulin, which is how the tumour escapes immune recognition",
      "Epstein-Barr virus, which is characteristically negative",
      "Imaging of the brain and examination of the spinal fluid at diagnosis, because the central nervous system is where this disease relapses",
    ],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "A solid testicular mass is removed through the groin rather than biopsied, so the diagnosis is usually made on the removed testicle. Staging then has to cover the sites this disease travels to: computed tomography or PET-CT of the body, imaging of the brain, examination of the spinal fluid, and examination of the remaining testicle. Sperm banking is discussed before treatment where it is relevant, because radiotherapy to the remaining testicle causes infertility and low testosterone.", refs: ["fdg-pet", "lymphoma-tx-fertility-preservation", "lugano-classification", "histopathology-ihc"], guideline: pdqGuideline },
      { setting: "First-line treatment of stage I and II disease", approach: "Rituximab with cyclophosphamide, doxorubicin, vincristine and prednisone for six to eight cycles, methotrexate into the spinal fluid, and radiotherapy to the remaining testicle. In IELSG-10, which treated 53 men this way, five-year progression-free survival was 74 per cent and overall survival 85 per cent at a median follow-up of 65 months; the five-year cumulative incidence of relapse in the central nervous system was 6 per cent and there were no relapses in the irradiated testicle. Grade 3 or 4 neutropenia occurred in 28 per cent and infection in 4 per cent.", refs: ["rituximab", "cyclophosphamide", "doxorubicin", "vincristine", "prednisone", "methotrexate", "intrathecal-therapy", "imrt-igrt", "lymphoma-tx-cns-prophylaxis"], guideline: { version: "IELSG-10 (J Clin Oncol 2011); NCI PDQ adult non-Hodgkin lymphoma treatment", url: PAPER.ielsg10.url } },
      { setting: "What happens at relapse", approach: "Relapse is most often in the central nervous system, and it is treated on the pathway for lymphoma of the brain rather than on the pathway for nodal lymphoma: regimens built around high-dose methotrexate that crosses into the brain, and consideration of high-dose therapy with an autologous stem cell transplant using a conditioning regimen that also reaches the brain. The detail is on the primary central nervous system lymphoma page.", refs: ["primary-cns-lymphoma", "methotrexate", "autologous-stem-cell-transplant", "lymphoma-tx-transplant-role"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2009, title: "A population picture, and a gain that did not arrive", note: "Across 769 men in the SEER registries diagnosed between 1980 and 2005, median overall survival was 4.6 years and disease-specific survival was 71.5 per cent at three years, 62.4 per cent at five and 43.0 per cent at fifteen. Unlike nodal diffuse large B-cell lymphoma, disease-specific survival did not improve after the year 2000, when rituximab came into use.", refs: ["rituximab"] },
      { year: 2011, title: "IELSG-10 sets the standard", note: "Fifty-three men with stage I or II disease treated with rituximab-containing chemotherapy, methotrexate into the spinal fluid and radiotherapy to the remaining testicle: five-year progression-free survival 74 per cent, overall survival 85 per cent, no relapse in the irradiated testicle and a 6 per cent five-year risk of relapse in the central nervous system.", refs: ["rituximab", "methotrexate"] },
      { year: 2022, title: "Grouped with lymphoma of the brain and the eye, by one classification of two", note: "WHO-HAEM5 created primary large B-cell lymphoma of immune-privileged sites, covering the central nervous system, the vitreoretina and the testis. The International Consensus Classification judged the grouping premature but recognised testicular lymphoma as an entity closely related to the central nervous system disease.", refs: ["primary-cns-lymphoma", "lymphoma-classification-2022"] },
    ],
    openProblems: [
      "Radiotherapy to the remaining testicle prevents relapse there and causes permanent infertility and low testosterone. Nobody has tested whether it can be omitted in men who receive modern systemic treatment.",
      "The best way to protect the brain is not known. IELSG-10 used methotrexate into the spinal fluid; high-dose intravenous methotrexate reaches the brain tissue better and has not been compared against it in a randomised trial.",
      "Survival in this disease did not improve after rituximab came into use in the way it did for lymphoma of the lymph nodes, and the reason is not established.",
    ],
    related: ["primary-cns-lymphoma", "dlbcl", "testicular", "non-hodgkin-lymphoma", "intravascular-large-b-cell-lymphoma"],
    terms: ["lymphoma-nodal-versus-extranodal", "lymphoma-classification-2022", "lymphoma-tx-cns-prophylaxis", "lymphoma-tx-fertility-preservation", "myd88-l265p", "ipi-score"],
    technologies: ["histopathology-ihc", "fdg-pet", "imrt-igrt"],
    drugs: ["rituximab", "methotrexate"],
    links: [SRC.who5, SRC.icc, PAPER.ielsg10, PAPER.ptlSeer, SRC.pdq],
  }),

  // ------------------------------------------------------------------ GASTRIC MALT
  rec({
    id: "gastric-malt-lymphoma", parent: "malt-lymphoma",
    name: "Gastric MALT lymphoma",
    wikipedia: W("MALT_lymphoma"),
    aka: ["Gastric mucosa-associated lymphoid tissue lymphoma", "Gastric marginal zone lymphoma", "Gastric MALToma", "Extranodal marginal zone lymphoma of the stomach", "Helicobacter pylori-associated gastric lymphoma", "Primary gastric lymphoma"],
    tldr: "A slow-growing MALT lymphoma that grows in the lining of the stomach, usually caused by a long-standing infection with the bacterium Helicobacter pylori. It is the one lymphoma that is often cured by a fortnight of antibiotics, and a single chromosome change predicts the minority in whom antibiotics will not work.",
    burden: "No separate incidence figure for the stomach is published in the United Kingdom population series, which counts all extranodal marginal zone lymphomas together: 211 of 5,796 lymphomas (3.6 per cent), a European age-standardised rate of 0.60 per 100,000 a year, a median age at diagnosis of 68.8 years and five-year relative survival of 87.9 per cent across all extranodal sites. The stomach is the commonest of those sites. The corpus does not quote a gastric-only incidence figure because it could not verify one.",
    summary: [
      "What it is. The stomach has no lymphoid tissue of its own. Chronic infection with Helicobacter pylori creates some, as part of the immune response to the bacterium, and over years a clone of B cells in that tissue can become a lymphoma. The lymphoma depends on the signals the infection provides, which is the reason for the treatment that follows.",
      "How it differs from its parent. Extranodal marginal zone lymphoma of mucosa-associated lymphoid tissue arises at many sites and the sites differ genetically: WHO-HAEM5 sets out that ocular adnexal disease commonly carries mutation or deletion of TNFAIP3, salivary gland disease carries recurrent GPR34 mutation, and thyroid disease carries deleterious mutations of CD274, TNFRSF14 or TET2. What the stomach has, and only the stomach and the lung among the common sites, is the translocation t(11;18)(q21;q21), which fuses BIRC3 to MALT1. WHO-HAEM5 states its clinical application in one sentence: that fusion identifies the cases of gastric extranodal marginal zone lymphoma that will not respond to eradication of Helicobacter pylori.",
      "How it presents and how it is found. Indigestion, pain, nausea, anaemia from slow bleeding, or nothing at all, found when an endoscopy is done for something else. The appearance at endoscopy is often unimpressive: thickened folds, redness, erosions, rather than an obvious tumour. Multiple biopsies are taken from the abnormal area and from each part of the normal-looking stomach, because the lymphoma is patchy. The depth of the lymphoma in the stomach wall is measured by endoscopic ultrasound, and the depth is part of the decision about antibiotics.",
      "The treatment, and the numbers behind it. Eradicating Helicobacter pylori is the first treatment, and in early disease it is often the only one. In a prospective multicentre trial that followed 120 patients with stage I disease for a median of 75 months, 80 per cent (96 of 120) achieved a complete histological remission, 80 per cent of those remained in continuous remission, 3 per cent relapsed and were referred for other treatment, and five-year survival was 90 per cent. Seventeen per cent of those in remission showed residual lymphoma histologically at some point during follow-up; they were watched rather than treated and all entered a second remission, which is the evidence for not reacting to a single abnormal biopsy. Fifteen per cent of the lymphomas carried t(11;18), and both that translocation and a persisting monoclonal band were associated with a higher risk of not responding or of relapsing, although both were also found in patients who stayed in remission.",
      "What follows if antibiotics do not work. Radiotherapy to the stomach at a low dose, or an anti-CD20 antibody, or both, depending on the stage and on whether the translocation is present. Surgery has essentially no role, which is the main thing that separates this disease from gastric adenocarcinoma. Follow-up is by repeated endoscopy and biopsy, and a small number of people develop a gastric carcinoma later, so the endoscopies serve two purposes. The regimens sit in the treatment layer of this family and on the MALT lymphoma page.",
    ].join("\n\n"),
    subtypes: ["Helicobacter pylori-positive, the great majority", "Helicobacter pylori-negative, in which a minority still respond to eradication therapy", "With t(11;18)(q21;q21) producing BIRC3::MALT1, which predicts failure of eradication therapy"],
    biomarkers: [
      "Helicobacter pylori, by histology, urea breath test, stool antigen or serology; more than one test is used because treatment with acid suppression makes the biopsy unreliable",
      "t(11;18)(q21;q21) giving BIRC3::MALT1, found in about 15 per cent, which predicts that eradication will not work",
      "Depth of invasion of the stomach wall on endoscopic ultrasound, which predicts response to eradication",
      "A monoclonal immunoglobulin heavy chain rearrangement, which often persists after histological remission and does not by itself mean treatment has failed",
      "Trisomy 3 and trisomy 18, common across all marginal zone lymphomas",
      "Large cells on the biopsy, which mean transformation to diffuse large B-cell lymphoma and change the treatment entirely",
    ],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "Endoscopy with multiple biopsies from the abnormal area and from every region of the stomach, because the lymphoma is patchy and a single biopsy can miss it. Helicobacter pylori is sought by more than one method. Endoscopic ultrasound measures how deep the lymphoma goes, which predicts whether antibiotics alone will work; in a prospective comparison against the resected stomach it judged the depth correctly in 91.5 per cent of cases. Fluorescence in situ hybridisation for t(11;18) is done where it will change the plan. Staging uses the gastrointestinal system that counts depth and node involvement rather than the ordinary node-region count.", refs: ["endoscopy", "endoscopic-ultrasound-systems", "lymphoma-lugano-gastrointestinal", "histopathology-ihc", "paper-wotherspoon-h-pylori-malt-lancet-1993"], guideline: whoGuideline },
      { setting: "First treatment: eradicate the bacterium", approach: "A standard eradication regimen of a proton pump inhibitor with two antibiotics, chosen by local resistance patterns, is the first treatment for Helicobacter pylori-positive disease and is also offered in negative disease, where a minority still respond. Success is confirmed by a breath or stool test after treatment, and the lymphoma is then followed by repeated endoscopy and biopsy over months, because regression is slow. In the prospective series of 120 patients with stage I disease, 80 per cent achieved complete histological remission and 80 per cent of those remained in continuous remission at a median follow-up of 75 months.", refs: ["lymphoma-tx-h-pylori-eradication", "endoscopy", "lymphoma-tx-watch-and-wait", "lymphoma-lugano-gastrointestinal"], guideline: { version: "Fischbach, J Clin Oncol 2005; ESMO marginal zone lymphoma guideline; NCI PDQ", url: PAPER.fischbach.url } },
      { setting: "Residual disease on a follow-up biopsy", approach: "Residual lymphoma on a biopsy after successful eradication is common and usually does not need treatment. In the same series, 17 per cent of those who had reached complete remission later showed histological residual disease; they were watched rather than treated, and all of them entered a second remission. A persisting monoclonal band in the immunoglobulin genes is also common and is not by itself a reason to treat. What does need action is growth, new symptoms, or large cells appearing on the biopsy.", refs: ["lymphoma-tx-watch-and-wait", "endoscopy", "histopathology-ihc"], guideline: { version: "Fischbach, J Clin Oncol 2005", url: PAPER.fischbach.url } },
      { setting: "When antibiotics do not work, or cannot", approach: "Radiotherapy to the stomach at a low dose is the usual next step for disease that stays localised, and anti-CD20 antibody treatment, alone or with chemotherapy, for disease that has spread or that carries t(11;18) and is therefore unlikely to respond to eradication. Surgery has essentially no role at any stage, which is the main difference from gastric cancer. The regimens, the doses and the evidence are on the MALT lymphoma page and in the treatment layer of this family.", refs: ["malt-lymphoma", "rituximab", "lymphoma-tx-radiotherapy", "bendamustine", "paper-esmo-marginal-zone-lymphoma-zucca-ann-oncol-2020"], guideline: pdqGuideline },
    ],
    history: [
      { year: 1993, title: "Regression after antibiotics", note: "Wotherspoon and colleagues showed in the Lancet that eradicating Helicobacter pylori made gastric MALT lymphoma regress, the first time an antibiotic had been shown to treat a cancer.", refs: ["paper-wotherspoon-h-pylori-malt-lancet-1993", "lymphoma-tx-h-pylori-eradication"] },
      { year: 2005, title: "Long-term follow-up confirms the remissions hold", note: "In 120 patients with stage I disease followed for a median of 75 months, 80 per cent reached complete histological remission, 80 per cent of those stayed in it, five-year survival was 90 per cent, and 15 per cent of lymphomas carried t(11;18), which predicted failure to respond." },
      { year: 2022, title: "The translocation named as the clinical test", note: "WHO-HAEM5 sets out that BIRC3::MALT1 from t(11;18) is recurrent in gastric and pulmonary disease and rare at other sites, and that it identifies the gastric cases that will not respond to eradication.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "Helicobacter pylori resistance to clarithromycin is rising in many countries, and the first treatment for this lymphoma is an antibiotic regimen that is becoming less reliable.",
      "There is no agreed definition of how long to watch residual lymphoma on biopsy before treating it, and the evidence that watching is safe comes from one prospective series.",
      "Nobody knows why a minority of Helicobacter pylori-negative gastric MALT lymphomas respond to eradication therapy anyway.",
    ],
    related: ["malt-lymphoma", "marginal-zone-lymphoma", "ocular-adnexal-malt-lymphoma", "gastric", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-tx-h-pylori-eradication", "lymphoma-lugano-gastrointestinal", "lymphoma-nodal-versus-extranodal", "lymphoma-indolent-versus-aggressive", "lymphoma-tx-watch-and-wait", "lymphoma-transformation"],
    technologies: ["histopathology-ihc", "endoscopic-ultrasound-systems"],
    drugs: ["rituximab", "bendamustine"],
    keyPapers: ["paper-wotherspoon-h-pylori-malt-lancet-1993", "paper-esmo-marginal-zone-lymphoma-zucca-ann-oncol-2020"],
    links: [SRC.who5, PAPER.fischbach, SRC.hmrn, SRC.pdq],
  }),

  // ------------------------------------------------------------------ OCULAR ADNEXAL MALT
  rec({
    id: "ocular-adnexal-malt-lymphoma", parent: "malt-lymphoma",
    name: "Ocular adnexal MALT lymphoma",
    wikipedia: W("MALT_lymphoma"),
    aka: ["Ocular adnexal marginal zone lymphoma", "OAMZL", "Orbital lymphoma", "Conjunctival lymphoma", "Lacrimal gland lymphoma", "Ocular adnexal lymphoma", "Eyelid lymphoma", "Salmon patch lymphoma"],
    tldr: "A slow-growing MALT lymphoma of the tissues around the eye: the conjunctiva, the eye socket, the tear gland or the eyelid. It usually shows itself as a painless salmon-pink patch on the white of the eye or as an eye that has begun to bulge, and it is controlled in almost everybody, often by a short course of radiotherapy.",
    burden: "No separate incidence figure for the ocular adnexa is published in the United Kingdom population series, which counts all extranodal marginal zone lymphomas together: 211 of 5,796 lymphomas, a European age-standardised rate of 0.60 per 100,000 a year and five-year relative survival of 87.9 per cent across all extranodal sites. In a Taiwanese series of 112 patients with lymphoma of the orbit and ocular adnexa, 67.9 per cent were MALT lymphomas, the mean age was 59 years, and disease-specific survival was 93.1 per cent at five years and 87.7 per cent at ten.",
    summary: [
      "What it is. The tissues around the eye, the conjunctiva that lines the eyelids and covers the white of the eye, the orbit the eye sits in, the tear gland and the eyelids, are collectively the ocular adnexa. A marginal zone lymphoma arising there grows slowly and causes trouble by taking up space rather than by destroying anything. Three-quarters of lymphomas in this location are MALT lymphomas; the rest are follicular lymphoma, diffuse large B-cell lymphoma or others, which is why a biopsy is needed before anything is decided.",
      "How it shows itself. A flat, salmon-pink patch under the conjunctiva that has been there for months; a painless swelling of the eyelid; an eye that has begun to bulge forward or to sit slightly out of line; double vision; a lump at the outer corner where the tear gland is. Pain, rapid growth and loss of vision are unusual and suggest a different, more aggressive lymphoma. Both sides are involved in a substantial minority, so the other eye is always examined.",
      "How it differs from its parent and from its sibling in the stomach. WHO-HAEM5 sets out that marginal zone lymphomas differ genetically by the site they arise in, and that ocular adnexal disease has its own profile: mutation or deletion of TNFAIP3 is common, and gain of chromosome 6p with loss of 6q is recurrent here and not at other extranodal sites. The translocation that governs treatment in the stomach, t(11;18), is rare here.",
      "The bacterium, and the honest version of the story. In Italian studies, the ocular adnexal lymphomas were associated with Chlamydia psittaci, the bacterium of psittacosis, and a course of doxycycline produced lymphoma regression in about two-thirds of patients in prospective trials. That association does not hold everywhere. A United States study tested 28 ocular adnexal lymphoma specimens with two different polymerase chain reaction assays and found no Chlamydia psittaci DNA in any of them, and noted that the association has been reported internationally with great variability. So whether an antibiotic is worth trying depends on where the patient lives and what the local series show, and a reader told that this lymphoma is caused by an infection should ask which population that finding came from.",
      "How it is treated. For disease confined to the orbit, low-dose radiotherapy is the usual treatment and it is effective. In a series of 28 patients who were given doxycycline first and whose lymphoma relapsed or progressed, salvage radiotherapy at 30 to 36 Gy in 15 to 18 fractions produced a response in every patient and a complete response in 89 per cent, with 4-year progression-free survival of 74 per cent; the recorded toxicity was three cases of grade 2 cataract and three of grade 1 blepharitis, and all but one patient was alive at a median follow-up of 96 months from diagnosis. That paper also answers the question it was written to answer: delaying radiotherapy while an antibiotic is tried did not cost those patients their chance of cure. Very low doses of radiotherapy, around 4 Gy in two fractions, are used in some centres to spare the lens and the tear gland, with retreatment if needed. Disease that has spread beyond the orbit is treated systemically, like any other marginal zone lymphoma.",
    ].join("\n\n"),
    subtypes: ["Conjunctival, the salmon-pink patch on the white of the eye", "Orbital, an extranodal site behind the eye", "Lacrimal gland", "Eyelid", "Bilateral, which occurs in a substantial minority"],
    biomarkers: [
      "A marginal zone phenotype: CD20 positive, CD5 negative, CD10 negative, often with plasmacytic differentiation",
      "TNFAIP3 mutation or deletion, commoner here than at other marginal zone sites",
      "Gain of chromosome 6p and loss of 6q, recurrent in ocular adnexal disease and not at other extranodal sites",
      "Chlamydia psittaci, found in Italian series and absent from several United States series; the association varies by region",
      "Staging of the orbit by magnetic resonance imaging, and of the rest of the body to exclude disease elsewhere",
    ],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "A biopsy of the lesion is needed, because about a third of lymphomas at this site are not marginal zone lymphomas and the treatment differs. Imaging of the orbit, usually by magnetic resonance, maps the extent and the relationship to the optic nerve and the muscles. Staging of the rest of the body follows, because apparently localised ocular disease is sometimes part of a systemic marginal zone lymphoma. Both orbits are examined; bilateral disease is common and does not by itself mean the lymphoma has spread.", refs: ["histopathology-ihc", "lugano-classification", "fdg-pet", "lymphoma-nodal-versus-extranodal"], guideline: whoGuideline },
      { setting: "Localised disease: radiotherapy, and an antibiotic where the evidence supports it", approach: "Radiotherapy to the orbit is the standard treatment for disease confined to the ocular adnexa and it controls it in almost everybody. In a series of 28 patients irradiated after a trial of doxycycline, 30 to 36 Gy in 15 to 18 fractions produced a response in all of them and a complete response in 89 per cent, with four-year progression-free survival of 74 per cent and little toxicity beyond three cases of grade 2 cataract and three of grade 1 blepharitis. Very low-dose schedules of about 4 Gy in two fractions are used to spare the lens and the tear gland, with retreatment if the lymphoma returns. Where local series have shown an association with Chlamydia psittaci, a course of doxycycline is a reasonable first step, and the same series shows that trying it first did not cost patients their response to radiotherapy afterwards.", refs: ["imrt-igrt", "lymphoma-tx-radiotherapy", "palliative-radiotherapy"], guideline: { version: "Advances in Radiation Oncology 2025, salvage irradiation after Chlamydia psittaci eradication; NCI PDQ", url: PAPER.oamztSalvage.url } },
      { setting: "Disease beyond the orbit", approach: "Treated as any other marginal zone lymphoma: watched where it is causing no trouble, and treated with an anti-CD20 antibody alone or with chemotherapy when it is. The regimens, the thresholds for starting and the evidence are on the marginal zone and MALT lymphoma pages and in the treatment layer of this family.", refs: ["marginal-zone-lymphoma", "malt-lymphoma", "rituximab", "bendamustine", "lymphoma-tx-watch-and-wait", "paper-esmo-marginal-zone-lymphoma-zucca-ann-oncol-2020"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2004, title: "Chlamydia psittaci reported in Italian series", note: "Italian investigators reported the bacterium of psittacosis in ocular adnexal marginal zone lymphomas and showed that doxycycline produced regression in a proportion of patients." },
      { year: 2007, title: "The association not found in the United States", note: "A United States study tested 28 ocular adnexal lymphoma specimens with two polymerase chain reaction assays and found no Chlamydia psittaci DNA, and noted that the association has been reported internationally with great variability." },
      { year: 2025, title: "Trying the antibiotic first does not cost the radiotherapy", note: "In 28 patients whose lymphoma relapsed or progressed after doxycycline, salvage radiotherapy produced a response in every one and a complete response in 89 per cent, with four-year progression-free survival of 74 per cent.", refs: ["lymphoma-tx-radiotherapy"] },
    ],
    openProblems: [
      "Whether Chlamydia psittaci causes this lymphoma depends on where the series was collected, and the question has not been settled in twenty years. A patient in Britain cannot be told with confidence whether an antibiotic is worth trying.",
      "The right radiotherapy dose is unresolved: the conventional 24 to 36 Gy controls the lymphoma and causes cataract and dry eye, while very low doses of about 4 Gy spare both and have not been compared head to head here.",
      "Bilateral disease is common and is sometimes counted as stage IV and sometimes as two localised sites, which changes the treatment a patient is offered.",
    ],
    related: ["malt-lymphoma", "marginal-zone-lymphoma", "gastric-malt-lymphoma", "non-hodgkin-lymphoma", "primary-cutaneous-marginal-zone-lymphoma"],
    terms: ["lymphoma-nodal-versus-extranodal", "lymphoma-indolent-versus-aggressive", "lymphoma-tx-radiotherapy", "lymphoma-tx-watch-and-wait", "lugano-classification"],
    technologies: ["histopathology-ihc", "imrt-igrt"],
    drugs: ["rituximab"],
    keyPapers: ["paper-esmo-marginal-zone-lymphoma-zucca-ann-oncol-2020"],
    links: [SRC.who5, PAPER.oamztSalvage, PAPER.oamztNoCp, PAPER.oalTaiwan, SRC.hmrn],
  }),
];

const spike: Spike = { cancerId: "non-hodgkin-lymphoma", entities: lymphomaCoreBcellRecords, patch: {} };

export default spike;

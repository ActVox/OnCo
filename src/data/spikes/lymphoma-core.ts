import type { TermInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * LYMPHOMA: the taxonomy and the family hubs. Facet A of the lymphoma deep dive, 29 September 2026.
 *
 * What this file does. It rewrites the `non-hodgkin-lymphoma` hub, which held 5,333 characters for the largest
 * family of diseases in the corpus, and it holds the shared constants, the taxonomy glossary and the family
 * decisions for the two record files beside it (./lymphoma-core-bcell.ts, ./lymphoma-core-tcell.ts). The
 * treatment rows on the hub are written by ./lymphoma-treatment.ts and are not touched here; a patch merges
 * array fields, so both survive.
 *
 * The two classifications, and why both are quoted. Since 2022 there have been two reference classifications of
 * lymphoma, not one: the fifth edition of the WHO Classification of Haematolymphoid Tumours (WHO-HAEM5,
 * Alaggio, Leukemia 2022) and the International Consensus Classification (ICC, Campo, Blood 2022). They agree
 * about most of the diseases and differ about a handful of names and boundaries. Those differences are written
 * on the pages rather than smoothed over, because a reader holding a pathology report is holding one of the two
 * vocabularies and needs to know that the other exists. Every entity name, every renaming and every stated
 * disagreement below was read from the full text of those two papers through the Europe PMC REST API on
 * 29 September 2026 (cached under /tmp/lym); nothing is quoted from memory.
 *
 * Family decisions made here, with the reasoning in docs/CANCER-PAGES.md.
 *
 *  1. `non-hodgkin-lymphoma` stays the family hub, and it is not a WHO entity. WHO-HAEM5 does not use the term
 *     "non-Hodgkin lymphoma" at all: its tree is class (B-cell / T-and-NK-cell), then family, then entity. The
 *     corpus keeps the page because it is the word patients are given and the word NCI PDQ and the registries
 *     still use, and the page's job is to hand the reader to the right entity.
 *  2. `peripheral-t-cell-lymphoma` is used as the mature T-cell and NK-cell hub, which is wider than its name.
 *     WHO-HAEM5 reserves "peripheral T-cell lymphoma, NOS" for one entity inside the family "other peripheral
 *     T-cell lymphomas". The corpus record already groups the whole T and NK side, the treatment layer already
 *     writes onto it, and renaming it would strand incoming links; its page says so in words.
 *  3. Site variants of extranodal marginal zone lymphoma become records where the first treatment decision
 *     differs. Wave 4 recorded that "orbital lymphoma is a site string on the MALT page". That is reversed for
 *     two sites and only two: gastric MALT lymphoma, where antibiotics alone cure most patients and a
 *     translocation predicts who they will not cure, and ocular adnexal MALT lymphoma, where the first choice
 *     is between an antibiotic and radiotherapy to the orbit. Every other site stays a string.
 *  4. No `lymphoplasmacytic-lymphoma` record is created. The corpus already holds `waldenstrom`, whose aliases
 *     include "Lymphoplasmacytic lymphoma"; WHO-HAEM5 states that the IgM type (Waldenstrom macroglobulinaemia)
 *     is the common one and the non-Waldenstrom type is around 5 per cent of lymphoplasmacytic lymphoma. A
 *     second record would be the same disease under a second id, which is the duplication docs/DUPLICATE-RECORDS.md
 *     exists to prevent. The existing record is widened instead (see `waldenstromTaxonomySpike` below).
 *  5. `hodgkin-lymphoma` was read and left alone. At 13,100 characters it carries a real summary, the subtype
 *     strings, the biomarkers and the treatment layer, and rewriting it would have added words rather than
 *     facts. One taxonomy note is added: the naming disagreement over nodular lymphocyte predominant Hodgkin
 *     lymphoma, where the two classifications of 2022 did not land in the same place.
 *
 * Sources. WHO-HAEM5 (doi 10.1038/s41375-022-01620-2) and ICC (doi 10.1182/blood.2022015851) for the taxonomy;
 * Cancer Research UK and SEER for the national figures; the Haematological Malignancy Research Network's
 * subtype analysis (Smith, Br J Cancer 2015, doi 10.1038/bjc.2015.94) for UK incidence and survival by subtype,
 * which is the only UK source that publishes both at this resolution; NCI PDQ, Lymphoma Action and the Lymphoma
 * Research Foundation for the patient-facing framing.
 */
export const asOf = "2026-09-29";
export const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
export const doi = (label: string, d: string) => ({ label, url: `https://doi.org/${d}` });
export const link = (label: string, url: string) => ({ label, url });
export const tags = ["heme", "lymphoma"];

/** Sources quoted on more than one page in this layer. Each was opened and read on 29 September 2026. */
export const SRC = {
  who5: doi("WHO Classification of Haematolymphoid Tumours, 5th edition: lymphoid neoplasms (Alaggio, Leukemia 2022)", "10.1038/s41375-022-01620-2"),
  icc: doi("International Consensus Classification of Mature Lymphoid Neoplasms (Campo, Blood 2022)", "10.1182/blood.2022015851"),
  hmrn: doi("Lymphoma incidence, survival and prevalence 2004 to 2014, subtype analyses from the UK Haematological Malignancy Research Network (Smith, Br J Cancer 2015)", "10.1038/bjc.2015.94"),
  lugano: doi("Lugano classification: recommendations for initial evaluation, staging and response assessment of Hodgkin and non-Hodgkin lymphoma (Cheson, J Clin Oncol 2014)", "10.1200/JCO.2013.54.8800"),
  annArbor: link("Report of the Committee on Hodgkin's Disease Staging Classification (Carbone, Cancer Research 1971, 31:1860 to 1861)", "https://pubmed.ncbi.nlm.nih.gov/5121694/"),
  ipi: doi("A predictive model for aggressive non-Hodgkin's lymphoma: the International Prognostic Index (N Engl J Med 1993)", "10.1056/NEJM199309303291402"),
  pit: doi("Peripheral T-cell lymphoma unspecified: the Prognostic Index for T-cell lymphoma (Gallamini, Blood 2004)", "10.1182/blood-2003-09-3080"),
  seer: link("SEER Cancer Stat Facts: non-Hodgkin lymphoma (United States incidence, mortality and relative survival)", "https://seer.cancer.gov/statfacts/html/nhl.html"),
  cruk: link("Cancer Research UK: non-Hodgkin lymphoma statistics (incidence, mortality, survival)", "https://www.cancerresearchuk.org/health-professional/cancer-statistics/statistics-by-cancer-type/non-hodgkin-lymphoma"),
  pdq: link("NCI PDQ: adult non-Hodgkin lymphoma treatment (health professional version)", "https://www.cancer.gov/types/lymphoma/hp/adult-nhl-treatment-pdq"),
  pdqPatient: link("NCI PDQ: adult non-Hodgkin lymphoma treatment (patient version)", "https://www.cancer.gov/types/lymphoma/patient/adult-nhl-treatment-pdq"),
  lymphomaAction: link("Lymphoma Action: types of lymphoma (UK patient charity)", "https://lymphoma-action.org.uk/types-lymphoma"),
  lrf: link("Lymphoma Research Foundation: about lymphoma", "https://lymphoma.org/understanding-lymphoma/aboutlymphoma/"),
  globocan: doi("GLOBOCAN 2020 global cancer statistics (Sung, CA Cancer J Clin 2021)", "10.3322/caac.21660"),
};

/** The guideline stamp used by taxonomy rows: the classification is the authority, not a treatment guideline. */
export const whoGuideline = { version: "WHO Classification of Haematolymphoid Tumours, 5th edition (2022), with the International Consensus Classification (2022) where they differ", url: SRC.who5.url };
export const pdqGuideline = { version: "NCI PDQ: adult non-Hodgkin lymphoma treatment", url: SRC.pdq.url };

// --------------------------------------------------------------------------- the hub

const NHL_SUMMARY = [
  "What it is. Non-Hodgkin lymphoma is not a disease. It is the name given to every cancer of the lymphatic system that is not Hodgkin lymphoma, and it covers scores of separate diseases whose only shared feature is the cell they come from: the tables of the 2022 WHO classification list more than sixty mature B-cell, T-cell and NK-cell entities: a lymphocyte, one of the white blood cells that run the immune system. Two people both told they have non-Hodgkin lymphoma may have conditions that differ more from each other than breast cancer differs from bowel cancer. One may be watched for ten years without treatment; the other may start chemotherapy the week of diagnosis with the intention of cure. The single most useful thing to find out after the word lymphoma is the rest of the name on the report, because that is what decides everything.",

  "How the classification is built, in plain words. The reference book is the fifth edition of the World Health Organization Classification of Haematolymphoid Tumours, published in 2022 and usually shortened to WHO-HAEM5. It does not use the phrase non-Hodgkin lymphoma at all. It sorts lymphomas on a tree: first by the class of cell, then into a family of related diseases, then into the entity that is the diagnosis. The first fork is B-cell on one side and T-cell and NK-cell on the other. B cells make antibodies; T cells and NK cells kill infected cells directly. In the United Kingdom the B-cell side is about 95 per cent of lymphoma diagnoses and the T-cell and NK-cell side about 5 per cent (Haematological Malignancy Research Network, 5,796 lymphomas in a population of nearly four million). That first fork matters because B cells carry a protein called CD20 on their surface and T cells do not, and the antibody that attaches to CD20, rituximab, is the drug that transformed B-cell lymphoma from 1997 onwards and has no equivalent on the T-cell side.",

  "The second thing a reader is told is the pace, and it is the fork that decides what happens next week. Indolent lymphomas grow over years: follicular lymphoma, marginal zone lymphoma, lymphoplasmacytic lymphoma, most cutaneous T-cell lymphoma. They are generally not curable with the treatments in use today, and they are also not usually urgent, so a person with no symptoms may reasonably be watched rather than treated, sometimes for a decade. Aggressive lymphomas grow over weeks: diffuse large B-cell lymphoma, high-grade B-cell lymphoma, Burkitt lymphoma, most of the T-cell lymphomas. They are treated immediately and they are treated to cure. The sentence that surprises people most is that the aggressive ones are the ones more often cured, and the slow ones the ones more often lived with. Waiting is not neglect in an indolent lymphoma; it is the treatment that has been shown not to shorten life, and the glossary entry on watching and waiting says what is being watched for.",

  "The third fork is where the lymphoma is. Nodal lymphoma arises in lymph nodes, the bean-sized filters strung along the lymphatic vessels, and shows itself as a painless lump in the neck, armpit or groin. Extranodal lymphoma arises in an organ that has lymphoid tissue in it but is not a lymph node: the stomach, the eye socket, the skin, the brain, the testis, the small bowel, the thyroid, the salivary gland. A substantial minority of non-Hodgkin lymphomas start outside the lymph nodes, and the site changes the disease. A marginal zone lymphoma in the stomach is usually caused by a bacterial infection and is usually cured by a fortnight of antibiotics; the same cell type in a lymph node is not. A large B-cell lymphoma in the testis, the eye or the brain behaves as one disease across those three sites, which WHO-HAEM5 recognised in 2022 by grouping them as lymphomas of immune-privileged sites, places the immune system does not patrol.",

  "Who gets it. Lymphoma is mostly a disease of later life: the median age at diagnosis in the HMRN population was 67.2 years for all lymphomas together and 69.1 years for the non-Hodgkin group, with men diagnosed younger than women and at higher rates at almost every age. But the family spans every age, and different subtypes dominate different ages: Burkitt lymphoma and Hodgkin lymphoma are the common lymphomas of childhood and early adult life, while above 60 the diffuse large B-cell, marginal zone and follicular subtypes account for more than 80 per cent of diagnoses. Most people with lymphoma have no identifiable cause. The known causes account for a minority and are worth naming because several are preventable or treatable: Epstein-Barr virus, the virus of glandular fever, which is involved in Burkitt lymphoma, in some diffuse large B-cell lymphomas and in extranodal NK/T-cell lymphoma; Helicobacter pylori in the stomach; hepatitis C; HIV; HTLV-1, which causes adult T-cell leukaemia/lymphoma; Kaposi sarcoma herpesvirus, which causes primary effusion lymphoma; coeliac disease, which precedes enteropathy-associated T-cell lymphoma; immune suppression after an organ transplant; and autoimmune diseases such as Sjogren syndrome and Hashimoto thyroiditis, which produce the lymphoid tissue that marginal zone lymphomas grow in. Cancer Research UK estimates that about 3 per cent of UK cases are preventable, which is the honest counterpart to the fact that most people did nothing to cause this.",

  "How it is staged, and why the old words survive. Lymphoma is not staged with the TNM system used for solid tumours, because it does not have a primary tumour and lymph nodes in the way a breast or bowel cancer does: in lymphoma, the lymph nodes are the disease. The system in use is the Lugano classification, agreed at the International Conference on Malignant Lymphoma in Lugano in 2011 and published in 2014. It counts how many regions of lymph nodes are involved and whether they sit on one side of the diaphragm or both: stage I is one region, stage II is two or more on the same side, stage III is both sides, stage IV is disease that has spread diffusely into an organ such as the bone marrow, liver or lung. Lugano kept the descriptive language of the Ann Arbor system that preceded it, agreed at a meeting in Ann Arbor, Michigan in 1971 for Hodgkin's disease, which is why a report in 2026 may still say Ann Arbor stage IIA and mean the same thing. What Lugano changed is how the stage is measured: PET-CT scanning became the standard staging test for the lymphomas that take up the tracer, the A and B suffixes for fever, night sweats and weight loss are now recorded only for Hodgkin lymphoma, and a routine bone marrow biopsy is no longer needed to stage Hodgkin lymphoma or, in most cases, diffuse large B-cell lymphoma.",

  "Stage is not the main thing. This is the largest difference between lymphoma and the cancers most people have heard of. In breast or bowel cancer the stage is the dominant fact; in lymphoma the subtype matters more, and within a subtype the prognosis is read from a score that counts clinical features rather than anatomy. The International Prognostic Index, built in 1993 from 2,031 patients with aggressive lymphoma treated across 16 institutions, counts five: age over 60, stage III or IV, a raised lactate dehydrogenase, a performance status of 2 or worse, and more than one site outside the lymph nodes. Follicular lymphoma has its own version (FLIPI), mantle cell lymphoma has MIPI, and the nodal T-cell lymphomas have the Prognostic Index for T-cell lymphoma, built from 385 patients in 2004. Stage IV lymphoma is a routine curable diagnosis, which is the opposite of what the word means in most other cancers, and it is worth saying out loud at the point where somebody has just been handed the number.",

  "The state of the art, in one paragraph. The B-cell side has had thirty years of advances that compound. Rituximab, approved in 1997, was the first antibody ever licensed for a cancer, and adding it to chemotherapy raised both the proportion of people whose diffuse large B-cell lymphoma went away and the proportion still alive years later; the trial and its figures are on that page. CAR-T cell therapy, in which a patient's own T cells are collected, engineered to recognise CD19 and given back, was approved for relapsed large B-cell lymphoma in 2017 and now cures a proportion of people whose disease had come back after chemotherapy. Bispecific antibodies, which grip a lymphoma cell with one arm and a T cell with the other, arrived in 2023 and do a related job without the manufacturing wait. Antibody-drug conjugates deliver chemotherapy to the cell that carries a particular marker. The T-cell and NK-cell side has had almost none of this: there is no CD20 to aim at, the entities are individually rare, and brentuximab vedotin added to chemotherapy for CD30-positive disease is the only randomised first-line advance in twenty years. The gap between the two sides of the first fork is the largest unsolved problem in this family, and it is a gap in research effort as much as in biology.",

  "A note on names. Because two classifications were published in 2022 and they do not agree about everything, a British report, an American report and a trial protocol may give the same disease three names. Where that happens the pages in this family give both and say which book each name comes from. The glossary entry on the two classifications lists the disagreements that change what a patient is called.",
].join("\n\n");

const nhlPatch: Spike["patch"] = {
  asOf,
  name: "Non-Hodgkin lymphoma (all types)",
  aka: ["Non-Hodgkin Lymphoma", "NHL", "Non-Hodgkin's lymphoma", "Lymphoma (non-Hodgkin)", "Lymphoma", "Mature B-cell neoplasms", "Mature T-cell and NK-cell neoplasms", "B-cell lymphoma", "T-cell lymphoma", "NK-cell lymphoma", "Lymphatic cancer", "Cancer of the lymph glands", "C82", "C83", "C84", "C85", "C86"],
  tldr: "Non-Hodgkin lymphoma is not one disease but a family of more than sixty cancers of the lymphocytes, the white blood cells of the immune system. About 95 per cent come from B cells and the rest from T or NK cells; some grow over years and are watched, others grow over weeks and are treated to cure. The family is the map; the subtype is the disease, and the subtype is what decides the treatment.",
  burden: "About 13,747 new cases and 5,100 deaths a year in the United Kingdom, where 64.6 per cent of people are alive ten years later (Cancer Research UK); an estimated 79,320 new cases and 19,970 deaths in the United States in 2026, 3.8 per cent of all new cancer diagnoses, with five-year relative survival of 74.3 per cent for 2016 to 2022 (SEER); and about 544,000 cases and 260,000 deaths worldwide in 2020 (GLOBOCAN). It is the commonest group of blood cancers.",
  summary: NHL_SUMMARY,
  subtypes: [
    "B-cell lymphomas, about 95 per cent of lymphoma in the United Kingdom (HMRN)",
    "Diffuse large B-cell lymphoma, the commonest single subtype at about 41 per cent of lymphoma diagnoses",
    "Follicular lymphoma and the other indolent germinal-centre lymphomas",
    "Marginal zone lymphomas: extranodal (MALT), nodal and splenic",
    "Mantle cell lymphoma",
    "Burkitt lymphoma and the high-grade B-cell lymphomas, including those with MYC and BCL2 rearrangements",
    "Lymphoplasmacytic lymphoma, of which Waldenstrom macroglobulinaemia is the IgM type",
    "Large B-cell lymphomas of immune-privileged sites: the central nervous system, the vitreoretina and the testis",
    "Virus-associated B-cell lymphomas: EBV-positive, KSHV/HHV8-associated (primary effusion lymphoma) and plasmablastic lymphoma",
    "Lymphomas arising in immune deficiency and dysregulation, including after transplant and in HIV",
    "T-cell and NK-cell lymphomas, about 5 per cent of lymphoma in the United Kingdom",
    "Nodal T-follicular helper cell lymphomas, of which the angioimmunoblastic type is the commonest",
    "The anaplastic large cell lymphomas: ALK-positive, ALK-negative, primary cutaneous and breast implant-associated",
    "Primary cutaneous T-cell lymphomas, of which mycosis fungoides is the commonest",
    "EBV-positive NK/T-cell lymphomas, including extranodal NK/T-cell lymphoma",
    "Adult T-cell leukaemia/lymphoma, caused by HTLV-1",
    "Intestinal T-cell lymphomas: enteropathy-associated and monomorphic epitheliotropic",
  ],
  biomarkers: [
    "The immunophenotype, read by immunohistochemistry or flow cytometry (CD20, CD3, CD5, CD10, CD23, CD30, CD138, cyclin D1, ALK, BCL2, BCL6, MUM1), which assigns the entity and is the diagnosis",
    "MYC, BCL2 and BCL6 rearrangements by fluorescence in situ hybridisation in every aggressive B-cell lymphoma, because MYC with BCL2 defines a separate entity",
    "The Ki-67 proliferation index, which is above 95 per cent in Burkitt lymphoma and is part of the mantle cell risk score",
    "Cell of origin in diffuse large B-cell lymphoma: germinal centre B-cell against activated B-cell",
    "Epstein-Barr virus by EBER in situ hybridisation, which defines several entities and changes none of the treatment",
    "Interim and end-of-treatment PET-CT, scored on the Deauville five-point scale",
    "MYD88 L265P, which supports lymphoplasmacytic lymphoma and the immune-privileged large B-cell lymphomas",
    "HTLV-1 serology where the person or their family comes from Japan, the Caribbean, west or central Africa, Iran, Romania or parts of South America",
  ],
  basics: {
    symptoms: [
      "A painless, persistent swelling of a lymph node in the neck, armpit or groin, usually over weeks rather than days, that does not go down after an infection clears.",
      "The B symptoms: drenching night sweats that soak nightclothes, unexplained fever, and weight loss of more than a tenth of body weight in six months. They are recorded formally in the stage for Hodgkin lymphoma and noted but not staged in non-Hodgkin lymphoma.",
      "Itching without a rash, fatigue out of proportion to activity, and loss of appetite.",
      "Symptoms of the organ involved where the lymphoma is extranodal: indigestion and anaemia in gastric lymphoma, a painless lump in the testis, a bulging or displaced eye, a skin patch that has been treated as eczema for years, abdominal pain or perforation in intestinal lymphoma, headache or confusion in lymphoma of the central nervous system.",
      "Swelling of the face and arms with breathlessness, which is superior vena cava obstruction from a large chest mass, and is an emergency: it is the usual presentation of primary mediastinal B-cell lymphoma and of mediastinal grey zone lymphoma.",
    ],
    diagnosis: [
      "An excision biopsy of a whole lymph node where that is possible, because the architecture of the node is part of the diagnosis and a needle core may not show it. A fine-needle aspirate is not sufficient to diagnose lymphoma.",
      "Immunohistochemistry and flow cytometry on the biopsy, which identify the lineage and the entity, followed by fluorescence in situ hybridisation for the rearrangements that define separate diseases.",
      "Blood tests: full blood count, lactate dehydrogenase, kidney and liver function, calcium, and virology for hepatitis B, hepatitis C and HIV before any antibody treatment, because anti-CD20 antibodies can reactivate hepatitis B.",
      "PET-CT from the skull base to mid-thigh for the lymphomas that take up the tracer; CT alone for those that do not.",
      "A bone marrow biopsy where it will change the stage or the treatment. The Lugano classification removed it from routine staging of Hodgkin lymphoma and from most diffuse large B-cell lymphoma staged by PET.",
      "A lumbar puncture, an MRI of the brain, or an eye examination where the subtype or the sites involved carry a risk to the central nervous system.",
    ],
    staging: [
      "The Lugano classification (2014), which modified the Ann Arbor system of 1971: stage I, one lymph node region; stage II, two or more on the same side of the diaphragm; stage III, both sides; stage IV, diffuse involvement of an organ outside the lymphatic system.",
      "The suffix E marks a single extranodal site reached by direct extension, and the suffixes A and B for the absence or presence of fever, night sweats and weight loss are formally recorded only for Hodgkin lymphoma.",
      "Bulk is recorded separately: a single mass of 10 cm or more, or more than a third of the width of the chest, which changes treatment in several subtypes.",
      "Stage matters less in lymphoma than in solid cancers. The prognosis is read from a score: the International Prognostic Index for aggressive lymphoma, FLIPI for follicular, MIPI for mantle cell and the Prognostic Index for T-cell lymphoma for the nodal T-cell lymphomas.",
      "Stage IV lymphoma is routinely treated with the intention to cure, which is not what stage IV means in most other cancers.",
    ],
    sources: [SRC.lugano, SRC.annArbor, SRC.ipi, SRC.pit, SRC.pdq, SRC.lymphomaAction],
  },
  prognosis: {
    text: "The figures for non-Hodgkin lymphoma as a whole are the average of more than sixty diseases and apply exactly to nobody, which is the reason to read the subtype page instead. With that said: in the United Kingdom, 64.6 per cent of people diagnosed with non-Hodgkin lymphoma are alive ten years later (Cancer Research UK), and in the United States five-year relative survival was 74.3 per cent for 2016 to 2022, up from about 47 per cent in the mid-1970s (SEER). The spread behind those averages is very wide. In the UK population series that reports survival by subtype, five-year relative survival ran from 86.5 per cent in follicular lymphoma and 87.9 per cent in extranodal marginal zone lymphoma, through 54.8 per cent in diffuse large B-cell lymphoma, to 31.4 per cent in mantle cell lymphoma and 45.4 per cent across the T-cell lymphomas as a group; those figures are for people diagnosed between 2004 and 2012 and followed to 2014, so they predate the bispecific antibodies, CAR-T and the newer mantle cell regimens, and they understate what is achieved today in several subtypes.",
    sources: [SRC.cruk, SRC.seer, SRC.hmrn],
  },
  stateOfArt: [
    "The B-cell side now has four ways of attacking the same cell surface and they stack: the naked antibody (rituximab, obinutuzumab), the antibody-drug conjugate (polatuzumab vedotin, brentuximab vedotin), the engineered T cell (CAR-T against CD19) and the bispecific antibody (glofitamab, epcoritamab, mosunetuzumab). A person whose large B-cell lymphoma relapses in 2026 has a realistic second and third chance of cure, which was not true in 2015.",
    "The T-cell and NK-cell side has had one positive randomised first-line trial in twenty years, ECHELON-2, and it applies only to CD30-positive disease. Most of what is given in T-cell lymphoma is convention rather than demonstrated benefit, and the pages in this family say so where it is true.",
    "The 2022 classifications moved several diseases from being a descriptive label to being a genetically defined entity: high-grade B-cell lymphoma with MYC and BCL2 rearrangements, the large B-cell lymphomas of immune-privileged sites, mediastinal grey zone lymphoma. Each of those moves exists because the genetics predicted the behaviour better than the appearance did.",
    "PET-CT and the Deauville score made treatment adaptive. Scanning after two cycles and changing the plan on what the scan shows is now standard in Hodgkin lymphoma and is being tested across the aggressive B-cell lymphomas.",
    "Infection remains the common cause of harm. Hepatitis B reactivation after anti-CD20 antibodies, Pneumocystis pneumonia on steroids, and low immunoglobulins for years after CAR-T or bispecific therapy each have a prevention that works and is sometimes forgotten.",
  ],
  openProblems: [
    "The T-cell and NK-cell lymphomas are about one lymphoma in twenty and have a small fraction of the trials, the drugs and the survival gains of the B-cell lymphomas. Five-year relative survival in the UK population series was 45.4 per cent across T-cell lymphomas against 68.8 per cent across B-cell lymphomas.",
    "Several of these diseases are common where trials are not run. Extranodal NK/T-cell lymphoma is a disease of east Asia and Latin America; adult T-cell leukaemia/lymphoma is a disease of south-western Japan, the Caribbean and west Africa. The treatments with the best evidence were developed there, and are least available to people from those populations living elsewhere.",
    "Two reference classifications were published in 2022 and they disagree about names and boundaries. A patient can be told they have three different diagnoses depending on which book the pathologist used and which trial they are being screened for.",
    "CAR-T and bispecific antibodies are available in a small number of countries and in a small number of centres within them. The gap between what is possible and what is reachable is now the main determinant of outcome in relapsed large B-cell lymphoma.",
    "There is no way to predict which indolent lymphoma will transform into an aggressive one, and transformation is the commonest cause of death in follicular lymphoma.",
  ],
  related: ["dlbcl", "follicular-lymphoma", "mantle-cell-lymphoma", "cll", "burkitt-lymphoma", "waldenstrom", "primary-cns-lymphoma", "peripheral-t-cell-lymphoma", "hiv-associated-lymphoma", "hodgkin-lymphoma", "marginal-zone-lymphoma", "primary-mediastinal-b-cell-lymphoma", "high-grade-b-cell-lymphoma-myc-bcl2", "t-cell-histiocyte-rich-large-b-cell-lymphoma", "primary-testicular-lymphoma", "mycosis-fungoides", "extranodal-nk-t-cell-lymphoma"],
  terms: ["lymphoma-classification-2022", "lymphoma-b-versus-t-cell", "lymphoma-indolent-versus-aggressive", "lymphoma-nodal-versus-extranodal", "lymphoma-transformation", "lymphoma-pit-score", "lymphoma-htlv-1", "lugano-classification", "deauville-score", "ipi-score", "flipi", "mipi", "lymphoma-type", "ebv-term"],
  technologies: ["histopathology-ihc", "fdg-pet"],
  history: [
    { year: 1971, title: "Ann Arbor staging agreed", note: "A committee meeting in Ann Arbor, Michigan set out the four-stage anatomical system for Hodgkin's disease. Its descriptive language is still in use in 2026, inside the Lugano classification that replaced it.", refs: ["lugano-classification"] },
    { year: 1993, title: "The International Prognostic Index", note: "Built from 2,031 patients with aggressive lymphoma treated at 16 institutions across the United States, Europe and Canada. It counts age, stage, lactate dehydrogenase, performance status and extranodal sites, and it still decides treatment intensity in 2026.", refs: ["ipi-score"] },
    { year: 2014, title: "The Lugano classification", note: "Agreed at the International Conference on Malignant Lymphoma, it made PET-CT the standard staging test for lymphomas that take up the tracer, restricted the A and B symptom suffixes to Hodgkin lymphoma, and removed routine bone marrow biopsy from the staging of Hodgkin lymphoma.", refs: ["lugano-classification", "fdg-pet", "deauville-score"] },
    { year: 2022, title: "Two classifications instead of one", note: "The fifth edition of the WHO classification and the International Consensus Classification were published within months of each other. They agree about most entities and differ about several names and boundaries, which is why a report may give a disease a name that a trial protocol does not recognise.", refs: ["lymphoma-classification-2022"] },
  ],
  links: [SRC.who5, SRC.icc, SRC.hmrn, SRC.lugano, SRC.seer, SRC.cruk, SRC.pdq, SRC.pdqPatient, SRC.lymphomaAction, SRC.lrf, SRC.globocan],
};

// --------------------------------------------------------------------------- the taxonomy glossary

const tm = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, tags, ...x });

export const lymphomaCoreTerms: TermInput[] = [
  tm({
    id: "lymphoma-classification-2022", name: "The two lymphoma classifications of 2022 (WHO-HAEM5 and ICC)", category: "Clinical",
    aka: ["WHO-HAEM5", "WHO fifth edition", "International Consensus Classification", "ICC 2022", "WHO Classification of Haematolymphoid Tumours"],
    tldr: "Since 2022 there have been two reference classifications of lymphoma rather than one, published within months of each other by overlapping groups of experts. They agree about most diseases and disagree about a handful of names and boundaries, so the same biopsy can carry two different diagnoses depending on which book the pathologist used.",
    summary: "The fifth edition of the WHO Classification of Haematolymphoid Tumours (WHO-HAEM5) and the International Consensus Classification of Mature Lymphoid Neoplasms (ICC) were both published in 2022. WHO-HAEM5 arranges diseases in a hierarchy of class, family and entity, and orders the entities within a family from the most indolent to the most aggressive. The ICC was produced by a Clinical Advisory Committee convened around the same evidence.\n\nThe disagreements that change what a patient is called:\n\nNodular lymphocyte predominant Hodgkin lymphoma. The ICC renamed it nodular lymphocyte predominant B-cell lymphoma by consensus, on the grounds that it differs biologically and clinically from classic Hodgkin lymphoma and is closely related to T-cell/histiocyte-rich large B-cell lymphoma. WHO-HAEM5 kept the old name, explicitly so as not to interfere with trials already recruiting, while stating that the new name is acceptable in preparation for adopting it later.\n\nHigh-grade B-cell lymphoma with MYC and BCL6 rearrangements. Both books removed these cases from the double-hit category defined by MYC and BCL2. WHO-HAEM5 reassigns them to diffuse large B-cell lymphoma or high-grade B-cell lymphoma not otherwise specified according to how the cells look. The ICC created a new provisional entity for them instead.\n\nThe double-hit entity itself. WHO-HAEM5 names it diffuse large B-cell lymphoma / high-grade B-cell lymphoma with MYC and BCL2 rearrangements, so that a tumour made of large cells and a tumour made of blastoid cells can carry the same name once the genetics are known. The ICC keeps high-grade B-cell lymphoma with MYC and BCL2 rearrangements as the name and asks that the appearance be reported alongside.\n\nExtranodal NK/T-cell lymphoma. WHO-HAEM5 dropped the qualifier nasal type, because the disease occurs at several extranodal sites. The ICC retains it.\n\nLymphomas of immune-privileged sites. WHO-HAEM5 created a single entity grouping primary large B-cell lymphoma of the central nervous system, of the vitreoretina and of the testis. The ICC discussed the same grouping and decided it was premature, while recognising primary diffuse large B-cell lymphoma of the testis as an entity in its own right.\n\nPrimary cutaneous marginal zone disease. WHO-HAEM5 made it a separate entity and calls it a lymphoma. The ICC made it a separate entity and calls it a lymphoproliferative disorder, which is a statement about how dangerous it is rather than about what it is.\n\nThe nodal T-follicular helper cell lymphomas. WHO-HAEM5 names the family nodal T-follicular helper cell lymphoma, with the angioimmunoblastic type as the prototype. The ICC calls the same family follicular helper T-cell lymphoma. Both replace the older name angioimmunoblastic T-cell lymphoma with a longer one.\n\nWhat a reader should do with this. If a report, a second opinion and a trial protocol give three names, they are probably describing one disease in three vocabularies, and asking which classification each used is a reasonable question to put to the haematologist.",
    related: ["lymphoma-type", "lymphoma-b-versus-t-cell", "lymphoma-indolent-versus-aggressive"],
    cancers: ["non-hodgkin-lymphoma", "hodgkin-lymphoma", "dlbcl", "peripheral-t-cell-lymphoma"],
    links: [SRC.who5, SRC.icc],
  }),
  tm({
    id: "lymphoma-b-versus-t-cell", name: "B-cell, T-cell and NK-cell lymphoma", category: "Biomarkers",
    aka: ["B-cell lymphoma", "T-cell lymphoma", "NK-cell lymphoma", "cell of origin", "lineage"],
    tldr: "The first thing a lymphoma report says is which kind of lymphocyte the cancer came from. B cells make antibodies and carry a surface protein called CD20; T and NK cells kill infected cells directly and carry no CD20. That single difference is why B-cell lymphomas have had thirty years of new antibody treatments and T-cell lymphomas have not.",
    summary: "Lymphocytes come in three lineages and a lymphoma inherits the one it arose from. B cells mature in the bone marrow and in the germinal centres of lymph nodes, and make antibodies. T cells mature in the thymus and either help other immune cells or kill infected ones. Natural killer cells kill without needing to recognise a specific antigen, and share many surface proteins with cytotoxic T cells, which is why the classifications treat T-cell and NK-cell lymphomas as one group.\n\nThe proportions are lopsided. In the UK Haematological Malignancy Research Network series of 5,796 lymphomas, 94.7 per cent were B-cell and 5.3 per cent T-cell. The outcomes are lopsided in the same direction: five-year relative survival was 68.8 per cent for the B-cell group and 45.4 per cent for the T-cell group.\n\nThe reason is mostly pharmacological rather than biological. B cells carry CD20, a protein with no essential function that the body can do without, so an antibody against it can be given safely and kills the lymphoma along with the normal B cells. Rituximab was licensed in 1997 and every later B-cell treatment, from antibody-drug conjugates to CAR-T to bispecific antibodies, built on the same idea of a surface address. T cells have no equivalent: the obvious targets are proteins the healthy T cells need, so removing them removes the immune system, and a CAR-T cell aimed at a T-cell protein attacks the other CAR-T cells, a problem called fratricide that the engineering is only now starting to solve.\n\nOn a report, the lineage is read from immunohistochemistry: CD20, CD79a and PAX5 for B cells, CD3, CD2, CD5 and CD7 for T cells, CD56 and cytoplasmic CD3 for NK cells. A clonal rearrangement of the immunoglobulin or T-cell receptor genes confirms that the population is a single clone rather than a reaction.",
    related: ["lymphoma-type", "lymphoma-classification-2022", "cd20"],
    cancers: ["non-hodgkin-lymphoma", "dlbcl", "peripheral-t-cell-lymphoma"],
    drugs: ["rituximab", "brentuximab-vedotin"],
    links: [SRC.who5, SRC.hmrn],
  }),
  tm({
    id: "lymphoma-indolent-versus-aggressive", name: "Indolent and aggressive lymphoma", category: "Clinical",
    aka: ["indolent lymphoma", "aggressive lymphoma", "low-grade lymphoma", "high-grade lymphoma", "slow-growing lymphoma", "fast-growing lymphoma"],
    tldr: "Lymphomas are split by how fast they grow, and the split decides what happens next. Aggressive lymphomas grow over weeks, are treated at once and are often cured. Indolent lymphomas grow over years, are often watched rather than treated, and are usually controlled for a long time rather than cured. The fast ones are the curable ones, which is the opposite of what most people expect.",
    summary: "Aggressive lymphomas double in weeks and cause symptoms quickly: diffuse large B-cell lymphoma, high-grade B-cell lymphoma, Burkitt lymphoma, most nodal T-cell lymphomas, blastoid mantle cell lymphoma. They are treated with combination chemotherapy within days or weeks of diagnosis, with the intention to cure, and a substantial proportion of people are cured. Burkitt lymphoma, the fastest-growing human tumour, is among the most curable.\n\nIndolent lymphomas grow over years and may cause no symptoms at all: follicular lymphoma, marginal zone lymphoma, lymphoplasmacytic lymphoma, most cutaneous T-cell lymphoma, chronic lymphocytic leukaemia. With current treatments they are generally not cured, but they are compatible with a long life, and many people need no treatment for years after diagnosis. Starting treatment earlier in a person with no symptoms has been tested and does not make them live longer, which is why watching and waiting is a treatment decision rather than a delay.\n\nThe practical consequences differ at every step. Urgency: an aggressive lymphoma is a matter of days, an indolent one rarely is. Intent: cure against control. Response: an aggressive lymphoma that does not respond is a serious problem quickly, while an indolent one that comes back is usually treated again. Scans: an aggressive lymphoma is usually followed by PET, an indolent one often by examination and blood tests alone.\n\nThe two categories are not permanent. An indolent lymphoma can transform into an aggressive one, which is the commonest way follicular lymphoma causes death and which WHO-HAEM5 recognised in 2022 by making transformation a family of its own. The reverse does not happen.",
    related: ["lymphoma-transformation", "lymphoma-tx-watch-and-wait", "lymphoma-type"],
    cancers: ["non-hodgkin-lymphoma", "follicular-lymphoma", "dlbcl", "marginal-zone-lymphoma"],
    links: [SRC.who5, SRC.pdqPatient, SRC.lymphomaAction],
  }),
  tm({
    id: "lymphoma-nodal-versus-extranodal", name: "Nodal and extranodal lymphoma", category: "Clinical",
    aka: ["nodal lymphoma", "extranodal lymphoma", "primary extranodal lymphoma", "extranodal site"],
    tldr: "A lymphoma that starts in a lymph node is called nodal; one that starts in an organ is called extranodal. A substantial minority of non-Hodgkin lymphomas start outside the lymph nodes, and where it started often changes the cause, the treatment and the outlook more than the cell type does.",
    summary: "Lymphoid tissue is not confined to lymph nodes. It lines the gut, the airways, the salivary glands and the thyroid, and it accumulates wherever there is long-standing inflammation. A lymphoma arising in one of those places is a primary extranodal lymphoma, and the site is part of the diagnosis.\n\nFour ways the site changes the disease:\n\nIt names the cause. Gastric marginal zone lymphoma follows Helicobacter pylori infection; lymphoma of the salivary gland follows Sjogren syndrome; lymphoma of the thyroid follows Hashimoto thyroiditis; enteropathy-associated T-cell lymphoma follows coeliac disease. Removing the cause can be the treatment: eradicating Helicobacter pylori puts most early gastric MALT lymphomas into lasting remission without any cancer treatment at all.\n\nIt changes the first treatment. Early extranodal marginal zone lymphoma of the orbit is treated with radiotherapy to a small field, or with an antibiotic; the same cells in a lymph node are not.\n\nIt creates sanctuaries. The brain, the vitreous and the retina, and the testis are immune-privileged: the immune system does not patrol them and most drugs do not reach them. WHO-HAEM5 grouped large B-cell lymphomas at those three sites into one entity in 2022 because they share a mutational profile and a habit of relapsing in each other. A lymphoma of the testis needs the other testis irradiated and the brain protected, or it comes back in one or the other.\n\nIt changes the emergencies. Lymphoma of the small bowel can perforate; lymphoma of the chest can obstruct the superior vena cava; lymphoma of the spine can compress the cord. Those are presentations of the site, not of the cell type.\n\nThe staging system counts extranodal disease twice over: the suffix E marks a single extranodal site reached by direct extension, stage IV marks diffuse involvement of an organ, and the number of extranodal sites is one of the five items in the International Prognostic Index.",
    related: ["lugano-classification", "ipi-score", "lymphoma-type"],
    cancers: ["non-hodgkin-lymphoma", "malt-lymphoma", "primary-cns-lymphoma", "marginal-zone-lymphoma"],
    links: [SRC.who5, SRC.lugano, SRC.pdq],
  }),
  tm({
    id: "lymphoma-transformation", name: "Transformation of an indolent lymphoma", category: "Clinical",
    aka: ["histological transformation", "transformed lymphoma", "Richter transformation", "high-grade transformation"],
    tldr: "A slow-growing lymphoma can change into a fast-growing one. It usually announces itself as one node growing much faster than the others, a sudden rise in lactate dehydrogenase, or new fevers and weight loss in somebody who has been stable for years. It is treated as the aggressive lymphoma it has become, not as the one it came from.",
    summary: "WHO-HAEM5 made transformations of indolent B-cell lymphomas a family in its own right in 2022, which they had never been before. The commonest route is follicular lymphoma to diffuse large B-cell lymphoma; chronic lymphocytic leukaemia to diffuse large B-cell lymphoma is called Richter transformation and has its own page; marginal zone and lymphoplasmacytic lymphomas transform less often.\n\nHow it shows itself: one site growing out of proportion to the rest, a rapidly rising lactate dehydrogenase, new B symptoms, hypercalcaemia, or a new area of high uptake on a PET scan against a background of low uptake. A biopsy of the most active site, chosen on the PET scan, is what confirms it, and biopsying the wrong node is the commonest way to miss it.\n\nWhy it matters. Transformation is the commonest cause of death in follicular lymphoma, and it changes the treatment completely: the disease is treated as an aggressive lymphoma, with combination immunochemotherapy and, in people who have already had chemotherapy for the indolent disease, consideration of CAR-T or transplant. The outcome depends heavily on whether the person has had chemotherapy before.\n\nWhat is not known. There is no marker that identifies in advance which indolent lymphoma will transform, and no treatment that has been shown to prevent it. Treating an indolent lymphoma earlier does not reduce the risk.",
    related: ["lymphoma-indolent-versus-aggressive", "lymphoma-tx-watch-and-wait", "richter-transformation-cll"],
    cancers: ["follicular-lymphoma", "marginal-zone-lymphoma", "dlbcl", "non-hodgkin-lymphoma"],
    links: [SRC.who5, SRC.pdq],
  }),
  tm({
    id: "lymphoma-pit-score", name: "Prognostic Index for T-cell lymphoma (PIT)", category: "Clinical",
    aka: ["PIT", "PIT score", "Prognostic Index for PTCL-U", "prognostic index for peripheral T-cell lymphoma"],
    tldr: "A four-item score that estimates the outlook in nodal T-cell lymphoma, built because the index used for B-cell lymphoma separated these patients poorly. It counts age over 60, a performance status of 2 or worse, a raised lactate dehydrogenase, and lymphoma in the bone marrow.",
    summary: "The Prognostic Index for T-cell lymphoma was built from 385 patients with peripheral T-cell lymphoma unspecified, classified by the WHO criteria and analysed retrospectively across several Italian centres (Gallamini, Blood 2004). Four features were independently predictive of survival: age over 60 years, a performance status of 2 or worse, a lactate dehydrogenase above the normal range, and bone marrow involvement.\n\nThe four groups it defines had five-year overall survival of 62.3 per cent with no adverse factor, 52.9 per cent with one, and lower with two or more; ten-year survival in the two best groups was 54.9 and 38.8 per cent. Those figures come from patients treated before brentuximab vedotin and before routine transplant consolidation, and they describe a population rather than a person.\n\nIt is used alongside, not instead of, the International Prognostic Index, and it does not change which treatment is given: there is no randomised evidence that a higher score should lead to a different regimen. Its honest use is to set expectations and to stratify trials. A separate index, PINK, exists for extranodal NK/T-cell lymphoma and is described on that page.",
    related: ["ipi-score", "flipi", "mipi"],
    cancers: ["peripheral-t-cell-lymphoma", "angioimmunoblastic-t-cell-lymphoma", "non-hodgkin-lymphoma"],
    links: [SRC.pit, SRC.ipi],
  }),
  tm({
    id: "lymphoma-htlv-1", name: "HTLV-1 (human T-lymphotropic virus type 1)", category: "Biomarkers",
    aka: ["HTLV-1", "HTLV-I", "human T-cell lymphotropic virus type 1", "human T-cell leukaemia virus type 1"],
    tldr: "A virus that infects T cells, is passed mainly through breastfeeding and sexual contact, and causes a lymphoma decades later in a small minority of the people it infects. It is common in south-western Japan, the Caribbean, west and central Africa, parts of South America, Romania and Iran, and uncommon elsewhere.",
    summary: "HTLV-1 was the first human retrovirus shown to cause a cancer. It infects CD4-positive T cells and integrates into their DNA, where its proteins Tax and HBZ drive proliferation and block the repair of damage. Most infections are acquired in infancy through breast milk; sexual transmission, transfusion of cellular blood products and shared needles account for the rest.\n\nThe great majority of people infected never develop a lymphoma, and infection is lifelong. The two diseases it causes are adult T-cell leukaemia/lymphoma, after a latency usually measured in decades, and a progressive neurological disease, HTLV-1-associated myelopathy or tropical spastic paraparesis. Infection also suppresses cell-mediated immunity, which is why strongyloides hyperinfection and opportunistic infection are common complications.\n\nWhere it matters clinically: HTLV-1 serology belongs in the work-up of any T-cell lymphoma in a person who comes from, or whose parents come from, an endemic region, because adult T-cell leukaemia/lymphoma is treated differently from every other T-cell lymphoma and is easy to mistake for peripheral T-cell lymphoma not otherwise specified. A systematic review of HTLV-1 among immigrants and refugees worldwide found a pooled prevalence of 1.28 per cent, highest among people from the Western Pacific region at 7.27 per cent, which is the practical argument for testing rather than assuming.\n\nThere is no vaccine and no treatment that clears the virus. Prevention rests on antenatal screening and avoidance of breastfeeding where that is safe, screening of blood donations, and barrier contraception.",
    related: ["oncogenic-viruses", "ebv-term", "lymphoma-type"],
    cancers: ["peripheral-t-cell-lymphoma", "non-hodgkin-lymphoma"],
    links: [SRC.who5, doi("The global prevalence of HTLV-1 and HTLV-2 infections among immigrants and refugees, systematic review and meta-analysis (Viruses 2024)", "10.3390/v16101526")],
  }),
  tm({
    id: "lymphoma-lugano-gastrointestinal", name: "Staging a lymphoma of the stomach or bowel", category: "Clinical",
    aka: ["Lugano staging system for gastrointestinal lymphoma", "Paris staging", "TNM for gastric lymphoma", "stage IE gastric lymphoma"],
    tldr: "A lymphoma that starts in the stomach or bowel is staged by how deep it goes into the wall and how far along the lymph node chain it has travelled, not only by how many node regions are involved. The depth is measured by endoscopic ultrasound, and it decides whether antibiotics alone are worth trying.",
    summary: "Gastrointestinal lymphoma has its own staging vocabulary because the ordinary node-counting system does not capture what matters. The Lugano staging system for gastrointestinal lymphoma, which predates and is separate from the Lugano classification of 2014, runs: stage I, confined to the gut wall; stage II, extending into the abdomen, subdivided by whether the involved nodes are local (II-1) or distant (II-2); stage IIE, penetrating the serosa to involve adjacent organs; stage IV, disseminated or with supradiaphragmatic nodes. A parallel system, the Paris staging system, maps the same disease onto TNM-style depth categories (T1 mucosa and submucosa, T2 muscularis propria, T3 serosa, T4 adjacent structures).\n\nWhy the depth matters. In gastric marginal zone lymphoma of mucosa-associated lymphoid tissue, antibiotic eradication of Helicobacter pylori is the whole of the first treatment, and it works best in disease confined to the mucosa and submucosa. Endoscopic ultrasound measures that depth directly, and in a prospective series it assessed the depth of infiltration correctly in 91.5 per cent of cases against the resected specimen, while being less reliable about how far the tumour spread across the surface.\n\nWhat the staging does not decide. Surgery has no routine role in gastric lymphoma at any stage, which is the main thing that separates it from gastric adenocarcinoma, and a stage that would mean an operation in a carcinoma does not mean one here.",
    related: ["lugano-classification", "endoscopic-ultrasound-systems", "lymphoma-nodal-versus-extranodal"],
    cancers: ["malt-lymphoma", "marginal-zone-lymphoma", "non-hodgkin-lymphoma"],
    links: [SRC.lugano, doi("Endoscopic ultrasonography in the local staging of primary gastric lymphoma (Endoscopy 1993)", "10.1055/s-2007-1010385")],
  }),
];

// --------------------------------------------------------------------------- the spikes

/**
 * Waldenstrom macroglobulinaemia is the corpus's lymphoplasmacytic lymphoma page. WHO-HAEM5 recognises two
 * subtypes of lymphoplasmacytic lymphoma: the IgM type, which is Waldenstrom macroglobulinaemia and is the
 * common one, and a non-Waldenstrom type of around 5 per cent that covers IgG or IgA paraproteins, non-secretory
 * disease, and IgM disease without bone marrow involvement. The record is widened to say so rather than split.
 */
const waldenstromTaxonomySpike: Spike = {
  cancerId: "waldenstrom", entities: [], patch: {
    aka: ["Lymphoplasmacytic lymphoma", "WM", "LPL", "Non-IgM lymphoplasmacytic lymphoma", "IgM lymphoplasmacytic lymphoma", "Waldenstrom macroglobulinemia", "C88.0"],
    subtypes: ["IgM lymphoplasmacytic lymphoma, which is Waldenstrom macroglobulinaemia and is the great majority of lymphoplasmacytic lymphoma (WHO-HAEM5)", "Non-Waldenstrom lymphoplasmacytic lymphoma, about 5 per cent: IgG or IgA paraprotein, non-secretory disease, or IgM disease without bone marrow involvement"],
    notes: ["Taxonomy. The corpus holds one record for lymphoplasmacytic lymphoma and Waldenstrom macroglobulinaemia, because WHO-HAEM5 treats them as one entity with two subtypes and the IgM subtype is the great majority. The International Consensus Classification names the entity \"lymphoplasmacytic lymphoma (Waldenstrom macroglobulinemia)\" in the same breath, and adds that the diagnosis may be made on lymphoplasmacytic aggregates filling less than 10 per cent of a trephine biopsy where clonal B cells and plasma cells are demonstrated, and that MYD88 L265P and CXCR4 testing are strongly encouraged in the work-up."],
    terms: ["lymphoma-classification-2022", "lymphoma-indolent-versus-aggressive", "myd88-l265p"],
    links: [SRC.who5, SRC.icc],
  },
};

/**
 * Hodgkin lymphoma was judged adequate and is not rewritten. One taxonomy note is added: the 2022 classifications
 * did not land in the same place on the name of nodular lymphocyte predominant Hodgkin lymphoma, and the corpus
 * holds a record under the old name.
 */
const hodgkinTaxonomySpike: Spike = {
  cancerId: "hodgkin-lymphoma", entities: [], patch: {
    notes: ["Taxonomy. The two classifications of 2022 disagree about the name of the non-classical form. The International Consensus Classification renamed nodular lymphocyte predominant Hodgkin lymphoma to nodular lymphocyte predominant B-cell lymphoma by consensus, because it differs biologically and clinically from classic Hodgkin lymphoma and is closely related to T-cell/histiocyte-rich large B-cell lymphoma. WHO-HAEM5 kept the old name so as not to interfere with trials in progress, while stating that the new name is acceptable in preparation for adopting it. The corpus keeps the record under the WHO-HAEM5 name and carries the other as an alias. Both books leave the four subtypes of classic Hodgkin lymphoma unchanged and both note that with modern treatment those subtypes have lost most of their prognostic meaning."],
    terms: ["lymphoma-classification-2022", "lymphoma-b-versus-t-cell"],
    links: [SRC.who5, SRC.icc],
  },
};


/**
 * Cutaneous T-cell lymphoma is the second family hub in this layer. It was named after mycosis fungoides and Sezary
 * syndrome, both of which now have records of their own, so the page is rewritten as the family: what the nine WHO-HAEM5
 * entities are, what the skin lymphomas have in common, why the diagnosis needs the dermatologist as much as the
 * pathologist, and which conditions that arise in the skin are not in this family at all.
 */
const CTCL_SUMMARY = [
  "What the family is. Primary cutaneous T-cell lymphomas are lymphomas that start in the skin and, for most of their course, stay there. WHO-HAEM5 gives them a family of their own inside the chapter on mature T-cell and NK-cell neoplasms, and lists nine entities in it. The word primary is load-bearing: a systemic lymphoma that has spread to the skin is not a cutaneous lymphoma, is staged differently and is treated differently, so the first job after the biopsy is to show that there is no disease anywhere else.",

  "The nine entities. Mycosis fungoides, which is the commonest by a wide margin and has its own page. The two primary cutaneous CD30-positive lymphoproliferative disorders, lymphomatoid papulosis and primary cutaneous anaplastic large cell lymphoma, which are two ends of one spectrum and both have pages. Primary cutaneous CD4-positive small or medium T-cell lymphoproliferative disorder, which usually presents as a single nodule on the head or neck and behaves benignly. Primary cutaneous acral CD8-positive lymphoproliferative disorder, which WHO-HAEM5 renamed from lymphoma to lymphoproliferative disorder because of how it behaves. Subcutaneous panniculitis-like T-cell lymphoma, which grows in the fat under the skin and can be mistaken for an inflammatory panniculitis. Primary cutaneous gamma/delta T-cell lymphoma and primary cutaneous CD8-positive aggressive epidermotropic cytotoxic T-cell lymphoma, the two genuinely aggressive members. And primary cutaneous peripheral T-cell lymphoma not otherwise specified, a name coined in 2022 for the rare cases that fit none of the others.",

  "What changed in 2022. Four of those entities, the gamma/delta lymphoma, the CD8-positive aggressive epidermotropic lymphoma, the acral CD8-positive disorder and the CD4-positive small or medium disorder, had been grouped in the previous classification under a single heading, cutaneous peripheral T-cell lymphoma, rare subtypes. WHO-HAEM5 separated them because their clinical behaviour, their appearance and their genetics differ, and the behaviour differs enormously: two of the four are indolent and two are aggressive, so a single heading hid the only fact a patient needed.",

  "Why the dermatologist is part of the diagnosis. These conditions overlap under the microscope, and WHO-HAEM5 says so directly: because the appearances and the surface markers overlap across the primary cutaneous T-cell lymphomas, correlation with the clinical history, the signs and the symptoms is a key element of the work-up, and dermatological examination and clinical photographic documentation are indispensable. A biopsy of lymphomatoid papulosis read without the history is reported as an aggressive lymphoma; a biopsy of early mycosis fungoides read without the history is reported as eczema. Dated photographs and a record of how lesions have behaved over months are therefore part of the diagnostic material, not a courtesy.",

  "What is not in this family. Sezary syndrome, although it is a disease of the skin and the blood and is managed by the same teams, is classified by WHO-HAEM5 among the mature T-cell and NK-cell leukaemias rather than among the primary cutaneous lymphomas, because it is leukaemic from the start; it has its own page here and is kept beside mycosis fungoides because that is how it is treated. The primary cutaneous B-cell lymphomas, primary cutaneous marginal zone lymphoma, primary cutaneous follicle centre lymphoma and primary cutaneous diffuse large B-cell lymphoma of the leg type, arise in the skin from B cells and belong to the B-cell side of the classification; the first two are indolent and the third is not. Primary cutaneous anaplastic large cell lymphoma is in this family, while the systemic anaplastic large cell lymphomas are not, which is the distinction that most often goes wrong because the cells look the same.",

  "How common they are, and how they behave. The skin lymphomas are rare. In the United Kingdom population series that reports lymphoma by subtype, mycosis fungoides accounted for 39 of 5,796 lymphomas and the CD30-positive lymphoproliferative disorders for 37, European age-standardised rates of 0.12 and 0.13 per 100,000 a year, with five-year relative survival of 86.6 and 88.3 per cent. Those two figures carry the character of the family: most of these conditions are long-term skin diseases that are managed for decades rather than cancers that are cured or not cured, and the usual harm is over-treatment rather than under-treatment. The aggressive members, the gamma/delta lymphoma and the CD8-positive aggressive epidermotropic lymphoma, are the exceptions and are treated as systemic disease from the start.",

  "How they are staged. Mycosis fungoides and Sezary syndrome are staged by the ISCL and EORTC system revised in 2007, which classifies the skin, the lymph nodes, the viscera and the blood separately; that system is on the mycosis fungoides page. The other cutaneous lymphomas use a separate ISCL and EORTC system that records the number, size and distribution of skin lesions and whether lymph nodes or other organs are involved. Neither is the Lugano classification used for nodal lymphoma, because counting lymph node regions does not describe a disease that lives in the skin.",
].join("\n\n");

const ctclHubSpike: Spike = {
  cancerId: "cutaneous-t-cell-lymphoma", entities: [], patch: {
    asOf,
    tldr: "Cutaneous T-cell lymphoma is a family of nine lymphomas that start in the skin and mostly stay there, of which mycosis fungoides is by far the commonest. Most of them are long-term skin conditions managed over decades rather than cancers that are cured or not cured, and two of the nine are genuinely aggressive.",
    summary: CTCL_SUMMARY,
    burden: "Rare. In the United Kingdom population series that reports lymphoma by subtype, mycosis fungoides accounted for 39 of 5,796 lymphomas and the primary cutaneous CD30-positive lymphoproliferative disorders for 37, European age-standardised rates of 0.12 and 0.13 per 100,000 a year, with five-year relative survival of 86.6 and 88.3 per cent respectively. The remaining entities in the family are individually rarer than either.",
    subtypes: [
      "Mycosis fungoides, the commonest, with its variants including the folliculotropic form",
      "Primary cutaneous CD30-positive lymphoproliferative disorders: lymphomatoid papulosis and primary cutaneous anaplastic large cell lymphoma",
      "Primary cutaneous CD4-positive small or medium T-cell lymphoproliferative disorder",
      "Primary cutaneous acral CD8-positive lymphoproliferative disorder, renamed from lymphoma in 2022",
      "Subcutaneous panniculitis-like T-cell lymphoma, which grows in the fat beneath the skin",
      "Primary cutaneous gamma/delta T-cell lymphoma, one of the two aggressive members",
      "Primary cutaneous CD8-positive aggressive epidermotropic cytotoxic T-cell lymphoma, the other",
      "Primary cutaneous peripheral T-cell lymphoma, not otherwise specified, a name coined in 2022",
      "Sezary syndrome, which is managed with this family but is classified among the mature T-cell leukaemias",
    ],
    biomarkers: [
      "Staging that shows no lymphoma outside the skin, which is what makes a cutaneous lymphoma primary",
      "The clinical history and dated photographs, which WHO-HAEM5 calls indispensable because the appearances overlap",
      "CD30, which separates the two CD30-positive lymphoproliferative disorders and decides whether brentuximab vedotin is an option",
      "CD4 against CD8, and alpha-beta against gamma-delta T-cell receptor, which separate the indolent entities from the aggressive ones",
      "A clonal T-cell receptor rearrangement in the skin and, where relevant, in the blood",
      "Blood involvement, which moves the disease from a skin problem to a systemic one",
    ],
    basics: {
      symptoms: [
        "Flat scaly patches that have been treated as eczema or psoriasis for years, which is the usual start of mycosis fungoides.",
        "Crops of small red bumps that ulcerate, crust and heal on their own over weeks, leaving small scars, which is lymphomatoid papulosis.",
        "One or a few firm red or violet nodules, often ulcerated, which is primary cutaneous anaplastic large cell lymphoma.",
        "Deep tender lumps in the fat of the limbs or trunk, sometimes with fevers, which is subcutaneous panniculitis-like T-cell lymphoma.",
        "Redness over most of the body with intense itch, which is erythroderma and raises the question of Sezary syndrome.",
        "Rapidly growing, ulcerating tumours over weeks rather than years, which point to one of the two aggressive entities and are treated urgently.",
      ],
      diagnosis: [
        "A skin biopsy, read by a dermatopathologist alongside the clinical history and photographs. Several biopsies over months or years are normal in early disease and are not a failure.",
        "Immunohistochemistry for the T-cell markers, CD30, CD4 and CD8, and for the type of T-cell receptor the cells carry.",
        "A test for a clonal T-cell receptor rearrangement in the skin, which supports the diagnosis and does not make it on its own: clones are found in inflammatory skin disease too.",
        "Blood tests including a film and flow cytometry for circulating lymphoma cells where the skin is red all over or the disease is advanced.",
        "Imaging and, where indicated, a lymph node biopsy to confirm there is no lymphoma outside the skin, which is what makes it a primary cutaneous lymphoma.",
      ],
      staging: [
        "Mycosis fungoides and Sezary syndrome use the ISCL and EORTC system revised in 2007, which classifies skin, nodes, viscera and blood separately.",
        "The other cutaneous lymphomas use a separate ISCL and EORTC system that records the number, size and distribution of lesions and whether nodes or organs are involved.",
        "The Lugano classification used for nodal lymphoma is not used here, because counting lymph node regions does not describe a disease that lives in the skin.",
        "Stage decides the treatment more directly than in most lymphomas: skin-directed treatment for skin-limited disease, systemic treatment once the nodes, organs or blood are involved.",
      ],
      sources: [SRC.who5, SRC.icc, SRC.pdq, SRC.lymphomaAction],
    },
    openProblems: [
      "The diagnosis depends on a correlation between the biopsy and the clinical course, and that correlation is only as good as the access to a dermatologist who sees these conditions often. Most people with early mycosis fungoides are managed for years before anybody makes it.",
      "Over-treatment is the commonest harm in this family. Combination chemotherapy produces short remissions and real damage in conditions that are otherwise controlled for decades.",
      "The two aggressive entities in the family are individually so rare that their treatment rests on case series, and they are easy to mistake for the indolent ones at first.",
    ],
    related: ["mycosis-fungoides", "sezary-syndrome", "lymphomatoid-papulosis", "primary-cutaneous-anaplastic-large-cell-lymphoma", "peripheral-t-cell-lymphoma", "primary-cutaneous-marginal-zone-lymphoma"],
    terms: ["lymphoma-classification-2022", "lymphoma-b-versus-t-cell", "lymphoma-indolent-versus-aggressive", "lymphoma-nodal-versus-extranodal", "lymphoma-tx-skin-directed-therapy"],
    notes: ["Taxonomy. WHO-HAEM5 gives the primary cutaneous T-cell lymphomas a family of their own with nine entities, and separated four of them from a single previous heading, cutaneous peripheral T-cell lymphoma, rare subtypes, because two of the four are indolent and two are aggressive. Sezary syndrome is classified among the mature T-cell and NK-cell leukaemias rather than in this family, and is kept beside mycosis fungoides here because that is how it is treated. The primary cutaneous B-cell lymphomas arise in the skin and belong to the B-cell side of the classification."],
    links: [SRC.who5, SRC.icc, SRC.pdq, SRC.lymphomaAction, SRC.hmrn],
  },
};

const nhlCoreSpike: Spike = { cancerId: "non-hodgkin-lymphoma", entities: lymphomaCoreTerms, patch: nhlPatch };

export { waldenstromTaxonomySpike, hodgkinTaxonomySpike, ctclHubSpike };
export default nhlCoreSpike;

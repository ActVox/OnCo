import type { CancerInput } from "@/lib/schema";
import type { Spike } from "./index";
import { SRC, W, asOf, doi, pdqGuideline, tags, whoGuideline } from "./lymphoma-core";

/**
 * T-CELL AND NK-CELL LYMPHOMA: the entity records WHO-HAEM5 names and the corpus did not hold. Facet A of the
 * lymphoma deep dive, 29 September 2026; the family decisions and the shared sources are in ./lymphoma-core.ts.
 *
 * Ten records. Seven sit under `peripheral-t-cell-lymphoma`, which the corpus uses as the mature T-cell and
 * NK-cell hub even though WHO-HAEM5 reserves that name for one entity inside it; three sit under
 * `cutaneous-t-cell-lymphoma`, beside `sezary-syndrome`, which was already a child.
 *
 * Two treatment rows written by the treatment layer onto `peripheral-t-cell-lymphoma` because these records did
 * not exist are moved here by ./lymphoma-treatment-tcell.ts: the asparaginase row for extranodal NK/T-cell
 * lymphoma and the HTLV-1 row for adult T-cell leukaemia/lymphoma. The anaplastic large cell lymphomas had no
 * standalone row to move; their first-line treatment is written as the CD30-positive row of the peripheral
 * T-cell lymphoma page, which is where it belongs because that row covers every CD30-positive entity. The four
 * mycosis fungoides rows written onto `cutaneous-t-cell-lymphoma` move here too, to `mycosis-fungoides`; that hub
 * keeps its own rows and is rewritten in ./lymphoma-core.ts as the family of nine entities it actually is.
 *
 * One figure in a published table is deliberately not quoted. The UK Haematological Malignancy Research Network
 * subtype paper reports five-year survival for ALK-negative anaplastic large cell lymphoma identical to the row
 * above it, while both of its own sex-specific estimates are higher than that total, which cannot be true. The
 * incidence and median age from the same table are used; the survival cell is not, and the all-anaplastic figure
 * is quoted in its place.
 */

const PAPER = {
  pink: doi("A prognostic index for natural killer cell lymphoma after non-anthracycline-based treatment, 527 patients from 38 hospitals in 11 countries (Kim, Lancet Oncology 2016)", "10.1016/S1470-2045(15)00533-1"),
  enktlWest: doi("Extranodal NK/T cell lymphoma, nasal type: an update on epidemiology, clinical presentation and natural history in North American and European cases (Current Hematologic Malignancy Reports 2016)", "10.1007/s11899-016-0355-9"),
  enktlTaiwan: doi("Trends in the incidence of the Epstein-Barr virus-associated malignancies extranodal NK/T-cell lymphoma and nasopharyngeal carcinoma in Taiwan (PLoS One 2024)", "10.1371/journal.pone.0315380"),
  atll2009: doi("Definition, prognostic factors, treatment and response criteria of adult T-cell leukaemia-lymphoma: a proposal from an international consensus meeting (Tsukasaki, J Clin Oncol 2009)", "10.1200/JCO.2008.18.2428"),
  atll2019: doi("Revised Adult T-Cell Leukemia-Lymphoma International Consensus Meeting Report (Cook, J Clin Oncol 2019)", "10.1200/JCO.18.00501"),
  atllIncidence: doi("Increase in incidence of adult T-cell leukaemia/lymphoma in non-endemic areas of Japan and the United States (Chihara, Cancer Science 2012)", "10.1111/j.1349-7006.2012.02373.x"),
  echelon2: doi("ECHELON-2: brentuximab vedotin with chemotherapy for CD30-positive peripheral T-cell lymphoma, five-year results (Horwitz, Annals of Oncology 2022)", "10.1016/j.annonc.2021.12.002"),
  biaJama: doi("Breast implants and the risk of anaplastic large-cell lymphoma in the breast, Dutch nationwide pathology registry (de Boer, JAMA Oncology 2018)", "10.1001/jamaoncol.2017.4510"),
  biaMeta: doi("Risk of breast implant-associated anaplastic large cell lymphoma, systematic review and meta-analysis (Aesthetic Plastic Surgery 2024)", "10.1007/s00266-024-03956-9"),
  cd30Consensus: doi("EORTC, ISCL and USCLC consensus recommendations for the treatment of primary cutaneous CD30-positive lymphoproliferative disorders: lymphomatoid papulosis and primary cutaneous anaplastic large-cell lymphoma (Kempf, Blood 2011)", "10.1182/blood-2011-05-351346"),
  stanford: doi("CD30-positive cutaneous lymphoproliferative disorders: the Stanford experience in lymphomatoid papulosis and primary cutaneous anaplastic large cell lymphoma, 56 patients (Liu, J Am Acad Dermatol 2003)", "10.1016/S0190-9622(03)02484-8"),
  agar: doi("Survival outcomes and prognostic factors in mycosis fungoides and Sezary syndrome, validation of the revised ISCL/EORTC staging proposal in 1,502 patients (Agar, J Clin Oncol 2010)", "10.1200/JCO.2009.27.7665"),
  mfAdvanced: doi("Advanced-stage mycosis fungoides and Sezary syndrome, survival and response to treatment in 168 patients (Clinical Lymphoma Myeloma and Leukemia 2015)", "10.1016/j.clml.2015.02.027"),
  newcastle: doi("Evaluation of enteropathy-associated T-cell lymphoma comparing standard therapies with a novel regimen including autologous stem cell transplantation (Sieniawski, Blood 2010)", "10.1182/blood-2009-07-231324"),
  meitl: doi("Modified Newcastle regimen in monomorphic epitheliotropic intestinal T-cell lymphoma, a real-world cohort of 56 patients (EJHaem 2026)", "10.1002/jha2.70400"),
};

type Rec = Omit<CancerInput, "kind" | "asOf" | "group" | "tags">;
const rec = (x: Rec & { parent: string }): CancerInput => ({ kind: "cancer", asOf, group: "haematologic", tags: [...tags, "subtype-page"], ...x });

export const lymphomaCoreTcellRecords: CancerInput[] = [
  // ------------------------------------------------------------------ EXTRANODAL NK/T-CELL
  rec({
    id: "extranodal-nk-t-cell-lymphoma", parent: "peripheral-t-cell-lymphoma",
    name: "Extranodal NK/T-cell lymphoma",
    wikipedia: W("Extranodal_NK/T-cell_lymphoma,_nasal_type"),
    aka: ["Extranodal NK/T-cell lymphoma, nasal type", "ENKTL", "ENKTCL", "Nasal type NK/T-cell lymphoma", "NK/T-cell lymphoma", "Lethal midline granuloma", "Angiocentric lymphoma", "Extranodal NK/T-cell lymphoma (EBV)"],
    tldr: "An aggressive lymphoma of natural killer cells, always driven by Epstein-Barr virus, that destroys the tissues in the middle of the face: the nose, the palate and the sinuses. It is common in east Asia and Latin America and uncommon in Europe, and it is the one lymphoma in which ordinary anthracycline chemotherapy does not work at all.",
    burden: "Uncommon everywhere outside east Asia and Latin America. In Taiwan, 872 new diagnoses were recorded between 2008 and 2021 and the age-adjusted incidence fell over that period, with an average annual change of minus 2.47 per cent; the age-specific rate in people aged 45 to 64 fell from 0.46 to 0.32 per 100,000 person-years. In the United States it is commoner among Asian and Pacific Islander and Hispanic people than among non-Hispanic white people, and the published North American and European data are described by the specialists who collected them as very limited. The United Kingdom population series that reports lymphoma by subtype does not list it separately.",
    summary: [
      "What it is. A lymphoma of natural killer cells, and in a minority of cases of cytotoxic T cells, in which every tumour cell carries Epstein-Barr virus. The virus is part of the definition: a tumour with this appearance that does not carry it is a different disease. The cells grow around and into blood vessels, which cuts off the blood supply to the tissue they sit in, and that is why the disease destroys what it grows in rather than simply displacing it.",
      "Where it starts and what it does. Most often in the nose and the structures around it: the nasal cavity, the sinuses, the hard palate, the back of the throat. It presents as blockage, bleeding, crusting or a hole in the palate, and it is often treated as sinusitis for months before anybody biopsies it. Extranasal sites include the skin, the gut, the testis and the soft tissues, and disease starting outside the nose behaves worse. WHO-HAEM5 dropped the qualifier nasal type from the name in 2022 for exactly that reason, because the disease is recognised at several extranodal sites; the International Consensus Classification kept it, so a report in 2026 may carry either name.",
      "How it differs from the rest of the T-cell family, and this is the most important thing on the page. The tumour expresses P-glycoprotein, a pump that throws anthracyclines back out of the cell. Chemotherapy built around doxorubicin, which is the backbone of almost every other lymphoma regimen, therefore does not work here and must not be used. What does work is asparaginase, an enzyme that strips the amino acid asparagine out of the blood; the tumour cannot make its own and dies. WHO-HAEM5 records the consequence plainly: introducing asparaginase-based chemotherapy with radiotherapy markedly improved outcomes in this disease.",
      "Two near neighbours it is separated from. Intravascular NK/T-cell lymphoma was counted as a form of this disease in the previous classification; in 2022 it was moved to be described alongside aggressive NK-cell leukaemia, because it does not form masses, favours the skin and the central nervous system, is not invariably positive for the virus, and its place is not yet clear. In the other direction, an indolent NK-cell lymphoproliferative disorder of the gut has almost the same surface markers and regresses on its own; what separates them is the virus, which that condition does not carry. WHO-HAEM5 says it is most important not to mistake one for the other.",
      "How the outlook is estimated. The index in current use is PINK, built from 527 patients treated at 38 hospitals in 11 countries with regimens that contained no anthracycline. Four features predicted survival: age over 60, stage III or IV, involvement of distant lymph nodes, and disease starting outside the nose. Three-year overall survival was 81 per cent with none of them, 62 per cent with one, and 25 per cent with two or more. Adding the level of Epstein-Barr virus DNA in the blood, which is also an independent predictor, gives a second version of the index.",
      "The treatment is on this page, moved here from the peripheral T-cell lymphoma page once this record existed. Radiotherapy matters more in early disease than in almost any other lymphoma, and delaying it worsens the outcome.",
    ].join("\n\n"),
    subtypes: ["Nasal, arising in the nasal cavity, sinuses or palate, which is an extranodal site", "Extranasal, arising in the skin, gut, testis or soft tissue, which carries a worse outlook and is a risk factor in the PINK index"],
    biomarkers: [
      "Epstein-Barr virus in every tumour cell by EBER in situ hybridisation, which is part of the definition",
      "An NK-cell phenotype: CD56 positive, surface CD3 negative with cytoplasmic CD3-epsilon positive, and cytotoxic granule proteins present",
      "P-glycoprotein expression, which is why anthracycline chemotherapy does not work",
      "Plasma Epstein-Barr virus DNA, which tracks the disease and is an independent predictor of survival",
      "The PINK index: age over 60, stage III or IV, distant lymph node involvement and non-nasal disease",
      "Deletion of 6q21-25, and mutations of the JAK-STAT pathway, epigenetic regulators, TP53, MGA and DDX3X",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis, and why it is usually late", approach: "The presentation looks like sinusitis: blockage, bleeding, crusting and pain in the nose, often treated with antibiotics and steroids for months. A biopsy taken through the nose is often necrotic and non-diagnostic, so repeat biopsies are common and are not a failure. The diagnosis needs in situ hybridisation for Epstein-Barr-encoded RNA, which is positive in every tumour cell by definition, together with an NK-cell phenotype: CD56 positive, surface CD3 negative with cytoplasmic CD3-epsilon positive, and cytotoxic granule proteins present. A gut lesion with the same markers but no virus is the indolent NK-cell lymphoproliferative disorder of the gastrointestinal tract, which regresses on its own; WHO-HAEM5 says it is most important not to mistake one for the other.", refs: ["histopathology-ihc", "ebv-term", "endoscopy", "lymphoma-classification-2022"], guideline: whoGuideline },
      { setting: "Staging and the risk score", approach: "PET-CT of the whole body, magnetic resonance imaging of the face and sinuses to map local destruction, examination of the nose and throat, and a measurement of Epstein-Barr virus DNA in the blood, which tracks the disease and is an independent predictor of survival. The index in use is PINK, built from 527 patients treated without anthracyclines at 38 hospitals in 11 countries, which counts age over 60, stage III or IV, involvement of distant lymph nodes, and disease starting outside the nose: three-year overall survival was 81 per cent with none of those, 62 per cent with one and 25 per cent with two or more. Adding the viral DNA level gives a second version, PINK-E.", refs: ["fdg-pet", "plasma-ebv-dna", "lugano-classification", "ebv-term"], guideline: { version: "PINK (Lancet Oncology 2016); NCCN T-Cell Lymphomas; NCI PDQ", url: PAPER.pink.url } },
    ],
    history: [
      { year: 2011, title: "An asparaginase regimen tested in advanced and relapsed disease", note: "The SMILE regimen, built around asparaginase and deliberately free of anthracyclines, was tested in newly diagnosed stage IV, relapsed and refractory disease and established asparaginase as the backbone of treatment.", refs: ["asparaginase"] },
      { year: 2016, title: "The PINK index", note: "Built from 527 patients treated without anthracyclines at 38 hospitals in 11 countries: age over 60, stage III or IV, distant lymph node involvement and non-nasal disease gave three-year overall survival of 81, 62 and 25 per cent across the three risk groups.", refs: ["plasma-ebv-dna"] },
      { year: 2022, title: "Nasal type dropped from the name", note: "WHO-HAEM5 renamed the entity extranodal NK/T-cell lymphoma, recognising its presentation at several extranodal sites; the International Consensus Classification kept the nasal type qualifier.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "The disease is common in east Asia and Latin America and rare in the countries that run most randomised trials, so the regimens that work best were developed where most of the patients are and are least familiar where the rest of them are treated.",
      "There is no randomised comparison between the asparaginase-containing regimens in use, and they differ substantially in toxicity.",
      "PD-1 blockade produces responses in relapsed disease and has never been tested against anything in a randomised trial in this disease.",
      "The commonest clinical failure is delay: the presentation looks like sinusitis, and the biopsy is often taken months after the symptoms began.",
    ],
    related: ["peripheral-t-cell-lymphoma", "adult-t-cell-leukaemia-lymphoma", "nasopharyngeal", "non-hodgkin-lymphoma", "hepatosplenic-t-cell-lymphoma"],
    terms: ["ebv-term", "plasma-ebv-dna", "lymphoma-classification-2022", "lymphoma-nodal-versus-extranodal", "lymphoma-pit-score", "lymphoma-tx-radiotherapy", "lymphoma-b-versus-t-cell"],
    technologies: ["histopathology-ihc", "fdg-pet", "imrt-igrt"],
    drugs: ["asparaginase", "pembrolizumab"],
    links: [SRC.who5, SRC.icc, PAPER.pink, PAPER.enktlWest, PAPER.enktlTaiwan, SRC.pdq],
  }),

  // ------------------------------------------------------------------ ADULT T-CELL LEUKAEMIA/LYMPHOMA
  rec({
    id: "adult-t-cell-leukaemia-lymphoma", parent: "peripheral-t-cell-lymphoma",
    name: "Adult T-cell leukaemia/lymphoma",
    wikipedia: W("Adult_T-cell_leukemia/lymphoma"),
    aka: ["ATLL", "ATL", "Adult T-cell leukemia/lymphoma", "Adult T-cell leukaemia", "HTLV-1-associated lymphoma", "Adult T-cell leukaemia/lymphoma (HTLV-1)", "Smouldering ATL", "Chronic ATL", "Acute ATL", "Lymphoma-type ATL"],
    tldr: "A T-cell lymphoma caused by a virus, HTLV-1, which is usually caught in infancy through breast milk and causes the lymphoma decades later in a small minority of the people it infects. It occurs in people from south-western Japan, the Caribbean, west and central Africa, parts of South America, Iran and Romania, and it comes in four forms that are treated very differently.",
    burden: "Concentrated where the virus is. In the registry study that compared endemic and non-endemic areas, 2,055 patients were diagnosed in three prefectures of Kyushu in south-western Japan between 1993 and 2006 against 1,380 in twelve prefectures of Honshu, and 140 patients were recorded in the United States SEER registries between 1993 and 2008. Incidence rose significantly in the non-endemic areas over that period (an average annual change of plus 4.6 per cent in Honshu and plus 6.2 per cent in the United States) while remaining unchanged in endemic Kyushu, which the authors read as the virus travelling with its carriers. A systematic review of HTLV-1 among immigrants and refugees worldwide found a pooled prevalence of 1.28 per cent, rising to 7.27 per cent among people from the Western Pacific region.",
    summary: [
      "What it is. A cancer of mature CD4-positive T cells caused by human T-lymphotropic virus type 1, the first human retrovirus shown to cause a cancer. The virus is acquired mainly through breastfeeding in infancy, and also through sexual contact and transfusion of cellular blood products. It then sits in the T cells for decades. Only a small minority of the people it infects ever develop the lymphoma, and the latency is usually measured in decades, which is why this is a disease of middle and later life in people who were infected as babies.",
      "The four forms, which are really four diseases. The subclassification proposed by Shimoyama and adopted by the international consensus meetings divides it into acute, lymphoma, chronic and smouldering types. The chronic and smouldering types without unfavourable features are indolent and are watched, in the same way an early chronic lymphocytic leukaemia is watched. The acute and lymphoma types are aggressive and are treated at once. Getting the type right is the first decision and it changes everything that follows.",
      "How it differs from the rest of the T-cell family. Four things recur and none of them belongs to ordinary peripheral T-cell lymphoma. High calcium, often very high, caused by the tumour making parathyroid hormone-related protein; it was found in the blood cells of all 13 patients tested in the study that established the mechanism, and it can present as confusion, thirst and kidney failure before the lymphoma is recognised. Profound suppression of cell-mediated immunity, so that opportunistic infection, and particularly hyperinfection with the worm Strongyloides stercoralis, is a common cause of harm and is looked for before treatment. Involvement of the skin, which may be the only sign for a long time and which the 2019 consensus meeting singled out for a classification of its own. And involvement of the central nervous system, which is common in the aggressive types.",
      "Who should be tested. HTLV-1 serology belongs in the work-up of any T-cell lymphoma or leukaemia in a person who comes from, or whose parents come from, an endemic region. Without the test, the disease is reported as peripheral T-cell lymphoma not otherwise specified and treated on a pathway that does not fit it.",
      "What is known about treating it, honestly. The 2019 international consensus report states the position of the evidence in its own words: as a result of lower-quality clinical evidence, a best practice approach was adopted and the statements were agreed by more than 90 per cent of the authors. That is a consensus, not a trial result, and it applies to the choice of chemotherapy, to the use of antiviral therapy with zidovudine and interferon in the leukaemic types, and to the place of allogeneic stem cell transplant. The treatment rows on this page were moved here from the peripheral T-cell lymphoma page once this record existed.",
    ].join("\n\n"),
    subtypes: [
      "Acute type, the commonest aggressive form, with circulating tumour cells, high calcium and rapid progression",
      "Lymphoma type, with lymph node disease and few circulating cells, which does not respond to antiviral therapy",
      "Chronic type, indolent unless unfavourable features are present",
      "Smouldering type, indolent, often with skin disease and few circulating cells",
      "Cutaneous variants, which the 2019 consensus meeting singled out for their own classification",
    ],
    biomarkers: [
      "HTLV-1 serology, and confirmation that the virus is clonally integrated in the tumour cells",
      "The Shimoyama type (acute, lymphoma, chronic or smouldering), which is the main treatment decision",
      "Serum calcium and lactate dehydrogenase, both part of the subtype definition",
      "A CD4-positive, CD25-positive, CCR4-positive phenotype with loss of CD7",
      "Strongyloides screening before immunosuppressive treatment, because hyperinfection is fatal",
      "Examination of the spinal fluid in the aggressive types, in which involvement of the central nervous system is common",
    ],
    standardOfCare: [
      { setting: "Testing for the virus, which decides the diagnosis", approach: "HTLV-1 serology belongs in the work-up of any T-cell lymphoma or leukaemia in a person who comes from, or whose parents come from, south-western Japan, the Caribbean, west or central Africa, parts of South America, Iran or Romania. Without the test the disease is reported as peripheral T-cell lymphoma not otherwise specified and treated on a pathway that does not fit it. A positive test is followed by confirmation that the virus is clonally integrated in the tumour cells, because asymptomatic infection is common in those populations and does not by itself mean lymphoma.", refs: ["lymphoma-htlv-1", "histopathology-ihc", "oncogenic-viruses"], guideline: whoGuideline },
      { setting: "Working out which of the four types it is", approach: "The subclassification proposed by Shimoyama and adopted by the international consensus meetings divides the disease into acute, lymphoma, chronic and smouldering types, using the count of circulating tumour cells, the lactate dehydrogenase, the calcium and the sites involved. It is the first decision and it changes everything: the chronic and smouldering types without unfavourable features are watched, while the acute and lymphoma types are treated at once. The consensus report sets out prognostic factors and a set of response criteria specific to this disease, which is why trials in it are not reported like trials in other lymphomas.", refs: ["lymphoma-htlv-1", "lugano-classification", "lymphoma-tx-watch-and-wait"], guideline: { version: "International consensus meeting report (J Clin Oncol 2009) and its 2019 revision; NCI PDQ", url: PAPER.atll2009.url } },
      { setting: "What has to be looked for before and during treatment", approach: "Three things that belong to this disease and not to the rest of the family. Calcium, which can be very high because the tumour makes parathyroid hormone-related protein, and which may present as confusion, thirst or kidney failure before the lymphoma is recognised. Strongyloides stercoralis, because the immune suppression caused by the virus allows hyperinfection, which is fatal and is prevented by screening and treating before immunosuppressive therapy. And the central nervous system, which is commonly involved in the aggressive types and is examined by lumbar puncture.", refs: ["lymphoma-htlv-1", "intrathecal-therapy", "lymphoma-tx-pjp-and-infection-prophylaxis"], guideline: { version: "Revised Adult T-Cell Leukemia-Lymphoma International Consensus Meeting Report (J Clin Oncol 2019)", url: PAPER.atll2019.url } },
    ],
    history: [
      { year: 1977, title: "Described as a distinct disease in south-western Japan", note: "A cluster of T-cell leukaemias in Kyushu was recognised as a single disease, which led to the search for its cause." },
      { year: 1990, title: "The mechanism of the high calcium established", note: "Parathyroid hormone-related protein was found to be abundantly expressed in the blood cells of all 13 patients tested, and in HTLV-1 carriers without symptoms, and the viral Tax protein was shown to switch its gene on." },
      { year: 2009, title: "An international consensus defines the four types", note: "The consensus meeting set out the acute, lymphoma, chronic and smouldering types, the prognostic factors and a set of response criteria specific to the disease, which became the standard reference for trials." },
      { year: 2019, title: "The consensus revised, on best practice rather than trials", note: "The revised report added the classification of cutaneous disease, disease in the central nervous system, the management of older and transplant-ineligible patients, upfront allogeneic transplant and newer agents, and stated that a best practice approach was adopted because the clinical evidence was of lower quality." },
    ],
    openProblems: [
      "The treatment of this disease rests on consensus rather than on randomised evidence, and the authors of the consensus say so.",
      "The virus is preventable. Antenatal screening and avoidance of breastfeeding where it is safe to do so reduce transmission, and most of the world does not screen.",
      "The incidence is rising in the places that do not expect it, including the United States and non-endemic Japan, while remaining stable where it is endemic.",
      "Drugs approved for this disease in Japan, including mogamulizumab and later agents, are not approved in much of the world, so the people least likely to be offered them are those who moved away from where the disease is studied.",
    ],
    related: ["peripheral-t-cell-lymphoma", "extranodal-nk-t-cell-lymphoma", "t-cell-prolymphocytic-leukaemia", "non-hodgkin-lymphoma", "cutaneous-t-cell-lymphoma"],
    terms: ["lymphoma-htlv-1", "oncogenic-viruses", "lymphoma-classification-2022", "lymphoma-pit-score", "lymphoma-b-versus-t-cell", "lymphoma-tx-transplant-role"],
    technologies: ["histopathology-ihc", "allogeneic-hsct"],
    drugs: ["mogamulizumab", "interferon-alfa"],
    links: [SRC.who5, SRC.icc, PAPER.atll2009, PAPER.atll2019, PAPER.atllIncidence, SRC.pdq],
  }),

  // ------------------------------------------------------------------ ALK-POSITIVE ALCL
  rec({
    id: "alk-positive-anaplastic-large-cell-lymphoma", parent: "peripheral-t-cell-lymphoma",
    name: "ALK-positive anaplastic large cell lymphoma",
    wikipedia: W("Anaplastic_large-cell_lymphoma"),
    aka: ["ALK-positive ALCL", "ALK+ ALCL", "Anaplastic large cell lymphoma, ALK-positive", "ALK-positive anaplastic large-cell lymphoma", "Systemic ALK-positive anaplastic large cell lymphoma"],
    tldr: "An aggressive T-cell lymphoma, mostly of children and young adults, whose cells carry a broken ALK gene and a protein called CD30 on the surface. Despite looking alarming down the microscope it is the T-cell lymphoma most often cured, and both of its markers are things that drugs can aim at.",
    burden: "Rare and young. In the United Kingdom population series that reports lymphoma by subtype, 16 of 5,796 lymphomas were ALK-positive anaplastic large cell lymphoma, a European age-standardised rate of 0.06 per 100,000 a year, with men affected about three times as often as women and a median age at diagnosis of 35.6 years, the youngest of any lymphoma in that series apart from Hodgkin lymphoma and Burkitt lymphoma. Five-year relative survival in that series was 75.2 per cent.",
    summary: [
      "What it is. A lymphoma of T cells in which a piece of chromosome 2 carrying the ALK gene has joined another gene, most often NPM1 on chromosome 5, producing a fusion protein that is permanently switched on and drives the cell to divide. Every cell also carries CD30, strongly and uniformly, which is the second thing that makes this disease unusual.",
      "How it differs from the rest of the family. WHO-HAEM5 recognises three anaplastic large cell lymphomas: this one, the ALK-negative form and the breast implant-associated form, with the primary cutaneous form filed among the skin lymphomas. ALK-positive disease has been separated from ALK-negative disease since the fourth edition because its cause and its course are different, and the difference is large: it occurs in much younger people and is cured far more often.",
      "How it presents. Often dramatically, with fevers, weight loss, enlarged lymph nodes and disease outside the lymph nodes, in skin, bone, soft tissue, lung or liver. The cells are large and strange-looking, including the hallmark cells with kidney-shaped nuclei, and a pathologist who does not stain for CD30 and ALK can mistake the disease for a carcinoma or a sarcoma. That is a real and recorded error, and it is the reason the two stains are done.",
      "Why CD30 matters more here than anywhere else. Brentuximab vedotin is an antibody against CD30 carrying a chemotherapy drug. ECHELON-2 randomised 452 people with untreated CD30-positive peripheral T-cell lymphoma, with the trial deliberately targeting 75 per cent with systemic anaplastic large cell lymphoma, to brentuximab vedotin with cyclophosphamide, doxorubicin and prednisone or to the same chemotherapy with vincristine instead of the antibody. At five years, progression-free survival was 51.4 against 43.0 per cent and overall survival 70.1 against 61.0 per cent. It is the only randomised first-line trial in the whole T-cell family to improve survival, and most of its patients had this disease or its ALK-negative sibling.",
      "What ALK offers that nothing else in this family does. ALK inhibitors, developed for lung cancer, work here too; crizotinib has activity in relapsed ALK-positive disease and is used particularly in children. That is unusual in T-cell lymphoma, where targeted drugs have mostly disappointed, and it exists only because the same gene was broken in a much commoner cancer.",
    ].join("\n\n"),
    subtypes: ["Common pattern, the great majority", "Lymphohistiocytic, small cell and Hodgkin-like patterns, which look different and behave the same"],
    biomarkers: [
      "ALK rearrangement, most often NPM1::ALK from t(2;5)(p23;q35), detected by immunohistochemistry for the ALK protein and confirmed by fluorescence in situ hybridisation",
      "Uniform strong CD30 on every tumour cell, which is what brentuximab vedotin attaches to",
      "Loss of several T-cell markers, which is characteristic and can make the lineage hard to establish",
      "Epithelial membrane antigen, often positive, which contributes to the mistaken diagnosis of carcinoma",
      "The International Prognostic Index, which separates outcomes here as it does in B-cell lymphoma",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis, and the mistake to avoid", approach: "Immunohistochemistry for CD30 and for ALK protein on the biopsy, with fluorescence in situ hybridisation to confirm the rearrangement where the stain is equivocal. The large pleomorphic cells, the frequent expression of epithelial membrane antigen and the loss of several T-cell markers mean that a tumour stained with a short panel can be reported as a carcinoma or a sarcoma; CD30 and ALK are what prevent that. Staging covers the sites this disease reaches outside the lymph nodes: skin, bone, soft tissue, lung and liver.", refs: ["histopathology-ihc", "cd30", "alk", "fdg-pet", "lugano-classification"], guideline: whoGuideline },
      { setting: "First-line treatment", approach: "Brentuximab vedotin with cyclophosphamide, doxorubicin and prednisone, on the strength of ECHELON-2, which randomised 452 people with untreated CD30-positive peripheral T-cell lymphoma, three-quarters of them with systemic anaplastic large cell lymphoma: five-year progression-free survival 51.4 per cent against 43.0 and overall survival 70.1 against 61.0 with chemotherapy alone. Vincristine is left out because brentuximab vedotin is itself a tubulin-directed agent and giving both causes unacceptable nerve damage. Unlike the other nodal T-cell lymphomas, ALK-positive disease does well enough that consolidating a first remission with an autologous transplant is generally not offered. The regimens and the cycle detail are on the peripheral T-cell lymphoma page.", refs: ["echelon-2", "brentuximab-vedotin", "cyclophosphamide", "doxorubicin", "prednisone", "peripheral-t-cell-lymphoma", "lymphoma-tx-regimen-alphabet"], guideline: { version: "ECHELON-2 five-year results (Annals of Oncology 2022); NCCN T-Cell Lymphomas; NCI PDQ", url: PAPER.echelon2.url } },
      { setting: "Relapse", approach: "Brentuximab vedotin is highly active in relapsed systemic anaplastic large cell lymphoma, with response rates well above those seen in other peripheral T-cell lymphomas, and it is the usual choice for anyone who has not already had it. ALK inhibitors developed for lung cancer, crizotinib in particular, produce responses here and are used especially in children and young adults. Allogeneic transplant is offered to fit patients who respond. The detail is on the peripheral T-cell lymphoma page.", refs: ["brentuximab-vedotin", "peripheral-t-cell-lymphoma", "allogeneic-hsct", "lymphoma-tx-transplant-role", "alk"], guideline: pdqGuideline },
    ],
    history: [
      { year: 1994, title: "The ALK fusion identified", note: "NPM1::ALK was found in anaplastic large cell lymphoma, which split the disease into two and made the ALK-positive form the one with the better outlook.", refs: ["alk"] },
      { year: 2011, title: "Brentuximab vedotin approved for relapsed disease", note: "The CD30 antibody-drug conjugate was approved for systemic anaplastic large cell lymphoma after failure of previous treatment, on high response rates in a small single-arm trial.", refs: ["brentuximab-vedotin"] },
      { year: 2022, title: "Five-year results of ECHELON-2", note: "In 452 patients with CD30-positive peripheral T-cell lymphoma, three-quarters of them with systemic anaplastic large cell lymphoma, five-year progression-free survival was 51.4 per cent with brentuximab vedotin and chemotherapy against 43.0 per cent with chemotherapy alone, and overall survival 70.1 against 61.0 per cent.", refs: ["echelon-2", "brentuximab-vedotin"] },
    ],
    openProblems: [
      "ECHELON-2 enrolled CD30-positive peripheral T-cell lymphoma and was weighted towards anaplastic large cell lymphoma, so the benefit in the other CD30-positive entities is extrapolated rather than demonstrated.",
      "Whether an ALK inhibitor should be added to first-line treatment, or substituted for part of it, has not been tested in a randomised trial.",
      "Most of the ALK-positive patients are young, and the late effects of anthracycline chemotherapy in a cured 30-year-old are measured in decades and are not recorded in the trials.",
    ],
    related: ["alk-negative-anaplastic-large-cell-lymphoma", "primary-cutaneous-anaplastic-large-cell-lymphoma", "breast-implant-associated-alcl", "peripheral-t-cell-lymphoma", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-classification-2022", "lymphoma-b-versus-t-cell", "lymphoma-pit-score", "ipi-score", "lymphoma-tx-regimen-alphabet", "lymphoma-tx-transplant-role"],
    targets: ["alk", "cd30"], technologies: ["histopathology-ihc", "fdg-pet", "adc"],
    drugs: ["brentuximab-vedotin"], trials: ["echelon-2"],
    links: [SRC.who5, SRC.icc, PAPER.echelon2, SRC.hmrn, SRC.pdq],
  }),

  // ------------------------------------------------------------------ ALK-NEGATIVE ALCL
  rec({
    id: "alk-negative-anaplastic-large-cell-lymphoma", parent: "peripheral-t-cell-lymphoma",
    name: "ALK-negative anaplastic large cell lymphoma",
    wikipedia: W("Anaplastic_large-cell_lymphoma"),
    aka: ["ALK-negative ALCL", "ALK- ALCL", "Anaplastic large cell lymphoma, ALK-negative", "ALK-negative ALCL (DUSP22, TP63 subsets)", "Systemic ALK-negative anaplastic large cell lymphoma"],
    tldr: "An aggressive T-cell lymphoma that looks like its ALK-positive sibling under the microscope and carries the same CD30 marker, but lacks the broken ALK gene. It affects older people and is cured less often, and several genetic changes inside it predict very different outcomes.",
    burden: "In the United Kingdom population series that reports lymphoma by subtype, 27 of 5,796 lymphomas were ALK-negative anaplastic large cell lymphoma, a European age-standardised rate of 0.08 per 100,000 a year, with a median age at diagnosis of 69.0 years, more than thirty years older than the ALK-positive form. Across all anaplastic large cell lymphomas in that series, five-year relative survival was 50.8 per cent; the published table's figure for the ALK-negative subgroup alone is internally inconsistent and is not quoted here.",
    summary: [
      "What it is. A lymphoma of T cells that looks anaplastic, carries uniform strong CD30 and has no ALK rearrangement. The definition is therefore partly negative, which is why WHO-HAEM5 describes it as a heterogeneous entity: it is what is left when ALK-positive disease, breast implant-associated disease and the skin lymphomas have been excluded.",
      "How it differs from its ALK-positive sibling. In age, and in outcome. ALK-positive disease affects people in their twenties and thirties; this affects people around 70. Both carry CD30, both are treated with the same first-line regimen, and ALK-positive disease is cured considerably more often. Where the appearance is identical, only the ALK stain tells them apart, which is why it is done on every anaplastic lymphoma.",
      "What is inside it, and what that is worth. Sequencing has found several genetic contexts within ALK-negative disease, and WHO-HAEM5 is careful about how much weight to put on them: it says there are not currently enough data to decide whether they are prognostic markers or genuine molecular subtypes. Rearrangement of TP63, loss of TP53 and overexpression of the interleukin-2 receptor alpha chain are each associated with worse outcomes. DUSP22 rearrangement was initially reported to carry a five-year survival as good as ALK-positive disease, and WHO-HAEM5 notes that more recent studies have not confirmed that association, which is the sort of reversal worth knowing about before a prognosis is given on the strength of it.",
      "Some of the genetics show in the appearance. Tumours with a DUSP22 rearrangement have cells with a doughnut-like shape and grow in sheets with less variation in size, and LEF1 staining may be a surrogate for the rearrangement. A group with a Hodgkin-like appearance shows aberrant ERBB4 protein, and the cells look more anaplastic where JAK2 is rearranged.",
      "How it is treated. The same as the other CD30-positive nodal T-cell lymphomas: brentuximab vedotin with cyclophosphamide, doxorubicin and prednisone, on the strength of ECHELON-2, and consolidation of a first remission with an autologous stem cell transplant in people fit for it, which is convention rather than demonstrated benefit. The detail is on the peripheral T-cell lymphoma page and in the treatment layer of this family.",
    ].join("\n\n"),
    subtypes: ["With DUSP22 rearrangement", "With TP63 rearrangement, which is associated with worse outcomes", "With JAK2 rearrangement", "Not otherwise characterised"],
    biomarkers: [
      "Uniform strong CD30 on every tumour cell",
      "Absence of ALK protein by immunohistochemistry, which is the defining negative",
      "DUSP22 rearrangement, whose prognostic meaning is disputed; WHO-HAEM5 records that the favourable association first reported has not been confirmed",
      "TP63 rearrangement, loss of TP53 and overexpression of the interleukin-2 receptor alpha chain, each associated with worse outcomes",
      "The Prognostic Index for T-cell lymphoma and the International Prognostic Index",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis", approach: "CD30 and ALK immunohistochemistry on the biopsy. The diagnosis is partly a negative one: uniform strong CD30 with an anaplastic appearance and no ALK, in a lymphoma that is not confined to the skin and is not associated with a breast implant. Those two exclusions matter because both of them are treated very differently. Testing for DUSP22 and TP63 rearrangements is done where it is available, with the caution that WHO-HAEM5 does not regard the resulting groups as established subtypes.", refs: ["histopathology-ihc", "cd30", "alk", "lymphoma-classification-2022", "fdg-pet"], guideline: whoGuideline },
      { setting: "First-line treatment", approach: "Brentuximab vedotin with cyclophosphamide, doxorubicin and prednisone, the same regimen as for ALK-positive disease and on the same trial: in ECHELON-2, five-year progression-free survival was 51.4 per cent against 43.0 with chemotherapy alone and overall survival 70.1 against 61.0. Consolidating a first remission with high-dose therapy and an autologous stem cell transplant is standard practice here, unlike in ALK-positive disease, and it rests on a single-arm study and registry comparisons rather than on a randomised trial; a patient is entitled to be told that. The regimens are on the peripheral T-cell lymphoma page.", refs: ["echelon-2", "brentuximab-vedotin", "cyclophosphamide", "doxorubicin", "prednisone", "autologous-stem-cell-transplant", "lymphoma-tx-transplant-role", "peripheral-t-cell-lymphoma"], guideline: { version: "ECHELON-2 five-year results (Annals of Oncology 2022); NCCN T-Cell Lymphomas; NCI PDQ", url: PAPER.echelon2.url } },
    ],
    history: [
      { year: 2008, title: "Separated from ALK-positive disease", note: "The fourth edition of the WHO classification made ALK-negative anaplastic large cell lymphoma a distinct entity rather than a variant, on the strength of its different biology and clinical course.", refs: ["alk"] },
      { year: 2014, title: "Genetic subgroups described", note: "Rearrangements of DUSP22 and TP63 were identified within ALK-negative disease and reported to carry very different outcomes, which raised the question of whether the entity should be split again." },
      { year: 2022, title: "The classification declines to split it, and records a reversal", note: "WHO-HAEM5 states that there are not yet enough data to decide whether the genetic contexts are prognostic markers or molecular subtypes, and that the favourable outcome first reported for DUSP22 rearrangement has not been confirmed by more recent studies.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "The entity is defined by what it is not, and WHO-HAEM5 says so. Whether its genetic subgroups are real subtypes or prognostic markers is unresolved.",
      "The prognostic meaning of DUSP22 rearrangement reversed between the first reports and the later ones, and treatment decisions have been made on the earlier version.",
      "Autologous transplant consolidation in first remission is standard practice here on the strength of registry comparisons and a single-arm study, and has never been tested against continuing observation.",
    ],
    related: ["alk-positive-anaplastic-large-cell-lymphoma", "primary-cutaneous-anaplastic-large-cell-lymphoma", "breast-implant-associated-alcl", "peripheral-t-cell-lymphoma", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-classification-2022", "lymphoma-pit-score", "ipi-score", "lymphoma-tx-regimen-alphabet", "lymphoma-tx-transplant-role", "lymphoma-b-versus-t-cell"],
    targets: ["cd30", "tp53"], technologies: ["histopathology-ihc", "fdg-pet", "adc", "autologous-stem-cell-transplant"],
    drugs: ["brentuximab-vedotin"], trials: ["echelon-2"],
    links: [SRC.who5, SRC.icc, PAPER.echelon2, SRC.hmrn, SRC.pdq],
  }),

  // ------------------------------------------------------------------ BIA-ALCL
  rec({
    id: "breast-implant-associated-alcl", parent: "peripheral-t-cell-lymphoma",
    name: "Breast implant-associated anaplastic large cell lymphoma",
    wikipedia: W("Anaplastic_large-cell_lymphoma"),
    aka: ["BIA-ALCL", "Breast implant-associated ALCL", "Breast implant-associated anaplastic large-cell lymphoma", "Implant-associated ALCL", "Breast implant lymphoma"],
    tldr: "A rare lymphoma that grows in the scar capsule the body forms around a breast implant, usually many years after the operation, and usually shows itself as sudden swelling of the breast from fluid around the implant. It is linked to textured implants, and when it is confined to the capsule it is usually cured by removing the implant and the capsule whole.",
    burden: "Rare in absolute terms, and strongly concentrated in women with textured implants. In the Dutch nationwide pathology registry, which identified every primary breast lymphoma between 1990 and 2016, 32 of 43 women with anaplastic large cell lymphoma of the breast had an implant on the same side, against 1 of 146 women with other primary breast lymphomas. The cumulative risk in women with implants was 29 per million at age 50 and 82 per million at 70, and the authors calculated that 6,920 women would need an implant to cause one case before the age of 75. A later meta-analysis across 525,475 patients with implants and 254 cases put the median time from implant to diagnosis at 13.16 years. The glossary entry written for the breast cancer pages carries the full set of figures.",
    summary: [
      "What it is. A T-cell lymphoma that arises in the fibrous capsule the body builds around a breast implant. In most women it stays inside that capsule and in the fluid between the capsule and the implant, and does not invade. WHO-HAEM5 describes it as an entity distinct from other ALK-negative anaplastic large cell lymphomas, usually non-invasive, arising in association with textured-surface implants, and associated with an excellent outcome, and adds that invasion of adjacent structures worsens the outlook.",
      "How it shows itself, and the one thing that must not be missed. The usual presentation is a late seroma: the reconstructed or augmented breast swells, often suddenly, more than a year after the operation and typically many years after it. The rule that follows is simple and is the single most useful sentence on this page. A late seroma around a breast implant is aspirated, and the fluid is sent for cytology and for CD30 immunohistochemistry, rather than simply drained. Less often the disease presents as a mass in the capsule or as contracture of the capsule, and those carry a worse outlook because the disease has left the fluid.",
      "How it differs from the lymphoma it is named after. It carries CD30 and lacks ALK, like systemic ALK-negative anaplastic large cell lymphoma, and it behaves nothing like it. The systemic disease is treated with combination chemotherapy and is cured in a minority; this one, confined to the capsule, is treated surgically and is cured in almost everybody.",
      "Why the implant matters. The cases are almost exclusively in women with textured implants. In the Dutch series, 23 of the 28 implants of known type in the lymphoma cases were macrotextured, 82 per cent, against 45 per cent of implants sold in the same country over the same years. The meta-analysis found the same risk whether the implant was placed for reconstruction after cancer or for cosmetic reasons. WHO-HAEM5 describes the biology as involving an allergic inflammatory response, escape from the immune system through amplification at 9p24.1 and overexpression of PD-L1 in more than half of cases, and constant activation of the JAK-STAT pathway through mutations of STAT3, STAT5B, JAK1 and JAK2 and loss-of-function mutations of SOCS1 and SOCS3.",
      "What the treatment is. Complete removal of the implant together with the whole capsule, intact where possible, and removal of any mass, which for disease confined to the capsule is usually the whole of the treatment. Disease that has spread beyond the capsule or formed a mass is staged and treated systemically, as a CD30-positive T-cell lymphoma. Women with implants and no symptoms are not advised to have them removed; the advice rests on recognising a late seroma and investigating it properly.",
    ].join("\n\n"),
    subtypes: ["Confined to the seroma and the capsule, the great majority of breast implant-associated ALCL, usually cured by complete removal", "With a mass or invasion beyond the capsule, which carries a worse outlook and needs systemic treatment"],
    biomarkers: [
      "CD30 on the large cells in the seroma fluid, which is how the diagnosis is made",
      "Absence of ALK, as in systemic ALK-negative anaplastic large cell lymphoma",
      "Whether the disease is confined to the capsule or has formed a mass or invaded, which is the main determinant of outcome",
      "The implant surface: cases are almost exclusively associated with textured implants",
      "Amplification at 9p24.1 with PD-L1 overexpression in more than half of cases, and activating mutations of STAT3, STAT5B, JAK1 and JAK2",
    ],
    standardOfCare: [
      { setting: "A late swelling around a breast implant", approach: "A seroma appearing around a breast implant more than a year after the operation is aspirated and the fluid sent for cytology and for CD30 immunohistochemistry, rather than simply drained. That single step is what makes the diagnosis, and draining without testing is how it is missed. The same applies to a new mass in the capsule or to capsular contracture appearing years after surgery. Imaging, usually ultrasound in the first instance, maps the fluid and any mass.", refs: ["histopathology-ihc", "cd30", "bia-alcl"], guideline: whoGuideline },
      { setting: "Disease confined to the capsule", approach: "Complete removal of the implant together with the whole capsule, intact where it can be done, and removal of any associated mass. For disease that has not left the capsule this is usually the whole of the treatment, and WHO-HAEM5 describes the entity as usually non-invasive and associated with an excellent outcome. Removal of an implant on the other side is discussed case by case. Women with implants and no symptoms are not advised to have them removed.", refs: ["bia-alcl", "histopathology-ihc"], guideline: pdqGuideline },
      { setting: "Disease that has formed a mass or spread", approach: "Staged and treated as a CD30-positive T-cell lymphoma, on the pathway used for systemic anaplastic large cell lymphoma, because WHO-HAEM5 records that invasion of adjacent structures worsens the outlook. Radiotherapy to the chest wall is used in some series for disease that cannot be removed completely. The evidence is case series; there are no trials and there will not be, because the great majority of patients are cured by surgery.", refs: ["alk-negative-anaplastic-large-cell-lymphoma", "brentuximab-vedotin", "lymphoma-tx-radiotherapy", "peripheral-t-cell-lymphoma"], guideline: pdqGuideline },
    ],
    history: [
      { year: 2016, title: "Recognised as a provisional entity", note: "The revised fourth edition of the WHO classification named breast implant-associated anaplastic large cell lymphoma as a provisional entity separate from systemic ALK-negative disease." },
      { year: 2018, title: "The size of the risk measured in a national registry", note: "The Dutch pathology registry found an implant on the same side in 32 of 43 women with breast anaplastic large cell lymphoma against 1 of 146 with other primary breast lymphomas, and put the cumulative risk in women with implants at 29 per million by age 50 and 82 per million by 70." },
      { year: 2022, title: "Confirmed as a distinct entity", note: "WHO-HAEM5 lists it as one of the three anaplastic large cell lymphomas, describes it as usually non-invasive and associated with an excellent outcome, and records that invasion of adjacent structures worsens the outlook.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "The absolute risk is small and the exposure is very common, so the right advice to a woman who already has textured implants and no symptoms is a question about communication rather than about oncology; current guidance is not to remove them.",
      "Why a textured surface and not a smooth one is not fully explained, and the proposed mechanisms, chronic inflammation and an allergic response to the surface, have not been shown to be the cause.",
      "Because the disease is almost always cured by surgery, there are no randomised trials and there will not be, so the management of the minority with invasive disease rests on case series.",
    ],
    related: ["alk-negative-anaplastic-large-cell-lymphoma", "alk-positive-anaplastic-large-cell-lymphoma", "peripheral-t-cell-lymphoma", "breast-cancer", "non-hodgkin-lymphoma"],
    terms: ["bia-alcl", "lymphoma-classification-2022", "lymphoma-nodal-versus-extranodal", "lymphoma-b-versus-t-cell"],
    targets: ["cd30"], technologies: ["histopathology-ihc"],
    links: [SRC.who5, SRC.icc, PAPER.biaJama, PAPER.biaMeta],
  }),

  // ------------------------------------------------------------------ PRIMARY CUTANEOUS ALCL
  rec({
    id: "primary-cutaneous-anaplastic-large-cell-lymphoma", parent: "cutaneous-t-cell-lymphoma",
    name: "Primary cutaneous anaplastic large cell lymphoma",
    wikipedia: W("Anaplastic_large-cell_lymphoma"),
    aka: ["Primary cutaneous ALCL", "pcALCL", "Primary cutaneous anaplastic large-cell lymphoma", "Cutaneous anaplastic large cell lymphoma", "Primary cutaneous CD30-positive T-cell lymphoproliferative disorder: primary cutaneous anaplastic large cell lymphoma"],
    tldr: "A cutaneous T-cell lymphoma that appears as one or a few red-purple nodules on the skin, often ulcerated, which may shrink on their own. Despite cells that look alarming under the microscope it stays in the skin in almost everybody and is treated with surgery or local radiotherapy rather than chemotherapy.",
    burden: "In the United Kingdom population series that reports lymphoma by subtype, the primary cutaneous CD30-positive lymphoproliferative disorders, which group this disease with lymphomatoid papulosis, accounted for 37 of 5,796 lymphomas, a European age-standardised rate of 0.13 per 100,000 a year and a median age at diagnosis of 52.9 years, with five-year relative survival of 88.3 per cent. The European, American and international consensus group that writes the treatment recommendations describes the CD30-positive skin lymphomas as the second commonest form of cutaneous T-cell lymphoma after mycosis fungoides.",
    summary: [
      "What it is. A lymphoma of CD30-positive T cells that arises in the skin and stays there. It usually appears as a single firm red or violet nodule or tumour, often several centimetres across and often breaking down into an ulcer, on a limb, the trunk, the head or the neck. Sometimes there are a few nodules in one area. Up to a quarter of lesions shrink partly or completely without any treatment, which is unusual for a lymphoma and is shared with its relative lymphomatoid papulosis.",
      "How it differs from the lymphoma it is named after. The cells look the same as those of systemic anaplastic large cell lymphoma and carry the same CD30, but the disease is a different thing: WHO-HAEM5 files it among the primary cutaneous T-cell lymphomas rather than with the systemic anaplastic lymphomas, explicitly acknowledging its relationship to the skin lymphomas and its highly favourable outcome in contrast to systemic ALK-negative disease. It does not carry ALK, and a skin tumour with the same appearance that does carry ALK is usually systemic disease that has reached the skin.",
      "How it sits beside lymphomatoid papulosis. The two are ends of one spectrum of CD30-positive skin disease: lymphomatoid papulosis is small papules that come and go in crops, and this is larger, more persistent nodules. The same person can have both, and the same clone can be found in both. The distinction is made on the clinical picture over time, not on the biopsy, which is why the dermatologist's photographs and history matter as much as the pathology.",
      "What the outcome is. In the Stanford series of 56 patients with CD30-positive skin disease, disease-specific survival for this lymphoma was 85 per cent at both five and ten years. Localised and generalised skin disease behaved differently in that series, at 91 and 50 per cent five-year disease-specific survival, although with so few patients the difference was not statistically significant. Lesions recurred in 42 per cent, which is the usual course and is not a failure; three patients progressed beyond the skin.",
      "How it is treated. Surgical excision or local radiotherapy for a single lesion or a few in one area, which is the great majority of patients. Low-dose methotrexate once a week for disease that keeps recurring in many places. Brentuximab vedotin for disease that is widespread or has spread beyond the skin: ALCANZA randomised patients with CD30-positive mycosis fungoides or primary cutaneous anaplastic large cell lymphoma to brentuximab vedotin or to the physician's choice of methotrexate or bexarotene, and the detail of that trial is on the cutaneous T-cell lymphoma page. Combination chemotherapy is reserved for disease outside the skin, because it produces short remissions and real harm in a disease that would otherwise be controlled for decades.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: [
      "CD30 on more than three-quarters of the large cells, which defines the group",
      "Absence of ALK; an ALK-positive skin tumour is usually systemic disease that has reached the skin",
      "Staging to confirm there is no disease outside the skin, which changes both the diagnosis and the treatment",
      "A clonal T-cell receptor rearrangement, which may be shared with coexisting lymphomatoid papulosis",
      "Whether the skin disease is localised or widespread, which the consensus recommendations use to choose treatment",
    ],
    standardOfCare: [
      { setting: "Confirming it is confined to the skin", approach: "The diagnosis cannot be made on the biopsy alone, because the cells look identical to those of systemic anaplastic large cell lymphoma. It requires staging that shows no disease outside the skin, and a clinical history: how long the lesion has been there, whether others have come and gone, and whether the person has lymphomatoid papulosis or mycosis fungoides, which coexist with it. An ALK-positive skin tumour is usually systemic disease that has reached the skin, and is staged and treated as such.", refs: ["histopathology-ihc", "cd30", "fdg-pet", "lymphomatoid-papulosis", "lugano-classification"], guideline: whoGuideline },
      { setting: "A single lesion or a few in one area, which is most patients", approach: "Surgical excision or local radiotherapy. Both work; the choice is made on the site, the size and what will heal well. Lesions recur in a substantial proportion of patients, 42 per cent in the Stanford series, and recurrence in the skin is expected rather than a treatment failure: it is treated the same way again. Up to a quarter of lesions regress partly or completely without any treatment, so observing a lesion that is already shrinking is reasonable.", refs: ["palliative-radiotherapy", "lymphoma-tx-skin-directed-therapy", "lymphoma-tx-radiotherapy"], guideline: { version: "EORTC, ISCL and USCLC consensus recommendations for primary cutaneous CD30-positive lymphoproliferative disorders (Blood 2011)", url: PAPER.cd30Consensus.url } },
      { setting: "Widespread skin disease, or disease beyond the skin", approach: "Low-dose weekly methotrexate for disease that keeps recurring in many places. Brentuximab vedotin for widespread or extracutaneous disease: ALCANZA randomised patients with CD30-positive mycosis fungoides or primary cutaneous anaplastic large cell lymphoma to brentuximab vedotin against the physician's choice of methotrexate or bexarotene, and the figures are on the cutaneous T-cell lymphoma page. Combination chemotherapy is reserved for disease outside the skin: it produces short remissions and real harm in a disease otherwise controlled for decades, and over-treatment is the commonest avoidable harm here.", refs: ["methotrexate", "brentuximab-vedotin", "alcanza", "cutaneous-t-cell-lymphoma", "lymphoma-tx-skin-directed-therapy"], guideline: { version: "EORTC, ISCL and USCLC consensus recommendations (Blood 2011); NCCN Primary Cutaneous Lymphomas", url: PAPER.cd30Consensus.url } },
    ],
    history: [
      { year: 2003, title: "The Stanford series", note: "Fifty-six patients with CD30-positive skin lymphoproliferative disorders: disease-specific survival for primary cutaneous anaplastic large cell lymphoma was 85 per cent at five and ten years, lesions recurred in 42 per cent, and three patients progressed beyond the skin." },
      { year: 2011, title: "International consensus recommendations", note: "A panel from the EORTC, the International Society for Cutaneous Lymphomas and the United States Cutaneous Lymphoma Consortium set out treatment recommendations for the CD30-positive skin lymphoproliferative disorders and noted that most published evidence is small retrospective series.", refs: ["brentuximab-vedotin"] },
      { year: 2022, title: "Filed with the skin lymphomas, not the systemic ones", note: "WHO-HAEM5 groups primary cutaneous anaplastic large cell lymphoma under the primary cutaneous T-cell lymphomas, acknowledging its relationship to them and its favourable outcome in contrast to systemic ALK-negative disease.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "The consensus recommendations that govern treatment state that most of the evidence behind them is small retrospective series and case reports, and that very few prospective or multicentre studies exist.",
      "The line between this disease and lymphomatoid papulosis is drawn on the clinical course rather than on the biopsy, and in a person who has both there is no test that settles which lesion is which.",
      "Over-treatment is the commonest harm: combination chemotherapy for skin-limited disease produces short remissions in a condition that is otherwise controlled for decades.",
    ],
    related: ["lymphomatoid-papulosis", "cutaneous-t-cell-lymphoma", "mycosis-fungoides", "alk-negative-anaplastic-large-cell-lymphoma", "sezary-syndrome"],
    terms: ["lymphoma-classification-2022", "lymphoma-tx-skin-directed-therapy", "lymphoma-tx-radiotherapy", "lymphoma-nodal-versus-extranodal", "lymphoma-indolent-versus-aggressive"],
    targets: ["cd30"], technologies: ["histopathology-ihc", "palliative-radiotherapy"],
    drugs: ["brentuximab-vedotin", "methotrexate"], trials: ["alcanza"],
    links: [SRC.who5, SRC.icc, PAPER.cd30Consensus, PAPER.stanford, SRC.hmrn],
  }),

  // ------------------------------------------------------------------ LYMPHOMATOID PAPULOSIS
  rec({
    id: "lymphomatoid-papulosis", parent: "cutaneous-t-cell-lymphoma",
    name: "Lymphomatoid papulosis",
    wikipedia: W("Lymphomatoid_papulosis"),
    aka: ["LyP", "Primary cutaneous CD30-positive T-cell lymphoproliferative disorder: lymphomatoid papulosis", "Lymphomatoid papulosis type A", "Mucha-Habermann disease"],
    tldr: "A skin condition that keeps producing crops of small red bumps which ulcerate, crust and heal on their own over a few weeks, leaving small scars, and then come back. The biopsy looks like an aggressive lymphoma and the disease behaves nothing like one: nobody in the published series has died of it, but it carries a raised risk of a second lymphoma.",
    burden: "In the United Kingdom population series that reports lymphoma by subtype, the primary cutaneous CD30-positive lymphoproliferative disorders, which group this condition with primary cutaneous anaplastic large cell lymphoma, accounted for 37 of 5,796 lymphomas, a European age-standardised rate of 0.13 per 100,000 a year, a median age at diagnosis of 52.9 years and five-year relative survival of 88.3 per cent. In the Stanford series of 56 patients with CD30-positive skin disease, no patient with lymphomatoid papulosis died of the disease and overall survival was 92 per cent at five and ten years.",
    summary: [
      "What it is. A chronic, relapsing condition of the skin in which crops of papules and small nodules appear, sometimes dozens at a time, go through a cycle of ulceration and crusting over three to twelve weeks, and heal on their own, often leaving a small scar. New crops follow. It can go on for years or decades, and it can stop.",
      "The gap between the biopsy and the person. Under the microscope the lesions contain large, atypical CD30-positive cells that look like those of an aggressive lymphoma, and a pathologist who is given the slide without the history can reasonably report anaplastic large cell lymphoma. The diagnosis is made by putting the two together: lesions that come and go in crops and heal spontaneously, with that biopsy, are lymphomatoid papulosis. This is the clearest example in the lymphoma family of a diagnosis that cannot be made on the biopsy alone, and WHO-HAEM5 says as much of the skin lymphomas generally, that dermatological examination and clinical photographs are indispensable.",
      "Where it sits in the classification. WHO-HAEM5 lists it among the primary cutaneous T-cell lymphomas as one of the two primary cutaneous CD30-positive T-cell lymphoproliferative disorders, the other being primary cutaneous anaplastic large cell lymphoma. The two are ends of one spectrum: the same person may have both, and the same T-cell clone can be found in both. Several histological types of lymphomatoid papulosis are described, named by letters, and they do not change the treatment or the outlook.",
      "The risk that justifies follow-up. People with lymphomatoid papulosis have a raised risk of developing a second lymphoma, most often mycosis fungoides, primary cutaneous anaplastic large cell lymphoma or Hodgkin lymphoma, which may come before, with or after the skin lesions. That is the reason for continuing dermatological follow-up in a condition that is otherwise harmless, and it is the reason a new lump that behaves differently from the usual crops is biopsied.",
      "How it is treated, which is often not at all. No treatment has been shown to prevent the second lymphoma or to change the course, so the aim is to control the lesions that bother the person. Observation with emollients and reassurance is a legitimate plan for somebody with a few lesions. Low-dose weekly methotrexate, phototherapy and potent topical steroids are used where the crops are frequent, numerous or scarring. Treatment suppresses the lesions and they return when it stops. Combination chemotherapy has no place.",
    ].join("\n\n"),
    subtypes: ["Type A, the commonest, with scattered large CD30-positive cells in a mixed inflammatory background", "Type B, which resembles mycosis fungoides down the microscope", "Type C, which resembles anaplastic large cell lymphoma", "Other described types, which do not change the treatment or the outlook"],
    biomarkers: [
      "CD30-positive large atypical cells on the biopsy, which on their own would suggest an aggressive lymphoma",
      "The clinical course, which is the diagnosis: crops of lesions that ulcerate and heal on their own over weeks",
      "A clonal T-cell receptor rearrangement in many cases, which does not make it a cancer in the way it would elsewhere",
      "Absence of ALK",
      "Continuing surveillance for a second lymphoma, most often mycosis fungoides, primary cutaneous anaplastic large cell lymphoma or Hodgkin lymphoma",
    ],
    standardOfCare: [
      { setting: "Making the diagnosis, which needs the history as much as the biopsy", approach: "The biopsy shows large atypical CD30-positive cells that on their own would suggest an aggressive lymphoma. What makes the diagnosis is the course: crops of papules that ulcerate, crust and heal on their own over three to twelve weeks, often leaving small scars, recurring over years. Photographs and a dated history are part of the diagnostic record, not an extra. Staging confirms there is no disease outside the skin.", refs: ["histopathology-ihc", "cd30", "lymphoma-tx-skin-directed-therapy", "fdg-pet"], guideline: whoGuideline },
      { setting: "Treatment, which is often none", approach: "No treatment has been shown to change the course or to reduce the risk of a second lymphoma, so treatment is for the lesions that bother the person. Observation with emollients and an explanation is a legitimate plan for somebody with a few lesions, and in the published series nobody has died of this condition. Where crops are frequent, numerous or scarring, low-dose weekly methotrexate, phototherapy or potent topical steroids suppress them, and the lesions return when treatment stops. Combination chemotherapy has no place.", refs: ["methotrexate", "lymphoma-tx-skin-directed-therapy", "lymphoma-tx-watch-and-wait"], guideline: { version: "EORTC, ISCL and USCLC consensus recommendations for primary cutaneous CD30-positive lymphoproliferative disorders (Blood 2011)", url: PAPER.cd30Consensus.url } },
      { setting: "Why follow-up continues in a condition that does not shorten life", approach: "People with lymphomatoid papulosis have a raised risk of a second lymphoma, most often mycosis fungoides, primary cutaneous anaplastic large cell lymphoma or Hodgkin lymphoma, which may come before, alongside or after the skin lesions. Continuing dermatological review, and biopsy of any lump that behaves differently from the usual crops, is the reason for follow-up. Nothing prevents the second lymphoma, so the aim is to find it early.", refs: ["mycosis-fungoides", "primary-cutaneous-anaplastic-large-cell-lymphoma", "hodgkin-lymphoma", "histopathology-ihc"], guideline: pdqGuideline },
    ],
    history: [
      { year: 1968, title: "Named", note: "Macaulay described a self-healing eruption whose biopsy looked malignant and whose course did not, and called it lymphomatoid papulosis." },
      { year: 2003, title: "No deaths from the disease in a single-centre series", note: "In the Stanford series of CD30-positive skin lymphoproliferative disorders, no patient with lymphomatoid papulosis died of the disease, and overall survival was 92 per cent at five and ten years." },
      { year: 2011, title: "International consensus recommendations", note: "The EORTC, International Society for Cutaneous Lymphomas and United States Cutaneous Lymphoma Consortium panel set out definitions, endpoints and treatment recommendations, and recorded that the level of evidence for most treatments is low." },
    ],
    openProblems: [
      "No treatment has been shown to reduce the risk of a second lymphoma, so treatment is for symptoms only and over-treatment is a real harm in a condition that does not shorten life.",
      "There is no way to predict which patient will develop a second lymphoma, so everybody is followed up indefinitely.",
      "The consensus recommendations state that the evidence behind nearly every treatment is retrospective and small.",
    ],
    related: ["primary-cutaneous-anaplastic-large-cell-lymphoma", "cutaneous-t-cell-lymphoma", "mycosis-fungoides", "hodgkin-lymphoma", "sezary-syndrome"],
    terms: ["lymphoma-classification-2022", "lymphoma-tx-skin-directed-therapy", "lymphoma-indolent-versus-aggressive", "lymphoma-nodal-versus-extranodal"],
    targets: ["cd30"], technologies: ["histopathology-ihc"],
    drugs: ["methotrexate"],
    links: [SRC.who5, SRC.icc, PAPER.cd30Consensus, PAPER.stanford, SRC.hmrn],
  }),

  // ------------------------------------------------------------------ MYCOSIS FUNGOIDES
  rec({
    id: "mycosis-fungoides", parent: "cutaneous-t-cell-lymphoma",
    name: "Mycosis fungoides",
    wikipedia: W("Mycosis_fungoides"),
    aka: ["MF", "Mycosis fungoides / Sezary syndrome (CTCL)", "Alibert-Bazin syndrome", "Granuloma fungoides", "Folliculotropic mycosis fungoides", "Pagetoid reticulosis", "Granulomatous slack skin"],
    tldr: "The commonest cutaneous T-cell lymphoma, and a disease that behaves like a long-term skin condition for most of the people who have it: flat scaly patches that have often been treated as eczema or psoriasis for years before anyone takes a biopsy. In its early stages life expectancy is close to normal, and the treatment is creams and light rather than chemotherapy.",
    burden: "In the United Kingdom population series that reports lymphoma by subtype, 39 of 5,796 lymphomas were mycosis fungoides, a European age-standardised rate of 0.12 per 100,000 a year, with men affected about 2.7 times as often as women and a median age at diagnosis of 65.8 years; five-year relative survival in that series was 86.6 per cent. In the international cohort of 1,502 people with mycosis fungoides or Sezary syndrome that validated the current staging system, the mean age at diagnosis was 54 years, 71 per cent presented with early-stage disease, the disease progressed in 34 per cent and 26 per cent died of it.",
    summary: [
      "What it is. A lymphoma of mature T cells that lives in the skin. It begins as flat, scaly, often itchy patches, classically on parts of the body the sun does not reach, and over years some people develop raised plaques and then tumours. A minority develop redness over most of the body, and a minority have lymphoma cells in the blood, at which point it overlaps with Sezary syndrome. It is the commonest of the cutaneous T-cell lymphomas.",
      "The diagnosis is slow and that is normal. Early mycosis fungoides looks like eczema, psoriasis or a drug rash, and the biopsy is often not diagnostic until the disease is established. Several biopsies over several years, read by a dermatopathologist alongside photographs and the history, are the usual route to the diagnosis, and that is not a failure of care. WHO-HAEM5 states the principle for the whole group of skin lymphomas: because the appearances overlap, dermatological examination and clinical photographic documentation are indispensable.",
      "How it is staged, and why the stage matters more than usual. The system in use is the revised ISCL and EORTC staging of 2007, which classifies the skin (patches or plaques covering under or over a tenth of the body surface, tumours, or redness over most of the body), the lymph nodes, the internal organs and the blood. The validation study in 1,502 patients confirmed that the resulting stages separate survival, and found something the earlier system had missed: among people with early skin disease, those with patches alone did significantly better than those with patches and plaques, which is why the stage now records the difference.",
      "The things that predict the course. In that study, advanced skin stage, the presence of the tumour clone in the blood without full-blown Sezary cells, a raised lactate dehydrogenase and the folliculotropic form were each independently associated with worse survival. In the other direction, the pale form, the mottled form and mycosis fungoides occurring with lymphomatoid papulosis were associated with better survival and less risk of progression. Large-cell transformation, where the cells in a lesion become large and more aggressive, is a specific event that changes the treatment.",
      "The variants. WHO-HAEM5 keeps the variants of mycosis fungoides as subtypes and makes one change: within the folliculotropic form, which involves the hair follicles and is harder to treat because creams and light do not reach deeply enough, early and advanced clinical patterns are now distinguished because they behave differently.",
      "What it means for a person. Early-stage mycosis fungoides, which is most of it, has a life expectancy close to that of the general population and is treated with creams, light and occasionally small doses of radiotherapy, over decades. Treating early disease with chemotherapy shortens neither the disease nor anything else and causes harm. Advanced disease, meaning tumours, widespread redness, or involvement of the nodes, organs or blood, needs systemic treatment and is a different situation: in a cohort of 168 people with advanced mycosis fungoides or Sezary syndrome, median survival was 2.47 years, and those started on biological treatments rather than combination chemotherapy lived longer. The treatment rows for every stage are on the cutaneous T-cell lymphoma page, which is the hub this record sits under.",
    ].join("\n\n"),
    subtypes: [
      "Classic mycosis fungoides, with patches, plaques and sometimes tumours",
      "Folliculotropic mycosis fungoides, which involves the hair follicles; WHO-HAEM5 distinguishes early from advanced clinical patterns within it",
      "Pagetoid reticulosis, a localised form",
      "Granulomatous slack skin",
      "Hypopigmented, poikilodermatous and other clinical variants, several of which carry a better outlook",
      "Large-cell transformation, which is an event rather than a variant and changes the treatment",
    ],
    biomarkers: [
      "The revised ISCL and EORTC stage of 2007, covering skin, nodes, viscera and blood",
      "Patches alone against patches and plaques within early skin stage, which separates survival",
      "The folliculotropic variant, independently associated with worse survival",
      "The tumour clone detectable in the blood without Sezary cells, which is independently associated with worse survival",
      "Lactate dehydrogenase",
      "Large-cell transformation on a repeat biopsy of a changing lesion",
      "CD30 expression, which decides whether brentuximab vedotin is an option",
    ],
    history: [
      { year: 1806, title: "Described by Alibert", note: "Jean-Louis Alibert described the mushroom-like tumours that gave the disease its misleading name; it has nothing to do with fungal infection." },
      { year: 2007, title: "The ISCL and EORTC staging revision", note: "The staging system was revised to classify skin, node, visceral and blood involvement separately, which remains the basis of treatment choice and trial eligibility.", refs: ["paper-olsen-mycosis-fungoides-staging-blood-2007"] },
      { year: 2010, title: "The staging validated in 1,502 patients", note: "The revised stages were shown to separate survival, and patients with patches alone were shown to do significantly better than those with patches and plaques within the same early stage." },
      { year: 2022, title: "The folliculotropic form split by clinical pattern", note: "WHO-HAEM5 kept the variants of mycosis fungoides as subtypes and distinguished early from advanced clinical patterns within the folliculotropic category, because their outcomes differ.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "Nothing has been shown to change the natural history of early-stage mycosis fungoides, so every treatment given in early disease is for symptoms, and over-treatment is the commonest harm.",
      "The time from first rash to diagnosis is measured in years, and no test identifies early mycosis fungoides reliably on a single biopsy.",
      "Itch is the symptom people with this disease rank as the worst and there is no randomised trial of any treatment for it in mycosis fungoides.",
      "Allogeneic transplant is the only treatment that produces long remissions in advanced disease, and no trial defines who should have it or when.",
    ],
    related: ["cutaneous-t-cell-lymphoma", "sezary-syndrome", "primary-cutaneous-anaplastic-large-cell-lymphoma", "lymphomatoid-papulosis", "peripheral-t-cell-lymphoma"],
    terms: ["lymphoma-tx-skin-directed-therapy", "lymphoma-indolent-versus-aggressive", "lymphoma-classification-2022", "lymphoma-nodal-versus-extranodal", "lymphoma-tx-radiotherapy", "lymphoma-transformation"],
    targets: ["cd30"], technologies: ["histopathology-ihc", "total-skin-electron-therapy", "palliative-radiotherapy"],
    drugs: ["mechlorethamine", "bexarotene", "mogamulizumab", "brentuximab-vedotin", "methotrexate", "interferon-alfa"],
    trials: ["alcanza", "mavoric"],
    keyPapers: ["paper-olsen-mycosis-fungoides-staging-blood-2007"],
    links: [SRC.who5, SRC.icc, PAPER.agar, PAPER.mfAdvanced, SRC.hmrn, SRC.pdq],
  }),

  // ------------------------------------------------------------------ EATL
  rec({
    id: "enteropathy-associated-t-cell-lymphoma", parent: "peripheral-t-cell-lymphoma",
    name: "Enteropathy-associated T-cell lymphoma",
    wikipedia: W("Enteropathy-associated_T-cell_lymphoma"),
    aka: ["EATL", "Enteropathy-type T-cell lymphoma", "Enteropathy-associated and hepatosplenic T-cell lymphoma", "Coeliac-associated T-cell lymphoma", "Type I EATL"],
    tldr: "An aggressive T-cell lymphoma of the small bowel that arises out of coeliac disease, usually in somebody whose coeliac disease was diagnosed late or has not responded to a gluten-free diet. It often announces itself as a perforation or obstruction of the bowel in a person who is already underweight, which is why treatment has to deal with nutrition at the same time as the lymphoma.",
    burden: "Rare. In the population-based series from the Scotland and Newcastle Lymphoma Group, the overall incidence was 0.14 cases per 100,000 people a year, and 54 patients were identified over a five-year period. In the United Kingdom population series that reports lymphoma by subtype, 24 of 5,796 lymphomas were of the enteropathy type, a European age-standardised rate of 0.08 per 100,000 a year, a median age at diagnosis of 62.7 years and five-year relative survival of 28.0 per cent.",
    summary: [
      "What it is. A lymphoma of the T cells that live between the cells lining the small bowel. It arises in people with coeliac disease, the immune reaction to gluten, and particularly in those whose disease was diagnosed in adulthood or whose symptoms have not settled on a gluten-free diet. It is the reason coeliac disease that stops responding to the diet is investigated rather than managed.",
      "How it presents, and why that shapes the treatment. WHO-HAEM5 tabulates the presentation: abdominal symptoms, with perforation or obstruction of the bowel common, deep involvement of the bowel wall, and a tumour made of pleomorphic large or medium cells against a prominent inflammatory background. A substantial proportion of patients come to attention as a surgical emergency. They are usually malnourished before the lymphoma starts, because the coeliac disease has been damaging the bowel, and chemotherapy in a malnourished person with a bowel at risk of perforating is a different proposition from chemotherapy in a well person. Nutritional support, often intravenous, and surgical involvement are part of the treatment and not an afterthought.",
      "How it differs from the lymphoma it is most often confused with. Monomorphic epitheliotropic intestinal T-cell lymphoma arises in the same part of the gut and presents in the same way, and it is not associated with coeliac disease. Under the microscope it is monotonous where this one is pleomorphic, its cells are usually CD8-positive where these are usually negative for both CD4 and CD8, and it carries SETD2 mutations which this does not. It was called type II enteropathy-associated T-cell lymphoma until 2016 and has had its own name and its own page since.",
      "What treatment achieves. The Newcastle group reported both halves of the picture from one population. Treated with conventional anthracycline-based chemotherapy, with or without surgery, median progression-free survival was 3.4 months and median overall survival 7.1 months. From 1998 the same group gave patients fit enough for it a regimen of ifosfamide, etoposide and epirubicin alternating with methotrexate, followed by an autologous stem cell transplant; in 26 patients treated that way, five-year progression-free survival was 52 per cent and overall survival 60 per cent, significantly better than the historical comparison. That is a before-and-after comparison within one region rather than a randomised trial, and it is the best evidence this disease has.",
      "What should also happen. A strict gluten-free diet is continued, both for the bowel and because the rest of the family may need testing for coeliac disease. Refractory coeliac disease of the type with an abnormal clone of lymphocytes is the precursor state, and the International Consensus Classification lists it as a provisional entity of its own, which WHO-HAEM5 does not.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: [
      "Coeliac disease, established or newly discovered at the time of the lymphoma, which is part of the definition",
      "A T-cell phenotype that is most often negative for both CD4 and CD8, with CD30 often positive",
      "Pleomorphic large or medium-sized cells against a prominent inflammatory background, which separates it from the monomorphic intestinal lymphoma",
      "Gains of 9q34 and loss of 16q12, with mutations of the JAK-STAT pathway, commonly JAK1 and STAT3",
      "Absence of Epstein-Barr virus",
      "Nutritional state, which determines what treatment is possible",
    ],
    standardOfCare: [
      { setting: "Diagnosis, and the coeliac disease behind it", approach: "The diagnosis is often made on bowel resected as an emergency for perforation or obstruction. Where there is time, it is made at endoscopy with biopsies of the small bowel. Coeliac disease is confirmed or newly diagnosed at the same time, and the rest of the family is offered testing. Staging uses the gastrointestinal system that counts depth and node involvement, and imaging of the whole abdomen matters because disease is often multifocal.", refs: ["endoscopy", "histopathology-ihc", "lymphoma-lugano-gastrointestinal", "fdg-pet"], guideline: whoGuideline },
      { setting: "Nutrition and the surgical risk, which come first", approach: "Most patients are malnourished before the lymphoma starts, because the coeliac disease has been damaging the bowel, and the bowel is at risk of perforating during treatment. Nutritional assessment and support, often intravenous, and early involvement of a surgeon are part of the treatment rather than an afterthought, and they determine what chemotherapy is possible. A strict gluten-free diet is continued throughout.", refs: ["lymphoma-tx-regimen-alphabet", "peripheral-t-cell-lymphoma"], guideline: pdqGuideline },
      { setting: "Systemic treatment", approach: "In the population-based series from northern England and Scotland, conventional anthracycline-based chemotherapy with or without surgery gave a median progression-free survival of 3.4 months and overall survival of 7.1 months in 54 patients. From 1998 the same group gave patients fit enough for it ifosfamide, etoposide and epirubicin alternating with methotrexate, followed by an autologous stem cell transplant; in 26 patients treated that way, five-year progression-free survival was 52 per cent and overall survival 60 per cent. That is a comparison against a historical group from the same region rather than a randomised trial, and it is the best evidence this disease has. A clinical trial is a reasonable first choice.", refs: ["ifosfamide", "etoposide", "methotrexate", "autologous-stem-cell-transplant", "lymphoma-tx-transplant-role", "lymphoma-tx-regimen-alphabet"], guideline: { version: "Scotland and Newcastle Lymphoma Group, Blood 2010; NCCN T-Cell Lymphomas; NCI PDQ", url: PAPER.newcastle.url } },
    ],
    history: [
      { year: 2010, title: "A population picture and a regimen that improved it", note: "Among 54 patients identified in northern England and Scotland, incidence was 0.14 per 100,000 a year and conventional chemotherapy gave a median progression-free survival of 3.4 months and overall survival of 7.1 months; 26 patients given ifosfamide, etoposide and epirubicin with methotrexate followed by autologous transplant had five-year progression-free survival of 52 per cent and overall survival of 60 per cent.", refs: ["autologous-stem-cell-transplant", "ifosfamide", "etoposide", "methotrexate"] },
      { year: 2016, title: "Split in two", note: "The revised fourth edition of the WHO classification separated the type that is not associated with coeliac disease and gave it its own name, monomorphic epitheliotropic intestinal T-cell lymphoma." },
      { year: 2022, title: "The precursor state recognised by one classification", note: "The International Consensus Classification lists type II refractory coeliac disease as a provisional entity; WHO-HAEM5 does not list it separately.", refs: ["lymphoma-classification-2022"] },
    ],
    openProblems: [
      "No randomised trial has been run in this disease. The regimen with the best results was compared against a historical group from the same region.",
      "Many patients present as a surgical emergency in a malnourished state, so a substantial proportion are never well enough to receive the treatment that works best.",
      "Whether earlier diagnosis of coeliac disease and better adherence to a gluten-free diet prevent this lymphoma has not been shown, although it is the usual assumption.",
    ],
    related: ["monomorphic-epitheliotropic-intestinal-t-cell-lymphoma", "peripheral-t-cell-lymphoma", "hepatosplenic-t-cell-lymphoma", "small-bowel", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-nodal-versus-extranodal", "lymphoma-classification-2022", "lymphoma-pit-score", "lymphoma-tx-transplant-role", "lymphoma-lugano-gastrointestinal"],
    technologies: ["histopathology-ihc", "fdg-pet", "autologous-stem-cell-transplant"],
    drugs: ["ifosfamide", "etoposide", "methotrexate"],
    links: [SRC.who5, SRC.icc, PAPER.newcastle, SRC.hmrn, SRC.pdq],
  }),

  // ------------------------------------------------------------------ MEITL
  rec({
    id: "monomorphic-epitheliotropic-intestinal-t-cell-lymphoma", parent: "peripheral-t-cell-lymphoma",
    name: "Monomorphic epitheliotropic intestinal T-cell lymphoma",
    wikipedia: W("Enteropathy-associated_T-cell_lymphoma"),
    aka: ["MEITL", "Type II enteropathy-associated T-cell lymphoma", "Type II EATL", "Monomorphic CD56-positive intestinal T-cell lymphoma"],
    tldr: "An aggressive T-cell lymphoma of the small bowel that looks and presents much like the lymphoma that complicates coeliac disease but has no connection with coeliac disease at all. It was separated out of that diagnosis in 2016, it is made of monotonous small to medium cells, and it often presents with perforation or obstruction of the bowel.",
    burden: "Rare, and not reported separately in the United Kingdom population series, which predates the 2016 separation and counts it with enteropathy-associated T-cell lymphoma under the heading enteropathy type. The largest published real-world cohort assembled 56 patients diagnosed between 2002 and 2025 across several centres, and reports the median overall survival described in the literature as 7 to 15 months. The corpus does not quote a geographic distribution for it, because it could not verify one.",
    summary: [
      "What it is. A lymphoma of the T cells between the cells lining the small bowel, like enteropathy-associated T-cell lymphoma, and otherwise a different disease. The name describes it: monomorphic, because the cells are monotonous small to medium-sized cells rather than the varied large ones of its neighbour; epitheliotropic, because the cells invade the lining itself; intestinal, because that is where it lives.",
      "How it differs from the lymphoma it was carved out of. WHO-HAEM5 sets the differences out side by side. There is no association with coeliac disease. The cells are usually CD8-positive rather than negative for both CD4 and CD8. Necrosis is usually absent where it may be present in the other. The mutations differ: both carry gains of 9q34 and loss of 16q12, but this one carries mutations of SETD2 and of JAK3 and STAT5B, while the other carries JAK1 and STAT3. Neither carries Epstein-Barr virus, which separates both from extranodal NK/T-cell lymphoma when that disease involves the gut.",
      "How it presents. As abdominal pain, weight loss and often perforation or obstruction of the small bowel, deep in the bowel wall. Patients commonly come to attention through emergency surgery, and the diagnosis is made on the resected bowel.",
      "What is known about treating it. Less than for its neighbour. The largest real-world cohort compared a modified version of the Newcastle regimen developed for enteropathy-associated T-cell lymphoma, giving cyclophosphamide, doxorubicin, vincristine and prednisone alternating with ifosfamide, etoposide and epirubicin but leaving out the methotrexate, against ordinary CHOP-based chemotherapy, in 50 patients who received systemic treatment. Median progression-free survival was 14.4 months against 6.6 and median overall survival 28.7 against 11.7 months, and the regimen remained an independent predictor of better progression-free survival after adjustment. The same study measured what the omitted methotrexate was meant to prevent: the two-year cumulative incidence of relapse in the central nervous system was 12.1 per cent. It is a retrospective comparison, not a trial.",
      "What a reader should take from this. This is a disease that was given its own name nine years ago, has no randomised evidence at all, and whose best available treatment comparison is a retrospective cohort of 50 treated patients. Entry into a trial is a reasonable first choice rather than a last resort, and the pages in this family say so where it is true.",
    ].join("\n\n"),
    subtypes: [],
    biomarkers: [
      "Monotonous small to medium-sized cells invading the lining of the bowel, which is the name and the diagnosis",
      "A CD8-positive, CD56-positive phenotype in most cases",
      "SETD2 mutation, and mutations of JAK3 and STAT5B, which separate it from enteropathy-associated T-cell lymphoma",
      "Gains of 9q34 and loss of 16q12, shared with enteropathy-associated T-cell lymphoma",
      "Absence of coeliac disease, which is the main clinical difference",
      "Absence of Epstein-Barr virus, which separates it from NK/T-cell lymphoma of the gut",
    ],
    standardOfCare: [
      { setting: "Diagnosis, and telling it from its neighbour", approach: "Often made on small bowel resected as an emergency for perforation or obstruction. What separates it from enteropathy-associated T-cell lymphoma is the absence of coeliac disease, the monotonous small to medium cells rather than varied large ones, a CD8-positive and CD56-positive phenotype, and SETD2 mutation with JAK3 and STAT5B rather than JAK1 and STAT3. Neither carries Epstein-Barr virus, which separates both from NK/T-cell lymphoma of the gut.", refs: ["histopathology-ihc", "enteropathy-associated-t-cell-lymphoma", "ebv-term", "lymphoma-lugano-gastrointestinal"], guideline: whoGuideline },
      { setting: "Systemic treatment, and how thin the evidence is", approach: "There is no randomised evidence of any kind. The largest real-world comparison took 50 patients who received systemic chemotherapy and compared a modified version of the Newcastle regimen developed for enteropathy-associated T-cell lymphoma, giving cyclophosphamide, doxorubicin, vincristine and prednisone alternating with ifosfamide, etoposide and epirubicin but leaving out the methotrexate, against ordinary chemotherapy of the same backbone: median progression-free survival 14.4 against 6.6 months and overall survival 28.7 against 11.7 months, with the regimen remaining an independent predictor of better progression-free survival after adjustment. The two-year cumulative incidence of relapse in the central nervous system was 12.1 per cent, which is what the omitted methotrexate had been intended to prevent. Entry into a trial is a reasonable first choice rather than a last resort.", refs: ["cyclophosphamide", "doxorubicin", "vincristine", "prednisone", "ifosfamide", "etoposide", "methotrexate", "lymphoma-tx-cns-prophylaxis", "lymphoma-tx-regimen-alphabet"], guideline: { version: "Real-world cohort of 56 patients (EJHaem 2026); NCCN T-Cell Lymphomas; NCI PDQ", url: PAPER.meitl.url } },
    ],
    history: [
      { year: 2016, title: "Given its own name", note: "The revised fourth edition of the WHO classification separated what had been called type II enteropathy-associated T-cell lymphoma and named it monomorphic epitheliotropic intestinal T-cell lymphoma, because it has no association with coeliac disease and differs in appearance and genetics." },
      { year: 2022, title: "Kept as an entity, with its differences tabulated", note: "WHO-HAEM5 retained the entity and set out the features that separate the five T-cell and NK-cell conditions of the gut from each other, including the mutations that differ between this and enteropathy-associated T-cell lymphoma.", refs: ["lymphoma-classification-2022"] },
      { year: 2026, title: "A real-world comparison of two regimens", note: "In 50 patients receiving systemic chemotherapy, a modified Newcastle regimen without methotrexate gave median progression-free survival of 14.4 months against 6.6 and overall survival of 28.7 against 11.7 months compared with CHOP-based chemotherapy; the two-year cumulative incidence of relapse in the central nervous system was 12.1 per cent.", refs: ["ifosfamide", "etoposide", "cyclophosphamide"] },
    ],
    openProblems: [
      "There is no randomised evidence of any kind in this disease, and the best comparison available is a retrospective cohort of 50 treated patients.",
      "Whether methotrexate should be included to prevent relapse in the central nervous system is unresolved: the regimen that performed better left it out, and the two-year risk of relapse in the brain or spinal cord was still 12.1 per cent.",
      "Because it is diagnosed on resected bowel after emergency surgery in many cases, the population that reaches systemic treatment is selected, and the published survival figures reflect that.",
    ],
    related: ["enteropathy-associated-t-cell-lymphoma", "peripheral-t-cell-lymphoma", "extranodal-nk-t-cell-lymphoma", "small-bowel", "non-hodgkin-lymphoma"],
    terms: ["lymphoma-nodal-versus-extranodal", "lymphoma-classification-2022", "lymphoma-pit-score", "lymphoma-tx-cns-prophylaxis", "lymphoma-lugano-gastrointestinal"],
    technologies: ["histopathology-ihc", "fdg-pet"],
    drugs: ["ifosfamide", "etoposide", "cyclophosphamide"],
    links: [SRC.who5, SRC.icc, PAPER.meitl, SRC.pdq],
  }),
];

const spike: Spike = { cancerId: "peripheral-t-cell-lymphoma", entities: lymphomaCoreTcellRecords, patch: {
  aka: ["PTCL", "CTCL", "Mycosis fungoides", "Anaplastic large-cell lymphoma", "Mature T-cell and NK-cell neoplasms", "T-cell lymphoma", "NK-cell lymphoma", "Peripheral T-cell lymphoma, not otherwise specified", "PTCL-NOS"],
  notes: ["Taxonomy. This page is used as the hub for the mature T-cell and NK-cell lymphomas, which is wider than its name. WHO-HAEM5 reserves \"peripheral T-cell lymphoma, not otherwise specified\" for a single entity within the family it calls other peripheral T-cell lymphomas, and files the anaplastic large cell lymphomas, the nodal T-follicular helper cell lymphomas, the EBV-positive NK/T-cell lymphomas, the intestinal T-cell lymphomas and the primary cutaneous T-cell lymphomas as separate families. The corpus keeps this page as the entry point because it is where a reader arrives, and the entities now have pages of their own, listed above."],
  terms: ["lymphoma-pit-score", "lymphoma-htlv-1", "lymphoma-classification-2022", "lymphoma-b-versus-t-cell", "lymphoma-indolent-versus-aggressive"],
  links: [SRC.who5, SRC.icc],
} };

export default spike;

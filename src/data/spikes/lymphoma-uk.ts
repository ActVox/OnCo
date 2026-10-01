import type { CollectionInput, EntityInput, InstitutionInput } from "@/lib/schema";
import type { UkDecision, UkFundingRow, UkPathway, UkSource } from "@/lib/uk-pathway";
import type { Spike } from "./index";

/**
 * LYMPHOMA: THE UK AND NHS LAYER. Facts checked 1 October 2026 against the pages cited on each row.
 *
 * Lymphoma carries more NICE technology appraisals than any other cancer in this corpus: sixty of them are read
 * here, each opened at its recommendation chapter rather than its title, because three appraisal numbers were wrong
 * in an earlier round and one funding row was simply untrue. Every row below carries the number, the publication
 * date, the wording of recommendation 1.1 and the population it applies to, including the refusals, the appraisals
 * terminated because a company did not submit evidence, and the guidance that has been superseded.
 *
 * The pathway is keyed to `non-hodgkin-lymphoma`, with `hodgkin-lymphoma`, the family id `lymphoma` and every
 * subtype in the corpus as aliases: the referral rules, the biopsy, the PET-CT, the waiting-time standards and the
 * multidisciplinary team are the same whichever histology comes back, and it is the histology report that tells a
 * person which of the eighty-odd diseases they have.
 *
 * Nothing here is remembered. NICE pages were read from nice.org.uk/guidance/<ta>/chapter/1-Recommendations, SMC
 * advice from scottishmedicines.org.uk, and the comparisons with United States labelling from the FDA's own
 * structured product labels. Where a source could not be reached, it is named in `gaps` rather than guessed at.
 */
const asOf = "2026-10-01";

const nice = (ta: string) => `https://www.nice.org.uk/guidance/${ta.toLowerCase()}`;
const smc = (slug: string) => `https://www.scottishmedicines.org.uk/medicines-advice/${slug}/`;

// ======================= SOURCES =======================
const CRUK = "https://www.cancerresearchuk.org/health-professional/cancer-statistics/statistics-by-cancer-type";
const S = {
  crukNhl: { label: "Cancer Research UK: non-Hodgkin lymphoma statistics", url: `${CRUK}/non-hodgkin-lymphoma`, date: asOf },
  crukNhlIncidence: { label: "Cancer Research UK: non-Hodgkin lymphoma incidence", url: `${CRUK}/non-hodgkin-lymphoma/incidence`, date: asOf },
  crukNhlMortality: { label: "Cancer Research UK: non-Hodgkin lymphoma mortality", url: `${CRUK}/non-hodgkin-lymphoma/mortality`, date: asOf },
  crukNhlSurvival: { label: "Cancer Research UK: non-Hodgkin lymphoma survival", url: `${CRUK}/non-hodgkin-lymphoma/survival`, date: asOf },
  crukHl: { label: "Cancer Research UK: Hodgkin lymphoma statistics", url: `${CRUK}/hodgkin-lymphoma`, date: asOf },
  crukHlIncidence: { label: "Cancer Research UK: Hodgkin lymphoma incidence", url: `${CRUK}/hodgkin-lymphoma/incidence`, date: asOf },
  crukHlSurvival: { label: "Cancer Research UK: Hodgkin lymphoma survival", url: `${CRUK}/hodgkin-lymphoma/survival`, date: asOf },

  ng12: { label: "NICE NG12: suspected cancer, recognition and referral, recommendations organised by site of cancer. The haematological cancers are section 1.10, recommendations 1.10.1 to 1.10.9. Published 23 June 2015, last updated 15 April 2026", url: "https://www.nice.org.uk/guidance/ng12/chapter/Recommendations-organised-by-site-of-cancer", date: "2026-04-15" },
  ng52: { label: "NICE NG52: non-Hodgkin's lymphoma, diagnosis and management", url: "https://www.nice.org.uk/guidance/ng52", date: "2016-07-20" },
  ng52Rec: { label: "NICE NG52 recommendations, chapter 1", url: "https://www.nice.org.uk/guidance/ng52/chapter/Recommendations", date: "2016-07-20" },
  ng47: { label: "NICE NG47: haematological cancers, improving outcomes", url: "https://www.nice.org.uk/guidance/ng47", date: "2016-05-25" },
  ng47Rec: { label: "NICE NG47 recommendations, chapter 1 (the specialist integrated haematological malignancy diagnostic service, and the levels of multidisciplinary team)", url: "https://www.nice.org.uk/guidance/ng47/chapter/Recommendations", date: "2016-05-25" },
  niceLymphoma: { label: "NICE: all published guidance on lymphoma (blood and bone marrow cancers)", url: "https://www.nice.org.uk/guidance/conditions-and-diseases/cancer/blood-and-bone-marrow-cancers", date: asOf },

  cwt2023: { label: "NHS England: changes to cancer waiting times standards from 1 October 2023", url: "https://www.england.nhs.uk/long-read/changes-to-cancer-waiting-times-standards-from-1-october-2023/", date: "2023-10-01" },
  cwtStats: { label: "NHS England: cancer waiting times statistics", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/" },
  cwtJuly2026: { label: "NHS England: cancer waiting times monthly time series, July 2026 (provisional), sheet 'System Level Performance'. The lymphoma and suspected haematological rows were read from the published cells, not from the commentary", url: "https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/09/July-2026-Monthly-Time-Series-Provisional.xlsx", date: "2026-09-10" },
  cwtNational: { label: "NHS England: cancer waiting times statistical release, July 2026 (provisional, provider based), published 10 September 2026", url: "https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/09/Cancer-Waiting-Times-Statistical-Release-July-2026-Provider-based-Provisional.pdf", date: "2026-09-10" },
  cwtTimeSeries: { label: "NHS England: cancer waiting times national time series October 2009 to July 2026 (provisional); the operational standards are stated in the sheet itself, including '80% from Q1 2026/27' for the 28-day standard", url: "https://www.england.nhs.uk/statistics/wp-content/uploads/sites/2/2026/09/CWT-CRS-National-Time-Series-Oct-2009-Jul-2026-Provisional.xlsx", date: "2026-09-10" },
  phsCwt: { label: "Public Health Scotland: cancer waiting times, 1 April to 30 June 2026", url: "https://publichealthscotland.scot/publications/cancer-waiting-times/cancer-waiting-times-1-april-to-30-june-2026/", date: "2026-09-29" },
  phsCwtTable: { label: "Public Health Scotland: cancer waiting times, Table 1, compliance to standard (lymphoma is one of the ten cancer types Scotland reports by name)", url: "https://publichealthscotland.scot/media/40508/2026-09-29-cwt-table-1-compliance-to-standard.xlsx", date: "2026-09-29" },
  walesNhsPerf: { label: "Welsh Government: NHS activity and performance summary, July and August 2026", url: "https://www.gov.wales/nhs-activity-and-performance-summary-july-and-august-2026-html", date: "2026-09-17" },
  statsWales: { label: "StatsWales: cancer waiting times, patients starting treatment and patients informed they do not have cancer, June 2019 onwards. The finest haematology grain Wales publishes is 'Haematological (excluding acute leukaemia)'", url: "https://stats.gov.wales/en-GB/394da9f2-b879-4994-94de-577d8f863247", date: "2026-09-17" },
  niCwtQ1: { label: "Department of Health (Northern Ireland): cancer waiting time statistics, April to June 2026", url: "https://www.health-ni.gov.uk/publications/northern-ireland-waiting-time-statistics-cancer-waiting-times-april-june-2026", date: "2026-10-01" },
  niCwtWorkbook: { label: "Department of Health (Northern Ireland): cancer waiting times workbook, quarter ending June 2026. The 62-day haematological figure is suppressed because only 16 people were treated, below the 20-patient publication threshold", url: "https://www.health-ni.gov.uk/sites/default/files/2026-09/hs-niwts-cwt-q1-26-27.xlsx", date: "2026-10-01" },
  cartSpec2026: { label: "NHS England: Chimeric Antigen Receptor T Cell (CAR-T) therapy service specification, number 2101, published 14 April 2026. The specification itself names no providers", url: "https://www.england.nhs.uk/wp-content/uploads/2026/04/cart-service-specification-2026-1.pdf", date: "2026-04-14" },
  cartGuidance: { label: "NHS England: commissioning guidance to support the implementation of the CAR-T therapy service specification (all indications, all ages), 12 November 2025 version 3, Appendix 1: the 21 named providers", url: "https://www.england.nhs.uk/wp-content/uploads/2026/04/cart-service-specification-commissioning-guidance-v1.0-1.pdf", date: "2026-04-14" },
  cartBriefing: { label: "NHS England: CAR-T service specification briefing note, which says there are now 23 CAR-T centres, a third count that does not match the other two", url: "https://www.england.nhs.uk/wp-content/uploads/2026/04/cart-service-specification-briefing-note.pdf", date: "2026-04-14" },
  cartEngagement: { label: "NHS England: CAR-T service specification engagement report, which names the National CAR-T Clinical Panels for acute lymphoblastic leukaemia and lymphoma and the paediatric panel", url: "https://www.england.nhs.uk/wp-content/uploads/2026/04/cart-services-specification-engagement-report.pdf", date: "2026-04-14" },
  cartNhse: { label: "NHS England: CAR-T therapy. The old Cancer Drugs Fund page at /cancer/cdf/car-t-therapy/ is retired and the current page is under specialised commissioning", url: "https://www.england.nhs.uk/commissioning/spec-services/advanced-therapy-medicinal-products/car-t-therapy/", date: asOf },
  cartGlasgow: { label: "NHS Greater Glasgow and Clyde, Haemopoietic Stem Cell Transplantation Services: CAR-T cells patient information sheet, which names the BMT Unit at the Queen Elizabeth University Hospital as the treating centre", url: "https://www.rightdecisions.scot.nhs.uk/media/ioee4wam/car-t-patient-info-sheet.pdf", date: "2025-05-14" },
  phsCart: { label: "Public Health Scotland, Cancer Medicines Outcomes Programme: chimeric antigen receptor therapy (CAR-T) report, official statistics in development", url: "https://publichealthscotland.scot/publications/cancer-medicines-outcomes-programme-cmop-phs-clinical-reports/cancer-medicines-outcomes-programme-phs-cmop-phs-chimeric-antigen-receptor-therapy-car-t-report/", date: "2026-04-06" },
  phsCartPdf: { label: "Public Health Scotland: CAR-T official statistics in development report (full PDF), page 36, on the age split between the Scottish adult service and referral to England", url: "https://publichealthscotland.scot/media/32946/car-t-official-statistics-in-development-report-final.pdf", date: "2025-05-27" },
  nssGlasgow: { label: "NHS National Services Scotland: the adult allogeneic stem cell transplantation service is provided by NHS Greater Glasgow and Clyde at the Queen Elizabeth University Hospital", url: "https://www.nss.nhs.scot/specialist-healthcare/specialist-services/adult-allogeneic-stem-cell-transplantation-service/", date: asOf },
  whsscCart: { label: "NHS Wales Joint Commissioning Committee: specialised services policy position PP185, chimeric antigen receptor (CAR) T-cell therapy, April 2023, version 2.1", url: "https://jcc.nhs.wales/policies-resources/policies/cancer-and-blood/chimeric-antigen-receptor-t-cell-car-t-therapy-policy-position-statement-pp185-april-2023-pdf/", date: "2023-04" },
  niStrategy: { label: "Department of Health (Northern Ireland): a cancer strategy for Northern Ireland 2022 to 2032, page 56 on CAR-T and the travel burden", url: "https://www.health-ni.gov.uk/sites/default/files/publications/health/doh-cancer-strategy-march-2022.pdf", date: "2022-03-22" },
  niProgress: { label: "Department of Health (Northern Ireland): cancer strategy progress report, March 2022 to March 2026, page 32 on the planned Belfast CAR-T service", url: "https://www.health-ni.gov.uk/sites/default/files/2026-07/Cancer%20Strategy%20for%20Northern%20Ireland%20Progress%20Report%20March%202022%20-%20March%202026.pdf", date: "2026-07" },
  cdfList: { label: "NHS England: national Cancer Drugs Fund list", url: "https://www.england.nhs.uk/cancer/cdf/cancer-drugs-fund-list/" },
  testDirectory: { label: "NHS England: National Genomic Test Directory", url: "https://www.england.nhs.uk/publication/national-genomic-test-directories/" },
  haemOncDirectory: { label: "NHS England: National Genomic Test Directory for cancer, haematological oncology, version 1.1 (16 July 2026). Lymphoma sits in test packages TP377 Mature B Cell Neoplasms, TP58 Mature T Cell Neoplasms and TP62 Clonality Testing", url: "https://www.england.nhs.uk/wp-content/uploads/2018/08/haematological-oncology-national-genomic-test-directory-version-1.1.xlsx", date: "2026-07-16" },
  haemOncEligibility: { label: "NHS England: National Genomic Test Directory haematological oncology eligibility criteria, version 1.1", url: "https://www.england.nhs.uk/wp-content/uploads/2018/08/haematological-oncology-eligibility-criteria-version-1.1.pdf", date: "2026-07-16" },
  glhList: { label: "NHS England: genomic laboratory hubs. The test directory tells patients to ask their local hub about the testing available in their area", url: "https://www.england.nhs.uk/genomics/genomic-laboratory-hubs/", date: asOf },
  lymphomaActionCart: { label: "Lymphoma Action: CAR T-cell therapy, including the requirement to stay near the treating hospital and to have someone stay with you", url: "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/car-t-cell-therapy", date: asOf },
  isrctnFort: { label: "ISRCTN65687030: FoRT, a phase III multi-centre randomised controlled trial of low-dose palliative radiotherapy for follicular lymphoma", url: "https://www.isrctn.com/ISRCTN65687030", date: asOf },
  isrctnPetrea: { label: "ISRCTN86739591: PETReA, phase III evaluation of PET-guided, response-adapted therapy in patients with previously untreated, high tumour burden follicular lymphoma", url: "https://www.isrctn.com/ISRCTN86739591", date: asOf },
  isrctnPetreaPlus: { label: "ISRCTN80351925: PETReA Plus, a prospective observational study of treatment and outcomes for patients with newly diagnosed follicular lymphoma", url: "https://www.isrctn.com/ISRCTN80351925", date: asOf },
  isrctnSearch: { label: "ISRCTN11668189: SEARCH, screening for early detection of second cancers after radiotherapy and chemotherapy for Hodgkin lymphoma, inside the NHS national lung cancer screening programme", url: "https://www.isrctn.com/ISRCTN11668189", date: asOf },
  isrctnPrizm: { label: "ISRCTN90634455: PRiZM+, a phase II platform study of zanubrutinib monotherapy and combination therapy for relapsed and refractory primary central nervous system lymphoma", url: "https://www.isrctn.com/ISRCTN90634455", date: asOf },
  isrctnMicroCart: { label: "ISRCTN89448306: Micro-CART, investigating molecular microbiology and infectious disease in blood cancer patients following CD19 CAR-T therapy", url: "https://www.isrctn.com/ISRCTN89448306", date: asOf },
  isrctnRemodlb: { label: "ISRCTN51837425: REMoDL-B, a randomised evaluation of molecular guided therapy for diffuse large B-cell lymphoma with bortezomib, sponsored by University Hospital Southampton NHS Foundation Trust", url: "https://www.isrctn.com/ISRCTN51837425", date: asOf },
  isrctnBrevity: { label: "ISRCTN77650947: BREVITY, brentuximab vedotin using a response adapted design in patients with Hodgkin lymphoma unsuitable for chemotherapy because of age, frailty or co-morbidity", url: "https://www.isrctn.com/ISRCTN77650947", date: asOf },
  isrctnDtp3: { label: "ISRCTN13777452: DTP3, treating multiple myeloma and diffuse large B-cell lymphoma by targeting the NF-kappa-B pathway with the first-in-class GADD45-beta/MKK7 inhibitor DTP3", url: "https://www.isrctn.com/ISRCTN13777452", date: asOf },
  isrctnNvg222: { label: "ISRCTN14974342: a Cancer Research UK phase I/IIa first-in-human trial of NVG-222, an autoregulating half-life extended bispecific ROR1-directed CD3 T-cell engager, in haematological malignancies", url: "https://www.isrctn.com/ISRCTN14974342", date: asOf },
  nihrRadar: { label: "NIHR Be Part of Research: Brentuximab Vedotin in Early Stage Hodgkin Lymphoma (the RADAR trial), listed as recruiting in 27 UK cities", url: "https://bepartofresearch.nihr.ac.uk/", date: "2026-07-06" },
  nihrSearch: { label: "NIHR Be Part of Research: 695 studies match 'lymphoma', of which 95 carry the status Recruiting", url: "https://bepartofresearch.nihr.ac.uk/results/search-results?query=lymphoma", date: asOf },

  awttcHow: { label: "All Wales Therapeutics and Toxicology Centre: how medicines are approved for use in NHS Wales. NICE guidance applies in England and Wales, and health boards and the NHS Wales Joint Commissioning Committee are usually expected to make a NICE-recommended medicine available within 60 days of final draft guidance", url: "https://awttc.nhs.wales/accessing-medicines/how-medicines-are-approved-for-use-in-nhs-wales/", date: asOf },
  awttcRecs: { label: "All Wales Therapeutics and Toxicology Centre: medicine recommendations (the search returns its results in the browser and gave a script nothing)", url: "https://awttc.nhs.wales/accessing-medicines/medicine-recommendations/", date: asOf },
  smcSearch: { label: "Scottish Medicines Consortium: medicines advice, lymphoma", url: "https://www.scottishmedicines.org.uk/medicines-advice/?keywords=lymphoma", date: asOf },

  lymphomaAction: { label: "Lymphoma Action: the UK's only charity dedicated to lymphoma, registered charity 1068395 (England and Wales) and SC045850 (Scotland)", url: "https://lymphoma-action.org.uk/about-us", date: asOf },
  lymphomaActionHelpline: { label: "Lymphoma Action: freephone helpline 0808 808 5555, live chat and email", url: "https://lymphoma-action.org.uk/support-you/helpline", date: asOf },
  bloodCancerUk: { label: "Blood Cancer UK: registered charity 216032 (England and Wales) and SC037529 (Scotland)", url: "https://bloodcancer.org.uk/about-us/", date: asOf },
  anthonyNolan: { label: "Anthony Nolan: registered charity 803716 and SC038827, registered company 2379280, registered address Royal Free Hospital, Pond Street, Hampstead", url: "https://www.anthonynolan.org/about-us", date: asOf },
  macmillan: { label: "Macmillan Cancer Support", url: "https://www.macmillan.org.uk/" },
  macSupportLine: { label: "Macmillan Support Line: free on 0808 808 00 00, seven days a week 8am to 8pm; money advisers Monday to Friday 8am to 6pm", url: "https://www.macmillan.org.uk/cancer-information-and-support/get-help/macmillan-support-line", date: asOf },
  macGrants: { label: "Macmillan Grants: the page states that Macmillan's grant service is no longer nationally available, and describes a local trial focused on the highest areas of deprivation across the UK", url: "https://www.macmillan.org.uk/cancer-information-and-support/get-help/financial-help/macmillan-grants", date: asOf },
  maggiesApproach: { label: "Maggie's: our approach. All support is free, with no appointment or referral and no time limit", url: "https://www.maggies.org/about-us/approach/", date: asOf },
  maggies: { label: "Maggie's centres: 29 centres across the UK, open Monday to Friday 9am to 5pm", url: "https://www.maggies.org/our-centres/", date: asOf },
  medex: { label: "NHS Business Services Authority: medical exemption certificates (five years for cancer, the effects of cancer or its treatment)", url: "https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/medical-exemption-certificates", date: asOf },
  htcs: { label: "NHS: Healthcare Travel Costs Scheme", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/healthcare-travel-costs-scheme-htcs/" },
  pip: { label: "GOV.UK: Personal Independence Payment", url: "https://www.gov.uk/pip" },
  govukEol: { label: "GOV.UK: get benefits if you are nearing the end of life (the Special Rules)", url: "https://www.gov.uk/benefits-end-of-life", date: asOf },
  nhsInformRx: { label: "NHS inform: prescription charges and exemptions (prescriptions in Scotland are free)", url: "https://www.nhsinform.scot/care-support-and-rights/nhs-services/pharmacy/prescription-charges-and-exemptions/", date: "2026-01-07" },
  govWalesRx: { label: "Welsh Government: free prescriptions", url: "https://www.gov.wales/free-prescriptions", date: "2020-09-18" },
  nidirectRx: { label: "nidirect: help with health costs (all prescriptions dispensed in Northern Ireland are free of charge)", url: "https://www.nidirect.gov.uk/articles/help-health-costs", date: asOf },
} satisfies Record<string, UkSource>;

// ======================= THE APPRAISALS =======================
/**
 * Every NICE technology appraisal on a lymphoma medicine, read at its recommendation chapter on 1 October 2026.
 * `ta` is the reference, `date` the publication date printed on the page, `decision` the wording of 1.1 reduced to
 * a sentence a reader can act on. `cdf` is set only where recommendation 1.1 itself says "within the Cancer Drugs
 * Fund". The superseded and terminated appraisals are kept because a reader who was treated under one needs to
 * know what happened to it.
 */
const ta = (ref: string, date: string, decision: string, cdf?: boolean): UkDecision => ({ body: "NICE", ref, date, decision, url: nice(ref), ...(cdf ? { cdf: true } : {}) });
const smcAdvice = (ref: string, date: string, decision: string, slug: string): UkDecision => ({ body: "SMC", ref, date, decision, url: smc(slug) });
/**
 * Advice published before the Scottish Medicines Consortium moved to its SMC#### identifiers still carries a
 * legacy number of the form 1138/16. It is quoted inside the decision text rather than in `ref`, which the tests
 * hold to the modern form.
 */
const smcLegacy = (date: string, decision: string, slug: string): UkDecision => ({ body: "SMC", date, decision, url: smc(slug) });

const W_FOLLOWS = "NICE guidance applies in England and Wales. Health boards and the NHS Wales Joint Commissioning Committee are usually expected to make a NICE-recommended medicine available within 60 days of final draft guidance; no separate All Wales Medicines Strategy Group appraisal of this medicine in this indication could be found.";
const NI_FOLLOWS = "Northern Ireland reviews NICE technology appraisals through the Department of Health and normally endorses them for health and social care trusts; no Northern Ireland decision specific to this medicine could be found.";
const W_NO = "NICE guidance applies in England and Wales, so this medicine is not routinely funded in Wales either. Access would need an individual patient funding request.";
const NI_NO = "Not routinely funded, on the same NICE guidance. Access would need an individual funding request to the trust.";

const funding: UkFundingRow[] = [
  // ---------- Diffuse large B-cell and high-grade B-cell lymphoma ----------
  {
    line: "DLBCL, first line",
    treatment: "Polatuzumab vedotin with rituximab, cyclophosphamide, doxorubicin and prednisolone (Pola-R-CHP)",
    refs: ["polatuzumab-vedotin", "rituximab"],
    england: ta("TA874", "2023-03-01", "Recommended for untreated diffuse large B-cell lymphoma in adults with an International Prognostic Index score of 2 to 5, if the company provides it under the commercial arrangement."),
    scotland: smcAdvice("SMC2525", "2023-06-12", "Accepted for restricted use: with R-CHP for previously untreated DLBCL, restricted to an International Prognostic Index score of 2 to 5.", "polatuzumab-vedotin-polivy-full-smc2525"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "The two nations drew the same line in the same place. People with an IPI of 0 or 1 get R-CHOP, which has no appraisal of its own: NICE withdrew TA65, its 2003 appraisal of rituximab in aggressive non-Hodgkin's lymphoma, saying it was no longer relevant to clinical practice because rituximab is now routinely used outside its licensed indication.",
  },
  {
    line: "DLBCL, second line, autologous transplant suitable",
    treatment: "Axicabtagene ciloleucel, or lisocabtagene maraleucel, instead of salvage chemotherapy and transplant",
    refs: ["axicabtagene-ciloleucel", "lisocabtagene-maraleucel"],
    england: ta("TA895", "2023-06-07", "Axicabtagene ciloleucel recommended for use within the Cancer Drugs Fund for DLBCL relapsing within 12 months of, or refractory to, first-line chemoimmunotherapy when an autologous stem cell transplant is suitable, under the managed access agreement.", true),
    scotland: smcAdvice("SMC2695", "2024-11-11", "Accepted for DLBCL and high-grade B-cell lymphoma relapsing within 12 months of, or refractory to, first-line chemoimmunotherapy.", "axicabtagene-ciloleucel-yescarta-resub-smc2695"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Lisocabtagene maraleucel reached the same place by routine commissioning rather than through the Cancer Drugs Fund: NICE TA1048 (26 March 2025) recommends it outright for large B-cell lymphoma refractory to, or relapsing within 12 months of, first-line chemoimmunotherapy when a transplant would be suitable, naming DLBCL, high-grade B-cell lymphoma, primary mediastinal large B-cell lymphoma and grade 3B follicular lymphoma. The Scottish Medicines Consortium had not published on that indication when this page was written: submission SMC2909 showed a publication due date of 9 November 2026.",
  },
  {
    line: "DLBCL, second line, autologous transplant unsuitable",
    treatment: "Glofitamab with gemcitabine and oxaliplatin",
    refs: ["glofitamab"],
    england: ta("TA1113", "2025-12-03", "Can be used for relapsed or refractory DLBCL not otherwise specified in adults who have had 1 line of treatment only and are not eligible for an autologous stem cell transplant."),
    scotland: smcAdvice("SMC2846", "2026-07-13", "Accepted for restricted use with gemcitabine and oxaliplatin for relapsed or refractory DLBCL not otherwise specified in adults ineligible for an autologous stem cell transplant.", "glofitamab-columvi-full-smc2846"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "This is the clearest case on the page of NHS access running ahead of the United States label. The Food and Drug Administration's current label for glofitamab (Columvi, structured product label effective 25 June 2026) carries one lymphoma indication, as a single agent after two or more lines of systemic therapy, and that indication is an accelerated approval based on response rate. NICE and the SMC both fund the combination a line earlier.",
  },
  {
    line: "DLBCL, second line or later, transplant unsuitable",
    treatment: "Polatuzumab vedotin with bendamustine and rituximab",
    refs: ["polatuzumab-vedotin", "bendamustine", "rituximab"],
    england: ta("TA649", "2020-09-23", "Recommended, within its marketing authorisation, for relapsed or refractory DLBCL in adults who cannot have a haematopoietic stem cell transplant."),
    scotland: smcAdvice("SMC2524", "2023-07-10", "Accepted following a reassessment under the end of life and orphan equivalent medicine process, for relapsed or refractory DLBCL in adults who are not candidates for a haematopoietic stem cell transplant.", "polatuzumab-vedotin-polivy-reassessment-smc2524"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Routine commissioning in England, not the Cancer Drugs Fund: recommendation 1.1 says plainly that it is recommended within its marketing authorisation. Having had polatuzumab is now the gate for two of the third-line options below.",
  },
  {
    line: "DLBCL, third line and beyond: CAR-T",
    treatment: "Axicabtagene ciloleucel, or lisocabtagene maraleucel",
    refs: ["axicabtagene-ciloleucel", "lisocabtagene-maraleucel"],
    england: ta("TA872", "2023-02-28", "Axicabtagene ciloleucel recommended, within its marketing authorisation, for relapsed or refractory DLBCL or primary mediastinal large B-cell lymphoma after 2 or more systemic therapies. This appraisal reviewed the evidence collected under the Cancer Drugs Fund managed access agreement of TA559 and moved the treatment into routine commissioning."),
    scotland: smcAdvice("SMC2189", "2019-10-07", "Accepted for relapsed or refractory DLBCL and primary mediastinal large B-cell lymphoma after two or more lines of systemic therapy.", "axicabtagene-ciloleucel-yescarta-resubmission-smc2189"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Lisocabtagene maraleucel joined it at this line through NICE TA1159 (3 June 2026), which recommends it for relapsed or refractory DLBCL or primary mediastinal large B-cell lymphoma after 2 or more lines and tells teams to use the least expensive suitable option. Tisagenlecleucel left: TA567 (13 March 2019) had funded it through the Cancer Drugs Fund, and TA933 (terminated 29 November 2023) replaced that guidance because Novartis did not provide a complete evidence submission. People already on it could continue.",
  },
  {
    line: "DLBCL, third line and beyond: bispecific antibodies",
    treatment: "Glofitamab, or epcoritamab",
    refs: ["glofitamab", "epcoritamab"],
    england: ta("TA927", "2023-10-17", "Glofitamab recommended, within its marketing authorisation, for relapsed or refractory DLBCL in adults after 2 or more systemic treatments."),
    scotland: smcAdvice("SMC2614", "2024-06-10", "Accepted as monotherapy for relapsed or refractory DLBCL after two or more lines of systemic therapy.", "glofitamab-columvi-full-smc2614"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Epcoritamab sits beside it under NICE TA954 (6 March 2024), but with a sequencing condition glofitamab does not carry: it is recommended only if the person has already had polatuzumab vedotin, or polatuzumab is contraindicated or not tolerated. The Scottish Medicines Consortium accepted epcoritamab on the same day as glofitamab (SMC2632, 10 June 2024) without that condition.",
  },
  {
    line: "DLBCL and high-grade B-cell lymphoma, third line and beyond: antibody-drug conjugate",
    treatment: "Loncastuximab tesirine",
    refs: [],
    england: ta("TA947", "2024-01-31", "Recommended for relapsed or refractory DLBCL and high-grade B-cell lymphoma after 2 or more systemic treatments, only if the person has previously had polatuzumab vedotin, or polatuzumab is contraindicated or not tolerated."),
    scotland: smcAdvice("SMC2609", "2024-02-12", "Accepted for restricted use as monotherapy for relapsed or refractory DLBCL and high-grade B-cell lymphoma after two or more lines of systemic therapy.", "loncastuximab-tesirine-zynlonta-full-smc2609"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Loncastuximab tesirine has no drug record in this corpus yet, so this row carries no pills. The United States label (Zynlonta, effective 12 June 2026) has no prior-polatuzumab condition: it is an accelerated approval for large B-cell lymphoma after two or more lines, full stop. The NHS condition is a sequencing rule, not a licensing one.",
  },
  {
    line: "DLBCL, relapsed or refractory, transplant unsuitable: refused",
    treatment: "Tafasitamab with lenalidomide",
    refs: ["tafasitamab", "lenalidomide"],
    england: ta("TA883", "2023-05-03", "Not recommended, within its marketing authorisation, for relapsed or refractory DLBCL in adults who cannot have an autologous stem cell transplant."),
    scotland: smcAdvice("SMC2522", "2023-05-09", "Not recommended following a full submission under the end of life and orphan equivalent medicine process, for relapsed or refractory DLBCL in adults not eligible for an autologous stem cell transplant.", "tafasitamab-minjuvi-full-smc2522"),
    wales: W_NO,
    northernIreland: NI_NO,
    note: "Both UK bodies refused it within six days of each other, and the refusal has since widened: SMC2943 (8 June 2026) also said no to tafasitamab with lenalidomide and rituximab in relapsed or refractory follicular lymphoma, in the absence of a submission. In the United States the same drug holds an accelerated approval with lenalidomide in DLBCL and a full approval with lenalidomide and rituximab in follicular lymphoma (Monjuvi label, effective 23 June 2025). Neither is funded anywhere in the UK.",
  },
  {
    line: "Aggressive B-cell non-Hodgkin lymphoma, third or fourth line",
    treatment: "Pixantrone monotherapy",
    refs: ["pixantrone"],
    england: ta("TA306", "2014-02-26", "Recommended for multiply relapsed or refractory aggressive non-Hodgkin's B-cell lymphoma in adults only if the person has previously had rituximab, is receiving third- or fourth-line treatment, and the manufacturer provides the patient access scheme discount."),
    scotland: smcLegacy("2016-02-07", "Advice 1138/16: not recommended, in the absence of a submission from the holder of the marketing authorisation, as monotherapy for multiply relapsed or refractory aggressive non-Hodgkin B-cell lymphoma.", "pixantrone-pixuvri-nonsubmission-113816"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "A drug England funds and Scotland does not, because no company asked. The Scottish Medicines Consortium identifier on that page is a legacy number (1138/16) rather than the modern SMC-four-digit form.",
  },

  // ---------- Follicular lymphoma ----------
  {
    line: "Follicular lymphoma, first line",
    treatment: "Rituximab with chemotherapy, then rituximab maintenance",
    refs: ["rituximab"],
    england: ta("TA243", "2012-01-25", "Rituximab with CVP, CHOP, MCP, CHVPi or chlorambucil recommended for symptomatic stage 3 and 4 follicular lymphoma in previously untreated people. TA226 (22 June 2011) recommends rituximab maintenance after a response to first-line rituximab with chemotherapy."),
    scotland: smcLegacy("2014-07-07", "Advice 975/14: subcutaneous rituximab accepted for restricted use in non-Hodgkin's lymphoma, including previously untreated stage 3 to 4 follicular lymphoma with chemotherapy, maintenance after a response to induction, and CD20-positive DLBCL with CHOP.", "rituximab-subcutaneous-mabthera-fullsubmission-97514"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Two appraisals, fourteen and fifteen years old, still govern the commonest treatment for the second commonest lymphoma. TA110 (2006) was replaced by TA243. The SMC identifier shown is the legacy form (975/14).",
  },
  {
    line: "Follicular lymphoma, first line: the alternative antibody",
    treatment: "Obinutuzumab with chemotherapy, then obinutuzumab maintenance",
    refs: ["obinutuzumab"],
    england: ta("TA513", "2018-03-21", "Recommended for untreated advanced follicular lymphoma in adults, as induction with chemotherapy then maintenance alone, only if the Follicular Lymphoma International Prognostic Index score is 2 or more."),
    scotland: smcAdvice("SMC2015", "2018-09-10", "Not recommended, following a resubmission, for previously untreated advanced follicular lymphoma with chemotherapy followed by obinutuzumab maintenance.", "obinutuzumab-gazyvaro-resubmission-smc2015"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "A straightforward split: England and Wales fund first-line obinutuzumab for higher-risk follicular lymphoma, Scotland does not. A person in Glasgow with a FLIPI of 3 gets rituximab.",
  },
  {
    line: "Follicular lymphoma refractory to rituximab",
    treatment: "Obinutuzumab with bendamustine, then obinutuzumab maintenance",
    refs: ["obinutuzumab", "bendamustine"],
    england: ta("TA629", "2020-05-13", "Recommended, within its marketing authorisation, for follicular lymphoma that did not respond or progressed up to 6 months after rituximab or a rituximab-containing regimen."),
    scotland: smcLegacy("2017-03-13", "Advice 1219/17: obinutuzumab accepted, with bendamustine followed by obinutuzumab maintenance for follicular lymphoma that did not respond or progressed during or up to six months after rituximab or a rituximab-containing regimen.", "obinutuzumab-gazyvaro-fullsubmission-121917"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "TA629 replaced TA472 (30 August 2017) after data collected in the Cancer Drugs Fund. Here Scotland got there first, in 2017. The SMC identifier shown is the legacy form (1219/17).",
  },
  {
    line: "Follicular lymphoma, previously treated: the chemotherapy-free option",
    treatment: "Lenalidomide with rituximab",
    refs: ["lenalidomide", "rituximab"],
    england: ta("TA627", "2020-04-07", "Recommended, within its marketing authorisation, for previously treated follicular lymphoma (grade 1 to 3A) in adults."),
    scotland: smcAdvice("SMC2281", "2020-10-12", "Accepted with rituximab for previously treated follicular lymphoma (grade 1 to 3a).", "lenalidomide-revlimid-full-smc2281"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "NICE's reasoning names what the drug is for: lenalidomide is the first approved targeted treatment for follicular lymphoma that is not an anti-CD20 antibody, and it is taken by mouth.",
  },
  {
    line: "Follicular lymphoma after 2 or more lines",
    treatment: "Epcoritamab",
    refs: ["epcoritamab"],
    england: ta("TA1139", "2026-03-11", "Can be used for relapsed or refractory follicular lymphoma in adults after 2 or more lines of systemic treatment, only if it is stopped after 3 years of treatment or earlier on progression."),
    scotland: smcAdvice("SMC2881", "2026-09-07", "Accepted as monotherapy for relapsed or refractory follicular lymphoma after two or more lines of systemic therapy.", "epcoritamab-tepkinly-full-smc2881"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "A stopping rule, not a licence condition: the three-year cap is NICE's, written into recommendation 1.1. Epcoritamab with lenalidomide and rituximab in follicular lymphoma is a separate question, still under assessment in Scotland as SMC2980.",
  },
  {
    line: "Follicular lymphoma after 2 or more lines: the refusals",
    treatment: "Mosunetuzumab, axicabtagene ciloleucel and tisagenlecleucel",
    refs: ["mosunetuzumab", "axicabtagene-ciloleucel", "tisagenlecleucel"],
    england: ta("TA892", "2023-05-31", "Mosunetuzumab is not recommended, within its marketing authorisation, for relapsed or refractory follicular lymphoma in adults who have had 2 or more systemic therapies."),
    scotland: smcAdvice("SMC2542", "2023-09-11", "Not recommended as monotherapy for relapsed or refractory follicular lymphoma after at least two prior systemic therapies.", "mosunetuzumab-lunsumio-full-smc2542"),
    wales: W_NO,
    northernIreland: NI_NO,
    note: "Three refusals in one line of treatment. Axicabtagene ciloleucel for follicular lymphoma was refused by NICE in TA894 (7 June 2023) and by the SMC in SMC2646 (15 January 2024). Tisagenlecleucel never reached a decision: NICE TA842 was terminated on 22 November 2022 because Novartis did not provide an evidence submission, and SMC2566 said no on 16 January 2023. NICE TA1186 was terminated on 20 August 2026 for the same reason, this time for lisocabtagene maraleucel. Mosunetuzumab and axicabtagene ciloleucel both hold accelerated approvals in this exact population in the United States.",
  },
  {
    line: "Follicular lymphoma refractory to 2 prior lines: the opposite split",
    treatment: "Idelalisib",
    refs: ["idelalisib"],
    england: ta("TA604", "2019-10-02", "Not recommended, within its marketing authorisation, for follicular lymphoma that has not responded to 2 prior lines of treatment in adults."),
    scotland: smcLegacy("2015-05-11", "Advice 1039/15: accepted as monotherapy for follicular lymphoma refractory to two prior lines of treatment.", "idelalisib-zydelig-fullsubmission-103915"),
    wales: W_NO,
    northernIreland: NI_NO,
    note: "The mirror image of the obinutuzumab row: Scotland accepted idelalisib in 2015 and NICE refused it in 2019, having first terminated an earlier appraisal, TA328, in December 2014. Duvelisib, the other PI3K inhibitor, never got a decision at all: NICE TA717 was terminated on 21 July 2021 because Secura Bio did not submit. The SMC identifier shown is the legacy form (1039/15).",
  },

  // ---------- Mantle cell lymphoma ----------
  {
    line: "Mantle cell lymphoma, untreated, transplant suitable",
    treatment: "Ibrutinib with R-CHOP alternating with R-DHAP or R-DHAOx, then ibrutinib maintenance",
    refs: ["ibrutinib", "rituximab"],
    england: ta("TA1193", "2026-09-23", "Can be used, within its marketing authorisation, for untreated mantle cell lymphoma in adults when an autologous stem cell transplant is suitable."),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "The newest appraisal on this page, published a week before it was written. The Scottish Medicines Consortium had not published: SMC2950 was listed as a full submission with no publication date.",
  },
  {
    line: "Mantle cell lymphoma, untreated, transplant unsuitable",
    treatment: "Acalabrutinib with bendamustine and rituximab; or bortezomib with R-CAP",
    refs: ["acalabrutinib", "bendamustine", "rituximab", "bortezomib"],
    england: ta("TA1184", "2026-08-19", "Acalabrutinib plus bendamustine and rituximab can be used, within its marketing authorisation, for untreated mantle cell lymphoma in adults who are not eligible for an autologous stem cell transplant."),
    scotland: smcLegacy("2015-09-07", "Advice 1075/15: bortezomib accepted with rituximab, cyclophosphamide, doxorubicin and prednisone for previously untreated mantle cell lymphoma in adults unsuitable for haematopoietic stem cell transplantation.", "bortezomib-velcade-fullsubmission-107515"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Bortezomib has held this ground since NICE TA370 (16 December 2015) and SMC advice of September 2015. Acalabrutinib arrived eleven years later. The Scottish submission for acalabrutinib in this indication, SMC2929, had no publication date when this page was written. The SMC identifier shown for bortezomib is the legacy form (1075/15).",
  },
  {
    line: "Mantle cell lymphoma, relapsed after 1 line",
    treatment: "Zanubrutinib, or ibrutinib",
    refs: ["zanubrutinib", "ibrutinib"],
    england: ta("TA1081", "2025-07-10", "Zanubrutinib can be used for relapsed or refractory mantle cell lymphoma in adults who have had 1 line of treatment only, and teams should use the least expensive of the suitable treatments, which includes ibrutinib."),
    scotland: smcAdvice("SMC2819", "2025-08-11", "Accepted through an abbreviated submission as monotherapy for mantle cell lymphoma in adults who have received at least one prior therapy.", "zanubrutinib-brukinsa-abbreviated-smc2819"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Ibrutinib has been funded here since NICE TA502 (31 January 2018), which restricted it to people who have had only 1 previous line of therapy; the SMC accepted it for relapsed or refractory mantle cell lymphoma in August 2016 without that restriction. NICE now treats the two BTK inhibitors as interchangeable and tells teams to pick on price.",
  },
  {
    line: "Mantle cell lymphoma after a BTK inhibitor",
    treatment: "Brexucabtagene autoleucel",
    refs: ["brexucabtagene-autoleucel"],
    england: ta("TA677", "2021-02-24", "Recommended for use within the Cancer Drugs Fund for relapsed or refractory mantle cell lymphoma in adults who have previously had a Bruton's tyrosine kinase inhibitor, under the managed access agreement.", true),
    scotland: smcAdvice("SMC2351", "2021-08-09", "Interim acceptance for relapsed or refractory mantle cell lymphoma after two or more lines of systemic therapy including a Bruton's tyrosine kinase inhibitor.", "autologous-anti-cd19-transduced-cd3plus-cells-kte-x19-tecartus-full-smc2351"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Both decisions are conditional: England's through the Cancer Drugs Fund managed access agreement, Scotland's through the interim acceptance decision option. This is the only CAR-T licensed for mantle cell lymphoma.",
  },
  {
    line: "Mantle cell lymphoma after a BTK inhibitor: the gap",
    treatment: "Pirtobrutinib",
    refs: ["pirtobrutinib"],
    england: ta("TA1173", "2026-07-01", "There is no published NICE appraisal of pirtobrutinib in mantle cell lymphoma. Two evaluations are listed on NICE's site as in development (GID-TA10858) and awaiting development, both with no expected publication date. The reference quoted here, TA1173 of 1 July 2026, is NICE's only published pirtobrutinib appraisal and it is for chronic lymphocytic leukaemia after a BTK inhibitor, a different disease."),
    scotland: smcAdvice("SMC2897", "2026-01-19", "Not recommended, in the absence of a submission from the holder of the marketing authorisation, as monotherapy for relapsed or refractory mantle cell lymphoma previously treated with a Bruton's tyrosine kinase inhibitor.", "pirtobrutinib-jaypirca-non-sub-smc2897"),
    wales: "No All Wales Medicines Strategy Group decision could be found, and with no NICE appraisal there is nothing for Welsh health boards to implement.",
    northernIreland: "No decision could be found.",
    note: "A person whose mantle cell lymphoma has come back after a covalent BTK inhibitor and who cannot have CAR-T has a drug licensed for exactly that situation in the United States and no route to it on the NHS. The Food and Drug Administration label for pirtobrutinib (Jaypirca, effective 6 March 2026) carries an accelerated approval for relapsed or refractory mantle cell lymphoma after at least two lines of systemic therapy including a BTK inhibitor. Acalabrutinib monotherapy in the same setting is in the same position: NICE lists it as awaiting development (GID-TA11470) with no published appraisal. Lenalidomide never got one either, NICE TA774 having been terminated on 9 March 2022 because Celgene did not submit evidence.",
  },

  // ---------- Marginal zone lymphoma and Waldenstrom macroglobulinaemia ----------
  {
    line: "Marginal zone lymphoma after anti-CD20 treatment",
    treatment: "Zanubrutinib",
    refs: ["zanubrutinib"],
    england: ta("TA1001", "2024-09-04", "Recommended, within its marketing authorisation, for marginal zone lymphoma in adults who have had at least 1 anti-CD20-based treatment."),
    scotland: smcAdvice("SMC2684", "2024-12-09", "Accepted following a full submission under the orphan medicine process, as monotherapy for marginal zone lymphoma in adults who have received at least one prior anti-CD20-based therapy.", "zanubrutinib-brukinsa-full-smc2684"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "The first targeted option for marginal zone lymphoma to be funded across the UK. Gastric MALT lymphoma, the commonest marginal zone lymphoma, is usually treated first by eradicating Helicobacter pylori with antibiotics, which no technology appraisal covers.",
  },
  {
    line: "Waldenstrom macroglobulinaemia after at least 1 treatment",
    treatment: "Zanubrutinib, or ibrutinib",
    refs: ["zanubrutinib", "ibrutinib"],
    england: ta("TA833", "2022-10-19", "Zanubrutinib recommended for Waldenstrom's macroglobulinaemia in adults who have had at least 1 treatment, only if bendamustine plus rituximab is also suitable."),
    scotland: smcAdvice("SMC2528", "2022-11-07", "Accepted following a resubmission, as monotherapy for Waldenstrom's macroglobulinaemia in adults who have received at least one prior therapy, or first line in people unsuitable for chemo-immunotherapy.", "zanubrutinib-brukinsa-resub-smc2528"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Ibrutinib is the sharper split. NICE TA795 (8 June 2022) does not recommend ibrutinib for Waldenstrom's macroglobulinaemia after at least one previous therapy, replacing TA491 (2017), which had funded it through the Cancer Drugs Fund; people whose Cancer Drugs Fund funding ended were to be funded by the company. The SMC accepted it for restricted use in December 2021 (SMC2387) and still does. Ibrutinib with rituximab never got an appraisal: NICE TA608 was terminated on 30 October 2019 because Janssen did not provide an evidence submission.",
  },

  // ---------- Hodgkin lymphoma ----------
  {
    line: "Hodgkin lymphoma, untreated stage 3 or 4",
    treatment: "Brentuximab vedotin with doxorubicin, vinblastine and dacarbazine (A-AVD)",
    refs: ["brentuximab-vedotin"],
    england: ta("TA1059", "2025-05-07", "Recommended, within its marketing authorisation, for untreated stage 3 or 4 CD30-positive Hodgkin lymphoma in adults, with doxorubicin, dacarbazine and vinblastine."),
    scotland: smcAdvice("SMC2762", "2025-08-11", "Accepted for adults with previously untreated CD30-positive stage 3 or 4 Hodgkin lymphoma, with doxorubicin, vinblastine and dacarbazine.", "brentuximab-vedotin-adcetris-full-smc2762"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "TA594 had been terminated in August 2019 for this indication and TA1059 replaced it six years later. Brentuximab vedotin in the BrECADD regimen, a different combination for untreated stage 2B with risk factors and stage 3 or 4 disease, was refused by the SMC on 11 May 2026 (SMC2925) in the absence of a submission; NICE lists it as in development (GID-TA11516).",
  },
  {
    line: "Hodgkin lymphoma, relapsed or refractory: brentuximab vedotin",
    treatment: "Brentuximab vedotin monotherapy",
    refs: ["brentuximab-vedotin"],
    england: ta("TA524", "2018-06-13", "Recommended for CD30-positive Hodgkin lymphoma in adults with relapsed or refractory disease, only if they have already had an autologous stem cell transplant, or have already had at least 2 previous therapies when transplant or multi-agent chemotherapy are not suitable."),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "TA524 replaced TA446 (28 June 2017). NICE has never appraised brentuximab vedotin as consolidation after an autologous transplant for people at high risk of relapse, which is a licensed indication in the United States (Adcetris label, effective 11 November 2025); nor has it appraised the paediatric first-line indication the same label carries for children aged 2 and over.",
  },
  {
    line: "Hodgkin lymphoma, relapsed or refractory: checkpoint inhibitors",
    treatment: "Nivolumab, or pembrolizumab",
    refs: ["nivolumab", "pembrolizumab"],
    england: ta("TA462", "2017-07-26", "Nivolumab recommended, within its marketing authorisation, for relapsed or refractory classical Hodgkin lymphoma in adults after an autologous stem cell transplant and treatment with brentuximab vedotin."),
    scotland: smcLegacy("2017-07-10", "Advice 1240/17: nivolumab accepted for relapsed or refractory classical Hodgkin lymphoma in adults after an autologous stem cell transplant and brentuximab vedotin.", "nivolumab-opdivo-fullsubmission-124017"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Pembrolizumab took three appraisals to settle. TA540 (3 September 2018) refused it for people who had had a transplant and brentuximab vedotin. TA772 (23 February 2022) recommended it from the age of 3 for people who have not had brentuximab vedotin. TA967 (1 May 2024) then recommended it for people aged 3 and over who have had at least 2 previous treatments, cannot have a transplant and have already had brentuximab vedotin, with a two-year stopping rule, and replaced TA540. The SMC accepted pembrolizumab for restricted use in March 2018 (legacy identifier 1296/18) and again as SMC2380 on 8 November 2021. The SMC identifier shown for nivolumab is the legacy form (1240/17).",
  },

  // ---------- T-cell lymphomas ----------
  {
    line: "Systemic anaplastic large cell lymphoma, untreated",
    treatment: "Brentuximab vedotin with cyclophosphamide, doxorubicin and prednisone (A-CHP)",
    refs: ["brentuximab-vedotin"],
    england: ta("TA641", "2020-08-12", "Recommended, within its marketing authorisation, for untreated systemic anaplastic large cell lymphoma in adults, with cyclophosphamide, doxorubicin and prednisone."),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "The NHS funds this combination only for systemic anaplastic large cell lymphoma. The United States label covers untreated systemic ALCL or other CD30-expressing peripheral T-cell lymphomas, including angioimmunoblastic T-cell lymphoma: a person in England with CD30-positive angioimmunoblastic T-cell lymphoma is outside the appraisal. No Scottish Medicines Consortium advice specific to this indication could be found.",
  },
  {
    line: "Systemic anaplastic large cell lymphoma, relapsed or refractory",
    treatment: "Brentuximab vedotin monotherapy",
    refs: ["brentuximab-vedotin"],
    england: ta("TA478", "2017-10-04", "Recommended for relapsed or refractory systemic anaplastic large cell lymphoma in adults only if they have an Eastern Cooperative Oncology Group performance status of 0 or 1, with an instruction to make adjustments for physical, sensory or learning disabilities and communication difficulties."),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "One of the few appraisals in this corpus that writes a performance-status threshold into the recommendation itself, and then tells clinicians to adjust it for disability.",
  },
  {
    line: "CD30-positive cutaneous T-cell lymphoma after at least 1 systemic therapy",
    treatment: "Brentuximab vedotin",
    refs: ["brentuximab-vedotin"],
    england: ta("TA577", "2019-04-24", "Recommended for CD30-positive cutaneous T-cell lymphoma after at least 1 systemic therapy in adults, only if they have mycosis fungoides stage 2B or over, primary cutaneous anaplastic large cell lymphoma, or Sezary syndrome."),
    scotland: smcAdvice("SMC2229", "2020-01-13", "Accepted for restricted use for CD30-positive cutaneous T-cell lymphoma in adults after at least one prior systemic therapy.", "brentuximab-adcetris-full-smc2229"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "The cutaneous appraisal is TA577, not TA524: TA524 is the Hodgkin one, and the two are easy to confuse because both are brentuximab vedotin in CD30-positive disease.",
  },
  {
    line: "Mycosis fungoides and Sezary syndrome, previously treated",
    treatment: "Mogamulizumab",
    refs: ["mogamulizumab"],
    england: ta("TA754", "2021-12-15", "Recommended, within its marketing authorisation, for Sezary syndrome in adults who have had at least 1 systemic treatment, and for mycosis fungoides only if the disease is stage 2B or above and the person has had at least 2 systemic treatments."),
    scotland: smcAdvice("SMC2336", "2021-06-07", "Accepted for restricted use for mycosis fungoides or Sezary syndrome in adults who have received at least one prior systemic therapy.", "mogamulizumab-poteligeo-full-smc2336"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "Two different bars for the two diseases in England: one previous systemic treatment for Sezary syndrome, two and stage 2B for mycosis fungoides. Scotland set one bar for both.",
  },
  {
    line: "Early-stage mycosis fungoides",
    treatment: "Chlormethine gel",
    refs: ["mechlorethamine"],
    england: ta("TA720", "2021-08-18", "Recommended for early-stage (1A, 1B and 2A) mycosis fungoides-type cutaneous T-cell lymphoma in adults."),
    scotland: smcAdvice("SMC2318", "2021-05-10", "Accepted for the topical treatment of mycosis fungoides-type cutaneous T-cell lymphoma in adults.", "chlormethine-hydrochloride-ledaga-full-smc2318"),
    wales: W_FOLLOWS,
    northernIreland: NI_FOLLOWS,
    note: "A skin gel rather than a drip: the only appraisal on this page for a treatment a person applies at home. The drug record here is mechlorethamine, the other name for chlormethine.",
  },
];

export const sources = S;
export const pathwayAsOf = asOf;

// ======================= INSTITUTIONS (the UK lymphoma charities) =======================
type I = Omit<InstitutionInput, "kind" | "asOf">;
const inst = (x: I): InstitutionInput => ({ kind: "institution", asOf, ...x });
const lymphomaCancers = ["non-hodgkin-lymphoma", "hodgkin-lymphoma", "dlbcl", "follicular-lymphoma", "mantle-cell-lymphoma", "marginal-zone-lymphoma", "cutaneous-t-cell-lymphoma", "burkitt-lymphoma", "primary-cns-lymphoma", "peripheral-t-cell-lymphoma", "waldenstrom"];

const institutions: InstitutionInput[] = [
  inst({
    id: "lymphoma-action", name: "Lymphoma Action", aka: ["Lymphoma Association", "Lymphoma Action (registered charity 1068395 and SC045850)"],
    city: "Aylesbury", country: "GB", lat: 51.816, lng: -0.813, institutionType: "consortium", website: "https://lymphoma-action.org.uk/",
    tldr: "The United Kingdom's only charity dedicated to lymphoma: a freephone helpline, support groups, a buddy scheme, a lymphoma trials database and a seat at the table when NICE and the Scottish Medicines Consortium appraise a lymphoma medicine.",
    summary: "Lymphoma Action is a registered charity in England and Wales (1068395) and in Scotland (SC045850) and describes itself as the UK's only charity dedicated to lymphoma, the most common blood cancer. It runs a freephone helpline on 0808 808 5555 with live chat and email, support groups and a buddy scheme, a Preparing for Treatment Service and Live your Life workshops for people on active monitoring or finishing treatment, and Lymphoma TrialsLink, a lymphoma clinical trial database and information service. For professionals it runs an education and training programme and an interactive map of specialist cutaneous T-cell lymphoma centres in the UK. Its advocacy work includes submitting the patient perspective to health technology assessments of lymphoma medicines.",
    programs: ["Freephone helpline 0808 808 5555, live chat and email", "Support groups and the buddy scheme", "Lymphoma TrialsLink: a UK lymphoma trial database", "Preparing for Treatment Service", "Live your Life workshops", "Find a CTCL treatment centre map", "Education and training for healthcare professionals"],
    cancers: lymphomaCancers, tags: ["charity", "uk", "lymphoma", "patient-support"],
    links: [{ label: "Lymphoma Action", url: "https://lymphoma-action.org.uk/" }, { label: "About us", url: "https://lymphoma-action.org.uk/about-us" }, { label: "Helpline", url: "https://lymphoma-action.org.uk/support-you/helpline" }, { label: "Find a CTCL treatment centre", url: "https://lymphoma-action.org.uk/healthcare-professionals/find-ctcl-treatment-centre" }],
  }),
  inst({
    id: "blood-cancer-uk", name: "Blood Cancer UK", aka: ["Bloodwise", "Leukaemia and Lymphoma Research", "Leukaemia Research Fund"],
    city: "London", country: "GB", lat: 51.526, lng: -0.109, institutionType: "consortium", website: "https://bloodcancer.org.uk/",
    tldr: "The UK's blood cancer research charity and support line, covering lymphoma alongside leukaemia and myeloma.",
    summary: "Blood Cancer UK is a registered charity in England and Wales (216032) and in Scotland (SC037529). It funds blood cancer research and runs an information and support service covering every blood cancer, including the lymphomas. It was previously called Bloodwise and, before that, Leukaemia and Lymphoma Research.",
    programs: ["Blood cancer research funding", "Support line and online information", "Campaigning on blood cancer care"],
    cancers: [...lymphomaCancers, "aml", "cll", "all-leukemia", "multiple-myeloma"], tags: ["charity", "uk", "blood-cancer"],
    links: [{ label: "Blood Cancer UK", url: "https://bloodcancer.org.uk/" }, { label: "About us", url: "https://bloodcancer.org.uk/about-us/" }],
  }),
  inst({
    id: "anthony-nolan", name: "Anthony Nolan", aka: ["Anthony Nolan Trust", "Anthony Nolan Bone Marrow Trust"],
    city: "London", country: "GB", lat: 51.553, lng: -0.165, institutionType: "consortium", website: "https://www.anthonynolan.org/",
    tldr: "The UK stem cell register, founded in 1974, and the charity behind the clinical nurse specialists who look after transplant patients in NHS centres.",
    summary: "Anthony Nolan is a registered charity (803716 in England and Wales, SC038827 in Scotland) and a registered company (2379280), with its registered address at the Royal Free Hospital in Hampstead. It runs the UK stem cell register that matches unrelated donors to people who need an allogeneic transplant, funds Anthony Nolan clinical nurse specialists placed in NHS transplant centres, runs cell therapy and laboratory services, and hosts a patients and families forum. For people with lymphoma it matters at the point where an allogeneic transplant becomes the option after CAR-T or chemotherapy has failed.",
    programs: ["The UK stem cell register", "Anthony Nolan clinical nurse specialists in NHS transplant centres", "Cell therapy and laboratory services", "Patients and families forum", "Research into transplant outcomes"],
    cancers: [...lymphomaCancers, "aml", "all-leukemia", "cll"], tags: ["charity", "uk", "transplant", "stem-cell"],
    links: [{ label: "Anthony Nolan", url: "https://www.anthonynolan.org/" }, { label: "About us", url: "https://www.anthonynolan.org/about-us" }],
  }),
];

const collections: CollectionInput[] = [];
const entities: EntityInput[] = [...institutions, ...collections];

export const lymphomaUkPathway: UkPathway = {
  cancerId: "non-hodgkin-lymphoma",
  aliases: ["lymphoma", "hodgkin-lymphoma", "dlbcl", "follicular-lymphoma", "mantle-cell-lymphoma", "marginal-zone-lymphoma", "malt-lymphoma", "nodal-marginal-zone-lymphoma", "splenic-marginal-zone-lymphoma", "primary-cutaneous-marginal-zone-lymphoma", "primary-cutaneous-follicle-centre-lymphoma", "burkitt-lymphoma", "primary-cns-lymphoma", "primary-mediastinal-b-cell-lymphoma", "peripheral-t-cell-lymphoma", "cutaneous-t-cell-lymphoma", "sezary-syndrome", "angioimmunoblastic-t-cell-lymphoma", "hepatosplenic-t-cell-lymphoma", "intravascular-large-b-cell-lymphoma", "lymphomatoid-granulomatosis", "hiv-associated-lymphoma", "waldenstrom", "early-stage-classical-hodgkin-lymphoma", "advanced-stage-classical-hodgkin-lymphoma", "relapsed-refractory-hodgkin-lymphoma", "nodular-lymphocyte-predominant-hodgkin-lymphoma"],
  cancerName: "Lymphoma",
  asOf,
  intro: "Around 13,747 people a year are diagnosed with non-Hodgkin lymphoma in the United Kingdom and around 2,184 with Hodgkin lymphoma, and the two diseases sit at opposite ends of what cancer can mean. Hodgkin lymphoma is one of the most curable cancers there is: more than eight in ten people are alive ten years later, and among those diagnosed between 15 and 44, it is more than nine in ten. Non-Hodgkin lymphoma is not one disease at all but sixty-odd, from an indolent follicular lymphoma that may need no treatment for years to a high-grade B-cell lymphoma that has to be treated within days.\n\nWhat they share is the route in, and that route has a problem. NICE NG12 does not require a GP to refer anyone with a suspected lymphoma: for adults it says 'consider' a suspected cancer pathway referral on unexplained lymphadenopathy or splenomegaly, which is the weakest word NICE uses. The consequence is visible in the published statistics. In July 2026, 59.8 percent of people in England referred with a suspected haematological malignancy excluding acute leukaemia were told within 28 days whether they had cancer, the lowest figure of any named suspected-cancer category that month, against 89.0 percent for suspected breast cancer. Once the diagnosis is made the NHS moves fast: 98.1 percent of people with lymphoma started treatment within 31 days of the decision to treat.\n\nThis page follows that route. How lymphoma presents and why it is missed; the NG12 referral rules quoted by number; why the choice between an excision biopsy and a needle core biopsy changes what can be diagnosed; when PET-CT is offered and when NICE says not to offer it; the specialist diagnostic service that produces the one report everything depends on; the twenty-one named CAR-T centres in England and the arrangements in the other three nations; every NICE and Scottish Medicines Consortium decision on a lymphoma medicine with its reference, date and population, including the refusals and the appraisals that never happened; the genomic tests by their current codes; the UK trials; and, at the end, a list of the things that could not be sourced.",
  presentation: [
    {
      title: "A lump that does not go away",
      detail: "The commonest door. A painless, rubbery swelling in the neck, armpit or groin that has been there for weeks and is getting no smaller. NICE NG12 does not make this an automatic referral: recommendation 1.10.6 says to consider a suspected cancer pathway referral for non-Hodgkin lymphoma in adults presenting with unexplained lymphadenopathy or splenomegaly, and 1.10.8 says the same for Hodgkin lymphoma in adults presenting with unexplained lymphadenopathy. 'Consider' is the weaker of NICE's two words, and it is the strongest word lymphoma gets in that guideline. Most enlarged lymph nodes are infection, and a GP who refers every one would refer thousands of well people; the cost of the choice falls on the minority whose node is lymphoma and who are told to come back in a month.",
      sources: [S.ng12],
    },
    {
      title: "The B symptoms",
      detail: "Drenching night sweats that soak the bedclothes, fevers with no infection behind them, and weight loss. NG12 names them as the things to take into account when deciding whether to refer: for both lymphomas, recommendations 1.10.6 to 1.10.9 tell the GP to weigh 'any associated symptoms, particularly fever, night sweats, shortness of breath, pruritus or weight loss'. For adults with suspected Hodgkin lymphoma, 1.10.8 adds one more: alcohol-induced lymph node pain, a symptom rare enough that many doctors never see it and specific enough that it is worth mentioning if it has happened to you.",
      sources: [S.ng12],
    },
    {
      title: "Itching, and nothing else",
      detail: "Pruritus without a rash is on NG12's list for both lymphomas and is one of the commonest reasons a lymphoma takes months to find: it goes to a dermatologist, or to an emollient, before anyone counts it as a cancer symptom. NICE NG47 recommendation 1.3.8 was written for exactly this problem. It asks hospitals to send written referral policies not only to primary care but to their own departments, naming gastroenterology, dermatology, rheumatology and medicine for the elderly, to promote prompt and appropriate referral.",
      sources: [S.ng12, S.ng47Rec],
    },
    {
      title: "A blood count taken for something else",
      detail: "NG12 recommendation 1.10.1 tells doctors to consider a very urgent full blood count in adults with pallor, persistent fatigue, unexplained fever, unexplained persistent or recurrent infection, generalised lymphadenopathy, unexplained bruising, unexplained bleeding, unexplained petechiae or hepatosplenomegaly. That recommendation is written for leukaemia, but it is the route by which a good many lymphomas with marrow involvement are found, and a full blood count is the one test every GP can order the same day.",
      sources: [S.ng12],
    },
    {
      title: "A child or young person: 48 hours, not weeks",
      detail: "The paediatric rules are sharper than the adult ones. NG12 recommendation 1.10.7 asks for a very urgent referral, for an appointment within 48 hours, for specialist assessment for non-Hodgkin lymphoma in children and young people with unexplained lymphadenopathy or splenomegaly, and 1.10.9 says the same for Hodgkin lymphoma. NICE notes that young people aged 16 to 24 may be referred on either pathway depending on their age and local arrangements, which means that the same symptom in the same person can carry a 48-hour standard or no standard at all, depending on which door they walk through.",
      sources: [S.ng12],
    },
    {
      title: "An HIV test, offered at diagnosis",
      detail: "NICE NG52 opens its diagnosis section with a sentence most patients never see: malignant lymphoma is an HIV indicator condition, and the guideline cross-refers to recommendations 1.1.5 and 1.1.8 of NICE's HIV testing guideline. A new lymphoma is a reason to be offered an HIV test, not because of anything a person has done but because lymphoma is one of the illnesses that finds undiagnosed HIV, and because the treatment changes if the result is positive.",
      sources: [S.ng52Rec],
    },
  ],
  timeline: [
    {
      id: "referral",
      label: "Day 0: the referral",
      standard: "A suspected cancer pathway referral, to be considered rather than required; 48 hours for a child or young person",
      detail: "NG12's haematological recommendations are 1.10.1 to 1.10.9. For adults the word is 'consider', for both non-Hodgkin lymphoma (1.10.6) and Hodgkin lymphoma (1.10.8), on unexplained lymphadenopathy or splenomegaly with the associated symptoms weighed alongside. For children and young people (1.10.7 and 1.10.9) it is a very urgent referral for an appointment within 48 hours. There is no blood test or imaging gate in front of the referral the way the faecal immunochemical test now gates a bowel cancer referral: the decision rests on the GP's judgement of a lump.",
      sources: [S.ng12],
    },
    {
      id: "clinic",
      label: "The haematology clinic",
      standard: "Examination, full blood count, lactate dehydrogenase, HIV and hepatitis B serology, and a plan for a biopsy",
      detail: "The first hospital appointment is usually examination and blood tests, and its real purpose is to decide what kind of biopsy to arrange and how fast. Nothing can be said about which lymphoma it is, or what treatment it needs, until a pathologist has seen tissue; NICE NG47 recommendation 1.1.2 requires the diagnostic service to report diagnoses sub-typed by the current World Health Organization classification, and that classification now runs to dozens of entities. A person who leaves this appointment without a diagnosis has not been fobbed off: there is genuinely nothing to say yet.",
      sources: [S.ng47Rec, S.ng52Rec],
    },
    {
      id: "biopsy",
      label: "The biopsy, and why the kind of biopsy matters",
      standard: "Excision biopsy first; a needle core biopsy only when the risk of surgery outweighs the benefit",
      detail: "This is the single most consequential choice on the lymphoma pathway and it is made by someone the patient may never meet. NICE NG52 recommendation 1.1.1 says to consider an excision biopsy, taking out a whole lymph node, as the first diagnostic procedure. Recommendation 1.1.2 allows a needle core biopsy, taking the maximum number of cores of the largest possible calibre, when the risk of a surgical procedure outweighs the potential benefits. The reason excision is preferred is architectural: classifying a lymphoma depends on how the cells are arranged across a whole node, not only on what the cells look like, and a core can miss that. Recommendation 1.1.3 is the safety net: if a diagnosis is not possible after a needle core biopsy, offer an excision biopsy, if surgically feasible, in preference to a second core. Recommendation 1.1.4 tells pathology departments to conserve core tissue so further analysis can be done later. A fine-needle aspirate, which takes cells and no architecture, is not offered as a route to a lymphoma diagnosis at all.",
      sources: [S.ng52Rec],
    },
    {
      id: "sihmds",
      label: "The specialist diagnostic service",
      standard: "Specimens go to a specialist integrated haematological malignancy diagnostic service (SIHMDS), with an integrated report",
      detail: "NG47 recommendation 1.1.6 is blunt: if an urgent treatment decision is not needed, local diagnostic laboratories should send all specimens, including lymph node and other tissue material, directly to a SIHMDS without any local diagnostic workup, as soon as a haematological malignancy is suspected. A SIHMDS must be formally accredited, managed by a single trust, have a single quality management system and a named director, have one central reception point for specimens, and produce a single integrated report combining morphology, immunophenotype, cytogenetics and molecular results, sub-typed by WHO criteria (1.1.1 to 1.1.5). Recommendation 1.1.3 asks for double reporting as part of report validation. This is why a diagnosis can take two to three weeks even when the biopsy was done the week of referral: several laboratories have to agree before anyone writes a name on the report.",
      sources: [S.ng47Rec],
    },
    {
      id: "petct",
      label: "PET-CT",
      standard: "Offered to confirm staging in named situations; otherwise only where the result will change management",
      detail: "NG52 recommendation 1.2.1 offers FDG-PET-CT to confirm staging for stage 1 diffuse large B-cell lymphoma by clinical and CT criteria, for stage 1 or localised stage 2 follicular lymphoma if the disease is thought to be encompassable within a radiotherapy field, and for stage 1 or 2 Burkitt lymphoma with other low-risk features. For every other subtype and stage, 1.2.2 says to consider it only if the result will change management. Recommendation 1.2.3 says plainly: do not routinely offer FDG-PET-CT for interim assessment during treatment for diffuse large B-cell lymphoma. At the end of treatment, 1.2.4 offers it for diffuse large B-cell lymphoma and Burkitt lymphoma, and 1.2.5 says not to offer it routinely for other subtypes. Recommendation 1.2.6 considers it before an autologous stem cell transplant in high-grade disease. A reader who has been told they are not having a PET scan is being treated according to the guideline, not short-changed.",
      sources: [S.ng52Rec],
    },
    {
      id: "fish",
      label: "The gene tests on the biopsy",
      standard: "Fluorescence in situ hybridisation for MYC in all new high-grade B-cell lymphoma, then for the partner, BCL2 and BCL6 if MYC is rearranged",
      detail: "NG52 recommendations 1.1.5 to 1.1.9 set out the testing that separates diffuse large B-cell lymphoma from high-grade B-cell lymphoma with MYC and BCL2 rearrangements, the disease people call double hit. Consider FISH for MYC in everyone newly presenting with histologically high-grade B-cell lymphoma (1.1.5); if MYC is rearranged, use FISH to identify the immunoglobulin partner and whether BCL2 and BCL6 are rearranged too (1.1.6). Recommendation 1.1.7 tells teams not to use immunohistochemistry to assess the prognostic value of cell of origin in diffuse large B-cell lymphoma, and 1.1.8 to read FISH results alongside age and the International Prognostic Index. Recommendation 1.1.9 says to explain the results and their potential prognostic value to the patient, which makes it reasonable to ask for them.",
      sources: [S.ng52Rec],
    },
    {
      id: "mdt",
      label: "The haemato-oncology multidisciplinary team",
      standard: "Every patient's care discussed by a haemato-oncology MDT serving a population of at least 500,000",
      detail: "NG47 recommendation 1.3.2 sets the catchment: haemato-oncology MDTs should serve a population of at least 500,000 people. Recommendation 1.3.3 says every patient with any form of haematological cancer, as defined by current WHO criteria, should be cared for by one, and 1.3.4 that all patients should have their care discussed in a formal MDT meeting attended by the members involved in their diagnosis, treatment or care, with the clinicians in the team regularly treating that particular form of haematological cancer. The core membership (1.3.9) requires at least two haemato-oncologists who specialise in the tumour type being discussed, at least one from each contributing hospital site, and at least one haematopathologist from the SIHMDS. Recommendation 1.3.5 makes the team responsible not only for the first recommendation but for delivering the treatment and the long-term support, and 1.3.6 makes an individual clinician responsible for telling the patient what the meeting decided. A person is entitled to ask what their MDT concluded.",
      sources: [S.ng47Rec],
    },
    {
      id: "fds",
      label: "28 days: the Faster Diagnosis Standard, and where lymphoma sits in it",
      standard: "Told you have cancer, or that you do not, within 28 days of the referral",
      target: "80% from quarter 1 of 2026/27, raised from 75%",
      detail: "England met 79.3 percent of this standard across all cancers in July 2026. The row for suspected haematological malignancies excluding acute leukaemia reads 1,942 people, 1,162 within 28 days, 59.8 percent. That is the lowest figure of any named suspected-cancer category in that month's published table: suspected breast cancer was 89.0 percent, suspected skin cancer 87.3 percent, suspected lower gastrointestinal cancer 67.7 percent, suspected lung cancer 77.8 percent. Only suspected acute leukaemia was lower, at 59.1 percent on 22 people, too few to mean much. Four people in ten referred in England with a suspected blood cancer are still waiting to be told after a month, and the standard had just been raised from 75 percent to 80 percent. Scotland and Wales publish no equivalent 28-day measure at all.",
      sources: [S.cwtJuly2026, S.cwtTimeSeries, S.cwt2023],
    },
    {
      id: "dtt",
      label: "31 days: decision to treat, to treatment",
      standard: "First or subsequent treatment within 31 days of the decision to treat",
      target: "96% (England); 95% (Scotland); 98% (Northern Ireland). Wales has no 31-day standard",
      detail: "This is the part of the lymphoma pathway that works. England's lymphoma row for July 2026 reads 2,092 people, 2,052 within 31 days, 98.1 percent, against an all-cancer 92.5 percent. Scotland reported 291 of 291 people with lymphoma treated within 31 days in the quarter to 30 June 2026, which is 100 percent, with a median wait of 2 days. Northern Ireland's haematological cancers row was 96.7 percent on 120 patients, and its leukaemia row 100 percent. Once a haematology team has decided what to do it happens quickly, because these are chemotherapy and antibody regimens that start on a day unit rather than waiting for an operating list.",
      sources: [S.cwtJuly2026, S.phsCwt, S.phsCwtTable, S.niCwtQ1, S.cwt2023],
    },
    {
      id: "sixtytwo",
      label: "62 days: referral to first treatment",
      standard: "First definitive treatment within 62 days of an urgent suspected cancer referral",
      target: "85% (England); 95% (Scotland); 75% (Wales); 95% (Northern Ireland)",
      detail: "England's lymphoma row for July 2026 reads 1,141 people, 816 within 62 days, 71.5 percent: above the all-cancer 71.2 percent and well above lung at 60.9 percent, but far below the 85 percent standard. Scotland did better, with 90 people, 76 within 62 days, 84.4 percent, among the stronger sites there in a quarter when the 62-day standard was met by no NHS board and the all-cancer figure was 73.6 percent. Wales publishes no lymphoma row: its haematological category excluding acute leukaemia was 141 people, 86 within 62 days, 61 percent in July 2026, against an all-site 60.1 percent and a 75 percent target. Northern Ireland suppressed its 62-day haematological figure because only 16 people were treated in the quarter, below its 20-patient publication threshold; its all-cancer 62-day performance was 28.4 percent with a median wait of 88 days. NHS England says plainly that direct comparisons of performance between the four nations cannot be made, because of the number and complexity of the differences between the standards.",
      sources: [S.cwtJuly2026, S.cwtNational, S.phsCwt, S.phsCwtTable, S.walesNhsPerf, S.statsWales, S.niCwtQ1, S.niCwtWorkbook],
    },
    {
      id: "cart",
      label: "If CAR-T is the answer: a panel, a named centre and four weeks away from home",
      standard: "Referral to a CAR-T provider multidisciplinary team, then to a National Clinical CAR-T Panel where one is in place",
      detail: "CAR-T is not something a local haematology department can give. NHS England's service specification 2101, published 14 April 2026, says the referral goes to a disease-specific multidisciplinary team, an allogeneic transplant centre or direct to a CAR-T provider's specialist MDT, and that provider MDTs then refer to the relevant National Clinical CAR-T Panels where these are in place. The engagement report names a national panel for acute lymphoblastic leukaemia and lymphoma and a separate paediatric panel. The patient-facing wording on NHS England's page is that eligibility is decided by a national panel of expert clinicians following a referral from a specialist doctor. The practical consequence has not changed since the 2018 specification: after discharge, people should remain within about an hour's drive of the administering unit for about four weeks, and Lymphoma Action's page warns that you might not be discharged from hospital at all if you have nobody who can stay with you.",
      sources: [S.cartSpec2026, S.cartGuidance, S.cartEngagement, S.cartNhse, S.lymphomaActionCart],
    },
  ],
  centres: [
    { institutionId: "uclh", name: "University College London Hospital", trust: "University College London Hospitals NHS Foundation Trust", city: "London", nation: "England", offers: ["CAR-T provider (NHS England Appendix 1, item 15)", "Sponsor of FoRT, RAPID and RADAR, the three UK-led lymphoma radiotherapy and PET-adapted trials", "Specialist haemato-oncology MDT"], url: "https://www.uclh.nhs.uk/", sources: [S.cartGuidance, S.isrctnFort] },
    { institutionId: "the-christie", name: "The Christie", trust: "The Christie NHS Foundation Trust", city: "Manchester", nation: "England", offers: ["CAR-T provider (Appendix 1, item 13)", "The CAR-T multidisciplinary team for North Wales as well as Greater Manchester", "RAPID collaborator"], url: "https://www.christie.nhs.uk/", sources: [S.cartGuidance, S.whsscCart] },
    { institutionId: "royal-marsden", name: "The Royal Marsden", trust: "The Royal Marsden NHS Foundation Trust", city: "London", nation: "England", offers: ["CAR-T provider (Appendix 1, item 10)", "Specialist haemato-oncology MDT"], url: "https://www.royalmarsden.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "kings-college-hospital-london", name: "King's College Hospital", trust: "King's College Hospital NHS Foundation Trust", city: "London", nation: "England", offers: ["CAR-T provider (Appendix 1, item 4, listed without a trust suffix)", "Haematological malignancy service and allogeneic transplant"], url: "https://www.kch.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "barts-cancer-institute", name: "St Bartholomew's Hospital", trust: "Barts Health NHS Trust", city: "London", nation: "England", offers: ["CAR-T provider (Appendix 1, item 1)", "Haemato-oncology for North East London"], url: "https://www.bartshealth.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "imperial-cancer-centre", name: "Hammersmith Hospital", trust: "Imperial College Healthcare NHS Trust", city: "London", nation: "England", offers: ["CAR-T provider (Appendix 1, item 3)", "Haematology centre for North West London"], url: "https://www.imperial.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "addenbrookes-cambridge", name: "Addenbrooke's Hospital", trust: "Cambridge University Hospitals NHS Foundation Trust", city: "Cambridge", nation: "England", offers: ["CAR-T provider (Appendix 1, item 2)", "The only commissioned CAR-T centre in the East of England"], url: "https://www.cuh.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "leeds-cancer-centre", name: "St James's University Hospital", trust: "Leeds Teaching Hospitals NHS Trust", city: "Leeds", nation: "England", offers: ["CAR-T provider (Appendix 1, item 5)", "Haemato-oncology for West Yorkshire"], url: "https://www.leedsth.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "newcastle-cancer-centre", name: "Freeman Hospital and the Great North Children's Hospital", trust: "The Newcastle upon Tyne Hospitals NHS Foundation Trust", city: "Newcastle upon Tyne", nation: "England", offers: ["CAR-T provider for adults and paediatrics (Appendix 1, item 7)", "One of the three centres commissioned to give CAR-T to children"], url: "https://www.newcastle-hospitals.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "manchester-royal-infirmary", name: "Manchester Royal Infirmary and Royal Manchester Children's Hospital", trust: "Manchester University NHS Foundation Trust", city: "Manchester", nation: "England", offers: ["CAR-T provider for adults and paediatrics (Appendix 1, item 6)", "Royal Manchester Children's Hospital is one of the three paediatric CAR-T centres"], url: "https://mft.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "nottingham-cancer-centre", name: "Nottingham University Hospitals", trust: "Nottingham University Hospitals NHS Trust", city: "Nottingham", nation: "England", offers: ["CAR-T provider (Appendix 1, item 8)"], url: "https://www.nuh.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "oxford-cancer", name: "Churchill Hospital", trust: "Oxford University Hospitals NHS Foundation Trust", city: "Oxford", nation: "England", offers: ["CAR-T provider (Appendix 1, item 9)"], url: "https://www.ouh.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "weston-park-sheffield", name: "Royal Hallamshire Hospital and Weston Park", trust: "Sheffield Teaching Hospitals NHS Foundation Trust", city: "Sheffield", nation: "England", offers: ["CAR-T provider (Appendix 1, item 11)"], url: "https://www.sth.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "clatterbridge", name: "The Clatterbridge Cancer Centre", trust: "The Clatterbridge Cancer Centre NHS Foundation Trust", city: "Liverpool", nation: "England", offers: ["CAR-T provider (Appendix 1, item 14), one of the four newest adult centres", "Sponsor of ALMANAC, a real-world study of frail and multiply treated large B-cell lymphoma"], url: "https://www.clatterbridgecc.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "birmingham-cancer-centre", name: "Queen Elizabeth Hospital Birmingham", trust: "University Hospitals Birmingham NHS Foundation Trust", city: "Birmingham", nation: "England", offers: ["CAR-T provider (Appendix 1, item 19)", "Sponsor of BREVITY, the UK brentuximab trial for people unfit for chemotherapy"], url: "https://www.uhb.nhs.uk/", sources: [S.cartGuidance, S.isrctnBrevity] },
    { institutionId: "leicester-cancer-research-centre", name: "Leicester Royal Infirmary", trust: "University Hospitals of Leicester NHS Trust", city: "Leicester", nation: "England", offers: ["CAR-T provider (Appendix 1, item 16), one of the four newest adult centres"], url: "https://www.leicestershospitals.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "derriford-plymouth", name: "Derriford Hospital", trust: "University Hospitals Plymouth NHS Trust", city: "Plymouth", nation: "England", offers: ["CAR-T provider (Appendix 1, item 17), one of the four newest adult centres and the only one in the far South West"], url: "https://www.plymouthhospitals.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "southampton-cancer", name: "University Hospital Southampton", trust: "University Hospital Southampton NHS Foundation Trust", city: "Southampton", nation: "England", offers: ["CAR-T provider (Appendix 1, item 18)", "Sponsor of REMoDL-B, the 1,128-patient molecular-guided DLBCL trial"], url: "https://www.uhs.nhs.uk/", sources: [S.cartGuidance, S.isrctnRemodlb] },
    { institutionId: "bristol-haematology-oncology-centre", name: "Bristol Haematology and Oncology Centre", trust: "University Hospitals Bristol and Weston NHS Foundation Trust", city: "Bristol", nation: "England", offers: ["CAR-T provider (Appendix 1, item 20)"], url: "https://www.uhbw.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "great-ormond-street", name: "Great Ormond Street Hospital", trust: "Great Ormond Street Hospital for Children NHS Foundation Trust", city: "London", nation: "England", offers: ["CAR-T provider, paediatric only (Appendix 1, item 21)", "One of the three centres commissioned to give CAR-T to children"], url: "https://www.gosh.nhs.uk/", sources: [S.cartGuidance] },
    { name: "St George's Hospital", trust: "St George's University Hospitals NHS Foundation Trust", city: "London", nation: "England", offers: ["CAR-T provider (Appendix 1, item 12), one of the four newest adult centres"], url: "https://www.stgeorges.nhs.uk/", sources: [S.cartGuidance] },
    { institutionId: "beatson-glasgow", name: "Queen Elizabeth University Hospital, Glasgow", trust: "NHS Greater Glasgow and Clyde", city: "Glasgow", nation: "Scotland", offers: ["Scotland's only CAR-T centre, in the bone marrow transplant unit", "The adult allogeneic stem cell transplantation service for Scotland", "Shared care with the referring hospital from 30 days after infusion"], url: "https://www.nhsggc.scot/", sources: [S.cartGlasgow, S.nssGlasgow, S.phsCartPdf] },
    { institutionId: "university-hospital-wales-cardiff", name: "University Hospital of Wales", trust: "Cardiff and Vale University Health Board", city: "Cardiff", nation: "Wales", offers: ["The CAR-T multidisciplinary team for South Wales", "Laboratory storage and pre-manufacturing processing for licensed CAR-T products", "Patients from North Wales go to the CAR-T MDT at The Christie in Manchester"], url: "https://cavuhb.nhs.wales/", sources: [S.whsscCart] },
    { institutionId: "velindre-cardiff", name: "Velindre Cancer Centre", trust: "Velindre University NHS Trust", city: "Cardiff", nation: "Wales", offers: ["Non-surgical cancer treatment for South East Wales", "Works alongside the Cardiff haematology service"], url: "https://velindre.nhs.wales/", sources: [S.whsscCart] },
    { institutionId: "northern-ireland-cancer-centre", name: "Northern Ireland Cancer Centre and Belfast City Hospital", trust: "Belfast Health and Social Care Trust", city: "Belfast", nation: "Northern Ireland", offers: ["Northern Ireland's regional haematology and transplant service", "No CAR-T service: people travel to Great Britain, with a Belfast service targeted for 2030 to 2031 alongside the redevelopment of the haematology ward"], url: "https://belfasttrust.hscni.net/", sources: [S.niStrategy, S.niProgress] },
  ],
  centresNote: {
    text: "Lymphoma is looked after in every district general hospital in the country: the haematology clinic is one of the commonest outpatient services there is, and most people with lymphoma never travel further than their local one. The centres listed here are the ones that matter when the answer is CAR-T, which cannot be given anywhere else.\n\nNHS England published a consolidated CAR-T service specification on 14 April 2026, numbered 2101. The specification names no providers at all; the named list sits in the accompanying commissioning guidance, at Appendix 1, which lists 21 providers. One of those, Great Ormond Street, is flagged paediatric only, so 20 are adult-capable. Separately, three centres are commissioned to deliver CAR-T to children and young people under 18: Great Ormond Street, Royal Manchester Children's Hospital and Newcastle. The names are reproduced here as published, including the trust names that do not quite match the hospitals people know.\n\nNHS England's own 2026 documents give three different counts. Appendix 1 names 21. Section 6.1 of the same guidance breaks the providers down by region and sums to 22. The briefing note says there are now 23 CAR-T centres across the country. This page uses the named list, because a name can be checked and a count cannot.\n\nNo document says which CAR-T product each centre can give. The specification takes the opposite position: providers are commissioned on the expectation that they deliver all relevant products licensed and approved by NICE for the age group, with site accreditation from each manufacturer. Scotland has one adult CAR-T centre, the bone marrow transplant unit at the Queen Elizabeth University Hospital in Glasgow; Public Health Scotland records that patients younger than 16 must be referred to services in England. Wales commissions the treatment but delivers it elsewhere: the Welsh policy says eligible Welsh patients may be treated in an NHS England hospital, with the CAR-T multidisciplinary team at The Christie for North Wales and at the University Hospital of Wales for South Wales, and NHS Wales refers all eligible patients to the UK-wide lymphoma CAR-T panel. Northern Ireland has no service: its cancer strategy says the treatment is available only at a small number of highly specialised centres in other jurisdictions, and the progress report of July 2026 puts a Belfast service at 2030 to 2031.",
    sources: [S.cartSpec2026, S.cartGuidance, S.cartBriefing, S.cartGlasgow, S.phsCartPdf, S.whsscCart, S.niStrategy, S.niProgress],
  },
  funding,
  fundingNote: {
    text: "Sixty appraisals were opened for this table, each at its recommendation chapter rather than its title. Three things are worth saying about the shape of them.\n\nThe NHS is not uniformly behind the United States, and in one case it is ahead. NICE TA1113 funds glofitamab with gemcitabine and oxaliplatin after one line of treatment in people who cannot have a transplant; the Food and Drug Administration's current label for the same drug carries a single lymphoma indication, as monotherapy after two or more lines, and that is an accelerated approval based on response rate. Scotland accepted the earlier combination too.\n\nWhere the NHS is behind, it is usually behind an accelerated approval. Mosunetuzumab, axicabtagene ciloleucel in follicular lymphoma, tafasitamab with lenalidomide, loncastuximab tesirine and pirtobrutinib all hold United States indications granted on response rate without a randomised survival benefit, and all five were refused, restricted or never appraised here. That is a defensible position, not an oversight: NICE and the Scottish Medicines Consortium both ask what a drug adds to length and quality of life, and a response rate does not answer that. It is also, for the person in front of the oncologist, a closed door.\n\nAnd a surprising number of lymphoma appraisals never happened. Seven of the rows below are terminated appraisals, and in six of them the reason NICE gives is that the company did not provide an evidence submission: ibrutinib with rituximab in Waldenstrom's macroglobulinaemia, duvelisib, lenalidomide in mantle cell lymphoma, tisagenlecleucel twice, and lisocabtagene maraleucel twice. The seventh, zanubrutinib with obinutuzumab, was terminated because BeiGene requested a delay. No committee weighed the evidence in any of them.",
    sources: [S.niceLymphoma, S.smcSearch, S.awttcHow],
  },
  tests: [
    {
      target: "Lymphoma subtype, by the WHO classification",
      code: "pathology",
      test: "The integrated report from a specialist integrated haematological malignancy diagnostic service: morphology, immunohistochemistry, flow cytometry, cytogenetics and molecular tests on one specimen, with double reporting",
      opens: "Everything. Nothing about treatment can be decided until the subtype is named, and the name decides whether the plan is watch and wait, antibiotics, six cycles of chemotherapy, radiotherapy alone or CAR-T.",
      how: "NICE NG47 recommendation 1.1.6 tells local laboratories to send lymph node and other tissue directly to a SIHMDS without any local diagnostic workup as soon as a haematological malignancy is suspected, and 1.1.2 requires the service to report diagnoses sub-typed by the current World Health Organization classification. This is not in the genomic test directory; it is the pathology service itself.",
      sources: [S.ng47Rec],
    },
    {
      target: "MYC rearrangement, and then BCL2 and BCL6",
      code: "GT1394, GT576, GT664, GT312, GT613, GT1285",
      test: "Fluorescence in situ hybridisation under test package TP377, Mature B Cell Neoplasms: MYC 8q24 (GT1394, legacy M96.1 and M99.1), then the partner, MYC::IGH t(8;14) (GT576), IGK::MYC t(2;8) (GT664), IGL::MYC t(8;22) (GT312), with BCL2 18q21 (GT613) and BCL6 3q27 (GT1285)",
      opens: "Separates diffuse large B-cell lymphoma from high-grade B-cell lymphoma with MYC and BCL2 rearrangements, the disease people call double hit, which is treated more intensively. The directory never uses the abbreviation DLBCL: it files this work under High Grade Lymphoma.",
      how: "NICE NG52 recommendation 1.1.5 says to consider FISH for MYC in all people newly presenting with histologically high-grade B-cell lymphoma, and 1.1.6 to identify the immunoglobulin partner and BCL2 and BCL6 if MYC is rearranged. Recommendation 1.1.9 says the results and their potential prognostic value should be explained to you.",
      sources: [S.ng52Rec, S.haemOncDirectory],
    },
    {
      target: "IGH::CCND1, t(11;14): mantle cell lymphoma",
      code: "GT1407, GT868, GT637",
      test: "IGH::CCND1 t(11;14)(q13;q32) FISH (GT1407, legacy M102.1), CCND1 11q13 FISH (GT868) and, for the cyclin D1-negative cases, CCND2 12p13 FISH (GT637)",
      opens: "The diagnosis of mantle cell lymphoma itself, which is what decides between the first-line options in NICE TA1193, TA1184 and TA370 and the relapse options in TA1081, TA502 and TA677.",
      how: "Requested by the diagnostic service on the biopsy. The small-variant panel GT267 includes TP53, which NHS England's eligibility criteria say is tested in known mantle cell lymphoma where the result will assist with prognostication and treatment choice.",
      sources: [S.haemOncDirectory, S.haemOncEligibility],
    },
    {
      target: "IGH::BCL2, t(14;18): follicular lymphoma",
      code: "GT646",
      test: "IGH::BCL2 t(14;18)(q32;q21) FISH (legacy M103.1 and M99.6), with whole genome sequencing available as GT1342 and GT1379",
      opens: "Confirms follicular lymphoma. The eligibility criteria name CARD11, CREBBP, EZH2, ARID1A, EP300, MEF2B and FOXO1 as the genes tested in known follicular lymphoma where the result will assist with prognostication and treatment choice.",
      how: "Part of the diagnostic panel on the biopsy; the gene panel is GT267, Next Generation Sequencing Panel, Small Variants, Mature B Cell Neoplasms.",
      sources: [S.haemOncDirectory, S.haemOncEligibility],
    },
    {
      target: "MYD88 L265P",
      code: "GT272",
      test: "MYD88 hotspot (L265P variants) targeted assay (legacy M104.2, M105.2, M106.1 and M95.12)",
      opens: "Supports the diagnosis of lymphoplasmacytic lymphoma and Waldenstrom's macroglobulinaemia, and of large B-cell lymphoma in an immune-privileged site. It is also the result behind the choice between a BTK inhibitor and chemoimmunotherapy in Waldenstrom's disease, where NICE TA833 funds zanubrutinib only if bendamustine plus rituximab is also suitable.",
      how: "The eligibility criteria state it is for patients with a suspected diagnosis of lymphoplasmacytic lymphoma or large B-cell lymphoma in an immune privileged site, intra-ocular, central nervous system or testicular, where knowing the presence or absence of the variant will assist in diagnosis including that of IgM MGUS.",
      sources: [S.haemOncDirectory, S.haemOncEligibility],
    },
    {
      target: "CD79B Y196, and the immune-privileged lymphomas",
      code: "GT1337",
      test: "CD79B hotspot (Y196 variants) targeted assay (legacy M102.5)",
      opens: "Part of the diagnostic work for a large B-cell lymphoma in the eye, the brain or the testis, which behave differently from nodal disease and are treated differently.",
      how: "The eligibility criteria give the same immune-privileged indication as for MYD88.",
      sources: [S.haemOncDirectory, S.haemOncEligibility],
    },
    {
      target: "Clonality: is this lymphoma at all",
      code: "GT1408, GT1423, GT39, GT508",
      test: "B-cell clonality testing by NGS (GT1408) or multiplex sequencing (GT1423), and T-cell clonality testing by multiplex sequencing (GT39) or NGS (GT508), under test package TP62",
      opens: "The answer to the question that keeps people awake: whether an enlarged node or an odd skin rash is a reactive process or a clonal one. It is the test that most often turns a suspected lymphoma into a non-diagnosis.",
      how: "Requested by the diagnostic service on the biopsy, usually when the morphology is equivocal.",
      sources: [S.haemOncDirectory],
    },
    {
      target: "Whole genome sequencing",
      code: "GT1342, GT1347, GT1350, GT1344, GT1356, GT1381, GT1386",
      test: "Whole genome sequencing, germline and tumour, by subtype: follicular lymphoma (GT1342), high-grade lymphoma (GT1347), Burkitt lymphoma (GT1350), marginal zone lymphoma (GT1344), low-grade lymphoma (GT1356), primary mediastinal B-cell lymphoma (GT1381), T-cell non-Hodgkin lymphoma (GT1386)",
      opens: "The fullest genomic picture available in the NHS, but the route into it depends on your age. The eligibility criteria say all paediatric and teenage and young adult patients with a confirmed or suspected mature B-cell neoplasm are eligible for whole genome sequencing primarily at diagnosis. For adult patients it is available under indication M235, exhausted standard of care testing or treatment. A banner in the directory itself says haematological oncology whole genome sequencing will move to a model targeted to paediatric and young adult patients, with adult access remaining where there is a clear clinical question and expected utility.",
      how: "Ask your haematology team, or your local Genomic Laboratory Hub, which the directory names as the place to ask what testing is available in your area.",
      sources: [S.haemOncDirectory, S.haemOncEligibility, S.glhList],
    },
    {
      target: "ALK, and the anaplastic large cell lymphomas",
      code: "GT1416, GT1385, GT1354",
      test: "ALK 2p23 FISH in mature T-cell neoplasms (GT1416, legacy M182.2) and ALK::NPM1 t(2;5)(p23;q35) FISH (GT1385); for B-cell disease, ALK 2p23 FISH (GT1354)",
      opens: "Separates ALK-positive from ALK-negative anaplastic large cell lymphoma, which have very different outlooks. Both are inside the CD30-positive population NICE TA641 and TA478 cover for brentuximab vedotin.",
      how: "Under test package TP58, Mature T Cell Neoplasms. Whole genome sequencing is listed separately for ALK-positive (GT999) and ALK-negative (GT1369) disease.",
      sources: [S.haemOncDirectory],
    },
    {
      target: "HIV, hepatitis B and Helicobacter pylori",
      code: "pathology",
      test: "HIV serology, hepatitis B surface antigen and core antibody, and a urea breath test, stool antigen or gastric biopsy where the lymphoma is gastric",
      opens: "An HIV diagnosis that changes the treatment and the prognosis; antiviral cover before an anti-CD20 antibody, which can reactivate hepatitis B; and, for gastric MALT lymphoma, eradication therapy, which can cure the lymphoma with antibiotics and no cancer drug at all.",
      how: "NICE NG52 opens its diagnosis section by naming malignant lymphoma as an HIV indicator condition and cross-refers to recommendations 1.1.5 and 1.1.8 of NICE's HIV testing guideline. The hepatitis B and Helicobacter tests are standard practice rather than NG52 recommendations and are listed here because a reader should know why the blood is being taken.",
      sources: [S.ng52Rec],
    },
  ],
  testsNote: {
    text: "There is no single cancer genomic test directory any more. NHS England now publishes four, and everything to do with lymphoma sits in the haematological oncology directory, version 1.1 of 16 July 2026. The old M-codes that clinicians quote survive only in a column headed Legacy 'M' codes; the organising units are now a test package (TP377 Mature B Cell Neoplasms, TP58 Mature T Cell Neoplasms, TP62 Clonality Testing) and a genomic test code (GT…). There are no longer columns called Clinical Indication ID or Clinical Indication Name.\n\nOne absence is worth saying out loud. The word Hodgkin does not appear anywhere in the directory or in its eligibility criteria: not in the spreadsheet, not in the PDF. There is no Hodgkin lymphoma genomic indication in the National Genomic Test Directory. Hodgkin lymphoma is diagnosed on morphology and immunohistochemistry, and nothing in the genomic directory is written for it. The abbreviation DLBCL does not appear either; that work is filed under High Grade Lymphoma and large B cell lymphoma.\n\nThe directory's own caveat, repeated at the head of each package, is worth quoting to anyone who reads the list as a menu: the testing criteria describe the genomic tests that may be used during the analysis of a patient's samples to refine diagnosis, prognosis and treatment decisions, and not all tests are necessary for every patient.",
    sources: [S.haemOncDirectory, S.haemOncEligibility, S.testDirectory],
  },
  trials: [
    { trialId: "rathl", registry: "NCT00678327", name: "RADAR", status: "Recruiting", setting: "Previously untreated stage IA or IIA Hodgkin lymphoma: ABVD with or without involved-site radiotherapy against A2VD with or without radiotherapy, with a PET response-adapted design", sites: ["University College London (sponsor)", "27 UK cities on NIHR Be Part of Research"], url: "https://bepartofresearch.nihr.ac.uk/", note: "The UK-led successor to RATHL and RAPID, open since April 2022 with 1,042 participants planned and completion estimated for 2032. The trial record linked here is RATHL, its predecessor; RADAR has no OnCo record yet." },
    { registry: "ISRCTN86739591", name: "PETReA", status: "Recruitment closed 31 October 2025; study continues to December 2029", setting: "Phase III evaluation of PET-guided, response-adapted therapy in previously untreated, high tumour burden follicular lymphoma", sites: ["United Kingdom", "Australia"], url: "https://www.isrctn.com/ISRCTN86739591", note: "Target enrolment 1,000. The follicular equivalent of the question RATHL asked in Hodgkin lymphoma: can maintenance be dropped in people whose PET scan is clear." },
    { registry: "ISRCTN80351925", name: "PETReA Plus", status: "Recruiting to 29 February 2028", setting: "Prospective observational study of treatment and outcomes for patients with newly diagnosed follicular lymphoma", sites: ["United Kingdom"], url: "https://www.isrctn.com/ISRCTN80351925", note: "An observational companion to PETReA: no randomisation, so a person who does not want to be randomised can still contribute." },
    { registry: "ISRCTN11668189", name: "SEARCH", status: "Recruiting from 1 September 2026 to 1 May 2027", setting: "Screening for early detection of second cancers after radiotherapy and chemotherapy for Hodgkin lymphoma, implementing and evaluating lung cancer screening for high-risk Hodgkin lymphoma survivors inside the NHS national lung cancer screening programme", sites: ["United Kingdom"], url: "https://www.isrctn.com/ISRCTN11668189", note: "A survivorship trial rather than a treatment trial, and the only one on this list written for people who were cured decades ago." },
    { registry: "ISRCTN90634455", name: "PRiZM+", status: "Recruiting to 31 July 2027", setting: "Phase II platform study of zanubrutinib monotherapy and combination therapy for relapsed and refractory primary central nervous system lymphoma", sites: ["United Kingdom"], url: "https://www.isrctn.com/ISRCTN90634455", note: "Primary CNS lymphoma has no NICE appraisal of its own on this page; this is the UK route to a targeted option." },
    { registry: "ISRCTN89448306", name: "Micro-CART", status: "Recruiting from 1 June 2026 to 31 May 2028", setting: "Molecular microbiology and infectious disease in blood cancer patients after CD19 CAR-T therapy", sites: ["United Kingdom"], url: "https://www.isrctn.com/ISRCTN89448306", note: "Infection after CAR-T is the complication that sends people back into hospital; this is the UK study of it." },
    { registry: "ISRCTN13777452", name: "DTP3", status: "Recruiting to 31 March 2027", setting: "First-in-class GADD45-beta/MKK7 inhibitor DTP3, targeting the NF-kappa-B pathway, in multiple myeloma and diffuse large B-cell lymphoma", sites: ["United Kingdom"], url: "https://www.isrctn.com/ISRCTN13777452" },
    { registry: "ISRCTN14974342", name: "NVG-222 first-in-human", status: "Recruiting from 30 November 2025 to 1 November 2029", setting: "Cancer Research UK phase I/IIa dose escalation and expansion of NVG-222, an autoregulating half-life extended bispecific ROR1-directed CD3 T-cell engager, in haematological malignancies", sites: ["United Kingdom"], url: "https://www.isrctn.com/ISRCTN14974342", note: "A Cancer Research UK early-phase trial: the kind of study that only exists because a charity funds the unit that runs it." },
  ],
  trialsNote: {
    text: "Lymphoma is one of the better cancers to have a trial for in Britain. The NIHR's Be Part of Research service returns 695 studies for the word lymphoma, of which 95 carry the status Recruiting; ClinicalTrials.gov returns 102 recruiting studies with a United Kingdom site. The list above is a sample, chosen for UK-led studies and for studies that answer a question a patient would recognise.\n\nTwo cautions about it. ISRCTN publishes no recruitment-status field at all, so every status above derived from an ISRCTN record is read from its published recruitment start and end dates rather than quoted from the registry. And the National Cancer Research Institute, which sponsored or badged most of the historic UK lymphoma trials, no longer has a working website: ncri.org.uk fails to load. Whether it has formally closed could not be established, so nothing is said about that here.",
    sources: [S.nihrSearch, S.isrctnPetrea],
  },
  legacy: [
    {
      title: "RATHL: the trial that took a drug out of the regimen",
      trialIds: ["rathl"],
      story: "Bleomycin cures Hodgkin lymphoma and scars lungs. ABVD, the standard regimen for advanced disease, carried it through all six cycles, and for decades nobody knew whether it had to.\n\nRATHL asked the question by making the interim PET scan the decision point. Everybody had two cycles of ABVD and a scan. People whose scan was negative were randomised to carry on with ABVD or to drop the bleomycin and continue with AVD; people whose scan was positive were escalated. The trial record linked here, registered as NCT00678327, carries the enrolment and the year it reported; the registry entry does not use the name RATHL, which is how the trial is known everywhere else.\n\nThe de-escalated arm did not do worse and it had less lung toxicity. That is why a person treated for advanced Hodgkin lymphoma in Britain today has a scan after two cycles and, if it is clear, usually finishes without bleomycin. It is a rare thing: a publicly funded trial that made a treatment smaller rather than bigger. It also explains why the interim PET scan matters so much in Hodgkin lymphoma when NICE NG52 tells teams not to offer interim PET routinely in diffuse large B-cell lymphoma. The two diseases use the same scan for opposite purposes, and that is not an inconsistency.\n\nThe question has a successor. RADAR, sponsored by University College London and open since April 2022, is doing the same thing for early-stage disease, testing whether brentuximab vedotin can replace bleomycin and spare radiotherapy in stage IA and IIA Hodgkin lymphoma. It is recruiting in 27 UK cities and will not report before 2030.",
      sources: [S.ng52Rec, S.nihrRadar],
    },
    {
      title: "FoRT: four grays instead of twenty-four",
      trialIds: ["fort"],
      story: "Radiotherapy for indolent lymphoma used 24 Gy in twelve fractions: twelve visits to a radiotherapy department. FoRT, sponsored by University College London and funded by Cancer Research UK, randomised sites of follicular and marginal zone lymphoma to 24 Gy in twelve fractions or 4 Gy in two, recruiting between October 2005 and September 2011.\n\nThe lower dose was less effective at preventing local progression, so 24 Gy stayed as the radical dose. But 4 Gy in two fractions worked well enough, and quickly enough, to become the standard palliative dose across the NHS and much of the world. Two visits instead of twelve is a very large difference to somebody who is frail, who is travelling in from a rural area, or who is near the end of life.\n\nIt is also one of the cheapest effective cancer treatments in existence, and a British trial established it. Cancer Research UK records around 2,300 curative and around 1,700 palliative radiotherapy episodes for lymphoma in England in 2024; the palliative column is largely this. The registries disagree about how many people took part, 548 on ISRCTN and 614 on the American registry, and neither has been reconciled.",
      sources: [S.isrctnFort, S.crukNhl],
    },
    {
      title: "GALLIUM: one trial, two answers",
      trialIds: ["gallium"],
      story: "GALLIUM compared obinutuzumab with rituximab, each given with chemotherapy and then as maintenance, in previously untreated indolent non-Hodgkin lymphoma, and reported that progression-free survival was longer with obinutuzumab. It was not a British trial: the sponsor was Hoffmann-La Roche, and the United Kingdom appears as a collaborating group through the Institute of Cancer Research and as one of 183 sites.\n\nThe United Kingdom then gave two different answers to the same evidence. NICE recommended obinutuzumab for untreated advanced follicular lymphoma in TA513, published 21 March 2018, but only for people with a Follicular Lymphoma International Prognostic Index score of 2 or more. The Scottish Medicines Consortium, considering a resubmission, said no on 10 September 2018.\n\nSo a person newly diagnosed with higher-risk follicular lymphoma in Carlisle is offered a drug that a person forty miles north in Dumfries is not, on the same trial, six months apart. Nothing about the biology differs; two committees weighed the same uncertainty about overall survival and the same price differently. It is the plainest illustration on this page of what devolved health technology assessment means for a patient, and it is not the only one: idelalisib and ibrutinib in Waldenstrom's macroglobulinaemia split the other way.",
      sources: [S.niceLymphoma, S.smcSearch],
    },
  ],
  figures: [
    { label: "New non-Hodgkin lymphoma cases a year", value: "13,747", nation: "UK", period: "2019, 2021 to 2022", source: S.crukNhl, note: "The eighth most common cancer in the UK, around 38 diagnoses a day, and 3 percent of all new cancer cases: around 6,000 in females and around 7,800 in males." },
    { label: "Deaths from non-Hodgkin lymphoma a year", value: "5,100", nation: "UK", period: "2022 to 2024", source: S.crukNhl },
    { label: "Non-Hodgkin lymphoma survival to ten years or more", value: "64.6%", nation: "UK", period: "2018 (predicted)", source: S.crukNhlSurvival, note: "In the 1970s it was 22.8 percent. Cancer Research UK records five-year relative survival as generally similar to the European average in Scotland and Northern Ireland but generally below the European average in England and Wales." },
    { label: "Non-Hodgkin lymphoma ten-year survival, age 15 to 44 compared with 75 to 99", value: "87.9% of women and 83.9% of men, against 46.4% and 44.1%", nation: "UK", period: "2018 (predicted)", source: S.crukNhlSurvival },
    { label: "Non-Hodgkin lymphoma five-year survival, least against most deprived", value: "69.1% against 59.2%", nation: "England", period: "2016 to 2020", source: S.crukNhlSurvival, note: "Ten percentage points of survival separate the least and most deprived groups in a disease whose treatment is free at the point of use." },
    { label: "Non-Hodgkin lymphoma cases diagnosed at age 75 and over", value: "38%", nation: "UK", period: "2019, 2021 to 2022", source: S.crukNhlIncidence, note: "Incidence rates are highest at ages 80 to 84, which is 12 percent of all new cases. The age profile is why fitness for treatment, rather than the drug list, decides so many lymphoma plans." },
    { label: "Change in non-Hodgkin lymphoma incidence rates since the early 1990s", value: "up around 26%", nation: "UK", period: "to 2019, 2021 to 2022", source: S.crukNhlIncidence, note: "Rates have been stable in the last decade and are projected to fall by 10 percent between 2024 to 2026 and 2038 to 2040, to around 14,200 cases a year." },
    { label: "New Hodgkin lymphoma cases a year", value: "2,184", nation: "UK", period: "2019, 2021 to 2022", source: S.crukHl, note: "Around 6 a day, around 950 in females and around 1,200 in males. Hodgkin lymphoma is not among the 20 most common cancers in the UK." },
    { label: "Deaths from Hodgkin lymphoma a year", value: "320", nation: "UK", period: "2022 to 2024", source: S.crukHl },
    { label: "Hodgkin lymphoma survival to ten years or more", value: "81.6%", nation: "UK", period: "2018 (predicted)", source: S.crukHlSurvival, note: "In the 1970s it was 48.6 percent." },
    { label: "Hodgkin lymphoma ten-year survival, age 15 to 44 compared with 75 to 99", value: "95.6% of women and 93.9% of men, against 32% and 18.4%", nation: "UK", period: "2018 (predicted)", source: S.crukHlSurvival, note: "The widest age gap on this page by a long way. A man of 80 with the cancer that is described as curable has a worse ten-year outlook than most people with lung cancer. Age, fitness and treatment intensity account for it, and almost nothing is written for the reader who is in the older group." },
    { label: "Hodgkin lymphoma cases diagnosed through an emergency presentation", value: "1 in 5 (20%)", nation: "England", period: "2019", source: S.crukHl, note: "Four in ten (40 percent) came through an urgent suspected cancer referral. In the cancer with the best long-term survival in the UK, one person in five is found in an emergency department." },
    { label: "Hodgkin lymphoma cases that Cancer Research UK estimates are preventable", value: "40%", nation: "UK", period: "2015", source: S.crukHl, note: "Against 3 percent for non-Hodgkin lymphoma. The difference is largely excess body weight and infection." },
    { label: "Non-Hodgkin lymphoma diagnosed at stage 1 or 2", value: "37% in Northern Ireland, 31% in Wales", nation: "Northern Ireland and Wales", period: "2015 to 2019 and 2017 to 2019", source: S.crukNhl, note: "Around 110 people a year in Northern Ireland and around 130 in Wales. Cancer Research UK does not publish the equivalent for England or Scotland on these pages." },
    { label: "Hodgkin lymphoma diagnosed at stage 1 or 2", value: "49% in Northern Ireland, 46% in Wales", nation: "Northern Ireland and Wales", period: "2015 to 2019 and 2017 to 2019", source: S.crukHl, note: "Around 30 people a year in Northern Ireland and around 35 in Wales." },
    { label: "Radiotherapy episodes for lymphoma in England", value: "around 2,300 curative and around 1,700 palliative", nation: "England", period: "2024", source: S.crukNhl, note: "Cancer Research UK reports radiotherapy for a group of lymphoma types together, not for Hodgkin and non-Hodgkin lymphoma separately." },
    { label: "Told within 28 days whether they have cancer, after a referral for a suspected haematological malignancy excluding acute leukaemia", value: "59.8% (1,162 of 1,942)", nation: "England", period: "July 2026 (provisional)", source: S.cwtJuly2026, note: "The lowest of any named suspected-cancer category that month. Suspected breast cancer was 89.0 percent, suspected skin cancer 87.3 percent, suspected lower gastrointestinal cancer 67.7 percent, all cancers 79.3 percent. The standard had just risen from 75 to 80 percent." },
    { label: "Lymphoma: treatment started within 31 days of the decision to treat", value: "98.1% (2,052 of 2,092)", nation: "England", period: "July 2026 (provisional)", source: S.cwtJuly2026, note: "Against 92.5 percent for all cancers and a 96 percent standard. Lymphoma is one of the fastest cancers to treat once the decision has been made." },
    { label: "Lymphoma: treatment started within 62 days of an urgent referral", value: "71.5% (816 of 1,141)", nation: "England", period: "July 2026 (provisional)", source: S.cwtJuly2026, note: "Against 71.2 percent for all cancers and an 85 percent standard." },
    { label: "Lymphoma: treatment started within 62 days of an urgent referral", value: "84.4% (76 of 90)", nation: "Scotland", period: "Quarter ending 30 June 2026", source: S.phsCwtTable, note: "Against 73.6 percent for all cancers and a 95 percent standard that was met by no NHS board. The 31-day figure was 291 of 291, which is 100 percent, with a median wait of 2 days. Scotland is one of only two nations that reports lymphoma by name." },
    { label: "Haematological cancers excluding acute leukaemia: treatment started within 62 days", value: "61% (86 of 141)", nation: "Wales", period: "July 2026", source: S.statsWales, note: "Against 60.1 percent for all sites and a 75 percent target. Wales measures pathways rather than people, and publishes no lymphoma row and no 31-day standard." },
    { label: "All cancers: treatment started within 62 days", value: "28.4% (414 of 1,459), median wait 88 days", nation: "Northern Ireland", period: "Quarter ending 30 June 2026", source: S.niCwtQ1, note: "The haematological 62-day figure is not published: only 16 people were treated in the quarter, below Northern Ireland's 20-patient threshold. The 31-day haematological figure was 96.7 percent on 120 patients." },
    { label: "Commissioned CAR-T providers in England", value: "21 named, of which 1 is paediatric only and 3 are commissioned for children", nation: "England", period: "Commissioning guidance of 12 November 2025, published 14 April 2026", source: S.cartGuidance, note: "NHS England's own documents give three counts: 21 in the named list, 22 in the regional breakdown, 23 in the briefing note." },
    { label: "People given CAR-T a year in Scotland", value: "rose from 15 to 26", nation: "Scotland", period: "2020 to 2023", source: S.phsCart, note: "Public Health Scotland records that 67 of the 76 people in its report, 88 percent, had diffuse large B-cell lymphoma, and that axicabtagene ciloleucel was the commonest product at 44 patients, 58 percent. These are official statistics in development." },
  ],
  support: [
    { institutionId: "lymphoma-action", name: "Lymphoma Action", kind: "charity", url: "https://lymphoma-action.org.uk/", source: S.lymphomaActionHelpline, provides: ["The UK's only charity dedicated to lymphoma", "Freephone helpline 0808 808 5555, with live chat and email to information@lymphoma-action.org.uk", "Support groups and a buddy scheme", "Lymphoma TrialsLink, a lymphoma trial database and information service", "Preparing for Treatment Service, and Live your Life workshops for people on active monitoring or finishing treatment", "An interactive map of specialist cutaneous T-cell lymphoma centres, for professionals"] },
    { institutionId: "blood-cancer-uk", name: "Blood Cancer UK", kind: "charity", url: "https://bloodcancer.org.uk/", source: S.bloodCancerUk, provides: ["Information and a support service covering every blood cancer, including the lymphomas", "Blood cancer research funding", "Registered charity 216032 in England and Wales and SC037529 in Scotland"] },
    { institutionId: "anthony-nolan", name: "Anthony Nolan", kind: "charity", url: "https://www.anthonynolan.org/", source: S.anthonyNolan, provides: ["The UK stem cell register, for people who need an allogeneic transplant", "Anthony Nolan clinical nurse specialists placed in NHS transplant centres", "A patients and families forum", "Registered charity 803716 and SC038827; registered address Royal Free Hospital, Pond Street, Hampstead"] },
    { institutionId: "macmillan-cancer-support", name: "Macmillan Cancer Support", kind: "charity", url: "https://www.macmillan.org.uk/", source: S.macSupportLine, provides: ["Macmillan Support Line, free on 0808 808 00 00, seven days a week from 8am to 8pm", "Money advisers, available Monday to Friday 8am to 6pm; in 2025 the team identified 112 million pounds in potential welfare benefits for around 13,200 people affected by cancer", "Macmillan Buddies: eight weekly telephone calls with the same volunteer", "An online community, open 24 hours a day", "Registered charity 261017 in England and Wales, SC039907 in Scotland and 604 in the Isle of Man"] },
    { name: "Macmillan Grants, which are no longer a national service", kind: "benefit", url: "https://www.macmillan.org.uk/cancer-information-and-support/get-help/financial-help/macmillan-grants", source: S.macGrants, provides: ["Macmillan's page states that its grant service is no longer nationally available", "A local grant may be available depending on where you live: the page describes a trial focused on the highest areas of deprivation across the UK and lists the local authority areas it covers", "The page signposts Turn2us, Disability Grants, the Carers Trust and the Macmillan Benefits Calculator instead"] },
    { institutionId: "maggies-centres", name: "Maggie's", kind: "charity", url: "https://www.maggies.org/", source: S.maggiesApproach, provides: ["29 centres in the grounds of cancer treatment hospitals across the UK", "Cancer support specialists, psychologists and benefits advisers, free, with no appointment or referral needed and no time limit", "Open Monday to Friday, 9am to 5pm; you do not need to live near a centre to get support", "Registered charity in Scotland SC024414. No England and Wales registration is stated on the site, and none is invented here", "Maggie's advertises no national helpline: 0300 123 1801 is its supporter care and general enquiries number"] },
    { name: "Free prescriptions", kind: "benefit", url: "https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/medical-exemption-certificates", source: S.medex, provides: ["In England, a medical exemption certificate covers cancer, the effects of cancer and the effects of its treatment, and lasts five years", "Prescriptions are free of charge in Scotland, Wales and Northern Ireland"] },
    { name: "Healthcare Travel Costs Scheme", kind: "nhs", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/healthcare-travel-costs-scheme-htcs/", source: S.htcs, provides: ["Help with the cost of travel to hospital for people on a qualifying benefit or low income", "Relevant to CAR-T, which requires staying within about an hour of the treating hospital for about four weeks after discharge"] },
    { name: "Personal Independence Payment, and the Special Rules", kind: "benefit", url: "https://www.gov.uk/pip", source: S.govukEol, provides: ["Personal Independence Payment, for extra costs arising from a long-term health condition", "The Special Rules for people nearing the end of life, which remove the waiting period and the face-to-face assessment"] },
  ],
  nations: [
    { topic: "Who appraises a medicine", england: "NICE technology appraisals, with the Cancer Drugs Fund for managed access. Of the lymphoma appraisals on this page, two are currently Cancer Drugs Fund entries: axicabtagene ciloleucel at second line (TA895) and brexucabtagene autoleucel in mantle cell lymphoma (TA677).", scotland: "The Scottish Medicines Consortium, with its own end of life and orphan medicine processes, an interim acceptance decision option and patient access schemes. Advice published before the SMC#### numbering carries a legacy number such as 1138/16.", wales: "NICE guidance applies in England and Wales. Health boards and the NHS Wales Joint Commissioning Committee are usually expected to make a NICE-recommended medicine available within 60 days of final draft guidance. The All Wales Medicines Strategy Group appraises medicines NICE has not.", northernIreland: "NICE technology appraisals are reviewed by the Department of Health and normally endorsed for health and social care trusts.", sources: [S.awttcHow] },
    { topic: "Where the two bodies disagree on a lymphoma medicine", england: "Funded in England but not Scotland: obinutuzumab for untreated advanced follicular lymphoma (TA513) and pixantrone (TA306).", scotland: "Funded in Scotland but not England: idelalisib for follicular lymphoma refractory to two prior lines, accepted by the SMC in 2015 and refused by NICE in TA604; and ibrutinib for Waldenstrom's macroglobulinaemia, accepted for restricted use in 2021 and not recommended by NICE in TA795.", wales: "Follows the NICE position in both directions, so Welsh patients share England's gains and England's refusals.", northernIreland: "Follows the NICE position.", sources: [S.niceLymphoma, S.smcSearch] },
    { topic: "Referral", england: "NICE NG12, recommendations 1.10.6 and 1.10.8 for adults and 1.10.7 and 1.10.9 for children and young people. All four say 'consider'; none says 'refer'.", scotland: "The Scottish Referral Guidelines for Suspected Cancer rather than NG12.", wales: "NG12 applies, inside the Single Cancer Pathway, which measures from the point of suspicion rather than from the referral and counts pathways rather than people.", northernIreland: "NICE NG12 is used, with Northern Ireland's own referral arrangements.", sources: [S.ng12, S.walesNhsPerf] },
    { topic: "Waiting-time standards, and whether lymphoma is reported separately", england: "28-day Faster Diagnosis Standard (80 percent from quarter 1 of 2026/27), 31 days from decision to treat (96 percent) and 62 days from referral (85 percent). England reports Haematological - Lymphoma as its own row for the 31 and 62 day standards, and Suspected haematological malignancies (excluding acute leukaemia) for the 28-day one. July 2026: 98.1 percent, 71.5 percent and 59.8 percent.", scotland: "31 days (95 percent) and 62 days (95 percent); no 28-day equivalent is published. Lymphoma is one of the ten cancer types Scotland names. Quarter to 30 June 2026: 100 percent and 84.4 percent.", wales: "A single standard, 75 percent within 62 days of first suspicion, measured by pathway rather than by person. There is no 31-day standard and no lymphoma row; the finest grain is Haematological (excluding acute leukaemia), which was 61 percent in July 2026.", northernIreland: "31 days (98 percent) and 62 days (95 percent), described as draft targets. Haematological Cancers and Leukaemia are separate sites and there is no lymphoma row; the 62-day haematological figure for the quarter to 30 June 2026 was suppressed because only 16 people were treated.", sources: [S.cwtJuly2026, S.phsCwtTable, S.statsWales, S.niCwtWorkbook] },
    { topic: "CAR-T", england: "21 named providers in the April 2026 commissioning guidance, of which one is paediatric only; three centres are commissioned for children. Referral runs through a CAR-T provider MDT to a National Clinical CAR-T Panel.", scotland: "One adult centre, the bone marrow transplant unit at the Queen Elizabeth University Hospital in Glasgow. Public Health Scotland records that patients younger than 16 must be referred to services in England, and that the number treated rose from 15 to 26 a year between 2020 and 2023, 88 percent of them for diffuse large B-cell lymphoma.", wales: "No Welsh treatment centre is named in any live official document. NHS Wales commissions the treatment and refers all eligible patients to the UK-wide lymphoma CAR-T panel; the CAR-T multidisciplinary team is The Christie in Manchester for North Wales and the University Hospital of Wales in Cardiff for South Wales.", northernIreland: "No service. The cancer strategy says the treatment is available only at a small number of highly specialised centres in other jurisdictions, and that travel usually involves at least two to three visits to a GB site before CAR-T takes place, with three to four weeks in hospital afterwards. A Belfast service is expected to be operational by 2030 to 2031.", sources: [S.cartGuidance, S.cartGlasgow, S.phsCart, S.phsCartPdf, S.whsscCart, S.niStrategy, S.niProgress] },
    { topic: "Prescription charges", england: "Free with a medical exemption certificate, valid five years, covering cancer, the effects of cancer and the effects of its treatment.", scotland: "All prescriptions are free.", wales: "All prescriptions are free.", northernIreland: "All prescriptions dispensed in Northern Ireland are free of charge.", sources: [S.medex, S.nhsInformRx, S.govWalesRx, S.nidirectRx] },
  ],
  gaps: [
    "NHS England's old Cancer Drugs Fund page for CAR-T, at /cancer/cdf/car-t-therapy/, is retired; its last working capture was November 2024 and the Welsh commissioning policy still cites it. The current NHS England HTML pages sit behind a web application firewall that refuses every scripted request, so the pages themselves were not read; the PDFs under /wp-content/uploads/ were, and the figures here come from those.",
    "NHS England's own 2026 documents give three different counts of CAR-T centres: 21 in the named Appendix 1 list used here, 22 in the regional breakdown in section 6.1 of the same guidance, and 23 in the briefing note. The named list is used because a name can be checked.",
    "No published document says which CAR-T product each centre can give. The specification says providers are expected to deliver all relevant licensed and NICE-approved products for the age group, and that accreditation is held with each manufacturer; the per-centre mapping is not public.",
    "No official Welsh or NHS Wales page states in terms that the University Hospital of Wales is a commissioned CAR-T treatment centre. The 2019 Welsh service specification said it was anticipated; the 2023 policy names it as the South Wales CAR-T multidisciplinary team. Neither is upgraded here into a claim that it treats.",
    "No Northern Irish source names which hospital in Great Britain Northern Irish patients are sent to for CAR-T. The cancer strategy says only a GB site. Belfast Trust's website has no CAR-T page.",
    "Wales publishes no lymphoma-specific waiting-time row and no 31-day standard. Northern Ireland publishes no lymphoma row either, and suppressed its 62-day haematological figure for the latest quarter because fewer than 20 people were treated. Scotland publishes no 28-day standard. The four nations' figures are therefore not comparable, as NHS England itself says.",
    "The footnote marker (a) on England's Haematological - Other (a) row is not defined anywhere in the published workbook, so what that category contains is unknown. It is not assumed here to mean myeloma or leukaemia.",
    "There is no Hodgkin lymphoma entry in the National Genomic Test Directory: the word Hodgkin appears nowhere in the haematological oncology spreadsheet or its eligibility criteria. Nor does the abbreviation DLBCL. Whether any primary CNS lymphoma indication sits in the central nervous system directory rather than the haematological one was not checked.",
    "The live NHS England landing page for the genomic test directories could not be read, so it cannot be confirmed from NHS England's own page that version 1.1 of 16 July 2026 is the currently listed file; only that the file is live, says so internally, and that probes for later versions return nothing.",
    "NICE has no published appraisal of pirtobrutinib in mantle cell lymphoma, of acalabrutinib monotherapy in relapsed mantle cell lymphoma, or of brentuximab vedotin as consolidation after an autologous transplant, all three of which are licensed indications in the United States. Whether NHS England funds any of them through a clinical commissioning policy rather than a NICE appraisal could not be checked, because the commissioning policy pages are behind the same firewall.",
    "No All Wales Medicines Strategy Group appraisal or One Wales decision specific to a lymphoma medicine could be found. The All Wales Therapeutics and Toxicology Centre's medicine recommendation search builds its results in the browser and returns nothing to a script.",
    "Cancer Research UK publishes no European age-standardised incidence or mortality rate per 100,000 for either lymphoma on its health-professional pages, and no one-year or all-patient five-year survival; only ten-year survival, plus five-year survival by deprivation. Its routes-to-diagnosis figure is given for Hodgkin lymphoma and not for non-Hodgkin lymphoma.",
    "The National Cancer Research Institute, which badged most of the historic UK lymphoma trials, no longer has a working website. Whether it has formally closed, and when, was not established and is not stated here. No UK Lymphoma Research Alliance could be found to exist, despite the myeloma equivalent being real.",
    "ISRCTN publishes no recruitment-status field, so the statuses given for ISRCTN trials above are read from their published recruitment dates rather than quoted. Enrolment figures disagree between registries for FoRT (548 against 614) and were not reconciled.",
  ],
};

const spike: Spike = {
  cancerId: "non-hodgkin-lymphoma",
  entities,
  patch: {
    institutions: ["lymphoma-action", "blood-cancer-uk", "anthony-nolan"],
    links: [
      { label: "NICE NG12: suspected cancer, haematological cancers (1.10.1 to 1.10.9)", url: S.ng12.url },
      { label: "NICE NG52: non-Hodgkin's lymphoma, diagnosis and management", url: S.ng52.url },
      { label: "NICE NG47: haematological cancers, improving outcomes", url: S.ng47.url },
      { label: "Lymphoma Action: the UK lymphoma charity", url: "https://lymphoma-action.org.uk/" },
      { label: "Cancer Research UK: non-Hodgkin lymphoma statistics", url: S.crukNhl.url },
    ],
  },
};

export default spike;

import type { CancerGeography, GeoSource } from "@/lib/cancer-geography";
import type { Spike } from "./index";

/**
 * LYMPHOMA: THE GEOGRAPHY LAYER. Facts checked 1 October 2026 against the pages cited on each row.
 *
 * Lymphoma's map is not one map. The country rates here are for non-Hodgkin lymphoma as GLOBOCAN reports it,
 * ICD-10 C82 to C86 and C88, one site covering sixty-odd diseases, read from the IARC Cancer Today factsheet API
 * and written to public/globocan/sites/34-non-hodgkin-lymphoma-by-sex.json. Read as a whole, the incidence map
 * mostly tracks how well a country registers cancer: the highest recorded rates are in Malta, Denmark, Israel,
 * the United States and Australia. The honest signal is the other map. Rank the same 185 countries by
 * age-standardised mortality and no high-income country appears in the top fifteen at all.
 *
 * Underneath the single site sit the subtypes whose geography is real rather than an artefact of counting:
 * endemic Burkitt lymphoma in the malaria belt, extranodal NK/T-cell lymphoma in east Asia and Latin America,
 * adult T-cell leukaemia/lymphoma where HTLV-1 is endemic, gastric MALT lymphoma where Helicobacter pylori is
 * common, and HIV-associated lymphoma where antiretroviral coverage is thin. Those are the regions below.
 *
 * Five things would make this page confidently wrong, and none of them is done here. Countries are not ranked by
 * Hodgkin lymphoma incidence, because half the GLOBOCAN top ten are modelled from mortality and the ranking
 * reshuffles between vintages. Relative survival, net survival and GBD estimates are never mixed in one
 * comparison. No DLBCL or adult Hodgkin survival figure is attributed to CONCORD-3, which reports neither: it
 * bundles every lymphoid malignancy, including myeloma and chronic lymphocytic leukaemia, into one number. The
 * t(11;18) translocation is not described as a reason to skip Helicobacter eradication, because both landmark
 * papers found translocation-positive responders. And a high-income five-year cure rate is never set against an
 * African one-year survival figure as though they were the same endpoint.
 *
 * The spike adds no entities: the map and the cards render from `lymphomaGeography`, registered in
 * src/lib/cancer-geography.ts.
 */
const asOf = "2026-10-01";

const epmc = (label: string, pmid: string, date: string): GeoSource => ({ label, url: `https://europepmc.org/article/MED/${pmid}`, date });

// ======================= SOURCES =======================
const S = {
  gco: { label: "IARC Global Cancer Observatory, Cancer Today: GLOBOCAN estimates for non-Hodgkin lymphoma (C82-86, C88) and Hodgkin lymphoma (C81)", url: "https://gco.iarc.who.int/today", date: asOf },
  gcoApi: { label: "IARC Cancer Today API v3, GLOBOCAN 2022 factsheet endpoint, one request per population; incidence rows are type 0 and mortality rows type 1, and the 185 country rows in this file were read from it", url: "https://gco-api.iarc.fr/api/globocan/v3/2022/meta/populations/all/", date: asOf },
  gco2024Nhl: { label: "IARC Global Cancer Observatory: GLOBOCAN 2024 non-Hodgkin lymphoma fact sheet (562,793 cases, ASR 5.4; 234,903 deaths, ASR 2.1)", url: "https://gco.iarc.who.int/media/globocan/factsheets/cancers/34-non-hodgkin-lymphoma-fact-sheet.pdf", date: "2026-07-08" },
  gco2024Hl: { label: "IARC Global Cancer Observatory: GLOBOCAN 2024 Hodgkin lymphoma fact sheet (84,495 cases, ASR 0.96; 19,515 deaths, ASR 0.19)", url: "https://gco.iarc.who.int/media/globocan/factsheets/cancers/33-hodgkin-lymphoma-fact-sheet.pdf", date: "2026-07-08" },

  // Burkitt lymphoma and malaria
  burkitt1958: epmc("Burkitt D, A sarcoma involving the jaws in African children, British Journal of Surgery 1958. The citation is verified; Europe PMC carries no abstract and nothing is quoted from it here", "13628987", "1958"),
  burkitt1962: epmc("Burkitt D, Determining the climatic limitations of a children's cancer common in Africa, BMJ 1962", "14017064", "1962"),
  cookMozaffari: epmc("Cook-Mozaffari P, Newton R, Beral V and Burkitt DP, The geographical distribution of Kaposi's sarcoma and of lymphomas in Africa before the AIDS epidemic, British Journal of Cancer 1998", "9836488", "1998"),
  rochford: epmc("Rochford R and Mbulaiteye SM, The complex interplay of malaria and EBV in Burkitt lymphoma, Cancers 2026", "42449688", "2026"),
  moormann: epmc("Moormann AM, Bailey JA and Rochford R, Burkitt Lymphoma, Current Topics in Microbiology and Immunology 2025", "41128782", "2025"),
  bednets: epmc("Schmit N, Kaur J and Aglago EK, Mosquito bed net use and Burkitt lymphoma incidence in sub-Saharan Africa: a systematic review and meta-analysis, JAMA Network Open 2024", "38635267", "2024"),
  ogwang: epmc("Ogwang MD, Bhatia K, Biggar RJ and Mbulaiteye SM, Incidence and geographic distribution of endemic Burkitt lymphoma in northern Uganda revisited, International Journal of Cancer 2008", "18767045", "2008"),
  mozambique: epmc("O'Callaghan-Gordo C et al, Incidence of endemic Burkitt lymphoma in three regions of Mozambique, American Journal of Tropical Medicine and Hygiene 2016", "27799648", "2016"),
  png: epmc("Lavu E et al, Burkitt lymphoma in Papua New Guinea, 40 years on, Annals of Tropical Paediatrics 2005. The newest Papua New Guinea figures that could be found", "16156984", "2005"),
  seerBurkitt: epmc("Mburu W, Devesa SS, Check D, Shiels MS and Mbulaiteye SM, Incidence of Burkitt lymphoma in the United States during 2000 to 2019, International Journal of Cancer 2023", "37278097", "2023"),
  saBurkitt: epmc("Metekoua C et al, Patterns of incident Burkitt lymphoma during the HIV epidemic among the Black African and White population in South Africa, British Journal of Cancer 2025", "39809970", "2025"),
  cameroon: epmc("Hesseling PB et al, Burkitt lymphoma: the effect of age, sex and delay to diagnosis on treatment completion and outcome of treatment in 934 patients in Cameroon, PLoS One 2024", "38466670", "2024"),
  tanzaniaBl: epmc("Nkya H et al, Childhood Burkitt lymphoma: treatment outcomes, survival, and mortality predictors at two tertiary hospitals in Tanzania, BMC Pediatrics 2026", "42265661", "2026"),
  rituximabEa: epmc("Mawalla WF et al, Rituximab for children with EBV-positive Burkitt lymphoma in East Africa, Blood Advances 2025", "39983056", "2025"),
  burkittHic: epmc("Lap CJ and Dunleavy K, Novel molecular insights and evolution of less toxic therapeutic strategies in Burkitt lymphoma, Cancers 2025", "41154426", "2025"),
  tlsIndia: epmc("Nirmal G et al, Resource-adapted strategies in the management of paediatric Burkitt lymphoma in a low- and middle-income country setting and outcomes: an Indian centre experience, British Journal of Haematology 2025", "40260587", "2025"),
  childhoodSubtypes: epmc("Wang M et al, Global incidence of childhood cancer by subtype in 2022: a population-based registry study, EClinicalMedicine 2025", "41146926", "2025"),

  // Extranodal NK/T-cell lymphoma
  vose: epmc("Vose J, Armitage J and Weisenburger D, International peripheral T-cell and natural killer/T-cell lymphoma study: pathology findings and clinical outcomes, Journal of Clinical Oncology 2008", "18626005", "2008"),
  au: epmc("Au WY et al, Clinical differences between nasal and extranasal natural killer/T-cell lymphoma: a study of 136 cases from the International Peripheral T-Cell Lymphoma Project, Blood 2009", "19029440", "2009"),
  perry: epmc("Perry AM et al, Non-Hodgkin lymphoma in the developing world: review of 4,539 cases from the International Non-Hodgkin Lymphoma Classification Project, Haematologica 2016", "27354024", "2016"),
  sunChina: epmc("Sun J et al, Distribution of lymphoid neoplasms in China: analysis of 4,638 cases according to the World Health Organization classification, American Journal of Clinical Pathology 2012", "22912361", "2012"),
  taiwanTrend: epmc("Yeh SA et al, Trends in the incidence of the Epstein-Barr virus-associated malignancies extranodal NK/T-cell lymphoma and nasopharyngeal carcinoma in Taiwan, PLoS One 2024", "39739673", "2024"),
  zhaoSeer: epmc("Zhao Y et al, Incidence, prognostic factors, and treatment impact on survival in natural killer/T-cell lymphoma: a population-based study in the United States, JMIR Formative Research 2025", "40373215", "2025"),
  haverkos: epmc("Haverkos BM et al, Extranodal NK/T-cell lymphoma, nasal type: an update on epidemiology, clinical presentation and natural history in North American and European cases, Current Hematologic Malignancy Reports 2016", "27778143", "2016"),
  ebvFraction: epmc("Hirabayashi M, Georges D, Combes JD and Clifford GM, Attributable fraction of Epstein-Barr virus in subtypes of lymphoma: a systematic review and global meta-analysis, International Journal of Cancer 2026", "41947331", "2026"),
  ebvGeographic: epmc("Briercheck EL et al, Geographic EBV variants confound disease-specific variant interpretation and predict variable immune therapy responses, Blood Advances 2024", "38815238", "2024"),
  malpicaPtcl: epmc("Malpica L et al, Epidemiology, clinical features, and outcomes of peripheral T-cell lymphoma in Latin America: an international, retrospective, cohort study, Lancet Haematology 2025", "40056928", "2025"),
  montesMojarro: epmc("Montes-Mojarro IA et al, Mutational profile and EBV strains of extranodal NK/T-cell lymphoma, nasal type, in Latin America, Modern Pathology 2020", "31822801", "2020"),
  rialCyted: epmc("Chabay P et al, Lymphotropic viruses EBV, KSHV and HTLV in Latin America: epidemiology and associated malignancies, a literature-based study by the RIAL-CYTED, Cancers 2020", "32759793", "2020"),
  smile: epmc("Yamaguchi M et al, Phase II study of SMILE chemotherapy for newly diagnosed stage IV, relapsed or refractory extranodal natural killer/T-cell lymphoma, nasal type: the NK-Cell Tumor Study Group study, Journal of Clinical Oncology 2011", "21990393", "2011"),
  ddgp: epmc("Li X et al, DDGP versus SMILE in newly diagnosed advanced natural killer/T-cell lymphoma: a randomized controlled, multicenter, open-label study in China (42 patients)", "27060152", "2016"),
  pgemox: epmc("Wang JH et al, Analysis of the efficacy and safety of a combined gemcitabine, oxaliplatin and pegaspargase regimen for NK/T-cell lymphoma, Oncotarget 2016", "27072578", "2016"),
  clcgAsp: epmc("Zheng X et al, Association of improved overall survival with decreased distant metastasis following asparaginase-based chemotherapy and radiotherapy for intermediate- and high-risk early-stage extranodal nasal-type NK/T-cell lymphoma: a CLCG study, ESMO Open 2021", "34242966", "2021"),
  nkeaNext: epmc("Fujimoto A et al, Improved prognosis of advanced-stage extranodal NK/T-cell lymphoma: results of the NKEA-Next study, Leukemia 2025", "39962328", "2025"),
  whoEml: { label: "World Health Organization: the selection and use of essential medicines 2025, WHO Model List of Essential Medicines, 24th list. Asparaginase and pegaspargase are listed on the complementary list for acute lymphoblastic leukaemia only; the words NK/T and natural killer appear nowhere in the document", url: "https://iris.who.int/handle/10665/382243", date: "2025" },
  asparaginaseCost: epmc("Hughes TM et al, Forecasting asparaginase need and cost for childhood cancer using ACCESS FORxECAST, JCO Global Oncology 2025", "39883893", "2025"),
  denburg: epmc("Denburg AE et al, Access to essential medicines for children with cancer: a global survey, JCO Global Oncology 2022", "35749676", "2022"),

  // HTLV-1 and adult T-cell leukaemia/lymphoma
  gessain: epmc("Gessain A and Cassar O, Epidemiological aspects and world distribution of HTLV-1 infection, Frontiers in Microbiology 2012", "23162541", "2012"),
  noori: epmc("Noori B et al, Epidemiology and clinical outcomes of HTLV-1: a comprehensive narrative review of endemic and non-endemic regions, Canadian Journal of Infectious Diseases and Medical Microbiology 2026. A narrative review: its regional figures are its collation of other people's numbers, and are labelled as such here", "41737026", "2026"),
  iwanaga: epmc("Iwanaga M, Epidemiology of HTLV-1 infection and ATL in Japan: an update, Frontiers in Microbiology 2020", "32547527", "2020"),
  itoJapan: epmc("Ito S et al, Epidemiology of adult T-cell leukemia-lymphoma in Japan: an updated analysis, 2012 to 2013, Cancer Science 2021", "34355480", "2021"),
  itabashi: epmc("Itabashi K, Miyazawa T and Uchimaru K, How can we prevent mother-to-child transmission of HTLV-1?, International Journal of Molecular Sciences 2023", "37108125", "2023"),
  ogoyama: epmc("Ogoyama M et al, Decline in human T-cell leukemia virus type 1 pregnant carriers and emerging concerns about horizontal transmission: a nationwide survey in Japan, Journal of Obstetrics and Gynaecology Research 2025", "41267583", "2025"),
  rosadas: epmc("Rosadas C and Taylor GP, Current interventions to prevent HTLV-1 mother-to-child transmission and their effectiveness: a systematic review and meta-analysis, Microorganisms 2022", "36363819", "2022"),
  shimoyama: epmc("Shimoyama M, Diagnostic criteria and classification of clinical subtypes of adult T-cell leukaemia-lymphoma: a report from the Lymphoma Study Group (1984 to 1987), British Journal of Haematology 1991", "1751370", "1991"),
  katsuya: epmc("Katsuya H et al, Treatment and survival among 1,594 patients with ATL, Blood 2015", "26361794", "2015"),
  malpicaUs: epmc("Malpica L et al, Epidemiology, clinical features, and outcome of HTLV-1-related ATLL in an area of prevalence in the United States, Blood Advances 2018", "29545256", "2018"),
  valcarcel: epmc("Valcarcel B et al, Prevalence and survival outcomes of adult T-cell leukemia/lymphoma in Latin America: a multicenter cohort study and recommendations to improve diagnosis and outcomes, Cancer Epidemiology 2025", "40716284", "2025"),
  peruAtl: epmc("Garrido-Pinzas G et al, Epidemiology of adult T-cell leukemia/lymphoma in people living with HTLV-1: a 30-year study in Peru, PLOS Neglected Tropical Diseases 2026", "41729993", "2026"),
  frenchGuiana: epmc("Ramassamy JL et al, Adult T-cell leukemia/lymphoma in French Guiana 1990 to 2019: epidemiology, clinical features, and HTLV-1 genetic diversity in the two main ethnic populations, International Journal of Cancer 2026", "40985869", "2026"),
  centralAustralia: epmc("Talukder MR et al, High human T-cell leukemia virus type 1c proviral loads are associated with diabetes and chronic kidney disease: results of a cross-sectional community survey in Central Australia, Clinical Infectious Diseases 2023", "35903021", "2023"),
  iranHtlv: epmc("Mahdifar M et al, Immigrating and vicinity are not risk factors in the prevalence and transmission rate of human T-lymphotropic virus type 1: a survey in an endemic region of Iran and Afghan refugees, PLOS Global Public Health 2023", "36962855", "2023"),
  romania: epmc("Paun L et al / Southern African origin of HTLV-1 in Romania: the only genuine endemic region for HTLV-1 in Europe", "28282882", "2017"),
  ishidaMoga: epmc("Ishida T et al, Mogamulizumab for relapsed adult T-cell leukemia-lymphoma: updated follow-up analysis of phase I and II studies, Cancer Science 2017. Mogamulizumab was approved in Japan for relapsed or refractory ATL in 2012 and for peripheral and cutaneous T-cell lymphoma in 2014", "28776876", "2017"),
  mogaFda: { label: "DailyMed: POTELIGEO (mogamulizumab-kpkc) prescribing information. The United States indication is relapsed or refractory mycosis fungoides or Sezary syndrome after at least one prior systemic therapy; adult T-cell leukaemia/lymphoma, the disease the drug was developed for in Japan, is not a United States indication", url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e53960ab-42a1-40d1-9c7d-eb013fe7f18f", date: asOf },

  // Helicobacter pylori and gastric MALT lymphoma
  hooi: epmc("Hooi JKY et al, Global prevalence of Helicobacter pylori infection: systematic review and meta-analysis, Gastroenterology 2017", "28456631", "2017"),
  liTrend: epmc("Li Y et al, Global prevalence of Helicobacter pylori infection between 1980 and 2022: a systematic review and meta-analysis, Lancet Gastroenterology and Hepatology 2023", "37086739", "2023"),
  wotherspoon: epmc("Wotherspoon AC et al, Regression of primary low-grade B-cell gastric lymphoma of mucosa-associated lymphoid tissue type after eradication of Helicobacter pylori, Lancet 1993", "8102719", "1993"),
  lemos: epmc("Lemos FFB et al, Effectiveness of Helicobacter pylori eradication in the treatment of early-stage gastric mucosa-associated lymphoid tissue lymphoma: an up-to-date meta-analysis, World Journal of Gastroenterology 2023", "37122607", "2023"),
  nakamura: epmc("Nakamura S et al, Long-term clinical outcome of gastric MALT lymphoma after eradication of Helicobacter pylori: a multicentre cohort follow-up study of 420 patients in Japan, Gut 2012", "21890816", "2012"),
  liu2001: epmc("Liu H et al, Resistance of t(11;18) positive gastric mucosa-associated lymphoid tissue lymphoma to Helicobacter pylori eradication therapy, Lancet 2001", "11197361", "2001"),
  liu2002: epmc("Liu H et al, t(11;18)(q21;q21) is associated with advanced mucosa-associated lymphoid tissue lymphoma that expresses nuclear BCL10, Gastroenterology 2002", "11984515", "2002"),
  raderer: epmc("Raderer M, Kiesewetter B and Du MQ, Clinical relevance of molecular aspects in extranodal marginal zone lymphoma: a critical appraisal, Therapeutic Advances in Medical Oncology 2023. Antibiotic eradication is the recommended therapy of choice irrespective of genetic findings", "37389189", "2023"),
  doglioni: epmc("Doglioni C et al, High incidence of primary gastric lymphoma in northeastern Italy, Lancet 1992", "1347858", "1992"),
  capelle: epmc("Capelle LG et al, Gastric MALT lymphoma: epidemiology and high adenocarcinoma risk in a nation-wide study, European Journal of Cancer 2008", "18707866", "2008"),
  luminari: epmc("Luminari S et al, Decreasing incidence of gastric MALT lymphomas in the era of anti-Helicobacter pylori interventions: results from a population-based study on extranodal marginal zone lymphomas, Annals of Oncology 2010", "19850642", "2010"),

  // HIV-associated lymphoma
  hernandezRamirez: epmc("Hernandez-Ramirez RU et al, Cancer risk in HIV-infected people in the USA from 1996 to 2012: a population-based, registry-linkage study, Lancet HIV 2017", "28803888", "2017"),
  engels: epmc("Engels EA et al, Trends in cancer risk among people with AIDS in the United States 1980 to 2002, AIDS 2006", "16868446", "2006"),
  gopal: epmc("Gopal S et al, Temporal trends in presentation and survival for HIV-associated lymphoma in the antiretroviral therapy era, Journal of the National Cancer Institute 2013", "23892362", "2013"),
  fiveContinents: epmc("AIDS-defining Cancer Project Working Group of IeDEA and COHERE in EuroCoord, Non-Hodgkin lymphoma risk in adults living with HIV across five continents, AIDS 2018", "30234606", "2018"),
  malawiDlbcl: epmc("Kimani S et al, Safety and efficacy of rituximab in patients with diffuse large B-cell lymphoma in Malawi: a prospective, single-arm, non-randomised phase 1/2 clinical trial, Lancet Global Health 2021", "34022150", "2021"),
  pel: epmc("Volesky-Avellaneda KD et al, Primary effusion lymphoma in people with and without HIV infection in the United States, AIDS 2025", "39945621", "2025"),
  kshvAfrica: epmc("Dollard SC et al, Substantial regional differences in human herpesvirus 8 seroprevalence in sub-Saharan Africa, International Journal of Cancer 2010", "20143397", "2010"),
  kshvGap: epmc("Etta EM et al, Human herpesvirus 8 seroprevalence and genotypes in Africa: almost half the countries have no data at all", "30150604", "2018"),
  unaids: { label: "UNAIDS global HIV statistics fact sheet, 2025 data. The HTML fact sheet page carries no regional numbers; these were read from the PDF", url: "https://www.unaids.org/sites/default/files/2026-07/2026_UNAIDS_Global_HIV_Factsheet_en.pdf", date: "2026-07" },

  // Global burden and survival
  gbdNhl: epmc("Li T et al, The global, regional and national burden of non-Hodgkin lymphoma in 204 countries and territories and 811 subnational locations, 1990 to 2021, Annals of Hematology 2025", "40848052", "2025"),
  gbdSdi: epmc("Li D et al, Global burden of non-Hodgkin lymphoma by socio-demographic index, Expert Review of Hematology 2025", "40917004", "2025"),
  gbdHl: epmc("Pu H, Zhang J and Song Y, Global burden of Hodgkin lymphoma, Annals of Hematology 2026", "41591457", "2026"),
  concord3: epmc("Allemani C et al, Global surveillance of trends in cancer survival 2000 to 2014 (CONCORD-3). Adults are analysed in two broad groups, lymphoid and myeloid malignancies, so the lymphoid figure bundles Hodgkin lymphoma, every non-Hodgkin subtype, myeloma and chronic lymphocytic leukaemia into one number", "29395269", "2018"),
  seerNhl: { label: "SEER Cancer Stat Facts: non-Hodgkin lymphoma", url: "https://seer.cancer.gov/statfacts/html/nhl.html", date: asOf },
  seerHl: { label: "SEER Cancer Stat Facts: Hodgkin lymphoma", url: "https://seer.cancer.gov/statfacts/html/hodg.html", date: asOf },
  ganjohoInc: { label: "National Cancer Center Japan, Cancer Information Service: cancer incidence from the national cancer registry, 2016 to 2023 (Excel). Japan publishes malignant lymphoma as one line, C81 to C85 and C96, with components by ICD code; it publishes no single non-Hodgkin lymphoma row", url: "https://ganjoho.jp/reg_stat/statistics/data/dl/excel/cancer_incidenceNCR(2016-2023)E.xlsx", date: "2026" },
  ganjohoMort: { label: "National Cancer Center Japan: cancer mortality 1958 to 2024 (Excel). Malignant lymphoma deaths are reported without a Hodgkin and non-Hodgkin split", url: "https://ganjoho.jp/reg_stat/statistics/data/dl/excel/cancer_mortality(1958-2024)E.xlsx", date: "2026" },
  korea: epmc("Park EH et al, Cancer statistics in Korea: incidence, mortality, survival and prevalence in 2023, Cancer Research and Treatment 2026", "41881851", "2026"),
  southAfrica: { label: "National Cancer Registry, National Institute for Communicable Diseases (South Africa): pathology-based cancer report 2024. The table's own title says these are cancers diagnosed histologically, so cases never reaching a laboratory are not counted", url: "https://www.nicd.ac.za/wp-content/uploads/2026/04/NCR_Pathology_2024_Report.pdf", date: "2026-04" },
} satisfies Record<string, GeoSource>;

export const lymphomaGeography: CancerGeography = {
  cancerId: "non-hodgkin-lymphoma",
  cancerName: "Non-Hodgkin lymphoma",
  asOf,
  siteCode: 34,
  headline:
    "The incidence map and the mortality map of lymphoma are near-inverses of each other, and that is the whole story. Rank the 185 countries GLOBOCAN covers by age-standardised non-Hodgkin lymphoma incidence and the top of the list is Malta, Denmark, Israel, the United States, Australia, Canada and the Netherlands. Rank the same countries by age-standardised mortality and the top fifteen are Zimbabwe, Uganda, Egypt, Brunei, Namibia, Samoa, Cameroon, Lebanon, Honduras, Mozambique, Papua New Guinea, Gaza Strip and West Bank, Malawi, Peru and Jamaica. No high-income country appears at all. The incidence map is substantially a map of who has a pathology laboratory and a cancer registry; the mortality map is a map of who can be treated.",
  regions: [
    {
      id: "malaria-belt",
      title: "The malaria belt: endemic Burkitt lymphoma in equatorial Africa and Papua New Guinea",
      countries: ["UGA", "TZA", "KEN", "MWI", "MOZ", "CMR", "NGA", "GHA", "COD", "ZMB", "SSD", "BDI", "RWA", "PNG"],
      glyph: "microbe",
      summary: "The first cancer in which a virus was found, and the only common childhood cancer whose map is drawn by a mosquito. Denis Burkitt, a surgeon in Uganda, described a jaw sarcoma in African children in 1958 and then spent years establishing that its distribution followed a climate, not a people: it stopped where it got too cold or too dry for Plasmodium falciparum to be transmitted all year round. Epstein-Barr virus was discovered in a Ugandan Burkitt tumour in 1964.",
      detail:
        "The mechanism now has a name. Repeated falciparum infection drives polyclonal B-cell activation, raising the chance of an activation-induced cytidine deaminase mediated MYC translocation in proportion to the recurrent parasite burden; Rochford and Mbulaiteye call the result a tumour of malaria survivors, peaking years after the age of highest malaria mortality, and say plainly that malaria control is a form of cancer control.\n\nThe strongest evidence for that direction of causation is an experiment nobody designed. A 2024 systematic review and meta-analysis of 5,226 Burkitt cases from 17 countries found rates 44 percent lower (95 percent confidence interval 12 to 64) after insecticide-treated bed nets were introduced than before, with pooled incidence of 1.36 per 100,000 person-years before and 0.76 after; each percentage point of bed-net use in the preceding decade was associated with a 2 percent reduction in incidence.\n\nThe absolute rates are small and the denominators are not all the same, which is a trap. Northern Uganda, the classic focus, had an age-standardised incidence of 2.4 per 100,000, rising to 4.1 in 5 to 9 year olds and varying three to fourfold between districts. Mozambique's 2015 estimates were 2.0, 1.7 and 3.9 per million person-years in three regions, highest in the north where malaria transmission is most intense: that is per million, not per 100,000. Papua New Guinea's national figure, the newest that could be found and now twenty-one years old, was 1.7 per 100,000 with 13.4 per 100,000 in Gulf province, and 89 percent of cases came from the malaria-holoendemic coast. For contrast, the United States rate across 11,626 SEER cases was 3.96 per million person-years.\n\nEpstein-Barr virus is in 45.8 percent of Burkitt lymphoma worldwide (95 percent confidence interval 35.2 to 56.8), and Burkitt was the only subtype in that global meta-analysis with real regional heterogeneity in EBV positivity, with near-universal positivity in East African cases.",
      sources: [S.burkitt1958, S.burkitt1962, S.cookMozaffari, S.rochford, S.moormann, S.bednets, S.ogwang, S.mozambique, S.png, S.seerBurkitt, S.ebvFraction],
      refs: ["burkitt-lymphoma", "myc"],
    },
    {
      id: "burkitt-treatment-gap",
      title: "The same disease, two outcomes: Burkitt lymphoma and the treatment gap",
      countries: ["CMR", "TZA", "UGA", "KEN", "MWI", "NGA", "ZAF", "IND"],
      glyph: "people",
      summary: "Burkitt lymphoma is one of the fastest-growing human tumours and one of the most curable. Prompt diagnosis and intensive chemotherapy cure over 90 percent of children and adolescents in high-income countries. The African figures are not comparable, and the reason they are not comparable is itself the finding.",
      detail:
        "No five-year survival figure for Burkitt lymphoma in sub-Saharan Africa could be found. What exists is one-year survival, and setting a high-income five-year cure rate against an African one-year figure would be comparing different things, so both endpoints are named here.\n\nCameroon: 934 patients treated with cyclophosphamide and intrathecal methotrexate, a protocol chosen because it is affordable and deliverable. Overall one-year survival 53.45 percent, by stage 77.1 percent for stage I, 67.9 for stage II, 55.1 for stage III and 32.4 for stage IV. The median delay from first symptom to diagnosis was 31 days and 71.5 percent presented at stage III.\n\nTanzania: 72 children at two tertiary hospitals, one-year post-treatment survival 75 percent overall, but complete remission was 61.3 percent at one hospital and 36.6 percent at the other, with treatment abandonment at 22.0 percent against 3.2 percent. The authors say in terms that a one-year figure cannot be compared with the WHO Global Initiative for Childhood Cancer's 2030 target, which is five-year survival.\n\nThe one randomised answer to the gap is rituximab. In East Africa, children with EBV-positive Burkitt lymphoma given rituximab with the standard cyclophosphamide, vincristine and methotrexate backbone had 12-month event-free survival of 67 percent against 43 percent without it, hazard ratio 0.49, with 8 deaths against 16 and no excess of serious adverse events. Rituximab is already on the WHO Model List of Essential Medicines for Burkitt lymphoma, so the gap is supply and system rather than listing.\n\nTumour lysis syndrome is the other gap and it kills quickly. An Indian centre reported 17 of its children developing it and 6 of 22 deaths attributable to it, achieving four-year event-free survival of 72.9 percent with judicious use of single-dose rasburicase and modified-dose methotrexate: the resources that make the difference are a laboratory, dialysis and one expensive injection, not a new drug.",
      sources: [S.burkittHic, S.cameroon, S.tanzaniaBl, S.rituximabEa, S.tlsIndia, S.whoEml, S.childhoodSubtypes],
      refs: ["burkitt-lymphoma", "rituximab", "cyclophosphamide", "methotrexate"],
    },
    {
      id: "nkt-east-asia-latin-america",
      title: "East Asia and Latin America: extranodal NK/T-cell lymphoma, nasal type",
      countries: ["CHN", "KOR", "JPN", "PER", "MEX", "GTM", "HND", "SLV", "NIC", "CRI", "PAN", "DOM", "COL", "ARG", "CHL", "SGP", "THA", "VNM"],
      glyph: "microbe",
      summary: "A lymphoma that eats through the nose and palate, almost always driven by Epstein-Barr virus, and distributed in a way no other lymphoma is: common in China, Korea, Japan and parts of Latin America, rare in white Europeans and in people of African descent.",
      detail:
        "The attributable fraction settles the virology. In HIV-negative people, Epstein-Barr virus is present in 92.4 percent of extranodal NK/T-cell lymphoma (95 percent confidence interval 83.3 to 96.7), the highest of any lymphoma subtype measured in a global meta-analysis of 307 studies, against 53.0 percent for Hodgkin lymphoma, 45.8 percent for Burkitt and 10.8 percent for diffuse large B-cell lymphoma.\n\nTrue incidence rates barely exist outside two places, which is a caution rather than a detail. Taiwan's cancer registry recorded 872 new diagnoses between 2008 and 2021, with age-specific rates falling from 0.46 to 0.32 per 100,000 person-years at ages 45 to 64. The United States rate across SEER is 0.067 per 100,000. Everywhere else in east Asia and Latin America the literature reports the disease as a percentage of lymphomas, not as a rate: 11.0 percent of 4,638 lymphoid neoplasms in a Chinese series, 2.2 percent in the developing-world arm of the International Non-Hodgkin Lymphoma Classification Project against a much lower share in the developed world. A proportion is not a rate, and it confounds this disease's frequency with the local mix of everything else.\n\nThe ethnic gradient inside one country is the hardest comparison available. In the United States, incidence was 0.132 to 0.157 per 100,000 in non-Hispanic Asian or Pacific Islander and Hispanic populations against around 0.03 per 100,000 in non-Hispanic White and non-Hispanic Black populations: a four to fivefold difference within one health system. It is often said that the Latin American excess reflects Indigenous American ancestry, and that may be so, but no study has measured genomic ancestry fractions against this lymphoma's risk. What exists is registry ethnicity categories and case-series proportions, and that is what is said here.\n\nThe Latin American case-series picture is clear enough on its own. In 1,979 peripheral T-cell lymphomas across Latin America, extranodal NK/T-cell lymphoma was 15 percent of the total, rising to 41 percent of peripheral T-cell lymphomas in Central America and the Caribbean and 31 percent in Mexico. A mutational study of 71 Latin American cases from Mexico, Peru and Argentina found STAT3 the commonest mutated gene at 23 percent, and most tumours carrying type A Epstein-Barr virus without the 30-base-pair LMP1 deletion. A separate genome study of 217 EBV isolates from Guatemala, Peru, Malawi and Taiwan found that variants previously called cancer-type-specific are more closely tied to geographic origin than to histology, which is a warning about every EBV variant association in the literature.",
      sources: [S.ebvFraction, S.taiwanTrend, S.zhaoSeer, S.sunChina, S.perry, S.vose, S.au, S.haverkos, S.malpicaPtcl, S.montesMojarro, S.ebvGeographic, S.rialCyted],
      refs: ["peripheral-t-cell-lymphoma", "asparaginase"],
    },
    {
      id: "nkt-treatment-and-asparaginase",
      title: "Asparaginase, and the drug that is not on the list for the disease it treats",
      countries: ["CHN", "KOR", "JPN", "PER", "MEX", "GTM", "COL"],
      glyph: "scalpel",
      summary: "Extranodal NK/T-cell lymphoma does not respond to CHOP. It responds to asparaginase. That one fact is the difference between a median survival measured in months and a five-year survival over 80 percent in early-stage disease, and asparaginase is not listed for it on the WHO Model List of Essential Medicines.",
      detail:
        "The evidence is consistent across three continents. SMILE, the Japanese phase II study that established the approach, gave an overall response rate of 79 percent and one-year overall survival of 55 percent in stage IV, relapsed or refractory disease, at the cost of grade 4 neutropenia in 92 percent and a protocol amendment after the first two patients died of infection. P-GEMOX, pegaspargase with gemcitabine and oxaliplatin, gave an 88.8 percent response rate in 117 patients with three-year overall survival of 72.7 percent. A Chinese randomised comparison of DDGP against SMILE in 42 patients favoured DDGP on every endpoint, though 42 patients is a small trial and that has been said in print. In early-stage disease given with radiotherapy, a Chinese cooperative group analysis of 376 patients found asparaginase-based regimens improved five-year overall survival to 84.5 percent against 73.2 percent in intermediate and high-risk patients. Japan's NKEA-Next study of advanced disease found two-year overall survival of 57.1 percent with SMILE, 35.8 percent with DeVIC and zero percent with CHOP.\n\nNow the list. The 24th WHO Model List of Essential Medicines, published in 2025, carries asparaginase and pegaspargase on its complementary list with one indication each: acute lymphoblastic leukaemia. The lymphoma indications named anywhere in the document are anaplastic large cell lymphoma, Burkitt lymphoma, diffuse large B-cell lymphoma, follicular lymphoma and Hodgkin lymphoma. The words NK/T and natural killer do not appear in the document at all, and nor does adult T-cell leukaemia/lymphoma. The United States label for pegaspargase likewise carries only acute lymphoblastic leukaemia indications.\n\nSo the drug that makes this disease curable is, formally, an off-label use everywhere, and it is not on the list that national essential medicines lists are built from. The practical consequence is documented for asparaginase generally rather than for this lymphoma: short shelf lives, intermittent availability and concern about substandard formulations in low- and middle-income countries, and universal availability of top childhood cancer medicines reported by 9 to 46 percent of respondents in low-income countries against 67 to 100 percent in high-income ones. No paper documenting pegaspargase unavailability for NK/T-cell lymphoma specifically in a low-income setting could be found, and that absence is itself worth recording.",
      sources: [S.smile, S.pgemox, S.ddgp, S.clcgAsp, S.nkeaNext, S.whoEml, S.asparaginaseCost, S.denburg],
      refs: ["asparaginase", "gemcitabine", "oxaliplatin"],
    },
    {
      id: "htlv1-belt",
      title: "South-western Japan, the Caribbean and west Africa: HTLV-1 and adult T-cell leukaemia/lymphoma",
      countries: ["JPN", "PER", "COL", "BRA", "JAM", "HTI", "TTO", "GAB", "CMR", "COD", "NGA", "IRN", "ROU", "AUS", "CHL", "ARG"],
      glyph: "island",
      summary: "The first human retrovirus found to cause a cancer, and the sharpest geography in oncology. Between five and ten million people are infected with HTLV-1 worldwide, almost all of them in a handful of foci: south-western Japan, the Caribbean, parts of west and central Africa, Peru and Colombia, north-eastern Iran, Romania and Indigenous communities in central Australia. Only a few percent of carriers ever develop the lymphoma, and when they do it is usually fatal within months.",
      detail:
        "The landmark estimate, from 2012, puts the global figure at five to ten million, but says so with an explicit caveat that it rests on about 1.5 billion people in areas with reliable data and that correct estimates for China, India, the Maghreb and East Africa are not currently possible: the true number is probably higher.\n\nThe primary-source figures that could be verified are these. Central Australia: 197 of 510 adults in a community survey, 38.6 percent, were infected. French Guiana: 3.1 percent of 1,078 Creoles tested in 1998, with 137 confirmed adult T-cell leukaemia/lymphoma cases over thirty years, 69 percent of them Maroons, median age at diagnosis 43 among Maroons against 58 among Creoles. North-eastern Iran: 2.73 percent in a rural population of Afghan origin near Mashhad. Japan: at least 1.08 million carriers estimated in 2006 to 2007. Romania is the only genuine endemic focus in Europe, and the virus there traces phylogenetically to southern Africa. Several widely quoted figures, including a Jamaican prevalence of about 6.1 percent, 800,000 carriers in Brazil and two to five million in sub-Saharan Africa, come only from a 2026 narrative review's collation of other people's work and have not been traced to their primaries here.\n\nThe lifetime risk figure every clinician quotes is old. It is 4 to 6 percent for men and 2.6 percent for women, and it comes from studies published in 1989, 1990 and 2000. The 2020 Japanese review that quotes it says explicitly that there has been no other study to update the lifetime risk of adult T-cell leukaemia/lymphoma among carriers in the general Japanese population. Any number on this page is roughly thirty-five years old and that should be said whenever it is used.\n\nSurvival depends almost entirely on the Shimoyama subtype. The 1991 classification of 818 patients gave median survival of 6.2 months for acute, 10.2 for lymphoma, 24.3 for chronic and not reached for smouldering disease. A modern Japanese series of 1,594 patients gave 8.3, 10.6, 31.5 and 55.0 months and four-year overall survival of 11, 16, 36 and 52 percent, with the authors noting that the smouldering type did worse than expected. In the United States, a cohort of 195 patients, 77 percent Afro-Caribbean, gave 4.1 months for acute and 10.2 for lymphomatous disease. Peru's thirty-year series of 116 cases gave 6.5, 12.5 and 89.6 months for acute, lymphomatous and smouldering or chronic disease, and found that only 13.8 percent of patients knew they had HTLV-1 before the lymphoma, and only 8 of those through routine screening.\n\nLatin America's concentration is extraordinary. Among 1,963 mature T-cell lymphomas pooled across the region, adult T-cell leukaemia/lymphoma was 17 percent of the total, 38 percent in Peru and 29 percent in Colombia, and in Peru the share rose from 14 percent in 2000 to 2004 to 58 percent in 2019 to 2023.",
      sources: [S.gessain, S.noori, S.iwanaga, S.itoJapan, S.centralAustralia, S.frenchGuiana, S.iranHtlv, S.romania, S.shimoyama, S.katsuya, S.malpicaUs, S.peruAtl, S.valcarcel],
      refs: ["peripheral-t-cell-lymphoma", "mogamulizumab"],
    },
    {
      id: "h-pylori-malt",
      title: "Where Helicobacter pylori is common: gastric MALT lymphoma, and the cancer antibiotics cure",
      countries: ["NGA", "ITA", "KOR", "CHN", "JPN", "NLD", "CHE", "IND", "BRA", "MEX", "RUS", "TUR"],
      glyph: "grain",
      summary: "The only common cancer whose first-line treatment is a course of antibiotics. About 4.4 billion people carried Helicobacter pylori in 2015, from 18.9 percent in Switzerland to 87.7 percent in Nigeria, and in people who develop a gastric marginal zone lymphoma, eradicating the bacterium puts about three quarters of early-stage cases into complete remission with no cancer drug at all.",
      detail:
        "The first demonstration was six patients in 1993: Helicobacter was eradicated in all of them and repeated biopsies showed no lymphoma in five. The pooled figure, from a 2023 meta-analysis of 61 studies and 2,936 patients, is a complete response rate of 75.18 percent (95 percent confidence interval 70.45 to 79.91) in Helicobacter-positive early-stage gastric MALT lymphoma, with no significant difference between Asian and Western series. The largest long-term cohort, 420 Japanese patients, had 77 percent respond and, at ten years, 90 percent free of treatment failure, 95 percent alive and 86 percent event-free.\n\nThe translocation t(11;18)(q21;q21), now written BIRC3::MALT1, predicts a poorer chance of responding. The 2001 Lancet paper found it in nine of twelve non-responders and in none of the responders; the 2002 follow-up found it in 42 of 63 non-responsive cases and in 2 of 48 complete regressions. It is not a reason to skip the antibiotics. Both studies contained translocation-positive patients who did respond, and the current expert view is that antibiotic eradication is the recommended therapy of choice irrespective of genetic findings, with molecular analysis not required before starting.\n\nThe geography is real but the rates are sparse. A 1992 Lancet study found thirteen times more primary gastric lymphoma in Feltre in north-eastern Italy than in comparison UK communities, 66 against 5 per 100,000 per five years. A Dutch nationwide study put incidence at 0.41 per 100,000 a year. The translocation is commoner in Asia, and marginal zone lymphoma is the commonest indolent B-cell lymphoma diagnosed in China and Korea. No population incidence rate for gastric MALT lymphoma could be found for Korea, Japan or anywhere in Latin America: what exists there is hospital-series proportions, which are not rates.\n\nThe prevalence is falling and so is the lymphoma. Global Helicobacter prevalence fell from 58.2 percent in 1980 to 1990 to 43.1 percent in 2011 to 2022. In Modena, Italy, gastric MALT lymphoma incidence fell from 1.4 to 0.2 per 100,000 between 1997 and 2002, an annual percentage change of minus 17.0 percent, and the proportion of cases associated with Helicobacter fell from 61 to 17 percent. This is one of the few cancers in the world that is disappearing because of a public health change aimed at something else.",
      sources: [S.hooi, S.liTrend, S.wotherspoon, S.lemos, S.nakamura, S.liu2001, S.liu2002, S.raderer, S.doglioni, S.capelle, S.luminari],
      refs: ["malt-lymphoma", "marginal-zone-lymphoma"],
    },
    {
      id: "hiv-lymphoma",
      title: "Where antiretroviral coverage is thin: HIV-associated lymphoma",
      countries: ["ZAF", "MWI", "UGA", "KEN", "ZWE", "MOZ", "NGA", "CIV", "TZA", "ZMB", "CMR", "BWA", "NAM", "SWZ"],
      glyph: "people",
      summary: "Lymphoma is an HIV indicator condition, and HIV multiplies the risk of it by somewhere between eight and a hundred and fifty depending on the subtype. Combination antiretroviral therapy cut some of those risks dramatically and left others untouched, which is the most interesting fact in this part of the map.",
      detail:
        "Across 448,258 people with HIV in the United States, the standardised incidence ratio was 11.5 for non-Hodgkin lymphoma and 7.70 for Hodgkin lymphoma, and by subtype it was 10.3 for diffuse large B-cell lymphoma, 20.2 for Burkitt lymphoma, and 153 for central nervous system non-Hodgkin lymphoma: a 153-fold excess, the largest for any cancer in that study.\n\nWhat combination antiretroviral therapy did is uneven, and the unevenness is the point. Between 1990 to 1995 and 1996 to 2002, the standardised incidence ratio for non-Hodgkin lymphoma in people with AIDS in the United States fell from 53.2 to 22.6, while the ratio for Hodgkin lymphoma rose from 8.1 to 13.6. In the later study, trends declined significantly for Kaposi sarcoma, diffuse large B-cell lymphoma and central nervous system lymphoma, and were not significant for Burkitt lymphoma, cervical cancer or Hodgkin lymphoma. Treating the immune deficiency removed most of the lymphomas that depend on profound immunosuppression and left the ones that do not.\n\nSurvival still splits by subtype: five-year survival of 61.6 percent for Hodgkin lymphoma, 50.0 for Burkitt, 44.1 for diffuse large B-cell, 43.3 for other non-Hodgkin lymphoma and 22.8 for primary central nervous system lymphoma. Across five continents and 210,898 adults with HIV, South African women remained at higher risk of non-Hodgkin lymphoma than their European counterparts after adjustment, hazard ratio 1.79.\n\nThe treatment side has one landmark. The first completed trial of diffuse large B-cell lymphoma treatment in sub-Saharan Africa, in Malawi with 37 patients, reported overall survival of 68 percent at twelve months and 55 percent at twenty-four, with treatment-related mortality of 11 percent. That is what a modern regimen achieves where it can be delivered.\n\nAnd the access figures that sit underneath all of it: in 2025, 78 percent of all people living with HIV were accessing treatment globally, 85 percent in eastern and southern Africa, 74 percent in western and central Africa, 56 percent in eastern Europe and central Asia and 53 percent in the Middle East and North Africa. For children aged 0 to 14 the numbers are far worse: 41 percent in western and central Africa, 33 percent in the Caribbean, 30 percent in the Middle East and North Africa. UNAIDS also records that total international resources for the HIV response fell by 18 percent, the largest decline in almost two decades.\n\nTwo lymphomas on this map depend on a different virus. Primary effusion lymphoma, driven by Kaposi sarcoma herpesvirus, occurs more than 700 times as often in people with HIV as in the general population, with five-year overall survival of 44.5 percent in people with HIV and 15.2 percent in people without. HHV-8 multicentric Castleman disease carries a non-Hodgkin lymphoma incidence about fifteen times that expected in the HIV-positive population. The seroprevalence map for that virus is a genuine blank: it was 35.5 percent by age 21 in Uganda against 13.7 percent in Zimbabwe and 10.8 percent in South Africa, and almost half of African countries have no data at all. No reliable pooled global figure exists, because the assays are not comparable.",
      sources: [S.hernandezRamirez, S.engels, S.gopal, S.fiveContinents, S.malawiDlbcl, S.unaids, S.pel, S.kshvAfrica, S.kshvGap],
      refs: ["hiv-associated-lymphoma", "primary-cns-lymphoma", "kaposi-sarcoma", "rituximab"],
    },
    {
      id: "the-inversion",
      title: "The inversion: where lymphoma is counted, and where it kills",
      countries: ["ZWE", "UGA", "EGY", "BRN", "NAM", "WSM", "CMR", "LBN", "HND", "MOZ", "PNG", "MWI", "PER", "JAM", "KEN", "TZA", "NGA", "ETH"],
      glyph: "map",
      summary: "The single most useful number in the GLOBOCAN table for non-Hodgkin lymphoma is not incidence, and it is not mortality. It is the ratio between them, because it measures what happens to a person after the diagnosis rather than how good the country is at making one.",
      detail:
        "Computed from the GLOBOCAN 2022 country file in this repository: for non-Hodgkin lymphoma the ratio of age-standardised mortality to age-standardised incidence is 0.16 in Denmark, 0.20 in the United States, 0.22 in Australia, 0.25 in the United Kingdom, Italy and France, 0.27 in Japan and 0.29 in Canada. It is 0.58 in India and South Africa, 0.62 in Viet Nam, 0.63 in Malawi, 0.69 in Ethiopia, 0.72 in Kenya, Nigeria and Zimbabwe, 0.75 in Uganda and Tanzania and 0.77 in Mozambique.\n\nFor Hodgkin lymphoma, the most curable common cancer in the world, the same calculation is starker: 0.06 in the United States and Australia, 0.07 in Canada, France and Germany, 0.08 in the United Kingdom and Denmark, 0.09 in Italy, Israel and Korea. And then 0.26 in South Africa, 0.35 in China, 0.37 in India, 0.47 in Nigeria, 0.49 in Kenya and Malawi, 0.54 in Mozambique, 0.58 in Uganda and 0.70 in Tanzania. A disease that almost nobody in western Europe dies of still kills a large share of the people who get it in east Africa.\n\nGlobally, GLOBOCAN 2022 put non-Hodgkin lymphoma at 553,389 new cases and 250,679 deaths, and Hodgkin lymphoma at 82,469 cases and 22,733 deaths. The 2024 vintage, published in 2026, puts non-Hodgkin lymphoma at 562,793 cases and 234,903 deaths and Hodgkin lymphoma at 84,495 and 19,515. Asia carries 44.5 percent of the world's non-Hodgkin lymphoma cases and Europe 22.9 percent.\n\nTwo warnings travel with any ranking here. IARC grades its own estimates, and a country's rate may be modelled from national mortality using mortality-to-incidence ratios derived from registry data elsewhere: half the Hodgkin lymphoma incidence top ten are modelled this way, and the Hodgkin top ten reshuffles almost completely between the 2022 and 2024 vintages while the world total barely moves. Ranking countries by Hodgkin lymphoma incidence is not a safe thing to do, and this page does not do it. Second, the Global Burden of Disease study does not agree with GLOBOCAN: GBD 2021 gives 604,554 non-Hodgkin lymphoma cases and 267,061 deaths for the same world, and puts Peru top of every country for incidence at an age-standardised 24.00 per 100,000, which GLOBOCAN does not. No source explains the discrepancy, so it is reported rather than resolved.\n\nThe Global Burden of Disease analysis does say the thing this section is about, in one sentence: high socio-demographic index regions had the highest age-standardised incidence but the fastest mortality declines, whereas low socio-demographic index areas had the highest age-standardised mortality and minimal improvement, with eastern sub-Saharan Africa at the peak.",
      sources: [S.gco, S.gcoApi, S.gco2024Nhl, S.gco2024Hl, S.gbdNhl, S.gbdSdi, S.gbdHl, S.concord3],
      refs: ["hodgkin-lymphoma", "dlbcl"],
    },
  ],
  programmes: [
    {
      id: "japan-htlv1-screening",
      country: "JPN",
      title: "Japan: antenatal HTLV-1 screening, and the only national programme against a lymphoma virus",
      glyph: "flag",
      what: ["Antibody screening offered to all pregnant women, nationwide since 2010", "Exclusive formula feeding advised for carriers", "No other country runs one"],
      detail:
        "About 95 percent of mother-to-child transmission of HTLV-1 comes from prolonged breastfeeding. Japan is the only country in the world that screens all pregnant women for the antibody; a 2023 review states plainly that the test is currently unavailable to all pregnant women in countries other than Japan, and that the nationwide programme has run since 2010.\n\nIt works. The Nagasaki ATL Prevention Program cut the transmission rate from 20.3 percent to 2.5 percent with exclusive formula feeding, and a systematic review puts the effect of avoiding breastfeeding at preventing 85 percent of transmissions. Breastfeeding for three months or less did not significantly raise risk compared with exclusive formula feeding; up to six months raised it almost threefold.\n\nThe carriers are disappearing from the obstetric population. A 2025 nationwide survey covering 461,271 deliveries, 67.2 percent of all births in Japan, found 331 carriers, 0.07 percent, rising to 0.25 percent in Kyushu and Okinawa, and the rate was lower in women born since 1990 (0.04 percent) than before (0.09 percent). The same survey found that 16.3 percent of multiparous carriers had previously tested negative, which points at horizontal transmission in adulthood, particularly in the big urban regions, and is the programme's new problem.\n\nThe lymphoma itself has not moved yet, because it takes decades to appear: deaths from adult T-cell leukaemia/lymphoma in Japan stayed at around 1,000 a year from 1999 to 2017. Two-thirds of cases diagnosed in 2010 to 2011 were still in Kyushu and Okinawa, and more than half the patients in the big cities were born there.",
      sources: [S.itabashi, S.rosadas, S.ogoyama, S.iwanaga, S.itoJapan],
      refs: ["peripheral-t-cell-lymphoma"],
    },
    {
      id: "bed-nets-burkitt",
      country: "UGA",
      title: "Sub-Saharan Africa: bed nets, and cancer control by mosquito control",
      glyph: "microbe",
      what: ["Insecticide-treated nets distributed at scale for malaria", "Burkitt lymphoma incidence fell 44 percent after introduction", "No cancer programme was involved"],
      detail:
        "Nobody distributed insecticide-treated nets in order to prevent lymphoma. The effect was found afterwards, by assembling 66 data points on Burkitt lymphoma incidence covering 5,226 cases from 17 countries where nets had been rolled out at scale.\n\nRates were 44 percent lower after introduction than before (95 percent confidence interval 12 to 64 percent), with adjusted pooled incidence of 1.36 per 100,000 person-years before and 0.76 after. Adjusting for confounders, each one percentage point increase in mean net use in the population over the preceding ten years was associated with a 2 percent reduction in Burkitt lymphoma incidence.\n\nThat is the strongest evidence anywhere that the malaria half of the malaria-and-Epstein-Barr model is causal rather than coincidental, and it comes from a malaria programme. It also means the childhood cancer burden in the belt is partly a function of how well the bed-net programme is funded, which is not a sentence anyone writing about cancer control usually has to write.",
      sources: [S.bednets, S.rochford, S.moormann],
      refs: ["burkitt-lymphoma"],
    },
    {
      id: "korea-registry",
      country: "KOR",
      title: "Korea: what a national registry can show about thirty years of lymphoma",
      glyph: "registry",
      what: ["Korea Central Cancer Registry reports both lymphomas separately", "Five-year relative survival tracked from 1993 to 2023", "Age-standardised to the Segi world population, so comparable with Japan and GLOBOCAN"],
      detail:
        "Korea publishes what very few countries do: a thirty-year run of five-year relative survival for Hodgkin and non-Hodgkin lymphoma separately, on a consistent standard.\n\nIn 2023 there were 356 new Hodgkin lymphoma cases, 52 deaths and 4,428 people living with the diagnosis, and 6,109 new non-Hodgkin lymphoma cases, 2,144 deaths and 48,916 people living with it. The age-standardised incidence was 0.6 per 100,000 for Hodgkin lymphoma and 6.3 for non-Hodgkin lymphoma.\n\nThe survival trend is the point. Five-year relative survival for Hodgkin lymphoma rose from 70.1 percent in 1993 to 1995 to 87.0 percent in 2019 to 2023, and for non-Hodgkin lymphoma from 48.2 percent to 66.0 percent. For scale, survival across all cancers in Korea rose from 42.9 percent to 73.7 percent over the same period, so lymphoma improved roughly in line with everything else rather than ahead of it.\n\nIncidence is rising for both: Hodgkin lymphoma from an age-standardised 0.3 to 0.6 per 100,000, an annual percentage change of plus 3.3 percent, and non-Hodgkin lymphoma from 4.3 to 6.3, rising 2.3 percent a year to 2020 and flat since. Non-Hodgkin lymphoma mortality fell 1.2 percent a year. Non-Hodgkin lymphoma is also the third commonest childhood cancer in Korea, at 8.1 percent of cancers in 0 to 14 year olds, behind leukaemia and brain tumours.",
      sources: [S.korea],
      refs: ["hodgkin-lymphoma", "non-hodgkin-lymphoma"],
    },
  ],
  figures: [
    { label: "New non-Hodgkin lymphoma cases", value: "553,389, age-standardised rate 5.57 per 100,000", place: "World", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi, note: "The 2024 vintage, published in 2026, gives 562,793 cases and an age-standardised rate of 5.4. Asia carries 44.5 percent of them and Europe 22.9 percent." },
    { label: "Deaths from non-Hodgkin lymphoma", value: "250,679, age-standardised rate 2.38 per 100,000", place: "World", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi, note: "The 2024 vintage gives 234,903 deaths and a rate of 2.1." },
    { label: "New Hodgkin lymphoma cases and deaths", value: "82,469 cases and 22,733 deaths", place: "World", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi, note: "The 2024 vintage gives 84,495 cases and 19,515 deaths. Hodgkin lymphoma is the 26th commonest cancer in the world and the 28th commonest cause of cancer death." },
    { label: "Countries with the highest non-Hodgkin lymphoma mortality rate", value: "Zimbabwe 7.38, Uganda 5.50, Egypt 5.16, Brunei 5.09, Namibia 4.92, Samoa 4.92, Cameroon 4.75 per 100,000", place: "World (185 countries)", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi, note: "No high-income country appears in the top fifteen. The incidence top seven, by contrast, is Malta, Denmark, Israel, the United States, Australia, Canada and the Netherlands." },
    { label: "Ratio of mortality rate to incidence rate, non-Hodgkin lymphoma", value: "0.16 in Denmark and 0.20 in the United States, against 0.75 in Uganda and 0.77 in Mozambique", place: "World", period: "2022 (GLOBOCAN estimates; ratio computed here from the published rates)", source: S.gcoApi },
    { label: "Ratio of mortality rate to incidence rate, Hodgkin lymphoma", value: "0.06 in the United States, 0.08 in the United Kingdom, against 0.58 in Uganda and 0.70 in Tanzania", place: "World", period: "2022 (GLOBOCAN estimates; ratio computed here from the published rates)", source: S.gcoApi, note: "Hodgkin lymphoma is the clearest case in oncology of a disease whose outcome is decided by where you live rather than what you have." },
    { label: "Epstein-Barr virus prevalence in extranodal NK/T-cell lymphoma, HIV-negative people", value: "92.4% (95% CI 83.3 to 96.7)", place: "World (meta-analysis of 307 studies)", period: "2026", source: S.ebvFraction, note: "Against 53.0 percent in Hodgkin lymphoma, 45.8 percent in Burkitt lymphoma, 52.5 percent in plasmablastic lymphoma, 10.8 percent in diffuse large B-cell lymphoma and 5.1 percent in follicular lymphoma." },
    { label: "Burkitt lymphoma incidence after insecticide-treated bed nets", value: "44% lower (95% CI 12 to 64), from 1.36 to 0.76 per 100,000 person-years", place: "17 sub-Saharan African countries", period: "Before and after net introduction, meta-analysis 2024", source: S.bednets },
    { label: "People infected with HTLV-1", value: "5 to 10 million, probably more", place: "World", period: "2012 estimate", source: S.gessain, note: "The estimate rests on about 1.5 billion people in areas with reliable data; the authors say correct estimates for China, India, the Maghreb and East Africa are not currently possible." },
    { label: "HTLV-1 prevalence among Indigenous adults in a Central Australian community survey", value: "38.6% (197 of 510)", place: "Central Australia", period: "2023", source: S.centralAustralia },
    { label: "Median survival in adult T-cell leukaemia/lymphoma, by subtype", value: "8.3 months acute, 10.6 lymphoma, 31.5 chronic, 55.0 smouldering", place: "Japan (1,594 patients)", period: "2015", source: S.katsuya, note: "Four-year overall survival was 11, 16, 36 and 52 percent. The 1991 classification of 818 patients that defined these subtypes gave 6.2, 10.2 and 24.3 months, with smouldering not reached." },
    { label: "People carrying Helicobacter pylori", value: "around 4.4 billion", place: "World", period: "2015", source: S.hooi, note: "Africa had the highest pooled prevalence at 70.1 percent and Oceania the lowest at 24.4 percent, with a country range from 18.9 percent in Switzerland to 87.7 percent in Nigeria. Global prevalence fell from 58.2 percent in 1980 to 1990 to 43.1 percent in 2011 to 2022." },
    { label: "Complete response of early-stage gastric MALT lymphoma to Helicobacter eradication alone", value: "75.18% (95% CI 70.45 to 79.91)", place: "World (61 studies, 2,936 patients)", period: "2023 meta-analysis", source: S.lemos, note: "No significant difference between Asian and Western series." },
    { label: "Excess risk of central nervous system non-Hodgkin lymphoma in people with HIV", value: "153-fold (95% CI 140 to 167)", place: "United States (448,258 people with HIV)", period: "1996 to 2012", source: S.hernandezRamirez, note: "Burkitt lymphoma 20.2-fold, diffuse large B-cell lymphoma 10.3-fold, all non-Hodgkin lymphoma 11.5-fold, Hodgkin lymphoma 7.70-fold." },
    { label: "People living with HIV who are on antiretroviral treatment", value: "78% globally; 85% eastern and southern Africa, 74% western and central Africa, 56% eastern Europe and central Asia, 53% Middle East and North Africa", place: "World", period: "2025", source: S.unaids, note: "For children aged 0 to 14 the figures are 41 percent in western and central Africa, 33 percent in the Caribbean and 30 percent in the Middle East and North Africa. Total international resources for the HIV response fell by 18 percent, the largest decline in almost two decades." },
    { label: "New non-Hodgkin lymphoma cases and deaths", value: "an estimated 79,320 cases and 19,970 deaths; five-year relative survival 74.3%", place: "United States", period: "2026 estimate; survival 2016 to 2022", source: S.seerNhl, note: "The rate of new cases was 18.7 per 100,000 a year and the death rate 4.8, from 2019 to 2023 cases and 2020 to 2024 deaths. 21.0 percent are diagnosed at stage I, where five-year relative survival is 87.6 percent." },
    { label: "New Hodgkin lymphoma cases and deaths", value: "an estimated 8,920 cases and 1,100 deaths; five-year relative survival 89.3%", place: "United States", period: "2026 estimate; survival 2016 to 2022", source: S.seerHl, note: "2.5 new cases and 0.2 deaths per 100,000 a year. 13.0 percent are diagnosed at stage I, where five-year relative survival is 92.7 percent." },
    { label: "Malignant lymphoma: new cases", value: "37,601 (20,073 men, 17,528 women), age-standardised rate 10.55 per 100,000", place: "Japan", period: "2023 (national cancer registry)", source: S.ganjohoInc, note: "By component: Hodgkin lymphoma 1,536 (rate 0.77), follicular 9,580, non-follicular 17,963, mature T and NK-cell 2,946, other and unspecified non-Hodgkin 5,428. Japan publishes no single non-Hodgkin lymphoma row; a total of 35,917 is arithmetic, not a published figure." },
    { label: "Malignant lymphoma: deaths", value: "13,920, age-standardised rate 2.22 per 100,000", place: "Japan", period: "2024 (vital statistics)", source: S.ganjohoMort, note: "The mortality file carries no Hodgkin and non-Hodgkin split." },
    { label: "Five-year relative survival, 1993 to 1995 against 2019 to 2023", value: "Hodgkin lymphoma 70.1% to 87.0%; non-Hodgkin lymphoma 48.2% to 66.0%", place: "Korea", period: "1993 to 2023", source: S.korea, note: "Across all cancers in Korea the same measure went from 42.9 percent to 73.7 percent. In 2023 there were 356 new Hodgkin and 6,109 new non-Hodgkin lymphoma cases." },
    { label: "Lymphomas diagnosed histologically", value: "non-Hodgkin lymphoma 1,248 in men and 1,094 in women; Hodgkin lymphoma 348 and 310; Burkitt lymphoma 59 and 29", place: "South Africa", period: "2024", source: S.southAfrica, note: "A pathology-based registry: the table's own title says these are cancers diagnosed histologically, so cases that never reach a laboratory are not counted. South Africa is one of very few registries publishing Burkitt lymphoma as its own line." },
    { label: "Five-year age-standardised net survival for lymphoid malignancies in adults", value: "Switzerland 72.0%, United States 68.1%, United Kingdom 64.9%, Japan 57.3%, Korea 52.5%, Brazil 46.2%, China 38.3%, Thailand 35.0%, Chile 32.5%", place: "World (CONCORD-3)", period: "Diagnosed 2010 to 2014", source: S.concord3, note: "A 39.5 percentage point range. CONCORD-3 bundles Hodgkin lymphoma, every non-Hodgkin subtype, myeloma and chronic lymphocytic leukaemia into one lymphoid group: it reports no separate figure for diffuse large B-cell lymphoma or for adult Hodgkin lymphoma, and this is not relative survival, so it cannot be compared with the SEER or Korean figures above." },
  ],
  prevention: [
    {
      id: "malaria-control",
      title: "Malaria control, as cancer control",
      glyph: "microbe",
      strength: "consistent",
      evidence:
        "The bed-net meta-analysis is the hardest evidence that anything prevents a lymphoma. Across 66 data points and 5,226 Burkitt lymphoma cases in 17 countries, incidence was 44 percent lower after insecticide-treated nets were introduced, and each percentage point of population net use over the preceding decade was associated with a 2 percent reduction. The mechanism is coherent: recurrent Plasmodium falciparum infection drives the B-cell activation in which the MYC translocation happens, which is why Burkitt lymphoma behaves as a tumour of malaria survivors and peaks years after the age of greatest malaria mortality.",
      sources: [S.bednets, S.rochford, S.moormann],
      refs: ["burkitt-lymphoma", "myc"],
    },
    {
      id: "h-pylori-eradication",
      title: "Helicobacter pylori eradication",
      glyph: "grain",
      strength: "consistent",
      evidence:
        "Both as treatment and, at population scale, as prevention. Eradication puts about three quarters of early-stage gastric MALT lymphomas into complete remission, and where the bacterium is being eradicated for other reasons the lymphoma is disappearing: in Modena, incidence fell from 1.4 to 0.2 per 100,000 between 1997 and 2002, an annual change of minus 17.0 percent, with the Helicobacter-associated share of cases falling from 61 to 17 percent. Global prevalence fell from 58.2 percent in 1980 to 1990 to 43.1 percent in 2011 to 2022, so this is a cancer that is becoming rarer as a side effect of general gastroenterology.",
      sources: [S.lemos, S.luminari, S.liTrend, S.hooi],
      refs: ["malt-lymphoma"],
    },
    {
      id: "htlv1-mtct",
      title: "Preventing mother-to-child transmission of HTLV-1",
      glyph: "island",
      strength: "consistent",
      evidence:
        "Around 95 percent of mother-to-child transmission comes from prolonged breastfeeding, and avoiding breastfeeding prevents about 85 percent of transmissions. Japan's Nagasaki programme cut transmission from 20.3 percent to 2.5 percent with exclusive formula feeding. The intervention is cheap; the obstacle is that only Japan screens pregnant women nationally, and that formula feeding is not a neutral recommendation everywhere it would be needed. Avoidance of breastfeeding is recommended in Japan, Brazil, Colombia, Canada, Chile, Uruguay, the United States and parts of French Guiana.",
      sources: [S.itabashi, S.rosadas, S.ogoyama],
      refs: ["peripheral-t-cell-lymphoma"],
    },
    {
      id: "antiretroviral-therapy",
      title: "Antiretroviral therapy",
      glyph: "people",
      strength: "mixed",
      evidence:
        "Mixed, and the mixture is informative. Combination antiretroviral therapy cut the standardised incidence ratio for non-Hodgkin lymphoma in people with AIDS in the United States from 53.2 to 22.6 between 1990 to 1995 and 1996 to 2002, with significant declines for diffuse large B-cell lymphoma and central nervous system lymphoma. Over the same period the ratio for Hodgkin lymphoma rose from 8.1 to 13.6, and later trend analysis found no significant decline for Burkitt lymphoma or Hodgkin lymphoma. Treating the immune deficiency removes the lymphomas that depend on profound immunosuppression and leaves the others.",
      sources: [S.engels, S.hernandezRamirez, S.unaids],
      refs: ["hiv-associated-lymphoma", "primary-cns-lymphoma"],
    },
    {
      id: "getting-the-drug-there",
      title: "Getting the drug to where the disease is",
      glyph: "scalpel",
      strength: "suggestive",
      evidence:
        "Not prevention in the usual sense, but the lever with the largest measured effect on lymphoma mortality in low-income settings. Adding rituximab, a medicine already on the WHO Model List of Essential Medicines for Burkitt lymphoma, to standard chemotherapy in East Africa raised 12-month event-free survival from 43 to 67 percent and halved deaths, with no excess of serious adverse events. The constraint is supply, cold chain, diagnosis and the money to pay for it, not evidence or listing. Asparaginase, by contrast, is a listing problem as well: it is on the essential medicines list only for acute lymphoblastic leukaemia, and the words NK/T and natural killer appear nowhere in the 24th list.",
      sources: [S.rituximabEa, S.whoEml, S.denburg, S.asparaginaseCost],
      refs: ["rituximab", "asparaginase", "burkitt-lymphoma"],
    },
  ],
  spotlights: [
    {
      id: "japan",
      country: "JPN",
      flag: "JP",
      title: "Japan",
      lede: "The only country with a national programme against a lymphoma virus, and the country where the lymphoma it prevents is concentrated.",
      points: [
        "At least 1.08 million HTLV-1 carriers were estimated in 2006 to 2007, and about 4,000 adults and adolescents are newly infected each year, three times more often women than men.",
        "Two-thirds of adult T-cell leukaemia/lymphoma cases diagnosed in 2010 to 2011 were in Kyushu and Okinawa, and more than half the patients diagnosed in the big cities were born there.",
        "Antenatal HTLV-1 antibody screening has been offered to all pregnant women nationwide since 2010. No other country does this.",
        "Carrier prevalence among pregnant women is now 0.07 percent nationally and 0.25 percent in Kyushu and Okinawa, and it is lower in women born since 1990 than before.",
        "Deaths from adult T-cell leukaemia/lymphoma have stayed at around 1,000 a year from 1999 to 2017: the disease takes decades to appear, so the programme's effect is still to come.",
        "Mogamulizumab was approved in Japan for relapsed or refractory adult T-cell leukaemia/lymphoma in 2012 and for peripheral and cutaneous T-cell lymphoma in 2014. In the United States the same drug is licensed only for mycosis fungoides and Sezary syndrome: the disease it was developed for is not a United States indication.",
      ],
      figures: [
        { label: "Malignant lymphoma: new cases", value: "37,601, age-standardised rate 10.55 per 100,000", place: "Japan", period: "2023", source: S.ganjohoInc },
        { label: "Hodgkin lymphoma: new cases", value: "1,536, age-standardised rate 0.77 per 100,000", place: "Japan", period: "2023", source: S.ganjohoInc },
        { label: "HTLV-1 carrier prevalence among pregnant women", value: "0.07% nationally, 0.25% in Kyushu and Okinawa", place: "Japan", period: "2025 survey of 461,271 deliveries", source: S.ogoyama },
        { label: "Lifetime risk of adult T-cell leukaemia/lymphoma in an HTLV-1 carrier", value: "4 to 6% in men, 2.6% in women", place: "Japan", period: "Estimated 1989 to 2000; not updated since", source: S.iwanaga, note: "The 2020 review that quotes these figures says there has been no other study to update them. Any number here is about thirty-five years old." },
      ],
      sources: [S.iwanaga, S.itoJapan, S.itabashi, S.ogoyama, S.ishidaMoga, S.mogaFda, S.ganjohoInc],
      refs: ["peripheral-t-cell-lymphoma", "mogamulizumab", "hodgkin-lymphoma"],
    },
    {
      id: "peru",
      country: "PER",
      flag: "PE",
      title: "Peru",
      lede: "The country where the T-cell lymphomas of two different viruses meet, and where almost nobody knows they are a carrier until the lymphoma arrives.",
      points: [
        "Adult T-cell leukaemia/lymphoma was 38 percent of all mature T-cell lymphomas in the Peruvian arm of a pooled Latin American cohort, the highest share anywhere in the region, and the share rose from 14 percent in 2000 to 2004 to 58 percent in 2019 to 2023.",
        "In a thirty-year Peruvian series of 116 confirmed cases, only 13.8 percent knew they had HTLV-1 before the lymphoma developed, and only 8 of those found out through routine screening.",
        "Median survival in that series was 6.5 months for acute, 12.5 for lymphomatous and 89.6 for smouldering or chronic disease.",
        "Peru also has one of the Latin American concentrations of extranodal NK/T-cell lymphoma: 17 of the 71 Latin American cases in a mutational study came from Peru, and the regional cohort found the subtype at 15 percent of peripheral T-cell lymphomas overall.",
        "Peru's non-Hodgkin lymphoma mortality rate, 4.07 per 100,000, places it in the world's top fifteen; its incidence rate, 9.58, does not place it in the top fifteen for incidence.",
        "The Global Burden of Disease study puts Peru top of every country in the world for non-Hodgkin lymphoma incidence at an age-standardised 24.00 per 100,000. GLOBOCAN does not. No source explains the discrepancy and it is not resolved here.",
      ],
      figures: [
        { label: "New non-Hodgkin lymphoma cases and deaths", value: "3,897 cases (rate 9.58) and 1,731 deaths (rate 4.07) per 100,000", place: "Peru", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi },
        { label: "Share of mature T-cell lymphomas that are adult T-cell leukaemia/lymphoma", value: "38% (158 of 414)", place: "Peru", period: "2000 to 2023", source: S.valcarcel },
        { label: "People diagnosed with HTLV-1 before the lymphoma developed", value: "13.8% (16 of 116)", place: "Peru", period: "30-year series to 2026", source: S.peruAtl },
      ],
      sources: [S.valcarcel, S.peruAtl, S.malpicaPtcl, S.montesMojarro, S.gcoApi, S.gbdNhl],
      refs: ["peripheral-t-cell-lymphoma"],
    },
    {
      id: "uganda",
      country: "UGA",
      flag: "UG",
      title: "Uganda",
      lede: "Where Burkitt lymphoma was described, where Epstein-Barr virus was discovered, and where the gap between what lymphoma costs a country and what it need cost is widest.",
      points: [
        "Denis Burkitt described the jaw sarcoma in Ugandan children in 1958 and then mapped its climatic limits; Epstein-Barr virus was found in a Ugandan Burkitt tumour in 1964, the first human cancer virus.",
        "Northern Uganda's age-standardised Burkitt lymphoma incidence was 2.4 per 100,000, rising to 4.1 in 5 to 9 year olds, and varying three to fourfold between districts. Median age 6 years; 56 percent presented with abdominal tumours and 35 percent with facial tumours only.",
        "Uganda's non-Hodgkin lymphoma mortality rate, 5.50 per 100,000, is the second highest in the world. Its incidence rate, 7.36, is unremarkable.",
        "The ratio of mortality rate to incidence rate is 0.75 for non-Hodgkin lymphoma and 0.58 for Hodgkin lymphoma, against 0.25 and 0.08 in the United Kingdom.",
        "Kaposi sarcoma herpesvirus seroprevalence reached 35.5 percent by age 21 in Uganda, against 13.7 percent in Zimbabwe and 10.8 percent in South Africa; almost half of African countries have no data on it at all.",
        "The intervention with the best evidence behind it in Uganda is not an oncology programme. It is the bed net.",
      ],
      figures: [
        { label: "New non-Hodgkin lymphoma cases and deaths", value: "2,269 cases (rate 7.36) and 1,492 deaths (rate 5.50) per 100,000", place: "Uganda", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi, note: "The second highest non-Hodgkin lymphoma mortality rate of the 185 countries GLOBOCAN covers." },
        { label: "New Hodgkin lymphoma cases and deaths", value: "392 cases (rate 1.22) and 189 deaths (rate 0.71) per 100,000", place: "Uganda", period: "2022 (GLOBOCAN estimates)", source: S.gcoApi },
        { label: "Endemic Burkitt lymphoma: age-standardised incidence", value: "2.4 per 100,000, and 4.1 per 100,000 at ages 5 to 9", place: "Northern Uganda", period: "Published 2008", source: S.ogwang },
        { label: "Kaposi sarcoma herpesvirus seroprevalence by age 21", value: "35.5%", place: "Uganda", period: "2010", source: S.kshvAfrica },
      ],
      sources: [S.burkitt1958, S.burkitt1962, S.ogwang, S.gcoApi, S.kshvAfrica, S.bednets, S.moormann],
      refs: ["burkitt-lymphoma", "kaposi-sarcoma"],
    },
  ],
  gaps: [
    "No study has measured genomic ancestry fractions against the risk of extranodal NK/T-cell lymphoma. The claim that the Latin American excess reflects Indigenous American ancestry rests on registry ethnicity categories, case-series proportions and review assertions, and is written here as that rather than as a measured association.",
    "No population incidence rate for extranodal NK/T-cell lymphoma exists for China, Korea, Japan, Peru, Mexico or Guatemala. The only true rates reachable are Taiwan's and the United States'. Everywhere else the literature reports the disease as a percentage of lymphomas, which confounds its frequency with the local mix of other lymphomas.",
    "Taiwan has no row in the GLOBOCAN country file, so it cannot be shown on the map even though it has the best incidence time series for the disease.",
    "No paper documenting pegaspargase unavailability for NK/T-cell lymphoma specifically in a low-income setting could be found. The WHO essential medicines listing and the United States label are the hard evidence for the gap; the access literature cited alongside them is about asparaginase for childhood leukaemia and about essential medicines generally, and is labelled as such.",
    "The lifetime risk of adult T-cell leukaemia/lymphoma in an HTLV-1 carrier has not been re-estimated since 2000. The 4 to 6 percent and 2.6 percent figures trace to studies published in 1989, 1990 and 2000, which were not read directly here.",
    "Primary sources could not be found for several widely quoted HTLV-1 prevalence figures: Jamaica about 6.1 percent, Brazil 800,000 carriers, sub-Saharan Africa two to five million, Gabon 8.7 and 12.5 percent, and Japan 534,000 carriers in 2020. All come from one 2026 narrative review's collation. Mogamulizumab's European authorisation was not checked, and its availability in Brazil, Peru, the Caribbean and Australia was not looked at.",
    "No Burkitt lymphoma figure for Papua New Guinea newer than 2005 could be found, and no five-year survival figure for Burkitt lymphoma anywhere in sub-Saharan Africa. The African figures available are one-year survival and twelve-month event-free survival, so the high-income cure rate of over 90 percent cannot be compared with them like for like.",
    "Denis Burkitt's 1958 paper has no abstract in Europe PMC and the full text is paywalled, so the citation is verified but nothing is quoted from it.",
    "No reliable pooled global seroprevalence of Kaposi sarcoma herpesvirus by region exists. Almost half of African countries have no data at all and the assays are not comparable between studies; a planned systematic review was registered and never published results.",
    "No standalone paper reporting primary central nervous system lymphoma incidence before and after combination antiretroviral therapy, with its own rates, could be found. The 153-fold standardised incidence ratio and the significant declining trend are both from the same registry-linkage study.",
    "No population incidence rate for gastric MALT lymphoma could be found for Korea, Japan or anywhere in Latin America; only hospital-series proportions, which are not rates. The verified rates are Dutch and Italian.",
    "The Global Burden of Disease study and GLOBOCAN disagree about the same world: GBD 2021 gives about 51,000 more non-Hodgkin lymphoma cases and 16,000 more deaths, and puts Peru first in the world for incidence where GLOBOCAN does not. No source explains the discrepancy and it is reported rather than resolved.",
    "IARC publishes no confidence or uncertainty intervals for GLOBOCAN country figures from the factsheet endpoint, so none is attached to any rate here. Many country rates are modelled rather than observed; a country's grade should be checked before any ranking is taken seriously.",
    "CONCORD-3 reports no separate survival figure for diffuse large B-cell lymphoma or for adult Hodgkin lymphoma. It analyses adults in two broad groups, and the lymphoid group bundles Hodgkin lymphoma, every non-Hodgkin subtype, myeloma and chronic lymphocytic leukaemia. Any page attributing a per-country DLBCL or Hodgkin survival figure to CONCORD-3 would be wrong.",
    "Japan publishes no single non-Hodgkin lymphoma figure: the national registry reports malignant lymphoma as one line with components by ICD code, and the mortality file carries no Hodgkin and non-Hodgkin split. Japanese lymphoma survival was not retrieved; the available file ends at 2011.",
    "Brazil's national institute publishes only the top ten sites per sex, so no Brazilian Hodgkin lymphoma figure is verified here, and its non-Hodgkin figures are estimates rather than observed counts. Chile's and Colombia's national registries were not reached.",
    "South Africa's registry is pathology-based: the table's own title says the cancers were diagnosed histologically, so cases that never reach a laboratory are not counted. The report contains no sentence quantifying that under-ascertainment.",
  ],
};

const spike: Spike = { cancerId: "non-hodgkin-lymphoma", entities: [], patch: {} };

export default spike;

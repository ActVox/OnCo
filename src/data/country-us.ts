/**
 * United States deep dive: the hand-written cards for /countries/us/. Plain English first, detail second, every
 * card with its sources. Entity lists (institutions, companies, trials, papers, people) are pulled from the graph
 * on the page by id so they stay in sync with the corpus. Figures are quoted only where the linked source states
 * them, with the cohort and the year the source gives.
 *
 * Why this page is not a second copy of the rest of OnCo. The United States is the largest presence in the corpus
 * by a wide margin (151 institutions, 660 companies, 498 people with a US affiliation), so a page built from our
 * own records would say what is true of oncology rather than what is true of the country. Everything here is about
 * the country: who pays, what a person is billed, what the regulator does and does not require, how a drug becomes
 * payable after it is approved, what the research system uniquely does, and who it misses. Per-product coverage
 * mechanics live at /coverage/us/ and are linked rather than repeated.
 *
 * Read on 25 September 2026: the FDA's four oncology accelerated-approval tables, cancer.gov (budget, cancer
 * centers, NCTN), ncorp.cancer.gov, seer.cancer.gov, medicare.gov, healthcare.gov, census.gov, and the papers
 * cited by DOI below. The accelerated-approval medians in US_ACCELERATED are computed here from the FDA tables and
 * are not FDA-published statistics; the computation is described on the record.
 */
import { ACCELERATED_APPROVALS, ACCELERATED_READ_ON, ACCELERATED_TABLES, ACCELERATED_UNMATCHED } from "./accelerated-approvals";
import { intervalYears, longDate, summarise, type AcceleratedRow, type AcceleratedSummary } from "@/lib/accelerated";

export type CountryCard = { id: string; title: string; plain: string; detail: string; links: Array<{ label: string; url: string }> };

export const US_ASOF = "2026-09-25";

/** Cancer profile: what is different about cancer in the United States. GLOBOCAN 2022 figures render live from public/globocan/countries.json. */
export const US_PROFILE: CountryCard[] = [
  {
    id: "burden",
    title: "Two million diagnoses a year, and a death rate that has fallen every year since 1991",
    plain: "The American Cancer Society projects about 2.11 million new cancers and 626,000 cancer deaths in the United States in 2026. The rate of dying from cancer has fallen for more than thirty years, and five-year survival has passed 70 per cent for the first time. Lung cancer still kills more Americans than colorectal and pancreatic cancer combined.",
    detail: "Cancer Statistics, 2026 projects 2,114,850 new cases and 626,140 deaths, using incidence from central cancer registries through 2022 and mortality from the National Center for Health Statistics through 2023. The mortality rate has declined continuously since 1991, averting 4.8 million deaths, which the authors attribute to falling smoking, earlier detection and better treatment. Five-year relative survival reached 70 per cent for diagnoses in 2015 to 2021, against 63 per cent in the mid-1990s: 69 per cent for regional-stage and 35 per cent for distant-stage disease, up from 54 and 17 per cent. The largest gains were in the most fatal cancers, including myeloma (32 to 62 per cent), liver (7 to 22), metastatic melanoma (16 to 35) and metastatic lung cancer (2 to 10). GLOBOCAN 2022 puts the American age-standardised incidence at 366.95 per 100,000 and mortality at 82.33, the fourth highest incidence of 186 countries (behind Australia, New Zealand and Denmark) on 2.38 million cases, and a mortality-to-incidence ratio of 0.22, the second lowest of the 33 countries with more than 100,000 cases. A high incidence with a low ratio is what heavy screening and effective treatment look like together; it is also what over-diagnosis looks like, and the two cannot be separated from these figures alone.",
    links: [
      { label: "Siegel et al, Cancer statistics, 2026 (CA Cancer J Clin)", url: "https://doi.org/10.3322/caac.70043" },
      { label: "GLOBOCAN 2022: United States fact sheet (IARC)", url: "https://gco.iarc.who.int/media/globocan/factsheets/populations/840-united-states-of-america-fact-sheet.pdf" },
    ],
  },
  {
    id: "registries",
    title: "How the United States counts cancer: NPCR for everyone, SEER for research",
    plain: "Two systems count American cancers. The CDC's National Program of Cancer Registries covers essentially the whole population and produces the official national statistics. The NCI's SEER programme covers about 46 per cent of the population in much greater detail, and is the file almost every American cancer study is built on. SEER records only the first course of treatment and does not record recurrence.",
    detail: "SEER states that it collects and publishes incidence and survival from population-based registries covering approximately 45.9 per cent of the United States population, with coverage varying by group: 39.6 per cent of White, 43.5 per cent of Black, 64.9 per cent of Hispanic, 59.3 per cent of American Indian and Alaska Native, 68.2 per cent of Asian and 69.9 per cent of Native Hawaiian and Pacific Islander people. The variables it routinely collects are demographics, primary site, morphology, stage at diagnosis, first course of treatment and follow-up for vital status. Anything after the first course, and any recurrence short of death, is outside the file, which is why treatment-sequence questions in the United States are answered from claims (SEER-Medicare), hospital registries (the National Cancer Database) or electronic-record cohorts instead. The joint CDC and NCI United States Cancer Statistics release is the official federal count.",
    links: [
      { label: "NCI SEER: programme overview and coverage", url: "https://seer.cancer.gov/about/overview.html" },
      { label: "CDC and NCI: United States Cancer Statistics", url: "https://www.cdc.gov/united-states-cancer-statistics/" },
    ],
  },
  {
    id: "early-onset",
    title: "What is rising: cancer in people under fifty",
    plain: "Colorectal cancer is falling in older Americans and rising sharply in younger ones. Among adults aged 20 to 49 it rose about 3 per cent a year, and rectal cancer now accounts for a third of all colorectal cancer, up from about a quarter in the mid-2000s. Nobody knows why.",
    detail: "Colorectal Cancer Statistics, 2026 reports that overall incidence fell 0.9 per cent a year during 2013 to 2022, driven by a 2.5 per cent annual fall in adults aged 65 and over, while incidence rose 3 per cent a year in adults aged 20 to 49 and 0.4 per cent a year in those aged 50 to 64, dominated by distal colon and rectal tumours. Rectal cancer incidence overall rose 1 per cent a year from 2018 to 2022 after decades of decline and now accounts for 32 per cent of colorectal cancer, up from 27 per cent in the mid-2000s. The rise in the 50 to 64 group was confined to regional and distant stage, and mortality in that group has risen about 1 per cent a year since 2019, steepest (2.3 per cent a year) in White individuals. Mortality in adults under 50 has risen about 1 per cent a year since 2004. The United States moved screening to start at 45 in 2021; the cause of the birth-cohort effect is unexplained and is an open research question rather than a settled one.",
    links: [
      { label: "Siegel et al, Colorectal cancer statistics, 2026 (CA Cancer J Clin)", url: "https://doi.org/10.3322/caac.70067" },
      { label: "USPSTF 2021: colorectal cancer screening from age 45 (JAMA)", url: "https://doi.org/10.1001/jama.2021.6238" },
    ],
  },
  {
    id: "causes",
    title: "Four in ten American cancers are attributable to something that could change",
    plain: "A national analysis put 40 per cent of cancer cases and 44 per cent of cancer deaths down to risk factors that are in principle modifiable: smoking first, then excess body weight, then alcohol. American adult smoking is now about 9 per cent and falling; adult obesity is about 40 per cent. That pair of numbers explains much of where the cancer profile is heading.",
    detail: "Islami and colleagues estimated that in 2019, 40.0 per cent of incident cancers in adults aged 30 and over (713,340 of 1,781,649, excluding non-melanoma skin cancer) and 44.0 per cent of cancer deaths (262,120 of 595,737) were attributable to the exposures they could quantify: cigarette smoking 19.3 per cent of cases and 28.5 per cent of deaths, excess body weight 7.6 and 7.3 per cent, alcohol 5.4 and 4.1 per cent, with the rest from second-hand smoke, diet, inactivity, ultraviolet radiation and seven carcinogenic infections. Lung cancer carried the most attributable cases (201,660) and deaths (122,740). Their earlier estimate, for 2014, was 42.0 and 45.1 per cent; the small fall is mostly smoking. The CDC's early release from the 2025 National Health Interview Survey puts current cigarette smoking among adults at 9.1 per cent, and NHANES for August 2021 to August 2023 puts adult obesity at 40.3 per cent. The American cancer profile follows those two curves more closely than it follows anything the health system does.",
    links: [
      { label: "Islami et al, cancers attributable to modifiable risk factors, 2019 (CA Cancer J Clin 2024)", url: "https://doi.org/10.3322/caac.21858" },
      { label: "CDC NCHS FastStats: smoking (2025 National Health Interview Survey early release)", url: "https://www.cdc.gov/nchs/fastats/smoking.htm" },
      { label: "CDC NCHS FastStats: obesity and overweight (NHANES, August 2021 to August 2023)", url: "https://www.cdc.gov/nchs/fastats/obesity-overweight.htm" },
    ],
  },
  {
    id: "screening",
    title: "The country screens hard, except for the cancer that kills the most people",
    plain: "Four cancers have a national screening recommendation, and three of them reach three quarters of the eligible population or more. Lung cancer screening, which prevents the most deaths of any of them, reached about one eligible American in five.",
    detail: "The United States Preventive Services Task Force gives a grade B for biennial mammography from age 40 to 74 (April 2024), a grade A for colorectal screening from 50 to 75 and grade B from 45 to 49 (May 2021), a grade A for cervical screening from 21 to 65 (August 2018), and a grade B for annual low-dose CT of the chest from 50 to 80 in people with a 20 pack-year history who still smoke or quit within 15 years (March 2021). A grade A or B recommendation obliges most private insurers to cover the test with no cost sharing. Uptake in 2023, from the National Health Interview Survey: 80.0 per cent of women aged 50 to 74 had a mammogram within two years, 75.4 per cent of women aged 21 to 65 were up to date with cervical screening, and 76.3 per cent were up to date with colorectal screening, against 41.5 per cent in 1999. Lung cancer screening is the outlier: the American Lung Association's analysis of the American College of Radiology registry puts uptake at 18.2 per cent of eligible adults in 2022, ranging from 31.0 per cent in Rhode Island to 9.7 per cent in Wyoming. Colorectal screening also splits by coverage: 78.1 per cent of insured against 33.0 per cent of uninsured adults in 2023.",
    links: [
      { label: "USPSTF: breast cancer screening (2024)", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening" },
      { label: "USPSTF: colorectal cancer screening (2021)", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening" },
      { label: "USPSTF: lung cancer screening (2021)", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening" },
      { label: "CDC NCHS FastStats: mammography (2023)", url: "https://www.cdc.gov/nchs/fastats/mammography.htm" },
      { label: "American Lung Association, State of Lung Cancer: screening uptake by state", url: "https://www.lung.org/research/state-of-lung-cancer/key-findings" },
    ],
  },
];

/** Who pays, and what it costs a person. The per-product mechanics are at /coverage/us/; this is the system and the measured burden. */
export const US_PAYING: CountryCard[] = [
  {
    id: "who-is-covered",
    title: "Who is covered, and who is not",
    plain: "There is no single American health system. About half the country is insured through an employer, a fifth through Medicare, a sixth through Medicaid, and one in ten buys a plan on an exchange. In 2025, 26.7 million people, 7.9 per cent, had no coverage at all for the whole year. Which of these a person has, on the day they are diagnosed, determines almost everything that follows.",
    detail: "The Census Bureau's Health Insurance Coverage in the United States: 2025 reports 26.7 million people (7.9 per cent) uninsured for the entire calendar year, not statistically different from 2024. Employment-based insurance covered 53.5 per cent of the population for some or all of the year, Medicare 20.1 per cent, Medicaid 17.1 per cent, direct-purchase (mostly exchange) coverage 10.5 per cent, TRICARE 2.8 per cent and VA or CHAMPVA 1.2 per cent. Medicaid coverage fell for a second consecutive year, down 0.5 percentage points, while Medicare rose 0.6. Ten states have not adopted the Medicaid expansion; KFF, using 2024 American Community Survey data, estimates 1.2 million uninsured adults fall in the resulting coverage gap, earning too much for their state's Medicaid and too little for exchange subsidies, with a further 1.2 million between 100 and 138 per cent of the federal poverty level who are eligible for subsidies and not enrolled.",
    links: [
      { label: "US Census Bureau, Health Insurance Coverage in the United States: 2025 (P60-291)", url: "https://www.census.gov/library/publications/2026/demo/p60-291.html" },
      { label: "KFF: how many uninsured are in the Medicaid coverage gap", url: "https://www.kff.org/medicaid/how-many-uninsured-are-in-the-coverage-gap-and-how-many-could-be-eligible-if-all-states-adopted-the-medicaid-expansion/" },
    ],
  },
  {
    id: "part-b-part-d",
    title: "On Medicare the pill is capped and the drip is not",
    plain: "Since 2025 a Medicare patient's yearly bill for drugs they take at home has a hard ceiling: 2,100 dollars in 2026. There is no ceiling at all on drugs a clinician infuses. Those are paid under Part B, where the patient owes 20 per cent of the cost with no annual maximum. The same cancer can therefore cost very different amounts depending on how the medicine is given.",
    detail: "Medicare.gov states that in 2026 a Part D plan may set a deductible of at most 615 dollars, that the enrollee pays 25 per cent coinsurance until out-of-pocket spending on covered Part D drugs reaches 2,100 dollars, and that catastrophic coverage then costs nothing for the rest of the year; the cap rises to 2,400 dollars in 2027. There was no cap at all before the Inflation Reduction Act redesigned the benefit for 2025. The Medicare Prescription Payment Plan, which every Part D plan must offer, spreads that liability across the calendar year but does not reduce it. Part B is a different benefit: the 2026 standard premium is 202.90 dollars a month, the annual deductible 283 dollars, and the beneficiary generally owes 20 per cent of the Medicare-approved amount for each covered service and clinician-administered drug, with no annual out-of-pocket maximum in Original Medicare. Put the two side by side with prices OnCo already holds. Ibrutinib, a capsule, listed at 14,934 dollars for a 30-day supply in 2023 and has a negotiated Medicare price of 9,319 dollars from 2026: it is a Part D drug, so a Medicare patient taking it all year pays at most 2,100 dollars. Pembrolizumab, an infusion, listed at 11,115.20 dollars for a 200 mg dose every three weeks in 2024: it is a Part B drug, so the same patient owes 20 per cent of the Medicare-approved amount (average sales price plus 6 per cent, which is below list) on every dose, seventeen times a year, with no ceiling. The usual remedies are a Medigap policy, a Medicare Advantage plan with its own out-of-pocket maximum, or Medicaid. Negotiated Medicare prices took effect on 1 January 2026 for the first ten selected drugs (including Imbruvica for blood cancers); the second set of fifteen, effective in 2027, includes Xtandi for prostate cancer, Pomalyst for myeloma and Kaposi sarcoma, Ibrance for breast cancer and Calquence for CLL and mantle cell lymphoma.",
    links: [
      { label: "Medicare.gov: costs for Medicare drug coverage (Part D cap and deductible)", url: "https://www.medicare.gov/drug-coverage-part-d/costs-for-medicare-drug-coverage" },
      { label: "Medicare.gov: Medicare costs (2026 Part B premium and deductible)", url: "https://www.medicare.gov/basics/costs/medicare-costs" },
      { label: "KFF: key facts about Medicare drug price negotiation", url: "https://www.kff.org/medicare/key-facts-about-medicare-drug-price-negotiation/" },
      { label: "Merck: KEYTRUDA cost and financial support (list price)", url: "https://www.keytruda.com/cost/" },
      { label: "OnCo: paying for cancer care in the United States, product by product", url: "/coverage/us/" },
    ],
  },
  {
    id: "insured-not-affordable",
    title: "Being insured is not the same as being able to afford it",
    plain: "An exchange plan in 2026 may leave an individual liable for up to 10,600 dollars a year before the plan covers everything, and the average exchange deductible rose by more than a third in one year. Most employer plans have a deductible too. A cancer diagnosis usually means hitting the maximum in January and again the following January.",
    detail: "HealthCare.gov sets the 2026 marketplace out-of-pocket limit at no more than 10,600 dollars for an individual and 21,200 dollars for a family, rising to 12,000 and 24,000 dollars in 2027; premiums are on top and out-of-network care and non-covered services do not count towards it. KFF reports that the average marketplace deductible rose from 2,759 dollars in 2025 to 3,786 dollars in 2026, a 37 per cent increase it calls the steepest ever, and that the average net premium after subsidies rose 58 per cent, from 113 to 178 dollars a month, after the enhanced premium tax credits expired at the end of 2025. Plan sign-ups fell by more than a million to 23.1 million for 2026, which KFF calls the sharpest single-year drop since the marketplaces opened, and it expects enrolment among people who actually pay their premiums to fall to about 17.5 million, possibly as low as 16.5 million, from 22.3 million in 2025. In employer coverage, KFF's 2025 Employer Health Benefits Survey puts the average annual premium at 9,325 dollars for single and 26,993 dollars for family coverage, with an average general deductible of 1,886 dollars for single coverage and 88 per cent of covered workers facing a deductible.",
    links: [
      { label: "HealthCare.gov: out-of-pocket maximum limit", url: "https://www.healthcare.gov/glossary/out-of-pocket-maximum-limit/" },
      { label: "KFF: 2026 ACA marketplace enrolment, premiums and deductibles", url: "https://www.kff.org/affordable-care-act/what-we-know-so-far-about-2026-aca-marketplace-enrollment-premiums-and-deductibles/" },
      { label: "KFF 2025 Employer Health Benefits Survey", url: "https://www.kff.org/health-costs/2025-employer-health-benefits-survey/" },
    ],
  },
  {
    id: "financial-toxicity",
    title: "Financial toxicity is a measured phenomenon, and it is associated with dying sooner",
    plain: "Americans with cancer go bankrupt at more than twice the rate of people without it, and those who do have a measurably higher risk of death. When the price at the pharmacy counter rises, patients simply do not collect the prescription: half of those facing more than 2,000 dollars walk away from a new oral cancer drug.",
    detail: "Ramsey and colleagues linked the Western Washington SEER registry to federal bankruptcy records for 1995 to 2009 and found people with cancer 2.65 times more likely to file for bankruptcy than people without, with rates two to five times higher in patients under 65 than in those over it. In a propensity-matched follow-up of 3,841 pairs from the same cohort, filing for bankruptcy after diagnosis carried an adjusted hazard ratio for death of 1.79 (95 per cent CI 1.64 to 1.96). Doshi and colleagues examined 38,111 new prescriptions for 38 oral anticancer agents in Medicare and commercial claims from 2014 to 2015: the risk-adjusted rate of abandoning the prescription entirely rose from 10.0 per cent where the out-of-pocket cost was 10 dollars or less, to 31.7 per cent at 100 to 500 dollars, 41.0 per cent at 500 to 2,000 dollars and 49.4 per cent above 2,000 dollars. Gilligan and colleagues, following adults aged 50 and over in the Health and Retirement Study, found 42.4 per cent had depleted their entire life's assets two years after diagnosis, with average losses of 92,098 dollars. A CDC analysis of the National Health Interview Survey for 2011 to 2016 found 25.3 per cent of cancer survivors aged 18 to 64 reporting material financial hardship and 34.3 per cent psychological hardship. Nationally, the Peterson-KFF tracker estimates 20 million adults (about one in twelve) owe more than 250 dollars in medical debt, totalling at least 220 billion dollars, with about 3 million owing more than 10,000 dollars.",
    links: [
      { label: "Ramsey et al, bankruptcy risk after a cancer diagnosis (Health Aff 2013)", url: "https://doi.org/10.1377/hlthaff.2012.1263" },
      { label: "Ramsey et al, financial insolvency and early mortality (JCO 2016)", url: "https://doi.org/10.1200/JCO.2015.64.6620" },
      { label: "Doshi et al, out-of-pocket cost and abandonment of oral anticancer drugs (JCO 2018)", url: "https://doi.org/10.1200/JCO.2017.74.5091" },
      { label: "Gilligan et al, national estimates of financial toxicity (Am J Med 2018)", url: "https://doi.org/10.1016/j.amjmed.2018.05.020" },
      { label: "Ekwueme et al, out-of-pocket spending and hardship among survivors (MMWR 2019)", url: "https://www.cdc.gov/mmwr/volumes/68/wr/mm6822a2.htm" },
      { label: "Peterson-KFF: the burden of medical debt in the United States", url: "https://www.healthsystemtracker.org/brief/the-burden-of-medical-debt-in-the-united-states/" },
    ],
  },
  {
    id: "uninsured",
    title: "What happens to someone who is uninsured",
    plain: "They are diagnosed later and they live for less time. In de novo metastatic breast cancer, uninsured patients in the SEER registry lived a median of 22 months against 31 months for insured patients. Where states expanded Medicaid, two-year survival after a cancer diagnosis rose measurably against states that did not.",
    detail: "Ntowe and colleagues examined 47,034 patients with de novo metastatic breast cancer diagnosed in SEER between 1988 and 2016: median overall survival was 22 months for uninsured patients against 31 months for those with private insurance or Medicare, an adjusted hazard ratio for death of 1.29 (95 per cent CI 1.16 to 1.44). Han and colleagues compared 2,555,302 patients newly diagnosed with cancer aged 18 to 62 in 42 states' registries before (2010 to 2012) and after (2014 to 2016) the Affordable Care Act Medicaid expansion: two-year overall survival rose from 80.58 to 82.23 per cent in expansion states and from 78.71 to 80.04 per cent in non-expansion states, a difference-in-differences net gain of 0.44 percentage points overall, larger for liver (2.57), pancreatic (1.80), lung (1.29), non-Hodgkin lymphoma (1.07) and colorectal cancer (0.90), and larger among non-Hispanic Black patients (0.72). Tax-exempt hospitals must publish a financial assistance policy and limit charges and collections under section 501(r) of the Internal Revenue Code; eligibility thresholds are set hospital by hospital and state by state, so the practical answer to who pays for an uninsured American's cancer depends on which hospital doors they walk through.",
    links: [
      { label: "Ntowe et al, survival disparities in metastatic breast cancer (JCO Oncol Pract 2026)", url: "https://doi.org/10.1200/OP.24.00433" },
      { label: "Han et al, Medicaid expansion and survival after a cancer diagnosis (JNCI 2022)", url: "https://doi.org/10.1093/jnci/djac077" },
      { label: "IRS: requirements for charitable hospitals under section 501(r)", url: "https://www.irs.gov/charities-non-profits/charitable-hospitals-general-requirements-for-tax-exemption-under-section-501c3" },
      { label: "OnCo: financial help and assistance schemes", url: "/assistance/" },
    ],
  },
];

/** Coverage is not approval: how the United States decides what is actually given, having no health technology assessment body. */
export const US_COVERAGE_RULES: CountryCard[] = [
  {
    id: "compendia",
    title: "There is no NICE, so a compendium decides",
    plain: "The United States has no national body that weighs a cancer drug's benefit against its price. What it has instead is a rule, written into the Medicare statute, that says Medicare must pay for an off-label cancer use if one of five named reference books supports it. In practice that means an NCCN recommendation at category 1 or 2A becomes a payment obligation.",
    detail: "Section 1861(t)(2) of the Social Security Act, implemented in the Medicare Benefit Policy Manual chapter 15 section 50.4.5, tells contractors not to deny coverage of an anticancer drug solely because the use is not on the FDA label, if the use is supported by one of five compendia: the American Hospital Formulary Service Drug Information, the NCCN Drugs and Biologics Compendium (recognised 5 June 2008), Micromedex DrugDex (10 June 2008), Clinical Pharmacology (2 July 2008) and Lexi-Drugs (12 August 2015). The manual states that a use is medically accepted if the indication is category 1 or 2A in NCCN or class I, IIa or IIb in DrugDex, and is not medically accepted if it is category 3 in NCCN or class III in DrugDex. A second route allows support from peer-reviewed evidence in a named list of journals. The effect is that a private, dues-funded alliance of cancer centres writes a large part of American public cancer-drug coverage, and that coverage widens faster than the label does.",
    links: [
      { label: "CMS Medicare Benefit Policy Manual, chapter 15 (section 50.4.5, off-label anticancer use)", url: "https://www.cms.gov/regulations-and-guidance/guidance/manuals/downloads/bp102c15.pdf" },
      { label: "NCCN compendia, including the Drugs and Biologics Compendium", url: "https://www.nccn.org/compendia-templates/compendia/nccn-compendia" },
    ],
  },
  {
    id: "nccn",
    title: "A guideline that is also a payment rule, and the argument about its evidence",
    plain: "NCCN guidelines are written by panels from its member cancer centres, updated continuously, and funded by member dues rather than by industry. Because they are also a Medicare payment trigger, what counts as evidence behind them matters. One study found that two in five NCCN recommendations went beyond the FDA label, and that fewer than a quarter of those rested on a randomised trial.",
    detail: "Wagner and colleagues took the 47 drugs the FDA first approved for adult haematological or solid cancers between 2011 and 2015 and compared their labels with the NCCN guidelines. The 47 drugs carried 69 FDA-approved indications but 113 NCCN recommendations: 69 (62 per cent) overlapped with the label and 44 (39 per cent) went beyond it, an average of 0.92 extra recommendations per drug. Of those 44, 10 (23 per cent) rested on evidence from randomised controlled trials and 7 (16 per cent) on phase 3 studies. Over 21 months of follow-up the FDA went on to approve 6 of the 44 (14 per cent). The authors concluded that NCCN was justifying coverage of costly and toxic drugs on weak evidence. NCCN's leadership replied in Annals of Oncology, setting out the panel process, the rule disqualifying panel members who receive 20,000 dollars or more in non-research support from a single company or 50,000 dollars in aggregate in a year, and the fact that guideline development is funded exclusively by member institutions' dues.",
    links: [
      { label: "Wagner et al, evidence behind NCCN recommendations beyond FDA approvals (BMJ 2018)", url: "https://doi.org/10.1136/bmj.k668" },
      { label: "Kurzrock et al, NCCN's response on level of evidence (Ann Oncol 2019)", url: "https://doi.org/10.1093/annonc/mdz232" },
    ],
  },
  {
    id: "utilisation",
    title: "Prior authorisation, step therapy and the pathway vendor",
    plain: "Approval and compendium listing still do not mean the drug arrives. Medicare Advantage plans made almost 53 million prior authorisation decisions in 2024 and refused 7.7 per cent of them. Very few refusals are appealed, but more than four in five appeals succeed, which is a statement about the refusals.",
    detail: "KFF's analysis of CMS data reports 52.8 million prior authorisation determinations by Medicare Advantage insurers in 2024, about 1.7 per enrollee; 7.7 per cent (4.1 million) were denied in full or in part; 11.5 per cent of denials were appealed, and 80.7 per cent of appealed denials were overturned. A Department of Health and Human Services inspector general review of a stratified sample of 250 prior-authorisation denials issued by fifteen of the largest Medicare Advantage organisations in one week of June 2019 found that 13 per cent of them met Medicare coverage rules and should not have been denied, along with 18 per cent of sampled payment denials. CMS rescinded its 2012 prohibition in a memorandum of 7 August 2018 and allowed Medicare Advantage plans to apply step therapy to Part B drugs from 1 January 2019. Commercial oncology decisions are additionally routed through pathway products: Elsevier ClinicalPath (formerly Via Oncology) advertises an 80 per cent on-pathway decision rate, and Evolent, which absorbed New Century Health, advertises about a 50 per cent automatic authorisation rate for medical oncology regimens submitted through its portal.",
    links: [
      { label: "KFF: Medicare Advantage prior authorisation determinations in 2024", url: "https://www.kff.org/medicare/medicare-advantage-insurers-made-nearly-53-million-prior-authorization-determinations-in-2024/" },
      { label: "HHS OIG, OEI-09-18-00260: Medicare Advantage denials of prior authorisation (April 2022)", url: "https://oig.hhs.gov/oei/reports/OEI-09-18-00260.asp" },
      { label: "CMS: step therapy for Part B drugs in Medicare Advantage (7 August 2018 memorandum)", url: "https://www.cms.gov/Medicare/Health-Plans/HealthPlansGenInfo/Downloads/MA_Step_Therapy_HPMS_Memo_8_7_2018.pdf" },
    ],
  },
  {
    id: "price",
    title: "What the openness costs: the highest brand-name prices of any rich country",
    plain: "The trade the United States makes is speed and breadth of access in exchange for price. By the end of the 2010s a new cancer drug launched in the United States at a median 14,580 dollars a month, against about 6,000 to 7,000 dollars in England, Germany and Switzerland, and American prices then rose faster than inflation regardless of how well the drug worked. Generics are the exception: they are cheaper in the United States than almost anywhere.",
    detail: "Vokinger and colleagues compared 65 cancer drugs approved in the United States, England, Germany and Switzerland between 2009 and 2019. Median monthly treatment cost at launch in 2018 to 2019 was 14,580 dollars in the United States against 5,888 in Germany, 6,593 in Switzerland and 6,867 in England; the American figure in 2009 to 2010 had been 5,790 dollars. After launch, 48 of 65 (74 per cent) American cancer drugs had price increases greater than inflation, against 1 of 62 in England, 0 of 60 in Germany and 7 of 56 in Switzerland, and price changes were not associated with clinical benefit in any country. RAND's whole-market comparison for 2022 found United States manufacturer gross prices at 278 per cent of prices in 33 OECD comparison countries combined and 422 per cent for brand-name originators, before American rebates and discounts, which RAND notes are substantial and undisclosed; but unbranded generics, 90 per cent of American prescription volume, cost 67 per cent of comparison-country prices. Payment reform has not moved the total: the Oncology Care Model, which covered one in four Medicare fee-for-service patients in cancer treatment from 2016 to 2022, reduced total episode payments by about 2.1 per cent but, after the monthly care-management payments and performance bonuses paid to practices, produced cumulative net losses to Medicare of 639 million dollars. Its successor, the Enhancing Oncology Model, began in July 2023 with a much smaller group of practices.",
    links: [
      { label: "Mulcahy et al, international prescription drug price comparisons, 2022 data (RAND 2024)", url: "https://doi.org/10.7249/RRA788-3" },
      { label: "Vokinger et al, launch and post-approval cancer drug pricing, US and Europe (JAMA Oncol 2021)", url: "https://doi.org/10.1001/jamaoncol.2021.2026" },
      { label: "CMS: Oncology Care Model final evaluation report (2024)", url: "https://www.cms.gov/priorities/innovation/data-and-reports/2024/ocm-final-eval-report-2024-exec-sum" },
      { label: "OnCo: cost levers and what is being done about them", url: "/costs/" },
    ],
  },
];

/** The regulator. */
export const US_REGULATOR: CountryCard[] = [
  {
    id: "fda",
    title: "The FDA and its Oncology Center of Excellence",
    plain: "Cancer medicines in the United States are approved by the Food and Drug Administration, and since 2017 the review has been coordinated by a single Oncology Center of Excellence that cuts across the drug, biologic and device centres. In 2024 it handled 89 oncology drug and biologic approvals and 76 device authorisations.",
    detail: "The Oncology Center of Excellence was authorised by the 21st Century Cures Act of 2016 and established on 19 January 2017 to unite oncology reviewers across the FDA's drug, biologic and device centres. Its 2024 annual report records 89 oncology drug and biologic product approvals: 19 new molecular entities or new biologics licence applications, 34 new indications for already-approved products and 10 approvals under the 505(b)(2) pathway or as biosimilars, alongside 76 authorised oncology devices and eight drugs or biologics approved for paediatric cancer. Project Orbis, the FDA's concurrent-review arrangement with regulators in Australia, Brazil, Canada, Israel, Singapore, Switzerland and the United Kingdom, contributed to 23 product approvals that year, five of them new products. Project Facilitate processed 761 single-patient expanded-access applications. Richard Pazdur, who had led the FDA's oncology review since 1999, signed that report; R. Angelo de Claro is the centre's director in 2026.",
    links: [
      { label: "FDA Oncology Center of Excellence", url: "https://www.fda.gov/about-fda/fda-organization/oncology-center-excellence" },
      { label: "FDA: 2024 OCE Annual Report", url: "https://www.fda.gov/about-fda/oce-annual-reports/2024-oce-annual-report" },
      { label: "FDA: Project Orbis", url: "https://www.fda.gov/about-fda/oncology-center-excellence/project-orbis" },
      { label: "OnCo: regulatory timeline and the weekly FDA approvals feed", url: "/regulatory/" },
    ],
  },
  {
    id: "pathways",
    title: "The pathways, and why the FDA is usually first",
    plain: "Priority review gives the agency six months rather than ten. Fast track, breakthrough therapy designation and real-time oncology review change how the conversation runs before the application arrives. Accelerated approval, in place since 1992, lets a drug on the market on a surrogate endpoint. Taken together these are why a new cancer medicine is usually approved in the United States before anywhere else.",
    detail: "The FDA's own description of priority review is a six-month goal against ten months for standard review, with designation notified within 60 days of receipt; breakthrough therapy designation requires preliminary clinical evidence of substantial improvement over available therapy on a clinically significant endpoint and also carries a 60-day response window; real-time oncology review, given final guidance in November 2023, allows topline efficacy and safety data to be submitted before the full application without changing the statutory clock. The consequence is measurable. Kim and colleagues took all 36 oncology drugs that received their first expedited approval from the FDA between 2019 and 2023 and followed the subsequent decisions of the EMA (28), TGA (18) and PMDA (15): every one of those agencies had a longer review duration than the FDA, the EMA's median submission lag was 27 days and the TGA's exceeded 600. A separate comparison of first-time oncology approvals from 2020 to 2024 counted 73 at the FDA against 56 at the EMA and 18 at Brazil's ANVISA.",
    links: [
      { label: "FDA: priority review", url: "https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/priority-review" },
      { label: "FDA: accelerated approval", url: "https://www.fda.gov/patients/fast-track-breakthrough-therapy-accelerated-approval-priority-review/accelerated-approval" },
      { label: "Kim et al, FDA-first expedited oncology approvals and follow-on decisions (Front Pharmacol 2026)", url: "https://doi.org/10.3389/fphar.2026.1804782" },
      { label: "da Silva et al, oncology approvals at FDA, EMA and ANVISA 2020-2024 (J Cancer Policy 2026)", url: "https://doi.org/10.1016/j.jcpo.2026.100752" },
      { label: "OnCo: approval differences by country", url: "/regulatory/regions/" },
    ],
  },
  {
    id: "accelerated",
    title: "Accelerated approval: what happens when the confirmatory trial fails, or never reports",
    plain: "A drug can reach American patients on a tumour-shrinkage result, on the promise that a proper trial will follow. Most of those promises are eventually kept and the approval converts. Some are broken and the indication is withdrawn. And a long tail sits unresolved for years: one indication has been on an accelerated approval since 2009 and is still not settled.",
    detail: "The FDA publishes four separate tables of oncology accelerated approvals rather than one. Read on 25 September 2026 they held 127 indications whose clinical benefit has been verified and converted to traditional approval, 35 withdrawn, 57 still ongoing, and 20 in an other category covering supportive-care and dosing changes: 239 indications in all since the pathway opened in 1992. Gyawali and colleagues examined the FDA's own review of the first 93 oncology accelerated approvals (December 1992 to May 2017) and found that confirmatory trials demonstrated an improvement in overall survival for 19 of them, one fifth; another fifth reported an improvement in the same surrogate used before approval. Their later analysis of 18 indications whose post-approval trials missed their primary endpoint found 11 voluntarily withdrawn, one revoked by the FDA (bevacizumab with paclitaxel for HER2-negative metastatic breast cancer, accelerated approval 22 February 2008, withdrawal 18 November 2011) and six left on the label. The same paper found the NCCN guidelines still carrying a category 1 endorsement for one of those failed indications and category 2A for seven, in some cases after the approval had been withdrawn or revoked, which under the compendia rule keeps them payable. The Food and Drug Omnibus Reform Act of 2022 responded on the regulatory side: its section 3210 created an Accelerated Approval Coordinating Council, which now reports annually, alongside new withdrawal procedures.",
    links: [
      { label: "FDA: verified clinical benefit cancer accelerated approvals", url: "https://www.fda.gov/drugs/resources-information-approved-drugs/verified-clinical-benefit-cancer-accelerated-approvals" },
      { label: "FDA: withdrawn cancer accelerated approvals", url: "https://www.fda.gov/drugs/resources-information-approved-drugs/withdrawn-cancer-accelerated-approvals" },
      { label: "FDA: ongoing cancer accelerated approvals", url: "https://www.fda.gov/drugs/resources-information-approved-drugs/ongoing-cancer-accelerated-approvals" },
      { label: "Gyawali et al, clinical benefit of accelerated approvals (JAMA Intern Med 2019)", url: "https://doi.org/10.1001/jamainternmed.2019.0462" },
      { label: "Gyawali et al, consequences of negative confirmatory trials (BMJ 2021)", url: "https://doi.org/10.1136/bmj.n1959" },
      { label: "FDA: accelerated approval programme", url: "https://www.fda.gov/drugs/nda-and-bla-approvals/accelerated-approval-program" },
    ],
  },
  {
    id: "who-is-in-the-trial",
    title: "Who was in the trial that won the approval",
    plain: "The evidence base for American cancer approvals does not look like America. Across the 230 trials behind a decade of FDA cancer approvals, Black patients were 3.1 per cent of participants, about a fifth of what their share of the American cancer burden would predict. More than a third of those trials did not report race at all.",
    detail: "Loree and colleagues examined every reported trial supporting an FDA oncology drug approval granted between July 2008 and June 2018: 230 trials with 112,293 participants. Measured against each group's share of United States cancer incidence, Black patients were at 22 per cent of expected representation and Hispanic patients at 44 per cent, while White patients were at 98 per cent and Asian patients at 438 per cent; in raw shares, 76.3 per cent of participants were White, 18.3 per cent Asian, 6.1 per cent Hispanic and 3.1 per cent Black. Only 145 trials (63.0 per cent) reported at least one race, 18 (7.8 per cent) reported all four major groups, and 58 (25.2 per cent) reported a race subgroup analysis. Comparing the first half of the period with the second, reporting improved a little and enrolment barely moved (Black participants 3.6 against 2.9 per cent). The Food and Drug Omnibus Reform Act of 2022 added sections 505(z) and 520(g) to the Food, Drug and Cosmetic Act, requiring sponsors to submit diversity action plans for pivotal studies; the FDA issued draft guidance in June 2024, replacing an April 2022 draft, and no final guidance had been issued when this page was written.",
    links: [
      { label: "Loree et al, race reporting and representation in trials leading to cancer drug approvals (JAMA Oncol 2019)", url: "https://doi.org/10.1001/jamaoncol.2019.1870" },
      { label: "FDA draft guidance: diversity action plans (June 2024)", url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/diversity-action-plans-improve-enrollment-participants-underrepresented-populations-clinical-studies" },
    ],
  },
];

/**
 * The four FDA oncology accelerated-approval tables, no longer typed out here.
 *
 * Every row of the four tables is now in the corpus (scripts/fetch-accelerated.ts writes
 * src/data/accelerated-approvals.ts, and src/data/index.ts turns each row into typed regulatoryEvents on the
 * product), so this card is computed from those rows rather than from a reading an editor did once. The counts are
 * the tables' own; the medians and quartiles are OnCo arithmetic over the two date columns (accelerated approval to
 * traditional approval or withdrawal, and for the ongoing table to the day the table says it is current to). The
 * FDA does not publish these medians; anyone can repeat them from the linked pages. Re-running the script refreshes
 * this card, so it cannot say one thing here and another on /timeline/.
 */
const ACCELERATED_ROWS: AcceleratedRow[] = [...Object.values(ACCELERATED_APPROVALS).flat(), ...ACCELERATED_UNMATCHED];

/** The earliest accelerated approval any of the four tables still lists. */
export const US_ACCELERATED_FROM = Math.min(...ACCELERATED_ROWS.map((r) => Number(r.granted.slice(0, 4))));

function acceleratedNote(id: string, rows: AcceleratedRow[], s: AcceleratedSummary): string {
  if (id === "verified") return `Median years from accelerated approval to conversion; range across all rows ${(s.min ?? 0).toFixed(1)} to ${(s.max ?? 0).toFixed(1)} years.`;
  if (id === "withdrawn") return `Median years from accelerated approval to withdrawal; the longest-standing indication withdrawn came off the label ${(s.max ?? 0).toFixed(1)} years after its approval.`;
  if (id === "ongoing") {
    const overFive = rows.filter((r) => intervalYears(r, ACCELERATED_READ_ON) > 5).length;
    const oldest = [...rows].sort((a, b) => a.granted.localeCompare(b.granted))[0];
    return `Median years since accelerated approval, still awaiting a confirmatory result. ${overFive} have been open more than five years; the oldest is ${oldest.drugName} since ${longDate(oldest.granted)}.`;
  }
  return "Accelerated approvals that are not cancer treatment indications.";
}

export const US_ACCELERATED = {
  readOn: ACCELERATED_READ_ON,
  rows: ACCELERATED_TABLES.map((t) => {
    const rows = ACCELERATED_ROWS.filter((r) => r.table === t.id);
    const s = summarise(rows, ACCELERATED_READ_ON);
    const timed = t.id !== "other";
    return {
      id: t.id,
      label: t.label,
      count: t.count,
      current: longDate(t.current),
      years: timed ? (s.median ?? 0).toFixed(1) : "",
      range: timed ? `${(s.p25 ?? 0).toFixed(1)} to ${(s.p75 ?? 0).toFixed(1)}` : "",
      note: acceleratedNote(t.id, rows, s),
      url: t.url,
    };
  }),
};

/** What the country does that no other country does, and what that system does badly. */
export const US_MACHINE: CountryCard[] = [
  {
    id: "nci",
    title: "The National Cancer Institute, and the budget that goes straight to the President",
    plain: "One institute, with an appropriation of 7.35 billion dollars for the 2026 financial year, funds the designated centres, the trial network, the national registry programme and its own laboratories. It is also institutionally odd: since 1971 its director has been able to send a budget request straight to the President, bypassing the rest of the National Institutes of Health.",
    detail: "The National Cancer Institute was created by the National Cancer Institute Act of 1937 and reconstituted by the National Cancer Act of 1971, signed on 23 December 1971, which created the National Cancer Program, the National Cancer Advisory Board, the President's Cancer Panel and the bypass budget, and funded fifteen new cancer centres. The Consolidated Appropriations Act, 2026 (H.R. 1748) gives the NCI a total appropriation of 7.35 billion dollars, an increase of 128 million dollars over the 2025 enacted level. The money buys the designated centres, the trial network, SEER, the Frederick National Laboratory and an intramural programme. The consequence for a reader anywhere in the world is that a large share of the oncology evidence they rely on was commissioned, reviewed and paid for by one agency answering to one national legislature.",
    links: [
      { label: "NCI budget and appropriations", url: "https://www.cancer.gov/about-nci/budget" },
      { label: "NCI: the National Cancer Act of 1971", url: "https://www.cancer.gov/about-nci/legislative/history/national-cancer-act-1971" },
      { label: "OnCo: funding flows", url: "/funding/" },
    ],
  },
  {
    id: "centres",
    title: "Seventy-four designated centres, in thirty-seven states",
    plain: "NCI designation is the American quality mark for a cancer centre, and it is concentrated. There are 74 designated centres, and they sit in 37 states and the District of Columbia, which means thirteen states have none at all.",
    detail: "The NCI states that there are 74 NCI-Designated Cancer Centers located in 37 states and the District of Columbia: 58 are Comprehensive Cancer Centers, recognised for depth and breadth of research and for transdisciplinary work, 8 are Clinical Cancer Centers and 8 are Basic Laboratory Cancer Centers. Designation runs on a Cancer Center Support Grant and is competitively renewed. The geography is the point: a designated centre is where the earliest-phase trials, the tumour boards and the rarest expertise are, and the distance a patient must travel to reach one is a determinant of what treatment they are offered.",
    links: [
      { label: "NCI-Designated Cancer Centers", url: "https://www.cancer.gov/research/infrastructure/cancer-centers" },
      { label: "OnCo: institutions map and ranking", url: "/institutions/" },
    ],
  },
  {
    id: "nctn",
    title: "The publicly funded trial network no other country has at this scale",
    plain: "Most countries run academic cancer trials through a handful of groups. The United States runs a national network: five adult and paediatric groups plus the Canadian group, coordinating trials at more than 2,200 sites, with a second network that carries the trials out into community hospitals.",
    detail: "The National Clinical Trials Network coordinates NCI-funded treatment and advanced imaging trials at more than 2,200 sites in the United States, Canada and internationally. Its five United States network groups are the Alliance for Clinical Trials in Oncology, ECOG-ACRIN, NRG Oncology, SWOG and the Children's Oncology Group, with the Canadian Cancer Trials Group as the Canadian member; 32 United States academic institutions hold Lead Academic Participating Site grants, most of them NCI-designated centres. Alongside it, the NCI Community Oncology Research Program runs 7 research bases and 46 community sites: in the last five years it enrolled more than 20,000 patients to cancer treatment trials, 20 per cent of them from rural areas, more than 42,000 people to prevention and symptom-management trials, and more than 100,000 to screening trials. This machinery is what produces the trials that no company would run: de-escalation, comparison of two marketed drugs, surgical questions, supportive care and long-term survivorship follow-up.",
    links: [
      { label: "NCI: the National Clinical Trials Network", url: "https://www.cancer.gov/research/infrastructure/clinical-trials/nctn" },
      { label: "NCI Community Oncology Research Program", url: "https://ncorp.cancer.gov/" },
      { label: "OnCo: trial sponsors, including the cooperative groups", url: "/sponsors/" },
    ],
  },
  {
    id: "enrolment",
    title: "And the patients it never reaches: eight per cent join a trial",
    plain: "The country that runs the most cancer trials enrols about eight in a hundred of its own cancer patients in one. The main reason is not that patients refuse. It is that more than half the time there is no trial open at the hospital they are standing in.",
    detail: "Unger and colleagues pooled 13 studies covering 8,883 patients and found an overall trial participation rate of 8.1 per cent (95 per cent CI 6.3 to 10.0). Where patients did not enrol, no trial was available at their institution 55.6 per cent of the time; where a trial was available, 21.5 per cent of patients were ineligible for it; and among patients who were eligible with a trial available, 14.8 per cent declined. Structural and clinical barriers together accounted for 77.1 per cent of non-enrolment. Participation was 15.9 per cent at academic sites against 7.0 per cent at community sites. The reading is uncomfortable and useful: American patients are not unwilling, the trial is simply not in the room, and the fix is a supply problem rather than a persuasion problem.",
    links: [
      { label: "Unger et al, barriers to cancer clinical trial participation (JNCI 2019)", url: "https://doi.org/10.1093/jnci/djy221" },
    ],
  },
  {
    id: "workforce",
    title: "Most American counties have no oncologist",
    plain: "There were 14,547 haematologists and medical oncologists billing Medicare in 2024, and they are not spread evenly. Fewer than half of American counties had one. Two hundred and seven counties had no oncologist and no oncologist in any neighbouring county either.",
    detail: "Kirkwood and colleagues counted haematologists and medical oncologists billing Medicare by county in 2014, 2019 and 2024. The workforce grew from 12,267 to 14,547, but the number per 100,000 people aged 55 and over, the age band where 80 per cent of new cancers are diagnosed, fell from 15.9 to 14.9, and 38 states had fewer oncologists per capita in 2024 than in 2014. In 2024 only 45 per cent of counties (1,420) had an oncologist present, although those counties held 89 per cent of adults aged 55 and over. Of the 1,724 counties without one, 1,517 had an oncologist in a neighbouring county; the remaining 207 did not, and 486,000 adults aged 55 and over live in them. Sixty-eight per cent of the population lived in counties where more than a quarter of local oncologists were nearing retirement, and early-career clinicians were less likely than late-career ones to practise in rural counties or in counties with high cancer mortality, smoking, obesity, uninsurance or no broadband. The CDC's rural-urban comparison found cancer death rates of 180 per 100,000 in nonmetropolitan counties against 158 in large metropolitan counties in 2011 to 2015, with death rates falling 1.0 per cent a year in nonmetropolitan and 1.6 per cent a year in metropolitan counties, so the gap widens.",
    links: [
      { label: "Kirkwood et al, the state of the oncology workforce in America (JCO Oncol Pract 2025)", url: "https://doi.org/10.1200/OP-25-00144" },
      { label: "Henley et al, cancer incidence and deaths in nonmetropolitan and metropolitan counties (MMWR 2017)", url: "https://www.cdc.gov/mmwr/volumes/66/ss/ss6614a1.htm" },
    ],
  },
];

/** Disparities, with their cohorts. Central to American cancer outcomes; a US page that omits them is not describing the country. */
export const US_DISPARITIES: CountryCard[] = [
  {
    id: "black-americans",
    title: "Black Americans: a smaller gap in getting cancer, a large one in dying of it",
    plain: "Black men are 4 per cent more likely to be diagnosed with cancer than White men but 16 per cent more likely to die of it. Black women are 9 per cent less likely to be diagnosed than White women and 10 per cent more likely to die. That shape, a mortality gap much wider than the incidence gap, is the signature of a difference in care rather than in biology.",
    detail: "The American Cancer Society's Cancer Statistics for African American and Black People, 2025 projects about 248,470 new cancer cases and 73,240 cancer deaths among Black people in the United States in 2025, using incidence through 2021 and mortality through 2022. Over the most recent five years, Black men had 16 per cent higher mortality than White men on 4 per cent higher incidence, and Black women 10 per cent higher mortality on 9 per cent lower incidence. Death rates are roughly twofold higher for prostate, uterine corpus and stomach cancer and for myeloma, and 40 to 50 per cent higher for colorectal, breast, cervical and liver cancer. The progress is real and belongs in the same sentence: Black men have had the largest relative decline in cancer mortality of any group from 1991 to 2022, 49 per cent overall and as much as 65 to 67 per cent among those aged 40 to 59, which the authors attribute largely to historic falls in smoking initiation among Black teenagers, better treatment and earlier detection for some cancers. One cancer is moving the wrong way. Clarke and colleagues, using hysterectomy-corrected rates from SEER-18 across 208,587 women diagnosed from 2000 to 2017 and 16,797 deaths from 2010 to 2017, found uterine corpus cancer mortality rising 1.8 per cent a year overall and non-endometrioid carcinoma mortality rising 3.5 per cent a year in Black women against 1.5 per cent in White women, and concluded that the disparity cannot be fully explained by subtype distribution and stage at diagnosis.",
    links: [
      { label: "Saka et al, Cancer statistics for African American and Black people, 2025 (CA Cancer J Clin)", url: "https://doi.org/10.3322/caac.21874" },
      { label: "Clarke et al, hysterectomy-corrected uterine corpus cancer mortality by race (JAMA Oncol 2022)", url: "https://doi.org/10.1001/jamaoncol.2022.0009" },
    ],
  },
  {
    id: "aian",
    title: "American Indian and Alaska Native people, and the highest colorectal cancer rate in the world",
    plain: "American Indian and Alaska Native people have cancer incidence close to White Americans but die of cancer 18 per cent more often. Alaska Native people have the highest recorded rate of colorectal cancer of any population in the world, and it is rising fastest in the young.",
    detail: "Kratzer and colleagues compared non-Hispanic American Indian and Alaska Native people with non-Hispanic White people, restricting incidence to Purchased and Referred Care Delivery Area counties to reduce racial misclassification. Incidence was 2 per cent higher (2014 to 2018) and mortality 18 per cent higher (2015 to 2019). Breast and prostate cancer mortality were 8 and 31 per cent higher despite lower incidence and the availability of early-detection tests. Colorectal cancer incidence among indigenous Alaskans was 91.3 per 100,000 against 35.5 for White Alaskans, the highest rate in the world, and among Alaska Native people aged 20 to 49 it rose from 18.8 per 100,000 in 1998 to 2002 to 34.8 in 2014 to 2018. Death rates for liver, stomach and cervical cancer, all infection-related, and for kidney cancer were about twice those of White individuals.",
    links: [
      { label: "Kratzer et al, Cancer statistics for American Indian and Alaska Native individuals, 2022 (CA Cancer J Clin)", url: "https://doi.org/10.3322/caac.21757" },
    ],
  },
  {
    id: "aapi",
    title: "Asian American and Pacific Islander is not one population, and the aggregate hides a twofold range",
    plain: "American statistics usually report Asian Americans and Pacific Islanders as a single group with low cancer rates. Broken apart, the rate runs from 218 per 100,000 in Cambodian Americans to 475 in Native Hawaiians, and five-year survival from 42 per cent in Laotians to 74 per cent in Asian Indians and Pakistanis. The aggregate describes nobody.",
    detail: "The American Cancer Society reported SEER data for 2000 to 2022 broken into eight Asian American and three Native Hawaiian and Pacific Islander ethnic groups. For 2018 to 2022, overall cancer incidence ranged from 218.3 per 100,000 in Kampuchean (Cambodian) people to 474.5 in Native Hawaiian people, the latter 1.5 times the rate for the aggregated population (307.3). The pattern differs by cause: Native Hawaiian rates are driven by breast, colorectal and prostate cancer, while infection-related cancers are highest in Asian American groups, with liver cancer highest among Vietnamese people (22.2 per 100,000) and stomach cancer highest among Korean people (17.8), each nearly double the Native Hawaiian rate. Native Hawaiian and Samoan women are twice and three times as likely to be diagnosed with uterine corpus cancer as aggregated Asian American and Pacific Islander women or White women. Five-year relative survival ranged from 42 per cent in Laotian people to 74 per cent in Asian Indian and Pakistani people, with the widest spreads in colorectal (43 to 72 per cent) and prostate cancer (63 to 97 per cent).",
    links: [
      { label: "Wagle et al, Cancer statistics for Asian American, Native Hawaiian, and Pacific Islander people, 2026 (Cancer)", url: "https://doi.org/10.1002/cncr.70584" },
    ],
  },
  {
    id: "cause",
    title: "Run the same cancer through an equal-access system and the gap disappears",
    plain: "The clearest experiment the United States has run on its own disparities is the Veterans Health Administration, which the study that used it calls an equal-access system. In the national registry, Black men with prostate cancer die of it about a third more often than White men. Inside the VA, that difference is zero.",
    detail: "Klebaner and colleagues identified African American and White men diagnosed with prostate cancer from 2004 to 2015 in SEER (311,691 men) and in the Veterans Health Administration (90,749 men). In SEER, African American men were more likely to present with metastatic disease (adjusted odds ratio 1.23, 95 per cent CI 1.17 to 1.30) and had a higher risk of prostate cancer-specific mortality (subdistribution hazard ratio 1.32, 95 per cent CI 1.10 to 1.60). In the VHA neither held: adjusted odds ratio 1.07 (0.98 to 1.17) for metastatic presentation, subdistribution hazard ratio 1.00 (0.93 to 1.08) for mortality. Adjusting the SEER model for disease extent, PSA and Gleason score eliminated the mortality difference there too (1.04, 0.93 to 1.16), which locates the cause in what stage the man arrives at, not in the tumour. The Medicaid expansion literature says the same thing prospectively. Lam and colleagues followed 523,802 people with breast, lung or colorectal cancer diagnosed from 2012 to 2015 and found a mortality benefit in expansion states that vanished after adjusting for stage at diagnosis, meaning the gain was earlier diagnosis rather than better treatment. Han and colleagues, across 2,555,302 newly diagnosed patients aged 18 to 62 in 42 states' registries, found two-year overall survival rising 0.44 percentage points more in expansion than non-expansion states, 0.72 points among non-Hispanic Black patients, and most in liver (2.57), pancreatic (1.80) and lung cancer (1.29), where weeks matter. None of this says biology is irrelevant; it says the part of the gap policy can move is large, and has been moved.",
    links: [
      { label: "Klebaner et al, health-care system and prostate cancer mortality in African American and White men (JNCI 2021)", url: "https://doi.org/10.1093/jnci/djab062" },
      { label: "Lam et al, Medicaid expansion and mortality in breast, lung and colorectal cancer (JAMA Netw Open 2020)", url: "https://doi.org/10.1001/jamanetworkopen.2020.24366" },
      { label: "Han et al, Medicaid expansion and survival after a cancer diagnosis (JNCI 2022)", url: "https://doi.org/10.1093/jnci/djac077" },
      { label: "Ntowe et al, survival disparities in metastatic breast cancer (JCO Oncol Pract 2026)", url: "https://doi.org/10.1200/OP.24.00433" },
    ],
  },
];

/** What could not be sourced, and what the United States does not publish. Named rather than quietly omitted. */
export const US_GAPS: string[] = [
  "The exact annual out-of-pocket total for an infused cancer drug on Medicare. Coinsurance is 20 per cent of the average sales price plus 6 per cent, not of the list price, and Medicare publishes average sales prices as quarterly spreadsheets that could not be read here. The page therefore gives the list price and the rule, and leaves the multiplication to the reader's own plan.",
  "The size of the 340B programme. HRSA publishes the covered-entity list but a current total purchase figure could not be read from a primary page.",
  "The share of the FDA's human drug review budget met by industry user fees. The FDA's congressional justifications are published as PDFs whose text could not be extracted; the commonly quoted figure is more than a decade old and is not repeated here.",
  "The 2025 Oncology Center of Excellence annual report totals. The 2025 report exists but publishes its figures only in a PDF that could not be read; the approval counts on this page are the 2024 figures the FDA states in HTML.",
  "A median FDA review time in days for oncology applications. The FDA publishes goals (six months for priority review, ten for standard) rather than realised medians, and the comparisons cited here report ordering and relative duration rather than absolute medians.",
  "The American Cancer Society publishes a separate statistics report for each population every three years, so the figures here are of different vintages: 2026 for Asian American, Native Hawaiian and Pacific Islander people, 2025 for Black Americans, 2022 for American Indian and Alaska Native people and 2021 for the Hispanic and Latino population. They are not directly comparable with one another, and the Hispanic figures are now five years old.",
  "Cancer rates in Appalachia and the Mississippi Delta, and the excess cancer risk attributed to the Louisiana industrial corridor, are widely asserted and were not quoted here because no quantitative peer-reviewed or EPA figure could be read from a primary source.",
  "The exact percentage fall in the American cancer death rate since 1991. The American Cancer Society's 2026 report states the absolute number of deaths averted (4.8 million); the percentage appears in the full paper's tables rather than in the abstract, and is not quoted here.",
  "Site-by-site comparisons of American survival against other rich countries. CONCORD-3 remains the reference and puts United States five-year net survival for breast cancer at about 90 per cent, among the highest recorded, but the per-site United States figures for lung, colorectal and prostate cancer could not be read from an open version, so this page does not claim where the United States does and does not lead.",
];

/** Entity ids to render from the graph, in display order. Missing ids are skipped at render time. */
export const US_INSTITUTIONS = ["nci", "nci-ccr", "fda-oce", "frederick-national-lab", "arpa-h", "nccn-org", "asco", "aacr", "md-anderson", "mskcc", "dana-farber", "mayo-clinic", "johns-hopkins", "stanford", "ucsf", "fred-hutch", "city-of-hope", "moffitt", "st-jude", "penn-abramson", "ucla-jonsson", "michigan-rogel", "wustl-siteman", "roswell-park", "unc-lineberger", "duke-cancer-institute", "osu-james", "emory-winship", "huntsman", "mgh", "broad-institute", "cold-spring-harbor", "mit-koch", "salk-institute", "jackson-laboratory", "hhmi", "ludwig-cancer-research", "parker-institute", "damon-runyon", "lustgarten-foundation", "pcf", "bcrf", "stand-up-to-cancer", "v-foundation", "alsf", "cprit", "us-oncology-network", "tennessee-oncology"];
export const US_NETWORK = ["swog", "ecog-acrin", "alliance-oncology", "nrg-oncology", "childrens-oncology-group", "nsabp-foundation", "gog-foundation", "sarc", "aids-malignancy-consortium"];
export const US_COMPANIES = ["merck", "bms", "pfizer", "eli-lilly", "abbvie", "gilead", "amgen", "johnson-johnson", "regeneron", "incyte", "moderna", "legend-biotech", "iovance", "revolution-medicines", "blueprint-medicines", "arcus-biosciences", "relay-therapeutics", "day-one-biopharmaceuticals", "springworks", "foundation-medicine", "guardant-health", "exact-sciences", "natera", "grail", "caris", "tempus", "illumina", "adaptive-biotechnologies", "flatiron-health", "varian", "accuray", "intuitive-surgical", "iqvia"];
export const US_DRUGS = ["imatinib", "trastuzumab", "sipuleucel-t", "ipilimumab", "talimogene-laherparepvec", "pembrolizumab", "tisagenlecleucel", "axicabtagene-ciloleucel", "larotrectinib", "idecabtagene-vicleucel", "lisocabtagene-maraleucel", "sotorasib", "lifileucel", "repotrectinib"];
export const US_TRIALS = ["nci-match", "combomatch", "lung-map", "alchemist", "tailorx", "rxponder", "swog-s1826", "swog-s1801", "calgb-140503", "acosog-z0011", "chaarted", "atomic", "bwel", "codel", "nlst-nelson", "plco-prostate", "ccss", "circulate-us"];
export const US_PAPERS = ["paper-unger-trial-participation-barriers-jnci-2019", "paper-loree-jama-oncol", "paper-gyawali-jama-intern-med", "paper-ramsey-health-aff-millwood", "paper-ramsey-j-clin-oncol", "paper-zafar-oncologist", "paper-gilligan-am-j-med", "paper-islami-ca-cancer-j-clin", "paper-siegel-cancer-statistics-2024-cacancer-2024", "paper-siegel-colorectal-cancer-statistics-ca-2023", "paper-allemani-concord-3-lancet-2018", "paper-nlst-nejm-2011", "paper-tailorx-nejm-2018", "paper-uspstf-crc-screening-45-jama-2021", "paper-uspstf-lung-cancer-screening-jama-2021", "paper-dess-black-race-prostate-mortality-jama-oncol-2019", "paper-scott-tnbc-disparities-uscs-cancer-2019", "paper-aldrich-uspstf-screening-african-american-smokers-jama-oncol-2019"];
export const US_PEOPLE = ["r-angelo-de-claro", "douglas-lowy", "joseph-unger", "robert-winn", "clifford-hudis", "hagop-kantarjian", "deb-schrag", "ethan-basch", "supriya-mohile", "gary-lyman", "harlan-krumholz", "joseph-ross", "robin-zon", "lori-pierce", "michael-leblanc", "selwyn-vickers", "kunle-odunsi", "mariana-chavez-macgregor", "james-allison", "carl-june", "steven-rosenberg", "brian-druker", "bert-vogelstein", "charles-sawyers", "dennis-slamon", "crystal-mackall", "eric-winer", "ann-partridge", "stephen-hunger", "ching-hon-pui", "sidney-farber", "mary-lasker", "henrietta-lacks"];

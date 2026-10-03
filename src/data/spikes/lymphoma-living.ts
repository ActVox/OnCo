import type { TermInput } from "@/lib/schema";
import type { Question } from "../questions";
import type { Spike, SpikeSupplement } from "./index";
import { CX } from "./lymphoma-treatment-shared";

/**
 * LYMPHOMA: THE DECISIONS THAT ARE THE PATIENT'S, AND LIVING WITH THE RESULT. Facet F of the lymphoma deep dive,
 * 1 October 2026.
 *
 * The patient side of the lymphoma record, written to the colorectal and gallbladder standard
 * (./colorectal-living.ts, ./gallbladder-living.ts). It holds four things and creates no cancer record, no
 * standard-of-care row, no trial, no paper and no target: facet A owns the cancer records, facet B the
 * standard-of-care rows this file's questions hang off, facet C the trials and papers, facet D the targets and
 * facet E the NICE and country rows. Every id created here starts `lymphoma-decision-` or `lymphoma-living-`.
 *
 *  1. Six decision records, one per choice that is genuinely the patient's rather than the protocol's, each giving
 *     what is known about both sides: watch and wait in follicular lymphoma; transplant or CAR-T at second line in
 *     diffuse large B-cell lymphoma; escalated chemotherapy or ABVD in advanced Hodgkin lymphoma, and how the
 *     interim-PET trials changed the question; fertility preservation, whose deadline is measured in days; a trial
 *     or standard treatment; and treatment at the local hospital against a cell-therapy centre far from home.
 *  2. Six living-with records: fatigue, the late effects of Hodgkin treatment and the screening that follows,
 *     infection and low antibodies for years after anti-CD20 and bispecific antibodies, the surveillance schedule
 *     and the evidence that routine scans do not help, going back to work, and what it is to live with an indolent
 *     lymphoma rather than to be cured of one.
 *  3. Five hand-written question sets (exported and wired in src/data/questions.ts), keyed to the settings facet B
 *     wrote word for word, so the decision pages at /cancers/<id>/decisions/ put each question under the row it
 *     belongs to.
 *  4. Supplements attaching the lymphoma records to side-effect, procedure and support records other files own.
 *
 * The red cards are in src/data/red-flags.ts (six cancer-scoped sets, `lymphoma-*`) and the first sixty days in
 * src/data/first-60-days-checklists.ts, because those files are keyed by cancer id rather than by deep dive.
 *
 * Sources. Every medical statement points at an NHS, Lymphoma Action, Macmillan or Cancer Research UK patient
 * page, a NICE guideline, a GOV.UK programme document, or a paper whose abstract was read through Europe PMC on
 * 1 October 2026. Where a figure is quoted, the cohort it came from is given with it. Nothing here is advice for
 * an individual: the pages say so, and every urgent card puts the team's own 24-hour number ahead of 111 and 999.
 */

const asOf = "2026-10-01";
const L = (label: string, url: string) => ({ label, url });
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });

// ---------------------------------------------------------------- sources: NHS and GOV.UK
const NHS_NHL = L("NHS: non-Hodgkin lymphoma", "https://www.nhs.uk/conditions/non-hodgkin-lymphoma/");
const NHS_NHL_SYMPTOMS = L("NHS: non-Hodgkin lymphoma, symptoms", "https://www.nhs.uk/conditions/non-hodgkin-lymphoma/symptoms/");
const NHS_NHL_TREATMENT = L("NHS: non-Hodgkin lymphoma, treatment", "https://www.nhs.uk/conditions/non-hodgkin-lymphoma/treatment/");
const NHS_HL = L("NHS: Hodgkin lymphoma", "https://www.nhs.uk/conditions/hodgkin-lymphoma/");
const NHS_HL_SYMPTOMS = L("NHS: Hodgkin lymphoma, symptoms", "https://www.nhs.uk/conditions/hodgkin-lymphoma/symptoms/");
const NHS_HL_TREATMENT = L("NHS: Hodgkin lymphoma, treatment", "https://www.nhs.uk/conditions/hodgkin-lymphoma/treatment/");
const NHS_SEPSIS = L("NHS: sepsis", "https://www.nhs.uk/conditions/sepsis/");
const NHS_111 = L("NHS: when to use 111", "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-use-111/");
const NHS_999 = L("NHS: when to call 999", "https://www.nhs.uk/nhs-services/urgent-and-emergency-care-services/when-to-call-999/");
const NHS_TRIALS = L("NHS: clinical trials", "https://www.nhs.uk/tests-and-treatments/clinical-trials/");
const NHS_VACCINATIONS = L("NHS: vaccinations", "https://www.nhs.uk/vaccinations/");
const NHS_CARER_ASSESSMENT = L("NHS: carer's assessments", "https://www.nhs.uk/social-care-and-support/support-and-benefits-for-carers/carer-assessments/");
const GOVUK_SSP = L("GOV.UK: statutory sick pay", "https://www.gov.uk/statutory-sick-pay");
const GOVUK_SICK_LEAVE = L("GOV.UK: taking sick leave", "https://www.gov.uk/taking-sick-leave");
const GOVUK_BREAST_VHR = L("GOV.UK: protocols for surveillance of women at higher risk of developing breast cancer, NHS Breast Screening Programme", "https://www.gov.uk/government/publications/breast-screening-higher-risk-women-surveillance-protocols/protocols-for-surveillance-of-women-at-higher-risk-of-developing-breast-cancer");
// Verified 1 October 2026: application/pdf, 55,544 bytes. The landing page is
// https://www.gov.uk/government/publications/immunisation-of-individuals-with-underlying-medical-conditions-the-green-book-chapter-7
const GREEN_BOOK_7 = L("Immunisation against infectious disease (the Green Book), chapter 7: immunisation of individuals with underlying medical conditions", "https://assets.publishing.service.gov.uk/media/5e18a52940f0b65dc1918763/Greenbook_chapter_7_Immunsing_immunosupressed.pdf");

// ---------------------------------------------------------------- sources: Lymphoma Action, the UK lymphoma charity
const LA_WATCH_WAIT = L("Lymphoma Action: active monitoring (watch and wait)", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/active-monitoring-watch-and-wait");
const LA_LATE_EFFECTS = L("Lymphoma Action: late effects of lymphoma treatment", "https://lymphoma-action.org.uk/information-and-support/side-effects-lymphoma-and-treatment/late-effects-lymphoma-treatment");
const LA_NEUTROPENIA = L("Lymphoma Action: neutropenia (low neutrophils)", "https://lymphoma-action.org.uk/information-and-support/side-effects-lymphoma-and-treatment/neutropenia-low-neutrophils");
const LA_INFECTIONS = L("Lymphoma Action: infections, risk and prevention", "https://lymphoma-action.org.uk/information-and-support/side-effects-lymphoma-and-treatment/infections-risk-and-prevention");
const LA_FERTILITY = L("Lymphoma Action: reduced fertility", "https://lymphoma-action.org.uk/information-and-support/side-effects-lymphoma-and-treatment/reduced-fertility");
const LA_MENOPAUSE = L("Lymphoma Action: early menopause and lymphoma", "https://lymphoma-action.org.uk/information-and-support/side-effects-lymphoma-and-treatment/early-menopause-and-lymphoma");
const LA_FATIGUE = L("Lymphoma Action: cancer-related fatigue", "https://lymphoma-action.org.uk/information-and-support/side-effects-lymphoma-and-treatment/cancer-related-fatigue");
const LA_CAR_T = L("Lymphoma Action: CAR-T cell therapy", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/car-t-cell-therapy");
const LA_IG = L("Lymphoma Action: immunoglobulin replacement therapy", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/immunoglobulin-replacement-therapy");
const LA_FOLLOW_UP = L("Lymphoma Action: follow-up after lymphoma treatment", "https://lymphoma-action.org.uk/information-and-support/living-and-beyond-lymphoma/follow-after-lymphoma-treatment");
const LA_RECOVERY = L("Lymphoma Action: recovery after lymphoma treatment", "https://lymphoma-action.org.uk/information-and-support/living-and-beyond-lymphoma/recovery-after-lymphoma-treatment");
const LA_EMOTIONAL = L("Lymphoma Action: the emotional impact of living with lymphoma", "https://lymphoma-action.org.uk/information-and-support/living-and-beyond-lymphoma/emotional-impact-living-lymphoma");
const LA_WORK = L("Lymphoma Action: lymphoma, work and you", "https://lymphoma-action.org.uk/information-and-support/living-and-beyond-lymphoma/day-day-living/lymphoma-work-and-you");
const LA_RELAPSE = L("Lymphoma Action: when lymphoma comes back, or does not respond", "https://lymphoma-action.org.uk/information-and-support/living-and-beyond-lymphoma/lymphoma-comes-back-relapses-or-doesnt-respond");
const LA_BIOPSY = L("Lymphoma Action: biopsy", "https://lymphoma-action.org.uk/information-and-support/tests-scans-and-lymphoma-staging/biopsy");
const LA_CT_PET = L("Lymphoma Action: CT and PET/CT scans", "https://lymphoma-action.org.uk/information-and-support/tests-scans-and-lymphoma-staging/ct-and-petct-scan");
const LA_STAGING = L("Lymphoma Action: lymphoma staging", "https://lymphoma-action.org.uk/information-and-support/tests-scans-and-lymphoma-staging/lymphoma-staging");
const LA_MDT = L("Lymphoma Action: your medical team", "https://lymphoma-action.org.uk/information-and-support/tests-scans-and-lymphoma-staging/your-medical-team-mdt");
const LA_QUESTIONS = L("Lymphoma Action: questions to ask your medical team about lymphoma", "https://lymphoma-action.org.uk/information-and-support/tests-scans-and-lymphoma-staging/questions-ask-your-medical-team-about-lymphoma");
const LA_WAITING = L("Lymphoma Action: waiting for test and scan results", "https://lymphoma-action.org.uk/information-and-support/tests-scans-and-lymphoma-staging/waiting-test-and-scan-results");
const LA_FL = L("Lymphoma Action: follicular lymphoma", "https://lymphoma-action.org.uk/information-and-support/types-lymphoma/non-hodgkin-lymphoma/follicular-lymphoma");
const LA_DLBCL = L("Lymphoma Action: diffuse large B-cell lymphoma", "https://lymphoma-action.org.uk/information-and-support/types-lymphoma/non-hodgkin-lymphoma/diffuse-large-b-cell-lymphoma");
const LA_CHL = L("Lymphoma Action: classical Hodgkin lymphoma", "https://lymphoma-action.org.uk/information-and-support/types-lymphoma/hodgkin-lymphoma/classical-hodgkin-lymphoma");
const LA_TRANSFORMATION = L("Lymphoma Action: transformation of lymphoma", "https://lymphoma-action.org.uk/information-and-support/types-lymphoma/transformation-lymphoma");
const LA_ASCT = L("Lymphoma Action: autologous (your own) stem cell transplant", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/stem-cell-transplants/self-autologous-stem-cell");
const LA_TRIALS = L("Lymphoma Action: taking part in a clinical trial", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/clinical-trials-lymphoma-trialslink/taking-part-clinical");
const LA_GROWTH_FACTORS = L("Lymphoma Action: growth factors", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/growth-factors");
const LA_PREHAB = L("Lymphoma Action: getting ready for treatment (prehabilitation)", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/getting-ready-treatment-prehabilitation");
const LA_PALLIATIVE = L("Lymphoma Action: palliative care", "https://lymphoma-action.org.uk/information-and-support/lymphoma-treatment/palliative-care");
const LA_EXERCISE = L("Lymphoma Action: exercise and lymphoma", "https://lymphoma-action.org.uk/information-and-support/living-and-beyond-lymphoma/exercise-and-lymphoma");
const LA_CARERS = L("Lymphoma Action: caring for someone who has lymphoma", "https://lymphoma-action.org.uk/information-and-support/relationships-family-friends/caring-someone-who-has-lymphoma");
const LA_HELPLINE = L("Lymphoma Action: helpline services", "https://lymphoma-action.org.uk/information-and-support/support-you/helpline-services");
const LA_BREAST_SCREENING_RECALL = L("Lymphoma Action: annual breast screening missed following radiotherapy for Hodgkin lymphoma", "https://lymphoma-action.org.uk/news/annual-breast-screening-missed-following-radiotherapy-hodgkin-lymphoma");

// ---------------------------------------------------------------- sources: Macmillan, Cancer Research UK, Maggie's
const MAC_LYMPHOMA = L("Macmillan: lymphoma", "https://www.macmillan.org.uk/cancer-information-and-support/lymphoma");
const MAC_NHL = L("Macmillan: non-Hodgkin lymphoma", "https://www.macmillan.org.uk/cancer-information-and-support/lymphoma/non-hodgkin-lymphoma");
const MAC_HL = L("Macmillan: Hodgkin lymphoma", "https://www.macmillan.org.uk/cancer-information-and-support/lymphoma/hodgkin-lymphoma");
const MAC_SEPSIS = L("Macmillan: sepsis", "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/sepsis");
const MAC_SVCO = L("Macmillan: superior vena cava obstruction", "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/superior-vena-cava-obstruction");
const MAC_MSCC = L("Macmillan: metastatic spinal cord compression", "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/metastatic-spinal-cord-compression");
const MAC_TIREDNESS = L("Macmillan: tiredness (fatigue)", "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/tiredness");
const MAC_WORK = L("Macmillan: work and cancer", "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/work-and-cancer");
const MAC_FERTILITY = L("Macmillan: fertility and cancer", "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/fertility");
const CRUK_NHL_LIVING = L("Cancer Research UK: living with non-Hodgkin lymphoma", "https://www.cancerresearchuk.org/about-cancer/non-hodgkin-lymphoma/living-with");
const CRUK_HL_LIVING = L("Cancer Research UK: living with Hodgkin lymphoma", "https://www.cancerresearchuk.org/about-cancer/hodgkin-lymphoma/living-with");
const CRUK_NHL_FOLLOWUP = L("Cancer Research UK: follow-up for non-Hodgkin lymphoma", "https://www.cancerresearchuk.org/about-cancer/non-hodgkin-lymphoma/treatment/follow-up");
const CRUK_NHL_TESTS = L("Cancer Research UK: tests to diagnose non-Hodgkin lymphoma", "https://www.cancerresearchuk.org/about-cancer/non-hodgkin-lymphoma/getting-diagnosed/tests-diagnose");
const MAGGIES = L("Maggie's: support and information", "https://www.maggies.org/support-and-information/");

// ---------------------------------------------------------------- sources: guidelines
const NICE_NG52 = L("NICE NG52: non-Hodgkin's lymphoma, diagnosis and management", "https://www.nice.org.uk/guidance/ng52");
const NICE_NG47 = L("NICE NG47: haematological cancers, improving outcomes", "https://www.nice.org.uk/guidance/ng47");
const NICE_CG151 = L("NICE CG151: neutropenic sepsis", "https://www.nice.org.uk/guidance/cg151");
const NICE_NG234 = L("NICE NG234: spinal metastases and metastatic spinal cord compression", "https://www.nice.org.uk/guidance/ng234");

// ---------------------------------------------------------------- sources: papers, each abstract read on Europe PMC
const doi = (label: string, id: string) => ({ label, url: `https://doi.org/${id}` });
const SCHAAPVELD = doi("Schaapveld et al., second cancer risk up to 40 years after treatment for Hodgkin's lymphoma, New England Journal of Medicine 2015 (3,905 Dutch survivors)", "10.1056/NEJMoa1505949");
const VAN_NIMWEGEN = doi("van Nimwegen et al., cardiovascular disease after Hodgkin lymphoma treatment, 40-year disease risk, JAMA Internal Medicine 2015 (2,524 Dutch patients)", "10.1001/jamainternmed.2015.1180");
const THOMPSON_SURVEILLANCE = doi("Thompson et al., utility of routine post-therapy surveillance imaging in diffuse large B-cell lymphoma, Journal of Clinical Oncology 2014", "10.1200/JCO.2014.55.7561");
const BEHRINGER = doi("Behringer et al., gonadal function and fertility in survivors after Hodgkin lymphoma treatment within the German Hodgkin Study Group HD13 to HD15 trials, Journal of Clinical Oncology 2013 (1,323 survivors)", "10.1200/JCO.2012.44.3721");
const RATHL_PAPER = doi("Johnson et al., adapted treatment guided by interim PET-CT scan in advanced Hodgkin's lymphoma (RATHL), New England Journal of Medicine 2016", "10.1056/NEJMoa1510093");
const HD21_PAPER = doi("Borchmann et al., PET-guided BrECADD versus escalated BEACOPP in advanced-stage classical Hodgkin lymphoma (HD21), Lancet 2024", "10.1016/S0140-6736(24)01315-1");
const ZUMA7 = doi("Locke et al., axicabtagene ciloleucel as second-line therapy for large B-cell lymphoma (ZUMA-7), New England Journal of Medicine 2022", "10.1056/NEJMoa2116133");
const ZUMA7_OS = doi("Westin et al., survival with axicabtagene ciloleucel in large B-cell lymphoma (ZUMA-7 five-year analysis), New England Journal of Medicine 2023", "10.1056/NEJMoa2301665");
const BELINDA = doi("Bishop et al., second-line tisagenlecleucel or standard care in aggressive B-cell lymphoma (BELINDA), New England Journal of Medicine 2022", "10.1056/NEJMoa2116596");
const ARDESHNA = doi("Ardeshna et al., rituximab versus a watch and wait approach in asymptomatic advanced follicular lymphoma, Lancet Oncology 2014 (379 patients)", "10.1016/S1470-2045(14)70027-0");
const BSH_TLS = doi("British Committee for Standards in Haematology: guidelines for the management of tumour lysis syndrome in adults and children with haematological malignancies, British Journal of Haematology 2015", "10.1111/bjh.13403");

const NOT_ADVICE = "This is orientation from public patient pages, guidelines and the trials themselves, not advice for your case: your own team's instructions and the 24-hour number they gave you come first, and no figure here is a prediction about you.";

// ================================================================ THE DECISIONS
/**
 * Six records, one per choice that belongs to the person rather than the protocol. Each says who faces it, what is
 * known about each side with the cohort the figure came from, and what is not known. They are glossary records
 * rather than standard-of-care rows because facet B owns the rows; these sit beside them and are linked from the
 * cancer records that carry the rows.
 */
const decisionTerms: TermInput[] = [
  term({
    id: "lymphoma-decision-watch-and-wait",
    name: "Watch and wait in follicular lymphoma: being told you have cancer and that nobody will treat it",
    category: "Clinical",
    aka: ["Active monitoring follicular lymphoma", "Deferred treatment follicular lymphoma", "Watchful waiting lymphoma"],
    cancers: [CX.fl, CX.nhl, CX.mzl, CX.smzl, CX.nmzl, CX.malt, CX.wm, CX.nlphl],
    tldr: "For a slow-growing lymphoma that is not causing problems, treating straight away has not been shown to help people live longer, so the usual plan is regular checks and treatment later. It is the hardest thing in lymphoma to be told, and the evidence behind it is good.",
    summary: `What the choice is. Most follicular lymphoma is advanced by the time it is found, because it grows slowly and causes few symptoms. For someone with no symptoms, no organ problem and no fast-growing nodes, the options are to start treatment now or to be monitored and treated when the disease begins to cause trouble. Lymphoma Action calls the second one active monitoring, and lists the diseases it is used for: follicular lymphoma except grade 3B, the marginal zone lymphomas, Waldenstrom macroglobulinaemia, chronic lymphocytic leukaemia and small lymphocytic lymphoma, some mantle cell lymphoma, and nodular lymphocyte predominant Hodgkin lymphoma.

What is known about waiting. The randomised evidence is a British-led trial of 379 people with asymptomatic, non-bulky, advanced follicular lymphoma, reported by Ardeshna and colleagues in 2014. People given rituximab waited longer before needing chemotherapy or radiotherapy than people watched, and overall survival did not differ between the groups. In other words, starting treatment earlier bought time to the next treatment and did not add years of life. Lymphoma Action lists the gains from waiting plainly: you avoid the side effects and the late effects for as long as possible, the full range of treatment is still open to you, your appointments are occasional rather than constant, and new treatments arrive while you wait.

What is known about the waiting itself. Lymphoma Action says monitoring means one to four check-ups a year, with a conversation about symptoms, an examination of the neck, armpits, groin and abdomen, and blood tests; a scan is not usually done unless the team suspects the lymphoma is growing, in order to avoid unnecessary radiation. Treatment is usually suggested when the marrow is affected and blood counts are falling, when an organ is affected, when nodes or the spleen grow quickly or appear in new places, when fever, night sweats and weight loss appear, or when symptoms become difficult to live with. Some people need treatment soon; some wait many years; some never need it.

What nobody can tell you. How long your own wait will be. Lymphoma Action says this varies a great deal and is hard to predict, and that follicular lymphoma transforms into a faster-growing lymphoma in 2 to 3 people in every 100 each year, which is why a change in symptoms is a reason to ring rather than to wait for the next appointment.

The part that is not medical. A person on active monitoring quoted on the Lymphoma Action page puts the difficulty exactly: "Active monitoring is counter-intuitive: 'I have cancer, but it's not being treated.' There is no physical battle, but there is a psychological challenge." The charity says many people find it helps to think of the lymphoma as a long-term condition to manage, that family and friends often find the approach harder to understand than the patient does, and that anxiety in the weeks before a check-up is common. Its helpline is free on 0808 808 5555 and is open to relatives as well as patients.`,
    terms: ["watchful-waiting", "lymphoma-tx-watch-and-wait", "flipi", "lymphoma-living-indolent-lymphoma", "lymphoma-living-scanxiety-and-surveillance"],
    technologies: ["psycho-oncology", "peer-support-groups"],
    links: [LA_WATCH_WAIT, LA_FL, ARDESHNA, NHS_NHL_TREATMENT, MAC_NHL, LA_HELPLINE],
  }),

  term({
    id: "lymphoma-decision-transplant-or-car-t",
    name: "Transplant or CAR-T at second line in diffuse large B-cell lymphoma",
    category: "Clinical",
    aka: ["Second-line DLBCL decision", "Autologous transplant or CAR-T", "ZUMA-7 decision", "Early relapse large B-cell lymphoma"],
    cancers: [CX.dlbcl, CX.pmbcl, CX.nhl],
    tldr: "If a large B-cell lymphoma comes back within a year of first treatment, two trials found that engineered T cells worked better than salvage chemotherapy followed by a transplant of the person's own stem cells, and a third trial of a different T-cell product found no difference. If it comes back later, the transplant route is still standard.",
    summary: `What the choice is. After first-line chemoimmunotherapy fails, the older path is two or three cycles of salvage chemotherapy, then, for whoever responds, high-dose chemotherapy with a transplant of the person's own stem cells. The newer path is a single infusion of the person's own T cells, re-engineered to recognise a protein on the lymphoma, with a wait of several weeks while the cells are made. The two are not interchangeable: the timing of the relapse is what decides which is on the table.

What the trials found. ZUMA-7 randomised 359 people whose large B-cell lymphoma was refractory to first-line treatment or had relapsed within 12 months of it, to axicabtagene ciloleucel or to standard care. At a median of 24.9 months, median event-free survival was 8.3 months with the cell therapy and 2.0 months with standard care, and 24-month event-free survival was 41 per cent against 16 per cent. The prespecified survival analysis at five years, with a median follow-up of 47.2 months, found median overall survival not reached in the cell-therapy group and 31.1 months in the standard-care group, with estimated four-year survival of 54.6 per cent against 46.0 per cent. These are trial-population figures: 74 per cent of those enrolled had primary refractory disease or other high-risk features.

What the trial that failed found. BELINDA randomised 322 people with the same kind of early relapse to tisagenlecleucel or to salvage chemotherapy and transplant, and found median event-free survival of 3.0 months in both groups. Two things in that trial are worth knowing when the conversation turns to the wait: the median time from cell collection to infusion was 52 days, and 25.9 per cent of the cell-therapy group had lymphoma progression by week 6, against 13.8 per cent of the standard-care group. The result is usually read as a statement about the product, the bridging treatment and the waiting time together, not about the idea.

What this means for the person in front of the decision. If the relapse was early, the question is usually which cell therapy and how quickly it can be arranged, and the honest difficulty is the wait. If the relapse was late, salvage chemotherapy and an autologous transplant remain the standard route, and the cell therapy is held for afterwards. Only about a third of the standard-care group in BELINDA actually reached a transplant, which is the other half of the comparison: the transplant route only helps the people whose lymphoma responds to the salvage chemotherapy first.

What each costs you. Lymphoma Action describes the transplant route as high-dose chemotherapy with several weeks in hospital, and the cell-therapy route as apheresis, a wait of several weeks while the cells are made, lymphodepleting chemotherapy, at least ten days in hospital, four weeks living within about an hour of the centre with someone else present at all times, and a one-in-five chance of needing intensive care. Both routes leave the immune system low for a long time afterwards.`,
    terms: ["lymphoma-tx-transplant-role", "lymphoma-tx-car-t-pathway", "autologous-transplant", "crs", "icans", "lymphoma-living-infection-years-after", "lymphoma-decision-local-or-car-t-centre"],
    technologies: ["autologous-stem-cell-transplant", "car-t"],
    trials: ["zuma-7", "transform", "belinda"],
    links: [ZUMA7, ZUMA7_OS, BELINDA, LA_CAR_T, LA_ASCT, LA_DLBCL, LA_RELAPSE],
  }),

  term({
    id: "lymphoma-decision-beacopp-or-abvd",
    name: "Escalated chemotherapy or ABVD in advanced Hodgkin lymphoma: more cures, more late harm, and what the interim scan changed",
    category: "Clinical",
    aka: ["BEACOPP or ABVD", "Escalated BEACOPP decision", "BrECADD decision", "PET-adapted Hodgkin treatment"],
    cancers: [CX.hodgkin, CX.hodgkinAdvanced],
    tldr: "Advanced Hodgkin lymphoma can be treated with a gentler combination that fewer people are cured by first time, or a harder one that cures more but leaves more lasting harm. Scanning after two cycles, and the newer escalated regimens, have narrowed the gap between the two rather than settled the argument.",
    summary: `What the choice used to be. For thirty years the question in advanced Hodgkin lymphoma was whether to give ABVD, which most people get through without being admitted, or escalated BEACOPP, which controls the disease in more people first time and carries more infection, more infertility and more second cancers. Because Hodgkin lymphoma mostly affects people in their twenties and thirties and most of them are cured, the argument was never only about the first two years.

What the interim scan changed. RATHL registered 1,214 people with newly diagnosed advanced classical Hodgkin lymphoma, gave two cycles of ABVD and scanned. 937 of the 1,119 scanned (83.7 per cent) had a negative scan; those people were randomly assigned to continue ABVD or to drop the bleomycin. At a median follow-up of 41 months, three-year progression-free survival was 85.7 per cent with ABVD and 84.4 per cent without the bleomycin, overall survival 97.2 and 97.6 per cent, and respiratory adverse events were more severe in the group that kept the bleomycin. The 172 people with a positive scan were escalated to BEACOPP; 74.4 per cent had a negative third scan, and their three-year progression-free survival was 67.5 per cent. The practical change is that the decision is no longer taken once, before anything is known: most people are treated gently and only the minority whose scan is still positive are escalated.

What the newer escalated regimen changed. HD21 randomised 1,500 people under 61 with newly diagnosed advanced-stage classical Hodgkin lymphoma to escalated BEACOPP or to BrECADD, both guided by the scan after two cycles. Treatment-related morbidity, a co-primary endpoint, was significantly lower with BrECADD, in 312 of 738 people (42 per cent) against 430 of 732 (59 per cent), a relative risk of 0.72. The escalated approach became less harmful rather than less escalated.

What the late harm actually is, in numbers. The two Dutch cohorts are the reason this decision is weighed over decades. Among 3,905 people who survived at least five years after Hodgkin treatment given between 1965 and 2000 at ages 15 to 50, 1,055 second cancers occurred in 908 people over a median 19.1 years, 4.6 times the rate expected from the general population, still 3.9 times higher 35 or more years on, and the cumulative incidence of a second cancer at 40 years was 48.5 per cent. Among 2,524 people treated before the age of 51 between 1965 and 1995, the 40-year cumulative incidence of cardiovascular disease was 50 per cent, with mediastinal radiotherapy and anthracycline chemotherapy each carrying their own increase. Both cohorts were treated with the radiotherapy fields and doses of their era, which are larger than anything used now, and the second-cancer paper's own finding was that the risk of second solid cancers was no lower in the most recent period it studied.

What the fertility difference is, in numbers. In the German HD13 to HD15 survivor analysis of 1,323 people, hormone levels tracked the intensity of treatment. After six to eight cycles of escalated BEACOPP, menstrual activity depended strongly on age: 82 per cent in women under 30 and 45 per cent in women of 30 or more, and 34 per cent of women aged 30 or over had severe menopausal symptoms, three to four times more often than expected. Male survivors had mean testosterone in the normal range and reported no increase in symptoms of low testosterone. The fertility conversation therefore belongs before the first cycle, not after it.

What is not settled. Which of the two modern answers is better. The United States standard after SWOG S1826 is nivolumab with AVD; the German and much of the European standard after HD21 is PET-guided BrECADD. No trial has compared them. Facet B's rows set out each.`,
    terms: ["lymphoma-tx-hodgkin-late-effects", "deauville", "lymphoma-living-hodgkin-survivorship-screening", "lymphoma-decision-fertility-timing", "secondary-malignancy", "cardiotoxicity"],
    technologies: ["pet-adapted-therapy", "fertility-preservation"],
    trials: ["rathl", "hd21", "swog-s1826", "echelon-1"],
    links: [RATHL_PAPER, HD21_PAPER, SCHAAPVELD, VAN_NIMWEGEN, BEHRINGER, LA_CHL, LA_LATE_EFFECTS, NHS_HL_TREATMENT],
  }),

  term({
    id: "lymphoma-decision-fertility-timing",
    name: "Fertility preservation before lymphoma treatment: a decision with a deadline in days",
    category: "Clinic basics",
    aka: ["Sperm banking before chemotherapy", "Egg freezing before lymphoma treatment", "Oncofertility referral lymphoma"],
    cancers: [CX.hodgkin, CX.hodgkinEarly, CX.hodgkinAdvanced, CX.dlbcl, CX.burkitt, CX.pmbcl, CX.nhl, CX.fl, CX.ptcl],
    tldr: "Most of the ways of preserving fertility have to happen before the first dose of chemotherapy, and two of them take about a fortnight. Lymphoma is often treated quickly, so this is one of the few decisions in the illness with a real deadline, and it is easy to miss while everything else is being arranged.",
    summary: `Why the clock matters here more than in most cancers. Lymphoma is commonly diagnosed in people of reproductive age, and an aggressive lymphoma is usually treated within days or a very few weeks of diagnosis. Lymphoma Action says fertility preservation is generally more effective when it begins before lymphoma treatment, and that sperm must be banked before treatment starts because treatment affects both the number and the quality of sperm.

What takes how long. Sperm banking takes a visit or a few visits and can usually be arranged quickly; Lymphoma Action says NICE recommends that all men whose cancer treatment could affect their fertility be offered it, and that it is also an option for teenagers who have been through puberty. Egg freezing is the slower one: Lymphoma Action describes about two weeks of daily injections to stimulate the ovaries before the eggs are collected under ultrasound guidance. Embryo storage begins the same way and takes the same time, with the added point that if a partner withdraws consent later the embryos must be destroyed. Ovarian tissue freezing is keyhole surgery and is possible before puberty. Testicular tissue freezing is offered for research only, in a very small number of centres, and no baby has yet been born through it.

What NICE says, as Lymphoma Action quotes it. There should be no lower age limit on who is offered fertility preservation before treatment; people who go on to have fertility difficulties should be offered support and counselling; preservation may be available up to the age of 40, although this varies across the NHS; and the impact of the cancer and its treatment on future fertility should be discussed at diagnosis between the person and their cancer team.

What the risk actually is. It depends on the drugs, the total dose and, for women, age. Lymphoma Action says most women who have lymphoma treatment can have children naturally afterwards, that periods very commonly stop during chemotherapy and usually return in younger women, and that chemotherapy does not affect the uterus's ability to carry a pregnancy. High-dose chemotherapy before a stem cell transplant raises the risk; radiotherapy to the pelvis can cause temporary or permanent infertility in both sexes; and total body irradiation usually causes permanent infertility and often leaves a woman unable to carry a pregnancy. In the German HD13 to HD15 survivor analysis, after six to eight cycles of escalated BEACOPP menstrual activity was reported by 82 per cent of women under 30 and 45 per cent of women aged 30 or more.

The question to ask on the first day. Whether the planned treatment carries a fertility risk, whether a referral to a fertility clinic has been made, and how many days there are before treatment must start. Those three answers together are the decision. If treatment cannot safely wait two weeks, the options narrow, and knowing that early is better than finding it out afterwards.`,
    terms: ["lymphoma-tx-fertility-preservation", "late-effects", "lymphoma-decision-beacopp-or-abvd"],
    technologies: ["fertility-preservation"],
    links: [LA_FERTILITY, LA_MENOPAUSE, BEHRINGER, MAC_FERTILITY],
  }),

  term({
    id: "lymphoma-decision-trial",
    name: "A clinical trial or standard treatment in lymphoma",
    category: "Trials",
    aka: ["Taking part in a lymphoma trial", "Lymphoma TrialsLink", "Trial or standard care lymphoma"],
    cancers: [CX.nhl, CX.dlbcl, CX.hodgkin, CX.fl, CX.mcl, CX.ptcl, CX.ctcl, CX.pcnsl, CX.burkitt, CX.wm, CX.mzl],
    tldr: "Lymphoma has more trials open to it than almost any other cancer, and in several situations a trial is a reasonable choice beside standard treatment rather than a last resort. Asking early keeps the option open, because many trials require that a particular treatment has not yet been given.",
    summary: `Why the question comes early in this disease. Almost every standard lymphoma treatment in use today was set by a trial a patient agreed to join, and the places where practice is least settled are the places where a trial is open: first-line treatment of advanced Hodgkin lymphoma, early-relapsing large B-cell lymphoma, follicular lymphoma that progresses within two years, mantle cell lymphoma, and nearly all of the peripheral T-cell lymphomas. Lymphoma Action runs a lymphoma-specific trials database, Lymphoma TrialsLink, with a free enquiry service.

The practical reason to ask on the first visit. Most trials specify what treatment a person may already have had. A trial of a first-line treatment closes to you the day the first-line treatment starts, and a trial for people who have had one previous treatment closes after the second. The NHS trials page sets out what taking part involves, that participation is voluntary and that you can leave at any time without affecting your care.

What taking part is actually like. Lymphoma Action's page on taking part describes the consent process, the extra visits, scans and blood tests that most trials add, the travel, and the right to withdraw. It is honest about the asymmetry: a randomised trial exists because nobody knows which arm is better, so joining one is not the same as being given the better treatment, and the benefit to the person taking part is uncertain even when the benefit to the next patient is not.

Two questions that are worth asking out loud. First, whether a trial that is not open at this hospital is open at another, and whether the team will refer. Second, what happens to travel and accommodation costs, which many trials reimburse and few people are told about unprompted.`,
    terms: ["clinical-trial", "trial-phases", "informed-consent"],
    technologies: ["multidisciplinary-tumour-board"],
    links: [LA_TRIALS, NHS_TRIALS, LA_MDT, NICE_NG47],
  }),

  term({
    id: "lymphoma-decision-local-or-car-t-centre",
    name: "Treatment at the local hospital or at a cell-therapy centre far from home",
    category: "Clinic basics",
    aka: ["CAR-T centre travel", "Treatment away from home lymphoma", "Where to have CAR-T"],
    cancers: [CX.dlbcl, CX.pmbcl, CX.mcl, CX.fl, CX.nhl, CX.hodgkinRelapsed],
    tldr: "Most lymphoma chemotherapy is given at the nearest hospital, but engineered T-cell treatment is only given at a small number of approved centres, and it requires living near that centre for about a month with another adult present. The travel and the accommodation are part of the decision, not an administrative detail.",
    summary: `What is and is not local. Chemotherapy, antibody treatment and radiotherapy for lymphoma are given at the local cancer unit. Engineered T-cell therapy is not: Lymphoma Action says it can only be given at approved treatment centres with the facilities and staff to administer it safely, that eligibility is decided by a national panel of clinical experts rather than locally, and that if you are eligible you might have to travel some distance for it.

What the month afterwards requires. Lymphoma Action sets this out plainly, and it is the part people are least prepared for. Most people stay in hospital for at least ten days after the infusion. After discharge you must stay close to the centre, usually within an hour or two's travel, for four weeks, because the serious reactions happen in that window. You must have someone with you at all times for those four weeks, and you might not be discharged from hospital at all if there is nobody who can stay with you. If you live more than an hour away you may need to arrange accommodation nearby, and the hospital team may be able to help with this.

What else follows from the distance. If neurotoxicity occurs, the advice is not to drive for eight weeks from the onset of symptoms. Scans to assess the response are usually done at one month and three months, and sometimes at six, which means further journeys. Around one person in five who has this treatment needs intensive care, which is the reason the proximity rule exists rather than a formality.

What the question is. Not whether to accept travel, but whether the arrangements that make travel possible are in place before the cells are collected: who the other adult will be for four weeks, where you will both stay, what it costs, what the hospital or a charity will contribute, and what happens to the rest of the household and to work in the meantime. Asking the clinical nurse specialist and the charity helpline before apheresis, rather than in the week of discharge, is what makes the difference.`,
    terms: ["lymphoma-tx-car-t-pathway", "lymphoma-decision-transplant-or-car-t", "financial-toxicity", "icans"],
    technologies: ["car-t", "financial-navigation", "peer-support-groups"],
    links: [LA_CAR_T, LA_HELPLINE, MAGGIES, NICE_NG47],
  }),
];

// ================================================================ LIVING WITH AND AFTER
const livingTerms: TermInput[] = [
  term({
    id: "lymphoma-living-fatigue",
    name: "Fatigue after lymphoma treatment, and why it is a symptom to report",
    category: "Side effects",
    aka: ["Cancer-related fatigue lymphoma", "Tiredness after lymphoma treatment"],
    cancers: [CX.nhl, CX.dlbcl, CX.hodgkin, CX.fl, CX.mcl, CX.mzl, CX.ptcl, CX.ctcl, CX.wm],
    tldr: "The tiredness that follows lymphoma treatment is not ordinary tiredness and does not reliably improve with rest. Several of its causes, including anaemia, an underactive thyroid, poor sleep and low mood, are separate and separately treatable, which is the reason to report it rather than to absorb it.",
    summary: `What it is. Lymphoma Action describes cancer-related fatigue as extreme tiredness that can be physical, mental and emotional, that is not relieved by sleep in the way ordinary tiredness is, and that can start during treatment and continue for months or years afterwards. It is listed both as a side effect, starting during or soon after treatment, and as something that can also appear as a late effect months or years later.

Why it is worth taking apart. Several contributors to it have their own treatment. Anaemia is one, and is found on a full blood count. An underactive thyroid is another, and after radiotherapy to the neck Lymphoma Action says a blood test is done once a year to check for it; the charity notes that the risk of an underactive thyroid is highest in the first five years after treatment and stays higher than it would otherwise have been after that. Lung scarring after chest radiotherapy, bleomycin or rituximab can present as breathlessness on exertion rather than as tiredness. Low mood and poor sleep are treatable in their own right. Pursuing the list is more useful than being told to pace yourself.

What helps. Lymphoma Action's exercise material and the general cancer literature both put graded physical activity ahead of rest; the charity publishes practical material on planning activities around energy levels and on coping with fatigue. Macmillan's tiredness page describes the same approach for any cancer.

The honest part. For some people the fatigue lasts a long time, and a person can be in complete remission and still unable to work a full week. Lymphoma Action's recovery material treats this as a recognised part of recovery rather than as a failure to bounce back, and its support meetings include ones about fatigue specifically.`,
    terms: ["cancer-related-fatigue", "late-effects", "anaemia", "lymphoma-living-returning-to-work"],
    technologies: ["cbt-fatigue-distress", "exercise-during-chemotherapy", "survivorship-care-plan"],
    links: [LA_FATIGUE, LA_LATE_EFFECTS, LA_EXERCISE, LA_RECOVERY, MAC_TIREDNESS, CRUK_NHL_LIVING],
  }),

  term({
    id: "lymphoma-living-hodgkin-survivorship-screening",
    name: "After Hodgkin lymphoma: the late effects, and the screening that follows them",
    category: "Clinical",
    aka: ["Hodgkin survivorship screening", "Breast screening after chest radiotherapy", "Late effects clinic Hodgkin"],
    cancers: [CX.hodgkin, CX.hodgkinEarly, CX.hodgkinAdvanced, CX.hodgkinRelapsed, CX.nlphl],
    tldr: "Most people treated for Hodgkin lymphoma are cured, and the long follow-up cohorts show that the treatment leaves a raised risk of heart disease, of a second cancer and of an underactive thyroid for decades. Several of those risks have a screening programme attached, and the commonest failure is not being enrolled in it.",
    summary: `Why this is the best documented survivorship literature in oncology. Hodgkin lymphoma mostly affects people in their twenties and thirties and most of them are cured, so two Dutch cohorts have been able to follow survivors for forty years.

Second cancers. Among 3,905 people who survived at least five years after treatment given between 1965 and 2000 at ages 15 to 50, 1,055 second cancers were diagnosed in 908 people over a median follow-up of 19.1 years, a standardised incidence ratio of 4.6 against the general population. The rate was still 3.9 times higher 35 or more years after treatment, and the cumulative incidence of a second cancer at 40 years in that cohort was 48.5 per cent. The authors' own conclusion was that the risk of second solid cancers was not lower among those treated in the most recent period they studied, 1989 to 2000, than in the two earlier ones. Those patients were treated with the radiotherapy fields of their era; modern fields are much smaller, and what that is worth over forty years is not yet known, because the cohort that would measure it has not been followed for forty years.

Breast cancer after chest radiotherapy, and the screening that answers it. The NHS Breast Screening Programme places women who received radiotherapy to breast tissue during treatment for Hodgkin or non-Hodgkin lymphoma between the ages of 10 and under 36 into its very high risk group, alongside proven gene carriers, and screens them annually, usually with magnetic resonance imaging. Lymphoma Action says screening usually begins 8 to 15 years after treatment, which is when the raised risk emerges. In the Dutch cohort, the risk of breast cancer was lower after supradiaphragmatic radiotherapy that did not include the axilla than after the older mantle field, with a hazard ratio of 0.37.

That this can go wrong, and has. NHS England contacted 1,487 women in England who should have been referred for annual breast screening and may not have been: women who received radiotherapy above the waist for Hodgkin lymphoma between the ages of 10 and 35 inclusive in the years 1962 to 2003. Everyone treated after 2003 would have been enrolled automatically. If you were treated above the waist as a young woman and have never been invited, that is a reason to ask rather than to assume.

The heart. Among 2,524 Dutch patients treated before the age of 51 between 1965 and 1995, 1,713 cardiovascular events occurred in 797 people over a median 20 years. Thirty-five or more years on, coronary heart disease and heart failure were still 4 to 6 times more common than in the general population. The 40-year cumulative incidence of cardiovascular disease in that cohort was 50 per cent, and 51 per cent of those affected had more than one event. Mediastinal radiotherapy raised the risk of coronary disease, valve disease and heart failure; anthracycline chemotherapy raised the risk of valve disease and heart failure. The effects of radiotherapy, anthracyclines and smoking appeared to add together, which is the strongest argument for stopping smoking that this literature contains.

The thyroid, the lungs and the bones. Lymphoma Action says radiotherapy to the neck or upper chest, some chemotherapy drugs and some targeted treatments can cause an underactive thyroid, that the risk is highest in the first five years and stays raised after that, that it is found on a blood test and treated with thyroxine tablets, and that a yearly thyroid blood test follows neck radiotherapy. Lung scarring can follow chest radiotherapy, bleomycin or rituximab. High-dose steroids, some chemotherapy and radiotherapy to the treated area can thin the bones.

The practical answer. Lymphoma Action says the team should give you and your general practitioner a written treatment summary listing the treatment you had, the side effects and late effects to expect, the symptoms that could mean the lymphoma has returned, who to contact at any hour, and any lifestyle recommendations. Asking for that document, keeping it, and showing it to any health professional who treats you afterwards is what converts this literature into something a person can act on.`,
    terms: ["lymphoma-tx-hodgkin-late-effects", "late-effects", "secondary-malignancy", "cardiotoxicity", "lymphoma-living-scanxiety-and-surveillance"],
    technologies: ["survivorship-care-plan", "mammography", "mri"],
    links: [SCHAAPVELD, VAN_NIMWEGEN, GOVUK_BREAST_VHR, LA_BREAST_SCREENING_RECALL, LA_LATE_EFFECTS, LA_FOLLOW_UP, CRUK_HL_LIVING],
  }),

  term({
    id: "lymphoma-living-infection-years-after",
    name: "Low antibodies and infection risk for years after anti-CD20 and bispecific antibodies",
    category: "Side effects",
    aka: ["Hypogammaglobulinaemia after rituximab", "Infection risk after CAR-T", "Immunoglobulin replacement lymphoma", "B-cell aplasia"],
    cancers: [CX.nhl, CX.dlbcl, CX.fl, CX.mcl, CX.mzl, CX.malt, CX.smzl, CX.nmzl, CX.wm, CX.pmbcl, CX.hodgkin],
    tldr: "Treatments that remove B cells also remove the cells that make antibodies, and the effect can last for years after the last dose. Most people need nothing more than ordinary vigilance, but some need preventive antibiotics or infusions of donor antibodies, and a fever at any point in that period is an emergency rather than a nuisance.",
    summary: `Why it lasts. Rituximab and obinutuzumab deplete normal B cells along with the lymphoma, as do the bispecific antibodies and the engineered T-cell therapies that target the same protein. Lymphoma Action says that after engineered T-cell therapy B cell levels are likely to be low for a long time, sometimes several years, and that because B cells make antibodies, a low B cell count and low antibody levels raise the risk of infection. The same mechanism follows repeated courses of rituximab, and maintenance treatment extends it.

What is done about it. Lymphoma Action says most people with lymphoma do not need immunoglobulin replacement. Where antibody levels are low, preventive antibiotics are usually enough. Replacement is likely only when antibody levels are low and the person has had severe or repeated infections, often needing hospital admission, despite preventive antibiotics. It is given either into a vein every three to four weeks, taking four to six hours for the first doses and two to three hours later, or as a weekly injection under the skin which many people are taught to give themselves. A vaccine challenge test, usually with the pneumococcal vaccine followed by a blood test a few weeks later, is sometimes used to decide whether it is needed.

The part a reader will not be told twice. After engineered T-cell therapy, Lymphoma Action says a person may lose immunity to illnesses they were vaccinated against in the past, and the team may recommend repeating those vaccinations. Around one person in four has low blood counts lasting several months after the treatment.

What to do about it day to day. Lymphoma Action's infections page lists the signs worth knowing: a temperature above 38 degrees Celsius, a temperature below 35 degrees, pain, redness, discharge, swelling or heat around a wound or an intravenous line, chills and sweating, shivering even without a fever, feeling generally unwell, confused or disoriented, a cough or coloured phlegm, diarrhoea, vomiting, burning when passing urine, headache with new neck stiffness and discomfort in bright light, and new pain anywhere. Its instruction is to contact the team immediately for any of them, even a minor one, and not to wait to see if it worsens. The charity also describes the medical card the team can give you, which records your treatment, your risk of a low white cell count and who to ring, and says to carry it and take it to hospital.

Vaccination. The Green Book says that many live vaccines are contraindicated in people who are immunosuppressed, and that for those due to begin immunosuppressive treatment, inactivated vaccines should ideally be given at least two weeks before it starts; where that is not possible, vaccination may be carried out at any time and re-immunisation considered after treatment has finished and recovery has occurred. That is the sentence behind the hurried vaccination appointment in the first fortnight after a lymphoma diagnosis, and behind the instruction to check with the team before any vaccine afterwards.`,
    terms: ["hypogammaglobulinaemia", "lymphoma-tx-immunoglobulin-replacement", "lymphoma-tx-pjp-and-infection-prophylaxis", "neutropenia", "febrile-neutropenia", "lymphoma-living-vaccinations"],
    technologies: ["car-t", "bispecific-antibody"],
    links: [LA_IG, LA_INFECTIONS, LA_CAR_T, LA_NEUTROPENIA, GREEN_BOOK_7, NICE_CG151],
  }),

  term({
    id: "lymphoma-living-vaccinations",
    name: "Vaccinations around lymphoma treatment: the ones to have first, and the ones not to have at all",
    category: "Clinic basics",
    aka: ["Live vaccines and lymphoma", "Vaccination before rituximab", "Revaccination after transplant"],
    cancers: [CX.nhl, CX.dlbcl, CX.fl, CX.hodgkin, CX.mcl, CX.mzl, CX.wm, CX.ptcl],
    tldr: "Inactivated vaccines work best when they are given at least two weeks before immunosuppressive treatment begins, and live vaccines are generally not given to someone whose immune system is suppressed. Treatment that removes B cells blunts the response to vaccines for a long time afterwards, so the order matters.",
    summary: `The two rules. The Green Book, chapter 7, says that many live vaccines are contraindicated in people who are immunosuppressed, and that people with immunosuppression should nonetheless be given all inactivated vaccines in line with national recommendations, although they may not mount as good an antibody response. For those due to start immunosuppressive treatment, it says inactivated vaccines should ideally be administered at least two weeks before treatment begins; where that is not possible, vaccination may be done at any time and re-immunisation considered after treatment is finished and recovery has occurred.

Why anti-CD20 treatment makes the timing matter more. Rituximab and obinutuzumab deplete the B cells that respond to a vaccine, so a vaccine given during or soon after a course of them may produce little antibody. This is the reason the first fortnight after a lymphoma diagnosis often contains a vaccination appointment that feels out of place beside the scans.

After a transplant. The Green Book says that in people who receive bone marrow transplants, any protective antibodies from previous exposure or vaccination are likely to be lost, that it is unclear whether the recipient acquires the donor's immunity, and that all such people should be considered for a re-immunisation programme after treatment is finished, with specialist advice where needed. Lymphoma Action says the same of engineered T-cell therapy: you may lose immunity you previously had, and the team may recommend repeating the vaccinations.

What to ask, and of whom. Lymphoma Action's position throughout its material is to check with the medical team about which vaccinations you should and should not have, rather than to follow a general rule, and to take up the ones you are offered. Household contacts matter too: the Green Book notes that close contacts of immunosuppressed people may themselves need additional vaccines. The practical question at the first appointment is which vaccines are due, whether any of them can be given in the next fortnight, and which ones are off the list until further notice and for how long.`,
    terms: ["lymphoma-living-infection-years-after", "hypogammaglobulinaemia", "lymphoma-tx-pjp-and-infection-prophylaxis"],
    links: [GREEN_BOOK_7, NHS_VACCINATIONS, LA_INFECTIONS, LA_CAR_T],
  }),

  term({
    id: "lymphoma-living-scanxiety-and-surveillance",
    name: "The surveillance schedule, and the evidence that routine scans do not find relapse first",
    category: "Clinic basics",
    aka: ["Scanxiety lymphoma", "Surveillance imaging lymphoma", "Follow-up scans after lymphoma", "Patient-triggered follow-up"],
    cancers: [CX.nhl, CX.dlbcl, CX.hodgkin, CX.fl, CX.mcl, CX.mzl, CX.ptcl, CX.wm, CX.pmbcl],
    tldr: "Most people expect regular scans after lymphoma treatment and are unsettled when they are not offered. The evidence is that in most lymphomas relapse is found because the person notices something, not because a scan catches it, and that finding it by scan does not lengthen life.",
    summary: `What people are not told. Lymphoma Action's follow-up page states it in one sentence: you might have a scan at the end of treatment to check the response, but scans are not routinely used as part of ongoing follow-up, as they are unlikely to identify lymphoma, and there is no evidence to suggest that they change lymphoma treatment or outcomes. Scans are requested when the team has a concern about symptoms.

The study behind it. Thompson and colleagues followed 680 people with diffuse large B-cell lymphoma treated with anthracycline-based immunochemotherapy in a prospective United States cohort, of whom 552 (81 per cent) reached remission. 112 of those 552 (20 per cent) relapsed. Sixty-four per cent of the relapses were identified before a scheduled follow-up visit, which is to say the person noticed something and came in. Surveillance imaging found a relapse before there were any symptoms in 9 of the 552 people followed after therapy, which is 1.6 per cent; in an independent French cohort it was 4 of 222, or 1.8 per cent. Survival after relapse did not differ according to whether the relapse was found at a scheduled visit or outside one, in either cohort. The authors' conclusion was that the data do not support routine surveillance imaging in follow-up of this lymphoma.

What follow-up is instead. Lymphoma Action describes an end-of-treatment appointment with a holistic needs assessment, a written treatment summary for you and your general practitioner, then appointments every few months at first and less often afterwards, with a conversation, an examination of the abdomen, armpits, groin and neck, and blood tests where they are needed. A yearly thyroid blood test follows radiotherapy to the neck. Many hospitals now offer patient-triggered follow-up, where instead of pre-booked appointments you arrange one when you have a concern; the charity is careful to say that you can contact the team at any time either way.

The anxiety is the real symptom here. Lymphoma Action says some people feel anxious in the lead-up to an appointment and suggests deciding beforehand what you want from it, taking someone with you, keeping a symptom diary, and talking it through with someone, and offers the thought that if you have no new or returning symptoms it is unlikely the lymphoma has returned. Its page on waiting for results is written for the same feeling. Knowing that the absence of a scan is a considered decision backed by data, rather than a service being withheld, is itself part of the answer.

Where this does not apply. Follow-up is planned per disease and per person. A person on active monitoring has a different schedule, and Lymphoma Action says a scan there is done when the team suspects growth rather than on a timetable. Anyone whose own team has set a scanning schedule should follow it: the point of this record is that the absence of one is not neglect.`,
    terms: ["lymphoma-living-indolent-lymphoma", "pet-ct", "deauville", "watchful-waiting"],
    technologies: ["survivorship-care-plan", "pet-ct", "psycho-oncology"],
    links: [THOMPSON_SURVEILLANCE, LA_FOLLOW_UP, LA_WAITING, LA_CT_PET, CRUK_NHL_FOLLOWUP],
  }),

  term({
    id: "lymphoma-living-returning-to-work",
    name: "Going back to work after lymphoma, and the money in the meantime",
    category: "Clinic basics",
    aka: ["Lymphoma and employment", "Sick pay during lymphoma treatment", "Phased return after lymphoma"],
    cancers: [CX.nhl, CX.dlbcl, CX.hodgkin, CX.fl, CX.mcl, CX.ptcl, CX.ctcl, CX.mzl, CX.wm],
    tldr: "Some people work through lymphoma treatment and some cannot, and the difference is mostly the job rather than the person. In the United Kingdom a cancer diagnosis brings protection from discrimination at work from the day it is made, and the benefits and sick pay rules are worth reading early rather than when the money runs out.",
    summary: `What the law gives you. Lymphoma Action's work material points to the Equality Act and to reasonable adjustments as the two things to understand first: a cancer diagnosis is a disability under the Act from the point of diagnosis, which means an employer must consider adjustments such as changed or reduced hours, time off for appointments, different duties or a phased return. Macmillan's work and cancer material covers the same ground and includes what to say to an employer and when.

The money. GOV.UK sets out statutory sick pay, who qualifies and for how long, and the separate rules on taking sick leave and fit notes. Lymphoma Action's work session signposts New Style Employment and Support Allowance, Universal Credit, Personal Independence Payment and Adult Disability Payment in Scotland, council tax reduction, help with transport costs, help with health costs, Carer's Allowance and Carer's Credit, and grants from Macmillan and Turn2us. A benefits adviser at a Maggie's centre or a Macmillan line will go through the list with you; the charities exist partly because the list is long and nobody is given it at diagnosis.

The return itself. Lymphoma Action's recovery material treats going back to work as part of recovery rather than as its endpoint, and its follow-up page lists adjustment to life after treatment, including whether you have been able to return to what you did before, as one of the things a follow-up appointment is for. Fatigue is the commonest reason a return goes badly, and it is usually the reason a phased return is worth asking for even when you feel ready.

For people who are self-employed, or on a zero-hours contract, or caring for someone else. Statutory sick pay does not reach everyone, which is the practical reason to put the benefits conversation in the first month rather than the third. Lymphoma Action's helpline and Macmillan's support line will both do this on the phone.`,
    terms: ["financial-toxicity", "lymphoma-living-fatigue", "cancer-related-fatigue"],
    technologies: ["financial-navigation", "survivorship-care-plan"],
    links: [LA_WORK, LA_RECOVERY, MAC_WORK, GOVUK_SSP, GOVUK_SICK_LEAVE, MAGGIES],
  }),

  term({
    id: "lymphoma-living-indolent-lymphoma",
    name: "Living with an indolent lymphoma rather than being cured of one",
    category: "Clinical",
    aka: ["Chronic lymphoma", "Low-grade lymphoma living with", "Remission and relapse follicular lymphoma"],
    cancers: [CX.fl, CX.mzl, CX.malt, CX.smzl, CX.nmzl, CX.wm, CX.nhl, CX.ctcl],
    tldr: "Slow-growing lymphomas are usually controlled rather than cured: treatment works, the disease goes away for a while, and at some point it comes back and is treated again. Most people live with that pattern for many years, and it asks something different of a person than being treated once and discharged.",
    summary: `What the pattern is. Lymphoma Action describes follicular lymphoma, the commonest low-grade non-Hodgkin lymphoma with about 2,300 people diagnosed a year in the United Kingdom, as a disease in which treatment is generally successful and long remissions are possible, but at some point the lymphoma usually comes back and needs more treatment to keep it under control. It says most people live with follicular lymphoma for many years and are managed as if it were a long-term condition, with periods of feeling well and needing nothing and periods of needing treatment again. How long between the two is hard to predict.

What that is like. The charity quotes a woman diagnosed with follicular lymphoma: "I slowly came to terms with the fact that I am facing a condition that is manageable but not curable. It has taken me some time to adjust to this being my new life; my new normal. A life that includes regular hospital checks, blood tests and treatment." That is the shape of it, and it is the reason the practical advice for someone with an indolent lymphoma looks more like the advice given in diabetes or inflammatory bowel disease than the advice given after a cured cancer.

Transformation, and why a change in symptoms is reported rather than watched. Lymphoma Action says follicular lymphoma transforms into a faster-growing lymphoma in 2 to 3 people in every 100 each year, that a biopsy is done to check if the team suspects it, and that transformed disease is treated like diffuse large B-cell lymphoma. This is the main reason the instruction on active monitoring is to contact the team when symptoms change rather than to wait for the next appointment. The charity is equally clear that a change in symptoms often turns out to be something else entirely, and that lymph nodes swell for many reasons.

What the follow-up looks like. One to four check-ups a year on active monitoring, with examination and blood tests and a scan only if growth is suspected. Lymphoma Action also describes patient-triggered follow-up, where someone who has been monitored without needing treatment books their own appointments as they need them.

What helps. The charity's advice for people on active monitoring is practical and worth repeating: keep up general health and the screening and vaccinations you are offered, plan things to look forward to, tell someone how you are actually feeling, connect with people in the same position through a support meeting, a buddy or an online group, and take seriously the anxiety that gathers in the days before a check-up. The helpline is free on 0808 808 5555 and takes calls from relatives too.`,
    terms: ["watchful-waiting", "lymphoma-tx-watch-and-wait", "lymphoma-decision-watch-and-wait", "lymphoma-living-scanxiety-and-surveillance", "flipi", "lymphoma-tx-pod24"],
    technologies: ["peer-support-groups", "psycho-oncology", "survivorship-care-plan"],
    links: [LA_FL, LA_WATCH_WAIT, LA_TRANSFORMATION, LA_EMOTIONAL, LA_HELPLINE, MAC_NHL],
  }),
];

export const lymphomaLivingTerms: TermInput[] = [...decisionTerms, ...livingTerms];

// ================================================================ QUESTIONS
/**
 * Settings match facet B's standard-of-care rows word for word, so src/lib/decisions.ts appends each question to
 * the section whose setting it names. "Newly diagnosed", "Any stage", "Fertility", "Money and work", "After
 * treatment" and "Carers and family" are the generic buckets the appointment sheet and prep pack use.
 */
const Q_NEW = "Newly diagnosed";
const Q_ANY = "Any stage";
const Q_FERTILITY = "Fertility";
const Q_WORK = "Money and work";
const Q_AFTER = "After treatment";
const Q_CARERS = "Carers and family";

/** Questions every lymphoma reader needs, whichever disease: repeated into each set so no page loses them. */
const SHARED_FIRST: Question[] = [
  { setting: Q_NEW, question: "Who is my clinical nurse specialist, and what is the number to ring at two in the morning?", why: "Lymphoma Action says the team should give you telephone numbers to call at any time, including at night and at weekends, and that if you have not been given them you should ask. Every urgent card on this page starts with that number." },
  { setting: Q_NEW, question: "Exactly which lymphoma is this, is it fast-growing or slow-growing, and what stage is it?", why: "Lymphoma is dozens of diseases with one name, and almost nothing about treatment follows until the subtype and the pace are settled. Lymphoma Action's own list of questions to ask starts here." },
  { setting: Q_NEW, question: "Has the biopsy been reviewed by a specialist lymphoma pathologist, and is the sample big enough for all the tests?", why: "Lymphoma Action says the sample is examined by an expert lymphoma pathologist who may also test for particular proteins and genetic changes, and that an excisional biopsy gives a large enough sample both for the diagnosis and for any additional tests needed." },
  { setting: Q_NEW, question: "How long will the results take, and what happens in the meantime?", why: "Lymphoma Action says biopsy results often take up to two weeks, sometimes a few days, and that if the sample needs further laboratory tests the wait can be up to about four weeks; staging tests can often be done while you wait." },
  { setting: Q_NEW, question: "Has my case been to the multidisciplinary team meeting, and how will I hear what was agreed?", why: "NICE NG47 sets out how haematological cancer services are organised around specialist multidisciplinary teams, and Lymphoma Action describes who sits on one and what each member does." },
  { setting: Q_NEW, question: "Will this treatment affect my fertility, and can I see a fertility specialist before it starts?", why: "Lymphoma Action says fertility preservation works best when it begins before treatment, that sperm must be banked beforehand, and that egg freezing involves about two weeks of daily injections. In an aggressive lymphoma that fortnight has to be asked for." },
  { setting: Q_NEW, question: "Which vaccinations should I have before treatment starts, and which must I not have?", why: "The Green Book says inactivated vaccines should ideally be given at least two weeks before immunosuppressive treatment begins, and that many live vaccines are contraindicated once someone is immunosuppressed." },
  { setting: Q_NEW, question: "Will I need a port or a PICC line, and when would it go in?", why: "Lymphoma treatment is given over months into veins that chemotherapy itself damages, and a central line is put in before the course rather than during it. Ask what it is, how it is cared for and what it rules out." },
];

const SHARED_LAST: Question[] = [
  { setting: Q_ANY, question: "Is there a clinical trial open to me, here or at another hospital, and would you refer me?", why: "Lymphoma Action runs a lymphoma-specific trials database and a free enquiry service, and the NHS says taking part is voluntary and you can leave at any time. Most trials specify what treatment you may already have had, so asking early keeps the option open." },
  { setting: Q_ANY, question: "What is the aim of this treatment: to cure the lymphoma, or to control it?", why: "The answer changes everything that follows, including how much toxicity is worth accepting, and in lymphoma it differs between subtypes rather than between patients." },
  { setting: Q_ANY, question: "What should make me ring you rather than wait for the next appointment?", why: "Lymphoma Action tells people to contact the team immediately for any possible sign of infection, even a minor one, and not to wait to see if it worsens, because infection can become serious quickly when the white cell count is low." },
  { setting: Q_FERTILITY, question: "How many days do I actually have before treatment must start?", why: "This is the single number the fertility decision turns on. Egg freezing and embryo storage take about two weeks of injections before collection; sperm banking can usually be arranged faster." },
  { setting: Q_FERTILITY, question: "Will I be referred to a fertility clinic on the NHS, and is there an age limit here?", why: "Lymphoma Action quotes NICE as saying there should be no lower age limit on who is offered fertility preservation, that it may be available up to the age of 40, and that this varies across the NHS." },
  { setting: Q_WORK, question: "Should I plan to work through this, and what should I tell my employer?", why: "Lymphoma Action says some people work through diagnosis and treatment and others cannot, and that understanding an employer's obligations and the help available makes the difference. A cancer diagnosis brings protection under the Equality Act from the day it is made." },
  { setting: Q_WORK, question: "Who here can go through sick pay and benefits with me, and can I be referred now rather than later?", why: "Lymphoma Action signposts statutory sick pay, New Style Employment and Support Allowance, Universal Credit, Personal Independence Payment, council tax reduction, help with transport and health costs, and grants; a benefits adviser at a Maggie's centre or a charity line will work through the list." },
  { setting: Q_AFTER, question: "Can I have my treatment summary in writing, for me and for my general practitioner?", why: "Lymphoma Action says the summary should list the treatment you had, its possible long-term and late effects, the symptoms that could mean relapse and who to contact at any hour. It is the document every later clinician will need." },
  { setting: Q_AFTER, question: "Will I be having regular scans in follow-up, and if not, why not?", why: "Lymphoma Action says scans are not routinely used in ongoing follow-up because they are unlikely to identify lymphoma and there is no evidence that they change treatment or outcomes; in a cohort of 552 people in remission from diffuse large B-cell lymphoma, surveillance imaging found relapse before symptoms in 1.6 per cent." },
  { setting: Q_AFTER, question: "What are the late effects of the treatment I had, and what screening follows from them?", why: "Lymphoma Action says the team should tell you which late effects your particular treatment carries, and that a yearly thyroid blood test follows radiotherapy to the neck; women who had radiotherapy to breast tissue under the age of 36 are in the NHS very high risk breast screening group." },
  { setting: Q_CARERS, question: "What should I watch for at home, and at what point do I ring rather than wait?", why: "Lymphoma Action's infection list is written for this: a temperature above 38 degrees Celsius or below 35, shivering even without a fever, confusion or disorientation, redness or discharge around a line, or simply someone who seems unwell. The instruction is to ring immediately rather than wait." },
  { setting: Q_CARERS, question: "Can I have a carer's assessment, and what help is there for me?", why: "The NHS says a carer's assessment is for anyone over 18 caring for another adult, is free, and does not depend on the person's income or on how much care is given. Lymphoma Action's helpline takes calls from relatives as well as patients." },
];

export const lymphomaQuestions: Question[] = [
  ...SHARED_FIRST,
  { setting: "How the treatment of a non-Hodgkin lymphoma is decided", question: "Which of the things on this list decide my treatment: the subtype, the stage, my prognostic score, my fitness, or something else?", why: "Lymphoma Action describes the chain from biopsy to pathologist to staging scan to prognostic score, and says the grade of follicular lymphoma, for example, does not affect the likely outcome of treatment while the subtype does." },
  { setting: "How the treatment of a non-Hodgkin lymphoma is decided", question: "Does my lymphoma need treating now, or is monitoring a reasonable option for me?", why: "Lymphoma Action lists the low-grade lymphomas for which active monitoring is standard, and the randomised evidence in asymptomatic advanced follicular lymphoma found no overall survival difference between early rituximab and watching." },
  { setting: "How the treatment of a non-Hodgkin lymphoma is decided", question: "What is my stage, and does it change what you would offer?", why: "Lymphoma Action's staging page explains what the stage means and how it is worked out; in several lymphomas the stage changes the treatment completely and in others it barely moves it." },
  { setting: "Supportive care that belongs to lymphoma specifically", question: "Am I at risk of tumour lysis syndrome, and what is being given to prevent it?", why: "The British Committee for Standards in Haematology publishes a guideline on managing tumour lysis syndrome in people with blood cancers; the risk is highest in bulky or fast-growing disease in the first days of treatment, and prevention is fluids, monitoring and a drug to lower uric acid." },
  { setting: "Supportive care that belongs to lymphoma specifically", question: "Have I been tested for hepatitis B, and will I need an antiviral alongside the antibody treatment?", why: "Anti-CD20 antibodies can reactivate hepatitis B in someone who has had it in the past, which is why the blood tests before treatment include it. Facet B's record sets out the randomised evidence on which antiviral is used." },
  { setting: "Supportive care that belongs to lymphoma specifically", question: "Will I be given growth factor injections, and what are they for?", why: "Lymphoma Action says granulocyte-colony stimulating factor helps the neutrophil count recover faster and lowers infection risk, and is used when the count is very low, when it is too low for the dose you need, or when you are over 60 and on certain chemotherapy." },
  { setting: "Supportive care that belongs to lymphoma specifically", question: "What preventive antibiotics or antivirals am I on, and for how long after treatment finishes?", why: "Lymphoma Action says preventive antibiotic, antiviral and antifungal medicines are sometimes given while the neutrophil count is expected to be lowest, and that infection risk after B-cell-depleting treatment can last a long time after the last dose." },
  { setting: "Where British and American practice differ", question: "Is the treatment you are recommending the one used in the United Kingdom, and is there a different standard elsewhere?", why: "Lymphoma is one of the cancers where British and American practice genuinely diverge, and facet B's rows name the places where they do. You are allowed to ask which one you are being offered and why." },
  { setting: "Treatments that did not work, and are worth not being offered", question: "Is there anything that is commonly done for this lymphoma that you are deliberately not doing, and why?", why: "Several things that were standard in lymphoma for decades turned out not to help, and knowing which ones were left out on purpose is more reassuring than discovering later that they exist." },
  ...SHARED_LAST,
];

export const dlbclQuestions: Question[] = [
  ...SHARED_FIRST,
  { setting: "Before the first dose: the tests that change the plan", question: "Which tests are we waiting for before treatment starts, and which of them could change the plan?", why: "Lymphoma Action says the blood tests before treatment check general health, blood counts, kidney and liver function and viral infections, and that the pathologist may test the lymphoma cells for particular proteins and genetic changes. Some of those results change the regimen." },
  { setting: "Before the first dose: the tests that change the plan", question: "Has my heart been checked before the anthracycline?", why: "Doxorubicin is in nearly every regimen for this lymphoma, and heart function is usually measured first. Lymphoma Action lists anthracycline chemotherapy among the treatments that raise the long-term risk of heart problems, with the risk rising with higher doses and more courses." },
  { setting: "Advanced stage, IPI 0 to 1: R-CHOP for six cycles", question: "How many cycles am I having, how long does each one take, and how will we know it is working?", why: "The number of cycles and the scan that checks the response are the two pieces of the plan people most often leave the room without. Lymphoma Action's scans page explains what a PET/CT does and why it is used here." },
  { setting: "Advanced stage, IPI 2 to 5: pola-R-CHP or R-CHOP, and where polatuzumab did and did not win", question: "Why are you recommending this combination for me rather than the other one, and what is the difference in what I would feel?", why: "Facet B's row sets out where the newer combination improved outcomes and where it did not. Which one is right depends on the prognostic score, and asking makes the reasoning visible." },
  { setting: "Older or frail patients: R-mini-CHOP and the comprehensive geriatric assessment", question: "Has a formal assessment of my fitness been done, and is the dose being reduced because of it?", why: "A reduced-dose regimen is a deliberate choice backed by evidence, not a lesser treatment given reluctantly, and a structured fitness assessment is what it should be based on." },
  { setting: "Central nervous system prophylaxis: who is offered it, and the evidence against it", question: "Am I being offered extra methotrexate to protect the brain, and what is the evidence that it helps?", why: "Facet B's record sets out that this has been standard for decades and that the best evidence now available suggests it does not reduce brain relapse. Asking lets the team explain where your own risk sits." },
  { setting: "Primary refractory disease or relapse within twelve months: CAR-T, not transplant", question: "Is engineered T-cell therapy the right route for me, and how long would the wait be?", why: "In ZUMA-7, 24-month event-free survival was 41 per cent with axicabtagene ciloleucel against 16 per cent with salvage chemotherapy and transplant, and four-year survival 54.6 against 46.0 per cent. In BELINDA, which used a different product, the median time from cell collection to infusion was 52 days and there was no difference in event-free survival." },
  { setting: "Primary refractory disease or relapse within twelve months: CAR-T, not transplant", question: "What happens during the weeks the cells are being made, and what is the bridging treatment?", why: "In BELINDA, 25.9 per cent of people in the cell-therapy group had lymphoma progression by week six. What holds the disease during the wait is part of the treatment, not a gap in it." },
  { setting: "Primary refractory disease or relapse within twelve months: CAR-T, not transplant", question: "Where would this happen, how far is it, and who has to stay with me?", why: "Lymphoma Action says most people stay in hospital at least ten days, then must stay within about an hour or two of the centre for four weeks with someone present at all times, and that you might not be discharged if nobody can stay with you." },
  { setting: "Late relapse (after twelve months), transplant-eligible: salvage chemotherapy then autologous transplant", question: "What happens if the salvage chemotherapy does not shrink the lymphoma enough for a transplant?", why: "The transplant route only reaches the people whose lymphoma responds to the chemotherapy first: in BELINDA, 32.5 per cent of the standard-care group actually received a transplant. Knowing the next step in advance makes that scan less frightening." },
  { setting: "Relapsed and not fit for transplant or CAR-T: bispecific antibodies and antibody-drug conjugates", question: "What does the first cycle of a bispecific antibody involve, and how long am I in hospital for it?", why: "Facet B's record on step-up dosing sets out why the first doses are given in hospital with monitoring: cytokine release syndrome is most likely then, and several labels require a period of observation after each step-up dose." },
  { setting: "Response assessment, follow-up and what a scan is for", question: "What does this scan result actually mean, and what happens if there is still something showing?", why: "Lymphoma Action's scans page explains what PET/CT measures and why a residual shadow is not the same as residual lymphoma. The Deauville score the report uses has a glossary entry here." },
  ...SHARED_LAST,
];

export const hodgkinQuestions: Question[] = [
  ...SHARED_FIRST,
  { setting: "Choosing treatment in Hodgkin lymphoma: stage, risk factors and the interim PET", question: "Am I early stage or advanced, favourable or unfavourable, and what put me in that group?", why: "In Hodgkin lymphoma the group decides the regimen, the number of cycles and whether radiotherapy is used, and the risk factors that define it are specific and checkable." },
  { setting: "Choosing treatment in Hodgkin lymphoma: stage, risk factors and the interim PET", question: "Will I have a scan after two cycles, and what would a negative or a positive result change?", why: "In RATHL, 83.7 per cent of 1,119 people scanned after two cycles of ABVD had a negative scan and could drop the bleomycin with three-year progression-free survival of 84.4 per cent against 85.7 per cent; the 172 with a positive scan were escalated, and 74.4 per cent then had a negative scan." },
  { setting: "Choosing treatment in Hodgkin lymphoma: stage, risk factors and the interim PET", question: "If radiotherapy is part of the plan, which part of me is in the field, and what does that mean in thirty years?", why: "The long-term risks of Hodgkin treatment follow the field. Women who had radiotherapy to breast tissue under the age of 36 are placed in the NHS very high risk breast screening group, and mediastinal radiotherapy carries a raised risk of heart disease decades later." },
  { setting: "Choosing treatment in Hodgkin lymphoma: stage, risk factors and the interim PET", question: "Am I being offered the gentler regimen or the escalated one, and what would change your recommendation?", why: "The escalated regimens control the disease in more people first time and carry more infection, more infertility and more late harm. In HD21, treatment-related morbidity was 42 per cent with BrECADD against 59 per cent with escalated BEACOPP among 1,470 people assessed." },
  { setting: "Survivorship after Hodgkin lymphoma: what the cure costs, and what is watched for", question: "Which late effects does my particular treatment carry, and what will be checked, how often, and by whom?", why: "Lymphoma Action says the team should give you information about the risks based on your treatment plan, and that it is important to take up screening invitations. In the Dutch 40-year cohorts the cumulative incidence of a second cancer was 48.5 per cent and of cardiovascular disease 50 per cent, in people treated with the radiotherapy fields and doses of 1965 to 2000." },
  { setting: "Survivorship after Hodgkin lymphoma: what the cure costs, and what is watched for", question: "If I had radiotherapy above the waist as a young woman, am I in the breast screening programme?", why: "The NHS Breast Screening Programme puts women irradiated to breast tissue for lymphoma between the ages of 10 and under 36 into its very high risk group. NHS England contacted 1,487 women in England who should have been referred and may not have been, treated between 1962 and 2003." },
  { setting: "Survivorship after Hodgkin lymphoma: what the cure costs, and what is watched for", question: "Will my thyroid be checked, and how often?", why: "Lymphoma Action says the risk of an underactive thyroid is highest in the first five years after treatment and stays raised after that, that it is diagnosed on a blood test and treated with thyroxine tablets, and that a yearly blood test follows radiotherapy to the neck." },
  { setting: "Survivorship after Hodgkin lymphoma: what the cure costs, and what is watched for", question: "Is there a late effects clinic, and who looks after this once I am discharged from haematology?", why: "Most of these risks arrive after follow-up has ended, which is why Lymphoma Action says to keep the written treatment summary and to show it to any health professional who treats you afterwards." },
  ...SHARED_LAST,
];

export const advancedHodgkinQuestions: Question[] = [
  { setting: Q_NEW, question: "Who is my clinical nurse specialist, and what is the number to ring at two in the morning?", why: "Lymphoma Action says the team should give you telephone numbers to call at any time, including at night and at weekends, and that if you have not been given them you should ask." },
  { setting: Q_NEW, question: "Will this treatment affect my fertility, and can I see a fertility specialist before it starts?", why: "In the German HD13 to HD15 survivor analysis, after six to eight cycles of escalated BEACOPP menstrual activity was reported by 82 per cent of women under 30 and 45 per cent of women aged 30 or more, and 34 per cent of women aged 30 or over had severe menopausal symptoms. Egg freezing takes about two weeks before collection." },
  { setting: "Advanced Hodgkin lymphoma in the United States: nivolumab with AVD", question: "Is the immunotherapy combination available to me here, and if not, what is the reason?", why: "The United States standard after SWOG S1826 and the European standard after HD21 are different treatments, and no trial has compared them. Facet B's rows set out each; asking which one you are being offered, and why, is reasonable." },
  { setting: "Advanced Hodgkin lymphoma in Germany and much of Europe: PET-guided BrECADD", question: "How many cycles would I have, and does the scan after two decide it?", why: "In HD21 both regimens were guided by the scan after two cycles, with four or six cycles given depending on the result. The number of cycles is therefore not fixed at the start." },
  { setting: "Advanced Hodgkin lymphoma in Germany and much of Europe: PET-guided BrECADD", question: "What is the difference in side effects between the escalated regimens, in numbers?", why: "In HD21, treatment-related morbidity, a co-primary endpoint, occurred in 312 of 738 people given BrECADD (42 per cent) and 430 of 732 given escalated BEACOPP (59 per cent), a relative risk of 0.72." },
  { setting: "Advanced Hodgkin lymphoma with ABVD and brentuximab: what the earlier standards showed", question: "Why are you not simply giving me ABVD, and what would I gain and lose by having it?", why: "In RATHL the 83.7 per cent of people whose scan was negative after two cycles of ABVD did well with it, with three-year overall survival of 97.2 and 97.6 per cent in the two randomised groups. Which starting regimen is right depends on risk factors that your team can name." },
  { setting: "Advanced Hodgkin lymphoma with ABVD and brentuximab: what the earlier standards showed", question: "If I have bleomycin, what is being watched in my lungs, and when would it be stopped?", why: "In RATHL respiratory adverse events were more severe in the group that continued bleomycin after a negative interim scan, which is the reason it is now commonly dropped at that point." },
  { setting: Q_ANY, question: "Is there a clinical trial open to me, here or at another hospital, and would you refer me?", why: "First-line treatment of advanced Hodgkin lymphoma is one of the least settled questions in the disease, which is where trials are open. Most of them specify that no treatment has yet been given." },
  { setting: Q_AFTER, question: "Which late effects does this particular regimen carry, and what screening follows?", why: "Lymphoma Action says the team should give you information about the risks based on your treatment plan, and that stage 3 or 4 disease usually needs more complex treatment, which can increase the risk of late effects." },
  ...SHARED_LAST.filter((q) => q.setting !== Q_ANY),
];

export const follicularQuestions: Question[] = [
  ...SHARED_FIRST,
  { setting: "Stage I and contiguous stage II follicular lymphoma: radiotherapy with curative intent", question: "Is my lymphoma really confined to one area, and what was done to be sure?", why: "Radiotherapy with the aim of cure only makes sense for genuinely limited disease, and Lymphoma Action says follicular lymphoma is often already stage 3 or 4 when it is found because it grows slowly and causes few symptoms." },
  { setting: "Advanced follicular lymphoma with no symptoms: watch and wait, or rituximab alone", question: "Why is it right to do nothing now, and what would change that?", why: "In a British-led trial of 379 people with asymptomatic, non-bulky, advanced follicular lymphoma, early rituximab delayed the need for chemotherapy or radiotherapy but overall survival did not differ from watching. Lymphoma Action lists the triggers for starting: marrow involvement affecting blood counts, an organ affected, nodes or spleen growing quickly or appearing in new places, fever, night sweats and weight loss, or symptoms that are difficult to live with." },
  { setting: "Advanced follicular lymphoma with no symptoms: watch and wait, or rituximab alone", question: "How often will I be seen, and will I have scans?", why: "Lymphoma Action says active monitoring usually means one to four check-ups a year with an examination and blood tests, and that a scan is not usually done unless the team suspects the lymphoma is growing, to avoid unnecessary radiation." },
  { setting: "Advanced follicular lymphoma with no symptoms: watch and wait, or rituximab alone", question: "What exactly should make me ring you between appointments?", why: "Lymphoma Action says to contact the team straight away for a change in symptoms or any new symptom and not to wait for the next appointment, while also saying that lymph nodes swell for many reasons and a change does not necessarily mean the lymphoma has worsened." },
  { setting: "Advanced follicular lymphoma needing treatment: which induction, and whether to add maintenance", question: "If I have maintenance treatment, what does it buy me and what does it cost me?", why: "Facet B's record sets out that maintenance lengthens remission in follicular lymphoma but has not been shown to lengthen life, so the trade is time to the next treatment against months or years of infusions, low counts and a higher infection rate." },
  { setting: "Progression within two years of first chemotherapy (POD24): biopsy first, then a different class of treatment", question: "Will I have another biopsy before the next treatment, and what are you looking for?", why: "Lymphoma Action says follicular lymphoma transforms into a faster-growing lymphoma in 2 to 3 people in every 100 each year, and that a biopsy is done to check; transformed disease is treated like diffuse large B-cell lymphoma." },
  { setting: "Relapsed follicular lymphoma after two or more lines: bispecific antibodies, CAR-T and R-squared", question: "What are my options now, in what order, and what does each one involve day to day?", why: "By this point the choices differ a great deal in where they are given, how long they take and what they ask of the people around you. Facet B's row names them; the practical shape of each is a fair question." },
  { setting: "Transformation of follicular lymphoma to diffuse large B-cell lymphoma", question: "Does transformation change the aim of treatment from control to cure?", why: "Transformed follicular lymphoma is treated like a high-grade lymphoma, which is a different intention from the one the person has usually been living with, and it is worth having that said out loud." },
  ...SHARED_LAST,
];

// ================================================================ SUPPLEMENTS
/**
 * Each attaches the lymphoma records to a side-effect, procedure or support record another file owns, with a
 * sourced lymphoma-specific note. A supplement never creates a record, so a missing id fails the build.
 */
const B_CELL = [CX.nhl, CX.dlbcl, CX.fl, CX.mcl, CX.mzl, CX.malt, CX.smzl, CX.nmzl, CX.wm, CX.pmbcl, CX.burkitt];
const ALL_LYMPHOMA = [...B_CELL, CX.hodgkin, CX.hodgkinEarly, CX.hodgkinAdvanced, CX.hodgkinRelapsed, CX.nlphl, CX.ptcl, CX.aitl, CX.ctcl, CX.sezary, CX.pcnsl];

const supplements: SpikeSupplement[] = [
  { id: "cancer-related-fatigue", cancers: ALL_LYMPHOMA, links: [LA_FATIGUE, LA_EXERCISE, LA_RECOVERY],
    notes: ["Lymphoma: Lymphoma Action describes cancer-related fatigue as extreme tiredness that is physical, mental and emotional, that is not relieved by sleep as ordinary tiredness is, and that can begin during treatment and continue for months or years. It appears in the charity's material both as a side effect and as a late effect. Several contributors are separately treatable, including anaemia and an underactive thyroid, and after radiotherapy to the neck a thyroid blood test is done once a year."] },

  { id: "late-effects", cancers: ALL_LYMPHOMA, links: [LA_LATE_EFFECTS, SCHAAPVELD, VAN_NIMWEGEN],
    notes: ["Lymphoma: Lymphoma Action distinguishes late effects, which do not start until months or years after treatment finishes, from side effects that start during or soon after it, and says people treated for Hodgkin lymphoma have a slightly higher chance of late effects than people treated for non-Hodgkin lymphoma, with higher risk again for those treated in childhood or early adulthood. Its list covers the heart, second cancers, lung scarring, the thyroid, fertility, bone health, the eyes and the teeth, each tied to the treatment that causes it."] },

  { id: "secondary-malignancy", cancers: [CX.hodgkin, CX.hodgkinEarly, CX.hodgkinAdvanced, CX.hodgkinRelapsed, CX.nlphl, CX.nhl, CX.dlbcl], links: [SCHAAPVELD, GOVUK_BREAST_VHR, LA_BREAST_SCREENING_RECALL],
    notes: ["Hodgkin lymphoma: among 3,905 people in the Netherlands who survived at least five years after treatment given between 1965 and 2000 at ages 15 to 50, 1,055 second cancers occurred in 908 people over a median 19.1 years, a standardised incidence ratio of 4.6 against the general population, still 3.9 at 35 or more years, with a cumulative incidence at 40 years of 48.5 per cent. The authors found the risk of second solid cancers no lower in the most recent period studied. The NHS Breast Screening Programme places women irradiated to breast tissue for lymphoma between the ages of 10 and under 36 in its very high risk group, screened annually and usually with magnetic resonance imaging."] },

  { id: "cardiotoxicity", cancers: [CX.hodgkin, CX.hodgkinEarly, CX.hodgkinAdvanced, CX.hodgkinRelapsed, CX.dlbcl, CX.nhl], links: [VAN_NIMWEGEN, LA_LATE_EFFECTS],
    notes: ["Lymphoma: among 2,524 Dutch patients treated for Hodgkin lymphoma before the age of 51 between 1965 and 1995, 1,713 cardiovascular events occurred in 797 people over a median 20 years; at 35 or more years coronary heart disease and heart failure were still 4 to 6 times more common than in the general population, and the 40-year cumulative incidence of cardiovascular disease was 50 per cent. Mediastinal radiotherapy raised the risk of coronary disease, valve disease and heart failure, anthracyclines the risk of valve disease and heart failure, and the effects of radiotherapy, anthracyclines and smoking appeared to add together."] },

  { id: "hypogammaglobulinaemia", cancers: B_CELL, links: [LA_IG, LA_CAR_T, LA_INFECTIONS],
    notes: ["Lymphoma: Lymphoma Action says most people with lymphoma do not need immunoglobulin replacement, that preventive antibiotics are usually enough when antibody levels are low, and that replacement is likely only after severe or repeated infections requiring hospital admission despite those antibiotics. It names B-cell non-Hodgkin lymphoma, Hodgkin lymphoma, allogeneic transplant, engineered T-cell therapy and treatment that destroys or depletes B cells, such as rituximab, as the situations in which it arises. After engineered T-cell therapy, B cell levels are likely to be low for a long time, sometimes several years."] },

  { id: "crs", cancers: [CX.dlbcl, CX.pmbcl, CX.fl, CX.mcl, CX.nhl], links: [LA_CAR_T],
    notes: ["Lymphoma: Lymphoma Action says almost everyone treated with engineered T-cell therapy has some level of cytokine release syndrome, that it most commonly develops within 10 days of the infusion, and that most cases are mild and easily treated. The signs it lists are fever and chills, a rapid heart rate, low blood pressure, low oxygen, headache, and feeling or being sick. Severe cases are treated with oxygen, fluids, steroids and tocilizumab, and usually improve within a few days. Around one person in five who has this treatment needs intensive care."] },

  { id: "icans", cancers: [CX.dlbcl, CX.pmbcl, CX.fl, CX.mcl, CX.nhl], links: [LA_CAR_T],
    notes: ["Lymphoma: Lymphoma Action says around one person in four treated with engineered T-cell therapy develops neurotoxicity, that it generally appears within 28 days of the infusion and often within a few days, and that symptoms are usually mild and resolve in a week or two. The signs it lists are confusion, speech problems, difficulty writing, headache and dizziness, shaking or tremor, and difficulty moving. Seizures and brain swelling are the serious forms. Someone who develops it is advised not to drive for 8 weeks from the onset of symptoms, and the requirement to have another adult present for the four weeks after infusion exists because the person affected is often the last to notice."] },

  { id: "tumor-lysis-syndrome", cancers: [CX.burkitt, CX.dlbcl, CX.nhl, CX.mcl, CX.ptcl, CX.pmbcl], links: [BSH_TLS],
    notes: ["Lymphoma: the British Committee for Standards in Haematology publishes a guideline on the management of tumour lysis syndrome in adults and children with haematological malignancies. The risk is concentrated in the first days of treating bulky or fast-growing disease, which in lymphoma means Burkitt lymphoma, the high-grade B-cell lymphomas and large or rapidly growing diffuse large B-cell lymphoma, and it is the reason a pre-phase of steroid or low-dose chemotherapy, intravenous fluids, close blood monitoring and a uric-acid-lowering drug are given before full treatment begins."] },

  { id: "central-venous-access", cancers: ALL_LYMPHOMA, links: [LA_INFECTIONS, LA_CAR_T],
    notes: ["Lymphoma: most lymphoma regimens run for several months, and a central line or a port is usually placed before the course rather than during it. Lymphoma Action lists pain, redness, discharge, swelling or heat at the site of a line among the signs of infection that should be reported immediately, and advises asking the team for advice on bathing and showering while a line is in place."] },

  { id: "febrile-neutropenia", cancers: ALL_LYMPHOMA, links: [LA_NEUTROPENIA, NICE_CG151, MAC_SEPSIS],
    notes: ["Lymphoma: Lymphoma Action says a common sign of neutropenic sepsis is a temperature above 38 degrees Celsius, and that it is possible to have neutropenic sepsis without a fever, sometimes called cold sepsis, which steroid treatment makes more likely because steroids can mask a fever. For that reason teams also use heart rate, blood pressure, breathing rate and kidney and liver function to check for it. Steroids are part of almost every lymphoma regimen, so the no-fever presentation is not a rarity here."] },

  { id: "neutropenia", cancers: ALL_LYMPHOMA, links: [LA_NEUTROPENIA, LA_GROWTH_FACTORS],
    notes: ["Lymphoma: Lymphoma Action says a neutrophil count below 1 billion per litre is generally classed as neutropenia, that the reference range is usually 2 to 7.5 billion per litre, and that ranges differ between people and between ethnic groups, with people of African, Caribbean, Middle Eastern and West Indian descent often having naturally lower counts without a higher infection risk. It says there is limited scientific research supporting a neutropenic diet and that advice varies between hospitals, so the team's own instructions are the ones to follow."] },

  { id: "fertility-preservation", cancers: ALL_LYMPHOMA, links: [LA_FERTILITY, LA_MENOPAUSE, BEHRINGER],
    notes: ["Lymphoma: Lymphoma Action says fertility preservation is generally more effective when begun before treatment, that sperm must be banked beforehand, and that egg freezing and embryo storage involve about two weeks of daily injections before the eggs are collected. It quotes NICE as saying there should be no lower age limit on who is offered preservation, that it may be available up to age 40 and that this varies across the NHS, and that the impact on fertility should be discussed at diagnosis. Because aggressive lymphoma is often treated within days, the number of days available before treatment must start is the question the decision turns on."] },

  { id: "survivorship-care-plan", cancers: ALL_LYMPHOMA, links: [LA_FOLLOW_UP, LA_RECOVERY, THOMPSON_SURVEILLANCE],
    notes: ["Lymphoma: Lymphoma Action says the team should give the person and their general practitioner a written treatment summary listing the treatment given, its possible side effects including long-term ones, the late effects to expect, the symptoms that could mean the lymphoma has returned with who to contact at any hour, and any lifestyle recommendations. It also says scans are not routinely used in ongoing follow-up because they are unlikely to identify lymphoma and there is no evidence that they change treatment or outcomes, which matches the finding that surveillance imaging detected relapse before symptoms in 9 of 552 people in remission from diffuse large B-cell lymphoma."] },

  { id: "watchful-waiting", cancers: [CX.fl, CX.mzl, CX.malt, CX.smzl, CX.nmzl, CX.wm, CX.mcl, CX.nlphl, CX.nhl], links: [LA_WATCH_WAIT, ARDESHNA],
    notes: ["Lymphoma: Lymphoma Action calls this active monitoring and lists the diseases it is used for, namely follicular lymphoma other than grade 3B, the marginal zone lymphomas, Waldenstrom macroglobulinaemia, chronic lymphocytic leukaemia and small lymphocytic lymphoma, some mantle cell lymphoma and nodular lymphocyte predominant Hodgkin lymphoma, and says it is not appropriate for any aggressive lymphoma. It means one to four check-ups a year with examination and blood tests, a scan only where growth is suspected, and treatment when the marrow or an organ is affected, when nodes or the spleen grow quickly or appear in new places, when fever, night sweats and weight loss appear, or when symptoms become difficult to live with."] },

  { id: "psycho-oncology", cancers: ALL_LYMPHOMA, links: [LA_EMOTIONAL, LA_WAITING, MAGGIES],
    notes: ["Lymphoma: Lymphoma Action describes a holistic needs assessment as part of care from the point of diagnosis onwards, not only at the end of treatment, and publishes separate material on the emotional impact of lymphoma, on waiting for results and on the particular difficulty of being told you have cancer that is not going to be treated yet. Its helpline is free on 0808 808 5555 and takes calls from relatives as well as patients."] },

  { id: "peer-support-groups", cancers: ALL_LYMPHOMA, links: [LA_HELPLINE, LA_EMOTIONAL, MAGGIES],
    notes: ["Lymphoma: Lymphoma Action runs a free helpline, a buddy service pairing people with someone in a similar position, online and in-person support meetings including ones on active monitoring, fatigue, relapsed disease, stem cell transplants and engineered T-cell therapy, a Facebook support group, and the Live your Life workshops for people living with and beyond lymphoma. Maggie's centres are free, need no appointment and are open to family and friends."] },

  { id: "financial-toxicity", cancers: ALL_LYMPHOMA, links: [LA_WORK, GOVUK_SSP, MAC_WORK],
    notes: ["Lymphoma in the United Kingdom: Lymphoma Action's work material signposts statutory sick pay, New Style Employment and Support Allowance, Universal Credit, Personal Independence Payment and Adult Disability Payment in Scotland, council tax reduction, help with transport costs, help with health costs, Carer's Allowance and Carer's Credit, and grants from Macmillan and Turn2us, alongside the Equality Act protections and reasonable adjustments an employer must consider. Treatment at a cell-therapy centre adds four weeks of accommodation near the hospital for two people, which is the lymphoma-specific cost that catches households out."] },

  { id: "palliative-care", cancers: ALL_LYMPHOMA, links: [LA_PALLIATIVE, LA_RELAPSE],
    notes: ["Lymphoma: Lymphoma Action's palliative care page frames it as care for overall wellbeing that can run alongside treatment aimed at controlling the lymphoma, rather than as something that begins when treatment stops. Its separate material on lymphoma that comes back or does not respond covers the same ground from the other side."] },

  { id: "prehabilitation", cancers: ALL_LYMPHOMA, links: [LA_PREHAB, LA_EXERCISE],
    notes: ["Lymphoma: Lymphoma Action publishes material on getting ready for treatment, which in a disease often treated within days of diagnosis means the few things that can be done in that window rather than a programme of weeks: the fertility referral, the dental check, the vaccinations that can be given before immunosuppression starts, and arranging the practical and financial side before the first cycle."] },

  { id: "exercise-during-chemotherapy", cancers: ALL_LYMPHOMA, links: [LA_EXERCISE, LA_FATIGUE],
    notes: ["Lymphoma: Lymphoma Action's exercise material and its fatigue material point the same way, treating graded activity as a treatment for fatigue rather than something to attempt once the fatigue has lifted, and its late effects page lists regular suitable exercise among the things that lower the long-term risks of heart problems and thin bones."] },

  { id: "multidisciplinary-tumour-board", cancers: ALL_LYMPHOMA, links: [LA_MDT, NICE_NG47],
    notes: ["Lymphoma: Lymphoma Action describes who sits on a lymphoma multidisciplinary team and what each member does, and NICE NG47 sets out how haematological cancer services are organised around specialist multidisciplinary teams. Eligibility for engineered T-cell therapy is decided differently again: Lymphoma Action says the referring doctor discusses the case with a national panel of clinical experts, which considers general health, test results and scans."] },
];

// ================================================================ THE DEEP DIVE
const LIVING_TERM_IDS = lymphomaLivingTerms.map((t) => t.id as string);

const SHARED_TERMS = [
  "cancer-related-fatigue", "late-effects", "febrile-neutropenia", "neutropenia", "financial-toxicity",
  "central-venous-access", "hypogammaglobulinaemia", "performance-status", "quality-of-life",
];
const SHARED_TECHNOLOGIES = [
  "palliative-care", "psycho-oncology", "peer-support-groups", "survivorship-care-plan", "fertility-preservation",
  "financial-navigation", "cbt-fatigue-distress", "exercise-during-chemotherapy", "multidisciplinary-tumour-board",
  "oncology-nutrition", "prehabilitation",
];

const SHARED_LINKS = [LA_HELPLINE, LA_QUESTIONS, LA_FOLLOW_UP, LA_INFECTIONS, LA_NEUTROPENIA, LA_FATIGUE, LA_WORK, MAGGIES];

const note = (what: string) => `${what} ${NOT_ADVICE} The decision records, the question sets, the first 60 days checklist and the red cards on this page were written from the NHS, Lymphoma Action, Macmillan and Cancer Research UK patient pages, from NICE NG52, NG47, CG151 and NG234, from the NHS Breast Screening Programme protocols and the Green Book, and from the trial reports named beside each figure, all read on 1 October 2026.`;

/**
 * One deep dive per cancer record, so each page gets the terms, technologies and links its own readers need. The
 * patch carries no standard-of-care row: facet B owns those, and the questions above are keyed to its settings.
 */
const mk = (cancerId: string, terms: string[], technologies: string[], links: Array<{ label: string; url: string }>, notes: string[]): Spike => ({
  cancerId,
  entities: [],
  patch: { terms: [...SHARED_TERMS, ...terms], technologies: [...SHARED_TECHNOLOGIES, ...technologies], links: [...SHARED_LINKS, ...links], notes },
});

/** The non-Hodgkin hub carries the whole glossary this file creates, so every new record has an inbound link. */
const nhlLivingSpike: Spike = {
  cancerId: CX.nhl,
  entities: [...lymphomaLivingTerms],
  supplements,
  patch: {
    terms: [...SHARED_TERMS, ...LIVING_TERM_IDS, "watchful-waiting", "crs", "icans", "tumor-lysis-syndrome", "secondary-malignancy", "cardiotoxicity", "deauville"],
    technologies: [...SHARED_TECHNOLOGIES, "car-t", "bispecific-antibody", "autologous-stem-cell-transplant", "pet-ct"],
    links: [...SHARED_LINKS, NHS_NHL, NHS_NHL_SYMPTOMS, NHS_NHL_TREATMENT, MAC_LYMPHOMA, MAC_NHL, CRUK_NHL_LIVING, CRUK_NHL_TESTS, CRUK_NHL_FOLLOWUP, NICE_NG52, NICE_NG47, LA_STAGING, LA_BIOPSY, LA_CT_PET, LA_WAITING, LA_MDT, LA_TRIALS, LA_CARERS, NHS_CARER_ASSESSMENT, NHS_111, NHS_999, NHS_SEPSIS, MAC_MSCC, MAC_SVCO, NICE_NG234],
    notes: [note("Living with non-Hodgkin lymphoma, the decisions and the people who make them:")],
  },
};

export const dlbclLivingSpike: Spike = mk(
  CX.dlbcl,
  ["lymphoma-decision-transplant-or-car-t", "lymphoma-decision-fertility-timing", "lymphoma-decision-trial", "lymphoma-decision-local-or-car-t-centre", "lymphoma-living-fatigue", "lymphoma-living-infection-years-after", "lymphoma-living-vaccinations", "lymphoma-living-scanxiety-and-surveillance", "lymphoma-living-returning-to-work", "crs", "icans", "tumor-lysis-syndrome", "deauville"],
  ["car-t", "bispecific-antibody", "autologous-stem-cell-transplant", "pet-ct"],
  [LA_DLBCL, LA_CAR_T, LA_ASCT, LA_RELAPSE, LA_CT_PET, THOMPSON_SURVEILLANCE, NHS_NHL_TREATMENT, MAC_NHL],
  [note("Living with diffuse large B-cell lymphoma, the decisions and the people who make them:"),
   "On the second-line decision. The figures in the decision record come from the trials' own publications: ZUMA-7 randomised 359 people and reported 24-month event-free survival of 41 per cent against 16 per cent, and four-year overall survival of 54.6 against 46.0 per cent at a median follow-up of 47.2 months; BELINDA randomised 322 people to a different cell product and found median event-free survival of 3.0 months in both arms. They describe those trial populations, not any one person, and the people in them were selected for early relapse."],
);

export const follicularLivingSpike: Spike = mk(
  CX.fl,
  ["lymphoma-decision-watch-and-wait", "lymphoma-decision-trial", "lymphoma-decision-fertility-timing", "lymphoma-living-indolent-lymphoma", "lymphoma-living-scanxiety-and-surveillance", "lymphoma-living-fatigue", "lymphoma-living-infection-years-after", "lymphoma-living-vaccinations", "lymphoma-living-returning-to-work", "watchful-waiting", "deauville"],
  ["car-t", "bispecific-antibody", "pet-ct"],
  [LA_FL, LA_WATCH_WAIT, LA_TRANSFORMATION, LA_EMOTIONAL, ARDESHNA, MAC_NHL],
  [note("Living with follicular lymphoma, the decisions and the people who make them:"),
   "On being told nobody will treat it. Lymphoma Action's page on active monitoring is the best patient-facing account of this in English and is quoted at length in the decision record, including a person on monitoring describing it as counter-intuitive and a psychological rather than a physical challenge. The randomised evidence behind the approach is a British-led trial of 379 people with asymptomatic, non-bulky, advanced follicular lymphoma, in which early rituximab delayed the need for chemotherapy or radiotherapy without a difference in overall survival."],
);

export const hodgkinLivingSpike: Spike = mk(
  CX.hodgkin,
  ["lymphoma-decision-beacopp-or-abvd", "lymphoma-decision-fertility-timing", "lymphoma-decision-trial", "lymphoma-living-hodgkin-survivorship-screening", "lymphoma-living-fatigue", "lymphoma-living-scanxiety-and-surveillance", "lymphoma-living-returning-to-work", "lymphoma-living-vaccinations", "secondary-malignancy", "cardiotoxicity", "deauville"],
  ["pet-adapted-therapy", "pet-ct", "mammography"],
  [LA_CHL, LA_LATE_EFFECTS, LA_BREAST_SCREENING_RECALL, GOVUK_BREAST_VHR, SCHAAPVELD, VAN_NIMWEGEN, NHS_HL, NHS_HL_SYMPTOMS, NHS_HL_TREATMENT, MAC_HL, CRUK_HL_LIVING, MAC_SVCO],
  [note("Living with and after Hodgkin lymphoma, the decisions and the people who make them:"),
   "On the forty-year figures. The second-cancer and cardiovascular cumulative incidences quoted on this page come from two Dutch cohorts treated between 1965 and 2000 with the radiotherapy fields and doses of that era, which are far larger than anything given now. They describe what happened to those cohorts. What modern fields and PET-guided de-escalation are worth over forty years is not yet known, because the cohort that would measure it has not been followed for forty years. The reason to carry the figures anyway is that the screening programmes attached to them are the thing a survivor can act on, and the commonest failure is not being enrolled in one."],
);

export const hodgkinAdvancedLivingSpike: Spike = mk(
  CX.hodgkinAdvanced,
  ["lymphoma-decision-beacopp-or-abvd", "lymphoma-decision-fertility-timing", "lymphoma-decision-trial", "lymphoma-living-hodgkin-survivorship-screening", "lymphoma-living-fatigue", "secondary-malignancy", "cardiotoxicity", "deauville"],
  ["pet-adapted-therapy", "pet-ct"],
  [LA_CHL, LA_LATE_EFFECTS, RATHL_PAPER, HD21_PAPER, BEHRINGER, NHS_HL_TREATMENT],
  [note("Advanced Hodgkin lymphoma, what the escalation decision costs and what it buys:")],
);

export const hodgkinEarlyLivingSpike: Spike = mk(
  CX.hodgkinEarly,
  ["lymphoma-decision-fertility-timing", "lymphoma-decision-trial", "lymphoma-living-hodgkin-survivorship-screening", "lymphoma-living-fatigue", "secondary-malignancy", "cardiotoxicity"],
  ["pet-adapted-therapy", "mammography"],
  [LA_CHL, LA_LATE_EFFECTS, GOVUK_BREAST_VHR, LA_BREAST_SCREENING_RECALL, SCHAAPVELD],
  [note("Early-stage Hodgkin lymphoma, and the screening that follows a cure:")],
);

export const hodgkinRelapsedLivingSpike: Spike = mk(
  CX.hodgkinRelapsed,
  ["lymphoma-decision-local-or-car-t-centre", "lymphoma-decision-trial", "lymphoma-living-hodgkin-survivorship-screening", "lymphoma-living-infection-years-after", "lymphoma-living-fatigue"],
  ["autologous-stem-cell-transplant", "car-t"],
  [LA_ASCT, LA_RELAPSE, LA_CAR_T, LA_LATE_EFFECTS],
  [note("Relapsed Hodgkin lymphoma, the transplant route and what living near a centre asks of a household:")],
);

export const mantleCellLivingSpike: Spike = mk(
  CX.mcl,
  ["lymphoma-decision-watch-and-wait", "lymphoma-decision-local-or-car-t-centre", "lymphoma-decision-trial", "lymphoma-living-indolent-lymphoma", "lymphoma-living-infection-years-after", "lymphoma-living-vaccinations", "lymphoma-living-fatigue", "watchful-waiting"],
  ["car-t", "bispecific-antibody", "autologous-stem-cell-transplant"],
  [LA_WATCH_WAIT, LA_CAR_T, LA_RELAPSE, MAC_NHL],
  [note("Living with mantle cell lymphoma:")],
);

export const marginalZoneLivingSpike: Spike = mk(
  CX.mzl,
  ["lymphoma-decision-watch-and-wait", "lymphoma-decision-trial", "lymphoma-living-indolent-lymphoma", "lymphoma-living-scanxiety-and-surveillance", "lymphoma-living-infection-years-after", "lymphoma-living-fatigue", "watchful-waiting"],
  [],
  [LA_WATCH_WAIT, LA_EMOTIONAL, MAC_NHL],
  [note("Living with marginal zone lymphoma:")],
);

export const waldenstromLivingSpike: Spike = mk(
  CX.wm,
  ["lymphoma-decision-watch-and-wait", "lymphoma-decision-trial", "lymphoma-living-indolent-lymphoma", "lymphoma-living-infection-years-after", "lymphoma-living-fatigue", "watchful-waiting"],
  [],
  [LA_WATCH_WAIT, LA_EMOTIONAL, MAC_NHL],
  [note("Living with Waldenstrom macroglobulinaemia:")],
);

export const ptclLivingSpike: Spike = mk(
  CX.ptcl,
  ["lymphoma-decision-trial", "lymphoma-decision-fertility-timing", "lymphoma-living-fatigue", "lymphoma-living-scanxiety-and-surveillance", "lymphoma-living-returning-to-work"],
  ["autologous-stem-cell-transplant"],
  [LA_TRIALS, LA_ASCT, MAC_NHL],
  [note("Living with a peripheral T-cell lymphoma, where a trial is more often the right first question:")],
);

export default nhlLivingSpike;

import type { EntityInput, PaperInput, RoadmapInput, TrialInput } from "@/lib/schema";
import type { Spike, SpikeSupplement } from "./index";
import { CX, REGISTRY_ID_TRIALS } from "./lymphoma-evidence-shared";
import { lymphomaLandmarkTrials } from "./lymphoma-evidence-trials";
import { lymphomaRecruitingTrials } from "./lymphoma-evidence-trials-recruiting";
import { lymphomaFoundationPapers } from "./lymphoma-evidence-papers-foundations";
import { lymphomaTrialPapers } from "./lymphoma-evidence-papers-trials";
import { LYMPHOMA_IDEAS, lymphomaIdeas, lymphomaRoadmap } from "./lymphoma-evidence-roadmap";

/**
 * LYMPHOMA: THE EVIDENCE. Facet C of the lymphoma deep dive, 1 October 2026: the landmark trials, what is
 * recruiting now, and the papers that changed practice.
 *
 * What is here. 22 landmark trial records (./lymphoma-evidence-trials.ts), 7 trials recruiting now
 * (./lymphoma-evidence-trials-recruiting.ts), 15 foundation papers on classification, markers, aetiology and
 * late effects (./lymphoma-evidence-papers-foundations.ts), 22 trial reports
 * (./lymphoma-evidence-papers-trials.ts), the roadmap and 8 open questions
 * (./lymphoma-evidence-roadmap.ts).
 *
 * What is deliberately not here. No cancer record (facet A owns those), no standard-of-care row (facet B), no
 * target record (facet D). Trials and papers the corpus already held are supplemented below rather than written
 * again: 5,935 trial records were searched by registry id and 2,540 paper records by DOI and PubMed id before a
 * new record was created, which is how four of the studies named in the brief turned out to exist already under
 * ClinicalTrials.gov-generated ids.
 *
 * The patch applies to `non-hodgkin-lymphoma`; `lymphomaEvidenceHodgkinSpike` applies the Hodgkin half to
 * `hodgkin-lymphoma`, and the two early-stage and advanced-stage Hodgkin records are patched through the
 * supplements so that neither duplicates the other's history.
 */

export const lymphomaEvidencePapers: PaperInput[] = [...lymphomaFoundationPapers, ...lymphomaTrialPapers];
export const lymphomaEvidenceTrials: TrialInput[] = [...lymphomaLandmarkTrials, ...lymphomaRecruitingTrials];
const ROADMAP: RoadmapInput["id"] = lymphomaRoadmap.id;

/**
 * Records other files own that this facet read and attached. Three kinds.
 *
 * 1. Trials that exist under a ClinicalTrials.gov-generated id because an automated pass created them from the
 *    registry: ELM-2, ECHELON-3, inMIND and ECHO. A supplement fills the scalars their owner left empty
 *    (`result`, `yearReported`) and appends the acronym, the publication and the neighbours. It cannot change
 *    `name`, so those pages keep their registry titles until the records are merged; that merge is a dedupe job,
 *    not a job for this facet.
 * 2. Trials the corpus already held in full, which gain the roadmap and the papers this facet added.
 * 3. Papers the corpus already held, which gain the cancer links and the roadmap.
 */
const backlinkSupplements: SpikeSupplement[] = [
  // --- 1. Registry-generated trial records given their names, results and publications ---
  { id: REGISTRY_ID_TRIALS.elm2, aka: ["ELM-2", "Odronextamab in relapsed or refractory B-cell non-Hodgkin lymphoma"],
    result: "In the follicular lymphoma cohort, objective response 80.0 per cent and complete response 73.4 per cent, with median duration of complete response 25.1 months and median progression-free survival 20.7 months.",
    yearReported: 2024, keyPapers: ["paper-elm-2-odronextamab-follicular-ann-oncol-2024"],
    cancers: [CX.fl, CX.nhl, CX.dlbcl], targets: ["cd20", "cd3"], technologies: ["bispecific-antibody", "t-cell-engager"],
    related: [ROADMAP, "paper-elm-2-odronextamab-follicular-ann-oncol-2024"] } satisfies { id: string } & Partial<TrialInput>,
  { id: REGISTRY_ID_TRIALS.echelon3, aka: ["ECHELON-3", "Brentuximab vedotin with lenalidomide and rituximab in relapsed diffuse large B-cell lymphoma"],
    result: "Median overall survival 13.8 against 8.5 months (hazard ratio 0.63, two-sided p = 0.009) and median progression-free survival 4.2 against 2.6 months (hazard ratio 0.53).",
    yearReported: 2025, keyPapers: ["paper-echelon-3-brentuximab-lenalidomide-rituximab-dlbcl-jco-2025"],
    targets: ["cd30", "cd20"], technologies: ["adc"],
    related: [ROADMAP, "paper-echelon-3-brentuximab-lenalidomide-rituximab-dlbcl-jco-2025", "polargo", "starglo"] } satisfies { id: string } & Partial<TrialInput>,
  { id: REGISTRY_ID_TRIALS.inmind, aka: ["inMIND", "Tafasitamab with lenalidomide and rituximab in relapsed or refractory follicular lymphoma"],
    result: "Median investigator-assessed progression-free survival 22.4 against 13.9 months (hazard ratio 0.43, 95 per cent confidence interval 0.32 to 0.58).",
    yearReported: 2026, keyPapers: ["paper-inmind-tafasitamab-lenalidomide-rituximab-follicular-lancet-2026"],
    cancers: [CX.fl, CX.mzl, CX.nhl], targets: ["cd19", "cd20"],
    related: [ROADMAP, "paper-inmind-tafasitamab-lenalidomide-rituximab-follicular-lancet-2026", "rosewood"] } satisfies { id: string } & Partial<TrialInput>,
  { id: REGISTRY_ID_TRIALS.echo, aka: ["ECHO", "Acalabrutinib with bendamustine and rituximab in untreated mantle cell lymphoma"],
    result: "Median progression-free survival 66.4 against 49.6 months (hazard ratio 0.73, p = 0.0160), with no significant overall survival difference (hazard ratio 0.86, p = 0.27).",
    yearReported: 2025, keyPapers: ["paper-echo-acalabrutinib-bendamustine-rituximab-mantle-cell-jco-2025"],
    targets: ["btk", "cd20", "ccnd1"], pathways: ["bcr-signalling"],
    related: [ROADMAP, "paper-echo-acalabrutinib-bendamustine-rituximab-mantle-cell-jco-2025", "shine", "enrich"] } satisfies { id: string } & Partial<TrialInput>,

  // --- 2. Trials the corpus holds in full, linked to the roadmap and to the new neighbours ---
  { id: "polarix", related: [ROADMAP, "polargo", "polar-bear", "flyer", "goya"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "zuma-7", related: [ROADMAP, "belinda", "transcend-nhl-001", LYMPHOMA_IDEAS.manufacturing] } satisfies { id: string } & Partial<TrialInput>,
  { id: "transform", related: [ROADMAP, "belinda", "transcend-nhl-001", LYMPHOMA_IDEAS.manufacturing] } satisfies { id: string } & Partial<TrialInput>,
  { id: "belinda", keyPapers: ["paper-belinda-tisagenlecleucel-second-line-nejm-2022"], related: [ROADMAP, "juliet", "transcend-nhl-001", LYMPHOMA_IDEAS.manufacturing] } satisfies { id: string } & Partial<TrialInput>,
  { id: "zuma-1", related: [ROADMAP, "juliet", "transcend-nhl-001"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "zuma-5", keyPapers: ["paper-zuma-5-axi-cel-indolent-lymphoma-lancet-oncol-2022"], related: [ROADMAP, "elara", "lymphoma-tx-pod24"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "hd21", related: [ROADMAP, "hd18", "ahl2011", "hd10"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "rathl", related: [ROADMAP, "hd18", "ahl2011", "eortc-h10"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "echelon-1", related: [ROADMAP, "radar-hodgkin", "hd21"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "echelon-2", related: [ROADMAP, "jcog9801", "smile-enktl", LYMPHOMA_IDEAS.tcell] } satisfies { id: string } & Partial<TrialInput>,
  { id: "alcanza", related: [ROADMAP, LYMPHOMA_IDEAS.tcell] } satisfies { id: string } & Partial<TrialInput>,
  { id: "triangle", related: [ROADMAP, "lyma", "enrich", "shine"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "gallium", related: [ROADMAP, "goya", "prima-follicular", "fortplus"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "relevance", related: [ROADMAP, "prima-follicular", LYMPHOMA_IDEAS.fixedDuration] } satisfies { id: string } & Partial<TrialInput>,
  { id: "ielsg32", related: [ROADMAP, "ielsg43", "prima-cns"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "ielsg43", related: [ROADMAP, "ielsg32", "prima-cns"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "epcore-nhl-1", related: [ROADMAP, "polargo", "starglo"] } satisfies { id: string } & Partial<TrialInput>,
  { id: "phoenix", related: [ROADMAP, "arched", "paper-phoenix-ibrutinib-r-chop-non-gcb-dlbcl-jco-2019"], keyPapers: ["paper-phoenix-ibrutinib-r-chop-non-gcb-dlbcl-jco-2019"] } satisfies { id: string } & Partial<TrialInput>,

  // --- 3. Papers the corpus holds, given the cancer links and the roadmap ---
  { id: "paper-alizadeh-nature", cancers: [CX.dlbcl, CX.nhl], related: [ROADMAP, "paper-rosenwald-molecular-profiling-dlbcl-nejm-2002", "paper-hans-immunohistochemistry-cell-of-origin-dlbcl-blood-2004"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-cheson-j-clin-oncol", related: [ROADMAP, "paper-scherer-ctdna-lymphoma-subtypes-genome-evolution-sci-transl-med-2016"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-kurtz-j-clin-oncol", related: [ROADMAP, "paper-scherer-ctdna-lymphoma-subtypes-genome-evolution-sci-transl-med-2016", LYMPHOMA_IDEAS.ctdna] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-kurtz-nat-biotechnol", related: [ROADMAP, "paper-scherer-ctdna-lymphoma-subtypes-genome-evolution-sci-transl-med-2016", LYMPHOMA_IDEAS.ctdna] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-ghsg-hd10-reduced-intensity-early-hodgkin-nejm-2010", related: [ROADMAP, "hd10", "paper-ghsg-hd16-pet-guided-early-favourable-hodgkin-jco-2019"], trials: ["hd10"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-rathl-interim-pet-adapted-abvd-advanced-hodgkin-nejm-2016", related: [ROADMAP, "paper-ghsg-hd18-pet-guided-escalated-beacopp-lancet-2017", "paper-ahl2011-pet-adapted-treatment-advanced-hodgkin-lancet-oncol-2019"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-ghsg-hd21-brecadd-vs-ebeacopp-advanced-hodgkin-lancet-2024", related: [ROADMAP, "paper-ghsg-hd18-pet-guided-escalated-beacopp-lancet-2017"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-polarix-polatuzumab-rchp-nejm-2022", related: [ROADMAP, "paper-polargo-polatuzumab-r-gemox-dlbcl-jco-2026", "polar-bear"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-zuma-7-axi-cel-second-line-nejm-2022", related: [ROADMAP, "paper-belinda-tisagenlecleucel-second-line-nejm-2022", LYMPHOMA_IDEAS.manufacturing] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-transform-liso-cel-lancet-2022", related: [ROADMAP, "paper-belinda-tisagenlecleucel-second-line-nejm-2022", "paper-transcend-nhl-001-liso-cel-lancet-2020"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-juliet-tisagenlecleucel-dlbcl-nejm-2019", trials: ["juliet"], related: [ROADMAP, "paper-belinda-tisagenlecleucel-second-line-nejm-2022"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-zuma-1-axi-cel-nejm-2017", related: [ROADMAP, "paper-transcend-nhl-001-liso-cel-lancet-2020", "paper-juliet-tisagenlecleucel-dlbcl-nejm-2019"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-horwitz-lancet", cancers: [CX.ptcl, CX.nhl], related: [ROADMAP, LYMPHOMA_IDEAS.tcell] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-wotherspoon-h-pylori-malt-lancet-1993", related: [ROADMAP, "paper-ielsg-19-chlorambucil-rituximab-malt-jco-2017"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-triangle-ibrutinib-mantle-cell-lymphoma-dreyling-lancet-2024", related: [ROADMAP, "paper-lyma-rituximab-maintenance-after-transplant-mantle-cell-nejm-2017", "paper-enrich-ibrutinib-rituximab-mantle-cell-lancet-2025"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-fort-4gy-vs-24gy-indolent-lymphoma-hoskin-lancet-oncol-2014", related: [ROADMAP, "fortplus"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-fort-long-term-follow-up-hoskin-lancet-oncol-2021", related: [ROADMAP, "fortplus", "paper-trog-99-03-radiotherapy-systemic-therapy-early-follicular-jco-2018"] } satisfies { id: string } & Partial<PaperInput>,
  { id: "paper-alcanza-brentuximab-vedotin-lancet-2017", related: [ROADMAP, LYMPHOMA_IDEAS.tcell] } satisfies { id: string } & Partial<PaperInput>,
];

const entities: EntityInput[] = [
  ...lymphomaEvidenceTrials, ...lymphomaEvidencePapers, lymphomaRoadmap, ...lymphomaIdeas,
] as EntityInput[];

// ======================= THE NON-HODGKIN SPIKE =======================
const spike: Spike = {
  cancerId: CX.nhl,
  entities,
  supplements: backlinkSupplements,
  patch: {
    history: [
      { year: 1958, title: "A jaw tumour in Ugandan children is described, and its geography points at a virus", note: "Burkitt's report in the British Journal of Surgery has no abstract indexed on Europe PMC; its importance is that mapping where the tumour occurred prompted the search for an infectious cause.", refs: ["paper-burkitt-sarcoma-involving-jaws-african-children-br-j-surg-1958"] },
      { year: 1964, title: "The first virus found in a human tumour", note: "Epstein, Achong and Barr saw virus particles in lymphoblasts cultured from one of Burkitt's biopsies, beginning the field that now includes human papillomavirus, hepatitis B and Helicobacter pylori.", refs: ["paper-epstein-virus-particles-burkitt-lymphoblasts-lancet-1964"] },
      { year: 1980, title: "The first human retrovirus, isolated from a T-cell lymphoma", note: "Poiesz and Gallo characterised type C particles with a reverse transcriptase unlike any known primate retrovirus; Hinuma's Japanese seroepidemiology the following year found antibodies in all 44 patients with adult T-cell leukaemia tested and in 26 per cent of healthy adults from endemic areas.", refs: ["paper-poiesz-htlv-retrovirus-cutaneous-t-cell-lymphoma-pnas-1980", "paper-hinuma-adult-t-cell-leukaemia-antigen-pnas-1981"] },
      { year: 2002, title: "Gene expression turns one lymphoma into three", note: "Rosenwald profiled 240 biopsies, found germinal-centre, activated and type 3 subgroups and built a 17-gene survival predictor independent of the International Prognostic Index; Hans reproduced the split in 2004 with three ordinary stains, giving five-year survival of 76 against 34 per cent.", refs: ["paper-rosenwald-molecular-profiling-dlbcl-nejm-2002", "paper-hans-immunohistochemistry-cell-of-origin-dlbcl-blood-2004", "paper-alizadeh-nature"] },
      { year: 2007, title: "The only randomised trial ever run in adult T-cell leukaemia/lymphoma", note: "JCOG9801, 118 patients: complete response 40 against 25 per cent for VCAP-AMP-VECP over biweekly CHOP, three-year overall survival 24 against 13 per cent, grade 4 thrombocytopenia 74 against 17 per cent.", refs: ["paper-jcog9801-vcap-amp-vecp-adult-t-cell-leukaemia-jco-2007", "jcog9801"] },
      { year: 2011, title: "Asparaginase makes NK/T-cell lymphoma treatable, and rituximab maintenance doubles remission in follicular lymphoma", note: "SMILE reached an overall response of 79 per cent in 38 patients with a disease that resists anthracyclines; PRIMA raised three-year progression-free survival from 57.6 to 74.9 per cent, and at nine years the medians were 10.5 against 4.1 years with no survival difference.", refs: ["paper-smile-chemotherapy-nk-t-cell-lymphoma-jco-2011", "paper-prima-rituximab-maintenance-follicular-lancet-2011", "paper-prima-final-rituximab-maintenance-follicular-jco-2019", "smile-enktl", "prima-follicular"] },
      { year: 2015, title: "Early progression splits follicular lymphoma in two", note: "Casulo: 19 per cent of 588 patients progressed within two years of first-line R-CHOP, with five-year overall survival of 50 against 90 per cent and an index-adjusted hazard ratio of 6.44.", refs: ["paper-casulo-pod24-follicular-lymphoma-jco-2015", "lymphoma-tx-pod24"] },
      { year: 2016, title: "A blood test reads the lymphoma without a biopsy", note: "Scherer showed circulating tumour DNA predicts outcome at diagnosis, classifies cell of origin from plasma, beats imaging for residual disease and distinguishes follicular lymphomas that will transform from those that will not.", refs: ["paper-scherer-ctdna-lymphoma-subtypes-genome-evolution-sci-transl-med-2016", "paper-kurtz-j-clin-oncol", "ctdna"] },
      { year: 2018, title: "Two genetic classifications of diffuse large B-cell lymphoma, three weeks apart", note: "Chapuy's five clusters from 304 tumours and Schmitz's four subtypes from 574; Wright's LymphGen tool in 2020 extended them to seven and made per-patient classification possible. None has yet changed a first-line treatment.", refs: ["paper-chapuy-molecular-subtypes-dlbcl-nat-med-2018", "paper-schmitz-genetics-pathogenesis-dlbcl-nejm-2018", "paper-wright-lymphgen-genetic-subtypes-dlbcl-cancer-cell-2020", LYMPHOMA_IDEAS.genetics] },
      { year: 2019, title: "Four cycles instead of six, and a targeted tablet that helped the young and harmed the old", note: "FLYER: three-year progression-free survival 96 per cent with four cycles of R-CHOP in young favourable disease, non-inferior to six. PHOENIX: ibrutinib improved event-free survival under 60 (hazard ratio 0.579) and worsened it over 60, raising serious adverse events from 38.2 to 63.4 per cent.", refs: ["paper-flyer-four-vs-six-cycles-r-chop-lancet-2019", "paper-phoenix-ibrutinib-r-chop-non-gcb-dlbcl-jco-2019", "flyer"] },
      { year: 2020, title: "The third CAR-T product, and the mantle cell question changes shape", note: "TRANSCEND NHL 001: objective response 73 per cent and complete response 53 per cent in 256 evaluable patients, with grade 3 or worse cytokine release syndrome in 2 per cent. SHINE then gained 28 months of progression-free survival in older mantle cell lymphoma with no survival benefit.", refs: ["paper-transcend-nhl-001-liso-cel-lancet-2020", "paper-shine-ibrutinib-bendamustine-rituximab-mantle-cell-nejm-2022", "transcend-nhl-001", "shine"] },
      { year: 2022, title: "The second-line CAR-T trial that failed, and why", note: "BELINDA: median event-free survival 3.0 months in both arms, with a 52-day median interval from leukapheresis to infusion and 25.9 per cent of the CAR-T group progressing by week 6 against 13.8 per cent of the comparator group.", refs: ["paper-belinda-tisagenlecleucel-second-line-nejm-2022", "belinda", LYMPHOMA_IDEAS.manufacturing] },
      { year: 2025, title: "A chemotherapy-free first line beats immunochemotherapy in mantle cell lymphoma", note: "ENRICH, 397 patients: adjusted progression-free survival hazard ratio 0.69, driven by the comparison against R-CHOP (0.37) rather than against bendamustine-rituximab (0.91). ECHELON-3 and POLARGO gave transplant-ineligible relapsed diffuse large B-cell lymphoma two more options with a survival benefit.", refs: ["paper-enrich-ibrutinib-rituximab-mantle-cell-lancet-2025", "paper-echelon-3-brentuximab-lenalidomide-rituximab-dlbcl-jco-2025", "paper-polargo-polatuzumab-r-gemox-dlbcl-jco-2026", "enrich", "polargo"] },
      { year: 2032, title: "The first-line bispecific question completes", note: "The National Cancer Institute trial of mosunetuzumab against rituximab in low tumour burden follicular lymphoma (NCT06337318, 600 estimated participants) has a primary completion date of 31 March 2032; RADAR, the radiotherapy-free Hodgkin trial, is listed for September 2030.", refs: ["mosun-lbt-fl", "radar-hodgkin", LYMPHOMA_IDEAS.fixedDuration] },
    ],
    pipeline: [...lymphomaIdeas.map((i) => i.id)],
    openProblems: [
      "Three genetic classifications of diffuse large B-cell lymphoma exist and none of them decides anyone's first-line treatment outside a trial. The gap between Schmitz in 2018 and a randomised trial that assigns treatment by LymphGen subtype is the clearest unfinished business in the disease.",
      "Circulating tumour DNA predicts outcome at diagnosis, detects residual disease better than imaging and flags transformation before it declares itself, and no randomised trial has yet shown that changing treatment on the strength of it helps anyone.",
      "The T-cell lymphomas have almost no randomised evidence. Adult T-cell leukaemia/lymphoma has had exactly one controlled trial, opened in 1998 with 118 patients, and the regimen that makes extranodal NK/T-cell lymphoma treatable rests on a 38-patient single-arm study.",
      "Rituximab is thirty years old and still unavailable or unaffordable in much of the world, asparaginase is subject to recurrent shortages, and CAR-T needs an apheresis service and a cryopreservation chain. Lymphoma is among the most curable common cancers in the places that have the drugs.",
    ],
    terms: ["cell-of-origin", "lugano-classification", "deauville-score", "ipi-score", "flipi", "ctdna", "mrd", "crs", "icans", "r-chop", "double-hit-lymphoma", "autologous-transplant", "maintenance-therapy", "lymphoma-tx-pod24", "lymphoma-tx-car-t-pathway"],
    technologies: ["car-t", "bispecific-antibody", "t-cell-engager", "adc", "monoclonal-antibody", "pet-ct", "liquid-biopsy", "wes-wgs", "ngs"],
    trials: ["flyer", "calgb-50303", "goya", "remarc", "polargo", "juliet", "transcend-nhl-001", "prima-follicular", "ielsg-19", "trog-99-03", "elara", "rosewood", "shine", "enrich", "lyma", "jcog9801", "smile-enktl", "polar-bear", "arched", "prima-cns", "fortplus", "mosun-lbt-fl", "mosun-len-mzl"],
    bottlenecks: ["b-tumor-heterogeneity", "b-biomarker-validation", "b-manufacturing-cell-therapy", "b-rare-cancers", "b-global-access", "b-trial-design", "b-negative-results", "b-dormancy-mrd"],
    related: [ROADMAP, ...Object.values(LYMPHOMA_IDEAS)],
  },
};

// ======================= THE HODGKIN SPIKE =======================
/** The Hodgkin half of the facet, patched onto `hodgkin-lymphoma` so the two families do not share a history. */
export const lymphomaEvidenceHodgkinSpike: Spike = {
  cancerId: CX.hodgkin,
  entities: [],
  patch: {
    history: [
      { year: 2003, title: "The dose-response curve for breast cancer after Hodgkin radiotherapy", note: "Travis: 4 Gy or more to the breast carried a 3.2-fold risk and over 40 Gy an eightfold risk, with no plateau; ovarian damage from alkylating agents or radiation lowered the risk, showing that hormonal stimulation is needed for radiation-induced breast cancer.", refs: ["paper-travis-breast-cancer-after-hodgkin-radiotherapy-jama-2003"] },
      { year: 2010, title: "Two cycles and 20 Gy is enough for early favourable disease", note: "HD10 randomised 1,370 patients in a two by two design: five-year freedom from treatment failure 93.0 against 91.1 per cent for four against two cycles of ABVD (p = 0.39) and no difference between 30 Gy and 20 Gy (p = 1.00).", refs: ["paper-ghsg-hd10-reduced-intensity-early-hodgkin-nejm-2010", "hd10"] },
      { year: 2015, title: "What curing Hodgkin lymphoma costs forty years later", note: "Schaapveld: 48.5 per cent of 3,905 survivors developed a second cancer within 40 years, with risk still 3.9 times the population rate after 35 years and no fall between the 1965 to 1976 and 1989 to 2000 treatment periods. Van Nimwegen: 50 per cent developed cardiovascular disease within 40 years.", refs: ["paper-schaapveld-second-cancer-risk-40-years-hodgkin-nejm-2015", "paper-van-nimwegen-cardiovascular-disease-after-hodgkin-jama-intern-med-2015", LYMPHOMA_IDEAS.survivorship] },
      { year: 2017, title: "The interim scan directs intensification better than it directs de-escalation", note: "EORTC H10 raised five-year progression-free survival in scan-positive early-stage patients from 77.4 to 90.6 per cent by switching to escalated BEACOPP, but could not demonstrate non-inferiority of dropping radiotherapy after a negative scan in either risk group. HD18 shortened escalated BEACOPP to four cycles after a negative scan with five-year progression-free survival of 92.2 against 90.8 per cent and half the severe infections.", refs: ["paper-eortc-h10-pet-adapted-early-hodgkin-jco-2017", "paper-ghsg-hd18-pet-guided-escalated-beacopp-lancet-2017", "eortc-h10", "hd18"] },
      { year: 2019, title: "Omitting radiotherapy costs 7.3 points, and switching to ABVD costs nothing", note: "HD16: five-year progression-free survival 86.1 per cent without radiotherapy against 93.4 per cent with it after a negative scan. AHL2011: switching scan-negative patients from escalated BEACOPP to ABVD gave 85.7 against 86.2 per cent with grade 3 to 4 anaemia falling from 69 to 28 per cent.", refs: ["paper-ghsg-hd16-pet-guided-early-favourable-hodgkin-jco-2019", "paper-ahl2011-pet-adapted-treatment-advanced-hodgkin-lancet-oncol-2019", "hd16", "ahl2011"] },
      { year: 2030, title: "RADAR reports", note: "RADAR (NCT04685616, 1,042 estimated participants) replaces bleomycin with brentuximab vedotin and omits radiotherapy entirely after a Deauville score of 1 to 3; the registry lists primary completion for September 2030.", refs: ["radar-hodgkin", LYMPHOMA_IDEAS.radiotherapy] },
    ],
    openProblems: [
      "Every attempt to omit radiotherapy from early-stage Hodgkin lymphoma on the strength of a negative interim scan has cost tumour control: 7.3 percentage points in HD16 and a failure to demonstrate non-inferiority in either risk group of EORTC H10.",
      "The late-effect figures that justify de-escalation come from patients treated up to 2000 with mantle fields. Nobody knows the forty-year risks of involved-site radiotherapy, brentuximab vedotin, checkpoint inhibitors or CAR-T, and the field is making decisions on a harm estimate drawn from a treatment that is no longer given.",
    ],
    trials: ["hd10", "hd16", "hd18", "ahl2011", "eortc-h10", "radar-hodgkin"],
    related: [ROADMAP, LYMPHOMA_IDEAS.radiotherapy, LYMPHOMA_IDEAS.survivorship],
  },
};

/** Early-stage Hodgkin lymphoma: the trials that set its standard and the one trying to remove radiotherapy. */
export const lymphomaEvidenceHodgkinEarlySpike: Spike = {
  cancerId: CX.hodgkinEarly,
  entities: [],
  patch: {
    trials: ["hd10", "hd16", "eortc-h10", "radar-hodgkin"],
    related: [ROADMAP, LYMPHOMA_IDEAS.radiotherapy],
  },
};

/** Advanced-stage Hodgkin lymphoma: the two scan-guided de-escalation trials. */
export const lymphomaEvidenceHodgkinAdvancedSpike: Spike = {
  cancerId: CX.hodgkinAdvanced,
  entities: [],
  patch: {
    trials: ["hd18", "ahl2011"],
    related: [ROADMAP],
  },
};

/** Diffuse large B-cell lymphoma: everything that tried to beat R-CHOP, and the relapsed-setting options. */
export const lymphomaEvidenceDlbclSpike: Spike = {
  cancerId: CX.dlbcl,
  entities: [],
  patch: {
    trials: ["flyer", "calgb-50303", "goya", "remarc", "polargo", "juliet", "transcend-nhl-001", "polar-bear", "arched"],
    related: [ROADMAP, LYMPHOMA_IDEAS.genetics, LYMPHOMA_IDEAS.ctdna, LYMPHOMA_IDEAS.manufacturing],
  },
};

/** Follicular lymphoma: maintenance, early progression, cellular therapy and the first-line bispecific question. */
export const lymphomaEvidenceFollicularSpike: Spike = {
  cancerId: CX.fl,
  entities: [],
  patch: {
    trials: ["prima-follicular", "trog-99-03", "elara", "rosewood", "fortplus", "mosun-lbt-fl"],
    related: [ROADMAP, LYMPHOMA_IDEAS.fixedDuration, LYMPHOMA_IDEAS.ctdna],
  },
};

/** Mantle cell lymphoma: three ways to use a Bruton tyrosine kinase inhibitor, none of which extends life. */
export const lymphomaEvidenceMantleSpike: Spike = {
  cancerId: CX.mcl,
  entities: [],
  patch: {
    trials: ["shine", "enrich", "lyma"],
    related: [ROADMAP, LYMPHOMA_IDEAS.fixedDuration],
  },
};

/** Marginal zone and MALT lymphoma: the single randomised first-line trial, and the one now recruiting. */
export const lymphomaEvidenceMarginalZoneSpike: Spike = {
  cancerId: CX.mzl,
  entities: [],
  patch: {
    trials: ["ielsg-19", "mosun-len-mzl"],
    related: [ROADMAP, LYMPHOMA_IDEAS.fixedDuration],
  },
};

/** Peripheral T-cell lymphoma: the two studies that carry most of the evidence for the whole family. */
export const lymphomaEvidenceTcellSpike: Spike = {
  cancerId: CX.ptcl,
  entities: [],
  patch: {
    trials: ["jcog9801", "smile-enktl"],
    related: [ROADMAP, LYMPHOMA_IDEAS.tcell, LYMPHOMA_IDEAS.access],
  },
};

/** Primary central nervous system lymphoma: the consolidation question for the age group that has most of it. */
export const lymphomaEvidencePcnslSpike: Spike = {
  cancerId: CX.pcnsl,
  entities: [],
  patch: {
    trials: ["prima-cns"],
    related: [ROADMAP],
  },
};

export default spike;

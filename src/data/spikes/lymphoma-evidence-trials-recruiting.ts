import type { TrialInput } from "@/lib/schema";
import { CX, ct, link, trial } from "./lymphoma-evidence-shared";

/**
 * LYMPHOMA TRIALS RECRUITING NOW. Facet C of the lymphoma deep dive, 1 October 2026.
 *
 * Method, which is the project's registry method and not a bulk import. The ClinicalTrials.gov v2 API was
 * queried once for condition "lymphoma", status RECRUITING, phase 3, and the 135 results were cached to /tmp and
 * read by hand. A trial earns a record here only if its drugs and its disease both already have records in the
 * corpus, and only if it asks a question a reader could act on. Everything else was left alone: the leukaemia and
 * supportive-care studies that the condition search drags in, the chronic lymphocytic leukaemia programmes, the
 * immunoglobulin platform trials, and the trials whose drug has no record (IGNITE, NCT07104032, tests
 * tirabrutinib in relapsed primary central nervous system lymphoma and is the best example: a good trial, left
 * out because OnCo has no tirabrutinib record for it to hang on).
 *
 * Trials that the search returned and that already exist in the corpus were not written again: AHOD2131
 * (ahod2131), GLOBRYTE, the three OLYMPIA studies, waveLINE-003 and NCT06717347, the two surovatamig studies,
 * NCT06911502, NCT06363994, NCT06561048, NCT07234162, NCT06072131, NCT06947967, NCT06522737, NCT07188558 and
 * ALLELE all hold registry-generated records already.
 *
 * Every field below is from the registry record read on 1 October 2026. No result is stated, because none has
 * been reported; `status` is "active" throughout and the dates are the registry's own estimates.
 */
export const lymphomaRecruitingTrials: TrialInput[] = [
  trial({ id: "radar-hodgkin", name: "RADAR", nct: "NCT04685616", phase: "3", status: "active",
    setting: "Untreated early-stage classical Hodgkin lymphoma: ABVD against A2VD, which replaces the bleomycin with brentuximab vedotin, with treatment after two cycles set by a centrally reviewed scan",
    sponsor: "University College London with the Canadian Cancer Trials Group", started: "2022-04-14", startedType: "actual", enrolled: 1042,
    aka: ["RADAR trial", "A2VD in early-stage Hodgkin lymphoma", "ISRCTN RADAR"],
    tldr: "An international trial asking whether swapping one old chemotherapy drug for a targeted antibody lets most people with early Hodgkin lymphoma avoid radiotherapy altogether.",
    summary: "RADAR is two parallel trials sharing one analysis: trial 1 led by University College London across Europe, Australia and New Zealand, trial 2 led by the Canadian Cancer Trials Group across North America, with the datasets combined to reach the target of 1,042 participants.\n\nParticipants are randomised to ABVD (doxorubicin, bleomycin, vinblastine and dacarbazine) or A2VD, which replaces the bleomycin with brentuximab vedotin and adds growth factor support. Everyone has a centrally reviewed scan after two cycles. A Deauville score of 1 to 3 means one further cycle of the randomised chemotherapy and then follow-up with no radiotherapy at all. A Deauville score of 4 means two further cycles followed by involved-site radiotherapy. A Deauville score of 5 means coming off trial treatment. Follow-up runs for a minimum of five years, and primary completion is estimated for September 2030.\n\nThe design is a direct response to HD16 and EORTC H10, which both showed that an interim scan alone is not enough to justify dropping radiotherapy. RADAR changes the chemotherapy as well, on the hypothesis that a more active regimen will make the omission safe. The primary endpoint is progression-free survival. Sites are open in Australia, Belgium, Canada, Denmark, Ireland, the Netherlands, New Zealand, Portugal, Slovakia, Spain, the United Kingdom and the United States.",
    cancers: [CX.hodgkinEarly, CX.hodgkin], drugs: ["brentuximab-vedotin", "doxorubicin", "bleomycin", "vinblastine", "dacarbazine"],
    targets: ["cd30"], technologies: ["adc", "pet-ct", "radiotherapy"], terms: ["deauville-score", "abvd-beacopp"],
    sections: ["adcs", "radiation", "imaging"], bottlenecks: ["b-survivorship", "b-toxicity-qol"],
    trials: ["hd16", "eortc-h10", "echelon-1"], institutions: ["cruk"],
    links: [ct("NCT04685616")] }),

  trial({ id: "mosun-lbt-fl", name: "Mosunetuzumab against rituximab in low tumour burden follicular lymphoma", nct: "NCT06337318", phase: "3", status: "active",
    setting: "Follicular lymphoma with a low tumour burden needing first treatment: four weekly doses of rituximab against fixed-duration mosunetuzumab",
    sponsor: "National Cancer Institute", started: "2024-10-23", startedType: "actual", enrolled: 600,
    aka: ["Rituximab versus mosunetuzumab in low tumour burden follicular lymphoma"],
    tldr: "A large American trial testing whether a two-headed antibody that recruits the immune system should replace the standard antibody as the first treatment for slow-growing follicular lymphoma.",
    summary: "Low tumour burden follicular lymphoma is the setting in which rituximab alone, given as four weekly doses, has been the gentle standard for twenty years, and in which watch and wait remains a reasonable alternative. This National Cancer Institute trial asks whether mosunetuzumab, a CD20 by CD3 bispecific antibody given for a fixed duration, does better.\n\nIt is among the first phase 3 trials to put a bispecific antibody against rituximab in a first-line, low-burden population; the class has so far been tested almost entirely in relapsed disease. Participants are randomised between rituximab (with the hyaluronidase subcutaneous formulation permitted) and mosunetuzumab. The co-primary endpoints are three-year progression-free survival and progression-free survival overall, with primary completion estimated for 31 March 2032.\n\nWhat makes it worth watching is the question underneath it: whether a treatment that produces deep remissions in heavily pretreated disease changes the natural history when it is given first, or simply moves the same remission earlier. The answer bears on every indolent lymphoma.",
    cancers: [CX.fl, CX.nhl], drugs: ["mosunetuzumab", "rituximab"], targets: ["cd20", "cd3"],
    technologies: ["bispecific-antibody", "t-cell-engager", "monoclonal-antibody"], terms: ["flipi", "watchful-waiting", "lymphoma-tx-watch-and-wait"],
    sections: ["immunotherapy"], bottlenecks: ["b-trial-design", "b-drug-pricing"],
    institutions: ["nci"], links: [ct("NCT06337318")] }),

  trial({ id: "mosun-len-mzl", name: "Mosunetuzumab with lenalidomide in relapsed marginal zone lymphoma", nct: "NCT06006117", phase: "3", status: "active",
    setting: "Relapsed or refractory marginal zone lymphoma after one to three prior lines: mosunetuzumab with lenalidomide against the investigator's choice of rituximab with lenalidomide, bendamustine or CHOP",
    sponsor: "The Lymphoma Academic Research Organisation", started: "2023-09-05", startedType: "actual", enrolled: 260,
    aka: ["Mosunetuzumab-lenalidomide in marginal zone lymphoma"],
    tldr: "A European trial for a lymphoma that rarely gets its own study, testing a two-headed antibody with a tablet against the three combinations doctors currently choose between.",
    summary: "Marginal zone lymphoma is usually studied as a minority arm inside follicular lymphoma trials, which is why so little of its treatment rests on randomised evidence. This trial is run exclusively in it, across Belgium, France, Germany, Italy and Portugal, and takes all three marginal zone subtypes: extranodal, splenic and nodal.\n\nParticipants have had at least one and no more than three prior systemic lines, including at least two cycles of a CD20-directed antibody with or without chemotherapy, or a targeted treatment such as ibrutinib. They are randomised between subcutaneous mosunetuzumab with lenalidomide 20 mg daily on days 1 to 21 of cycles 2 to 6, and an investigator's choice declared before randomisation of rituximab with lenalidomide, rituximab with bendamustine, or R-CHOP. Randomisation is stratified by marginal zone subtype and by whether progression after first-line treatment occurred within two years.\n\nThe primary endpoint is investigator-assessed progression-free survival by the Lugano 2014 criteria, with primary completion estimated for September 2027. Stratifying by early progression is the design detail that matters: it is the first time a marginal zone trial has treated the two-year progression marker as a planned subgroup rather than an afterthought.",
    cancers: [CX.mzl, CX.malt, CX.smzl, CX.nmzl, CX.nhl],
    drugs: ["mosunetuzumab", "lenalidomide", "rituximab", "bendamustine", "cyclophosphamide", "doxorubicin", "vincristine", "prednisone"],
    targets: ["cd20", "cd3"], technologies: ["bispecific-antibody", "t-cell-engager"],
    terms: ["lugano-classification", "lymphoma-tx-pod24", "r-chop"], sections: ["immunotherapy"],
    bottlenecks: ["b-rare-cancers", "b-trial-enrolment"], companies: ["lysa"],
    links: [ct("NCT06006117")] }),

  trial({ id: "polar-bear", name: "POLAR BEAR", nct: "NCT04332822", phase: "3", status: "active",
    setting: "Aged 80 or over, or 75 or over and frail, with untreated diffuse large B-cell lymphoma: R-miniCHOP against R-pola-miniCHP, which replaces the vincristine with polatuzumab vedotin",
    sponsor: "Nordic Lymphoma Group", started: "2020-08-19", startedType: "actual", enrolled: 300,
    aka: ["POLAR BEAR trial", "R-pola-miniCHP in very old patients"],
    tldr: "A Nordic trial asking whether the antibody-drug conjugate that improved first-line treatment for younger patients also helps people in their eighties, who were barely represented in the original trial.",
    summary: "POLARIX established polatuzumab vedotin in place of vincristine in first-line diffuse large B-cell lymphoma, but it enrolled patients up to 80 and the very old and frail were scarcely represented. The standard for that group is R-miniCHOP, a dose-reduced regimen built for tolerability rather than cure. POLAR BEAR asks the same substitution question in exactly the population POLARIX did not answer for.\n\nEligibility is deliberately narrow and unusual: 80 years or older, or 75 or older and frail by a simplified comprehensive geriatric assessment. Participants are randomised 1 to 1 between R-miniCHOP and R-pola-miniCHP. Both arms run 18 weeks, with follow-up to 36 months after treatment ends. The primary endpoint is progression-free survival, and primary completion is estimated for 28 December 2025, so the first report is close.\n\nSites are open in Sweden, Norway, Finland, Denmark, Italy, Australia and New Zealand. Using a geriatric assessment as an eligibility criterion, rather than age alone, is the methodological contribution: it is the kind of trial design that the gap between trial populations and real lymphoma patients has been waiting for.",
    cancers: [CX.dlbcl, CX.nhl], drugs: ["polatuzumab-vedotin", "rituximab", "cyclophosphamide", "doxorubicin", "vincristine", "prednisone"],
    targets: ["cd79b", "cd20"], technologies: ["adc"], terms: ["r-chop", "lymphoma-tx-regimen-alphabet"],
    sections: ["adcs", "chemotherapy"], bottlenecks: ["b-aging-comorbidity", "b-trial-diversity", "b-trial-enrolment"],
    trials: ["polarix", "arched"], links: [ct("NCT04332822")] }),

  trial({ id: "arched", name: "ARCHED", nct: "NCT05820841", phase: "3", status: "active",
    setting: "Older adults with untreated diffuse large B-cell lymphoma: R-miniCHOP with or without acalabrutinib",
    sponsor: "Universität des Saarlandes", started: "2023-06-07", startedType: "actual", enrolled: 330,
    aka: ["ARCHED trial", "Acalabrutinib with R-miniCHOP"],
    tldr: "A German trial adding a targeted tablet to the reduced-dose chemotherapy used for older people with aggressive lymphoma, to see whether it delays relapse.",
    summary: "Bruton tyrosine kinase inhibitors have a clear rationale in the activated B-cell genetic subtypes of diffuse large B-cell lymphoma, which depend on chronic active B-cell receptor signalling, and a mixed record in practice: the PHOENIX trial of ibrutinib with R-CHOP improved outcomes in patients under 60 and harmed those over 60, because of toxicity rather than biology. Acalabrutinib is more selective and better tolerated.\n\nARCHED randomises older adults with untreated diffuse large B-cell lymphoma between R-miniCHOP alone and R-miniCHOP with acalabrutinib. The primary endpoint is investigator-assessed progression-free survival, with primary completion estimated for February 2029, and the trial is running at German sites.\n\nIt is the direct test of whether the age signal in PHOENIX was a property of ibrutinib or of the class, in the population where the answer matters most.",
    cancers: [CX.dlbcl, CX.nhl], drugs: ["acalabrutinib", "rituximab", "cyclophosphamide", "doxorubicin", "vincristine", "prednisone"],
    targets: ["btk", "cd20"], pathways: ["bcr-signalling"], terms: ["r-chop", "cell-of-origin"],
    sections: ["targeted-therapy", "chemotherapy"], bottlenecks: ["b-aging-comorbidity", "b-toxicity-qol"],
    trials: ["polar-bear"], links: [ct("NCT05820841")] }),

  trial({ id: "prima-cns", name: "PRIMA-CNS", nct: "NCT06830421", phase: "3", status: "active",
    setting: "Elderly patients with newly diagnosed primary central nervous system lymphoma: rituximab with high-dose methotrexate and procarbazine followed by procarbazine maintenance, against a short rituximab, methotrexate and cytarabine induction followed by age-adjusted high-dose chemotherapy with autologous stem-cell transplantation",
    sponsor: "University Hospital Freiburg", started: "2023-08-09", startedType: "actual", enrolled: 340,
    aka: ["PRIMA-CNS trial", "R-MP versus MARTA with transplant in elderly primary CNS lymphoma"],
    tldr: "The first randomised trial asking whether older people with lymphoma of the brain do better with a short intensive course and a stem cell transplant than with the gentler long regimen that is standard in Germany.",
    summary: "Most people diagnosed with primary central nervous system lymphoma are 60 or older, and the two strategies used for them have never been compared head to head. The conventional approach, R-MP, gives rituximab with high-dose methotrexate and procarbazine, followed by procarbazine maintenance. The alternative, MARTA, gives a shorter induction of rituximab, high-dose methotrexate and cytarabine, followed by age-adjusted high-dose chemotherapy and autologous stem-cell transplantation; single-arm work has shown it feasible in selected elderly patients.\n\nPRIMA-CNS randomises 340 patients between them at German sites, with progression-free survival as the primary endpoint and primary completion estimated for 31 August 2029. The IELSG32 and MATRix/IELSG43 trials answered the consolidation question in younger patients; this is the same question for the age group that makes up most of the disease.\n\nThe trial's secondary endpoints matter more than usual here, because the treatments differ in neurotoxicity as well as in intensity, and cognitive outcome is the thing survivors of this disease live with.",
    cancers: [CX.pcnsl, CX.nhl], drugs: ["rituximab", "methotrexate", "procarbazine", "cytarabine"],
    targets: ["cd20"], terms: ["autologous-transplant", "lymphoma-tx-transplant-role"],
    technologies: ["cytotoxic-chemotherapy"], sections: ["chemotherapy", "cell-therapy"],
    bottlenecks: ["b-brain-delivery", "b-aging-comorbidity", "b-rare-cancers"],
    trials: ["ielsg32", "ielsg43"], companies: ["ielsg"], links: [ct("NCT06830421")] }),

  trial({ id: "fortplus", name: "FORTplus", nct: "NCT05045664", phase: "3", status: "active",
    setting: "Early-stage follicular lymphoma: low-dose radiotherapy of 4 Gy with an anti-CD20 antibody against standard-dose radiotherapy with rituximab, and obinutuzumab against rituximab",
    sponsor: "Heidelberg University", started: "2022-07-06", startedType: "actual", enrolled: 100,
    aka: ["FORTplus trial", "Early Stage Follicular Lymphoma and Radiotherapy plus Anti-CD20 Antibody"],
    tldr: "A trial testing whether a radiotherapy dose one sixth of the standard works as well for early follicular lymphoma when an antibody is given alongside it.",
    summary: "Two pieces of evidence pull in opposite directions here. The FoRT trial found 4 Gy of radiotherapy inferior to 24 Gy for indolent lymphoma on response and progression-free survival. The MIR study and TROG 99.03 found that adding an anti-CD20 antibody to localised radiotherapy improves outcomes, and the GAZAI study reported a high complete response rate with 2 by 2 Gy combined with obinutuzumab.\n\nFORTplus tests whether the antibody makes the low dose safe. Its first question is the non-inferiority of 4 Gy given with an anti-CD20 antibody; if that holds, its second is whether obinutuzumab with low-dose radiotherapy is superior to rituximab with the standard dose, tested on the same set. The primary endpoint is morphological complete response, with primary completion estimated for 30 September 2027 at German sites.\n\nThe prize the trial is playing for is explicit in its protocol: a radiation dose reduced to 16 per cent of the standard, which would change how early follicular lymphoma is treated everywhere, including in settings where radiotherapy capacity is the binding constraint.",
    cancers: [CX.fl, CX.nhl], drugs: ["rituximab", "obinutuzumab"], targets: ["cd20"],
    technologies: ["radiotherapy", "monoclonal-antibody"], terms: ["complete-response", "non-inferiority"],
    sections: ["radiation", "immunotherapy"], bottlenecks: ["b-surgery-radiation-innovation", "b-global-access", "b-toxicity-qol"],
    trials: ["trog-99-03"], keyPapers: ["paper-fort-4gy-vs-24gy-indolent-lymphoma-hoskin-lancet-oncol-2014", "paper-fort-long-term-follow-up-hoskin-lancet-oncol-2021"],
    links: [ct("NCT05045664"), link("FoRT long-term follow-up, Lancet Oncology 2021", "https://doi.org/10.1016/S1470-2045(20)30686-0")] }),
];

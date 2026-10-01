/**
 * Combination proposals: cells of the modular-drug permutation space where both components are validated
 * but no corpus drug combines them, ranked and searched for public evidence. Hypotheses for research, not
 * medical advice. Generated on 2026-09-23 by the method in docs/OPEN-PIPELINE.md; edit by pull request, keeping
 * every evidence quote verbatim from a source fetched with status 200.
 *
 * Score = burden (0-40, from GLOBOCAN 2022 world deaths over the listed cancers) + validation of each
 * component (approved 15, phase-3 10, phase-2 7, phase-1/2 5) + plausibility (0-30, hand-assigned, reason in
 * plausibilityNote). The top 60 of 65 scored candidates ship; those cut: adc-cd30-top1 (58), deg-androgen-receptor-vhl (58), deg-brd4-cereblon (57), deg-btk-vhl (57), rl-sstr2-yttrium-90 (46).
 */
import type { CombinationIdeaInput } from "@/lib/schema";

export const combinationIdeas: CombinationIdeaInput[] = [
  {
    id: "deg-kras-cereblon",
    format: "degrader",
    name: "KRAS degrader recruiting cereblon",
    components: { target: "kras", e3Ligase: "cereblon" },
    targets: ["kras", "cereblon"],
    cancers: ["pancreatic", "colorectal", "kras-g12c-nsclc", "kras-g12c-pdac"],
    rationale: "KRAS is validated by two approved G12C inhibitors (sotorasib, adagrasib) and cereblon is the E3 ligase of every approved degrader in the corpus (lenalidomide, vepdegestrant). No corpus degrader targets KRAS, and the search found that the KRAS G12D degrader now in phase 3 recruits VHL rather than cereblon, so the KRAS x cereblon cell is open while the target itself is clinically validated for degradation.",
    plausibilityNote: "KRAS inhibitors are limited to one mutant (G12C) and to the inactive state, while a degrader removes the protein whatever nucleotide it holds; degradation of KRAS G12D is now proven in patients with a VHL-recruiting molecule, so the open question is whether cereblon gives better exposure or a different resistance profile.",
    validation: {
      a: { level: "approved", via: ["sotorasib", "adagrasib"] },
      b: { level: "approved", via: ["lenalidomide", "vepdegestrant"] }
    },
    score: {
      total: 85,
      burden: 35,
      worldDeaths: 3188897,
      validationA: 15,
      validationB: 15,
      plausibility: 20
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1016/j.ejps.2026.107633",
        url: "https://doi.org/10.1016/j.ejps.2026.107633",
        date: "2026-08-15",
        quote: "Discovery of a Potent and Selective KRAS G12D Degrader based on PROTAC Degradation.",
        sponsor: "Jiang L et al., European journal of pharmaceutical sciences : official journal of the European Federation for Pharmaceutical Sciences",
        note: "Preclinical: a KRAS G12D PROTAC degrader, 2026; the paper does not state a cereblon ligand in its title."
      },
      {
        kind: "paper",
        source: "doi:10.1021/acs.jmedchem.6c01832",
        url: "https://doi.org/10.1021/acs.jmedchem.6c01832",
        date: "2026-08-01",
        quote: "Discovery and Characterization of RP04340: A Highly Potent and Orally Active Pan-KRAS PROTAC Degrader.",
        sponsor: "Ji X et al., Journal of medicinal chemistry",
        note: "Preclinical: an orally active pan-KRAS PROTAC degrader, Journal of Medicinal Chemistry 2026."
      },
      {
        kind: "trial",
        source: "NCT07566052",
        url: "https://clinicaltrials.gov/study/NCT07566052",
        date: "2026-05-04",
        quote: "A Study to Compare Setidegrasib (ASP3082) With Docetaxel, in People With Non-small Cell Lung Cancer With a KRAS G12D Mutation",
        sponsor: "Astellas Pharma Global Development, Inc.",
        note: "Adjacent cell: Astellas' phase 3 KRAS G12D degrader setidegrasib (ASP3082) recruits VHL, not cereblon, so the target is clinically validated for degradation on the other ligase axis.",
        adjacent: true
      },
      {
        kind: "paper",
        source: "doi:10.1038/s42004-025-01662-4",
        url: "https://doi.org/10.1038/s42004-025-01662-4",
        date: "2025-08-23",
        quote: "Herein, we report the discovery and characterization of ASP3082, a KRAS(G12D)-selective degrader, and the crystal structure of the drug-induced ternary complex of KRAS(G12D)/ASP3082/VHL (von Hippel-Lindau).",
        sponsor: "Yoshinari T et al., Communications chemistry",
        note: "Adjacent cell: the discovery paper reports the ternary complex of KRAS G12D with ASP3082 and VHL, which is how the ligase was identified.",
        adjacent: true
      }
    ],
    status: "preclinical evidence",
    caveat: "A degrader still needs a mutant-selective binder, which for G12D exists only in a few chemotypes; and a cereblon-recruiting version would have to justify itself against a VHL-recruiting molecule already in phase 3.",
    decomposerMissed: [],
    refs: ["adagrasib", "lenalidomide", "sotorasib", "vepdegestrant"],
    searched: {
      on: "2026-09-23",
      ctgov: ["KRAS AND (degrader OR PROTAC OR ASP3082)"],
      europepmc: ["TITLE:\"KRAS\" AND (TITLE:\"degrader\" OR TITLE:\"PROTAC\") AND (ABSTRACT:\"cereblon\" OR ABSTRACT:\"G12D\")"],
      patents: ["KRAS G12D degrader cereblon PROTAC"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-nectin4-top1",
    format: "adc",
    name: "Nectin-4 ADC with a topoisomerase-I payload",
    components: { target: "nectin4", payloadClass: "topoisomerase-i-payloads" },
    targets: ["nectin4"],
    cancers: ["urothelial", "tnbc", "nsclc", "breast-hr-positive"],
    rationale: "Nectin-4 is validated with a tubulin payload (enfortumab-vedotin) and the topoisomerase-I class is the best-validated ADC payload in the corpus (trastuzumab-deruxtecan, sacituzumab-govitecan, datopotamab-deruxtecan). The corpus holds a Nectin-4 x TROP2 bispecific ADC with a topoisomerase payload (ak146d1) and a Nectin-4 ADC in phase 3 whose payload the record does not state (shr-a2102), so the mono-specific Nectin-4 x topoisomerase-I cell reads as untried when the search shows it is occupied.",
    plausibilityNote: "Nectin-4 internalises (enfortumab-vedotin relies on it) and is expressed in breast, lung and pancreatic cancers beyond bladder; a topoisomerase-I payload would swap the neuropathy and skin toxicity of MMAE for the neutropenia and ILD class effects of camptothecins.",
    validation: {
      a: { level: "approved", via: ["enfortumab-vedotin"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan", "sacituzumab-govitecan"] }
    },
    score: {
      total: 84,
      burden: 34,
      worldDeaths: 2704168,
      validationA: 15,
      validationB: 15,
      plausibility: 20
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1016/s1470-2045(26)00238-x",
        url: "https://doi.org/10.1016/s1470-2045(26)00238-x",
        date: "2026-09-01",
        quote: "<h4>Background</h4>SHR-A2102 is a new antibody-drug conjugate consisting of a fully human nectin-4-directed monoclonal antibody bound to a topoisomerase I inhibitor payload via a cleavable linker.",
        sponsor: "Zhong R et al., The Lancet. Oncology",
        note: "Phase 1 in 39 Chinese hospitals; SHR-A2102 is in the corpus (shr-a2102) without a payload field, which is why the decomposer read this cell as untried."
      },
      {
        kind: "paper",
        source: "doi:10.1158/2767-9764.crc-24-0176",
        url: "https://doi.org/10.1158/2767-9764.crc-24-0176",
        date: "2024-11-01",
        quote: "<h4>Significance</h4>ETx-22, a novel ADC combining a tumor nectin-4-specific antibody and an innovative linker to exatecan, demonstrates significant and durable responses in low-target-expressing tumor models that are resistant to MMAE-based EV and has a better toxicity profile.",
        sponsor: "Lopez M et al., Cancer research communications",
        note: "Preclinical: a second Nectin-4 topoisomerase-I conjugate active in low-Nectin-4 models resistant to enfortumab vedotin."
      }
    ],
    status: "already in development (missed by decomposer)",
    caveat: "The corpus record for SHR-A2102 needs its payload class filled in; the open question is no longer whether the cell is tried but whether a topoisomerase-I Nectin-4 ADC works after enfortumab vedotin progression.",
    decomposerMissed: ["shr-a2102"],
    refs: ["ak146d1", "datopotamab-deruxtecan", "enfortumab-vedotin", "sacituzumab-govitecan", "shr-a2102", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(Nectin-4 OR Nectin4) AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR SN-38 OR TOP1)", "SHR-A2102"],
      europepmc: ["(TITLE:\"Nectin-4\" OR TITLE:\"Nectin4\") AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["Nectin-4 antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-met-top1",
    format: "adc",
    name: "MET ADC with a topoisomerase-I payload",
    components: { target: "met", payloadClass: "topoisomerase-i-payloads" },
    targets: ["met"],
    cancers: ["met-altered-nsclc", "nsclc", "colorectal", "gastric"],
    rationale: "MET is validated by an approved tubulin ADC (telisotuzumab-vedotin) and kinase inhibitors (capmatinib, tepotinib), and topoisomerase-I payloads are approved on five antigens (trastuzumab-deruxtecan). The corpus holds a MET ADC in phase 3 whose payload the record does not state (telisotuzumab-adizutecan), so the MET x topoisomerase-I cell reads as untried when it is probably not.",
    plausibilityNote: "MET internalises and is over-expressed across lung, colorectal and gastric cancers beyond the amplified subset; a bystander-capable topoisomerase-I payload could reach MET-intermediate tumours that telisotuzumab-vedotin does not.",
    validation: {
      a: { level: "approved", via: ["telisotuzumab-vedotin", "capmatinib"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 83,
      burden: 35,
      worldDeaths: 3381663,
      validationA: 15,
      validationB: 15,
      plausibility: 18
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1200/jco-25-01525",
        url: "https://doi.org/10.1200/jco-25-01525",
        date: "2026-05-01",
        quote: "<h4>Purpose</h4>The antibody-drug conjugate Temab-A comprises the c-Met-targeting antibody telisotuzumab conjugated to a novel topoisomerase 1 inhibitor payload, adizutecan.",
        sponsor: "Sharma MR et al., Journal of clinical oncology : official journal of the American Society of Clinical Oncology",
        note: "Phase 1 of telisotuzumab adizutecan (ABBV-400), Journal of Clinical Oncology 2026; the corpus record telisotuzumab-adizutecan lacks a payload field."
      }
    ],
    status: "already in development (missed by decomposer)",
    caveat: "The corpus record for the phase-3 MET ADC needs its payload class filled in; if it is a topoisomerase-I inhibitor this cell is already occupied and the open question is how it sequences with the tubulin ADC.",
    decomposerMissed: ["telisotuzumab-adizutecan"],
    refs: ["capmatinib", "telisotuzumab-adizutecan", "telisotuzumab-vedotin", "tepotinib", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(c-Met OR MET) AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR adizutecan OR ABBV-400)", "ABBV-400 OR telisotuzumab adizutecan"],
      europepmc: ["(TITLE:\"c-Met\" OR TITLE:\"MET\") AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["c-Met antibody drug conjugate topoisomerase camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cldn18-2-top1",
    format: "adc",
    name: "Claudin 18.2 ADC with a topoisomerase-I payload",
    components: { target: "cldn18-2", payloadClass: "topoisomerase-i-payloads" },
    targets: ["cldn18-2"],
    cancers: ["gastric-cldn18-2-positive", "gastric", "pancreatic", "oesophageal-adenocarcinoma"],
    rationale: "Claudin 18.2 is validated by an approved antibody (zolbetuximab) and an approved CAR-T (satricabtagene-autoleucel), and the corpus holds a Claudin 18.2 ADC with a tubulin payload in phase 3 (cmg901). Several corpus Claudin 18.2 ADCs in phase 2 and 3 do not state their payload (ibi343, azd4360, xnw27011), so the Claudin 18.2 x topoisomerase-I cell reads as untried when it is almost certainly occupied.",
    plausibilityNote: "Claudin 18.2 is buried in tight junctions of normal stomach but exposed on cancer cells, giving a tumour-selective epitope; expression is heterogeneous, so a bystander-capable topoisomerase-I payload is the natural class.",
    validation: {
      a: { level: "approved", via: ["zolbetuximab", "satricabtagene-autoleucel"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 82,
      burden: 32,
      worldDeaths: 1572975,
      validationA: 15,
      validationB: 15,
      plausibility: 20
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1038/s41591-025-03781-w",
        url: "https://doi.org/10.1038/s41591-025-03781-w",
        date: "2025-07-16",
        quote: "SHR-A1904 is an antibody-drug conjugate comprising CLDN18.2-targeting monoclonal antibody, a DNA topoisomerase I inhibitor payload and a cleavable peptide-based linker.",
        sponsor: "Ruan DY et al., Nature medicine",
        note: "Phase 1 of SHR-A1904 in 95 patients, Nature Medicine 2025."
      },
      {
        kind: "trial",
        source: "NCT06770439",
        url: "https://clinicaltrials.gov/study/NCT06770439",
        date: "2025-01-13",
        quote: "This study is a phase II study to evaluate the safety, tolerability and efficacy of IBI343 combined with chemotherapy in patients with advanced pancreatic cancer, including Part1 (safe lead-in phase) and Part2 (extension phase).",
        sponsor: "Zhejiang University",
        note: "Phase 2 of IBI343 with chemotherapy in pancreatic cancer; the corpus ibi343 record lacks a payload field."
      }
    ],
    status: "already in development (missed by decomposer)",
    caveat: "This row is a data-quality flag as much as a proposal: the payload fields on the corpus Claudin 18.2 ADC records need filling before the engine can count this cell as in development.",
    decomposerMissed: ["ibi343", "azd4360", "xnw27011", "lm-302"],
    refs: ["azd4360", "cmg901", "ibi343", "satricabtagene-autoleucel", "xnw27011", "zolbetuximab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(Claudin 18.2 OR CLDN18.2) AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR IBI343)"],
      europepmc: ["(TITLE:\"Claudin 18.2\" OR TITLE:\"CLDN18.2\") AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")", "(TITLE:\"IBI343\" OR ABSTRACT:\"IBI343\")"],
      patents: ["Claudin 18.2 antibody drug conjugate exatecan"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-egfr-top1",
    format: "adc",
    name: "EGFR ADC with a topoisomerase-I payload",
    components: { target: "egfr", payloadClass: "topoisomerase-i-payloads" },
    targets: ["egfr"],
    cancers: ["head-and-neck", "nsclc", "colorectal", "egfr-mutant-nsclc", "esophageal"],
    rationale: "EGFR is validated by antibodies (cetuximab, amivantamab) and kinase inhibitors (osimertinib), and the corpus holds an EGFR ADC with a tubulin payload in phase 3 (mrg003) plus two bispecific EGFR ADCs with topoisomerase-I payloads (izalontamab-brengitecan, tilatamig-samrotecan). There is no mono-specific EGFR topoisomerase-I ADC in the corpus, the simplest construct in the family.",
    plausibilityNote: "EGFR internalises on antibody binding and is over-expressed in squamous cancers, but its expression on skin and gut means an EGFR ADC inherits cetuximab's rash plus payload toxicity; the corpus bispecific EGFR ADCs (izalontamab-brengitecan) use a second arm partly to bias delivery towards tumour.",
    validation: {
      a: { level: "approved", via: ["cetuximab", "osimertinib", "amivantamab"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 82,
      burden: 36,
      worldDeaths: 3649307,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [],
    status: "no public evidence",
    caveat: "The bispecific EGFR ADCs exist partly because a mono-specific EGFR ADC risks skin and gut toxicity at active doses; this proposal asks whether the simpler molecule can find a window, and depatuxizumab-mafodotin's failure in glioblastoma is a warning.",
    decomposerMissed: [],
    refs: ["amivantamab", "cetuximab", "izalontamab-brengitecan", "mrg003", "osimertinib", "tilatamig-samrotecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["EGFR AND \"antibody drug conjugate\" AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan)"],
      europepmc: ["TITLE:\"EGFR\" AND TITLE:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["EGFR antibody drug conjugate exatecan camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-dll3-top1",
    format: "adc",
    name: "DLL3 ADC with a topoisomerase-I payload",
    components: { target: "dll3", payloadClass: "topoisomerase-i-payloads" },
    targets: ["dll3"],
    cancers: ["sclc", "extensive-stage-sclc", "prostate-nepc", "extrapulmonary-nec"],
    rationale: "DLL3 is validated by an approved T-cell engager (tarlatamab) and a PBD ADC that reached phase 3 and was withdrawn for toxicity (rovalpituzumab-tesirine), while topoisomerase-I payloads are approved on five antigens (trastuzumab-deruxtecan, sacituzumab-govitecan). The corpus has a DLL3 ADC in phase 3 whose payload the record does not state (zl-1310), so the decomposer classes the DLL3 x topoisomerase-I cell as untried.",
    plausibilityNote: "DLL3 is tumour-restricted (no normal-tissue surface expression) and internalises, but at low density; a bystander-capable topoisomerase-I payload at DAR 8 fits low-density antigens far better than the DAR-2 PBD that failed with rovalpituzumab-tesirine.",
    validation: {
      a: { level: "approved", via: ["tarlatamab"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 81,
      burden: 33,
      worldDeaths: 2214899,
      validationA: 15,
      validationB: 15,
      plausibility: 18
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT07218146",
        url: "https://clinicaltrials.gov/study/NCT07218146",
        date: "2025-10-20",
        quote: "The purpose of this study is to evaluate the efficacy and safety of ZL-1310 compared to Investigator's Choice Therapy in participants with relapsed Small Cell Lung Cancer.",
        sponsor: "Zai Lab (Shanghai) Co., Ltd.",
        note: "Phase 3 versus investigator's choice in relapsed small-cell lung cancer; the corpus record zl-1310 lacks a payload field."
      }
    ],
    status: "already in development (missed by decomposer)",
    caveat: "The corpus DLL3 ADC record needs its payload filled in before this cell can be marked as in development; if the payload is a camptothecin, this proposal is already being tested rather than open.",
    decomposerMissed: ["zl-1310"],
    refs: ["rovalpituzumab-tesirine", "sacituzumab-govitecan", "tarlatamab", "trastuzumab-deruxtecan", "zl-1310"],
    searched: {
      on: "2026-09-23",
      ctgov: ["DLL3 AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR ZL-1310)"],
      europepmc: ["TITLE:\"DLL3\" AND (ABSTRACT:\"antibody-drug conjugate\") AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")", "(TITLE:\"ZL-1310\" OR ABSTRACT:\"ZL-1310\")"],
      patents: ["DLL3 antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-pdl1-ctla4",
    format: "bispecific",
    name: "PD-L1 x CTLA-4 bispecific",
    components: { targetA: "pdl1", targetB: "ctla4" },
    targets: ["pdl1", "ctla4"],
    cancers: ["nsclc", "pancreatic", "hcc", "esophageal"],
    rationale: "PD-L1 blockade is approved across many cancers (atezolizumab, durvalumab) and CTLA-4 blockade both alone (ipilimumab, tremelimumab) and inside a PD-1 x CTLA-4 bispecific (cadonilimab). The corpus has PD-1 x CTLA-4, PD-1 x VEGF and PD-L1 x VEGF bispecifics (cadonilimab, ivonescimab, pm8002) but no PD-L1 x CTLA-4.",
    plausibilityNote: "The PD-1 x CTLA-4 bispecific (cadonilimab) is approved and shows the format can deliver dual checkpoint blockade with less colitis than the two antibodies; PD-L1 x CTLA-4 would concentrate CTLA-4 blockade in PD-L1-rich tumour tissue rather than lymph nodes, the same avidity logic applied to the ligand side.",
    validation: {
      a: { level: "approved", via: ["atezolizumab", "pembrolizumab"] },
      b: { level: "approved", via: ["ipilimumab", "tremelimumab", "cadonilimab"] }
    },
    score: {
      total: 81,
      burden: 35,
      worldDeaths: 3488994,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05420220",
        url: "https://clinicaltrials.gov/study/NCT05420220",
        date: "2022-06-15",
        quote: "KN046 (Recombinant Humanized PD-L1/CTLA-4 Bispecific Single Domain Antibody Fc Fusion Protein Injection).",
        sponsor: "Jiangsu Alphamab Biopharmaceuticals Co., Ltd",
        note: "Jiangsu Alphamab phase 2 of KN046 in non-small cell lung cancer, completed."
      },
      {
        kind: "trial",
        source: "NCT04469725",
        url: "https://clinicaltrials.gov/study/NCT04469725",
        date: "2020-07-14",
        quote: "Subjects will be treated with KN046 5 milligram per kilogram every 2 weeks.",
        sponsor: "Jiangsu Alphamab Biopharmaceuticals Co., Ltd",
        note: "Alphamab phase 2 in thymic carcinoma, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41467-025-56537-y",
        url: "https://doi.org/10.1038/s41467-025-56537-y",
        date: "2025-02-07",
        quote: "The anti-PD-L1/CTLA-4 bispecific antibody KN046 plus lenvatinib in advanced unresectable or metastatic hepatocellular carcinoma: a phase II trial.",
        sponsor: "Xu D et al., Nature communications",
        note: "Phase 2 of KN046 plus lenvatinib in hepatocellular carcinoma, Nature Communications 2025."
      }
    ],
    status: "clinical evidence",
    caveat: "It needs to show that tumour-localised CTLA-4 blockade beats the approved PD-1 x CTLA-4 bispecific or the durvalumab plus tremelimumab pair on toxicity or response, a high bar in cancers where those already work.",
    decomposerMissed: [],
    refs: ["atezolizumab", "cadonilimab", "durvalumab", "ipilimumab", "ivonescimab", "pm8002", "tremelimumab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["PD-L1 AND CTLA-4 AND bispecific"],
      europepmc: ["TITLE:\"PD-L1\" AND TITLE:\"CTLA-4\" AND TITLE:\"bispecific\""],
      patents: ["PD-L1 CTLA-4 bispecific antibody"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "deg-egfr-cereblon",
    format: "degrader",
    name: "EGFR degrader recruiting cereblon",
    components: { target: "egfr", e3Ligase: "cereblon" },
    targets: ["egfr", "cereblon"],
    cancers: ["egfr-mutant-nsclc", "nsclc"],
    rationale: "EGFR is validated by kinase inhibitors and antibodies (osimertinib, amivantamab, cetuximab) and cereblon is the E3 ligase of every approved degrader in the corpus (lenalidomide, pomalidomide, vepdegestrant). No corpus degrader targets EGFR, although the corpus records the C797S resistance problem that inhibitors cannot solve and degraders can.",
    plausibilityNote: "Osimertinib resistance often runs through C797S and kinase-independent scaffolding functions of EGFR, which inhibitors cannot touch but a degrader removes; wild-type EGFR degradation in skin and gut is the selectivity problem, so mutant-selective degraders are the design in play.",
    validation: {
      a: { level: "approved", via: ["osimertinib", "amivantamab"] },
      b: { level: "approved", via: ["lenalidomide", "vepdegestrant"] }
    },
    score: {
      total: 81,
      burden: 33,
      worldDeaths: 1817469,
      validationA: 15,
      validationB: 15,
      plausibility: 18
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT06050980",
        url: "https://clinicaltrials.gov/study/NCT06050980",
        date: "2023-09-22",
        quote: "This is a phase I, open-label, dose-escalation and expansion study to evaluate the safety, tolerability, PK and PD of HSK40118 when given orally in patients with active EGFR mutation locally advanced or metastatic non-small cell lung cancer (NSCLC).",
        sponsor: "Haisco Pharmaceutical Group Co., Ltd.",
        note: "Haisco phase 1 of HSK40118, an oral agent in EGFR-mutant lung cancer described by the sponsor as an EGFR degrader; the registry record does not name the E3 ligase."
      }
    ],
    status: "clinical evidence",
    caveat: "A degrader that removes wild-type EGFR would reproduce cetuximab's skin and gut toxicity with no off switch; mutant selectivity is a requirement, not a nicety.",
    decomposerMissed: [],
    refs: ["amivantamab", "cetuximab", "lenalidomide", "osimertinib", "pomalidomide", "vepdegestrant"],
    searched: {
      on: "2026-09-23",
      ctgov: ["EGFR AND (degrader OR PROTAC) AND lung", "CFT8919 OR HSK40118 OR EGFR degrader"],
      europepmc: ["TITLE:\"EGFR\" AND (TITLE:\"degrader\" OR TITLE:\"PROTAC\") AND ABSTRACT:\"cereblon\"", "(TITLE:\"CFT8919\" OR ABSTRACT:\"CFT8919\" OR ABSTRACT:\"HSK40118\") OR (TITLE:\"EGFR\" AND TITLE:\"degrader\" AND ABSTRACT:\"L858R\" AND ABSTRACT:\"cereblon\")"],
      patents: ["EGFR degrader cereblon PROTAC lung cancer"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-trop2-tubulin",
    format: "adc",
    name: "TROP2 ADC with a tubulin-inhibitor payload",
    components: { target: "trop2", payloadClass: "tubulin-inhibitor-payloads" },
    targets: ["trop2"],
    cancers: ["tnbc", "nsclc", "urothelial", "breast-hr-positive"],
    rationale: "TROP2 carries three approved topoisomerase-I ADCs (sacituzumab-govitecan, datopotamab-deruxtecan, sacituzumab-tirumotecan) and no tubulin-payload ADC in the corpus, while tubulin payloads are approved on Nectin-4 (enfortumab-vedotin) and HER2 (trastuzumab-emtansine). A tubulin-payload TROP2 ADC would give a second mechanism for the same antigen after topoisomerase-I failure, the sequencing already used across HER2 ADCs.",
    plausibilityNote: "TROP2 internalises and recycles quickly, which suits a permeable auristatin with bystander killing (bystander-effect); TROP2 on skin and mucosa predicts the rash and stomatitis already seen with the topoisomerase ADCs.",
    validation: {
      a: { level: "approved", via: ["sacituzumab-govitecan", "datopotamab-deruxtecan"] },
      b: { level: "approved", via: ["enfortumab-vedotin", "trastuzumab-emtansine"] }
    },
    score: {
      total: 80,
      burden: 34,
      worldDeaths: 2704168,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02122146",
        url: "https://clinicaltrials.gov/study/NCT02122146",
        date: "2014-04-24",
        quote: "To assess the safety and tolerability at increasing dose levels of PF-06664178 in patients with advanced solid tumors in order to determine the maximum tolerated dose and select the recommended Phase 2 dose.",
        sponsor: "Pfizer",
        note: "Pfizer phase 1 of PF-06664178, a TROP2 antibody carrying the auristatin Aur0101, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1007/s10637-018-0560-6",
        url: "https://doi.org/10.1007/s10637-018-0560-6",
        date: "2018-01-15",
        quote: "A phase 1, dose-escalation study of PF-06664178, an anti-Trop-2/Aur0101 antibody-drug conjugate in patients with advanced or metastatic solid tumors.",
        sponsor: "King GT et al., Investigational new drugs",
        note: "Phase 1 results for PF-06664178, Investigational New Drugs 2018: the cell was tried and stopped."
      },
      {
        kind: "paper",
        source: "doi:10.1021/acs.jmedchem.3c01210",
        url: "https://doi.org/10.1021/acs.jmedchem.3c01210",
        date: "2023-10-26",
        quote: "Herein, we first prepared a novel anti-TROP2 antibody-drug conjugate (ADC) hIMB1636-MMAE using hIMB1636 antibody chemically coupled to monomethyl auristatin E (MMAE) via a Valine-Citrulline linker and then reported its characteristics and antitumor activity.",
        sponsor: "Sun LP et al., Journal of medicinal chemistry",
        note: "Preclinical: a second TROP2 antibody conjugated to MMAE, tested in pancreatic cancer models."
      }
    ],
    status: "clinical evidence",
    caveat: "Earlier TROP2 auristatin conjugates were stopped in phase 1; the class may need a lower DAR or site-specific conjugation to be tolerable, and that history is the first thing to read.",
    decomposerMissed: [],
    refs: ["bystander-effect", "datopotamab-deruxtecan", "enfortumab-vedotin", "sacituzumab-govitecan", "sacituzumab-tirumotecan", "trastuzumab-emtansine"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(TROP2 OR TROP-2 OR trophoblast) AND (auristatin OR MMAE OR vedotin OR PF-06664178 OR maytansinoid)", "PF-06664178 OR RN927C"],
      europepmc: ["(TITLE:\"TROP2\" OR TITLE:\"Trop-2\" OR TITLE:\"TROP-2\") AND (ABSTRACT:\"auristatin\" OR ABSTRACT:\"MMAE\" OR ABSTRACT:\"maytansinoid\" OR ABSTRACT:\"tubulin\")", "(TITLE:\"LCB84\" OR ABSTRACT:\"LCB84\") OR (TITLE:\"PF-06664178\" OR ABSTRACT:\"PF-06664178\")"],
      patents: ["TROP2 antibody drug conjugate auristatin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "deg-braf-cereblon",
    format: "degrader",
    name: "BRAF degrader recruiting cereblon",
    components: { target: "braf", e3Ligase: "cereblon" },
    targets: ["braf", "cereblon"],
    cancers: ["braf-v600-melanoma", "braf-v600e-colorectal", "braf-v600e-nsclc"],
    rationale: "BRAF is validated by three approved inhibitors (dabrafenib, encorafenib, vemurafenib) and cereblon by every approved degrader in the corpus (lenalidomide, vepdegestrant). No corpus degrader targets BRAF, although the dimer-mediated resistance the corpus records for BRAF inhibitors is exactly what removal of the protein addresses.",
    plausibilityNote: "BRAF inhibitors fail through dimer-dependent reactivation, which a degrader avoids by removing the protein; class I mutant selectivity over wild-type BRAF and CRAF is needed to avoid the paradoxical activation and skin toxicity of first-generation inhibitors.",
    validation: {
      a: { level: "approved", via: ["dabrafenib", "encorafenib", "vemurafenib"] },
      b: { level: "approved", via: ["lenalidomide", "vepdegestrant"] }
    },
    score: {
      total: 80,
      burden: 34,
      worldDeaths: 2780155,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05668585",
        url: "https://clinicaltrials.gov/study/NCT05668585",
        date: "2022-12-30",
        quote: "The purpose of this study is to evaluate the safety and tolerability of CFT1946 as well as to determine the maximum tolerated dose (MTD) and/or the recommended Phase 2 dose (RP2D) of CFT1946 as monotherapy (Arm A) and in combination with trametinib (CFT1946 + trametinib; Arm B) or Cetuximab (CFT1946 + cetuximab; Arm C).",
        sponsor: "C4 Therapeutics, Inc.",
        note: "C4 Therapeutics phase 1 of the BRAF V600E degrader CFT1946 alone and with trametinib or cetuximab, completed."
      },
      {
        kind: "paper",
        source: "doi:10.1111/cas.15401",
        url: "https://doi.org/10.1111/cas.15401",
        date: "2022-06-05",
        quote: "Development of a potent small-molecule degrader against oncogenic BRAF&lt;sup&gt;V600E&lt;/sup&gt; protein that evades paradoxical MAPK activation.",
        sponsor: "Ohoka N et al., Cancer science",
        note: "Preclinical: a BRAF V600E degrader that evades paradoxical activation, Cancer Science 2022."
      }
    ],
    status: "clinical evidence",
    caveat: "Colorectal BRAF V600E disease resists BRAF blockade through EGFR feedback, which a degrader does not remove; the degrader would still need an EGFR antibody partner there.",
    decomposerMissed: [],
    refs: ["dabrafenib", "encorafenib", "lenalidomide", "vemurafenib", "vepdegestrant"],
    searched: {
      on: "2026-09-23",
      ctgov: ["BRAF AND (degrader OR PROTAC OR CFT1946)"],
      europepmc: ["TITLE:\"BRAF\" AND (TITLE:\"degrader\" OR TITLE:\"PROTAC\") AND ABSTRACT:\"V600E\""],
      patents: ["BRAF V600E degrader cereblon"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-dll3-lutetium-177",
    format: "radioligand",
    name: "DLL3 radioligand labelled with lutetium-177",
    components: { target: "dll3", isotope: "lutetium-177" },
    targets: ["dll3"],
    cancers: ["sclc", "extensive-stage-sclc", "prostate-nepc"],
    rationale: "DLL3 is validated by an approved T-cell engager (tarlatamab) and lutetium-177 by two approved radioligands (pluvicto, lutathera). No corpus product pairs DLL3 with a radionuclide, despite small-cell lung cancer's radiosensitivity and the tumour-restricted antigen.",
    plausibilityNote: "Small-cell lung cancer is the most radiosensitive common solid tumour and DLL3 has no normal-tissue surface expression, so the target-to-background is favourable; low antigen density is the objection, which the crossfire of a beta emitter partly answers.",
    validation: {
      a: { level: "approved", via: ["tarlatamab"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 79,
      burden: 33,
      worldDeaths: 2214899,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT06941480",
        url: "https://clinicaltrials.gov/study/NCT06941480",
        date: "2025-04-23",
        quote: "The purpose of this study is to find out whether 177Lu-DTPA-SC16.56 is a safe treatment for people with small-cell lung cancer or neuroendocrine prostate cancer",
        sponsor: "Memorial Sloan Kettering Cancer Center",
        note: "Memorial Sloan Kettering phase 1 of a lutetium-177 DLL3 antibody, not yet recruiting at the time of the search."
      },
      {
        kind: "trial",
        source: "NCT07006727",
        url: "https://clinicaltrials.gov/study/NCT07006727",
        date: "2025-06-05",
        quote: "The purpose of this study is to evaluate the safety, tolerability, dosimetry and preliminary efficacy of \\[225Ac\\]Ac-ETN029 and the safety and imaging properties of \\[111In\\]In-ETN029 in patients aged ≥ 18 years with locally advanced or metastatic DLL3 positive cancers.",
        sponsor: "Novartis Pharmaceuticals",
        note: "Adjacent cell: Novartis phase 1 of an actinium-225 DLL3 agent.",
        adjacent: true
      },
      {
        kind: "trial",
        source: "NCT07278479",
        url: "https://clinicaltrials.gov/study/NCT07278479",
        date: "2025-12-12",
        quote: "The purpose of this study is to evaluate the safety, tolerability, dosimetry and preliminary efficacy of \\[212Pb\\]Pb-MP0712, in patients aged ≥18 years with Small Cell Lung Cancer and other locally advanced or metastatic DLL3 positive tumors.",
        sponsor: "Molecular Partners AG",
        note: "Adjacent cell: Molecular Partners phase 1/2 of a lead-212 DLL3 DARPin.",
        adjacent: true
      },
      {
        kind: "trial",
        source: "NCT06736418",
        url: "https://clinicaltrials.gov/study/NCT06736418",
        date: "2024-12-16",
        quote: "The goal of Phase 1a is to gather safety, PK and initial efficacy data for 225Ac-ABD147 to better understand best doses for patients with small cell lung cancer (SCLC) and large cell neuroendocrine carcinoma (LCNEC) of the lung following platinum-based chemotherapy.",
        sponsor: "Abdera Therapeutics Inc.",
        note: "Adjacent cell: Abdera phase 1 of an actinium-225 DLL3 agent.",
        adjacent: true
      }
    ],
    status: "clinical evidence",
    caveat: "Low DLL3 density and the rapid kinetics of small-cell disease mean an antibody carrier may deliver too little dose too slowly; a fast-clearing fragment or a pre-targeting approach may be required.",
    decomposerMissed: [],
    refs: ["lutathera", "pluvicto", "tarlatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["DLL3 AND (177Lu OR lutetium OR radioligand OR radiopharmaceutical OR 225Ac OR radioimmunotherapy)"],
      europepmc: ["TITLE:\"DLL3\" AND (ABSTRACT:\"177Lu\" OR ABSTRACT:\"radioligand\" OR ABSTRACT:\"radioimmunotherapy\" OR ABSTRACT:\"radionuclide\" OR ABSTRACT:\"actinium\")"],
      patents: ["DLL3 radioimmunotherapy lutetium-177"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-pd1-lag3",
    format: "bispecific",
    name: "PD-1 x LAG-3 bispecific",
    components: { targetA: "pd1", targetB: "lag3" },
    targets: ["pd1", "lag3"],
    cancers: ["melanoma", "advanced-melanoma", "nsclc", "gastric"],
    rationale: "PD-1 blockade is approved across cancers (pembrolizumab, nivolumab) and LAG-3 blockade is approved in a fixed-dose combination with PD-1 blockade (relatlimab-nivolumab). The corpus has PD-1 x CTLA-4, PD-1 x TIM-3 and PD-1 x TIGIT bispecifics (cadonilimab, azd7789, rilvegostomig) but no PD-1 x LAG-3 bispecific, the pair with the strongest clinical validation.",
    plausibilityNote: "The fixed-dose relatlimab plus nivolumab combination is approved (relatlimab-nivolumab), so the biology is proven; a single bispecific molecule would bind cells that co-express both receptors, exhausted tumour-infiltrating T cells, with higher avidity than two separate antibodies and could be dosed as one product.",
    validation: {
      a: { level: "approved", via: ["pembrolizumab", "nivolumab"] },
      b: { level: "approved", via: ["relatlimab-nivolumab"] }
    },
    score: {
      total: 78,
      burden: 34,
      worldDeaths: 2536311,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05645276",
        url: "https://clinicaltrials.gov/study/NCT05645276",
        date: "2022-12-09",
        quote: "A Phase Ia/Ib, open label, dose escalation and dose extension trial of Anti-PD-1 and LAG-3 bispecific antibody, AK129, to evaluate the safety, tolerability and antitumor efficacy in patients with advanced malignant tumors",
        sponsor: "Akeso",
        note: "Akeso phase 1a/1b of the PD-1 x LAG-3 bispecific AK129, recruiting."
      },
      {
        kind: "trial",
        source: "NCT04618393",
        url: "https://clinicaltrials.gov/study/NCT04618393",
        date: "2020-11-05",
        quote: "The primary purpose of this study is to identify the recommended Phase 2 dose(s) (RP2Ds) and schedule assessed to be safe for EMB-02 and to characterize the safety and tolerability of EMB-02 at the RP2Ds.",
        sponsor: "Shanghai EpimAb Biotherapeutics Co., Ltd.",
        note: "EpimAb phase 1/2 of EMB-02, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1078-0432.ccr-25-4478",
        url: "https://doi.org/10.1158/1078-0432.ccr-25-4478",
        date: "2026-07-01",
        quote: "A First-in-Human Phase I Clinical Trial Evaluating Clinical Activity and Proof of Mechanism of Tobemstomig, a PD-1-LAG-3 Bispecific Antibody, in Patients with CPI-Experienced Melanoma.",
        sponsor: "Garralda E et al., Clinical cancer research : an official journal of the American Association for Cancer Research",
        note: "First-in-human phase 1 of Roche's tobemstomig, Clinical Cancer Research 2026."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41591-025-03967-2",
        url: "https://doi.org/10.1038/s41591-025-03967-2",
        date: "2025-09-24",
        quote: "Neoadjuvant PD-1 and LAG-3-targeting bispecific antibody and other immune checkpoint inhibitor combinations in resectable melanoma: the randomized phase 1b/2 Morpheus-Melanoma trial.",
        sponsor: "Long GV et al., Nature medicine",
        note: "Neoadjuvant PD-1 x LAG-3 bispecific in resectable melanoma, Nature Medicine 2025."
      }
    ],
    status: "clinical evidence",
    caveat: "A PD-1 x LAG-3 bispecific reached late-stage trials and was discontinued; the new molecule would need a reason to differ, such as different epitopes, Fc design or a population defined by LAG-3 expression.",
    decomposerMissed: [],
    refs: ["azd7789", "cadonilimab", "nivolumab", "pembrolizumab", "relatlimab-nivolumab", "rilvegostomig"],
    searched: {
      on: "2026-09-23",
      ctgov: ["PD-1 AND LAG-3 AND bispecific"],
      europepmc: ["TITLE:\"PD-1\" AND TITLE:\"LAG-3\" AND TITLE:\"bispecific\""],
      patents: ["PD-1 LAG-3 bispecific antibody"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-sstr2-top1",
    format: "adc",
    name: "Somatostatin receptor 2 ADC with a topoisomerase-I payload",
    components: { target: "sstr2", payloadClass: "topoisomerase-i-payloads" },
    targets: ["sstr2"],
    cancers: ["neuroendocrine", "pancreatic-net", "lung-net", "sclc"],
    rationale: "SSTR2 is validated by an approved radioligand (lutathera) and a phase-3 alpha emitter (ryz101), and topoisomerase-I payloads are the best-validated ADC class (trastuzumab-deruxtecan). No corpus product pairs SSTR2 with a cytotoxic payload, although the corpus already carries a bystander-capable topoisomerase payload family (topoisomerase-i-payloads) suited to heterogeneous receptor expression.",
    plausibilityNote: "SSTR2 is a G-protein-coupled receptor that internalises on agonist binding (the basis of lutathera); antibody-format ADCs against GPCRs are hard, so a peptide-drug conjugate with a camptothecin is the more plausible construct, and neuroendocrine tumours divide slowly.",
    validation: {
      a: { level: "approved", via: ["lutathera"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 77,
      burden: 33,
      worldDeaths: 1817469,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02936323",
        url: "https://clinicaltrials.gov/study/NCT02936323",
        date: "2016-10-18",
        quote: "Protocol PEN-221-001 is an open-label, multicenter Phase 1/2a study evaluating PEN-221 in patients with SSTR2 expressing advanced gastroenteropancreatic (GEP) or lung or thymus or other neuroendocrine tumors or small cell lung cancer or large cell neuroendocrine carcinoma of the lung.",
        sponsor: "Tarveda Therapeutics",
        note: "Tarveda phase 1/2a of PEN-221 in SSTR2-expressing neuroendocrine and small-cell lung cancer, completed."
      },
      {
        kind: "paper",
        source: "doi:10.1021/acs.jmedchem.8b02036",
        url: "https://doi.org/10.1021/acs.jmedchem.8b02036",
        date: "2019-02-28",
        quote: "Discovery of an SSTR2-Targeting Maytansinoid Conjugate (PEN-221) with Potent Activity in Vitro and in Vivo.",
        sponsor: "White BH et al., Journal of medicinal chemistry",
        note: "Discovery of PEN-221: the peptide-drug conjugate route the plausibility note proposes, though its payload is a maytansinoid rather than a camptothecin."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1535-7163.mct-19-0022",
        url: "https://doi.org/10.1158/1535-7163.mct-19-0022",
        date: "2019-11-01",
        quote: "Targeting the Somatostatin Receptor 2 with the Miniaturized Drug Conjugate, PEN-221: A Potent and Novel Therapeutic for the Treatment of Small Cell Lung Cancer.",
        sponsor: "Whalen KA et al., Molecular cancer therapeutics",
        note: "Adjacent: PEN-221 preclinical data in small-cell lung cancer, the fast-dividing indication the caveat points to.",
        adjacent: true
      }
    ],
    status: "clinical evidence",
    caveat: "Well-differentiated neuroendocrine tumours have low proliferation and replication-dependent poisons may add little to radioligand therapy; the better fit may be SSTR2-positive small-cell lung cancer, where cells divide fast.",
    decomposerMissed: [],
    refs: ["lutathera", "ryz101", "topoisomerase-i-payloads", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(somatostatin OR SSTR2) AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR PEN-221 OR maytansinoid)", "PEN-221"],
      europepmc: ["(TITLE:\"SSTR2\" OR TITLE:\"somatostatin receptor\") AND (ABSTRACT:\"drug conjugate\") AND (ABSTRACT:\"camptothecin\" OR ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"exatecan\" OR ABSTRACT:\"maytansinoid\")", "(TITLE:\"PEN-221\" OR ABSTRACT:\"PEN-221\")"],
      patents: ["somatostatin receptor peptide drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-cldn18-2-lutetium-177",
    format: "radioligand",
    name: "Claudin 18.2 radioligand labelled with lutetium-177",
    components: { target: "cldn18-2", isotope: "lutetium-177" },
    targets: ["cldn18-2"],
    cancers: ["gastric-cldn18-2-positive", "gastric", "pancreatic"],
    rationale: "Claudin 18.2 is validated by an approved antibody (zolbetuximab) and an approved CAR-T (satricabtagene-autoleucel), and lutetium-177 by two approved radioligands (pluvicto, lutathera). No corpus product pairs Claudin 18.2 with a radionuclide, though the antigen's tumour-selective exposure is the property radioligand targets need.",
    plausibilityNote: "Claudin 18.2 is exposed on cancer cells but hidden in tight junctions of normal stomach, giving a tumour-selective epitope; gastric and pancreatic cancers are moderately radiosensitive, and a nanobody or peptide carrier would give the fast clearance a radioligand needs.",
    validation: {
      a: { level: "approved", via: ["zolbetuximab", "satricabtagene-autoleucel"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 77,
      burden: 31,
      worldDeaths: 1127584,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1007/s00259-023-06561-1",
        url: "https://doi.org/10.1007/s00259-023-06561-1",
        date: "2023-12-08",
        quote: "[&lt;sup&gt;177&lt;/sup&gt;Lu]Lu-labeled anti-claudin-18.2 antibody demonstrated radioimmunotherapy potential in gastric cancer mouse xenograft models.",
        sponsor: "Zeng Z et al., European journal of nuclear medicine and molecular imaging",
        note: "Preclinical: lutetium-177 anti-claudin-18.2 antibody in gastric cancer models."
      },
      {
        kind: "paper",
        source: "doi:10.1021/acs.molpharmaceut.6c00113",
        url: "https://doi.org/10.1021/acs.molpharmaceut.6c00113",
        date: "2026-08-01",
        quote: "Preclinical Evaluation of 177Lu-Labeled Anti-CLDN18.2 VHH-Fc for Radioimmunotherapy in Gastric Cancer.",
        sponsor: "Wang X et al., Molecular pharmaceutics",
        note: "Preclinical: lutetium-177 anti-CLDN18.2 VHH-Fc."
      }
    ],
    status: "preclinical evidence",
    caveat: "Normal gastric mucosa does express Claudin 18.2 at the tight junction; whether a radioligand's crossfire spares it, as a large antibody does, needs to be shown in dosimetry first.",
    decomposerMissed: [],
    refs: ["lutathera", "pluvicto", "satricabtagene-autoleucel", "zolbetuximab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(Claudin 18.2 OR CLDN18.2) AND (177Lu OR lutetium OR radioligand OR radiopharmaceutical OR radionuclide)"],
      europepmc: ["(TITLE:\"Claudin 18.2\" OR TITLE:\"CLDN18.2\") AND (ABSTRACT:\"177Lu\" OR ABSTRACT:\"radioligand\" OR ABSTRACT:\"radionuclide\" OR ABSTRACT:\"radioimmunotherapy\")"],
      patents: ["Claudin 18.2 radionuclide lutetium-177 therapy"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-her2-pbd-dimer",
    format: "adc",
    name: "HER2 ADC with a PBD dimer payload",
    components: { target: "her2", payloadClass: "pbd-dimer-payloads" },
    targets: ["her2"],
    cancers: ["breast-her2-positive", "gastric-her2-positive", "her2-low-metastatic-breast-cancer"],
    rationale: "HER2 is the most validated ADC target in the corpus, carrying a tubulin payload (trastuzumab-emtansine) and two topoisomerase-I payloads (trastuzumab-deruxtecan, trastuzumab-rezetecan), while the PBD dimer class is validated on CD19 (zynlonta). No corpus ADC combines HER2 with a DNA crosslinker, which would offer a mechanism unaffected by the topoisomerase-I resistance now emerging after deruxtecan exposure.",
    plausibilityNote: "HER2 internalises well (trastuzumab-emtansine, trastuzumab-deruxtecan), and a DAR-2 PBD dimer would not depend on high antigen density; but HER2 is expressed on cardiomyocytes and the gut, and PBD dimers carry fluid-retention and liver toxicity (pbd-dimer-payloads), so the therapeutic window is the open question.",
    validation: {
      a: { level: "approved", via: ["trastuzumab-deruxtecan", "trastuzumab-emtansine"] },
      b: { level: "approved", via: ["zynlonta"] }
    },
    score: {
      total: 75,
      burden: 31,
      worldDeaths: 1326278,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03125200",
        url: "https://clinicaltrials.gov/study/NCT03125200",
        date: "2017-04-24",
        quote: "This study evaluated ADCT-502 in participants with Advanced Solid Tumors with HER2 Expression.",
        sponsor: "ADC Therapeutics S.A.",
        note: "Phase 1 of ADC Therapeutics' HER2-directed PBD conjugate, terminated; the cell was tried and stopped."
      }
    ],
    status: "clinical evidence",
    caveat: "A HER2 PBD ADC would need a therapeutic window that HER2 expression on normal heart and gut tissue may not allow; the tried-and-stopped history of HER2 PBD conjugates must be read before any new attempt.",
    decomposerMissed: [],
    refs: ["pbd-dimer-payloads", "trastuzumab-deruxtecan", "trastuzumab-emtansine", "trastuzumab-rezetecan", "zynlonta"],
    searched: {
      on: "2026-09-23",
      ctgov: ["HER2 AND (pyrrolobenzodiazepine OR tesirine OR ADCT-502)"],
      europepmc: ["(TITLE:\"HER2\" AND (TITLE:\"pyrrolobenzodiazepine\" OR TITLE:\"PBD\" OR ABSTRACT:\"pyrrolobenzodiazepine\")) AND ABSTRACT:\"conjugate\""],
      patents: ["HER2 pyrrolobenzodiazepine antibody drug conjugate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-folr1-cd3",
    format: "bispecific",
    name: "Folate receptor alpha x CD3 bispecific",
    components: { targetA: "folr1", targetB: "cd3" },
    targets: ["folr1", "cd3"],
    cancers: ["ovarian", "platinum-resistant-ovarian-cancer", "endometrial", "nsclc"],
    rationale: "Folate receptor alpha is validated by an approved ADC (mirvetuximab-soravtansine) with two more in phase 3 (rinatabart-sesutecan, luveltamab-tazevibulin), and the CD3 arm by approved solid-tumour engagers (tarlatamab). The corpus holds an ovarian engager against MUC16 (ubamatamab) but none against folate receptor alpha.",
    plausibilityNote: "Folate receptor alpha is dense and homogeneous in high-grade serous ovarian cancer and largely absent from normal tissue except the kidney tubule and choroid plexus; ovarian cancer's ascites is rich in T cells, which an engager could recruit, and the corpus already has an ovarian engager against MUC16 (ubamatamab).",
    validation: {
      a: { level: "approved", via: ["mirvetuximab-soravtansine"] },
      b: { level: "approved", via: ["tarlatamab"] }
    },
    score: {
      total: 75,
      burden: 33,
      worldDeaths: 2122148,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1080/2162402x.2022.2113697",
        url: "https://doi.org/10.1080/2162402x.2022.2113697",
        date: "2022-08-20",
        quote: "A T-cell engaging bispecific antibody with a tumor-selective bivalent folate receptor alpha binding arm for the treatment of ovarian cancer.",
        sponsor: "Avanzino BC et al., Oncoimmunology",
        note: "Preclinical: a T-cell engager with a bivalent, tumour-selective folate receptor alpha arm, Oncoimmunology 2022."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41467-020-16838-w",
        url: "https://doi.org/10.1038/s41467-020-16838-w",
        date: "2020-06-24",
        quote: "Protease-activation using anti-idiotypic masks enables tumor specificity of a folate receptor 1-T cell bispecific antibody.",
        sponsor: "Geiger M et al., Nature communications",
        note: "Preclinical: protease-activated masked FOLR1 T-cell bispecific, Nature Communications 2020."
      },
      {
        kind: "paper",
        source: "doi:10.1016/j.bneo.2026.100232",
        url: "https://doi.org/10.1016/j.bneo.2026.100232",
        date: "2026-04-15",
        quote: "Fully human anti-FOLR1 T-cell engager demonstrates potent activity in CBFA2T3::GLIS2 acute megakaryoblastic leukemia.",
        sponsor: "Morris SM et al., Blood neoplasia",
        note: "Preclinical: FOLR1 T-cell engager in a paediatric leukaemia subtype, 2026."
      }
    ],
    status: "preclinical evidence",
    caveat: "Ovarian cancer's microenvironment is immunosuppressive and checkpoint blockade has failed there; an engager may need a costimulatory partner or intraperitoneal delivery to work.",
    decomposerMissed: [],
    refs: ["luveltamab-tazevibulin", "mirvetuximab-soravtansine", "rinatabart-sesutecan", "tarlatamab", "ubamatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(folate receptor OR FOLR1 OR FRalpha) AND CD3 AND (bispecific OR engager)"],
      europepmc: ["(TITLE:\"folate receptor\" OR TITLE:\"FOLR1\" OR TITLE:\"FRα\") AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\")"],
      patents: ["folate receptor alpha CD3 bispecific T cell engager"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-her2-lutetium-177",
    format: "radioligand",
    name: "HER2 radioligand labelled with lutetium-177",
    components: { target: "her2", isotope: "lutetium-177" },
    targets: ["her2"],
    cancers: ["breast-her2-positive", "gastric-her2-positive", "her2-positive-breast-brain-metastases"],
    rationale: "HER2 is the corpus's most validated delivery antigen (trastuzumab-deruxtecan, trastuzumab-emtansine, zanidatamab) and lutetium-177 is validated by two approved radioligands (pluvicto, lutathera). No corpus product pairs HER2 with a therapeutic radionuclide, although HER2 imaging tracers already show the antigen can be targeted in vivo.",
    plausibilityNote: "HER2 is a proven delivery target, but a full antibody circulates for weeks and delivers a high marrow dose with lutetium-177; a small HER2-binding scaffold (affibody, nanobody) with fast clearance is the format that would make this work, and HER2 on heart tissue is the safety question.",
    validation: {
      a: { level: "approved", via: ["trastuzumab-deruxtecan", "trastuzumab"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 75,
      burden: 31,
      worldDeaths: 1326278,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT06824155",
        url: "https://clinicaltrials.gov/study/NCT06824155",
        date: "2025-02-13",
        quote: "This is a first-in-human, Phase 0/1, open-label study of177Lu-RAD202 consisting of an Imaging Period with 177Lu-RAD202im(imaging dose) and a Treatment Period with 177Lu-RAD202tr(treatment dose) to determine the recommended dose(s) for future exploration of 177Lu-RAD202 in participants with HER2 expressing advanced solid tumours.",
        sponsor: "Radiopharm Theranostics, Ltd",
        note: "Radiopharm Theranostics HEAT trial, phase 0/1 of a lutetium-177 HER2 binder, recruiting."
      },
      {
        kind: "trial",
        source: "NCT07081555",
        url: "https://clinicaltrials.gov/study/NCT07081555",
        date: "2025-07-23",
        quote: "This is a FiH phase 1, open-label, two-stage, randomized trial to assess the safety, tolerability, and biodistribution of \\[177Lu\\]Lu-ABY-271 in subjects with HER2 positive metastatic breast cancer.",
        sponsor: "Affibody",
        note: "Affibody first-in-human phase 1 of a lutetium-177 HER2 affibody, recruiting."
      },
      {
        kind: "paper",
        source: "doi:10.1126/sciadv.aee4052",
        url: "https://doi.org/10.1126/sciadv.aee4052",
        date: "2026-07-17",
        quote: "Using human epidermal growth factor receptor 2 (HER2) as a proof of concept, we developed <sup>177</sup>Lu-DOTA-Fab-ABD, which integrates rapid tumor penetration with albumin-mediated extended circulation, improving tumor dosimetry while reducing off-target radiation.",
        sponsor: "Liu P et al., Science advances",
        note: "Preclinical: albumin-binding lutetium-177 HER2 Fab, Science Advances 2026."
      }
    ],
    status: "clinical evidence",
    caveat: "An intact antibody carrier would give too much marrow dose; the proposal requires a small, fast-clearing HER2 binder with kidney retention solved, which is engineering work before any efficacy question.",
    decomposerMissed: [],
    refs: ["lutathera", "pluvicto", "trastuzumab-deruxtecan", "trastuzumab-emtansine", "zanidatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(177Lu OR lutetium-177 OR Lu-177) AND HER2"],
      europepmc: ["(TITLE:\"177Lu\" OR TITLE:\"lutetium-177\" OR TITLE:\"Lu-177\") AND TITLE:\"HER2\""],
      patents: ["lutetium-177 HER2 radioligand therapy"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-nectin4-lutetium-177",
    format: "radioligand",
    name: "Nectin-4 radioligand labelled with lutetium-177",
    components: { target: "nectin4", isotope: "lutetium-177" },
    targets: ["nectin4"],
    cancers: ["urothelial", "tnbc", "pancreatic"],
    rationale: "Nectin-4 is validated by an approved ADC (enfortumab-vedotin) and lutetium-177 by two approved radioligands (pluvicto, lutathera). No corpus product pairs Nectin-4 with a radionuclide, although the antigen's density and restricted expression are the properties the radioligand field selects for.",
    plausibilityNote: "Nectin-4 is highly expressed in urothelial cancer with limited normal-tissue expression apart from skin; a small peptide or bicyclic ligand with fast clearance is the plausible carrier, and skin dose is the toxicity to model.",
    validation: {
      a: { level: "approved", via: ["enfortumab-vedotin"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 75,
      burden: 31,
      worldDeaths: 1354108,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1186/s12951-026-04253-0",
        url: "https://doi.org/10.1186/s12951-026-04253-0",
        date: "2026-03-07",
        quote: "&lt;sup&gt;68&lt;/sup&gt;Ga/&lt;sup&gt;177&lt;/sup&gt;Lu-labeled nectin4-targeted covalent bicyclic peptide: a novel nectin-4-targeted radioligands for theranostic of urothelial carcinoma.",
        sponsor: "Sun L et al., Journal of nanobiotechnology",
        note: "Preclinical: lutetium-177 bicyclic peptide against Nectin-4 in urothelial models."
      },
      {
        kind: "paper",
        source: "doi:10.1186/s41181-026-00435-1",
        url: "https://doi.org/10.1186/s41181-026-00435-1",
        date: "2026-03-30",
        quote: "Preliminary biological evaluation of a [&lt;sup&gt;177&lt;/sup&gt;Lu]Lu-labeled peptide targeting Nectin-4.",
        sponsor: "Li D et al., EJNMMI radiopharmacy and chemistry",
        note: "Preclinical: a second lutetium-177 Nectin-4 peptide."
      },
      {
        kind: "trial",
        source: "NCT07020117",
        url: "https://clinicaltrials.gov/study/NCT07020117",
        date: "2025-06-13",
        quote: "This is a first-in-human Phase 1b, 2-part, multicenter open-label clinical study to evaluate safety and efficacy of a Nectin-4 radiopharmaceutical (\\[225Ac\\]Ac-AKY-1189) in patients with locally advanced or metastatic solid tumors and to establish the maximum tolerated dose (MTD) or maximum administered dose (MAD) and the recommended Phase 2 dose.",
        sponsor: "Aktis Oncology, Inc.",
        note: "Adjacent cell: Aktis Oncology's first-in-human phase 1b uses actinium-225 on the same target, so the Nectin-4 radioligand route is already clinical with a different isotope.",
        adjacent: true
      }
    ],
    status: "preclinical evidence",
    caveat: "A radioligand needs a small ligand with good tumour retention, which for Nectin-4 is not yet an established chemistry; the first evidence would be a PET tracer showing uptake in patients.",
    decomposerMissed: [],
    refs: ["enfortumab-vedotin", "lutathera", "pluvicto"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(177Lu OR lutetium OR radioligand OR radiopharmaceutical) AND (Nectin-4 OR Nectin4)"],
      europepmc: ["(TITLE:\"Nectin-4\" OR TITLE:\"Nectin4\") AND (TITLE:\"177Lu\" OR TITLE:\"radioligand\" OR TITLE:\"radionuclide\" OR ABSTRACT:\"177Lu\")"],
      patents: ["Nectin-4 radioligand lutetium-177"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-trop2-lutetium-177",
    format: "radioligand",
    name: "TROP2 radioligand labelled with lutetium-177",
    components: { target: "trop2", isotope: "lutetium-177" },
    targets: ["trop2"],
    cancers: ["tnbc", "nsclc", "urothelial", "pancreatic"],
    rationale: "TROP2 carries three approved ADCs (sacituzumab-govitecan, datopotamab-deruxtecan, sacituzumab-tirumotecan) and lutetium-177 is validated on two targets (pluvicto, lutathera). No corpus product pairs TROP2 with a radionuclide.",
    plausibilityNote: "TROP2 is broadly expressed on epithelial cancers but also on skin, oesophagus and other normal epithelia, which a radioligand cannot spare as an ADC can through antigen-density thresholds; the case is weaker than for Nectin-4 or PSMA.",
    validation: {
      a: { level: "approved", via: ["sacituzumab-govitecan", "datopotamab-deruxtecan"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 75,
      burden: 35,
      worldDeaths: 3171577,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT06188468",
        url: "https://clinicaltrials.gov/study/NCT06188468",
        date: "2024-01-03",
        quote: "ImmunoPET Targeting Trophoblast Cell-surface Antigen 2 (Trop-2) in Solid Tumors",
        sponsor: "The First Affiliated Hospital of Xiamen University",
        note: "Adjacent: a gallium-68 TROP2 PET tracer study, imaging only; it shows the antigen can be targeted in patients but no therapeutic TROP2 radioligand was found.",
        adjacent: true
      }
    ],
    status: "no public evidence",
    caveat: "Normal-tissue TROP2 expression is the objection; a PET tracer study showing tumour-to-background ratios comparable to PSMA would be needed before therapy is credible.",
    decomposerMissed: [],
    refs: ["datopotamab-deruxtecan", "lutathera", "pluvicto", "sacituzumab-govitecan", "sacituzumab-tirumotecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(177Lu OR lutetium OR radioligand OR radiopharmaceutical) AND (TROP2 OR Trop-2 OR TROP-2)"],
      europepmc: ["(TITLE:\"TROP2\" OR TITLE:\"Trop-2\" OR TITLE:\"TROP-2\") AND (TITLE:\"177Lu\" OR TITLE:\"radioligand\" OR TITLE:\"radionuclide\" OR TITLE:\"radioimmunotherapy\")"],
      patents: ["TROP2 radioligand lutetium-177 therapy"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-psma-top1",
    format: "adc",
    name: "PSMA ADC with a topoisomerase-I payload",
    components: { target: "psma", payloadClass: "topoisomerase-i-payloads" },
    targets: ["psma"],
    cancers: ["prostate-mcrpc", "prostate"],
    rationale: "PSMA is validated by an approved radioligand (pluvicto) and three phase-3 alpha emitters (aaa817, ac225-psma), and topoisomerase-I is the dominant approved ADC payload class (trastuzumab-deruxtecan, sacituzumab-govitecan, datopotamab-deruxtecan). No corpus drug conjugates a PSMA antibody to a topoisomerase-I payload.",
    plausibilityNote: "Topoisomerase-I payloads kill more slowly dividing cells than auristatins and have bystander effect for heterogeneous PSMA expression; prostate cancer has had no camptothecin exposure, so no pre-existing resistance.",
    validation: {
      a: { level: "approved", via: ["pluvicto"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan", "sacituzumab-govitecan"] }
    },
    score: {
      total: 74,
      burden: 26,
      worldDeaths: 397430,
      validationA: 15,
      validationB: 15,
      plausibility: 18
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1158/1535-7163.mct-26-0395",
        url: "https://doi.org/10.1158/1535-7163.mct-26-0395",
        date: "2026-05-29",
        quote: "GenSci143 comprises a highly active topoisomerase 1 inhibitor payload conjugated to a dual-targeting antibody via a plasma-stable linker to minimize off-target toxicity.",
        sponsor: "Xu Y et al., Molecular cancer therapeutics",
        note: "Preclinical: a bispecific B7-H3 x PSMA conjugate with a topoisomerase-I payload, so the payload class has reached PSMA in a two-target form."
      }
    ],
    status: "preclinical evidence",
    caveat: "It would need to hold its own against a radioligand that already delivers a DNA-damaging dose to the same antigen; the likely place is after radioligand progression or in patients whose marrow reserve excludes further radiation.",
    decomposerMissed: [],
    refs: ["aaa817", "ac225-psma", "datopotamab-deruxtecan", "pluvicto", "sacituzumab-govitecan", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["PSMA AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR SN-38)"],
      europepmc: ["TITLE:\"PSMA\" AND (ABSTRACT:\"antibody-drug conjugate\" OR ABSTRACT:\"ADC\") AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")", "TITLE:\"PSMA\" AND (ABSTRACT:\"exatecan\" OR ABSTRACT:\"deruxtecan\" OR ABSTRACT:\"SN-38\") AND ABSTRACT:\"conjugate\"", "(ABSTRACT:\"TD001\" OR ABSTRACT:\"DEC003M\") AND ABSTRACT:\"PSMA\""],
      patents: ["PSMA antibody drug conjugate camptothecin exatecan"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd19-top1",
    format: "adc",
    name: "CD19 ADC with a topoisomerase-I payload",
    components: { target: "cd19", payloadClass: "topoisomerase-i-payloads" },
    targets: ["cd19"],
    cancers: ["dlbcl", "all-leukemia", "follicular-lymphoma", "mantle-cell-lymphoma"],
    rationale: "CD19 is validated as an ADC target with a PBD dimer (zynlonta), as a T-cell engager target (blinatumomab) and as a CAR-T target (tisagenlecleucel), while topoisomerase-I payloads dominate solid-tumour ADCs (trastuzumab-deruxtecan, sacituzumab-govitecan). No corpus ADC pairs CD19 with a topoisomerase-I payload; lymphoma cells proliferate fast enough for replication-dependent poisons to act.",
    plausibilityNote: "CD19 internalises (zynlonta depends on it) and is B-lineage restricted; a topoisomerase-I payload would give a lower-potency, higher-DAR alternative to the PBD dimer whose skin and fluid toxicities limit zynlonta.",
    validation: {
      a: { level: "approved", via: ["zynlonta", "tisagenlecleucel", "blinatumomab"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 73,
      burden: 27,
      worldDeaths: 556084,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [],
    status: "no public evidence",
    caveat: "A CD19 topoisomerase-I ADC would enter a field where CAR-T and CD20 x CD3 bispecifics already work; its niche would be outpatient, off-the-shelf therapy for patients unfit for those.",
    decomposerMissed: [],
    refs: ["blinatumomab", "sacituzumab-govitecan", "tisagenlecleucel", "trastuzumab-deruxtecan", "zynlonta"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD19 AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR TOP1) AND conjugate"],
      europepmc: ["TITLE:\"CD19\" AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["CD19 antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-ceacam5-cd3",
    format: "bispecific",
    name: "CEACAM5 x CD3 bispecific",
    components: { targetA: "ceacam5", targetB: "cd3" },
    targets: ["ceacam5", "cd3"],
    cancers: ["colorectal", "nsclc", "gastric", "pancreatic"],
    rationale: "CEACAM5 has two ADCs in phase 3 in the corpus (precemtabart-tocentecan, tusamitamab-ravtansine) and the CD3 arm is validated in solid tumours (tarlatamab). No corpus T-cell engager targets CEACAM5, though it is the classic marker of the largest immunotherapy-resistant cancer in the corpus (colorectal).",
    plausibilityNote: "CEACAM5 is dense on colorectal and lung adenocarcinoma with limited normal expression apart from colonic epithelium; microsatellite-stable colorectal cancer has no working immunotherapy, so an engager that brings T cells in is the right shape of idea, and the shed antigen (CEA) in serum is the sink to design around.",
    validation: {
      a: { level: "phase-3", via: ["precemtabart-tocentecan", "tusamitamab-ravtansine"] },
      b: { level: "approved", via: ["tarlatamab", "blinatumomab"] }
    },
    score: {
      total: 73,
      burden: 36,
      worldDeaths: 3849072,
      validationA: 10,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02324257",
        url: "https://clinicaltrials.gov/study/NCT02324257",
        date: "2014-12-24",
        quote: "Study BP29541 is a first-in-human, open-label, multi-center, dose-escalation Phase I clinical study of single-agent RO6958688 in participants with locally advanced and/or metastatic carcinoembryonic antigen (CEA) positive solid tumors who have progressed on standard treatment, are intolerant to standard of care (SOC), and/or are non-amenable to SOC.",
        sponsor: "Hoffmann-La Roche",
        note: "Roche first-in-human phase 1 of RO6958688 (cibisatamab), completed."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41467-024-48479-8",
        url: "https://doi.org/10.1038/s41467-024-48479-8",
        date: "2024-05-15",
        quote: "CEA-CD3 bispecific antibody cibisatamab with or without atezolizumab in patients with CEA-positive solid tumours: results of two multi-institutional Phase 1 trials.",
        sponsor: "Segal NH et al., Nature communications",
        note: "Cibisatamab with or without atezolizumab, phase 1 results, Nature Communications 2024."
      },
      {
        kind: "trial",
        source: "NCT06663839",
        url: "https://clinicaltrials.gov/study/NCT06663839",
        date: "2024-10-29",
        quote: "Study LCB-2301-001 is an open-label, Phase 1, dose escalation (Part A) and expansion (Part B), first-in-human clinical study of NILK-2301 in patients with locally advanced or metastatic low tumor volume (LTV) colorectal cancer.",
        sponsor: "Light Chain Bioscience - Novimmune SA",
        note: "Light Chain Bioscience phase 1 of NILK-2301 in low-volume colorectal cancer, recruiting."
      }
    ],
    status: "clinical evidence",
    caveat: "Soluble CEA in serum can soak up the engager and colonic epithelium expresses the antigen; a 2+1 format that needs membrane-bound density is the plausible design, and an earlier attempt found modest activity.",
    decomposerMissed: [],
    refs: ["colorectal", "precemtabart-tocentecan", "tarlatamab", "tusamitamab-ravtansine"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(CEACAM5 OR CEA OR carcinoembryonic) AND CD3 AND (bispecific OR engager OR TCB)"],
      europepmc: ["(TITLE:\"CEACAM5\" OR TITLE:\"CEA\" OR TITLE:\"carcinoembryonic antigen\") AND (TITLE:\"CD3\" OR TITLE:\"T-cell bispecific\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\")"],
      patents: ["CEACAM5 CD3 bispecific T cell engager colorectal"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-her2-cd3",
    format: "bispecific",
    name: "HER2 x CD3 bispecific",
    components: { targetA: "her2", targetB: "cd3" },
    targets: ["her2", "cd3"],
    cancers: ["breast-her2-positive", "gastric-her2-positive", "her2-low-metastatic-breast-cancer"],
    rationale: "HER2 is validated across antibodies, ADCs and bispecifics (trastuzumab, trastuzumab-deruxtecan, zanidatamab) and the CD3 arm across seven approved engagers (blinatumomab, teclistamab, tarlatamab). The corpus has no HER2 x CD3 T-cell engager, the obvious cell for the most validated antigen and the most validated effector arm.",
    plausibilityNote: "HER2 is the most validated solid-tumour antigen, but T-cell engagers have no antigen-density threshold and HER2 is expressed at low levels on many normal epithelia; a low-affinity or avidity-dependent (2+1) format is what a HER2 x CD3 needs to spare normal tissue.",
    validation: {
      a: { level: "approved", via: ["trastuzumab-deruxtecan", "zanidatamab"] },
      b: { level: "approved", via: ["blinatumomab", "teclistamab"] }
    },
    score: {
      total: 73,
      burden: 31,
      worldDeaths: 1326278,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT04501770",
        url: "https://clinicaltrials.gov/study/NCT04501770",
        date: "2020-08-06",
        quote: "A Study of M802 (HER2 and CD3) in HER2-Positive Advanced Solid Tumors",
        sponsor: "Wuhan YZY Biopharma Co., Ltd.",
        note: "Wuhan YZY Biopharma phase 1 of M802, a HER2 x CD3 bispecific, completed."
      },
      {
        kind: "trial",
        source: "NCT02829372",
        url: "https://clinicaltrials.gov/study/NCT02829372",
        date: "2016-07-12",
        quote: "CD3/HER2 bispecific monoclonal antibody",
        sponsor: "Ichnos Sciences SA",
        note: "Ichnos phase 1 of GBR 1302, terminated."
      },
      {
        kind: "trial",
        source: "NCT00452140",
        url: "https://clinicaltrials.gov/study/NCT00452140",
        date: "2007-03-27",
        quote: "The purpose of the study is to demonstrate clinical efficacy of the investigational trifunctional bispecific antibody ertumaxomab for treatment of patients with HER-2/neu 1+ or 2+ (FISH-) expressing advanced or metastatic breast cancer (stage III b/IV) which has progressed after endocrine therapy.",
        sponsor: "Neovii Biotech",
        note: "Neovii phase 2 of the trifunctional HER2 x CD3 antibody ertumaxomab, terminated; the cell has been tried three times."
      }
    ],
    status: "clinical evidence",
    caveat: "Normal-tissue HER2 will be hit unless the CD3 arm is tuned to need high antigen density; the first-generation attempts were limited by exactly this.",
    decomposerMissed: [],
    refs: ["blinatumomab", "tarlatamab", "teclistamab", "trastuzumab", "trastuzumab-deruxtecan", "zanidatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["HER2 AND CD3 AND (bispecific OR engager)"],
      europepmc: ["TITLE:\"HER2\" AND TITLE:\"CD3\" AND (TITLE:\"bispecific\" OR TITLE:\"T-cell engager\" OR TITLE:\"T cell engager\")"],
      patents: ["HER2 CD3 bispecific T cell engager"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-sstr2-cd3",
    format: "bispecific",
    name: "Somatostatin receptor 2 x CD3 bispecific",
    components: { targetA: "sstr2", targetB: "cd3" },
    targets: ["sstr2", "cd3"],
    cancers: ["neuroendocrine", "sclc", "pancreatic-net"],
    rationale: "SSTR2 is validated by an approved radioligand (lutathera) and the CD3 arm in neuroendocrine cancer by an approved DLL3 engager (tarlatamab). No corpus T-cell engager targets SSTR2.",
    plausibilityNote: "SSTR2 is restricted and dense on neuroendocrine tumours, and tarlatamab proves engagers work in neuroendocrine-lineage cancer; SSTR2 on pancreatic islets, pituitary and gut endocrine cells predicts endocrine toxicity, and a GPCR is a hard antibody target.",
    validation: {
      a: { level: "approved", via: ["lutathera"] },
      b: { level: "approved", via: ["tarlatamab"] }
    },
    score: {
      total: 73,
      burden: 33,
      worldDeaths: 1817469,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03411915",
        url: "https://clinicaltrials.gov/study/NCT03411915",
        date: "2018-01-26",
        quote: "This is a Phase 1, multiple dose, ascending dose escalation study; to define a MTD/RD and regimen consisting of a first \"priming\" dose and escalated subsequent doses of XmAb18087; to describe safety and tolerability; to assess PK and immunogenicity; and to preliminarily assess anti-tumor activity of XmAb18087 in subjects with advanced NET or GIST.",
        sponsor: "Xencor, Inc.",
        note: "Xencor phase 1 of XmAb18087 (tidutamab) in neuroendocrine tumours and GIST, completed."
      },
      {
        kind: "trial",
        source: "NCT04590781",
        url: "https://clinicaltrials.gov/study/NCT04590781",
        date: "2020-10-19",
        quote: "This is a Phase 1b/2, multiple-dose study designed to describe safety and efficacy, and to assess PK and immunogenicity of XmAb18087 monotherapy and in combination with pembrolizumab in participants with metastatic Merkel cell (MCC) or locoregional MCC that has recurred after locoregional therapy with surgery and/or radiation therapy, and mAb18087 monotherapy in participants with extensive-stage small cell lung ca...",
        sponsor: "Xencor, Inc.",
        note: "Xencor phase 1b/2 in Merkel cell carcinoma and small-cell lung cancer, terminated."
      }
    ],
    status: "clinical evidence",
    caveat: "An SSTR2 x CD3 engager reached phase 1 and was discontinued; endocrine on-target effects and the difficulty of engaging a GPCR remain, so a new construct would need to show why it differs.",
    decomposerMissed: [],
    refs: ["lutathera", "tarlatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(SSTR2 OR somatostatin receptor) AND CD3 AND (bispecific OR engager)", "XmAb18087 OR tidutamab"],
      europepmc: ["(TITLE:\"SSTR2\" OR TITLE:\"somatostatin receptor\") AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\")", "(TITLE:\"tidutamab\" OR ABSTRACT:\"tidutamab\" OR TITLE:\"XmAb18087\" OR ABSTRACT:\"XmAb18087\")"],
      patents: ["SSTR2 CD3 bispecific antibody neuroendocrine"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-trop2-cd3",
    format: "bispecific",
    name: "TROP2 x CD3 bispecific",
    components: { targetA: "trop2", targetB: "cd3" },
    targets: ["trop2", "cd3"],
    cancers: ["tnbc", "nsclc", "urothelial", "pancreatic"],
    rationale: "TROP2 carries three approved ADCs (sacituzumab-govitecan, datopotamab-deruxtecan, sacituzumab-tirumotecan) and the CD3 arm is validated in solid tumours by tarlatamab (tarlatamab). No corpus T-cell engager targets TROP2.",
    plausibilityNote: "TROP2 is on normal skin, oesophagus and other epithelia; an ADC tolerates this because payload delivery scales with antigen density, but a CD3 engager kills at low density, so the window is narrow unless the CD3 arm is masked or avidity-gated.",
    validation: {
      a: { level: "approved", via: ["sacituzumab-govitecan", "datopotamab-deruxtecan"] },
      b: { level: "approved", via: ["tarlatamab", "blinatumomab"] }
    },
    score: {
      total: 73,
      burden: 35,
      worldDeaths: 3171577,
      validationA: 15,
      validationB: 15,
      plausibility: 8
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Normal-epithelium expression predicts on-target toxicity; a protease-masked or 2+1 avidity format would be needed to have any window.",
    decomposerMissed: [],
    refs: ["datopotamab-deruxtecan", "sacituzumab-govitecan", "sacituzumab-tirumotecan", "tarlatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(TROP2 OR Trop-2 OR TROP-2) AND CD3 AND (bispecific OR engager)"],
      europepmc: ["(TITLE:\"TROP2\" OR TITLE:\"Trop-2\" OR TITLE:\"TROP-2\") AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"T cell engager\")"],
      patents: ["TROP2 CD3 bispecific T cell engager"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-cldn18-2-cd28",
    format: "car-t",
    name: "Claudin 18.2 CAR-T with CD28 costimulation",
    components: { target: "cldn18-2", costimulatoryDomain: "cd28" },
    targets: ["cldn18-2", "cd28"],
    cancers: ["gastric-cldn18-2-positive", "gastric", "pancreatic"],
    rationale: "Claudin 18.2 is validated by the first approved solid-tumour CAR-T (satricabtagene-autoleucel), which uses 4-1BB costimulation, and CD28 is validated as a costimulatory domain in approved CD19 CAR-Ts (axicabtagene-ciloleucel). No corpus Claudin 18.2 CAR-T uses CD28, so the cell is untried.",
    plausibilityNote: "Solid-tumour CAR-Ts need to expand quickly against an immunosuppressive microenvironment, which favours CD28's kinetics; the risk is stronger on-target gastric mucosal toxicity from the same rapid activation.",
    validation: {
      a: { level: "approved", via: ["satricabtagene-autoleucel"] },
      b: { level: "approved", via: ["axicabtagene-ciloleucel"] }
    },
    score: {
      total: 73,
      burden: 31,
      worldDeaths: 1127584,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05539430",
        url: "https://clinicaltrials.gov/study/NCT05539430",
        date: "2022-09-14",
        quote: "This is a Phase 1, Open-Label, Dose Escalation and Expansion, Multicenter Study of Claudin 18.2-Targeted Chimeric Antigen Receptor T-cells in Subjects with Unresectable, Locally Advanced, or Metastatic Gastric, Gastroesophageal Junction (GEJ), Esophageal, or Pancreatic Adenocarcinoma",
        sponsor: "Legend Biotech USA Inc",
        note: "Adjacent: Legend Biotech's LB1908 phase 1 is a Claudin 18.2 CAR-T whose costimulatory domain the record does not state.",
        adjacent: true
      },
      {
        kind: "paper",
        source: "doi:10.1007/s12275-024-00133-0",
        url: "https://doi.org/10.1007/s12275-024-00133-0",
        date: "2024-05-03",
        quote: "Genetically Engineered CLDN18.2 CAR-T Cells Expressing Synthetic PD1/CD28 Fusion Receptors Produced Using a Lentiviral Vector.",
        sponsor: "Lee HJ et al., Journal of microbiology (Seoul, Korea)",
        note: "Adjacent: preclinical Claudin 18.2 CAR-T carrying a PD-1/CD28 switch receptor, not CD28 as the primary costimulatory domain.",
        adjacent: true
      }
    ],
    status: "no public evidence",
    caveat: "The 4-1BB construct already causes gastric mucosal injury; a CD28 version would need to show that faster expansion buys response without worse mucosal toxicity.",
    decomposerMissed: [],
    refs: ["axicabtagene-ciloleucel", "satricabtagene-autoleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(Claudin 18.2 OR CLDN18.2) AND CAR"],
      europepmc: ["(TITLE:\"Claudin 18.2\" OR TITLE:\"CLDN18.2\") AND TITLE:\"CAR\" AND ABSTRACT:\"CD28\""],
      patents: ["Claudin 18.2 chimeric antigen receptor CD28"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-met-4-1bb",
    format: "car-t",
    name: "MET CAR-T with 4-1BB costimulation",
    components: { target: "met", costimulatoryDomain: "4-1bb" },
    targets: ["met", "cd137"],
    cancers: ["tnbc", "hcc", "met-altered-nsclc"],
    rationale: "MET is validated by an approved ADC (telisotuzumab-vedotin) and kinase inhibitors (capmatinib), and 4-1BB by most approved CAR-Ts (tisagenlecleucel). No corpus CAR-T targets MET.",
    plausibilityNote: "MET is expressed on hepatocytes and many epithelia, so a systemic MET CAR-T risks liver toxicity; intratumoural or transient mRNA CAR delivery is the design that has been tried.",
    validation: {
      a: { level: "approved", via: ["telisotuzumab-vedotin", "capmatinib"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 73,
      burden: 35,
      worldDeaths: 3242297,
      validationA: 15,
      validationB: 15,
      plausibility: 8
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT01837602",
        url: "https://clinicaltrials.gov/study/NCT01837602",
        date: "2013-04-23",
        quote: "An open-label, clinical trial of autologous cMet redirected T cells administered intratumorally (IT) in patients with breast cancer.",
        sponsor: "University of Pennsylvania",
        note: "University of Pennsylvania phase 1 of intratumoural mRNA c-Met CAR-T in breast cancer, completed; transient CAR expression is the safety design."
      },
      {
        kind: "trial",
        source: "NCT03060356",
        url: "https://clinicaltrials.gov/study/NCT03060356",
        date: "2017-02-23",
        quote: "This is a pilot study to evaluate feasibility, safety, and preliminary evidence of efficacy for intravenously administered, RNA electroporated autologous T cells expressing MET chimeric antigen receptors with tandem TCRζ and 4-1BB (TCRζ /4-1BB) co-stimulatory domains (referred to as \"RNA CART-cMET\") in patients with advanced melanoma or breast carcinoma.",
        sponsor: "University of Pennsylvania",
        note: "University of Pennsylvania pilot of intravenous mRNA c-Met CAR-T, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41598-025-15086-6",
        url: "https://doi.org/10.1038/s41598-025-15086-6",
        date: "2025-08-11",
        quote: "Co-expression of a truncated TGFβ receptor II in c-Met CAR T cells enhances antitumor activity against lung adenocarcinoma.",
        sponsor: "Su C et al., Scientific reports",
        note: "Preclinical: c-Met CAR-T with a truncated TGF-beta receptor II in lung adenocarcinoma models."
      }
    ],
    status: "clinical evidence",
    caveat: "Hepatocyte MET expression is the obstacle; unless a transient or locally delivered product proves safe, this stays preclinical.",
    decomposerMissed: [],
    refs: ["capmatinib", "telisotuzumab-vedotin", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(c-Met OR cMet) AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["(TITLE:\"c-Met\" OR TITLE:\"cMet\") AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["c-Met chimeric antigen receptor T cell"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-trop2-4-1bb",
    format: "car-t",
    name: "TROP2 CAR-T with 4-1BB costimulation",
    components: { target: "trop2", costimulatoryDomain: "4-1bb" },
    targets: ["trop2", "cd137"],
    cancers: ["tnbc", "pancreatic", "nsclc", "urothelial"],
    rationale: "TROP2 carries three approved ADCs (sacituzumab-govitecan, datopotamab-deruxtecan, sacituzumab-tirumotecan) and 4-1BB is the costimulatory domain of most approved CAR-Ts (tisagenlecleucel). The corpus holds a TROP2 CAR-NK in phase 2 (eb-nk-301) but no TROP2 CAR-T.",
    plausibilityNote: "TROP2 is broadly expressed on normal epithelia, so a CAR-T's sustained killing would hit skin and gut; the ADCs tolerate this because payload dose scales with antigen density, but a CAR has no such threshold unless engineered with logic gating.",
    validation: {
      a: { level: "approved", via: ["sacituzumab-govitecan", "datopotamab-deruxtecan"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 73,
      burden: 35,
      worldDeaths: 3171577,
      validationA: 15,
      validationB: 15,
      plausibility: 8
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1158/2326-6066.cir-25-0527",
        url: "https://doi.org/10.1158/2326-6066.cir-25-0527",
        date: "2025-11-01",
        quote: "Systematic Engineering of TROP2-Targeted CAR T-Cell Therapy Overcomes Resistance Pathways in Solid Tumors.",
        sponsor: "Brea EJ et al., Cancer immunology research",
        note: "Preclinical: systematic engineering of TROP2 CAR-T against solid-tumour resistance, Cancer Immunology Research 2025."
      },
      {
        kind: "paper",
        source: "doi:10.1136/jitc-2025-012442",
        url: "https://doi.org/10.1136/jitc-2025-012442",
        date: "2025-09-03",
        quote: "Preclinical evaluation of antitumor activity and toxicity of TROP2-specific CAR-T cells for treatment of triple-negative breast cancer.",
        sponsor: "Sun S et al., Journal for immunotherapy of cancer",
        note: "Preclinical: activity and toxicity of TROP2 CAR-T in triple-negative breast cancer models."
      },
      {
        kind: "trial",
        source: "NCT07553390",
        url: "https://clinicaltrials.gov/study/NCT07553390",
        date: "2026-04-28",
        quote: "TGFBR2 KO iC9/TROP2.CAR/IL-15 NK cells.",
        sponsor: "M.D. Anderson Cancer Center",
        note: "Adjacent: MD Anderson phase 1b of TROP2 CAR-NK cells with trastuzumab deruxtecan, NK rather than T cells.",
        adjacent: true
      }
    ],
    status: "preclinical evidence",
    caveat: "Normal-epithelium expression makes an unmodified TROP2 CAR-T dangerous; logic-gated or transient constructs are the only credible designs.",
    decomposerMissed: [],
    refs: ["datopotamab-deruxtecan", "eb-nk-301", "sacituzumab-govitecan", "sacituzumab-tirumotecan", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(TROP2 OR Trop-2 OR TROP-2) AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["(TITLE:\"TROP2\" OR TITLE:\"Trop-2\" OR TITLE:\"TROP-2\") AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["TROP2 chimeric antigen receptor T cell"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-psma-tubulin",
    format: "adc",
    name: "PSMA ADC with a tubulin-inhibitor payload",
    components: { target: "psma", payloadClass: "tubulin-inhibitor-payloads" },
    targets: ["psma"],
    cancers: ["prostate-mcrpc", "prostate"],
    rationale: "PSMA is validated by an approved radioligand (pluvicto) and tubulin payloads are approved on Nectin-4 (enfortumab-vedotin) and HER2 (trastuzumab-emtansine). No corpus ADC targets PSMA at all, although PSMA internalises and is the best-characterised antigen in prostate cancer.",
    plausibilityNote: "PSMA internalises through its cytoplasmic tail and is tumour-restricted apart from salivary glands, kidney and small bowel; an ADC would avoid the marrow and salivary dose of the radioligand, though prostate cancer grows slowly and tubulin agents need dividing cells.",
    validation: {
      a: { level: "approved", via: ["pluvicto"] },
      b: { level: "approved", via: ["enfortumab-vedotin", "trastuzumab-emtansine"] }
    },
    score: {
      total: 72,
      burden: 26,
      worldDeaths: 397430,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT04662580",
        url: "https://clinicaltrials.gov/study/NCT04662580",
        date: "2020-12-10",
        quote: "This is a phase 1 study to assess the safety and tolerability of ARX517 as monotherapy or combination therapy in adult subjects with metastatic prostate cancer (mPC).",
        sponsor: "Janssen Research & Development, LLC",
        note: "Phase 1, active; the paper below names the tubulin payload."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1535-7163.mct-23-0927",
        url: "https://doi.org/10.1158/1535-7163.mct-23-0927",
        date: "2024-12-01",
        quote: "Using our proprietary technology for incorporating synthetic amino acids into proteins at selected sites, we have developed ARX517, an antibody-drug conjugate composed of a humanized anti-PSMA antibody site-specifically conjugated to a tubulin inhibitor at a drug-to-antibody ratio of 2.",
        sponsor: "Skidmore LK et al., Molecular cancer therapeutics",
        note: "Preclinical characterisation of ARX517 (DAR 2, non-cleavable linker)."
      },
      {
        kind: "trial",
        source: "NCT01695044",
        url: "https://clinicaltrials.gov/study/NCT01695044",
        date: "2012-09-27",
        quote: "PSMA ADC 2301 is a Phase 2, open-label, study to assess the anti-tumor activity and tolerability of Prostate Specific Membrane Antigen Antibody Drug Conjugate (PSMA ADC) in two groups of subjects with metastatic castration-resistant prostate cancer (mCRPC).",
        sponsor: "Progenics Pharmaceuticals, Inc.",
        note: "Progenics' earlier PSMA ADC, phase 2 completed; the programme did not continue."
      },
      {
        kind: "paper",
        source: "doi:10.1016/j.urolonc.2016.07.005",
        url: "https://doi.org/10.1016/j.urolonc.2016.07.005",
        date: "2016-10-17",
        quote: "<h4>Background</h4>This phase 1/2 study evaluated the dose-limiting toxicity and maximum tolerated dose of MLN2704, a humanized monoclonal antibody MLN591 targeting prostate-specific membrane antigen, linked to the maytansinoid DM1 in patients with progressive metastatic castration-resistant prostate cancer.<h4>Patients and methods</h4>A total of 62 patients received MLN2704 at ascending doses on 4 schedules: week...",
        sponsor: "Milowsky MI et al., Urologic oncology",
        note: "Phase 1/2 of MLN2704, a PSMA antibody with the maytansinoid DM1; an earlier attempt at the same cell."
      }
    ],
    status: "clinical evidence",
    caveat: "Two earlier PSMA tubulin ADCs were stopped for neuropathy and neutropenia; a new attempt would need site-specific conjugation or a non-permeable payload to change the window.",
    decomposerMissed: [],
    refs: ["enfortumab-vedotin", "pluvicto", "trastuzumab-emtansine"],
    searched: {
      on: "2026-09-23",
      ctgov: ["PSMA AND (auristatin OR MMAE OR vedotin OR maytansinoid OR DM1 OR ARX517 OR \"antibody drug conjugate\")"],
      europepmc: ["TITLE:\"PSMA\" AND (TITLE:\"antibody-drug conjugate\" OR TITLE:\"ADC\") AND (ABSTRACT:\"auristatin\" OR ABSTRACT:\"MMAE\" OR ABSTRACT:\"maytansinoid\" OR ABSTRACT:\"tubulin\")"],
      patents: ["PSMA antibody drug conjugate auristatin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-her2-4-1bb",
    format: "car-t",
    name: "HER2 CAR-T with 4-1BB costimulation",
    components: { target: "her2", costimulatoryDomain: "4-1bb" },
    targets: ["her2", "cd137"],
    cancers: ["breast-her2-positive", "gastric-her2-positive", "osteosarcoma", "glioblastoma"],
    rationale: "HER2 is the corpus's most validated delivery antigen (trastuzumab-deruxtecan, trastuzumab, zanidatamab) and 4-1BB costimulation is validated in most approved CAR-Ts (tisagenlecleucel, ciltacabtagene-autoleucel). No corpus CAR-T targets HER2.",
    plausibilityNote: "HER2 is expressed at low levels on lung and heart, and a high-affinity HER2 CAR caused a fatal respiratory event in 2010; later low-affinity constructs have been tolerated, so the design question is affinity tuning and local (intraventricular, intratumoural) delivery.",
    validation: {
      a: { level: "approved", via: ["trastuzumab-deruxtecan", "trastuzumab"] },
      b: { level: "approved", via: ["tisagenlecleucel", "ciltacabtagene-autoleucel"] }
    },
    score: {
      total: 72,
      burden: 32,
      worldDeaths: 1574778,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03696030",
        url: "https://clinicaltrials.gov/study/NCT03696030",
        date: "2018-10-04",
        quote: "This phase I trial studies the side effects and best dose of HER2-CAR T cells in treating patients with cancer that has spread to the brain or leptomeninges and has come back (recurrent).",
        sponsor: "City of Hope Medical Center",
        note: "City of Hope phase 1, HER2 CAR-T delivered into the brain or spinal fluid for metastases, active."
      },
      {
        kind: "trial",
        source: "NCT06241456",
        url: "https://clinicaltrials.gov/study/NCT06241456",
        date: "2024-02-05",
        quote: "This is a phase 1 study designed to evaluate the safety, tolerability, and antitumor activity of FT825 (also known as ONO-8250) with or without monoclonal antibody therapy following chemotherapy in participants with advanced human epidermal growth factor receptor 2 (HER2)-positive or other advanced solid tumors.",
        sponsor: "Fate Therapeutics",
        note: "Fate Therapeutics phase 1 of an off-the-shelf HER2 CAR-T in solid tumours, recruiting."
      },
      {
        kind: "paper",
        source: "doi:10.1016/j.tranon.2021.101227",
        url: "https://doi.org/10.1016/j.tranon.2021.101227",
        date: "2021-09-21",
        quote: "Effectiveness of 4-1BB-costimulated HER2-targeted chimeric antigen receptor T cell therapy for synovial sarcoma.",
        sponsor: "Murayama Y et al., Translational oncology",
        note: "Preclinical: a 4-1BB-costimulated HER2 CAR-T in synovial sarcoma, naming the exact costimulatory domain."
      }
    ],
    status: "clinical evidence",
    caveat: "On-target lung and heart toxicity is documented for a high-affinity HER2 CAR; any new construct needs affinity tuning or regional delivery, and paediatric sarcoma or CNS disease is a more plausible first indication than breast cancer.",
    decomposerMissed: [],
    refs: ["ciltacabtagene-autoleucel", "tisagenlecleucel", "trastuzumab", "trastuzumab-deruxtecan", "zanidatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["HER2 AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["TITLE:\"HER2\" AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\") AND ABSTRACT:\"4-1BB\""],
      patents: ["HER2 chimeric antigen receptor T cell 4-1BB"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-sstr2-4-1bb",
    format: "car-t",
    name: "Somatostatin receptor 2 CAR-T with 4-1BB costimulation",
    components: { target: "sstr2", costimulatoryDomain: "4-1bb" },
    targets: ["sstr2", "cd137"],
    cancers: ["neuroendocrine", "sclc", "pancreatic-net"],
    rationale: "SSTR2 is validated by an approved radioligand (lutathera) and 4-1BB by most approved CAR-Ts (tisagenlecleucel). No corpus CAR-T targets SSTR2.",
    plausibilityNote: "SSTR2 is a seven-transmembrane GPCR with a small extracellular surface, which is hard for an scFv to bind; a CAR built on the octreotide peptide as the binder is the plausible design, and SSTR2 on pancreatic islets and pituitary is the safety question.",
    validation: {
      a: { level: "approved", via: ["lutathera"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 71,
      burden: 33,
      worldDeaths: 1817469,
      validationA: 15,
      validationB: 15,
      plausibility: 8
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1080/2162402x.2024.2412371",
        url: "https://doi.org/10.1080/2162402x.2024.2412371",
        date: "2024-10-03",
        quote: "Peptide-guided adaptor-CAR T-Cell therapy for the treatment of SSTR2-expressing neuroendocrine tumors.",
        sponsor: "Pellegrino C et al., Oncoimmunology",
        note: "Preclinical: peptide-guided adaptor CAR-T for SSTR2-expressing neuroendocrine tumours, the peptide-binder design the plausibility note proposes."
      },
      {
        kind: "paper",
        source: "doi:10.1093/noajnl/vdag186",
        url: "https://doi.org/10.1093/noajnl/vdag186",
        date: "2026-01-01",
        quote: "A fluorescein-conjugated somatostatin receptor antagonist adapter for chimeric antigen receptor T cell therapy of meningioma.",
        sponsor: "Chen J et al., Neuro-oncology advances",
        note: "Preclinical: somatostatin-receptor antagonist adapter CAR-T in meningioma, 2026."
      }
    ],
    status: "preclinical evidence",
    caveat: "Islet and pituitary expression could give endocrine toxicity, and a GPCR is a difficult CAR target; preclinical work on a peptide-based binder would need to come first.",
    decomposerMissed: [],
    refs: ["lutathera", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(SSTR2 OR somatostatin receptor) AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["(TITLE:\"SSTR2\" OR TITLE:\"somatostatin receptor\") AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["somatostatin receptor 2 chimeric antigen receptor T cell"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd79b-top1",
    format: "adc",
    name: "CD79b ADC with a topoisomerase-I payload",
    components: { target: "cd79b", payloadClass: "topoisomerase-i-payloads" },
    targets: ["cd79b"],
    cancers: ["dlbcl", "follicular-lymphoma", "mantle-cell-lymphoma"],
    rationale: "CD79b is validated by an approved tubulin ADC used in first-line lymphoma (polatuzumab-vedotin) and the topoisomerase-I class is the most validated payload family (trastuzumab-deruxtecan, sacituzumab-govitecan). No corpus ADC pairs CD79b with a topoisomerase-I payload.",
    plausibilityNote: "CD79b internalises via the B-cell receptor complex (polatuzumab-vedotin) and is B-lineage restricted; a topoisomerase-I payload would avoid the neuropathy of MMAE and could be combined with R-CHP where vincristine was dropped.",
    validation: {
      a: { level: "approved", via: ["polatuzumab-vedotin"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 70,
      burden: 24,
      worldDeaths: 250679,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Polatuzumab already occupies first-line DLBCL; a second CD79b ADC would need a clean advantage, most plausibly activity after polatuzumab failure or a better neuropathy profile in older patients.",
    decomposerMissed: [],
    refs: ["polatuzumab-vedotin", "sacituzumab-govitecan", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD79b AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR TOP1)"],
      europepmc: ["TITLE:\"CD79b\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["CD79b antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-psma-cd3",
    format: "bispecific",
    name: "PSMA x CD3 bispecific",
    components: { targetA: "psma", targetB: "cd3" },
    targets: ["psma", "cd3"],
    cancers: ["prostate-mcrpc"],
    rationale: "PSMA is validated by an approved radioligand (pluvicto) and the CD3 arm by seven approved engagers (blinatumomab, teclistamab). The corpus has prostate T-cell engagers against STEAP1 and KLK2 (xaluritamig, pasritamig) and a PSMA x CD28 costimulator (jnj-87189401) but no PSMA x CD3 engager, so the cell is untried in the corpus.",
    plausibilityNote: "PSMA is tumour-restricted enough for a radioligand and the corpus already holds prostate engagers against STEAP1 (xaluritamig) and KLK2 (pasritamig) and a PSMA x CD28 costimulatory bispecific (jnj-87189401); the prostate microenvironment's T-cell exclusion and cytokine release at active doses are the obstacles.",
    validation: {
      a: { level: "approved", via: ["pluvicto"] },
      b: { level: "approved", via: ["blinatumomab", "teclistamab"] }
    },
    score: {
      total: 70,
      burden: 26,
      worldDeaths: 397430,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT04740034",
        url: "https://clinicaltrials.gov/study/NCT04740034",
        date: "2021-02-05",
        quote: "This is a phase 1, open-label study evaluating the safety, clinical pharmacology and clinical activity of AMG 340, a PSMA x CD3 T-cell engaging bispecific antibody, in subjects with metastatic castrate-resistant prostate cancer (mCRPC) who have received 2 or more prior lines of therapy.",
        sponsor: "Amgen",
        note: "Amgen phase 1 of AMG 340, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1078-0432.ccr-23-2978",
        url: "https://doi.org/10.1158/1078-0432.ccr-23-2978",
        date: "2024-04-01",
        quote: "A Phase I Study of Acapatamab, a Half-life Extended, PSMA-Targeting Bispecific T-cell Engager for Metastatic Castration-Resistant Prostate Cancer.",
        sponsor: "Dorff T et al., Clinical cancer research : an official journal of the American Association for Cancer Research",
        note: "Phase 1 of acapatamab (AMG 160), Clinical Cancer Research 2024."
      }
    ],
    status: "clinical evidence",
    caveat: "Several PSMA x CD3 engagers reached the clinic and were stopped for cytokine release or limited activity; a new attempt needs a reason to differ, such as half-life extension, subcutaneous step-up dosing or pairing with the PSMA x CD28 costimulator.",
    decomposerMissed: [],
    refs: ["blinatumomab", "jnj-87189401", "pasritamig", "pluvicto", "teclistamab", "xaluritamig"],
    searched: {
      on: "2026-09-23",
      ctgov: ["PSMA AND CD3 AND (bispecific OR engager OR BiTE)"],
      europepmc: ["TITLE:\"PSMA\" AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\") AND ABSTRACT:\"prostate\""],
      patents: ["PSMA CD3 bispecific T cell engager prostate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd22-pbd-dimer",
    format: "adc",
    name: "CD22 ADC with a PBD dimer payload",
    components: { target: "cd22", payloadClass: "pbd-dimer-payloads" },
    targets: ["cd22"],
    cancers: ["all-leukemia", "dlbcl"],
    rationale: "CD22 is validated with a DNA-cleaving calicheamicin payload (inotuzumab-ozogamicin) and the PBD dimer class is validated on the neighbouring B-cell antigen CD19 (zynlonta). No corpus ADC pairs CD22 with a PBD dimer, even though the two DNA-damaging classes have different resistance mechanisms.",
    plausibilityNote: "CD22 internalises rapidly (inotuzumab-ozogamicin) and both calicheamicin and PBD are DNA-damaging payloads that kill non-dividing blasts; the liver toxicity of both classes (veno-occlusive disease with inotuzumab) is the shared risk.",
    validation: {
      a: { level: "approved", via: ["inotuzumab-ozogamicin"] },
      b: { level: "approved", via: ["zynlonta"] }
    },
    score: {
      total: 69,
      burden: 27,
      worldDeaths: 556084,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03698552",
        url: "https://clinicaltrials.gov/study/NCT03698552",
        date: "2018-10-09",
        quote: "This phase I/II trial studies the side effects and best dose of ADCT-602 in treating patients with B-cell lymphoblastic leukemia that has come back or does not respond to treatment.",
        sponsor: "M.D. Anderson Cancer Center",
        note: "Phase 1/2 at MD Anderson, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1535-7163.mct-23-0506",
        url: "https://doi.org/10.1158/1535-7163.mct-23-0506",
        date: "2024-04-01",
        quote: "ADCT-602, a Novel PBD Dimer-containing Antibody-Drug Conjugate for Treating CD22-positive Hematologic Malignancies.",
        sponsor: "Zammarchi F et al., Molecular cancer therapeutics",
        note: "Preclinical characterisation of the CD22 PBD dimer conjugate."
      }
    ],
    status: "clinical evidence",
    caveat: "Both payload classes damage liver sinusoids; a CD22 PBD ADC would need to show it does not reproduce the veno-occlusive disease seen with inotuzumab before transplant.",
    decomposerMissed: [],
    refs: ["inotuzumab-ozogamicin", "zynlonta"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD22 AND (pyrrolobenzodiazepine OR tesirine OR talirine OR PBD)"],
      europepmc: ["TITLE:\"CD22\" AND (ABSTRACT:\"pyrrolobenzodiazepine\" OR ABSTRACT:\"PBD dimer\")"],
      patents: ["CD22 pyrrolobenzodiazepine antibody drug conjugate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-nectin4-cd3",
    format: "bispecific",
    name: "Nectin-4 x CD3 bispecific",
    components: { targetA: "nectin4", targetB: "cd3" },
    targets: ["nectin4", "cd3"],
    cancers: ["urothelial", "tnbc"],
    rationale: "Nectin-4 is validated by an approved ADC (enfortumab-vedotin) and the CD3 arm by tarlatamab in solid tumours (tarlatamab). No corpus T-cell engager targets Nectin-4.",
    plausibilityNote: "Nectin-4 is dense in urothelial cancer with skin as the main normal site; bladder cancer responds to immunotherapy, so T cells are present, and enfortumab plus pembrolizumab already shows the antigen and immune activation can be combined.",
    validation: {
      a: { level: "approved", via: ["enfortumab-vedotin"] },
      b: { level: "approved", via: ["tarlatamab", "blinatumomab"] }
    },
    score: {
      total: 69,
      burden: 29,
      worldDeaths: 886699,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Skin expression of Nectin-4 would produce on-target dermatitis from an engager as it does from the ADC; whether that is tolerable at active doses is unknown.",
    decomposerMissed: [],
    refs: ["enfortumab-vedotin", "tarlatamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(Nectin-4 OR Nectin4) AND CD3 AND (bispecific OR engager)"],
      europepmc: ["(TITLE:\"Nectin-4\" OR TITLE:\"Nectin4\") AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\")"],
      patents: ["Nectin-4 CD3 bispecific T cell engager"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-nectin4-4-1bb",
    format: "car-t",
    name: "Nectin-4 CAR-T with 4-1BB costimulation",
    components: { target: "nectin4", costimulatoryDomain: "4-1bb" },
    targets: ["nectin4", "cd137"],
    cancers: ["urothelial", "tnbc"],
    rationale: "Nectin-4 is validated by an approved ADC (enfortumab-vedotin) and 4-1BB by most approved CAR-Ts (tisagenlecleucel). No corpus CAR-T targets Nectin-4.",
    plausibilityNote: "Nectin-4 is dense and fairly homogeneous in urothelial cancer, and its normal expression is mainly skin; the skin toxicity of enfortumab-vedotin shows the antigen is reachable there, so a CAR-T would need affinity tuning to spare keratinocytes.",
    validation: {
      a: { level: "approved", via: ["enfortumab-vedotin"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 69,
      burden: 29,
      worldDeaths: 886699,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT06724835",
        url: "https://clinicaltrials.gov/study/NCT06724835",
        date: "2024-12-09",
        quote: "Treating Nectin-4-positive Advanced Breast Cancer with XKDCT293 (Nectin-4-CAR-T)",
        sponsor: "Shenzhen Celconta Life Science Co., Ltd.",
        note: "Shenzhen Celconta phase 1 of a Nectin-4 CAR-T in breast cancer; status unknown at the time of the search."
      },
      {
        kind: "trial",
        source: "NCT07101549",
        url: "https://clinicaltrials.gov/study/NCT07101549",
        date: "2025-08-03",
        quote: "Treating Nectin-4-positive Advanced Solid Tumors With R-Star001 (Nectin-4-CART-IL18)",
        sponsor: "changjianhua",
        note: "Phase 1 of an IL-18-armoured Nectin-4 CAR-T, not yet recruiting."
      },
      {
        kind: "paper",
        source: "doi:10.1016/j.ymthe.2025.12.002",
        url: "https://doi.org/10.1016/j.ymthe.2025.12.002",
        date: "2025-12-04",
        quote: "On-target/off-tumor toxicities following infusion of low-affinity Nectin-4-specific CAR T cells.",
        sponsor: "Ma L et al., Molecular therapy : the journal of the American Society of Gene Therapy",
        note: "Clinical report of on-target, off-tumour toxicity after low-affinity Nectin-4 CAR-T, Molecular Therapy 2025: the skin risk in the caveat is documented."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41467-025-62710-0",
        url: "https://doi.org/10.1038/s41467-025-62710-0",
        date: "2025-09-10",
        quote: "Modulating the PPARγ pathway upregulates NECTIN4 and enhances chimeric antigen receptor (CAR) T cell therapy in bladder cancer.",
        sponsor: "Chang K et al., Nature communications",
        note: "Preclinical: PPAR-gamma modulation raises NECTIN4 and improves CAR-T activity in bladder cancer, Nature Communications 2025."
      }
    ],
    status: "clinical evidence",
    caveat: "Keratinocyte expression predicts skin toxicity worse than enfortumab's; whether affinity tuning can separate tumour from skin is the first preclinical question.",
    decomposerMissed: [],
    refs: ["enfortumab-vedotin", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(Nectin-4 OR Nectin4) AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["(TITLE:\"Nectin-4\" OR TITLE:\"Nectin4\") AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["Nectin-4 chimeric antigen receptor T cell"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-cd20-lutetium-177",
    format: "radioligand",
    name: "CD20 radioligand labelled with lutetium-177",
    components: { target: "cd20", isotope: "lutetium-177" },
    targets: ["cd20"],
    cancers: ["follicular-lymphoma", "dlbcl", "marginal-zone-lymphoma"],
    rationale: "CD20 is validated as a radioimmunotherapy target by an approved yttrium-90 conjugate (ibritumomab-tiuxetan) and lutetium-177 is the most validated therapeutic isotope in the corpus (pluvicto, lutathera). No corpus product pairs CD20 with lutetium-177, although the lutetium infrastructure built for prostate and neuroendocrine cancer now exists in most large centres.",
    plausibilityNote: "CD20 radioimmunotherapy is proven with yttrium-90 (ibritumomab-tiuxetan); lutetium-177's gamma emission allows dosimetry and its shorter beta range spares marrow, so it may revive a modality abandoned for logistics rather than efficacy.",
    validation: {
      a: { level: "approved", via: ["ibritumomab-tiuxetan", "rituximab"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 68,
      burden: 24,
      worldDeaths: 250679,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03806179",
        url: "https://clinicaltrials.gov/study/NCT03806179",
        date: "2019-01-16",
        quote: "This study is a Phase 1b, open-label, single arm dose escalation study of Betalutin followed by rituximab in patients with previously treated follicular lymphoma.",
        sponsor: "Nordic Nanovector",
        note: "Adjacent cell: Betalutin is a lutetium-177 anti-CD37 conjugate given after rituximab, not a CD20 conjugate; it shows the lutetium-177 lymphoma route has been walked.",
        adjacent: true
      }
    ],
    status: "no public evidence",
    caveat: "Radioimmunotherapy of lymphoma lost to rituximab combinations and bispecifics on convenience, not efficacy; a lutetium-177 CD20 agent would need a defined place, most plausibly consolidation in follicular lymphoma.",
    decomposerMissed: [],
    refs: ["ibritumomab-tiuxetan", "lutathera", "pluvicto"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(177Lu OR lutetium-177 OR Lu-177) AND (CD20 OR rituximab)"],
      europepmc: ["(TITLE:\"177Lu\" OR TITLE:\"lutetium-177\" OR TITLE:\"Lu-177\") AND (TITLE:\"CD20\" OR TITLE:\"rituximab\")"],
      patents: ["lutetium-177 anti-CD20 antibody radioimmunotherapy"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-psma-iodine-131",
    format: "radioligand",
    name: "PSMA radioligand labelled with iodine-131",
    components: { target: "psma", isotope: "iodine-131" },
    targets: ["psma"],
    cancers: ["prostate-mcrpc"],
    rationale: "PSMA is validated by an approved lutetium-177 radioligand (pluvicto) and iodine-131 is the oldest approved therapeutic isotope (radioactive-iodine, i131-mibg). No corpus product pairs PSMA with iodine-131, though the isotope's supply is independent of the reactor bottlenecks the corpus flags for lutetium and actinium (actinium-225-supply).",
    plausibilityNote: "Iodine-131 is cheap and reactor-independent of the lutetium supply chain (therapy-isotope-supply-chain), and its 8-day half-life suits slowly clearing ligands; the gamma emission and long marrow dose are the reasons lutetium is preferred.",
    validation: {
      a: { level: "approved", via: ["pluvicto"] },
      b: { level: "approved", via: ["radioactive-iodine", "i131-mibg"] }
    },
    score: {
      total: 68,
      burden: 26,
      worldDeaths: 397430,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03939689",
        url: "https://clinicaltrials.gov/study/NCT03939689",
        date: "2019-05-07",
        quote: "This clinical trial was done to show whether a radioactive drug (I-131-1095) that binds to prostate-specific membrane antigen (PSMA) is useful in treating metastatic prostate cancer that is positive for PSMA.",
        sponsor: "Progenics Pharmaceuticals, Inc.",
        note: "ARROW, randomised phase 2 of iodine-131 PSMA ligand plus enzalutamide, completed."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1078-0432.ccr-25-4948",
        url: "https://doi.org/10.1158/1078-0432.ccr-25-4948",
        date: "2026-05-01",
        quote: "<h4>Purpose</h4>The phase II ARROW study was designed to evaluate radioligand therapy (RLT) with 131I-LNTH-1095, an iodine-131-labeled small molecule targeting prostate-specific membrane antigen (PSMA), in combination with enzalutamide in subjects with metastatic castration-resistant prostate cancer after progression on prior abiraterone therapy.<h4>Patients and methods</h4>Men ≥18 years with PSMA-positive prostat...",
        sponsor: "Yu EY et al., Clinical cancer research : an official journal of the American Association for Cancer Research",
        note: "ARROW results, Clinical Cancer Research 2026."
      },
      {
        kind: "paper",
        source: "doi:10.1007/s00259-017-3665-9",
        url: "https://doi.org/10.1007/s00259-017-3665-9",
        date: "2017-03-09",
        quote: "Repeated PSMA-targeting radioligand therapy of metastatic prostate cancer with <sup>131</sup>I-MIP-1095.",
        sponsor: "Afshar-Oromieh A et al., European journal of nuclear medicine and molecular imaging",
        note: "Heidelberg series of repeated iodine-131 PSMA therapy."
      }
    ],
    status: "clinical evidence",
    caveat: "It would need to show equivalence to lutetium-177 with acceptable marrow dose and radiation-protection burden; the argument is access and cost in countries without lutetium supply rather than efficacy.",
    decomposerMissed: [],
    refs: ["actinium-225-supply", "i131-mibg", "pluvicto", "radioactive-iodine", "therapy-isotope-supply-chain"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(131I-MIP-1095 OR I-131-PSMA OR iodine-131 PSMA OR 131I-PSMA)"],
      europepmc: ["(TITLE:\"131I\" OR TITLE:\"iodine-131\" OR TITLE:\"I-131\") AND TITLE:\"PSMA\""],
      patents: ["iodine-131 PSMA ligand radiotherapy prostate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-psma-lead-212",
    format: "radioligand",
    name: "PSMA radioligand labelled with lead-212",
    components: { target: "psma", isotope: "lead-212" },
    targets: ["psma"],
    cancers: ["prostate-mcrpc"],
    rationale: "PSMA is validated by an approved radioligand (pluvicto) and lead-212 is in phase 2 on SSTR2 (alphamedix), while the corpus actinium-225 PSMA programmes are in phase 3 (aaa817, ac225-psma). No corpus product pairs PSMA with lead-212, an isotope whose generator supply avoids the actinium bottleneck the corpus records (actinium-225-supply).",
    plausibilityNote: "Lead-212's 10.6-hour half-life matches the fast kinetics of small PSMA ligands better than actinium-225's ten days, and it can be produced from generators (alpha-nanogenerators) rather than the scarce actinium supply; the short half-life makes distribution the hard part.",
    validation: {
      a: { level: "approved", via: ["pluvicto"] },
      b: { level: "phase-2", via: ["alphamedix"] }
    },
    score: {
      total: 68,
      burden: 26,
      worldDeaths: 397430,
      validationA: 15,
      validationB: 7,
      plausibility: 20
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05720130",
        url: "https://clinicaltrials.gov/study/NCT05720130",
        date: "2023-02-09",
        quote: "The Phase Ib portion of the study aims to determine the safety and tolerability of escalating doses of \\[212Pb\\]Pb-ADVC001 administered every 6, 4, 2 or 1 week(s) and establish the recommended phase 2 doses (RP2D).",
        sponsor: "AdvanCell Pty Limited",
        note: "AdvanCell phase 1b/2a TheraPb, recruiting."
      },
      {
        kind: "trial",
        source: "NCT07214961",
        url: "https://clinicaltrials.gov/study/NCT07214961",
        date: "2025-10-09",
        quote: "This Phase 1 study will evaluate the safety, tolerability, and preliminary effectiveness of AB001, an alpha-emitting radioligand targeting prostate-specific membrane antigen (PSMA), in patients with advanced prostate cancer who are either 177Lu-PSMA naïve or experienced.",
        sponsor: "ARTBIO Inc.",
        note: "ARTBIO phase 1 of lead-212 AB001, active."
      },
      {
        kind: "paper",
        source: "doi:10.1007/s00259-025-07330-y",
        url: "https://doi.org/10.1007/s00259-025-07330-y",
        date: "2025-05-21",
        quote: "The alpha-emitting radioligand [<sup>212</sup>Pb]Pb-AB001 could offer enhanced treatment by delivering high energy over a short range.",
        sponsor: "Høyvik AJK et al., European journal of nuclear medicine and molecular imaging",
        note: "Preclinical head-to-head of lead-212 AB001 against lutetium-177 PSMA-617."
      }
    ],
    status: "clinical evidence",
    caveat: "A 10.6-hour half-life means the dose must be made close to the patient; the proposal stands or falls on a distribution network, not on the biology.",
    decomposerMissed: [],
    refs: ["aaa817", "ac225-psma", "actinium-225-supply", "alpha-nanogenerators", "alphamedix", "pluvicto"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(212Pb OR lead-212 OR Pb-212) AND PSMA"],
      europepmc: ["(TITLE:\"212Pb\" OR TITLE:\"lead-212\" OR TITLE:\"Pb-212\") AND TITLE:\"PSMA\""],
      patents: ["lead-212 PSMA targeted alpha therapy"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-bcma-top1",
    format: "adc",
    name: "BCMA ADC with a topoisomerase-I payload",
    components: { target: "bcma", payloadClass: "topoisomerase-i-payloads" },
    targets: ["bcma"],
    cancers: ["multiple-myeloma"],
    rationale: "BCMA is validated across four formats in the corpus, including an ADC with a tubulin payload (belantamab-mafodotin), and the topoisomerase-I class is validated on solid-tumour antigens (trastuzumab-deruxtecan, sacituzumab-govitecan). No corpus ADC pairs BCMA with a topoisomerase-I payload, which would replace the ocular toxicity of MMAF with a different, better-understood profile.",
    plausibilityNote: "BCMA is plasma-cell restricted and internalises (belantamab-mafodotin); a permeable topoisomerase-I payload could avoid the corneal toxicity of MMAF, which is the dose-limiting problem of the approved BCMA ADC, but myeloma cells divide slowly, which blunts replication-dependent poisons.",
    validation: {
      a: { level: "approved", via: ["belantamab-mafodotin"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 67,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Topoisomerase-I poisons need replicating cells; the low proliferative index of myeloma may make this class less active than in solid tumours, so a preclinical comparison against belantamab is the first step.",
    decomposerMissed: [],
    refs: ["belantamab-mafodotin", "sacituzumab-govitecan", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["BCMA AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR TOP1)"],
      europepmc: ["TITLE:\"BCMA\" AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["BCMA antibody drug conjugate camptothecin topoisomerase"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd123-top1",
    format: "adc",
    name: "CD123 ADC with a topoisomerase-I payload",
    components: { target: "cd123", payloadClass: "topoisomerase-i-payloads" },
    targets: ["cd123"],
    cancers: ["aml", "bpdcn"],
    rationale: "CD123 is validated with a DNA-alkylating ADC (pivekimab-sunirine) and a toxin fusion (tagraxofusp), and the topoisomerase-I class is validated on many solid-tumour antigens (trastuzumab-deruxtecan). No corpus ADC pairs CD123 with a topoisomerase-I payload.",
    plausibilityNote: "CD123 is on leukaemic stem cells and internalises (pivekimab-sunirine, tagraxofusp); a topoisomerase-I payload would be less potent than the IGN alkylator and might widen the window against normal progenitors, at the cost of activity in quiescent stem cells.",
    validation: {
      a: { level: "approved", via: ["pivekimab-sunirine", "tagraxofusp"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 67,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1016/j.bmc.2016.09.043",
        url: "https://doi.org/10.1016/j.bmc.2016.09.043",
        date: "2016-09-17",
        quote: "Here, we designed and developed an antibody drug conjugate (CD123-CPT) by integrating anti-CD123 antibody with a chemotherapeutic agent, Camptothecin (CPT), via a disulfide linker.",
        sponsor: "Li B et al., Bioorganic & medicinal chemistry",
        note: "Preclinical: an anti-CD123 antibody conjugated to camptothecin through a disulfide linker."
      }
    ],
    status: "preclinical evidence",
    caveat: "Quiescent leukaemic stem cells are the therapeutic goal of CD123 targeting, and topoisomerase-I poisons act mainly on replicating cells; this construct may treat bulk disease but miss the stem cell pool.",
    decomposerMissed: [],
    refs: ["pivekimab-sunirine", "tagraxofusp", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD123 AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan)"],
      europepmc: ["TITLE:\"CD123\" AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\")"],
      patents: ["CD123 antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-cd123-cd3",
    format: "bispecific",
    name: "CD123 x CD3 bispecific",
    components: { targetA: "cd123", targetB: "cd3" },
    targets: ["cd123", "cd3"],
    cancers: ["aml", "bpdcn", "mds"],
    rationale: "CD123 is validated by an approved ADC (pivekimab-sunirine) and an approved toxin fusion (tagraxofusp), and the CD3 arm by blinatumomab (blinatumomab). No corpus T-cell engager targets CD123.",
    plausibilityNote: "CD123 covers leukaemic stem cells and is uniformly high in BPDCN, a disease where tagraxofusp already validates the antigen; capillary leak and cytokine release are the toxicities, and BPDCN's rarity limits trials.",
    validation: {
      a: { level: "approved", via: ["pivekimab-sunirine", "tagraxofusp"] },
      b: { level: "approved", via: ["blinatumomab"] }
    },
    score: {
      total: 67,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02152956",
        url: "https://clinicaltrials.gov/study/NCT02152956",
        date: "2014-06-02",
        quote: "Flotetuzumab in Primary Induction Failure (PIF) or Early Relapse (ER) Acute Myeloid Leukemia (AML)",
        sponsor: "MacroGenics",
        note: "MacroGenics phase 1/2 of flotetuzumab, terminated."
      },
      {
        kind: "trial",
        source: "NCT04158739",
        url: "https://clinicaltrials.gov/study/NCT04158739",
        date: "2019-11-12",
        quote: "This phase I trial studies the side effects, best dose of flotetuzumab and how well it works in treating patients with acute myeloid leukemia (AML) that has come back (recurrent) or has not responded to treatment (refractory).",
        sponsor: "Children's Oncology Group",
        note: "Children's Oncology Group phase 1 in paediatric AML, active."
      },
      {
        kind: "trial",
        source: "NCT05362773",
        url: "https://clinicaltrials.gov/study/NCT05362773",
        date: "2022-05-05",
        quote: "CP-MGD024-01 is a Phase 1, open-label, multi-center study of MGD024 as a single agent in participants with select blood cancers that have not responded to treatment with standard therapies or who have relapsed after treatment.",
        sponsor: "MacroGenics",
        note: "MacroGenics phase 1 of the next-generation CD123 x CD3 MGD024, active."
      }
    ],
    status: "clinical evidence",
    caveat: "Earlier CD123 x CD3 engagers showed activity mainly in a TP53-mutant subgroup and were limited by cytokine release; a new one would need to define its population first.",
    decomposerMissed: [],
    refs: ["blinatumomab", "pivekimab-sunirine", "tagraxofusp"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD123 AND CD3 AND (bispecific OR engager OR DART)"],
      europepmc: ["TITLE:\"CD123\" AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\" OR TITLE:\"DART\")"],
      patents: ["CD123 CD3 bispecific T cell engager"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-cd33-cd3",
    format: "bispecific",
    name: "CD33 x CD3 bispecific",
    components: { targetA: "cd33", targetB: "cd3" },
    targets: ["cd33", "cd3"],
    cancers: ["aml", "aml-older-unfit"],
    rationale: "CD33 is validated by an approved ADC (gemtuzumab-ozogamicin) and the CD3 arm by blinatumomab in the neighbouring lymphoid leukaemia (blinatumomab). No corpus T-cell engager targets a myeloid antigen, so the CD33 x CD3 cell is untried in the corpus.",
    plausibilityNote: "AML is the natural haematological extension of blinatumomab's success in ALL; the problems are low T-cell numbers in AML patients, myeloid-cell CD33 causing cytokine release, and the leukaemia's immunosuppressive niche.",
    validation: {
      a: { level: "approved", via: ["gemtuzumab-ozogamicin"] },
      b: { level: "approved", via: ["blinatumomab"] }
    },
    score: {
      total: 67,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03915379",
        url: "https://clinicaltrials.gov/study/NCT03915379",
        date: "2019-04-16",
        quote: "The main purpose of this study are to determine the recommended Phase 2 dose(s) (RP2D) route of administration, schedule and the maximum tolerated dose (MTD) in Part 1 and to determine the safety and tolerability of JNJ-67571244 at the RP2D regimen(s) and to evaluate the preliminary clinical activity of JNJ-67571244 in Part 2.",
        sponsor: "Janssen Research & Development, LLC",
        note: "Janssen phase 1 in relapsed AML and MDS, completed."
      },
      {
        kind: "trial",
        source: "NCT03516591",
        url: "https://clinicaltrials.gov/study/NCT03516591",
        date: "2018-05-04",
        quote: "An open label, Phase 1, study of AMV564 as monotherapy to assess the safety and efficacy in patients with Myelodysplastic Syndromes",
        sponsor: "Amphivena Therapeutics, Inc.",
        note: "Amphivena phase 1 of the bivalent CD33 x CD3 engager AMV564, completed."
      },
      {
        kind: "trial",
        source: "NCT05077423",
        url: "https://clinicaltrials.gov/study/NCT05077423",
        date: "2021-10-14",
        quote: "A Phase 1 Trial of CD33xCD3 BsAb in Pediatric Patients With Relapsed or Refractory Acute Myeloid Leukemia",
        sponsor: "Y-mAbs Therapeutics",
        note: "Y-mAbs paediatric phase 1, terminated."
      }
    ],
    status: "clinical evidence",
    caveat: "Several CD33 x CD3 engagers reached phase 1 with modest response rates and cytokine release; the case for a new one rests on half-life extension and use in measurable residual disease rather than bulk relapse.",
    decomposerMissed: [],
    refs: ["blinatumomab", "gemtuzumab-ozogamicin"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD33 AND CD3 AND (bispecific OR engager OR BiTE)"],
      europepmc: ["TITLE:\"CD33\" AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\") AND ABSTRACT:\"leukemia\""],
      patents: ["CD33 CD3 bispecific T cell engager leukemia"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-psma-4-1bb",
    format: "car-t",
    name: "PSMA CAR-T with 4-1BB costimulation",
    components: { target: "psma", costimulatoryDomain: "4-1bb" },
    targets: ["psma", "cd137"],
    cancers: ["prostate-mcrpc"],
    rationale: "PSMA is validated by an approved radioligand (pluvicto) and three phase-3 alpha emitters, and 4-1BB is the costimulatory domain of most approved CAR-Ts (tisagenlecleucel, lisocabtagene-maraleucel). No corpus CAR-T targets PSMA, although the corpus already flags armoured CAR designs for solid tumours (armored-car).",
    plausibilityNote: "PSMA is tumour-restricted enough for a radioligand, but prostate cancer's bone-marrow niche and TGF-beta-rich stroma suppress T cells; armoured constructs with dominant-negative TGF-beta receptors are the design that has reached patients.",
    validation: {
      a: { level: "approved", via: ["pluvicto"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 66,
      burden: 26,
      worldDeaths: 397430,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03089203",
        url: "https://clinicaltrials.gov/study/NCT03089203",
        date: "2017-03-24",
        quote: "This is a single center, single arm Phase I study to establish the safety and feasibility of intravenously administered lentivirally transduced dual PSMA-specific/TGFβ-resistant CAR modified autologous T cells (CART-PSMA-TGFβRDN cells) in patients with metastatic castrate resistant prostate cancer.",
        sponsor: "University of Pennsylvania",
        note: "University of Pennsylvania phase 1 of an armoured PSMA CAR-T with a dominant-negative TGF-beta receptor."
      },
      {
        kind: "trial",
        source: "NCT05489991",
        url: "https://clinicaltrials.gov/study/NCT05489991",
        date: "2022-08-05",
        quote: "An open-label, multi-center, Phase 1/2 study to determine the safety, tolerability, and feasibility of dosing adult patients with mCRPC with genetically modified autologous T-cells (TmPSMA-02) engineered to express a CAR capable of recognizing the tumor antigen prostate-specific membrane antigen (PSMA) and activating the T-cell.",
        sponsor: "Tceleron Therapeutics, Inc.",
        note: "Tceleron phase 1/2 of TmPSMA-02, terminated."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1078-0432.ccr-25-3052",
        url: "https://doi.org/10.1158/1078-0432.ccr-25-3052",
        date: "2026-08-01",
        quote: "Phase I Trial of P-PSMA-101 CAR T Cells in Patients with Metastatic Castration-Resistant Prostate Cancer.",
        sponsor: "Slovin SF et al., Clinical cancer research : an official journal of the American Association for Cancer Research",
        note: "Phase 1 of P-PSMA-101, Clinical Cancer Research 2026."
      }
    ],
    status: "clinical evidence",
    caveat: "An armoured PSMA CAR-T caused fatal toxicity in an early trial; the balance between enough potency to clear bone metastases and safety is unresolved.",
    decomposerMissed: [],
    refs: ["armored-car", "lisocabtagene-maraleucel", "pluvicto", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["PSMA AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["TITLE:\"PSMA\" AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["PSMA chimeric antigen receptor T cell prostate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd20-top1",
    format: "adc",
    name: "CD20 ADC with a topoisomerase-I payload",
    components: { target: "cd20", payloadClass: "topoisomerase-i-payloads" },
    targets: ["cd20"],
    cancers: ["dlbcl", "follicular-lymphoma", "mantle-cell-lymphoma", "cll"],
    rationale: "CD20 is the most validated B-cell antigen in the corpus across naked antibodies (rituximab, obinutuzumab), a radioconjugate (ibritumomab-tiuxetan) and four T-cell engagers (epcoritamab, glofitamab), yet no ADC. Topoisomerase-I payloads with acid-labile linkers release drug in the tumour microenvironment (sacituzumab-govitecan), which is the mechanism a non-internalising antigen would rely on.",
    plausibilityNote: "CD20 barely internalises, which is why no CD20 ADC exists despite four approved CD20 antibodies; a permeable topoisomerase-I payload released extracellularly (as sacituzumab-govitecan partly is) is the only route that makes sense, and it would be a delivery experiment as much as a drug.",
    validation: {
      a: { level: "approved", via: ["rituximab", "obinutuzumab", "ibritumomab-tiuxetan"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 65,
      burden: 27,
      worldDeaths: 556084,
      validationA: 15,
      validationB: 15,
      plausibility: 8
    },
    evidence: [],
    status: "no public evidence",
    caveat: "The whole proposal rests on extracellular payload release working at therapeutic levels; if it does not, CD20's lack of internalisation kills the idea, as it has for tubulin payloads.",
    decomposerMissed: [],
    refs: ["epcoritamab", "glofitamab", "ibritumomab-tiuxetan", "obinutuzumab", "rituximab", "sacituzumab-govitecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD20 AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan OR SN-38)"],
      europepmc: ["TITLE:\"CD20\" AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"SN-38\")"],
      patents: ["CD20 antibody drug conjugate camptothecin SN-38"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd33-pbd-dimer",
    format: "adc",
    name: "CD33 ADC with a PBD dimer payload",
    components: { target: "cd33", payloadClass: "pbd-dimer-payloads" },
    targets: ["cd33"],
    cancers: ["aml", "mds"],
    rationale: "CD33 is validated with a calicheamicin ADC (gemtuzumab-ozogamicin) and PBD dimers are validated on CD19 (zynlonta). The corpus has no CD33 PBD conjugate; a lower-DAR PBD could address the calicheamicin resistance driven by drug efflux in AML blasts.",
    plausibilityNote: "CD33 internalises and is myeloid-restricted, but it sits on normal myeloid progenitors, so any potent DNA-damaging payload will cause deep, prolonged cytopenias; the earlier CD33 PBD programme was stopped for that reason.",
    validation: {
      a: { level: "approved", via: ["gemtuzumab-ozogamicin"] },
      b: { level: "approved", via: ["zynlonta"] }
    },
    score: {
      total: 65,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02785900",
        url: "https://clinicaltrials.gov/study/NCT02785900",
        date: "2016-05-30",
        quote: "The purpose of this study in AML patients is to test whether vadastuximab talirine (SGN-CD33A; 33A) combined with either azacitidine or decitabine improves remission rates and extends overall survival as compared to placebo combined with either azacitidine or decitabine.",
        sponsor: "Seagen Inc.",
        note: "Phase 3 in older AML patients, terminated; the CD33 PBD cell was tried at scale and stopped."
      },
      {
        kind: "paper",
        source: "doi:10.1182/blood-2017-06-789800",
        url: "https://doi.org/10.1182/blood-2017-06-789800",
        date: "2017-12-01",
        quote: "Vadastuximab talirine (SGN-CD33A, 33A) is an antibody-drug conjugate consisting of pyrrolobenzodiazepine dimers linked to a monoclonal antibody targeting CD33, which is expressed in the majority of acute myeloid leukemia (AML) patients.",
        sponsor: "Stein EM et al., Blood",
        note: "Phase 1 monotherapy results."
      }
    ],
    status: "clinical evidence",
    caveat: "A CD33 PBD ADC would need a way round the myelosuppression that stopped the earlier attempt, for example as a bridge to transplant rather than a stand-alone therapy.",
    decomposerMissed: [],
    refs: ["gemtuzumab-ozogamicin", "zynlonta"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD33 AND (pyrrolobenzodiazepine OR talirine OR vadastuximab OR SGN-CD33A)"],
      europepmc: ["TITLE:\"CD33\" AND (ABSTRACT:\"pyrrolobenzodiazepine\" OR ABSTRACT:\"vadastuximab\")"],
      patents: ["CD33 pyrrolobenzodiazepine antibody drug conjugate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-gprc5d-top1",
    format: "adc",
    name: "GPRC5D ADC with a topoisomerase-I payload",
    components: { target: "gprc5d", payloadClass: "topoisomerase-i-payloads" },
    targets: ["gprc5d"],
    cancers: ["multiple-myeloma"],
    rationale: "GPRC5D is validated by an approved T-cell engager (talquetamab) and a phase-3 CAR-T (arlocabtagene-autoleucel), and the topoisomerase-I payload class is validated on many antigens (trastuzumab-deruxtecan). No corpus product delivers a cytotoxic payload to GPRC5D, which would give patients who have exhausted BCMA and CD3-engaging therapies an off-the-shelf option.",
    plausibilityNote: "GPRC5D is an orphan GPCR restricted to plasma cells and keratinised tissue (talquetamab); a payload delivered by an antibody would spare T-cell engagement toxicities but the receptor's internalisation rate is not established and myeloma proliferates slowly.",
    validation: {
      a: { level: "approved", via: ["talquetamab"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 65,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 15,
      plausibility: 14
    },
    evidence: [],
    status: "no public evidence",
    caveat: "GPRC5D is expressed in hair follicles, nails and tongue; an ADC would carry the same skin, nail and dysgeusia toxicity as talquetamab, and antigen loss after talquetamab is documented.",
    decomposerMissed: [],
    refs: ["arlocabtagene-autoleucel", "talquetamab", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["GPRC5D AND conjugate"],
      europepmc: ["TITLE:\"GPRC5D\" AND (ABSTRACT:\"antibody-drug conjugate\" OR ABSTRACT:\"ADC\")"],
      patents: ["GPRC5D antibody drug conjugate"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-cd123-4-1bb",
    format: "car-t",
    name: "CD123 CAR-T with 4-1BB costimulation",
    components: { target: "cd123", costimulatoryDomain: "4-1bb" },
    targets: ["cd123", "cd137"],
    cancers: ["aml", "bpdcn"],
    rationale: "CD123 is validated by an approved ADC (pivekimab-sunirine) and an approved toxin fusion (tagraxofusp), and 4-1BB by most approved CAR-Ts (tisagenlecleucel). No corpus CAR-T targets CD123.",
    plausibilityNote: "CD123 marks leukaemic stem cells and BPDCN uniformly, so the antigen is homogeneous; it is also on endothelium and normal progenitors, and capillary leak from CD123-directed agents (tagraxofusp) is the class toxicity to expect.",
    validation: {
      a: { level: "approved", via: ["pivekimab-sunirine", "tagraxofusp"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 65,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02623582",
        url: "https://clinicaltrials.gov/study/NCT02623582",
        date: "2015-12-07",
        quote: "Autologous Anti-CD 123 CAR TCR/4-1BB-expressing T-lymphocytes.",
        sponsor: "University of Pennsylvania",
        note: "University of Pennsylvania pilot of a CD123 CAR with 4-1BB costimulation, the exact cell, terminated."
      },
      {
        kind: "trial",
        source: "NCT04318678",
        url: "https://clinicaltrials.gov/study/NCT04318678",
        date: "2020-03-24",
        quote: "The CD123-CAR T-cell therapy is a new treatment that is being investigated for treatment of AML/myelodysplastic syndrome (MDS), T- or B- acute lymphoblastic leukemia (ALL) or blastic plasmacytoid dendritic cell neoplasia (BPDCN).",
        sponsor: "St. Jude Children's Research Hospital",
        note: "St Jude CATCHAML phase 1 in children, recruiting."
      },
      {
        kind: "trial",
        source: "NCT03203369",
        url: "https://clinicaltrials.gov/study/NCT03203369",
        date: "2017-06-29",
        quote: "A Phase 1 dose-finding study of Universal Chimeric Antigen Receptor T-cells targeting cluster of differentiation (CD) 123 (UCART123) administered intravenously to patients with relapsed or refractory Blastic Plasmacytoid Dendritic Cell Neoplasm (BPDCN), followed by a dose expansion phase in relapsed or refractory BPDCN patients or newly diagnosed BPDCN patients.",
        sponsor: "Cellectis S.A.",
        note: "Cellectis allogeneic UCART123 in BPDCN, terminated."
      }
    ],
    status: "clinical evidence",
    caveat: "Capillary leak and myeloablation are the expected toxicities; like CD33, this works best as a bridge to transplant or with a suicide switch.",
    decomposerMissed: [],
    refs: ["pivekimab-sunirine", "tagraxofusp", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD123 AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["TITLE:\"CD123\" AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["CD123 chimeric antigen receptor T cell"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-cd33-4-1bb",
    format: "car-t",
    name: "CD33 CAR-T with 4-1BB costimulation",
    components: { target: "cd33", costimulatoryDomain: "4-1bb" },
    targets: ["cd33", "cd137"],
    cancers: ["aml", "all-paediatric-relapsed"],
    rationale: "CD33 is validated by an approved ADC (gemtuzumab-ozogamicin) and 4-1BB by most approved CAR-Ts (tisagenlecleucel). No corpus CAR-T targets CD33, and the transplant-bridge design that would make it safe is already established for CD45 radioimmunotherapy (iomab-b).",
    plausibilityNote: "CD33 is on normal myeloid progenitors, so a persistent CD33 CAR-T causes marrow aplasia; the workable designs are a transient CAR (mRNA), a suicide switch, or CAR-T as a bridge to transplant with CD33-deleted donor stem cells.",
    validation: {
      a: { level: "approved", via: ["gemtuzumab-ozogamicin"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 65,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05672147",
        url: "https://clinicaltrials.gov/study/NCT05672147",
        date: "2023-01-05",
        quote: "This phase I trial tests the safety, side effects, and the best dose of anti-CD33 chimeric antigen receptor (CAR) T-Cell therapy in treating patients with acute myeloid leukemia that has come back (recurrent) or does not respond to treatment (refractory).",
        sponsor: "City of Hope Medical Center",
        note: "City of Hope phase 1 in relapsed AML, recruiting."
      },
      {
        kind: "trial",
        source: "NCT03971799",
        url: "https://clinicaltrials.gov/study/NCT03971799",
        date: "2019-06-03",
        quote: "This phase 1/2 trial aims to determine the safety and feasibility of antiCD33 chimeric antigen receptor (CAR) expressing T cells (CD33CART) in children and adolescents/young adults (AYAs) with relapsed/refractory acute myeloid leukemia (AML).",
        sponsor: "Center for International Blood and Marrow Transplant Research",
        note: "CIBMTR phase 1/2 of CD33CART in children and young adults, active."
      },
      {
        kind: "paper",
        source: "doi:10.1182/blood.2025031053",
        url: "https://doi.org/10.1182/blood.2025031053",
        date: "2026-04-01",
        quote: "A phase 1/2 study of donor-derived anti-CD33 CAR T-cell therapy (VCAR33) for relapsed/refractory AML after allogeneic HCT.",
        sponsor: "Mushtaq MU et al., Blood",
        note: "Phase 1/2 of donor-derived VCAR33 after allogeneic transplant, Blood 2026."
      },
      {
        kind: "paper",
        source: "doi:10.1182/bloodadvances.2024015016",
        url: "https://doi.org/10.1182/bloodadvances.2024015016",
        date: "2025-05-01",
        quote: "Protection of CD33-modified hematopoietic stem cell progeny from CD33-directed CAR T cells in rhesus macaques.",
        sponsor: "Petty NE et al., Blood advances",
        note: "Adjacent: shielding CD33-edited stem cells from CD33 CAR-T in primates, the transplant-paired design the caveat calls for.",
        adjacent: true
      }
    ],
    status: "clinical evidence",
    caveat: "Marrow aplasia is certain with a persistent CD33 CAR; the therapy only makes sense paired with a transplant plan or an off-switch.",
    decomposerMissed: [],
    refs: ["gemtuzumab-ozogamicin", "iomab-b", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD33 AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["TITLE:\"CD33\" AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["CD33 chimeric antigen receptor T cell leukemia"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "deg-estrogen-receptor-vhl",
    format: "degrader",
    name: "Estrogen receptor (ERα) degrader recruiting VHL",
    components: { target: "estrogen-receptor", e3Ligase: "vhl" },
    targets: ["estrogen-receptor"],
    cancers: ["breast-hr-positive", "hr-positive-metastatic-post-cdk46"],
    rationale: "The oestrogen receptor is the only target in the corpus with an approved heterobifunctional degrader (vepdegestrant) alongside approved SERDs (fulvestrant, elacestrant). All corpus degraders recruit cereblon, so an oestrogen receptor x VHL degrader is an untried cell on the E3 axis.",
    plausibilityNote: "The approved ER degrader (vepdegestrant) recruits cereblon; ESR1-mutant disease responds to it, but cereblon-pathway resistance would leave no degrader option, so a VHL-recruiting ER degrader is the natural second axis, and VHL now has a degrader in phase 3 on another target.",
    validation: {
      a: { level: "approved", via: ["vepdegestrant", "fulvestrant", "elacestrant"] },
      b: { level: "phase-3", via: [] }
    },
    score: {
      total: 65,
      burden: 28,
      worldDeaths: 666103,
      validationA: 15,
      validationB: 10,
      plausibility: 12
    },
    evidence: [
      {
        kind: "paper",
        source: "doi:10.1021/acsptsci.2c00109",
        url: "https://doi.org/10.1021/acsptsci.2c00109",
        date: "2022-10-12",
        quote: "Therefore, we designed a nucleic acid-conjugated PROTAC, ERE-PROTAC, via a click reaction, in which the ERE sequence recruits ERα and the typical small molecule VH032 recruits the von Hippel-Lindau (VHL) E3 ligase.",
        sponsor: "Zhang X et al., ACS pharmacology & translational science",
        note: "Preclinical: a VHL-recruiting PROTAC against the DNA-binding domain of ER-alpha, 2022."
      },
      {
        kind: "paper",
        source: "doi:10.1016/j.bmc.2023.117526",
        url: "https://doi.org/10.1016/j.bmc.2023.117526",
        date: "2023-11-08",
        quote: "Here, we designed a GSH-responsive ERα PROTAC, which is generated by conjugating an o-nitrobenzenesulfonyl group to the hydroxyl group of VHL-based ERα PROTAC through a nucleophilic substitution reaction.",
        sponsor: "Zhou Z et al., Bioorganic & medicinal chemistry",
        note: "Preclinical: glutathione-responsive ER-alpha PROTAC, 2023."
      }
    ],
    status: "preclinical evidence",
    caveat: "There is no clinical evidence yet that cereblon-pathway resistance limits vepdegestrant; the proposal is a hedge whose value depends on that resistance appearing.",
    decomposerMissed: [],
    refs: ["elacestrant", "fulvestrant", "vepdegestrant"],
    searched: {
      on: "2026-09-23",
      ctgov: ["estrogen receptor AND (degrader OR PROTAC) AND VHL"],
      europepmc: ["(TITLE:\"estrogen receptor\" OR TITLE:\"ERα\") AND (TITLE:\"degrader\" OR TITLE:\"PROTAC\") AND ABSTRACT:\"VHL\""],
      patents: ["estrogen receptor degrader VHL PROTAC breast cancer"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "deg-mdm2-cereblon",
    format: "degrader",
    name: "MDM2 degrader recruiting cereblon",
    components: { target: "mdm2", e3Ligase: "cereblon" },
    targets: ["mdm2", "cereblon"],
    cancers: ["aml", "liposarcoma", "mds"],
    rationale: "MDM2 is validated by inhibitors in phase 3 (brigimadlin) and cereblon by every approved degrader in the corpus (lenalidomide, vepdegestrant). No corpus degrader targets MDM2, though the feedback stabilisation that limits MDM2 inhibitors is a textbook case for degradation.",
    plausibilityNote: "MDM2 inhibitors free p53 but also stabilise MDM2 by feedback, blunting the response; a degrader removes MDM2 and the feedback with it, giving deeper p53 activation, at the price of the same on-target thrombocytopenia and gut toxicity.",
    validation: {
      a: { level: "phase-3", via: ["brigimadlin"] },
      b: { level: "approved", via: ["lenalidomide", "vepdegestrant"] }
    },
    score: {
      total: 64,
      burden: 25,
      worldDeaths: 305405,
      validationA: 10,
      validationB: 15,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05775406",
        url: "https://clinicaltrials.gov/study/NCT05775406",
        date: "2023-03-20",
        quote: "This Phase 1 study will evaluate the safety, tolerability, pharmacokinetics/pharmacodynamics (PK/PD), and clinical activity of KT-253 in adult patients with relapsed or refractory (R/R) high grade myeloid malignancies, acute lymphocytic leukemia (ALL), R/R lymphoma, myelofibrosis, and R/R solid tumors.",
        sponsor: "Kymera Therapeutics, Inc.",
        note: "Kymera phase 1 of the MDM2 degrader KT-253 in myeloid and lymphoid malignancies, completed; the record does not state the E3 ligase."
      },
      {
        kind: "paper",
        source: "doi:10.1038/s41375-026-02957-8",
        url: "https://doi.org/10.1038/s41375-026-02957-8",
        date: "2026-04-15",
        quote: "Activity of PROTAC MDM2 degrader in primary leukemia cells and PDX models.",
        sponsor: "Kandarpa M et al., Leukemia",
        note: "Preclinical: PROTAC MDM2 degrader in primary leukaemia cells and xenografts, Leukemia 2026."
      }
    ],
    status: "clinical evidence",
    caveat: "Thrombocytopenia and gut toxicity from p53 activation in normal tissue limited MDM2 inhibitors; a degrader that activates p53 harder may hit the same wall unless dosed intermittently.",
    decomposerMissed: [],
    refs: ["brigimadlin", "lenalidomide", "vepdegestrant"],
    searched: {
      on: "2026-09-23",
      ctgov: ["MDM2 AND (degrader OR PROTAC OR KT-253)"],
      europepmc: ["TITLE:\"MDM2\" AND (TITLE:\"degrader\" OR TITLE:\"PROTAC\")"],
      patents: ["MDM2 degrader cereblon PROTAC"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-cd33-actinium-225",
    format: "radioligand",
    name: "CD33 radioligand labelled with actinium-225",
    components: { target: "cd33", isotope: "actinium-225" },
    targets: ["cd33"],
    cancers: ["aml", "aml-older-unfit"],
    rationale: "CD33 is validated by an approved ADC (gemtuzumab-ozogamicin) and actinium-225 is in phase 3 on PSMA and SSTR2 (aaa817, ryz101). No corpus product pairs CD33 with an alpha emitter, though the corpus already carries a CD45 iodine-131 antibody as transplant conditioning (iomab-b) showing the marrow-targeted radioimmunotherapy route is workable.",
    plausibilityNote: "CD33 is on most AML blasts and alpha particles kill without needing internalisation or cell division, which suits quiescent blasts and low antigen density; marrow toxicity is the design constraint and a transplant-conditioning use is the natural fit (iomab-b uses the same logic with CD45).",
    validation: {
      a: { level: "approved", via: ["gemtuzumab-ozogamicin"] },
      b: { level: "phase-3", via: ["aaa817", "ryz101"] }
    },
    score: {
      total: 64,
      burden: 25,
      worldDeaths: 305405,
      validationA: 15,
      validationB: 10,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT02575963",
        url: "https://clinicaltrials.gov/study/NCT02575963",
        date: "2015-10-15",
        quote: "Establish the MTD of fractionated doses of Lintuzumab-Ac225 in combination with low dose cytosine arabinoside (Low Dose Ara-C, LDAC) (Phase 1 portion) 2.",
        sponsor: "Actinium Pharmaceuticals",
        note: "Actinium Pharmaceuticals phase 1/2 in older AML patients, completed."
      },
      {
        kind: "trial",
        source: "NCT06888323",
        url: "https://clinicaltrials.gov/study/NCT06888323",
        date: "2025-03-21",
        quote: "This phase I trial tests the safety, side effects and best dose of lintuzumab-Ac225 for the treatment of patients with high risk myelodysplastic syndrome that has not responded to previous treatment (refractory).",
        sponsor: "National Cancer Institute (NCI)",
        note: "NCI phase 1 in high-risk MDS, suspended at the time of the search."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1078-0432.ccr-21-3712",
        url: "https://doi.org/10.1158/1078-0432.ccr-21-3712",
        date: "2022-05-01",
        quote: "<h4>Purpose</h4>The anti-CD33 antibody lintuzumab has modest activity against acute myeloid leukemia (AML).",
        sponsor: "Rosenblat TL et al., Clinical cancer research : an official journal of the American Association for Cancer Research",
        note: "Clinical results, Clinical Cancer Research 2022."
      }
    ],
    status: "clinical evidence",
    caveat: "The place for this agent is probably conditioning before transplant or a bridge to it; as a stand-alone therapy in unfit older patients, cytopenias would compete with the disease.",
    decomposerMissed: [],
    refs: ["aaa817", "gemtuzumab-ozogamicin", "iomab-b", "ryz101"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(225Ac OR actinium-225 OR Ac-225) AND (CD33 OR lintuzumab)"],
      europepmc: ["(TITLE:\"225Ac\" OR TITLE:\"actinium-225\" OR TITLE:\"Ac-225\") AND (TITLE:\"CD33\" OR TITLE:\"lintuzumab\")"],
      patents: ["actinium-225 lintuzumab CD33 leukemia"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-cd38-top1",
    format: "adc",
    name: "CD38 ADC with a topoisomerase-I payload",
    components: { target: "cd38", payloadClass: "topoisomerase-i-payloads" },
    targets: ["cd38"],
    cancers: ["multiple-myeloma"],
    rationale: "CD38 is validated by two approved antibodies (daratumumab, isatuximab) and the corpus holds a CD38 ADC with a tubulin payload in phase 2 (sti-6129), but no CD38 topoisomerase-I ADC. Topoisomerase-I payloads are the best-validated ADC class (trastuzumab-deruxtecan, sacituzumab-govitecan) and could act on daratumumab-refractory disease that still expresses the antigen.",
    plausibilityNote: "CD38 is expressed at high density on myeloma cells and internalises slowly, which suits a permeable payload with bystander killing; the antigen is also on NK cells and red-cell precursors, so haematological toxicity is the expected limit.",
    validation: {
      a: { level: "approved", via: ["daratumumab", "isatuximab"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 63,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Most relapsed myeloma patients have received daratumumab, which down-regulates CD38 for months; the ADC would need antigen to remain, and the low proliferation of myeloma cells may blunt a replication-dependent payload.",
    decomposerMissed: [],
    refs: ["daratumumab", "isatuximab", "sacituzumab-govitecan", "sti-6129", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD38 AND conjugate AND (topoisomerase OR camptothecin OR exatecan OR deruxtecan)"],
      europepmc: ["TITLE:\"CD38\" AND ABSTRACT:\"antibody-drug conjugate\" AND (ABSTRACT:\"topoisomerase\" OR ABSTRACT:\"camptothecin\" OR ABSTRACT:\"exatecan\")"],
      patents: ["CD38 antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-bcma-cd28",
    format: "car-t",
    name: "BCMA CAR-T with CD28 costimulation",
    components: { target: "bcma", costimulatoryDomain: "cd28" },
    targets: ["bcma", "cd28"],
    cancers: ["multiple-myeloma", "myeloma-relapsed-refractory"],
    rationale: "BCMA is validated by two approved 4-1BB CAR-Ts (idecabtagene-vicleucel, ciltacabtagene-autoleucel) and the CD28 costimulatory domain by two approved CD19 CAR-Ts (axicabtagene-ciloleucel, brexucabtagene-autoleucel). No corpus BCMA CAR-T uses CD28 costimulation, so the cell is untried in the corpus.",
    plausibilityNote: "Every approved BCMA CAR-T uses 4-1BB (idecabtagene-vicleucel, ciltacabtagene-autoleucel); CD28 gives faster, stronger expansion (axicabtagene-ciloleucel) but shorter persistence and more cytokine release, and myeloma relapses are often late, where persistence matters.",
    validation: {
      a: { level: "approved", via: ["idecabtagene-vicleucel", "ciltacabtagene-autoleucel"] },
      b: { level: "approved", via: ["axicabtagene-ciloleucel", "brexucabtagene-autoleucel"] }
    },
    score: {
      total: 63,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03318861",
        url: "https://clinicaltrials.gov/study/NCT03318861",
        date: "2017-10-24",
        quote: "The primary objective of the study is to evaluate the safety and tolerability of KITE-585, an autologous engineered chimeric antigen receptor (CAR) T-cell product targeting a protein commonly found on myeloma cells called B-cell maturation antigen (BCMA), as measured by the incidence of dose-limiting toxicities (DLTs).",
        sponsor: "Kite, A Gilead Company",
        note: "Kite phase 1 of KITE-585, a BCMA CAR-T, terminated; this is the earlier attempt the caveat refers to."
      },
      {
        kind: "paper",
        source: "MED:34249462",
        url: "https://europepmc.org/article/MED/34249462",
        date: "2021-06-15",
        quote: "A phase 1, multicenter study evaluating the safety and efficacy of KITE-585, an autologous anti-BCMA CAR T-cell therapy, in patients with relapsed/refractory multiple myeloma.",
        sponsor: "Cornell RF et al., American journal of cancer research",
        note: "Phase 1 results for KITE-585, American Journal of Cancer Research 2021."
      }
    ],
    status: "clinical evidence",
    caveat: "An earlier CD28 BCMA CAR-T was stopped after phase 1; whether that reflected the domain, the binder or the era's manufacturing is the question to settle before repeating it.",
    decomposerMissed: [],
    refs: ["axicabtagene-ciloleucel", "brexucabtagene-autoleucel", "ciltacabtagene-autoleucel", "idecabtagene-vicleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["BCMA AND CAR AND CD28", "KITE-585"],
      europepmc: ["TITLE:\"BCMA\" AND TITLE:\"CAR\" AND ABSTRACT:\"CD28\" AND ABSTRACT:\"costimulat\"", "(TITLE:\"KITE-585\" OR ABSTRACT:\"KITE-585\") OR (TITLE:\"BCMA\" AND TITLE:\"CAR\" AND ABSTRACT:\"CD28 costimulatory\")"],
      patents: ["BCMA chimeric antigen receptor CD28 costimulatory domain"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-gprc5d-lutetium-177",
    format: "radioligand",
    name: "GPRC5D radioligand labelled with lutetium-177",
    components: { target: "gprc5d", isotope: "lutetium-177" },
    targets: ["gprc5d"],
    cancers: ["multiple-myeloma"],
    rationale: "GPRC5D is validated by an approved T-cell engager (talquetamab) and lutetium-177 by two approved radioligands (pluvicto, lutathera). No corpus product pairs GPRC5D with a radionuclide, although its restricted expression is the property that made SSTR2 a good radioligand target.",
    plausibilityNote: "GPRC5D is a GPCR restricted to plasma cells and keratinised tissue, the same target class as SSTR2 that made lutathera possible; myeloma is radiosensitive, but no small-molecule or peptide GPRC5D ligand is known, so the carrier would have to be an antibody fragment.",
    validation: {
      a: { level: "approved", via: ["talquetamab"] },
      b: { level: "approved", via: ["pluvicto", "lutathera"] }
    },
    score: {
      total: 63,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Without a small ligand, an antibody-fragment carrier and its kidney retention are the engineering problems; and the hair, nail and tongue expression that gives talquetamab its toxicity would receive radiation too.",
    decomposerMissed: [],
    refs: ["lutathera", "pluvicto", "talquetamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["GPRC5D AND (177Lu OR lutetium OR radioligand OR radiopharmaceutical OR 225Ac)"],
      europepmc: ["TITLE:\"GPRC5D\" AND (ABSTRACT:\"177Lu\" OR ABSTRACT:\"radioligand\" OR ABSTRACT:\"radionuclide\" OR ABSTRACT:\"radioimmunotherapy\" OR ABSTRACT:\"PET\")"],
      patents: ["GPRC5D radioligand radionuclide"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "bs-cd38-cd3",
    format: "bispecific",
    name: "CD38 x CD3 bispecific",
    components: { targetA: "cd38", targetB: "cd3" },
    targets: ["cd38", "cd3"],
    cancers: ["multiple-myeloma", "myeloma-relapsed-refractory"],
    rationale: "CD38 is validated by two approved antibodies (daratumumab, isatuximab) and the CD3 arm by three approved myeloma engagers (teclistamab, elranatamab, talquetamab). The corpus has a trispecific that includes CD38 (isb-2001) but no CD38 x CD3 bispecific.",
    plausibilityNote: "Myeloma engagers against BCMA and GPRC5D work, and CD38 is dense on plasma cells; but CD38 is on activated T cells and NK cells, so an engager would attack its own effectors, and the corpus already holds a BCMA x CD38 x CD3 trispecific (isb-2001) that uses CD38 as an avidity arm.",
    validation: {
      a: { level: "approved", via: ["daratumumab", "isatuximab"] },
      b: { level: "approved", via: ["teclistamab", "elranatamab", "talquetamab"] }
    },
    score: {
      total: 61,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05011097",
        url: "https://clinicaltrials.gov/study/NCT05011097",
        date: "2021-08-18",
        quote: "The main purpose of this Phase I study is to access the safety and tolerability of Y150 at different dose levels.",
        sponsor: "Wuhan YZY Biopharma Co., Ltd.",
        note: "Wuhan YZY Biopharma phase 1 of Y150 in relapsed myeloma, completed."
      },
      {
        kind: "paper",
        source: "doi:10.1182/blood.2022019451",
        url: "https://doi.org/10.1182/blood.2022019451",
        date: "2023-07-01",
        quote: "Preclinical characterization of ISB 1342, a CD38 × CD3 T-cell engager for relapsed/refractory multiple myeloma.",
        sponsor: "Pouleau B et al., Blood",
        note: "Preclinical characterisation of ISB 1342, a CD38 x CD3 engager, Blood 2023."
      },
      {
        kind: "paper",
        source: "doi:10.1111/bjh.19784",
        url: "https://doi.org/10.1111/bjh.19784",
        date: "2024-09-22",
        quote: "A CD38/CD3xCD28 trispecific T-cell engager as a potentially active agent in multiple myeloma patients relapsed and/or refractory to anti-CD38 monoclonal antibodies.",
        sponsor: "Zabaleta A et al., British journal of haematology",
        note: "Adjacent: a CD38/CD3 x CD28 trispecific, the avidity design the plausibility note expects to be needed.",
        adjacent: true
      }
    ],
    status: "clinical evidence",
    caveat: "An earlier CD38 x CD3 was stopped after phase 1, and CD38 on T cells makes fratricide a structural problem; the trispecific route, where CD38 adds avidity rather than being the sole target, may be the only viable form.",
    decomposerMissed: [],
    refs: ["daratumumab", "elranatamab", "isatuximab", "isb-2001", "talquetamab", "teclistamab"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD38 AND CD3 AND (bispecific OR engager)", "ISB 1342 OR GBR 1342"],
      europepmc: ["TITLE:\"CD38\" AND (TITLE:\"CD3\" OR TITLE:\"T-cell engager\" OR TITLE:\"bispecific\") AND ABSTRACT:\"myeloma\"", "(ABSTRACT:\"Y150\" AND ABSTRACT:\"CD38\") OR (TITLE:\"ISB 1342\" OR ABSTRACT:\"ISB 1342\")"],
      patents: ["CD38 CD3 bispecific T cell engager myeloma"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-cd38-4-1bb",
    format: "car-t",
    name: "CD38 CAR-T with 4-1BB costimulation",
    components: { target: "cd38", costimulatoryDomain: "4-1bb" },
    targets: ["cd38", "cd137"],
    cancers: ["multiple-myeloma", "peripheral-t-cell-lymphoma"],
    rationale: "CD38 is validated by two approved antibodies (daratumumab, isatuximab) and 4-1BB by most approved CAR-Ts (tisagenlecleucel). No corpus CAR-T targets CD38, which would offer an autologous option after BCMA and GPRC5D antigen loss.",
    plausibilityNote: "CD38 is on activated T cells themselves, so a CD38 CAR-T risks fratricide during manufacturing unless CD38 is knocked out; affinity-tuned CARs that spare CD38-low normal cells have been described.",
    validation: {
      a: { level: "approved", via: ["daratumumab", "isatuximab"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 66,
      burden: 26,
      worldDeaths: 372067,
      validationA: 15,
      validationB: 15,
      plausibility: 10
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT03767751",
        url: "https://clinicaltrials.gov/study/NCT03767751",
        date: "2018-12-07",
        quote: "CAR-T cell therapy has shown promising results for the treatment of relapsed or refractory Multiple Myeloma,however, a subset of patients relapse due to the loss of target in tumor cells.Dual Specificity CD38 and BCMA CAR-T cells can recognize and kill the malignant cells through recognition of CD38 or BCMA.",
        sponsor: "Chinese PLA General Hospital",
        note: "Chinese PLA General Hospital phase 1/2 of a dual CD38 and BCMA CAR-T; status unknown at the time of the search."
      },
      {
        kind: "paper",
        source: "doi:10.3389/fonc.2026.1744250",
        url: "https://doi.org/10.3389/fonc.2026.1744250",
        date: "2026-04-29",
        quote: "Efficacy and safety of CD38-directed CAR-T cell therapy for multiple myeloma: a systematic review and meta-analysis.",
        sponsor: "Xu X et al., Frontiers in oncology",
        note: "Systematic review and meta-analysis of CD38-directed CAR-T in myeloma, 2026, so several clinical series exist."
      },
      {
        kind: "paper",
        source: "doi:10.3324/haematol.2025.289016",
        url: "https://doi.org/10.3324/haematol.2025.289016",
        date: "2025-12-24",
        quote: "Allo-defensive, multiplex base-edited, anti-CD38 CAR T cells for 'off-the-shelf' immunotherapy.",
        sponsor: "Preece R et al., Haematologica",
        note: "Preclinical: base-edited allogeneic CD38 CAR-T that avoids fratricide, Haematologica 2025."
      }
    ],
    status: "clinical evidence",
    caveat: "Fratricide and CD38 expression on NK cells and red-cell precursors are the obstacles; a CD38-knockout T-cell product is the likely requirement.",
    decomposerMissed: [],
    refs: ["daratumumab", "isatuximab", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD38 AND (CAR-T OR \"chimeric antigen receptor\")"],
      europepmc: ["TITLE:\"CD38\" AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["CD38 chimeric antigen receptor T cell myeloma"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "adc-gd2-top1",
    format: "adc",
    name: "GD2 (disialoganglioside) ADC with a topoisomerase-I payload",
    components: { target: "gd2", payloadClass: "topoisomerase-i-payloads" },
    targets: ["gd2"],
    cancers: ["neuroblastoma", "neuroblastoma-high-risk", "osteosarcoma", "melanoma"],
    rationale: "GD2 is validated by two approved antibodies in neuroblastoma (dinutuximab, naxitamab) and topoisomerase-I payloads are the best-validated ADC class (trastuzumab-deruxtecan); the corpus has no GD2 ADC of any payload class. Children with relapsed neuroblastoma receive irinotecan and temozolomide as standard, so a GD2-directed camptothecin would concentrate a drug already known to be active.",
    plausibilityNote: "GD2 is a glycolipid, not a protein, and internalises poorly; its expression on peripheral nerves causes the pain of dinutuximab, which a cytotoxic payload could worsen. A bystander-capable payload released near the cell is the only plausible design.",
    validation: {
      a: { level: "approved", via: ["dinutuximab", "naxitamab"] },
      b: { level: "approved", via: ["trastuzumab-deruxtecan"] }
    },
    score: {
      total: 60,
      burden: 18,
      worldDeaths: 58667,
      validationA: 15,
      validationB: 15,
      plausibility: 12
    },
    evidence: [],
    status: "no public evidence",
    caveat: "Poor internalisation of a glycolipid antigen and on-nerve expression are two serious objections; preclinical proof that payload reaches tumour without nerve toxicity is needed before any child is dosed.",
    decomposerMissed: [],
    refs: ["dinutuximab", "naxitamab", "trastuzumab-deruxtecan"],
    searched: {
      on: "2026-09-23",
      ctgov: ["GD2 AND conjugate AND (topoisomerase OR camptothecin OR SN-38 OR irinotecan)"],
      europepmc: ["TITLE:\"GD2\" AND (ABSTRACT:\"antibody-drug conjugate\" OR ABSTRACT:\"immunoconjugate\") AND (ABSTRACT:\"camptothecin\" OR ABSTRACT:\"SN-38\" OR ABSTRACT:\"topoisomerase\")"],
      patents: ["GD2 antibody drug conjugate camptothecin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "car-cd30-4-1bb",
    format: "car-t",
    name: "CD30 CAR-T with 4-1BB costimulation",
    components: { target: "cd30", costimulatoryDomain: "4-1bb" },
    targets: ["cd30", "cd137"],
    cancers: ["relapsed-refractory-hodgkin-lymphoma", "hodgkin-lymphoma", "peripheral-t-cell-lymphoma"],
    rationale: "CD30 is validated by an approved ADC (brentuximab-vedotin) and 4-1BB by most approved CAR-Ts (tisagenlecleucel). The corpus holds a CD30 CAR-NK in phase 2 (eb-car30-nk) but no CD30 CAR-T.",
    plausibilityNote: "CD30 is restricted to activated lymphocytes and Reed-Sternberg cells, so normal-tissue toxicity is low; the obstacle is the Hodgkin microenvironment, which excludes T cells, and the small number of patients who fail brentuximab and checkpoint blockade.",
    validation: {
      a: { level: "approved", via: ["brentuximab-vedotin"] },
      b: { level: "approved", via: ["tisagenlecleucel"] }
    },
    score: {
      total: 70,
      burden: 24,
      worldDeaths: 273412,
      validationA: 15,
      validationB: 15,
      plausibility: 16
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT04268706",
        url: "https://clinicaltrials.gov/study/NCT04268706",
        date: "2020-02-13",
        quote: "This is a two-part, Phase 2, multicenter, open-label, single arm study to evaluate the safety and efficacy of autologous CD30.CAR-T in adult and pediatric subjects with relapsed or refractory CD30+ classical Hodgkin Lymphoma.",
        sponsor: "Tessa Therapeutics",
        note: "Tessa Therapeutics phase 2 (CHARIOT) in relapsed Hodgkin lymphoma, active."
      },
      {
        kind: "trial",
        source: "NCT06090864",
        url: "https://clinicaltrials.gov/study/NCT06090864",
        date: "2023-10-19",
        quote: "ATLCAR.CD30.CCR4 for CD30+ HL ATLCAR.CD30.CCR4 Cells",
        sponsor: "UNC Lineberger Comprehensive Cancer Center",
        note: "UNC phase 1/2 of a CCR4-armoured CD30 CAR-T, the trafficking design the caveat asks for, recruiting."
      },
      {
        kind: "paper",
        source: "doi:10.1158/1078-0432.ccr-26-1292",
        url: "https://doi.org/10.1158/1078-0432.ccr-26-1292",
        date: "2026-07-22",
        quote: "Long-term follow-up of third generation anti-CD30 CAR T-cell therapy in relapsed/refractory CD30+ lymphomas: a single-arm, multicentre, phase 1-2 trial.",
        sponsor: "Wang X et al., Clinical cancer research : an official journal of the American Association for Cancer Research",
        note: "Long-term follow-up of a third-generation CD30 CAR-T, Clinical Cancer Research 2026."
      }
    ],
    status: "clinical evidence",
    caveat: "The population that needs it is small and the Hodgkin microenvironment resists T-cell infiltration; a CCR4-armoured design may be required for cells to reach the tumour.",
    decomposerMissed: [],
    refs: ["brentuximab-vedotin", "eb-car30-nk", "tisagenlecleucel"],
    searched: {
      on: "2026-09-23",
      ctgov: ["CD30 AND (CAR-T OR \"chimeric antigen receptor\") AND Hodgkin"],
      europepmc: ["TITLE:\"CD30\" AND (TITLE:\"CAR T\" OR TITLE:\"CAR-T\" OR TITLE:\"chimeric antigen receptor\")"],
      patents: ["CD30 chimeric antigen receptor T cell Hodgkin"]
    },
    asOf: "2026-09-23"
  },
  {
    id: "rl-cd38-actinium-225",
    format: "radioligand",
    name: "CD38 radioligand labelled with actinium-225",
    components: { target: "cd38", isotope: "actinium-225" },
    targets: ["cd38"],
    cancers: ["multiple-myeloma"],
    rationale: "CD38 is validated by two approved antibodies (daratumumab, isatuximab) and actinium-225 is in phase 3 on two other targets (aaa817, ryz101). No corpus product pairs CD38 with a therapeutic radionuclide, although the antigen's density and the radiosensitivity of plasma cells make it a natural radioimmunotherapy target.",
    plausibilityNote: "Myeloma is radiosensitive and CD38 is dense on plasma cells; an alpha emitter's 2-3 cell range suits marrow-infiltrating disease, but CD38 on NK cells and the long antibody half-life mean marrow toxicity is the limit, as with any haematological radioimmunotherapy.",
    validation: {
      a: { level: "approved", via: ["daratumumab", "isatuximab"] },
      b: { level: "phase-3", via: ["aaa817", "ryz101"] }
    },
    score: {
      total: 60,
      burden: 21,
      worldDeaths: 121388,
      validationA: 15,
      validationB: 10,
      plausibility: 14
    },
    evidence: [
      {
        kind: "trial",
        source: "NCT05363111",
        url: "https://clinicaltrials.gov/study/NCT05363111",
        date: "2022-05-05",
        quote: "This phase I trial tests the safety, side effects, and best dose of actinium Ac 225-DOTA-daratumumab (225Ac-DOTA-daratumumab) in combination with daratumumab and indium In 111-DOTA-daratumumab (111In-DOTA-daratumumab) in treating patients with multiple myeloma that does not respond to treatment (refractory) or that has come back (recurrent).",
        sponsor: "City of Hope Medical Center",
        note: "City of Hope phase 1 of actinium-225 DOTA-daratumumab in relapsed myeloma, recruiting."
      },
      {
        kind: "trial",
        source: "NCT06287944",
        url: "https://clinicaltrials.gov/study/NCT06287944",
        date: "2024-03-01",
        quote: "Actinium Ac 225-DOTA-daratumumab combined with fludarabine, melphalan and TMLI may be safe, tolerable, and/or effective as conditioning treatment for donor stem cell transplant in patients with high-risk AML, ALL, and MDS.",
        sponsor: "City of Hope Medical Center",
        note: "City of Hope phase 1 using the same conjugate as transplant conditioning, recruiting."
      },
      {
        kind: "paper",
        source: "doi:10.1101/2024.11.01.621584",
        url: "https://doi.org/10.1101/2024.11.01.621584",
        date: "2024-11-03",
        quote: "Targeted Alpha Therapy with [ <sup>225</sup> Ac]Ac-Macropa-Isatuximab for CD38-positive Hematological Malignancies",
        sponsor: "Alvarez NH et al.",
        note: "Preprint: actinium-225 isatuximab conjugate, preclinical."
      }
    ],
    status: "clinical evidence",
    caveat: "Daratumumab pre-treatment lowers CD38 on residual cells and free daratumumab in serum would compete for the antigen; timing after antibody washout is a prerequisite for any dose to reach tumour.",
    decomposerMissed: [],
    refs: ["aaa817", "daratumumab", "isatuximab", "ryz101"],
    searched: {
      on: "2026-09-23",
      ctgov: ["(225Ac OR actinium-225 OR Ac-225) AND (CD38 OR daratumumab)"],
      europepmc: ["(TITLE:\"225Ac\" OR TITLE:\"actinium-225\" OR TITLE:\"Ac-225\" OR TITLE:\"alpha\") AND (TITLE:\"CD38\" OR TITLE:\"daratumumab\") AND ABSTRACT:\"myeloma\""],
      patents: ["actinium-225 anti-CD38 antibody myeloma"]
    },
    asOf: "2026-09-23"
  }
];

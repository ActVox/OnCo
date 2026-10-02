/**
 * Europe PMC query builders (REST search API, CORS-open, no key).
 * https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=...&format=json&resultType=lite&sort=P_PDATE_D desc
 *
 * Shared by the client LatestPapers component and the weekly snapshot script.
 */
import type { Entity } from "./schema";

export const EPMC_REST = "https://www.ebi.ac.uk/europepmc/webservices/rest/search";
export const EPMC_SEARCH = "https://europepmc.org/search";

const ONCO = "(cancer OR tumor OR tumour OR oncology OR carcinoma OR lymphoma OR leukemia OR leukaemia OR myeloma OR sarcoma OR melanoma OR glioma)";

const q = (s: string) => `"${s.replace(/"/g, "").trim()}"`;
const inTitleAbstract = (terms: string[]) => "(" + terms.map((t) => `TITLE:${q(t)} OR ABSTRACT:${q(t)}`).join(" OR ") + ")";

/** Curated queries for technologies whose names alone are too vague or too broad. */
export const TECH_QUERIES: Record<string, string> = {
  adc: `${inTitleAbstract(["antibody-drug conjugate", "antibody drug conjugate", "antibody-drug conjugates"])} AND ${ONCO}`,
  "bispecific-adc": `${inTitleAbstract(["bispecific antibody-drug conjugate", "bispecific ADC"])}`,
  "dual-payload-adc": `${inTitleAbstract(["dual-payload antibody-drug conjugate", "dual payload ADC", "dual-payload ADC"])}`,
  "degrader-antibody-conjugate": `${inTitleAbstract(["degrader-antibody conjugate", "degrader antibody conjugate"])}`,
  "immune-stimulating-adc": `${inTitleAbstract(["immune-stimulating antibody conjugate", "ISAC", "TLR agonist antibody conjugate"])} AND ${ONCO}`,
  "masked-adc": `${inTitleAbstract(["conditionally active antibody-drug conjugate", "probody", "masked antibody-drug conjugate"])}`,
  "topoisomerase-inhibitors": `${inTitleAbstract(["topoisomerase I inhibitor payload", "deruxtecan", "exatecan", "SN-38 payload"])}`,
  "checkpoint-inhibitor": `${inTitleAbstract(["immune checkpoint inhibitor", "immune checkpoint inhibitors", "PD-1 blockade", "PD-L1 blockade"])}`,
  "t-cell-engager": `${inTitleAbstract(["bispecific T-cell engager", "T cell engager", "CD3 bispecific"])} AND ${ONCO}`,
  "neoantigen-mrna-vaccine": `${inTitleAbstract(["personalized cancer vaccine", "personalised cancer vaccine", "neoantigen vaccine", "mRNA cancer vaccine"])}`,
  "shared-antigen-vaccine": `${inTitleAbstract(["shared antigen cancer vaccine", "KRAS vaccine", "off-the-shelf cancer vaccine"])}`,
  "oncolytic-virus": `${inTitleAbstract(["oncolytic virus", "oncolytic virotherapy", "oncolytic viruses"])}`,
  "cytokine-therapy": `${inTitleAbstract(["engineered cytokine", "IL-2 variant", "IL-15 superagonist"])} AND ${ONCO}`,
  "sting-agonist": `${inTitleAbstract(["STING agonist", "cGAS-STING"])} AND ${ONCO}`,
  "car-t": `${inTitleAbstract(["CAR T", "CAR-T", "chimeric antigen receptor T"])}`,
  "in-vivo-car-t": `${inTitleAbstract(["in vivo CAR T", "in vivo CAR-T", "in vivo chimeric antigen receptor"])}`,
  "til-therapy": `${inTitleAbstract(["tumor-infiltrating lymphocyte therapy", "TIL therapy", "lifileucel"])}`,
  "tcr-t": `${inTitleAbstract(["TCR-T", "T cell receptor therapy", "TCR-engineered T cells"])}`,
  "car-nk-macrophage": `${inTitleAbstract(["CAR-NK", "CAR NK", "CAR-macrophage", "CAR macrophage"])}`,
  "allogeneic-cell-therapy": `${inTitleAbstract(["allogeneic CAR T", "off-the-shelf CAR T", "allogeneic CAR-T"])}`,
  "armored-car": `${inTitleAbstract(["armored CAR T", "armoured CAR T", "logic-gated CAR", "synNotch CAR"])}`,
  "radioligand-therapy": `${inTitleAbstract(["radioligand therapy", "peptide receptor radionuclide therapy", "lutetium-177", "177Lu"])}`,
  "targeted-alpha-therapy": `${inTitleAbstract(["targeted alpha therapy", "actinium-225", "225Ac", "lead-212", "212Pb"])}`,
  radioimmunotherapy: `${inTitleAbstract(["radioimmunotherapy", "radioimmunoconjugate", "radiolabeled antibody"])} AND ${ONCO}`,
  "psma-pet": `${inTitleAbstract(["PSMA PET", "PSMA PET/CT", "68Ga-PSMA", "18F-DCFPyL"])}`,
  "fapi-pet": `${inTitleAbstract(["FAPI PET", "FAP inhibitor PET", "68Ga-FAPI", "fibroblast activation protein PET"])}`,
  "trop2-pet": `${inTitleAbstract(["TROP2 PET", "TROP2 imaging", "Trop-2 PET"])}`,
  "her2-pet": `${inTitleAbstract(["HER2 PET", "89Zr-trastuzumab", "HER2 imaging PET"])}`,
  "immuno-pet": `${inTitleAbstract(["immuno-PET", "immunoPET", "CD8 PET", "89Zr-labeled antibody"])}`,
  "parp-pet": `${inTitleAbstract(["PARP PET", "18F-FluorThanatrace", "PARP imaging"])}`,
  "fdg-pet": `${inTitleAbstract(["FDG PET", "18F-FDG PET/CT"])} AND ${ONCO}`,
  pet: `${inTitleAbstract(["positron emission tomography"])} AND ${ONCO}`,
  "pet-ct": `${inTitleAbstract(["PET/CT", "total-body PET"])} AND ${ONCO}`,
  "pet-mri": `${inTitleAbstract(["PET/MRI", "PET-MRI"])} AND ${ONCO}`,
  ct: `${inTitleAbstract(["computed tomography", "photon-counting CT"])} AND ${ONCO} AND (staging OR screening OR response)`,
  mri: `${inTitleAbstract(["magnetic resonance imaging", "multiparametric MRI"])} AND ${ONCO}`,
  ultrasound: `${inTitleAbstract(["ultrasound", "endoscopic ultrasound"])} AND ${ONCO} AND (diagnosis OR biopsy OR screening)`,
  mammography: `${inTitleAbstract(["mammography", "digital breast tomosynthesis", "breast cancer screening"])}`,
  "radiology-ai-screening": `${inTitleAbstract(["artificial intelligence", "deep learning"])} AND ${inTitleAbstract(["mammography", "lung cancer screening", "radiology"])} AND ${ONCO}`,
  "digital-pathology-ai": `${inTitleAbstract(["digital pathology", "computational pathology", "whole slide image"])} AND (deep learning OR artificial intelligence)`,
  "pathology-foundation-model": `${inTitleAbstract(["foundation model"])} AND ${inTitleAbstract(["pathology", "histopathology", "radiology"])} AND ${ONCO}`,
  "ai-drug-design": `${inTitleAbstract(["AI drug discovery", "generative model", "de novo design"])} AND ${ONCO}`,
  "ai-trial-matching": `${inTitleAbstract(["clinical trial matching", "trial eligibility", "large language model"])} AND ${ONCO}`,
  "liquid-biopsy": `${inTitleAbstract(["liquid biopsy", "circulating tumor DNA", "cell-free DNA"])} AND ${ONCO}`,
  "mrd-testing": `${inTitleAbstract(["minimal residual disease", "molecular residual disease", "ctDNA MRD"])} AND ${ONCO}`,
  mced: `${inTitleAbstract(["multi-cancer early detection", "multicancer early detection", "MCED"])}`,
  cgp: `${inTitleAbstract(["comprehensive genomic profiling", "next-generation sequencing panel", "tumor sequencing"])}`,
  "wes-wgs": `${inTitleAbstract(["whole-genome sequencing", "whole genome sequencing", "whole-exome sequencing"])} AND ${ONCO}`,
  "rna-seq": `${inTitleAbstract(["RNA sequencing", "transcriptomic profiling", "gene expression signature"])} AND ${ONCO}`,
  "single-cell-spatial": `${inTitleAbstract(["single-cell RNA sequencing", "spatial transcriptomics", "single-cell"])} AND ${ONCO}`,
  proteomics: `${inTitleAbstract(["proteomics", "proteogenomic", "phosphoproteomics"])} AND ${ONCO}`,
  "methylation-profiling": `${inTitleAbstract(["DNA methylation", "methylation classifier", "cfDNA methylation"])} AND ${ONCO}`,
  "histopathology-ihc": `${inTitleAbstract(["immunohistochemistry"])} AND ${ONCO} AND (biomarker OR scoring)`,
  "companion-diagnostic": `${inTitleAbstract(["companion diagnostic", "companion diagnostics"])}`,
  "hrd-testing": `${inTitleAbstract(["homologous recombination deficiency", "HRD testing", "HRD score"])}`,
  "germline-testing": `${inTitleAbstract(["germline testing", "hereditary cancer", "germline pathogenic variant"])}`,
  "functional-drug-testing": `${inTitleAbstract(["functional precision medicine", "ex vivo drug sensitivity", "drug sensitivity testing"])} AND ${ONCO}`,
  organoids: `${inTitleAbstract(["patient-derived organoid", "patient-derived organoids", "tumor organoid"])}`,
  "pdx-models": `${inTitleAbstract(["patient-derived xenograft", "PDX model"])}`,
  "crispr-screens": `${inTitleAbstract(["CRISPR screen", "genome-wide CRISPR", "CRISPR-Cas9 screen"])} AND ${ONCO}`,
  "synthetic-lethality-approaches": `${inTitleAbstract(["synthetic lethality", "synthetic lethal"])} AND ${ONCO}`,
  "robotic-surgery": `${inTitleAbstract(["robotic surgery", "robot-assisted surgery", "robotic-assisted"])} AND ${ONCO}`,
  "fluorescence-guided-surgery": `${inTitleAbstract(["fluorescence-guided surgery", "fluorescence guided surgery", "near-infrared fluorescence"])} AND ${ONCO}`,
  "sentinel-node": `${inTitleAbstract(["sentinel lymph node biopsy", "sentinel node"])} AND ${ONCO}`,
  "thermal-ablation": `${inTitleAbstract(["radiofrequency ablation", "microwave ablation", "cryoablation"])} AND ${ONCO}`,
  "hifu-histotripsy": `${inTitleAbstract(["high-intensity focused ultrasound", "histotripsy", "focused ultrasound"])} AND ${ONCO}`,
  "irreversible-electroporation": `${inTitleAbstract(["irreversible electroporation", "NanoKnife"])}`,
  "imrt-igrt": `${inTitleAbstract(["intensity-modulated radiotherapy", "image-guided radiotherapy", "hypofractionated radiotherapy"])}`,
  sbrt: `${inTitleAbstract(["stereotactic body radiotherapy", "stereotactic ablative radiotherapy", "SBRT", "SABR"])}`,
  "proton-therapy": `${inTitleAbstract(["proton therapy", "proton beam therapy"])}`,
  "carbon-ion": `${inTitleAbstract(["carbon ion radiotherapy", "carbon-ion radiotherapy", "heavy ion therapy"])}`,
  brachytherapy: `${inTitleAbstract(["brachytherapy"])}`,
  "mr-linac": `${inTitleAbstract(["MR-linac", "MR-guided radiotherapy", "adaptive radiotherapy"])}`,
  "flash-rt": `${inTitleAbstract(["FLASH radiotherapy", "ultra-high dose rate radiotherapy"])}`,
  bnct: `${inTitleAbstract(["boron neutron capture therapy"])}`,
  "cytotoxic-chemotherapy": `${inTitleAbstract(["chemotherapy"])} AND ${ONCO} AND (randomized OR phase 3 OR phase III)`,
  platinum: `${inTitleAbstract(["carboplatin", "cisplatin", "platinum-based chemotherapy"])} AND ${ONCO}`,
  hipec: `${inTitleAbstract(["hyperthermic intraperitoneal chemotherapy", "HIPEC", "PIPAC"])}`,
  "kinase-inhibitors": `${inTitleAbstract(["tyrosine kinase inhibitor", "kinase inhibitor"])} AND ${ONCO}`,
  "monoclonal-antibody": `${inTitleAbstract(["monoclonal antibody"])} AND ${ONCO} AND (phase 3 OR phase III OR approval)`,
  "bispecific-antibody": `${inTitleAbstract(["bispecific antibody", "bispecific antibodies"])} AND ${ONCO}`,
  "parp-inhibitor": `${inTitleAbstract(["PARP inhibitor", "PARP inhibitors", "olaparib", "niraparib"])}`,
  "cdk46-inhibitor": `${inTitleAbstract(["CDK4/6 inhibitor", "CDK4/6 inhibitors", "palbociclib", "ribociclib", "abemaciclib"])}`,
  "kras-inhibitors": `${inTitleAbstract(["KRAS inhibitor", "KRAS G12C", "KRAS G12D", "pan-RAS inhibitor"])}`,
  "protac-degrader": `${inTitleAbstract(["PROTAC", "targeted protein degradation", "molecular glue degrader"])} AND ${ONCO}`,
  "antisense-sirna": `${inTitleAbstract(["antisense oligonucleotide", "siRNA"])} AND ${ONCO}`,
  antiangiogenic: `${inTitleAbstract(["anti-angiogenic", "antiangiogenic", "VEGF inhibitor", "bevacizumab"])} AND ${ONCO}`,
  "endocrine-therapy": `${inTitleAbstract(["endocrine therapy", "aromatase inhibitor", "oral SERD"])} AND breast`,
  "androgen-deprivation": `${inTitleAbstract(["androgen deprivation therapy", "androgen receptor pathway inhibitor", "enzalutamide", "abiraterone"])}`,
  "epigenetic-drugs": `${inTitleAbstract(["epigenetic therapy", "HDAC inhibitor", "EZH2 inhibitor", "menin inhibitor", "IDH inhibitor"])} AND ${ONCO}`,
  ttfields: `${inTitleAbstract(["tumor treating fields", "tumour treating fields", "TTFields"])}`,
  photoimmunotherapy: `${inTitleAbstract(["photoimmunotherapy", "photodynamic therapy"])} AND ${ONCO}`,
  hyperthermia: `${inTitleAbstract(["hyperthermia"])} AND ${ONCO} AND (radiotherapy OR chemotherapy)`,
  "scalp-cooling": `${inTitleAbstract(["scalp cooling", "chemotherapy-induced alopecia"])}`,
  "cardio-oncology": `${inTitleAbstract(["cardio-oncology", "cardiotoxicity"])} AND ${ONCO}`,
  "exercise-oncology": `${inTitleAbstract(["exercise oncology", "exercise intervention"])} AND ${ONCO} AND survival`,
  "geriatric-assessment": `${inTitleAbstract(["geriatric assessment"])} AND ${ONCO}`,
  "hpv-vaccine": `${inTitleAbstract(["HPV vaccination", "HPV vaccine", "cervical cancer elimination"])}`,
  chemoprevention: `${inTitleAbstract(["chemoprevention", "risk-reducing surgery", "cancer prevention"])}`,
  "optical-imaging": `${inTitleAbstract(["optical imaging", "fluorescence imaging", "indocyanine green"])} AND ${ONCO}`,
  "whole-body-mri": `${inTitleAbstract(["whole-body MRI", "whole body MRI"])} AND ${ONCO}`,
  spect: `${inTitleAbstract(["SPECT/CT", "bone scan", "dosimetry SPECT"])} AND ${ONCO}`,
  "peptide-drug-conjugate": `${inTitleAbstract(["peptide-drug conjugate", "peptide drug conjugate", "bicycle toxin conjugate"])}`,
  "site-specific-conjugation": `${inTitleAbstract(["site-specific conjugation", "drug-to-antibody ratio", "ADC linker"])}`,
  // Recovery and rejuvenation: the record names are reader-facing sentences ("What actually works after
  // treatment"), so a name-derived query would return nothing or noise. Each one names the literature instead.
  "rejuv-age-epigenetic-clocks": `${inTitleAbstract(["epigenetic age acceleration", "epigenetic clock", "DNA methylation age"])} AND (${ONCO} OR survivor)`,
  "rejuv-age-clonal-haematopoiesis-after-therapy": `${inTitleAbstract(["therapy-related clonal hematopoiesis", "clonal hematopoiesis", "clonal haematopoiesis"])} AND (chemotherapy OR radiotherapy OR ${ONCO})`,
  "rejuv-age-senescent-cells-after-treatment": `${inTitleAbstract(["therapy-induced senescence", "p16INK4a expression", "senescent cell burden"])} AND ${ONCO}`,
  "rejuv-age-frailty-and-late-effects": `${inTitleAbstract(["frailty", "premature aging", "accelerated aging"])} AND ${inTitleAbstract(["cancer survivors", "childhood cancer survivors"])}`,
  "rejuv-age-telomere-length": `${inTitleAbstract(["telomere length", "leukocyte telomere length"])} AND (${ONCO} OR survivor)`,
  "rejuv-frontier-senolytics": `${inTitleAbstract(["senolytic", "senolytics", "dasatinib plus quercetin", "fisetin senolytic"])}`,
  "rejuv-frontier-metformin-ageing": `${inTitleAbstract(["metformin"])} AND (aging OR ageing OR geroprotector OR ${ONCO})`,
  "rejuv-frontier-rapamycin-ageing": `${inTitleAbstract(["rapamycin", "sirolimus", "mTOR inhibition"])} AND (aging OR ageing OR immunosenescence OR healthspan)`,
  "rejuv-frontier-nad-precursors": `${inTitleAbstract(["nicotinamide riboside", "nicotinamide mononucleotide", "NAD+ precursor"])}`,
  "rejuv-frontier-nad-infusions": `${inTitleAbstract(["intravenous NAD+", "NAD+ infusion", "nicotinamide adenine dinucleotide infusion"])}`,
  "rejuv-frontier-immune-reconstitution": `${inTitleAbstract(["immune reconstitution", "revaccination", "vaccination after transplantation"])} AND (${ONCO} OR transplantation)`,
  "rejuv-frontier-mesenchymal-stromal-cells": `${inTitleAbstract(["mesenchymal stromal cells", "mesenchymal stem cells", "remestemcel"])} AND (graft-versus-host OR radiation injury OR ${ONCO})`,
  "rejuv-frontier-fat-grafting": `${inTitleAbstract(["fat grafting", "lipofilling", "autologous fat transfer"])} AND ${ONCO}`,
  "rejuv-frontier-platelet-rich-plasma": `${inTitleAbstract(["platelet-rich plasma"])} AND (alopecia OR ${ONCO})`,
  "rejuv-frontier-hyperbaric-oxygen-claims": `${inTitleAbstract(["hyperbaric oxygen", "osteoradionecrosis", "late radiation tissue injury"])}`,
  "rejuv-frontier-stem-cell-tourism": `${inTitleAbstract(["stem cell tourism", "unproven stem cell", "direct-to-consumer stem cell"])}`,
  "rejuv-frontier-exosome-injections": `${inTitleAbstract(["exosome therapy", "exosome product", "extracellular vesicle therapy"])}`,
  "rejuv-frontier-unlicensed-peptides": `${inTitleAbstract(["BPC-157", "ipamorelin", "growth hormone releasing peptide", "ibutamoren"])}`,
  "rejuv-frontier-ozone-therapy": `${inTitleAbstract(["ozone therapy", "ozonated autohemotherapy", "medical ozone"])}`,
  "rejuv-frontier-hormone-pellets": `${inTitleAbstract(["compounded bioidentical hormone", "hormone pellet", "bioidentical hormone therapy"])}`,
  "rejuv-frontier-what-works": `${inTitleAbstract(["exercise", "physical activity"])} AND ${inTitleAbstract(["cancer survivors", "survivorship"])} AND (randomized OR randomised OR survival)`,
};

function escapeTerm(s: string): string {
  return s.replace(/[()"\\]/g, " ").replace(/\s+/g, " ").trim();
}

/** Strip parenthetical qualifiers like "Triple-negative breast cancer (TNBC)" → ["Triple-negative breast cancer", "TNBC"]. */
function nameVariants(name: string): string[] {
  const m = name.match(/^(.*?)\s*\((.*?)\)\s*$/);
  const out = m ? [m[1], m[2]] : [name];
  return out.map(escapeTerm).filter((s) => s.length >= 3);
}

/** Build a Europe PMC query for an entity. Returns undefined for kinds without a sensible literature query. */
export function paperQuery(e: Pick<Entity, "id" | "kind" | "name" | "aka"> & Partial<{ brand: string; code: string; symbol: string }>): string | undefined {
  switch (e.kind) {
    case "drug": {
      const terms = [...nameVariants(e.name), ...(e.brand ? e.brand.split(/[\/,(]/).map(escapeTerm).filter((s) => s.length >= 4 && !/^\(|SC\)?$/.test(s)) : []), ...(e.code ? e.code.split(/[,;\/]/).map(escapeTerm).filter((s) => s.length >= 4) : []), ...e.aka.map(escapeTerm)]
        .filter((t, i, a) => t && a.indexOf(t) === i).slice(0, 6);
      if (!terms.length) return undefined;
      return `${inTitleAbstract(terms)} AND ${ONCO}`;
    }
    case "target": {
      const terms = [...nameVariants(e.name), ...(e.symbol ? e.symbol.split(/[,\/]/).map(escapeTerm) : []), ...e.aka.map(escapeTerm)].filter((t, i, a) => t.length >= 2 && a.indexOf(t) === i).slice(0, 6);
      if (!terms.length) return undefined;
      return `${inTitleAbstract(terms)} AND ${ONCO}`;
    }
    case "cancer": {
      const terms = [...nameVariants(e.name), ...e.aka.map(escapeTerm)].filter((t, i, a) => t.length >= 3 && a.indexOf(t) === i).slice(0, 6);
      if (!terms.length) return undefined;
      return `${inTitleAbstract(terms)} AND (treatment OR therapy OR trial OR survival OR diagnosis)`;
    }
    case "technology": {
      if (TECH_QUERIES[e.id]) return TECH_QUERIES[e.id];
      const terms = [...nameVariants(e.name), ...e.aka.map(escapeTerm)].filter((t, i, a) => t.length >= 4 && a.indexOf(t) === i).slice(0, 4);
      if (!terms.length) return undefined;
      return `${inTitleAbstract(terms)} AND ${ONCO}`;
    }
    case "pathway":
    case "term":
    case "idea": {
      const terms = nameVariants(e.name).slice(0, 3);
      if (!terms.length) return undefined;
      return `${inTitleAbstract(terms)} AND ${ONCO}`;
    }
    default:
      return undefined;
  }
}

export type PaperLite = {
  id: string; source: string; pmid?: string; pmcid?: string; doi?: string; title: string; authorString?: string; journalTitle?: string;
  pubYear?: string; firstPublicationDate?: string; isOpenAccess?: string; citedByCount?: number; pubType?: string;
};

export function restUrl(query: string, opts: { pageSize?: number; preprints?: boolean; resultType?: "lite" | "idlist"; sort?: string } = {}): string {
  const full = opts.preprints ? `(${query}) AND SRC:PPR` : query;
  const p = new URLSearchParams({ query: full, format: "json", resultType: opts.resultType ?? "lite", pageSize: String(opts.pageSize ?? 10), sort: opts.sort ?? "P_PDATE_D desc" });
  return `${EPMC_REST}?${p.toString()}`;
}

export function searchPageUrl(query: string): string {
  return `${EPMC_SEARCH}?query=${encodeURIComponent(query)}&sortBy=FIRST_PDATE_D%2Bdesc`;
}

export function paperLink(p: PaperLite): string {
  if (p.doi) return `https://doi.org/${p.doi}`;
  if (p.pmid) return `https://europepmc.org/article/MED/${p.pmid}`;
  return `https://europepmc.org/article/${p.source}/${p.id}`;
}

export function firstAuthor(authorString?: string): string {
  if (!authorString) return "";
  const first = authorString.split(",")[0]?.trim() ?? "";
  return authorString.includes(",") ? `${first} et al.` : first;
}

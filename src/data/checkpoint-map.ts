/**
 * Checkpoint families: one typed taxonomy for the two unrelated biologies the word "checkpoint" covers.
 *
 *  - Immune checkpoints: receptors and ligands on immune cells, tumour cells and antigen-presenting cells that hold
 *    T cells, NK cells and macrophages back, plus the co-stimulatory receptors agonist drugs press and the metabolic
 *    and soluble brakes of the tumour microenvironment.
 *  - Cell-intrinsic checkpoints: the gates every dividing cell passes (G1/S, G2/M, the DNA-damage response and the
 *    spindle assembly checkpoint), which tumours disable and then depend on.
 *
 * Every member is a target record in the corpus (`id` is the target id; new records are in `checkpointTargets` below,
 * built from the HGNC and UniProt REST APIs). Where a protein is expressed comes from the UniProt tissue-specificity
 * or function comment for the accession named, or from a cited review; drug statuses come from the drug records the
 * member links to (their approvals carry regions and indications) and, for agents that have no record here, from a
 * named ClinicalTrials.gov study. Discontinuations quote the registry's "why stopped" field. Nothing is stated without
 * a source; where none was found the member says so.
 *
 * Rendered at /checkpoints/, /checkpoints/immune/ and /checkpoints/cell-cycle/ (src/lib/checkpoints.ts derives the
 * rows from the graph); the taxonomy is checked by src/data/checkpoint-map.test.ts.
 */
import type { TargetInput, TermInput } from "@/lib/schema";

export type Source = { label: string; url: string };

export type CheckpointRoot = "immune" | "cell-cycle";
export type CheckpointClassId =
  | "inhibitory-receptor" | "ligand" | "innate" | "costimulatory" | "metabolic" | "b7-family" | "soluble"
  | "g1-s" | "g2-m" | "ddr" | "spindle";
/** Colour family of a class in the schematics: inhibitory brakes, stimulatory accelerators, ligands on the other cell, innate "don't eat me" pairs, metabolic and soluble brakes, and the cell-cycle gates. */
export type CheckpointTone = "inhibitory" | "stimulatory" | "ligand" | "innate" | "metabolic" | "soluble" | "gate";
/** Which cell carries the member in the synapse drawing, or where it acts inside a dividing cell. */
export type CheckpointSide = "immune-cell" | "macrophage" | "tumour-or-apc" | "soluble" | "intracellular";
export type DrugClass = "antibody" | "bispecific" | "small-molecule" | "agonist" | "adc" | "fusion-protein" | "cell-therapy" | "vaccine" | "antisense" | "other";
export type Gate = "G1/S" | "G2/M" | "DDR" | "SAC";

export type CheckpointClass = {
  id: CheckpointClassId;
  root: CheckpointRoot;
  name: string;
  tone: CheckpointTone;
  /** One or two plain sentences for a reader with no background. */
  plain: string;
  /** A cited statement the class rests on, when the plain text makes a mechanistic claim. */
  evidence?: { text: string; source: Source };
};

export type MemberDrug = { id: string; drugClass: DrugClass; note?: string };
export type CitedNote = { text: string; source: Source };

export type CheckpointMember = {
  /** Target id in the corpus. */
  id: string;
  classId: CheckpointClassId;
  /** Display label (PD-1, CD155, WEE1). */
  label: string;
  symbol: string;
  hgnc: string;
  side: CheckpointSide;
  /** Where it is expressed (immune members) or where it acts (cell-intrinsic members), with the source. */
  expressedOn: CitedNote;
  /** Member ids this one binds or signals to; every pair is declared on both sides (checked by the test). */
  partners: string[];
  /** Binding partners that are not members of the map, named with their source. */
  partnerNote?: CitedNote;
  /** Drugs in the corpus, by class. The page adds any other drug record that names the target. */
  drugs: MemberDrug[];
  /** Agents with no drug record here, with the ClinicalTrials.gov study that gives their phase. */
  pipelineNotes?: CitedNote[];
  /** Programmes stopped, with the registry's own reason. */
  discontinued?: Array<{ name: string; reason: string; source: Source }>;
  /** Cell-intrinsic members: the gates they guard. */
  gates?: Gate[];
};

const UNIPROT = (acc: string): Source => ({ label: `UniProt ${acc}`, url: `https://www.uniprot.org/uniprotkb/${acc}/entry` });
const HGNC_URL = (id: string) => `https://www.genenames.org/data/gene-symbol-report/#!/hgnc_id/${id}`;
const GENE = (id: string) => `https://www.ncbi.nlm.nih.gov/gene/${id}`;
const NCT = (id: string): Source => ({ label: `ClinicalTrials.gov ${id}`, url: `https://clinicaltrials.gov/study/${id}` });
const PMID = (id: string, label: string): Source => ({ label, url: `https://europepmc.org/article/MED/${id}` });

/** Reviews the class notes and a few expression statements rest on (Europe PMC, read 24 September 2026). */
export const CHECKPOINT_REVIEWS = {
  wee1p53: PMID("34671620", "Chen et al. 2021, Front Med: WEE1 inhibitors and statins in cancers with p53 mutations"),
  novelIci: PMID("31690319", "Qin et al. 2019, Mol Cancer: novel immune checkpoint targets beyond PD-1 and CTLA-4"),
  b7family: PMID("28258693", "Janakiram et al. 2017, Immunol Rev: the third group of the B7-CD28 family"),
  adenosine: PMID("29758241", "Allard et al. 2019, Immunol Rev: targeting the CD73-adenosine axis"),
  idoTdo: PMID("29254698", "Cheong and Sun 2018, Trends Pharmacol Sci: the IDO1/TDO2-kynurenine-AhR pathway"),
  cd155: PMID("28730595", "Kučan Brlić et al. 2017, Cell Mol Immunol: CD155, an onco-immunologic molecule"),
  sac: PMID("25731686", "Yuan et al. 2015: targeting the spindle assembly checkpoint for breast cancer treatment"),
  ox40: PMID("19538134", "Croft 2009, Immunol Rev: OX40-mediated co-stimulation"),
  cd40: PMID("31412220", "Vonderheide 2020, Annu Rev Med: CD40 agonist antibodies in cancer immunotherapy"),
  cd24: PMID("36013184", "Panagiotou et al. 2022, Cancers: CD24 as a target for cancer immunotherapy"),
  lilrb: PMID("28638976", "van der Touw et al. 2017, Cancer Immunol Immunother: LILRB receptors and myeloid cells"),
  il10tgfb: PMID("25302175", "Torres-Poveda et al. 2014, Infect Agent Cancer: IL-10 and TGF-beta1 in local immunosuppression"),
} as const;

export const CHECKPOINT_CLASSES: CheckpointClass[] = [
  {
    id: "inhibitory-receptor", root: "immune", name: "Inhibitory receptors on T and NK cells", tone: "inhibitory",
    plain: "Brakes carried by the immune cell itself. When the receptor meets its ligand on a tumour cell or an antigen-presenting cell, the T cell or NK cell stands down. Antibodies that block the receptor release the brake.",
    evidence: { text: "PD-1 and CTLA-4 antibodies shaped treatment, most patients still show primary or adaptive resistance, and LAG-3, TIM-3, TIGIT and VISTA are the next checkpoints characterised.", source: CHECKPOINT_REVIEWS.novelIci },
  },
  {
    id: "ligand", root: "immune", name: "Their ligands on tumour and antigen-presenting cells", tone: "ligand",
    plain: "The other half of each pair. Tumours borrow these molecules from normal tissue so that the brakes on nearby T cells are pressed. Blocking the ligand works as well as blocking the receptor for PD-1.",
  },
  {
    id: "innate", root: "immune", name: "Innate 'don't eat me' checkpoints", tone: "innate",
    plain: "Signals a cell shows to macrophages to say it is self and should not be eaten. Tumours over-express them; blocking the pair lets macrophages engulf the cancer cell.",
    evidence: { text: "The CD24-Siglec-10 interaction inhibits macrophage-mediated phagocytosis as well as NK-cell cytotoxicity.", source: CHECKPOINT_REVIEWS.cd24 },
  },
  {
    id: "costimulatory", root: "immune", name: "Co-stimulatory receptors and agonist targets", tone: "stimulatory",
    plain: "Accelerators rather than brakes. These receptors tell a T cell, or the dendritic cell that primes it, to go harder; the drugs are agonists that press them, or bispecifics that press them only where the other arm has found the tumour.",
    evidence: { text: "CD40 activation licenses dendritic cells to promote antitumour T-cell activation and re-educates macrophages to destroy tumour stroma.", source: CHECKPOINT_REVIEWS.cd40 },
  },
  {
    id: "metabolic", root: "immune", name: "Metabolic checkpoints", tone: "metabolic",
    plain: "Enzymes and receptors that change the chemistry around the tumour: they use up tryptophan or turn spilt ATP into adenosine, and either change starves or sedates T cells.",
    evidence: { text: "CD39 and CD73 are cell-surface enzymes that catabolise extracellular ATP into adenosine; ectonucleotidases and adenosine receptors have emerged as therapeutic targets.", source: CHECKPOINT_REVIEWS.adenosine },
  },
  {
    id: "b7-family", root: "immune", name: "Other B7 family members", tone: "ligand",
    plain: "Relatives of PD-L1 and CD80 whose receptors are only partly known. Because tumours over-express them, most drugs treat them as an address for an antibody-drug conjugate rather than as a brake to release.",
    evidence: { text: "B7-H3, B7x (B7-H4) and HHLA2 form the third phylogenetic group of the B7-CD28 family, with antagonistic antibodies and agonistic fusion proteins emerging for cancer.", source: CHECKPOINT_REVIEWS.b7family },
  },
  {
    id: "soluble", root: "immune", name: "Soluble brakes of the microenvironment", tone: "soluble",
    plain: "Not receptors but secreted signals that quieten immune cells across a whole tumour. The cited review frames them as immunosuppressive cytokines rather than checkpoints in the strict sense; they are listed here because the drugs against TGF-beta are fused to checkpoint antibodies.",
    evidence: { text: "HPV up-regulates IL-10 and TGF-beta1 to produce a local immunosuppressive environment that inhibits the antitumour immune response.", source: CHECKPOINT_REVIEWS.il10tgfb },
  },
  {
    id: "g1-s", root: "cell-cycle", name: "G1/S: the decision to copy DNA", tone: "gate",
    plain: "The first gate. Cyclin D and CDK4/6 phosphorylate RB, which lets the cell commit to copying its DNA; p16 holds CDK4/6 back. Hormone-driven breast cancers lean on this gate, which is why CDK4/6 inhibitors work there.",
  },
  {
    id: "g2-m", root: "cell-cycle", name: "G2/M: the decision to divide", tone: "gate",
    plain: "The second gate, held shut by ATR, CHK1 and WEE1 until copied DNA is checked. Tumours that have lost p53 cannot stop at the first gate, so they rely on this one; drugs that force it open push them into a lethal mitosis.",
    evidence: { text: "Tumour cells lacking functional p53 are defective in the G1/S checkpoint and become highly dependent on the G2/M checkpoint to maintain genomic stability, and are consequently vulnerable to WEE1 inhibitors, which override the G2/M checkpoint and induce cell death through mitotic catastrophe.", source: CHECKPOINT_REVIEWS.wee1p53 },
  },
  {
    id: "ddr", root: "cell-cycle", name: "DNA-damage response", tone: "gate",
    plain: "The sensors and repair crews behind both gates. ATM and ATR detect breaks and stalled forks, CHK1 and CHK2 relay the alarm, p53 decides between pause, repair and death, and PARP patches single-strand breaks. Cancers that have lost one route depend on the others.",
  },
  {
    id: "spindle", root: "cell-cycle", name: "Spindle assembly checkpoint", tone: "gate",
    plain: "The last gate, inside mitosis. MPS1, BUB1 and Aurora B keep the cell from pulling its chromosomes apart until every one is attached; Aurora A and PLK1 build the spindle. Taxanes and vinca alkaloids kill by holding this gate shut for good.",
    evidence: { text: "Vinca alkaloids and taxanes kill cancer cells through chronic arrest in mitosis as a consequence of chronic spindle assembly checkpoint activation.", source: CHECKPOINT_REVIEWS.sac },
  },
];

export const CHECKPOINT_MEMBERS: CheckpointMember[] = [
  // ---------------------------------------------------------------- inhibitory receptors
  {
    id: "pd1", classId: "inhibitory-receptor", label: "PD-1", symbol: "PDCD1", hgnc: "HGNC:8760", side: "immune-cell",
    expressedOn: { text: "Antigen-activated T cells; delivers inhibitory signals on binding PD-L1 or PD-L2.", source: UNIPROT("Q15116") },
    partners: ["pdl1", "pdcd1lg2"],
    drugs: [
      { id: "pembrolizumab", drugClass: "antibody" }, { id: "nivolumab", drugClass: "antibody" }, { id: "cemiplimab", drugClass: "antibody" }, { id: "dostarlimab", drugClass: "antibody" },
      { id: "toripalimab", drugClass: "antibody" }, { id: "tislelizumab", drugClass: "antibody" }, { id: "retifanlimab", drugClass: "antibody" }, { id: "sintilimab", drugClass: "antibody" },
      { id: "camrelizumab", drugClass: "antibody" }, { id: "serplulimab", drugClass: "antibody" }, { id: "penpulimab", drugClass: "antibody" }, { id: "zimberelimab", drugClass: "antibody" },
      { id: "relatlimab-nivolumab", drugClass: "antibody", note: "fixed-dose combination with the LAG-3 antibody relatlimab" },
      { id: "cadonilimab", drugClass: "bispecific", note: "PD-1 x CTLA-4" }, { id: "ivonescimab", drugClass: "bispecific", note: "PD-1 x VEGF" }, { id: "rilvegostomig", drugClass: "bispecific", note: "PD-1 x TIGIT" },
    ],
  },
  {
    id: "ctla4", classId: "inhibitory-receptor", label: "CTLA-4", symbol: "CTLA4", hgnc: "HGNC:2505", side: "immune-cell",
    expressedOn: { text: "Activated T cells, at 30- to 50-fold lower surface levels than CD28; widely expressed with the highest levels in lymphoid tissues.", source: UNIPROT("P16410") },
    partners: ["cd80", "cd86"],
    drugs: [
      { id: "ipilimumab", drugClass: "antibody" }, { id: "tremelimumab", drugClass: "antibody" }, { id: "botensilimab", drugClass: "antibody", note: "Fc-enhanced" }, { id: "gotistobart", drugClass: "antibody" },
      { id: "cadonilimab", drugClass: "bispecific", note: "PD-1 x CTLA-4" }, { id: "iparomlimab-tuvonralimab", drugClass: "antibody", note: "anti-PD-1 and anti-CTLA-4 mixture" },
    ],
  },
  {
    id: "lag3", classId: "inhibitory-receptor", label: "LAG-3", symbol: "LAG3", hgnc: "HGNC:6476", side: "immune-cell",
    expressedOn: { text: "Primarily activated T cells and a subset of NK cells.", source: UNIPROT("P18627") },
    partners: ["hla-dra", "fgl1"],
    drugs: [{ id: "relatlimab-nivolumab", drugClass: "antibody" }, { id: "fianlimab", drugClass: "antibody" }, { id: "favezelimab", drugClass: "antibody" }],
  },
  {
    id: "tim3", classId: "inhibitory-receptor", label: "TIM-3", symbol: "HAVCR2", hgnc: "HGNC:18437", side: "immune-cell",
    expressedOn: { text: "Th1 lymphocytes, regulatory T cells after TCR stimulation, dendritic cells and NK cells; also epithelial tissues.", source: UNIPROT("Q8TDQ0") },
    partners: ["lgals9", "ceacam1"],
    drugs: [{ id: "cobolimab", drugClass: "antibody" }, { id: "sabatolimab", drugClass: "antibody" }],
    discontinued: [{ name: "Sabatolimab (MBG453)", reason: "In December 2023 Novartis decided to terminate the sabatolimab clinical development programme early after the phase 2 (STIMULUS MDS1) and phase 3 (STIMULUS MDS2) studies failed to meet their primary objectives; not due to safety concerns.", source: NCT("NCT04266301") }],
  },
  {
    id: "tigit", classId: "inhibitory-receptor", label: "TIGIT", symbol: "TIGIT", hgnc: "HGNC:26838", side: "immune-cell",
    expressedOn: { text: "Low levels on peripheral memory and regulatory CD4 T cells and NK cells, up-regulated on activation (protein level).", source: UNIPROT("Q495A1") },
    partners: ["pvr", "nectin2"],
    drugs: [{ id: "tiragolumab", drugClass: "antibody" }, { id: "domvanalimab", drugClass: "antibody" }, { id: "vibostolimab", drugClass: "antibody" }, { id: "rilvegostomig", drugClass: "bispecific", note: "PD-1 x TIGIT" }],
    discontinued: [
      { name: "Tiragolumab (SKYSCRAPER programme)", reason: "The sponsor's decision was based on the negative results of SKYSCRAPER-02.", source: NCT("NCT04308785") },
      { name: "Vibostolimab (MK-7684A-007)", reason: "Terminated early due to futility.", source: NCT("NCT05226598") },
      { name: "Domvanalimab in gastro-oesophageal cancer", reason: "The interim analysis of STAR-221 showed that the domvanalimab combination did not improve overall survival compared with standard of care.", source: NCT("NCT07134556") },
    ],
  },
  {
    id: "btla", classId: "inhibitory-receptor", label: "BTLA", symbol: "BTLA", hgnc: "HGNC:21087", side: "immune-cell",
    expressedOn: { text: "Lymphocytes; an inhibitory receptor that dampens antigen-receptor signalling through SHP-1 and SHP-2.", source: UNIPROT("Q7Z6A9") },
    partners: ["tnfrsf14"],
    drugs: [],
    pipelineNotes: [{ text: "Tifcemalimab (anti-BTLA) with toripalimab is in a phase 3 consolidation study in small-cell lung cancer (recruiting).", source: NCT("NCT06095583") }],
  },
  {
    id: "vista", classId: "inhibitory-receptor", label: "VISTA", symbol: "VSIR", hgnc: "HGNC:30085", side: "immune-cell",
    expressedOn: { text: "Myeloid cells including CD11b monocytes and CD66b neutrophils, at low levels on CD4 and CD8 T cells and a subset of NK cells; not on B cells (protein level).", source: UNIPROT("Q9H7M9") },
    partners: [],
    partnerNote: { text: "Ligands are not settled; the receptor inhibits the T-cell response.", source: UNIPROT("Q9H7M9") },
    drugs: [],
    pipelineNotes: [
      { text: "HMBD-002 (anti-VISTA) completed a phase 1 study alone and with pembrolizumab.", source: NCT("NCT05082610") },
      { text: "CI-8993 (anti-VISTA) completed a phase 1 study in advanced solid tumours.", source: NCT("NCT04475523") },
    ],
  },
  {
    id: "klrc1", classId: "inhibitory-receptor", label: "NKG2A", symbol: "KLRC1", hgnc: "HGNC:6374", side: "immune-cell",
    expressedOn: { text: "Predominantly NK cells, with CD94; subsets of intraepithelial and memory CD8 T cells (protein level).", source: UNIPROT("P26715") },
    partners: ["hla-e"],
    drugs: [{ id: "monalizumab", drugClass: "antibody" }],
  },
  {
    id: "kir2dl1", classId: "inhibitory-receptor", label: "KIR (KIR2DL1/2/3)", symbol: "KIR2DL1", hgnc: "HGNC:6329", side: "immune-cell",
    expressedOn: { text: "NK cells; receptors for HLA-C alleles that inhibit NK-cell lysis.", source: UNIPROT("P43626") },
    partners: [],
    partnerNote: { text: "HLA-C group 2 alleles (KIR2DL1) and HLA-Cw1, Cw3, Cw7 (KIR2DL3).", source: UNIPROT("P43628") },
    drugs: [],
    pipelineNotes: [{ text: "Lirilumab (anti-KIR2DL1/2/3) reached phase 1/2 with nivolumab in solid tumours.", source: NCT("NCT01714739") }],
    discontinued: [{ name: "Lirilumab in myeloid malignancies", reason: "Enrolment was stopped after the sponsor's decision not to pursue the development of lirilumab for myeloid malignancies.", source: NCT("NCT02599649") }],
  },
  {
    id: "cd96", classId: "inhibitory-receptor", label: "CD96", symbol: "CD96", hgnc: "HGNC:16892", side: "immune-cell",
    expressedOn: { text: "Activated T and NK cells; expressed on normal T-cell lines and clones and at very low levels on activated B cells.", source: UNIPROT("P40200") },
    partners: ["pvr"],
    drugs: [],
    pipelineNotes: [{ text: "GSK6097608 (anti-CD96) is in phase 2 platform studies with dostarlimab in non-small-cell lung cancer.", source: NCT("NCT05565378") }],
  },
  {
    id: "pvrig", classId: "inhibitory-receptor", label: "PVRIG (CD112R)", symbol: "PVRIG", hgnc: "HGNC:32190", side: "immune-cell",
    expressedOn: { text: "Low levels on freshly isolated T and NK cells, predominantly memory and effector CD8 T cells and both CD16-positive and CD16-negative NK cells; not on B cells, naive or helper T cells, monocytes or neutrophils (protein level).", source: UNIPROT("Q6DKI7") },
    partners: ["nectin2"],
    drugs: [],
    pipelineNotes: [{ text: "COM701 (anti-PVRIG) completed phase 1/2 with a TIGIT antibody and nivolumab and is recruiting in platinum-sensitive ovarian cancer.", source: NCT("NCT06888921") }],
  },

  // ---------------------------------------------------------------- ligands
  {
    id: "pdl1", classId: "ligand", label: "PD-L1", symbol: "CD274", hgnc: "HGNC:17635", side: "tumour-or-apc",
    expressedOn: { text: "Activated T and B cells, dendritic cells, keratinocytes and monocytes; widely expressed in tissue, highest in lung, liver and pituitary.", source: UNIPROT("Q9NZQ7") },
    partners: ["pd1"],
    drugs: [
      { id: "atezolizumab", drugClass: "antibody" }, { id: "durvalumab", drugClass: "antibody" }, { id: "avelumab", drugClass: "antibody" }, { id: "cosibelimab", drugClass: "antibody" },
      { id: "sugemalimab", drugClass: "antibody" }, { id: "envafolimab", drugClass: "antibody" }, { id: "adebrelimab", drugClass: "antibody" }, { id: "benmelstobart", drugClass: "antibody" }, { id: "socazolimab", drugClass: "antibody" },
      { id: "acasunlimab", drugClass: "bispecific", note: "PD-L1 x 4-1BB" }, { id: "retlirafusp-alfa", drugClass: "fusion-protein", note: "PD-L1 antibody fused to a TGF-beta receptor II trap" }, { id: "io102-io103", drugClass: "vaccine", note: "PD-L1 and IDO peptide vaccine" },
    ],
  },
  {
    id: "pdcd1lg2", classId: "ligand", label: "PD-L2", symbol: "PDCD1LG2", hgnc: "HGNC:18731", side: "tumour-or-apc",
    expressedOn: { text: "Highly expressed in heart, placenta, pancreas, lung and liver; weakly in spleen, lymph nodes and thymus.", source: UNIPROT("Q9BQ51") },
    partners: ["pd1"],
    drugs: [],
  },
  {
    id: "cd80", classId: "ligand", label: "CD80 (B7-1)", symbol: "CD80", hgnc: "HGNC:1700", side: "tumour-or-apc",
    expressedOn: { text: "The surface of antigen-presenting cells.", source: UNIPROT("P33681") },
    partners: ["ctla4", "cd28"],
    drugs: [],
  },
  {
    id: "cd86", classId: "ligand", label: "CD86 (B7-2)", symbol: "CD86", hgnc: "HGNC:1705", side: "tumour-or-apc",
    expressedOn: { text: "The surface of antigen-presenting cells.", source: UNIPROT("P42081") },
    partners: ["ctla4", "cd28"],
    drugs: [],
  },
  {
    id: "hla-dra", classId: "ligand", label: "MHC class II (HLA-DR)", symbol: "HLA-DRA", hgnc: "HGNC:4947", side: "tumour-or-apc",
    expressedOn: { text: "Professional antigen-presenting cells: macrophages, dendritic cells and B cells; thymic epithelial cells (protein level).", source: UNIPROT("P01903") },
    partners: ["lag3"],
    drugs: [],
  },
  {
    id: "fgl1", classId: "ligand", label: "FGL1", symbol: "FGL1", hgnc: "HGNC:3695", side: "soluble",
    expressedOn: { text: "Liver-specific under normal conditions; secreted by hepatocytes and certain tumour cells, and binds LAG-3 independently of MHC class II.", source: UNIPROT("Q08830") },
    partners: ["lag3"],
    drugs: [],
  },
  {
    id: "lgals9", classId: "ligand", label: "Galectin-9", symbol: "LGALS9", hgnc: "HGNC:6570", side: "tumour-or-apc",
    expressedOn: { text: "Peripheral blood leukocytes and lymphatic tissues; lung, liver, breast and kidney, with higher levels in tumour endothelial cells than normal endothelium (protein level).", source: UNIPROT("O00182") },
    partners: ["tim3"],
    drugs: [],
  },
  {
    id: "ceacam1", classId: "ligand", label: "CEACAM1", symbol: "CEACAM1", hgnc: "HGNC:1814", side: "tumour-or-apc",
    expressedOn: { text: "Columnar epithelial cells of the colon (protein level); granulocytes and lymphocytes, T cells carrying the long cytoplasmic isoforms.", source: UNIPROT("P13688") },
    partners: ["tim3"],
    drugs: [],
  },
  {
    id: "pvr", classId: "ligand", label: "CD155 (PVR)", symbol: "PVR", hgnc: "HGNC:9705", side: "tumour-or-apc",
    expressedOn: { text: "Barely or weakly expressed in normal human tissues but frequently over-expressed in malignant tumours; the ligand for the co-stimulatory receptor CD226 and the co-inhibitory receptors TIGIT and CD96 on NK and T cells.", source: CHECKPOINT_REVIEWS.cd155 },
    partners: ["tigit", "cd96"],
    drugs: [],
  },
  {
    id: "nectin2", classId: "ligand", label: "CD112 (nectin-2)", symbol: "NECTIN2", hgnc: "HGNC:9707", side: "tumour-or-apc",
    expressedOn: { text: "Ubiquitous; a co-stimulator through CD226 and a co-inhibitor through PVRIG, the two binding competitively.", source: UNIPROT("Q92692") },
    partners: ["tigit", "pvrig"],
    drugs: [],
  },
  {
    id: "tnfrsf14", classId: "ligand", label: "HVEM", symbol: "TNFRSF14", hgnc: "HGNC:11912", side: "tumour-or-apc",
    expressedOn: { text: "Widely expressed, highest in lung, spleen and thymus; a subpopulation of B cells and monocytes, and naive T cells.", source: UNIPROT("Q92956") },
    partners: ["btla"],
    drugs: [],
  },
  {
    id: "hla-e", classId: "ligand", label: "HLA-E", symbol: "HLA-E", hgnc: "HGNC:4962", side: "tumour-or-apc",
    expressedOn: { text: "Endothelial cells of all vessel types outside lymphoid tissue; in lymphoid organs, endothelial venules, B and T cells, monocytes, macrophages, NK cells and megakaryocytes (protein level).", source: UNIPROT("P13747") },
    partners: ["klrc1"],
    drugs: [],
  },

  // ---------------------------------------------------------------- innate "don't eat me"
  {
    id: "cd47", classId: "innate", label: "CD47", symbol: "CD47", hgnc: "HGNC:1682", side: "tumour-or-apc",
    expressedOn: { text: "Very broadly distributed on normal adult tissues as well as ovarian tumours, especially abundant in some epithelia and the brain.", source: UNIPROT("Q08722") },
    partners: ["sirpa"],
    drugs: [{ id: "magrolimab", drugClass: "antibody" }, { id: "evorpacept", drugClass: "fusion-protein", note: "SIRP-alpha Fc fusion that binds CD47" }],
    discontinued: [
      { name: "Magrolimab with azacitidine in higher-risk MDS (ENHANCE)", reason: "Study discontinued due to futility based on a planned analysis.", source: NCT("NCT04313881") },
      { name: "Magrolimab programme in MDS", reason: "Termination due to discontinuation of magrolimab development in MDS.", source: NCT("NCT05835011") },
    ],
  },
  {
    id: "sirpa", classId: "innate", label: "SIRP-alpha", symbol: "SIRPA", hgnc: "HGNC:9662", side: "macrophage",
    expressedOn: { text: "Myeloid cells but not T cells; ubiquitous at lower levels, highly expressed in brain.", source: UNIPROT("P78324") },
    partners: ["cd47"],
    drugs: [{ id: "evorpacept", drugClass: "fusion-protein", note: "the receptor's own binding domain, given as a decoy" }],
  },
  {
    id: "cd24", classId: "innate", label: "CD24", symbol: "CD24", hgnc: "HGNC:1645", side: "tumour-or-apc",
    expressedOn: { text: "B cells and the T-cell surface; erythroleukaemia and small-cell lung carcinoma cell lines.", source: UNIPROT("P25063") },
    partners: ["siglec10"],
    drugs: [],
    pipelineNotes: [{ text: "IMM47 (anti-CD24) entered a phase 1 study in advanced solid tumours; the registry status is unknown.", source: NCT("NCT05985083") }],
  },
  {
    id: "siglec10", classId: "innate", label: "Siglec-10", symbol: "SIGLEC10", hgnc: "HGNC:15620", side: "macrophage",
    expressedOn: { text: "Peripheral blood leukocytes: eosinophils, monocytes and an NK-cell subpopulation; an inhibitory receptor that recruits phosphatases on ligand binding.", source: UNIPROT("Q96LC7") },
    partners: ["cd24"],
    drugs: [],
  },
  {
    id: "lilrb1", classId: "innate", label: "LILRB1 (ILT2)", symbol: "LILRB1", hgnc: "HGNC:6605", side: "macrophage",
    expressedOn: { text: "B cells, monocytes and myeloid, plasmacytoid and tolerogenic dendritic cells; decidual macrophages and NK cells (protein level).", source: UNIPROT("Q8NHL6") },
    partners: [],
    partnerNote: { text: "Classical and non-classical HLA class I (HLA-A, B, C, G and F); engagement protects the target cell from lysis.", source: UNIPROT("Q8NHL6") },
    drugs: [],
    pipelineNotes: [{ text: "NGM707 (anti-LILRB1/LILRB2) reached phase 1/2 with pembrolizumab; a later phase 2 study was withdrawn by the sponsor.", source: NCT("NCT04913337") }],
  },
  {
    id: "lilrb2", classId: "innate", label: "LILRB2 (ILT4)", symbol: "LILRB2", hgnc: "HGNC:6606", side: "macrophage",
    expressedOn: { text: "Monocytes, at lower levels myeloid and plasmacytoid dendritic cells; tolerogenic IL-10-producing dendritic cells, myeloid-derived suppressor cells, B cells and low levels in NK cells.", source: UNIPROT("Q8N423") },
    partners: [],
    partnerNote: { text: "HLA class I including HLA-G; LILRB receptors negatively regulate myeloid maturation and permit a suppressive myeloid phenotype in tumours.", source: CHECKPOINT_REVIEWS.lilrb },
    drugs: [],
    pipelineNotes: [{ text: "MK-4830 (anti-LILRB2) is in phase 2 with pembrolizumab, including a completed study with chemotherapy in ovarian cancer.", source: NCT("NCT05446870") }],
  },

  // ---------------------------------------------------------------- co-stimulatory receptors and agonist targets
  {
    id: "cd28", classId: "costimulatory", label: "CD28", symbol: "CD28", hgnc: "HGNC:1653", side: "immune-cell",
    expressedOn: { text: "T cells and plasma cells, not less mature B cells; the receptor for CD80 and CD86 that amplifies T-cell receptor signals.", source: UNIPROT("P10747") },
    partners: ["cd80", "cd86"],
    drugs: [{ id: "jnj-87189401", drugClass: "bispecific", note: "PSMA x CD28 co-stimulatory bispecific" }],
  },
  {
    id: "icos", classId: "costimulatory", label: "ICOS", symbol: "ICOS", hgnc: "HGNC:5351", side: "immune-cell",
    expressedOn: { text: "Activated and antigen-experienced T cells; highly expressed on tonsillar T cells in germinal centres.", source: UNIPROT("Q9Y6W8") },
    partners: [],
    partnerNote: { text: "ICOS ligand (ICOSL) on antigen-presenting cells.", source: UNIPROT("Q9Y6W8") },
    drugs: [{ id: "feladilimab", drugClass: "agonist" }],
    discontinued: [{ name: "Feladilimab (INDUCE-3 and INDUCE-4, head and neck cancer)", reason: "The trial was stopped by the sponsor based on assessment of the clinical data.", source: NCT("NCT04128696") }],
  },
  {
    id: "tnfrsf4", classId: "costimulatory", label: "OX40", symbol: "TNFRSF4", hgnc: "HGNC:11918", side: "immune-cell",
    expressedOn: { text: "Activated T cells; OX40 ligation augments CD4 and CD8 T-cell clonal expansion, effector differentiation and survival.", source: CHECKPOINT_REVIEWS.ox40 },
    partners: [],
    partnerNote: { text: "OX40 ligand (TNFSF4).", source: UNIPROT("P43489") },
    drugs: [{ id: "inbrx-106", drugClass: "agonist", note: "hexavalent OX40 agonist" }],
  },
  {
    id: "cd137", classId: "costimulatory", label: "4-1BB (CD137)", symbol: "TNFRSF9", hgnc: "HGNC:11924", side: "immune-cell",
    expressedOn: { text: "The surface of activated T cells; signalling enhances CD8 T-cell survival, cytotoxicity and mitochondrial activity.", source: UNIPROT("Q07011") },
    partners: [],
    partnerNote: { text: "4-1BB ligand (TNFSF9).", source: UNIPROT("Q07011") },
    drugs: [
      { id: "acasunlimab", drugClass: "bispecific", note: "PD-L1 x 4-1BB" }, { id: "utomilumab", drugClass: "agonist" },
      { id: "cinrebafusp-alfa", drugClass: "fusion-protein", note: "HER2 x 4-1BB anticalin" }, { id: "englumafusp-alfa", drugClass: "fusion-protein", note: "CD19-targeted 4-1BB ligand" },
    ],
    discontinued: [
      { name: "Acasunlimab (GEN1046)", reason: "Genmab decided to discontinue further clinical development of acasunlimab following strategic portfolio prioritisation; not related to safety concerns.", source: NCT("NCT03917381") },
      { name: "Utomilumab (PF-05082566)", reason: "Development programme terminated.", source: NCT("NCT03704298") },
    ],
  },
  {
    id: "tnfrsf18", classId: "costimulatory", label: "GITR", symbol: "TNFRSF18", hgnc: "HGNC:11914", side: "immune-cell",
    expressedOn: { text: "Lymph node and peripheral blood leukocytes, weakly in spleen.", source: UNIPROT("Q9Y5U5") },
    partners: [],
    partnerNote: { text: "GITR ligand (TNFSF18).", source: UNIPROT("Q9Y5U5") },
    drugs: [],
    pipelineNotes: [{ text: "BMS-986156 (GITR agonist) completed phase 1/2 alone and with nivolumab.", source: NCT("NCT02598960") }],
    discontinued: [{ name: "TRX518 (GITR agonist)", reason: "Product development discontinued unrelated to safety.", source: NCT("NCT03861403") }],
  },
  {
    id: "cd27", classId: "costimulatory", label: "CD27", symbol: "CD27", hgnc: "HGNC:11922", side: "immune-cell",
    expressedOn: { text: "Most T lymphocytes, also NK and B cells; a co-stimulatory receptor activated by CD70 on B cells.", source: UNIPROT("P26842") },
    partners: [],
    partnerNote: { text: "CD70, which has its own target page.", source: UNIPROT("P26842") },
    drugs: [],
    pipelineNotes: [{ text: "Varlilumab (CD27 agonist) reached phase 2 with nivolumab in aggressive B-cell lymphoma.", source: NCT("NCT03038672") }],
    discontinued: [{ name: "Varlilumab combination studies", reason: "Portfolio re-prioritisation.", source: NCT("NCT02386111") }],
  },
  {
    id: "cd40", classId: "costimulatory", label: "CD40", symbol: "CD40", hgnc: "HGNC:11919", side: "tumour-or-apc",
    expressedOn: { text: "B cells and primary carcinomas (UniProt); agonists license dendritic cells and re-educate macrophages.", source: CHECKPOINT_REVIEWS.cd40 },
    partners: [],
    partnerNote: { text: "CD40 ligand (CD40LG, CD154) on activated T cells.", source: UNIPROT("P25942") },
    drugs: [{ id: "selicrelumab", drugClass: "agonist" }, { id: "mitazalimab", drugClass: "agonist" }],
    discontinued: [{ name: "Selicrelumab (intratumoural, with atezolizumab)", reason: "End of drug development.", source: NCT("NCT03892525") }],
  },

  // ---------------------------------------------------------------- metabolic
  {
    id: "ido1", classId: "metabolic", label: "IDO1", symbol: "IDO1", hgnc: "HGNC:6059", side: "intracellular",
    expressedOn: { text: "Mature dendritic cells in lymphoid organs, some epithelial cells of the female genital tract, endothelial cells of term placenta and lung parenchyma; weak in most normal tissues but inducible.", source: UNIPROT("P14902") },
    partners: [],
    partnerNote: { text: "Converts tryptophan to kynurenine, which activates the aryl hydrocarbon receptor and yields tolerant dendritic cells and regulatory T cells.", source: CHECKPOINT_REVIEWS.idoTdo },
    drugs: [{ id: "epacadostat", drugClass: "small-molecule" }, { id: "io102-io103", drugClass: "vaccine" }],
    discontinued: [{ name: "Epacadostat programme after ECHO-301", reason: "Terminated due to emergent data from another study and unrelated to safety (registry text on a companion Incyte study).", source: NCT("NCT03277352") }],
  },
  {
    id: "tdo2", classId: "metabolic", label: "TDO2", symbol: "TDO2", hgnc: "HGNC:11708", side: "intracellular",
    expressedOn: { text: "Catalyses the same tryptophan-to-kynurenine commitment step as IDO1; the cited review treats IDO1 and TDO2 together as drivers of tumour immune escape. UniProt gives no tissue distribution.", source: CHECKPOINT_REVIEWS.idoTdo },
    partners: [],
    drugs: [],
    pipelineNotes: [{ text: "No TDO2-selective agent was found in ClinicalTrials.gov under the drug names the corpus knows; the LY3381916 study is an IDO1 programme and was terminated for business reasons.", source: NCT("NCT03343613") }],
  },
  {
    id: "cd73-adenosine", classId: "metabolic", label: "CD73", symbol: "NT5E", hgnc: "HGNC:8021", side: "tumour-or-apc",
    expressedOn: { text: "Broadly expressed; the ectonucleotidase that finishes the breakdown of extracellular ATP into adenosine.", source: CHECKPOINT_REVIEWS.adenosine },
    partners: ["entpd1", "adora2a"],
    drugs: [{ id: "oleclumab", drugClass: "antibody" }, { id: "quemliclustat", drugClass: "small-molecule" }, { id: "ak119", drugClass: "antibody" }, { id: "mavrostobart", drugClass: "antibody" }],
    discontinued: [{ name: "Oleclumab plus durvalumab doublet (platform arms)", reason: "Overall clinical activity (ORR) for oleclumab plus durvalumab is minimal across tumour types and does not support further evaluation of this doublet.", source: NCT("NCT04262388") }],
  },
  {
    id: "entpd1", classId: "metabolic", label: "CD39", symbol: "ENTPD1", hgnc: "HGNC:3363", side: "tumour-or-apc",
    expressedOn: { text: "Primarily activated lymphoid cells; also endothelium, and highly in placenta, lung, skeletal muscle and kidney.", source: UNIPROT("P49961") },
    partners: ["cd73-adenosine"],
    drugs: [],
    pipelineNotes: [{ text: "TTX-030 (anti-CD39) completed a phase 2 study with chemotherapy, with or without budigalimab, in first-line metastatic pancreatic cancer.", source: NCT("NCT06119217") }],
  },
  {
    id: "adora2a", classId: "metabolic", label: "Adenosine A2A receptor", symbol: "ADORA2A", hgnc: "HGNC:263", side: "immune-cell",
    expressedOn: { text: "Broadly expressed adenosine receptor; G-protein coupled, raising cyclic AMP in the cells that carry it.", source: CHECKPOINT_REVIEWS.adenosine },
    partners: ["cd73-adenosine"],
    drugs: [],
    pipelineNotes: [
      { text: "Ciforadenant (A2A antagonist) is in phase 1b/2 with ipilimumab and nivolumab.", source: NCT("NCT05501054") },
      { text: "Etrumadenant (A2A/A2B antagonist) is in phase 2 combinations in pancreatic cancer.", source: NCT("NCT06048484") },
      { text: "Inupadenant (A2A antagonist) is in phase 2 with chemotherapy in non-squamous non-small-cell lung cancer.", source: NCT("NCT05403385") },
    ],
  },

  // ---------------------------------------------------------------- other B7 family members
  {
    id: "b7h3", classId: "b7-family", label: "B7-H3 (CD276)", symbol: "CD276", hgnc: "HGNC:19137", side: "tumour-or-apc",
    expressedOn: { text: "Ubiquitous transcript but not detectable on peripheral blood lymphocytes or granulocytes; weak on resting monocytes, present on monocyte-derived dendritic cells and sinonasal epithelium.", source: UNIPROT("Q5ZPR3") },
    partners: [],
    partnerNote: { text: "Receptor not established; the protein may inhibit NK-mediated lysis of tumour cells.", source: UNIPROT("Q5ZPR3") },
    drugs: [{ id: "ifinatamab-deruxtecan", drugClass: "adc" }, { id: "yl201", drugClass: "adc" }, { id: "qlc5508", drugClass: "adc" }, { id: "bnt324", drugClass: "adc" }, { id: "hs-20093", drugClass: "adc" }, { id: "bcb-276", drugClass: "cell-therapy" }],
  },
  {
    id: "b7h4", classId: "b7-family", label: "B7-H4 (VTCN1)", symbol: "VTCN1", hgnc: "HGNC:28873", side: "tumour-or-apc",
    expressedOn: { text: "Over-expressed in breast, ovarian, endometrial, renal cell and non-small-cell lung cancers; on activated T and B cells, monocytes and dendritic cells but not most normal tissues (protein level).", source: UNIPROT("Q7Z7D3") },
    partners: [],
    drugs: [{ id: "puxitatug-samrotecan", drugClass: "adc" }, { id: "hs-20089", drugClass: "adc" }],
  },
  {
    id: "hhla2", classId: "b7-family", label: "HHLA2 (B7-H7)", symbol: "HHLA2", hgnc: "HGNC:4905", side: "tumour-or-apc",
    expressedOn: { text: "High in colon, kidney, testis, lung and pancreas; among immune cells, B cells, dendritic cells and macrophages, not T cells.", source: UNIPROT("Q9UM44") },
    partners: [],
    partnerNote: { text: "TMIGD2 (CD28H), through which it co-stimulates T cells.", source: UNIPROT("Q9UM44") },
    drugs: [],
    pipelineNotes: [{ text: "No HHLA2-directed agent is in the corpus, and none was looked up in the registry for this map; the family review lists antagonistic antibodies and agonistic fusion proteins as emerging.", source: CHECKPOINT_REVIEWS.b7family }],
  },

  // ---------------------------------------------------------------- soluble
  {
    id: "tgfb1", classId: "soluble", label: "TGF-beta 1", symbol: "TGFB1", hgnc: "HGNC:11766", side: "soluble",
    expressedOn: { text: "Stored latent in the extracellular matrix; highly expressed in bone and articular cartilage (UniProt). Up-regulated with IL-10 in HPV-driven cervical lesions to form a local immunosuppressive environment.", source: CHECKPOINT_REVIEWS.il10tgfb },
    partners: [],
    partnerNote: { text: "TGF-beta receptors I and II; the drugs in the corpus are receptor-domain traps fused to a PD-L1 or EGFR antibody, or antisense against TGF-beta 2.", source: UNIPROT("P01137") },
    drugs: [{ id: "retlirafusp-alfa", drugClass: "fusion-protein", note: "PD-L1 x TGF-beta trap" }, { id: "ficerafusp-alfa", drugClass: "fusion-protein", note: "EGFR x TGF-beta trap" }, { id: "trabedersen", drugClass: "antisense", note: "TGF-beta 2 antisense" }],
    discontinued: [
      { name: "Bintrafusp alfa (PD-L1 x TGF-beta trap) in biliary tract cancer", reason: "Discontinued as it was unlikely to meet the primary endpoint of overall survival (registry text on the neoadjuvant companion study).", source: NCT("NCT04727541") },
      { name: "Bintrafusp alfa programme", reason: "The sponsor decided to no longer develop the drug and stop support of studies using the drug.", source: NCT("NCT04220775") },
    ],
  },
  {
    id: "il10", classId: "soluble", label: "IL-10", symbol: "IL10", hgnc: "HGNC:5962", side: "soluble",
    expressedOn: { text: "Produced by T cells, macrophages, mast cells and other cell types; a major anti-inflammatory cytokine signalling through IL10RA/IL10RB to STAT3.", source: UNIPROT("P22301") },
    partners: [],
    partnerNote: { text: "The clinical programme ran the other way: pegylated IL-10 was given to stimulate CD8 T cells, and the corpus's LB4330 delivers IL-10 to Claudin 18.2-positive tumours.", source: NCT("NCT02923921") },
    drugs: [{ id: "lb4330", drugClass: "fusion-protein", note: "Claudin 18.2 x IL-10 fusion, an agonist" }],
    discontinued: [{ name: "Pegilodecakin (pegylated IL-10) with PD-1 blockade (CYPRESS-1 and CYPRESS-2)", reason: "Closed early after the planned primary analysis because the risk-benefit ratio is unfavourable.", source: NCT("NCT03382899") }],
  },

  // ================================================================ cell-intrinsic checkpoints
  {
    id: "cdk4-6", classId: "g1-s", label: "CDK4/6", symbol: "CDK4, CDK6", hgnc: "HGNC:1773, HGNC:1777", side: "intracellular", gates: ["G1/S"],
    expressedOn: { text: "Cyclin D-CDK4 complexes phosphorylate RB at the G1/S transition, releasing E2F; CDK6 is expressed ubiquitously and accumulates in squamous cell carcinomas and proliferating haematopoietic progenitors.", source: UNIPROT("Q00534") },
    partners: ["ccnd1", "rb1", "cdkn2a"],
    drugs: [
      { id: "palbociclib", drugClass: "small-molecule" }, { id: "ribociclib", drugClass: "small-molecule" }, { id: "abemaciclib", drugClass: "small-molecule" }, { id: "dalpiciclib", drugClass: "small-molecule" },
      { id: "trilaciclib", drugClass: "small-molecule", note: "given before chemotherapy to protect bone marrow" }, { id: "lerociclib", drugClass: "small-molecule" }, { id: "atirmociclib", drugClass: "small-molecule", note: "CDK4-selective" },
      { id: "bgb-43395", drugClass: "small-molecule", note: "CDK4-selective" }, { id: "tqb3616", drugClass: "small-molecule" }, { id: "avzo-023", drugClass: "small-molecule" },
    ],
  },
  {
    id: "ccnd1", classId: "g1-s", label: "Cyclin D1", symbol: "CCND1", hgnc: "HGNC:1582", side: "intracellular", gates: ["G1/S"],
    expressedOn: { text: "The regulatory component of the cyclin D1-CDK4 complex that phosphorylates RB at G1/S.", source: UNIPROT("P24385") },
    partners: ["cdk4-6"],
    drugs: [],
  },
  {
    id: "rb1", classId: "g1-s", label: "RB", symbol: "RB1", hgnc: "HGNC:9884", side: "intracellular", gates: ["G1/S"],
    expressedOn: { text: "A tumour suppressor and key regulator of the G1/S transition: the hypophosphorylated form binds E2F transcription factors and blocks their targets.", source: UNIPROT("P06400") },
    partners: ["cdk4-6"],
    drugs: [],
  },
  {
    id: "cdkn2a", classId: "g1-s", label: "p16 (CDKN2A)", symbol: "CDKN2A", hgnc: "HGNC:1787", side: "intracellular", gates: ["G1/S"],
    expressedOn: { text: "Widely expressed, not detected in brain or skeletal muscle; binds CDK4 and CDK6 and stops them pairing with cyclin D and phosphorylating RB.", source: UNIPROT("P42771") },
    partners: ["cdk4-6"],
    drugs: [],
  },
  {
    id: "atr", classId: "g2-m", label: "ATR", symbol: "ATR", hgnc: "HGNC:882", side: "intracellular", gates: ["G2/M", "DDR"],
    expressedOn: { text: "Ubiquitous, highest in testis; a sensor kinase that starts checkpoint signalling on replication stalling, ultraviolet light or ionising radiation.", source: UNIPROT("Q13535") },
    partners: ["chek1"],
    drugs: [{ id: "ceralasertib", drugClass: "small-molecule" }, { id: "camonsertib", drugClass: "small-molecule" }],
    discontinued: [{ name: "Ceralasertib (AZD6738) programme", reason: "The study terminated because the clinical development programme for ceralasertib has been discontinued (registry text, December 2025).", source: NCT("NCT06929260") }],
  },
  {
    id: "chek1", classId: "g2-m", label: "CHK1", symbol: "CHEK1", hgnc: "HGNC:1925", side: "intracellular", gates: ["G2/M", "DDR"],
    expressedOn: { text: "Ubiquitous, most abundant in thymus, testis, small intestine and colon; required for checkpoint arrest and repair activation when DNA is damaged or unreplicated.", source: UNIPROT("O14757") },
    partners: ["atr", "wee1"],
    drugs: [],
    pipelineNotes: [{ text: "Prexasertib (ACR-368, a CHK1/2 inhibitor) completed phase 2 in platinum-resistant ovarian cancer and is in phase 2 in endometrial cancer.", source: NCT("NCT03414047") }],
    discontinued: [{ name: "Prexasertib (Lilly era)", reason: "Eli Lilly prematurely terminated the study.", source: NCT("NCT02203513") }],
  },
  {
    id: "wee1", classId: "g2-m", label: "WEE1", symbol: "WEE1", hgnc: "HGNC:12761", side: "intracellular", gates: ["G2/M"],
    expressedOn: { text: "A negative regulator of entry into mitosis that phosphorylates CDK1 on tyrosine 15, peaking in G2.", source: UNIPROT("P30291") },
    partners: ["chek1"],
    drugs: [{ id: "azenosertib", drugClass: "small-molecule" }, { id: "adavosertib", drugClass: "small-molecule" }, { id: "wjb001", drugClass: "small-molecule" }],
    discontinued: [
      { name: "Adavosertib (AZD1775) programme", reason: "Study terminated because the clinical development programme for adavosertib has been discontinued.", source: NCT("NCT04949425") },
      { name: "Azenosertib with carboplatin and pembrolizumab in triple-negative breast cancer", reason: "Terminated due to concern for toxicity from previously reported serious adverse events; never reached phase 2.", source: NCT("NCT06351332") },
    ],
  },
  {
    id: "plk1", classId: "g2-m", label: "PLK1", symbol: "PLK1", hgnc: "HGNC:9077", side: "intracellular", gates: ["G2/M", "SAC"],
    expressedOn: { text: "Placenta and colon (UniProt tissue); acts throughout M phase on centrosome maturation, spindle assembly, cohesin removal and mitotic exit.", source: UNIPROT("P53350") },
    partners: ["aurka"],
    drugs: [{ id: "onvansertib", drugClass: "small-molecule" }],
    discontinued: [{ name: "Volasertib (Boehringer Ingelheim)", reason: "Development programme of study drug volasertib was stopped by Boehringer Ingelheim due to manufacturing problems.", source: NCT("NCT02198482") }],
  },
  {
    id: "atm", classId: "ddr", label: "ATM", symbol: "ATM", hgnc: "HGNC:795", side: "intracellular", gates: ["DDR"],
    expressedOn: { text: "Pancreas, kidney, skeletal muscle, liver, lung, placenta, brain, heart, spleen, thymus, testis, ovary, small intestine, colon and leukocytes; the sensor kinase for double-strand breaks.", source: UNIPROT("Q13315") },
    partners: ["chek2"],
    drugs: [],
    pipelineNotes: [
      { text: "AZD1390 (brain-penetrant ATM inhibitor) is an arm of a phase 2/3 glioblastoma platform study with radiotherapy.", source: NCT("NCT03970447") },
      { text: "AZD0156 (ATM inhibitor) completed a phase 1 study alone and with olaparib or chemotherapy.", source: NCT("NCT02588105") },
    ],
  },
  {
    id: "chek2", classId: "ddr", label: "CHK2", symbol: "CHEK2", hgnc: "HGNC:16627", side: "intracellular", gates: ["DDR"],
    expressedOn: { text: "High in testis, spleen, colon and peripheral blood leukocytes; relays double-strand break signals into arrest, repair or apoptosis.", source: UNIPROT("O96017") },
    partners: ["atm", "tp53"],
    drugs: [],
    pipelineNotes: [{ text: "No CHK2-selective agent is in trials under the names the corpus knows; prexasertib inhibits CHK1 and CHK2 together.", source: NCT("NCT03414047") }],
  },
  {
    id: "tp53", classId: "ddr", label: "p53", symbol: "TP53", hgnc: "HGNC:11998", side: "intracellular", gates: ["G1/S", "DDR"],
    expressedOn: { text: "Ubiquitous; a transcription factor that induces cell-cycle arrest, DNA repair or apoptosis, mutated in more than half of cancers.", source: UNIPROT("P04637") },
    partners: ["chek2"],
    partnerNote: { text: "MDM2 degrades p53; the MDM2 antagonists brigimadlin and navtemadlin (KRT-232) are the way wild-type p53 is drugged, and have their own target page.", source: UNIPROT("P04637") },
    drugs: [{ id: "eprenetapopt", drugClass: "small-molecule", note: "claimed mutant-p53 reactivator" }, { id: "brigimadlin", drugClass: "small-molecule", note: "MDM2 antagonist, restores wild-type p53" }, { id: "krt-232", drugClass: "small-molecule", note: "MDM2 antagonist" }],
    pipelineNotes: [{ text: "Rezatapopt (PC14586), a corrector of the TP53 Y220C mutant, is in phase 1/2.", source: NCT("NCT04585750") }],
  },
  {
    id: "parp", classId: "ddr", label: "PARP1", symbol: "PARP1", hgnc: "HGNC:270", side: "intracellular", gates: ["DDR"],
    expressedOn: { text: "A poly-ADP-ribosyltransferase with a key role in DNA repair; its inhibitors are lethal to cells that have also lost homologous recombination.", source: UNIPROT("P09874") },
    partners: [],
    partnerNote: { text: "Synthetic lethality with BRCA1/2 and other homologous-recombination losses, which have their own target page.", source: UNIPROT("P09874") },
    drugs: [
      { id: "olaparib", drugClass: "small-molecule" }, { id: "niraparib", drugClass: "small-molecule" }, { id: "rucaparib", drugClass: "small-molecule" }, { id: "talazoparib", drugClass: "small-molecule" },
      { id: "saruparib", drugClass: "small-molecule", note: "PARP1-selective" }, { id: "pamiparib", drugClass: "small-molecule" }, { id: "fluzoparib", drugClass: "small-molecule" }, { id: "iniparib", drugClass: "small-molecule", note: "later shown not to inhibit PARP" },
    ],
  },
  {
    id: "aurka", classId: "spindle", label: "Aurora A", symbol: "AURKA", hgnc: "HGNC:11393", side: "intracellular", gates: ["SAC"],
    expressedOn: { text: "High in testis, weak in skeletal muscle, thymus and spleen; high in colon, ovarian, prostate, neuroblastoma, breast and cervical cancer cell lines. Builds the spindle and separates centrosomes.", source: UNIPROT("O14965") },
    partners: ["plk1"],
    drugs: [{ id: "alisertib", drugClass: "small-molecule" }, { id: "tinengotinib", drugClass: "small-molecule", note: "multi-kinase, Aurora among its targets" }],
    pipelineNotes: [{ text: "Alisertib completed a phase 3 trial against investigator's choice in relapsed peripheral T-cell lymphoma.", source: NCT("NCT01482962") }],
  },
  {
    id: "aurkb", classId: "spindle", label: "Aurora B", symbol: "AURKB", hgnc: "HGNC:11390", side: "intracellular", gates: ["SAC"],
    expressedOn: { text: "High in thymus; spleen, lung, testis, colon, placenta and fetal liver; up-regulated in cancer cells during M phase, absent from normal liver and high in metastatic liver.", source: UNIPROT("Q96GD4") },
    partners: ["ttk"],
    drugs: [],
    discontinued: [{ name: "Barasertib (AZD2811 nanoparticle)", reason: "Strategic decision (phase 1 study terminated).", source: NCT("NCT03217838") }],
  },
  {
    id: "ttk", classId: "spindle", label: "MPS1 (TTK)", symbol: "TTK", hgnc: "HGNC:12401", side: "intracellular", gates: ["SAC"],
    expressedOn: { text: "Present in rapidly proliferating cell lines; phosphorylates MAD1 to arm the spindle assembly checkpoint and repairs wrong kinetochore attachments.", source: UNIPROT("P33981") },
    partners: ["bub1", "aurkb"],
    drugs: [],
    pipelineNotes: [{ text: "CFI-402257 (TTK inhibitor) is in phase 1/2 alone, with fulvestrant, and with paclitaxel in breast cancer.", source: NCT("NCT05251714") }],
  },
  {
    id: "bub1", classId: "spindle", label: "BUB1", symbol: "BUB1", hgnc: "HGNC:1148", side: "intracellular", gates: ["SAC"],
    expressedOn: { text: "High in testis and thymus, less in colon, spleen, lung and small intestine; tissues with a high mitotic index. Assembles checkpoint proteins at the kinetochore.", source: UNIPROT("O43683") },
    partners: ["ttk"],
    drugs: [],
    pipelineNotes: [{ text: "No BUB1 inhibitor was found in ClinicalTrials.gov (a search for BAY 1816032 returned no studies); the target is preclinical.", source: { label: "ClinicalTrials.gov search, 24 September 2026", url: "https://clinicaltrials.gov/search?intr=BAY%201816032" } }],
  },
];

/** Target ids that are immune checkpoints; src/data/index.ts adds the "immune-checkpoint" role to each record. */
export const IMMUNE_CHECKPOINT_TARGET_IDS: ReadonlySet<string> = new Set(
  CHECKPOINT_MEMBERS.filter((m) => CHECKPOINT_CLASSES.find((c) => c.id === m.classId)?.root === "immune").map((m) => m.id),
);

// ==================================================================================================================
// New target records, from the HGNC REST API (rest.genenames.org/fetch/symbol/<SYMBOL>) and the UniProt REST API
// (rest.uniprot.org/uniprotkb/<ACC>.json, function and tissue-specificity comments), read 24 September 2026. Ids are
// the kebab-cased gene symbol, as the generated gene layer uses. Cancers, drugs and technologies are the corpus's own.
// ==================================================================================================================
const asOf = "2026-09-24";
const provenance = { editedBy: "OnCo checkpoint map (HGNC REST, UniProt REST, ClinicalTrials.gov v2)", editedOn: asOf };
type T = Omit<TargetInput, "kind" | "asOf" | "provenance" | "tags">;
const target = (x: T): TargetInput => ({
  kind: "target", asOf, provenance, tags: ["checkpoint-map"],
  ...x,
  sources: [
    ...(x.hgnc ? [{ label: `HGNC ${x.hgnc}`, url: HGNC_URL(x.hgnc), note: "approved symbol, name, aliases and cross-references" }] : []),
    ...(x.uniprot ? [{ label: `UniProt ${x.uniprot}`, url: UNIPROT(x.uniprot).url, note: "protein name, function and tissue specificity" }] : []),
    ...(x.sources ?? []),
  ],
  links: [
    ...(x.hgnc ? [{ label: `HGNC ${x.hgnc}`, url: HGNC_URL(x.hgnc) }] : []),
    ...(x.uniprot ? [{ label: `UniProt ${x.uniprot}`, url: UNIPROT(x.uniprot).url }] : []),
    ...(x.entrez ? [{ label: `NCBI Gene ${x.entrez}`, url: GENE(x.entrez) }] : []),
    ...(x.links ?? []),
  ],
  notes: ["Prevalence not recorded: HGNC and UniProt carry no positivity rates.", ...(x.notes ?? [])],
});
const IC: TargetInput["role"] = ["immune-checkpoint"];

export const checkpointTargets: TargetInput[] = [
  target({ id: "btla", name: "BTLA", symbol: "BTLA", aka: ["B and T lymphocyte associated", "CD272", "BTLA1"], hgnc: "HGNC:21087", ensembl: "ENSG00000186265", uniprot: "Q7Z6A9", entrez: "151888", targetClass: "checkpoint", role: IC,
    tldr: "BTLA is a brake on T and B cells that is pressed by HVEM, a molecule many tumours carry. An antibody that blocks it is being tested with PD-1 blockade in small-cell lung cancer.",
    summary: "BTLA (chromosome 3q13.2) is an inhibitory receptor on lymphocytes that negatively regulates antigen-receptor signalling through the phosphatases SHP-1 and SHP-2, and can interact with TNFRSF14 (HVEM) in cis on the same cell or in trans on other cells; in cis it appears to restrain trans interactions in naive T cells (UniProt Q7Z6A9). Its partner HVEM binds four distinct ligands, LIGHT, lymphotoxin-alpha, BTLA and CD160, forming a network of stimulatory and inhibitory signals (UniProt Q92956). Tifcemalimab, an anti-BTLA antibody, is in a phase 3 consolidation study with toripalimab in limited-stage small-cell lung cancer (ClinicalTrials.gov NCT06095583).",
    biology: "An immunoglobulin-superfamily receptor with ITIM motifs; the HVEM interaction is the only established ligand pair.",
    whereFound: ["Lymphocytes (UniProt Q7Z6A9)", "Small-cell lung cancer trials of tifcemalimab with toripalimab (NCT06095583)"],
    cancers: ["sclc"], pathways: ["pd1-checkpoint"], technologies: ["checkpoint-inhibitor"], related: ["tnfrsf14", "toripalimab", "pd1"],
    links: [{ label: "ClinicalTrials.gov NCT06095583", url: "https://clinicaltrials.gov/study/NCT06095583" }] }),

  target({ id: "klrc1", name: "NKG2A (KLRC1)", symbol: "KLRC1", aka: ["NKG2A", "NKG2-A", "CD159a", "killer cell lectin like receptor C1"], hgnc: "HGNC:6374", ensembl: "ENSG00000134545", uniprot: "P26715", entrez: "3821", targetClass: "checkpoint", role: IC,
    tldr: "NKG2A is the brake on NK cells and some killer T cells that is pressed by HLA-E, a molecule tumours raise to look like self. Monalizumab blocks it and is in phase 3 with durvalumab in lung cancer and with cetuximab in head and neck cancer.",
    summary: "KLRC1 (chromosome 12p13.2) encodes NKG2A, which pairs with CD94 (KLRD1) on cytotoxic and regulatory lymphocytes and recognises the non-classical class Ib molecule HLA-E loaded with signal-sequence peptides from classical class Ia molecules, letting cytotoxic cells monitor MHC class I on healthy cells and tolerate them (UniProt P26715). It is predominantly expressed on NK cells and on subsets of intraepithelial, gamma-delta and memory CD8 T cells (protein level). Monalizumab, an anti-NKG2A antibody, is in the PACIFIC-9 phase 3 study with durvalumab after chemoradiotherapy in stage III non-small-cell lung cancer (NCT05221840) and the INTERLINK-1 phase 3 with cetuximab in head and neck squamous cell carcinoma (NCT04590963).",
    biology: "A C-type lectin-like inhibitory receptor; the CD94/NKG2A heterodimer reads HLA-E and signals through ITIMs.",
    whereFound: ["NK cells; intraepithelial and memory CD8 T-cell subsets (UniProt P26715)", "Non-small-cell lung cancer and head and neck cancer trials of monalizumab"],
    cancers: ["nsclc"], pathways: ["cancer-immunity-cycle"], technologies: ["checkpoint-inhibitor"], drugs: ["monalizumab"], related: ["hla-e", "nk-cell", "durvalumab"],
    links: [{ label: "ClinicalTrials.gov NCT05221840", url: "https://clinicaltrials.gov/study/NCT05221840" }] }),

  target({ id: "kir2dl1", name: "KIR2DL1 (inhibitory KIR)", symbol: "KIR2DL1", aka: ["KIR", "CD158a", "p58.1", "KIR2DL2", "KIR2DL3", "CD158b"], hgnc: "HGNC:6329", ensembl: "ENSG00000125498", uniprot: "P43626", entrez: "3802", targetClass: "checkpoint", role: IC,
    tldr: "Inhibitory KIRs are the receptors NK cells use to recognise a person's own HLA-C and stand down. Lirilumab, an antibody that blocks three of them, reached phase 2 but was dropped for blood cancers.",
    summary: "KIR2DL1 (chromosome 19q13.42) is a receptor on NK cells for HLA-C alleles such as Cw4 and Cw6 that inhibits NK activity and so prevents lysis of the cell it recognises (UniProt P43626); KIR2DL3 does the same for HLA-Cw1, Cw3 and Cw7 (UniProt P43628). Lirilumab, an antibody against KIR2DL1, KIR2DL2 and KIR2DL3, was tested in phase 1/2 with nivolumab in solid tumours (NCT01714739); enrolment in myelodysplastic syndromes stopped after the sponsor decided not to pursue lirilumab for myeloid malignancies (NCT02599649), and a relapsed AML study ended because response rates did not reach the anticipated minimum of 30 percent (NCT02399917).",
    biology: "Immunoglobulin-like receptors with long cytoplasmic tails (2DL, 3DL) inhibit through ITIMs; short-tailed KIRs activate. This record stands for the inhibitory KIR2DL group the antibody binds.",
    whereFound: ["NK cells (UniProt P43626)", "Myelodysplastic syndromes and acute myeloid leukaemia trials of lirilumab (terminated)"],
    cancers: ["mds", "aml"], pathways: ["cancer-immunity-cycle"], technologies: ["checkpoint-inhibitor"], related: ["klrc1", "nk-cell", "nivolumab"],
    links: [{ label: "ClinicalTrials.gov NCT02599649", url: "https://clinicaltrials.gov/study/NCT02599649" }] }),

  target({ id: "cd96", name: "CD96", symbol: "CD96", aka: ["TACTILE", "CD96 molecule", "T-cell surface protein tactile"], hgnc: "HGNC:16892", ensembl: "ENSG00000153283", uniprot: "P40200", entrez: "10225", targetClass: "checkpoint", role: IC,
    tldr: "CD96 sits on T and NK cells and binds CD155, the same molecule TIGIT reads on tumour cells. It is the least tested of that family; one blocking antibody is in phase 2 platform trials in lung cancer.",
    summary: "CD96 (chromosome 3q13.13) may mediate adhesive interactions of activated T and NK cells in the late phase of the immune response, promoting NK-cell adhesion to targets through PVR (CD155) on the target cell; it is expressed on normal T-cell lines and clones and at very low levels on activated B cells (UniProt P40200). CD155 is the ligand for the co-stimulatory receptor CD226 and the co-inhibitory receptors TIGIT and CD96 (Kučan Brlić et al. 2017). GSK6097608, an anti-CD96 antibody, is being tested in phase 2 platform studies with dostarlimab in non-small-cell lung cancer (NCT05565378, NCT03739710).",
    biology: "An immunoglobulin-superfamily receptor of the TIGIT/CD226 axis competing for CD155.",
    whereFound: ["T cells and NK cells (UniProt P40200)", "Non-small-cell lung cancer platform trials of GSK6097608"],
    cancers: ["nsclc"], pathways: ["cancer-immunity-cycle"], technologies: ["checkpoint-inhibitor", "tigit-blockade"], related: ["pvr", "tigit", "dostarlimab"],
    links: [{ label: "ClinicalTrials.gov NCT05565378", url: "https://clinicaltrials.gov/study/NCT05565378" }] }),

  target({ id: "pvrig", name: "PVRIG (CD112R)", symbol: "PVRIG", aka: ["CD112R", "PVR related immunoglobulin domain containing", "C7orf15"], hgnc: "HGNC:32190", ensembl: "ENSG00000213413", uniprot: "Q6DKI7", entrez: "79037", targetClass: "checkpoint", role: IC,
    tldr: "PVRIG is a brake on killer T cells and NK cells that reads CD112 on tumour cells, a cousin of the TIGIT pair. The antibody COM701 blocks it and is being tested in ovarian cancer.",
    summary: "PVRIG (chromosome 7q22.1) is a cell-surface receptor for NECTIN2 (CD112) that may act as a co-inhibitory receptor suppressing T-cell receptor signals, inhibits T-cell proliferation after NECTIN2 binding and competes with CD226 for it; it is expressed at low levels on freshly isolated T and NK cells, predominantly memory and effector CD8 T cells and both CD16-positive and CD16-negative NK cells, and not on B cells, naive or helper T cells, monocytes or neutrophils (UniProt Q6DKI7). COM701 completed a phase 1/2 study with the TIGIT antibody BMS-986207 and nivolumab (NCT04570839) and is recruiting in relapsed platinum-sensitive ovarian cancer (NCT06888921).",
    biology: "An immunoglobulin-domain receptor with an ITIM-like tail; part of the CD226/TIGIT/CD96/PVRIG axis over CD155 and CD112.",
    whereFound: ["Memory and effector CD8 T cells and NK cells (UniProt Q6DKI7)", "Ovarian cancer trial of COM701 (NCT06888921)"],
    cancers: ["ovarian"], pathways: ["cancer-immunity-cycle"], technologies: ["checkpoint-inhibitor", "tigit-blockade"], companies: ["compugen"], related: ["nectin2", "tigit", "nivolumab"],
    links: [{ label: "ClinicalTrials.gov NCT06888921", url: "https://clinicaltrials.gov/study/NCT06888921" }, { label: "Compugen, which predicted the target computationally and made the antibody", url: "https://www.cgen.com" }] }),

  target({ id: "cd86", name: "CD86 (B7-2)", symbol: "CD86", aka: ["B7-2", "B7.2", "CD28LG2", "CD86 molecule"], hgnc: "HGNC:1705", ensembl: "ENSG00000114013", uniprot: "P42081", entrez: "942", targetClass: "checkpoint", role: IC,
    tldr: "CD86 is one of the two B7 molecules on antigen-presenting cells that either wake a T cell up (through CD28) or calm it down (through CTLA-4). Ipilimumab works by stopping CTLA-4 from hogging CD86 and CD80.",
    summary: "CD86 (chromosome 3q13.33) is a costimulatory molecule of the immunoglobulin superfamily on the surface of antigen-presenting cells that acts as the primary auxiliary signal augmenting the MHC/TCR signal in naive T cells by binding the constitutively expressed CD28 receptor (UniProt P42081). CTLA-4 binds CD80 and CD86 with considerably stronger affinity than CD28 does and acts as a decoy receptor (UniProt P16410), which is the interaction anti-CTLA-4 antibodies release.",
    biology: "Shares the CD28/CTLA-4 ligand role with CD80; no drug in the corpus binds CD86 directly.",
    whereFound: ["Antigen-presenting cells (UniProt P42081)"],
    pathways: ["pd1-checkpoint", "cancer-immunity-cycle"], related: ["cd80", "ctla4", "cd28", "ipilimumab"] }),

  target({ id: "fgl1", name: "FGL1", symbol: "FGL1", aka: ["fibrinogen like 1", "HFREP-1", "hepassocin"], hgnc: "HGNC:3695", ensembl: "ENSG00000104760", uniprot: "Q08830", entrez: "2267", targetClass: "checkpoint", role: IC,
    tldr: "FGL1 is a liver protein that some tumours secrete; it binds LAG-3 on T cells and switches them off, separately from the MHC class II route. It explains part of how LAG-3 blockade works.",
    summary: "FGL1 (chromosome 8p22) is an immune-suppressive molecule that inhibits antigen-specific T-cell activation as a ligand of LAG-3, initiating signalling that inhibits the T-cell receptor in the immunological synapse; it binds LAG-3 independently of MHC class II, is liver-specific under normal conditions and is secreted by hepatocytes and certain tumour cells (UniProt Q08830, Q15116 context from P18627).",
    biology: "A secreted fibrinogen-family protein; the second LAG-3 ligand after MHC class II.",
    whereFound: ["Liver (UniProt Q08830)", "Secreted by certain tumour cells (UniProt P18627)"],
    pathways: ["pd1-checkpoint"], technologies: ["lag3-blockade"], related: ["lag3", "hla-dra", "relatlimab-nivolumab"] }),

  target({ id: "lgals9", name: "Galectin-9 (LGALS9)", symbol: "LGALS9", aka: ["galectin 9", "Gal-9", "LGALS9A"], hgnc: "HGNC:6570", ensembl: "ENSG00000168961", uniprot: "O00182", entrez: "3965", targetClass: "checkpoint", role: IC,
    tldr: "Galectin-9 is a sugar-binding protein that presses TIM-3 on T cells and can kill the helper T cells that carry it. Tumour blood vessels make more of it than normal ones.",
    summary: "LGALS9 (chromosome 17q11.2) encodes galectin-9, a galactoside-binding lectin that is the ligand for HAVCR2 (TIM-3); binding induces death of T-helper type 1 lymphocytes. It is expressed in peripheral blood leukocytes and lymphatic tissues and in lung, liver, breast and kidney, with higher levels in tumour endothelial cells than normal endothelium at the protein level (UniProt O00182).",
    biology: "A tandem-repeat galectin; one of two TIM-3 ligands in this map, with CEACAM1.",
    whereFound: ["Leukocytes and lymphatic tissue; tumour endothelium (UniProt O00182)"],
    pathways: ["t-cell-exhaustion"], technologies: ["tim3-blockade"], related: ["tim3", "ceacam1", "cobolimab"] }),

  target({ id: "pvr", name: "CD155 (PVR)", symbol: "PVR", aka: ["CD155", "poliovirus receptor", "Necl-5", "NECL5", "PVS"], hgnc: "HGNC:9705", ensembl: "ENSG00000073008", uniprot: "P15151", entrez: "5817", targetClass: "checkpoint", role: IC,
    tldr: "CD155 is the molecule on tumour cells that TIGIT and CD96 read; normal tissue barely shows it, many tumours show a lot. Every TIGIT antibody works by breaking the CD155 handshake.",
    summary: "PVR (chromosome 19q13.31) encodes CD155, which mediates NK-cell adhesion and triggers NK effector functions through two NK-cell receptors, CD96 and CD226, at the immunological synapse (UniProt P15151). It is barely or weakly expressed in various normal human tissues but frequently over-expressed in malignant tumours, promotes invasion and migration, is associated with shorter survival, and as the ligand of the co-stimulatory receptor CD226 and the co-inhibitory receptors TIGIT and CD96 it plays a dual role in onco-immunity (Kučan Brlić et al. 2017, Cell Mol Immunol).",
    biology: "A nectin-like adhesion molecule and the poliovirus receptor; the shared ligand of the DNAM-1/TIGIT/CD96 axis.",
    whereFound: ["Weak in normal tissue, frequently over-expressed in malignant tumours (Kučan Brlić et al. 2017)"],
    pathways: ["cancer-immunity-cycle"], technologies: ["tigit-blockade"], related: ["tigit", "cd96", "nectin2", "tiragolumab"],
    links: [{ label: "Kučan Brlić et al. 2017, Cell Mol Immunol (Europe PMC)", url: "https://europepmc.org/article/MED/28730595" }] }),

  target({ id: "nectin2", name: "CD112 (nectin-2)", symbol: "NECTIN2", aka: ["CD112", "PVRL2", "nectin-2", "PRR2", "HVEB"], hgnc: "HGNC:9707", ensembl: "ENSG00000130202", uniprot: "Q92692", entrez: "5819", targetClass: "checkpoint", role: IC,
    tldr: "CD112 is a widespread cell-adhesion molecule that can either encourage a T cell (through CD226) or hold it back (through PVRIG and TIGIT), depending on which receptor grabs it first.",
    summary: "NECTIN2 (chromosome 19q13.32) is a modulator of T-cell signalling that acts as a costimulator or a coinhibitor depending on the receptor it binds: through CD226 it stimulates proliferation and the production of IL-2, IL-5, IL-10, IL-13 and interferon gamma, through PVRIG it inhibits proliferation, and the two interactions are competitive; it is ubiquitously expressed and a probable cell-adhesion protein (UniProt Q92692). TIGIT binds PVR (CD155) or NECTIN2 (CD112) on antigen-presenting cells and sends inhibitory signals to the T cell or NK cell (UniProt Q495A1).",
    biology: "The second ligand of the TIGIT axis and the sole established ligand of PVRIG.",
    whereFound: ["Ubiquitous (UniProt Q92692)"],
    pathways: ["cancer-immunity-cycle"], technologies: ["tigit-blockade"], related: ["pvrig", "tigit", "pvr"] }),

  target({ id: "hla-e", name: "HLA-E", symbol: "HLA-E", aka: ["major histocompatibility complex, class I, E", "HLA class I histocompatibility antigen, alpha chain E"], hgnc: "HGNC:4962", ensembl: "ENSG00000204592", uniprot: "P13747", entrez: "3133", targetClass: "checkpoint", role: IC,
    tldr: "HLA-E is the self badge that NKG2A on NK cells reads. Tumours raise it to escape NK cells; monalizumab blocks the reader rather than the badge.",
    summary: "HLA-E (chromosome 6p22.1) is a non-classical MHC class Ib molecule involved in self versus non-self discrimination that, with beta-2 microglobulin, binds nonamer signal-sequence peptides from classical class Ia molecules and is read by the CD94/NKG2A inhibitory receptor (UniProt P13747). Outside lymphoid tissue its expression is restricted to endothelial cells of all vessel types; in lymphoid organs it is expressed on endothelial venules, B and T cells, monocytes, macrophages, NK cells and megakaryocytes (protein level).",
    biology: "The ligand of NKG2A (KLRC1); the same complex can activate through NKG2C.",
    whereFound: ["Endothelium; lymphoid B and T cells, monocytes, macrophages, NK cells (UniProt P13747)"],
    pathways: ["cancer-immunity-cycle"], related: ["klrc1", "monalizumab", "hla-a"] }),

  target({ id: "cd24", name: "CD24", symbol: "CD24", aka: ["CD24 molecule", "signal transducer CD24", "CD24A"], hgnc: "HGNC:1645", ensembl: "ENSG00000272398", uniprot: "P25063", entrez: "100133941", targetClass: "checkpoint", role: IC,
    tldr: "CD24 is a second 'don't eat me' badge after CD47: tumours show it to Siglec-10 on macrophages, which then leave them alone. Blocking antibodies are in first-in-human trials.",
    summary: "CD24 (chromosome 6q21) is a small GPI-anchored glycoprotein expressed on B cells and the T-cell surface and in erythroleukaemia and small-cell lung carcinoma cell lines; it modulates B-cell activation (UniProt P25063). Normally expressed by immune, epithelial, neural and muscle cells, its interaction with Siglec-10 has been implicated in tumour immune evasion, inhibiting macrophage-mediated phagocytosis as well as NK-cell cytotoxicity; monoclonal antibodies against CD24 have shown clinical safety in two trials, with limited efficacy data (Panagiotou et al. 2022). IMM47, an anti-CD24 antibody, entered a phase 1 study in advanced solid tumours (NCT05985083, status unknown).",
    biology: "A heavily glycosylated GPI-anchored surface protein; the ligand of Siglec-10.",
    whereFound: ["B cells, T-cell surface (UniProt P25063)", "Epithelial tumours, per the cited review"],
    pathways: ["cancer-immunity-cycle"], technologies: ["cd47-blockade"], related: ["siglec10", "cd47", "macrophage"],
    links: [{ label: "Panagiotou et al. 2022, Cancers (Europe PMC)", url: "https://europepmc.org/article/MED/36013184" }] }),

  target({ id: "siglec10", name: "Siglec-10", symbol: "SIGLEC10", aka: ["SIGLEC-10", "sialic acid binding Ig like lectin 10", "SLG2"], hgnc: "HGNC:15620", ensembl: "ENSG00000142512", uniprot: "Q96LC7", entrez: "89790", targetClass: "checkpoint", role: IC,
    tldr: "Siglec-10 is the receptor on macrophages and other blood cells that reads the CD24 'don't eat me' badge on tumour cells and calls off the attack.",
    summary: "SIGLEC10 (chromosome 19q13.41) is a sialic-acid-binding immunoglobulin-like lectin that preferentially binds alpha-2,3- or alpha-2,6-linked sialic acid and seems to act as an inhibitory receptor in the immune response, recruiting cytoplasmic phosphatases through its ITIMs on ligand-induced phosphorylation; it is expressed by peripheral blood leukocytes (eosinophils, monocytes and an NK-cell subpopulation) and in lymph node, lung, ovary and appendix (UniProt Q96LC7). The CD24-Siglec-10 interaction inhibits macrophage phagocytosis and NK cytotoxicity (Panagiotou et al. 2022).",
    biology: "An ITIM-bearing Siglec; the receptor half of the CD24 pair.",
    whereFound: ["Eosinophils, monocytes, an NK subpopulation (UniProt Q96LC7)"],
    pathways: ["cancer-immunity-cycle"], related: ["cd24", "sirpa", "macrophage"] }),

  target({ id: "lilrb1", name: "LILRB1 (ILT2)", symbol: "LILRB1", aka: ["ILT2", "LIR-1", "CD85j", "leukocyte immunoglobulin like receptor B1"], hgnc: "HGNC:6605", ensembl: "ENSG00000104972", uniprot: "Q8NHL6", entrez: "10859", targetClass: "checkpoint", role: IC,
    tldr: "LILRB1 is a brake on macrophages, dendritic cells and some NK and T cells that reads ordinary HLA class I, so any cell showing HLA is protected. Antibodies that block it, with or without LILRB2, are in early trials.",
    summary: "LILRB1 (chromosome 19q13.42) is a receptor for class I MHC antigens that recognises a broad spectrum of HLA-A, HLA-B, HLA-C, HLA-G and HLA-F alleles and the cytomegalovirus homologue UL18; ligand binding gives inhibitory signals and down-regulates the immune response, and engagement on NK or T cells protects the target from lysis. It is expressed in B cells, monocytes and myeloid, plasmacytoid and tolerogenic dendritic cells, in decidual macrophages and decidual NK cells (protein level) (UniProt Q8NHL6). NGM707, an antibody against LILRB1 and LILRB2, was studied in phase 1/2 with pembrolizumab (NCT04913337); a later phase 2 study was withdrawn by the sponsor (NCT07511972).",
    biology: "An ITIM-bearing LILR; LILRB receptors negatively regulate myeloid maturation and permit a suppressive myeloid phenotype in tumours (van der Touw et al. 2017).",
    whereFound: ["B cells, monocytes, dendritic cells, decidual macrophages and NK cells (UniProt Q8NHL6)"],
    pathways: ["cancer-immunity-cycle"], related: ["lilrb2", "hla-a", "pembrolizumab"],
    links: [{ label: "ClinicalTrials.gov NCT04913337", url: "https://clinicaltrials.gov/study/NCT04913337" }] }),

  target({ id: "lilrb2", name: "LILRB2 (ILT4)", symbol: "LILRB2", aka: ["ILT4", "LIR-2", "CD85d", "leukocyte immunoglobulin like receptor B2"], hgnc: "HGNC:6606", ensembl: "ENSG00000131042", uniprot: "Q8N423", entrez: "10288", targetClass: "checkpoint", role: IC,
    tldr: "LILRB2 is a brake on monocytes and dendritic cells that reads HLA-G and other HLA class I molecules and keeps them in a tolerant, tumour-friendly state. The antibody MK-4830 blocks it and is in phase 2 with pembrolizumab.",
    summary: "LILRB2 (chromosome 19q13.42) is a receptor for class I MHC antigens across HLA-A, B, C, G and F that is involved in down-regulating the immune response and developing tolerance, and recognises peptide-bound HLA-G with beta-2 microglobulin; it is expressed in monocytes, at lower levels in myeloid and plasmacytoid dendritic cells, in tolerogenic IL-10-producing dendritic cells, in myeloid-derived suppressor cells during pregnancy, at low levels in NK cells and in B cells (UniProt Q8N423). MK-4830 is in phase 2 studies with pembrolizumab, including a completed study with chemotherapy in ovarian cancer (NCT05446870) and a platform study in solid tumours (NCT04895722).",
    biology: "An ITIM-bearing LILR of myeloid cells; the murine orthologue PIRB regulates myeloid-derived suppressor cell development and a tumour-permissive microenvironment (van der Touw et al. 2017).",
    whereFound: ["Monocytes, dendritic cells, myeloid-derived suppressor cells (UniProt Q8N423)", "Ovarian cancer trial of MK-4830 (NCT05446870)"],
    cancers: ["ovarian"], pathways: ["cancer-immunity-cycle"], related: ["lilrb1", "hla-a", "pembrolizumab"],
    links: [{ label: "ClinicalTrials.gov NCT05446870", url: "https://clinicaltrials.gov/study/NCT05446870" }, { label: "van der Touw et al. 2017 (Europe PMC)", url: "https://europepmc.org/article/MED/28638976" }] }),

  target({ id: "tnfrsf4", name: "OX40 (TNFRSF4)", symbol: "TNFRSF4", aka: ["OX40", "CD134", "ACT35", "TNF receptor superfamily member 4"], hgnc: "HGNC:11918", ensembl: "ENSG00000186827", uniprot: "P43489", entrez: "7293", targetClass: "surface-antigen", role: IC,
    tldr: "OX40 is an accelerator that appears on T cells once they are switched on; pressing it makes them multiply and survive longer. Agonist antibodies against it are in trials, including a phase 3 in head and neck cancer.",
    summary: "TNFRSF4 (chromosome 1p36.33) encodes OX40, the receptor for OX40 ligand (TNFSF4) and a costimulatory molecule implicated in long-term T-cell immunity (UniProt P43489). OX40 ligation augments CD4 and CD8 T-cell clonal expansion, effector differentiation and survival, and in some cases abrogates the suppressive activity of regulatory T cells (Croft 2009, Immunol Rev). INBRX-106, a hexavalent OX40 agonist antibody, is in a phase 2/3 study with pembrolizumab in first-line PD-L1-high head and neck squamous cell carcinoma (NCT06295731).",
    biology: "A TNF-receptor-superfamily costimulator induced on activated T cells; agonists need receptor clustering, which is why hexavalent formats are tried.",
    whereFound: ["Activated T cells (Croft 2009)", "Head and neck squamous cell carcinoma trial of INBRX-106 (NCT06295731)"],
    pathways: ["cancer-immunity-cycle"], drugs: ["inbrx-106"], related: ["cd137", "tnfrsf18", "pembrolizumab"],
    links: [{ label: "Croft 2009, Immunol Rev (Europe PMC)", url: "https://europepmc.org/article/MED/19538134" }] }),

  target({ id: "tnfrsf18", name: "GITR (TNFRSF18)", symbol: "TNFRSF18", aka: ["GITR", "AITR", "CD357", "TNF receptor superfamily member 18"], hgnc: "HGNC:11914", ensembl: "ENSG00000186891", uniprot: "Q9Y5U5", entrez: "8784", targetClass: "surface-antigen", role: IC,
    tldr: "GITR is an accelerator on T cells that agonist antibodies tried to press to boost immunotherapy. Several reached early trials; one programme was dropped for reasons unrelated to safety.",
    summary: "TNFRSF18 (chromosome 1p36.33) encodes GITR, the receptor for TNFSF18 (GITR ligand), which seems to be involved in interactions between activated T lymphocytes and endothelial cells and in the regulation of T-cell-receptor-mediated cell death, and mediates NF-kappa-B activation through the TRAF2/NIK pathway; it is expressed in lymph node and peripheral blood leukocytes and weakly in spleen (UniProt Q9Y5U5). BMS-986156, a GITR agonist, completed phase 1/2 alone and with nivolumab (NCT02598960); TRX518 was discontinued for reasons unrelated to safety (NCT03861403).",
    biology: "A TNF-receptor-superfamily costimulator on activated and regulatory T cells.",
    whereFound: ["Lymph node and peripheral blood leukocytes (UniProt Q9Y5U5)"],
    pathways: ["cancer-immunity-cycle"], related: ["tnfrsf4", "cd137", "nivolumab"],
    links: [{ label: "ClinicalTrials.gov NCT02598960", url: "https://clinicaltrials.gov/study/NCT02598960" }] }),

  target({ id: "cd27", name: "CD27", symbol: "CD27", aka: ["TNFRSF7", "CD27 molecule", "Tp55", "S152"], hgnc: "HGNC:11922", ensembl: "ENSG00000139193", uniprot: "P26842", entrez: "939", targetClass: "surface-antigen", role: IC,
    tldr: "CD27 is an accelerator on most T cells that is pressed by CD70. Agonist antibodies against it reached phase 2 in lymphoma; its partner CD70 is a separate target for antibodies and CAR-T cells.",
    summary: "CD27 (chromosome 12p13.31) is a costimulatory immune-checkpoint receptor on T cells, NK cells and B cells that is activated by its ligand CD70 on B cells; CD70-CD27 signalling mediates antigen-specific T-cell activation and expansion (UniProt P26842). It is found in most T lymphocytes. Varlilumab (CDX-1127), a CD27 agonist antibody, reached phase 2 with nivolumab in relapsed aggressive B-cell lymphoma (NCT03038672); several combination studies were terminated for portfolio re-prioritisation (NCT02386111).",
    biology: "A TNF-receptor-superfamily costimulator; the CD70 side has its own target page.",
    whereFound: ["Most T lymphocytes; NK and B cells (UniProt P26842)", "B-cell lymphoma trials of varlilumab (NCT03038672)"],
    cancers: ["dlbcl"], pathways: ["cancer-immunity-cycle"], related: ["cd70", "nivolumab", "cd137"],
    links: [{ label: "ClinicalTrials.gov NCT03038672", url: "https://clinicaltrials.gov/study/NCT03038672" }] }),

  target({ id: "cd40", name: "CD40", symbol: "CD40", aka: ["TNFRSF5", "CD40 molecule", "Bp50", "p50"], hgnc: "HGNC:11919", ensembl: "ENSG00000101017", uniprot: "P25942", entrez: "958", targetClass: "surface-antigen", role: IC,
    tldr: "CD40 sits on the cells that teach T cells what to attack. Agonist antibodies press it to turn cold tumours hot; the strongest signals so far are in pancreatic cancer with chemotherapy.",
    summary: "CD40 (chromosome 20q13.12) is the receptor for CD40 ligand (TNFSF5/CD40LG) and transduces TRAF6- and MAP3K8-mediated signals that activate ERK in macrophages and B cells; it is expressed in B cells and in primary carcinomas (UniProt P25942). On activation, CD40 licenses dendritic cells to promote antitumour T-cell activation and re-educates macrophages to destroy tumour stroma; numerous agonist antibodies have been tolerable, with mild to moderate transient cytokine release, antitumour activity in melanoma, and major regressions in pancreatic cancer and mesothelioma with chemotherapy (Vonderheide 2020, Annu Rev Med). In the corpus, selicrelumab's intratumoural study ended with the end of drug development (NCT03892525) and mitazalimab is entering a phase 2/3 study with chemotherapy (NCT07437287).",
    biology: "A TNF-receptor-superfamily member on antigen-presenting cells; the target of the CD40 agonist technology.",
    whereFound: ["B cells and primary carcinomas (UniProt P25942)", "Dendritic cells and macrophages, per Vonderheide 2020", "Pancreatic cancer trials of CD40 agonists"],
    cancers: ["pancreatic", "melanoma"], pathways: ["cancer-immunity-cycle"], technologies: ["cd40-agonists"], drugs: ["selicrelumab", "mitazalimab"], related: ["cd28", "macrophage"],
    links: [{ label: "Vonderheide 2020, Annu Rev Med (Europe PMC)", url: "https://europepmc.org/article/MED/31412220" }] }),

  target({ id: "tdo2", name: "TDO2", symbol: "TDO2", aka: ["tryptophan 2,3-dioxygenase", "TDO"], hgnc: "HGNC:11708", ensembl: "ENSG00000151790", uniprot: "P48775", entrez: "6999", targetClass: "enzyme", role: IC,
    tldr: "TDO2 does the same job as IDO1, breaking down tryptophan into kynurenine, which quietens T cells. It is one reason IDO1 inhibitors alone may not have been enough; no TDO2 drug has reached late trials.",
    summary: "TDO2 (chromosome 4q32.1) is a haem-dependent dioxygenase that catalyses the oxidative cleavage of the L-tryptophan pyrrole ring, converting it to N-formyl-L-kynurenine (UniProt P48775). IDO1 and TDO2 catalyse the commitment step of the kynurenine pathway; kynurenine activates the aryl hydrocarbon receptor, generating immune-tolerant dendritic cells and regulatory T cells and a tumour microenvironment defective at recognising cancer cells (Cheong and Sun 2018, Trends Pharmacol Sci). No TDO2-selective agent was found in ClinicalTrials.gov under the names the corpus knows.",
    biology: "The liver-type tryptophan dioxygenase; UniProt records no tissue distribution for the human protein, so none is claimed here.",
    whereFound: ["Not recorded by UniProt for the human protein"],
    pathways: ["cancer-immunity-cycle"], related: ["ido1", "epacadostat"],
    links: [{ label: "Cheong and Sun 2018 (Europe PMC)", url: "https://europepmc.org/article/MED/29254698" }] }),

  target({ id: "entpd1", name: "CD39 (ENTPD1)", symbol: "ENTPD1", aka: ["CD39", "NTPDase-1", "ectonucleoside triphosphate diphosphohydrolase 1"], hgnc: "HGNC:3363", ensembl: "ENSG00000138185", uniprot: "P49961", entrez: "953", targetClass: "enzyme", role: IC,
    tldr: "CD39 is the first of two enzymes that turn the ATP spilt by dying tumour cells into adenosine, which sedates T cells. Blocking it keeps the ATP alarm ringing; one antibody has completed phase 2 in pancreatic cancer.",
    summary: "ENTPD1 (chromosome 10q24.1) catalyses the hydrolysis of nucleoside triphosphates and diphosphates, sequentially removing phosphate groups to leave nucleoside monophosphates; it is expressed primarily on activated lymphoid cells and in endothelium, and highly in placenta, lung, skeletal muscle and kidney (UniProt P49961). CD39 and CD73 together catabolise extracellular ATP into adenosine, and both, with adenosine receptors, have emerged as therapeutic targets (Allard et al. 2019, Immunol Rev). TTX-030, an anti-CD39 antibody, completed a phase 2 study with chemotherapy, with or without budigalimab, in first-line metastatic pancreatic cancer (NCT06119217).",
    biology: "The upstream ectonucleotidase of the adenosine axis; CD73 (NT5E) finishes the conversion.",
    whereFound: ["Activated lymphoid cells, endothelium (UniProt P49961)", "Pancreatic cancer trial of TTX-030 (NCT06119217)"],
    cancers: ["pancreatic"], pathways: ["cancer-immunity-cycle"], related: ["cd73-adenosine", "adora2a"],
    links: [{ label: "ClinicalTrials.gov NCT06119217", url: "https://clinicaltrials.gov/study/NCT06119217" }] }),

  target({ id: "adora2a", name: "Adenosine A2A receptor (ADORA2A)", symbol: "ADORA2A", aka: ["A2AR", "A2A receptor", "adenosine A2a receptor", "RDC8"], hgnc: "HGNC:263", ensembl: "ENSG00000128271", uniprot: "P29274", entrez: "135", targetClass: "surface-antigen", role: IC,
    tldr: "The A2A receptor is where adenosine lands on a T cell and tells it to rest. Oral antagonists, cousins of caffeine, are in phase 2 combinations with PD-1 blockade and chemotherapy.",
    summary: "ADORA2A (chromosome 22q11.23) encodes a G-protein-coupled adenosine receptor whose activity is mediated by G proteins that activate adenylyl cyclase (UniProt P29274). Ectonucleotidases and adenosine receptors are broadly expressed and have emerged as immuno-oncology targets, with early-phase trials showing promising results (Allard et al. 2019, Immunol Rev). Ciforadenant is in phase 1b/2 with ipilimumab and nivolumab (NCT05501054), etrumadenant (A2A/A2B) in phase 2 combinations in pancreatic cancer (NCT06048484), and inupadenant in phase 2 with chemotherapy in non-squamous non-small-cell lung cancer (NCT05403385).",
    biology: "The receptor end of the CD39-CD73-adenosine axis; antagonists are small molecules.",
    whereFound: ["Broadly expressed, per Allard et al. 2019; UniProt records no human tissue distribution", "Pancreatic and non-small-cell lung cancer trials of antagonists"],
    cancers: ["pancreatic", "nsclc"], pathways: ["cancer-immunity-cycle"], related: ["cd73-adenosine", "entpd1"],
    links: [{ label: "Allard et al. 2019, Immunol Rev (Europe PMC)", url: "https://europepmc.org/article/MED/29758241" }] }),

  target({ id: "hhla2", name: "HHLA2 (B7-H7)", symbol: "HHLA2", aka: ["B7-H7", "B7H7", "B7-H5", "B7y", "HHLA2 member of B7 family"], hgnc: "HGNC:4905", ensembl: "ENSG00000114455", uniprot: "Q9UM44", entrez: "11148", targetClass: "checkpoint", role: IC,
    tldr: "HHLA2 is a B7 relative found on gut, kidney and lung tissue and on many tumours; it can both encourage and restrain T cells depending on the receptor. No drug against it is in the corpus yet.",
    summary: "HHLA2 (chromosome 3q13.13) costimulates T cells through TMIGD2 in the context of TCR-mediated activation, enhancing proliferation and cytokine production through an AKT-dependent cascade; it is expressed at high levels in colon, kidney, testis, lung and pancreas, at lower levels in small intestine, liver and skeletal muscle, and among immune cells in B cells, dendritic cells and macrophages but not T cells (UniProt Q9UM44). B7-H3, B7x and HHLA2 form the third group of the B7-CD28 family, with antagonistic antibodies and agonistic fusion proteins emerging (Janakiram et al. 2017, Immunol Rev).",
    biology: "A group III B7 family member; its costimulatory receptor is TMIGD2 (CD28H).",
    whereFound: ["Colon, kidney, testis, lung, pancreas; B cells, dendritic cells, macrophages (UniProt Q9UM44)"],
    pathways: ["cancer-immunity-cycle"], related: ["b7h3", "b7h4", "cd28"],
    links: [{ label: "Janakiram et al. 2017, Immunol Rev (Europe PMC)", url: "https://europepmc.org/article/MED/28258693" }] }),

  target({ id: "il10", name: "Interleukin-10 (IL10)", symbol: "IL10", aka: ["IL-10", "interleukin 10", "CSIF"], hgnc: "HGNC:5962", ensembl: "ENSG00000136634", uniprot: "P22301", entrez: "3586", targetClass: "other", role: IC,
    tldr: "IL-10 is a calming signal that many immune cells release; tumours and the viruses behind them raise it to keep the immune system quiet. Oddly, the main cancer drug built on it gave more IL-10 rather than less, and failed.",
    summary: "IL10 (chromosome 1q32.1) encodes a major immune-regulatory cytokine with profound anti-inflammatory functions that binds a heterotetrameric receptor of IL10RA and IL10RB and signals through JAK1 to STAT3; it is produced by T cells, macrophages, mast cells and other cell types (UniProt P22301). HPV up-regulates IL-10 and TGF-beta 1 to produce a local immunosuppressive environment (Torres-Poveda et al. 2014). Pegilodecakin, a pegylated IL-10 given to stimulate CD8 T cells, was tested against FOLFOX in pancreatic cancer in phase 3 (NCT02923921); its CYPRESS-1 and CYPRESS-2 studies with PD-1 antibodies closed early because the risk-benefit ratio was unfavourable (NCT03382899, NCT03382912). The corpus's LB4330 fuses IL-10 to a Claudin 18.2 antibody, again as an agonist.",
    biology: "A soluble cytokine, not a receptor; listed with the checkpoint families as a microenvironment brake because the cited review frames it so.",
    whereFound: ["T cells, macrophages, mast cells (UniProt P22301)"],
    pathways: ["cancer-immunity-cycle", "tgf-beta"], drugs: ["lb4330"], related: ["tgfb1", "macrophage"],
    links: [{ label: "Torres-Poveda et al. 2014 (Europe PMC)", url: "https://europepmc.org/article/MED/25302175" }, { label: "ClinicalTrials.gov NCT03382899", url: "https://clinicaltrials.gov/study/NCT03382899" }] }),

  target({ id: "bub1", name: "BUB1", symbol: "BUB1", aka: ["BUB1 mitotic checkpoint serine/threonine kinase", "hBUB1", "BUB1L"], hgnc: "HGNC:1148", ensembl: "ENSG00000169679", uniprot: "O43683", entrez: "699", targetClass: "kinase",
    tldr: "BUB1 is one of the kinases that stops a dividing cell pulling its chromosomes apart before every one is attached. Inhibitors exist in the laboratory; none has reached patients.",
    summary: "BUB1 (chromosome 2q13) is a serine/threonine kinase essential for spindle-assembly-checkpoint signalling and correct chromosome alignment: it assembles checkpoint proteins at the kinetochore, being required for the localisation of CENPF, BUB1B, CENPE and MAD2L1 and of PLK1, and for centromeric enrichment of cohesion factors. Expression is high in testis and thymus, lower in colon, spleen, lung and small intestine, and associated with tissues of high mitotic index (UniProt O43683). A ClinicalTrials.gov search for the tool inhibitor BAY 1816032 returned no studies.",
    biology: "A kinetochore kinase of the spindle assembly checkpoint, alongside MPS1 (TTK) and BUB1B.",
    whereFound: ["Tissues with a high mitotic index (UniProt O43683)"],
    pathways: ["mitotic-spindle-checkpoint"], related: ["ttk", "aurkb", "plk1"] }),

  target({ id: "ttk", name: "MPS1 (TTK)", symbol: "TTK", aka: ["MPS1", "Mps1", "TTK protein kinase", "PYT", "CT96"], hgnc: "HGNC:12401", ensembl: "ENSG00000112742", uniprot: "P33981", entrez: "7272", targetClass: "kinase",
    tldr: "MPS1 arms the checkpoint that holds a dividing cell until its chromosomes are attached. Blocking it lets cancer cells divide carelessly and die; one inhibitor is in phase 1/2 in breast cancer.",
    summary: "TTK (chromosome 6q14.1) encodes the dual-specificity kinase MPS1, which is involved in mitotic spindle assembly checkpoint signalling, delaying anaphase until chromosomes are bioriented, and in the repair of incorrect kinetochore-microtubule attachments; it phosphorylates MAD1L1 to promote the checkpoint and is present in rapidly proliferating cell lines (UniProt P33981). CFI-402257, a TTK inhibitor, is in phase 1/2 alone, with fulvestrant, and with paclitaxel in HER2-negative breast cancer (NCT05251714, NCT03568422).",
    biology: "The apex kinase of the spindle assembly checkpoint; inhibitors override the checkpoint rather than enforce it.",
    whereFound: ["Rapidly proliferating cells (UniProt P33981)", "Breast cancer trials of CFI-402257"],
    cancers: ["breast-hr-positive"], pathways: ["mitotic-spindle-checkpoint"], related: ["bub1", "aurkb", "aurka"],
    links: [{ label: "ClinicalTrials.gov NCT05251714", url: "https://clinicaltrials.gov/study/NCT05251714" }] }),
];

// ==================================================================================================================
// Glossary: the disambiguation term. "checkpoint" alone is ambiguous; the two senses each have a hub.
// ==================================================================================================================
export const checkpointTerms: TermInput[] = [
  {
    id: "checkpoint", kind: "term", name: "Checkpoint (two meanings)", category: "Biology basics", asOf,
    aka: ["checkpoint", "checkpoints", "cell-cycle checkpoint", "cell cycle checkpoint", "cell-cycle checkpoints", "checkpoint kinase", "checkpoint kinases"],
    tldr: "In cancer the word checkpoint means two unrelated things: a brake on immune cells that tumours press and checkpoint inhibitor drugs release, or a gate inside every dividing cell that stops it copying or splitting damaged DNA.",
    summary: "Immune checkpoints are receptor-ligand pairs such as PD-1 with PD-L1, CTLA-4 with CD80 and CD86, LAG-3, TIM-3 and TIGIT that hold T cells and NK cells back; the drugs are antibodies that block them (or, for co-stimulatory receptors, agonists that press them). Cell-cycle checkpoints are the G1/S, G2/M and spindle assembly gates governed by cyclin D-CDK4/6 and RB, ATR-CHK1-WEE1, and MPS1, BUB1 and Aurora B, with the DNA-damage response behind them; the drugs are small molecules such as palbociclib, olaparib and azenosertib. The two families share a word and nothing else; OnCo keeps a hub for each, with every member, its partner, where it is expressed and the drugs against it.",
    related: ["immune-checkpoint", "cell-cycle", "synthetic-lethality", "immuno-oncology"],
    // Every member of both families, so each has a way in from the glossary and none is an orphan.
    targets: CHECKPOINT_MEMBERS.map((m) => m.id), technologies: ["checkpoint-inhibitor", "cdk46-inhibitor", "parp-inhibitor", "atr-chk1-inhibitors"], pathways: ["pd1-checkpoint", "p53-cell-cycle", "mitotic-spindle-checkpoint"],
    provenance,
  },
];

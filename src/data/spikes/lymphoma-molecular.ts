import type { BiomarkerInput, DrugInput, EntityInput, PathwayInput, TargetInput, TechnologyInput, TermInput } from "@/lib/schema";
import type { Spike, SpikeSupplement } from "./index";

/**
 * LYMPHOMA, MOLECULAR LAYER. Facts checked 29 and 30 September 2026.
 *
 * The biology under the medicines facet B wrote (src/data/spikes/lymphoma-treatment*.ts): the antigens the
 * antibodies, conjugates, engagers and CAR-T products are aimed at, and what it costs the patient that almost all
 * of them are also carried by healthy cells (`lymphomaAntigens`); the lesions and pathways that make a lymphoma
 * what it is (`lymphomaLesions`); the molecular classifications and how much of a treatment decision each one
 * actually carries today (`lymphomaClassification`); the escape routes from each drug class (`lymphomaResistance`,
 * which also feeds the resistance atlas at /resistance/); and the tests that get run (`lymphomaTests`).
 *
 * Rules this file was written under. Every figure names its cohort and the paper it was read from, and every DOI
 * below was resolved through the Europe PMC REST API and its abstract read before the number was written down. One
 * remembered DOI turned out to belong to a different paper (10.1038/ng.621 is the myeloid loss-of-function EZH2
 * paper, not the lymphoma Tyr641 gain-of-function one, which is 10.1038/ng.518), which is why nothing here is cited
 * from memory. Where a figure could not be verified it is named as a gap rather than estimated.
 *
 * What this file does not create, because other facets of the same round own them: cancer records (facet A),
 * standard-of-care rows (facet B), trial and paper records (facet C). Sources are therefore carried as links on the
 * records this file owns or supplements, not as paper entities.
 *
 * Ids created here: biomarker readouts, one technology, one pathway, and glossary terms prefixed `lymphoma-bio-`.
 * Every target, pathway and technology that already exists is supplemented through SpikeSupplement rather than
 * duplicated; the corpus already holds CD19, CD20, CD79b, CD30, CD22, CD38, CD3, CD47, CCR4, CD52, BTK, BCL-2,
 * BCL6, MYC, EZH2, CREBBP, EP300, TP53, MYD88, CARD11, PLCG2, JAK1/2/3, STAT3, STAT6, RHOA, TET2, DNMT3A and the
 * rest of the genes named below.
 */

export const asOf = "2026-09-30";

const doi = (d: string) => `https://doi.org/${d}`;
const link = (label: string, url: string) => ({ label, url });
/** A partial record for an entity another file owns; arrays append, scalars fill gaps only (see applySpikeSupplements). */
const sup = <T extends EntityInput>(x: { id: string } & Partial<Omit<T, "id" | "kind">>): SpikeSupplement => x as SpikeSupplement;

/** Cancer ids this layer patches. Each was checked against the corpus before it was written: a patch that lands nowhere fails the build. */
const CX = {
  nhl: "non-hodgkin-lymphoma",
  dlbcl: "dlbcl",
  fl: "follicular-lymphoma",
  mcl: "mantle-cell-lymphoma",
  mzl: "marginal-zone-lymphoma",
  malt: "malt-lymphoma",
  pmbcl: "primary-mediastinal-b-cell-lymphoma",
  burkitt: "burkitt-lymphoma",
  pcnsl: "primary-cns-lymphoma",
  wm: "waldenstrom",
  ptcl: "peripheral-t-cell-lymphoma",
  aitl: "angioimmunoblastic-t-cell-lymphoma",
  ctcl: "cutaneous-t-cell-lymphoma",
  sezary: "sezary-syndrome",
  hodgkin: "hodgkin-lymphoma",
  richter: "richter-transformation-cll",
} as const;

// ======================= SOURCES =======================
/** Each entry was resolved by DOI through Europe PMC and its abstract read; the figures quoted below come from that text. */
const SRC = {
  // Cell of origin and the genetic classifications.
  alizadeh2000: link("Alizadeh et al., Nature 2000: distinct types of diffuse large B-cell lymphoma identified by gene expression profiling", doi("10.1038/35000501")),
  rosenwald2002: link("Rosenwald et al., N Engl J Med 2002: molecular profiling predicts survival after chemotherapy in 240 diffuse large B-cell lymphomas", doi("10.1056/NEJMoa012914")),
  hans2004: link("Hans et al., Blood 2004: the CD10, BCL6 and MUM1 immunohistochemistry algorithm on 152 cases", doi("10.1182/blood-2003-05-1545")),
  schmitz2018: link("Schmitz et al., N Engl J Med 2018: genetics and pathogenesis of diffuse large B-cell lymphoma (574 biopsies; MCD, BN2, N1, EZB)", doi("10.1056/NEJMoa1801445")),
  chapuy2018: link("Chapuy et al., Nat Med 2018: five genetic subsets of diffuse large B-cell lymphoma from 304 primary tumours", doi("10.1038/s41591-018-0016-8")),
  wright2020: link("Wright et al., Cancer Cell 2020: LymphGen, a probabilistic classifier for seven genetic subtypes", doi("10.1016/j.ccell.2020.03.015")),
  who2022: link("Alaggio et al., Leukemia 2022: the fifth edition of the WHO classification of haematolymphoid tumours, lymphoid neoplasms", doi("10.1038/s41375-022-01620-2")),
  // B-cell receptor, NF-kB and the activated B-cell programme.
  davis2010: link("Davis et al., Nature 2010: chronic active B-cell receptor signalling in diffuse large B-cell lymphoma", doi("10.1038/nature08638")),
  ngo2011: link("Ngo et al., Nature 2011: oncogenically active MYD88 mutations in human lymphoma", doi("10.1038/nature09671")),
  treon2012: link("Treon et al., N Engl J Med 2012: MYD88 L265P somatic mutation in Waldenstrom macroglobulinaemia", doi("10.1056/NEJMoa1200710")),
  // BCL2, MYC and the germinal centre.
  tsujimoto1985: link("Tsujimoto et al., Science 1985: the t(14;18) translocation results from a mistake in VDJ joining", doi("10.1126/science.3929382")),
  dallafavera1982: link("Dalla-Favera et al., PNAS 1982: human c-myc lies in the chromosome 8 region translocated in Burkitt lymphoma", doi("10.1073/pnas.79.24.7824")),
  johnson2012: link("Johnson et al., J Clin Oncol 2012: concurrent MYC and BCL2 protein expression in diffuse large B-cell lymphoma treated with R-CHOP", doi("10.1200/JCO.2011.41.0985")),
  horn2013: link("Horn et al., Blood 2013: MYC, BCL2 and BCL6 rearrangement and expression in 442 RICOVER patients", doi("10.1182/blood-2012-06-435842")),
  morin2010: link("Morin et al., Nat Genet 2010: somatic EZH2 Tyr641 mutations in follicular and germinal-centre diffuse large B-cell lymphoma", doi("10.1038/ng.518")),
  morin2011: link("Morin et al., Nature 2011: frequent mutation of histone-modifying genes in non-Hodgkin lymphoma", doi("10.1038/nature10351")),
  pasqualucci2011: link("Pasqualucci et al., Nature 2011: inactivating mutations of the acetyltransferase genes CREBBP and EP300 in B-cell lymphoma", doi("10.1038/nature09730")),
  pasqualucciCoding2011: link("Pasqualucci et al., Nat Genet 2011: the coding genome of diffuse large B-cell lymphoma", doi("10.1038/ng.892")),
  schmitzBurkitt2012: link("Schmitz et al., Nature 2012: Burkitt lymphoma pathogenesis from structural and functional genomics", doi("10.1038/nature11378")),
  // Hodgkin lymphoma and primary mediastinal B-cell lymphoma.
  kuppers1994: link("Kuppers et al., PNAS 1994: micromanipulated Hodgkin and Reed-Sternberg cells carry clonal immunoglobulin rearrangements", doi("10.1073/pnas.91.23.10962")),
  kuppers2009: link("Kuppers, Nat Rev Cancer 2009: the biology of Hodgkin's lymphoma", doi("10.1038/nrc2542")),
  green2010: link("Green et al., Blood 2010: selective 9p24.1 amplification and PD-1 ligand induction through JAK2 in Hodgkin lymphoma and mediastinal large B-cell lymphoma", doi("10.1182/blood-2010-05-282780")),
  steidl2011: link("Steidl et al., Nature 2011: CIITA is a recurrent fusion partner in primary mediastinal B-cell lymphoma and classical Hodgkin lymphoma", doi("10.1038/nature09754")),
  roemer2016: link("Roemer et al., J Clin Oncol 2016: PD-L1 and PD-L2 genetic alterations in 108 classical Hodgkin lymphomas", doi("10.1200/JCO.2016.66.4482")),
  roemer2018: link("Roemer et al., J Clin Oncol 2018: MHC class II and PD-L1 expression predict outcome after PD-1 blockade in classical Hodgkin lymphoma (CheckMate 205)", doi("10.1200/JCO.2017.77.3994")),
  ansell2015: link("Ansell et al., N Engl J Med 2015: nivolumab in relapsed or refractory Hodgkin lymphoma (23 patients)", doi("10.1056/NEJMoa1411087")),
  steidl2010: link("Steidl et al., N Engl J Med 2010: tumour-associated macrophages and survival in classical Hodgkin lymphoma", doi("10.1056/NEJMoa0905680")),
  // Viruses.
  young2004: link("Young and Rickinson, Nat Rev Cancer 2004: Epstein-Barr virus, 40 years on", doi("10.1038/nrc1452")),
  kataoka2015: link("Kataoka et al., Nat Genet 2015: integrated molecular analysis of 426 adult T-cell leukaemia/lymphoma cases", doi("10.1038/ng.3415")),
  // T-cell and NK-cell lymphoma.
  sakata2014: link("Sakata-Yanagimoto et al., Nat Genet 2014: somatic RHOA G17V in angioimmunoblastic T-cell lymphoma", doi("10.1038/ng.2872")),
  palomero2014: link("Palomero et al., Nat Genet 2014: recurrent mutations in epigenetic regulators, RHOA and FYN in peripheral T-cell lymphoma", doi("10.1038/ng.2873")),
  kucuk2015: link("Kucuk et al., Nat Commun 2015: activating STAT3 and STAT5B mutations in lymphomas derived from NK or gamma-delta T cells", doi("10.1038/ncomms7025")),
  kim2018: link("Kim et al., Lancet Oncol 2018: MAVORIC, mogamulizumab against vorinostat in previously treated cutaneous T-cell lymphoma", doi("10.1016/S1470-2045(18)30379-6")),
  // Mantle cell, marginal zone and Richter transformation.
  eskelund2017: link("Eskelund et al., Blood 2017: TP53 mutations in 183 younger mantle cell lymphoma patients from Nordic MCL2 and MCL3", doi("10.1182/blood-2017-04-779736")),
  bea2013: link("Bea et al., PNAS 2013: the landscape of somatic mutations and clonal evolution in mantle cell lymphoma (29 genomes or exomes, 172 validation cases)", doi("10.1073/pnas.1314608110")),
  beaAmador2017: link("Bea and Amador, Curr Oncol Rep 2017: SOX11 and the genetic events that cooperate with cyclin D1 in mantle cell lymphoma", doi("10.1007/s11912-017-0598-1")),
  liu2002: link("Liu et al., Gastroenterology 2002: t(11;18) marks gastric MALT lymphomas that will not respond to Helicobacter pylori eradication (111 patients)", doi("10.1053/gast.2002.33047")),
  rossi2011: link("Rossi et al., Blood 2011: the genetics of Richter syndrome in 86 pathologically proven cases", doi("10.1182/blood-2010-09-302174")),
  // Resistance.
  woyach2014: link("Woyach et al., N Engl J Med 2014: BTK C481S and PLCG2 resistance mutations under ibrutinib", doi("10.1056/NEJMoa1400029")),
  blombery2022: link("Blombery et al., Blood Adv 2022: enrichment of BTK Leu528Trp on zanubrutinib and cross-resistance to pirtobrutinib", doi("10.1182/bloodadvances.2022008325")),
  mato2023: link("Mato et al., N Engl J Med 2023: pirtobrutinib after a covalent BTK inhibitor (BRUIN, 317 patients)", doi("10.1056/NEJMoa2300696")),
  blombery2019: link("Blombery et al., Cancer Discov 2019: the recurrent BCL2 Gly101Val mutation confers resistance to venetoclax", doi("10.1158/2159-8290.CD-18-1119")),
  sotillo2015: link("Sotillo et al., Cancer Discov 2015: acquired mutations and alternative splicing of CD19 enable resistance to CART-19", doi("10.1158/2159-8290.CD-15-1020")),
  plaks2021: link("Plaks et al., Blood 2021: CD19 target evasion as a mechanism of relapse after axicabtagene ciloleucel in large B-cell lymphoma", doi("10.1182/blood.2021010930")),
  deng2020: link("Deng et al., Nat Med 2020: single-cell features of the axicabtagene ciloleucel infusion product that track efficacy and toxicity in 24 patients", doi("10.1038/s41591-020-1061-7")),
  hiraga2009: link("Hiraga et al., Blood 2009: CD20-negative transformation after rituximab-containing chemotherapy (19 rebiopsied patients)", doi("10.1182/blood-2008-08-175208")),
  advani2018: link("Advani et al., N Engl J Med 2018: CD47 blockade with Hu5F9-G4 and rituximab in 22 patients with non-Hodgkin lymphoma", doi("10.1056/NEJMoa1807315")),
  // Tests.
  cheson2014: link("Cheson et al., J Clin Oncol 2014: the Lugano classification for staging and response assessment in Hodgkin and non-Hodgkin lymphoma", doi("10.1200/JCO.2013.54.8800")),
  barrington2014: link("Barrington et al., J Clin Oncol 2014: the Imaging Working Group consensus on PET-CT in lymphoma and the five-point scale", doi("10.1200/JCO.2013.53.5229")),
  vandongen2003: link("van Dongen et al., Leukemia 2003: BIOMED-2 multiplex PCR for clonal immunoglobulin and T-cell receptor rearrangements", doi("10.1038/sj.leu.2403202")),
  scherer2016: link("Scherer et al., Sci Transl Med 2016: ctDNA genotyping classifies cell of origin and tracks genome evolution in lymphoma (92 patients)", doi("10.1126/scitranslmed.aai8545")),
  kurtz2021: link("Kurtz et al., Nat Biotechnol 2021: PhasED-seq, phased variants for residual disease detection in B-cell lymphoma (213 participants)", doi("10.1038/s41587-021-00981-w")),
} as const;

// ======================= 1. THE ANTIGENS =======================
/**
 * One row per antigen a licensed or late-stage lymphoma medicine is aimed at. `alsoOnHealthyCells` and `costToPatient`
 * are the two columns that matter most and are the ones most often left out: every one of these except the 9p24.1
 * amplicon is a normal protein on a normal cell, and the side effects are the predictable consequence of hitting it.
 * `specificity` repeats the value already on the corpus target record (src/data/targets*.ts), set from Human Protein
 * Atlas expression and the drug mechanisms by scripts/fetch-target-specificity.ts, so the two readings can be compared.
 */
export type LymphomaAntigenRow = {
  antigen: string;
  /** Corpus target id. */
  targetId: string;
  /** The corpus target record's `specificity` value, repeated here so the table can be read on its own. */
  specificity: string;
  carriedBy: string;
  alsoOnHealthyCells: string;
  notCarriedBy: string;
  whatTheDrugDoes: string;
  howTumoursLoseIt: string;
  costToPatient: string;
  sources: Array<{ label: string; url: string }>;
};

export const lymphomaAntigens: LymphomaAntigenRow[] = [
  {
    antigen: "CD20 (MS4A1)", targetId: "cd20", specificity: "lineage-antigen",
    carriedBy: "Almost every mature B-cell lymphoma: diffuse large B-cell, follicular, marginal zone, mantle cell, Burkitt, and the B cells of nodular lymphocyte-predominant Hodgkin lymphoma.",
    alsoOnHealthyCells: "Every normal B cell from the late pre-B stage to the memory B cell. The Human Protein Atlas reads MS4A1 as tissue enriched in lymphoid tissue (631 nTPM) and lineage enriched in B cells (630 nTPM), which is the strongest B-cell signal of any lymphoma surface target.",
    notCarriedBy: "Haematopoietic stem cells, pro-B cells and plasma cells, which is why the B-cell compartment recovers after treatment stops and why antibody levels from long-lived plasma cells are often preserved at first. Reed-Sternberg cells of classical Hodgkin lymphoma are CD20-negative or only weakly positive, which is why rituximab is not part of classical Hodgkin treatment.",
    whatTheDrugDoes: "CD20 is a tetraspanin that is not internalised when an antibody binds it, so the antibody has to kill from the outside: complement-dependent cytotoxicity, antibody-dependent cellular cytotoxicity and phagocytosis. That is why CD20 carries naked antibodies (rituximab, obinutuzumab, ofatumumab) and T-cell engagers (glofitamab, mosunetuzumab, epcoritamab, odronextamab) but no antibody-drug conjugate: there is no route in for a payload.",
    howTumoursLoseIt: "CD20-negative transformation after rituximab is real and under-measured because most relapses are not rebiopsied. In a single-centre series of 124 patients treated with rituximab-containing chemotherapy, 36 relapsed or progressed, 19 were rebiopsied and 5 of those 19 (26.3%) had become CD20 protein-negative; CD20 messenger RNA was lower in the negative cells than in the positive cells from the same patient, so this is transcriptional down-regulation rather than deletion (Hiraga 2009). Trogocytosis, in which macrophages shave antibody-CD20 complexes off the cell surface, lowers the antigen without changing the gene at all.",
    costToPatient: "B-cell aplasia for six to twelve months after the last dose, low immunoglobulin levels that can persist for years, and a measurable rise in bacterial and viral infection. Two consequences are specific and avoidable: hepatitis B reactivation, which is why surface antigen and core antibody are checked before the first dose, and a blunted response to vaccination for several months after treatment.",
    sources: [SRC.hiraga2009],
  },
  {
    antigen: "CD19", targetId: "cd19", specificity: "lineage-antigen",
    carriedBy: "The same B-cell lymphomas as CD20, and it appears earlier in B-cell development and stays on after CD20 is lost, which is why it is the second address rather than a duplicate of the first.",
    alsoOnHealthyCells: "Normal B cells from the pro-B stage onwards; the Human Protein Atlas reads CD19 as lineage enriched in B cells (173 nTPM). A subset of normal plasma cells keeps it.",
    notCarriedBy: "T cells, myeloid cells, haematopoietic stem cells and all non-haematopoietic tissue.",
    whatTheDrugDoes: "CD19 internalises, so it carries all three formats: a naked Fc-engineered antibody (tafasitamab), an antibody-drug conjugate, and the four approved CAR-T products in lymphoma (axicabtagene ciloleucel, tisagenlecleucel, lisocabtagene maraleucel and, in mantle cell lymphoma, brexucabtagene autoleucel).",
    howTumoursLoseIt: "Antigen escape after CAR-T is the best-characterised escape route of any lymphoma surface target. Relapse with loss of the epitope follows 10 to 20% of paediatric responses in B-cell acute lymphoblastic leukaemia, and the mechanism is a combination: hemizygous deletions across the CD19 locus, de novo frameshift and missense mutations in exon 2, and selection for an alternatively spliced messenger RNA lacking exon 2 whose truncated protein no longer presents the CAR epitope but still partly rescues the cell (Sotillo 2015). CD19 target evasion also occurs in large B-cell lymphoma after axicabtagene ciloleucel (Plaks 2021); OnCo does not hold a share it can stand behind for lymphoma, because the published series are small and the reported figures do not agree.",
    costToPatient: "The same B-cell aplasia and hypogammaglobulinaemia as anti-CD20, but deeper and longer after CAR-T, where it can last years and is managed with immunoglobulin replacement. Because CD19 appears earlier in B-cell development than CD20, recovery is slower.",
    sources: [SRC.sotillo2015, SRC.plaks2021],
  },
  {
    antigen: "CD79b", targetId: "cd79b", specificity: "lineage-antigen",
    carriedBy: "More than 95% of diffuse large B-cell lymphomas express it, and so do follicular and mantle cell lymphoma. It is half of the signalling heterodimer of the B-cell receptor, with CD79a.",
    alsoOnHealthyCells: "Normal B cells, and strongly: the Human Protein Atlas reads CD79B at 1,489 nTPM in the B-cell lineage, the highest of any lymphoma surface target.",
    notCarriedBy: "Plasma cells lose surface immunoglobulin and with it most CD79b, and no non-B lineage carries it.",
    whatTheDrugDoes: "CD79b is part of the receptor complex that is continuously internalised, which makes it an unusually good address for a conjugate: polatuzumab vedotin delivers monomethyl auristatin E inside the cell. Nothing is tested before it is given, because expression is close to universal.",
    howTumoursLoseIt: "No established escape route is published for CD79b in the way it is for CD19 and CD20. That is a gap in the literature rather than evidence that the antigen is never lost.",
    costToPatient: "Peripheral neuropathy and neutropenia from the auristatin payload rather than from the antigen, plus the same B-cell depletion as the rest of this group when it is given with rituximab.",
    sources: [SRC.davis2010],
  },
  {
    antigen: "CD30 (TNFRSF8)", targetId: "cd30", specificity: "lineage-antigen",
    carriedBy: "Essentially every Reed-Sternberg cell of classical Hodgkin lymphoma, anaplastic large cell lymphoma, a subset of peripheral T-cell lymphoma and of primary mediastinal B-cell lymphoma, and lymphomatoid papulosis.",
    alsoOnHealthyCells: "Activated T and B cells, and monocytes: the Human Protein Atlas reads TNFRSF8 as lineage enriched in monocytes (97 nTPM). Resting lymphocytes do not carry it, which is why CD30 is the closest thing in lymphoma to a tumour-restricted antigen in an adult.",
    notCarriedBy: "Resting lymphocytes, haematopoietic stem cells and almost all solid tissue.",
    whatTheDrugDoes: "CD30 signals to NF-kB through TRAF proteins and internalises, so it carries the conjugate brentuximab vedotin. The free antigen is also shed into serum, which complicates attempts to use it as a blood marker.",
    howTumoursLoseIt: "Loss of CD30 at relapse after brentuximab vedotin has been reported but is not the dominant mechanism; failure is more often payload-related or driven by the microenvironment.",
    costToPatient: "Peripheral neuropathy, cumulative and dose-limiting, from the auristatin payload; neutropenia; and, rarely, progressive multifocal leukoencephalopathy. Unlike the B-cell antigens, CD30 blockade does not empty a whole normal compartment, so there is no equivalent of B-cell aplasia.",
    sources: [SRC.kuppers2009],
  },
  {
    antigen: "CD22 (Siglec-2)", targetId: "cd22", specificity: "lineage-antigen",
    carriedBy: "More than 90% of B-cell acute lymphoblastic leukaemia and most B-cell non-Hodgkin lymphomas; hairy cell leukaemia carries it strongly.",
    alsoOnHealthyCells: "Normal mature B cells; the Human Protein Atlas reads CD22 as lineage enriched in B cells (121 nTPM) and tissue enhanced in lymphoid tissue and ovary.",
    notCarriedBy: "Plasma cells, T cells and myeloid cells.",
    whatTheDrugDoes: "CD22 is an inhibitory co-receptor of the B-cell receptor that recycles rapidly between the surface and the endosome, which suits conjugate delivery; inotuzumab ozogamicin is the licensed example, in acute lymphoblastic leukaemia rather than in lymphoma. In lymphoma CD22 is mainly a second address after CD19 CAR-T fails.",
    howTumoursLoseIt: "Density matters more than presence: after CD22-directed treatment, relapses often keep the antigen but at a lower surface density than the construct needs.",
    costToPatient: "B-cell depletion again, and for the calicheamicin conjugate hepatic sinusoidal obstruction syndrome, which is why it is used cautiously before a transplant.",
    sources: [SRC.davis2010],
  },
  {
    antigen: "CD38", targetId: "cd38", specificity: "lineage-antigen",
    carriedBy: "Plasma cells and plasmablastic tumours, and a minority of T-cell and NK-cell lymphomas. In lymphoma it is a research target, not a standard one.",
    alsoOnHealthyCells: "Plasma cells, activated lymphocytes, NK cells, and at lower levels B and T cells and myeloid cells; the Human Protein Atlas reads CD38 as group enriched across B cells, NK cells and dendritic cells.",
    notCarriedBy: "Resting naive B cells carry little of it, which is why anti-CD38 does not empty the B-cell compartment the way anti-CD20 does.",
    whatTheDrugDoes: "CD38 is an ectoenzyme rather than a receptor, and the licensed antibodies (daratumumab, isatuximab) work through complement, antibody-dependent cytotoxicity and phagocytosis plus depletion of CD38-positive regulatory cells. There is no approved anti-CD38 indication in lymphoma; the plasmablastic and NK/T-cell settings are case series and small trials.",
    howTumoursLoseIt: "Surface CD38 falls under anti-CD38 antibody pressure, which is the documented mechanism in myeloma and the reason retreatment works poorly.",
    costToPatient: "Infusion reactions, and a laboratory problem that matters in practice: anti-CD38 antibodies bind CD38 on red cells and cause a positive indirect antiglobulin test that masks alloantibodies, so the transfusion laboratory must be told before a crossmatch.",
    sources: [SRC.kataoka2015],
  },
  {
    antigen: "CD3 (the handle, not the target)", targetId: "cd3", specificity: "immune-microenvironment",
    carriedBy: "Every T cell in the body. In T-cell lymphoma the tumour carries it too, which is the central difficulty of treating T-cell disease with T cells.",
    alsoOnHealthyCells: "All of them. CD3 is the one target in lymphoma that is not on the tumour at all in B-cell disease: it is the arm the bispecific antibody grips so that the other arm can hold the tumour.",
    notCarriedBy: "B cells, myeloid cells and non-haematopoietic tissue.",
    whatTheDrugDoes: "A CD3-engaging bispecific antibody forces an immunological synapse between a T cell and a tumour cell without needing the T cell to recognise anything, so it bypasses the loss of antigen presentation that defeats a checkpoint inhibitor. Glofitamab, mosunetuzumab, epcoritamab and odronextamab all hold CD20 with the other arm; glofitamab holds two CD20 molecules to one CD3.",
    howTumoursLoseIt: "The tumour does not lose CD3. What limits the class is the T cell: exhausted or scarce T cells after several lines of treatment, and the same CD20 loss that defeats rituximab.",
    costToPatient: "Cytokine release syndrome and neurotoxicity, which is why these drugs are given with a step-up dosing schedule over the first cycle, and why the first doses are given where a patient can be watched. The toxicity is the mechanism working, not a side reaction.",
    sources: [SRC.kuppers2009],
  },
  {
    antigen: "CD47", targetId: "cd47", specificity: "immune-microenvironment",
    carriedBy: "Lymphoma cells, as on most tumour cells; it is a signal that says do not eat me rather than a lineage marker.",
    alsoOnHealthyCells: "Nearly everything, and red cells most of all. CD47 density on an erythrocyte is how a macrophage decides not to clear it, which is the whole problem with the class.",
    notCarriedBy: "Nothing meaningful. This is a broadly expressed target, and the Human Protein Atlas reads CD47 at low tissue specificity.",
    whatTheDrugDoes: "Blocking the CD47-SIRPa interaction releases the macrophage brake so that an opsonising antibody such as rituximab can be acted on. In a phase 1b study of 22 patients with relapsed or refractory non-Hodgkin lymphoma, 95% of whom had rituximab-refractory disease, Hu5F9-G4 with rituximab gave an objective response in 50% (Advani 2018).",
    howTumoursLoseIt: "Not applicable: there is no approved CD47 agent in lymphoma and no established acquired-resistance literature.",
    costToPatient: "On-target anaemia, because the drug removes the same signal from red cells. The dosing strategy that made the class tolerable is a low priming dose that clears the oldest red cells first, followed by higher maintenance doses.",
    sources: [SRC.advani2018],
  },
  {
    antigen: "CCR4", targetId: "ccr4", specificity: "lineage-antigen",
    carriedBy: "More than 80% of mycosis fungoides and Sezary syndrome, about 90% of adult T-cell leukaemia/lymphoma, and a subset of peripheral T-cell lymphoma.",
    alsoOnHealthyCells: "Skin-homing T cells, T-helper-2 and T-helper-17 cells, and regulatory T cells; the Human Protein Atlas reads CCR4 as lineage enriched in T cells (61 nTPM).",
    notCarriedBy: "B cells and myeloid cells, and no significant expression outside the immune system.",
    whatTheDrugDoes: "Mogamulizumab is defucosylated, which raises its affinity for the Fc receptor on natural killer cells and makes antibody-dependent cytotoxicity its main mechanism. MAVORIC randomised 372 patients with previously treated mycosis fungoides or Sezary syndrome to mogamulizumab or vorinostat and is the trial the approval rests on (Kim 2018).",
    howTumoursLoseIt: "CCR4 is itself mutated in about a quarter of adult T-cell leukaemia/lymphoma cases, with gain-of-function truncations of the cytoplasmic tail; whether that changes antibody binding is not settled.",
    costToPatient: "Depletion of regulatory T cells along with the tumour, which causes rash and raises the risk of autoimmune complications, and a real and specific problem before an allogeneic transplant: mogamulizumab given shortly before transplant has been associated with severe graft-versus-host disease, because the regulatory T cells that would have restrained it are gone.",
    sources: [SRC.kim2018, SRC.kataoka2015],
  },
  {
    antigen: "CD52", targetId: "cd52", specificity: "tumour-associated",
    carriedBy: "Chronic lymphocytic leukaemia, T-cell prolymphocytic leukaemia and most peripheral T-cell lymphomas, at near-universal and very high surface density.",
    alsoOnHealthyCells: "Normal B and T lymphocytes, monocytes, macrophages, eosinophils and dendritic cells, and the epithelium of the male reproductive tract.",
    notCarriedBy: "Haematopoietic stem cells, which is why the marrow recovers, and erythrocytes and platelets.",
    whatTheDrugDoes: "CD52 is a tiny glycopeptide of 12 amino acids anchored to the membrane by a glycosylphosphatidylinositol tail, present at extremely high density, which makes it an efficient complement-fixing target. Alemtuzumab is the antibody; in lymphoma it is reserved for T-cell disease where little else works.",
    howTumoursLoseIt: "Loss of the glycosylphosphatidylinositol anchor removes the antigen without touching the gene, and CD52-negative escape has been described after alemtuzumab in T-cell disease.",
    costToPatient: "The most profound lymphopenia of any antibody used in lymphoma, with CD4 counts that can stay low for a year or more, and with it cytomegalovirus reactivation, Pneumocystis pneumonia and fungal infection. Prophylaxis and viral monitoring are not optional with this drug.",
    sources: [SRC.kataoka2015],
  },
];

// ======================= 2. THE LESIONS AND THE PATHWAYS =======================
/**
 * One row per lesion or pathway, with the diseases it defines, the mechanism, the measured frequency and its cohort,
 * and what it changes about treatment. `changesTreatment` is deliberately blunt: for most of these the honest answer
 * today is that it changes the prognosis and the conversation, not the prescription.
 */
export type LymphomaLesionRow = {
  lesion: string;
  /** Corpus pathway ids this lesion runs through. */
  pathwayIds: string[];
  /** Corpus target ids. */
  targetIds: string[];
  diseases: string;
  mechanism: string;
  frequency: string;
  changesTreatment: string;
  sources: Array<{ label: string; url: string }>;
};

export const lymphomaLesions: LymphomaLesionRow[] = [
  {
    lesion: "Chronic active B-cell receptor signalling, and BTK",
    pathwayIds: ["bcr-signalling", "inflammation-nfkb"], targetIds: ["btk", "cd79b", "card11", "syk", "plcg2", "prkcb"],
    diseases: "Activated B-cell-like diffuse large B-cell lymphoma, mantle cell lymphoma, Waldenstrom macroglobulinaemia, marginal zone lymphoma, primary CNS lymphoma.",
    mechanism: "The B-cell receptor normally signals only when it meets antigen. In activated B-cell-like lymphoma it signals continuously: the receptors cluster in the membrane and diffuse slowly, exactly as they do in an antigen-stimulated normal B cell, and knocking down IgM, Ig-kappa, CD79A, CD79B or BTK kills the cell. The signal runs CD79a/b to SYK to BTK to PLC-gamma-2 to protein kinase C beta to the CARD11-BCL10-MALT1 complex and into NF-kB. Mutations of the ITAM module of CD79B raise surface receptor expression and blunt LYN, the feedback brake (Davis 2010).",
    frequency: "Mutations of the first ITAM tyrosine of CD79B in 18% of activated B-cell-like cases, frequent in that subtype and rare in other diffuse large B-cell lymphomas, absent from Burkitt and MALT lymphoma; activating CARD11 mutations in roughly 10% of activated B-cell-like cases (Davis 2010).",
    changesTreatment: "This is the one pathway in lymphoma where the biology picks the drug today. BTK inhibitors are standard in mantle cell lymphoma and Waldenstrom macroglobulinaemia and have activity in primary CNS lymphoma and in the MCD genetic subtype of diffuse large B-cell lymphoma; they do little in germinal-centre disease.",
    sources: [SRC.davis2010],
  },
  {
    lesion: "MYD88 L265P and the toll-like receptor arm of NF-kB",
    pathwayIds: ["inflammation-nfkb", "bcr-signalling"], targetIds: ["myd88"],
    diseases: "Waldenstrom macroglobulinaemia and lymphoplasmacytic lymphoma, the MCD subtype of diffuse large B-cell lymphoma, primary CNS lymphoma, primary testicular lymphoma, a minority of MALT lymphomas.",
    mechanism: "MYD88 is the adaptor of the toll-like and interleukin-1 receptors. A single substitution at an invariant residue in the hydrophobic core of its TIR domain, L265P, makes it assemble a signalling complex with IRAK1 and IRAK4 without a receptor signal, driving NF-kB and JAK kinase activity. Activated B-cell-like lymphoma cells carrying it die when MYD88, IRAK1 or IRAK4 are knocked down, and the wild-type protein cannot rescue them, so it is a gain-of-function driver rather than a passenger (Ngo 2011).",
    frequency: "L265P in 29% of activated B-cell-like diffuse large B-cell lymphomas, rare or absent in other subtypes and in Burkitt lymphoma, and present in 9% of MALT lymphomas (Ngo 2011). In Waldenstrom macroglobulinaemia it is close to defining: Sanger sequencing found it in 49 of 54 patients, and in 91% of all lymphoplasmacytic lymphoma including the non-IgM form, while it was absent from paired normal tissue and from healthy donor B cells (Treon 2012).",
    changesTreatment: "In Waldenstrom macroglobulinaemia the MYD88 and CXCR4 genotype is now part of the first-line conversation, because BTK inhibitor response differs by it. In diffuse large B-cell lymphoma it marks the MCD subtype, which is the group in which BTK inhibition added to chemoimmunotherapy has shown activity in subgroup analyses, but no licensed regimen is selected on the mutation.",
    sources: [SRC.ngo2011, SRC.treon2012],
  },
  {
    lesion: "BCL2 and t(14;18)",
    pathwayIds: ["apoptosis-bcl2"], targetIds: ["bcl2", "mcl1", "bim"],
    diseases: "Follicular lymphoma, germinal-centre diffuse large B-cell lymphoma and the EZB genetic subtype.",
    mechanism: "The t(14;18) translocation puts BCL2 under the control of the immunoglobulin heavy-chain enhancer, so the cell makes an anti-apoptotic protein at a level a germinal-centre B cell is never meant to have. The sequencing of the breakpoints showed that the translocation is a mistake made by the VDJ recombinase at the pre-B-cell stage: the chromosome 18 segment recombines with the JH segment on chromosome 14, with extraneous N-region nucleotides at the junction and signal-like sequences near the chromosome 18 breakpoint (Tsujimoto 1985). The lesion is therefore not a late event in a lymphoma but the first event, made in the bone marrow years before.",
    frequency: "BCL2 rearrangement in 13.5% of 442 unselected diffuse large B-cell lymphomas in the RICOVER trial (Horn 2013), and in the large majority of follicular lymphomas. A t(14;18)-bearing B cell can be found in the blood of healthy people, so the translocation alone is not a disease.",
    changesTreatment: "Less than it should. Venetoclax, which displaces the pro-apoptotic partners from BCL-2 directly, transformed chronic lymphocytic leukaemia and has not transformed follicular or diffuse large B-cell lymphoma, where the cells also depend on MCL1 and BCL-xL. A BCL2 rearrangement is used for diagnosis and, in combination with MYC, for risk, not for drug choice.",
    sources: [SRC.tsujimoto1985, SRC.horn2013],
  },
  {
    lesion: "MYC, and the double-hit and triple-hit definitions",
    pathwayIds: ["myc", "transcription-addiction"], targetIds: ["myc-gene", "bcl2", "bcl6"],
    diseases: "Burkitt lymphoma, where a MYC translocation is the defining lesion; high-grade B-cell lymphoma with MYC and BCL2 rearrangements; a minority of diffuse large B-cell lymphoma.",
    mechanism: "MYC was mapped to 8q24, the region translocated to chromosome 2, 14 or 22 in Burkitt lymphoma cells, in 1982 (Dalla-Favera 1982); the partner is always an immunoglobulin locus, so the transcription factor is driven by the enhancer that should be driving antibody production. A double hit is a MYC rearrangement together with a BCL2 rearrangement, a triple hit adds BCL6. The two lesions are complementary rather than additive: MYC drives proliferation and would normally trigger apoptosis, and BCL2 removes that safeguard.",
    frequency: "MYC rearrangement in 8.8% of 442 diffuse large B-cell lymphomas, BCL2 in 13.5% and BCL6 in 28.7% (Horn 2013). Protein overexpression is much commoner than rearrangement: MYC protein above the 40% threshold in 31.8% of the same cohort (Horn 2013), and in a separate 167-patient training cohort MYC protein in 29%, BCL2 protein in 44% and both together in 21%, against MYC translocation in only 11% (Johnson 2012).",
    changesTreatment: "The WHO fifth edition separates high-grade B-cell lymphoma with MYC and BCL2 rearrangements as its own entity (Alaggio 2022), and in practice a double hit moves most patients off R-CHOP onto a more intensive regimen, although the randomised evidence for doing so is thin. Double expression of the two proteins without rearrangement is prognostic, not a separate entity, and does not by itself change the regimen: in the trial cohort MYC protein predicted worse survival only when BCL2 protein was present too (Johnson 2012).",
    sources: [SRC.dallafavera1982, SRC.horn2013, SRC.johnson2012, SRC.who2022],
  },
  {
    lesion: "BCL6 and the germinal-centre programme",
    pathwayIds: ["transcription-addiction", "epigenetic-reprogramming"], targetIds: ["bcl6", "crebbp", "ep300"],
    diseases: "Germinal-centre and activated B-cell-like diffuse large B-cell lymphoma, follicular lymphoma, the BN2 subtype where BCL6 fusions define the group.",
    mechanism: "BCL6 is the master transcriptional repressor of the germinal centre: it switches off the DNA-damage response and the differentiation programme so that a B cell can tolerate deliberate mutation of its own immunoglobulin genes. A lymphoma that keeps BCL6 on keeps a cell in a state where mutation is permitted and apoptosis is suppressed. The protein is normally switched off by acetylation, which is one reason CREBBP and EP300 loss matters here.",
    frequency: "BCL6 rearrangement in 28.7% of 442 diffuse large B-cell lymphomas, the commonest of the three translocations (Horn 2013); BCL6 fusions with NOTCH2 mutations define the BN2 subtype (Schmitz 2018).",
    changesTreatment: "Nothing yet. There is no approved BCL6 inhibitor or degrader, and the group's prognosis in the genetic classification is comparatively favourable, which is a reason to study de-escalation rather than a reason to change treatment now.",
    sources: [SRC.horn2013, SRC.schmitz2018],
  },
  {
    lesion: "EZH2 gain of function",
    pathwayIds: ["epigenetic-reprogramming"], targetIds: ["ezh2"],
    diseases: "Follicular lymphoma and germinal-centre diffuse large B-cell lymphoma; the EZB subtype.",
    mechanism: "EZH2 is the catalytic subunit of polycomb repressive complex 2 and writes the H3K27 trimethyl mark. The lymphoma mutations replace a single tyrosine in the SET domain, Tyr641 in the numbering of the original report and Tyr646 in current usage, and they change what the enzyme can do rather than removing it: the mutant converts the di-methyl mark to the tri-methyl mark efficiently while losing the ability to make the first methylation, so a cell carrying one mutant and one wild-type allele piles up H3K27me3 and holds the germinal-centre programme shut. This is the opposite of the loss-of-function EZH2 mutation found in myeloid disease.",
    frequency: "Tyr641 substitutions in 21.7% of germinal-centre diffuse large B-cell lymphomas and 7.2% of follicular lymphomas, and absent from activated B-cell-like cases (Morin 2010).",
    changesTreatment: "Yes, and it is one of only two genotype-selected drug choices in B-cell lymphoma. Tazemetostat is licensed for relapsed follicular lymphoma, with a higher response rate in the mutant group than in the wild-type group, and it is the reason an EZH2 mutation test is ordered at all.",
    sources: [SRC.morin2010],
  },
  {
    lesion: "CREBBP, EP300 and the rest of the chromatin machinery",
    pathwayIds: ["epigenetic-reprogramming"], targetIds: ["crebbp", "ep300", "kmt2d"],
    diseases: "Follicular lymphoma and diffuse large B-cell lymphoma, overwhelmingly the germinal-centre and EZB groups.",
    mechanism: "CREBBP and EP300 are acetyltransferases. Losing one allele lowers the dose of acetylation, which leaves BCL6 acetylated less often and therefore active more often, and leaves p53 acetylated less often and therefore working less well; the same lesion also turns down the enhancers that would let a germinal-centre cell present antigen to T cells. KMT2D, formerly MLL2, writes H3K4 monomethylation at enhancers and is the single most frequently mutated gene in follicular lymphoma.",
    frequency: "Genomic deletion or somatic mutation removing or inactivating the acetyltransferase domain of CREBBP or, more rarely, EP300 in about 39% of diffuse large B-cell lymphoma and 41% of follicular lymphoma, usually on one allele only (Pasqualucci 2011). KMT2D mutated in 32% of diffuse large B-cell lymphoma and 89% of follicular lymphoma in the discovery series, with MEF2B in 11.4% and 13.4% (Morin 2011); the coding genome of diffuse large B-cell lymphoma carries more than 30 clonally represented alterations per case (Pasqualucci 2011, Nat Genet).",
    changesTreatment: "Not yet. The pairing of CREBBP loss with HDAC3 dependency is the clearest synthetic-lethal hypothesis in B-cell lymphoma and is in trials; no approval depends on a CREBBP result.",
    sources: [SRC.pasqualucci2011, SRC.morin2011, SRC.pasqualucciCoding2011],
  },
  {
    lesion: "TP53 loss, in mantle cell lymphoma and in Richter transformation",
    pathwayIds: ["p53-mdm2-axis", "chromosomal-instability"], targetIds: ["tp53", "cdkn2a", "myc-gene"],
    diseases: "Mantle cell lymphoma, Richter transformation of chronic lymphocytic leukaemia, the A53 genetic subtype of diffuse large B-cell lymphoma.",
    mechanism: "TP53 is the commonest route by which a lymphoma stops responding to chemotherapy, because chemotherapy kills largely by provoking a p53-dependent death. In mantle cell lymphoma it travels with blastoid morphology, a high Ki-67 and CDKN2A deletion. In Richter transformation it is one of two lesions that dominate the genetics, and the transformed clone is usually the same clone as the leukaemia rather than a second cancer.",
    frequency: "In 183 younger mantle cell lymphoma patients from the Nordic MCL2 and MCL3 trials, TP53 mutation in 11% and TP53 deletion in 16%, with CDKN2A deletion in 20% and NOTCH1 mutation in 4%; only TP53 mutation kept its prognostic weight in multivariable analysis, with a hazard ratio of 6.2 for overall survival, a median overall survival of 1.8 years against 12.7 years for unmutated cases, and half the mutated group relapsing within a year (Eskelund 2017). In 86 cases of Richter syndrome, TP53 disruption in 47.1% and MYC abnormality in 26.2%; clonally unrelated transformations had both a longer median survival, 62.5 against 14.2 months, and less TP53 disruption, 23.1% against 60.0% (Rossi 2011).",
    changesTreatment: "In mantle cell lymphoma, yes in practice if not yet on any label: a TP53 mutation is the usual reason to abandon intensive cytarabine-based induction and autologous transplant and to go to a BTK inhibitor, a BCL-2 inhibitor or CAR-T instead. In Richter transformation it is the main prognostic variable, and establishing whether the large-cell clone is related to the leukaemic one changes the expected outcome more than any drug does.",
    sources: [SRC.eskelund2017, SRC.rossi2011],
  },
  {
    lesion: "JAK-STAT, in NK/T-cell lymphoma and in Hodgkin lymphoma",
    pathwayIds: ["jak-stat"], targetIds: ["jak1", "jak2", "jak3", "stat3", "stat5", "socs1", "stat6"],
    diseases: "Extranodal NK/T-cell lymphoma of nasal type, gamma-delta T-cell lymphoma, classical Hodgkin lymphoma, primary mediastinal B-cell lymphoma.",
    mechanism: "STAT3 and STAT5B mutations lock the transcription factor in its phosphorylated form. The STAT5B N642H substitution increases the binding affinity of the phosphotyrosine for the mutant histidine, so the phosphorylated protein persists and binds its target sites far more, and the growth advantage it gives can be partly reversed by a JAK1/2 inhibitor in the laboratory (Kucuk 2015). In Hodgkin lymphoma and primary mediastinal B-cell lymphoma the pathway is switched on from the other end, by amplification of JAK2 inside the 9p24.1 amplicon and by loss of the brakes SOCS1 and PTPN1.",
    frequency: "Activating STAT3 and STAT5B mutations across 51 NK/T-cell lymphomas and 43 gamma-delta T-cell lymphomas, with STAT5B N642H particularly frequent in the gamma-delta group (Kucuk 2015). JAK2 sits in the 9p24.1 amplicon in Hodgkin lymphoma and mediastinal large B-cell lymphoma, and its amplification raises both protein and activity and specifically induces PD-1 ligand transcription (Green 2010).",
    changesTreatment: "Not through an approved drug. JAK inhibitors have been tested in both settings without becoming standard; the practical consequence of the Hodgkin and mediastinal finding is that it explains why checkpoint blockade works there.",
    sources: [SRC.kucuk2015, SRC.green2010],
  },
  {
    lesion: "9p24.1 amplification of CD274, PDCD1LG2 and JAK2",
    pathwayIds: ["pd1-checkpoint", "jak-stat", "antigen-presentation-immunoediting"], targetIds: ["jak2", "ciita"],
    diseases: "Classical Hodgkin lymphoma, above all the nodular sclerosis subtype, and primary mediastinal B-cell lymphoma. The grey-zone lymphoma between them shares it.",
    mechanism: "The amplicon contains the genes for both PD-1 ligands and the kinase that induces them, so a single copy-number event raises the ligands twice over, by gene dose and by JAK2-driven transcription (Green 2010). It is the clearest example in oncology of a tumour genetically buying its way out of T-cell attack. Alongside it, CIITA, the master transactivator of MHC class II, is broken by recurrent fusions, which lowers class II on the tumour cell and, in the same rearrangements, places PD-L1 and PD-L2 under new promoters.",
    frequency: "In 108 newly diagnosed classical Hodgkin lymphomas evaluated by fluorescence in situ hybridisation, 97% had concordant alterations of both loci: polysomy in 5% (5 of 108), copy gain in 56% (61 of 108) and amplification in 36% (39 of 108), and higher-level gain predicted shorter progression-free survival (Roemer 2016). Genomic CIITA breaks in 38% of primary mediastinal B-cell lymphomas and 15% of classical Hodgkin lymphomas across 263 B-cell lymphomas (Steidl 2011).",
    changesTreatment: "Yes, and it is the reason for the sharpest contrast in lymphoma immunotherapy. PD-1 blockade produced an objective response in 20 of 23 heavily pre-treated Hodgkin patients, 87%, in the first study, in a disease where most had already failed both transplant and brentuximab vedotin (Ansell 2015); in B-cell non-Hodgkin lymphoma outside the mediastinal group, single-agent checkpoint blockade does very little. Nothing is tested before a Hodgkin patient is given a checkpoint inhibitor, because the alteration is nearly universal.",
    sources: [SRC.green2010, SRC.roemer2016, SRC.steidl2011, SRC.ansell2015],
  },
  {
    lesion: "The Hodgkin microenvironment, where the cancer cell is a minority",
    pathwayIds: ["tumor-microenvironment", "antigen-presentation-immunoediting", "myeloid-suppression-axis"], targetIds: ["cd30", "pdl1"],
    diseases: "Classical Hodgkin lymphoma.",
    mechanism: "A classical Hodgkin lymph node is mostly not cancer. The Hodgkin and Reed-Sternberg cells are a small minority of the tissue, surrounded by T cells, eosinophils, plasma cells, macrophages and fibrosis that the tumour recruits and then uses. Their identity was only settled by picking single cells off a histological section with a micromanipulator and amplifying the immunoglobulin genes: each case gave a single clonal heavy-chain rearrangement, proving that the scattered giant cells are one clone of B-lineage origin even though they have lost almost every B-cell marker (Kuppers 1994). Because the malignant cells are so rare, bulk genomic assays on a Hodgkin biopsy mostly measure the infiltrate, which is why the 9p24.1 work needed laser capture and fluorescence in situ hybridisation rather than sequencing.",
    frequency: "An increased number of CD68-positive macrophages, measured by immunohistochemistry in an independent cohort of 166 patients, tracked shorter progression-free survival, a higher chance of relapse after autologous transplant and shorter disease-specific survival, and outperformed the International Prognostic Score in multivariable analysis (Steidl 2010).",
    changesTreatment: "No test on the infiltrate is used to choose treatment. The practical consequences are methodological: a Hodgkin biopsy needs enough tissue for architecture, a core needle sample is often not enough, and interim PET rather than a molecular marker is what the treatment is adapted to.",
    sources: [SRC.kuppers1994, SRC.kuppers2009, SRC.steidl2010],
  },
  {
    lesion: "HTLV-1, Tax and HBZ",
    pathwayIds: ["oncogenic-viruses", "inflammation-nfkb"], targetIds: ["ccr4", "card11", "plcg1", "vav1", "irf4"],
    diseases: "Adult T-cell leukaemia/lymphoma.",
    mechanism: "Human T-lymphotropic virus 1 integrates into the genome of a CD4 T cell and expresses Tax, which switches on NF-kB and interferes with the DNA-damage response and the spindle checkpoint, and HBZ, encoded on the opposite strand, which is retained when Tax expression is switched off under immune pressure. The host genome then acquires the rest of the lesions, and they are not random: the alterations found across 426 cases overlap significantly with the proteins Tax itself binds, and are concentrated in T-cell receptor and NF-kB signalling, T-cell trafficking and immune surveillance, with activating mutations in PLCG1, PRKCB, CARD11, VAV1, IRF4, FYN, CCR4 and CCR7, CTLA4-CD28 and ICOS-CD28 fusions, and intragenic deletions of IKZF2, CARD11 and TP73 (Kataoka 2015).",
    frequency: "Across 426 adult T-cell leukaemia/lymphoma cases analysed by whole-genome, exome, transcriptome and targeted sequencing with copy-number and methylation arrays (Kataoka 2015). Most people infected with HTLV-1 never develop the disease, and the latency between infection, usually in infancy through breastfeeding, and the leukaemia is measured in decades.",
    changesTreatment: "The CCR4 finding is the practical one: CCR4 is both frequently expressed and frequently mutated, and mogamulizumab is used in this disease. The virus itself is not a drug target, and antiretroviral treatment does not cure the leukaemia.",
    sources: [SRC.kataoka2015],
  },
  {
    lesion: "Epstein-Barr virus and its latency programmes",
    pathwayIds: ["oncogenic-viruses", "inflammation-nfkb"], targetIds: ["cd30", "myc-gene"],
    diseases: "Endemic Burkitt lymphoma, a share of classical Hodgkin lymphoma, extranodal NK/T-cell lymphoma, post-transplant lymphoproliferative disorder, EBV-positive diffuse large B-cell lymphoma, plasmablastic lymphoma.",
    mechanism: "Epstein-Barr virus persists for life in the memory B-cell pool of almost everyone, and what it expresses while it is there decides what it can cause. In latency I only EBNA1 is made, which is enough to keep the episome but gives the immune system almost nothing to see; this is the Burkitt pattern, where the virus coexists with a MYC translocation. In latency II, EBNA1 with LMP1 and LMP2, LMP1 mimics a permanently engaged CD40 receptor and drives NF-kB; this is the Hodgkin and NK/T-cell pattern. In latency III the full set of nuclear antigens and membrane proteins is expressed and will immortalise a resting B cell outright, which is what happens when T-cell surveillance is removed, as in post-transplant lymphoproliferative disorder and HIV-associated lymphoma. The virus was found in the first place by electron microscopy of cells cultured from Burkitt lymphoma, whose geographic distribution matching holoendemic malaria had suggested a viral cause (Young and Rickinson 2004).",
    frequency: "The share of each disease that is EBV-positive varies by subtype, by geography and by age, and this layer does not state a single figure because the published ranges are wide and cohort-dependent. What is consistent is the direction: the proportion rises with immunosuppression and with age, and endemic Burkitt lymphoma in equatorial Africa is almost uniformly positive while sporadic Burkitt lymphoma usually is not.",
    changesTreatment: "Reducing immunosuppression is the first treatment of post-transplant lymphoproliferative disorder, which is the only place where acting on the virus changes the plan. Plasma EBV DNA is used to monitor response in NK/T-cell lymphoma and in post-transplant disease. EBV-specific T cells are licensed for post-transplant disease after transplant failure.",
    sources: [SRC.young2004, SRC.kuppers2009],
  },
  {
    lesion: "RHOA G17V and the epigenetic mutations of T-follicular-helper lymphoma",
    pathwayIds: ["epigenetic-reprogramming", "clonal-haematopoiesis"], targetIds: ["rhoa", "tet2", "dnmt3a", "fyn", "b2m", "cd58"],
    diseases: "Angioimmunoblastic T-cell lymphoma and the other T-follicular-helper lymphomas; a minority of peripheral T-cell lymphoma not otherwise specified.",
    mechanism: "A single substitution, G17V, in the small GTPase RHOA produces a protein that does not bind GTP and that blocks the wild-type protein as well. It is specific to the tumour cell, whereas the TET2 mutations that accompany it are found in non-tumour haematopoietic cells too, which places the TET2 lesion earlier, in the stem cell, and makes this lymphoma a disease that grows out of clonal haematopoiesis.",
    frequency: "RHOA G17V in 68% of angioimmunoblastic T-cell lymphoma samples, with every G17V case also carrying a TET2 mutation (Sakata-Yanagimoto 2014); independently, in 22 of 35 angioimmunoblastic cases, 67%, and 8 of 44 peripheral T-cell lymphoma not otherwise specified, 18%, alongside recurrent TET2, DNMT3A and IDH2 mutations and less frequent FYN, ATM, B2M and CD58 lesions (Palomero 2014).",
    changesTreatment: "Not through an approved test. The hypomethylating agents are used in this disease on the strength of the TET2 and DNMT3A biology rather than on a mutation result, and azacitidine-containing regimens have shown activity in T-follicular-helper histology specifically.",
    sources: [SRC.sakata2014, SRC.palomero2014],
  },
  {
    lesion: "t(11;18) API2-MALT1 and the NF-kB lesions of marginal zone lymphoma",
    pathwayIds: ["inflammation-nfkb", "microbiome-tumour"], targetIds: ["malt1", "bcl10", "birc3", "tnfaip3"],
    diseases: "MALT lymphoma, above all gastric, and the other marginal zone lymphomas.",
    mechanism: "Gastric MALT lymphoma begins as a Helicobacter-driven proliferation that still needs the antigen; removing the bacterium removes the stimulus and the lymphoma regresses. The t(11;18) fuses API2 to MALT1 and produces a protein that activates NF-kB on its own, so the lymphoma no longer needs the antigen and no longer cares whether the bacterium is still there. The related translocations, t(1;14) involving BCL10 and t(14;18) involving MALT1, do the same job by a different route, and inactivation of TNFAIP3 removes the brake.",
    frequency: "Among 111 patients with Helicobacter-positive gastric MALT lymphoma treated with antibiotics, the translocation separated the responders from the non-responders: 47 of the 48 patients who regressed completely were negative for the API2-MALT1 transcript (Liu 2002).",
    changesTreatment: "Yes, and this is one of the few places where a translocation result changes the first decision. A t(11;18)-positive gastric MALT lymphoma should not be treated with eradication alone, whatever the stage; a negative one usually can be.",
    sources: [SRC.liu2002],
  },
  {
    lesion: "TCF3, ID3 and CCND3 in Burkitt lymphoma",
    pathwayIds: ["bcr-signalling", "pi3k-akt-mtor", "cell-cycle-engine-cdks"], targetIds: ["myc-gene", "ccnd3", "tcf3", "id3"],
    diseases: "Burkitt lymphoma, sporadic, endemic and HIV-associated.",
    mechanism: "A MYC translocation alone does not make a Burkitt lymphoma; it needs a partner that supplies survival. In Burkitt the partner is tonic B-cell receptor signalling through TCF3, the transcription factor also known as E2A: mutations either activate TCF3 or inactivate its negative regulator ID3, and TCF3 then switches on the PI3K pathway partly by augmenting tonic receptor signalling. A second, independent lesion drives the cell cycle directly, through CCND3 mutations that produce unusually stable cyclin D3.",
    frequency: "TCF3 or ID3 mutation in 70% of sporadic Burkitt lymphoma cases and oncogenic CCND3 mutations in 38%, in a study combining high-throughput RNA sequencing with RNA interference screening (Schmitz 2012).",
    changesTreatment: "Not yet, and the gap is uncomfortable, because the regimens that cure Burkitt lymphoma are the most toxic in lymphoma and are the reason the disease is hard to treat in older patients and in low-resource settings, which is exactly where the endemic form occurs.",
    sources: [SRC.schmitzBurkitt2012],
  },
];

// ======================= 3. CLASSIFICATION BY MOLECULE =======================
/**
 * What each scheme is, how it is actually called in a laboratory, and what it changes. The last column is the one
 * that matters to a patient and is the one most often skipped: for most of these the answer today is that it changes
 * the expected course and the trial a person is eligible for, and not the prescription.
 */
export const lymphomaClassification: Array<{ scheme: string; classes: string; howItIsCalled: string; whatItChanges: string; sources: Array<{ label: string; url: string }> }> = [
  {
    scheme: "Cell of origin (germinal-centre B-cell-like, activated B-cell-like, unclassified)",
    classes: "Two named classes and a third that is neither. Microarray profiling of 240 diffuse large B-cell lymphomas found germinal-centre B-cell-like, activated B-cell-like and type 3, and the two common oncogenic events of the time, BCL2 translocation and c-REL amplification, were detected only in the germinal-centre group (Rosenwald 2002). The original observation was that the two classes correspond to different stages of normal B-cell differentiation, and that the germinal-centre group lived significantly longer (Alizadeh 2000).",
    howItIsCalled: "Almost never by the method that defined it. The reference is gene expression profiling, now done with a NanoString-based assay on paraffin tissue; what most laboratories report is the Hans algorithm, three immunohistochemistry stains read in order: CD10, then BCL6, then MUM1. On 152 cases with a microarray result for comparison, Hans called 64 (42%) germinal-centre and 88 (58%) non-germinal-centre, with five-year overall survival of 76% against 34% (Hans 2004). The algorithm is reproducible enough to report and loose enough that a meaningful minority of cases are called differently by the two methods, which is why the immunohistochemistry result is reported as germinal-centre or non-germinal-centre rather than as germinal-centre or activated.",
    whatItChanges: "Today, honestly, very little. It is prognostic and it is used to decide eligibility for trials of BTK inhibitors, lenalidomide and bortezomib in the activated group, and every randomised attempt to act on it in first line has so far failed to change survival. It is not used to choose between R-CHOP and anything else outside a trial.",
    sources: [SRC.alizadeh2000, SRC.rosenwald2002, SRC.hans2004],
  },
  {
    scheme: "The genetic subtypes: MCD, BN2, N1, EZB and the rest",
    classes: "Exome and transcriptome sequencing, copy-number analysis and targeted resequencing of 372 genes across 574 biopsies produced four prominent subtypes defined by which lesions occur together: MCD, named for the co-occurrence of MYD88 L265P and CD79B mutation; BN2, for BCL6 fusions and NOTCH2 mutations; N1, for NOTCH1 mutations; and EZB, for EZH2 mutations and BCL2 translocations. Survival after immunochemotherapy was favourable in BN2 and EZB and inferior in MCD and N1 (Schmitz 2018). A parallel analysis of 304 primary tumours by consensus clustering found five subsets, including a previously unrecognised low-risk activated B-cell group of extrafollicular or marginal-zone origin, two germinal-centre subsets with different outcomes, and a group independent of cell of origin with biallelic TP53 inactivation and CDKN2A loss (Chapuy 2018).",
    howItIsCalled: "LymphGen is the algorithm that made the schemes usable on one patient rather than on a cohort: it returns the probability that a given lymphoma belongs to one of seven genetic subtypes from its genetic features, and it showed that the subtypes share a pathogenesis with indolent and extranodal lymphoma types rather than standing alone (Wright 2020). It needs a sequencing panel with copy-number and fusion calling, not an immunohistochemistry panel, and a meaningful share of cases come back unclassified.",
    whatItChanges: "Not routine practice. No regulator licenses a drug on a LymphGen call, and no randomised trial has yet assigned treatment by it. What it does change is how trials are designed and how subgroup results are read: the activity of BTK inhibition concentrated in the MCD and N1 subtypes in retrospective analysis is the clearest example, and it is the reason the next generation of first-line trials genotype everyone.",
    sources: [SRC.schmitz2018, SRC.chapuy2018, SRC.wright2020],
  },
  {
    scheme: "The WHO fifth edition, and why the names keep changing",
    classes: "The fifth edition reorganises lymphoid neoplasms into a hierarchy, renames some entities, revises diagnostic criteria, deletes some entities and introduces others, and adds tumour-like lesions and germline predisposition syndromes (Alaggio 2022). High-grade B-cell lymphoma with MYC and BCL2 rearrangements is a separate entity from diffuse large B-cell lymphoma not otherwise specified; the T-follicular-helper lymphomas are grouped by their common origin rather than by their appearance.",
    howItIsCalled: "By a haematopathologist, on morphology plus an immunohistochemistry panel plus whatever genetics the entity requires. There is a second classification published in the same year, the International Consensus Classification, which differs in several names and criteria, so two reports on the same biopsy can use different words for the same disease.",
    whatItChanges: "The name on the report, the trial a person is eligible for, and sometimes the regimen, because a few entities carry their own treatment. It is worth telling a patient that a changed name does not mean a changed disease.",
    sources: [SRC.who2022],
  },
];

// ======================= 4. RESISTANCE =======================
/**
 * The escape routes, by drug class. These rows are the source for the lymphoma entries in the resistance atlas
 * (src/data/resistance.ts), and the `category` values match the fixed taxonomy in src/lib/resistance-categories.ts.
 */
export const lymphomaResistance: Array<{ drugClass: string; route: string; category: string; how: string; frequency: string; answer: string; sources: Array<{ label: string; url: string }> }> = [
  {
    drugClass: "Anti-CD20 antibodies (rituximab, obinutuzumab)", route: "Loss or down-regulation of CD20", category: "antigen",
    how: "Transcriptional down-regulation of MS4A1 rather than deletion of the gene: the messenger RNA is lower in the CD20-negative cells than in the CD20-positive cells from the same patient. Trogocytosis, in which macrophages strip antibody-antigen complexes off the surface, lowers the antigen without changing the cell's genome at all.",
    frequency: "Of 124 patients treated with rituximab-containing chemotherapy, 36 relapsed or progressed and 19 were rebiopsied; 5 of those 19, 26.3%, had become CD20-negative, and all five died within a year of the transformation (Hiraga 2009). The denominator that matters is unknown, because most relapses are never rebiopsied.",
    answer: "Rebiopsy at relapse and stain for CD20 before giving another CD20-directed drug. Where it is gone, the address has to change: CD19 (tafasitamab, CAR-T), CD79b (polatuzumab vedotin), CD30 where it is expressed, or a chemotherapy-only regimen.",
    sources: [SRC.hiraga2009],
  },
  {
    drugClass: "Anti-CD20 antibodies", route: "Effector exhaustion and complement depletion", category: "pharmacology",
    how: "The antibody does not kill by itself: it needs complement, natural killer cells and macrophages. Repeated dosing depletes complement locally and the effector cells become refractory, which is part of why retreatment works less well than first treatment even where the antigen is intact.",
    frequency: "Not quantified in a way OnCo can cite; this is mechanism from the laboratory rather than a measured clinical share.",
    answer: "Glycoengineered antibodies with higher Fc receptor affinity (obinutuzumab), and formats that do not depend on the patient's own effectors at all: CD3 bispecifics and CAR-T.",
    sources: [SRC.hiraga2009],
  },
  {
    drugClass: "Covalent BTK inhibitors (ibrutinib, acalabrutinib, zanubrutinib)", route: "BTK C481S", category: "on-target",
    how: "Ibrutinib and its successors bind cysteine 481 covalently. Replacing that cysteine with serine leaves the kinase active and makes the inhibition reversible, so the drug no longer holds. Whole-exome sequencing of paired samples before treatment and at relapse found the substitution in five of six patients with acquired resistance (Woyach 2014).",
    frequency: "Five of six patients with acquired ibrutinib resistance in the original series, and absent from all nine patients with prolonged lymphocytosis who were still responding (Woyach 2014).",
    answer: "A non-covalent inhibitor that does not need cysteine 481. Pirtobrutinib gave an overall response of 73.3% in 247 patients who had already received a covalent BTK inhibitor, with median progression-free survival of 19.6 months (Mato 2023). After that, venetoclax or CAR-T.",
    sources: [SRC.woyach2014, SRC.mato2023],
  },
  {
    drugClass: "Covalent BTK inhibitors", route: "PLCG2 gain of function", category: "bypass",
    how: "PLC-gamma-2 sits immediately downstream of BTK. R665W and L845F are gain-of-function changes that make B-cell receptor signalling autonomous, so blocking the kinase above them achieves nothing.",
    frequency: "Three distinct PLCG2 mutations in two of the six patients with acquired ibrutinib resistance, and absent from the patients still responding (Woyach 2014).",
    answer: "Not a BTK inhibitor of any generation: the lesion is below the drug. Venetoclax, CAR-T or a bispecific antibody.",
    sources: [SRC.woyach2014],
  },
  {
    drugClass: "Non-covalent BTK inhibitors (pirtobrutinib)", route: "BTK L528W and T474I", category: "on-target",
    how: "The kinase-dead L528W substitution and the gatekeeper T474I change the pocket rather than the covalent cysteine, so they defeat the reversible inhibitor too. L528W appeared far more often after zanubrutinib than after ibrutinib, 7 of 13 against 1 of 24 progressing patients, and in two patients it was enriched further under pirtobrutinib, which is cross-resistance rather than a new mutation (Blombery 2022).",
    frequency: "7 of 13 progressing patients on zanubrutinib against 1 of 24 on ibrutinib (Blombery 2022).",
    answer: "Both patients in that report responded to venetoclax-based treatment afterwards; CAR-T and bispecific antibodies are the other routes, and a BTK degrader removes the protein rather than inhibiting it, which is the approach being tested for exactly this situation.",
    sources: [SRC.blombery2022],
  },
  {
    drugClass: "BCL-2 inhibitors (venetoclax)", route: "BCL2 G101V and the other binding-site mutations", category: "on-target",
    how: "Glycine 101 sits in the BH3-binding groove. The valine substitution reduces the affinity of BCL-2 for venetoclax about 180-fold by surface plasmon resonance, so the drug can no longer displace the pro-apoptotic proteins, while the protein continues to do its job.",
    frequency: "In paired samples from 15 patients progressing on venetoclax in clinical trials, G101V was found in seven at progression and in none at study entry. It was first detectable 19 to 42 months into treatment and appeared months before clinical progression (Blombery 2019).",
    answer: "Serial sequencing can see it coming, which is the one place in lymphoma where a resistance mutation is detectable before the disease declares itself. The answer afterwards is a different mechanism entirely: a BTK inhibitor if one has not been used, CAR-T, or a bispecific antibody.",
    sources: [SRC.blombery2019],
  },
  {
    drugClass: "BCL-2 inhibitors", route: "Dependence shifts to MCL1 or BCL-xL", category: "bypass",
    how: "A cell that needs BCL-2 can be made to need its relatives instead. This is the main reason venetoclax has never been as useful in diffuse large B-cell or follicular lymphoma as it is in chronic lymphocytic leukaemia, where the dependence on BCL-2 is close to absolute.",
    frequency: "Mechanistic rather than counted: OnCo holds no clinical share for this route in lymphoma.",
    answer: "MCL1 inhibitors have been held back by cardiac toxicity. Combinations that lower MCL1 indirectly, and newer BCL-2 inhibitors such as sonrotoclax, are the current attempts.",
    sources: [SRC.blombery2019],
  },
  {
    drugClass: "CD19 CAR-T", route: "Antigen loss or epitope loss", category: "antigen",
    how: "Three mechanisms converge on the same result: hemizygous deletion across the CD19 locus, frameshift and missense mutations in exon 2, and selection for an alternatively spliced transcript that skips exon 2 and makes a truncated protein the CAR cannot see but which partly rescues the cell. The splicing factor SRSF3, which keeps exon 2 in, is lower in relapsed disease (Sotillo 2015).",
    frequency: "Relapse with epitope loss follows 10 to 20% of paediatric responses in B-cell acute lymphoblastic leukaemia (Sotillo 2015). In large B-cell lymphoma, CD19 target evasion is documented after axicabtagene ciloleucel (Plaks 2021) but OnCo does not hold a share it can stand behind, because the published series are small and do not agree.",
    answer: "A second address: CD20 or CD22 bispecific antibodies, CD22-directed CAR-T, or dual-target constructs designed so that loss of one antigen is not enough.",
    sources: [SRC.sotillo2015, SRC.plaks2021],
  },
  {
    drugClass: "CD19 CAR-T", route: "T-cell fitness, in the product and in the patient", category: "pharmacology",
    how: "Half of the medicine is the patient's own T cells, collected after several lines of chemotherapy. Single-cell sequencing of 24 axicabtagene ciloleucel infusion products found that patients in complete response at three months had three times the frequency of memory-signature CD8 T cells, and that an exhaustion signature in the product tracked a poor molecular response measured in cell-free DNA at day 7 (Deng 2020).",
    frequency: "In the same 24-patient series, a rare population with monocyte-like transcription in the product was associated with high-grade neurotoxicity (Deng 2020).",
    answer: "Collecting the cells earlier in the disease course, which is part of the argument for moving CAR-T to second line; allogeneic and in vivo products that do not depend on the patient's T cells at all; and armoured constructs.",
    sources: [SRC.deng2020],
  },
  {
    drugClass: "CD19 CAR-T", route: "The microenvironment", category: "immune-evasion",
    how: "The lymph node the CAR-T cells have to work in contains suppressive myeloid cells, PD-L1 on the tumour and on the stroma, and in some lymphomas a fibrotic barrier. A CAR-T cell that is fit in the bag can be switched off in the node.",
    frequency: "Not quantified as a share of relapses, because it is a continuum rather than a yes-or-no finding.",
    answer: "Checkpoint blockade after CAR-T, PD-1 knockout constructs and armoured cells secreting cytokines, all in trials rather than approved.",
    sources: [SRC.deng2020],
  },
  {
    drugClass: "Checkpoint blockade in Hodgkin lymphoma", route: "Loss of MHC class II on the Reed-Sternberg cell", category: "immune-evasion",
    how: "Hodgkin lymphoma responds to PD-1 blockade despite deficient MHC class I on the tumour cell, which was a puzzle until the biopsies were read. Across CheckMate 205, higher-level 9p24.1 copy gain and higher PD-L1 predicted longer progression-free survival; expression of beta-2-microglobulin and MHC class I did not predict complete remission, but MHC class II did, and in patients more than 12 months out from autologous transplant MHC class II expression tracked longer progression-free survival (Roemer 2018). The implication is that the relevant effector is a CD4 T cell, and the escape route is losing the molecule that presents to it, often through the CIITA rearrangements that also raise the PD-1 ligands (Steidl 2011).",
    frequency: "Measured as a predictor rather than as a share: in the CheckMate 205 biopsies, MHC class II expression on Hodgkin and Reed-Sternberg cells predicted complete remission (Roemer 2018).",
    answer: "Brentuximab vedotin combinations, which do not need antigen presentation at all; and the combination of a checkpoint inhibitor with chemotherapy, which is where the field has gone in first line.",
    sources: [SRC.roemer2018, SRC.steidl2011],
  },
  {
    drugClass: "CD3 bispecific antibodies", route: "Target loss and T-cell exhaustion together", category: "antigen",
    how: "A CD20 bispecific needs CD20 on the tumour and a working T cell in the node, so it is exposed to both of the failures above at once. Patients who progress after CD19 CAR-T have both a depleted T-cell compartment and, sometimes, a changed antigen landscape.",
    frequency: "Not separately quantified in the published trials, which report response and duration rather than mechanism at progression.",
    answer: "Changing the tumour-side antigen, and sequencing the classes so that the bispecific is given while the T-cell compartment is still intact.",
    sources: [SRC.hiraga2009],
  },
];

// ======================= 5. THE TESTS =======================
/** The tests that actually get run on a lymphoma biopsy or a blood sample, what each one answers and what it misses. */
export const lymphomaTests: Array<{ test: string; technologyIds: string[]; answers: string; limits: string; sources: Array<{ label: string; url: string }> }> = [
  {
    test: "Immunohistochemistry panel on an excisional biopsy",
    technologyIds: ["histopathology-ihc"],
    answers: "Lineage and subtype. A B-cell panel runs CD20, CD79a, PAX5, CD10, BCL6, MUM1, BCL2, MYC, cyclin D1, SOX11 and Ki-67; a T-cell panel runs CD2, CD3, CD4, CD5, CD7, CD8, CD30, ALK, PD-1, CXCL13 and ICOS; a Hodgkin panel runs CD30, CD15, PAX5, CD20 and EBER. The Hans algorithm, three stains read in order, is how cell of origin is reported in most laboratories (Hans 2004).",
    limits: "A core needle biopsy often gives enough cells and not enough architecture, which is the commonest reason a lymphoma diagnosis has to be repeated. In classical Hodgkin lymphoma the malignant cells are a small minority of the tissue, so a small sample can miss them altogether (Kuppers 2009).",
    sources: [SRC.hans2004, SRC.kuppers2009],
  },
  {
    test: "FISH for MYC, BCL2 and BCL6",
    technologyIds: ["cytogenetics-fish"],
    answers: "Whether the lymphoma is a double hit or a triple hit, which is a separate WHO entity and in practice a different treatment plan. In 442 unselected diffuse large B-cell lymphomas, MYC was rearranged in 8.8%, BCL2 in 13.5% and BCL6 in 28.7% (Horn 2013).",
    limits: "A break-apart probe says a locus is rearranged, not what it is rearranged with, and a MYC rearrangement to a non-immunoglobulin partner does not carry the same risk. Most laboratories screen on MYC protein expression and run the full panel only where it is high, which will miss a minority of rearranged cases. The test is on fixed tissue and takes days.",
    sources: [SRC.horn2013, SRC.who2022],
  },
  {
    test: "Flow cytometry",
    technologyIds: ["flow-cytometry-mrd", "flow-cytometers"],
    answers: "Immunophenotype in hours rather than days, on blood, marrow, cerebrospinal fluid, pleural fluid or a fine-needle aspirate, and light-chain restriction as fast evidence of a clonal B-cell population. It is the test that finds circulating Sezary cells and marrow involvement.",
    limits: "It needs cells in suspension, so it cannot be done on a fixed block and it reads a sclerotic or fibrotic node badly. It gives no architecture, so it cannot separate follicular lymphoma from a reactive follicle on its own, and it under-detects Hodgkin lymphoma, where the malignant cells are rare and fragile.",
    sources: [SRC.vandongen2003],
  },
  {
    test: "IGH and TCR clonality",
    technologyIds: ["clonality-testing"],
    answers: "Whether a lymphoid population is one clone or many. The BIOMED-2 multiplex PCR assays standardised this with 107 primers in 18 tubes covering IGH, IGK, IGL, TCRB, TCRG and TCRD plus the BCL1-IGH and BCL2-IGH translocations; combined IGH and IGK tubes detect virtually all clonal B-cell proliferations even where somatic hypermutation is heavy, and combined TCRB and TCRG tubes detect virtually all clonal T-cell populations (van Dongen 2003).",
    limits: "Clonality is not malignancy. A clonal population can be found in reactive conditions and in older people, and a polyclonal result does not exclude lymphoma. The assay is at its most useful where the morphology is equivocal, which is also where it is at its most dangerous if it is read as a diagnosis.",
    sources: [SRC.vandongen2003],
  },
  {
    test: "Circulating tumour DNA and residual disease",
    technologyIds: ["ctdna-lymphoma-monitoring", "liquid-biopsy", "mrd-testing"],
    answers: "Three things. Genotype, including cell of origin, from plasma rather than from tissue (Scherer 2016). Burden at diagnosis, which correlated with clinical indices and independently predicted outcome in 92 lymphoma patients. And residual disease: PhasED-seq uses several somatic mutations on the same DNA fragment to reach the parts-per-million range, and in participants with no detectable ctDNA after two cycles by the earlier CAPP-Seq method, a further 25% were positive by PhasED-seq and did worse (Kurtz 2021).",
    limits: "No approval in lymphoma depends on a ctDNA result and no randomised trial has yet changed treatment on one, so this is a measurement in search of a decision. Sensitivity falls with low disease burden and with sanctuary sites, and a tumour-informed assay needs tumour tissue first.",
    sources: [SRC.scherer2016, SRC.kurtz2021],
  },
  {
    test: "FDG-PET and the Deauville score",
    technologyIds: ["fdg-pet", "pet-ct", "pet-adapted-therapy"],
    answers: "Response, on a five-point scale comparing the brightest lymphoma site with two internal references: 1 no uptake, 2 uptake at or below the mediastinal blood pool, 3 above the mediastinum but at or below the liver, 4 moderately above the liver, 5 markedly above the liver or new disease. The scale was adopted into the Lugano classification, which formally incorporated PET-CT into staging for FDG-avid lymphomas and dropped the routine staging bone marrow biopsy in Hodgkin lymphoma and most diffuse large B-cell lymphoma (Cheson 2014, Barrington 2014).",
    limits: "A score of 3 is deliberately ambiguous and means different things in a de-escalation trial and an escalation trial, so the same scan can lead to opposite decisions depending on the protocol. Inflammation, infection, granulomatous disease, brown fat and recent growth-factor support all light up. Low-grade lymphomas are variably avid, so PET is less useful there, and the scan cannot distinguish a small amount of residual lymphoma from none at all.",
    sources: [SRC.cheson2014, SRC.barrington2014],
  },
];

// ======================= NEW PATHWAY: THE GERMINAL CENTRE =======================
/**
 * The corpus holds the B-cell receptor, NF-kB, apoptosis, MYC, JAK-STAT and epigenetic pathways, but not the
 * reaction that explains why B-cell lymphoma exists at all: the germinal centre is the one place in the body where
 * a cell is instructed to mutate its own genome and to switch off the brakes while it does so.
 */
const germinalCentrePathway: PathwayInput = {
  kind: "pathway", asOf, id: "germinal-centre-reaction", name: "The germinal centre reaction",
  aka: ["Germinal centre", "Germinal center reaction", "Somatic hypermutation and class switching", "Affinity maturation"],
  tldr: "To make a good antibody, a B cell has to deliberately damage its own DNA and keep dividing while it does. The germinal centre is where that happens, under strict time limits. Most B-cell lymphomas are cells that went through it and did not come out.",
  summary: "When a B cell meets an antigen it has not seen before, it enters a lymph node follicle and starts a germinal centre. There it does three dangerous things at once. It switches on activation-induced cytidine deaminase, which deliberately mutates the variable region of its own immunoglobulin genes so that a better-binding version can be selected. It cuts and rejoins the constant region to change antibody class. And it divides faster than almost any cell in the body. To survive this, BCL6 holds down the DNA damage response and the differentiation programme, polycomb repressive complex 2 keeps the exit genes methylated shut, and CREBBP and EP300 provide the acetylation that turns the programme back off at the end.\n\nAlmost every lesion in B-cell lymphoma is a failure of one of those safeguards. Translocations of BCL2 and MYC to an immunoglobulin locus are mistakes made by the recombinases that cut these genes on purpose. EZH2 gain-of-function mutations hold the polycomb mark on, so the exit never happens. CREBBP and EP300 loss leaves BCL6 acetylated less and therefore active more. The cell of origin classification of diffuse large B-cell lymphoma is a description of where in this reaction the cancer got stuck: germinal-centre-like cells are still inside it, activated B-cell-like cells are at the exit and cannot complete it.\n\nThe reaction is also why these cancers keep their normal lineage's weaknesses. A germinal-centre B cell still carries CD19, CD20, CD79b and CD22, which is why antibodies work and why they strip out the healthy B-cell compartment at the same time.",
  analogy: "A proof-reading workshop where the only way to improve a design is to make random changes to the blueprint and test them. While the workshop is running, the fire alarm (p53 and the damage response) is switched off and the exit door (differentiation) is locked, because nobody must leave mid-experiment. Lymphoma is what happens when a worker jams the lock or cuts the alarm wire permanently.",
  nodes: [
    { id: "antigen", label: "Antigen and T-cell help (CD40, IL-21)", x: 50, y: 5 },
    { id: "bcl6", label: "BCL6 switches off the damage response", x: 25, y: 26, targetId: "bcl6" },
    { id: "aid", label: "AID mutates the immunoglobulin genes", x: 72, y: 26 },
    { id: "prc2", label: "PRC2 / EZH2 keeps the exit genes shut", x: 25, y: 48, targetId: "ezh2" },
    { id: "select", label: "Selection in the light zone: better binders survive", x: 72, y: 48 },
    { id: "hat", label: "CREBBP / EP300 acetylation releases the brake", x: 50, y: 68, targetId: "crebbp" },
    { id: "exit", label: "Exit as a plasma cell or memory B cell", x: 25, y: 88 },
    { id: "lymphoma", label: "Stuck: BCL2 and MYC translocation, EZH2 gain, CREBBP loss", x: 75, y: 88, targetId: "bcl2" },
  ],
  edges: [
    { from: "antigen", to: "bcl6" }, { from: "antigen", to: "aid" }, { from: "bcl6", to: "prc2" }, { from: "aid", to: "select" },
    { from: "prc2", to: "hat" }, { from: "select", to: "hat" }, { from: "hat", to: "exit" }, { from: "hat", to: "lymphoma", type: "inhibits" },
    { from: "prc2", to: "lymphoma" }, { from: "bcl6", to: "exit", type: "inhibits" },
  ],
  interventions: [
    "EZH2 inhibition (tazemetostat) in follicular lymphoma, which is the only licensed drug that acts on this reaction directly and the only one selected by a germinal-centre genotype",
    "BCL-2 inhibition (venetoclax) against the anti-apoptotic protein the t(14;18) translocation put there",
    "HDAC inhibition as the proposed answer to CREBBP loss, on the argument that a cell short of acetyltransferase is dependent on keeping the deacetylase in check; in trials, not approved for this indication",
    "BCL6 degraders and inhibitors, in early trials",
    "Every anti-CD19, anti-CD20, anti-CD79b and anti-CD22 medicine, which work because the lymphoma kept the surface of the normal cell it came from",
  ],
  cancers: [CX.dlbcl, CX.fl, CX.burkitt, CX.nhl, CX.pmbcl],
  targets: ["bcl6", "ezh2", "crebbp", "ep300", "bcl2", "myc-gene", "kmt2d"],
  pathways: ["epigenetic-reprogramming", "apoptosis-bcl2", "bcr-signalling", "myc"],
  terms: ["lymphoma-bio-germinal-centre", "cell-of-origin"],
  links: [SRC.tsujimoto1985, SRC.morin2010, SRC.pasqualucci2011, SRC.alizadeh2000],
  tags: ["pathway", "lymphoma"],
};

// ======================= NEW TECHNOLOGY: CLONALITY TESTING =======================
const clonalityTechnology: TechnologyInput = {
  kind: "technology", asOf, id: "clonality-testing", name: "Immunoglobulin and T-cell receptor clonality testing",
  aka: ["IGH clonality", "TCR clonality", "BIOMED-2", "EuroClonality", "gene rearrangement study", "B-cell clonality", "T-cell clonality"],
  tldr: "A test that asks whether a group of lymphocytes is one family descended from a single cell, or a crowd of unrelated ones. Cancer is one family. It is used when the appearance under the microscope is not enough to decide.",
  summary: "Every B cell and T cell rearranges its antigen receptor genes into a sequence unique to itself, so the length and sequence of that rearrangement is a fingerprint for the cell and all its descendants. A reactive lymph node contains thousands of different rearrangements and gives a smooth, polyclonal distribution; a lymphoma contains one, repeated, and gives a single peak.\n\nThe European BIOMED-2 collaboration standardised the assay into 107 primers in 18 multiplex tubes covering the immunoglobulin heavy chain in two configurations, the kappa and lambda light chains, the T-cell receptor beta, gamma and delta loci, and the BCL1-IGH and BCL2-IGH translocations, read by heteroduplex analysis or fragment sizing. The EuroClonality-NGS successor sequences the amplicons instead of sizing them, which both improves resolution and produces a patient-specific sequence that can be followed afterwards as a residual disease marker.\n\nThe assay is most often ordered where morphology and immunohistochemistry disagree or where the sample is small: a skin biopsy in suspected cutaneous T-cell lymphoma, a gastric biopsy in suspected MALT lymphoma, a marrow with an ambiguous infiltrate, or a lymph node with an atypical but not clearly malignant population.",
  principle: "Multiplex PCR, or targeted sequencing, across the V, D and J segments of the immunoglobulin and T-cell receptor loci. A clonal population gives amplicons of one length and sequence; a polyclonal population gives a Gaussian spread of lengths. The output is a pattern, not a diagnosis.",
  strengths: [
    "Works on tiny and on fixed samples, including paraffin blocks and skin punch biopsies, where flow cytometry cannot be done",
    "Combined immunoglobulin heavy-chain and kappa tubes detect virtually all clonal B-cell proliferations, even where somatic hypermutation has altered the primer binding sites, and combined T-cell receptor beta and gamma tubes detect virtually all clonal T-cell populations (van Dongen 2003)",
    "The sequence it finds can be reused as a patient-specific residual disease marker afterwards",
    "Standardised across European laboratories, so a result travels between centres",
  ],
  limitations: [
    "Clonality is not malignancy. Clonal populations occur in reactive and autoimmune conditions, in skin, in coeliac disease and in older people, and reporting a clonal result as a diagnosis is the commonest way this test does harm",
    "A polyclonal result does not exclude lymphoma, particularly where the malignant cells are a small minority of the sample, as in classical Hodgkin lymphoma",
    "Heavily mutated immunoglobulin genes can defeat primer binding, which is why the complementary tubes exist",
    "It says nothing about which lymphoma it is",
  ],
  since: 2003,
  cancers: [CX.nhl, CX.ctcl, CX.sezary, CX.malt, CX.mzl, CX.ptcl, CX.fl, CX.dlbcl],
  technologies: ["ngs-mrd-clonoseq", "histopathology-ihc", "flow-cytometry-mrd", "mrd-testing"],
  terms: ["ngs", "mrd", "lymphoma-bio-germinal-centre"],
  links: [SRC.vandongen2003],
  tags: ["diagnostics", "lymphoma"],
};

// ======================= NEW GLOSSARY TERMS =======================
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });

const terms: TermInput[] = [
  term({
    id: "lymphoma-bio-germinal-centre", name: "The germinal centre: why lymphoma starts where antibodies are made", category: "Biology",
    aka: ["Germinal centre reaction", "Somatic hypermutation", "Class switch recombination", "Affinity maturation"],
    tldr: "To make a better antibody, a B cell has to deliberately damage its own DNA while dividing fast, with its safety checks switched off. Most B-cell lymphomas are cells that went into that process and never came out of it properly.",
    summary: "A germinal centre forms in a lymph node a few days after a new infection or vaccination. Inside it, a B cell switches on an enzyme called activation-induced cytidine deaminase, which mutates the part of its own DNA that codes for the binding end of the antibody. Cells whose antibody now binds better are kept, the rest die, and the process repeats. The same enzyme cuts and rejoins the gene to change antibody class. This is why a second dose of a vaccine works better than the first.\n\nIt is also the most dangerous thing a healthy cell does. To survive deliberate DNA damage while dividing rapidly, the cell switches off its damage response, through the transcriptional repressor BCL6, and locks the exit shut, through the polycomb complex and its enzyme EZH2. A cell in that state is a cancer waiting for one mistake.\n\nThe mistakes are specific and recognisable. The t(14;18) translocation that puts BCL2 under an antibody gene's control is a recombination error, and the sequence of the breakpoints shows it was made by the normal recombinase at the pre-B-cell stage rather than later (Tsujimoto 1985). MYC lands next to an immunoglobulin locus the same way in Burkitt lymphoma. EZH2 gain-of-function mutations keep the exit locked. CREBBP and EP300 loss, present in about 39% of diffuse large B-cell lymphoma and 41% of follicular lymphoma, leaves BCL6 switched on when it should be off (Pasqualucci 2011).\n\nTwo practical consequences follow. First, a lymphoma usually keeps the surface of the normal B cell it came from, which is why CD19, CD20, CD79b and CD22 antibodies work. Second, a t(14;18)-carrying B cell can be found in the blood of healthy people, so the first lesion is not the disease; what makes a lymphoma is what happens afterwards.",
    cancers: [CX.nhl, CX.dlbcl, CX.fl, CX.burkitt],
    targets: ["bcl6", "ezh2", "crebbp", "ep300", "bcl2", "myc-gene"], pathways: ["germinal-centre-reaction", "epigenetic-reprogramming"],
    terms: ["cell-of-origin", "cytogenetics", "gene-fusion", "driver-mutation"],
    links: [SRC.tsujimoto1985, SRC.pasqualucci2011, SRC.morin2010],
  }),
  term({
    id: "lymphoma-bio-cell-of-origin-in-practice", name: "Cell of origin in practice: Hans against expression profiling, and what it changes", category: "Diagnostics",
    aka: ["Hans algorithm", "GCB versus non-GCB", "Lymph2Cx", "Cell of origin assay"],
    tldr: "Large B-cell lymphoma is split into two types by which normal B cell it most resembles. The split is real and predicts how the disease behaves, but the test most laboratories run is a cheaper approximation of the one that defined it, and today the result rarely changes which treatment is given.",
    summary: "The split was found by microarray in 2000: some diffuse large B-cell lymphomas express the genes of a germinal-centre B cell and some express the genes of a B cell that has been activated, and the germinal-centre group lived significantly longer (Alizadeh 2000). It was confirmed on 240 patients, where BCL2 translocation and c-REL amplification were found only in the germinal-centre group (Rosenwald 2002).\n\nWhat a report usually shows is not that test. Most laboratories run the Hans algorithm: three immunohistochemistry stains read in a fixed order, CD10, then BCL6, then MUM1. On 152 cases with a microarray comparison, Hans called 42% germinal-centre and 58% non-germinal-centre, with five-year overall survival of 76% against 34% (Hans 2004). The reference method now exists as a NanoString assay usable on paraffin, but it is not run everywhere, and the two methods disagree on a meaningful minority of cases. That is why a careful report says germinal-centre or non-germinal-centre rather than germinal-centre or activated: the immunohistochemistry cannot tell the activated type from the unclassified type.\n\nWhat it changes today is the honest part. Cell of origin is prognostic and it decides eligibility for trials, and every randomised attempt to act on it in first line, by adding ibrutinib, bortezomib or lenalidomide to R-CHOP for the activated group, has so far failed to change survival in the whole population. Nobody is denied R-CHOP because of it, and nobody is given a different regimen because of it outside a trial. A patient told their lymphoma is the activated type should be told what that does and does not mean.",
    cancers: [CX.dlbcl, CX.pcnsl, CX.nhl],
    targets: ["bcl2", "bcl6", "ezh2", "cd79b", "myd88"], pathways: ["bcr-signalling", "germinal-centre-reaction"],
    terms: ["cell-of-origin", "ihc", "lymphoma-bio-lymphgen"], technologies: ["histopathology-ihc", "rna-seq"],
    links: [SRC.alizadeh2000, SRC.rosenwald2002, SRC.hans2004],
  }),
  term({
    id: "lymphoma-bio-lymphgen", name: "LymphGen and the genetic clusters of large B-cell lymphoma", category: "Diagnostics",
    aka: ["LymphGen", "MCD subtype", "BN2 subtype", "EZB subtype", "N1 subtype", "DLBCL genetic subtypes", "Chapuy clusters"],
    tldr: "Sequencing shows that large B-cell lymphoma is at least seven diseases, each defined by which faults occur together. The classification explains a great deal about how the disease behaves and currently changes almost nothing about how it is treated.",
    summary: "Two groups sequenced large series in 2018 and arrived at overlapping answers. Exome and transcriptome sequencing with copy-number analysis across 574 biopsies produced four prominent subtypes named for the lesions that co-occur: MCD for MYD88 L265P with CD79B mutation, BN2 for BCL6 fusions with NOTCH2 mutations, N1 for NOTCH1 mutations, and EZB for EZH2 mutations with BCL2 translocations; survival after immunochemotherapy was better in BN2 and EZB and worse in MCD and N1 (Schmitz 2018). Consensus clustering of 304 primary tumours found five subsets, including a low-risk activated B-cell group of extrafollicular or marginal-zone origin, two germinal-centre subsets with different outcomes, and a group defined by biallelic TP53 inactivation and CDKN2A loss that cuts across cell of origin entirely (Chapuy 2018).\n\nLymphGen is what made these usable on one patient: an algorithm that returns the probability that a lymphoma belongs to one of seven genetic subtypes, and which showed that each subtype shares a pathogenesis with a particular indolent or extranodal lymphoma, so the groups are not statistical artefacts (Wright 2020).\n\nThe limits matter. It needs a sequencing panel that calls mutations, copy number and fusions, not a stain. A substantial share of cases come back unclassified. No regulator licenses anything on a LymphGen call, and no randomised trial has assigned treatment by it. Its real effect so far has been on how trials are designed and how their subgroups are read: the concentration of BTK inhibitor activity in the MCD and N1 subtypes is the clearest example, and it is why the current first-line trials genotype everyone.",
    cancers: [CX.dlbcl, CX.nhl, CX.pcnsl],
    targets: ["myd88", "cd79b", "bcl6", "notch1", "notch2", "ezh2", "bcl2", "tp53", "cdkn2a"], pathways: ["bcr-signalling", "inflammation-nfkb", "germinal-centre-reaction"],
    terms: ["cell-of-origin", "lymphoma-bio-cell-of-origin-in-practice", "ngs"], technologies: ["cgp", "wes-wgs"],
    links: [SRC.schmitz2018, SRC.chapuy2018, SRC.wright2020],
  }),
  term({
    id: "lymphoma-bio-antigen-escape", name: "Antigen escape: how a lymphoma loses the thing the drug was aimed at", category: "Resistance",
    aka: ["Antigen loss", "CD19-negative relapse", "CD20 loss", "Target evasion", "Epitope loss"],
    tldr: "Treatments that find a cancer by one marker on its surface can be defeated if the cancer stops showing that marker. It is one of the main reasons an antibody or CAR-T treatment that worked stops working.",
    summary: "There are at least four ways to lose a surface marker, and they need different answers.\n\nDeletion and mutation. After CD19 CAR-T, relapses can carry hemizygous deletion of the CD19 locus, or frameshift and missense mutations in exon 2, the part the usual CAR binds (Sotillo 2015).\n\nSplicing. The same study found something less obvious: relapsed cells select for an alternatively spliced CD19 messenger RNA that skips exon 2 entirely, producing a shortened protein that the CAR cannot see but which still does enough of the normal job to keep the cell alive. The splicing factor that keeps exon 2 in, SRSF3, was lower in relapsed disease. The gene is still there and a standard sequencing test would call it normal.\n\nTranscriptional down-regulation. After rituximab, the cells that come back can simply make less CD20. In a series where 19 of 36 relapsing patients were rebiopsied, 5 had become CD20-negative by immunohistochemistry, with lower CD20 messenger RNA in the negative cells than in the positive cells from the same patient (Hiraga 2009).\n\nShaving. Macrophages can strip antibody-antigen complexes off the surface of a living cell, a process called trogocytosis, lowering the antigen without any change to the gene.\n\nWhat follows in practice. Rebiopsy at relapse rather than assuming the antigen is still there; where it has gone, change the address rather than the format, to CD19, CD79b, CD22, CD30 or CD3-engaging bispecifics as the disease allows; and, in design terms, build constructs that need two antigens so that losing one is not enough. In B-cell acute lymphoblastic leukaemia, epitope loss follows 10 to 20% of paediatric responses to CD19 CAR-T; in large B-cell lymphoma it is documented but OnCo does not hold a share it can stand behind, because the published series are small and disagree.",
    cancers: [CX.nhl, CX.dlbcl, CX.fl, CX.mcl],
    targets: ["cd19", "cd20", "cd22", "cd79b", "cd30"], pathways: ["resistance-routes-map"],
    terms: ["resistance", "lymphoma-bio-lineage-antigen-cost"], technologies: ["car-t", "bispecific-antibody", "monoclonal-antibody", "adc"],
    links: [SRC.sotillo2015, SRC.hiraga2009, SRC.plaks2021],
  }),
  term({
    id: "lymphoma-bio-lineage-antigen-cost", name: "What it costs to aim at a lineage antigen", category: "Biology",
    aka: ["Lineage antigen", "On-target off-tumour toxicity", "B-cell aplasia", "Hypogammaglobulinaemia"],
    tldr: "Almost every lymphoma drug that finds the cancer by a surface marker finds healthy cells carrying the same marker. The side effects are not accidents; they are the treatment working on the wrong cells, and they are predictable from the marker.",
    summary: "Nearly all the surface targets in lymphoma are what the corpus calls lineage antigens: normal proteins on a normal cell type, present on the cancer because the cancer came from that cell type. Only a few, such as CD30, are close to restricted to activated cells in an adult. This has consequences that can be read off the target before the first dose.\n\nCD20 and CD19 are on every normal B cell, so anti-CD20 and anti-CD19 treatments empty the B-cell compartment. What follows is low immunoglobulin, more bacterial and viral infection, a blunted response to vaccination, and, specifically, reactivation of hepatitis B, which is why surface antigen and core antibody are checked before the first dose of rituximab. After CAR-T the aplasia is deeper and longer, sometimes years, and immunoglobulin replacement is part of the plan rather than a rescue.\n\nCD52 is on B cells, T cells, monocytes and dendritic cells, so alemtuzumab produces the most profound lymphopenia of any antibody used in lymphoma, with CD4 counts that can stay low for a year, and with it cytomegalovirus reactivation, Pneumocystis pneumonia and fungal infection.\n\nCCR4 is on regulatory T cells as well as on the tumour, so mogamulizumab removes the cells that hold autoimmunity in check: rash is common, and giving it shortly before an allogeneic transplant has been associated with severe graft-versus-host disease.\n\nCD47 is on red cells, where its job is to tell a macrophage not to eat them, so blocking it causes anaemia by design; the dosing strategy that made the class usable is a low priming dose followed by higher maintenance doses.\n\nCD38 produces a laboratory problem rather than a clinical one: anti-CD38 antibodies bind CD38 on red cells and make the indirect antiglobulin test positive, masking real alloantibodies, so the transfusion laboratory must be warned before a crossmatch.\n\nCD3 is not on the tumour at all in B-cell disease: it is the handle a bispecific antibody uses to grip a T cell. Cytokine release syndrome and neurotoxicity are that mechanism working, which is why these drugs are given with step-up dosing.",
    cancers: [CX.nhl, CX.dlbcl, CX.ctcl, CX.sezary, CX.ptcl],
    targets: ["cd20", "cd19", "cd52", "ccr4", "cd47", "cd38", "cd3", "cd22", "cd79b"], pathways: ["cd47-sirpa"],
    terms: ["lymphoma-bio-antigen-escape", "lymphoma-tx-crs-icans", "lymphoma-tx-immunoglobulin-replacement", "lymphoma-tx-hepatitis-b-reactivation"],
    technologies: ["monoclonal-antibody", "car-t", "bispecific-antibody", "t-cell-engager"],
    links: [SRC.advani2018, SRC.kim2018],
  }),
  term({
    id: "lymphoma-bio-ebv-latency", name: "Epstein-Barr virus latency programmes, and why they decide which lymphoma", category: "Biology",
    aka: ["EBV latency", "Latency I", "Latency II", "Latency III", "LMP1", "EBNA1"],
    tldr: "Almost everyone carries Epstein-Barr virus for life without harm. Which lymphoma it can help cause depends on how many of its genes the infected cell is switching on, and that depends on how closely the immune system is watching.",
    summary: "Epstein-Barr virus was found by electron microscopy of cells cultured from Burkitt lymphoma, a childhood tumour whose distribution across equatorial Africa matched that of holoendemic malaria and so suggested a viral cause. It then turned out to be everywhere, persisting for life as an asymptomatic infection of the B-cell pool in the great majority of people (Young and Rickinson 2004). What makes it dangerous in a few of them is not the virus being present but which of its genes are switched on.\n\nLatency I expresses only EBNA1, enough to keep the viral episome copied when the cell divides and almost nothing for a T cell to recognise. This is the Burkitt pattern, where the virus sits alongside a MYC translocation.\n\nLatency II adds LMP1 and LMP2. LMP1 behaves like a CD40 receptor that is permanently switched on and drives NF-kB. This is the pattern in classical Hodgkin lymphoma and in extranodal NK/T-cell lymphoma.\n\nLatency III expresses the full set of nuclear antigens and membrane proteins and will immortalise a resting B cell outright. It is kept in check entirely by T cells, which is why it appears when T cells are removed: post-transplant lymphoproliferative disorder, HIV-associated lymphoma, and EBV-positive large B-cell lymphoma in older people whose immunity has aged.\n\nThe practical consequences are few but real. Reducing immunosuppression is the first treatment of post-transplant lymphoproliferative disorder, and it is the one place where acting on the virus changes the plan. Plasma EBV DNA is used to follow response in NK/T-cell lymphoma and in post-transplant disease. EBV-specific T cells are licensed for post-transplant disease that has failed other treatment. The share of each lymphoma that is EBV-positive varies so widely by subtype, geography and age that this entry does not quote one.",
    cancers: [CX.hodgkin, CX.burkitt, CX.nhl, CX.dlbcl, CX.ptcl],
    targets: ["cd30", "myc-gene"], pathways: ["oncogenic-viruses", "inflammation-nfkb"],
    terms: ["plasma-ebv-dna", "lymphoma-bio-htlv1"],
    links: [SRC.young2004, SRC.kuppers2009],
  }),
  term({
    id: "lymphoma-bio-htlv1", name: "HTLV-1, Tax and HBZ in adult T-cell leukaemia/lymphoma", category: "Biology",
    aka: ["HTLV-1", "Human T-lymphotropic virus 1", "Tax", "HBZ", "ATLL"],
    tldr: "A virus passed mostly from mother to child in breast milk, common in parts of Japan, the Caribbean, west Africa and South America. Most people who carry it never become ill, but in a few it causes an aggressive T-cell cancer decades later.",
    summary: "Human T-lymphotropic virus 1 integrates into the DNA of a CD4 T cell and stays there. Two of its genes matter. Tax switches on NF-kB and interferes with the DNA damage response and the spindle checkpoint, which is how the infected clone starts to expand and to accumulate damage; it is also the most visible protein to the immune system, so clones that silence it survive. HBZ, encoded on the opposite DNA strand, is kept on when Tax is switched off and sustains proliferation more quietly.\n\nWhat the host genome then acquires is not random. Across 426 cases analysed by whole-genome, exome, transcriptome and targeted sequencing with copy-number and methylation arrays, the alterations overlapped significantly with the set of proteins Tax itself binds, and were concentrated in T-cell receptor and NF-kB signalling, T-cell trafficking and immune surveillance: activating mutations in PLCG1, PRKCB, CARD11, VAV1, IRF4, FYN, CCR4 and CCR7, CTLA4-CD28 and ICOS-CD28 fusions, and intragenic deletions of IKZF2, CARD11 and TP73 (Kataoka 2015). The virus, in other words, starts the process and the cell finishes it along the lines the virus drew.\n\nThe practical consequence is CCR4. It is both frequently expressed and frequently mutated in this disease, and mogamulizumab, the anti-CCR4 antibody, is used because of it. The virus itself is not a drug target and antiviral treatment does not cure the leukaemia. Transmission is mainly through breastfeeding, and the interval between infection in infancy and the disease is measured in decades, which is why screening and formula feeding in endemic regions is a prevention question rather than a treatment one.",
    cancers: [CX.ptcl, CX.nhl],
    targets: ["ccr4", "card11", "plcg1", "vav1", "irf4", "cd52"], pathways: ["oncogenic-viruses", "inflammation-nfkb"],
    terms: ["lymphoma-bio-ebv-latency"],
    links: [SRC.kataoka2015, SRC.kim2018],
  }),
  term({
    id: "lymphoma-bio-hodgkin-microenvironment", name: "The Hodgkin microenvironment: when the cancer cell is the minority", category: "Biology",
    aka: ["Reed-Sternberg cell", "Hodgkin and Reed-Sternberg cells", "Hodgkin tumour microenvironment", "HRS cells"],
    tldr: "In Hodgkin lymphoma most of the swollen lymph node is not cancer. The cancer cells are scattered giants that make up a small fraction of the tissue; everything else is immune cells the tumour has recruited and put to work.",
    summary: "A classical Hodgkin lymph node under the microscope is mostly lymphocytes, eosinophils, plasma cells, macrophages and fibrous tissue, with occasional very large cells scattered through it. Those giants, the Hodgkin and Reed-Sternberg cells, are the cancer, and for most of the twentieth century it was not clear what they even were: they had lost almost every marker of a B cell.\n\nThe question was settled by picking single cells off a histological section with a micromanipulator and amplifying their immunoglobulin genes. Each of three cases gave a single clonal heavy-chain rearrangement, proving the scattered giants were one clone; somatic mutation patterns placed their origin in the germinal centre in one case and earlier in B-cell development in another (Kuppers 1994).\n\nThe minority status is not a curiosity. It shapes the diagnosis, because a small needle sample can easily miss the diagnostic cells and a Hodgkin diagnosis often needs an excisional biopsy. It shapes the research, because sequencing a whole Hodgkin biopsy mostly measures the infiltrate, which is why the 9p24.1 amplification work needed laser capture and in situ hybridisation rather than bulk sequencing. And the infiltrate itself carries information: in an independent cohort of 166 patients, more CD68-positive macrophages meant shorter progression-free survival, more relapse after autologous transplant and shorter disease-specific survival, outperforming the International Prognostic Score (Steidl 2010).\n\nNone of that is yet a test that changes treatment. What the Hodgkin plan is adapted to is the interim PET scan, not the infiltrate.",
    cancers: [CX.hodgkin],
    targets: ["cd30", "pdl1", "jak2"], pathways: ["tumor-microenvironment", "myeloid-suppression-axis", "antigen-presentation-immunoediting"],
    terms: ["deauville", "lymphoma-bio-ebv-latency"], technologies: ["histopathology-ihc", "pet-adapted-therapy"],
    links: [SRC.kuppers1994, SRC.steidl2010, SRC.kuppers2009],
  }),
  term({
    id: "lymphoma-bio-transformation", name: "Transformation: when a slow lymphoma turns into a fast one", category: "Biology",
    aka: ["Histological transformation", "Transformed follicular lymphoma", "Richter transformation", "Richter syndrome"],
    tldr: "An indolent lymphoma can change into an aggressive one, usually by acquiring new genetic faults in the same clone. It is the commonest reason a person who has been well for years becomes unwell quickly, and it is treated as the aggressive disease rather than the original one.",
    summary: "Transformation is a change in the behaviour of a clone, not the arrival of a second cancer. A follicular lymphoma that has been watched for years can acquire MYC rearrangement, TP53 loss or CDKN2A deletion and start behaving as a diffuse large B-cell lymphoma. Chronic lymphocytic leukaemia can do the same, and that version has its own name, Richter transformation.\n\nThe genetics of Richter transformation were read across 86 pathologically proven cases: TP53 disruption in 47.1% and MYC abnormality in 26.2% were the dominant lesions, while the usual drivers of de novo diffuse large B-cell lymphoma were rare or absent. Whether the large-cell clone is related to the leukaemic clone matters more than any drug does: clonally unrelated cases had median survival of 62.5 months against 14.2 months for related ones, and less TP53 disruption, 23.1% against 60.0% (Rossi 2011).\n\nWhat prompts the suspicion: a single node or site growing much faster than the rest, new B symptoms, a rising LDH, or a PET scan with one area far brighter than the others. What settles it is a biopsy of the brightest area, because the question is answered by tissue and nothing else answers it.\n\nWhat changes: treatment moves to an aggressive-lymphoma regimen, the clonal relationship is worth establishing because it changes the expected course, and a trial is often the right answer in Richter transformation, where outcomes with standard chemoimmunotherapy are poor.",
    cancers: [CX.fl, CX.richter, CX.mzl, CX.wm, CX.nhl],
    targets: ["myc-gene", "tp53", "cdkn2a"], pathways: ["clonal-evolution", "p53-mdm2-axis"],
    terms: ["flipi", "lymphoma-tx-pod24", "deauville"], technologies: ["fdg-pet", "cytogenetics-fish"],
    links: [SRC.rossi2011, SRC.horn2013],
  }),
];

// ======================= NEW BIOMARKER READOUTS =======================
/**
 * Eleven readouts the corpus did not carry. CD19, CD20, CD22, CD30 and CD38 expression, TP53 mutation with del(17p)
 * and ctDNA residual disease already exist (src/data/biomarker-readouts*.ts) and are supplemented rather than
 * duplicated, and so are the glossary terms `cell-of-origin` and `deauville`, which cover the cell-of-origin call
 * and the five-point PET scale: creating a second record for either would be a duplicate concept under a new id,
 * which nothing in the build would catch.
 *
 * None of these carries a `thresholds` row, because none of them is written into a label as a numeric cut-off; each
 * cites the paper that defines it instead. Every `quote` is verbatim from the abstract at the DOI given, read on
 * 29 or 30 September 2026.
 */
const readouts: BiomarkerInput[] = [
  {
    kind: "biomarker", asOf, id: "bcl2-rearrangement", name: "BCL2 rearrangement, t(14;18)",
    aka: ["t(14;18)", "IGH::BCL2", "BCL2 translocation", "BCL2 break-apart FISH", "bcl-2 rearrangement"],
    tldr: "A swap of DNA that puts the survival gene BCL2 next to an antibody gene, so the cell makes far too much of a protein that stops it dying. It is the founding event of most follicular lymphomas and it happens in the bone marrow, often years before anything is wrong.",
    summary: "The t(14;18)(q32;q21) translocation joins BCL2 on chromosome 18 to the immunoglobulin heavy-chain locus on chromosome 14, so the anti-apoptotic protein is driven by the enhancer that should be driving antibody production. Sequencing the junctions showed that the breakpoints sit close to the 5' end of the JH segment, carry extraneous N-region nucleotides and lie beside signal-like sequences on chromosome 18, which identifies the translocation as a mistake by the VDJ recombinase at the pre-B-cell stage rather than a late event in a lymphoma (Tsujimoto 1985).\n\nIt is present in the large majority of follicular lymphomas and in 13.5% of 442 unselected diffuse large B-cell lymphomas in the RICOVER cohort, where BCL2 protein was expressed in 79.6% of tumours, far more often than the gene was rearranged (Horn 2013). A cell carrying the translocation can be found in the blood of healthy people, so the result on its own is not a diagnosis.",
    target: "bcl2", measurement: "fish-ratio",
    scoringRule: { text: "A break at the BCL2 locus on interphase fluorescence in situ hybridisation, reported as rearranged or not rearranged, usually with a break-apart probe; a dual-fusion probe additionally confirms the immunoglobulin partner. The result is read alongside MYC and BCL6, because the combination rather than BCL2 alone defines the high-grade entity.", quote: "Rearrangements of MYC, BCL2, and BCL6 were detected in 8.8%, 13.5%, and 28.7%, respectively.", source: doi("10.1182/blood-2012-06-435842"), sourceLabel: "Horn et al., Blood 2013" },
    thresholds: [], definedBy: SRC.who2022,
    forPatient: "On its own this result helps name the lymphoma rather than choose the treatment. It becomes important when it appears together with a MYC rearrangement, which is a different and more aggressive diagnosis and usually means a stronger regimen.",
    cancers: [CX.fl, CX.dlbcl, CX.nhl], targets: ["bcl2"], related: ["double-hit-rearrangement", "myc-bcl2-double-expressor"],
    pathways: ["apoptosis-bcl2", "germinal-centre-reaction"], terms: ["fish", "cytogenetics", "lymphoma-bio-germinal-centre"],
    technologies: ["cytogenetics-fish", "histopathology-ihc"], drugs: ["venetoclax"],
    links: [SRC.tsujimoto1985, SRC.horn2013], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "double-hit-rearrangement", name: "Double-hit and triple-hit: MYC with BCL2 and BCL6 rearrangement",
    aka: ["Double hit lymphoma", "Triple hit lymphoma", "DHL", "HGBL-DH", "high-grade B-cell lymphoma with MYC and BCL2 rearrangements", "MYC rearrangement FISH"],
    tldr: "A lymphoma that carries a rearrangement of MYC, the gene that drives growth, together with one of BCL2 or BCL6, the genes that stop a cell dying. Having both is far worse than having either, and it usually means a stronger treatment than standard R-CHOP.",
    summary: "MYC was mapped to the chromosome 8 region translocated to chromosome 2, 14 or 22 in Burkitt lymphoma cells in 1982, and the partner is always an immunoglobulin locus (Dalla-Favera 1982). In Burkitt lymphoma MYC is the defining lesion. In large B-cell lymphoma it is a minority event that matters mostly through what accompanies it: in 442 patients treated on the RICOVER study, MYC was rearranged in 8.8%, BCL2 in 13.5% and BCL6 in 28.7%, and MYC translocation predicted worse survival independently of the International Prognostic Index (Horn 2013).\n\nA double hit is MYC plus BCL2; a triple hit adds BCL6. The two lesions are complementary: MYC drives proliferation and would ordinarily trigger apoptosis, and BCL2 removes that safeguard. The WHO fifth edition recognises high-grade B-cell lymphoma with MYC and BCL2 rearrangements as a separate entity rather than a variant of diffuse large B-cell lymphoma (Alaggio 2022).\n\nThe partner matters. A MYC rearrangement to an immunoglobulin partner carries a worse outlook than one to a non-immunoglobulin partner, which is an argument for a dual-fusion probe rather than a break-apart probe alone.",
    target: "myc-gene", measurement: "fish-ratio",
    scoringRule: { text: "Interphase fluorescence in situ hybridisation for MYC, BCL2 and BCL6, reported as rearranged or not for each. Double hit means MYC plus BCL2 rearrangement, triple hit means MYC plus BCL2 plus BCL6. Most laboratories screen on MYC protein expression and run the full panel where it exceeds the local threshold, which will miss a minority of rearranged cases with low protein.", quote: "MYC rearrangements occur in 5% to 10% of diffuse large B-cell lymphomas (DLBCL) and confer an increased risk to cyclophosphamide, hydroxydaunorubicin, oncovin, and prednisone (CHOP) and rituximab (R)-CHOP treated patients.", source: doi("10.1182/blood-2012-06-435842"), sourceLabel: "Horn et al., Blood 2013" },
    thresholds: [], definedBy: SRC.who2022,
    forPatient: "This result usually changes the plan. A double-hit lymphoma is generally treated with a more intensive regimen than R-CHOP and with treatment aimed at protecting the brain and spinal cord, because this type reaches them more often. The evidence for the stronger regimen comes from comparisons between groups of patients rather than from a randomised trial, which is worth knowing when weighing the extra side effects.",
    cancers: [CX.dlbcl, CX.burkitt, CX.nhl], targets: ["myc-gene", "bcl2", "bcl6"], related: ["bcl2-rearrangement", "myc-bcl2-double-expressor"],
    pathways: ["myc", "apoptosis-bcl2", "germinal-centre-reaction"], terms: ["fish", "cytogenetics", "lymphoma-tx-cns-prophylaxis", "lymphoma-bio-germinal-centre"],
    technologies: ["cytogenetics-fish"],
    links: [SRC.dallafavera1982, SRC.horn2013, SRC.who2022], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "myc-bcl2-double-expressor", name: "Double expressor: MYC and BCL2 protein together by immunohistochemistry",
    aka: ["Double expressor lymphoma", "DEL", "MYC and BCL2 co-expression", "MYC IHC", "BCL2 IHC"],
    tldr: "A stain showing that a lymphoma makes a lot of both the growth protein MYC and the survival protein BCL2, without the genes being rearranged. It predicts a worse course, but on its own it does not change the treatment.",
    summary: "Protein co-expression is several times commoner than rearrangement and is not the same thing. In a 167-patient training cohort treated with R-CHOP, MYC protein was detected in 29% and BCL2 protein in 44%, with both together in 21%; MYC protein correlated with high MYC messenger RNA and with MYC translocation, but the translocation was present in only 11%. MYC protein predicted inferior overall and progression-free survival only when BCL2 protein was present as well, and the finding held in an independent cohort of 140 patients after adjustment for other risk factors (Johnson 2012). In the 442-patient RICOVER series, MYC protein above the 40% threshold was found in 31.8% of tumours, BCL2 in 79.6% and BCL6 in 82.8% (Horn 2013).\n\nThe thresholds are not standardised across laboratories, the antibodies differ, and reading is subjective, which is the main reason this remains a prognostic observation rather than a decision point.",
    target: "myc-gene", measurement: "ihc-score",
    scoringRule: { text: "Immunohistochemistry for MYC and BCL2 read as the percentage of tumour nuclei or cytoplasm staining, with commonly used cut-offs of 40% for MYC and 50% for BCL2; a double expressor is positive for both. The thresholds are not harmonised between laboratories and the stains are read by eye, so two centres can call the same block differently.", quote: "MYC protein expression was only associated with inferior overall and progression-free survival when BCL2 protein was coexpressed (P < .001).", source: doi("10.1200/JCO.2011.41.0985"), sourceLabel: "Johnson et al., Journal of Clinical Oncology 2012" },
    thresholds: [], definedBy: SRC.johnson2012,
    forPatient: "This is a prognostic label, not a different disease. It does not by itself mean a stronger regimen, and it is not the same as a double hit, which is found by a different test and does change the plan. It is worth asking which of the two a report means, because the names are easy to confuse.",
    cancers: [CX.dlbcl, CX.nhl], targets: ["myc-gene", "bcl2"], related: ["double-hit-rearrangement", "bcl2-rearrangement"],
    pathways: ["myc", "apoptosis-bcl2"], terms: ["ihc", "cell-of-origin"], technologies: ["histopathology-ihc"],
    links: [SRC.johnson2012, SRC.horn2013], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "cd79b-itam-mutation", name: "CD79B ITAM mutation",
    aka: ["CD79B mutation", "CD79B Y196", "CD79A ITAM mutation", "ITAM mutation"],
    tldr: "A change in the signalling tail of part of the B-cell receptor that leaves the receptor switched on without needing anything to bind it. It marks a group of large B-cell lymphomas that depend on that signal, and therefore on the enzyme BTK.",
    summary: "The B-cell receptor signals through the ITAM motifs of CD79a and CD79b. In activated B-cell-like diffuse large B-cell lymphoma, the receptor signals continuously: the receptors form slow-diffusing clusters in the membrane like those of an antigen-stimulated normal B cell, and knocking down IgM, Ig-kappa, CD79A, CD79B or BTK kills the cell while leaving other lymphomas alone. Somatic mutations of the ITAM modules were detected frequently in activated B-cell-like biopsies, rarely in other diffuse large B-cell lymphomas and never in Burkitt or MALT lymphoma; the mutations raise surface receptor expression and blunt LYN, the kinase that normally damps the signal down (Davis 2010).\n\nCD79B mutation with MYD88 L265P is what names the MCD genetic subtype (Schmitz 2018). CD79b protein itself is expressed on more than 95% of diffuse large B-cell lymphomas regardless of mutation status, which is why polatuzumab vedotin, the anti-CD79b conjugate, is given without a test.",
    target: "cd79b", measurement: "sequencing-variant",
    scoringRule: { text: "Targeted sequencing of the CD79B ITAM region, reported as mutated or wild-type, usually as part of a lymphoma gene panel rather than alone. It is a different question from CD79b protein expression, which is near-universal in large B-cell lymphoma and is not tested before polatuzumab vedotin.", quote: "In 18% of ABC DLBCLs, one functionally critical residue of CD79B, the first ITAM tyrosine, was mutated.", source: doi("10.1038/nature08638"), sourceLabel: "Davis et al., Nature 2010" },
    thresholds: [], definedBy: SRC.schmitz2018,
    forPatient: "This result does not change a licensed treatment today. Together with MYD88 it puts a lymphoma in the group that has shown the most response to BTK inhibitor drugs in research studies, so it may make a trial relevant.",
    cancers: [CX.dlbcl, CX.pcnsl, CX.nhl], targets: ["cd79b", "btk", "myd88"], related: ["myd88-l265p"],
    pathways: ["bcr-signalling", "inflammation-nfkb"], terms: ["lymphoma-bio-lymphgen", "cell-of-origin", "ngs"],
    technologies: ["cgp"], drugs: ["ibrutinib", "polatuzumab-vedotin"],
    links: [SRC.davis2010, SRC.schmitz2018], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "ezh2-y646-mutation", name: "EZH2 gain-of-function mutation (Tyr646, originally Tyr641)",
    aka: ["EZH2 Y646", "EZH2 Y641", "EZH2 mutation", "EZH2 Tyr641", "EZH2-mutant follicular lymphoma"],
    tldr: "A change in an enzyme that puts a chemical silencing mark on DNA. The altered enzyme adds too much of the mark, which keeps a lymphoma cell locked in the state it should have grown out of. It is the one lymphoma mutation that currently selects a tablet.",
    summary: "EZH2 is the catalytic subunit of polycomb repressive complex 2 and writes the H3K27 trimethyl mark. In lymphoma the mutations replace a single tyrosine in the SET domain, Tyr641 in the original numbering and Tyr646 in current usage. They are not simple activating mutations: the altered enzyme is better at converting the di-methyl mark to the tri-methyl mark and worse at making the first methylation, so a cell with one mutant and one wild-type allele accumulates H3K27me3 and holds the germinal-centre programme shut. This is the opposite direction to the loss-of-function EZH2 mutations found in myeloid disease, which is a standing source of confusion in the literature.\n\nThe substitutions occur in 21.7% of germinal-centre diffuse large B-cell lymphomas and 7.2% of follicular lymphomas, and are absent from the activated B-cell-like subtype (Morin 2010). EZH2 mutation with BCL2 translocation defines the EZB genetic subtype (Schmitz 2018).",
    target: "ezh2", measurement: "sequencing-variant",
    scoringRule: { text: "Targeted sequencing of the EZH2 SET domain, reported as mutated or wild-type. Sensitivity matters because the mutation is usually heterozygous and may be subclonal; it is normally reported from a lymphoma gene panel on tissue.", quote: "These mutations, which result in the replacement of a single tyrosine in the SET domain of the EZH2 protein (Tyr641), occur in 21.7% of GCB DLBCLs and 7.2% of FLs and are absent from ABC DLBCLs.", source: doi("10.1038/ng.518"), sourceLabel: "Morin et al., Nature Genetics 2010" },
    thresholds: [], definedBy: SRC.morin2010,
    forPatient: "In relapsed follicular lymphoma this result can open a treatment: tazemetostat, a tablet that blocks the altered enzyme. Response rates are higher in people whose lymphoma carries the mutation than in those whose does not, which is why the test is worth asking about at relapse.",
    cancers: [CX.fl, CX.dlbcl, CX.nhl], targets: ["ezh2", "bcl2"], related: ["bcl2-rearrangement"],
    pathways: ["epigenetic-reprogramming", "germinal-centre-reaction"], terms: ["lymphoma-bio-germinal-centre", "lymphoma-bio-lymphgen", "flipi", "ngs"],
    technologies: ["cgp"], drugs: ["tazemetostat"],
    links: [SRC.morin2010, SRC.schmitz2018], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "btk-c481s", name: "BTK resistance mutations: C481S, and L528W and T474I after the non-covalent inhibitors",
    aka: ["BTK C481S", "BTK Cys481Ser", "BTK L528W", "BTK T474I", "BTK resistance mutation", "ibrutinib resistance mutation"],
    tldr: "A change in the enzyme BTK at the exact point where the drug grips it. The enzyme keeps working and the drug no longer holds, which is the usual reason a BTK inhibitor stops working after it has been working well.",
    summary: "Ibrutinib and its covalent successors bind cysteine 481 of BTK irreversibly. Whole-exome sequencing of paired baseline and relapse samples from six patients with acquired resistance found a cysteine-to-serine substitution at that residue in five of them, and three distinct PLCG2 mutations in two; functional work showed that C481S leaves the protein only reversibly inhibited, and that the PLCG2 changes R665W and L845F are gain-of-function lesions producing autonomous B-cell receptor activity. Neither was found in nine patients with prolonged lymphocytosis who were still responding (Woyach 2014).\n\nThe answer to C481S is a non-covalent inhibitor that does not need the cysteine. Pirtobrutinib produced an overall response of 73.3% in 247 patients who had already received a covalent BTK inhibitor, with median progression-free survival of 19.6 months (Mato 2023). Resistance to that in turn runs through different residues: the kinase-dead L528W substitution was found in 7 of 13 patients progressing on zanubrutinib against 1 of 24 on ibrutinib, and in two patients it was enriched further under pirtobrutinib, which is cross-resistance rather than a new event; both of those patients responded to venetoclax afterwards (Blombery 2022).",
    target: "btk", measurement: "sequencing-variant",
    scoringRule: { text: "Deep targeted sequencing of BTK and PLCG2 on blood or marrow at progression, reported by specific residue rather than as BTK mutated, because the residue decides what works next: C481 substitutions are answered by a non-covalent inhibitor, while L528W and T474I are not. Subclonal variants at low allele fraction can appear months before clinical progression, so the depth of the assay matters.", quote: "We identified a cysteine-to-serine mutation in BTK at the binding site of ibrutinib in five patients and identified three distinct mutations in PLCγ2 in two patients.", source: doi("10.1056/NEJMoa1400029"), sourceLabel: "Woyach et al., New England Journal of Medicine 2014" },
    thresholds: [], definedBy: SRC.woyach2014,
    forPatient: "If a BTK inhibitor has stopped working, this test can say whether a different BTK inhibitor is still worth trying or whether the next treatment needs to work in another way altogether, such as venetoclax, a bispecific antibody or CAR-T. A report that says only BTK mutated has not answered the question; the exact change matters.",
    cancers: [CX.mcl, CX.wm, CX.nhl, CX.mzl], targets: ["btk", "plcg2"], related: ["bcl2-g101v"],
    pathways: ["bcr-signalling", "resistance-routes-map"], terms: ["resistance", "cross-resistance", "ngs"],
    technologies: ["cgp", "liquid-biopsy"], drugs: ["ibrutinib", "acalabrutinib", "zanubrutinib", "pirtobrutinib", "venetoclax"],
    links: [SRC.woyach2014, SRC.blombery2022, SRC.mato2023], tags: ["biomarker", "resistance", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "bcl2-g101v", name: "BCL2 G101V and the other venetoclax binding-site mutations",
    aka: ["BCL2 Gly101Val", "BCL2 G101V", "venetoclax resistance mutation", "BCL2 D103Y"],
    tldr: "A change in the pocket of the survival protein BCL-2 where venetoclax has to fit. The protein still works and the drug no longer binds it. It can be detected in blood months before the disease starts growing again.",
    summary: "Glycine 101 sits in the BH3-binding groove of BCL-2. The valine substitution reduces the affinity of the protein for venetoclax about 180-fold on surface plasmon resonance, so the drug can no longer displace the pro-apoptotic proteins that BCL-2 is holding, while the protein continues to do its job for the cell.\n\nPaired samples from 15 patients progressing on venetoclax in clinical trials showed G101V in seven at progression and in none at study entry. It first became detectable between 19 and 42 months of continuous treatment, and its emergence preceded clinical progression by many months (Blombery 2019). Other substitutions in the same groove have since been described, usually at low allele fraction and often several at once in one patient, which suggests convergent selection rather than a single escape route.",
    target: "bcl2", measurement: "sequencing-variant",
    scoringRule: { text: "Deep targeted sequencing of BCL2 on blood or marrow during or at progression on venetoclax, reported by residue and allele fraction. Standard-depth panels miss these variants, which are typically present in a small subclone when they first appear; serial testing is what makes the result useful, because a rising allele fraction is an early warning rather than a diagnosis of progression.", quote: "The novel Gly101Val mutation in BCL2 was identified at progression in 7 patients, but not at study entry.", source: doi("10.1158/2159-8290.CD-18-1119"), sourceLabel: "Blombery et al., Cancer Discovery 2019" },
    thresholds: [], definedBy: SRC.blombery2019,
    forPatient: "Finding this change explains why venetoclax has stopped working, and it means the next treatment should work by a different mechanism rather than being a higher dose of the same one. Because it can appear before scans or blood counts change, it is a reason for a conversation rather than for immediate treatment.",
    cancers: [CX.nhl, CX.mcl], targets: ["bcl2", "mcl1"], related: ["btk-c481s", "bcl2-rearrangement"],
    pathways: ["apoptosis-bcl2", "resistance-routes-map"], terms: ["resistance", "ngs", "mrd"],
    technologies: ["cgp", "liquid-biopsy"], drugs: ["venetoclax", "sonrotoclax"],
    links: [SRC.blombery2019], tags: ["biomarker", "resistance", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "rhoa-g17v", name: "RHOA G17V",
    aka: ["RHOA G17V", "RHOA Gly17Val", "RHOA mutation", "T-follicular-helper lymphoma mutation"],
    tldr: "A single change in a small signalling protein, found in about two thirds of one kind of T-cell lymphoma. It is useful because it is specific to the tumour cells, while the other mutations in the same disease are also present in normal blood cells.",
    summary: "RHOA is a small GTPase. The G17V substitution produces a protein that does not bind GTP and that also blocks the function of the normal copy, so it acts against the wild-type protein rather than simply being inactive.\n\nIt was reported in 68% of angioimmunoblastic T-cell lymphoma samples, and remarkably every case carrying it also carried a TET2 mutation; the RHOA mutation was found only in the tumour cells, while TET2 mutations were found in tumour and non-tumour haematopoietic cells alike, which places the TET2 lesion earlier, in the stem cell (Sakata-Yanagimoto 2014). An independent series found it in 22 of 35 angioimmunoblastic cases, 67%, and in 8 of 44 cases of peripheral T-cell lymphoma not otherwise specified, 18%, alongside recurrent TET2, DNMT3A and IDH2 mutations and less frequent FYN, ATM, B2M and CD58 lesions (Palomero 2014).\n\nThe ordering matters clinically as well as biologically: this is a lymphoma that grows out of clonal haematopoiesis, which is part of why it occurs in older people and why hypomethylating agents have activity in it.",
    target: "rhoa", measurement: "sequencing-variant",
    scoringRule: { text: "Targeted sequencing of RHOA codon 17 on tissue, reported as mutated or wild-type, usually within a T-cell lymphoma panel alongside TET2, DNMT3A and IDH2. Sensitivity matters because the tumour cells are often a minority of an angioimmunoblastic node, which is full of reactive B cells, plasma cells and vessels.", quote: "Here we report somatic RHOA mutations encoding a p.Gly17Val alteration in 68% of AITL samples.", source: doi("10.1038/ng.2872"), sourceLabel: "Sakata-Yanagimoto et al., Nature Genetics 2014" },
    thresholds: [], definedBy: SRC.palomero2014,
    forPatient: "This result supports the diagnosis when the biopsy is difficult to read, which it often is in this lymphoma. It does not yet select a licensed drug, although the related mutations in the same disease are the reason hypomethylating treatments are used and studied in it.",
    cancers: [CX.aitl, CX.ptcl, CX.nhl], targets: ["rhoa", "tet2", "dnmt3a", "fyn"],
    pathways: ["epigenetic-reprogramming", "clonal-haematopoiesis"], terms: ["ngs", "driver-mutation", "clonal-evolution-theory"],
    technologies: ["cgp"], drugs: ["azacitidine", "romidepsin"],
    links: [SRC.sakata2014, SRC.palomero2014], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "pd-ligand-9p24-alteration", name: "9p24.1 alteration of the PD-1 ligand loci",
    aka: ["9p24.1 amplification", "CD274 amplification", "PDCD1LG2 amplification", "PD-1 ligand copy gain", "9p24.1 copy gain"],
    tldr: "An extra stretch of chromosome 9 that carries both of the molecules a tumour uses to switch off T cells, plus the enzyme that turns them up further. Nearly every classical Hodgkin lymphoma has it, which is why checkpoint drugs work so well there and so poorly in most other lymphomas.",
    summary: "The 9p24.1 amplicon contains CD274 and PDCD1LG2, the genes for the two PD-1 ligands, and JAK2. Amplifying it raises the ligands twice over, by gene dose and by JAK2-driven transcription, and JAK2 amplification also increases sensitivity to JAK2 inhibition in the laboratory. The alteration is disease-specific: it is restricted to nodular sclerosing Hodgkin lymphoma, the subtype most closely related to mediastinal large B-cell lymphoma, and to mediastinal large B-cell lymphoma itself (Green 2010).\n\nIn 108 newly diagnosed classical Hodgkin lymphomas evaluated by fluorescence in situ hybridisation, 97% had concordant alterations of both loci: polysomy in 5 of 108, copy gain in 61 of 108 and amplification in 39 of 108, and higher-level gain predicted shorter progression-free survival (Roemer 2016). Alongside it, recurrent CIITA fusions, found in 38% of primary mediastinal B-cell lymphomas and 15% of classical Hodgkin lymphomas across 263 B-cell lymphomas, lower MHC class II on the tumour cell and place the ligands under new promoters (Steidl 2011).\n\nThis is the clearest genetic explanation in oncology for why one disease answers checkpoint blockade: PD-1 blockade gave an objective response in 20 of 23 heavily pre-treated Hodgkin patients, 87%, most of whom had already failed both autologous transplant and brentuximab vedotin (Ansell 2015). What predicts complete remission within that group is not MHC class I but MHC class II expression on the Hodgkin and Reed-Sternberg cells, which suggests the effector is a CD4 T cell (Roemer 2018).",
    noParentReason: "9p24.1 is an amplicon rather than a gene: one copy-number event raises CD274, PDCD1LG2 and JAK2 together, and the result is reported as a change at the locus rather than as a result for any one of them. The protein-level PD-L1 scores that do have a single parent gene are the separate CPS, TPS, IC and TC readouts.",
    measurement: "copy-number",
    scoringRule: { text: "Fluorescence in situ hybridisation on the tumour cells with probes for the 9p24.1 locus and a chromosome 9 centromere control, graded as polysomy, copy gain or amplification by the ratio. It is done on the malignant cells specifically, because in Hodgkin lymphoma they are a small minority of the tissue and a bulk assay would measure the infiltrate instead.", quote: "Ninety-seven percent of all evaluated cHLs had concordant alterations of the PD-L1 and PD-L2 loci (polysomy, 5% [five of 108]; copy gain, 56% [61 of 108]; amplification, 36% [39 of 108]).", source: doi("10.1200/JCO.2016.66.4482"), sourceLabel: "Roemer et al., Journal of Clinical Oncology 2016" },
    thresholds: [], definedBy: SRC.roemer2016,
    forPatient: "Nobody is tested for this before being given a checkpoint drug for Hodgkin lymphoma, because almost every case has it. It is the reason these drugs work in Hodgkin lymphoma when they do very little in most other lymphomas, and that is worth knowing when comparing treatments between diseases.",
    cancers: [CX.hodgkin, CX.pmbcl], targets: ["jak2", "ciita"], related: [],
    pathways: ["pd1-checkpoint", "jak-stat", "antigen-presentation-immunoediting"], terms: ["lymphoma-bio-hodgkin-microenvironment", "gene-amplification", "fish"],
    technologies: ["cytogenetics-fish", "checkpoint-inhibitor"], drugs: ["nivolumab", "pembrolizumab"],
    links: [SRC.green2010, SRC.roemer2016, SRC.roemer2018, SRC.ansell2015], tags: ["biomarker", "lymphoma"],
  },
  {
    kind: "biomarker", asOf, id: "ig-tcr-clonality", name: "Immunoglobulin and T-cell receptor clonality",
    aka: ["IGH clonality", "TCR clonality", "clonal rearrangement", "gene rearrangement study", "B-cell clonality", "T-cell clonality", "BIOMED-2"],
    tldr: "A test that asks whether a group of lymphocytes all descend from one cell. Cancer is one family; a normal immune response is a crowd. It is used when the appearance under the microscope does not settle the question.",
    summary: "Every lymphocyte rearranges its antigen receptor genes into a sequence unique to itself, so a lymphoma made of one clone gives amplicons of one length and sequence while a reactive population gives a smooth spread.\n\nThe European BIOMED-2 collaboration standardised the assay into 107 primers in 18 multiplex tubes covering IGH in two configurations, IGK, IGL, TCRB, TCRG and TCRD plus the BCL1-IGH and BCL2-IGH translocations, with products read by heteroduplex analysis or fragment sizing. The complementarity of the tubes is what makes the detection rate high: combined IGH and IGK tubes detect virtually all clonal B-cell proliferations even where somatic hypermutation is heavy, and combined TCRB and TCRG tubes detect virtually all clonal T-cell populations (van Dongen 2003). The EuroClonality-NGS successor sequences the amplicons rather than sizing them and produces a patient-specific sequence that can be followed afterwards as a residual disease marker.\n\nThe result is a pattern, not a diagnosis, and the commonest harm this test does is being read as one.",
    noParentReason: "The readout is a pattern across the immunoglobulin and T-cell receptor loci rather than a result for one gene or protein: the question is whether the population is monoclonal, and no single parent gene answers it.",
    measurement: "sequencing-variant",
    scoringRule: { text: "Multiplex PCR, or targeted sequencing, across the V, D and J segments, reported as clonal, polyclonal or oligoclonal, with the loci tested named. A clonal result should be read with the morphology and immunophenotype and never alone: clonal populations occur in reactive, autoimmune and age-related conditions, and a polyclonal result does not exclude a lymphoma in which the malignant cells are a small minority.", quote: "In particular, combined application of IGH (VH-JH and DH-JH) and IGK tubes can detect virtually all clonal B-cell proliferations, even in B-cell malignancies with high levels of somatic mutations.", source: doi("10.1038/sj.leu.2403202"), sourceLabel: "van Dongen et al., Leukemia 2003" },
    thresholds: [], definedBy: SRC.vandongen2003,
    forPatient: "A clonal result is a piece of evidence, not a verdict. It is most useful when a biopsy is small or the appearance is borderline, and it is read together with everything else. A report that says clonal does not by itself mean cancer.",
    cancers: [CX.nhl, CX.ctcl, CX.sezary, CX.malt, CX.ptcl, CX.fl], targets: [],
    pathways: ["clonal-evolution"], terms: ["ngs", "mrd", "lymphoma-bio-germinal-centre"],
    technologies: ["clonality-testing", "ngs-mrd-clonoseq", "flow-cytometry-mrd"],
    links: [SRC.vandongen2003], tags: ["biomarker", "lymphoma"],
  },
];

// ======================= SUPPLEMENTS =======================
/** Target supplements built from the antigen table: the lymphoma note, the diseases, and what the lineage costs. */
const antigenSupplements: SpikeSupplement[] = lymphomaAntigens.map((a) => sup<TargetInput>({
  id: a.targetId,
  cancers: [CX.nhl],
  notes: [`Lymphoma: ${a.carriedBy} Also on healthy cells: ${a.alsoOnHealthyCells} What the medicine does: ${a.whatTheDrugDoes} How tumours lose it: ${a.howTumoursLoseIt} What that costs the patient: ${a.costToPatient}`],
  links: a.sources,
}));

/** Target supplements from the lesion table: pathway links and the cancers each lesion defines. */
const lesionSupplements: SpikeSupplement[] = (() => {
  const byTarget = new Map<string, LymphomaLesionRow[]>();
  for (const r of lymphomaLesions) for (const t of r.targetIds) byTarget.set(t, [...(byTarget.get(t) ?? []), r]);
  return [...byTarget.entries()].map(([targetId, rows]) => sup<TargetInput>({
    id: targetId,
    cancers: [CX.nhl],
    pathways: [...new Set(rows.flatMap((r) => r.pathwayIds))],
    notes: rows.map((r) => `Lymphoma, ${r.lesion}: ${r.mechanism} Frequency: ${r.frequency} What it changes about treatment: ${r.changesTreatment}`),
    links: [...new Map(rows.flatMap((r) => r.sources).map((s) => [s.url, s] as const)).values()],
  }));
})();

const otherSupplements: SpikeSupplement[] = [
  // The surface-antigen readouts the corpus already holds: give each the lymphoma reading.
  sup<BiomarkerInput>({ id: "cd19-expression", cancers: [CX.dlbcl, CX.fl, CX.mcl, CX.nhl], terms: ["lymphoma-bio-antigen-escape", "lymphoma-bio-lineage-antigen-cost"],
    notes: ["Lymphoma: CD19 is not tested before a CD19-directed treatment, because expression is close to universal in B-cell lymphoma; the reason to measure it is after treatment, not before. Relapse with loss of the CD19 epitope follows 10 to 20% of paediatric responses to CD19 CAR-T in B-cell acute lymphoblastic leukaemia, through deletion of the locus, exon 2 mutation, or selection for an alternatively spliced transcript that skips exon 2 and makes a protein the CAR cannot see (Sotillo 2015). Target evasion is also documented after axicabtagene ciloleucel in large B-cell lymphoma (Plaks 2021), but the published lymphoma series are small and the reported shares do not agree, so OnCo holds no figure for it. The cost of hitting the antigen is B-cell aplasia and low immunoglobulin, deeper and longer after CAR-T than after an antibody."],
    links: [SRC.sotillo2015, SRC.plaks2021] }),
  sup<BiomarkerInput>({ id: "cd20-expression", cancers: [CX.dlbcl, CX.fl, CX.mcl, CX.mzl, CX.nhl], terms: ["lymphoma-bio-antigen-escape", "lymphoma-bio-lineage-antigen-cost"],
    notes: ["Lymphoma: the stain is part of every diagnostic panel and is not repeated before each dose of rituximab, which is why loss at relapse is under-measured. Of 124 patients treated with rituximab-containing chemotherapy, 36 relapsed or progressed, 19 were rebiopsied and 5 of those, 26.3%, had become CD20-negative, with lower CD20 messenger RNA in the negative cells than in the positive cells from the same patient; all five died within a year (Hiraga 2009). The practical rule is to rebiopsy and restain before giving another CD20-directed drug. CD20 is not internalised, so it carries naked antibodies and T-cell engagers but no antibody-drug conjugate."],
    links: [SRC.hiraga2009] }),
  sup<BiomarkerInput>({ id: "cd22-expression", cancers: [CX.nhl, CX.dlbcl], notes: ["Lymphoma: CD22 is expressed on most B-cell non-Hodgkin lymphomas and recycles rapidly between the surface and the endosome, which suits conjugate delivery, but the licensed conjugate is in acute lymphoblastic leukaemia rather than in lymphoma. In lymphoma its main use is as a second address after CD19-directed treatment has failed, and the limiting factor is surface density rather than presence."] }),
  sup<BiomarkerInput>({ id: "cd30-expression", cancers: [CX.hodgkin, CX.ptcl, CX.pmbcl, CX.ctcl, CX.nhl], terms: ["lymphoma-bio-hodgkin-microenvironment", "lymphoma-bio-lineage-antigen-cost"],
    notes: ["Lymphoma: CD30 is the closest thing in lymphoma to an antigen restricted to the tumour, because resting lymphocytes do not carry it and only activated T and B cells and monocytes do. That is why brentuximab vedotin does not empty a normal compartment the way anti-CD20 does, and why its dose-limiting toxicity is the auristatin payload, as cumulative peripheral neuropathy, rather than the antigen. In classical Hodgkin lymphoma essentially every Reed-Sternberg cell carries it, which is remarkable given that those cells make up a small minority of the tissue (Kuppers 2009)."],
    links: [SRC.kuppers2009] }),
  sup<BiomarkerInput>({ id: "cd38-expression", cancers: [CX.nhl, CX.ptcl], notes: ["Lymphoma: there is no approved anti-CD38 indication in lymphoma. CD38 is expressed on a minority of T-cell and NK-cell lymphomas and on plasmablastic tumours, and the evidence there is case series and small trials rather than randomised data. The result that matters in practice is a laboratory one: an anti-CD38 antibody binds CD38 on red cells and makes the indirect antiglobulin test positive, masking genuine alloantibodies, so the transfusion laboratory must be told before a crossmatch."] }),
  sup<BiomarkerInput>({ id: "tp53-del17p", cancers: [CX.mcl, CX.richter, CX.dlbcl, CX.nhl], related: ["cyclin-d1-t11-14"],
    notes: ["Lymphoma: in mantle cell lymphoma this is the single result that most changes the plan, even though no label depends on it. Among 183 younger patients treated on the Nordic MCL2 and MCL3 protocols, TP53 mutation was present in 11% and TP53 deletion in 16%; only mutation kept its weight in multivariable analysis, with a hazard ratio of 6.2 for overall survival, median overall survival of 1.8 years against 12.7 years, and half of the mutated group relapsing within a year, with worse responses to both induction and high-dose chemotherapy (Eskelund 2017). In Richter transformation of chronic lymphocytic leukaemia, TP53 disruption was present in 47.1% of 86 cases and was the main prognostic variable (Rossi 2011). Mutation and deletion are not interchangeable: an immunohistochemical p53 stain approximates missense mutation and misses truncating ones, and FISH for del(17p) misses mutation without deletion, so sequencing is the complete test."],
    links: [SRC.eskelund2017, SRC.rossi2011] }),
  sup<BiomarkerInput>({ id: "ctdna-mrd-positive", cancers: [CX.dlbcl, CX.nhl, CX.hodgkin], technologies: ["ctdna-lymphoma-monitoring"],
    notes: ["Lymphoma: plasma sequencing does three different jobs here. It genotypes, including the cell-of-origin call, directly from blood; it measures burden at diagnosis, which correlated with clinical indices and independently predicted outcome across 92 lymphoma patients profiled by CAPP-Seq (Scherer 2016); and it measures residual disease, where PhasED-seq, which uses several somatic mutations carried on the same DNA fragment, reaches the parts-per-million range and found residual disease in a further 25% of participants who were negative by the earlier method after two cycles, and those participants did worse (Kurtz 2021). What is missing is a decision: no lymphoma approval depends on a ctDNA result and no randomised trial has yet changed treatment on one."],
    links: [SRC.scherer2016, SRC.kurtz2021] }),

  // Glossary terms the corpus already holds, deepened rather than duplicated.
  sup<TermInput>({ id: "cell-of-origin", cancers: [CX.dlbcl, CX.nhl, CX.pcnsl], terms: ["lymphoma-bio-cell-of-origin-in-practice", "lymphoma-bio-lymphgen"], targets: ["cd79b", "myd88", "crebbp"],
    notes: ["How it is called, and what it is worth. The reference method is gene expression profiling; what most laboratories report is the Hans algorithm, three stains read in order, CD10 then BCL6 then MUM1. On 152 cases with a microarray comparison, Hans called 42% germinal-centre and 58% non-germinal-centre, with five-year overall survival of 76% against 34% (Hans 2004). Because immunohistochemistry cannot separate the activated type from the unclassified type, a careful report says germinal-centre or non-germinal-centre. The split was first found by microarray (Alizadeh 2000) and confirmed on 240 patients, where BCL2 translocation and c-REL amplification occurred only in the germinal-centre group (Rosenwald 2002). What it changes today is small and should be said plainly: it is prognostic, it decides trial eligibility, and no licensed regimen is chosen by it."],
    links: [SRC.hans2004, SRC.alizadeh2000, SRC.rosenwald2002] }),
  sup<TermInput>({ id: "deauville", cancers: [CX.nhl, CX.fl, CX.mcl, CX.pmbcl], technologies: ["pet-adapted-therapy", "fdg-pet"],
    notes: ["What the scale cannot do. A score of 3, uptake above the mediastinum but at or below the liver, is deliberately ambiguous: in a de-escalation trial it is usually treated as a good response and in an escalation trial as an inadequate one, so the same scan leads to opposite decisions depending on the protocol, and a patient told their score is 3 has been told less than they think. Inflammation, infection, granulomatous disease, brown fat and recent growth-factor support all take up the tracer. Indolent lymphomas are variably avid, so the scale is least useful where disease is most likely to be left behind. The Lugano classification, which incorporated PET-CT formally into staging for avid lymphomas, also removed the routine staging bone marrow biopsy for Hodgkin lymphoma and most diffuse large B-cell lymphoma (Cheson 2014, Barrington 2014)."],
    links: [SRC.cheson2014, SRC.barrington2014] }),
  sup<TermInput>({ id: "myd88-l265p", cancers: [CX.malt, CX.nhl], targets: ["myd88", "btk", "cd79b"], pathways: ["inflammation-nfkb", "bcr-signalling"], terms: ["lymphoma-bio-lymphgen"],
    notes: ["The mechanism, and the primary figures. MYD88 is the adaptor of the toll-like and interleukin-1 receptors, and L265P sits at an evolutionarily invariant residue in the hydrophobic core of its TIR domain. The mutant assembles a signalling complex with IRAK1 and IRAK4 without any receptor signal, driving NF-kB and JAK kinase activity; activated B-cell-like lymphoma cells carrying it die when MYD88, IRAK1 or IRAK4 are knocked down, and the wild-type protein cannot rescue them, which is what makes it a gain-of-function driver rather than a passenger. The original series found it in 29% of activated B-cell-like diffuse large B-cell lymphomas, rarely or not at all in other subtypes and in Burkitt lymphoma, and in 9% of MALT lymphomas (Ngo 2011). In Waldenstrom macroglobulinaemia, whole-genome sequencing found it in all 10 patients with paired normal tissue, and Sanger sequencing in 49 of 54 patients and in 91% of all lymphoplasmacytic lymphoma including the non-IgM form, absent from paired normal tissue and from healthy donor B cells (Treon 2012). With CD79B mutation it defines the MCD genetic subtype of large B-cell lymphoma (Schmitz 2018)."],
    links: [SRC.ngo2011, SRC.treon2012, SRC.schmitz2018] }),
  sup<TermInput>({ id: "cyclin-d1-t11-14", cancers: [CX.mcl, CX.nhl], targets: ["ccnd1", "atm", "tp53", "notch2"], pathways: ["cell-cycle-engine-cdks"],
    notes: ["Mantle cell lymphoma: the translocation is the first hit and everything else is secondary. The t(11;14)(q13;q32) involving cyclin D1 is considered the first oncogenic hit found in virtually all mantle cell lymphomas, and SOX11 is overexpressed in the majority of conventional cases including the cyclin D1-negative ones but absent from the indolent leukaemic non-nodal form (Bea and Amador 2017). What makes a case aggressive is what it acquired afterwards: whole-genome or whole-exome sequencing of 29 cases with targeted validation in 172 more identified 25 significantly mutated genes, among them ATM, CCND1 itself, TP53, BIRC3, TLR2, WHSC1, KMT2D and MEF2B, with NOTCH2 mutations appearing as an alternative to NOTCH1 in the most aggressive tumours, and subclonal heterogeneity present at diagnosis between different sites in the same patient (Bea 2013). The prognostic weight sits with TP53 rather than with the translocation: in 183 younger patients, TP53 mutation carried a hazard ratio of 6.2 for overall survival and a median overall survival of 1.8 years against 12.7 years (Eskelund 2017)."],
    links: [SRC.beaAmador2017, SRC.bea2013, SRC.eskelund2017] }),
  sup<TermInput>({ id: "btki-bcl2i-resistance-mutations", cancers: [CX.mcl, CX.nhl, CX.wm], targets: ["btk", "plcg2", "bcl2"], pathways: ["resistance-routes-map", "bcr-signalling", "apoptosis-bcl2"],
    notes: ["The figures, from the papers that first reported each mutation. BTK C481S: whole-exome sequencing of paired baseline and relapse samples from six patients with acquired ibrutinib resistance found the cysteine-to-serine substitution in five of them and three distinct PLCG2 mutations in two, and neither was present in nine patients with prolonged lymphocytosis who were still responding (Woyach 2014). The non-covalent answer: pirtobrutinib gave an overall response of 73.3% in 247 patients who had already received a covalent BTK inhibitor, with median progression-free survival of 19.6 months (Mato 2023). Its own escape route is partly inhibitor-specific: the kinase-dead BTK L528W substitution was enriched in patients progressing on zanubrutinib, 7 of 13 against 1 of 24 on ibrutinib, and was enriched further under pirtobrutinib in two patients, who then responded to venetoclax (Blombery 2022). BCL2 G101V: found at progression in 7 of 15 paired patients and in none at study entry, first detectable 19 to 42 months into continuous venetoclax and anticipating clinical progression by many months, reducing BCL-2 affinity for venetoclax about 180-fold on surface plasmon resonance (Blombery 2019)."],
    links: [SRC.woyach2014, SRC.mato2023, SRC.blombery2022, SRC.blombery2019] }),
  sup<TermInput>({ id: "double-hit-lymphoma", cancers: [CX.dlbcl, CX.burkitt, CX.nhl], targets: ["myc-gene", "bcl2", "bcl6"], pathways: ["myc", "apoptosis-bcl2"],
    notes: ["The rates, and the difference between rearrangement and expression. In 442 unselected diffuse large B-cell lymphomas treated on the RICOVER study and read by both FISH and immunohistochemistry, MYC was rearranged in 8.8%, BCL2 in 13.5% and BCL6 in 28.7%, while MYC protein above the 40% threshold was present in 31.8%, BCL2 protein in 79.6% and BCL6 protein in 82.8% (Horn 2013). Protein co-expression is therefore several times commoner than rearrangement and is a different finding: in a 167-patient cohort, MYC protein was detected in 29% and BCL2 in 44% with both in 21%, against a MYC translocation in 11%, and MYC protein predicted worse survival only where BCL2 protein was present too (Johnson 2012). MYC was mapped to the translocated region of chromosome 8 in Burkitt lymphoma in 1982 and the partner is always an immunoglobulin locus (Dalla-Favera 1982); the WHO fifth edition makes high-grade B-cell lymphoma with MYC and BCL2 rearrangements an entity of its own (Alaggio 2022)."],
    links: [SRC.horn2013, SRC.johnson2012, SRC.dallafavera1982, SRC.who2022] }),
  sup<TermInput>({ id: "deauville-score", cancers: [CX.nhl, CX.hodgkin], technologies: ["pet-adapted-therapy", "fdg-pet"],
    notes: ["What the scale cannot settle. A score of 3, uptake above the mediastinal blood pool but at or below the liver, is deliberately ambiguous and is treated as an adequate response in de-escalation trials and an inadequate one in escalation trials, so the same scan can lead to opposite decisions depending on the protocol. Inflammation, infection, granulomatous disease, brown fat and recent growth-factor support all take up the tracer, and indolent lymphomas are variably avid. The Lugano classification, which built PET-CT into staging for avid lymphomas, also removed the routine staging bone marrow biopsy for Hodgkin lymphoma and most diffuse large B-cell lymphoma (Cheson 2014, Barrington 2014)."],
    links: [SRC.cheson2014, SRC.barrington2014] }),
  sup<TermInput>({ id: "plasma-ebv-dna", cancers: [CX.hodgkin, CX.ptcl, CX.nhl], terms: ["lymphoma-bio-ebv-latency"],
    notes: ["Lymphoma: what a plasma EBV DNA level means depends on which latency programme the tumour is running, because that decides how much viral DNA is shed and how visible the cell is to T cells. It is used to follow response in extranodal NK/T-cell lymphoma and in post-transplant lymphoproliferative disorder, where reducing immunosuppression is the first treatment (Young and Rickinson 2004)."],
    links: [SRC.young2004] }),
  sup<TermInput>({ id: "flipi", cancers: [CX.fl], targets: ["ezh2", "crebbp", "ep300"], terms: ["lymphoma-bio-germinal-centre"],
    notes: ["The molecular layer under the score. The seven genes in m7-FLIPI are not an arbitrary panel: EZH2, CREBBP and EP300 are the chromatin machinery of the germinal centre reaction, and their mutations are the reason a follicular lymphoma cannot complete it. EZH2 Tyr641 substitutions occur in 7.2% of follicular lymphomas and are gain-of-function rather than loss, which is what makes tazemetostat work (Morin 2010); CREBBP or EP300 inactivation is present in about 41% (Pasqualucci 2011); KMT2D is mutated in 89% of cases in the discovery series (Morin 2011). An EZH2 mutation in m7-FLIPI counts towards a lower-risk score and, separately, opens a treatment at relapse, which is a confusing pair of facts worth separating for a patient."],
    links: [SRC.morin2010, SRC.pasqualucci2011, SRC.morin2011] }),

  // Technologies: the lymphoma reading of each.
  sup<TechnologyInput>({ id: "histopathology-ihc", cancers: [CX.nhl, CX.hodgkin, CX.dlbcl],
    notes: ["Lymphoma: more of this diagnosis rests on a stain than in any solid tumour. A B-cell panel runs CD20, CD79a, PAX5, CD10, BCL6, MUM1, BCL2, MYC, cyclin D1, SOX11 and Ki-67; a T-cell panel runs CD2, CD3, CD4, CD5, CD7, CD8, CD30, ALK, PD-1, CXCL13 and ICOS; a Hodgkin panel runs CD30, CD15, PAX5, CD20 and EBER. The Hans algorithm, three of those stains read in a fixed order, is how cell of origin is reported in most laboratories (Hans 2004). Two failure modes recur: a core needle sample gives cells but not architecture, which is the commonest reason a lymphoma diagnosis has to be repeated, and in classical Hodgkin lymphoma the malignant cells are a small minority of the tissue, so a small sample can miss them altogether (Kuppers 2009)."],
    links: [SRC.hans2004, SRC.kuppers2009] }),
  sup<TechnologyInput>({ id: "cytogenetics-fish", cancers: [CX.dlbcl, CX.fl, CX.mcl, CX.malt, CX.burkitt, CX.hodgkin, CX.nhl],
    notes: ["Lymphoma: FISH answers four questions that nothing else answers as cheaply. Is there a MYC rearrangement, and with BCL2 or BCL6 alongside it, which makes this a different WHO entity: in 442 unselected diffuse large B-cell lymphomas the rates were 8.8%, 13.5% and 28.7% (Horn 2013). Is there a t(11;14), which confirms mantle cell lymphoma (Bea and Amador 2017). Is there a t(11;18) in a gastric MALT lymphoma, which predicts that Helicobacter eradication will not work: 47 of the 48 patients who regressed completely after antibiotics were negative for the API2-MALT1 transcript (Liu 2002). And is the 9p24.1 locus gained in a Hodgkin or mediastinal lymphoma, which was found in 97% of 108 classical Hodgkin lymphomas (Roemer 2016). A break-apart probe says a locus is broken, not what it is joined to, which matters for MYC."],
    links: [SRC.horn2013, SRC.liu2002, SRC.roemer2016, SRC.beaAmador2017] }),
  sup<TechnologyInput>({ id: "flow-cytometry-mrd", cancers: [CX.nhl, CX.ctcl, CX.sezary, CX.mcl],
    notes: ["Lymphoma: flow gives an immunophenotype in hours on blood, marrow, cerebrospinal fluid, effusion or a fine-needle aspirate, and light-chain restriction is fast evidence of a clonal B-cell population. It is how circulating Sezary cells are counted and how marrow involvement is measured. It needs cells in suspension, so it cannot read a paraffin block, it reads a sclerotic node badly, it gives no architecture, and it under-detects classical Hodgkin lymphoma, where the malignant cells are rare and fragile."] }),
  sup<TechnologyInput>({ id: "ngs-mrd-clonoseq", cancers: [CX.nhl, CX.dlbcl, CX.mcl], technologies: ["clonality-testing"],
    notes: ["Lymphoma: the patient-specific immunoglobulin or T-cell receptor sequence found at diagnosis becomes the residual disease marker afterwards, which is why clonality testing and residual disease testing are the same assay read twice. The BIOMED-2 primer design is the ancestor of the sequencing versions (van Dongen 2003)."],
    links: [SRC.vandongen2003] }),
  sup<TechnologyInput>({ id: "ctdna-lymphoma-monitoring", cancers: [CX.dlbcl, CX.nhl, CX.hodgkin],
    notes: ["Lymphoma: the three jobs are genotyping, burden and residual disease. CAPP-Seq on 92 patients classified cell of origin from plasma and showed that ctDNA burden at diagnosis predicted outcome independently of clinical indices (Scherer 2016). PhasED-seq exploits the fact that lymphoma genomes carry many mutations close together, a consequence of somatic hypermutation, so several variants can be phased onto one DNA fragment; that pushes detection into the parts-per-million range and found residual disease in a further 25% of participants called negative by the earlier method after two cycles, who then did worse (Kurtz 2021). No approval depends on the result and no randomised trial has yet acted on it."],
    links: [SRC.scherer2016, SRC.kurtz2021] }),
  sup<TechnologyInput>({ id: "pet-adapted-therapy", cancers: [CX.hodgkin, CX.dlbcl, CX.nhl],
    notes: ["Lymphoma: this is the disease group where response, rather than a molecular marker, directs treatment. The five-point scale compares the brightest site with the mediastinal blood pool and the liver, and the Lugano classification built it into formal response assessment and dropped the routine staging marrow biopsy for Hodgkin lymphoma and most diffuse large B-cell lymphoma (Cheson 2014, Barrington 2014). The ambiguity sits at score 3, which is read as adequate in de-escalation trials and inadequate in escalation trials."],
    links: [SRC.cheson2014, SRC.barrington2014] }),
  sup<TechnologyInput>({ id: "car-t", cancers: [CX.dlbcl, CX.fl, CX.mcl, CX.nhl], terms: ["lymphoma-bio-antigen-escape", "lymphoma-bio-lineage-antigen-cost"],
    notes: ["Lymphoma: failure comes in two shapes and they need different answers. Relapse without the antigen, through deletion, exon 2 mutation or selection for a spliced transcript the receptor cannot see (Sotillo 2015), is answered by changing the address. Relapse with the antigen still there is usually about the cells: single-cell sequencing of 24 axicabtagene ciloleucel products found three times the frequency of memory-signature CD8 T cells in patients who reached complete response at three months, and an exhaustion signature that tracked a poor molecular response at day 7 (Deng 2020). Collecting T cells earlier in the disease course, allogeneic and in vivo products, and armoured constructs are the responses to the second."],
    links: [SRC.sotillo2015, SRC.deng2020] }),
  sup<TechnologyInput>({ id: "bispecific-antibody", cancers: [CX.dlbcl, CX.fl, CX.nhl], targets: ["cd3", "cd20"],
    notes: ["Lymphoma: the CD20 by CD3 bispecifics are the clearest working example of the format. CD3 is not a tumour antigen at all; it is the handle the antibody uses to grip a T cell so that the other arm can hold the tumour, which bypasses the loss of antigen presentation that defeats a checkpoint inhibitor. The price is built into the mechanism: cytokine release syndrome and neurotoxicity are the synapse working, which is why step-up dosing exists."] }),
  sup<TechnologyInput>({ id: "t-cell-engager", cancers: [CX.dlbcl, CX.fl, CX.nhl], targets: ["cd3"],
    notes: ["Lymphoma: an engager needs both a target on the tumour and a working T cell in the node, so it is exposed to antigen loss and to T-cell exhaustion at once. That is the argument for using it while the T-cell compartment is still intact rather than after several lines of treatment."] }),
  sup<TechnologyInput>({ id: "checkpoint-inhibitor", cancers: [CX.hodgkin, CX.pmbcl, CX.nhl],
    notes: ["Lymphoma: the contrast between Hodgkin lymphoma and everything else is genetic rather than mysterious. The 9p24.1 amplicon carries both PD-1 ligand genes and JAK2, which induces them further, so one copy-number event raises the brake twice over; 97% of 108 classical Hodgkin lymphomas carried concordant alterations of the two loci (Green 2010, Roemer 2016). PD-1 blockade gave an objective response in 20 of 23 heavily pre-treated Hodgkin patients (Ansell 2015). In B-cell non-Hodgkin lymphoma outside the mediastinal group, single-agent checkpoint blockade does very little. Within the responsive group, what predicts complete remission is expression of MHC class II rather than class I on the Hodgkin and Reed-Sternberg cells, which points to a CD4 T cell as the effector (Roemer 2018)."],
    links: [SRC.green2010, SRC.roemer2016, SRC.ansell2015, SRC.roemer2018] }),
  sup<TechnologyInput>({ id: "monoclonal-antibody", cancers: [CX.nhl, CX.dlbcl, CX.fl], terms: ["lymphoma-bio-lineage-antigen-cost"],
    notes: ["Lymphoma: rituximab is the proof of the format and also the clearest illustration of its cost. CD20 is on every normal B cell, so the treatment empties the B-cell compartment, and what follows is low immunoglobulin, more infection, a blunted vaccine response and, specifically, hepatitis B reactivation, which is why surface antigen and core antibody are checked before the first dose. Because CD20 is not internalised, the antibody has to kill from outside, through complement and effector cells, so the format carries no payload."] }),
  sup<TechnologyInput>({ id: "adc", cancers: [CX.dlbcl, CX.hodgkin, CX.nhl], targets: ["cd79b", "cd30", "cd22"],
    notes: ["Lymphoma: which antigen can carry a payload is decided by whether it internalises. CD79b is part of a receptor complex that is continuously taken into the cell, and CD30 and CD22 also internalise, so all three carry conjugates; CD20 does not internalise and carries none. The dose-limiting toxicity of the auristatin conjugates used here, polatuzumab vedotin and brentuximab vedotin, is cumulative peripheral neuropathy from the payload rather than anything to do with the antigen."] }),
  sup<TechnologyInput>({ id: "cgp", cancers: [CX.dlbcl, CX.nhl, CX.mcl, CX.ptcl],
    notes: ["Lymphoma: a panel answers questions that change management in a minority of patients and names the disease in many more: TP53 in mantle cell lymphoma, MYD88 and CXCR4 in Waldenstrom macroglobulinaemia, EZH2 in relapsed follicular lymphoma, BTK and PLCG2 at progression on a BTK inhibitor, BCL2 at progression on venetoclax, and RHOA, TET2, DNMT3A and IDH2 in T-follicular-helper lymphoma. It is also what a LymphGen call needs, since the classifier requires mutations, copy number and fusions rather than a stain (Wright 2020)."],
    links: [SRC.wright2020] }),
  sup<TechnologyInput>({ id: "liquid-biopsy", cancers: [CX.dlbcl, CX.nhl], notes: ["Lymphoma: plasma is an unusually good sample here, because the mutation density produced by somatic hypermutation gives many variants to track and allows several to be phased onto one fragment, which is what PhasED-seq exploits (Kurtz 2021). Genotyping including cell of origin can be done from blood (Scherer 2016). What is still missing is a trial that changes treatment on the answer."], links: [SRC.kurtz2021, SRC.scherer2016] }),

  // Pathways: the lymphoma link.
  ...["bcr-signalling", "inflammation-nfkb", "apoptosis-bcl2", "jak-stat", "myc", "epigenetic-reprogramming", "pd1-checkpoint", "cd47-sirpa", "oncogenic-viruses", "antigen-presentation-immunoediting", "resistance-routes-map"].map((id) => sup<PathwayInput>({ id, cancers: [CX.nhl] })),
  sup<PathwayInput>({ id: "bcr-signalling", cancers: [CX.mcl, CX.wm, CX.dlbcl, CX.pcnsl], terms: ["lymphoma-bio-lymphgen"],
    notes: ["Lymphoma: this is the one pathway in lymphoma where the biology picks the drug. Chronic active signalling in activated B-cell-like disease was shown functionally, by knocking down IgM, Ig-kappa, CD79A, CD79B or BTK and killing only those cells, and structurally, by the slow-diffusing receptor clusters that resemble an antigen-stimulated normal B cell; ITAM mutations of CD79B raise surface receptor and blunt the LYN feedback brake, and were present in 18% of activated B-cell-like cases (Davis 2010). The toll-like receptor arm feeds the same hub through MYD88 L265P, present in 29% of activated B-cell-like cases and in 91% of lymphoplasmacytic lymphoma (Ngo 2011, Treon 2012)."],
    links: [SRC.davis2010, SRC.ngo2011, SRC.treon2012] }),
  sup<PathwayInput>({ id: "apoptosis-bcl2", cancers: [CX.fl, CX.dlbcl, CX.mcl], terms: ["lymphoma-bio-germinal-centre"],
    notes: ["Lymphoma: the founding lesion of follicular lymphoma is a recombination accident. The t(14;18) breakpoints carry N-region nucleotides and sit beside signal-like sequences, which identifies the translocation as a mistake by the VDJ recombinase at the pre-B-cell stage rather than a late event (Tsujimoto 1985). Venetoclax has not repeated its chronic lymphocytic leukaemia result in lymphoma, because these cells also lean on MCL1 and BCL-xL, and the escape mutation when it does work, BCL2 G101V, lowers drug affinity about 180-fold and appears months before clinical progression (Blombery 2019)."],
    links: [SRC.tsujimoto1985, SRC.blombery2019] }),
  sup<PathwayInput>({ id: "pd1-checkpoint", cancers: [CX.hodgkin, CX.pmbcl],
    notes: ["Lymphoma: Hodgkin lymphoma and primary mediastinal B-cell lymphoma are the two diseases in which the checkpoint is switched on by a copy-number event rather than by the microenvironment. The 9p24.1 amplicon carries CD274, PDCD1LG2 and JAK2, so the ligands rise by gene dose and by transcription at once (Green 2010), and 97% of 108 classical Hodgkin lymphomas carried concordant alterations of the two ligand loci (Roemer 2016)."],
    links: [SRC.green2010, SRC.roemer2016] }),
  sup<PathwayInput>({ id: "oncogenic-viruses", cancers: [CX.ptcl, CX.burkitt, CX.nhl], terms: ["lymphoma-bio-ebv-latency", "lymphoma-bio-htlv1"],
    notes: ["Lymphoma: two viruses, two mechanisms. Epstein-Barr virus causes different diseases depending on which latency programme the infected cell runs, from EBNA1 alone in Burkitt lymphoma to the full set in post-transplant disease, and the programme tracks how closely T cells are watching (Young and Rickinson 2004). HTLV-1 works by starting a process the host genome then finishes along the lines the virus drew: across 426 adult T-cell leukaemia/lymphoma cases, the acquired alterations overlapped significantly with the Tax interactome and concentrated in T-cell receptor and NF-kB signalling, trafficking and immune surveillance (Kataoka 2015)."],
    links: [SRC.young2004, SRC.kataoka2015] }),

  // Medicines: the lymphoma biomarker note.
  sup<DrugInput>({ id: "rituximab", terms: ["lymphoma-bio-lineage-antigen-cost", "lymphoma-bio-antigen-escape"], notes: ["Lymphoma biology: nothing is tested before the first dose, because CD20 is on essentially every mature B-cell lymphoma, and that is also why the treatment empties the normal B-cell compartment. The two consequences worth naming are hepatitis B reactivation, which is screened for, and low immunoglobulin with a blunted vaccine response, which can persist for years. At relapse the question changes: of 19 rebiopsied patients in one series, 5 had become CD20-negative, with lower CD20 messenger RNA in the negative cells from the same patient (Hiraga 2009)."], links: [SRC.hiraga2009] }),
  sup<DrugInput>({ id: "obinutuzumab", cancers: [CX.fl, CX.nhl], notes: ["Lymphoma biology: a glycoengineered type II anti-CD20 antibody with higher Fc receptor affinity and more direct cell death, designed around the observation that rituximab depends on effector cells that become refractory with repeated dosing. It does not solve antigen loss, which is a different problem."] }),
  sup<DrugInput>({ id: "polatuzumab-vedotin", targets: ["cd79b"], notes: ["Lymphoma biology: CD79b is chosen not because it is more specific than CD20 but because it internalises. It is part of the B-cell receptor complex, which is continuously taken into the cell, so it can carry monomethyl auristatin E inside; CD20 cannot. Expression is above 95% in diffuse large B-cell lymphoma, so nothing is tested before the first dose, and the dose-limiting toxicity is the payload, as cumulative peripheral neuropathy, rather than the antigen (Davis 2010)."], links: [SRC.davis2010] }),
  sup<DrugInput>({ id: "brentuximab-vedotin", notes: ["Lymphoma biology: CD30 is as close as lymphoma gets to an antigen restricted to the tumour in an adult, because resting lymphocytes do not carry it. That is why this conjugate does not produce the compartment-emptying effects of the anti-B-cell agents and why its limiting toxicity is the auristatin payload. In classical Hodgkin lymphoma the antigen is on essentially every Reed-Sternberg cell even though those cells are a small minority of the tissue (Kuppers 2009)."], links: [SRC.kuppers2009] }),
  sup<DrugInput>({ id: "mogamulizumab", notes: ["Lymphoma biology: CCR4 is on the tumour in more than 80% of mycosis fungoides and Sezary syndrome and about 90% of adult T-cell leukaemia/lymphoma, and it is also on regulatory T cells, so the antibody depletes those too. That explains both the rash and the association between giving it shortly before an allogeneic transplant and severe graft-versus-host disease. MAVORIC randomised 372 previously treated patients to mogamulizumab or vorinostat (Kim 2018). In adult T-cell leukaemia/lymphoma, CCR4 is not only expressed but mutated, with gain-of-function truncations of the cytoplasmic tail in about a quarter of cases (Kataoka 2015)."], links: [SRC.kim2018, SRC.kataoka2015] }),
  sup<DrugInput>({ id: "alemtuzumab", cancers: [CX.ptcl, CX.nhl], notes: ["Lymphoma biology: CD52 is a 12-amino-acid glycopeptide on a lipid anchor, present at very high surface density, which makes it an efficient complement-fixing target; it is also on normal B cells, T cells, monocytes and dendritic cells, which is why this antibody causes the deepest and longest lymphopenia of any used in lymphoma, with CD4 counts that can stay low for a year and with cytomegalovirus, Pneumocystis and fungal infection to match. Loss of the lipid anchor removes the antigen without touching the gene, which is the described escape route."] }),
  sup<DrugInput>({ id: "tazemetostat", notes: ["Lymphoma biology: the EZH2 mutations this drug was built for are gain-of-function changes at a single tyrosine in the SET domain, Tyr641 in the original numbering and Tyr646 now, which make the enzyme better at writing the trimethyl mark and worse at making the first methylation, so H3K27me3 accumulates and the germinal-centre exit stays shut. They occur in 7.2% of follicular lymphomas and 21.7% of germinal-centre diffuse large B-cell lymphomas and are absent from the activated B-cell-like subtype (Morin 2010). This is one of only two genotype-selected drug choices in B-cell lymphoma."], links: [SRC.morin2010] }),
  sup<DrugInput>({ id: "venetoclax", terms: ["lymphoma-bio-antigen-escape"], notes: ["Lymphoma biology: the escape mutation is in the drug's own binding groove. BCL2 G101V lowers affinity for venetoclax about 180-fold and was found at progression in 7 of 15 paired patients and in none at study entry, first detectable 19 to 42 months into treatment and months before clinical progression (Blombery 2019). The reason venetoclax has not repeated its chronic lymphocytic leukaemia result in lymphoma is different: those cells lean on MCL1 and BCL-xL as well as on BCL-2."], links: [SRC.blombery2019] }),
  sup<DrugInput>({ id: "pirtobrutinib", notes: ["Lymphoma biology: a non-covalent inhibitor exists because of one amino acid. Covalent BTK inhibitors bind cysteine 481, and the C481S substitution leaves the kinase working while making the inhibition reversible (Woyach 2014); pirtobrutinib does not need that cysteine and gave an overall response of 73.3% in 247 patients who had already had a covalent inhibitor (Mato 2023). It is not a universal answer: the kinase-dead L528W substitution, enriched after zanubrutinib at 7 of 13 progressing patients against 1 of 24 after ibrutinib, confers cross-resistance and was enriched further under pirtobrutinib (Blombery 2022)."], links: [SRC.woyach2014, SRC.mato2023, SRC.blombery2022] }),
  sup<DrugInput>({ id: "ibrutinib", notes: ["Lymphoma biology: the drug exists because knocking down BTK killed activated B-cell-like lymphoma cells with wild-type CARD11 and left other lymphomas alone, which is what identified chronic active B-cell receptor signalling as a pathogenetic mechanism (Davis 2010). Resistance is on-target in most patients, through BTK C481S, and bypass in a minority, through gain-of-function PLCG2 changes below the kinase that no BTK inhibitor can reach (Woyach 2014)."], links: [SRC.davis2010, SRC.woyach2014] }),
  sup<DrugInput>({ id: "nivolumab", cancers: [CX.hodgkin], notes: ["Lymphoma biology: Hodgkin lymphoma is the clearest genetically explained checkpoint indication in oncology. An objective response was reported in 20 of 23 heavily pre-treated patients, 87%, most of whom had already failed autologous transplant and brentuximab vedotin (Ansell 2015), and the reason is the 9p24.1 amplicon, which raises both PD-1 ligands by gene dose and by JAK2-driven transcription (Green 2010). Within the responsive group, MHC class II rather than class I expression predicted complete remission (Roemer 2018)."], links: [SRC.ansell2015, SRC.green2010, SRC.roemer2018] }),
  sup<DrugInput>({ id: "axicabtagene-ciloleucel", terms: ["lymphoma-bio-antigen-escape"], notes: ["Lymphoma biology: half the medicine is the patient's own T cells. Single-cell sequencing of 24 infusion products found three times the frequency of memory-signature CD8 T cells in patients who were in complete response at three months, and an exhaustion signature associated with a poor molecular response in cell-free DNA at day 7; a rare monocyte-like population in the product was associated with high-grade neurotoxicity (Deng 2020). The other failure mode is CD19 target evasion (Plaks 2021, Sotillo 2015)."], links: [SRC.deng2020, SRC.plaks2021, SRC.sotillo2015] }),
];

// ======================= THE SPIKES =======================
const BIO_TERMS = terms.map((t) => t.id);
const NEW_READOUTS = readouts.map((r) => r.id);

/** Short, per-cancer helper: the molecular layer carries no standard-of-care rows and no trials, so every patch is relations plus prose. */
const mk = (cancerId: string, patch: Spike["patch"], entities: EntityInput[] = []): Spike => ({ cancerId, entities, patch });

/**
 * The hub. Everything this layer creates is registered on the non-Hodgkin lymphoma record, so a reader who starts at
 * the family page can reach the antigen table, the lesions, the classifications, the resistance routes and the tests.
 */
const nhlSpike: Spike = {
  cancerId: CX.nhl,
  entities: [germinalCentrePathway, clonalityTechnology, ...terms, ...readouts],
  supplements: [...antigenSupplements, ...lesionSupplements, ...otherSupplements],
  patch: {
    biomarkers: [
      "Cell of origin in large B-cell lymphoma: germinal-centre-like or non-germinal-centre, by the Hans three-stain algorithm or by expression profiling",
      "MYC, BCL2 and BCL6 rearrangement by FISH: 8.8%, 13.5% and 28.7% of 442 unselected diffuse large B-cell lymphomas",
      "MYD88 L265P: 29% of activated B-cell-like diffuse large B-cell lymphoma, 91% of lymphoplasmacytic lymphoma",
      "CD79B ITAM mutation: 18% of activated B-cell-like diffuse large B-cell lymphoma",
      "EZH2 Tyr646 gain-of-function mutation: 7.2% of follicular lymphoma, 21.7% of germinal-centre diffuse large B-cell lymphoma",
      "CREBBP or EP300 inactivation: about 39% of diffuse large B-cell lymphoma, 41% of follicular lymphoma",
      "TP53 mutation in mantle cell lymphoma: 11%, with median overall survival of 1.8 years against 12.7 years",
      "RHOA G17V: 67 to 68% of angioimmunoblastic T-cell lymphoma, 18% of peripheral T-cell lymphoma not otherwise specified",
      "9p24.1 alteration of the PD-1 ligand loci: 97% of 108 classical Hodgkin lymphomas",
      "CIITA rearrangement: 38% of primary mediastinal B-cell lymphoma, 15% of classical Hodgkin lymphoma",
      "t(11;18) API2-MALT1 in gastric MALT lymphoma: predicts failure of Helicobacter eradication",
      "Immunoglobulin and T-cell receptor clonality: clonal, polyclonal or oligoclonal, read with the morphology and never alone",
      "Deauville five-point score on interim and end-of-treatment PET",
    ],
    stateOfArt: [
      "The antigens, and what they cost. Almost every surface target in lymphoma is a lineage antigen: a normal protein on a normal cell, present on the cancer because the cancer came from that cell. CD20 and CD19 are on every normal B cell, so the treatments that use them empty the B-cell compartment and leave low immunoglobulin and more infection behind; CD52 adds T cells and monocytes and produces the deepest lymphopenia of any antibody here; CCR4 is on regulatory T cells, which is why mogamulizumab causes rash and is associated with severe graft-versus-host disease if given shortly before an allogeneic transplant; CD47 is on red cells, so blocking it causes anaemia by design. CD30 is the exception, close to restricted to activated cells in an adult. CD3 is not on the tumour at all in B-cell disease: it is the handle a bispecific antibody uses to grip a T cell.",
      "Which antigens can carry a payload. CD20 is not internalised, so it carries naked antibodies and T-cell engagers and no conjugate; CD79b, CD30 and CD22 are internalised, which is why the conjugates aim at them. This single property, not specificity, explains most of the format choices in lymphoma.",
      "The B-cell receptor is the one pathway that picks a drug. Activated B-cell-like lymphoma signals continuously through CD79a and CD79b to SYK, BTK, PLC-gamma-2 and the CARD11-BCL10-MALT1 complex into NF-kB; the toll-like receptor arm feeds the same hub through MYD88 L265P. BTK inhibitors are standard in mantle cell lymphoma and Waldenstrom macroglobulinaemia and do little in germinal-centre disease.",
      "The germinal centre explains the rest. To make a better antibody a B cell deliberately mutates its own DNA while dividing fast, with its damage response held down by BCL6 and its exit locked by polycomb. The translocations of BCL2 and MYC to an immunoglobulin locus are recombinase errors made during that programme, EZH2 gain-of-function mutations keep the exit locked, and CREBBP and EP300 loss leaves BCL6 active when it should be off.",
      "Classification by molecule, honestly. Cell of origin is real, prognostic, and does not currently choose a treatment outside a trial. The genetic subtypes, MCD, BN2, N1, EZB and the rest, explain a great deal and change nothing today: no regulator licenses a drug on a LymphGen call and no randomised trial has assigned treatment by it. Two classifications apply only in practice: a MYC with BCL2 rearrangement, which moves most patients off R-CHOP, and an EZH2 mutation in relapsed follicular lymphoma, which opens tazemetostat.",
      "Checkpoint blockade works in Hodgkin lymphoma for a genetic reason. The 9p24.1 amplicon carries both PD-1 ligand genes and JAK2, which induces them further, and 97% of 108 classical Hodgkin lymphomas carried concordant alterations of the two loci. PD-1 blockade gave an objective response in 20 of 23 heavily pre-treated patients; outside Hodgkin lymphoma and the mediastinal group, single-agent checkpoint blockade in B-cell lymphoma does very little.",
      "Resistance, by class. Anti-CD20 is defeated by transcriptional loss of CD20, found in 5 of 19 rebiopsied relapses; covalent BTK inhibitors by BTK C481S, answered by a non-covalent inhibitor, and by PLCG2 gain of function, which no BTK inhibitor can reach; venetoclax by BCL2 G101V, which lowers drug affinity about 180-fold and appears months before progression; CD19 CAR-T by antigen loss, by the fitness of the collected T cells, and by the node the cells have to work in; and checkpoint blockade in Hodgkin lymphoma by loss of MHC class II rather than class I.",
      "Tests, in practice. An excisional biopsy with an immunohistochemistry panel, FISH for MYC with BCL2 and BCL6, flow cytometry where cells can be put in suspension, immunoglobulin and T-cell receptor clonality where the morphology is equivocal, a gene panel where TP53, MYD88, EZH2 or a resistance mutation would change the plan, and FDG-PET scored on the Deauville five-point scale. Circulating tumour DNA can do all of genotyping, burden and residual disease, and no approval yet depends on it.",
    ],
    openProblems: [
      "The genetic classifications of large B-cell lymphoma are the best-validated molecular taxonomy in haematology and no randomised trial has yet assigned treatment by one. Patients are genotyped, told which subtype they have, and then given the same regimen as everyone else.",
      "Cell of origin has been known for a quarter of a century and every randomised attempt to act on it in first line has failed to change survival in the whole population. It is not clear whether the problem is the classification, the drugs chosen, or the fact that immunohistochemistry cannot separate the activated type from the unclassified one.",
      "Nobody knows how often a large B-cell lymphoma relapses without CD19 after CAR-T. The published series are small and do not agree, and most relapses are not rebiopsied at all, so the field is choosing second treatments without the measurement that would decide between them.",
      "The same is true of CD20: the only series that looked found 5 of 19 rebiopsied relapses had lost the antigen, which means the denominator for every other patient is unknown and a second anti-CD20 drug is often given without checking the target is still there.",
      "MYC has been a known driver of Burkitt lymphoma since 1982 and there is still no drug that acts on it. The regimens that cure Burkitt lymphoma are the most toxic in lymphoma, which is why it remains hardest to treat in older patients and in the equatorial regions where the endemic form occurs.",
      "Circulating tumour DNA in lymphoma can genotype, measure burden and find residual disease at parts per million, and no trial has yet shown that changing treatment on the result helps anyone.",
      "BCL2 was the first apoptosis gene found in a human cancer and venetoclax has not repeated its chronic lymphocytic leukaemia result in follicular or large B-cell lymphoma, because those cells also lean on MCL1 and BCL-xL. MCL1 inhibitors have been held back by cardiac toxicity.",
    ],
    notes: [
      "The biology in detail, 1 of 5. The antigens. Ten surface targets carry the lymphoma medicines, and nine of the ten are normal proteins on normal cells. CD20 and CD19 are B-cell lineage antigens, so anti-CD20 and anti-CD19 treatments empty the B-cell compartment and leave hypogammaglobulinaemia, more infection, a blunted vaccine response and a risk of hepatitis B reactivation; after CAR-T the aplasia is deeper and can last years. CD79b and CD22 are also B-cell antigens, chosen for conjugates because they internalise. CD30 is the nearest to a restricted antigen, carried by activated lymphocytes and monocytes but not by resting ones, which is why brentuximab vedotin's limiting toxicity is the auristatin payload rather than the target. CD38 is mostly a myeloma antigen with no lymphoma approval and one laboratory consequence worth knowing, a positive indirect antiglobulin test that masks alloantibodies. CD47 is on every red cell, so blocking it causes anaemia by design and the dosing had to be redesigned around that. CCR4 is on regulatory T cells as well as on cutaneous and adult T-cell lymphoma, so depleting it causes rash and raises transplant risk. CD52 is on B cells, T cells, monocytes and dendritic cells at very high density, which makes alemtuzumab efficient and leaves CD4 counts low for a year. CD3 is the one target not on the tumour at all in B-cell disease: it is the handle a bispecific antibody grips, and cytokine release syndrome is that mechanism working.",
      "The biology in detail, 2 of 5. The lesions. Chronic active B-cell receptor signalling defines the activated B-cell-like group and was shown by killing those cells, and only those cells, with knockdown of IgM, CD79A, CD79B or BTK; CD79B ITAM mutations were present in 18% of them and activating CARD11 mutations in about 10%. MYD88 L265P feeds the same NF-kB hub from the toll-like receptor side in 29% of activated B-cell-like cases, 9% of MALT lymphomas and 91% of lymphoplasmacytic lymphoma. BCL2 arrives by a recombinase error at the pre-B-cell stage, t(14;18), present in most follicular lymphomas and 13.5% of unselected large B-cell lymphomas. MYC arrives the same way in Burkitt lymphoma, where it needs a partner that supplies survival: TCF3 or ID3 mutation in 70% of sporadic cases and CCND3 mutation in 38%. BCL6 is rearranged in 28.7% of large B-cell lymphomas. EZH2 Tyr646 substitutions, 7.2% of follicular and 21.7% of germinal-centre large B-cell lymphoma, are gain-of-function and absent from the activated subtype. CREBBP or EP300 inactivation affects about 39% and 41%, and KMT2D 32% and 89%. TP53 loss is the commonest route out of chemotherapy sensitivity, 11% in mantle cell lymphoma with median overall survival of 1.8 years against 12.7, and 47.1% in Richter transformation.",
      "The biology in detail, 3 of 5. The immune lesions and the viruses. Classical Hodgkin lymphoma and primary mediastinal B-cell lymphoma amplify 9p24.1, which carries both PD-1 ligand genes and JAK2; 97% of 108 classical Hodgkin lymphomas had concordant alterations of the two ligand loci, and CIITA, the master regulator of MHC class II, is rearranged in 38% of mediastinal and 15% of Hodgkin cases. That is why PD-1 blockade produced responses in 20 of 23 heavily pre-treated Hodgkin patients and does very little elsewhere in B-cell lymphoma. The Hodgkin node is mostly not cancer: the Reed-Sternberg cells are a small minority, their clonal B-cell identity had to be proved by picking single cells off a slide with a micromanipulator, and the infiltrate carries prognostic information of its own, with more CD68-positive macrophages predicting worse outcome. Two viruses matter. Epstein-Barr virus persists in almost everyone and causes different lymphomas according to which latency programme the infected cell runs: EBNA1 alone in Burkitt lymphoma, LMP1 added in Hodgkin and NK/T-cell lymphoma, and the full set where T-cell surveillance has gone. HTLV-1 starts adult T-cell leukaemia/lymphoma with Tax and HBZ, and the 426-case genomic analysis showed the acquired mutations cluster in the pathways Tax itself touches.",
      "The biology in detail, 4 of 5. Resistance. Anti-CD20 fails by transcriptional down-regulation of CD20, found in 5 of 19 rebiopsied relapses, and by trogocytosis, in which macrophages shave the antigen off a living cell. Covalent BTK inhibitors fail on-target through BTK C481S, found in five of six patients with acquired resistance, which is answered by a non-covalent inhibitor giving 73.3% responses after a covalent one; they also fail through gain-of-function PLCG2 mutations below the kinase, which no BTK inhibitor reaches. Non-covalent inhibitors are in turn defeated by L528W and T474I, and L528W is enriched after zanubrutinib specifically, 7 of 13 progressing patients against 1 of 24 after ibrutinib. Venetoclax fails through BCL2 G101V in its own binding groove, which lowers affinity about 180-fold, appeared in 7 of 15 paired patients and is detectable months before progression. CD19 CAR-T fails through antigen loss by deletion, exon 2 mutation or exon 2 skipping, through the fitness of the collected T cells, where memory signatures predict response and exhaustion signatures predict failure, and through the node itself. Checkpoint blockade in Hodgkin lymphoma fails with loss of MHC class II, not class I, which is what points at a CD4 T cell as the effector.",
      "The biology in detail, 5 of 5. The tests. An excisional biopsy rather than a core where it is possible, because architecture decides several of these diagnoses and because in Hodgkin lymphoma the malignant cells are rare enough to be missed. An immunohistochemistry panel of 10 to 12 stains, from which the Hans algorithm reads cell of origin. FISH for MYC, with BCL2 and BCL6 where MYC is rearranged or MYC protein is high, for CCND1 in a suspected mantle cell lymphoma, for t(11;18) in a gastric MALT lymphoma before relying on Helicobacter eradication, and for 9p24.1 where a research question needs it. Flow cytometry where cells can be put in suspension, which is how Sezary cells are counted and marrow involvement measured. Immunoglobulin and T-cell receptor clonality where the morphology is equivocal, remembering that clonality is not malignancy. A sequencing panel where TP53, MYD88, CXCR4, EZH2, BTK, PLCG2, BCL2 or the T-follicular-helper genes would change the plan. And FDG-PET, scored 1 to 5 against the mediastinal blood pool and the liver, which is the measurement lymphoma treatment is actually adapted to, with the warning that a score of 3 means different things in different protocols.",
    ],
    targets: ["cd20", "cd19", "cd79b", "cd30", "cd22", "cd38", "cd3", "cd47", "ccr4", "cd52", "btk", "syk", "plcg2", "prkcb", "card11", "myd88", "bcl2", "mcl1", "bim", "bcl6", "myc-gene", "ezh2", "crebbp", "ep300", "kmt2d", "tp53", "cdkn2a", "jak1", "jak2", "jak3", "stat3", "stat5", "stat6", "socs1", "ciita", "rhoa", "tet2", "dnmt3a", "fyn", "b2m", "cd58", "malt1", "bcl10", "birc3", "tnfaip3", "ccnd1", "ccnd3", "tcf3", "id3", "notch1", "notch2", "irf4", "vav1", "plcg1", "atm", "pdl1"],
    pathways: ["germinal-centre-reaction", "bcr-signalling", "inflammation-nfkb", "apoptosis-bcl2", "myc", "jak-stat", "epigenetic-reprogramming", "pd1-checkpoint", "cd47-sirpa", "oncogenic-viruses", "antigen-presentation-immunoediting", "tumor-microenvironment", "resistance-routes-map", "clonal-evolution", "transcription-addiction"],
    terms: [...BIO_TERMS, "cell-of-origin", "deauville", "plasma-ebv-dna", "flipi", "fish", "ihc", "ngs", "mrd", "ctdna", "cytogenetics", "gene-fusion", "gene-amplification", "driver-mutation", "resistance", "cross-resistance"],
    related: NEW_READOUTS,
    technologies: ["clonality-testing", "histopathology-ihc", "cytogenetics-fish", "flow-cytometry-mrd", "ngs-mrd-clonoseq", "ctdna-lymphoma-monitoring", "pet-adapted-therapy", "fdg-pet", "cgp", "liquid-biopsy", "car-t", "bispecific-antibody", "t-cell-engager", "checkpoint-inhibitor", "monoclonal-antibody", "adc"],
    history: [
      { year: 1982, title: "MYC is mapped to the Burkitt translocation", note: "The human c-myc gene is placed at 8q24, the region translocated to chromosome 2, 14 or 22 in Burkitt lymphoma cells, tying an oncogene to a specific chromosome swap for the first time in a human cancer.", refs: ["myc-gene", "double-hit-rearrangement"] },
      { year: 1985, title: "t(14;18) is shown to be a recombinase error", note: "The breakpoint sequences carry N-region nucleotides and lie beside signal-like sequences, which places the founding lesion of follicular lymphoma at the pre-B-cell stage, years before the disease.", refs: ["bcl2", "bcl2-rearrangement"] },
      { year: 1994, title: "The Reed-Sternberg cell is proved to be a clonal B cell", note: "Single cells picked off a histological section with a micromanipulator each gave one clonal immunoglobulin rearrangement, settling the identity of a cell that had lost almost every B-cell marker.", refs: ["lymphoma-bio-hodgkin-microenvironment"] },
      { year: 2000, title: "Cell of origin", note: "Microarray profiling splits diffuse large B-cell lymphoma into germinal-centre B-cell-like and activated B-cell-like forms with different survival, the first molecular classification of a lymphoma.", refs: ["cell-of-origin", "lymphoma-bio-cell-of-origin-in-practice"] },
      { year: 2003, title: "Clonality testing is standardised", note: "The BIOMED-2 collaboration reduces immunoglobulin and T-cell receptor clonality to 107 primers in 18 tubes, making the result comparable between laboratories.", refs: ["clonality-testing", "ig-tcr-clonality"] },
      { year: 2004, title: "Cell of origin becomes three stains", note: "The Hans algorithm reproduces the microarray split with CD10, BCL6 and MUM1 on a tissue microarray, with five-year survival of 76% against 34%, which is why most laboratories report non-germinal-centre rather than activated.", refs: ["cell-of-origin"] },
      { year: 2010, title: "Chronic active B-cell receptor signalling, and the 9p24.1 amplicon", note: "Two findings in one year: activated B-cell-like lymphoma depends on continuous B-cell receptor signalling through BTK, which is the rationale for every BTK inhibitor; and Hodgkin lymphoma and mediastinal large B-cell lymphoma amplify the locus carrying both PD-1 ligands and JAK2, which is the rationale for checkpoint blockade there.", refs: ["btk", "cd79b", "jak2", "pd-ligand-9p24-alteration"] },
      { year: 2010, title: "EZH2 Tyr641 mutations", note: "Gain-of-function substitutions at a single tyrosine in the SET domain are found in 21.7% of germinal-centre large B-cell lymphomas and 7.2% of follicular lymphomas, and absent from the activated subtype; tazemetostat follows.", refs: ["ezh2", "ezh2-y646-mutation"] },
      { year: 2011, title: "MYD88 L265P, and the chromatin genes", note: "An oncogenic MYD88 substitution is found in 29% of activated B-cell-like lymphomas; in the same period CREBBP and EP300 inactivation is found in about 39% of diffuse large B-cell and 41% of follicular lymphoma, and KMT2D in 32% and 89%, which makes lymphoma a disease of chromatin and not only of signalling.", refs: ["myd88", "crebbp", "kmt2d", "myd88-l265p"] },
      { year: 2012, title: "MYD88 L265P defines Waldenstrom macroglobulinaemia", note: "Whole-genome sequencing finds the same substitution in all 10 paired cases and in 91% of lymphoplasmacytic lymphoma overall, absent from normal tissue, which turns a diagnosis of exclusion into a genotype.", refs: ["myd88", "myd88-l265p"] },
      { year: 2014, title: "Resistance to a BTK inhibitor is read in the kinase", note: "BTK C481S in five of six patients with acquired ibrutinib resistance and PLCG2 gain-of-function mutations in two, which is why the non-covalent inhibitors exist.", refs: ["btk", "plcg2", "btk-c481s"] },
      { year: 2014, title: "RHOA G17V in angioimmunoblastic T-cell lymphoma", note: "A single substitution in 67 to 68% of cases, specific to the tumour cells, with the accompanying TET2 mutations also present in normal blood cells, which places this lymphoma as a growth out of clonal haematopoiesis.", refs: ["rhoa", "tet2", "rhoa-g17v"] },
      { year: 2015, title: "Antigen escape after CAR-T is explained", note: "Relapse without CD19 turns out to combine deletion, exon 2 mutation and selection for an alternatively spliced transcript that skips the epitope and still partly works, which is why a standard sequencing test can call the gene normal.", refs: ["cd19", "lymphoma-bio-antigen-escape"] },
      { year: 2015, title: "Checkpoint blockade in Hodgkin lymphoma", note: "Nivolumab produces an objective response in 20 of 23 heavily pre-treated patients, most of whom had already failed autologous transplant and brentuximab vedotin.", refs: ["pd-ligand-9p24-alteration", "nivolumab"] },
      { year: 2018, title: "The genetic subtypes", note: "Two large series read large B-cell lymphoma as four and five genetically defined groups, MCD, BN2, N1 and EZB among them, with different outcomes after immunochemotherapy.", refs: ["lymphoma-bio-lymphgen"] },
      { year: 2019, title: "Venetoclax resistance is a single amino acid", note: "BCL2 G101V, found at progression in 7 of 15 paired patients and in none at study entry, lowers drug affinity about 180-fold and is detectable months before clinical relapse.", refs: ["bcl2", "bcl2-g101v"] },
      { year: 2020, title: "LymphGen makes the genetic subtypes usable on one patient", note: "A probabilistic classifier assigns a lymphoma to one of seven genetic subtypes and shows each shares a pathogenesis with a particular indolent or extranodal lymphoma. No randomised trial has yet assigned treatment by it.", refs: ["lymphoma-bio-lymphgen"] },
      { year: 2021, title: "Residual disease at parts per million", note: "PhasED-seq uses several mutations carried on one DNA fragment, which lymphoma genomes supply because of somatic hypermutation, and finds residual disease in a further 25% of participants called negative by the previous method.", refs: ["ctdna-lymphoma-monitoring", "ctdna-mrd-positive"] },
      { year: 2022, title: "The WHO fifth edition", note: "High-grade B-cell lymphoma with MYC and BCL2 rearrangements becomes an entity of its own and the T-follicular-helper lymphomas are grouped by origin rather than appearance. A second classification published the same year disagrees on several names.", refs: ["double-hit-rearrangement"] },
    ],
  },
};

const dlbclSpike = mk(CX.dlbcl, {
  stateOfArt: [
    "Molecular classification. Cell of origin splits this disease into germinal-centre-like and activated B-cell-like forms with different survival, and in most laboratories it is called by three stains rather than by the expression profiling that defined it, which is why a report usually says non-germinal-centre rather than activated. The genetic subtypes, MCD for MYD88 L265P with CD79B mutation, BN2 for BCL6 fusions with NOTCH2 mutations, N1 for NOTCH1 mutations and EZB for EZH2 mutations with BCL2 translocations, explain far more and currently change nothing outside a trial.",
    "The lesions that do change treatment. A MYC rearrangement with BCL2, with or without BCL6, is a separate WHO entity and usually moves a patient off R-CHOP; rates in 442 unselected cases were 8.8% for MYC, 13.5% for BCL2 and 28.7% for BCL6. Co-expression of MYC and BCL2 protein without rearrangement, about 21% of cases, is prognostic and is not the same thing.",
    "What the medicines are aimed at. CD20 on essentially every case, CD19 on the same cells and retained when CD20 is lost, CD79b on more than 95% and chosen because it internalises and can carry a payload, and CD3 as the handle for the bispecific antibodies. None of the four is tested before treatment, and the one worth retesting at relapse is CD20.",
  ],
  targets: ["cd20", "cd19", "cd79b", "cd22", "cd3", "myd88", "cd79b", "card11", "bcl2", "bcl6", "myc-gene", "ezh2", "crebbp", "ep300", "kmt2d", "tp53", "cdkn2a", "b2m", "btk"],
  pathways: ["germinal-centre-reaction", "bcr-signalling", "inflammation-nfkb", "apoptosis-bcl2", "myc", "epigenetic-reprogramming"],
  terms: ["lymphoma-bio-cell-of-origin-in-practice", "lymphoma-bio-lymphgen", "lymphoma-bio-germinal-centre", "lymphoma-bio-antigen-escape", "lymphoma-bio-lineage-antigen-cost", "cell-of-origin", "deauville"],
  related: ["double-hit-rearrangement", "myc-bcl2-double-expressor", "bcl2-rearrangement", "myd88-l265p", "cd79b-itam-mutation", "ezh2-y646-mutation", "ig-tcr-clonality"],
  technologies: ["histopathology-ihc", "cytogenetics-fish", "cgp", "ctdna-lymphoma-monitoring", "clonality-testing"],
});

const flSpike = mk(CX.fl, {
  stateOfArt: [
    "The founding lesion is a mistake made years earlier. The t(14;18) translocation puts BCL2 under an immunoglobulin enhancer, and the breakpoint sequences show it was made by the VDJ recombinase at the pre-B-cell stage. A cell carrying it can be found in the blood of healthy people, so the translocation is the beginning of the story rather than the disease.",
    "What makes it a lymphoma is chromatin. KMT2D was mutated in 89% of follicular lymphomas in the discovery series, CREBBP or EP300 in about 41%, and EZH2 at Tyr646 in 7.2%. The EZH2 mutations are gain-of-function, which is why tazemetostat works and why it is the only genotype-selected tablet in B-cell lymphoma. The seven genes of the m7-FLIPI score are largely this machinery.",
    "Transformation is the event that changes everything. An indolent follicular lymphoma that acquires a MYC rearrangement, TP53 loss or CDKN2A deletion behaves as an aggressive lymphoma and is treated as one. The sign is usually one site growing much faster than the rest, and the answer is a biopsy of that site.",
  ],
  targets: ["bcl2", "ezh2", "crebbp", "ep300", "kmt2d", "cd20", "cd19", "cd79b", "myc-gene", "tp53"],
  pathways: ["germinal-centre-reaction", "apoptosis-bcl2", "epigenetic-reprogramming"],
  terms: ["lymphoma-bio-germinal-centre", "lymphoma-bio-transformation", "lymphoma-bio-antigen-escape", "flipi"],
  related: ["bcl2-rearrangement", "ezh2-y646-mutation", "double-hit-rearrangement", "ig-tcr-clonality"],
  technologies: ["cytogenetics-fish", "histopathology-ihc", "cgp"],
});

const mclSpike = mk(CX.mcl, {
  stateOfArt: [
    "One founding translocation, and everything else is secondary. The t(11;14) puts CCND1 under the immunoglobulin heavy-chain locus and is considered the first oncogenic hit in virtually all mantle cell lymphomas. Sequencing of 29 genomes with validation in 172 more found 25 significantly mutated genes on top of it, including ATM, TP53, BIRC3, KMT2D and NOTCH2.",
    "TP53 is the result that changes the plan. Among 183 younger patients on the Nordic protocols, TP53 mutation was present in 11% and carried a hazard ratio of 6.2 for overall survival, a median overall survival of 1.8 years against 12.7 years, half relapsing within a year, and worse responses to both induction and high-dose chemotherapy. No label depends on it, and in practice it is the usual reason to go to a BTK inhibitor, venetoclax or CAR-T rather than intensive chemotherapy and transplant.",
    "A minority of cases are cyclin D1-negative and carry CCND2 or CCND3 rearrangements instead; SOX11 identifies most of them, and its absence marks the indolent leukaemic non-nodal form that is often watched rather than treated.",
    "Resistance to a BTK inhibitor is read in the kinase. BTK C481S is answered by a non-covalent inhibitor; PLCG2 gain of function is not, because it sits below the drug; and L528W defeats both.",
  ],
  targets: ["ccnd1", "tp53", "atm", "btk", "plcg2", "notch1", "notch2", "kmt2d", "birc3", "cd20", "cd19", "bcl2", "cdkn2a"],
  pathways: ["cell-cycle-engine-cdks", "bcr-signalling", "p53-mdm2-axis", "apoptosis-bcl2"],
  terms: ["lymphoma-bio-antigen-escape", "lymphoma-bio-germinal-centre", "resistance", "cross-resistance"],
  related: ["tp53-del17p", "btk-c481s", "bcl2-g101v", "cyclin-d1-t11-14"],
  technologies: ["cytogenetics-fish", "histopathology-ihc", "cgp", "clonality-testing"],
});

const hodgkinSpike = mk(CX.hodgkin, {
  stateOfArt: [
    "The cancer cell is the minority. A classical Hodgkin lymph node is mostly T cells, eosinophils, plasma cells, macrophages and fibrosis; the Hodgkin and Reed-Sternberg cells are a small fraction of it, and their clonal B-cell identity had to be proved by picking single cells off a slide with a micromanipulator. This is why an excisional biopsy is usually needed and why bulk sequencing of a Hodgkin node measures the infiltrate rather than the tumour.",
    "Checkpoint blockade works here for a genetic reason. The 9p24.1 amplicon carries CD274, PDCD1LG2 and JAK2, so one copy-number event raises both PD-1 ligands by gene dose and by transcription; 97% of 108 cases carried concordant alterations of the two ligand loci, with amplification in 36% and copy gain in 56%. PD-1 blockade gave an objective response in 20 of 23 heavily pre-treated patients. Nothing is tested first, because almost every case has the alteration.",
    "What predicts a complete remission on a checkpoint inhibitor is MHC class II, not class I, on the Reed-Sternberg cells, which points at a CD4 T cell as the effector and makes CIITA rearrangement, present in 15% of cases, an escape route as well as a cause.",
    "The infiltrate carries prognosis of its own: more CD68-positive macrophages meant shorter progression-free survival, more relapse after autologous transplant and shorter disease-specific survival in an independent cohort of 166 patients, outperforming the International Prognostic Score. It is not used to choose treatment; the interim PET scan is.",
  ],
  targets: ["cd30", "pdl1", "jak2", "ciita", "jak1", "stat3", "socs1", "b2m"],
  pathways: ["pd1-checkpoint", "jak-stat", "tumor-microenvironment", "antigen-presentation-immunoediting", "oncogenic-viruses", "myeloid-suppression-axis"],
  terms: ["lymphoma-bio-hodgkin-microenvironment", "lymphoma-bio-ebv-latency", "lymphoma-bio-lineage-antigen-cost", "deauville", "plasma-ebv-dna"],
  related: ["pd-ligand-9p24-alteration"],
  technologies: ["histopathology-ihc", "cytogenetics-fish", "checkpoint-inhibitor", "pet-adapted-therapy", "adc"],
});

const pmbclSpike = mk(CX.pmbcl, {
  stateOfArt: [
    "Primary mediastinal B-cell lymphoma shares its central lesion with classical Hodgkin lymphoma rather than with diffuse large B-cell lymphoma: amplification of 9p24.1, carrying both PD-1 ligand genes and JAK2, which raises the ligands by gene dose and by JAK2-driven transcription.",
    "CIITA, the master transactivator of MHC class II, is rearranged in 38% of cases, the highest rate of any lymphoma. The fusions lower MHC class II on the tumour cell and in the same rearrangements place the PD-1 ligands under new promoters, so one event both hides the tumour and switches on the brake.",
    "The practical consequence is that checkpoint blockade has activity here when it has very little in other B-cell non-Hodgkin lymphomas, and that the grey-zone lymphoma between this disease and Hodgkin lymphoma is a biological category and not only a morphological one.",
  ],
  targets: ["ciita", "jak2", "pdl1", "socs1", "stat6", "cd30", "cd20"],
  pathways: ["pd1-checkpoint", "jak-stat", "antigen-presentation-immunoediting"],
  terms: ["lymphoma-bio-hodgkin-microenvironment", "deauville"],
  related: ["pd-ligand-9p24-alteration"],
  technologies: ["cytogenetics-fish", "checkpoint-inhibitor", "histopathology-ihc"],
});

const burkittSpike = mk(CX.burkitt, {
  stateOfArt: [
    "MYC is the defining lesion and has been localisable since 1982, when the gene was mapped to the chromosome 8 region translocated to chromosome 2, 14 or 22 in Burkitt cells. The partner is always an immunoglobulin locus, so the growth driver is run by the enhancer that should be making antibody.",
    "MYC alone is not enough. Burkitt lymphoma needs a second lesion that supplies survival, and it comes from tonic B-cell receptor signalling: TCF3 activation or ID3 inactivation in 70% of sporadic cases, switching on the PI3K pathway. A third, independent lesion drives the cycle directly, with CCND3 mutations producing unusually stable cyclin D3 in 38%.",
    "The uncomfortable gap is that none of this has produced a drug. The regimens that cure Burkitt lymphoma are the most toxic in lymphoma, which is exactly the problem in older patients and in the equatorial regions where the endemic, Epstein-Barr-positive form occurs.",
  ],
  targets: ["myc-gene", "tcf3", "id3", "ccnd3", "tp53", "cd20", "cd19"],
  pathways: ["myc", "bcr-signalling", "pi3k-akt-mtor", "cell-cycle-engine-cdks", "oncogenic-viruses"],
  terms: ["lymphoma-bio-germinal-centre", "lymphoma-bio-ebv-latency"],
  related: ["double-hit-rearrangement"],
  technologies: ["cytogenetics-fish", "histopathology-ihc", "cgp"],
});

const pcnslSpike = mk(CX.pcnsl, {
  stateOfArt: [
    "Primary CNS lymphoma sits almost entirely in one genetic subtype. MYD88 L265P and CD79B mutations co-occur here as they do in the MCD subtype of systemic large B-cell lymphoma and in primary testicular lymphoma, which is why the three are grouped together genetically despite sitting in different organs.",
    "The practical consequence is a pathway that can be reached with a tablet that crosses into the brain: BTK inhibition has activity in this disease, and the mutations are the reason to expect it. No approval in Europe or the United States currently selects treatment on the genotype.",
    "Loss of MHC class I and class II through 6p21 deletion is common, which is one reason this lymphoma survives in a site the immune system polices differently.",
  ],
  targets: ["myd88", "cd79b", "btk", "b2m", "cd20", "cd19", "pdl1"],
  pathways: ["bcr-signalling", "inflammation-nfkb", "antigen-presentation-immunoediting"],
  terms: ["lymphoma-bio-lymphgen", "lymphoma-bio-cell-of-origin-in-practice"],
  related: ["myd88-l265p", "cd79b-itam-mutation"],
  technologies: ["cgp", "histopathology-ihc", "clonality-testing"],
});

const wmSpike = mk(CX.wm, {
  stateOfArt: [
    "This is the lymphoma with the closest thing to a defining point mutation. Whole-genome sequencing of 30 patients found MYD88 L265P in all 10 with paired normal tissue, and Sanger sequencing found it in 49 of 54 patients and in 91% of lymphoplasmacytic lymphoma overall, while it was absent from paired normal tissue, from healthy donor B cells and from most marginal zone lymphoma, myeloma and IgM monoclonal gammopathy of undetermined significance.",
    "The mutation works by assembling an IRAK1 and IRAK4 signalling complex without a receptor signal, driving NF-kB, which is the mechanistic reason BTK inhibition works in this disease.",
    "The genotype that matters clinically is a pair. CXCR4 mutations of the WHIM type occur alongside MYD88 and blunt the response to a BTK inhibitor, so the two genes are read together before first treatment rather than separately.",
  ],
  targets: ["myd88", "btk", "cd20", "cd19", "bcl2"],
  pathways: ["inflammation-nfkb", "bcr-signalling"],
  terms: ["lymphoma-bio-lymphgen"],
  related: ["myd88-l265p", "btk-c481s"],
  technologies: ["cgp", "flow-cytometry-mrd", "clonality-testing"],
});

const maltSpike = mk(CX.malt, {
  stateOfArt: [
    "Gastric MALT lymphoma begins as a lymphoma that still needs its antigen. Removing Helicobacter pylori removes the stimulus and most localised cases regress, which makes it the clearest example in oncology of curing a cancer with antibiotics.",
    "The t(11;18) translocation is what breaks that dependence. It fuses API2 to MALT1 and makes a protein that activates NF-kB on its own, so the lymphoma no longer needs the bacterium. Among 111 patients treated with eradication, 47 of the 48 who regressed completely were negative for the API2-MALT1 transcript, which is why a positive result means eradication alone is not enough whatever the stage.",
    "The related translocations do the same job by other routes, through BCL10 and MALT1, and inactivation of TNFAIP3 removes the brake on the same pathway. MYD88 L265P appears in 9% of MALT lymphomas, feeding NF-kB from the toll-like receptor side.",
  ],
  targets: ["malt1", "bcl10", "birc3", "tnfaip3", "myd88", "cd20"],
  pathways: ["inflammation-nfkb", "microbiome-tumour"],
  terms: ["lymphoma-bio-germinal-centre", "lymphoma-tx-h-pylori-eradication"],
  related: ["myd88-l265p", "ig-tcr-clonality"],
  technologies: ["cytogenetics-fish", "clonality-testing", "histopathology-ihc"],
});

const mzlSpike = mk(CX.mzl, {
  stateOfArt: [
    "Marginal zone lymphomas are united by chronic antigenic stimulation and by NF-kB activation reached through several different lesions: the API2-MALT1 fusion of t(11;18), BCL10 and MALT1 translocations, TNFAIP3 inactivation, and NOTCH2 and KLF2 mutations in the splenic form.",
    "In the genetic taxonomy of large B-cell lymphoma, the BN2 subtype, defined by BCL6 fusions and NOTCH2 mutations, shares a pathogenesis with marginal zone lymphoma, which is one of the clearest demonstrations that the genetic classification is tracking biology rather than clustering noise.",
    "Clonality testing earns its place here more than almost anywhere, because the differential at the small-biopsy stage is a reactive marginal zone expansion, and that question is not answered by morphology alone.",
  ],
  targets: ["malt1", "bcl10", "tnfaip3", "notch2", "klf2", "birc3", "cd20", "myd88"],
  pathways: ["inflammation-nfkb", "notch", "microbiome-tumour"],
  terms: ["lymphoma-bio-lymphgen", "lymphoma-bio-transformation"],
  related: ["ig-tcr-clonality", "myd88-l265p"],
  technologies: ["clonality-testing", "cytogenetics-fish", "flow-cytometry-mrd"],
});

const ptclSpike = mk(CX.ptcl, {
  stateOfArt: [
    "The T-cell lymphomas are where the antigen problem is hardest, because the tumour and the effector are the same kind of cell. CD52 is on B cells, T cells, monocytes and dendritic cells, so alemtuzumab leaves CD4 counts low for a year; CCR4 is on regulatory T cells as well as on the tumour; and a CD3-engaging bispecific cannot be used the way it is in B-cell disease.",
    "JAK-STAT is the recurring signalling lesion. Activating STAT3 and STAT5B mutations were found across 51 NK/T-cell lymphomas and 43 gamma-delta T-cell lymphomas, with STAT5B N642H particularly frequent in the gamma-delta group; the substitution raises the affinity of the phosphotyrosine for the mutant histidine so the active form persists.",
    "HTLV-1 defines adult T-cell leukaemia/lymphoma, and the genomics show it is not simply a viral disease: across 426 cases, the acquired alterations overlapped significantly with the proteins the viral Tax protein binds, concentrating in T-cell receptor and NF-kB signalling, trafficking and immune surveillance, with activating CCR4 mutations among them.",
  ],
  targets: ["cd52", "ccr4", "cd30", "cd38", "stat3", "stat5", "jak1", "jak3", "rhoa", "tet2", "dnmt3a", "vav1", "irf4", "plcg1", "card11", "fyn"],
  pathways: ["jak-stat", "oncogenic-viruses", "epigenetic-reprogramming", "inflammation-nfkb"],
  terms: ["lymphoma-bio-htlv1", "lymphoma-bio-lineage-antigen-cost", "lymphoma-bio-ebv-latency"],
  related: ["rhoa-g17v", "ig-tcr-clonality"],
  technologies: ["clonality-testing", "cgp", "histopathology-ihc", "flow-cytometry-mrd"],
});

const aitlSpike = mk(CX.aitl, {
  stateOfArt: [
    "Angioimmunoblastic T-cell lymphoma grows out of clonal haematopoiesis. The TET2 and DNMT3A mutations it carries are present in non-tumour blood cells as well as in the lymphoma, which places them earlier, in the stem cell; the RHOA G17V substitution is found only in the tumour cells and is the later, lineage-defining event.",
    "RHOA G17V was reported in 68% of cases, and every case carrying it also carried a TET2 mutation. An independent series found it in 67% of angioimmunoblastic cases and 18% of peripheral T-cell lymphoma not otherwise specified, alongside IDH2, FYN, ATM, B2M and CD58 lesions.",
    "The mutated protein does not bind GTP and also blocks the normal copy, so it works against the wild-type protein rather than simply failing. The epigenetic lesions are the reason hypomethylating agents are used and studied here, although no test selects them.",
  ],
  targets: ["rhoa", "tet2", "dnmt3a", "fyn", "b2m", "cd58", "cd30", "cd52"],
  pathways: ["epigenetic-reprogramming", "clonal-haematopoiesis", "jak-stat"],
  terms: ["lymphoma-bio-lineage-antigen-cost"],
  related: ["rhoa-g17v", "ig-tcr-clonality"],
  technologies: ["cgp", "clonality-testing", "histopathology-ihc"],
});

const ctclSpike = mk(CX.ctcl, {
  stateOfArt: [
    "CCR4 is the antigen that defines treatment here. More than 80% of mycosis fungoides and Sezary syndrome carry it, and mogamulizumab, a defucosylated antibody that works mainly through natural killer cells, was tested against vorinostat in 372 previously treated patients.",
    "The cost is specific. CCR4 is also on regulatory T cells, so depleting it causes rash and raises the risk of autoimmune complications, and giving it shortly before an allogeneic transplant has been associated with severe graft-versus-host disease because the cells that would restrain it are gone.",
    "Clonality testing is used more here than in most lymphomas, because the differential against inflammatory skin disease cannot be settled on appearance, and because a clonal T-cell population can be found in reactive skin conditions too, so the result is evidence rather than a diagnosis.",
  ],
  targets: ["ccr4", "cd52", "cd30", "stat3", "stat5", "jak3"],
  pathways: ["jak-stat", "tumor-microenvironment"],
  terms: ["lymphoma-bio-lineage-antigen-cost"],
  related: ["ig-tcr-clonality"],
  technologies: ["clonality-testing", "flow-cytometry-mrd", "histopathology-ihc"],
});

const sezarySpike = mk(CX.sezary, {
  stateOfArt: [
    "Sezary syndrome is the leukaemic form, so the measurement is in blood rather than in skin: flow cytometry counts the circulating clone, and the same immunoglobulin or T-cell receptor sequence can be followed afterwards.",
    "CCR4 is expressed in more than 80% of cases, which is why mogamulizumab is used; depleting it also removes regulatory T cells, with the rash and the transplant risk that follow.",
    "JAK-STAT lesions recur in this family of diseases, and the STAT5B N642H substitution, which prolongs the active phosphorylated form, is the best-characterised of them.",
  ],
  targets: ["ccr4", "cd52", "stat3", "stat5", "jak1", "jak3"],
  pathways: ["jak-stat"],
  terms: ["lymphoma-bio-lineage-antigen-cost"],
  related: ["ig-tcr-clonality"],
  technologies: ["flow-cytometry-mrd", "clonality-testing"],
});

const richterSpike = mk(CX.richter, {
  stateOfArt: [
    "Richter transformation is a change in a clone rather than a second cancer, and its genetics are its own. Across 86 pathologically proven cases, TP53 disruption was present in 47.1% and MYC abnormality in 26.2%, while the usual drivers of de novo diffuse large B-cell lymphoma were rare or absent.",
    "Whether the large-cell clone is related to the leukaemic clone matters more than any drug currently does. Clonally unrelated cases had median survival of 62.5 months against 14.2 months for related ones, and less TP53 disruption, 23.1% against 60.0%, so establishing the relationship changes the expected course.",
    "What prompts the suspicion is one site growing much faster than the rest, new B symptoms, a rising LDH or a PET scan with one area far brighter than the others, and what settles it is a biopsy of that area.",
  ],
  targets: ["tp53", "myc-gene", "cdkn2a", "notch1", "cd20", "cd19"],
  pathways: ["p53-mdm2-axis", "myc", "clonal-evolution"],
  terms: ["lymphoma-bio-transformation", "deauville"],
  related: ["tp53-del17p", "double-hit-rearrangement", "ig-tcr-clonality"],
  technologies: ["cgp", "fdg-pet", "cytogenetics-fish", "clonality-testing"],
});

export default nhlSpike;
export {
  dlbclSpike as dlbclMolecularSpike,
  flSpike as flMolecularSpike,
  mclSpike as mclMolecularSpike,
  hodgkinSpike as hodgkinMolecularSpike,
  pmbclSpike as pmbclMolecularSpike,
  burkittSpike as burkittMolecularSpike,
  pcnslSpike as pcnslMolecularSpike,
  wmSpike as wmMolecularSpike,
  maltSpike as maltMolecularSpike,
  mzlSpike as mzlMolecularSpike,
  ptclSpike as ptclMolecularSpike,
  aitlSpike as aitlMolecularSpike,
  ctclSpike as ctclMolecularSpike,
  sezarySpike as sezaryMolecularSpike,
  richterSpike as richterMolecularSpike,
};

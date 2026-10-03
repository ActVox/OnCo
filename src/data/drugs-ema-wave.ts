/**
 * EMA register wave 5 (September 2026, docs/CONTENT-ROADMAP.md): the products in the EMA human-medicines register with
 * a cancer or cancer-care indication whose INN matched no drug record (public/regional/candidates.json, "not-in-corpus",
 * register generated 16 September 2026), re-read on the live EPAR pages on 22 September 2026.
 *
 * Every fact here comes from the EMA product page named in `links` (INN, brand, marketing authorisation holder or
 * applicant, authorisation date, opinion, indication wording) or from the OnCo records linked. US status is not
 * recorded because no US source was consulted in this wave. Regional rows live in src/data/regional-approvals.ts.
 *
 * Of the twelve INNs the measure listed, seven are written here. Three were matching faults fixed by aliases on the
 * existing records: piflufolastat (18F) is `pylarify` (EU brand Pylclari), abiraterone is `abiraterone` (Zytiga) and
 * catequentinib is `anlotinib` (Qezzaqar, CHMP negative opinion 23 July 2026). Vedolizumab (Entyvio) matched the
 * measure's oncology filter on "tumour necrosis factor" and is not a cancer medicine; the filter now excludes that
 * phrase. Human normal immunoglobulin appears twice in the register (Privigen "IVIg" and Kiovig) and is one record.
 *
 * Supportive-care products (fentanyl, epoetin theta, immunoglobulin) follow the precedent of epoetin alfa, darbepoetin
 * and the other "supportive"-tagged records in drugs-approved-wave1.ts; the roadmap's owner item on supportive care
 * stands. Registered in src/data/index.ts as `drugsEmaWave`.
 */
import type { DrugInput } from "@/lib/schema";

const asOf = "2026-09-22";
const EPAR = (slug: string) => `https://www.ema.europa.eu/en/medicines/human/EPAR/${slug}`;
const provenance = { editedBy: "OnCo content wave 5 (EMA medicines register and EPAR pages)", editedOn: asOf };
const tags = ["ema-register"];

type D = Omit<DrugInput, "kind" | "asOf" | "provenance">;
const d = (x: D): DrugInput => ({ kind: "drug", asOf, provenance, ...x, tags: [...tags, ...(x.tags ?? [])] });

export const drugsEmaWave: DrugInput[] = [
  d({ id: "crisantaspase", name: "Crisantaspase (recombinant Erwinia asparaginase)", brand: "Enrylaze", aka: ["crisantaspase", "Enrylaze", "recombinant Erwinia chrysanthemi asparaginase", "JZP-458"], status: "approved",
    modality: "Enzyme therapy (recombinant asparaginase)", mechanism: "Asparaginase enzyme that depletes circulating asparagine, on which lymphoblasts depend; the recombinant Erwinia enzyme is given to patients who have reacted to or silently inactivated E. coli-derived asparaginase (indication wording, EMA).",
    tldr: "Enrylaze is a replacement asparaginase for children and adults with acute lymphoblastic leukaemia or lymphoblastic lymphoma whose bodies have reacted against, or quietly neutralised, the usual E. coli asparaginase. It keeps the asparagine-starving part of their chemotherapy going.",
    summary: "Crisantaspase (Enrylaze) is authorised in the EU since 15 September 2023 (CHMP opinion 20 July 2023; marketing authorisation holder Jazz Pharmaceuticals Ireland Limited) as a component of a multi-agent chemotherapeutic regimen for acute lymphoblastic leukaemia and lymphoblastic lymphoma in adults and children from one month of age who have developed hypersensitivity or silent inactivation to E. coli-derived asparaginase. It is under additional monitoring in the EU. The class record `asparaginase` covers pegaspargase, calaspargase pegol and the native Erwinia enzyme; this record is the recombinant Erwinia product.",
    approvals: [{ region: "EU", year: 2023, indication: "ALL and lymphoblastic lymphoma, in a multi-agent regimen, after hypersensitivity or silent inactivation to E. coli-derived asparaginase (adults and children from 1 month)", note: "Authorised 15 Sep 2023; Jazz Pharmaceuticals Ireland" }],
    cancers: ["all-leukemia", "all-paediatric-standard-risk", "all-paediatric-high-risk"], companies: ["jazz"], related: ["asparaginase", "eryaspase"],
    links: [{ label: "EMA: Enrylaze (EPAR)", url: EPAR("enrylaze") }] }),

  { ...d({ id: "burosumab", trials: ["ux023t-cl201"], keyPapers: ["paper-ux023t-cl201-jan-de-beur-jbmr-2021"], name: "Burosumab", brand: "Crysvita", aka: ["burosumab", "Crysvita", "KRN23"], status: "approved", tags: ["supportive"],
    modality: "Monoclonal antibody (anti-FGF23)", mechanism: "Antibody to fibroblast growth factor 23; used for FGF23-related hypophosphataemia, including the form caused by phosphate-wasting tumours (tumour-induced osteomalacia), where the tumour cannot be found or removed (indication wording, EMA).",
    tldr: "Crysvita is an antibody for a rare bone-softening condition in which the body leaks phosphate. Some small tumours cause it by making too much of a hormone called FGF23; when the tumour cannot be found or removed, Crysvita blocks the hormone.",
    summary: "Burosumab (Crysvita) has been authorised in the EU since 19 February 2018 (CHMP opinion 14 December 2017; marketing authorisation holder Kyowa Kirin Holdings B.V.; orphan designation) for X-linked hypophosphataemia in children and adolescents aged 1 to 17 with radiographic bone disease and in adults, and for FGF23-related hypophosphataemia in tumour-induced osteomalacia associated with phosphaturic mesenchymal tumours that cannot be curatively resected or localised. The cancer-care indication is the second: it treats the metabolic effect of a tumour rather than the tumour itself.",
    approvals: [{ region: "EU", year: 2018, indication: "X-linked hypophosphataemia; FGF23-related hypophosphataemia in tumour-induced osteomalacia (phosphaturic mesenchymal tumours not curatively resectable or localisable)", note: "Authorised 19 Feb 2018; Kyowa Kirin" }],
    cancers: [], companies: ["kyowa-kirin"],
    links: [{ label: "UX023T-CL201 (J Bone Miner Res 2021)", url: "https://doi.org/10.1002/jbmr.4233" }, { label: "EMA: Crysvita (EPAR)", url: EPAR("crysvita") }, { label: "US label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=102f96a0-6e3a-4fc1-b204-34d604683af6" }] }), asOf: "2026-09-24" },

  { ...d({ id: "epoetin-theta", trials: ["xm01-22"], keyPapers: ["paper-xm01-22-tjulandin-arch-drug-inf-2011"], name: "Epoetin theta", brand: "Eporatio / Biopoin", aka: ["epoetin theta", "Eporatio", "Biopoin"], status: "approved", tags: ["supportive"],
    modality: "Recombinant erythropoietin (erythropoiesis-stimulating agent)", mechanism: "Recombinant human erythropoietin that acts on the erythropoietin receptor to stimulate red-cell production; used for symptomatic anaemia in adults with non-myeloid cancers receiving chemotherapy and in chronic renal failure (indication wording, EMA).",
    tldr: "Epoetin theta is a made-to-order version of erythropoietin, the hormone that tells the marrow to make red blood cells. It is used to treat the anaemia of chemotherapy in people with non-myeloid cancers, sparing some transfusions.",
    summary: "Epoetin theta is authorised in the EU under two names: Biopoin (authorised 23 October 2009; marketing authorisation holder Teva GmbH) and Eporatio (authorised 29 October 2009; marketing authorisation holder Ratiopharm GmbH, a Teva company per Wikidata Q265318). Both are indicated for symptomatic anaemia associated with chronic renal failure in adults and for symptomatic anaemia in adult cancer patients with non-myeloid malignancies receiving chemotherapy. The corpus's other erythropoiesis-stimulating agents are epoetin alfa and darbepoetin alfa.",
    approvals: [{ region: "EU", year: 2009, indication: "Symptomatic anaemia in adult cancer patients with non-myeloid malignancies receiving chemotherapy; anaemia of chronic renal failure", note: "Biopoin authorised 23 Oct 2009 (Teva); Eporatio 29 Oct 2009 (Ratiopharm)" }],
    cancers: [], companies: ["teva"], targets: ["epor"], related: ["epoetin-alfa", "darbepoetin-alfa"], technologies: ["transfusion-support"],
    links: [{ label: "XM01-22 (Archives of Drug Information 2011)", url: "https://doi.org/10.1111/j.1753-5174.2011.00035.x" }, { label: "EMA: Eporatio (EPAR)", url: EPAR("eporatio") }, { label: "EMA: Biopoin (EPAR)", url: EPAR("biopoin") }] }), asOf: "2026-09-24" },

  d({ id: "human-normal-immunoglobulin", name: "Human normal immunoglobulin (IVIg)", brand: "Privigen / Kiovig", aka: ["human normal immunoglobulin (IVIg)", "human normal immunoglobulin", "IVIg", "intravenous immunoglobulin", "Privigen", "Kiovig"], status: "approved", tags: ["supportive"],
    modality: "Pooled human polyclonal IgG antibody preparation (intravenous immunoglobulin)", mechanism: "Replacement of antibodies in patients whose own production has failed; in cancer care, for hypogammaglobulinaemia with recurrent bacterial infections in chronic lymphocytic leukaemia after prophylactic antibiotics have failed and in plateau-phase multiple myeloma after failure to respond to pneumococcal immunisation (indication wording, EMA).",
    tldr: "Intravenous immunoglobulin is pooled antibody from many blood donors. People with chronic lymphocytic leukaemia or myeloma whose own antibody levels have collapsed, and who keep getting bacterial infections despite antibiotics, receive it as replacement.",
    summary: "Human normal immunoglobulin for intravenous use is authorised in the EU as Kiovig (authorised 19 January 2006; marketing authorisation holder Takeda Manufacturing Austria AG) and Privigen (authorised 24 April 2008; CHMP opinion 21 February 2008; marketing authorisation holder CSL Behring GmbH). The replacement-therapy indications include primary immunodeficiency syndromes and, in cancer care, hypogammaglobulinaemia with recurrent bacterial infections in patients with chronic lymphocytic leukaemia in whom prophylactic antibiotics have failed, and in plateau-phase multiple myeloma patients who have failed to respond to pneumococcal immunisation; the products also carry immunomodulation indications outside oncology.",
    approvals: [{ region: "EU", year: 2006, indication: "Replacement therapy in hypogammaglobulinaemia with recurrent bacterial infections in CLL (after failed antibiotic prophylaxis) and plateau-phase multiple myeloma (after failed pneumococcal immunisation); primary immunodeficiency", note: "Kiovig authorised 19 Jan 2006 (Takeda); Privigen 24 Apr 2008 (CSL Behring)" }],
    cancers: ["cll", "multiple-myeloma"], companies: ["csl", "takeda"], technologies: ["rejuv-tx-b-cell-aplasia-and-immunoglobulin"],
    links: [{ label: "EMA: Privigen (EPAR)", url: EPAR("privigen") }, { label: "EMA: Kiovig (EPAR)", url: EPAR("kiovig") }] }),

  d({ id: "fentanyl", name: "Fentanyl (transmucosal, for breakthrough cancer pain)", brand: "Effentora / Instanyl / PecFent", aka: ["fentanyl", "fentanyl citrate", "Effentora", "Instanyl", "PecFent"], status: "approved", tags: ["supportive"],
    modality: "Small-molecule opioid analgesic (buccal tablet and nasal sprays)", mechanism: "Mu-opioid receptor agonist formulated for fast absorption through the mouth or nose, for breakthrough pain in adults already on maintenance opioid therapy for chronic cancer pain (indication wording, EMA).",
    tldr: "These are fast-acting forms of the opioid fentanyl, taken as a tablet against the cheek or as a nasal spray, for sudden flares of pain in people whose cancer pain is otherwise controlled by a regular opioid. They are only for patients already tolerant to opioids.",
    summary: "Three centrally authorised fentanyl products are indicated for breakthrough pain in adults who are already receiving maintenance opioid therapy for chronic cancer pain, breakthrough pain being a transitory exacerbation on a background of otherwise controlled persistent pain: Effentora buccal tablets (authorised 4 April 2008; marketing authorisation holder Phoenix Labs Unlimited Company), Instanyl nasal spray (authorised 20 July 2009; Istituto Gentili S.r.l.) and PecFent nasal spray (authorised 31 August 2010; Gruenenthal GmbH). The EMA lists the therapeutic area as pain. This record covers the cancer-pain formulations only.",
    approvals: [{ region: "EU", year: 2008, indication: "Breakthrough pain in adults receiving maintenance opioid therapy for chronic cancer pain", note: "Effentora authorised 4 Apr 2008 (Phoenix Labs); Instanyl 20 Jul 2009 (Istituto Gentili); PecFent 31 Aug 2010 (Gruenenthal)" }],
    cancers: [], companies: ["gruenenthal"], targets: ["oprm1"], technologies: ["pain-management"], related: ["methylnaltrexone"],
    links: [{ label: "EMA: Effentora (EPAR)", url: EPAR("effentora") }, { label: "EMA: Instanyl (EPAR)", url: EPAR("instanyl") }, { label: "EMA: PecFent (EPAR)", url: EPAR("pecfent") }] }),

  d({ id: "resminostat", name: "Resminostat", brand: "Kinselby", aka: ["resminostat", "resminostat mesilate", "Kinselby", "4SC-201"],
    modality: "Small-molecule HDAC inhibitor", mechanism: "Oral histone deacetylase inhibitor proposed for advanced-stage mycosis fungoides and Sézary syndrome; the EMA's committee adopted a negative opinion on the marketing application (EMA product page).",
    tldr: "Resminostat is an oral drug of the HDAC inhibitor class, proposed for advanced mycosis fungoides and Sézary syndrome, two cutaneous T-cell lymphomas. Europe's medicines committee said no to it in May 2025, so it is not authorised.",
    summary: "Resminostat (Kinselby, applicant 4SC AG, orphan designation) was proposed for the treatment of patients with advanced-stage mycosis fungoides and Sézary syndrome. The CHMP adopted its opinion on 22 May 2025 and the opinion status on the EMA product page is negative, so there is no EU marketing authorisation. The active substance is resminostat mesilate; the EMA lists the therapeutic area as mycosis fungoides. The corpus's approved HDAC inhibitors in cutaneous T-cell lymphoma are romidepsin and vorinostat (target page `hdac`).",
    cancers: ["cutaneous-t-cell-lymphoma"], companies: ["4sc"], targets: ["hdac"], technologies: ["epigenetic-drugs"], related: ["romidepsin"],
    regulatoryEvents: [{ date: "2025-05-22", type: "crl", region: "EU", note: "CHMP negative opinion on Kinselby (resminostat) for advanced mycosis fungoides and Sézary syndrome", source: EPAR("kinselby") }],
    links: [{ label: "EMA: Kinselby (EPAR)", url: EPAR("kinselby") }] }),

  d({ id: "tacquell", name: "Tacquell (autologous melanoma-derived tumour-infiltrating lymphocytes)", brand: "Tacquell", aka: ["Autologous melanoma-derived tumor infiltrating lymphocytes, ex vivo-expanded"],
    modality: "TIL cell therapy (autologous tumour-infiltrating lymphocytes, ex vivo expanded)", mechanism: "A patient's own tumour-infiltrating lymphocytes are taken from a melanoma deposit, expanded outside the body and returned; the EMA's committee adopted a negative opinion on the application for melanoma (EMA product page).",
    tldr: "Tacquell is a tumour-infiltrating lymphocyte therapy for melanoma developed by the Netherlands Cancer Institute, the academic group whose randomised trial first showed TIL therapy could beat ipilimumab. Europe's medicines committee gave it a negative opinion in June 2026, so it is not authorised.",
    summary: "Tacquell (EMA product number EMEA/H/C/006563; marketing authorisation applicant Netherlands Cancer Institute) is described in the EMA register as autologous melanoma-derived tumour-infiltrating lymphocytes, ex vivo expanded, for the treatment of melanoma. The CHMP adopted its opinion on 25 June 2026 and the opinion status on the product page is negative, so there is no EU marketing authorisation. It is an academic TIL product; the linked key paper is the Netherlands Cancer Institute's randomised phase 3 trial of TIL therapy against ipilimumab (NCT02278887). The only other TIL product with a regulatory history in the corpus is lifileucel (Amtagvi), whose EU application was withdrawn in 2025.",
    cancers: ["melanoma", "advanced-melanoma"], institutions: ["nki"], technologies: ["til-therapy"], related: ["lifileucel", "ipilimumab"], keyPapers: ["paper-rohaas-til-vs-ipilimumab-nejm-2022"],
    regulatoryEvents: [{ date: "2026-06-25", type: "crl", region: "EU", note: "CHMP negative opinion on Tacquell (autologous TIL) for melanoma; applicant Netherlands Cancer Institute", source: EPAR("tacquell") }],
    links: [{ label: "EMA: Tacquell (EPAR)", url: EPAR("tacquell") }] }),
];

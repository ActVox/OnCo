import type { EntityInput, TechnologyInput, TermInput } from "@/lib/schema";
import type { EvidenceGrade } from "@/lib/complementary";

/**
 * HAIR: WHAT TREATMENT TAKES, WHAT COMES BACK, AND WHAT HELPS. Facts checked 2 October 2026.
 *
 * The deep layer behind /live/hair/. The corpus already holds scalp cooling (technologies.ts), minoxidil for
 * persistent and endocrine-therapy thinning, bimatoprost for lashes and wigs and cranial prostheses
 * (complementary.ts), so nothing here repeats them: this file adds the records those four did not cover.
 *
 *  - Six glossary terms for the things that happen, which patients are least warned about: anagen effluvium
 *    (why it falls out and why it comes back), the regrowth that is a different texture and colour, loss of
 *    eyebrows and eyelashes, persistent chemotherapy-induced alopecia, endocrine-therapy-induced alopecia and
 *    persistent radiation-induced alopecia.
 *  - Seven graded approaches people are offered or sold, each tagged `evidence:<grade>` on the model in
 *    src/lib/complementary.ts and entered in COMPLEMENTARY_INDEX: scalp care, camouflage and restoration,
 *    platelet-rich plasma, low-level light, the antiandrogens, the supplements, and the creams that were
 *    trialled to prevent loss and did not. Where there is no reliable human evidence the grade is
 *    `insufficient` and the record says so; where trials were run and found nothing it is `no-benefit`. They
 *    are here because a reader who finds nothing finds the advertisement instead.
 *
 * Two things this file is careful not to say, both checked on 2 October 2026. There is no completed Cochrane
 * review of scalp cooling: CD016196 is a protocol with no results. And neither MASCC nor ASCO has a guideline
 * on alopecia; the ESMO 2021 dermatological toxicities guideline is the only one, and it is named rather than
 * folded into "the guidelines".
 *
 * Every number is the number the linked primary source states, checked against the abstract or the page itself.
 * Where a source gives no number, none is given. British spelling, no em-dashes.
 */

const asOf = "2026-10-02";
/** The Recovery and Rejuvenation front (record owned by the section pass of this round). */
const REJ = "rejuvenation";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const doi = (label: string, d: string) => ({ label, url: `https://doi.org/${d}` });

// ---------------------------------------------------------------- the primary sources, each resolved before use
/** Nangia et al., SCALP randomised trial. PMID 28196254. */
export const SCALP_2017 = doi("Nangia et al., effect of a scalp cooling device on alopecia in women undergoing chemotherapy for breast cancer: the SCALP randomised clinical trial (JAMA 2017)", "10.1001/jama.2016.20939");
/** Rugo et al., DigniCap prospective cohort with concurrent controls. PMID 28196257. */
export const DIGNICAP_2017 = doi("Rugo et al., association between use of a scalp cooling device and alopecia after chemotherapy for breast cancer (JAMA 2017)", "10.1001/jama.2016.21038");
/** Rugo, Melin and Voigt, scalp metastases meta-analysis. */
export const SCALP_METS_2017 = doi("Rugo, Melin and Voigt, scalp cooling with adjuvant or neoadjuvant chemotherapy for breast cancer and the risk of scalp metastases: systematic review and meta-analysis (Breast Cancer Research and Treatment 2017)", "10.1007/s10549-017-4185-9");
/** Kang et al., 3-year prospective cohort of permanent chemotherapy-induced alopecia. PMID 30120165. */
export const KANG_2019 = doi("Kang et al., permanent chemotherapy-induced alopecia in patients with breast cancer: a 3-year prospective cohort study (The Oncologist 2019)", "10.1634/theoncologist.2018-0184");
/** Freites-Martinez et al., quality of life and treatment outcomes in persistent post-chemotherapy alopecia. PMID 30840033. */
export const PCIA_2019 = doi("Freites-Martinez et al., assessment of quality of life and treatment outcomes of patients with persistent post-chemotherapy alopecia (JAMA Dermatology 2019)", "10.1001/jamadermatol.2018.5071");
/** Freites-Martinez et al., endocrine therapy-induced alopecia. PMID 29641806. */
export const EIA_2018 = doi("Freites-Martinez et al., endocrine therapy-induced alopecia in patients with breast cancer (JAMA Dermatology 2018)", "10.1001/jamadermatol.2018.0454");
/** Phillips et al., persistent radiation-induced alopecia. PMID 32756880. */
export const PRIA_2020 = doi("Phillips et al., assessment and treatment outcomes of persistent radiation-induced alopecia in patients with cancer (JAMA Dermatology 2020)", "10.1001/jamadermatol.2020.2127");
/** Lawenda et al., dose-response for permanent alopecia after cranial irradiation. PMID 15465206. */
export const LAWENDA_2004 = doi("Lawenda et al., permanent alopecia after cranial irradiation: dose-response relationship (International Journal of Radiation Oncology, Biology, Physics 2004)", "10.1016/j.ijrobp.2004.04.031");
/** Duvic et al., randomised trial of topical minoxidil during chemotherapy. PMID 8682968. */
export const DUVIC_1996 = doi("Duvic et al., a randomised trial of minoxidil in chemotherapy-induced alopecia (Journal of the American Academy of Dermatology 1996)", "10.1016/S0190-9622(96)90500-9");
/** Freites-Martinez et al., continuing education review of hair disorders in survivors. PMID 29660423. */
export const JAAD_SURVIVORS_2019 = doi("Freites-Martinez et al., hair disorders in cancer survivors (Journal of the American Academy of Dermatology 2019)", "10.1016/j.jaad.2018.03.056");
/** Ross and Fischer-Cartlidge, nursing literature review of scalp cooling. PMID 28315539. */
export const CJON_2017 = doi("Ross and Fischer-Cartlidge, scalp cooling: a literature review of efficacy, safety and tolerability for chemotherapy-induced alopecia (Clinical Journal of Oncology Nursing 2017)", "10.1188/17.CJON.226-233");

/** Lacouture et al., ESMO Clinical Practice Guidelines on dermatological toxicities: the only guideline that speaks to hair. PMID 33248228. */
export const ESMO_DERM_2021 = doi("Lacouture et al., prevention and management of dermatological toxicities related to anticancer agents: ESMO Clinical Practice Guidelines (Annals of Oncology 2021)", "10.1016/j.annonc.2020.11.005");
/** Freites-Martinez et al., international Delphi consensus on persistent chemotherapy-induced alopecia. PMID 40923546. */
export const DELPHI_2025 = doi("Freites-Martinez et al., expert consensus for prevention, diagnosis and management of persistent chemotherapy-induced alopecia (Journal of the European Academy of Dermatology and Venereology 2025)", "10.1111/jdv.70021");
/** Rossi et al., randomised split-scalp pilot of platelet-rich plasma. PMID 40626588. */
export const PRP_2026 = doi("Rossi et al., platelet-rich plasma treatment for endocrine-induced alopecia and persistent chemotherapy-induced alopecia, a randomised controlled pilot study (Dermatologic Surgery 2026)", "10.1097/DSS.0000000000004755");
/** Claes et al., photobiomodulation added to scalp cooling. PMID 40705170. */
export const PBM_CLAES_2025 = doi("Claes et al., photobiomodulation therapy in the prevention of chemotherapy-induced alopecia in breast cancer patients, randomised trial (Lasers in Medical Science 2025)", "10.1007/s10103-025-04577-7");
/** Lodewijckx et al., HAIRLASER randomised trial of photobiomodulation after chemotherapy. PMID 37060420. */
export const PBM_HAIRLASER_2023 = doi("Lodewijckx et al., photobiomodulation therapy for the management of chemotherapy-induced alopecia, a randomised controlled trial (Supportive Care in Cancer 2023)", "10.1007/s00520-023-07743-1");
/** Elad et al., MASCC/ISOO mucositis guidelines, the source of the caution on light therapy near a tumour. PMID 32786044. */
export const MASCC_ISOO_2020 = doi("Elad et al., MASCC/ISOO clinical practice guidelines for the management of mucositis secondary to cancer therapy (Cancer 2020)", "10.1002/cncr.33100");
/** Rozner et al., systematic review of antiandrogen safety in breast cancer. PMID 30467659. */
export const ROZNER_2019 = doi("Rozner et al., safety of 5-alpha-reductase inhibitors and spironolactone in breast cancer patients receiving endocrine therapies: systematic review (Breast Cancer Research and Treatment 2019)", "10.1007/s10549-018-4996-3");
/** Alanazi et al., meta-analysis of commercial hair-growth supplements (not in cancer). PMID 41954038. */
export const SUPPLEMENTS_2026 = doi("Alanazi et al., evaluating the effectiveness of commercial oral supplements for hair growth: systematic review and meta-analysis (Journal of Cosmetic Dermatology 2026)", "10.1111/jocd.70817");
/** Patel et al., review of biotin for hair loss: eighteen case reports, no trial. PMID 28879195. */
export const BIOTIN_REVIEW_2017 = doi("Patel et al., a review of the use of biotin for hair loss (Skin Appendage Disorders 2017)", "10.1159/000462981");
/** Shin et al., meta-analysis of interventions to prevent chemotherapy-induced alopecia. PMID 25081068. */
export const SHIN_2015 = doi("Shin et al., efficacy of interventions for prevention of chemotherapy-induced alopecia: systematic review and meta-analysis (International Journal of Cancer 2015)", "10.1002/ijc.29115");
/** Bleiker et al., randomised trial of topical calcipotriol to prevent chemotherapy alopecia. PMID 16029334. */
export const BLEIKER_2005 = doi("Bleiker et al., atrophic telogen effluvium from cytotoxic drugs and a randomised controlled trial of topical calcipotriol (British Journal of Dermatology 2005)", "10.1111/j.1365-2133.2005.06608.x");
/** Kuo et al., the largest series of low-dose oral minoxidil in cancer survivors. PMID 39097564. */
export const KUO_2024 = doi("Kuo et al., oral minoxidil for late alopecia in cancer survivors (Breast Cancer Research and Treatment 2024)", "10.1007/s10549-024-07440-5");

export const FDA_BIOTIN_TROPONIN = { label: "US Food and Drug Administration: biotin interference with troponin lab tests, assays subject to biotin interference", url: "https://www.fda.gov/medical-devices/in-vitro-diagnostics/biotin-interference-troponin-lab-tests-assays-subject-biotin-interference" };
export const FDA_BIOTIN_2019_ARCHIVE = { label: "US Food and Drug Administration safety communication, 5 November 2019: the FDA warns that biotin may interfere with lab tests (archived; removed from fda.gov)", url: "http://web.archive.org/web/20220619010658/https://www.fda.gov/medical-devices/safety-communications/update-fda-warns-biotin-may-interfere-lab-tests-fda-safety-communication" };
export const NCI_HAIR_LOSS = { label: "National Cancer Institute: hair loss (alopecia) and cancer treatment", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" };
export const ACS_HAIR_LOSS = { label: "American Cancer Society: hair loss", url: "https://www.cancer.org/cancer/managing-cancer/side-effects/hair-skin-nails/hair-loss.html" };
export const MACMILLAN_HAIR_LOSS = { label: "Macmillan Cancer Support: hair loss", url: "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/hair-loss" };

// =============================================================================
// TERMS: the things that happen, named
// =============================================================================
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });

const hairTerms: TermInput[] = [
  term({
    id: "hair-anagen-effluvium", name: "Anagen effluvium (chemotherapy hair loss)", category: "Side effects",
    aka: ["anagen effluvium", "chemotherapy-induced alopecia", "CIA", "chemo hair loss"],
    sections: [REJ, "supportive-care", "chemotherapy"],
    tldr: "The sudden shedding that starts two to three weeks after chemotherapy begins, because the drug stops hair follicles mid-growth and the shaft snaps off at the scalp. The follicle itself usually survives, which is why hair almost always comes back.",
    summary: "Most scalp follicles are in anagen, the growing phase, at any one time, and the matrix cells at the base of a growing follicle divide faster than almost any other cell in the body. A drug that kills dividing cells therefore hits them hard: the hair shaft narrows where growth stopped, breaks at that point, and the hair falls as a crop rather than gradually. That is anagen effluvium, and the two to three week delay is the time it takes the weakened shaft to reach the surface. It is distinct from telogen effluvium, the slower, partial shedding that follows surgery, severe illness, anaesthesia or weight loss and which many people also have after a cancer diagnosis. Because the stem cells in the bulge of the follicle are usually spared, regrowth begins within weeks of the last dose in most people. Where those stem cells are damaged, by high cumulative taxane exposure or by transplant conditioning, regrowth is incomplete and the result is persistent chemotherapy-induced alopecia. Scalp cooling works on this mechanism by narrowing scalp vessels while drug levels in the blood are highest.",
    wikipedia: W("Anagen_effluvium"),
    technologies: ["scalp-cooling", "cytotoxic-chemotherapy", "minoxidil-chemotherapy-alopecia"],
    related: ["alopecia-persistent-chemotherapy", "alopecia-endocrine-therapy", "alopecia-radiotherapy-persistent", "hair-regrowth-after-chemotherapy", "hair-brows-and-lashes", "late-effects"],
    links: [JAAD_SURVIVORS_2019, NCI_HAIR_LOSS],
  }),

  term({
    id: "hair-regrowth-after-chemotherapy", name: "Regrowth after chemotherapy (chemo curls)", category: "Side effects",
    aka: ["chemo curls", "chemo curl", "hair regrowth after chemotherapy"],
    sections: [REJ, "supportive-care", "chemotherapy"],
    tldr: "Hair usually starts to come back two to three months after the last dose of chemotherapy, and it often comes back a different texture or colour: straight hair curly, dark hair grey or white. Most of that settles over the following year or two.",
    summary: "The National Cancer Institute's guidance says hair often grows back two to three months after chemotherapy ends, that it is very fine at first, and that it can be curlier or straighter, or even a different colour, before returning in time to how it was. The curl that gives the change its popular name comes from the follicle regenerating with a different shaft shape; the colour change comes from pigment cells in the follicle recovering more slowly than the keratin-producing cells, so the first growth can be grey or white before pigment returns. Order matters: scalp hair usually returns first, then eyebrows and eyelashes, then body hair, over roughly six to twelve months. Colouring and perming are usually deferred until the new hair is a few centimetres long and the scalp is no longer tender, with a patch test first, because new hair is finer and the scalp is more easily irritated. If density has not recovered a year after the last dose, that is the point at which a dermatology referral is worth asking for, because persistent chemotherapy-induced alopecia is a recognised diagnosis with treatment options and because easily corrected causes such as iron deficiency and thyroid disease should be excluded.",
    technologies: ["minoxidil-chemotherapy-alopecia", "wigs-cranial-prosthesis"],
    related: ["hair-anagen-effluvium", "alopecia-persistent-chemotherapy", "hair-brows-and-lashes"],
    links: [NCI_HAIR_LOSS, ACS_HAIR_LOSS, MACMILLAN_HAIR_LOSS],
  }),

  term({
    id: "hair-brows-and-lashes", name: "Eyebrow and eyelash loss (madarosis)", category: "Side effects",
    aka: ["madarosis", "eyelash loss", "eyebrow loss", "lash loss"],
    sections: [REJ, "supportive-care", "chemotherapy"],
    tldr: "Eyebrows and eyelashes usually fall later than scalp hair and come back later, and their absence is felt more than people expect, because they frame the face and keep dust and sweat out of the eyes.",
    summary: "Brow and lash follicles spend a much shorter share of their cycle in the growing phase than scalp follicles do, so they are hit later in a course of chemotherapy and often only partly. Losing them changes the face more than the loss of scalp hair does, and it removes a mechanical defence: without lashes the eye collects dust and grit, and without brows sweat runs into the eyes. Practical measures are wraparound glasses outdoors, preservative-free artificial tears, and brow pencils, powders and stencils, which the Look Good Feel Better workshops teach free of charge. Bimatoprost, a prostaglandin analogue drop approved for thin lashes, has randomised evidence including a cohort who had finished chemotherapy; eyebrow use is off-label and less well studied. Semi-permanent tattooing and microblading of brows are usually deferred until blood counts have recovered and done by a practitioner told about the treatment, because of infection risk. A separate and opposite problem belongs here: epidermal growth factor receptor inhibitors such as erlotinib and osimertinib can make eyelashes grow abnormally long and stiff (trichomegaly) so that they scratch the eye, which an optometrist or ophthalmologist trims.",
    wikipedia: W("Madarosis"),
    technologies: ["bimatoprost-eyelash-regrowth", "wigs-cranial-prosthesis"],
    drugs: ["erlotinib", "osimertinib", "docetaxel", "paclitaxel"],
    related: ["hair-regrowth-after-chemotherapy", "hair-anagen-effluvium"],
    links: [JAAD_SURVIVORS_2019, ACS_HAIR_LOSS],
  }),

  term({
    id: "alopecia-persistent-chemotherapy", name: "Persistent chemotherapy-induced alopecia", category: "Side effects",
    aka: ["persistent chemotherapy-induced alopecia", "permanent chemotherapy-induced alopecia", "pCIA", "PCIA", "permanent alopecia after chemotherapy"],
    sections: [REJ, "supportive-care", "chemotherapy"],
    tldr: "Hair that has not returned to its old density six months or more after chemotherapy ended. It is the effect patients are least often warned about beforehand, it is commonest after taxanes and after transplant conditioning, and it is usually thinning rather than baldness.",
    summary: "Persistent, sometimes called permanent, chemotherapy-induced alopecia is incomplete regrowth that lasts beyond six months after the last dose. In a prospective Korean cohort of 61 women with breast cancer whose hair density and thickness were measured before chemotherapy and who were followed for three years (Kang et al., The Oncologist 2019), 39.5 per cent met the definition at six months and 42.3 per cent at three years; those who had a taxane-based regimen were more likely to be affected, and at three years the problems participants reported were hair thinning (75.0 per cent), reduced hair volume (53.9 per cent), hair loss (34.6 per cent) and grey hair (34.6 per cent). That figure comes from a single-centre cohort of 61 people and should be read as what careful measurement finds rather than as a population rate; clinic series that count only those who seek help report far less.\n\nIn the largest treated series, a retrospective cohort of 192 women across three centres (Freites-Martinez et al., JAMA Dermatology 2019), 98 had persistent chemotherapy-induced alopecia and taxanes were the agent involved in 80 of them (82 per cent). Compared with women whose thinning came from endocrine therapy, their alopecia was more often diffuse (41 per cent versus 25 per cent) and more often graded moderate (39 per cent versus 13 per cent). After treatment with topical minoxidil or spironolactone, moderate to significant improvement was seen in 36 of 54 patients (67 per cent). High-dose conditioning for stem cell transplantation, particularly busulfan-containing regimens, is the other recognised cause.\n\nWhat to do about it is well enough established to be worth asking for and not well enough established to promise: a dermatology referral to exclude iron deficiency, thyroid disease and the pattern hair loss that many people would have developed anyway; topical minoxidil, with the series above behind it; and camouflage. Scalp cooling, which reduces the dose reaching the follicle, is being examined as a way of reducing the risk, but no trial has yet reported persistent alopecia as a primary endpoint.",
    technologies: ["minoxidil-chemotherapy-alopecia", "scalp-cooling", "cytotoxic-chemotherapy"],
    drugs: ["docetaxel", "paclitaxel", "busulfan", "cyclophosphamide"],
    related: ["hair-anagen-effluvium", "alopecia-endocrine-therapy", "alopecia-radiotherapy-persistent", "late-effects"],
    links: [KANG_2019, PCIA_2019, JAAD_SURVIVORS_2019],
  }),

  term({
    id: "alopecia-endocrine-therapy", name: "Endocrine-therapy-induced alopecia", category: "Side effects",
    aka: ["endocrine therapy-induced alopecia", "EIA", "aromatase inhibitor hair thinning", "tamoxifen hair thinning"],
    sections: [REJ, "supportive-care", "hormonal"],
    tldr: "Gradual thinning at the parting and crown that builds over months on tamoxifen, an aromatase inhibitor or ovarian suppression. It is not the sudden shedding of chemotherapy, it lasts as long as the treatment does, and it is often dismissed because it is mild on a clinician's scale and not on the patient's.",
    summary: "In the series that first described it systematically, 112 women with breast cancer seen at a dermatology service for hair loss on endocrine therapy (Freites-Martinez et al., JAMA Dermatology 2018), the alopecia was attributed to an aromatase inhibitor in 75 (67 per cent) and to tamoxifen in 37 (33 per cent). The pattern was that of androgenetic alopecia: widening of the parting, thinning at the crown, miniaturised hairs on trichoscopy, rather than the diffuse shedding of chemotherapy. Severity was graded 1, the mildest band, in 96 of 104 patients (92 per cent). The quality-of-life measurement is the point of the paper: despite that mildness the Hairdex emotion score was 41.8 (standard deviation 21.3), a significant negative effect, which is the gap between how the problem is scored in clinic and how it is lived.\n\nAfter topical minoxidil, moderate or significant improvement was observed in 37 of 46 patients (80 per cent). In the later three-centre cohort (JAMA Dermatology 2019), 32 of 42 women with endocrine-therapy alopecia (76 per cent) improved moderately or significantly on topical minoxidil or spironolactone. These are uncontrolled series in people who sought dermatological help, not randomised trials, and some improvement over months would be expected without treatment.\n\nThe decision that matters more than any of this is adherence. Five years of adjuvant endocrine therapy substantially reduces recurrence and death from hormone-receptor-positive breast cancer, and stopping it to protect hair trades a visible problem for an invisible one. Switching between tamoxifen and an aromatase inhibitor, or between aromatase inhibitors, is a conversation to have with the oncologist rather than a decision to make alone. Scalp cooling has no role here: the drug is taken daily for years, not infused over hours.",
    technologies: ["minoxidil-chemotherapy-alopecia", "endocrine-therapy"],
    drugs: ["tamoxifen", "letrozole", "exemestane", "anastrozole"],
    related: ["alopecia-persistent-chemotherapy", "hair-anagen-effluvium"],
    links: [EIA_2018, PCIA_2019, JAAD_SURVIVORS_2019],
  }),

  term({
    id: "alopecia-radiotherapy-persistent", name: "Persistent radiation-induced alopecia", category: "Side effects",
    aka: ["persistent radiation-induced alopecia", "permanent radiation alopecia", "radiotherapy hair loss"],
    sections: [REJ, "supportive-care", "radiation"],
    tldr: "Radiotherapy takes hair only where the beam passes through the scalp, and whether it returns depends on the dose the follicles received. Below a threshold it regrows in months; above it, the patch can stay thin for good.",
    summary: "Radiation alopecia is local, not systemic: hair falls from the area the beam enters and leaves, beginning two to three weeks into treatment. The National Cancer Institute's guidance says hair often grows back three to six months after radiotherapy ends, and that after a very high dose it may grow back thinner or not at all in the treated area.\n\nThe dose relationship has been measured twice. Lawenda and colleagues (2004) scored 61 scalp regions in 26 patients after cranial irradiation and found that permanent alopecia correlated with the calculated follicle dose and with nothing else they tested, not age, sex, family history of baldness, smoking, diabetes or beam energy. In a later cohort of 71 children and adults treated for central nervous system tumours or head and neck sarcoma (Phillips et al., JAMA Dermatology 2020), the median estimated scalp dose was 39.6 Gy and the dose at which half of patients were estimated to have moderate (grade 2) alopecia was 36.1 Gy (95 per cent confidence interval 33.7 to 39.6 Gy); higher dose and proton irradiation were each associated with greater severity. Of 34 patients treated with topical minoxidil 5 per cent, 28 (82 per cent) responded, and a small number were helped by hair transplantation or surgical reconstruction.\n\nThe practical consequence is a question for the radiotherapy planning team rather than a treatment: what dose does this plan deliver to the scalp, and can the beam arrangement reduce it without compromising the tumour. Scalp-sparing intensity-modulated planning is used where tumour position allows.",
    technologies: ["imrt-igrt", "proton-therapy", "minoxidil-chemotherapy-alopecia"],
    related: ["alopecia-persistent-chemotherapy", "late-effects"],
    links: [PRIA_2020, LAWENDA_2004, NCI_HAIR_LOSS],
  }),
];

// =============================================================================
// GRADED APPROACHES: what is offered or sold for regrowth
// =============================================================================
const SEC = "supportive-care";
const T = (grade: EvidenceGrade, extra: string[] = []) => ["complementary", "supportive-care", "hair-loss", `evidence:${grade}`, ...extra];
const tech = (x: Omit<TechnologyInput, "kind" | "asOf">): TechnologyInput => ({ kind: "technology", asOf, ...x });

const hairApproaches: TechnologyInput[] = [
  tech({
    id: "scalp-care-cancer-treatment", name: "Scalp care during and after cancer treatment", sections: [REJ, SEC, "chemotherapy", "radiation"],
    status: "established", wikipedia: W("Scalp"), tags: T("moderate"),
    tldr: "A bare scalp burns in sun it has never met, loses heat fast in cold, and is more easily irritated while treatment is going on. The measures are small and free, and they are the part of hair loss a person can act on from the first week.",
    summary: "The National Cancer Institute's guidance for people losing hair to cancer treatment is specific and worth following literally: treat the hair gently, with a soft-bristled brush or wide-tooth comb; wash with a mild shampoo, less often and gently, patting dry with a soft towel; avoid hair dryers, irons, gels and clips that can hurt the scalp; use sunscreen or a hat outdoors; keep the head warm with a comfortable covering; and use lotion or conditioner if the scalp itches or feels tender. Some people cut their hair short before it starts to fall so the change is less abrupt, and those who shave are advised to use an electric shaver rather than a blade. During radiotherapy to the head the same gentleness applies to irradiated skin, which is more fragile than it looks and should be washed with lukewarm water and a mild soap rather than scrubbed.\n\nWhen hair starts to grow back, the same source asks for gentleness again: less brushing, curling and blow-drying, and less frequent washing. Colouring and perming are generally left until the new hair is a few centimetres long and the scalp is comfortable, with a patch test first, because new growth is finer and the skin beneath it is more reactive. None of this has been through a randomised trial, which is why the grade here is moderate rather than strong: it is consistent advice from the cancer institutes and from dermatology practice, resting on the physiology of a scalp with no hair on it, not on a controlled comparison.",
    principle: "Hair shields the scalp from ultraviolet light, abrasion and heat loss. Removing it exposes skin that has never been conditioned to any of the three, at a time when treatment has also made that skin more reactive and slower to repair.",
    strengths: ["Free, immediate and entirely under the reader's control", "Consistent guidance from the National Cancer Institute, the American Cancer Society and Macmillan", "Prevents sunburn on skin that has never been exposed"],
    limitations: ["No randomised evidence; this is physiology and consistent practice, not trial data", "Does nothing to prevent or reverse the hair loss itself", "Scalp cooling adds its own requirements, which the unit sets"],
    technologies: ["scalp-cooling", "wigs-cranial-prosthesis", "cytotoxic-chemotherapy", "imrt-igrt"],
    terms: ["hair-anagen-effluvium", "hair-regrowth-after-chemotherapy", "alopecia-radiotherapy-persistent"],
    bottlenecks: ["b-toxicity-qol"],
    links: [NCI_HAIR_LOSS, ACS_HAIR_LOSS, MACMILLAN_HAIR_LOSS],
  }),

  tech({
    id: "hair-camouflage-and-restoration", name: "Camouflage and restoration: fibres, micropigmentation, transplantation", sections: [REJ, SEC],
    status: "established", wikipedia: W("Hair_transplantation"), tags: T("insufficient"),
    tldr: "When density has not come back, the options are to hide the gap or to move hair into it. Keratin fibres and scalp micropigmentation are cheap, immediate and reversible; hair transplantation and surgical reconstruction have been reported in cancer survivors only in small numbers, and no trial compares any of them.",
    summary: "This record covers what is left after minoxidil: concealment and surgery. Keratin or cotton hair-building fibres cling to existing hairs electrostatically and make a thin area read as dense in ordinary light; they wash out, cost little and carry no medical risk beyond the obvious one of a wet day. Scalp micropigmentation tattoos pigment into the scalp to imitate shaved stubble or to reduce the contrast between scalp and hair; it is semi-permanent, needs a practitioner who has been told the medical history, and fades over years. Partial hairpieces, toppers and integration pieces sit between fibres and a full wig and suit a patch of loss, which is the usual pattern after radiotherapy.\n\nSurgical hair restoration in people treated for cancer is reported, but thinly. In the largest published series of persistent radiation-induced alopecia, 71 patients, two responded to hair transplantation and one to plastic surgical reconstruction; those are case numbers, not an evidence base. Transplantation moves follicles from the back of the scalp, which is spared in pattern hair loss but not necessarily spared by chemotherapy or by a radiation field, so whether donor hair will survive is a question for a surgeon who understands what the treatment did. Nothing here has a randomised trial behind it in any population with cancer, which is why the grade is insufficient: not that these do not work, but that nobody has measured them in this setting.",
    principle: "Concealment changes what light does at the scalp, by adding fibre to existing shafts or pigment to bare skin. Restoration moves follicles from an area that still grows into one that does not, and depends on the donor area having been spared.",
    strengths: ["Fibres and micropigmentation are immediate and do not interact with treatment", "Partial pieces suit the patchy loss radiotherapy causes", "Reported success in a small number of survivors after surgery"],
    limitations: ["No controlled study in people treated for cancer", "Transplantation assumes the donor area was spared, which chemotherapy and wide radiation fields may not have done", "Micropigmentation and tattooing break the skin, so timing has to wait for blood counts", "Cost is personal and rarely reimbursed"],
    technologies: ["wigs-cranial-prosthesis", "minoxidil-chemotherapy-alopecia", "scalp-care-cancer-treatment"],
    terms: ["alopecia-persistent-chemotherapy", "alopecia-radiotherapy-persistent"],
    bottlenecks: ["b-toxicity-qol"],
    links: [PRIA_2020, JAAD_SURVIVORS_2019, ACS_HAIR_LOSS],
  }),

  tech({
    id: "hair-platelet-rich-plasma", name: "Platelet-rich plasma for hair after cancer treatment", sections: [REJ, SEC],
    status: "phase-2", wikipedia: W("Platelet-rich_plasma"), tags: T("insufficient"),
    tldr: "Blood is spun to concentrate platelets and injected into the scalp. It is sold widely for hair loss and is expensive. The one randomised study in people treated for cancer injected one half of the scalp and left the other half alone: both halves improved by the same amount.",
    summary: "Platelet-rich plasma is autologous: the patient's blood is centrifuged, the platelet-rich fraction separated, and injected into the scalp, on the reasoning that the growth factors platelets release stimulate follicles. It is offered by dermatology and cosmetic clinics at a price, usually as a course of sessions, and most of the evidence behind those offers comes from androgenetic alopecia rather than from cancer.\n\nUntil recently there was no evidence at all in this group: the 2019 review of hair disorders in cancer survivors stated plainly that there was no reported experience of using platelet-rich plasma to treat alopecia in survivors and that costs may be high. That changed with a single-centre randomised controlled pilot (Rossi et al., Dermatologic Surgery 2026), which enrolled 27 patients, 15 with endocrine-induced alopecia and 12 with persistent chemotherapy-induced alopecia, and used a split-scalp design, treating one side and leaving the other as the control. Global assessment improved by 1.2 points from baseline at week 12 on both the treated and the untreated side, with no significant difference between them. Hair density rose on both sides, by 21 and 16 hairs per square centimetre, again with no significant difference. Quality of life did not improve. Adverse events were grade 1 to grade 3 scalp pain. The authors note that plasma injected into one side may diffuse to the other, which would blunt a real difference, so the result is not proof that it does nothing.\n\nOne finding in that study belongs on a patient page: in 2 of 12 circulating tumour cell assays, malignant cells were detected in the platelet-rich plasma itself. No tumour seeding was observed, and the number is tiny, but anyone considering injecting their own concentrated blood into their scalp after cancer should know it was looked for and found. The grade here is insufficient because the only controlled study in this population is a pilot of 27 people that did not separate treated from untreated scalp, not because the approach has been shown to fail.",
    principle: "Platelets release platelet-derived growth factor, vascular endothelial growth factor and transforming growth factor beta when activated; the proposal is that injecting them around follicles prolongs the growth phase and enlarges miniaturised follicles.",
    strengths: ["Autologous, so no foreign material", "One randomised controlled study now exists in this exact population", "Hair density did rise over twelve weeks, on both sides"],
    limitations: ["The treated and untreated halves of the scalp improved equally", "27 patients, single centre, pilot design", "Scalp pain up to grade 3", "Malignant cells found in the platelet-rich plasma of 2 of 12 patients tested", "Paid for out of pocket in most health systems"],
    technologies: ["minoxidil-chemotherapy-alopecia", "hair-camouflage-and-restoration"],
    terms: ["alopecia-persistent-chemotherapy", "alopecia-endocrine-therapy"],
    institutions: ["mskcc"], bottlenecks: ["b-toxicity-qol"],
    links: [PRP_2026, JAAD_SURVIVORS_2019],
  }),

  tech({
    id: "hair-photobiomodulation", name: "Low-level light therapy (photobiomodulation) for hair", sections: [REJ, SEC, "devices"],
    status: "phase-2", wikipedia: W("Low-level_laser_therapy"), tags: T("insufficient"),
    tldr: "Red and near-infrared light from a cap, comb or in-clinic device, sold for hair growth and tested twice in breast cancer. Adding it to scalp cooling did not improve on scalp cooling alone, and a separate caution applies to shining light at tissue where a tumour may be.",
    summary: "Photobiomodulation delivers non-thermal red or near-infrared light to stimulate mitochondrial activity in the tissue beneath. It has strong evidence in oncology for one thing, oral mucositis, where the MASCC and ISOO guidelines recommend it with specified parameters. Hair is a different question, and the two randomised trials in breast cancer come to different-looking conclusions for different reasons.\n\nThe HAIRLASER trial (Lodewijckx et al., Supportive Care in Cancer 2023) randomised 32 women who had finished anthracycline and taxane chemotherapy to photobiomodulation three times a week for twelve weeks or to no intervention, and reported higher patient-rated hair scores in the treated group one month after chemotherapy. The control arm received nothing at all, with no sham device, so expectation is not separated from effect. The second trial (Claes et al., Lasers in Medical Science 2025) asked the question that matters for prevention: 29 patients on taxane-based chemotherapy received either photobiomodulation plus scalp cooling or scalp cooling alone. Scalp coverage and hair thickness did not differ between the groups, and the authors concluded that adding light did not increase the efficacy of cooling, although quality-of-life scores were higher in the group that received it.\n\nThe safety point is worth stating because it is specific to cancer and absent from the marketing. The MASCC and ISOO mucositis guideline, which recommends photobiomodulation for the mouth, also records that animal data on how light affects tumour behaviour are conflicting and advises clinicians to inform patients of expected benefits and potential risks before treating a region where a tumour is or may be. For the scalp that matters most to people treated for a brain tumour, a scalp cancer or a cancer that can spread to the scalp. The grade is insufficient: two small trials, one without a sham arm and one showing no addition to cooling.",
    principle: "Red and near-infrared photons are absorbed by cytochrome c oxidase in mitochondria, raising ATP production and altering reactive oxygen species and nitric oxide signalling; in hair the proposal is that this pushes resting follicles back into the growth phase.",
    strengths: ["Painless and quick", "Two randomised trials now exist in breast cancer", "Strong evidence for the same technology in oral mucositis, which is why it was tried here"],
    limitations: ["Adding it to scalp cooling did not improve on cooling alone", "The positive trial had no sham arm", "Guideline caution about light delivered where a tumour is or may be", "Home devices are unregulated and sold on evidence from pattern hair loss"],
    technologies: ["photobiomodulation-mucositis", "scalp-cooling", "minoxidil-chemotherapy-alopecia"],
    terms: ["hair-anagen-effluvium", "alopecia-persistent-chemotherapy"],
    institutions: ["mascc"], bottlenecks: ["b-toxicity-qol"],
    links: [PBM_CLAES_2025, PBM_HAIRLASER_2023, MASCC_ISOO_2020],
  }),

  tech({
    id: "hair-antiandrogens-alopecia", name: "Antiandrogens for hair: spironolactone, finasteride, dutasteride", sections: [REJ, SEC, "hormonal"],
    status: "emerging", wikipedia: W("Antiandrogen"), tags: T("insufficient"),
    tldr: "Because hair thinning on endocrine therapy follows the pattern of androgenetic alopecia, the drugs used for that pattern are sometimes added. The evidence in cancer survivors cannot separate them from minoxidil, the one guideline that addresses spironolactone says not to use it routinely, and an expert panel advised against finasteride and dutasteride in breast cancer.",
    summary: "Endocrine therapy lowers oestrogen, which shifts the balance of signals at the follicle towards androgen effects, so the thinning it causes looks like female pattern hair loss. That reasoning is why spironolactone, an aldosterone antagonist with antiandrogen activity, and the 5-alpha-reductase inhibitors finasteride and dutasteride are sometimes prescribed to survivors. The reasoning is sound; the evidence is not there yet, and the guidance points the other way.\n\nOn efficacy, there is one number and it cannot be attributed. In the three-centre cohort of 192 women (JAMA Dermatology 2019), moderate to significant improvement after topical minoxidil or spironolactone was seen in 67 per cent of those with persistent chemotherapy alopecia and 76 per cent of those with endocrine-therapy alopecia; the two drugs are reported together and no part of that belongs to spironolactone alone. No randomised trial of any antiandrogen for cancer-related alopecia exists.\n\nOn safety, a systematic review of 47 studies (Rozner et al., Breast Cancer Research and Treatment 2019) found no evidence of interaction between 5-alpha-reductase inhibitors or spironolactone and the endocrine therapies used in breast cancer, and no consistent evidence of increased breast cancer risk with spironolactone across three studies covering 49,298 patients. It also found that oestrogen levels rose in a minority of women on each drug class, and that the risk of breast cancer with 5-alpha-reductase inhibitors has not been studied. Its conclusion was that spironolactone may be considered for further research, which is not the same as recommending it.\n\nTwo formal positions disagree with prescribing. The ESMO clinical practice guideline on dermatological toxicities states that spironolactone is not recommended because the risk and benefit analysis does not justify its routine use. A 2025 international Delphi consensus of fifteen experts on persistent chemotherapy-induced alopecia emphasised prevention by scalp cooling and early topical or low-dose oral minoxidil, and specifically did not recommend bicalutamide, oral finasteride or dutasteride for breast cancer patients, citing safety concerns. A dermatologist may still reach a different decision for an individual, and that is a conversation to have with the oncologist in the room.",
    principle: "Spironolactone blocks the androgen receptor and reduces androgen production; finasteride and dutasteride block the conversion of testosterone to dihydrotestosterone. Both reduce the androgen signal that miniaturises follicles in pattern hair loss.",
    strengths: ["Mechanism matches the pattern of thinning that endocrine therapy causes", "No interaction with endocrine therapy found in a systematic review of 47 studies", "No consistent breast cancer risk signal for spironolactone across 49,298 patients"],
    limitations: ["No randomised trial in cancer-related alopecia", "The one efficacy figure pools spironolactone with minoxidil and cannot be split", "ESMO recommends against routine spironolactone", "An international expert consensus advised against finasteride and dutasteride in breast cancer", "Finasteride and dutasteride are teratogenic and are not used by anyone who could become pregnant"],
    drugs: ["tamoxifen", "letrozole", "exemestane"],
    technologies: ["minoxidil-chemotherapy-alopecia", "endocrine-therapy"],
    terms: ["alopecia-endocrine-therapy", "alopecia-persistent-chemotherapy"],
    bottlenecks: ["b-toxicity-qol"],
    links: [ESMO_DERM_2021, DELPHI_2025, ROZNER_2019, PCIA_2019],
  }),

  tech({
    id: "hair-supplements-marketed", name: "Supplements sold for hair growth after cancer treatment", sections: [REJ, SEC, "nutrition-lifestyle"],
    status: "negative", wikipedia: W("Dietary_supplement"), tags: T("insufficient"),
    tldr: "Biotin, marine-protein and multi-ingredient capsules are advertised directly to people whose hair has thinned after treatment. No randomised trial of any of them has been run in chemotherapy or endocrine-therapy hair loss. High-dose biotin also distorts hospital blood tests, including the one used to diagnose a heart attack.",
    summary: "Search for hair regrowth after chemotherapy and the results are mostly products. The honest position is short: there is no randomised evidence that any oral supplement helps hair loss caused by cancer treatment, because no such trial has been run. The nearest evidence is in general hair loss rather than in cancer. A 2026 systematic review and meta-analysis of 14 studies and 967 adults with alopecia or hair thinning, testing commercial supplements (Ceramosides, Nutrafol, Nourkrin, Lambdapil, Viviscal, Forti5, Cynatine HNS and others) found a reduction in resting-phase hair density and an increase in growing-phase density, but no significant difference in total hair count, and its authors called for rigorous independent research; many of the underlying trials were funded by the companies selling the products. For biotin specifically, a review found 18 reported cases of its use for hair and nail changes, all in people with an underlying cause of poor growth, and concluded that there is not enough evidence for supplementation in healthy people.\n\nThe only guideline to address this says the same thing gently: the ESMO guideline on dermatological toxicities suggests checking thyroid-stimulating hormone, vitamin D, zinc and ferritin and correcting a deficiency if there is one, and says biotin or orthosilicic acid can be considered as an initial treatment but are not generally recommended. Correcting a measured deficiency is a different matter from taking a supplement because the label mentions hair.\n\nThe reason to grade this rather than ignore it is a specific harm. The United States Food and Drug Administration warned in 2017, and again in 2019, that biotin in a blood sample can cause clinically significant incorrect test results, and singled out troponin, the marker used to diagnose a heart attack: before the 2017 communication it had received a report of one patient taking high levels of biotin who died after a falsely low troponin result. The 2019 update says many dietary supplements promoted for hair, skin and nail benefits contain biotin at up to 650 times the recommended daily intake, that the FDA is aware of many containing 20 mg and some up to 100 mg per pill with instructions to take several a day, and that there is not enough information to know whether stopping biotin for any number of hours before a test prevents the error. Both communications have since been taken off the FDA website and are linked here through the web archive; the FDA's live page on assays subject to biotin interference says it continues to receive reports of falsely low troponin results. People on cancer treatment have frequent blood tests and a raised risk of cardiac events, which is why this belongs on this page and not in a footnote. Tell the team what you take.",
    principle: "Biotin is a cofactor for carboxylase enzymes and a true deficiency causes hair and nail changes, which is the kernel of truth the marketing is built on. The interference with laboratory tests is chemical rather than biological: many immunoassays use a biotin and streptavidin binding step, and excess biotin in the sample competes with it.",
    strengths: ["Correcting a measured iron, vitamin D, zinc or thyroid deficiency is reasonable and has a guideline behind it", "Cheap, and most ingredients are not directly toxic"],
    limitations: ["No randomised trial in chemotherapy or endocrine-therapy hair loss", "Total hair count did not improve in the meta-analysis of commercial supplements in people without cancer", "Many underlying trials are funded by the manufacturer", "High-dose biotin falsifies immunoassay results, troponin among them", "Money spent here is money not spent on a wig or on minoxidil"],
    technologies: ["minoxidil-chemotherapy-alopecia", "dietary-supplements-treatment-interactions"],
    terms: ["alopecia-persistent-chemotherapy", "alopecia-endocrine-therapy"],
    bottlenecks: ["b-misinformation", "b-toxicity-qol"],
    links: [SUPPLEMENTS_2026, BIOTIN_REVIEW_2017, FDA_BIOTIN_TROPONIN, FDA_BIOTIN_2019_ARCHIVE, ESMO_DERM_2021],
  }),

  tech({
    id: "hair-topical-prevention-agents", name: "Creams and lotions tried to prevent chemotherapy hair loss", sections: [REJ, SEC, "chemotherapy"],
    status: "negative", wikipedia: W("Chemotherapy-induced_alopecia"), tags: T("no-benefit"),
    tldr: "Several drugs have been put on the scalp to stop chemotherapy hair loss before it starts: minoxidil lotion, vitamin D analogues, and others. The trials were done and they did not work. Scalp cooling remains the only method cleared by a regulator to prevent it.",
    summary: "This record exists so that the question is answered rather than left open, because it is the first thing people ask and the answer is unwelcome. A meta-analysis of interventions to prevent chemotherapy-induced alopecia (Shin et al., International Journal of Cancer 2015) pooled 8 randomised and 9 controlled trials covering 1,098 participants. Scalp cooling significantly reduced the risk of alopecia, with a relative risk of 0.38 (95 per cent confidence interval 0.32 to 0.45); topical 2 per cent minoxidil and the other interventions tested did not significantly reduce it.\n\nThe individual failures are worth naming. Topical minoxidil was tested for prevention in a randomised trial of 48 women receiving doxorubicin (Rodriguez et al., Annals of Oncology 1994): 88 per cent and 92 per cent of patients in the two arms had severe alopecia, a difference that was not significant. Topical calcipotriol, a vitamin D analogue that protects rodent hair follicles, was tested in a randomised controlled trial in women receiving CMF chemotherapy (Bleiker et al., British Journal of Dermatology 2005) and had no detectable effect on any measure: the proportion with minimal hair loss, shed rates, plucked telogen and fractured hair counts, the shape of shed and plucked hair, regrowth or hair density. An earlier phase 1 study of topical calcitriol found that all 14 patients developed moderate alopecia and that eight developed a toxic rash where the drug had been applied.\n\nNewer topical calcitriol formulations reached phase 1 in taxane-treated patients and were reported as safe, with alopecia of less than 50 per cent in 8 of 23 patients at week 7, but no phase 2 or phase 3 trial of it has been registered. AS101, a tellurium compound, prevented alopecia as an incidental finding in a 44-patient trial designed to test marrow protection, and no trial of it for hair has been registered since. The practical conclusion for a reader is that minoxidil is a treatment for hair that is slow to return, not a shield for hair you still have, and that the only prevention with a regulator behind it is cooling.",
    principle: "Each of these aimed to make the follicle temporarily less vulnerable, by pushing it out of the dividing phase or by local cell-cycle arrest, so that a drug circulating in the blood would do it less damage. Scalp cooling takes the other route, reducing how much of the drug arrives.",
    strengths: ["The question has actually been tested, repeatedly, rather than left to opinion", "Knowing what does not work stops money and hope going to it"],
    limitations: ["Individual trials were small", "Negative results for one dose and schedule do not rule out another", "Newer agents stalled after phase 1 rather than failing outright, which is a different kind of nothing"],
    technologies: ["scalp-cooling", "minoxidil-chemotherapy-alopecia", "cytotoxic-chemotherapy"],
    terms: ["hair-anagen-effluvium"],
    drugs: ["doxorubicin", "docetaxel", "paclitaxel"],
    bottlenecks: ["b-toxicity-qol"],
    links: [SHIN_2015, BLEIKER_2005, ESMO_DERM_2021],
  }),
];

export const hairEntities: EntityInput[] = [...hairTerms, ...hairApproaches];

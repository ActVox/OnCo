/**
 * Hair loss during cancer treatment: which drugs cause it and how much, what prevents or reverses it, how
 * regrowth unfolds, and how wigs and cold caps are paid for. Side data for /live/hair/. Every id named here
 * must exist in the graph (checked by src/lib/complementary.test.ts and at build time by the page).
 *
 * Rates for individual drugs are not written here: the page reads them from each drug record's `toxicity`
 * rows, which carry their own label or trial source. Class-level statements cite NCI, ACS and Macmillan.
 * No invented numbers; where a source gives none, the text says "common", "partial" or "uncommon". UK spelling.
 */
export type Source = { label: string; url: string };

export type AlopeciaDegree = "near-universal" | "common" | "partial" | "uncommon" | "changes";
export const DEGREE_LABEL: Record<AlopeciaDegree, string> = {
  "near-universal": "Complete loss in nearly everyone",
  common: "Complete or marked loss is common",
  partial: "Thinning or partial loss",
  uncommon: "Uncommon or mild",
  changes: "Texture, colour or brow and lash changes",
};
export const DEGREE_ORDER: AlopeciaDegree[] = ["near-universal", "common", "partial", "uncommon", "changes"];

export type HairLossCause = {
  id: string;
  group: string;
  degree: AlopeciaDegree;
  /** Drug ids in the corpus. */
  drugIds: string[];
  /** Technology ids in the corpus (radiotherapy techniques). */
  technologyIds?: string[];
  /** Plain sentence on pattern and timing. */
  note: string;
  /** Whether loss can be permanent, and with what. */
  persistent?: string;
  /** What helps for this class, in one line. */
  helps: string;
  source: Source;
};

const NCI_HAIR: Source = { label: "NCI: hair loss (alopecia) and cancer treatment", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" };
const ACS_HAIR: Source = { label: "American Cancer Society: hair loss", url: "https://www.cancer.org/cancer/managing-cancer/side-effects/hair-skin-nails/hair-loss.html" };
const MACMILLAN_HAIR: Source = { label: "Macmillan Cancer Support: hair loss", url: "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/hair-loss" };
const NHS_WIGS: Source = { label: "NHS: wigs and fabric supports on the NHS", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/wigs-and-fabric-supports-on-the-nhs/" };
const JAAD_2019: Source = { label: "Hair disorders in cancer survivors (J Am Acad Dermatol 2019)", url: "https://doi.org/10.1016/j.jaad.2018.03.056" };
const SCALP_JAMA: Source = { label: "SCALP randomised trial of scalp cooling (JAMA 2017)", url: "https://doi.org/10.1001/jama.2016.20939" };
const DIGNICAP_JAMA: Source = { label: "DigniCap cohort study (JAMA 2017)", url: "https://doi.org/10.1001/jama.2016.21038" };
const ETIA_2018: Source = { label: "Endocrine therapy-induced alopecia in breast cancer (JAMA Dermatol 2018)", url: "https://doi.org/10.1001/jamadermatol.2018.0454" };
const PCIA_JAMADERM_2019: Source = { label: "Freites-Martinez et al., quality of life and treatment outcomes in persistent post-chemotherapy alopecia (JAMA Dermatology 2019)", url: "https://doi.org/10.1001/jamadermatol.2018.5071" };
const PRIA_JAMADERM_2020: Source = { label: "Phillips et al., persistent radiation-induced alopecia in patients with cancer (JAMA Dermatology 2020)", url: "https://doi.org/10.1001/jamadermatol.2020.2127" };
const TDXD_ESMO_OPEN_2026: Source = { label: "Salehi et al., scalp cooling outcomes in patients receiving trastuzumab deruxtecan (ESMO Open 2026)", url: "https://doi.org/10.1016/j.esmoop.2026.107769" };
const BIMATOPROST_RCT: Source = { label: "Bimatoprost for chemotherapy-induced eyelash hypotrichosis, randomised trial (Br J Dermatol 2015)", url: "https://doi.org/10.1111/bjd.13443" };

export const HAIR_LOSS_CAUSES: HairLossCause[] = [
  { id: "anthracyclines", group: "Anthracyclines", degree: "near-universal", drugIds: ["doxorubicin"],
    note: "Doxorubicin and epirubicin, alone or in AC, EC and FEC regimens, cause complete hair loss in almost everyone, starting two to three weeks after the first dose. Pegylated liposomal doxorubicin causes much less.",
    helps: "Scalp cooling works less well with anthracyclines than with taxanes alone; wigs and coverings; regrowth is expected.", source: NCI_HAIR },
  { id: "liposomal-anthracycline", group: "Liposomal anthracycline", degree: "partial", drugIds: ["pegylated-liposomal-doxorubicin"],
    note: "The liposome changes how the drug is distributed, so hair loss is usually mild or partial rather than complete, at the price of hand-foot skin reaction.",
    helps: "Usually needs no specific measure; a shorter style disguises thinning.", source: NCI_HAIR },
  { id: "taxanes", group: "Taxanes", degree: "near-universal", drugIds: ["paclitaxel", "docetaxel", "cabazitaxel"],
    note: "Paclitaxel, docetaxel and cabazitaxel cause complete loss of scalp hair and often body hair, brows and lashes within a few weeks of starting.",
    persistent: "Taxanes are the agents most often linked to persistent chemotherapy-induced alopecia, usually diffuse thinning rather than baldness. In a prospective cohort of 61 women whose hair was measured before chemotherapy, 42.3 per cent met the definition at three years, and taxane-based regimens were the ones most often involved; in the largest treated series, taxanes were the agent in 80 of 98 cases (82 per cent).",
    helps: "Scalp cooling has its best results with taxane-only regimens (about half of women preserved most hair in SCALP); minoxidil for persistent thinning.", source: PCIA_JAMADERM_2019 },
  { id: "alkylators", group: "Alkylating agents", degree: "common", drugIds: ["cyclophosphamide", "ifosfamide", "melphalan"],
    note: "Cyclophosphamide and ifosfamide cause marked loss at standard doses and complete loss at high dose; high-dose melphalan before stem cell transplant causes complete loss.",
    persistent: "High-dose busulfan and cyclophosphamide conditioning for transplant can cause permanent thinning.",
    helps: "Scalp cooling is not used in blood cancers; wigs and coverings; dermatology review if hair has not returned a year on.", source: NCI_HAIR },
  { id: "topoisomerase-vinca", group: "Topoisomerase inhibitors and vinca alkaloids", degree: "common", drugIds: ["etoposide", "platinum-etoposide", "irinotecan", "folfiri", "topotecan", "eribulin", "vincristine", "vinblastine", "vinorelbine"],
    note: "Etoposide, irinotecan, topotecan and eribulin commonly cause marked hair loss; vincristine, vinblastine and vinorelbine more often cause thinning.",
    helps: "Scalp cooling can be offered for solid-tumour regimens; regrowth is expected.", source: NCI_HAIR },
  { id: "antimetabolites-platinum", group: "Antimetabolites and platinum drugs", degree: "uncommon", drugIds: ["fluorouracil", "gemcitabine", "methotrexate", "cisplatin", "carboplatin", "oxaliplatin", "temozolomide", "bendamustine"],
    note: "Fluorouracil, gemcitabine, methotrexate, the platinum drugs, temozolomide and bendamustine given alone cause mild thinning at most; in combination with a taxane or anthracycline the partner drug sets the risk.",
    helps: "Usually no measure needed; check the combination.", source: NCI_HAIR },
  { id: "adcs", group: "Antibody-drug conjugates", degree: "common", drugIds: ["trastuzumab-deruxtecan", "sacituzumab-govitecan", "datopotamab-deruxtecan", "enfortumab-vedotin", "tisotumab-vedotin"],
    note: "Conjugates carrying topoisomerase or microtubule payloads cause hair loss in a third to a half of patients in their pivotal trials (the rate beside each drug is read from its own record). Trastuzumab emtansine and brentuximab vedotin cause it uncommonly.",
    helps: "Scalp cooling is used off-protocol with these regimens, and the one published result is negative: in 40 women on trastuzumab deruxtecan, alopecia of grade 1 or worse occurred in 90 per cent of those who cooled and 75 per cent of those who did not. Minoxidil afterwards.", source: TDXD_ESMO_OPEN_2026 },
  { id: "adcs-low", group: "Antibody-drug conjugates with lower rates", degree: "uncommon", drugIds: ["trastuzumab-emtansine", "brentuximab-vedotin"],
    note: "Alopecia appears in the labels of trastuzumab emtansine and brentuximab vedotin at low rates.",
    helps: "Usually no measure needed.", source: NCI_HAIR },
  { id: "endocrine", group: "Endocrine therapy", degree: "partial", drugIds: ["tamoxifen", "letrozole", "exemestane", "fulvestrant", "goserelin", "leuprolide"],
    note: "Tamoxifen, aromatase inhibitors and ovarian suppression cause gradual thinning in a pattern like female or male pattern hair loss over months to years, not sudden shedding.",
    persistent: "Thinning persists while treatment continues and usually improves after it stops; stopping endocrine therapy early to protect hair raises recurrence risk and should be discussed, never done alone.",
    helps: "Topical minoxidil produced moderate or significant improvement in 37 of 46 treated patients (80 per cent) in the series that described this pattern. Spironolactone is sometimes added, but the ESMO guideline recommends against its routine use.", source: ETIA_2018 },
  { id: "cdk46", group: "CDK4/6 inhibitors", degree: "partial", drugIds: ["palbociclib", "ribociclib", "abemaciclib"],
    note: "About a third of women on palbociclib with letrozole reported hair thinning in the label; ribociclib and abemaciclib are similar. It is thinning, not baldness, and continues through treatment.",
    helps: "Minoxidil; the drugs are taken for years so cooling is not relevant.", source: ETIA_2018 },
  { id: "hedgehog", group: "Hedgehog pathway inhibitors", degree: "common", drugIds: ["vismodegib", "sonidegib"],
    note: "Vismodegib and sonidegib cause hair loss in more than half of patients, alongside muscle cramps and taste loss, because the hedgehog pathway maintains the hair cycle.",
    persistent: "Regrowth after stopping can be slow and incomplete.",
    helps: "Treatment breaks and minoxidil are used; discuss with the prescriber.", source: NCI_HAIR },
  { id: "kinase-inhibitors", group: "Kinase inhibitors", degree: "partial", drugIds: ["sorafenib", "cabozantinib", "regorafenib", "ripretinib", "pemigatinib", "futibatinib"],
    note: "Multikinase inhibitors such as sorafenib, cabozantinib, regorafenib and ripretinib, and FGFR inhibitors, commonly cause thinning; hair may also become curlier or lighter.",
    helps: "Usually tolerable; minoxidil if distressing.", source: JAAD_2019 },
  { id: "egfr-inhibitors", group: "EGFR inhibitors", degree: "changes", drugIds: ["erlotinib", "osimertinib"],
    note: "Erlotinib and osimertinib rarely cause loss but make scalp hair brittle and curly, lengthen eyelashes (trichomegaly) and can inflame the scalp.",
    helps: "Lash trimming by an optician if lashes irritate the eye; scalp care for folliculitis.", source: JAAD_2019 },
  { id: "immunotherapy", group: "Checkpoint immunotherapy", degree: "changes", drugIds: ["pembrolizumab", "nivolumab", "ipilimumab"],
    note: "Checkpoint inhibitors do not cause typical chemotherapy hair loss; a small minority develop patchy alopecia areata, hair whitening or vitiligo-type changes as immune side effects.",
    helps: "Dermatology referral; these changes often accompany a good tumour response.", source: JAAD_2019 },
  { id: "radiotherapy", group: "Radiotherapy to the head", degree: "common", drugIds: [], technologyIds: ["imrt-igrt", "proton-therapy"],
    note: "Hair is lost only where the beam enters or leaves, starting two to three weeks into treatment. Whole-brain radiotherapy affects the whole scalp; focused treatment affects a patch.",
    persistent: "Regrowth depends on the dose the follicles received and, in the study that established the relationship, on nothing else tested. In a cohort of 71 patients treated for central nervous system tumours or head and neck sarcoma the median estimated scalp dose was 39.6 Gy, and the dose at which half were estimated to have moderate alopecia was 36.1 Gy (95 per cent confidence interval 33.7 to 39.6). The National Cancer Institute says hair often grows back three to six months after radiotherapy ends, and that after a very high dose it may grow back thinner or not at all.",
    helps: "Scalp-sparing intensity-modulated or proton plans lower the dose to hair follicles where the tumour allows; ask the radiotherapy team what the plan does to the scalp. Of 34 patients in that cohort treated with topical minoxidil 5 per cent, 28 (82 per cent) responded.", source: PRIA_JAMADERM_2020 },
];

export type HairProblem = {
  id: string;
  title: string;
  /** The problem, one or two plain sentences. */
  problem: string;
  /** Why it happens. */
  mechanism: string;
  /** What works now, one line each. */
  worksNow: string[];
  /** What is being tried, one line each; only things with a registered trial, a published study or a live programme. */
  inProgress: string[];
  /** Entity ids to link (validated). */
  entityIds: string[];
  sources: Source[];
};

export const HAIR_PROBLEMS: HairProblem[] = [
  { id: "prevention", title: "Hair falls out with taxane or anthracycline chemotherapy",
    problem: "Nearly everyone treated with docetaxel, paclitaxel, doxorubicin or epirubicin loses their scalp hair within a few weeks, and many rank it among the worst parts of treatment.",
    mechanism: "Hair matrix cells divide faster than almost any other cell, so drugs that kill dividing cells stop the follicle mid-growth and the shaft breaks off. Cooling the scalp narrows its vessels while the drug is at peak concentration, so far less reaches the follicle.",
    worksNow: [
      "Scalp cooling with a machine-cooled cap (DigniCap, Paxman) or manual gel caps: about half of women on taxane regimens kept most of their hair in the SCALP randomised trial; results are weaker with anthracycline-containing regimens.",
      "Ask which regimen you will have: taxane-only regimens (weekly paclitaxel, docetaxel-cyclophosphamide) respond best; AC or EC followed by a taxane less so; blood cancers are not cooled.",
      "Book the cap for the first cycle; cooling started after hair has begun to shed is less effective.",
      "A wig or covering fitted before the first cycle allows colour matching while hair is still there.",
    ],
    inProgress: [
      "Cooling with the antibody-drug conjugates has now been measured once, and the result was negative: in 40 women on trastuzumab deruxtecan, alopecia of grade 1 or worse occurred in 90 per cent of those who cooled and 75 per cent of those who did not. A Cochrane review of scalp cooling in early breast cancer has published its protocol and no results.",
      "Charities and some health systems are funding machines in more units; OnCo's idea record tracks the case for routine coverage.",
    ],
    entityIds: ["scalp-cooling", "paper-scalp-trial-jama-2017", "wigs-cranial-prosthesis", "idea-moon-hair-preservation-for-all", "docetaxel", "paclitaxel", "doxorubicin"],
    sources: [SCALP_JAMA, DIGNICAP_JAMA] },

  { id: "persistent", title: "Hair has not come back a year after chemotherapy",
    problem: "In some people, most often after a taxane or after high-dose conditioning for transplant, hair regrows thin and does not recover its former density. In the one cohort that measured hair before chemotherapy and followed people for three years, 42.3 per cent met the definition at three years.",
    mechanism: "The stem cells that regenerate the follicle are usually spared, which is why hair returns; when they are damaged, follicles miniaturise and produce fine, sparse hair, resembling pattern hair loss.",
    worksNow: [
      "Dermatology review to exclude other causes that are easy to treat (iron deficiency, thyroid disease, telogen effluvium from illness).",
      "Topical minoxidil, the standard treatment for pattern hair loss: moderate to significant improvement in 36 of 54 treated patients (67 per cent) in the largest series, and in a randomised trial of 22 women during chemotherapy it shortened the period of baldness by a mean of 50.2 days without preventing the loss.",
      "Camouflage: hair fibres, scalp micropigmentation, partial hairpieces and toppers.",
    ],
    inProgress: [
      "Low-dose oral minoxidil now has the largest series behind it: in 216 cancer survivors, photographs showed improvement in 88 of 119 assessed (74 per cent) and trichoscopy showed higher density at the front and back of the scalp. There is still no controlled trial.",
      "Macmillan reports that scalp cooling can help reduce the risk of the permanent hair loss docetaxel can occasionally cause, and that hair grows back faster and stronger in the twelve weeks after treatment in people who cooled. No trial has yet used persistent alopecia as its endpoint.",
    ],
    entityIds: ["minoxidil-chemotherapy-alopecia", "docetaxel", "scalp-cooling", "late-effects"],
    sources: [JAAD_2019, PCIA_JAMADERM_2019] },

  { id: "endocrine", title: "Thinning on tamoxifen, aromatase inhibitors or CDK4/6 inhibitors",
    problem: "Years of endocrine therapy, and the CDK4/6 inhibitors given with it, cause gradual thinning at the parting and crown that is easy to dismiss but affects adherence.",
    mechanism: "Lowering oestrogen shifts the balance toward androgen effects on the follicle, shortening the growth phase in the same pattern as female pattern hair loss; CDK4/6 inhibition slows matrix cell cycling directly.",
    worksNow: [
      "Topical minoxidil produced moderate or significant improvement in 37 of 46 treated patients (80 per cent) with endocrine-therapy-induced alopecia in the series that first described it; low-dose oral minoxidil is an alternative when the lotion is impractical, with case series rather than trials behind it.",
      "Spironolactone is sometimes added, and the ESMO guideline recommends against its routine use because the balance of risk and benefit does not justify it. A systematic review of 47 studies found no interaction with endocrine therapy and no consistent breast cancer risk signal, and stopped short of recommending it.",
      "Do not stop endocrine therapy for hair without a conversation: years of adjuvant treatment substantially reduce recurrence and death, which is a larger thing than the hair. Switching between tamoxifen and an aromatase inhibitor, or between aromatase inhibitors, is sometimes tried.",
    ],
    inProgress: [
      "A 2025 international expert consensus set out what to do and, as importantly, what not to: it recommended scalp cooling for prevention and early topical or low-dose oral minoxidil, and advised against bicalutamide, oral finasteride and dutasteride in breast cancer on safety grounds.",
    ],
    entityIds: ["minoxidil-chemotherapy-alopecia", "endocrine-therapy", "aromatase-inhibitor", "tamoxifen", "letrozole", "exemestane", "palbociclib", "ribociclib", "abemaciclib"],
    sources: [ETIA_2018] },

  { id: "brows-lashes", title: "Eyebrows and eyelashes",
    problem: "Brows and lashes often fall out later than scalp hair and are missed more, because they frame the face and protect the eyes from dust and sweat.",
    mechanism: "Brow and lash follicles cycle more slowly than scalp hair, so they are hit later and regrow later; regrowth usually follows within a few months of the last dose.",
    worksNow: [
      "Bimatoprost 0.03 percent applied nightly along the upper lash line increased lash length and thickness in a randomised trial that included people after chemotherapy; it is a prescription and rarely reimbursed.",
      "Brow pencils, powders and stencils; Look Good Feel Better workshops teach the techniques free.",
      "Wraparound glasses outdoors and preservative-free eye drops protect the eyes while lashes are absent.",
      "Microblading or tattooing is best deferred until blood counts have recovered and with a practitioner who knows the history, because of infection risk.",
    ],
    inProgress: [
      "Off-label bimatoprost for eyebrows is used widely; controlled data are limited to lashes.",
    ],
    entityIds: ["bimatoprost-eyelash-regrowth", "wigs-cranial-prosthesis"],
    sources: [BIMATOPROST_RCT, ACS_HAIR] },

  { id: "radiotherapy", title: "Radiotherapy to the head",
    problem: "Radiotherapy causes hair loss only where the beam passes through the scalp, but after high doses the follicles in that patch may not recover.",
    mechanism: "Ionising radiation damages the dividing matrix and, at higher cumulative doses, the follicle stem cells; below that threshold hair returns in months, above it the loss can be permanent.",
    worksNow: [
      "Ask what the plan does to the scalp: intensity-modulated and proton plans can reduce scalp dose where the tumour position allows.",
      "Gentle scalp care during treatment (no heat styling, mild shampoo) reduces irritation in the treated skin.",
      "Wigs and coverings; partial hairpieces suit a patch of loss.",
    ],
    inProgress: [
      "Scalp-sparing planning techniques for whole-brain and glioma radiotherapy have been reported in small series and are being adopted where they do not compromise tumour coverage.",
    ],
    entityIds: ["imrt-igrt", "proton-therapy"],
    sources: [NCI_HAIR] },

  { id: "cost", title: "Scalp cooling is offered but you have to pay, or is not offered at all",
    problem: "Availability depends on the unit and the payer. Machines cost money and chair time; in the US patients are often charged per cycle, and in the UK provision varies between hospitals.",
    mechanism: "Cooling adds one to two hours to each chemotherapy visit and needs a machine or freezer capacity, which units must fund or find a charity to fund. In the United States the Rapunzel Project puts the cost to a patient at 1,500 to 2,000 dollars for three to four months of manual capping plus dry ice, and 2,000 to 2,500 dollars for machine cooling, and neither manufacturer publishes a price.",
    worksNow: [
      "UK: ask the chemotherapy unit whether it has Paxman or DigniCap machines; many were funded by Walk the Walk, and Macmillan and Cancer Hair Care advise on local access.",
      "US: HairToStay subsidises the cost for people with household income usually at or below 400 per cent of the federal poverty level, up to 1,000 dollars and in some funds 1,500 dollars, one subsidy per person, solid tumours only. The Rapunzel Project helps infusion centres install the biomedical freezers manual caps need, because the caps are used at minus 30 degrees Celsius and ordinary freezers do not reach it.",
      "Manual gel caps can be rented and used with dry ice where no machine exists; they need a helper to change caps every 20 to 30 minutes.",
    ],
    inProgress: [
      "Making cooling routine and funded for every alopecia-inducing regimen is an open idea on OnCo with the case and the barriers set out.",
    ],
    entityIds: ["scalp-cooling", "idea-moon-hair-preservation-for-all", "macmillan-cancer-support"],
    sources: [MACMILLAN_HAIR] },

  { id: "appearance", title: "The distress of looking ill",
    problem: "Hair loss makes cancer visible to everyone, including children and colleagues, before the person is ready to tell them.",
    mechanism: "Body image and control over disclosure are the components of distress that appearance programmes and psychological support target; the hair itself is not the whole problem.",
    worksNow: [
      "A wig on NHS prescription (free in Scotland, Wales and Northern Ireland; a charge in England unless exempt) or by 'cranial prosthesis' prescription in the US; free wigs from the American Cancer Society and local wig banks.",
      "Look Good Feel Better (UK, US and other countries) runs free skincare and make-up workshops for people in treatment.",
      "Psycho-oncology and peer support groups help with the fear and the conversations; CBT-based programmes for body image have randomised support.",
    ],
    inProgress: [
      "Trials of appearance-focused psychological programmes delivered online are collecting body-image outcomes.",
    ],
    entityIds: ["wigs-cranial-prosthesis", "psycho-oncology", "peer-support-groups", "macmillan-cancer-support"],
    sources: [NHS_WIGS, MACMILLAN_HAIR] },
];

export type RegrowthStep = { when: string; what: string; source: Source };
export const REGROWTH_TIMELINE: RegrowthStep[] = [
  { when: "2 to 4 weeks after the first dose", what: "Shedding starts, often suddenly, with tenderness of the scalp; many people cut hair short beforehand so the change is less abrupt.", source: ACS_HAIR },
  { when: "During treatment", what: "Scalp hair is absent or sparse; brows, lashes and body hair follow later. The scalp needs sun protection and a soft covering against cold.", source: MACMILLAN_HAIR },
  { when: "A few weeks to 3 months after the last dose", what: "Fine, soft new growth appears. It is often a different texture or colour at first ('chemo curls'); this usually settles over the following year.", source: ACS_HAIR },
  { when: "6 to 12 months", what: "Hair is generally long enough to style. Colouring and perming are best left until the new hair is a few centimetres long and the scalp is no longer sensitive, with a patch test first.", source: MACMILLAN_HAIR },
  { when: "A year or more", what: "If density has not recovered, ask for a dermatology referral: persistent chemotherapy-induced alopecia is a recognised diagnosis with published treatment series behind it, and the easily corrected causes (iron, thyroid) should be excluded.", source: JAAD_2019 },
  { when: "Radiotherapy", what: "Loss is limited to the treated area and begins two to three weeks in; regrowth depends on the dose and may be incomplete after high doses.", source: NCI_HAIR },
];

export type WigRow = { label: string; detail: string; url: string };
export const WIG_PROVISION: Array<{ region: "UK" | "US" | "Global"; title: string; rows: WigRow[] }> = [
  { region: "UK", title: "United Kingdom", rows: [
    { label: "NHS wigs in England: the charges", detail: "Hospitals supply wigs on prescription and England charges for them. The NHS Business Services Authority, which administers the scheme, lists a stock modacrylic wig at 80.15 pounds, a partial human-hair wig at 212.35 pounds and a full made-to-order human-hair wig at 310.55 pounds. The same figures appear in the HC11 booklet that applies from April 2026, so they are current.", url: "https://www.nhsbsa.nhs.uk/help-travel-eye-care-wigs-and-fabric-support-costs/wigs-and-fabric-supports" },
    { label: "Who pays nothing in England", detail: "The NHS Business Services Authority lists free provision for anyone under 16, under 19 and in full-time education, holding a valid war pension exemption certificate for the accepted disability, or receiving Pension Credit Guarantee Credit; it adds that an HC2 certificate from the NHS Low Income Scheme means free, that an HC3 certificate caps what you pay at the amount written on it, and that New Style Jobseeker's Allowance, New Style Employment and Support Allowance and Pension Credit Savings Credit alone do not qualify. The NHS website adds hospital inpatients and people on income-related Employment and Support Allowance. Apply to the Low Income Scheme with form HC1, and claim a refund with form HC5(W) within three months if you paid and then found you were exempt.", url: "https://www.nhsbsa.nhs.uk/help-travel-eye-care-wigs-and-fabric-support-costs/wigs-and-fabric-supports" },
    { label: "Scotland, Wales and Northern Ireland", detail: "The NHS Business Services Authority states that wigs and fabric supports supplied through a hospital are free in Scotland and in Wales; in Wales the free provision is within a set budget and you pay the difference if you choose a more expensive wig. In Northern Ireland everything dispensed on prescription, including wigs and surgical appliances, is free to everyone.", url: "https://www.nidirect.gov.uk/articles/help-health-costs" },
    { label: "What the NHS will and will not prescribe", detail: "Macmillan says human-hair wigs cannot be prescribed on the NHS unless you are allergic to synthetic wigs or have a skin condition a synthetic wig would worsen. A synthetic wig usually lasts four to eight months and costs between 50 and several hundred pounds privately; a made-to-order human-hair wig takes at least ten weeks and costs around 2,500 pounds or more. There are special arrangements for people registered with a GP in Wales who are treated in England.", url: "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/hair-loss/wigs-for-cancer-treatment" },
    { label: "If you paid and then find you were exempt", detail: "Cancer Research UK: claim a refund with the receipt and form HC5(W) within three months of buying the wig.", url: "https://www.cancerresearchuk.org/about-cancer/coping/physically/changes-appearance/hair-loss/wigs-other-ways" },
    { label: "Wig banks", detail: "Cancer Research UK describes a network of wig banks around the UK selling and hiring new and donated wigs, washed and conditioned, for between 10 and 30 pounds.", url: "https://www.cancerresearchuk.org/about-cancer/coping/physically/changes-appearance/hair-loss/get-wigs" },
    { label: "The Little Princess Trust", detail: "Free real-hair wigs for anyone up to the age of 24 who has lost hair through cancer treatment, and where possible for other hair-loss conditions. The whole service is free, fitted by an accredited wig fitter and, where a salon visit is not possible, at hospital, at home or virtually. The charity also funds childhood cancer research: more than 36 million pounds across 158 projects since 2016.", url: "https://www.littleprincesses.org.uk/request-a-wig" },
    { label: "Cancer Hair Care and Look Good Feel Better UK", detail: "Cancer Hair Care runs a free helpline and advice service on wigs, scarves and hair loss. Look Good Feel Better UK runs free workshops, in person and online, on skin, eyebrows, eyelashes, hair, nails and body confidence, open to anyone with a cancer diagnosis from the point of diagnosis to one year after treatment ends, with no referral needed.", url: "https://lookgoodfeelbetter.co.uk/support/women/" },
  ] },
  { region: "US", title: "United States", rows: [
    { label: "Medicare does not cover a wig, by statute", detail: "A9282, the only wig code in the Healthcare Common Procedure Coding System, reads 'Wig, any type, each'. In the Centers for Medicare and Medicaid Services' own October 2026 code file it carries coverage code S, which the file's record layout defines as non-covered by Medicare statute, with the statute reference given as section 1861 of the Social Security Act. There is no code whose descriptor reads 'cranial prosthesis': that is the wording prescribers and private insurers use, not a code.", url: "https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system/quarterly-update" },
    { label: "Ask for the prescription to say 'cranial prosthesis'", detail: "Many private insurers will consider a claim for a cranial or hair prosthesis prescribed with the diagnosis code for drug-induced alopecia, where they would refuse one for a wig. The wording on the prescription is what the claim turns on, and it costs nothing to ask for it.", url: "https://www.cancer.org/cancer/managing-cancer/side-effects/hair-skin-nails/hair-loss.html" },
    { label: "Two states mandate cover, with a cap", detail: "New Hampshire requires group policies that cover other prostheses to cover a scalp hair prosthesis for hair loss from treatment for cancer or leukaemia, on a written statement of medical necessity from the treating doctor, up to 350 dollars a year. Rhode Island requires the same of individual and group policies issued or renewed from 1 January 2007, also capped at 350 dollars per member per year. Delaware has a scalp hair prosthesis law too, but it covers alopecia areata from autoimmune disease and not chemotherapy, so it does not apply here.", url: "https://www.gencourt.state.nh.us/rsa/html/XXXVII/415/415-mrg.htm" },
    { label: "American Cancer Society and wig banks", detail: "Free wigs through local programmes and low-cost wigs, hats and scarves through the TLC catalogue.", url: "https://www.cancer.org/cancer/managing-cancer/side-effects/hair-skin-nails/hair-loss.html" },
    { label: "Wigs For Kids", detail: "Free hairpieces for children up to 18 experiencing medical hair loss, including from chemotherapy and radiotherapy, on referral from a medical professional. The charity says each human-hair wig costs it more than 2,600 dollars to make and that it never charges a recipient.", url: "https://www.wigsforkids.org/recipient-program/" },
    { label: "HairToStay: help with the cost of scalp cooling", detail: "Subsidies for people on lower incomes, usually with household income at or below 400 per cent of the federal poverty level, rising to 600 per cent for some donor-targeted funds. The maximum is usually 1,000 dollars, up to 1,500 dollars from those special funds, one subsidy per person, to be used within six months. Only people with solid tumours are eligible, because scalp cooling is not used in blood cancers.", url: "https://hairtostay.org/apply-for-a-subsidy/" },
    { label: "The Rapunzel Project", detail: "Founded in 2009 by two breast cancer survivors, it helps infusion centres install the biomedical freezers manual cold caps need, because the caps must be held at minus 30 degrees Celsius and ordinary freezers do not reach it. Its published estimate of what people pay: 1,500 to 2,000 dollars for three to four months of manual capping plus dry ice, and 2,000 to 2,500 dollars for machine cooling, varying with the number of treatments.", url: "https://rapunzelproject.org/faqs/" },
  ] },
  { region: "Global", title: "Everywhere", rows: [
    { label: "Ask before the first cycle", detail: "Wig fitting, cap booking and photographs for colour matching are all easier while you still have hair, and the National Cancer Institute's advice is explicit: if you plan to buy a wig, get one while you still have hair so you can match the colour.", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" },
    { label: "Synthetic or human hair", detail: "Synthetic wigs are lighter, cheaper and hold their style; human-hair wigs look most natural, cost more and need styling. A soft cotton or bamboo liner protects a tender scalp, and some people find a scarf or turban cooler and less itchy than a wig.", url: "https://www.cancer.org/cancer/managing-cancer/side-effects/hair-skin-nails/hair-loss.html" },
    { label: "Look Good Feel Better", detail: "Free workshops on skincare, make-up, brows and head coverings for people in treatment. It began with two workshops at Memorial Sloan Kettering and Georgetown's Lombardi Cancer Center in 1989 and now runs through a global affiliate network of around 26 to 27 countries. A Canadian pilot study of 2009 found improvements in self-image and social interaction and a fall in anxiety; it is a pilot, not a randomised trial.", url: "https://lookgoodfeelbetter.org/about/about/" },
    { label: "Afro and textured hair", detail: "Macmillan says scalp cooling can be used with any type of hair, and that with Afro hair weaves and braids must be removed first because they put extra strain on the follicles, and chemical relaxing should be avoided. Some wig services and charities, the Little Princess Trust among them, now supply Afro-textured wigs.", url: "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/hair-loss/scalp-cooling" },
  ] },
];

// =============================================================================
// THE PRACTICAL SIDE: SCALP CARE, COVERINGS, WORK
// =============================================================================
/** Added 2 October 2026. The part of hair loss a person can act on, and the part that follows them out of hospital. */
export type PracticalRow = { title: string; detail: string; source: Source };

export const HAIR_PRACTICAL: PracticalRow[] = [
  {
    title: "Looking after the scalp while hair is going",
    detail: "The National Cancer Institute's advice is specific: a soft-bristled brush or wide-tooth comb, a mild shampoo, washing less often and gently, patting dry with a soft towel, and no hair dryers, irons, gels or clips that can hurt the scalp. Lotion or conditioner helps an itchy or tender scalp. Some people cut their hair short first so the change is less abrupt; if you shave, use an electric shaver rather than a blade.",
    source: { label: "National Cancer Institute: hair loss (alopecia) and cancer treatment", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" },
  },
  {
    title: "Sun and cold on a bare head",
    detail: "Scalp skin that has spent a lifetime under hair burns quickly and loses heat fast. The same guidance asks for sunscreen or a hat outdoors and a comfortable covering to keep the head warm. Macmillan's hair-loss guidance makes the same point about keeping the head covered in cold weather.",
    source: { label: "National Cancer Institute: hair loss (alopecia) and cancer treatment", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" },
  },
  {
    title: "When hair starts to come back",
    detail: "Be gentle again: less brushing, curling and blow-drying, and washing less often. Colouring and perming are usually left until the new hair is a few centimetres long and the scalp is comfortable, with a patch test first.",
    source: { label: "National Cancer Institute: hair loss (alopecia) and cancer treatment", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" },
  },
  {
    title: "Telling children and family",
    detail: "The National Cancer Institute suggests telling children and close family that you expect to lose your hair, before it happens. Hair loss is usually the moment an illness becomes visible to everyone, including people you had not decided to tell.",
    source: { label: "National Cancer Institute: hair loss (alopecia) and cancer treatment", url: "https://www.cancer.gov/about-cancer/treatment/side-effects/hair-loss" },
  },
  {
    title: "Work, in England, Scotland and Wales",
    detail: "Schedule 1 of the Equality Act 2010 says in one line that cancer is a disability, and the government's own guidance says you meet that definition from the day you are diagnosed. That means an employer who knows must consider reasonable adjustments, and the protection covers recruitment, terms and conditions, promotion and training, and dismissal. Macmillan adds that it does not end when treatment does and travels with you to a new employer. Northern Ireland is covered by the Disability Discrimination Act 1995 instead.",
    source: { label: "Equality Act 2010, Schedule 1, Part 1, paragraph 6 (legislation.gov.uk)", url: "https://www.legislation.gov.uk/ukpga/2010/15/schedule/1" },
  },
  {
    title: "Going back in",
    detail: "Cancer Research UK puts it plainly: going back to work, meeting new people or going to interviews can all be difficult while you are coping with a change in how you look. There is no guidance that solves it, and the charities' workshops and helplines exist partly for this.",
    source: { label: "Cancer Research UK: coping with hair loss", url: "https://www.cancerresearchuk.org/about-cancer/coping/physically/changes-appearance/hair-loss/coping" },
  },
];

// =============================================================================
// THE DEVICES
// =============================================================================
/** Every device ever authorised by the FDA under product code PMC, scalp cooling system, checked 2 October 2026. */
export type CoolingDevice = { device: string; maker: string; authorisation: string; indication: string };

export const COOLING_DEVICES: CoolingDevice[] = [
  { device: "DigniCap System", maker: "Dignitana AB", authorisation: "De Novo DEN150010, granted 8 December 2015", indication: "To reduce the likelihood of chemotherapy-induced alopecia in women with breast cancer. This grant created the device class." },
  { device: "Paxman Scalp Cooler", maker: "Paxman Coolers Limited", authorisation: "510(k) K163484, cleared 17 April 2017", indication: "To reduce the likelihood of chemotherapy-induced alopecia in women with breast cancer. The summary cites the SCALP trial." },
  { device: "DigniCap Scalp Cooling System", maker: "Dignitana AB", authorisation: "510(k) K170871, cleared 3 July 2017", indication: "Broadened to cancer patients with solid tumours." },
  { device: "Paxman Scalp Cooler", maker: "Paxman Coolers Limited", authorisation: "510(k) K173032, cleared 7 June 2018", indication: "Broadened to cancer patients with solid tumours; otherwise identical to the 2017 device." },
  { device: "DigniCap Delta", maker: "Dignitana, Inc.", authorisation: "510(k) K191166, cleared 26 June 2019", indication: "Cancer patients with solid tumours." },
  { device: "Portable Scalp Cooling System", maker: "Cooler Heads Care, Inc.", authorisation: "510(k) K211526, cleared 21 October 2021", indication: "A portable system, the first after the two established machines." },
  { device: "Eva Scalp Cooling System", maker: "Stemtech Medical Devices", authorisation: "510(k) K252289, cleared 25 November 2025", indication: "The most recent addition to the class." },
];


// =============================================================================
// SCALP COOLING, IN DETAIL
// =============================================================================
/**
 * Added 2 October 2026. The scalp-cooling material on this page used to be three sentences in a card; a reader
 * deciding whether to sit under a cap for several hours a cycle needs the number for their own regimen, what it
 * feels like, what the evidence actually says about scalp metastases, who it is not offered to, and who pays.
 * Every figure below is the figure the linked paper's abstract states, read from the abstract itself.
 *
 * Two things this material deliberately does not say. There is no completed Cochrane review of scalp cooling:
 * CD016196 is a protocol with no results, so nothing here is attributed to one. And neither MASCC nor ASCO has a
 * guideline on alopecia or scalp cooling; the ESMO 2021 dermatological toxicities guideline is the only one that
 * does, and it is named rather than paraphrased as "the guidelines".
 */
const SCALP_JAMA_FULL: Source = { label: "Nangia et al., SCALP randomised trial of scalp cooling (JAMA 2017)", url: "https://doi.org/10.1001/jama.2016.20939" };
const DIGNICAP_FULL: Source = { label: "Rugo et al., DigniCap prospective cohort with concurrent controls (JAMA 2017)", url: "https://doi.org/10.1001/jama.2016.21038" };
const SCALP_METS: Source = { label: "Rugo, Melin and Voigt, scalp cooling and the risk of scalp metastases: systematic review and meta-analysis (Breast Cancer Research and Treatment 2017)", url: "https://doi.org/10.1007/s10549-017-4185-9" };
const LAMBERT_2024: Source = { label: "Lambert et al., scalp hypothermia to reduce chemotherapy-induced alopecia: systematic review and meta-analysis (Gynecologic Oncology 2024)", url: "https://doi.org/10.1016/j.ygyno.2024.06.012" };
const DUTCH_REGISTRY_2012: Source = { label: "van den Hurk et al., scalp cooling for hair preservation in 1,411 chemotherapy patients, the Dutch Scalp Cooling Registry (Acta Oncologica 2012)", url: "https://doi.org/10.3109/0284186X.2012.658966" };
const DUTCH_REGISTRY_2024: Source = { label: "Brook et al., results of the Dutch scalp cooling registry in 7,424 patients (The Oncologist 2024)", url: "https://doi.org/10.1093/oncolo/oyae116" };
const TDXD_COOLING_2026: Source = { label: "Salehi et al., scalp cooling outcomes in patients receiving trastuzumab deruxtecan for metastatic breast cancer (ESMO Open 2026)", url: "https://doi.org/10.1016/j.esmoop.2026.107769" };
const ESMO_DERM: Source = { label: "Lacouture et al., prevention and management of dermatological toxicities related to anticancer agents: ESMO Clinical Practice Guidelines (Annals of Oncology 2021)", url: "https://doi.org/10.1016/j.annonc.2020.11.005" };
const SHIN_META: Source = { label: "Shin et al., efficacy of interventions for prevention of chemotherapy-induced alopecia: systematic review and meta-analysis (International Journal of Cancer 2015)", url: "https://doi.org/10.1002/ijc.29115" };
const MACMILLAN_SCALP_COOLING: Source = { label: "Macmillan Cancer Support: scalp cooling", url: "https://www.macmillan.org.uk/cancer-information-and-support/impacts-of-cancer/hair-loss/scalp-cooling" };
const CRUK_HAIR_TREATMENT: Source = { label: "Cancer Research UK: treatment for hair loss, including scalp cooling", url: "https://www.cancerresearchuk.org/about-cancer/coping/physically/changes-appearance/hair-loss/treatment" };
const COCHRANE_PROTOCOL: Source = { label: "Kojima et al., scalp cooling for the prevention of chemotherapy-induced hair loss in early breast cancer: Cochrane protocol, no results yet (Cochrane Database of Systematic Reviews 2025)", url: "https://doi.org/10.1002/14651858.CD016196" };

/** How well cooling works, by the regimen the study enrolled. What a reader needs is their own row, not the headline. */
export type CoolingEvidenceRow = {
  regimen: string;
  /** The result, in the words and numbers of the paper. */
  result: string;
  /** What this row does and does not settle. */
  caveat: string;
  source: Source;
};

export const SCALP_COOLING_EVIDENCE: CoolingEvidenceRow[] = [
  {
    regimen: "Taxane without an anthracycline",
    result: "In the DigniCap study, hair loss of 50 per cent or less was seen in 67 of 101 evaluable women (66.3 per cent, 95 per cent confidence interval 56.2 to 75.4) using the cap, against 0 of 16 concurrent controls. No participant in the cooling group received an anthracycline.",
    caveat: "A prospective cohort, not a randomised trial, with 16 controls, 14 of them matched for age and regimen. Hair loss was estimated by unblinded patients from five photographs.",
    source: DIGNICAP_FULL,
  },
  {
    regimen: "Taxane, anthracycline or both (the randomised trial)",
    result: "In SCALP, hair preservation, defined as no loss or less than 50 per cent loss not needing a wig, was achieved by 48 of 95 women with cooling (50.5 per cent, 95 per cent confidence interval 40.7 to 60.4) against 0 of 47 without. Of the 142 evaluable women, 36 per cent had anthracycline-based and 64 per cent taxane-based chemotherapy.",
    caveat: "Open label, and stopped early at the planned interim analysis for efficacy, which tends to overstate an effect. The headline is the average across both regimen types rather than the figure for either one, and no longer-term follow-up of this trial has been published.",
    source: SCALP_JAMA_FULL,
  },
  {
    regimen: "Paclitaxel, and docetaxel, pooled across every published study",
    result: "A 2024 systematic review and meta-analysis of 31 studies across 14 countries found that of 2,179 patients, 60.7 per cent had less than 50 per cent hair loss (pooled estimate 60.6 per cent, 95 per cent confidence interval 54.9 to 66.1). By drug: paclitaxel 69.9 per cent (64.1 to 75.4) and docetaxel 60.5 per cent (50.0 to 71.6). Across the comparative studies, 49.3 per cent of cooled patients had less than 50 per cent hair loss against 0 per cent of those not cooled, an odds ratio of 40.3 (10.5 to 154.8). Patient satisfaction was 78.9 per cent (69.1 to 87.4).",
    caveat: "Pooling observational studies with different definitions of success. It is the best per-drug estimate available and it is not a randomised comparison.",
    source: LAMBERT_2024,
  },
  {
    regimen: "Anthracycline plus taxane together (the regimen many women are offered)",
    result: "In the Dutch Scalp Cooling Registry of 1,411 patients at 28 hospitals, half of all cooled patients did not wear a head covering at their last chemotherapy session. By regimen, patients were satisfied with the result in 8 per cent of cases after TAC chemotherapy (docetaxel, doxorubicin and cyclophosphamide) and up to 95 per cent after paclitaxel. The registry's authors concluded that cooling is justified for all eligible patients except those needing TAC.",
    caveat: "A registry, not a trial, and these are the only two regimen figures the published abstract gives. The ESMO guideline puts it in words rather than numbers: cooling has greater efficacy with taxane-based regimens and lower efficacy when anthracyclines are combined with taxanes or with cyclophosphamide. The successor registry of 7,424 patients at 68 hospitals found 53 per cent reported minimal hair loss and that outcomes were drug and dose dependent.",
    source: DUTCH_REGISTRY_2012,
  },
  {
    regimen: "Everyone, in routine care rather than a trial",
    result: "The successor to that registry reported 7,424 patients at 68 Dutch hospitals: 4,191 (56 per cent) did not wear a head covering and 3,784 of 7,183 (53 per cent) reported minimal hair loss at the start of their final treatment. Outcomes were drug and dose dependent, and the study did not identify any patient characteristic or lifestyle factor that predicted whether cooling would work.",
    caveat: "That last finding is the useful one and the disappointing one: nothing about you, your hair or how you live tells you in advance whether it will work. The drug does most of the predicting.",
    source: DUTCH_REGISTRY_2024,
  },
  {
    regimen: "Antibody-drug conjugates: trastuzumab deruxtecan",
    result: "In a prospective phase 2 study at Dana-Farber in which 40 evaluable women with metastatic breast cancer chose whether to use the cap, 33 (82.5 per cent) had alopecia of grade 1 or worse: 90 per cent of those who cooled and 75 per cent of those who did not, a difference that was not statistically significant. Grade 2 alopecia was 55 per cent in both groups. The authors concluded that scalp cooling did not reduce alopecia rates with this drug.",
    caveat: "Small, and patients chose their own group rather than being randomised, so the groups may differ. It is nonetheless the only published result for cooling with an antibody-drug conjugate, and it is not encouraging. For sacituzumab govitecan there is one published case report of one patient.",
    source: TDXD_COOLING_2026,
  },
  {
    regimen: "Everything else",
    result: "No trial has reported hair preservation with cooling for platinum-based regimens outside breast cancer, for paediatric chemotherapy, or for most solid-tumour regimens. Units use cooling with them and record their own results.",
    caveat: "Absence of a trial is not evidence that cooling fails here; it means nobody can give you a number. A Cochrane review is being written and has published only its protocol, with no results, so anyone citing one is citing something that does not yet exist.",
    source: COCHRANE_PROTOCOL,
  },
];

/** What a reader actually wants to know before agreeing to sit under a cap. */
export type CoolingFact = { question: string; answer: string; source: Source; also?: Source };

export const SCALP_COOLING_PRACTICAL: CoolingFact[] = [
  {
    question: "How does it work?",
    answer: "Cooling the scalp narrows its blood vessels and slows the metabolism of the hair follicle while the drug is at its peak concentration in the blood, so much less of it reaches the dividing cells at the base of the hair. A machine circulates coolant through a close-fitting silicone cap under an insulating outer cap; manual gel caps, kept on dry ice and swapped every twenty to thirty minutes, do the same thing without a machine and need someone to help.",
    source: ESMO_DERM,
  },
  {
    question: "How much longer is each visit?",
    answer: "In the DigniCap study cooling began 30 minutes before each cycle, the scalp was held at 3 degrees Celsius throughout, and cooling continued for 90 to 120 minutes afterwards. Cancer Research UK gives the Paxman system as 30 to 45 minutes before, depending on hair type, the length of the infusion itself, and a minimum of 20 to 90 minutes after depending on the drugs. A short infusion can therefore become a half-day. Ask your unit for its own before-and-after times and plan the lift home around them.",
    source: DIGNICAP_FULL,
  },
  {
    question: "What does it feel like, and what makes people stop?",
    answer: "Cold, and tight. In the DigniCap study 4 of 106 patients (3.8 per cent) reported mild headache and 3 (2.8 per cent) stopped cooling because they felt cold. In the SCALP trial 54 adverse events were reported in the cooling group, all grade 1 and 2, with no serious device events. The ESMO guideline notes that injuries from cold have been reported only after the use of frozen gel caps, not with machine cooling.",
    source: DIGNICAP_FULL,
    also: ESMO_DERM,
  },
  {
    question: "Does it raise the risk of cancer coming back in the scalp?",
    answer: "This was the long-standing objection and it has been measured. A systematic review and meta-analysis of ten longitudinal studies found scalp metastases in 0.61 per cent (95 per cent confidence interval 0.32 to 1.1) of 1,959 cooled patients against 0.41 per cent (0.13 to 0.94) of 1,238 who were not cooled, which was not statistically significant (P equals 0.43), with no difference in survival. Two things are worth knowing about that analysis: mean follow-up was shorter in the cooled group (43.1 against 87.4 months), and all three authors declared ties to a device manufacturer. The honest reading is that no excess has been shown, not that none could exist.",
    source: SCALP_METS,
  },
  {
    question: "Who is it not offered to?",
    answer: "The ESMO guideline lists the contraindications: blood cancers, cold sensitivity, cold agglutinin disease, cryoglobulinaemia, cryofibrinogenaemia, cold post-traumatic dystrophy, and whole-brain radiotherapy after chemotherapy. Macmillan adds continuous chemotherapy through a pump over several days, and a liver that is not working as well as it should. Cancer Research UK adds scalp radiotherapy and severe headaches or migraine, and notes that cooling cannot be used with chemotherapy tablets because the cap would have to be worn all day. The United States authorisations stop at solid tumours, so cooling is outside the label in blood cancers there as well as outside practice. Beyond that list, which solid-tumour regimens a unit will cool is a local decision.",
    source: ESMO_DERM,
  },
  {
    question: "What does the one guideline actually say?",
    answer: "The ESMO clinical practice guideline on dermatological toxicities recommends scalp cooling to prevent chemotherapy-induced alopecia, graded II, B, and notes that seven of eight randomised trials favoured cooling with 50 to 65 per cent of patients developing only grade 1 alopecia. Neither MASCC nor ASCO has published a guideline on alopecia or scalp cooling. Two of the ESMO authors declare funding or consulting ties to scalp-cooling manufacturers, which is worth knowing and does not by itself make the recommendation wrong.",
    source: ESMO_DERM,
  },
  {
    question: "How likely is it to work for me, personally?",
    answer: "Nobody can say in advance. Macmillan's wording is the honest one: you will only know how well scalp cooling works for you by trying it, your hair is likely to get thinner even with it, and some people who use it lose a lot of hair. Cancer Research UK says the same, that cooling blocks only certain drugs and does not work for everyone. The trial percentages describe groups of women, not the person reading them.",
    source: MACMILLAN_SCALP_COOLING,
  },
  {
    question: "Does cooling do anything for the hair that does fall out?",
    answer: "Macmillan reports that research has shown hair grows back faster and stronger in the twelve weeks after treatment finishes in people who had scalp cooling, and that cooling can help reduce the risk of the permanent hair loss docetaxel can occasionally cause. Those are secondary benefits rather than the reason cooling is offered, and the second has not been tested with permanent alopecia as a trial endpoint.",
    source: MACMILLAN_SCALP_COOLING,
  },
  {
    question: "What if it does not work?",
    answer: "About half the women in the randomised trial still lost more than half their hair. Nothing published says whether stopping after one cycle, or persisting, changes the outcome for an individual, so that decision rests on the unit's experience and on how the first cycle felt. A wig or covering fitted before the first cycle means the choice is not urgent.",
    source: SCALP_JAMA_FULL,
  },
  {
    question: "Is there anything that prevents hair loss from anything other than chemotherapy?",
    answer: "No. Cancer Research UK states plainly that there is no known way to prevent or reduce hair loss from radiotherapy, hormone therapy, targeted cancer drugs or immunotherapy. For chemotherapy itself, a meta-analysis of 8 randomised and 9 controlled trials covering 1,098 participants found that scalp cooling significantly reduced the risk of alopecia, with a relative risk of 0.38 (95 per cent confidence interval 0.32 to 0.45), and that topical 2 per cent minoxidil and the other interventions tested did not. Scalp cooling is the only method cleared by the United States Food and Drug Administration to prevent chemotherapy hair loss.",
    source: CRUK_HAIR_TREATMENT,
    also: SHIN_META,
  },
];

import type { Question } from "./questions";

/**
 * QUESTIONS TO ASK ABOUT HAIR, BY SETTING. Written 2 October 2026.
 *
 * Hand-written in the shape the cancer question sets use (src/data/questions.ts: setting, question, why), but
 * keyed by the moment in treatment rather than by a cancer, because hair loss crosses every diagnosis and the
 * person reading may not know which regimen they are on yet. Rendered on /live/hair/ grouped by setting, and
 * checked by src/lib/tone.test.ts alongside the cancer sets.
 *
 * Every "why" names the source it rests on. Where the published evidence does not answer the question, the "why"
 * says that it does not, because a named gap is worth more than a confident guess: the two places this happens
 * are the per-regimen figure for anthracycline-containing chemotherapy, and whether persisting with a cold cap
 * after a poor first cycle changes anything.
 */

export const BEFORE = "Before chemotherapy starts";
export const COOLING = "If you are offered scalp cooling";
export const DURING = "During treatment";
export const BROWS = "Eyebrows, eyelashes and body hair";
export const AFTER = "Afterwards, while it grows back";
export const PERSISTENT = "If your hair has not come back";
export const ENDOCRINE = "On endocrine therapy or a CDK4/6 inhibitor";
export const RADIOTHERAPY = "Radiotherapy to the head";
export const WIGS = "Wigs, coverings and who pays";
export const LIFE = "Work, family and how you look";

export const HAIR_QUESTION_SETTINGS = [BEFORE, COOLING, DURING, BROWS, AFTER, PERSISTENT, ENDOCRINE, RADIOTHERAPY, WIGS, LIFE];

export const hairQuestions: Question[] = [
  // Before chemotherapy starts
  { setting: BEFORE, question: "Will this regimen make my hair fall out, and will it be all of it or some of it?", why: "The National Cancer Institute's first suggested question is whether treatment is likely to cause hair to fall out. The answer depends on the drugs rather than on the cancer, and a combination carries the risk of its strongest component, so ask about the regimen by name." },
  { setting: BEFORE, question: "When would it start, and how quickly?", why: "Shedding typically begins two to three weeks after the first dose and is often sudden rather than gradual, which is why many people cut their hair short first. Your team can say what they see with this regimen." },
  { setting: BEFORE, question: "Does this unit have scalp cooling, is it offered for my regimen, and can it be booked for the first cycle?", why: "In the SCALP randomised trial 48 of 95 women who used the cap kept at least half their hair, against 0 of 47 who did not. Cooling has to be in place from the first dose to do that; starting after shedding has begun is not what was tested." },
  { setting: BEFORE, question: "What is the figure for my drugs, not the headline figure?", why: "The two 2017 studies enrolled different regimens. The DigniCap cohort excluded anthracyclines and reported hair loss of 50 per cent or less in 66.3 per cent of women; SCALP, in which 36 per cent had anthracycline-based and 64 per cent taxane-based chemotherapy, reported 50.5 per cent. Preservation was better with a taxane alone in both." },
  { setting: BEFORE, question: "Is there a reason cooling would not be offered to me?", why: "It is not used in leukaemia, lymphoma or myeloma, and there is no infusion to cool around for tablets taken daily for years. Units also differ in which solid-tumour regimens they will cool, so part of the answer is local." },
  { setting: BEFORE, question: "Can I be referred for a wig before my hair falls out?", why: "The National Cancer Institute's guidance is to get a wig while you still have hair, so that it can be matched to your colour. Fitting is also easier before than after." },

  // Scalp cooling
  { setting: COOLING, question: "How much longer will each visit take, counting the cooling before and after?", why: "In the DigniCap study cooling began 30 minutes before the infusion and continued for 90 to 120 minutes after it, with the scalp held at 3 degrees Celsius throughout. Ask for this unit's own times: they differ by device and regimen, and they decide whether you need a lift home." },
  { setting: COOLING, question: "What does it feel like, and what do people stop for?", why: "In the DigniCap study 4 of 106 patients (3.8 per cent) reported mild headache and 3 (2.8 per cent) stopped because they felt cold. In SCALP there were 54 adverse events in the cooling group, all grade 1 and 2, and no serious device events." },
  { setting: COOLING, question: "Does cooling make it more likely that the cancer comes back in my scalp?", why: "A systematic review and meta-analysis found scalp metastases in 0.61 per cent of 1,959 cooled patients against 0.41 per cent of 1,238 who were not cooled, which was not statistically significant (P equals 0.43). Follow-up was shorter in the cooled group and the authors declared ties to a device maker, so the finding is that no excess has been shown, not that none could exist." },
  { setting: COOLING, question: "If I am losing hair anyway after the first cycle, is it worth continuing?", why: "About half the women in the randomised trial still lost more than half their hair, and no published trial says whether persisting or stopping changes the outcome for one person. That makes it a question for the unit's own experience, and a reason to have a covering ready either way." },
  { setting: COOLING, question: "What will it cost me, and is there any help with the cost?", why: "Provision and charges differ by country and by hospital, and in several health systems the machine was bought by a charity while the single-use cap is charged for. Ask for the figure in writing before the first cycle, and ask whether the unit knows of a subsidy." },

  // During treatment
  { setting: DURING, question: "How should I wash and look after my scalp now?", why: "The National Cancer Institute advises a mild shampoo, washing less often and gently, patting dry with a soft towel, a soft-bristled brush or wide-tooth comb, and avoiding hair dryers, irons, gels and clips that can hurt the scalp." },
  { setting: DURING, question: "What should I do about sun and cold on a bare scalp?", why: "The same guidance asks for sunscreen or a hat outdoors and a comfortable covering to keep the head warm. Scalp skin that has never been exposed burns easily." },
  { setting: DURING, question: "My scalp is sore and tingling before anything has fallen out. Is that expected?", why: "Tenderness of the scalp commonly comes before shedding. It is worth reporting so that other causes are not missed, and it is a practical reason to avoid tight styles and heat." },

  // Brows and lashes
  { setting: BROWS, question: "Will I lose my eyebrows and eyelashes too, and when?", why: "Brow and lash follicles spend a shorter share of their cycle growing than scalp follicles do, so they are usually affected later and sometimes only partly; body hair follows its own timing. Knowing the order helps you plan the parts that show." },
  { setting: BROWS, question: "Without lashes my eyes water and collect grit. What helps?", why: "Lashes are a mechanical defence as well as a feature. Wraparound glasses outdoors and preservative-free artificial tears are the usual measures, and an eye check is reasonable if irritation persists." },
  { setting: BROWS, question: "Is bimatoprost an option for my lashes, who prescribes it, and would I pay?", why: "Bimatoprost 0.03 per cent is an approved lash-growth drop with a randomised, vehicle-controlled trial that included people who had completed chemotherapy. It is a cosmetic prescription in most systems, rarely reimbursed, and it is not used during active chemotherapy." },
  { setting: BROWS, question: "When could I have my eyebrows tattooed or microbladed?", why: "These break the skin, so they are usually deferred until blood counts have recovered and done by a practitioner who has been told about the treatment. Ask your team for the timing rather than the salon." },
  { setting: BROWS, question: "My eyelashes have grown very long and are scratching my eye. Is that the drug?", why: "Epidermal growth factor receptor inhibitors such as erlotinib and osimertinib can cause trichomegaly, abnormally long stiff lashes that rub the surface of the eye. They are trimmed by an optometrist or ophthalmologist, not at home." },

  // Afterwards
  { setting: AFTER, question: "When should I expect to see something, and will it look different?", why: "The National Cancer Institute says hair often grows back two to three months after chemotherapy ends, that it is very fine at first, and that it can be curlier or straighter, or even a different colour, before returning in time to how it was." },
  { setting: AFTER, question: "When can I colour, perm or straighten it?", why: "New hair is finer and the scalp is more easily irritated, so these are usually left until the hair is a few centimetres long and the scalp is comfortable, with a patch test first. Ask your team for their own threshold." },
  { setting: AFTER, question: "Is minoxidil worth starting, and in which form?", why: "In a randomised double-blind trial of 22 women having chemotherapy after breast surgery, topical 2 per cent minoxidil did not prevent hair loss but shortened the period of baldness by a mean of 50.2 days. The lotion is inexpensive and widely available; the tablet needs a prescriber who knows your heart history." },
  { setting: AFTER, question: "Will my hair go back to the colour it was?", why: "The pigment cells in the follicle recover more slowly than the cells that build the shaft, so the first growth can be grey or white before colour returns. It does not always return fully, and nobody can say in advance which way it will go for you." },

  // Persistent
  { setting: PERSISTENT, question: "It has been a year and my hair is still thin. Can I be referred to a dermatologist?", why: "Persistent chemotherapy-induced alopecia is a recognised diagnosis with published treatment series behind it, and a dermatologist is the person who makes it. The referral is the step most often missed." },
  { setting: PERSISTENT, question: "What else could be causing this, and have those been checked?", why: "Iron deficiency, thyroid disease, the slow shedding that follows major illness, and the pattern hair loss many people would have developed anyway can all be present at once. They are a blood test and an examination, and several of them are treatable." },
  { setting: PERSISTENT, question: "How likely is treatment to help, and how long before I would know?", why: "In the largest treated series, 192 women across three centres, moderate to significant improvement after topical minoxidil or spironolactone was seen in 36 of 54 patients with persistent chemotherapy alopecia (67 per cent). These are uncontrolled series in people who went looking for help, so the honest answer is that it often helps and that it is not guaranteed." },
  { setting: PERSISTENT, question: "Was this a known risk of my regimen?", why: "In a prospective cohort of 61 women whose hair was measured before chemotherapy and who were followed for three years, 42.3 per cent met the definition of permanent alopecia at three years, and taxane-based regimens were the ones most often involved. Many people are not told beforehand; asking is also how the consent conversation improves for the next person." },

  // Endocrine
  { setting: ENDOCRINE, question: "Is this thinning coming from my tablets?", why: "Endocrine therapy causes a gradual thinning at the parting and crown, in the pattern of androgenetic alopecia rather than the sudden shedding of chemotherapy. In the series that first described it, 67 per cent of cases were attributed to an aromatase inhibitor and 33 per cent to tamoxifen." },
  { setting: ENDOCRINE, question: "It is graded mild. It does not feel mild. Does that matter?", why: "In that series 92 per cent of patients were graded in the mildest severity band and the quality-of-life measurement still showed a significant negative effect, strongest in the emotional domain. The gap between the grade and the experience is documented, so raising it is reasonable." },
  { setting: ENDOCRINE, question: "Would minoxidil help, and does it interfere with my cancer treatment?", why: "After topical minoxidil, moderate or significant improvement was seen in 37 of 46 patients (80 per cent) in the same series. It is a topical vasodilator rather than a hormone, but the prescriber should still have your full treatment list." },
  { setting: ENDOCRINE, question: "Would switching tablets help, and what would I be trading?", why: "Switching between tamoxifen and an aromatase inhibitor, or between aromatase inhibitors, is sometimes tried. Stopping endocrine therapy early to protect hair is a different decision with a recurrence cost attached, and one to make with the oncologist rather than alone." },

  // Radiotherapy
  { setting: RADIOTHERAPY, question: "What dose will my scalp receive, and can the plan reduce it?", why: "Permanent alopecia after cranial irradiation correlates with the dose to the hair follicle and, in the study that established it, with nothing else tested. In a later cohort of 71 patients the dose at which half were estimated to have moderate alopecia was 36.1 Gy. Scalp-sparing planning is sometimes possible where the tumour position allows." },
  { setting: RADIOTHERAPY, question: "Will it grow back in the treated area?", why: "The National Cancer Institute says hair often grows back three to six months after radiotherapy ends, and that after a very high dose it may grow back thinner, or not at all, in the area that was treated." },
  { setting: RADIOTHERAPY, question: "If it does not come back, is anything worth trying?", why: "In that cohort, 28 of 34 patients treated with topical minoxidil 5 per cent responded, and a small number were helped by hair transplantation or surgical reconstruction. These are retrospective findings from one series, not trial results." },

  // Wigs and coverings
  { setting: WIGS, question: "How do I get a wig here, who fits it, and what will it cost me?", why: "Entitlement and charges differ by country and, within the United Kingdom, by nation. Ask who the hospital's appliance officer or wig service is, because that is the route rather than the high street." },
  { setting: WIGS, question: "Am I exempt from the charge?", why: "Where a charge exists it usually has exemptions tied to age, full-time education, benefits or a low-income certificate. The exemption is applied when the wig is supplied, so it is worth settling before the appointment." },
  { setting: WIGS, question: "Synthetic or human hair: which should I choose?", why: "Synthetic wigs are lighter, cheaper and hold their style; human-hair wigs look most natural, cost more and need styling. A soft liner helps a tender scalp. Trying both before you need one is easier than deciding in a hurry." },
  { setting: WIGS, question: "Is there a charity that can help with the cost, or supply one free?", why: "Several charities supply wigs free or subsidise them, and some are specific to children and young people. Clinical nurse specialists usually know the local ones, and the list changes." },

  // Life
  { setting: LIFE, question: "How do I tell my children, and when?", why: "The National Cancer Institute suggests telling children and close family that you expect to lose your hair before it happens. The loss is what makes the illness visible to them, and being told first is easier than noticing." },
  { setting: LIFE, question: "Do I have to tell my employer, and what am I entitled to?", why: "Hair loss is often the point at which an illness stops being private at work. Employment protections and the duty to make adjustments differ by country, so ask your team which service or charity advises on work where you live." },
  { setting: LIFE, question: "Is there a free workshop on make-up, brows and head coverings near me?", why: "Look Good Feel Better runs free skincare, make-up and head-covering workshops for people in treatment in the United Kingdom, the United States and other countries, and the National Cancer Institute lists it as a resource." },
  { setting: LIFE, question: "Who can I talk to about how much this is affecting me?", why: "Hair loss is consistently rated among the most distressing effects of treatment: one nursing review reported that more than 75 per cent of patients cite alopecia as the most feared side effect and that as many as 10 per cent consider refusing treatment. Psychological support for body image is part of cancer care, not an extra." },
];

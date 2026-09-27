# Tone: writing about cancers that kill people

The owner's report (26 September 2026): "a total site review for negative, fatalistic language. it doesn't help anyone."
The sentence that prompted it described adenoid cystic carcinoma as **"a slow but relentless cancer"**. It now reads
**"a slow-growing cancer of the salivary glands that spreads along nerves and can come back years after treatment"**.
Nothing was softened. The second version says more, and every clause of it can be checked.

That is the whole rule, and the rest of this file is how to apply it.

## The rule

**Keep every number. Delete every adjective that is doing a number's job.**

"Relentless" is not a finding. "Spreads along nerves and can come back years after treatment" is. When an adjective
carries a claim that no cited figure supports, it is the writer's feeling about the disease standing where the
evidence should be, and a reader who has just been diagnosed reads it as a forecast.

Three corollaries:

- **A cancer that kills most of the people who get it must say so.** Making the site reassuring at the cost of being
  accurate would be the same failure in the other direction, and readers detect it faster.
- **Never alter a quotation.** Quoted abstracts, guideline text and label wording keep their authors' words,
  including bleak ones. Say that it is a quotation and let it stand. `poorly-differentiated-chordoma` carries
  "dismal prognosis" because that is the cited paper's own phrase; leave it.
- **Editorialising in the cheerful direction is the same bug.** "Unthinkable a decade ago" on a 32 per cent survival
  figure, and "current survival is likely better than the number shown" with no cancer named and no source, were
  both found and fixed in this pass. Symmetry cuts both ways or it is not symmetry.

## The site already has the rule, in code

Two pieces of the codebase state it, and most of what this review found were places they do not reach.

- `src/components/SurvivalDisclosure.tsx` folds any sentence quoting survival or mortality behind a click and prints
  a guard above it. It is wired to `stateOfArt`, `burden`, the UK page's figure cards and the decisions page.
- `src/lib/i18n/ui.ts`, key `survival.note`, is that guard. It now reads:

  > Averages across everyone diagnosed, often years ago. **A median is the middle of a group: half the people counted
  > lived longer than the figure shown, and some lived far longer.** Your stage, subtype, age, fitness and the
  > treatment you receive matter more than the average, and the numbers are improving quickly.

  The bold clause was added in this pass, in all nine languages. The guard the whole site relies on to make a bare
  median safe had never said what a median is.

The glossary already says it too. `median-survival`: "the midpoint of a spread, not a prediction for anyone: half
live longer, some much longer." `prognosis`: "Always an estimate based on groups of similar patients, never a
prediction for one person." When in doubt, write the sentence those entries would write.

**The known gap.** `tldr`, `summary` and long prose fields are rendered raw, outside the fold, above everything else.
Almost every finding in this review was a survival figure or a survival claim that escaped into one of them. Wrapping
`summary` in `SurvivalDisclosure` would shred narrative paragraphs into fragments, so it is an owner decision, not a
default. Until then, prose fields must carry their own cohort and their own guard.

## What a reader should meet first on a page about a disease that often kills

This is the pattern, not a formula. A page has to say the hard thing; it is the **order** that decides whether the
reader can act on it.

1. **What it is.** The disease, in one clause a person can repeat to a relative.
2. **What is done about it.** Before any outcome figure. Not a promise, just the named thing: the operation, the
   regimen, the trial, the referral.
3. **What that has changed, with its number and its trial.** This is where the honest bad news belongs, because by
   now the reader has somewhere to put it.
4. **Where the reader goes next.** A trial, a specialist centre, a second opinion, symptom control alongside
   treatment. A page about a disease that often kills must never end on a full stop after an absence.

`/cancers/limited-stage-sclc/` does all four in two sentences: *"Small-cell lung cancer that is still confined to one
side of the chest is treated to cure with chemotherapy and radiotherapy given together. Adding two years of the
immunotherapy antibody durvalumab afterwards lengthened median survival from under three years to over four and a
half, the first improvement in this disease in decades."*

`/cancers/pancreatic/` does it on the hardest common cancer there is: *"Almost every pancreatic tumour carries a KRAS
mutation, and for the first time drugs against it work: daraxonrasib nearly doubled survival in previously treated
disease in 2026. Pancreatic cancer has been the hardest common cancer to treat once advanced; that is what is
starting to change."*

`/survival/` is the model for a whole page of numbers: the lede leads with the lever ("Survival depends first on stage
at diagnosis") rather than a figure, the table sits behind a click, and every cell carries its cohort, its period and
its source.

## The five failures, with before and after from the real pages

### 1. Sentences that foreclose

Not only "nothing more can be done". Any construction that quietly tells a reader the story is over: a treatment
section that stops at the last line of therapy, an open problem that names no attempt on it, a lede whose final
clause cancels the sentence before it.

| Where | Before | After |
| --- | --- | --- |
| `/cancers/glioblastoma/coming/`, "Open problems and what is being done" | "Paediatric tumours (DIPG) have one approved drug with 22% response; durable control remains out of reach." | "Diffuse midline glioma has one approved drug, dordaviprone, with a 22% response rate; making those responses last is the open question, and the phase 3 ACTION trial, GD2 CAR-T and convection-enhanced delivery are the attempts on it." |
| `/cancers/sertoli-cell-tumour/`, lede | "Most are benign and cured by removing the testis; about one in ten spread, and there is no good treatment for those." | "Most are benign and cured by removing the testis. About one in ten spread, and no systemic treatment has been shown to work for those, so care is planned case by case at a specialist centre." |
| `/for-me/`, "Where you are", generated | "No row later in the course is recorded after this one." | "This is the last setting OnCo records by line of therapy; the trials and questions below are not organised by line." |
| `/cancers/dipg-dmg/`, Overview | "Decades of chemotherapy and targeted-agent trials added nothing." | "More than 200 chemotherapy and targeted agents were tested from 1990 onward and none added benefit over radiotherapy alone, which is why biopsy and molecular diagnosis became standard." |

The test: read the last clause of the block. If it is an absence, the block is not finished.

### 2. Numbers used as verdicts

A figure with no denominator, no cohort, no year and no source is not a fact the site stands behind; it is an
adjective wearing a number's clothes. A median stated without saying that half of the people counted lived longer is
the classic failure, and it is the one this review found most often.

| Where | Before | After |
| --- | --- | --- |
| `/cancers/glioblastoma/`, "Show survival figures" | "Median survival for glioblastoma with maximal therapy is about 15 months." | "In the Stupp trial (EORTC 26981-NCIC, 2005) median survival with surgery, radiotherapy and temozolomide was 14.6 months against 12.1 with radiotherapy alone, and two-year survival rose from 10 to 27 percent; half of that trial's patients lived longer than the median, and a median describes a trial population rather than one person." |
| `/cancers/renal-medullary-carcinoma/`, lede | "Most patients have spread at diagnosis and live about a year on average; chemotherapy and removal of the kidney are the main treatments, and better drugs are urgently needed." | "Platinum chemotherapy and removing the kidney are the main treatments. Most have spread when found; in the 52-patient series median survival was 13.0 months, 16.4 with nephrectomy against 7.0 without. So few centres see it that a trial and a second opinion are worth asking for." |
| `/cancers/sclc/`, "Show survival figures" | "Median survival is nearly five years in limited-stage and about one year in extensive-stage disease." | "In ADRIATIC, median survival with durvalumab consolidation after chemoradiotherapy was 55.9 months against 33.4 with placebo; in extensive-stage disease first-line chemo-immunotherapy gives a median of about a year. Both are medians in trial populations, so half of those patients lived longer." |
| `/cancers/advanced-adrenocortical-carcinoma/`, Overview | "median survival is measured in months to a few years." | (removed; the sentence now ends) "Referral to an ENSAT centre and to a trial is recommended for every patient." |

The rounding matters too. "About a year on average" was a rounded, unattributed version of a 13.0-month median that
the same record already carried with its cohort two paragraphs down. Rounding a figure away from its source turns it
into a verdict.

### 3. Order

A page that opens on how lethal a disease is and reaches what can be done three screens later is fatalistic in
structure even if every word in it is neutral. At 390 px the page is simply source order stacked, so source order is
the design.

| Where | Before | After |
| --- | --- | --- |
| `/cancers/colorectal/uk/`, first sentence, the whole first screen at 390 px | "Around 48,200 people a year are diagnosed with bowel cancer in the UK and around 17,700 die of it: the fourth most common cancer and the second most common cause of cancer death." | "Around 48,200 people a year are diagnosed with bowel cancer in the UK, the fourth most common cancer, and it is the one the NHS reports on best." The mortality figure keeps its place later in the same paragraph, now with its source and period. |
| `/first-60-days/<id>/`, all 455 guides | The cancer record's encyclopaedia TL;DR, then the guide's framing. | The guide's framing first ("Below, week by week, is what OnCo's record says about the first two months"), then the TL;DR. One line in `src/app/first-60-days/[id]/page.tsx`. |
| `/first-60-days/pancreatic/`, "Week 1 to 2" | "…if the cancer cannot be cured ask about the SR1 form." The SR1 is the form for people not expected to live six months, and it arrived before the surgeon and oncologist appointments in Week 2 to 4. | The clause now says what the form does and follows the things that come first; the reader meets their surgeon before they meet the terminal-illness benefit form. |
| `/for-me/`, situation view | A reader who ticked "the diagnosis is recent" got the first-60-days guide seventh of eight sections, under biomarker matching, trial matching and six red emergency cards. | When `diagnosedRecently` is set, `first60` moves to sit directly under "Where you are". |
| `/navigator/` | The "Not medical advice" note was in `border-rose-300 bg-rose-50/60`, the palette the site reserves for "Emergency services now". | Neutral card, same words. Rose means ring now, or it means nothing. |

### 4. Asymmetry

If a benefit is hedged and a harm is not, the page has a thumb on the scale. The tell is an adjective or a caveat
attached to exactly one side.

| Where | Before | After |
| --- | --- | --- |
| `src/data/survival-map.ts` | Every note in the file reads "better survival than this average" or "worse survival than this average", plainly. Glioblastoma alone read "glioblastoma survival is far below this average". | "glioblastoma has worse survival than this average". The house form, restored. The magnitude belongs on the glioblastoma record, with its cohort. |
| `/cancers/glioblastoma/`, State of the art | "Locoregional CAR-T produces objective responses in recurrent glioblastoma and DIPG, though transient." The only hedged item in an eight-item list, and the hedge was on the good news. | "…including a sustained complete response; most responses so far have been short-lived, and making them last is what the phase 1 trials are testing." |
| `/cancers/nsclc/`, State of the art | "5-year survival with pembrolizumab in PD-L1-high disease is ~32%, unthinkable a decade ago." | "…is 31.9% in the KEYNOTE-024 five-year analysis, against 16.3% with platinum chemotherapy in the same trial." |
| `/cancers/prostate/`, continence and sexual function | The continence figures were given plainly; the sexual-function ones were introduced with "the numbers are in the first row of this page and they are not gentle." | "…the figures are in the first row of this page, and they are worth reading with someone rather than alone." |
| `/survival/` | "…so for fast-moving cancers current survival is likely better than the number shown." No cancer named, no source, on a page where every pessimistic figure carries four. | "…so where a cancer has had a new standard of care since 2022, current survival is likely better than the number shown, by an amount nobody can yet quantify: the cohort that would measure it has not been followed for five years." |

### 5. The second person

Where the page says "you", check what it assumes about the reader: that they will decline, that they are frightened,
that they are old, that they are alone.

| Where | Before | After |
| --- | --- | --- |
| `/first-60-days/lung-cancer/`, Week 2 to 4 | "Sort the practical things **while you feel able**." | "Sort the practical things early." The cited source gives a different reason entirely: getting help early stops it becoming a bigger job later. |
| `/first-60-days/sclc/`, Week 2 to 4 | "Do the practical paperwork **while you feel well**: work, sick pay, benefits, and **anything you would want sorted**." | "Sort the practical paperwork early, while you have the energy: work, sick pay and benefits." |
| `/first-60-days/<several>/`, By day 60 | "know who to talk to **when** it gets hard" | "…**if** it gets hard". One word, three checklists. |
| `/first-60-days/prostate/`, By day 60 | "Say out loud, to one person, how you are actually doing." Median age at diagnosis is 70; the item cannot be ticked by a man who lives alone. | "Tell someone how you are actually doing: a partner, a friend, your nurse specialist, or Prostate Cancer UK's specialist nurses if there is no one else to hand." |
| `/v2/` | "…and the ones nobody warns you about." | "…and the ones that are easy to miss because they do not feel like an emergency." The page's job is to make the reader trust the 24-hour line, not to tell them their team has failed them. |

## A sixth thing, specific to safety pages

Red-flag surfaces are the most-read artefacts on the site: the card goes on a fridge and is read cold, weeks before
it is needed. A list of emergencies with a phone number under it and nothing else is a list of ways to be in danger.

- `src/components/RedFlagCard.tsx` now opens with "When in doubt, call. Nobody minds a false alarm, and every one of
  these is treated faster the earlier the team hears about it." It was previously the last line, in 11 px, under the
  sources.
- `src/components/RedCards.tsx` now says what the strip is for before it says where it came from: "What to watch for
  and who to call, from the labels and guidelines behind the standard of care."
- `src/data/side-effect-guidance.ts`, febrile neutropenia: the card gave the danger and stopped. It now carries the
  other half of its own source: "NICE CG151 asks for antibiotics within an hour of arrival, and treated that fast
  most people recover. That is why the rule is to ring straight away rather than wait and see."

`/symptoms/` is the model: "most causes are not cancer" is inside the first sentence.

## A seventh thing, specific to rare cancers

A thin page is four to six paragraphs of prose inside two hundred lines of furniture, so its adjectives carry the
whole emotional load, and its cohorts are tiny. Two sentences already in the corpus are the pattern:

- `/cancers/localised-penile-cancer/`: "the rarity of penile cancer means that referral to a specialised centre, as
  required in the United Kingdom since 2002, improves organ preservation and survival".
- `/cancers/phyllodes-tumour/`: "The rarity of the disease means margin width, the role of radiotherapy and the value
  of molecular grading rest on retrospective series and registries rather than trials."

Both say the same thing: **thin evidence is a statement about how much has been studied, not about how any one person
will do.** A rare-cancer page that says "there are no trials" and stops has told the reader the opposite.

## Checks before shipping a page about a disease that often kills

1. Read the first three sentences aloud. Is what can be done in them?
2. Read the last clause of every block. Is any of them an absence?
3. For every survival figure: denominator, cohort, year, source. Four out of four, or it does not ship.
4. For every median: does the sentence say that half the people counted lived longer?
5. List the adjectives. Delete any that no cited figure supports.
6. Count the hedges. Are they on both sides?
7. Search for "you". What does each one assume?
8. Is the text a quotation? Then none of the above applies, and say that it is quoted.

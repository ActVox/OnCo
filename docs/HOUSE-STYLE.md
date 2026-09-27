# House style

How OnCo writes. The rules here are the ones that are checked: `src/lib/tone.test.ts` gates the tone rule below,
`src/lib/corpus-rules.test.ts` gates the mechanical ones (no em or en dashes, no "as of" date stamps, no the word
"spike", TL;DRs that are full sentences and free of undefined acronyms). A rule that is not checked rots, so if you
add one here, add the test in the same change.

## Who the reader is

Someone who has the cancer on the page, or loves someone who does, reading at two in the morning. They can carry any
fact. What they cannot use is a verdict.

## The tone rule

**No fatalistic or defeatist language in OnCo's own voice. The numbers stay and the adjectives go.**

"Five-year survival is 8 per cent (SEER 22, 2014 to 2020)" is honest and usable. "A dismal prognosis" is neither: it
is the same news with the information removed and a feeling put in its place. A word like "relentless" adds nothing
a reader can act on and takes something from them.

This is not a rule about being reassuring. A cancer with poor survival must still say so, with its figures and its
cohorts, and a treatment that does not work must be said to not work. Softening a fact would be a different way of
failing the same reader.

### The worked example

The adenoid cystic carcinoma page was rewritten on 27 September 2026 after the owner read it. Before:

> Adenoid cystic carcinoma is a slow but **relentless** cancer of the salivary glands that creeps along nerves and
> comes back years later, often in the lungs. Surgery with radiotherapy is the only cure, chemotherapy **barely
> works**, and the tablets lenvatinib and axitinib can hold spreading disease still for months rather than shrink it.

After:

> Adenoid cystic carcinoma is a **slow-growing** cancer of the salivary glands that **spreads** along nerves and **can
> come back years after treatment**, often in the lungs. Surgery with radiotherapy is **the treatment that cures it**,
> chemotherapy **has little effect**, and the tablets lenvatinib and axitinib can hold spreading disease still for
> months rather than shrink it.

Note what did not change. Every fact is the same and none is softened: it still spreads along nerves, it still comes
back years later, it still goes to the lungs, chemotherapy still does not work. What went was the editorialising
adjective that told the reader how to feel about their own disease, and the flat "barely works" became the plain
"has little effect".

### The vocabulary

Checked by `src/lib/tone.test.ts`, which fails on any of these in a field OnCo authors:

- **Adjectives of doom**: relentless, merciless, unforgiving, inexorable, dismal, bleak, abysmal, woeful, grim,
  devastating, ravaged.
- **Verdicts of death**: uniformly, invariably, universally or inevitably fatal or lethal; death sentence; doomed;
  untreatable.
- **Foreclosing**: hopeless, no hope, nothing more can be done.
- **Battle metaphors about people**: lost their battle, fought bravely, a brave fight, succumbed to, cancer victim.
- **Flatness where a fact belongs**: "barely works" (say what the treatment does, or does not do).

Not checked but the same rule, because judgement is needed each time:

- **"Poor prognosis" and "poor outlook"** are usually a figure in disguise: say "shorter survival", or better, give
  the survival with its cohort and source. They are allowed in a technical field, where "FLT3-ITD predicts shorter
  survival" is the standard way to report what a marker does, and where a classification is named for them (the
  IGCCCG good, intermediate and poor prognosis groups). The test does forbid them in the fields a reader meets
  first: `tldr`, `simple`, `burden`, and the patient-facing surfaces.
- **"Incurable"** stays. For many advanced cancers it is the accurate and necessary word and a reader planning their
  life deserves it plainly. "Treatable but not curable" is honest and useful; "an incurable and devastating disease"
  is neither. Remove it only where it is doing the work of an adjective rather than stating a fact.
- **"Only" and "just" in front of a survival figure**, "unfortunately", "sadly": the number carries the news. "Only
  16 per cent could be treated for cure" is a fair contrast when the sentence is about the gap; "only 8 per cent
  survive five years" is a nudge.
- **Bare mortality where survival says the same thing.** Prefer "five-year survival is 12 per cent" to "88 per cent
  are dead within five years"; prefer "the commonest cause of cancer death" to "the biggest cancer killer".
- **"Deadliest"** is a superlative about mortality. Where a cleaner factual phrasing exists, use it: "the common
  cancer with the lowest survival".

### Historical states

Where the fatalistic phrase was describing what used to be true, keep the history and state it as a fact. What the
outcome was before a treatment existed is worth having:

- "turned acute lymphoblastic leukaemia from uniformly fatal to curable" became "from a disease almost no child
  survived into a curable one".
- "It was almost uniformly fatal within months" became "Few patients lived more than a few months".
- "once uniformly lethal" became "which no treatment used to touch".

## Quotations are never edited

This is the one thing not to get wrong. A quoted abstract, a paper or trial title, a guideline statement, a label
threshold, a charity's own words: those are someone else's and they stay exactly as written, fatalism and all.
`src/data/papers-cited-wave7.ts` holds a glioblastoma abstract that says "remains almost invariably fatal" and
`papers-trials-wave1.ts` one that says "a uniformly fatal disease"; both are correct as they are. Rewriting a
quotation to be kinder would be a worse offence than the one this page is about. If a quotation's framing is a
problem, the fix is to add context around it.

The tone test excludes quotations by construction, not by listing them: the fields that hold other people's words
(`name`, `title`, `aka`, `label`, `quote`, `quotes`, `setting`, `authors`, `journal`, `sourceLabel`) are never
matched; a `summary` on a record carrying the machine tag `europepmc-ingest` is a reproduced abstract and is
skipped; and any span inside quotation marks is removed before matching. Anything that still survives with a listed
word is recorded in `TONE_EXCEPTIONS` with the reason it survives.

## The mechanical rules

Checked in `src/lib/corpus-rules.test.ts`:

- **No em dashes or en dashes.** Write "to" for a range, otherwise a comma, a colon or a full stop.
- **No "as of <date>" stamps in prose.** Dates belong in `asOf`, `checked` or `year`.
- **Never the word "spike"** in rendered copy; say "deep dive". The internal `tags: ["spike"]` is not rendered.
- **TL;DRs are full sentences** and use no trial or endpoint acronym the glossary does not define.
- **UK spelling** in anything written now (the corpus predates the rule in places, and quoted titles keep the
  spelling of their source).
- **No superlatives without a comparator.** "First", "largest", "only" need a source.

## Where else this is written down

`CONTRIBUTING.md` (the Style section) for contributors, `docs/CANCER-PAGES.md` for what a cancer record must carry,
and the header comments of `src/lib/tone.test.ts` and `src/lib/corpus-rules.test.ts` for the checks themselves.

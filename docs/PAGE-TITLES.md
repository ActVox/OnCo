# Page titles, reviewed against one test

The owner, 28 September 2026: "do a review for poorly worded sections and their improved versions eg Forest plot
for https://onco.cc/forest/ just sits there without any context. we need clean and correct names for all sections
that are functional and not vague."

**The test applied to every page below.** Read only the heading, and say what you would find on the page and why
you would go there. If you cannot, the heading is doing the wrong job.

Terse is not vague. `/changelog/`, `/contributors/` and `/corrections/` are one word each and pass. Three kinds of
title fail:

1. **The format, not the question.** "Forest plot" names the drawing. The page's own description already said the
   useful thing: "Every hazard ratio with its confidence interval in the OnCo trial corpus, side by side on one
   log axis."
2. **The title that could belong to any website.** "Explore", "Compare", "Atlas", "Evidence", "Audit", "Query".
3. **The title that needs the reader to know a term first.** "Modalities", "irAE guide", "HTA decisions",
   "Addressable population".

## What was examined, and what changed

| | Count |
| --- | --- |
| Static routes with a page of their own | 152 (127 of them single-segment, the figure in CONTENT-ROADMAP §12) |
| Kind index pages (`/cancers/`, `/trials/` …), titled from `KIND_META` | 20 |
| Dynamic title patterns (`/cancers/[id]/…`, `/modalities/[format]/` …) | 24 |
| Navigation labels in `src/lib/nav.ts` | 6 groups, 159 item entries (some pages appear in two groups) |
| **Titles changed** | **30 pages** (22 of them also a navigation label) |
| **Proposed and left to the owner** | **17** |
| Judged fine and left alone | the rest, listed below |

## 1. Changed

**The first attempt was rejected, 29 September 2026.** The owner: "i dont like the title changes you propose,
what are the optimal functional language that doesnt assume the reader knows what they are looking at". Of the
thirty, the one he named as right was `/universities/` "Research output ranking" becoming "Universities by
research output".

The fault was that the first attempt answered "is this vague?" by writing a sentence: "How much each trial
changed the risk", "Count what exists, and where", "Build a query, get a table". A sentence reads well in one
place and badly in five, and a title has five jobs: the browser tab, the navigation item, the page's own `<h1>`,
the breadcrumb, and the search result. The accepted one is a noun phrase: a thing, and the dimension that orders
it. `src/lib/nav.ts` already carried three strings per page (`label`, `blurb`, and the page's own `title`) and
the first attempt put sentences in all three.

### The rule

1. **A noun phrase, never a sentence and never a question.** Name what is on the page, not what the reader
   should do with it.
2. **Thing, then dimension.** "Universities by research output". "Funding verdicts by country". "Side effect
   rates across a drug class". The dimension is what makes it this page and not a neighbouring one.
3. **Where a real term is the right word, keep it and gloss it after a colon.** The site already does this:
   "Checkpoints: one word, two biologies". The term stays findable, the gloss removes the assumption.
4. **The menu label is short, the page title carries the gloss.** Two to four words in `label`; the colon and
   the gloss belong in `title` and the `<h1>`.
5. **No word that means something else in a clinic.** "Effects" reads as side effects. "Currency" reads as money
   on a site that discusses drug prices. "Benefit per trial" is wrong for the trials that showed harm.

The owner approved this second set on 30 September 2026: "on the titles changes some are better some are worse.
generally better so you can do that".

### What each page is called now

| Route | Menu label | Page title | Was |
| --- | --- | --- | --- |
| `/forest/` | Trial by trial | Every trial's result on one scale | Forest plot |
| `/pivot/` | Counts by category | Counts across cancers, targets and companies | Landscape grid |
| `/path/` | Connections | Connections: how any two records are linked | Path finder |
| `/resistance/` | Resistance | Resistance: how tumours escape each drug class | Resistance atlas |
| `/atlas/` | Organ maps | Organ maps: where a cancer starts and where it spreads | Atlas |
| `/atlas/spread/` | (not in the menu) | Where advanced disease reaches, and what treats it | Atlas: where advanced disease can reach |
| `/explore/` | Browse by cancer | Browse the corpus by cancer and kind | Explore |
| `/compare/` | Compare | Compare up to five, side by side | Compare |
| `/evidence/` | Evidence strength | Trials by strength of evidence | Evidence |
| `/query/` | Query builder | Query builder: structured questions over the corpus | Query |
| `/audit/` | Automated checks | Automated checks: what the build and the weekly sweep found | Audit |
| `/machines/` | Machines | Machines used against cancer | Machines |
| `/freshness/` | Re-check dates | Re-check dates: how old a record is allowed to get | Freshness |
| `/completeness/` | Coverage of the field | Coverage of the field: OnCo against what exists | Completeness |
| `/status/` | Feed status | Feed status: when each source last ran | Data currency |
| `/modalities/` | Medicine types | Medicine types: ADCs, CAR-T, radioligands and the rest | Modalities |
| `/market/` | Patients per year | Patients per year a treatment could reach | Addressable population |
| `/catalysts/` | Company calendar | Company calendar: decisions, readouts and filings by date | Catalyst calendar |
| `/toxicity/` | Side effect rates | Side effect rates across a drug class | Toxicity compare |
| `/hta/` | Funding verdicts | Funding verdicts by country | HTA decisions |
| `/irae/` | Checkpoint side effects | Checkpoint side effects by organ | irAE guide |
| `/pulse/` | This month | This month in oncology research | Research pulse |
| `/eval/` | Answer quality | Answer quality: 100 questions, scored in public | Open evaluation |
| `/universities/` | Universities | Universities by research output | Research output ranking |
| `/regulatory/regions/` | Approvals by country | Approval differences by country | Regulatory regions |

Five more had only the problem that the `<title>` and the `<h1>` were two different names. Each keeps the half
that was already doing the job, and the other is deleted: `/find/` "Start here", `/map/` "Cancers & treatments",
`/intel/` "News & evidence", `/review/` "Review: model panel and human queue", `/checkpoints/` "Checkpoints: one
word, two biologies".

One in-page heading changed with them: `/freshness/` "The SLAs" is now "How old is too old, by kind". An acronym
was the reader's signpost, and the paragraph under it already explains the rule.

**Nothing moves and nothing becomes unfindable.** No route changed. Navigation items carry an `aka` field with
every name the page used to go by, which the search index reads, so "forest plot", "hazard ratio", "landscape
grid", "pivot table", "irAE guide", "HTA decisions", "Addressable population" and the rest still reach their
pages. The eight translated navigation dictionaries were rewritten to match.

### Three I am not satisfied with, and said so

- **`/forest/`.** The page is every hazard ratio with its confidence interval on one log axis. "Trial by trial"
  says nothing about risk; "Effect sizes" is jargon; "Benefit per trial" is wrong for the trials that showed
  harm. "Every trial's result on one scale" is the most honest short phrase available and is still weak.
- **`/pivot/`.** The page counts any kind by any two dimensions. Every accurate title is either abstract or a
  list of examples that will go stale.
- **`/eval/`.** "Answer quality" does not say whose. The page scores OnCo, a search engine and an AI assistant on
  the same rubric, and being the one that publishes its own score is the point.

## 2. Proposed, and left to the owner

These are matters of taste, or they carry a cost outside the title (a published feed name, a route's own
vocabulary), so the code is unchanged.

| Route | Current | Proposed | Why it is the owner's call |
| --- | --- | --- | --- |
| `/edge/` | Edge | Edge: the newest thing in every source | "Edge" is a brand with an Atom and a JSON feed published under that name; renaming it changes a subscription's title |
| `/failures/` | Failure museum | What did not work, and what it taught | "Museum" is a metaphor, but a memorable and honest one; the owner chose it |
| `/free/` | Free in oncology | What you can get for nothing | Odd phrasing, but it does say what is on the page; the lede is already the better line |
| `/exclusivity/` | Exclusivity expiry | When patent protection ends, and what follows | The term is precise (patent *and* regulatory exclusivity); a plainer title risks being less accurate |
| `/rankings/` | Rankings | League tables from the corpus | Passes weakly: rankings of what is not on its face |
| `/graph/` | Graph explorer | The knowledge graph, explored | Names a format, but "graph" is what the thing is |
| `/molecules/` | Molecule gallery | Every product with a 3D structure | "Gallery" is a format word; the page is self-explanatory once seen |
| `/newsletter/` | Weekly issue | The weekly issue: what changed | Weak on its own, clear beside "Newsletter" in the menu |
| `/tagged/` | Tags | Every tag, and what carries it | One word, but an accurate one |
| `/saved/` | Saved | Your saved views and watched pages | One word, accurate, and the page is `noindex` |
| `/navigator/` | Line-of-therapy navigator | What to consider next, for your stage | "Line of therapy" is a term, but the audience for this tool mostly knows it |
| `/open-tools/` vs `/open-source/` | Open tools / Open source in oncology | one of them renamed | Two titles a reader cannot tell apart without opening both |
| `/calendar/` vs `/catalysts/` | Readout calendar / (now) What is due next | merge, or name the difference | Two calendars of overlapping events; the split is by audience, which no title says |
| `/roadmap/` vs `/roadmaps/` | Roadmap / Roadmaps | "OnCo roadmap" and "Technology roadmaps" | One is the site's plan, the other is a kind of record; the plural is the only thing telling them apart |
| `/timeline/` | Timeline | (with the years index) | Owned by another agent this round; `/timeline/` and `/years/` need naming together |
| `/v2/` | Start here | Home, second draft | Now collides with `/find/`, whose heading is also "Start here"; `/v2/` is a design proposal, not a published entry point |
| Kind indexes | see §4 | see §4 | The kind names are the data model's vocabulary and appear in breadcrumbs, i18n keys and the API |

## 3. Examined and judged fine

Grouped by why they pass. Nothing here was changed.

**Says the subject in the fewest possible words** (terse is not vague): `/changelog/` Changelog ·
`/contributors/` Contributors · `/corrections/` Corrections · `/search/` Search · `/guidelines/` Guidelines ·
`/ask/` Ask OnCo · `/offline/` Offline · `/for-me/` For me · `/gaps/` Gaps to fill · `/idea-votes/` Idea votes ·
`/open-questions/` Open questions · `/paths/` Reading paths · `/teach/` Teaching packs · `/schema/` Data
dictionary · `/api/` Open API · `/build/` Build on OnCo · `/data-sources/` Open data · `/suggest/` Suggest an
edit · `/signup/` Stay in the loop · `/about/` About & methodology · `/learn/` Learn & contribute · `/live/`
Living with cancer.

**Names the question a reader arrives with**: `/first-60-days/` The first 60 days · `/prep/` Appointment prep
pack · `/symptoms/` Symptom to test · `/side-effects/` Side effects by symptom · `/report-reader/` Pathology
report reader · `/survivorship/` Survivorship planner · `/second-opinion/` Second-opinion finder ·
`/assistance/` Financial help · `/costs/` Cutting cancer care costs · `/coverage/` Cost and coverage by country ·
`/coverage/us/` Paying for cancer care in the United States · `/coverage/uk/` NHS cancer coverage ·
`/coverage/rankings/` Coverage rankings · `/survival/` Survival statistics · `/live/complementary/`
Complementary and supportive approaches · `/live/hair/` Hair loss and regrowth · `/tools/` Decision aids ·
`/calculators/` Clinical calculators · `/interactions/` Drug interaction checker · `/tumor-board/` Tumour board ·
`/journeys/` Treatment journeys · `/sequencing/` Lines of therapy · `/staging/` Staging and risk scores ·
`/regimens/` Regimen library · `/body/` Body map.

**Names a thing the corpus holds, accurately**: `/assays/` Companion diagnostics and assays · `/biomarker-matrix/`
Biomarker matrix · `/prevalence/` Biomarker prevalence matrix · `/cancers/map/` Cancer map · `/checkpoints/immune/`
Immune checkpoints · `/checkpoints/cell-cycle/` Cell-cycle and DNA-damage checkpoints · `/dossiers/` Target
dossiers · `/targets/genome/` Cancer genes and proteins by role · `/targets/specificity/` Target specificity: is a
cancer target unique to the tumour? · `/pathway-drugs/` Pathway-to-drug matrix · `/preclinical-models/`
Preclinical models · `/models/` Models and datasets · `/mechanics/` Mechanics of cancer · `/atlas/organs/` Organ
schematics · `/virotherapy/` Oncolytic virotherapy · `/payloads/` Payloads and linkers · `/isotopes/` Isotope
supply · `/tumour-testing/` Tumour sequencing tests · `/dependencies/` Technology dependency map ·
`/manufacturing/` Manufacturing map · `/pipeline/` Pipeline funnel · `/pipeline/engine/` Open drug engine ·
`/trial-designs/` Trial design picker · `/explained/` Trials in plain words · `/digests/` Congress digests ·
`/preprints/` Preprint tracker · `/papers/` Publishing trends · `/journals/`-as-kind (see §4) · `/deals/` Deals
and licences · `/regulatory/` Regulatory timeline · `/law/` Laws around oncology · `/resistance/gaps/`
Unaddressed resistance · `/report/2026/` The state of the war on cancer, 2026 · `/report/` Annual report.

**People, places and institutions**: `/institutions/` (kind) · `/universities/` (changed, §1) · `/leadership/`
Trial leadership · `/heroes/` Heroes and heroines · `/startups/` Oncology startups · `/startup-requests/`
Requests for startups · `/investors/` Oncology investors · `/scorecards/` Company scorecards · `/sponsors/` Trial
sponsors · `/countries/` Country research rankings · `/countries/us|gb|de|in|cn|jp|il|ru/` Cancer in *country* ·
`/cases/` Cases by country · `/funding/` Funding flows.

**How the site works**: `/history/` Recent changes · `/reviewers/` Reviewer roster · `/eval/` (changed, §1) ·
`/privacy/` Privacy policy · `/terms-of-use/` Terms of use · `/ideas/rankings/` Idea rankings · `/hub/` (serves
`/roadmap/`, `noindex`).

## 4. Kind index pages: proposed, not changed

The title of `/cancers/`, `/trials/` and the other 18 kind indexes comes from `KIND_META` in `src/lib/kinds.ts`
and is also the kind's name in breadcrumbs, in the API, in nine i18n files and in every "what kind is this" pill.
Renaming one is a vocabulary change, not a title change, so these are all the owner's call.

| Kind index and its title | Verdict |
| --- | --- |
| `/cancers/` Cancers · `/trials/` Trials · `/targets/` Targets · `/companies/` Companies · `/institutions/` Institutions · `/people/` People · `/journals/` Journals · `/biomarkers/` Biomarkers & readouts · `/technologies/` Technologies · `/pathways/` Pathways · `/key-papers/` Key papers · `/terms/` Glossary · `/drugs/` Treatments & tests | Pass: each names its records |
| `/fronts/` Fronts of the war on cancer · `/bottlenecks/` Bottlenecks of the war on cancer | Pass: the index page spells the metaphor out |
| `/ideas/` Ideas | Proposed "Ideas, each with a test": weak alone, since ideas about what is not on its face |
| `/pairings/` Pairings | Proposed "What works together, and what does not": names nothing a reader would search for |
| `/roadmaps/` Roadmaps | Proposed "Technology roadmaps": collides with `/roadmap/`, the site's own plan |
| `/collections/` Collections | Proposed "Open databases the field runs on": collections of what? |
| `/years/` Years and the timeline | Left alone: owned by another agent this round |

## 5. Dynamic titles

Record pages take their title from the record's name, which is right. Four patterns were read and left alone:
`${cancer} · Compared with its neighbours`, `The first 60 days: ${cancer}`, `Appointment sheet: ${cancer}`,
`${congress} digest`. One is worth the owner's eye: `${format}: modality hub` on `/modalities/[format]/` still
uses "modality" and "hub"; a rename would follow whatever is decided for the `/modalities/` vocabulary.

The ten cancer-page section names, the years index, `src/lib/record-sections.ts` and the section labels in the
nine i18n files were another agent's this round and were not touched.

## 6. Where a title lives

A title is in more than one place. For every change in §1 these were moved together:

- `export const metadata = pageMeta({ title })` in `src/app/<route>/page.tsx`;
- the `<PageHeader title>` the reader sees;
- the `label` in `src/lib/nav.ts` (header bar, drawer, footer, group landing page, home);
- the eight translated labels in `src/lib/i18n/nav/{ar,de,es,fr,hi,ja,pt,zh}.ts`, which are keyed by href, so the
  key survives a rename but the translation had to be rewritten;
- inbound link text elsewhere on the site: the command palette, `WhatIsBeingDone`, `EntityDetail`,
  `InvestorPanels`, the Ask "read more" links, breadcrumbs and about twenty prose sentences that named a page.

**Search.** Page documents in the site search index are built from the navigation, and their `name` is the label.
A rename would have made the old name unfindable, so `NavItem` gained an optional `aka` (former and technical
names, one per line, the same convention records use) and `src/lib/search-index.ts` now reads it. "Forest plot",
"hazard ratio", "Atlas", "irAE guide", "HTA decisions", "Landscape grid", "pivot table", "Addressable population"
and the rest still reach their pages. Ask builds its index from graph entities, not from page documents, so it is
unaffected.

**Routes.** No route changed. Every published URL still serves the same page.

**Feeds.** The Atom and iCalendar feeds keep their published names ("OnCo research pulse", the catalyst
calendar's `PRODID`): a feed title is a subscription, not a heading.

## 7. The rule this leaves behind

When adding a page, write the title last, after the lede, and check it against the test: a reader who sees only
the heading should be able to say what is on the page and why they would open it. If the lede says it better than
the title does, the title is wrong.

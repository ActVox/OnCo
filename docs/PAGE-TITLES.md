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

Each of these failed the test on one of the three counts. Page title, page heading, navigation label, the eight
translated navigation labels and every inbound link that used the old name were changed together.

| Route | Was | Now | Why it failed |
| --- | --- | --- | --- |
| `/forest/` | Forest plot | How much each trial changed the risk | Named the drawing, not the question; the reader had to know what a forest plot is |
| `/explore/` | Explore | Browse by cancer and kind | Could be any website; the page picks a cancer, switches kind and ranks |
| `/compare/` | Compare | Compare up to five, side by side | Could be any website; says nothing about what or how many |
| `/atlas/` | Atlas | Where a cancer starts and spreads | "Atlas" is a format word; the page is organ schematics and spread maps |
| `/evidence/` | Evidence | Trials ranked by strength of evidence | Could be any website; the page is a ranking, not a claim about evidence |
| `/query/` | Query | Build a query, get a table | Names the verb, not the result |
| `/audit/` | Audit | What the automated checks found | Could be any website; sounds like a financial page |
| `/freshness/` | Freshness | When each record is due a re-check | Abstract noun; the page is a due-date list |
| `/completeness/` | Completeness | How much of what exists is in OnCo | Abstract noun; the new title is the page's own first sentence |
| `/machines/` | Machines | Machines hospitals use against cancer | One word that could belong anywhere |
| `/modalities/` | Modalities | Medicines by shape: ADC, CAR-T, radioligand | Requires the term; the nav label is "Medicines by shape" |
| `/pivot/` | Landscape grid | Count what exists, and where | Named the drawing ("grid"); "landscape" is investor language |
| `/market/` | Addressable population | How many people a treatment could reach | Business jargon on a page patients reach from the pipeline |
| `/pulse/` | Research pulse | What the journals said this month | "Pulse" is a metaphor, not a subject |
| `/path/` | Path finder | How two things are connected | Named the tool, and collided with `/paths/` (reading paths) |
| `/eval/` | Open evaluation | 100 questions, scored in public | "Evaluation" of what, by whom, was not on the page's face |
| `/status/` | Data currency | When each feed last ran | "Currency" reads as money on a site that discusses drug prices |
| `/catalysts/` | Catalyst calendar | What is due next, company by company | "Catalyst" is investor jargon; the page is dated events |
| `/toxicity/` | Toxicity compare | Side effects across a drug class | Not a phrase in English, and "toxicity" is the clinical word for side effects |
| `/hta/` | HTA decisions | Funding verdicts by country | An acronym as a title; the page says who pays for what, where |
| `/resistance/` | Resistance atlas | How tumours escape each drug class | "Atlas" again; the page heading also disagreed ("Resistance mechanism atlas") |
| `/irae/` | Immune-related adverse events (nav: "irAE guide") | Checkpoint side effects by organ | An acronym in the menu and a clinical term in the title |
| `/find/` | Find (heading said "Start here") | Start here | The `<title>` disagreed with the page's own `<h1>`, which comes from the nav group |
| `/map/` | Map (heading said "Cancers & treatments") | Cancers & treatments | Same disagreement |
| `/intel/` | Intelligence (heading said "News & evidence") | News & evidence | Same disagreement, and "Intelligence" reads as a different business |
| `/regulatory/regions/` | Regulatory regions (heading: "Approval differences by country") | Approval differences by country | The `<title>` was the vague half of the pair |
| `/universities/` | Research output ranking (heading: "University research output") | Universities by research output | Two names for one page; neither said which |
| `/review/` | heading "Review" (title: "Review: model panel and human queue") | Review: model panel and human queue | The heading was the vague half of the pair |
| `/checkpoints/` | Checkpoint families (heading: "Checkpoints: one word, two biologies") | Checkpoints: one word, two biologies | The heading already did the job; the title did not |
| `/atlas/spread/` | Atlas: where advanced disease can reach… | Where advanced disease can reach, and what treats it | The "Atlas:" prefix pointed at a page that is no longer called Atlas |

One in-page heading changed with them:

| Page | Was | Now | Why |
| --- | --- | --- | --- |
| `/freshness/` | The SLAs | How old is too old, by kind | An acronym as the reader's signpost; the paragraph under it already explains the rule |

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

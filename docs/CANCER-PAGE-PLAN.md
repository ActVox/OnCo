# The cancer page: a plan, not another patch (28 September 2026)

The owner: "the cancer pages have become very poor info arch. i want to see an amazing plan on how to improve
them."

Sections 8 to 11 of `docs/CONTENT-ROADMAP.md` record seven complaints about one page in one sitting: the family
strip fills the screen, the model panel sits too high, the summary is a wall of text, the also-known-as line is
the smallest type on the page, the section names are vague, the sources column is 109 links long, and the machine
links are in a human's way. Each has been fixed on its own. Seven patches do not make a design, and this document
is the design. It is written so that each part can be approved, amended or rejected separately; the parts that are
taste rather than evidence are marked **his call**.

Nothing in this document has been built. It changes no code.

---

## 1. How this was measured

Everything below was measured on 28 September 2026, on the deployed site at `https://onco.cc`, which is what the
owner is looking at. Three throwaway scripts did it and are deleted with this commit:

- the served HTML, parsed into blocks in document order, with bytes, links and text per block;
- headless Chrome over the Chrome DevTools Protocol at **390 x 844** and **1440 x 900**, reporting the y position
  and height of every block, the first custom drawing, and any element that scrolls sideways;
- the corpus itself through `sectionPlan()` for all 455 cancer records.

Pages read: `/cancers/tnbc/`, `/cancers/pancreatic/`, `/cancers/breast-cancer/`, the thin
`/cancers/gallbladder-papillary-carcinoma/`, the section page `/cancers/tnbc/evidence/`, and
`/drugs/pembrolizumab/` for the visual-first question. `/cancers/adamantinoma-of-bone/` was named in the brief and
returns 404; the papillary gallbladder record was used as the thin page instead.

Two honest limits. The live build predates the four fixes now in flight (family strip cap, model panel to the
bottom, summary expander, readable also-known-as line), so where those change a number it is said. And there is no
behavioural data: analytics is consent-gated (`AnalyticsConsentBar`), so section 10's success measures are
structural, not "did readers stay".

---

## 2. What is on the page today

### 2.1 The whole page

| page | total | markup | hydration payload | payload share | height at 390 px | phone screens | height at 1440 px | links |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/cancers/tnbc/` | 634 KB | 265 KB | 368 KB | 58% | 31,729 px | 37.6 | 13,207 px | 513 |
| `/cancers/pancreatic/` | 653 KB | 266 KB | 387 KB | 59% | 31,922 px | 37.8 | 13,154 px | 524 |
| `/cancers/breast-cancer/` | 651 KB | 273 KB | 378 KB | 58% | 49,805 px | 59.0 | 21,794 px | 637 |
| `/cancers/gallbladder-papillary-carcinoma/` | 288 KB | 122 KB | 166 KB | 57% | 13,465 px | 16.0 | 7,709 px | 324 |
| `/cancers/tnbc/evidence/` (a section page) | 413 KB | 183 KB | 230 KB | 55% | 25,840 px | 30.6 | 11,614 px | 563 |
| `/drugs/pembrolizumab/` (another kind, for scale) | not measured | not measured | not measured | not measured | 52,853 px | 62.6 | 34,075 px | 1,094 |

A phone screen is 844 px. The flagship cancer page is **thirty-eight screens** long and the best-covered one,
breast cancer, is **fifty-nine**.

### 2.2 Triple-negative breast cancer, in document order, at 390 px

| y | height | block | what it is for |
| ---: | ---: | --- | --- |
| 0 | 57 | site header | the site |
| 57 | 36 | breadcrumbs | the site |
| 139 | 66 | the name | the record |
| 221 | 64 | also-known-as | the record, in the smallest type on the page |
| 459 | 48 | section navigator | the record |
| 532 | 680 | family strip | fifteen sibling records |
| 1,236 | **10,930** | the summary | thirteen screens of prose |
| 12,198 | 1,797 | state of the art | the record |
| 14,026 | 302 | key facts | the record |
| 14,361 | 1,375 | the organ drawing | **the first thing the site drew itself, at screen 17** |
| 15,792 | 2,360 | what it is (subtypes, staging, spread) | the record |
| 18,207 | 3,465 | eight summary cards | eight signposts to eight other pages |
| 21,712 | 6,604 | the right-hand column, now stacked underneath | model panel, then 109 sources, then the machine links |
| 28,492 | 3,237 | site footer | 175 links to the rest of the site |

### 2.3 What the markup is spent on (TNBC, 265 KB of markup)

| block | markup | links | text |
| --- | ---: | ---: | ---: |
| Overview section | 92.0 KB | 54 | 30,267 chars |
| of which: the summary prose | 47.1 KB | 0 | 21,392 chars |
| of which: state of the art | 23.9 KB | 0 | 4,678 chars |
| of which: the family strip | 11.0 KB | 16 | 690 chars |
| of which: the organ drawing | 8.3 KB | 37 | 3,038 chars |
| What it is | 37.5 KB | 58 | 6,641 chars |
| eight summary cards, together | 30.9 KB | 57 | 2,740 chars |
| the right-hand column | 40.1 KB | 133 | 16,226 chars |
| of which: sources and links | 23.9 KB | 113 | 9,346 chars |
| of which: the model panel | 12.7 KB | 11 | 6,486 chars |
| site footer | 23.3 KB | 175 | 3,622 chars |
| site header | 10.0 KB | 9 | 157 chars |
| two streamed skeletons | 8.2 KB | 0 | 14 chars |

Of the 513 links on the page, **169 are the record's own**. 175 are the site footer, 133 the right-hand column.

### 2.4 The corpus behind the layout (455 cancer records)

| section | inline on the hub | on its own page |
| --- | ---: | ---: |
| Overview | 455 | 0 |
| What it is | 454 | 1 |
| Finding it | 448 | 7 |
| **Treating it** | **451** | **4** |
| Trials and papers | 384 | 71 |
| The science | 418 | 37 |
| Where you are | 0 | 455 |
| Living with it | 436 | 19 |
| What is coming | 0 | 455 |
| Data | 0 | 455 |

1,504 section pages exist. **273 of the 455 "Where you are" cards name no record at all**, and the page each one
links to says "No country-level case numbers" and "No institutions are linked to this cancer yet" in 143 KB.

| field | min | median | p90 | max |
| --- | ---: | ---: | ---: | ---: |
| summary, characters | 676 | 1,800 | 2,472 | 21,489 (pancreatic) |
| TL;DR, characters | 109 | 352 | 395 | 400 |
| also-known-as names | 0 | 4 | 6 | 12 |
| sources in `links` | 1 | 3 | 5 | 124 (pancreatic) |
| standard-of-care rows | 1 | 4 | 7 | 39 |

227 of 455 summaries are over 1,800 characters; 6 are over 6,000.

What every cancer already has, which decides what a hub can promise: **standard of care 455 of 455**, decision
aids 455, questions to ask 455 (11 hand-written), red cards 416, an organ drawing 447, a UK pathway 88, a
first-sixty-days checklist 12.

### 2.5 The three measurements that should decide this

**One. The better the page, the less of it is on the page.** Treating it is inline on 451 cancers and a card on
4, and the 4 are exactly the deep spikes: colorectal, lung cancer, pancreatic, TNBC. Living with it, which holds
when to call and the questions to ask, is a card on 19, and they are the 19 best-covered cancers: breast, prostate,
melanoma, ovarian, gastric, the leukaemias and the rest. On breast cancer the treatment table is inline and
**26,603 px tall** (31 screens, starting at y=13,210). On TNBC the same question gets a 325 px card at y=18,605
that links away. On the thin gallbladder page it is at y=4,042. The same reader asking the same question meets
the answer at screen 4.8, at screen 15.6, or not at all, and which one depends on how much work has gone into the
cancer. A threshold in kilobytes decided that.

**Two. The page costs twice.** 58% of what a reader downloads is the hydration payload: 368 KB of TNBC's 634 KB.
The record's own prose is in the payload as props of a client component (the summary's first sentence is
serialised at byte 354,388 as `children` of a client element). `src/components/Tabs.tsx` is `"use client"` and
receives every section's rendered tree as a prop. `docs/MOBILE.md` already wrote the rule this breaks: "props are
serialised once per page, imported code ships once ... hand the client component an id rather than a tree." Every
block on this page is therefore paid for about twice, which means every block removed saves about twice.

**Three. The site's own front page promises something this page hides.** `/v2/` says: "Open your cancer's page,
then the section called When to call." On TNBC, Living with it is a summary card: the red flags are not on the
page. `/v2/` is right about the reader and the record page has not caught up.

---

## 3. What the page is for

A cancer page currently serves a newly diagnosed person, a carer, a clinician checking a guideline, an analyst and
a machine, in one scroll, at the same visual weight. That is why it is thirty-eight screens long: five readers'
pages laid end to end.

**Decision: the hub `/cancers/<id>/` is for a person who was told this week, and for the person looking after
them, in the days before their next appointment. Everyone else is served one click away, and served better.**

The argument, rather than the assertion:

1. **AGENTS.md already says so**: "Readers are patients and the people caring for them." The design has not
   followed the sentence.
2. **The corpus is built for that reader.** Every cancer carries standard of care, decision aids and questions to
   ask; 416 carry red cards. Nothing else on the page has that coverage.
3. **The other readers already have better pages.** A clinician checking a regimen wants the full standard of care
   table, which is what `/cancers/<id>/treating-it/` is; an analyst wants `/pipeline/`, `/deals/`, the tables and
   `/api/v1/`; a machine wants `sections.json` and the context files, none of which a reader sees. The hub is the
   worst version of each of those pages and the only version of the patient's page.
4. **The one reader who cannot go elsewhere is the patient**, because the other pages assume you already know
   which question you have.

What this demotes: the summary essay, the state of the art, the subtype taxonomy, the sources list, the model
panel, the tags, the machine links. What it moves off the hub entirely: everything that is a list of other
records.

**His call:** this is the decision the rest of the plan follows from. If the answer is instead "the hub is the
front door for all five readers", say so and section 5 changes shape.

---

## 4. The reader's questions, in the order they are asked

Evidence: the 26 patient questions in `src/data/benchmark.ts` (the site's own written account of what is asked),
the settings in `src/data/questions.ts`, the `first-60-days` checklists, the red-flag sets, and the ordering
`/v2/` already uses and the owner approved.

| # | the question, in the reader's words | what answers it today | where it is on TNBC at 390 px |
| ---: | --- | --- | ---: |
| 1 | Is this page about my cancer? | the name, the aka line, "Which page is mine" | 139 px, but the aka line is 12 px grey type |
| 2 | What is it, in one sentence I can repeat? | the TL;DR | 205 px |
| 3 | What does it look like, where is it? | the organ drawing | 14,402 px |
| 4 | What happens to me now? | standard of care by setting | not on the page |
| 5 | Is anything an emergency? | the red cards | not on the page |
| 6 | What do I ask at the appointment? | questions, the prep pack | 26,676 px (a Macmillan link) |
| 7 | What are the numbers, and what do they mean? | survival behind a disclosure, burden | 13,972 px |
| 8 | What else could I have, or try? | trials, what is coming | a card at 18,986 px |
| 9 | Where should I be treated? | centres, the national pathway | a card at 19,933 px |
| 10 | Who says so? | sources | 22,541 px, 109 of them |

Questions 4 and 5, the two with complete corpus coverage and the two the reader came for, are the two that are
not on the page.

---

## 5. The proposed hub: four blocks

**The principle, which is what makes this a design rather than an eighth patch:**

> **A page's shape is fixed by the reader's question, not by how much the corpus holds. Every block whose size
> grows with the corpus is capped on the hub and complete on its own page.**

Today the opposite holds: `placementOf()` reads an estimate in kilobytes and decides whether a section is on the
page at all, so the corpus decides the layout and the layout differs on every cancer. Under the principle, the hub
is the same four blocks in the same order on all 455 cancers, each bounded, and the sections hold everything.

### Block 1. Who this is for and what it is

Name; the also-known-as names as readable text under the name, not 12 px grey type at the end of the header row;
the TL;DR (median 352 characters, capped at 400 already); **the organ drawing beside the TL;DR**; the "Which page
is mine" routing note where one exists (3 records today, a gap worth filling); the family, capped at six children
ordered by what the corpus holds, with "all 15 subtypes".

Reason: questions 1, 2 and 3. And it is the visual-first ask, satisfied by moving one existing block from y=14,402
to about y=900.

### Block 2. What happens now

The standard of care, one line per setting, in the reader's order of need, capped at eight settings (p90 is 7,
max 39), each with its first-line option, its guideline chip and its references, then "See all treatment" to
`/cancers/<id>/treating-it/`, which carries the full table, the regimens, the sequencing and the surgery and
radiotherapy detail.

Reason: question 4, the reason most readers arrive. Coverage is 455 of 455, so this block is never empty and never
varies in kind. It ends the 451-versus-4 inconsistency: treatment is on every hub, bounded, and complete one click
away on every cancer.

### Block 3. What to do next

When to call tonight (up to three red cards, 416 of 455 cancers); the first sixty days where written (12); the
five questions worth asking at the next appointment with a link to the appointment pack (455); the decision aids
that apply (455).

Reason: questions 5 and 6. This is the block `/v2/` already promises and the hub does not deliver, and it is the
only block on the page that asks the reader to do something rather than to read.

### Block 4. Where to go deeper

One line per remaining section: its name, its one-line purpose, its counts, its address. Nine lines in place of
eight cards that today cost 30.9 KB to carry 2,740 characters. A section with nothing in it says "none yet" on its
line and does not get a card (273 of these today). Then, at the foot of the page: the numbers (burden, survival
behind its disclosure), the sources as a sortable table rather than a 109-item list in a column, the tags, the
provenance line, the machine links, the model panel.

Reason: questions 7 to 10, and the owner's three asks about the right-hand column, the machine links and the model
panel, all answered by the same move rather than by three patches.

### What comes off the hub entirely

| what | why | where it goes |
| --- | --- | --- |
| the summary essay (47.1 KB, 21,392 chars on TNBC) | it is an article, not an answer; 227 records are over 1,800 chars | first two paragraphs on the hub, the rest inside a `<details>`; on the six records over 6,000 chars, its own "In depth" panel in What it is |
| state of the art (23.9 KB) | it answers "what is new", which is question 8 | In development, with a three-bullet preview on the deeper line |
| subtypes, staging, spread (37.5 KB) | it is the taxonomy, not the reader's first question | Types and stages |
| the right-hand column as a column | on a phone it stacks at y=21,712, twenty-six screens down, and it is repeated on all 1,504 section pages | dissolved: identity facts into block 1, sources into the foot table, model panel and machine links into Data |
| the eight summary cards | 30.9 KB of signposts | nine lines in block 4 |

### What the four blocks should come to

Estimated from the measured pieces: about 5,500 to 6,500 px at 390 px and about 60 KB of markup for the main
column, against 21,165 px and 160 KB today. With the payload change in section 8, a TNBC hub of roughly 8,000 to
10,000 px and under 250 KB on the wire, from 31,729 px and 634 KB. These are estimates; section 10 turns them into
gates that either pass or do not.

### Visual first, measured

The owner: "i dont want the custom animations to fall too far below the main text on the page, can you bring them
up, so its more visual first for pages." Taken as given. Measured at 390 px, counting only drawings the site makes
for itself (an element at least 150 x 120 px that is not a header icon or the garden backdrop), the fault turns
out to be concentrated on one kind:

| page | first custom drawing | at screen | what it is |
| --- | ---: | ---: | --- |
| `/cancers/tnbc/` | 14,402 px | 17.1 | the breast organ wireframe |
| `/cancers/pancreatic/` | 13,839 px | 16.4 | the pancreas and bile duct wireframe |
| `/cancers/breast-cancer/` | 4,813 px | 5.7 | the same wireframe |
| `/cancers/gallbladder-papillary-carcinoma/` | 1,901 px | 2.3 | the same wireframe |
| `/drugs/pembrolizumab/` | 929 px | 1.1 | the molecule |
| `/drugs/pembrolizumab/` | 1,469 px | 1.7 | See it in action, the mechanism |

So drug pages are already visual by the second screen, and the ask is answered there. On cancer pages the drawing
is behind the summary essay, which is why block 1 puts it beside the TL;DR: 447 of 455 cancers have one, and it
moves from screen 17 to screen 1 without a new asset. The conflict to note is between the drawing and question 4:
at 390 px a drawing of 288 to 384 px pushes the treatment block down by about a third of a screen. That is worth
it. At 1440 px there is no conflict, because the drawing sits beside the TL;DR rather than under it.

---

## 6. On a phone

At 390 px the two-column grid stacks, and everything in the right-hand column lands after everything the reader
came for: on TNBC the column starts at y=21,712 and the machine links at y=28,014. The owner's complaint that the
machine links "get in the way" is a desktop reading (they sit two fifths down the markup, and at 1440 px the
sources card is at y=1,378, level with the second paragraph). Both readings are fixed by dissolving the column.

Rules for the phone, which is the majority case for a person reading at two in the morning:

1. **No block exists only to fill a column.** If it is worth showing, it is worth a place in the one-column order.
2. **The first three blocks fit in the first four screens.** Identity and drawing by screen 1, what happens now by
   screen 2, what to do next by screen 4.
3. **Everything long is a `<details>` that opens without JavaScript**, the pattern already used by `#spread` and
   the survival disclosure. No block over about 1,500 px stays open by default.
4. **Nothing scrolls sideways** except inside its own box, which `scripts/mobile-audit.ts` already gates at 392 px.
5. **The site footer is 3,237 px and 175 links on every phone page.** Recommendation: collapse its six navigation
   lists into `<details>` under 640 px, which saves about four screens on every page of the site. **His call**, and
   it is a site-wide change rather than a cancer-page one.

---

## 7. The ten sections: grouping and names

Another agent is renaming these. Treat names as in flux; this is what I would call them and how I would group
them. **The ids never change, so every published URL and anchor keeps working.**

| id (unchanged) | today | what it holds | proposed name | group |
| --- | --- | --- | --- | --- |
| `overview` | Overview | the four hub blocks | the hub itself, no tab | none |
| `treating-it` | Treating it | standard of care, regimens, surgery, radiotherapy | **Treatment** | Your care |
| `living-with-it` | Living with it | decisions, aids, when to call, first sixty days, questions | **Decisions and support** | Your care |
| `where-you-are` | Where you are | cases by country, national pathways, expert centres | **Countries and centres** | Your care |
| `what-it-is` | What it is | anatomy, subtypes, staging, spread | **Types and stages** | The disease |
| `finding-it` | Finding it | symptoms, confirmation, screening, biomarkers | **Diagnosis and screening** | The disease |
| `science` | The science | targets, prevalence, pathways, models | **Biology and targets** | The disease |
| `evidence` | Trials and papers | recruiting trials, landmark trials, papers | **Trials and papers** (already renamed) | The evidence |
| `coming` | What is coming | pipeline, open problems, roadmaps | **In development** | The evidence |
| `data` | Data | connected records, notes, machine twins, provenance | **Data** | The record |

Two notes. The owner suggested "Pipeline to combat this cancer" for `coming`; that is a good sentence and a long
tab. I would use "In development" on the tab and his sentence as the section's purpose line. **His call.** And
the group headings are for the deeper-lines block in section 5, not new routes: four headings over nine lines read
faster than nine equal lines.

---

## 8. Weight, and the one structural change

The largest single cost on the page is not a block, it is how the blocks are passed. `Tabs` is a client component
and takes every section's rendered tree as a prop, so the whole page is serialised into the hydration payload as
well as into the markup: 368 KB of TNBC's 634 KB, 55 to 59% on every page measured. The repo already knows the
rule and already applied it to the heavy tables and the family roll-up.

The change: the section navigator becomes a server-rendered list of links, and a small client component keeps only
scroll-spy and the sideways-scroll behaviour, taking the section ids and no children. The sections then render as
server children of the page.

Expected: the payload falls to the layout's own (the header, the search box, the consent bar), which
`chrome-size.test.ts` already holds under 40 KB. On TNBC that is roughly 634 KB to 300 KB before a single block
moves. It is also the highest-risk item in the plan, because scroll-spy, the hash in the URL, the anchor
forwarding and the print control all read that component. It is phase 4 for that reason, and it is separable: the
first three phases stand on their own.

---

## 9. What it costs, and what could break

### Phases, in the order they should ship

| phase | what | files | agent-hours | can ship alone |
| ---: | --- | --- | ---: | --- |
| 0 | the gates first: a test on block order and answer depth, before any block moves | `src/lib/record-sections.test.ts` | 2 | yes |
| 1 | the registry learns a third placement, `both`: a bounded preview on the hub and the full section on its page | `src/lib/record-sections.ts`, `scripts/build-api.ts`, `scripts/api-layout.ts` | 3 | yes |
| 2 | the hub renderer: the four blocks, capped, in order | `src/components/CancerRecord.tsx`, `src/components/record-blocks.tsx` | 5 | yes |
| 3 | the right-hand column dissolves: identity into block 1, sources into a foot table, model panel and machine links into Data | `src/components/EntityDetail.tsx` | 3 | yes |
| 4 | the payload: `Tabs` stops taking section trees as props | `src/components/Tabs.tsx`, `EntityDetail.tsx` | 4 | yes, last |
| 5 | names and their nine languages | `src/lib/i18n/ui.ts` and `ui/*.ts` | 2 | yes |
| 6 | the phone pass, re-measure, record the numbers | `docs/MOBILE.md`, `docs/INFORMATION-ARCHITECTURE.md` | 3 | no, last |

About 22 agent-hours, plus one deploy and one re-measure. Phases 0 to 3 are the plan; 4 is the prize; 5 and 6 are
the tidy-up.

### What could break

- **Published URLs.** Nothing is removed. Placement `both` adds section pages rather than taking any away: today
  4 cancers have a `treating-it` page, after phase 1 all 455 do, so the sitemap grows by about 450 URLs and loses
  none. `dynamicParams = false` means `pagedSectionParams()` and `generateStaticParams()` must move together, which
  `record-sections.test.ts` already checks.
- **Anchors.** `#care`, `#biology`, `#trials`, `#centres`, `#questions` and the rest are the previous layout's tab
  ids and must keep resolving. Under `both`, the hub renders the anchor's element again for every cancer, so rule 1
  of the anchor system ("the hub carries the id") holds where today it often needs the client-side forward. Fewer
  forwards, not more. The registry test scans every `/cancers/<id>/#hash` written in `src/` and fails on an anchor
  nothing renders; it stays the gate.
- **`sections.json` and its consumers.** The OpenAPI document, the MCP server, the CLI package and the context
  files all read the plan. Adding `placement: "both"` and a `hubBlocks` list is additive, but it is a public API
  shape: version the change in `CHANGELOG.md` and keep `placement` readable by anything expecting the old two
  values.
- **The print pack.** `PrintButton` prints every section, which today means every section is in the DOM. With
  phase 4 that stays true (sections are still server-rendered into the page); with block 4 it means the pack must
  pull the full sections, not the previews. Check `print-section` on the new blocks.
- **The budgets.** `HUB_BUDGET_KB` 350 and `SUBPAGE_BUDGET_KB` 600 must be **lowered** as the page shrinks, never
  raised. Ratchet them in phase 6 to the measured number plus the 15% margin the repo uses.
- **`first-60-days.ts` and `for-me-situation.ts`** write `#care` and other hub anchors; they should call
  `anchorHref()`, which already exists.
- **Nine languages.** Every new label needs an entry in all nine chrome dictionaries or the i18n parity test fails.

---

## 10. How to tell whether it worked

Baselines are today's measurements. Each row is a gate: a test where it can be one, a recorded number from
`npm run audit:weight` where it needs the built site.

| measure | today | target | how |
| --- | --- | --- | --- |
| depth of the first treatment row at 390 px | absent (TNBC, pancreatic), 13,210 px (breast), 4,042 px (thin) | under 2,500 px on **every** cancer | markup-order test over all 455 |
| blocks in the same order on every cancer | 6 of 10 sections vary by record | the four hub blocks identical on all 455 | registry test |
| a card that names no record | 273 of 455 | 0 | registry test |
| hub height at 390 px, worst cancer | 49,805 px (breast) | under 10,000 px | CDP, recorded in `docs/MOBILE.md` |
| total bytes, worst hub | 653 KB (pancreatic) | under 300 KB | `npm run audit:weight` |
| hydration payload share | 55 to 59% | under 30% | `npm run audit:weight` |
| links on a hub | 513 (TNBC) | under 200, over half of them the record's own | test |
| first custom drawing at 390 px | 14,402 px (TNBC), 4,813 px (breast) | under 1,500 px on the 447 cancers that have one | CDP |
| sideways scroll at 390 px | none on cancer pages | still none | `npm run audit:mobile` |

Two measures that are not numbers and still matter. Read the thin page, not the flagship: a cancer with two
sentences and no centres should look deliberately small, not broken. And read the page aloud to the question list
in section 4: the order is right when the answers come in that order.

---

## 11. Alternatives considered and rejected

**A. Keep patching: cap the family strip, fold the summary, move the model panel, and stop.** This is the current
course and it is measurable. The four fixes in flight remove about 11 KB (family strip), about 40 KB (the folded
summary), and move 12.7 KB down the page: roughly 63 KB of 265 KB of markup, leaving TNBC at about 25,000 px and
520 KB, with treatment still absent from the page. Rejected because it improves the page without answering the
reader's question, which is what the owner is objecting to.

**B. Two pages: `/cancers/<id>/` for patients and `/cancers/<id>/clinical/` for clinicians.** Tempting, and
rejected. It splits the canonical URL that every inbound link, every search result and every citation points at;
it doubles what a spike agent must write; and the reader mix is not binary (a carer reads the guideline, a
clinician reads the red flags). Section pages already do this better, by subject rather than by audience.

**C. The hub as a pure index: ten cards, no content.** Rejected on measurement. Eight cards on TNBC already cost
30.9 KB to carry 2,740 characters and answer nothing; a page of ten would be an honest table of contents and a
page nobody needs, because the section navigator is already the table of contents.

**D. One long page again, no section pages.** Rejected: that is where this came from, at 776 KB for gallbladder,
and `docs/INFORMATION-ARCHITECTURE.md` records the cost.

**E. Keep the estimate deciding placement, but tune the thresholds.** Rejected. Any threshold in kilobytes makes
the answer's location depend on how much has been written about the cancer, which is the fault in 2.5, measurement
one. The fix is a fixed hub shape with bounded blocks, not a better number.

**F. Hidden tab panels, one section visible at a time.** Rejected by the no-JavaScript constraint, by print, and
by search engines, and it would make the payload problem worse rather than better.

---

## 12. The same fault elsewhere: `/prevalence/` and `/biomarker-matrix/`

The principle in section 5 is general, and these two pages are its first test. Measured on 28 September 2026:
`/prevalence/` opens with a table **8,085 px wide inside a 356 px window** at 390 px (a 23:1 ratio), 44 header
cells and 207 rows, starting at y=503, which is the first thing on the page at both widths. It grows a column
every time a cancer is added.

The principle says: the matrix is the shape of the storage, not the shape of the question. A reader asks "how
often is this target altered in my cancer", which is one column, or one cell. So: pick the cancer first (the site
already has a cancer chooser), show one column as a ranked list, and keep the matrix behind "compare across
cancers" for the desktop reader who wants it. `/biomarker-matrix/` should be measured the same way in the same
pass. Not part of this plan's phases; named here so that approving the principle decides them too.

---

## 13. What needs the owner

Everything above can be argued from a number except these.

1. **Section 3: who the hub is for.** Patient-first, with everyone else one click away. Everything else follows.
2. **The four blocks and their order** (section 5), in particular that the standard of care is on every hub,
   bounded, rather than being the biggest thing on some pages and absent from others.
3. **The summary essay leaving the top of the page**: two paragraphs, then a `<details>`, and for the six longest
   records an "In depth" panel in another section.
4. **Section names**, especially "In development" against "Pipeline to combat this cancer".
5. **The drawing above or beside the TL;DR** at 1440 px. Above is stronger visually; beside keeps the first
   sentence in the first screen on a laptop.
6. **The site footer collapsing on a phone** (four screens on every page of the site), which is a site-wide change
   that this page's measurements happened to surface.
7. **The sources table**: at the foot of the hub, or on the Data section page. His words were "a table at the
   bottom of the page", so the foot of the hub is written above, but the Data section is the tidier home.

---

## 14. Four small faults found while measuring

None of these needs the plan; they are written down so they are not lost.

1. **A card that names no record, and a page that says nothing.** 273 of 455 cancers carry a "Where you are" card
   with no counts, and its page is 143 KB of "No country-level case numbers" and "No institutions are linked to
   this cancer yet". Under the principle in section 5, a section with nothing in it gets a line, not a card.
2. **An empty separator in the right-hand column.** `RecordAside` renders the Data line as JSON, then two
   separator spans in a row with nothing between them, so the page reads "JSON · · Print". One-line fix in
   `src/components/EntityDetail.tsx`.
3. **The model panel quotes the record's own summary back at the reader.** The first sentence of the TNBC summary
   appears twice in the markup: once in the prose, once inside the model panel's fact-check quote. That is part of
   why the panel is 12.7 KB.
4. **`/cancers/adamantinoma-of-bone/` returns 404** but is linked from the brief that commissioned this document,
   so something once pointed at it. Worth a check against the redirect stubs.

# Mobile: two-column tools

The owner's report (23 Sept 2026): "this view doesn't work well on mobile: /body/". Many OnCo tools put a control list in one column and the thing it drives in the other. Below the `lg` breakpoint (64rem) the columns stack, so at 390 px a tap in the controls changed something a screen or more away. This pass found every view with that shape, measured each at 390 x 844 in headless Chrome (tap a control, then check whether the driven element's bounding box is inside the viewport), and fixed the ones that failed with one of three patterns. Desktop layouts are unchanged.

## Patterns

- **Sticky preview** (`data-mobile-pattern="sticky-preview"`): the driven element moves above the controls and sticks under the site header at no more than 40 percent of the viewport height (`max-lg:sticky max-lg:top-14 max-lg:max-h-[40vh]`), scrolling inside itself; the controls scroll beneath. Controls point at it with `aria-controls`; it announces with `aria-live="polite"`.
- **Choose / view** (`data-mobile-pattern="choose-view"`, `src/components/ChooseView.tsx`): two pills with glyphs, "Choose" and "View" (renamed per view), in a sticky bar under the header switch between the two panes; a choice shows the view (or, for multi-select tools, updates the count on the View pill); a "Back" link and the Choose pill return. The pills are `role="tab"` with `aria-controls`; the View pill's hint is mirrored in an `sr-only` live region. Both panes stay in the DOM and both print (globals.css). Focus moves to the shown pane on small screens only.
- **Inline** (`data-mobile-pattern="inline"`): the driven element is reordered to sit directly under the control on small screens (`max-lg:order-first` or `max-md:order-first`).

Every fixed or audited view names its wrapper (`data-mobile-view`), a representative control (`data-mobile-control`) and the driven element (`data-mobile-driven`). `npm run audit:mobile [base-url]` (scripts/mobile-audit.ts) taps each control at 390 px and fails if the effect is off screen; `src/components/mobile-patterns.test.ts` keeps the structure in the static markup.

## Views

One line per view: route, what drives what, what changed.

| Route | Drives | Before (390 px) | Change |
| --- | --- | --- | --- |
| `/body/` (BodyMap) | Tap an organ on the figure, or a system-wide chip, shows the region's cancers or technologies in a panel | Panel sat below a two-screen figure (top at 1052 to 1320 px after a tap) | Sticky preview: the panel goes above the figure and sticks under the header (40vh, scrolls inside); compact hint when nothing is pinned; `aria-controls="body-detail"` on every organ and chip |
| `/body/` (SpreadPicker) | Cancer select drives the spread map and site list | Select is directly above the heading and the folded map; effect visible | None |
| `/graph/` (GraphExplorer) | Panel "Start from" and neighbour buttons refocus the scene; scene taps update the panel | Scene 619 px above the viewport after tapping a neighbour deep in the panel | Sticky preview: the scene sticks under the header at 40vh (the SVG letterboxes); panel buttons carry `aria-controls="gx-scene"` |
| `/tumor-board/` (TumorBoard) | Cancer select and biomarker ticks drive the ranked matches | Matches header at 1120 px after the first tick; the aside was a nested 85vh scroller on mobile | Choose / Matches pills: the first tick shows the matches, later ticks update "Matches · n" live; aside scroller is `lg:` only |
| `/query/` (QueryBuilder) | Saved and multi-hop example queries drive the query form and results | Form card at 946 px after tapping a saved query | Saved queries / Results pills; loading a query shows the results with the count on the pill |
| `/irae/` (IraeGuide) | Organ list and grade filter drive the management card | Card at 939 px after picking an organ; aside was a nested 85vh scroller | Choose / Card pills; picking an organ or grade shows the card; aside scroller is `lg:` only |
| `/prep/` (PrepPack) | Cancer tiles and question ticks drive the printable pack | Pack at 3244 px after a tick; only the builder toolbar count was visible | Build / Pack pills with the running "n questions" hint (live region); the builder's own toolbar sticks on desktop only, so there is one bar on a phone |
| `/prep/[id]/` (PrepSheet) | Question ticks and custom questions drive the appointment sheet | Sheet below a 28rem nested scroller; the count lived in the sheet | Tick / Sheet pills with the running count; question list scroller is `lg:` only |
| `/path/` (PathFinder) | Example buttons (right column) fill the From and To pickers and the routes | Pickers and routes above the examples, off screen when the routes were long; chips overflowed the viewport (748 px wide) | Inline: examples go first below lg so the pickers and routes follow directly beneath; route chips wrap inside the card |
| `/deals/` (DealFlow) | Tapping a chord ribbon lists its deals | Deal list under the region matrix at 890 px; the matrix widened the page to 522 px | Inline: the deal list sits directly under the drawing below md, `aria-live`, `aria-controls="deal-flow-detail"` on the drawing. The matrix scrolls inside `ScrollRow` (edge fade and arrow buttons, `src/components/ScrollRow.tsx`) and the grid children can shrink (`min-w-0`) |
| `/dependencies/` (DagViewer) | Root picker (above the map) narrows the map; hover on a tile fills the side panel; "Centre here" in the panel re-roots the map | Root picker visible, but the panel was hover-only and tiles were links, so on touch the panel showed only the legend and "Centre here" was unreachable; the map was 449 px above the viewport after it | Touch path: below lg a tap on a tile selects it and opens the panel (Map / Panel pills, `ChooseView`) instead of following the link; the panel has Open page, Centre here and a Close pill that returns focus to the tile; tiles carry `aria-controls="dag-panel"`, the panel is `aria-live`. Desktop hover and click are unchanged |
| `/resistance/` (ResistanceMap) | Route list and diagram drive the side caption | Compact diagram plus list below sm; caption visible after a tap (654 to 844 px). The page scrolled sideways (414 px): one long reference chip in a mechanism card widened its grid track | Cards get `min-w-0` so the chip clips inside its card; the map is marked for the audit (inline) |
| `/staging/` (RiskScore) | Selects and ticks drive the score box in the same card | Score box directly under a short input list (visible) | None |
| `/cancers/map/` (CancerMapBy) | Badge pills above the map switch the count shown | Pills are directly above the map (visible) | None |
| `/timeline/`, `/for-me/`, `/navigator/`, `/pipeline/`, `/manufacturing/`, `/universities/`, `/market/`, `/second-opinion/`, `/report-reader/`, `/biomarker-matrix/`, `/compare/`, `/pivot/`, `/interactions/`, `/molecules/` | Controls sit in a row or sticky bar above what they drive | Effect directly beneath the controls | None |
| Roadmap records (RoadmapStory) | Timeline steps in the aside scroll the story | `go()` already scrolls the step into view | None |
| Record pages (EntityDetail, every kind) | Section bar, tabs, tables and pill rows | The layout viewport grew to 943 to 2487 px: a long nowrap pill in a Related pages or Connected card set the grid track's width (Neighbours), the What changed cards did the same, a guideline or product pill sat in a shrink-to-fit wrapper so its `max-width` had nothing to bite on, and on company and institution pages a deals table and the year bars pushed the overview grid | Grid children can shrink (`min-w-0` on Neighbours and ChangeRow items, `*:min-w-0` on every EntityDetail grid, Field roots); GuidelineChip and DrugChip wrappers get `max-w-full`; tables in EntityDetail, InvestorPanels, StartupPanels, BiomarkerDetail, PrevalenceTable, ToxicityTable, AccessTable and ResearchOutput scroll inside `ScrollRow`, as do the year bars. One record of each kind is a width-only check in the audit |

## Sideways scroll

The page must never scroll sideways at 390 px; a wide element scrolls inside its own box. `ScrollRow` wraps such an element with an edge fade on the side that has more and arrow buttons that appear only when it overflows. Grid children that hold wide content need `min-w-0` so the track cannot grow past the container. The audit fails any check whose page is wider than the viewport.

## Left for a later pass

- The audit runs against a dev server or the live site (one request per route); it is not yet part of the ship chain.
- Dev-only hydration attribute warnings seen while measuring are pre-existing and not from this pass: float rounding in `/graph/` node transforms and `/deals/` chord paths, and ChipTitles stamping `title` on truncated chips before the page hydrates (now also on `/path/`, whose route chips truncate instead of overflowing).

## What a reader actually downloads (25 September 2026)

Every page budget in this repo is measured on the static markup, because that is what `react-dom/server` can
produce inside vitest. `src/app/chrome-size.test.ts` states the assumption: "the RSC payload cannot be rendered in
vitest, but the same trees drive both". Measured against the live site with `npm run audit:weight`
(`scripts/page-weight.ts`), the assumption does not hold. The payload is not a constant fraction of the markup; it
is between a fifth and four fifths of the page, and the pages it is worst on are the ones a budget passed.

| page | total | markup | hydration payload | payload share |
| --- | --- | --- | --- | --- |
| /timeline/ | 2,139 KB | 528 KB | 1,610 KB | 75% |
| /explained/ | 1,516 KB | 736 KB | 780 KB | 51% |
| /years/2020/ | 1,023 KB | 383 KB | 640 KB | 63% |
| / | 939 KB | 242 KB | 697 KB | 74% |
| /cancers/prostate/uk/ | 927 KB | 410 KB | 517 KB | 56% |
| /for-me/ | 890 KB | 628 KB | 263 KB | 29% |
| /explore/ | 680 KB | 128 KB | 552 KB | 81% |
| /cancers/breast-cancer/ | 650 KB | 272 KB | 378 KB | 58% |
| /trials/ | 618 KB | 336 KB | 283 KB | 46% |

`/timeline/` is the clearest case: 528 KB of markup, comfortably inside its 640 KB budget, and 2,139 KB on the
wire. The budget was guarding a quarter of the page. `/explore/` is the other shape of the same fault: 128 KB of
markup and 552 KB of payload, because almost everything it shows is passed to a client component as props.

The rule this gives: **props are serialised once per page, imported code ships once.** A list handed to a client
component is paid for by every reader of every page that renders it, twice if it is also in the markup. The fix is
the one already used for the heavy tables and the family roll-up: render what the reader sees, fetch the rest from
a static file, and hand the client component an id rather than a tree.

This is not yet a gate. It needs the built site, so it cannot run in vitest; run `npm run audit:weight` after a
deploy and record the numbers here. Making it a gate means measuring the export, which is the obvious next step.

## The ceiling, from 1 October 2026

Measuring was not enough: the numbers above sat in this document while every markup budget stayed green. There
is now a ceiling per page in `src/data/page-weight.json`, set at what the live site served on 1 October 2026,
and the weekly link-check workflow runs `npx tsx scripts/page-weight.ts --check` against onco.cc and fails if a
page has grown past it. It is a ratchet: `--record` lowers a ceiling when a page gets lighter and never raises
one. Raising a number by hand means saying why in the commit.

What it recorded, total bytes with the hydration payload's share:

| page | total | markup | payload | payload share |
| --- | --- | --- | --- | --- |
| `/timeline/` | 2,150 KB | 533 KB | 1,617 KB | 75% |
| `/explained/` | 1,526 KB | 742 KB | 785 KB | 51% |
| `/years/2020/` | 1,055 KB | 395 KB | 659 KB | 63% |
| `/` | 940 KB | 243 KB | 697 KB | 74% |
| `/cancers/prostate/uk/` | 927 KB | 410 KB | 517 KB | 56% |
| `/for-me/` | 892 KB | 629 KB | 263 KB | 30% |
| `/cancers/breast-cancer/` | 692 KB | 290 KB | 402 KB | 58% |
| `/explore/` | 683 KB | 127 KB | 556 KB | 81% |
| `/trials/` | 620 KB | 336 KB | 284 KB | 46% |
| `/drugs/` | 590 KB | 350 KB | 240 KB | 41% |
| `/countries/us/` | 473 KB | 213 KB | 261 KB | 55% |
| `/virotherapy/` | 290 KB | 148 KB | 141 KB | 49% |
| `/navigator/` | 153 KB | 64 KB | 89 KB | 58% |

This stops the slide; it does not reverse it. `/timeline/` is where reversing starts, and `/explore/` is the
clearest case of the shape of the problem: 127 KB of markup carrying 556 KB of payload to render it.

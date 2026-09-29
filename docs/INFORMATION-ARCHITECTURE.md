# Information architecture: hub and sections (24 Sept 2026)

The owner asked, as the deep spikes began (gallbladder done, TNBC starting, twenty more to come): "as pages scale do we need to refactor the information architecture to improve layout?" Yes. A spike assembles one cancer from six data patches plus the decisions, UK, compared and tools pages, and the record page had become one long tabbed document: gallbladder 776 KB of markup, NSCLC 819 KB, 28 cancers over 350 KB, before this pass. A cancer is now a **hub** with ten **sections** in a fixed reading order; a section renders inline on the hub when it is small and on its own page when it is not. The decision is taken from the data by one registry, so the hub, the section pages, the sitemap and the JSON for agents never disagree.

Measured after the pass (markup inside the layout, `src/lib/record-sections.test.ts`): gallbladder hub 232 KB, TNBC 213 KB, NSCLC 203 KB, pancreatic 188 KB; no hub over 240 KB; the largest section page is NSCLC's Pipeline and open problems at 309 KB. A small rare cancer (gallbladder papillary carcinoma) keeps every section inline except the three record-list sections, which every cancer carries as cards.

## The section model

`src/lib/record-sections.ts` is the registry. Ten sections, always in this order, each with an id, a title, a glyph, a one-line purpose, the record fields and data patches it draws from, the element ids it owns (`anchors`), the older sub-pages that belong to it (`pages`), a `counts` function for its summary card and a weight `estimate` taken from the record and the graph.

| id | Title | Draws from | Older pages |
| --- | --- | --- | --- |
| `overview` | Overview | TL;DR, summary, state of the art, burden, group, parent, family strip, organ drawing | |
| `what-it-is` | Types and stages | subtypes, staging, spread map | `/compared/` |
| `finding-it` | Symptoms and diagnosis | symptoms, diagnosis, biomarkers, late-diagnosis panel | |
| `treating-it` | Treatment | standard of care by setting, regimens, guidelines, sequencing links | |
| `evidence` | Trials and papers | trial finder, landmark trials, the subtypes' trials (family roll-up), key papers, latest literature, milestones (history) | |
| `science` | Biology and targets | targets, prevalence rows, pathways, preclinical models | |
| `where-you-are` | Countries and centres | geography layer or cases by country, UK strip, expert centres, the subtypes' centres (family roll-up) | `/uk/` |
| `living-with-it` | Decisions and support | decisions strip, decision aids, red cards, journeys, questions to ask | `/decisions/` |
| `coming` | Pipeline and open problems | pipeline, the subtypes' medicines (family roll-up), open problems, what changed preview | `/changes/` |
| `data` | Data | related pages (every connected record), notes, machine-readable twins | |

The Overview is pinned: it is the hub. Three sections are pages for every cancer (`alwaysPage`): Countries and centres, Pipeline and open problems and Data. They are lists of other records (the expert centres, everything in development, every connected record) that grow with the corpus rather than with the record, and on 24 Sept 2026 they took 285 KB of TNBC's 536 KB hub (Related pages 171 KB, In development 83 KB, Expert centres 31 KB); the hub carries their summary cards. Every other section is placed by `placementOf`: **own page when the estimate passes `INLINE_MAX_KB` (60 KB of markup) or `INLINE_MAX_ROWS` (40 rows)**. The estimate is a small formula per section (items it will list, capped where the component caps them, times a per-item cost measured on 24 Sept 2026); it is deliberately data-only so that scripts can compute the plan without rendering. The test keeps the estimate honest: no inline section of the heaviest cancers may render past twice the inline line, and the hub and page budgets (`HUB_BUDGET_KB` 350, `SUBPAGE_BUDGET_KB` 600) are measured on gallbladder, TNBC, NSCLC and pancreatic.

`sectionPlan(cancer)` returns the ten sections with estimate, counts, placement, `route` (the section page) and `href` (the hub anchor when inline, the page when not). Everything else reads the plan: `cancerTabs` (the hub), `pagedSectionParams` (static params and the sitemap), `sectionsJson` (the API file), `sectionsContextLines` (the Markdown context), `forwardedAnchors` and `anchorHref` (deep links).

## Routes

- `/cancers/<id>/` is the hub (`src/app/[kind]/[id]/page.tsx` → `EntityDetail` → `cancerTabs` in `src/components/CancerRecord.tsx`). An inline section renders in full; a paged section renders a **summary card** (`SectionCard`: purpose, counts as pills with the section glyph, the first items, a "See all" button and the section's older pages) and its tab links to the page.
- `/cancers/<id>/<section>/` (`src/app/cancers/[id]/[section]/page.tsx`) exists only for paged sections (`dynamicParams = false`; the static export generates exactly `pagedSectionParams()`). It carries the same strip with the section highlighted, the section in full and the record's aside.
- `/cancers/<id>/decisions/`, `/uk/`, `/compared/` and `/changes/` keep their URLs. They are static siblings of `[section]`, so they win the match, and each now carries `SectionStrip` with its owning section highlighted (Decisions and support, Countries and centres, Types and stages, Pipeline and open problems). `changes/` moved from `src/app/[kind]/[id]/changes/` to `src/app/cancers/[id]/changes/` so the two segments cannot both claim `/cancers/x/changes/`; the URL is unchanged, so no redirect stub is needed.

## The section navigator

`src/components/Tabs.tsx` is the strip on every page of a record. A tab with `content` is an in-page section (scroll-spy, hash in the URL); a tab with `href` and no content is a link. On the hub a paged section has both: its card is a section on the page and the tab title links to the page. On a section page the current tab is the only one with content and the others link to the hub anchor or their own page; `current` names the tab that starts highlighted. Each tab carries the section glyph (`SectionGlyph`), so the strip reads the same on the hub, the section pages and the older sub-pages.

## Deep links

Every element id a section owns is declared in `anchors`, and the tab ids of the previous layout (`care`, `biology`, `history`, `changes`, `pipeline`, `trials`, `centres`, `questions`, `relevant`, `key-papers`, `papers`, `notes`, `geography`) are anchors of the section they moved into. Three rules keep an old link working:

1. When the owning section is inline, the hub renders the element with that id, so `/cancers/x/#care` lands as before.
2. When the section is on its own page, the hub's strip receives `forwardedAnchors(c)` (hash → address, in both the bare and `sec-` spellings) and forwards the reader on load with `location.replace`, so `/cancers/gallbladder/#care` opens `/cancers/gallbladder/treating-it/#care` when Treatment is paged. A static host never sees a hash, so this has to be client-side.
3. Code that writes links should ask `anchorHref(cancer, "care")` (or `cancerAnchorHref(id, ...)` with an id) and get the right address up front. `src/lib/first-60-days.ts` and `src/lib/for-me-situation.ts` write `#care` (the element id) rather than the old `#sec-care`.

`src/lib/record-sections.test.ts` scans every `/cancers/<id>/#hash` in `src/` and requires each to be an element the hub renders or an anchor it forwards to a page that renders it.

## Agents and JSON

- `/api/v1/cancers/<id>/sections.json` (written by `scripts/build-api.ts`, described in `scripts/api-layout.ts` and the OpenAPI document as `getCancerSections`): the ten sections with purpose, placement, route, `href`, absolute anchors, counts, estimate, fields, patches and sub-pages, plus the record's machine twins.
- The Markdown context file of every cancer (`/api/v1/context/<id>.md`) opens with "Sections of this record": one line per section with its address and counts.
- The hidden "Machine-readable versions" landmark on a cancer page links the sections file (`data-onco-format="sections"`), and the Data section shows the same links as pills.

## Families

A cancer with children (any cancer that another names in its `parent` field) carries a **family roll-up** in three of
the ten sections: its descendants' trials in Trials and papers, their medicines in Pipeline and open problems and their expert centres
in Countries and centres, each grouped by the child they came from and capped at eight named records per child. It is a view over
the `parent` chain (`src/lib/cancer-rollup.ts`), never a copy of ids onto the parent record, and it covers trials,
medicines and centres only: prose, standard-of-care rows, milestones and open problems stay on the record that wrote
them. The rule, the shape and the gate are in docs/CANCER-FAMILIES.md. Nothing is registered: a subtype added with a
`parent` appears in its parent's roll-up on the next build, and the roll-up's weight goes into the section estimate,
so a family heavy enough to need a page gets one.

## How a spike agent writes into a section

A spike does not touch the layout. It writes data: the cancer record and its patches. Each section reads named fields and patches (the `fields` and `patches` columns of the registry, also in `sections.json`), so:

- Symptoms, diagnosis and staging go in `basics`; they land in Symptoms and diagnosis (symptoms, diagnosis) and Types and stages (staging).
- Standard-of-care rows land in Treatment and drive the decisions page and the red cards (Decisions and support).
- Trials, key papers and history rows land in Trials and papers; targets with prevalence rows land in Biology and targets.
- A geography layer (`src/lib/cancer-geography.ts`) or a UK pathway (`src/lib/uk-pathway.ts`) lands in Countries and centres.
- Pipeline ids, open problems and roadmaps land in Pipeline and open problems.

When a spike grows a section past the threshold, the plan changes on the next build: the section gets a page, the hub gets its card, `sections.json` and the sitemap follow. Nothing needs registering. If a spike adds a new block that other pages will link to, give the block an `id` inside `CancerSection` and add it to the section's `anchors`; the registry test fails on an anchor nothing renders and on an anchor shared by two sections.

To move a block between sections or add a section: edit `SECTIONS` (order, ids, anchors, estimate), add the render case in `CancerSection`, add a `l.<Title>` label in every chrome dictionary (`src/lib/i18n/ui.ts` and `ui/*.ts`; the i18n test demands parity), and re-measure with the registry test.

## How other kinds would adopt it

The registry is typed on `Cancer` today because the estimates read cancer fields, but nothing in `Tabs`, `SectionCard` or the `[section]` route is cancer-specific beyond the plan. The next kinds to outgrow one page are drugs (approvals, toxicity, trials, papers, access) and targets (biology, drugs, prevalence, structures, papers). The path:

1. Add a registry file per kind (`src/lib/record-sections-drug.ts`) with the same `SectionDef` shape, or generalise `SectionDef<T>` over the entity type and key the registries in one map by kind.
2. Give the kind a renderer like `CancerRecord.tsx` (`drugTabs`, `DrugSection`) and move the kind's `kindTabs` case in `EntityDetail.tsx` onto it.
3. Add `src/app/<route>/[id]/[section]/page.tsx` generated from that kind's `pagedSectionParams`, and the kind's `sections.json` line in `build-api.ts` and `api-layout.ts`.
4. Keep the budgets in a test that renders the heaviest records of the kind (for drugs: pembrolizumab, trastuzumab deruxtecan).

Until then, other kinds keep their tabs; `record-blocks.tsx` already holds the pieces both paths share (fields, blocks, summary, key papers, literature, decision aids).

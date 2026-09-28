# Cancer families: what a family page shows from its children

Decided 25 September 2026, after a discovery defect: a cancer family page showed only the records attached to the
family record itself, and the records attached to its children were invisible there. The reader who lands on a family
page is exactly the one who has not yet worked out which type they have, so they were shown the least.

Measured across the corpus before the fix (incoming trial records, six of the 86 families worst affected):

| family | on the family record | across its children | children |
| --- | --- | --- | --- |
| lung-cancer | 55 | 1,102 | 3 |
| colorectal | 300 | 1,227 | 15 |
| breast-cancer | 87 | 354 | 18 |
| leukaemia | 41 | 239 | 11 |
| skin-cancer | 7 | 177 | 4 |
| brain-tumours | 40 | 130 | 15 |

The middle column of that table sums each child's trials, so a trial two children share is counted twice. The roll-up
counts distinct records and descends past the children (NSCLC's own subtypes are lung cancer's grandchildren and were
just as invisible), which is why the number it shows on the lung page is 1,003 rather than 1,102. Across all 86
families it surfaces 3,683 trials, 1,079 medicines and 3,534 expert centres that no family page could reach before.

The breast review found the same thing by hand: nine radiotherapy trials sat on the three receptor subtypes and never
on the family, so the family page could not see them. Wiring them onto the family record by hand fixed breast and left
the other five, which is the shape of the wrong fix.

## The rule

**A family page rolls up its descendants' trials, medicines and expert centres, and nothing else.**

1. **Never re-tag records to fix a page.** A trial in non-small-cell lung cancer is a non-small-cell trial. Copying a
   thousand trial ids onto `lung-cancer` would be false as data, would double the page's weight, and would corrupt every
   count, feed and API file that reads the record. The roll-up is a view (`src/lib/cancer-rollup.ts`), computed from the
   `parent` field at build time. No data changes.
2. **Three kinds roll up: trials, medicines, expert centres.** They are lists of other records. A reader deciding where
   to be treated, what is being tested and what she might join needs the whole field of her organ, not the part that
   happens to be filed one level up.
3. **Prose never rolls up.** The TL;DR, the summary, the state of the art, the standard-of-care rows, the milestones,
   the open problems, the key papers, the questions, the red cards and the decisions stay on the record that wrote them.
   Copying those onto the parent is the duplication three review passes have spent most of their effort undoing, and a
   parent's standard of care is often genuinely different from its children's (the whole reason the children exist).
4. **Targets and pathways do not roll up either.** A family's molecular landscape is not the union of its children's:
   rolling up eighteen breast subtypes would produce a target list that is true of no one. The prevalence rows are
   recorded per cancer for the same reason.
5. **Say where each record came from.** Every rolled-up record sits in a group headed by the child it belongs to, and
   the group heading links into that child's own page. The roll-up is labelled as a roll-up; it never pretends the
   records are the family's own.
6. **A family is any cancer with a child**, that is any cancer another names in its `parent` field. Nothing is
   registered and nothing is listed: add a subtype with `parent: "gastric"` and the gastric page grows a roll-up on the
   next build.

## The shape

`src/lib/cancer-rollup.ts`

- `childrenOf`, `descendantsOf`: the `parent` chain, cycle-safe. The roll-up descends the whole chain, because NSCLC's
  own subtypes are lung cancer's grandchildren and just as invisible; each record is labelled with the descendant it is
  attached to, and grouped under the direct child it sits beneath.
- `recordsOn(cancer, kind)`: the records of one kind attached to one cancer, in the same selection that cancer's own
  page renders (incoming trials; the drugs of `forCancer`; the centre inputs of `src/lib/centre-table.ts`).
- `familyRollup(cancer, kind)`: one group per child that contributes, minus everything already attached to the family,
  largest group first. A record two children share appears under both, because it is relevant to both; `total` counts
  distinct records.
- `rollupEstimate`: the weight of the rendered roll-up, for the section registry.

`src/components/FamilyRollup.tsx` renders one roll-up: a block with the distinct total, a line saying what this is, then
one card per child with the child's name, its count, the first `ROLLUP_ITEM_CAP` (8) records as chips and an "and N
more" link into that child's own page. The subtype icon is deliberately absent: it repeats once per group, costs more
than the rest of the group heading together, and the family strip at the top of the page already carries it.

Where each roll-up renders (`src/lib/record-sections.ts`, ids declared as section anchors):

| kind | section | anchor |
| --- | --- | --- |
| trials | Trials and papers | `#subtype-trials` |
| medicines | Pipeline and open problems | `#subtype-pipeline` |
| expert centres | Countries and centres | `#subtype-centres` |

Each section's `counts` gains an "N in the subtypes" pill, so the hub's summary card and
`/api/v1/cancers/<id>/sections.json` carry the number even when the section lives on its own page; each section's
`estimate` gains the roll-up's weight, so a family heavy enough to need a page gets one. Three families' Evidence
sections moved from the hub to their own page when this landed (skin cancer, childhood cancers, peripheral T-cell
lymphoma); the other three of the six were already paged.

## Paging and budgets

The roll-up never truncates silently and never grows with the corpus. A group names eight records and links the rest
into the child's page, so the markup is a function of the number of subtypes, not the number of trials: lung cancer's
1,003 rolled-up trials cost 5 KB of markup, the largest roll-up in the corpus (sarcoma's 22 medicine groups) 27 KB.

The budget is per piece, not a total, following the explained page (`src/app/heavy-pages.test.ts`): a chip costs 260
bytes around the record's name, a group 500 bytes, the block itself 600. A total would have to be raised every time a
family gains a subtype, which measures the corpus rather than the page. These fail when a chip gains a wrapper and pass
when a wave fills a family with trials.

## The gate

`src/lib/cancer-rollup.test.ts`

- The model accounts for every record a family's descendants hold and the family does not: no silent drops, nothing
  invented, nothing repeated from the family's own list, every record labelled with the descendant it came from.
- The rendered section of each of the six families surfaces its subtypes' records: at most **5%**
  (`MAX_HIDDEN_SHARE`) of them may be neither named on the page nor inside a rendered group that carries a count and a
  link into the subtype. It renders the real `CancerSection`, so deleting the roll-up from a section fails here.
- The per-chip, per-group and per-block costs above, measured over all 86 families.

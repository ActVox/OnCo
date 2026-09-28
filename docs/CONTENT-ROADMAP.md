# Content roadmap: pages still to write and cross-connections still to make

Measured on 22 September 2026 with `npm run content:gaps` (scripts/content-gaps.ts). Every number below comes from that script, which reads the graph, the FDA and EMA snapshots in `public/`, and the GLOBOCAN 2022 snapshot. Rerun it after each wave; the tables in it are the source of truth and this document is the reading of them.

Rates used for effort: about 350 records or links an agent-hour for mechanical linking (a fetcher or a corpus join plus a review pass) and about 32 an agent-hour for written pages, which are this week's measured rates (300 to 400 and 25 to 40).

## 1. Summary

The corpus holds **14,191 records** (refreshed 22 September 2026 after the wave 5 trial run; the tables below keep the 22 September morning baseline unless a row says otherwise): 4,002 trials, 1,984 papers, 1,547 people, 1,186 companies, 1,140 ideas, 1,068 drugs, 768 terms, 710 institutions, 590 technologies, 328 cancers, 259 journals, 188 targets, 133 collections, 108 pathways, 86 pairings, 45 bottlenecks, 30 roadmaps and 19 sections.

### Pages still to write: about 590

| Kind | To write | How the count was made | Budget-free source | Agent-hours |
|---|---:|---|---|---:|
| Cancers | 278 | 73 names on a public list of cancer types (Wikipedia, read 22 Sept 2026) that no cancer record carries as name or aka; 200 histological entities named in the corpus's own `subtypes` arrays with no record of their own (treatment settings and molecular subgroups excluded by rule); 7 parent-level cancers that name subtypes but have no subtype record (aya-cancers, extragonadal-germ-cell-tumour, metastatic-cancer, multiple-endocrine-neoplasia, nut-carcinoma, parathyroid-carcinoma, urethral); two names overlap. The WHO Blue Books name more entities than this, so 278 is a floor. | WHO Blue Books for the definition (owner: see section 4), Orphanet and Wikipedia for names, Europe PMC for the evidence | 8.7 |
| Trials | 111 | Trial acronyms in cancer `standardOfCare` text (1,625 rows) with no trial record by name, aka or NCT id. Standard of care rests on phase 3 and cooperative-group trials, so these are the pivotal trials the site cites but cannot show (HERIZON-BTC-302, PREOPANC, GROINSS-V, AALL1331, ANCHOR, POD1UM-303, AURELIA, QUAZAR AML-001, GALLIUM, GOG-258 and 101 more). Only 5 of the 1,625 rows carry no reference at all. | ClinicalTrials.gov by acronym, Europe PMC for the primary paper | 3.5 |
| Papers | 136 | DOIs cited in the `links` of two or more records with no paper page (819 distinct cited DOIs have no page in all). | Europe PMC by DOI | 4.3 |
| Targets | 30 | Gene or receptor symbols named by two or more drug records (name, mechanism, TL;DR, summary, mechanism steps) that match no target name, aka or symbol: NRAS (8 drugs), CD28 (6), HLA-A, MPL, SHP2, STAT5, IKZF1, JAK1 (4 each), B7-1, ABL1, FAK, IKZF3, PTCH1 (3), then CD137, HIF-1, IDO1, BRD4, IRF4, B7-H4, TET2, PRC2, NF1, ACVR1, BET, HOXA9, MEIS1, BH3, BIM, BAX (2). | HGNC for identifiers, UniProt for biology, the corpus for the drugs | 0.9 |
| Companies | 21 | Trial sponsors of two or more corpus trials with no company or institution record (Criterium, Novelwise, Teligene, USWM, AGO Research, Artios, Ambrx, French Sarcoma Group, German CLL Study Group, GORTEC, Medical Research Council and ten more). Persons listed as sponsor are excluded. | ClinicalTrials.gov sponsor field, Wikidata for identifiers and logos | 0.7 |
| Drugs | 12 | EMA-authorised products with a cancer or cancer-care indication whose INN matches no drug record, from the EMA register snapshot already in `public/regional/candidates.json`: catequentinib, resminostat, crisantaspase, piflufolastat (18F), the Tacquell TIL product, and supportive-care products (fentanyl, epoetin theta, immunoglobulin; abiraterone is a matching fault in the fetcher, not a gap). The FDA oncology notifications of the last 16 weeks all match a drug record (0 missing). | EMA register (fetched), ClinicalTrials.gov, Europe PMC | 0.4 |
| GLOBOCAN mappings | 31 | Top-level cancers with no entry in `globocan-map.ts`; not pages, but they decide the burden ordering below. | corpus; IARC site codes | 0.1 |

Total: 621 items in the script's table (590 pages plus the 31 mappings), about 19 agent-hours of writing.

### Cross-connections still possible: 12,295

| Link | Records lacking it | Fillable today from the corpus alone | Budget-free source for the rest | Agent-hours |
|---|---:|---:|---|---:|
| Trial to key paper | 3,470 of 3,527 | 0 | Europe PMC search by NCT id (3,430 carry one; the primary publication cites the registry id) | 9.9 |
| Trial to technology | 3,192 | 2,087 (the trial's drugs already name their technology) | corpus; the rest need a drug link first | 9.1 |
| Idea to key paper | 1,136 of 1,140 | 339 (papers of the idea's drugs, targets, trials or cancers) | Europe PMC | 3.2 |
| Idea to trial | 1,077 | 500 (share a drug, target or technology with a trial) | ClinicalTrials.gov | 3.1 |
| Drug to key paper | 1,052 of 1,063 | 53 (inherit from the drug's trials once wave 1 has run, this rises to most of the 1,052) | Europe PMC | 3.0 |
| Company to drug | 724 of 1,182 | 75 (sponsor a corpus trial that names a drug) | ClinicalTrials.gov lead sponsor, Wikidata | 2.1 |
| Technology to trial | 460 of 590 (400 after wave 5) | 34 (through their drugs) | ClinicalTrials.gov intervention type | 1.3 |
| Paper to trial | 453 of 705 | 61 (name a trial or NCT id in their text) | Europe PMC | 1.3 |
| Person to paper | 318 of 1,547 | 0 | Europe PMC AUTH plus AFF query (289 have an institution to anchor it); OpenAlex when credits allow | 0.9 |
| Drug to trial | 239 (74 after wave 5) | 42 (named in a trial record already) | ClinicalTrials.gov intervention search | 0.7 |
| Curated trial to structured outcome | 75 of 682 hand-written trials | 0 | Europe PMC abstract, ClinicalTrials.gov results section | 0.2 (2.3 at the written rate) |
| Approved drug to EU approval row | 60 | 60 (EMA register snapshot already fetched) | none needed | 0.2 |
| Target drugs array mirroring drug.targets | 21 | 21 | none needed | 0.1 |
| Trial to cancer | 11 | 0 | ClinicalTrials.gov conditions | 0.0 |
| Target to drug | 7 of 162 | 2 (named in a drug's mechanism) | ChEMBL | 0.0 |

About 35 agent-hours in all; 3,232 of the links need no network at all.

Weak linking is concentrated in four kinds. Counting inbound links (the figure the roadmap gauges use), after the wave 5 trial run: 2,082 trials, 1,243 people, 877 ideas, 626 companies, 1,734 papers, 342 institutions, 101 drugs, 113 technologies and 67 targets have fewer than three (the morning baseline was 1,733 trials, 1,259 people, 984 ideas, 640 companies, 565 papers, 344 institutions, 202 drugs, 168 technologies and 58 targets). Counting all relations, only 101 trials, 165 people, 95 companies and 247 papers are below three, so the problem is that things do not point back at them, and the links above are exactly the ones that fix that.

### Progress

Wave 2 (corpus-only joins) ran on 22 September 2026 through `scripts/link-joins.ts` (dry run by default, `--apply` writes; every rule is stated in the script header). 3,056 distinct edits, none removing a link. Counts are "records lacking the link" from `npm run content:gaps` before and after.

| Link | Before | After | Added by wave 2 | Rule as applied (tighter than the estimate) |
|---|---:|---:|---:|---|
| Trial to technology | 3,192 | 1,453 | 2,743 links on 1,739 trials | Only technologies of the trial's studied agents (drug named in the title, sole drug, or first-listed in a curated record); context technologies (transplant conditioning, CAR-T lymphodepletion, intravesical use, MRD testing) only as a drug's sole technology; angiogenesis models never. The 354 still "derivable" are backbones and comparators. |
| Idea to trial | 1,077 | 1,047 | 133 links on 30 ideas | Drug or target on a studied agent, in one of the idea's cancers, idea text names the drug or target, actor one that trials test, maturity early-clinical or being-tested-at-scale, cap 5 preferring phase 3. Technology alone never. |
| Idea to key paper | 1,136 | 1,104 | 46 links on 32 ideas | Papers of the idea's trials; then papers whose own drugs or targets arrays name a drug or target the idea's text names, in the idea's cancers; cap 3. |
| Drug to key paper | 1,052 | 1,027 | 34 links on 25 drugs | Papers of trials in which the drug is the studied agent, skipping papers whose drugs array names other drugs only; cap 3. |
| Drug to trial | 239 | 216 | 35 links on 35 trials | Title names the drug with a token no other drug shares and that is not a class name ("GnRH agonist"). |
| Technology to trial | 460 | 434 | 211 links on 208 trials | 26 technologies gain their first trial, through studied agents carrying them as a modality. |
| Target drugs array mirroring drug.targets | 21 | 0 | 47 | Reverse of drug.targets. |
| Company to drug | 724 | 719 | 6 links on 5 companies | Studied agent of a sponsored trial, no maker on record, not approved, no other sponsor. |
| Approved drug to EU approval row | 60 | 1 | 0 | 59 of the 60 rows had been added by hand between the 16 September fetch and this run; the measure now checks the snapshot against the live table. The one left (Zefylti, a filgrastim biosimilar) is a withdrawn application with no date, not an authorisation. |
| Target to drug named in a mechanism | 7 (2 named) | 7 (0 named) | 0 | Both "named" hits were substrings (CD7 inside CD70 and CD73); the measure now requires whole words, and the rule found nothing to add. |

Links still to make fell from 12,295 to 10,335; trials with fewer than three inbound links from 1,733 to 1,718, drugs from 202 to 185, papers from 565 to 547, technologies from 168 to 165. The "fillable today" column above was measured with looser joins (a shared technology or cancer alone); wave 2 rejected those on review because a drug class shared by hundreds of trials says nothing about one idea.

Wave 5 (products, targets, sponsors) ran on 22 September 2026 by hand from the `--lists` output, with HGNC and UniProt REST for the targets, the live EMA product pages for the register products and Wikidata plus the ClinicalTrials.gov v2 sponsor field for the companies; nothing was taken from any other source, and fields with no permitted source were left out. Files: `src/data/targets-wave-soc.ts`, `src/data/drugs-ema-wave.ts`, `src/data/companies-sponsors-wave.ts`.

| Kind | Before | After | Written | What was not written, and why |
|---|---:|---:|---:|---|
| Targets | 30 | 0 | 26 pages with HGNC, Ensembl, UniProt and Entrez ids (STAT5 carries two genes, so ids sit in target-xrefs.ts only), a plain-English role paraphrased from the UniProt function text, pathway links and a `drugs` array mirrored into 36 drug records' `targets`; 11 targets that no drug binds (STAT5, B7-1, PTCH1, HIF-1α, IRF4, TET2, NF1, HOXA9, MEIS1, BIM, BAX) are linked from their pathway records instead, which is why the "target to drug" measure rose from 7 to 18. | PRC2 is an alias on ezh2, BET on brd4, BH3 on bim; "LAR" was octreotide LAR (long-acting release) and is now a stop word in the script. No prevalence rows (no permitted source gives a rate), so the target-prevalence gauge lists all 26. |
| EMA products | 12 | 0 | 7 records: crisantaspase (Enrylaze), burosumab (Crysvita), epoetin theta (Eporatio/Biopoin), human normal immunoglobulin (Privigen/Kiovig, one record for two register rows), fentanyl (Effentora/Instanyl/PecFent), resminostat (Kinselby) and Tacquell (NKI TIL), each with a verified EU row dated from the EPAR page. | Three were matching faults, fixed with aliases: piflufolastat (18F) is pylarify, abiraterone is abiraterone, catequentinib is anlotinib. Vedolizumab matched the oncology filter on "tumour necrosis factor" and is excluded by the filter now. Kinselby, Tacquell and Qezzaqar (anlotinib) carry CHMP negative opinions on the live pages (22 May 2025, 25 June 2026, 23 July 2026), recorded as rejected EU rows, not approvals. The measure now checks the snapshot against live drug names, so aliases count without a refetch. |
| Sponsor companies | 21 | 15 | 6 sponsors (Criterium, Artios Pharma, Ambrx, Nerviano Medical Sciences, Qurient, Immunovaccine) plus the two authorisation holders the EMA wave needed (Grünenthal, 4SC); 14 trials gained their sponsor in `companies`. | Six are cooperative groups or public bodies, not companies, and wait on the taxonomy decision in section 4: GORTEC, French Sarcoma Group, German CLL Study Group, Alliance Foundation Trials, AGO Research GmbH, Medical Research Council. Nine have no Wikidata item and ClinicalTrials.gov gives no address, so country and headquarters could not be sourced: Novelwise, Teligene, USWM CT, 3H Pharmaceuticals, Sunshine Guojian, BeyondBio, Five Eleven Pharma, Novita, Faeth. |

The orphan floor was lowered from 205 to 201. The drugs and technologies without a trial (the ClinicalTrials.gov half of wave 5) ran later the same day through `scripts/fetch-entity-trials.ts`; see the wave 5 row in section 5.

Wave 3 (the trials behind standard of care) started on 22 September 2026 in `src/data/trials-soc-wave.ts` and `src/data/papers-soc-wave.ts`, with `scripts/soc-trial-refs.ts` turning each row's prose citation into a `refs` link. Registry records from ClinicalTrials.gov v2 (acronym field, study id or official title must match), outcomes from the registry results section or the primary publication on Europe PMC by NCT id; acronyms that are not trials or already have a record are listed in the wave file's SKIP comment.

| Family | Trials written | With structured outcomes | Papers added | Standard-of-care rows linked | Skipped |
|---|---:|---:|---:|---:|---|
| Leukaemia (incl. MDS, MPN, mastocytosis) | 18 | 15 | 12 | 21 | none; AALL1521, IntReALL SR 2010 and IMpactMF have no published result and carry no outcomes |
| Brain and CNS (incl. primary CNS lymphoma, NF2) | 10 | 8 | 8 | 12 | none; SJMB12 and ACNS1422 are still running and carry no outcomes |
| Childhood (neuroblastoma, Ewing, hepatoblastoma, germ cell, Hodgkin) | 9 | 7 | 6 | 11 | none; AGCT1531 is recruiting and EuroNet-PHL-C2 has no published result, so both carry no outcomes |
| Non-Hodgkin lymphoma (follicular, mantle cell, HIV-associated, PTLD) | 7 | 7 | 7 | 9 | none |
| Gastric | 1 | 1 | 2 | 1 | REGATTA and JCOG0912 are registered with UMIN only, outside the networks this wave may query |
| Pancreatic (incl. ampullary) | 7 | 6 | 6 | 7 | none; ESPAC-4 and CONKO-001 are ISRCTN-only and written from their primary publications, ESPAC-5 prints no registry id, PRECEDE is an observational cohort with no results |
| Sarcoma (Kaposi; AEWS0031 sits in the childhood row) | 1 | 1 | 1 | 1 | none |
| Anal (incl. HSIL precursor) | 4 | 4 | 5 | 6 | PLATO ACT5 is ISRCTN-only with no results and no publication by registry id |
| Lung | 0 (IMpower010 already existed as nct02486718; gained its alias, status and registry outcomes) | 1 | 0 (paper existed) | 0 (row already linked) | JCOG0802 is registered with UMIN only |
| Colorectal (Lynch syndrome) | 1 | 1 | 1 | 1 | CAPP2 is ISRCTN-only and written from its Lancet 2020 report |
| Head and neck (nasopharyngeal) | 1 | 1 | 1 | 1 | none |
| Ovarian | 1 | 1 | 1 | 2 | none |
| Endometrial | 1 | 0 | 0 | 1 | RAINBO is recruiting and states its design only |
| Myeloma | 1 | 0 | 0 | 1 | DRAMMATIC is active with no results and states its design only |
| Rare cancers (PPGL, penile, testicular, adrenocortical, trophoblastic, small bowel) | 7 | 4 | 4 | 13 | InPACT, ADIUVO-2 and BALLAD have no results and state their design; GROINSS-V I, REMORA and BEST4 skipped (no ClinicalTrials.gov record, see the wave file header) |

After this run the acronym measure reports 33 tokens, all in the wave file SKIP list: UMIN- or ISRCTN-only trials without results (REGATTA, JCOG0912, JCOG0802, CREATE-X, PLATO ACT5, BEST4, REMORA, GROINSS-V I), the ISG-STS 1001 and HERIZON-GEA-01 records that the tokeniser splits ("STS 1001", "GEA-01"), and genes, regimens, assays and doses that are not trials. `scripts/content-gaps.ts` now treats the programme stem before a hyphen (HERIZON, PREOPANC, CLARITY, OptimICE, CONTINUATION) as a known trial name.

Structured outcomes were also added in place to 8 of the 75 hand-written trials without them (ARANOTE, CheckMate 915, PACIFIC-2, INTELLANCE-1, ATEMPT, ASPEN, DESTINY-Gastric02, AREN0532), each quoting the ClinicalTrials.gov results section; the remaining 67 are recruiting or active trials with no results posted, platform or observational studies, or trials whose registry entry carries no results section (VERONA, TAM-01, CODEL, DART, IMPRESS, GBM AGILE).

## 2. Waves, in order of patient value

Ordering uses GLOBOCAN 2022 new cases worldwide per cancer family (a parent with all its subtypes): lung 2,480,675; breast 2,296,840; colorectal 1,926,425; skin 1,566,255; prostate 1,467,854; gastric 968,784; head and neck 947,211; liver 866,136; thyroid 821,214; cervical 662,301; bladder 614,298; non-Hodgkin lymphoma 553,389; oesophageal 511,054; pancreatic 510,992; leukaemia 487,294; kidney 434,840; endometrial 420,368; ovarian 324,603; brain 321,731; myeloma 187,952. The per-family gap table in the script output says where each wave should start.

| Wave | What it produces | Families first | Agent-hours |
|---|---|---|---:|
| 1. Evidence behind every trial | Key papers for the 3,470 trials without one (Europe PMC by NCT id; the fetcher writes a paper record where none exists and links it); the 136 paper pages for DOIs cited twice; 453 papers linked to their trials. Lung has 649 trials without a key paper, breast 252, colorectal 223, prostate 191, leukaemia 179, skin 160, pancreatic 155, ovarian 153, myeloma 136. | lung, breast, colorectal, skin, prostate | 15.5 |
| 2. Corpus-only joins | 3,232 links that need no network: trial to technology (2,087), idea to trial (500), idea to paper (339), company to drug (75), EU approval rows (60), drug to key paper via trials (53), drug to trial (42), technology to trial (34), target drugs arrays (21), target to drug (2). One script, one review pass, one PR. | all | 9.2 |
| 3. The trials behind standard of care | 111 trial pages for the acronyms the standard-of-care text cites without a record, with structured outcomes, ordered by family burden (leukaemia 13, brain 10, childhood 10, non-Hodgkin lymphoma 9, gastric 7, pancreatic 7, sarcoma 7, anal 5); structured outcomes for the 75 hand-written trials without them. | leukaemia, brain, gastric, pancreatic, lymphoma | 5.8 |
| 4. Cancer pages the classification names | The 278 cancer pages: first the subtypes of the 7 parents without any; then the histologies under the largest families (lung: adenocarcinoma, squamous, large-cell, sarcomatoid; breast: invasive lobular, tubular, mucinous, papillary, secretory, cribriform; colon, kidney, testicular as entities; the lymphoma and leukaemia entities the WHO names: marginal zone, MALT, prolymphocytic, hepatosplenic, intravascular, LGL, Sezary); then rare tumours (adamantinoma, chordoma variants, pineal tumours, pleuropulmonary blastoma types). 31 GLOBOCAN mappings so the new pages carry burden figures or an honest gap. | lung, breast, colorectal, leukaemia, lymphoma | 8.8 |
| 5. Products, targets, sponsors | 12 EMA products, 30 target pages (NRAS, CD28, SHP2, STAT5, JAK1, ABL1, FAK, IDO1, BRD4 and the rest, with HGNC ids), 21 sponsor companies; then ClinicalTrials.gov for the remaining 197 drugs without a trial and 426 technologies without a trial. | leukaemia (NRAS, STAT5, IKZF1, JAK1, ABL1, MPL), lung and colorectal (NRAS, SHP2) | 3.8 |
| 6. People and ideas | Papers for the 318 people without any (Europe PMC AUTH plus AFF, administrators filtered first); the remaining 577 ideas without a trial and 797 without a key paper through ClinicalTrials.gov and Europe PMC; the remaining 649 companies without a drug through the lead-sponsor field. | ideas by family: breast 107, lung 85, colorectal 74, pancreatic 59, prostate 58 | 6.7 |
| 7. Long tail | Paper pages for the other 683 cited DOIs; structured outcomes from the ClinicalTrials.gov results section for the 2,845 registry-ingested trials; the 11 trials with no cancer. | all | 29.4 |

Waves 1 to 6: about 50 agent-hours. Wave 7 adds about 29. Waves 1 and 2 are the biggest movers per hour and depend on nothing; wave 3 should follow because it closes the gap between what the standard-of-care text claims and what the site can show. Wave 4 is the only one that needs a taxonomy decision first (section 4).

## 3. Gauges each wave moves

Gauge ids are those in `src/lib/health.ts`, shown at /roadmap/.

| Wave | Gauges | Why |
|---|---|---|
| 1 | `backlinks` (1,733 trials and 565 papers with fewer than three inbound links), `orphans`, `papers-snapshot`, `citations`, `sources` | Every trial gains a paper and every new paper is linked from the trial; new paper records arrive with a DOI, so the citation-count and snapshot fetchers cover them. |
| 2 | `backlinks` (984 ideas, 640 companies, 168 technologies), `regional-approvals` (60 EU rows), `orphans` | Pure inbound-link filling; the EU rows are the single cheapest gauge move in the corpus. |
| 3 | `trial-outcomes` (75 hand-written trials), `cancer-depth`, `sources` | Standard-of-care rows gain refs that resolve to trials with numbers. |
| 4 | `cancer-depth`, `kind-size`, `completeness`, `translations` (each new page needs eight TL;DRs), `orphans` (new pages must arrive linked from their parent) | The public-list comparison is one of the external denominators the completeness gauge reads. |
| 5 | `target-prevalence` (new targets need sourced prevalence), `trials-snapshot` (drugs with a ClinicalTrials.gov snapshot), `logos` (new companies), `molecules` (new drugs need a structure or an explained placeholder) | New records of these kinds fail their kind gauges until filled, so ship each with the gauge's requirement met. |
| 6 | `people-papers` (318), `backlinks` (1,259 people, 984 ideas), `bottleneck-ideas` | Ideas linked to trials and papers stop being dead ends; people pages gain their evidence. |
| 7 | `trial-outcomes` (registry trials), `backlinks`, `stale` | The long tail; also refreshes `asOf` on every touched record. |

## 4. What needs the owner

| Item | Why it is blocked | Decision or spend |
|---|---|---|
| WHO Classification of Tumours (Blue Books) | The authoritative list of tumour entities for wave 4 is behind a subscription; the count above uses a public list and the corpus's own subtypes arrays, so it is a floor. | Subscribe (IARC, per volume or site licence) or accept the public-list floor; either way, the entity definitions must be written in our words. |
| Taxonomy: what counts as a cancer record | The corpus mixes entities (invasive lobular carcinoma) with settings (AML in older unfit patients) and cross-cutting records (metastatic cancer, AYA cancers). Wave 4 needs a rule: entities are cancer records with a `parent`; settings stay as subtype strings or become terms; cross-cutting records keep no subtypes. | Owner decision; one paragraph in docs/CANCER-PAGES or the new-cancer-page checklist. |
| Taxonomy: supportive care | Fentanyl, epoetin and immunoglobulin are EMA-authorised for cancer patients but are not oncology drugs. Include them as a "supportive care" modality or exclude by rule in the EMA fetcher. | Owner decision. |
| Taxonomy: cooperative groups | GORTEC, SWOG, the German CLL Study Group and the French Sarcoma Group sponsor trials but are neither companies nor single institutions. A `cooperative-group` company type or an institution flag is needed before wave 5 writes them. | Owner decision. |
| OpenAlex credits | Person-to-paper links are cheaper and cleaner through OpenAlex's institution-filtered author search (about 4 credits a person, 318 people), but the daily budget is shared with fetch:research. Europe PMC is the budget-free fallback and is what wave 6 assumes. | Spend, optional. |
| Burden figures for 31 cancers | GLOBOCAN reports by site, so sarcomas, neuroendocrine tumours, most rare tumours and every molecular subtype have no estimate. RARECAREnet (European rare-cancer incidence) and SEER would fill some, but both need a mapping table written by hand and RARECAREnet was unreachable on 22 September 2026. | Owner to decide whether an honest "no estimate" is the final answer or whether a second source is worth the mapping work. |
| Model review key | New pages ship without a review badge until the model-review key is set; this is a standing owner item from docs/LAUNCH.md and gates the `reviewed` gauge for every wave. | Owner. |

## 5. Progress

One row per wave run, measured with `npm run content:gaps` before and after. Add a row; do not rewrite another wave's.

| Wave | Run | Before | After | Families | Notes |
|---|---|---:|---:|---|---|
| 1. Evidence behind every trial | 22 Sept 2026, `scripts/fetch-trial-papers.ts` | 3,470 trials without a key paper (lung 649, breast 252, colorectal 223, skin 160, prostate 191) | 3,163 (lung 524, breast 172, colorectal 183, skin 125, prostate 149); papers 705 to 1,024 | lung, breast, colorectal, skin, prostate | 1,433 trials looked up on Europe PMC by registry id; 307 linked (319 new paper records in `papers-trials-wave1.ts`, 63 links to existing records, 75 long-term follow-ups). 998 trials have no PubMed record citing their id (most are recruiting), 47 have only a protocol or design paper, 56 only secondary pieces (quality of life, subgroup, cost, pharmacokinetics, preclinical), 25 skipped as ambiguous with the reason in `TRIAL_PAPER_SKIP`. New records carry the abstract as summary and no findings: nothing was read by an editor. The `Drug to key paper` corpus-only fill rose from 53 to 196 for wave 2. |
| 7. Long tail: registry outcomes | 22 Sept 2026, `scripts/fetch-registry-outcomes.ts` | 2,845 registry-ingested trials (tag `ctgov-ingest`) without structured outcomes | 2,701; 144 trials carry 272 outcome rows (175 primary; 41 OS, 20 PFS, 36 ORR secondaries; 80 with a hazard ratio) in `src/data/trial-registry-outcomes.ts`, merged by `index.ts` | all, in family-burden order; results found in lung 40 of 579, leukaemia 14 of 138, myeloma 12 of 115, non-Hodgkin lymphoma 11 of 200, prostate 10 of 155, breast 9 of 156, bladder 8 of 93, skin 7 of 130, colorectal 3 of 188 | All 2,845 records fetched from ClinicalTrials.gov v2 in 114 requests of 25 ids (cached under /tmp/ctgov-cache/results); 153 have posted results (151 active-not-recruiting, 2 completed), 2,692 do not, since every ingested trial is recruiting or active. Endpoint and arm titles, units, values, dispersion, denominators, HR, CI and p are the registry's own; enrolment is the ACTUAL count, `yearReported` the results first-posted year, and every outcome's first arm says the figures are from the registry, not a publication; the ingested summary's "no results" sentence is replaced at merge time. 9 trials with results had no copyable measure (rows split by response category, timepoint or stratum with no overall row are skipped, never summed; 49 secondary measures were registered but not posted). Records' `status` is untouched, so 144 trials now read "active" with results; a status pass is a separate decision. Adding rows to /explained/ pushed it past its 1,100 KB markup budget; the row markup was trimmed by about 140 KB instead of raising the budget. |

| 6. People and ideas | 22 Sept 2026, `scripts/fetch-people-papers.ts`, `scripts/fetch-idea-evidence.ts`, `scripts/fetch-company-drugs.ts` (shared fetch layer `scripts/wave6-shared.ts`) | 318 people without a paper; 1,104 ideas without a key paper and 1,047 without a trial; 720 companies without a drug | 300 people; 1,026 ideas without a key paper and 1,044 without a trial; 718 companies; papers 1,070 to 1,240, trials 3,527 to 3,531 | ideas by family: breast, lung, colorectal, pancreatic, prostate first | People: 280 of the 318 are chief executives, presidents, chairs, deans, representatives, donors, patients, advocates or public figures by role and 7 are bare institution heads, none searched (a wrong paper on such a page is worse than none); 6 have no institution to anchor a query. The 25 research-trained people were searched on Europe PMC by AUTH plus AFF plus a cancer keyword from their record; 18 linked (46 new records in `papers-people-wave6.ts`, 6 existing reused), each record kept only because its own author list names the surname and initials with an affiliation naming the institution; 4 had no such record, 1 had records naming neither, 2 are in `PERSON_PAPER_SKIP` because authors with different first names share the surname and initial at the institution. Ideas: 99 were eligible under the wave 2 rules (text names a drug or target, at least one cancer, an actor trials test); 78 gained key papers (124 new records in `papers-ideas-wave6.ts`, 98 existing reused), reviews and phase 2 or 3 results papers only, drug or target in the title and the cancer in the text, short gene symbols matched case-sensitively and FAP or MET needing a second key; 3 gained trials (4 registry records in `trials-ideas-wave6.ts`, 4 corpus trials linked) from 329 ClinicalTrials.gov studies seen, 305 rejected on drug, cancer, phase or status; most eligible ideas already carried trials from wave 2, and 35 ideas were held because their text names none of their drugs or targets. Companies: 77 sponsor a corpus trial naming drugs under their exact name or alias; 2 gained a drug (Impact Therapeutics IMP4927, R-Pharm RPH-051), each verified on the registry record as lead sponsor with the drug among the interventions; 392 candidate drugs were held as comparators with a maker on record and 21 as approved, and 577 companies sponsor no corpus trial under their exact name. New records link the person, journal or trial only, never drugs or cancers; each new paper's Europe PMC citation count was written to `public/citations/index.json` from the same record. Side effects: "paper to trial" rose from 437 to 593 because fetched papers link a trial only when their abstract cites one registry id. Noticed, not fixed: `orca-bio` and `orca-biosystems`, `inxmed` and `inxmed-shanghai` look like duplicate company records. |
| 7. Long tail: cited DOIs | 22 Sept 2026, `scripts/fetch-cited-papers.ts` | 757 distinct DOIs cited in records' external links without a paper page (119 cited by two or more records); papers 1,248 | 21 (4 cited twice), all in `CITED_PAPER_SKIP`; papers 1,984; ideas with fewer than three inbound links 984 to 877, technologies 165 to 118, trials 1,706 to 1,684 | all, DOIs cited by the most records first (the checkpoint-eligibility, MCED, undruggable-target and preclinical-model reviews cited by 30-plus ideas), then single-citer DOIs by cancer-family burden | Europe PMC asked by DOI (`DOI:"..."`, 951 requests, responses cached under /tmp/europepmc-cache); 736 paper records written to `papers-cited-wave7.ts` (167 randomised, 174 reviews, 28 meta-analyses, 23 guidelines, 69 basic, 275 other clinical by PubMed type; one bioRxiv preprint with no journal version on Europe PMC, tagged `preprint`), 1,381 bare DOI references on 1,161 records turned into `keyPapers` links through `cited-paper-links-wave7.ts` (merged by `index.ts` for every kind before the trial step); 103 records link their citing trial through `trials`, the rest through `related`, 592 carry a journal record. No existing paper matched by DOI or PMID (wave 1 had already taken the shared ones). 21 DOIs unknown to Europe PMC: conference supplement abstracts (JCO, Blood, Hematol Oncol), an NIHR HTA report, an EJC Supplements paper, a 1964 SICI DOI, and about eight whose DOI as cited resolves to no record (JAMA 2018.11350, NEJM 2117013, JITC 2020-002757, Ann Surg 2006, JCO 23.02545 and 24.01373, Lancet Oncol 23-00492, Lancet Glob Health 21-00347), listed with their citing records for an editor to check the citation. Two prose lessons recorded in the script: naming the citing page in a fetched paper's TL;DR, or printing its year there, pulled the paper into that page's search results and dropped the Ask OnCo extractive floor (0.358 to 0.348, tazemetostat); fetched papers now name citing pages by kind and count only and keep the year in `year`. After batch 2 the floor still dipped to 0.3546 because the DCVax-L page gained its JAMA Oncology paper as a neighbour and edged past intismeran autogene by 0.001; the drug record gained the names its makers use (mRNA-4157, V940, PCV, INT) and recall ended at 0.3596 with all 736 in. "Links to make" rose 10,104 to 10,118 because each new paper has one inbound link until something else cites it; the Discord client-secret scanner rule is muted under src/data because two idea ids matched it. |
| 5. Products, targets, sponsors: trials for drugs and technologies | 22 Sept 2026, `scripts/fetch-entity-trials.ts --kind=drug`, then `--kind=technology` | 216 drugs and 432 technologies without a trial (the 197 and 426 of the plan, remeasured after waves 2 and 6); trials 3,527 | 74 drugs and 400 technologies; trials 4,002; drugs with fewer than three inbound links 185 to 101, technologies 118 to 113 | drugs alphabetically (no family order: each drug is one intervention search), then technologies | ClinicalTrials.gov v2 only, 789 requests (470 for drugs, 319 for technologies), one at a time 250 ms apart, cached under /tmp/ctgov-cache; 6,255 studies checked. Kept: interventional phase 2, 2/3 or 3, not withdrawn, the registry's intervention list naming the drug by a whole name, code, brand or alias (a key two drugs share never matches), at least one condition naming a corpus cancer by whole phrase (longest phrase wins, so a non-small-cell condition is not also small-cell; single words such as advanced, recurrent, lymphoma and neoplasms are stop words; a fragment of an alias counts only when every fragment names a disease, so "Head and neck" no longer yields "neck cancer"). Cap three an entity, phase 3 first, then the entity in the brief title, then recruiting or active. Drugs: 215 searched (1 held, capmatinib-tepotinib, whose only names belong to other records), 142 gained a trial: 337 registry records in `trials-entities-wave5.ts` and 19 links to corpus trials by NCT id (RESPONSE for pipobroman, AALL1731 for crisantaspase, Euro-Ewing 2012 for treosulfan); 5 drugs with a target fell back to phase 1 (mavorixafor, MRTX1133, ISB 2001, doxifluridine, tilatamig samrotecan); 73 had no qualifying study, mostly companion diagnostics and AI software the registry lists under no phase, and supportive products (dolasetron, rolapitant, lipegfilgrastim, uridine triacetate) whose trials are phase 4 or not phased. Technologies: 220 held before searching (42 foundation models, 22 mathematical models, 1 virtual-cell model, 2 risk models, 18 manufacturing, 48 supporting infrastructure, 87 whose names are generic words or descriptive titles), 4 held because an alias names something else on the registry (CEA the antigen, calcitonin, STRIDE the regimen, "functional precision medicine"), 208 searched with the name or alias required as a whole phrase in an intervention name or the official title (one-word keys in a title never count); 32 gained a trial (65 records, 7 corpus links: Cliniporator to the electrochemotherapy record, 89Zr-girentuximab, SonoCloud, ANCHOR for thermal ablation), 176 had none, above all because device, imaging and behavioural trials carry no phase and the rule keeps phase 2 or 3 only. Records: 198 phase 3, 187 phase 2, 11 phase 2/3, 6 phase 1; 84 recruiting or active; 107 carry a sponsor company on an exact name or alias match, none by pattern. Every entity's own `trials` array gains the ids through `entityTrialsWave5` so the new records have an inbound link and the orphan floor (201) holds without change. Side effect: "trial to key paper" rose 3,470 to 3,517 and "trial to technology" to 1,795 because the new records carry neither. |
| 4. Cancer pages the classification names | 24 Sept 2026, hand-written family files `src/data/cancers-wave4-{parents,lung,breast,colon-kidney-testis,haematology,rare,endocrine-thoracic-gynae}.ts`, rule in docs/CANCER-PAGES.md | 278 pages to write: 73 public-list names without a record, 205 entities named in `subtypes` arrays, 7 parents with no subtype record; cancers 336 | 99 entity pages written; cancers 435; public-list names 73 to 28 (the 28 left are aliases of existing pages, benign lesions or retired terms, listed in the family file headers); parents without a subtype record 7 to 1 (NUT carcinoma, whose fusion partners are not entities by rule); entities named in `subtypes` arrays 205 to 263, a rise because each new page's own WHO variants are new strings, so this count is a moving floor rather than a backlog | the 7 parents first; then lung (10), breast (14), colon, kidney and testis (20), lymphoma and leukaemia (16), rare tumours (14), pituitary, thymoma, salivary, cervix, vulva and vagina (16) | Every record: `parent`, WHO or PDQ source, TL;DR under 400 characters, a four-part summary (what, how it differs from the parent, how common with source, how treated with the trial or guideline cited or "treated as its parent" stated), `drugs` and `trials` found by searching the corpus, `related` naming the parent and siblings. Sources: Europe PMC abstracts cached under /tmp/wave4/epmc (about 120 queries), NCI PDQ and Cancer Research UK pages checked live, the WHO 5th-edition summary papers for each organ system. Rule cases judged (docs/CANCER-PAGES.md): metastatic cancer and AYA cancers lost their subtype strings in favour of links; B-cell prolymphocytic leukaemia is written under its WHO-HAEM5 name; medullary breast carcinoma under its 2019 name; giant-cell lung carcinoma, malignant oncocytoma, acute eosinophilic leukaemia, PNET and the benign lesions on the public list get no page. Mechanics added: `linkSiblings` (no new page arrives orphaned), `PARENT_PHRASES` entries for 17 new parents, tag descriptions for wave4, kidney and testicular, cancer map SVG budget 300 to 320 KB. Gaps: 31 GLOBOCAN mappings untouched; the 28 remaining public-list names could be closed with `aka` strings on existing records; "treated as its parent" stands where no histology-specific trial exists, which is most of these pages. |

## Running the measurement

```
npm run content:gaps              # markdown tables
npm run content:gaps -- --lists   # plus the candidate lists (cancers, targets, trial acronyms, sponsors, DOIs)
npm run content:gaps -- --json    # machine-readable, for a wave script to consume
```

The heuristics are stated in the script: a subtype string is an entity when it carries a histology word and no setting word; a target symbol must look like a gene symbol and be absent from every non-target record's names; a trial acronym must start in its first word and match no trial, drug or other record. The candidate lists are for hand curation, not bulk import.

## 6. Country deep dives (owner request, 25 September 2026)

Two countries have a deep dive today, `/countries/cn/` and `/countries/in/`, each written as hand-written cards in
`src/data/country-<iso2>.ts` with the entity lists pulled from the graph by id. The owner asked for the rest,
**starting with the highest research output**, and named **Israel** and **Russia** explicitly.

Ranked by what the corpus itself holds (institutions, papers, trials and people with a country, weighted toward
papers), the order after China and India is:

| | Country | Institutions | Papers | Trials | People |
| --- | --- | --- | --- | --- | --- |
| 1 | United States | 151 | 218 | 51 | 498 |
| 2 | United Kingdom | 97 | 31 | 75 | 140 |
| 3 | France | 33 | 18 | 9 | 80 |
| 4 | Germany | 27 | 5 | 9 | 74 |
| 5 | Italy | 28 | 9 | 3 | 57 |
| 6 | Canada | 25 | 10 | 2 | 49 |
| 7 | Netherlands | 15 | 13 | 9 | 44 |
| 8 | Spain | 24 | 3 | 1 | 51 |
| 9 | Australia | 17 | 7 | 2 | 43 |
| 10 | Japan | 17 | 5 | 4 | 34 |
| … | Israel | 8 | 3 | 2 | 9 |
| … | Russia | 0 | 0 | 0 | 0 |

**That table measures our coverage, not the world.** Japan and South Korea sit lower here than their real output,
and Russia is absent entirely, which is itself the finding: a country page that starts from the corpus would
mistake a gap in our reading for a gap in the country. Each spike must therefore start from the country's own
sources and registries, and record what we did not previously hold.

Order of work: **wave 1** United States, Japan, Germany, United Kingdom, Israel, Russia (the owner's two are in
the first wave regardless of rank). **Wave 1 is done** (25 September 2026): the United States, Germany, Japan,
the United Kingdom, Israel and Russia. **Wave 2** France, Canada, Italy, Netherlands, South Korea, Australia, Spain,
Brazil, Sweden, Switzerland.

Each spike follows `/countries/in/`: what is different about cancer here, who pays and how, the regulator and how
fast it moves, what the country does that others do not, the institutions, companies, drugs, trials, papers and
people, and the gaps. Every figure carries its source and the national registry is read directly rather than
through a summary of it.

## 7. Owner asks, 25 September 2026 (evening)

1. **Every unlinked datum in a table should be a filter.** Clicking the year in a trial's "reported" column should
   filter the table to that year, and the same should hold wherever a cell prints a value the table already knows
   how to facet on. Audit every table for cells that render as plain text where a filter link would work: years,
   phases, statuses, countries, sponsors, modalities, regulators, grades. The column-header filter already exists;
   this is about the cell itself being the way in.
2. **A record for every year, and one timeline over all of them.** Make the year an entity, list everything the
   corpus dates to it (approvals, trial readouts, guideline changes, papers, founding and closing of things), at
   the best precision each fact allows, and roll the lot into one oncology timeline. The point is not the list: it
   is what the shape of it shows. Where the corpus can support a claim about the rate of change, make it; where a
   gap is an artefact of our reading rather than of history, say so.
3. **A page for oncolytic virotherapy**, and the technologies and people it depends on, prompted by the account of
   Beata Halassy, the Croatian virologist who treated her own recurrent breast cancer with intratumoural measles
   virus and then vesicular stomatitis virus, and published it.

## 8. What a reader meets first on a record page (owner, 28 September 2026)

Three asks in one sitting, all the same problem: the top of a record page is full of things that are not the
record. Measured before any change.

1. **The family strip.** `/cancers/tnbc/` lists its parent and all fourteen subtypes before anything else. Sixteen
   families have more than six children; sarcoma has 26 and non-small-cell lung cancer 22, about a thousand
   characters of chips. Show a few and collapse the rest. Ordering matters as much as the count: alphabetically,
   triple-negative breast cancer leads with adenoid cystic and apocrine carcinoma, which almost nobody reading
   that page has. Ordered by what the corpus actually holds for each child, it leads with metastatic and early
   triple-negative disease, sarcoma leads with gastrointestinal stromal tumour and osteosarcoma, and non-small-cell
   lung cancer with the EGFR-mutated and resectable pages. That is measurable rather than taste.
2. **The model panel** sits high in the right-hand column. It belongs at the bottom if it is worth keeping.
3. **The summary block.** 1,329 records carry a summary over 1,800 characters and 282 over 3,000; the longest are
   21,489 characters over twelve paragraphs (pancreatic) and 21,322 (triple-negative breast cancer). Show about
   two paragraphs with a way to expand, so the rest of the page is reachable.
4. **The also-known-as line.** Rendered as `text-xs text-muted text-end max-w-xs` in the page header's right
   slot: the smallest type on the page, grey, right-aligned, in a narrow column, as one comma-separated run. On
   `/cancers/tnbc/` that is five alternative names a reader might have been given by a doctor, set in the least
   readable thing on the page. 6,995 records carry one, 819 carry more than six names and 259 more than twelve.
   These are the words a person heard in a clinic and is searching for; they should be easy to read.

## 9. Three more on the record page (owner, 28 September 2026)

1. **"Evidence" is not a useful section name.** Every other section on a cancer page is in the reader's own
   words ("What it is", "Finding it", "Treating it", "Living with it", "What is coming"); "Evidence" is the
   only abstract noun among them. What the section actually holds is trials recruiting now, the landmark
   trials, the trials on this cancer's subtypes, the key papers and what they found, and the latest literature.
   Rename the title; keep the `evidence` slug so published links keep working.
2. **The print control.** The owner's objection is that printing is a browser function and does not need a
   button. That is true of one of its three modes and not the other two. `src/components/PrintButton.tsx`
   offers Full page, This section, and **Patient pack**: every section in plain language, dated, with a QR code
   back to the page and the disclaimer. The pack is not something a browser does. So: take the control off the
   pages where it only reprints what is on screen, and where the pack is the point, label it as the pack rather
   than as printing. It appears on eighteen surfaces today, including the red-flag card and the appointment pack.
3. **The human-review block.** "Human reviews sit on top of the panel. Add a clinical review or see the review
   queue" comes off the record pages. The owner suggests instead a way to open a GitHub issue for the page, so
   the invitation is closer to an action. This is the same component as the model panel move already in hand.

## 10. Section names and the right-hand column (owner, 28 September 2026)

**1. The section names are vague, and several lean on "it".** The owner: "the title 'Finding it' seems very
unclear ie dont use 'it' ... if this is diagnosis then call it that. 'the science' is vague as well, what is the
section name really. 'where you are' is also vague, 'what is coming' is vague -> 'Pipeline to combat this cancer'
might be better."

What each section actually holds, and a name that says so. The ids do not change, so every published link and
every anchor keeps working.

| now | holds | proposed |
| --- | --- | --- |
| Overview | TL;DR, the family, the organ, who gets it, state of the art | Overview |
| What it is | anatomy, the subtypes, staging, where it spreads | Types and stages |
| Finding it | symptoms, how it is confirmed, screening, biomarkers | Diagnosis and screening |
| Treating it | standard of care by setting, medicines, surgery, radiotherapy, regimens | Treatment |
| Trials and papers | recruiting trials, landmark trials, key papers, latest literature | Trials and papers |
| The science | targets and their prevalence, pathways, mechanics, preclinical models | Biology and targets |
| Where you are | cases by country, national pathways, expert centres | Countries and centres |
| Living with it | decisions, decision aids, when to call, first sixty days, questions | Decisions and support |
| What is coming | what is in development, open problems, roadmaps, what reports next | In development |
| Data | connected records, notes, the machine twins, provenance | Data |

Each rename needs the label in all nine languages, as the `evidence` rename did.

**2. The right-hand column is a wall of links.** "a massive link panel on the right side bar is not good design eg
'Sources & links' this might be better as a table at the bottom of the page. it might be ok to have the primary
links eg wikipedia but maybe its better to have more 'object' focused data eg the AKA or other things in there."

Measured: `e.links` renders as an unbounded list in the aside. Triple-negative breast cancer has **109** links,
pancreatic **124**, colorectal 106, gallbladder 99. 47 records carry more than eight and 15 more than twenty, so
this is worst on exactly the pages that had the most work put into them. The sources belong where they can be
read and sorted; the column should carry what identifies the record.

**3. The years index is weakly titled.** The owner: "this is a weak title for the top bar. years of what?
Something more functional eg 'Oncology: the timeline' might be better?" The kind's `title` is "Years and the
timeline" and the navigation entry is the bare word "Years". Same fix as the section names, same nine languages.
Note there is already a `/timeline/` page: whatever these two are called, a reader should be able to tell which
is the chart over the whole field and which is the index of single years.

## 11. The cancer page: machine links, and a plan (owner, 28 September 2026)

**1. The machine links are in a reader's way.** "having 'JSON for agents' at the top of pages gets in the way of
things for humans, have them at the bottom of the page." On `/cancers/tnbc/` a "Data · JSON" control sits in the
right-hand column about two fifths of the way down the markup, which on a phone stacks above the reader's own
content. Agents and crawlers are served first by `<link rel="alternate">` in the head, the context files and the
API, none of which a reader sees; the visible block can sit at the foot of the page without losing any of that.

**2. The information architecture needs a plan, not another patch.** "the cancer pages have become very poor info
arch. i want to see an amzinfg plan on how to improve them."

This is the honest reading of everything above it in this document. Sections 8, 9 and 10 are seven separate
complaints about the same page, each of which I have been fixing one at a time: the family strip, the model
panel, the summary block, the also-known-as line, the section names, the wall of links, and now the machine
links. Patching them one by one produces a page nobody designed. The deliverable here is a plan the owner reads
and approves before anything else is changed.

# Contributing to OnCo

Thank you. OnCo is a public map of oncology and it is only as good as its facts. This guide covers how to propose or fix records, how to deepen a cancer, how reviews work, and the checks every change must pass.

## The two rules

1. **Cite it.** New facts need a source URL in `links` (or a `wikipedia` link plus a trial `nct`). If you cannot source it, leave the field out. Unknown beats guessed.
2. **Date it.** Update `asOf` on any record you change.

And one hard line: **no patient data.** The corpus holds public information about technologies, products, organisations, trials, and public professional figures only.

## One gate: every change starts as an issue

Nothing on OnCo is edited directly, and the site carries no "edit this record" links. Every correction and improvement enters through an issue form so it can be checked for sourcing, safety (no patient data, no medical advice, no promotional claims) and validity before anyone sees it. The forms live in `.github/ISSUE_TEMPLATE/` and are opened, prefilled, from the site:

| Form | Use it when |
|---|---|
| Suggest an edit | A field on a record is wrong or missing and you have a source. Opened from the sidebar of every page. |
| Fact correction | Text states something false; quote it and say what it should say. |
| Stale fact | It was true and events overtook it (a readout, a withdrawal, a new guideline). |
| Trial readout | A trial reported, was updated or stopped; give the figures and the source. |
| Regional approval | A product was approved, filed, rejected or withdrawn in a region we do not show. |
| New object | Something is missing. `npm run new -- --kind drug --name "X"` writes a validated stub to paste into the issue. |
| Translation fix / Translation review | A translated TL;DR is wrong, or you speak the language and want to sign off a batch. |
| Review this page | You checked a page against its sources as a clinician, scientist, regulatory specialist or advocate. |
| Accessibility, Bug report | The site, not the content, is broken. |

Then:

1. A maintainer triages within a week and asks for a source if one is missing. Unsourced changes are not merged.
2. The issue gets a review track (clinical, scientific, regulatory, patient advocate, organisation self-edit; see `.github/REVIEWERS.md`).
3. The maintainer makes the edit, or, if you can code, points you at the file. **Pull requests that change `src/data/` must reference a triaged issue**; the PR template asks for it. Record confirmed errors in `CORRECTIONS.md` in the same PR.
4. Merged changes appear at the next deploy, in the changelog and in the weekly issue (`/newsletter/`). Contributors are credited at `/contributors/` from the repository history.

Discussion is separate from change: questions, interpretations and "is anyone working on this" go to the GitHub Discussions thread that the *Discuss* link on every page finds or starts (category "Objects", form in `.github/DISCUSSION_TEMPLATE/`). A thumbs-up on an idea's thread is a vote, counted weekly at `/idea-votes/`. A discussion that ends in a fact becomes an issue. Email is not a channel.

## Ways to contribute

- **Fix a fact.** Use "Suggest an edit" on any page.
- **Fill a gap.** `/gaps/` lists objects with missing sources, thin links or empty sections, and "good first records" from the audit with S/M/L size labels; *claim* opens the form prefilled.
- **Review a page.** `/review/` ranks the pages that most need a named reviewer, by track. See "Review tracks".
- **Review translations.** `/review/#translations` shows coverage per language; the Translation review form records your sign-off in `src/data/i18n/reviewed.ts`.
- **Add an object.** See below.
- **Deepen a cancer.** Extend its spike under `src/data/spikes/<cancer>.ts`.
- **Teach with it.** `/teach/` has a slide deck and quiz per cancer and front; errors you find while teaching go through Suggest an edit.
- **Build a roadmap item.** `/roadmap/` lists ideas with statuses; pick one marked planned or proposed and open an issue first.

## Adding an object

0. Check the corpus does not already hold it. A paper is its DOI and its PubMed id, a trial is its registry id: if one of those is already on a record, add your links to that record instead of writing a second one. Two records for one thing is the commonest data bug here and `docs/DUPLICATE-RECORDS.md` is the rule, the survey (`npx tsx scripts/dedupe-survey.ts`) and the merge that undoes it.
1. Pick the kind: `src/data/<kind>.ts` (products live in `drugs.ts`; people under `src/data/people/`; deep cancer material under `src/data/spikes/`).
2. Scaffold it: `npm run new -- --kind <kind> --name "<name>"` writes `src/data/drafts/<id>.ts`, a schema-valid stub with every required field filled with a `TODO` placeholder and a checklist in the header. Or copy a neighbouring record. Ids are kebab-case and globally unique across all kinds; the scaffolder refuses an id that exists.
3. Write the `tldr` for someone with no background: one or two sentences, no jargon, no numbers unless essential. Write the `summary` for a clinician or scientist.
4. Link it: relationship arrays (`cancers`, `targets`, `drugs`, `companies`, `trials`, ...) hold ids. Declare a link once; the other direction is derived.
5. Fill the structured fields where they apply: trials get `outcomes`, `enrolled`, `replication`; products get `dosing`, `toxicity`, `access`, `regulatoryEvents`, `mechanismSteps`; standard-of-care rows get `guideline`; targets get `prevalence`.
6. Move the object into its data file, delete the draft, and run `npm run validate` (fails on a bad id, duplicate id or schema error) and `npm test` (the same plus invariants).
7. Propose it through the New object form, pasting the record. If you are also opening a PR, reference the issue and use the PR template.

## Adding or deepening a cancer spike

A spike is a fully built cancer page: 3-paragraph summary, `standardOfCare` rows by setting with refs and `guideline`, `stateOfArt`, `history` with refs, `pipeline`, `openProblems`, subtypes, biomarkers, and all the drug, trial, technology, and term objects it points to, with structured outcomes on landmark trials. Every cancer has one; the file is `src/data/spikes/<cancer-id>.ts` and it exports `{ cancerId, entities, patch }`. Arrays in `patch` are appended to the base record and de-duplicated; scalars override. Duplicate entity ids across spikes are merged (first record's scalars win, arrays are appended), so two spikes may both add the same generic drug.

## Style

The full house style is `docs/HOUSE-STYLE.md`; the rules below are the ones you will need first.

- **No fatalistic language in OnCo's own voice.** The numbers stay and the adjectives go: "five-year survival is 8 per cent (SEER 22, 2014 to 2020)", not "a dismal prognosis". Relentless, bleak, uniformly fatal, death sentence, untreatable and the battle metaphors fail `src/lib/tone.test.ts`. A cancer with poor survival still says so, with its figures. **Quotations are never edited**: an abstract, a paper title or a guideline statement stays exactly as its author wrote it, and the test excludes those fields by construction.
- British or American spelling is fine; be consistent within a record.
- No superlatives without a comparator. "First", "largest", "only" need a source.
- Failures are welcome: negative trials, withdrawn approvals, discontinued programmes. Mark them `status: "negative"` or `"withdrawn"` and tag `failure`.
- Statuses are honest: `approved` means a regulator approved it; regional approvals go in `approvals` with the region.

## Review tracks

Two badges can appear on a page. Both are statements about the page on a date, not endorsements.

- **Expert** (`track: "expert"`): a named clinician, scientist or regulatory specialist read the page and its linked sources, checked the standard-of-care rows against current guidelines (NCCN, ESMO), the trial figures against the primary publication, or the approval dates and indications against the label, flagged anything wrong, and signed off.
- **Patient advocate** (`track: "advocate"`): a named advocate or advocacy organisation reviewed the TL;DRs, the simple text, the "questions to ask", and the For-me framing for clarity, tone, and what a patient would need that is missing.

To review, pick a page from `/review/` (or click *Review this page* on any unreviewed page) and complete the Review issue form: the checklist for your track, what you found (with sources), your name, role and organisation, a profile URL for verification, and a **conflict-of-interest statement** (funding, employment, advisory roles, equity in the last three years; "None declared" is valid and is displayed). A maintainer verifies identity, fixes what you flagged through the normal gate, and records the sign-off in `src/data/reviews.ts` (optionally with `personId` when you have a person record, so the badge links to it). The badge shows your name, the date and your COI; you appear on `/reviewers/` with a level by number of pages reviewed (1, 5, 20). Reviews without a COI statement are not recorded. See `.github/REVIEWERS.md` for tracks and verification rules.

Translations follow the same pattern: every translated TL;DR is marked "MT" (machine-assisted) until a named speaker signs it off through the Translation review form and the entry lands in `src/data/i18n/reviewed.ts`, after which the page shows "Reviewed".

## Organisation self-edits

Companies and institutions may propose changes to their own records through "Suggest an edit" with an official email domain or profile URL for verification. Promotional language is edited out; facts with sources are welcome. The merged record names the organisation in its provenance line.

## Trust and community tooling

- `npm run audit` — contradictions and staleness from the corpus alone (`public/audit.json`, rendered at `/audit/` and as good-first records at `/gaps/`).
- `npm run factcheck` — openFDA and ClinicalTrials.gov comparisons (`public/factcheck.json`); weekly via GitHub Actions.
- `npm run provenance` — last-edit commit per record from `git blame` (`public/provenance.json`, shown on each page) and per-contributor credits (`public/contributors.json`, rendered at `/contributors/`).
- `npx tsx scripts/gen-issue-forms.ts` — keeps the kind and language dropdowns in the issue forms in sync with `KINDS` and `LANGS`; `--check` fails when they drift (also run by the tests).
- `npx tsx scripts/fetch-votes.ts` — Discussions reactions per entity id into `public/votes.json` (weekly workflow; needs a token with `discussions: read`).
- `npx tsx scripts/newsletter.ts` — renders the weekly issue to `public/newsletter/` with an Atom feed (weekly workflow).
- `CORRECTIONS.md` — every confirmed factual correction, rendered at `/corrections/`.
- `src/data/confidence.ts` — named probability estimates for ideas and speculative roadmap steps. Propose revisions with your name and reasoning.
- `src/data/adoptions.ts` — ideas picked up outside OnCo, each with a source; rendered at `/idea-votes/`.

## Code

TypeScript strict, Next.js App Router, static export, Tailwind 4. Keep components small; keep data out of components; keep shared-file edits (schema, layout, `EntityDetail`) separate from data PRs. `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` must pass; CI runs them on every pull request.

## Conduct and security

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). Report security concerns as described in [SECURITY.md](SECURITY.md).

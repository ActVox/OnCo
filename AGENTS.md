<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Working in this repository

OnCo is a public, cited knowledge graph of oncology: about 19,000 records in `src/data`, rendered as a static
Next.js export. Readers are patients and the people caring for them. Every claim carries a source, and a page
that is confidently wrong is the worst thing this project can ship.

This file is short on purpose: it is read at the start of every session, so it holds only what is costly to
learn the hard way and cannot be a test. Everything else is enforced or written down elsewhere, linked below.

## Never

- **Never invent a fact, a figure, a citation or a date.** If a source cannot be reached, say so on the page. A
  named gap is worth more than a plausible number. Tools that summarise a page can fabricate: a fetch of a
  ministry page produced "universal health insurance since 1961" from a page containing neither the year nor the
  phrase. Verify anything load-bearing against the raw text.
- **Never cite an identifier you remember. Resolve it first.** This is the commonest real error, and it is not
  invention: a DOI or PubMed id recalled from training is usually a real paper, just the wrong one. Caught in two
  rounds: an id for a surveillance-imaging trial that resolved to a cancer-anorexia editorial, one for a Hodgkin
  late-effects cohort that resolved to IBIS-II, one for a retinal-imaging study, `10.1038/ng.621` used for the
  lymphoma EZH2 paper when it is the myeloid one, and wrong ids for BELINDA and ECHELON-3. Resolve every DOI
  through Crossref or Europe PMC and read the abstract before you use a figure from it.
- **Never alter a quotation to make it kinder or shorter.** Quoted abstracts keep their authors' words.
- **Never put a secret in the repository**, in a commit message, or in a chat. There are none here and there
  should continue to be none; `gitleaks` runs on every ship and a commit subject is republished publicly by
  `scripts/provenance.ts`, so write commit messages as if they were a page, because they become one.
- **Never copy patient data, or anything from a private project, into this repository.**
- **Never run `vercel link` or edit `.vercel/`.** The project is already linked; relinking can point a deploy at
  the wrong project.
- **Never edit files in the main checkout while a ship is running**, and never run gates or a second build during
  one. `scripts/ship.sh` sweeps the working tree into its commit, and the upload packs `public/` while the API
  build clears part of it: doing both at once killed a deploy that had reported success.
- **Never ship a change to the product without the owner's say-so.** `scripts/ship.sh` classifies the diff and
  refuses if it touches anything that decides what a page shows, in what order, or what it is called. Data ships
  on its own; the product waits. Send it with `scripts/propose-product-change.sh` and it appears at `/admin/`
  with a preview. `docs/PRODUCT-APPROVAL.md` is the rule and `scripts/change-class.ts` is where the line is
  drawn. Do not set `ONCO_PRODUCT_APPROVED` on your own judgement, however obviously good the change looks.
- **Never lower a floor or raise a budget to make a test pass.** Fix the corpus, the ranking or the page. If the
  measure itself is wrong, change what it counts and say why in the comment; that has been the right answer four
  times and the wrong one never.

## Rules a test cannot catch

- **An agent works in its own git worktree and never touches another.** Do not copy `node_modules` into one: that
  reached 37 GB across worktrees and filled the disk mid-run. Symlink it, or run the gates from the main checkout.
- **Check the branch you are on before you report it.** Agents have misreported their own branch three times.
- **Exit code 0 is not a commit and "UPLOADED" is not live.** Read the log, check `git log`, and confirm the page
  serves 200 before saying it shipped.
- **Verify on the rendered page, not only in the test.** Reading the live page has caught a gendered pronoun, a
  name printed twice in one sentence, and a budget measuring a quarter of what the reader downloads.
- **A fragment in a pattern needs word boundaries.** `imid` matched inside `pyrimidine` and put a myeloma drug's
  blood-clot warning on every fluoropyrimidine page, including one about a skin cream. Six review passes missed it.
- **A full-suite failure under load is usually the machine.** Five whole-page render files (`nested-anchors`,
  `mechanics`, `record-fold`, `record-top`, `EntityDetail`) time out on their own 120-second guard when other
  worktrees are building, and pass alone. Re-run the file before reporting it, and use `SLOW_TEST_MS`, which is
  the env var the chain already sets for this. Do not change a test to make it green.
- **The two registry files conflict on every parallel round, and one resolver gets it wrong.**
  `src/data/spikes/index.ts` resolves by union with `scripts/resolve-spike-registry.py`.
  `scripts/spike-sources.ts` holds its map on one very long line, and `scripts/resolve-additive.py` keeps both
  sides of it rather than merging them, which TypeScript rejects as duplicate keys. Merge that line by hand,
  union the entries, and then run `scripts/audit.test.ts`: it is the only thing that notices a lost entry. On
  2 October a hand-merge silently dropped seven files and that test was what caught it.
- **Supplement the record that exists; do not write a second one.** `SpikeSupplement` in
  `src/data/spikes/index.ts` attaches fields to a record another file owns, and the build fails if it names an
  id that does not exist. It is reachable only from a `Spike`, which needs a `cancerId`; for a record with no
  cancer, add to the owning file's own array instead.
- **Grade what is unproven rather than leaving it out.** Where something is widely sold and has no evidence,
  `src/data/complementary.ts` has the model: a tag `evidence:<grade>` from strong to harm, a number only where
  the source states one. A reader who finds nothing here finds the seller's own page instead.
- **Read the smallest page in a round, not the flagship.** That is where a wrongly matched card is visible.
- **Prefer the record that already exists.** A paper is its DOI and its PubMed id; a trial is its registry id. If
  the corpus holds one, supplement it. `npm run dedupe` surveys duplicates before you write.

## The executable truth

Prose drifts; these do not. Read them rather than a description of them.

- `scripts/ship.sh` — the ship chain: gates, commit, push, deploy, then verify the live pages.
- `scripts/resolve-spike-registry.py`, `scripts/resolve-additive.py` — the two merge conflicts every parallel
  round produces, resolved by union.
- `npm run validate` · `typecheck` · `lint` · `vitest run` — the gates. 113 test files encode rules, including
  tone, duplicate records, page cost, red-card matching and search recall.
- `npm run dedupe` · `dedupe:plan` · `dedupe:merge` — duplicate records, with `docs/DUPLICATE-RECORDS.md`.
- `npm run audit:weight` · `audit:mobile` — what a reader actually downloads, and how it reads on a phone.
- `docs/PRODUCT-APPROVAL.md` and `scripts/change-class.ts` — what waits for the owner and what does not.
- `scripts/page-weight.ts --check` and `src/data/page-weight.json` — what a reader downloads, against a ratchet.
  Every other budget in the repo measures static markup, and the hydration payload is 30 to 81 per cent of it.
- `docs/HOUSE-STYLE.md` and `docs/TONE.md` — how to write for this reader. Enforced by `src/lib/tone.test.ts`.
- `docs/CANCER-PAGES.md`, `docs/CANCER-FAMILIES.md`, `docs/DATA-SOURCES.md`, `docs/TABLES.md` — the corpus rules,
  the family roll-up, how to read sources that refuse a script, and the table engine.
- `CONTRIBUTING.md` — how to add a record.

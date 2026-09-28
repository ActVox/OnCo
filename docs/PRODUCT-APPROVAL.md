# Product changes wait for the owner

Set by the owner on 28 September 2026: "we have major changes to the site happening without my sign off, i want
them to go through my approval (not the typical data cron jobs that increase freshness or coverage but the
changes to the site)."

## The line

`scripts/change-class.ts` decides, and `scripts/change-class.test.ts` holds it:

- **data** — a record's content, a generated artefact, a fetcher's output. It changes what a page says. Ships.
- **product** — anything deciding what a page shows, in what order, or what it is called: components, routes,
  the section registry, the labels in all nine languages, the table and navigation libraries, the build config.
  It changes the product. **Waits.**
- **neither** — tests, documents, scripts, workflows. Never gates a deploy.

`src/lib/i18n` is product even though it looks like data: it is every label a reader reads.

## How it works

`scripts/ship.sh` classifies `origin/main..HEAD` before it builds. If there is a product change and
`ONCO_PRODUCT_APPROVED` is not set, it **refuses and says so**, rather than quietly doing something else.

To send one for review: `scripts/propose-product-change.sh "what changed and why"`. That pushes a branch, opens a
pull request, builds a preview deployment and records both in `public/product-queue.json`, which `/admin/`
renders. **The owner approves by merging the pull request.** A preview rather than a description is the point:
every complaint that led to this rule was about how a page looks and what order it is in, which no diff shows.

## What this does not do, stated plainly

**It is not authentication, and it cannot be.** The site is a static export with no server; `/admin/` is a public
page like every other, and anything it claimed to check would run in the reader's own browser. The owner's email
address is deliberately **not** in this repository: a client-side check against it would be no protection and
would publish his address.

**It does not bind an agent that holds the owner's credentials.** What it does is make the safe path the default,
make every product change visible before it ships, and leave a trail.

Real enforcement is one setting the owner holds, and it is worth turning on: restrict Vercel production
deployments to a branch only he merges, so a preview is the most any automated run can produce. Vercel's
deployment protection can also put `/admin/` behind his own login. Both are in his account, not in this repo.

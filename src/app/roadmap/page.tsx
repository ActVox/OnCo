import type { Metadata } from "next";
import Link from "next/link";
import { hubIdeas, hubIdeas2, hubIdeas3, type HubIdea } from "@/data/hub-ideas";
import { health, type HealthMetric } from "@/lib/health";
import { HealthGauges } from "@/components/HealthGauges";
import { completeness, headline } from "@/lib/completeness";
import { CompletenessTable } from "@/components/CompletenessTable";
import { Container, GroupKicker, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Roadmap", description: "How OnCo keeps expanding and stays current: corpus health gauges computed at build, every idea by status, and the method behind both." };

const REPO = "https://github.com/judegomila/OnCo";
const blob = (path: string) => `${REPO}/blob/main/${path}`;

type Shown = "shipped" | "building" | "planned" | "proposed" | "needs work";
const TONE: Record<Shown, string> = {
  shipped: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  building: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  planned: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  proposed: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  "needs work": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};
const ORDER: Shown[] = ["needs work", "building", "planned", "proposed", "shipped"];

type Row = HubIdea & { wave: number; shown: Shown; gauge?: HealthMetric };

/** An idea's displayed status: what the editors said, unless a metric measures the claim and says otherwise. */
function resolve(h: HubIdea, wave: number, metrics: Map<string, HealthMetric>): Row {
  const m = h.metric ? metrics.get(h.metric) : undefined;
  const contradicted = !!m && !m.met && (h.status === "shipped" || h.status === "building");
  return { ...h, wave, shown: contradicted ? "needs work" : h.status, gauge: m };
}

type MethodCard = { title: string; runs: string; cadence: string; code: Array<{ label: string; path: string }>; better: string };

const EXPANSION: MethodCard[] = [
  {
    title: "Gap audit against the goal",
    runs: "Enumerate the universe (ICD-O sites, FDA approvals since 2018, guideline tables, WHO essential medicines), diff it against the corpus, and write the gaps down with size and owner. The gauges above are the automated half; docs/GAPS.md is the editorial half.",
    cadence: "Gauges: every build. Editorial audit: at the start of each wave.",
    code: [{ label: "docs/GAPS.md", path: "docs/GAPS.md" }, { label: "src/lib/health.ts", path: "src/lib/health.ts" }, { label: "/gaps/", path: "src/app/gaps/page.tsx" }],
    better: "Open one GitHub issue per open GAPS.md row automatically, so the audit becomes a work queue rather than a document.",
  },
  {
    title: "Per-kind agents in parallel with disjoint file ownership",
    runs: "A wave is split into agents, each owning a set of data files nobody else touches (cancer deep dives, gap-fill, idea waves, people, key papers). They run in separate git worktrees, so merges are mechanical: no two agents edit the same file.",
    cadence: "Per wave; seven agents in the last one.",
    code: [{ label: "src/data/spikes/", path: "src/data/spikes" }, { label: "src/data/gap-fill.ts", path: "src/data/gap-fill.ts" }, { label: "src/data/ideas-waves/", path: "src/data/ideas-waves" }],
    better: "An ownership manifest checked in CI, so a change to a file outside an agent's allotment fails the build instead of a merge.",
  },
  {
    title: "Validate, typecheck, lint, test, build gates",
    runs: "Every push and pull request runs the schema validator (ids, dangling references, duplicates), the TypeScript compiler in strict mode, ESLint, the corpus tests (every TL;DR readable, every reference resolving), and a full static build.",
    cadence: "Every push to main and every pull request.",
    code: [{ label: ".github/workflows/ci.yml", path: ".github/workflows/ci.yml" }, { label: "scripts/validate.ts", path: "scripts/validate.ts" }, { label: "src/lib/graph.test.ts", path: "src/lib/graph.test.ts" }],
    better: "Turn each gauge target into a ratchet: a pull request may not lower a metric that is already above its target.",
  },
  {
    title: "Suggest-an-edit issues",
    runs: "Every object page has a form that opens a prefilled GitHub issue (entity, field, proposed value, source, who you are, conflicts) or a direct link to the record's line for a pull request. Organisations may edit their own records under their name.",
    cadence: "Continuous; triage within a week.",
    code: [{ label: "SuggestEdit.tsx", path: "src/components/SuggestEdit.tsx" }, { label: "issue templates", path: ".github/ISSUE_TEMPLATE" }, { label: "/suggest/", path: "src/app/suggest/page.tsx" }],
    better: "A bot that converts an accepted issue into a pull request against the exact line, with the source appended to `links`.",
  },
  {
    title: "Review tracks",
    runs: "Clinical, scientific, regulatory, patient-advocate, and organisation self-edit tracks, each with named reviewers and a conflict-of-interest field shown next to the badge. The badge component is built; the reviewer list is not yet populated.",
    cadence: "On merge of any factual change; badges dated.",
    code: [{ label: ".github/REVIEWERS.md", path: ".github/REVIEWERS.md" }, { label: "src/data/reviews.ts", path: "src/data/reviews.ts" }, { label: "ReviewBadge.tsx", path: "src/components/ReviewBadge.tsx" }],
    better: "Recruit one named reviewer per cancer and per front; the “Records a named human reviewer has signed off” gauge above is at zero until then, and the model panel does not count towards it.",
  },
];

const CURRENCY: MethodCard[] = [
  {
    title: "Trials from ClinicalTrials.gov",
    runs: "For every product, pull phase 2/3 studies from the ClinicalTrials.gov v2 API into public/trials/, then open a pull request with the diff for review.",
    cadence: "Weekly (Mondays 06:17 UTC) via GitHub Actions; also on demand.",
    code: [{ label: "refresh-trials.yml", path: ".github/workflows/refresh-trials.yml" }, { label: "scripts/fetch-trials.ts", path: "scripts/fetch-trials.ts" }],
    better: "Cover every product, not just the first batch (see the trials-snapshot gauge), and flag new recruiting trials as candidate trial records.",
  },
  {
    title: "Literature from Europe PMC",
    runs: "Paper counts per year and the latest titles for every drug, target, cancer, and technology into public/papers/; the /papers/ page recomputes the fastest-growing topics from the snapshot.",
    cadence: "Weekly (Tuesdays 05:41 UTC) via GitHub Actions.",
    code: [{ label: "refresh-papers.yml", path: ".github/workflows/refresh-papers.yml" }, { label: "scripts/fetch-papers.ts", path: "scripts/fetch-papers.ts" }],
    better: "Add the records created since the last run automatically (the papers-snapshot gauge shows the backlog) and tune query terms for ambiguous names.",
  },
  {
    title: "Fact check against openFDA and ClinicalTrials.gov",
    runs: "Products recorded as US-approved are checked against openFDA labels; trials with an NCT id against the registry's overall status. Mismatches land in public/factcheck.json and on /audit/; confirmed errors go to the corrections log.",
    cadence: "Weekly (Mondays 06:41 UTC), in the same job as the audit and provenance refresh.",
    code: [{ label: "factcheck.yml", path: ".github/workflows/factcheck.yml" }, { label: "scripts/factcheck.ts", path: "scripts/factcheck.ts" }],
    better: "Add EMA, MHRA, PMDA, and NMPA checks so the regional approvals table is verified, not just the US column.",
  },
  {
    title: "Audit for staleness and contradictions",
    runs: "A pure function of the corpus: status fields that disagree with approvals, positive trials without results, standard-of-care rows citing withdrawn items, future years, duplicate names, and every record's asOf age.",
    cadence: "Every build (rendered at /audit/) and weekly in the fact-check job.",
    code: [{ label: "scripts/audit.ts", path: "scripts/audit.ts" }, { label: "/audit/", path: "src/app/audit/page.tsx" }],
    better: "Treat high-severity findings as build failures once the backlog is cleared.",
  },
  {
    title: "Provenance from git",
    runs: "git blame over every data file maps each record to the last commit that touched it, so every page can say who edited it, when, and link the diff.",
    cadence: "Weekly in the fact-check job; needs full history, so it does not run at build time.",
    code: [{ label: "scripts/provenance.ts", path: "scripts/provenance.ts" }, { label: "ProvenanceLine.tsx", path: "src/components/ProvenanceLine.tsx" }],
    better: "Run it in the deploy step so new records never wait a week for a provenance line (see the provenance gauge).",
  },
  {
    title: "Molecule structures from PubChem and PDB",
    runs: "Resolves each product's structure definition to a compact JSON under public/structures/; small molecules rotate on their pages, biologics get an explained placeholder.",
    cadence: "Manual: `npm run fetch:structures`. No scheduled workflow yet.",
    code: [{ label: "scripts/fetch-structures.ts", path: "scripts/fetch-structures.ts" }, { label: "src/data/structures.ts", path: "src/data/structures.ts" }],
    better: "Schedule it, and derive the PubChem lookup from the product name so new small molecules do not need a hand-written entry.",
  },
  {
    title: "Logos from Wikidata",
    runs: "For every company, institution, and collection: Wikidata match with domain verification, then Commons logo, with favicon fallback, into public/logos/.",
    cadence: "Manual: `npm run fetch:logos`. No scheduled workflow yet.",
    code: [{ label: "scripts/fetch-logos.ts", path: "scripts/fetch-logos.ts" }],
    better: "Schedule it monthly and fail loudly when a logo's licence is missing.",
  },
  {
    title: "Research output from OpenAlex",
    runs: "Oncology works and citations per institution and per country (OpenAlex subfield 2730), feeding the university and country rankings, with the query published.",
    cadence: "Manual: `npm run fetch:openalex` and `npm run fetch:countries`. No scheduled workflow yet.",
    code: [{ label: "scripts/fetch-openalex.ts", path: "scripts/fetch-openalex.ts" }, { label: "scripts/fetch-countries.ts", path: "scripts/fetch-countries.ts" }],
    better: "Schedule quarterly; store the run date on the ranking pages so readers can see how fresh the counts are.",
  },
  {
    title: "Cancer burden from GLOBOCAN",
    runs: "IARC Global Cancer Observatory incidence and mortality by country and cancer into public/globocan/, behind /cases/ and the country pages, with data gaps marked rather than filled.",
    cadence: "Manual: `npm run fetch:globocan`. The source updates every few years.",
    code: [{ label: "scripts/fetch-globocan.ts", path: "scripts/fetch-globocan.ts" }],
    better: "Watch the GCO version endpoint and open an issue when a new edition appears.",
  },
  {
    title: "asOf on every record",
    runs: "The schema requires an asOf date on every record: when its facts were last checked. The audit lists the oldest; the staleness gauge above counts anything older than 60 days.",
    cadence: "Set by whoever edits the record; checked every build.",
    code: [{ label: "src/lib/schema.ts", path: "src/lib/schema.ts" }],
    better: "A monthly “re-verify” queue of the 50 oldest records, assigned by kind.",
  },
  {
    title: "Corrections log and changelog",
    runs: "Every confirmed factual error is logged with what was wrong, how it was found, and the fixing commit; every release is summarised in the changelog, which doubles as the weekly newsletter.",
    cadence: "Corrections as they are confirmed; changelog per release.",
    code: [{ label: "CORRECTIONS.md", path: "CORRECTIONS.md" }, { label: "CHANGELOG.md", path: "CHANGELOG.md" }],
    better: "Generate the changelog's data section from the git diff of src/data/ so no change goes unannounced.",
  },
];

function Method({ c }: { c: MethodCard }) {
  return (
    <article className="card p-4 text-sm leading-relaxed flex flex-col gap-2">
      <h3 className="font-medium text-[15px] leading-snug">{c.title}</h3>
      <p className="text-muted">{c.runs}</p>
      <dl className="grid grid-cols-[6rem_1fr] gap-x-3 gap-y-1">
        <dt className="kicker">How often</dt><dd>{c.cadence}</dd>
        <dt className="kicker">Where</dt><dd className="flex flex-wrap gap-x-3 gap-y-0.5">{c.code.map((x) => <a key={x.path} href={blob(x.path)} rel="noopener" className="underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground font-mono text-xs">{x.label}</a>)}</dd>
        <dt className="kicker">Better if</dt><dd>{c.better}</dd>
      </dl>
    </article>
  );
}

export default function RoadmapPage() {
  const metrics = health();
  const coverage = completeness();
  const cov = headline(coverage);
  const byId = new Map(metrics.map((m) => [m.id, m]));
  const rows: Row[] = [...hubIdeas.map((h) => resolve(h, 1, byId)), ...hubIdeas2.map((h) => resolve(h, 2, byId)), ...hubIdeas3.map((h) => resolve(h, 3, byId))];
  const themes = [...new Set(rows.map((r) => r.theme))];
  const counts = ORDER.map((s) => ({ s, n: rows.filter((r) => r.shown === s).length })).filter((c) => c.n > 0);
  const contradicted = rows.filter((r) => r.shown === "needs work");

  const proposeUrl = `${REPO}/issues/new?${new URLSearchParams({
    title: "roadmap: ",
    labels: "roadmap",
    body: ["**Idea** (one line):", "", "**Why it matters** (who needs it, what changes):", "", "**Theme** (Knowledge graph, Patients, Pipeline, Institutions, Community, Tools, Reach, Depth, Users, Power, Trust, Visual, Strategy, Intelligence):", "", "**How we would know it is done** (a metric from /roadmap/ or a new one to add to src/lib/health.ts):", ""].join("\n"),
  }).toString()}`;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="Roadmap"
        lede="Every upgrade idea we have, with a status the corpus can contradict. The gauges are computed from the data at build time; where a claim of &ldquo;shipped&rdquo; is not borne out, the idea is shown as needing work and the gauge says what to do." />
      <Container className="pb-16">
        <nav aria-label="Sections" className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-8">
          {[["#health", "A. Corpus health"], ["#completeness", "A2. Completeness"], ["#ideas", "B. Ideas by status"], ["#method", "C. Method"], ["#propose", "D. Propose an idea"]].map(([href, label]) => (
            <a key={href} href={href} className="underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground">{label}</a>
          ))}
        </nav>

        <section id="health" className="scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">A. Corpus health</h2>
          <p className="text-muted text-sm mb-5 max-w-3xl">
            {metrics.length} coverage checks over {metrics.find((m) => m.id === "sources")?.total.toLocaleString("en-GB")} records, recomputed on every build from <a className="underline" href={blob("src/lib/health.ts")} rel="noopener">src/lib/health.ts</a>.
            Each gauge is passing records over records checked; each names the worst offenders and the one edit that fixes them. Adding a check is one entry in an array.
          </p>
          <HealthGauges metrics={metrics} />
        </section>

        <section id="completeness" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">A2. Completeness</h2>
          <p className="text-muted text-sm mb-5 max-w-3xl">
            The gauges above measure whether each record is complete. This table measures the other axis: of everything that exists, how much OnCo holds. Each row is an OnCo count against a sourced count of the world on the same scope
            (products against the NCI list of FDA-approved cancer drugs, institutions against the NCI-designated centres and OECI members, journals against MEDLINE&apos;s oncology set), with the missing items named on <Link href="/completeness/" className="underline">/completeness/</Link>.
            Across the {coverage.filter((c) => c.listed).length} scopes with a public list, OnCo holds {cov.ours.toLocaleString("en-GB")} of {cov.total.toLocaleString("en-GB")} listed items ({cov.pct}%). Denominators: <a className="underline" href={blob("src/data/universe.ts")} rel="noopener">src/data/universe.ts</a>, refreshed weekly.
          </p>
          <CompletenessTable rows={coverage} compact />
        </section>

        <section id="ideas" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">B. Ideas by status</h2>
          <p className="text-muted text-sm mb-4 max-w-3xl">
            All {rows.length} product, data, and community ideas from three waves, grouped by theme. The number is wave and position (W2·07). Editorial statuses are shipped, building, planned, proposed;
            {" "}<strong className="font-medium text-foreground">needs work</strong> is applied automatically when a gauge linked to the idea is below its target{contradicted.length ? `, which is currently the case for ${contradicted.length} idea${contradicted.length === 1 ? "" : "s"} previously marked shipped or building` : ""}.
          </p>
          <div className="flex flex-wrap gap-2 mb-8 text-sm">{counts.map(({ s, n }) => <span key={s} className={`chip ${TONE[s]}`}>{n} {s}</span>)}</div>
          {themes.map((t) => {
            const list = rows.filter((r) => r.theme === t).sort((a, b) => ORDER.indexOf(a.shown) - ORDER.indexOf(b.shown) || a.wave - b.wave || a.n - b.n);
            return (
              <section key={t} className="mt-8">
                <h3 className="text-lg font-semibold mb-3">{t} <span className="text-sm text-muted font-normal">{list.length}</span></h3>
                <ol className="card divide-y divide-border">
                  {list.map((h) => (
                    <li key={`${h.wave}-${h.n}`} id={`idea-w${h.wave}-${h.n}`} className="p-4 grid sm:grid-cols-[4rem_1fr_auto] gap-3 scroll-mt-24">
                      <span className="font-mono text-muted tabular-nums text-sm">W{h.wave}·{String(h.n).padStart(2, "0")}</span>
                      <div>
                        <div className="font-medium">{h.title}</div>
                        <p className="text-sm text-muted mt-0.5">{h.why}</p>
                        {h.gauge && (
                          <p className="text-xs mt-1.5">
                            {h.shown === "needs work" ? <span className="text-rose-700 dark:text-rose-300">Editorial status was &ldquo;{h.status}&rdquo;, but </span> : <span className="text-muted">Verified: </span>}
                            <a href={`#metric-${h.gauge.id}`} className="underline decoration-foreground/25 underline-offset-[3px] hover:decoration-foreground">{h.gauge.label.toLowerCase()}</a>
                            <span className="text-muted"> is {h.gauge.value.toLocaleString("en-GB")}/{h.gauge.total.toLocaleString("en-GB")} ({h.gauge.pct}%, target {h.gauge.target}%).</span>
                            {h.shown === "needs work" && <> <a href={h.gauge.issueUrl} rel="noopener" className="underline">Claim it.</a></>}
                          </p>
                        )}
                      </div>
                      <span className={`chip self-start ${TONE[h.shown]}`}>{h.shown}</span>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </section>

        <section id="method" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">C. Method</h2>
          <p className="text-muted text-sm mb-6 max-w-3xl">Two loops. Expansion adds records and features in waves and gates them; currency refreshes what the world has changed and audits what we already say. Each card says what runs, how often, where the code is, and what would make it better.</p>
          <h3 className="text-lg font-semibold mb-3">How expansion works</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{EXPANSION.map((c) => <Method key={c.title} c={c} />)}</div>
          <h3 className="text-lg font-semibold mt-10 mb-3">How currency works</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CURRENCY.map((c) => <Method key={c.title} c={c} />)}</div>
        </section>

        <section id="propose" className="mt-16 scroll-mt-24">
          <h2 className="text-2xl font-semibold tracking-tight mb-2">D. Propose an idea</h2>
          <div className="card p-5 text-sm leading-relaxed max-w-3xl">
            <p>Ideas live in <a className="underline font-mono text-xs" href={blob("src/data/hub-ideas.ts")} rel="noopener">src/data/hub-ideas.ts</a> as records with a title, a one-line why, a theme, a status, and optionally the id of a gauge that measures whether the claim holds. To add one:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Open a roadmap issue with the idea, why it matters, and how we would know it is done. Argue for it there.</li>
              <li>Or add the record directly in a pull request. If the idea makes a measurable claim, add a metric for it in <code>src/lib/health.ts</code> and reference it with <code>metric</code>, so the roadmap can never call it shipped when it is not.</li>
              <li>Statuses are editorial; the gauges are not. A shipped idea with a failing gauge shows as needing work until the corpus catches up.</li>
            </ol>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={proposeUrl} rel="noopener" className="rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-medium hover:brightness-110">Propose an idea on GitHub</a>
              <Link href="/gaps/" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-foreground/5">Gaps to fill</Link>
              <Link href="/audit/" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-foreground/5">Automated checks</Link>
              <Link href="/suggest/" className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-foreground/5">Suggest an edit</Link>
            </div>
          </div>
        </section>
      </Container>
    </>
  );
}

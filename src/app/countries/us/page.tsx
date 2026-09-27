import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity, type Kind } from "@/lib/schema";
import { Container, EntityCard, GroupKicker, PageHeader, Section } from "@/components/ui";
import { GLOBOCAN, sitesForCountry } from "@/lib/globocan";
import { countryExtras } from "@/data/country-extras";
import { regionalApprovals, REGION_META } from "@/data/regional-approvals";
import { StaticTable, type StaticColumn, type StaticRow } from "@/components/filters/StaticTable";
import { US_ACCELERATED, US_ACCELERATED_FROM, US_ASOF, US_COMPANIES, US_COVERAGE_RULES, US_DISPARITIES, US_DRUGS, US_GAPS, US_INSTITUTIONS, US_MACHINE, US_NETWORK, US_PAPERS, US_PAYING, US_PEOPLE, US_PROFILE, US_REGULATOR, US_TRIALS, type CountryCard } from "@/data/country-us";

export const metadata: Metadata = pageMeta({
  title: "Cancer in the United States",
  description: "United States deep dive: who pays and what it costs a person (Medicare Part B versus Part D, the $2,100 cap, medical debt, measured financial toxicity), the FDA and the fate of its accelerated approvals, why coverage is not approval (the compendia rule, NCCN, prior authorisation), the NCI and its trial network, and the disparities with their cohorts.",
  path: "/countries/us/",
});

const fmt = (n: number | null) => (n === null ? "n/a" : n.toLocaleString("en-GB"));
const fmt1 = (n: number | null) => (n === null ? "n/a" : n.toFixed(1));

const SITE_COLUMNS: StaticColumn[] = [
  { key: "site", label: "Site" },
  { key: "cases", label: "New cases", sortable: true, numeric: true, className: "text-right" },
  { key: "deaths", label: "Deaths", sortable: true, numeric: true, className: "text-right" },
  { key: "incAsr", label: "Incidence ASR", sortable: true, numeric: true, className: "text-right" },
  { key: "mortAsr", label: "Mortality ASR", sortable: true, numeric: true, className: "text-right" },
  { key: "pages", label: "OnCo cancer page" },
];
const num = (n: number | null, d = 0) => (n === null ? { text: "n/a", v: -1, muted: true } : { text: d ? n.toFixed(d) : n.toLocaleString("en-GB"), v: n });

function Cards({ cards }: { cards: CountryCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((s) => (
        <article key={s.id} id={s.id} className="card p-5 flex flex-col">
          <h3 className="font-semibold leading-snug text-balance">{s.title}</h3>
          <p className="mt-2 text-[15px] leading-relaxed">{s.plain}</p>
          <details className="mt-3 group">
            <summary className="cursor-pointer text-sm text-muted hover:text-foreground select-none">More detail</summary>
            <p className="mt-2 text-sm leading-relaxed text-foreground/85">{s.detail}</p>
          </details>
          <ul className="mt-auto pt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {s.links.map((l) => (l.url.startsWith("/")
              ? <li key={l.url}><Link href={l.url} className="underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground text-muted hover:text-foreground">{l.label}</Link></li>
              : <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground text-muted hover:text-foreground">{l.label}</a></li>))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function Grid({ items, compact = true }: { items: Entity[]; compact?: boolean }) {
  if (!items.length) return <p className="text-sm text-muted">Nothing recorded yet.</p>;
  return <div className={`grid gap-3 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>{items.map((e) => <EntityCard key={e.id} e={e} compact={compact} />)}</div>;
}

export default function UnitedStatesPage() {
  const g = graph();
  const pick = (ids: string[], kind?: Kind): Entity[] => ids.map((id) => g.get(id)).filter((e): e is Entity => !!e && (!kind || e.kind === kind));
  const institutions = pick(US_INSTITUTIONS, "institution");
  const network = pick(US_NETWORK, "company");
  const companies = pick(US_COMPANIES, "company");
  const drugs = pick(US_DRUGS, "drug");
  const trials = pick(US_TRIALS, "trial");
  const papers = pick(US_PAPERS, "paper");
  const people = pick(US_PEOPLE, "person");

  const allInstitutions = g.kind("institution").filter((i) => i.country === "US").length;
  const allCompanies = g.kind("company").filter((c) => c.country === "US").length;
  const usApproved = g.kind("drug").filter((d) => { const r = regionalApprovals[d.id]?.US; return r && (r.status === "approved" || r.status === "conditional"); }).length;
  const usWithdrawn = g.kind("drug").filter((d) => regionalApprovals[d.id]?.US?.status === "withdrawn").length;

  const profile = sitesForCountry(GLOBOCAN, "USA");
  const all = profile ? GLOBOCAN.countries.USA?.data?.["39"] : undefined;
  const topSites = profile ? profile.sites.filter((s) => s.cases !== null && s.label !== "Non-melanoma skin cancer").slice(0, 12) : [];
  const extra = countryExtras.US;
  const meta = REGION_META.US;
  const siteRows: StaticRow[] = topSites.map((s) => ({
    id: String(s.code),
    site: s.label,
    cases: num(s.cases), deaths: num(s.deaths), incAsr: num(s.incAsr, 1), mortAsr: num(s.mortAsr, 1),
    pages: s.oncoIds.map((id) => g.get(id)).filter((e): e is Entity => !!e).map((e) => ({ text: e.name, href: routeFor(e), className: "underline" })),
  }));

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="who"><span className="kicker">·</span><Link href="/countries/" className="kicker hover:underline">Countries</Link></GroupKicker>}
        title={`${meta.flag} Cancer in the United States`}
        lede={`A country of about ${extra.population} million people that generates more cancer evidence than any other, usually approves a new cancer medicine before any other regulator, pays more for it than any other country, and left 26.7 million of its own people uninsured for the whole of 2025. This page is about the country rather than about oncology: who pays and what a person is billed, what the regulator requires and what happens when nobody checks, how a drug becomes payable after it is approved, and who the research machine misses. It gathers ${institutions.length} institutions, ${network.length} cooperative groups, ${companies.length} companies, ${trials.length} trials, ${papers.length} key papers and ${people.length} people from the corpus around that. Facts checked ${US_ASOF}; every card links its sources.`}
      />
      <Container className="pb-16">
        <nav aria-label="Sections" className="flex flex-wrap gap-2 text-sm">
          {[["#profile", "Cancer profile"], ["#paying", "Who pays"], ["#regulator", "The FDA"], ["#coverage", "Coverage is not approval"], ["#machine", "The research machine"], ["#disparities", "Disparities"], ["#institutions", "Institutions"], ["#network", "Trial network"], ["#companies", "Companies"], ["#trials", "Trials and papers"], ["#people", "People"], ["#gaps", "Gaps"]].map(([h, l]) => <a key={h} href={h} className="chip hover:bg-surface">{l}</a>)}
        </nav>

        <Section id="profile" title="Cancer profile" aside={<span className="text-sm text-muted">GLOBOCAN {GLOBOCAN.year} estimates, rendered from the corpus data file</span>}>
          <Cards cards={US_PROFILE} />
          {profile && all && (
            <div className="mt-6 card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="font-semibold">Leading cancers in the United States, {GLOBOCAN.year}</h3>
                <span className="text-xs text-muted">All cancers (C00-97): {fmt(all[0])} new cases, {fmt(all[2])} deaths; age-standardised incidence {fmt1(all[1])} and mortality {fmt1(all[3])} per 100,000; cumulative risk to 74: {fmt1(all[4])}%.</span>
              </div>
              <StaticTable rows={siteRows} columns={SITE_COLUMNS} noun="sites" defaultSort={{ key: "cases", dir: -1 }} />
              <p className="mt-3 text-xs text-muted">Source: {GLOBOCAN.citation} <a href={GLOBOCAN.sourceUrl} className="underline" rel="noopener">{GLOBOCAN.sourceUrl}</a>. ASR = age-standardised rate per 100,000 (World standard). These are IARC modelled estimates for 2022 and differ from the American Cancer Society projections in the cards above, which use United States registry incidence through 2022 and death certificates through 2023. Compare countries on the <Link href="/cases/" className="underline">cases by country</Link> page.</p>
            </div>
          )}
        </Section>

        <Section id="paying" title="Who pays, and what it costs a person">
          <Cards cards={US_PAYING} />
          <p className="mt-3 text-sm text-muted">Product by product: <Link href="/coverage/us/" className="underline">Paying for cancer care in the United States</Link> gives the Medicare benefit category, the usual commercial pattern, list prices where one is published and the assistance programme for every approved product. <Link href="/assistance/" className="underline">Financial help</Link> and <Link href="/free/" className="underline">Free in oncology</Link> list what costs nothing and who qualifies.</p>
        </Section>

        <Section id="regulator" title={`The regulator: ${meta.regulator}`} aside={<a href={meta.url} className="text-sm underline" rel="noopener">FDA oncology approval notifications</a>}>
          <Cards cards={US_REGULATOR} />
          <div className="mt-6 card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
              <h3 className="font-semibold">Every oncology accelerated approval, by what became of it</h3>
              <span className="text-xs text-muted">FDA tables read {US_ACCELERATED.readOn}</span>
            </div>
            <p className="text-sm text-muted mb-4">The FDA keeps four separate lists rather than one, so the shape of the pathway is not visible from any single page. Put together, {US_ACCELERATED.rows.reduce((n, r) => n + r.count, 0)} oncology indications have been granted accelerated approval since {US_ACCELERATED_FROM}. The medians below are computed from the two date columns of the FDA&apos;s own tables; the agency does not publish them.</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {US_ACCELERATED.rows.map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <a href={r.url} className="font-medium underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground" target="_blank" rel="noopener noreferrer">{r.label}</a>
                    <span className="tabular-nums text-lg font-semibold">{r.count}</span>
                  </div>
                  {r.years && <p className="mt-1 text-sm">Median <span className="tabular-nums font-medium">{r.years}</span> years <span className="text-muted">(middle half {r.range})</span></p>}
                  <p className="mt-1 text-xs text-muted">{r.note} FDA page current {r.current}.</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 card p-5 text-sm">
            <h3 className="font-semibold text-base">What OnCo holds about United States approvals</h3>
            <p className="mt-1 text-muted">{usApproved} products carry a sourced United States approval row and {usWithdrawn} a withdrawal, out of {g.kind("drug").length.toLocaleString("en-GB")} products in the corpus. An absent row means not yet researched rather than not approved: this count measures our reading, not the FDA&apos;s output. The <Link href="/regulatory/" className="underline">regulatory timeline</Link> carries every dated designation, filing, complete response letter and label change we hold, with the weekly FDA feed; <Link href="/regulatory/regions/" className="underline">approvals by region</Link> sets the United States beside the EU, UK, Japan, China, Australia and India.</p>
          </div>
        </Section>

        <Section id="coverage" title="Coverage is not approval">
          <Cards cards={US_COVERAGE_RULES} />
        </Section>

        <Section id="machine" title="What the United States does that no other country does, and who it misses">
          <Cards cards={US_MACHINE} />
        </Section>

        <Section id="disparities" title="Disparities, with their cohorts">
          <Cards cards={US_DISPARITIES} />
        </Section>

        <Section id="institutions" title="Institutions, centres and funders" aside={<span className="text-sm text-muted">{allInstitutions} United States institutions in the corpus · <Link href="/institutions/" className="underline">map and ranking</Link></span>}>
          <Grid items={institutions} />
        </Section>

        <Section id="network" title="The publicly funded trial network" aside={<Link href="/sponsors/" className="text-sm underline">All trial sponsors →</Link>}>
          <Grid items={network} />
        </Section>

        <Section id="companies" title="Companies" aside={<span className="text-sm text-muted">{allCompanies} United States companies in the corpus · <Link href="/companies/" className="underline">all companies</Link></span>}>
          <Grid items={companies} />
          {drugs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Approved in the United States first</h3>
              <p className="text-sm text-muted mb-3">Products whose first approval anywhere was American, from the first targeted kinase inhibitor to the first cell therapies and the first tissue-agnostic indications.</p>
              <Grid items={drugs} />
            </div>
          )}
        </Section>

        <Section id="trials" title="Notable trials and key papers">
          <h3 className="font-semibold mb-2">Trials</h3>
          <p className="text-sm text-muted mb-3">Publicly funded trials that answered questions no company would pay to ask: platform and screening protocols, de-escalation, two marketed drugs compared head to head, and forty years of survivor follow-up.</p>
          <Grid items={trials} />
          <h3 className="font-semibold mt-6 mb-2">Key papers</h3>
          <Grid items={papers} />
        </Section>

        <Section id="people" title="People">
          <Grid items={people} />
        </Section>

        <Section id="gaps" title="What could not be sourced">
          <div className="card p-5">
            <p className="text-sm text-muted mb-3">Named rather than quietly omitted. Each is a figure this page wanted and did not get from a primary source, with the reason.</p>
            <ul className="space-y-2 text-[15px] leading-relaxed list-disc pl-5">
              {US_GAPS.map((s) => <li key={s.slice(0, 40)}>{s}</li>)}
            </ul>
          </div>
        </Section>

        <section className="mt-10 grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How this page is built</h2>
            <p>The cards are hand-written from the linked sources and dated {US_ASOF}. The entity lists are pulled live from the corpus by id, so a new American trial, company or person added anywhere in OnCo appears here once listed in <code>src/data/country-us.ts</code>. Burden figures come from the GLOBOCAN {GLOBOCAN.year} data file used across the site; American registry and American Cancer Society figures differ from them and are quoted with their own source and cohort. The accelerated-approval medians are OnCo arithmetic over the FDA&apos;s own published tables, described on the record so anyone can repeat them.</p>
          </div>
          <div className="card p-5 space-y-2 border-amber-300/60 dark:border-amber-700/50">
            <h2 className="font-semibold text-base">Verify before relying on it</h2>
            <p>Coverage rules, plan formularies, cost-sharing limits and approvals change every year, and several figures here move on 1 January. Check <a href="https://www.medicare.gov" className="underline" rel="noopener">Medicare.gov</a>, <a href="https://www.healthcare.gov" className="underline" rel="noopener">HealthCare.gov</a>, your own plan documents and the <a href={meta.url} className="underline" rel="noopener">FDA</a> before acting on anything on this page. Nothing here is medical, legal or financial advice. Corrections are welcome through the <Link href="/suggest/" className="underline">suggest an edit</Link> form.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

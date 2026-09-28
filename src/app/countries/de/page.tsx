import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity, type Kind } from "@/lib/schema";
import { Container, EntityCard, GroupKicker, PageHeader, Section } from "@/components/ui";
import { GLOBOCAN, sitesForCountry } from "@/lib/globocan";
import { countryExtras } from "@/data/country-extras";
import { regionalApprovals } from "@/data/regional-approvals";
import { readPublicJson } from "@/lib/feed-meta";
import { StaticTable, type StaticColumn, type StaticRow } from "@/components/filters/StaticTable";
import {
  DE_ASOF, DE_ASSESSMENT, DE_CERTIFICATION, DE_COMPANIES, DE_DOING, DE_DRUGS, DE_GAPS, DE_INSTITUTIONS, DE_PAPERS,
  DE_PAYING, DE_PEOPLE, DE_PRECISION, DE_PROFILE, DE_REGISTRIES, DE_REGULATOR, DE_TRIALS, type CountryCard,
} from "@/data/country-de";

export const metadata: Metadata = pageMeta({
  title: "Cancer in Germany",
  description: "Germany deep dive: the cancer profile and how the Robert Koch Institute counts it, statutory and private insurance, the AMNOG rule that reimburses a new drug from day one and prices it afterwards, the G-BA and IQWiG benefit assessment, BfArM and the Paul-Ehrlich-Institut alongside the EMA, the German Cancer Society's certified centres and what the evidence says about them, mandatory clinical cancer registration, molecular tumour boards, and the institutions, companies, trials, papers and people in the corpus.",
  path: "/countries/de/",
});

const fmt = (n: number | null) => (n === null ? "n/a" : n.toLocaleString("en-GB"));
const fmt1 = (n: number | null) => (n === null ? "n/a" : n.toFixed(1));
const num = (n: number | null, d = 0) => (n === null ? { text: "n/a", v: -1, muted: true } : { text: d ? n.toFixed(d) : n.toLocaleString("en-GB"), v: n });

const SITE_COLUMNS: StaticColumn[] = [
  { key: "site", label: "Site" },
  { key: "cases", label: "New cases", sortable: true, numeric: true, className: "text-right" },
  { key: "deaths", label: "Deaths", sortable: true, numeric: true, className: "text-right" },
  { key: "incAsr", label: "Incidence ASR", sortable: true, numeric: true, className: "text-right" },
  { key: "mortAsr", label: "Mortality ASR", sortable: true, numeric: true, className: "text-right" },
  { key: "pages", label: "OnCo cancer page" },
];

const GBA_COLUMNS: StaticColumn[] = [
  { key: "product", label: "Product" },
  { key: "indication", label: "Indication assessed" },
  { key: "status", label: "Stage", filterable: true },
  { key: "date", label: "Started", sortable: true, className: "text-right" },
];

/** The G-BA early benefit assessment register, fetched by scripts/fetch-hta.ts into public/hta/index.json. */
type HtaSnapshot = {
  fetched: string;
  decisions: Array<{ body: string; drugId?: string; product: string; brand?: string; title: string; verdict: string; verdictLabel: string; date?: string; url: string; note?: string }>;
};

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
            {s.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground text-muted hover:text-foreground">{l.label}</a></li>)}
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

export default function GermanyPage() {
  const g = graph();
  const pick = (ids: string[], kind?: Kind): Entity[] => ids.map((id) => g.get(id)).filter((e): e is Entity => !!e && (!kind || e.kind === kind));
  const institutions = pick(DE_INSTITUTIONS, "institution");
  const companies = pick(DE_COMPANIES, "company");
  const drugs = pick(DE_DRUGS, "drug");
  const trials = pick(DE_TRIALS, "trial");
  const papers = pick(DE_PAPERS, "paper");
  const people = pick(DE_PEOPLE, "person");

  const allInstitutions = g.kind("institution").filter((i) => i.country === "DE").length;
  const allCompanies = g.kind("company").filter((c) => c.country === "DE").length;
  const euApproved = g.kind("drug").filter((d) => { const r = regionalApprovals[d.id]?.EU; return r && (r.status === "approved" || r.status === "conditional"); }).length;

  const profile = sitesForCountry(GLOBOCAN, "DEU");
  const all = profile ? GLOBOCAN.countries.DEU?.data?.["39"] : undefined;
  const topSites = profile ? profile.sites.filter((s) => s.cases !== null && s.label !== "Non-melanoma skin cancer").slice(0, 14) : [];
  const extra = countryExtras.DE;
  const siteRows: StaticRow[] = topSites.map((s) => ({
    id: String(s.code),
    site: s.label,
    cases: num(s.cases), deaths: num(s.deaths), incAsr: num(s.incAsr, 1), mortAsr: num(s.mortAsr, 1),
    pages: s.oncoIds.map((id) => g.get(id)).filter((e): e is Entity => !!e).map((e) => ({ text: e.name, href: routeFor(e), className: "underline" })),
  }));

  // Live G-BA rows: the early benefit assessment register matched to corpus products by active substance.
  const snap = readPublicJson<HtaSnapshot>("hta/index.json");
  const gba = (snap?.decisions ?? []).filter((d) => d.body === "G-BA");
  const gbaRows: StaticRow[] = gba.map((d) => {
    const e = d.drugId ? g.get(d.drugId) : undefined;
    return {
      id: d.url,
      product: [{ text: e?.name ?? d.product, href: e ? routeFor(e) : undefined, sub: d.brand }],
      indication: [{ text: d.note ?? d.title, href: d.url, ext: true, className: "underline decoration-foreground/20" }],
      status: [{ text: d.verdictLabel, chip: /abgeschlossen/i.test(d.verdict) ? "chip" : "chip text-muted" }],
      date: d.date ? { text: d.date, v: d.date } : { text: "n/a", v: "", muted: true },
    };
  });

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="who"><span className="kicker">·</span><Link href="/countries/" className="kicker hover:underline">Countries</Link></GroupKicker>}
        title="🇩🇪 Cancer in Germany"
        lede={`A country of about ${extra.population.toLocaleString("en-GB")} million people that does one thing almost no other country does: a newly approved cancer drug is paid for by statutory insurance from the day it goes on sale, and only afterwards is it asked to prove how much better it is, with the price following the answer. Germany also certifies and audits its cancer centres against published criteria, and registers every cancer clinically by law. This page gathers ${institutions.length} institutions, ${companies.length} companies, ${trials.length} trials, ${papers.length} key papers and ${people.length} people from the corpus, with the health system, the regulators, the registries and the burden figures around them. Facts checked ${DE_ASOF}; every card links its sources.`}
      />
      <Container className="pb-16">
        <nav aria-label="Sections" className="flex flex-wrap gap-2 text-sm">
          {[["#profile", "Cancer profile"], ["#registries", "Registries"], ["#paying", "Paying for care"], ["#assessment", "Benefit assessment"], ["#regulator", "Regulators"], ["#certification", "Certified centres"], ["#precision", "Molecular tumour boards"], ["#institutions", "Institutions"], ["#companies", "Companies"], ["#trials", "Trials and papers"], ["#people", "People"], ["#doing", "What is being done"], ["#gaps", "Gaps"]].map(([h, l]) => <a key={h} href={h} className="chip hover:bg-surface">{l}</a>)}
        </nav>

        <Section id="profile" title="Cancer profile" aside={<span className="text-sm text-muted">GLOBOCAN {GLOBOCAN.year} estimates, rendered from the corpus data file</span>}>
          <Cards cards={DE_PROFILE} />
          {profile && all && (
            <div className="mt-6 card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="font-semibold">Leading cancers in Germany, {GLOBOCAN.year}</h3>
                <span className="text-xs text-muted">All cancers (C00-97): {fmt(all[0])} new cases, {fmt(all[2])} deaths; age-standardised incidence {fmt1(all[1])} and mortality {fmt1(all[3])} per 100,000; cumulative risk to 74: {fmt1(all[4])}%.</span>
              </div>
              <StaticTable rows={siteRows} columns={SITE_COLUMNS} noun="sites" defaultSort={{ key: "cases", dir: -1 }} />
              <p className="mt-3 text-xs text-muted">Source: {GLOBOCAN.citation} <a href={GLOBOCAN.sourceUrl} className="underline" rel="noopener">{GLOBOCAN.sourceUrl}</a>. ASR = age-standardised rate per 100,000 (World standard). These are IARC estimates, not German registry counts, and they differ from the Robert Koch Institute&apos;s figures; the registry card below gives both with their cohorts. Compare countries on the <Link href="/cases/" className="underline">cases by country</Link> page.</p>
            </div>
          )}
        </Section>

        <Section id="registries" title="How Germany counts cancer" aside={<a href="https://www.krebsdaten.de" className="text-sm underline" rel="noopener">Zentrum für Krebsregisterdaten →</a>}>
          <Cards cards={DE_REGISTRIES} />
        </Section>

        <Section id="paying" title="Health system and paying for care">
          <Cards cards={DE_PAYING} />
          <p className="mt-3 text-sm text-muted">Compare the mechanism with other countries on the <Link href="/coverage/" className="underline">coverage</Link> page, and see the appraisal register on <Link href="/hta/" className="underline">funding verdicts by country</Link>.</p>
        </Section>

        <Section id="assessment" title="The benefit assessment" aside={<a href="https://www.g-ba.de/english/benefitassessment/" className="text-sm underline" rel="noopener">G-BA: benefit assessment →</a>}>
          <Cards cards={DE_ASSESSMENT} />
          {gbaRows.length > 0 && (
            <div className="mt-6 card p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h3 className="font-semibold">Early benefit assessments now running for products in this corpus ({gbaRows.length})</h3>
                <span className="text-xs text-muted">Fetched {snap?.fetched} from the G-BA register</span>
              </div>
              <StaticTable rows={gbaRows} columns={GBA_COLUMNS} noun="procedures" defaultSort={{ key: "date", dir: -1 }} />
              <p className="mt-3 text-xs text-muted">The first pages of the G-BA&apos;s <a href="https://www.g-ba.de/bewertungsverfahren/nutzenbewertung/" className="underline" rel="noopener">Nutzenbewertung register</a>, matched to OnCo products by active substance (<code>scripts/fetch-hta.ts</code>). It is a snapshot of procedures in flight, not the full history: the added-benefit verdict is on each linked G-BA page, and the whole register goes back to 2011.</p>
            </div>
          )}
        </Section>

        <Section id="regulator" title="Regulators: EMA, BfArM and the Paul-Ehrlich-Institut">
          <Cards cards={DE_REGULATOR} />
          <p className="mt-3 text-sm text-muted">{euApproved} products in the corpus carry a sourced EU authorisation row; see the <Link href="/regulatory/regions/" className="underline">approvals by region</Link> matrix. A German patient&apos;s access to any of them then depends on the assessment above, not on a second national approval.</p>
          {drugs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Products discovered or developed in Germany</h3>
              <Grid items={drugs} />
            </div>
          )}
        </Section>

        <Section id="certification" title="Certified cancer centres, and whether they change outcomes" aside={<a href="https://www.oncomap.de" className="text-sm underline" rel="noopener">OncoMap: find a certified centre →</a>}>
          <Cards cards={DE_CERTIFICATION} />
        </Section>

        <Section id="precision" title="Molecular tumour boards and the networks behind them">
          <Cards cards={DE_PRECISION} />
        </Section>

        <Section id="institutions" title="Research institutions and cancer centres" aside={<span className="text-sm text-muted">{allInstitutions} German institutions in the corpus · <Link href="/institutions/" className="underline">map and ranking</Link></span>}>
          <Grid items={institutions} />
        </Section>

        <Section id="companies" title="Companies and academic trial groups" aside={<span className="text-sm text-muted">{allCompanies} German companies in the corpus · <Link href="/companies/" className="underline">all companies</Link></span>}>
          <Grid items={companies} />
        </Section>

        <Section id="trials" title="Notable trials and key papers">
          <h3 className="font-semibold mb-2">Trials</h3>
          <Grid items={trials} />
          <h3 className="font-semibold mt-6 mb-2">Key papers</h3>
          <Grid items={papers} />
        </Section>

        <Section id="people" title="People">
          <Grid items={people} />
        </Section>

        <Section id="doing" title="What is being done">
          <Cards cards={DE_DOING} />
        </Section>

        <Section id="gaps" title="What we could not source">
          <Cards cards={DE_GAPS} />
        </Section>

        <section className="mt-10 grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How this page is built</h2>
            <p>The cards are hand-written from the linked sources, most of them German and read in German, and dated {DE_ASOF}. The entity lists are pulled live from the corpus by id, so a new German trial, company or person added anywhere in OnCo appears here once listed in <code>src/data/country-de.ts</code>. The benefit-assessment table is refreshed from the G-BA register by <code>scripts/fetch-hta.ts</code>. Burden figures come from the GLOBOCAN {GLOBOCAN.year} data file used across the site; the Robert Koch Institute counts differently and its figures are quoted with their own source rather than averaged with IARC&apos;s.</p>
          </div>
          <div className="card p-5 space-y-2 border-amber-300/60 dark:border-amber-700/50">
            <h2 className="font-semibold text-base">Verify before relying on it</h2>
            <p>Benefit-assessment verdicts, negotiated prices, certification criteria and screening ages all change. Check the <a href="https://www.g-ba.de/bewertungsverfahren/nutzenbewertung/" className="underline" rel="noopener">G-BA register</a>, <a href="https://www.onkozert.de" className="underline" rel="noopener">OnkoZert</a> and your own insurer before acting on anything here, and ask the treating centre. Corrections are welcome through the <Link href="/suggest/" className="underline">suggest an edit</Link> form.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

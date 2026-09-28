import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, Section } from "@/components/ui";
import { PlanRankings } from "@/components/PlanRankings";
import { coverageUs } from "@/data/coverage-us";
import { US_PLANS, US_METRICS, US_RULES, US_EXTRA_SOURCES, PAYMENT_MECHANICS, UK_PLANS, UK_ABI, INTL_ROWS, type Fact } from "@/data/coverage-rankings";

export const metadata: Metadata = pageMeta({
  title: "Coverage rankings",
  description: "US insurers and plan types ranked by one published metric at a time (prior authorisation denial and overturn rates, Star Ratings, enrolment), nationwide rules with year and source, published cancer drug prices, UK NHS entitlement against private medical insurance cancer cover, and how ten countries pay for cancer drugs.",
  path: "/coverage/rankings/",
});

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function FactList({ facts }: { facts: Fact[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {facts.map((f) => (
        <li key={f.text} className="flex gap-2">
          <span className="chip bg-foreground/5 tabular-nums shrink-0 h-fit">{f.year}</span>
          <span>{f.text} <a className="underline text-muted" href={f.source.url} rel="noopener">{f.source.label}</a></span>
        </li>
      ))}
    </ul>
  );
}

export default function CoverageRankingsPage() {
  const g = graph();
  const priced = Object.values(coverageUs).filter((c) => c.listPriceUsd).map((c) => ({ c, d: g.get(c.drugId) })).filter((x) => x.d).sort((a, b) => b.c.listPriceUsd!.value - a.c.listPriceUsd!.value);
  const withFigure = US_PLANS.filter((p) => Object.keys(p.metrics).length).length;

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="live"><span className="kicker">·</span><Link href="/coverage/us/" className="kicker hover:underline">Paying for care in the US</Link><span className="kicker">·</span><Link href="/costs/" className="kicker hover:underline">Getting the cost down</Link></GroupKicker>}
        title="Coverage rankings"
        lede={`No insurer publishes a cancer-specific scorecard, so this page does the next honest thing: ${US_PLANS.length} US insurers and plan types ranked by one published metric at a time, with the year and the document behind every number and a blank wherever nothing has been published (${withFigure} rows have at least one figure). Then the rules that protect everyone in a category, published prices for cancer drugs, how NHS entitlement compares with private medical insurance in the UK, and how ten countries pay for cancer drugs.`}
      />
      <Container className="pb-16">
        <div className="card p-4 text-sm text-muted max-w-3xl border-amber-300/60 dark:border-amber-700/60">
          <div className="kicker mb-1">Read this first</div>
          <p>Not medical or financial advice. The metrics below are published for whole insurers across every condition, not for cancer care alone; a plan that denies few requests overall may still be strict with a particular drug. No composite score is used anywhere on this page. Check the linked policy page and your own plan documents, and ask the oncology practice&apos;s financial navigator before making a decision.</p>
        </div>

        <Section id="us" title="US insurers and plan types" aside={<span className="text-sm text-muted">{US_METRICS.length} metrics · {US_PLANS.length} rows</span>}>
          <p className="text-sm text-muted mb-4 max-w-3xl">Prior authorisation figures come from CMS data on Medicare Advantage, analysed by KFF; Star Ratings from CMS; enrolment shares from KFF. Traditional Medicare has no prior authorisation for cancer drugs and no plan-level metrics, so its row carries facts rather than figures. Hover a number for its year, note and source; the last column links to each plan&apos;s published oncology or medical policies.</p>
          <PlanRankings rows={US_PLANS} />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {US_PLANS.map((p) => (
              <article key={p.id} id={p.id} className="card p-4">
                <h3 className="font-semibold leading-snug">{p.name}</h3>
                <p className="mt-1 text-sm text-muted">{p.who}</p>
                {p.facts.length > 0 && <div className="mt-3"><FactList facts={p.facts} /></div>}
                <p className="mt-3 text-xs"><a className="underline" href={p.policy.url} rel="noopener">{p.policy.label}</a></p>
              </article>
            ))}
          </div>
        </Section>

        <Section id="rules" title="Category-wide rules">
          <p className="text-sm text-muted mb-3 max-w-3xl">Whatever plan you hold, these limits and rights apply. Each carries the year it refers to; caps change every January.</p>
          <div className="card p-4"><FactList facts={US_RULES} /></div>
          <p className="mt-3 text-xs text-muted">Further reading: {US_EXTRA_SOURCES.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a className="underline" href={s.url} rel="noopener">{s.label}</a></span>)}.</p>
        </Section>

        <Section id="costs" title="Drug prices and Medicare payment" aside={<span className="text-sm text-muted">{priced.length} published list prices</span>}>
          <p className="text-sm text-muted mb-3 max-w-3xl">OnCo records a list price only where a manufacturer, CMS or a federal agency has published one with a year; there are {priced.length} such records, shown here from highest to lowest. Net prices after rebates are usually lower and what you pay depends on the plan. For everything else, the public price files are linked below.</p>
          <div className="card results-table overflow-x-auto">
            <table className="onco">
              <thead><tr><th scope="col">Product</th><th scope="col" className="text-right">List price</th><th scope="col">Per</th><th scope="col" className="hidden md:table-cell">Source</th></tr></thead>
              <tbody>
                {priced.map(({ c, d }) => (
                  <tr key={c.drugId}>
                    <td><Link href={routeFor(d!)} className="font-medium hover:underline">{d!.name}</Link>{d!.kind === "drug" && d!.brand ? <span className="block text-xs text-muted">{d!.brand}</span> : null}</td>
                    <td className="text-right tabular-nums whitespace-nowrap">{usd(c.listPriceUsd!.value)} <span className="text-[11px] text-muted">{c.listPriceUsd!.year}</span></td>
                    <td className="text-sm">{c.listPriceUsd!.per}</td>
                    <td className="hidden md:table-cell text-xs">{c.listPriceUsd!.url ? <a className="underline" href={c.listPriceUsd!.url} rel="noopener">{c.listPriceUsd!.source}</a> : c.listPriceUsd!.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 card p-4"><div className="kicker mb-2">How the price becomes a bill</div><FactList facts={PAYMENT_MECHANICS} /></div>
          <p className="mt-3 text-sm text-muted">Manufacturer and charity programmes for each product are in the <Link className="underline" href="/assistance/">financial help browser</Link>; the per-product coverage record is on <Link className="underline" href="/coverage/us/">Paying for care in the US</Link>.</p>
        </Section>

        <Section id="uk" title="NHS and private insurance in the UK" aside={<span className="text-sm text-muted">{UK_PLANS.length} rows</span>}>
          <p className="text-sm text-muted mb-3 max-w-3xl">In the UK the NHS is the baseline everyone has; private medical insurance buys speed, choice of consultant and hospital, and sometimes drugs NICE has not recommended. Insurers use the phrase &quot;full cancer cover&quot; differently, so each row quotes what the insurer&apos;s own documents say and links to them. The <a className="underline" href={UK_ABI.url} rel="noopener">Association of British Insurers</a> publishes consumer guidance on reading a private medical insurance policy.</p>
          <div className="card results-table overflow-x-auto">
            <table className="onco">
              <thead><tr><th scope="col">Route</th><th scope="col">How cancer treatment is paid for</th><th scope="col" className="hidden md:table-cell">Limits</th><th scope="col" className="hidden lg:table-cell">Options</th><th scope="col">Documents</th></tr></thead>
              <tbody>
                {UK_PLANS.map((r) => (
                  <tr key={r.id}>
                    <td><div className="font-medium">{r.name}</div><div className="text-xs text-muted">{r.kind} · {r.year}</div></td>
                    <td className="text-sm max-w-md">{r.cancerCover}{r.note && <span className="block text-xs text-muted mt-1">{r.note}</span>}</td>
                    <td className="hidden md:table-cell text-sm max-w-sm">{r.limits}</td>
                    <td className="hidden lg:table-cell text-sm max-w-sm">{r.options}</td>
                    <td className="text-xs"><a className="underline" href={r.docs.url} rel="noopener">{r.docs.label}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">The NICE, Cancer Drugs Fund and SMC position on every product is on <Link className="underline" href="/coverage/uk/">NHS coverage</Link>.</p>
        </Section>

        <Section id="international" title="Drug payment in ten countries" aside={<span className="text-sm text-muted">{INTL_ROWS.length} countries</span>}>
          <p className="text-sm text-muted mb-3 max-w-3xl">Funding model, what the patient typically pays as the source states it, and who decides whether a new drug is funded. Appraisal verdicts per product and country are on <Link className="underline" href="/hta/">funding verdicts by country</Link>.</p>
          <div className="card results-table overflow-x-auto">
            <table className="onco">
              <thead><tr><th scope="col">Country</th><th scope="col">Funding model</th><th scope="col">Typical patient share</th><th scope="col" className="hidden lg:table-cell">Who decides</th><th scope="col" className="hidden md:table-cell">Source</th></tr></thead>
              <tbody>
                {INTL_ROWS.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium whitespace-nowrap">{r.country}<span className="block text-xs text-muted font-normal">{r.year}</span></td>
                    <td className="text-sm max-w-md">{r.model}</td>
                    <td className="text-sm max-w-sm">{r.patientShare}</td>
                    <td className="hidden lg:table-cell text-sm">{r.decider}</td>
                    <td className="hidden md:table-cell text-xs"><a className="underline" href={r.source.url} rel="noopener">{r.source.label}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section id="method" title="Method and gaps">
          <div className="card p-4 text-sm space-y-2 max-w-3xl">
            <p>Ranking uses one metric at a time; the reader picks it and the page orders rows by that number alone. Where a plan has no published figure for the chosen metric it appears below the ranked rows, unranked and blank. Nothing is imputed, weighted or averaged.</p>
            <p>Metrics not on this page because no per-insurer figure could be found in a primary source: NCQA ratings (published per regional plan product, not per parent organisation; use the <a className="underline" href="https://reportcards.ncqa.org/health-plans" rel="noopener">NCQA report card</a>), inclusion of NCI-designated centres in each insurer&apos;s networks (not published systematically), cancer-specific prior authorisation denial rates, and patient-reported measures for cancer care. If you know a published source for any of these, <a className="underline" href="https://github.com/judegomila/OnCo/issues/new?template=suggest-edit.yml&title=coverage%3A%20plan%20rankings" rel="noopener">tell us through the issue form</a>.</p>
          </div>
        </Section>
      </Container>
    </>
  );
}

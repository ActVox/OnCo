import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { MarketEstimator } from "@/components/MarketEstimator";
import { marketInputs } from "@/lib/market";
import { settingShares } from "@/data/setting-shares";

export const metadata: Metadata = pageMeta({ title: "Patients per year a treatment could reach", description: "Patients per year for a target in a cancer and region: GLOBOCAN incidence times biomarker prevalence times treatment-setting share, every input linked, with a deliberately wide uncertainty band.", path: "/market/" });

export default function MarketPage() {
  const { cancers, targets, globocan } = marketInputs();
  const pairs = targets.reduce((n, t) => n + t.prevalence.filter((p) => p.range).length, 0);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Patients per year a treatment could reach"
        lede={`Market sizing is three numbers multiplied: how many people get the cancer, what share carry the target, and what share reach the treatment setting. All three already live in this corpus. This page multiplies them for ${pairs} target and cancer pairs across ${cancers.length} cancers, shows every input with its source, and reports a range rather than a point.`} />
      <Container className="pb-16">
        <MarketEstimator cancers={cancers} targets={targets} globocan={globocan} />
        <section className="grid md:grid-cols-2 gap-6 text-sm mt-10">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">Inputs</h2>
            <p><strong>Incidence</strong> is GLOBOCAN {globocan.year} new cases by country, summed for continents, the same data behind <Link href="/cases/" className="underline">cases by country</Link>. Where GLOBOCAN reports an organ site broader than the OnCo cancer (all breast cancer, all lung cancer, all leukaemia), a sourced <strong>subtype share</strong> range is applied.</p>
            <p><strong>Prevalence</strong> is the figure recorded on each <Link href="/targets/" className="underline">target page</Link> for that cancer, parsed into a range (&ldquo;15-20&rdquo;, &ldquo;&gt;95&rdquo;, &ldquo;~25&rdquo;). <strong>Setting share</strong> is an editorial range per cancer in <code className="text-xs">src/data/setting-shares.ts</code>, informed by the SEER stage-at-diagnosis distribution plus relapse after early-stage treatment; {settingShares.length} cancers have one.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">Limits</h2>
            <p>This is the size of the biological population, not the treated or revenue-generating one: it ignores diagnosis and testing rates, line of therapy beyond the setting chosen, access, competing options, treatment duration and price. Prevalence figures are mostly from Western cohorts and some vary by ethnicity (EGFR in lung cancer, for instance). Stage at diagnosis is later outside high-income countries, so the advanced-disease share is understated there.</p>
            <p>Disagree with a factor? Every one is a single line in a data file with a source next to it. The <Link href="/pipeline/" className="underline">crowding index</Link> uses the same arithmetic.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

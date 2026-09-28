import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { allFunnels, crowdingIndex, TRIALS_FETCHED } from "@/lib/pipeline-stats";

export const metadata: Metadata = pageMeta({ title: "Pipeline funnel", description: "How many assets chase each target, modality or cancer by phase, from corpus product statuses and ClinicalTrials.gov, and a crowding index of assets per addressable patient with the formula disclosed.", path: "/pipeline/" });

export default function PipelinePage() {
  const funnels = allFunnels();
  const crowding = crowdingIndex();
  const targets = funnels.filter((f) => f.group === "target").length;
  const top = crowding.filter((r) => r.index !== null).slice(0, 3);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Pipeline funnel"
        lede={`Products by development stage for any of ${targets} targets, every modality class and every cancer, with the phase 2 and 3 studies registered for them. Below, a crowding index: active assets per 100,000 addressable patients a year${top.length ? `, currently led by ${top.map((r) => r.name).join(", ")}` : ""}.`} />
      <Container className="pb-16">
        <PipelineFunnel funnels={funnels} crowding={crowding} fetched={TRIALS_FETCHED} />
        <section className="grid md:grid-cols-2 gap-6 text-sm mt-10">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">The crowding formula</h2>
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">{`crowding = active assets / (addressable patients per year / 100,000)

active assets     = corpus products aimed at the target, excluding
                    negative, withdrawn and historic
addressable/year  = sum over cancers with a prevalence figure of
                    GLOBOCAN incidence (world) x subtype share
                    x prevalence x first setting share, midpoint`}</pre>
            <p>The population term is <Link href="/market/" className="underline">how many people a treatment could reach</Link>, run for the world with the broadest setting. Targets whose cancers have no GLOBOCAN estimate (sarcoma, neuroendocrine tumours) or no parseable prevalence get no index, not a zero.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">What it does and does not say</h2>
            <p>A high index means many programmes per patient: TROP2, HER2 and PD-1 crowding is real and shows up here. It does not measure quality, differentiation or the odds any one asset wins, and it counts only what is in this corpus, so thinly covered targets look less crowded than they are. Registry study counts include combination trials under each product named, so they overstate distinct trials.</p>
            <p>Statuses come from product records (checked on the date each product record was last reviewed); registry counts were fetched {TRIALS_FETCHED}.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

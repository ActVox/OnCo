import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { SURVIVORSHIP } from "@/data/survivorship";
import { SurvivorshipPlan, type PlanEntry, type TreatmentOption } from "@/components/SurvivorshipPlan";

export const metadata: Metadata = pageMeta({
  title: "Survivorship planner",
  description: "Pick the treatments you have had and get a printable list of the late effects to watch for, the screening test, how often, and the guideline that says so.",
  path: "/survivorship/",
});

export default function SurvivorshipPage() {
  const g = graph();
  // Validate every referenced id at build time, like the body map does.
  const entries: PlanEntry[] = SURVIVORSHIP.map((e) => {
    for (const id of [...e.matchDrugIds, ...e.matchTechnologyIds]) g.must(id);
    return { id: e.id, label: e.label, plain: e.plain, manualPick: e.manualPick === true, matchDrugIds: e.matchDrugIds, matchModalityRe: e.matchModalityRe, matchTechnologyIds: e.matchTechnologyIds,
      links: [...e.matchDrugIds, ...e.matchTechnologyIds].slice(0, 6).map((id) => { const x = g.must(id); return { id, name: x.name, route: routeFor(x) }; }),
      lateEffects: e.lateEffects };
  });

  // Treatments the reader can pick: every drug or technology that lands in at least one entry.
  const options: TreatmentOption[] = [];
  for (const d of g.kind("drug")) {
    const hit = SURVIVORSHIP.some((e) => e.matchDrugIds.includes(d.id) || (e.matchModalityRe && new RegExp(e.matchModalityRe, "i").test(d.modality)));
    if (hit) options.push({ id: d.id, name: d.name, kind: "drug", modality: d.modality, route: routeFor(d) });
  }
  for (const t of g.kind("technology")) {
    if (SURVIVORSHIP.some((e) => e.matchTechnologyIds.includes(t.id))) options.push({ id: t.id, name: t.name, kind: "technology", route: routeFor(t) });
  }
  options.sort((a, b) => a.name.localeCompare(b.name));
  const carePlan = g.get("survivorship-care-plan");

  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="Survivorship planner"
        lede="Finishing treatment should come with a plan for the years after it, and often does not: some effects arrive late and are easy to miss once you leave the oncology clinic. Choose the treatments you have had, add the areas that were irradiated, and print one page listing what to watch for, which test finds it, how often, and which guideline says so. Treatments recorded in your browser profile are preselected. This is orientation, not medical advice: take the list to your GP or survivorship clinic." />
      <Container className="pb-16">
        <SurvivorshipPlan entries={entries} options={options} />
        <div className="mt-10 text-sm text-muted max-w-3xl space-y-2">
          <p>Intervals are quoted only where the guideline gives one. &ldquo;Per guideline&rdquo; means the source sets the frequency by dose, age or risk group, so follow the link and ask your team. Most rows come from the Children&apos;s Oncology Group long-term follow-up guidelines, which are the most complete organ-by-organ set and are widely used for adults too; adult-specific sources are cited where they exist.</p>
          {carePlan && <p>A written <Link href={routeFor(carePlan)} className="underline">survivorship care plan</Link> from your treating team should carry the same information, tailored to your doses and dates. If you have one, it wins.</p>}
        </div>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { SideEffectLookup } from "@/components/SideEffectLookup";
import { buildSideEffectIndex } from "@/lib/side-effects";
import { sideEffectGuidance } from "@/data/side-effect-guidance";

export const metadata: Metadata = pageMeta({ title: "Side effects by symptom", description: "Start from the symptom: which cancer treatments cause it, how often, what helps at home, and the threshold at which to call the team or go to hospital, with the sources.", path: "/side-effects/" });

export default function SideEffectsPage() {
  const g = graph();
  const rows = buildSideEffectIndex();
  const drugNames: Record<string, string> = Object.fromEntries(g.kind("drug").map((d) => [d.id, d.name]));
  const products = new Set(rows.map((r) => r.drugId)).size;
  const groups = new Set(rows.map((r) => r.group)).size;
  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="Side effects by symptom"
        lede={`People search by what they feel, not by drug name. Pick a symptom to see which of the ${products} products with structured safety data cause it and how often, then read what helps at home and the threshold at which to call. Thresholds are quoted from NCI CTCAE v5.0, NICE and UKONS triage rules, the ASCO immune-related toxicity guideline and the ASTCT consensus on CRS. ${groups} symptom groups, ${sideEffectGuidance.length} guidance cards. Your team's instructions and 24-hour number always take precedence.`} />
      <Container className="pb-16">
        <SideEffectLookup rows={rows} drugNames={drugNames} />
        <p className="text-xs text-muted mt-8 max-w-3xl">Rates are read from the US prescribing information or the pivotal trial named in the note and are not adjusted for differences between trial populations; compare with care. <Link className="underline" href="/toxicity/">Side effects across a drug class</Link> shows the same data drug first. Nothing you select here leaves your browser. OnCo is orientation, not medical advice.</p>
      </Container>
    </>
  );
}

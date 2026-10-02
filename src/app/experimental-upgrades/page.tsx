import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader } from "@/components/ui";
import { KindGraphExperiment } from "@/components/KindGraph";
import { pageMeta } from "@/lib/seo";

/**
 * Where a piece of interface lives while it is being judged.
 *
 * The owner, 2 October 2026, on the kind graph that used to sit on the home page: "the graph on the homepage is
 * not very truthful are directions can have feedback loops it shows just a single flow. what is a better
 * representation of this? remove it for now and not have the list or graph buttons until we hit a better ui
 * which you can show up on /experimental-upgrades".
 *
 * So this page exists to hold work the site is not ready to stand behind, in the open, with the objection to it
 * written next to it. Nothing here is linked from the navigation and nothing here is a claim.
 */

export const metadata: Metadata = pageMeta({
  title: "Interface experiments, with what is wrong with them",
  description: "Pieces of interface that are built but not trusted enough to put on the site, each shown next to the objection that keeps it here.",
  path: "/experimental-upgrades/",
});

export default function ExperimentalUpgrades() {
  return (
    <>
      <PageHeader
        title="Interface experiments"
        lede="Things that are built and not yet trusted. Each one is here with the objection that keeps it here, so the problem is as visible as the drawing."
      />
      <Container className="pb-16">
        <section className="card p-5">
          <h2 className="text-lg font-semibold tracking-tight">The kind graph</h2>
          <p className="mt-2 text-[15px] leading-relaxed max-w-3xl">
            This drew the twenty kinds of record as nodes and the links between them as edges, and it sat on the
            home page until 2 October 2026. It came off because it is not truthful about its subject: it lays the
            kinds out as a single flow in one direction, and the corpus is not a flow. A target points at a drug
            and the drug points back at the target. A trial reads a biomarker, and the biomarker is defined by
            trials. A picture that cannot draw a cycle is making a claim about the field that is false.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed max-w-3xl">
            What would be better is an open question. A drawing that can carry a loop is the requirement: a
            circular or force-directed layout where no direction is privileged, edges that show which way each
            relationship runs and admit when it runs both ways, or a matrix, which handles cycles without
            pretending to be a map. Until one of those is built and read on a phone, the home page counts the
            kinds and claims nothing more.
          </p>
          <p className="mt-3 text-sm text-muted">
            The counts and the links are still published as data at{" "}
            <Link className="underline" href="/api/v1/">the API</Link>, whatever the site draws.
          </p>
          <div className="mt-5">
            <KindGraphExperiment />
          </div>
        </section>
      </Container>
    </>
  );
}

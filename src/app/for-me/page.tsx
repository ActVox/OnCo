import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CancerPicker, type PickerCancer } from "@/components/CancerPicker";

export const metadata: Metadata = pageMeta({ title: "For me", description: "Select one or more cancer types and see the technologies, products, trials, pairings, and ideas relevant to you. Add your setting, biomarkers, treatments so far and country to see what the records say for your situation.", path: "/for-me/" });

export default function ForMe() {
  const g = graph();
  // The page carries the chooser list alone. What touches each cancer (state of the art, red cards, pipeline, records by
  // kind) is one file per cancer, /api/v1/for-me/<id>.related.json (src/lib/for-me-related.ts), fetched when it is chosen;
  // the situation view (item 101) fetches /api/v1/for-me/<id>.json the same way.
  const data: PickerCancer[] = g.kind("cancer").map((c) => ({ id: c.id, name: c.name, group: c.group, tldr: c.tldr, route: routeFor(c) }));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="For me"
        lede="Choose one or more. You will see the state of the art, what is in the pipeline, and every technology, product, target, trial, pairing, and idea in OnCo that touches those cancers. Failed, withdrawn and historic items are left out here: this view is about what works and what could work. Tell OnCo your setting, biomarkers, treatments so far and country, and it reads the matching standard of care, approvals, trials, warnings and questions from the records. Your choice is remembered in this browser (and only there) so the header, the home page, the trials list and search can follow it. This is orientation, not medical advice." />
      <Container><p className="mt-3 max-w-3xl rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted" role="note">
        <strong className="text-foreground">Browser-only mode.</strong> You are not signed in. Everything you choose here stays in this browser&apos;s storage, is never sent to a server, and is lost if you clear the browser or switch devices. A signed-in version that keeps your choices across devices is coming at <a className="underline" href="https://me.onco.cc/">me.onco.cc</a>.
      </p></Container>
      <Container className="pb-16">
        <CancerPicker cancers={data} />
      </Container>
    </>
  );
}

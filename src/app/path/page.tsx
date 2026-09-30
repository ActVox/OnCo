import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { pathData } from "@/lib/paths-data";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PathFinder, type PathExample } from "@/components/PathFinder";

export const metadata: Metadata = pageMeta({ title: "Connections: how any two records are linked", description: "How is one object in oncology related to another? Shortest routes through the OnCo knowledge graph with every relationship named.", path: "/path/" });

const CANDIDATES: PathExample[] = [
  { from: "hippo-yap-taz", to: "sacituzumab-govitecan", label: "Hippo pathway to sacituzumab govitecan" },
  { from: "hippo", to: "sacituzumab-govitecan", label: "Hippo pathway to sacituzumab govitecan" },
  { from: "psma", to: "tnbc", label: "PSMA to triple-negative breast cancer" },
  { from: "mskcc", to: "trastuzumab-deruxtecan", label: "Memorial Sloan Kettering to trastuzumab deruxtecan" },
  { from: "kras", to: "pancreatic", label: "KRAS to pancreatic cancer" },
  { from: "car-t", to: "glioblastoma", label: "CAR-T to glioblastoma" },
  { from: "grail", to: "nhs-galleri", label: "GRAIL to the NHS-Galleri trial" },
];

export default function PathPage() {
  const data = pathData();
  const ids = new Set(data.nodes.map((n) => n.id));
  const seen = new Set<string>();
  const examples = CANDIDATES.filter((e) => ids.has(e.from) && ids.has(e.to) && !seen.has(e.label) && seen.add(e.label));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Connections: how any two records are linked" lede="How is Hippo related to sacituzumab govitecan? Pick any two objects and see the shortest routes between them through the knowledge graph, with each relationship named." />
      <Container className="pb-16">
        <Suspense><PathFinder data={data} examples={examples} /></Suspense>
      </Container>
    </>
  );
}

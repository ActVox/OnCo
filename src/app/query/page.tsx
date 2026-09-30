import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { graphData } from "@/lib/graph-export";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { QueryBuilder, type QueryData } from "@/components/QueryBuilder";

export const metadata: Metadata = pageMeta({ title: "Query builder: structured questions over the corpus", description: "Build structured queries over the knowledge graph: kind, links, status, tags, text, with NOT clauses.", path: "/query/" });

export default function QueryPage() {
  const g = graph();
  const gd = graphData();
  const data: QueryData = {
    nodes: gd.nodes.map((n) => { const e = g.must(n.id); return { id: n.id, kind: n.kind, name: n.name, route: n.route, status: e.status, tags: e.tags, tldr: e.tldr, degree: n.degree }; }),
    edges: gd.edges,
  };
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Query builder: structured questions over the corpus" lede="Ask structured questions of the corpus: which targets have an approved ADC but no PET tracer, which cancers have no phase-3 product, which companies have products but no institutional link. Combine clauses, negate any of them, and get a linked table." />
      <Container className="pb-16">
        <QueryBuilder data={data} />
      </Container>
    </>
  );
}

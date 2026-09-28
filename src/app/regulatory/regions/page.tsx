import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { RegionMatrix, type MatrixRow } from "@/components/RegionMatrix";
import { REGIONS, REGION_META, regionalApprovals, approvedRegions } from "@/data/regional-approvals";

export const metadata: Metadata = pageMeta({ title: "Approval differences by country", description: "Which cancer drugs are approved in the US, EU, UK, Japan, China, Australia and India, where the gaps are, who approves first, and how long the rest of the world waits.", path: "/regulatory/regions/" });

export default function RegionsPage() {
  const g = graph();
  const rows: MatrixRow[] = g.kind("drug")
    .filter((d) => regionalApprovals[d.id])
    .map((d) => ({ id: d.id, name: d.name, brand: d.brand, modality: d.modality, status: d.status ?? "", route: routeFor(d), regions: regionalApprovals[d.id] }));
  const everywhere = rows.filter((r) => approvedRegions(r.regions).length === REGIONS.length).length;
  const cnOnly = rows.filter((r) => { const a = approvedRegions(r.regions); return a.length === 1 && a[0] === "CN"; }).length;
  const usNotEu = rows.filter((r) => { const us = r.regions.US?.status, eu = r.regions.EU?.status; return (us === "approved" || us === "conditional") && eu !== "approved" && eu !== "conditional"; }).length;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel"><span className="kicker">·</span><Link href="/regulatory/" className="kicker hover:underline">Regulatory timeline</Link></GroupKicker>} title="Approval differences by country"
        lede={`${rows.length} approved and phase-3 products compared across ${REGIONS.length} regulators. ${everywhere} are approved in all ${REGIONS.length} regions, ${usNotEu} are approved in the US but not the EU, and ${cnOnly} are approved only in China. Filter by gap type to see where a pipeline exists in one region and is missing in another.`} />
      <Container className="pb-16 space-y-10">
        <RegionMatrix rows={rows} />

        <section className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How to read this</h2>
            <p>Each cell is the regulator&rsquo;s decision for the product in that region: the year of first oncology approval, a tick for full approval, <em>✓c</em> for conditional or accelerated approval, <em>…</em> for a filing under review, a dash where the sponsor has said it will not file, and <em>✕</em> for a withdrawn or rejected application. A dot means we have no sourced record, which is not the same as &ldquo;not approved&rdquo;.</p>
            <p>&ldquo;First&rdquo; is the earliest year of approval in any of the regions and the region(s) that granted it. Lag is measured in whole years against that first approval. &ldquo;Missing&rdquo; counts products approved somewhere but not in the region.</p>
            <p>Regions: {REGIONS.map((r, i) => <span key={r}>{i > 0 && ", "}<a href={REGION_META[r].url} target="_blank" rel="noopener noreferrer" className="hover:underline">{r} = {REGION_META[r].regulator}</a></span>)}. UK entries reflect MHRA marketing authorisation, not NICE reimbursement; Australian entries reflect TGA registration, not PBS listing; Indian entries reflect CDSCO approval or documented generic and biosimilar entry, and are recorded only where sourced.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">Sourcing caveat</h2>
            <p>US entries are seeded from the product corpus, which cites FDA approval notices. EU entries link to the EMA public assessment report; a small filled dot on a cell marks rows checked directly against the EPAR page. UK, Japan, China, Australia and India entries link to regulator search pages or company releases and are stated at year resolution only. Years for legacy chemotherapies predate online registers and are approximate.</p>
            <p>This matrix is a work in progress. Approvals happen weekly, indications differ between regions even when a product is approved in both, and a missing cell most often means we have not yet sourced it. Verify at the regulator before relying on any cell. Corrections are welcome via the repo.</p>
            <p><Link href="/regulatory/" className="hover:underline">Dated regulatory timeline →</Link></p>
          </div>
        </section>
      </Container>
    </>
  );
}

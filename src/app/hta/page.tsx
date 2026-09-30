import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { readPublicJson } from "@/lib/feed-meta";
import { coverageUk, NICE_STATUS_LABEL, SMC_SEARCH, type NiceStatus } from "@/data/coverage-uk";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { HtaTable, type HtaRow } from "@/components/HtaTable";

export const metadata: Metadata = pageMeta({ title: "Funding verdicts by country", description: "Health technology assessment verdicts for cancer products by country: NICE and the Cancer Drugs Fund, SMC, Germany's G-BA benefit assessments and Australia's PBAC outcomes, with dates and links to the appraisal.", path: "/hta/" });

/** Shape written by scripts/fetch-hta.ts (public/hta/index.json). */
type HtaSnapshot = {
  fetched: string;
  bodies: Record<string, { name: string; country: string; url: string; method: string; checked: number; ok: number; failed: number; note?: string }>;
  decisions: Array<{ body: string; country: string; drugId?: string; product: string; brand?: string; title: string; verdict: string; verdictLabel: string; date?: string; updated?: string; url: string; documentUrl?: string; note?: string }>;
  errors: string[];
};

const NICE_TONE: Record<NiceStatus | "withdrawn" | "mismatch", string> = { recommended: "positive", optimised: "positive", cdf: "managed", "in development": "pending", "not recommended": "negative", terminated: "negative", "not appraised": "neutral", unknown: "neutral", withdrawn: "negative", mismatch: "pending" };
const GBA_TONE = (v: string) => (/Beschluss/.test(v) ? "positive" : /eingestellt|ausgesetzt/.test(v) ? "negative" : "pending");

export default function HtaPage() {
  const g = graph();
  const snap = readPublicJson<HtaSnapshot>("hta/index.json");
  const rows: HtaRow[] = [];
  const drug = (id?: string) => (id ? g.get(id) : undefined);
  const seenNice = new Set<string>();

  for (const d of snap?.decisions ?? []) {
    const e = drug(d.drugId);
    if (d.body === "NICE" && d.drugId) seenNice.add(d.drugId);
    rows.push({ id: `${d.body}-${d.url}-${d.drugId ?? d.product}`, body: d.body, country: d.country, drugId: d.drugId, product: e?.name ?? d.product, route: e ? routeFor(e) : undefined, brand: d.brand, modality: e?.kind === "drug" ? e.modality : undefined, title: d.title, verdict: d.verdict, verdictLabel: d.verdictLabel, tone: d.body === "NICE" ? NICE_TONE[d.verdict as NiceStatus] ?? "neutral" : d.body === "G-BA" ? GBA_TONE(d.verdict) : "neutral", date: d.date, updated: d.updated, url: d.url, documentUrl: d.documentUrl, note: d.note, origin: "fetched" });
  }
  // Curated NICE rows without a TA page to verify (search links), and SMC positions, so every UK product appears.
  for (const c of Object.values(coverageUk)) {
    const e = drug(c.drugId);
    if (!e) continue;
    if (!seenNice.has(c.drugId) && c.nice.status !== "unknown") rows.push({ id: `NICE-curated-${c.drugId}`, body: "NICE", country: "UK", drugId: c.drugId, product: e.name, route: routeFor(e), brand: e.kind === "drug" ? e.brand : undefined, modality: e.kind === "drug" ? e.modality : undefined, title: c.nice.ta ?? "NICE search", verdict: c.nice.status, verdictLabel: NICE_STATUS_LABEL[c.nice.status], tone: NICE_TONE[c.nice.status], date: c.nice.year ? String(c.nice.year) : undefined, url: c.nice.url ?? "https://www.nice.org.uk/", note: c.nice.indication ?? c.nice.note, origin: "curated" });
    if (c.smc) rows.push({ id: `SMC-${c.drugId}`, body: "SMC", country: "Scotland", drugId: c.drugId, product: e.name, route: routeFor(e), brand: e.kind === "drug" ? e.brand : undefined, modality: e.kind === "drug" ? e.modality : undefined, title: c.smc.id ?? "SMC advice", verdict: c.smc.status, verdictLabel: `SMC ${c.smc.status}`, tone: /accepted/i.test(c.smc.status) ? "positive" : /not/i.test(c.smc.status) ? "negative" : "neutral", url: c.smc.url ?? SMC_SEARCH(e.name), origin: "curated" });
  }

  const products = new Set(rows.map((r) => r.drugId).filter(Boolean));
  const byBody = rows.reduce<Record<string, number>>((a, r) => { a[r.body] = (a[r.body] ?? 0) + 1; return a; }, {});
  const mismatches = rows.filter((r) => r.verdict === "mismatch" || r.verdict === "withdrawn");

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Funding verdicts by country"
        lede={`${rows.length} appraisal verdicts for ${products.size} products across ${Object.keys(byBody).length} bodies: ${Object.entries(byBody).map(([b, n]) => `${b} ${n}`).join(", ")}. Regulatory approval says a medicine may be sold; a health technology assessment says whether a health system will pay for it, for whom, and at what price. Dates and links go to the appraisal itself.`}
        right={<div className="flex flex-wrap gap-2"><Link href="/coverage/uk/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">NHS coverage →</Link><Link href="/coverage/us/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">US coverage and assistance →</Link></div>} />
      <Container className="pb-16 space-y-10">
        {!snap && <p className="card p-4 text-sm text-muted">This build carries the curated NICE and SMC rows only; the fetched G-BA and PBAC rows arrive with the next monthly refresh.</p>}
        {mismatches.length > 0 && (
          <div className="card p-4 border-amber-200 dark:border-amber-900">
            <div className="kicker mb-1">Being re-checked</div>
            <p className="text-sm text-muted">{mismatches.length} NICE {mismatches.length === 1 ? "page does" : "pages do"} not name the product they are cited for, or say the guidance was withdrawn or replaced: {mismatches.map((m, i) => <span key={m.id}>{i > 0 && ", "}{m.route ? <Link className="underline" href={m.route}>{m.product}</Link> : m.product}</span>)}. Treat these rows as provisional until the appraisal reference is confirmed; if you know the correct appraisal, <a className="underline" href="https://github.com/judegomila/OnCo/issues/new?template=regional-approval.yml&title=hta%3A%20NICE%20appraisal%20reference" rel="noopener">tell us through the issue form</a>.</p>
          </div>
        )}
        <HtaTable rows={rows} />

        <section className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">What each body decides</h2>
            <p><b>NICE</b> (England and Wales) publishes technology appraisals: recommended, recommended with restrictions (optimised), managed access through the Cancer Drugs Fund, or not recommended. A positive appraisal obliges the NHS to fund the medicine within 90 days. <b>SMC</b> does the same for Scotland.</p>
            <p><b>G-BA</b> (Germany) runs the early benefit assessment after launch: the medicine is reimbursed from day one and the verdict (added benefit: major, considerable, minor, non-quantifiable, none) sets the price negotiation. The register here shows procedures and their status; the benefit category is on the linked page.</p>
            <p><b>PBAC</b> (Australia) recommends whether a medicine is listed on the Pharmaceutical Benefits Scheme. Outcomes are published per meeting as a document; open it for the product-level recommendation.</p>
            <p>France (HAS) and Canada (CDA-AMC) are not fetched: neither publishes a list a script can read without a key or a browser. Their verdicts belong in the product record when sourced by hand.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How this table is built</h2>
            {snap ? (
              <ul className="list-disc pl-5 space-y-1">
                {Object.entries(snap.bodies).map(([k, b]) => <li key={k}><a className="underline" href={b.url} rel="noopener">{b.name}</a> ({b.country}): {b.method}. {b.ok}/{b.checked} requests succeeded{b.note ? `; ${b.note}` : ""}.</li>)}
                <li>Curated NICE outcomes and SMC positions come from the hand-researched <Link className="underline" href="/coverage/uk/">UK coverage table</Link> and appear when there is no TA page to verify.</li>
                <li>Fetched {snap.fetched}; refreshed monthly by GitHub Actions. Status on <Link className="underline" href="/status/">when each feed last ran</Link>.</li>
              </ul>
            ) : <p className="text-muted">Only curated rows are available until the feed runs.</p>}
            <p>For what the verdict means to a patient&rsquo;s bill, see <Link className="underline" href="/coverage/us/">paying for care in the US</Link> (Medicare part, prior authorisation and manufacturer assistance programmes) and <Link className="underline" href="/coverage/uk/">what the NHS offers</Link>.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

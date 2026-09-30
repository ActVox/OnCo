import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { EntityBrowser } from "@/components/EntityBrowser";
import { pageRows } from "@/lib/static-tables";
import { facetCounts } from "@/lib/tables/kinds";
import { SOFTWARE_SORT, SOFTWARE_TABLE, softwareBrowser } from "@/lib/tables/software";
import { SOFTWARE_GENERATED, SOFTWARE_SKIPPED, SOFTWARE_UNVERIFIED, softwareProducts } from "@/data/software";
import { openSourceProjects } from "@/data/open-source";
import { EVIDENCE_ORDER, EVIDENCE_TIP, evidenceKinds, SOFTWARE_CATEGORY_META, SOFTWARE_CATEGORY_ORDER, SOFTWARE_SEGMENT_ORDER, SOFTWARE_SOURCING_META, SOFTWARE_SOURCING_ORDER, softwareLink } from "@/lib/software";

export const metadata: Metadata = pageMeta({
  title: "The software of oncology",
  description: "A map of the software cancer care actually runs on: the oncology record and chemotherapy prescribing, radiotherapy planning, the pathology and radiology reading platforms, cleared algorithms that read a scan or a slide, genomics and interpretation, trial matching and registries, and case review. Every row says what is behind it: a regulator's database, the literature, or only the company's own words.",
  path: "/software/",
});

function Glyph({ d, className = "h-3.5 w-3.5" }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

export default function SoftwarePage() {
  const built = softwareBrowser();
  const browser = pageRows(SOFTWARE_TABLE, built.rows);
  const counts = facetCounts(built.rows, built.facets, true);
  const all = softwareProducts;

  const byCategory = SOFTWARE_CATEGORY_ORDER.map((c) => ({ c, n: all.filter((p) => p.category === c).length })).filter((x) => x.n > 0);
  const bySourcing = SOFTWARE_SOURCING_ORDER.map((s) => ({ s, n: all.filter((p) => p.sourcing === s).length })).filter((x) => x.n > 0);
  const byEvidence = EVIDENCE_ORDER.map((k) => ({ k, n: all.filter((p) => evidenceKinds(p).includes(k)).length })).filter((x) => x.n > 0);
  const bySegment = SOFTWARE_SEGMENT_ORDER.map((s) => ({ s, n: all.filter((p) => p.segment === s).length })).filter((x) => x.n > 0);

  const independent = all.filter((p) => p.sourcing === "independent").length;
  const selfDescribed = all.length - independent;
  const withClearance = all.filter((p) => p.clearances.length).length;
  const clearances = all.reduce((n, p) => n + p.clearances.length, 0);
  const withPapers = all.filter((p) => p.papers.length).length;
  const withClaim = all.filter((p) => p.claim).length;
  const namesProduct = all.filter((p) => p.claim?.namesProduct).length;
  const linkedVendor = all.filter((p) => p.vendorId).length;
  const vendors = new Set(all.map((p) => p.vendor)).size;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="The software of oncology"
        lede={`${all.length} products from ${vendors} vendors, in six categories: the oncology record and the chemotherapy prescribing layer, radiotherapy planning and quality assurance, the pathology and radiology platforms, algorithms cleared to read a scan or a slide, genomics and interpretation, trial matching and registries, and case review. ${independent} rows are backed by something outside the company that sells them; ${selfDescribed} are the company describing itself, and are marked as such in every view. The open-source projects the field runs on are mapped separately, in full, on /open-source/.`}
        right={<div className="flex gap-2"><Link href="/open-source/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Open source</Link><Link href="/data-sources/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Open data</Link></div>}
      />
      <Container className="pb-16">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted mb-6">
          <span>{all.length} products</span><span aria-hidden>·</span>
          <span>{independent} independently sourced, {selfDescribed} on the company&apos;s own account</span><span aria-hidden>·</span>
          <span title="Clearances, De Novo grants, approvals and supplements recorded from the FDA device databases">{clearances} FDA records across {withClearance} products</span><span aria-hidden>·</span>
          <span>{withPapers} named in the literature</span><span aria-hidden>·</span>
          <span>{linkedVendor} sold by a company or institution in OnCo</span><span aria-hidden>·</span>
          <span>{SOFTWARE_SKIPPED.length} looked for and not recorded</span>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr] mb-10 max-w-6xl">
          <div className="card p-5 text-sm space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">What this page covers, and what it will not do</h2>
            <p className="text-muted">Between a symptom and a treatment there is a chain of software, and almost none of it is open. A referral lands in an <Link className="underline" href={softwareLink("segment", "Oncology electronic record")}>oncology record</Link>; a regimen is ordered through a <Link className="underline" href={softwareLink("segment", "Chemotherapy prescribing")}>prescribing layer</Link> that will refuse a dose it does not like; a scan is read on a <Link className="underline" href={softwareLink("segment", "Radiology platform")}>reading platform</Link>, sometimes with a <Link className="underline" href={softwareLink("category", SOFTWARE_CATEGORY_META["regulated-device"].label)}>cleared algorithm</Link> marking it first; a slide is scanned and read on a <Link className="underline" href={softwareLink("segment", "Pathology platform")}>pathology platform</Link>; a radiotherapy plan is optimised in a <Link className="underline" href={softwareLink("segment", "Radiotherapy planning")}>planning system</Link> and checked by <Link className="underline" href={softwareLink("segment", "Radiotherapy QA and dosimetry")}>quality assurance software</Link>; a tumour is sequenced and the result is turned into options by an <Link className="underline" href={softwareLink("category", SOFTWARE_CATEGORY_META["genomics-interpretation"].label)}>interpretation platform</Link>; a trial is found through <Link className="underline" href={softwareLink("category", SOFTWARE_CATEGORY_META["trials-registries"].label)}>something running against the public registry</Link>. Each of those changes what a patient gets, and each is on this page.</p>
            <p className="text-muted"><strong className="text-foreground">Open source stays where it is.</strong> The {openSourceProjects.length} open-source projects in oncology have their own map, with licence, openness and last commit read from each repository: <Link className="underline" href="/open-source/">/open-source/</Link>. This page is the rest of the field. The one thing it takes back from that map is the set of research tools excluded there by design for being commercial, licensed or free but closed, from Sentieon to CIBERSORTx to CanRisk: <Link className="underline" href={softwareLink("category", SOFTWARE_CATEGORY_META["research-analysis"].label)}>they are here instead</Link>, with their evidence attached rather than only a line in a skip list.</p>
            <p className="text-muted"><strong className="text-foreground">What this page will not do</strong> is repeat a company&apos;s performance claim as though it were a finding. A vendor&apos;s own site is enough to establish that a product exists, what it says it does and where it lives. It is not enough for anything about accuracy, adoption, outcomes or regulatory status. Read the next card before reading the table.</p>
          </div>
          <div className="card p-5 text-sm space-y-3">
            <h2 className="text-lg font-semibold tracking-tight">How a row is sourced</h2>
            <p className="text-muted">Every row is built the same way. The company&apos;s own page is fetched, and its own description of the product is copied into the row verbatim, in the column marked <em>the company&apos;s words</em>. Then three checks run for a source outside the company, and each one has to name the product before it counts:</p>
            <ul className="space-y-2">
              <li><strong className="text-foreground">A regulator.</strong> The FDA device databases, read through openFDA: every clearance, De Novo grant, approval and supplement returned by the query, with its number, the device name, the applicant and the decision date as the database words them. {withClearance} products carry at least one, {clearances} records in all.</li>
              <li><strong className="text-foreground">The literature.</strong> Europe PMC, with every hit checked to name the product in its title or abstract. Preprints are recorded as preprints and are not called peer reviewed. {withPapers} products carry at least one paper.</li>
              <li><strong className="text-foreground">A public body&apos;s own list.</strong> A framework, a procurement listing, a guideline or a registry page, fetched and checked for the product&apos;s name.</li>
            </ul>
            <p className="text-muted">A row with at least one of those is <strong className="text-foreground">independently sourced</strong>. A row with none of them is <strong className="text-foreground">the company&apos;s own account</strong>, and the page says so in the row, in the filter and in the count at the top. That is not a lesser kind of record: it is an honest one. {selfDescribed} of {all.length} rows are in that state today, and naming them is the point.</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr] mb-10 max-w-6xl">
          <div className="card p-4 text-sm">
            <div className="kicker mb-2">By category</div>
            <ul className="flex flex-wrap gap-1.5">
              {byCategory.map(({ c, n }) => <li key={c}><Link href={softwareLink("category", SOFTWARE_CATEGORY_META[c].label)} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5" title={SOFTWARE_CATEGORY_META[c].blurb}><Glyph d={SOFTWARE_CATEGORY_META[c].glyph} />{SOFTWARE_CATEGORY_META[c].label} <span className="text-muted tabular-nums">{n}</span></Link></li>)}
            </ul>
          </div>
          <div className="card p-4 text-sm">
            <div className="kicker mb-2">By what is behind the row</div>
            <ul className="flex flex-wrap gap-1.5">
              {bySourcing.map(({ s, n }) => <li key={s}><Link href={softwareLink("sourcing", SOFTWARE_SOURCING_META[s].label)} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5" title={SOFTWARE_SOURCING_META[s].tip}>{SOFTWARE_SOURCING_META[s].label} <span className="text-muted tabular-nums">{n}</span></Link></li>)}
            </ul>
            <div className="kicker mt-4 mb-2">By kind of source</div>
            <ul className="flex flex-wrap gap-1.5">
              {byEvidence.map(({ k, n }) => <li key={k}><Link href={softwareLink("evidence", k)} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5" title={EVIDENCE_TIP[k]}>{k} <span className="text-muted tabular-nums">{n}</span></Link></li>)}
            </ul>
          </div>
          <div className="card p-4 text-sm">
            <div className="kicker mb-2">By what it does</div>
            <ul className="flex flex-wrap gap-1.5">
              {bySegment.map(({ s, n }) => <li key={s}><Link href={softwareLink("segment", s)} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5">{s} <span className="text-muted tabular-nums">{n}</span></Link></li>)}
            </ul>
          </div>
        </section>

        <EntityBrowser rows={browser.rows} more={browser.more} counts={counts} facets={built.facets} columns={built.columns} noun="products" hideStatus defaultSort={SOFTWARE_SORT} />

        <section className="mt-12 max-w-4xl" aria-labelledby="skipped">
          <h2 id="skipped" className="text-lg font-semibold tracking-tight mb-1">Looked for and not recorded</h2>
          <p className="text-sm text-muted mb-3">A product whose own site blocks automated readers, a company that has wound down, a laboratory test whose classifier is not software anyone can obtain, or something that belongs on another page. Each is on record so the gap is a decision, not an oversight.</p>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            {SOFTWARE_SKIPPED.map((s) => <li key={s.name} className="card p-3"><span className="font-medium">{s.name}</span> <span className="text-muted">{s.reason}</span></li>)}
          </ul>
        </section>

        {SOFTWARE_UNVERIFIED.length > 0 && (
          <section className="mt-10 max-w-4xl" aria-labelledby="unverified">
            <h2 id="unverified" className="text-lg font-semibold tracking-tight mb-1">Sources that did not check out</h2>
            <p className="text-sm text-muted mb-3">Pages named in the curated list that were fetched and either did not answer or did not name the product. They are listed rather than dropped, because a source that failed a check is itself worth knowing about.</p>
            <ul className="grid gap-2 text-sm">
              {SOFTWARE_UNVERIFIED.map((u) => <li key={u} className="card p-3 text-muted">{u}</li>)}
            </ul>
          </section>
        )}

        <div className="mt-10 max-w-3xl text-xs text-muted space-y-2">
          <p><strong className="text-foreground">Method.</strong> The list of products is hand-curated in <code>scripts/software-curated.ts</code> (one record per product, with its category, its vendor, the page to fetch and the queries to run). <code>scripts/fetch-software.ts</code> then fetches three services and writes <code>src/data/software.ts</code>, which is never edited by hand: the vendor&apos;s page for the claim in its own words, <a className="underline" href="https://open.fda.gov/apis/device/" rel="noopener">openFDA</a> for the device databases, and <a className="underline" href="https://europepmc.org/" rel="noopener">Europe PMC</a> for the literature. Of {all.length} records, {withClaim} carry a claim read from the company&apos;s own page and {namesProduct} of those pages named the product in their text; where a page named only the company, the row says so on the claim. <code>sourcing</code> is computed from what came back, so no curator can promote a row by asserting it. Generated {SOFTWARE_GENERATED}; the same records are in the <Link className="underline" href="/api/">API</Link> as <code>/api/v1/software.json</code>.</p>
          <p>Two honest limits. First, a clearance is a regulatory fact and not a clinical one: the FDA database says a device was cleared, never that it works well, and a 510(k) in particular says only that it resembles something already on the market. Second, a paper that names a product is evidence that the product reached the published record and that someone used or examined it. It is not evidence that the result was good, and some of these papers use the product rather than test it; read the paper. Where the literature check found nothing, that may mean the product has not been studied, or only that its name is too common to search for safely.</p>
          <p>Missing a product, or a source we should have found? <Link className="underline" href="/suggest/">Suggest an edit</Link>. A company may send a link to a regulator&apos;s record, a published evaluation or a public framework listing, and the row will move from its own account to independently sourced on the next run. A link to its own website will not move it, which is the whole design.</p>
        </div>
      </Container>
    </>
  );
}

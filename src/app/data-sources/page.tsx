import type { Metadata } from "next";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef, type FacetLink, type LinkItem } from "@/components/EntityBrowser";
import { DATA_SOURCES, EFFORT_LABEL, type DataSource } from "@/data/data-sources";
import { openSourceForDataSource, openSourceLink } from "@/lib/open-source";

export const metadata: Metadata = {
  title: "Open data",
  description: "Every open database OnCo pulls from, with what we take, how often, and under which licence; and the databases we could extend to, grouped by what they would fuel.",
};

const fl = (facet: string, value: string | undefined, tip?: string): FacetLink | undefined => (value ? { facet, value, tip } : undefined);
const domain = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

/** The open-source projects that read, serve or are the code behind this source (src/data/open-source.ts): up to four named, then a count linking to the filtered browser. */
function openProjects(s: DataSource): LinkItem[] | undefined {
  const list = openSourceForDataSource(s.id);
  if (!list.length) return undefined;
  const shown = list.slice(0, 4).map((p) => ({ label: p.name.replace(/ \(.*\)$/, ""), href: p.repo ?? p.homepage ?? p.source.url, tip: `${p.summary} Licence: ${p.licence}.` }));
  return list.length > 4 ? [...shown, { label: `+${list.length - 4} more`, href: openSourceLink("source", s.name), tip: "Every open-source project on record for this source, in the open-source browser." }] : shown;
}

/** One row per source. The name links to the OnCo collection page when the source is also a collection object, otherwise to the source itself. */
function rowFor(s: DataSource, prefix: string): BrowserRow {
  const g = graph();
  const coll = s.collection ? g.get(s.collection) : undefined;
  const site: LinkItem[] = [{ label: domain(s.url), href: s.url }];
  return {
    id: s.id,
    name: s.name,
    tldr: s.notes,
    route: coll ? routeFor(coll) : s.url,
    sub: s.group,
    facets: {
      [`${prefix}group`]: [s.group],
      [`${prefix}fuels`]: s.fuels,
      [`${prefix}licence`]: [s.licence.split(/[;(]/)[0].trim()],
      [`${prefix}access`]: [s.access],
      [`${prefix}effort`]: [EFFORT_LABEL[s.effort]],
    },
    cols: {
      group: fl(`${prefix}group`, s.group),
      fuels: s.fuels.map((f) => ({ facet: `${prefix}fuels`, value: f })),
      licence: fl(`${prefix}licence`, s.licence.split(/[;(]/)[0].trim(), s.licence),
      access: fl(`${prefix}access`, s.access, s.api ? "Programmatic access exists: the fetch can be scripted and scheduled." : "No API: bulk files or pages that would need parsing by hand."),
      pipeline: s.pipeline,
      cadence: s.cadence,
      effort: fl(`${prefix}effort`, EFFORT_LABEL[s.effort]),
      risks: s.risks,
      site,
      open: openProjects(s),
    },
    sortKeys: { effort: s.effort === "S" ? 0 : s.effort === "M" ? 1 : 2 },
  };
}

const facetsFor = (prefix: string, withEffort: boolean): FacetDef[] => [
  { key: `${prefix}group`, label: "Theme", searchable: false, width: "w-56" },
  { key: `${prefix}fuels`, label: "Fuels", width: "w-52" },
  { key: `${prefix}licence`, label: "Licence", searchable: false, width: "w-56" },
  { key: `${prefix}access`, label: "Access", searchable: false, width: "w-44" },
  ...(withEffort ? [{ key: `${prefix}effort`, label: "Effort", searchable: false, width: "w-40", order: ["Small", "Medium", "Large"] }] : []),
];

const IN_USE_COLS: ColDef[] = [
  { key: "fuels", label: "Fuels", tip: "The OnCo kinds, pages or checks this source feeds." },
  { key: "pipeline", label: "How it gets in", hide: "hidden md:table-cell", tip: "The script or component that reads it, and the workflow that runs it." },
  { key: "cadence", label: "Cadence", sortable: true, hide: "hidden lg:table-cell" },
  { key: "access", label: "Access", hide: "hidden sm:table-cell" },
  { key: "licence", label: "Licence", hide: "hidden lg:table-cell" },
  { key: "open", label: "Open projects", hide: "hidden xl:table-cell", tip: "Open-source projects that read, serve or are the code behind this source; the whole list is on the open source page." },
  { key: "site", label: "Site", hide: "hidden xl:table-cell" },
];

const CANDIDATE_COLS: ColDef[] = [
  { key: "group", label: "Theme", sortable: true },
  { key: "fuels", label: "Would fuel", hide: "hidden md:table-cell", tip: "The OnCo kinds, pages or checks this source would feed." },
  { key: "access", label: "Access", hide: "hidden sm:table-cell" },
  { key: "licence", label: "Licence", hide: "hidden lg:table-cell" },
  { key: "effort", label: "Effort", sortable: true, tip: "S: a day, one script. M: a week, new fields or a new page. L: new kinds, licences to negotiate, or heavy parsing." },
  { key: "risks", label: "Risks", hide: "hidden xl:table-cell", tip: "Rate limits, licence restrictions, personal data." },
  { key: "open", label: "Open projects", hide: "hidden xl:table-cell", tip: "Open-source projects that already read, serve or are the code behind this source; a candidate with open tooling is easier to add." },
  { key: "site", label: "Site", hide: "hidden xl:table-cell" },
];

export default function DataSourcesPage() {
  const inUse = DATA_SOURCES.filter((s) => s.status === "in use");
  const candidates = DATA_SOURCES.filter((s) => s.status === "candidate");
  const scripted = inUse.filter((s) => s.access !== "Read by hand").length;
  const groups = [...new Set(candidates.map((s) => s.group))];
  const open = candidates.filter((s) => /CC0|CC BY|public domain|Open Government/i.test(s.licence)).length;
  const restricted = candidates.filter((s) => /commercial|registration|academic|subscription|controlled|members/i.test(s.licence)).length;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="Open data"
        lede={`${inUse.length} sources already feed the corpus (${scripted} by script or live query, the rest read by hand and cited); ${candidates.length} more are mapped as candidates across ${groups.length} themes. Every row says what it holds, under which licence, and what it would fuel.`} />
      <Container className="pb-16">
        <div className="grid gap-4 md:grid-cols-2 mb-8 max-w-5xl">
          <div className="card p-4 text-sm">
            <div className="kicker mb-1">How data gets in</div>
            <ol className="list-decimal pl-5 space-y-1 text-muted">
              <li>A script under <code className="text-xs">scripts/</code> queries a public API with a named <code className="text-xs">User-Agent</code> and a contact address, one request at a time with backoff, and writes a compact snapshot under <code className="text-xs">public/</code>. Each snapshot carries <code className="text-xs">source</code>, <code className="text-xs">fetched</code> and, where the source states one, <code className="text-xs">license</code>.</li>
              <li>GitHub Actions rerun the trial, literature and fact-check scripts weekly and open a pull request with the diff, so every refresh is reviewed before it lands. Other snapshots are refreshed by hand by a maintainer.</li>
              <li>The build reads the snapshots and the hand-written corpus in <code className="text-xs">src/data/</code>, validates every id and reference, and renders static pages and the <Link href="/api/" className="underline">JSON API</Link>. Nothing is fetched at request time; a few components query ClinicalTrials.gov, Europe PMC or Nominatim live in the browser when a reader asks.</li>
              <li>A weekly fact check compares recorded approvals and trial statuses against openFDA and ClinicalTrials.gov; mismatches appear on the <Link href="/audit/" className="underline">automated checks</Link> page.</li>
            </ol>
          </div>
          <div className="card p-4 text-sm">
            <div className="kicker mb-1">Attribution rules</div>
            <ul className="list-disc pl-5 space-y-1 text-muted">
              <li>We store counts, identifiers and short derived records, never wholesale copies of a database. Every page links back to the primary record.</li>
              <li>Sources are named on the page that uses them and in the snapshot file; molecule files keep PubChem and RCSB terms, logos remain trademarks and carry per-file Wikimedia Commons licences.</li>
              <li>Sources with academic-only or commercial licences (COSMIC, OncoKB, DrugBank, KEGG, NCCN text) are linked, not ingested, unless their terms allow redistribution under CC BY-NC 4.0.</li>
              <li>No patient-level data, no personal data beyond public professional profiles, and no scraping of patient forums or social media. Epidemiology is aggregate estimates only.</li>
              <li>The corpus is CC BY-NC 4.0 (free for non-commercial use, commercial use licensed by OnCo): name OnCo and link to onco.cc; upstream licences stay attached to what came from upstream. Details in <code className="text-xs">docs/DATA-SOURCES.md</code>.</li>
            </ul>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex items-baseline justify-between mb-1"><h2 className="text-xl font-semibold">In use</h2><span className="text-xs text-muted">{inUse.length} sources</span></div>
          <p className="text-sm text-muted mb-3 max-w-3xl">What we already pull from, what we take, the script or component that reads it, and how often. Click a chip to filter; the name opens the OnCo collection page when there is one.</p>
          <EntityBrowser rows={inUse.map((s) => rowFor(s, "u_"))} facets={facetsFor("u_", false)} columns={IN_USE_COLS} noun="sources" hideStatus defaultSort={{ key: "name", dir: 1 }} />
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-1"><h2 className="text-xl font-semibold">Candidates</h2><span className="text-xs text-muted">{candidates.length} sources · {open} fully open · {restricted} with registration, academic or commercial terms</span></div>
          <p className="text-sm text-muted mb-3 max-w-3xl">What we could extend to, grouped by what it would fuel. Effort is a first estimate for a working fetch script and the fields it would add; risks name the licence, rate-limit or personal-data issues to settle first.</p>
          <EntityBrowser rows={candidates.map((s) => rowFor(s, "c_"))} facets={facetsFor("c_", true)} columns={CANDIDATE_COLS} noun="candidate sources" hideStatus defaultSort={{ key: "group", dir: 1 }} />
        </section>

        <p className="text-xs text-muted mt-8 max-w-3xl">Licences were read from each source&apos;s terms page on the date in <code>src/data/data-sources.ts</code>; they change, so check the source before reusing anything. A source being listed here is a statement about its data, not an endorsement, and no source here holds patient records.</p>
      </Container>
    </>
  );
}

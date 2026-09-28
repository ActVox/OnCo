import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import type { BrowserRow, ColDef, FacetDef, FacetLink, LinkItem } from "@/components/EntityBrowser";
import type { SortState } from "@/components/filters/ResultsTable";
import { logoFor } from "@/lib/logos";
import { softwareProducts } from "@/data/software";
import { EVIDENCE_ORDER, EVIDENCE_TIP, evidenceKinds, firstTrace, SOFTWARE_CATEGORY_META, SOFTWARE_CATEGORY_ORDER, SOFTWARE_SEGMENT_ORDER, SOFTWARE_SOURCING_META, SOFTWARE_SOURCING_ORDER } from "@/lib/software";

/** The /software/ browser: the page carries the first page of rows, the file under /api/v1/tables/ the rest. */
export const SOFTWARE_TABLE = "software";
/** Most independently sourced first, so the rows a reader can check sit above the rows only a company vouches for. */
export const SOFTWARE_SORT: SortState = { key: "sources", dir: -1 };

const short = (s: string) => s.replace(/ \(.*\)$/, "");
const domain = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export function softwareBrowser(): { rows: BrowserRow[]; facets: FacetDef[]; columns: ColDef[] } {
  const g = graph();
  const fl = (facet: string, value: string, extra?: Pick<FacetLink, "label" | "tip">): FacetLink => ({ facet, value, ...extra });
  const link = (id: string): LinkItem | undefined => { const e = g.get(id); return e ? { label: short(e.name), href: routeFor(e), tip: e.tldr } : undefined; };

  const rows: BrowserRow[] = softwareProducts.map((p) => {
    const cat = SOFTWARE_CATEGORY_META[p.category];
    const src = SOFTWARE_SOURCING_META[p.sourcing];
    const kinds = evidenceKinds(p);
    const vendor = p.vendorId ? g.get(p.vendorId) : undefined;
    const techNames = p.technologies.map((id) => g.get(id)?.name).filter((x): x is string => !!x).map(short);
    const cancerNames = p.cancers.map((id) => g.get(id)?.name).filter((x): x is string => !!x).map(short);
    const evidenceCount = p.clearances.length + p.papers.length + p.listings.length;
    const trace = firstTrace(p);

    const sources: Array<LinkItem | FacetLink> = [];
    for (const c of p.clearances) sources.push({ label: `${c.number}`, href: c.url, tip: `FDA ${c.route} ${c.number}, ${c.date}: "${c.device}" (${c.applicant}). ${c.decision} Link: the openFDA query that returned it.` });
    for (const x of p.papers) sources.push({ label: `${x.year}${x.peerReviewed ? "" : " preprint"}`, href: x.url, tip: `${x.title}${x.journal ? `. ${x.journal}` : ""}, ${x.year}.${x.peerReviewed ? "" : " A preprint, not peer reviewed."}${x.citedBy ? ` Cited ${x.citedBy} times as Europe PMC counts it.` : ""}` });
    for (const l of p.listings) sources.push({ label: l.body, href: l.url, tip: `${l.label}. Fetched ${l.fetched} and checked to name the product.` });
    if (!sources.length) sources.push(fl("sourcing", src.label, { label: "none found", tip: src.tip }));

    const links: LinkItem[] = [];
    if (p.claim) links.push({ label: domain(p.claim.url), href: p.claim.url, tip: `The company's own page, fetched ${p.claim.fetched}.` });
    else links.push({ label: domain(p.source.url), href: p.source.url, tip: `The source this record cites, fetched ${p.source.fetched}.` });

    return {
      id: p.id, name: p.name, tldr: p.summary, route: p.claim?.url ?? p.source.url,
      logo: logoFor(p.vendorId).src, avatar: "org",
      sub: [p.vendor, trace ? `first outside trace ${trace}` : undefined].filter(Boolean).join(" · ") || undefined,
      facets: {
        category: [cat.label],
        segment: [p.segment],
        sourcing: [src.label],
        evidence: kinds,
        vendor: [p.vendor],
        technology: techNames,
        cancer: cancerNames,
      },
      cols: {
        category: fl("category", cat.label, { tip: cat.blurb }),
        segment: fl("segment", p.segment),
        vendor: vendor ? [{ label: short(vendor.name), href: routeFor(vendor), tip: vendor.tldr }] : fl("vendor", p.vendor),
        sourcing: fl("sourcing", src.label, { tip: p.note ? `${src.tip} ${p.note}` : src.tip }),
        evidence: kinds.map((k) => fl("evidence", k, { tip: EVIDENCE_TIP[k] })),
        sources,
        claim: p.claim ? clip(p.claim.text, 110) : undefined,
        technologies: p.technologies.map(link).filter((x): x is LinkItem => !!x),
        links,
      },
      sortKeys: { sources: evidenceCount, sourcing: p.sourcing === "independent" ? 1 : 0, clearances: p.clearances.length, papers: p.papers.length, first: trace ?? 0 },
      tie: trace ?? 0,
    };
  });

  // The same order compareBrowserRows produces for SOFTWARE_SORT, so the first page in the HTML and the file agree.
  rows.sort((a, b) => (b.sortKeys?.sources ?? 0) - (a.sortKeys?.sources ?? 0) || (b.tie ?? 0) - (a.tie ?? 0) || a.name.localeCompare(b.name));
  const segments = SOFTWARE_SEGMENT_ORDER.filter((s) => rows.some((r) => r.facets.segment[0] === s));

  return {
    rows,
    facets: [
      { key: "category", label: "Category", searchable: false, width: "w-72", order: SOFTWARE_CATEGORY_ORDER.map((c) => SOFTWARE_CATEGORY_META[c].label) },
      { key: "sourcing", label: "What is behind the row", searchable: false, width: "w-56", order: SOFTWARE_SOURCING_ORDER.map((s) => SOFTWARE_SOURCING_META[s].label) },
      { key: "evidence", label: "Kind of source", searchable: false, width: "w-48", order: EVIDENCE_ORDER },
      { key: "segment", label: "What it does", searchable: false, width: "w-64", order: segments },
      { key: "vendor", label: "Vendor", width: "w-56" },
      { key: "technology", label: "Technology", width: "w-56" },
      { key: "cancer", label: "Cancer", width: "w-48" },
    ],
    columns: [
      { key: "category", label: "Category", sortable: true, tip: "One of six categories; click a chip to filter." },
      { key: "segment", label: "What it does", sortable: true, hide: "hidden lg:table-cell", tip: "The finer grain inside the category, in the words a department would use." },
      { key: "vendor", label: "Vendor", sortable: true, hide: "hidden md:table-cell", tip: "Linked when the company or institution is in OnCo; otherwise the name filters the table." },
      { key: "sourcing", label: "Behind the row", sortable: true, tip: "Independently sourced means a regulator, the literature or a public body names the product. The company's own account means nothing outside the company was found." },
      { key: "evidence", label: "Source kind", hide: "hidden xl:table-cell", tip: "Which kinds of outside source the row carries." },
      { key: "sources", label: "Sources", sortable: true, tip: "Every source outside the company, each fetched and each checked to name the product: an FDA number, a paper's year, or a public body." },
      { key: "claim", label: "The company's words", hide: "hidden xl:table-cell", tip: "The description on the page cited, verbatim. It establishes what the company says and nothing else." },
      { key: "technologies", label: "Technologies", hide: "hidden xl:table-cell", tip: "OnCo technology pages this product implements or serves." },
      { key: "links", label: "Link", hide: "hidden md:table-cell", tip: "The page this record cites." },
    ],
  };
}

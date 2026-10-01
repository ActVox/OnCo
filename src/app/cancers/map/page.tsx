import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { absoluteUrl, pageMeta } from "@/lib/seo";
import { METRICS, cancerDag, layoutCancerDag, type CancerDag, type CancerDagLayout, type CancerDagNode, type Metric } from "@/lib/cancer-dag";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CancerMapBy } from "@/components/CancerMapBy";
import { CancerIcon } from "@/components/CancerIcon";
import { WebPageJsonLd } from "@/components/JsonLd";

const PATH = "/cancers/map/";
export const GRAPH_JSON = "/cancers/map/graph.json";

const base = pageMeta({
  title: "Cancer map",
  description: "Every cancer type on one map: organ systems on the left, cancers in the middle, subtypes on the right, drawn as a directed graph because a cancer can belong to more than one group (a GIST is a gut cancer by site and a sarcoma by lineage). Badges count trials, products, approvals or ideas.",
  path: PATH,
});
export const metadata: Metadata = { ...base, alternates: { ...base.alternates, types: { ...(base.alternates?.types ?? {}), "application/json": [{ url: GRAPH_JSON, title: "Cancer map as JSON (nodes, edges, counts)" }] } } };

/** Monoline glyphs for the section headings (24x24, 1.5px stroke), same grammar as RouteIcon. */
const GLYPH = {
  map: "M4 6h4v4H4zM4 14h4v4H4zM16 10h4v4h-4zM8 8l8 4M8 16l8-4",
  fork: "M6 4v5a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4v3M6 4a1.5 1.5 0 1 0 0 .01M18 20a1.5 1.5 0 1 0 0 .01M6 20V13M6 20a1.5 1.5 0 1 0 0 .01",
  list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Zm0 15A2.5 2.5 0 0 1 6.5 18H20M8 7h8M8 10.5h6",
  layers: "M12 3 3 8l9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
} as const;

function Glyph({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>;
}

function Section({ id, icon, title, count, children }: { id: string; icon: string; title: string; count?: number; children: ReactNode }) {
  return (
    <section id={id} className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight leading-snug flex items-center gap-2 mb-3">
        <span className="inline-flex text-accent"><Glyph d={icon} className="h-5 w-5" /></span>
        {title}
        {count !== undefined && <span className="chip bg-foreground/5 text-xs font-normal">{count.toLocaleString("en-GB")}</span>}
      </h2>
      {children}
    </section>
  );
}

const ROW_H = 18;
const FONT = 10;
/** Roughly how many characters fit in `px` at the node font size. */
const fit = (s: string, px: number) => { const n = Math.floor(px / (FONT * 0.52)); return s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s; };
const num = (n: number) => n.toLocaleString("en-GB");
/** Badge radius from a count: 3px for one, 7px for the largest count on the map, square-root scaled. */
const radius = (n: number, max: number) => (n <= 0 ? 2.5 : 3 + 4 * Math.sqrt(n / Math.max(1, max)));

const LAYER_LABEL: Record<CancerDagNode["layer"], string> = { system: "Organ system", histology: "Histology grouping", cancer: "Cancer", subtype: "Subtype" };
const CLASS: Record<Metric, string> = { trials: "bt", drugs: "bd", approvals: "ba", ideas: "bi" };
/** Two-letter node classes for the stylesheet ("system" and "subtype" share an initial). */
const NODE_CLASS: Record<CancerDagNode["layer"], string> = { system: "sy", histology: "hi", cancer: "ca", subtype: "su" };

/** Words for the four badge counts in the hover tooltip; a count of zero is left out rather than read aloud as "0". */
const METRIC_WORD: Record<Metric, string> = { trials: "trials", drugs: "products", approvals: "approved", ideas: "ideas" };

function tooltip(n: CancerDagNode, d: CancerDag): string {
  const counts = METRICS.filter((m) => n.counts[m] > 0).map((m) => `${n.counts[m]} ${METRIC_WORD[m]}`);
  const parts = [`${n.name}: ${counts.length ? counts.join(", ") : "nothing recorded yet"}${n.children.length ? ` (with ${n.children.length} beneath)` : ""}`];
  if (n.parents.length) parts.push(`Under ${n.parents.map((p) => d.byId.get(p)?.name ?? p).join(" and ")}`);
  return parts.join(". ");
}

/**
 * The drawing. Plain SVG anchors, all coordinates rounded, one `<title>` per node for the hover tooltip and four
 * badge groups per node of which the page stylesheet shows one (`data-by` on the wrapper set by CancerMapBy).
 * Each node carries its id once, in `href`: a `data-id` attribute repeating it cost about 14 KB of markup across
 * the 474 nodes and nothing read it except this page's own test, which now finds a node by its route.
 */
function MapSvg({ d, lay, max }: { d: CancerDag; lay: CancerDagLayout; max: Record<Metric, number> }) {
  const BADGE_GAP = 26;
  const mid = (id: string) => lay.pos[id].y;
  const path = (from: string, to: string) => {
    const a = lay.pos[from], b = lay.pos[to];
    const x1 = Math.round(a.x + a.w + BADGE_GAP), y1 = Math.round(mid(from)), x2 = Math.round(b.x), y2 = Math.round(mid(to));
    const c = Math.round((x2 - x1) / 2);
    return `M${x1} ${y1}C${x1 + c} ${y1} ${x2 - c} ${y2} ${x2} ${y2}`;
  };
  return (
    <svg width={lay.width} height={lay.height} viewBox={`0 0 ${lay.width} ${lay.height}`} className="cm block" role="img" aria-labelledby="cm-title cm-desc" fontSize={FONT}>
      <title id="cm-title">Cancer map</title>
      <desc id="cm-desc">Layered directed graph: organ systems and histology groupings on the left, cancers in the middle, subtypes on the right. Each node links to its page; the same structure follows as a nested list.</desc>
      <g className="cm-edges">
        {d.edges.map((e) => <path key={`${e.from}>${e.to}`} className={`e ${e.via[0]}`} d={path(e.from, e.to)} />)}
      </g>
      <g className="cm-nodes">
        {d.nodes.map((n) => {
          const p = lay.pos[n.id];
          const x = Math.round(p.x), y = Math.round(p.y - p.h / 2), h = Math.round(p.h);
          const label = fit(n.name, p.w - 8);
          return (
            <a key={n.id} href={n.route} className={`n ${NODE_CLASS[n.layer]}`}>
              <rect x={x} y={y} width={p.w} height={h} rx={4} />
              <text x={x + 5} y={Math.round(p.y + FONT * 0.36)}>{label}</text>
              {METRICS.map((m) => {
                const v = n.counts[m];
                if (v <= 0) return null;
                const r = Math.round(radius(v, max[m]) * 10) / 10;
                const cx = x + p.w + 4 + 8;
                return (
                  <g key={m} className={`b ${CLASS[m]}`}>
                    <circle cx={cx} cy={Math.round(p.y)} r={r} />
                    <text x={cx + 10} y={Math.round(p.y + 3)}>{num(v)}</text>
                  </g>
                );
              })}
              <title>{tooltip(n, d)}</title>
            </a>
          );
        })}
      </g>
    </svg>
  );
}

/** Nested list of the same graph, for screen readers and crawlers. A cancer under two nodes is listed under both. */
function Outline({ d }: { d: CancerDag }) {
  const item = (id: string, depth: number): ReactNode => {
    const n = d.byId.get(id);
    if (!n) return null;
    const kids = depth < 6 ? n.children : [];
    return (
      <li key={id} className="mt-1">
        <Link href={n.route} className="inline-flex items-center gap-1.5 hover:underline" title={`${n.counts.drugs} products, ${n.counts.approvals} approved, ${n.counts.ideas} ideas`}>
          <span className={n.layer === "system" || n.layer === "histology" ? "font-medium" : ""}>{n.name}</span>
          <span className="text-[11px] text-muted tabular-nums">{n.counts.trials} trials</span>
          {n.parents.length > 1 && <span className="text-[10px] text-accent" title={`Also under: ${n.parents.map((p) => d.byId.get(p)?.name ?? p).join(", ")}`}>×{n.parents.length}</span>}
        </Link>
        {kids.length > 0 && <ul className="ms-4 border-s border-border ps-3">{kids.map((k) => item(k, depth + 1))}</ul>}
      </li>
    );
  };
  const roots = d.layers[0] ?? [];
  const systems = roots.filter((id) => d.byId.get(id)?.layer === "system");
  const hist = roots.filter((id) => d.byId.get(id)?.layer === "histology");
  return (
    <nav aria-label="Cancer map as a list" className="text-sm">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="kicker mb-1">By organ system</div>
          <ul>{systems.map((id) => item(id, 0))}</ul>
        </div>
        <div>
          <div className="kicker mb-1">By histology (from the record names)</div>
          <ul>{hist.map((id) => item(id, 0))}</ul>
        </div>
      </div>
    </nav>
  );
}

/** Styles for the drawing: theme tokens so the map follows light, dark and high-contrast; badges switched by `data-by`. */
const STYLE = `
.cm .e{fill:none;stroke:var(--border-strong);stroke-width:1;opacity:.7}
.cm .e.p{stroke:var(--accent);opacity:.45}
.cm .e.h{stroke:var(--muted);stroke-dasharray:3 3;opacity:.6}
.cm .n rect{fill:var(--card);stroke:var(--border)}
.cm .n.sy rect{fill:var(--accent-soft);stroke:var(--accent)}
.cm .n.hi rect{fill:var(--surface);stroke:var(--muted);stroke-dasharray:3 2}
.cm .n.su rect{fill:var(--background)}
.cm .n text{fill:var(--foreground)}
.cm .n:hover rect,.cm .n:focus rect{stroke:var(--accent-solid);stroke-width:1.5}
.cm .n:hover text{fill:var(--accent)}
.cm .b circle{fill:var(--accent-solid);opacity:.85}
.cm .b text{fill:var(--muted);font-size:9px}
[data-by="trials"] .cm .b:not(.bt),[data-by="drugs"] .cm .b:not(.bd),[data-by="approvals"] .cm .b:not(.ba),[data-by="ideas"] .cm .b:not(.bi){display:none}
`;

export default function CancerMapPage() {
  const d = cancerDag();
  const lay = layoutCancerDag(d, { rowH: ROW_H });
  const cancersOnly = d.nodes.filter((n) => n.layer === "cancer" || n.layer === "subtype");
  const max = Object.fromEntries(METRICS.map((m) => [m, Math.max(1, ...cancersOnly.map((n) => n.counts[m]))])) as Record<Metric, number>;
  const s = d.stats;
  const multi = cancersOnly.filter((n) => n.parents.length > 1).sort((a, b) => a.name.localeCompare(b.name));
  const lede = `${num(s.cancers)} cancer pages under ${s.systems} organ systems and ${s.histologies} histology groupings, joined by ${num(s.edges)} edges in ${s.depth} layers. ${s.subtypes} are subtypes of a broader cancer, and ${s.multiParent} sit under more than one node, which is why this is a graph and not a tree.`;
  const layerCounts: Array<[CancerDagNode["layer"], number, string]> = [
    ["system", s.systems, "The group field on each record: haematologic, gastrointestinal, lung and the rest. Links to the browser filtered to that system."],
    ["histology", s.histologies, "Words in the record names that cut across organs: adenocarcinoma, squamous, neuroendocrine, germ cell. Kept only where members span two or more systems."],
    ["cancer", s.cancers - s.subtypes, "Cancers with no broader parent recorded."],
    ["subtype", s.subtypes, "Cancers with a parent field; a subtype can also carry its own organ system."],
  ];
  const stat = (label: string, value: number, href: string, tip: string, glyph: string) => (
    <Link key={label} href={href} title={tip} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5 text-sm"><span className="inline-flex text-accent"><Glyph d={glyph} className="h-3.5 w-3.5" /></span><span className="tabular-nums font-medium">{num(value)}</span><span className="text-muted">{label}</span></Link>
  );

  return (
    <>
      <WebPageJsonLd path={PATH} name="Cancer map" description={lede} />
      <PageHeader kicker={<GroupKicker id="map" />} title="Cancer map" lede={lede}
        right={<div className="flex flex-wrap gap-2 justify-end"><Link href="/cancers/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">All cancers →</Link><Link href="/body/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Body map →</Link></div>} />
      <Container className="pb-16">
        <style dangerouslySetInnerHTML={{ __html: STYLE }} />
        <div className="flex flex-wrap gap-1.5 mb-4">
          {stat("nodes", s.nodes, "#outline", "Organ systems, histology groupings, cancers and subtypes", GLYPH.map)}
          {stat("edges", s.edges, "#method", `${s.edgesBy.system} system, ${s.edgesBy.parent} parent and ${s.edgesBy.histology} histology edges`, GLYPH.fork)}
          {stat("under more than one node", s.multiParent, "#multi", "Cancers with two or more parents on the map", GLYPH.layers)}
          {stat("cross-system subtypes", s.crossSystem, "#multi", "Subtypes whose organ system differs from their parent's", GLYPH.layers)}
          <a href={GRAPH_JSON} type="application/json" title="Nodes, edges, layers and counts as JSON" className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5 text-sm"><span className="inline-flex text-accent"><Glyph d={GLYPH.book} className="h-3.5 w-3.5" /></span><span className="text-muted">graph.json</span></a>
        </div>

        <CancerMapBy>
          <div className="card overflow-auto max-h-[85vh] p-2" tabIndex={0} aria-label="Scrollable cancer map">
            <MapSvg d={d} lay={lay} max={max} />
          </div>
        </CancerMapBy>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted" aria-label="Legend">
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded border border-accent bg-accent-soft" />Organ system</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded border border-dashed border-muted bg-surface" />Histology grouping</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded border border-border bg-card" />Cancer</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-3 w-5 rounded border border-border bg-background" />Subtype</span>
          <span className="inline-flex items-center gap-1.5"><svg width="22" height="8" aria-hidden><path d="M1 4h20" stroke="var(--border-strong)" /></svg>system to cancer</span>
          <span className="inline-flex items-center gap-1.5"><svg width="22" height="8" aria-hidden><path d="M1 4h20" stroke="var(--accent)" /></svg>parent to subtype</span>
          <span className="inline-flex items-center gap-1.5"><svg width="22" height="8" aria-hidden><path d="M1 4h20" stroke="var(--muted)" strokeDasharray="3 3" /></svg>histology to cancer</span>
          <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-accent-solid" /><span className="inline-block h-3.5 w-3.5 rounded-full bg-accent-solid" />badge grows with the count</span>
        </div>

        <Section id="layers" icon={GLYPH.layers} title="The four layers" count={4}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {layerCounts.map(([layer, n, blurb]) => (
              <div key={layer} className="card p-3">
                <div className="flex items-baseline justify-between gap-2"><span className="font-medium">{LAYER_LABEL[layer]}</span><span className="text-xs text-muted tabular-nums">{num(n)}</span></div>
                <p className="text-xs text-muted mt-1">{blurb}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="multi" icon={GLYPH.fork} title="Under more than one node" count={multi.length}>
          <p className="text-sm text-muted mb-3 max-w-3xl">These cancers have two or more parents on the map: a site and a lineage, an age group and a disease, or a histology word shared across organs. Each chip names the cancer and the nodes it sits under.</p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            {multi.map((n) => (
              <li key={n.id} className="card p-2.5 flex items-start gap-2">
                <span className="inline-flex text-accent mt-0.5 shrink-0"><CancerIcon cancerId={n.id} className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <Link href={n.route} className="font-medium hover:underline">{n.name}</Link>
                  <span className="block text-xs text-muted mt-0.5">Under {n.parents.map((p, i) => { const pn = d.byId.get(p); return pn ? <span key={p}>{i > 0 && " and "}<Link href={pn.route} className="underline">{pn.name}</Link></span> : null; })}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="outline" icon={GLYPH.list} title="The map as a list" count={s.nodes}>
          <p className="text-sm text-muted mb-3 max-w-3xl">The same graph as nested lists, one per grouping axis. A cancer that sits under two nodes appears under both, marked ×2. Counts are trials linked to the cancer or anything beneath it.</p>
          <Outline d={d} />
        </Section>

        <Section id="method" icon={GLYPH.book} title="How the map is built">
          <div className="text-sm text-muted space-y-2 max-w-3xl">
            <p>Every node and edge is read from fields already on the cancer records; nothing is inferred about the diseases themselves. The organ-system layer is the <code className="text-xs">group</code> field. The parent layer is the <code className="text-xs">parent</code> field, the broader cancer a page is a subtype of. The histology layer matches a short fixed vocabulary of words in the record names (adenocarcinoma, squamous, neuroendocrine, germ cell, and others that did not survive the filter below); the schema has no histology field, so this axis is only as complete as the names.</p>
            <p>An organ-system or histology edge is left out when a cancer&apos;s parent chain already carries the same grouping, so each fact is drawn once. A histology node is kept only when its members span at least two organ systems; otherwise the system node already says the same thing. Layers come from the longest path to each node; within a layer nodes are ordered by repeated barycentre sweeps and then placed at the mean row of their neighbours, which keeps most edges short.</p>
            <p>Badge counts are distinct records of each kind linked to a node or anything beneath it: trials and products in either direction of the graph, approved products meaning linked products with at least one recorded approval, and ideas that name the cancer. Pick the badge above; the choice is kept in the address as <code className="text-xs">?by=</code>.</p>
            <p>For scripts and agents: <a href={GRAPH_JSON} type="application/json" className="underline">{absoluteUrl(GRAPH_JSON)}</a> has the nodes, edges, layers and statistics; every cancer node carries the page it links to. The technology <Link href="/dependencies/" className="underline">dependency map</Link> is drawn the same way.</p>
          </div>
        </Section>
      </Container>
    </>
  );
}

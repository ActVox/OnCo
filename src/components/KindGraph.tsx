import Link from "next/link";
import { graph } from "@/lib/graph";
import { type Kind } from "@/lib/kinds";
import { HUE } from "@/lib/graph-layout";
import { KIND_COLOR } from "@/lib/text";
import {
  KG_COLUMNS, KG_H, KG_MIN_LINKS, KG_POS, KG_W, KIND_GRAPH_URL, edgePath, edgeSentence, edgeWidth, edgesOf, kindGraph, linksSentence, nodeRadius, num,
  type KindGraph as KindGraphData,
} from "@/lib/kind-graph";
import { KindIcon } from "./KindIcon";
import { KindGraphFrame } from "./KindGraphFrame";

/**
 * The home page's "by the numbers" block as a living graph of the kinds (src/lib/kind-graph.ts): one node per kind,
 * sized by its record count and carrying its glyph and count; one edge per pair of kinds, width by link volume on a
 * log scale. Everything is a plain link, rendered on the server: a reader without JavaScript gets the same nodes,
 * counts and destinations. KindGraphFrame adds the hover and focus highlight, the tooltip and the Graph / List pill
 * (state in `?view=`). Below the md breakpoint the body map is the entry point instead (BodyMap in entry mode), with
 * a strip beneath for the kinds that are not bound to an organ. The plain counts list is always in the markup for the
 * List view. The JSON twin is /api/v1/kind-graph.json.
 */

/** Kinds shown in the strip beneath the phone body map: those not reached through an organ. */

const GLYPH = 1.3; // glyph size as a fraction of the node radius

export function GraphSvg({ kg }: { kg: KindGraphData }) {
  const maxCount = Math.max(...kg.nodes.map((n) => n.count));
  const drawn = kg.edges.filter((e) => e.a !== e.b && e.links >= KG_MIN_LINKS && kg.nodes.some((n) => n.kind === e.a) && kg.nodes.some((n) => n.kind === e.b));
  const maxLinks = Math.max(1, ...drawn.map((e) => e.links));
  const r = (k: Kind) => nodeRadius(kg.nodes.find((n) => n.kind === k)?.count ?? 0, maxCount);
  return (
    <svg viewBox={`0 0 ${KG_W} ${KG_H}`} className="kg-svg block w-full h-auto" role="img" aria-labelledby="kg-title kg-desc" fontFamily="inherit">
      <title id="kg-title">The kinds of record in OnCo and how they link</title>
      <desc id="kg-desc">{num(kg.total)} records in {kg.nodes.length} kinds with {num(kg.links)} links between them. A node&apos;s size is its record count; an edge&apos;s width is the number of links between the two kinds, log scaled. Columns read left to right: disease, biology, treatment, evidence, who, direction.</desc>
      <g className="kg-cols" fill="currentColor" fillOpacity={0.55} fontSize={11} fontWeight={600} textAnchor="middle" letterSpacing={0.6}>
        {KG_COLUMNS.map((c) => <text key={c.title} x={c.x} y={16}>{c.title.toUpperCase()}</text>)}
      </g>
      <g className="kg-edges" fill="none" strokeLinecap="round">
        {drawn.map((e) => {
          const p = KG_POS[e.a], q = KG_POS[e.b];
          const t = Math.log(e.links) / Math.log(maxLinks);
          const d = edgePath(p, q);
          // The label is the tooltip too (KindGraphFrame reads it); the static stroke attributes live in the frame's stylesheet.
          return (
            <a key={`${e.a}-${e.b}`} href={e.href} className="kg-e" data-kg={`${e.a} ${e.b}`} aria-label={edgeSentence(e)}>
              <path className="kg-eh" d={d} />
              <path className="kg-el" d={d} strokeOpacity={Math.round((0.07 + 0.28 * t) * 100) / 100} strokeWidth={edgeWidth(e.links, maxLinks)} />
            </a>
          );
        })}
      </g>
      <g className="kg-nodes" textAnchor="middle">
        {kg.nodes.map((n) => {
          const { x, y } = KG_POS[n.kind];
          const rad = r(n.kind), g = Math.round(rad * GLYPH * 2) / 2;
          const neighbours = edgesOf(kg, n.kind).map((e) => e.other).filter((k) => k !== n.kind).join(" ");
          const tip = `${n.label}: ${num(n.count)} ${n.count === 1 ? "record" : "records"}. ${linksSentence(kg, n.kind)}`;
          return (
            <a key={n.kind} href={n.route} className="kg-n" data-kg={n.kind} data-n={neighbours} aria-label={`${tip} Open the ${n.plural}.`} style={{ color: HUE[n.kind] }}>
              <circle cx={x} cy={y} r={rad} />
              <svg x={x - g / 2} y={y - g / 2} width={g} height={g} aria-hidden focusable="false"><KindIcon kind={n.kind} className="" /></svg>
              <text className="kg-c" x={x} y={y + rad + 15}>{num(n.count)}</text>
              <text className="kg-l" x={x} y={y + rad + 28}>{n.label}</text>
            </a>
          );
        })}
      </g>
    </svg>
  );
}

/** The plain counts list: the grid the graph replaced, kept for the List view and for readers who prefer it. */
export function CountsList({ kg }: { kg: KindGraphData }) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-px rounded-xl border border-border bg-card overflow-hidden shadow-card [&>li]:border-border [&>li]:border-b [&>li]:border-r" aria-label="Records by kind">
      {kg.nodes.map((n) => (
        <li key={n.kind} className="bg-card">
          <Link href={n.route} className="flex h-full items-center gap-3 px-3.5 py-3 hover:bg-surface transition-colors" title={linksSentence(kg, n.kind)}>
            <span aria-hidden className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${KIND_COLOR[n.kind]}`}><KindIcon kind={n.kind} className="h-5 w-5" /></span>
            <span className="min-w-0">
              <span className="block text-xl font-semibold tabular-nums leading-none tracking-tight">{num(n.count)}</span>
              <span className="block text-xs text-muted mt-1 truncate">{n.label}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}


/**
 * The list of kinds, which is what the home page shows.
 *
 * The graph that used to sit beside it came off on 2 October 2026. The owner: "the graph on the homepage is not
 * very truthful are directions can have feedback loops it shows just a single flow." He is right: the drawing
 * lays the kinds out as one left-to-right flow, and the corpus is not that. A target points at a drug and the
 * drug points back; a trial reads a biomarker and the biomarker is defined by trials. A picture that cannot
 * show a cycle is asserting something about the field that is not true.
 *
 * So the graph, and the Graph/List toggle with it, moved to /experimental-upgrades/ until there is a drawing
 * that can carry a loop. The list is honest: it counts, and counting is all it claims to do.
 */
export function KindGraph() {
  const kg = kindGraph(graph());
  return (
    <>
      {/* React hoists this into <head>: crawlers and agents find the graph's numbers as JSON. */}
      <link rel="alternate" type="application/json" href={KIND_GRAPH_URL} title="OnCo kinds and the links between them, as JSON" />
      <CountsList kg={kg} />
    </>
  );
}

/** The kinds drawn as a graph. Only /experimental-upgrades/ renders this now; see the note above. */
export function KindGraphExperiment() {
  const kg = kindGraph(graph());
  return <KindGraphFrame graph={<div className="card p-3 sm:p-4 text-foreground"><GraphSvg kg={kg} /></div>} list={<CountsList kg={kg} />} />;
}

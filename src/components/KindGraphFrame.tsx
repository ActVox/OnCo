"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { placeNear } from "./Tip";

/**
 * The client half of the home page's kind graph (src/components/KindGraph.tsx). It owns two things and nothing
 * about the data: the Graph / List pill, mirrored in `?view=` and read back after mount so the first render matches
 * the static HTML (graph on desktop, body map on phones, list when asked); and the hover and focus behaviour of the
 * server-rendered SVG, by event delegation on `[data-kg]` (a node carries its kind, an edge "a b"): the touched
 * node's edges and neighbours stay lit while the rest dims, and a tooltip shows the element's `data-tip` sentence.
 * The SVG's anchors, counts and destinations are all in the markup already, so nothing here is needed to read it.
 */

type View = "graph" | "list";
const QUERY = "view";

const CSS = `
.kg-graph{display:none}
@media (min-width:48rem){.kg-graph{display:block}.kg-body{display:none}}
.kg:not([data-view="graph"]) .kg-graph,.kg:not([data-view="graph"]) .kg-body{display:none}
.kg[data-view="graph"] .kg-list{display:none}
.kg-svg a{outline:none;cursor:pointer}
.kg-eh{stroke:transparent;stroke-width:14;pointer-events:stroke}
.kg-el{stroke:currentColor}
.kg-n circle{fill:currentColor;fill-opacity:.13;stroke:currentColor;stroke-width:1.5}
.kg-e .kg-el,.kg-n circle,.kg-n text{transition:opacity .18s ease,stroke-opacity .18s ease,stroke-width .18s ease}
.kg-n text{fill:var(--foreground);paint-order:stroke;stroke:var(--card,#fff);stroke-width:3px;stroke-linejoin:round}
.kg-n .kg-c{font-size:13px;font-weight:600}
.kg-n .kg-l{font-size:10.5px;fill:var(--muted,currentColor);fill-opacity:.85}
.kg-n:hover circle,.kg-n.on circle{fill-opacity:.28;stroke-width:2.5}
.kg-n:focus-visible circle{stroke:var(--accent-solid);stroke-width:3}
.kg[data-focus] .kg-e:not(.on) .kg-el{stroke-opacity:.05}
.kg[data-focus] .kg-n:not(.on){opacity:.35}
.kg-e.on .kg-el{stroke:var(--accent-solid);stroke-opacity:.9;stroke-dasharray:7 9;animation:kg-flow 1.1s linear infinite}
.kg-e:focus-visible .kg-el{stroke:var(--accent-solid);stroke-opacity:1}
@keyframes kg-flow{to{stroke-dashoffset:-16}}
@media (prefers-reduced-motion:reduce){.kg-e.on .kg-el{animation:none;stroke-dasharray:none}}
`;

const isView = (s: string | null): s is View => s === "graph" || s === "list";

function Glyph({ d, className = "h-3.5 w-3.5" }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}
const GRAPH_D = "M5 6a2 2 0 1 0 0 .01M19 6a2 2 0 1 0 0 .01M12 18a2 2 0 1 0 0 .01M6.5 7.5 10.8 16M17.5 7.5 13.2 16M7 6h10";
const LIST_D = "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01";

/**
 * The owner, 2 October 2026: take the record-count sentence off the home page, and the JSON and body buttons
 * above the grid. So the row above the grid is now a desktop-only Graph/List toggle and nothing else: no lede,
 * no JSON chip, and on a phone no row at all. The phone gets the list, which is what it was already showing.
 *
 * The body map is no longer rendered here. It was only reachable on a phone through the pill that said "Body",
 * and that pill is gone; /body/ is its page. The JSON is still discoverable without the chip, through the
 * `<link rel="alternate">` that KindGraph puts in the head, which is what a crawler or an agent reads anyway.
 */
export function KindGraphFrame({ graph, list }: { graph: ReactNode; list: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("list");
  const [focus, setFocus] = useState<string | null>(null);
  const [tip, setTip] = useState<{ text: string; left: number; top: number } | null>(null);

  // Initial view from ?view=, deferred so the first render matches the static HTML.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const q = new URLSearchParams(window.location.search).get(QUERY);
      if (isView(q)) setView(q);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const choose = (v: View) => {
    setView(v);
    const p = new URLSearchParams(window.location.search);
    if (v === "list") p.delete(QUERY); else p.set(QUERY, v);
    const q = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${q ? `?${q}` : ""}${window.location.hash}`);
  };

  // Highlight: the touched node's edges and neighbours, or the touched edge and its two ends; everything else dims.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const edges = el.querySelectorAll<SVGAElement>(".kg-e");
    const nodes = el.querySelectorAll<SVGAElement>(".kg-n");
    if (!focus) { for (const x of edges) x.classList.remove("on"); for (const x of nodes) x.classList.remove("on"); return; }
    const [a, b] = focus.split(" ");
    const ends = (x: SVGAElement) => (x.dataset.kg ?? "").split(" ");
    if (b) {
      for (const x of edges) x.classList.toggle("on", x.dataset.kg === focus);
      for (const x of nodes) x.classList.toggle("on", x.dataset.kg === a || x.dataset.kg === b);
    } else {
      for (const x of edges) x.classList.toggle("on", ends(x).includes(a));
      for (const x of nodes) x.classList.toggle("on", x.dataset.kg === a || (x.dataset.n ?? "").split(" ").includes(a));
    }
  }, [focus]);

  const target = (t: EventTarget | null): HTMLElement | null => (t instanceof Element ? (t.closest("[data-kg]") as HTMLElement | null) : null);
  const show = (el: HTMLElement, x: number, y: number) => { setFocus(el.dataset.kg ?? null); const text = el.getAttribute("aria-label"); setTip(text ? { text, ...placeNear(x, y) } : null); };
  const hide = () => { setFocus(null); setTip(null); };
  const onMove = (e: React.MouseEvent) => { const el = target(e.target); if (!el) { if (focus) hide(); return; } show(el, e.clientX, e.clientY); };
  const onLeave = () => hide();
  const onFocus = (e: React.FocusEvent) => { const el = target(e.target); if (!el) return; const r = el.getBoundingClientRect(); show(el, r.left + r.width / 2, r.bottom); };
  const onBlur = (e: React.FocusEvent) => { if (target(e.relatedTarget)) return; hide(); };
  const onKey = (e: React.KeyboardEvent) => { if (e.key === "Escape") hide(); };

  const pill = (on: boolean) => `chip border inline-flex items-center gap-1 text-xs ${on ? "bg-accent text-white border-accent" : "bg-card border-border hover:bg-foreground/5"}`;

  return (
    <div ref={root} className="kg" data-view={view} data-focus={focus ?? undefined} data-kg-root>
      <style>{CSS}</style>
      <div className="hidden md:flex items-center justify-end gap-1.5 mb-3" role="group" aria-label="How to show the kinds">
        <Link href={`/?${QUERY}=graph`} onClick={(ev) => { ev.preventDefault(); choose("graph"); }} aria-current={view === "graph" ? "true" : undefined} className={pill(view === "graph")} title="The kinds as a graph: nodes by count, edges by links">
          <Glyph d={GRAPH_D} /><span>Graph</span>
        </Link>
        <Link href="/" onClick={(ev) => { ev.preventDefault(); choose("list"); }} aria-current={view === "list" ? "true" : undefined} className={pill(view === "list")} title="The kinds as a plain list of counts">
          <Glyph d={LIST_D} /><span>List</span>
        </Link>
      </div>
      <div className="kg-graph" onMouseMove={onMove} onMouseLeave={onLeave} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKey}>{graph}</div>
      <div className="kg-list">{list}</div>
      {tip && (
        <div role="tooltip" style={{ left: tip.left, top: tip.top, width: 288 }} className="fixed z-[80] max-w-[85vw] card shadow-xl p-3 text-sm text-left leading-snug pointer-events-none text-foreground">{tip.text}</div>
      )}
    </div>
  );
}

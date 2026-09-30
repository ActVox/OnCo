import { BODY_REGIONS, FIGURE } from "@/data/body-regions";
import { SPREAD_ANCHORS, SPREAD_LABELS, type Spread, type SpreadTier } from "@/data/spread";

const W = 400, H = 980;
const TIER_STYLE: Record<SpreadTier, { width: number; opacity: number; r: number }> = {
  "most common": { width: 3, opacity: 0.95, r: 11 },
  common: { width: 2, opacity: 0.75, r: 9 },
  "less common": { width: 1.4, opacity: 0.55, r: 7 },
  rare: { width: 1, opacity: 0.4, r: 5.5 },
};

function anchorFor(key: string): { label: string; at: [number, number] } | null {
  const r = BODY_REGIONS.find((x) => x.id === key);
  if (r) return { label: r.label, at: r.anchor };
  const a = SPREAD_ANCHORS[key];
  return a ? { label: a.label, at: a.at } : null;
}

/** The one-line "what treats advanced disease" note that sits above every map; exported so pages can place it themselves. */
export function WhatHelpsLine({ spread, className = "" }: { spread: Spread; className?: string }) {
  return (
    <p className={`text-sm leading-snug ${className}`}>
      <span className="kicker mr-1.5">What helps</span>
      <span className="text-foreground/85">{spread.whatHelps}</span>
    </p>
  );
}

/**
 * Where advanced disease reaches, and what treats it, drawn on the body-map silhouette: the primary organ
 * in the hot colour, one curved arrow per site whose weight follows the frequency tier, and labels in the
 * margins. The "what helps" line from the cancer's own records sits above the figure (hidden with `compact`
 * or `showWhatHelps={false}` when the page places it elsewhere). Pure SVG plus one paragraph; server-renderable.
 */
export function SpreadMap({ spread, cancerName, compact = false, showWhatHelps = !compact, className = "" }: { spread: Spread; cancerName: string; compact?: boolean; showWhatHelps?: boolean; className?: string }) {
  const primary = BODY_REGIONS.find((r) => r.id === spread.primary);
  const from = anchorFor(spread.primary)?.at ?? [200, 400];
  const seen = new Set<string>();
  const sites = spread.sites.map((s) => ({ ...s, a: anchorFor(s.region) })).filter((s) => { if (!s.a || seen.has(s.region)) return false; seen.add(s.region); return true; });
  const female = spread.primary === "pelvis-female" || spread.primary === "breast";
  return (
    <div className={className}>
      {showWhatHelps && <WhatHelpsLine spread={spread} className="mb-2" />}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`${cancerName}: ${SPREAD_LABELS.fold}. Sites: ${spread.sites.map((s) => `${s.site} (${s.tier})`).join(", ")}. What helps: ${spread.whatHelps}`} style={{ color: "var(--foreground)" }}>
        <defs>
          <marker id={`sp-arrow-${spread.cancer}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
        </defs>
        <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
          <path d={FIGURE.head} strokeWidth={1.5} opacity={0.5} />
          <path d={FIGURE.outlineLeft} strokeWidth={1.5} opacity={0.5} />
          <path d={FIGURE.mirror(FIGURE.outlineLeft)} strokeWidth={1.5} opacity={0.5} />
          {female && <path d="M112 470 C104 478 100 486 100 492 M288 470 C296 478 300 486 300 492" strokeWidth={1.2} opacity={0.3} />}
          {FIGURE.collarbones.map((d) => <path key={d} d={d} strokeWidth={1} opacity={0.25} />)}
          {FIGURE.ribs.map((d) => <path key={d} d={d} strokeWidth={0.9} opacity={0.14} />)}
          {FIGURE.hips.map((d) => <path key={d} d={d} strokeWidth={0.9} opacity={0.18} />)}
          {FIGURE.knees.map((d) => <path key={d} d={d} strokeWidth={0.9} opacity={0.2} />)}
          {/* faint organs for orientation */}
          {BODY_REGIONS.filter((r) => !r.systemWide && (!r.sex || (female ? r.sex === "female" : r.sex === "male"))).map((r) => r.paths.map((d, i) => <path key={`${r.id}${i}`} d={d} strokeWidth={r.hit === "stroke" ? 6 : 0.8} opacity={r.hit === "stroke" ? 0.06 : 0.16} />))}
        </g>
        {/* primary organ */}
        {primary && primary.paths.map((d, i) => <path key={i} d={d} fill={primary.hit === "fill" ? "var(--accent)" : "none"} fillOpacity={0.25} stroke="var(--accent)" strokeWidth={primary.hit === "stroke" ? 7 : 2} strokeOpacity={primary.hit === "stroke" ? 0.35 : 0.9} strokeLinecap="round" strokeLinejoin="round" />)}
        {/* arrows */}
        {sites.map((s, i) => {
          const to = s.a!.at;
          const st = TIER_STYLE[s.tier];
          const dx = to[0] - from[0], dy = to[1] - from[1];
          const len = Math.hypot(dx, dy) || 1;
          const bend = (i % 2 ? 1 : -1) * Math.min(90, 0.28 * len);
          const cx = (from[0] + to[0]) / 2 - (dy / len) * bend, cy = (from[1] + to[1]) / 2 + (dx / len) * bend;
          const tx = to[0] - (dx / len) * (st.r + 4), ty = to[1] - (dy / len) * (st.r + 4);
          return (
            <g key={s.region}>
              <path d={`M${from[0]},${from[1]} Q${cx},${cy} ${tx},${ty}`} fill="none" stroke="var(--accent)" strokeWidth={st.width} strokeOpacity={st.opacity} strokeDasharray={s.tier === "rare" ? "4 4" : undefined} markerEnd={`url(#sp-arrow-${spread.cancer})`} />
              <circle cx={to[0]} cy={to[1]} r={st.r} fill="var(--accent)" fillOpacity={0.12 + 0.12 * st.opacity} stroke="var(--accent)" strokeOpacity={st.opacity} strokeWidth={1.2} />
            </g>
          );
        })}
        {/* labels in the margins */}
        {!compact && sites.map((s, i) => {
          const to = s.a!.at;
          const side = to[0] < 200 ? "L" : "R";
          const lx = side === "L" ? 6 : W - 6;
          const ly = Math.max(40, Math.min(H - 20, to[1] + ((i % 3) - 1) * 12));
          return (
            <g key={`l${s.region}`} fontSize={11} fill="currentColor">
              <line x1={to[0] + (side === "L" ? -TIER_STYLE[s.tier].r : TIER_STYLE[s.tier].r)} y1={to[1]} x2={side === "L" ? 74 : W - 74} y2={ly} stroke="currentColor" strokeOpacity={0.25} strokeWidth={0.8} />
              <text x={lx} y={ly - 2} textAnchor={side === "L" ? "start" : "end"} fontWeight={600} fillOpacity={0.9}>{s.site.length > 26 ? s.site.slice(0, 25).trimEnd() + "…" : s.site}</text>
              <text x={lx} y={ly + 10} textAnchor={side === "L" ? "start" : "end"} fontSize={9.5} fillOpacity={0.6}>{s.tier}</text>
            </g>
          );
        })}
        {!compact && <text x={W / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="currentColor" fillOpacity={0.55}>{SPREAD_LABELS.caption}</text>}
      </svg>
    </div>
  );
}

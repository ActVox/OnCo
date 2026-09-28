import type { Cancer } from "@/lib/schema";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS, routeFor, type Kind } from "@/lib/kinds";
import { decisionsFor } from "@/lib/decisions";
import { ukPathwayFor } from "@/lib/uk-pathway";
import { compareSetFor } from "@/lib/cancer-compare";
import { toolsFor } from "@/lib/decision-tools";
import { geographyFor } from "@/lib/cancer-geography";
import { regimensFor } from "@/lib/regimens";
import { questionsFor } from "@/lib/questions";
import { redCardsForCancer } from "@/lib/red-cards";
import { paperQuery } from "@/lib/europepmc";
import { journeysForCancer } from "@/data/journeys";
import { organFor } from "@/data/organ-schematics";
import { spreadFor } from "@/data/spread";
import { modelsFor } from "@/data/preclinical-models";
import { familyRollup, rollupEstimate, type RollupKind } from "./cancer-rollup";

/**
 * The section model of a cancer record (docs/INFORMATION-ARCHITECTURE.md).
 *
 * A deep spike assembles one cancer from six data patches plus the decisions, UK, compared and tools pages, and the
 * record page grew into a long tabbed document (gallbladder 776 KB of markup, NSCLC 819 KB before this registry). The
 * registry fixes ten sections in an order that reads as a story, says which record fields and data patches each
 * draws from, and estimates the weight of each from the data alone, so that the same decision can be taken in three
 * places without rendering anything: the hub page (`/cancers/<id>/`) renders a section inline when it is small and
 * as a summary card with a "See all" link when it is not; the section route (`/cancers/<id>/<section>/`) exists only
 * for the sections that went to a page; and `/api/v1/cancers/<id>/sections.json` lists the same plan for agents.
 *
 * The threshold is a weight estimate, not a measurement: `INLINE_MAX_KB` of markup or `INLINE_MAX_ROWS` rows. The
 * budgets the plan must meet are measured by src/lib/record-sections.test.ts on the heaviest cancers.
 *
 * Anchors: every element id a section owns (`care`, `geography`, `centres`, ...) is listed here, so a link written
 * as `/cancers/<id>/#care` keeps working whether the section is inline (the hub carries the id) or on its own page
 * (the hub's section navigator forwards the hash to the section page; `anchorHref` gives the right address up front).
 * The tab ids of the previous layout (care, biology, history, changes, pipeline, trials, centres, questions,
 * relevant, key-papers, papers, notes) are anchors of the section they moved into.
 */
export const SECTION_IDS = ["overview", "what-it-is", "finding-it", "treating-it", "evidence", "science", "where-you-are", "living-with-it", "coming", "data"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export type SectionGlyphName = "compass" | "anatomy" | "magnifier" | "pill" | "flask" | "dna" | "pin" | "heart" | "rocket" | "braces";

/** A section's size, estimated from the record and the graph: items it lists and the markup they are likely to take. */
export type SectionEstimate = { rows: number; kb: number };
/** A count shown on the summary card and in sections.json ("48 trials"). */
export type SectionCount = { label: string; n: number };

type G = ReturnType<typeof graph>;

export type SectionDef = {
  id: SectionId;
  title: string;
  glyph: SectionGlyphName;
  /** One line under the title on the card and the section page, and in sections.json. */
  purpose: string;
  /** Cancer record fields the section reads (src/lib/schema.ts CancerSchema). */
  fields: readonly string[];
  /** Data patches and layers the section reads beyond the record: the spike files and libraries a deep dive writes into. */
  patches: readonly string[];
  /** Always inline on the hub, whatever its weight (the overview is the hub). */
  pinned?: boolean;
  /**
   * Always its own page, whatever the estimate. The three sections that are lists of other records (every connected
   * record, everything in development, the expert centres) took 285 KB of TNBC's 536 KB hub on 24 Sept 2026 and grow
   * with the corpus rather than with the record, so the hub carries their summary cards for every cancer.
   */
  alwaysPage?: boolean;
  /** Element ids inside the section: sub-headings, the tab ids of the previous layout, ids other pages link to. */
  anchors: readonly string[];
  /** Existing routes that belong to this section and keep their URLs (/cancers/<id>/decisions/, uk, compared, changes). */
  pages: readonly { slug: string; title: string; when: (c: Cancer, g: G) => boolean }[];
  counts: (c: Cancer, g: G) => SectionCount[];
  estimate: (c: Cancer, g: G) => SectionEstimate;
};

/** A section goes to its own page when its estimate passes either line. */
export const INLINE_MAX_KB = 60;
export const INLINE_MAX_ROWS = 40;
/** Markup budgets the plan must meet (whole page inside the layout), checked on the heaviest cancers. */
export const HUB_BUDGET_KB = 350;
export const SUBPAGE_BUDGET_KB = 600;
/** Long relation lists show this many records and an "and N more" link (ChipList, Neighbours, key papers, the pipeline's trials). */
export const NEIGHBOUR_CAP = 48;

const cap = (n: number) => Math.min(n, NEIGHBOUR_CAP);
const forCancerCount = (g: G, c: Cancer, k: Kind) => g.forCancer(c.id).get(k)?.length ?? 0;
const prevalenceRows = (g: G, c: Cancer) => { let n = 0; for (const t of g.kind("target")) for (const r of t.prevalence) if (r.cancerId === c.id) n++; return n; };
const keyPaperCount = (g: G, c: Cancer) => new Set([...(g.incoming(c.id).get("paper") ?? []).map((p) => p.id), ...c.keyPapers]).size;
const children = (g: G, c: Cancer) => g.kind("cancer").filter((x) => x.parent === c.id).length;
const pluralise = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);
/** The family roll-up count a section's card shows: what the subtypes hold and this record does not (src/lib/cancer-rollup.ts). */
const rolled = (g: G, c: Cancer, k: RollupKind, one: string): SectionCount => { const n = familyRollup(c, k, g).total; return { n, label: `${pluralise(n, one)} in the subtypes` }; };

export const SECTIONS: readonly SectionDef[] = [
  {
    id: "overview", title: "Overview", glyph: "compass", pinned: true,
    purpose: "The TL;DR, the family this cancer belongs to, the organ, who gets it and what the state of the art is.",
    fields: ["tldr", "simple", "summary", "stateOfArt", "burden", "group", "parent", "prognosis"],
    patches: ["spikes/<cancer>-core.ts", "data/organ-schematics.ts", "data/journeys.ts"],
    anchors: ["which-page", "state-of-the-art", "key-facts", "anatomy"],
    pages: [],
    counts: (c, g) => [{ n: children(g, c), label: pluralise(children(g, c), "subtype") }, { n: c.stateOfArt.length, label: "state-of-the-art points" }].filter((x) => x.n),
    estimate: (c, g) => { const routing = c.notes.filter((n) => /^Which page is mine/i.test(n)); return { rows: c.stateOfArt.length + children(g, c) + routing.length, kb: 30 + c.stateOfArt.length * 0.6 + children(g, c) * 0.3 + routing.reduce((n, t) => n + t.length / 1024, 0) + (organFor(c.id) ? 10 : 0) }; },
  },
  {
    id: "what-it-is", title: "What it is", glyph: "anatomy",
    purpose: "Anatomy, the subtypes and how they differ, how it is staged, and where advanced disease spreads.",
    fields: ["subtypes", "basics.staging", "parent"],
    patches: ["spikes/<cancer>-core.ts (subtype records)", "data/spread.ts", "data/organ-schematics.ts"],
    anchors: ["subtypes", "staging", "spread"],
    pages: [{ slug: "compared", title: "Compared with its neighbours", when: (c) => !!compareSetFor(c.id) }],
    counts: (c, g) => { const n = c.subtypes.length + children(g, c); const s = spreadFor(c.id)?.sites.length ?? 0; return [{ n, label: pluralise(n, "subtype") }, { n: c.basics?.staging.length ?? 0, label: "staging notes" }, { n: s, label: pluralise(s, "site of spread", "sites of spread") }].filter((x) => x.n); },
    estimate: (c, g) => { const s = spreadFor(c.id)?.sites.length ?? 0; const rows = c.subtypes.length + children(g, c) + (c.basics?.staging.length ?? 0) + s; return { rows, kb: 4 + rows * 0.6 + (s ? 10 : 0) }; },
  },
  {
    id: "finding-it", title: "Finding it", glyph: "magnifier",
    purpose: "How it shows itself, how it is confirmed, what screening exists, and the biomarkers clinicians test for.",
    fields: ["basics.symptoms", "basics.diagnosis", "biomarkers"],
    patches: ["spikes/<cancer>-core.ts (basics)", "target records' prevalence rows"],
    anchors: ["symptoms", "biology"],
    pages: [],
    counts: (c, g) => { const p = prevalenceRows(g, c); return [{ n: c.basics?.symptoms.length ?? 0, label: pluralise(c.basics?.symptoms.length ?? 0, "symptom") }, { n: c.biomarkers.length, label: pluralise(c.biomarkers.length, "biomarker") }, { n: p, label: "prevalence rows" }].filter((x) => x.n); },
    estimate: (c, g) => { const rows = (c.basics?.symptoms.length ?? 0) + (c.basics?.diagnosis.length ?? 0) + c.biomarkers.length + prevalenceRows(g, c); return { rows, kb: 3 + rows * 0.45 }; },
  },
  {
    id: "treating-it", title: "Treating it", glyph: "pill",
    purpose: "The standard of care by setting, the medicines, surgery and radiotherapy named in it, and the regimens behind them.",
    fields: ["standardOfCare"],
    patches: ["spikes/<cancer>-treatment.ts", "lib/regimens.ts", "lib/sequencing.ts", "lib/guidelines.ts", "lib/decisions.ts", "lib/uk-pathway.ts", "lib/decision-tools.ts"],
    anchors: ["care"],
    pages: [],
    counts: (c) => { const r = regimensFor(c.id).length; const d = decisionsFor(c.id); return [{ n: c.standardOfCare.length, label: pluralise(c.standardOfCare.length, "setting") }, { n: r, label: pluralise(r, "regimen") }, { n: d?.forks ?? 0, label: pluralise(d?.forks ?? 0, "decision with options", "decisions with options") }].filter((x) => x.n); },
    estimate: (c) => ({ rows: c.standardOfCare.length + regimensFor(c.id).length, kb: 8 + c.standardOfCare.length * 1.8 + (ukPathwayFor(c.id) ? 3 : 0) + (decisionsFor(c.id) ? 2 : 0) + (toolsFor(c.id).length ? 2 : 0) }),
  },
  {
    id: "evidence", title: "Evidence", glyph: "flask",
    purpose: "Trials recruiting now, the landmark trials, the trials held by this cancer's subtypes, the key papers and what they mean, the latest literature, and the milestones year by year.",
    fields: ["history", "keyPapers", "trials"],
    patches: ["spikes/<cancer>-evidence*.ts", "spikes/<cancer>-registry-trials.ts", "data/key-papers/", "Europe PMC (LatestPapers)", "lib/cancer-rollup.ts (family roll-up)"],
    anchors: ["trials", "landmark-trials", "subtype-trials", "key-papers", "papers", "history"],
    pages: [],
    counts: (c, g) => { const t = forCancerCount(g, c, "trial"); const p = keyPaperCount(g, c); return [{ n: t, label: pluralise(t, "trial") }, rolled(g, c, "trial", "trial"), { n: p, label: pluralise(p, "key paper") }, { n: c.history.length, label: pluralise(c.history.length, "milestone") }].filter((x) => x.n); },
    estimate: (c, g) => { const t = forCancerCount(g, c, "trial"); const p = keyPaperCount(g, c); const r = rollupEstimate(c, "trial", g); return { rows: t + p + c.history.length + r.rows, kb: 6 + cap(t) * 0.45 + cap(p) * 1.1 + c.history.length * 0.7 + (paperQuery(c) ? 4 : 0) + r.kb }; },
  },
  {
    id: "science", title: "The science", glyph: "dna",
    purpose: "The molecular landscape: the targets and how often each appears, the pathways, the mechanics stages and the preclinical models.",
    fields: ["targets", "pathways", "technologies"],
    patches: ["spikes/<cancer>-molecular.ts", "data/preclinical-models.ts", "data/mechanics-*.ts", "target records' prevalence rows"],
    anchors: ["targets", "prevalence", "pathways", "models"],
    pages: [],
    counts: (c, g) => { const t = forCancerCount(g, c, "target"); const p = forCancerCount(g, c, "pathway"); const m = modelsFor(c.id); const mn = m ? m.cellLines.length + m.gemms.length : 0; return [{ n: t, label: pluralise(t, "target") }, { n: p, label: pluralise(p, "pathway") }, { n: mn, label: "preclinical models" }].filter((x) => x.n); },
    estimate: (c, g) => { const rows = forCancerCount(g, c, "target") + forCancerCount(g, c, "pathway") + prevalenceRows(g, c); return { rows, kb: 4 + cap(forCancerCount(g, c, "target")) * 0.5 + cap(forCancerCount(g, c, "pathway")) * 0.5 + prevalenceRows(g, c) * 0.7 + (modelsFor(c.id) ? 2 : 0) }; },
  },
  {
    id: "where-you-are", title: "Where you are", glyph: "pin", alwaysPage: true,
    purpose: "Cases by country, the UK and NHS pathway and other country lenses, the expert centres with trials on record, and the centres named on this cancer's subtypes.",
    fields: ["institutions"],
    patches: ["spikes/<cancer>-geography.ts", "spikes/<cancer>-uk.ts", "lib/centre-table.ts", "lib/cancer-rollup.ts (family roll-up)", "GLOBOCAN (data/globocan-map.ts)"],
    anchors: ["geography", "uk", "centres", "subtype-centres"],
    pages: [{ slug: "uk", title: "UK and NHS", when: (c) => !!ukPathwayFor(c.id) }],
    counts: (c, g) => { const i = forCancerCount(g, c, "institution"); const uk = ukPathwayFor(c.id); const geo = geographyFor(c.id); return [{ n: i, label: pluralise(i, "centre") }, rolled(g, c, "institution", "centre"), { n: uk?.centres.length ?? 0, label: "UK centres" }, { n: geo?.regions.length ?? 0, label: "high-burden regions" }].filter((x) => x.n); },
    estimate: (c, g) => { const r = rollupEstimate(c, "institution", g); return { rows: forCancerCount(g, c, "institution") + (geographyFor(c.id)?.regions.length ?? 0) + r.rows, kb: (geographyFor(c.id) ? 130 : 12) + 6 + cap(forCancerCount(g, c, "institution")) * 1.6 + (ukPathwayFor(c.id) ? 4 : 0) + r.kb }; },
  },
  {
    id: "living-with-it", title: "Living with it", glyph: "heart",
    purpose: "The decisions you may face, the aids that walk through them, the warnings on record, the first sixty days and the questions to ask.",
    fields: ["standardOfCare (warnings)"],
    patches: ["spikes/<cancer>-living.ts", "lib/decisions.ts", "lib/decision-tools.ts", "lib/red-cards.ts", "lib/first-60-days.ts", "lib/questions.ts", "data/journeys.ts"],
    anchors: ["decisions", "tools", "red-cards", "journeys", "questions"],
    pages: [{ slug: "decisions", title: "Decisions", when: (c) => !!decisionsFor(c.id) }],
    counts: (c, g) => { const q = questionsFor(c).items.length; const r = redCardsForCancer(g, c).length; const t = toolsFor(c.id).length; return [{ n: q, label: pluralise(q, "question") }, { n: r, label: pluralise(r, "red card") }, { n: t, label: pluralise(t, "decision aid") }].filter((x) => x.n); },
    estimate: (c, g) => { const rows = questionsFor(c).items.length + redCardsForCancer(g, c).length + journeysForCancer(c.id).length + toolsFor(c.id).length; return { rows, kb: 10 + rows * 0.6 + (decisionsFor(c.id) ? 3 : 0) }; },
  },
  {
    id: "coming", title: "What is coming", glyph: "rocket", alwaysPage: true,
    purpose: "Everything in development, the medicines held by this cancer's subtypes, the open problems and what is being done about them, the roadmaps, and what changed on this record.",
    fields: ["pipeline", "openProblems", "roadmaps"],
    patches: ["spikes/<cancer>-evidence-roadmap.ts", "lib/cancer-changes.ts", "data/ideas*.ts", "lib/cancer-rollup.ts (family roll-up)", "Edge (lib/edge.ts)"],
    anchors: ["pipeline", "subtype-pipeline", "open-problems", "changes"],
    pages: [{ slug: "changes", title: "What changed", when: () => true }],
    counts: (c, g) => { const d = forCancerCount(g, c, "drug"); const t = g.incoming(c.id).get("trial")?.length ?? 0; const i = forCancerCount(g, c, "idea"); return [{ n: d, label: pluralise(d, "medicine") }, rolled(g, c, "drug", "medicine"), { n: t, label: pluralise(t, "trial") }, { n: i, label: pluralise(i, "idea") }, { n: c.openProblems.length, label: pluralise(c.openProblems.length, "open problem") }].filter((x) => x.n); },
    estimate: (c, g) => { const d = forCancerCount(g, c, "drug"); const t = g.incoming(c.id).get("trial")?.length ?? 0; const i = forCancerCount(g, c, "idea"); const r = rollupEstimate(c, "drug", g); const rows = d + t + i + c.pipeline.length + c.openProblems.length + r.rows; return { rows, kb: 18 + d * 0.9 + cap(t) * 0.35 + i * 0.4 + c.openProblems.length * 2 + r.kb }; },
  },
  {
    id: "data", title: "Data", glyph: "braces", alwaysPage: true,
    purpose: "Every connected record, the notes, the JSON, Markdown and RDF twins, and where the record came from and when it was checked.",
    fields: ["notes", "asOf", "links", "tags", "related"],
    patches: ["public/api/v1/entities/<id>.json", "public/api/v1/context/<id>.md", "public/api/v1/rdf/<id>.ttl", "lib/similar.ts"],
    anchors: ["relevant", "notes", "machine"],
    pages: [],
    counts: (c, g) => { let n = 0; for (const [k, l] of g.forCancer(c.id)) if (k !== "cancer") n += l.length; return [{ n, label: "connected records" }, { n: c.notes.filter((n) => !/^Which page is mine/i.test(n)).length, label: pluralise(c.notes.filter((n) => !/^Which page is mine/i.test(n)).length, "note") }].filter((x) => x.n); },
    estimate: (c, g) => { let chips = 0; for (const [k, l] of g.forCancer(c.id)) if (k !== "cancer") chips += cap(l.length); const notes = c.notes.filter((n) => !/^Which page is mine/i.test(n)).length; return { rows: chips + notes, kb: 12 + chips * 0.5 + notes * 0.5 }; },
  },
];

export const SECTION_BY_ID: Record<SectionId, SectionDef> = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<SectionId, SectionDef>;

export type Placement = "inline" | "page";
export type SectionPlan = {
  def: SectionDef;
  estimate: SectionEstimate;
  counts: SectionCount[];
  placement: Placement;
  /** The section's own route (exists only when placement is "page"). */
  route: string;
  /** Where a link to the section should go: the hub anchor when inline, the section page when not. */
  href: string;
  /** Sub-pages of this section that exist for this cancer, with their routes. */
  pages: Array<{ slug: string; title: string; route: string }>;
};

export const sectionRoute = (cancerId: string, id: SectionId) => `/cancers/${cancerId}/${id}/`;
export const hubRoute = (cancerId: string) => `/cancers/${cancerId}/`;

export function placementOf(def: SectionDef, est: SectionEstimate): Placement {
  if (def.pinned) return "inline";
  if (def.alwaysPage) return "page";
  return est.kb > INLINE_MAX_KB || est.rows > INLINE_MAX_ROWS ? "page" : "inline";
}

/** The plan for one cancer: every section in story order with its estimate, placement and addresses. */
export function sectionPlan(c: Cancer, g: G = graph()): SectionPlan[] {
  const hub = routeFor(c);
  return SECTIONS.map((def) => {
    const estimate = def.estimate(c, g);
    const placement = placementOf(def, estimate);
    const route = sectionRoute(c.id, def.id);
    return {
      def, estimate, counts: def.counts(c, g), placement, route,
      href: placement === "inline" ? `${hub}#${def.id}` : route,
      pages: def.pages.filter((p) => p.when(c, g)).map((p) => ({ slug: p.slug, title: p.title, route: `${hub}${p.slug}/` })),
    };
  });
}

export function planFor(c: Cancer, id: SectionId, g: G = graph()): SectionPlan {
  return sectionPlan(c, g).find((p) => p.def.id === id)!;
}

/** The section that owns an element id (a section id, a sub-heading id or a tab id of the previous layout), if any. */
export function sectionForAnchor(anchor: string): SectionDef | undefined {
  const a = anchor.replace(/^sec-/, "");
  return SECTIONS.find((s) => s.id === a) ?? SECTIONS.find((s) => s.anchors.includes(a));
}

/** The address of `#anchor` on a cancer: the hub when the owning section is inline there, else the section page. */
export function anchorHref(c: Cancer, anchor: string, g: G = graph()): string {
  const def = sectionForAnchor(anchor);
  const hub = routeFor(c);
  if (!def) return `${hub}#${anchor}`;
  const plan = planFor(c, def.id, g);
  const hash = anchor.replace(/^sec-/, "");
  return plan.placement === "inline" ? `${hub}#${hash}` : `${plan.route}#${hash}`;
}

/** `anchorHref` by cancer id, for code that holds only a compact cancer object; a non-cancer id gets the plain hub hash. */
export function cancerAnchorHref(cancerId: string, anchor: string, g: G = graph()): string {
  const c = g.get(cancerId);
  return c && c.kind === "cancer" ? anchorHref(c, anchor, g) : `${hubRoute(cancerId)}#${anchor.replace(/^sec-/, "")}`;
}

/**
 * Hash to address, for every anchor the hub does not carry itself: the section navigator reads this on load and
 * forwards a reader who arrived at `/cancers/<id>/#care` when Treating it lives on its own page. Anchors of inline
 * sections are left out (the hub has the element), and the `sec-` form of each id is included because earlier
 * links were written that way.
 */
export function forwardedAnchors(c: Cancer, g: G = graph()): Record<string, string> {
  const out: Record<string, string> = {};
  for (const p of sectionPlan(c, g)) {
    if (p.placement !== "page") continue;
    for (const a of [p.def.id, ...p.def.anchors]) { out[a] = `${p.route}#${a}`; out[`sec-${a}`] = `${p.route}#${a}`; }
  }
  return out;
}

/** Static params for /cancers/[id]/[section]/: only the sections that went to a page. */
export function pagedSectionParams(g: G = graph()): Array<{ id: string; section: SectionId }> {
  const out: Array<{ id: string; section: SectionId }> = [];
  for (const c of g.kind("cancer")) for (const p of sectionPlan(c, g)) if (p.placement === "page") out.push({ id: c.id, section: p.def.id });
  return out;
}

/** The JSON companion at /api/v1/cancers/<id>/sections.json: the plan with routes and counts, for agents. */
export function sectionsJson(c: Cancer, g: G = graph()): Record<string, unknown> {
  const plan = sectionPlan(c, g);
  return {
    id: c.id, name: c.name, route: routeFor(c), asOf: c.asOf,
    thresholds: { inlineMaxKb: INLINE_MAX_KB, inlineMaxRows: INLINE_MAX_ROWS },
    sections: plan.map((p) => ({
      id: p.def.id, title: p.def.title, purpose: p.def.purpose, placement: p.placement,
      route: p.placement === "page" ? p.route : null, href: p.href,
      anchors: p.def.anchors.map((a) => `${p.placement === "page" ? p.route : routeFor(c)}#${a}`),
      counts: Object.fromEntries(p.counts.map((x) => [x.label, x.n])),
      estimate: { rows: p.estimate.rows, kb: Math.round(p.estimate.kb) },
      fields: p.def.fields, patches: p.def.patches,
      pages: p.pages,
    })),
    machine: { json: `/api/v1/entities/${c.id}.json`, markdown: `/api/v1/context/${c.id}.md`, turtle: `/api/v1/rdf/${c.id}.ttl` },
  };
}

/** Plain-text lines for the record's Markdown context file. */
export function sectionsContextLines(c: Cancer, g: G = graph(), site = "https://onco.cc"): string[] {
  return sectionPlan(c, g).map((p) => `- ${p.def.title} (${p.placement === "page" ? "own page" : "on the hub"}): ${p.def.purpose} ${site}${p.href}${p.counts.length ? ` [${p.counts.map((x) => `${x.n} ${x.label}`).join(", ")}]` : ""}`);
}

/** Kind tables with a cancer facet, for "and N more" links out of a capped list. */
export function cancerTableHref(k: Kind, cancerName: string): string {
  const facet = k === "trial" || k === "paper" ? "cancers" : undefined;
  return facet ? `/${KIND_META[k].route}/?${facet}=${encodeURIComponent(cancerName)}` : `/${KIND_META[k].route}/`;
}

export const KINDS_IN_ORDER = KINDS;

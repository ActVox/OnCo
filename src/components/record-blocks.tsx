import Link from "next/link";
import type { ReactNode } from "react";
import type { Entity, Paper } from "@/lib/schema";
import { routeFor } from "@/lib/kinds";
import { graph } from "@/lib/graph";
import { statusClass } from "@/lib/text";
import { ChipList } from "./ui";
import { LayerAware } from "./LayerAware";
import { SummaryText } from "./SummaryText";
import { ReadMore, splitSummary } from "./ReadMore";
import { summaryTranslationsFor } from "@/lib/summary-translations";
import { EN_TEXT } from "@/lib/translate";
import { TL } from "./T";
import { Tip } from "./Tip";
import { withTermHovers } from "@/lib/term-hover";
import { CitationChip, CitationChipDefs } from "./CitationChip";
import { LatestPapers } from "./LatestPapers";
import { PaperTrend } from "./PapersPulse";
import { paperQuery } from "@/lib/europepmc";
import { toolsFor, toolRoute } from "@/lib/decision-tools";
import { compareRoute, compareSetFor } from "@/lib/cancer-compare";
import { ToolGlyph } from "./ToolGlyph";
import { NEIGHBOUR_CAP, cancerTableHref } from "@/lib/record-sections";
import { SupportiveMark } from "./SupportivePill";
import { splitSupportive } from "@/lib/supportive-care";

/**
 * Building blocks shared by the record page (EntityDetail) and the cancer sections (CancerRecord): a labelled
 * field, a titled block, the long summary, reference chips, linked bullet lists, the key-paper cards, the live
 * literature panel and the decision-aid strip. Server components; labels and titles are English source strings
 * translated on the client through the chrome dictionary (`TL`).
 */

export function Refs({ ids }: { ids: string[] }) {
  const g = graph();
  const items = ids.map((id) => g.get(id)).filter((x): x is Entity => !!x);
  return <ChipList items={items} />;
}

/**
 * References on a standard-of-care row: treatments and technologies as chips, supportive care medicines (bone agents,
 * growth factors, antiemetics) on their own muted line with the supportive glyph, so they never read as the treatment.
 */
export function SocRefs({ ids }: { ids: string[] }) {
  if (!ids.length) return null;
  const { treatments: tr, supportive: sp } = splitSupportive(graph(), ids);
  return (<>
    {tr.length > 0 && <div className="mt-2"><Refs ids={tr} /></div>}
    {sp.length > 0 && <div className="mt-2 flex flex-wrap items-center gap-1.5" data-supportive-refs><SupportiveMark /><Refs ids={sp} /></div>}
  </>);
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  if (children === undefined || children === null || children === "" || (Array.isArray(children) && children.length === 0)) return null;
  return (
    <div className="min-w-0">
      <div className="kicker mb-1"><TL text={label} /></div>
      <div {...EN_TEXT} className="text-[15px] leading-relaxed">{children}</div>
    </div>
  );
}

/** A titled block inside a section. `id` makes it a deep-link target (`scroll-mt-28` keeps it clear of the sticky bars). */
export function Block({ title, children, aside, id }: { title?: string; children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <section id={id} className={`mt-8 first:mt-0 ${id ? "scroll-mt-28" : ""}`}>
      {title && <div className="flex items-baseline justify-between gap-4 mb-3"><h2 className="text-lg font-semibold tracking-tight"><TL text={title} /></h2>{aside}</div>}
      {children}
    </section>
  );
}

/**
 * The long summary. The server renders the English with lang="en"; when the reader's language has a cached machine
 * translation whose hash matches this English (public/i18n/summaries), SummaryText swaps it in client-side, marked as
 * machine translated with a report link and a toggle back to the English.
 *
 * A summary over 1,800 characters shows its opening and folds the rest behind a "Read more" so the sections below
 * are reachable; `ReadMore.tsx` holds the rule and the measurements behind it.
 */
export const Summary = ({ e }: { e: Entity }) => {
  const { lead, rest } = splitSummary(e.summary);
  const para = (p: string, i: number) => <p key={i}>{withTermHovers(p, { skipId: e.id })}</p>;
  return (
    <LayerAware>
      <SummaryText e={{ kind: e.kind, id: e.id, name: e.name }} translations={summaryTranslationsFor(e)}>
        <div {...EN_TEXT} className="prose-onco text-[15px] leading-relaxed max-w-3xl">
          {lead.map(para)}
          {rest.length > 0 && <ReadMore count={rest.length}>{rest.map(para)}</ReadMore>}
        </div>
      </SummaryText>
    </LayerAware>
  );
};

/**
 * Bullet list where any object we have a page for becomes a link: the leading name (before a colon, dash or
 * bracket) is matched against target, term, technology, drug and cancer names and aliases; the rest of the
 * sentence gets glossary hovers.
 */
export function LinkedBullets({ items, skipId }: { items: string[]; skipId?: string }) {
  const g = graph();
  const index = new Map<string, Entity>();
  for (const k of ["target", "term", "technology", "drug", "cancer", "pathway"] as const) for (const x of g.kind(k)) { index.set(x.name.toLowerCase(), x); for (const a of x.aka) index.set(a.toLowerCase(), x); const bare = x.name.replace(/\s*\(.*?\)\s*$/, "").toLowerCase(); if (!index.has(bare)) index.set(bare, x); }
  const find = (label: string): Entity | undefined => {
    const l = label.trim().toLowerCase();
    return index.get(l) ?? index.get(l.replace(/-positive$|-negative$|\+$|-$/g, "").trim()) ?? [...index.entries()].find(([k]) => k.length > 3 && (l === k || l.startsWith(k + " ") || l.endsWith(" " + k)))?.[1];
  };
  return (
    <ul className="list-disc ps-5 space-y-1.5 text-[15px] leading-relaxed">
      {items.map((it, i) => {
        const m = it.match(/^([^:–—(]+?)\s*([:–—(].*)?$/);
        const head = m?.[1] ?? it, rest = m?.[2] ?? "";
        const e = find(head);
        return <li key={i}>{e && e.id !== skipId ? <Tip title={e.name} text={e.tldr} href={routeFor(e)}><Link href={routeFor(e)} className="font-medium underline decoration-dotted decoration-foreground/30 underline-offset-[3px] hover:decoration-foreground">{head}</Link></Tip> : <span className="font-medium">{withTermHovers(head, { skipId })}</span>}{rest && <span className="text-foreground/85"> {withTermHovers(rest.replace(/^\s*/, ""), { skipId })}</span>}</li>;
      })}
    </ul>
  );
}

/** Key papers in the corpus that cite this object, newest first, capped at NEIGHBOUR_CAP with a link to the rest. */
export function keyPapersFor(e: Entity): Paper[] {
  const g = graph();
  return [...new Map([...(g.incoming(e.id).get("paper") ?? []), ...e.keyPapers.map((id) => g.get(id)).filter((x): x is Entity => !!x)].map((p) => [p.id, p])).values()].filter((p): p is Paper => p.kind === "paper").sort((a, b) => b.year - a.year);
}

/**
 * How many key papers a record shows as cards. Beyond this the section leads with the newest PAPER_CARDS as cards
 * and lists the rest as reference pills: one link each, no journal line, no what-it-means, no citation count, so the
 * section's markup grows by a pill per paper rather than by a card (a roadmap with 42 key papers spent 44 KB of its
 * 300 KB budget on them, and every weekly citation refresh added to it). Each pill still names its paper and links
 * to its page, so crawlers and readers without JavaScript reach every one.
 */
export const PAPER_CARDS = 8;

export function KeyPapers({ e, all }: { e: Entity; all: Paper[] }) {
  const papers = all.length > NEIGHBOUR_CAP ? all.slice(0, NEIGHBOUR_CAP) : all;
  const cards = papers.length > PAPER_CARDS ? papers.slice(0, PAPER_CARDS) : papers;
  const rest = papers.slice(cards.length);
  return (<>
    <div className="grid *:min-w-0 gap-3 md:grid-cols-2">{papers.length < all.length && <p className="md:col-span-2 text-sm text-muted">The {papers.length} most recent of {all.length} papers; <Link href={e.kind === "cancer" ? cancerTableHref("paper", e.name) : "/papers/"} className="underline" data-more>see them all →</Link></p>}
      {cards.length > 0 && <CitationChipDefs />}
      {cards.map((p) => (
      <Link key={p.id} href={routeFor(p)} className="card p-4 hover:shadow-md transition">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted mb-1"><span className="chip bg-foreground/5">{p.paperType.replace(/-/g, " ")}</span><span>{p.journal} {p.year}</span>{p.changedPractice && <span className={`chip ${statusClass("approved")}`}>changed practice</span>}<CitationChip id={p.id} sprite /></div>
        <div className="font-medium leading-snug">{p.name}</div>
        <p className="text-sm text-muted mt-1 line-clamp-3">{p.whatItMeans}</p>
      </Link>))}</div>
    {rest.length > 0 && <div className="mt-3" data-paper-refs>
      <div className="kicker mb-1.5">{rest.length} more, oldest last</div>
      <ChipList items={rest} />
    </div>}
  </>);
}

/** Live literature: what the world is publishing about this object, from Europe PMC, plus the weekly-refreshed trend; null when no query can be built. */
export function LatestLiterature({ e }: { e: Entity }) {
  if (!["drug", "target", "cancer", "technology"].includes(e.kind)) return null;
  const q = paperQuery(e);
  if (!q) return null;
  return <div className="space-y-4"><PaperTrend id={e.id} /><LatestPapers query={q} title={e.name} kind={e.kind} /></div>;
}

/** Decision aids and side-by-side comparisons keyed to this record (src/lib/decision-tools.ts, src/lib/cancer-compare.ts): one pill each, with a glyph. */
export function ToolsStrip({ e, id }: { e: Entity; id?: string }) {
  const tools = toolsFor(e.id);
  const compare = compareSetFor(e.id);
  if (!tools.length && !compare) return null;
  return (
    <div id={id} className={`card p-4 mb-4 ${id ? "scroll-mt-28" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="kicker inline-flex items-center gap-1.5"><ToolGlyph name="compass" className="h-3.5 w-3.5" /><TL text="Decision aids" /></div>
        <Link href="/tools/" className="text-sm text-accent hover:underline">All decision aids →</Link>
      </div>
      <p className="text-sm text-muted mb-2">Answer a few questions from a report and read the guideline statement that applies, quoted word for word with its source. Educational aids to prepare for an appointment, not advice.</p>
      <div className="flex flex-wrap gap-1.5">
        {tools.map((t) => <Link key={t.id} href={toolRoute(t.id)} className="chip border bg-accent-soft border-accent/40 text-accent text-sm hover:bg-foreground/5 inline-flex items-center gap-1.5" title={t.title}><ToolGlyph name={t.icon} className="h-3.5 w-3.5" />{t.short}</Link>)}
        {compare && <Link href={compareRoute(compare.anchorId)} className="chip border border-border bg-card text-sm hover:bg-foreground/5 inline-flex items-center gap-1.5" title={compare.title}><ToolGlyph name="layers" className="h-3.5 w-3.5" />Compared with {compare.ids.length - 1} neighbouring cancers</Link>}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import type { Cancer, Entity } from "@/lib/schema";
import { KIND_META, routeFor, type Kind } from "@/lib/kinds";
import { graph } from "@/lib/graph";
import { ChipList } from "./ui";
import { TL } from "./T";
import { Tip } from "./Tip";
import { withTermHovers } from "@/lib/term-hover";
import { Block, Field, KeyPapers, keyPapersFor, LatestLiterature, LinkedBullets, Refs, SocRefs, Summary, ToolsStrip } from "./record-blocks";
import { SectionGlyph } from "./SectionGlyph";
import type { Tab } from "./Tabs";
import { NEIGHBOUR_CAP, SECTIONS, cancerTableHref, sectionPlan, type SectionId, type SectionPlan } from "@/lib/record-sections";
import { decisionsFor, decisionsRoute } from "@/lib/decisions";
import { ukPathwayFor, ukPathwayRoute } from "@/lib/uk-pathway";
import { compareSetFor } from "@/lib/cancer-compare";
import { ToolGlyph } from "./ToolGlyph";
import { conditionQuery } from "@/lib/ctgov";
import { TrialFinderGeo as TrialFinder } from "./TrialFinderGeo";
import { Questions } from "./Questions";
import { ExpertCentres } from "./ExpertCentres";
import { CancerPrevalence } from "./PrevalenceTable";
import { GuidelineChip } from "./GuidelineChip";
import { SurvivalDisclosure } from "./SurvivalDisclosure";
import { CountryCasesMini } from "./CountryCasesMini";
import { CancerGeographySection } from "./CancerGeographySection";
import { geographyFor } from "@/lib/cancer-geography";
import { CancerIcon } from "./CancerIcon";
import { RouteIcon } from "./RouteIcon";
import { RedCardsStrip } from "./RedCardsStrip";
import { ChangesPreview, FollowLine } from "./CancerChanges";
import { changesForCancer, splitUpcoming } from "@/lib/cancer-changes";
import { similarLinks } from "@/lib/similar";
import { familyStrip } from "@/lib/cancer-families";
import { Neighbours } from "./Neighbours";
import { OrganSchematic } from "./OrganSchematic";
import { SpreadMap } from "./SpreadMap";
import { spreadFor, SPREAD_LABELS } from "@/data/spread";
import { GentleSection } from "./GentleSection";
import { WhatIsBeingDone, WhatIsBeingDoneFor } from "./WhatIsBeingDone";
import { journeysForCancer } from "@/data/journeys";
import { organFor } from "@/data/organ-schematics";
import { regimensFor } from "@/lib/regimens";
import { guidelineCancerIds } from "@/lib/guidelines";
import { modelsFor } from "@/data/preclinical-models";
import { CancerPipeline } from "./CancerPipeline";
import { FamilyRollup } from "./FamilyRollup";
import { Bullets } from "./ui";
import { machineRoutes } from "@/lib/seo";

/**
 * A cancer record as ten sections (src/lib/record-sections.ts). `cancerTabs` builds the hub page: each section is
 * a tab of the section navigator; an inline section renders in full, a section that went to its own page renders
 * as a summary card (counts, the first items, "See all") and its tab links to `/cancers/<id>/<section>/`.
 * `CancerSection` renders one section in full for that page. Both read the same plan, so the hub, the pages and
 * /api/v1/cancers/<id>/sections.json never disagree about where a section lives.
 *
 * Every block that another page may deep-link to carries a stable id (the section's `anchors` in the registry):
 * `care`, `geography`, `centres`, `trials`, `history`, `changes`, `pipeline`, `questions`, `relevant`, `biology`,
 * `key-papers`, `papers`, `notes` are the tab ids of the previous layout and keep resolving.
 */

const HUB_LABEL: Record<SectionId, string> = Object.fromEntries(SECTIONS.map((s) => [s.id, s.title])) as Record<SectionId, string>;

export function cancerTabs(c: Cancer): Tab[] {
  const g = graph();
  const plan = sectionPlan(c, g);
  return plan.map((p) => ({
    id: p.def.id,
    label: HUB_LABEL[p.def.id],
    glyph: p.def.glyph,
    href: p.placement === "page" ? p.route : undefined,
    content: p.placement === "page" ? <SectionCard c={c} plan={p} /> : <CancerSection c={c} id={p.def.id} plan={p} />,
  }));
}

/** The strip for a section page or one of the older sub-pages (decisions, uk, compared, changes): every section, the current one highlighted, the rest linking to the hub anchor or their own page. */
export function cancerStripTabs(c: Cancer, current: SectionId, content?: ReactNode): Tab[] {
  const g = graph();
  return sectionPlan(c, g).map((p) => ({
    id: p.def.id,
    label: HUB_LABEL[p.def.id],
    glyph: p.def.glyph,
    href: p.def.id === current ? undefined : p.href,
    content: p.def.id === current ? content : undefined,
  }));
}

/* ------------------------------------------------------------------------------------------------------------ */

const short = (name: string) => name.replace(/\s*\(.*?\)\s*$/, "");


/** Notes that answer "which of these pages is mine?". Written to this convention by the family core layers. */
export const ROUTING_NOTE = /^Which page is mine/i;
const routingNotes = (c: Cancer) => c.notes.filter((n) => ROUTING_NOTE.test(n));

const FAMILY_CHIP = "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-sm hover:border-accent hover:bg-accent-soft";
const FamilyChip = ({ x }: { x: Cancer | Entity }) => <Link href={routeFor(x)} className={FAMILY_CHIP}><CancerIcon cancerId={x.id} className="h-4 w-4 shrink-0" /><span>{x.name}</span></Link>;

/**
 * Subtypes with pages of their own, and the broader type this one belongs to, shown before anything else on a
 * cancer page. The parent chip is always visible; the children are the six the corpus holds most for, deepest
 * first, and any others sit behind a fold (`src/lib/cancer-families.ts` has both measures and why).
 *
 * The fold is a plain `<details>`: the chips behind it are in the markup, so a crawler and a reader with no
 * JavaScript have them, and find-in-page opens the fold to reach them in browsers that support that. The saving
 * is the reader's attention, not bytes.
 */
function CancerFamily({ c }: { c: Cancer }) {
  const g = graph();
  const { parent, shown, folded } = familyStrip(c, g);
  const map = <Link href="/cancers/map/" title="Every cancer type on one layered map: organ system, cancer, subtype" className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-sm text-muted hover:border-accent hover:text-accent"><RouteIcon href="/cancers/map/" className="h-3.5 w-3.5 shrink-0" /><span>See the whole map</span></Link>;
  if (!shown.length && !parent) return <div className="mb-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Related cancer types">{map}</div>;
  return (
    <div className="mb-6 text-sm" aria-label="Related cancer types" data-family>
      <div className="flex flex-wrap items-center gap-2">
        {parent && <><span className="text-muted">Part of</span><FamilyChip x={parent} /></>}
        {shown.length > 0 && <><span className="text-muted">{parent ? "Types" : `Types of ${short(c.name)}`}</span>{shown.map((x) => <FamilyChip key={x.id} x={x} />)}</>}
        {map}
      </div>
      {folded.length > 0 && (
        <details className="group mt-2" data-fold="family">
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-sm text-muted hover:border-accent hover:text-accent">
            <span aria-hidden className="transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90">▸</span>
            <span className="group-open:hidden">{folded.length} more {folded.length === 1 ? "type" : "types"}</span>
            <span className="hidden group-open:inline">Fewer types</span>
          </summary>
          <div className="mt-2 flex flex-wrap items-center gap-2">{folded.map((x) => <FamilyChip key={x.id} x={x} />)}</div>
        </details>
      )}
    </div>
  );
}

/** Held back on 21 Sept 2026 at the owner's request until the wording has been reviewed; flip SHOW_OUTLOOK to publish. */
const SHOW_OUTLOOK = false;
function CancerOutlook({ c }: { c: Cancer }) {
  const p = c.prognosis;
  if (!p || !SHOW_OUTLOOK) return null;
  const sources = p.sources.length > 0 && (
    <span className="text-xs text-muted">Sources: {p.sources.map((s, i) => <span key={s.url}>{i > 0 && ", "}<a href={s.url} className="underline" rel="noopener noreferrer">{s.label}</a></span>)}</span>
  );
  return (
    <Block title="Outlook" aside={sources}>
      <div className="text-[15px] leading-relaxed"><SurvivalDisclosure text={p.text} skipId={c.id} /></div>
      <p className="text-xs text-muted mt-2"><Link href="/survival/" className="underline">Five-year survival by stage for every cancer →</Link></p>
    </Block>
  );
}

const Sources = ({ list }: { list: Array<{ url: string; label: string }> }) => list.length > 0 ? (
  <span className="text-xs text-muted">Sources: {list.map((s, i) => <span key={s.url}>{i > 0 && ", "}<a href={s.url} className="underline" rel="noopener noreferrer">{s.label}</a></span>)}</span>
) : null;

/** The decisions a patient faces, one per standard-of-care setting, linking into the cancer's decision page (roadmap item 107). */
function DecisionsStrip({ c, id }: { c: Cancer; id?: string }) {
  const d = decisionsFor(c.id);
  if (!d) return null;
  return (
    <div id={id} className={`card p-4 mb-4 ${id ? "scroll-mt-28" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="kicker inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 3v6c0 3 3 4 6 4s6-1 6-4V3" /><path d="M12 13v8" /><circle cx="6" cy="3" r="1.5" /><circle cx="18" cy="3" r="1.5" /><circle cx="12" cy="21" r="1.5" /></svg><TL text="Decisions you may face" /></div>
        <Link href={decisionsRoute(c.id)} className="text-sm text-accent hover:underline">{d.forks} with more than one option · full decision page →</Link>
      </div>
      <p className="text-sm text-muted mb-2">One section per setting: the options named, what each is for, the trials behind them, the recorded trade-offs and the questions to ask.</p>
      <div className="flex flex-wrap gap-1.5">
        {d.sections.map((s) => <Link key={s.id} href={decisionsRoute(c.id, s.id)} className={`chip border text-sm hover:bg-foreground/5 ${s.singlePath ? "bg-card border-border" : "bg-accent-soft border-accent/40 text-accent"}`} title={s.singlePath ? "One path named" : `${s.options.length} options`}>{s.setting}{!s.singlePath && <span className="ms-1 text-[10px] tabular-nums">{s.options.length}</span>}</Link>)}
      </div>
    </div>
  );
}

/** The UK and NHS layer: pathway standards, HPB centres, NICE and SMC decisions, Test Directory codes, UK trials; one pill row linking into /cancers/<id>/uk/. */
function UkPathwayStrip({ c, id }: { c: Cancer; id?: string }) {
  const p = ukPathwayFor(c.id);
  if (!p) return null;
  const sections: Array<[string, string]> = [["pathway", "Your NHS pathway"], ["centres", `${p.centres.length} specialist centres`], ["funding", `${p.funding.length} lines of treatment`], ["tests", `${p.tests.length} tests to ask for`], ["trials", `${p.trials.length} UK trials`], ["nations", "Four nations"]];
  return (
    <div id={id} className={`card p-4 mb-4 ${id ? "scroll-mt-28" : ""}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div className="kicker inline-flex items-center gap-1.5"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 7v10M7 12h10" /></svg><TL text="UK and NHS" /></div>
        <Link href={ukPathwayRoute(c.id)} className="text-sm text-accent hover:underline">Checked {p.asOf} · full UK and NHS page →</Link>
      </div>
      <p className="text-sm text-muted mb-2">Waiting-time standards, the specialist centres, what NICE and the SMC fund by line of treatment, the National Genomic Test Directory codes, the trials open in the UK and the differences across the four nations.</p>
      <div className="flex flex-wrap gap-1.5">
        {sections.map(([sid, label]) => <Link key={sid} href={ukPathwayRoute(c.id, sid)} className="chip border border-border bg-card text-sm hover:bg-foreground/5">{label}</Link>)}
      </div>
    </div>
  );
}

/** A row of pills to related pages, each with a glyph. */
function PillRow({ items, label }: { items: Array<{ href: string; text: string; glyph?: ReactNode; title?: string; accent?: boolean }>; label: string }) {
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-4" aria-label={label}>
      {items.map((it) => <Link key={it.href} href={it.href} title={it.title} className={`chip border text-sm hover:bg-foreground/5 inline-flex items-center gap-1.5 ${it.accent ? "bg-accent-soft border-accent/40 text-accent" : "bg-card border-border"}`}>{it.glyph}{it.text}</Link>)}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------ */

/** One section of a cancer record in full. `plan` is the section's entry in the plan (for the sub-page pills). */
export function CancerSection({ c, id, plan }: { c: Cancer; id: SectionId; plan?: SectionPlan }) {
  const g = graph();
  const p = plan ?? sectionPlan(c, g).find((x) => x.def.id === id)!;
  const forMe = g.forCancer(c.id);
  const pages = p.pages.map((pg) => ({ href: pg.route, text: `${pg.title} →`, accent: true, glyph: <SectionGlyph name={p.def.glyph} className="h-3.5 w-3.5" /> }));
  switch (id) {
    case "overview": return (<>
      <CancerFamily c={c} />
      {routingNotes(c).length > 0 && (
        <Block id="which-page" title="Which page is mine?">
          <Bullets items={routingNotes(c)} linked={(t) => withTermHovers(t, { skipId: c.id })} />
        </Block>
      )}
      <Summary e={c} />
      <Block id="state-of-the-art" title="State of the art"><SurvivalDisclosure items={c.stateOfArt} skipId={c.id} /></Block>
      <CancerOutlook c={c} />
      <div id="key-facts" className="grid *:min-w-0 gap-6 sm:grid-cols-2 mt-8 scroll-mt-28">
        <Field label="Who gets it and what has changed"><SurvivalDisclosure text={c.burden} skipId={c.id} /></Field>
        <Field label="Group"><Tip title={`${c.group[0].toUpperCase()}${c.group.slice(1)} cancers`} text={`All ${c.group} cancers in OnCo, filtered in the cancers table.`} href={`/cancers/?group=${encodeURIComponent(c.group[0].toUpperCase() + c.group.slice(1))}`}><Link className="capitalize underline decoration-dotted decoration-foreground/30 underline-offset-[3px]" href={`/cancers/?group=${encodeURIComponent(c.group[0].toUpperCase() + c.group.slice(1))}`}>{c.group}</Link></Tip></Field>
      </div>
      {organFor(c.id) && <Block id="anatomy" title="Anatomy and lymph node drainage"><OrganSchematic cancerId={c.id} /></Block>}
    </>);

    case "what-it-is": return (<>
      <PillRow label="More on what it is" items={[...pages, { href: `/staging/#${c.id}`, text: "Staging and risk scores →", glyph: <ToolGlyph name="layers" className="h-3.5 w-3.5" /> }, ...(compareSetFor(c.id) ? [] : [])]} />
      <Block id="subtypes" title="Subtypes">{c.subtypes.length ? <LinkedBullets items={c.subtypes} skipId={c.id} /> : <p className="text-sm text-muted">No subtypes recorded beyond the ones named in the family strip above.</p>}</Block>
      {(c.basics?.staging.length ?? 0) > 0 && <Block id="staging" title="How it is staged" aside={<Sources list={c.basics!.sources} />}><LinkedBullets items={c.basics!.staging} skipId={c.id} /></Block>}
      {spreadFor(c.id) && (
        <GentleSection id="spread" className="mt-8 scroll-mt-28" title={SPREAD_LABELS.fold} why={SPREAD_LABELS.why} reassurance={SPREAD_LABELS.reassurance} kicker={<TL text="Advanced disease" />}>
          <div className="grid *:min-w-0 gap-6 lg:grid-cols-[300px_1fr]">
            <div className="card p-3"><SpreadMap spread={spreadFor(c.id)!} cancerName={c.name} /></div>
            <div className="space-y-4">
              <WhatIsBeingDone topic="spread" cancerId={c.id} compact />
              <ol className="space-y-2 text-sm">{spreadFor(c.id)!.sites.map((s) => <li key={s.region} className="card p-3"><div className="flex items-baseline justify-between gap-2"><span className="font-medium">{s.site}</span><span className="chip bg-foreground/5">{s.tier}</span></div>{(s.pct || s.note) && <p className="text-muted mt-1">{[s.pct, s.note].filter(Boolean).join(". ")}.</p>}</li>)}</ol>
            </div>
          </div>
          <p className="text-xs text-muted mt-2"><Link href={`/atlas/spread/#${c.id}`} className="underline">All cancers side by side</Link></p>
        </GentleSection>
      )}
    </>);

    case "finding-it": { const b = c.basics; return (<>
      {b && (b.symptoms.length > 0 || b.diagnosis.length > 0) && (
        <Block id="symptoms" title="Symptoms and diagnosis" aside={<Sources list={b.sources} />}>
          <div className="grid *:min-w-0 gap-6 sm:grid-cols-2">
            {b.symptoms.length > 0 && <Field label="How it shows"><LinkedBullets items={b.symptoms} skipId={c.id} /></Field>}
            {b.diagnosis.length > 0 && <Field label="How it is confirmed"><LinkedBullets items={b.diagnosis} skipId={c.id} /></Field>}
          </div>
        </Block>
      )}
      <div className="mt-6"><WhatIsBeingDone topic="late-diagnosis" cancerId={c.id} compact /></div>
      <Block id="biology" title="Biomarkers clinicians test">{c.biomarkers.length ? <LinkedBullets items={c.biomarkers} skipId={c.id} /> : <p className="text-sm text-muted">No biomarker panel is recorded for this cancer yet.</p>}<p className="text-xs text-muted mt-3"><Link href="/tumour-testing/" className="underline">What each tumour test looks for →</Link> · <Link href="/biomarker-matrix/" className="underline">Biomarker matrix →</Link></p></Block>
    </>); }

    case "treating-it": return (<>
      <PillRow label="More on treatment" items={[
        { href: `/sequencing/${c.id}/`, text: "Lines of therapy by subgroup →", glyph: <ToolGlyph name="refer" className="h-3.5 w-3.5" /> },
        ...(regimensFor(c.id).length ? [{ href: `/regimens/?cancer=${encodeURIComponent(c.name)}`, text: `${regimensFor(c.id).length} regimens →`, glyph: <ToolGlyph name="clock" className="h-3.5 w-3.5" /> }] : []),
        ...(guidelineCancerIds().includes(c.id) ? [{ href: `/guidelines/${c.id}/`, text: "Guideline history and concordance →", glyph: <ToolGlyph name="flag" className="h-3.5 w-3.5" /> }] : []),
        ...(decisionsFor(c.id) ? [{ href: decisionsRoute(c.id), text: "Decisions you may face →", glyph: <ToolGlyph name="talk" className="h-3.5 w-3.5" />, accent: true }] : []),
        ...(ukPathwayFor(c.id) ? [{ href: ukPathwayRoute(c.id, "funding"), text: "What the NHS funds →", glyph: <ToolGlyph name="globe" className="h-3.5 w-3.5" /> }] : []),
      ]} />
      <Block id="care" title="Standard of care" aside={<span className="text-sm text-muted tabular-nums">{c.standardOfCare.length} {c.standardOfCare.length === 1 ? "setting" : "settings"}</span>}>
        <div className="space-y-3">
          {c.standardOfCare.map((s, i) => (
            <div key={i} className="card p-4">
              <div className="font-medium">{s.setting}</div>
              <p className="text-[15px] text-foreground/85 mt-1">{s.approach}</p>
              {s.guideline && <div className="mt-2"><GuidelineChip g={s.guideline} /></div>}
              <SocRefs ids={s.refs} />
            </div>
          ))}
          {!c.standardOfCare.length && <p className="text-sm text-muted">No standard-of-care rows are recorded yet; the parent cancer&apos;s page may carry them.</p>}
        </div>
      </Block>
    </>);

    case "evidence": { const trials = forMe.get("trial") ?? []; const papers = keyPapersFor(c); return (<>
      <Block id="trials" title="Trials recruiting now"><TrialFinder condition={conditionQuery(c.name)} title={c.name} /></Block>
      {trials.length > 0 && <Block id="landmark-trials" title="Landmark trials" aside={<span className="text-sm text-muted tabular-nums">{trials.length}</span>}><ChipList items={trials} max={NEIGHBOUR_CAP} moreHref={cancerTableHref("trial", c.name)} /></Block>}
      <FamilyRollup c={c} kind="trial" id="subtype-trials" />
      {papers.length > 0 && <Block id="key-papers" title="Key papers" aside={<span className="text-sm text-muted tabular-nums">{papers.length}</span>}><KeyPapers e={c} all={papers} /></Block>}
      <Block id="papers" title="Latest papers"><LatestLiterature e={c} /></Block>
      {c.history.length > 0 && <Block id="history" title="Milestones" aside={<span className="text-sm text-muted tabular-nums">{c.history.length}</span>}>
        <ol className="relative border-s-2 border-border ms-3 space-y-5">
          {c.history.map((h, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-background" />
              <div className="flex flex-wrap items-baseline gap-2"><span className="font-mono text-sm text-muted">{h.year}</span><span className="font-medium">{h.title}</span></div>
              {h.note && <p className="text-sm text-muted mt-0.5">{h.note}</p>}
              {h.refs.length > 0 && <div className="mt-1.5"><Refs ids={h.refs} /></div>}
            </li>
          ))}
        </ol>
      </Block>}
    </>); }

    case "science": { const targets = forMe.get("target") ?? []; const pathways = forMe.get("pathway") ?? []; const m = modelsFor(c.id); return (<>
      {targets.length > 0 && <Block id="targets" title="Targets" aside={<span className="text-sm text-muted tabular-nums">{targets.length}</span>}><p className="text-sm text-muted mb-3">The targets of this cancer&apos;s medicines and the ones linked to it directly.</p><ChipList items={targets} max={NEIGHBOUR_CAP} moreHref={cancerTableHref("target", c.name)} /></Block>}
      <Block id="prevalence" title="How often this target appears"><CancerPrevalence cancerId={c.id} /></Block>
      {pathways.length > 0 && <Block id="pathways" title="Pathways" aside={<span className="text-sm text-muted tabular-nums">{pathways.length}</span>}><ChipList items={pathways} max={NEIGHBOUR_CAP} moreHref={cancerTableHref("pathway", c.name)} /><p className="text-xs text-muted mt-3"><Link href="/mechanics/" className="underline">The mechanics of cancer, stage by stage →</Link></p></Block>}
      {m && <Block id="models" title="Preclinical models"><p className="text-sm text-muted">{m.cellLines.length} cell lines, {m.gemms.length} mouse models and {m.pdx.length + m.organoids.length} repositories are listed for this cancer. <Link className="underline" href={`/preclinical-models/?subject=${encodeURIComponent(short(c.name))}`}>See them →</Link></p></Block>}
      {!targets.length && !pathways.length && !m && <p className="text-sm text-muted">No targets or pathways are linked to this cancer yet. <Link className="underline" href="/targets/genome/">Browse the gene hub →</Link></p>}
    </>); }

    case "where-you-are": return (<>
      <PillRow label="More on where you are" items={[...pages, { href: "/countries/", text: "Every country →", glyph: <ToolGlyph name="globe" className="h-3.5 w-3.5" /> }, { href: "/coverage/", text: "Coverage by country →", glyph: <ToolGlyph name="flag" className="h-3.5 w-3.5" /> }]} />
      {geographyFor(c.id) ? <CancerGeographySection c={c} /> : <Block id="geography" title="Cases by country"><CountryCasesMini cancerId={c.id} limit={10} /></Block>}
      <div className="mt-8"><UkPathwayStrip c={c} id="uk" /></div>
      <Block id="centres" title="Expert centres"><ExpertCentres cancerId={c.id} /></Block>
      <FamilyRollup c={c} kind="institution" id="subtype-centres" />
    </>);

    case "living-with-it": return (<>
      <PillRow label="More on living with it" items={[
        { href: `/first-60-days/${c.id}/`, text: "The first 60 days →", glyph: <ToolGlyph name="clock" className="h-3.5 w-3.5" />, accent: true },
        { href: `/prep/${c.id}/`, text: "Appointment prep sheet →", glyph: <ToolGlyph name="talk" className="h-3.5 w-3.5" /> },
        { href: "/side-effects/", text: "Side effects →", glyph: <ToolGlyph name="pain" className="h-3.5 w-3.5" /> },
        { href: "/assistance/", text: "Help with costs →", glyph: <ToolGlyph name="bag" className="h-3.5 w-3.5" /> },
      ]} />
      <DecisionsStrip c={c} id="decisions" />
      <ToolsStrip e={c} id="tools" />
      <div id="red-cards" className="scroll-mt-28"><RedCardsStrip cancer={c} /></div>
      {journeysForCancer(c.id).length > 0 && <div id="journeys" className="card p-4 mt-6 scroll-mt-28"><div className="kicker mb-1"><TL text="Treatment journeys" /></div><p className="text-sm text-muted mb-2">What the next twelve months look like, phase by phase, with the decision points.</p><div className="flex flex-wrap gap-1.5">{journeysForCancer(c.id).map((j) => <Link key={j.id} href={`/journeys/${j.id}/`} className="chip border bg-card border-border hover:bg-foreground/5">{j.stage}</Link>)}</div></div>}
      <Block id="questions" title="Questions to ask"><Questions cancer={c} /></Block>
    </>);

    case "coming": { const changes = splitUpcoming(changesForCancer(g, c), new Date().toISOString().slice(0, 10)).past; return (<>
      <PillRow label="More on what is coming" items={[...pages, { href: `/edge/?cancer=${encodeURIComponent(c.id)}`, text: "Edge: the freshest items →", glyph: <ToolGlyph name="trend" className="h-3.5 w-3.5" />, accent: true }, { href: `/roadmap/`, text: "Roadmaps →", glyph: <ToolGlyph name="compass" className="h-3.5 w-3.5" /> }]} />
      <Block id="pipeline" title="In development"><CancerPipeline c={c} /></Block>
      <FamilyRollup c={c} kind="drug" id="subtype-pipeline" />
      {c.openProblems.length > 0 && <Block id="open-problems" title="Open problems and what is being done"><ul className="space-y-4">{c.openProblems.map((pr, i) => <li key={i}><p className="text-[15px] leading-relaxed">{withTermHovers(pr, { skipId: c.id })}</p><div className="mt-2"><WhatIsBeingDoneFor text={pr} cancerId={c.id} /></div></li>)}</ul></Block>}
      <Block id="changes" title="What changed" aside={<span className="text-sm text-muted tabular-nums">{changes.length}</span>}><ChangesPreview items={changes.slice(0, 6)} total={changes.length} href={`${routeFor(c)}changes/`} cancerId={c.id} /><div className="mt-4"><FollowLine cancer={{ id: c.id, name: c.name, route: routeFor(c), asOf: c.asOf }} /></div></Block>
    </>); }

    case "data": { const twins = machineRoutes(c); const nRel = [...forMe.entries()].filter(([k]) => k !== "cancer").reduce((a, [, l]) => a + l.length, 0); return (<>
      <Block id="relevant" title="Related pages" aside={<span className="text-sm text-muted tabular-nums">{nRel}</span>}><p className="text-xs text-muted mb-3">Direct links plus the targets, companies, and technologies of this cancer&apos;s products.</p><Neighbours groups={forMe} exclude={["cancer"]} similar={similarLinks(c.id)} max={NEIGHBOUR_CAP} moreHref={(k: Kind) => cancerTableHref(k, c.name)} /></Block>
      {c.notes.filter((n) => !ROUTING_NOTE.test(n)).length > 0 && <Block id="notes" title="Notes"><Bullets items={c.notes.filter((n) => !ROUTING_NOTE.test(n))} linked={(t) => withTermHovers(t, { skipId: c.id })} /></Block>}
      <Block id="machine" title="Machine-readable versions">
        <p className="text-sm text-muted mb-2">The same record for scripts and assistants; checked {c.asOf}. Data CC BY-NC 4.0, attribute &ldquo;Data from OnCo (onco.cc)&rdquo;.</p>
        <div className="flex flex-wrap gap-1.5 text-sm">
          <a href={twins.json.url} type={twins.json.type} className="chip border bg-card border-border hover:bg-foreground/5" data-onco-format="json">JSON with neighbours</a>
          <a href={twins.markdown.url} type={twins.markdown.type} className="chip border bg-card border-border hover:bg-foreground/5" data-onco-format="markdown">Markdown context</a>
          <a href={twins.turtle.url} type={twins.turtle.type} className="chip border bg-card border-border hover:bg-foreground/5" data-onco-format="turtle">RDF Turtle</a>
          <a href={`/api/v1/cancers/${c.id}/sections.json`} type="application/json" className="chip border bg-accent-soft border-accent/40 text-accent hover:bg-foreground/5" data-onco-format="sections">Sections with routes and counts</a>
          <Link href={`/api/`} className="chip border bg-card border-border hover:bg-foreground/5">API root</Link>
        </div>
      </Block>
    </>); }
  }
}

/* ------------------------------------------------------------------------------------------------------------ */

/** The first few named items of a section, for its summary card. */
function preview(c: Cancer, id: SectionId): Entity[] {
  const g = graph();
  const forMe = g.forCancer(c.id);
  const take = (k: Kind, n: number) => (forMe.get(k) ?? []).slice(0, n);
  switch (id) {
    case "evidence": return take("trial", 4);
    case "science": return take("target", 6);
    case "where-you-are": return take("institution", 4);
    case "coming": return take("drug", 4);
    // De-duplicated by id: two settings often cite the same record, and ChipList keys by id (duplicate React keys otherwise).
    case "treating-it": return [...new Map(c.standardOfCare.flatMap((s) => s.refs).map((r) => g.get(r)).filter((x): x is Entity => !!x).map((e) => [e.id, e] as const)).values()].slice(0, 4);
    default: return [];
  }
}

/** A section that lives on its own page, seen from the hub: glyph, purpose, counts, the first items and the way in. */
export function SectionCard({ c, plan }: { c: Cancer; plan: SectionPlan }) {
  const items = preview(c, plan.def.id);
  return (
    <div className="card p-5" data-section-card={plan.def.id}>
      <p className="text-[15px] leading-relaxed max-w-3xl">{plan.def.purpose}</p>
      {plan.counts.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="What this section holds">
          {plan.counts.map((x) => <li key={x.label} className="chip border bg-card border-border text-sm inline-flex items-center gap-1.5"><SectionGlyph name={plan.def.glyph} className="h-3.5 w-3.5 text-muted" /><span className="font-medium tabular-nums">{x.n.toLocaleString("en-GB")}</span><span className="text-muted">{x.label}</span></li>)}
        </ul>
      )}
      {items.length > 0 && <div className="mt-3"><ChipList items={items} /></div>}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={plan.route} className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-white hover:opacity-90" data-see-all={plan.def.id}><SectionGlyph name={plan.def.glyph} className="h-4 w-4" />See all: {plan.def.title} →</Link>
        {plan.pages.map((pg) => <Link key={pg.slug} href={pg.route} className="chip border bg-card border-border text-sm hover:bg-foreground/5">{pg.title} →</Link>)}
      </div>
    </div>
  );
}

/** Kind labels for the "and N more" links, kept here so the hub and the section pages agree. */
export const kindPlural = (k: Kind) => KIND_META[k].plural;

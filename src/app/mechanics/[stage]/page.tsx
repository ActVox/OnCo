import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { KIND_META, routeFor, type Entity } from "@/lib/schema";
import { KIND_COLOR, statusClass } from "@/lib/text";
import { pathwayView } from "@/lib/pathway-products";
import { firstSentence, mechanicsStage, mechanicsStages, stageContent, stageNeighbours, STAGE_SECTIONS, type StageContent, type StageSectionId } from "@/lib/mechanics";
import { MECHANICS } from "@/data/mechanics-atlas";
import { PathwayDiagramInteractive } from "@/components/PathwayDiagramInteractive";
import { MechanicsGlyph, MechanicsGlyphDefs, MechanicsSectionIcon } from "@/components/MechanicsGlyph";
import { MechanicsJourney } from "@/components/MechanicsJourney";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container, GroupKicker, PageHeader, StatusChip } from "@/components/ui";
import { KindIcon } from "@/components/KindIcon";
import { Tip } from "@/components/Tip";
import { CheckpointPills } from "@/components/CheckpointPills";

export function generateStaticParams() {
  return MECHANICS.flatMap((c) => c.stages.map((s) => ({ stage: s.id })));
}

export async function generateMetadata({ params }: { params: Promise<{ stage: string }> }): Promise<Metadata> {
  const { stage } = await params;
  const ref = mechanicsStage(stage);
  return ref ? pageMeta({ title: `${ref.stage.title} · Mechanics of cancer`, description: ref.stage.plain, path: ref.route }) : {};
}

const num = (n: number) => n.toLocaleString("en-GB");
const plural = (n: number, one: string, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;
const DIAGRAMS_INTERACTIVE = 3;

const ROLE_LABEL: Record<string, string> = {
  "surface-antigen": "surface antigen", kinase: "kinase", checkpoint: "checkpoint", "nuclear-receptor": "nuclear receptor", enzyme: "enzyme",
  transcription: "transcription factor", oncogene: "oncogene", "tumor-suppressor": "tumour suppressor", stroma: "stroma", other: "target",
};
const ROLE_TIP: Record<string, string> = {
  "surface-antigen": "A protein on the cell surface that antibodies, ADCs, engagers and CAR-T cells can grip.",
  kinase: "An enzyme that passes signals on by adding phosphate groups; most targeted pills block one.",
  checkpoint: "A brake on immune cells that tumours lean on; checkpoint inhibitors release it.",
  "nuclear-receptor": "A receptor that reads hormones and switches genes on; endocrine therapy works here.",
  enzyme: "A protein that carries out a chemical step the tumour depends on.",
  transcription: "A protein that decides which genes are read; hard to drug directly, reached through degraders and glues.",
  oncogene: "A gene whose stuck-on form drives the cancer.",
  "tumor-suppressor": "A brake gene the cancer has lost; drugged indirectly through the dependencies the loss creates.",
  stroma: "A protein of the tumour's supporting tissue rather than the cancer cell itself.",
  other: "A target without a class assigned in the corpus.",
};
/** The target browser filters by class with the capitalised, de-hyphenated label (src/lib/kind-browser.ts). */
const classRoute = (role: string) => `/targets/?class=${encodeURIComponent(role.replace("-", " ").replace(/^./, (ch) => ch.toUpperCase()))}`;
const maturityStatus = (m: string) => (m === "being-tested-at-scale" ? "phase-3" : m === "early-clinical" ? "phase-2" : m === "preclinical-evidence" ? "phase-1" : "concept");

/** A linked chip with a hover explanation, in the kind's colour. */
function TipChip({ e, glyph = false }: { e: Entity; glyph?: boolean }) {
  return (
    <Tip title={e.name} text={e.tldr} href={routeFor(e)} inline={false}>
      <Link href={routeFor(e)} className={`chip border transition-[filter] hover:brightness-95 dark:hover:brightness-125 ${KIND_COLOR[e.kind]} ${glyph ? "inline-flex items-center gap-1" : ""}`}>
        {glyph && <KindIcon kind={e.kind} className="h-3 w-3" />}<span>{e.name}</span>
      </Link>
    </Tip>
  );
}

/** A section of the stage page: an accent badge with the section glyph, a self-anchoring kicker and the heading. */
function Section({ id, title, count, lede, children }: { id: StageSectionId | "related"; title: string; count?: number; lede?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="relative pl-14 sm:pl-16 scroll-mt-28">
      <span className="absolute left-0 top-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent ring-4 ring-background"><MechanicsSectionIcon id={id} className="h-5 w-5" /></span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a href={`#${id}`} className="kicker hover:text-foreground">{title}</a>
        {count !== undefined && <span className="text-xs text-muted tabular-nums">{num(count)}</span>}
      </div>
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight leading-snug mt-0.5 text-balance">{title}</h2>
      {lede && <p className="mt-2 text-[15px] text-muted leading-relaxed max-w-3xl">{lede}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted italic border-l-2 border-border pl-3">{children}</p>;
}

function IdeaCard({ i }: { i: Extract<Entity, { kind: "idea" }> }) {
  return (
    <Link href={routeFor(i)} className="card p-3 flex flex-col gap-1 hover:border-accent/40">
      <div className="flex flex-wrap gap-1"><span className={`chip ${statusClass(maturityStatus(i.maturity))}`}>{i.maturity.replace(/-/g, " ")}</span>{i.actor && <span className="chip bg-foreground/5">{i.actor}</span>}</div>
      <div className="font-medium leading-snug text-[15px]">{i.name}</div>
      <p className="text-sm text-muted leading-snug line-clamp-3">{i.tldr}</p>
    </Link>
  );
}

function PaperRow({ p }: { p: Extract<Entity, { kind: "paper" }> }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-2 border-b border-border/70 last:border-0">
      <span className="tabular-nums text-sm text-muted w-10 shrink-0">{p.year}</span>
      <span className="chip bg-foreground/5">{p.paperType.replace(/-/g, " ")}</span>
      <Link href={routeFor(p)} className="font-medium text-[15px] leading-snug hover:text-accent min-w-0 flex-1 basis-60">{p.name}</Link>
      <span className="text-xs text-muted">{p.journal}</span>
      {p.changedPractice && <span className={`chip ${statusClass("approved")}`}>changed practice</span>}
    </li>
  );
}

function StageChip({ id }: { id: string }) {
  const ref = mechanicsStage(id);
  if (!ref) return null;
  return (
    <Tip title={`${ref.number} ${ref.stage.title}`} text={firstSentence(ref.stage.plain)} href={ref.route} linkLabel="Open the stage →" inline={false}>
      <Link href={ref.route} className="chip border bg-card border-border hover:bg-foreground/5 hover:border-accent/50 inline-flex items-center gap-1.5">
        <MechanicsGlyph id={id} className="h-3.5 w-3.5 text-accent" sprite /><span><span className="text-muted tabular-nums mr-1">{ref.number}</span>{ref.stage.title}</span>
      </Link>
    </Tip>
  );
}

function has(c: StageContent, id: StageSectionId): boolean {
  switch (id) {
    case "diagram": return c.pathways.length > 0;
    case "what-happens": return true;
    case "players": return c.players.length + c.pathways.length > 0;
    case "medicines": return c.medicines.length + c.technologies.length > 0;
    case "escape": return c.escape.terms.length + c.escape.ideas.length + c.escape.papers.length + c.escape.pathways.length > 0;
    case "measured": return c.measured.terms.length + c.measured.assays.length + c.measured.technologies.length > 0;
    case "questions": return c.questions.text.length + c.questions.bottlenecks.length + c.questions.ideas.length > 0;
    case "evidence": return c.evidence.papers.length > 0;
  }
}

export default async function StagePage({ params }: { params: Promise<{ stage: string }> }) {
  const { stage: id } = await params;
  const ref = mechanicsStage(id);
  if (!ref) notFound();
  const c = stageContent(ref);
  const { stage, chapter } = ref;
  const { prev, next } = stageNeighbours(id);
  const sections = STAGE_SECTIONS.filter((s) => has(c, s.id));
  const drawn = c.pathways.slice(0, DIAGRAMS_INTERACTIVE);
  const linkedOnly = c.pathways.slice(DIAGRAMS_INTERACTIVE);
  const escapeTermIds = new Set(c.escape.terms.map((t) => t.id));
  const measuredTermIds = new Set(c.measured.terms.map((t) => t.id));
  const wordTerms = c.terms;
  const questionsTotal = c.questions.text.length + c.questions.bottlenecks.length + c.questions.ideaTotal;

  return (
    <>
      <MechanicsGlyphDefs />
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Mechanics of cancer", href: "/mechanics/" }, { label: stage.title, href: ref.route }]} />
      <PageHeader
        kicker={<GroupKicker id="map"><Link href="/mechanics/" className="kicker hover:text-foreground">· Mechanics of cancer</Link><Link href={`/mechanics/#c-${chapter.id}`} className="kicker hover:text-foreground">· Chapter {ref.chapterIndex + 1}, {chapter.title}</Link><span className="kicker">· Stage {ref.number}</span></GroupKicker>}
        title={stage.title}
        lede={stage.plain}
        logo={<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent"><MechanicsGlyph id={stage.id} className="h-8 w-8" /></span>}
      />
      <Container className="pb-20">
        <nav aria-label="Sections" className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mb-8 bg-background/95 backdrop-blur border-y border-border flex flex-nowrap overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible items-center gap-1.5 text-sm">
          <span className="kicker mr-1 hidden sm:inline">On this page</span>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
              <MechanicsSectionIcon id={s.id} className="h-3.5 w-3.5 text-accent" /><span>{s.label}</span>
            </a>
          ))}
          <a href="#navigator" className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 ms-auto">
            <MechanicsSectionIcon id="related" className="h-3.5 w-3.5 text-accent" /><span>Next stage</span>
          </a>
        </nav>

        <CheckpointPills id={id} className="mb-8" />
        <div className="mech-content space-y-14">
          {has(c, "diagram") && (
            <Section id="diagram" title="Diagram" count={c.pathways.length}
              lede={<>Pick a product above a diagram to see the nodes it hits and the escape routes below the block. Hover or tap any node or arrow for what it is; every node opens its target, glossary entry or the pathway page. Violet boxes are druggable targets.</>}>
              <div className="space-y-6">
                {drawn.map((p, i) => (
                  <figure key={p.id}>
                    <PathwayDiagramInteractive view={pathwayView(p)} large={i === 0} />
                    <figcaption className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
                      <Link href={routeFor(p)} className="font-medium underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground">{p.name}</Link>
                      <span className="text-muted leading-snug">{p.tldr}</span>
                    </figcaption>
                    {p.analogy && <p className="mt-1.5 text-sm text-muted italic max-w-3xl leading-relaxed">{p.analogy}</p>}
                  </figure>
                ))}
                {linkedOnly.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="kicker mr-1">Also drawn for this stage</span>
                    {linkedOnly.map((p) => <TipChip key={p.id} e={p} glyph />)}
                  </div>
                )}
              </div>
            </Section>
          )}

          <Section id="what-happens" title="What happens"
            lede={<>In plain words, then the glossary entries the stage rests on. Chapter {ref.chapterIndex + 1}, <Link href={`/mechanics/#c-${chapter.id}`} className="underline">{chapter.title}</Link>: {firstSentence(chapter.plain)}</>}>
            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)]">
              <div className="space-y-4 max-w-3xl">
                <p className="text-[17px] leading-relaxed text-foreground/90">{stage.plain}</p>
                {c.pathways.length > 0 && (
                  <div className="space-y-3">
                    {c.pathways.map((p) => (
                      <p key={p.id} className="text-[15px] leading-relaxed">
                        <Link href={routeFor(p)} className="font-medium hover:text-accent">{p.name}.</Link> <span className="text-foreground/85">{p.tldr}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
              {wordTerms.length > 0 && (
                <aside className="card p-4">
                  <div className="kicker mb-2 flex items-center gap-1.5"><KindIcon kind="term" className="h-3.5 w-3.5 text-accent" />Words to know</div>
                  <ul className="space-y-2.5">
                    {wordTerms.map((t) => (
                      <li key={t.id} className="text-sm leading-snug">
                        <Link href={routeFor(t)} className="font-medium hover:text-accent">{t.name}</Link>
                        {escapeTermIds.has(t.id) && <a href="#escape" className="ml-1.5 chip bg-foreground/5 align-middle">escape</a>}
                        {measuredTermIds.has(t.id) && <a href="#measured" className="ml-1.5 chip bg-foreground/5 align-middle">test</a>}
                        <span className="block text-muted mt-0.5">{firstSentence(t.tldr)}</span>
                      </li>
                    ))}
                  </ul>
                </aside>
              )}
            </div>
          </Section>

          {has(c, "players") && (
            <Section id="players" title="The molecular players" count={c.players.length}
              lede="The proteins and genes at this stage, with their role and how many products act on each. Listed players come from the atlas; drawn players sit as nodes in the diagrams above.">
              {c.pathways.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mb-4 text-sm">
                  <span className="kicker mr-1">Pathways</span>
                  {c.pathways.map((p) => <TipChip key={p.id} e={p} glyph />)}
                </div>
              )}
              {c.players.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {c.players.map(({ target, role, drawn, medicines }) => (
                    <li key={target.id} className="card p-3 flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={routeFor(target)} className="font-medium text-[15px] leading-snug hover:text-accent" translate="no">{target.name}</Link>
                        <Tip title={ROLE_LABEL[role]} text={ROLE_TIP[role]} href={classRoute(role)} linkLabel="All targets of this class →" inline={false}>
                          <Link href={classRoute(role)} className={`chip border ${KIND_COLOR.target} inline-flex items-center gap-1 shrink-0`}><KindIcon kind="target" className="h-3 w-3" /><span>{ROLE_LABEL[role]}</span></Link>
                        </Tip>
                      </div>
                      <p className="text-sm text-muted leading-snug line-clamp-2">{target.tldr}</p>
                      <div className="flex flex-wrap gap-1 mt-auto pt-1">
                        {drawn && <a href="#diagram" className="chip bg-foreground/5 inline-flex items-center gap-1"><MechanicsSectionIcon id="diagram" className="h-3 w-3" /><span>in the diagram</span></a>}
                        {medicines > 0 && <a href="#medicines" className="chip bg-foreground/5 inline-flex items-center gap-1"><KindIcon kind="drug" className="h-3 w-3" /><span>{plural(medicines, "medicine")}</span></a>}
                        <Link href={`/dossiers/${target.id}/`} className="chip bg-foreground/5 hover:bg-foreground/10">dossier</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : <Empty>No target record is listed at this stage or drawn in its diagrams; the pathways above carry the mechanism.</Empty>}
            </Section>
          )}

          {has(c, "medicines") && (
            <Section id="medicines" title="Where medicines act" count={c.medicineCount}
              lede="Products grouped by the node they hit, most advanced first, with the cancers an approved product is linked to. Pick one above the diagram to see it light up.">
              <div className="space-y-5">
                {c.medicines.map((grp, gi) => (
                  <div key={grp.target?.id ?? `loose-${gi}`} className="card p-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-3">
                      {grp.target ? (
                        <>
                          <span className="kicker">At</span>
                          <Link href={routeFor(grp.target)} className="font-medium hover:text-accent" translate="no">{grp.target.name}</Link>
                          {grp.nodes.length > 0 && <span className="text-xs text-muted">node {[...new Set(grp.nodes.map((n) => n.label))].join(", ")} in {[...new Set(grp.nodes.map((n) => n.pathway.name))].join(" and ")}</span>}
                        </>
                      ) : <span className="kicker">Listed at this stage without a drawn target</span>}
                      <span className="ms-auto text-xs text-muted tabular-nums">{plural(grp.total, "product")}</span>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                      {grp.drugs.map(({ drug, cancers }) => (
                        <li key={drug.id} className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-background/60 pl-1 pr-1.5 py-0.5 min-w-0 max-w-full">
                          <Tip title={drug.name} text={drug.tldr} href={routeFor(drug)} inline={false}>
                            <Link href={routeFor(drug)} className={`chip border ${KIND_COLOR.drug} inline-flex items-center gap-1`} translate="no"><KindIcon kind="drug" className="h-3 w-3" /><span>{drug.name}</span></Link>
                          </Tip>
                          <StatusChip status={drug.status} />
                          {cancers.map((ca) => <Link key={ca.id} href={routeFor(ca)} title={ca.name} className={`chip border min-w-0 max-w-full ${KIND_COLOR.cancer}`}>{ca.name}</Link>)}
                        </li>
                      ))}
                      {grp.total > grp.drugs.length && grp.target && (
                        <li><Link href={routeFor(grp.target)} className="chip border bg-card border-border hover:bg-foreground/5">+{num(grp.total - grp.drugs.length)} more at {grp.target.name} →</Link></li>
                      )}
                    </ul>
                  </div>
                ))}
                {c.technologies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="kicker mr-1">Technologies acting here</span>
                    {c.technologies.map((t) => <TipChip key={t.id} e={t} glyph />)}
                  </div>
                )}
                {c.medicines.length === 0 && <Empty>No product in the corpus acts on a target at this stage yet.</Empty>}
              </div>
            </Section>
          )}

          {has(c, "escape") && (
            <Section id="escape" title="How tumours escape" count={c.escape.terms.length + c.escape.pathways.length + c.escape.ideas.length + c.escape.papers.length}
              lede={<>Records tied to this stage that describe resistance, evasion or tolerance. <Link href="/resistance/" className="underline">How tumours escape each drug class</Link> lists the routes class by class.</>}>
              <div className="space-y-4">
                {(c.escape.terms.length > 0 || c.escape.pathways.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="kicker mr-1">Mechanisms</span>
                    {c.escape.pathways.map((p) => <TipChip key={p.id} e={p} glyph />)}
                    {c.escape.terms.map((t) => <TipChip key={t.id} e={t} glyph />)}
                  </div>
                )}
                {c.escape.ideas.length > 0 && (
                  <div>
                    <div className="kicker mb-2">Ideas that attack the escape</div>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{c.escape.ideas.map((i) => <li key={i.id}><IdeaCard i={i} /></li>)}</ul>
                  </div>
                )}
                {c.escape.papers.length > 0 && (
                  <div>
                    <div className="kicker mb-1">Papers on the escape</div>
                    <ul>{c.escape.papers.map((p) => <PaperRow key={p.id} p={p} />)}</ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {has(c, "measured") && (
            <Section id="measured" title="Measured by" count={c.measured.terms.length + c.measured.assays.length + c.measured.technologies.length}
              lede="Biomarkers, tests and assays in the corpus that read this stage in a patient.">
              <div className="space-y-4">
                {c.measured.terms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm"><span className="kicker mr-1">Biomarkers</span>{c.measured.terms.map((t) => <TipChip key={t.id} e={t} glyph />)}</div>
                )}
                {c.measured.technologies.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm"><span className="kicker mr-1">Tests</span>{c.measured.technologies.map((t) => <TipChip key={t.id} e={t} glyph />)}</div>
                )}
                {c.measured.assays.length > 0 && (
                  <div>
                    <div className="kicker mb-2">Assays</div>
                    <ul className="flex flex-wrap gap-1.5">
                      {c.measured.assays.map((a) => (
                        <li key={a.id}><Link href={`/assays/#${a.id}`} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1.5"><MechanicsSectionIcon id="measured" className="h-3 w-3 text-accent" /><span>{a.name}</span><span className="text-muted">{a.platform}</span></Link></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {has(c, "questions") && (
            <Section id="questions" title="Open questions" count={questionsTotal}
              lede="What is not known at this stage: the atlas's own questions, the bottlenecks it bears on, and the ideas in the corpus that try to answer them.">
              <div className="space-y-5">
                {c.questions.text.length > 0 && (
                  <ul className="space-y-2 max-w-3xl">
                    {c.questions.text.map((q) => <li key={q} className="pl-3 border-l-2 border-accent/60 text-[15px] leading-relaxed">{q}</li>)}
                  </ul>
                )}
                {c.questions.bottlenecks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="kicker mr-1">Bottlenecks</span>
                    {c.questions.bottlenecks.map((b) => (
                      <Tip key={b.id} title={b.name} text={b.tldr} href={routeFor(b)} inline={false}>
                        <Link href={routeFor(b)} className={`chip border ${KIND_COLOR.bottleneck} inline-flex items-center gap-1`}><KindIcon kind="bottleneck" className="h-3 w-3" /><span>{b.name}</span><span className="opacity-70">{b.severity}</span></Link>
                      </Tip>
                    ))}
                  </div>
                )}
                {c.questions.ideas.length > 0 && (
                  <div>
                    <div className="kicker mb-2 flex items-baseline gap-2">Ideas <span className="text-muted normal-case tracking-normal font-normal tabular-nums">{plural(c.questions.ideaTotal, "linked idea")}</span></div>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{c.questions.ideas.map((i) => <li key={i.id}><IdeaCard i={i} /></li>)}</ul>
                    {c.questions.ideaTotal > c.questions.ideas.length && (
                      <p className="mt-3 text-sm"><Link href="/ideas/rankings/" className="underline">{num(c.questions.ideaTotal - c.questions.ideas.length)} more ideas are linked to this stage&apos;s pathways, targets and terms; see the rankings →</Link></p>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {has(c, "evidence") && (
            <Section id="evidence" title="Key evidence" count={c.evidence.total}
              lede="Papers in the corpus tied to this stage's pathways, targets and terms, newest first.">
              <ul className="card px-4 py-1">{c.evidence.papers.map((p) => <PaperRow key={p.id} p={p} />)}</ul>
              {c.evidence.total > c.evidence.papers.length && (
                <p className="mt-3 text-sm"><Link href={`/${KIND_META.paper.route}/`} className="underline">{num(c.evidence.total - c.evidence.papers.length)} more papers in the key-papers index →</Link></p>
              )}
            </Section>
          )}

          {c.related.length > 0 && (
            <Section id="related" title="Connected stages" count={c.related.length} lede="Stages that share a diagram or a molecular player with this one.">
              <ul className="flex flex-wrap gap-1.5">{c.related.map((r) => <li key={r.ref.stage.id}><StageChip id={r.ref.stage.id} /></li>)}</ul>
            </Section>
          )}
        </div>

        <nav id="navigator" aria-label="Stage navigator" className="mt-16 scroll-mt-28">
          <div className="kicker mb-3">The journey</div>
          <MechanicsJourney active={stage.id} compact />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={prev.route} rel="prev" className="card p-4 flex items-center gap-3 hover:border-accent/50">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card border border-border text-foreground/80"><MechanicsGlyph id={prev.stage.id} className="h-5 w-5" sprite /></span>
                <span className="min-w-0"><span className="kicker block">← Previous · {prev.number}</span><span className="font-medium leading-snug block text-balance">{prev.stage.title}</span></span>
              </Link>
            ) : (
              <Link href="/mechanics/" className="card p-4 flex items-center gap-3 hover:border-accent/50">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card border border-border text-foreground/80"><MechanicsGlyph id={chapter.id} className="h-5 w-5" sprite /></span>
                <span className="min-w-0"><span className="kicker block">← Start</span><span className="font-medium leading-snug block">The mechanics hub</span></span>
              </Link>
            )}
            {next ? (
              <Link href={next.route} rel="next" className="card p-4 flex items-center gap-3 justify-end text-end hover:border-accent/50 bg-accent-soft/40">
                <span className="min-w-0"><span className="kicker block">Next · {next.number} →</span><span className="font-medium leading-snug block text-balance">{next.stage.title}</span></span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white"><MechanicsGlyph id={next.stage.id} className="h-5 w-5" sprite /></span>
              </Link>
            ) : (
              <Link href="/resistance/" className="card p-4 flex items-center gap-3 justify-end text-end hover:border-accent/50 bg-accent-soft/40">
                <span className="min-w-0"><span className="kicker block">Continue →</span><span className="font-medium leading-snug block">How tumours escape, class by class</span></span>
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white"><MechanicsGlyph id="failure" className="h-5 w-5" sprite /></span>
              </Link>
            )}
          </div>
        </nav>

        <div className="mt-12 text-xs text-muted max-w-3xl leading-relaxed">
          How this page is built: the stage is one entry in a curated atlas (<code>src/data/mechanics-atlas.ts</code>). Players, medicines, escape routes, tests, ideas and papers are
          resolved from the knowledge graph at build time through the stage&apos;s pathways, targets and terms, so every item here has its own page and sources. Where a section is
          missing, the corpus has no record tied to the stage yet. Nothing here is medical advice; see <Link href="/about/" className="underline">about and methodology</Link>.
          {mechanicsStages().length > 0 && <> Stage {ref.number} of {mechanicsStages().length}.</>}
        </div>
      </Container>
    </>
  );
}

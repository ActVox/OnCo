import type { Metadata } from "next";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { MECHANICS, MECHANICS_STAGE_COUNT } from "@/data/mechanics-atlas";
import { firstSentence, mechanicsStages, stageCounts, STAGE_SECTIONS } from "@/lib/mechanics";
import { MechanicsGlyph, MechanicsGlyphDefs, MechanicsSectionIcon } from "@/components/MechanicsGlyph";
import { MechanicsJourney } from "@/components/MechanicsJourney";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Tip } from "@/components/Tip";
import { FrontIcon } from "@/components/FrontIcon";
import { THEORY_HUB_ID, THEORY_ICONS, THEORY_IDS, theoryStatus } from "@/data/theories-wave";

export const metadata: Metadata = {
  title: "Mechanics of cancer",
  description: "How cancer works, drawn stage by stage: the body's defences, how a cell turns malignant, the replication machinery, death and repair, feeding, immune escape, metastasis, the tumour ecosystem, and why treatments fail. Every stage has its own page with the diagram, the molecular players, the medicines that act there, the escape routes and the open questions.",
};

const num = (n: number) => n.toLocaleString("en-GB");
const plural = (n: number, one: string, many = `${one}s`) => `${num(n)} ${n === 1 ? one : many}`;

/** Count pill on a stage card: a section glyph, a number and a word, deep-linking into that section of the stage page. */
function CountPill({ stageId, section, n, one, many, tip }: { stageId: string; section: (typeof STAGE_SECTIONS)[number]["id"]; n: number; one: string; many?: string; tip: string }) {
  const label = plural(n, one, many);
  return (
    <Tip title={label} text={tip} href={`/mechanics/${stageId}/#${section}`} linkLabel="Open the section →" inline={false}>
      <Link href={`/mechanics/${stageId}/#${section}`} className={`chip border inline-flex items-center gap-1.5 ${n ? "bg-card border-border hover:bg-foreground/5 hover:border-accent/50" : "bg-transparent border-border/60 text-muted"}`}>
        <MechanicsSectionIcon id={section} className="h-3.5 w-3.5 text-accent" /><span>{label}</span>
      </Link>
    </Tip>
  );
}

export default function MechanicsPage() {
  const g = graph();
  const stages = mechanicsStages();
  const counts = new Map(stages.map((s) => [s.stage.id, stageCounts(s.stage)]));
  const diagramIds = new Set(stages.flatMap((s) => s.stage.pathways).filter((id) => g.get(id)?.kind === "pathway"));
  const playerIds = new Set<string>();
  const medicineIds = new Set<string>();
  for (const s of stages) {
    for (const id of s.stage.targets) if (g.get(id)?.kind === "target") playerIds.add(id);
    for (const pid of s.stage.pathways) { const p = g.get(pid); if (p?.kind === "pathway") for (const n of p.nodes) if (n.targetId) playerIds.add(n.targetId); }
    for (const id of s.stage.drugs) if (g.get(id)?.kind === "drug") medicineIds.add(id);
  }
  for (const t of playerIds) for (const d of g.incoming(t).get("drug") ?? []) medicineIds.add(d.id);
  const questionTotal = stages.reduce((n, s) => n + s.stage.openQuestions.length, 0);
  const theoryHub = g.get(THEORY_HUB_ID);
  const theories = THEORY_IDS.map((id) => g.get(id)).filter((e) => e?.kind === "term");

  return (
    <>
      <MechanicsGlyphDefs />
      <PageHeader
        tone="band"
        kicker={<GroupKicker id="map" />}
        title="Mechanics of cancer"
        lede="How cancer works, drawn as one journey in nine chapters and 56 stages: from the defences a tumour has to breach, through the machinery it hijacks to copy itself, to the ways it feeds, hides, spreads and outlasts treatment. Every stage has its own page with the diagram, the molecular players, the medicines that act there, the escape routes, the tests, the open questions and the evidence."
      />
      <Container className="pb-20">
        <section aria-labelledby="journey-h">
          <h2 id="journey-h" className="sr-only">The journey</h2>
          <MechanicsJourney />
          <p className="mt-2 text-xs text-muted">Each glyph is a stage. Hover for a sentence, tap to open it; the chapter names jump to the chapter below.</p>
        </section>

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            [MECHANICS.length, "chapters", "#c-defences"], [MECHANICS_STAGE_COUNT, "stages", "#c-defences"], [diagramIds.size, "pathway diagrams", "/pathways/"],
            [playerIds.size, "molecular players", "/targets/"], [medicineIds.size, "medicines placed", "/drugs/"], [questionTotal, "open questions", "/ideas/"],
          ].map(([n, label, href]) => (
            <Link key={String(label)} href={String(href)} className="card px-4 py-3 hover:border-accent/50">
              <div className="text-2xl font-semibold tabular-nums leading-none">{num(Number(n))}</div>
              <div className="kicker mt-1.5">{label}</div>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-[15px] text-muted max-w-3xl leading-relaxed">
          Read it top to bottom as a story, or open any stage. On each stage page the diagram lights up when you pick a product, and every node opens the target, term or
          pathway behind it. <Link href="/resistance/" className="underline">How tumours escape each drug class</Link> continues chapter nine, and
          the <Link href="/pathways/" className="underline">pathway index</Link> lists every diagram alone.
        </p>

        <nav aria-label="Chapters" className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-8 mb-6 bg-background/95 backdrop-blur border-y border-border flex flex-nowrap overflow-x-auto no-scrollbar sm:flex-wrap sm:overflow-visible items-center gap-1.5 text-sm">
          <span className="kicker mr-1 hidden sm:inline">Chapters</span>
          {MECHANICS.map((c, i) => (
            <a key={c.id} href={`#c-${c.id}`} className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
              <MechanicsGlyph id={c.id} className="h-3.5 w-3.5 text-accent" sprite /><span><span className="text-muted tabular-nums mr-1">{i + 1}</span>{c.title}</span>
            </a>
          ))}
          {theories.length > 0 && (
            <a href="#c-theories" className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap shrink-0 inline-flex items-center gap-1.5">
              <FrontIcon id="drug-discovery" className="h-3.5 w-3.5 text-accent" /><span><span className="text-muted tabular-nums mr-1">{MECHANICS.length + 1}</span>Theories</span>
            </a>
          )}
        </nav>

        <div className="space-y-20">
          {MECHANICS.map((c, ci) => (
            <section key={c.id} id={`c-${c.id}`} className="scroll-mt-28">
              <header className="max-w-3xl flex gap-4">
                <span className="hidden sm:inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent"><MechanicsGlyph id={c.id} className="h-6 w-6" sprite /></span>
                <div>
                  <a href={`#c-${c.id}`} className="kicker hover:text-foreground">Chapter {ci + 1} · {plural(c.stages.length, "stage")}</a>
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-balance">{c.title}</h2>
                  <p className="mt-3 text-[15px] sm:text-base text-foreground/85 leading-relaxed">{c.plain}</p>
                </div>
              </header>

              <ol className="mech-rail mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {c.stages.map((s, si) => {
                  const k = counts.get(s.id)!;
                  return (
                    <li key={s.id} id={`s-${s.id}`} className="relative pl-14 sm:pl-0 scroll-mt-28">
                      <Link href={`/mechanics/${s.id}/`} aria-label={`${s.title}, open the stage`} className="absolute left-0 top-3 sm:static sm:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border text-foreground/80 ring-4 ring-background hover:text-accent hover:border-accent/60">
                        <MechanicsGlyph id={s.id} className="h-5 w-5" sprite />
                      </Link>
                      <article className="card h-full p-4 sm:p-5 flex flex-col gap-3 transition-[border-color] hover:border-accent/40">
                        <div className="flex items-start gap-3">
                          <span className="hidden sm:inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><MechanicsGlyph id={s.id} className="h-5 w-5" sprite /></span>
                          <div className="min-w-0">
                            <div className="kicker">Stage {ci + 1}.{si + 1}</div>
                            <h3 className="text-[17px] sm:text-lg font-semibold tracking-tight leading-snug mt-0.5 text-balance">
                              <Link href={`/mechanics/${s.id}/`} className="hover:text-accent">{s.title}</Link>
                            </h3>
                          </div>
                        </div>
                        <p className="text-[15px] text-foreground/85 leading-relaxed">{firstSentence(s.plain)}</p>
                        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                          <CountPill stageId={s.id} section="players" n={k.players} one="player" tip="Targets listed at this stage or drawn as nodes in its diagrams." />
                          <CountPill stageId={s.id} section="medicines" n={k.medicines} one="medicine" tip="Products that act on one of the stage's targets, grouped by the node they hit." />
                          <CountPill stageId={s.id} section="questions" n={k.questions} one="open question" tip="Open questions, bottlenecks and ideas linked to the stage's pathways, targets and terms." />
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>

        {theories.length > 0 && (
          <section id="c-theories" className="mt-20 scroll-mt-28">
            <header className="max-w-3xl flex gap-4">
              <span className="hidden sm:inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent"><FrontIcon id="drug-discovery" className="h-6 w-6" /></span>
              <div>
                <a href="#c-theories" className="kicker hover:text-foreground">Chapter {MECHANICS.length + 1} · {theories.length} schools of thought</a>
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1 text-balance">Theories of cancer</h2>
                <p className="mt-3 text-[15px] sm:text-base text-foreground/85 leading-relaxed">
                  The chapters above describe what cancer does. This chapter is about what cancer is: the schools of thought that have tried to explain it, from Boveri&apos;s
                  chromosomes and the somatic mutation theory to bioelectric patterning, with what each got right, what it got wrong, and the treatments that came from it.
                  {theoryHub && <> The <Link href={routeFor(theoryHub)} className="underline">map of how the theories connect</Link> draws them as one diagram.</>}
                </p>
              </div>
            </header>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {theories.map((e) => {
                if (!e) return null;
                const status = theoryStatus(e.summary);
                return (
                  <li key={e.id}>
                    <Link href={routeFor(e)} className="card h-full p-4 flex gap-3 transition-[filter] hover:brightness-95 dark:hover:brightness-125">
                      <FrontIcon id={THEORY_ICONS[e.id] ?? "drug-discovery"} className="h-6 w-6 shrink-0 text-accent mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-medium leading-snug text-balance">{e.name}</div>
                        {status && <div className="kicker mt-1">{status}</div>}
                        <p className="mt-1.5 text-sm text-muted leading-relaxed line-clamp-4">{e.tldr}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-16 text-xs text-muted max-w-3xl leading-relaxed">
          How this page is built: the chapters and stages are a curated atlas (<code>src/data/mechanics-atlas.ts</code>); every diagram, drug, target, technology and term is an
          object in the knowledge graph with its own page and sources. The stage pages resolve their players, medicines, escape routes, tests, questions and papers from the graph
          at build time. Nothing here is medical advice; see <Link href="/about/" className="underline">about and methodology</Link>.
        </div>
      </Container>
    </>
  );
}

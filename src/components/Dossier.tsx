import Link from "next/link";
import type { Drug, Entity, Target, Trial } from "@/lib/schema";
import { PHASE_ORDER, routeFor } from "@/lib/kinds";
import { graph } from "@/lib/graph";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { withTermHovers } from "@/lib/term-hover";
import { paperQuery } from "@/lib/europepmc";
import { Bullets, ChipList, Section } from "./ui";
import { PrevalenceTable } from "./PrevalenceTable";
import { TargetSchematic } from "./TargetSchematic";
import { RefChips } from "./RefChips";
import { DrugChip } from "./DrugChip";
import { LatestPapers } from "./LatestPapers";
import { XrefStrip, xrefJson } from "./XrefStrip";
import { HotspotPlot } from "./HotspotPlot";
import { hotspotsFor } from "@/data/hotspots";
import { questionsFor } from "@/data/open-questions";
import { assaysForTarget } from "@/data/assays";
import { modelsFor, cellLineIds } from "@/data/preclinical-models";
import { resistance, type Mechanism } from "@/data/resistance";
import { CATEGORY_BY_ID } from "@/lib/resistance-categories";
import { Tip } from "./Tip";
import { StaticTable } from "./filters/StaticTable";
import { pageRows } from "@/lib/static-tables";
import { DOSSIER_TRIAL_COLUMNS, dossierTrialRows, dossierTrialsTableId } from "@/lib/tables/dossier-trials";

/** Broad modality family for grouping products; mirrors the classes used on the toxicity page. */
export function modalityFamily(m: string): string {
  const s = m.toLowerCase();
  if (/bispecific adc/.test(s)) return "Bispecific ADC";
  if (/^adc|antibody-drug|antibody drug/.test(s)) return "ADC";
  if (/engager|immtac|tcr bispecific/.test(s)) return "T-cell engager";
  if (/bispecific/.test(s)) return "Bispecific antibody";
  if (/car-t|car t|til\b|tcr-t|cell therapy|nk cell/.test(s)) return "Cell therapy";
  if (/radioligand|alpha|theranostic|radiopharm|lutetium|actinium/.test(s)) return "Radiopharmaceutical";
  if (/pet|tracer|imaging|spect/.test(s)) return "Imaging agent";
  if (/vaccine|mrna|oncolytic|virus/.test(s)) return "Vaccine or virus";
  if (/protac|degrader|molecular glue/.test(s)) return "Degrader";
  if (/monoclonal|antibody|mab\b|checkpoint/.test(s)) return "Antibody";
  if (/kinase|inhibitor|small molecule|serd|antagonist|agonist|oral/.test(s)) return "Small molecule";
  if (/cytotoxic|chemotherapy|platinum/.test(s)) return "Chemotherapy";
  if (/test|assay|diagnostic|sequencing|panel|device|software/.test(s)) return "Test or device";
  return m.split(" (")[0];
}

const PHASES: Array<{ key: string; label: string; statuses: string[] }> = [
  { key: "approved", label: "Approved", statuses: ["approved", "standard-of-care"] },
  { key: "phase-3", label: "Phase 3", statuses: ["phase-3", "positive"] },
  { key: "phase-2", label: "Phase 2", statuses: ["phase-2"] },
  { key: "phase-1", label: "Phase 1", statuses: ["phase-1"] },
  { key: "preclinical", label: "Preclinical", statuses: ["preclinical", "concept", "planned"] },
  { key: "other", label: "Withdrawn or failed", statuses: ["withdrawn", "negative", "historic", "mixed"] },
];
const phaseOf = (s?: string) => PHASES.find((p) => p.statuses.includes(s ?? ""))?.key ?? "other";

function Stat({ label, value, href }: { label: string; value: number | string; href?: string }) {
  const inner = <><div className="text-2xl font-semibold tabular-nums leading-none">{value}</div><div className="text-xs text-muted mt-1">{label}</div></>;
  return href ? <a href={href} className="card p-3 block hover:bg-foreground/[0.03]">{inner}</a> : <div className="card p-3">{inner}</div>;
}

/** Everything the graph and the side files know about a target, computed once for the page and the JSON export. */
export function dossierData(t: Target) {
  const g = graph();
  const inc = g.incoming(t.id);
  const drugs = (inc.get("drug") ?? []) as Drug[];
  const drugIds = new Set(drugs.map((d) => d.id));
  const trials = new Map<string, Trial>();
  for (const x of inc.get("trial") ?? []) trials.set(x.id, x as Trial);
  for (const d of drugs) for (const x of g.incoming(d.id).get("trial") ?? []) if ((x as Trial).targets.includes(t.id) || (x as Trial).drugs.some((id) => drugIds.has(id))) trials.set(x.id, x as Trial);
  const papers = new Map<string, Entity>();
  for (const x of inc.get("paper") ?? []) papers.set(x.id, x);
  const companies = new Map<string, Entity>();
  for (const x of inc.get("company") ?? []) companies.set(x.id, x);
  for (const d of drugs) for (const c of d.companies) { const e = g.get(c); if (e) companies.set(e.id, e); }
  const pathways = g.kind("pathway").filter((p) => p.nodes.some((n) => n.targetId === t.id));
  const ideas = inc.get("idea") ?? [];
  const technologies = inc.get("technology") ?? [];
  const cancers = new Map<string, Entity>();
  for (const c of t.cancers) { const e = g.get(c); if (e) cancers.set(e.id, e); }
  for (const p of t.prevalence) { const e = g.get(p.cancerId); if (e) cancers.set(e.id, e); }
  for (const x of inc.get("cancer") ?? []) cancers.set(x.id, x);
  const mechanisms: Array<{ classId: string; drugClass: string; m: Mechanism }> = [];
  for (const r of resistance) {
    const classTargets = new Set(r.exemplars.flatMap((id) => (g.get(id) as Drug | undefined)?.targets ?? []));
    for (const m of r.mechanisms) {
      const hits = m.refs.includes(t.id) || m.countermeasures.some((c) => c.refs.includes(t.id) || c.refs.some((id) => drugIds.has(id))) || (classTargets.has(t.id) && m.category !== "other");
      if (hits) mechanisms.push({ classId: r.id, drugClass: r.drugClass, m });
    }
  }
  const trialList = [...trials.values()].sort((a, b) => PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase) || (b.yearReported ?? 0) - (a.yearReported ?? 0) || a.name.localeCompare(b.name));
  return {
    drugs, trials: trialList, papers: [...papers.values()].sort((a, b) => ((b as { year?: number }).year ?? 0) - ((a as { year?: number }).year ?? 0)),
    companies: [...companies.values()].sort((a, b) => a.name.localeCompare(b.name)), pathways, ideas, technologies, cancers: [...cancers.values()].sort((a, b) => a.name.localeCompare(b.name)),
    mechanisms, hotspots: hotspotsFor(t.id), questions: questionsFor(t.id), assays: assaysForTarget(t.id), models: modelsFor(t.id),
  };
}

/**
 * The dossier as one machine-readable record, written to /api/v1/dossiers/<id>.json by scripts/build-api.ts and
 * linked from the Export section. It used to be built in the page and handed to the reader as a `data:` URI, which
 * put a percent-encoded copy of every product, trial, paper, hotspot, question and assay into the HTML: 295 KB of
 * the PD-1 dossier's 469 KB of markup, growing with the corpus, which is what took the page past its budget when
 * the colorectal registry trials landed (src/app/heavy-pages.test.ts).
 */
export function dossierJson(t: Target) {
  const d = dossierData(t);
  return {
    id: t.id, name: t.name, symbol: t.symbol, route: routeFor(t), asOf: t.asOf,
    xrefs: xrefJson(t.id),
    products: d.drugs.map((x) => ({ id: x.id, name: x.name, status: x.status, modality: x.modality, route: routeFor(x) })),
    trials: d.trials.map((x) => ({ id: x.id, name: x.name, nct: x.nct, phase: x.phase, status: x.status })),
    pathways: d.pathways.map((p) => p.id), companies: d.companies.map((c) => c.id), keyPapers: d.papers.map((p) => p.id),
    hotspots: d.hotspots?.hotspots.map((h) => ({ label: h.label, position: h.position, kind: h.kind, frequency: h.frequency, drugs: h.drugs })) ?? [],
    openQuestions: d.questions.map((q) => ({ id: q.id, question: q.question, stage: q.stage, actor: q.actor, source: q.source })),
    assays: d.assays.map((a) => ({ id: a.id, name: a.name, cutoff: a.cutoff })),
    resistance: d.mechanisms.map((m) => ({ class: m.classId, mechanism: m.m.name, category: m.m.category })),
    licence: "CC BY-NC 4.0, attribution to OnCo (https://onco.cc); commercial use needs a licence",
  };
}

/** Site-relative URL of one dossier's file. */
export const dossierFile = (id: string): string => `/api/v1/dossiers/${id}.json`;

export function Dossier({ target: t }: { target: Target }) {
  const d = dossierData(t);
  // Dossiers with more than a page of trials carry the first page; the rest is /api/v1/tables/dossier-trials-<id>.json.
  const trialTable = pageRows(dossierTrialsTableId(t.id), dossierTrialRows(d.trials));
  const families = [...new Set(d.drugs.map((x) => modalityFamily(x.modality)))].sort((a, b) => d.drugs.filter((x) => modalityFamily(x.modality) === b).length - d.drugs.filter((x) => modalityFamily(x.modality) === a).length || a.localeCompare(b));
  const usedPhases = PHASES.filter((p) => d.drugs.some((x) => phaseOf(x.status) === p.key));
  const query = paperQuery(t);

  return (
    <div className="space-y-2">
      {/* At a glance */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Stat label="products" value={d.drugs.length} href="#products" />
        <Stat label="trials" value={d.trials.length} href="#trials" />
        <Stat label="cancers with prevalence" value={t.prevalence.length} href="#prevalence" />
        <Stat label="pathways" value={d.pathways.length} href="#pathways" />
        <Stat label="resistance routes" value={d.mechanisms.length} href="#resistance" />
        <Stat label="hotspots" value={d.hotspots?.hotspots.length ?? 0} href="#hotspots" />
        <Stat label="open questions" value={d.questions.length} href="#questions" />
        <Stat label="key papers" value={d.papers.length} href="#papers" />
      </div>

      <nav aria-label="Dossier sections" className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-4 bg-background/95 backdrop-blur border-y border-border flex flex-wrap items-center gap-1.5 text-sm">
        <span className="kicker mr-1 hidden sm:inline">Jump to</span>
        {[["biology", "Biology"], ["elsewhere", "Elsewhere"], ["prevalence", "Prevalence"], ["hotspots", "Hotspots"], ["products", "Products"], ["trials", "Trials"], ["resistance", "Resistance"], ["pathways", "Pathways"], ["assays", "Assays"], ["models", "Models"], ["questions", "Open questions"], ["papers", "Papers"], ["export", "Export"]].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="chip border bg-card border-border hover:bg-foreground/5">{label}</a>
        ))}
      </nav>

      <Section id="biology" title="Biology">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-[15px] leading-relaxed max-w-3xl">{withTermHovers(t.biology, { skipId: t.id })}</p>
            {t.whereFound.length > 0 && <div className="mt-4"><div className="kicker mb-1.5">Where it is found</div><Bullets items={t.whereFound} linked={(s) => withTermHovers(s, { skipId: t.id })} /></div>}
            <div className="mt-4 text-sm text-muted">Class: <span className="capitalize text-foreground">{t.targetClass.replace("-", " ")}</span>{t.symbol && <> · Gene: <span className="font-mono text-foreground">{t.symbol}</span></>} · Facts checked {t.asOf} · <Link className="underline" href={routeFor(t)}>Target page</Link></div>
            {d.cancers.length > 0 && <div className="mt-4"><div className="kicker mb-1.5">Cancers</div><ChipList items={d.cancers} /></div>}
            {d.technologies.length > 0 && <div className="mt-4"><div className="kicker mb-1.5">Technologies aimed at it</div><ChipList items={d.technologies} /></div>}
          </div>
          <div><TargetSchematic target={{ id: t.id, name: t.name, targetClass: t.targetClass, tldr: t.tldr }} compact /></div>
        </div>
      </Section>

      <Section id="elsewhere" title="External identifiers" aside={<span className="text-xs text-muted">Built from HGNC, Ensembl, UniProt and ChEMBL ids</span>}>
        <div className="card p-4"><XrefStrip targetId={t.id} /></div>
      </Section>

      {t.prevalence.length > 0 && (
        <Section id="prevalence" title="How common it is in each cancer" aside={<Link href="/prevalence/" className="text-xs underline text-muted">Full matrix →</Link>}>
          <PrevalenceTable target={t} />
        </Section>
      )}

      {d.hotspots && (
        <Section id="hotspots" title="Mutation hotspots">
          <HotspotPlot map={d.hotspots} />
        </Section>
      )}

      <Section id="products" title="Products by modality and phase" aside={<Link href={`/drugs/?q=${encodeURIComponent(t.name.split(" (")[0])}`} className="text-xs underline text-muted">Browse products →</Link>}>
        {d.drugs.length === 0 ? <p className="text-sm text-muted">No product in the corpus is aimed at this target yet.</p> : (
          <div className="card overflow-x-auto">
            <table className="onco">
              <thead><tr><th>Modality</th>{usedPhases.map((p) => <th key={p.key}>{p.label}</th>)}</tr></thead>
              <tbody>
                {families.map((f) => (
                  <tr key={f}>
                    <td className="font-medium whitespace-nowrap">{f}<div className="text-xs text-muted font-normal">{d.drugs.filter((x) => modalityFamily(x.modality) === f).length}</div></td>
                    {usedPhases.map((p) => {
                      const cell = d.drugs.filter((x) => modalityFamily(x.modality) === f && phaseOf(x.status) === p.key).sort((a, b) => a.name.localeCompare(b.name));
                      return <td key={p.key} className="min-w-[140px]">{cell.length ? <div className="flex flex-wrap gap-1.5">{cell.map((x) => <DrugChip key={x.id} id={x.id} name={x.name} route={routeFor(x)} tldr={x.tldr} className={statusClass(x.status)} />)}</div> : <span className="text-muted/50">-</span>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      <Section id="trials" title="Trials" aside={<Link href={`/evidence/`} className="text-xs underline text-muted">Evidence ranking →</Link>}>
        {d.trials.length === 0 ? <p className="text-sm text-muted">No trial in the corpus names this target or one of its products.</p> : (
          <StaticTable rows={trialTable.rows} more={trialTable.more} columns={DOSSIER_TRIAL_COLUMNS} noun="trials" />
        )}
      </Section>

      <Section id="resistance" title="Resistance routes" aside={<Link href="/resistance/gaps/" className="text-xs underline text-muted">Unaddressed routes →</Link>}>
        {d.mechanisms.length === 0 ? <p className="text-sm text-muted">No recorded escape route names this target.</p> : (
          <div className="grid gap-3 md:grid-cols-2">
            {d.mechanisms.map(({ classId, drugClass, m }) => {
              const cat = CATEGORY_BY_ID[m.category];
              return (
                <div key={`${classId}-${m.name}`} className="card p-4">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: cat.color }}><span className="inline-block h-2 w-2 rounded-full" style={{ background: cat.color }} /> {cat.label} · <Link href={`/resistance/#${classId}`} className="text-muted hover:underline font-normal">{drugClass.split(" (")[0]}</Link></div>
                  <div className="font-medium leading-snug mt-0.5">{m.name}</div>
                  {m.frequency && <div className="text-xs text-muted tabular-nums">Frequency: {m.frequency}</div>}
                  <p className="text-sm text-muted mt-1.5 leading-relaxed">{m.how}</p>
                  <div className="kicker text-emerald-700 dark:text-emerald-400 mt-3">Countermeasures · {m.countermeasures.length}</div>
                  <ul className="mt-1 space-y-1.5 text-sm">{m.countermeasures.map((c, i) => <li key={i}>{c.text}<RefChips ids={c.refs} className="mt-1" /></li>)}</ul>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      <Section id="pathways" title="Pathways" aside={<Link href="/pathway-drugs/" className="text-xs underline text-muted">Pathway-to-drug matrix →</Link>}>
        {d.pathways.length === 0 ? <p className="text-sm text-muted">No pathway diagram carries this target as a node.</p> : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {d.pathways.map((p) => (
              <li key={p.id} className="card p-4">
                <Link href={routeFor(p)} className="font-medium hover:underline">{p.name}</Link>
                <div className="text-xs text-muted mt-1">Node{p.nodes.filter((n) => n.targetId === t.id).length > 1 ? "s" : ""}: {p.nodes.filter((n) => n.targetId === t.id).map((n) => n.label).join(", ")} · {p.nodes.filter((n) => n.targetId).length} druggable nodes</div>
                <p className="text-sm text-muted mt-2 line-clamp-3">{p.tldr}</p>
                <Link href={`/pathway-drugs/#${p.id}`} className="text-xs underline text-muted mt-2 inline-block">Which nodes have drugs →</Link>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section id="assays" title="Companion diagnostics" aside={<Link href="/assays/" className="text-xs underline text-muted">Assay registry →</Link>}>
        {d.assays.length === 0 ? <p className="text-sm text-muted">No companion diagnostic in the registry measures this target.</p> : (
          <div className="card overflow-x-auto">
            <table className="onco">
              <thead><tr><th>Assay</th><th>Platform</th><th>Cut-off</th><th className="hidden md:table-cell">Gates</th></tr></thead>
              <tbody>{d.assays.map((a) => (
                <tr key={a.id}>
                  <td><Link href={`/assays/#${a.id}`} className="font-medium hover:underline">{a.name}</Link><div className="text-xs text-muted font-normal">{a.vendor} · {a.regulatory}{a.approved ? ` ${a.approved}` : ""}</div></td>
                  <td className="whitespace-nowrap text-muted">{a.platform}</td>
                  <td className="text-muted max-w-md text-sm">{a.cutoff}</td>
                  <td className="hidden md:table-cell min-w-[160px]"><RefChips ids={a.drugs.filter((id) => d.drugs.some((x) => x.id === id) || a.targets.length === 1).slice(0, 6)} /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Section>

      <Section id="models" title="Preclinical models" aside={<Link href="/preclinical-models/" className="text-xs underline text-muted">All models →</Link>}>
        {!d.models ? <p className="text-sm text-muted">No model entry for this target yet; check the cancer entries on the <Link className="underline" href="/preclinical-models/">models page</Link>.</p> : (
          <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
            <div className="card overflow-x-auto">
              <table className="onco">
                <thead><tr><th>Cell line</th><th>Identifiers</th><th>Why it is used</th></tr></thead>
                <tbody>{d.models.cellLines.map((c) => { const ids = cellLineIds(c.name); return (
                  <tr key={c.name}>
                    <td className="font-medium whitespace-nowrap">{c.name}{ids?.species && ids.species !== "Homo sapiens" && <div className="text-xs text-muted font-normal">{ids.species}</div>}</td>
                    <td className="text-xs whitespace-nowrap">{ids ? <><a className="underline" href={`https://www.cellosaurus.org/${ids.cellosaurus}`} rel="noopener">{ids.cellosaurus}</a>{ids.depmap && <> · <a className="underline" href={`https://depmap.org/portal/cell_line/${ids.depmap}`} rel="noopener">{ids.depmap}</a></>}</> : <span className="text-muted">not resolved</span>}</td>
                    <td className="text-muted text-sm">{c.note}</td>
                  </tr>); })}</tbody>
              </table>
            </div>
            <div className="space-y-3 text-sm">
              {d.models.gemms.length > 0 && <div className="card p-3"><div className="kicker mb-1">Mouse models</div><ul className="space-y-1.5">{d.models.gemms.map((gm) => <li key={gm.name}><span className="font-medium">{gm.name}</span> <span className="text-muted">({gm.alleles})</span> <a className="underline text-xs text-muted" href={gm.source.url} rel="noopener">{gm.source.label}</a></li>)}</ul></div>}
              <div className="card p-3"><div className="kicker mb-1">PDX and organoid banks</div><ul className="space-y-1">{[...d.models.pdx, ...d.models.organoids].map((r) => <li key={r.name}><a className="underline" href={r.url} rel="noopener">{r.name}</a></li>)}</ul></div>
              {d.models.caveats?.map((c, i) => <p key={i} className="text-xs text-muted">{c}</p>)}
            </div>
          </div>
        )}
      </Section>

      <Section id="questions" title="Open questions" aside={<Link href={`/open-questions/?subject=${encodeURIComponent(t.name)}`} className="text-xs underline text-muted">All open questions →</Link>}>
        {d.questions.length === 0 ? <p className="text-sm text-muted">No open questions recorded for this target yet. <Link className="underline" href="/suggest/">Suggest one</Link>.</p> : (
          <ol className="space-y-3">
            {d.questions.map((q, i) => (
              <li key={q.id} id={`q-${q.id}`} className="card p-4">
                <div className="flex items-baseline gap-3"><span className="font-mono text-muted text-sm">{String(i + 1).padStart(2, "0")}</span><h3 className="font-semibold leading-snug">{q.question}</h3></div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-xs"><Tip title="Stage" text="Where the answer has to come from: basic science, translational work, randomised trials or implementation."><span className="chip bg-foreground/5 capitalize cursor-help">{q.stage}</span></Tip><Tip title="Who acts" text="Who would have to move for the question to be answered."><span className="chip bg-foreground/5 capitalize cursor-help">{q.actor}</span></Tip></div>
                <p className="text-sm mt-2"><span className="font-medium">Why unresolved.</span> <span className="text-muted">{q.why}</span></p>
                <p className="text-sm mt-1.5"><span className="font-medium">What would answer it.</span> <span className="text-muted">{q.wouldAnswer}</span></p>
                <RefChips ids={q.refs} className="mt-2" />
                <a className="text-xs underline text-muted mt-2 inline-block" href={q.source.url} rel="noopener">Source: {q.source.label}</a>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {(d.ideas.length > 0 || d.companies.length > 0) && (
        <Section title="Ideas and companies">
          <div className="grid gap-6 md:grid-cols-2">
            <div><div className="kicker mb-1.5">Ideas · {d.ideas.length}</div><ChipList items={d.ideas} /></div>
            <div><div className="kicker mb-1.5">Companies · {d.companies.length}</div><ChipList items={d.companies} /></div>
          </div>
        </Section>
      )}

      <Section id="papers" title="Literature" aside={<Link href={`/preprints/#${t.id}`} className="text-xs underline text-muted">Preprints →</Link>}>
        {d.papers.length > 0 && (
          <ul className="space-y-2 mb-4">
            {d.papers.map((p) => (
              <li key={p.id} className="text-sm"><Link href={routeFor(p)} className="font-medium hover:underline">{p.name}</Link>{"journal" in p && <span className="text-muted"> · {(p as { journal: string }).journal} {(p as { year: number }).year}</span>}</li>
            ))}
          </ul>
        )}
        {query && <LatestPapers query={query} title={t.name} kind="target" pageSize={8} autoload={false} />}
      </Section>

      <Section id="export" title="Export">
        <p className="text-sm text-muted max-w-3xl">The dossier as machine-readable JSON, at <code className="text-xs">{dossierFile(t.id)}</code>: identifiers from HGNC, Ensembl, UniProt and ChEMBL, products with status, trials, pathways, hotspots, open questions and assays. The full entity record is in the <Link className="underline" href="/api/">open API</Link> at <code className="text-xs">/api/v1/entities/{t.id}.json</code>. Licence CC BY-NC 4.0.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <a href={dossierFile(t.id)} download={`onco-dossier-${t.id}.json`} className="chip border bg-card border-border hover:bg-foreground/5">Download dossier JSON</a>
          <a href={`/api/v1/entities/${t.id}.json`} className="chip border bg-card border-border hover:bg-foreground/5">Entity JSON</a>
          <Link href="/suggest/" className="chip border bg-card border-border hover:bg-foreground/5">Suggest a correction</Link>
        </div>
      </Section>
    </div>
  );
}

export { STATUS_LABEL as DOSSIER_STATUS_LABEL };

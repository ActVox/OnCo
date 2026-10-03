import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { WhatIsBeingDone } from "@/components/WhatIsBeingDone";
import { RecoveryMatrix, type MatrixCell, type MatrixColumn, type MatrixRow } from "@/components/RecoveryMatrix";
import {
  ENDOCRINE_EXCEPTION, OUTLOOK_META, RECOVERY_CELLS, RECOVERY_EFFECTS, RECOVERY_THRESHOLDS, RECOVERY_TREATMENTS,
  recoveryFill, type RecoveryOutlook,
} from "@/data/recovery-matrix";

export const metadata: Metadata = pageMeta({
  title: "What comes back after treatment",
  description: "Treatment by treatment and effect by effect: whether recovery is usual, partial or unlikely, how long it takes, in what proportion, and the source for each answer.",
  path: "/live/recovery/",
});

const OUTLOOK_ORDER: RecoveryOutlook[] = ["usual", "partial", "unlikely", "unknown"];

export default function RecoveryPage() {
  const g = graph();
  const fill = recoveryFill();

  // Validate every referenced id at build time, as the survivorship planner and the hair page do.
  const link = (id: string) => { const e = g.must(id); return { id, name: e.name, route: routeFor(e) }; };
  const rows: MatrixRow[] = RECOVERY_TREATMENTS.map((t) => ({
    id: t.id, label: t.label, group: t.group, plain: t.plain,
    links: [...t.drugIds.slice(0, 5), ...t.relatedIds].map(link),
  }));
  const columns: MatrixColumn[] = RECOVERY_EFFECTS.map((e) => ({ id: e.id, label: e.label, short: e.short, plain: e.plain, links: e.entityIds.map(link) }));
  const cells: MatrixCell[] = RECOVERY_CELLS.map((c) => ({
    treatment: c.treatment, effect: c.effect, outlook: c.outlook, line: c.line, timescale: c.timescale,
    proportion: c.proportion, source: c.source, also: c.also, quote: c.quote, searched: c.searched,
  }));
  for (const c of RECOVERY_CELLS) for (const id of c.drugIds ?? []) g.must(id);

  // Named gaps, counted rather than asserted.
  const emptyRows = RECOVERY_TREATMENTS.filter((t) => !RECOVERY_CELLS.some((c) => c.treatment === t.id));
  const thinColumns = RECOVERY_EFFECTS.map((e) => ({ e, n: RECOVERY_CELLS.filter((c) => c.effect === e.id).length })).sort((a, b) => a.n - b.n).slice(0, 5);
  const named = RECOVERY_CELLS.filter((c) => c.outlook === "unknown");

  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="What comes back after treatment"
        lede={`The question people ask when treatment ends is whether the damage is permanent, and the answer is scattered across papers they will never see. This page gathers it: ${fill.sourced} sourced answers across ${fill.treatments} treatments and ${fill.effects} lasting effects, filling ${fill.squares} of the ${fill.grid.toLocaleString("en-GB")} squares in the grid, which is ${fill.pct} per cent of it. ${fill.withProportion} answers carry a proportion from the source, ${fill.thresholds} published dose thresholds are listed separately, and ${fill.named} questions readers ask are written out as unanswered rather than left blank. The rest is empty because nothing was found to fill it: a blank here means unknown, never none. Trial and cohort populations differ from yours, so use this to know what to ask, not to decide a case.`} />
      <Container className="pb-16">
        <section aria-labelledby="legend" className="mb-8">
          <h2 id="legend" className="sr-only">How to read an answer</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {OUTLOOK_ORDER.map((o) => (
              <div key={o} className="card p-3">
                <span className={`chip ${OUTLOOK_META[o].chip} text-xs`}>{OUTLOOK_META[o].label}</span>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{OUTLOOK_META[o].blurb}</p>
                <p className="text-xs text-muted mt-1 tabular-nums">{RECOVERY_CELLS.filter((c) => c.outlook === o).length} answers</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="matrix">
          <h2 id="matrix" className="text-lg font-semibold tracking-tight mb-1">The matrix</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">One treatment at a time by default, because the grid is mostly empty and a reader should meet the answers before the holes. Switch to the grid to compare one effect across treatments. Every answer carries the source it was read from, and where the source gives a figure it is here with the cohort it came from.</p>
          <RecoveryMatrix rows={rows} columns={columns} cells={cells} />
        </section>

        {ENDOCRINE_EXCEPTION.rows.length > 0 && (
          <section className="mt-12" aria-labelledby="endocrine">
            <h2 id="endocrine" className="text-lg font-semibold tracking-tight mb-1">{ENDOCRINE_EXCEPTION.title}</h2>
            <p className="text-sm text-muted max-w-3xl mb-4 leading-relaxed">{ENDOCRINE_EXCEPTION.intro}</p>
            <div className="overflow-x-auto">
              <table className="onco w-full text-sm">
                <thead><tr><th className="text-left">Gland</th><th className="text-left">What happens</th><th className="text-left">Does it come back</th><th className="text-left">What the source says</th></tr></thead>
                <tbody>
                  {ENDOCRINE_EXCEPTION.rows.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium align-top">{r.gland}</td>
                      <td className="align-top leading-relaxed">{r.what}</td>
                      <td className="align-top"><span className={`chip ${OUTLOOK_META[r.outlook].chip} text-xs`}>{OUTLOOK_META[r.outlook].label}</span>{r.proportion && <div className="text-xs text-muted mt-1">{r.proportion.figure} <span className="text-muted">({r.proportion.cohort})</span></div>}</td>
                      <td className="align-top text-muted leading-relaxed">{r.quote && <span className="italic">&ldquo;{r.quote}&rdquo; </span>}<a className="text-[11px] underline break-words" href={r.source.url} rel="noopener">{r.source.label}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted max-w-3xl mt-3 leading-relaxed">{ENDOCRINE_EXCEPTION.outro}</p>
          </section>
        )}

        {RECOVERY_THRESHOLDS.length > 0 && (
          <section className="mt-12" aria-labelledby="dose">
            <h2 id="dose" className="text-lg font-semibold tracking-tight mb-1">The dose decides</h2>
            <p className="text-sm text-muted max-w-3xl mb-4">Where a published threshold exists, the number is here rather than in a sentence, because it is the number to ask your team about: how much of this drug have I had in total, and how much is the organ at risk going to receive. Each row is in the source&apos;s own terms.</p>
            <div className="overflow-x-auto">
              <table className="onco w-full text-sm">
                <thead><tr><th className="text-left">Treatment</th><th className="text-left">What it affects</th><th className="text-left">The published threshold</th><th className="text-left">Measured in</th></tr></thead>
                <tbody>
                  {RECOVERY_THRESHOLDS.map((t) => (
                    <tr key={t.id}>
                      <td className="font-medium align-top">{RECOVERY_TREATMENTS.find((r) => r.id === t.treatment)?.label ?? t.treatment}</td>
                      <td className="align-top text-muted">{RECOVERY_EFFECTS.find((e) => e.id === t.effect)?.label ?? t.effect}</td>
                      <td className="align-top leading-relaxed">{t.threshold}{t.quote && <div className="text-xs text-muted mt-1 italic">&ldquo;{t.quote}&rdquo;</div>}</td>
                      <td className="align-top text-muted leading-relaxed">{t.cohort}<br /><a className="text-[11px] underline break-words" href={t.source.url} rel="noopener">{t.source.label}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="mt-12" aria-labelledby="missing">
          <h2 id="missing" className="text-lg font-semibold tracking-tight mb-1">What is missing, named</h2>
          <p className="text-sm text-muted max-w-3xl mb-4 leading-relaxed">
            {fill.pct} per cent of the grid is filled. Part of the rest is pairs that do not arise, and part is a real hole in the literature: effects are counted at the end of a trial and rarely followed until they resolve or do not, so the question a patient asks is often the one nobody measured.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <div className="font-semibold leading-snug">The thinnest columns</div>
              <ul className="text-sm text-muted mt-2 space-y-1">
                {thinColumns.map(({ e, n }) => <li key={e.id}><span className="text-foreground">{e.label}:</span> {n} sourced {n === 1 ? "answer" : "answers"} across {fill.treatments} treatments</li>)}
              </ul>
            </div>
            <div className="card p-4">
              <div className="font-semibold leading-snug">Questions with no answer in the literature</div>
              {named.length > 0 ? (
                <ul className="text-sm text-muted mt-2 space-y-1.5">
                  {named.map((c) => <li key={`${c.treatment}-${c.effect}`}><span className="text-foreground">{RECOVERY_TREATMENTS.find((t) => t.id === c.treatment)?.label}, {RECOVERY_EFFECTS.find((e) => e.id === c.effect)?.label.toLowerCase()}:</span> {c.line}</li>)}
                </ul>
              ) : <p className="text-sm text-muted mt-2">None recorded yet.</p>}
              {emptyRows.length > 0 && <p className="text-sm text-muted mt-3">Treatments with no sourced answer yet: {emptyRows.map((t) => t.label).join(", ")}.</p>}
            </div>
          </div>
        </section>

        <div className="mt-10"><WhatIsBeingDone topic="side-effects" compact /></div>

        <p className="text-xs text-muted mt-8 max-w-3xl">
          Related: <Link className="underline" href="/survivorship/">the survivorship planner</Link>, which gives the screening test and the interval for each late effect, is the next page after this one · <Link className="underline" href="/fronts/rejuvenation/">recovery and rejuvenation</Link> · <Link className="underline" href="/live/hair/">hair loss and regrowth</Link> · <Link className="underline" href="/toxicity/">side effect rates across a drug class</Link> · <Link className="underline" href="/irae/">checkpoint side effects by organ</Link>. Figures are quoted from the cohort or trial named beside them and are not adjusted for differences between populations; OnCo is orientation, not medical advice.
        </p>
      </Container>
    </>
  );
}

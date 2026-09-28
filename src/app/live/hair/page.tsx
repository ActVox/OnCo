import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, StatusChip } from "@/components/ui";
import { EvidenceGradeChip } from "@/components/EvidenceGradeChip";
import { WhatIsBeingDone } from "@/components/WhatIsBeingDone";
import { Tip } from "@/components/Tip";
import { DEGREE_LABEL, DEGREE_ORDER, HAIR_LOSS_CAUSES, HAIR_PROBLEMS, REGROWTH_TIMELINE, WIG_PROVISION } from "@/data/hair-loss";
import { COMPLEMENTARY_INDEX } from "@/data/complementary";

export const metadata: Metadata = pageMeta({
  title: "Hair loss and regrowth",
  description: "Scalp cooling (DigniCap, Paxman) and which chemotherapy regimens it suits, minoxidil for persistent and endocrine-therapy thinning, eyebrows and lashes, wigs on the NHS and by prescription in the US, cold cap charities, which drugs cause hair loss and when hair returns.",
  path: "/live/hair/",
});

const SOLUTIONS = ["scalp-cooling", "minoxidil-chemotherapy-alopecia", "bimatoprost-eyelash-regrowth", "wigs-cranial-prosthesis"];

function EntityChip({ e }: { e: Entity }) {
  return (
    <Tip title={e.name} text={e.tldr} href={routeFor(e)}>
      <Link href={routeFor(e)} className="chip bg-foreground/5 hover:bg-foreground/10 transition">{e.name}</Link>
    </Tip>
  );
}

export default function HairPage() {
  const g = graph();
  // Validate every referenced id at build time, like the survivorship planner does.
  for (const c of HAIR_LOSS_CAUSES) for (const id of [...c.drugIds, ...(c.technologyIds ?? [])]) g.must(id);
  for (const p of HAIR_PROBLEMS) for (const id of p.entityIds) g.must(id);
  const solutions = SOLUTIONS.map((id) => g.must(id));
  const gradeOf = (id: string) => COMPLEMENTARY_INDEX.find((c) => c.id === id)?.grade;

  /** Alopecia rate from a drug's own toxicity rows, if the label or pivotal trial recorded one. */
  const alopeciaRate = (e: Entity) => {
    if (e.kind !== "drug") return undefined;
    const row = e.toxicity.find((t) => /alopecia|hair/i.test(t.event));
    return row ? { pct: row.anyGradePct, source: row.source, note: row.note } : undefined;
  };
  const drugsWithRates = HAIR_LOSS_CAUSES.flatMap((c) => c.drugIds.map((id) => g.must(id))).filter((d) => alopeciaRate(d)?.pct !== undefined).length;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="Hair loss and regrowth"
        lede="Hair loss is among the most feared effects of cancer treatment, and it is one of the few with a device that prevents it in about half of the people who use it. This page starts with what works: scalp cooling and the regimens it suits best, minoxidil for hair that stays thin, a lash-growth drop with a randomised trial, and how wigs are paid for in the UK and the US. Then which drugs cause it and how much, when hair comes back, and what is being tried next. Each problem is paired with what is being done about it." />
      <Container className="pb-16">
        <section aria-labelledby="works">
          <h2 id="works" className="text-lg font-semibold tracking-tight mb-3">What works now</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {solutions.map((e) => (
              <Link key={e.id} href={routeFor(e)} className="card p-4 flex flex-col">
                <div className="flex flex-wrap items-center gap-1.5 mb-2"><EvidenceGradeChip grade={gradeOf(e.id)} size="xs" /><StatusChip status={e.status} /></div>
                <div className="font-semibold leading-snug text-balance">{e.name}</div>
                <p className="text-sm text-muted mt-1.5 leading-relaxed line-clamp-5">{e.tldr}</p>
                <div className="relative mt-3 text-sm font-medium text-accent">Open <span aria-hidden>→</span></div>
              </Link>
            ))}
          </div>
          <div className="card p-4 mt-3 text-sm">
            <div className="kicker mb-1.5">Scalp cooling: which regimens</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div><div className="font-medium">Best</div><p className="text-muted leading-relaxed">Taxane alone: weekly paclitaxel, docetaxel, docetaxel-cyclophosphamide. About half of women kept most of their hair in the SCALP trial and two thirds in the DigniCap cohort on non-anthracycline taxane regimens.</p></div>
              <div><div className="font-medium">Weaker</div><p className="text-muted leading-relaxed">Anthracycline-containing regimens (AC, EC, FEC, then a taxane). Preservation rates were low in trials; cooling is still offered and some people keep enough hair to avoid a wig.</p></div>
              <div><div className="font-medium">Not used</div><p className="text-muted leading-relaxed">Leukaemia, lymphoma and myeloma, because of the theoretical risk of leaving disease in the scalp; oral drugs taken for years (endocrine therapy, CDK4/6 inhibitors), where the answer is minoxidil.</p></div>
            </div>
            <p className="text-[11px] text-muted mt-3">DigniCap: FDA cleared December 2015 (breast), extended to solid tumours July 2017. Paxman: cleared April 2017 (breast), extended to solid tumours June 2018. The cap goes on about 30 minutes before the infusion and stays on for 60 to 90 minutes after it, so each visit is longer.</p>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="problems">
          <h2 id="problems" className="text-lg font-semibold tracking-tight mb-1">Problems and what is being done</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Mechanism first, then what works today, then what is in progress. Only measures with a trial, a published series or a live programme are listed.</p>
          <div className="space-y-4">
            {HAIR_PROBLEMS.map((p) => {
              const ents = p.entityIds.map((id) => g.must(id));
              return (
                <details key={p.id} id={p.id} className="card p-4" open={p.id === "prevention"}>
                  <summary className="cursor-pointer list-none">
                    <div className="font-semibold leading-snug">{p.title}</div>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{p.problem}</p>
                  </summary>
                  <div className="mt-4 grid gap-5 md:grid-cols-[1fr_1fr]">
                    <div>
                      <div className="kicker mb-1">Why it happens</div>
                      <p className="text-sm leading-relaxed text-foreground/85">{p.mechanism}</p>
                      <div className="kicker mt-4 mb-1">What works now</div>
                      <ul className="text-sm space-y-1.5 list-disc pl-5">{p.worksNow.map((w, i) => <li key={i} className="leading-relaxed">{w}</li>)}</ul>
                    </div>
                    <div>
                      <div className="kicker mb-1">What is being done about this</div>
                      <ul className="text-sm space-y-1.5 list-disc pl-5">{p.inProgress.map((w, i) => <li key={i} className="leading-relaxed">{w}</li>)}</ul>
                      <div className="kicker mt-4 mb-1.5">On OnCo</div>
                      <div className="flex flex-wrap gap-1.5">{ents.map((e) => <EntityChip key={e.id} e={e} />)}</div>
                      <div className="kicker mt-4 mb-1">Sources</div>
                      <ul className="text-xs space-y-1">{p.sources.map((s) => <li key={s.url}><a className="underline break-words" href={s.url} rel="noopener">{s.label}</a></li>)}</ul>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="timeline">
          <h2 id="timeline" className="text-lg font-semibold tracking-tight mb-1">Timing of loss and regrowth</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Typical timings from patient guidance; your team can tell you what to expect with your regimen.</p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {REGROWTH_TIMELINE.map((s, i) => (
              <li key={i} className="card p-4">
                <div className="kicker">{s.when}</div>
                <p className="text-sm mt-1.5 leading-relaxed">{s.what}</p>
                <a className="text-[11px] text-muted underline mt-2 inline-block" href={s.source.url} rel="noopener">{s.source.label}</a>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12" aria-labelledby="causes">
          <h2 id="causes" className="text-lg font-semibold tracking-tight mb-1">Drugs that cause hair loss</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">By drug class, most to least. Percentages are the any-grade alopecia rates recorded on each drug&apos;s own record from its label or pivotal trial ({drugsWithRates} drugs carry one); hover a drug for its summary. Combination regimens take the risk of their most alopecia-inducing component.</p>
          <div className="overflow-x-auto">
            <table className="onco w-full text-sm">
              <thead><tr><th className="text-left">Class</th><th className="text-left">How much</th><th className="text-left">Drugs on OnCo</th><th className="text-left">Pattern and what helps</th></tr></thead>
              <tbody>
                {DEGREE_ORDER.flatMap((deg) => HAIR_LOSS_CAUSES.filter((c) => c.degree === deg)).map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium align-top">{c.group}</td>
                    <td className="align-top"><span className="text-muted">{DEGREE_LABEL[c.degree]}</span></td>
                    <td className="align-top">
                      <div className="flex flex-wrap gap-1">
                        {[...c.drugIds, ...(c.technologyIds ?? [])].map((id) => {
                          const e = g.must(id);
                          const r = alopeciaRate(e);
                          return (
                            <span key={id} className="inline-flex items-center gap-1">
                              <EntityChip e={e} />
                              {r?.pct !== undefined && <span className="text-xs tabular-nums text-muted" title={r.note ? `${r.note}` : undefined}>{r.source ? <a className="underline" href={r.source} rel="noopener">{r.pct}%</a> : `${r.pct}%`}</span>}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="align-top text-muted">
                      <p>{c.note}</p>
                      {c.persistent && <p className="mt-1"><span className="text-foreground">Lasting: </span>{c.persistent}</p>}
                      <p className="mt-1"><span className="text-foreground">Helps: </span>{c.helps}</p>
                      <a className="text-[11px] underline" href={c.source.url} rel="noopener">{c.source.label}</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="wigs">
          <h2 id="wigs" className="text-lg font-semibold tracking-tight mb-1">Paying for wigs and cold caps</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Who provides what, by country. Charges and eligibility change; follow the links for the current rules.</p>
          <div className="grid gap-3 lg:grid-cols-3">
            {WIG_PROVISION.map((w) => (
              <div key={w.region} className="card p-4">
                <div className="font-semibold mb-2">{w.title}</div>
                <ul className="space-y-3 text-sm">
                  {w.rows.map((r) => <li key={r.label}><a className="font-medium underline" href={r.url} rel="noopener">{r.label}</a><p className="text-muted mt-0.5 leading-relaxed">{r.detail}</p></li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10"><WhatIsBeingDone topic="side-effects" compact /></div>

        <p className="text-xs text-muted mt-8 max-w-3xl">Related: <Link className="underline" href="/live/complementary/">complementary and supportive approaches</Link> · <Link className="underline" href="/side-effects/">side effects, symptom first</Link> · <Link className="underline" href="/toxicity/">side effects across a drug class</Link> · <Link className="underline" href="/survivorship/">survivorship planner</Link>. Rates come from labels and pivotal trials and are not adjusted for differences between trial populations. OnCo is orientation, not medical advice; your team&apos;s advice about your regimen takes precedence.</p>
      </Container>
    </>
  );
}

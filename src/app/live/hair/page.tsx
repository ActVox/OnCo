import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, StatusChip } from "@/components/ui";
import { EvidenceGradeChip } from "@/components/EvidenceGradeChip";
import { WhatIsBeingDone } from "@/components/WhatIsBeingDone";
import { Tip } from "@/components/Tip";
import {
  DEGREE_LABEL, DEGREE_ORDER, HAIR_LOSS_CAUSES, HAIR_PROBLEMS, REGROWTH_TIMELINE, WIG_PROVISION,
  SCALP_COOLING_EVIDENCE, SCALP_COOLING_PRACTICAL, COOLING_DEVICES, HAIR_PRACTICAL,
} from "@/data/hair-loss";
import { HAIR_QUESTION_SETTINGS, hairQuestions } from "@/data/hair-questions";
import { COMPLEMENTARY_INDEX } from "@/data/complementary";
import { GRADE_META, type EvidenceGrade } from "@/lib/complementary";

export const metadata: Metadata = pageMeta({
  title: "Hair loss and regrowth",
  description: "Scalp cooling and how well it works for your own regimen, what happens and when by drug class, persistent chemotherapy alopecia, endocrine-therapy thinning, every regrowth treatment graded by its evidence, wigs and scalp care, and the questions to ask at each stage.",
  path: "/live/hair/",
});

/** The headline four: the approaches with the most behind them, in the order a reader meets them. */
const SOLUTIONS = ["scalp-cooling", "minoxidil-chemotherapy-alopecia", "bimatoprost-eyelash-regrowth", "wigs-cranial-prosthesis"];
/** The three things that happen when hair does not simply come back. Records in src/data/hair.ts. */
const PERSISTENT_IDS = ["alopecia-persistent-chemotherapy", "alopecia-endocrine-therapy", "alopecia-radiotherapy-persistent"];
const GRADE_ORDER: EvidenceGrade[] = ["strong", "moderate", "insufficient", "no-benefit", "harm"];

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
  const persistent = PERSISTENT_IDS.map((id) => g.must(id));
  const gradeOf = (id: string) => COMPLEMENTARY_INDEX.find((c) => c.id === id)?.grade;

  /** Every graded approach whose purpose includes hair, strongest evidence first. Picks up new records automatically. */
  const graded = COMPLEMENTARY_INDEX
    .filter((c) => c.uses.includes("hair-loss"))
    .map((c) => ({ ...c, entity: g.must(c.id) }))
    .sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade) || a.entity.name.localeCompare(b.entity.name));

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
        lede="Hair is the loss people can see, and it is one of the few effects of treatment with a device that prevents it in about half of the people who use it. This page gives the number for your own regimen rather than the headline number, says what happens and when by drug class, names the two things patients are least often warned about (hair that never fully returns after a taxane, and the slow thinning of years on endocrine therapy), and grades every regrowth treatment that is offered or sold, including the ones with nothing behind them. Then the practical part: wigs and who pays, scalp care, and what to ask at each stage." />
      <Container className="pb-16">
        <section aria-labelledby="works">
          <h2 id="works" className="text-lg font-semibold tracking-tight mb-3">Start here</h2>
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
        </section>

        <section className="mt-12" aria-labelledby="cooling">
          <h2 id="cooling" className="text-lg font-semibold tracking-tight mb-1">Scalp cooling: the number for your regimen</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Two studies published in the same issue of one journal in 2017 are what the practice rests on, and they enrolled different regimens, so the figure you are quoted depends on which one it comes from. Each row below gives the result in the words and numbers of the paper, and what that row does not settle.</p>
          <div className="overflow-x-auto">
            <table className="onco w-full text-sm">
              <thead><tr><th className="text-left">Regimen studied</th><th className="text-left">What was found</th><th className="text-left">What it does not settle</th></tr></thead>
              <tbody>
                {SCALP_COOLING_EVIDENCE.map((r) => (
                  <tr key={r.regimen}>
                    <td className="font-medium align-top">{r.regimen}</td>
                    <td className="align-top leading-relaxed">{r.result}</td>
                    <td className="align-top text-muted leading-relaxed">{r.caveat}<br /><a className="text-[11px] underline break-words" href={r.source.url} rel="noopener">{r.source.label}</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 mt-4">
            {SCALP_COOLING_PRACTICAL.map((f) => (
              <div key={f.question} className="card p-4">
                <div className="font-semibold leading-snug">{f.question}</div>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{f.answer}</p>
                <a className="text-[11px] underline break-words mt-2 inline-block" href={f.source.url} rel="noopener">{f.source.label}</a>
                {f.also && <a className="text-[11px] underline break-words mt-1 inline-block" href={f.also.url} rel="noopener">{f.also.label}</a>}
              </div>
            ))}
          </div>
          <h3 className="text-base font-semibold tracking-tight mt-8 mb-2">The devices</h3>
          <p className="text-sm text-muted max-w-3xl mb-3">Every device the United States Food and Drug Administration has authorised as a scalp cooling system, read from its own 510(k) and De Novo records rather than from the manufacturers. Manual gel caps (Penguin, Chemo Cold Caps, Arctic) are a separate and older route: they are swapped from dry ice every twenty to thirty minutes and need someone to help.</p>
          <div className="overflow-x-auto">
            <table className="onco w-full text-sm">
              <thead><tr><th className="text-left">Device</th><th className="text-left">Maker</th><th className="text-left">Authorisation</th><th className="text-left">What it is authorised for</th></tr></thead>
              <tbody>
                {COOLING_DEVICES.map((d, i) => (
                  <tr key={`${d.device}-${i}`}>
                    <td className="font-medium align-top">{d.device}</td>
                    <td className="align-top text-muted">{d.maker}</td>
                    <td className="align-top tabular-nums">{d.authorisation}</td>
                    <td className="align-top text-muted leading-relaxed">{d.indication}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted mt-2">None of these is authorised for blood cancers: the labels stop at solid tumours. <a className="underline" href="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm" rel="noopener">FDA 510(k) database, product code PMC (scalp cooling system)</a>. OnCo uses manufacturers only for what a device is, never for whether it works.</p>
        </section>

        <section className="mt-12" aria-labelledby="timeline">
          <h2 id="timeline" className="text-lg font-semibold tracking-tight mb-1">What happens, and when</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Typical timings from patient guidance. Your team can tell you what they see with your regimen; the order is more reliable than the dates.</p>
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
          <h2 id="causes" className="text-lg font-semibold tracking-tight mb-1">By drug class</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Most to least. Percentages are the any-grade alopecia rates recorded on each drug&apos;s own record from its label or pivotal trial ({drugsWithRates} drugs carry one); hover a drug for its summary. A combination regimen takes the risk of its strongest component.</p>
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

        <section className="mt-12" aria-labelledby="persistent">
          <h2 id="persistent" className="text-lg font-semibold tracking-tight mb-1">When it does not simply come back</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Three things patients are least often warned about before treatment. Each has a record with the measured rates and what is known about treating it.</p>
          <div className="grid gap-3 lg:grid-cols-3">
            {persistent.map((e) => (
              <Link key={e.id} href={routeFor(e)} className="card p-4 flex flex-col">
                <div className="font-semibold leading-snug text-balance">{e.name}</div>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{e.tldr}</p>
                <div className="relative mt-3 text-sm font-medium text-accent">Open <span aria-hidden>→</span></div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="graded">
          <h2 id="graded" className="text-lg font-semibold tracking-tight mb-1">What helps regrowth, graded</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">Everything offered or sold for hair after cancer treatment, with the evidence behind it stated plainly. &quot;Insufficient&quot; means no reliable human evidence of benefit, not that it is known to fail; it is the honest grade for most of what is advertised, and it is here because a reader who finds nothing finds the advertisement instead.</p>
          <div className="overflow-x-auto">
            <table className="onco w-full text-sm">
              <thead><tr><th className="text-left">Approach</th><th className="text-left">Evidence</th><th className="text-left">What the evidence is</th><th className="text-left">Guideline</th></tr></thead>
              <tbody>
                {graded.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium align-top"><Link className="underline" href={routeFor(c.entity)}>{c.entity.name}</Link></td>
                    <td className="align-top"><EvidenceGradeChip grade={c.grade} size="xs" /></td>
                    <td className="align-top leading-relaxed">{c.line}</td>
                    <td className="align-top text-muted">{c.guideline ?? "None speaks to it."}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted mt-2">{GRADE_META.insufficient.blurb}</p>
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

        <section className="mt-12" aria-labelledby="wigs">
          <h2 id="wigs" className="text-lg font-semibold tracking-tight mb-1">Wigs, coverings and who pays</h2>
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

        <section className="mt-12" aria-labelledby="practical">
          <h2 id="practical" className="text-lg font-semibold tracking-tight mb-1">Scalp care, telling people, and work</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">The part of hair loss a person can act on from the first week, and the part that follows them out of the hospital.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HAIR_PRACTICAL.map((r) => (
              <div key={r.title} className="card p-4">
                <div className="font-semibold leading-snug">{r.title}</div>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{r.detail}</p>
                <a className="text-[11px] underline break-words mt-2 inline-block" href={r.source.url} rel="noopener">{r.source.label}</a>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="questions">
          <h2 id="questions" className="text-lg font-semibold tracking-tight mb-1">Questions to ask, by stage</h2>
          <p className="text-sm text-muted max-w-3xl mb-4">{hairQuestions.length} questions, each with the reason it is worth asking and the source that reason rests on. Print this section for the appointment; the answers are the ones your own team gives.</p>
          <div className="space-y-6">
            {HAIR_QUESTION_SETTINGS.map((s) => (
              <section key={s}>
                <h3 className="font-medium mb-2">{s}</h3>
                <ol className="space-y-2.5 list-decimal pl-5">
                  {hairQuestions.filter((q) => q.setting === s).map((q, i) => (
                    <li key={i} className="text-[15px] leading-relaxed">
                      <span>{q.question}</span>
                      <div className="text-sm text-muted mt-0.5">Why: {q.why}</div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </section>

        <div className="mt-10"><WhatIsBeingDone topic="side-effects" compact /></div>

        <p className="text-xs text-muted mt-8 max-w-3xl">Related: <Link className="underline" href="/live/complementary/">complementary and supportive approaches</Link> · <Link className="underline" href="/side-effects/">side effects, symptom first</Link> · <Link className="underline" href="/toxicity/">side effects across a drug class</Link> · <Link className="underline" href="/survivorship/">survivorship planner</Link>. Rates come from labels and pivotal trials and are not adjusted for differences between trial populations. OnCo is orientation, not medical advice; your team&apos;s advice about your regimen takes precedence.</p>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { logoSrc } from "@/lib/logos";
import { ukPathwayCancerIds, ukPathwayFor, ukPathwayRoute, ukPathwayUrls, type UkCentre, type UkDecision, type UkFundingRow, type UkNation, type UkPathway, type UkSource } from "@/lib/uk-pathway";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CancerIcon } from "@/components/CancerIcon";
import { PrintButton } from "@/components/PrintButton";
import { RowAvatar } from "@/components/RowAvatar";
import { SurvivalDisclosure } from "@/components/SurvivalDisclosure";
import { SectionStrip } from "@/components/SectionStrip";

/**
 * Only the cancers that have a pathway. Without `dynamicParams = false` the dev server tries to render any other
 * id and throws a 500, which reads like a broken page: a reviewer reported /cancers/glioblastoma/uk/ as broken
 * when the export correctly serves a 404, because no such page exists. The sibling [section] route already does
 * this. Now dev and production agree.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return ukPathwayCancerIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = ukPathwayFor(id);
  return p ? pageMeta({ title: `${p.cancerName} · UK and NHS`, description: `${p.cancerName} in the NHS: the pathway and its waiting-time standards, the specialist centres, what NICE and the SMC fund by line of treatment, the National Genomic Test Directory tests to ask for, the trials open in the UK, the UK figures with their sources, support, and how England, Scotland, Wales and Northern Ireland differ.`, path: ukPathwayRoute(id) }) : {};
}

/** Small line icons so each section has a glyph; drawn inline to avoid a dependency. */
function Ico({ name, className = "h-4 w-4" }: { name: "door" | "clock" | "hospital" | "pound" | "dna" | "flask" | "chart" | "hands" | "flag" | "book" | "list" | "gap" | "link"; className?: string }) {
  const paths: Record<typeof name, ReactNode> = {
    door: <><path d="M5 21V4a1 1 0 0 1 1-1h9v18" /><path d="M15 3l4 2v16" /><circle cx="12" cy="12" r=".8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    hospital: <><path d="M3 21V8l9-5 9 5v13" /><path d="M9 21v-6h6v6" /><path d="M12 9v4M10 11h4" /></>,
    pound: <><path d="M15 6.5A3.5 3.5 0 0 0 8 8v9H6" /><path d="M6 17h10" /><path d="M7 12h6" /></>,
    dna: <><path d="M7 3c0 6 10 6 10 12v6" /><path d="M17 3c0 6-10 6-10 12v6" /><path d="M8 8h8M8 16h8" /></>,
    flask: <><path d="M9 3h6" /><path d="M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" /><path d="M7.5 15h9" /></>,
    chart: <><path d="M4 20V5" /><path d="M4 20h16" /><path d="M8 16v-5M12 16V8M16 16v-3" /></>,
    hands: <><path d="M4 13l4 4h7l5-5" /><path d="M9 17v3" /><path d="M14 8l3-3a2 2 0 0 1 3 3l-4 4" /><path d="M7 11a3 3 0 0 1 3-3h3" /></>,
    flag: <><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>,
    book: <><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" /><path d="M4 19a2 2 0 0 1 2-2h13" /><path d="M8 7h7" /></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
    gap: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.5" r=".6" /></>,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

const SECTIONS: Array<{ id: string; label: string; icon: Parameters<typeof Ico>[0]["name"] }> = [
  { id: "pathway", label: "Your pathway in the NHS", icon: "clock" },
  { id: "centres", label: "Where you would be treated", icon: "hospital" },
  { id: "funding", label: "What the NHS funds today", icon: "pound" },
  { id: "tests", label: "Tests you can ask for", icon: "dna" },
  { id: "trials", label: "Trials open in the UK", icon: "flask" },
  { id: "data", label: "UK data", icon: "chart" },
  { id: "support", label: "Support in the UK", icon: "hands" },
  { id: "nations", label: "Across the four nations", icon: "flag" },
];

function Kicker({ icon, children }: { icon: Parameters<typeof Ico>[0]["name"]; children: ReactNode }) {
  return <div className="kicker mb-2 inline-flex items-center gap-1.5"><Ico name={icon} className="h-3.5 w-3.5" />{children}</div>;
}

function Sources({ items, className = "" }: { items: UkSource[]; className?: string }) {
  if (!items.length) return null;
  return (
    <p className={`text-xs text-muted ${className}`}>
      Sources: {items.map((s, i) => <span key={s.url + i}>{i > 0 && "; "}<a href={s.url} className="underline" rel="noopener noreferrer">{s.label}</a>{s.date && <span> ({s.date})</span>}</span>)}
    </p>
  );
}

function SectionHead({ id, title, icon, lede }: { id: string; title: string; icon: Parameters<typeof Ico>[0]["name"]; lede?: string }) {
  return (
    <div className="mb-3">
      <h2 id={id} className="text-xl font-semibold tracking-tight inline-flex items-center gap-2 scroll-mt-24"><span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"><Ico name={icon} className="h-4 w-4" /></span>{title}</h2>
      {lede && <p className="text-sm text-muted mt-1 max-w-3xl">{lede}</p>}
    </div>
  );
}

const NATION_ORDER: UkNation[] = ["England", "Scotland", "Wales", "Northern Ireland"];

function CentreCard({ c }: { c: UkCentre }) {
  const g = graph();
  const inst = c.institutionId ? g.get(c.institutionId) : undefined;
  const website = inst && inst.kind === "institution" ? inst.website : undefined;
  const src = logoSrc(c.institutionId, website ?? c.url);
  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-start gap-3">
        <RowAvatar src={src} name={c.name} />
        <div className="min-w-0">
          {inst ? <Link href={routeFor(inst)} className="font-semibold hover:underline">{c.name}</Link> : <span className="font-semibold">{c.name}</span>}
          {c.trust && <div className="text-xs text-muted mt-0.5">{c.trust}</div>}
          <div className="text-xs text-muted">{c.city}</div>
        </div>
      </div>
      <ul className="mt-3 text-sm list-disc ps-5 space-y-0.5 text-foreground/85 flex-1">{c.offers.map((o, i) => <li key={i}>{o}</li>)}</ul>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <a href={c.url} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1" rel="noopener noreferrer"><Ico name="link" className="h-3 w-3" />Service page</a>
        {inst && <Link href={`/second-opinion/`} className="underline text-muted">Second opinion</Link>}
        <span className="text-muted">Listed by {c.sources.map((s, i) => <span key={s.url}>{i > 0 && ", "}<a href={s.url} className="underline" rel="noopener noreferrer">{s.label.split(":")[0]}</a></span>)}</span>
      </div>
    </div>
  );
}

function DecisionCell({ d }: { d: UkDecision }) {
  const tone = /not available|not recommended|terminated|non-submission/i.test(d.decision) ? "bg-red-500/10 text-red-700 dark:text-red-300" : /under consideration|pending|check/i.test(d.decision) ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : /not appraised|routinely/i.test(d.decision) ? "bg-foreground/5" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  return (
    <div className="text-sm">
      <a href={d.url} className={`chip ${tone} hover:underline`} rel="noopener noreferrer">{d.body}{d.ref ? ` ${d.ref}` : ""}{d.cdf ? " · CDF" : ""}</a>
      {d.date && <span className="ms-1 text-xs text-muted tabular-nums">{d.date}</span>}
      <div className="mt-1 text-foreground/85">{d.decision}</div>
    </div>
  );
}

function FundingRow({ f }: { f: UkFundingRow }) {
  const g = graph();
  return (
    <tr className="border-t border-border align-top">
      <td className="py-3 pe-3 font-medium whitespace-nowrap">{f.line}</td>
      <td className="py-3 pe-3">
        <div className="text-[15px]">{f.treatment}</div>
        <div className="mt-1 flex flex-wrap gap-1">{f.refs.map((id) => { const e = g.get(id); return e ? <Link key={id} href={routeFor(e)} className="chip bg-foreground/5 text-[11px] hover:bg-foreground/10">{e.name}</Link> : null; })}</div>
        {f.note && <div className="mt-1 text-xs text-muted">{f.note}</div>}
      </td>
      <td className="py-3 pe-3"><DecisionCell d={f.england} /></td>
      <td className="py-3 pe-3">{f.scotland ? <DecisionCell d={f.scotland} /> : <span className="text-xs text-muted">Not checked</span>}</td>
      <td className="py-3 text-xs text-muted">{f.wales && <div><span className="font-medium text-foreground/80">Wales:</span> {f.wales}</div>}{f.northernIreland && <div><span className="font-medium text-foreground/80">NI:</span> {f.northernIreland}</div>}</td>
    </tr>
  );
}

function Page({ p, id }: { p: UkPathway; id: string }) {
  const g = graph();
  const cancer = g.get(id) ?? g.get(p.cancerId);
  const cancerRoute = cancer ? routeFor(cancer) : "/cancers/";
  const short = p.cancerName.replace(/\s*\(.*?\)\s*$/, "");
  const nations = NATION_ORDER.filter((n) => p.centres.some((c) => c.nation === n));
  const urls = ukPathwayUrls(p);
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cancers", href: "/cancers/" }, { label: p.cancerName, href: cancerRoute }, { label: "UK and NHS", href: ukPathwayRoute(id) }]} />
      <PageHeader
        kicker={<GroupKicker id="live"><span className="kicker">·</span><Link href="/coverage/uk/" className="kicker hover:underline">NHS coverage</Link></GroupKicker>}
        title={`${short} in the UK and the NHS`}
        lede={p.intro}
        logo={<span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">{cancer ? <CancerIcon cancerId={cancer.id} className="h-8 w-8" /> : <Ico name="flag" className="h-7 w-7" />}</span>}
        right={<div className="flex flex-col items-end gap-2 text-xs text-muted"><PrintButton /><Link href={cancerRoute} className="underline">Cancer page →</Link><a href={`/api/v1/cancers/${p.cancerId}/uk.json`} className="underline">JSON →</a><span>Checked {p.asOf}</span></div>} />
      <Container className="pb-16">
        <SectionStrip cancerId={id} current="where-you-are" />
        <nav aria-label="Sections" className="card p-4 mb-8">
          <Kicker icon="list">On this page</Kicker>
          <ol className="flex flex-wrap gap-2">
            {SECTIONS.map((s, i) => <li key={s.id}><a href={`#${s.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-sm hover:border-accent hover:bg-accent-soft"><span className="text-muted tabular-nums text-xs">{i + 1}</span><Ico name={s.icon} className="h-3 w-3 text-muted" /><span>{s.label}</span></a></li>)}
          </ol>
        </nav>

        <section className="mb-10">
          <SectionHead id="pathway" title="Your pathway in the NHS" icon="clock" lede="How the cancer usually comes to light, then the national standards that time each step. The standards are England's unless the four-nations section says otherwise." />
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            {p.presentation.map((x) => (
              <div key={x.title} className="card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><div className="font-semibold inline-flex flex-wrap items-center gap-1.5 min-w-0"><Ico name="door" className="h-4 w-4 text-accent" />{x.title}</div>{x.share && <span className="chip bg-accent-soft text-accent text-[11px] tabular-nums whitespace-normal">{x.share}</span>}</div>
                <p className="text-sm mt-2 text-foreground/85 leading-relaxed">{x.detail}</p>
                <Sources items={x.sources} className="mt-2" />
              </div>
            ))}
          </div>
          <ol className="relative border-s border-border ms-3 space-y-4">
            {p.timeline.map((t, i) => (
              <li key={t.id} id={`step-${t.id}`} className="ms-6 scroll-mt-24">
                <span className="absolute -start-3 mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white text-[11px] font-semibold tabular-nums">{i + 1}</span>
                <div className="card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{t.label}</span>
                    <span className="chip border border-accent/40 bg-accent-soft text-accent text-[11px] inline-flex items-center gap-1"><Ico name="clock" className="h-3 w-3" />{t.standard}</span>
                    {t.target && <span className="chip bg-foreground/5 text-[11px]">Target {t.target}</span>}
                  </div>
                  <p className="text-sm mt-2 text-foreground/85 leading-relaxed">{t.detail}</p>
                  <Sources items={t.sources} className="mt-2" />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-10">
          <SectionHead id="centres" title="Where you would be treated" icon="hospital" lede={`${p.centres.length} centre entries across ${nations.length} nations, with what each offers for this cancer. The service model note below says what happens only at a specialist centre and what can be given closer to home under its MDT.`} />
          {nations.map((n) => (
            <div key={n} className="mb-6">
              <Kicker icon="flag">{n}</Kicker>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{p.centres.filter((c) => c.nation === n).map((c) => <CentreCard key={c.name} c={c} />)}</div>
            </div>
          ))}
          <div className="card p-4 text-sm text-foreground/85 leading-relaxed">
            <Kicker icon="book">The service model</Kicker>
            <p>{p.centresNote.text}</p>
            <Sources items={p.centresNote.sources} className="mt-2" />
          </div>
        </section>

        <section className="mb-10">
          <SectionHead id="funding" title="What the NHS funds today" icon="pound" lede="By line of treatment: England's NICE decision (which binds Wales and is adopted in Northern Ireland) and Scotland's SMC decision, each with its reference and date. Generic medicines were never appraised and are funded through national chemotherapy protocols." />
          <div className="card p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-start text-xs text-muted"><th className="text-start py-1 pe-3">Line</th><th className="text-start py-1 pe-3">Treatment</th><th className="text-start py-1 pe-3">England (NICE)</th><th className="text-start py-1 pe-3">Scotland (SMC)</th><th className="text-start py-1">Wales and Northern Ireland</th></tr></thead>
              <tbody>{p.funding.map((f) => <FundingRow key={f.line + f.treatment} f={f} />)}</tbody>
            </table>
          </div>
          {p.fundingNote && <div className="mt-3 text-sm text-muted leading-relaxed"><p>{p.fundingNote.text}</p><Sources items={p.fundingNote.sources} className="mt-1" /></div>}
          <p className="text-xs text-muted mt-2">The NHS position of every approved product is on the <Link className="underline" href="/coverage/uk/">NHS coverage</Link> page; the same decisions by country are on <Link className="underline" href="/hta/">funding verdicts by country</Link>.</p>
        </section>

        <section className="mb-10">
          <SectionHead id="tests" title="Tests you can ask for" icon="dna" lede="National Genomic Test Directory entries with their codes, what a result opens, and how the request is made. Ask at diagnosis of advanced disease, not at progression." />
          <div className="card p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted"><th className="text-start py-1 pe-3">Target</th><th className="text-start py-1 pe-3">Code</th><th className="text-start py-1 pe-3">Test</th><th className="text-start py-1 pe-3">What a positive result opens</th><th className="text-start py-1">How to get it</th></tr></thead>
              <tbody>
                {p.tests.map((t) => (
                  <tr key={t.target} className="border-t border-border align-top">
                    <td className="py-3 pe-3 font-medium">{t.target}</td>
                    <td className="py-3 pe-3"><span className={`chip text-[11px] ${t.code === "pathology" ? "bg-foreground/5" : "bg-accent-soft text-accent"}`}>{t.code}</span></td>
                    <td className="py-3 pe-3 text-foreground/85">{t.test}</td>
                    <td className="py-3 pe-3 text-foreground/85">{t.opens}</td>
                    <td className="py-3 text-foreground/85">{t.how}<Sources items={t.sources} className="mt-1" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {p.testsNote && <div className="mt-3 text-sm text-muted leading-relaxed"><p>{p.testsNote.text}</p><Sources items={p.testsNote.sources} className="mt-1" /></div>}
          <p className="text-xs text-muted mt-2">Match a report to targets and drugs on the <Link className="underline" href="/biomarker-matrix/">biomarker matrix</Link>.</p>
        </section>

        <section className="mb-10">
          <SectionHead id="trials" title="Trials open in the UK" icon="flask" lede="Registered trials with UK sites, from the ISRCTN registry and the sponsors' pages, with the setting each is for. Eligibility is decided by the trial team." />
          <div className="grid gap-3 sm:grid-cols-2">
            {p.trials.map((t) => {
              const rec = t.trialId ? g.get(t.trialId) : undefined;
              return (
                <div key={t.url} className="card p-4 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip bg-foreground/5 text-[11px]">{t.registry}</span>
                    <span className={`chip text-[11px] whitespace-normal ${/open|recruit/i.test(t.status) ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-foreground/5"}`}>{t.status}</span>
                  </div>
                  <div className="font-semibold mt-2">{rec ? <Link href={routeFor(rec)} className="hover:underline">{t.name}</Link> : t.name}</div>
                  <div className="text-xs text-muted mt-0.5">{t.setting}</div>
                  <div className="mt-2 flex flex-wrap gap-1">{t.sites.map((s) => <span key={s} className="chip border border-border bg-card text-[11px] whitespace-normal">{s}</span>)}</div>
                  {t.note && <p className="text-sm text-muted mt-2">{t.note}</p>}
                  <a href={t.url} className="mt-3 text-sm underline text-accent" rel="noopener noreferrer">Registry or sponsor page →</a>
                </div>
              );
            })}
          </div>
          {p.trialsNote && <div className="mt-3 text-sm text-muted leading-relaxed"><p>{p.trialsNote.text}</p><Sources items={p.trialsNote.sources} className="mt-1" /></div>}
          <div className="mt-6">
            <Kicker icon="book">The UK trial legacy</Kicker>
            <div className="space-y-3">
              {p.legacy.map((l) => (
                <div key={l.title} className="card p-4">
                  <div className="font-semibold">{l.title}</div>
                  <p className="text-sm mt-1 text-foreground/85 leading-relaxed">{l.story}</p>
                  <div className="mt-2 flex flex-wrap gap-1">{l.trialIds.map((tid) => { const e = g.get(tid); return e ? <Link key={tid} href={routeFor(e)} className="chip bg-accent-soft text-accent text-[11px] hover:underline whitespace-normal text-start">{e.name}</Link> : null; })}</div>
                  <Sources items={l.sources} className="mt-2" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHead id="data" title="UK data" icon="chart" lede="Each figure with its nation, period and the page it was read from. Survival figures are population averages and sit behind the usual disclosure." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Keyed by label, nation and period: the same figure is recorded for more than one nation and more than
                one period, so the label alone is not unique (lung has five such labels; docs/LUNG-QA.md). */}
            {p.figures.map((f) => {
              const survival = /survival/i.test(f.label);
              return (
                <div key={`${f.label}|${f.nation}|${f.period}`} className="card p-4">
                  <div className="text-xs text-muted">{f.label}</div>
                  {survival ? <SurvivalDisclosure items={[`${f.value} ${f.label.toLowerCase()} (${f.nation}, ${f.period}).`, ...(f.note ? [f.note] : [])]} /> : <div className="text-2xl font-semibold tabular-nums mt-1">{f.value}</div>}
                  <div className="text-xs text-muted mt-1">{f.nation} · {f.period}</div>
                  {!survival && f.note && <p className="text-sm text-foreground/80 mt-1">{f.note}</p>}
                  <Sources items={[f.source]} className="mt-2" />
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <SectionHead id="support" title="Support in the UK" icon="hands" lede="Charities focused on this cancer, the general cancer charities, and the official schemes that help with costs. Each link goes to the organisation's own page." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {p.support.map((s) => {
              const inst = s.institutionId ? g.get(s.institutionId) : undefined;
              const website = inst && inst.kind === "institution" ? inst.website : undefined;
              return (
                <div key={s.name} className="card p-4 flex flex-col">
                  <div className="flex items-start gap-3">
                    {s.kind !== "benefit" && <RowAvatar src={logoSrc(s.institutionId, website ?? s.url)} name={s.name} />}
                    <div>
                      <div className="font-semibold">{inst ? <Link href={routeFor(inst)} className="hover:underline">{s.name}</Link> : s.name}</div>
                      <span className="chip bg-foreground/5 text-[10px]">{s.kind === "charity" ? "Charity" : s.kind === "nhs" ? "NHS" : "Cost and benefit"}</span>
                    </div>
                  </div>
                  <ul className="mt-2 text-sm list-disc ps-5 space-y-0.5 text-foreground/85 flex-1">{s.provides.map((x, i) => <li key={i}>{x}</li>)}</ul>
                  <a href={s.url} className="mt-3 text-sm underline text-accent" rel="noopener noreferrer">Open →</a>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-2">More schemes by country on <Link className="underline" href="/assistance/">Assistance</Link>; costs of care on <Link className="underline" href="/costs/">Costs</Link>.</p>
        </section>

        <section className="mb-10">
          <SectionHead id="nations" title="Across the four nations" icon="flag" lede="Where England, Scotland, Wales and Northern Ireland run different rules for the same step." />
          <div className="card p-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-xs text-muted"><th className="text-start py-1 pe-3">Topic</th><th className="text-start py-1 pe-3">England</th><th className="text-start py-1 pe-3">Scotland</th><th className="text-start py-1 pe-3">Wales</th><th className="text-start py-1">Northern Ireland</th></tr></thead>
              <tbody>
                {p.nations.map((n) => (
                  <tr key={n.topic} className="border-t border-border align-top">
                    <td className="py-3 pe-3 font-medium">{n.topic}<Sources items={n.sources} className="mt-1" /></td>
                    <td className="py-3 pe-3 text-foreground/85">{n.england}</td>
                    <td className="py-3 pe-3 text-foreground/85">{n.scotland}</td>
                    <td className="py-3 pe-3 text-foreground/85">{n.wales}</td>
                    <td className="py-3 text-foreground/85">{n.northernIreland}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <SectionHead id="gaps" title="What could not be sourced" icon="gap" lede="Named gaps, so a missing figure is never mistaken for a zero." />
          <ul className="card p-4 text-sm list-disc ps-8 space-y-1 text-foreground/80">{p.gaps.map((x, i) => <li key={i}>{x}</li>)}</ul>
        </section>

        <div className="card p-4 text-sm text-muted">
          <span className="font-medium text-foreground">How to read this page.</span> Every figure and decision links to the page it was read from ({urls.length} sources, checked {p.asOf}); the drug and trial pills open OnCo records with their own sources. Standards and funding change: confirm with your team and the linked pages. Machine-readable copy at <a className="underline" href={`/api/v1/cancers/${p.cancerId}/uk.json`}>/api/v1/cancers/{p.cancerId}/uk.json</a>. OnCo is orientation, not medical advice.
        </div>
      </Container>
    </>
  );
}

export default async function UkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = ukPathwayFor(id);
  if (!p) notFound();
  return <Page p={p} id={id} />;
}

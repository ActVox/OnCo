import Link from "next/link";
import { ScrollRow } from "./ScrollRow";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/kinds";
import { Section } from "./ui";
import { RefChips } from "./RefChips";
import { statusClass } from "@/lib/text";
import { scoreCompany } from "@/lib/company-score";
import { financialsFor, fmtBn } from "@/data/company-financials";
import { dealsFor, DEAL_TYPE_LABEL } from "@/data/deals";
import { exclusivityFor } from "@/data/exclusivity";
import { catalysts } from "@/data/catalysts";
import { sitesFor, CAPABILITY_LABEL } from "@/data/manufacturing";
import { dateLabel, sortKey } from "@/lib/ics";

/**
 * Compact server-rendered panels for entity pages (wired into EntityDetail by the main session; see
 * docs/wiring/D.md). Each returns null when the entity has nothing to show, so they are safe to drop in
 * unconditionally.
 */

const today = () => new Date().toISOString().slice(0, 10);

/** Company pages: rank and score with the component breakdown, plus the latest financial snapshot. */
export function CompanyScorePanel({ id }: { id: string }) {
  const s = scoreCompany(id, today());
  if (!s || !s.products.length) return null;
  const fin = financialsFor(id)[0];
  const parts: Array<[string, number]> = [["approved products", s.approvedPoints], ["phase 3", s.phase3Points], ["phase 1/2", s.earlyPoints], ["targets", s.targetPoints], ["modalities", s.modalityPoints], ["regions", s.regionPoints], ["24-month regulatory events", s.momentumPoints], ["registry trials", s.trialPoints], ["failures", s.failurePenalty]];
  return (
    <Section title="Scorecard" aside={<Link href="/scorecards/" className="text-sm underline text-muted">All companies</Link>}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4 text-sm">
          <div className="flex items-baseline gap-3"><span className="text-3xl font-semibold tabular-nums">#{s.rank}</span><span className="text-muted">of {graph().kind("company").length} companies, score {s.score}</span></div>
          <ul className="mt-2 text-xs text-muted columns-2 gap-4">{parts.filter(([, v]) => v).map(([k, v]) => <li key={k}>{k} <span className="tabular-nums text-foreground">{v > 0 ? "+" : ""}{v}</span></li>)}</ul>
          <div className="text-xs text-muted mt-2">{s.approved} approved, {s.phase3} in phase 3, {s.early} earlier, {s.targets} targets, {s.registryTrials.toLocaleString("en-GB")} registry studies. Formula on the <Link href="/scorecards/" className="underline">scorecards page</Link>.</div>
        </div>
        {fin && (
          <div className="card p-4 text-sm">
            <div className="kicker mb-1">Financial snapshot, {fin.fiscalYear}</div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
              {fin.oncologyRevenue !== undefined && <><dt className="text-muted">Oncology revenue</dt><dd className="tabular-nums font-medium">{fmtBn(fin.oncologyRevenue, fin.currency)}</dd></>}
              {fin.totalRevenue !== undefined && <><dt className="text-muted">Total revenue</dt><dd className="tabular-nums">{fmtBn(fin.totalRevenue, fin.currency)}</dd></>}
              {fin.rdSpend !== undefined && <><dt className="text-muted">R&amp;D spend</dt><dd className="tabular-nums">{fmtBn(fin.rdSpend, fin.currency)}</dd></>}
              {fin.cash !== undefined && <><dt className="text-muted">Cash</dt><dd className="tabular-nums">{fmtBn(fin.cash, fin.currency)}</dd></>}
            </dl>
            {fin.topProducts.length > 0 && <div className="mt-2 text-xs">{fin.topProducts.map((p) => { const e = p.drugId ? graph().get(p.drugId) : undefined; return <span key={p.name} className="mr-3">{e ? <Link href={routeFor(e)} className="underline">{p.name}</Link> : p.name} {fmtBn(p.sales, fin.currency)}</span>; })}</div>}
            <div className="text-xs text-muted mt-2">{fin.note ? `${fin.note} ` : ""}<a href={fin.source.url} rel="noopener" className="underline">{fin.source.label}</a></div>
          </div>
        )}
      </div>
    </Section>
  );
}

/** Company or product pages: deals the entity was party to or the asset of. */
export function DealsPanel({ id }: { id: string }) {
  const list = dealsFor(id).sort((a, b) => b.date.localeCompare(a.date));
  if (!list.length) return null;
  const g = graph();
  return (
    <Section title="Deals" aside={<Link href="/deals/" className="text-sm underline text-muted">Deal map</Link>}>
      <ScrollRow className="card">
        <table className="onco">
          <thead><tr><th>Date</th><th>Deal</th><th>Type</th><th>Upfront</th><th>Total</th><th>Source</th></tr></thead>
          <tbody>
            {list.map((d) => {
              const from = d.from.id ? g.get(d.from.id) : undefined, to = d.to.id ? g.get(d.to.id) : undefined;
              return (
                <tr key={d.id}>
                  <td className="font-mono text-xs text-muted whitespace-nowrap">{d.date}</td>
                  <td className="min-w-[260px]">{from ? <Link href={routeFor(from)} className="hover:underline">{from.name}</Link> : d.from.name} to {to ? <Link href={routeFor(to)} className="hover:underline">{to.name}</Link> : d.to.name}<div className="text-xs text-muted font-normal">{d.assetText}</div></td>
                  <td><span className={`chip ${statusClass(d.type === "acquisition" ? "approved" : d.type === "co-development" ? "phase-3" : "phase-2")}`}>{DEAL_TYPE_LABEL[d.type]}</span></td>
                  <td className="tabular-nums whitespace-nowrap">{d.upfront ?? <span className="text-muted">not disclosed</span>}</td>
                  <td className="tabular-nums whitespace-nowrap">{d.total ?? <span className="text-muted">not disclosed</span>}</td>
                  <td><a className="underline text-xs" href={d.source} rel="noopener">source</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollRow>
    </Section>
  );
}

/** Product pages: exclusivity floors and entrants. */
export function ExclusivityPanel({ drugId }: { drugId: string }) {
  const e = exclusivityFor(drugId);
  if (!e) return null;
  return (
    <Section title="Exclusivity and entrants" aside={<Link href={`/exclusivity/#${drugId}`} className="text-sm underline text-muted">Timeline</Link>}>
      <div className="card p-4 text-sm">
        {e.rows.length > 0 && <ul className="space-y-1">{e.rows.map((r, i) => <li key={i}><span className="font-medium">{r.region}</span> {r.kind === "patent" ? "patent floor" : "regulatory exclusivity"} <span className="tabular-nums font-semibold">{r.year}</span>{r.note ? <span className="text-muted"> ({r.note})</span> : ""} <a href={r.source} rel="noopener" className="text-xs underline text-muted">source</a></li>)}</ul>}
        {e.entrants.length > 0 && <ul className="mt-2 space-y-1 text-muted">{e.entrants.map((x, i) => <li key={i}>{x.name}: {x.type} {x.status} {x.date}{x.note ? ` (${x.note})` : ""}</li>)}</ul>}
        {e.note && <p className="text-xs text-muted mt-2">{e.note}</p>}
      </div>
    </Section>
  );
}

/** Company, product, cancer or target pages: upcoming catalysts that name the entity. */
export function CatalystsPanel({ id }: { id: string }) {
  const list = catalysts.filter((c) => c.companies.includes(id) || c.drugs.includes(id) || c.refs.includes(id)).sort((a, b) => sortKey(a.date).localeCompare(sortKey(b.date)));
  if (!list.length) return null;
  return (
    <Section title="Catalysts" aside={<Link href="/catalysts/" className="text-sm underline text-muted">What is due next</Link>}>
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={c.id} className="card p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-mono text-muted">{dateLabel(c.date)}</span><span className={`chip ${c.confidence === "confirmed" ? statusClass("approved") : "bg-foreground/5 text-muted"}`}>{c.confidence}</span></div>
            <div className="font-medium mt-1">{c.title}</div>
            <p className="text-xs text-muted mt-0.5">{c.note} <a href={c.source} rel="noopener" className="underline">Source</a></p>
            <RefChips ids={[...c.companies, ...c.drugs].filter((x) => x !== id)} className="mt-1.5" />
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Company pages: manufacturing sites the company operates or is a disclosed customer of. */
export function ManufacturingPanel({ companyId }: { companyId: string }) {
  const list = sitesFor(companyId);
  if (!list.length) return null;
  return (
    <Section title="Manufacturing" aside={<Link href="/manufacturing/" className="text-sm underline text-muted">Capacity map</Link>}>
      <ul className="grid gap-2 md:grid-cols-2 text-sm">
        {list.map((s) => <li key={s.id} className="card p-3"><Link href={`/manufacturing/#${s.id}`} className="font-medium hover:underline">{s.name}</Link> <span className="text-xs text-muted">{s.city}, {s.country}{s.operatorId !== companyId ? ` · ${s.operator}` : ""}</span><div className="text-xs text-muted mt-1">{s.capabilities.map((c) => CAPABILITY_LABEL[c]).join(", ")}</div></li>)}
      </ul>
    </Section>
  );
}

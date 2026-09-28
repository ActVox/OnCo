"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FacetSelect } from "./filters/FacetSelect";
import { FilterHead } from "./filters/ResultsTable";
import { countOptions, useHeaderFilters } from "./filters/useHeaderFilters";
import { PrintButton } from "./PrintButton";
import { Tip } from "./Tip";
import { useProfile } from "@/lib/profile";
import { useRegion } from "@/lib/region";
import type { Region } from "@/data/regional-approvals";
import { ASSISTANCE_COUNTRIES, type AssistanceScheme } from "@/data/assistance-schemes";

export type AccessRow = { drugId: string; drug: string; route: string; modality: string; country: string; listPrice?: string; reimbursement?: string; assistance?: string; generic?: boolean; source?: string; asOf?: string };
export type PatientOrg = { id: string; name: string; tldr: string; route: string; url: string };

/** drug.access[] uses "UK" and "EU"; schemes use ISO2 "GB" and "EU". Map a filter value to the codes each dataset uses. */
const ACCESS_CODES: Record<string, string[]> = { US: ["US"], GB: ["UK"], EU: ["EU", "DE"], DE: ["DE", "EU"], JP: ["JP"], CN: ["CN"], AU: ["AU"], CA: ["CA"], IN: ["IN"] };
const SCHEME_CODES: Record<string, string[]> = { US: ["US"], GB: ["GB"], EU: ["EU"], DE: ["EU"], JP: ["JP"], CN: ["CN"], AU: ["AU"], CA: ["CA"], IN: ["IN"] };
const REGION_TO_COUNTRY: Record<Region, string> = { US: "US", UK: "GB", EU: "EU", JP: "JP", CN: "CN", AU: "AU", IN: "IN" };
const KIND_LABEL: Record<AssistanceScheme["kind"], string> = { public: "Public scheme", charity: "Charity", manufacturer: "Manufacturer", legal: "Legal right" };

const isUrl = (s?: string) => !!s && /^https?:\/\//.test(s);

function Cell({ v }: { v?: string }) {
  if (!v) return <span className="text-muted">Not recorded</span>;
  if (isUrl(v)) return <a className="underline break-all" href={v} rel="noopener">{v.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>;
  return <span>{v}</span>;
}

/**
 * Financial help navigator: every per-product access row from the corpus (manufacturer programme,
 * reimbursement, generic status) filtered by country and product, plus national schemes and patient
 * organisations for that country. Print gives a one-page list.
 */
export function AssistanceBrowser({ rows, schemes, orgs }: { rows: AccessRow[]; schemes: AssistanceScheme[]; orgs: PatientOrg[] }) {
  const [profile, , profileReady] = useProfile();
  const { region, ready: regionReady } = useRegion();
  const [country, setCountry] = useState<string | null>(null);
  const [drugs, setDrugs] = useState<string[]>([]);
  const [onlyAssistance, setOnlyAssistance] = useState(false);
  const hf = useHeaderFilters();
  const genericOf = (r: AccessRow) => (r.generic === undefined ? "Not recorded" : r.generic ? "Yes" : "No");

  useEffect(() => {
    if (!regionReady) return;
    const id = requestAnimationFrame(() => setCountry((c) => c ?? (region ? REGION_TO_COUNTRY[region] : c)));
    return () => cancelAnimationFrame(id);
  }, [regionReady, region]);

  useEffect(() => {
    if (!profileReady) return;
    const known = new Set(rows.map((r) => r.drugId));
    const id = requestAnimationFrame(() => setDrugs((d) => d.length ? d : profile.priorLines.filter((x) => known.has(x))));
    return () => cancelAnimationFrame(id);
  }, [profileReady, profile.priorLines, rows]);

  const countryOptions = useMemo(() => {
    const codes = new Set<string>(["US", "GB", "EU", "DE", "JP", "CN", "AU", "CA", "IN"]);
    return [...codes].map((c) => ({ value: c, label: ASSISTANCE_COUNTRIES[c] ?? c }));
  }, []);

  const schemeCodes = country ? SCHEME_CODES[country] ?? [country] : null;

  const inCountry = useMemo(() => {
    const accessCodes = country ? ACCESS_CODES[country] ?? [country] : null;
    return rows.filter((r) => !accessCodes || accessCodes.includes(r.country));
  }, [rows, country]);
  const drugOptions = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const r of inCountry) { const cur = m.get(r.drugId); m.set(r.drugId, { label: r.drug, n: (cur?.n ?? 0) + 1 }); }
    return [...m.entries()].map(([value, { label, n }]) => ({ value, label, count: n })).sort((a, b) => a.label.localeCompare(b.label));
  }, [inCountry]);

  const filtered = useMemo(() => inCountry
    .filter((r) => (!drugs.length || drugs.includes(r.drugId)) && (!onlyAssistance || r.assistance || r.generic) && hf.pass("generic", [genericOf(r)]) && hf.pass("programme", [r.assistance ? "Recorded" : "Not recorded"]))
    .sort((a, b) => a.drug.localeCompare(b.drug) || a.country.localeCompare(b.country)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hf.pass reads hf.sel
    [inCountry, drugs, onlyAssistance, hf.sel]);
  const countrySpec = { options: countryOptions, value: country ? [country] : [], onChange: (v: string[]) => { setCountry(v[0] ?? null); setDrugs([]); }, single: true };
  const productSpec = { options: drugOptions, value: drugs, onChange: (v: string[]) => setDrugs(v) };

  const countrySchemes = schemes.filter((s) => !schemeCodes || schemeCodes.includes(s.country));
  const countryLabel = country ? ASSISTANCE_COUNTRIES[country] ?? country : "all countries";
  const withAssistance = filtered.filter((r) => r.assistance).length;

  return (
    <div>
      <div className="card p-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <FacetSelect label="Country" options={countryOptions} value={country} onChange={(v) => { setCountry(v as string | null); setDrugs([]); }} searchable={false} allLabel="All countries" width="w-56" />
          <FacetSelect label="Product" options={drugOptions} value={drugs} onChange={(v) => setDrugs(v as string[])} multi allLabel="Any product" placeholder="Search products…" width="w-64" />
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={onlyAssistance} onChange={(e) => setOnlyAssistance(e.target.checked)} /> only rows with a programme or a generic</label>
          {(drugs.length > 0 || onlyAssistance || hf.active) && <button type="button" onClick={() => { setDrugs([]); setOnlyAssistance(false); hf.clear(); }} className="text-sm underline text-muted">Clear</button>}
          <span className="ml-auto text-sm text-muted tabular-nums">{filtered.length} rows · {withAssistance} with a manufacturer programme</span>
          <PrintButton className="text-sm text-muted" />
        </div>
        <p className="text-[11px] text-muted mt-2">Country follows the region switcher in the header; products are seeded from the treatments in your browser profile. Nothing leaves your device. The patient pack gives a one-page list to take to a social worker or financial navigator.</p>
      </div>

      <div className="hidden print:block mb-4">
        <h2 className="text-xl font-semibold">Financial help checklist: {countryLabel}</h2>
        <p className="text-sm">{drugs.length ? `Products: ${drugOptions.filter((o) => drugs.includes(o.value)).map((o) => o.label).join(", ")}. ` : ""}Printed from onco.cc/assistance/ on {new Date().toISOString().slice(0, 10)}. Verify every programme at its own site before relying on it.</p>
      </div>

      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h2 className="text-lg font-semibold">Per-product help in {countryLabel}</h2>
          <span className="text-xs text-muted">From each product&apos;s access record; blank means not recorded, not that nothing exists.</span>
        </div>
        {filtered.length === 0 ? (
          <div className="card p-6 text-sm text-muted">No access rows match. {country && country !== "US" && country !== "GB" && "Most recorded rows are for the US and UK so far; "}try another country or clear the product filter, and check the product&apos;s own page and the manufacturer&apos;s site.</div>
        ) : (
          <div className="overflow-x-auto card">
            <table className="onco">
              <thead><tr><th><FilterHead label="Product" spec={productSpec} /></th><th><FilterHead label="Country" spec={countrySpec} /></th><th><FilterHead label="Manufacturer programme" spec={hf.spec("programme", countOptions(inCountry.map((r) => (r.assistance ? "Recorded" : "Not recorded"))))} /></th><th>Reimbursement</th><th className="hidden md:table-cell">List price</th><th><FilterHead label="Generic" spec={hf.spec("generic", countOptions(inCountry.map(genericOf), { order: ["Yes", "No", "Not recorded"] }))} /></th><th className="hidden lg:table-cell">Source</th></tr></thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={`${r.drugId}-${r.country}-${i}`}>
                    <td className="min-w-[160px]"><Link href={`${r.route}#access`} className="font-medium hover:underline">{r.drug}</Link><div className="text-xs text-muted line-clamp-1">{r.modality}</div></td>
                    <td className="whitespace-nowrap">{ASSISTANCE_COUNTRIES[r.country] ?? r.country}</td>
                    <td className="max-w-xs text-sm"><Cell v={r.assistance} /></td>
                    <td className="max-w-sm text-sm text-muted"><Cell v={r.reimbursement} /></td>
                    <td className="hidden md:table-cell max-w-xs text-sm text-muted"><Cell v={r.listPrice} /></td>
                    <td>{r.generic === undefined ? <span className="text-muted">Not recorded</span> : r.generic ? <Tip title="Generic or biosimilar available" text="A generic or biosimilar is on the market in this country, which usually means a much lower price and wider reimbursement."><span className="chip bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900 cursor-help">Yes</span></Tip> : <span className="text-muted">No</span>}</td>
                    <td className="hidden lg:table-cell text-xs text-muted">{r.source ? <a className="underline" href={r.source} rel="noopener">source</a> : "Not recorded"}{r.asOf && <div>checked {r.asOf}</div>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h2 className="text-lg font-semibold">National schemes and charities: {countryLabel}</h2>
          <span className="text-xs text-muted">Figures only where the linked page states them.</span>
        </div>
        {countrySchemes.length === 0 ? <div className="card p-6 text-sm text-muted">No national schemes recorded for this country yet. This is a gap; <Link className="underline" href="/suggest/">suggest one</Link>.</div> : (
          <div className="grid gap-3 md:grid-cols-2">
            {countrySchemes.map((s) => (
              <div key={s.id} className="card p-4 break-inside-avoid">
                <div className="flex flex-wrap items-center gap-2 mb-1"><span className="chip bg-foreground/5 text-[10px]">{KIND_LABEL[s.kind]}</span><span className="text-xs text-muted">{ASSISTANCE_COUNTRIES[s.country] ?? s.country}</span></div>
                <a href={s.url} rel="noopener" className="font-semibold hover:underline">{s.name}</a>
                <p className="text-sm mt-1.5"><span className="text-muted">Who: </span>{s.who}</p>
                <p className="text-sm mt-1"><span className="text-muted">What: </span>{s.what}</p>
                <ol className="list-decimal pl-5 text-sm mt-1.5 space-y-0.5">{s.how.map((h, i) => <li key={i}>{h}</li>)}</ol>
                <p className="text-[11px] text-muted mt-2">Source: <a className="underline" href={s.source.url} rel="noopener">{s.source.label}</a> · checked {s.asOf}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 break-inside-avoid">
        <h2 className="text-lg font-semibold mb-2">Patient organisations with financial and practical help</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((o) => (
            <div key={o.id} className="card p-3">
              <Link href={o.route} className="font-medium hover:underline">{o.name}</Link>
              <p className="text-xs text-muted mt-1 line-clamp-3">{o.tldr}</p>
              <a href={o.url} rel="noopener" className="text-xs underline mt-1 inline-block">{o.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">Most are US-based and disease-specific; many run copay funds, travel grants or navigation lines. In the UK, Macmillan and Maggie&apos;s are the first call; in Australia, Cancer Council.</p>
      </section>

      <div className="card p-4 mt-8 text-sm text-muted">
        <span className="font-medium text-foreground">Financial toxicity is a treatment side effect.</span> Ask the team for a financial navigator or oncology social worker at the first visit, not when the bills arrive; most centres have one. See the <Link className="underline" href="/bottlenecks/">bottlenecks</Link> section for why cancer care costs what it does, <Link className="underline" href="/coverage/us/">paying for care in the US</Link> and <Link className="underline" href="/coverage/uk/">what the NHS offers</Link>.
      </div>
    </div>
  );
}

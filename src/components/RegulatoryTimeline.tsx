import type { Drug } from "@/lib/schema";

type Ev = Drug["regulatoryEvents"][number];

export const EVENT_LABEL: Record<Ev["type"], string> = { designation: "Designation", filing: "Filing / deal", pdufa: "PDUFA date", approval: "Approval", "accelerated-approval": "Accelerated approval", conversion: "Confirmed", crl: "Complete response letter", withdrawal: "Withdrawal", "label-change": "Label change", "advisory-committee": "Advisory committee" };
export const EVENT_TONE: Record<Ev["type"], string> = {
  approval: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  conversion: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "accelerated-approval": "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  "label-change": "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  designation: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  filing: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  pdufa: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  "advisory-committee": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  crl: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  withdrawal: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
};

/** Sort key for dates like 2026-03-09, 2026-03, 2026-Q2, 2026. */
export function dateKey(d: string): string {
  const q = d.match(/^(\d{4})-Q([1-4])$/);
  if (q) return `${q[1]}-${String((Number(q[2]) - 1) * 3 + 2).padStart(2, "0")}-15`;
  if (/^\d{4}$/.test(d)) return `${d}-06-30`;
  if (/^\d{4}-\d{2}$/.test(d)) return `${d}-15`;
  return d;
}
export function formatDate(d: string): string {
  const q = d.match(/^(\d{4})-Q([1-4])$/);
  if (q) return `Q${q[2]} ${q[1]}`;
  if (/^\d{4}-\d{2}$/.test(d)) { const [y, m] = d.split("-"); return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-GB", { month: "short", year: "numeric" }); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { const [y, m, day] = d.split("-"); return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  return d;
}

/** Vertical dated timeline of designations, filings, approvals, CRLs, withdrawals, and label changes. */
export function RegulatoryTimeline({ events }: { events: Ev[] }) {
  if (!events.length) return null;
  const sorted = [...events].sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)));
  return (
    <ol className="relative border-l-2 border-border ml-3 space-y-5">
      {sorted.map((e, i) => (
        <li key={i} className="ml-6">
          <span className={`absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full ring-4 ring-background ${e.type === "approval" || e.type === "conversion" ? "bg-emerald-500" : e.type === "accelerated-approval" ? "bg-teal-500" : e.type === "crl" || e.type === "withdrawal" ? "bg-rose-500" : e.type === "pdufa" || e.type === "advisory-committee" ? "bg-amber-500" : "bg-zinc-400"}`} />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-sm text-muted">{formatDate(e.date)}</span>
            <span className={`chip ${EVENT_TONE[e.type]}`}>{EVENT_LABEL[e.type]}</span>
            <span className="text-xs text-muted">{e.region}</span>
          </div>
          {e.indication && <p className="text-sm text-muted mt-0.5">{e.indication}</p>}
          <p className="text-[15px] mt-0.5">{e.note}{e.source && <> <a className="text-xs underline text-muted" href={e.source} rel="noopener">source</a></>}</p>
        </li>
      ))}
    </ol>
  );
}

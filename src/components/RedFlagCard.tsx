"use client";

import Link from "next/link";
import { ACTION_LABEL, type RedFlag, type RedFlagAction, type RedFlagSet } from "@/data/red-flags";
import { PrintButton } from "./PrintButton";

const TONE: Record<RedFlagAction, string> = {
  emergency: "border-rose-300 bg-rose-50/70 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-100",
  "call-now": "border-amber-300 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100",
  "call-today": "border-border bg-surface",
};
const ORDER: RedFlagAction[] = ["emergency", "call-now", "call-today"];

function FlagRow({ f }: { f: RedFlag }) {
  return (
    <li className="py-1.5 text-[13px] leading-snug">
      <span className="font-medium">{f.symptom}.</span> {f.threshold}{" "}
      <a className="text-[11px] text-muted underline decoration-foreground/20 hover:decoration-foreground print:hidden" href={f.source.url} rel="noopener">source</a>
    </li>
  );
}

/**
 * Printable wallet card for one treatment (or the general card): the symptoms to watch for, grouped by
 * how fast to act, with the threshold quoted from the label or guideline. Sized to fold into a wallet
 * when printed; on screen it sits inside the caregiver panel. Props are plain data so it can be used
 * from client components.
 */
export function RedFlagCard({ name, route, sets, phone, compact = false }: {
  /** Treatment name, or "Anyone on cancer treatment" for the general card. */
  name: string;
  route?: string;
  sets: RedFlagSet[];
  /** Optional 24-hour number the reader has entered; printed on the card. */
  phone?: string;
  compact?: boolean;
}) {
  const flags = sets.flatMap((s) => s.flags);
  const windows = sets.map((s) => s.window).filter((w): w is string => !!w);
  const sources = [...new Map(flags.map((f) => [f.source.url, f.source])).values()];
  if (!flags.length) return null;
  return (
    <div className="card p-4 print:break-inside-avoid print:border print:border-black print:rounded-none print:max-w-[100mm]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="kicker">When to call: {sets.length === 1 ? sets[0].label : sets.map((s) => s.label).join(" · ")}</div>
          <div className="font-semibold text-lg mt-0.5">{route ? <Link href={route} className="hover:underline">{name}</Link> : name}</div>
        </div>
        {!compact && <PrintButton className="text-xs text-muted print:hidden" />}
      </div>
      {phone && <div className="mt-2 text-sm"><span className="text-muted">24-hour line: </span><span className="font-mono font-semibold">{phone}</span></div>}
      {windows.length > 0 && <p className="text-xs text-muted mt-2">{windows.join(" ")}</p>}
      {/* This card goes on a fridge and is read cold, weeks before it is needed. Without this line it is a list of
          ways to be in danger with a phone number under it; "When in doubt, call" was set in 11px at the bottom,
          below the sources, which is the one sentence that has to be read first. */}
      <p className="mt-3 text-[13px] font-medium">When in doubt, call. Nobody minds a false alarm, and every one of these is treated faster the earlier the team hears about it.</p>
      <div className="mt-3 space-y-2">
        {ORDER.map((a) => {
          const list = flags.filter((f) => f.action === a);
          if (!list.length) return null;
          return (
            <div key={a} className={`rounded-lg border px-3 py-2 ${TONE[a]}`}>
              <div className="text-[11px] font-semibold uppercase tracking-wide">{ACTION_LABEL[a]}</div>
              <ul className="divide-y divide-foreground/10">{list.map((f, i) => <FlagRow key={i} f={f} />)}</ul>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted mt-3">Thresholds quoted from {sources.map((s, i) => <span key={s.url}>{i > 0 && (i === sources.length - 1 ? " and " : ", ")}<a className="underline" href={s.url} rel="noopener">{s.label}</a></span>)}. The treating team&apos;s own instructions take precedence.</p>
    </div>
  );
}

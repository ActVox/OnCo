import Link from "next/link";
import { Section } from "./ui";
import { OUTLOOK_META, RECOVERY_EFFECTS, RECOVERY_TREATMENTS, cellsForDrug } from "@/data/recovery-matrix";

/**
 * What comes back after this medicine: the recovery answers from src/data/recovery-matrix.ts that apply to one
 * product, through the class it belongs to or through a cell written about the product itself. Returns null when
 * the matrix holds nothing for it, so it is safe to drop into the drug page unconditionally. The full matrix,
 * with the cohort behind every figure, is at /live/recovery/.
 */
export function RecoveryPanel({ drugId }: { drugId: string }) {
  const cells = cellsForDrug(drugId).filter((c) => c.outlook !== "unknown");
  if (!cells.length) return null;
  const row = RECOVERY_TREATMENTS.find((t) => t.drugIds.includes(drugId));
  const order = (id: string) => RECOVERY_EFFECTS.findIndex((e) => e.id === id);
  const shown = [...cells].sort((a, b) => order(a.effect) - order(b.effect)).slice(0, 6);
  const label = (id: string) => RECOVERY_EFFECTS.find((e) => e.id === id)?.label ?? id;
  return (
    <Section title="Does it come back" aside={<Link href={`/live/recovery/#${row?.id ?? ""}`} className="text-sm underline text-muted">Full matrix</Link>}>
      <div className="card p-4">
        <ul className="space-y-2.5 text-sm">
          {shown.map((c, i) => (
            <li key={`${c.effect}-${i}`}>
              <span className={`chip ${OUTLOOK_META[c.outlook].chip} text-[10px] me-1.5`}>{OUTLOOK_META[c.outlook].label}</span>
              <span className="font-medium">{label(c.effect)}: </span>
              <span>{c.line}</span>
              {c.proportion && <span className="text-muted"> {c.proportion.figure} ({c.proportion.cohort}).</span>}
              {" "}<a className="text-[11px] underline text-muted break-words" href={c.source.url} rel="noopener">{c.source.label}</a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-3">
          {row ? `Read for the class this product belongs to (${row.label.toLowerCase()}) unless the answer names the product. ` : ""}
          Population figures from the cohorts named, not a prediction for one person. Blank where no source gives a recovery figure.
        </p>
      </div>
    </Section>
  );
}

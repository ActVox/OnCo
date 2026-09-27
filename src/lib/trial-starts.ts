/**
 * When a trial started, from ClinicalTrials.gov.
 *
 * One row is the registry's `startDateStruct` for one trial: the date at whatever precision the sponsor gave it, and
 * whether the registry marks it as the real one or a plan. scripts/fetch-trial-starts.ts writes
 * src/data/trial-start-dates.ts; src/data/index.ts merges a row onto a trial that carries no `started` of its own,
 * so an editor's date from the paper always wins over the registry's.
 *
 * The distinction between an actual and an estimated start matters more than it looks. A trial that never opened
 * keeps its planned start for ever, so a duration computed from an estimated date is a duration from a date that
 * may never have happened; anything that counts these must say which kind it counted.
 */
export type TrialStart = {
  /** "2019", "2019-04" or "2019-04-15", exactly as the registry gives it. */
  started: string;
  /** The registry's own ACTUAL or ESTIMATED, absent when the record states neither. */
  type?: "actual" | "estimated";
  /** The registry id the date was read from. */
  nct: string;
};

/** The year of a partial date, or undefined when there is none. */
export const startYear = (started: string | undefined): number | undefined => {
  const m = /^(\d{4})/.exec(started ?? "");
  return m ? Number(m[1]) : undefined;
};

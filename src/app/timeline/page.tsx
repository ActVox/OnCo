import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { TimelineScrubber, type TimelineData } from "@/components/TimelineScrubber";
import { EarlyStrip, TimelineChart, YearIndex } from "@/components/TimelineChart";
import { BANDS, MIN_N, findings, series, yearRecordsOf } from "@/lib/timeline";
import { CONTINUOUS_FROM } from "@/lib/years";
import { YEAR_EVENT_GROUPS, YEAR_GROUP_META } from "@/lib/year-groups";
import { Block } from "@/components/record-blocks";

export const metadata: Metadata = pageMeta({
  title: "Timeline",
  description: "Every dated fact in OnCo on one timeline: a record for every year, the shape of the whole field at a glance, and what the shape shows, each figure with the denominator behind it.",
  path: "/timeline/",
});

/** Parse an era like "2019-2022", "2026-2030", "2028+", "1980s-2000", "1946-2000" into [start, end]. */
function eraRange(era: string): [number, number] {
  const years = [...era.matchAll(/(\d{4})/g)].map((m) => Number(m[1]));
  if (years.length === 0) return [2026, 2030];
  const start = years[0];
  const end = era.includes("+") ? 2030 : years.length > 1 ? years[years.length - 1] : start + (era.includes("s") ? 9 : 0);
  return [start, Math.max(start, end)];
}

const num = (n: number) => n.toLocaleString("en-GB");
const WORDS = ["Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen"];
/** A small count in words, so the sentence above the findings never says a number the page does not show. */
const spell = (n: number) => WORDS[n - 9] ?? String(n);

/**
 * One timeline over every year in oncology, at two scales.
 *
 * The whole field at a glance is the chart: one column a year, from the first year the corpus dates anything to,
 * stacked by what kind of thing the entries were. One year in detail is its own record at /years/<year>/, and the
 * scrubber below reads the same dated fields year by year.
 *
 * The findings under it are the point of gathering the dates in one place. Each carries the denominator it was
 * computed over and a caveat naming what it measures about the corpus rather than about oncology; a finding with
 * fewer than MIN_N cases says plainly that the corpus cannot support it (src/lib/timeline.ts).
 */
export default function TimelinePage() {
  const g = graph();
  const short = (s: string) => s.replace(/ \(.*\)$/, "");
  const cols = series(g);
  const modern = cols.filter((c) => c.year >= CONTINUOUS_FROM);
  const early = cols.filter((c) => c.year < CONTINUOUS_FROM);
  const years = yearRecordsOf(g);
  const events = years.reduce((s, y) => s + y.events.length, 0);
  const found = findings(g);
  const byGroup = new Map(YEAR_EVENT_GROUPS.map((k) => [k, cols.reduce((s, c) => s + c.byGroup[k], 0)]));
  const busiest = [...years].sort((a, b) => b.events.length - a.events.length)[0];

  const data: TimelineData = {
    approvals: g.kind("drug").flatMap((d) => d.approvals.map((a) => ({ year: a.year, drug: d.name, route: routeFor(d), region: a.region, indication: a.indication }))).sort((a, b) => a.year - b.year),
    trials: g.kind("trial").filter((t) => t.yearReported).map((t) => ({ year: t.yearReported!, name: t.name, route: routeFor(t), status: t.status, cancers: t.cancers.map((id) => short(g.must(id).name)) })).sort((a, b) => a.year - b.year),
    history: g.kind("cancer").flatMap((c) => c.history.filter((h) => typeof h.year === "number" || /^\d{4}$/.test(String(h.year))).map((h) => ({ year: Number(h.year), cancer: short(c.name), cancerRoute: routeFor(c), title: h.title, note: h.note, refs: h.refs.map((id) => ({ name: g.must(id).name, route: routeFor(g.must(id)) })) }))).sort((a, b) => a.year - b.year),
    steps: g.kind("roadmap").flatMap((r) => r.steps.map((s) => { const [start, end] = eraRange(s.era); return { start, end, era: s.era, title: s.title, roadmap: r.name.split(":")[0], route: routeFor(r), status: s.status }; })),
    min: 1940, max: 2030,
  };

  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Every year in oncology, on one timeline"
        lede={`${num(events)} dated facts read out of ${num(g.entities.length - years.length)} records and sorted into ${num(years.length)} years, from ${years[0].year} to ${years[years.length - 1].year}. Each year has its own page listing what happened in it; this page is the shape of all of them together, and what that shape shows.`} />
      <Container className="pb-16">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 mb-8">
          <Stat label="Dated facts" value={num(events)} />
          <Stat label="Years with a record" value={num(years.length)} />
          <Stat label="Known to the day" value={num(years.flatMap((y) => y.events).filter((e) => e.precision === "day").length)} />
          <Stat label="Dated after 2026" value={num(cols.filter((c) => c.year > 2026).reduce((s, c) => s + c.total, 0))} />
        </div>

        <Block title="The whole field at a glance" id="chart">
          <p className="text-sm text-muted mb-3 max-w-3xl">One column a year from {CONTINUOUS_FROM} on, as tall as the number of dated facts the corpus holds for it. Every column is a link to that year. The shape is as much the shape of what has been read into OnCo as of what happened, which is the first thing the findings below try to measure.</p>
          <TimelineChart columns={modern} />
          <p className="text-sm text-muted mt-4 mb-0 max-w-3xl">Before {CONTINUOUS_FROM} the record is a scatter of landmarks rather than a year-by-year reading: {early.length} years carry {num(early.reduce((s, c) => s + c.total, 0))} entries between them, the earliest {early[0]?.year}.</p>
          <EarlyStrip columns={early} />
        </Block>

        <Block title="What the shape shows" id="findings">
          <p className="text-sm text-muted mb-4 max-w-3xl">{spell(found.length)} questions asked of the dates once they are in one shape. Every figure carries the number of records it was computed over. A question answered over fewer than {MIN_N} cases, or contradicted by the shape of the data, is marked as one the corpus cannot support, and the working is shown anyway so the thinness is visible.</p>
          <div className="space-y-4">
            {found.map((f) => (
              <section key={f.id} id={f.id} className="card p-4 scroll-mt-28">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="font-semibold text-[15px] min-w-0">{f.question}</h3>
                  <span className="flex shrink-0 items-baseline gap-2">
                    <span className="chip bg-foreground/5 tabular-nums">{f.figure}</span>
                    {!f.supported && <span className="chip bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" title={`Fewer than ${MIN_N} cases, or contradicted by the shape of the data.`}>Corpus cannot support this</span>}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed mt-2 max-w-3xl">{f.answer}</p>
                <p className="text-sm text-muted mt-2 max-w-3xl"><span className="font-medium text-foreground">Denominator.</span> {f.denominator}.</p>
                <p className="text-sm text-muted mt-1 max-w-3xl"><span className="font-medium text-foreground">What it does not show.</span> {f.caveat}</p>
                {f.rows && f.rows.length > 0 && (
                  <dl className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-sm">
                    {f.rows.map((r) => <div key={r.label} className="flex flex-wrap justify-between gap-x-3 border-t border-border pt-1"><dt className="text-muted min-w-0">{r.label}</dt><dd className="tabular-nums">{r.value}</dd></div>)}
                  </dl>
                )}
              </section>
            ))}
          </div>
        </Block>

        <Block title="Every year" id="years">
          <p className="text-sm text-muted mb-4 max-w-3xl">Each year links to its own page, which lists everything the corpus dates to it, grouped by what kind of thing it was. A year with nothing in it keeps its page and says so: leaving it out would read as a claim that nothing happened, when what is true is that nothing has been read into the corpus for it.</p>
          <YearIndex columns={[...cols].reverse()} />
        </Block>

        <Block title="What a year is made of" id="groups">
          <p className="text-sm text-muted mb-3 max-w-3xl">{byGroup.size} groups, each one a field the corpus already carried. Nothing here is a new claim: a year is a view of the other records, generated from them, so it changes when they do.</p>
          <dl className="space-y-2 max-w-4xl">
            {[...byGroup.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => (
              <div key={k} className="border-t border-border pt-2">
                <dt className="font-medium text-[15px]">{YEAR_GROUP_META[k].label} <span className="text-muted font-normal tabular-nums">{num(n)}</span></dt>
                <dd className="text-sm text-muted">{YEAR_GROUP_META[k].source}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted mt-4 max-w-3xl">The chart stacks them into four bands: {BANDS.map((b) => b.label.toLowerCase()).join("; ")}. Counts are of entries, not of records: a product with an approval in three regions contributes three, and a paper listed on three people&apos;s pages contributes one.</p>
        </Block>

        <Block title="One year at a time" id="scrubber">
          <p className="text-sm text-muted mb-4 max-w-3xl">The same dated fields, read forwards: drag the year and see what had happened by then. For everything the corpus holds in a single year, with its sources, open that year&apos;s own page: the busiest, <Link className="underline" href={`/years/${busiest.year}/`}>{busiest.year}</Link>, with {num(busiest.events.length)} entries; the last the corpus dates anything to, <Link className="underline" href={`/years/${years[years.length - 1].year}/`}>{years[years.length - 1].year}</Link>; or <Link className="underline" href="/years/">all {num(years.length)} years as a table</Link>.</p>
          <TimelineScrubber data={data} />
        </Block>
      </Container>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="card p-3"><div className="kicker mb-1">{label}</div><div className="text-2xl font-semibold tabular-nums">{value}</div></div>;
}

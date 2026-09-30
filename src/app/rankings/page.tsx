import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { rankings, TOP } from "@/lib/rankings";
import { Container, GroupKicker, PageHeader, Section } from "@/components/ui";
import { KindIcon } from "@/components/KindIcon";

export const metadata: Metadata = pageMeta({
  title: "Rankings",
  description: "League tables computed from the OnCo corpus alone: cancers by trials and approved products, targets by products, companies by trials and approvals, trials by enrolment, people by papers and more. Each table states its basis in one sentence and shows how completely the counted field is filled.",
  path: "/rankings/",
});

export default function RankingsHub() {
  const all = rankings();
  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="find"><span className="kicker">·</span><Link href="/explore/" className="kicker hover:underline">Browse the corpus by cancer and kind</Link><span className="kicker">·</span><Link href="/coverage/rankings/" className="kicker hover:underline">Coverage rankings</Link></GroupKicker>}
        title="Rankings"
        lede={`${all.length} league tables, each computed from counts and dates already in the corpus: no weighting, no composite score, no number that cannot be traced to a record. Every table says in one sentence what it counts, shows the top ${TOP}, and discloses how completely the counted field is filled. Ties are broken by name.`}
      />
      <Container className="pb-16">
        <div className="card p-4 text-sm text-muted max-w-3xl">
          <div className="kicker mb-1">Read this first</div>
          <p>These tables rank what the corpus records, not clinical merit. A cancer with many trials is well studied, not well treated; a company with many approval records has many labels, not better drugs. Each table&apos;s page carries a &quot;How this is counted&quot; note and a JSON companion.</p>
        </div>

        <Section id="tables" title="All tables" aside={<span className="text-sm text-muted">{all.length} rankings</span>}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((r) => (
              <article key={r.slug} id={r.slug} className="card p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent" title={r.kind}><KindIcon kind={r.kind} className="h-4.5 w-4.5" /></span>
                  <h3 className="font-semibold leading-snug"><Link href={`/rankings/${r.slug}/`} className="hover:underline">{r.title}</Link></h3>
                </div>
                <p className="text-sm text-muted">{r.basis}</p>
                <ol className="text-sm space-y-1" aria-label={`Top three: ${r.title}`}>
                  {r.rows.slice(0, 3).map((row) => (
                    <li key={row.id} className="flex items-baseline gap-2">
                      <span className="tabular-nums text-muted w-4 shrink-0">{row.rank}</span>
                      <Link href={row.route} className="flex-1 min-w-0 truncate hover:underline" title={row.name}>{row.name}</Link>
                      <span className="tabular-nums whitespace-nowrap text-foreground/80">{row.metric}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-auto flex items-center justify-between gap-2 text-xs pt-1">
                  <Link href={`/rankings/${r.slug}/`} className="chip border bg-card border-border hover:bg-foreground/5"><KindIcon kind={r.kind} className="h-3.5 w-3.5" /><span>Full table · {r.rows.length} of {r.total.toLocaleString("en-GB")}</span></Link>
                  <a href={`/rankings/${r.slug}/data.json`} type="application/json" className="text-muted hover:underline hover:text-foreground">JSON</a>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="method" title="Method">
          <div className="card p-4 text-sm space-y-2 max-w-3xl">
            <p>A row&apos;s value is a count of linked records, a ratio of two such counts, or the difference between two years on the record. The registry lives in <code>src/lib/rankings.ts</code>; a table is only registered when the field it counts is filled on at least 60 percent of the records it draws from, and that share is printed under every table.</p>
            <p>Tables considered and not built, because the corpus does not yet carry the field widely enough: institutions by trials (4 percent of trials name an institution), cancers by ideas (38 percent of ideas name a cancer), time from first trial to first approval (trials carry a readout year, not a start date, on 18 percent of records), and countries by approvals or trial sites (approvals carry a regulator, not a country, and trials carry no site list). Insurer and country tables built from published external figures are on <Link className="underline" href="/coverage/rankings/">Coverage rankings</Link> and <Link className="underline" href="/countries/">Countries</Link>.</p>
          </div>
        </Section>
      </Container>
    </>
  );
}

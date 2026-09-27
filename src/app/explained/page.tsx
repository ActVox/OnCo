import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { EXPLAINED_PAGE, explainedGroups, explainedRow, OTHER_NAME } from "@/lib/explained-data";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { ExplainedSection } from "@/components/ExplainedSection";
import { CancerIcon, CancerIconDefs } from "@/components/CancerIcon";

export const metadata: Metadata = pageMeta({
  title: "Trials in plain words",
  description: "Every trial result in OnCo explained without statistics: how many more people out of 100 were helped, what a median means, which endpoints are surrogates, and who the result applies to.",
  path: "/explained/",
});

export default function ExplainedPage() {
  const g = graph();
  // Sections and their trials come from src/lib/explained-data.ts, which also shapes the per-section files
  // (/api/v1/explained/<id>.json) holding the rows beyond the first page and the explainer bodies that
  // ExplainedSection fetches on demand. A trial that touches several cancers has its full row once, in the first
  // section (alphabetical) it appears in (`own`); the later sections list it as a pill that opens that row (`refs`).
  const ordered = explainedGroups(g);
  const trialCount = ordered.reduce((n, grp) => n + grp.own.length, 0);
  const cancerCount = ordered.filter((grp) => grp.cancer).length;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="Trials in plain words"
        lede="Hazard ratios and medians are the language trial results are published in; this page is the same numbers in English. This page takes every trial result recorded in OnCo and says what it means for people: how many more out of 100 were helped, roughly how many need to be treated for one extra person to benefit, what a median is and is not, whether the endpoint is a surrogate or actual survival, and who the trial enrolled. The numbers come from the trial records and their sources; the words are ours." />
      <Container className="pb-16">
        {/* The organ drawings once each; the 256 section headings reference them (132 KB of HTML as inline drawings). */}
        <CancerIconDefs cancerIds={ordered.flatMap((grp) => (grp.cancer ? [grp.cancer.id] : []))} />
        <div className="text-sm text-muted mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className="tabular-nums">{trialCount} trials with structured results</span>
          <span className="tabular-nums">{cancerCount} cancers</span>
          <span>Jump to a cancer:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-10">
          {ordered.map((grp) => (
            <a key={grp.key} href={`#cancer-${grp.key}`} className="chip explained-jump">{grp.cancer?.name ?? OTHER_NAME}<span>{grp.trials.length}</span></a>
          ))}
        </div>

        <div className="space-y-14">
          {ordered.map((grp) => {
            // The HTML carries the first page of rows and pills; the section fetches the rest from its file as the reader
            // scrolls past them. The rows beyond the first page are listed for readers and crawlers without JavaScript.
            const first = grp.own.slice(0, EXPLAINED_PAGE);
            const rest = grp.own.slice(EXPLAINED_PAGE);
            return (
              <section key={grp.key} id={`cancer-${grp.key}`}>
                <div className="explained-head">
                  {grp.cancer && <span className="explained-icon"><CancerIcon cancerId={grp.cancer.id} symbol /></span>}
                  <h2>{grp.cancer ? <Link href={routeFor(grp.cancer)}>{grp.cancer.name}</Link> : "Trials not yet linked to a cancer"}</h2>
                  <span className="count">{grp.trials.length} trial{grp.trials.length === 1 ? "" : "s"}</span>
                </div>
                <ExplainedSection section={grp.key} rows={first.map(explainedRow)} total={grp.own.length} refs={grp.refs.slice(0, EXPLAINED_PAGE)} refTotal={grp.refs.length} />
                {rest.length > 0 && (
                  <noscript>
                    <p className="explained-rest">
                      The other {rest.length} trials explained in this section, each with its results on its own page:{" "}
                      {rest.map((t, i) => <Fragment key={t.id}>{i > 0 && ", "}<a href={routeFor(t)}>{t.name}</a></Fragment>)}.
                    </p>
                  </noscript>
                )}
              </section>
            );
          })}
        </div>
      </Container>
    </>
  );
}

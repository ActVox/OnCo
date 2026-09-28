import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { resistance } from "@/data/resistance";
import { CATEGORY_BY_ID } from "@/lib/resistance-categories";
import { resistanceGaps, gapCountByClass, type ResistanceGap } from "@/lib/resistance-gaps";
import { Container, GroupKicker, PageHeader, ChipList } from "@/components/ui";
import { RefChips } from "@/components/RefChips";
import { Tip } from "@/components/Tip";

export const metadata: Metadata = pageMeta({ title: "Unaddressed resistance", description: "Every resistance mechanism in the atlas with no countermeasure, or only preclinical ones, grouped by drug class and linked to the ideas that target it: the drug-design opportunities.", path: "/resistance/gaps/" });

const shortLabel = (s: string) => s.split(" (")[0];

function GapCard({ gap }: { gap: ResistanceGap }) {
  const cat = CATEGORY_BY_ID[gap.mechanism.category];
  const m = gap.mechanism;
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: cat.color }}><span className="inline-block h-2 w-2 rounded-full" style={{ background: cat.color }} /> {cat.label} · <Link href={`/resistance/#${gap.classId}`} className="text-muted hover:underline font-normal">{shortLabel(gap.drugClass)}</Link></div>
        <div className="font-medium leading-snug mt-0.5">{m.name}</div>
        {m.frequency && <div className="text-xs text-muted mt-0.5 tabular-nums">Frequency: {m.frequency}</div>}
        <p className="text-sm text-muted mt-1.5 leading-relaxed">{m.how}</p>
        <RefChips ids={m.refs} className="mt-2" />
      </div>
      <div className={`border-l-2 pl-3 rounded-r-md py-2 ${gap.tier === "none" ? "border-rose-500/70 bg-rose-500/[0.04]" : "border-amber-500/70 bg-amber-500/[0.04]"}`}>
        <div className={`kicker ${gap.tier === "none" ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"}`}>{gap.tier === "none" ? "No countermeasure recorded" : `Preclinical or conceptual only · ${m.countermeasures.length}`}</div>
        {gap.tier === "preclinical" && <ul className="mt-1 space-y-1.5 text-sm">{m.countermeasures.map((c, i) => <li key={i}>{c.text}<RefChips ids={c.refs} className="mt-1" /></li>)}</ul>}
        {gap.tier === "none" && <p className="text-sm text-muted mt-1">Nothing in the atlas closes this route. If you know of a strategy, <Link className="underline" href="/suggest/">suggest an edit</Link>.</p>}
      </div>
      {gap.ideas.length > 0 && <div><div className="kicker mb-1">Ideas that attack it · {gap.ideas.length}</div><ChipList items={gap.ideas.slice(0, 8)} /></div>}
    </div>
  );
}

export default function ResistanceGapsPage() {
  const gaps = resistanceGaps();
  const counts = gapCountByClass();
  const none = gaps.filter((x) => x.tier === "none");
  const pre = gaps.filter((x) => x.tier === "preclinical");
  const clinical = gaps.length - none.length - pre.length;
  const classes = resistance.map((r) => ({ r, c: counts[r.id] ?? { none: 0, preclinical: 0, total: 0 } })).sort((a, b) => (b.c.none + b.c.preclinical) - (a.c.none + a.c.preclinical) || a.r.drugClass.localeCompare(b.r.drugClass));
  const byCategory = Object.entries(CATEGORY_BY_ID).map(([id, cat]) => ({ cat, n: [...none, ...pre].filter((x) => x.mechanism.category === id).length })).filter((x) => x.n);

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel"><Link href="/resistance/" className="kicker hover:underline">· How tumours escape each drug class</Link></GroupKicker>} title="Unaddressed resistance"
        lede={`Of the ${gaps.length} escape routes in the atlas, ${clinical} have at least one countermeasure with clinical evidence, ${pre.length} have only preclinical or conceptual answers, and ${none.length} have none recorded. The last two groups, listed here by drug class and linked to the ideas that target them, are where a drug designer should look.`} />
      <Container className="pb-16">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {classes.map(({ r, c }) => (
            <a key={r.id} href={`#${r.id}`} className="card p-4 block hover:bg-foreground/[0.03]">
              <div className="font-medium leading-snug">{shortLabel(r.drugClass)}</div>
              <div className="mt-2 flex items-baseline gap-3 text-sm">
                <Tip title="No countermeasure" text="Routes with nothing recorded that closes them."><span className={`tabular-nums font-semibold cursor-help ${c.none ? "text-rose-700 dark:text-rose-300" : "text-muted"}`}>{c.none} none</span></Tip>
                <Tip title="Preclinical only" text="Routes whose countermeasures cite only preclinical products, ideas or concepts."><span className={`tabular-nums font-semibold cursor-help ${c.preclinical ? "text-amber-700 dark:text-amber-300" : "text-muted"}`}>{c.preclinical} preclinical</span></Tip>
                <span className="text-muted text-xs ml-auto">of {c.total}</span>
              </div>
              <div className="mt-2 h-1.5 rounded bg-foreground/10 overflow-hidden flex"><span className="bg-rose-500/80" style={{ width: `${(100 * c.none) / c.total}%` }} /><span className="bg-amber-500/80" style={{ width: `${(100 * c.preclinical) / c.total}%` }} /></div>
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-8">
          <span className="kicker">Gaps by kind of escape</span>
          {byCategory.map(({ cat, n }) => <Tip key={cat.id} title={cat.label} text={cat.oneLiner}><span className="inline-flex items-center gap-1.5 cursor-help"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />{cat.label} <b className="tabular-nums">{n}</b></span></Tip>)}
        </div>

        <div className="space-y-10">
          {classes.filter(({ c }) => c.none + c.preclinical > 0).map(({ r }) => {
            const list = gaps.filter((x) => x.classId === r.id && x.tier !== "clinical").sort((a, b) => (a.tier === "none" ? 0 : 1) - (b.tier === "none" ? 0 : 1));
            return (
              <section key={r.id} id={r.id} className="scroll-mt-28">
                <header className="mb-3">
                  <div className="kicker">Drug class · {list.length} unaddressed of {r.mechanisms.length}</div>
                  <h2 className="text-xl font-semibold tracking-tight mt-0.5"><Link href={`/resistance/#${r.id}`} className="hover:underline">{r.drugClass}</Link></h2>
                  <p className="text-sm text-muted mt-1 max-w-3xl">{r.tldr}</p>
                </header>
                <div className="grid gap-3 md:grid-cols-2">{list.map((gap) => <GapCard key={`${gap.classId}-${gap.mechanism.name}`} gap={gap} />)}</div>
              </section>
            );
          })}
        </div>

        <p className="text-xs text-muted mt-10 max-w-3xl">A countermeasure counts as clinical when it cites a product that is approved or in phase 2 or later, or cites a trial. It counts as preclinical when it cites only preclinical or phase 1 products, technologies, terms or ideas. Ideas are linked when a countermeasure or the mechanism cites them, or when they name a target the mechanism names. The atlas is curated, so &ldquo;none recorded&rdquo; means OnCo has not recorded one, and a correction is welcome.</p>
      </Container>
    </>
  );
}

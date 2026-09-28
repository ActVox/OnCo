import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { compareAnchorIds, compareRoute, COMPARE_SETS, resolveCompare } from "@/lib/cancer-compare";
import { toolsFor, toolRoute } from "@/lib/decision-tools";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CancerIcon } from "@/components/CancerIcon";
import { CompareCancers } from "@/components/CompareCancers";
import { ToolGlyph } from "@/components/ToolGlyph";
import { SectionStrip } from "@/components/SectionStrip";

/** A cancer beside its neighbours (/cancers/<id>/compared/): the compare set anchored at this cancer, rendered by CompareCancers. */
export function generateStaticParams() {
  return compareAnchorIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const set = COMPARE_SETS.find((s) => s.anchorId === id);
  if (!set) return {};
  const c = graph().must(id);
  return pageMeta({ title: `${c.name} · Compared with its neighbours`, description: set.title, path: compareRoute(id) });
}

export default async function ComparedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const set = COMPARE_SETS.find((s) => s.anchorId === id);
  if (!set) notFound();
  const g = graph();
  const c = g.must(id);
  const { cancers, rows } = resolveCompare(set);
  const filled = rows.reduce((n, r) => n + Object.values(r.cells).filter(Boolean).length, 0);
  const total = rows.length * cancers.length;
  const tools = toolsFor(id);
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Cancers", href: "/cancers/" }, { label: c.name, href: routeFor(c) }, { label: "Compared", href: compareRoute(id) }]} />
      <PageHeader
        kicker={<GroupKicker id="map"><span className="kicker">·</span><Link href={routeFor(c)} className="kicker hover:underline">{c.name}</Link></GroupKicker>}
        title={`${c.name.replace(/\s*\(.*?\)\s*$/, "")} compared with its neighbours`}
        lede={`${set.lede} ${filled} of ${total} cells are filled from ${cancers.length} records and the papers linked in them; checked ${set.asOf}.`}
        logo={<span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-8 w-8" /></span>}
        right={<div className="flex flex-col items-end gap-2 text-xs text-muted"><Link href={`/compare/?ids=${set.ids.join(",")}`} className="underline">Generic compare view →</Link><Link href={routeFor(c)} className="underline">Cancer page →</Link></div>} />
      <Container className="pb-16">
        <SectionStrip cancerId={id} current="what-it-is" />
        <nav aria-label="Cancers compared" className="mb-4 flex flex-wrap gap-1.5 text-sm">
          {cancers.map((x) => <Link key={x.id} href={routeFor(x)} className={`chip border inline-flex items-center gap-1.5 hover:bg-foreground/5 ${x.id === id ? "bg-accent-soft border-accent/40 text-accent" : "bg-card border-border"}`}><CancerIcon cancerId={x.id} className="h-3.5 w-3.5" />{x.name.replace(/\s*\(.*?\)\s*$/, "")}</Link>)}
          <span className="text-muted self-center">·</span>
          {rows.map((r) => <a key={r.def.id} href={`#row-${r.def.id}`} className="chip border bg-card border-border hover:bg-foreground/5 inline-flex items-center gap-1"><ToolGlyph name={r.def.icon} className="h-3 w-3" />{r.def.label}</a>)}
        </nav>
        <CompareCancers set={set} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 text-sm">
          <div className="card p-4 space-y-1.5">
            <h2 className="font-semibold inline-flex items-center gap-1.5"><ToolGlyph name="info" className="h-4 w-4 text-accent" />How to read this table</h2>
            <p className="text-muted">Computed rows read each record as it stands: the burden field, the standard-of-care row named under the label, the history events that name a trial, and the prevalence rows on the target record (a row recorded on a parent record, such as cholangiocarcinoma, says so). Hand-written rows quote a sentence of the record&rsquo;s own text, or a paper linked in the cell. Nothing is estimated; a cell with nothing behind it is left empty. OnCo is orientation, not medical advice.</p>
          </div>
          <div className="card p-4 space-y-1.5">
            <h2 className="font-semibold inline-flex items-center gap-1.5"><ToolGlyph name="compass" className="h-4 w-4 text-accent" />Related</h2>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t) => <Link key={t.id} href={toolRoute(t.id)} className="chip border bg-accent-soft border-accent/40 text-accent hover:bg-foreground/5 inline-flex items-center gap-1.5 text-xs"><ToolGlyph name={t.icon} className="h-3 w-3" />{t.short}</Link>)}
              <Link href={`${routeFor(c)}decisions/`} className="chip border bg-card border-border hover:bg-foreground/5 text-xs">Decisions</Link>
              <Link href={`/sequencing/${c.id}/`} className="chip border bg-card border-border hover:bg-foreground/5 text-xs">Lines of therapy</Link>
              <Link href="/prevalence/" className="chip border bg-card border-border hover:bg-foreground/5 text-xs">Prevalence matrix</Link>
              <Link href="/tools/" className="chip border bg-card border-border hover:bg-foreground/5 text-xs">All decision aids</Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

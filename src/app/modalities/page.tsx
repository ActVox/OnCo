import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/JsonLd";
import { FormatGlyph } from "@/components/FormatGlyph";
import { Tip } from "@/components/Tip";
import { modalityHubs } from "@/lib/modalities";
import { modalityFile, modalityRoute } from "@/lib/modular-formats";

const DESCRIPTION = "One hub per shape of medicine (ADC, radioligand, CAR-T, TCR-T, bispecific, degrader, small molecule, antibody, cytokine, vaccine, oncolytic virus, other cell therapy): how it works, approved medicines with their cancers and years, phase 3, the parts, the companies, the trials recruiting, side effects, resistance, key papers, roadmap eras, open questions and manufacturing, every section naming its records.";
export const metadata: Metadata = pageMeta({ title: "Medicines by shape: ADC, CAR-T, radioligand", description: DESCRIPTION, path: modalityRoute() });

const n = (x: number) => x.toLocaleString("en-GB");
const CRUMBS = [{ label: "Home", href: "/" }, { label: "Pipeline funnel", href: "/pipeline/" }, { label: "Medicines by shape", href: modalityRoute() }];

export default function ModalitiesPage() {
  const hubs = modalityHubs();
  const totals = hubs.reduce((t, h) => ({ drugs: t.drugs + h.counts.drugs, approved: t.approved + h.counts.approved, trials: t.trials + h.counts.trials }), { drugs: 0, approved: 0, trials: 0 });
  return (
    <>
      <BreadcrumbJsonLd items={CRUMBS} />
      <WebPageJsonLd path={modalityRoute()} name="Medicines by shape" description={DESCRIPTION} />
      <Breadcrumbs items={CRUMBS} />
      <PageHeader kicker={<GroupKicker id="intel" />} title="Medicines by shape: ADC, CAR-T, radioligand"
        lede={`A medicine has a shape before it has a target: an antibody carrying a poison, a peptide carrying an isotope, a T cell carrying a receptor. These ${hubs.length} hubs read the corpus by shape. Each one gathers what OnCo already records about a format, ${n(totals.drugs)} medicines in all with ${n(totals.approved)} approved and ${n(totals.trials)} trials recruiting, and every section names the records it came from; where the corpus has nothing, the section says so rather than filling in.`}
        right={<div className="flex flex-wrap gap-2 justify-end"><a href={modalityFile("index")} className="chip border bg-card border-border hover:bg-foreground/5 text-sm" title="Every format with its counts and the route and file of its hub, as JSON">JSON for agents</a><Link href="/pipeline/engine/" className="chip border bg-card border-border hover:bg-foreground/5 text-sm" title="The same formats taken apart into their parts: the permutation grid of every combination">Open drug engine →</Link></div>} />
      <Container className="pb-16">
        <nav aria-label="Formats" data-tabbar className="flex flex-wrap gap-1.5 mb-8 text-sm">
          {hubs.map((h) => (
            <Link key={h.format.id} href={h.route} className="chip border border-border bg-card hover:bg-accent-soft hover:text-accent hover:border-accent inline-flex items-center gap-1.5" title={h.format.blurb}>
              <FormatGlyph glyph={h.format.glyph} className="h-3.5 w-3.5" />{h.format.name} <span className="text-xs text-muted tabular-nums">{n(h.counts.drugs)}</span>
            </Link>
          ))}
        </nav>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          {hubs.map((h) => {
            const speaker = h.how.from[0];
            const first = h.how.paragraphs[0];
            return (
              <article key={h.format.id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><FormatGlyph glyph={h.format.glyph} /></span>
                  <div className="min-w-0">
                    <h2 className="font-semibold leading-snug"><Link href={h.route} className="hover:underline">{h.format.name}</Link></h2>
                    <p className="text-xs text-muted mt-0.5">{n(h.counts.drugs)} medicine{h.counts.drugs === 1 ? "" : "s"} in the corpus · {h.how.technologies.length} technology record{h.how.technologies.length === 1 ? "" : "s"}</p>
                  </div>
                </div>
                {first ? (
                  <p className="text-sm text-muted leading-relaxed">{first} {speaker && <Link href={speaker.route} className="text-xs underline decoration-dotted" title="The technology record this sentence is read from">from {speaker.name}</Link>}</p>
                ) : <p className="text-sm text-muted leading-relaxed">{h.format.blurb}</p>}
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <Link href={`${h.route}#approved`} className="chip bg-accent-soft text-accent border border-accent/30 justify-between hover:ring-2 hover:ring-accent/30" title="Medicines with an approval row or an approved status, with their cancers and years"><span>Approved</span><span className="tabular-nums font-medium">{n(h.counts.approved)}</span></Link>
                  <Link href={`${h.route}#phase3`} className="chip tone-live justify-between hover:ring-2 hover:ring-accent/30" title="Medicines with a phase 3 status or a live phase 3 trial, not yet approved"><span>Phase 3</span><span className="tabular-nums font-medium">{n(h.counts.phase3)}</span></Link>
                  <Link href={`${h.route}#trials`} className="chip border border-border bg-card justify-between hover:ring-2 hover:ring-accent/30" title="Trial records recruiting now that name a medicine of the format"><span>Recruiting</span><span className="tabular-nums font-medium">{n(h.counts.trials)}</span></Link>
                  <Link href={`${h.route}#companies`} className="chip border border-border bg-card justify-between hover:ring-2 hover:ring-accent/30" title="Companies named on the format's medicines"><span>Companies</span><span className="tabular-nums font-medium">{n(h.counts.companies)}</span></Link>
                </div>
                <p className="text-xs text-muted">
                  <Tip title="Open drug engine" text={`${h.engine.axes[0]} by ${h.engine.axes[1].toLowerCase()}: ${n(h.engine.counts.approved)} combinations approved, ${n(h.engine.counts.development)} in development, ${n(h.engine.counts.stopped)} tried and stopped, ${n(h.engine.counts.untried)} untried in this corpus.`} href={h.engine.route} linkLabel="Open the grid →">
                    <Link href={h.engine.route} className="underline decoration-dotted">{n(h.engine.rows)} x {n(h.engine.cols)} grid</Link>
                  </Tip>
                  {" · "}<Link href={`${h.route}#papers`} className="hover:underline">{n(h.counts.papers)} papers</Link>
                  {" · "}<Link href={`${h.route}#ideas`} className="hover:underline">{n(h.counts.ideas)} ideas</Link>
                  {" · "}<a href={h.file} className="hover:underline" title="This hub as JSON">JSON</a>
                </p>
              </article>
            );
          })}
        </div>

        <section className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">What a modality hub is</h2>
            <p>Most of OnCo is organised by disease, target or record kind. The modality lens turns the corpus ninety degrees and reads it by the shape of the medicine, the way a drug designer, a manufacturer or a regulator thinks about it: everything the site knows about antibody-drug conjugates in one place, then everything about radioligands, and so on for the twelve formats the open drug engine defines.</p>
            <p>Nothing on a hub is written for the hub. The plain-English explanation is the technology record&apos;s own TL;DR and principle; the approved medicines are the drug records with approval rows; the trials are the trial records that name those medicines; the side-effect profile is the glossary terms and label events those records carry; the resistance routes are the atlas entries whose exemplars are medicines of the format. Every section says which records it came from, and a section with nothing behind it is left empty.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How a hub is built</h2>
            <p>The medicines of a format are the ones the <Link href="/pipeline/engine/" className="underline">open drug engine</Link> files under it, placed on its grid or listed as unresolved; the technology records of a format are listed by hand in src/lib/modular-formats.ts and each carries a pill back to its hub. From those two sets the rest follows the graph&apos;s links: companies from the medicine records and the companies that list them, papers and ideas from their references, roadmap steps from the records they cite, manufacturing from the site and supply chain records.</p>
            <p>Each hub has a JSON companion at the same address (data.json) with the same sections and the record ids behind each, so agents can read the lens the way a reader does. The pages are open data (CC BY-NC 4.0). Nothing here is medical advice.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";
import { GardenBackdrop } from "@/components/Garden";
import { pageMeta } from "@/lib/seo";
import { DECISION_TOOLS } from "@/lib/decision-tools";
import { FIRST_60_DAYS_CHECKLISTS } from "@/data/first-60-days-checklists";
import { redFlagsForCancerId } from "@/data/red-flags";
import { KIND_META, KINDS } from "@/lib/kinds";

/**
 * A second front page, for review, at /v2/.
 *
 * The page at / is organised by what the site contains: a graph of the kinds, or the same counts as a list.
 * Both answer "what is in here?". Nobody arrives with that question. A person arrives having been told
 * something an hour ago, or looking after someone who has, and their question is "where do I start?".
 *
 * So this page is organised by what a reader is trying to do, and every block leads to a page that does
 * something for them rather than describing something: the checklist for the first sixty days, the symptoms
 * worth a phone call tonight, the decision aids, the questions to take to an appointment. The inventory is
 * still here, at the bottom, where it belongs: it is evidence of scale, not navigation.
 *
 * Nothing here is new content. Every destination already exists; this is an argument about order.
 */

const V2_DESCRIPTION = "Start from what you were told. The first sixty days, what is worth a phone call, the decisions you are being asked to make, and the evidence under each one.";

export const metadata: Metadata = pageMeta({ title: "Start here", description: V2_DESCRIPTION, path: "/v2/" });

/** Cancers deep enough to lead with, in the order a reader is likeliest to need them. */
const LEAD = ["breast-cancer", "prostate", "lung-cancer", "colorectal", "skin-cancer", "pancreatic"];

const ROUTING = /^Which page is mine[^.?]*[.?]/i;

function Heading({ title, sub, href, label }: { title: string; sub?: string; href?: string; label?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 mb-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {sub && <p className="text-sm text-muted mt-1 max-w-2xl leading-relaxed">{sub}</p>}
      </div>
      {href && label && (
        <Link href={href} className="text-sm font-medium text-foreground/80 hover:text-foreground underline decoration-foreground/25 underline-offset-[3px]">{label}</Link>
      )}
    </div>
  );
}

export default function V2() {
  const g = graph();
  const cancers = g.kind("cancer");
  const byId = new Map(cancers.map((c) => [c.id, c]));

  const lead = LEAD.map((id) => byId.get(id)).filter((c): c is NonNullable<typeof c> => !!c).map((c) => {
    const children = cancers.filter((x) => x.parent === c.id).length;
    const hook = c.notes.find((n) => ROUTING.test(n))?.match(ROUTING)?.[0];
    return { c, children, hook, checklist: !!FIRST_60_DAYS_CHECKLISTS[c.id], cards: redFlagsForCancerId(c.id).length };
  });

  const justTold = Object.keys(FIRST_60_DAYS_CHECKLISTS)
    .map((id) => byId.get(id))
    .filter((c): c is NonNullable<typeof c> => !!c && !c.parent)
    .sort((a, b) => a.name.localeCompare(b.name));

  const tools = [...DECISION_TOOLS].sort((a, b) => a.title.localeCompare(b.title));

  const counts = KINDS.map((k) => ({ k, n: g.kind(k).length })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
  const total = counts.reduce((n, x) => n + x.n, 0);

  return (
    <>
      <section className="hero relative border-b border-border">
        <GardenBackdrop variant="hero" />
        <Container className="relative pt-14 pb-10 sm:pt-18 sm:pb-12">
          <div className="max-w-3xl">
            <h1 className="display">Start from what you were told.</h1>
            <p className="mt-6 text-[17px] sm:text-xl text-foreground/85 leading-relaxed max-w-2xl">
              Type the words you were given: the cancer, the drug, the gene, or the phrase from the report you did not
              understand. Every page is in plain English first, with the technical layer one click below and a source
              under every number.
            </p>
            <div className="mt-8 max-w-2xl"><SearchBox large /></div>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <Link href="/body/" className="btn">Find it by where it is</Link>
              <Link href="/tools/" className="btn">Decisions you are being asked to make</Link>
              <Link href="/for-me/" className="btn">Follow one cancer</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 1. The person told this week. */}
      <Container className="pt-14">
        <Heading
          title="Told this week"
          sub="Three things worth reading before the next appointment. None of them asks you to understand the biology first."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <section className="card relative p-5">
            <GardenBackdrop variant="card" seed={11} />
            <h3 className="relative text-lg font-semibold tracking-tight">The first sixty days</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">What happens, in what order, and what to sort out while you wait. Written for {justTold.length} cancers so far.</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {justTold.map((c) => (
                <li key={c.id}><Link href={`/first-60-days/${c.id}/`} className="chip border bg-card border-border hover:bg-foreground/5 text-xs">{c.name}</Link></li>
              ))}
            </ul>
          </section>
          <section className="card relative p-5">
            <GardenBackdrop variant="card" seed={23} />
            <h3 className="relative text-lg font-semibold tracking-tight">What is worth a phone call</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              The symptoms that mean ring tonight rather than wait, on the page for the cancer you have. Spinal cord
              compression, infection during chemotherapy, and the ones that are easy to miss because they do not feel like an emergency.
            </p>
            <p className="mt-3 text-sm"><Link href="/cancers/" className="underline decoration-foreground/25 underline-offset-[3px]">Open your cancer&apos;s page</Link>, then the section called When to call.</p>
          </section>
          <section className="card relative p-5">
            <GardenBackdrop variant="card" seed={37} />
            <h3 className="relative text-lg font-semibold tracking-tight">What to ask</h3>
            <p className="text-sm text-muted mt-1 leading-relaxed">
              Questions grouped by who you are seeing, each with the reason it is worth asking and the guideline or
              trial behind it. Take them in on a phone.
            </p>
            <p className="mt-3 text-sm"><Link href="/prep/" className="underline decoration-foreground/25 underline-offset-[3px]">Build an appointment pack</Link></p>
          </section>
        </div>
      </Container>

      {/* 2. Which page is mine. */}
      <Container className="pt-14">
        <Heading
          title="Which page is mine?"
          sub="The commonest cancers, each with the sentence that tells you which of its pages you are on. Everything below a family page is one click down."
          href="/cancers/"
          label="All cancers"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lead.map(({ c, children, hook, checklist, cards }) => (
            <article key={c.id} className="card relative p-5 flex flex-col">
              <GardenBackdrop variant="card" seed={c.id.length * 5} />
              <h3 className="relative text-lg font-semibold tracking-tight">
                <Link href={routeFor(c)} className="hover:underline decoration-foreground/25 underline-offset-[3px]">{c.name}</Link>
              </h3>
              <p className="text-sm text-muted mt-1 leading-relaxed grow">{hook ?? c.tldr}</p>
              <p className="mt-3 flex flex-wrap gap-1.5 text-xs">
                {children > 0 && <Link href={routeFor(c)} className="chip border bg-card border-border hover:bg-foreground/5">{children} types</Link>}
                {checklist && <Link href={`/first-60-days/${c.id}/`} className="chip border bg-card border-border hover:bg-foreground/5">First 60 days</Link>}
                {cards > 0 && <Link href={`${routeFor(c)}living-with-it/`} className="chip border bg-card border-border hover:bg-foreground/5">{cards} when-to-call sets</Link>}
              </p>
            </article>
          ))}
        </div>
      </Container>

      {/* 3. The decisions. */}
      <Container className="pt-14">
        <Heading
          title="Decisions you are being asked to make"
          sub="Each one takes what you already know and gives back what the guideline says, with the trial figures for what each choice costs. No score, no prediction."
          href="/tools/"
          label="All decision aids"
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {tools.map((t) => {
            const c = byId.get(t.cancerId);
            return (
              <li key={t.id} className="card p-4">
                <Link href={`/tools/${t.id}/`} className="font-medium hover:underline decoration-foreground/25 underline-offset-[3px]">{t.title}</Link>
                <p className="text-sm text-muted mt-1 leading-relaxed">{t.lede}</p>
                <p className="mt-2 text-xs text-muted">
                  {c ? <Link href={routeFor(c)} className="hover:underline">{c.name}</Link> : t.cancerId} · follows {t.guideline.label}
                </p>
              </li>
            );
          })}
        </ul>
      </Container>

      {/* 4. Everyone else. */}
      <Container className="pt-14">
        <Heading title="Looking for something else" sub="The same corpus, entered from a different question." />
        <div className="grid gap-4 md:grid-cols-3">
          <section className="card p-5">
            <h3 className="text-lg font-semibold tracking-tight">Caring for someone</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/for-me/" className="hover:underline">Follow one cancer and see what changed</Link></li>
              <li><Link href="/assistance/" className="hover:underline">Money, work and practical help</Link></li>
              <li><Link href="/institutions/" className="hover:underline">Where it is treated</Link></li>
            </ul>
          </section>
          <section className="card p-5">
            <h3 className="text-lg font-semibold tracking-tight">Clinician or researcher</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/explore/" className="hover:underline">Explore by cancer, switch kind, sort</Link></li>
              <li><Link href="/guidelines/" className="hover:underline">Guidelines and what they say</Link></li>
              <li><Link href="/trials/" className="hover:underline">Trials, with what each one found</Link></li>
              <li><Link href="/api/" className="hover:underline">The whole corpus as an API</Link></li>
            </ul>
          </section>
          <section className="card p-5">
            <h3 className="text-lg font-semibold tracking-tight">Builder or investor</h3>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link href="/bottlenecks/" className="hover:underline">What the field is stuck on</Link></li>
              <li><Link href="/ideas/" className="hover:underline">What should be tried and is not</Link></li>
              <li><Link href="/companies/" className="hover:underline">Who is working on it</Link></li>
            </ul>
          </section>
        </div>
      </Container>

      {/* 5. The inventory, last. */}
      <Container className="pt-14 pb-16">
        <Heading
          title="What is in here"
          sub={`${total.toLocaleString("en-GB")} records, every fact dated and linked to a primary source. This is the scale of the thing, not the way in.`}
          href="/?view=graph"
          label="As a graph"
        />
        <ul className="flex flex-wrap gap-1.5">
          {counts.map(({ k, n }) => (
            <li key={k}>
              <Link href={`/${KIND_META[k].route}/`} className="chip border bg-card border-border hover:bg-foreground/5 text-sm">
                {n.toLocaleString("en-GB")} {n === 1 ? KIND_META[k].label.toLowerCase() : KIND_META[k].plural}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </>
  );
}

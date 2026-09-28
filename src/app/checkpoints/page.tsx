import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { routeFor } from "@/lib/kinds";
import { CHECKPOINT_HUB, hubSummary, hubView, type HubView } from "@/lib/checkpoints";
import type { CheckpointRoot } from "@/data/checkpoint-map";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CheckpointGlyph, TONE_COLOUR } from "@/components/CheckpointGlyph";
import { CheckpointSwitch } from "@/components/CheckpointSwitch";
import { Container, GroupKicker, PageHeader } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Checkpoints: one word, two biologies",
  description: "The word checkpoint means two unrelated things in cancer: brakes on immune cells that tumours press and checkpoint inhibitors release, and gates inside every dividing cell that stop it copying or splitting damaged DNA. One hub for each, with every member, partner, expression site and drug.",
  path: "/checkpoints/",
});

const num = (n: number) => n.toLocaleString("en-GB");

/** How the word is used, and which family each phrase belongs to. */
const PHRASES: Array<{ phrase: string; root: CheckpointRoot; why: string }> = [
  { phrase: "checkpoint inhibitor, immunotherapy, PD-1, PD-L1, CTLA-4", root: "immune", why: "an antibody that releases a brake on T cells" },
  { phrase: "immune-related adverse events, irAEs", root: "immune", why: "what happens when the brakes come off everywhere" },
  { phrase: "checkpoint kinase, CHK1, CHK2, WEE1, ATR", root: "cell-cycle", why: "the enzymes that hold a dividing cell at a gate" },
  { phrase: "G1/S, G2/M, spindle assembly checkpoint, mitotic catastrophe", root: "cell-cycle", why: "the gates themselves and what happens when one is forced" },
  { phrase: "CDK4/6 inhibitor, PARP inhibitor, synthetic lethality", root: "cell-cycle", why: "drugs that hold a gate shut, or exploit a repair route the tumour has lost" },
  { phrase: "cancer-immunity cycle, T-cell exhaustion, don't eat me", root: "immune", why: "the biology around the immune brakes" },
];

function Panel({ root, view }: { root: CheckpointRoot; view: HubView }) {
  const hub = CHECKPOINT_HUB[root];
  const s = hubSummary(root);
  const plain = root === "immune"
    ? "Immune cells carry brakes so they do not attack the body. A tumour borrows those brakes: it shows PD-L1 to PD-1 on a T cell, CD47 to a macrophage, HLA-E to an NK cell, and the attack stops. Checkpoint inhibitors are antibodies that block one pair; agonists press the accelerators instead; newer drugs go after the enzymes and secreted signals that quieten the whole neighbourhood."
    : "Every cell that divides passes gates: one before it copies its DNA, one before it splits, one inside the split itself, and a damage-response crew behind all three. Cancers break gates to keep dividing, then depend on the ones left. CDK4/6 inhibitors hold the first gate shut; WEE1, ATR, PARP, Aurora and MPS1 inhibitors force a gate open so the cell divides into death.";
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,22rem)]">
      <div className="min-w-0">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent"><CheckpointGlyph id={root} className="h-6 w-6" /></span>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight leading-snug">{hub.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed max-w-3xl">{plain}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href={hub.route} className="btn-primary chip border inline-flex items-center gap-1.5 px-3 py-1.5"><CheckpointGlyph id={root} className="h-3.5 w-3.5" />Open the {root === "immune" ? "synapse" : "cell-cycle ring"} and the table →</Link>
          <span className="chip border border-border bg-card">{num(s.members)} members</span>
          <span className="chip border border-border bg-card">{num(s.classes)} {root === "immune" ? "classes" : "gates"}</span>
          <span className="chip border-accent/40 bg-accent-soft text-accent border">{num(s.approved)} with an approved drug</span>
          <a href={`${hub.route}data.json`} className="chip border border-border bg-card hover:bg-foreground/5" type="application/json">JSON</a>
        </div>
        <ul className="mt-6 space-y-4">
          {view.classes.map(({ cls, rows }) => (
            <li key={cls.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ color: TONE_COLOUR[cls.tone].stroke, background: TONE_COLOUR[cls.tone].fill }}><CheckpointGlyph id={cls.tone} className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <Link href={`${hub.route}#${cls.id}`} className="font-semibold hover:text-accent">{cls.name}</Link>
                  <p className="text-sm text-muted mt-0.5 leading-snug">{cls.plain}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {rows.map((r) => {
                      const approved = r.best?.status === "approved" || r.best?.status === "standard-of-care";
                      return <Link key={r.member.id} href={r.route} translate="no" className={`chip border notranslate ${approved ? "border-accent/40 bg-accent-soft text-accent" : "bg-card border-border hover:bg-foreground/5"}`} title={approved ? `${r.member.label}: approved drug (${r.best?.drug.name})` : `${r.member.label}: ${r.best ? r.best.status.replace("-", " ") : "no product with a status"}`}>{r.member.label}</Link>;
                    })}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="space-y-4">
        <div className="card p-4 text-sm">
          <div className="kicker mb-2">Glossary</div>
          <ul className="space-y-1.5">
            <li><Link className="underline" href="/terms/checkpoint/">Checkpoint (two meanings)</Link>, the disambiguation entry</li>
            {root === "immune" ? <>
              <li><Link className="underline" href="/terms/immune-checkpoint/">Immune checkpoint</Link></li>
              <li><Link className="underline" href="/technologies/checkpoint-inhibitor/">Immune checkpoint inhibitors</Link>, the technology</li>
              <li><Link className="underline" href="/mechanics/checkpoints/">Mechanics: checkpoints PD-1, CTLA-4, LAG-3</Link></li>
              <li><Link className="underline" href="/pathways/pd1-checkpoint/">PD-1 / PD-L1 pathway drawing</Link></li>
              <li><Link className="underline" href="/irae/">Checkpoint side effects by organ</Link>, when the brakes come off</li>
            </> : <>
              <li><Link className="underline" href="/terms/cell-cycle/">Cell cycle</Link></li>
              <li><Link className="underline" href="/terms/synthetic-lethality/">Synthetic lethality</Link></li>
              <li><Link className="underline" href="/mechanics/dna-damage-checkpoints/">Mechanics: DNA damage checkpoints</Link></li>
              <li><Link className="underline" href="/pathways/mitotic-spindle-checkpoint/">Mitosis and the spindle assembly checkpoint</Link></li>
              <li><Link className="underline" href="/pathways/p53-cell-cycle/">p53 / RB / cell-cycle checkpoint drawing</Link></li>
            </>}
          </ul>
        </div>
        <div className="card p-4 text-sm">
          <div className="kicker mb-2">Approved against a member</div>
          <ul className="flex flex-wrap gap-1">
            {[...new Map(view.rows.flatMap((r) => r.drugs.filter((d) => d.drug.status === "approved").map((d) => [d.drug.id, d.drug] as const))).values()].sort((a, b) => a.name.localeCompare(b.name)).slice(0, 24).map((d) => <li key={d.id}><Link href={routeFor(d)} translate="no" className="chip border border-accent/40 bg-accent-soft text-accent notranslate">{d.name}</Link></li>)}
          </ul>
        </div>
      </aside>
    </div>
  );
}

export default function CheckpointsHub() {
  const immune = hubView("immune");
  const cell = hubView("cell-cycle");
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Checkpoint families", href: "/checkpoints/" }]} />
      <PageHeader
        kicker={<GroupKicker id="map" />}
        title="Checkpoints: one word, two biologies"
        lede="Immune checkpoints are brakes on immune cells that tumours press and checkpoint inhibitors release. Cell-cycle checkpoints are gates inside every dividing cell that stop it copying or splitting damaged DNA. They share a word and nothing else, so OnCo keeps a hub for each: every member, its partner, where it is expressed, the drugs against it by class and the approvals by cancer."
        logo={<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent"><CheckpointGlyph id="families" className="h-8 w-8" /></span>}
      />
      <Container className="pb-20">
        <CheckpointSwitch immune={<Panel root="immune" view={immune} />} cellCycle={<Panel root="cell-cycle" view={cell} />} />
        <section id="which" className="mt-12 scroll-mt-28">
          <h2 className="text-lg font-semibold tracking-tight">Which one is meant?</h2>
          <p className="text-sm text-muted mt-1 max-w-3xl">The words around it tell you. Each phrase below opens the family it belongs to.</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {PHRASES.map((p) => (
              <li key={p.phrase}>
                <Link href={CHECKPOINT_HUB[p.root].route} className="card p-3 flex items-start gap-3 hover:border-accent/40">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent"><CheckpointGlyph id={p.root} className="h-4 w-4" /></span>
                  <span className="min-w-0"><span className="block font-medium leading-snug">{p.phrase}</span><span className="block text-sm text-muted">{CHECKPOINT_HUB[p.root].short}: {p.why}</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <p className="mt-10 text-xs text-muted">Machine-readable: <a className="underline" href="/checkpoints/checkpoints.json">checkpoints.json</a> lists both families with their classes and members; each hub has its own <code>data.json</code> with every row.</p>
      </Container>
    </>
  );
}

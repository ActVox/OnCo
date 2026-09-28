import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { resistance, type Mechanism, type ResistanceClass } from "@/data/resistance";
import { CATEGORIES, categoryOf, type MechanismCategory } from "@/lib/resistance-categories";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { RefChips } from "@/components/RefChips";
import { AtlasProvider, CategoryDot, CategoryScope, ResistanceMatrix, type MatrixRow } from "@/components/ResistanceMatrix";
import { ResistanceMap, type MapRoute } from "@/components/ResistanceMap";

export const metadata: Metadata = pageMeta({ title: "How tumours escape each drug class", description: "For each drug class, how tumours escape and which drugs and strategies close the route.", path: "/resistance/" });

const shortLabel = (r: ResistanceClass) => r.drugClass.split(" (")[0];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** One escape route with its countermeasures. Red-edged = the route, green-edged = what closes it. */
function MechanismCard({ m, id }: { m: Mechanism; id: string }) {
  const cat = categoryOf(m);
  return (
    <CategoryScope category={m.category} id={id} className="card p-4 scroll-mt-32 flex flex-col gap-3">
      <div className="border-l-2 border-accent/70 pl-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: cat.color }}><CategoryDot category={m.category} size={7} /> {cat.label}</div>
        <div className="font-medium leading-snug mt-0.5">{m.name}</div>
        {m.frequency && <div className="text-xs text-muted mt-0.5 tabular-nums">Frequency: {m.frequency}</div>}
        <p className="text-sm text-muted mt-1.5 leading-relaxed">{m.how}</p>
        <RefChips ids={m.refs} className="mt-2" />
      </div>
      <div className="border-l-2 border-emerald-500/70 pl-3 bg-emerald-500/[0.04] rounded-r-md py-2 -my-1">
        <div className="kicker text-emerald-700 dark:text-emerald-400">Countermeasures · {m.countermeasures.length}</div>
        <ul className="mt-1 space-y-2">
          {m.countermeasures.map((c, k) => (
            <li key={k} className="text-sm">
              <div className="leading-snug">{c.text}</div>
              <RefChips ids={c.refs} className="mt-1" />
            </li>
          ))}
        </ul>
      </div>
    </CategoryScope>
  );
}

export default function ResistancePage() {
  const rows: MatrixRow[] = resistance.map((r) => {
    const cells = Object.fromEntries(CATEGORIES.map((c) => [c.id, [] as string[]])) as Record<MechanismCategory, string[]>;
    for (const m of r.mechanisms) cells[m.category].push(m.name);
    return { id: r.id, label: shortLabel(r), cells };
  });
  const totalRoutes = resistance.reduce((s, r) => s + r.mechanisms.length, 0);

  return (
    <AtlasProvider>
      <PageHeader kicker={<GroupKicker id="intel" />} title="How tumours escape each drug class"
        lede={`Every cancer drug eventually meets resistance. For ${resistance.length} major classes, the ${totalRoutes} known escape routes, sorted into eight kinds, how often they occur where that is known, and the countermeasures, linked to the products, targets, and ideas in the map.`} />
      <Container className="pb-16">
        <ResistanceMatrix rows={rows} />

        <nav aria-label="Drug classes" className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-8 mb-6 bg-background/95 backdrop-blur border-y border-border flex flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible items-center gap-1.5 text-sm">
          <span className="kicker mr-1 hidden sm:inline">Jump to</span>
          {resistance.map((r) => <a key={r.id} href={`#${r.id}`} className="chip border bg-card border-border hover:bg-foreground/5 whitespace-nowrap">{shortLabel(r)}</a>)}
        </nav>

        <div className="space-y-10">
          {resistance.map((r) => {
            const routes: MapRoute[] = r.mechanisms.map((m) => ({ name: m.name, category: m.category, how: m.how, frequency: m.frequency, countermeasures: m.countermeasures.length }));
            const ids = r.mechanisms.map((m) => `${r.id}-${slug(m.name)}`);
            const groups = CATEGORIES.map((c) => ({ cat: c, items: r.mechanisms.map((m, i) => [m, i] as const).filter(([m]) => m.category === c.id) })).filter((g) => g.items.length);
            return (
              <section key={r.id} id={r.id} className="scroll-mt-28">
                <header className="mb-4">
                  <div className="kicker">Drug class · {r.mechanisms.length} escape route{r.mechanisms.length === 1 ? "" : "s"}</div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mt-0.5">{r.drugClass}</h2>
                  <p className="text-[15px] text-muted mt-1.5 max-w-3xl leading-relaxed">{r.tldr}</p>
                  <RefChips ids={r.exemplars} className="mt-2.5" />
                </header>

                <ResistanceMap drugLabel={shortLabel(r)} exemplarCount={r.exemplars.length} routes={routes}
                  details={r.mechanisms.map((m, i) => <MechanismCard key={ids[i]} m={m} id={`${ids[i]}-inline`} />)} />

                <div className="mt-6 space-y-6">
                  {groups.map(({ cat, items }) => (
                    <CategoryScope key={cat.id} category={cat.id}>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2.5">
                        <h3 className="flex items-center gap-2 font-semibold"><CategoryDot category={cat.id} size={10} /> {cat.label} <span className="text-muted font-normal text-sm">× {items.length}</span></h3>
                        <span className="text-xs text-muted">{cat.oneLiner}</span>
                      </div>
                      {/* min-w-0 on the cards: a long reference chip must not widen the track (and the page) at 390 px; the chip clips instead. */}
                      <div className="grid gap-3 md:grid-cols-2 [&>*]:min-w-0">
                        {items.map(([m, i]) => <MechanismCard key={ids[i]} m={m} id={ids[i]} />)}
                      </div>
                    </CategoryScope>
                  ))}
                </div>

                <div className="text-xs text-muted mt-4">Sources: {r.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a className="underline" href={s.url} rel="noopener">{s.label}</a></span>)}</div>
              </section>
            );
          })}
        </div>
      </Container>
    </AtlasProvider>
  );
}

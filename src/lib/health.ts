/**
 * Corpus health: coverage metrics computed from the graph at build time.
 *
 * Each metric asks one question of every record it applies to ("does this drug have a molecule or an
 * explained placeholder?") and reports how many pass, how many were checked, the worst offenders, and
 * the one action that would fix a failing record. The Roadmap page renders these as gauges and uses
 * them to downgrade any idea whose "shipped" claim the corpus contradicts.
 *
 * To add a metric, append a definition to METRIC_DEFS. Give it a stable id (used in URL anchors and in
 * HubIdea.metric), a plain sentence, an action, and a `check` that returns the records checked and the
 * failing ones in worst-first order. Nothing else needs to change.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { graph, type Graph } from "./graph";
import { completeness } from "./completeness";
import { KINDS, KIND_META, routeFor, type Kind } from "./kinds";
import { type Entity } from "./schema";
import { hasMolecule } from "./structures";
import { papersExpected, roleBucket } from "./person-roles";
import { SCHEMATIC_ALIAS, SPECIFIC_IDS, hasAnimation } from "@/data/schematics";
import { hasAnchorApproval, isDiagnostic, regionalApprovals, regionSpecific } from "@/data/regional-approvals";
import { reviews } from "@/data/reviews";
import { simple } from "@/data/simple";
import { TRIAL_REGISTRY_RESULTS_ABSENT } from "@/data/trial-registry-outcomes";
import { tldr_es } from "@/data/i18n/es";
import { tldr_fr } from "@/data/i18n/fr";
import { tldr_de } from "@/data/i18n/de";
import { tldr_ja } from "@/data/i18n/ja";
import { tldr_ar } from "@/data/i18n/ar";
import { tldr_zh } from "@/data/i18n/zh";
import { tldr_pt } from "@/data/i18n/pt";
import { tldr_hi } from "@/data/i18n/hi";

export type Offender = { id: string; name: string; route: string; detail?: string };

export type HealthMetric = {
  id: string;
  label: string;
  /** One plain sentence saying what the metric measures and why it matters. */
  plain: string;
  /** Records passing the check. */
  value: number;
  /** Records checked. */
  total: number;
  /** value / total as a percentage, one decimal. 100 when nothing was checked. */
  pct: number;
  /** Percentage at or above which the metric counts as met (and a "shipped" claim stands). */
  target: number;
  met: boolean;
  kind?: Kind;
  /** Up to 25 failing records, worst first, each linking to its page. */
  worst: Offender[];
  /** What a contributor should do to fix a failing record. */
  action: string;
  /** GitHub issue link prefilled with the metric name, current value, and the worst offenders. */
  issueUrl: string;
  /** Where the check lives, for people who want to change the rule. */
  code: string;
};

/** `note`, when set, is appended to the metric label in parentheses: the two-number breakdown a single ratio hides. */
type CheckResult = { total: number; failing: Offender[]; note?: string };
export type MetricDef = {
  id: string;
  label: string;
  plain: string;
  action: string;
  kind?: Kind;
  /** Default 95. Lower for fields that can never be complete (translations, reviews). */
  target?: number;
  check: (g: Graph, ctx: Ctx) => CheckResult;
};

const REPO = "https://github.com/judegomila/OnCo";
const WORST_MAX = 25;
const STALE_DAYS = 60;
const MIN_PER_KIND = 25;
const MIN_IDEAS_PER_BOTTLENECK = 10;
/**
 * Kinds that are a closed taxonomy OnCo defines itself rather than an open collection to be filled: the treatment fronts
 * (data/universe.ts claims no external denominator for them). They are complete by construction, so the kind-size rule
 * does not apply; the gauge names them in its note instead of counting them as short.
 */
const CLOSED_KINDS = new Set<Kind>(["section"]);

/** Build-time inputs that are not part of the graph: generated snapshots under public/. */
type Ctx = { today: Date; provenance: Set<string>; papers: Set<string>; trials: Set<string>; logos: Set<string>; citations: Set<string> };

function keysOf(file: string, pick?: (j: unknown) => Record<string, unknown>): Set<string> {
  const p = join(process.cwd(), "public", file);
  if (!existsSync(p)) return new Set();
  try {
    const j = JSON.parse(readFileSync(p, "utf8")) as unknown;
    return new Set(Object.keys(pick ? pick(j) : (j as Record<string, unknown>)));
  } catch {
    return new Set();
  }
}

function off(e: Entity, detail?: string): Offender {
  return { id: e.id, name: e.name, route: routeFor(e), detail };
}

/** Records in `list` that fail `fails`; failing sorted by `badness` descending when given. */
function fails<E extends Entity>(list: E[], test: (e: E) => string | null | false, badness?: (e: E) => number): CheckResult {
  const failing: Array<{ e: E; d: string | null | false }> = [];
  for (const e of list) { const d = test(e); if (d !== null && d !== false) failing.push({ e, d }); }
  if (badness) failing.sort((a, b) => badness(b.e) - badness(a.e));
  return { total: list.length, failing: failing.map(({ e, d }) => off(e, d || undefined)) };
}

/** Which kinds matter most when the same gap appears everywhere: a cancer without a source outranks an idea without one. */
const KIND_PRIORITY: Kind[] = ["cancer", "drug", "target", "biomarker", "trial", "technology", "pathway", "company", "institution", "person", "paper", "journal", "collection", "bottleneck", "roadmap", "pairing", "term", "idea", "section"];
const prio = (e: Entity) => KIND_PRIORITY.length - KIND_PRIORITY.indexOf(e.kind);

const daysSince = (iso: string, now: Date) => Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000);
const endsWithStop = (s: string) => /[.!?]["')\]]?\s*$/.test(s);

/**
 * Modalities that legitimately have no small-molecule drawing (mirrors placeholderKind in
 * components/MoleculeSlot.tsx, which cannot be imported here because that module is client-only).
 */
/** Mirrors the modality groups in components/MoleculeSlot.tsx (placeholderKind); keep the two in step. */
const EXPLAINED_PLACEHOLDER = /antibody-drug|adc|conjugate|bispecific|engager|antibody|mab\b|checkpoint|car-t|car t|tcr|til\b|cell therapy|cell-therapy|nk cell|lymphocyte|vaccine|mrna|oncolytic|virus|gene therapy|bacteri|oligonucleotide|nucleic acid|radioligand|radiopharm|isotope|lutetium|actinium|radium|iodine|alpha therapy|emitter|test|assay|diagnostic|sequencing|panel|classifier|device|software|imaging|cytokine|fusion|enzyme|protein|peptide|hormone analogue|recombinant|erythropoietin|interferon|growth factor|colony-stimulating|interleukin|il-\d|superagonist|toxin|nanoparticle|not yet disclosed|undisclosed/i;

const APPROVED = new Set(["approved", "standard-of-care"]);

/** Does this cancer pass the deep-dive test on its own record (three settings, three history events, a pipeline)? */
const hasDeepDive = (c: { standardOfCare: unknown[]; history: unknown[]; pipeline: unknown[] }) =>
  c.standardOfCare.length >= 3 && c.history.length >= 3 && c.pipeline.length > 0;

/**
 * True for a subtype page whose treatment is the parent's: wave 4 added 99 such pages deliberately thin ("as for
 * gallbladder adenocarcinoma", "treated as cervical cancer by stage"), each with one standard-of-care row pointing at
 * a parent that carries the full deep dive. Their reader gets the depth one click up, so counting them as shallow
 * measures the shape of the taxonomy, not what OnCo knows. A subtype whose parent is itself thin stays in scope: then
 * nobody carries the depth. Deliberately shallow only where a deeper page exists to defer to.
 */
function deferredToParent(g: Graph, c: { parent?: string }): boolean {
  const p = c.parent ? g.get(c.parent) : undefined;
  return !!p && p.kind === "cancer" && hasDeepDive(p);
}

/** A target a medicine in the corpus is aimed at: the population whose prevalence a reader needs to pick a treatment. */
const hasCorpusDrug = (g: Graph, id: string) => (g.incoming(id).get("drug") ?? []).length > 0;

/** "1,441 targets, 191 papers, 45 bottlenecks": where a gap sits, for the two-number breakdown a single ratio hides. */
function byKind(g: Graph, offenders: Offender[], top = 6): string {
  const counts = new Map<Kind, number>();
  for (const o of offenders) { const k = g.get(o.id)?.kind; if (k) counts.set(k, (counts.get(k) ?? 0) + 1); }
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, top).map(([k, v]) => `${v.toLocaleString("en-GB")} ${KIND_META[k].plural.toLowerCase()}`).join(", ");
}

export const METRIC_DEFS: MetricDef[] = [
  {
    id: "sources", label: "Records with a primary source",
    plain: "Every record should cite at least one external source (a label, paper, registry, or regulator page) so a reader can check it.",
    action: "Add a `links` entry with a primary source URL and a label. For trials an `nct` id counts.",
    check: (g) => fails(g.entities, (e) => (e.links.length === 0 && !(e.kind === "trial" && e.nct) ? (e.wikipedia ? "Wikipedia only" : "no source") : null), (e) => (e.wikipedia ? 0 : 100) + prio(e)),
  },
  {
    id: "backlinks", label: "Records with three or more relations",
    plain: "A hub is made of links: a record with fewer than three relations, counting both directions, is a dead end for readers and invisible to the graph tools. The 19 treatment fronts are navigation and are not counted.",
    action: "Add ids to the typed relation arrays (`cancers`, `targets`, `drugs`, `trials`, `terms`...) on this record or on the records that should point to it.",
    check: (g) => fails(g.entities.filter((e) => e.kind !== "section"), (e) => { const d = g.degree(e.id); return d < 3 ? `${d} relation${d === 1 ? "" : "s"}` : null; }, (e) => (3 - g.degree(e.id)) * 100 + prio(e)),
  },
  {
    id: "orphans", label: "Records something links to",
    plain: "A record nothing links to can only be found by search; it should be referenced by at least one other page. The 19 treatment fronts are the top of the navigation and are not counted.",
    action: "Find the cancer, product, trial, or idea this record belongs with and add this id to its relation arrays.",
    check: (g) => fails(g.entities.filter((e) => e.kind !== "section"), (e) => (g.incoming(e.id).size === 0 ? "no incoming links" : null), prio),
  },
  {
    id: "tldr", label: "TL;DRs that are full sentences",
    plain: "The plain-language TL;DR is the first thing a patient reads; it should be at least one complete sentence of 60 characters or more.",
    action: "Rewrite `tldr` as one or two plain sentences ending in a full stop; no jargon, no fragments.",
    check: (g) => fails(g.entities, (e) => (e.tldr.trim().length < 60 ? `${e.tldr.trim().length} characters` : !endsWithStop(e.tldr) ? "no full stop" : null), (e) => 1000 - e.tldr.length),
  },
  {
    id: "summary", label: "Summaries of 300 characters or more",
    plain: "The technical summary should say what the thing is, how it works, and what the evidence shows; under 300 characters it cannot.",
    action: "Expand `summary` with mechanism, evidence, and open questions, in paragraphs separated by blank lines.",
    check: (g) => fails(g.entities, (e) => (e.summary.trim().length < 300 ? `${e.summary.trim().length} characters` : null), (e) => (300 - e.summary.length) * 100 + prio(e)),
  },
  {
    id: "cancer-depth", label: "Cancers that reach a deep dive, their own or the parent's", kind: "cancer",
    plain: "A reader who lands on a cancer page should reach TNBC depth in at most one click: at least three standard-of-care settings, three history events and a pipeline, on this page or on the parent it says it is treated as. Wave 4 added 99 subtype pages deliberately thin (\"as for gallbladder adenocarcinoma\", \"treated as cervical cancer by stage\"); copying the parent's table onto each would add pages, not knowledge, so a page that defers to a parent with the depth counts as reaching it.",
    action: "Add `standardOfCare` rows by setting with refs, `history` events with refs, and `pipeline` ids; see cancers.ts for the TNBC model. A thin subtype with no deep parent needs one of the two filled in.",
    check: (g) => {
      const cancers = g.kind("cancer");
      const r = fails(cancers, (c) => {
        if (hasDeepDive(c)) return null;
        if (deferredToParent(g, c)) return null;
        const why = [c.standardOfCare.length < 3 ? `${c.standardOfCare.length} standard-of-care rows` : null, c.history.length < 3 ? `${c.history.length} history events` : null, c.pipeline.length === 0 ? "empty pipeline" : null].filter(Boolean);
        return `${why.join(", ")}${c.parent ? ", and the parent has no deep dive either" : ""}`;
      }, (c) => -(c.standardOfCare.length + c.history.length + c.pipeline.length));
      const own = cancers.filter((c) => hasDeepDive(c)).length;
      const viaParent = cancers.filter((c) => !hasDeepDive(c) && deferredToParent(g, c)).length;
      return { ...r, note: `${own.toLocaleString("en-GB")} carry their own deep dive, ${viaParent.toLocaleString("en-GB")} subtype pages defer to a parent that has one, ${r.failing.length.toLocaleString("en-GB")} reach neither` };
    },
  },
  {
    id: "regional-approvals", label: "Approved products with regional rows", kind: "drug",
    plain: "An approved product should say where it is approved (US, EU, UK, Japan, China, Australia), not just that it is; at minimum the FDA or EMA verdict, unless the product is approved only elsewhere.",
    action: "Add a row for this product in regional-approvals.ts with a regulator source per region (US or EU at least).",
    check: (g) => fails(g.kind("drug").filter((d) => APPROVED.has(d.status ?? "") && !isDiagnostic(d.modality)), (d) => { const row = regionalApprovals[d.id]; return !row ? (hasAnchorApproval(d) ? null : "no regional row") : row.US || row.EU || regionSpecific(row) ? null : "no US or EU row"; }),
  },
  {
    id: "molecules", label: "Products with a molecule or an explained placeholder", kind: "drug",
    plain: "Small molecules should rotate on their page; biologics, cells, and tests should show a placeholder that says why there is no molecule.",
    action: "Add the product to structures.ts (PubChem CID or PDB id) and run `npm run fetch:structures`, or set a `modality` the placeholder recognises.",
    check: (g) => fails(g.kind("drug"), (d) => (hasMolecule(d.id) || EXPLAINED_PLACEHOLDER.test(d.modality) ? null : `modality "${d.modality}" has no structure or placeholder`)),
  },
  {
    id: "schematics", label: "Technologies with a specific schematic", kind: "technology",
    plain: "Each technology page should show a wireframe schematic of its mechanism, its own or an aliased drawing of the same process, not the generic one borrowed from its front.",
    action: "Add a builder for this id in data/schematics.ts (static) or data/animated.ts (animated).",
    target: 80,
    check: (g) => { const specific = new Set(SPECIFIC_IDS); return fails(g.kind("technology"), (t) => (hasAnimation(t.id) || specific.has(t.id) || (t.id in SCHEMATIC_ALIAS && (specific.has(SCHEMATIC_ALIAS[t.id]) || hasAnimation(SCHEMATIC_ALIAS[t.id]))) ? null : "generic schematic")); },
  },
  {
    id: "target-prevalence", label: "Targets with sourced prevalence, or with no medicine aimed at them", kind: "target",
    plain: "Where a medicine in the corpus aims at a target, the page should say how common that target is in each cancer, with a source: that is the number a reader needs to judge whether the medicine could be for them. The catalogue genes imported from CIViC, Open Targets and IntOGen have no medicine attached; they are a map of cancer genetics, a cancer-by-cancer prevalence row for each is not knowledge anyone holds, and their absence counts as explained rather than as a gap.",
    action: "Add `prevalence` rows ({ cancerId, pct, measure, source }) to the target record; take the rate from the pivotal trial's biomarker-prevalence table or a cohort paper, never from a review's round number. Adding a drug record aimed at a catalogue gene brings that gene into scope.",
    check: (g) => {
      const targets = g.kind("target");
      const r = fails(targets, (t) => (t.prevalence.length || !hasCorpusDrug(g, t.id) ? null : "no prevalence rows"));
      const withRows = targets.filter((t) => t.prevalence.length).length;
      const noMedicine = targets.filter((t) => !t.prevalence.length && !hasCorpusDrug(g, t.id)).length;
      return { ...r, note: `${withRows.toLocaleString("en-GB")} with prevalence rows, ${noMedicine.toLocaleString("en-GB")} catalogue genes with no corpus medicine, ${r.failing.length.toLocaleString("en-GB")} targets a medicine is aimed at still without` };
    },
  },
  {
    id: "trial-outcomes", label: "Trials with structured outcomes, or with no results in public", kind: "trial",
    plain: "Where a trial's results exist in public, the page should carry arms, N, endpoints and hazard ratios so pictograms and evidence scores can render. A reported trial whose registry record has no results section and which has published nothing has no number to copy; that silence is the sponsor's, and it counts as explained rather than as a gap.",
    action: "Add an entry in trial-outcomes.ts with the primary endpoint, arms, and the source publication, or run `npx tsx scripts/fetch-registry-outcomes.ts --apply` when the registry has posted results.",
    // Only trials that have reported can carry outcomes; recruiting, active and planned trials are not gaps, and
    // neither are reported trials whose sponsor never posted or published anything (TRIAL_REGISTRY_RESULTS_ABSENT,
    // regenerated from the registry on every fetch run, so a trial leaves the list the day its sponsor posts).
    check: (g) => {
      const reported = g.kind("trial").filter((t) => ["positive", "negative", "mixed", "completed", "approved", "standard-of-care", "withdrawn"].includes(t.status ?? ""));
      const silent = new Set(TRIAL_REGISTRY_RESULTS_ABSENT);
      const nothingPublic = (t: (typeof reported)[number]) => silent.has(t.id) && !t.result && (t.keyPapers ?? []).length === 0;
      const r = fails(reported, (t) => (t.outcomes.length ? null : nothingPublic(t) ? null : t.result ? "result text only" : "no outcomes"), (t) => (t.result ? 0 : 1));
      const structured = reported.filter((t) => t.outcomes.length).length;
      return { ...r, note: `${structured.toLocaleString("en-GB")} with structured outcomes, ${reported.filter((t) => !t.outcomes.length && nothingPublic(t)).length.toLocaleString("en-GB")} that have posted and published nothing, ${r.failing.length.toLocaleString("en-GB")} with a public result not yet structured` };
    },
  },
  {
    id: "institution-people", label: "Institutions with people", kind: "institution",
    plain: "An institution page should name the clinicians and scientists who work there.",
    action: "Add person records under data/people/ with `institutionId` set to this institution.",
    target: 80,
    check: (g) => fails(g.kind("institution"), (i) => ((g.incoming(i.id).get("person") ?? []).length === 0 ? "no people" : null)),
  },
  {
    id: "people-papers", label: "People with papers, or in a role that produces none", kind: "person",
    plain: "A person record should list selected publications so the claim of expertise can be checked; administrators, donors, patients, advocates and public figures are not expected to have any, and count as explained.",
    action: "Add `papers` entries (title, journal, year, url or doi) to the person record, or run scripts/fetch-people-papers.ts; if the role line misleads the rule in src/lib/person-roles.ts, set `papersExpected` on the record.",
    check: (g) => {
      const people = g.kind("person");
      const r = fails(people, (p) => (p.papers.length || !papersExpected(p) ? null : roleBucket(p.role) === "institution head" ? "institution head, no papers matched" : "no papers"), (p) => (roleBucket(p.role) === "institution head" ? 0 : 1));
      const withPapers = people.filter((p) => p.papers.length).length;
      const notExpected = people.filter((p) => !p.papers.length && !papersExpected(p)).length;
      return { ...r, note: `${withPapers.toLocaleString("en-GB")} with papers, ${notExpected.toLocaleString("en-GB")} not expected by role, ${r.failing.length.toLocaleString("en-GB")} researchers still without` };
    },
  },
  {
    id: "bottleneck-ideas", label: "Bottlenecks with ten or more ideas", kind: "bottleneck",
    plain: "Each bottleneck should have at least ten ideas attacking it; fewer means the ideas board has not reached it yet.",
    action: "Add idea records under data/ideas-waves/ with this bottleneck id in `bottlenecks`.",
    check: (g) => fails(g.kind("bottleneck"), (b) => { const n = (g.incoming(b.id).get("idea") ?? []).length; return n < MIN_IDEAS_PER_BOTTLENECK ? `${n} idea${n === 1 ? "" : "s"}` : null; }, (b) => -(g.incoming(b.id).get("idea") ?? []).length),
  },
  {
    id: "term-wikipedia", label: "Terms with a Wikipedia link, or checked and found to have none", kind: "term",
    plain: "Glossary terms promise a Wikipedia link for readers who want the long version; where Wikipedia has no article, the term says so rather than staying silent.",
    action: "Set `wikipedia` on the term record to the matching article URL, or run scripts/fetch-term-wikipedia.ts, which writes `wikipediaChecked` when no article exists.",
    check: (g) => {
      const terms = g.kind("term");
      const r = fails(terms, (t) => (t.wikipedia || t.wikipediaChecked ? null : "not yet looked up on Wikipedia"));
      const linked = terms.filter((t) => t.wikipedia).length;
      const absent = terms.filter((t) => !t.wikipedia && t.wikipediaChecked).length;
      return { ...r, note: `${linked.toLocaleString("en-GB")} linked, ${absent.toLocaleString("en-GB")} have no article` };
    },
  },
  {
    id: "stale", label: `Records checked in the last ${STALE_DAYS} days`,
    plain: `Every record says when its facts were last checked (asOf); older than ${STALE_DAYS} days means nobody has looked recently. Every record is in scope, and a fetcher touching a field is not a check: asOf moves when a person reads the sources again.`,
    action: "Re-verify the record against its sources and update `asOf`; if something changed, log it in CORRECTIONS.md.",
    target: 90,
    check: (g, ctx) => fails(g.entities, (e) => { const d = daysSince(e.asOf, ctx.today); return d > STALE_DAYS ? `${d} days (${e.asOf})` : null; }, (e) => daysSince(e.asOf, ctx.today)),
  },
  {
    id: "kind-size", label: `Open kinds with ${MIN_PER_KIND} or more records`,
    plain: `A kind with fewer than ${MIN_PER_KIND} records is a placeholder, not a collection. Closed taxonomies OnCo defines itself (the treatment fronts) are complete by construction and are not held to the rule.`,
    action: "Run a per-kind expansion wave: enumerate the universe, diff against the corpus, add records with sources.",
    check: (g) => {
      const open = KINDS.filter((k) => !CLOSED_KINDS.has(k));
      const failing = open.filter((k) => g.kind(k).length < MIN_PER_KIND).sort((a, b) => g.kind(a).length - g.kind(b).length)
        .map((k) => ({ id: k, name: KIND_META[k].title ?? KIND_META[k].plural, route: `/${KIND_META[k].route}/`, detail: `${g.kind(k).length} records` }));
      const closed = [...CLOSED_KINDS].map((k) => `${KIND_META[k].plural.toLowerCase()} are a closed list of ${g.kind(k).length}`).join("; ");
      return { total: open.length, failing, note: closed };
    },
  },
  {
    id: "reviewed", label: "Records a named human reviewer has signed off",
    plain: "Pages should carry a named expert or patient-advocate reviewer with a date and a conflict-of-interest statement. The model panel at the top of a page is machine commentary and is not counted here; nothing but a named person with a conflict-of-interest statement is. Every record but the fronts is in scope.",
    action: "Recruit a reviewer for this record and add an entry to data/reviews.ts (track, reviewer, role, date, coi). This is the one gauge no script can move: it needs people who will put their name to a page.",
    target: 10,
    check: (g) => {
      const scope = g.entities.filter((e) => e.kind !== "section");
      const r = fails(scope, (e) => ((reviews[e.id] ?? []).length ? null : "not reviewed"));
      const tracks = scope.flatMap((e) => reviews[e.id] ?? []);
      return { ...r, note: `${tracks.filter((v) => v.track === "expert").length.toLocaleString("en-GB")} expert sign-offs, ${tracks.filter((v) => v.track === "advocate").length.toLocaleString("en-GB")} advocate sign-offs; the target of ${10}% is ${Math.ceil(scope.length / 10).toLocaleString("en-GB")} records` };
    },
  },
  {
    id: "simple", label: "Records with a simple explanation",
    plain: "The 'simple' reading layer (about a 12-year-old reading age) needs its own text on every record, machine-ingested ones included: a registry trial and a catalogue gene get a page like any other, and a reader who needs plain words needs them there most. There is no fetcher for this; every sentence is written.",
    action: "Add a sentence for this id in the next data/simple/part-*.ts file (see src/data/simple.ts for the registered parts). Under 200 characters, one or two sentences, no jargon.",
    target: 80,
    check: (g) => {
      const r = fails(g.entities, (e) => (e.simple || simple[e.id] ? null : "no simple text"));
      return { ...r, note: `${r.failing.length.toLocaleString("en-GB")} still to write, mostly ${byKind(g, r.failing, 3)}` };
    },
  },
  {
    id: "translations", label: "Records with a TL;DR in all eight languages",
    plain: "Multilingual TL;DRs (Spanish, Mandarin, Portuguese, Hindi, French, German, Japanese, Arabic) count only where all eight exist for the record; seven of eight counts as nothing, because a reader in the eighth language still sees English. Every record is in scope, and the target is 50 per cent rather than 95 because a translation layer is never finished.",
    action: "Add the TL;DR translation for this id in data/i18n/{es,zh,pt,hi,fr,de,ja,ar}.ts, marked machine-assisted until reviewed.",
    target: 50,
    check: (g) => fails(g.entities, (e) => { const missing = [["es", tldr_es], ["zh", tldr_zh], ["pt", tldr_pt], ["hi", tldr_hi], ["fr", tldr_fr], ["de", tldr_de], ["ja", tldr_ja], ["ar", tldr_ar]].filter(([, t]) => !(t as Record<string, string>)[e.id]).map(([c]) => c); return missing.length ? `missing ${missing.join(", ")}` : null; }, (e) => [tldr_es, tldr_zh, tldr_pt, tldr_hi].filter((t) => !t[e.id]).length),
  },
  {
    id: "provenance", label: "Records with git provenance",
    plain: "Every page should show its last commit, author and diff; that comes from public/provenance.json, which blames each data file and finds the line carrying the record's id. A record whose id is never written as a literal, because a helper derives it, has nothing to blame and cannot be mapped.",
    action: "Run `npm run provenance` (the weekly fact-check workflow does this) so new records get a provenance line. If a record stays missing after a run, its id is not a literal in any data file: make the helper write it.",
    check: (g, ctx) => fails(g.entities, (e) => (ctx.provenance.has(e.id) ? null : "no provenance entry")),
  },
  {
    id: "papers-snapshot", label: "Drugs, targets, cancers and technologies with a Europe PMC snapshot",
    plain: "These four kinds show what the literature is publishing about them, year by year; that needs one snapshot per record. People, trials, companies and the other kinds are not in scope: their literature is reached through their papers and their institution.",
    action: "Run `npm run fetch:papers` (weekly workflow, Europe PMC, no paid budget) so new records are included in public/papers/. The run takes hours at five requests a second; it queues records with no snapshot first, so a run cut short still closes gaps.",
    check: (g, ctx) => {
      const scope = g.entities.filter((e) => ["drug", "target", "cancer", "technology"].includes(e.kind));
      const r = fails(scope, (e) => (ctx.papers.has(e.id) ? null : "no papers snapshot"));
      return { ...r, note: `${r.failing.length.toLocaleString("en-GB")} awaiting a fetch: ${byKind(g, r.failing)}` };
    },
  },
  {
    id: "citations", label: "Key papers with a citation count", kind: "paper",
    plain: "Each key paper should show how often it has been cited, from the Europe PMC index; a paper with no DOI or PMID cannot be looked up at all.",
    action: "If the paper has no DOI or PMID, add one to its record; then run `npm run fetch:citations` (weekly workflow, budget-free) so the paper appears in public/citations/index.json.",
    check: (g, ctx) => fails(g.kind("paper"), (p) => (ctx.citations.has(p.id) ? null : p.doi || p.pmid ? "not in the citations snapshot yet" : "no DOI or PMID"), (p) => (p.doi || p.pmid ? 0 : 1)),
  },
  {
    id: "trials-snapshot", label: "Products with a ClinicalTrials.gov snapshot", kind: "drug",
    plain: "The pipeline tracker should show live phase 2/3 counts for every product, not just the ones it was first run on. Products only: a snapshot is keyed to one query term, and a cancer or a target has far too many trials for one.",
    action: "Run `npm run fetch:trials` (weekly workflow) for the missing products; check the query term if a product returns nothing.",
    check: (g, ctx) => fails(g.kind("drug"), (d) => (ctx.trials.has(d.id) ? null : "no trials snapshot")),
  },
  {
    id: "logos", label: "Companies, institutions and collections with a logo",
    plain: "These three kinds should show a self-hosted logo so lists are scannable. Everything else is left out on purpose: a cancer, a target or a trial has no logo to hold. A record counts only when the file sits under public/logos/, so a broken third-party hotlink cannot read as covered.",
    action: "Run `npm run fetch:logos`; add a Wikidata QID override in the script if the automatic match fails. A small venture fund or a database with no logo item anywhere is a permanent miss, not a backlog.",
    target: 90,
    check: (g, ctx) => {
      const scope = g.entities.filter((e) => ["company", "institution", "collection"].includes(e.kind));
      const r = fails(scope, (e) => (ctx.logos.has(e.id) ? null : "no logo"));
      return { ...r, note: `${r.failing.length.toLocaleString("en-GB")} without one: ${byKind(g, r.failing)}` };
    },
  },
  {
    id: "completeness", label: "External denominators at least half covered",
    plain: "Each scope on /completeness/ sets OnCo's count against a sourced count of what exists (FDA-approved cancer drugs, NCI centres, OECI members, oncology journals); this counts the scopes where OnCo holds at least half.",
    action: "Open /completeness/, pick the scope, and add the missing items through the prefilled new-object forms (or add an alias to a record the matcher missed).",
    target: 50,
    check: () => {
      const rows = completeness().filter((c) => c.pct !== null && c.den.total !== null);
      const failing = rows.filter((c) => (c.pct ?? 0) < 50).sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0)).map((c) => ({ id: c.den.id, name: c.den.scope, route: `/completeness/#${c.den.id}`, detail: `${c.ours.toLocaleString("en-GB")} of ${c.den.approx ? "about " : ""}${(c.den.total ?? 0).toLocaleString("en-GB")} (${c.pct}%)` }));
      return { total: rows.length, failing };
    },
  },
];

function issueUrl(m: Omit<HealthMetric, "issueUrl">): string {
  const body = [
    `Metric: **${m.label}** (\`${m.id}\`) is at ${m.value}/${m.total} (${m.pct}%; target ${m.target}%).`, "",
    m.plain, "", `What to do: ${m.action}`, "",
    m.worst.length ? `Worst offenders:\n${m.worst.slice(0, 10).map((w) => `- \`${w.id}\`${w.detail ? ` (${w.detail})` : ""}`).join("\n")}` : "",
    "", `Gauge: https://onco.cc/roadmap/#metric-${m.id}`, `Check: ${m.code}`,
  ].join("\n");
  const p = new URLSearchParams({ title: `gap: ${m.label}`, labels: "gap,help wanted", body });
  return `${REPO}/issues/new?${p.toString()}`;
}

let cached: HealthMetric[] | undefined;

/** All metrics, computed once per build. */
export function health(now = new Date()): HealthMetric[] {
  if (cached) return cached;
  const g = graph();
  const ctx: Ctx = {
    today: now,
    provenance: keysOf("provenance.json"),
    papers: keysOf("papers/index.json", (j) => ((j as { entities?: Record<string, unknown> }).entities ?? {})),
    trials: keysOf("trials/index.json"),
    logos: keysOf("logos/index.json"),
    citations: keysOf("citations/index.json", (j) => ((j as { papers?: Record<string, unknown> }).papers ?? {})),
  };
  cached = METRIC_DEFS.map((d) => {
    const { total, failing, note } = d.check(g, ctx);
    const value = total - failing.length;
    const pct = total === 0 ? 100 : Math.round((value / total) * 1000) / 10;
    const target = d.target ?? 95;
    const base = { id: d.id, label: note ? `${d.label} (${note})` : d.label, plain: d.plain, value, total, pct, target, met: pct >= target, kind: d.kind, worst: failing.slice(0, WORST_MAX), action: d.action, code: `${REPO}/blob/main/src/lib/health.ts` };
    return { ...base, issueUrl: issueUrl(base) };
  });
  return cached;
}

export function metric(id: string): HealthMetric | undefined {
  return health().find((m) => m.id === id);
}

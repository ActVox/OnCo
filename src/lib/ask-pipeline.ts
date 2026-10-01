/**
 * Ask OnCo, end to end: analyse the question (ask-intent.ts), decide which records to read, fetch them,
 * fetch a second wave the template needs (a drug's trials, its target, the irAE term), and compose the
 * cited answer (ask-compose.ts). The record loader is injected: the browser fetches
 * /api/v1/entities/<id>.json, tests and scripts read the graph directly (ask-harness.ts).
 *
 * Pure and browser-safe.
 */
import { retrieveIds, type Source } from "./ask";
import { analyseQuestion, kindPriority, prepareIndex, type Analysis } from "./ask-intent";
import { batchFromQuestion, composeTemplated, regionDrugs, regionFromQuestion, trialsOf, type AskAnswer, type AskEntityRecord } from "./ask-compose";
import type { AskIndex, AskIndexEntry } from "./ask-index";
import type { Region } from "@/data/regional-approvals";

/** Question words that say nothing about which journal is meant. */
const JOURNAL_STOP = new Set(["which", "what", "journal", "journals", "publish", "publishes", "published", "publishing", "cover", "covers", "covering", "carry", "research", "papers", "paper", "about", "for", "on", "in", "the", "a", "an", "of", "and", "to", "do", "does", "are", "is", "where", "should", "i", "read", "oncology", "cancer", "best", "top", "good", "clinical", "field", "work", "studies", "trials"]);
/** Stems that reach the journal names a topic word implies ("radiation" also means "Radiotherapy and Oncology"). */
const JOURNAL_SYNONYMS: Record<string, string[]> = {
  radiation: ["radiat", "radiother", "strahlen"], radiotherapy: ["radiat", "radiother", "strahlen"], nursing: ["nurs"], nurses: ["nurs"], nurse: ["nurs"],
  paediatric: ["pediatr", "paediatr", "child"], pediatric: ["pediatr", "paediatr", "child"], children: ["pediatr", "paediatr", "child"], childhood: ["pediatr", "paediatr", "child"],
  haematology: ["hematol", "haematol", "blood", "leuk"], hematology: ["hematol", "haematol", "blood", "leuk"], blood: ["blood", "hematol", "haematol", "leuk"],
  surgery: ["surg"], surgical: ["surg"], imaging: ["imaging", "radiol"], radiology: ["radiol", "imaging"], nuclear: ["nucl"],
  gynaecology: ["gynecol", "gynaecol"], gynecology: ["gynecol", "gynaecol"], gynaecological: ["gynecol", "gynaecol"], gynecologic: ["gynecol", "gynaecol"],
  lung: ["lung", "thorac"], thoracic: ["thorac", "lung"], brain: ["neuro", "brain"], neuro: ["neuro"], skin: ["melanoma", "skin", "pigment"], melanoma: ["melanoma", "pigment"],
  urology: ["urol"], prostate: ["prostat", "urol"], bladder: ["urol"], kidney: ["urol"], gastric: ["gastr"], stomach: ["gastr"], colorectal: ["colorectal", "gastrointest"], bowel: ["colorectal", "gastrointest"], liver: ["hepat", "liver"],
  palliative: ["palliat", "supportive"], supportive: ["supportive", "palliat"], survivorship: ["surviv"], epidemiology: ["epidemiol"], prevention: ["prev"],
  immunotherapy: ["immun"], immunology: ["immun"], global: ["global"], policy: ["policy"], nutrition: ["nutrition"], psychology: ["psycho"], psychosocial: ["psycho"],
  genetics: ["genet"], genomics: ["genom"], pharmacology: ["pharmacol"], pharmacy: ["pharm"], pathology: ["pathol"], geriatric: ["geriatr"], elderly: ["geriatr"], adolescent: ["adolesc"],
  thyroid: ["thyroid", "endocr"], sarcoma: ["sarcoma", "bone"], lymphoma: ["lymphoma", "leuk", "hematol"], leukaemia: ["leuk"], leukemia: ["leuk"], myeloma: ["myeloma", "hematol"], breast: ["breast", "mammary"],
  informatics: ["inform"], digital: ["digit", "inform"], ai: ["inform", "digit"], veterinary: ["vet"], education: ["educ"], head: ["head"], neck: ["neck"], oral: ["oral"],
};

/** Journal entries whose names or aliases carry the question's topic words, best first, with the topic as written. */
export function journalTopic(question: string, index: AskIndex): { topic: string; entries: AskIndexEntry[] } {
  // Whole words, not stems: the synonym table is keyed on words as people write them.
  const toks = [...new Set(question.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").split(/\s+/))].filter((t) => t && !JOURNAL_STOP.has(t) && t.length > 2);
  if (!toks.length) return { topic: "", entries: [] };
  const stemsOf = (t: string) => JOURNAL_SYNONYMS[t] ?? [t.length > 6 ? t.slice(0, 6) : t];
  const scored = index.entries.filter((e) => e.kind === "journal").map((e) => {
    const text = `${e.name} ${e.aliases.join(" ")}`.toLowerCase();
    const name = e.name.toLowerCase();
    let score = 0, inName = 0;
    for (const t of toks) { const stems = stemsOf(t); if (stems.some((s) => text.includes(s))) { score++; if (stems.some((s) => name.includes(s))) inName++; } }
    return { e, score, inName };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score || b.inName - a.inName || a.e.name.length - b.e.name.length);
  return { topic: toks.join(" "), entries: scored.map((x) => x.e) };
}

export type AskDeps = {
  index: AskIndex;
  /** Word-search ids, best first. */
  lexical: (q: string, k: number) => string[];
  /** Concept-search ids, best first. */
  concept: (q: string, k: number) => string[];
  load: (id: string) => Promise<AskEntityRecord | null>;
  region?: Region;
  /** Force this record to be the primary ("Not what you meant?" picks). */
  pin?: string;
  /** Set false to ignore curated question pairs (used to measure the pipeline without them). Default true. */
  usePairs?: boolean;
  onStep?: (step: string) => void;
};

export type AskResult = AskAnswer & { analysis: Analysis; consulted: Source[] };

/** How many records are read for one question (named records first, then retrieval). */
export const ASK_FETCH = 8;

const unique = (ids: Array<string | undefined>): string[] => { const s = new Set<string>(); const out: string[] = []; for (const id of ids) if (id && !s.has(id)) { s.add(id); out.push(id); } return out; };

export async function answerQuestion(question: string, deps: AskDeps): Promise<AskResult> {
  const { index } = deps;
  const byId = prepareIndex(index).byId;
  const lookup = (id: string): AskIndexEntry | undefined => byId.get(id);
  deps.onStep?.("Reading the question");
  const a = analyseQuestion(question, index);
  if (deps.usePairs === false) a.pair = undefined;

  deps.onStep?.("Finding records");
  const lexical = deps.lexical(question, 12), concept = deps.concept(question, 12);
  const retrieved = retrieveIds(lexical.map((id) => ({ id })), concept.map((id) => ({ id })), ASK_FETCH);

  // Candidates for the primary record: what the question named, then the curated pair's records.
  type Cand = { entry: AskIndexEntry; strong: boolean; order: number; fromPair?: boolean };
  const cands: Cand[] = a.entities.map((r, i) => ({ entry: r.entry, strong: r.strong, order: i }));
  for (const id of a.pair?.pair.ids ?? []) {
    if (cands.some((c) => c.entry.id === id)) continue;
    const en = byId.get(id);
    if (en) cands.push({ entry: en, strong: true, order: cands.length, fromPair: true });
  }
  // Records the question itself named outrank records that only the curated pair supplies.
  const rank = (c: Cand) => (c.strong ? 1 : 0) + kindPriority(a.intent, c.entry.kind) - 0.02 * c.order - (c.fromPair ? 0.2 : 0);
  const sorted = [...cands].sort((x, y) => rank(y) - rank(x));
  let primaryEntry: AskIndexEntry | undefined = sorted[0]?.entry;
  let primaryStrong = !!sorted[0]?.strong;
  // A weak match alone ("chemo", "early-stage") only anchors a definition, a roadmap or a journal listing.
  if (primaryEntry && !primaryStrong && !["define", "general", "roadmap", "journals"].includes(a.intent)) primaryEntry = undefined;
  // "Which YC W24 companies": the batch names Y Combinator even when the question does not.
  const batch = batchFromQuestion(question);
  if (batch && (!primaryEntry || primaryEntry.kind !== "company")) { const yc = byId.get("y-combinator"); if (yc) { primaryEntry = yc; primaryStrong = true; } }
  // "Which journals cover X": a listing, so the journals are matched on the topic words (a journal named after the
  // topic, "Radiation oncology", heads the list rather than answering alone).
  let topic: { words: string; entries: AskIndexEntry[] } | undefined;
  let topicJournals: AskIndexEntry[] = [];
  const listing = /\b(?:which|what) journals?\b|\bjournals? (?:publish|cover|carry|for|on|in|about)\b/i.test(question);
  if (a.intent === "journals" && (listing || !primaryEntry || primaryEntry.kind !== "journal")) {
    const t = journalTopic(question, index);
    const anchored = primaryEntry && primaryStrong && !["term", "technology", "cancer", "section", "journal"].includes(primaryEntry.kind);
    if (t.entries.length && !anchored) {
      topicJournals = unique([primaryEntry?.kind === "journal" ? primaryEntry.id : undefined, ...t.entries.map((e) => e.id)]).map((id) => byId.get(id)!).slice(0, 12);
      topic = { words: t.topic, entries: topicJournals };
      if (primaryEntry?.kind !== "journal") { primaryEntry = topicJournals[0]; primaryStrong = false; }
    }
  }
  // Nothing named: trust the top hit only when word search and concept search agree on it.
  if (!primaryEntry) {
    const agree = lexical.slice(0, 5).find((id) => concept.slice(0, 5).includes(id));
    const en = agree ? byId.get(agree) : undefined;
    if (en && kindPriority(a.intent, en.kind) >= 0.3) { primaryEntry = en; primaryStrong = false; }
  }
  const pinned = deps.pin ? byId.get(deps.pin) : undefined;
  if (pinned) { primaryEntry = pinned; primaryStrong = true; }
  const secondaryEntries = sorted.filter((c) => c.strong && c.entry.id !== primaryEntry?.id).map((c) => c.entry).slice(0, 3);

  const wanted = unique([primaryEntry?.id, ...secondaryEntries.map((e) => e.id), ...(a.pair?.pair.ids ?? []), ...retrieved]).slice(0, ASK_FETCH + 2);
  deps.onStep?.(`Reading ${wanted.length} records`);
  const loaded = new Map<string, AskEntityRecord>();
  const loadAll = async (ids: string[]) => { const rs = await Promise.all(ids.map((id) => deps.load(id))); rs.forEach((r, i) => { if (r) loaded.set(ids[i], r); }); };
  await loadAll(wanted);

  const primary = primaryEntry ? loaded.get(primaryEntry.id) : undefined;
  const secondary = secondaryEntries.map((e) => loaded.get(e.id)).filter((r): r is AskEntityRecord => !!r);

  // Second wave: what the template for this intent needs beyond the named records.
  const wave: string[] = [];
  if (primary) {
    const e = primary.entity;
    if (a.intent === "results" && e.kind !== "trial") wave.push(...(e.trials ?? []).slice(0, 3), ...(primary.neighbours.trial ?? []).map((t) => t.id).slice(0, 3));
    if (a.intent === "trials" && e.kind !== "trial") wave.push(...trialsOf(primary, lookup, 3).map((t) => t.id));
    if (a.intent === "mechanism" && e.kind === "drug") wave.push(...(e.targets ?? []).slice(0, 1));
    if (a.intent === "who" && e.kind === "drug") wave.push(...(e.companies ?? []).slice(0, 2));
    if (a.intent === "who" && (e.kind === "technology" || e.kind === "target")) wave.push(...(primary.neighbours.drug ?? []).filter((d) => byId.get(d.id)?.status === "approved").slice(0, 4).map((d) => d.id));
    if (a.intent === "results" && e.kind === "trial") wave.push(...(e.drugs ?? []).slice(0, 2));
    const checkpoint = e.id === "checkpoint-inhibitor" || e.id === "irae" || (e.technologies ?? []).includes("checkpoint-inhibitor") || (e.targets ?? []).some((t) => ["pd1", "pdl1", "ctla4", "lag3", "tigit"].includes(t));
    if (a.intent === "side-effects" && checkpoint) wave.push("irae");
    if (a.intent === "prognosis") wave.push("prognosis");
    // The September 2026 kinds: regional listings, companies, investors, roadmaps and journals read a few more records.
    const region = regionFromQuestion(question) ?? deps.region;
    const drugsIn = (r: Region) => regionDrugs(primary, lookup, r).map((d) => d.id);
    const approvedDrugs = () => (primary.neighbours.drug ?? []).filter((d) => byId.get(d.id)?.status === "approved").map((d) => d.id);
    if (a.intent === "regional-approvals" && e.kind !== "drug" && region) wave.push(...drugsIn(region).slice(0, 8));
    if (a.intent === "companies") {
      if (e.kind === "company" && batch) wave.push(...index.entries.filter((x) => x.kind === "company" && x.batch === batch).map((x) => x.id).slice(0, 10));
      else if (e.kind === "company") wave.push(...(primary.neighbours.company ?? []).slice(0, 2).map((x) => x.id));
      else { wave.push(...(regionFromQuestion(question) ? drugsIn(regionFromQuestion(question)!) : approvedDrugs()).slice(0, 6), ...(primary.neighbours.company ?? []).slice(0, 3).map((x) => x.id)); }
    }
    if (a.intent === "investors") {
      if (e.kind === "company") wave.push(...(e.acquiredBy ? [e.acquiredBy] : []), ...(e.companyType === "investor" ? (primary.neighbours.company ?? []).slice(0, 2).map((x) => x.id) : []));
      else wave.push(...(primary.neighbours.company ?? []).slice(0, 10).map((x) => x.id));
    }
    // A front's own roadmap (`radiation` has `radiation-roadmap`) is read before the cancer roadmaps that merely
    // list it as a section. The neighbour list arrives in corpus order, so without this sort every new deep-dive
    // roadmap that names the front pushes the front's own map out of the four records the template reads.
    if (a.intent === "roadmap" && e.kind !== "roadmap") {
      const ownRoadmap = (n: { id: string }) => (n.id.startsWith(`${e.id}-`) ? 0 : 1);
      wave.push(...[...(primary.neighbours.roadmap ?? [])].sort((x, y) => ownRoadmap(x) - ownRoadmap(y)).slice(0, 4).map((x) => x.id));
    }
    if (a.intent === "journals") wave.push(...topicJournals.filter((x) => x.id !== e.id).slice(0, 5).map((x) => x.id), ...(primary.neighbours.journal ?? []).slice(0, 2).map((x) => x.id));
  }
  const WIDE = new Set(["regional-approvals", "companies", "investors", "journals", "roadmap"]);
  const waveIds = unique(wave).filter((id) => byId.has(id)).slice(0, WIDE.has(a.intent) ? 12 : 4);
  if (waveIds.some((id) => !loaded.has(id))) { deps.onStep?.("Reading linked records"); await loadAll(waveIds.filter((id) => !loaded.has(id))); }
  const related = waveIds.map((id) => loaded.get(id)).filter((r): r is AskEntityRecord => !!r);

  const namedIds = new Set([primary?.entity.id, ...secondary.map((r) => r.entity.id)]);
  const retrievedRecs = wanted.map((id) => loaded.get(id)).filter((r): r is AskEntityRecord => !!r && !namedIds.has(r.entity.id));
  const resolvedNotes = a.entities.filter((r) => r.strong).slice(0, 3).map((r) => (r.pattern.toLowerCase() === r.entry.name.toLowerCase() ? r.entry.name : `“${r.pattern}” → ${r.entry.name}`));

  deps.onStep?.("Composing the answer");
  const answer = composeTemplated({
    question, intent: a.intent, primary, secondary, related, retrieved: retrievedRecs, lookup, region: deps.region,
    alternates: a.alternates, primaryStrong, resolvedNotes, topic,
    pair: a.pair ? { question: a.pair.pair.q, source: a.pair.pair.source === "benchmark" ? "open benchmark" : "questions to ask your oncologist" } : undefined,
  });
  const consulted: Source[] = [...loaded.values()].map((r) => ({ id: r.entity.id, kind: r.entity.kind, name: r.entity.name, route: r.route }));
  return { ...answer, analysis: a, consulted };
}

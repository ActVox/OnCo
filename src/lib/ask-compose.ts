/**
 * Ask OnCo, step two: build the answer from the structured fields of the records the question named.
 *
 * One template per intent (define, treatments, approval, mechanism, side effects, trials, results, compare,
 * prognosis, who, cost, biomarkers). Every sentence is either copied from a record field or filled from
 * structured data on that record, and every sentence carries a citation to the record it came from. Plain
 * English comes first (the TL;DR), then one level deeper. When no template applies the extractive
 * sentence-retrieval path in ask.ts is used unchanged.
 *
 * Pure and browser-safe. Reads regional approvals from src/data/regional-approvals.ts (already in the client
 * bundle through the region switcher).
 */
import { composeAnswer, recordFromEntity, sentences, type Answer, type AskRecord, type Cited, type EntityLike, type Source } from "./ask";
import { regionCode, shortName, type AskIndexEntry } from "./ask-index";
import { INTENT_LABEL, type Intent } from "./ask-intent";
import { GRADE_META, gradeFromTags, type EvidenceGrade } from "./complementary";
import { tokenize } from "./semantic";
import type { Kind } from "./kinds";
import { REGION_META, REGIONS, regionalApprovals, type Region, type RegionalEntry } from "@/data/regional-approvals";
import { SURVIVAL_SITES } from "@/data/survival-map";

export type Neighbour = { id: string; kind: Kind; name: string; route: string };

/** The entity JSON from /api/v1/entities/<id>.json, typed loosely: every kind-specific field is optional. */
export type AskEntity = EntityLike & {
  aka?: string[]; status?: string; tags?: string[];
  brand?: string; code?: string; modality?: string; payload?: string; linker?: string; mechanismSteps?: string[];
  toxicity?: Array<{ event: string; anyGradePct?: number; grade3PlusPct?: number; note?: string }>;
  /** Drugs: cost and coverage rows by country. Journals: the access model ("subscription", "hybrid", "open-access", "diamond"). */
  access?: Array<{ country: string; listPrice?: string; reimbursement?: string; assistance?: string; generic?: boolean }> | string;
  ycBatch?: string; investors?: string[]; acquiredBy?: string; funding?: Array<{ round: string; year: number; amountUsd?: number; note?: string }>;
  publisher?: string; scope?: string; society?: string; issn?: string; impactFactor?: { value: number; year: number; source?: string };
  steps?: Array<{ era: string; title: string; description: string; refs?: string[]; status: string }>;
  regulatoryEvents?: Array<{ date: string; type: string; region: string; note: string }>;
  dosing?: { route: string; schedule: string; modifications?: string; monitoring?: string };
  standardOfCare?: Array<{ setting: string; approach: string; refs?: string[] }>;
  pipeline?: string[]; group?: string; burden?: string; subtypes?: string[]; biomarkers?: string[];
  phase?: string; setting?: string; sponsor?: string; nct?: string; yearReported?: number; enrolled?: number; started?: string; startedType?: string;
  hq?: string; country?: string; companyType?: string; ticker?: string; founded?: number;
  city?: string; institutionType?: string; nci?: string; university?: string; programs?: string[]; newsweekOncology2026?: number;
  role?: string; specialisms?: string[]; institutionId?: string;
  category?: string; journal?: string; year?: number; authors?: string; paperType?: string;
  symbol?: string; targetClass?: string; prevalence?: Array<{ cancerId: string; pct: number | string; measure?: string }>;
  firstDescribed?: number; firstDescribedNote?: string;
  since?: number | string; generation?: string; holds?: string; url?: string; maturity?: string; actor?: string;
  stage?: string; severity?: string; metrics?: Array<{ label: string; value: string }>;
  targets?: string[]; drugs?: string[]; cancers?: string[]; trials?: string[]; companies?: string[]; technologies?: string[]; terms?: string[]; institutions?: string[]; sections?: string[];
};
export type AskEntityRecord = { entity: AskEntity; route: string; neighbours: Record<string, Neighbour[]> };
export type ReadMore = { label: string; href: string };

export type AskAnswer = Answer & {
  intent: Intent;
  /** Which template produced the answer, or "extractive" for the fallback. */
  template: string;
  /** Records the question named, primary first. */
  entities: Source[];
  /** Other candidates for "Not what you meant?". */
  alternates: Source[];
  followUps: string[];
  readMore: ReadMore[];
  /** One line on how the answer was built. */
  method: string;
  pair?: { question: string; source: string };
};

export type ComposeInput = {
  question: string;
  intent: Intent;
  primary?: AskEntityRecord;
  /** Other records the question named, best first. */
  secondary: AskEntityRecord[];
  /** Second-wave records fetched for the template (trials of a drug, target of a drug, the irAE term). */
  related: AskEntityRecord[];
  /** Retrieval hits, for the fallback and the detail sentences. */
  retrieved: AskEntityRecord[];
  lookup: (id: string) => AskIndexEntry | undefined;
  region?: Region;
  alternates: AskIndexEntry[];
  /** True when the primary was named in the question (not merely retrieved). */
  primaryStrong: boolean;
  /** "'triple-negative' → Triple-negative breast cancer (TNBC)" lines for the method note. */
  resolvedNotes: string[];
  pair?: { question: string; source: string };
  /** For "which journals cover X": the topic words the journals were matched on and every index entry that matched. */
  topic?: { words: string; entries: AskIndexEntry[] };
};

/* ------------------------------------------------------------------ survival figures stay out */

const SURVIVAL_WORDS = /\b(?:surviv\w*|mortality|deaths?|died|die|dying|fatal(?:ity|ities)?|life expectancy)\b/i;
const SURVIVAL_ABBREVIATIONS = /\b(?:OS|DFS|EFS|RFS|PFS)\b/;
const FIGURE = /\d+(?:\.\d+)?\s*(?:%|percent|per cent)|\bHR\s*(?:=|:|of|was|is)?\s*[0-9]|\bhazard ratio\b[^.]{0,20}\d|\d[\d,.]*(?:\s*(?:million|thousand|lakh|crore))?(?:\s+[a-z-]+){0,2}\s+(?:deaths|died|dead|die)\b|\bper\s+100,?000\b|\b(?:one|two|three|four|five|half|a third|a quarter)\b[^.]{0,20}\b(?:in|out of)\b[^.]{0,30}\b(?:die|died|dies|dead|survive)\b|\b(?:twice|times)\b[^.]{0,30}\b(?:die|dying|death|deaths|survive|survival)\b/i;

/**
 * True when a sentence quotes a survival or mortality figure: a percentage, hazard ratio, death count, rate per 100,000
 * or "one in three die" next to a survival word. Templates keep such sentences out of answers; a trial's own result and
 * outcome fields are the one place they are shown, because there the figure is the result being asked about. Median
 * months from a trial ("OS 12.1 vs 6.7 months") are treatment effects, not population statistics, and are left alone.
 */
export function hasSurvivalFigure(text: string): boolean {
  return (SURVIVAL_WORDS.test(text) || SURVIVAL_ABBREVIATIONS.test(text)) && FIGURE.test(text);
}

/** Fields whose sentences may carry a survival figure: a trial's own results, and the survival disclosure itself. */
const FIGURE_FIELDS = new Set(["result", "outcome", "replication", "findings", "survival disclosure"]);

const toSource = (r: { entity: { id: string; kind: Kind; name: string }; route: string }): Source => ({ id: r.entity.id, kind: r.entity.kind, name: r.entity.name, route: r.route });
const entrySource = (e: AskIndexEntry): Source => ({ id: e.id, kind: e.kind, name: e.name, route: e.route });

/** Collects cited sentences in order, one citation number per record in order of first use. */
class Builder {
  sentences: Cited[] = [];
  sources: Source[] = [];
  private cite = new Map<string, number>();
  private seen = new Set<string>();
  private tokens: Array<Set<string>> = [];

  citeOf(s: Source): number {
    let n = this.cite.get(s.id);
    if (n === undefined) { n = this.sources.length + 1; this.cite.set(s.id, n); this.sources.push(s); }
    return n;
  }
  has(text: string): boolean {
    const t = new Set(tokenize(text));
    if (this.seen.has(text.trim())) return true;
    return this.tokens.some((x) => overlap(x, t) > 0.7);
  }
  add(src: Source, text: string | undefined, field: string, score = 1): boolean {
    if (!text) return false;
    const t = text.replace(/\s+/g, " ").trim();
    if (!t || this.has(t)) return false;
    if (!FIGURE_FIELDS.has(field) && hasSurvivalFigure(t)) return false;
    this.seen.add(t);
    this.tokens.push(new Set(tokenize(t)));
    this.sentences.push({ text: /[.!?]$/.test(t) ? t : `${t}.`, cite: this.citeOf(src), field, score });
    return true;
  }
}

function overlap(a: Set<string>, b: Set<string>): number {
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / Math.max(1, Math.min(a.size, b.size));
}

const list = (items: string[]): string => items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
const firstPara = (s?: string) => (s ?? "").split(/\n\s*\n/)[0] ?? "";
const first = (text: string | undefined, n: number) => sentences(firstPara(text)).slice(0, n);
const short = (r: AskEntityRecord) => shortName(r.entity);
const nameOf = (lookup: ComposeInput["lookup"], id: string) => lookup(id)?.name ?? id;
const statusOf = (lookup: ComposeInput["lookup"], id: string) => lookup(id)?.status;

const COMPANY_TYPE: Record<string, string> = { pharma: "pharmaceutical", biotech: "biotech", diagnostics: "diagnostics", imaging: "imaging", devices: "medical-device", "ai-software": "AI and software", radiopharma: "radiopharmaceutical", "cell-therapy": "cell-therapy", "cro-services": "contract-research", nonprofit: "non-profit", investor: "investment", "cooperative-group": "cooperative trials group, not a" };
const INSTITUTION_TYPE: Record<string, string> = { "cancer-center": "cancer centre", university: "university", hospital: "hospital", "research-institute": "research institute", government: "government body", consortium: "consortium" };
const COUNTRY: Record<string, string> = { US: "the United States", GB: "the United Kingdom", UK: "the United Kingdom", FR: "France", DE: "Germany", JP: "Japan", CN: "China", KR: "South Korea", CA: "Canada", AU: "Australia", NL: "the Netherlands", IT: "Italy", ES: "Spain", CH: "Switzerland", SE: "Sweden", DK: "Denmark", BE: "Belgium", IN: "India", BR: "Brazil", IL: "Israel", SG: "Singapore", TW: "Taiwan", AT: "Austria", NO: "Norway", FI: "Finland", IE: "Ireland", PT: "Portugal", PL: "Poland", TR: "Türkiye", MX: "Mexico", AR: "Argentina", ZA: "South Africa", EG: "Egypt", NG: "Nigeria", KE: "Kenya", TZ: "Tanzania", RW: "Rwanda", GH: "Ghana", MA: "Morocco", TN: "Tunisia", SA: "Saudi Arabia", AE: "the United Arab Emirates", QA: "Qatar", JO: "Jordan", IR: "Iran", TH: "Thailand", VN: "Vietnam", ID: "Indonesia", PH: "the Philippines", NZ: "New Zealand", HK: "Hong Kong", CL: "Chile", CO: "Colombia", PE: "Peru", HU: "Hungary", CZ: "Czechia", SI: "Slovenia" };
const country = (c?: string) => (c ? COUNTRY[c] ?? c : "");
const regulator = (r: Region) => REGION_META[r].regulator.replace(/\s*\(.*\)$/, "");
const ACCESS_LABEL: Record<string, string> = { subscription: "subscription (paywalled)", hybrid: "hybrid (subscription with an open-access option)", "open-access": "fully open access", diamond: "diamond open access (free to read and to publish)" };
const BATCH_SEASON: Record<string, string> = { W: "Winter", S: "Summer", X: "Spring", F: "Fall" };

/** "W24" -> "Winter 2024 (W24)". */
export function batchLabel(batch: string): string {
  const m = /^([WSXF])(\d{2})$/.exec(batch);
  return m ? `${BATCH_SEASON[m[1]]} 20${m[2]} (${batch})` : batch;
}

/** A Y Combinator batch code the question names ("YC W24", "the S21 batch"); only read when YC or a batch is mentioned. */
export function batchFromQuestion(q: string): string | undefined {
  if (!/\b(?:yc|y combinator|ycombinator|batch)\b/i.test(q)) return undefined;
  return /\b([WSXF]\d{2})\b/.exec(q)?.[1];
}

const fmtUsd = (n: number) => (n >= 1e9 ? `$${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)} billion` : n >= 1e6 ? `$${Math.round(n / 1e6)} million` : `$${n.toLocaleString()}`);

/** The evidence grade of a complementary approach: the record's tag, else the Ask index (which also grades records tagged elsewhere). */
export function gradeOf(r: AskEntityRecord, lookup: ComposeInput["lookup"]): EvidenceGrade | undefined {
  return gradeFromTags(r.entity.tags ?? []) ?? (lookup(r.entity.id)?.grade as EvidenceGrade | undefined);
}

/** What each grade means for the reader, said once and plainly. Nothing below "moderate" is ever framed as an option. */
const GRADE_VERDICT: Record<EvidenceGrade, (name: string) => string> = {
  strong: (n) => `For ${n} the evidence is strong for the purpose described: consistent randomised trials or a systematic review, and at least one major guideline (ASCO, SIO, MASCC, NCCN or NICE) recommends it.`,
  moderate: (n) => `For ${n} there is some evidence: randomised trials exist but are small, mixed or limited to one setting, so guidelines say it may be offered rather than recommending it outright.`,
  insufficient: (n) => `For ${n} the evidence is insufficient: laboratory, animal or uncontrolled human data only, or trials too small and inconsistent to draw a conclusion. OnCo does not present it as a treatment option; it is not a reason to use it outside a trial, and it must never replace standard treatment.`,
  "no-benefit": (n) => `${n} was tested and showed no benefit: adequately sized randomised trials found no effect on the outcome it was claimed to change. OnCo does not present it as an option.`,
  harm: (n) => `For ${n} there is evidence of harm or interaction: direct toxicity, a clinically important interaction with cancer treatment, or use in place of standard treatment that is associated with worse outcomes. OnCo does not present it as an option; tell your treatment team before taking anything like it.`,
};

/** The regional-approvals row for a product, said in sentences: the reader's region first, then the rest in one line. */
function regionalSentences(name: string, id: string, region: Region | undefined): string[] {
  const row = regionalApprovals[id];
  if (!row) return [];
  const out: string[] = [];
  const say = (r: Region, e: RegionalEntry): string => {
    const label = REGION_META[r].label;
    switch (e.status) {
      case "approved": return `In ${r === "US" || r === "EU" || r === "UK" ? "the " : ""}${label}, ${name} is approved by the ${regulator(r)}${e.year ? ` (first approval ${e.year})` : ""}${e.indication ? `, covering ${e.indication}` : ""}${e.note ? `; ${e.note}` : ""}.`;
      case "conditional": return `In ${r === "US" || r === "EU" || r === "UK" ? "the " : ""}${label}, ${name} has conditional approval from the ${regulator(r)}${e.year ? ` (${e.year})` : ""}${e.indication ? `, for ${e.indication}` : ""}.`;
      case "under-review": return `In ${r === "US" || r === "EU" || r === "UK" ? "the " : ""}${label}, ${name} is under review by the ${regulator(r)}${e.note ? `: ${e.note}` : ""}.`;
      case "not-filed": return `In ${r === "US" || r === "EU" || r === "UK" ? "the " : ""}${label}, ${name} has not been filed with the ${regulator(r)}${e.note ? ` (${e.note})` : ""}.`;
      case "withdrawn": return `In ${r === "US" || r === "EU" || r === "UK" ? "the " : ""}${label}, ${name} was withdrawn${e.year ? ` in ${e.year}` : ""}${e.note ? ` (${e.note})` : ""}.`;
      case "rejected": return `In ${r === "US" || r === "EU" || r === "UK" ? "the " : ""}${label}, ${name} was rejected by the ${regulator(r)}${e.note ? ` (${e.note})` : ""}.`;
    }
  };
  const order: Region[] = region ? [region, ...REGIONS.filter((r) => r !== region)] : [...REGIONS];
  const firstRegion = order.find((r) => row[r]);
  if (!firstRegion) return [];
  out.push(say(firstRegion, row[firstRegion]!));
  const rest = order.filter((r) => r !== firstRegion && row[r]);
  const approved = rest.filter((r) => row[r]!.status === "approved" || row[r]!.status === "conditional").map((r) => `${regionName(r)} (${regulator(r)}${row[r]!.year ? `, ${row[r]!.year}` : ""})`);
  const other = rest.filter((r) => row[r]!.status !== "approved" && row[r]!.status !== "conditional").map((r) => `${row[r]!.status.replace("-", " ")} in ${regionName(r)}`);
  if (approved.length) out.push(`It is also approved in ${list(approved)}.`);
  if (other.length) out.push(`Elsewhere it is ${list(other)}.`);
  if (region && !row[region]) out.push(`OnCo has no regulatory record for ${name} in ${regionName(region)}; absence means unknown, not "not approved".`);
  return out;
}

const regionName = (r: Region) => (r === "US" || r === "EU" || r === "UK" ? `the ${REGION_META[r].label}` : REGION_META[r].label);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A region the question names ("in the UK", "in Europe", "by the FDA") outranks the reader's saved region. */
export function regionFromQuestion(q: string): Region | undefined {
  const s = q.toLowerCase();
  if (/\b(?:uk|u\.k\.|united kingdom|britain|british|england|nhs|nice|mhra)\b/.test(s)) return "UK";
  if (/\b(?:eu|e\.u\.|europe|european|ema|emea|germany|france|italy|spain|netherlands)\b/.test(s)) return "EU";
  if (/\b(?:japan|japanese|pmda|mhlw)\b/.test(s)) return "JP";
  if (/\b(?:china|chinese|nmpa)\b/.test(s)) return "CN";
  if (/\b(?:australia|australian|tga|pbs)\b/.test(s)) return "AU";
  if (/\b(?:india|indian|cdsco|dcgi|pm-jay|ayushman)\b/.test(s)) return "IN";
  if (/\b(?:us|u\.s\.|usa|united states|america|american|fda|medicare)\b/.test(s)) return "US";
  return undefined;
}

/** Trials linked to a record, curated order first, recruiting first. */
export function trialsOf(r: AskEntityRecord, lookup: ComposeInput["lookup"], max = 6): Neighbour[] {
  const ids = [...(r.entity.trials ?? []), ...(r.neighbours.trial ?? []).map((t) => t.id)];
  const seen = new Set<string>();
  const out: Neighbour[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const n = (r.neighbours.trial ?? []).find((t) => t.id === id);
    const en = lookup(id);
    if (n) out.push(n); else if (en) out.push({ id: en.id, kind: en.kind, name: en.name, route: en.route });
  }
  const rank = (s?: string) => (s === "recruiting" ? 0 : s === "active" || s === "planned" ? 1 : s === "positive" ? 2 : s === "mixed" ? 3 : s === "completed" ? 4 : s === "negative" ? 5 : 6);
  return out.sort((a, b) => rank(statusOf(lookup, a.id)) - rank(statusOf(lookup, b.id))).slice(0, max);
}

function withStatus(n: Neighbour, lookup: ComposeInput["lookup"]): string {
  const s = statusOf(lookup, n.id);
  return s ? `${n.name} (${s.replace("-", " ")})` : n.name;
}

/** The products that matter most for a record: for a cancer, those named in its standard of care (in order); otherwise approved neighbours. */
function keyDrugs(r: AskEntityRecord, lookup: ComposeInput["lookup"]): Neighbour[] {
  const out: Neighbour[] = [];
  const seen = new Set<string>();
  const push = (n?: Neighbour) => { if (n && !seen.has(n.id)) { seen.add(n.id); out.push(n); } };
  if (r.entity.kind === "cancer") {
    for (const row of r.entity.standardOfCare ?? []) for (const id of row.refs ?? []) { const en = lookup(id); if (en?.kind === "drug") push({ id: en.id, kind: en.kind, name: en.name, route: en.route }); }
  }
  for (const d of r.neighbours.drug ?? []) if (statusOf(lookup, d.id) === "approved") push(d);
  return out;
}

function drugsOf(r: AskEntityRecord, lookup: ComposeInput["lookup"]): { approved: Neighbour[]; late: Neighbour[]; other: Neighbour[] } {
  const ds = r.neighbours.drug ?? [];
  const approved = ds.filter((d) => statusOf(lookup, d.id) === "approved");
  const late = ds.filter((d) => statusOf(lookup, d.id) === "phase-3");
  const other = ds.filter((d) => !approved.includes(d) && !late.includes(d));
  return { approved, late, other };
}

type Ctx = ComposeInput & { b: Builder; readMore: ReadMore[] };

/* ------------------------------------------------------------------ templates */

function tDefine(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  c.b.add(s, e.tldr, "TL;DR");
  for (const x of first(e.summary, 2)) c.b.add(s, x, "summary");
  switch (e.kind) {
    case "cancer": if (e.stateOfArt?.[0]) c.b.add(s, e.stateOfArt[0], "state of the art"); break;
    case "target": c.b.add(s, e.biology, "biology"); if (e.whereFound?.length) c.b.add(s, `Where it is found: ${list(e.whereFound.slice(0, 4))}.`, "where found"); break;
    case "technology": for (const x of first(e.principle, 1)) c.b.add(s, x, "principle"); break;
    case "drug": {
      c.b.add(s, e.mechanism, "mechanism");
      if (e.approvals?.length) { const a = [...e.approvals].sort((x, y) => x.year - y.year)[0]; c.b.add(s, `First approved in ${a.region} in ${a.year} for ${a.indication}.`, "approvals"); }
      const brand = e.brand?.split(/\s*[\/;]\s*/)[0]?.replace(/\s*\([^)]*\)\s*/g, " ").trim();
      const cos = (e.companies ?? []).map((id) => c.lookup(id)?.name).filter((x): x is string => !!x).slice(0, 3);
      if (brand && brand.toLowerCase() !== e.name.toLowerCase()) c.b.add(s, `Sold as ${brand}${cos.length ? `; developed or marketed by ${list(cos)}` : ""}.`, "brand and companies");
      else if (cos.length) c.b.add(s, `${short(r)} is developed or marketed by ${list(cos)}.`, "brand and companies");
      break;
    }
    case "trial": c.b.add(s, e.result, "result"); if (e.setting) c.b.add(s, `Setting: ${e.setting}.`, "setting"); break;
    case "pathway": {
      const kegg = (e.aka ?? []).map((a) => /^KEGG\s+(hsa\d{5})$/i.exec(a)?.[1]).find((x): x is string => !!x);
      if (kegg) c.b.add(s, `This is KEGG map ${kegg}${e.cancers?.length ? `, the pathway map for ${list(e.cancers.slice(0, 3).map((id) => c.lookup(id)?.name ?? id))}` : ""}.`, "kegg");
      c.b.add(s, e.analogy, "analogy");
      if (e.interventions?.[0]) c.b.add(s, e.interventions[0], "interventions");
      break;
    }
    case "journal": {
      const access = typeof e.access === "string" ? e.access : undefined;
      c.b.add(s, e.publisher ? `${e.name} is published by ${e.publisher}${e.society && !e.publisher.includes(e.society) ? ` on behalf of the ${e.society}` : ""}${e.founded ? `, founded ${e.founded}` : ""}.` : undefined, "profile");
      const facts = [e.scope ? `scope: ${e.scope}` : "", access ? `access model: ${ACCESS_LABEL[access] ?? access}` : "", e.issn ? `ISSN ${e.issn}` : ""].filter(Boolean);
      if (facts.length) c.b.add(s, `${cap(facts.join("; "))}.`, "profile");
      if (e.impactFactor) c.b.add(s, `Its ${e.impactFactor.year} impact factor was ${e.impactFactor.value}${e.impactFactor.source ? ` (${e.impactFactor.source})` : ""}; OnCo lists no other metric.`, "impact factor");
      const papers = (r.neighbours.paper ?? []).slice(0, 4).map((p) => p.name);
      if (papers.length) c.b.add(s, `Key papers on OnCo it carried include ${list(papers)}.`, "linked papers");
      c.readMore.push({ label: "Journals", href: "/journals/" });
      break;
    }
    case "roadmap": return tRoadmap(c, r);
    case "term": {
      const drugs = (r.neighbours.drug ?? []).slice(0, 4).map((d) => d.name);
      const cancers = (r.neighbours.cancer ?? []).slice(0, 4).map((d) => shortName(d));
      if (drugs.length || cancers.length) c.b.add(s, `Why it matters: ${[drugs.length ? `it decides or shapes the use of ${list(drugs)}` : "", cancers.length ? `it comes up in ${list(cancers)}` : ""].filter(Boolean).join(", and ")}.`, "linked records");
      break;
    }
    case "company": case "institution": case "person": return tWho(c, r);
    case "collection": c.b.add(s, e.holds, "what it holds"); break;
    case "bottleneck": if (e.causes?.[0]) c.b.add(s, e.causes[0], "causes"); if (e.successLooksLike) c.b.add(s, e.successLooksLike, "success looks like"); break;
    case "paper": c.b.add(s, e.whatItMeans, "what it means"); if (e.findings?.[0]) c.b.add(s, e.findings[0], "findings"); break;
    case "idea": c.b.add(s, e.hypothesis, "hypothesis"); break;
  }
  if (e.kind === "cancer" || e.kind === "target") {
    const drugs = keyDrugs(r, c.lookup).slice(0, 5).map((d) => d.name);
    if (drugs.length) c.b.add(s, `${e.kind === "cancer" ? "Treatments in the standard of care for" : "Approved products against"} ${short(r)} on OnCo include ${list(drugs)}.`, "linked products");
    if (e.kind === "cancer" && e.burden && /\bhow (?:common|many)\b|\bincidence\b|\bprevalence\b|\bburden\b|\bcases\b|\bmarket\b/i.test(c.question)) c.b.add(s, e.burden, "burden");
  }
  if (e.kind === "drug" && e.dosing && /\bdos(?:e|es|ing|age)\b|\bschedule\b|\bhow (?:often|much)\b|\bmg\b/i.test(c.question)) {
    c.b.add(s, `Dosing: ${e.dosing.route}; ${e.dosing.schedule}.`, "dosing");
    if (e.dosing.monitoring) c.b.add(s, `Monitoring: ${e.dosing.monitoring}.`, "dosing");
  }
  return c.b.sentences.length > 0;
}

function companyLine(e: AskEntity): string | undefined {
  if (!e.hq) return undefined;
  const type = COMPANY_TYPE[e.companyType ?? ""] ?? e.companyType ?? "";
  return `${e.name} is ${/^[aeiou]/i.test(type) ? "an" : "a"} ${type} company headquartered in ${e.hq}${e.ticker ? ` (ticker ${e.ticker})` : ""}${e.founded ? `, founded ${e.founded}` : ""}.`;
}

function institutionLine(e: AskEntity): string | undefined {
  if (!e.city) return undefined;
  return `${e.name} is a ${INSTITUTION_TYPE[e.institutionType ?? ""] ?? e.institutionType ?? "centre"} in ${e.city}, ${country(e.country)}${e.nci ? `, an NCI-designated ${e.nci} cancer center` : ""}${e.newsweekOncology2026 ? `, ranked ${e.newsweekOncology2026} in the world for oncology in the Newsweek/Statista 2026 list` : ""}.`;
}

function tTreatments(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "cancer") {
    c.b.add(s, e.tldr, "TL;DR");
    const rows = e.standardOfCare ?? [];
    for (const row of rows.slice(0, 6)) c.b.add(s, `${row.setting}: ${row.approach}`, "standard of care");
    if (!rows.length) for (const x of e.stateOfArt?.slice(0, 2) ?? []) c.b.add(s, x, "state of the art");
    const pipe = (e.pipeline ?? []).slice(0, 6).map((id) => nameOf(c.lookup, id));
    if (pipe.length) c.b.add(s, `In the pipeline for ${short(r)}: ${list(pipe)}.`, "pipeline");
    c.readMore.push({ label: `Lines of therapy for ${short(r)}`, href: `/sequencing/${e.id}/` }, { label: "Questions to ask your oncologist", href: `/prep/?cancer=${e.id}` });
    return true;
  }
  if (e.kind === "drug") {
    c.b.add(s, e.tldr, "TL;DR");
    const ap = [...(e.approvals ?? [])].sort((a, b) => b.year - a.year).slice(0, 4);
    if (ap.length) c.b.add(s, `${short(r)} is approved for: ${ap.map((a) => `${a.indication} (${a.region} ${a.year})`).join("; ")}.`, "approvals");
    else c.b.add(s, `${short(r)} is not yet approved anywhere OnCo tracks${e.status ? `; its status is ${e.status.replace("-", " ")}` : ""}.`, "status");
    const cancers = (r.neighbours.cancer ?? []).slice(0, 5).map((x) => shortName(x));
    if (cancers.length) c.b.add(s, `Cancers linked to ${short(r)} on OnCo: ${list(cancers)}.`, "linked cancers");
    return true;
  }
  if (e.kind === "target" || e.kind === "technology" || e.kind === "term" || e.kind === "pathway") {
    c.b.add(s, e.tldr, "TL;DR");
    const { approved, late } = drugsOf(r, c.lookup);
    if (approved.length) c.b.add(s, `Approved products ${e.kind === "target" ? "against" : e.kind === "technology" ? "using" : "linked to"} ${short(r)}: ${list(approved.slice(0, 8).map((d) => d.name))}.`, "linked products");
    if (late.length) c.b.add(s, `In phase 3: ${list(late.slice(0, 6).map((d) => d.name))}.`, "linked products");
    if (!approved.length && !late.length) { const other = (r.neighbours.drug ?? []).slice(0, 6).map((d) => withStatus(d, c.lookup)); if (other.length) c.b.add(s, `Products on OnCo linked to ${short(r)}: ${list(other)}.`, "linked products"); }
    if (e.kind === "pathway" && e.interventions?.length) for (const x of e.interventions.slice(0, 2)) c.b.add(s, x, "interventions");
    return c.b.sentences.length > 0;
  }
  return false;
}

function tBiomarkers(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind !== "cancer") return false;
  c.b.add(s, e.tldr, "TL;DR");
  if (e.biomarkers?.length) c.b.add(s, `Biomarkers tested in ${short(r)}: ${e.biomarkers.join("; ")}.`, "biomarkers");
  if (e.subtypes?.length) c.b.add(s, `Recognised subtypes: ${e.subtypes.slice(0, 6).join("; ")}.`, "subtypes");
  c.readMore.push({ label: "Biomarker matrix", href: "/biomarker-matrix/" }, { label: "Report reader", href: "/report-reader/" });
  return (e.biomarkers?.length ?? 0) > 0;
}

function tApproval(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "drug") {
    c.b.add(s, e.tldr, "TL;DR");
    if (e.mechanism && e.modality) c.b.add(s, `It is ${/^[aeiou]/i.test(e.modality) ? "an" : "a"} ${e.modality}: ${e.mechanism}`, "mechanism");
    for (const x of regionalSentences(short(r), e.id, regionFromQuestion(c.question) ?? c.region)) c.b.add(s, x, "regional approvals");
    const ap = [...(e.approvals ?? [])].sort((a, b) => a.year - b.year);
    if (ap.length) c.b.add(s, `Approvals recorded on OnCo: ${ap.slice(-4).map((a) => `${a.region} ${a.year}, ${a.indication}`).join("; ")}.`, "approvals");
    else if (!regionalApprovals[e.id]) c.b.add(s, `${short(r)} is not approved anywhere OnCo tracks${e.status ? `; its status is ${e.status.replace("-", " ")}` : ""}.`, "status");
    const ev = [...(e.regulatoryEvents ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (ev) c.b.add(s, `Latest regulatory event: ${ev.date}, ${ev.type.replace("-", " ")} (${ev.region}): ${ev.note}`, "regulatory events");
    c.readMore.push({ label: "Regulatory status by region", href: "/regulatory/regions/" });
    return true;
  }
  if (e.kind === "technology" || e.kind === "target" || e.kind === "term") {
    c.b.add(s, e.tldr, "TL;DR");
    const { approved, late } = drugsOf(r, c.lookup);
    if (approved.length) c.b.add(s, `Approved products ${e.kind === "target" ? "against" : "using"} ${short(r)} on OnCo: ${list(approved.slice(0, 8).map((d) => d.name))}.`, "linked products");
    else c.b.add(s, `No product ${e.kind === "target" ? "against" : "using"} ${short(r)} is approved yet on OnCo's record.`, "linked products");
    if (late.length) c.b.add(s, `In phase 3: ${list(late.slice(0, 6).map((d) => d.name))}.`, "linked products");
    if (e.kind === "technology" && e.since) c.b.add(s, `First used in people or approved: ${e.since}.`, "since");
    // The year the protein itself was described, with the paper named, so "how long did this take" has a start.
    if (e.kind === "target" && e.firstDescribed) c.b.add(s, `First described in ${e.firstDescribed}. ${e.firstDescribedNote ?? ""}`.trim(), "first described");
    return true;
  }
  if (e.kind === "cancer") return tTreatments(c, r);
  return false;
}

function tMechanism(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  c.b.add(s, e.tldr, "TL;DR");
  switch (e.kind) {
    case "drug":
      c.b.add(s, e.mechanism, "mechanism");
      if (e.mechanismSteps?.length) c.b.add(s, `Step by step: ${e.mechanismSteps.map((x, i) => `${i + 1}) ${x.replace(/\.$/, "")}`).join("; ")}.`, "mechanism steps");
      if (e.payload) c.b.add(s, `Payload: ${e.payload}${e.linker ? `; linker: ${e.linker}` : ""}.`, "payload");
      for (const t of c.related.filter((x) => x.entity.kind === "target").slice(0, 1)) c.b.add(toSource(t), t.entity.biology, "biology");
      return true;
    case "technology": {
      for (const x of first(e.principle, 3)) c.b.add(s, x, "principle");
      if (/\bresist|\blimit|\bfail|\bwhy not\b|\bproblem/i.test(c.question)) for (const x of (e.limitations ?? []).slice(0, 3)) c.b.add(s, x, "limitations");
      else if (e.strengths?.[0]) c.b.add(s, `Strengths: ${e.strengths.slice(0, 2).join("; ")}.`, "strengths");
      return true;
    }
    case "pathway": c.b.add(s, e.analogy, "analogy"); for (const x of first(e.summary, 1)) c.b.add(s, x, "summary"); for (const x of e.interventions?.slice(0, 2) ?? []) c.b.add(s, x, "interventions"); return true;
    case "target": c.b.add(s, e.biology, "biology"); for (const x of first(e.summary, 1)) c.b.add(s, x, "summary"); return true;
    case "term": for (const x of first(e.summary, 2)) c.b.add(s, x, "summary"); return true;
    default: return false;
  }
}

function tSideEffects(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "drug") {
    c.b.add(s, e.tldr, "TL;DR");
    const tox = [...(e.toxicity ?? [])].sort((a, b) => (b.grade3PlusPct ?? -1) - (a.grade3PlusPct ?? -1) || (b.anyGradePct ?? -1) - (a.anyGradePct ?? -1));
    if (tox.length) {
      const fmt = (t: (typeof tox)[number]) => `${t.event.toLowerCase()}${t.anyGradePct !== undefined || t.grade3PlusPct !== undefined ? ` (${[t.anyGradePct !== undefined ? `${t.anyGradePct}% any grade` : "", t.grade3PlusPct !== undefined ? `${t.grade3PlusPct}% grade 3 or higher` : ""].filter(Boolean).join(", ")})` : ""}`;
      c.b.add(s, `The side effects recorded for ${short(r)}${tox[0].note ? ` (${tox[0].note})` : ""}, most serious first: ${tox.slice(0, 5).map(fmt).join("; ")}.`, "toxicity");
    } else {
      const hits = sentences(e.summary).filter((x) => /toxic|adverse|side effect|neutropenia|nausea|diarrhoea|pneumonitis|ILD|fatigue|rash|monitor/i.test(x));
      for (const x of hits.slice(0, 2)) c.b.add(s, x, "summary");
      if (!hits.length) c.b.add(s, `OnCo has no side-effect table for ${short(r)} yet; the label and the pivotal trial publication are the sources to check.`, "toxicity");
    }
    if (e.dosing?.monitoring) c.b.add(s, `Monitoring: ${e.dosing.monitoring}.`, "dosing");
    if (e.dosing?.modifications) c.b.add(s, `Dose changes: ${e.dosing.modifications}.`, "dosing");
    const checkpoint = (e.technologies ?? []).includes("checkpoint-inhibitor") || (e.targets ?? []).some((t) => t === "pd1" || t === "pdl1" || t === "ctla4" || t === "lag3");
    if (checkpoint) c.readMore.push({ label: "Checkpoint side effects by organ", href: "/irae/" });
    const irae = c.related.find((x) => x.entity.id === "irae");
    if (checkpoint && irae) c.b.add(toSource(irae), irae.entity.tldr, "TL;DR");
    c.readMore.push({ label: "Side effects by symptom", href: "/side-effects/" });
    return true;
  }
  if (e.kind === "technology" || e.kind === "term" || e.kind === "cancer") {
    c.b.add(s, e.tldr, "TL;DR");
    const pool = [...(e.limitations ?? []), ...sentences(e.summary), ...(e.openProblems ?? [])];
    const hits = pool.filter((x) => /toxic|adverse|side effect|safety|neutropenia|nausea|diarrhoea|pneumonitis|ILD|fatigue|rash|colitis|thyroid|cytokine|CRS|neurotox|hair|alopecia|immune-related|irAE|hospital/i.test(x));
    for (const x of hits.slice(0, 3)) c.b.add(s, x, e.limitations?.includes(x) ? "limitations" : "summary");
    const irae = c.related.find((x) => x.entity.id === "irae");
    if (irae) { c.b.add(toSource(irae), irae.entity.tldr, "TL;DR"); for (const x of first(irae.entity.summary, 1)) c.b.add(toSource(irae), x, "summary"); c.readMore.push({ label: "Checkpoint side effects by organ", href: "/irae/" }); }
    c.readMore.push({ label: "Side effects by symptom", href: "/side-effects/" });
    return c.b.sentences.length > 1;
  }
  return false;
}

function tTrials(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "trial") return tResults(c, r);
  const trials = trialsOf(r, c.lookup, 6);
  c.b.add(s, e.tldr, "TL;DR");
  if (trials.length) {
    c.b.add(s, `Trials on OnCo linked to ${short(r)}: ${list(trials.map((t) => withStatus(t, c.lookup)))}.`, "linked trials");
    for (const t of trials.slice(0, 3)) { const rec = c.related.find((x) => x.entity.id === t.id); if (rec) c.b.add(toSource(rec), rec.entity.tldr, "TL;DR"); }
  } else {
    c.b.add(s, `OnCo lists no trial linked to ${short(r)} yet; the registry search below covers every registered study.`, "linked trials");
  }
  if (e.kind === "cancer") c.readMore.push({ label: `Lines of therapy for ${short(r)}`, href: `/sequencing/${e.id}/` });
  c.readMore.push({ label: "ClinicalTrials.gov (registry)", href: "/collections/clinicaltrials-gov/" }, { label: "Trials in plain words", href: "/explained/" });
  return true;
}

function tResults(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "trial") {
    c.b.add(s, e.tldr, "TL;DR");
    if (e.phase || e.setting) c.b.add(s, `${e.name} is a phase ${e.phase ?? "?"} trial${e.sponsor ? ` run by ${e.sponsor}` : ""}${e.enrolled ? ` with ${e.enrolled.toLocaleString()} participants` : ""}${e.setting ? `: ${e.setting}` : ""}.`, "setting");
    // How long the trial took: the registry's start date against the year it reported, which is the only pair of
    // dates the corpus holds for a single study.
    if (e.started) {
      const from = Number(e.started.slice(0, 4));
      c.b.add(s, e.yearReported !== undefined && e.yearReported >= from
        ? `It opened in ${e.started} and reported in ${e.yearReported}, ${e.yearReported - from} ${e.yearReported - from === 1 ? "year" : "years"} later.`
        : `It opened in ${e.started}${e.startedType === "estimated" ? ", a date the registry still marks as estimated" : ""}.`, "start date");
    }
    c.b.add(s, e.result ? `Headline result: ${e.result}` : undefined, "result");
    const rec = recordFromEntity(e, r.route);
    for (const p of rec.passages.filter((x) => x.field === "outcome").slice(0, 3)) c.b.add(s, p.text, "outcome");
    for (const x of first(e.summary, 2)) c.b.add(s, x, "summary");
    c.b.add(s, e.replication ? `Replication: ${e.replication}` : undefined, "replication");
    for (const d of c.related.filter((x) => x.entity.kind === "drug").slice(0, 2)) c.b.add(toSource(d), d.entity.tldr, "TL;DR");
    c.readMore.push({ label: "How much each trial changed the risk", href: "/forest/" });
    return true;
  }
  if (e.kind === "drug" || e.kind === "technology" || e.kind === "target") {
    c.b.add(s, e.tldr, "TL;DR");
    const trials = c.related.filter((x) => x.entity.kind === "trial");
    for (const t of trials.slice(0, 3)) {
      const ts = toSource(t);
      c.b.add(ts, t.entity.result ? `${t.entity.name}: ${t.entity.result}` : t.entity.tldr, t.entity.result ? "result" : "TL;DR");
    }
    if (!trials.length) for (const x of first(e.summary, 2)) c.b.add(s, x, "summary");
    if (e.kind === "drug") { const ev = [...(e.regulatoryEvents ?? [])].sort((a, b) => b.date.localeCompare(a.date))[0]; if (ev) c.b.add(s, `Latest regulatory event: ${ev.date}, ${ev.type.replace("-", " ")} (${ev.region}): ${ev.note}`, "regulatory events"); }
    return true;
  }
  if (e.kind === "paper") { c.b.add(s, e.tldr, "TL;DR"); for (const x of e.findings?.slice(0, 3) ?? []) c.b.add(s, x, "findings"); c.b.add(s, e.whatItMeans, "what it means"); return true; }
  if (e.kind === "cancer") return tTreatments(c, r);
  return false;
}

function compareFields(r: AskEntityRecord, lookup: ComposeInput["lookup"]): Array<[string, string]> {
  const e = r.entity;
  const names = (ids?: string[]) => (ids ?? []).slice(0, 4).map((id) => nameOf(lookup, id));
  switch (e.kind) {
    case "drug": {
      const ap = e.approvals ?? [];
      const tox = (e.toxicity ?? []).filter((t) => t.grade3PlusPct !== undefined).sort((a, b) => (b.grade3PlusPct ?? 0) - (a.grade3PlusPct ?? 0)).slice(0, 3);
      const common = (e.toxicity ?? []).filter((t) => t.anyGradePct !== undefined).sort((a, b) => (b.anyGradePct ?? 0) - (a.anyGradePct ?? 0)).slice(0, 5);
      return [["Modality", `${e.modality ?? ""}${e.targets?.length ? ` against ${list(names(e.targets))}` : ""}`], ["Payload", e.payload ?? ""], ["Mechanism", e.mechanism ?? ""], ["Approvals", ap.length ? `${ap.length} recorded, first ${Math.min(...ap.map((a) => a.year))}: ${[...ap].sort((a, b) => a.year - b.year)[0].indication}` : `none yet (${e.status ?? "status unknown"})`], ["Grade 3 or higher side effects", tox.map((t) => `${t.event.toLowerCase()} ${t.grade3PlusPct}%`).join(", ")], ["Most common side effects (any grade)", common.map((t) => `${t.event.toLowerCase()} ${t.anyGradePct}%`).join(", ")], ["Companies", list(names(e.companies))]];
    }
    case "technology": return [["Principle", first(e.principle, 1)[0] ?? ""], ["Since", e.since ? String(e.since) : ""], ["Status", e.status ?? ""], ["Strengths", (e.strengths ?? []).slice(0, 2).join("; ")], ["Limitations", (e.limitations ?? []).slice(0, 2).join("; ")]];
    case "cancer": return [["Burden", e.burden ?? ""], ["Biomarkers", (e.biomarkers ?? []).slice(0, 4).join("; ")], ["Standard of care", (e.standardOfCare ?? []).slice(0, 2).map((x) => `${x.setting}: ${x.approach}`).join(" ")]];
    case "target": return [["Class", e.targetClass?.replace("-", " ") ?? ""], ["Biology", e.biology ?? ""], ["Where found", (e.whereFound ?? []).slice(0, 3).join("; ")]];
    case "trial": return [["Phase", e.phase ?? ""], ["Setting", e.setting ?? ""], ["Result", e.result ?? ""], ["Status", e.status ?? ""]];
    case "term": return [["In one line", e.tldr], ["Detail", first(e.summary, 1)[0] ?? ""]];
    default: return [["In one line", e.tldr]];
  }
}

function tCompare(c: Ctx, a: AskEntityRecord, b: AskEntityRecord): boolean {
  const sa = toSource(a), sb = toSource(b);
  c.b.add(sa, a.entity.tldr, "TL;DR");
  c.b.add(sb, b.entity.tldr, "TL;DR");
  const fa = compareFields(a, c.lookup), fb = compareFields(b, c.lookup);
  for (const [label, va] of fa) {
    const vb = fb.find(([l]) => l === label)?.[1];
    if (va) c.b.add(sa, `${label} of ${short(a)}: ${va}`, label.toLowerCase());
    if (vb) c.b.add(sb, `${label} of ${short(b)}: ${vb}`, label.toLowerCase());
  }
  c.readMore.push({ label: `Compare ${short(a)} and ${short(b)} side by side`, href: `/compare/?ids=${a.entity.id},${b.entity.id}` });
  return true;
}

function tPrognosis(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind !== "cancer") return false;
  // Calm framing: what can be done first, then where the population figures live, never a bare number first.
  c.b.add(s, e.tldr, "TL;DR");
  for (const x of (e.stateOfArt ?? []).slice(0, 2)) c.b.add(s, x, "state of the art");
  const soc = e.standardOfCare?.[0];
  if (soc) c.b.add(s, `${soc.setting}: ${soc.approach}`, "standard of care");
  c.b.add(s, `Outcomes in ${short(r)} depend on stage, subtype and the treatments above, and population statistics describe groups, not any one person; that is why this page starts with what can be done rather than a number.`, "how to read survival figures");
  const site = SURVIVAL_SITES[e.id];
  if (site) c.b.add(s, `Five-year relative survival for "${site.seerLabel}" from SEER, with the period it covers and its caveats, is on the survival page${site.shared ? `. ${cap(site.shared)}` : ""}`, "survival disclosure");
  else c.b.add(s, `No population survival table is available for ${short(r)} in SEER; the survival page lists it as a gap and points to international registries.`, "survival disclosure");
  const prog = c.related.find((x) => x.entity.id === "prognosis");
  if (prog) c.b.add(toSource(prog), prog.entity.tldr, "TL;DR");
  c.readMore.push({ label: "Survival statistics", href: "/survival/" }, { label: `Treatment journeys for ${short(r)}`, href: "/journeys/" });
  return true;
}

function tWho(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  switch (e.kind) {
    case "company": {
      c.b.add(s, companyLine(e), "profile");
      c.b.add(s, e.tldr, "TL;DR");
      const products = (r.neighbours.drug ?? []).slice(0, 8).map((d) => d.name);
      if (products.length) c.b.add(s, `Products on OnCo linked to ${short(r)}: ${list(products)}.`, "linked products");
      for (const x of first(e.summary, 1)) c.b.add(s, x, "summary");
      c.readMore.push({ label: "Company scorecards", href: "/scorecards/" });
      return true;
    }
    case "institution": {
      c.b.add(s, institutionLine(e), "profile");
      c.b.add(s, e.tldr, "TL;DR");
      if (e.programs?.length) c.b.add(s, `Programmes: ${list(e.programs.slice(0, 5))}.`, "programs");
      const people = (r.neighbours.person ?? []).slice(0, 5).map((p) => p.name);
      if (people.length) c.b.add(s, `People on OnCo at ${short(r)}: ${list(people)}.`, "linked people");
      c.readMore.push({ label: "Institutions, mapped and ranked", href: "/institutions/" }, { label: "Second opinion", href: "/second-opinion/" });
      return true;
    }
    case "person": {
      c.b.add(s, typeof e.role === "string" && e.role ? `${e.name}: ${e.role}.` : undefined, "role");
      c.b.add(s, e.tldr, "TL;DR");
      const inst = (r.neighbours.institution ?? []).slice(0, 2).map((i) => i.name);
      if (inst.length) c.b.add(s, `Institutions: ${list(inst)}.`, "linked institutions");
      if (e.specialisms?.length) c.b.add(s, `Specialisms: ${list(e.specialisms.slice(0, 4))}.`, "specialisms");
      return true;
    }
    case "drug": {
      c.b.add(s, e.tldr, "TL;DR");
      const cos = (e.companies ?? []).map((id) => c.lookup(id)).filter((x): x is AskIndexEntry => !!x);
      if (cos.length) c.b.add(s, `${short(r)} is developed or marketed by ${list(cos.map((x) => x.name))}.`, "companies");
      for (const co of cos.slice(0, 2)) { const rec = c.related.find((x) => x.entity.id === co.id); if (rec) c.b.add(toSource(rec), rec.entity.tldr, "TL;DR"); }
      const inst = (r.neighbours.institution ?? []).slice(0, 4).map((i) => i.name);
      if (inst.length) c.b.add(s, `Institutions on OnCo linked to ${short(r)}: ${list(inst)}.`, "linked institutions");
      for (const x of first(e.summary, 1)) c.b.add(s, x, "summary");
      c.readMore.push({ label: "Deals and licences", href: "/deals/" });
      return true;
    }
    case "collection": c.b.add(s, e.tldr, "TL;DR"); c.b.add(s, e.holds, "what it holds"); if (e.url) c.readMore.push({ label: `${e.name} (external)`, href: e.url }); return true;
    case "technology": case "target": case "trial": case "cancer": {
      c.b.add(s, e.tldr, "TL;DR");
      // Companies behind the approved products that use or hit it (second wave), then direct company links.
      const products = c.related.filter((x) => x.entity.kind === "drug");
      const viaProducts = new Map<string, string[]>();
      for (const d of products) for (const id of d.entity.companies ?? []) { const en = c.lookup(id); if (en) viaProducts.set(en.name, [...(viaProducts.get(en.name) ?? []), d.entity.brand?.split(/\s*[\/;]\s*/)[0] || short(d)]); }
      if (viaProducts.size) c.b.add(s, `Companies behind the approved products: ${list([...viaProducts].slice(0, 6).map(([co, ds]) => `${co} (${list([...new Set(ds)].slice(0, 3))})`))}.`, "linked products");
      const cos = (r.neighbours.company ?? []).filter((x) => !viaProducts.has(x.name)).slice(0, 6).map((x) => x.name);
      const inst = (r.neighbours.institution ?? []).slice(0, 4).map((x) => x.name);
      const people = (r.neighbours.person ?? []).slice(0, 4).map((x) => x.name);
      if (e.kind === "trial" && e.sponsor) c.b.add(s, `${e.name} is sponsored by ${e.sponsor}.`, "sponsor");
      if (cos.length) c.b.add(s, `${viaProducts.size ? "Also linked" : "Companies on OnCo linked"} to ${short(r)}: ${list(cos)}.`, "linked companies");
      if (inst.length) c.b.add(s, `Institutions: ${list(inst)}.`, "linked institutions");
      if (people.length) c.b.add(s, `People: ${list(people)}.`, "linked people");
      return c.b.sentences.length > 1;
    }
    default: return false;
  }
}

function tCost(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind !== "drug") return false;
  c.b.add(s, e.tldr, "TL;DR");
  const rows = Array.isArray(e.access) ? e.access : [];
  const pref: string = regionFromQuestion(c.question) ?? c.region ?? "US";
  const ordered = [...rows].sort((a, b) => (a.country === pref ? -1 : b.country === pref ? 1 : 0));
  for (const a of ordered.slice(0, 4)) {
    const parts = [a.listPrice ? `list price ${a.listPrice}` : "", a.reimbursement ? `coverage: ${a.reimbursement}` : "", a.assistance ? `assistance: ${a.assistance}` : "", a.generic ? "generic available" : ""].filter(Boolean);
    if (parts.length) c.b.add(s, `In ${country(a.country) || a.country}: ${parts.join("; ")}.`, "access");
  }
  if (!rows.length) c.b.add(s, `OnCo has no cost or coverage record for ${short(r)} yet; the financial-help page lists manufacturer programmes and national schemes by country.`, "access");
  for (const x of regionalSentences(short(r), e.id, regionFromQuestion(c.question) ?? c.region).slice(0, 1)) c.b.add(s, x, "regional approvals");
  c.readMore.push({ label: "Financial help by country and product", href: "/assistance/" }, { label: "Cost and coverage by drug", href: "/coverage/" });
  return true;
}

/* ------------------------------------------------------------------ templates for the September 2026 kinds */

/**
 * Complementary and supportive approaches: the evidence grade first, in plain words, then the record. An approach graded
 * insufficient, no benefit or harm is never framed as an option, and its "strengths" are not quoted.
 */
function tEvidence(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  const grade = gradeOf(r, c.lookup);
  if (!grade) return false;
  const positive = grade === "strong" || grade === "moderate";
  c.b.add(s, `Evidence grade on OnCo: ${GRADE_META[grade].label.toLowerCase()}. ${GRADE_VERDICT[grade](short(r))}`, "evidence grade");
  c.b.add(s, e.tldr, "TL;DR");
  for (const x of first(e.summary, 2)) c.b.add(s, x, "summary");
  if (positive && e.strengths?.length) c.b.add(s, `What the evidence supports: ${e.strengths.slice(0, 2).join("; ")}.`, "strengths");
  for (const x of (e.limitations ?? []).slice(0, positive ? 1 : 2)) c.b.add(s, `Limitation: ${x}`, "limitations");
  const drugs = (r.neighbours.drug ?? []).slice(0, 4).map((d) => d.name);
  if (grade === "harm" && drugs.length) c.b.add(s, `Treatments on OnCo it interacts with or has been used instead of: ${list(drugs)}.`, "linked products");
  c.readMore.push({ label: "Complementary and supportive approaches", href: "/live/complementary/" });
  if (!positive) c.readMore.push({ label: "Questions to ask your oncologist", href: "/prep/" });
  return true;
}

/**
 * The products linked to a record that the index shows approved in a region. For the US and EU: standard-of-care
 * products first, then the rest. For any other region: the regulator's own approvals first (products approved there
 * but not in the US or EU, which is what "what did China approve" is after), then the standard of care, then the rest.
 */
export function regionDrugs(r: AskEntityRecord, lookup: ComposeInput["lookup"], region: Region): Neighbour[] {
  const linked = (r.neighbours.drug ?? []).filter((d) => lookup(d.id)?.regions?.includes(region));
  const byName = (a: Neighbour, b: Neighbour) => a.name.localeCompare(b.name);
  const key = keyDrugs(r, lookup).filter((d) => linked.some((x) => x.id === d.id));
  const keyIds = new Set(key.map((d) => d.id));
  const rest = linked.filter((d) => !keyIds.has(d.id)).sort(byName);
  if (region === "US" || region === "EU") return [...key, ...rest];
  const isLocal = (d: Neighbour) => { const rs = lookup(d.id)?.regions ?? []; return !rs.includes("US") && !rs.includes("EU"); };
  const local = linked.filter(isLocal).sort(byName);
  const localIds = new Set(local.map((d) => d.id));
  return [...local, ...key.filter((d) => !localIds.has(d.id)), ...rest.filter((d) => !localIds.has(d.id))];
}

/** Products a region's regulator has approved for a cancer, technology or target: from the index regions, with the loaded records for detail. */
function tRegionalApprovals(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "drug") return tApproval(c, r);
  const region = regionFromQuestion(c.question) ?? c.region;
  if (!region) return tApproval(c, r);
  c.b.add(s, e.tldr, "TL;DR");
  const label = regionName(region), reg = regulator(region);
  const all = regionDrugs(r, c.lookup, region);
  const loaded = c.related.filter((x) => x.entity.kind === "drug" && all.some((d) => d.id === x.entity.id));
  const describe = (id: string, name: string): string => {
    const rec = loaded.find((x) => x.entity.id === id);
    const brand = rec?.entity.brand?.split(/\s*[\/;]\s*/)[0]?.replace(/\s*\([^)]*\)\s*/g, " ").trim();
    const ap = [...(rec?.entity.approvals ?? [])].filter((a) => regionCode(a.region) === region).sort((a, b) => a.year - b.year)[0];
    const bits = [brand && brand.toLowerCase() !== name.toLowerCase() ? brand : "", ap ? String(ap.year) : ""].filter(Boolean);
    return bits.length ? `${name} (${bits.join(", ")})` : name;
  };
  if (all.length) {
    const what = e.kind === "cancer" ? `Products for ${short(r)}` : e.kind === "target" ? `Products against ${short(r)}` : `${short(r)} products`;
    c.b.add(s, `${what} approved in ${label} by the ${reg} on OnCo's record: ${list(all.slice(0, 20).map((d) => describe(d.id, d.name)))}${all.length > 20 ? `, and ${all.length - 20} more` : ""}.`, "regional approvals");
    for (const d of loaded.slice(0, 3)) {
      const ds = toSource(d);
      c.b.add(ds, d.entity.tldr, "TL;DR");
      const ap = [...(d.entity.approvals ?? [])].filter((a) => regionCode(a.region) === region).sort((a, b) => a.year - b.year)[0];
      if (ap) c.b.add(ds, `${short(d)}: approved in ${label} in ${ap.year} for ${ap.indication}.`, "approvals");
    }
  } else {
    c.b.add(s, `OnCo has no record of a ${short(r)} product approved in ${label}; absence means unknown, not "not approved".`, "regional approvals");
  }
  c.readMore.push({ label: "Regulatory status by region", href: "/regulatory/regions/" });
  if (region === "CN" || region === "IN") c.readMore.push({ label: `${cap(label.replace(/^the /, ""))}: country page`, href: `/countries/${region.toLowerCase()}/` });
  return true;
}

/** The companies working on a technology, target or cancer; or an investor's portfolio (optionally one YC batch). */
function tCompanies(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "company") {
    if (e.companyType !== "investor") return tWho(c, r);
    c.b.add(s, companyLine(e), "profile");
    c.b.add(s, e.tldr, "TL;DR");
    const portfolio = r.neighbours.company ?? [];
    const batch = batchFromQuestion(c.question);
    if (batch) {
      const chosen = c.related.filter((x) => x.entity.kind === "company" && x.entity.ycBatch === batch);
      if (chosen.length) {
        c.b.add(s, `Y Combinator companies from the ${batchLabel(batch)} batch working on cancer, on OnCo: ${list(chosen.map((x) => x.entity.name))}.`, "portfolio");
        for (const x of chosen.slice(0, 4)) c.b.add(toSource(x), x.entity.tldr, "TL;DR");
      } else {
        c.b.add(s, `OnCo lists no cancer company from the ${batchLabel(batch)} batch; the Y Combinator page lists every batch it covers.`, "portfolio");
      }
    } else if (portfolio.length) {
      const batchOf = (id: string) => c.lookup(id)?.batch;
      const key = (b?: string) => (b ? Number(b.slice(1)) * 10 + ({ W: 1, X: 2, S: 3, F: 4 }[b[0]] ?? 0) : -1);
      const sorted = [...portfolio].sort((a, b) => key(batchOf(b.id)) - key(batchOf(a.id)) || a.name.localeCompare(b.name));
      const shown = sorted.slice(0, 30).map((n) => { const b = batchOf(n.id); return b ? `${n.name} (${b})` : n.name; });
      c.b.add(s, `${portfolio.length} companies on OnCo name ${short(r)} as an investor${sorted.some((n) => batchOf(n.id)) ? ", most recent batch first" : ""}: ${list(shown)}${portfolio.length > 30 ? `, and ${portfolio.length - 30} more on its page` : ""}.`, "portfolio");
      for (const x of c.related.filter((y) => y.entity.kind === "company").slice(0, 2)) c.b.add(toSource(x), x.entity.tldr, "TL;DR");
    } else {
      c.b.add(s, `No company on OnCo names ${short(r)} as an investor yet; portfolios are derived from sourced rounds only.`, "portfolio");
    }
    c.readMore.push({ label: "Investors and their portfolios", href: "/investors/" }, { label: "Oncology startups", href: "/startups/" });
    return true;
  }
  c.b.add(s, e.tldr, "TL;DR");
  const region = regionFromQuestion(c.question);
  const products = c.related.filter((x) => x.entity.kind === "drug");
  const viaProducts = new Map<string, string[]>();
  for (const d of products) for (const id of d.entity.companies ?? []) { const en = c.lookup(id); if (en) viaProducts.set(en.name, [...(viaProducts.get(en.name) ?? []), d.entity.brand?.split(/\s*[\/;]\s*/)[0] || short(d)]); }
  const direct = (r.neighbours.company ?? []).filter((x) => !viaProducts.has(x.name));
  if (viaProducts.size) c.b.add(s, `Companies behind the ${region ? `products approved in ${regionName(region)}` : "approved products"}: ${list([...viaProducts].slice(0, 8).map(([co, ds]) => `${co} (${list([...new Set(ds)].slice(0, 3))})`))}.`, "linked products");
  if (direct.length) c.b.add(s, `${viaProducts.size ? "Also working" : "Companies on OnCo working"} on ${short(r)}: ${list(direct.slice(0, 16).map((x) => x.name))}${direct.length > 16 ? `, and ${direct.length - 16} more on its page` : ""}.`, "linked companies");
  for (const co of c.related.filter((x) => x.entity.kind === "company").slice(0, 3)) c.b.add(toSource(co), co.entity.tldr, "TL;DR");
  if (!viaProducts.size && !direct.length) c.b.add(s, `OnCo links no company to ${short(r)} yet.`, "linked companies");
  c.readMore.push({ label: "Oncology startups", href: "/startups/" }, { label: "Company scorecards", href: "/scorecards/" });
  return true;
}

/** Who backs a company (investors, rounds, acquirer), an investor's portfolio, or the investors behind a field's companies. */
function tInvestors(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  if (e.kind === "company") {
    if (e.companyType === "investor") return tCompanies(c, r);
    const inv = (e.investors ?? []).map((id) => nameOf(c.lookup, id));
    const rounds = [...(e.funding ?? [])].sort((a, b) => a.year - b.year);
    // "Gilead's oncology portfolio": a pharma group with no recorded backers is a who-and-where question.
    if (!inv.length && !rounds.length && !e.acquiredBy && !e.ycBatch) return tWho(c, r);
    c.b.add(s, companyLine(e), "profile");
    c.b.add(s, e.tldr, "TL;DR");
    if (inv.length) c.b.add(s, `Investors in ${short(r)} on OnCo's record: ${list(inv)}.`, "investors");
    if (rounds.length) c.b.add(s, `Financing recorded (sourced rounds only): ${rounds.slice(-4).map((f) => `${f.round} ${f.year}${f.amountUsd ? ` (${fmtUsd(f.amountUsd)})` : ""}`).join("; ")}.`, "funding");
    if (e.acquiredBy) c.b.add(s, `${short(r)} was acquired by ${nameOf(c.lookup, e.acquiredBy)}.`, "acquisition");
    if (e.ycBatch) c.b.add(s, `${short(r)} went through Y Combinator in the ${batchLabel(e.ycBatch)} batch.`, "yc batch");
    for (const x of c.related.filter((y) => y.entity.kind === "company").slice(0, 1)) c.b.add(toSource(x), x.entity.tldr, "TL;DR");
    c.readMore.push({ label: "Investors and their portfolios", href: "/investors/" }, { label: "Deals and licences", href: "/deals/" });
    return true;
  }
  c.b.add(s, e.tldr, "TL;DR");
  const cos = c.related.filter((x) => x.entity.kind === "company");
  const backed = new Map<string, string[]>();
  for (const co of cos) for (const id of co.entity.investors ?? []) { const n = nameOf(c.lookup, id); backed.set(n, [...(backed.get(n) ?? []), co.entity.name]); }
  if (backed.size) {
    const ranked = [...backed].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
    c.b.add(s, `Investors backing ${short(r)} companies on OnCo, most companies first: ${list(ranked.slice(0, 10).map(([n, xs]) => `${n} (${list(xs.slice(0, 3))})`))}.`, "investors");
  } else {
    c.b.add(s, `OnCo records no investor for the ${short(r)} companies it lists; backers appear only when a source states a round.`, "investors");
  }
  const names = (r.neighbours.company ?? []).slice(0, 12).map((x) => x.name);
  if (names.length) c.b.add(s, `Companies on OnCo linked to ${short(r)}: ${list(names)}.`, "linked companies");
  c.readMore.push({ label: "Investors and their portfolios", href: "/investors/" }, { label: "Oncology startups", href: "/startups/" });
  return true;
}

/** A roadmap's steps in reading order: where it came from, today, coming next, further out, what sets the pace. */
function tRoadmap(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  // Several roadmaps may link a front or technology; the one built around it (few fronts, this one among them) wins over a cross-cutting map.
  const fit = (x: AskEntityRecord) => { const re = x.entity; const secs = re.sections ?? []; return (secs.includes(e.id) ? 3 : 0) + ([...(re.technologies ?? []), ...(re.cancers ?? []), ...(re.targets ?? []), ...(re.drugs ?? [])].includes(e.id) ? 2 : 0) - (secs.length > 3 ? 2 : 0); };
  const rm = e.kind === "roadmap" ? r : [...c.related.filter((x) => x.entity.kind === "roadmap")].sort((a, b) => fit(b) - fit(a))[0];
  if (!rm) return false;
  const rs = toSource(rm), re = rm.entity;
  if (rm !== r) c.b.add(s, e.tldr, "TL;DR");
  c.b.add(rs, re.tldr, "TL;DR");
  const steps = re.steps ?? [];
  const pace = steps.filter((x) => /pace|bottleneck/i.test(`${x.era} ${x.title}`));
  const rest = steps.filter((x) => !pace.includes(x));
  const say = (lead: string, st: (typeof steps)[number]) => `${lead} (${st.era}, ${st.title}): ${first(st.description, 1)[0] ?? st.description}`;
  const historic = rest.filter((x) => x.status === "historic");
  if (historic.length) c.b.add(rs, say("Where it came from", historic[historic.length - 1]), "roadmap step");
  for (const st of rest.filter((x) => x.status === "current").slice(0, 2)) c.b.add(rs, say("Today", st), "roadmap step");
  for (const st of rest.filter((x) => x.status === "emerging").slice(0, 2)) c.b.add(rs, say("Coming next", st), "roadmap step");
  for (const st of rest.filter((x) => x.status === "speculative").slice(0, 1)) c.b.add(rs, say("Further out", st), "roadmap step");
  if (pace[0]) c.b.add(rs, `What sets the pace: ${first(pace[0].description, 1)[0] ?? pace[0].description}`, "roadmap step");
  c.readMore.push({ label: "All roadmaps", href: "/roadmap/" });
  return true;
}

/** Where a paper or trial was published, or the journals matched to a topic ("which journals publish oncology nursing research"). */
function tJournals(c: Ctx, r: AskEntityRecord): boolean {
  const s = toSource(r), e = r.entity;
  const others = c.related.filter((x) => x.entity.kind === "journal");
  if (e.kind === "journal") {
    if (!c.topic) return tDefine(c, r);
    const loaded = [r, ...others];
    const one = (en: AskIndexEntry) => {
      const x = loaded.find((y) => y.entity.id === en.id);
      const a = typeof x?.entity.access === "string" ? x.entity.access : undefined;
      return x?.entity.publisher ? `${en.name} (${x.entity.publisher}${a ? `, ${a.replace("-", " ")}` : ""})` : en.name;
    };
    const entries = c.topic.entries.length ? c.topic.entries : loaded.map((x) => c.lookup(x.entity.id)).filter((x): x is AskIndexEntry => !!x);
    c.b.add(s, `Journals on OnCo whose name or scope covers "${c.topic.words}": ${list(entries.slice(0, 12).map(one))}${entries.length > 12 ? `, and ${entries.length - 12} more` : ""}.`, "matched journals");
    for (const x of loaded.slice(0, 3)) c.b.add(toSource(x), x.entity.tldr, "TL;DR");
    c.readMore.push({ label: "Journals", href: "/journals/" });
    return true;
  }
  c.b.add(s, e.tldr, "TL;DR");
  if (e.journal) c.b.add(s, `${short(r)} was published in ${e.journal}${e.year ? ` (${e.year})` : ""}.`, "journal");
  const linked = r.neighbours.journal ?? [];
  if (linked.length) c.b.add(s, `Journal record${linked.length > 1 ? "s" : ""} on OnCo: ${list(linked.slice(0, 4).map((x) => x.name))}.`, "linked journals");
  for (const x of others.slice(0, 2)) c.b.add(toSource(x), x.entity.tldr, "TL;DR");
  if (!e.journal && !linked.length && !others.length) c.b.add(s, `OnCo has no journal linked to ${short(r)} yet.`, "linked journals");
  c.readMore.push({ label: "Journals", href: "/journals/" });
  return true;
}

/* ------------------------------------------------------------------ assembly */

const READ_MORE_LIMIT = 6;

export function followUpsFor(e: { kind: Kind; name: string }, intent: Intent): string[] {
  const n = shortName(e);
  const by: Partial<Record<Kind, Array<[Intent, string]>>> = {
    cancer: [["treatments", `How is ${n} treated?`], ["trials", `What trials are open for ${n}?`], ["biomarkers", `Which biomarkers matter in ${n}?`], ["define", `What is ${n}?`]],
    drug: [["mechanism", `How does ${n} work?`], ["side-effects", `What are the side effects of ${n}?`], ["approval", `Where is ${n} approved?`], ["results", `What did the trials of ${n} show?`], ["who", `Who makes ${n}?`], ["cost", `Is ${n} covered where I live?`]],
    target: [["treatments", `Which drugs target ${n}?`], ["define", `What is ${n}?`], ["trials", `What trials target ${n}?`], ["mechanism", `How does ${n} drive cancer?`]],
    technology: [["mechanism", `How does ${n} work?`], ["approval", `Which ${n} products are approved?`], ["side-effects", `What are the side effects of ${n}?`], ["trials", `What trials use ${n}?`]],
    term: [["define", `What does ${n} mean?`], ["treatments", `Which treatments depend on ${n}?`], ["trials", `Which trials used ${n}?`]],
    trial: [["results", `What did ${n} show?`], ["define", `What is ${n}?`], ["who", `Who ran ${n}?`]],
    company: [["who", `What does ${n} make?`], ["trials", `Which trials is ${n} running?`], ["define", `What is ${n}?`]],
    institution: [["who", `Where is ${n} and what is it known for?`], ["trials", `Which trials is ${n} linked to?`]],
    person: [["who", `Where does ${n} work?`], ["define", `Who is ${n}?`]],
    pathway: [["mechanism", `How does the ${n} pathway work?`], ["treatments", `Which drugs act on ${n}?`], ["define", `What is ${n}?`]],
    paper: [["results", `What did the paper ${n} find?`], ["define", `What is ${n}?`]],
    collection: [["define", `What is ${n}?`], ["who", `Who maintains ${n}?`]],
    bottleneck: [["define", `What is the bottleneck "${n}"?`]],
    journal: [["define", `What is ${n}?`], ["who", `Who publishes ${n}?`], ["journals", `Which key papers appeared in ${n}?`]],
    roadmap: [["roadmap", `Where is ${n} heading?`], ["define", `What is ${n}?`]],
  };
  if (e.kind === "company" && "companyType" in e && (e as { companyType?: string }).companyType === "investor") return [["companies", `What is in ${n}'s portfolio?`], ["define", `What is ${n}?`]].filter(([i]) => i !== intent).map(([, q]) => q);
  return (by[e.kind] ?? [["define", `What is ${n}?`]]).filter(([i]) => i !== intent).slice(0, 3).map(([, q]) => q);
}

/** Kinds whose sentences may be added as detail without being named: the evidence-bearing records. */
const DETAIL_KINDS = new Set<Kind>(["cancer", "drug", "target", "technology", "trial", "term", "paper", "pathway", "company", "institution", "person", "journal", "roadmap"]);

/**
 * Append the best question-matched sentences (extractive), skipping what the template already said. Only records the
 * question named, records linked to the primary, or evidence-bearing kinds qualify, so a stray idea or source
 * collection cannot drift in on a shared word.
 */
function addDetails(c: Ctx, records: AskEntityRecord[], max: number) {
  if (max <= 0) return;
  const named = new Set([c.primary?.entity.id, ...c.secondary.map((r) => r.entity.id), ...c.related.map((r) => r.entity.id)]);
  const linked = new Set(Object.values(c.primary?.neighbours ?? {}).flat().map((n) => n.id));
  // With no template to lean on (general questions), every retrieved record may contribute, as the extractive path always did.
  const pool = c.intent === "general" ? records : records.filter((r) => named.has(r.entity.id) || (DETAIL_KINDS.has(r.entity.kind) && (!c.primary || linked.has(r.entity.id))));
  const recs: AskRecord[] = pool.map((r) => recordFromEntity(r.entity, r.route));
  const a = composeAnswer(c.question, recs, { maxSentences: max + 4, perRecord: 2 });
  let added = 0;
  for (const s of a.sentences) {
    if (added >= max) break;
    if (s.score < 0.42) continue;
    const src = a.sources[s.cite - 1];
    if (c.b.add(src, s.text, s.field, s.score)) added++;
  }
}

/** Build the templated, cited answer. Falls back to sentence retrieval when no template fits. */
export function composeTemplated(input: ComposeInput): AskAnswer {
  const b = new Builder();
  const c: Ctx = { ...input, b, readMore: [] };
  const { primary, intent } = input;
  const named = [primary, ...input.secondary].filter((r): r is AskEntityRecord => !!r);
  const all = dedupe([...named, ...input.related, ...input.retrieved]);

  let template = "extractive";
  let applied = false;
  if (primary) {
    const pick = (fn: (c: Ctx, r: AskEntityRecord) => boolean, name: string) => { if (fn(c, primary)) { template = name; applied = true; } };
    // A graded complementary approach answers with its evidence grade whatever the wording, unless the question is about
    // something else (a comparison, who makes it, cost, trials, the companies or investors around it).
    const GRADE_FIRST = new Set<Intent>(["define", "general", "treatments", "results", "side-effects", "approval", "mechanism", "biomarkers", "prognosis", "evidence", "regional-approvals"]);
    if (GRADE_FIRST.has(intent) && gradeOf(primary, input.lookup)) pick(tEvidence, "evidence");
    if (!applied) switch (intent) {
      case "define": pick(tDefine, "define"); break;
      case "evidence": pick(tEvidence, "evidence"); break;
      case "regional-approvals": pick(tRegionalApprovals, "regional-approvals"); break;
      case "companies": pick(tCompanies, "companies"); break;
      case "investors": pick(tInvestors, "investors"); break;
      case "roadmap": pick(tRoadmap, "roadmap"); break;
      case "journals": pick(tJournals, "journals"); break;
      case "treatments": pick(tTreatments, "treatments"); break;
      case "biomarkers": pick(tBiomarkers, "biomarkers"); break;
      case "approval": pick(tApproval, "approval"); break;
      case "mechanism": pick(tMechanism, "mechanism"); break;
      case "side-effects": pick(tSideEffects, "side-effects"); break;
      case "trials": pick(tTrials, "trials"); break;
      case "results": pick(tResults, "results"); break;
      case "prognosis": pick(tPrognosis, "prognosis"); break;
      case "who": pick(tWho, "who"); break;
      case "cost": pick(tCost, "cost"); break;
      case "compare": { const other = input.secondary[0]; if (other && tCompare(c, primary, other)) { template = "compare"; applied = true; } break; }
      case "general": break;
    }
    // No template fitted: fall back to who-and-where for companies (a portfolio question about a pharma group), else a definition.
    if (!applied && intent !== "general") { b.sentences.length = 0; c.readMore.length = 0; if (primary.entity.kind === "company" && tWho(c, primary)) { template = "who"; applied = true; } else if (tDefine(c, primary)) { template = "define"; applied = true; } }
    if (!applied && intent === "general") { if (b.add(toSource(primary), primary.entity.tldr, "TL;DR")) { template = "orientation"; applied = true; } }
  }

  // The other records the question named, in one plain sentence each.
  for (const r of input.secondary.slice(0, 2)) if (b.sentences.length < 9 && r.entity.id !== primary?.entity.id) b.add(toSource(r), r.entity.tldr, "TL;DR");

  let answer: Answer;
  if (applied) {
    addDetails(c, all, intent === "general" ? 5 : Math.max(0, Math.min(3, 7 - b.sentences.length)));
    const confidence: Answer["confidence"] = input.primaryStrong ? "high" : "medium";
    answer = { sentences: b.sentences, sources: b.sources, confidence, note: input.primaryStrong ? undefined : "No record in your question was recognised by name; the answer is built around the closest record search found. Check the chips above." };
  } else {
    const recs: AskRecord[] = all.map((r) => recordFromEntity(r.entity, r.route));
    answer = composeAnswer(input.question, recs);
    if (!answer.sentences.length && !recs.length) answer.note = "OnCo has no record close to this question. Try naming a cancer, product, target, trial or term.";
  }

  // Read more: named records first, then the pages the template pointed at.
  const readMore: ReadMore[] = [];
  const seenHref = new Set<string>();
  const pushRm = (x: ReadMore) => { if (!seenHref.has(x.href) && readMore.length < READ_MORE_LIMIT) { seenHref.add(x.href); readMore.push(x); } };
  for (const r of named.slice(0, 3)) pushRm({ label: r.entity.name, href: r.route });
  for (const x of c.readMore) pushRm(x);
  for (const s of answer.sources.slice(0, 3)) pushRm({ label: s.name, href: s.route });
  if (/\bask\b/i.test(input.question) && named.some((r) => r.entity.kind === "cancer")) pushRm({ label: "Appointment prep pack", href: "/prep/" });

  const followUps = primary ? followUpsFor(primary.entity, applied ? intent : "general") : [];
  const entities: Source[] = named.map(toSource);
  const alternates: Source[] = input.alternates.filter((e) => !named.some((r) => r.entity.id === e.id)).slice(0, 6).map(entrySource);
  const method = [
    `Rules, not a model: the wording was read as “${INTENT_LABEL[intent]}”`,
    named.length ? `${named.length} record${named.length === 1 ? "" : "s"} resolved by name${input.resolvedNotes.length ? ` (${input.resolvedNotes.slice(0, 3).join("; ")})` : ""}` : "no record was named, so the closest records from word and concept search were used",
    applied ? `the “${template}” template filled sentences from record fields` : "sentences were copied verbatim from the closest records",
    input.pair ? `matched the curated question “${input.pair.question}” (${input.pair.source})` : "",
    "every sentence cites the record it came from; nothing is generated",
  ].filter(Boolean).join("; ") + ".";

  return { ...answer, intent, template, entities, alternates, followUps, readMore, method, pair: input.pair };
}

function dedupe(records: AskEntityRecord[]): AskEntityRecord[] {
  const seen = new Set<string>();
  return records.filter((r) => { if (seen.has(r.entity.id)) return false; seen.add(r.entity.id); return true; });
}

/**
 * Data dictionary: the Zod schema walked with `z.toJSONSchema` (Zod 4) and rendered as kind, field,
 * type, requiredness, default and description, with one real example record per kind.
 *
 * Descriptions are the JSDoc comments in src/lib/schema.ts, read from the source at build time so the
 * schema file stays the single source of truth. Rendered at /schema/.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { graph } from "./graph";
import {
  BiomarkerSchema, BottleneckSchema, CancerSchema, CollectionSchema, CompanySchema, DrugSchema, IdeaSchema, InstitutionSchema, JournalSchema, KIND_META, KINDS, PairingSchema, PaperSchema, PathwaySchema, PersonSchema, RoadmapSchema, SectionSchema, STATUSES, TargetSchema, TechnologySchema, TermSchema, TrialSchema, YearSchema,
  type Entity, type Kind,
} from "./schema";

const SCHEMAS: Record<Kind, z.ZodType> = {
  cancer: CancerSchema, section: SectionSchema, technology: TechnologySchema, target: TargetSchema, drug: DrugSchema, company: CompanySchema, institution: InstitutionSchema, pathway: PathwaySchema, term: TermSchema, trial: TrialSchema, pairing: PairingSchema, roadmap: RoadmapSchema, idea: IdeaSchema, collection: CollectionSchema, person: PersonSchema, bottleneck: BottleneckSchema, paper: PaperSchema, journal: JournalSchema, biomarker: BiomarkerSchema, year: YearSchema,
};

export type FieldDoc = { name: string; type: string; required: boolean; default?: string; description?: string; /** Nested fields for object or array-of-object types. */ children?: FieldDoc[] };
export type KindDoc = { kind: Kind; label: string; plural: string; route: string; blurb: string; fields: FieldDoc[]; example: Record<string, unknown> | null; exampleId: string | null; count: number };
export type SchemaDocs = { base: FieldDoc[]; kinds: KindDoc[]; statuses: readonly string[]; idPattern: string; datePattern: string };

type JsonSchema = {
  type?: string | string[]; const?: unknown; enum?: unknown[]; pattern?: string; format?: string; minLength?: number; minimum?: number; maximum?: number; minItems?: number; maxItems?: number;
  items?: JsonSchema | false; prefixItems?: JsonSchema[]; properties?: Record<string, JsonSchema>; required?: string[]; anyOf?: JsonSchema[]; oneOf?: JsonSchema[]; default?: unknown; additionalProperties?: unknown;
};

const ID_PATTERN = "^[a-z0-9]+(-[a-z0-9]+)*$";
const DATE_PATTERN = "^\\d{4}-\\d{2}-\\d{2}$";

/** Human-readable type for a JSON Schema node. */
export function typeOf(s: JsonSchema): string {
  if (s.const !== undefined) return `"${String(s.const)}"`;
  if (s.enum) return s.enum.map((v) => `"${String(v)}"`).join(" | ");
  if (s.anyOf || s.oneOf) return (s.anyOf ?? s.oneOf ?? []).map(typeOf).join(" | ");
  if (s.prefixItems) return `[${s.prefixItems.map(typeOf).join(", ")}]`;
  const t = Array.isArray(s.type) ? s.type.join(" | ") : s.type;
  if (t === "array") return `${s.items ?typeOf(s.items) : "unknown"}[]`;
  if (t === "object") return s.properties ? `{ ${Object.keys(s.properties).join(", ")} }` : "object";
  if (t === "string") {
    if (s.pattern === ID_PATTERN) return "entity id";
    if (s.pattern === DATE_PATTERN) return "date (YYYY-MM-DD)";
    if (s.format === "uri") return "URL";
    if (s.minLength === 2 && (s as { maxLength?: number }).maxLength === 2) return "ISO 3166 country code";
    return "string";
  }
  if (t === "integer") return "integer";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return t ?? "unknown";
}

function childrenOf(s: JsonSchema, describe: (name: string) => string | undefined): FieldDoc[] | undefined {
  const obj = s.type === "array" && s.items ?s.items : s;
  if (obj.type !== "object" || !obj.properties) return undefined;
  const req = new Set(obj.required ?? []);
  return Object.entries(obj.properties).map(([name, node]) => ({ name, type: typeOf(node), required: req.has(name), default: node.default !== undefined ? JSON.stringify(node.default) : undefined, description: describe(name) }));
}

/**
 * Read `/** ... *\/` comments that precede a `field:` line in src/lib/schema.ts, per schema block, so a
 * field like `access` can mean one thing on drugs and another on journals.
 */
export function readDescriptions(source: string): { base: Record<string, string>; byKind: Partial<Record<Kind, Record<string, string>>> } {
  const blocks = new Map<string, string>();
  const re = /(?:const Base = z\.object\(\{|export const (\w+)Schema = Base\.extend\(\{)([\s\S]*?)\n\}\);/g;
  for (const m of source.matchAll(re)) blocks.set(m[1] ? m[1].toLowerCase() : "base", m[2]);
  const parse = (block: string): Record<string, string> => {
    const out: Record<string, string> = {};
    const lines = block.split("\n");
    let pending: string | null = null;
    for (const raw of lines) {
      const line = raw.trim();
      const doc = /^\/\*\*\s*(.*?)\s*\*\/$/.exec(line);
      if (doc) { pending = doc[1]; continue; }
      const field = /^([a-zA-Z_][a-zA-Z0-9_]*):/.exec(line);
      if (field) { if (pending) out[field[1]] = pending; pending = null; continue; }
      if (line && !line.startsWith("//") && !line.startsWith("*")) pending = null;
    }
    return out;
  };
  const base = parse(blocks.get("base") ?? "");
  const byKind: Partial<Record<Kind, Record<string, string>>> = {};
  for (const k of KINDS) byKind[k] = parse(blocks.get(k) ?? "");
  return { base, byKind };
}

/** Fixed descriptions for base fields whose comment in schema.ts sits in the file header rather than on the field. */
const BASE_FALLBACK: Record<string, string> = {
  id: "Stable kebab-case identifier; also the URL slug.",
  kind: "Which of the 19 kinds this record is.",
  name: "Display name.",
  aka: "Other names, brands and abbreviations; used by search and hover-linking.",
  tldr: "One or two plain sentences for a non-technical reader. No jargon.",
  summary: "Technical summary for a clinician, scientist or engineer. Paragraphs separated by blank lines.",
  status: "Stage or state, from the shared status list.",
  asOf: "Date the facts were last checked.",
  wikipedia: "Wikipedia article for the concept.",
  links: "External sources: label and URL.",
  tags: "Free-form tags (for example \"spike\", \"failure\").",
};

/** Descriptions for kind fields that carry no JSDoc in schema.ts. These document the code, not the world; add a comment in schema.ts to override. */
const KIND_FALLBACK: Record<string, string> = {
  kind: "Discriminator; fixed per kind.",
  group: "Organ system or ICD-O grouping used to cluster cancers (breast, lung, blood).",
  burden: "How common the cancer is, in words.",
  subtypes: "Named subtypes a clinician distinguishes.",
  biomarkers: "Biomarkers tested at diagnosis or relapse.",
  standardOfCare: "One row per clinical setting: the approach, the products it references, and the guideline mapping.",
  history: "Dated milestones for the timeline, each pointing at the records it concerns.",
  pipeline: "Ids of products, technologies, trials and ideas that could change practice.",
  openProblems: "What is still unsolved, one paragraph each.",
  stateOfArt: "What the best care looks like today, one paragraph per point.",
  prognosis: "Plain-English outlook: what moves survival and the headline population figures, with sources. Shown behind the survival disclosure.",
  order: "Position of the front in the navigation.",
  icon: "Icon id for the front.",
  principle: "How the technology works, for a technical reader.",
  generation: "Which generation of the idea this is, if the field talks in generations.",
  strengths: "What it does well.",
  limitations: "Where it falls short.",
  since: "Year first used in humans or first approved, if meaningful.",
  symbol: "Gene symbol or protein name.",
  biology: "What the target does in normal and cancer cells.",
  whereFound: "Cancers and contexts where the target is expressed or altered.",
  targetClass: "Broad class used for filtering.",
  prevalence: "Fraction of each cancer carrying the target, sourced.",
  brand: "Brand name where marketed.",
  code: "Development code(s), comma separated.",
  payload: "Cytotoxic payload, for ADCs.",
  linker: "Linker chemistry, for ADCs.",
  mechanism: "One or two sentences on how it works.",
  approvals: "Regulatory approvals: region, year, indication.",
  dosing: "Route, schedule, modifications and monitoring, from the label.",
  regulatoryEvents: "Dated designations, filings, decisions and label changes. `accelerated-approval`, `conversion` and `withdrawal` are the accelerated pathway one indication at a time: a grant and the event that closed it share the same `indication` text, and a grant with neither is still open.",
  indication: "The indication the row is about, in the source's own words.",
  firstDescribed: "Year the target was first described in the literature, from a source that says so; never inferred from the earliest paper OnCo holds.",
  firstDescribedBasis: "What was dated: the earliest sequence paper UniProt cites, or a hand-sourced first description.",
  firstDescribedNote: "The paper the year comes from, named.",
  firstDescribedSource: "Where the year was read.",
  started: "Date the study started, as the registry states it (YYYY, YYYY-MM or YYYY-MM-DD).",
  startedType: "Whether the registry marks the start date as actual or estimated.",
  hq: "Headquarters city.",
  country: "ISO 3166-1 alpha-2 country code.",
  companyType: "Broad type used for filtering and the landscape grid; `investor` marks a fund or corporate venture arm whose portfolio is derived from backlinks; `cooperative-group` marks an academic trials group or public trial sponsor with no products of its own.",
  ycBatch: "Y Combinator batch code such as W21 or S24 (X = Spring, F = Fall).",
  investors: "Ids of investor records that have backed the company; each investor page lists its portfolio from these.",
  funding: "Sourced financing rounds: round name, year, amount in US dollars only when the source states it, and the source URL.",
  acquiredBy: "Company id of the acquirer, when the company has been bought.",
  website: "Official website.",
  ticker: "Stock ticker with exchange suffix where needed.",
  founded: "Year founded.",
  city: "City.",
  lat: "Latitude, for the map.",
  lng: "Longitude, for the map.",
  institutionType: "Broad type used for filtering.",
  programs: "Named programmes or centres of excellence.",
  analogy: "Plain-language analogy for the pathway.",
  nodes: "Diagram nodes with positions; a node may point at a target record.",
  edges: "Diagram edges: activates or inhibits.",
  interventions: "How drugs attack the pathway.",
  category: "Glossary category (Endpoints, Biomarkers, Trials, ...).",
  nct: "Primary registry id: ClinicalTrials.gov NCT number, or ISRCTN, ACTRN or NTR.",
  phase: "Trial phase.",
  setting: "Disease setting and line of therapy.",
  sponsor: "Lead sponsor.",
  result: "Headline result in one or two sentences, with numbers only if sourced.",
  yearReported: "Year the primary result was reported.",
  enrolled: "Participants enrolled.",
  a: "First member of the pair (entity id).",
  b: "Second member of the pair (entity id).",
  rationale: "Why the pair works better than either alone, or why it is a caution.",
  evidence: "The evidence for the pairing, with trial names.",
  pairingType: "Combination, sequence, diagnostic-therapeutic, platform or caution.",
  steps: "Ordered eras from history to horizon, each with a status.",
  hypothesis: "The claim, in one sentence.",
  test: "What experiment or trial would confirm or kill it.",
  maturity: "How far the idea has been tested.",
  actor: "Who would have to act.",
  cost: "Rough cost to try.",
  horizonYears: "Years to first evidence of impact.",
  journal: "Journal name as printed.",
  year: "Publication year.",
  doi: "Digital object identifier.",
  pmid: "PubMed id.",
  authors: "Author list, abbreviated.",
  paperType: "Study design.",
  findings: "Key results, one per item, with the numbers.",
  whatItMeans: "Plain English: what this changes for patients, clinicians or the field.",
  caveats: "Limitations, open questions, disputes.",
  changedPractice: "Whether it changed guidelines or approvals.",
  participants: "Participants, for trials and cohorts.",
  publisher: "Publisher.",
  url: "Official URL.",
  issn: "ISSN.",
  scope: "Broad scope.",
  society: "Owning or affiliated society.",
  holds: "What the collection or database holds.",
  license: "Licence the data are released under.",
  maintainer: "Who maintains it.",
  role: "Current role and affiliation in one line.",
  institutionId: "Primary institution (entity id).",
  specialisms: "Specialisms, for filtering.",
  profiles: "Professional links: profile, lab, ORCID, PubMed.",
  papers: "Selected publications.",
  orcid: "ORCID id.",
  hIndex: "h-index, if known and sourced.",
  stage: "Bottlenecks: where in the pipeline it bites. Companies: where the company is in its life (startup, growth, public, private-large, acquired, defunct); listed companies default to public.",
  severity: "How much it slows the whole effort.",
  metrics: "Numbers that show the size of the problem, each with a source.",
  causes: "Root causes, one per item.",
  currentEfforts: "What is already being tried and by whom.",
  successLooksLike: "What would count as the bottleneck being broken.",
};

/** Trim a record for display: arrays to three items, strings to 160 characters. */
export function exampleOf(e: Entity): Record<string, unknown> {
  const trim = (v: unknown): unknown => {
    if (typeof v === "string") return v.length > 160 ? v.slice(0, 157) + "..." : v;
    if (Array.isArray(v)) return v.slice(0, 3).map(trim);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, trim(x)]));
    return v;
  };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(e)) {
    if (Array.isArray(v) && v.length === 0) continue; // defaults add nothing to an example
    out[k] = trim(v);
  }
  return out;
}

let cached: SchemaDocs | null = null;

export function schemaDocs(): SchemaDocs {
  if (cached) return cached;
  const srcPath = join(process.cwd(), "src", "lib", "schema.ts");
  const descriptions = readDescriptions(existsSync(srcPath) ? readFileSync(srcPath, "utf8") : "");
  const g = graph();
  const perKind = new Map<Kind, JsonSchema>();
  for (const k of KINDS) perKind.set(k, z.toJSONSchema(SCHEMAS[k], { io: "input", unrepresentable: "any" }) as JsonSchema);

  // Base fields are the properties every kind shares.
  const propSets = [...perKind.values()].map((s) => new Set(Object.keys(s.properties ?? {})));
  const baseNames = [...propSets[0]].filter((n) => propSets.every((s) => s.has(n)));
  const first = perKind.get(KINDS[0])!;
  const baseReq = new Set(first.required ?? []);
  const describeBase = (name: string) => descriptions.base[name] ?? BASE_FALLBACK[name];
  const base: FieldDoc[] = baseNames.filter((n) => n !== "kind").map((name) => {
    const node = first.properties![name];
    return { name, type: typeOf(node), required: baseReq.has(name), default: node.default !== undefined ? JSON.stringify(node.default) : undefined, description: describeBase(name), children: childrenOf(node, () => undefined) };
  });

  const kinds: KindDoc[] = KINDS.map((kind) => {
    const s = perKind.get(kind)!;
    const req = new Set(s.required ?? []);
    const own = descriptions.byKind[kind] ?? {};
    const describe = (name: string) => own[name] ?? KIND_FALLBACK[name];
    const fields: FieldDoc[] = Object.entries(s.properties ?? {}).filter(([n]) => !baseNames.includes(n) || n === "kind").map(([name, node]) => ({ name, type: typeOf(node), required: req.has(name), default: node.default !== undefined ? JSON.stringify(node.default) : undefined, description: describe(name), children: childrenOf(node, () => undefined) }));
    const list = g.kind(kind);
    const example = list.length ? list.reduce((best, e) => (g.degree(e.id) > g.degree(best.id) ? e : best), list[0]) : null;
    const meta = KIND_META[kind];
    return { kind, label: meta.label, plural: meta.plural, route: meta.route, blurb: meta.blurb, fields, example: example ? exampleOf(example) : null, exampleId: example?.id ?? null, count: list.length };
  });

  cached = { base, kinds, statuses: STATUSES, idPattern: ID_PATTERN, datePattern: DATE_PATTERN };
  return cached;
}

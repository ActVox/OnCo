/**
 * Tone: the corpus does not tell a reader how to feel about their own cancer.
 *
 * The rule, and the reasoning behind it, are in docs/HOUSE-STYLE.md. In short: the numbers stay and the
 * adjectives go. "Five-year survival is 8 per cent (SEER 22, 2014 to 2020)" is honest and usable; "a dismal
 * prognosis" is neither. A word like "relentless" adds nothing a reader can act on and takes something from
 * them, so it is not ours to use.
 *
 * What this test does NOT touch, by construction rather than by a list of ids:
 *
 *  1. **Other people's words.** `QUOTED_KEYS` names the fields that hold text OnCo did not write: the title of
 *     a paper or a registry trial (`name`, `title`, `aka`, `setting`), the label on a link to one (`label`), a
 *     verbatim guideline or source statement (`quote`, `quotes`, `text` inside a quote, `sourceLabel`), and the
 *     author and journal strings. A paper called "... a distinct entity with dismal prognosis" keeps its title.
 *  2. **Ingested abstracts.** A paper record written by one of the Europe PMC fetchers carries the machine tag
 *     `europepmc-ingest` and reproduces the abstract in `summary`. That summary is a quotation and is skipped.
 *     Everything else on the same record (the hand-written `whatItMeans`, `caveats`, `findings`) is ours and is
 *     checked. Rewriting a quotation to be kinder would be a worse offence than the one this test prevents.
 *  3. **Anything inside quotation marks.** Quoted spans are removed from a string before it is matched, so a
 *     sentence that quotes a charity, a label or a guideline in the middle of OnCo's own prose is safe.
 *  4. **Ids.** Strings that are bare kebab-case ids (relationship arrays, `refs`) are not prose.
 *
 * `TONE_EXCEPTIONS` records the handful of places where a listed word survives, each with its reason. An
 * exception is a judgement someone made once and wrote down; it is not a way of deferring the work.
 */
import { describe, expect, it } from "vitest";
import { graph } from "./graph";
import { DECISION_TOOLS } from "./decision-tools";
import { simple } from "@/data/simple";
import { questions } from "@/data/questions";
import { hairQuestions } from "@/data/hair-questions";
import { redFlagSets, GENERAL_RED_FLAGS } from "@/data/red-flags";
import { FIRST_60_DAYS_CHECKLISTS } from "@/data/first-60-days-checklists";

const g = graph();

/**
 * The vocabulary. Every one of these is an adjective of doom, a battle metaphor, or a phrase that forecloses:
 * it states a verdict where a figure would do, or tells the reader there is nothing left. Where the fact behind
 * the word is real it is still ours to state plainly: what the survival is, what the treatment does, what was
 * true before a treatment existed.
 */
const FATALISM: [string, RegExp][] = [
  ["relentless", /\brelentless(ly)?\b/i],
  ["merciless", /\bmerciless(ly)?\b/i],
  ["unforgiving", /\bunforgiving\b/i],
  ["inexorable", /\binexorabl[ey]\b/i],
  ["dismal", /\bdismal(ly)?\b/i],
  ["bleak", /\bbleak(er|est|ly|ness)?\b/i],
  ["abysmal", /\babysmal\b/i],
  ["woeful", /\bwoeful(ly)?\b/i],
  // Lower case only: GRIM-19 is a gene and GRIM is a statistics tool.
  ["grim", /\bgrim(mer|mest|ly)?\b/],
  ["uniformly fatal", /\b(uniformly|invariably|universally|inevitably) (fatal|lethal)\b/i],
  ["death sentence", /\bdeath sentence\b/i],
  ["doomed", /\bdoomed\b/i],
  ["hopeless", /\bhopeless(ly|ness)?\b/i],
  ["no hope", /\bno hope\b/i],
  ["nothing can be done", /\bnothing (more |else )?(can|could) be done\b/i],
  ["ravaged", /\brava(ge|ges|ged|ging)\b/i],
  ["devastating", /\bdevastating(ly)?\b/i],
  ["succumbed", /\bsuccumb(s|ed|ing)?\b/i],
  ["lost the battle", /\b(lost|losing) (his|her|their|the) (battle|fight)\b/i],
  ["fought bravely", /\b(fought|battled) (bravely|valiantly|courageously)\b/i],
  ["brave battle", /\bbrave (battle|fight|struggle)\b/i],
  ["cancer victim", /\b(cancer victims?|victims? of (cancer|the disease))\b/i],
  ["barely works", /\bbarely (works|helps|does anything)\b/i],
  ["untreatable", /\buntreatable\b/i],
];

/**
 * The second tier: a verdict where the figure belongs. "Poor prognosis" is the phrase the corpus reached for
 * most often; it tells the reader to feel bad and gives them nothing. It is allowed in a technical field, where
 * it is the standard way to report what a marker predicts, and where a classification is named after it (the
 * IGCCCG good, intermediate and poor prognosis groups). It is not allowed in the fields a frightened person
 * reads first, listed in `PLAIN_FIELDS`: there, name the survival.
 */
const VERDICTS: [string, RegExp][] = [
  ["poor prognosis", /\bpoor(er|est)? prognosis\b/i],
  ["poor outlook", /\bpoor(er|est)? (outlook|survival)\b/i],
];
const PLAIN_FIELDS = new Set(["tldr", "simple", "burden", "meaning", "item", "why", "question", "action", "openProblems"]);

/** Fields that hold text OnCo did not write: titles, labels, verbatim quotes, author and journal strings. */
const QUOTED_KEYS = new Set(["name", "aka", "title", "label", "sourceLabel", "quote", "quotes", "text", "authors", "journal", "expected", "setting", "url", "href", "doi", "pmid", "nct"]);

/** Records whose `summary` reproduces a fetched abstract rather than an editor's prose. */
const INGEST_TAGS = ["europepmc-ingest"];

/** Straight and curly quoted spans, removed before matching: what is inside them is someone else's. */
const stripQuoted = (s: string) => s.replace(/"[^"]*"/g, " ").replace(/[“][^”]*[”]/g, " ").replace(/'[^']{4,}'/g, " ");

const isId = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);

/**
 * Every place a listed word survives, with the reason. Keyed `<record or surface id>: <path>: <word>`.
 */
const TONE_EXCEPTIONS = new Map<string, string>([
  [
    "paper-bclc-2022-reig-j-hepatol-2022: summary: untreatable",
    "\"Untreatable progression\" is a defined term in the Barcelona Clinic Liver Cancer staging system, not a description of a person's outlook.",
  ],
  [
    "tool:colorectal-adjuvant-chemotherapy: cards[9].meaning: untreatable",
    "The sentence says low anterior resection syndrome is \"neither inevitable nor untreatable\": the word is used to deny the thing this rule is against, and NICE NG151 is cited for the treatments.",
  ],
  [
    "paper-igcccg-classification-jco-1997: tldr: poor prognosis",
    "Names the IGCCCG good, intermediate and poor prognosis groups, which is what the classification calls them; the TL;DR gives the five-year survival of each group.",
  ],
]);

type Finding = { key: string; excerpt: string };

function walk(value: unknown, key: string, path: string, opts: { skipSummary: boolean; plainOnly: boolean }, out: Finding[]): void {
  if (typeof value === "string") {
    if (QUOTED_KEYS.has(key)) return;
    if (opts.skipSummary && key === "summary") return;
    if (isId(value)) return;
    const rules = opts.plainOnly ? VERDICTS : [...FATALISM, ...(PLAIN_FIELDS.has(key) ? VERDICTS : [])];
    const text = stripQuoted(value);
    for (const [word, re] of rules) {
      const m = re.exec(text);
      if (!m) continue;
      out.push({ key: `${path}: ${word}`, excerpt: value.slice(Math.max(0, m.index - 60), m.index + 90) });
    }
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, key, `${path}[${i}]`, opts, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, k, path === "" ? k : `${path}.${k}`, opts, out);
  }
}

/** Walks one surface and returns the findings that are not recorded exceptions. */
function findingsFor(id: string, value: unknown, skipSummary = false): string[] {
  const out: Finding[] = [];
  walk(value, "", "", { skipSummary, plainOnly: false }, out);
  return out.filter((f) => !TONE_EXCEPTIONS.has(`${id}: ${f.key}`)).map((f) => `${id}: ${f.key} -> "${f.excerpt.trim()}"`);
}

describe("tone", () => {
  it("no record describes a cancer in words that only tell the reader how to feel", () => {
    const failures: string[] = [];
    for (const e of g.entities) {
      const ingested = e.tags.some((t) => INGEST_TAGS.includes(t));
      failures.push(...findingsFor(e.id, e, ingested));
    }
    expect(failures).toEqual([]);
  });

  it("the plain-language layer, the questions, the red flags, the checklists and the decision tools are clean", () => {
    const failures: string[] = [];
    for (const [id, text] of Object.entries(simple)) failures.push(...findingsFor(`simple:${id}`, { simple: text }));
    for (const [id, rows] of Object.entries(questions)) failures.push(...findingsFor(`questions:${id}`, rows));
    failures.push(...findingsFor("questions:hair", hairQuestions));
    for (const set of [GENERAL_RED_FLAGS, ...redFlagSets]) failures.push(...findingsFor(`red-flags:${set.id}`, set));
    for (const [id, items] of Object.entries(FIRST_60_DAYS_CHECKLISTS)) failures.push(...findingsFor(`first-60-days:${id}`, items));
    for (const tool of DECISION_TOOLS) failures.push(...findingsFor(`tool:${tool.id}`, tool));
    expect(failures).toEqual([]);
  });

  it("the fields a reader meets first give the survival, not a verdict on it", () => {
    const failures: string[] = [];
    for (const e of g.entities) {
      const found: Finding[] = [];
      for (const key of PLAIN_FIELDS) {
        const value = (e as unknown as Record<string, unknown>)[key];
        if (value === undefined) continue;
        walk(value, key, key, { skipSummary: false, plainOnly: true }, found);
      }
      for (const f of found) {
        if (!TONE_EXCEPTIONS.has(`${e.id}: ${f.key}`)) failures.push(`${e.id}: ${f.key} -> "${f.excerpt.trim()}"`);
      }
    }
    expect(failures).toEqual([]);
  });

  it("records an exception only with a reason", () => {
    for (const [key, reason] of TONE_EXCEPTIONS) expect(reason.length, key).toBeGreaterThan(40);
  });
});

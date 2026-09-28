/**
 * Emits the corpus as static files under public/api/v1/ (and the Atom feeds under public/feeds/).
 * Run before `next build` (see package.json). Output is gitignored.
 *
 *   all.json            every entity plus an incoming-link map          all.ndjson   one entity per line
 *   <plural>.json       entities of one kind                             <plural>.csv the same, flattened
 *   entities/<id>.json  one entity with its neighbours                   schema.json  JSON Schema of an entity
 *   search.json, ranking.json, benchmark.json, meta.json                 feeds: see scripts/build-feeds.ts
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { graph } from "../src/lib/graph";
import { EntitySchema, KIND_META, KINDS, routeFor } from "../src/lib/schema";
import { siteSearchDocs } from "../src/lib/search-index";
import { rankInstitutions } from "../src/lib/ranking";
import { benchmark } from "../src/data/benchmark";
import { OPEN_SOURCE_GENERATED, OPEN_SOURCE_SKIPPED, openSourceProjects } from "../src/data/open-source";
import { SOFTWARE_GENERATED, SOFTWARE_SKIPPED, SOFTWARE_UNVERIFIED, softwareProducts } from "../src/data/software";
import { flattenForCsv, toCsv, toNdjson, EXPORT_LICENCE } from "../src/lib/csv";
import { buildFeeds } from "./build-feeds";
import { apiFiles, FEEDS } from "./api-layout";
import { buildSituationData } from "../src/lib/for-me-situation-data";
import { myCancerList } from "../src/lib/my-cancer-list";
import { forMeRelated } from "../src/lib/for-me-related";
import { matchRows } from "../src/lib/biomarker-match-rows";
import { navigatorCancerFile, navigatorLines } from "../src/lib/navigator-data";
import { writeExploreFiles } from "./build-explore";
import { writeIdeaRankingFiles } from "./build-idea-rankings";
import { writeTableFiles } from "./build-tables";
import { writeEngineFiles } from "./build-engine";
import { explainedFileFor, explainedGroups } from "../src/lib/explained-data";
import { allTags, relatedTags } from "../src/lib/tags";
import { spotlightFile } from "../src/lib/spotlight";
import { kindGraphFile } from "../src/lib/kind-graph";
import { UK_PATHWAYS, ukPathwayJson } from "../src/lib/uk-pathway";
import { CANCER_GEOGRAPHIES, geographyJson } from "../src/lib/cancer-geography";
import { sectionsJson } from "../src/lib/record-sections";
import { roadmapEraFile } from "../src/lib/roadmap-eras";
import { dossierJson } from "../src/components/Dossier";

const out = join(process.cwd(), "public", "api", "v1");
// Clear the previous build, keeping rdf/: scripts/build-triples.ts rewrites only the Turtle files whose content changed
// (about 11,000 small files) and removes stale ones itself, so incremental builds do not touch them all.
if (existsSync(out)) for (const name of readdirSync(out)) if (name !== "rdf") rmSync(join(out, name), { recursive: true, force: true });
mkdirSync(join(out, "entities"), { recursive: true });
mkdirSync(join(out, "for-me"), { recursive: true });

const g = graph();
const write = (name: string, data: unknown) => writeFileSync(join(out, name), JSON.stringify(data, null, 0));
const writeText = (name: string, text: string) => writeFileSync(join(out, name), text);

const incoming: Record<string, Array<{ id: string; kind: string }>> = {};
for (const e of g.entities) {
  const groups = g.incoming(e.id);
  incoming[e.id] = [...groups.values()].flat().map((x) => ({ id: x.id, kind: x.kind }));
}

write("all.json", { entities: g.entities, incoming });
writeText("all.ndjson", toNdjson(g.entities.map((e) => ({ ...e, route: routeFor(e) }))));
write("search.json", siteSearchDocs());
for (const k of KINDS) {
  const list = g.kind(k);
  write(`${KIND_META[k].plural}.json`, list);
  // CSV: one row per entity, scalars as-is, arrays of scalars joined with "; ", nested records as JSON; column order is the union of keys in first-seen order.
  const rows = list.map((e) => flattenForCsv({ ...(e as unknown as Record<string, unknown>), route: routeFor(e) }));
  writeText(`${KIND_META[k].plural}.csv`, toCsv(rows));
}
for (const e of g.entities) {
  const neighbours: Record<string, Array<{ id: string; kind: string; name: string; route: string }>> = {};
  for (const [k, list] of g.neighbours(e.id)) neighbours[k] = list.map((x) => ({ id: x.id, kind: x.kind, name: x.name, route: routeFor(x) }));
  write(`entities/${e.id}.json`, { entity: e, route: routeFor(e), neighbours });
}
// For me situation view (roadmap item 101): one file per cancer, fetched by the browser when the reader opens the situation form.
for (const c of g.kind("cancer")) write(`for-me/${c.id}.json`, buildSituationData(c, g));
// For me picker: everything touching one cancer, fetched when the reader chooses it (the page used to carry all 328 cancers' lists, 9.7 MB).
for (const c of g.kind("cancer")) write(`for-me/${c.id}.related.json`, forMeRelated(g, c));
// UK and NHS layer: one file per cancer with a hand-written pathway (src/lib/uk-pathway.ts), the companion of /cancers/<id>/uk/.
for (const p of UK_PATHWAYS) { mkdirSync(join(out, "cancers", p.cancerId), { recursive: true }); write(`cancers/${p.cancerId}/uk.json`, ukPathwayJson(p)); }
// Geography layer: one file per cancer with a hand-written geography (src/lib/cancer-geography.ts) and its GLOBOCAN country table by sex, the companion of /cancers/<id>/#geography.
for (const geo of CANCER_GEOGRAPHIES) { mkdirSync(join(out, "cancers", geo.cancerId), { recursive: true }); write(`cancers/${geo.cancerId}/geography.json`, geographyJson(geo)); }
// Section plan: one file per cancer listing its ten sections with placement (inline on the hub or own page), routes, anchors and counts (src/lib/record-sections.ts).
for (const c of g.kind("cancer")) { mkdirSync(join(out, "cancers", c.id), { recursive: true }); write(`cancers/${c.id}/sections.json`, sectionsJson(c, g)); }
// Explore: every row of one kind per file; the page carries only the first rows of each kind (src/lib/explore-kinds.ts).
const explore = writeExploreFiles(out);
// Idea rankings: every row of one view per file; the page carries only the first rows of each view (src/lib/idea-rankings-views.ts).
const rankings = writeIdeaRankingFiles(out);
// Paged hand-written tables (evidence, China trials, university output, audit, pathway nodes, dossier trials): every row
// of one table per file; the page carries only the first rows (src/lib/static-tables.ts).
const tables = writeTableFiles(out);
// Open drug engine: one file per format (medicines taken apart, grid cells with states and evidence) plus an index (src/lib/modular.ts).
const engineFiles = writeEngineFiles(out);
// Tags: one file per public tag (the companion of /tagged/<slug>/) and an index of every tag (src/lib/tags.ts).
mkdirSync(join(out, "tagged"), { recursive: true });
const tagList = allTags();
write("tagged/index.json", tagList.map((t) => ({ slug: t.slug, tag: t.tag, variants: t.variants, description: t.description, count: t.count, kinds: t.kinds })));
for (const t of tagList) write(`tagged/${t.slug}.json`, {
  slug: t.slug, tag: t.tag, variants: t.variants, description: t.description, count: t.count, kinds: t.kinds,
  related: relatedTags(t.slug).map((r) => ({ slug: r.entry.slug, tag: r.entry.tag, shared: r.shared })),
  records: t.ids.map((id) => g.get(id)).filter((e) => !!e).map((e) => ({ id: e.id, kind: e.kind, name: e.name, route: routeFor(e), status: e.status, tldr: e.tldr })),
});
// Trials in plain words: the explainer bodies of one cancer section per file; the page keeps the headings and summaries.
mkdirSync(join(out, "explained"), { recursive: true });
for (const grp of explainedGroups(g)) write(`explained/${grp.key}.json`, explainedFileFor(grp));
// Roadmaps: every era's linked records, trial outcomes and papers, and every watch row, one file per roadmap; the page
// keeps the era headings and summaries and fetches the bodies (and the story cards, and watch rows past the first page) from here.
mkdirSync(join(out, "roadmaps"), { recursive: true });
for (const r of g.kind("roadmap")) write(`roadmaps/${r.id}.json`, roadmapEraFile(g, r));
// Target dossiers: everything /dossiers/<id>/ gathers, as one record. The page linked to a `data:` URI with the same
// JSON percent-encoded into its HTML, which grew with the corpus (295 KB of the PD-1 dossier's markup).
mkdirSync(join(out, "dossiers"), { recursive: true });
for (const t of g.kind("target")) write(`dossiers/${t.id}.json`, dossierJson(t));
// Navigator: the "already tried" chooser list once, and one file per cancer with its rows, standard of care, caregiver details and questions.
mkdirSync(join(out, "navigator"), { recursive: true });
const navRows = matchRows();
write("navigator/lines.json", navigatorLines(navRows));
for (const c of g.kind("cancer")) write(`navigator/${c.id}.json`, navigatorCancerFile(g, c, navRows));
// The cancer chooser list (id, name, route, group), fetched by the header chip, account menu and welcome step through
// src/lib/use-my-cancer-list.ts instead of being serialised into every page's payload.
write("my-cancers.json", myCancerList());
// Home page spotlight: one hero set per kind in rotation; the page embeds the build day's and the browser swaps in the reader's day.
write("spotlight.json", spotlightFile(g));
// Home page kind graph: one node per kind, one edge per pair of kinds with the link count (src/lib/kind-graph.ts).
write("kind-graph.json", kindGraphFile(g));
write("ranking.json", rankInstitutions().map((r) => ({ rank: r.rank, id: r.institution.id, name: r.institution.name, city: r.institution.city, country: r.institution.country, newsweekOncology2026: r.institution.newsweekOncology2026 ?? null, nci: r.institution.nci ?? null, links: r.links, newsweekPoints: r.newsweekPoints, nciPoints: r.nciPoints, linkPoints: r.linkPoints, score: r.score })));
write("benchmark.json", benchmark);
// Open-source oncology projects (/open-source/): the generated records, the date, and what was looked for and not recorded.
write("open-source.json", { generated: OPEN_SOURCE_GENERATED, licence: EXPORT_LICENCE, projects: openSourceProjects, skipped: OPEN_SOURCE_SKIPPED });
// The software of oncology (/software/): the records with their sources, what was skipped, and what failed a check.
write("software.json", { generated: SOFTWARE_GENERATED, licence: EXPORT_LICENCE, products: softwareProducts, skipped: SOFTWARE_SKIPPED, unverified: SOFTWARE_UNVERIFIED });

// JSON Schema of one entity (the discriminated union over kinds), generated from the Zod schema that validates the corpus.
try {
  const schema = z.toJSONSchema(EntitySchema, { unrepresentable: "any", io: "output" }) as Record<string, unknown>;
  write("schema.json", { $schema: "https://json-schema.org/draft/2020-12/schema", $id: "https://onco.cc/api/v1/schema.json", title: "OnCo entity", description: "One record of the OnCo corpus. Generated from src/lib/schema.ts, which is the source of truth and is enforced at build time.", ...schema });
} catch (err) {
  console.warn(`api: schema.json not written (${err instanceof Error ? err.message : String(err)})`);
}

const feeds = buildFeeds();

// The file list and feed list live in scripts/api-layout.ts, shared with the OpenAPI description (build-openapi.ts).
const counts = Object.fromEntries(KINDS.map((k) => [k, g.kind(k).length])) as Record<(typeof KINDS)[number], number>;
write("meta.json", {
  built: new Date().toISOString(), schema: 1, version: process.env.npm_package_version ?? null,
  attribution: EXPORT_LICENCE, licenseUrl: "https://creativecommons.org/licenses/by-nc/4.0/",
  counts, total: g.entities.length, license: "CC BY-NC 4.0", source: "https://github.com/judegomila/OnCo",
  files: apiFiles(counts),
  feeds: FEEDS,
  openapi: "/api/v1/openapi.json",
  citation: "https://github.com/judegomila/OnCo/blob/main/CITATION.cff",
  releases: "https://github.com/judegomila/OnCo/releases",
});

console.log(`api: wrote ${g.entities.length} entities to public/api/v1 (json, ndjson, ${KINDS.length} csv, schema); explore: ${explore.length} kind files, ${explore.reduce((n, f) => n + f.count, 0)} rows; idea rankings: ${rankings.length} view files, ${rankings.reduce((n, f) => n + f.count, 0)} rows; tables: ${tables.length} files, ${tables.reduce((n, f) => n + f.count, 0)} rows; engine: ${engineFiles.length} files, ${engineFiles.reduce((n, f) => n + f.cells, 0)} cells; feeds: ${feeds.join(", ")}`);

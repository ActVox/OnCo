import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta, SITE } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, Section } from "@/components/ui";

export const metadata: Metadata = pageMeta({ title: "Build on OnCo", description: "Recipes, an OpenAPI spec, TypeScript types, embeddable cards and the MCP server: everything a developer needs to build a trial matcher, a dashboard or a chatbot on the OnCo corpus.", path: "/build/" });

const Code = ({ children }: { children: string }) => <pre className="card p-4 text-xs overflow-auto leading-relaxed"><code>{children}</code></pre>;

export default function BuildPage() {
  const g = graph();
  const examples = ["trop2", "tnbc", "trastuzumab-deruxtecan", "merck"].map((id) => g.get(id)).filter(Boolean);
  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="Build on OnCo"
        lede={`${g.entities.length.toLocaleString("en-GB")} linked objects as static JSON, with no key and permissive CORS, plus an MCP server for assistants. Below: the spec, the types, three recipes you can paste, embeddable cards, and what attribution the licence asks of you.`} />
      <Container className="pb-16 max-w-4xl">
        <div className="card p-4 text-sm border-accent/30 bg-accent-soft/40">
          <div className="kicker mb-1">Start here</div>
          <ul className="list-disc pl-5 space-y-1">
            <li><a className="underline" href="/api/v1/openapi.json">OpenAPI 3.1 description</a> for <code className="text-xs">/api/v1/</code>, generated at build time from the file layout, importable into Postman, Stoplight or an SDK generator (an older hand-written copy is at <a className="underline" href="/openapi.yaml">/openapi.yaml</a>).</li>
            <li><Link className="underline" href="/api/">Endpoint list</Link> with live links and counts.</li>
            <li><a className="underline" href="https://github.com/judegomila/OnCo/blob/main/src/lib/schema.ts" rel="noopener">src/lib/schema.ts</a>: the Zod schema that every object is validated against at build time. It is the source of truth for field names and enums.</li>
            <li><a className="underline" href="https://github.com/judegomila/OnCo/tree/main/mcp" rel="noopener">MCP server</a>: <code className="text-xs">npm run mcp</code> exposes search, get_entity, list_kind, for_cancer and rank tools over stdio.</li>
          </ul>
        </div>

        <Section title="Types in your project">
          <p className="text-[15px] leading-relaxed mb-3">The schema file has no dependencies beyond Zod. Copy it (or add the repo as a git submodule) and infer the types; the JSON under <code>/api/v1/</code> parses with it unchanged.</p>
          <Code>{`// types/onco.ts: copy src/lib/schema.ts from the repo next to this file, then
import { EntitySchema, type Entity, type Drug, type Trial, KIND_META } from "./schema";

export type Neighbours = Record<string, Array<{ id: string; kind: string; name: string; route: string }>>;
export type EntityResponse = { entity: Entity; route: string; neighbours: Neighbours };

export async function getEntity(id: string): Promise<EntityResponse> {
  const r = await fetch(\`${SITE}/api/v1/entities/\${id}.json\`);
  if (!r.ok) throw new Error(\`OnCo: \${id} not found\`);
  const data = (await r.json()) as EntityResponse;
  data.entity = EntitySchema.parse(data.entity); // validates and applies defaults
  return data;
}

export async function listKind<K extends Entity["kind"]>(kind: K): Promise<Extract<Entity, { kind: K }>[]> {
  const r = await fetch(\`${SITE}/api/v1/\${KIND_META[kind].plural}.json\`);
  return (await r.json()) as Extract<Entity, { kind: K }>[];
}`}</Code>
        </Section>

        <Section title="Recipe 1: a trial matcher">
          <p className="text-[15px] leading-relaxed mb-3">Take a cancer and a set of biomarkers, find the products aimed at those targets in that cancer, then pull live recruiting studies from ClinicalTrials.gov for each product. Two static fetches plus the public registry API; no server needed.</p>
          <Code>{`const SITE = "${SITE}";
const cancerId = "tnbc";
const biomarkers = ["trop2", "pdl1", "brca"]; // OnCo target ids; see /targets/

const { neighbours } = await fetch(\`\${SITE}/api/v1/entities/\${cancerId}.json\`).then((r) => r.json());
const products = (neighbours.drug ?? []) as Array<{ id: string; name: string }>;
const drugs = await fetch(\`\${SITE}/api/v1/drugs.json\`).then((r) => r.json());
const byId = new Map(drugs.map((d: { id: string }) => [d.id, d]));

const matches = products
  .map((p) => byId.get(p.id))
  .filter((d) => d && d.targets.some((t: string) => biomarkers.includes(t)) && d.status !== "withdrawn");

for (const d of matches) {
  const q = new URLSearchParams({ "query.intr": d.name.replace(/\\s*\\(.*?\\)\\s*/g, " ").trim(), "query.cond": "triple negative breast cancer", "filter.overallStatus": "RECRUITING", pageSize: "5", format: "json" });
  const studies = await fetch(\`https://clinicaltrials.gov/api/v2/studies?\${q}\`).then((r) => r.json());
  console.log(d.name, d.status, studies.studies?.map((s: { protocolSection: { identificationModule: { nctId: string } } }) => s.protocolSection.identificationModule.nctId));
}`}</Code>
          <p className="text-xs text-muted mt-2">The site&rsquo;s own <Link href="/tumor-board/" className="underline">tumour board</Link> and <Link href="/navigator/" className="underline">navigator</Link> use the same approach; see <code>src/lib/biomarker-match.ts</code> and <code>src/lib/ctgov.ts</code> in the repo for the edge cases (aliases, combination names, condition wording).</p>
        </Section>

        <Section title="Recipe 2: a dashboard">
          <p className="text-[15px] leading-relaxed mb-3">One fetch of <code>all.json</code> gives every object plus a backlink map, enough to compute counts, funnels and rankings client-side. This counts products by modality and status for a target.</p>
          <Code>{`const { entities, incoming } = await fetch("${SITE}/api/v1/all.json").then((r) => r.json());
const drugs = entities.filter((e) => e.kind === "drug" && e.targets.includes("her2"));
const funnel = {};
for (const d of drugs) funnel[d.status ?? "unknown"] = (funnel[d.status ?? "unknown"] ?? 0) + 1;
console.table(funnel);

// Everything that links to HER2, grouped by kind (trials, cancers, pathways, papers...)
const linkers = incoming["her2"].reduce((m, x) => ({ ...m, [x.kind]: (m[x.kind] ?? 0) + 1 }), {});
console.table(linkers);

// Refresh: meta.json carries the build time; re-fetch when it changes
const { built, counts } = await fetch("${SITE}/api/v1/meta.json").then((r) => r.json());`}</Code>
          <p className="text-xs text-muted mt-2">all.json is a few megabytes; for a production dashboard fetch the per-kind files you need and cache on <code>meta.json</code>&rsquo;s <code>built</code> timestamp. The pages under <Link href="/pivot/" className="underline">count what exists, and where</Link>, <Link href="/pipeline/" className="underline">pipeline</Link> and <Link href="/scorecards/" className="underline">scorecards</Link> are built this way at build time.</p>
        </Section>

        <Section title="Recipe 3: a chatbot over MCP">
          <p className="text-[15px] leading-relaxed mb-3">The MCP server gives an assistant grounded tools instead of a scraped context window. Clone the repo, install, and point your MCP-capable client at it.</p>
          <Code>{`git clone https://github.com/judegomila/OnCo.git && cd OnCo && npm ci

# Claude Desktop, Cursor, or any MCP client: add a stdio server
{
  "mcpServers": {
    "onco": { "command": "npm", "args": ["run", "mcp"], "cwd": "/path/to/OnCo" }
  }
}

# Tools exposed: search(query, limit), get_entity(id), list_kind(kind),
# for_cancer(cancerId), rank(...). Every answer carries the object url so the
# assistant can cite onco.cc and the reader can check the source.`}</Code>
          <p className="text-xs text-muted mt-2">Without MCP, the same grounding works with <code>search.json</code> (compact id, kind, name, tldr, route documents) as a retrieval index and <code>entities/&lt;id&gt;.json</code> as the fetch step.</p>
        </Section>

        <Section title="Embeddable cards">
          <p className="text-[15px] leading-relaxed mb-3">Every object has an iframe card at <code>/embed/&lt;id&gt;/</code>: kind, status, name and plain-English summary, linking back to the page. Cards are noindex and inherit nothing from your page.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {examples.map((e) => e && (
              <div key={e.id}>
                <iframe src={`/embed/${e.id}/`} title={`${e.name} on OnCo`} width="100%" height="190" style={{ border: 0, borderRadius: 12 }} loading="lazy" />
                <code className="block text-[11px] text-muted mt-1 break-all">{`<iframe src="${SITE}/embed/${e.id}/" width="360" height="190" style="border:0;border-radius:12px" loading="lazy"></iframe>`}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Endpoints at a glance">
          <div className="card overflow-x-auto">
            <table className="onco">
              <thead><tr><th>Path</th><th>Contents</th></tr></thead>
              <tbody>
                <tr><td className="font-mono text-xs">/api/v1/all.json</td><td>All {g.entities.length.toLocaleString("en-GB")} entities plus an <code>incoming</code> backlink map</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/search.json</td><td>Compact search documents</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/&lt;plural&gt;.json</td><td>{KINDS.map((k) => KIND_META[k].plural).join(", ")}</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/entities/&lt;id&gt;.json</td><td>One entity with route and neighbours by kind</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/my-cancers.json</td><td>Every cancer as id, name, route and hub group (the chooser list)</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/spotlight.json</td><td>Home page spotlight: one hero record per kind in the daily rotation</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/ranking.json</td><td>Institution ranking with score components</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/benchmark.json</td><td>The open evaluation question set</td></tr>
                <tr><td className="font-mono text-xs">/api/v1/meta.json</td><td>Build time, counts, licence, attribution text</td></tr>
                <tr><td className="font-mono text-xs">/catalysts/feed.ics</td><td>iCalendar feed of catalysts and readouts</td></tr>
                <tr><td className="font-mono text-xs">/trials/index.json, /trials/&lt;drugId&gt;.json</td><td>Weekly ClinicalTrials.gov phase 2/3 study counts and lists per product</td></tr>
                <tr><td className="font-mono text-xs">/globocan/countries.json</td><td>GLOBOCAN 2022 incidence and mortality by country and site</td></tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Licence and attribution">
          <div className="text-[15px] leading-relaxed space-y-2">
            <p>The data are <a className="underline" href="https://creativecommons.org/licenses/by-nc/4.0/" rel="noopener">CC BY-NC 4.0</a> (free for non-commercial use; commercial use needs a licence from OnCo) and the code is MIT. Name OnCo and link to <a className="underline" href={SITE}>onco.cc</a> wherever the data or text derived from it appears, for example <code className="text-xs">Data from OnCo (onco.cc), CC BY 4.0</code>. The same notice is in <code className="text-xs">/api/v1/meta.json</code> so it can travel with the data.</p>
            <p>Logos remain their owners&rsquo; trademarks; molecule structures keep their PubChem and RCSB terms; GLOBOCAN data keep IARC&rsquo;s terms; ClinicalTrials.gov data are public domain. Nothing here is medical advice, and every record carries the date it was last checked: show it.</p>
            <p>Found an error while building? <Link className="underline" href="/suggest/">Suggest an edit</Link> or open a pull request; corrections are logged at <Link className="underline" href="/corrections/">/corrections/</Link>.</p>
          </div>
        </Section>
      </Container>
    </>
  );
}

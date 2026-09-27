/**
 * Atom 1.0 feeds for the parts of OnCo that change over time, written to public/feeds/*.xml:
 *   changelog.xml   one entry per release in CHANGELOG.md
 *   regulatory.xml  the 100 most recent dated regulatory events across products
 *   calendar.xml    upcoming readouts, decisions and congresses from src/data/calendar.ts
 *   pulse.xml       the research pulse items, newest first
 * and the Edge feed (src/lib/edge.ts) as Atom and JSON Feed 1.1, written to public/edge/feed.xml and feed.json,
 * the 500 highest-ranked items (the page shows 200), plus one feed per kind under public/edge/<type>/ (the 100
 * highest-ranked of that kind; the page's single-type filter links to it).
 * Called from scripts/build-api.ts during `npm run build`; also runnable alone: `npx tsx scripts/build-feeds.ts`.
 * Output is derived and should be gitignored like public/api/v1/.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { routeFor } from "../src/lib/schema";
import { calendar } from "../src/data/calendar";
import { pulseItems } from "../src/data/pulse";
import { SITE, absoluteUrl } from "../src/lib/seo";
import { EDGE_FEED_CAP, EDGE_KIND_META, EDGE_KINDS, edgeAll, edgeDateLabel, edgeFeed, rankEdge, type EdgeItem, type EdgeKind } from "../src/lib/edge";
import { edgeTypeSlug } from "../src/lib/edge-kinds";

type Entry = { id: string; title: string; link: string; updated: string; summary?: string; html?: string; related?: string[]; categories?: string[] };
type Feed = { file: string; title: string; subtitle: string; page: string; entries: Entry[]; /** Site path of the file; defaults to /feeds/<file>. */ path?: string };

/** Full ISO date for a day, month (15th), quarter (middle month) or year (30 June), so feed readers can sort. */
export function dateKey(d: string): string {
  const q = /^(\d{4})-Q([1-4])$/.exec(d);
  if (q) return `${q[1]}-${String((Number(q[2]) - 1) * 3 + 2).padStart(2, "0")}-15`;
  if (/^\d{4}$/.test(d)) return `${d}-06-30`;
  if (/^\d{4}-\d{2}$/.test(d)) return `${d}-15`;
  return d;
}
const iso = (d: string) => `${dateKey(d)}T00:00:00Z`;
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const REG_TYPE: Record<string, string> = { designation: "Designation", filing: "Filing", pdufa: "PDUFA date", approval: "Approval", "accelerated-approval": "Accelerated approval", conversion: "Accelerated approval confirmed", crl: "Complete response letter", withdrawal: "Withdrawal", "label-change": "Label change", "advisory-committee": "Advisory committee" };
const CAL_KIND: Record<string, string> = { pdufa: "PDUFA date", adcom: "Advisory committee", "readout-expected": "Expected readout", congress: "Congress", policy: "Policy" };

/** Minimal Markdown to HTML for changelog bodies: ### headings, "- " bullets, paragraphs, links, code. */
function mdToHtml(lines: string[]): string {
  const inline = (t: string) => esc(t).replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/`([^`]+)`/g, "<code>$1</code>");
  const out: string[] = [];
  let ul: string[] = [];
  const flush = () => { if (ul.length) { out.push(`<ul>${ul.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`); ul = []; } };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (l.startsWith("### ")) { flush(); out.push(`<h3>${inline(l.slice(4))}</h3>`); }
    else if (l.startsWith("- ")) ul.push(l.slice(2));
    else if (l.trim()) { flush(); out.push(`<p>${inline(l)}</p>`); }
  }
  flush();
  return out.join("");
}

export function changelogEntries(md: string): Entry[] {
  const entries: Entry[] = [];
  const re = /^## \[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?\s*$/;
  let cur: { version: string; date?: string; lines: string[] } | null = null;
  const push = () => { if (cur && cur.date && cur.version.toLowerCase() !== "unreleased") entries.push({ id: `${SITE}/changelog/#${cur.version}`, title: `OnCo ${cur.version}`, link: absoluteUrl("/changelog/"), updated: iso(cur.date), html: mdToHtml(cur.lines) }); };
  for (const line of md.split(/\r?\n/)) {
    const m = re.exec(line);
    if (m) { push(); cur = { version: m[1], date: m[2], lines: [] }; continue; }
    if (cur) cur.lines.push(line);
  }
  push();
  return entries;
}

export function feedXml(f: Feed): string {
  const self = absoluteUrl(f.path ?? `/feeds/${f.file}`);
  const updated = f.entries.map((e) => e.updated).sort().at(-1) ?? new Date().toISOString();
  const entry = (e: Entry) => `  <entry>
    <title>${esc(e.title)}</title>
    <link rel="alternate" href="${esc(e.link)}"/>
${(e.related ?? []).map((r) => `    <link rel="related" href="${esc(r)}"/>`).join("\n")}${e.related?.length ? "\n" : ""}${(e.categories ?? []).map((c) => `    <category term="${esc(c)}"/>`).join("\n")}${e.categories?.length ? "\n" : ""}    <id>${esc(e.id)}</id>
    <updated>${e.updated}</updated>
${e.summary ? `    <summary type="text">${esc(e.summary)}</summary>\n` : ""}${e.html ? `    <content type="html">${esc(e.html)}</content>\n` : ""}  </entry>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(f.title)}</title>
  <subtitle>${esc(f.subtitle)}</subtitle>
  <link rel="self" type="application/atom+xml" href="${self}"/>
  <link rel="alternate" type="text/html" href="${esc(absoluteUrl(f.page))}"/>
  <id>${self}</id>
  <updated>${updated}</updated>
  <author><name>OnCo</name><uri>${SITE}/</uri></author>
  <rights>Data CC BY-NC 4.0, attribute "Data from OnCo (onco.cc)"; commercial use needs a licence</rights>
  <generator uri="https://github.com/judegomila/OnCo">OnCo build-feeds</generator>
${f.entries.map(entry).join("\n")}
</feed>
`;
}

const EDGE_TITLE = "OnCo Edge";
const EDGE_SUBTITLE = "The freshest signals in cancer: new papers, trial results, approvals and law, ranked newest first with a modest weight for approvals, phase 3 results and the leading journals.";

/** Atom entries for Edge items. `updated` is the first day of the item's dated period (a year-only law is dated 1 January). */
export function edgeEntries(items: EdgeItem[]): Entry[] {
  return items.map((it) => ({
    id: `${it.url}#onco-edge-${it.kind}`,
    title: `${EDGE_KIND_META[it.kind].label}: ${it.title}`,
    link: it.url,
    updated: iso(it.sortDate),
    summary: it.sentence,
    html: `<p>${esc(it.sentence)}</p><p>${esc(edgeDateLabel(it))}${it.venue ? `, ${esc(it.venue)}` : ""}.</p>${it.refs.length ? `<p>On OnCo: ${it.refs.map((r) => `<a href="${esc(absoluteUrl(r.route))}">${esc(r.name)}</a>`).join(", ")}</p>` : ""}`,
    related: [absoluteUrl("/edge/"), ...it.refs.map((r) => absoluteUrl(r.route))],
    categories: [it.kind],
  }));
}

/** Items of one kind a per-type feed carries (/edge/<type>/feed.xml); the ranking is the same, restricted to the kind. */
export const EDGE_TYPE_FEED_CAP = 100;

/** Where a per-type feed lives and what it is called: /edge/<plural slug>/feed.xml, "OnCo Edge: Approvals". */
export function edgeTypeFeedMeta(kind?: EdgeKind): { dir: string; title: string; subtitle: string; page: string } {
  if (!kind) return { dir: "/edge/", title: EDGE_TITLE, subtitle: EDGE_SUBTITLE, page: "/edge/" };
  const meta = EDGE_KIND_META[kind];
  return { dir: `/edge/${edgeTypeSlug(kind)}/`, title: `${EDGE_TITLE}: ${meta.plural}`, subtitle: `${meta.plural} only, from OnCo Edge, ranked newest first. ${meta.source}`, page: `/edge/?type=${edgeTypeSlug(kind)}` };
}

export function edgeFeedXml(items: EdgeItem[], kind?: EdgeKind): string {
  const m = edgeTypeFeedMeta(kind);
  return feedXml({ file: "feed.xml", path: `${m.dir}feed.xml`, title: m.title, subtitle: m.subtitle, page: m.page, entries: edgeEntries(items) });
}

/** JSON Feed 1.1 (https://jsonfeed.org/version/1.1); the `_onco` extension carries the kind, venue, date precision and record links. */
export function edgeFeedJson(items: EdgeItem[], kind?: EdgeKind): string {
  const m = edgeTypeFeedMeta(kind);
  return JSON.stringify({
    version: "https://jsonfeed.org/version/1.1",
    title: m.title,
    home_page_url: absoluteUrl(m.page),
    feed_url: absoluteUrl(`${m.dir}feed.json`),
    description: m.subtitle,
    language: "en-GB",
    authors: [{ name: "OnCo", url: `${SITE}/` }],
    items: items.map((it) => ({
      id: `${it.url}#onco-edge-${it.kind}`,
      url: it.url,
      title: it.title,
      content_text: it.sentence,
      date_published: iso(it.sortDate),
      tags: [it.kind],
      _onco: { kind: it.kind, date: it.date, precision: it.precision, venue: it.venue, doi: it.doi, records: it.refs.map((r) => ({ id: r.id, kind: r.kind, name: r.name, url: absoluteUrl(r.route) })) },
    })),
  }, null, 1);
}

export function buildFeeds(root = process.cwd()): string[] {
  const g = graph();
  const out = join(root, "public", "feeds");
  mkdirSync(out, { recursive: true });
  const name = (id: string) => g.get(id)?.name ?? id;
  const link = (id: string) => { const e = g.get(id); return e ? absoluteUrl(routeFor(e)) : undefined; };

  const regulatory: Entry[] = g.kind("drug")
    // A product can carry two accelerated approvals granted on one day, for different indications, so the index
    // joins the date and type to keep the two entries apart.
    .flatMap((d) => d.regulatoryEvents.map((e, i) => ({ d, e, i })))
    .sort((a, b) => dateKey(b.e.date).localeCompare(dateKey(a.e.date)) || a.d.name.localeCompare(b.d.name))
    .slice(0, 100)
    .map(({ d, e, i }) => ({
      id: `${absoluteUrl(routeFor(d))}#regulatory-${dateKey(e.date)}-${e.type}-${i}`,
      title: `${REG_TYPE[e.type] ?? e.type}: ${d.name} (${e.region}, ${e.date})`,
      link: absoluteUrl(routeFor(d)),
      updated: iso(e.date),
      summary: e.note,
      html: `<p>${esc(e.note)}</p>${e.source ? `<p>Source: <a href="${esc(e.source)}">${esc(e.source)}</a></p>` : ""}`,
      related: e.source ? [e.source] : [],
    }));

  const cal: Entry[] = [...calendar]
    .sort((a, b) => dateKey(a.date).localeCompare(dateKey(b.date)))
    .map((ev) => ({
      id: `${absoluteUrl("/calendar/")}#${dateKey(ev.date)}-${ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60)}`,
      title: `${ev.date}: ${ev.title}${ev.confidence === "expected" ? " (expected, editorial estimate)" : ""}`,
      link: absoluteUrl("/calendar/"),
      updated: iso(ev.date),
      summary: `${CAL_KIND[ev.kind] ?? ev.kind}. ${ev.note}`,
      html: `<p><strong>${esc(CAL_KIND[ev.kind] ?? ev.kind)}</strong>, ${ev.confidence === "confirmed" ? "confirmed" : "expected (editorial estimate)"}.</p><p>${esc(ev.note)}</p>${ev.refs.length ? `<p>Related: ${ev.refs.map((r) => (link(r) ? `<a href="${link(r)}">${esc(name(r))}</a>` : esc(name(r)))).join(", ")}</p>` : ""}${ev.source ? `<p>Source: <a href="${esc(ev.source)}">${esc(ev.source)}</a></p>` : ""}`,
      related: [ev.source, ...ev.refs.map(link)].filter((x): x is string => !!x),
    }));

  const pulse: Entry[] = [...pulseItems]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 100)
    .map((p) => ({
      id: p.url,
      title: p.title,
      link: p.url,
      updated: iso(p.date),
      summary: p.oneLine,
      html: `<p>${esc(p.oneLine)}</p><p>Read at ${esc(name(p.sourceId))} on ${p.date}; sentiment ${p.sentiment}.</p>${p.refs.length ? `<p>On OnCo: ${p.refs.map((r) => (link(r) ? `<a href="${link(r)}">${esc(name(r))}</a>` : esc(name(r)))).join(", ")}</p>` : ""}`,
      related: [absoluteUrl("/pulse/"), ...p.refs.map(link)].filter((x): x is string => !!x),
    }));

  const changelog = changelogEntries(readFileSync(join(root, "CHANGELOG.md"), "utf8"));

  const feeds: Feed[] = [
    { file: "changelog.xml", title: "OnCo changelog", subtitle: "What changed in OnCo, release by release.", page: "/changelog/", entries: changelog },
    { file: "regulatory.xml", title: "OnCo regulatory events", subtitle: "Designations, filings, approvals, complete response letters, withdrawals and label changes across products; the 100 most recent.", page: "/regulatory/", entries: regulatory },
    { file: "calendar.xml", title: "OnCo readout calendar", subtitle: "Regulatory dates, advisory committees, expected trial readouts and congresses. Expected dates are editorial estimates until confirmed.", page: "/calendar/", entries: cal },
    { file: "pulse.xml", title: "OnCo research pulse", subtitle: "What the leading journals, regulators and news sources are saying, item by item with links.", page: "/pulse/", entries: pulse },
  ];
  const written: string[] = [];
  for (const f of feeds) { writeFileSync(join(out, f.file), feedXml(f)); written.push(`${f.file} (${f.entries.length})`); }

  const edge = edgeFeed(EDGE_FEED_CAP, root);
  const edgeDir = join(root, "public", "edge");
  mkdirSync(edgeDir, { recursive: true });
  writeFileSync(join(edgeDir, "feed.xml"), edgeFeedXml(edge));
  writeFileSync(join(edgeDir, "feed.json"), edgeFeedJson(edge));
  written.push(`edge/feed.xml + feed.json (${edge.length})`);
  // One feed per kind, the same ranking restricted to that kind: /edge/<type>/feed.xml and feed.json.
  const all = edgeAll(root);
  for (const kind of EDGE_KINDS) {
    const items = rankEdge(all.filter((it) => it.kind === kind), { cap: EDGE_TYPE_FEED_CAP });
    const dir = join(edgeDir, edgeTypeSlug(kind));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "feed.xml"), edgeFeedXml(items, kind));
    writeFileSync(join(dir, "feed.json"), edgeFeedJson(items, kind));
    written.push(`edge/${edgeTypeSlug(kind)}/feed.xml + feed.json (${items.length})`);
  }
  return written;
}

if (process.argv[1] && /build-feeds\.ts$/.test(process.argv[1])) {
  console.log(`feeds: ${buildFeeds().join(", ")} -> public/feeds`);
}

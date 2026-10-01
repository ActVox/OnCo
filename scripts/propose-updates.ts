/**
 * Nightly change-proposal bot (improvement #99): the review residue.
 *
 * Reads what the feeds found and drafts record patches for a human to review:
 *   public/factcheck.json         registry mismatches (trial status vs ClinicalTrials.gov, openFDA label vs recorded approval)
 *   public/trials/changes.json    trial status changes, posted results, moved primary completion dates
 *   public/fda/recent.json        FDA oncology approvals matched to products but missing from their regulatory events
 *   public/regional/candidates.json  EU rows missing or disagreeing with the EMA register
 *
 * What merges itself and what waits. Every proposal is regenerated against the current tree when the bot runs, so a
 * row a person added since the snapshot is never proposed again. Of the four feeds, only the EMA register has a
 * machine-readable status field behind every candidate (the medicine page's `data-medicine-status` and its dated
 * fields), so only EU rows are decided without a person: scripts/apply-proposals.ts reads each page, attributes it by
 * exact INN, brand or alias, maps Authorised, Withdrawn, Application withdrawn and Refused to the file's helpers, and
 * writes the rows on the auto branch that .github/workflows/propose.yml squash-merges after the gates. Candidates that
 * fail any check (no page, no status, no exact match or several, biosimilar or generic, Revoked, Expired, Lapsed, a
 * pending opinion, or a hand-written row that disagrees) come here with the reason attached. The other kinds stay
 * review-only, and say so: FDA notices are prose titles (an approval is read from a sentence, not a field) and land in
 * hand-written regulatoryEvents lists; ClinicalTrials.gov's overall status maps onto OnCo's editorial statuses
 * (positive, negative, mixed) only as a floor; HTA verdicts (NICE, G-BA, PBAC) are read from HTML tables and PDFs
 * without a status field the bot could quote.
 *
 * Every proposal names the entity, the source file and line, the field, the current and proposed values, the URL the
 * evidence came from and, for EMA rows, why a person is needed. The text is deterministic: it is assembled from the
 * fetched records only, with no model.
 *
 * Outputs:
 *   public/proposals/latest.json   machine-readable proposals (read by /status/ and /edge/), plus the auto rows of this run
 *   docs/proposals/latest.md       the same, as a review checklist for the pull request
 *   CORRECTIONS.md                 with --corrections, one line under "Proposed by the update bot" per run
 *
 * Run: npx tsx scripts/propose-updates.ts [--corrections]   Daily via .github/workflows/propose.yml (review branch).
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { routeFor, type Kind } from "../src/lib/schema";
import { sourceLocation } from "../src/lib/source-location";
import { regionalApprovals } from "../src/data/regional-approvals";
import { publicPath, readJson, today, writeJson } from "./feed-utils";
import type { TrialChanges } from "./fetch-trials";
import type { FdaSnapshot } from "./fetch-fda";
import { decideRegional } from "./apply-proposals";
import type { AutoRow } from "./lib/proposals-ema";

type Factcheck = { generated: string; mismatches: Array<{ check: string; id: string; name: string; route: string; recorded: string; registry: string; url: string; severity: string }> };

/**
 * Is this product the subject of an FDA notice title? Exported so scripts/propose-updates.test.ts can hold the
 * rule: a product whose name is a combination is named only when every one of its components appears.
 */
export function exportedNamedIn(title: string, d: { name: string; brand?: string; aka: string[] }): boolean {
  const low = title.toLowerCase();
  const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 5);
  // "Relatlimab + nivolumab", "pembrolizumab and lenvatinib", "nivolumab/relatlimab".
  const parts = d.name.split(/\s*(?:\+|\/|\band\b|\bwith\b)\s*/i).map((x) => x.trim()).filter(Boolean);
  if (parts.length > 1) return parts.every((part) => words(part).some((w) => low.includes(w)));
  return words([d.name, d.brand ?? "", ...d.aka].join(" ")).some((w) => low.includes(w));
}

export type Proposal = {
  id: string;
  kind: "trial-status" | "trial-results" | "trial-completion" | "drug-approval" | "regulatory-event" | "regional-row" | "regional-status" | "new-product";
  confidence: "high" | "medium" | "low";
  entityId?: string; entityName: string; entityKind?: string; route?: string;
  file?: string; line?: number; editUrl?: string;
  field: string; current?: string; proposed: string;
  evidence: string; sourceUrl: string; detected: string;
  /** Why this row needs a person rather than the auto branch (EMA rows; other kinds are review-only by design). */
  reason?: string;
};
export type ProposalsSnapshot = {
  generated: string; inputs: Record<string, string | null>; proposals: Proposal[];
  /** EU rows the same run decided mechanically (written by scripts/apply-proposals.ts on the auto branch), and rows dropped as already on main. */
  auto?: { rows: Array<Pick<AutoRow, "drugId" | "status" | "year" | "sourceUrl" | "quotedStatus">>; alreadyOnMain: number };
};

const CT_TO_OURS: Record<string, string> = { COMPLETED: "completed", TERMINATED: "withdrawn", WITHDRAWN: "withdrawn", SUSPENDED: "mixed", RECRUITING: "recruiting", ACTIVE_NOT_RECRUITING: "active", NOT_YET_RECRUITING: "planned", ENROLLING_BY_INVITATION: "recruiting" };
const CORRECTIONS_HEADER = "## Proposed by the update bot (pending review)";

async function main() {
  const g = graph();
  const generated = today();
  const proposals: Proposal[] = [];
  const loc = (id: string, kind: Kind) => { try { const l = sourceLocation(id, kind); return { file: l.file, line: l.line, editUrl: l.url }; } catch { return {}; } };
  const push = (p: Omit<Proposal, "id" | "detected"> & { detected?: string }) => proposals.push({ ...p, id: `${p.kind}:${p.entityId ?? p.entityName}:${p.field}:${p.proposed}`.toLowerCase().replace(/[^a-z0-9:.-]+/g, "-").slice(0, 160), detected: p.detected ?? generated });

  const fc = readJson<Factcheck>(publicPath("factcheck.json"));
  const changes = readJson<TrialChanges>(publicPath("trials", "changes.json"));
  const fda = readJson<FdaSnapshot>(publicPath("fda", "recent.json"));
  const ema = await decideRegional();
  const inputs = { factcheck: fc?.generated?.slice(0, 10) ?? null, trialChanges: changes?.fetched ?? null, fda: fda?.fetched ?? null, regional: ema.snapshotFetched };

  // 1. Registry fact-check mismatches (review-only: editorial trial statuses and prose labels have no field to read).
  for (const m of fc?.mismatches ?? []) {
    const e = g.get(m.id);
    if (!e) continue;
    if (m.check === "trial-status-vs-registry" && e.kind === "trial") {
      const reg = m.registry.match(/[A-Z_]{6,}/)?.[0];
      const proposed = reg ? CT_TO_OURS[reg] : undefined;
      if (!proposed || proposed === e.status) continue;
      push({ kind: "trial-status", confidence: reg === "COMPLETED" || reg === "TERMINATED" || reg === "WITHDRAWN" ? "medium" : "low", entityId: e.id, entityName: e.name, entityKind: e.kind, route: routeFor(e), ...loc(e.id, e.kind), field: "status", current: e.status, proposed, evidence: `ClinicalTrials.gov overall status is ${reg}; recorded ${m.recorded}. Editorial statuses (positive, negative, mixed) need the result, so this is a floor, not a verdict.`, sourceUrl: m.url });
    }
    if (m.check === "openfda-label-but-not-approved" && e.kind === "drug") {
      push({ kind: "drug-approval", confidence: "medium", entityId: e.id, entityName: e.name, entityKind: e.kind, route: routeFor(e), ...loc(e.id, e.kind), field: "approvals / status", current: `status ${e.status ?? "unset"}; no US approval recorded`, proposed: `add { region: "US", year: <from label>, indication: <from label> } and set status to approved`, evidence: m.registry, sourceUrl: m.url });
    }
  }

  // 2. Trial registry changes (review-only: the registry status is a floor under OnCo's editorial status).
  for (const c of changes?.changes ?? []) {
    const trial = g.kind("trial").find((t) => t.nct === c.nct);
    const drug = g.get(c.drugId);
    const url = `https://clinicaltrials.gov/study/${c.nct}`;
    if (c.kind === "status" && trial) {
      const proposed = CT_TO_OURS[c.to ?? ""];
      if (proposed && proposed !== trial.status) push({ kind: "trial-status", confidence: "medium", entityId: trial.id, entityName: trial.name, entityKind: "trial", route: routeFor(trial), ...loc(trial.id, "trial"), field: "status", current: trial.status, proposed, evidence: `Registry status moved from ${c.from} to ${c.to} (detected ${c.detected}).`, sourceUrl: url, detected: c.detected });
    } else if (c.kind === "results-posted" && trial) {
      push({ kind: "trial-results", confidence: "high", entityId: trial.id, entityName: trial.name, entityKind: "trial", route: routeFor(trial), ...loc(trial.id, "trial"), field: "result / outcomes", current: trial.result ?? "(none)", proposed: "add the posted primary outcome with the registry as source", evidence: `ClinicalTrials.gov now has posted results for ${c.nct} (detected ${c.detected}).`, sourceUrl: `${url}?tab=results`, detected: c.detected });
    } else if (c.kind === "primary-completion" && trial) {
      push({ kind: "trial-completion", confidence: "medium", entityId: trial.id, entityName: trial.name, entityKind: "trial", route: routeFor(trial), ...loc(trial.id, "trial"), field: "yearReported / calendar", current: c.from, proposed: c.to ?? "", evidence: `Primary completion date moved from ${c.from} to ${c.to}; check the readout calendar entry.`, sourceUrl: url, detected: c.detected });
    } else if (c.kind === "status" && !trial && drug && (c.to === "COMPLETED" || c.to === "TERMINATED") && c.phases.includes("PHASE3")) {
      push({ kind: "trial-status", confidence: "low", entityId: drug.id, entityName: `${c.title} (${c.nct})`, entityKind: "trial", route: routeFor(drug), field: "new trial record", current: "(not in corpus)", proposed: `add phase 3 trial ${c.nct} for ${drug.name} with status ${CT_TO_OURS[c.to] ?? c.to.toLowerCase()}`, evidence: `A phase 3 study of ${drug.name} moved from ${c.from} to ${c.to} (detected ${c.detected}).`, sourceUrl: url, detected: c.detected });
    }
  }

  // 3. FDA approvals matched to products but absent from their regulatory events (review-only: the notice is a prose
  //    title, and the target is a hand-written list). Only products named in the notice title are proposed; a CDK4/6
  //    inhibitor mentioned as a combination partner in the summary is not. An event already dated or sourced is skipped.
  // A combination record is named only when *every* component is in the title. The old rule matched on any word
  // of five letters or more, so "Relatlimab + nivolumab" matched the notice "FDA grants accelerated approval to
  // vusolimogene oderparepvec-wtpg in combination with nivolumab for melanoma" on the word nivolumab alone, and
  // the bot proposed putting an oncolytic virus's approval on the LAG-3 combination's page. It proposed it twice,
  // on 30 September and again on 1 October, and both times a person had to recognise it. Same failure as the
  // `imid` fragment in the red cards: a loose match that produces a confident false claim.
  const namedIn = exportedNamedIn;
  for (const o of fda?.oce ?? []) {
    for (const id of o.drugIds) {
      const d = g.get(id);
      if (!d || d.kind !== "drug" || !namedIn(o.title, d)) continue;
      const has = d.regulatoryEvents.some((e) => e.date === o.date || e.source === o.url);
      if (has) continue;
      const accelerated = /accelerated approval/i.test(o.title);
      push({ kind: "regulatory-event", confidence: "high", entityId: d.id, entityName: d.name, entityKind: "drug", route: routeFor(d), ...loc(d.id, "drug"), field: "regulatoryEvents", current: `${d.regulatoryEvents.length} events; none dated ${o.date}`, proposed: `{ date: "${o.date}", type: "approval", region: "US", note: "${o.title.replace(/^FDA /, "").replace(/"/g, "'")}${accelerated ? " (accelerated)" : ""}", source: "${o.url}" }`, evidence: o.summary.slice(0, 300), sourceUrl: o.url, detected: o.firstSeen });
    }
  }
  for (const n of fda?.notInCorpus ?? []) {
    push({ kind: "new-product", confidence: "medium", entityName: n.generic ?? n.title, field: "new drug record", current: "(not in corpus)", proposed: `add product ${n.generic ?? "(see notice)"} with a US approval dated ${n.date}`, evidence: n.title, sourceUrl: n.url, detected: n.firstSeen });
  }

  // 4. EMA register vs regional-approvals.ts, decided by the rules in scripts/lib/proposals-ema.ts. Rows that passed
  //    every check are written by scripts/apply-proposals.ts on the auto branch and are listed, not proposed; the
  //    residue is proposed with the reason a person is needed.
  for (const r of ema.residue) {
    const c = r.candidate;
    const d = r.drugId ? g.get(r.drugId) : undefined;
    const p = r.page;
    const pageLine = p?.statusTitle ? `Register page: "${p.statusTitle}${p.statusMessage ? `: ${p.statusMessage}` : ""}"${p.issued ? `, authorised ${p.issued}` : ""}${p.withdrawn ? `, withdrawn ${p.withdrawn}` : ""}${p.revoked ? `, revoked ${p.revoked}` : ""}${p.opinionStatus ? `, opinion ${p.opinionStatus}${p.opinionAdopted ? ` ${p.opinionAdopted}` : ""}` : ""}.` : "Register page not read in this run.";
    const evidence = `EMA register: ${c.product}${c.inn ? ` (${c.inn})` : ""} ${c.register}${c.date ? `, ${c.date}` : ""}. ${pageLine}`;
    const sourceUrl = c.url ?? "https://www.ema.europa.eu/en/medicines";
    if (r.kind === "new-product" || !d) {
      push({ kind: "new-product", confidence: "low", entityName: c.product, field: "new drug record", current: "(not in corpus)", proposed: `add product ${p?.inn ?? c.inn ?? c.product} (${c.product}) with the EU status the register page shows`, evidence, sourceUrl, reason: r.reason });
      continue;
    }
    const row = regionalApprovals[d.id]?.EU;
    push({ kind: r.kind, confidence: "medium", entityId: d.id, entityName: d.name, entityKind: "drug", route: routeFor(d), file: "src/data/regional-approvals.ts", field: "EU", current: row ? `${row.status}${row.year ? ` (${row.year})` : ""}` : "(no EU entry)", proposed: r.proposed ?? `EU entry from the register page (${p?.statusTitle ?? c.register})`, evidence, sourceUrl, reason: r.reason });
  }

  // Deduplicate by id; highest confidence first, then newest.
  const rank = { high: 0, medium: 1, low: 2 };
  const seen = new Set<string>();
  const list = proposals.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; }).sort((a, b) => rank[a.confidence] - rank[b.confidence] || b.detected.localeCompare(a.detected));

  const snap: ProposalsSnapshot = { generated, inputs, proposals: list, auto: { rows: ema.auto.map((a) => ({ drugId: a.drugId, status: a.status, year: a.year, sourceUrl: a.sourceUrl, quotedStatus: a.quotedStatus })), alreadyOnMain: ema.dropped.length } };
  writeJson(publicPath("proposals", "latest.json"), snap);
  mkdirSync(join(process.cwd(), "docs", "proposals"), { recursive: true });
  writeFileSync(join(process.cwd(), "docs", "proposals", "latest.md"), renderMarkdown(snap));
  console.log(`propose: ${list.length} proposals for review (${list.filter((p) => p.confidence === "high").length} high); EMA: ${ema.auto.length} auto rows, ${ema.dropped.length} already on main, ${ema.residue.length} residue -> public/proposals/latest.json, docs/proposals/latest.md`);

  if (process.argv.includes("--corrections")) {
    const path = join(process.cwd(), "CORRECTIONS.md");
    if (existsSync(path)) {
      let md = readFileSync(path, "utf8");
      const line = `- ${generated}: ${list.length} proposals drafted from the feeds (${list.filter((p) => p.confidence === "high").length} high confidence); review in [docs/proposals/latest.md](docs/proposals/latest.md). Nothing here is a confirmed correction until a human moves it above.`;
      if (md.includes(CORRECTIONS_HEADER)) {
        md = md.replace(new RegExp(`(${CORRECTIONS_HEADER}\\n\\n)(- ${generated}:[^\\n]*\\n)?`), `$1${line}\n`);
      } else {
        md = md.replace(/\n## How corrections are logged/, `\n${CORRECTIONS_HEADER}\n\n${line}\n\n## How corrections are logged`);
        if (!md.includes(CORRECTIONS_HEADER)) md += `\n${CORRECTIONS_HEADER}\n\n${line}\n`;
      }
      writeFileSync(path, md);
      console.log("propose: CORRECTIONS.md line added");
    }
  }
}

function renderMarkdown(s: ProposalsSnapshot): string {
  const lines = [`# Change proposals ${s.generated}`, "", `Drafted by scripts/propose-updates.ts from: ${Object.entries(s.inputs).map(([k, v]) => `${k} ${v ?? "missing"}`).join(", ")}.`, "", "Review each line against its source. Apply by editing the file named; nothing in this list is applied automatically. EMA rows carry the reason a person is needed; the rows that passed every check were written on the auto branch by scripts/apply-proposals.ts and are listed at the end.", ""];
  for (const conf of ["high", "medium", "low"] as const) {
    const group = s.proposals.filter((p) => p.confidence === conf);
    if (!group.length) continue;
    lines.push(`## ${conf[0].toUpperCase()}${conf.slice(1)} confidence (${group.length})`, "");
    for (const p of group) {
      lines.push(`- [ ] **${p.entityName}**${p.route ? ` ([page](https://onco.cc${p.route}))` : ""} · ${p.kind} · \`${p.field}\``);
      if (p.current) lines.push(`  - current: ${p.current}`);
      lines.push(`  - proposed: ${p.proposed}`);
      lines.push(`  - evidence: ${p.evidence} ([source](${p.sourceUrl}))`);
      if (p.reason) lines.push(`  - why a person: ${p.reason}`);
      if (p.file) lines.push(`  - file: \`${p.file}${p.line ? `:${p.line}` : ""}\``);
    }
    lines.push("");
  }
  if (!s.proposals.length) lines.push("No proposals: the feeds and the corpus agree.", "");
  if (s.auto) {
    lines.push(`## EMA rows decided without a person (${s.auto.rows.length} written, ${s.auto.alreadyOnMain} already on main)`, "");
    for (const a of s.auto.rows) lines.push(`- ${a.drugId}: EU ${a.status}${a.year ? ` ${a.year}` : ""} ("${a.quotedStatus}", [source](${a.sourceUrl}))`);
    if (!s.auto.rows.length) lines.push("None this run.");
    lines.push("");
  }
  return lines.join("\n");
}

main().catch((e) => { console.error(e); process.exit(1); });

/**
 * UK and NHS layer for a cancer: the patient pathway in the NHS with its waiting-time standards, where the
 * specialist centres are, what the NHS funds today by line of treatment (NICE, the Cancer Drugs Fund, the SMC and
 * the AWMSG), which genomic tests the National Genomic Test Directory offers, the trials open in the UK, the UK
 * figures with their sources, the support charities and the differences between the four nations.
 *
 * One `UkPathway` per cancer, written by hand in a spike file (src/data/spikes/<cancer>-uk.ts) and registered in
 * UK_PATHWAYS below; the page /cancers/<id>/uk/ renders any cancer that has one, and the cancer page shows a
 * "UK and NHS" pill. Nothing here is generated: every figure carries the page it was read from and the date.
 */
import { graph } from "./graph";
import { gallbladderUkPathway } from "@/data/spikes/gallbladder-uk";
import { tnbcUkPathway } from "@/data/spikes/tnbc-uk";
import { pancreaticUkPathway } from "@/data/spikes/pancreatic-uk";
import { colorectalUkPathway } from "@/data/spikes/colorectal-uk";
import { lungUkPathway } from "@/data/spikes/lung-uk";
import { prostateUkPathway } from "@/data/spikes/prostate-uk";
import { breastUkPathway } from "@/data/spikes/breast-uk";
import { skinUkPathway } from "@/data/spikes/skin-uk";
import { lymphomaUkPathway } from "@/data/spikes/lymphoma-uk";

/** A checkable citation: the page a figure or statement was read from, and when it was checked or published. */
export type UkSource = { label: string; url: string; date?: string };

/** One step of the NHS pathway with the national standard that applies to it. */
export type UkTimelineStep = {
  id: string;
  /** Short label for the pill, e.g. "Referral". */
  label: string;
  /** The standard in a few words, e.g. "28 days to a diagnosis or all-clear". */
  standard: string;
  /** The operational target, e.g. "75% (80% by March 2026)". */
  target?: string;
  detail: string;
  sources: UkSource[];
};

/** How the cancer usually comes to light, as a set of doors into the pathway. */
export type UkPresentation = { title: string; detail: string; share?: string; sources: UkSource[] };

export type UkNation = "England" | "Scotland" | "Wales" | "Northern Ireland";

/** A specialist centre. `institutionId` links to a record when one exists; the name and url stand alone otherwise. */
export type UkCentre = {
  institutionId?: string;
  name: string;
  trust?: string;
  city: string;
  nation: UkNation;
  /** What the centre offers for this cancer, in plain words. */
  offers: string[];
  url: string;
  sources: UkSource[];
};

/**
 * A funding or commissioning position and who took it. Most rows are NICE or the SMC; "NHS England" and
 * "NHS Scotland" cover the positions that are commissioning or service decisions rather than appraisals, which
 * is how most of skin cancer care is governed.
 */
export type UkDecision = { body: "NICE" | "SMC" | "AWMSG" | "NHS England" | "NHS Scotland"; decision: string; ref?: string; date?: string; url: string; cdf?: boolean };

/** One line of treatment and what the NHS funds for it. */
export type UkFundingRow = {
  line: string;
  treatment: string;
  /** Drug or technology ids on record, for the pills. */
  refs: string[];
  england: UkDecision;
  scotland?: UkDecision;
  /** Wales usually follows NICE within two months; where the AWMSG or a Welsh decision differs, say so. */
  wales?: string;
  northernIreland?: string;
  note?: string;
};

/** One National Genomic Test Directory entry (or a pathology test) a patient can ask about. */
export type UkTestRow = {
  target: string;
  /** Test Directory code, e.g. "M220.1"; "pathology" where the test is not in the directory. */
  code: string;
  test: string;
  /** What a positive result opens: the drug and its NICE or SMC position. */
  opens: string;
  how: string;
  sources: UkSource[];
};

export type UkTrialRow = {
  /** OnCo trial id when the trial has a record. */
  trialId?: string;
  registry: string;
  name: string;
  status: string;
  setting: string;
  sites: string[];
  url: string;
  note?: string;
};

export type UkFigure = { label: string; value: string; nation: string; period: string; source: UkSource; note?: string };

export type UkSupport = {
  institutionId?: string;
  name: string;
  provides: string[];
  url: string;
  /** "charity", "nhs" or "benefit". */
  kind: "charity" | "nhs" | "benefit";
  source?: UkSource;
};

export type UkNationRow = { topic: string; england: string; scotland: string; wales: string; northernIreland: string; sources: UkSource[] };

export type UkLegacy = { title: string; story: string; trialIds: string[]; sources: UkSource[] };

export type UkPathway = {
  cancerId: string;
  /** Other cancer ids the pathway also applies to (an older record id, a subtype). */
  aliases?: string[];
  cancerName: string;
  asOf: string;
  intro: string;
  presentation: UkPresentation[];
  timeline: UkTimelineStep[];
  centres: UkCentre[];
  /** The service model the centres work under, in plain words. */
  centresNote: { text: string; sources: UkSource[] };
  funding: UkFundingRow[];
  fundingNote?: { text: string; sources: UkSource[] };
  tests: UkTestRow[];
  testsNote?: { text: string; sources: UkSource[] };
  trials: UkTrialRow[];
  trialsNote?: { text: string; sources: UkSource[] };
  legacy: UkLegacy[];
  figures: UkFigure[];
  support: UkSupport[];
  nations: UkNationRow[];
  /** Named gaps: what could not be sourced. */
  gaps: string[];
};

export const UK_PATHWAYS: UkPathway[] = [gallbladderUkPathway, tnbcUkPathway, pancreaticUkPathway, colorectalUkPathway, lungUkPathway, prostateUkPathway, breastUkPathway, skinUkPathway, lymphomaUkPathway];

/** The pathway for a cancer id, matching the canonical id or an alias. */
export function ukPathwayFor(cancerId: string): UkPathway | undefined {
  return UK_PATHWAYS.find((p) => p.cancerId === cancerId || p.aliases?.includes(cancerId));
}

/**
 * Cancer ids that get a /cancers/<id>/uk/ page: the canonical id and any alias that exists in the graph. The
 * canonical id is kept even when no record exists yet, so the page can ship ahead of the cancer record.
 */
export function ukPathwayCancerIds(): string[] {
  const g = graph();
  const out: string[] = [];
  for (const p of UK_PATHWAYS) {
    out.push(p.cancerId);
    for (const a of p.aliases ?? []) if (g.get(a)) out.push(a);
  }
  return [...new Set(out)];
}

export function ukPathwayRoute(cancerId: string, section?: string): string {
  return `/cancers/${cancerId}/uk/${section ? `#${section}` : ""}`;
}

/** Every URL a pathway cites, for the domain test and the machine link list. */
export function ukPathwayUrls(p: UkPathway): string[] {
  const urls: string[] = [];
  const src = (s: UkSource[] | undefined) => { for (const x of s ?? []) urls.push(x.url); };
  for (const x of p.presentation) src(x.sources);
  for (const x of p.timeline) src(x.sources);
  for (const x of p.centres) { urls.push(x.url); src(x.sources); }
  src(p.centresNote.sources);
  for (const x of p.funding) { urls.push(x.england.url); if (x.scotland) urls.push(x.scotland.url); }
  src(p.fundingNote?.sources);
  for (const x of p.tests) src(x.sources);
  src(p.testsNote?.sources);
  for (const x of p.trials) urls.push(x.url);
  src(p.trialsNote?.sources);
  for (const x of p.legacy) src(x.sources);
  for (const x of p.figures) urls.push(x.source.url);
  for (const x of p.support) { urls.push(x.url); if (x.source) urls.push(x.source.url); }
  for (const x of p.nations) src(x.sources);
  return [...new Set(urls)];
}

/** The compact JSON companion written to /api/v1/cancers/<id>/uk.json. */
export function ukPathwayJson(p: UkPathway): Record<string, unknown> {
  const g = graph();
  const name = (id: string) => g.get(id)?.name ?? id;
  return {
    ...p,
    route: ukPathwayRoute(p.cancerId),
    centres: p.centres.map((c) => ({ ...c, institutionName: c.institutionId ? name(c.institutionId) : undefined })),
    funding: p.funding.map((f) => ({ ...f, refNames: f.refs.map(name) })),
    sources: ukPathwayUrls(p),
  };
}

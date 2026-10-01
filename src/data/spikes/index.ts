/**
 * Cancer "spikes": deep dives that add entities and patch a cancer record without editing
 * the shared cancers.ts file. Each spike lives in its own file so several people (or agents)
 * can work in parallel.
 *
 * A spike exports:
 *   entities: EntityInput[]              new drugs, trials, technologies, targets, ideas, institutions…
 *   patch:    CancerPatch                fields merged into the existing cancer record
 *
 * Merge rules (see mergeSpikes, applied to cancers.ts and the NCI coverage lists): scalar fields override; array fields are appended and
 * de-duplicated (history is sorted by year after merge).
 */
import type { CancerInput, EntityInput } from "@/lib/schema";
import { TRIAL_OUTCOMES } from "../trial-outcomes";

export type CancerPatch = Partial<Omit<CancerInput, "id" | "kind">>;
/**
 * A partial record merged onto an entity another file owns (a target in targets.ts, a biomarker readout, a drug):
 * relation arrays, notes, links and prevalence rows are appended and de-duplicated; a scalar is taken only where the
 * owner left it empty. Applied to every input by applySpikeSupplements (src/data/index.ts), which fails the build if a
 * supplement names an id that does not exist. Use it to attach a cancer to records written elsewhere without
 * duplicating them (a duplicate id is an error; see graph.ts).
 */
export type SpikeSupplement = { id: string } & Record<string, unknown>;
export type Spike = { cancerId: string; entities: EntityInput[]; patch: CancerPatch; supplements?: SpikeSupplement[] };

// Register spikes here. Each file default-exports a Spike.
import nsclc from "./nsclc";
import prostate from "./prostate";
import pancreatic from "./pancreatic";
import pancreaticCore from "./pancreatic-core";
import glioblastoma from "./glioblastoma";
import breastHr from "./breast-hr-positive";
import breastHer2 from "./breast-her2-positive";
import hcc from "./hcc";
import cholangiocarcinoma from "./cholangiocarcinoma";
import neuroendocrine from "./neuroendocrine";
import melanoma from "./melanoma";
import headAndNeck from "./head-and-neck";
import thyroid from "./thyroid";
import colorectal from "./colorectal";
import colorectalCore from "./colorectal-core";
import gastric from "./gastric";
import esophageal from "./esophageal";
import sclc from "./sclc";
import mesothelioma from "./mesothelioma";
import urothelial from "./urothelial";
import rcc from "./rcc";
import ovarian from "./ovarian";
import endometrial from "./endometrial";
import cervical from "./cervical";
import aml from "./aml";
import allLeukemia from "./all-leukemia";
import cll from "./cll";
import dlbcl from "./dlbcl";
import multipleMyeloma from "./multiple-myeloma";
import hodgkin from "./hodgkin-lymphoma";
import sarcoma from "./sarcoma";
import neuroblastoma from "./neuroblastoma";
import gallbladderLiving from "./gallbladder-living";
import gallbladderMolecular from "./gallbladder-molecular";
import gallbladderCore from "./gallbladder-core";
import gallbladderUk from "./gallbladder-uk";
import tnbcUk from "./tnbc-uk";
import pancreaticUk from "./pancreatic-uk";
import colorectalUk from "./colorectal-uk";
import lungUk from "./lung-uk";
import prostateEvidence from "./prostate-evidence";
import prostateUk from "./prostate-uk";
import breastUk from "./breast-uk";
import skinUk from "./skin-uk";
import prostateMolecular from "./prostate-molecular";
import gallbladderEvidence from "./gallbladder-evidence";
import gallbladderTreatment from "./gallbladder-treatment";
import gallbladderGeography from "./gallbladder-geography";
import tnbcEvidence from "./tnbc-evidence";
import tnbcCore from "./tnbc-core";
import tnbcLiving from "./tnbc-living";
import tnbcMolecular from "./tnbc-molecular";
import tnbcTreatment from "./tnbc-treatment";
import pancreaticTreatment from "./pancreatic-treatment";
import pancreaticLiving from "./pancreatic-living";
import pancreaticEvidence from "./pancreatic-evidence";
import pancreaticMolecular from "./pancreatic-molecular";
import colorectalTreatment from "./colorectal-treatment";
import colorectalLiving from "./colorectal-living";
import colorectalMolecular from "./colorectal-molecular";
import colorectalEvidence from "./colorectal-evidence";
import lungCore, { nsclcCoreSpike, sclcTaxonomySpike } from "./lung-core";
import lungLiving, { nsclcLivingSpike, sclcLivingSpike } from "./lung-living";
import lungEvidence from "./lung-evidence";
import lungMolecular from "./lung-molecular";
import lungTreatment from "./lung-treatment";
import prostateCore, { prostateLowRiskSpike, prostateIntermediateRiskSpike, prostateHighRiskSpike, prostateBcrSpike, prostateMhspcSpike, prostateNmcrpcSpike, prostateMcrpcSpike, prostateNepcSpike } from "./prostate-core";
import prostateLiving from "./prostate-living";
import prostateTreatment from "./prostate-treatment";
import breastCore, { breastCoreHrPositiveSpike, breastCoreHer2PositiveSpike, breastCoreTnbcSpike, breastCoreDcisSpike, breastCoreLcisSpike, breastCoreNstSpike } from "./breast-core";
import prostateGlossary, { prostateGlossaryLowRiskSpike, prostateGlossaryIntermediateRiskSpike, prostateGlossaryHighRiskSpike, prostateGlossaryBcrSpike, prostateGlossaryMhspcSpike, prostateGlossaryNmcrpcSpike, prostateGlossaryMcrpcSpike, prostateGlossaryNepcSpike } from "./prostate-glossary";
import breastTreatment from "./breast-treatment";
import breastLiving from "./breast-living";
import skinLiving, { bccLivingSpike, csccLivingSpike } from "./skin-living";
import skinCore, { skinCoreBccSpike, skinCoreCsccSpike, skinCoreMerkelSpike } from "./skin-core";
import lymphomaLiving, { dlbclLivingSpike, follicularLivingSpike, hodgkinLivingSpike, hodgkinAdvancedLivingSpike, hodgkinEarlyLivingSpike, hodgkinRelapsedLivingSpike, mantleCellLivingSpike, marginalZoneLivingSpike, waldenstromLivingSpike, ptclLivingSpike } from "./lymphoma-living";
import lymphomaMolecular, { dlbclMolecularSpike, flMolecularSpike, mclMolecularSpike, hodgkinMolecularSpike, pmbclMolecularSpike, burkittMolecularSpike, pcnslMolecularSpike, wmMolecularSpike, maltMolecularSpike, mzlMolecularSpike, ptclMolecularSpike, aitlMolecularSpike, ctclMolecularSpike, sezaryMolecularSpike, richterMolecularSpike } from "./lymphoma-molecular";
import lymphomaTreatment, { lymphomaNonHodgkinSpike } from "./lymphoma-treatment";
import lymphomaTreatmentBcell, { pmbclTreatmentSpike, burkittTreatmentSpike, pcnslTreatmentSpike, mzlTreatmentSpike, maltTreatmentSpike, smzlTreatmentSpike, nmzlTreatmentSpike, mclTreatmentSpike, wmTreatmentSpike } from "./lymphoma-treatment-bcell";
import lymphomaTreatmentHodgkin, { hodgkinEarlyTreatmentSpike, hodgkinAdvancedTreatmentSpike, hodgkinRelapsedTreatmentSpike, nlphlTreatmentSpike } from "./lymphoma-treatment-hodgkin";
import lymphomaTreatmentTcell, { aitlTreatmentSpike, ctclTreatmentSpike, sezaryTreatmentSpike } from "./lymphoma-treatment-tcell";
import skinTreatment, { bccTreatmentSpike, csccTreatmentSpike, merkelTreatmentSpike, laBccTreatmentSpike, advCsccTreatmentSpike } from "./skin-treatment";
const spikes: Spike[] = [nsclc, prostate, pancreatic, pancreaticCore, pancreaticUk, glioblastoma, breastHr, breastHer2, hcc, cholangiocarcinoma, neuroendocrine, melanoma, headAndNeck, thyroid, colorectal, gastric, esophageal, sclc, mesothelioma, urothelial, rcc, ovarian, endometrial, cervical, aml, allLeukemia, cll, dlbcl, multipleMyeloma, hodgkin, sarcoma, neuroblastoma, tnbcCore, tnbcEvidence, tnbcUk, tnbcLiving, tnbcMolecular, tnbcTreatment, pancreaticLiving, pancreaticEvidence, pancreaticTreatment, pancreaticMolecular, colorectalLiving, colorectalUk, colorectalMolecular, colorectalEvidence, colorectalTreatment, colorectalCore, gallbladderCore, gallbladderLiving, gallbladderMolecular, gallbladderUk, gallbladderTreatment, gallbladderGeography, gallbladderEvidence, lungCore, nsclcCoreSpike, sclcTaxonomySpike, lungLiving, nsclcLivingSpike, sclcLivingSpike, lungEvidence, lungMolecular, lungTreatment, lungUk, prostateCore, prostateLowRiskSpike, prostateIntermediateRiskSpike, prostateHighRiskSpike, prostateBcrSpike, prostateMhspcSpike, prostateNmcrpcSpike, prostateMcrpcSpike, prostateNepcSpike, prostateLiving, prostateEvidence, prostateTreatment, prostateUk, prostateGlossary, prostateGlossaryLowRiskSpike, prostateGlossaryIntermediateRiskSpike, prostateGlossaryHighRiskSpike, prostateGlossaryBcrSpike, prostateGlossaryMhspcSpike, prostateGlossaryNmcrpcSpike, prostateGlossaryMcrpcSpike, prostateGlossaryNepcSpike, prostateMolecular, breastCore, breastCoreHrPositiveSpike, breastCoreHer2PositiveSpike, breastCoreTnbcSpike, breastCoreDcisSpike, breastCoreLcisSpike, breastCoreNstSpike, breastTreatment, breastLiving, breastUk, skinLiving, bccLivingSpike, csccLivingSpike, skinCore, skinCoreBccSpike, skinCoreCsccSpike, skinCoreMerkelSpike, skinTreatment, bccTreatmentSpike, csccTreatmentSpike, merkelTreatmentSpike, laBccTreatmentSpike, advCsccTreatmentSpike, skinUk, lymphomaTreatment, lymphomaNonHodgkinSpike, lymphomaTreatmentBcell, pmbclTreatmentSpike, burkittTreatmentSpike, pcnslTreatmentSpike, mzlTreatmentSpike, maltTreatmentSpike, smzlTreatmentSpike, nmzlTreatmentSpike, mclTreatmentSpike, wmTreatmentSpike, lymphomaTreatmentTcell, aitlTreatmentSpike, ctclTreatmentSpike, sezaryTreatmentSpike, lymphomaTreatmentHodgkin, hodgkinEarlyTreatmentSpike, hodgkinAdvancedTreatmentSpike, hodgkinRelapsedTreatmentSpike, nlphlTreatmentSpike, lymphomaLiving, dlbclLivingSpike, follicularLivingSpike, hodgkinLivingSpike, hodgkinAdvancedLivingSpike, hodgkinEarlyLivingSpike, hodgkinRelapsedLivingSpike, mantleCellLivingSpike, marginalZoneLivingSpike, waldenstromLivingSpike, ptclLivingSpike, lymphomaMolecular, dlbclMolecularSpike, flMolecularSpike, mclMolecularSpike, hodgkinMolecularSpike, pmbclMolecularSpike, burkittMolecularSpike, pcnslMolecularSpike, wmMolecularSpike, maltMolecularSpike, mzlMolecularSpike, ptclMolecularSpike, aitlMolecularSpike, ctclMolecularSpike, sezaryMolecularSpike, richterMolecularSpike];

/**
 * Spikes may overlap (two cancers adding the same drug). Duplicates are merged: the first full record's
 * scalars win, array fields are appended and de-duplicated. A supplement (see ./supplement.ts) has no
 * `name`; it never becomes the base, whichever spike is registered first.
 */
function mergeDuplicates(list: EntityInput[]): EntityInput[] {
  const byId = new Map<string, Record<string, unknown>>();
  for (const e of list) {
    const prev = byId.get(e.id);
    if (!prev) { byId.set(e.id, { ...e }); continue; }
    if (prev.kind !== e.kind) throw new Error(`Spike duplicate "${e.id}" has conflicting kinds ${String(prev.kind)} vs ${e.kind}`);
    const [base, extra]: [Record<string, unknown>, Record<string, unknown>] = prev.name === undefined && "name" in e ? [{ ...e }, prev] : [prev, e];
    for (const [k, v] of Object.entries(extra)) {
      if (Array.isArray(v) && Array.isArray(base[k])) base[k] = dedupe([...(base[k] as unknown[]), ...v]);
      else if (base[k] === undefined) base[k] = v;
    }
    byId.set(e.id, base);
  }
  return [...byId.values()] as EntityInput[];
}

export const spikeEntities: EntityInput[] = mergeDuplicates(spikes.flatMap((s) => s.entities.map((e) => (e.kind === "trial" && TRIAL_OUTCOMES[e.id] ? { ...e, ...TRIAL_OUTCOMES[e.id] } : e))));

const ARRAY_FIELDS = ["aka", "links", "tags", "related", "cancers", "sections", "technologies", "targets", "drugs", "companies", "institutions", "pathways", "terms", "trials", "people", "bottlenecks", "keyPapers", "journals", "notes", "subtypes", "biomarkers", "standardOfCare", "stateOfArt", "history", "pipeline", "openProblems"] as const;

function dedupe<T>(arr: T[]): T[] {
  const seen = new Set<string>();
  return arr.filter((x) => { const k = typeof x === "string" ? x : JSON.stringify(x); if (seen.has(k)) return false; seen.add(k); return true; });
}

const patchedCancerIds = new Set<string>();

/** Merge every spike patch for one cancer record, whichever file it lives in (cancers.ts, the NCI lists, subtype waves). */
export function mergeSpikeInto(c: CancerInput): CancerInput {
  const patches = spikes.filter((s) => s.cancerId === c.id).map((s) => s.patch);
  if (!patches.length) return c;
  patchedCancerIds.add(c.id);
  const out: Record<string, unknown> = { ...c };
  for (const p of patches) {
    for (const [k, v] of Object.entries(p)) {
      if (v === undefined) continue;
      if ((ARRAY_FIELDS as readonly string[]).includes(k) && Array.isArray(v)) out[k] = dedupe([...((out[k] as unknown[]) ?? []), ...v]);
      else out[k] = v;
    }
  }
  if (Array.isArray(out.history)) (out.history as Array<{ year: number | string }>).sort((a, b) => Number(a.year) - Number(b.year));
  return out as CancerInput;
}

export function mergeSpikes(cancers: CancerInput[]): CancerInput[] {
  return cancers.map(mergeSpikeInto);
}

/** Spike cancer ids no cancer record matched; the build fails on them (src/data/index.ts). A patch that lands nowhere is a silent loss. */
export function unpatchedSpikeCancers(): string[] {
  return [...new Set(spikes.map((s) => s.cancerId))].filter((id) => !patchedCancerIds.has(id));
}

// ---- Supplements onto records other files own ----
const supplementsById = new Map<string, SpikeSupplement[]>();
for (const s of spikes) for (const sup of s.supplements ?? []) supplementsById.set(sup.id, [...(supplementsById.get(sup.id) ?? []), sup]);
const supplementsApplied = new Set<string>();

/** Merge every spike supplement for this entity: arrays append and de-duplicate, scalars fill gaps only. */
export function applySpikeSupplements(e: EntityInput): EntityInput {
  const list = supplementsById.get(e.id);
  if (!list) return e;
  supplementsApplied.add(e.id);
  const out: Record<string, unknown> = { ...e };
  for (const sup of list) {
    for (const [k, v] of Object.entries(sup)) {
      if (k === "id" || v === undefined) continue;
      if (Array.isArray(v)) out[k] = dedupe([...((out[k] as unknown[] | undefined) ?? []), ...v]);
      else if (out[k] === undefined) out[k] = v;
    }
  }
  return out as EntityInput;
}

/** Supplement ids that matched no input record; the build fails on them (src/data/index.ts). */
export function unappliedSpikeSupplements(): string[] {
  return [...supplementsById.keys()].filter((id) => !supplementsApplied.has(id));
}

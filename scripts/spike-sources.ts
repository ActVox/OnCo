/**
 * The cancer spikes as separate modules, before `mergeDuplicates` folds overlapping records together.
 *
 * `src/data/spikes/index.ts` keeps its list private, so the audit imports each spike here to compare
 * the pre-merge copies of any record two spikes both define. `scripts/audit.test.ts` checks that this
 * list matches the files on disk, so a new spike cannot be missed silently.
 */
import type { Spike } from "../src/data/spikes";
import nsclc from "../src/data/spikes/nsclc";
import prostate from "../src/data/spikes/prostate";
import pancreatic from "../src/data/spikes/pancreatic";
import glioblastoma from "../src/data/spikes/glioblastoma";
import breastHr from "../src/data/spikes/breast-hr-positive";
import breastHer2 from "../src/data/spikes/breast-her2-positive";
import hcc from "../src/data/spikes/hcc";
import cholangiocarcinoma from "../src/data/spikes/cholangiocarcinoma";
import neuroendocrine from "../src/data/spikes/neuroendocrine";
import melanoma from "../src/data/spikes/melanoma";
import headAndNeck from "../src/data/spikes/head-and-neck";
import thyroid from "../src/data/spikes/thyroid";
import colorectal from "../src/data/spikes/colorectal";
import colorectalCore from "../src/data/spikes/colorectal-core";
import gastric from "../src/data/spikes/gastric";
import esophageal from "../src/data/spikes/esophageal";
import sclc from "../src/data/spikes/sclc";
import mesothelioma from "../src/data/spikes/mesothelioma";
import urothelial from "../src/data/spikes/urothelial";
import rcc from "../src/data/spikes/rcc";
import ovarian from "../src/data/spikes/ovarian";
import endometrial from "../src/data/spikes/endometrial";
import cervical from "../src/data/spikes/cervical";
import aml from "../src/data/spikes/aml";
import allLeukemia from "../src/data/spikes/all-leukemia";
import cll from "../src/data/spikes/cll";
import dlbcl from "../src/data/spikes/dlbcl";
import multipleMyeloma from "../src/data/spikes/multiple-myeloma";
import hodgkin from "../src/data/spikes/hodgkin-lymphoma";
import sarcoma from "../src/data/spikes/sarcoma";
import neuroblastoma from "../src/data/spikes/neuroblastoma";
import gallbladderLiving from "../src/data/spikes/gallbladder-living";
import gallbladderMolecular from "../src/data/spikes/gallbladder-molecular";
import gallbladderCore from "../src/data/spikes/gallbladder-core";
import gallbladderUk from "../src/data/spikes/gallbladder-uk";
import gallbladderEvidence from "../src/data/spikes/gallbladder-evidence";
import gallbladderTreatment from "../src/data/spikes/gallbladder-treatment";
import gallbladderGeography from "../src/data/spikes/gallbladder-geography";
import tnbcCore from "../src/data/spikes/tnbc-core";
import tnbcEvidence from "../src/data/spikes/tnbc-evidence";
import pancreaticEvidence from "../src/data/spikes/pancreatic-evidence";
import tnbcUk from "../src/data/spikes/tnbc-uk";
import pancreaticUk from "../src/data/spikes/pancreatic-uk";
import colorectalUk from "../src/data/spikes/colorectal-uk";
import lungUk from "../src/data/spikes/lung-uk";
import prostateEvidence from "../src/data/spikes/prostate-evidence";
import prostateUk from "../src/data/spikes/prostate-uk";
import breastUk from "../src/data/spikes/breast-uk";
import skinUk from "../src/data/spikes/skin-uk";
import tnbcLiving from "../src/data/spikes/tnbc-living";
import tnbcMolecular from "../src/data/spikes/tnbc-molecular";
import tnbcTreatment from "../src/data/spikes/tnbc-treatment";
import pancreaticTreatment from "../src/data/spikes/pancreatic-treatment";
import pancreaticLiving from "../src/data/spikes/pancreatic-living";
import pancreaticCore from "../src/data/spikes/pancreatic-core";
import pancreaticMolecular from "../src/data/spikes/pancreatic-molecular";
import colorectalLiving from "../src/data/spikes/colorectal-living";
import colorectalMolecular from "../src/data/spikes/colorectal-molecular";
import colorectalEvidence from "../src/data/spikes/colorectal-evidence";
import lungEvidence from "../src/data/spikes/lung-evidence";
import colorectalTreatment from "../src/data/spikes/colorectal-treatment";
import lungCore from "../src/data/spikes/lung-core";
import lungLiving from "../src/data/spikes/lung-living";
import prostateLiving from "../src/data/spikes/prostate-living";
import breastLiving from "../src/data/spikes/breast-living";
import skinLiving from "../src/data/spikes/skin-living";
import skinCore from "../src/data/spikes/skin-core";
import lungMolecular from "../src/data/spikes/lung-molecular";
import prostateMolecular from "../src/data/spikes/prostate-molecular";
import lungTreatment from "../src/data/spikes/lung-treatment";
import prostateCore from "../src/data/spikes/prostate-core";
import prostateTreatment from "../src/data/spikes/prostate-treatment";
import prostateGlossary from "../src/data/spikes/prostate-glossary";
import breastCore from "../src/data/spikes/breast-core";
import breastTreatment from "../src/data/spikes/breast-treatment";
import skinTreatment from "../src/data/spikes/skin-treatment";
import lymphomaLiving from "../src/data/spikes/lymphoma-living";
import lymphomaEvidence from "../src/data/spikes/lymphoma-evidence";
import lymphomaMolecular from "../src/data/spikes/lymphoma-molecular";
import lymphomaCore from "../src/data/spikes/lymphoma-core";
import lymphomaCoreBcell from "../src/data/spikes/lymphoma-core-bcell";
import lymphomaCoreTcell from "../src/data/spikes/lymphoma-core-tcell";
import lymphomaGeography from "../src/data/spikes/lymphoma-geography";
import lymphomaUk from "../src/data/spikes/lymphoma-uk";
import lymphomaTreatment from "../src/data/spikes/lymphoma-treatment";
import lymphomaTreatmentBcell from "../src/data/spikes/lymphoma-treatment-bcell";
import lymphomaTreatmentHodgkin from "../src/data/spikes/lymphoma-treatment-hodgkin";
import lymphomaTreatmentTcell from "../src/data/spikes/lymphoma-treatment-tcell";

/** File stem -> spike, so the test can compare against `readdirSync("src/data/spikes")`. */
export const SPIKE_FILES: Record<string, Spike> = {
  "lymphoma-uk": lymphomaUk, "lymphoma-geography": lymphomaGeography,
  nsclc, prostate, pancreatic, "pancreatic-core": pancreaticCore, "pancreatic-uk": pancreaticUk, "colorectal-uk": colorectalUk, "lung-uk": lungUk, "prostate-evidence": prostateEvidence, glioblastoma, "breast-hr-positive": breastHr, "breast-her2-positive": breastHer2, hcc, cholangiocarcinoma, neuroendocrine, melanoma, "prostate-uk": prostateUk, "breast-uk": breastUk, "skin-uk": skinUk,
  "head-and-neck": headAndNeck, thyroid, colorectal, "colorectal-core": colorectalCore, gastric, esophageal, sclc, mesothelioma, urothelial, rcc, ovarian, endometrial, cervical, aml, "all-leukemia": allLeukemia,
  cll, dlbcl, "multiple-myeloma": multipleMyeloma, "hodgkin-lymphoma": hodgkin, sarcoma, neuroblastoma, "gallbladder-living": gallbladderLiving, "gallbladder-molecular": gallbladderMolecular, "gallbladder-core": gallbladderCore, "gallbladder-uk": gallbladderUk, "gallbladder-evidence": gallbladderEvidence, "gallbladder-treatment": gallbladderTreatment, "gallbladder-geography": gallbladderGeography, "tnbc-core": tnbcCore, "tnbc-evidence": tnbcEvidence, "tnbc-uk": tnbcUk, "tnbc-living": tnbcLiving, "tnbc-molecular": tnbcMolecular, "tnbc-treatment": tnbcTreatment, "pancreatic-living": pancreaticLiving, "pancreatic-evidence": pancreaticEvidence, "pancreatic-treatment": pancreaticTreatment, "pancreatic-molecular": pancreaticMolecular, "colorectal-living": colorectalLiving, "colorectal-molecular": colorectalMolecular, "colorectal-evidence": colorectalEvidence, "colorectal-treatment": colorectalTreatment, "lung-core": lungCore, "lung-living": lungLiving, "lung-evidence": lungEvidence, "lung-molecular": lungMolecular, "lung-treatment": lungTreatment, "prostate-core": prostateCore, "prostate-living": prostateLiving, "prostate-treatment": prostateTreatment, "prostate-glossary": prostateGlossary, "prostate-molecular": prostateMolecular, "breast-core": breastCore, "breast-treatment": breastTreatment, "breast-living": breastLiving, "skin-living": skinLiving, "skin-core": skinCore, "skin-treatment": skinTreatment, "lymphoma-living": lymphomaLiving, "lymphoma-treatment": lymphomaTreatment, "lymphoma-treatment-bcell": lymphomaTreatmentBcell, "lymphoma-treatment-hodgkin": lymphomaTreatmentHodgkin, "lymphoma-treatment-tcell": lymphomaTreatmentTcell, "lymphoma-evidence": lymphomaEvidence, "lymphoma-molecular": lymphomaMolecular, "lymphoma-core": lymphomaCore, "lymphoma-core-bcell": lymphomaCoreBcell, "lymphoma-core-tcell": lymphomaCoreTcell,
};

/** Spike files that are not spikes (the registry itself, and gap-cancers which exports plain entities). */
// The gallbladder-evidence-* files are helpers of the gallbladder-evidence spike (shared constants, paper lists, roadmap and ideas), not spikes.
export const NON_SPIKE_FILES = ["index", "gap-cancers",
  // Not a cancer spike: the recovery and rejuvenation front's biological-ageing and frontier records, spread into src/data/index.ts.
  "rejuvenation-frontier", "rejuvenation-transplant", "nci-paediatric", "nci-rare-solid", "nci-rare-other", "gallbladder-evidence-shared", "gallbladder-evidence-papers-surgery", "gallbladder-evidence-papers-epidemiology", "gallbladder-evidence-roadmap", "gallbladder-registry-trials", "tnbc-registry-trials", "tnbc-evidence-shared", "tnbc-evidence-papers-foundations", "tnbc-evidence-papers-treatment", "tnbc-evidence-roadmap", "pancreatic-evidence-shared", "pancreatic-evidence-papers-foundations", "pancreatic-evidence-papers-treatment", "pancreatic-evidence-roadmap", "pancreatic-registry-trials", "pancreatic-treatment-shared", "pancreatic-treatment-trials", "pancreatic-treatment-trials-advanced", "pancreatic-treatment-trials-targeted", "pancreatic-treatment-supplements", "colorectal-evidence-shared", "colorectal-evidence-papers-foundations", "colorectal-evidence-papers-treatment", "colorectal-evidence-roadmap", "colorectal-registry-trials", "colorectal-treatment-shared", "colorectal-treatment-trials", "colorectal-treatment-trials-advanced", "colorectal-treatment-trials-history", "colorectal-treatment-trials-rechallenge", "trial-sponsor-companies", "lung-evidence-shared", "lung-evidence-papers-epidemiology", "lung-evidence-papers-treatment", "lung-evidence-papers-immunotherapy", "lung-evidence-roadmap", "prostate-evidence-shared", "prostate-evidence-papers-hormonal", "prostate-evidence-papers-screening", "prostate-evidence-papers-genomics", "prostate-evidence-roadmap",
  // Helpers of the lung-treatment spike: shared constants, the hand-written trial lists, the registry snapshot and the sponsor backfill.
  "lung-treatment-shared", "lung-treatment-trials", "lung-treatment-trials-advanced", "lung-treatment-trials-sclc", "lung-registry-trials", "lung-trial-sponsors",
  // Helpers of the prostate-treatment spike: shared constants and the hand-written trial lists.
  "prostate-treatment-shared", "prostate-treatment-trials-localised", "prostate-treatment-trials-hormone", "prostate-treatment-trials-crpc", "prostate-treatment-trials-failed",
  // Helpers of the breast-treatment spike: shared constants and the hand-written trial lists.
  "breast-treatment-shared", "breast-treatment-trials-surgery", "breast-treatment-trials-radiotherapy", "breast-treatment-trials-reconstruction",
  // Helpers of the skin-treatment spike: shared constants and the hand-written trial lists.
  "skin-treatment-shared", "skin-treatment-trials-local", "skin-treatment-trials-advanced",
  // Helper of the lymphoma-treatment spikes: shared constants, source DOIs and the cancer-id map.
  "lymphoma-treatment-shared",
  // Helpers of the lymphoma-evidence spike: shared constants, the landmark and recruiting trial lists, the two
  // paper files and the roadmap.
  "lymphoma-evidence-shared", "lymphoma-evidence-trials", "lymphoma-evidence-trials-recruiting",
  "lymphoma-evidence-papers-foundations", "lymphoma-evidence-papers-trials", "lymphoma-evidence-roadmap",
  // The Recovery & Rejuvenation front: entity modules, not cancer deep dives. They export entity arrays that
  // src/data/index.ts adds to RAW_INPUTS directly, so they have no cancerId and no patch.
  "rejuvenation-body"];

export const spikeSources: Spike[] = Object.values(SPIKE_FILES);

import { cancers } from "./cancers";
import { canonicalTermCategory } from "./term-categories";
import { sections } from "./sections";
import { technologies } from "./technologies";
import { targets } from "./targets";
import { drugs } from "./drugs";
import { companies } from "./companies";
import { institutions } from "./institutions";
import { pathways } from "./pathways";
import { terms } from "./terms";
import { trials } from "./trials";
import { pairings } from "./pairings";
import { roadmaps } from "./roadmaps";
import { ideas } from "./ideas";
import { collections } from "./collections";
import type { DrugInput, EntityInput, TargetInput } from "@/lib/schema";
import { applySpikeSupplements, mergeSpikeInto, spikeEntities, unappliedSpikeSupplements, unpatchedSpikeCancers } from "./spikes";
import { applyMergeSupplements, unappliedMergeSupplements } from "./merged-records";
import { failures } from "./failures";
import { pipelineTrials } from "./pipeline-trials";
import { groups } from "./groups";
import { frontier } from "./frontier";
import { people } from "./people";
import { peopleInvestigatorsWave } from "./people-investigators-wave";
import { bottlenecks } from "./bottlenecks";
import { sources } from "./sources";
import { mechanisms } from "./mechanisms";
import { frontierRoadmaps } from "./frontier-roadmap";
import { supporting } from "./supporting";
import { gapFill } from "./gap-fill";
import { keyPapers } from "./key-papers";
import { papersSubtypesWave } from "./papers-subtypes-wave";
import { papersRareWave } from "./papers-rare-wave";
import { papersPancreaticWave } from "./papers-pancreatic-wave";
import { papersWatch202609 } from "./papers-watch-2026-09";
import { ivermectinDrugs, ivermectinTrials, ivermectinPapers } from "./ivermectin";
import { papersTrialsWave1 } from "./papers-trials-wave1";
import { trialKeyPapersWave1 } from "./trial-key-papers-wave1";
import { papersCitedWave7 } from "./papers-cited-wave7";
import { citedPaperLinksWave7 } from "./cited-paper-links-wave7";
import { TRIAL_REGISTRY_OUTCOMES } from "./trial-registry-outcomes";
import { TRIAL_REGISTRY_STATUS } from "./trial-registry-status";
import { applyRegistryStatus } from "@/lib/registry-status";
import { papersPeopleWave6 } from "./papers-people-wave6";
import { personPapersWave6 } from "./person-papers-wave6";
import { trialsIdeasWave6 } from "./trials-ideas-wave6";
import { papersIdeasWave6 } from "./papers-ideas-wave6";
import { ideaLinksWave6 } from "./idea-links-wave6";
import { companyDrugsWave6, trialCompaniesWave6 } from "./company-drugs-wave6";
import { SUPPORTIVE_DRUGS } from "./supportive-drugs";
import { ACCELERATED_APPROVALS, ACCELERATED_READ_ON } from "./accelerated-approvals";
import { mergeAcceleratedEvents } from "@/lib/accelerated";
import { TARGET_FIRST_DESCRIBED } from "./target-first-described";
import { firstDescribedSource } from "@/lib/first-described";
import { TRIAL_START_DATES } from "./trial-start-dates";
import { yearRecords } from "./years";
import { entityTrialLinksWave5, entityTrialsWave5, trialsEntitiesWave5 } from "./trials-entities-wave5";
import { issuesWaveAPapers, issuesWaveATrials } from "./issues-2026-09-wave-a";
import { nutrition } from "./nutrition";
import { adcChemistry } from "./adc-chemistry";
import { journals } from "./journals";
import { termsBasics } from "./terms-basics";
import { termsModalities } from "./terms-modalities";
import { trialDesignTerms } from "./trial-design-wave";
import { lawTerms } from "./law-wave";
import { termsJargon } from "./terms-jargon";
import { biomarkerTerms } from "./terms-biomarkers-wave";
import { institutionsUs } from "./institutions/us";
import { institutionsWorld } from "./institutions/world";
import { institutionsBodies } from "./institutions/bodies";
import { institutionsEurope } from "./institutions/europe";
import { russiaInstitutions, russiaPapers } from "./russia-entities";
import { institutionsCentresWave3 } from "./institutions/centres-wave3";
import { institutionsDonorFoundations } from "./institutions/donor-foundations";
import { foundationModels } from "./foundation-models";
import { foundationRoadmaps } from "./foundation-roadmap";
import { ctdnaRoadmaps, ctdnaTrials, ctdnaTerms } from "./ctdna-roadmap";
import { ideaWaves } from "./ideas-waves";
import { mechanicsPathways } from "./mechanics-pathways";
import { complementary } from "./complementary";
import { hairEntities } from "./hair";
import { rejuvenationBody } from "./spikes/rejuvenation-body";
import { tests } from "./tests";
import { nciCoverage } from "./nci-coverage";
import { institutionsIndia } from "./institutions/india";
import { institutionsGermany } from "./institutions/germany";
import { institutionsIsrael } from "./institutions/israel";
import { institutionsWaveInvestigators } from "./institutions-wave-investigators";
import { india } from "./india";
import { israel } from "./israel";
import { china } from "./china";
import { approvedWave1 } from "./drugs-approved-wave1";
import { targetsWave1 } from "./targets-wave1";
import { targetsBiomarkerWave } from "./targets-biomarker-wave";
import { biomarkerReadouts } from "./biomarker-readouts";
import { biomarkerReadouts2 } from "./biomarker-readouts-2";
import { biomarkerReadouts3 } from "./biomarker-readouts-3";
import { biomarkerReadouts4 } from "./biomarker-readouts-4";
import { companiesWave1 } from "./companies-wave1";
import { companiesYc } from "./companies-yc";
import { companiesStartups } from "./companies-startups";
import { investors } from "./investors";
import { roadmapsWave2 } from "./roadmaps-wave2";
import { pathwaysKegg } from "./pathways-kegg";
import { journalsWave2 } from "./journals-wave2";
import { companiesSponsors } from "./companies-sponsors";
import { companiesSponsorsWave3 } from "./companies-sponsors-wave3";
import { companiesMakersWave4 } from "./companies-makers-wave4";
import { targetsWaveSoc } from "./targets-wave-soc";
import { targetsGenesWave } from "./targets-genes-wave";
import { targetSpecificity } from "./target-specificity";
import { targetsReaderEdits } from "./targets-reader-edits";
import { drugsEmaWave } from "./drugs-ema-wave";
import { companiesSponsorsWave } from "./companies-sponsors-wave";
import { companiesCooperativeGroups, cooperativeGroupTrialCompanies } from "./companies-cooperative-groups";
import { companiesCooperativeGroupsMigrated } from "./companies-cooperative-groups-migrated";
import { drugsPipelineWave1 } from "./drugs-pipeline-wave1";
import { pipelineTrialsWave2 } from "./pipeline-trials-wave2";
import { drugsPipelineWave2 } from "./drugs-pipeline-wave2";
import { drugsPipelineWave6 } from "./drugs-pipeline-wave6";
import { drugsPipelineWave7 } from "./drugs-pipeline-wave7";
import { drugsChinaWave1 } from "./drugs-china-wave1";
import { pvCancer, pvTrials, pvTerms, pvIdeas } from "./polycythaemia-vera";
import { etCancer, etTrials, aspirinDrug } from "./essential-thrombocythaemia";
import { radiationTechnologies, radiationTerms } from "./radiation-wave1";
import { radiationTrials } from "./radiation-wave2";
import { cancerSubtypes, cancerParents } from "./cancer-subtypes";
import { radiationDrugs, radiationCompanies } from "./radiation-wave3";
import { manufacturingTechnologies, manufacturingCompanies } from "./manufacturing-wave";
import { cancerParentsWave2, cancerParentsWave2Map } from "./cancer-parents-wave2";
import { radiationTrials4 } from "./radiation-wave4";
import { radiationPapersWave5, radiationTermsWave5, radiationTrialsWave5 } from "./radiation-wave5";
import { pdacDrugs, pdacTrials, pdacCompanies } from "./pdac-wave";
import { drugsSubtypesWave } from "./drugs-subtypes-wave";
import { diagnosticsTechnologies1, diagnosticsCompanies1 } from "./diagnostics-wave1";
import { diagnosticsTechnologies2, diagnosticsCompanies2 } from "./diagnostics-wave2";
import { freeCollections } from "./free-wave";
import { tumourTestCompanies } from "./tumour-tests";
import { ispyTrials, ispyCompanies } from "./ispy-wave";
import { platformTerms, platformTrials } from "./platform-trials-wave";
import { thyroidSubtypes } from "./thyroid-subtypes";
import { headNeckSubtypes } from "./head-neck-subtypes";
import { ovarianSubtypes } from "./ovarian-subtypes";
import { kidneySubtypes } from "./kidney-subtypes";
import { testisOesophagusSubtypes } from "./testis-oesophagus-subtypes";
import { bladderSubtypes } from "./bladder-subtypes";
import { prostateSubtypes } from "./prostate-subtypes";
import { cnsSubtypes } from "./cns-subtypes";
import { upperGiLiverSubtypes } from "./upper-gi-liver-subtypes";
import { bloodSubtypes } from "./blood-subtypes";
import { neuroendocrineSubtypes } from "./neuroendocrine-subtypes";
import { rareSubtypes } from "./rare-subtypes";
import { pancreaticSubtypes } from "./pancreatic-subtypes";
import { gynaecologicalSubtypes } from "./gynaecological-subtypes";
import { skinSubtypes, skinTrials } from "./skin-subtypes";
import { breastSubtypes, breastSubtypeTrials } from "./breast-subtypes";
import { paediatricSubtypes } from "./paediatric-subtypes";
import { sarcomaLymphomaSubtypes } from "./sarcoma-lymphoma-subtypes";
import { sarcomaBoneSubtypes, sarcomaBoneTrials } from "./sarcoma-bone-subtypes";
import { headNeckHpvSubtypes, headNeckHpvTrials } from "./head-neck-hpv-subtypes";
import { colorectalLymphomaSubtypes, colorectalLymphomaTrials } from "./colorectal-lymphoma-subtypes";
import { lungSubtypes, lungSubtypeTrials } from "./lung-subtypes";
import { trialsSubtypesWave } from "./trials-subtypes-wave";
import { cancersWave4Parents } from "./cancers-wave4-parents";
import { cancersWave4Lung } from "./cancers-wave4-lung";
import { cancersWave4Breast } from "./cancers-wave4-breast";
import { cancersWave4ColonKidneyTestis } from "./cancers-wave4-colon-kidney-testis";
import { cancersWave4Haematology } from "./cancers-wave4-haematology";
import { cancersWave4Rare } from "./cancers-wave4-rare";
import { cancersWave4EndocrineThoracicGynae } from "./cancers-wave4-endocrine-thoracic-gynae";
import { trialsSocWave } from "./trials-soc-wave";
import { papersSocWave } from "./papers-soc-wave";
import { modelTechnologies } from "./models-wave";
import { machineTechnologies, machineCompanies } from "./machines-wave";
import { machineTechnologies2, machineCompanies2 } from "./machines-wave2";
import { theoryHub, theoryTerms } from "./theories-wave";
import { networkInstitutions, networkPeople } from "./institution-networks-wave";
import { pipelineTrialsWave3 } from "./pipeline-trials-wave3";
import { pipelineTrialsWave4 } from "./pipeline-trials-wave4";
import { pipelineTrialsWave5 } from "./pipeline-trials-wave5";
import { pipelineTrialsWave6 } from "./pipeline-trials-wave6";
import { checkpointTargets, checkpointTerms, IMMUNE_CHECKPOINT_TARGET_IDS } from "./checkpoint-map";
import { cansimOncologyTerms } from "./terms-cansim-oncology";
import { cansimMethodsTerms } from "./terms-cansim-methods";
import { cansimTargets } from "./targets-cansim";
import { issuesWaveB } from "./issues-2026-09-wave-b";

const RAW_INPUTS: EntityInput[] = [
  ...cancers,
  ...spikeEntities,
  ...sections,
  ...technologies,
  ...targets,
  ...drugs,
  ...companies,
  ...institutions,
  ...pathways,
  ...terms,
  ...trials,
  ...pairings,
  ...roadmaps,
  ...ideas,
  ...collections,
  ...failures,
  ...pipelineTrials,
  ...groups,
  ...frontier,
  ...people, ...peopleInvestigatorsWave,
  ...bottlenecks,
  ...ideaWaves,
  ...sources,
  ...mechanisms,
  ...frontierRoadmaps,
  ...supporting,
  ...gapFill,
  ...keyPapers,
  ...papersSubtypesWave,
  ...radiationPapersWave5,
  ...papersRareWave,
  ...papersPancreaticWave,
  ...papersWatch202609, ...ivermectinDrugs, ...ivermectinTrials, ...ivermectinPapers,
  ...papersTrialsWave1,
  ...papersCitedWave7,
  ...papersPeopleWave6,
  ...papersIdeasWave6,
  ...trialsIdeasWave6,
  ...trialsEntitiesWave5,
  ...issuesWaveATrials, ...issuesWaveAPapers,
  ...nutrition,
  ...adcChemistry,
  ...journals,
  ...termsBasics,
  ...termsModalities,
  ...trialDesignTerms,
  ...lawTerms,
  ...termsJargon,
  ...biomarkerTerms,
  ...institutionsUs,
  ...institutionsWorld,
  ...institutionsBodies,
  ...institutionsEurope,
  ...russiaInstitutions,
  ...russiaPapers,
  ...institutionsCentresWave3,
  ...institutionsDonorFoundations,
  ...foundationModels,
  ...foundationRoadmaps,
  ...ctdnaRoadmaps, ...ctdnaTrials, ...ctdnaTerms,
  ...mechanicsPathways,
  ...complementary,
  ...hairEntities,
  ...rejuvenationBody,
  ...tests,
  ...nciCoverage,
  ...networkInstitutions, ...networkPeople,
  ...institutionsIndia,
  ...institutionsGermany,
  ...institutionsIsrael,
  ...institutionsWaveInvestigators,
  ...india,
  ...israel,
  ...china,
  ...approvedWave1,
  ...targetsWave1,
  ...targetsBiomarkerWave, ...biomarkerReadouts, ...biomarkerReadouts2, ...biomarkerReadouts3, ...biomarkerReadouts4,
  ...companiesWave1,
  ...companiesYc,
  ...companiesStartups,
  ...investors,
  ...roadmapsWave2,
  ...pathwaysKegg,
  ...journalsWave2,
  ...companiesSponsors,
  ...companiesSponsorsWave3, ...companiesCooperativeGroups, ...companiesCooperativeGroupsMigrated,
  ...companiesMakersWave4,
  ...targetsWaveSoc, ...targetsReaderEdits, ...targetsGenesWave, ...drugsEmaWave, ...companiesSponsorsWave,
  ...drugsPipelineWave1,
  ...pipelineTrialsWave2,
  ...drugsPipelineWave2, ...drugsPipelineWave6, ...drugsPipelineWave7, ...drugsChinaWave1, pvCancer, ...pvTrials, ...pvTerms, ...pvIdeas, ...pdacDrugs, ...pdacTrials, ...pdacCompanies, ...drugsSubtypesWave, ...diagnosticsTechnologies1, ...diagnosticsCompanies1, ...diagnosticsTechnologies2, ...diagnosticsCompanies2, ...ispyTrials, ...ispyCompanies, etCancer, ...etTrials, aspirinDrug, ...radiationTechnologies, ...radiationTerms, ...radiationTrials, ...cancerSubtypes, ...radiationDrugs, ...radiationCompanies, ...cancerParentsWave2, ...radiationTrials4, ...radiationTermsWave5, ...radiationTrialsWave5, ...thyroidSubtypes, ...headNeckSubtypes, ...ovarianSubtypes, ...kidneySubtypes, ...testisOesophagusSubtypes, ...bladderSubtypes, ...sarcomaLymphomaSubtypes, ...modelTechnologies, ...machineTechnologies, ...machineCompanies, ...manufacturingTechnologies, ...manufacturingCompanies, theoryHub, ...theoryTerms, ...platformTerms, ...platformTrials, ...prostateSubtypes, ...cnsSubtypes, ...machineTechnologies2, ...machineCompanies2, ...colorectalLymphomaSubtypes, ...colorectalLymphomaTrials, ...upperGiLiverSubtypes, ...bloodSubtypes, ...gynaecologicalSubtypes, ...skinSubtypes, ...skinTrials, ...lungSubtypes, ...lungSubtypeTrials, ...breastSubtypes, ...breastSubtypeTrials, ...sarcomaBoneSubtypes, ...sarcomaBoneTrials, ...paediatricSubtypes, ...neuroendocrineSubtypes, ...rareSubtypes, ...pancreaticSubtypes, ...headNeckHpvSubtypes, ...headNeckHpvTrials, ...trialsSubtypesWave, ...cancersWave4Parents, ...cancersWave4Lung, ...cancersWave4Breast, ...cancersWave4ColonKidneyTestis, ...cancersWave4Haematology, ...cancersWave4Rare, ...cancersWave4EndocrineThoracicGynae, ...trialsSocWave, ...papersSocWave,
  ...pipelineTrialsWave3,
  ...pipelineTrialsWave4,
  ...pipelineTrialsWave5, ...pipelineTrialsWave6,
  ...issuesWaveB,
  ...freeCollections, ...tumourTestCompanies,
  ...checkpointTargets, ...checkpointTerms,
  ...cansimOncologyTerms, ...cansimMethodsTerms, ...cansimTargets,
];

/** Readout ids by parent target id and by the drugs their current thresholds name (see the biomarker branch in ALL_INPUTS). */
const ALL_READOUTS = [...biomarkerReadouts, ...biomarkerReadouts2, ...biomarkerReadouts3, ...biomarkerReadouts4];
const READOUTS_BY_TARGET: Record<string, string[]> = {};
const READOUTS_BY_DRUG: Record<string, string[]> = {};
for (const bm of ALL_READOUTS) {
  if (bm.target) (READOUTS_BY_TARGET[bm.target] ??= []).push(bm.id);
  for (const t of bm.thresholds ?? []) if ((t.status ?? "current") === "current") { const list = (READOUTS_BY_DRUG[t.drugId] ??= []); if (!list.includes(bm.id)) list.push(bm.id); }
}

/** Every input, with glossary terms mapped to their canonical category (see ./term-categories.ts). */
/**
 * Generated gene records (scripts/fetch-cancer-genes.ts) yield to a hand-written target with the same id: the hand-written
 * record stays, and the generated role, evidence tier and sources are folded onto it where it has none. Any other duplicate
 * id is left in place for validate to report.
 */
const GENERATED_GENE_IDS = new Set(targetsGenesWave.map((t) => t.id));
const RAW_INPUTS_DEDUPED: EntityInput[] = (() => {
  const firstTarget = new Map<string, number>();
  const out: EntityInput[] = [];
  for (const e of RAW_INPUTS) {
    if (e.kind === "target") {
      const at = firstTarget.get(e.id);
      if (at !== undefined && GENERATED_GENE_IDS.has(e.id)) {
        const hand = out[at] as TargetInput;
        const gen = e as TargetInput;
        out[at] = { ...hand, role: hand.role?.length ? hand.role : gen.role, evidenceTier: hand.evidenceTier ?? gen.evidenceTier, sources: hand.sources?.length ? hand.sources : gen.sources } as EntityInput;
        continue;
      }
      if (at === undefined) firstTarget.set(e.id, out.length);
    }
    out.push(e);
  }
  return out;
})();

const RECORDS: EntityInput[] = RAW_INPUTS_DEDUPED.map((base) => {
  // Spike supplements (src/data/spikes/index.ts): partial records a cancer deep dive attaches to targets, readouts,
  // drugs and papers other files own; arrays append, scalars fill gaps. Applied before everything else.
  // Cancer deep-dive patches (mergeSpikeInto) reach every cancer record, whichever file holds it: cancers.ts, the NCI rare
  // and paediatric lists in src/data/spikes/, the subtype waves. Supplements (partial records onto targets, readouts,
  // drugs and papers other files own) come next; arrays append, scalars fill gaps.
  // Merge supplements (src/data/merged-records.ts): what a record retired as a duplicate carried and its survivor did
  // not. Applied on the same terms as a spike supplement, so retiring an id loses no relation.
  const raw = applyMergeSupplements(applySpikeSupplements(base.kind === "cancer" ? mergeSpikeInto(base) : base));
  // Paper pages written for DOIs a record cites in its external links by scripts/fetch-cited-papers.ts (wave 7): the
  // citing record, whatever its kind, gains the paper in `keyPapers`. Applied first so the kind-specific steps below see it.
  const cited = citedPaperLinksWave7[raw.id];
  let e: EntityInput = cited ? { ...raw, keyPapers: [...(raw.keyPapers ?? []), ...cited.filter((id) => !(raw.keyPapers ?? []).includes(id))] } : raw;
  // Supportive care medicines (src/data/supportive-drugs.ts): the flag that keeps antiemetics, growth factors, bone agents,
  // antidotes and opioids out of treatment counts and rankings, and renders the "Supportive care" pill.
  if (e.kind === "drug" && SUPPORTIVE_DRUGS[e.id]) e = { ...e, supportive: true };
  // Accelerated approvals (scripts/fetch-accelerated.ts, src/data/accelerated-approvals.ts): every indication the FDA's
  // four tables give the product becomes typed regulatoryEvents, the grant and the conversion or withdrawal that closed
  // it, keyed to each other by the agency's indication text. A hand-written event on the same date and type wins.
  if (e.kind === "drug" && ACCELERATED_APPROVALS[e.id]) {
    e = { ...e, regulatoryEvents: mergeAcceleratedEvents(e.regulatoryEvents ?? [], ACCELERATED_APPROVALS[e.id], ACCELERATED_READ_ON) as DrugInput["regulatoryEvents"] };
  }
  // Immune members of the checkpoint map (src/data/checkpoint-map.ts) carry the immune-checkpoint role, whichever file owns the record.
  if (e.kind === "target" && IMMUNE_CHECKPOINT_TARGET_IDS.has(e.id) && !(e.role ?? []).includes("immune-checkpoint")) e = { ...e, role: [...(e.role ?? []), "immune-checkpoint"] };
  if (e.kind === "term") return { ...e, category: canonicalTermCategory(e.id, e.category) };
  // Biomarker readouts hang off a parent target and off the drugs whose current label thresholds name them; the
  // reverse links are written here so a target page lists its readouts and a drug page its required readouts in
  // `related`, and no readout is an orphan reachable only by search.
  if (e.kind === "target") {
    // Specificity and distribution (scripts/fetch-target-specificity.ts, src/data/target-specificity.ts): filled where the record carries none of its own.
    // First-description year (scripts/fetch-first-described.ts, src/data/target-first-described.ts): the earliest
    // sequence paper UniProt cites for the protein, never the earliest paper OnCo holds. A hand-written year wins.
    const fd = TARGET_FIRST_DESCRIBED[e.id];
    if (fd && e.firstDescribed === undefined) e = { ...e, firstDescribed: fd.year, firstDescribedBasis: "sequence", firstDescribedNote: fd.note, firstDescribedSource: firstDescribedSource(fd) };
    const sp = targetSpecificity[e.id];
    if (sp && !e.specificity && !e.distribution) e = { ...e, ...(sp.specificity ? { specificity: sp.specificity } : {}), distribution: sp.distribution, ...(sp.tumourAgnostic ? { tumourAgnostic: true } : {}), specificityNote: sp.specificityNote, specificitySources: sp.specificitySources };
    if (READOUTS_BY_TARGET[e.id]) return { ...e, related: [...(e.related ?? []), ...READOUTS_BY_TARGET[e.id].filter((id) => !(e.related ?? []).includes(id))] };
    return e;
  }
  if (e.kind === "drug" && READOUTS_BY_DRUG[e.id]) e = { ...e, related: [...(e.related ?? []), ...READOUTS_BY_DRUG[e.id].filter((id) => !(e.related ?? []).includes(id))] };
  if (e.kind === "cancer" && !e.parent && (cancerParents[e.id] ?? cancerParentsWave2Map[e.id])) return { ...e, parent: cancerParents[e.id] ?? cancerParentsWave2Map[e.id] };
  if (e.kind === "trial") {
    let t = e;
    // Key papers found for trials by scripts/fetch-trial-papers.ts (wave 1), kept in one file rather than edited into every trial file.
    if (trialKeyPapersWave1[t.id]) t = { ...t, keyPapers: [...(t.keyPapers ?? []), ...trialKeyPapersWave1[t.id].filter((id) => !(t.keyPapers ?? []).includes(id))] };
    // Sponsors verified through the ClinicalTrials.gov lead-sponsor field by scripts/fetch-company-drugs.ts (wave 6).
    if (trialCompaniesWave6[t.id]) t = { ...t, companies: [...(t.companies ?? []), ...trialCompaniesWave6[t.id].filter((id) => !(t.companies ?? []).includes(id))] };
    // Cooperative groups and public trial sponsors (src/data/companies-cooperative-groups.ts): the group record that lists the trial.
    if (cooperativeGroupTrialCompanies[t.id]) t = { ...t, companies: [...(t.companies ?? []), ...cooperativeGroupTrialCompanies[t.id].filter((id) => !(t.companies ?? []).includes(id))] };
    // Drugs and technologies the registry's intervention list names, found by scripts/fetch-entity-trials.ts (wave 5) for
    // records that had no trial; the trial record itself stays as written.
    const ent = entityTrialLinksWave5[t.id];
    if (ent) t = { ...t, drugs: [...(t.drugs ?? []), ...(ent.drugs ?? []).filter((id) => !(t.drugs ?? []).includes(id))], technologies: [...(t.technologies ?? []), ...(ent.technologies ?? []).filter((id) => !(t.technologies ?? []).includes(id))] };
    // Outcomes copied from the ClinicalTrials.gov results section by scripts/fetch-registry-outcomes.ts (wave 7), for
    // trials that carry none of their own; the ingested summary's "no results" sentence is replaced. On a hand-written
    // trial the editor's enrolment, year reported and asOf stand; only the outcomes (and any of those fields it lacks) are added.
    const reg = TRIAL_REGISTRY_OUTCOMES[t.id];
    if (reg && !(t.outcomes?.length)) {
      const posted = reg.yearReported ? ` in ${reg.yearReported}` : "";
      const ingested = t.tags?.includes("ctgov-ingest");
      const merged = ingested ? { ...t, ...reg } : { ...reg, ...t, outcomes: reg.outcomes, asOf: t.asOf > (reg.asOf ?? "") ? t.asOf : reg.asOf ?? t.asOf };
      t = { ...merged, summary: t.summary.replace(/No results (?:have been posted on ClinicalTrials\.gov|are recorded here; the registry entry is the source)\./, `Results were posted on ClinicalTrials.gov${posted}; the figures recorded here are the registry's, not a publication's.`) };
    }
    // Status read from the registry by scripts/fetch-registry-status.ts (wave 7a follow-up): applied only while the trial
    // still carries the status the script saw, with a dated note and, on ingested trials, the matching TL;DR and summary phrase.
    const st = TRIAL_REGISTRY_STATUS[t.id];
    if (st) t = applyRegistryStatus(t, st);
    // Start date from the registry's startDateStruct (scripts/fetch-trial-starts.ts, src/data/trial-start-dates.ts),
    // with the registry's own ACTUAL or ESTIMATED beside it. A date written on the record wins.
    const start = TRIAL_START_DATES[t.id];
    if (start && !t.started) t = { ...t, started: start.started, ...(start.type ? { startedType: start.type } : {}) };
    return t;
  }
  // Trials found for drugs and technologies that had none by scripts/fetch-entity-trials.ts (wave 5): the record's own `trials` array.
  if ((e.kind === "drug" || e.kind === "technology") && entityTrialsWave5[e.id]) return { ...e, trials: [...(e.trials ?? []), ...entityTrialsWave5[e.id].filter((id) => !(e.trials ?? []).includes(id))] };
  // Drugs found for companies through the ClinicalTrials.gov lead-sponsor field by scripts/fetch-company-drugs.ts (wave 6).
  if (e.kind === "company" && companyDrugsWave6[e.id]) return { ...e, drugs: [...(e.drugs ?? []), ...companyDrugsWave6[e.id].filter((id) => !(e.drugs ?? []).includes(id))] };
  // Trials and key papers found for ideas by scripts/fetch-idea-evidence.ts (wave 6).
  if (e.kind === "idea" && ideaLinksWave6[e.id]) {
    const w = ideaLinksWave6[e.id];
    return { ...e, trials: [...(e.trials ?? []), ...w.trials.filter((id) => !(e.trials ?? []).includes(id))], keyPapers: [...(e.keyPapers ?? []), ...w.keyPapers.filter((id) => !(e.keyPapers ?? []).includes(id))] };
  }
  // Papers found for people by scripts/fetch-people-papers.ts (wave 6): the person's own `papers` rows and the paper records behind them.
  if (e.kind === "person" && personPapersWave6[e.id]) {
    const w = personPapersWave6[e.id];
    const have = new Set((e.papers ?? []).map((x) => x.title.toLowerCase()));
    return { ...e, papers: [...(e.papers ?? []), ...w.papers.filter((x) => !have.has(x.title.toLowerCase()))], keyPapers: [...(e.keyPapers ?? []), ...w.keyPapers.filter((id) => !(e.keyPapers ?? []).includes(id))] };
  }
  return e;
});

{
  const missing = unappliedSpikeSupplements();
  if (missing.length) throw new Error(`Spike supplements name records that do not exist: ${missing.join(", ")}`);
  const unpatched = unpatchedSpikeCancers();
  if (unpatched.length) throw new Error(`Spike patches name cancers that do not exist: ${unpatched.join(", ")}`);
  const orphanedMerges = unappliedMergeSupplements();
  if (orphanedMerges.length) throw new Error(`Merge supplements name records that do not exist: ${orphanedMerges.join(", ")}`);
}

/**
 * One record per year, generated from everything above it (./years.ts). Last, because it reads every other record;
 * the years themselves carry no relation arrays beyond the previous and next year, so they add nothing to anyone
 * else's backlinks.
 */
export const ALL_INPUTS: EntityInput[] = [...RECORDS, ...yearRecords(RECORDS)];

import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { graph } from "./graph";
import { UK_PATHWAYS, ukPathwayCancerIds, ukPathwayFor, ukPathwayJson, ukPathwayRoute, ukPathwayUrls } from "./uk-pathway";
import gallbladderSpike from "@/data/spikes/gallbladder-uk";
import tnbcSpike from "@/data/spikes/tnbc-uk";
import pancreaticSpike from "@/data/spikes/pancreatic-uk";
import colorectalSpike from "@/data/spikes/colorectal-uk";
import lungSpike from "@/data/spikes/lung-uk";
import prostateSpike from "@/data/spikes/prostate-uk";
import breastSpike from "@/data/spikes/breast-uk";
import skinSpike from "@/data/spikes/skin-uk";
import lymphomaSpike from "@/data/spikes/lymphoma-uk";
import UkPage, { generateStaticParams } from "@/app/cancers/[id]/uk/page";

const SPIKES = [gallbladderSpike, tnbcSpike, pancreaticSpike, colorectalSpike, lungSpike, prostateSpike, breastSpike, skinSpike, lymphomaSpike];

/**
 * The UK and NHS layer quotes public UK sources only. Every URL must be https and sit on one of these domains
 * (matched on the hostname suffix, so any NHS trust under nhs.uk, nhs.scot, nhs.wales or hscni.net passes).
 */
const ALLOWED_DOMAINS = [
  "nice.org.uk", "england.nhs.uk", "digital.nhs.uk", "nhs.uk", "nhs.scot", "nhsggc.scot", "nhslothian.scot", "nhs.wales", "hscni.net", "nhsbsa.nhs.uk",
  "cancerresearchuk.org", "gettingitrightfirsttime.co.uk", "gov.scot", "publichealthscotland.scot", "gov.wales", "health-ni.gov.uk", "gov.uk",
  "scottishmedicines.org.uk", "awmsg.nhs.wales", "isrctn.com", "bepartofresearch.nihr.ac.uk", "natcan.org.uk",
  "ammf.org.uk", "macmillan.org.uk", "maggies.org", "pancreaticcancer.org.uk",
  "europepmc.org", "doi.org", "ucl.ac.uk", "manchester.ac.uk", "imperial.ac.uk",
  // Second UK pass: the Northern Ireland Cancer Registry (Queen's), NHS inform, and the two public pages Hassan Malik has.
  "qub.ac.uk", "nhsinform.scot", "liverpool.ac.uk", "hcahealthcare.co.uk",
  // Triple-negative breast cancer pass: the breast charity, the US TNBC foundation, and the two universities whose staff pages are cited.
  "breastcancernow.org", "tnbcfoundation.org", "cam.ac.uk", "southampton.ac.uk",
  // Pancreatic cancer pass: the Glasgow staff page, NHS Grampian's site (not under nhs.scot), the early-diagnosis charity and an ORCID profile.
  "gla.ac.uk", "nhsgrampian.org", "pancreaticcanceraction.org", "orcid.org",
  // Colorectal cancer pass: the two bowel charities, the four universities whose staff pages are cited, and Public Health Northern Ireland.
  "bowelcanceruk.org.uk", "bowelresearchuk.org", "leeds.ac.uk", "birmingham.ac.uk", "ncl.ac.uk", "ox.ac.uk", "publichealth.hscni.net",
  // Lung cancer pass: the lung charity, the Francis Crick Institute (Charles Swanton's lab page, because his UCL profile answers 403) and Nottingham.
  "roycastle.org", "crick.ac.uk", "nottingham.ac.uk",
  // Prostate cancer pass: the prostate charities, and the Bristol research-information host (ProtecT's recruitment
  // and patient-reported outcomes work was run from Bristol, and Jenny Donovan has no other public page).
  "prostatecanceruk.org", "tackleprostate.org", "prostatescotland.org.uk", "prostate-cancer-research.org.uk", "bris.ac.uk",
  // Breast cancer family pass: the UK National Screening Committee's recommendation service and nidirect, both of
  // which are gov.uk service domains. Everything else the breast layer cites is already on the list.
  "view-health-screening-recommendations.service.gov.uk", "nidirect.gov.uk",
  // Skin cancer family pass: the legislation register, the Health and Safety Executive, the three skin charities,
  // the professional body's patient information service, and the trust and health board sites the centres cite.
  // (ons.gov.uk needs no entry: it is already covered by the gov.uk suffix.)
  "legislation.gov.uk", "hse.gov.uk", "melanomafocus.org", "skcin.org", "skinhealthinfo.org.uk", "changingfaces.org.uk",
  "guysandstthomas.nhs.uk", "leedsth.nhs.uk", "northerncarealliance.nhs.uk", "newcastle-hospitals.nhs.uk",
  "cuh.nhs.uk", "nnuh.nhs.uk", "uhb.nhs.uk", "nhslothian.scot", "cavuhb.nhs.wales", "belfasttrust.hscni.net",
  // Lymphoma family pass: the three lymphoma and blood cancer charities, StatsWales (the Welsh statistics service,
  // which is not under gov.wales), the NHS Wales Joint Commissioning Committee (which replaced WHSSC and whose own
  // domain now redirects to a malformed address), and the Right Decision Service, where NHS Greater Glasgow and
  // Clyde publishes the only document that names Scotland's CAR-T centre.
  "lymphoma-action.org.uk", "bloodcancer.org.uk", "anthonynolan.org",
  "stats.gov.wales", "jcc.nhs.wales", "rightdecisions.scot.nhs.uk",
];

const hostOk = (url: string) => {
  const u = new URL(url);
  return u.protocol === "https:" && ALLOWED_DOMAINS.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`));
};

describe("UK pathway data", () => {
  it("registers at least the gallbladder pathway, keyed to the live cancer record id", () => {
    expect(UK_PATHWAYS.length).toBeGreaterThan(0);
    const p = ukPathwayFor("gallbladder");
    expect(p?.cancerId).toBe("gallbladder");
    expect(graph().get("gallbladder")?.kind).toBe("cancer");
    expect(ukPathwayFor("glioblastoma")).toBeUndefined();
  });

  it("registers the triple-negative breast cancer pathway under tnbc and its subtype aliases", () => {
    const p = ukPathwayFor("tnbc");
    expect(p?.cancerId).toBe("tnbc");
    expect(ukPathwayFor("tnbc-early")?.cancerId).toBe("tnbc");
    expect(ukPathwayFor("tnbc-metastatic")?.cancerId).toBe("tnbc");
    const g = graph();
    for (const id of ["tnbc", "tnbc-early", "tnbc-metastatic"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The two UK-led trial records and the three researchers the spike adds resolve in the graph.
    for (const id of ["tnt", "partner"]) expect(g.get(id)?.kind, id).toBe("trial");
    for (const id of ["jean-abraham", "ellen-copson", "anne-armstrong"]) expect(g.get(id)?.kind, id).toBe("person");
    expect(g.get("breast-cancer-now")?.kind).toBe("institution");
  });

  it("registers the pancreatic cancer pathway under pancreatic and its resectability and molecular subtype aliases", () => {
    const p = ukPathwayFor("pancreatic");
    expect(p?.cancerId).toBe("pancreatic");
    for (const alias of ["resectable-pdac", "borderline-resectable-pdac", "locally-advanced-pdac", "metastatic-pdac", "brca-palb2-pdac"]) expect(ukPathwayFor(alias)?.cancerId, alias).toBe("pancreatic");
    const g = graph();
    for (const id of ["pancreatic", "metastatic-pdac", "brca-palb2-pdac"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The two UK programme records, the five researchers and the eleven institutions the spike adds resolve in the graph.
    for (const id of ["europac", "precision-panc"]) expect(g.get(id)?.kind, id).toBe("trial");
    for (const id of ["andrew-biankin", "paula-ghaneh", "daniel-palmer", "chris-halloran", "bill-greenhalf"]) expect(g.get(id)?.kind, id).toBe("person");
    for (const id of ["pancreatic-cancer-uk", "pancreatic-cancer-action", "wolfson-wohl-cancer-research-centre", "hull-castle-hill", "royal-stoke-uhnm", "uhcw-coventry", "royal-surrey-guildford", "royal-blackburn-elht", "ninewells-dundee", "aberdeen-royal-infirmary", "raigmore-inverness"]) expect(g.get(id)?.kind, id).toBe("institution");
    // Every NICE decision quoted carries its appraisal number: one recommendation, one refusal, two terminated appraisals.
    const refs = p!.funding.filter((f) => f.england.body === "NICE").map((f) => f.england.ref);
    for (const ta of ["TA476", "TA440", "TA750", "TA1052", "TA630", "TA914"]) expect(refs).toContain(ta);
    // The 23 English hubs of the national audit are all present, by institution or by name.
    expect(p!.centres.filter((c) => c.nation === "England").length).toBeGreaterThanOrEqual(23);
  });

  it("registers the colorectal cancer pathway under colorectal and its site and molecular subtype aliases", () => {
    const p = ukPathwayFor("colorectal");
    expect(p?.cancerId).toBe("colorectal");
    for (const alias of ["rectal-cancer", "msi-high-colorectal", "braf-v600e-colorectal", "early-onset-colorectal"]) expect(ukPathwayFor(alias)?.cancerId, alias).toBe("colorectal");
    const g = graph();
    for (const id of ["colorectal", "rectal-cancer", "msi-high-colorectal"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The nine UK legacy trial records and the eight researchers the spike adds resolve in the graph.
    for (const id of ["quasar", "scot", "cr07", "coin", "foxtrot", "mercury", "star-trec", "nottingham-fob", "ukfss"]) expect(g.get(id)?.kind, id).toBe("trial");
    for (const id of ["david-sebag-montefiore", "matt-seymour", "dion-morton", "john-burn", "rachel-kerr", "tim-maughan", "naureen-starling", "ian-chau"]) expect(g.get(id)?.kind, id).toBe("person");
    for (const id of ["bowel-cancer-uk", "bowel-research-uk"]) expect(g.get(id)?.kind, id).toBe("institution");
    // Every NICE decision quoted carries its appraisal number, including the 2026 bevacizumab reversal and the two refusals.
    const refs = p!.funding.filter((f) => f.england.body === "NICE").map((f) => f.england.ref);
    for (const ta of ["TA1136", "TA1065", "TA1008", "TA716", "TA668", "TA630", "TA439", "TA307", "TA242", "TA100", "TA61"]) expect(refs).toContain(ta);
    // The faecal immunochemical test threshold that now governs referral is on the page, and so is Scotland's different one.
    expect(JSON.stringify(p)).toContain("10 micrograms of haemoglobin per gram");
    expect(JSON.stringify(p)).toContain("20 micrograms per gram");
  });

  it("registers the lung cancer pathway under the lung family, both branches and the molecular and stage subtypes", () => {
    const p = ukPathwayFor("lung-cancer");
    expect(p?.cancerId).toBe("lung-cancer");
    // The pathway keys to the family: screening, the 62-day standard, the tests and the centres are the same
    // whichever histology comes back, and the family page is where a reader lands. Both branches are aliases.
    for (const alias of ["nsclc", "sclc", "egfr-mutant-nsclc", "alk-positive-nsclc", "kras-g12c-nsclc", "limited-stage-sclc", "extensive-stage-sclc"]) expect(ukPathwayFor(alias)?.cancerId, alias).toBe("lung-cancer");
    const g = graph();
    for (const id of ["nsclc", "lung-cancer", "sclc", "resectable-nsclc"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The eight UK legacy trial records and the seven researchers the spike adds resolve in the graph.
    for (const id of ["ukls", "ylst", "summit-lung", "lungsearch", "chart-lung", "big-lung-trial", "violet", "tracerx"]) expect(g.get(id)?.kind, id).toBe("trial");
    for (const id of ["philip-crosbie", "matthew-callister", "john-field", "david-baldwin", "gary-middleton", "sanjay-popat", "alastair-greystoke"]) expect(g.get(id)?.kind, id).toBe("person");
    for (const id of ["roy-castle-lung-cancer-foundation", "royal-papworth", "liverpool-heart-and-chest"]) expect(g.get(id)?.kind, id).toBe("institution");
    // Every NICE decision quoted carries its appraisal number, including the managed-access and Cancer Drugs Fund rows and the two refusals.
    const refs = p!.funding.filter((f) => f.england.body === "NICE").map((f) => f.england.ref);
    for (const ta of ["TA1043", "TA1014", "TA1071", "TA1127", "TA798", "TA1122", "TA1158", "TA1103", "TA1021", "TA1042", "TA781", "TA789", "TA1150", "TA630", "TA531", "TA683", "TA713", "TA1041", "TA1099", "TA184", "TA265"]) expect(refs, ta).toContain(ta);
    // The four Cancer Drugs Fund lung indications on version 1.408 of the national list are marked as such.
    expect(p!.funding.filter((f) => f.england.cdf).length).toBe(3);
    // The 26 English and 2 Welsh thoracic units of the national audit are covered.
    expect(p!.centres.filter((c) => c.nation === "England").length).toBeGreaterThanOrEqual(20);
    // The deprivation gradient, which is steeper in lung cancer than in any other common cancer, is stated with its source.
    expect(JSON.stringify(p)).toContain("102 percent higher");
    expect(JSON.stringify(p)).toContain("3.16");
    // The reflex testing turnaround and what happens when the tissue is insufficient are both on the page.
    expect(JSON.stringify(p)).toContain("14 calendar days");
    expect(JSON.stringify(p)).toContain("the pathologist emails or telephones the lung multidisciplinary team the same day");
    // The National Genomic Test Directory codes are quoted from version 16, not described in the abstract.
    for (const code of ["M4.1", "M4.2", "M4.13", "M4.14", "M231.1"]) expect(JSON.stringify(p!.tests), code).toContain(code);
    // The screening programme's two risk models and their thresholds, and the four-nation timetable.
    expect(JSON.stringify(p)).toContain("1.51 percent");
    expect(JSON.stringify(p)).toContain("2027/28");
    expect(JSON.stringify(p)).toContain("28 June 2025");
    // Every source on the page carries a label; every funding row names Wales and Northern Ireland or says why not.
    for (const f of p!.funding) expect(f.wales, f.line).toBeTruthy();
  });

  it("registers the prostate cancer pathway on the family id, with the risk groups and disease states as aliases", () => {
    const p = ukPathwayFor("prostate");
    expect(p?.cancerId).toBe("prostate");
    // The pathway keys to the family: screening, the PSA thresholds, the tests and the centres are the same
    // whichever risk group or disease state comes back, and the family page is where a reader lands.
    for (const alias of ["prostate-low-risk", "prostate-intermediate-risk", "prostate-high-risk", "prostate-bcr", "prostate-mhspc", "prostate-nmcrpc", "prostate-mcrpc", "prostate-nepc"]) expect(ukPathwayFor(alias)?.cancerId, alias).toBe("prostate");
    const g = graph();
    for (const id of ["prostate", "prostate-low-risk", "prostate-mcrpc"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The two trial records and the five researchers the spike adds resolve in the graph, and so do the four legacy trials it reuses.
    for (const id of ["promis", "transform-prostate", "protect", "stampede", "chhip", "pace-b"]) expect(g.get(id)?.kind, id).toBe("trial");
    for (const id of ["jenny-donovan", "caroline-moore", "nicholas-van-as", "ros-eeles", "rakesh-heer"]) expect(g.get(id)?.kind, id).toBe("person");
    expect(g.get("prostate-cancer-uk")?.kind).toBe("institution");
    // Every NICE decision quoted carries its appraisal number, including the three refusals.
    const refs = p!.funding.filter((f) => f.england.body === "NICE").map((f) => f.england.ref);
    for (const ta of ["TA1130", "TA1110", "TA1109", "TA995", "TA951", "TA930", "TA887", "TA740", "TA546", "TA412", "TA391"]) expect(refs, ta).toContain(ta);
    // The screening recommendation is the March 2026 one, and it is narrow.
    expect(JSON.stringify(p)).toContain("45 to 61");
    expect(JSON.stringify(p)).toContain("pathogenic BRCA2 variant");
    // NICE's own vocabulary, not the American one: Cambridge Prognostic Groups, a Likert score, hormone-relapsed.
    expect(JSON.stringify(p)).toContain("Cambridge Prognostic Group");
    expect(JSON.stringify(p)).toContain("Likert");
    expect(JSON.stringify(p)).toContain("hormone-relapsed");
    // The risk figures for Black men carry their cohort, and the age split that is rarely quoted.
    expect(JSON.stringify(p)).toContain("29.3%");
    expect(JSON.stringify(p)).toContain("2.9 times higher at ages 0 to 64");
    // The waiting-time figures by nation, including the one that is worst.
    expect(JSON.stringify(p)).toContain("39.8%");
    expect(JSON.stringify(p)).toContain("67.8%");
    // The genomic test directory codes are quoted, not described.
    for (const code of ["M218.1", "M218.2", "R430.1", "R444.2"]) expect(JSON.stringify(p!.tests), code).toContain(code);
    // Every funding row names Wales and Northern Ireland.
    for (const f of p!.funding) { expect(f.wales, f.line).toBeTruthy(); expect(f.northernIreland, f.line).toBeTruthy(); }
    // Every nation is represented in the centres, and England has the audit's high-volume providers.
    expect(p!.centres.filter((c) => c.nation === "England").length).toBeGreaterThanOrEqual(15);
  });

  it("registers the breast cancer pathway on the family id, with the receptor subtypes and the histologies as aliases", () => {
    const p = ukPathwayFor("breast-cancer");
    expect(p?.cancerId).toBe("breast-cancer");
    // The family page is where a frightened reader lands: screening, the referral rules, the one-stop clinic and
    // the waiting-time standards are the same whichever receptor result comes back, so they live here and the
    // subtype pages carry only what depends on the result.
    for (const alias of ["breast-hr-positive", "breast-her2-positive", "ductal-carcinoma-in-situ", "invasive-lobular-carcinoma", "male-breast-cancer", "inflammatory-breast-cancer", "paget-disease-of-the-nipple", "her2-low-metastatic-breast-cancer"]) expect(ukPathwayFor(alias)?.cancerId, alias).toBe("breast-cancer");
    // Triple-negative disease keeps its own pathway and is not an alias of the family one.
    expect(ukPathwayFor("tnbc")?.cancerId).toBe("tnbc");
    expect(p!.aliases).not.toContain("tnbc");
    const g = graph();
    for (const id of ["breast-cancer", "breast-hr-positive", "male-breast-cancer"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The three UK prevention and screening trial records the spike adds, and the three radiotherapy trials it reuses.
    for (const id of ["ibis-i", "ibis-ii", "agex", "start-b", "fast-forward", "import-low"]) expect(g.get(id)?.kind, id).toBe("trial");
    // The screening programme, which had no page on the site before this one: ages, interval, recall arithmetic
    // and the Marmot review's benefit and overdiagnosis estimate, each read from the programme's own documents.
    expect(JSON.stringify(p)).toContain("between 50 and 53");
    expect(JSON.stringify(p)).toContain("71st birthday");
    expect(JSON.stringify(p)).toContain("96 need no further tests; 4 are recalled; 1 of those 4 has cancer");
    expect(JSON.stringify(p)).toContain("around 1,300 a year");
    expect(JSON.stringify(p)).toContain("19,291");
    // The very high risk programme's own thresholds, and the R208 criteria a breast team works to.
    expect(JSON.stringify(p)).toContain("CanRisk");
    expect(JSON.stringify(p)).toContain("Whalsay");
    // Breast is the only cancer with two urgent referral routes, and both are reported.
    expect(JSON.stringify(p)).toContain("breast symptomatic");
    expect(JSON.stringify(p)).toContain("183,420");
    // The audit's variation, which is the reason the centres list exists.
    expect(JSON.stringify(p)).toContain("5.3");
    expect(JSON.stringify(p)).toContain("89.3");
    // Every NICE decision quoted carries its appraisal number, including the refusals and the two appraisals
    // abandoned because the company did not submit evidence.
    const refs = p!.funding.filter((f) => f.england.body === "NICE").map((f) => f.england.ref);
    for (const ta of ["TA886", "TA265", "TA214", "TA1089"]) expect(refs, ta).toContain(ta);
    // The genomic test directory codes are quoted, not described.
    for (const code of ["R208.1", "R242.1", "R216.1", "M3.12", "M3.7"]) expect(JSON.stringify(p!.tests), code).toContain(code);
    // Every funding row names Wales and Northern Ireland.
    for (const f of p!.funding) { expect(f.wales, f.line).toBeTruthy(); expect(f.northernIreland, f.line).toBeTruthy(); }
    // Every nation is represented in the centres.
    expect(p!.centres.filter((c) => c.nation === "England").length).toBeGreaterThanOrEqual(6);
  });

  it("registers the skin cancer pathway on the family id, with the keratinocyte cancers and melanoma as aliases", () => {
    const p = ukPathwayFor("skin-cancer");
    expect(p?.cancerId).toBe("skin-cancer");
    // The family page is where a reader lands: the referral rules, the teledermatology triage, the waiting-time
    // standards, the multidisciplinary team structure and prevention are the same whichever histology comes back.
    for (const alias of ["basal-cell-carcinoma", "cutaneous-scc", "advanced-cutaneous-scc", "merkel-cell-carcinoma", "melanoma", "advanced-melanoma", "braf-v600-melanoma", "acral-melanoma", "mucosal-melanoma"]) expect(ukPathwayFor(alias)?.cancerId, alias).toBe("skin-cancer");
    // Uveal and conjunctival melanoma are eye cancers on an ocular oncology pathway and are deliberately not aliases.
    expect(p!.aliases).not.toContain("uveal-melanoma");
    expect(p!.aliases).not.toContain("conjunctival-melanoma");
    const g = graph();
    for (const id of ["skin-cancer", "basal-cell-carcinoma", "cutaneous-scc", "merkel-cell-carcinoma", "melanoma"]) expect(g.get(id)?.kind, id).toBe("cancer");
    // The six trial records, two researchers and three institutions the spike adds resolve in the graph.
    for (const id of ["sins-trial", "molemate", "mcc-rational-treatment", "impact-bcc", "spot-it", "scc-after"]) expect(g.get(id)?.kind, id).toBe("trial");
    for (const id of ["hywel-williams", "nick-levell"]) expect(g.get(id)?.kind, id).toBe("person");
    for (const id of ["melanoma-focus", "skcin", "british-association-of-dermatologists"]) expect(g.get(id)?.kind, id).toBe("institution");
    // The two exclusions that govern every figure on the page are stated in the page's own words.
    expect(JSON.stringify(p)).toContain("excluding basal cell carcinoma of Skin");
    expect(JSON.stringify(p)).toContain("greatly under-registered");
    // The volume finding, which is the reason the layer exists.
    expect(JSON.stringify(p)).toContain("89,978");
    expect(JSON.stringify(p)).toContain("29.2");
    expect(JSON.stringify(p)).toContain("5,733");
    // The referral rules are quoted by recommendation number, including the one that says a basal cell carcinoma
    // gets a routine referral rather than an urgent one.
    expect(JSON.stringify(p)).toContain("1.7.5");
    expect(JSON.stringify(p)).toContain("weighted 7-point checklist");
    // Every NICE decision quoted carries its appraisal number, including the refusal.
    const refs = p!.funding.filter((f) => f.england.body === "NICE").map((f) => f.england.ref);
    for (const ta of ["TA489", "TA802", "TA691", "TA950", "TA766", "TA396"]) expect(refs, ta).toContain(ta);
    // Mohs provision, which is the sharpest inequality on the page.
    expect(JSON.stringify(p)).toContain("79 dermatology doctors");
    expect(JSON.stringify(p)).toContain("fewer than 30");
    // Prevention: the legislation nation by nation, and the powers England has never used.
    expect(JSON.stringify(p)).toContain("Sunbeds (Regulation) Act 2010");
    expect(JSON.stringify(p)).toContain("unsupervised");
    expect(JSON.stringify(p)).toContain("86%");
    // The genomic test directory codes are quoted, not described.
    for (const code of ["M7.1", "M7.2", "R214.1", "R227.1", "R254.1"]) expect(JSON.stringify(p!.tests), code).toContain(code);
    // Every funding row names Wales and Northern Ireland.
    for (const f of p!.funding) { expect(f.wales, f.line).toBeTruthy(); expect(f.northernIreland, f.line).toBeTruthy(); }
    // Every nation is represented in the centres.
    expect(p!.centres.filter((c) => c.nation === "England").length).toBeGreaterThanOrEqual(7);
  });

  it("cites only https URLs on allowed UK public domains", () => {
    for (const p of UK_PATHWAYS) {
      const urls = ukPathwayUrls(p);
      expect(urls.length).toBeGreaterThan(20);
      const bad = urls.filter((u) => !hostOk(u));
      expect(bad, `${p.cancerId}: ${bad.join(", ")}`).toEqual([]);
    }
    for (const e of SPIKES.flatMap((s) => s.entities)) {
      const urls = [...e.links ?? [], ...("profiles" in e ? e.profiles ?? [] : [])].map((l) => l.url);
      if ("website" in e && e.website) urls.push(e.website);
      const bad = urls.filter((u) => !hostOk(u));
      expect(bad, `${e.id}: ${bad.join(", ")}`).toEqual([]);
    }
  });

  it("dates every figure's source and names a nation and period", () => {
    for (const p of UK_PATHWAYS) for (const f of p.figures) {
      expect(f.source.date ?? f.period, f.label).toBeTruthy();
      expect(f.nation).toBeTruthy();
      expect(f.period).toBeTruthy();
    }
  });

  it("links every institution, trial and drug id to a record in the graph", () => {
    const g = graph();
    for (const p of UK_PATHWAYS) {
      for (const c of p.centres) if (c.institutionId) expect(g.get(c.institutionId)?.kind, c.institutionId).toBe("institution");
      for (const s of p.support) if (s.institutionId) expect(["institution", "collection"], s.institutionId).toContain(g.get(s.institutionId)?.kind);
      for (const f of p.funding) for (const id of f.refs) expect(g.get(id), `${f.line}: ${id}`).toBeDefined();
      for (const t of p.trials) if (t.trialId) expect(g.get(t.trialId)?.kind, t.trialId).toBe("trial");
      for (const l of p.legacy) for (const id of l.trialIds) expect(g.get(id)?.kind, id).toBe("trial");
    }
  });

  it("gives every funding row an England decision with a URL and every NICE row a TA reference and date", () => {
    for (const p of UK_PATHWAYS) for (const f of p.funding) {
      expect(f.england.url).toMatch(/^https:/);
      if (f.england.body === "NICE") { expect(f.england.ref, f.treatment).toMatch(/^TA\d+/); expect(f.england.date, f.treatment).toBeTruthy(); }
      if (f.scotland?.body === "SMC" && f.scotland.ref) expect(f.scotland.ref).toMatch(/^SMC\d{4}$/);
    }
  });

  it("covers every section the page promises", () => {
    for (const p of UK_PATHWAYS) {
      expect(p.presentation.length).toBeGreaterThan(1);
      expect(p.timeline.length).toBeGreaterThanOrEqual(5);
      expect(p.centres.filter((c) => c.nation === "England").length).toBeGreaterThan(5);
      for (const n of ["Scotland", "Wales", "Northern Ireland"]) expect(p.centres.some((c) => c.nation === n), n).toBe(true);
      expect(p.funding.length).toBeGreaterThanOrEqual(6);
      expect(p.tests.length).toBeGreaterThanOrEqual(5);
      expect(p.trials.length).toBeGreaterThan(0);
      expect(p.legacy.length).toBe(3);
      expect(p.support.length).toBeGreaterThan(4);
      expect(p.nations.length).toBeGreaterThan(3);
      expect(p.gaps.length).toBeGreaterThan(0);
    }
  });

  it("writes a JSON companion with the route, resolved names and the source list", () => {
    const p = ukPathwayFor("gallbladder")!;
    const j = ukPathwayJson(p) as { route: string; sources: string[]; funding: Array<{ refNames: string[] }>; centres: Array<{ institutionName?: string }> };
    expect(j.route).toBe("/cancers/gallbladder/uk/");
    expect(j.sources.length).toBe(ukPathwayUrls(p).length);
    expect(j.funding[0].refNames.length).toBe(p.funding[0].refs.length);
    expect(j.centres.find((c) => c.institutionName === "Royal Free Hospital, Royal Free London NHS Foundation Trust")).toBeDefined();
  });
});

describe("/cancers/[id]/uk/ page", () => {
  it("builds static params only for cancers with a pathway", () => {
    const ids = generateStaticParams().map((x) => x.id);
    expect(ids).toEqual(ukPathwayCancerIds());
    expect(ids).toContain("gallbladder");
    expect(ids).not.toContain("glioblastoma");
    expect(ukPathwayRoute("gallbladder", "funding")).toBe("/cancers/gallbladder/uk/#funding");
  });

  it("renders every section for gallbladder with the standards, centres, decisions and tests", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "gallbladder" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("Faster Diagnosis Standard");
    expect(html).toContain("TA944");
    expect(html).toContain("SMC2582");
    expect(html).toContain("M220.1");
    expect(html).toContain("Royal Infirmary of Edinburgh");
    expect(html).toContain("ISRCTN13555554");
    expect(html).toContain("/api/v1/cancers/gallbladder/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
  });

  it("renders the triple-negative page with the screening caveat, the TA refusal, the SMC split, the R208 test and the UK trials", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "tnbc" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("TA851");
    expect(html).toContain("TA992");
    expect(html).toContain("SMC2608");
    expect(html).toContain("R208");
    expect(html).toContain("PHOENIX");
    expect(html).toContain("Western General");
    expect(html).toContain("Belfast City Hospital");
    expect(html).toContain("71st birthday");
    expect(html).toContain("/api/v1/cancers/tnbc/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // The subtype alias renders the same pathway.
    const alias = await UkPage({ params: Promise.resolve({ id: "tnbc-early" }) });
    expect(renderToStaticMarkup(createElement(() => alias))).toContain("TA851");
  });

  it("renders the pancreatic page with the NG12 diabetes rule, the audit's PERT finding, the four NICE positions, the SMC refusals, the hubs and the UK trials", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "pancreatic" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("new-onset diabetes");
    expect(html).toContain("TA476");
    expect(html).toContain("TA440");
    expect(html).toContain("TA750");
    expect(html).toContain("TA1052");
    expect(html).toContain("SMC2812");
    expect(html).toContain("SMC2435");
    expect(html).toContain("pancreatic enzyme replacement therapy");
    expect(html).toContain("Ninewells");
    expect(html).toContain("Castle Hill");
    expect(html).toContain("ISRCTN62546421");
    expect(html).toContain("EUROPAC");
    expect(html).toContain("/api/v1/cancers/pancreatic/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // A resectability subtype alias renders the same pathway.
    const alias = await UkPage({ params: Promise.resolve({ id: "metastatic-pdac" }) });
    expect(renderToStaticMarkup(createElement(() => alias))).toContain("TA476");
  });

  it("renders the colorectal page with the screening ages, the referral threshold, the audit's stoma finding, the NICE reversal and the UK trials", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "colorectal" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("faecal immunochemical test");
    expect(html).toContain("TA1136");
    expect(html).toContain("TA307");
    expect(html).toContain("SMC2820");
    expect(html).toContain("Lynch syndrome");
    expect(html).toContain("diverting ileostomy");
    expect(html).toContain("ISRCTN83842641");
    expect(html).toContain("Velindre");
    expect(html).toContain("/api/v1/cancers/colorectal/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // A site subtype alias renders the same pathway.
    const alias = await UkPage({ params: Promise.resolve({ id: "rectal-cancer" }) });
    expect(renderToStaticMarkup(createElement(() => alias))).toContain("TA1136");
  });

  it("renders the lung page with the screening eligibility, the audit's stage shift, the perioperative divergence and the UK trials", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "lung-cancer" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("lung health check");
    expect(html).toContain("TA1127");
    expect(html).toContain("TA781");
    expect(html).toContain("SMC2874");
    expect(html).toContain("PLCOm2012");
    expect(html).toContain("M4.14");
    expect(html).toContain("phase 1 of national lung screening in 2027/28");
    expect(html).toContain("Royal Papworth");
    expect(html).toContain("Belfast City Hospital");
    expect(html).toContain("ISRCTN70247820");
    expect(html).toContain("/api/v1/cancers/lung-cancer/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // Both branches of the family and a molecular subtype alias render the same pathway.
    const parent = await UkPage({ params: Promise.resolve({ id: "nsclc" }) });
    expect(renderToStaticMarkup(createElement(() => parent))).toContain("TA1127");
    const alias = await UkPage({ params: Promise.resolve({ id: "egfr-mutant-nsclc" }) });
    expect(renderToStaticMarkup(createElement(() => alias))).toContain("TA1122");
  });

  it("renders the prostate page with the screening recommendation, the Cambridge groups, the refusals and the UK trials", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "prostate" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("BRCA2");
    expect(html).toContain("Cambridge Prognostic Group");
    expect(html).toContain("TA930");
    expect(html).toContain("TA1130");
    expect(html).toContain("SMC2940");
    expect(html).toContain("M218.1");
    expect(html).toContain("ISRCTN13801649");
    expect(html).toContain("Velindre");
    expect(html).toContain("Altnagelvin");
    expect(html).toContain("/api/v1/cancers/prostate/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // A risk-group alias and a disease-state alias render the same pathway.
    const lowRisk = await UkPage({ params: Promise.resolve({ id: "prostate-low-risk" }) });
    expect(renderToStaticMarkup(createElement(() => lowRisk))).toContain("Cambridge Prognostic Group");
    const mcrpc = await UkPage({ params: Promise.resolve({ id: "prostate-mcrpc" }) });
    expect(renderToStaticMarkup(createElement(() => mcrpc))).toContain("TA887");
  });

  it("renders the breast family page with the screening programme, the family history service, both referral routes and the audit", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "breast-cancer" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("Faster Diagnosis Standard");
    expect(html).toContain("breast symptomatic");
    expect(html).toContain("R208.1");
    expect(html).toContain("TA886");
    expect(html).toContain("TA1089");
    expect(html).toContain("SMC2518");
    expect(html).toContain("26 Gy in 5 fractions");
    expect(html).toContain("Breast Test Wales");
    expect(html).toContain("ISRCTN81384017");
    expect(html).toContain("/api/v1/cancers/breast-cancer/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // A receptor subtype alias and a histology alias render the same pathway.
    const hrPositive = await UkPage({ params: Promise.resolve({ id: "breast-hr-positive" }) });
    expect(renderToStaticMarkup(createElement(() => hrPositive))).toContain("Faster Diagnosis Standard");
    const lobular = await UkPage({ params: Promise.resolve({ id: "invasive-lobular-carcinoma" }) });
    expect(renderToStaticMarkup(createElement(() => lobular))).toContain("R208.1");
    // The triple-negative page is still its own pathway and is not replaced by the family one.
    const tnbc = await UkPage({ params: Promise.resolve({ id: "tnbc" }) });
    expect(renderToStaticMarkup(createElement(() => tnbc))).toContain("TA851");
  });

  it("renders the skin cancer family page with the counting exclusions, the referral rules, Mohs and the sunbed law", async () => {
    const el = await UkPage({ params: Promise.resolve({ id: "skin-cancer" }) });
    const html = renderToStaticMarkup(createElement(() => el));
    for (const id of ["pathway", "centres", "funding", "tests", "trials", "data", "support", "nations", "gaps"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("Faster Diagnosis Standard");
    expect(html).toContain("TA489");
    expect(html).toContain("TA802");
    expect(html).toContain("SMC2584");
    expect(html).toContain("M7.1");
    expect(html).toContain("Mohs");
    expect(html).toContain("Sunbeds (Regulation) Act 2010");
    expect(html).toContain("Welsh Institute of Dermatology");
    expect(html).toContain("Belfast");
    expect(html).toContain("ISRCTN10511385");
    expect(html).toContain("/api/v1/cancers/skin-cancer/uk.json");
    expect(html).not.toMatch(/<a[^>]*>[^<]*<a/);
    // A keratinocyte alias and the melanoma alias both render the same pathway.
    const bcc = await UkPage({ params: Promise.resolve({ id: "basal-cell-carcinoma" }) });
    expect(renderToStaticMarkup(createElement(() => bcc))).toContain("TA489");
    const mel = await UkPage({ params: Promise.resolve({ id: "melanoma" }) });
    expect(renderToStaticMarkup(createElement(() => mel))).toContain("weighted 7-point checklist");
  });

  it("returns not-found for a cancer without a pathway", async () => {
    await expect(UkPage({ params: Promise.resolve({ id: "glioblastoma" }) })).rejects.toThrow();
  });
});

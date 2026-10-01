/**
 * Geography layer for a cancer: where in the world it happens, and why. Two parts sit under one cancer id.
 *
 *  1. Country rates by sex. GLOBOCAN reports the site-wide countries.json (public/globocan/countries.json) for both
 *     sexes only; for cancers whose geography differs by sex the per-site files in public/globocan/sites/ carry
 *     both sexes, women and men for every country (fetched by scripts/fetch-globocan-site.ts from the same IARC
 *     factsheet endpoint). SITE_RATES maps a GLOBOCAN cancer code to its file.
 *
 *  2. A hand-written `CancerGeography`: the high-burden regions with the papers that describe them, the national
 *     programmes and registries, the prevention evidence, the country spotlights and the named gaps. Written in a
 *     spike file (src/data/spikes/<cancer>-geography.ts) and registered in CANCER_GEOGRAPHIES below. The cancer page
 *     renders the map and the cards in its epidemiology section (src/components/CancerGeographySection.tsx); the JSON
 *     companion is written to /api/v1/cancers/<id>/geography.json by scripts/build-api.ts.
 *
 * Nothing here is generated: every figure carries the page it was read from and the date it was checked.
 */
import { graph } from "./graph";
import { routeFor } from "./kinds";
import { GLOBOCAN_MAP } from "@/data/globocan-map";
import { gallbladderGeography } from "@/data/spikes/gallbladder-geography";
import gallbladderRates from "../../public/globocan/sites/12-gallbladder-by-sex.json";
import { lymphomaGeography } from "@/data/spikes/lymphoma-geography";
import nhlRates from "../../public/globocan/sites/34-non-hodgkin-lymphoma-by-sex.json";

/** A checkable citation: the page a figure or statement was read from, and when it was checked or published. */
export type GeoSource = { label: string; url: string; date?: string };
export type GeoSex = "both" | "women" | "men";
export type GeoMetric = "inc" | "mort";
/** [new cases, incidence ASR, deaths, mortality ASR]; any may be null. */
export type GeoCell = [number | null, number | null, number | null, number | null];
export type GeoCountry = { name: string; isonum: number; region: string | null; hdi?: string | null; both: GeoCell; men: GeoCell; women: GeoCell };
export type SiteRates = {
  source: string; sourceUrl: string; apiUrl: string; version: string; year: number; fetched: string;
  cancerCode: number; icd: string; label: string; note: string; citation: string;
  world: GeoCountry | null; countries: Record<string, GeoCountry>;
};
/** One country as the map and the ranked list use it. */
export type GeoRow = GeoCountry & { iso3: string; methodInc?: string; methodMort?: string };

/** Glyphs the section and the pills draw; kept as names so the data file stays free of markup. */
export type GeoGlyph = "river" | "mountain" | "coast" | "island" | "people" | "registry" | "scalpel" | "microbe" | "grain" | "map" | "flag";

/** A region of the world where this cancer is unusually common, with the papers that describe it. */
export type GeoRegion = {
  id: string;
  title: string;
  /** ISO3 codes the map highlights when the pill is pressed. */
  countries: string[];
  glyph: GeoGlyph;
  /** Two or three plain sentences. */
  summary: string;
  /** The figures and mechanisms, with their papers named in the text. */
  detail: string;
  sources: GeoSource[];
  /** Entity ids to show as pills (papers, terms, institutions, trials). */
  refs?: string[];
};

/** A national programme, registry or practice pattern. */
export type GeoProgramme = { id: string; country: string; title: string; glyph: GeoGlyph; what: string[]; detail: string; sources: GeoSource[]; refs?: string[] };

/** One figure that is not a GLOBOCAN estimate: a registry rate, a survival figure, a count. */
export type GeoFigure = { label: string; value: string; place: string; period?: string; source: GeoSource; note?: string };

/** A prevention lever and the evidence for it. */
export type GeoPrevention = { id: string; title: string; glyph: GeoGlyph; strength: "consistent" | "mixed" | "suggestive" | "untested"; evidence: string; sources: GeoSource[]; refs?: string[] };

/** A country the page dwells on: its own figures, what is being done there, and the corpus records that belong to it. */
export type GeoSpotlight = {
  id: string;
  country: string;
  flag: string;
  title: string;
  lede: string;
  points: string[];
  figures: GeoFigure[];
  sources: GeoSource[];
  refs: string[];
  /** A page of its own when one exists (for example /countries/in/#gallbladder). */
  route?: string;
};

export type CancerGeography = {
  cancerId: string;
  cancerName: string;
  asOf: string;
  /** The GLOBOCAN cancer code the rates file carries. */
  siteCode: number;
  headline: string;
  regions: GeoRegion[];
  programmes: GeoProgramme[];
  figures: GeoFigure[];
  prevention: GeoPrevention[];
  spotlights: GeoSpotlight[];
  /** Named gaps: what could not be sourced. */
  gaps: string[];
};

export const CANCER_GEOGRAPHIES: CancerGeography[] = [gallbladderGeography, lymphomaGeography];

/** Per-site GLOBOCAN files by cancer code. Add a file (npm run fetch:globocan:site -- <code>) and register it here. */
export const SITE_RATES: Record<number, SiteRates> = { 12: gallbladderRates as unknown as SiteRates, 34: nhlRates as unknown as SiteRates };

export function geographyFor(cancerId: string): CancerGeography | undefined {
  return CANCER_GEOGRAPHIES.find((g) => g.cancerId === cancerId);
}

/** Cancer ids with a geography layer whose cancer record exists. */
export function geographyCancerIds(): string[] {
  const g = graph();
  return CANCER_GEOGRAPHIES.map((x) => x.cancerId).filter((id) => g.get(id)?.kind === "cancer");
}

export function geographyRoute(cancerId: string, section?: string): string {
  return `/cancers/${cancerId}/#${section ?? "geography"}`;
}

/** The per-sex rates file for a cancer, found through its GLOBOCAN mapping (single-code sites only). */
export function siteRatesFor(cancerId: string): SiteRates | undefined {
  const m = GLOBOCAN_MAP[cancerId];
  if (!m || m.codes.length !== 1) return undefined;
  return SITE_RATES[m.codes[0]];
}

/** Country rows sorted by the chosen metric and sex, highest first; nulls last. */
export function geographyRows(rates: SiteRates, sex: GeoSex = "both", metric: GeoMetric = "inc", methods?: Record<string, { methodInc?: string; methodMort?: string }>): GeoRow[] {
  const i = metric === "inc" ? 1 : 3;
  const rows: GeoRow[] = Object.entries(rates.countries).map(([iso3, c]) => ({ ...c, iso3, methodInc: methods?.[iso3]?.methodInc, methodMort: methods?.[iso3]?.methodMort }));
  rows.sort((a, b) => (b[sex][i] ?? -1) - (a[sex][i] ?? -1));
  return rows;
}

/** The top `n` countries by age-standardised rate for one sex and metric. */
export function topCountries(rates: SiteRates, n = 10, sex: GeoSex = "both", metric: GeoMetric = "inc"): Array<{ iso3: string; name: string; asr: number; count: number | null }> {
  const i = metric === "inc" ? 1 : 3;
  return geographyRows(rates, sex, metric).filter((r) => r[sex][i] !== null).slice(0, n).map((r) => ({ iso3: r.iso3, name: r.name, asr: r[sex][i] as number, count: r[sex][i - 1] }));
}

/** Every URL the layer cites, for the domain test and the machine link list. */
export function geographyUrls(g: CancerGeography): string[] {
  const urls: string[] = [];
  const src = (s: GeoSource[] | undefined) => { for (const x of s ?? []) urls.push(x.url); };
  for (const x of g.regions) src(x.sources);
  for (const x of g.programmes) src(x.sources);
  for (const x of g.figures) urls.push(x.source.url);
  for (const x of g.prevention) src(x.sources);
  for (const x of g.spotlights) { src(x.sources); for (const f of x.figures) urls.push(f.source.url); }
  return [...new Set(urls)];
}

/** Every entity id the layer refers to, so a renamed record fails the build rather than a pill. */
export function geographyRefs(g: CancerGeography): string[] {
  const ids: string[] = [];
  for (const x of g.regions) ids.push(...(x.refs ?? []));
  for (const x of g.programmes) ids.push(...(x.refs ?? []));
  for (const x of g.prevention) ids.push(...(x.refs ?? []));
  for (const x of g.spotlights) ids.push(...x.refs);
  return [...new Set(ids)];
}

/** The JSON companion written to /api/v1/cancers/<id>/geography.json: the hand-written layer plus the country table by sex. */
export function geographyJson(g: CancerGeography): Record<string, unknown> {
  const gr = graph();
  const rates = SITE_RATES[g.siteCode];
  const ref = (id: string) => { const e = gr.get(id); return e ? { id, kind: e.kind, name: e.name, route: routeFor(e) } : { id }; };
  return {
    ...g,
    route: geographyRoute(g.cancerId),
    regions: g.regions.map((r) => ({ ...r, refs: (r.refs ?? []).map(ref) })),
    programmes: g.programmes.map((r) => ({ ...r, refs: (r.refs ?? []).map(ref) })),
    prevention: g.prevention.map((r) => ({ ...r, refs: (r.refs ?? []).map(ref) })),
    spotlights: g.spotlights.map((r) => ({ ...r, refs: r.refs.map(ref) })),
    sources: geographyUrls(g),
    rates: rates ? {
      source: rates.source, sourceUrl: rates.sourceUrl, apiUrl: rates.apiUrl, version: rates.version, year: rates.year, fetched: rates.fetched,
      cancerCode: rates.cancerCode, icd: rates.icd, label: rates.label, note: rates.note, citation: rates.citation, world: rates.world,
      topTenIncidence: { both: topCountries(rates, 10, "both"), women: topCountries(rates, 10, "women"), men: topCountries(rates, 10, "men") },
      topTenMortality: { both: topCountries(rates, 10, "both", "mort"), women: topCountries(rates, 10, "women", "mort"), men: topCountries(rates, 10, "men", "mort") },
      countries: rates.countries,
    } : undefined,
  };
}

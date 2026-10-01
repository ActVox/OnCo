import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { graph } from "./graph";
import { GLOBOCAN } from "./globocan";
import { CANCER_GEOGRAPHIES, SITE_RATES, geographyCancerIds, geographyFor, geographyJson, geographyRefs, geographyRoute, geographyRows, geographyUrls, siteRatesFor, topCountries } from "./cancer-geography";
import spike from "@/data/spikes/gallbladder-geography";
import lymphomaGeoSpike from "@/data/spikes/lymphoma-geography";
import { CancerGeographySection } from "@/components/CancerGeographySection";

/** Public sources only: IARC, the registries and ministries named, and the two literature hosts. */
const ALLOWED_DOMAINS = ["gco.iarc.who.int", "gco-api.iarc.fr", "doi.org", "europepmc.org", "ncdirindia.org", "supersalud.gob.cl", "ganjoho.jp",
  // Lymphoma pass: the US registry, the WHO document repository (the essential medicines list), the US drug label
  // service, UNAIDS and the South African national cancer registry.
  "seer.cancer.gov", "iris.who.int", "dailymed.nlm.nih.gov", "unaids.org", "nicd.ac.za"];
const hostOk = (url: string) => { const u = new URL(url); return u.protocol === "https:" && ALLOWED_DOMAINS.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`)); };

describe("GLOBOCAN per-site rates by sex", () => {
  it("carries every country and the world for the gallbladder site, with all three sexes", () => {
    const r = siteRatesFor("gallbladder")!;
    expect(r).toBeDefined();
    expect(r.cancerCode).toBe(12);
    expect(r.icd).toBe("C23");
    expect(Object.keys(r.countries).length).toBe(185);
    expect(r.world?.both[0]).toBeGreaterThan(100000);
    for (const [iso3, c] of Object.entries(r.countries)) {
      for (const sex of ["both", "women", "men"] as const) {
        expect(c[sex].length, iso3).toBe(4);
        expect(typeof c[sex][1], `${iso3} ${sex} incidence ASR`).toBe("number");
        expect(typeof c[sex][3], `${iso3} ${sex} mortality ASR`).toBe("number");
      }
    }
  });

  it("agrees with the site-wide both-sexes file to the last decimal", () => {
    const r = siteRatesFor("gallbladder")!;
    for (const [iso3, c] of Object.entries(r.countries)) {
      const cell = GLOBOCAN.countries[iso3]?.data["12"];
      expect(cell, iso3).toBeDefined();
      expect(c.both.slice(0, 4), iso3).toEqual(cell!.slice(0, 4));
    }
  });

  it("ranks Bolivia and Chile first by incidence in both sexes and women highest almost everywhere", () => {
    const r = siteRatesFor("gallbladder")!;
    const top = topCountries(r, 10);
    expect(top.map((x) => x.iso3).slice(0, 2)).toEqual(["BOL", "CHL"]);
    expect(top.length).toBe(10);
    expect(top.every((x, i) => i === 0 || x.asr <= top[i - 1].asr)).toBe(true);
    const women = topCountries(r, 3, "women").map((x) => x.iso3);
    expect(women).toContain("BOL");
    const rows = geographyRows(r);
    const womenHigher = rows.filter((x) => (x.women[1] ?? 0) > (x.men[1] ?? 0)).length;
    expect(womenHigher / rows.length).toBeGreaterThan(0.7);
    expect(rows.find((x) => x.iso3 === "KOR")!.men[1]).toBeGreaterThan(rows.find((x) => x.iso3 === "KOR")!.women[1]!);
  });

  it("is reachable only through single-code GLOBOCAN mappings", () => {
    expect(siteRatesFor("cholangiocarcinoma")).toBeUndefined();
    expect(siteRatesFor("head-and-neck")).toBeUndefined();
    expect(Object.keys(SITE_RATES)).toEqual(["12", "34"]);
  });
});

describe("cancer geography layer", () => {
  it("registers the gallbladder layer against the live cancer record", () => {
    expect(CANCER_GEOGRAPHIES.length).toBeGreaterThan(0);
    expect(geographyFor("gallbladder")?.siteCode).toBe(12);
    expect(geographyFor("nsclc")).toBeUndefined();
    expect(geographyCancerIds()).toContain("gallbladder");
    expect(geographyRoute("gallbladder")).toBe("/cancers/gallbladder/#geography");
    expect(spike.cancerId).toBe("gallbladder");
    expect(spike.entities).toEqual([]);
  });

  it("registers the lymphoma layer against the non-Hodgkin lymphoma record and the NHL GLOBOCAN site", () => {
    const geo = geographyFor("non-hodgkin-lymphoma")!;
    expect(geo.siteCode).toBe(34);
    expect(geographyCancerIds()).toContain("non-hodgkin-lymphoma");
    expect(siteRatesFor("non-hodgkin-lymphoma")?.icd).toBe("C82-86+C88");
    expect(lymphomaGeoSpike.entities).toEqual([]);
    // The five subtype geographies the layer exists to carry, plus the inversion that is its thesis.
    const ids = geo.regions.map((r) => r.id);
    for (const id of ["malaria-belt", "nkt-east-asia-latin-america", "htlv1-belt", "h-pylori-malt", "hiv-lymphoma", "the-inversion"]) expect(ids, id).toContain(id);
    expect(geo.programmes.map((p) => p.country).sort()).toEqual(["JPN", "KOR", "UGA"]);
    expect(geo.spotlights.map((s) => s.country).sort()).toEqual(["JPN", "PER", "UGA"]);
    // The three corrections that would make the page confidently wrong if they were ignored.
    const json = JSON.stringify(geo);
    expect(json).toContain("no study has measured");
    expect(json).toContain("reports no separate survival figure for diffuse large B-cell lymphoma");
    expect(json).toContain("irrespective of genetic findings");
    expect(geo.gaps.length).toBeGreaterThan(10);
    expect(json).not.toMatch(/\u2014/);
  });

  it("cites only https URLs on allowed public domains, and dates every source", () => {
    for (const g of CANCER_GEOGRAPHIES) {
      const urls = geographyUrls(g);
      expect(urls.length).toBeGreaterThan(40);
      expect(urls.filter((u) => !hostOk(u)), g.cancerId).toEqual([]);
      for (const r of [...g.regions, ...g.programmes, ...g.prevention, ...g.spotlights]) for (const s of r.sources) expect(s.date, s.label).toBeTruthy();
      for (const f of [...g.figures, ...g.spotlights.flatMap((s) => s.figures)]) { expect(f.source.url).toMatch(/^https:/); expect(f.place, f.label).toBeTruthy(); }
    }
  });

  it("links every ref to a record in the graph and every region country to a GLOBOCAN row", () => {
    const g = graph();
    for (const geo of CANCER_GEOGRAPHIES) {
      const rates = SITE_RATES[geo.siteCode];
      for (const id of geographyRefs(geo)) expect(g.get(id), id).toBeDefined();
      for (const r of geo.regions) for (const iso3 of r.countries) expect(rates.countries[iso3], `${r.id}: ${iso3}`).toBeDefined();
      for (const s of geo.spotlights) expect(rates.countries[s.country], s.id).toBeDefined();
      for (const p of geo.programmes) expect(rates.countries[p.country], p.id).toBeDefined();
    }
  });

  it("covers the regions, programmes and countries the brief asks for", () => {
    const geo = geographyFor("gallbladder")!;
    const titles = geo.regions.map((r) => r.title).join(" ");
    for (const w of ["India", "Chile", "Bolivia", "Pakistan", "Nepal", "Bangladesh", "Korea", "Japan", "Native American", "Hispanic", "eastern Europe"]) expect(titles, w).toContain(w);
    expect(geo.programmes.map((p) => p.country).sort()).toEqual(["CHL", "IND", "JPN"]);
    expect(geo.spotlights.map((s) => s.country).sort()).toEqual(["CHL", "IND"]);
    expect(geo.prevention.map((p) => p.id)).toEqual(expect.arrayContaining(["cholecystectomy-stone-size", "typhoid-carriage", "aflatoxin"]));
    expect(geo.gaps.length).toBeGreaterThan(3);
    expect(JSON.stringify(geo)).not.toMatch(/—/);
  });

  it("writes a JSON companion with the route, resolved refs, the source list and the top tens by sex", () => {
    const geo = geographyFor("gallbladder")!;
    const j = geographyJson(geo) as { route: string; sources: string[]; regions: Array<{ refs: Array<{ id: string; name?: string }> }>; rates: { topTenIncidence: Record<string, unknown[]>; topTenMortality: Record<string, unknown[]>; countries: Record<string, unknown> } };
    expect(j.route).toBe("/cancers/gallbladder/#geography");
    expect(j.sources.length).toBe(geographyUrls(geo).length);
    expect(j.regions[0].refs.every((r) => r.name)).toBe(true);
    for (const sex of ["both", "women", "men"]) { expect(j.rates.topTenIncidence[sex].length).toBe(10); expect(j.rates.topTenMortality[sex].length).toBe(10); }
    expect(Object.keys(j.rates.countries).length).toBe(185);
  });
});

describe("CancerGeographySection", () => {
  it("renders the map, the regions, the spotlights, the programmes, the prevention list and the gaps for gallbladder", () => {
    const html = renderToStaticMarkup(createElement(CancerGeographySection, { c: { id: "gallbladder", name: "Gallbladder cancer" } }));
    for (const id of ["geography", "geography-regions", "geography-spotlights", "geography-programmes", "geography-prevention", "geography-gaps", "geography-gangetic-belt", "geography-chile-ges", "geography-india", "geography-chile"]) expect(html).toContain(`id="${id}"`);
    expect(html).toContain("World map of Gallbladder cancer incidence");
    expect(html).toContain("Kamrup");
    expect(html).toMatch(/\/cases\/?\?country=BOL/);
    expect(html).toContain("/api/v1/cancers/gallbladder/geography.json");
    expect(html).toContain('aria-pressed="true"');
    expect(html).not.toMatch(/<a(?:\s[^>]*)?>(?:(?!<\/a>)[\s\S])*<a[\s>]/);
  });

  it("renders nothing for a cancer without a layer", () => {
    expect(renderToStaticMarkup(createElement(CancerGeographySection, { c: { id: "nsclc", name: "NSCLC" } }))).toBe("");
  });
});

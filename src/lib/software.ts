/**
 * The software of oncology (/software/): category, segment and sourcing metadata, and the lookups that let a
 * technology, company or cancer page list the products that serve it. The records are GENERATED
 * (src/data/software.ts by scripts/fetch-software.ts); this module only reads them.
 *
 * The distinction this page exists to keep visible: a row is either independently sourced, meaning a regulator's
 * database, the peer-reviewed literature or a public body's own list named the product, or it is self-described,
 * meaning the only thing behind it is the company saying so. Nothing in here lets the second look like the first.
 */
import { softwareProducts } from "@/data/software";
import type { SoftwareCategory, SoftwareProduct, SoftwareSegment, SoftwareSourcing } from "@/lib/schema";

export type { SoftwareProduct };

/** Label, blurb and a 24x24 stroke glyph path per category, in display order. */
export const SOFTWARE_CATEGORY_META: Record<SoftwareCategory, { label: string; blurb: string; glyph: string }> = {
  "clinical-systems": {
    label: "Clinical systems",
    blurb: "The oncology record, the chemotherapy prescribing layer, the radiotherapy planning systems and the platforms a pathologist or radiologist reads on.",
    glyph: "M5 3h14v18H5zM9 3v4h6V3M8 12h8M8 16h5",
  },
  "regulated-device": {
    label: "Regulated software as a medical device",
    blurb: "Software with a clearance, a grant or an approval that reads a scan, a slide or a signal, checkable against the regulator's own database.",
    glyph: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4ZM9 12l2 2 4-4",
  },
  "genomics-interpretation": {
    label: "Genomics and interpretation",
    blurb: "Sequencing analysis, variant interpretation and the reporting platforms a molecular tumour board decides from.",
    glyph: "M7 3c0 6 10 12 10 18M17 3c0 6-10 12-10 18M8.5 7h7M8.5 17h7M7.5 12h9",
  },
  "trials-registries": {
    label: "Trials, matching and registries",
    blurb: "The public trial registries, the products that match patients against them, the software trials are run in, and the cancer registries.",
    glyph: "M5 4h14v16H5zM9 4v3h6V4M8 11h8M8 15h5M15.5 15.5l1.5 1.5 3-3",
  },
  "case-review": {
    label: "Case review and second opinion",
    blurb: "Platforms that gather one person's records, reports and imaging into a case another clinician or a board can review.",
    glyph: "M4 5h11v12H8l-4 3V5ZM20 9v10l-3-2h-5M7.5 9h4M7.5 12h6",
  },
  "research-analysis": {
    label: "Research and analysis, not open source",
    blurb: "Tools the field runs on that the open-source map excluded by design because they are commercial, licensed or free but closed.",
    glyph: "M9 3v5l-5 9a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-9V3M8 3h8M8 15h8",
  },
};

export const SOFTWARE_CATEGORY_ORDER = Object.keys(SOFTWARE_CATEGORY_META) as SoftwareCategory[];

/** Segments in the order a reader would walk them, grouped roughly by where in care they sit. */
export const SOFTWARE_SEGMENT_ORDER: SoftwareSegment[] = [
  "Oncology electronic record",
  "Chemotherapy prescribing",
  "Radiotherapy planning",
  "Radiotherapy QA and dosimetry",
  "Patient positioning and monitoring",
  "Pathology platform",
  "Pathology AI",
  "Radiology platform",
  "Radiology AI",
  "Endoscopy and dermatology AI",
  "Sequencing and variant calling",
  "Variant interpretation and reporting",
  "Comprehensive genomic profiling",
  "Trial registry",
  "Trial matching",
  "Trial conduct software",
  "Cancer registry software",
  "Real-world data platform",
  "Case review and second opinion",
  "Patient-reported outcomes",
  "Risk and decision tools",
  "Research analysis tool",
];

export const SOFTWARE_SOURCING_META: Record<SoftwareSourcing, { label: string; tip: string }> = {
  independent: {
    label: "Independently sourced",
    tip: "At least one source outside the company names this product: a regulator's device database, a paper in the literature, or a public body's own list. Those sources are on the row.",
  },
  "self-described": {
    label: "Company's own account",
    tip: "Nothing outside the company was found that names this product. The row establishes that it exists and what it says it does, and no more than that.",
  },
};

export const SOFTWARE_SOURCING_ORDER: SoftwareSourcing[] = ["independent", "self-described"];

/** What kind of outside source a record has, most checkable first, for the evidence column and its facet. */
export type EvidenceKind = "Regulator" | "Literature" | "Public listing" | "None";

export const EVIDENCE_ORDER: EvidenceKind[] = ["Regulator", "Literature", "Public listing", "None"];

export const EVIDENCE_TIP: Record<EvidenceKind, string> = {
  Regulator: "A clearance, De Novo grant, approval or supplement in the FDA device databases, read through openFDA on the day of the build.",
  Literature: "A paper indexed in Europe PMC whose title or abstract names the product. Preprints are marked as such and are not called peer reviewed.",
  "Public listing": "A page published by a body other than the company, fetched and checked to name the product.",
  None: "Nothing outside the company was found. The row is the company describing itself.",
};

export function evidenceKinds(p: SoftwareProduct): EvidenceKind[] {
  const kinds: EvidenceKind[] = [];
  if (p.clearances.length) kinds.push("Regulator");
  if (p.papers.length) kinds.push("Literature");
  if (p.listings.length) kinds.push("Public listing");
  return kinds.length ? kinds : ["None"];
}

/** The year of the earliest clearance or paper on record: the first outside trace of the product, where there is one. */
export function firstTrace(p: SoftwareProduct): number | undefined {
  const years = [...p.clearances.map((c) => Number(c.date.slice(0, 4))), ...p.papers.map((x) => x.year)].filter((n) => n > 1900);
  return years.length ? Math.min(...years) : undefined;
}

const byEvidence = (a: SoftwareProduct, b: SoftwareProduct) =>
  (b.clearances.length + b.papers.length + b.listings.length) - (a.clearances.length + a.papers.length + a.listings.length) ||
  a.name.localeCompare(b.name, "en", { sensitivity: "base" });

export function softwareForTechnology(technologyId: string): SoftwareProduct[] {
  return softwareProducts.filter((p) => p.technologies.includes(technologyId)).sort(byEvidence);
}

export function softwareForCancer(cancerId: string): SoftwareProduct[] {
  return softwareProducts.filter((p) => p.cancers.includes(cancerId)).sort(byEvidence);
}

export function softwareForVendor(entityId: string): SoftwareProduct[] {
  return softwareProducts.filter((p) => p.vendorId === entityId).sort(byEvidence);
}

/** Deep link into the browser filtered to one facet value. */
export function softwareLink(facet: string, value: string): string {
  return `/software/?${encodeURIComponent(facet)}=${encodeURIComponent(value)}`;
}

import type { Metadata } from "next";
import { graph } from "@/lib/graph";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef } from "@/components/EntityBrowser";
import { dossierData } from "@/components/Dossier";
import { targetXrefs } from "@/data/target-xrefs";

export const metadata: Metadata = pageMeta({ title: "Target dossiers", description: "One long-form dossier per target: biology, prevalence, mutation hotspots, products by modality and phase, trials, resistance, pathways, assays, models, open questions and external identifiers.", path: "/dossiers/" });

const CLASS_LABEL: Record<string, string> = { "surface-antigen": "Surface antigen", kinase: "Kinase", checkpoint: "Checkpoint", "nuclear-receptor": "Nuclear receptor", enzyme: "Enzyme", transcription: "Transcription factor", oncogene: "Oncogene", "tumor-suppressor": "Tumour suppressor", stroma: "Stroma", other: "Other" };

export default function DossiersIndex() {
  const g = graph();
  const rows: BrowserRow[] = g.kind("target").map((t) => {
    const d = dossierData(t);
    const approved = d.drugs.filter((x) => x.status === "approved").length;
    const genes = targetXrefs[t.id]?.genes.map((x) => x.symbol).join(", ");
    return {
      id: t.id, name: t.name, tldr: t.tldr, route: `/dossiers/${t.id}/`, sub: genes ? `Gene: ${genes}` : undefined,
      facets: { class: [CLASS_LABEL[t.targetClass] ?? t.targetClass], hotspots: [d.hotspots ? "Hotspot map" : "No hotspot map"], questions: [d.questions.length ? "Has open questions" : "None yet"], assays: [d.assays.length ? "Has companion diagnostic" : "No companion diagnostic"] },
      cols: { products: d.drugs.length, approved, trials: d.trials.length, pathways: d.pathways.length, resistance: d.mechanisms.length, prevalence: t.prevalence.length, questions: d.questions.length },
      sortKeys: { products: d.drugs.length, approved, trials: d.trials.length, pathways: d.pathways.length, resistance: d.mechanisms.length, prevalence: t.prevalence.length, questions: d.questions.length },
    };
  });
  const facets: FacetDef[] = [
    { key: "class", label: "Target class", searchable: false, width: "w-48" },
    { key: "hotspots", label: "Hotspots", searchable: false, width: "w-44" },
    { key: "assays", label: "Diagnostics", searchable: false, width: "w-52" },
    { key: "questions", label: "Open questions", searchable: false, width: "w-44" },
  ];
  const columns: ColDef[] = [
    { key: "products", label: "Products", sortable: true, numeric: true, tip: "Products in the corpus aimed at the target, any phase." },
    { key: "approved", label: "Approved", sortable: true, numeric: true, tip: "Products with at least one regulatory approval." },
    { key: "trials", label: "Trials", sortable: true, numeric: true, hide: "hidden sm:table-cell" },
    { key: "prevalence", label: "Prevalence rows", sortable: true, numeric: true, hide: "hidden md:table-cell", tip: "Cancers with a sourced prevalence figure for this target." },
    { key: "pathways", label: "Pathways", sortable: true, numeric: true, hide: "hidden lg:table-cell", tip: "Pathway diagrams where this target is a node." },
    { key: "resistance", label: "Resistance routes", sortable: true, numeric: true, hide: "hidden lg:table-cell", tip: "Recorded escape routes that involve this target." },
    { key: "questions", label: "Open questions", sortable: true, numeric: true, hide: "hidden xl:table-cell" },
  ];
  const withHotspots = rows.filter((r) => r.facets.hotspots[0] === "Hotspot map").length;
  return (
    <>
      <PageHeader kicker={<GroupKicker id="map" />} title="Target dossiers"
        lede={`One long-form page per target, generated from the graph: biology, prevalence by cancer, mutation hotspots (${withHotspots} targets so far), every product by modality and phase, trials, resistance routes, pathways, companion diagnostics, preclinical models, open questions and the external identifiers that join OnCo to UniProt, Ensembl, ChEMBL, Open Targets, CIViC, OncoKB and COSMIC. ${rows.length} targets.`} />
      <Container className="pb-16">
        <EntityBrowser rows={rows} facets={facets} columns={columns} noun="targets" hideStatus defaultSort={{ key: "products", dir: -1 }} />
      </Container>
    </>
  );
}

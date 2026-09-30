import { TABLE_PAGE } from "@/lib/static-tables";
import { EVIDENCE_TABLE, evidenceRows } from "./evidence";
import { CHINA_TRIALS_TABLE, chinaTrialRows } from "./china";
import { UNIVERSITY_GROUPED_TABLE, UNIVERSITY_OUTPUT_TABLE, UNIVERSITY_SCORE_TABLE, universityGroupedRankingRows, universityOutputRankingRows, universityScoreRows } from "./universities";
import { auditTableFiles } from "./audit";
import { PATHWAY_MATRIX_TABLE, PATHWAY_NODES_TABLE, pathwayDrugViews, pathwayMatrixRows, pathwaySections } from "./pathway-drugs";
import { dossierTrialTables } from "./dossier-trials";
import { STARTUPS_TABLE, startupBrowser } from "./startups";
import { OPEN_SOURCE_TABLE, openSourceBrowser } from "./open-source";
import { SOFTWARE_TABLE, softwareBrowser } from "./software";
import { kindTables } from "./kinds";
import { engineTables } from "./engine";
import { modalityTables } from "./modalities";
import { tagTables } from "./tagged";
import { genomeGenes } from "./genome";
import { GENOME_TABLE } from "@/lib/genome-hub";
import { dossierData } from "@/components/Dossier";
import { SECTION_PAGE } from "@/lib/static-tables";

/** One paged table: its id, every row, and the size of the page the HTML carries (TABLE_PAGE unless set). */
export type TableFile = { id: string; rows: unknown[]; page?: number };

/** The page size a table is registered with. */
export const tablePage = (t: TableFile): number => t.page ?? TABLE_PAGE;

/**
 * Every paged table on the site as id and full rows, in the order each page renders them. scripts/build-tables.ts
 * writes those longer than one page to public/api/v1/tables/<id>.json; the pages slice the same rows with
 * `pageRows` (src/lib/static-tables.ts), so the first page in the HTML and the file agree by construction.
 */
export function allTables(): TableFile[] {
  const views = pathwayDrugViews();
  return [
    ...kindTables(),
    { id: EVIDENCE_TABLE, rows: evidenceRows() },
    { id: CHINA_TRIALS_TABLE, rows: chinaTrialRows() },
    { id: UNIVERSITY_OUTPUT_TABLE, rows: universityOutputRankingRows() },
    { id: UNIVERSITY_GROUPED_TABLE, rows: universityGroupedRankingRows() },
    { id: UNIVERSITY_SCORE_TABLE, rows: universityScoreRows() },
    ...auditTableFiles(),
    { id: PATHWAY_MATRIX_TABLE, rows: pathwayMatrixRows(views) },
    { id: PATHWAY_NODES_TABLE, rows: pathwaySections(views), page: SECTION_PAGE },
    { id: STARTUPS_TABLE, rows: startupBrowser().rows },
    { id: OPEN_SOURCE_TABLE, rows: openSourceBrowser().rows },
    { id: SOFTWARE_TABLE, rows: softwareBrowser().rows },
    ...dossierTrialTables(dossierData),
    ...engineTables(),
    ...modalityTables(),
    ...tagTables(),
    { id: GENOME_TABLE, rows: genomeGenes() },
  ];
}

/** The tables that need a file: those longer than the page the HTML carries. */
export function pagedTables(tables = allTables()): TableFile[] {
  return tables.filter((t) => t.rows.length > tablePage(t));
}

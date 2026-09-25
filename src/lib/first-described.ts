/**
 * The year a target was first described, and what "described" is allowed to mean here.
 *
 * A row is one dated, citable claim: the year, the paper it comes from in words, its PubMed id where there is one,
 * and the UniProt accession the row was read from. scripts/fetch-first-described.ts writes
 * src/data/target-first-described.ts; src/data/index.ts merges a row onto a target that carries no
 * `firstDescribed` of its own, so a hand-written year with a better source always wins.
 *
 * The rule the generated rows follow is the earliest paper UniProt cites for the protein's or its gene's sequence,
 * which is the cloning or sequencing paper. That is a lower bound on the biology and an upper bound on nothing: a
 * protein seen on a gel years before it was cloned carries the cloning year here, and the record says so in
 * `firstDescribedBasis`. The one thing no row may ever be is the earliest paper OnCo happens to hold about the
 * target, which is its clinical literature and postdates the first drug on two targets in five.
 */
export type FirstDescribedRow = {
  year: number;
  /** The paper the year comes from, in words: authors, journal, year and title. */
  note: string;
  /** PubMed id of that paper, where UniProt cites one. */
  pmid?: string;
  /** The UniProt accession the reference list was read from. */
  uniprot: string;
};

/** The page a row can be checked on: the paper where there is a PubMed id, else the UniProt entry. */
export const firstDescribedSource = (r: FirstDescribedRow): string => (r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : `https://www.uniprot.org/uniprotkb/${r.uniprot}/entry`);

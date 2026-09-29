import type { Kind } from "@/lib/kinds";
import { EN_TEXT, nameAttrs } from "@/lib/translate";
import { TL } from "./T";

/**
 * The other names this record goes by.
 *
 * 6,995 records carry at least one, 819 carry more than six and 259 more than twelve. These are the words a person
 * was given in a clinic - "TNBC", "basal-like breast cancer" - and the words they typed into a search engine to
 * get here, so the line answers "am I in the right place?". Until 28 September 2026 it was set in
 * `text-xs text-muted text-end max-w-xs` in the header's right slot: the smallest type on the page, grey,
 * right-aligned, wrapped into a narrow column beside the title, as one comma-separated run. It is now a
 * full-width line under the lede at reading size, the names separated by middots so a name that contains a comma
 * still reads as one name.
 *
 * What the line shows is capped by count and by length: at most six names, and at most 160 characters of them.
 * 3,551 of the 24,612 names in the corpus are over 30 characters and 1,569 over 40 (the longest is 139, a subtype
 * description written into `aka`), and six of those is a paragraph rather than a line. No name is set `nowrap`
 * either: at 390 px a 139-character name would scroll the page sideways, which docs/MOBILE.md forbids.
 *
 * The rest fold into a plain `<details>`: every name is still in the markup for a crawler and for a reader
 * without JavaScript, and find-in-page opens the fold in browsers that support that, so someone looking for the
 * one name they were told still finds it.
 */
export const AKA_SHOWN = 6;
export const AKA_SHOWN_CHARS = 160;

/** How many names the line shows before the fold: up to six, up to 160 characters of them, never none. */
export function akaShown(aka: readonly string[]): number {
  let chars = 0;
  for (let i = 0; i < Math.min(aka.length, AKA_SHOWN); i++) {
    chars += aka[i].length;
    if (i > 0 && chars > AKA_SHOWN_CHARS) return i;
  }
  return Math.min(aka.length, AKA_SHOWN);
}

const Names = ({ names, kind }: { names: string[]; kind: Kind }) => (
  <>{names.map((a, i) => <span key={a}>{i > 0 && <span className="text-muted" aria-hidden> · </span>}<span {...nameAttrs(kind)}>{a}</span></span>)}</>
);

export function AkaLine({ e }: { e: { kind: Kind; aka: readonly string[] } }) {
  if (!e.aka.length) return null;
  const n = akaShown(e.aka);
  const shown = e.aka.slice(0, n);
  const folded = e.aka.slice(n);
  return (
    <div {...EN_TEXT} className="mt-3 max-w-3xl text-[15px] leading-relaxed" data-aka>
      <span className="text-muted"><TL text="Also called" />: </span>
      <Names names={shown} kind={e.kind} />
      {folded.length > 0 && (
        <details className="group inline" data-fold="aka">
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden inline text-accent hover:underline">
            <span className="group-open:hidden"> · {folded.length} more</span>
            <span className="hidden group-open:inline"> · <TL text="Fewer names" /></span>
          </summary>
          <div className="mt-1"><Names names={folded} kind={e.kind} /></div>
        </details>
      )}
    </div>
  );
}

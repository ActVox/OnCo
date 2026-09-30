import type { ReactNode } from "react";
import { paragraphs } from "@/lib/text";
import { TL } from "./T";

/**
 * The fold on a long summary.
 *
 * 1,329 records carry a summary over 1,800 characters, 282 over 3,000, and the two longest are twelve paragraphs
 * and about 21,000 characters (pancreatic cancer and triple-negative breast cancer). A reader who lands on one of
 * those meets a wall of prose where the rest of the page should be, and the sections, the trials and the questions
 * are thousands of pixels below the fold.
 *
 * So a long summary shows its opening and folds the rest:
 *
 *   - under 1,800 characters: nothing folds. Most records are short and a fold would be furniture.
 *   - over it: the first two paragraphs stay, or the first alone when that one is already 1,200 characters,
 *     because a single 1,500-character paragraph is the wall the fold exists to remove.
 *
 * 1,244 of the 1,329 fold under this rule. The 85 that do not are written as one or two paragraphs with nothing
 * after them (the longest, the nct05269381 trial, is 5,045 characters in a single paragraph); that is a writing
 * fault in the record rather than a layout one, and no split at sentence level would read well.
 *
 * It is a plain `<details>`, like every other fold on the site: the folded paragraphs are in the markup, so a
 * crawler, a reader with no JavaScript and the reading-level layers all still have the whole summary, and
 * find-in-page opens the fold in the browsers that support that. The saving is attention, not bytes. Print opens
 * it: PrintButton opens every `[data-fold]` before the dialog, so a patient pack still carries the full text.
 */
export const FOLD_OVER_CHARS = 1800;
export const FOLD_LEAD_PARAGRAPHS = 2;
export const FOLD_LEAD_CHARS = 1200;

/** A long summary split into what a reader meets first and what sits behind the fold. */
export function splitSummary(text: string): { lead: string[]; rest: string[] } {
  const ps = paragraphs(text);
  if (text.length <= FOLD_OVER_CHARS) return { lead: ps, rest: [] };
  const n = ps[0] && ps[0].length >= FOLD_LEAD_CHARS ? 1 : FOLD_LEAD_PARAGRAPHS;
  return { lead: ps.slice(0, n), rest: ps.slice(n) };
}

/** The fold itself: a "Read more" line that opens the rest in place. `count` is what the line offers. */
export function ReadMore({ count, children }: { count: number; children: ReactNode }) {
  return (
    <details className="group mt-3" data-fold="summary">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden inline-flex items-baseline gap-1.5 text-sm text-accent hover:underline">
        <span aria-hidden className="transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:rotate-90">▸</span>
        <span className="group-open:hidden"><TL text="Read more" /> <span className="text-muted">{count} more {count === 1 ? "paragraph" : "paragraphs"}</span></span>
        <span className="hidden group-open:inline"><TL text="Show less" /></span>
      </summary>
      {/* prose-onco spaces paragraphs with `p + p`, and the first paragraph in here has no sibling before it. */}
      <div className="mt-3 [&>p+p]:mt-[0.8em]">{children}</div>
    </details>
  );
}

import Link from "next/link";
import { SOFTWARE_CATEGORY_META, SOFTWARE_SOURCING_META, softwareForCancer, softwareForTechnology, softwareForVendor, softwareLink } from "@/lib/software";

/**
 * "Software in use": records from src/data/software.ts that serve this technology, are sold by this company or
 * institution, or are aimed at this cancer. Each card names the product, OnCo's one-line summary, what is behind
 * the row, and every source outside the company that was fetched and checked to name it. A row with no such source
 * says so on its face, which is the whole point of the page it comes from. Renders nothing when nothing matches.
 * Server component.
 */
export function SoftwarePanel({ id, name, kind, limit = 6 }: { id: string; name: string; kind: "technology" | "company" | "institution" | "cancer"; limit?: number }) {
  const all = kind === "technology" ? softwareForTechnology(id) : kind === "cancer" ? softwareForCancer(id) : softwareForVendor(id);
  if (!all.length) return null;
  const shown = all.slice(0, limit);
  const noun = kind === "technology" ? "serve this technology" : kind === "cancer" ? "are aimed at this cancer" : "this organisation sells";
  const more = kind === "technology" ? softwareLink("technology", name.replace(/ \(.*\)$/, "")) : kind === "cancer" ? softwareLink("cancer", name.replace(/ \(.*\)$/, "")) : softwareLink("vendor", all[0].vendor);
  return (
    <section className="mt-10" aria-labelledby={`software-${id}`}>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <h2 id={`software-${id}`} className="text-lg font-semibold tracking-tight">Software in use</h2>
        <Link href="/software/" className="text-xs text-muted hover:underline whitespace-nowrap">The software of oncology →</Link>
      </div>
      <p className="text-sm text-muted mb-3 max-w-3xl">Commercial and regulated products that {noun}. Each card says what is behind it: a regulator&apos;s database, the literature, a public body&apos;s list, or only the company&apos;s own words. Listing is not endorsement, and a clearance is a regulatory fact, not a clinical one.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((p) => {
          const cat = SOFTWARE_CATEGORY_META[p.category];
          const src = SOFTWARE_SOURCING_META[p.sourcing];
          const href = p.claim?.url ?? p.source.url;
          return (
            <li key={p.id} id={`sw-${p.id}`} className="card p-3 text-sm flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <a className="font-medium leading-snug hover:underline" href={href} rel="noopener">{p.name}</a>
                <Link href={softwareLink("sourcing", src.label)} className={`chip text-[11px] ${p.sourcing === "independent" ? "border border-accent/40 bg-accent-soft text-accent" : "bg-foreground/5"}`} title={src.tip}>{src.label}</Link>
                <Link href={softwareLink("category", cat.label)} className="chip bg-foreground/5 text-[11px] inline-flex items-center gap-1" title={cat.blurb}><svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={cat.glyph} /></svg>{cat.label}</Link>
              </div>
              <p className="text-muted leading-relaxed">{p.summary}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mt-auto text-muted">
                <span title="Who sells it">{p.vendor}</span>
                {p.clearances.slice(0, 2).map((c) => <a key={c.number} className="underline" href={c.url} rel="noopener" title={`FDA ${c.route} ${c.number}, ${c.date}: "${c.device}" (${c.applicant}). ${c.decision}`}>FDA {c.number}</a>)}
                {p.papers.slice(0, 1).map((x) => <a key={x.url} className="underline" href={x.url} rel="noopener" title={`${x.title}${x.journal ? `. ${x.journal}` : ""}, ${x.year}.${x.peerReviewed ? "" : " A preprint, not peer reviewed."}`}>Paper {x.year}</a>)}
                {p.listings.slice(0, 1).map((l) => <a key={l.url} className="underline" href={l.url} rel="noopener" title={`${l.label}. Fetched ${l.fetched}.`}>{l.body}</a>)}
                {p.sourcing === "self-described" && <span title={src.tip}>no source outside the company found</span>}
              </div>
            </li>
          );
        })}
      </ul>
      {shown.length < all.length && <p className="text-xs text-muted mt-2"><Link className="underline" href={more}>{all.length - shown.length} more on the software page →</Link></p>}
    </section>
  );
}

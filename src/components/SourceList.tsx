import Link from "next/link";
import type { Entity } from "@/lib/schema";
import { Block } from "./record-blocks";
import { TL } from "./T";
import { Container } from "./ui";

/**
 * Every source a record cites, at the foot of the page.
 *
 * The owner, 28 September 2026: "a massive link panel on the right side bar is not good design eg 'Sources &
 * links' this might be better as a table at the bottom of the page. it might be ok to have the primary links eg
 * wikipedia but maybe its better to have more 'object' focused data eg the AKA or other things in there."
 *
 * Measured before the change: `e.links` rendered as one unbounded list in the aside. Pancreatic cancer carried
 * 124, triple-negative breast cancer 109, colorectal 106, gallbladder 99. 48 records carry more than eight and
 * 16 more than twenty, so the wall was worst on exactly the pages that had the most work put into them, and on
 * a phone the aside stacks above the reader's own content.
 *
 * What the count hid: 60 of triple-negative's 109 and 59 of pancreatic's 124 are DOIs. More than half of the
 * "links" are citations to papers and guidelines, which are a reference list, not navigation. So the foot
 * groups by where a source comes from, read off the URL and never curated, and the citations sit together
 * under their own heading instead of being interleaved with a charity's patient page.
 */

/** Display names for the hosts that recur. Anything not here shows its own hostname, which is already a fact. */
const ORGANISATION: Record<string, string> = {
  "doi.org": "Papers and guidelines, by DOI",
  "pubmed.ncbi.nlm.nih.gov": "PubMed",
  "www.ncbi.nlm.nih.gov": "NCBI",
  "clinicaltrials.gov": "ClinicalTrials.gov",
  "cancerresearchuk.org": "Cancer Research UK",
  "macmillan.org.uk": "Macmillan Cancer Support",
  "nice.org.uk": "NICE",
  "nhs.uk": "NHS",
  "scot.nhs.uk": "NHS Scotland",
  "cancer.gov": "National Cancer Institute",
  "seer.cancer.gov": "SEER",
  "gco.iarc.who.int": "IARC Global Cancer Observatory",
  "who.int": "World Health Organization",
  "fda.gov": "US Food and Drug Administration",
  "accessdata.fda.gov": "US Food and Drug Administration",
  "ema.europa.eu": "European Medicines Agency",
  "dailymed.nlm.nih.gov": "DailyMed",
  "esmo.org": "ESMO",
  "asco.org": "ASCO",
  "nccn.org": "NCCN",
  "scottishmedicines.org.uk": "Scottish Medicines Consortium",
  "en.wikipedia.org": "Wikipedia",
};

/** The registrable part of a host, so `www.` and a country subdomain do not split one organisation into three. */
export function sourceHost(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    if (ORGANISATION[h]) return h;
    // Keep the last three labels for a two-part public suffix (co.uk, org.uk, ac.uk, com.au), two otherwise.
    const p = h.split(".");
    const two = /^(co|org|ac|gov|net|com)\.[a-z]{2}$/.test(p.slice(-2).join("."));
    return p.slice(two ? -3 : -2).join(".");
  } catch {
    return url;
  }
}

export function sourceGroups(links: ReadonlyArray<{ label: string; url: string }>) {
  const by = new Map<string, Array<{ label: string; url: string }>>();
  for (const l of links) {
    const h = sourceHost(l.url);
    const g = by.get(h);
    if (g) g.push(l); else by.set(h, [l]);
  }
  // Most-cited first, then alphabetically, so a reader scanning the foot meets the organisation behind most of
  // the page before the one behind a single line. DOIs are a reference list and always come last.
  return [...by.entries()]
    .map(([host, items]) => ({ host, name: ORGANISATION[host] ?? host, items }))
    .sort((a, b) => (a.host === "doi.org" ? 1 : b.host === "doi.org" ? -1 : 0) || b.items.length - a.items.length || a.name.localeCompare(b.name));
}

export function SourceList({ e }: { e: Entity }) {
  // Wikipedia stays in the right-hand column: it is the record's identity, not one of its citations.
  const links = e.links.filter((l) => l.url !== e.wikipedia);
  if (links.length === 0) return null;
  const groups = sourceGroups(links);
  return (
    <Container className="pb-16">
      <Block id="sources" title="Sources">
        <p className="text-sm text-muted mb-4 max-w-3xl">
          <TL text="Every source this page cites, grouped by who published it. Grouping is read from the web address, not assigned by hand." />
        </p>
        <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.host} className="min-w-0">
              <div className="kicker mb-1.5">{g.name} <span className="text-muted">· {g.items.length}</span></div>
              <ul className="space-y-1 text-sm">
                {g.items.map((l) => <li key={l.url}><a className="underline break-words" href={l.url} rel="noopener">{l.label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted mt-5">
          <TL text="A source that has moved or gone is reported by the weekly link check." /> <Link className="underline" href="/audit/">/audit/</Link>
        </p>
      </Block>
    </Container>
  );
}

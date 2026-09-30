import { MECHANICS } from "@/data/mechanics-atlas";
import { graph } from "./graph";
import { portraitSrc } from "./portraits";
import { NAV_GROUPS } from "./nav";
import { routeFor, type Kind } from "./kinds";
import { engineRoute, FORMATS, modalityRoute } from "./modular-formats";
import { DECISION_TOOLS, toolRoute } from "./decision-tools";
import { COMPARE_SETS, compareRoute } from "./cancer-compare";

export type SearchDoc = { id: string; kind: Kind | "page"; name: string; /** Aliases, one per line: MiniSearch tokenises on the newline as it does on a space, and the ranking can still tell "Breast cancer in men" from a lone "Breast". */ aka: string; tldr: string; tags: string; route: string; status?: string; /** Space-separated ids of the cancers the record links to, for the "for my cancer" filter. */ cancers?: string; /** The broader record this is a subtype of (a cancer's parent page); Ask ranks a subtype below its parent unless the query names it. */ parent?: string; /** A person's portrait, so the command palette can show a face without importing the portrait index. */ portrait?: string };

/** Pages outside the navigation groups that a search should still reach. */
export const SITE_PAGES: ReadonlyArray<{ href: string; label: string; blurb: string }> = [
  { href: "/about/", label: "About and methodology", blurb: "What OnCo is, how it is built, its rules for facts, licences and how to contribute." },
  { href: "/ideas/rankings/", label: "Idea rankings", blurb: "The ideas ordered six ways: best bang for buck, most important, hardest, closest to reality, cherry picked and most wanted, every score with its formula." },
  { href: "/terms-of-use/", label: "Terms of use", blurb: "The rules for using OnCo: not medical advice, accuracy not guaranteed, accounts, licences, liability and contact." },
  { href: "/privacy/", label: "Privacy policy", blurb: "What OnCo collects and where it lives: hosting, analytics, accounts, browser storage, your rights and how to contact us." },
];

/** Compact documents for the client-side search index. */
/** The site's own tool and landing pages, so a search for "models" or "pivot" reaches the page and not only the records. */
function pageDocs(): SearchDoc[] {
  const seen = new Set<string>();
  const out: SearchDoc[] = [];
  // The open drug engine's format pages are generated from FORMATS, so a search for "radioligand" or "ADC" reaches the grid.
  const enginePages = FORMATS.map((f) => ({ href: engineRoute(f.id), label: `${f.name}: open drug engine`, blurb: f.blurb }));
  // The modality hubs likewise, so "CAR-T" or "degrader" reaches the hub that gathers everything about the format.
  const modalityPages = FORMATS.map((f) => ({ href: modalityRoute(f.id), label: `${f.name}: modality hub`, blurb: `Everything OnCo records about ${f.name.toLowerCase()}: how they work, approved medicines, phase 3, parts, companies, trials, side effects, resistance, papers, roadmaps, ideas and manufacturing. ${f.blurb}` }));
  // Decision aids and side-by-side comparisons, so "gallbladder polyp" reaches the aid and not only the glossary term.
  const toolPages = [
    ...DECISION_TOOLS.map((t) => ({ href: toolRoute(t.id), label: `${t.short}: ${t.title}`, blurb: t.lede })),
    ...COMPARE_SETS.map((s) => ({ href: compareRoute(s.anchorId), label: `${graph().must(s.anchorId).name} compared with its neighbours`, blurb: s.title })),
  ];
  const pages: ReadonlyArray<{ href: string; label: string; blurb: string; aka?: string }> = [...NAV_GROUPS.flatMap((gp) => [{ href: gp.href, label: gp.label, blurb: gp.blurb }, ...gp.items]), ...SITE_PAGES, ...enginePages, ...modalityPages, ...toolPages];
  for (const it of pages) {
    if (seen.has(it.href)) continue; seen.add(it.href);
    // `aka` carries the page's former name, so a reader searching "forest plot" still reaches the renamed page.
    out.push({ id: "page:" + it.href, kind: "page", name: it.label, aka: it.aka ?? "", tldr: it.blurb, tags: "page", route: it.href, status: "" });
  }
  // Mechanics atlas stages: one page each, found by title and first sentence.
  for (const c of MECHANICS) for (const st of c.stages) {
    const href = `/mechanics/${st.id}/`;
    if (seen.has(href)) continue; seen.add(href);
    out.push({ id: "page:" + href, kind: "page", name: st.title, aka: `mechanics ${c.title}`, tldr: st.plain, tags: "page mechanics", route: href, status: "" });
  }
  return out;
}

export function searchDocs(): SearchDoc[] {
  return graph().entities.map((e) => ({
    id: e.id,
    kind: e.kind,
    name: e.name,
    aka: e.aka.join("\n"),
    tldr: e.tldr,
    tags: e.tags.join(" "),
    route: routeFor(e),
    status: e.status,
    cancers: e.cancers.length ? e.cancers.join(" ") : undefined,
    parent: "parent" in e && typeof e.parent === "string" ? e.parent : undefined,
    // The face, for the 180 people who have one. It travels in the document rather than being looked up in
    // the palette: importing the portrait index into a component the root layout renders pulls the whole
    // index into the first bundle, which src/app/layout-imports.test.ts refuses.
    portrait: e.kind === "person" ? portraitSrc(e.id) : undefined,
  }));
}

/** What the site ships as search.json: the tool pages first, then every record. Pages are not entities, so callers that resolve ids against the graph should use searchDocs(). */
export function siteSearchDocs(): SearchDoc[] {
  return [...pageDocs(), ...searchDocs()];
}

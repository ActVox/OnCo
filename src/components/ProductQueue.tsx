"use client";

import { useEffect, useState } from "react";

/**
 * The queue of product changes waiting for the owner, read from GitHub in his browser.
 *
 * It used to be rendered from `public/product-queue.json` at build time, which meant the page showed whatever
 * was true when the site was last built. The owner, 2 October 2026: "the admin page is out of synch with
 * github" — he was looking at a page that still listed the software map, merged and live four days earlier.
 * A queue that can be wrong about what is waiting is worse than no queue, because its whole job is to be the
 * list he trusts.
 *
 * So the list is fetched live from the public GitHub API when the page opens. The built-in list stays as the
 * fallback and is labelled as such, because the API is rate-limited per address and can fail; what the page
 * must never do is show a stale list as though it were current.
 */

export type Queued = { branch: string; why: string; pr: string; preview: string; files: number; proposed: string; state: string };

const API = "https://api.github.com/repos/judegomila/OnCo/pulls?state=open&per_page=100";

type Pull = { number: number; title: string; html_url: string; created_at: string; changed_files?: number; head: { ref: string } };

/** A pull request is a product change when it is on a `product/` branch; that is what scripts/ship.sh pushes. */
const isProduct = (p: Pull) => p.head.ref.startsWith("product/");

function fromPull(p: Pull, built: Queued[]): Queued {
  const known = built.find((b) => b.pr.endsWith(`/${p.number}`) || b.branch === p.head.ref);
  return {
    branch: p.head.ref,
    why: p.title.replace(/^Product change:\s*/i, ""),
    pr: p.html_url,
    preview: known?.preview ?? "",
    files: p.changed_files ?? known?.files ?? 0,
    proposed: p.created_at.slice(0, 10),
    state: "waiting",
  };
}

export function ProductQueue({ built }: { built: Queued[] }) {
  const [rows, setRows] = useState<Queued[]>(built);
  const [source, setSource] = useState<"built" | "github" | "failed">("built");

  useEffect(() => {
    let live = true;
    fetch(API, { cache: "no-store", headers: { accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((pulls: Pull[]) => {
        if (!live) return;
        setRows(pulls.filter(isProduct).map((p) => fromPull(p, built)));
        setSource("github");
      })
      .catch(() => { if (live) setSource("failed"); });
    return () => { live = false; };
  }, [built]);

  const note = source === "github"
    ? "Read from GitHub when you opened this page."
    : source === "failed"
      ? "GitHub could not be reached, so this is the list as it stood when the site was last built. It may be out of date; the pull requests themselves are the truth."
      : "Reading the current list from GitHub…";

  return (
    <>
      <h2 className="text-2xl font-semibold tracking-tight mt-10 mb-1">
        {rows.length === 0 ? "Nothing is waiting" : `${rows.length} waiting`}
      </h2>
      <p className="text-xs text-muted mb-4">{note}</p>

      {rows.length === 0 ? (
        <p className="text-sm text-muted">No product change is open. Data keeps shipping on its own.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li key={c.branch} className="card p-4">
              <p className="font-medium">{c.why}</p>
              <p className="mt-1 text-xs text-muted">
                {c.files > 0 && <>{c.files} file{c.files === 1 ? "" : "s"} · </>}proposed {c.proposed} · <code>{c.branch}</code>
              </p>
              <p className="mt-2 flex flex-wrap gap-3 text-sm">
                {c.pr && <a className="underline" href={c.pr} rel="noopener">Read it and merge to approve</a>}
                {c.preview && <a className="underline" href={c.preview} rel="noopener">See it as a page</a>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

import type { Metadata } from "next";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Container, PageHeader } from "@/components/ui";
import { ProductQueue, type Queued } from "@/components/ProductQueue";
import { pageMeta } from "@/lib/seo";

/**
 * What is waiting for the owner.
 *
 * He asked for "an /admin where only my logged in ... can see the page for approving product changes". Half of
 * that is possible here and half is not, and the page says so rather than implying otherwise: this site is a
 * static export with no server, so every page is public and anything this one claimed to check would run in the
 * reader's own browser. His address is deliberately not in this repository. What makes the queue safe is not this
 * page: it is that approval happens by merging a pull request, which GitHub checks properly, and that production
 * deployment can be restricted to a branch only he merges, which is a setting in his account.
 *
 * So this is a reading surface, holding nothing that is not already public. The list itself is read from the
 * GitHub API in the browser (src/components/ProductQueue.tsx) rather than baked in at build time: on
 * 2 October 2026 the owner found this page listing the software map, which had been merged and live for four
 * days, because the page was a snapshot of the last build. public/product-queue.json is now only the fallback
 * for when GitHub cannot be reached, and it is labelled as such when it is used.
 */

export const metadata: Metadata = pageMeta({
  title: "Waiting for approval",
  description: "Changes to the product that are built, tested and held until the owner approves them.",
  path: "/admin/",
});

function queue(): Queued[] {
  const f = join(process.cwd(), "public", "product-queue.json");
  if (!existsSync(f)) return [];
  try {
    return (JSON.parse(readFileSync(f, "utf8")) as Queued[]).filter((c) => c.state === "waiting");
  } catch {
    return [];
  }
}

export default function Admin() {
  const waiting = queue();
  return (
    <>
      <PageHeader
        title="Waiting for approval"
        lede="Changes to the product are built, tested and held here. Data keeps flowing: a wave of fetched trials is freshness and ships on its own."
      />
      <Container className="pb-16">
        <section className="card p-5">
          <h2 className="text-lg font-semibold tracking-tight">How a change gets in</h2>
          <ol className="mt-2 space-y-1.5 text-sm list-decimal pl-5">
            <li>An agent finishes, and the gates pass: validate, typecheck, lint and the full test suite.</li>
            <li><code>scripts/change-class.ts</code> asks whether it touches the product or only the data.</li>
            <li>If it touches the product, the chain refuses to deploy it and it is pushed as a pull request instead.</li>
            <li>You merge the pull request. That is the approval, and the change ships on the next run.</li>
          </ol>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            This page is a reading surface, not a lock. The site is a static export with no server, so it is public
            like every other page and it holds nothing that is not. What actually protects the live site is that
            merging is yours, and that production deployment can be restricted to a branch only you merge. Both are
            settings in your accounts rather than code in this repository. See <code>docs/PRODUCT-APPROVAL.md</code>.
          </p>
        </section>

        <ProductQueue built={waiting} />

      </Container>
    </>
  );
}

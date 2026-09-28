import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { GroupLanding } from "@/components/GroupLanding";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS } from "@/lib/schema";
import { KIND_COLOR } from "@/lib/text";
export const metadata: Metadata = pageMeta({ title: "Cancers & treatments", description: "The corpus by kind: every object with a TL;DR and everything connected to it.", path: "/map/" });
export default function Page() {
  const g = graph();
  return (
    <GroupLanding groupId="map">
      <h2 className="text-lg font-semibold mt-12 mb-3">Counts</h2>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
        {KINDS.filter((k) => g.kind(k).length > 0).map((k) => (
          <Link key={k} href={`/${KIND_META[k].route}/`} className={`card p-3 hover:shadow-md transition border ${KIND_COLOR[k]}`}>
            <div className="text-2xl font-semibold tabular-nums">{g.kind(k).length.toLocaleString("en-GB")}</div>
            <div className="text-sm capitalize">{KIND_META[k].plural}</div>
          </Link>
        ))}
      </div>
    </GroupLanding>
  );
}

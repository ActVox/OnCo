import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GroupLanding } from "@/components/GroupLanding";
export const metadata: Metadata = pageMeta({ title: "News & evidence", description: "Dates, congress readouts, failures, resistance, and the supply chain behind the drugs.", path: "/intel/" });
export default function Page() { return <GroupLanding groupId="intel" />; }

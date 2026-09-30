import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { GroupLanding } from "@/components/GroupLanding";
export const metadata: Metadata = pageMeta({ title: "Start here", description: "Start from your question: a cancer, a biomarker, two products to compare, or the whole graph.", path: "/find/" });
export default function Page() { return <GroupLanding groupId="find" />; }

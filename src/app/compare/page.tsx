import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Suspense } from "react";
import { graph } from "@/lib/graph";
import { phaseLabel, routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CompareView, type CompareItem } from "@/components/CompareView";

export const metadata: Metadata = pageMeta({ title: "Compare up to five, side by side", description: "Side-by-side comparison of up to five products, technologies, targets, trials, or cancers, with differences highlighted.", path: "/compare/" });

export default function ComparePage() {
  const g = graph();
  const names = (ids: string[]) => ids.map((id) => g.must(id).name).join(", ") || "-";
  const pct = (v?: number) => (v === undefined ? undefined : `${v}%`);
  const items: CompareItem[] = [
    ...g.kind("drug").map((d): CompareItem => ({
      id: d.id, kind: "drug", name: d.name, route: routeFor(d), status: d.status, tldr: d.tldr,
      fields: [
        ["Brand / code", [d.brand, d.code].filter(Boolean).join(" · ") || "-"],
        ["Modality", d.modality],
        ["Mechanism", d.mechanism],
        ["Payload", d.payload ?? "-"],
        ["Linker", d.linker ?? "-"],
        ["Targets", names(d.targets)],
        ["Cancers", names(d.cancers)],
        ["Companies", names(d.companies)],
        ["First approval", d.approvals.length ? String(Math.min(...d.approvals.map((a) => a.year))) : "-"],
        ["Approvals", d.approvals.length ? d.approvals.map((a) => `${a.region} ${a.year}: ${a.indication}`).join(" · ") : "-"],
        ["Dosing", d.dosing ? `${d.dosing.route}; ${d.dosing.schedule}${d.dosing.monitoring ? `; monitor: ${d.dosing.monitoring}` : ""}` : "-"],
        ["Grade ≥3 toxicities", d.toxicity.length ? d.toxicity.filter((t) => t.grade3PlusPct !== undefined).map((t) => `${t.event} ${pct(t.grade3PlusPct)}`).join(" · ") || "-" : "-"],
        ["Access", d.access.length ? d.access.map((a) => `${a.country}: ${[a.listPrice, a.reimbursement].filter(Boolean).join(", ") || "recorded"}`).join(" · ") : "-"],
        ["Regulatory events", d.regulatoryEvents.length ? d.regulatoryEvents.map((r) => `${r.date} ${r.type} (${r.region})`).join(" · ") : "-"],
        ["Key trials", names(d.trials)],
      ],
    })),
    ...g.kind("technology").map((t): CompareItem => ({
      id: t.id, kind: "technology", name: t.name, route: routeFor(t), status: t.status, tldr: t.tldr,
      fields: [
        ["Principle", t.principle],
        ["Generation", t.generation ?? "-"],
        ["Since", t.since !== undefined ? String(t.since) : "-"],
        ["Strengths", t.strengths.join(" · ") || "-"],
        ["Limitations", t.limitations.join(" · ") || "-"],
        ["Fronts", names(t.sections)],
        ["Targets", names(t.targets)],
        ["Cancers", names(t.cancers)],
        ["Companies", names(t.companies)],
        ["Products using it", names((g.incoming(t.id).get("drug") ?? []).map((d) => d.id))],
      ],
    })),
    ...g.kind("target").map((t): CompareItem => ({
      id: t.id, kind: "target", name: t.name, route: routeFor(t), status: t.status, tldr: t.tldr,
      fields: [
        ["Symbol", t.symbol ?? "-"],
        ["Class", t.targetClass.replace("-", " ")],
        ["Biology", t.biology],
        ["Where found", t.whereFound.join(" · ") || "-"],
        ["Prevalence", t.prevalence.length ? t.prevalence.map((p) => `${g.must(p.cancerId).name.replace(/ \(.*\)$/, "")}: ${p.pct}%`).join(" · ") : "-"],
        ["Cancers", names(t.cancers)],
        ["Pathways", names(t.pathways)],
        ["Products against it", names((g.incoming(t.id).get("drug") ?? []).map((d) => d.id))],
        ["Technologies", names((g.incoming(t.id).get("technology") ?? []).map((x) => x.id))],
      ],
    })),
    ...g.kind("trial").map((t): CompareItem => ({
      id: t.id, kind: "trial", name: t.name, route: routeFor(t), status: t.status, tldr: t.tldr,
      fields: [
        ["Registry", t.nct ?? "-"],
        ["Phase", phaseLabel(t.phase)],
        ["Setting", t.setting],
        ["Sponsor", t.sponsor ?? "-"],
        ["Enrolled", t.enrolled !== undefined ? String(t.enrolled) : "-"],
        ["Products", names(t.drugs)],
        ["Cancers", names(t.cancers)],
        ["Headline result", t.result ?? "-"],
        ["Outcomes", t.outcomes.length ? t.outcomes.map((o) => `${o.endpoint}: ${o.arms.map((a) => `${a.name} ${a.value ?? "?"}${o.unit ?? ""}`).join(" vs ")}${o.hr !== undefined ? ` (HR ${o.hr})` : ""}`).join(" · ") : "-"],
        ["Replication", t.replication ?? "-"],
        ["Reported", t.yearReported !== undefined ? String(t.yearReported) : "-"],
      ],
    })),
    ...g.kind("cancer").map((c): CompareItem => ({
      id: c.id, kind: "cancer", name: c.name, route: routeFor(c), status: c.status, tldr: c.tldr,
      fields: [
        ["Group", c.group],
        ["Burden", c.burden ?? "-"],
        ["Subtypes", c.subtypes.join(" · ") || "-"],
        ["Biomarkers", c.biomarkers.join(" · ") || "-"],
        ["State of the art", c.stateOfArt.join(" · ") || "-"],
        ["Care settings", String(c.standardOfCare.length)],
        ["Approved products", String((g.forCancer(c.id).get("drug") ?? []).filter((d) => d.status === "approved").length)],
        ["Pipeline items", String(c.pipeline.length)],
        ["Key targets", names(c.targets)],
        ["Open problems", c.openProblems.join(" · ") || "-"],
      ],
    })),
  ].sort((x, y) => x.name.localeCompare(y.name));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Compare up to five, side by side" lede="Up to five products, technologies, targets, trials, or cancers side by side, same fields, differences highlighted. The URL is shareable." />
      <Container className="pb-16">
        <Suspense><CompareView items={items} /></Suspense>
      </Container>
    </>
  );
}

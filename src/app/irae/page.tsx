import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { ICI_DRUGS, irae } from "@/data/irae";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { IraeGuide, type IciLite } from "./IraeGuide";

export const metadata: Metadata = pageMeta({ title: "Checkpoint side effects by organ", description: "Checkpoint inhibitor toxicity by organ system and CTCAE grade: hold or continue, steroid dose, escalation when refractory, and rechallenge, distilled from ASCO 2021, NCCN and ESMO 2022 with the differences flagged. Printable card per organ.", path: "/irae/" });

function validate(): void {
  const g = graph();
  const errors: string[] = [];
  for (const id of ICI_DRUGS) if (g.get(id)?.kind !== "drug") errors.push(`ICI_DRUGS: "${id}" is not a product`);
  const seen = new Set<string>();
  for (const e of irae) {
    if (seen.has(e.id)) errors.push(`${e.id}: duplicate`);
    seen.add(e.id);
    for (const id of e.terms ?? []) if (g.get(id)?.kind !== "term") errors.push(`${e.id}: "${id}" is not a term`);
    for (const id of e.drugs ?? []) if (g.get(id)?.kind !== "drug") errors.push(`${e.id}: "${id}" is not a product`);
    if (e.grades.map((x) => x.grade).join() !== "1,2,3,4") errors.push(`${e.id}: grades must be 1-4 in order`);
  }
  if (errors.length) throw new Error(`Invalid irAE data:\n${errors.join("\n")}`);
}

export default function IraePage() {
  validate();
  const g = graph();
  const icis: IciLite[] = ICI_DRUGS.map((id) => g.must(id)).filter((d) => d.kind === "drug").map((d) => ({ id: d.id, name: d.name, route: routeFor(d), modality: d.kind === "drug" ? d.modality : "" }));
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Checkpoint side effects by organ"
        lede={`${irae.length} organ systems, four grades each: whether to hold or stop the checkpoint inhibitor, the steroid dose, what to add when steroids fail, and whether to rechallenge, from the ASCO 2021, NCCN and ESMO 2022 guidelines with their disagreements marked. Pick an organ, filter by grade, print the card for the ward.`} />
      <Container className="pb-16">
        <IraeGuide icis={icis} />
        <div className="mt-8 grid gap-4 md:grid-cols-2 text-sm no-print">
          <div className="card p-4 space-y-1.5">
            <h2 className="font-semibold">Principles shared by all three guidelines</h2>
            <ul className="list-disc pl-5 text-muted space-y-1">
              <li>Grade 1: usually continue with monitoring (except pneumonitis, myocarditis and neurological events, where even grade 1 means hold).</li>
              <li>Grade 2: hold; prednisone 0.5-1 mg/kg if not settling; resume at grade 1 on 10 mg/day or less.</li>
              <li>Grade 3: hold or stop; IV methylprednisolone 1-2 mg/kg; add a second agent (infliximab, vedolizumab, mycophenolate, IVIG, tocilizumab) if no response in 48-72 hours.</li>
              <li>Grade 4: permanently discontinue, except endocrinopathies controlled by hormone replacement.</li>
              <li>Myocarditis of any grade, and grade 2 or above myasthenia or Guillain-Barré, mean permanent discontinuation; pulse-dose steroids for myocarditis.</li>
            </ul>
          </div>
          <div className="card p-4 space-y-1.5">
            <h2 className="font-semibold">Read with</h2>
            <p className="text-muted"><Link href="/toxicity/" className="underline">Side effects across a drug class</Link> holds the label rates for each checkpoint inhibitor; the <Link href="/interactions/" className="underline">interaction checker</Link> notes that steroids given for irAEs do not appear to blunt efficacy; and each product page carries its safety tab. Time to onset matters: colitis and hepatitis are commonest at 6-12 weeks, endocrine events at 8-20 weeks, but any event can occur months after the last dose.</p>
          </div>
        </div>
      </Container>
    </>
  );
}

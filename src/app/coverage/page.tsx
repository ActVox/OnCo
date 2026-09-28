import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  title: "Cost and coverage by country",
  description: "Who pays for cancer care and what is covered: the NHS and NICE in the UK, insurers, Medicare and assistance in the US, plan rankings, HTA verdicts, and financial help by country and product.",
  path: "/coverage/",
});

const PAGES: Array<{ href: string; title: string; blurb: string }> = [
  { href: "/coverage/uk/", title: "United Kingdom", blurb: "NICE technology appraisals, the Cancer Drugs Fund and SMC decisions for every approved product, plus how NHS cancer care works." },
  { href: "/coverage/us/", title: "United States", blurb: "Medicare, Medicaid and commercial coverage rules, published prices, prior authorisation, and manufacturer assistance for each product." },
  { href: "/coverage/rankings/", title: "Coverage rankings", blurb: "US insurers and plan types ranked by one published metric at a time: denial and overturn rates, Star Ratings, enrolment." },
  { href: "/hta/", title: "Funding verdicts by country", blurb: "Health technology assessment verdicts by country: NICE, SMC, Germany's G-BA, France's HAS, Canada's CDA and Australia's PBAC." },
  { href: "/assistance/", title: "Financial help", blurb: "Manufacturer programmes, charities and national schemes by country and product, with eligibility and how to apply." },
  { href: "/costs/", title: "Cutting cancer care costs", blurb: "Each cost driver paired with what is being done about it, with year and source, and the ideas that could do more." },
];

export default function CoveragePage() {
  return (
    <>
      <PageHeader kicker={<GroupKicker id="live" />} title="Cost and coverage by country" lede="Who pays for cancer care, what is covered, and where to find help with the bills. Start with your country, then the product." />
      <Container className="pb-16">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PAGES.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="card block h-full p-5 hover:shadow-md transition">
                <div className="font-semibold">{p.title}</div>
                <p className="text-sm text-muted mt-1 leading-relaxed">{p.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted mt-6 max-w-3xl">Not medical or financial advice. Coverage rules, prices and assistance funds change often and differ between plans and regions; check with your care team&apos;s financial counsellor or the scheme itself before relying on a figure here.</p>
      </Container>
    </>
  );
}

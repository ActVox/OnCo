import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CatalystBrowser } from "@/components/CatalystBrowser";
import { FEED_PATH, mergedCatalysts } from "@/lib/catalysts";

export const metadata: Metadata = pageMeta({ title: "What is due next, company by company", description: "Dated regulatory decisions, expected readouts, advisory committees, filings and deal closings by company, with an iCalendar feed.", path: "/catalysts/" });

export default function CatalystsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const events = mergedCatalysts(today);
  const upcoming = events.filter((e) => !e.past);
  const confirmed = upcoming.filter((e) => e.confidence === "confirmed").length;
  const companies = new Set(upcoming.flatMap((e) => e.companies.map((c) => c.id))).size;
  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel"><span className="kicker">·</span><Link href="/calendar/" className="kicker hover:underline">Readout calendar</Link></GroupKicker>} title="What is due next, company by company"
        lede={`${upcoming.length} upcoming events across ${companies} companies: ${confirmed} with a confirmed date, the rest editorial estimates that can slip by quarters. Filter by company or quarter, then download the selection as an .ics file or subscribe to the full feed.`} />
      <Container className="pb-16">
        <CatalystBrowser events={events} feedPath={FEED_PATH} />
        <section className="grid md:grid-cols-2 gap-6 text-sm mt-10">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How to read this</h2>
            <p>Confirmed events carry a source that states the date: a PDUFA goal date in a sponsor release, an advisory committee notice, a congress programme. Expected events are our estimate from the registry primary completion date and sponsor statements; treat them as a quarter, not a day.</p>
            <p>Companies are attached directly for catalysts and derived for readout-calendar rows from the products named (each product&rsquo;s companies in the corpus). Past events stay in the data and can be shown with the checkbox.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">Calendar feed</h2>
            <p>Subscribe to <code className="text-xs">{FEED_PATH}</code> in Google Calendar, Outlook or Apple Calendar to get every event, including expected ones placed on the first day of their period. The download button exports only the rows you have filtered to.</p>
            <p>Missing a catalyst? Add it to <code className="text-xs">src/data/catalysts.ts</code> with company and product ids and a source; congresses and policy dates belong in <code className="text-xs">src/data/calendar.ts</code>.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

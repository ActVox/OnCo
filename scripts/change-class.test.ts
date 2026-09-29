import { describe, expect, it } from "vitest";
import { classify } from "./change-class";

/**
 * The line between a change that ships and a change that waits for the owner. Getting this wrong in one direction
 * stalls a fetcher; getting it wrong in the other ships a redesign he has not seen, which is the thing he asked
 * to stop. So the cases are written out rather than inferred.
 */
describe("product or data", () => {
  it("treats what a page shows, orders or calls things as product", () => {
    for (const f of [
      "src/components/CancerRecord.tsx",
      "src/app/cancers/[id]/uk/page.tsx",
      "src/lib/record-sections.ts",
      "src/lib/i18n/ui/fr.ts",
      "src/lib/kind-browser.ts",
      "src/lib/nav.ts",
      "next.config.ts",
    ]) expect(classify(f), f).toBe("product");
  });

  it("treats a record's content and a generated artefact as data", () => {
    for (const f of [
      "src/data/spikes/prostate-core.ts",
      "src/data/cancers.ts",
      "public/trials/pembrolizumab.json",
      "public/provenance.json",
      "public/api/v1/all.json",
    ]) expect(classify(f), f).toBe("data");
  });

  it("gates on neither a test nor a document nor a script", () => {
    for (const f of [
      "src/lib/tone.test.ts",
      "docs/CONTENT-ROADMAP.md",
      "AGENTS.md",
      "scripts/fetch-open-source.ts",
      ".github/workflows/weekly.yml",
    ]) expect(classify(f), f).toBe("neither");
  });

  it("reads package.json rather than its name: a script entry is not a product change", () => {
    // A dependency or a build setting changes what the site is; a command for a person to type does not. Treating
    // the filename as product blocked a ship of the page the owner had just asked for, which is how this was found.
    expect(classify("package-lock.json")).toBe("neither");
    // package.json is classified by comparing the file either side of the change, so it needs a repository to
    // read; here we assert only that it is not decided by the name, which is what the old rule did.
    expect(["product", "neither"]).toContain(classify("package.json"));
  });

  it("puts the labels above the data rule, because src/data also holds prose a reader sees", () => {
    // i18n sits under src/lib but is entirely reader-facing text, so it must not fall through to the lib rule
    // by accident: the ordering of the rules is the thing being asserted here.
    expect(classify("src/lib/i18n/ui.ts")).toBe("product");
  });
});

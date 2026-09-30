import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * The unattended gates and the ship chain must run the same tests the same way.
 *
 * On 30 September 2026 they did not, and it cost the site a month of data freshness without anyone noticing.
 * `scripts/ship.sh` runs `npx vitest run --testTimeout=600000`; `.github/actions/gates` ran a bare
 * `npx vitest run`. The first render in `src/app/heavy-pages.test.ts` builds the graph and imports 1,400
 * modules before it can render anything: 27 seconds on this machine, 107 on a GitHub runner, against the
 * 30-second default. So every weekly refresh failed its gates, skipped its merge and left a pull request
 * open. Seven were waiting when the owner asked why the data refreshes were not merging on their own.
 *
 * The lesson is the one the page budgets taught: when a measure is wrong, fix what it counts. The limit was
 * measuring the runner, not the page. This test keeps the two commands in step so the next divergence fails
 * here instead of quietly stopping the pipeline.
 */
describe("the unattended gates match the ship chain", () => {
  const gates = readFileSync(".github/actions/gates/action.yml", "utf8");
  const ship = readFileSync("scripts/ship.sh", "utf8");
  const timeoutOf = (s: string) => /npx vitest run[^\n"]*--testTimeout=(\d+)/.exec(s)?.[1];

  it("both run vitest with the same test timeout", () => {
    expect(timeoutOf(ship)).toBeDefined();
    expect(timeoutOf(gates)).toBe(timeoutOf(ship));
  });

  it("no gate runs a bare `npx vitest run`, which uses the 30 second default", () => {
    for (const [name, body] of [["gates action", gates], ["ship.sh", ship]] as const) {
      const bare = body.split("\n").filter((l) => /npx vitest run(\s|$|")/.test(l) && !l.includes("--testTimeout") && !l.trimStart().startsWith("#") && !l.trimStart().startsWith("*"));
      expect(bare, `${name} runs vitest without a timeout`).toEqual([]);
    }
  });

  it("no workflow runs a bare `npx vitest run` either", () => {
    const dir = ".github/workflows";
    const bare: string[] = [];
    for (const f of readdirSync(dir)) {
      const w = readFileSync(`${dir}/${f}`, "utf8");
      for (const line of w.split("\n")) {
        if (!/npx vitest run(\s|$)/.test(line) || line.includes("--testTimeout") || line.trimStart().startsWith("#")) continue;
        bare.push(`${f}: ${line.trim()}`);
      }
    }
    expect(bare).toEqual([]);
  });
});

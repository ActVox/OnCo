/**
 * Rebuilds public/product-queue.json from the open pull requests, which are the real queue.
 *
 * The first version wrote the queue on the branch being proposed, so `main` only ever saw its own entries and
 * /admin/ listed one change when five were waiting. GitHub already records what is open and who merged it, so the
 * file is a rendering of that rather than a second copy of it.
 *
 *   npm run queue:sync
 */
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

type Pr = { number: number; title: string; headRefName: string; createdAt: string; changedFiles: number };

const prs: Pr[] = JSON.parse(execSync("gh pr list --state open --json number,title,headRefName,createdAt,changedFiles", { encoding: "utf8" }));
const rows = prs
  .filter((p) => p.headRefName.startsWith("product/"))
  .sort((a, b) => a.number - b.number)
  .map((p) => ({
    branch: p.headRefName,
    why: p.title.replace(/^Product change: /, ""),
    pr: `https://github.com/judegomila/OnCo/pull/${p.number}`,
    preview: "",
    files: p.changedFiles ?? 0,
    proposed: p.createdAt.slice(0, 10),
    state: "waiting" as const,
  }));

writeFileSync(join(process.cwd(), "public", "product-queue.json"), JSON.stringify(rows, null, 2) + "\n");
console.log(`product queue: ${rows.length} waiting`);

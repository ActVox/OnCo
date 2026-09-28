/**
 * Records one pending product change in public/product-queue.json, which /admin/ renders.
 *
 * The file is public, like everything else in the export, and holds nothing that is not already public: a branch
 * name, a sentence, a pull request and a preview URL. The owner's identity is not in it and is not checked by it,
 * because a static page cannot check anything. See docs/PRODUCT-APPROVAL.md.
 *
 *   npx tsx scripts/queue-product-change.ts <branch> <why> <prUrl> <previewUrl> <fileCount>
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type QueuedChange = {
  branch: string; why: string; pr: string; preview: string; files: number; proposed: string; state: "waiting";
};

const file = join(process.cwd(), "public", "product-queue.json");
const [branch, why, pr, preview, files] = process.argv.slice(2);
if (!branch || !why) { console.error("usage: queue-product-change.ts <branch> <why> <pr> <preview> <files>"); process.exit(1); }

const queue: QueuedChange[] = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : [];
queue.unshift({ branch, why, pr: pr ?? "", preview: preview ?? "", files: Number(files ?? 0), proposed: new Date().toISOString().slice(0, 10), state: "waiting" });
writeFileSync(file, JSON.stringify(queue, null, 2) + "\n");
console.log(`queued: ${queue.length} change(s) waiting`);

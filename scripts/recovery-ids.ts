/** Checks that every id referenced by src/data/recovery-matrix.ts resolves in the graph. */
import { graph } from "../src/lib/graph";
import { RECOVERY_CELLS, RECOVERY_EFFECTS, RECOVERY_TREATMENTS } from "../src/data/recovery-matrix";

const g = graph();
const bad: string[] = [];
const check = (id: string, where: string) => { const e = g.get(id); if (!e) bad.push(`${where}: ${id}`); };
for (const t of RECOVERY_TREATMENTS) { for (const d of t.drugIds) check(d, `${t.id}.drugIds`); for (const r of t.relatedIds) check(r, `${t.id}.relatedIds`); }
for (const e of RECOVERY_EFFECTS) for (const id of e.entityIds) check(id, `${e.id}.entityIds`);
for (const c of RECOVERY_CELLS) for (const id of c.drugIds ?? []) check(id, `${c.treatment}/${c.effect}.drugIds`);
console.log(bad.length ? bad.join("\n") : "all ids resolve");

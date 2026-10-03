/** Prints the measured fill of the recovery matrix (src/data/recovery-matrix.ts). Used when writing the page. */
import { recoveryFill, recoveryDrugIds, RECOVERY_CELLS, RECOVERY_EFFECTS, RECOVERY_TREATMENTS } from "../src/data/recovery-matrix";

const f = recoveryFill();
console.log(f);
console.log("drugs supplemented:", recoveryDrugIds().length);
const empty = RECOVERY_TREATMENTS.filter((t) => !RECOVERY_CELLS.some((c) => c.treatment === t.id)).map((t) => t.id);
console.log("rows with no answer:", empty);
const byEffect = RECOVERY_EFFECTS.map((e) => [e.id, RECOVERY_CELLS.filter((c) => c.effect === e.id).length] as const).sort((a, b) => a[1] - b[1]);
console.log("answers per effect:", byEffect);

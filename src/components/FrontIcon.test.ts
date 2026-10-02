import { describe, expect, it } from "vitest";
import { graph } from "@/lib/graph";
import { FRONT_ICON_IDS } from "./FrontIcon";

/**
 * Every front needs its own icon. Without one a new section renders the hexagon fallback on the /fronts/ grid and
 * in its page header, which reads as a missing record rather than a new one; the schematic has the same rule in
 * src/data/front-animations.test.ts.
 */
describe("front icons", () => {
  it("gives every front its own icon, and holds no icon for a front that does not exist", () => {
    const ids = graph().kind("section").map((s) => s.id).sort();
    expect([...FRONT_ICON_IDS].sort()).toEqual(ids);
  });
});

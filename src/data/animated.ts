/**
 * Animated process schematics: looping wireframe sequences (ADC internalisation, CAR-T killing, …)
 * built from named parts so each phase can move, scale, show, or hide them while the scene rotates.
 * Each builder returns a Mesh with `animate` set; the static viewer ignores it, Wireframe3D plays it.
 */
import { add, antibody, antibodyTips, cylinder, dots, empty, helix, icosahedron, lerp, lerp3, line, movePart, octahedron, part, phase, polyline, ring, setAlpha, sphere, type Mesh, type Part, type Vec3 } from "@/lib/wireframe";
import { WAVE3 } from "./animated-wave3";
import { WAVE4 } from "./animated-wave4";
import { WAVE5 } from "./animated-wave5";
import { WAVE6 } from "./animated-wave6";
import { WAVE7 } from "./animated-wave7";
import { WAVE8 } from "./animated-wave8";
import { REJUV_REHAB_SCENES } from "./animated-rejuv-rehab";

const TAU = Math.PI * 2;
const cell = (r: number, cls?: string) => sphere(r, 5, 10, cls);

export type Scene = { mesh: Mesh; parts: Record<string, Part> };
export function scene(): Scene { return { mesh: empty(), parts: {} }; }
export function put(sc: Scene, name: string, m: Mesh, opts: Parameters<typeof add>[2] = {}): Part { const p = part(sc.mesh, m, opts); sc.parts[name] = p; return p; }
/** Fresh frame buffers: copy of base points and all-ones alpha. */
export function buffers(sc: Scene): { pts: Vec3[]; alpha: number[] } { return { pts: sc.mesh.points.map((p) => [p[0], p[1], p[2]] as Vec3), alpha: sc.mesh.segments.map(() => 1) }; }
export const pulse = (t: number, f = 6) => 0.55 + 0.45 * Math.sin(t * TAU * f);
/** Small receptor stub with a head, pointing along +x from `base`. */
export function receptor(base: Vec3, len = 0.28, cls?: string): Mesh { const m = empty(); add(m, line(base, [base[0] + len, base[1], base[2]], cls)); add(m, sphere(0.06, 2, 6, cls), { at: [base[0] + len, base[1], base[2]] }); return m; }
/** ADC-like antibody with payload octahedra on the Fc region; returns the parts needed for animation. */
function adcParts(sc: Scene, prefix: string, at: Vec3, scale: number, sites: number, arms: [boolean, boolean] = [true, true], payloadCls = "accent"): Part[] {
  put(sc, `${prefix}.ab`, antibody(scale, undefined, 0.6, arms[0], arms[1]), { at });
  const pays: Part[] = [];
  for (let i = 0; i < sites; i++) {
    const y = -0.9 * scale + (0.7 * scale * i) / Math.max(1, sites - 1);
    const p: Vec3 = [at[0] + (i % 2 ? 0.3 : -0.3) * scale, at[1] + y, at[2] + (i % 4 < 2 ? 0.12 : -0.12) * scale];
    const m = empty(); add(m, line([at[0] + (i % 2 ? 0.12 : -0.12) * scale, at[1] + y, at[2]], p, "soft")); add(m, octahedron(0.07 * scale, payloadCls), { at: p });
    pays.push(put(sc, `${prefix}.pay${i}`, m));
  }
  return pays;
}

// =====================================================================================
// ADC: circulate → bind → internalise → lysosome → payload release → DNA damage → bystander
// =====================================================================================
export function adcAnimated(opts: { bispecific?: boolean; payloadLabel?: string; antigenLabel?: string } = {}): Mesh {
  const sc = scene();
  const CELL: Vec3 = [1.3, 0, 0], NUC: Vec3 = [1.55, 0.05, 0], NEIGH: Vec3 = [1.9, -1.55, 0.7];
  put(sc, "cell", cell(1.0), { at: CELL });
  put(sc, "nucleus", sphere(0.36, 4, 8, "soft"), { at: NUC });
  put(sc, "neigh", cell(0.7, "soft"), { at: NEIGH });
  put(sc, "neighNuc", sphere(0.22, 3, 8, "soft"), { at: NEIGH });
  // receptors on the facing surface
  const R1: Vec3 = [0.33, 0.15, 0.1], R2: Vec3 = [0.36, -0.2, -0.12];
  put(sc, "rec1", receptor(R1, 0.26));
  if (opts.bispecific) put(sc, "rec2", receptor(R2, 0.26, "hot"));
  // vesicle (hidden until endocytosis) and lysosome
  put(sc, "vesicle", ring(0.36, 14, "soft"), { at: [0.95, 0.05, 0], rotX: 0.5 });
  put(sc, "lyso", ring(0.28, 12, "hot"), { at: [1.05, 0.0, 0], rotX: 1.0 });
  // ADC starts far left
  const START: Vec3 = [-2.1, 0.4, 0.1];
  const pays = adcParts(sc, "adc", START, 0.55, 6, [true, opts.bispecific ? true : true]);
  if (opts.bispecific) { const [, r] = antibodyTips(0.55); put(sc, "adc.arm2", sphere(0.09, 2, 6, "hot"), { at: [START[0] + r[0], START[1] + r[1], START[2]] }); }
  // DNA damage marks in nucleus (hidden until late)
  put(sc, "dna", dots([[1.45, 0.15, 0.1], [1.65, -0.05, -0.1], [1.55, 0.2, -0.15], [1.7, 0.1, 0.12]], "hot"));
  const labels = { cell: { at: [1.3, 1.05, 0] as Vec3, text: "Tumour cell" }, neigh: { at: NEIGH, text: "Antigen-negative neighbour" }, rec: { at: [0.62, 0.15, 0.1] as Vec3, text: opts.antigenLabel ?? "Antigen (e.g. TROP2, HER2)" } };
  const base = sc.mesh.points;
  const P = sc.parts;
  const DOCK: Vec3 = [-0.55, 0.2, 0.1]; // ADC centre when arms touch the receptor
  const INSIDE: Vec3 = [0.95, 0.05, 0];
  sc.mesh.labels = [labels.cell, labels.rec];
  sc.mesh.animate = {
    duration: 14,
    frame: (t) => {
      const { pts, alpha } = buffers(sc);
      let caption = "";
      const abParts = [P["adc.ab"], ...pays, ...(P["adc.arm2"] ? [P["adc.arm2"]] : [])];
      const moveAb = (dx: Vec3, scale = 1, spin = 0) => { for (const p of abParts) movePart(pts, base, p, dx, 1, 0); if (scale !== 1 || spin) { /* group scale about the antibody centre */ const c = centroid(pts, P["adc.ab"]); for (const p of abParts) for (let i = p.p0; i < p.p1; i++) { const q = pts[i]; const x = (q[0] - c[0]) * scale, y = (q[1] - c[1]) * scale, z = (q[2] - c[2]) * scale; const cs = Math.cos(spin), sn = Math.sin(spin); pts[i] = [c[0] + x * cs + z * sn, c[1] + y, c[2] - x * sn + z * cs]; } } };
      setAlpha(alpha, P["vesicle"], 0); setAlpha(alpha, P["lyso"], 0); setAlpha(alpha, P["dna"], 0);
      if (t < 0.22) {
        const u = phase(t, 0, 0.22);
        const d = lerp3(START, DOCK, u);
        moveAb([d[0] - START[0], d[1] - START[1], d[2] - START[2]], 1, u * 0.6);
        caption = "1 · ADC circulates and finds the antigen";
      } else if (t < 0.32) {
        moveAb([DOCK[0] - START[0], DOCK[1] - START[1], DOCK[2] - START[2]], 1, 0.6);
        setAlpha(alpha, P["rec1"], pulse(t)); if (P["rec2"]) setAlpha(alpha, P["rec2"], pulse(t));
        caption = opts.bispecific ? "2 · Two arms bind two antigens: stronger grip, faster uptake" : "2 · Binds the antigen on the cell surface";
      } else if (t < 0.52) {
        const u = phase(t, 0.32, 0.52);
        const d = lerp3(DOCK, INSIDE, u);
        moveAb([d[0] - START[0], d[1] - START[1], d[2] - START[2]], lerp(1, 0.55, u), 0.6 + u);
        movePart(pts, base, P["rec1"], [lerp(0, INSIDE[0] - 0.46, u), lerp(0, INSIDE[1] - 0.15, u), 0], 1); setAlpha(alpha, P["rec1"], 1 - u * 0.7);
        if (P["rec2"]) { movePart(pts, base, P["rec2"], [lerp(0, INSIDE[0] - 0.5, u), lerp(0, INSIDE[1] + 0.2, u), 0], 1); setAlpha(alpha, P["rec2"], 1 - u * 0.7); }
        setAlpha(alpha, P["vesicle"], u);
        caption = "3 · Receptor and ADC are pulled inside (endocytosis)";
      } else if (t < 0.62) {
        moveAb([INSIDE[0] - START[0], INSIDE[1] - START[1], INSIDE[2] - START[2]], 0.55, 1.6);
        setAlpha(alpha, P["rec1"], 0.3); if (P["rec2"]) setAlpha(alpha, P["rec2"], 0.3);
        setAlpha(alpha, P["vesicle"], 1 - phase(t, 0.52, 0.62)); setAlpha(alpha, P["lyso"], pulse(t, 4));
        caption = "4 · Vesicle becomes a lysosome; enzymes cleave the linker";
      } else if (t < 0.8) {
        const u = phase(t, 0.62, 0.8);
        // antibody fades, payloads fly out toward the nucleus and around
        movePart(pts, base, P["adc.ab"], [INSIDE[0] - START[0], INSIDE[1] - START[1], INSIDE[2] - START[2]], 0.55, 1.6); setAlpha(alpha, P["adc.ab"], 0.5 - 0.45 * u);
        if (P["adc.arm2"]) { movePart(pts, base, P["adc.arm2"], [INSIDE[0] - START[0], INSIDE[1] - START[1], INSIDE[2] - START[2]], 0.55); setAlpha(alpha, P["adc.arm2"], 0.5 - 0.45 * u); }
        setAlpha(alpha, P["rec1"], 0.2); if (P["rec2"]) setAlpha(alpha, P["rec2"], 0.2); setAlpha(alpha, P["lyso"], 1 - u);
        pays.forEach((p, i) => {
          const dir: Vec3 = [Math.cos((TAU * i) / pays.length), Math.sin((TAU * i) / pays.length) * 0.6, (i % 2 ? 0.4 : -0.4)];
          const target: Vec3 = i < 4 ? [NUC[0] + dir[0] * 0.25, NUC[1] + dir[1] * 0.25, NUC[2] + dir[2] * 0.25] : [INSIDE[0] + dir[0] * 0.9, INSIDE[1] + dir[1] * 0.9, dir[2] * 0.9];
          const from: Vec3 = INSIDE;
          const d = lerp3(from, target, u);
          movePart(pts, base, p, [d[0] - START[0], d[1] - START[1], d[2] - START[2]], lerp(0.55, 1.1, u), u * 3);
          // hide the short linker line (first segment) once released
          alpha[p.s0] = 1 - u;
        });
        caption = "5 · Payload released; membrane-permeable payload reaches the nucleus";
      } else if (t < 0.9) {
        const u = phase(t, 0.8, 0.9);
        setAlpha(alpha, P["adc.ab"], 0.05); if (P["adc.arm2"]) setAlpha(alpha, P["adc.arm2"], 0.05); setAlpha(alpha, P["rec1"], 0.15); if (P["rec2"]) setAlpha(alpha, P["rec2"], 0.15);
        pays.forEach((p, i) => { const dir: Vec3 = [Math.cos((TAU * i) / pays.length), Math.sin((TAU * i) / pays.length) * 0.6, (i % 2 ? 0.4 : -0.4)]; const target: Vec3 = i < 4 ? [NUC[0] + dir[0] * 0.25, NUC[1] + dir[1] * 0.25, NUC[2] + dir[2] * 0.25] : [INSIDE[0] + dir[0] * 0.9, INSIDE[1] + dir[1] * 0.9, dir[2] * 0.9]; movePart(pts, base, p, [target[0] - START[0], target[1] - START[1], target[2] - START[2]], 1.1, 3); alpha[p.s0] = 0; });
        setAlpha(alpha, P["dna"], pulse(t, 8)); setAlpha(alpha, P["nucleus"], 0.6 + 0.4 * pulse(t, 8));
        movePart(pts, base, P["cell"], [0, 0, 0], 1 - 0.08 * u);
        caption = "6 · TOP1 inhibition → DNA breaks → the cell dies";
      } else {
        const u = phase(t, 0.9, 1);
        setAlpha(alpha, P["adc.ab"], 0.05); if (P["adc.arm2"]) setAlpha(alpha, P["adc.arm2"], 0.05); setAlpha(alpha, P["rec1"], 0.15); if (P["rec2"]) setAlpha(alpha, P["rec2"], 0.15);
        setAlpha(alpha, P["dna"], 1); movePart(pts, base, P["cell"], [0, 0, 0], 0.92);
        pays.forEach((p, i) => {
          const dir: Vec3 = [Math.cos((TAU * i) / pays.length), Math.sin((TAU * i) / pays.length) * 0.6, (i % 2 ? 0.4 : -0.4)];
          const stay: Vec3 = i < 4 ? [NUC[0] + dir[0] * 0.25, NUC[1] + dir[1] * 0.25, NUC[2] + dir[2] * 0.25] : [INSIDE[0] + dir[0] * 0.9, INSIDE[1] + dir[1] * 0.9, dir[2] * 0.9];
          const target: Vec3 = i >= 4 ? lerp3(stay, [NEIGH[0] + (i % 2 ? 0.1 : -0.15), NEIGH[1] + 0.1, NEIGH[2]], u) : stay;
          movePart(pts, base, p, [target[0] - START[0], target[1] - START[1], target[2] - START[2]], 1.1, 3); alpha[p.s0] = 0;
        });
        setAlpha(alpha, P["neighNuc"], 0.3 + 0.7 * u); movePart(pts, base, P["neigh"], [0, 0, 0], 1 - 0.06 * u);
        caption = "7 · Bystander effect: free payload diffuses into antigen-negative neighbours";
      }
      const labelsNow = [labels.cell, ...(t < 0.52 ? [labels.rec] : []), ...(t >= 0.9 ? [labels.neigh] : []), ...(t >= 0.62 && t < 0.9 ? [{ at: NUC, text: opts.payloadLabel ?? "Payload (e.g. DXd, SN-38)" }] : [])];
      return { points: pts, alpha, caption, labels: labelsNow };
    },
  };
  return sc.mesh;
}

export function centroid(pts: Vec3[], p: Part): Vec3 { let x = 0, y = 0, z = 0; const n = p.p1 - p.p0 || 1; for (let i = p.p0; i < p.p1; i++) { x += pts[i][0]; y += pts[i][1]; z += pts[i][2]; } return [x / n, y / n, z / n]; }

// =====================================================================================
// CAR-T: approach → synapse → granules → target dies → CAR-T expands
// =====================================================================================
export function carTAnimated(kind: "car-t" | "tcr-t" | "car-nk" = "car-t"): Mesh {
  const sc = scene();
  const T0: Vec3 = [-2.4, 0.1, 0], TUM: Vec3 = [1.3, 0, 0], T1: Vec3 = [-0.95, 0, 0];
  const tcell = empty(); add(tcell, cell(0.85, "soft"));
  for (let i = 0; i < 7; i++) { const a = -0.9 + (1.8 * i) / 6; const p: Vec3 = [0.85 * Math.cos(a), 0.85 * Math.sin(a), 0]; add(tcell, line(p, [p[0] * 1.25, p[1] * 1.25, 0], "accent")); }
  put(sc, "t", tcell, { at: T0 });
  put(sc, "tum", cell(0.9, "hot"), { at: TUM });
  put(sc, "tumNuc", sphere(0.3, 3, 8, "soft"), { at: TUM });
  for (let i = 0; i < 4; i++) { const a = Math.PI + (-0.45 + 0.3 * i); put(sc, `ag${i}`, receptor([TUM[0] + 0.9 * Math.cos(a), TUM[1] + 0.9 * Math.sin(a), 0], -0.22)); }
  put(sc, "synapse", polyline([[-0.05, 0.35, 0], [0.4, 0.35, 0], [0.4, -0.35, 0], [-0.05, -0.35, 0]], "hot"));
  put(sc, "granules", dots([[-0.2, 0.15, 0.1], [-0.1, -0.1, -0.1], [-0.25, -0.2, 0.05], [-0.15, 0.25, -0.08]], "accent"));
  put(sc, "clone", tcell, { at: [-2.4, 1.7, -0.6] });
  const base = sc.mesh.points, P = sc.parts;
  const who = kind === "car-nk" ? "CAR-NK / macrophage" : kind === "tcr-t" ? "TCR-T cell" : "CAR-T cell";
  const rec = kind === "tcr-t" ? "TCR sees peptide on HLA" : "CAR binds surface antigen (no HLA needed)";
  sc.mesh.labels = [{ at: TUM, text: "Tumour cell" }];
  sc.mesh.animate = {
    duration: 11,
    frame: (t) => {
      const { pts, alpha } = buffers(sc);
      setAlpha(alpha, P["synapse"], 0); setAlpha(alpha, P["granules"], 0); setAlpha(alpha, P["clone"], 0);
      let caption = "", tLabel: Vec3 = T0;
      if (t < 0.3) { const u = phase(t, 0, 0.3); const d = lerp3(T0, T1, u); movePart(pts, base, P["t"], [d[0] - T0[0], d[1] - T0[1], 0]); tLabel = d; caption = `1 · ${who} patrols and finds its antigen`; }
      else if (t < 0.45) { movePart(pts, base, P["t"], [T1[0] - T0[0], 0, 0]); tLabel = T1; const u = phase(t, 0.3, 0.45); setAlpha(alpha, P["synapse"], u); for (let i = 0; i < 4; i++) setAlpha(alpha, P[`ag${i}`], pulse(t)); caption = `2 · ${rec}; immune synapse forms`; }
      else if (t < 0.68) { movePart(pts, base, P["t"], [T1[0] - T0[0], 0, 0]); tLabel = T1; setAlpha(alpha, P["synapse"], 1); const u = phase(t, 0.45, 0.68); setAlpha(alpha, P["granules"], 1); movePart(pts, base, P["granules"], [lerp(0, 1.2, u), 0, 0], 1 - 0.3 * u); caption = "3 · Perforin and granzymes delivered into the target"; }
      else if (t < 0.88) { movePart(pts, base, P["t"], [T1[0] - T0[0], 0, 0]); tLabel = T1; const u = phase(t, 0.68, 0.88); setAlpha(alpha, P["synapse"], 1 - u); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.55 * u); setAlpha(alpha, P["tum"], 1 - 0.6 * u); movePart(pts, base, P["tumNuc"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["tumNuc"], pulse(t, 6)); for (let i = 0; i < 4; i++) setAlpha(alpha, P[`ag${i}`], 1 - u); caption = "4 · Target cell dies; the CAR-T survives to kill again"; }
      else { movePart(pts, base, P["t"], [T1[0] - T0[0], 0, 0]); tLabel = T1; const u = phase(t, 0.88, 1); movePart(pts, base, P["tum"], [0, 0, 0], 0.45); setAlpha(alpha, P["tum"], 0.35); movePart(pts, base, P["tumNuc"], [0, 0, 0], 0.5); setAlpha(alpha, P["tumNuc"], 0.3); for (let i = 0; i < 4; i++) setAlpha(alpha, P[`ag${i}`], 0); setAlpha(alpha, P["clone"], u); movePart(pts, base, P["clone"], [lerp(1.2, 0, u), lerp(-1.2, 0, u), 0], lerp(0.3, 1, u)); caption = kind === "car-t" ? "5 · Serial killing and expansion in vivo (a living drug)" : "5 · Serial killing; persistence varies by cell type"; }
      return { points: pts, alpha, caption, labels: [{ at: TUM, text: "Tumour cell" }, { at: [tLabel[0], tLabel[1] + 0.95, 0] as Vec3, text: who }] };
    },
  };
  return sc.mesh;
}

// =====================================================================================
// Radioligand therapy: ligand binds → internalises → decay track → crossfire
// =====================================================================================
export function radioligandAnimated(alphaEmitter = false): Mesh {
  const sc = scene();
  const CELL: Vec3 = [0.3, 0, 0], NEIGH: Vec3 = [-1.6, -0.9, 0.5];
  put(sc, "cell", cell(1.0), { at: CELL });
  put(sc, "nuc", sphere(0.35, 3, 8, "soft"), { at: [CELL[0] + 0.1, 0.05, 0] });
  put(sc, "neigh", cell(0.6, "soft"), { at: NEIGH });
  for (let i = 0; i < 6; i++) { const a = (TAU * i) / 6; const p: Vec3 = [CELL[0] + Math.cos(a), 0.15, Math.sin(a)]; put(sc, `rec${i}`, line(p, [p[0] + (p[0] - CELL[0]) * 0.22, p[1] * 1.2, p[2] * 1.22])); }
  const START: Vec3 = [2.6, 0.9, 0.4], DOCK: Vec3 = [CELL[0] + 1.32, 0.2, 0];
  put(sc, "lig", octahedron(0.1, "accent"), { at: START });
  put(sc, "ligTail", line([START[0] - 0.18, START[1], START[2]], START, "accent"));
  const trackPts: Vec3[] = alphaEmitter ? [[DOCK[0], DOCK[1], 0], [0.9, 0.25, 0.05], [0.55, 0.1, 0.02]] : [[DOCK[0], DOCK[1], 0], [0.9, 0.5, 0.3], [0.3, 0.2, 0.5], [-0.3, 0.6, 0.1], [-0.9, 0.3, -0.2], [-1.6, -0.5, 0.2]];
  const track = put(sc, "track", polyline(trackPts, "hot"));
  const track2 = put(sc, "track2", polyline(alphaEmitter ? [[DOCK[0], DOCK[1], 0], [1.2, -0.3, -0.2], [1.0, -0.5, -0.3]] : [[DOCK[0], DOCK[1], 0], [0.6, -0.5, -0.4], [-0.2, -0.9, -0.1], [-1.2, -0.8, 0.4]], "hot"));
  put(sc, "dna", dots(alphaEmitter ? [[0.5, 0.1, 0.1], [0.62, 0.02, -0.05], [0.4, 0.15, 0.05]] : [[0.3, 0.2, 0.4], [-0.3, 0.55, 0.1]], "hot"));
  const base = sc.mesh.points, P = sc.parts;
  const iso = alphaEmitter ? "Ac-225 / Pb-212 (α)" : "Lu-177 (β⁻)";
  sc.mesh.labels = [{ at: [CELL[0], 1.05, 0], text: "PSMA / SSTR-positive cell" }];
  sc.mesh.animate = {
    duration: 11,
    frame: (t) => {
      const { pts, alpha } = buffers(sc);
      setAlpha(alpha, track, 0); setAlpha(alpha, track2, 0); setAlpha(alpha, P["dna"], 0);
      let caption = "", ligAt: Vec3 = START;
      const moveLig = (d: Vec3) => { movePart(pts, base, P["lig"], [d[0] - START[0], d[1] - START[1], d[2] - START[2]], 1, t * 12); movePart(pts, base, P["ligTail"], [d[0] - START[0], d[1] - START[1], d[2] - START[2]]); };
      const grow = (p: Part, u: number) => { const n = p.s1 - p.s0; for (let k = 0; k < n; k++) alpha[p.s0 + k] = Math.max(0, Math.min(1, u * n - k)); };
      if (t < 0.32) { const u = phase(t, 0, 0.32); ligAt = lerp3(START, DOCK, u); moveLig(ligAt); caption = `1 · Radioligand circulates; the ligand seeks its receptor`; }
      else if (t < 0.45) { moveLig(DOCK); ligAt = DOCK; setAlpha(alpha, P["rec0"], pulse(t)); caption = "2 · Binds the receptor (PSMA, SSTR2, FAP)"; }
      else if (t < 0.58) { const u = phase(t, 0.45, 0.58); ligAt = lerp3(DOCK, [DOCK[0] - 0.4, DOCK[1] - 0.05, 0], u); moveLig(ligAt); movePart(pts, base, P["rec0"], [-0.35 * u, 0, 0]); caption = "3 · Internalised and retained inside the cell"; }
      else if (t < 0.8) { const u = phase(t, 0.58, 0.8); ligAt = [DOCK[0] - 0.4, DOCK[1] - 0.05, 0]; moveLig(ligAt); movePart(pts, base, P["rec0"], [-0.35, 0, 0]); grow(track, u); setAlpha(alpha, P["dna"], u > 0.6 ? pulse(t, 8) : 0); movePart(pts, base, track, [-0.4, -0.05, 0]); caption = alphaEmitter ? "4 · α decay: a few short, very dense tracks (~50-100 µm)" : "4 · β⁻ decay: electrons travel ~2 mm, breaking DNA along the way"; }
      else { const u = phase(t, 0.8, 1); ligAt = [DOCK[0] - 0.4, DOCK[1] - 0.05, 0]; moveLig(ligAt); movePart(pts, base, P["rec0"], [-0.35, 0, 0]); setAlpha(alpha, track, 1); movePart(pts, base, track, [-0.4, -0.05, 0]); grow(track2, u); movePart(pts, base, track2, [-0.4, -0.05, 0]); setAlpha(alpha, P["dna"], 1); if (!alphaEmitter) setAlpha(alpha, P["neigh"], 0.3 + 0.7 * u); caption = alphaEmitter ? "5 · Kills single cells with little crossfire; spares neighbours" : "5 · Crossfire: neighbouring receptor-negative cells are hit too"; }
      return { points: pts, alpha, caption, labels: [{ at: [CELL[0], 1.05, 0] as Vec3, text: "PSMA / SSTR-positive cell" }, { at: ligAt, text: `Ligand + ${iso}` }, ...(t > 0.8 && !alphaEmitter ? [{ at: NEIGH, text: "Neighbour (crossfire)" }] : [])] };
    },
  };
  return sc.mesh;
}

// =====================================================================================
// Checkpoint inhibitor: PD-1–PD-L1 brake → antibody blocks → T cell kills
// =====================================================================================
export function checkpointAnimated(): Mesh {
  const sc = scene();
  const TC: Vec3 = [-1.3, 0, 0], TUM: Vec3 = [1.3, 0, 0];
  put(sc, "t", cell(0.9, "soft"), { at: TC });
  put(sc, "tum", cell(0.9, "hot"), { at: TUM });
  put(sc, "tumNuc", sphere(0.3, 3, 8, "soft"), { at: TUM });
  // TCR–MHC contact (dashed-ish) and PD-1–PD-L1 brake above
  put(sc, "tcr", line([-0.4, -0.25, 0], [0.4, -0.25, 0], "soft"));
  put(sc, "pd1", line([-0.4, 0.3, 0], [-0.05, 0.3, 0]));
  put(sc, "pdl1", line([0.4, 0.3, 0], [0.05, 0.3, 0]));
  put(sc, "brake", line([-0.05, 0.3, 0], [0.05, 0.3, 0], "hot"));
  const START: Vec3 = [-0.4, 2.4, 0.3], DOCK: Vec3 = [-0.25, 0.75, 0];
  put(sc, "ab", antibody(0.45, "accent", 0.9), { at: START, rotZ: Math.PI });
  put(sc, "granules", dots([[-0.55, 0.05, 0.1], [-0.5, -0.15, -0.1], [-0.65, 0.2, 0.05]], "accent"));
  const base = sc.mesh.points, P = sc.parts;
  sc.mesh.animate = {
    duration: 11,
    frame: (t) => {
      const { pts, alpha } = buffers(sc);
      setAlpha(alpha, P["granules"], 0);
      let caption = "";
      const abAt = (d: Vec3) => movePart(pts, base, P["ab"], [d[0] - START[0], d[1] - START[1], d[2] - START[2]]);
      if (t < 0.2) { abAt([START[0], START[1] + 2, START[2]]); setAlpha(alpha, P["ab"], 0); setAlpha(alpha, P["brake"], pulse(t)); caption = "1 · T cell sees the tumour, but PD-L1 → PD-1 applies the brake"; }
      else if (t < 0.45) { const u = phase(t, 0.2, 0.45); abAt(lerp3(START, DOCK, u)); caption = "2 · Anti-PD-1 / anti-PD-L1 antibody arrives"; }
      else if (t < 0.6) { abAt(DOCK); const u = phase(t, 0.45, 0.6); setAlpha(alpha, P["brake"], 1 - u); movePart(pts, base, P["pdl1"], [0.12 * u, 0, 0]); caption = "3 · The PD-1/PD-L1 handshake is blocked: brake released"; }
      else if (t < 0.82) { abAt(DOCK); setAlpha(alpha, P["brake"], 0); movePart(pts, base, P["pdl1"], [0.12, 0, 0]); const u = phase(t, 0.6, 0.82); setAlpha(alpha, P["granules"], 1); movePart(pts, base, P["granules"], [lerp(0, 1.6, u), lerp(0, -0.05, u), 0], 1 - 0.3 * u); setAlpha(alpha, P["tcr"], pulse(t, 5)); caption = "4 · T cell activates through its TCR and kills"; }
      else { abAt(DOCK); setAlpha(alpha, P["brake"], 0); movePart(pts, base, P["pdl1"], [0.12, 0, 0]); const u = phase(t, 0.82, 1); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["tum"], 1 - 0.6 * u); movePart(pts, base, P["tumNuc"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["tumNuc"], pulse(t, 6)); caption = "5 · Durable responses come from many T cells doing this for years"; }
      return { points: pts, alpha, caption, labels: [{ at: [TC[0], 0.95, 0] as Vec3, text: "T cell (PD-1)" }, { at: [TUM[0], 0.95, 0] as Vec3, text: "Tumour cell (PD-L1)" }, ...(t >= 0.2 ? [{ at: DOCK, text: "Checkpoint antibody" }] : [])] };
    },
  };
  return sc.mesh;
}

// =====================================================================================
// T-cell engager: bispecific bridges CD3 and tumour antigen
// =====================================================================================
export function engagerAnimated(): Mesh {
  const sc = scene();
  const TC: Vec3 = [-1.3, 0, 0], TUM: Vec3 = [1.3, 0, 0];
  put(sc, "t", cell(0.9, "soft"), { at: TC });
  put(sc, "tum", cell(0.9, "hot"), { at: TUM });
  put(sc, "tumNuc", sphere(0.3, 3, 8, "soft"), { at: TUM });
  put(sc, "cd3", receptor([TC[0] + 0.9, 0.1, 0], 0.2));
  put(sc, "ag", receptor([TUM[0] - 0.9, 0.1, 0], -0.2, "hot"));
  const START: Vec3 = [0, 2.5, 0.2], DOCK: Vec3 = [0, 0.05, 0];
  put(sc, "bite", antibody(0.4, "accent", 1.3), { at: START, rotZ: Math.PI / 2 });
  put(sc, "granules", dots([[-0.55, 0.05, 0.1], [-0.5, -0.15, -0.1], [-0.65, 0.2, 0.05]], "accent"));
  const base = sc.mesh.points, P = sc.parts;
  sc.mesh.animate = {
    duration: 11,
    frame: (t) => {
      const { pts, alpha } = buffers(sc);
      setAlpha(alpha, P["granules"], 0);
      let caption = "";
      const at = (d: Vec3) => movePart(pts, base, P["bite"], [d[0] - START[0], d[1] - START[1], d[2] - START[2]]);
      if (t < 0.3) { const u = phase(t, 0, 0.3); at(lerp3(START, [DOCK[0] + 0.5, DOCK[1], 0], u)); caption = "1 · Engager finds the tumour antigen (DLL3, BCMA, CD20, PSMA…)"; }
      else if (t < 0.45) { const u = phase(t, 0.3, 0.45); at(lerp3([DOCK[0] + 0.5, DOCK[1], 0], DOCK, u)); movePart(pts, base, P["t"], [0.35 * u, 0, 0]); movePart(pts, base, P["cd3"], [0.35 * u, 0, 0]); setAlpha(alpha, P["cd3"], pulse(t)); caption = "2 · Second arm grabs CD3: any T cell is recruited, no HLA needed"; }
      else if (t < 0.7) { at(DOCK); movePart(pts, base, P["t"], [0.35, 0, 0]); movePart(pts, base, P["cd3"], [0.35, 0, 0]); const u = phase(t, 0.45, 0.7); setAlpha(alpha, P["granules"], 1); movePart(pts, base, P["granules"], [lerp(0.35, 1.7, u), 0, 0], 1 - 0.3 * u); caption = "3 · Forced immune synapse; cytokines released (CRS risk)"; }
      else { at(DOCK); movePart(pts, base, P["t"], [0.35, 0, 0]); movePart(pts, base, P["cd3"], [0.35, 0, 0]); const u = phase(t, 0.7, 1); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["tum"], 1 - 0.6 * u); setAlpha(alpha, P["tumNuc"], pulse(t, 6)); movePart(pts, base, P["tumNuc"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["ag"], 1 - u); caption = "4 · Target killed; the engager is redosed as a drug, not a cell"; }
      return { points: pts, alpha, caption, labels: [{ at: [TC[0] + (t > 0.3 ? 0.35 : 0), 0.95, 0] as Vec3, text: "T cell (CD3)" }, { at: [TUM[0], 0.95, 0] as Vec3, text: "Tumour cell" }, { at: DOCK, text: "Bispecific engager" }] };
    },
  };
  return sc.mesh;
}

// =====================================================================================
// mRNA vaccine: LNP uptake → mRNA → translation → presentation → T-cell priming
// =====================================================================================
export type VaccineKind = "mrna" | "peptide" | "cell";
/** Vaccine sequence; `kind` switches the captions for mRNA (default), peptide / protein / virus-like-particle, or cell-based (dendritic) vaccines. */
export function mrnaVaccineAnimated(kind: VaccineKind = "mrna"): Mesh {
  const sc = scene();
  const C = kind === "mrna"
    ? ["1 · Lipid nanoparticle carrying patient-specific mRNA is injected", "2 · Taken up by a dendritic cell (endocytosis)", "3 · Endosomal escape releases the mRNA (up to 34 neoantigens encoded)", "4 · Ribosomes translate the mRNA into neoantigen peptides", "5 · Peptides are presented on MHC at the cell surface", "6 · T cells that recognise the neoantigens are primed and expand"]
    : kind === "peptide"
      ? ["1 · Antigen (peptide, protein or virus-like particle) is injected with an adjuvant", "2 · Taken up by a dendritic cell (endocytosis)", "3 · The antigen is broken into short peptides inside the cell", "4 · Peptides are loaded onto MHC molecules", "5 · Peptides are presented on MHC at the cell surface", "6 · T cells (and B cells) that recognise the antigen are primed and expand"]
      : ["1 · The patient's own antigen-presenting cells are collected and loaded with tumour antigen in the lab", "2 · The loaded cells are infused back", "3 · Antigen is processed inside the cell", "4 · Peptides are loaded onto MHC molecules", "5 · Peptides are presented on MHC at the cell surface", "6 · T cells that recognise the antigen are primed and expand"];
  const DC: Vec3 = [0.4, 0, 0];
  put(sc, "dc", cell(1.1, "soft"), { at: DC });
  put(sc, "dcNuc", sphere(0.35, 3, 8, "soft"), { at: [DC[0] + 0.2, 0.1, 0] });
  const START: Vec3 = [-2.4, 0.6, 0.2], IN: Vec3 = [-0.2, 0.15, 0.1];
  put(sc, "lnp", sphere(0.32, 4, 8, "accent"), { at: START });
  put(sc, "mrna", helix(0.12, 0.7, 2.5, 20, "hot"), { at: IN, rotZ: 1.2 });
  put(sc, "ribo", dots([[IN[0] - 0.2, IN[1] + 0.1, 0.1], [IN[0], IN[1] + 0.15, -0.05], [IN[0] + 0.2, IN[1], 0.08]], "soft"));
  const peps: Part[] = [];
  for (let i = 0; i < 4; i++) peps.push(put(sc, `pep${i}`, octahedron(0.06, "hot"), { at: [IN[0] + 0.1 * i, IN[1] + 0.05, 0] }));
  const MHC: Vec3[] = [[DC[0] + 1.1, 0.3, 0], [DC[0] + 1.05, -0.2, 0.3], [DC[0] + 1.0, 0.1, -0.45], [DC[0] + 1.08, 0.5, 0.2]];
  MHC.forEach((p, i) => put(sc, `mhc${i}`, receptor(p, 0.2)));
  const TC0: Vec3 = [3.2, 0.2, 0], TC1: Vec3 = [2.3, 0.25, 0];
  put(sc, "t", cell(0.65, "soft"), { at: TC0 });
  const base = sc.mesh.points, P = sc.parts;
  sc.mesh.animate = {
    duration: 13,
    frame: (t) => {
      const { pts, alpha } = buffers(sc);
      setAlpha(alpha, P["mrna"], 0); setAlpha(alpha, P["ribo"], 0); peps.forEach((p) => setAlpha(alpha, p, 0)); setAlpha(alpha, P["t"], 0);
      let caption = "";
      const lnpAt = (d: Vec3, s = 1) => movePart(pts, base, P["lnp"], [d[0] - START[0], d[1] - START[1], d[2] - START[2]], s);
      if (t < 0.25) { const u = phase(t, 0, 0.25); lnpAt(lerp3(START, [DC[0] - 1.05, 0.2, 0.1], u)); caption = C[0]; }
      else if (t < 0.4) { const u = phase(t, 0.25, 0.4); lnpAt(lerp3([DC[0] - 1.05, 0.2, 0.1], IN, u), 1 - 0.3 * u); caption = C[1]; }
      else if (t < 0.52) { const u = phase(t, 0.4, 0.52); lnpAt(IN, 0.7 + 0.5 * u); setAlpha(alpha, P["lnp"], 1 - u); setAlpha(alpha, P["mrna"], u); caption = C[2]; }
      else if (t < 0.68) { setAlpha(alpha, P["lnp"], 0); setAlpha(alpha, P["mrna"], 1); const u = phase(t, 0.52, 0.68); setAlpha(alpha, P["ribo"], 1); movePart(pts, base, P["ribo"], [0.35 * Math.sin(u * TAU) * 0.5 + 0.2 * u, 0, 0]); peps.forEach((p, i) => { setAlpha(alpha, p, Math.max(0, Math.min(1, u * 4 - i))); }); caption = C[3]; }
      else if (t < 0.85) { setAlpha(alpha, P["lnp"], 0); setAlpha(alpha, P["mrna"], 0.4); const u = phase(t, 0.68, 0.85); peps.forEach((p, i) => { setAlpha(alpha, p, 1); const from: Vec3 = [IN[0] + 0.1 * i, IN[1] + 0.05, 0]; const to: Vec3 = [MHC[i][0] + 0.2, MHC[i][1], MHC[i][2]]; const d = lerp3(from, to, u); movePart(pts, base, p, [d[0] - from[0], d[1] - from[1], d[2] - from[2]]); }); MHC.forEach((_, i) => setAlpha(alpha, P[`mhc${i}`], 0.6 + 0.4 * u)); caption = C[4]; }
      else { setAlpha(alpha, P["lnp"], 0); setAlpha(alpha, P["mrna"], 0.3); peps.forEach((p, i) => { setAlpha(alpha, p, 1); const from: Vec3 = [IN[0] + 0.1 * i, IN[1] + 0.05, 0]; const to: Vec3 = [MHC[i][0] + 0.2, MHC[i][1], MHC[i][2]]; movePart(pts, base, p, [to[0] - from[0], to[1] - from[1], to[2] - from[2]]); }); const u = phase(t, 0.85, 1); setAlpha(alpha, P["t"], 1); const d = lerp3(TC0, TC1, u); movePart(pts, base, P["t"], [d[0] - TC0[0], d[1] - TC0[1], 0]); MHC.forEach((_, i) => setAlpha(alpha, P[`mhc${i}`], pulse(t, 5))); caption = C[5]; }
      return { points: pts, alpha, caption, labels: [{ at: [DC[0], 1.15, 0] as Vec3, text: "Dendritic cell" }, ...(t >= 0.85 ? [{ at: [TC1[0], TC1[1] + 0.7, 0] as Vec3, text: "T cell primed" }] : [])] };
    },
  };
  return sc.mesh;
}

// =====================================================================================
// Antibody (monoclonal or bispecific): bind → block the signal → Fc tail flags the cell (ADCC)
// =====================================================================================
export function antibodyAnimated(mode: "mono" | "dual" = "mono"): Mesh {
  const sc = scene();
  const CELL: Vec3 = [1.2, 0, 0], NUC: Vec3 = [1.45, 0.05, 0];
  put(sc, "cell", cell(1.0), { at: CELL });
  put(sc, "nucleus", sphere(0.34, 4, 8, "soft"), { at: NUC });
  const R1: Vec3 = [0.25, 0.28, 0.1], R2: Vec3 = [0.27, -0.3, -0.1];
  put(sc, "rec1", receptor(R1, 0.26, "hot"));
  put(sc, "rec2", receptor(R2, 0.26, mode === "dual" ? "hot" : undefined));
  put(sc, "ligand", octahedron(0.09, "accent"), { at: [-0.35, 0.95, 0.2] });
  put(sc, "sig1", polyline([[0.5, 0.28, 0.1], [0.85, 0.2, 0.05], [1.15, 0.1, 0]], "accent"));
  put(sc, "sig2", polyline([[0.52, -0.3, -0.1], [0.85, -0.15, -0.05], [1.15, 0.0, 0]], "accent"));
  const START: Vec3 = [-2.3, 0.2, 0.1], DOCK: Vec3 = [-0.6, 0.0, 0.0];
  put(sc, "ab", antibody(0.55, undefined, mode === "dual" ? 0.95 : 0.6), { at: START, rotZ: -Math.PI / 2 });
  const NK0: Vec3 = [-2.6, -2.0, 0.3], NK1: Vec3 = [-1.55, -0.55, 0.1];
  put(sc, "nk", cell(0.6, "soft"), { at: NK0 });
  put(sc, "gran", dots([[-1.3, -0.4, 0.1], [-1.1, -0.25, 0.0], [-0.9, -0.1, 0.05]], "accent"));
  const base = sc.mesh.points, P = sc.parts;
  const who = mode === "dual" ? "Bispecific antibody" : "Antibody";
  return frameLoop(sc, 12, (t, pts, alpha) => {
    setAlpha(alpha, P["nk"], 0); setAlpha(alpha, P["gran"], 0);
    const abAt = (d: Vec3) => movePart(pts, base, P["ab"], [d[0] - START[0], d[1] - START[1], d[2] - START[2]]);
    let caption = "";
    if (t < 0.28) { const u = phase(t, 0, 0.28); abAt(lerp3(START, DOCK, u)); movePart(pts, base, P["ligand"], [0, -0.3 * u, 0]); caption = `1 · ${who} circulates and finds its target on the cell surface`; }
    else if (t < 0.45) { abAt(DOCK); setAlpha(alpha, P["rec1"], pulse(t)); if (mode === "dual") setAlpha(alpha, P["rec2"], pulse(t)); movePart(pts, base, P["ligand"], [0, -0.3, 0]); caption = mode === "dual" ? "2 · Two arms, two targets: both receptors are gripped at once" : "2 · Binds the receptor: the growth signal (ligand) can no longer dock"; }
    else if (t < 0.7) { abAt(DOCK); movePart(pts, base, P["ligand"], [0, -0.3 + 0.6 * phase(t, 0.45, 0.6), 0]); const u = phase(t, 0.45, 0.7); setAlpha(alpha, P["sig1"], 1 - u); if (mode === "dual") setAlpha(alpha, P["sig2"], 1 - u); else setAlpha(alpha, P["sig2"], 0.6); caption = mode === "dual" ? "3 · Both signals into the nucleus fall silent: the usual escape (switching receptor) is closed" : "3 · Signalling into the nucleus stops; the cell stalls"; }
    else { abAt(DOCK); movePart(pts, base, P["ligand"], [0, 0.3, 0]); setAlpha(alpha, P["sig1"], 0); setAlpha(alpha, P["sig2"], mode === "dual" ? 0 : 0.6); const u = phase(t, 0.7, 0.9); setAlpha(alpha, P["nk"], u); const d = lerp3(NK0, NK1, u); movePart(pts, base, P["nk"], [d[0] - NK0[0], d[1] - NK0[1], d[2] - NK0[2]]); if (t > 0.88) { setAlpha(alpha, P["gran"], 1); movePart(pts, base, P["gran"], [lerp(0, 1.2, phase(t, 0.88, 1)), 0.2, 0]); } caption = "4 · The antibody's Fc tail flags the cell: NK cells and complement attack it (ADCC)"; }
    return { caption, labels: [{ at: [CELL[0], 1.1, 0], text: "Tumour cell" }, { at: [0.55, 0.32, 0.1], text: mode === "dual" ? "Target 1" : "Receptor" }, ...(mode === "dual" ? [{ at: [0.55, -0.34, -0.1] as Vec3, text: "Target 2" }] : []), ...(t > 0.75 ? [{ at: [NK1[0], NK1[1] - 0.75, 0] as Vec3, text: "NK cell" }] : [])] };
  });
}

// =====================================================================================
// Targeted protein degrader (PROTAC / molecular glue): ternary complex → ubiquitin → proteasome → recycle
// =====================================================================================
export function degraderAnimated(): Mesh {
  const sc = scene();
  const TGT0: Vec3 = [1.1, 0.35, 0], E30: Vec3 = [-1.2, 0.25, 0], MEET_T: Vec3 = [0.32, 0.1, 0], MEET_E: Vec3 = [-0.42, 0.1, 0], PROT: Vec3 = [2.3, -0.4, 0];
  put(sc, "tgt", sphere(0.36, 4, 8, "hot"), { at: TGT0 });
  put(sc, "e3", sphere(0.42, 4, 8), { at: E30 });
  const dumb = empty(); add(dumb, octahedron(0.08, "accent"), { at: [-0.22, 0, 0] }); add(dumb, polyline([[-0.22, 0, 0], [0.22, 0, 0]], "accent")); add(dumb, octahedron(0.08, "accent"), { at: [0.22, 0, 0] });
  const D0: Vec3 = [0, -2.2, 0.2], D1: Vec3 = [-0.05, 0.1, 0];
  put(sc, "deg", dumb, { at: D0 });
  put(sc, "ub", dots([[0.55, 0.45, 0.15], [0.7, 0.2, -0.1], [0.6, -0.15, 0.2], [0.45, 0.5, -0.15], [0.75, 0.4, 0.05]], "accent"));
  put(sc, "prot", cylinder(0.36, 1.0, 10, 3, "soft"), { at: PROT, rotZ: Math.PI / 2 });
  put(sc, "frag", dots([[3.0, -0.5, 0.1], [3.1, -0.3, -0.1], [3.05, -0.55, -0.05], [3.2, -0.4, 0.1]], "soft"));
  const base = sc.mesh.points, P = sc.parts;
  return frameLoop(sc, 13, (t, pts, alpha) => {
    setAlpha(alpha, P["ub"], 0); setAlpha(alpha, P["frag"], 0);
    const degAt = (d: Vec3) => movePart(pts, base, P["deg"], [d[0] - D0[0], d[1] - D0[1], d[2] - D0[2]]);
    const tgtAt = (d: Vec3, s = 1) => movePart(pts, base, P["tgt"], [d[0] - TGT0[0], d[1] - TGT0[1], d[2] - TGT0[2]], s);
    const e3At = (d: Vec3) => movePart(pts, base, P["e3"], [d[0] - E30[0], d[1] - E30[1], d[2] - E30[2]]);
    let caption = "";
    if (t < 0.2) { const u = phase(t, 0, 0.2); degAt(lerp3(D0, D1, u)); caption = "1 · The degrader has two heads: one grips the target protein, the other an E3 ubiquitin ligase"; }
    else if (t < 0.4) { const u = phase(t, 0.2, 0.4); degAt(D1); tgtAt(lerp3(TGT0, MEET_T, u)); e3At(lerp3(E30, MEET_E, u)); caption = "2 · It pulls target and ligase together into a ternary complex"; }
    else if (t < 0.58) { degAt(D1); tgtAt(MEET_T); e3At(MEET_E); const u = phase(t, 0.4, 0.58); setAlpha(alpha, P["ub"], u); movePart(pts, base, P["ub"], [MEET_T[0] - 0.6, MEET_T[1] - 0.25, 0]); setAlpha(alpha, P["e3"], pulse(t)); caption = "3 · The ligase tags the target with a chain of ubiquitin: a destroy-me label"; }
    else if (t < 0.82) { const u = phase(t, 0.58, 0.82); degAt(D1); e3At(MEET_E); const d = lerp3(MEET_T, PROT, u); tgtAt(d, 1 - 0.7 * u); setAlpha(alpha, P["tgt"], 1 - 0.6 * u); setAlpha(alpha, P["ub"], 1 - u); movePart(pts, base, P["ub"], [d[0] - 0.6, d[1] - 0.25, 0]); setAlpha(alpha, P["prot"], 0.6 + 0.4 * u); if (u > 0.6) setAlpha(alpha, P["frag"], (u - 0.6) / 0.4); caption = "4 · The proteasome shreds the tagged protein: the target is gone, not just blocked"; }
    else { const u = phase(t, 0.82, 1); degAt(lerp3(D1, [-0.05, -0.9, 0.1], u)); e3At(lerp3(MEET_E, E30, u)); tgtAt(lerp3(PROT, TGT0, u), 0.3 + 0.7 * u); setAlpha(alpha, P["tgt"], 0.4 + 0.6 * u); setAlpha(alpha, P["frag"], 1 - u); caption = "5 · Degrader and ligase are released to work again: one molecule can destroy many copies"; }
    return { caption, labels: [{ at: [E30[0], E30[1] + 0.6, 0], text: "E3 ligase (e.g. cereblon, VHL)" }, { at: [TGT0[0], TGT0[1] + 0.55, 0], text: "Target protein" }, { at: [PROT[0], PROT[1] - 0.6, 0], text: "Proteasome" }] };
  });
}

// =====================================================================================
// Oncolytic virus (or non-replicating viral gene therapy): infect → replicate or express → burst or secrete → immune response
// =====================================================================================
export function oncolyticAnimated(mode: "oncolytic" | "gene" = "oncolytic"): Mesh {
  const sc = scene();
  const TUM: Vec3 = [0, 0, 0], NORM: Vec3 = [2.2, -0.9, 0.4];
  put(sc, "tum", cell(1.0, "hot"), { at: TUM });
  put(sc, "tumNuc", sphere(0.32, 3, 8, "soft"), { at: [0.15, 0.1, 0] });
  put(sc, "norm", cell(0.7, "soft"), { at: NORM });
  put(sc, "normNuc", sphere(0.22, 3, 8, "soft"), { at: NORM });
  const V0: Vec3 = [-2.6, 0.7, 0.2], VIN: Vec3 = [-0.35, 0.25, 0.1];
  put(sc, "virus", icosahedron(0.22, "accent"), { at: V0 });
  put(sc, "virus2", icosahedron(0.16, "accent"), { at: [1.3, 0.3, -0.5] });
  const progeny: Part[] = [];
  const dirs: Vec3[] = [[0.6, 0.5, 0.2], [-0.5, 0.6, -0.2], [0.3, -0.6, 0.3], [-0.6, -0.3, 0.2], [0.1, 0.7, -0.4], [0.7, -0.1, -0.3]];
  dirs.forEach((d, i) => progeny.push(put(sc, `p${i}`, icosahedron(0.12, "accent"), { at: [TUM[0] + d[0] * 0.5, TUM[1] + d[1] * 0.5, TUM[2] + d[2] * 0.5] })));
  put(sc, "antigen", dots([[0.9, 0.9, 0.1], [-0.8, 1.0, -0.1], [1.1, -0.7, 0.2], [-1.0, -0.8, 0.1], [0.2, 1.2, 0.3]], "hot"));
  put(sc, "ifn", dots([[0.9, 0.5, 0.1], [1.1, 0.1, -0.1], [1.2, 0.6, 0.2], [0.8, -0.4, 0.2]], "accent"));
  const T0: Vec3 = [-2.6, -1.6, 0.3], T1: Vec3 = [-1.35, -0.6, 0.1];
  put(sc, "t", cell(0.55, "soft"), { at: T0 });
  const base = sc.mesh.points, P = sc.parts;
  const gene = mode === "gene";
  return frameLoop(sc, 13, (t, pts, alpha) => {
    progeny.forEach((p) => setAlpha(alpha, p, 0)); setAlpha(alpha, P["antigen"], 0); setAlpha(alpha, P["ifn"], 0); setAlpha(alpha, P["t"], 0);
    const vAt = (d: Vec3, s = 1) => movePart(pts, base, P["virus"], [d[0] - V0[0], d[1] - V0[1], d[2] - V0[2]], s);
    const spread = (u: number) => progeny.forEach((p, i) => { setAlpha(alpha, p, 1); const d = dirs[i]; movePart(pts, base, p, [d[0] * 1.6 * u, d[1] * 1.6 * u, d[2] * 1.6 * u]); });
    let caption = "";
    if (t < 0.22) { const u = phase(t, 0, 0.22); vAt(lerp3(V0, [-1.05, 0.3, 0.1], u)); setAlpha(alpha, P["virus2"], 1 - u); caption = gene ? "1 · A non-replicating virus carrying a therapeutic gene is instilled into the bladder" : "1 · An engineered virus is injected into the tumour (or given intravenously)"; }
    else if (t < 0.38) { const u = phase(t, 0.22, 0.38); vAt(lerp3([-1.05, 0.3, 0.1], VIN, u), 1 - 0.3 * u); setAlpha(alpha, P["virus2"], 0); setAlpha(alpha, P["norm"], 0.6); caption = gene ? "2 · It enters the lining cells and hands over its gene (interferon alfa-2b)" : "2 · It infects tumour cells; healthy cells shut it down (the virus is crippled outside tumours)"; }
    else if (t < 0.58) { const u = phase(t, 0.38, 0.58); vAt(VIN, 0.7); setAlpha(alpha, P["virus"], 1 - u); if (gene) { setAlpha(alpha, P["ifn"], u); movePart(pts, base, P["ifn"], [-0.9 + 0.9 * u, 0, 0], 0.5 + 0.5 * u); } else progeny.forEach((p, i) => { setAlpha(alpha, p, Math.max(0, Math.min(1, u * 6 - i))); movePart(pts, base, p, [0, 0, 0], 0.6 + 0.4 * u); }); caption = gene ? "3 · The cell becomes a factory, secreting interferon for weeks" : "3 · It replicates thousands of times inside the tumour cell"; }
    else if (t < 0.8) { const u = phase(t, 0.58, 0.8); setAlpha(alpha, P["virus"], 0); if (gene) { setAlpha(alpha, P["ifn"], 1); movePart(pts, base, P["ifn"], [0.6 * u, 0.3 * u, 0], 1 + u); setAlpha(alpha, P["antigen"], u * 0.8); } else { movePart(pts, base, P["tum"], [0, 0, 0], 1 + 0.35 * u); setAlpha(alpha, P["tum"], 1 - 0.7 * u); setAlpha(alpha, P["tumNuc"], 1 - u); spread(u); setAlpha(alpha, P["antigen"], u); movePart(pts, base, P["antigen"], [0, 0, 0], 1 + 0.4 * u); } caption = gene ? "4 · Interferon slows the cancer cells directly and raises the alarm to immune cells" : "4 · The cell bursts (oncolysis): new virions infect neighbours; tumour antigens and danger signals spill out"; }
    else { const u = phase(t, 0.8, 1); setAlpha(alpha, P["virus"], 0); if (gene) { setAlpha(alpha, P["ifn"], 1); movePart(pts, base, P["ifn"], [0.6, 0.3, 0], 2); setAlpha(alpha, P["antigen"], 0.8); } else { movePart(pts, base, P["tum"], [0, 0, 0], 1.35); setAlpha(alpha, P["tum"], 0.3); setAlpha(alpha, P["tumNuc"], 0); spread(1); setAlpha(alpha, P["antigen"], 1); movePart(pts, base, P["antigen"], [0, 0, 0], 1.4); } setAlpha(alpha, P["t"], u); const d = lerp3(T0, T1, u); movePart(pts, base, P["t"], [d[0] - T0[0], d[1] - T0[1], d[2] - T0[2]]); caption = gene ? "5 · Immune cells are drawn in to clear the remaining tumour" : "5 · Immune cells are drawn in (T-VEC also makes GM-CSF): a cold tumour turns hot"; }
    return { caption, labels: [{ at: [TUM[0], 1.15, 0], text: gene ? "Bladder lining tumour cell" : "Tumour cell" }, { at: [NORM[0], NORM[1] - 0.85, 0], text: "Healthy cell" }, ...(t > 0.85 ? [{ at: [T1[0], T1[1] - 0.7, 0] as Vec3, text: "T cell" }] : [])] };
  });
}

// =====================================================================================
// TIL therapy: resect → isolate TILs → expand ex vivo with IL-2 → lymphodeplete → infuse → attack
// =====================================================================================
export function tilAnimated(): Mesh {
  const sc = scene();
  const TUM: Vec3 = [1.4, -0.2, 0], DISH: Vec3 = [-1.6, 1.1, 0];
  put(sc, "tum", cell(0.95, "hot"), { at: TUM });
  put(sc, "tumNuc", sphere(0.3, 3, 8, "soft"), { at: [TUM[0] + 0.1, TUM[1], 0] });
  const inside: Vec3[] = [[TUM[0] - 0.45, TUM[1] + 0.35, 0.2], [TUM[0] + 0.5, TUM[1] - 0.4, -0.2], [TUM[0] - 0.2, TUM[1] - 0.55, 0.3]];
  const tils: Part[] = inside.map((p, i) => put(sc, `til${i}`, sphere(0.14, 2, 6, "accent"), { at: p }));
  const seat = (i: number): Vec3 => [DISH[0] + 0.42 * Math.cos((TAU * i) / 9), DISH[1] + 0.42 * Math.sin((TAU * i) / 9), 0.05 * (i % 2)];
  put(sc, "dish", ring(0.75, 18, "soft", "z"), { at: DISH });
  const clones: Part[] = [];
  for (let i = 0; i < 9; i++) clones.push(put(sc, `c${i}`, sphere(0.12, 2, 6, "accent"), { at: seat(i) }));
  put(sc, "il2", dots([[DISH[0] - 0.2, DISH[1] + 0.15, 0.1], [DISH[0] + 0.25, DISH[1] - 0.1, -0.1], [DISH[0], DISH[1] - 0.3, 0.1]], "hot"));
  put(sc, "cut", polyline([[TUM[0] - 0.3, TUM[1] + 1.4, 0], [TUM[0] - 0.9, TUM[1] + 0.6, 0]], "accent"));
  const base = sc.mesh.points, P = sc.parts;
  const moveTil = (pts: Vec3[], i: number, to: Vec3) => movePart(pts, base, tils[i], [to[0] - inside[i][0], to[1] - inside[i][1], to[2] - inside[i][2]]);
  const moveClone = (pts: Vec3[], i: number, to: Vec3) => { const from = seat(i); movePart(pts, base, clones[i], [to[0] - from[0], to[1] - from[1], to[2] - from[2]]); };
  const staging = (i: number): Vec3 => [TUM[0] - 1.4 + 0.25 * (i % 3), TUM[1] + 0.4 - 0.35 * Math.floor(i / 3), 0.1 * (i % 2)];
  return frameLoop(sc, 14, (t, pts, alpha) => {
    clones.forEach((c) => setAlpha(alpha, c, 0)); setAlpha(alpha, P["il2"], 0); setAlpha(alpha, P["dish"], 0); setAlpha(alpha, P["cut"], 0);
    let caption = "";
    if (t < 0.18) { const u = phase(t, 0.05, 0.18); setAlpha(alpha, P["cut"], u); movePart(pts, base, P["cut"], [0.3 * u, -0.3 * u, 0]); caption = "1 · A piece of the tumour is removed surgically: it already contains T cells that recognise it (TILs)"; }
    else if (t < 0.36) { const u = phase(t, 0.18, 0.36); setAlpha(alpha, P["dish"], u); tils.forEach((_, i) => moveTil(pts, i, lerp3(inside[i], seat(i), u))); caption = "2 · The TILs are separated from the tumour cells in the lab"; }
    else if (t < 0.56) { setAlpha(alpha, P["dish"], 1); tils.forEach((_, i) => moveTil(pts, i, seat(i))); const u = phase(t, 0.36, 0.56); setAlpha(alpha, P["il2"], pulse(t)); clones.forEach((c, i) => setAlpha(alpha, c, i < 3 ? 0 : Math.max(0, Math.min(1, u * 6 - (i - 3))))); caption = "3 · Fed with IL-2 they multiply to tens of billions over about three weeks (rapid expansion)"; }
    else if (t < 0.74) { setAlpha(alpha, P["dish"], 0.5); const u = phase(t, 0.56, 0.74); setAlpha(alpha, P["tum"], 1 - 0.3 * u); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.1 * u); tils.forEach((_, i) => moveTil(pts, i, lerp3(seat(i), staging(i), u))); clones.forEach((c, i) => { if (i < 3) return; setAlpha(alpha, c, 1); moveClone(pts, i, lerp3(seat(i), staging(i), u)); }); caption = "4 · A short course of lymphodepleting chemotherapy makes room; the expanded TILs are infused with IL-2"; }
    else { const u = phase(t, 0.74, 1); tils.forEach((_, i) => moveTil(pts, i, lerp3(staging(i), [TUM[0] - 0.75 + 0.25 * i, TUM[1] + 0.5 - 0.35 * i, 0.15], u))); clones.forEach((c, i) => { if (i < 3) return; setAlpha(alpha, c, 1); const a = (TAU * i) / 9; moveClone(pts, i, lerp3(staging(i), [TUM[0] + 0.85 * Math.cos(a), TUM[1] + 0.85 * Math.sin(a), 0.1 * (i % 2)], u)); }); movePart(pts, base, P["tum"], [0, 0, 0], 0.9 - 0.45 * u); setAlpha(alpha, P["tum"], 0.7 - 0.4 * u); movePart(pts, base, P["tumNuc"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["tumNuc"], pulse(t, 6)); caption = "5 · A polyclonal army hunts many tumour antigens at once (lifileucel, melanoma, approved 2024)"; }
    return { caption, labels: [{ at: [TUM[0], TUM[1] + 1.15, 0], text: "Tumour" }, ...(t >= 0.18 && t < 0.74 ? [{ at: [DISH[0], DISH[1] + 0.95, 0] as Vec3, text: "Culture with IL-2" }] : [])] };
  });
}

/** Shared frame plumbing for the builders above: fresh buffers each frame, base labels unless overridden. */
function frameLoop(sc: Scene, duration: number, fn: (t: number, pts: Vec3[], alpha: number[]) => { caption: string; labels?: Array<{ at: Vec3; text: string }> }): Mesh {
  sc.mesh.animate = { duration, frame: (t) => { const { pts, alpha } = buffers(sc); const r = fn(t, pts, alpha); return { points: pts, alpha, caption: r.caption, labels: r.labels ?? sc.mesh.labels }; } };
  return sc.mesh;
}

// =====================================================================================
// Modality → schematic. Every product gets a process schematic: a dedicated animation where one exists
// for its modality, otherwise the animated schematic of the front it belongs to (keys "front:<sectionId>").
// Order matters: earlier rules win. animated.test.ts checks every product in the corpus resolves.
// =====================================================================================
export const MODALITY_SCHEMATICS: Array<[RegExp, string]> = [
  [/bispecific adc|biparatopic adc/, "bispecific-adc"],
  [/dual[- ]payload/, "dual-payload-adc"],
  [/\badc\b|antibody[- ]drug conjugate|drug conjugate|toxin conjugate|immunotoxin|cytotoxin|photoimmunotherapy/, "adc"],
  [/car-?nk|car-?m\b|macrophage/, "car-nk-macrophage"],
  [/\bcar-?t\b/, "car-t"],
  [/tcr-?t\b/, "tcr-t"],
  [/\btil\b|tumou?r-infiltrating/, "til-therapy"],
  [/immtac|engager|[×x]\s*cd3|tcr\s*[×x]\s*cd3/, "t-cell-engager"],
  [/anti-pd-?1|anti-pd-l1|anti-ctla-?4|anti-lag-?3|anti-tigit|checkpoint|pd-1 antibody|pd-l1 antibody|ido1/, "checkpoint-inhibitor"],
  [/bispecific|biparatopic|bifunctional|trispecific/, "bispecific-antibody"],
  [/monoclonal antibody|\bmab\b|antibody \(anti|anti-[a-z0-9]+ (monoclonal )?antibody|fc-engineered|glycoengineered|defucosylated|ligand trap, fc fusion/, "monoclonal-antibody"],
  [/protac|degrader|molecular glue|celmod|cereblon|\bimid\b|immunomodulatory drug/, "protac-degrader"],
  [/non-replicating|gene therapy/, "viral-gene-therapy"],
  [/oncolytic|adenovir|hsv-1|viral/, "oncolytic-virus"],
  [/mrna/, "neoantigen-mrna-vaccine"],
  [/dendritic cell|antigen-presenting cell|autologous cellular/, "cell-vaccine"],
  [/vaccine|virus-like/, "shared-antigen-vaccine"],
  [/alpha therapy|actinium|lead-212|radium|thorium|astatine/, "targeted-alpha-therapy"],
  [/radioligand|radiopharmaceutical \(beta|theranostic|lutetium|iodine-131|radioimmuno|beta\/gamma emitter/, "radioligand-therapy"],
  [/\bai\b.*\bsoftware\b|software as a medical device/, "front:ai-computation"],
  [/fluorescence-guided surgery/, "front:surgery"],
  [/\bpet\b|radiotracer|imaging agent|lymphatic mapping|fluorescen|near-infrared|contrast agent/, "front:imaging"],
  [/early detection|screening test|multi-cancer|\bmced\b/, "front:early-detection"],
  [/\btest\b|assay|classifier|profiling|sequencing|\bpanel\b|digital pathology|\bmrd\b|diagnostic/, "front:diagnostics"],
  [/device|treating fields|drug-eluting/, "front:devices"],
  [/cytokine|interferon|interleukin|il-2\b|il-15|superagonist|sting agonist|muramyl|macrophage activator|live bacterial|\bbcg\b/, "front:immunotherapy"],
  [/ligand trap/, "monoclonal-antibody"],
  [/tumou?r necrosis factor/, "front:immunotherapy"],
  [/photodynamic|photosensiti/, "front:radiation"],
  [/chemoprotectant|hepcidin|erythroid|maturation agent|antiemetic|scalp cooling|growth factor support|bone-protecting|bisphosphonate|cytoprotect|uroprotect|cardioprotect|antidote|rescue agent|erythropoi|colony-stimulating|g-csf|platelet-lowering|urate oxidase|\bglucocorticoid\b|corticosteroid|immunoglobulin/, "front:supportive-care"],
  [/adrenolytic|\bserd\b|\bserm\b|aromatase|antiandrogen|androgen receptor|\bar (antagonist|n-terminal)|gnrh|cyp17|hormon|progestin|glucocorticoid receptor|oestrogen receptor|estrogen receptor|somatostatin|sstr2 agonist/, "front:hormonal"],
  [/hdac|ezh2|hypomethylating|menin|\bidh|bromodomain|epigenetic|differentiation agent|retinoid|arsenical|dot1l|lsd1/, "front:epigenetics"],
  [/cytotoxic|chemotherapy|alkylating|platinum|taxane|vinca|anthracycline|antifolate|antimetabolite|nucleoside|topoisomerase|camptothecin|podophyllotoxin|nitrosourea|nitrogen mustard|halichondrin|microtubule|liposomal|dna[- ](binder|cleav|alkylat|minor)|actinomycin|antibiotic|ribonucleotide reductase|fluoropyrimidine|purine|hydroxyurea|conditioning agent|transcription inhibitor|enzyme therapy|asparaginase/, "front:chemotherapy"],
  [/inhibitor|\btki\b|kinase|antagonist|agonist|clamp|inactivator|small[- ]molecule|reactivator|imipridone|proteasome|bcl-2|parp|modulator|oligonucleotide|antisense|sirna|telomerase/, "front:targeted-therapy"],
  // Registry-ingested pipeline products (drugs-pipeline-wave1.ts) whose sponsor states only a broad class, or none.
  [/cell therapy/, "front:cell-therapy"],
  [/fusion protein|immunocytokine/, "front:immunotherapy"],
  [/\bpeptide\b/, "front:targeted-therapy"],
  [/costimulatory|co-stimulatory|immune agonist/, "front:immunotherapy"],
  [/radioenhancer|radiosensiti|nanoparticle/, "front:radiation"],
  [/hyaluronidase|stroma-degrading|stromal enzyme/, "front:targeted-therapy"],
  [/form not stated|not stated \(registered/, "front:drug-discovery"],
];

/** Key into ALL_ANIMATED (see schematics.ts) for a product: a technology with its own animation wins, then the modality text; null when nothing matches. */
export function schematicForModality(modality: string | undefined, technologies: string[] = []): string | null {
  for (const id of technologies) if (id in ANIMATED) return id;
  const m = (modality ?? "").toLowerCase().replace(/\s+/g, " ");
  for (const [re, key] of MODALITY_SCHEMATICS) if (re.test(m)) return key;
  return null;
}

/** Technology ids that have an animated process schematic. */
export const ANIMATED: Record<string, () => Mesh> = {
  adc: () => adcAnimated(),
  "bispecific-adc": () => adcAnimated({ bispecific: true, antigenLabel: "Two antigens (e.g. EGFR × HER3)" }),
  "dual-payload-adc": () => adcAnimated({ payloadLabel: "Two payload classes" }),
  "car-t": () => carTAnimated("car-t"),
  "tcr-t": () => carTAnimated("tcr-t"),
  "car-nk-macrophage": () => carTAnimated("car-nk"),
  "radioligand-therapy": () => radioligandAnimated(false),
  "targeted-alpha-therapy": () => radioligandAnimated(true),
  "checkpoint-inhibitor": () => checkpointAnimated(),
  "t-cell-engager": () => engagerAnimated(),
  "neoantigen-mrna-vaccine": () => mrnaVaccineAnimated("mrna"),
  "shared-antigen-vaccine": () => mrnaVaccineAnimated("peptide"),
  "cell-vaccine": () => mrnaVaccineAnimated("cell"),
  "bispecific-antibody": () => antibodyAnimated("dual"),
  "monoclonal-antibody": () => antibodyAnimated("mono"),
  "protac-degrader": () => degraderAnimated(),
  "oncolytic-virus": () => oncolyticAnimated("oncolytic"),
  "viral-gene-therapy": () => oncolyticAnimated("gene"),
  "til-therapy": () => tilAnimated(),
  ...WAVE3, // thirty more technologies (transplants, screening, interventional, nutrition, registries, palliative care, …)
  ...WAVE4, // forty more (diagnostics, supportive care, complementary and lifestyle evidence, manufacturing and trial infrastructure)
  ...WAVE5, // forty more (molecular diagnostics, prevention and diet evidence, prehabilitation and ePRO, radiopharma and cell-therapy supply chains)
  ...WAVE6, // forty more (surveillance and screening programmes, acupuncture and other supportive-care trials, trial and sequencing infrastructure, logic gates and hypoxia prodrugs)
  ...WAVE7, // forty more (coffee and diet evidence, limb and organ-sparing procedures, decongestive therapy and other supportive-care trials, lab and pharmacy automation, generators and Auger emitters, hydrazine sulfate and antineoplastons)
  ...WAVE8, // the remaining technologies (teleoncology and tumour boards, radiosensitising nanoparticles and spatially fractionated radiotherapy, AI foundation models of structure, cells and pathology, complementary claims with a trial record, sequencing and manufacturing infrastructure)
  ...REJUV_REHAB_SCENES, // rehabilitation loop, reconstruction and the fitted device (src/data/spikes/rejuvenation-rehab.ts)
};


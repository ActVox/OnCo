/**
 * Animated wireframe schematics for the fronts (section entities). Each tells the front's story
 * in 3-6 captioned phases on a ~10-14 s loop, using the same scene/part/frame machinery as the
 * technology animations in ./animated.ts. Every mesh stays under 500 points.
 *
 * Design rules so the cards read as a set: one focal body per scene, drawn filled (translucent) so a cell is a cell
 * and an organ is an organ; the main composition sits within radius ≈2.2 and actors start no further than ≈3, so the
 * viewer's percentile fit gives every card the same apparent scale; curves use enough vertices to look smooth in a
 * 128 px thumbnail; small actors (a probe, a beam, a docking antibody) move so the thumbnail is never static.
 *
 * Registered under the key `front:<sectionId>`; see FRONT_ANIMATED at the bottom.
 */
import { add, antibody, arrow, box, chromosome, cylinder, disc, dna, dots, ellipsoid, empty, fan, helix, icosahedron, keyShape, lerp, lerp3, line, membrane, movePart, octahedron, phase, polyline, ring, setAlpha, sphere, syringe, torus, type Mesh, type Part, type Vec3 } from "@/lib/wireframe";
import { buffers, pulse, put, receptor, scene, type Scene } from "./animated";

const TAU = Math.PI * 2;
/** A cell: smooth filled sphere with enough meridians to look round in a thumbnail. */
const cell = (r: number, cls?: string) => sphere(r, 6, 12, cls, true);
/** A tumour or other highlighted blob. */
const blob = (r: number, cls = "hot") => sphere(r, 4, 8, cls, true);
/** Reveal a polyline part progressively (segments switch on in order). */
const grow = (alpha: number[], p: Part, u: number) => { const n = p.s1 - p.s0; for (let k = 0; k < n; k++) alpha[p.s0 + k] = Math.max(0, Math.min(1, u * n - k)); };
const hide = (alpha: number[], ...parts: Part[]) => parts.forEach((p) => setAlpha(alpha, p, 0));
const moveTo = (pts: Vec3[], base: Vec3[], p: Part, from: Vec3, to: Vec3, u: number, scale = 1, spin = 0) => { const d = lerp3(from, to, u); movePart(pts, base, p, [d[0] - from[0], d[1] - from[1], d[2] - from[2]], scale, spin); };
const sum = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
/** Standing human silhouette (front view) as line art, ~1.8 tall centred at origin: head, torso outline, arms with elbows, legs with knees. */
function figure(cls?: string): Mesh {
  const m = empty();
  add(m, sphere(0.15, 4, 8, cls, true), { at: [0, 0.8, 0] });
  add(m, polyline([[0, 0.65, 0], [0, 0.56, 0]], cls));
  const torso = polyline([[-0.3, 0.56, 0], [0.3, 0.56, 0], [0.22, 0.0, 0], [-0.22, 0.0, 0]], cls, true);
  torso.faces = [cls ? { idx: [0, 1, 2, 3], cls } : { idx: [0, 1, 2, 3] }];
  add(m, torso);
  add(m, polyline([[-0.3, 0.56, 0], [-0.42, 0.26, 0.05], [-0.38, -0.04, 0.1]], cls));
  add(m, polyline([[0.3, 0.56, 0], [0.42, 0.26, 0.05], [0.38, -0.04, 0.1]], cls));
  add(m, polyline([[-0.15, 0.0, 0], [-0.18, -0.42, 0.02], [-0.2, -0.86, 0]], cls));
  add(m, polyline([[0.15, 0.0, 0], [0.18, -0.42, 0.02], [0.2, -0.86, 0]], cls));
  return m;
}
function frame(sc: Scene, duration: number, fn: (t: number, pts: Vec3[], alpha: number[]) => { caption: string; labels?: Array<{ at: Vec3; text: string }> }): Mesh {
  sc.mesh.animate = { duration, frame: (t) => { const { pts, alpha } = buffers(sc); const r = fn(t, pts, alpha); return { points: pts, alpha, caption: r.caption, labels: r.labels ?? sc.mesh.labels }; } };
  return sc.mesh;
}

// ---------------------------------------------------------------- imaging
export function imagingFront(): Mesh {
  const sc = scene();
  const START: Vec3 = [0, -0.1, -1.2], END: Vec3 = [0, -0.1, 0];
  const HOT_OFF: Vec3 = [0.15, 0.0, 0.3];
  put(sc, "ring", torus(1.6, 0.14, 28, 6, undefined, true), { rotX: Math.PI / 2 });
  put(sc, "couch", box(0.9, 0.05, 3.0, "soft"), { at: [0, -0.55, 0] });
  put(sc, "body", ellipsoid(0.55, 0.42, 1.5, 5, 12, "soft", true), { at: START });
  put(sc, "hot", blob(0.14), { at: sum(START, HOT_OFF) });
  const photons: Part[] = [];
  for (let i = 0; i < 3; i++) { const a = 0.4 + i * 1.1; photons.push(put(sc, `ph${i}`, polyline([[0, 0, 0], [1.45 * Math.cos(a), 1.45 * Math.sin(a), 0]], "accent"))); photons.push(put(sc, `ph${i}b`, polyline([[0, 0, 0], [-1.45 * Math.cos(a), -1.45 * Math.sin(a), 0]], "accent"))); }
  // image plane: grid that fills in, then a scan line sweeps down it
  const plane = empty(); for (let i = 0; i <= 5; i++) { add(plane, line([-0.7, -0.7 + 0.28 * i, 0], [0.7, -0.7 + 0.28 * i, 0], "soft")); add(plane, line([-0.7 + 0.28 * i, -0.7, 0], [-0.7 + 0.28 * i, 0.7, 0], "soft")); }
  const PLANE: Vec3 = [2.3, 0.15, 0];
  const pl = put(sc, "plane", plane, { at: PLANE });
  const lesion = put(sc, "blob", ring(0.2, 14, "hot", "z"), { at: [PLANE[0] + 0.12, PLANE[1] - 0.08, 0.01] });
  const sweep = put(sc, "sweep", line([-0.7, 0.7, 0.02], [0.7, 0.7, 0.02], "accent"), { at: PLANE });
  const base = sc.mesh.points, P = sc.parts;
  const HOT0 = sum(START, HOT_OFF), HOT1 = sum(END, HOT_OFF);
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, ...photons, pl, lesion, sweep);
    let caption = "";
    if (t < 0.3) { const u = phase(t, 0, 0.3); moveTo(pts, base, P["body"], START, END, u); moveTo(pts, base, P["hot"], HOT0, HOT1, u); setAlpha(alpha, P["hot"], 0.6 + 0.4 * u); caption = "1 · The patient passes into the scanner; a tracer has gathered in the tumour"; }
    else if (t < 0.55) { moveTo(pts, base, P["body"], START, END, 1); moveTo(pts, base, P["hot"], HOT0, HOT1, 1); photons.forEach((p, i) => { const u = phase(t, 0.3 + 0.03 * i, 0.5 + 0.03 * i); grow(alpha, p, u); movePart(pts, base, p, HOT1); }); setAlpha(alpha, P["hot"], pulse(t)); caption = "2 · Emissions or echoes leave the body in all directions"; }
    else if (t < 0.75) { moveTo(pts, base, P["body"], START, END, 1); moveTo(pts, base, P["hot"], HOT0, HOT1, 1); photons.forEach((p) => { setAlpha(alpha, p, 0.6); movePart(pts, base, p, HOT1); }); setAlpha(alpha, P["ring"], 0.7 + 0.3 * pulse(t, 4)); caption = "3 · Detectors around the ring catch them and time them"; }
    else { moveTo(pts, base, P["body"], START, END, 1); moveTo(pts, base, P["hot"], HOT0, HOT1, 1); const u = phase(t, 0.75, 1); grow(alpha, pl, u); setAlpha(alpha, sweep, u < 0.95 ? 0.9 : 0); movePart(pts, base, sweep, [0, -1.4 * u, 0]); setAlpha(alpha, lesion, u > 0.55 ? pulse(t, 5) : 0); caption = "4 · A computer rebuilds the image: anatomy from CT/MRI, biology from PET"; }
    return { caption, labels: [{ at: [1.6, 0.3, 0], text: "Detector ring" }, ...(t > 0.75 ? [{ at: [PLANE[0], PLANE[1] + 0.95, 0] as Vec3, text: "Reconstructed image" }] : [])] };
  });
}

// ---------------------------------------------------------------- diagnostics
export function diagnosticsFront(): Mesh {
  const sc = scene();
  put(sc, "organ", ellipsoid(0.85, 0.6, 0.5, 5, 12, "soft", true), { at: [-1.8, 0, 0] });
  put(sc, "tum", blob(0.2), { at: [-1.6, 0.05, 0.15] });
  const NEEDLE0: Vec3 = [-0.45, 1.05, 0.2], NEEDLE1: Vec3 = [-1.48, 0.22, 0.15];
  const needle = empty(); add(needle, polyline([[0, 0, 0], [0.7, 0.7, 0]], "accent")); add(needle, box(0.12, 0.12, 0.12, "accent", true), { at: [0.76, 0.76, 0] });
  put(sc, "needle", needle, { at: NEEDLE0 });
  put(sc, "core", dots([[0, 0, 0]], "hot"), { at: NEEDLE1 });
  // microscope: slide with coverslip, objective above
  put(sc, "slide", box(1.0, 0.04, 0.6, "soft", true), { at: [0.2, -0.1, 0] });
  put(sc, "cover", box(0.5, 0.02, 0.4, "soft"), { at: [0.2, -0.07, 0] });
  put(sc, "section", ring(0.16, 12, "hot", "y"), { at: [0.2, -0.05, 0] });
  put(sc, "lens", cylinder(0.13, 0.45, 10, 2, "soft", false, true), { at: [0.2, 0.42, 0] });
  put(sc, "lensTop", cylinder(0.2, 0.18, 10, 2, "soft", false, true), { at: [0.2, 0.75, 0] });
  // DNA that unwinds into reads
  const helixP = put(sc, "dna", dna(0.3, 1.6, 2, 40, undefined, 4), { at: [1.8, 0.1, 0] });
  const reads: Part[] = [];
  for (let i = 0; i < 6; i++) reads.push(put(sc, `read${i}`, line([1.35, -0.9 + 0.3 * i, 0], [2.25, -0.9 + 0.3 * i, 0], i % 3 === 1 ? "hot" : "accent")));
  const base = sc.mesh.points, P = sc.parts;
  const DOCK: Vec3 = [NEEDLE1[0] - 0.05, NEEDLE1[1] + 0.05, NEEDLE1[2]];
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, P["core"], P["section"], helixP, ...reads);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); moveTo(pts, base, P["needle"], NEEDLE0, DOCK, u); setAlpha(alpha, P["tum"], pulse(t)); caption = "1 · Biopsy: a needle samples the tumour (or a blood draw for liquid biopsy)"; }
    else if (t < 0.45) { const u = phase(t, 0.25, 0.45); moveTo(pts, base, P["needle"], NEEDLE0, DOCK, 1 - u); setAlpha(alpha, P["core"], 1); moveTo(pts, base, P["core"], NEEDLE1, [0.2, -0.05, 0], u); setAlpha(alpha, P["section"], u); caption = "2 · Tissue on a slide: histology and immunohistochemistry (ER, HER2, PD-L1)"; }
    else if (t < 0.7) { setAlpha(alpha, P["needle"], 0.3); setAlpha(alpha, P["section"], 1); const u = phase(t, 0.45, 0.7); setAlpha(alpha, helixP, u); movePart(pts, base, helixP, [0, 0, 0], 1, u * 2); caption = "3 · DNA and RNA extracted and sequenced (panel, exome, or genome)"; }
    else { setAlpha(alpha, P["needle"], 0.3); setAlpha(alpha, P["section"], 1); setAlpha(alpha, helixP, 0.35); const u = phase(t, 0.7, 1); reads.forEach((r, i) => { grow(alpha, r, Math.max(0, Math.min(1, u * 6 - i))); }); caption = "4 · Reads reveal mutations, fusions, TMB, MSI: the drug-matching report"; }
    return { caption, labels: [{ at: [-1.8, 0.75, 0], text: "Tumour" }, { at: [0.2, -0.45, 0], text: "Slide" }, ...(t > 0.45 ? [{ at: [1.8, 1.05, 0] as Vec3, text: t > 0.7 ? "Sequence reads" : "DNA" }] : [])] };
  });
}

// ---------------------------------------------------------------- early detection
export function earlyDetectionFront(): Mesh {
  const sc = scene();
  put(sc, "tube", cylinder(0.42, 2.0, 16, 3, undefined, false, true), { at: [-1.7, 0, 0] });
  put(sc, "cap", cylinder(0.46, 0.24, 16, 2, "accent", true, true), { at: [-1.7, 1.12, 0] });
  const frags: Part[] = [];
  for (let i = 0; i < 10; i++) { const a = (TAU * i) / 10; frags.push(put(sc, `f${i}`, helix(0.05, 0.26, 1.5, 8, "soft"), { at: [-1.7 + 0.24 * Math.cos(a), -0.8 + 0.11 * i, 0.24 * Math.sin(a)], rotZ: a })); }
  const hit = put(sc, "hit", helix(0.06, 0.3, 1.5, 10, "hot"), { at: [-1.7, -0.5, 0.05] });
  // classifier: bars
  const bars: Part[] = [];
  for (let i = 0; i < 5; i++) { const h = 0.15 + 0.22 * i; bars.push(put(sc, `bar${i}`, box(0.18, h, 0.18, "soft", true), { at: [0.3 + 0.3 * i, -0.5 + h / 2, 0] })); }
  // timeline: a flag years before the symptomatic tumour
  const axis = put(sc, "axis", arrow([0.2, -1.1, 0], [2.7, -1.1, 0], "soft", 0.06));
  const ticks: Part[] = [];
  for (let i = 0; i < 5; i++) ticks.push(put(sc, `tick${i}`, line([0.55 + 0.45 * i, -1.16, 0], [0.55 + 0.45 * i, -1.04, 0], "soft")));
  const early = put(sc, "early", ring(0.12, 12, "hot", "z"), { at: [0.8, -1.1, 0.01] });
  const earlyDot = put(sc, "earlyDot", dots([[0.8, -1.1, 0.02]], "hot"));
  const late = put(sc, "late", blob(0.26, "soft"), { at: [2.4, -0.72, 0] });
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, hit, ...bars, axis, ...ticks, early, earlyDot, late);
    let caption = "";
    if (t < 0.25) { frags.forEach((f, i) => movePart(pts, base, f, [0, 0.1 * Math.sin(t * TAU * 2 + i), 0])); caption = "1 · A blood draw. Dying cells everywhere shed short DNA fragments"; }
    else if (t < 0.5) { const u = phase(t, 0.25, 0.5); frags.forEach((f, i) => movePart(pts, base, f, [0, 0.1 * Math.sin(t * TAU * 2 + i) + 0.6 * u, 0])); movePart(pts, base, hit, [0, 0.6 * u, 0]); setAlpha(alpha, hit, u > 0.5 ? pulse(t) : u); caption = "2 · A few fragments carry tumour methylation patterns or mutations"; }
    else if (t < 0.75) { frags.forEach((f, i) => movePart(pts, base, f, [0, 0.1 * Math.sin(i) + 0.6, 0])); setAlpha(alpha, hit, 1); moveTo(pts, base, hit, [-1.7, 0.1, 0.05], [0.35, 0.45, 0], phase(t, 0.5, 0.65)); const u = phase(t, 0.55, 0.75); bars.forEach((b, i) => setAlpha(alpha, b, Math.max(0, Math.min(1, u * 5 - i)))); caption = "3 · A classifier weighs the signal and predicts the tissue of origin"; }
    else { frags.forEach((f, i) => movePart(pts, base, f, [0, 0.1 * Math.sin(i) + 0.6, 0])); setAlpha(alpha, hit, 0.4); movePart(pts, base, hit, [2.05, 0.35, -0.05]); bars.forEach((b) => setAlpha(alpha, b, 1)); const u = phase(t, 0.75, 1); grow(alpha, axis, u); ticks.forEach((k, i) => setAlpha(alpha, k, Math.max(0, Math.min(1, u * 5 - i)))); setAlpha(alpha, early, u > 0.3 ? pulse(t, 4) : 0); setAlpha(alpha, earlyDot, u > 0.3 ? 1 : 0); setAlpha(alpha, late, 0.35 * phase(u, 0.6, 1)); caption = "4 · A flag years before symptoms: the stage shift that saves lives, if confirmed"; }
    return { caption, labels: [{ at: [-1.7, 1.45, 0], text: "Blood sample" }, ...(t > 0.55 ? [{ at: [0.9, 0.9, 0] as Vec3, text: "Classifier" }] : []), ...(t > 0.75 ? [{ at: [0.8, -1.4, 0] as Vec3, text: "Early signal" }, { at: [2.4, -0.35, 0] as Vec3, text: "Symptoms, years later" }] : [])] };
  });
}

// ---------------------------------------------------------------- surgery
export function surgeryFront(): Mesh {
  const sc = scene();
  put(sc, "organ", ellipsoid(1.3, 0.8, 0.7, 5, 14, "soft", true), { at: [0, 0, 0] });
  const TUM: Vec3 = [0.3, 0.15, 0.25];
  put(sc, "tum", blob(0.3), { at: TUM });
  put(sc, "margin", ring(0.48, 20, "accent", "z"), { at: TUM });
  // robotic arm: mount, upper arm, joint, instrument shaft, jaws
  const ARM0: Vec3 = [2.3, 2.0, 0.6], ARM1: Vec3 = [1.05, 0.98, 0.35];
  const arm = empty();
  add(arm, box(0.2, 0.2, 0.2, undefined, true));
  add(arm, polyline([[0, 0, 0], [-0.5, -0.55, -0.1]]));
  add(arm, sphere(0.07, 2, 6, undefined, true), { at: [-0.5, -0.55, -0.1] });
  add(arm, polyline([[-0.5, -0.55, -0.1], [-0.72, -0.78, -0.12]], "accent"));
  add(arm, polyline([[-0.72, -0.78, -0.12], [-0.8, -0.9, -0.12]], "accent"));
  add(arm, polyline([[-0.72, -0.78, -0.12], [-0.84, -0.82, -0.12]], "accent"));
  put(sc, "arm", arm, { at: ARM0 });
  // lymphatic chain to sentinel node
  const chain = put(sc, "chain", polyline([[0.6, 0.2, 0.3], [1.3, 0.6, 0.5], [1.9, 1.0, 0.6], [2.4, 1.1, 0.6]], "soft"));
  const node = put(sc, "node", blob(0.14), { at: [1.9, 1.0, 0.6] });
  const dye = put(sc, "dye", dots([[0.9, 0.35, 0.4], [1.2, 0.55, 0.5], [1.55, 0.8, 0.55]], "accent"));
  const base = sc.mesh.points, P = sc.parts;
  const OUT: Vec3 = [TUM[0] + 0.6, TUM[1] + 1.8, TUM[2]];
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, node, dye, chain); setAlpha(alpha, P["margin"], 0);
    let caption = "";
    if (t < 0.22) { setAlpha(alpha, P["tum"], pulse(t)); caption = "1 · Imaging finds the tumour and plans the operation"; }
    else if (t < 0.45) { const u = phase(t, 0.22, 0.45); moveTo(pts, base, P["arm"], ARM0, ARM1, u); setAlpha(alpha, P["margin"], u); caption = "2 · Robotic or open approach; a margin of healthy tissue is planned around it"; }
    else if (t < 0.68) { const u = phase(t, 0.45, 0.68); moveTo(pts, base, P["arm"], ARM0, [ARM1[0] + 0.3, ARM1[1] + 1.2, ARM1[2]], u); moveTo(pts, base, P["tum"], TUM, OUT, u, 1); moveTo(pts, base, P["margin"], TUM, OUT, u); setAlpha(alpha, P["margin"], 1); caption = "3 · Tumour removed with its margin; the pathologist checks the edges are clear"; }
    else { movePart(pts, base, P["arm"], [ARM1[0] + 0.3 - ARM0[0], ARM1[1] + 1.2 - ARM0[1], ARM1[2] - ARM0[2]]); movePart(pts, base, P["tum"], [0.6, 1.8, 0]); movePart(pts, base, P["margin"], [0.6, 1.8, 0]); setAlpha(alpha, P["margin"], 1); setAlpha(alpha, P["tum"], 0.5); const u = phase(t, 0.68, 1); grow(alpha, chain, u); setAlpha(alpha, dye, u); setAlpha(alpha, node, u > 0.7 ? pulse(t) : 0); caption = "4 · Dye traces the lymphatics to the sentinel node: remove one node, not all"; }
    return { caption, labels: [{ at: [0, -0.9, 0], text: "Organ" }, ...(t < 0.45 ? [{ at: TUM, text: "Tumour" }] : []), ...(t > 0.68 ? [{ at: [1.9, 1.3, 0.6] as Vec3, text: "Sentinel node" }] : [])] };
  });
}

// ---------------------------------------------------------------- radiation
export function radiationFront(): Mesh {
  const sc = scene();
  put(sc, "gantry", torus(1.9, 0.12, 28, 6, "soft", true), { rotX: Math.PI / 2 });
  put(sc, "body", ellipsoid(1.1, 0.7, 0.5, 5, 14, "soft", true));
  const TUM: Vec3 = [0.25, 0.1, 0];
  put(sc, "tum", blob(0.28), { at: TUM });
  const beam = put(sc, "beam", fan(0.13, 1.85, 6, "accent", true), { at: [TUM[0], TUM[1] + 1.85, 0] });
  const head = put(sc, "head", box(0.36, 0.22, 0.32, undefined, true), { at: [TUM[0], TUM[1] + 1.95, 0] });
  const dose: Part[] = [];
  for (let i = 0; i < 4; i++) dose.push(put(sc, `dose${i}`, ring(0.32 + 0.08 * i, 14 + 2 * i, "accent", "z"), { at: TUM }));
  const cross = put(sc, "cross", polyline([[TUM[0] - 0.55, TUM[1], 0.02], [TUM[0] + 0.55, TUM[1], 0.02]], "hot"));
  const cross2 = put(sc, "cross2", polyline([[TUM[0], TUM[1] - 0.55, 0.02], [TUM[0], TUM[1] + 0.55, 0.02]], "hot"));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, ...dose, cross, cross2);
    const ang = t * TAU; // one full rotation per loop
    // rotate beam+head about TUM by angle ang (in XY plane)
    const spinAbout = (p: Part) => { const c = Math.cos(ang), s = Math.sin(ang); for (let i = p.p0; i < p.p1; i++) { const x = base[i][0] - TUM[0], y = base[i][1] - TUM[1]; pts[i] = [TUM[0] + x * c - y * s, TUM[1] + x * s + y * c, base[i][2]]; } };
    spinAbout(beam); spinAbout(head);
    setAlpha(alpha, beam, 0.65 + 0.35 * Math.sin(t * TAU * 10));
    let caption = "";
    if (t < 0.3) { caption = "1 · The gantry sweeps around; each beam is shaped to the tumour outline"; }
    else if (t < 0.65) { const u = phase(t, 0.3, 0.65); dose.forEach((d, i) => setAlpha(alpha, d, Math.max(0, Math.min(1, u * 4 - i)) * 0.9)); setAlpha(alpha, P["tum"], pulse(t, 3)); caption = "2 · Dose adds up where the beams cross; healthy tissue gets a little from each angle"; }
    else if (t < 0.85) { dose.forEach((d) => setAlpha(alpha, d, 0.9)); setAlpha(alpha, P["body"], 0.5); const u = phase(t, 0.65, 0.72); setAlpha(alpha, cross, u * (0.6 + 0.4 * pulse(t, 4))); setAlpha(alpha, cross2, u * (0.6 + 0.4 * pulse(t, 4))); caption = "3 · Image guidance each day keeps the target in the crosshairs"; }
    else { dose.forEach((d) => setAlpha(alpha, d, 0.9)); const u = phase(t, 0.85, 1); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.4 * u); setAlpha(alpha, P["tum"], 1 - 0.5 * u); caption = "4 · Over days or weeks the tumour's DNA damage becomes lethal; the body repairs"; }
    return { caption, labels: [{ at: [1.9, 0.3, 0], text: "Linac gantry" }, { at: TUM, text: "Target" }] };
  });
}

// ---------------------------------------------------------------- chemotherapy
export function chemotherapyFront(): Mesh {
  const sc = scene();
  put(sc, "cell", cell(1.1));
  put(sc, "nuc", sphere(0.45, 4, 8, "soft", true), { at: [0, 0, 0] });
  // chromosomes: six X shapes lined up on the metaphase plate
  const chr: Part[] = [];
  for (let i = 0; i < 6; i++) chr.push(put(sc, `chr${i}`, chromosome(0.9, "hot"), { at: [-0.3 + 0.12 * i, 0, 0.05 * (i % 2)] }));
  const spindle: Part[] = [];
  for (let i = 0; i < 6; i++) { spindle.push(put(sc, `sa${i}`, line([-0.9, 0, 0], [-0.3 + 0.12 * i, 0.1, 0], "soft"))); spindle.push(put(sc, `sb${i}`, line([0.9, 0, 0], [-0.3 + 0.12 * i, -0.1, 0], "soft"))); }
  const drug: Part[] = [];
  const D0 = (i: number): Vec3 => { const a = (TAU * i) / 8; return [1.8 * Math.cos(a), 1.8 * Math.sin(a), 0.5 * Math.sin(a * 2)]; };
  const D1 = (i: number): Vec3 => { const a = (TAU * i) / 8; return [0.7 * Math.cos(a), 0.7 * Math.sin(a), 0.2 * Math.sin(a * 2)]; };
  for (let i = 0; i < 8; i++) drug.push(put(sc, `d${i}`, octahedron(0.08, "accent", true), { at: D0(i) }));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 12, (t, pts, alpha) => {
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); chr.forEach((c) => setAlpha(alpha, c, u)); spindle.forEach((s) => setAlpha(alpha, s, u)); movePart(pts, base, P["cell"], [0, 0, 0], 1 + 0.1 * u); drug.forEach((d) => setAlpha(alpha, d, 0.4)); caption = "1 · A fast-dividing cancer cell lines up its chromosomes on the spindle"; }
    else if (t < 0.5) { const u = phase(t, 0.25, 0.5); movePart(pts, base, P["cell"], [0, 0, 0], 1.1); drug.forEach((d, i) => moveTo(pts, base, d, D0(i), D1(i), u, 1, t * 8)); caption = "2 · Cytotoxic drugs enter every dividing cell: tumour, marrow, gut, hair"; }
    else if (t < 0.78) { movePart(pts, base, P["cell"], [0, 0, 0], 1.1); const u = phase(t, 0.5, 0.78); drug.forEach((d, i) => moveTo(pts, base, d, D0(i), D1(i), 1, 1, t * 8)); spindle.forEach((s, i) => { setAlpha(alpha, s, 1 - u); movePart(pts, base, s, [0, 0.15 * Math.sin(u * 6 + i), 0]); }); chr.forEach((c, i) => movePart(pts, base, c, [0.2 * Math.sin(u * 5 + i) * u, 0.25 * Math.cos(u * 4 + i) * u, 0], 1, 0.6 * u)); caption = "3 · They wreck DNA or jam the spindle: division cannot finish"; }
    else { const u = phase(t, 0.78, 1); drug.forEach((d, i) => { moveTo(pts, base, d, D0(i), D1(i), 1, 1, 6); setAlpha(alpha, d, 0.5); }); spindle.forEach((s) => setAlpha(alpha, s, 0)); chr.forEach((c, i) => { movePart(pts, base, c, [0.2 * Math.sin(5 + i), 0.25 * Math.cos(4 + i), 0], 1, 0.6); setAlpha(alpha, c, 1 - 0.6 * u); }); movePart(pts, base, P["cell"], [0, 0, 0], 1.1 - 0.45 * u); setAlpha(alpha, P["cell"], 1 - 0.5 * u); setAlpha(alpha, P["nuc"], pulse(t, 6)); caption = "4 · The cell dies; cycles are spaced so normal tissue can recover (and payloads reuse this)"; }
    return { caption, labels: [{ at: [0, 1.3, 0], text: "Dividing cancer cell" }, ...(t > 0.25 && t < 0.78 ? [{ at: [1.4, 1.4, 0] as Vec3, text: "Cytotoxic (platinum, taxane, TOP1…)" }] : [])] };
  });
}

// ---------------------------------------------------------------- targeted therapy
export function targetedFront(): Mesh {
  const sc = scene();
  // a receptor tyrosine kinase spanning a lipid bilayer: ectodomain above, kinase domain below
  put(sc, "mem", membrane(2.6, 0.9, "soft", 6, 2), { at: [-1.3, 0.9, 0] });
  put(sc, "ecd", ellipsoid(0.32, 0.5, 0.32, 4, 10, undefined, true), { at: [-1.4, 1.5, 0] });
  put(sc, "stalk", polyline([[-1.4, 1.02, 0], [-1.4, 0.75, 0]]));
  put(sc, "kin", ellipsoid(0.45, 0.5, 0.4, 5, 10, undefined, true), { at: [-1.4, 0.25, 0] });
  const POCKET: Vec3 = [-0.95, 0.3, 0.05];
  const pocket = put(sc, "pocket", ring(0.2, 12, "hot", "z"), { at: POCKET });
  const DRUG0: Vec3 = [1.6, 2.2, 0.4], DRUG1: Vec3 = [POCKET[0], POCKET[1], POCKET[2] + 0.03];
  put(sc, "drug", octahedron(0.16, "accent", true), { at: DRUG0 });
  // downstream chain: RAS → RAF → MEK → ERK → nucleus
  const nodes: Vec3[] = [[-0.6, -0.5, 0], [0.2, -0.95, 0], [1.0, -1.25, 0], [1.8, -1.4, 0]];
  const links: Part[] = []; const bulbs: Part[] = [];
  let prev: Vec3 = [-1.15, -0.2, 0];
  nodes.forEach((n, i) => { links.push(put(sc, `l${i}`, arrow(prev, n, "hot", 0.2))); bulbs.push(put(sc, `b${i}`, sphere(0.12, 2, 8, undefined, true), { at: n })); prev = n; });
  const nuc = put(sc, "nuc", blob(0.45), { at: [2.6, -1.45, 0] });
  const base = sc.mesh.points, P = sc.parts;
  const names = ["RAS", "RAF", "MEK", "ERK"];
  return frame(sc, 12, (t, pts, alpha) => {
    let caption = "";
    if (t < 0.3) { links.forEach((l, i) => setAlpha(alpha, l, pulse(t + 0.1 * i, 3))); setAlpha(alpha, nuc, pulse(t, 3)); setAlpha(alpha, P["drug"], 0.3); caption = "1 · A mutated kinase is stuck 'on', firing the growth cascade nonstop"; }
    else if (t < 0.55) { const u = phase(t, 0.3, 0.55); moveTo(pts, base, P["drug"], DRUG0, DRUG1, u, 1, u * 5); links.forEach((l, i) => setAlpha(alpha, l, pulse(t + 0.1 * i, 3))); setAlpha(alpha, pocket, pulse(t)); caption = "2 · A small molecule designed for that exact pocket arrives (oral, daily)"; }
    else if (t < 0.8) { moveTo(pts, base, P["drug"], DRUG0, DRUG1, 1, 1, 5); const u = phase(t, 0.55, 0.8); links.forEach((l, i) => setAlpha(alpha, l, Math.max(0, 1 - Math.max(0, u * 4 - i)))); bulbs.forEach((b, i) => setAlpha(alpha, b, 1 - 0.7 * Math.max(0, Math.min(1, u * 4 - i)))); setAlpha(alpha, nuc, 1 - 0.7 * u); caption = "3 · It occupies the ATP pocket; the signal goes dark step by step"; }
    else { moveTo(pts, base, P["drug"], DRUG0, DRUG1, 1, 1, 5); links.forEach((l) => setAlpha(alpha, l, 0)); bulbs.forEach((b) => setAlpha(alpha, b, 0.3)); setAlpha(alpha, nuc, 0.3); const u = phase(t, 0.8, 1); setAlpha(alpha, P["kin"], 1 - 0.4 * u); setAlpha(alpha, P["ecd"], 1 - 0.4 * u); caption = "4 · Addicted cells stall and die; resistance mutations are the next chapter"; }
    return { caption, labels: [{ at: [-1.4, 2.1, 0], text: "Mutant kinase (EGFR, ALK, KRAS…)" }, { at: [-2.5, 0.9, 0.4], text: "Cell membrane" }, ...nodes.map((n, i) => ({ at: [n[0], n[1] - 0.3, 0] as Vec3, text: names[i] })), { at: [2.6, -0.9, 0], text: "Nucleus: divide!" }] };
  });
}

// ---------------------------------------------------------------- ADCs (reuse the technology animation via schematics registry)
// (adcs front maps to ANIMATED["adc"] in FRONT_ANIMATED below.)

// ---------------------------------------------------------------- immunotherapy
export function immunotherapyFront(): Mesh {
  const sc = scene();
  const TC0: Vec3 = [-2.8, 0.1, 0], TC1: Vec3 = [-1.3, 0, 0], TUM: Vec3 = [1.3, 0, 0];
  put(sc, "t", cell(0.9, "soft"), { at: TC0 });
  put(sc, "tNuc", sphere(0.3, 3, 8, "soft"), { at: TC0 });
  put(sc, "tum", cell(0.9, "hot"), { at: TUM });
  put(sc, "tumNuc", sphere(0.3, 3, 8, "soft", true), { at: TUM });
  put(sc, "tcr", line([-0.4, -0.25, 0], [0.4, -0.25, 0], "soft"));
  put(sc, "pd1", line([-0.4, 0.3, 0], [-0.05, 0.3, 0]));
  put(sc, "pdl1", line([0.4, 0.3, 0], [0.05, 0.3, 0]));
  put(sc, "brake", line([-0.05, 0.3, 0], [0.05, 0.3, 0], "hot"));
  const AB0: Vec3 = [-0.3, 2.1, 0.3], AB1: Vec3 = [-0.25, 0.75, 0];
  put(sc, "ab", antibody(0.45, "accent", 0.9), { at: AB0, rotZ: Math.PI });
  put(sc, "gran", dots([[-0.55, 0.05, 0.1], [-0.5, -0.15, -0.1], [-0.65, 0.2, 0.05]], "accent"));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, P["gran"]);
    let caption = "";
    const tAt = (u: number) => { moveTo(pts, base, P["t"], TC0, TC1, u); moveTo(pts, base, P["tNuc"], TC0, TC1, u); };
    if (t < 0.2) { tAt(phase(t, 0, 0.2)); setAlpha(alpha, P["tcr"], 0); setAlpha(alpha, P["pd1"], 0); setAlpha(alpha, P["pdl1"], 0); setAlpha(alpha, P["brake"], 0); setAlpha(alpha, P["ab"], 0); caption = "1 · A T cell patrols and recognises tumour antigen"; }
    else if (t < 0.38) { tAt(1); setAlpha(alpha, P["ab"], 0); setAlpha(alpha, P["brake"], pulse(t)); caption = "2 · The tumour shows PD-L1: the PD-1 brake switches the T cell off"; }
    else if (t < 0.58) { tAt(1); const u = phase(t, 0.38, 0.58); moveTo(pts, base, P["ab"], AB0, AB1, u); setAlpha(alpha, P["brake"], 1 - 0.5 * u); caption = "3 · A checkpoint antibody (or vaccine, engager, virus) intervenes"; }
    else if (t < 0.8) { tAt(1); moveTo(pts, base, P["ab"], AB0, AB1, 1); const u = phase(t, 0.58, 0.8); setAlpha(alpha, P["brake"], 0); movePart(pts, base, P["pdl1"], [0.12, 0, 0]); setAlpha(alpha, P["gran"], 1); movePart(pts, base, P["gran"], [lerp(0, 1.6, u), 0, 0], 1 - 0.3 * u); setAlpha(alpha, P["tcr"], pulse(t, 5)); caption = "4 · Brake released: the T cell activates and kills"; }
    else { tAt(1); moveTo(pts, base, P["ab"], AB0, AB1, 1); setAlpha(alpha, P["brake"], 0); movePart(pts, base, P["pdl1"], [0.12, 0, 0]); const u = phase(t, 0.8, 1); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.5 * u); setAlpha(alpha, P["tum"], 1 - 0.6 * u); setAlpha(alpha, P["tumNuc"], pulse(t, 6)); caption = "5 · Memory: the same T cells can keep the cancer down for years"; }
    return { caption, labels: [{ at: [t < 0.2 ? lerp(TC0[0], TC1[0], phase(t, 0, 0.2)) : TC1[0], 0.95, 0], text: "T cell" }, { at: [TUM[0], 0.95, 0], text: "Tumour cell (PD-L1)" }, ...(t >= 0.38 ? [{ at: AB1, text: "Checkpoint antibody" }] : [])] };
  });
}

// ---------------------------------------------------------------- cell therapy
export function cellTherapyFront(): Mesh {
  const sc = scene();
  put(sc, "patient", figure("soft"), { at: [-2.6, 0, 0] });
  put(sc, "tube", cylinder(0.3, 1.2, 12, 2, undefined, false, true), { at: [-1.2, 0.3, 0] });
  const TC = (i: number): Vec3 => [-1.2 + 0.12 * (i % 2), -0.1 + 0.18 * i, 0.08 * (i % 3)];
  const tcells: Part[] = [];
  for (let i = 0; i < 5; i++) tcells.push(put(sc, `tc${i}`, sphere(0.16, 3, 8, "soft", true), { at: TC(i) }));
  const cars: Part[] = [];
  for (let i = 0; i < 5; i++) cars.push(put(sc, `car${i}`, line([0, 0, 0], [0.22, 0.1, 0], "accent"), { at: sum(TC(i), [0.14, 0, 0]) }));
  put(sc, "vector", icosahedron(0.22, "accent", true), { at: [0.2, 1.6, 0] });
  const CL0 = (i: number): Vec3 => [0.6 + 0.3 * (i % 4), -0.4 + 0.3 * Math.floor(i / 4), 0.1 * (i % 2)];
  const CL1 = (i: number): Vec3 => [2.2 + 0.25 * Math.cos(i), -0.2 + 0.25 * Math.sin(i), 0.2 * Math.sin(i * 2)];
  const clones: Part[] = [];
  for (let i = 0; i < 12; i++) clones.push(put(sc, `cl${i}`, sphere(0.14, 2, 6, "soft", true), { at: CL0(i) }));
  put(sc, "tum", blob(0.5), { at: [2.6, -0.2, 0] });
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 14, (t, pts, alpha) => {
    hide(alpha, ...cars, ...clones, P["vector"]); setAlpha(alpha, P["tum"], 0.3);
    let caption = "";
    if (t < 0.2) { const u = phase(t, 0, 0.2); tcells.forEach((c, i) => moveTo(pts, base, c, [-2.4, 0.4, 0], TC(i), u)); caption = "1 · The patient's own T cells are collected from the blood (apheresis)"; }
    else if (t < 0.42) { const u = phase(t, 0.2, 0.42); setAlpha(alpha, P["vector"], 1); moveTo(pts, base, P["vector"], [0.2, 1.6, 0], [-1.1, 0.7, 0], u, 1, u * 4); cars.forEach((c, i) => setAlpha(alpha, c, Math.max(0, Math.min(1, u * 5 - i)))); caption = "2 · A viral vector (or LNP) inserts the CAR gene: a synthetic antigen receptor"; }
    else if (t < 0.65) { movePart(pts, base, P["vector"], [-1.3, -0.9, 0], 1, 4); setAlpha(alpha, P["vector"], 0.2); cars.forEach((c) => setAlpha(alpha, c, 1)); const u = phase(t, 0.42, 0.65); clones.forEach((c, i) => setAlpha(alpha, c, Math.max(0, Math.min(1, u * 12 - i)))); caption = "3 · Engineered cells are multiplied into billions over about two weeks"; }
    else if (t < 0.85) { cars.forEach((c) => setAlpha(alpha, c, 1)); const u = phase(t, 0.65, 0.85); clones.forEach((c, i) => { setAlpha(alpha, c, 1); moveTo(pts, base, c, CL0(i), CL1(i), u); }); setAlpha(alpha, P["tum"], 1); caption = "4 · After lymphodepletion the living drug is infused and homes to the tumour"; }
    else { cars.forEach((c) => setAlpha(alpha, c, 1)); const u = phase(t, 0.85, 1); clones.forEach((c, i) => { setAlpha(alpha, c, 1); moveTo(pts, base, c, CL0(i), CL1(i), 1); }); setAlpha(alpha, P["tum"], 1 - 0.6 * u); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.45 * u); caption = "5 · Serial killing, then persistence: one infusion, possibly years of control"; }
    return { caption, labels: [{ at: [-2.6, 1.15, 0], text: "Patient" }, ...(t > 0.2 && t < 0.65 ? [{ at: [-1.2, 1.05, 0] as Vec3, text: "CAR added" }] : []), ...(t > 0.42 && t < 0.85 ? [{ at: [1.0, 0.75, 0] as Vec3, text: "Expansion" }] : []), ...(t > 0.65 ? [{ at: [2.6, 0.45, 0] as Vec3, text: "Tumour" }] : [])] };
  });
}

// ---------------------------------------------------------------- radiopharma (theranostic pair)
export function radiopharmaFront(): Mesh {
  const sc = scene();
  const CELL: Vec3 = [0.6, 0, 0];
  put(sc, "cell", cell(1.0), { at: CELL });
  put(sc, "nuc", sphere(0.35, 3, 8, "soft", true), { at: [CELL[0] + 0.1, 0.05, 0] });
  for (let i = 0; i < 5; i++) { const a = (TAU * i) / 5; put(sc, `rec${i}`, receptor([CELL[0] + Math.cos(a), 0.1, Math.sin(a)], 0.2)); }
  const L0: Vec3 = [-2.2, 0.8, 0.3], DOCK: Vec3 = [CELL[0] - 1.2, 0.1, 0];
  const LB0: Vec3 = [L0[0], L0[1] - 0.7, L0[2]];
  put(sc, "ligA", octahedron(0.1, "accent", true), { at: L0 });
  put(sc, "ligB", octahedron(0.1, "hot", true), { at: LB0 });
  const ph1 = put(sc, "ph1", line([DOCK[0], DOCK[1], 0], [DOCK[0] - 1.3, DOCK[1] + 1.0, 0], "accent"));
  const ph2 = put(sc, "ph2", line([DOCK[0], DOCK[1], 0], [DOCK[0] + 1.3, DOCK[1] - 1.0, 0], "accent"));
  const trackB = put(sc, "trackB", polyline([[DOCK[0], DOCK[1], 0], [DOCK[0] + 0.5, 0.4, 0.3], [DOCK[0] + 1.0, 0.1, 0.5], [DOCK[0] + 1.6, 0.5, 0.1]], "hot"));
  const trackA = put(sc, "trackA", polyline([[DOCK[0], DOCK[1], 0], [DOCK[0] + 0.35, 0.15, 0.05]], "hot"));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, ph1, ph2, trackB, trackA, P["ligB"]);
    let caption = "";
    if (t < 0.28) { const u = phase(t, 0, 0.28); moveTo(pts, base, P["ligA"], L0, DOCK, u, 1, t * 10); caption = "1 · A ligand that fits PSMA, SSTR or FAP carries a positron emitter (⁶⁸Ga, ¹⁸F)"; }
    else if (t < 0.48) { moveTo(pts, base, P["ligA"], L0, DOCK, 1, 1, 3); const u = phase(t, 0.28, 0.48); grow(alpha, ph1, u); grow(alpha, ph2, u); setAlpha(alpha, P["rec0"], pulse(t)); caption = "2 · SEE: PET photons map every lesion that carries the target"; }
    else if (t < 0.7) { const u = phase(t, 0.48, 0.7); moveTo(pts, base, P["ligA"], L0, DOCK, 1, 1 - 0.7 * u, 3); setAlpha(alpha, P["ligA"], 1 - u); setAlpha(alpha, P["ligB"], 1); moveTo(pts, base, P["ligB"], LB0, DOCK, u, 1, t * 10); caption = "3 · TREAT: the same ligand, now carrying ¹⁷⁷Lu (β) or ²²⁵Ac (α)"; }
    else if (t < 0.88) { setAlpha(alpha, P["ligA"], 0); setAlpha(alpha, P["ligB"], 1); moveTo(pts, base, P["ligB"], LB0, DOCK, 1, 1, 3); const u = phase(t, 0.7, 0.88); grow(alpha, trackB, u); grow(alpha, trackA, u); setAlpha(alpha, P["nuc"], pulse(t, 6)); caption = "4 · Decay inside the cell: β tracks reach neighbours (crossfire), α tracks stay short and dense"; }
    else { setAlpha(alpha, P["ligA"], 0); setAlpha(alpha, P["ligB"], 1); moveTo(pts, base, P["ligB"], LB0, DOCK, 1, 1, 3); setAlpha(alpha, trackB, 1); setAlpha(alpha, trackA, 1); const u = phase(t, 0.88, 1); movePart(pts, base, P["cell"], [0, 0, 0], 1 - 0.1 * u); setAlpha(alpha, P["cell"], 1 - 0.4 * u); caption = "5 · Imaging after therapy shows the dose delivered: see, treat, verify"; }
    return { caption, labels: [{ at: [CELL[0], 1.05, 0], text: "Receptor-positive cell" }, { at: DOCK, text: t < 0.48 ? "Imaging ligand" : "Therapy ligand" }] };
  });
}

// ---------------------------------------------------------------- hormonal
export function hormonalFront(): Mesh {
  const sc = scene();
  put(sc, "cell", cell(1.2));
  put(sc, "nuc", sphere(0.5, 4, 8, "soft", true), { at: [0.2, 0, 0] });
  const locks: Vec3[] = [[-0.35, 0.35, 0.2], [-0.2, -0.3, 0.25], [0.1, 0.45, -0.2]];
  const lockP: Part[] = locks.map((l, i) => put(sc, `lock${i}`, ring(0.14, 12, undefined, "z"), { at: l }));
  const KEY0 = (i: number): Vec3 => [-2.6 + 0.3 * i, 1.4 - 0.6 * i, 0.3];
  const KEY1 = (i: number): Vec3 => [locks[i][0] - 0.2, locks[i][1], locks[i][2]];
  const keys: Part[] = locks.map((_, i) => put(sc, `key${i}`, keyShape(0.7, "hot"), { at: KEY0(i) }));
  const gene = put(sc, "gene", line([0.0, -0.05, 0], [0.4, -0.05, 0], "accent"));
  const DRUG0: Vec3 = [2.2, 1.8, 0.2], DRUG1: Vec3 = [locks[0][0], locks[0][1], locks[0][2] + 0.05];
  const drug = put(sc, "drug", octahedron(0.16, "accent", true), { at: DRUG0 });
  const bin = put(sc, "bin", cylinder(0.28, 0.55, 10, 3, "soft", true, true), { at: [2.2, -1.3, 0] });
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, drug, bin); setAlpha(alpha, gene, 0);
    let caption = "";
    if (t < 0.3) { const u = phase(t, 0, 0.3); keys.forEach((k, i) => moveTo(pts, base, k, KEY0(i), KEY1(i), u)); setAlpha(alpha, gene, u > 0.7 ? pulse(t, 5) : u); caption = "1 · Hormone 'keys' (oestrogen, androgen) fit receptor 'locks' and switch growth genes on"; }
    else if (t < 0.5) { keys.forEach((k, i) => moveTo(pts, base, k, KEY0(i), KEY1(i), 1)); setAlpha(alpha, gene, pulse(t, 5)); const u = phase(t, 0.3, 0.5); keys.forEach((k) => setAlpha(alpha, k, 1 - 0.7 * u)); caption = "2 · Cut the key supply: aromatase inhibitors, ovarian suppression, castration"; }
    else if (t < 0.75) { const u = phase(t, 0.5, 0.75); keys.forEach((k, i) => { moveTo(pts, base, k, KEY0(i), KEY1(i), 1); setAlpha(alpha, k, 0.3 * (1 - u)); }); setAlpha(alpha, drug, 1); moveTo(pts, base, drug, DRUG0, DRUG1, u, 1, u * 6); setAlpha(alpha, gene, 0.3 * (1 - u)); caption = "3 · Or jam the lock: tamoxifen, enzalutamide block the receptor"; }
    else { keys.forEach((k) => setAlpha(alpha, k, 0)); setAlpha(alpha, drug, 1); const u = phase(t, 0.75, 1); moveTo(pts, base, drug, DRUG0, DRUG1, 1, 1, 6); setAlpha(alpha, bin, 1); lockP.forEach((l, i) => { moveTo(pts, base, l, locks[i], [2.2, -1.3 + 0.1 * i, 0], u, 1 - 0.5 * u); setAlpha(alpha, l, 1 - 0.6 * u); }); setAlpha(alpha, gene, 0); caption = "4 · Or remove the lock: SERDs and PROTAC degraders send the receptor to the proteasome"; }
    return { caption, labels: [{ at: [0, 1.35, 0], text: "Hormone-driven cancer cell" }, ...(t < 0.75 ? [{ at: locks[0], text: "Receptor" }] : [{ at: [2.2, -0.85, 0] as Vec3, text: "Proteasome" }])] };
  });
}

// ---------------------------------------------------------------- epigenetics
export function epigeneticsFront(): Mesh {
  const sc = scene();
  const spools: Part[] = [];
  const marks: Part[] = [];
  for (let i = 0; i < 4; i++) {
    const at: Vec3 = [-1.8 + 1.2 * i, 0, 0];
    spools.push(put(sc, `sp${i}`, cylinder(0.32, 0.4, 14, 2, "soft", false, true), { at, rotX: Math.PI / 2 }));
    put(sc, `wrap${i}`, helix(0.4, 0.3, 1.6, 24), { at, rotX: Math.PI / 2 });
    marks.push(put(sc, `mk${i}`, dots([[at[0] + 0.2, at[1] + 0.45, 0.1], [at[0] - 0.15, at[1] + 0.5, -0.1]], "hot")));
  }
  for (let i = 0; i < 3; i++) put(sc, `link${i}`, line([-1.8 + 1.2 * i + 0.4, 0.05, 0], [-1.8 + 1.2 * (i + 1) - 0.4, -0.05, 0], "soft"));
  const gene = put(sc, "gene", polyline([[-1.0, -0.9, 0], [-0.4, -0.9, 0], [0.2, -0.9, 0]], "accent"));
  const reader = put(sc, "reader", sphere(0.18, 3, 8, "accent", true), { at: [-1.0, -0.9, 0.15] });
  const DRUG0: Vec3 = [2.3, 1.4, 0.3], DRUG1: Vec3 = [0.6, 0.55, 0.1];
  const drug = put(sc, "drug", octahedron(0.14, "accent", true), { at: DRUG0 });
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, drug, gene, reader);
    let caption = "";
    if (t < 0.25) { marks.forEach((m) => setAlpha(alpha, m, pulse(t, 3))); spools.forEach((s) => movePart(pts, base, s, [0, 0, 0], 1 - 0.1 * phase(t, 0, 0.25))); caption = "1 · DNA is wound on histone spools; chemical marks decide what is readable"; }
    else if (t < 0.5) { marks.forEach((m) => setAlpha(alpha, m, 1)); spools.forEach((s) => movePart(pts, base, s, [0, 0, 0], 0.9)); setAlpha(alpha, gene, 0.3); caption = "2 · In cancer, wrong marks silence tumour suppressors and lock in a bad identity"; }
    else if (t < 0.75) { const u = phase(t, 0.5, 0.75); setAlpha(alpha, drug, 1); moveTo(pts, base, drug, DRUG0, DRUG1, u, 1, u * 6); marks.forEach((m, i) => setAlpha(alpha, m, 1 - Math.max(0, Math.min(1, u * 4 - i)))); spools.forEach((s) => movePart(pts, base, s, [0, 0, 0], 0.9 + 0.15 * u)); setAlpha(alpha, gene, 0.3); caption = "3 · Epigenetic drugs (DNMT, HDAC, EZH2, menin, IDH) erase or block the marks"; }
    else { setAlpha(alpha, drug, 1); moveTo(pts, base, drug, DRUG0, DRUG1, 1, 1, 6); marks.forEach((m) => setAlpha(alpha, m, 0)); spools.forEach((s) => movePart(pts, base, s, [0, 0, 0], 1.05)); const u = phase(t, 0.75, 1); grow(alpha, gene, u); setAlpha(alpha, reader, 1); moveTo(pts, base, reader, [-1.0, -0.9, 0.15], [0.2, -0.9, 0.15], u); caption = "4 · The chromatin opens; silenced genes are read again and cells differentiate or die"; }
    return { caption, labels: [{ at: [0, 0.8, 0], text: "Histone spools (nucleosomes)" }, ...(t > 0.75 ? [{ at: [-0.4, -1.2, 0] as Vec3, text: "Gene switched back on" }] : [])] };
  });
}

// ---------------------------------------------------------------- supportive care
export function supportiveFront(): Mesh {
  const sc = scene();
  put(sc, "fig", figure(), { at: [0, 0, 0] });
  put(sc, "cap", ellipsoid(0.21, 0.13, 0.21, 3, 10, "accent", true), { at: [0, 0.92, 0] });
  // ECG trace
  const ecgPts: Vec3[] = []; for (let i = 0; i <= 30; i++) { const x = -2.3 + (1.5 * i) / 30; const k = i % 15; const y = k === 6 ? 0.35 : k === 7 ? -0.15 : k === 5 ? -0.05 : 0; ecgPts.push([x, 1.1 + y, 0]); }
  const ecg = put(sc, "ecg", polyline(ecgPts, "hot"));
  const heart = put(sc, "heart", sphere(0.12, 3, 8, "hot", true), { at: [-0.08, 0.35, 0.1] });
  // walking path + steps
  const path = put(sc, "path", polyline([[0.8, -0.85, 0], [1.4, -0.85, 0.2], [2.0, -0.85, 0], [2.6, -0.85, -0.2]], "soft"));
  const steps: Part[] = []; for (let i = 0; i < 4; i++) steps.push(put(sc, `st${i}`, dots([[0.9 + 0.5 * i, -0.8, 0.05 * (i % 2)]], "accent")));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 12, (t, pts, alpha) => {
    let caption = "";
    const walk = Math.sin(t * TAU * 3) * 0.06;
    movePart(pts, base, P["fig"], [0, walk, 0]);
    movePart(pts, base, P["cap"], [0, walk, 0]);
    movePart(pts, base, heart, [0, walk, 0], 1 + 0.25 * Math.max(0, Math.sin(t * TAU * 6)));
    grow(alpha, ecg, (t * 2) % 1);
    steps.forEach((s, i) => setAlpha(alpha, s, ((t * 4 + i * 0.25) % 1) < 0.5 ? 1 : 0.25));
    if (t < 0.25) { setAlpha(alpha, P["cap"], pulse(t)); caption = "1 · Protect what treatment threatens: scalp cooling saves hair during chemotherapy"; }
    else if (t < 0.5) { setAlpha(alpha, ecg, 1); caption = "2 · Cardio-oncology watches the heart through anthracyclines, HER2 drugs and immunotherapy"; }
    else if (t < 0.75) { setAlpha(alpha, path, 1); caption = "3 · Exercise, nutrition and geriatric assessment change tolerance and, in colon cancer, survival"; }
    else { caption = "4 · Survivorship: late effects, fertility, work, and money are part of the plan"; }
    return { caption, labels: [{ at: [-1.6, 1.45, 0], text: "ECG" }, { at: [0, 1.25, 0], text: "Cooling cap" }, { at: [1.7, -1.15, 0], text: "Daily activity" }] };
  });
}

// ---------------------------------------------------------------- AI & computation
export function aiFront(): Mesh {
  const sc = scene();
  // slide/scan grid on the left
  const tiles: Part[] = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) tiles.push(put(sc, `tile${i}${j}`, box(0.28, 0.28, 0.02, "soft"), { at: [-2.4 + 0.32 * i, 0.5 - 0.32 * j, 0] }));
  const hot = put(sc, "hot", box(0.28, 0.28, 0.03, "hot", true), { at: [-2.4 + 0.32 * 2, 0.5 - 0.32 * 1, 0.02] });
  // network layers
  const layers = [4, 6, 6, 3];
  const nodes: Part[][] = layers.map((n, li) => Array.from({ length: n }, (_, k) => put(sc, `n${li}${k}`, octahedron(0.07, undefined, true), { at: [-0.6 + 0.8 * li, (k - (n - 1) / 2) * 0.35, 0] })));
  const edges: Part[] = [];
  for (let li = 0; li + 1 < layers.length; li++) for (let a = 0; a < layers[li]; a++) for (let b = 0; b < layers[li + 1]; b++) if ((a + b) % 2 === 0) edges.push(put(sc, `e${li}${a}${b}`, line([-0.6 + 0.8 * li, (a - (layers[li] - 1) / 2) * 0.35, 0], [-0.6 + 0.8 * (li + 1), (b - (layers[li + 1] - 1) / 2) * 0.35, 0], "soft")));
  // prediction bars
  const bars: Part[] = [0.85, 0.35, 0.15].map((h, i) => put(sc, `bar${i}`, box(0.25, h, 0.2, i === 0 ? "accent" : "soft", true), { at: [2.4, -0.6 + h / 2, -0.4 + 0.4 * i] }));

  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, ...bars, hot);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); tiles.forEach((tl, i) => setAlpha(alpha, tl, Math.max(0, Math.min(1, u * 16 - i)))); edges.forEach((e) => setAlpha(alpha, e, 0.2)); caption = "1 · A whole-slide image or CT is cut into thousands of tiles"; }
    else if (t < 0.55) { const u = phase(t, 0.25, 0.55); const wave = u * (layers.length + 1); edges.forEach((e, k) => { const li = Math.floor(k / (edges.length / (layers.length - 1))); setAlpha(alpha, e, 0.2 + 0.8 * Math.max(0, Math.min(1, wave - li))); }); nodes.forEach((layer, li) => layer.forEach((nd) => setAlpha(alpha, nd, 0.4 + 0.6 * Math.max(0, Math.min(1, wave - li))))); caption = "2 · A foundation model turns pixels into features layer by layer"; }
    else if (t < 0.8) { edges.forEach((e) => setAlpha(alpha, e, 0.6)); const u = phase(t, 0.55, 0.8); bars.forEach((b, i) => setAlpha(alpha, b, Math.max(0, Math.min(1, u * 3 - i)))); caption = "3 · Output: a prediction (grade, molecular status, risk, likely benefit) with a confidence"; }
    else { edges.forEach((e) => setAlpha(alpha, e, 0.6)); bars.forEach((b) => setAlpha(alpha, b, 1)); const u = phase(t, 0.8, 1); setAlpha(alpha, hot, u > 0.3 ? pulse(t, 4) : u); caption = "4 · Attention maps point back to the tiles that drove the call; a human reviews"; }
    return { caption, labels: [{ at: [-1.9, 0.95, 0], text: "Slide / scan tiles" }, { at: [0.6, 1.3, 0], text: "Neural network" }, ...(t > 0.55 ? [{ at: [2.4, 0.6, 0] as Vec3, text: "Prediction" }] : [])] };
  });
}

// ---------------------------------------------------------------- drug discovery
export function discoveryFront(): Mesh {
  const sc = scene();
  const wells: Part[] = [];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) wells.push(put(sc, `w${i}${j}`, ring(0.11, 8, "soft", "y"), { at: [-2.4 + 0.3 * i, -0.4 + 0.3 * j, 0] }));
  const hits = [7, 13, 18].map((k, i) => put(sc, `hit${i}`, sphere(0.09, 2, 6, "hot", true), { at: [-2.4 + 0.3 * Math.floor(k / 4), -0.4 + 0.3 * (k % 4), 0.02] }));
  put(sc, "protein", ellipsoid(0.75, 0.9, 0.6, 5, 12, undefined, true), { at: [0.9, 0.2, 0] });
  const pocket = put(sc, "pocket", ring(0.25, 14, "hot", "z"), { at: [1.55, 0.35, 0.02] });
  const frags: Part[] = [];
  const F0: Vec3[] = [[2.5, 1.5, 0.3], [2.65, 0.4, -0.3], [2.45, -0.85, 0.2]];
  const F1 = (i: number): Vec3 => [1.55 + 0.08 * (i - 1), 0.35 + 0.06 * (i - 1), 0.05];
  F0.forEach((f, i) => frags.push(put(sc, `fr${i}`, octahedron(0.08, "accent", true), { at: f })));
  const bond = put(sc, "bond", polyline([[1.45, 0.45, 0.05], [1.6, 0.3, 0.05], [1.7, 0.45, 0.05]], "accent"));
  const base = sc.mesh.points;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, ...hits, bond);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); wells.forEach((w, i) => setAlpha(alpha, w, Math.max(0, Math.min(1, u * 24 - i)))); caption = "1 · CRISPR screens knock out every gene in cancer cell lines (DepMap)"; }
    else if (t < 0.45) { const u = phase(t, 0.25, 0.45); hits.forEach((h, i) => setAlpha(alpha, h, Math.max(0, Math.min(1, u * 3 - i)) * pulse(t, 3))); caption = "2 · Hits: genes the cancer cannot live without, especially in a given genetic context"; }
    else if (t < 0.75) { hits.forEach((h) => setAlpha(alpha, h, 1)); const u = phase(t, 0.45, 0.75); setAlpha(alpha, pocket, pulse(t)); frags.forEach((f, i) => moveTo(pts, base, f, F0[i], F1(i), u, 1, u * 5)); caption = "3 · Structure and AI design molecules that fit the target's pocket"; }
    else { hits.forEach((h) => setAlpha(alpha, h, 1)); frags.forEach((f, i) => moveTo(pts, base, f, F0[i], F1(i), 1, 1, 5)); const u = phase(t, 0.75, 1); grow(alpha, bond, u); setAlpha(alpha, pocket, 1); caption = "4 · Organoids and PDX models test them before the first patient"; }
    return { caption, labels: [{ at: [-1.7, 0.95, 0], text: "Gene screen" }, { at: [0.9, 1.3, 0], text: "Target protein" }, ...(t > 0.45 ? [{ at: [2.2, 1.1, 0] as Vec3, text: "Designed molecule" }] : [])] };
  });
}

// ---------------------------------------------------------------- prevention
export function preventionFront(): Mesh {
  const sc = scene();
  put(sc, "fig", figure("soft"), { at: [0, 0, 0] });
  const V0: Vec3 = [-2.3, 1.1, 0.3], V1: Vec3 = [-0.55, 0.5, 0.2];
  put(sc, "virus", icosahedron(0.3, "hot", true), { at: V0 });
  // syringe: tip at the upper arm, barrel pointing up and to the right
  const needle = put(sc, "needle", syringe(0.85, "accent"), { at: [0.44, 0.3, 0.06], rotZ: -Math.PI / 4 });
  const abs: Part[] = [];
  for (let i = 0; i < 6; i++) { const a = (TAU * i) / 6; abs.push(put(sc, `ab${i}`, antibody(0.22, "accent"), { at: [0.9 * Math.cos(a), 0.5 + 0.7 * Math.sin(a), 0.2], rotZ: a - Math.PI / 2 })); }
  const shield = put(sc, "shield", ring(1.15, 28, "accent", "z"), { at: [0, 0.2, 0] });
  const base = sc.mesh.points, P = sc.parts;
  const AWAY: Vec3 = [V1[0] - V0[0] - 3.0, V1[1] - V0[1], 0];
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, needle, ...abs, shield);
    let caption = "";
    if (t < 0.25) { const u = phase(t, 0, 0.25); moveTo(pts, base, P["virus"], V0, V1, u, 1, t * 8); caption = "1 · Some cancers start with an infection: HPV, hepatitis B, H. pylori"; }
    else if (t < 0.5) { movePart(pts, base, P["virus"], AWAY, 1, 2); setAlpha(alpha, P["virus"], 0.25); const u = phase(t, 0.25, 0.5); setAlpha(alpha, needle, u); movePart(pts, base, needle, [0.25 * (1 - u), 0.25 * (1 - u), 0]); caption = "2 · A vaccine (or a test for an inherited BRCA or Lynch variant) comes first"; }
    else if (t < 0.75) { movePart(pts, base, P["virus"], AWAY, 1, 2); setAlpha(alpha, P["virus"], 0.25); setAlpha(alpha, needle, 0.3); const u = phase(t, 0.5, 0.75); abs.forEach((a, i) => setAlpha(alpha, a, Math.max(0, Math.min(1, u * 6 - i)))); caption = "3 · Antibodies (or risk-reducing surgery, aspirin, tamoxifen) stand guard"; }
    else { abs.forEach((a) => setAlpha(alpha, a, 1)); setAlpha(alpha, needle, 0.2); const u = phase(t, 0.75, 1); setAlpha(alpha, shield, u); movePart(pts, base, shield, [0, 0, 0], 1 + 0.05 * Math.sin(t * TAU * 4)); setAlpha(alpha, P["virus"], 1); moveTo(pts, base, P["virus"], [V0[0], V1[1], 0], [-1.4, 0.7, 0.2], u, 1, t * 8); caption = "4 · The virus bounces off: cervical cancer is disappearing in vaccinated cohorts"; }
    return { caption, labels: [{ at: [0, 1.15, 0], text: "Person at risk" }, ...(t < 0.25 || t > 0.75 ? [{ at: [-1.6, 1.3, 0] as Vec3, text: "Oncogenic virus" }] : []), ...(t > 0.5 ? [{ at: [1.2, -0.4, 0] as Vec3, text: "Immunity / risk reduction" }] : [])] };
  });
}

// ---------------------------------------------------------------- devices
export function devicesFront(): Mesh {
  const sc = scene();
  put(sc, "head", ellipsoid(0.9, 1.1, 0.95, 6, 14, "soft", true));
  put(sc, "tum", blob(0.3), { at: [0.25, 0.2, 0.2] });
  const pads: Part[] = [];
  const PADS: Array<{ at: Vec3; rot: [number, number] }> = [{ at: [0.95, 0.1, 0], rot: [0, Math.PI / 2] }, { at: [-0.95, 0.1, 0], rot: [0, -Math.PI / 2] }, { at: [0, 0.2, 0.98], rot: [0, 0] }, { at: [0, 0.2, -0.98], rot: [0, Math.PI] }];
  PADS.forEach((p, i) => pads.push(put(sc, `pad${i}`, box(0.5, 0.5, 0.06, "accent", true), { at: p.at, rotY: p.rot[1] })));
  const fieldX: Part[] = []; const fieldZ: Part[] = [];
  for (let i = 0; i < 5; i++) { const y = -0.3 + 0.2 * i; fieldX.push(put(sc, `fx${i}`, polyline([[-0.9, y, 0], [-0.4, y + 0.08, 0.1], [0.4, y - 0.08, -0.1], [0.9, y, 0]], "hot"))); fieldZ.push(put(sc, `fz${i}`, polyline([[0, y, -0.95], [0, y + 0.08, -0.4], [0, y - 0.08, 0.4], [0, y, 0.95]], "hot"))); }
  put(sc, "spindle", polyline([[0.05, 0.2, 0.2], [0.45, 0.2, 0.2]], "soft"));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 12, (t, pts, alpha) => {
    let caption = "";
    const ph = Math.sin(t * TAU * 6) > 0;
    fieldX.forEach((f) => setAlpha(alpha, f, ph ? 0.9 : 0.1)); fieldZ.forEach((f) => setAlpha(alpha, f, ph ? 0.1 : 0.9));
    if (t < 0.25) { fieldX.forEach((f) => setAlpha(alpha, f, 0)); fieldZ.forEach((f) => setAlpha(alpha, f, 0)); pads.forEach((p, i) => setAlpha(alpha, p, phase(t, 0.05 * i, 0.1 + 0.05 * i))); caption = "1 · Wearable transducer arrays are placed around the tumour (TTFields, hyperthermia, HIFU…)"; }
    else if (t < 0.55) { caption = "2 · Alternating electric fields (~200 kHz) switch direction many times a second"; }
    else if (t < 0.8) { const u = phase(t, 0.55, 0.8); movePart(pts, base, P["spindle"], [0, 0.15 * Math.sin(u * 10), 0]); setAlpha(alpha, P["spindle"], 1 - 0.7 * u); setAlpha(alpha, P["tum"], pulse(t, 3)); caption = "3 · Dividing cells cannot align their spindle or split; normal cells barely notice"; }
    else { const u = phase(t, 0.8, 1); setAlpha(alpha, P["spindle"], 0.2); movePart(pts, base, P["tum"], [0, 0, 0], 1 - 0.35 * u); setAlpha(alpha, P["tum"], 1 - 0.5 * u); caption = "4 · Worn 18+ hours a day; other devices use heat, sound, or light the same way"; }
    return { caption, labels: [{ at: [0, 1.35, 0], text: "Head (glioblastoma) or torso" }, { at: [1.3, 0.1, 0], text: "Transducer array" }] };
  });
}

// ---------------------------------------------------------------- nutrition & lifestyle
export function nutritionFront(): Mesh {
  const sc = scene();
  put(sc, "fig", figure("soft"), { at: [0, 0, 0] });
  const A0: Vec3 = [-2.4, 0.9, 0.2], A1: Vec3 = [-1.3, 0.9, 0.2];
  const apple = put(sc, "apple", sphere(0.28, 4, 8, "accent", true), { at: A0 });
  const stem = put(sc, "stem", polyline([[A0[0], A0[1] + 0.28, A0[2]], [A0[0] + 0.1, A0[1] + 0.5, A0[2]]], "accent"));
  const plate = put(sc, "plate", disc(0.55, 20, "accent", "y"), { at: [-1.3, -0.1, 0.2] });
  const food = put(sc, "food", dots([[-1.5, 0, 0.1], [-1.2, 0.05, 0.3], [-1.35, -0.02, 0.35], [-1.1, 0.02, 0.05]], "accent"));
  const track = put(sc, "track", polyline([[-2.0, -1.25, 0], [2.0, -1.25, 0]], "accent"));
  const weights = [put(sc, "w0", box(0.22, 0.22, 0.22, "accent", true), { at: [1.4, 0.6, 0.2] }), put(sc, "w1", box(0.22, 0.22, 0.22, "accent", true), { at: [2.0, 0.6, 0.2] })];
  const bar = put(sc, "bar", line([1.4, 0.6, 0.2], [2.0, 0.6, 0.2], "accent"));
  const gut: Part[] = [];
  for (let i = 0; i < 10; i++) { const a = (TAU * i) / 10; gut.push(put(sc, `gut${i}`, sphere(0.06, 3, 6, "accent"), { at: [0.45 * Math.cos(a), -0.15 + 0.3 * Math.sin(a), 0.35] })); }
  const TC0 = (i: number): Vec3 => [1.0 + 0.35 * i, -0.2 + 0.25 * Math.sin(i * 1.7), 0.3];
  const tcells: Part[] = [];
  for (let i = 0; i < 4; i++) tcells.push(put(sc, `tc${i}`, icosahedron(0.12, "accent", true), { at: TC0(i) }));
  const tum = put(sc, "tum", blob(0.32), { at: [0.35, 0.1, 0.35] });
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 12, (t, pts, alpha) => {
    hide(alpha, apple, stem, plate, food, track, ...weights, bar, ...gut, ...tcells, tum);
    let caption = "";
    if (t < 0.25) {
      const u = phase(t, 0, 0.25);
      setAlpha(alpha, apple, 1); setAlpha(alpha, stem, 1); setAlpha(alpha, plate, u); setAlpha(alpha, food, u);
      moveTo(pts, base, apple, A0, A1, u, 1, t * 6); moveTo(pts, base, stem, A0, A1, u);
      caption = "1 · What we eat, drink and weigh changes who gets cancer: about four in ten cases are preventable";
    } else if (t < 0.5) {
      const u = phase(t, 0.25, 0.5);
      setAlpha(alpha, track, 1); weights.forEach((w) => setAlpha(alpha, w, 1)); setAlpha(alpha, bar, 1);
      const bob = 0.12 * Math.sin(u * TAU * 3);
      movePart(pts, base, P["fig"], [0, bob, 0], 1);
      const lift = 0.35 * Math.abs(Math.sin(u * TAU * 1.5));
      weights.forEach((w) => movePart(pts, base, w, [0, lift, 0], 1)); movePart(pts, base, bar, [0, lift, 0], 1);
      caption = "2 · A structured exercise programme after colon cancer treatment cut deaths in a randomised trial";
    } else if (t < 0.75) {
      const u = phase(t, 0.5, 0.75);
      gut.forEach((g, i) => { setAlpha(alpha, g, Math.min(1, u * 10 - i * 0.6)); movePart(pts, base, g, [0, 0.03 * Math.sin(t * TAU * 6 + i), 0], 1 + 0.4 * Math.sin(u * Math.PI)); });
      tcells.forEach((c, i) => { setAlpha(alpha, c, Math.max(0, Math.min(1, u * 4 - i * 0.6))); moveTo(pts, base, c, TC0(i), [0.7 + 0.15 * i, 0.2, 0.3], u, 1, t * 5); });
      setAlpha(alpha, tum, 0.9);
      caption = "3 · Fibre and a diverse gut microbiome help immunotherapy work; antibiotics and some probiotics blunt it";
    } else {
      const u = phase(t, 0.75, 1);
      setAlpha(alpha, plate, 1); setAlpha(alpha, food, 1); setAlpha(alpha, apple, 1); setAlpha(alpha, stem, 1);
      moveTo(pts, base, apple, A0, A1, 1); moveTo(pts, base, stem, A0, A1, 1);
      setAlpha(alpha, tum, 1 - u); movePart(pts, base, tum, [0, 0, 0], 1 - 0.6 * u);
      movePart(pts, base, P["fig"], [0, 0, 0], 1 + 0.06 * u);
      caption = "4 · Weight loss and muscle wasting during treatment are treatable: nutrition is part of the therapy, not an afterthought";
    }
    return { caption, labels: [{ at: [0, 1.15, 0], text: "Person" }, ...(t < 0.25 || t >= 0.75 ? [{ at: [-1.3, 1.35, 0] as Vec3, text: "Diet" }] : []), ...(t >= 0.25 && t < 0.5 ? [{ at: [1.7, 1.1, 0] as Vec3, text: "Exercise" }] : []), ...(t >= 0.5 && t < 0.75 ? [{ at: [0.5, -0.75, 0] as Vec3, text: "Gut microbiome" }, { at: [1.5, 0.35, 0] as Vec3, text: "Immune cells" }] : [])] };
  });
}

// ---------------------------------------------------------------- recovery & rejuvenation
export function rejuvenationFront(): Mesh {
  const sc = scene();
  put(sc, "fig", figure("soft"), { at: [0, 0, 0] });
  // hair: short strands on the crown, lost in phase 1 and regrown in phase 4
  const strands: Part[] = [];
  for (let i = 0; i < 7; i++) {
    const a = -0.9 + (1.8 * i) / 6;
    strands.push(put(sc, `hair${i}`, polyline([[0.14 * Math.sin(a), 0.93, 0.02], [0.2 * Math.sin(a), 1.06, 0.02], [0.27 * Math.sin(a), 1.16, 0.02]], "accent")));
  }
  const cap = put(sc, "cap", ellipsoid(0.22, 0.14, 0.22, 3, 10, "accent", true), { at: [0, 0.92, 0] });
  const ear = put(sc, "ear", ring(0.07, 8, "accent", "z"), { at: [0.17, 0.81, 0.06] });
  const heart = put(sc, "heart", sphere(0.1, 3, 6, "hot", true), { at: [-0.08, 0.36, 0.1] });
  const bone = put(sc, "bone", polyline([[0.17, -0.02, 0.06], [0.18, -0.42, 0.06], [0.2, -0.82, 0.06]], "accent"));
  const nerve = put(sc, "nerve", polyline([[-0.3, 0.54, 0.04], [-0.42, 0.26, 0.08], [-0.38, -0.05, 0.12], [-0.34, -0.2, 0.14]], "accent"));
  // fertility: a vial lowered into a store before the first dose
  const V0: Vec3 = [-1.85, 0.62, 0.2], V1: Vec3 = [-1.85, -0.18, 0.2];
  const vial = put(sc, "vial", cylinder(0.09, 0.3, 8, 2, "accent", true), { at: V0 });
  const store = put(sc, "store", box(0.5, 0.42, 0.4, "soft", true), { at: [-1.85, -0.42, 0.2] });
  // strength: a bar lifted overhead through treatment
  const W: Vec3[] = [[1.42, 0.52, 0.2], [2.02, 0.52, 0.2]];
  const weights = [put(sc, "w0", box(0.2, 0.2, 0.2, "accent", true), { at: W[0] }), put(sc, "w1", box(0.2, 0.2, 0.2, "accent", true), { at: W[1] })];
  const bar = put(sc, "bar", line(W[0], W[1], "accent"));
  // the recovery curve: what comes back, and how slowly
  const axis = put(sc, "axis", polyline([[1.05, -0.35, 0], [1.05, -1.25, 0], [2.45, -1.25, 0]], "soft"));
  const curvePts: Vec3[] = [];
  for (let i = 0; i <= 15; i++) { const u = i / 15; curvePts.push([1.05 + 1.4 * u, -1.25 + 0.78 * (1 - Math.exp(-2.6 * u)), 0]); }
  const curve = put(sc, "curve", polyline(curvePts, "accent"));
  const base = sc.mesh.points, P = sc.parts;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, cap, ear, heart, bone, nerve, vial, store, ...weights, bar, axis, curve);
    let caption = "";
    if (t < 0.25) {
      const u = phase(t, 0, 0.25);
      strands.forEach((s, i) => setAlpha(alpha, s, Math.max(0, 1 - Math.max(0, u * 9 - i))));
      setAlpha(alpha, ear, 1); setAlpha(alpha, bone, 1 - 0.6 * u); setAlpha(alpha, nerve, 1 - 0.6 * u);
      setAlpha(alpha, heart, 0.5 + 0.5 * pulse(t, 4));
      movePart(pts, base, heart, [0, 0, 0], 1 + 0.2 * Math.max(0, Math.sin(t * TAU * 6)));
      caption = "1 · Treatment takes more than the tumour: hair, hearing, fertility, bone, muscle, nerves, memory and the heart";
    } else if (t < 0.5) {
      const u = phase(t, 0.25, 0.5);
      strands.forEach((s) => setAlpha(alpha, s, 0));
      setAlpha(alpha, cap, 0.6 + 0.4 * pulse(t, 3));
      setAlpha(alpha, store, 1); setAlpha(alpha, vial, 1);
      moveTo(pts, base, vial, V0, V1, Math.min(1, u * 1.6));
      caption = "2 · Recovery begins during treatment: scalp cooling from the first infusion, fertility preservation before the first dose";
    } else if (t < 0.75) {
      const u = phase(t, 0.5, 0.75);
      strands.forEach((s) => setAlpha(alpha, s, 0));
      setAlpha(alpha, cap, 0.5);
      weights.forEach((w) => setAlpha(alpha, w, 1)); setAlpha(alpha, bar, 1);
      setAlpha(alpha, heart, 1); setAlpha(alpha, bone, 1);
      const lift = 0.3 * Math.abs(Math.sin(u * TAU * 1.5));
      weights.forEach((w) => movePart(pts, base, w, [0, lift, 0], 1)); movePart(pts, base, bar, [0, lift, 0], 1);
      movePart(pts, base, P["fig"], [0, 0.05 * Math.sin(t * TAU * 5), 0]);
      caption = "3 · Prehabilitation and exercise hold on to muscle, bone and heart while treatment is happening";
    } else {
      const u = phase(t, 0.75, 1);
      strands.forEach((s, i) => { setAlpha(alpha, s, Math.max(0, Math.min(1, u * 7 - i * 0.7))); movePart(pts, base, s, [0, 0, 0], 0.4 + 0.6 * Math.min(1, u * 1.6)); });
      setAlpha(alpha, axis, 1); setAlpha(alpha, nerve, 0.4 + 0.6 * u); setAlpha(alpha, ear, 1); setAlpha(alpha, bone, 1);
      grow(alpha, curve, Math.min(1, u * 1.3));
      caption = "4 · Hair returns in months, nerves recover over a year or more, and what does not come back is replaced or supported";
    }
    return { caption, labels: [
      { at: [0, 1.4, 0], text: "Person" },
      ...(t >= 0.25 && t < 0.5 ? [{ at: [-1.85, 1.0, 0] as Vec3, text: "Fertility store" }, { at: [0.75, 1.1, 0] as Vec3, text: "Cooling cap" }] : []),
      ...(t >= 0.5 && t < 0.75 ? [{ at: [1.72, 1.05, 0] as Vec3, text: "Strength" }] : []),
      ...(t >= 0.75 ? [{ at: [1.75, -0.1, 0] as Vec3, text: "Months after treatment" }] : []),
    ] };
  });
}

/** Front ids → animated builders. `adcs` reuses the ADC internalisation sequence from ./animated.ts (see schematics.ts). */
export const FRONT_ANIMATED: Record<string, () => Mesh> = {
  imaging: imagingFront,
  diagnostics: diagnosticsFront,
  "early-detection": earlyDetectionFront,
  surgery: surgeryFront,
  radiation: radiationFront,
  chemotherapy: chemotherapyFront,
  "targeted-therapy": targetedFront,
  immunotherapy: immunotherapyFront,
  "cell-therapy": cellTherapyFront,
  radiopharma: radiopharmaFront,
  hormonal: hormonalFront,
  epigenetics: epigeneticsFront,
  "supportive-care": supportiveFront,
  "ai-computation": aiFront,
  "drug-discovery": discoveryFront,
  prevention: preventionFront,
  devices: devicesFront,
  "nutrition-lifestyle": nutritionFront,
  rejuvenation: rejuvenationFront,
};

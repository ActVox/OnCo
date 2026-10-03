/**
 * Three animated schematics for the rehabilitation and reconstruction records in
 * src/data/spikes/rejuvenation-rehab.ts, drawn with the wave 8 kit so this module stays self-contained and
 * src/data/animated.ts can spread it into the registry without an import cycle.
 *
 * Each scene is deliberately generic, because several records share it through SCHEMATIC_ALIAS: the labels name
 * the mechanism (measure, prescribe, train, reassess; defect, tissue moved in, healing, result) rather than one
 * cancer, so a drawing borrowed by a second record does not assert something false about it.
 */
import { line, setAlpha, type Mesh, type Vec3 } from "@/lib/wireframe";
import { axes, bar, clamp, cloud, doc, figure, frame, hide, L, moveTo, mote, pulse, put, Q, quad, scene, show, small, stageOf, tick, ticks } from "./animated-wave8-kit";

/**
 * Cancer rehabilitation: an impairment is measured, a programme is prescribed, the person trains, the measure is
 * repeated. Shared by the function-specific records (swallowing, pelvic floor, respiratory, balance, scar,
 * return to activity), which all follow the same loop with a different measure.
 */
export function rehabilitationLoop(): Mesh {
  const sc = scene();
  const PERSON: Vec3 = [-2.1, -0.1, 0];
  put(sc, "person", figure("soft"), { at: PERSON, scale: 1.0 });
  const therapist = put(sc, "therapist", figure("accent"), { at: [-0.75, -0.15, 0.2], scale: 0.85 });
  // The measure: a two-bar chart, baseline low and a target.
  put(sc, "axes", axes([1.1, -1.0, 0], 1.7, 1.9));
  const low = put(sc, "low", bar(1.45, 0.65, 0.3, "hot"), { at: [0, -1.0, 0] });
  const mid = put(sc, "mid", bar(2.0, 1.15, 0.3, "accent"), { at: [0, -1.0, 0] });
  const high = put(sc, "high", bar(2.55, 1.6, 0.3, "accent"), { at: [0, -1.0, 0] });
  const gap = put(sc, "gap", line([1.1, 0.75, 0], [2.85, 0.75, 0], "soft"));
  // The prescription and the reassessment.
  const plan = put(sc, "plan", doc(0.6, 0.75, 4, "accent"), { at: [-0.75, 1.15, 0] });
  const ok = put(sc, "ok", tick([2.55, 0.85, 0.05], 0.2));
  // Repetitions: motes travelling from the therapist to the person, week after week.
  const reps = [0, 1, 2, 3].map((i) => put(sc, `rep${i}`, mote(0.08, "accent"), { at: [-1.4, 0.3, 0.1] }));
  // What is still missing at the end: the part that does not come back.
  const resid = put(sc, "resid", quad(0.3, 0.3, "hot"), { at: [2.55, 1.05, 0.02] });
  sc.mesh.labels = [L([PERSON[0], PERSON[1] - 1.25, 0], "Function after treatment"), L([-0.75, 1.75, 0], "Named impairment, measured"), L([2.0, -1.4, 0], "Graded programme, weeks"), L([2.6, 1.55, 0], "Reassess: part of it returns")];
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, plan, ok, resid, mid, high, ...reps);
    const s = stageOf(t);
    if (s === 0) {
      const u = Q(t, 0);
      setAlpha(alpha, low, 0.4 + 0.6 * u);
      show(alpha, 0.5 * u, gap);
      setAlpha(alpha, therapist, 0.25);
      return { caption: "1 · Treatment ends and something no longer works: a shoulder, a swallow, a bladder, the stairs" };
    }
    if (s === 1) {
      const u = Q(t, 1);
      setAlpha(alpha, low, 1); show(alpha, 0.8, gap);
      setAlpha(alpha, therapist, 0.3 + 0.7 * u);
      setAlpha(alpha, plan, clamp(u * 1.8));
      return { caption: "2 · It is named and measured: walking distance, shoulder range, mouth opening, pad weight, not just how the person feels" };
    }
    if (s === 2) {
      const u = Q(t, 2);
      setAlpha(alpha, low, 1); setAlpha(alpha, mid, clamp(u * 1.6)); show(alpha, 0.8, gap, plan, therapist);
      reps.forEach((p, i) => {
        const v = (t * 4 + i / 4) % 1;
        setAlpha(alpha, p, u * (1 - v));
        moveTo(pts, base, p, [-1.4, 0.3, 0.1], [PERSON[0] + 0.1, PERSON[1] + 0.4, 0.1], v);
      });
      return { caption: "3 · A graded programme over weeks, delivered by physiotherapy, occupational therapy, speech and language therapy or dietetics, supervised where adherence matters" };
    }
    const u = Q(t, 3);
    setAlpha(alpha, low, 0.5); setAlpha(alpha, mid, 0.8); setAlpha(alpha, high, clamp(u * 1.6)); show(alpha, 0.8, gap, plan, therapist);
    setAlpha(alpha, ok, clamp(u * 2 - 0.8) * (0.6 + 0.4 * pulse(t, 4)));
    setAlpha(alpha, resid, clamp(u * 2 - 1.2) * 0.8);
    return { caption: "4 · The measure is repeated: part of the function returns, the rest is managed rather than cured, and the commonest reason none of this happens is that no referral was made" };
  });
}

/**
 * Reconstruction: resection leaves a defect or a diversion, tissue or an implant is brought in or the ends are
 * rejoined, it heals or it leaks, and the result is judged years later by what the patient reports. Shared by the
 * breast, head and neck, stoma reversal and pelvic exenteration records.
 */
export function reconstructionScene(): Mesh {
  const sc = scene();
  const SITE: Vec3 = [-1.5, 0.2, 0];
  put(sc, "body", figure("soft"), { at: [SITE[0], SITE[1] - 0.2, 0], scale: 1.25 });
  // The defect: a gap punched out of the body outline.
  const defect = put(sc, "defect", quad(0.55, 0.55, "hot"), { at: [SITE[0] + 0.05, SITE[1] + 0.3, 0.12] });
  // The donor material, waiting at the right: a flap with its vessels, and an implant.
  const DONOR: Vec3 = [1.6, 1.15, 0];
  const flap = put(sc, "flap", quad(0.5, 0.5, "accent"), { at: DONOR });
  const artery = put(sc, "artery", line([DONOR[0] - 0.25, DONOR[1] - 0.1, 0.02], [DONOR[0] - 0.9, DONOR[1] - 0.35, 0.02], "hot"));
  const vein = put(sc, "vein", line([DONOR[0] - 0.25, DONOR[1] + 0.1, 0.02], [DONOR[0] - 0.9, DONOR[1] + 0.3, 0.02], "accent"));
  // Healing, and the thing that can go wrong.
  const stitches = [0, 1, 2, 3].map((i) => put(sc, `st${i}`, line([SITE[0] - 0.3 + 0.2 * i, SITE[1] + 0.05, 0.14], [SITE[0] - 0.3 + 0.2 * i, SITE[1] + 0.55, 0.14], "accent")));
  const leak = put(sc, "leak", cloud(7, 0.26, "hot", 3), { at: [SITE[0] + 0.05, SITE[1] - 0.25, 0.14] });
  // Radiotherapy on the reconstructed site.
  const rtTicks = put(sc, "rt", ticks(SITE[0] - 0.6, SITE[0] + 0.7, SITE[1] + 1.25, 5, "hot"));
  // The outcome years later: a reported score rather than a photograph.
  put(sc, "axes2", axes([1.0, -1.5, 0], 1.6, 1.5));
  const s1 = put(sc, "s1", bar(1.35, 1.1, 0.3, "accent"), { at: [0, -1.5, 0] });
  const s2 = put(sc, "s2", bar(1.95, 0.8, 0.3, "hot"), { at: [0, -1.5, 0] });
  const form = put(sc, "form", doc(0.5, 0.6, 3, "soft"), { at: [2.6, -0.85, 0] });
  sc.mesh.labels = [L([SITE[0], SITE[1] - 1.55, 0], "Defect or diversion after resection"), L([DONOR[0] + 0.1, DONOR[1] + 0.75, 0], "Flap with its artery and vein, an implant, or the two ends rejoined"), L([SITE[0], SITE[1] + 1.65, 0], "Radiotherapy to the rebuilt site"), L([1.9, -1.95, 0], "What the patient reports years later")];
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, ...stitches, leak, rtTicks, s1, s2, form);
    const s = stageOf(t);
    if (s === 0) {
      const u = Q(t, 0);
      setAlpha(alpha, defect, 0.4 + 0.6 * u);
      show(alpha, 0.3, flap, artery, vein);
      return { caption: "1 · The operation that clears the cancer leaves something missing: a breast, a jaw, a tongue, the pelvic organs, or a bowel diverted to the skin" };
    }
    if (s === 1) {
      const u = Q(t, 1);
      setAlpha(alpha, defect, 1);
      show(alpha, 0.3 + 0.7 * u, flap, artery, vein);
      moveTo(pts, base, flap, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], u);
      moveTo(pts, base, artery, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], u);
      moveTo(pts, base, vein, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], u);
      return { caption: "2 · Tissue is moved in with its own artery and vein and joined under a microscope, or an implant is placed, or the two cut ends of the bowel are sewn back together" };
    }
    if (s === 2) {
      const u = Q(t, 2);
      setAlpha(alpha, defect, 0.25);
      show(alpha, 1, flap); show(alpha, 0.7, artery, vein);
      moveTo(pts, base, flap, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], 1);
      moveTo(pts, base, artery, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], 1);
      moveTo(pts, base, vein, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], 1);
      stitches.forEach((p, i) => setAlpha(alpha, p, clamp(u * 4 - i)));
      setAlpha(alpha, leak, clamp(u * 2 - 1.4) * 0.7 * pulse(t, 3));
      return { caption: "3 · Most take: head and neck free flap survival is above 95 per cent in modern series. The failures are vascular and early, and a join that leaks is the other way this stage ends" };
    }
    const u = Q(t, 3);
    setAlpha(alpha, defect, 0.2);
    show(alpha, 1, flap); show(alpha, 0.5, artery, vein);
    moveTo(pts, base, flap, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], 1);
    moveTo(pts, base, artery, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], 1);
    moveTo(pts, base, vein, DONOR, [SITE[0] + 0.05, SITE[1] + 0.3, 0.16], 1);
    stitches.forEach((p) => setAlpha(alpha, p, 0.6));
    setAlpha(alpha, rtTicks, clamp(u * 2) * 0.8);
    setAlpha(alpha, s1, clamp(u * 1.8)); setAlpha(alpha, s2, clamp(u * 1.8 - 0.4)); setAlpha(alpha, form, clamp(u * 2 - 0.6));
    return { caption: "4 · The result is measured by questionnaire years later, and radiotherapy to the rebuilt site shifts it: irradiated implant reconstructions had more complications and lower satisfaction than irradiated tissue reconstructions" };
  });
}

/**
 * A fitted device: the part is measured, the device is made, it is fitted and its use is taught, it wears out and
 * someone has to pay for the next one. Shared by the facial prosthetics and voice prosthesis records.
 */
export function fittedDeviceScene(): Mesh {
  const sc = scene();
  const PERSON: Vec3 = [-2.0, -0.1, 0];
  put(sc, "person", figure("soft"), { at: PERSON, scale: 1.1 });
  const missing = put(sc, "missing", quad(0.3, 0.3, "hot"), { at: [PERSON[0] + 0.12, PERSON[1] + 0.85, 0.14] });
  // Measurement: callipers reading across the site.
  const measure = put(sc, "measure", ticks(PERSON[0] - 0.4, PERSON[0] + 0.6, PERSON[1] + 1.35, 4, "accent"));
  // Fabrication: a bench with the device taking shape.
  const BENCH: Vec3 = [0.1, 0.55, 0];
  put(sc, "bench", line([BENCH[0] - 0.7, BENCH[1] - 0.45, 0], [BENCH[0] + 0.7, BENCH[1] - 0.45, 0], "soft"));
  const blank = put(sc, "blank", quad(0.45, 0.45, "soft"), { at: BENCH });
  const dev = put(sc, "dev", quad(0.32, 0.32, "accent"), { at: BENCH });
  // Fitting and teaching.
  const teacher = put(sc, "teacher", figure("accent"), { at: [-0.95, -0.25, 0.2], scale: 0.7 });
  const lesson = [0, 1, 2].map((i) => put(sc, `ls${i}`, small(0.07, "accent"), { at: [-1.35, 0.25, 0.1] }));
  // Wear and replacement: a run of devices over time, and a funding gate on the last one.
  const timeline = put(sc, "timeline", ticks(1.2, 2.9, -1.25, 4, "soft"));
  const spares = [0, 1, 2].map((i) => put(sc, `sp${i}`, quad(0.26, 0.26, i === 2 ? "hot" : "accent"), { at: [1.45 + 0.6 * i, -0.85, 0] }));
  const gate = put(sc, "gate", doc(0.45, 0.55, 3, "hot"), { at: [2.75, 0.15, 0] });
  sc.mesh.labels = [L([PERSON[0], PERSON[1] - 1.35, 0], "A part is gone: an ear, an eye socket, a nose, a voice, teeth"), L([BENCH[0], BENCH[1] + 1.0, 0], "Measured, made and matched"), L([-0.95, -1.2, 0], "Fitted, and its use taught"), L([2.3, -1.7, 0], "It wears out, and who pays decides the next one")];
  const base = sc.mesh.points;
  return frame(sc, 13, (t, pts, alpha) => {
    hide(alpha, measure, blank, dev, ...lesson, timeline, ...spares, gate);
    setAlpha(alpha, teacher, 0.25);
    const s = stageOf(t);
    if (s === 0) {
      const u = Q(t, 0);
      setAlpha(alpha, missing, 0.4 + 0.6 * u);
      return { caption: "1 · Surgery or radiotherapy has taken a structure that cannot be rebuilt from the person's own tissue" };
    }
    if (s === 1) {
      const u = Q(t, 1);
      setAlpha(alpha, missing, 1);
      setAlpha(alpha, measure, clamp(u * 2));
      setAlpha(alpha, blank, clamp(u * 1.6) * 0.6);
      setAlpha(alpha, dev, clamp(u * 2 - 1));
      return { caption: "2 · The site is measured and a device is made to it: a silicone prosthesis painted to match, a one-way voice valve, a compression garment, an implant-retained set of teeth" };
    }
    if (s === 2) {
      const u = Q(t, 2);
      setAlpha(alpha, missing, 0.3); show(alpha, 0.5, measure, blank);
      setAlpha(alpha, dev, 1);
      moveTo(pts, base, dev, BENCH, [PERSON[0] + 0.12, PERSON[1] + 0.85, 0.18], clamp(u * 1.5));
      setAlpha(alpha, teacher, 0.3 + 0.7 * u);
      lesson.forEach((p, i) => { const v = (t * 3 + i / 3) % 1; setAlpha(alpha, p, u * (1 - v)); moveTo(pts, base, p, [-1.35, 0.25, 0.1], [PERSON[0] + 0.2, PERSON[1] + 0.6, 0.1], v); });
      return { caption: "3 · Fitting and training decide whether it is used: in one laryngectomy cohort, distance from the clinic and housing instability predicted abandoning the voice prosthesis, while insurance cover of supplies did not" };
    }
    const u = Q(t, 3);
    setAlpha(alpha, missing, 0.25); show(alpha, 0.4, measure, blank, teacher);
    setAlpha(alpha, dev, 1);
    moveTo(pts, base, dev, BENCH, [PERSON[0] + 0.12, PERSON[1] + 0.85, 0.18], 1);
    setAlpha(alpha, timeline, clamp(u * 2) * 0.7);
    spares.forEach((p, i) => setAlpha(alpha, p, clamp(u * 3 - i)));
    setAlpha(alpha, gate, clamp(u * 2 - 1.2) * (0.6 + 0.4 * pulse(t, 3)));
    return { caption: "4 · Every one of these is a consumable. Replacement is where funding decides the outcome, and the rules differ by country, by device and by who is paying" };
  });
}

export const REJUV_REHAB_SCENES: Record<string, () => Mesh> = {
  "rejuv-rehab-cancer-rehabilitation": rehabilitationLoop,
  "rejuv-recon-breast": reconstructionScene,
  "rejuv-rehab-assistive-devices": fittedDeviceScene,
};

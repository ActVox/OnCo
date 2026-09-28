import { graph } from "./graph";
import { routeFor } from "./kinds";

/**
 * Symptom-first index of product toxicities.
 *
 * Every `drug.toxicity[].event` string in the corpus is written by hand in the language of the label
 * or trial ("ALT increased", "Palmar-plantar erythrodysaesthesia (with capecitabine)"). A person with
 * a symptom does not search that way, so `symptomGroup` folds the strings into plain-language groups
 * ("Liver inflammation or raised liver enzymes", "Hand-foot syndrome"). Each group has guidance in
 * `src/data/side-effect-guidance.ts`; a test asserts that nothing in the corpus falls through.
 *
 * Order matters: compound strings such as "Nausea, fatigue" or "Rash, fatigue" are grouped by the
 * first-named symptom, and specific patterns (febrile neutropenia, immune-mediated colitis) are tested
 * before the generic ones (fever, colitis).
 */
const RULES: Array<[RegExp, string]> = [
  // Life-threatening syndromes first, so "neurologic toxicity incl. ICANS" and "CRS" are never diluted.
  [/cytokine release/i, "Cytokine release syndrome"],
  [/capillary leak/i, "Capillary leak syndrome"],
  [/differentiation syndrome/i, "Differentiation syndrome"],
  [/tumou?r lysis/i, "Tumour lysis syndrome"],
  [/tumou?r flare/i, "Tumour flare"],
  [/icans|neurolog|neurotox|encephalopath|parkinson/i, "Confusion or brain effects (neurotoxicity, ICANS)"],
  [/cognitive|mood/i, "Memory, thinking or mood changes"],
  [/induction mortality|treatment-related mortality|mortality/i, "Treatment-related death"],
  [/^grade\b/i, "Any severe side effect (grade 3 or higher)"],
  [/immune-related/i, "Immune-related side effects (general)"],

  // Blood counts and infection.
  [/febrile neutropenia|fever|pyrexia|chills|influenza-like/i, "Fever or febrile neutropenia"],
  [/neutro|leukopenia|leukocytes decreased|white cell/i, "Low white cells (neutropenia)"],
  [/anaem|anemia|haemoglobin|hemoglobin/i, "Low red cells (anaemia)"],
  [/thrombocyt|platelet/i, "Low platelets (thrombocytopenia)"],
  [/lymphopenia|lymphocytes decreased/i, "Low lymphocytes (lymphopenia)"],
  [/cytopenia|myelosuppression/i, "Low blood counts (general)"],
  [/hypogammaglobulin|b-cell aplasia/i, "Low antibody levels (hypogammaglobulinaemia)"],
  [/hepatitis b reactivation/i, "Infections"],
  [/infection|pneumonia\b|covid|otitis|urinary tract|upper respiratory/i, "Infections"],
  [/leukocytosis/i, "Blood chemistry or blood count changes (other)"],

  // Second cancers.
  [/\bmds\b|myelodysplastic|acute leukaemia|malignan|second primary|squamous cell carcinoma|keratoacanthoma|endometrial cancer/i, "Second cancers"],

  // Gut.
  [/colitis/i, "Colitis (bowel inflammation)"],
  [/perforation/i, "Bowel perforation"],
  [/diarr|steatorrh/i, "Diarrhoea"],
  [/nausea|vomit|gastric mucosal/i, "Nausea or vomiting"],
  [/constipation/i, "Constipation"],
  [/stomatitis|mucositis/i, "Mouth soreness or ulcers (stomatitis)"],
  [/xerostomia|dry mouth|sialadenitis/i, "Dry mouth"],
  [/dysgeusia|taste/i, "Taste changes"],
  [/pancrea|lipase/i, "Pancreas inflammation or raised pancreatic enzymes"],
  [/dyspepsia|abdominal pain|cholelith/i, "Indigestion, gallstones or abdominal pain"],
  [/appetite|weight loss|weight decrease|anorexia/i, "Loss of appetite or weight loss"],
  [/weight gain/i, "Weight gain"],

  // Lungs and airways.
  [/\bild\b|interstitial|pneumonitis|pulmonary toxicity/i, "Lung inflammation (pneumonitis, ILD)"],
  [/dyspn|cough|hypoxia|pneumothorax|pulmonary arterial hypertension/i, "Breathlessness or cough"],
  [/dysphonia|voice/i, "Voice changes"],

  // Liver, kidney, bladder.
  [/\b(alt|ast|ggt)\b|transamin|hepat|bilirubin|veno-occlusive/i, "Liver inflammation or raised liver enzymes"],
  [/\brenal\b|nephr|proteinuria|creatinine/i, "Kidney problems"],
  [/cystitis|haematuria|dysuria|pollakiuria|micturition|urinary (frequency|urgency)|bladder/i, "Bladder symptoms"],

  // Heart and circulation.
  [/cardiomyopathy|cardiotox|cardiac failure|ventricular dysfunction|lvef|myocarditis/i, "Heart muscle weakness or inflammation"],
  [/\bqtc?\b|atrial fibrillation|flutter|bradycardia|arrhythm/i, "Heart rhythm changes (QT, atrial fibrillation)"],
  [/hypertension/i, "High blood pressure"],
  [/hypotension|syncope/i, "Low blood pressure or fainting"],
  [/thromboembol|occlusive|thrombosis|embolism/i, "Blood clots"],
  [/bleeding|haemorrhag|hemorrhag|epistaxis|bruising|contusion/i, "Bleeding or bruising"],
  [/oedema|edema|effusion|ascites/i, "Fluid retention (swelling, effusions)"],

  // Skin, hair, nails, hands and feet.
  [/hand-foot|palmar-plantar/i, "Hand-foot syndrome"],
  [/nail|onycholysis/i, "Nail changes"],
  [/alopecia|hair/i, "Hair loss"],
  [/rash|cutaneous|dermatolog|skin|pruritus|photosens|desquamation|rccep/i, "Rash, itching or skin reactions"],
  [/wound/i, "Poor wound healing"],

  // Nerves, muscles, joints, pain.
  [/neuropath|paraesth|paresth|dysaesth|dysesth/i, "Nerve damage (peripheral neuropathy)"],
  [/rhabdomyolysis/i, "Muscle breakdown (rhabdomyolysis)"],
  [/arthralgia|myalgia|musculoskeletal|muscle|cramp|cpk|creatine kinase/i, "Muscle or joint pain"],
  [/headache/i, "Headache"],
  [/^pain$/i, "Pain"],
  [/fatigue|asthenia|malaise/i, "Tiredness (fatigue)"],

  // Eyes and ears.
  [/vision|cataract|retin|conjunctiv|corneal|dry eye|kerat|photopsia|ocular|periorbital/i, "Eye problems"],
  [/hearing|ototox|tinnitus/i, "Hearing problems"],

  // Reactions to the infusion or injection.
  [/infusion|injection|hypersensitivity/i, "Infusion or injection reactions"],

  // Hormones and metabolism.
  [/thyroid/i, "Thyroid changes"],
  [/adrenal/i, "Adrenal insufficiency"],
  [/hyperglyc|glucose/i, "High blood sugar"],
  [/hot flush|vaginal|sexual|ovarian/i, "Hot flushes, sexual or fertility effects"],
  [/bone/i, "Bone loss or fractures"],
  [/cholesterol|triglycerid|phosphat|kalaemia|kalemia|magnes|natraemia|calcaemia|hypoalbumin/i, "Blood chemistry or blood count changes (other)"],
];

/** Plain-language symptom group for a toxicity event string. Unmatched strings are returned unchanged. */
export function symptomGroup(event: string): string {
  const e = event.trim();
  for (const [re, group] of RULES) if (re.test(e)) return group;
  return e;
}

/** All group names the rules can produce, in rule order (deduplicated). */
export const SYMPTOM_GROUPS: string[] = [...new Set(RULES.map(([, g]) => g))];

export type SideEffectRow = {
  id: string;
  group: string;
  drugId: string;
  drug: string;
  route: string;
  modality: string;
  event: string;
  anyGradePct?: number;
  grade3PlusPct?: number;
  source?: string;
  note?: string;
};

/** Short class label for a modality string, shared with the grouping on /toxicity/. */
export function modalityClass(m: string): string {
  if (/bispecific adc/i.test(m)) return "Bispecific ADC";
  if (/^adc/i.test(m)) return "ADC";
  if (/engager|immtac/i.test(m)) return "T-cell engager";
  if (/bispecific/i.test(m)) return "Bispecific antibody";
  if (/anti-pd-1|anti-pd-l1|anti-ctla-4|anti-lag-3/i.test(m)) return "Checkpoint inhibitor";
  if (/monoclonal/i.test(m)) return "Antibody";
  if (/car-t|til|tcr-t/i.test(m)) return "Cell therapy";
  if (/radioligand|alpha|theranostic|radiopharm|radioactive/i.test(m)) return "Radiopharmaceutical";
  if (/cdk4\/6|cdk4/i.test(m)) return "CDK4/6 inhibitor";
  if (/parp/i.test(m)) return "PARP inhibitor";
  if (/btk/i.test(m)) return "BTK inhibitor";
  if (/kras|ras\(on\)/i.test(m)) return "RAS inhibitor";
  if (/kinase|tki/i.test(m)) return "Kinase inhibitor";
  if (/serd|serm|aromatase|gnrh|antiandrogen|ar antagonist|cyp17a1|progestin|hormonal/i.test(m)) return "Hormone therapy";
  if (/cytotoxic|alkylating|platinum|taxane|anthracycline|antifolate|nucleoside|topoisomerase|vinca|fluoropyrimidine|hypomethylating|nitrosourea|antibiotic|actinomycin|halichondrin|liposomal/i.test(m)) return "Chemotherapy";
  if (/oncolytic|vaccine|cytokine|interleukin|interferon/i.test(m)) return "Immunotherapy (other)";
  return m;
}

/** Server-side: one row per product toxicity, tagged with its symptom group. Serialisable for client components. */
export function buildSideEffectIndex(): SideEffectRow[] {
  const g = graph();
  return g.kind("drug").filter((d) => d.toxicity.length).flatMap((d) => d.toxicity.map((t, i) => ({
    id: `${d.id}-${i}`,
    group: symptomGroup(t.event),
    drugId: d.id,
    drug: d.name,
    route: routeFor(d),
    modality: modalityClass(d.modality),
    event: t.event,
    anyGradePct: t.anyGradePct,
    grade3PlusPct: t.grade3PlusPct,
    source: t.source,
    note: t.note,
  })));
}

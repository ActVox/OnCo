import type { ReactNode } from "react";

/**
 * One monoline wireframe icon per front (`section` kind in src/data/sections.ts). 24x24 viewBox, 1.5px stroke, currentColor, rounded
 * joins, no fills except tiny dots. Unknown ids fall back to a hexagon node. Server-safe, no hooks.
 */

type IconProps = { className: string };
type Icon = (p: IconProps) => ReactNode;

function Svg({ className, children }: { className: string; children: ReactNode }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Filled dot: the only fill the set allows. */
function Dot({ cx, cy, r = 1 }: { cx: number; cy: number; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
}

// Imaging: magnifier over a cell.
const Imaging: Icon = (p) => (
  <Svg {...p}>
    <circle cx={10} cy={10} r={6.5} />
    <circle cx={10} cy={10} r={3} />
    <Dot cx={10.8} cy={9.3} r={0.9} />
    <path d="M14.6 14.6 20.5 20.5" />
  </Svg>
);

// Diagnostics & Biomarkers: tilted test tube with a sample.
const Diagnostics: Icon = (p) => (
  <Svg {...p}>
    <g transform="rotate(20 12 12)">
      <path d="M9 3v12.5a3 3 0 0 0 6 0V3" />
      <path d="M7.5 3h9" />
      <path d="M9 11h6" />
      <Dot cx={12} cy={13.8} />
    </g>
  </Svg>
);

// Early Detection & Screening: radar sweep with a blip.
const EarlyDetection: Icon = (p) => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={9} />
    <circle cx={12} cy={12} r={4.5} />
    <path d="M12 12 18.4 5.6" />
    <Dot cx={8.5} cy={14.5} r={1.2} />
  </Svg>
);

// Surgery & Interventional: scalpel.
const Surgery: Icon = (p) => (
  <Svg {...p}>
    <path d="M2.9 19.9 9.9 12.9 19.5 3.3Q18.5 10 11.1 14.1L4.1 21.1Z" />
    <path d="M9.9 12.9 11.1 14.1" />
  </Svg>
);

// Radiation Therapy: beam head, converging rays, tumour target.
const Radiation: Icon = (p) => (
  <Svg {...p}>
    <rect x={7.5} y={3} width={9} height={3} rx={1} />
    <path d="M9.5 6 11.3 15.5M12 6v9.5M14.5 6l-1.8 9.5" />
    <circle cx={12} cy={18} r={2.5} />
    <Dot cx={12} cy={18} />
  </Svg>
);

// Chemotherapy: infusion bag and drip.
const Chemotherapy: Icon = (p) => (
  <Svg {...p}>
    <path d="M10.5 4V2.5h3V4" />
    <path d="M8 5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V12a4 4 0 0 1-8 0Z" />
    <path d="M8 9h8" />
    <path d="M12 16v3" />
    <Dot cx={12} cy={21} />
  </Svg>
);

// Targeted Therapy: crosshair.
const TargetedTherapy: Icon = (p) => (
  <Svg {...p}>
    <circle cx={12} cy={12} r={7.5} />
    <circle cx={12} cy={12} r={3} />
    <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22" />
    <Dot cx={12} cy={12} />
  </Svg>
);

// Antibody-Drug Conjugates: Y antibody carrying a payload, bound to a target cell.
const Adcs: Icon = (p) => (
  <Svg {...p}>
    <circle cx={17} cy={17} r={4.5} />
    <Dot cx={17} cy={17} r={1.2} />
    <path d="M10 10 12.5 17M10 10 17 12.5M10 10 6.5 6.5" />
    <Dot cx={5.1} cy={5.1} r={1.4} />
  </Svg>
);

// Immunotherapy: T cell touching a tumour cell.
const Immunotherapy: Icon = (p) => (
  <Svg {...p}>
    <circle cx={16} cy={10.5} r={5.5} />
    <Dot cx={16} cy={10.5} r={1.2} />
    <path d="M16 5V3.5M19.9 6.6 21 5.5M21.5 10.5H23" />
    <circle cx={7} cy={15} r={3.5} />
    <Dot cx={7} cy={15} r={0.9} />
  </Svg>
);

// Cell Therapy: an engineered cell being infused (arrow entering the cell).
const CellTherapy: Icon = (p) => (
  <Svg {...p}>
    <circle cx={14.5} cy={14.5} r={6} />
    <Dot cx={15.5} cy={15.5} r={1.3} />
    <path d="M3 3l6.5 6.5M9.5 5.5v4H5.5" />
  </Svg>
);

// Radiopharmaceuticals & Theranostics: atom.
const Radiopharma: Icon = (p) => (
  <Svg {...p}>
    <ellipse cx={12} cy={12} rx={9} ry={3.5} />
    <ellipse cx={12} cy={12} rx={9} ry={3.5} transform="rotate(60 12 12)" />
    <ellipse cx={12} cy={12} rx={9} ry={3.5} transform="rotate(120 12 12)" />
    <Dot cx={12} cy={12} r={1.3} />
  </Svg>
);

// Hormonal Therapy: combined sex-hormone symbol.
const Hormonal: Icon = (p) => (
  <Svg {...p}>
    <circle cx={11} cy={13} r={4.5} />
    <path d="M14.2 9.8 19 5M15 5h4v4" />
    <path d="M11 17.5v4M8.5 20h5" />
  </Svg>
);

// Epigenetic & Transcriptional Therapy: DNA helix with marks attached.
const Epigenetics: Icon = (p) => (
  <Svg {...p}>
    <path d="M7 2c0 5 10 5 10 10s-10 5-10 10" />
    <path d="M17 2c0 5-10 5-10 10s10 5 10 10" />
    <path d="M9 5h6M9 9h6M9 15h6M9 19h6" />
    <path d="M8.5 5H6.5M15.5 19h2" />
    <Dot cx={5.3} cy={5} />
    <Dot cx={18.7} cy={19} />
  </Svg>
);

// Supportive Care & Survivorship: heart with a plus.
const SupportiveCare: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 21s-7.5-4.5-9-9.5C2 8 5 4.5 8.5 4.5c1.5 0 2.8.8 3.5 2 .7-1.2 2-2 3.5-2C19 4.5 22 8 21 11.5c-1.5 5-9 9.5-9 9.5Z" />
    <path d="M12 8.5v6M9 11.5h6" />
  </Svg>
);

// AI & Computation: chip.
const AiComputation: Icon = (p) => (
  <Svg {...p}>
    <rect x={7} y={7} width={10} height={10} rx={1.5} />
    <rect x={10.5} y={10.5} width={3} height={3} rx={0.5} />
    <path d="M9.5 7V4M12 7V4M14.5 7V4M9.5 20v-3M12 20v-3M14.5 20v-3M4 9.5h3M4 12h3M4 14.5h3M17 9.5h3M17 12h3M17 14.5h3" />
  </Svg>
);

// Drug Discovery Platforms: flask.
const DrugDiscovery: Icon = (p) => (
  <Svg {...p}>
    <path d="M9.5 3h5" />
    <path d="M10 3v5.5L4.5 18.5A1.5 1.5 0 0 0 5.8 21h12.4a1.5 1.5 0 0 0 1.3-2.5L14 8.5V3" />
    <path d="M6.8 15h10.4" />
    <Dot cx={10} cy={18} r={0.9} />
    <Dot cx={13.5} cy={17.2} r={0.7} />
  </Svg>
);

// Prevention & Risk: umbrella.
const Prevention: Icon = (p) => (
  <Svg {...p}>
    <path d="M3 13a9 9 0 0 1 18 0" />
    <path d="M3 13a4.5 4.5 0 0 1 6 0a4.5 4.5 0 0 1 6 0a4.5 4.5 0 0 1 6 0" />
    <path d="M12 4V2.5" />
    <path d="M12 13v6.5a1.75 1.75 0 0 0 3.5 0" />
  </Svg>
);

// Devices & Physical Therapies: handheld probe emitting waves.
const Devices: Icon = (p) => (
  <Svg {...p}>
    <path d="M3 20l6.5-6.5 1 1L4 21Z" />
    <path d="M10.4 10A4 4 0 0 1 14 13.6" />
    <path d="M10.7 6.5A7.5 7.5 0 0 1 17.5 13.3" />
    <path d="M11 3A11 11 0 0 1 21 13" />
  </Svg>
);

// Nutrition & Lifestyle (future front): apple with a leaf.
const NutritionLifestyle: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 8.2C10.8 6.8 8.5 6.6 7 7.8 4.2 10 4.8 15.5 7.3 18.6c1.3 1.7 3.2 2 4.7 1 1.5 1 3.4.7 4.7-1 2.5-3.1 3.1-8.6.3-10.8-1.5-1.2-3.8-1-5 .4Z" />
    <path d="M12 8.2V5.5" />
    <path d="M12.2 5.8c.4-2.4 2.6-3.6 5.1-3.1-.4 2.5-2.6 3.7-5.1 3.1Z" />
  </Svg>
);

// Recovery & Rejuvenation: a shoot regrowing from the ground, with a new bud at the tip.
const Rejuvenation: Icon = (p) => (
  <Svg {...p}>
    <path d="M3.5 21h17" />
    <path d="M12 21V7.3" />
    <path d="M12 12.2c0-3.9 2.9-6.6 6.8-6.6C18.8 9.5 15.9 12.2 12 12.2Z" />
    <path d="M12 17c0-3.2-2.4-5.4-5.6-5.4C6.4 14.8 8.8 17 12 17Z" />
    <Dot cx={12} cy={6.2} r={1} />
  </Svg>
);

// Fallback for unknown ids: hexagon node.
const Fallback: Icon = (p) => (
  <Svg {...p}>
    <path d="M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9Z" />
    <Dot cx={12} cy={12} r={1.2} />
  </Svg>
);

const ICONS: Record<string, Icon> = {
  imaging: Imaging,
  diagnostics: Diagnostics,
  "early-detection": EarlyDetection,
  surgery: Surgery,
  radiation: Radiation,
  chemotherapy: Chemotherapy,
  "targeted-therapy": TargetedTherapy,
  adcs: Adcs,
  immunotherapy: Immunotherapy,
  "cell-therapy": CellTherapy,
  radiopharma: Radiopharma,
  hormonal: Hormonal,
  epigenetics: Epigenetics,
  "supportive-care": SupportiveCare,
  "ai-computation": AiComputation,
  "drug-discovery": DrugDiscovery,
  prevention: Prevention,
  devices: Devices,
  "nutrition-lifestyle": NutritionLifestyle,
  rejuvenation: Rejuvenation,
};

/** Front ids with a dedicated icon: one for every front in src/data/sections.ts. */
export const FRONT_ICON_IDS: string[] = Object.keys(ICONS);

export function FrontIcon({ id, className = "h-5 w-5" }: { id: string; className?: string }) {
  const Component = ICONS[id] ?? Fallback;
  return <Component className={className} />;
}

/**
 * Standardized ORA Openness Score rubric and evaluated printer records.
 *
 * The score measures hardware, software, format, and consumable openness - not
 * print quality. Totals are computed directly from the five per-criterion scores
 * so the table and individual reviews cannot drift out of sync.
 */

export const OPENNESS_VERSION = 'v1.0';
export const OPENNESS_MAX_PER_CRITERION = 2;

export type CriterionKey = 'platform' | 'slicer' | 'local' | 'materials' | 'hackability';

export interface OpennessCriterion {
  key: CriterionKey;
  name: string;
  summary: string;
  levels: {
    score: string;
    meaning: string;
  }[];
}

export const OPENNESS_CRITERIA: readonly OpennessCriterion[] = [
  {
    key: 'platform',
    name: 'Platform & OS',
    summary: 'Whether the printer runs on off-the-shelf compute hardware and an open, inspectable operating system and firmware stack.',
    levels: [
      { score: '2.0', meaning: 'Off-the-shelf or openly documented hardware running a fully open-source OS and print stack.' },
      { score: '1.5', meaning: 'Off-the-shelf compute and standard Linux OS with an open frontend, paired with a proprietary print engine.' },
      { score: '1.0', meaning: 'Standard Linux OS or partially open firmware on a custom board.' },
      { score: '0.0', meaning: 'Proprietary controller board and closed OS with no source availability.' },
    ],
  },
  {
    key: 'slicer',
    name: 'Slicer & file formats',
    summary: 'Whether users can slice models with third-party or open-source slicers using documented, unencumbered print formats.',
    levels: [
      { score: '2.0', meaning: 'Open, documented print formats (such as LUMEN or open plate archives) with unrestricted third-party slicer support.' },
      { score: '1.0', meaning: 'Mixed ecosystem: a publicly documented format (such as GOO) alongside a closed primary format (such as CTB), with third-party slicer support.' },
      { score: '0.5', meaning: 'Closed first-party slicer pipeline only, but full software ships without paid feature paywalls.' },
      { score: '0.0', meaning: 'Closed slicer-only pipeline with paywalled features or restrictive licensing.' },
    ],
  },
  {
    key: 'local',
    name: 'Local & offline control',
    summary: 'Whether the printer and its companion tooling work completely on a local network without mandatory cloud accounts.',
    levels: [
      { score: '2.0', meaning: 'Full local control (on-device UI, LAN WebUI, local API) with zero cloud dependency.' },
      { score: '1.5', meaning: 'Local network control via a local protocol (such as SDCP) without mandatory cloud sign-in.' },
      { score: '1.0', meaning: 'Printer operates locally or offline, while companion apps or remote monitoring require the vendor cloud.' },
      { score: '0.0', meaning: 'Mandatory cloud account or always-online connection required to operate.' },
    ],
  },
  {
    key: 'materials',
    name: 'Materials & consumables',
    summary: 'Whether users can run third-party resins freely and service wear items like release films without vendor lock-in.',
    levels: [
      { score: '2.0', meaning: 'Fully open third-party resins and reusable resin tanks with user-replaceable films.' },
      { score: '1.0', meaning: 'Open third-party resin mode included at no extra cost, but relies on discardable tanks or proprietary auto-feed cartridges.' },
      { score: '0.5', meaning: 'Third-party materials require a paid unlock or restrictive licence.' },
      { score: '0.0', meaning: 'Locked to proprietary vendor resins and single-use consumables.' },
    ],
  },
  {
    key: 'hackability',
    name: 'Hackability & developer access',
    summary: 'How practical it is for owners and open-source developers to inspect, modify, repair, or build integrations for the machine.',
    levels: [
      { score: '2.0', meaning: 'Manufacturer publishes CAD/hardware files, software sources, and official root/SSH or full developer access.' },
      { score: '1.5', meaning: 'CAD files, sources for most components, and SSH credentials provided, with minor closed binaries remaining.' },
      { score: '1.0', meaning: 'Official documented local API or developer SDK, without hardware files or root access.' },
      { score: '0.5', meaning: 'No official developer access, though documented formats or known community exploits allow tinkering.' },
      { score: '0.0', meaning: 'Asymmetrically encrypted firmware, Secure Boot, and locked-down bootloader preventing modification.' },
    ],
  },
];

export interface ScoredPrinter {
  name: string;
  vendor: string;
  scores: Record<CriterionKey, number>;
  notes: Record<CriterionKey, string>;
  /** Blog review path on openresin.org, when published. */
  reviewPath?: string;
  evaluatedAt: string;
}

export const SCORED_PRINTERS: readonly ScoredPrinter[] = [
  {
    name: 'Athena II 16K',
    vendor: 'Concepts3D',
    scores: {
      platform: 1.5,
      slicer: 2,
      local: 2,
      materials: 2,
      hackability: 1.5,
    },
    notes: {
      platform: 'Raspberry Pi CM5, Debian Bookworm (Linux 6.12.34), open Orion UI; closed NanoDLP core.',
      slicer: 'Open slicer ecosystem with native DragonFruit and third-party slicer support.',
      local: 'Full local NanoDLP WebUI, Orion touchscreen, and MQTT with no cloud requirement.',
      materials: 'Fully open third-party resins and reusable tank with user-replaceable film.',
      hackability: 'CAD files and SSH password provided; closed NanoDLP binary.',
    },
    reviewPath: '/blog/2026-11-23-formlabs-form-studio-1-review',
    evaluatedAt: '2026-11-23',
  },
  {
    name: 'Saturn 4 Ultra (12K)',
    vendor: 'ELEGOO',
    scores: {
      platform: 0,
      slicer: 1,
      local: 1,
      materials: 2,
      hackability: 0.5,
    },
    notes: {
      platform: 'SigmaStar Infinity2m running closed Chitu Systems OS (Buildroot 2021.11, Linux 4.9.84).',
      slicer: 'Publicly documented GOO format alongside closed CTB; DragonFruit and third-party slicers supported.',
      local: 'Local network printing and telemetry via SDCP 3.0.0, but the companion app relies on closed cloud traffic.',
      materials: 'Fully open third-party resins and reusable tank with user-replaceable film.',
      hackability: 'Documented GOO format and known community SSH exploits; no official sources or CAD.',
    },
    reviewPath: '/blog/2026-11-23-formlabs-form-studio-1-review',
    evaluatedAt: '2026-11-23',
  },
  {
    name: 'Form Studio 1',
    vendor: 'Formlabs',
    scores: {
      platform: 0,
      slicer: 0.5,
      local: 1,
      materials: 1,
      hackability: 0,
    },
    notes: {
      platform: 'Rockchip RK3568B2 running a closed custom OS (likely Linux).',
      slicer: 'Closed PreForm-only slicing pipeline and restrictive SDK; earns 0.5 for having no slicer paywalls.',
      local: 'Printer runs locally without cloud obligations, but the companion app is cloud-only.',
      materials: 'Open Material Mode included, but relies on discardable tanks and lacks refillable auto-feed bottles.',
      hackability: 'Asymmetrically encrypted firmware with Secure Boot.',
    },
    reviewPath: '/blog/2026-11-23-formlabs-form-studio-1-review',
    evaluatedAt: '2026-11-23',
  },
];

export const OPENNESS_MAX_TOTAL = OPENNESS_CRITERIA.length * OPENNESS_MAX_PER_CRITERION;

export function totalOpennessScore(printer: ScoredPrinter): number {
  return OPENNESS_CRITERIA.reduce((sum, criterion) => sum + printer.scores[criterion.key], 0);
}

export function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export interface OpennessBand {
  label: string;
  range: string;
  min: number;
  tone: 'yes' | 'warn' | 'no';
  description: string;
}

export const OPENNESS_BANDS: readonly OpennessBand[] = [
  {
    label: 'Open First',
    range: '9.0 – 10.0',
    min: 9,
    tone: 'yes',
    description: 'Open hardware or open-leaning platforms with full local control, open formats, and real developer access.',
  },
  {
    label: 'Open Friendly',
    range: '7.0 – 8.5',
    min: 7,
    tone: 'yes',
    description: 'Strong openness across most pillars with only minor proprietary components remaining.',
  },
  {
    label: 'Mixed',
    range: '4.0 – 6.5',
    min: 4,
    tone: 'warn',
    description: 'Open consumables and local networking paired with closed controller boards, firmware, or formats.',
  },
  {
    label: 'Mostly Closed',
    range: '2.0 – 3.5',
    min: 2,
    tone: 'no',
    description: 'Closed ecosystem with limited concessions such as offline printer operation or open material mode.',
  },
  {
    label: 'Walled Garden',
    range: '0.0 – 1.5',
    min: 0,
    tone: 'no',
    description: 'Locked-down appliance across hardware, firmware, cloud accounts, slicers, and consumables.',
  },
];

export function scoreBand(total: number): OpennessBand {
  return OPENNESS_BANDS.find((band) => total >= band.min) ?? OPENNESS_BANDS[OPENNESS_BANDS.length - 1];
}

export function scoreTone(total: number): 'yes' | 'warn' | 'no' {
  return scoreBand(total).tone;
}

import { LINKS, ORG } from './site';

export type ProjectGroup = 'featured' | 'plugin' | 'infrastructure';

export interface Project {
  /** Display name. */
  name: string;
  /** GitHub repository name - also the join key for live stats. */
  repo: string;
  /** URL segment for the project page. Defaults to the lowercased repo name. */
  slug?: string;
  /** One-line summary shown in cards and lists. */
  blurb: string;
  /** Longer paragraph for the project page. */
  summary: string;
  /** GitHub's reported primary language. */
  language: string;
  /**
   * Other languages the project ships as a meaningful share of its code, shown as
   * extra chips after `language`. Sourced from the repository's language
   * breakdown - a project that is 15% Rust by bytes belongs on the chip row, but
   * a handful of lines in a build script does not.
   */
  additionalLanguages?: readonly string[];
  /** SPDX identifier, or null when the repo declares no licence. */
  license: string | null;
  group: ProjectGroup;
  /** What the project actually does - quoted from its README. */
  capabilities: string[];
  /** Optional hero image under /public. */
  image?: string;
  /** Product site, when the repo declares one. */
  website?: string;
  /**
   * crates.io package name, when the repository publishes a Rust crate. The project
   * page links the crate and its documentation, and the card carries it as a chip.
   */
  crate?: string;
}

/**
 * Every project below is a real repository in the Open Resin Alliance GitHub
 * organisation. Descriptions and capabilities are taken from the repository
 * description field and its README; nothing is invented.
 *
 * Repositories with nothing in them are deliberately absent: `ORA_Charter` is an
 * empty placeholder, and `.github` is organisation configuration rather than a
 * project, so neither belongs in a list someone reads to find software. Their
 * pages do not exist; if either gains content, add an entry here and the route
 * comes back with it.
 */
export const PROJECTS: Project[] = [
  {
    name: 'DragonFruit',
    repo: 'DragonFruit',
    blurb: 'Open-source resin slicer and support-generation environment.',
    summary:
      'DragonFruit is an open-source resin slicer and support-generation environment built by the Open Resin Alliance. It combines a modern Next.js + React frontend with native Rust slicing backends and a Tauri desktop runtime.',
    language: 'TypeScript',
    // 82.8% TypeScript / 15.3% Rust by bytes: the Next.js frontend and the native
    // slicing backends behind it are both real, load-bearing halves.
    additionalLanguages: ['Rust'],
    license: 'AGPL-3.0',
    group: 'featured',
    capabilities: [
      'Interactive 3D workspace: high-performance model visualization and manipulation using three.js + react-three-fiber',
      'Support authoring systems: branch/grid/raft support workflows with rendering and snapping infrastructure',
      'Island analysis, transform tooling, and native slicing integration',
      'A plugin architecture - printer and file-format support ships as separate MIT-licensed plugins',
    ],
    website: LINKS.dragonfruitSite,
    image: '/projects/dragonfruit.webp',
  },
  {
    name: 'Orion',
    repo: 'Orion',
    blurb: 'An open-source frontend for resin 3D printers.',
    summary:
      "Orion is a user interface designed to control Odyssey. It's tailored to run with a wide variety of devices, primarily Linux SBCs, and drives mSLA printers with real-time monitoring, file management, and print settings.",
    language: 'Dart',
    license: 'Apache-2.0',
    group: 'featured',
    capabilities: [
      'User-friendly interface for mSLA printers, suitable for both beginners and experienced users',
      'Supports the Odyssey backend and NanoDLP',
      'Ships for aarch64, armv7 and x64 Linux targets',
      'PrometheusOS is an all-in-one solution that includes both Odyssey and Orion',
    ],
    image: '/projects/orion.webp',
  },
  {
    name: 'Odyssey',
    repo: 'Odyssey',
    blurb: 'Printer backend for the Apollo control board series.',
    summary:
      'Engine for processing and printing Prusa SL1 slicer files, designed for the Apollo series of control boards and the Prometheus MSLA open-source resin 3D printer.',
    language: 'Rust',
    license: 'GPL-3.0',
    group: 'featured',
    capabilities: [
      'REST API on port 12357 by default, so any client can drive the printer',
      'Prusa SL1 file processing with extensive printer control and advanced configuration',
      'Configurable through a single odyssey.yaml file',
      'Temporary Mainsail integration for Klipper while the Orion UI matures',
    ],
    image: '/projects/odyssey.webp',
  },
  {
    name: 'LumenFormat',
    repo: 'LumenFormat',
    blurb: 'The LUMEN print format: specification, conformance corpus and reference crate.',
    summary:
      'LUMEN is the Open Resin Alliance\u2019s open print file format for resin (MSLA) 3D printing: run-end encoded layer masks in independently compressed zstd frames, human-inspectable JSON metadata in typed chunks, multi-material sectors, per-layer settings, and optional authenticated encryption. This repository is the specification, plus everything that keeps it honest - the normative text, the byte-exact conformance corpus, and the reference encoder, decoder and validator.',
    language: 'Rust',
    license: 'MIT',
    // The crate is dual-licensed MIT OR Apache-2.0, so a GPL-3.0 consumer such as
    // Odyssey can link it; the repository and the specification are MIT.
    crate: 'lumen-format',
    group: 'featured',
    capabilities: [
      'The normative specification in 22 parts: the container, every chunk type, run-end layer encoding, zstd framing and the trained dictionary, the sector model, per-layer timing, authenticated encryption and the validation checks',
      'A byte-exact conformance corpus - 16 valid and 66 invalid vectors with golden values in a manifest - generated and re-verified by two implementations that share no code',
      'The reference encoder, decoder and validator in Rust, published as the `lumen-format` crate: DragonFruit maps its own settings into it, and Odyssey reads a print file through it',
      'A published, immutable revision: v1.0 is tagged, and an implementation names the revision it was written against',
    ],
  },

  {
    name: 'VoxelShift',
    repo: 'VoxelShift',
    blurb: 'CTB and encrypted resin file conversion for NanoDLP.',
    summary:
      'VoxelShift is a desktop utility for converting resin slicer files into NanoDLP-ready plate files. It includes a streamlined post-processor mode for slicers, automatic material selection, and optional upload/start-print workflows for NanoDLP devices.',
    language: 'Dart',
    license: 'Apache-2.0',
    group: 'infrastructure',
    capabilities: [
      'Converts CTB/CBDDLP/Photon resin files into .nanodlp plate archives that NanoDLP can import directly',
      'Post-processor mode that slicers can call to convert, upload, and optionally start prints',
      'Clean-room reverse engineering for interoperability, building on findings from UVTools',
      'Windows, macOS and Linux desktop builds',
    ],
    image: '/projects/voxelshift.webp',
  },

  {
    name: 'CTB Encoder',
    repo: 'df-plugin-ctb',
    blurb: 'CTB encoding for DragonFruit.',
    summary: 'DragonFruit Plugin for the CTB Encoder.',
    language: 'Rust',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'SDCP V3',
    repo: 'df-plugin-sdcp-v3',
    blurb: 'SDCP V3.0.0 protocol support.',
    summary: 'DragonFruit Plugin for the SDCP V3.0.0 Protocol.',
    language: 'Rust',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'Anycubic',
    repo: 'df-plugin-anycubic',
    blurb: 'Anycubic printer support.',
    summary: 'DragonFruit Plugin for Anycubic Printers.',
    language: 'Rust',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'Elegoo',
    repo: 'df-plugin-elegoo',
    blurb: 'Elegoo printer support.',
    summary: 'DragonFruit Plugin for Elegoo Printers.',
    language: 'Rust',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'Siraya Tech',
    repo: 'df-plugin-sirayatech',
    blurb: 'Siraya Tech material profiles.',
    summary: 'DragonFruit Plugin for Siraya Tech Material Profiles.',
    language: 'JavaScript',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'LYS Import',
    repo: 'df-plugin-lys',
    blurb: 'LYS file type import.',
    summary: 'DragonFruit FileType Plugin for LYS.',
    language: 'TypeScript',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'ChiTuBox Import',
    repo: 'df-plugin-chitubox',
    blurb: 'ChiTuBox file import.',
    summary: 'ChiTuBox file import for DragonFruit.',
    language: 'TypeScript',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },
  {
    name: 'UniFormation',
    repo: 'df-plugin-uniformation',
    blurb: 'UniFormation printer support.',
    summary: 'DragonFruit plugin for UniFormation printers.',
    language: 'TypeScript',
    license: 'MIT',
    group: 'plugin',
    capabilities: [],
  },

  {
    name: 'openresin.org',
    repo: 'openresin.org',
    blurb: 'Documentation site.',
    summary: 'The openresin.org documentation website.',
    language: '-',
    license: null,
    group: 'infrastructure',
    capabilities: [],
  },
  {
    name: 'Website',
    repo: 'website',
    blurb: 'This website.',
    summary:
      'Source for this website: an Astro static build that pulls live GitHub statistics at build time and renders blog posts from Markdown.',
    language: 'TypeScript',
    license: 'MIT',
    group: 'infrastructure',
    capabilities: [],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.group === 'featured');
export const PLUGIN_PROJECTS = PROJECTS.filter((p) => p.group === 'plugin');
export const INFRA_PROJECTS = PROJECTS.filter((p) => p.group === 'infrastructure');

/** Projects that are worth surfacing in navigation and the footer. */
export const PRIMARY_PROJECTS = FEATURED_PROJECTS;

export function repoUrl(repo: string): string {
  return `https://github.com/${ORG}/${repo}`;
}

/** URL segment for a project page; falls back to the lowercased repo name. */
export function projectSlug(project: Project): string {
  return project.slug ?? project.repo.toLowerCase();
}

/** URL segment for a repository name, when only the repo name is known. */
export function slugForRepo(repo: string): string {
  const project = PROJECTS.find((p) => p.repo.toLowerCase() === repo.toLowerCase());
  return project ? projectSlug(project) : repo.toLowerCase();
}

/** Site-absolute URL for a project page. */
export function projectPath(project: Project): string {
  return `/projects/${projectSlug(project)}`;
}

export function getProject(repo: string): Project | undefined {
  return PROJECTS.find((p) => p.repo.toLowerCase() === repo.toLowerCase());
}

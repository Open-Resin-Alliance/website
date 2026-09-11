---
title: "DragonFruit: an open-source resin slicer"
description: DragonFruit combines a Next.js and React frontend with native Rust slicing backends and a Tauri desktop runtime. It is the Open Resin Alliance's own slicer, and it is developed in the open.
pubDate: 2025-11-11
author: Open Resin Alliance
category: project
tags: [dragonfruit, slicer, rust, tauri, nextjs]
project: DragonFruit
featured: true
---

DragonFruit is the Open Resin Alliance's own resin slicer and support-generation environment. Its repository was created on 11 November 2025 at [github.com/Open-Resin-Alliance/DragonFruit](https://github.com/Open-Resin-Alliance/DragonFruit), and the product site is at [dragonfruit-slicer.com](https://dragonfruit-slicer.com).

## What it is

The README describes it plainly: DragonFruit "combines a modern Next.js + React frontend with native Rust slicing backends and a Tauri desktop runtime." That split is deliberate. The user interface stays highly iterative, so features can be built and revised quickly, while the slicing work runs in native code rather than in the browser.

It is designed as a desktop-first toolchain. The feature set is aimed at practical print preparation: model inspection, island analysis, transform tooling, support authoring, and native slicing integration.

## The 3D workspace

The interactive workspace uses `three.js` with `react-three-fiber` for what the README calls "high-performance model visualization and manipulation". Around that workspace sits a support authoring system built on "branch/grid/raft support workflows with rendering and snapping infrastructure", so supports can be placed and adjusted directly on the model rather than through a separate view.

## The development warning

The project is honest about where it stands. The README carries a clear warning, reproduced here in full:

> DragonFruit is under active development. Please exercise caution for production print workflows, validate outputs, and avoid unattended printing on first use.

That warning is worth taking literally. Builds are published as development snapshots, and outputs should be checked before a print is trusted to them.

## Licensing

Unless a subdirectory or submodule states otherwise, DragonFruit is licensed under AGPL-3.0-or-later. The plugin submodules under `plugins/` are licensed separately under MIT, and each plugin repository carries its own licence file. The distinction is intentional: the application is copyleft, while the plugin ecosystem stays permissive so integrations can be written freely.

## Building it

The README documents three build variants, from a browser-only development loop to a packaged desktop application.

```bash
# Variant 1: frontend development (Next.js dev server on http://localhost:3005)
# Variant 2: desktop development (Tauri + Rust)
npm run tauri:dev
# Variant 3: production build and bundling
npm run tauri:bundle:macos:universal
```

The macOS universal bundle is described as the canonical release target, producing a single `.dmg` that runs natively on both Intel and Apple Silicon.

## Get involved

DragonFruit is at an early stage, which is exactly when a project benefits most from outside help. Fork the repository, keep changes focused, run the project's lint and test scripts where they apply, and open a pull request with a clear summary and validation notes. Questions, feedback, and ideas are welcome on the [Open Resin Alliance Discord](https://discord.gg/beFeTaPH6v).

---
title: The DragonFruit plugin family
description: Printer and file-format support for DragonFruit ships as eight separate MIT-licensed repositories, consumed as git submodules so the ecosystem can grow without touching the slicer itself.
pubDate: 2026-07-15
category: project
tags: [dragonfruit, plugins, architecture, rust, typescript]
project: df-plugin-uniformation
---

DragonFruit does not grow printer support in its own repository. Instead, hardware and file-format integrations ship as separate plugin repositories under the DragonFruit plugin architecture, and the newest of them, [df-plugin-uniformation](https://github.com/Open-Resin-Alliance/df-plugin-uniformation), was created on 15 July 2026.

## Eight plugins, one architecture

The plugin family covers printers, protocols, and file formats:

- [df-plugin-ctb](https://github.com/Open-Resin-Alliance/df-plugin-ctb): the CTB encoder.
- [df-plugin-sdcp-v3](https://github.com/Open-Resin-Alliance/df-plugin-sdcp-v3): the SDCP V3.0.0 protocol.
- [df-plugin-anycubic](https://github.com/Open-Resin-Alliance/df-plugin-anycubic): Anycubic printers.
- [df-plugin-elegoo](https://github.com/Open-Resin-Alliance/df-plugin-elegoo): Elegoo printers.
- [df-plugin-sirayatech](https://github.com/Open-Resin-Alliance/df-plugin-sirayatech): Siraya Tech material profiles.
- [df-plugin-lys](https://github.com/Open-Resin-Alliance/df-plugin-lys): LYS file import.
- [df-plugin-chitubox](https://github.com/Open-Resin-Alliance/df-plugin-chitubox): ChiTuBox file import.
- [df-plugin-uniformation](https://github.com/Open-Resin-Alliance/df-plugin-uniformation): UniFormation printers.

They are written in the language that fits the job. The CTB encoder, the SDCP V3 protocol plugin, the Anycubic plugin, and the Elegoo plugin are Rust; the Siraya Tech material-profile plugin is JavaScript; and the LYS import, ChiTuBox import, and UniFormation plugins are TypeScript. Every one of them is MIT licensed, while the DragonFruit application itself is AGPL-3.0-or-later.

The repositories were created between 19 March 2026, when the CTB encoder plugin appeared, and 15 July 2026. That spread is the point of the architecture: a new printer or format is a new repository, not a change to the slicer's core.

## Why plugins are separate repositories

Keeping integrations out of the main tree has two effects. It lets an integration be licensed permissively under MIT, so anyone can reuse it in their own tooling, and it lets a plugin be maintained at its own pace without dragging on the release cadence of a slicer that is still under active development.

The main repository treats `plugins/` as the home of its plugin architecture and ecosystem integrations. Plugins can be sourced as git submodules, for example under a path such as `plugins/ctb`. A clone that only checks out the slicer still builds: if plugin folders are missing, the build continues with the plugins that are present, and the missing submodules are skipped with warnings rather than failing the build.

## Working with the plugins

Because they are consumed as submodules rather than as published release downloads, a plugin is built from source as part of a desktop build. The practical workflow is the familiar submodule one: initialise and update the submodules in your clone, then rebuild. If a plugin you expect to see at runtime is absent from the interface, the build log is the first place to look, since a skipped submodule is reported there as a warning.

Each plugin repository carries its own README and its own licence file, and each is an independent contribution target. Adding a printer family or a format reader does not require touching the slicer's frontend, which keeps the barrier to a first contribution low.

## Get involved

If you own a printer that is not on the list, a new plugin repository is the natural place to start, and the existing ones are small enough to read in an afternoon. Open an issue or pull request on [any plugin repository](https://github.com/Open-Resin-Alliance) to propose an integration, or ask in the [Open Resin Alliance Discord](https://discord.gg/beFeTaPH6v) whether someone is already working on it.

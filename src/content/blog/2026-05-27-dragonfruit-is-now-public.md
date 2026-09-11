---
title: "DragonFruit is now public"
description: The alliance's resin slicer is open to everyone - the repository, the plugin ecosystem and the development builds are public as of 27 May 2026.
pubDate: 2026-05-27
category: project
tags: [dragonfruit, slicer, release]
project: DragonFruit
featured: true
---

DragonFruit is now public. We announced it on [r/resinprinting](https://www.reddit.com/r/resinprinting/comments/1topmp8/attention_dragonfruit_resin_slicer_is_now_public/) on 27 May 2026, cross-posted to [r/3Dprinting](https://www.reddit.com/r/3Dprinting/comments/1tq8nae/attention_dragonfruit_resin_slicer_is_now_public/) the following day, and the repository has been open since.

If you missed the backstory, [we started on it in November 2025](/blog/2025-11-11-starting-dragonfruit) and kept it private until there was something worth showing.

## What is public now

Everything in the tree, at [github.com/Open-Resin-Alliance/DragonFruit](https://github.com/Open-Resin-Alliance/DragonFruit):

- the Next.js and React interface, the Rust slicing backends and the Tauri desktop runtime;
- the interactive workspace built on `three.js` and `react-three-fiber`, with model inspection, transform tooling, island analysis and support authoring;
- the plugin repositories, which are separate projects under the same organisation and can be consumed as git submodules. If your clone is missing one, generation continues with the plugins you do have rather than failing.

The development builds are public too, along with the issue tracker and the discussions.

## How it is licensed

The application is AGPL-3.0-or-later. The plugins are MIT, each with its own licence file, so printer and file-format integrations can be written without imposing the copyleft terms on them.

## How it ships

DragonFruit does not have a stable release yet, and we would rather say that plainly than dress up a dev build as one. What exists today is a series of development snapshots: dev builds cut from the `dev` branch on the way to the next version, and nightly builds cut automatically from feature branches. Every one of them is published as a pre-release, and v0.2.0 is the version we expect to be the first stable.

That means the honest guidance is the README's own: validate outputs before you trust them with a real print, and do not print unattended the first time you use it.

## Try it

The README documents three ways in, from the quickest loop to a packaged application:

```bash
# frontend only, dev server on http://localhost:3005
# desktop development, Tauri + Rust
npm run tauri:dev
# production build and bundling
npm run tauri:bundle:macos:universal
```

Builds are also attached to the releases, alongside the project site at [dragonfruit-slicer.com](https://dragonfruit-slicer.com).

## Contributing

The README's contributing section is three steps and worth following literally: fork the repository and branch from it, make focused changes that follow the project's conventions, run `npm run lint` and `npm run test` where they apply, then open a pull request with a clear summary, rationale and validation notes.

If you would rather talk first - a question, a bug report, a printer that behaves oddly - the [Open Resin Alliance Discord](https://discord.gg/beFeTaPH6v) is where the people building this are.

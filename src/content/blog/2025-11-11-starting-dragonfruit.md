---
title: "Starting DragonFruit: building our own resin slicer"
description: In November 2025 the alliance began work on DragonFruit — an open-source resin slicer with a Next.js and React frontend, native Rust slicing backends and a Tauri desktop runtime.
pubDate: 2025-11-11
category: project
tags: [dragonfruit, slicer, rust, tauri, nextjs]
project: DragonFruit
---

On 11 November 2025 we created the repository for DragonFruit. It stayed private while we built the foundations, and it was not announced until [May 2026](/blog/2026-05-27-dragonfruit-is-now-public). This post is about why we started and what we set out to build.

## Why we started

The alliance had been shipping tooling around other people's formats and other people's firmware for a while. VoxelShift's README puts the conclusion plainly: "Because of these ecosystem limitations, the **Open Resin Alliance** is now fully committed to developing its own **Open Source Resin Slicer** to ensure true hardware independence and innovation."

That is the whole motivation. A slicer sits between a model and a machine, and whoever controls it decides what the machine is allowed to do. We wanted one we could change.

## The architecture we settled on

The README describes the split as "a modern Next.js + React frontend with native Rust slicing backends and a Tauri desktop runtime". Each part of that is a deliberate call.

The user interface stays in web technology so it can be iterated quickly — a slicing interface is a lot of interaction design, and rebuilding it for every experiment is a bad trade. The work that has to be fast, and has to be right, runs in native Rust instead: slicing, and the geometry that supports it. Tauri is what binds the two into a desktop application without shipping a browser engine of our own.

Around that sits an interactive workspace built on `three.js` and `react-three-fiber`, which the README calls "high-performance model visualization and manipulation". Models are inspected, moved and supported directly in that view rather than through a separate dialog. Support authoring is part of the same environment, built on what the README describes as "branch/grid/raft support workflows with rendering and snapping infrastructure".

## Desktop first

It would have been easier to start with a web application. We did not, because slicing is a local, heavy, offline job: models are large, the machine is on your desk, and the tool should not stop working because a network did. Desktop-first also means the finished thing can talk to a printer directly.

## Licensing decided early

Two decisions were made before there was much code to license. The application is licensed under AGPL-3.0-or-later, and the plugins under `plugins/` are licensed separately under MIT. The distinction is intentional: the application stays copyleft, while printer and file-format integrations stay permissive so anyone can write one without paperwork.

## Working privately, then in the open

We kept the repository private through the first stretch for an unglamorous reason: an early slicer is mostly scaffolding, and scaffolding is not worth reading. Once there was something real to look at, the repository went public and development moved into the open — dev builds from the `dev` branch, nightlies from feature branches, and everything visible on GitHub.

That happened on 27 May 2026. [DragonFruit is now public](/blog/2026-05-27-dragonfruit-is-now-public).

## Get involved

The project is under active development and the README says so in as many words, so validate outputs before trusting them with a real print. Beyond that, contributions are welcome: fork the repository, keep changes focused, run the project's lint and test scripts where they apply, and open a pull request with a clear summary and validation notes. Questions and ideas are welcome on the [Open Resin Alliance Discord](https://discord.gg/beFeTaPH6v).

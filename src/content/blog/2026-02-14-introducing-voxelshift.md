---
title: Introducing VoxelShift
description: VoxelShift converts CTB, CBDDLP and Photon resin files into NanoDLP plate archives, with a post-processor mode slicers can call directly. It is built on clean-room reverse engineering for interoperability.
pubDate: 2026-02-14
author: Open Resin Alliance
category: project
tags: [voxelshift, nanodlp, file-formats, interoperability, dart]
project: VoxelShift
---

VoxelShift is a desktop utility from the Open Resin Alliance for converting resin slicer files into NanoDLP-ready plate files. Its repository was created on 14 February 2026 at [github.com/Open-Resin-Alliance/VoxelShift](https://github.com/Open-Resin-Alliance/VoxelShift).

## Why it exists

Resin printing has no single dominant file format. A model sliced for one machine often cannot be opened by another, and the formats involved are frequently opaque or encrypted. VoxelShift addresses a specific corner of that problem: it converts CTB, CBDDLP, and Photon resin files into `.nanodlp` plate archives that NanoDLP can import directly.

Beyond one-off conversion, it exposes a post-processor mode that slicers can call to convert, upload, and optionally start prints with minimal interaction. Automatic material selection is part of that workflow, so a conversion can carry the right print parameters with it instead of relying on the operator to set them by hand.

The utility is written in Dart with Flutter and requires Flutter 3.11 or later to build. It is developed with the Concepts3D Athena 2 printers in mind, which the project supports on a voluntary basis and with explicit permission from Concepts3D.

## Interoperability, done carefully

Converting files produced by other tools raises legal questions, and VoxelShift documents its position rather than leaving it implicit. Its legal notice describes the reverse engineering of CTB and related formats as undertaken for interoperability, and states that the project assumes this work operates within the scope of EU Directive 2009/24/EG on the legal protection of computer programs, DMCA Section 1201(f) in the United States, and fair use or fair dealing.

The method matters as much as the claim. VoxelShift builds on findings from the open-source UVTools project and applies clean-room reverse engineering principles so that format specifications can be verified independently. Third-party names are respected too: LycheeSlicer is identified as owned and trademarked by Mango3D, and NanoDLP as owned by its respective rights holders. VoxelShift itself is licensed under the Apache License 2.0.

## The bigger picture

VoxelShift is a bridge between ecosystems, not a permanent answer to them. Its README is explicit about the limits it works within, and about the conclusion the organisation drew from them:

> Because of these ecosystem limitations, the Open Resin Alliance is now fully committed to developing its own Open Source Resin Slicer to ensure true hardware independence and innovation.

That commitment is what DragonFruit, the alliance's own slicer, is being built for. VoxelShift remains the tool for printers and workflows that depend on NanoDLP today.

## Get involved

VoxelShift welcomes contributors: fork the repository, create a feature branch, make sure the app builds cleanly, and open a pull request with a clear description of the change. Testing on printers and slicers beyond those already covered is especially valuable, since format handling is only as good as the files it has been tried against. Join the [Open Resin Alliance Discord](https://discord.gg/beFeTaPH6v) to compare notes on file formats or to report a file that converts badly.

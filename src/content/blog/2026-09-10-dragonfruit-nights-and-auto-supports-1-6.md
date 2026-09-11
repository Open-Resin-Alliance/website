---
title: "How ORA ships: nightlies, dev builds and branch prereleases"
description: DragonFruit nightlies are cut automatically from feature branches, dev builds come from the dev branch on the way to stable, and Orion and Odyssey publish branch prereleases with a consistent naming scheme.
pubDate: 2026-09-10
author: Open Resin Alliance
category: engineering
tags: [dragonfruit, releases, nightlies, ci, development]
project: DragonFruit
---

On 10 September 2026 the DragonFruit releases page gained its newest entry: a nightly build tagged `nightly_feat_auto-supports-v1.6`, published under the name "Feature: Auto Supports V1.6". It arrived the same day as `nightly_sin_slice-baking-crash`, and followed `nightly_feat_slicing-bench-on-dev` from 4 September 2026. None of the three is a stable release. All of them are part of a deliberate release scheme.

## Tag naming is the scheme

DragonFruit uses three kinds of tags, and the name tells you what you are downloading:

- **Version tags** such as `v0.1.15`, numbered releases cut from the `dev` branch on the way to a stable version.
- **Nightly tags** such as `nightly_feat_auto-supports-v1.6`, cut automatically from a feature branch. Slashes in the branch name become underscores, so `feat/auto-supports-v1.6` becomes `nightly_feat_auto-supports-v1.6`.
- **Branch prereleases** on Orion and Odyssey, named `BRANCH_<branch>` with the same slash-to-underscore rule. Examples include `BRANCH_feat/athena_leveling_wizard` for Orion and `BRANCH_klipper_refactor` for Odyssey.

Nightlies exist so a feature can be tried by people outside the team while it is still moving. Every one carries the same automated warning, reproduced here in full:

> 🌙 **Nightly build** from branch `feat/auto-supports-v1.6` … ⚠️ This is an automated pre-release built from a feature branch. It is intended for testing purposes only.

That warning is not boilerplate caution. A nightly is generated from a branch that may contain unfinished work, and it can change or disappear between builds as the branch does. It is intended for testing purposes only, which is exactly what the text says.

## Dev builds and the road to stable

Between nightlies and stable releases sit the dev builds. These are snapshots of the `dev` branch, published regularly to show feature previews, ship bug fixes, and stabilise the tree ahead of the next stable version. The latest is v0.1.15, published on 29 August 2026, which is a dev build on the way to the expected stable v0.2.0, and every DragonFruit release so far is marked as a prerelease.

Orion and Odyssey follow a related pattern. Their stable lines sit at v0.3.2 and 0.4.1, while active work is published as branch prereleases that let testers on specific hardware follow a fix or a refactor before it lands. Those prereleases frequently carry empty release bodies, because their value is the build, not the announcement.

## Why development happens in the open

The reason for publishing unfinished builds is stated in the dev-build disclaimer itself: "We firmly believe in development in the open." Nightlies make the direction of travel visible, let hardware-specific problems surface early, and give contributors a build to test against without waiting for a stable release that may be months away.

It also sets expectations honestly. If a build is a prerelease, or an automated pre-release from a feature branch, the label says so, and the release notes say what is experimental. Users who need predictability can stay on the newest version tag and wait for v0.2.0.

## Get involved

Testing is the most direct way to help: download a nightly from the [DragonFruit releases page](https://github.com/Open-Resin-Alliance/DragonFruit/releases), try it on a model you know, and report anything that regresses. Bugs and ideas belong on the repository, and the [Open Resin Alliance Discord](https://discord.gg/beFeTaPH6v) is the place to ask which build suits your machine before you spend resin on it.

---
spec: "lumen"
title: "Chunk types"
description: "The chunked, zstd-compressed print format for resin printers: layer data as REE streams in independently compressed blocks, JSON metadata in typed chunks, and optional authenticated encryption."
status: "v1.0, published 2026-09-19"
maturity: "published"
license: "MIT"
shortName: "LUMEN"
order: 3
isIndex: false
sourceRepo: "LumenFormat"
sourcePath: "spec/03-chunks.md"
sourceRef: "v1.0"
syncedAt: "2026-09-23"
---

<!-- Part of the LUMEN Format Specification. Section numbers (`§3.1`) are stable anchors across the parts. -->

## 4. Chunk Types

A LUMEN file is composed of typed chunks. The table below summarizes every
chunk defined by this specification. Developers can scan this to understand
the file's capabilities at a glance; detailed binary layouts follow.

| Tag | Name | Required | Reader support | Encrypted | Purpose |
|-----|------|----------|----------------|-----------|---------|
| `HEAD` | Header | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Required | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Display dimensions, layer count, encoder identity |
| `META` | Metadata | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Required | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Print parameters as JSON (exposure, lift, motion) |
| `PROF` | Print Profile | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Optional | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Named, versioned, reusable profile for Odyssey import |
| `AUTH` | Authentication | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Required when the file is encrypted | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Encryption metadata, key wrapping, machine binding |
| `LROV` | Layer Override | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | **Required** - refuse a file you cannot honor ([§4.5](/specs/lumen/print-control#45-lrov---layer-override-chunk)) | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Timing overrides for one `(layer, sector)` pair |
| `PREV` | Preview Image | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Optional | Optional | PNG preview images, multiple roles supported |
| `LTBL` | Layer Table | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Required | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Per-`(layer, sector)` chunk index and slice offsets, for random access |
| `ZDIC` | Zstd Dictionary | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Required when present | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Trained dictionary shared by every LAYR frame |
| `LAYR` | Layer Data | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Required | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | One sector's layer masks for a group of layers, as one zstd frame |
| `LHAS` | Layer Hashes | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Optional | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | SHA-256 Merkle tree for integrity verification |
| `VOXL` | Embedded Scene | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Optional (opaque) | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | Complete VOXL scene file for round-trip re-editing |
| `EXTD` | Extension | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Per-extension: refuse a `critical` one you do not implement | Per-extension | Vendor-specific or future standard extensions |

The **Required** column is about presence in a file: what an encoder must write. **Reader
support** is the separate obligation on the other side, and the two do not line up - a
chunk may be optional to write and still mandatory to honor. An entry that says *Required*
means a reader that cannot meet it MUST refuse the file rather than print an approximation
of it. The chunks that carry the print itself - `HEAD`, `META`, `LTBL`, `LAYR` - are joined
there by `LROV`, because a printer that ignores overrides prints those layers at the wrong
exposure, and nothing in the file says so afterwards.
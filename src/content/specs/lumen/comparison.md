---
spec: "lumen"
title: "Comparison with existing formats"
description: "The chunked, zstd-compressed print format for resin printers: layer data as REE streams in independently compressed blocks, JSON metadata in typed chunks, and optional authenticated encryption."
status: "v1.0, draft"
maturity: "draft"
license: "MIT"
shortName: "LUMEN"
order: 15
isIndex: false
sourceRepo: "LumenFormat"
sourcePath: "spec/15-comparison.md"
sourceRef: "f735b0c"
syncedAt: "2026-09-13"
---

<!-- Part of the LUMEN Format Specification. Section numbers (`§3.1`) are stable anchors across the parts. -->

## 12. Comparison with Existing Formats

| Feature | CTB v5 | GOO | AFZ (Anycubic) | NanoDLP | **LUMEN v1** |
|---------|--------|-----|----------------|---------|-------------|
| Container | Flat binary, fixed header | Flat binary, 195 KB header | ZIP archive | ZIP archive | Chunk directory (extensible) |
| Endianness | LE | BE | LE | LE | LE |
| Metadata | Fixed-offset binary | Fixed-offset binary | JSON files in ZIP | JSON files in ZIP | JSON in typed chunks |
| Human-readable params | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (unzip) | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (`strings` + decompress) |
| Layer encoding | Variable-length RLE, XOR-obfuscated | 0x55-magic RLE, checksum | PW0 RLE (4-bit quant) | PNG (deflate) | REE + zstd with dictionary |
| Compression | RLE only | RLE only | Deflate per-entry | Deflate per PNG | zstd cross-layer with dictionary |
| Cross-layer compression | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (shared-dictionary block frames) |
| Encryption | AES-256-CBC (optional, v5enc) | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | Optional AEAD (AES-256-GCM / ChaCha20-Poly1305) |
| Encryption purpose | Vendor file binding (enforced by the printer) | - | - | - | User security (opt-in) |
| Per-layer overrides | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> (bottom/normal/transition) | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (LROV, arbitrary overrides) |
| Embedded print profile | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (PROF chunk - importable by Odyssey firmware) |
| Embedded source scene | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (VOXL chunk - round-trip re-editable) |
| Multi-material | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (SECT + per-layer sector masks) |
| Extensibility | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> (must reverse-engineer) | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (EXTD chunks, vendor IDs) |
| Max resolution | ~16K (32-bit offsets) | Fixed header limit | Unlimited (ZIP64) | Unlimited | Unlimited (64-bit offsets) |
| Preview images | 2× RGB15 RLE (fixed size) | 2× PNG in header (fixed size) | 3× PNG in ZIP | 1× PNG in ZIP | 1+N PNG in PREV chunks (flexible) |
| AA support | Grayscale RLE | Grayscale RLE | 4-bit PW0 | Full 8-bit PNG | Full 8-bit REE + split encoding + zstd |
| Temperature control | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (chamber + vat, Celsius) |
| Resin cure curve | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--yes" aria-hidden="true">✓</span><span class="visually-hidden">Yes</span> (Dp, Ec, E0 - experimental, for physics-based exposure) |
| Per-layer integrity | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> | <span class="mark mark--no" aria-hidden="true">✗</span><span class="visually-hidden">No</span> (per-layer checksum) | ZIP CRC32 per entry | ZIP CRC32 per entry | SHA-256 Merkle tree (LHAS chunk) + CRC-32C trailer |
| Validation | CRC32 (encrypted only) | One's-complement per layer | ZIP CRC32 per entry | ZIP CRC32 per entry | CRC-32C trailer + structural + semantic + Merkle root |

The columns for formats other than LUMEN are drawn from public community
reverse-engineering and may be inaccurate or out of date. They are here to place
LUMEN's design decisions in context, not to specify those formats.
---
spec: "lumen"
title: "References"
description: "The chunked, zstd-compressed print format for resin printers: layer data as REE streams in independently compressed blocks, JSON metadata in typed chunks, and optional authenticated encryption."
status: "v1.0, draft"
maturity: "draft"
license: "MIT"
shortName: "LUMEN"
order: 21
isIndex: false
sourceRepo: "LumenFormat"
sourcePath: "spec/21-appendix-c-references.md"
sourceRef: "d4b103b"
syncedAt: "2026-09-16"
---

<!-- Part of the LUMEN Format Specification. Section numbers (`§3.1`) are stable anchors across the parts. -->

## Appendix C: References

### Standards & RFCs

| Reference | Topic |
|-----------|-------|
| [zstd RFC 8878](https://datatracker.ietf.org/doc/html/rfc8878) | Zstandard compression algorithm |
| [Protocol Buffers Varint Encoding](https://protobuf.dev/programming-guides/encoding/#varints) | Continuation-bit varint format used for REE |
| [AES-256-KW (RFC 3394)](https://datatracker.ietf.org/doc/html/rfc3394) | Key wrapping for session key encryption |
| [Argon2id (RFC 9106)](https://datatracker.ietf.org/doc/html/rfc9106) | Memory-hard password KDF |
| [X25519 ECDH (RFC 7748)](https://datatracker.ietf.org/doc/html/rfc7748) | Elliptic-curve key agreement for machine binding |
| [ChaCha20-Poly1305 (RFC 8439)](https://datatracker.ietf.org/doc/html/rfc8439) | AEAD cipher option |
| [AES-GCM (NIST SP 800-38D)](https://csrc.nist.gov/publications/detail/sp/800-38d/final) | AEAD cipher option |
| [SHA-256 (FIPS 180-4)](https://csrc.nist.gov/publications/detail/fips/180/4/final) | Merkle tree hash function |
| [CRC-32C (RFC 3720 §12.1)](https://datatracker.ietf.org/doc/html/rfc3720#section-12.1) | Castagnoli CRC for file trailer |

### DragonFruit Project Internals

| Reference | Topic |
|-----------|-------|
| [`DragonFruit/docs/dev/voxl-format-spec.md`](/specs/voxl) | VOXL native scene container specification (embedded via VOXL chunk, [§4.11](/specs/lumen/scene-chunks#411-voxl---embedded-scene-chunk)) |
| [`test-vectors/`](https://github.com/Open-Resin-Alliance/LumenFormat/tree/main/test-vectors) | Conformance corpus: byte-exact vectors and an independent validator ([§11.6](/specs/lumen/validation#116-conformance-corpus)) |
| [`rust/dragonfruit-slicing-engine/src/encoders/mod.rs`](https://github.com/Open-Resin-Alliance/DragonFruit/blob/main/rust/dragonfruit-slicing-engine/src/encoders/mod.rs) | `FormatEncoder` and `RleStreamEncoder` trait contracts |
| [`rust/dragonfruit-slicing-engine/docs/ARCHITECTURE.md`](https://github.com/Open-Resin-Alliance/DragonFruit/blob/main/rust/dragonfruit-slicing-engine/docs/ARCHITECTURE.md) | Slicing engine architecture overview |
| [`rust/dragonfruit-slicing-engine/src/rle.rs`](https://github.com/Open-Resin-Alliance/DragonFruit/blob/main/rust/dragonfruit-slicing-engine/src/rle.rs) | Core RLE types consumed by the LUMEN REE encoder |

### Related Format Specifications

| Reference | Topic |
|-----------|-------|
| [UVTools](https://github.com/sn4k3/UVTools) | ChiTuBox binary format (community reverse-engineering) |
| [GOO file format](https://github.com/elegooofficial/GOO) | Elegoo binary format |
| [NanoDLP format](https://docs.nano3dtech.com/manual/format/) | NanoDLP ZIP-based format |
| [ZIP APPNOTE](https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT) | ZIP archive format (used by AFZ, NanoDLP; referenced for LUMEN's chunk-directory-at-end design) |
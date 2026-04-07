# PolarQuant: Quantizing KV Caches with Polar Transformation

Paper: Insu Han, Praneeth Kacham, Amin Karbasi, Vahab Mirrokni, Amir Zandieh (arXiv:2502.02617, Feb 4, 2025)

## TL;DR

PolarQuant compresses LLM KV cache vectors by:

1. Randomly preconditioning vectors (rotation/sketch),
2. Recursively converting Cartesian coordinates to polar form,
3. Quantizing angles instead of raw coordinates.

Main benefit: it avoids per-block normalization metadata (scale/zero-point), reducing quantization overhead while preserving quality on long-context tasks.

---

## Why this matters

KV cache memory is a bottleneck for long-context inference. Traditional low-bit KV quantizers usually require block-wise normalization and storing extra constants in full precision. That metadata can cost more than 1 extra bit per quantized value in practice.

PolarQuant removes this dependency by exploiting the distribution of angles after random preconditioning.

---

## Core idea

### 1) Random preconditioning

Apply a shared random transform `S` to KV vectors before quantization.

- Preserves geometry (inner products/norms approximately via JL-style sketching, exactly for rotation matrices in implementation).
- Makes transformed coordinates behave like Gaussian samples.

### 2) Recursive polar transform

Instead of quantizing vector components directly:

- Pair coordinates and convert each pair to `(radius, angle)`.
- Recurse on the radii.
- Final representation: one radius + multiple levels of angles.

For `d` dimensions (power of 2), this produces:

- `d - 1` angles
- `1` final radius
- `log2(d)` angle levels.

### 3) Quantize angles with level-wise codebooks

After preconditioning, angle distributions are analytically known and concentrated (especially at deeper levels, around `pi/4`). This lets PolarQuant quantize angles efficiently without storing per-block normalization parameters.

---

## Theoretical highlights

- The paper derives the polar-angle distribution under Gaussian input induced by random preconditioning.
- Angles are independent across coordinates in the transformed representation (under analysis assumptions), so independent scalar quantization is sufficient.
- Main theorem: to achieve expected reconstruction error `epsilon * ||x||^2`, PolarQuant uses `O(log(1/epsilon))` bits per coordinate plus storage for vector norm.

---

## KV-cache memory math

If each original coordinate uses `b_fpn` bits (for example, FP16 => 16 bits), baseline storage is:

- `d * b_fpn` bits per vector.

With PolarQuant full recursion:

- `b_fpn + (d - 1) * b` bits per vector (store one radius + quantized angles).

Example in the paper (`d=128`, `b=3`, `b_fpn=16`):

- compression about `4.008x`.

Practical implementation in the paper uses 4 polar levels (not full recursion), with bit allocation:

- level 1: 4 bits
- levels 2/3/4: 2 bits each
- effective ~`3.875` bits per coordinate (with FP16 radius storage).

---

## Empirical results (paper)

### Needle-in-a-Haystack

- PolarQuant variants outperform token-eviction methods (SnapKV, PyramidKV) and are competitive with/above KIVI at same compression setting.

### LongBench (Llama-3.1-8B-Instruct)

- PolarQuant variants achieve best average among compared compression methods in reported table.
- Online codebook construction gives slightly better quality than offline codebook.

### Runtime trade-off

- Offline codebook construction greatly reduces prefill time vs online.
- Generation time is faster than KIVI in the reported setup, but token-eviction methods remain faster overall (with quality trade-offs).

---

## Comparison to QJL and TurboQuant

### QJL (Quantized JL, 1-bit)

- Strength: extremely low overhead, data-oblivious, very memory efficient.
- Typical focus: 1-bit quantized JL-style projection, especially strong for inner-product preservation with minimal metadata.
- Trade-off: very low bit budget can limit reconstruction fidelity in some regimes.

### TurboQuant

- Strength: near-optimal distortion-rate claims via random rotation + coordinate-wise optimal scalar quantization.
- Adds residual 1-bit QJL stage for unbiased inner-product estimation.
- Broader vector quantization framing beyond KV cache.

### PolarQuant

- Distinctive angle: quantize in polar coordinates (angles) after preconditioning.
- Practical edge for KV cache: avoids block normalization metadata and uses concentrated angle distributions.
- Trade-off: online clustering/codebook construction can increase prefill latency.

---

## When PolarQuant is a good fit

- Long-context serving where KV cache memory is the main bottleneck.
- You need stronger quality than aggressive token eviction.
- You can accept small extra prefill complexity (or use offline codebooks for speed).

## Open engineering choices for deployment

1. Online vs offline angle codebooks (quality vs prefill speed).
2. Number of recursion levels (compression/quality/runtime balance).
3. Bit allocation per level (first level usually needs more bits due wider angle range).
4. Choice of preconditioner (random rotation vs Gaussian sketch).

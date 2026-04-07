"""PolarQuant-style KV-cache quantizer."""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

from .utils import ScalarCodebook, check_power_of_two, kmeans_1d, random_orthogonal


@dataclass(frozen=True)
class PolarCode:
    """Encoded representation for one vector."""

    top_radii: np.ndarray
    angle_indices: list[np.ndarray]


class PolarQuantizer:
    """Reference PolarQuant-style quantizer.

    Pipeline:
    1. Random preconditioning (orthogonal rotation),
    2. Recursive polar transform for a fixed number of levels,
    3. Per-level scalar quantization of angles.
    """

    def __init__(
        self,
        dim: int,
        *,
        levels: int = 4,
        bits_per_level: list[int] | None = None,
        seed: int = 0,
        store_radii_dtype: np.dtype = np.float16,
    ) -> None:
        check_power_of_two(dim, "dim")
        max_levels = int(math.log2(dim))
        if levels <= 0 or levels > max_levels:
            raise ValueError(f"levels must be in [1, {max_levels}], got {levels}")

        self.dim = dim
        self.levels = levels
        self._rng = np.random.default_rng(seed)
        self.preconditioner = random_orthogonal(dim, self._rng)
        self.store_radii_dtype = np.dtype(store_radii_dtype)

        if bits_per_level is None:
            # Paper-inspired default: 4 bits for level-1, 2 bits for remaining.
            bits_per_level = [4] + [2] * (levels - 1)
        if len(bits_per_level) != levels:
            raise ValueError(
                f"bits_per_level must have length {levels}, got {len(bits_per_level)}"
            )
        if any(b <= 0 for b in bits_per_level):
            raise ValueError("all bit-widths in bits_per_level must be positive")
        self.bits_per_level = bits_per_level

        self.codebooks: list[ScalarCodebook] | None = None

    def _polar_transform(self, y: np.ndarray) -> tuple[np.ndarray, list[np.ndarray]]:
        r = np.asarray(y, dtype=np.float32)
        if r.shape != (self.dim,):
            raise ValueError(f"y must have shape ({self.dim},), got {r.shape}")

        angles: list[np.ndarray] = []
        for level in range(1, self.levels + 1):
            r1 = r[0::2]
            r2 = r[1::2]
            theta = np.arctan2(r2, r1).astype(np.float32)
            if level == 1:
                # Keep in [0, 2pi) for first level.
                theta = np.mod(theta, 2.0 * np.pi).astype(np.float32)
            else:
                # Radii are non-negative for level >= 2.
                theta = np.clip(theta, 0.0, np.pi / 2.0).astype(np.float32)
            angles.append(theta)
            r = np.sqrt(np.maximum(r1 * r1 + r2 * r2, 0.0)).astype(np.float32)

        return r, angles

    def _inverse_polar(self, top_radii: np.ndarray, angles: list[np.ndarray]) -> np.ndarray:
        r = np.asarray(top_radii, dtype=np.float32)
        expected = self.dim >> self.levels
        if r.shape != (expected,):
            raise ValueError(
                f"top_radii must have shape ({expected},), got {r.shape}"
            )
        if len(angles) != self.levels:
            raise ValueError(
                f"angles must have {self.levels} levels, got {len(angles)}"
            )

        for level in range(self.levels, 0, -1):
            theta = np.asarray(angles[level - 1], dtype=np.float32)
            if theta.shape != r.shape:
                raise ValueError(
                    f"angles[{level - 1}] shape {theta.shape} "
                    f"does not match expected {r.shape}"
                )
            prev = np.empty((r.size * 2,), dtype=np.float32)
            prev[0::2] = r * np.cos(theta)
            prev[1::2] = r * np.sin(theta)
            r = prev
        return r

    def fit(self, x_batch: np.ndarray) -> None:
        """Fits one scalar codebook per level from data."""
        x_batch = np.asarray(x_batch, dtype=np.float32)
        if x_batch.ndim != 2 or x_batch.shape[1] != self.dim:
            raise ValueError(
                f"x_batch must have shape (n, {self.dim}), got {x_batch.shape}"
            )
        if x_batch.shape[0] == 0:
            raise ValueError("x_batch must contain at least one vector")

        y_batch = x_batch @ self.preconditioner.T
        level_values: list[list[np.ndarray]] = [[] for _ in range(self.levels)]
        for row in y_batch:
            _, angles = self._polar_transform(row)
            for level_idx, theta in enumerate(angles):
                level_values[level_idx].append(theta)

        codebooks: list[ScalarCodebook] = []
        for level_idx in range(self.levels):
            vals = np.concatenate(level_values[level_idx], axis=0).astype(np.float32)
            k = 1 << self.bits_per_level[level_idx]
            cb = kmeans_1d(vals, k, rng=self._rng)
            codebooks.append(cb)
        self.codebooks = codebooks

    def _require_fitted(self) -> list[ScalarCodebook]:
        if self.codebooks is None:
            raise RuntimeError("PolarQuantizer is not fitted. Call fit(x_batch) first.")
        return self.codebooks

    def encode(self, x: np.ndarray) -> PolarCode:
        codebooks = self._require_fitted()
        x = np.asarray(x, dtype=np.float32)
        if x.shape != (self.dim,):
            raise ValueError(f"x must have shape ({self.dim},), got {x.shape}")

        y = self.preconditioner @ x
        top_radii, angles = self._polar_transform(y)
        indices = [
            codebooks[level].quantize(angles[level]).astype(np.int32)
            for level in range(self.levels)
        ]
        return PolarCode(
            top_radii=top_radii.astype(self.store_radii_dtype),
            angle_indices=indices,
        )

    def decode(self, code: PolarCode) -> np.ndarray:
        codebooks = self._require_fitted()
        if len(code.angle_indices) != self.levels:
            raise ValueError(
                f"code.angle_indices must have {self.levels} levels, "
                f"got {len(code.angle_indices)}"
            )
        angles = [
            codebooks[level].dequantize(code.angle_indices[level]).astype(np.float32)
            for level in range(self.levels)
        ]
        y_hat = self._inverse_polar(code.top_radii.astype(np.float32), angles)
        x_hat = self.preconditioner.T @ y_hat
        return x_hat.astype(np.float32)

    def encode_many(self, x_batch: np.ndarray) -> list[PolarCode]:
        x_batch = np.asarray(x_batch, dtype=np.float32)
        if x_batch.ndim != 2 or x_batch.shape[1] != self.dim:
            raise ValueError(
                f"x_batch must have shape (n, {self.dim}), got {x_batch.shape}"
            )
        return [self.encode(row) for row in x_batch]

    def decode_many(self, codes: list[PolarCode]) -> np.ndarray:
        if not codes:
            return np.zeros((0, self.dim), dtype=np.float32)
        return np.stack([self.decode(code) for code in codes], axis=0)

    def estimated_bits_per_vector(self) -> int:
        """Rough fixed-width storage estimate for one vector."""
        top_dim = self.dim >> self.levels
        radii_bits = top_dim * np.dtype(self.store_radii_dtype).itemsize * 8
        angle_bits = 0
        for level_idx in range(self.levels):
            num_angles = self.dim >> (level_idx + 1)
            angle_bits += num_angles * self.bits_per_level[level_idx]
        return int(radii_bits + angle_bits)


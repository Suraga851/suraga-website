"""Shared utilities for vector quantization experiments."""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Optional

import numpy as np


def check_power_of_two(value: int, name: str) -> None:
    if value <= 0 or (value & (value - 1)) != 0:
        raise ValueError(f"{name} must be a positive power of 2, got {value}")


def random_orthogonal(dim: int, rng: np.random.Generator) -> np.ndarray:
    """Generates a random orthogonal matrix using QR decomposition."""
    a = rng.normal(size=(dim, dim)).astype(np.float32)
    q, r = np.linalg.qr(a)
    diag_sign = np.sign(np.diag(r))
    diag_sign[diag_sign == 0.0] = 1.0
    q = q * diag_sign
    return q.astype(np.float32)


@dataclass(frozen=True)
class ScalarCodebook:
    """1D scalar quantization codebook."""

    centroids: np.ndarray

    def quantize(self, values: np.ndarray) -> np.ndarray:
        diffs = np.abs(values[..., None] - self.centroids[None, ...])
        return np.argmin(diffs, axis=-1).astype(np.int32)

    def dequantize(self, indices: np.ndarray) -> np.ndarray:
        return self.centroids[indices]


def _init_centroids(values: np.ndarray, k: int) -> np.ndarray:
    # Robust percentile-based initialization.
    qs = np.linspace(0.0, 1.0, num=k, endpoint=True)
    return np.quantile(values, qs).astype(np.float32)


def kmeans_1d(
    values: np.ndarray,
    k: int,
    *,
    max_iter: int = 40,
    tol: float = 1e-5,
    rng: Optional[np.random.Generator] = None,
) -> ScalarCodebook:
    """Fits 1D k-means centroids (Lloyd-style scalar quantizer)."""
    if values.ndim != 1:
        raise ValueError("values must be a 1D array")
    if values.size == 0:
        raise ValueError("values must not be empty")
    if k <= 0:
        raise ValueError(f"k must be positive, got {k}")

    values = values.astype(np.float32)
    vmin = float(np.min(values))
    vmax = float(np.max(values))
    if math.isclose(vmin, vmax):
        return ScalarCodebook(centroids=np.full((k,), vmin, dtype=np.float32))

    if rng is None:
        rng = np.random.default_rng(0)

    centroids = _init_centroids(values, k)
    for _ in range(max_iter):
        # Assign.
        distances = np.abs(values[:, None] - centroids[None, :])
        clusters = np.argmin(distances, axis=1)

        # Update.
        new_centroids = centroids.copy()
        for idx in range(k):
            mask = clusters == idx
            if np.any(mask):
                new_centroids[idx] = np.mean(values[mask], dtype=np.float32)
            else:
                # Re-seed empty cluster.
                sample = values[rng.integers(0, values.size)]
                new_centroids[idx] = sample

        # Keep ordered for stable nearest lookup.
        new_centroids.sort()
        shift = float(np.max(np.abs(new_centroids - centroids)))
        centroids = new_centroids
        if shift <= tol:
            break

    return ScalarCodebook(centroids=centroids.astype(np.float32))


def mse(x: np.ndarray, y: np.ndarray) -> float:
    diff = x.astype(np.float64) - y.astype(np.float64)
    return float(np.mean(diff * diff))


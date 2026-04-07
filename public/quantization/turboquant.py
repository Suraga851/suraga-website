"""TurboQuant-style online vector quantization."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np

from .qjl import QJLCode, QJLQuantizer
from .utils import ScalarCodebook, kmeans_1d, random_orthogonal


@dataclass(frozen=True)
class TurboCode:
    """Encoded representation for one vector."""

    indices: np.ndarray  # int32 shape: (d,)
    residual_qjl: QJLCode | None = None

    @property
    def bits(self) -> int:
        # Exact entropy coding not modeled; this is the fixed-width count.
        scalar_bits = int(self.indices.size * np.ceil(np.log2(max(1, self.indices.max() + 1))))
        residual_bits = 0 if self.residual_qjl is None else self.residual_qjl.bits
        return scalar_bits + residual_bits


class TurboQuantizer:
    """Reference TurboQuant-style quantizer.

    Stage 1: random rotation + scalar quantization (Lloyd codebook).
    Stage 2 (optional): QJL on residual for better inner-product behavior.
    """

    def __init__(
        self,
        dim: int,
        *,
        bits: int = 3,
        use_residual_qjl: bool = True,
        residual_sketch_dim: int | None = None,
        seed: int = 0,
    ) -> None:
        if dim <= 0:
            raise ValueError(f"dim must be positive, got {dim}")
        if bits <= 0:
            raise ValueError(f"bits must be positive, got {bits}")

        self.dim = dim
        self.bits = bits
        self.levels = 1 << bits
        self._rng = np.random.default_rng(seed)
        self.rotation = random_orthogonal(dim, self._rng)
        self.codebook: ScalarCodebook | None = None

        self.use_residual_qjl = use_residual_qjl
        self.residual_qjl = (
            QJLQuantizer(dim, sketch_dim=residual_sketch_dim, seed=seed + 1)
            if use_residual_qjl
            else None
        )

    def fit(self, x_batch: np.ndarray) -> None:
        """Fits a global scalar codebook on rotated coordinates."""
        x_batch = np.asarray(x_batch, dtype=np.float32)
        if x_batch.ndim != 2 or x_batch.shape[1] != self.dim:
            raise ValueError(
                f"x_batch must have shape (n, {self.dim}), got {x_batch.shape}"
            )

        rotated = x_batch @ self.rotation.T
        flattened = rotated.reshape(-1)
        self.codebook = kmeans_1d(flattened, self.levels, rng=self._rng)

    def _require_fitted(self) -> ScalarCodebook:
        if self.codebook is None:
            raise RuntimeError("TurboQuantizer is not fitted. Call fit(x_batch) first.")
        return self.codebook

    def encode(self, x: np.ndarray) -> TurboCode:
        codebook = self._require_fitted()
        x = np.asarray(x, dtype=np.float32)
        if x.shape != (self.dim,):
            raise ValueError(f"x must have shape ({self.dim},), got {x.shape}")

        y = self.rotation @ x
        indices = codebook.quantize(y)
        y_hat = codebook.dequantize(indices).astype(np.float32)

        residual_code = None
        if self.residual_qjl is not None:
            residual = (y - y_hat).astype(np.float32)
            residual_code = self.residual_qjl.encode(residual)

        return TurboCode(indices=indices, residual_qjl=residual_code)

    def decode(self, code: TurboCode) -> np.ndarray:
        codebook = self._require_fitted()
        if code.indices.shape != (self.dim,):
            raise ValueError(
                f"code.indices must have shape ({self.dim},), got {code.indices.shape}"
            )
        y_hat = codebook.dequantize(code.indices).astype(np.float32)
        if code.residual_qjl is not None:
            y_hat = y_hat + self.residual_qjl.decode(code.residual_qjl)
        x_hat = self.rotation.T @ y_hat
        return x_hat.astype(np.float32)

    def encode_many(self, x_batch: np.ndarray) -> list[TurboCode]:
        x_batch = np.asarray(x_batch, dtype=np.float32)
        if x_batch.ndim != 2 or x_batch.shape[1] != self.dim:
            raise ValueError(
                f"x_batch must have shape (n, {self.dim}), got {x_batch.shape}"
            )
        return [self.encode(row) for row in x_batch]

    def decode_many(self, codes: list[TurboCode]) -> np.ndarray:
        if not codes:
            return np.zeros((0, self.dim), dtype=np.float32)
        return np.stack([self.decode(code) for code in codes], axis=0)

    def estimate_inner_product(self, q: np.ndarray, code: TurboCode) -> float:
        q = np.asarray(q, dtype=np.float32)
        if q.shape != (self.dim,):
            raise ValueError(f"q must have shape ({self.dim},), got {q.shape}")
        x_hat = self.decode(code)
        return float(np.dot(q, x_hat))


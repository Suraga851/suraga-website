"""QJL-style 1-bit random projection quantizer."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np


@dataclass(frozen=True)
class QJLCode:
    """Encoded representation for one vector."""

    signs: np.ndarray  # bool array, shape: (m,)
    norm: float

    @property
    def bits(self) -> int:
        # 1 bit per sign; norm is tracked separately in fp.
        return int(self.signs.size)


class QJLQuantizer:
    """Simple QJL-style quantizer using sign(random projection).

    Notes:
    - This is a reference implementation for experimentation.
    - It stores vector norm separately and reconstructs with a linear estimator.
    """

    def __init__(
        self,
        dim: int,
        *,
        sketch_dim: int | None = None,
        seed: int = 0,
    ) -> None:
        if dim <= 0:
            raise ValueError(f"dim must be positive, got {dim}")
        if sketch_dim is None:
            sketch_dim = dim
        if sketch_dim <= 0:
            raise ValueError(f"sketch_dim must be positive, got {sketch_dim}")

        self.dim = dim
        self.sketch_dim = sketch_dim
        self._rng = np.random.default_rng(seed)
        # Unnormalized Gaussian rows are useful for sign-based reconstruction.
        self.g = self._rng.normal(size=(sketch_dim, dim)).astype(np.float32)
        self._recon_scale = float(np.sqrt(np.pi / 2.0) / sketch_dim)

    def encode(self, x: np.ndarray) -> QJLCode:
        x = np.asarray(x, dtype=np.float32)
        if x.shape != (self.dim,):
            raise ValueError(f"x must have shape ({self.dim},), got {x.shape}")
        proj = self.g @ x
        signs = proj >= 0.0
        norm = float(np.linalg.norm(x))
        return QJLCode(signs=signs, norm=norm)

    def decode(self, code: QJLCode) -> np.ndarray:
        if code.signs.shape != (self.sketch_dim,):
            raise ValueError(
                f"code.signs must have shape ({self.sketch_dim},), got {code.signs.shape}"
            )
        s = np.where(code.signs, 1.0, -1.0).astype(np.float32)
        unit_est = self._recon_scale * (self.g.T @ s)
        est_norm = float(np.linalg.norm(unit_est))
        if est_norm > 0.0:
            unit_est /= est_norm
        return (code.norm * unit_est).astype(np.float32)

    def encode_many(self, x_batch: np.ndarray) -> list[QJLCode]:
        x_batch = np.asarray(x_batch, dtype=np.float32)
        if x_batch.ndim != 2 or x_batch.shape[1] != self.dim:
            raise ValueError(
                f"x_batch must have shape (n, {self.dim}), got {x_batch.shape}"
            )
        return [self.encode(row) for row in x_batch]

    def decode_many(self, codes: Iterable[QJLCode]) -> np.ndarray:
        decoded = [self.decode(code) for code in codes]
        if not decoded:
            return np.zeros((0, self.dim), dtype=np.float32)
        return np.stack(decoded, axis=0)

    def estimate_inner_product(self, q: np.ndarray, code: QJLCode) -> float:
        q = np.asarray(q, dtype=np.float32)
        if q.shape != (self.dim,):
            raise ValueError(f"q must have shape ({self.dim},), got {q.shape}")
        x_hat = self.decode(code)
        return float(np.dot(q, x_hat))


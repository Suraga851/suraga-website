"""Small benchmark/demo for QJL, TurboQuant, and PolarQuant.

Usage:
  python -m quantization.demo
"""

from __future__ import annotations

import numpy as np

from .polarquant import PolarQuantizer
from .qjl import QJLQuantizer
from .turboquant import TurboQuantizer
from .utils import mse


def _inner_product_mse(
    q_batch: np.ndarray, x_batch: np.ndarray, x_hat_batch: np.ndarray
) -> float:
    truth = np.sum(q_batch * x_batch, axis=1)
    approx = np.sum(q_batch * x_hat_batch, axis=1)
    return float(np.mean((truth - approx) ** 2))


def run_demo(seed: int = 7) -> None:
    rng = np.random.default_rng(seed)
    dim = 128
    n_train = 2048
    n_test = 256

    train = rng.normal(size=(n_train, dim)).astype(np.float32)
    test = rng.normal(size=(n_test, dim)).astype(np.float32)
    queries = rng.normal(size=(n_test, dim)).astype(np.float32)

    print("=== Quantization Demo ===")
    print(f"dim={dim}, n_train={n_train}, n_test={n_test}")

    # QJL
    qjl = QJLQuantizer(dim, sketch_dim=dim, seed=seed)
    qjl_codes = qjl.encode_many(test)
    qjl_hat = qjl.decode_many(qjl_codes)
    print("\n[QJL]")
    print(f"reconstruction mse: {mse(test, qjl_hat):.6f}")
    print(f"inner-product mse: {_inner_product_mse(queries, test, qjl_hat):.6f}")

    # TurboQuant
    turbo = TurboQuantizer(dim, bits=3, use_residual_qjl=True, seed=seed)
    turbo.fit(train)
    turbo_codes = turbo.encode_many(test)
    turbo_hat = turbo.decode_many(turbo_codes)
    print("\n[TurboQuant]")
    print(f"reconstruction mse: {mse(test, turbo_hat):.6f}")
    print(f"inner-product mse: {_inner_product_mse(queries, test, turbo_hat):.6f}")

    # PolarQuant
    polar = PolarQuantizer(dim, levels=4, bits_per_level=[4, 2, 2, 2], seed=seed)
    polar.fit(train)
    polar_codes = polar.encode_many(test)
    polar_hat = polar.decode_many(polar_codes)
    print("\n[PolarQuant]")
    print(f"reconstruction mse: {mse(test, polar_hat):.6f}")
    print(f"inner-product mse: {_inner_product_mse(queries, test, polar_hat):.6f}")
    print(f"estimated bits/vector: {polar.estimated_bits_per_vector()}")


if __name__ == "__main__":
    run_demo()


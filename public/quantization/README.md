# Quantization Implementations

This folder contains reference implementations of:

- `QJLQuantizer` (`qjl.py`)
- `TurboQuantizer` (`turboquant.py`)
- `PolarQuantizer` (`polarquant.py`)

## Quick Start

```python
import numpy as np
from quantization import QJLQuantizer, TurboQuantizer, PolarQuantizer

dim = 128
rng = np.random.default_rng(0)
x_train = rng.normal(size=(2048, dim)).astype(np.float32)
x = rng.normal(size=(dim,)).astype(np.float32)

# QJL
qjl = QJLQuantizer(dim, sketch_dim=dim, seed=0)
qjl_code = qjl.encode(x)
x_qjl = qjl.decode(qjl_code)

# TurboQuant
turbo = TurboQuantizer(dim, bits=3, use_residual_qjl=True, seed=0)
turbo.fit(x_train)
turbo_code = turbo.encode(x)
x_turbo = turbo.decode(turbo_code)

# PolarQuant
polar = PolarQuantizer(dim, levels=4, bits_per_level=[4, 2, 2, 2], seed=0)
polar.fit(x_train)
polar_code = polar.encode(x)
x_polar = polar.decode(polar_code)
```

## Demo

Run:

```bash
python -m quantization.demo
```

It prints reconstruction MSE and inner-product MSE for all three quantizers on synthetic data.

## Notes

- These are practical reference implementations rather than paper-exact optimized kernels.
- `PolarQuantizer` uses recursive polar angles plus per-level scalar codebooks.
- `TurboQuantizer` uses random rotation + scalar codebook, with optional residual QJL stage.
- `QJLQuantizer` provides a 1-bit sketch-based encoding with norm side-information.


"""Reference implementations of QJL, TurboQuant, and PolarQuant.

These implementations are designed for experimentation and clarity.
They expose a consistent API:

1. fit(X) for optional calibration/codebook creation,
2. encode(x) for quantization,
3. decode(code) for reconstruction.
"""

from .qjl import QJLCode, QJLQuantizer
from .turboquant import TurboCode, TurboQuantizer
from .polarquant import PolarCode, PolarQuantizer

__all__ = [
    "QJLCode",
    "QJLQuantizer",
    "TurboCode",
    "TurboQuantizer",
    "PolarCode",
    "PolarQuantizer",
]


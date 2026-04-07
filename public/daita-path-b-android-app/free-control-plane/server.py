import hashlib
import os
import random
import time
import threading
from typing import Literal

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="SuragaSuperSecVPN Free Control Plane", version="1.0.0")

CONTROL_TOKEN = os.getenv("SURAGA_CONTROL_TOKEN", "").strip()
COVER_TARGET_HOST = os.getenv("SURAGA_COVER_TARGET_HOST", "1.1.1.1").strip()
COVER_TARGET_PORT = int(os.getenv("SURAGA_COVER_TARGET_PORT", "53"))
REQUIRE_TOKEN = os.getenv("SURAGA_REQUIRE_TOKEN", "1").strip().lower() not in {"0", "false", "no"}
RATE_LIMIT_PER_MIN = int(os.getenv("SURAGA_RATE_LIMIT_PER_MIN", "120"))

_rate_lock = threading.Lock()
_rate_windows: dict[str, list[float]] = {}


class ScheduleRequest(BaseModel):
    client_id: str = Field(min_length=1, max_length=128)
    enabled: bool = True
    intensity: Literal["LOW", "BALANCED", "AGGRESSIVE"] = "BALANCED"
    tx_bytes: int = Field(ge=0)
    rx_bytes: int = Field(ge=0)
    padding_bytes: int = Field(ge=0)


class ScheduleResponse(BaseModel):
    ttl_ms: int
    target_host: str
    target_port: int
    min_padding_bytes: int
    max_padding_bytes: int
    max_events_per_tick: int
    max_bytes_per_min: int
    burst_count: int
    base_delay_ms: int
    max_jitter_ms: int


def auth_or_raise(authorization: str | None) -> None:
    if not REQUIRE_TOKEN:
        return

    if not CONTROL_TOKEN:
        raise HTTPException(status_code=503, detail="Server token not configured")

    expected = f"Bearer {CONTROL_TOKEN}"
    if authorization != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")


def check_rate_limit(client_id: str) -> None:
    now = time.time()
    with _rate_lock:
        bucket = _rate_windows.get(client_id, [])
        bucket = [t for t in bucket if now - t < 60.0]
        if len(bucket) >= RATE_LIMIT_PER_MIN:
            _rate_windows[client_id] = bucket
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        bucket.append(now)
        _rate_windows[client_id] = bucket


def profile_for(intensity: str) -> dict[str, int]:
    if intensity == "LOW":
        return {
            "min_padding_bytes": 72,
            "max_padding_bytes": 220,
            "max_events_per_tick": 2,
            "max_bytes_per_min": 64 * 1024,
            "base_delay_min": 7,
            "base_delay_max": 20,
        }
    if intensity == "AGGRESSIVE":
        return {
            "min_padding_bytes": 140,
            "max_padding_bytes": 620,
            "max_events_per_tick": 6,
            "max_bytes_per_min": 320 * 1024,
            "base_delay_min": 4,
            "base_delay_max": 14,
        }
    return {
        "min_padding_bytes": 100,
        "max_padding_bytes": 360,
        "max_events_per_tick": 4,
        "max_bytes_per_min": 160 * 1024,
        "base_delay_min": 6,
        "base_delay_max": 18,
    }


def stable_random(client_id: str, window_seconds: int = 10) -> random.Random:
    slot = int(time.time() // window_seconds)
    seed_text = f"{client_id}:{slot}"
    seed_hash = hashlib.sha256(seed_text.encode("utf-8")).hexdigest()[:16]
    seed = int(seed_hash, 16)
    return random.Random(seed)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/schedule", response_model=ScheduleResponse)
def schedule(
    request: ScheduleRequest,
    authorization: str | None = Header(default=None),
) -> ScheduleResponse:
    auth_or_raise(authorization)
    check_rate_limit(request.client_id)

    profile = profile_for(request.intensity)
    rng = stable_random(request.client_id)

    # Traffic-adaptive bursts: increase cover events when tx is actively changing.
    tx_noise_factor = 1 + min(request.tx_bytes // (256 * 1024), 4)
    burst = min(profile["max_events_per_tick"], rng.randint(1, tx_noise_factor + 1))

    # Keep jitter and TTL bounded for stable client behavior.
    ttl_ms = 15_000 + rng.randint(-2_000, 2_000)
    max_jitter_ms = 25 + rng.randint(0, 45)
    base_delay_ms = rng.randint(profile["base_delay_min"], profile["base_delay_max"])

    if not request.enabled:
        burst = 1
        max_jitter_ms = 10
        base_delay_ms = 20

    return ScheduleResponse(
        ttl_ms=max(5_000, min(ttl_ms, 60_000)),
        target_host=COVER_TARGET_HOST,
        target_port=max(1, min(COVER_TARGET_PORT, 65_535)),
        min_padding_bytes=profile["min_padding_bytes"],
        max_padding_bytes=profile["max_padding_bytes"],
        max_events_per_tick=profile["max_events_per_tick"],
        max_bytes_per_min=profile["max_bytes_per_min"],
        burst_count=burst,
        base_delay_ms=base_delay_ms,
        max_jitter_ms=max_jitter_ms,
    )

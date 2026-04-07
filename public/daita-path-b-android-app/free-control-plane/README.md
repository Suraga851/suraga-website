# Free Control Plane (Self-Hosted)

This is a free scheduler backend for SuragaSuperSecVPN DAITA-like runtime.

## 1) Install

```powershell
cd "C:\Users\Mohamed Daoud\Desktop\suraga-website\public\daita-path-b-android-app\free-control-plane"
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Run

```powershell
$env:SURAGA_CONTROL_TOKEN="your-token-here"    # required by default
$env:SURAGA_REQUIRE_TOKEN="1"                  # default: 1
$env:SURAGA_RATE_LIMIT_PER_MIN="120"           # optional
$env:SURAGA_COVER_TARGET_HOST="1.1.1.1"        # optional
$env:SURAGA_COVER_TARGET_PORT="53"             # optional

uvicorn server:app --host 0.0.0.0 --port 8787 --no-access-log
```

## 3) Configure in app

- Enable `Use remote control-plane scheduler`
- Endpoint: `http://<your-pc-lan-ip>:8787/v1/schedule`
- Token: same `SURAGA_CONTROL_TOKEN` value (required for non-local endpoint usage)

Example endpoint on LAN:

`http://192.168.1.25:8787/v1/schedule`

## Health check

Open:

`http://<your-pc-lan-ip>:8787/health`

Expected response:

```json
{"status":"ok"}
```

## Privacy notes

- The server stores no long-term client history.
- In-memory rate-limit state rotates continuously in 60s windows.
- For strongest security, expose this endpoint via HTTPS reverse proxy/tunnel.

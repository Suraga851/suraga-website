# SuragaSuperSecVPN

Android WireGuard client with DAITA-style cover-traffic runtime powered by Maybenot.

## Current architecture

- Real tunnel backend: `com.wireguard.android:tunnel` (`GoBackend`)
- Config input: paste full WireGuard `.conf`
- DAITA layer:
  - samples WireGuard tx/rx counters,
  - feeds events into native Maybenot engine,
  - schedules bounded UDP cover-traffic sends,
  - can pull adaptive schedules from a free self-hosted control-plane.
- Security hardening:
  - encrypted local storage for WireGuard/control settings (with safe fallback),
  - strict profile checks (DNS required + full-tunnel AllowedIPs),
  - HTTPS enforcement for non-local control-plane endpoints,
  - token-gated control-plane mode.

## Important limitation

This is **DAITA-like**, not Mullvad's exact DAITA implementation. Exact parity requires coordinated server-side logic and WireGuard backend internals not exposed by stock Android APIs.

## Open project

Open folder in Android Studio:

`C:\Users\Mohamed Daoud\Desktop\suraga-website\public\daita-path-b-android-app`

## Build Rust JNI library

```powershell
$env:ANDROID_SDK_ROOT="$env:LOCALAPPDATA\Android\Sdk"
$env:ANDROID_NDK_HOME=(Get-ChildItem "$env:ANDROID_SDK_ROOT\ndk" | Sort-Object Name -Descending | Select-Object -First 1).FullName
$env:Path="$env:USERPROFILE\.cargo\bin;$env:Path"

.\scripts\build-rust.ps1 -ProjectRoot "C:\Users\Mohamed Daoud\Desktop\suraga-website\public\daita-path-b-android-app"
```

## Build APK

```powershell
.\gradlew.bat :app:assembleDebug
```

Output:

`app\build\outputs\apk\debug\app-debug.apk`

## Free control-plane mode

Run your own free scheduler backend:

`free-control-plane/README.md`

Then in app:

- Enable `Use remote control-plane scheduler`
- Set endpoint to `http://<your-lan-ip>:8787/v1/schedule`
- Set token if configured on server

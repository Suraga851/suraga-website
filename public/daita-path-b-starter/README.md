# Path B Starter: Android + Rust (Maybenot) + Tunnel Hook Points

This starter gives you a concrete baseline for the "Path B" approach:

1. Android app (Kotlin, `VpnService`)
2. Rust `cdylib` built for Android ABIs
3. JNI bridge Kotlin <-> Rust
4. Maybenot framework trigger wiring in Rust

It is not a full DAITA clone. It is a legal research starter you can extend.

## What this folder contains

- `rust-lib/`: Rust JNI library (`daita_rust`) with Maybenot-based event handling.
- `android-snippets/`: Kotlin bridge + minimal service-side hook examples.
- `scripts/build-rust.ps1`: Windows PowerShell build script for Android ABIs.

## 0) Prerequisites (Windows)

Install:

- Android Studio (current stable)
- Android SDK + NDK (26+)
- Rust (`rustup`)
- `cargo-ndk`

Commands:

```powershell
rustup default stable
rustup target add aarch64-linux-android armv7-linux-androideabi x86_64-linux-android
cargo install cargo-ndk
```

Set environment variables (adjust paths):

```powershell
$env:ANDROID_SDK_ROOT="C:\Users\<YOU>\AppData\Local\Android\Sdk"
$env:ANDROID_NDK_HOME="$env:ANDROID_SDK_ROOT\ndk\27.0.12077973"
```

Persist them in System Properties if needed.

## 1) Create Android project

In Android Studio:

- New Project -> Empty Activity
- Language: Kotlin
- Min SDK: 26+
- Package example in snippets uses: `com.example.daita`

If your package name differs, either:

- keep Kotlin files in `com.example.daita`, or
- rename JNI symbols in `rust-lib/src/lib.rs` (`Java_<package>_<class>_<method>`).

Assume project root:

```text
<your-project>/
  app/
```

## 2) Add Rust module beside `app`

Copy `rust-lib` from this starter so layout becomes:

```text
<your-project>/
  app/
  rust-lib/
```

## 3) Build Rust `.so` files into `jniLibs`

From this starter folder run:

```powershell
.\scripts\build-rust.ps1 -ProjectRoot "C:\path\to\<your-project>"
```

This writes libraries to:

```text
app/src/main/jniLibs/<abi>/libdaita_rust.so
```

## 4) Add Kotlin JNI bridge

Copy files from `android-snippets/` into your app package, e.g.:

```text
app/src/main/java/com/example/daita/NativeDaita.kt
app/src/main/java/com/example/daita/DaitaEngine.kt
app/src/main/java/com/example/daita/VpnServiceHook.kt
```

## 5) Hook into your tunnel send path

`DaitaEngine.onNormalPacketSent()` returns delay (ms) if Maybenot schedules padding.

You must connect this to your actual tunnel send queue:

- On each encrypted normal packet send: call `onNormalPacketSent()`.
- If return > 0: schedule a padding send after delay.
- Padding must be tunneled as encrypted payload and tagged/handled safely.

## 6) Add a real tunnel backend

Two practical options:

- WireGuard tunnel AAR (`com.wireguard.android:tunnel`) inside Android app.
- GotaTun as native/userspace backend and route packets through your service.

Use this starter as control-plane/noise engine first, then integrate data-plane.

## 7) Safety and performance checklist

- Add hard caps for padding rate and total overhead.
- Never block UI thread; run tunnel + timers on dedicated coroutine dispatcher.
- Measure battery/CPU/network overhead on real device.
- Implement kill switch and strict failure behavior for tunnel loss.
- Add metrics for: padding bytes, scheduled actions, queue delay, drop rate.

## Source references used for this starter

- Maybenot repository: https://github.com/maybenot-io/maybenot
- Maybenot docs: https://docs.rs/maybenot/latest/maybenot/
- Maybenot FFI docs: https://docs.rs/maybenot-ffi/latest/maybenot_ffi/
- GotaTun repository: https://github.com/mullvad/gotatun
- WireGuard embedding page: https://www.wireguard.com/embedding/

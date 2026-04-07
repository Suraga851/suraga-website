param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot,

    [switch]$StripDebugSymbols
)

$ErrorActionPreference = "Stop"

$RustLib = Join-Path $ProjectRoot "rust-lib"
$JniOut  = Join-Path $ProjectRoot "app\src\main\jniLibs"

# ── Pre-flight checks ─────────────────────────────────────────────────────────

if (-not (Test-Path $RustLib)) {
    throw "Missing rust-lib at: $RustLib"
}

if (-not $env:ANDROID_NDK_HOME) {
    throw "ANDROID_NDK_HOME is not set. Set it to your Android NDK path (e.g. C:\...\ndk\27.0.12077973)."
}

# ── Build ─────────────────────────────────────────────────────────────────────

$Targets = @("arm64-v8a", "armeabi-v7a", "x86_64", "x86")

Write-Host ""
Write-Host "=== DAITA Rust JNI build ===" -ForegroundColor Cyan
Write-Host "Project root : $ProjectRoot"
Write-Host "rust-lib     : $RustLib"
Write-Host "JNI output   : $JniOut"
Write-Host "ABI targets  : $($Targets -join ', ')"
Write-Host ""

# Optionally strip debug symbols for smaller release .so files.
$RustFlags = if ($StripDebugSymbols) { "-C strip=symbols" } else { "" }

Push-Location $RustLib
try {
    $env:RUSTFLAGS = $RustFlags
    cargo ndk `
        -t arm64-v8a `
        -t armeabi-v7a `
        -t x86_64 `
        -t x86 `
        -o $JniOut `
        build --release
}
finally {
    $env:RUSTFLAGS = ""
    Pop-Location
}

# ── Size report ───────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "=== Output .so sizes ===" -ForegroundColor Cyan
foreach ($abi in $Targets) {
    $so = Join-Path $JniOut "$abi\libdaita_rust.so"
    if (Test-Path $so) {
        $sizeKb = [math]::Round((Get-Item $so).Length / 1KB, 1)
        Write-Host ("  {0,-20} {1,8} KB" -f $abi, $sizeKb)
    } else {
        Write-Host ("  {0,-20}  <not found>" -f $abi) -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host "Rust build completed." -ForegroundColor Green

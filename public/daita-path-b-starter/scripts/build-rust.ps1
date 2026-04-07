param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"

$RustLib = Join-Path $ProjectRoot "rust-lib"
$JniOut = Join-Path $ProjectRoot "app\src\main\jniLibs"

if (-not (Test-Path $RustLib)) {
    throw "Missing rust-lib at: $RustLib"
}

if (-not $env:ANDROID_NDK_HOME) {
    throw "ANDROID_NDK_HOME is not set. Set it to your Android NDK path."
}

Write-Host "Building Rust JNI library..."
Write-Host "Project root: $ProjectRoot"
Write-Host "Output jniLibs: $JniOut"

Push-Location $RustLib
try {
    cargo ndk `
        -t arm64-v8a `
        -t armeabi-v7a `
        -t x86_64 `
        -o $JniOut `
        build --release
}
finally {
    Pop-Location
}

Write-Host "Rust build completed."

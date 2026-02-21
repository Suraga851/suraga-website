@echo off
setlocal
echo ===========================================
echo   Build and Run (Render Stack)
echo ===========================================

call npm run build:pages
if %ERRORLEVEL% NEQ 0 (
    echo Static page generation failed.
    exit /b 1
)

echo Starting Rust server...
cargo run --release

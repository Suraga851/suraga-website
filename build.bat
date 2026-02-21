@echo off
setlocal
echo ===========================================
echo   Build Static Pages
echo ===========================================

call npm run build:pages
if %ERRORLEVEL% NEQ 0 (
    echo Build failed.
    exit /b 1
)

echo Build complete.

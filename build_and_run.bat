@echo off
setlocal enabledelayedexpansion
echo ===========================================
echo   Suraga Website - High Performance Build
echo ===========================================

echo.
echo [1/3] Checking Environment...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed.
    goto :Fail
)

where tsc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Warning: TypeScript is not installed. Skipping TS compilation.
) else (
    echo [2/3] Compiling TypeScript...
    call tsc
    if !ERRORLEVEL! NEQ 0 (
        echo Error: TypeScript compilation failed.
        goto :Fail
    )
    echo    - TypeScript compiled to public/js/
)

echo.
echo [3/3] Starting High-Performance Node Server...
echo.

node server.js
goto :EOF

:Fail
echo.
echo Build Failed.
exit /b 1

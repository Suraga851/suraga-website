#requires -Version 5.1
[CmdletBinding()]
param(
    [switch]$Extreme,
    [switch]$IncludeGoogle,
    [switch]$IncludeSamsungAccount
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

if (-not (Test-Administrator)) {
    $scriptPath = $PSCommandPath
    $argList = @(
        "-NoProfile",
        "-ExecutionPolicy", "Bypass",
        "-File", "`"$scriptPath`""
    )
    if ($Extreme) { $argList += "-Extreme" }
    if ($IncludeGoogle) { $argList += "-IncludeGoogle" }
    if ($IncludeSamsungAccount) { $argList += "-IncludeSamsungAccount" }

    Start-Process -FilePath "powershell.exe" -ArgumentList $argList -Verb RunAs -WindowStyle Normal
    return
}

$here = Split-Path -Parent $PSCommandPath
$install = Join-Path $here "Install-ADB.ps1"
$debloat = Join-Path $here "Samsung-A12-Debloat.ps1"
$profile = if ($Extreme) { "Extreme" } else { "Aggressive" }

Write-Host "Installing/updating official ADB..." -ForegroundColor Cyan
& $install -MachinePath

Write-Host ""
Write-Host "Running preview first. Nothing will be changed yet." -ForegroundColor Cyan
$previewArgs = @("-Action", "Preview", "-Profile", $profile)
if ($IncludeGoogle) { $previewArgs += "-IncludeGoogle" }
if ($IncludeSamsungAccount) { $previewArgs += "-IncludeSamsungAccount" }
& $debloat @previewArgs

Write-Host ""
Write-Host "Choose what to do next:" -ForegroundColor Cyan
Write-Host "1. Disable selected packages for user 0 (recommended)"
Write-Host "2. Uninstall selected packages for user 0"
Write-Host "3. Inventory only / exit"
$choice = Read-Host "Enter 1, 2, or 3"

if ($choice -eq "1") {
    $args = @("-Action", "Disable", "-Profile", $profile)
} elseif ($choice -eq "2") {
    $args = @("-Action", "Uninstall", "-Profile", $profile)
} else {
    Write-Host "Leaving the phone unchanged." -ForegroundColor Green
    return
}

if ($IncludeGoogle) { $args += "-IncludeGoogle" }
if ($IncludeSamsungAccount) { $args += "-IncludeSamsungAccount" }
& $debloat @args


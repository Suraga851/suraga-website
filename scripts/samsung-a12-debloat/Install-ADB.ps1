#requires -Version 5.1
[CmdletBinding()]
param(
    [string]$InstallRoot = "C:\Android",
    [switch]$MachinePath,
    [switch]$NoPathUpdate
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$PlatformToolsUrl = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"
$InstallDir = Join-Path $InstallRoot "platform-tools"

function Test-Administrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

function Add-PathEntry {
    param(
        [Parameter(Mandatory = $true)][string]$PathToAdd,
        [switch]$Machine
    )

    $scope = if ($Machine) { "Machine" } else { "User" }
    $current = [Environment]::GetEnvironmentVariable("Path", $scope)
    $parts = @()
    if ($current) {
        $parts = $current -split ";" | Where-Object { $_ -and $_.Trim() }
    }

    $alreadyPresent = $false
    foreach ($part in $parts) {
        if ([string]::Equals($part.TrimEnd("\"), $PathToAdd.TrimEnd("\"), [StringComparison]::OrdinalIgnoreCase)) {
            $alreadyPresent = $true
            break
        }
    }

    if (-not $alreadyPresent) {
        $newPath = if ($current) { $current.TrimEnd(";") + ";" + $PathToAdd } else { $PathToAdd }
        [Environment]::SetEnvironmentVariable("Path", $newPath, $scope)
        $env:Path = $env:Path.TrimEnd(";") + ";" + $PathToAdd
        Write-Host "Added ADB to $scope PATH: $PathToAdd" -ForegroundColor Green
    } else {
        Write-Host "ADB is already in $scope PATH: $PathToAdd" -ForegroundColor DarkGreen
    }
}

if ($MachinePath -and -not (Test-Administrator)) {
    throw "Machine PATH updates require an elevated PowerShell window. Re-run as Administrator or omit -MachinePath."
}

New-Item -ItemType Directory -Path $InstallRoot -Force | Out-Null

$tempRoot = Join-Path ([IO.Path]::GetTempPath()) ("platform-tools-" + [guid]::NewGuid().ToString("N"))
$zipPath = Join-Path $tempRoot "platform-tools-latest-windows.zip"
New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null

try {
    Write-Host "Downloading official Android SDK Platform Tools..." -ForegroundColor Cyan
    Write-Host $PlatformToolsUrl
    Invoke-WebRequest -Uri $PlatformToolsUrl -OutFile $zipPath -UseBasicParsing

    Write-Host "Extracting Platform Tools..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $tempRoot -Force

    $extracted = Join-Path $tempRoot "platform-tools"
    $adbPath = Join-Path $extracted "adb.exe"
    if (-not (Test-Path -LiteralPath $adbPath)) {
        throw "Downloaded archive did not contain adb.exe where expected."
    }

    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Copy-Item -Path (Join-Path $extracted "*") -Destination $InstallDir -Recurse -Force

    $installedAdb = Join-Path $InstallDir "adb.exe"
    Write-Host "Installed ADB to: $installedAdb" -ForegroundColor Green
    & $installedAdb version

    if (-not $NoPathUpdate) {
        Add-PathEntry -PathToAdd $InstallDir -Machine:$MachinePath
    }
} finally {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}


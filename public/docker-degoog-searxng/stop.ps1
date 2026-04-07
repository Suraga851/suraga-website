$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectRoot

docker context use desktop-linux | Out-Null
docker compose down

Write-Host ""
Write-Host "SearXNG stack stopped."

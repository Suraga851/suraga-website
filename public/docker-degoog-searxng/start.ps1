$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectRoot

docker context use desktop-linux | Out-Null
docker compose pull
docker compose up -d
docker compose ps

Write-Host ""
Write-Host "SearXNG is starting. Open: http://localhost:8080"

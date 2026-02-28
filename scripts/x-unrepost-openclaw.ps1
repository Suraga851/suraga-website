[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Username,

  [string]$BrowserProfile = "openclaw",
  [ValidateSet("profile", "search")]
  [string]$StartFrom = "profile",
  [int]$MaxActions = 2000,
  [int]$LoopLimit = 5000,
  [int]$MinDelayMs = 1800,
  [int]$MaxDelayMs = 3800,
  [int]$StopAfterEmptyLoops = 30,
  [switch]$DoNotAutoStartGateway,
  [switch]$SkipManualPrompt
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($MinDelayMs -lt 200) {
  throw "MinDelayMs is too low. Use >= 200ms."
}
if ($MaxDelayMs -lt $MinDelayMs) {
  throw "MaxDelayMs must be >= MinDelayMs."
}
if ($MaxActions -lt 1) {
  throw "MaxActions must be >= 1."
}
if ($LoopLimit -lt 1) {
  throw "LoopLimit must be >= 1."
}
if ($StopAfterEmptyLoops -lt 1) {
  throw "StopAfterEmptyLoops must be >= 1."
}

function Get-OpenClawPath {
  $moduleEntry = Join-Path $env:APPDATA "npm\node_modules\openclaw\openclaw.mjs"
  if (Test-Path $moduleEntry) {
    return $moduleEntry
  }

  $ps1Candidate = Join-Path $env:APPDATA "npm\openclaw.ps1"
  if (Test-Path $ps1Candidate) {
    return $ps1Candidate
  }

  $cmdCandidate = Join-Path $env:APPDATA "npm\openclaw.cmd"
  if (Test-Path $cmdCandidate) {
    return $cmdCandidate
  }

  $cmd = Get-Command openclaw -ErrorAction SilentlyContinue
  if ($cmd) {
    return $cmd.Source
  }

  throw "OpenClaw CLI not found. Install with: npm install -g openclaw@latest"
}

function Invoke-OpenClaw {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
  )

  if ($script:OpenClawExe.ToLowerInvariant().EndsWith(".mjs")) {
    $output = & $script:NodeExe $script:OpenClawExe @Arguments 2>&1
  } else {
    $output = & $script:OpenClawExe @Arguments 2>&1
  }
  if ($null -eq $output) {
    return @()
  }
  if ($output -is [System.Array]) {
    return $output | ForEach-Object { $_.ToString() }
  }
  return @($output.ToString())
}

function Test-GatewayHealthy {
  $health = Invoke-OpenClaw --no-color gateway health
  if ($LASTEXITCODE -ne 0) {
    return $false
  }
  return (($health -join "`n") -match "Gateway Health")
}

function Ensure-Gateway {
  if (Test-GatewayHealthy) {
    return
  }

  if ($DoNotAutoStartGateway) {
    throw "Gateway is not reachable. Start it manually: openclaw gateway run"
  }

  Write-Host "Starting OpenClaw gateway in background..."
  if ($script:OpenClawExe.ToLowerInvariant().EndsWith(".mjs")) {
    Start-Process -FilePath $script:NodeExe -ArgumentList @(
      $script:OpenClawExe,
      "gateway",
      "run"
    ) -WindowStyle Minimized | Out-Null
  } elseif ($script:OpenClawExe.ToLowerInvariant().EndsWith(".ps1")) {
    Start-Process -FilePath "powershell.exe" -ArgumentList @(
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      $script:OpenClawExe,
      "gateway",
      "run"
    ) -WindowStyle Minimized | Out-Null
  } else {
    Start-Process -FilePath $script:OpenClawExe -ArgumentList @("gateway", "run") -WindowStyle Minimized | Out-Null
  }

  $ready = $false
  for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 2
    if (Test-GatewayHealthy) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    throw "Gateway did not start. Run this manually in another PowerShell window: openclaw gateway run"
  }
}

function Test-BrowserRunning {
  param([string]$Profile)
  $status = Invoke-OpenClaw --no-color browser --browser-profile $Profile status
  if ($LASTEXITCODE -ne 0) {
    return $false
  }
  return (($status -join "`n") -match "running:\s*true")
}

function Ensure-BrowserRunning {
  param([string]$Profile)

  if (Test-BrowserRunning -Profile $Profile) {
    return
  }

  Write-Host "Starting OpenClaw browser profile '$Profile'..."
  $null = Invoke-OpenClaw --no-color browser --browser-profile $Profile start

  $ready = $false
  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Seconds 2
    if (Test-BrowserRunning -Profile $Profile) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    throw "Browser profile '$Profile' did not become ready."
  }
}

function Parse-BatchStats {
  param([string[]]$OutputLines)

  $lines = $OutputLines | Where-Object { $_ -and $_.Trim().Length -gt 0 }
  if (-not $lines -or $lines.Count -eq 0) {
    return $null
  }

  $last = $lines[-1]
  try {
    $parsed = $last | ConvertFrom-Json -ErrorAction Stop
    if ($parsed -is [string]) {
      return ($parsed | ConvertFrom-Json -ErrorAction Stop)
    }
    return $parsed
  } catch {
    return $null
  }
}

$script:OpenClawExe = Get-OpenClawPath
$script:NodeExe = (Get-Command node -ErrorAction Stop).Source
Ensure-Gateway
Ensure-BrowserRunning -Profile $BrowserProfile

$query = [uri]::EscapeDataString("from:$Username filter:nativeretweets")
$searchUrl = "https://x.com/search?q=$query"
$profileUrl = "https://x.com/$Username"
$startUrl = if ($StartFrom -eq "search") { $searchUrl } else { $profileUrl }

Write-Host "Opening X start page..."
$null = Invoke-OpenClaw --no-color browser --browser-profile $BrowserProfile open $startUrl
Write-Host "Start URL: $startUrl"
Write-Host "Profile URL fallback: $profileUrl"
Write-Host ""
Write-Host "1) In the opened browser profile '$BrowserProfile', log in to X if needed."
Write-Host "2) Confirm you can see repost results for @$Username."
if (-not $SkipManualPrompt) {
  $null = Read-Host "Press Enter to start batch unrepost"
}

$batchJs = @'
async()=>{const sleep=(ms)=>new Promise((r)=>setTimeout(r,ms));const unique=(arr)=>Array.from(new Set(arr));const aiRegex=/(^|\b)(ai|a\.i\.|artificial intelligence|machine learning|\bml\b|llm|gpt-?\d*|openai|anthropic|claude|gemini|copilot|deepseek|midjourney|stable diffusion|generative ai|neural network|transformer models?|prompt engineering|ai news|ai announcement|ai update|chatgpt|\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064a|\u062a\u0639\u0644\u0645 \u0627\u0644\u0622\u0644\u0629|\u0646\u0645\u0627\u0630\u062c \u0627\u0644\u0644\u063a\u0629 \u0627\u0644\u0643\u0628\u064a\u0631\u0629)(\b|$)/i;const getTweetText=(btn)=>{const article=btn.closest('article');if(!article){return '';}const txt=(article.innerText||'').replace(/\s+/g,' ').trim();return txt.slice(0,2000);};const isAiRelated=(txt)=>aiRegex.test((txt||'').toLowerCase());const stats={ts:new Date().toISOString(),url:location.href,visible:0,eligible:0,skipped_ai:0,clicked:0,confirms:0,blocked:false,noResults:false,seekScrolls:0};const bodyText=(document.body&&document.body.innerText)?document.body.innerText.slice(0,10000):'';const bodyLower=bodyText.toLowerCase();if(bodyLower.includes('no results for')&&bodyLower.includes('try searching for something else')){stats.noResults=true;return JSON.stringify(stats);}if(bodyLower.includes('rate limit')||bodyLower.includes('too many requests')||bodyLower.includes('try again later')||bodyLower.includes('suspicious activity')){stats.blocked=true;return JSON.stringify(stats);}let buttons=unique(Array.from(document.querySelectorAll('[data-testid=unretweet]')));if(buttons.length===0){let lastY=window.scrollY;for(let i=0;i<8;i++){const jump=Math.floor(window.innerHeight*(1.1+Math.random()*0.9));window.scrollBy({top:jump,behavior:'auto'});stats.seekScrolls+=1;await sleep(550+Math.floor(Math.random()*700));buttons=unique(Array.from(document.querySelectorAll('[data-testid=unretweet]')));if(buttons.length>0){break;}if(Math.abs(window.scrollY-lastY)<24){window.scrollTo(0,document.body.scrollHeight);stats.seekScrolls+=1;await sleep(700+Math.floor(Math.random()*900));buttons=unique(Array.from(document.querySelectorAll('[data-testid=unretweet]')));if(buttons.length>0){break;}}lastY=window.scrollY;}}stats.visible=buttons.length;for(const button of buttons){try{const tweetText=getTweetText(button);if(isAiRelated(tweetText)){stats.skipped_ai+=1;continue;}stats.eligible+=1;button.scrollIntoView({block:'center',inline:'center'});await sleep(120+Math.floor(Math.random()*280));button.click();await sleep(220+Math.floor(Math.random()*360));let confirm=document.querySelector('[data-testid=unretweetConfirm]');if(!confirm){const labelNode=Array.from(document.querySelectorAll('[role=menuitem],[role=menuitem] *')).find((el)=>{const text=(el.textContent||'').trim().toLowerCase();return text.includes('undo repost')||text.includes('undo retweet');});if(labelNode){confirm=labelNode.closest('[role=menuitem]')||labelNode;}}if(confirm){confirm.click();stats.confirms+=1;}stats.clicked+=1;await sleep(500+Math.floor(Math.random()*700));}catch(_err){}}window.scrollBy({top:Math.floor(window.innerHeight*0.9),behavior:'auto'});return JSON.stringify(stats);}
'@

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $PWD "openclaw-unrepost-$Username-$timestamp.log"
"start=$([DateTime]::UtcNow.ToString('o')) username=$Username max_actions=$MaxActions loop_limit=$LoopLimit" | Set-Content -Path $logPath -Encoding utf8

$totalClicked = 0
$emptyLoops = 0

Write-Host ""
Write-Host "Running batch..."
Write-Host "Log file: $logPath"

for ($loop = 1; $loop -le $LoopLimit -and $totalClicked -lt $MaxActions; $loop++) {
  $raw = Invoke-OpenClaw --no-color browser --browser-profile $BrowserProfile evaluate --fn $batchJs
  if ($LASTEXITCODE -ne 0) {
    $line = "loop=$loop status=error reason=evaluate_failed"
    Write-Warning $line
    Add-Content -Path $logPath -Value $line
    Start-Sleep -Seconds 6
    continue
  }

  $stats = Parse-BatchStats -OutputLines $raw
  if (-not $stats) {
    $line = "loop=$loop status=error reason=parse_failed"
    Write-Warning $line
    Add-Content -Path $logPath -Value $line
    Start-Sleep -Seconds 5
    continue
  }

  $url = [string]$stats.url
  if ($url -like "*x.com/i/flow/login*") {
    Write-Host "X login page detected. Complete login in browser."
    if (-not $SkipManualPrompt) {
      $null = Read-Host "Press Enter to continue"
    } else {
      Start-Sleep -Seconds 5
    }
    continue
  }

  if ([bool]$stats.blocked) {
    $line = "loop=$loop status=blocked reason=rate_or_security_prompt url=$url"
    Write-Warning $line
    Add-Content -Path $logPath -Value $line
    break
  }
  if ([bool]$stats.noResults) {
    $line = "loop=$loop status=info reason=no_results_search_switching_to_profile url=$url"
    Write-Warning $line
    Add-Content -Path $logPath -Value $line
    $null = Invoke-OpenClaw --no-color browser --browser-profile $BrowserProfile open $profileUrl
    Start-Sleep -Seconds 3
    continue
  }

  $clicked = [int]$stats.clicked
  $visible = [int]$stats.visible
  $eligible = if ($null -ne $stats.eligible) { [int]$stats.eligible } else { $clicked }
  $skippedAi = if ($null -ne $stats.skipped_ai) { [int]$stats.skipped_ai } else { 0 }
  $confirms = [int]$stats.confirms
  $seekScrolls = [int]$stats.seekScrolls
  $totalClicked += $clicked

  if ($clicked -eq 0) {
    $emptyLoops += 1
  } else {
    $emptyLoops = 0
  }

  $line = "loop=$loop clicked=$clicked confirms=$confirms visible=$visible eligible=$eligible skipped_ai=$skippedAi seek_scrolls=$seekScrolls total=$totalClicked empty_loops=$emptyLoops url=$url"
  Write-Host $line
  Add-Content -Path $logPath -Value $line

  if ($emptyLoops -ge $StopAfterEmptyLoops) {
    Write-Host "Stopping: no visible reposts for $StopAfterEmptyLoops consecutive loops."
    break
  }

  if ($totalClicked -ge $MaxActions) {
    Write-Host "Reached MaxActions=$MaxActions in this run."
    break
  }

  $delay = Get-Random -Minimum $MinDelayMs -Maximum ($MaxDelayMs + 1)
  Start-Sleep -Milliseconds $delay
}

Write-Host ""
Write-Host "Finished run."
Write-Host "Total unrepost clicks attempted: $totalClicked"
Write-Host "Log: $logPath"
Write-Host "Re-run the same script to continue where X timeline/search currently is."

#requires -Version 5.1
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [ValidateSet("Inventory", "Preview", "Disable", "Uninstall", "Restore")]
    [string]$Action = "Preview",

    [ValidateSet("Safe", "Aggressive", "Extreme")]
    [string]$Profile = "Aggressive",

    [string]$AdbPath = "C:\Android\platform-tools\adb.exe",
    [string]$Serial,
    [string]$OutDir = (Join-Path $PSScriptRoot "logs"),
    [string]$RestoreFrom,

    [switch]$IncludeGoogle,
    [switch]$IncludeSamsungAccount,
    [switch]$NoUad,
    [switch]$Yes
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$UadListUrl = "https://raw.githubusercontent.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation/main/resources/assets/uad_lists.json"

function Write-Section {
    param([string]$Text)
    Write-Host ""
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Resolve-Adb {
    $candidates = @()
    if ($AdbPath) { $candidates += $AdbPath }
    if ($env:ANDROID_HOME) { $candidates += (Join-Path $env:ANDROID_HOME "platform-tools\adb.exe") }
    if ($env:ANDROID_SDK_ROOT) { $candidates += (Join-Path $env:ANDROID_SDK_ROOT "platform-tools\adb.exe") }
    $candidates += "C:\Android\platform-tools\adb.exe"

    foreach ($candidate in $candidates | Select-Object -Unique) {
        if ($candidate -and (Test-Path -LiteralPath $candidate)) {
            return (Resolve-Path -LiteralPath $candidate).Path
        }
    }

    $fromPath = Get-Command adb.exe -ErrorAction SilentlyContinue
    if ($fromPath) {
        return $fromPath.Source
    }

    throw "adb.exe was not found. Run Install-ADB.ps1 first, then reopen PowerShell if PATH was just changed."
}

function Invoke-AdbRaw {
    param([Parameter(Mandatory = $true)][string[]]$AdbArgs)

    $args = @()
    if ($Serial) {
        $args += @("-s", $Serial)
    }
    $args += $AdbArgs

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& $script:Adb @args 2>&1 | ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) {
                $_.Exception.Message
            } else {
                [string]$_
            }
        })
        $exitCode = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previousPreference
    }

    [pscustomobject]@{
        ExitCode = $exitCode
        Output = ($output -join "`n")
    }
}

function Invoke-AdbChecked {
    param([Parameter(Mandatory = $true)][string[]]$AdbArgs)

    $result = Invoke-AdbRaw -AdbArgs $AdbArgs
    if ($result.ExitCode -ne 0) {
        throw "adb failed ($($result.ExitCode)): $($AdbArgs -join ' ')`n$($result.Output)"
    }
    return $result.Output
}

function Require-Device {
    Invoke-AdbChecked -AdbArgs @("start-server") | Out-Null
    $deviceResult = Invoke-AdbRaw -AdbArgs @("devices")
    if ($deviceResult.ExitCode -ne 0) {
        throw "Could not list adb devices.`n$($deviceResult.Output)"
    }

    $raw = @($deviceResult.Output -split "`r?`n")
    $deviceLines = @($raw | Where-Object { $_ -match "^\S+\s+\S+$" -and $_ -notmatch "^List of devices" })
    if ($deviceLines.Count -eq 0) {
        throw "No ADB device found. Enable Developer options > USB debugging, connect USB, and accept the phone prompt."
    }

    $unauthorized = @($deviceLines | Where-Object { $_ -match "\s+unauthorized$" })
    if ($unauthorized.Count -gt 0) {
        throw "Device is unauthorized. Unlock the phone and accept the USB debugging prompt, then run again."
    }

    $online = @($deviceLines | Where-Object { $_ -match "\s+device$" })
    if ($online.Count -eq 0) {
        throw "ADB sees a device but it is not online:`n$($deviceLines -join "`n")"
    }

    if (-not $Serial -and $online.Count -gt 1) {
        throw "Multiple ADB devices are connected. Re-run with -Serial <serial>."
    }
}

function Get-DeviceInfo {
    $props = [ordered]@{}
    foreach ($name in @(
        "ro.product.manufacturer",
        "ro.product.model",
        "ro.product.device",
        "ro.product.name",
        "ro.build.version.release",
        "ro.build.version.security_patch",
        "ro.build.PDA",
        "ro.csc.sales_code"
    )) {
        $props[$name] = (Invoke-AdbChecked -AdbArgs @("shell", "getprop", $name)).Trim()
    }
    return [pscustomobject]$props
}

function Get-InstalledPackages {
    $raw = Invoke-AdbChecked -AdbArgs @("shell", "pm", "list", "packages", "--user", "0")
    return @(
        $raw -split "`r?`n" |
            ForEach-Object { $_.Trim() -replace "^package:", "" } |
            Where-Object { $_ } |
            Sort-Object -Unique
    )
}

function New-Candidate {
    param(
        [string]$Package,
        [ValidateSet("Safe", "Aggressive", "Extreme")]
        [string]$Tier,
        [string]$Group,
        [string]$Reason,
        [string]$Source = "Local",
        [string]$Flags = ""
    )

    [pscustomobject]@{
        Package = $Package
        Tier = $Tier
        Group = $Group
        Reason = $Reason
        Source = $Source
        Flags = $Flags
    }
}

$LocalCandidates = @(
    New-Candidate "com.facebook.katana" "Safe" "Third-party" "Facebook app"
    New-Candidate "com.facebook.system" "Safe" "Third-party" "Facebook system installer"
    New-Candidate "com.facebook.appmanager" "Safe" "Third-party" "Facebook app manager"
    New-Candidate "com.facebook.services" "Safe" "Third-party" "Facebook background services"
    New-Candidate "com.facebook.orca" "Safe" "Third-party" "Facebook Messenger"
    New-Candidate "com.netflix.mediaclient" "Safe" "Third-party" "Netflix app"
    New-Candidate "com.netflix.partner.activation" "Safe" "Third-party" "Netflix partner activation"
    New-Candidate "com.linkedin.android" "Safe" "Third-party" "LinkedIn app"
    New-Candidate "com.spotify.music" "Safe" "Third-party" "Spotify app"
    New-Candidate "com.amazon.mShop.android.shopping" "Safe" "Third-party" "Amazon Shopping"
    New-Candidate "com.amazon.appmanager" "Safe" "Third-party" "Amazon App Manager"
    New-Candidate "com.booking" "Safe" "Third-party" "Booking.com app"
    New-Candidate "com.booking.aidprovider" "Safe" "Third-party" "Booking.com provider"
    New-Candidate "com.microsoft.skydrive" "Safe" "Microsoft" "OneDrive"
    New-Candidate "com.microsoft.office.officehubrow" "Safe" "Microsoft" "Microsoft Office hub"
    New-Candidate "com.microsoft.office.outlook" "Safe" "Microsoft" "Outlook"
    New-Candidate "com.microsoft.appmanager" "Safe" "Microsoft" "Microsoft app manager"
    New-Candidate "com.aura.oobe.samsung" "Safe" "Carrier/installer" "Preload app selector"
    New-Candidate "com.aura.oobe.deutsche" "Safe" "Carrier/installer" "Carrier preload app selector"
    New-Candidate "com.dti.samsung" "Safe" "Carrier/installer" "DT Ignite installer"
    New-Candidate "com.dti.att" "Safe" "Carrier/installer" "Carrier app installer"
    New-Candidate "com.dti.cricket" "Safe" "Carrier/installer" "Carrier app installer"
    New-Candidate "com.dti.tracfone" "Safe" "Carrier/installer" "Carrier app installer"
    New-Candidate "com.dti.telefonica" "Safe" "Carrier/installer" "Carrier app installer"
    New-Candidate "com.dti.blu" "Safe" "Carrier/installer" "Preload app installer"
    New-Candidate "android.autoinstalls.config.samsung" "Safe" "Installer" "Preinstall configuration"
    New-Candidate "android.autoinstalls.config" "Safe" "Installer" "Preinstall configuration"
    New-Candidate "com.samsung.android.app.tips" "Safe" "Samsung" "Samsung Tips"
    New-Candidate "com.samsung.safetyinformation" "Safe" "Samsung" "Samsung Safety Information shortcut"
    New-Candidate "com.sec.android.app.chromecustomizations" "Safe" "Samsung" "Chrome partner customizations"
    New-Candidate "com.android.providers.partnerbookmarks" "Safe" "AOSP/partner" "Partner bookmarks"
    New-Candidate "com.android.providers.partnerbrowsercustomizations" "Safe" "AOSP/partner" "Partner browser customizations"
    New-Candidate "com.sec.spp.push" "Safe" "Samsung" "Samsung Push Service"
    New-Candidate "com.samsung.android.ipsgeofence" "Safe" "Samsung" "Samsung geofence service"
    New-Candidate "com.samsung.android.beaconmanager" "Safe" "Samsung" "Nearby device scanning"
    New-Candidate "com.samsung.android.allshare.service.mediashare" "Safe" "Samsung" "Nearby media share service"
    New-Candidate "com.samsung.android.easysetup" "Safe" "Samsung" "Accessory/device easy setup"
    New-Candidate "com.samsung.android.app.simplesharing" "Safe" "Samsung" "Samsung simple sharing"
    New-Candidate "com.samsung.android.rubin.app" "Safe" "Samsung" "Customization Service"
    New-Candidate "com.samsung.android.app.sharelive" "Safe" "Samsung" "Live sharing integration"
    New-Candidate "com.samsung.android.sm.devicesecurity" "Safe" "Samsung" "Device security scanner"
    New-Candidate "com.samsung.android.da.daagent" "Safe" "Samsung" "Dual Messenger agent"
    New-Candidate "com.samsung.android.mateagent" "Safe" "Samsung" "Galaxy Friends/Accessory agent"
    New-Candidate "com.samsung.android.stickercenter" "Aggressive" "Samsung AR" "Sticker Center"
    New-Candidate "com.samsung.android.arzone" "Aggressive" "Samsung AR" "AR Zone"
    New-Candidate "com.samsung.android.ardrawing" "Aggressive" "Samsung AR" "AR drawing"
    New-Candidate "com.samsung.android.aremoji" "Aggressive" "Samsung AR" "AR Emoji"
    New-Candidate "com.samsung.android.aremojieditor" "Aggressive" "Samsung AR" "AR Emoji editor"
    New-Candidate "com.samsung.android.app.camera.sticker.facearavatar.preload" "Aggressive" "Samsung AR" "Camera AR avatar stickers"
    New-Candidate "com.samsung.android.app.camera.sticker.facearframe.preload" "Aggressive" "Samsung AR" "Camera AR frame stickers"
    New-Candidate "com.samsung.android.app.camera.sticker.facearexpression.preload" "Aggressive" "Samsung AR" "Camera AR expression stickers"
    New-Candidate "com.samsung.android.app.camera.sticker.facear.preload" "Aggressive" "Samsung AR" "Camera AR stickers"
    New-Candidate "com.samsung.android.app.camera.sticker.stamp.preload" "Aggressive" "Samsung AR" "Camera stamp stickers"
    New-Candidate "com.samsung.android.app.spage" "Aggressive" "Samsung" "Samsung Free / legacy Bixby Home"
    New-Candidate "com.samsung.android.app.routines" "Aggressive" "Samsung" "Modes and Routines"
    New-Candidate "com.samsung.android.bixby.agent" "Aggressive" "Bixby" "Bixby agent"
    New-Candidate "com.samsung.android.bixby.agent.dummy" "Aggressive" "Bixby" "Bixby placeholder"
    New-Candidate "com.samsung.android.bixby.service" "Aggressive" "Bixby" "Bixby service"
    New-Candidate "com.samsung.android.bixby.wakeup" "Aggressive" "Bixby" "Bixby voice wakeup"
    New-Candidate "com.samsung.android.app.settings.bixby" "Aggressive" "Bixby" "Bixby settings integration"
    New-Candidate "com.samsung.android.visionintelligence" "Aggressive" "Bixby" "Bixby Vision"
    New-Candidate "com.samsung.android.bixbyvision.framework" "Aggressive" "Bixby" "Bixby Vision framework"
    New-Candidate "com.samsung.android.app.watchmanagerstub" "Aggressive" "Samsung wearable" "Wearable Manager installer"
    New-Candidate "com.samsung.android.app.watchmanager" "Aggressive" "Samsung wearable" "Galaxy Wearable"
    New-Candidate "com.samsung.android.geargplugin" "Aggressive" "Samsung wearable" "Galaxy Wearable plugin"
    New-Candidate "com.samsung.android.oneconnect" "Aggressive" "Samsung" "SmartThings"
    New-Candidate "com.samsung.android.voc" "Aggressive" "Samsung" "Samsung Members/support"
    New-Candidate "com.samsung.android.tvplus" "Aggressive" "Samsung media" "Samsung TV Plus"
    New-Candidate "com.samsung.android.game.gamehome" "Aggressive" "Samsung game" "Game Launcher"
    New-Candidate "com.samsung.android.game.gametools" "Aggressive" "Samsung game" "Game Tools"
    New-Candidate "com.samsung.android.game.gos" "Aggressive" "Samsung game" "Game Optimizing Service"
    New-Candidate "com.enhance.gameservice" "Aggressive" "Samsung game" "Game optimization service"
    New-Candidate "com.samsung.android.kidsinstaller" "Aggressive" "Samsung" "Samsung Kids installer"
    New-Candidate "com.sec.android.app.kidshome" "Aggressive" "Samsung" "Samsung Kids"
    New-Candidate "com.samsung.android.scloud" "Aggressive" "Samsung cloud" "Samsung Cloud"
    New-Candidate "com.samsung.android.mobileservice" "Aggressive" "Samsung cloud" "Samsung account-linked sharing service"
    New-Candidate "com.samsung.android.samsungpass" "Aggressive" "Samsung" "Samsung Pass"
    New-Candidate "com.samsung.android.samsungpassautofill" "Aggressive" "Samsung" "Samsung Pass autofill"
    New-Candidate "com.samsung.android.spay" "Aggressive" "Samsung payment" "Samsung Pay"
    New-Candidate "com.samsung.android.spayfw" "Aggressive" "Samsung payment" "Samsung Pay framework"
    New-Candidate "com.samsung.android.app.reminder" "Aggressive" "Samsung app" "Samsung Reminder"
    New-Candidate "com.samsung.android.app.notes" "Aggressive" "Samsung app" "Samsung Notes"
    New-Candidate "com.samsung.android.calendar" "Aggressive" "Samsung app" "Samsung Calendar"
    New-Candidate "com.samsung.android.email.provider" "Aggressive" "Samsung app" "Samsung Email"
    New-Candidate "com.sec.android.app.sbrowser" "Aggressive" "Samsung app" "Samsung Internet"
    New-Candidate "com.sec.android.app.sbrowseredge" "Aggressive" "Samsung app" "Samsung Internet edge component"
    New-Candidate "com.sec.android.app.shealth" "Aggressive" "Samsung app" "Samsung Health"
    New-Candidate "com.sec.android.app.voicenote" "Aggressive" "Samsung app" "Samsung Voice Recorder"
    New-Candidate "com.sec.android.app.popupcalculator" "Aggressive" "Samsung app" "Samsung Calculator"
    New-Candidate "com.sec.android.daemonapp" "Aggressive" "Samsung app" "Samsung Weather daemon"
    New-Candidate "com.samsung.android.weather" "Aggressive" "Samsung app" "Samsung Weather"
    New-Candidate "com.samsung.android.app.find" "Aggressive" "Samsung app" "Samsung Find"
    New-Candidate "com.sec.android.easyMover" "Aggressive" "Samsung migration" "Smart Switch"
    New-Candidate "com.sec.android.easyMover.Agent" "Aggressive" "Samsung migration" "Smart Switch agent"
    New-Candidate "com.samsung.android.smartswitchassistant" "Aggressive" "Samsung migration" "Smart Switch assistant"
    New-Candidate "com.sec.android.app.magnifier" "Aggressive" "Samsung app" "Samsung Magnifier"
    New-Candidate "com.sec.android.mimage.photoretouching" "Aggressive" "Samsung app" "Samsung Photo Editor"
    New-Candidate "com.samsung.android.service.peoplestripe" "Aggressive" "Samsung edge" "People edge panel"
    New-Candidate "com.samsung.android.app.taskedge" "Aggressive" "Samsung edge" "Tasks edge panel"
    New-Candidate "com.sec.android.app.billing" "Extreme" "Samsung store" "Samsung Checkout"
    New-Candidate "com.sec.android.app.samsungapps" "Extreme" "Samsung store" "Galaxy Store; also updates some Samsung apps"
    New-Candidate "com.samsung.android.themestore" "Extreme" "Samsung themes" "Galaxy Themes"
    New-Candidate "com.samsung.android.themecenter" "Extreme" "Samsung themes" "Samsung Theme Center"
    New-Candidate "com.samsung.android.app.omcagent" "Extreme" "Samsung/carrier" "Carrier customization agent"
    New-Candidate "com.samsung.android.fmm" "Extreme" "Samsung account" "Find My Mobile" "Local" "SamsungAccount"
    New-Candidate "com.samsung.android.samsungaccount" "Extreme" "Samsung account" "Samsung Account" "Local" "SamsungAccount"
    New-Candidate "com.osp.app.signin" "Extreme" "Samsung account" "Samsung account sign-in" "Local" "SamsungAccount"
    New-Candidate "com.samsung.android.authfw" "Extreme" "Samsung account" "Samsung authentication framework" "Local" "SamsungAccount"
    New-Candidate "com.android.dreams.basic" "Extreme" "AOSP optional" "Basic screensaver"
    New-Candidate "com.android.dreams.phototable" "Extreme" "AOSP optional" "Photo screensaver"
    New-Candidate "com.android.printspooler" "Extreme" "AOSP optional" "Print Spooler; removes printing support"
    New-Candidate "com.android.wallpaper.livepicker" "Extreme" "AOSP optional" "Live wallpaper picker"
    New-Candidate "com.android.wallpapercropper" "Extreme" "AOSP optional" "Wallpaper cropper"
    New-Candidate "com.android.sharedstoragebackup" "Extreme" "AOSP optional" "Shared storage backup helper"
    New-Candidate "com.android.egg" "Extreme" "AOSP optional" "Android Easter egg"
    New-Candidate "com.google.android.youtube" "Aggressive" "Google" "YouTube" "Local" "Google"
    New-Candidate "com.google.android.apps.youtube.music" "Aggressive" "Google" "YouTube Music" "Local" "Google"
    New-Candidate "com.google.android.apps.photos" "Aggressive" "Google" "Google Photos" "Local" "Google"
    New-Candidate "com.google.android.apps.docs" "Aggressive" "Google" "Google Drive/Docs package" "Local" "Google"
    New-Candidate "com.google.android.apps.maps" "Aggressive" "Google" "Google Maps" "Local" "Google"
    New-Candidate "com.google.android.apps.tachyon" "Aggressive" "Google" "Google Duo/Meet legacy" "Local" "Google"
    New-Candidate "com.google.android.apps.meetings" "Aggressive" "Google" "Google Meet" "Local" "Google"
    New-Candidate "com.google.android.apps.subscriptions.red" "Aggressive" "Google" "Google One" "Local" "Google"
    New-Candidate "com.google.android.apps.wellbeing" "Aggressive" "Google" "Digital Wellbeing" "Local" "Google"
    New-Candidate "com.google.android.apps.fitness" "Aggressive" "Google" "Google Fit" "Local" "Google"
    New-Candidate "com.google.android.feedback" "Aggressive" "Google" "Google Feedback" "Local" "Google"
    New-Candidate "com.google.android.videos" "Aggressive" "Google" "Google TV / Play Movies" "Local" "Google"
    New-Candidate "com.google.android.music" "Aggressive" "Google" "Google Play Music legacy" "Local" "Google"
    New-Candidate "com.google.android.printservice.recommendation" "Aggressive" "Google" "Print service recommendation" "Local" "Google"
    New-Candidate "com.google.ar.core" "Aggressive" "Google" "Google Play Services for AR" "Local" "Google"
    New-Candidate "com.google.android.googlequicksearchbox" "Extreme" "Google" "Google app and Assistant entry points" "Local" "Google"
    New-Candidate "com.google.android.apps.googleassistant" "Extreme" "Google" "Google Assistant" "Local" "Google"
    New-Candidate "com.google.android.projection.gearhead" "Extreme" "Google" "Android Auto" "Local" "Google"
    New-Candidate "com.google.android.tts" "Extreme" "Google" "Google Text-to-Speech" "Local" "Google"
    New-Candidate "com.google.android.apps.walletnfcrel" "Extreme" "Google" "Google Wallet" "Local" "Google"
)

$ProtectedPackages = @(
    "android",
    "com.android.systemui",
    "com.android.settings",
    "com.android.shell",
    "com.android.phone",
    "com.android.server.telecom",
    "com.android.providers.settings",
    "com.android.providers.telephony",
    "com.android.providers.media",
    "com.android.providers.downloads",
    "com.android.externalstorage",
    "com.android.packageinstaller",
    "com.google.android.packageinstaller",
    "com.android.permissioncontroller",
    "com.google.android.permissioncontroller",
    "com.android.networkstack",
    "com.android.networkstack.inprocess",
    "com.android.localtransport",
    "com.android.inputdevices",
    "com.android.providers.contacts",
    "com.android.contacts",
    "com.android.vending",
    "com.google.android.gms",
    "com.google.android.gsf",
    "com.google.android.webview",
    "com.android.webview",
    "com.sec.android.app.launcher",
    "com.samsung.android.honeyboard",
    "com.samsung.android.dialer",
    "com.samsung.android.incallui",
    "com.samsung.android.messaging",
    "com.samsung.android.providers.contacts",
    "com.samsung.android.app.telephonyui",
    "com.samsung.android.mcfds",
    "com.sec.imsservice",
    "com.sec.epdg",
    "com.sec.sve",
    "com.sec.android.app.servicemodeapp"
)

$ProtectedPatterns = @(
    "telephony",
    "telecom",
    "\bims\b",
    "imsservice",
    "mms",
    "dialer",
    "incallui",
    "carrierconfig",
    "networkstack",
    "permissioncontroller",
    "systemui",
    "packageinstaller",
    "webview",
    "launcher",
    "honeyboard",
    "keyboard",
    "inputmethod",
    "emergency",
    "\bsos\b"
)

function Test-ProtectedPackage {
    param([string]$Package)

    if ($script:ProtectedSet.ContainsKey($Package)) {
        return $true
    }

    foreach ($pattern in $ProtectedPatterns) {
        if ($Package -match $pattern) {
            return $true
        }
    }

    return $false
}

function Get-UadCandidates {
    param([string[]]$InstalledPackages)

    if ($NoUad) {
        return @()
    }

    $allowedRemoval = @{
        Safe = @("Recommended")
        Aggressive = @("Recommended", "Advanced")
        Extreme = @("Recommended", "Advanced", "Expert")
    }[$Profile]

    try {
        Write-Host "Loading maintained UAD-NG package metadata..." -ForegroundColor DarkCyan
        $uad = Invoke-RestMethod -Uri $UadListUrl -UseBasicParsing
    } catch {
        Write-Warning "Could not download UAD-NG list. Continuing with the local Samsung list only. $($_.Exception.Message)"
        return @()
    }

    $installedSet = @{}
    foreach ($pkg in $InstalledPackages) { $installedSet[$pkg] = $true }

    $items = New-Object System.Collections.Generic.List[object]
    foreach ($prop in $uad.PSObject.Properties) {
        $pkg = $prop.Name
        if (-not $installedSet.ContainsKey($pkg)) { continue }

        $meta = $prop.Value
        $removal = [string]$meta.removal
        if ($allowedRemoval -notcontains $removal) { continue }
        if ($removal -eq "Unsafe") { continue }

        $tier = switch ($removal) {
            "Recommended" { "Safe"; break }
            "Advanced" { "Aggressive"; break }
            "Expert" { "Extreme"; break }
            default { "Extreme" }
        }

        $flags = ""
        if ($pkg -like "com.google.*" -or $pkg -like "com.android.chrome*") {
            $flags = "Google"
        }

        $description = ([string]$meta.description -replace "\s+", " ").Trim()
        if ($description.Length -gt 180) {
            $description = $description.Substring(0, 177) + "..."
        }

        $items.Add((New-Candidate $pkg $tier "UAD-$([string]$meta.list)" $description "UAD-NG:$removal" $flags)) | Out-Null
    }

    return @($items)
}

function Select-Candidates {
    param([string[]]$InstalledPackages)

    $tierRank = @{ Safe = 1; Aggressive = 2; Extreme = 3 }
    $maxTier = $tierRank[$Profile]
    $installedSet = @{}
    foreach ($pkg in $InstalledPackages) { $installedSet[$pkg] = $true }

    $all = New-Object System.Collections.Generic.List[object]
    foreach ($candidate in $LocalCandidates) {
        $all.Add($candidate) | Out-Null
    }
    foreach ($candidate in (Get-UadCandidates -InstalledPackages $InstalledPackages)) {
        $all.Add($candidate) | Out-Null
    }

    $selected = @{}
    foreach ($candidate in $all) {
        if (-not $installedSet.ContainsKey($candidate.Package)) { continue }
        if ($tierRank[$candidate.Tier] -gt $maxTier) { continue }
        if ((Test-ProtectedPackage -Package $candidate.Package)) { continue }
        if (($candidate.Flags -match "Google") -and -not $IncludeGoogle) { continue }
        if (($candidate.Flags -match "SamsungAccount") -and -not $IncludeSamsungAccount) { continue }

        if (-not $selected.ContainsKey($candidate.Package)) {
            $selected[$candidate.Package] = $candidate
        } else {
            $existing = $selected[$candidate.Package]
            $existing.Source = ($existing.Source + ";" + $candidate.Source)
            if (-not $existing.Reason -or $existing.Reason.Length -lt $candidate.Reason.Length) {
                $existing.Reason = $candidate.Reason
            }
        }
    }

    return @($selected.Values | Sort-Object Tier, Group, Package)
}

function Save-Inventory {
    param(
        [object]$DeviceInfo,
        [string[]]$InstalledPackages,
        [string]$SessionDir
    )

    $DeviceInfo | Format-List | Out-File -FilePath (Join-Path $SessionDir "device-info.txt") -Encoding utf8
    $InstalledPackages | Out-File -FilePath (Join-Path $SessionDir "installed-packages.txt") -Encoding utf8

    $disabled = Invoke-AdbRaw -AdbArgs @("shell", "pm", "list", "packages", "--user", "0", "-d")
    $disabled.Output | Out-File -FilePath (Join-Path $SessionDir "disabled-packages.txt") -Encoding utf8

    $thirdParty = Invoke-AdbRaw -AdbArgs @("shell", "pm", "list", "packages", "--user", "0", "-3")
    $thirdParty.Output | Out-File -FilePath (Join-Path $SessionDir "third-party-packages.txt") -Encoding utf8
}

function Confirm-Debloat {
    param(
        [string]$RequestedAction,
        [object[]]$Candidates
    )

    if ($Yes) { return }
    if ($RequestedAction -eq "Preview" -or $RequestedAction -eq "Inventory" -or $RequestedAction -eq "Restore") { return }

    Write-Host ""
    Write-Host "This will run '$RequestedAction' against $($Candidates.Count) packages on the connected phone." -ForegroundColor Yellow
    Write-Host "Disable is easier to reverse. Uninstall removes the package for user 0, but a factory reset normally restores system apps." -ForegroundColor Yellow
    Write-Host "A restore manifest is saved in the session folder before changes are made." -ForegroundColor Yellow

    $expected = if ($Profile -eq "Extreme" -or $IncludeSamsungAccount -or $IncludeGoogle) { "EXTREME" } else { "DEBLOAT" }
    $typed = Read-Host "Type $expected to continue"
    if ($typed -ne $expected) {
        throw "Confirmation did not match. No changes were made."
    }
}

function Invoke-PackageAction {
    param(
        [ValidateSet("Disable", "Uninstall")]
        [string]$RequestedAction,
        [object[]]$Candidates,
        [string]$SessionDir
    )

    $results = New-Object System.Collections.Generic.List[object]

    foreach ($candidate in $Candidates) {
        $pkg = $candidate.Package
        $adbArgs = if ($RequestedAction -eq "Disable") {
            @("shell", "pm", "disable-user", "--user", "0", $pkg)
        } else {
            @("shell", "pm", "uninstall", "-k", "--user", "0", $pkg)
        }

        if ($PSCmdlet.ShouldProcess($pkg, $RequestedAction)) {
            Write-Host ("{0,-9} {1}" -f $RequestedAction, $pkg)
            $result = Invoke-AdbRaw -AdbArgs $adbArgs
            $status = if ($result.ExitCode -eq 0 -and $result.Output -match "(Success|disabled-user)") { "OK" } else { "Check" }
            $results.Add([pscustomobject]@{
                Package = $pkg
                Action = $RequestedAction
                Status = $status
                ExitCode = $result.ExitCode
                Output = $result.Output
                Tier = $candidate.Tier
                Group = $candidate.Group
                Source = $candidate.Source
                Reason = $candidate.Reason
            }) | Out-Null
        }
    }

    $results | Export-Csv -Path (Join-Path $SessionDir "results.csv") -NoTypeInformation -Encoding utf8
    return @($results)
}

function Restore-Packages {
    param([string]$ManifestPath)

    if (-not $ManifestPath) {
        $latest = Get-ChildItem -Path $OutDir -Directory -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            ForEach-Object { Join-Path $_.FullName "selected-packages.csv" } |
            Where-Object { Test-Path -LiteralPath $_ } |
            Select-Object -First 1
        $ManifestPath = $latest
    }

    if (-not $ManifestPath -or -not (Test-Path -LiteralPath $ManifestPath)) {
        throw "No restore manifest found. Pass -RestoreFrom <selected-packages.csv>."
    }

    $manifest = Import-Csv -Path $ManifestPath
    if (-not $manifest) {
        throw "Restore manifest is empty: $ManifestPath"
    }

    Write-Host "Restoring from: $ManifestPath" -ForegroundColor Cyan
    foreach ($row in $manifest) {
        $pkg = $row.Package
        if (-not $pkg) { continue }
        if ($PSCmdlet.ShouldProcess($pkg, "Restore/install-existing and enable")) {
            Write-Host "Restore  $pkg"
            Invoke-AdbRaw -AdbArgs @("shell", "cmd", "package", "install-existing", "--user", "0", $pkg) | Out-Null
            Invoke-AdbRaw -AdbArgs @("shell", "pm", "enable", "--user", "0", $pkg) | Out-Null
        }
    }
}

$script:ProtectedSet = @{}
foreach ($pkg in $ProtectedPackages) { $script:ProtectedSet[$pkg] = $true }

$script:Adb = Resolve-Adb
Write-Host "Using ADB: $script:Adb" -ForegroundColor DarkGreen
Require-Device

if (-not (Test-Path -LiteralPath $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$sessionName = Get-Date -Format "yyyyMMdd-HHmmss"
$SessionDir = Join-Path $OutDir $sessionName
New-Item -ItemType Directory -Path $SessionDir -Force | Out-Null

Write-Section "Connected Device"
$deviceInfo = Get-DeviceInfo
$deviceInfo | Format-List

Write-Section "Inventory"
$installed = Get-InstalledPackages
Save-Inventory -DeviceInfo $deviceInfo -InstalledPackages $installed -SessionDir $SessionDir
Write-Host "Installed package count: $($installed.Count)"
Write-Host "Session folder: $SessionDir"

if ($Action -eq "Inventory") {
    Write-Host "Inventory saved. No packages were changed." -ForegroundColor Green
    return
}

if ($Action -eq "Restore") {
    Restore-Packages -ManifestPath $RestoreFrom
    Write-Host "Restore commands finished." -ForegroundColor Green
    return
}

Write-Section "Candidate Selection"
$candidates = Select-Candidates -InstalledPackages $installed
$candidates | Export-Csv -Path (Join-Path $SessionDir "selected-packages.csv") -NoTypeInformation -Encoding utf8
$candidates | Format-Table Tier, Group, Package, Source -AutoSize

Write-Host ""
Write-Host "Selected $($candidates.Count) packages for profile '$Profile'." -ForegroundColor Green
if (-not $IncludeGoogle) {
    Write-Host "Google packages are excluded. Add -IncludeGoogle for a heavier de-Google pass." -ForegroundColor DarkYellow
}
if (-not $IncludeSamsungAccount) {
    Write-Host "Samsung account/auth packages are excluded. Add -IncludeSamsungAccount only if you accept losing Samsung account features." -ForegroundColor DarkYellow
}
Write-Host "Manifest saved: $(Join-Path $SessionDir "selected-packages.csv")"

if ($Action -eq "Preview") {
    Write-Host "Preview only. No packages were changed." -ForegroundColor Green
    return
}

Confirm-Debloat -RequestedAction $Action -Candidates $candidates
$results = Invoke-PackageAction -RequestedAction $Action -Candidates $candidates -SessionDir $SessionDir

Write-Section "Result Summary"
$results | Group-Object Status | Select-Object Name, Count | Format-Table -AutoSize
Write-Host "Detailed results saved: $(Join-Path $SessionDir "results.csv")"
Write-Host "Rebooting is recommended after a large debloat: adb reboot" -ForegroundColor Cyan

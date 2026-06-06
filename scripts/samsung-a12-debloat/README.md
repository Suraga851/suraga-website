# Samsung A12 ADB Debloat Toolkit

This toolkit downloads Google's official Android SDK Platform Tools, inventories a connected Samsung phone, and applies a Samsung-focused debloat list. It also pulls the maintained Universal Android Debloater Next Generation package metadata at run time unless `-NoUad` is used.

## Before You Run

On the phone:

1. Open **Settings > About phone > Software information**.
2. Tap **Build number** seven times.
3. Open **Developer options** and enable **USB debugging**.
4. Connect USB and accept the RSA debugging prompt on the phone.

## Easiest Run

Open PowerShell and run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\samsung-a12-debloat\Run-Samsung-A12-Debloat.ps1
```

The launcher elevates itself, installs ADB to `C:\Android\platform-tools`, previews the package list, then asks whether to disable or uninstall.

## Manual Commands

Install or update ADB:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\samsung-a12-debloat\Install-ADB.ps1 -MachinePath
```

Preview an aggressive Samsung debloat:

```powershell
.\scripts\samsung-a12-debloat\Samsung-A12-Debloat.ps1 -Action Preview -Profile Aggressive
```

Disable the selected packages:

```powershell
.\scripts\samsung-a12-debloat\Samsung-A12-Debloat.ps1 -Action Disable -Profile Aggressive
```

Strongest practical pass:

```powershell
.\scripts\samsung-a12-debloat\Samsung-A12-Debloat.ps1 -Action Disable -Profile Extreme -IncludeGoogle -IncludeSamsungAccount
```

`Disable` is recommended before `Uninstall` because it is easier to reverse from Android Settings or ADB. For packages uninstalled for user 0, restore with:

```powershell
.\scripts\samsung-a12-debloat\Samsung-A12-Debloat.ps1 -Action Restore -RestoreFrom .\scripts\samsung-a12-debloat\logs\<session>\selected-packages.csv
```

## Profiles

- `Safe`: partner installers, Facebook/third-party bloat, Samsung tips/push/nearby extras, and UAD-NG `Recommended` packages.
- `Aggressive`: `Safe` plus Bixby, AR, Game Launcher/GOS, SmartThings, Samsung media/apps, wearable stubs, Samsung Cloud/Pass/Pay, and UAD-NG `Advanced` packages.
- `Extreme`: `Aggressive` plus Galaxy Store, Samsung themes, optional Android conveniences like printing/screensavers/live wallpaper picker, and UAD-NG `Expert` packages.

Hard-protected packages include System UI, Settings, launcher, keyboard, dialer, telephony/IMS, package installer, WebView, Play Services, Play Store, and similar boot/phone-critical components.

## Sources Used

- Official ADB download source: https://developer.android.com/tools/releases/platform-tools
- Official ADB command reference: https://developer.android.com/tools/adb
- Maintained UAD-NG package metadata: https://github.com/Universal-Debloater-Alliance/universal-android-debloater-next-generation
- Samsung community debloat guidance and package examples: Reddit `/r/samsung` One UI debloat guide, Reddit Samsung Galaxy debloat discussions, and XDA Samsung ADB debloat threads.


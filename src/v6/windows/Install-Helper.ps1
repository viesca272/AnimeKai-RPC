param([switch]$Repair)
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$SourceExe = Join-Path $Root "native_host\AnimeKaiRPCNativeHost.exe"
$InstallDir = Join-Path $env:LOCALAPPDATA "AnimeKaiRPC"
$InstalledExe = Join-Path $InstallDir "AnimeKaiRPCNativeHost.exe"
$HostName = "com.animekai.discordrpc"
$Manifest = Join-Path $InstallDir "$HostName.json"
$ExtensionId = "jjmnjgihigllehhjfhcmhcgnkhjdablc"

if(!(Test-Path $SourceExe)){
  throw "AnimeKaiRPCNativeHost.exe is missing from this package. Download the full V6 Alpha release ZIP, not just the source code."
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item $SourceExe $InstalledExe -Force

$manifestObject = [ordered]@{
  name = $HostName
  description = "AnimeKai Discord RPC V6 native host - Made by viesca27"
  path = $InstalledExe
  type = "stdio"
  allowed_origins = @("chrome-extension://$ExtensionId/")
}
$manifestObject | ConvertTo-Json -Depth 4 | Set-Content -Path $Manifest -Encoding UTF8

foreach($base in @(
  "HKCU:\Software\Google\Chrome\NativeMessagingHosts",
  "HKCU:\Software\Chromium\NativeMessagingHosts",
  "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts"
)){
  $key = "$base\$HostName"
  New-Item -Path $key -Force | Out-Null
  Set-Item -Path $key -Value $Manifest
}

$configFile = Join-Path $InstallDir "config.json"
if(!(Test-Path $configFile)){
  [ordered]@{
    client_id = ""
    playbackMode = "auto"
    showTimestamp = $true
    detailsTemplate = "{anime}"
    stateTemplate = "Episode {episode} / {total} • {status}"
  } | ConvertTo-Json | Set-Content -Path $configFile -Encoding UTF8
}

$title = if($Repair){"AnimeKai RPC V6 repaired"}else{"AnimeKai RPC V6 helper installed"}
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show("$title successfully.`n`nNext, load the included extension folder in Opera/Chrome/Edge and open AnimeKai.`n`nExisting V5/V6 settings were preserved.","AnimeKai RPC V6 Alpha 1") | Out-Null

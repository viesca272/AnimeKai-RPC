param([switch]$Repair)
$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$SourceExe = Join-Path $Root "native_host\AnimeKaiRPCNativeHost.exe"
$InstallDir = Join-Path $env:LOCALAPPDATA "AnimeKaiRPC"
$InstalledExe = Join-Path $InstallDir "AnimeKaiRPCNativeHost.exe"
$HostName = "com.animekai.discordrpc"
$Manifest = Join-Path $InstallDir "$HostName.json"
$ExtensionId = "jjmnjgihigllehhjfhcmhcgnkhjdablc"
$PublisherClientId = "1543575455523807385"

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
$config = [ordered]@{
  client_id = $PublisherClientId
  playbackMode = "auto"
  showTimestamp = $true
  detailsTemplate = "{anime}"
  stateTemplate = "Episode {episode} / {total} • {status}"
}

# Keep existing personal RPC preferences, but always seed the public
# AnimeKai RPC Discord Application ID so fresh users never need to enter it.
if(Test-Path $configFile){
  try {
    $existing = Get-Content $configFile -Raw | ConvertFrom-Json
    if($null -ne $existing.playbackMode){ $config.playbackMode = $existing.playbackMode }
    if($null -ne $existing.showTimestamp){ $config.showTimestamp = [bool]$existing.showTimestamp }
    if($null -ne $existing.detailsTemplate){ $config.detailsTemplate = [string]$existing.detailsTemplate }
    if($null -ne $existing.stateTemplate){ $config.stateTemplate = [string]$existing.stateTemplate }
  } catch {}
}
$config | ConvertTo-Json | Set-Content -Path $configFile -Encoding UTF8

$title = if($Repair){"AnimeKai RPC V6 repaired"}else{"AnimeKai RPC V6 helper installed"}
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show("$title successfully.`n`nAlpha 3 includes the AnimeKai RPC Discord application automatically, so users no longer need to enter an Application ID.`n`nExisting appearance and RPC preferences were preserved.","AnimeKai RPC V6 Alpha 3") | Out-Null

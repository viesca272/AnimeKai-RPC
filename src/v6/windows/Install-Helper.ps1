param([switch]$Repair)
$ErrorActionPreference = "Stop"

$Version = "6.0.0"
$Channel = "stable"
$Root = Split-Path -Parent $PSScriptRoot
$SourceExe = Join-Path $Root "native_host\AnimeKaiRPCNativeHost.exe"
$InstallDir = Join-Path $env:LOCALAPPDATA "AnimeKaiRPC"
$InstalledExe = Join-Path $InstallDir "AnimeKaiRPCNativeHost.exe"
$HostName = "com.animekai.discordrpc"
$Manifest = Join-Path $InstallDir "$HostName.json"
$InstallInfo = Join-Path $InstallDir "install-info.json"
$ExtensionId = "jjmnjgihigllehhjfhcmhcgnkhjdablc"
$PublisherClientId = "1543575455523807385"

if(!(Test-Path $SourceExe)){
  throw "AnimeKaiRPCNativeHost.exe is missing from this package. Download the full AnimeKai RPC V6 Windows release ZIP, not the source-code archive."
}

New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
Copy-Item $SourceExe $InstalledExe -Force

$allowedOrigins = @("chrome-extension://$ExtensionId/")
if(Test-Path $Manifest){
  try {
    $oldManifest = Get-Content $Manifest -Raw | ConvertFrom-Json
    foreach($origin in @($oldManifest.allowed_origins)){
      if($origin -is [string] -and $origin.StartsWith("chrome-extension://") -and $allowedOrigins -notcontains $origin){
        $allowedOrigins += $origin
      }
    }
  } catch {}
}

$manifestObject = [ordered]@{
  name = $HostName
  description = "AnimeKai Discord RPC V6 native host - Made by viesca27"
  path = $InstalledExe
  type = "stdio"
  allowed_origins = $allowedOrigins
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

# Preserve RPC preferences from older V5/V6 installs while always restoring
# the public AnimeKai RPC Discord Application ID used by the stable release.
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

$installInfoObject = [ordered]@{
  version = $Version
  channel = $Channel
  installed_at = (Get-Date).ToUniversalTime().ToString("o")
  helper_path = $InstalledExe
  manifest_path = $Manifest
  extension_id = $ExtensionId
}
$installInfoObject | ConvertTo-Json -Depth 4 | Set-Content -Path $InstallInfo -Encoding UTF8

$title = if($Repair){"AnimeKai RPC V6 repaired"}else{"AnimeKai RPC V6 installed"}
$message = if($Repair){
  "Repair finished successfully.`n`nThe V6 desktop helper, Native Messaging registration, and stable configuration were refreshed. Your appearance settings and RPC preferences were kept.`n`nReturn to the AnimeKai RPC extension and press Refresh."
}else{
  "AnimeKai RPC V6 desktop helper $Version is installed.`n`nNo Discord Application ID setup is needed.`n`nReturn to the extension setup page, enable Player detection if needed, and click Check again."
}
Add-Type -AssemblyName PresentationFramework
[System.Windows.MessageBox]::Show($message,$title) | Out-Null

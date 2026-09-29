# Runs only on the disposable Windows Actions runner. Discord is not installed.
$ErrorActionPreference = 'Stop'
$Root = (Resolve-Path "$PSScriptRoot\..\..").Path
$Package = Join-Path $Root 'build\Anime-RPC-7.0.0-alpha.1'
$InstallDir = Join-Path $env:LOCALAPPDATA 'AnimeKaiRPC'
$Installer = Join-Path $Package 'windows\Install-Helper.ps1'
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile($Installer, [ref]$null, [ref]$errors) | Out-Null
if ($errors.Count) { throw $errors }

# Seed an earlier installation, including UTF-8 BOM and an additional browser ID.
New-Item -ItemType Directory -Force $InstallDir | Out-Null
'{"playbackMode":"paused","showTimestamp":false,"detailsTemplate":"{anime}"}' |
  Set-Content (Join-Path $InstallDir 'config.json') -Encoding UTF8
'{"allowed_origins":["chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/"]}' |
  Set-Content (Join-Path $InstallDir 'com.animekai.discordrpc.json') -Encoding UTF8
& $Installer -Silent
& $Installer -Silent -Repair
$Config = Get-Content (Join-Path $InstallDir 'config.json') -Raw | ConvertFrom-Json
if ($Config.playbackMode -ne 'paused' -or $Config.showTimestamp -ne $false) { throw 'Upgrade lost preferences' }
$ManifestPath = Join-Path $InstallDir 'com.animekai.discordrpc.json'
$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
if ($Manifest.allowed_origins -notcontains 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/') { throw 'Upgrade lost browser registration' }
foreach ($Browser in @('Google\Chrome', 'Chromium', 'Microsoft\Edge')) {
  $Key = "HKCU:\Software\$Browser\NativeMessagingHosts\com.animekai.discordrpc"
  if ((Get-Item $Key).GetValue('') -ne $ManifestPath) { throw "Registration failed: $Browser" }
}
python "$PSScriptRoot\executable-smoke.py" $Manifest.path
if ($LASTEXITCODE -ne 0) { throw 'Packaged helper smoke test failed' }
Write-Output 'Windows install, upgrade, repair, registrations, and packaged helper passed. Live Discord remains unchecked.'

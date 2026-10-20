param(
  [ValidateSet('9bizclaw','openclaw','claude','codex','auto')][string]$Target = '9bizclaw',
  [string]$Agent,
  [string]$InstallRoot,
  [string]$Destination,
  [switch]$Apply,
  [switch]$Upgrade,
  [switch]$InstallDependencies
)
$ErrorActionPreference = 'Stop'
$freeupRuntimeRoot = $InstallRoot
if (-not $freeupRuntimeRoot) { $freeupRuntimeRoot = $env:NINEBIZ_INSTALL_ROOT }
if (-not $freeupRuntimeRoot) { $freeupRuntimeRoot = $env:NINEBIZ_CLI_ROOT }
if (-not $freeupRuntimeRoot -and $env:APPDATA -and $Target -eq '9bizclaw') {
  $freeupMetadata = Join-Path $env:APPDATA '9BizClaw-v3\install-root.json'
  if (Test-Path -LiteralPath $freeupMetadata) { $freeupRuntimeRoot = (Get-Content -LiteralPath $freeupMetadata -Raw -Encoding UTF8 | ConvertFrom-Json).path }
}
$freeupNode = $null
if ($freeupRuntimeRoot) {
  $freeupBundledNode = Join-Path $freeupRuntimeRoot 'vendor\node\node.exe'
  if (Test-Path -LiteralPath $freeupBundledNode) { $freeupNode = $freeupBundledNode }
}
if (-not $freeupNode) {
  $freeupNodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($freeupNodeCommand) { $freeupNode = $freeupNodeCommand.Source }
}
if (-not $freeupNode) { throw 'Can Node 20+. 9B dung Node di kem runtime; khong dung duong dan may giang vien.' }
if (-not $Destination) { $Destination = Join-Path $env:TEMP ('freeup-content-' + [guid]::NewGuid().ToString('N')) }
$freeupDownloader = Join-Path $env:TEMP ('freeup-download-' + [guid]::NewGuid().ToString('N') + '.cjs')
Invoke-WebRequest 'https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/scripts/download.cjs' -OutFile $freeupDownloader
& $freeupNode $freeupDownloader --destination $Destination
if ($LASTEXITCODE -ne 0) { throw 'Tai/kiem hash that bai; chua cai skill.' }
$freeupArguments = @((Join-Path $Destination 'install.cjs'), '--target', $Target)
if ($Apply) { $freeupArguments += '--apply' } else { $freeupArguments += '--plan' }
if ($Upgrade) { $freeupArguments += '--upgrade' }
if ($Agent) { $freeupArguments += @('--agent', $Agent) }
if ($freeupRuntimeRoot -and $Target -eq '9bizclaw') { $freeupArguments += @('--install-root', $freeupRuntimeRoot) }
if ($InstallDependencies -and $Apply) { $freeupArguments += '--install-deps' }
& $freeupNode @freeupArguments
if ($LASTEXITCODE -ne 0) { throw 'Cai chua hoan tat. Doc loi cu the o tren.' }

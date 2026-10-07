#Requires -Version 5.1
<#
Tải bản ZIP cố định từ GitHub, kiểm SHA-256, giải nén an toàn và gọi bộ cài native.
Mặc định chỉ lập kế hoạch. Thêm -Apply để cài; -InstallDependencies để tải công cụ media.
#>
[CmdletBinding()]
param(
    [string] $Repository = 'phuongnguyendhtm/freeup-content-9b',
    [Alias('Commit')] [string] $Ref = 'main',
    [string] $ArtifactPath = 'distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.3.1.zip',
    [string] $Destination,
    [string] $Agent,
    [string] $InstallRoot,
    [Alias('Install')] [switch] $Apply,
    [switch] $InstallDependencies,
    [switch] $Upgrade,
    [switch] $FunctionsOnly
)

$ErrorActionPreference = 'Stop'
$GiftArchiveName = 'FREEUP-CONTENT-9B-HOC-VIEN-v1.3.1.zip'
$GiftArchiveSha256 = 'DA972285481EBE2590E236D7BDC6896D60F66D1321EBB030D508D4EF65B6EB10'

function Test-GiftBoundary {
    param([string] $Path, [string] $Boundary, [switch] $AllowRoot)
    $resolvedPath = [System.IO.Path]::GetFullPath($Path)
    $resolvedBoundary = [System.IO.Path]::GetFullPath($Boundary).TrimEnd([char[]]'\/')
    if ($AllowRoot -and $resolvedPath.TrimEnd([char[]]'\/').Equals($resolvedBoundary, [StringComparison]::OrdinalIgnoreCase)) { return $true }
    return $resolvedPath.StartsWith($resolvedBoundary + [System.IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)
}

function Assert-GiftNoReparsePoint {
    param([string] $Path)
    $current = [System.IO.Path]::GetFullPath($Path)
    while ($current) {
        if (Test-Path -LiteralPath $current) {
            $item = Get-Item -LiteralPath $current -Force
            if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw "Không dùng đường dẫn qua liên kết/junction: $current"
            }
        }
        $parent = [System.IO.Path]::GetDirectoryName($current.TrimEnd([char[]]'\/'))
        if (-not $parent -or $parent -eq $current) { break }
        $current = $parent
    }
}

function Test-GiftArchiveHash {
    param([string] $ArchivePath, [string] $ExpectedSha256)
    if ($ExpectedSha256 -notmatch '^[0-9a-fA-F]{64}$') { throw 'SHA-256 không hợp lệ.' }
    Assert-GiftNoReparsePoint $ArchivePath
    $actual = (Get-FileHash -LiteralPath $ArchivePath -Algorithm SHA256).Hash
    if ($actual -ne $ExpectedSha256) { throw 'ZIP không khớp SHA-256 của bản phát hành. Dừng cài, tải lại từ đúng commit.' }
}

function Save-GiftArchive {
    param([string] $Repository, [string] $Ref, [string] $ArchivePath, [string] $ExpectedSha256, [string] $ArtifactPath = 'distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.3.1.zip')
    if ($Repository -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') { throw 'Repository không hợp lệ.' }
    if ($Ref -ne 'main' -and $Ref -notmatch '^[0-9a-fA-F]{40}$') { throw 'Ref phải là main hoặc mã commit đầy đủ 40 ký tự.' }
    if ($ArtifactPath -notmatch '^[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*\.zip$' -or $ArtifactPath.Split('/') -contains '..') { throw 'ArtifactPath phải là đường dẫn ZIP tương đối an toàn trong repo.' }
    Assert-GiftNoReparsePoint $ArchivePath
    if (Test-Path -LiteralPath $ArchivePath) { throw 'Tệp tải phải là tệp mới.' }
    $archiveUrl = "https://raw.githubusercontent.com/$Repository/$Ref/$ArtifactPath"
    [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $archiveUrl -OutFile $ArchivePath -UseBasicParsing -TimeoutSec 180
    Test-GiftArchiveHash $ArchivePath $ExpectedSha256
}

function Expand-GiftArchive {
    param([string] $ArchivePath, [string] $TargetDirectory)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $target = [System.IO.Path]::GetFullPath($TargetDirectory)
    Assert-GiftNoReparsePoint $target
    if (Test-Path -LiteralPath $target) { throw 'Thư mục giải nén phải là thư mục mới, chưa tồn tại.' }
    $archive = [System.IO.Compression.ZipFile]::OpenRead($ArchivePath)
    try {
        if ($archive.Entries.Count -gt 20000) { throw 'ZIP có quá nhiều tệp.' }
        [long] $total = 0
        $records = @()
        $seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::OrdinalIgnoreCase)
        foreach ($entry in $archive.Entries) {
            $name = $entry.FullName.Replace('\', '/')
            if (-not $name -or $name.StartsWith('/') -or $name.Contains([char]0) -or $name.Contains(':')) { throw "Tên entry ZIP không an toàn: $name" }
            $isDirectory = $name.EndsWith('/')
            $parts = $name.TrimEnd('/').Split('/')
            foreach ($part in $parts) {
                if (-not $part -or $part -eq '.' -or $part -eq '..' -or $part.EndsWith('.') -or $part.EndsWith(' ') -or $part -match '[<>"|?*\x00-\x1F]' -or $part -match '^(?i:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)') { throw "Tên entry ZIP không an toàn: $name" }
            }
            $relative = $parts -join [System.IO.Path]::DirectorySeparatorChar
            $file = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($target, $relative))
            if (-not (Test-GiftBoundary $file $target)) { throw "Entry ZIP đi ra ngoài thư mục đích: $name" }
            if (-not $seen.Add($relative)) { throw "ZIP có tên tệp trùng: $name" }
            # ZIP stores Unix file type in the upper word; Windows reparse flag is in the lower word.
            $attributes = [long] $entry.ExternalAttributes
            $unixType = ($attributes -shr 16) -band 0xF000
            if ($unixType -eq 0xA000 -or (($attributes -band 0x400) -ne 0)) { throw "ZIP chứa liên kết không được hỗ trợ: $name" }
            if ($entry.Length -gt 134217728 -or ($entry.Length -gt 1048576 -and ($entry.CompressedLength -eq 0 -or ($entry.Length / $entry.CompressedLength) -gt 1000))) { throw "Dung lượng entry ZIP bất thường: $name" }
            $total += $entry.Length
            if ($total -gt 536870912) { throw 'Dung lượng giải nén vượt 512 MB.' }
            $records += [PSCustomObject]@{ Entry = $entry; File = $file; Directory = $isDirectory }
        }
        [void] [System.IO.Directory]::CreateDirectory($target)
        foreach ($record in $records) {
            if ($record.Directory) {
                [void] [System.IO.Directory]::CreateDirectory($record.File)
            } else {
                [void] [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($record.File))
                Assert-GiftNoReparsePoint $record.File
                $inputStream = $record.Entry.Open()
                $outputStream = [System.IO.File]::Open($record.File, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::Write, [System.IO.FileShare]::None)
                try { $inputStream.CopyTo($outputStream) } finally { $outputStream.Dispose(); $inputStream.Dispose() }
            }
        }
    } finally { $archive.Dispose() }
    $roots = @()
    if (Test-Path -LiteralPath (Join-Path $target 'bootstrap.cjs') -PathType Leaf) { $roots += $target }
    foreach ($directory in (Get-ChildItem -LiteralPath $target -Directory -Force)) {
        if (Test-Path -LiteralPath (Join-Path $directory.FullName 'bootstrap.cjs') -PathType Leaf) { $roots += $directory.FullName }
    }
    if ($roots.Count -ne 1) { throw 'ZIP phải chứa đúng một gói có bootstrap.cjs ở gốc hoặc một thư mục con.' }
    $packageRoot = $roots[0]
    $manifestPath = Join-Path $packageRoot 'distribution-manifest.json'
    if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'Gói thiếu manifest.' }
    $manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($manifest.package_id -ne 'freeup-content-student-gift' -or $manifest.version -ne '1.3.1') { throw 'Manifest không khớp gói học viên 1.3.1.' }
    return $packageRoot
}

function Find-GiftNode {
    param([string] $ExplicitInstallRoot)
    $root = $ExplicitInstallRoot
    if (-not $root) { $root = $env:NINEBIZ_INSTALL_ROOT }
    if (-not $root) { $root = $env:NINEBIZ_CLI_ROOT }
    if (-not $root -and $env:OPENCLAW_STATE_DIR) {
        $candidate = Split-Path -Path $env:OPENCLAW_STATE_DIR -Parent
        if (Test-Path -LiteralPath (Join-Path $candidate 'vendor\node_modules\openclaw\openclaw.mjs') -PathType Leaf) { $root = $candidate }
    }
    if (-not $root -and $env:APPDATA) {
        $metadata = Join-Path $env:APPDATA '9BizClaw-v3\install-root.json'
        if (Test-Path -LiteralPath $metadata -PathType Leaf) {
            $record = Get-Content -LiteralPath $metadata -Raw -Encoding UTF8 | ConvertFrom-Json
            if ($record.path -is [string] -and $record.path.Trim()) { $root = $record.path }
        }
    }
    if ($root) {
        $node = Join-Path $root 'vendor\node\node.exe'
        if (Test-Path -LiteralPath $node -PathType Leaf) { Assert-GiftNoReparsePoint $node; return $node }
        if ($ExplicitInstallRoot) { throw 'Thư mục 9B đã chỉ định thiếu Node đi kèm.' }
    }
    $command = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($command) { return $command.Source }
    throw 'Chưa tìm thấy Node của 9BizClaw v3. Mở/khởi tạo 9B trước, hoặc truyền -InstallRoot của máy này.'
}

function Invoke-GiftInstallJob {
    param([string] $NodePath, [string] $PackageRoot, [string[]] $Arguments)
    & $NodePath (Join-Path $PackageRoot 'install-job.cjs') @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Bộ cài chưa hoàn tất (mã $LASTEXITCODE). Đọc trạng thái/log; không tự đổi policy hay ghi đè skill khác." }
}

function Invoke-GiftBootstrap {
    param([string] $NodePath, [string] $PackageRoot, [string[]] $Arguments)
    & $NodePath (Join-Path $PackageRoot 'bootstrap.cjs') @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Bộ cài native dừng với mã $LASTEXITCODE. Giữ nguyên lỗi để xử lý; không tự đổi chính sách hay ghi đè skill." }
}

if ($FunctionsOnly) { return }
if ($Repository -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') { throw 'Cần -Repository dạng tài-khoản/tên-repo.' }
if ($Ref -ne 'main' -and $Ref -notmatch '^[0-9a-fA-F]{40}$') { throw 'Cần -Ref main hoặc mã commit Git đầy đủ 40 ký tự.' }
if ($Agent -and $Agent -notmatch '^[a-z][a-z0-9-]{0,63}$') { throw 'Agent ID không hợp lệ.' }
if ($InstallDependencies -and -not $Apply) { throw '-InstallDependencies chỉ dùng cùng -Apply.' }
if (-not $Destination) {
    if (-not $env:LOCALAPPDATA) { throw 'Cần -Destination khi máy không có LOCALAPPDATA.' }
    $Destination = Join-Path $env:LOCALAPPDATA '9BizClawContentPackages'
}
$destinationRoot = [System.IO.Path]::GetFullPath($Destination)
Assert-GiftNoReparsePoint $destinationRoot
[void] [System.IO.Directory]::CreateDirectory($destinationRoot)
$refLabel = $Ref.Substring(0, [Math]::Min(12, $Ref.Length))
$runDirectory = Join-Path $destinationRoot ('v1.3.1-' + $refLabel + '-' + [Guid]::NewGuid().ToString('N'))
if (-not (Test-GiftBoundary $runDirectory $destinationRoot)) { throw 'Thư mục tải nằm ngoài đích.' }
[void] [System.IO.Directory]::CreateDirectory($runDirectory)
$archivePath = Join-Path $runDirectory $GiftArchiveName
# Only this explicit HTTPS address is downloaded; source is never executed from a pipe.
Write-Host 'Đang tải gói học viên từ bản đã chọn...'
Save-GiftArchive $Repository $Ref $archivePath $GiftArchiveSha256 $ArtifactPath
$packageRoot = Expand-GiftArchive $archivePath (Join-Path $runDirectory 'package')
$nodePath = Find-GiftNode $InstallRoot
$sharedArguments = @()
if ($Agent) { $sharedArguments += @('--agent', $Agent) }
if ($InstallRoot) { $sharedArguments += @('--install-root', $InstallRoot) }
if ($Upgrade) { $sharedArguments += '--upgrade' }
Write-Host "Gói đã kiểm chứng: $packageRoot"
Write-Host 'Đang kiểm tra kế hoạch cài qua công cụ native...'
Invoke-GiftBootstrap $nodePath $packageRoot (@('--plan') + $sharedArguments)
if ($Apply) {
    $applyArguments = @('run') + $sharedArguments
    if ($InstallDependencies) { $applyArguments += '--install-deps' }
    Invoke-GiftInstallJob $nodePath $packageRoot $applyArguments
    Write-Host 'Bộ cài đã hoàn tất các kiểm tra. Mở chat 9B và chạy /caidat để kiểm hồ sơ doanh nghiệp.'
} else {
    Write-Host 'Đã lập kế hoạch, chưa cài. Dùng cùng lệnh với -Apply; thêm -InstallDependencies khi cần công cụ ảnh/video.'
}
Write-Host "Bản tải được lưu tại: $runDirectory"

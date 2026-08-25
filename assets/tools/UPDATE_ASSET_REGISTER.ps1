param(
    [switch]$Verify,
    [string]$AssetId,
    [string]$NewPath,
    [string]$ExpectedSha256
)

$ErrorActionPreference = "Stop"

$AssetRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$RepoRoot = Resolve-Path -LiteralPath (Join-Path $AssetRoot "..")
$RegisterPath = Join-Path $AssetRoot "registers\GG_ASSET_REGISTER.csv"
$ProvenancePath = Join-Path $AssetRoot "registers\GG_ASSET_PROVENANCE_REGISTER.csv"
$RenameLogPath = Join-Path $AssetRoot "registers\GG_FILENAME_RENAME_LOG.csv"

function Convert-ToRepoPath {
    param([string]$PathValue)
    $absolute = Resolve-Path -LiteralPath $PathValue
    return ($absolute.Path.Substring($RepoRoot.Path.Length + 1) -replace "\\", "/")
}

function Get-FileSha256 {
    param([string]$PathValue)
    return (Get-FileHash -LiteralPath $PathValue -Algorithm SHA256).Hash.ToUpperInvariant()
}

function Assert-Unique {
    param(
        [array]$Rows,
        [string]$Field,
        [string]$Label
    )

    $duplicates = $Rows | Group-Object -Property $Field | Where-Object { $_.Count -gt 1 }
    if ($duplicates.Count -gt 0) {
        $names = ($duplicates | ForEach-Object { $_.Name }) -join ", "
        throw "$Label contains duplicate values: $names"
    }
}

function Invoke-Verify {
    if (!(Test-Path -LiteralPath $RegisterPath)) { throw "Missing asset register: $RegisterPath" }
    if (!(Test-Path -LiteralPath $ProvenancePath)) { throw "Missing provenance register: $ProvenancePath" }
    if (!(Test-Path -LiteralPath $RenameLogPath)) { throw "Missing filename rename log: $RenameLogPath" }

    $assets = Import-Csv -LiteralPath $RegisterPath
    $provenance = Import-Csv -LiteralPath $ProvenancePath

    Assert-Unique -Rows $assets -Field "asset_id" -Label "Asset register"
    Assert-Unique -Rows $assets -Field "canonical_path" -Label "Asset register"

    $missing = @()
    $hashMismatch = @()
    foreach ($asset in $assets) {
        $path = Join-Path $RepoRoot ($asset.canonical_path -replace "/", "\")
        if (!(Test-Path -LiteralPath $path)) {
            $missing += $asset.canonical_path
            continue
        }

        $actual = Get-FileSha256 -PathValue $path
        if ($actual -ne $asset.sha256.ToUpperInvariant()) {
            $hashMismatch += "$($asset.canonical_path) expected $($asset.sha256) actual $actual"
        }
    }

    if ($missing.Count -gt 0) { throw "Missing registered files: $($missing -join ', ')" }
    if ($hashMismatch.Count -gt 0) { throw "Hash mismatches: $($hashMismatch -join '; ')" }

    $registeredPaths = @{}
    foreach ($asset in $assets) {
        $registeredPaths[$asset.canonical_path] = $true
    }

    $excludedPrefixes = @(
        "assets/registers/",
        "assets/tools/"
    )
    $excludedFiles = @(
        "assets/README.md",
        "assets/OWNERSHIP_PROVENANCE_AND_IP_BASELINE.md"
    )

    $unregistered = @()
    Get-ChildItem -LiteralPath $AssetRoot -Recurse -File | ForEach-Object {
        $repoPath = Convert-ToRepoPath -PathValue $_.FullName
        $excluded = $false
        foreach ($prefix in $excludedPrefixes) {
            if ($repoPath.StartsWith($prefix)) { $excluded = $true }
        }
        if ($excludedFiles -contains $repoPath) { $excluded = $true }
        if (!$excluded -and !$registeredPaths.ContainsKey($repoPath)) {
            $unregistered += $repoPath
        }
    }
    if ($unregistered.Count -gt 0) { throw "Unregistered production/evidence assets: $($unregistered -join ', ')" }

    $productionHold = $assets | Where-Object {
        $_.runtime_status -eq "ACTIVE_PRODUCTION" -and
        @("UNKNOWN_HOLD", "FOUNDER_CONFIRMATION_REQUIRED", "CONTRIBUTOR_ASSIGNMENT_REQUIRED", "REFERENCE_ONLY") -contains $_.rights_status
    }
    if ($productionHold.Count -gt 0) {
        throw "Active production assets with unresolved rights: $($productionHold.asset_id -join ', ')"
    }

    $assetIds = @{}
    foreach ($asset in $assets) { $assetIds[$asset.asset_id] = $true }
    $missingProvenance = @()
    foreach ($asset in $assets) {
        if (@($provenance | Where-Object { $_.asset_id -eq $asset.asset_id }).Count -eq 0) {
            $missingProvenance += $asset.asset_id
        }
    }
    if ($missingProvenance.Count -gt 0) { throw "Missing provenance rows: $($missingProvenance -join ', ')" }

    $zipFiles = Get-ChildItem -LiteralPath $AssetRoot -Recurse -File -Filter "*.zip"
    if ($zipFiles.Count -gt 0) {
        throw "Transport ZIP files are not permitted in assets/: $($zipFiles.FullName -join ', ')"
    }

    [PSCustomObject]@{
        ASSET_REGISTER = "PASS"
        PROVENANCE_REGISTER = "PASS"
        RENAME_LOG = "PASS"
        DUPLICATE_ASSET_IDS = 0
        MISSING_REGISTERED_FILES = 0
        HASH_MISMATCHES = 0
        UNREGISTERED_PRODUCTION_ASSETS = 0
        UNKNOWN_PRODUCTION_RIGHTS = 0
        TRANSPORT_ZIPS_UNDER_ASSETS = 0
        ASSET_RECORDS = $assets.Count
        PROVENANCE_RECORDS = $provenance.Count
    } | Format-List
}

function Invoke-MoveAsset {
    if ([string]::IsNullOrWhiteSpace($AssetId) -or [string]::IsNullOrWhiteSpace($NewPath) -or [string]::IsNullOrWhiteSpace($ExpectedSha256)) {
        throw "Move mode requires -AssetId, -NewPath and -ExpectedSha256."
    }

    $assets = Import-Csv -LiteralPath $RegisterPath
    $asset = $assets | Where-Object { $_.asset_id -eq $AssetId }
    if ($asset.Count -ne 1) { throw "Unknown or non-unique AssetId: $AssetId" }

    $oldPath = Join-Path $RepoRoot ($asset.canonical_path -replace "/", "\")
    if (!(Test-Path -LiteralPath $oldPath)) { throw "Registered source file does not exist: $($asset.canonical_path)" }

    $newAbs = Join-Path $RepoRoot ($NewPath -replace "/", "\")
    if (Test-Path -LiteralPath $newAbs) { throw "Refusing to overwrite existing path: $NewPath" }

    $oldSha = Get-FileSha256 -PathValue $oldPath
    if ($oldSha -ne $ExpectedSha256.ToUpperInvariant()) {
        throw "Expected hash mismatch before move. Expected $ExpectedSha256 actual $oldSha"
    }

    New-Item -ItemType Directory -Path (Split-Path -Parent $newAbs) -Force | Out-Null
    Move-Item -LiteralPath $oldPath -Destination $newAbs
    $newSha = Get-FileSha256 -PathValue $newAbs
    if ($newSha -ne $oldSha) { throw "Hash changed during move: $oldSha -> $newSha" }

    foreach ($row in $assets) {
        if ($row.asset_id -eq $AssetId) {
            $row.canonical_path = ($NewPath -replace "\\", "/")
            $row.canonical_filename = Split-Path -Leaf $NewPath
            $row.sha256 = $newSha
        }
    }
    $assets | Sort-Object canonical_path | Export-Csv -LiteralPath $RegisterPath -NoTypeInformation

    $logRow = [PSCustomObject]@{
        old_source_path = $asset.canonical_path
        old_filename = $asset.canonical_filename
        new_canonical_path = ($NewPath -replace "\\", "/")
        new_filename = Split-Path -Leaf $NewPath
        source_sha256 = $oldSha
        canonical_sha256 = $newSha
        disposition = "REGISTERED_MOVE"
        reason = "Move performed by UPDATE_ASSET_REGISTER.ps1 with hash-preserving validation."
        registered_date = (Get-Date -Format "yyyy-MM-dd")
    }
    $logRow | Export-Csv -LiteralPath $RenameLogPath -NoTypeInformation -Append
    Invoke-Verify
}

if ($Verify -or ([string]::IsNullOrWhiteSpace($AssetId) -and [string]::IsNullOrWhiteSpace($NewPath))) {
    Invoke-Verify
} else {
    Invoke-MoveAsset
}

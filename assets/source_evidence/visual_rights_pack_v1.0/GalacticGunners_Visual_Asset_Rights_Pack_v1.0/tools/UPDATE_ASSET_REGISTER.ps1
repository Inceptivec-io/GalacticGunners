[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [string]$AssetRoot = ".\assets",
    [string]$RegisterPath = ".\registers\GG_ASSET_REGISTER_v1.0.csv",
    [string]$RenameLogPath = ".\registers\GG_FILENAME_RENAME_LOG_v1.0.csv"
)

$ErrorActionPreference = "Stop"
$assetRootResolved = (Resolve-Path -LiteralPath $AssetRoot).Path
$register = @(Import-Csv -LiteralPath $RegisterPath)
$renames = @(Import-Csv -LiteralPath $RenameLogPath)

foreach ($rename in $renames) {
    if ($rename.status -ne "Pending") { continue }
    $record = $register | Where-Object { $_.asset_id -eq $rename.asset_id } | Select-Object -First 1
    if (-not $record) { throw "Asset ID not found in register: $($rename.asset_id)" }
    if ($record.current_filename -ne $rename.old_filename) {
        throw "Old filename does not match register for $($rename.asset_id)"
    }
    $oldPath = Join-Path $assetRootResolved $rename.old_filename
    $newPath = Join-Path $assetRootResolved $rename.new_filename
    if (-not (Test-Path -LiteralPath $oldPath -PathType Leaf)) { throw "Source file missing: $oldPath" }
    if (Test-Path -LiteralPath $newPath) { throw "Destination already exists: $newPath" }
    $newParent = Split-Path -Parent $newPath
    if (-not (Test-Path -LiteralPath $newParent)) { New-Item -ItemType Directory -Path $newParent | Out-Null }
    if ($PSCmdlet.ShouldProcess($oldPath, "Rename to $newPath")) {
        Move-Item -LiteralPath $oldPath -Destination $newPath
        $hash = (Get-FileHash -LiteralPath $newPath -Algorithm SHA256).Hash.ToLowerInvariant()
        $prior = @($record.previous_filenames -split ';' | Where-Object { $_ })
        if ($record.current_filename -notin $prior) { $prior += $record.current_filename }
        $record.previous_filenames = ($prior -join ';')
        $record.current_filename = $rename.new_filename
        $record.sha256 = $hash
        $record.last_updated = (Get-Date).ToString('yyyy-MM-dd')
        $rename.status = "Applied"
        $rename.sha256_after_rename = $hash
    }
}

$register | Export-Csv -LiteralPath $RegisterPath -NoTypeInformation -Encoding UTF8
$renames | Export-Csv -LiteralPath $RenameLogPath -NoTypeInformation -Encoding UTF8
Write-Host "Asset register and rename log updated successfully."

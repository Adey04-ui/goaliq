
param(
    [switch]$Apply
)

$ErrorActionPreference = "Stop"

$root = (Get-Location).Path

$targets = @(
    "app/api/matches/[matchId]/route.js",
    "app/api/matches/[matchId]/events/route.js",
    "app/api/matches/[matchId]/form/route.js",
    "app/api/matches/[matchId]/h2h/route.js",
    "app/api/matches/[matchId]/lineups/route.js",
    "app/api/matches/[matchId]/odds/route.js",
    "app/api/matches/[matchId]/standings/route.js",
    "app/api/matches/[matchId]/stats/route.js",
    "app/api/teams/[teamId]/route.js",
    "app/api/teams/[teamId]/fixtures/route.js",
    "app/api/teams/[teamId]/squad/route.js",
    "app/api/teams/[teamId]/stats/route.js"
)

$monitorImport = 'import { withApiMonitoring } from "@/lib/apiMonitor";'
$rateLimitImportPattern = '(?m)^import\s+\{\s*withRateLimit\s*\}\s+from\s+["'']@/lib/withRateLimit["''];?\s*$'

# These routes use a single-line export with the read limiter.
$exportPattern = '(?m)^export const (GET|POST|PUT|PATCH|DELETE) = withRateLimit\((getHandler,\s*\{\s*limiter:\s*["'']read["'']\s*\})\);?\s*$'

$ready = [System.Collections.Generic.List[object]]::new()
$skipped = [System.Collections.Generic.List[string]]::new()

Write-Host ""
Write-Host "Dynamic route monitoring $($(if ($Apply) { 'apply' } else { 'preview' }))" -ForegroundColor Cyan
Write-Host ""

foreach ($relativePath in $targets) {
    $fullPath = Join-Path $root $relativePath

    if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) {
        Write-Host "[SKIP] $relativePath - file not found" -ForegroundColor Yellow
        $skipped.Add("$relativePath - file not found")
        continue
    }

    $original = Get-Content -LiteralPath $fullPath -Raw

    if ($original -match 'withApiMonitoring') {
        Write-Host "[SKIP] $relativePath - monitoring already present" -ForegroundColor Yellow
        $skipped.Add("$relativePath - monitoring already present")
        continue
    }

    if ($original -notmatch $rateLimitImportPattern) {
        Write-Host "[SKIP] $relativePath - expected withRateLimit import not found" -ForegroundColor Yellow
        $skipped.Add("$relativePath - expected withRateLimit import not found")
        continue
    }

    $routeMatches = [regex]::Matches($original, $exportPattern)

    if ($routeMatches.Count -ne 1) {
        Write-Host "[SKIP] $relativePath - expected exactly one supported rate-limited export, found $($routeMatches.Count)" -ForegroundColor Yellow
        $skipped.Add("$relativePath - unsupported or ambiguous export")
        continue
    }

    $routeMatch = $routeMatches[0]
    $method = $routeMatch.Groups[1].Value
    $arguments = $routeMatch.Groups[2].Value

    $replacement = "export const $method = withApiMonitoring(withRateLimit($arguments));"

    $updated = $original.Substring(0, $routeMatch.Index) +
        $replacement +
        $original.Substring($routeMatch.Index + $routeMatch.Length)

    # Add the monitoring import immediately after the existing rate-limit import.
    $importMatch = [regex]::Match($updated, $rateLimitImportPattern)

    if (-not $importMatch.Success) {
        Write-Host "[SKIP] $relativePath - could not locate rate-limit import after transformation" -ForegroundColor Yellow
        $skipped.Add("$relativePath - could not locate rate-limit import")
        continue
    }

    $updated = $updated.Insert(
        $importMatch.Index + $importMatch.Length,
        "`r`n$monitorImport"
    )

    $ready.Add([PSCustomObject]@{
        RelativePath = $relativePath
        FullPath     = $fullPath
        Original     = $original
        Updated      = $updated
    })

    Write-Host "[READY] $relativePath" -ForegroundColor Green
}

Write-Host ""
Write-Host "Ready: $($ready.Count)" -ForegroundColor Green
Write-Host "Skipped: $($skipped.Count)" -ForegroundColor Yellow

if (-not $Apply) {
    Write-Host ""
    Write-Host "DRY RUN ONLY. No files changed." -ForegroundColor Cyan
    Write-Host "Review the preview, then rerun with -Apply."
    exit 0
}

if ($ready.Count -eq 0) {
    Write-Host "No eligible files to modify." -ForegroundColor Yellow
    exit 0
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $root ".api-monitor-backups\$timestamp"
$writtenFiles = [System.Collections.Generic.List[string]]::new()

# Create backups before changing any route.
foreach ($item in $ready) {
    $backupPath = Join-Path $backupRoot $item.RelativePath
    $backupDirectory = Split-Path -Parent $backupPath

    New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
    Copy-Item -LiteralPath $item.FullPath -Destination $backupPath -Force
}

try {
    foreach ($item in $ready) {
        # UTF-8 without BOM.
        $encoding = [System.Text.UTF8Encoding]::new($false)

        [System.IO.File]::WriteAllText(
            $item.FullPath,
            $item.Updated,
            $encoding
        )

        $writtenFiles.Add($item.FullPath)
        Write-Host "[UPDATED] $($item.RelativePath)" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Successfully updated $($writtenFiles.Count) route files." -ForegroundColor Green
    Write-Host "Backups saved to: $backupRoot" -ForegroundColor Cyan
}
catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Restoring files modified during this run..." -ForegroundColor Yellow

    foreach ($filePath in $writtenFiles) {
        $relativePath = $filePath.Substring($root.Length).TrimStart('\', '/')
        $backupPath = Join-Path $backupRoot $relativePath

        if (Test-Path -LiteralPath $backupPath -PathType Leaf) {
            Copy-Item -LiteralPath $backupPath -Destination $filePath -Force
            Write-Host "[RESTORED] $relativePath" -ForegroundColor Yellow
        }
    }

    throw
}
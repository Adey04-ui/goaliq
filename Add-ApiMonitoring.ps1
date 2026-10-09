
param(
    [switch]$Apply
)

$ErrorActionPreference = "Stop"
$root = (Get-Location).Path

if (-not (Test-Path (Join-Path $root "app/api"))) {
    throw "Run this script from the GOALIQ project root."
}

$targets = @(
    "app/api/favourites/route.js",
    "app/api/fixtures/route.js",
    "app/api/following/route.js",
    "app/api/following/feed/route.js",
    "app/api/knockout/route.js",
    "app/api/leagues/route.js",
    "app/api/leagues/search/route.js",
    "app/api/matches/route.js",
    "app/api/matches/calendar/route.js",
    "app/api/players/search/route.js",
    "app/api/search/route.js",
    "app/api/standings/route.js",
    "app/api/teams/route.js",
    "app/api/teams/search/route.js",
    "app/api/topScorers/route.js",
    "app/api/user/activity/route.js",
    "app/api/user/blocked/route.js",
    "app/api/user/notifications/route.js",
    "app/api/user/profile/route.js",
    "app/api/user/subscription/route.js",
    "app/api/user/upload-avatar/route.js",
    "app/api/xi/route.js"
)

$backupRoot = Join-Path (Split-Path $root -Parent) (
    "goaliq-api-monitor-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss")
)

$changes = @()
$skipped = @()

# Recognize only simple HTTP method exports using withRateLimit.
$pattern = '(?m)^export const (GET|POST|PUT|PATCH|DELETE) = withRateLimit\((.+)\);?\s*$'

foreach ($relativePath in $targets) {
    $path = Join-Path $root $relativePath

    if (-not (Test-Path $path)) {
        $skipped += "$relativePath - file not found"
        continue
    }

    $original = [System.IO.File]::ReadAllText($path)

    if ($original.Contains("withApiMonitoring")) {
        $skipped += "$relativePath - monitoring already referenced"
        continue
    }

    # Only handle single-line exports withRateLimit(handler, options).
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.AddRange([string[]]($original -split "\r?\n"))

    $methodCount = 0
    $methods = @()
    $safe = $true

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]

        if ($line -match '^\s*export const (GET|POST|PUT|PATCH|DELETE) = withRateLimit\(') {
            if ($line -notmatch '^\s*export const (GET|POST|PUT|PATCH|DELETE) = withRateLimit\((.+)\);?\s*$') {
                $safe = $false
                break
            }

            $method = $Matches[1]
            $inner = $Matches[2].Trim()

            $lines[$i] = "export const $method = withApiMonitoring(withRateLimit($inner));"
            $methods += $method
            $methodCount++
        }
    }

    if (-not $safe -or $methodCount -eq 0) {
        $skipped += "$relativePath - unsupported export format"
        continue
    }

    $updated = $lines -join "`n"

    # Require a standard named import from the expected module.
    $importRegex = '(?m)^import \{([^}]*)\} from ["'']@/lib/withRateLimit["''];?\s*$'
    $importMatch = [regex]::Match($updated, $importRegex)

    if (-not $importMatch.Success) {
        $skipped += "$relativePath - rate-limit import not recognized"
        continue
    }

    $updated = [regex]::Replace(
        $updated,
        $importRegex,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)

            $names = $m.Groups[1].Value.Trim()

            if ($names -match '\bwithApiMonitoring\b') {
                return $m.Value
            }

            return "import { $names } from `"@/lib/withRateLimit`";`nimport { withApiMonitoring } from `"@/lib/apiMonitor`";"
        },
        1
    )

    $changes += [PSCustomObject]@{
        Path = $path
        Relative = $relativePath
        Original = $original
        Updated = $updated
        Methods = ($methods -join ", ")
    }
}

Write-Host "`nAPI monitoring preview" -ForegroundColor Cyan

foreach ($change in $changes) {
    Write-Host "[READY] $($change.Relative) ($($change.Methods))" -ForegroundColor Green
}

foreach ($item in $skipped) {
    Write-Host "[SKIP] $item" -ForegroundColor Yellow
}

Write-Host "`nFiles ready: $($changes.Count)"
Write-Host "Files skipped: $($skipped.Count)"

if (-not $Apply) {
    Write-Host "`nDRY RUN ONLY. No files changed." -ForegroundColor Cyan
    Write-Host "If the preview is correct, rerun with -Apply."
    return
}

if ($changes.Count -eq 0) {
    Write-Host "No files to update." -ForegroundColor Yellow
    return
}

New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

foreach ($change in $changes) {
    $backupPath = Join-Path $backupRoot $change.Relative
    $backupDirectory = Split-Path $backupPath -Parent

    New-Item -ItemType Directory -Path $backupDirectory -Force |
        Out-Null

    [System.IO.File]::WriteAllText(
        $backupPath,
        $change.Original,
        [System.Text.UTF8Encoding]::new($false)
    )
}

try {
    foreach ($change in $changes) {
        [System.IO.File]::WriteAllText(
            $change.Path,
            $change.Updated,
            [System.Text.UTF8Encoding]::new($false)
        )
    }
}
catch {
    Write-Host "Write failed. Restoring backups." -ForegroundColor Red

    foreach ($change in $changes) {
        $backupPath = Join-Path $backupRoot $change.Relative

        if (Test-Path $backupPath) {
            Copy-Item $backupPath $change.Path -Force
        }
    }

    throw
}

Write-Host "`nChanges applied." -ForegroundColor Green
Write-Host "Backup directory: $backupRoot"
Write-Host "Nothing was committed or pushed."
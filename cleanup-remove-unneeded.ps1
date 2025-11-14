<#
Cleanup script to remove unused Prisma/Postgres artifacts and other unneeded files
Run from the repository root (PowerShell):
  .\cleanup-remove-unneeded.ps1

This will delete:
- auth-backend/prisma (Prisma schema & migrations)
- auth-backend/package-lock.json
- auth-backend/package-lock.json.lock (if exists)

Review the list below before running. The script will prompt before deleting each item.
#>

$root = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Write-Host "Repository root: $root" -ForegroundColor Cyan

$toDelete = @(
  "$root\auth-backend\prisma",
  "$root\auth-backend\package-lock.json",
  "$root\auth-backend\prisma.lock",
  "$root\auth-backend\prisma\migrations",
  "$root\auth-backend\prisma\schema.prisma"
)

foreach ($item in $toDelete) {
  if (Test-Path $item) {
    Write-Host "Found: $item" -ForegroundColor Yellow
    $confirm = Read-Host "Delete this item? (y/N)"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
      try {
        Remove-Item -LiteralPath $item -Recurse -Force
        Write-Host "Deleted: $item" -ForegroundColor Green
      } catch {
        Write-Host "Failed to delete: $item - $_" -ForegroundColor Red
      }
    } else {
      Write-Host "Skipped: $item" -ForegroundColor Gray
    }
  } else {
    Write-Host "Not found: $item" -ForegroundColor DarkGray
  }
}

Write-Host "Cleanup script finished. Run 'git status' to review changes." -ForegroundColor Cyan

# scripts/install-hooks.ps1
#
# Wire `.githooks/` thành Git hooks directory cho Windows PowerShell.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File scripts\install-hooks.ps1
#
# What it does:
#   1. `git config core.hooksPath .githooks`
#   2. Verify hooks exist and are executable
#
# Note: On Windows, Git treats `.githooks/*` files as executable if they
# exist (no chmod needed). For Cygwin/MSYS, the .sh installer is preferred.

$ErrorActionPreference = 'Stop'

$ROOT = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $ROOT

Write-Host "→ Setting core.hooksPath = .githooks" -ForegroundColor Cyan
git config core.hooksPath .githooks

Write-Host "→ Verifying hooks"
$preCommit = Test-Path '.githooks/pre-commit'
$commitMsg = Test-Path '.githooks/commit-msg'

Write-Host "  core.hooksPath = $(git config core.hooksPath)"
Write-Host "  pre-commit:    $(if ($preCommit) { 'OK' } else { 'MISSING' })"
Write-Host "  commit-msg:    $(if ($commitMsg) { 'OK' } else { 'MISSING' })"

if (-not $preCommit -or -not $commitMsg) {
    Write-Host ""
    Write-Host "❌ One or more hooks are missing. Run from repo root:" -ForegroundColor Red
    Write-Host "   bash scripts/install-hooks.sh  (preferred, works in WSL/MSYS/Cygwin)"
    exit 1
}

Write-Host ""
Write-Host "✅ Git hooks installed." -ForegroundColor Green
Write-Host ""
Write-Host "   Test:    powershell -File scripts\install-hooks.ps1"
Write-Host "   Bypass: git commit --no-verify  (will be caught by CI)"
Write-Host ""
Write-Host "   CI gate: .github/workflows/skill-check.yml runs even on bypass."
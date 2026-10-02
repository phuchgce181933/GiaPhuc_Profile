#!/usr/bin/env bash
#
# scripts/install-hooks.sh
#
# Wire `.githooks/` thành Git hooks directory cho Linux/macOS/WSL.
#
# Usage:
#   bash scripts/install-hooks.sh
#
# What it does:
#   1. `git config core.hooksPath .githooks`
#   2. `chmod +x .githooks/pre-commit .githooks/commit-msg`
#   3. Verify hooks are executable
#
# Re-run after cloning or copying repo to a new machine.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

echo "→ Setting core.hooksPath = .githooks"
git config core.hooksPath .githooks

echo "→ Making hooks executable"
chmod +x .githooks/pre-commit .githooks/commit-msg

echo "→ Verifying"
echo "  core.hooksPath = $(git config core.hooksPath)"
echo "  pre-commit:    $(test -x .githooks/pre-commit && echo OK || echo MISSING)"
echo "  commit-msg:    $(test -x .githooks/commit-msg && echo OK || echo MISSING)"

echo ""
echo "✅ Git hooks installed."
echo ""
echo "   Test:    bash scripts/install-hooks.sh"
echo "   Bypass: git commit --no-verify  (will be caught by CI)"
echo ""
echo "   CI gate: .github/workflows/skill-check.yml runs even on bypass."
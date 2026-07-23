#!/usr/bin/env bash
set -euo pipefail

# Self-skipping E2E gate for the GSD autonomous run.
#
# Wired into .planning/config.json as `workflow.test_command`, so GSD runs it in
# two places every phase: the execute-phase regression gate (halts on failure)
# and the verify-phase behavioral-evidence step (passing tests are credited
# toward success criteria, which converts would-be human-verify items into
# machine-VERIFIED ones — that is what shrinks the end-of-phase UAT gate).
#
# It PASSES (exit 0) until the app + Playwright + at least one spec all exist,
# so Phase 1 (scaffold only, no app or tests yet) is never falsely blocked.
# From Phase 2 on — once specs exist — it becomes a real pass/fail gate.

# 1. No Playwright config yet → nothing to run.
if [ ! -f playwright.config.ts ]; then
  echo "▹ test-gate: no playwright.config.ts yet — skipping (pre-Phase-2)"
  exit 0
fi

# 2. Playwright not installed yet → skip rather than letting bunx auto-download
#    a browser mid-gate (which would blow the 300s verify-phase timeout).
if [ ! -x node_modules/.bin/playwright ]; then
  echo "▹ test-gate: @playwright/test not installed yet — skipping"
  echo "  (install with: bun add -d @playwright/test && bunx playwright install chromium)"
  exit 0
fi

# 3. No spec files yet → skip.
if ! find tests -name '*.spec.ts' -type f 2>/dev/null | grep -q .; then
  echo "▹ test-gate: no *.spec.ts under tests/ yet — skipping"
  exit 0
fi

# 4. Everything present → real gate.
echo "▶ test-gate: running Playwright suite (bundled Chromium)"
exec bunx playwright test

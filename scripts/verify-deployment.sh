#!/usr/bin/env bash
set -euo pipefail

# Re-runnable deployed-surface verifier for this project (DEPL-01/DEPL-02, SEO-08,
# ASSET-02). Asserts the deployed origin under test — passed as $1, never a
# hardcoded host — actually serves what Phase 3 built: 200s on the crawl surfaces,
# the SoftwareApplication JSON-LD, the correct canonical host, the OG image, and
# the correct X-Robots-Tag posture for the environment under test.
#
# Usage: scripts/verify-deployment.sh <base-url> [--expect-noindex] [--expect-beacons]
#
#   <base-url>          Required. e.g. https://overlay-notes-landing.vercel.app
#   --expect-noindex    Preview/non-production posture: require X-Robots-Tag to be
#                        present and contain "noindex". Omit for the production
#                        default, which requires the header to be absent entirely.
#   --expect-beacons     Additionally require the Vercel Analytics / Speed Insights
#                        beacon scripts to return 200 (DEPL-04).

usage() {
  echo "Usage: scripts/verify-deployment.sh <base-url> [--expect-noindex] [--expect-beacons]" >&2
}

if [ $# -lt 1 ]; then
  usage
  exit 2
fi

BASE_URL="$1"
shift

EXPECT_NOINDEX=0
EXPECT_BEACONS=0

for arg in "$@"; do
  case "$arg" in
    --expect-noindex)
      EXPECT_NOINDEX=1
      ;;
    --expect-beacons)
      EXPECT_BEACONS=1
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage
      exit 2
      ;;
  esac
done

# Strip a trailing slash so path concatenation below never double-slashes.
BASE_URL="${BASE_URL%/}"

CANONICAL_HOST="https://overlay-notes.kalebnim.dev"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  echo "PASS: $1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  echo "FAIL: $1"
}

http_status() {
  # Never pass --insecure — a TLS failure must fail the check, not be waved through.
  curl -sS -o /dev/null -w '%{http_code}' "$1" 2>/dev/null || echo "000"
}

echo "▶ verify-deployment: checking $BASE_URL"
echo ""

# --- / returns 200 over HTTPS ------------------------------------------------
STATUS=$(http_status "$BASE_URL/")
if [ "$STATUS" = "200" ]; then
  pass "/ returns 200 (observed: $STATUS)"
else
  fail "/ expected 200, observed: $STATUS"
fi

# --- /robots.txt returns 200 and names the sitemap ---------------------------
ROBOTS_STATUS=$(http_status "$BASE_URL/robots.txt")
if [ "$ROBOTS_STATUS" = "200" ]; then
  pass "/robots.txt returns 200 (observed: $ROBOTS_STATUS)"
  ROBOTS_BODY=$(curl -sS "$BASE_URL/robots.txt" 2>/dev/null || echo "")
  if echo "$ROBOTS_BODY" | grep -qi 'Sitemap:'; then
    pass "/robots.txt body contains 'Sitemap:'"
  else
    fail "/robots.txt body does not contain 'Sitemap:'"
  fi
else
  fail "/robots.txt expected 200, observed: $ROBOTS_STATUS"
fi

# --- /sitemap.xml returns 200 -------------------------------------------------
SITEMAP_STATUS=$(http_status "$BASE_URL/sitemap.xml")
if [ "$SITEMAP_STATUS" = "200" ]; then
  pass "/sitemap.xml returns 200 (observed: $SITEMAP_STATUS)"
else
  fail "/sitemap.xml expected 200, observed: $SITEMAP_STATUS"
fi

# --- /og-image.png returns 200 as image/png -----------------------------------
OG_HEADERS=$(curl -sSD - -o /dev/null "$BASE_URL/og-image.png" 2>/dev/null || echo "")
OG_STATUS=$(echo "$OG_HEADERS" | head -1 | grep -oE '[0-9]{3}' | head -1 || echo "000")
OG_CONTENT_TYPE=$(echo "$OG_HEADERS" | { grep -i '^content-type:' || true; } | head -1 | tr -d '\r' | sed 's/^[Cc]ontent-[Tt]ype: *//')
if [ "$OG_STATUS" = "200" ]; then
  pass "/og-image.png returns 200 (observed: $OG_STATUS)"
else
  fail "/og-image.png expected 200, observed: $OG_STATUS"
fi
if echo "$OG_CONTENT_TYPE" | grep -qi '^image/png'; then
  pass "/og-image.png content-type is image/png (observed: $OG_CONTENT_TYPE)"
else
  fail "/og-image.png expected content-type image/png, observed: $OG_CONTENT_TYPE"
fi

# --- / body carries SoftwareApplication JSON-LD + absolute canonical ---------
HOMEPAGE_BODY=$(curl -sS "$BASE_URL/" 2>/dev/null || echo "")
if echo "$HOMEPAGE_BODY" | grep -qF '"@type":"SoftwareApplication"'; then
  pass "/ body contains \"@type\":\"SoftwareApplication\""
else
  fail "/ body does not contain \"@type\":\"SoftwareApplication\""
fi
if echo "$HOMEPAGE_BODY" | grep -qF "$CANONICAL_HOST"; then
  pass "/ body contains canonical host $CANONICAL_HOST"
else
  fail "/ body does not contain canonical host $CANONICAL_HOST"
fi

# --- X-Robots-Tag posture ------------------------------------------------------
ROOT_HEADERS=$(curl -sSD - -o /dev/null "$BASE_URL/" 2>/dev/null || echo "")
ROBOTS_HEADER=$(echo "$ROOT_HEADERS" | { grep -i '^x-robots-tag:' || true; } | head -1 | tr -d '\r' | sed 's/^[Xx]-[Rr]obots-[Tt]ag: *//')
if [ "$EXPECT_NOINDEX" = "1" ]; then
  if [ -n "$ROBOTS_HEADER" ] && echo "$ROBOTS_HEADER" | grep -qi 'noindex'; then
    pass "X-Robots-Tag present and contains noindex (observed: $ROBOTS_HEADER)"
  else
    fail "X-Robots-Tag expected present and containing noindex, observed: '${ROBOTS_HEADER:-<absent>}'"
  fi
else
  if [ -z "$ROBOTS_HEADER" ]; then
    pass "X-Robots-Tag is absent (production default)"
  else
    fail "X-Robots-Tag expected absent, observed: '$ROBOTS_HEADER'"
  fi
fi

# --- Optional: analytics/speed-insights beacon routes -------------------------
if [ "$EXPECT_BEACONS" = "1" ]; then
  INSIGHTS_STATUS=$(http_status "$BASE_URL/_vercel/insights/script.js")
  if [ "$INSIGHTS_STATUS" = "200" ]; then
    pass "/_vercel/insights/script.js returns 200 (observed: $INSIGHTS_STATUS)"
  else
    fail "/_vercel/insights/script.js expected 200, observed: $INSIGHTS_STATUS"
  fi

  SPEED_STATUS=$(http_status "$BASE_URL/_vercel/speed-insights/script.js")
  if [ "$SPEED_STATUS" = "200" ]; then
    pass "/_vercel/speed-insights/script.js returns 200 (observed: $SPEED_STATUS)"
  else
    fail "/_vercel/speed-insights/script.js expected 200, observed: $SPEED_STATUS"
  fi
fi

echo ""
echo "▶ verify-deployment: $PASS_COUNT passed, $FAIL_COUNT failed"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi

exit 0

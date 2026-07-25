#!/usr/bin/env bun
// scripts/verify-analytics-beacon.ts
//
// Standalone Bun script (run via `bun run verify:beacon` / `bun scripts/verify-analytics-beacon.ts`)
// that loads the LIVE production domain in a real headless browser and confirms both Vercel
// analytics tracking scripts (Web Analytics + Speed Insights) are actually requested by the
// served page and both respond 200. Machine-verifies DEPL-04's "wired into the served page, not
// merely reachable by direct URL" truth.
//
// Deliberately NOT under tests/ — it reaches a real, deployed domain rather than a local dev
// server, so it would break scripts/test-gate.sh's self-contained local gate if it lived there.
// Mirrors scripts/generate-og-image.ts's launch/finally-close pattern: bundled Chromium via
// `@playwright/test`, never system Chrome, never the Playwright MCP server.
//
// IMPORTANT: Vercel serves both tracking scripts through a per-deployment, hashed FIRST-PARTY
// proxy path (e.g. `/fe2bcc7deb2d8284/script.js`), not the literal `/_vercel/insights/script.js`
// path — this is Vercel's built-in ad-blocker-resilience rewrite. The literal `/_vercel/...`
// route still exists and returns 200 (that's what scripts/verify-deployment.sh --expect-beacons
// checks directly), but a real page load never requests that literal path. This script instead
// identifies each script tag by its `data-sdkn` attribute (`@vercel/analytics/next` /
// `@vercel/speed-insights/next`), which both packages stamp onto their injected <script> element
// regardless of the proxy path, then cross-references the network response for that exact src to
// assert it returned 200.
//
// This script deliberately does NOT assert on the measurement beacon POST (the actual analytics
// event send). That POST is timing- and lifecycle-dependent — Speed Insights reports Core Web
// Vitals on page-hide, not on load — so asserting it here would produce a flaky gate. This script
// only asserts that both tracking *scripts* (script.js) are requested and load successfully,
// which is the deterministic, load-time-observable half of DEPL-04.

import { chromium } from '@playwright/test';

const DEFAULT_URL = 'https://overlay-notes.kalebnim.dev';
const targetUrl = process.argv[2] ?? DEFAULT_URL;

const TRACKED_SDKS = [
  { label: 'Web Analytics', sdkn: '@vercel/analytics/next' },
  { label: 'Speed Insights', sdkn: '@vercel/speed-insights/next' },
] as const;

const responseStatusBySrc = new Map<string, number>();

const browser = await chromium.launch();
let scriptTags: { src: string; sdkn: string | null }[] = [];
try {
  const page = await browser.newPage();

  page.on('response', (response) => {
    responseStatusBySrc.set(response.url(), response.status());
  });

  console.log(`▶ verify-analytics-beacon: loading ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle' });

  scriptTags = await page.evaluate(() =>
    Array.from(document.querySelectorAll('script[src]')).map((el) => ({
      src: (el as HTMLScriptElement).src,
      sdkn: el.getAttribute('data-sdkn'),
    })),
  );
} finally {
  // Always release Chromium, even if goto throws — no leaked browser process.
  await browser.close();
}

console.log('');
console.log('▶ Observed tracking-script requests:');

let failed = false;

for (const { label, sdkn } of TRACKED_SDKS) {
  const tag = scriptTags.find((s) => s.sdkn === sdkn);
  if (!tag) {
    console.error(`FAIL: no <script data-sdkn="${sdkn}"> found in the rendered page for ${label}`);
    failed = true;
    continue;
  }

  const status = responseStatusBySrc.get(tag.src);
  console.log(`  [${status ?? 'no response recorded'}] ${label}: ${tag.src}`);

  if (status !== 200) {
    console.error(`FAIL: ${label} script (${tag.src}) responded ${status ?? 'nothing'}, expected 200`);
    failed = true;
    continue;
  }

  console.log(`PASS: ${label} script requested and responded 200`);
}

if (failed) {
  console.error('');
  console.error('FAIL: verify-analytics-beacon — one or more tracking scripts missing or non-200');
  process.exit(1);
}

console.log('');
console.log('PASS: verify-analytics-beacon — both tracking scripts requested and responded 200');

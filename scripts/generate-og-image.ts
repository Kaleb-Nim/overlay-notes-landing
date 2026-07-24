#!/usr/bin/env bun
// scripts/generate-og-image.ts
//
// Standalone Bun script (run via `bun run generate:og` / `bun scripts/generate-og-image.ts`)
// that produces the committed public/og-image.png social card.
//
// Per 03-CONTEXT.md's locked OG generation decision: build ONE self-contained HTML string
// (fonts + hero screenshot inlined as base64 data: URIs, zero network fetch at render time),
// screenshot it at exactly 1200x630 with Playwright's bundled Chromium (never system Chrome,
// never the Playwright MCP server), and write the result to public/og-image.png.
//
// Layout/typography/color/spacing values below are copied verbatim from 03-UI-SPEC.md
// ("OG Social Card — Canvas & Layout" through "Copywriting Contract"). Re-running this
// script is idempotent — it always regenerates a visually identical PNG from the same
// committed inputs (two .ttf files + public/annotate-hero.png + the hardcoded copy below).
//
// Do NOT create app/opengraph-image.tsx / use next/og's ImageResponse — rejected in
// STACK.md and CONTEXT.md in favor of this static, pre-composited approach.

import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Inputs: base64-inline the two committed fonts + the source hero screenshot
// ---------------------------------------------------------------------------

const shantellBold = readFileSync(
  join(ROOT, 'scripts/og-image-assets/ShantellSans-700.ttf'),
).toString('base64');
const publicSansSemibold = readFileSync(
  join(ROOT, 'scripts/og-image-assets/PublicSans-600.ttf'),
).toString('base64');
const heroPng = readFileSync(join(ROOT, 'public/annotate-hero.png')).toString('base64');

// ---------------------------------------------------------------------------
// Crop math — 03-UI-SPEC.md "Recommended source crop" (a documented default,
// not a lock; adjust CROP_* below if visual QA in Task 3 finds a tighter frame).
// ---------------------------------------------------------------------------

const SOURCE_W = 1280;
const SOURCE_H = 800;

// Crop rectangle on the 1280x800 source (x:400,y:170,w:780,h:630 per UI-SPEC).
const CROP_X = 400;
const CROP_Y = 170;
const CROP_W = 780;
const CROP_H = 630;

// Mat inner photo render area (692x574): mat rect 708x590 (panel 740 wide minus
// 20px right/12px left inset) minus 8px padding on all sides — UI-SPEC "Right
// image panel" section.
const PHOTO_BOX_W = 692;
const PHOTO_BOX_H = 574;

// "Cover" scale — the larger of the two axis ratios — so the crop rect fully
// fills the photo box with no gaps (matches UI-SPEC's "negligible additional
// crop, no distortion" note for the near-matching aspect ratios).
const scale = Math.max(PHOTO_BOX_W / CROP_W, PHOTO_BOX_H / CROP_H);
const bgWidth = SOURCE_W * scale;
const bgHeight = SOURCE_H * scale;
const bgPosX = -(CROP_X * scale);
const bgPosY = -(CROP_Y * scale);

// ---------------------------------------------------------------------------
// HTML template — canvas + left text panel + right matted/cropped photo panel
// ---------------------------------------------------------------------------

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: 'Shantell Sans';
    font-weight: 700;
    src: url(data:font/ttf;base64,${shantellBold}) format('truetype');
  }
  @font-face {
    font-family: 'Public Sans';
    font-weight: 600;
    src: url(data:font/ttf;base64,${publicSansSemibold}) format('truetype');
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  html, body {
    width: 1200px;
    height: 630px;
  }

  body {
    background:
      repeating-linear-gradient(#f6f1e7 0 31px, rgba(91, 61, 245, 0.10) 31px 32px),
      linear-gradient(#f6f1e7, #f6f1e7);
  }

  .card {
    width: 1200px;
    height: 630px;
    display: flex;
    overflow: hidden;
  }

  /* Left text panel: x 0-460, full height */
  .text-panel {
    width: 460px;
    height: 630px;
    padding: 56px 32px 56px 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
  }

  .stack {
    max-width: 340px;
  }

  .headline {
    font-family: 'Shantell Sans', cursive;
    font-weight: 700;
    font-size: 44px;
    line-height: 1.05;
    color: #1c1830;
    margin-bottom: 24px;
  }

  .headline .accent {
    color: #5b3df5;
  }

  .wordmark {
    font-family: 'Shantell Sans', cursive;
    font-weight: 700;
    font-size: 22px;
    line-height: 1.0;
    color: #211d2e;
    margin-bottom: 16px;
  }

  .wordmark .accent {
    color: #5b3df5;
  }

  .tagline {
    font-family: 'Public Sans', sans-serif;
    font-weight: 600;
    font-size: 18px;
    line-height: 1.4;
    color: #4a4560;
  }

  /* Right image panel: x 460-1200, full height */
  .image-panel {
    position: relative;
    width: 740px;
    height: 630px;
  }

  .mat {
    position: absolute;
    top: 20px;
    right: 20px;
    bottom: 20px;
    left: 12px;
    background: #ffffff;
    border-radius: 6px;
    box-shadow: 0 16px 30px -12px rgba(20, 12, 60, 0.45);
    padding: 8px;
  }

  .photo {
    width: 100%;
    height: 100%;
    border-radius: 3px;
    background-image: url(data:image/png;base64,${heroPng});
    background-repeat: no-repeat;
    background-size: ${bgWidth}px ${bgHeight}px;
    background-position: ${bgPosX}px ${bgPosY}px;
  }
</style>
</head>
<body>
  <div class="card">
    <div class="text-panel">
      <div class="stack">
        <div class="headline">Draw &amp; <span class="accent">annotate</span> notes on any webpage</div>
        <div class="wordmark"><span class="accent">&#9656;</span> Overlay Notes</div>
        <div class="tagline">Free Chrome extension &#9749;</div>
      </div>
    </div>
    <div class="image-panel">
      <div class="mat">
        <div class="photo"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Render + screenshot
// ---------------------------------------------------------------------------

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: 'load' });
  // Wait for the embedded (base64) webfonts to finish parsing before capturing, so the
  // screenshot is deterministic and never falls back to a system font mid-render.
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(ROOT, 'public/og-image.png') });
} finally {
  // Always release Chromium, even if setContent/screenshot throws — no leaked browser.
  await browser.close();
}

console.log('PASS: scripts/generate-og-image.ts wrote public/og-image.png (1200x630)');

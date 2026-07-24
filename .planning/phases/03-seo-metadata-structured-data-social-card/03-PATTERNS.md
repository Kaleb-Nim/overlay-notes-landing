# Phase 3: SEO Metadata, Structured Data & Social Card - Pattern Map

**Mapped:** 2026-07-24
**Files analyzed:** 7 (1 modify, 5 create, 1 extend)
**Analogs found:** 4 / 7 (3 have no in-repo analog — new Next.js file conventions / standalone script)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|-----------------|---------------|
| `app/layout.tsx` (modify) | config/provider (Metadata export + JSON-LD) | request-response (static, build-time) | itself (existing file, extend in place) | exact |
| `app/robots.ts` (create) | route (Next.js file convention) | request-response | none in-repo | no analog — framework convention |
| `app/sitemap.ts` (create) | route (Next.js file convention) | request-response | none in-repo | no analog — framework convention |
| `next.config.ts` (create) | config | request-response (HTTP headers) | none in-repo (no `next.config.ts` exists yet) | no analog — framework convention |
| `scripts/generate-og-image.ts` (create, name at Claude's discretion) | utility / batch script | file-I/O (render HTML → screenshot PNG) | `scripts/verify-claims.ts` | role-match (Bun script under `scripts/`, no page/route to copy) |
| OG HTML template (create, e.g. `scripts/og-template.html` or inline string) | component (standalone, non-React) | transform (data → static HTML → image) | `app/globals.css` + `app/page.tsx` `.shot .frame` markup | partial (design-token/markup source only, not a structural analog) |
| `tests/seo.spec.ts` (extend) | test | request-response | itself (already self-skipping, flip to asserting) | exact |

## Pattern Assignments

### `app/layout.tsx` (modify — metadata export + JSON-LD script)

**Analog:** itself, `/Users/kalebnim/Documents/GitHub/overlay-notes-landing/app/layout.tsx` (current state, lines 1-41)

**Current imports** (lines 1-5):
```typescript
import type { Metadata } from 'next';
import { Shantell_Sans, Public_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
```
Add `import { siteConfig } from '@/lib/site-config';` alongside these — matches the `@/` path-alias convention already used in `app/page.tsx` (`import { faqs } from '@/lib/content';`, line 20).

**Current minimal metadata export to extend** (lines 23-25):
```typescript
export const metadata: Metadata = {
  title: 'Overlay Notes',
};
```
Expand in place to a full `Metadata` object: `metadataBase: new URL(siteConfig.baseUrl)`, `title`, `description`, `alternates.canonical: '/'`, `openGraph: {...}`, `twitter: {...}`. All copy strings are locked verbatim in `03-CONTEXT.md` decisions — do not paraphrase.

**JSON-LD placement pattern** — no existing analog for a `<script type="application/ld+json">` block in this repo. Per project `CLAUDE.md` (`## What NOT to Use` table), it must be a **native** script tag with `dangerouslySetInnerHTML`, not `next/script`:
```typescript
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```
Place inside `<head>` implicitly via Next's App Router metadata injection point — since `RootLayout` here renders `<html><body>`, the JSON-LD script should be placed as the first child of `<body>` (Next 13+ App Router convention: scripts placed in the layout body are still hoisted correctly and this avoids touching the `<html>`/`<head>` structure Next manages itself). Build the `jsonLd` object as a typed `const` above the component (mirrors `WEBSTORE_URL`/`REPO_URL` module-level consts pattern already used in `app/page.tsx` lines 22-27) or inline in `layout.tsx` near the metadata export — Claude's Discretion per CONTEXT.md ("JSON-LD field ordering; minor metadata object structure").

**RootLayout structure to preserve** (lines 27-41): keep `<html lang="en" className={...}>`, keep `<Analytics/>`/`<SpeedInsights/>` inside `<body>` unchanged; insert the JSON-LD `<script>` alongside `{children}`.

---

### `app/robots.ts` (create)

**No in-repo analog** — this is a first instance of the Next.js file-convention route (`MetadataRoute.Robots`). CONTEXT.md and project `CLAUDE.md`'s STACK.md section already specify the exact shape to use (no need to invent structure):
```typescript
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteConfig.baseUrl}/sitemap.xml`,
  };
}
```
Reuse `siteConfig.baseUrl` (same single-source-of-truth pattern as `lib/site-config.ts` documents at its top: "Every absolute-URL consumer... derives from this constant").

---

### `app/sitemap.ts` (create)

**No in-repo analog** — same situation as `robots.ts`. Shape locked in CONTEXT.md:
```typescript
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.baseUrl,
      lastModified: new Date(),
    },
  ];
}
```
No `changeFrequency`/`priority` fields (CONTEXT.md: "Google ignores them"). `lastModified` source is Claude's Discretion (CONTEXT.md) — build-time `new Date()` is the simplest deterministic-enough choice since the file is regenerated at every build.

---

### `next.config.ts` (create)

**No in-repo analog** — no `next.config.ts`/`.js`/`.mjs` currently exists in this repo (confirmed absent). This is a first instance of the Next.js `headers()` async config convention. Structure per Next.js docs (Context7-verified pattern, standard shape) and CONTEXT.md's exact gate condition:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.VERCEL_ENV === 'production') {
      return [];
    }
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
```
No project file to copy the `headers()` shape from — this is new framework surface. Keep it minimal; do not add unrelated headers (CSP, etc.) — out of this phase's scope.

---

### OG generation script (create — role: utility/batch, e.g. `scripts/generate-og-image.ts`)

**Analog:** `/Users/kalebnim/Documents/GitHub/overlay-notes-landing/scripts/verify-claims.ts` (role-match only — same `scripts/` location, same "Bun script, no framework wiring" idiom; read it directly before writing to confirm its exact shebang/import style, since it wasn't in the required-reading set but is the only sibling script in the repo).

**No true analog exists for "render HTML + screenshot via Playwright bundled Chromium and write a PNG to `public/`"** — this repo has no prior image-generation script. Key constraints to encode, all locked in CONTEXT.md + `03-UI-SPEC.md`:
- Must use Playwright's **bundled Chromium only** (never system Chrome, never the MCP server) — per global CLAUDE.md rule and project CLAUDE.md's Testing section ("Browsers: bunx playwright with bundled Chromium only").
- Import pattern to use: `import { chromium } from 'playwright'` (per global CLAUDE.md Browser Automation section — SDK import, not CLI invocation, for a committed reproducible script).
- Output: `public/og-image.png`, exactly 1200×630 (set `page.setViewportSize({ width: 1200, height: 630 })` and screenshot the full viewport, no `fullPage`).
- Self-contained HTML string or a sibling template file — must self-embed fonts (base64 `@font-face` or local file `file://` reference to the same font files `next/font/google` would otherwise fetch) so there is zero network dependency at render time (UI-SPEC: "no FOUT / no network at shot time").
- Crop source: `public/annotate-hero.png` at rect `x:400, y:170, w:780, h:630` (UI-SPEC recommended default) — draw as a CSS `background-position`/`object-fit` crop or pre-crop with an `<img>` + `overflow:hidden` container matching the mat dimensions in UI-SPEC.
- Script should be idempotent/reproducible: running it twice produces byte-stable (or at least visually identical) output — CONTEXT.md: "The generation script is committed and reproducible."

**Package.json scripts precedent** (lines 6-11 of `package.json`):
```json
"verify:claims": "bun scripts/verify-claims.ts"
```
Follow the same convention: add e.g. `"generate:og": "bun scripts/generate-og-image.ts"` to `package.json` scripts — matches existing naming style (`verb:noun`).

---

### OG HTML template (create — embedded in or alongside the generation script)

**Analog for design tokens/markup (not structure):** `app/globals.css` root tokens (lines 8-10) and `.shot .frame` idiom (lines 59-60):
```css
:root{
  --paper:#f6f1e7; --rule:rgba(91,61,245,.10);
  --purple:#5b3df5; --purple-dark:#3f27c9; --ink:#211d2e; --head:#1c1830;
  --body:#4a4560;
}
body{margin:0;color:var(--body);
  background:
    repeating-linear-gradient(var(--paper) 0 31px, var(--rule) 31px 32px),
    linear-gradient(var(--paper),var(--paper));}
```
```css
.shot .frame{transform:rotate(2deg);background:#fff;padding:8px;border-radius:6px;box-shadow:0 16px 30px -12px rgba(20,12,60,.45)}
.shot .frame img{border-radius:3px}
```
`03-UI-SPEC.md` already directs: reuse the paper-gradient background verbatim, reuse the white-mat/padding/radius/shadow idiom **unrotated and undecorated** (do not port `.tape`/`.note-r`/`.arrow`/`.note-b` — UI-SPEC explicitly calls this out as a deliberate deviation, lines 71-77 of `03-UI-SPEC.md`).

**Headline accent-span pattern** — `app/globals.css` line 44 `.hero h1 span{color:var(--purple)}` mirrored in `app/page.tsx` lines 56-58 (`<h1>Draw &amp; annotate notes on <span>any webpage</span></h1>`). The OG template should reproduce the same idiom but wrap the word "annotate" (not "any webpage") per UI-SPEC's locked copy — `<span style="color:#5b3df5">annotate</span>` inline (the template is standalone HTML, not React, so use inline `style` or an embedded `<style>` block rather than the project's external CSS file).

**Typography source** — `app/globals.css` font shorthand conventions, e.g. line 43 `font:700 clamp(38px,5vw,54px)/.98 var(--font-shantell), cursive;` — for the OG template, replace `var(--font-shantell)`/`var(--font-public)` CSS-variable font-family references (which depend on `next/font`'s injected `--font-shantell`/`--font-public` variables, unavailable outside the Next.js app) with directly embedded `@font-face` declarations pointing at local Shantell Sans / Public Sans font files, using the literal font-family names as fallback stack, per UI-SPEC's Typography table (44px/700/1.05 headline, 22px/700 wordmark, 18px/600/1.4 tagline).

---

### `tests/seo.spec.ts` (extend, already read in full — no analog needed, self-referential)

Current file already has the full self-skipping test suite (title length, description length, html lang, canonical/og:image absolute-URL check, no stale `kaleb-nim.github.io` in `<head>`, JSON-LD SoftwareApplication presence + no aggregateRating/review, robots.txt 200 + sitemap reference, sitemap.xml 200). Phase 3 work here is to **remove the `test.skip(...)` guard conditions** (they become dead once the feature exists — the guards themselves don't need deleting since they'll simply never trigger, but CONTEXT.md/TESTING.md say to "confirm none of these silently skip"). Extend by ADDING (not replacing) assertions per CONTEXT.md's explicit test list:
- og:description distinct from meta description (assert both exist and differ)
- twitter:card = summary_large_image present, twitter:site/creator absent
- og-image dimensions exactly 1200×630 (read `public/og-image.png` via Bun/`sharp`-free approach — e.g. parse PNG IHDR bytes, or use Playwright's `page.locator('meta[property="og:image:width"]')`/`og:image:height` meta tags cross-checked against the actual file, since project has no image-processing lib installed)
- `X-Robots-Tag` header behavior is env-gated — this cannot be asserted in a single-environment local test run in the same way; note in the spec as a comment if skipped for local dev (VERCEL_ENV unset locally is the "non-production" branch, so the header SHOULD be present locally — assert its presence in dev, matching `next.config.ts`'s gate condition, which is a legitimate always-true local assertion, not a defect).

Never weaken the existing locked assertions (canonical regex, JSON-LD no-aggregateRating/no-review, no stale domain, no FAQPage) — per TESTING.md rule already encoded in project `CLAUDE.md`.

---

## Shared Patterns

### Absolute URL construction
**Source:** `lib/site-config.ts` (full file, 10 lines)
**Apply to:** `app/layout.tsx` (metadataBase, og:url, og:image, JSON-LD url/image), `app/robots.ts` (sitemap pointer), `app/sitemap.ts` (homepage url), OG script (if it needs to embed the final absolute image URL anywhere — it does not, since it just writes a file, but `og:image` meta path resolves via `metadataBase` in layout.tsx per project CLAUDE.md's Metadata API note).
```typescript
export const siteConfig = {
  baseUrl: 'https://overlay-notes.kalebnim.dev',
} as const;
```
Never hardcode the domain elsewhere; never emit `kaleb-nim.github.io` outside the intentional footer Privacy link in `app/page.tsx` (line 26, `PRIVACY_URL` — that one stays, it points at the *old* GitHub Pages privacy policy deliberately, per CONTEXT.md's Out of Scope note).

### Path-alias imports
**Source:** `app/page.tsx` line 20 (`import { faqs } from '@/lib/content';`)
**Apply to:** all new files importing from `lib/` — use `@/lib/site-config` not relative `../lib/site-config`.

### `@/font-family` CSS custom property idiom (page vs. OG template divergence)
**Source:** `app/globals.css` lines 34-118 (repeated `var(--font-shantell)`/`var(--font-public)` font shorthand pattern)
**Apply to:** OG template must NOT reuse these CSS variables directly (they're injected by `next/font` only inside the Next.js-rendered app) — instead embed literal `@font-face` + hardcoded font-family names, but keep every other token (`--paper`, `--purple`, `--ink`, `--head`, `--body`, `--rule`) copied verbatim as hex/rgba literals since those don't depend on the Next.js runtime.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `app/robots.ts` | route | request-response | First use of this Next.js file convention in the repo; shape is fully specified by CONTEXT.md + Next.js docs, no in-repo precedent needed. |
| `app/sitemap.ts` | route | request-response | Same as above — first use of the convention. |
| `next.config.ts` | config | request-response (headers) | No `next.config.*` file currently exists in the repo at all; this phase creates the first one. |
| OG HTML template | component (standalone HTML) | transform | No prior static-HTML-to-image generation exists in this repo; closest available material is CSS tokens/markup idioms in `app/globals.css`/`app/page.tsx`, used as a source of values, not a structural analog. |

## Metadata

**Analog search scope:** `app/`, `lib/`, `scripts/`, `tests/`, `app/globals.css`, `package.json`
**Files scanned:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `lib/site-config.ts`, `lib/content.ts`, `tests/seo.spec.ts`, `scripts/test-gate.sh`, `scripts/verify-claims.ts` (listed, not fully read — role-match only), `package.json`
**Pattern extraction date:** 2026-07-24
</content>

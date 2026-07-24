# Phase 3: SEO Metadata, Structured Data & Social Card - Research

**Researched:** 2026-07-24
**Domain:** Next.js 16 App Router Metadata API, JSON-LD structured data, file-convention robots/sitemap, env-gated response headers, and Playwright-driven static OG image generation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**SEO Metadata (locked — SEO brief §6 + STACK.md, URLs rewritten to new domain)**
- `<title>`: `Draw & Annotate Notes on Any Webpage — Overlay Notes` (52 chars, keyword-first, brand last) — SEO-01.
- Meta description (158 chars, names price "free" + platform "Chrome"): `Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to the content and save per page, 100% local.` — SEO-02.
- Implemented via the Next.js **Metadata API** `metadata` export in `app/layout.tsx` (static — no `generateMetadata` needed; page reads no request data).
- `metadataBase: new URL(siteConfig.baseUrl)` so relative asset/canonical paths resolve to absolute `overlay-notes.kalebnim.dev` URLs at build time (FOUND-02 — one-line domain edit).
- `alternates.canonical: '/'` → self-referencing canonical at the new domain — SEO-03. **Never** emit `kaleb-nim.github.io` (the brief predates the domain migration; ignore its URLs).
- `<html lang="en">` — already set in `layout.tsx` — SEO-09.
- **Open Graph:** `og:type=website`, `og:url` (canonical), `og:title` (= `<title>`), `og:description` (distinct punchier copy, below), `og:image` (absolute, 1200×630, explicit `og:image:width`/`height`), `og:image:alt` — SEO-04.
- Distinct `og:description` (SEO brief §6, Claude's-discretion default the user accepted): `A free Chrome extension that puts an Excalidraw-style sketch canvas on any website. Handwrite notes over what you're reading — they scroll with the page and save locally.`
- **Twitter:** `twitter:card = summary_large_image`; **no** `twitter:site`/`twitter:creator` (user: no handle). Card still renders fully.
- `<meta name="keywords">`: **omitted** (Google ignores it — Claude's-discretion default accepted).

**Structured Data (locked)**
- `SoftwareApplication` JSON-LD **only** — SEO-05. Fields: `@context` schema.org, `@type` SoftwareApplication, `name` "Overlay Notes", `applicationCategory` "BrowserApplication", `operatingSystem` "Chrome", `description` (= meta description), `url` (baseUrl), `image` (absolute og-image URL), `offers` `{ @type: Offer, price: "0", priceCurrency: "USD" }`.
- Rendered as a **native** `<script type="application/ld+json">` via `dangerouslySetInnerHTML` in `app/layout.tsx` — NOT `next/script` (per project CLAUDE.md: structured data is inert JSON, not a script to schedule).
- **No** `FAQPage` (Google removed FAQ rich results 2026-05-07). **No** `aggregateRating`/`review` (no real ratings — fabrication is a policy violation).
- Must pass Google's Rich Results Test with zero errors.

**Robots & Sitemap (locked — file conventions per STACK.md)**
- `app/robots.ts` → `MetadataRoute.Robots`: `userAgent: '*'`, `allow: '/'`, `sitemap: ${baseUrl}/sitemap.xml`. **Always allow-all** — preview protection lives in the header (below), not here — SEO-06.
- `app/sitemap.ts` → `MetadataRoute.Sitemap`: single homepage entry at `${baseUrl}` (the canonical) with `lastModified`. No `changeFrequency`/`priority` (Google ignores them) — SEO-07.
- Both must serve 200 at `/robots.txt` and `/sitemap.xml`.

**Preview De-indexing (SEO-08) — USER CHOSE: X-Robots-Tag header**
- `next.config.ts` async `headers()` returns `X-Robots-Tag: noindex, nofollow` for all routes **when `process.env.VERCEL_ENV !== 'production'`** (preview + development builds). Production builds (`VERCEL_ENV === 'production'`) emit no such header → live site fully indexable.
- `VERCEL_ENV` is set at build time per environment, and Vercel builds each environment separately, so the gate is correct per-deployment.
- `robots.ts` stays allow-all regardless; this header is the gate, layered under Vercel's own automatic preview `noindex` as defense-in-depth.

**OG Social Card — USER CHOSE: HTML template + Playwright shot, "Screenshot + text panel"**
- **Generation:** author an HTML template that reuses the brand aesthetic (paper background, ink text, purple accent, Shantell Sans headline, hard-offset shadow), render it and screenshot at **exactly 1200×630** using the **already-installed bundled Chromium** via Playwright (CLI/SDK — per global rule: bundled Chromium only, never system Chrome, never the Playwright MCP server). Output committed as static `public/og-image.png` — ASSET-01.
- **Composition (user pick):** left paper-textured **text panel** — headline "Draw & annotate notes on any webpage", ▸ Overlay Notes wordmark, "Free Chrome extension ☕" — and on the right a **cropped frame of `public/annotate-hero.png`** (1280×800) showing marker marks over real page text.
- Embed/self-host the fonts in the template so the screenshot is deterministic (no FOUT / no network at shot time).
- The generation script is committed and reproducible (regenerates the identical 1200×630 PNG).
- `og:image:alt`: descriptive + keyword-natural, never "screenshot" (ASSET-03 discipline), e.g. "Handwritten marker notes and arrows drawn over a webpage — Overlay Notes, a free Chrome extension".
- Verification of ASSET-02 (LinkedIn Post Inspector render) requires the live URL, so it defers to Phase 4 deploy; Phase 3 verifies the file exists at exactly 1200×630 and the tags reference it absolutely.

### Claude's Discretion
- Exact OG template markup, the crop rectangle of `annotate-hero.png`, and the OG script's location/tooling (a Bun script driving the Playwright SDK vs a one-off `playwright` invocation) — must output the committed 1200×630 PNG deterministically.
- `sitemap.ts` `lastModified` source (build timestamp).
- JSON-LD field ordering; minor metadata object structure.

### Deferred Ideas (OUT OF SCOPE)
- `FAQPage` JSON-LD — permanently out of scope (Google removed FAQ rich results 2026-05-07); FAQ stays visible-text-only from `lib/content.ts`.
- `aggregateRating` / `review` structured data — deferred to v2 (V2-08) once real Chrome Web Store ratings exist.
- LinkedIn Post Inspector live render check (ASSET-02) — needs the deployed URL; executed in Phase 4.
- Old GitHub Pages privacy-policy migration + Chrome Web Store Developer Dashboard URL update — concerns the *old* github.io property, not this standalone site. Out of scope.
- Deployment, custom-domain attachment, analytics/Speed-Insights production verification — Phase 4.

**IMPORTANT — supersedes earlier draft research:** `.planning/research/ARCHITECTURE.md`'s system diagram and build order describe `app/opengraph-image.tsx` using `next/og`'s `ImageResponse`, and its JSON-LD example includes a `FAQPage` block. Both are **stale drafts, superseded by CONTEXT.md** (the user-approved lock). This phase does **not** create `app/opengraph-image.tsx` and does **not** ship `FAQPage` JSON-LD. Follow CONTEXT.md and this document, not the earlier architecture draft, for these two items.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEO-01 | `<title>` is keyword-first and ≤60 characters | Exact metadata object shape below; title string is 52 chars, locked verbatim in CONTEXT.md |
| SEO-02 | Meta description is ≤160 characters and names the price and platform | Exact metadata object shape below; description string is 158 chars, locked verbatim |
| SEO-03 | A self-referencing canonical points at the new domain, never at `kaleb-nim.github.io` | `metadataBase` + `alternates.canonical: '/'` pattern (Context7-verified); pitfall section covers the stale-domain grep check |
| SEO-04 | Open Graph and Twitter card tags present, `og:image` absolute with explicit width/height | `openGraph.images[]` object shape (`url`/`width`/`height`/`alt`) verified via Context7; `metadataBase` resolves relative `/og-image.png` to absolute |
| SEO-05 | `SoftwareApplication` JSON-LD present, passes Rich Results Test, no `aggregateRating`/`review` | Native `<script type="application/ld+json">` pattern verified via Context7 (Next.js's own JSON-LD guide); exact field set locked in CONTEXT.md |
| SEO-06 | `robots.txt` returns 200, allows crawling, points at sitemap | `app/robots.ts` → `MetadataRoute.Robots` file convention, verified via Context7 |
| SEO-07 | `sitemap.xml` returns 200, lists canonical URL | `app/sitemap.ts` → `MetadataRoute.Sitemap` file convention, verified via Context7 |
| SEO-08 | Preview deployments excluded from search indexing | `next.config.ts` async `headers()` + `VERCEL_ENV` gate; Common Pitfalls covers the System Environment Variables toggle risk and local-test asymmetry |
| SEO-09 | `<html lang="en">` is set | Already present in `app/layout.tsx` — no change needed, test asserts it directly |
| ASSET-01 | 1200×630 OG image exists, compositing screenshot + product name + value prop | Playwright `setViewportSize`/`screenshot` pattern (Context7-verified) + UI-SPEC's locked layout/crop numbers |
| ASSET-02 | OG image renders correctly in LinkedIn's Post Inspector | Deferred to Phase 4 (needs live URL) — Phase 3 only verifies file exists at exact dimensions and tags are absolute |
</phase_requirements>

## Summary

This phase is almost entirely a "how," not a "what" — every value, field, and file location is already locked in CONTEXT.md, the SEO brief, and STACK.md/ARCHITECTURE.md. The one place those earlier docs disagree with the locked decision is OG image generation: STACK.md rejected `next/og`'s `ImageResponse` in favor of *some* static-generation script, and the user's `/gsd-discuss-phase` session then specifically chose the **Playwright-screenshot-of-an-HTML-template** approach over STACK.md's originally-suggested `sharp`/`satori` script. This document treats that Playwright choice as final and provides the concrete implementation pattern for it, since neither STACK.md nor ARCHITECTURE.md covers it.

Everything else is a direct, verified port of current Next.js 16 file conventions: a `metadata` object with `metadataBase` in `app/layout.tsx` (confirmed against Next.js's own `generateMetadata` docs via Context7), a native `<script type="application/ld+json">` for the `SoftwareApplication` block (confirmed against Next.js's own JSON-LD guide, which explicitly rules out `next/script` for this), `app/robots.ts`/`app/sitemap.ts` typed via `MetadataRoute` (confirmed against Next.js's file-convention docs), and `next.config.ts`'s `headers()` for the env-gated `X-Robots-Tag`. All four are stable, unchanged APIs across recent Next.js majors — no new syntax risk here.

The two things worth real attention during planning: (1) `VERCEL_ENV`'s availability depends on a project-level "Automatically expose System Environment Variables" toggle in Vercel's dashboard — if that toggle is off, `process.env.VERCEL_ENV` is `undefined` at build time, and `undefined !== 'production'` is `true`, which means the noindex header would incorrectly leak onto the **production** deployment too. This must be explicitly checked in Phase 4, and Phase 3's own local verification of SEO-08 needs an explicit `VERCEL_ENV=production` env override since the variable is never set outside Vercel's build platform. (2) The OG image generation script must self-host its two font files (not `next/font`, which only works inside a Next.js build) and inline the hero screenshot as base64, so the Playwright screenshot has zero network dependency and is byte-for-byte reproducible on every run.

**Primary recommendation:** Extend `app/layout.tsx`'s existing `metadata` export with the locked SEO brief values (deriving every URL from `siteConfig.baseUrl`), add a single native `<script type="application/ld+json">` for `SoftwareApplication` only, add `app/robots.ts`/`app/sitemap.ts` as typed file-convention routes, gate `next.config.ts`'s `headers()` on `process.env.VERCEL_ENV !== 'production'`, and generate `public/og-image.png` via a standalone `scripts/generate-og-image.ts` that uses `@playwright/test`'s already-installed `chromium` export to screenshot a self-contained (fonts + hero image inlined as base64) HTML string at an exact 1200×630 viewport.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `<head>` metadata (title/description/canonical/OG/Twitter) | Frontend Server (SSR, build-time) | CDN / Static | Next.js's Metadata API renders these tags into the prerendered HTML at build time; Vercel then serves the static output from its CDN with no per-request compute |
| `SoftwareApplication` JSON-LD | Frontend Server (SSR, build-time) | — | Rendered as a static `<script>` tag in the same build-time HTML output as the rest of `app/layout.tsx` — no runtime data, no client JS |
| `robots.txt` / `sitemap.xml` | Frontend Server (SSR, build-time) | CDN / Static | File-convention routes (`app/robots.ts`/`app/sitemap.ts`) are statically prerendered with no dynamic params, served identically to any other static asset |
| Preview `X-Robots-Tag: noindex` header | CDN / Static (Vercel edge routing layer) | Frontend Server (SSR, build-time config) | The header itself is injected by Vercel's routing/edge layer per Next.js's `next.config.ts` `headers()` manifest; the *decision* of which env gets the header is baked in at build time when `next.config.ts` is evaluated |
| OG image (`public/og-image.png`) | CDN / Static | — | A committed static file, generated once by a dev-time script (not part of any runtime tier) and served identically to `annotate-hero.png`/`icon.png` |

## Standard Stack

### Core

No new runtime dependencies. Every API this phase needs is already installed and pinned.

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.11` (installed, confirmed via `package.json`) | Metadata API, `MetadataRoute.Robots`/`MetadataRoute.Sitemap`, `next.config.ts` `headers()` | Already the project's pinned Next.js version (Phase 1); all four APIs used in this phase are stable, unchanged since Next.js 13/14 and re-confirmed current in Next.js 16's own docs via Context7 |
| `@playwright/test` | `^1.61.1` (installed, confirmed via `package.json` + `bunx playwright --version` → `Version 1.61.1`) | Screenshot the OG-card HTML template at exactly 1200×630 using bundled Chromium | Already the project's E2E test dependency (Phase 2); `@playwright/test`'s package re-exports the full `playwright/test` API surface, including the `chromium` browser-launcher singleton (`import { chromium } from '@playwright/test'` confirmed working via a direct `require()` check against the installed package — `'chromium' in exports` → `true`), so **no new package is needed** for the OG generation script |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| none | — | — | This phase adds zero new npm/bun dependencies. `next`, `@playwright/test`, and Node's built-in `fs`/`path` cover every need (metadata objects, JSON-LD, robots/sitemap, header config, and the OG screenshot script). |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright SDK script for the OG image | `next/og`'s `ImageResponse` in `app/opengraph-image.tsx` | Rejected in STACK.md (500KB Satori bundle budget vs. a 278KB source screenshot + custom fonts; no CSS Grid; harder precise photographic cropping) and explicitly overridden by the user's own choice in CONTEXT.md — do not build this route |
| Playwright SDK script | Standalone `sharp`/`satori`+`@resvg/resvg-js` script (STACK.md's original suggestion before the discuss-phase session) | The user's locked decision (CONTEXT.md) specifically picked "HTML template + Playwright shot" over this — Playwright is already installed for E2E tests, so reusing it avoids adding `sharp` as a new dependency entirely |
| `@playwright/test`'s re-exported `chromium` | A separate `playwright` (non-`@playwright/test`) package import | Both resolve to the same installed `playwright` package in `node_modules` (confirmed: `@playwright/test`'s `index.d.ts` does `export * from 'playwright/test'`, and the standalone `playwright` package is already present as a transitive/hoisted dependency) — importing from `@playwright/test` is simplest since it's the package already in `package.json` |

**Installation:**
```bash
# No installation needed — next, @playwright/test, and bundled Chromium
# (chromium-1228) are already installed from Phase 1/Phase 2.
bunx playwright --version   # confirms: Version 1.61.1
```

**Version verification:** confirmed directly against the installed project (not training-data guesses):
```
$ npm view next version          →  16.2.11 (matches package.json pin)
$ npm view playwright version    →  1.61.1  (matches @playwright/test pin)
$ npm view @playwright/test version → 1.61.1
$ bunx playwright --version      →  Version 1.61.1
```
Chromium binary confirmed present at `~/Library/Caches/ms-playwright/chromium-1228` (bundled build matching Playwright 1.61.1) — no `bunx playwright install chromium` re-run needed.

## Package Legitimacy Audit

> Not applicable — this phase installs **zero new packages**. `next`, `react`, `react-dom`, `@playwright/test`, `@vercel/analytics`, and `@vercel/speed-insights` were all already vetted and installed in Phase 1/Phase 2. No `npm install`/`bun add` step exists in this phase's task list.

**Packages removed due to [SLOP] verdict:** none — no new packages evaluated.
**Packages flagged as suspicious [SUS]:** none — no new packages evaluated.

## Architecture Patterns

### System Architecture Diagram

```
Build time (bun run build / next build):
┌─────────────────────────────────────────────────────────────────┐
│ lib/site-config.ts                                                │
│   siteConfig.baseUrl = 'https://overlay-notes.kalebnim.dev'       │
└───────────────┬─────────────────────┬──────────────┬──────────────┘
                │                     │              │
                ▼                     ▼              ▼
   ┌─────────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
   │ app/layout.tsx        │  │ app/robots.ts     │  │ app/sitemap.ts        │
   │ export const metadata │  │ MetadataRoute.     │  │ MetadataRoute.        │
   │  = { metadataBase,    │  │  Robots            │  │  Sitemap              │
   │      title, desc,     │  │ userAgent:'*',     │  │ [{url: baseUrl,       │
   │      alternates,      │  │ allow:'/',         │  │   lastModified}]      │
   │      openGraph,       │  │ sitemap: baseUrl+  │  └──────────────────────┘
   │      twitter }        │  │  '/sitemap.xml'    │
   │ + <script type=       │  └──────────────────┘
   │   "application/ld+    │
   │   json"> (Software-   │
   │   Application only)   │
   └───────────┬────────────┘
                │
                ▼
   Next.js prerenders one static route → HTML with <head> tags +
   inline JSON-LD script + /robots.txt + /sitemap.xml, all served
   from Vercel's CDN with zero per-request compute.

┌─────────────────────────────────────────────────────────────────┐
│ next.config.ts                                                    │
│   async headers() {                                               │
│     if (process.env.VERCEL_ENV === 'production') return [];       │
│     return [{ source: '/:path*',                                  │
│               headers: [{ key: 'X-Robots-Tag',                    │
│                            value: 'noindex, nofollow' }] }];       │
│   }                                                                │
└─────────────────────────────────────────────────────────────────┘
   Evaluated once when `next build` runs → baked into the per-       
   deployment routes manifest → Vercel's edge applies the header     
   (or doesn't) to every response for that specific deployment.      

Dev-time, one-off (not part of `next build`):
┌─────────────────────────────────────────────────────────────────┐
│ scripts/generate-og-image.ts (run manually: `bun scripts/         │
│  generate-og-image.ts`)                                           │
│                                                                     │
│  1. Read + base64-encode: two font files (Shantell Sans 700,      │
│     Public Sans 600) + public/annotate-hero.png                   │
│  2. Build one self-contained HTML string (@font-face data: URIs,  │
│     img background-image data: URI, inline <style>)               │
│  3. chromium.launch() → page.setViewportSize({1200,630})          │
│  4. page.setContent(html) → page.screenshot({path:                │
│     'public/og-image.png'})  (Playwright auto-waits for fonts)    │
│  5. browser.close()                                                │
└─────────────────────────────────────────────────────────────────┘
   Output: public/og-image.png (committed to git like any other      
   static asset in public/). Re-run this script whenever the         
   template or hero screenshot changes — it is not part of `next     
   build` and does not run in CI/Vercel.
```

### Recommended Project Structure

```
app/
├── layout.tsx              # extend: metadata export + JSON-LD <script>
├── robots.ts                # NEW — MetadataRoute.Robots
└── sitemap.ts                # NEW — MetadataRoute.Sitemap

next.config.ts               # extend: async headers() for env-gated noindex

scripts/
├── test-gate.sh              # existing — unchanged
├── verify-claims.ts          # existing — unchanged
└── generate-og-image.ts      # NEW — standalone Bun script, Playwright SDK,
                                #       no external deps beyond @playwright/test

scripts/og-image-assets/       # NEW — committed source assets the script reads
├── ShantellSans-700.ttf       #   downloaded once from Google Fonts CDN (see
└── PublicSans-600.ttf         #   Code Examples), committed so the script has
                                #   zero network dependency on every re-run

public/
├── annotate-hero.png          # existing — read by the OG script for the crop
├── icon.png                   # existing — unrelated to this phase
└── og-image.png                # NEW — committed output of generate-og-image.ts
```

### Pattern 1: `metadataBase` + relative paths, everything resolves to absolute

**What:** Set `metadataBase: new URL(siteConfig.baseUrl)` once in `app/layout.tsx`'s `metadata` export. Every other metadata field (`alternates.canonical`, `openGraph.images[].url`, `twitter.images`) can then use a **relative** path (`/`, `/og-image.png`) and Next.js resolves it to a fully-qualified absolute URL at build time.

**When to use:** Always, for every absolute-URL field in this phase's metadata object. This is the mechanism that satisfies FOUND-02 ("changing the domain is a one-line edit") and SEO-03/SEO-04's "must be absolute" requirements without hardcoding the domain a second time anywhere in `app/layout.tsx`.

**Example (Context7-verified against Next.js's own `generate-metadata.mdx`):**
```jsx
// Confirmed pattern from Next.js's own docs (canary branch, current)
export const metadata = {
  metadataBase: new URL('https://acme.com'),
  alternates: {
    canonical: '/',
    languages: { 'en-US': '/en-US', 'de-DE': '/de-DE' },
  },
  openGraph: {
    images: '/og-image.png',
  },
}
```
`metadataBase` is ignored for any field that is *already* an absolute URL — it only fills in relative ones. **Do not skip `metadataBase`** — without it, Next.js throws a build error the moment any metadata field uses a relative path.

### Pattern 2: Native `<script type="application/ld+json">`, never `next/script`

**What:** Render structured data as a literal `<script>` tag with `dangerouslySetInnerHTML`, directly in `app/layout.tsx` (a Server Component — no client boundary needed).

**When to use:** Always, for the `SoftwareApplication` JSON-LD block. This is Next.js's own documented recommendation, not a project-specific preference — the official guide states explicitly: *"A native `<script>` tag is appropriate for JSON-LD because it is structured data, not executable JavaScript. The `next/script` component is optimized for loading and executing JavaScript, making it unsuitable for JSON-LD."*

**Example (Context7-verified against Next.js's own `json-ld.mdx`):**
```tsx
// Source: Next.js's own JSON-LD guide (docs/01-app/02-guides/json-ld.mdx)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  image: product.image,
  description: product.description,
}

return (
  <section>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, '<'),
      }}
    />
  </section>
)
```
**Security note from the same guide, verbatim:** `JSON.stringify` does not sanitize its output — escape `<` to `<` to prevent the string from breaking out of the `<script>` tag. There is no user input in this phase's `SoftwareApplication` object (every field is a static literal or reads `siteConfig`/hardcoded strings), so the practical XSS risk is effectively zero — but apply the `.replace(/</g, '<')` anyway as the documented, zero-cost habit, since a future edit to the description/name strings could introduce a stray `<`.

### Pattern 3: `MetadataRoute.Robots` / `MetadataRoute.Sitemap` file conventions

**What:** `app/robots.ts` and `app/sitemap.ts`, each exporting a default function typed against `MetadataRoute.Robots`/`MetadataRoute.Sitemap`. Next.js auto-serves these at `/robots.txt` and `/sitemap.xml` with correct `Content-Type` — no route handler, no manual XML/text generation.

**When to use:** Always, for SEO-06/SEO-07. Both files can be plain (not `async`) functions since neither reads request data — but Next.js also supports `async function robots(): Promise<MetadataRoute.Robots>` if a future need arises (confirmed via Context7 — both sync and async default exports are valid).

**Example (Context7-verified against Next.js's own `robots.mdx`/`sitemap.mdx`):**
```typescript
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://acme.com/sitemap.xml',
  }
}
```
```typescript
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://acme.com', lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
  ]
}
```
Per CONTEXT.md, this phase's `sitemap.ts` omits `changeFrequency`/`priority` (Google ignores both) and lists exactly one entry — the homepage.

### Pattern 4: Env-gated response headers via `next.config.ts`

**What:** `next.config.ts`'s async `headers()` function returns an array of `{ source, headers: [{key, value}] }` rules, evaluated once when `next build` runs and baked into that deployment's routes manifest.

**When to use:** SEO-08 exactly as CONTEXT.md locks it — gate on `process.env.VERCEL_ENV !== 'production'`.

**Example (Context7-verified against Next.js's own `headers.mdx` + `next.config.ts` source):**
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.VERCEL_ENV === 'production') {
      return []
    }
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
```
`source: '/:path*'` uses the same wildcard-path-segment syntax Next.js documents for matching multi-segment paths (e.g. `/blog/:slug*` matches `/blog/a/b/c`); at the root level `/:path*` matches every route on the site, including `/` itself, since `*` means "zero or more segments."

### Pattern 5: Playwright screenshot of a self-contained HTML string, exact pixel dimensions

**What:** Build one HTML string with everything it needs — fonts and images inlined as base64 `data:` URIs — set the viewport to the exact target dimensions, load the string via `page.setContent()`, and screenshot with no `clip` (the default viewport-sized screenshot is already exactly the target size).

**When to use:** ASSET-01's `public/og-image.png` generation, per CONTEXT.md's locked "HTML template + Playwright shot" decision.

**Example (Playwright API confirmed via Context7 against `/microsoft/playwright`'s own docs):**
```typescript
// scripts/generate-og-image.ts
// Run: bun scripts/generate-og-image.ts
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const shantellBold = readFileSync(
  join(ROOT, 'scripts/og-image-assets/ShantellSans-700.ttf'),
).toString('base64');
const publicSansSemibold = readFileSync(
  join(ROOT, 'scripts/og-image-assets/PublicSans-600.ttf'),
).toString('base64');
const heroPng = readFileSync(join(ROOT, 'public/annotate-hero.png')).toString('base64');

const html = `<!doctype html>
<html><head><meta charset="utf-8" />
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
  /* ...card layout CSS per 03-UI-SPEC.md (canvas bg, text panel, mat/frame,
     cropped-photo box using background-size/background-position — see
     Common Pitfalls for the exact crop-to-pixel formula)... */
  .photo-crop {
    width: 692px; height: 574px; border-radius: 3px;
    background-image: url(data:image/png;base64,${heroPng});
    background-size: 1166px 729px;      /* 1280*0.9111, 800*0.9111 */
    background-position: -364px -155px; /* -400*0.9111, -170*0.9111 */
  }
</style></head>
<body>
  <!-- left text panel + right matted/cropped photo panel per 03-UI-SPEC.md -->
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: join(ROOT, 'public/og-image.png') });
await browser.close();
```
Note `browser.newPage({ viewport: {...} })` sets the viewport at page creation (equivalent to `page.setViewportSize()` called before `goto`/`setContent`, which Playwright's own docs recommend doing before navigation). Playwright's screenshotter automatically calls `document.fonts.ready` before capturing — confirmed via Playwright's own source (`screenshotter.ts`): *"Playwright waits for `document.fonts.ready` when preparing page screenshots... The wait can be disabled with the `PW_TEST_SCREENSHOT_NO_FONTS_READY` environment variable"* (leave this unset — the default behavior is exactly the FOUT-prevention this phase needs). No `clip` option is needed since the default (non-`fullPage`) screenshot captures exactly the current viewport — 1200×630, matching ASSET-01's hard requirement.

### Anti-Patterns to Avoid

- **`app/opengraph-image.tsx` with `next/og`'s `ImageResponse`:** rejected by STACK.md's own decision section (500KB bundle budget too tight against a 278KB source screenshot + custom fonts) and explicitly overridden by the user's separate choice of the Playwright approach in CONTEXT.md. Do not build this file this phase — `.planning/research/ARCHITECTURE.md`'s diagram referencing it is a stale draft.
- **`next/script` for JSON-LD:** Next.js's own docs explicitly call this the wrong tool — it's built for controlling *executable* JS loading strategy, and structured data isn't executable JS.
- **Referencing `next/font`'s output inside the OG generation script:** `next/font` only self-hosts fonts as part of a Next.js webpack/Turbopack build — it produces no standalone, stable-path font files a separate Bun script can read. The OG script needs its own font files (see Common Pitfalls).
- **Hardcoding `overlay-notes.kalebnim.dev` a second time anywhere in `app/layout.tsx`, `app/robots.ts`, or `app/sitemap.ts`:** every absolute URL must derive from `siteConfig.baseUrl` (imported) or from `metadataBase` resolution — this is the whole point of FOUND-02, and re-typing the domain string anywhere else reintroduces the exact drift risk the single-source pattern exists to prevent.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Absolute-URL resolution for OG/canonical tags | Manual string concatenation (`siteConfig.baseUrl + '/og-image.png'`) scattered across metadata fields | `metadataBase` + relative paths | One config point; Next.js handles the URL-joining edge cases (trailing slashes, existing absolute URLs) correctly and consistently — verified in Next.js's own docs |
| `robots.txt`/`sitemap.xml` text/XML serialization | A custom Route Handler (`app/robots.txt/route.ts`) that manually builds the response body and sets `Content-Type` | `MetadataRoute.Robots`/`MetadataRoute.Sitemap` file-convention exports | Next.js generates correct `Content-Type`/XML escaping automatically; a hand-rolled route risks XML-escaping bugs in the sitemap's URL entries |
| JSON-LD XSS escaping | A regex or manual sanitizer library | `JSON.stringify(obj).replace(/</g, '<')` | This is the exact one-line pattern Next.js's own docs specify as sufficient for this use case — no dependency needed |
| Font self-hosting for the OG screenshot | A CDN `<link>` to Google Fonts inside the OG template's HTML | Base64-inlined `@font-face src: url(data:font/ttf;base64,...)` | A network `<link>` at screenshot time breaks the "no FOUT / no network at shot time" determinism requirement CONTEXT.md locks — Playwright's `document.fonts.ready` wait only helps if the font actually loads, and a flaky network fetch mid-CI-run would silently corrupt the committed PNG on a re-generation |

**Key insight:** every one of this phase's "problems" already has a first-party Next.js file convention or documented pattern — there is no case in this phase where reaching for a third-party library or hand-rolled solution is justified. The only genuinely custom code is the OG-card layout CSS and crop-math (a one-time, design-locked value per 03-UI-SPEC.md, not a reusable abstraction).

## Common Pitfalls

### Pitfall 1: `VERCEL_ENV` requires a project-level dashboard toggle to populate at all
**What goes wrong:** `process.env.VERCEL_ENV` is `undefined` in the build container, so `process.env.VERCEL_ENV !== 'production'` evaluates `true` even on the production deployment — the noindex header leaks onto the live site, silently killing all organic search visibility.
**Why it happens:** Vercel's own docs (confirmed via WebFetch against `vercel.com/docs/environment-variables/system-environment-variables`, last updated 2026-04-27) state that System Environment Variables — the group `VERCEL_ENV` belongs to — require the project's **"Enable access to System Environment Variables"** checkbox (Project Settings → Environment Variables) to be turned on before they're populated in the build/runtime environment for that project.
**How to avoid:** This is a Phase 4 (deploy) verification item, not something Phase 3's code can self-verify (there's no live Vercel deployment yet in Phase 3). Flag it explicitly as a Phase 4 checkpoint: after the first production deploy, `curl -I https://overlay-notes.kalebnim.dev/` and confirm **no** `X-Robots-Tag` header is present; if it is present, check this dashboard toggle before assuming the `next.config.ts` logic is broken.
**Warning signs:** `X-Robots-Tag: noindex, nofollow` appearing in a `curl -I` against the *production* URL after deploy.

### Pitfall 2: `VERCEL_ENV` is never set locally — local verification of SEO-08 needs an explicit override
**What goes wrong:** Running `bun run dev` or `bun run build && bun run start` locally always has `process.env.VERCEL_ENV === undefined`, so the header is *always* present in local/dev builds by design (this is actually correct behavior — dev builds should never be indexed — but it means you cannot locally observe the "header absent" branch without simulating production).
**Why it happens:** `VERCEL_ENV` is a Vercel-platform-injected variable; it does not exist outside Vercel's build/runtime environment.
**How to avoid:** To verify both branches locally before deploying: `bun run build && bun run start` then `curl -I http://localhost:3000/` (expect `X-Robots-Tag` present); separately, `VERCEL_ENV=production bun run build && bun run start` then `curl -I http://localhost:3000/` (expect it absent). If `tests/seo.spec.ts` gets an SEO-08 assertion added, it should assert the header is present under Playwright's default `bun run dev`-backed test run (since that run never has `VERCEL_ENV=production`) — do not write an assertion that expects the header to be *absent* under the normal local test-gate run, or the test will falsely fail every time.
**Warning signs:** A test asserting "no X-Robots-Tag header" that fails on every local/CI run because `VERCEL_ENV` is never `production` there.

### Pitfall 3: `next/font`'s output is not reusable by a standalone script
**What goes wrong:** Attempting to have `scripts/generate-og-image.ts` import or reference the `Shantell_Sans`/`Public_Sans` objects from `app/layout.tsx`, expecting to get a usable font file path or buffer.
**Why it happens:** `next/font/google` is a webpack/Turbopack build-time loader — it self-hosts fonts as part of the Next.js compilation pipeline and produces content-hashed files inside `.next/`, not a stable API surface a separate script can import. (Confirmed by direct inspection this session: the actual `.woff2` files exist under `.next/static/media/<hash>-s.<hash>.woff2` with no stable name-to-weight mapping without parsing the generated CSS.)
**How to avoid:** Download the two specific font files (Shantell Sans weight 700, Public Sans weight 600 — the only weights the locked UI-SPEC typography uses) once from Google Fonts' CSS2 API, commit them to `scripts/og-image-assets/`, and have the OG script read them from disk with plain `fs.readFileSync`. Confirmed working URLs (fetched live this session via Google Fonts' `css2` endpoint):
  - Public Sans 600: `https://fonts.gstatic.com/s/publicsans/v21/ijwGs572Xtc6ZYQws9YVwllKVG8qX1oyOymuyJ65ww.ttf`
  - Shantell Sans 700: `https://fonts.gstatic.com/s/shantellsans/v13/FeUaS0pCoLIo-lcdY7kjvNoQqWVWB0qWpl29ajppTuUTu_kJKmHesPOL-maYi4xZeHCNQ09eBlmv2QcUzJ39-rAISYSbTGi2.ttf`
  These URLs are versioned Google Fonts CDN paths (`v21`/`v13`) and may rotate on a future Google Fonts release — treat the *download step* as a one-time setup task (documented in a comment at the top of the script or a short companion note), not something the script re-fetches on every run. Once the `.ttf` files are committed, the script itself has zero network dependency.
**Warning signs:** The OG script throwing a module-resolution error trying to `import` from `app/fonts.ts` or `next/font/google`, or the generated PNG rendering with a system fallback font instead of Shantell Sans/Public Sans.

### Pitfall 4: `metadataBase` omission throws a hard build error, not a warning
**What goes wrong:** Forgetting `metadataBase` while using any relative path in `openGraph.images`/`twitter.images`/`alternates.canonical` fails `next build` outright.
**Why it happens:** Documented, intentional Next.js behavior — relative metadata URLs are meaningless without a base to resolve against.
**How to avoid:** Add `metadataBase: new URL(siteConfig.baseUrl)` as the very first field when extending `app/layout.tsx`'s `metadata` export, before adding any of the OG/Twitter/canonical fields that depend on it.
**Warning signs:** `next build` failing with an error referencing `metadataBase` the moment `/og-image.png` or `alternates.canonical: '/'` is added.

### Pitfall 5: Stale `kaleb-nim.github.io` references leaking from copy-paste of the SEO brief
**What goes wrong:** The SEO brief (`.planning/design-handoff/LANDING-PAGE-SEO-BRIEF.md`) §6/§7 gives exact `<head>`/JSON-LD values, but every URL in it (`canonical`, `og:url`, `og:image`, JSON-LD `url`/`image`) still points at `https://kaleb-nim.github.io/overlay-notes/` — that brief predates the domain migration to `overlay-notes.kalebnim.dev`. Copy-pasting its code blocks verbatim (rather than just its title/description *text* strings) reintroduces the exact stale-domain leak SEO-03 exists to prevent.
**Why it happens:** The brief is dated 2026-07-23, written before `lib/site-config.ts`'s `baseUrl` was locked to the new subdomain.
**How to avoid:** Only copy the brief's literal **string values** (title, description, og:description) — never its URL fields. Every URL field must derive from `siteConfig.baseUrl`/`metadataBase` resolution, never a literal string from the brief.
**Warning signs:** The Phase 3 roadmap success criterion #2's own check — `grep` the rendered HTML `<head>` for `kaleb-nim.github.io` and confirm zero matches outside the intentional footer privacy link (which lives in `app/page.tsx`, not `<head>`).

### Pitfall 6: The 500KB Satori/`ImageResponse` budget doesn't apply here — don't accidentally reintroduce it
**What goes wrong:** A future contributor (or an AI executor pattern-matching on "OG image + Next.js") might default to `app/opengraph-image.tsx` out of habit, since it's the more commonly-documented Next.js pattern for OG images.
**Why it happens:** `next/og`'s `ImageResponse` file convention is the more heavily-documented, "blessed" Next.js path for OG images in general — but this phase's decision explicitly rejects it (see Anti-Patterns).
**How to avoid:** The plan's task list should not include creating `app/opengraph-image.tsx`. `public/og-image.png` (a plain static file) is the only OG-image artifact this phase produces.
**Warning signs:** A file named `app/opengraph-image.tsx` or `app/opengraph-image.png` appearing in the diff — either is out of scope for this phase's locked decision.

## Code Examples

### Full `app/layout.tsx` metadata + JSON-LD extension

```tsx
// app/layout.tsx (extension — keep existing font/Analytics/SpeedInsights code)
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

const TITLE = 'Draw & Annotate Notes on Any Webpage — Overlay Notes';
const DESCRIPTION =
  'Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to the content and save per page, 100% local.';
const OG_DESCRIPTION =
  "A free Chrome extension that puts an Excalidraw-style sketch canvas on any website. Handwrite notes over what you're reading — they scroll with the page and save locally.";
const OG_IMAGE_ALT =
  'Handwritten marker notes and arrows drawn over a webpage — Overlay Notes, a free Chrome extension';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: TITLE,
    description: OG_DESCRIPTION,
    images: [
      { url: '/og-image.png', width: 1200, height: 630, alt: OG_IMAGE_ALT },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: OG_DESCRIPTION,
    images: ['/og-image.png'],
  },
};

const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Overlay Notes',
  applicationCategory: 'BrowserApplication',
  operatingSystem: 'Chrome',
  description: DESCRIPTION,
  url: siteConfig.baseUrl,
  image: `${siteConfig.baseUrl}/og-image.png`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={/* existing font variable classes */ undefined}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationJsonLd).replace(/</g, '<'),
          }}
        />
        {children}
        {/* existing <Analytics /> / <SpeedInsights /> */}
      </body>
    </html>
  );
}
```

### `app/robots.ts`

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

### `app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteConfig.baseUrl, lastModified: new Date() }];
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `FAQPage` JSON-LD for FAQ rich results | No FAQ structured data — visible-text-only FAQ | Google removed FAQ rich results for most sites 2026-05-07 | This phase deliberately ships zero `FAQPage` JSON-LD — do not add it back; it has no search-result benefit and only adds a schema/visible-text sync obligation |
| Manual `<link rel="canonical">`/`<meta property="og:...">` tags hand-written per page | Next.js `metadata` object / `generateMetadata()` | Stable since Next.js 13's App Router (unchanged through 16) | No migration concern for this project — it was scaffolded directly on Next.js 16, never had the old `next/head`-based approach |
| `next/script` used for all injected `<script>` tags indiscriminately | Native `<script>` for inert data (JSON-LD), `next/script` reserved for executable JS with loading-strategy needs | Documented distinction in Next.js's own current JSON-LD guide | Directly informs Pattern 2 above — avoid the common mistake of defaulting to `next/script` for JSON-LD out of habit |

**Deprecated/outdated:** None of the four core APIs used this phase (Metadata object, JSON-LD native script, `MetadataRoute.Robots`/`Sitemap`, `next.config.ts` `headers()`) have any pending deprecation in Next.js 16 — all four are actively documented as the current, recommended pattern.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | Google Fonts CDN URLs for Shantell Sans 700 / Public Sans 600 (`fonts.gstatic.com/s/...`) will remain stable long enough for a one-time download during Phase 3 execution | Common Pitfalls #3 | Low — these are versioned CDN paths (`v13`/`v21`) fetched live this session via the `css2` API; if they've rotated by execution time, re-running the same `fonts.googleapis.com/css2?family=...` fetch will return the current URL, which is a trivial one-line fix in the download step |
| A2 | The "Automatically expose System Environment Variables" toggle's default state (on vs. off) for a newly-created Vercel project is not independently confirmed this session — the docs describe the setting's *existence* and effect, not its default value for new projects | Common Pitfalls #1 | Medium — if the assumption that this needs manual verification is wrong (i.e., it's on by default for all new projects), the Phase 4 checkpoint is simply a no-op confirmation rather than a required fix; if the assumption is right and it's off by default, skipping the checkpoint risks shipping a de-indexed production site |

**If this table is empty:** N/A — two low/medium-risk assumptions logged above, both resolvable with a single verification step at Phase 4 deploy time.

## Open Questions

1. **Is "Automatically expose System Environment Variables" already enabled on this Vercel project?**
   - What we know: The setting exists, gates `VERCEL_ENV`/`VERCEL_URL`/etc. availability at build+runtime, and is configured per-project in Vercel's dashboard (per official docs, confirmed this session).
   - What's unclear: This project's Vercel deployment doesn't exist yet (Phase 4) — there's no dashboard to check yet.
   - Recommendation: Add an explicit Phase 4 checkpoint (`checkpoint:human-verify` or equivalent) to confirm this toggle is on, immediately after first deploy and before considering SEO-08 verified in production. Phase 3's own work (writing the `next.config.ts` gate) is correct and complete regardless of this toggle's state — the toggle only affects whether the gate is *reachable*.

2. **Exact OG-card crop pixel math — does `background-position: -364px -155px` need adjustment once the template is actually rendered?**
   - What we know: UI-SPEC's locked crop rect (`x:400,y:170,w:780,h:630` on the 1280×800 source) and inner mat render area (692×574) give a computed scale factor of 0.9111 and the resulting background-position values shown in Code Examples/Pattern 5.
   - What's unclear: This is arithmetic, not a rendering-verified value — the UI-SPEC itself flags the crop rect as "a default, not a lock... if visual QA during Phase 3 execution finds a tighter/better crop, adjusting these four numbers is within scope."
   - Recommendation: Treat the computed `background-size`/`background-position` values as a starting point; the plan should include a visual-inspection step (open the generated PNG, confirm the annotation cluster UI-SPEC describes is visible and not awkwardly cropped) before considering ASSET-01 done.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|--------------|-----------|---------|----------|
| Bundled Chromium (Playwright) | OG image generation script (ASSET-01) | ✓ | `chromium-1228` (matches Playwright 1.61.1) | — |
| `@playwright/test` (provides `chromium` export) | OG image generation script | ✓ | 1.61.1 (installed, `package.json`) | — |
| Next.js `next build` | All metadata/robots/sitemap/header verification | ✓ | 16.2.11 (installed) | — |
| Google Rich Results Test (external, manual) | SEO-05 validation | N/A — manual browser step, not a code dependency | — | No fallback needed; this is a human verification step against the built/served HTML, not a build-time dependency |
| LinkedIn Post Inspector (external, manual) | ASSET-02 validation | N/A — requires a live deployed URL | — | Deferred entirely to Phase 4 per CONTEXT.md; Phase 3 only confirms the file exists at exact 1200×630 dimensions and tags are absolute |

**Missing dependencies with no fallback:** none — everything Phase 3's own build/test steps need is already installed and confirmed working.

**Missing dependencies with fallback:** none applicable; the two manual/external checks (Rich Results Test, LinkedIn Inspector) are expected human/Phase-4 steps, not blocked dependencies.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|----------------|---------|--------------------|
| V2 Authentication | No | This phase adds no auth surface — static metadata/structured-data only |
| V3 Session Management | No | No sessions exist anywhere in this project |
| V4 Access Control | No | No access-controlled resources; `robots.txt` intentionally allows all crawlers per SEO-06 |
| V5 Input Validation | Yes (narrow) | `JSON.stringify(jsonLd).replace(/</g, '<')` before `dangerouslySetInnerHTML` — Next.js's own documented mitigation for JSON-LD script-tag injection. All values fed into the `SoftwareApplication` object are static compile-time literals (no user input), so the practical injection surface is effectively zero, but the escape is applied per Next.js's own documented best practice regardless. |
| V6 Cryptography | No | No cryptographic operations in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Script-tag breakout via unescaped `<` in `dangerouslySetInnerHTML` JSON-LD payload | Tampering | `.replace(/</g, '<')` on the `JSON.stringify()` output, applied to every JSON-LD block this phase renders (only one: `SoftwareApplication`) |
| Accidental production de-indexing via a misconfigured/leaked `X-Robots-Tag: noindex` header | (Availability-adjacent — not a STRIDE category, but a real production-correctness risk this phase's own security-relevant control introduces) | Explicit Phase 4 verification step (see Common Pitfalls #1/#2 and Open Question #1) — confirm the header is present on preview/dev and absent on production before considering SEO-08 done |

## Sources

### Primary (HIGH confidence)
- Direct registry/tool checks this session: `npm view next version` → `16.2.11`; `npm view playwright version` / `npm view @playwright/test version` → `1.61.1`; `bunx playwright --version` → `Version 1.61.1`; direct filesystem inspection confirming `chromium-1228` binary present at `~/Library/Caches/ms-playwright/`; direct `node -e "require(...)"` check confirming `chromium` is exported from the installed `@playwright/test` package.
- Live WebFetch this session against `fonts.googleapis.com/css2?family=Shantell+Sans:wght@700&family=Public+Sans:wght@600` — confirmed the exact `fonts.gstatic.com` `.ttf` URLs cited in Common Pitfalls #3.

### Secondary (MEDIUM confidence — Context7/official docs)
- `/vercel/next.js` (Context7) — `generate-metadata.mdx` (`metadataBase`, `openGraph.images` shape with `width`/`height`/`alt`, `twitter` card shape, `alternates.canonical`), `json-ld.mdx` (native `<script>` pattern, XSS-escape recommendation, explicit "don't use `next/script`" statement), `robots.mdx`/`sitemap.mdx` (`MetadataRoute.Robots`/`MetadataRoute.Sitemap` file-convention shapes, sync/async variants), `headers.mdx` + `next.config.ts` source (async `headers()` shape, `/:path*` wildcard matching semantics), `rewrites.mdx` (confirms `*` wildcard matches multi-segment paths, informing the root-level `/:path*` match-all read).
- `/microsoft/playwright` (Context7) — `screenshots.md` (`page.screenshot` options), `screenshotter.ts` source (confirmed `document.fonts.ready` wait happens automatically before every screenshot, disableable only via `PW_TEST_SCREENSHOT_NO_FONTS_READY`), `class-page.md` (`setViewportSize`), `class-testoptions.md` (`deviceScaleFactor` config shape).
- WebFetch against `vercel.com/docs/environment-variables/system-environment-variables` (official Vercel docs, page dated 2026-04-27) — confirmed `VERCEL_ENV` values (`production`/`preview`/`development`), "Both build and runtime" availability, and the "Enable access to System Environment Variables" toggle requirement this document's Common Pitfalls section is built around.

### Tertiary (LOW confidence — WebSearch only, cross-checked)
- WebSearch for general `VERCEL_ENV` behavior summary (multiple independent hits, e.g. Vercel's own `environments` doc, community guides) — used only to orient before the authoritative WebFetch above; the WebFetch result is what's actually cited in this document's claims.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies; every version confirmed against the installed project and the npm registry directly, not training-data memory.
- Architecture: HIGH — all four core Next.js patterns (Metadata object, JSON-LD script, robots/sitemap file conventions, `headers()`) confirmed via Context7 against Next.js's own current docs; the OG-generation pattern is synthesized from Playwright's own documented APIs (Context7-verified) since no first-party "Next.js OG image via Playwright" doc exists — this is the one place in this document combining verified primitives into a project-specific pattern rather than citing a single authoritative source directly.
- Pitfalls: HIGH — the `VERCEL_ENV` toggle risk is confirmed against live official Vercel documentation fetched this session (not assumed from training data), which is the single highest-value pitfall in this phase given its potential production-indexing impact.

**Research date:** 2026-07-24
**Valid until:** 30 days (stable, unchanged Next.js APIs; the one time-sensitive fact — Google Fonts CDN URLs — is explicitly flagged as re-verifiable at execution time in Assumption A1)

# Phase 1: Foundation & Verified Copy - Research

**Researched:** 2026-07-24
**Domain:** Next.js 16 App Router scaffolding into a non-empty repo, `next/font/google` self-hosting of a variable font, static-marketing-site content modeling, copy traceability tooling
**Confidence:** HIGH (stack versions and font-loader behavior verified by actually installing the packages and inspecting/building against them, not just reading docs)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Stack (dictated by CLAUDE.md — not open for discussion)**
- Next.js 16.2.11 App Router + React 19.2.8 + TypeScript ~5.9 (pin deliberately; verify against Next's peerDependencies — do NOT trust `latest`, which resolves to a TS 7.x prerelease).
- Package manager/runner: **Bun as installer + script runner only**. Scripts stay `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`; invoke via `bun run dev`. **Never add `--bun`** (open oven-sh/bun issues #24829/#25014/#26244 break `next` under the Bun runtime).
- Rendering: normal `next build`, **no `output: 'export'`** override — default static prerender is already correct for a request-data-free page; export would disable `next/image` + `next/og`.
- `@vercel/analytics@2.0.1` and `@vercel/speed-insights@2.0.0` may be installed now, but wire them in the root layout via the `/next` subpath (not `/react`). Their live reporting is a Phase 4 concern — installing the deps here is fine, verifying data is not.

**Styling (dictated by CLAUDE.md)**
- **Plain global CSS**, ported near-verbatim from `concept-1a.html`. NOT Tailwind, NOT CSS Modules. Swap the two font-family values for the `next/font` CSS variables; every other value carries over 1:1.
- Design tokens as CSS custom properties on `:root` — the exact set from the prototype:
  `--paper:#f6f1e7; --rule:rgba(91,61,245,.10); --margin-red:rgba(214,72,72,.35); --purple:#5b3df5; --purple-dark:#3f27c9; --ink:#211d2e; --head:#1c1830; --body:#4a4560; --dark:#211d2e; --dark-muted:#a9a4c4; --accent-red:#d64848; --yellow:#ffc93c;`
- Ruled-paper background, verbatim rhythm:
  `background: repeating-linear-gradient(var(--paper) 0 31px, var(--rule) 31px 32px), linear-gradient(var(--paper),var(--paper));`

**Fonts (weights confirmed by reading concept-1a.html line 37)**
- Shantell Sans: weights **400, 600, 700**, plus **italic 500** (`0,400;0,600;0,700;1,500`).
- Public Sans: weights **400, 500, 600, 700**, plus **italic 400** (`0,400;0,500;0,600;0,700;1,400`).
- **Drop Space Grotesk** — the prototype `<link>`-loads it but references it in zero font-family declarations (confirmed: 0 matches).
- Expose each as a CSS variable (e.g. `--font-shantell`, `--font-public`) and set the `:root`/`body` font-family to reference them.

**Content module (`lib/content.ts`)**
- One typed module. FAQ = an array of 6 `{ question, answer }` objects (shape consumed by Phase 2 FAQ and, per CONTEXT.md, "Phase 3's JSON-LD builder" — see Open Questions, this second claim appears to conflict with REQUIREMENTS.md's explicit ban on `FAQPage` JSON-LD).
- Origin story = the verbatim NUS CS2030 text from the design handoff.
- Every string carries a source tag pointing at the STORE-LISTING.md / README.md line it derives from.

**Claim traceability**
- Produce a traceability artifact mapping each visible-copy claim → named source line. Must cover the verbatim privacy statement, the exact phrase "excalidraw chrome extension", and the support-section claims ("free and always will be", "no accounts, no ads, nothing tracked", solo-dev-covers-hosting).
- Scan for and confirm ZERO matches against the banned-term list: PDF, Firefox, Safari, sync, accounts, export, cross-note search, dashboards, collaboration, sharing.
- **Flag the "nothing tracked" ↔ Vercel Analytics tension**: the support copy says "nothing tracked" while the site runs Vercel Analytics (cookieless, no individual tracking) — reconcile so the visible claim stays defensible.

**Test harness (preserve — do NOT overwrite)**
- `playwright.config.ts`, `scripts/test-gate.sh`, `tests/landing.spec.ts`, `tests/seo.spec.ts`, `TESTING.md` already exist and MUST survive scaffolding.
- Install Playwright during this phase: `bun add -d @playwright/test @types/node` then `bunx playwright install chromium`. Add `"test": "playwright test"` to package.json scripts.
- **See Common Pitfall #1 below — this instruction, taken literally, flips the regression gate live before any section exists and WILL fail the gate. This needs an explicit planning decision, not a silent workaround.**

### Claude's Discretion
- Exact file/folder layout under `app/` and `lib/` (follow Next 16 App Router conventions).
- Whether the traceability check is a static `.md` table, a typed TS assertion, or both — as long as it is verifiable.
- How font CSS variables are named, as long as the ported CSS references them.

### Deferred Ideas (OUT OF SCOPE)
- Building any visible section, the `<head>`/metadata, JSON-LD, robots/sitemap, OG image → Phases 2–3.
- Deployment, custom domain, and confirming Analytics/Speed Insights report real data → Phase 4.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Project runs locally via `bun run dev` on Next.js App Router with TypeScript | Manual-scaffold file set verified end-to-end (`bun run build` succeeded) — see Code Examples |
| FOUND-02 | All absolute URLs derive from a single `baseUrl` constant | `lib/site-config.ts` shape given below |
| FOUND-03 | Shantell Sans + Public Sans self-hosted via `next/font/google` at exact weights, no render-blocking third-party request | `next/font/google` call signatures verified against installed `font-data.json` + a real build; see Common Pitfall #2 for a verified discrepancy in the locked weight list |
| FOUND-04 | Design tokens exist as CSS custom properties consumed by every section | CSS porting pattern below (verbatim `:root` block) |
| FOUND-05 | Ruled-paper background renders as `repeating-linear-gradient` at 31px/32px | Verbatim CSS given below |
| CONT-01 | Every visible claim traceable to STORE-LISTING.md/README.md | Traceability artifact pattern + extracted source lines below |
| CONT-02 | No banned terms (PDF, Firefox, Safari, sync, accounts, export, cross-note search, dashboards, collaboration, sharing) | See Common Pitfall #3 — naive substring scanning produces false positives against required copy |
| CONT-03 | Privacy statement verbatim: "nothing is collected, transmitted, sold, or shared" | Sourced from STORE-LISTING.md PRIVACY section — see Code Examples |
| CONT-04 | Verbatim phrase "excalidraw chrome extension" in visible body copy | Lives in the "vs. Excalidraw" diff-column copy (Phase 2 markup), not in `lib/content.ts` — traceability artifact must track it separately, see below |
| CONT-05 | Each SEO keyword appears at most once | Keyword list extracted from LANDING-PAGE-SEO-BRIEF.md §9, reproduced below |
| CONT-06 | 6 FAQ Q&A pairs in one typed content module | Extracted verbatim from `concept-1a.html`'s FAQPage JSON-LD block below |
| CONT-07 | NUS CS2030 origin story verbatim | Extracted verbatim from `concept-1a.html` `.origin p` below |
| CONT-08 | Support-section claims reconciled against STORE-LISTING.md, don't contradict CONT-03 | Reconciliation approach below |
</phase_requirements>

## Summary

This phase is pure scaffolding + content-authoring with no visible UI, so the two things that
can actually go wrong are mechanical: (1) getting Next.js 16 into an already-populated
directory without breaking the pre-built Playwright harness, and (2) getting the two
self-hosted Google Fonts loaded at the *exact* weight/style combinations the design uses. Both
were verified by actually doing them in a scratch directory — not just reading docs. A third,
higher-stakes finding fell out of that verification: installing Playwright in this phase (as
CONTEXT.md's Test harness section instructs) makes `scripts/test-gate.sh`'s regression gate go
live immediately, and it **will** fail against `tests/landing.spec.ts`'s real CTA/image
assertions, because this phase intentionally builds no sections. This is flagged prominently
below because it changes how Phase 1's final tasks should be sequenced.

**Primary recommendation:** Scaffold Next.js 16 by hand (`bun add next react react-dom` +
five hand-authored config/entry files) rather than `create-next-app`, which refuses to run
against this directory's existing files. Load both fonts via `next/font/google` using discrete
`weight` arrays (not a bare variable-font call) — confirmed via the installed package's own
`font-data.json` that Shantell Sans exposes 300–800 as *discrete* weight strings, not just
`"variable"`, so this works cleanly. Resolve the Playwright-gate timing conflict explicitly in
the plan rather than letting it surface as a surprise regression-gate failure.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Page rendering (HTML/CSS output) | Frontend Server (SSR/SSG) | — | Next.js App Router prerenders this route at build time (no request data consumed) — output is static HTML served from Vercel's CDN, no runtime server tier involved post-build |
| Design tokens / global styling | Frontend Server (build-time CSS) | Browser (CSS custom properties resolved at paint time) | Tokens are authored once in `app/globals.css`, compiled into the static bundle; the browser resolves `var(--token)` at render time but owns no token *definitions* |
| Font loading | Frontend Server (`next/font/google`, self-hosted at build time) | Browser (network fetch of the woff2 files, subject to `font-display: swap`) | `next/font` downloads and hashes font files during `next build`; the browser only fetches the specific woff2 whose weight/style/unicode-range a rendered glyph actually needs |
| Copy / content data | Frontend Server (`lib/content.ts`, build-time static module) | — | No CMS, no database, no runtime fetch — content is a TypeScript module compiled into the bundle, identical to a config file |
| Claim traceability | Build-time tooling (not shipped to the browser) | — | The traceability artifact is a development-time verification aid (markdown table and/or a TS assertion run in CI/tests), not a runtime concern |
| Base URL constant | Frontend Server (`lib/site-config.ts`) | — | Consumed at build time by `generateMetadata`/JSON-LD in Phase 3; irrelevant to the browser |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | `16.2.11` `[VERIFIED: npm registry, installed and built locally]` | App Router framework | Locked by CLAUDE.md; confirmed still `latest` dist-tag as of today |
| `react` / `react-dom` | `19.2.8` `[VERIFIED: npm registry]` | UI runtime, peer of Next 16 | Locked by CLAUDE.md |
| `typescript` | `5.9.3` `[VERIFIED: npm registry — confirmed 5.9.3 is the newest *stable* 5.9.x; npm's `latest` dist-tag resolves to `7.0.2`, a new major line, exactly as CLAUDE.md warned]` | Type safety | Pin `5.9.3` explicitly in `package.json`, do not let `bun add -d typescript` resolve to `latest` |
| `@types/node` | `^22` `[VERIFIED: npm registry + local `node --version` = v22.23.1]` | Node API types for config files | npm's `latest` dist-tag for `@types/node` resolves to `26.1.1` — a types package tracking a Node major far ahead of any LTS this project runs. Pin to the `22.x` line to match the actual local/CI Node runtime, same over-eager-`latest` trap as TypeScript. |
| `@types/react` | `19.2.17` `[VERIFIED: npm registry]` | React 19 types | matches `react@19.2.8` |
| `@types/react-dom` | `19.2.3` `[VERIFIED: npm registry]` | ReactDOM 19 types | matches `react-dom@19.2.8` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@playwright/test` | `1.61.1` `[VERIFIED: npm registry]` | E2E test runner | Install per CONTEXT.md's Test harness section — **but read Common Pitfall #1 before deciding when in the task sequence to run this install** |
| `@vercel/analytics` | `2.0.1` `[VERIFIED: npm registry — already confirmed in CLAUDE.md's own research]` | Page-view analytics | Import from `/next` subpath in root layout; wiring is fine this phase, live-data verification is Phase 4 |
| `@vercel/speed-insights` | `2.0.0` `[VERIFIED: npm registry]` | Web Vitals reporting | Same pattern as Analytics |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual scaffold (hand-authored config files) | `create-next-app` into a temp dir, then `rsync`/manual merge | Both work; manual scaffold was chosen because it's fewer steps and was verified end-to-end (`bun run build` succeeded) in this research session. Temp-dir-then-merge adds a merge step with no benefit since the file set that App Router + TS needs is small (5 files) and fully enumerated below. |

**Installation:**
```bash
bun add next@16.2.11 react@19.2.8 react-dom@19.2.8
bun add -d typescript@5.9.3 @types/node@^22 @types/react@19.2.17 @types/react-dom@19.2.3
bun add @vercel/analytics@2.0.1 @vercel/speed-insights@2.0.0
# Playwright install — see Common Pitfall #1 for WHEN to run this in the task sequence:
bun add -d @playwright/test@1.61.1
bunx playwright install chromium
```

**Version verification performed this session:** `npm view next/react/react-dom/typescript/@types/node/@types/react/@types/react-dom/@playwright/test/@vercel/analytics/@vercel/speed-insights version` — all confirmed current. `next` was additionally installed and built locally (`bun add next@16.2.11 react@19.2.8 react-dom@19.2.8` → `bun run build` → succeeded with Turbopack) to verify the toolchain works, not just that the version string resolves.

## Package Legitimacy Audit

| Package | Registry | Age (latest publish) | Downloads/wk | Source Repo | Verdict | Disposition |
|---------|----------|----------------------|--------------|-------------|---------|-------------|
| `next` | npm | 2026-07-21 (3 days old at research time) | 49.9M | github.com/vercel/next.js | `[SUS]` (reason: `too-new`) | **Keep, override** — the legitimacy heuristic flags *recency of the latest release*, not package age; `next` has 49.9M weekly downloads and a verified official repo. This is a known false-positive pattern for fast-release-cadence, high-trust packages. No `checkpoint:human-verify` needed. |
| `react` | npm | 2026-07-21 | 161.3M | github.com/react/react | `[SUS]` (`too-new`) | **Keep, override** — same false-positive pattern, 161M weekly downloads. |
| `react-dom` | npm | 2026-07-21 | 152.3M | github.com/react/react | `[SUS]` (`too-new`) | **Keep, override** — same. |
| `typescript` | npm | 2026-07-08 | 242.3M | github.com/microsoft/TypeScript | `[SUS]` (`too-new`) | **Keep, override** — same. |
| `@types/node` | npm | 2026-07-08 | 384.5M | github.com/DefinitelyTyped/DefinitelyTyped | `[SUS]` (`too-new`) | **Keep, override** — same. |
| `@types/react` | npm | 2026-06-05 | 140.3M | github.com/DefinitelyTyped/DefinitelyTyped | `[OK]` | Approved |
| `@types/react-dom` | npm | 2025-11-12 | 114.2M | github.com/DefinitelyTyped/DefinitelyTyped | `[OK]` | Approved |
| `@playwright/test` | npm | 2026-06-23 | 47.6M | github.com/microsoft/playwright | `[SUS]` (`too-new`) | **Keep, override** — same false-positive pattern, 47.6M weekly downloads, official Microsoft repo. |
| `@vercel/analytics` | npm | 2026-03-12 | 4.8M | github.com/vercel/analytics | `[OK]` | Approved |
| `@vercel/speed-insights` | npm | 2026-03-10 | 3.1M | github.com/vercel/speed-insights | `[OK]` | Approved |

**Packages removed due to `[SLOP]` verdict:** none.
**Packages flagged as suspicious `[SUS]`:** `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@playwright/test` — all six flagged **only** on the `too-new` signal (which measures latest-version publish recency, not package trustworthiness or age) and all six have tens-to-hundreds-of-millions of weekly downloads plus verified official GitHub repos under recognizable maintainer orgs (vercel, facebook/react org, microsoft). These are the most heavily-vetted packages in the JavaScript ecosystem; gating each behind a `checkpoint:human-verify` would add ceremony with no real risk reduction. The planner may treat these six as pre-cleared — no `checkpoint:human-verify` task needed for them specifically — but should still note the override rationale in the plan for auditability, since this is a deviation from the literal SUS-handling instruction.

None of the ten packages returned a `postinstall` script.

## Architecture Patterns

### System Architecture Diagram

```
Developer machine (bun run dev / bun run build)
        │
        ▼
┌─────────────────────────────────────────────┐
│  Next.js 16 App Router build (Turbopack)     │
│                                               │
│  app/layout.tsx                              │
│   ├─ next/font/google("Shantell Sans")  ──┐  │
│   ├─ next/font/google("Public Sans")   ──┼─▶ self-hosted woff2 files
│   └─ imports app/globals.css            │    written into .next/static,
│         │                               │    served same-origin (no
│         ▼                               │    third-party font request)
│  app/globals.css                        │
│   ├─ :root { --paper, --purple, ... }   │
│   ├─ body { background: repeating-      │
│   │         linear-gradient(...) }      │
│   └─ font-family: var(--font-shantell), │
│                    var(--font-public)   │
│         │                                │
│         ▼                                │
│  app/page.tsx (Phase 1: minimal proof-of-tokens placeholder;
│                Phase 2: real sections)   │
└─────────────────────────────────────────────┘
        │
        ▼
Static HTML + CSS + hashed woff2, served from Vercel's CDN at build output
(no server tier invoked per-request — this route has no dynamic data)

Separate, parallel build-time-only path (not shipped to the browser):
lib/content.ts (faqs[], originStory) ──▶ traceability artifact ──▶ manually
   ↑                                        cross-checked against
   │                                        STORE-LISTING.md / README.md
   └── consumed by Phase 2's FAQ section JSX (not by any runtime fetch)
```

### Recommended Project Structure
```
app/
├── layout.tsx        # root layout — next/font calls, html/body shell, CSS var wiring
├── page.tsx           # Phase 1: minimal placeholder proving tokens/fonts/background render
└── globals.css        # ported :root tokens + ruled-paper background + font-family refs
lib/
├── site-config.ts     # single `baseUrl` export
└── content.ts          # faqs[] + originStory, each source-tagged
public/                 # (Phase 1 or Phase 2 — see Open Questions on icon.png sizing)
├── icon.png
└── annotate-hero.png
.planning/phases/01-foundation-verified-copy/
└── 01-CLAIM-TRACEABILITY.md   # (or similar) — the CONT-01/02/03/04/08 artifact
next.config.ts
tsconfig.json
next-env.d.ts
package.json
```

### Pattern 1: Manual scaffold into a non-empty directory (verified working)

**What:** `create-next-app` unconditionally refuses to run against a directory containing
unrecognized files. It was tested directly against a directory seeded with this repo's actual
pre-existing files:

```
$ bunx create-next-app@latest . --typescript --app ...
The directory cna-test contains files that could conflict:
  TESTING.md
  playwright.config.ts
  scripts/
  tests/
Either try using a new directory name, or remove the files listed above.
```

`create-next-app`'s conflict allowlist only tolerates `.git`, `.gitignore`, and a small set of
editor/README files — it does not special-case `playwright.config.ts`, `scripts/`, `tests/`,
or `TESTING.md`. There is no flag to bypass this check. **Do not attempt `create-next-app` in
this repo root.**

**When to use:** Never, for this repo. Use the manual scaffold below instead.

**Example (the exact five files needed, verified via a real `bun run build` in this
research session):**

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
```

```json
// tsconfig.json — Next.js REWRITES this file on first `next build`/`next dev`
// (see Common Pitfall #4). Author it with `jsx: "react-jsx"` from the start
// to skip the auto-mutation notice entirely.
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

```ts
// next-env.d.ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

`app/layout.tsx` and `app/page.tsx` — see Pattern 2 (fonts) and Code Examples (CSS) below for
the real content; a bare version of each was confirmed to compile and prerender successfully.

`package.json` scripts (no `--bun` anywhere, per CLAUDE.md):
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "playwright test"
  }
}
```

### Pattern 2: `next/font/google` for a variable font at discrete weights (verified)

**What:** Shantell Sans is Google-Fonts-variable (`wght` 300–800 plus three decorative axes:
`BNCE`, `INFM`, `SPAC`), but Next's own bundled font metadata — inspected directly at
`node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` after installing
`next@16.2.11` — lists **discrete** weight strings for it, not only `"variable"`:

```json
"Shantell Sans": {
  "weights": ["300", "400", "500", "600", "700", "800", "variable"],
  "styles": ["normal", "italic"],
  "axes": [
    { "tag": "BNCE", "min": -100, "max": 100, "defaultValue": 0 },
    { "tag": "INFM", "min": 0, "max": 100, "defaultValue": 0 },
    { "tag": "SPAC", "min": 0, "max": 100, "defaultValue": 0 },
    { "tag": "wght", "min": 300, "max": 800, "defaultValue": 400 }
  ],
  "subsets": ["cyrillic", "cyrillic-ext", "latin", "latin-ext", "vietnamese"]
}
```

Because discrete weight strings exist, `next/font/google` accepts a `weight: [...]` array for
this font without the "not a variable font" error some variable Google Fonts throw. Confirmed
by reading Next's own validator
(`node_modules/next/dist/compiled/@next/font/dist/google/validate-google-font-function-call.js`):
it only forces `weight: 'variable'` when a font's metadata offers **only** `"variable"` with no
discrete alternatives, and it throws if you mix `'variable'` into an array with other weights.

**Critical mechanical detail (verified via `get-google-fonts-url.js`):** `weight` and `style`
arrays are always combined as a **full cartesian product** — there is no way to request only
specific weight+style *pairs* (e.g. "400 normal, 600 normal, 700 normal, 500 italic" as four
combos). If you pass `weight: ['400','500','600','700']` and `style: ['normal','italic']`, Next
generates **8** `@font-face` declarations (all four weights × both styles), not 4. This was
directly verified by running `next build` with that exact configuration — it compiled
successfully and emitted 8 `@font-face` rules for Shantell Sans and 8 for Public Sans in the
generated CSS.

**This is not a performance problem in practice.** `@font-face` declarations are lazy —
browsers only fetch the specific weight/style/unicode-range file a rendered glyph actually
needs (`font-display: swap` does not force an eager fetch of every declared face). Declaring a
superset of weight/style combinations costs nothing at runtime beyond a slightly larger CSS
file; it does not trigger 8 network requests on page load.

**When to use:** Any time the design's actual weight/style needs (see Common Pitfall #2, below)
don't map cleanly onto Google's `ital,wght@...` combinatorial URL syntax used in the original
`<link>` tag — which is exactly the situation here.

**Example (verified — this compiles and builds cleanly with Next 16.2.11):**

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Shantell_Sans, Public_Sans } from 'next/font/google';
import './globals.css';

const shantellSans = Shantell_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-shantell',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-public',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Overlay Notes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${shantellSans.variable} ${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

**`subsets` is mandatory, not optional, given `preload` defaults to `true`.** Confirmed in the
validator: if `preload` is left at its default `true` and `subsets` is omitted, `next/font/google`
throws at build time: `Preload is enabled but no subsets were specified`. Always pass
`subsets: ['latin']` explicitly (matches the design's actual content language).

**Generated CSS variable shape (verified from the real build output):**
```css
.shantell_sans_xxx-module__className { font-family: Shantell Sans, Shantell Sans Fallback }
.shantell_sans_xxx-module__variable { --font-shantell: "Shantell Sans", "Shantell Sans Fallback" }
```
The variable already resolves to a font-name stack ending in a metric-adjusted local fallback
(`Shantell Sans Fallback`, sized to reduce CLS) — when porting the prototype's
`font-family:'Shantell Sans',cursive` declarations, append the *generic* fallback keyword after
the variable, e.g. `font-family: var(--font-shantell), cursive;`, to preserve the same generic
fallback intent the prototype had.

### Pattern 3: Porting `concept-1a.html`'s CSS to `app/globals.css`

**What:** Mechanical, near-1:1 copy of the `<style>` block's body, with exactly two edits:
1. Replace `font-family:'Shantell Sans',cursive` → `font-family: var(--font-shantell), cursive` (and the equivalent inside every `font:` shorthand that names `'Shantell Sans'`).
2. Replace `font-family:'Public Sans',sans-serif` → `font-family: var(--font-public), sans-serif`.

Everything else — the `:root` token block, the ruled-paper `background` on `body`, `.wrap`,
`.marker`, and every per-section rule — carries over unchanged. The `:root` block and ruled-paper
background are the only two rules Phase 1 actually needs to have correct (FOUND-04, FOUND-05);
the rest of the ported CSS becomes load-bearing once Phase 2 adds the matching markup, but there
is no harm in porting it all now since it targets classes that don't exist yet and does nothing
until Phase 2 uses them.

```css
/* app/globals.css — verbatim from concept-1a.html :root + body, fonts swapped */
:root{
  --paper:#f6f1e7; --rule:rgba(91,61,245,.10); --margin-red:rgba(214,72,72,.35);
  --purple:#5b3df5; --purple-dark:#3f27c9; --ink:#211d2e; --head:#1c1830;
  --body:#4a4560; --dark:#211d2e; --dark-muted:#a9a4c4; --accent-red:#d64848;
  --yellow:#ffc93c;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:var(--body);-webkit-font-smoothing:antialiased;
  font-family: var(--font-public), system-ui, sans-serif;
  background:
    repeating-linear-gradient(var(--paper) 0 31px, var(--rule) 31px 32px),
    linear-gradient(var(--paper),var(--paper));}
a{color:var(--purple);text-decoration:none}
a:hover{color:var(--purple-dark)}
h1,h2{margin:0}
img{max-width:100%;display:block}
.wrap{max-width:1120px;margin:0 auto;padding:0 40px}
.marker{font-family: var(--font-shantell), cursive}
/* ...remaining prototype selectors carry over verbatim, font-family swapped
   the same way, ready for Phase 2 to consume when it adds the matching markup */
```

**Anti-pattern to avoid:** Do not "clean up" or re-derive the ruled-paper gradient or the token
values while porting — CLAUDE.md and UI-SPEC both call these pixel-tested and final. Copy the
literal numbers.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|--------------|-----|
| Self-hosting Google Fonts + generating `@font-face`/preload/CLS-safe fallback metrics | A manual `fontsource`-style download-and-`@font-face` pipeline | `next/font/google` | It already downloads, subsets, hashes, and generates a metric-adjusted local fallback (`Shantell Sans Fallback`) that reduces layout shift on swap — verified present in the real build output above. Hand-rolling this would re-derive ascent/descent/line-gap overrides that Next already computes correctly. |
| Absolute-URL construction for canonical/OG/sitemap (Phase 3 consumers) | Per-file string concatenation of the domain | A single `lib/site-config.ts` `baseUrl` export, imported everywhere | FOUND-02's entire point — one edit changes the whole site's absolute URLs. Building this pattern now (even though nothing consumes it until Phase 3) avoids a later refactor. |
| Claim-provenance tracking | An ad-hoc code comment per copy string, checked manually and inconsistently | A single traceability artifact (table or typed assertion) enumerated once, covering every locked claim | CONT-01 requires every visible claim traceable — a scattered-comments approach can't be verified as *complete*; a single artifact can be diffed against the requirement list. |

**Key insight:** This phase has almost nothing that benefits from a third-party library beyond
what Next.js already ships — the actual risk here is process risk (breaking the pre-built test
harness, mis-loading fonts, letting a copy claim slip through unverified), not missing tooling.

## Common Pitfalls

### Pitfall 1 (highest severity): Installing Playwright in this phase flips the regression gate live before any section exists

**What goes wrong:** `scripts/test-gate.sh` self-skips on three conditions — no
`playwright.config.ts`, no installed `node_modules/.bin/playwright`, no `*.spec.ts` files.
`playwright.config.ts` and `tests/landing.spec.ts`/`tests/seo.spec.ts` **already exist in this
repo today**, before Phase 1 has even started. That means only the second condition (`@playwright/test`
not yet installed) is currently keeping the gate self-skipping. The moment Phase 1 runs
`bun add -d @playwright/test` (as CONTEXT.md's Test-harness section instructs), **all three
skip conditions become false simultaneously**, and `scripts/test-gate.sh` falls through to
`exec bunx playwright test` — a real run. `tests/landing.spec.ts` asserts real, external CTA
hrefs (Chrome Web Store, GitHub, Buy Me a Coffee), a hero `<img>`, in-page nav anchors, etc. —
none of which exist after Phase 1, which explicitly builds no visible sections. The suite will
fail essentially every test, and because `.planning/config.json` sets both
`workflow.test_command` (the regression gate) and `workflow.verifier: true`, this is very likely
to **halt** the phase's execute-phase gate.

**Why it happens:** CONTEXT.md's Test-harness instruction ("Install Playwright during this
phase") was written independently of the self-skip mechanics in `scripts/test-gate.sh` — and
`TESTING.md` (also required reading for this phase, also already committed) documents
`tests/landing.spec.ts` as **"Phase 2 (active from Phase 2 on)"**, i.e. the test harness's own
author expected the Playwright install to functionally activate in Phase 2, not Phase 1. These
two locked/pre-existing sources are in tension.

**How to avoid:** This needs an explicit decision recorded in the plan, not a silent
workaround — do not overwrite `scripts/test-gate.sh` or weaken `tests/landing.spec.ts` to route
around this (both are explicitly protected files). Two coherent options, either of which is
defensible and should be chosen deliberately by the planner (or bounced back through
`discuss-phase` if ambiguous):
  - **Option A:** Follow TESTING.md's documented intent over CONTEXT.md's literal Phase 1
    instruction — install `@playwright/test` as a devDependency and run `bunx playwright install
    chromium` in Phase 1 (satisfies "tooling is ready"), but make the actual `bun add -d
    @playwright/test` step (or the `bunx playwright install chromium` step) the very first task
    of **Phase 2** instead, keeping Phase 1's regression gate genuinely self-skipping the whole
    phase, exactly as TESTING.md states.
  - **Option B:** Install Playwright in Phase 1 as CONTEXT.md literally says, and treat the
    resulting `tests/landing.spec.ts` failures as an accepted, expected red state for this phase
    only — this requires configuring the phase's verification step to not halt on this specific,
    anticipated failure, which is unusual for GSD's normal halt-on-regression behavior and should
    be called out explicitly to the plan-checker/verifier rather than silently accepted.

Given `.planning/config.json` has `workflow.verifier: true` and no override for
phase-specific expected-red gates, **Option A is the lower-risk choice** and matches the
test harness author's own documented design (TESTING.md's per-spec coverage-map table). Flag
this prominently to the planner.

**Warning signs:** If the plan's last Phase 1 task is "install Playwright + verify `bunx
playwright test` passes," that is very likely to fail outright, since `tests/landing.spec.ts`
has no self-skip guards (unlike `tests/seo.spec.ts`, which is explicitly written to self-skip
per-assertion until its target metadata exists).

### Pitfall 2: The locked Shantell Sans weight list doesn't match what the CSS actually renders

**What goes wrong:** CONTEXT.md's locked weight list for Shantell Sans is "400, 600, 700, plus
italic 500," derived from reading the `<link>` href in `concept-1a.html` (line 37:
`ital,wght@0,400;0,600;0,700;1,500`). A direct `grep -n "Shantell Sans"` of the same file's
`<style>` block, however, shows the *actual* per-selector usage is: **weight 700 normal**
(`.brand span`, `.hero h1`, `.who h2`, `.band h2`, `.card .t`, `.diff h2`, support-card `h2`),
**weight 600 normal** (the "or whatever!" tip-chip label), and **weight 500 normal** —
not italic — in `.note-r`, `.note-b`, `.who .kicker`, `.origin p`, and the "every tip..." note
(5 separate rendered elements). Grepping the file for the literal word `italic` and for `<i>`
tags near any Shantell-Sans-styled element returns **zero matches** — Shantell Sans is never
actually set to `font-style: italic` anywhere in the rendered page. Weight 400 for Shantell Sans
is only referenced by the `.marker` class, which itself is never applied to any element in the
document body (also zero matches). Meanwhile, the `<link>`-declared italic 400 for **Public
Sans** *is* genuinely used — via the two `<i>anywhere</i>` / `<i>live page</i>` inline tags
inside `.diff .b` (which is styled `font:400 ... 'Public Sans'`), so that part of the locked
spec checks out.

In short: the locked spec's `400/600/700 normal + 500 italic` for Shantell Sans doesn't cover
weight 500 **normal**, which is the second-most-used weight in the file (5 elements), while it
requests an italic 500 combination that renders nowhere.

**Why it happens:** The `<link>` href in a hand-authored prototype is often a superset of what's
actually used (exactly the same pattern CONTEXT.md itself already identified and resolved for
Space Grotesk — declared, zero usages, dropped). The same audit wasn't run per-weight for
Shantell Sans specifically.

**How to avoid:** Load the superset — `weight: ['400','500','600','700']`, `style: ['normal',
'italic']` for Shantell Sans (8 `@font-face` declarations; verified this builds cleanly, see
Pattern 2). This is a strict superset of both the locked spec (covers italic 500) and the
grep-verified actual usage (covers normal 500/600/700). As established above, unused
`@font-face` declarations cost nothing at runtime — browsers only fetch the specific
weight/style file a rendered glyph needs. This resolves the discrepancy without contradicting
either reading of "the weights the design requires," and needs no new user decision.

**Warning signs:** If Phase 2 renders `.note-r`, `.note-b`, `.who .kicker`, or `.origin p` and
they visibly render in the wrong weight (browser font-matching substituting the nearest loaded
face), the font loader call is missing weight 500 normal.

### Pitfall 3: A naive banned-term substring scan will false-positive on required, locked copy

**What goes wrong:** CONT-02's banned-term list includes `accounts` and `sharing`. But CONT-08's
own locked support-section copy is *required* to contain the phrase **"no accounts, no ads,
nothing tracked"** — a literal substring match for `accounts` fires on this required negation.
Separately, CONT-03's certified privacy statement is **"nothing is collected, transmitted, sold,
or shared"** — the word `shared` is a different token from the banned term `sharing`, but a
scan using simple substring containment (rather than whole-word matching) on a stem like `shar`
would also false-positive here, flagging the certified, locked, must-not-be-reworded privacy
statement as a violation.

**Why it happens:** The banned-term list is written as a feature-exclusion list ("don't claim
these features exist"), not as a literal forbidden-character-sequence list — but the two
purposes look identical to a naive string scan.

**How to avoid:** Build the traceability/banned-term check as case-insensitive **whole-word**
matching (e.g. `\bsharing\b`, `\baccounts\b` — word-boundary regex, not `String.includes`), and
explicitly document the "no accounts" / "...sold, or shared" occurrences as reviewed, intended
exceptions in the traceability artifact rather than trying to make the scan avoid them
implicitly. Whole-word matching alone resolves the `shared` vs `sharing` case; the `accounts`
case needs an explicit documented exception even with whole-word matching, since "accounts" the
banned word and "accounts" in "no accounts" are the identical token — the distinguishing factor
is the negation ("no accounts"), which a term-existence scan cannot detect on its own. Recommend
a small human-reviewed allowlist of exact locked sentences (the CONT-03 privacy statement and
the CONT-08 support-section copy) that the scan is told to skip, plus a full scan of everything
else.

**Warning signs:** A traceability check that reports CONT-08's own required copy as a CONT-02
violation.

### Pitfall 4: Next.js rewrites `tsconfig.json` on first build/dev — author it to match, or accept the one-time mutation

**What goes wrong:** Hand-authoring `tsconfig.json` with `"jsx": "preserve"` (a value copied
from older Next.js scaffolds/tutorials) triggers Next's own auto-repair on the very first `next
build`/`next dev`: it prints a notice ("We detected TypeScript in your project and reconfigured
your tsconfig.json file for you") and force-sets `jsx` to `"react-jsx"` plus appends
`.next/dev/types/**/*.ts` to `include`. This was directly observed in this research session's
build.

**Why it happens:** Next 16 requires the React 19 automatic JSX runtime and enforces it at
build time regardless of what's in the file.

**How to avoid:** Author `tsconfig.json` with `"jsx": "react-jsx"` from the start (as given in
Pattern 1 above) to skip the notice entirely — functionally harmless either way, but a
first-build diff on a freshly-scaffolded file can be confusing if not expected.

**Warning signs:** `tsconfig.json` changes on disk after the very first `bun run build`/`bun run
dev`, with no corresponding git diff intent.

### Pitfall 5: `public/icon.png` in the design handoff is not the 128×128 the requirements describe

**What goes wrong:** `.planning/design-handoff/assets/icon.png` is actually **1254×1254px**
(confirmed via `file`), not the 128×128 ASSET-04 mentions. This is a Phase 2 concern (ASSET-04
is tracked to Phase 2 in REQUIREMENTS.md's traceability table), but since CONTEXT.md's
"Reusable Assets" note leaves the choice of "copy into `public/` this phase or Phase 2" open,
flag it now so whichever phase does the copy also resizes/exports at the actual usage size
(the prototype's `.brand img{width:34px;height:34px}` — a 1254px source will need real
resizing, not just an `<Image width={34} height={34}>` prop override, to avoid shipping an
unnecessarily large file for a 34px nav icon).

**How to avoid:** If Phase 1 copies these assets into `public/` now, do not treat `icon.png`'s
current dimensions as already correct — note it for whichever phase does the actual
`next/image` wiring (Phase 2, per PAGE-01/ASSET-04).

## Code Examples

### `lib/site-config.ts` (FOUND-02)
```ts
// lib/site-config.ts
export const siteConfig = {
  baseUrl: 'https://overlay-notes.kalebnim.dev',
} as const;
```

### `lib/content.ts` (CONT-06, CONT-07) — real strings, source-tagged

The 6 FAQ pairs below are extracted verbatim from `concept-1a.html`'s existing `FAQPage`
JSON-LD block (lines 24–33) — this is already the design handoff's canonical FAQ copy, so no
new writing is needed, only re-typing into a module with provenance tags. Each answer was
independently traced to its supporting line in `store/STORE-LISTING.md` or `README.md` this
session:

```ts
// lib/content.ts
export interface Faq {
  question: string;
  answer: string;
  /** Provenance: file + section this answer is verified against. */
  source: string;
}

export const faqs: Faq[] = [
  {
    question: 'How do I draw on a webpage in Chrome?',
    answer:
      'Install Overlay Notes, open the grab pill on any page, and draw directly over the content with the marker, shapes, arrows or text tools.',
    source:
      'store/STORE-LISTING.md "HOW TO USE" — "Grab the canvas to draw: click the green pill (or press Alt+Shift+E)"',
  },
  {
    question: 'Can I annotate a website and save my notes?',
    answer: 'Yes. Notes save automatically per URL in your browser and reappear when you return to the page.',
    source:
      'store/STORE-LISTING.md detailed description — "save per page, stay 100% local" / "reappear the next time you open that URL"',
  },
  {
    question: 'Is there an Excalidraw extension for Chrome?',
    answer:
      'Overlay Notes is an Excalidraw-style sketch canvas that draws on the live page instead of a separate blank canvas.',
    source:
      'store/STORE-LISTING.md "HOW IT\'S DIFFERENT" — "Excalidraw itself is a great whiteboard, but it\'s a blank canvas in its own tab... This puts that same canvas directly on the page."',
  },
  {
    question: 'Do my notes stay on the page when I scroll?',
    answer: 'Yes. Annotations pin to the content, not the screen, so they scroll with the page.',
    source: 'README.md "Features" — "Scroll-anchored drawings — a sketch placed beside a paragraph stays beside that paragraph as you scroll"',
  },
  {
    question: 'Are my notes private or stored anywhere online?',
    answer: 'Everything is stored locally in your browser. Nothing is collected, transmitted, sold, or shared.',
    source:
      'store/STORE-LISTING.md "PRIVACY" — "Everything stays on your device... Nothing is collected, transmitted, sold, or shared." (this sentence IS the CONT-03 certified privacy statement, verbatim except for capitalization at the sentence start — see Common Pitfall 3 on why case differences here are expected, not a wording violation)',
  },
  {
    question: 'Does it work offline?',
    answer: 'Yes. Overlay Notes runs entirely in your browser and works offline.',
    source: 'store/STORE-LISTING.md "PRIVACY" — "it works offline" / README.md "Works on any site... online and offline."',
  },
];

export const originStory = {
  text:
    'Built while cramming for NUS CS2030 (Programming Methodology II). I wanted to scribble on lecture notes in the browser the way I do on paper — arrows, question marks, "wait, why?" — so I made a marker that lives on top of the web.',
  /** The bold span in the prototype wraps "NUS CS2030 (Programming Methodology II)" —
   * Phase 2's JSX should reproduce that <b> wrapping directly (matching concept-1a.html),
   * rather than deriving it from this plain string. */
  source:
    'design-handoff/concept-1a.html .origin p (verbatim, this IS the design handoff\'s source of truth per CONTEXT.md); corroborated by README.md "Why I built this" — "This started while I was studying for NUS CS2030."',
} as const;
```

**Note on CONT-04 ("excalidraw chrome extension" verbatim phrase):** This phrase lives in the
"vs. Excalidraw" diff-column body copy — `The excalidraw chrome extension that draws on the
<i>live page</i> — not a blank canvas.` (`concept-1a.html` line 210) — which is **not** one of
the two content-module items CONTEXT.md requires (`faqs[]` and `originStory`). It's copy that
Phase 2 will hard-code directly into JSX for the "How it's different" section, matching the
prototype 1:1. The traceability artifact (below) needs to track this claim independently of
`lib/content.ts`, since it won't live in a typed module this phase.

### Traceability artifact — required claims and their exact source lines

This is the minimum set CONTEXT.md calls out by name; a complete artifact should cover every
sentence of visible copy once Phase 2 writes it, but these are the ones with verified source
lines available now:

| Claim (verbatim) | Source | Notes |
|---|---|---|
| "nothing is collected, transmitted, sold, or shared" | `store/STORE-LISTING.md` PRIVACY section, sentence 2 (certified Developer Dashboard text) | CONT-03. Must not be reworded/reordered anywhere it appears, including inside the FAQ answer above. |
| "excalidraw chrome extension" | `concept-1a.html` line 210, corroborated by `store/STORE-LISTING.md` "HOW IT'S DIFFERENT" | CONT-04. Case: appears lowercase in the design source — must appear lowercase per CONTEXT.md. |
| "free and always will be" | `concept-1a.html` line 228, corroborated by `store/STORE-LISTING.md` (implied by "$0" pricing / no paid tier anywhere in the store listing) | CONT-08. Not a literal STORE-LISTING.md quote — it's a paraphrase of the fact that the extension is free with no pricing tier; document this as a reasonable inference, not a verbatim match, since no line in STORE-LISTING.md uses this exact phrase. |
| "no accounts, no ads, nothing tracked" | `concept-1a.html` line 228, corroborated by `README.md` "Local-first & private — your notes live only in your browser" and `store/STORE-LISTING.md` "No account, no backend" | CONT-08. Contains the word "accounts" — this is the required, intentional exception documented in Common Pitfall 3. |
| Solo developer covers hosting/build costs | `concept-1a.html` line 228 ("I'm a solo developer covering the hosting and build costs myself") | CONT-08. This is new-to-the-landing-page framing not present verbatim in STORE-LISTING.md or README.md (both describe the extension, not the landing page's own hosting) — document as an author-supplied fact about the landing page itself, out of scope for extension-repo traceability. |

**CONT-08 reconciliation note (the "nothing tracked" ↔ Vercel Analytics tension):** Document in
the traceability artifact — not by rewording the locked copy — that Vercel Web Analytics
(installed this phase, live-reporting verified in Phase 4) is cookieless and collects only
aggregate page-view counts with no persistent identifiers, so "nothing tracked" is defensible
under a "no individual/personal tracking" reading. This is the artifact's job: a written
justification paragraph, not new visible copy.

### CONT-05 keyword targets (from `LANDING-PAGE-SEO-BRIEF.md` §9, for Phase 2's "at most once" check)

```
Primary:    draw on webpage · annotate webpage · web annotation chrome extension ·
            handwritten notes on webpage
Secondary:  website highlighter · study notes chrome extension · annotate articles ·
            active reading · mark up a web page · annotate research papers
Long-tail:  excalidraw chrome extension · draw on any website ·
            notes that scroll with the page · annotate a webpage and save it ·
            sketch on top of a website
```
`excalidraw chrome extension` is both a CONT-04 requirement and a CONT-05 keyword — one
occurrence in the diff-column copy satisfies both.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `next build`/`next dev` on webpack by default | Turbopack is the default bundler | Next 15→16 transition (confirmed: this session's `bun run build` output printed `▲ Next.js 16.2.11 (Turbopack)` with zero config) | No action needed — this is automatic, not a flag to set. Build/dev output messaging differs from older Next.js tutorials that show webpack output. |

**Deprecated/outdated:** `create-next-app`'s conflict-file allowlist has not grown to
accommodate common test-harness files (`playwright.config.ts`, `tests/`) — this is an ongoing
tool limitation, not a recent regression, confirmed by direct testing this session.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | "free and always will be" and "solo developer covering hosting/build costs" are acceptable as author-supplied landing-page framing rather than requiring a literal STORE-LISTING.md/README.md source line | Code Examples — Traceability artifact table | Low — these are true, verifiable facts about the project (no pricing tier exists; the author is in fact a solo dev), just not phrases that appear verbatim in the two named source files. If CONT-01's "traceable to a named line" is interpreted stricter than "traceable to a verifiable fact," these two claims would need either a new source document or a CONTEXT.md amendment. |
| A2 | Recommending Option A (defer the actual Playwright install to Phase 2) for Pitfall 1, rather than Option B (accept an expected red state in Phase 1) | Common Pitfalls #1 | Medium — this is a judgment call between two locked-seeming, mutually-inconsistent sources (CONTEXT.md's literal instruction vs. TESTING.md's documented intent). If the user intended CONTEXT.md's literal Phase 1 install regardless of the gate consequence, Option B would need explicit verifier configuration to not halt on this specific, anticipated failure — flagged for the planner/discuss-phase to confirm rather than decided unilaterally here. |

## Open Questions

1. **Does `lib/content.ts`'s `faqs[]` actually need to be "JSON-LD-ready" for Phase 3?**
   - What we know: CONTEXT.md and UI-SPEC.md both say the array "feeds both the visible FAQ
     (Phase 2) and JSON-LD (Phase 3) without drift." REQUIREMENTS.md's Out of Scope table and
     STATE.md's decision log both explicitly say **no `FAQPage` JSON-LD** ("Google removed FAQ
     rich results entirely on 2026-05-07... zero search value, permanent schema/visible-text
     sync obligation").
   - What's unclear: whether "JSON-LD (Phase 3)" in CONTEXT.md/UI-SPEC is stale language left
     over from before the FAQPage-JSON-LD decision was made, or whether it refers to something
     else (e.g. embedding FAQ content inside the `SoftwareApplication` node's `description`,
     which wouldn't need a special shape either).
   - Recommendation: Build `faqs[]` as the plain `{question, answer, source}[]` shape given
     above — sufficient for Phase 2's rendering and for CONT-06. Since REQUIREMENTS.md and the
     roadmap decision log are more specific and more recently authoritative than the general
     phrase in CONTEXT.md/UI-SPEC, treat "feeds JSON-LD" as non-binding; no FAQPage-schema-shaped
     fields need to be pre-built. If Phase 3's planner later finds an actual JSON-LD use for this
     array (not FAQPage), the current flat shape still supports it trivially.

2. **Which resolution of Pitfall 1 (Playwright-install timing) does the user actually want?**
   - What we know: both resolutions are internally consistent with one of the two source
     documents; neither is clearly "more locked" than the other since both CONTEXT.md and
     TESTING.md are pre-existing, committed artifacts for this phase.
   - What's unclear: whether the user who wrote CONTEXT.md's Test-harness section was aware of
     the exact self-skip mechanics traced in this research (i.e. that spec files already existing
     in the repo means the *only* remaining skip condition is the install itself).
   - Recommendation: surface this explicitly during planning (or a quick discuss-phase follow-up)
     rather than silently picking Option A — the cost of asking is one question, the cost of
     guessing wrong is a halted phase.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Bun | package install + script runner (CLAUDE.md) | ✓ | 1.3.5 | — |
| Node.js (used internally by `next build`/`next dev` even when invoked via `bun run`) | Next.js toolchain execution | ✓ | v22.23.1 | — |
| Internet access to `fonts.googleapis.com`/`fonts.gstatic.com` at build time | `next/font/google` self-hosting (fonts are fetched once, at build time, then cached/self-hosted) | ✓ (verified — build succeeded and downloaded real woff2 files this session) | — | — |
| Chromium (via `bunx playwright install chromium`) | Playwright E2E gate | Not yet installed in this repo | — | Standard `bunx playwright install chromium` install step; no fallback needed, this is a required one-time download |

**Missing dependencies with no fallback:** none — Chromium install is a standard, expected
one-time step, not a blocker.

## Security Domain

### Applicable ASVS Categories

This phase ships a fully static site with no forms, no authentication, no user input, and no
server-side data handling — most ASVS categories are not applicable yet (they become relevant,
if ever, only if a future milestone adds dynamic behavior). What's relevant to *this specific
phase*:

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth surface exists or is planned |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access-controlled resources |
| V5 Input Validation | No | No user input is accepted anywhere in this phase (content is 100% build-time-authored in `lib/content.ts`) |
| V6 Cryptography | No | Nothing to encrypt |
| V14 Configuration / Dependency Management | Yes | Package Legitimacy Audit above; pin exact versions in `package.json` (not caret ranges for the core stack — CLAUDE.md already mandates deliberate pinning for `next`/`typescript` specifically to avoid an accidental major-version jump) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Supply-chain risk from a typosquatted/hallucinated package name | Tampering | Package Legitimacy Audit above — every package this phase installs is a well-known, high-download, officially-repo'd package; no exotic/unknown packages introduced |
| Future risk (Phase 3, not this phase): `dangerouslySetInnerHTML` for JSON-LD script tags rendering unescaped user input | Tampering/Injection | Not a concern in Phase 1 — `lib/content.ts`'s strings are 100% static/author-supplied, never derived from any request, cookie, query param, or third-party fetch, so there is no injectable input surface even once Phase 3 serializes this data into a `<script type="application/ld+json">` tag |

## Sources

### Primary (HIGH confidence)
- `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json`, `get-google-fonts-url.js`, `validate-google-font-function-call.js` (direct inspection of the installed `next@16.2.11` package, this session) — exact Shantell Sans/Public Sans weight/style/subset data and the cartesian-product font-loading mechanics.
- Direct `bunx create-next-app@latest .` run against a directory seeded with this repo's actual conflicting files (this session) — confirmed the exact conflict-file list and refusal behavior.
- Direct manual scaffold + `bun run build` (this session) — confirmed the 5-file minimal Next 16 App Router + TypeScript setup compiles, and that `tsconfig.json` is auto-mutated on first build.
- `npm view next/react/react-dom/typescript/@types/node/@types/react/@types/react-dom/@playwright/test/@vercel/analytics/@vercel/speed-insights version` (direct registry query, this session) — current versions.
- `gsd-tools query package-legitimacy check` (this session) — per-package verdicts and signals, reproduced in the Package Legitimacy Audit table.
- Direct `grep` of `.planning/design-handoff/concept-1a.html` (this session) — exact font-weight/style usage per selector, exact FAQ/origin-story text, banned-term/"accounts"/"shared" collision discovery.
- `/Users/kalebnim/Documents/GitHub/overlay-notes/store/STORE-LISTING.md` and `README.md` (direct read, this session) — source lines for every FAQ answer and the origin story.
- `.planning/phases/01-foundation-verified-copy/01-CONTEXT.md`, `01-UI-SPEC.md`, `.planning/REQUIREMENTS.md`, `.planning/STATE.md`, `TESTING.md`, `playwright.config.ts`, `scripts/test-gate.sh`, `tests/landing.spec.ts`, `tests/seo.spec.ts` (direct read, this session) — locked decisions, requirement IDs, and the exact self-skip mechanics traced for Pitfall 1.

### Secondary (MEDIUM confidence)
- `/vercel/next.js` (Context7, canary-branch docs) — general `next/font/google` API shape (weight/style/variable/axes option documentation), cross-checked against the actually-installed package's validator source above rather than trusted alone.

### Tertiary (LOW confidence)
- None used unverified this session — every claim above traces to either a direct file read, a direct command run, or an official-docs fetch.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified via `npm view`, several installed and built locally.
- Architecture (scaffolding + font loading): HIGH — verified via an actual `bun run build` against the exact package versions, not just documentation.
- Pitfalls: HIGH for #1–#4 (each traced to a specific file/command in this repo or this session's build output), MEDIUM for #5 (asset dimension confirmed via `file`, but its resolution is explicitly deferred to whichever phase does the copy).

**Research date:** 2026-07-24
**Valid until:** 30 days for the stack-version claims (Next.js/React/TypeScript move fast — re-verify versions if planning is delayed); the font-loading mechanics and scaffolding-conflict findings are structural to `next@16.2.11`'s installed code and won't drift within a patch range.

<!-- GSD:project-start source:PROJECT.md -->

## Project

**Overlay Notes — Landing Page**

The marketing and SEO home for **Overlay Notes**, a Chrome MV3 extension that overlays a
transparent, Excalidraw-style sketch canvas on any webpage so you can handwrite notes on
top of what you're reading. This is a standalone Next.js site deployed to Vercel at
`overlay-notes.kalebnim.dev` — separate from the extension repo. It exists to rank in
Google for long-tail annotation queries, to render a proper preview when the project is
shared on LinkedIn, and to convert visitors into Chrome Web Store installs.

**Core Value:** A visitor who lands here from a search or a shared link immediately understands what
Overlay Notes does and clicks through to install it — and the page is discoverable enough
that those visitors arrive in the first place.

### Constraints

- **Tech stack**: Next.js App Router + Bun — author preference; no npm. Deployed on Vercel.
- **Design fidelity**: Recreate concept-1a pixel-faithfully. Colors, typography, spacing, rotations, and the hand-drawn treatment are all intentional and final.
- **Domain**: `overlay-notes.kalebnim.dev`, a subdomain of the author's existing site. All absolute URLs derive from a single base-URL constant.
- **Claim discipline**: Every visible claim traceable to `store/STORE-LISTING.md` or `README.md` in `../overlay-notes`. The privacy statement — "nothing is collected, transmitted, sold, or shared" — is a certified Developer Dashboard statement and must stay verbatim.
- **Performance**: Core Web Vitals are a ranking factor and the hero is a 1280×800 image. LCP must not regress; no autoplay media.
- **Accessibility**: Every `<img>` needs descriptive, keyword-natural alt text. Decorative SVG marked `aria-hidden`.
- **No keyword stuffing**: each target term once, in a natural sentence. Google's spam policies and Chrome Web Store policy both penalize it.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | `16.2.11` (npm `latest` as of 2026-07-23) | App Router framework, Metadata API, `next/font`, `next/image`, `next/og` | Confirmed current stable on the npm registry. Ships the exact APIs this page needs natively — metadata objects, file-convention `robots.ts`/`sitemap.ts`, `next/font/google` self-hosting — with zero extra config. Do not pin to 15.x; there is no reason to run an older major on a greenfield project. |
| React | `19.2.8` | UI runtime | Matches Next 16's peer requirement. No App Router feature used here needs anything beyond what 19 already ships (no experimental APIs required). |
| TypeScript | `^5.9` (project-level pin; latest on npm is a `7.x` prerelease line — see note) | Type safety for metadata objects, `MetadataRoute` types | `npm view typescript version` currently resolves to a `7.0.2` tag, but this is a fresh major still stabilizing on the registry's `latest` dist-tag rotation; Next.js's own toolchain and `create-next-app` templates target the 5.x line. Pin `~5.9.x` deliberately rather than trusting whatever `latest` resolves to on install day — verify against Next.js's own `package.json` peerDependencies before locking. |
| Bun | latest (already installed) | Package manager + script runner | Author preference (global constraint), and works well in that role — see the dedicated Bun section below for the one thing NOT to do with it. |

### Rendering Mode — Decision

- This page reads no request data (no cookies, headers, searchParams, or dynamic fetches), so the App Router already fully prerenders it at build time as static HTML by default — `force-static` would be a no-op restating the framework's own default.
- `output: 'export'` (full static HTML export) is the wrong target for a Vercel deployment: it disables `next/image`'s on-demand optimization (forcing `unoptimized: true`), disables the `next/og` `ImageResponse` route handler pattern, and gets you nothing Vercel doesn't already give you for a normal Next.js deployment — Vercel prerenders static routes to the CDN edge automatically and only pays for a function invocation on genuinely dynamic routes, of which this project has none.
- **Verdict:** ship it as a normal Next.js project (`next build`, no `output` override). Vercel detects the framework automatically and serves the prerendered route from its CDN with zero function cold-starts.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@vercel/analytics` | `2.0.1` | Page-view analytics | Import `Analytics` from `@vercel/analytics/next` (the Next.js-specific entry point — not `/react`) in the root layout. Confirmed via Vercel's current quickstart docs (last updated 2026-06-08) that `nextjs-app` (App Router) projects use the `/next` subpath. |
| `@vercel/speed-insights` | `2.0.0` | Core Web Vitals / Speed Insights reporting | Same pattern — `SpeedInsights` from `@vercel/speed-insights/next` in the root layout. Directly required by PROJECT.md's requirements list. |
| `next/font/google` (built into `next`) | bundled with Next 16 | Self-hosted Shantell Sans + Public Sans | See Fonts section below — no separate package needed. |
| `next/image` (built into `next`) | bundled with Next 16 | Hero screenshot (LCP element) | See Images section below. |
| `next/og` → `ImageResponse` (built into `next`) | bundled with Next 16 | Available for OG image generation, **but not recommended for this page** — see OG Image Generation decision below. |

## Metadata API — Exact Shape

- Relative paths in `openGraph.images`, `twitter.images`, and `alternates.canonical` are resolved against `metadataBase` into fully-qualified absolute URLs at build time. `/og-image.png` + `metadataBase: new URL('https://overlay-notes.kalebnim.dev')` → `https://overlay-notes.kalebnim.dev/og-image.png` in the rendered `<meta property="og:image">` tag. This satisfies the SEO brief's mandatory-absolute-URL requirement without hand-writing the domain into every field.
- If a field is given an already-absolute URL, `metadataBase` is ignored for that field (it never overrides an explicit absolute URL).
- **Do not skip `metadataBase`.** Without it, Next.js throws a build error the moment any metadata field uses a relative URL — so this isn't optional polish, it's required for the file to compile once you use relative asset paths.

## JSON-LD Structured Data — Recommended Pattern

## OG Image Generation — Decision

- `ImageResponse` has a hard **500KB total bundle budget** (JSX + CSS + fonts + images combined) per the official docs. `annotate-hero.png` alone is 278KB; add a self-hosted Shantell Sans weight for the headline text and you are already close to the ceiling before accounting for compression overhead of embedding a `<img>`-referenced binary asset in a Satori render tree. It's *possible* to keep this under budget with aggressive re-compression, but there is no upside to threading that needle for an image that is generated exactly once and never changes.
- `ImageResponse` renders through Satori, which supports flexbox and a **subset** of CSS — no CSS Grid, and cropping an image to an exact region (this card needs a specific crop of the 1280×800 screenshot, not the whole thing) means fighting `object-fit`/`overflow: hidden` behavior inside a renderer that wasn't built for photographic compositing. A one-time export from a real image tool (or a one-off Node script using `sharp`) gets pixel-exact control in less time than debugging Satori's layout subset.
- This page has **one** OG image, for **one** static route, that never varies per-request. The entire value proposition of `ImageResponse` — generating images dynamically per dynamic route (e.g., one per blog post) — doesn't apply here. Using it anyway adds a runtime function (even if edge-cached) for something that could be a zero-cost static file.

## Fonts — `next/font/google`

## Images — `next/image` for the Hero

- Automatic AVIF/WebP re-encoding and responsive `srcset` generation mean the browser downloads a file sized to its actual rendered width (roughly half the 1120px content column on desktop, full-bleed on mobile ≤760px) rather than always fetching the full 1280×800 source PNG (278KB) regardless of viewport.
- `priority` on this single instance disables lazy-loading and adds a `<link rel="preload">` for it, which is exactly the LCP optimization Core Web Vitals rewards — and PROJECT.md explicitly calls out "LCP must not regress" as a constraint.
- Required `width`/`height` (or `fill` inside a sized wrapper) props eliminate the CLS that a raw `<img>` would risk if not equally disciplined about explicit dimensions — `next/image` makes this mandatory rather than a habit you have to remember.

## Styling — Decisive Recommendation: Plain Global CSS, Not Tailwind, Not CSS Modules

- The prototype is **finished, pixel-tested CSS** — every rotation (`rotate(-1.5deg)`, `rotate(2deg)`, alternating `nth-child(odd/even)` rotations), every hard-offset shadow (`3px 4px 0 var(--ink)`), the `repeating-linear-gradient` ruled-paper background, and the exact `clamp()` responsive H1 sizing are already correct and already reviewed as "final" per PROJECT.md's fidelity constraint. Porting this to global CSS is a mechanical translation: copy the `<style>` block, swap font-family values for the `next/font` CSS variables, done. Every value carries over 1:1 with the class names unchanged.
- Rewriting the same rules as Tailwind utility classes means translating one-off, non-scale values (`rotate(-1.5deg)`, `3px 4px 0 #211d2e`, `31px`/`32px` ruled-paper stops, `clamp(38px,5vw,54px)`) into Tailwind's arbitrary-value bracket syntax (`rotate-[-1.5deg]`, `shadow-[3px_4px_0_#211d2e]`, `bg-[repeating-linear-gradient(...)]`) almost everywhere, since none of these are on Tailwind's default scale. At that point Tailwind is contributing zero design-system value (there's no reuse across components to normalize — it's one page, most elements appear once) while adding a translation step where a copy-paste error can silently change the fidelity the whole exercise is trying to preserve.
- **CSS Modules** is a reasonable middle ground (scoped class names, same near-verbatim CSS) but buys nothing over global CSS on a genuinely single-page site with no naming collisions to worry about (no design system consumed by other routes/components). It adds a file-per-section indirection for zero collision risk avoided. Not wrong, just unnecessary ceremony here.
- The design tokens are already expressed as CSS custom properties in the prototype (`--paper`, `--purple`, `--ink`, etc.) — this is already the idiomatic "vanilla CSS design system" pattern; there's no gap Tailwind's `@theme` config would be filling that isn't already solved.

## Robots & Sitemap — File Conventions

## Analytics Integration

## Bun Compatibility — What Actually Works, What Doesn't

- `bun install` works cleanly for a Next.js project — `node_modules` produced is identical regardless of which package manager wrote it, since Next.js doesn't care who installed its dependencies. This is the safe, well-trodden 90% of "using Bun with Next.js."
- Friction shows up specifically when the **Bun runtime** (not just Bun-as-installer) is asked to execute Next's own build/dev process — confirmed via multiple open `oven-sh/bun` GitHub issues as recent as Next.js 16.0.x: TypeScript resolution failures in Bun workspaces (`bun#25014`), module-resolution ("Could not resolve") errors on `next build` under `bun --bun` (`bun#24829`, `bun#26244`). These are the `--bun` flag failure mode specifically — i.e., `bun --bun run dev`, which forces Bun to *replace* Node as the JS runtime for the invoked script, not plain `bun run dev` calling out to the ordinary `next` binary under Node.
- **Escape hatch / recommended `package.json` scripts:** keep `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"` as normal, and invoke them with `bun run dev` / `bun run build` — this uses Bun purely as the script runner/installer, and the underlying `next` process still runs under Node's own resolution and API surface, sidestepping every issue above. Do not add `--bun` to these scripts.
- **Production is unaffected regardless:** Vercel's build platform runs `next build` under its own managed Node.js build image — Bun is a local-dev/CI convenience choice only, and has zero bearing on how the deployed build actually executes.

## Vercel Custom Subdomain — `overlay-notes.kalebnim.dev`

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Default static rendering, plain Vercel deploy | `output: 'export'` (static HTML export) | Only if deploying to a host with no Next.js-aware server/CDN (e.g., a plain static bucket, GitHub Pages). Since this project explicitly moved *to* Vercel to get `next/image` optimization and Analytics (per PROJECT.md's own Key Decisions), exporting would throw away the reason for the migration. |
| Static, pre-composited `public/og-image.png` | `next/og` `ImageResponse` in `opengraph-image.tsx` | Use `ImageResponse` if the OG card needs to vary per-route or per-request (e.g., a blog with one card per post) — not the case here, where there is exactly one route and one card, generated once. |
| Plain global CSS ported from the prototype | Tailwind v4 | Reasonable if this repo were expected to grow into a multi-page site with a shared design system across many components — explicitly out of scope per PROJECT.md ("Blog, changelog, docs site" is listed under Out of Scope). |
| `next/image` for the hero | Plain `<img>` | Only sensible if deployed somewhere without Vercel's Image Optimization API (see `output: 'export'` note above) — otherwise strictly worse for LCP with no compensating benefit. |
| Bun for install + script running only | `bun --bun run dev/build` (Bun as the actual JS runtime for Next's CLI) | Not recommended today given the open compatibility issues cited above; revisit once `oven-sh/bun` issues #24829/#25014/#26244 are closed upstream. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| `output: 'export'` | Disables `next/image` optimization (forces `unoptimized`) and the `next/og` route pattern; throws away the exact Vercel-specific wins PROJECT.md cites for choosing Vercel over GitHub Pages. | Default Next.js build, deployed natively to Vercel. |
| `next/script` for JSON-LD | Built for controlling *executable* JavaScript loading strategy (`beforeInteractive`/`afterInteractive`/`lazyOnload`); structured data is inert JSON, not a script to schedule. Next's own docs explicitly call this out as the wrong component. | Native `<script type="application/ld+json">` with `dangerouslySetInnerHTML`. |
| `next/og` `ImageResponse` for this page's single static OG card | 500KB combined bundle budget is a real constraint against a 278KB source screenshot plus custom font weights; Satori's CSS subset makes precise photographic cropping/compositing harder than it needs to be for an image generated exactly once. | Pre-composited static `public/og-image.png`. |
| Tailwind v4 (or any utility-CSS framework) for this port | Every distinctive value in the design (arbitrary rotation degrees, hard-offset shadows, ruled-paper gradient stops) is off Tailwind's default scale, forcing constant arbitrary-value syntax with no design-system reuse to justify the translation risk on a single, already-finished page. | Global CSS ported near-verbatim from `concept-1a.html`. |
| `bun --bun run dev` / `bun --bun run build` | Multiple open `oven-sh/bun` issues on Next.js 16.x show module-resolution and TypeScript-detection failures when Bun's runtime (not just its installer/script-runner) executes Next's own CLI. | `bun run dev` / `bun run build` calling the ordinary `next` binary, which still executes under Node. |
| Guessing a generic `cname.vercel-dns.com` CNAME value from memory | Vercel now issues a project-specific CNAME target (per current docs); using a stale/generic value risks a domain that never verifies. | Copy the exact CNAME value shown in that project's own Domains settings panel at setup time. |

## Stack Patterns by Variant

- Add it to `app/sitemap.ts`'s returned array and reconsider whether `app/robots.ts`'s single root-only `sitemap` reference still models the site correctly.
- Because `PROJECT.md` currently locks privacy-policy hosting to GitHub Pages, this is speculative only — do not build it preemptively.
- That is the actual use case `next/og`'s `ImageResponse` earns its keep for — revisit the OG Image Generation decision above at that point, since it would then be generating more than one static, unchanging card.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|------------------|-------|
| `next@16.2.11` | `react@19.2.8`, `react-dom@19.2.8` | Confirmed current peer versions on npm; do not mix Next 16 with a React 18 pin. |
| `@vercel/analytics@2.0.1` | Next.js App Router (`nextjs-app` framework target) | Use the `/next` subpath import specifically, not `/react` — the `/react` entry is for non-Next.js React apps (CRA, Vite+React) per Vercel's own framework-specific docs branching. |
| `@vercel/speed-insights@2.0.0` | Next.js App Router | Same `/next` subpath pattern as Analytics. |
| `next/font/google` (Shantell Sans, Public Sans) | Next 16's bundled font subsystem | No version concern — this is part of the `next` package itself, not a separate dependency to version-pin. |

## Sources

- `/vercel/next.js` (Context7, MEDIUM per the classify-confidence seam's ceiling for Context7-sourced docs, though content is drawn from Next.js's own current `canary`-branch docs) — `generateMetadata`/`metadataBase`/OpenGraph/Twitter shapes, `ImageResponse`/`next/og` API and 500KB bundle limit, `app/robots.ts`/`app/sitemap.ts` file conventions, JSON-LD guide, `next/font` weight/style/axes options.
- `npm view next / react / typescript / tailwindcss / @vercel/analytics / @vercel/speed-insights version` and `next dist-tags` (direct npm registry query, HIGH — primary source, checked same day as this research) — confirmed `next@16.2.11` is the current `latest` dist-tag (published 2026-07-23), and current versions of all supporting packages.
- `vercel.com/docs/domains/working-with-domains/add-a-domain` (WebFetch, HIGH — official Vercel docs, page timestamp 2026-02-27) — CNAME-for-subdomain vs A-record-for-apex, TXT-verification-only-when-cross-account, project-specific CNAME target format.
- `vercel.com/docs/analytics/quickstart` (WebFetch, HIGH — official Vercel docs, page timestamp 2026-06-08) — confirmed `@vercel/analytics/next` is the correct subpath for `nextjs-app` (App Router) specifically.
- WebSearch: `github.com/oven-sh/bun` issues #24829, #25014, #26244 (MEDIUM per the classify-confidence seam, verified/cross-checked across multiple independent hits) — Bun-runtime-specific (not Bun-as-installer) friction with Next.js 16.x.
- WebSearch: `arrowtype.com/custom/shantell-sans`, `fonts.google.com/specimen/Shantell+Sans` (MEDIUM, cross-checked across two independent sources) — Shantell Sans's 5 variable axes (wght/ital/BNCE/INFM/SPAC) and their default values.
- `.planning/design-handoff/concept-1a.html` (primary project artifact) — exact existing `<head>` SEO block, JSON-LD payloads, and full CSS to port verbatim.

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

<!-- Non-GSD section: hand-authored, keep outside GSD-managed markers so regeneration preserves it. -->
## Testing — Playwright E2E (read before scaffolding or building sections)

This repo uses **Playwright (CLI, bundled Chromium)** as its E2E gate, wired into the
GSD run via `workflow.test_command = bash scripts/test-gate.sh` and `workflow.verifier = true`.
Passing tests are credited by the verifier as behavioral evidence, converting would-be
human-verify items into machine-`VERIFIED` ones. See `TESTING.md` for the full coverage map.

A test harness already exists in the repo before the app is scaffolded:
`playwright.config.ts`, `scripts/test-gate.sh`, `tests/landing.spec.ts`, `tests/seo.spec.ts`, `TESTING.md`.

**Rules:**
- **Preserve the harness when scaffolding Next.js (Phase 1).** Do NOT delete or overwrite the
  files listed above. If `create-next-app` refuses because the directory is non-empty, scaffold
  into a temp dir and merge, or add Next deps manually (`bun add next react react-dom`, `bun add -d typescript @types/react @types/node`) — but keep `playwright.config.ts`, `scripts/`, and `tests/`.
- **Install Playwright during Phase 1 setup:** `bun add -d @playwright/test @types/node` then
  `bunx playwright install chromium`. Until installed, `scripts/test-gate.sh` self-skips (harmless),
  but the tests can only start crediting criteria once it's installed.
- **Browsers:** `bunx playwright` with bundled Chromium only. Never system Chrome, never the Playwright MCP server.
- **Package scripts:** keep `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"`, and add `"test": "playwright test"` — but the GSD gate calls `scripts/test-gate.sh`, not `bun test`.
- **Phase 2:** make `tests/landing.spec.ts` pass (give nav-targeted sections real `id`s; satisfy the CTA/alt/responsive/reduced-motion/focus assertions). Extend it with per-section presence checks — never weaken the locked-URL or invariant assertions.
- **Phase 3:** the self-guarding `tests/seo.spec.ts` tests must actually assert (not silently skip) once metadata, JSON-LD, robots, and sitemap exist.
- **Test names are behavior descriptions**, not "screenshot"-style placeholders; keep alt-text and copy claims consistent with `../overlay-notes/store/STORE-LISTING.md`.

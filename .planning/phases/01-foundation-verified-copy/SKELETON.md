# Walking Skeleton — Overlay Notes Landing Page

**Phase:** 1
**Generated:** 2026-07-24

## Capability Proven End-to-End

> One sentence: the smallest user-visible capability that exercises the full stack.

A visitor loads `/` (served by `bun run dev`, produced by a passing `bun run build`) and sees
the ruled-paper background rendered with the two self-hosted typefaces (Shantell Sans + Public
Sans) and the design tokens applied — the pixel-faithful design foundation every later section
is built on.

> Note: this is a **static marketing site** — there is no database, no API, no auth, and no
> user input anywhere in the project. The "full stack" here is: Next.js App Router build →
> self-hosted fonts + global CSS → prerendered static HTML served locally. The skeleton proves
> the build/render pipeline and the locked design system, not a data round-trip that does not
> exist.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.2.11 App Router + React 19.2.8, TypeScript 5.9.3, Turbopack (default) | Locked by `.claude/CLAUDE.md`; ships Metadata API, `next/font`, `next/image`, `next/og` natively for the SEO work in Phase 3. Verified to build via `bun run build` in RESEARCH. |
| Scaffold method | Manual (hand-authored config + `bun add`), NOT `create-next-app` | `create-next-app` refuses against this non-empty repo (conflicts on `TESTING.md`/`playwright.config.ts`/`scripts/`/`tests/`) with no bypass flag (RESEARCH Pattern 1). |
| Package manager / runner | Bun as installer + script runner only; scripts are plain `next dev/build/start`, never `--bun` | `.claude/CLAUDE.md`; open bun issues #24829/#25014/#26244 break `next` under the Bun runtime. |
| Data layer | None — content is a build-time TypeScript module (`lib/content.ts`) | No CMS, DB, or runtime fetch; the page reads no request data, so it fully prerenders as static HTML. |
| Auth | None | No accounts, no sessions, no protected resources — the extension itself is account-free and the site is read-only marketing. |
| Styling | Plain global CSS ported verbatim from `concept-1a.html`, tokens as `:root` custom properties | `.claude/CLAUDE.md` (not Tailwind, not CSS Modules) — every distinctive value is off any utility scale; single finished page, no reuse to justify a framework. |
| Fonts | `next/font/google` self-hosted, superset weights `['400','500','600','700'] × ['normal','italic']`, exposed as `--font-shantell` / `--font-public` | Self-hosting removes the render-blocking third-party font request (FOUND-03); superset covers both the prototype `<link>` and grep-verified actual usage at zero runtime cost (RESEARCH Pattern 2 / Pitfall #2). Space Grotesk dropped (loaded-but-unused). |
| Absolute-URL source | Single `siteConfig.baseUrl` in `lib/site-config.ts` (`https://overlay-notes.kalebnim.dev`, no trailing slash) | FOUND-02 — changing the domain is a one-line edit; consumed by canonical/og/sitemap/JSON-LD in Phase 3. |
| Deployment target | Vercel (attached in Phase 4, custom domain last) | RESEARCH / ROADMAP — default static prerender served from Vercel's CDN; custom domain attached only after content + SEO are final so the domain is never indexed half-built. |
| Directory layout | `app/` (layout, page, globals.css) + `lib/` (site-config, content); `public/` for assets (Phase 2); `scripts/` for the harness + claim-verify script | Next 16 App Router convention; flat and small — one page, two content modules. |

## Stack Touched in Phase 1

- [x] Project scaffold (Next.js 16 App Router, TypeScript, Bun install/runner) — Plan 01-01 Task 1
- [x] Routing — one real route: `/` (`app/page.tsx`) — Plan 01-01 Task 3
- [ ] Database — **N/A**: static site, no DB read/write exists or is planned (see note above)
- [x] UI — a rendered page proving tokens + both self-hosted fonts + ruled-paper background — Plan 01-01 Tasks 2–3
- [x] Local full-stack run command — `bun run dev` serves `/`; `bun run build` exits 0 (deployment itself is Phase 4)

## Out of Scope (Deferred to Later Slices)

> Explicit — this list prevents future phases from re-litigating Phase 1's minimalism.

- All 10 visible sections (nav, hero, polaroid screenshot, "Who it's for", "What you can do"
  dark band, "How it's different" three columns, origin-story card, FAQ, support/donation card,
  footer) → **Phase 2**.
- Responsive behavior (360px/760px), reduced-motion squiggle guard, focus states, LCP hero
  image, `public/` asset copy → **Phase 2**.
- `<head>` metadata, canonical/OG/Twitter tags, `SoftwareApplication` JSON-LD, robots.txt,
  sitemap.xml, OG image → **Phase 3**.
- Public GitHub repo, Vercel deploy, custom domain `overlay-notes.kalebnim.dev`, Analytics +
  Speed Insights reporting real data → **Phase 4**. (`@vercel/analytics` + `@vercel/speed-insights`
  are installed and wired in the layout this phase, but verifying live data is Phase 4.)
- Playwright install + activating the E2E gate → **Phase 2's first task** (installing it in Phase 1
  would flip the regression gate live against Phase-2 assertions and halt this phase — RESEARCH
  Common Pitfall #1). The harness files stay untouched and the gate stays inert this phase.

## Subsequent Slice Plan

Each later phase adds one vertical slice on top of this skeleton without altering its
architectural decisions:

- **Phase 2:** The complete marker-on-paper page — every visible section built to `concept-1a`
  fidelity, working nav anchors, responsive at 360/760px, reduced-motion guard, keyboard focus.
  (Installs Playwright and activates the E2E gate as its first step.)
- **Phase 3:** SEO metadata, `SoftwareApplication` JSON-LD, robots/sitemap, and a static
  1200×630 OG image — all absolute URLs derived from `siteConfig.baseUrl`.
- **Phase 4:** Public repo, Vercel deploy, custom domain attached last, Analytics + Speed
  Insights confirmed reporting from production.

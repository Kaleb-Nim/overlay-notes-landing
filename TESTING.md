# Testing — Playwright E2E gate

The landing page is verified end-to-end with **Playwright (CLI, bundled Chromium)**.
This suite is wired into the GSD autonomous run so that passing tests count as
behavioral evidence — the verifier credits a covered success criterion as
machine-`VERIFIED` instead of raising a human-verify item, which is what lets the
overnight run cross phase boundaries with less manual sign-off.

## How it plugs into GSD

- `.planning/config.json` → `workflow.test_command` = `bash scripts/test-gate.sh`.
- `.planning/config.json` → `workflow.verifier` = `true` (required — the verifier is
  what credits passing tests toward success criteria).
- GSD runs the command in two places every phase:
  - **execute-phase regression gate** — a failing suite HALTS the phase.
  - **verify-phase** — a passing suite is recorded as behavioral evidence.
- `scripts/test-gate.sh` is **self-skipping**: it exits 0 until `playwright.config.ts`,
  an installed `@playwright/test`, and at least one `tests/*.spec.ts` all exist — so
  Phase 1 (scaffold only) is never falsely blocked.

## Setup (done during Phase 1 / early Phase 2)

```bash
bun add -d @playwright/test @types/node
bunx playwright install chromium      # bundled Chromium only — NOT system Chrome
```

Do **not** use the Playwright MCP server; drive browsers via `bunx playwright`.

## Run locally

```bash
bunx playwright test                  # all viewports
bunx playwright test --project=mobile # 360px only
bunx playwright show-report
```

Playwright boots `bun run dev` itself (see `webServer` in `playwright.config.ts`).

## Coverage map (spec ⇄ success criteria)

### `tests/landing.spec.ts` — Phase 2 (active from Phase 2 on)
Keyed on the locked contract, so it survives markup changes:

| Assertion | Phase 2 success criterion |
|---|---|
| Primary CTA → Chrome Web Store `…/ogekdbffoapphpabjphfgeppildcleck` | SC#3 |
| Secondary CTA → `github.com/kaleb-nim/overlay-notes` | SC#3 |
| Support CTA → `buymeacoffee.com/kalebnim` | SC#3 |
| Footer links the GitHub Pages privacy policy | SC#1 |
| No `href="#"` / empty dead links (tip chips) | SC#3 |
| Every in-page nav anchor resolves to a real element | SC#2 |
| No horizontal scroll at 360px (also checked at 760/1280) | SC#4 |
| Every `<img>` has descriptive alt, never "screenshot" | SC#5 |
| No image served via a `../` reference | SC#5 |
| LCP hero image preloaded (`next/image` `priority`) | SC#5 |
| Squiggle animation suppressed under `prefers-reduced-motion` | SC#5 |
| Keyboard focus lands on interactive elements with a visible indicator | SC#5 |

### `tests/seo.spec.ts` — Phase 3 (self-guards; skips until built, then asserts)
`<title>` ≤60, description ≤160, `lang="en"`, absolute canonical + `og:image` on
`overlay-notes.kalebnim.dev`, no `kaleb-nim.github.io` in `<head>`, `SoftwareApplication`
JSON-LD with no `aggregateRating`/`review` and no `FAQPage`, and `robots.txt`/`sitemap.xml`
returning 200. Each test skips cleanly if its feature isn't on the page yet — the Phase 3
executor must confirm none of them **silently skip** once metadata is built.

## For the executor completing this suite

- **Extend, don't weaken.** When you finalize section markup, add per-section presence
  assertions and un-guard the SEO tests — but keep the locked-URL and invariant checks.
- Add `id`s to the sections the nav targets so the "nav anchor resolves" test passes.
- Visual fidelity to `concept-1a` that a human still judges (hand-drawn feel, tape/polaroid
  treatment) stays a human item — do not fake it with a pixel-diff. Prefer computed-style
  assertions for the *measurable* parts (rotations, hard-offset shadow, ruled-paper gradient).

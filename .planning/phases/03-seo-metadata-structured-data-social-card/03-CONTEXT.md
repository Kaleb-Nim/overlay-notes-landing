# Phase 3: SEO Metadata, Structured Data & Social Card - Context

**Gathered:** 2026-07-24
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous) — most decisions pre-locked by SEO brief + STACK.md; 4 grey areas resolved with user

<domain>
## Phase Boundary

Phase 3 makes every crawler and social scraper that hits the finished page receive
correct, absolute, **new-domain** metadata (`overlay-notes.kalebnim.dev`, never the old
`kaleb-nim.github.io`), a `SoftwareApplication` JSON-LD block, `robots.txt`/`sitemap.xml`,
and a static 1200×630 OG social card that actually renders when the URL is shared.

**In scope:** `<title>`, meta description, `<html lang>`, canonical, Open Graph + Twitter
tags, `SoftwareApplication` JSON-LD, `app/robots.ts`, `app/sitemap.ts`, preview-deployment
de-indexing, and creating `public/og-image.png` + its reproducible generation script.

**Out of scope:** the visible page sections (Phase 2 — done), deployment/domain attachment/
analytics verification (Phase 4), any `FAQPage` or `aggregateRating` structured data, and
anything to do with the old GitHub Pages privacy-policy page (this standalone site already
links out to that policy from its footer).

</domain>

<decisions>
## Implementation Decisions

### SEO Metadata (locked — SEO brief §6 + STACK.md, URLs rewritten to new domain)
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

### Structured Data (locked)
- `SoftwareApplication` JSON-LD **only** — SEO-05. Fields: `@context` schema.org, `@type` SoftwareApplication, `name` "Overlay Notes", `applicationCategory` "BrowserApplication", `operatingSystem` "Chrome", `description` (= meta description), `url` (baseUrl), `image` (absolute og-image URL), `offers` `{ @type: Offer, price: "0", priceCurrency: "USD" }`.
- Rendered as a **native** `<script type="application/ld+json">` via `dangerouslySetInnerHTML` in `app/layout.tsx` — NOT `next/script` (per project CLAUDE.md: structured data is inert JSON, not a script to schedule).
- **No** `FAQPage` (Google removed FAQ rich results 2026-05-07). **No** `aggregateRating`/`review` (no real ratings — fabrication is a policy violation).
- Must pass Google's Rich Results Test with zero errors.

### Robots & Sitemap (locked — file conventions per STACK.md)
- `app/robots.ts` → `MetadataRoute.Robots`: `userAgent: '*'`, `allow: '/'`, `sitemap: ${baseUrl}/sitemap.xml`. **Always allow-all** — preview protection lives in the header (below), not here — SEO-06.
- `app/sitemap.ts` → `MetadataRoute.Sitemap`: single homepage entry at `${baseUrl}` (the canonical) with `lastModified`. No `changeFrequency`/`priority` (Google ignores them) — SEO-07.
- Both must serve 200 at `/robots.txt` and `/sitemap.xml`.

### Preview De-indexing (SEO-08) — USER CHOSE: X-Robots-Tag header
- `next.config.ts` async `headers()` returns `X-Robots-Tag: noindex, nofollow` for all routes **when `process.env.VERCEL_ENV !== 'production'`** (preview + development builds). Production builds (`VERCEL_ENV === 'production'`) emit no such header → live site fully indexable.
- `VERCEL_ENV` is set at build time per environment, and Vercel builds each environment separately, so the gate is correct per-deployment.
- `robots.ts` stays allow-all regardless; this header is the gate, layered under Vercel's own automatic preview `noindex` as defense-in-depth.

### OG Social Card — USER CHOSE: HTML template + Playwright shot, "Screenshot + text panel"
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/site-config.ts` → `siteConfig.baseUrl` (`https://overlay-notes.kalebnim.dev`) — the single absolute-URL source (FOUND-02). Every Phase 3 absolute URL derives from it.
- `app/layout.tsx` already exports a minimal `metadata = { title: 'Overlay Notes' }`, sets `<html lang="en">`, and wires Shantell/Public Sans via `next/font` + `<Analytics/>`/`<SpeedInsights/>`. Extend this file's metadata export and add the JSON-LD `<script>` here.
- `public/annotate-hero.png` (1280×800) — the OG source frame. `public/icon.png` (128×128) available.
- `app/globals.css` — brand tokens (paper, purple, ink, head, body, accent-red, yellow, rule) + hard-offset shadow / paper-gradient idioms to reuse in the OG template.
- `lib/content.ts` (faqs, origin story) — NOT consumed by Phase 3 (JSON-LD is SoftwareApplication only; the array's shape comment already says so).

### Established Patterns
- Fonts self-hosted via `next/font/google` (no third-party render-blocking request).
- Static rendering (no request data) — the whole route prerenders at build; metadata is a static object.
- Playwright 1.61.1 installed with bundled Chromium; `bash scripts/test-gate.sh` is the live E2E gate (`workflow.verifier=true`, `test_command` wired). `tests/seo.spec.ts` already exists and **self-guards** — it must actually assert (not skip) once metadata/JSON-LD/robots/sitemap exist (this phase makes it live).

### Integration Points
- Extend `app/layout.tsx` (metadata export + JSON-LD script).
- New: `app/robots.ts`, `app/sitemap.ts`, `next.config.ts` (`headers()` for the env-gated noindex), `public/og-image.png` + its generation script.
- `tests/seo.spec.ts` flips from self-skipping to asserting; extend within it without weakening the locked-URL/invariant assertions (per TESTING.md rules).

</code_context>

<specifics>
## Specific Ideas

- Title / meta description / og values are taken **verbatim from the SEO brief §6**, but every URL is **rewritten to `overlay-notes.kalebnim.dev`** — the brief predates the domain migration and still shows `kaleb-nim.github.io`; do NOT copy its URLs (a grep of rendered HTML for `kaleb-nim.github.io` must return zero matches outside the intentional footer privacy link — SEO-03).
- OG card = "Screenshot + text panel" (left brand text panel / right cropped hero screenshot), generated by HTML template + bundled-Chromium screenshot, committed as static PNG.
- No Twitter handle; no `keywords` meta; distinct `og:description`.
- Preview de-indexing via env-gated `X-Robots-Tag: noindex` (`VERCEL_ENV !== 'production'`).

</specifics>

<deferred>
## Deferred Ideas

- `FAQPage` JSON-LD — permanently out of scope (Google removed FAQ rich results 2026-05-07); FAQ stays visible-text-only from `lib/content.ts`.
- `aggregateRating` / `review` structured data — deferred to v2 (V2-08) once real Chrome Web Store ratings exist.
- LinkedIn Post Inspector live render check (ASSET-02) — needs the deployed URL; executed in Phase 4.
- Old GitHub Pages privacy-policy migration + Chrome Web Store Developer Dashboard URL update — concerns the *old* github.io property, not this standalone site. Out of scope.
- Deployment, custom-domain attachment, analytics/Speed-Insights production verification — Phase 4.

</deferred>

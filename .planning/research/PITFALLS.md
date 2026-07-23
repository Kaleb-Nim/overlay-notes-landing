# Pitfalls Research

**Domain:** SEO-critical Next.js/Vercel landing page recreating a hand-authored HTML prototype for a Chrome extension, under strict claim-discipline rules
**Researched:** 2026-07-24
**Confidence:** HIGH (verified against current 2026 Google/Vercel/Chrome Web Store policy sources and against the actual project files — `concept-1a.html`, the brief, and `PROJECT.md`)

Two things surfaced by reading the actual project files change the shape of this research and are called out explicitly below:

1. **`concept-1a.html` currently has every absolute URL — canonical, `og:url`, `og:image`, both JSON-LD `url`/`image` fields — pointing at the OLD domain** (`https://kaleb-nim.github.io/overlay-notes/`), because it was built from the GitHub-Pages-era brief. If this file is "recreated" without deliberately rewriting every one of these, the new Next.js site ships self-defeating SEO tags on day one. This is not a hypothetical risk — it's a verified bug sitting in the source file right now.
2. **The FAQPage JSON-LD in `concept-1a.html` has no matching visible FAQ section anywhere in the HTML.** The README already flags this as "still to build," but it means the schema-only-FAQ violation the brief warns against is the *current, real state* of the design file being handed off, not a remote risk.

---

## Critical Pitfalls

### Pitfall 1: Stale GitHub Pages URLs baked into the prototype get carried into production

**What goes wrong:**
The Next.js build ships with canonical, `og:url`, `og:image`, and JSON-LD `url`/`image` all pointing at `https://kaleb-nim.github.io/overlay-notes/` instead of `https://overlay-notes.kalebnim.dev`. Concretely, this is what `concept-1a.html` contains today (lines 10, 12, 15, 22, and the FAQPage's implicit page context) — not a risk to guard against, but a bug to fix.

**Why it happens:**
The prototype was built from `LANDING-PAGE-SEO-BRIEF.md` before the domain/hosting decision changed (GitHub Pages → Vercel subdomain). "Recreate this design in Next.js" reads as a visual-fidelity instruction, and it's easy to treat the `<head>` block as part of "the design" and copy it verbatim along with the colors and layout, because it's sitting right there, already written, in the same file.

**Consequence if shipped:** A self-referencing canonical pointing at a *different, unrelated page* (a bare privacy policy with a different `<title>`) tells Google "the authoritative URL for this content lives elsewhere." Best case, Google ignores the mismatched hint because the content doesn't match; worst case, it actively suppresses the new domain from being treated as canonical, which defeats the entire purpose of the project (rank the new page, not the old one). `og:image` pointing at a URL on a different origin than the page being shared will often still resolve (it's absolute), but it silently continues to serve the *old prototype's* social card context if one existed, and breaks the moment `github.io/overlay-notes/og-image.png` doesn't exist (it doesn't — that path was never built there).

**Prevention:**
- Single source of truth: a `BASE_URL` constant (`https://overlay-notes.kalebnim.dev`) referenced by `metadataBase` in the root layout, and nowhere else hardcoded.
- Treat every absolute URL in `concept-1a.html`'s `<head>` as a **placeholder to discard**, not a value to port. Do not copy the `<head>` block at all — rebuild it from Next.js Metadata API against `BASE_URL`.
- Add a CI/build-time grep step (or a simple test) asserting zero occurrences of `kaleb-nim.github.io` in rendered HTML output, excluding the one intentional footer link to the privacy policy.

**Warning signs:** View-source on the deployed preview and search for `github.io` — if it appears anywhere except the footer `<a href="...">Privacy</a>` link, this pitfall has occurred. Also: Rich Results Test or the LinkedIn Post Inspector showing a URL/domain mismatch between the page you tested and the URL the tool reports back.

**Phase to address:** The phase that builds the SEO `<head>` / Metadata API — should be treated as "build from spec," not "port from prototype," and explicitly gated by a URL-consistency check before merge.

---

### Pitfall 2: Canonical/OG/JSON-LD self-reference is wrong even after the domain is fixed (trailing slash, apex vs subdomain)

**What goes wrong:**
Even once `BASE_URL` is correctly set to the new subdomain, a mismatch between the canonical URL's trailing slash and what Next.js actually serves (or what `sitemap.xml` lists) creates a self-contradicting page: canonical says `.../` but the served URL and internal links use no trailing slash (Next.js default), or vice versa.

**Why it happens:** Next.js does not append a trailing slash by default (`trailingSlash: false`). If a developer manually writes `canonical: "https://overlay-notes.kalebnim.dev/"` (matching the old GH-Pages-style URL format from the brief, which *did* need the trailing slash because it was a directory index) it no longer matches the page's actual served path.

**Prevention:** Pick one form (no trailing slash is the Next.js default and simplest) and make canonical, `og:url`, sitemap `<loc>`, and internal `<Link>` hrefs derive from the same constant/helper, never hand-typed per-file. Since this is a single-page site (v1 has one route), the blast radius is small, but the habit matters if pages are added later.

**Warning signs:** `curl -I` the deployed URL with and without trailing slash — check for an unexpected redirect chain or a canonical value that doesn't match the final resolved URL.

**Phase to address:** SEO `<head>` / Metadata phase.

---

### Pitfall 3: Chrome Web Store policy violation from unreconciled copy (highest real-world stakes)

**What goes wrong:**
Visible page copy (drafted from the SEO brief, not from the certified `STORE-LISTING.md`) states or implies a feature the extension doesn't have — PDF annotation, Firefox/Safari support, cloud sync, accounts, export to PNG/SVG, cross-note search, a dashboard, or collaboration/sharing. All six are explicitly named as out-of-scope in `PROJECT.md` and the brief — meaning they were plausible enough to write into the copy once already.

**Why it happens:** The brief's own §9 keyword list nudges toward phrases that sound adjacent to these features ("annotate research papers," "study notes chrome extension") and a copywriter (or an LLM) reaching for natural-sounding marketing prose will often reach for a feature-sounding claim to fill out a sentence, especially in "How it's different" and "What you can do" sections where competitive framing invites over-claiming.

**Consequences:** Chrome Web Store's Developer Program Policies explicitly prohibit "misrepresenting product functionality" and require descriptions to directly state functionality so users have a clear understanding; the policy applies to "marketing collateral preceding the Chrome Web Store product listing" — which is precisely what this landing page is. This is graded as a genuine review-rejection / enforcement risk for an extension that runs on `<all_urls>` (a permission Google already scrutinizes more closely), not a cosmetic SEO nit. It's also independently a Google spam-policy problem if it reads as engineered rather than honest.

**Prevention:**
- Build a literal claim-traceability table before writing final copy: every noun-phrase claim on the page → the exact line/section in `STORE-LISTING.md` or `README.md` that supports it. No matching line = cut the claim or rewrite it to what's actually supported.
- Grep the final rendered page for the explicit banned-term list from `PROJECT.md`: `PDF`, `Firefox`, `Safari`, `sync`, `account`, `export`, `search across`, `dashboard`, `collaborat`, `shar` (careful of false positives like "share this page" vs. feature "sharing"). Automate this as a pre-deploy check, not a manual read-through.
- Keep the privacy statement — "nothing is collected, transmitted, sold, or shared" — copy-pasted verbatim from the Developer Dashboard record, never paraphrased, since it is itself a certified statement.

**Warning signs:** Any sentence in "How it's different," "What you can do," or the FAQ answers that names a capability you can't point to a `STORE-LISTING.md` line for. Also watch the *comparison* framing specifically ("vs. Excalidraw," "vs. screenshots") — comparative claims are exactly where scope creep sneaks in ("unlike screenshots, you can export your notes" — export is out of scope).

**Phase to address:** A dedicated content-reconciliation phase that runs *before* the design-fidelity build phase, or at minimum before final copy is locked — not bundled into "build the page" where it gets rubber-stamped alongside layout work.

---

### Pitfall 4: FAQ rich results are dead — the FAQ investment needs a reason that isn't "rich snippet"

**What goes wrong:**
`PROJECT.md`'s Key Decisions table records "Visible FAQ section + FAQPage schema" with the rationale "the 6 questions are also the page's strongest long-tail asset," and the brief calls FAQPage schema "the long-tail play." Both were written on an assumption about Google FAQ rich results that is no longer true.

**Verified current status (2026):** Google restricted FAQ rich results in August 2023 to a narrow set of well-known, authoritative government and health sites. As of **May 7, 2026**, that narrow exception was removed too — FAQ rich results (the expandable Q&A snippet in search results) **no longer appear in Google Search for any site, including government/health.** The rollout continues: the FAQ report is being dropped from Search Console in June 2026, with API support removed in August 2026. FAQPage remains a valid schema.org type and Google says it will continue to *parse* the markup to understand page content, but there is no rich-result payoff left to earn.

**Say this plainly to the project:** building a visible FAQ section is still a good idea — but not because it will earn a SERP rich snippet. It earns value two other ways: (1) visible FAQ copy naturally covers long-tail question-phrased queries ("how do I draw on a webpage in chrome") in the crawlable body text itself, which normal ranking still rewards; (2) it's good UX/conversion copy. The FAQPage JSON-LD block itself, post-May-2026, has near-zero marginal SEO value beyond what the visible text already provides — it costs nothing to keep (Google still parses it, no penalty for having it) but it should not be budgeted time as if it unlocks a rich result, because it doesn't anymore.

**Prevention:** Update the roadmap's expectation/success-metric language for this feature from "earn FAQ rich results" to "cover long-tail question queries in visible copy" so nobody burns extra time later debugging why the rich snippet isn't showing in Search Console — it structurally cannot, for any site, as of this milestone.

**Warning signs:** Time spent troubleshooting "why isn't my FAQ rich result showing" in Search Console/Rich Results Test after launch — the Rich Results Test may still validate the markup as *eligible* even though Google will not render it in live search, which is confusing and a plausible time-sink if the team doesn't know the feature was globally deprecated.

**Phase to address:** Content/copy phase — reframe the success criterion when it's written, before it's shipped as an unmet promise.

---

### Pitfall 5: Schema-only FAQ is the *current* state of the handoff, and it's a live spam-policy issue independent of rich results

**What goes wrong:**
Separate from whether rich results exist, Google's **general structured data guidelines** (not the FAQ-specific rich-result eligibility rules) prohibit marking up content that isn't visible on the page at all: "Don't mark up content that is not visible to readers of the page." Violating this is graded under "spammy structured markup" and can trigger a **manual action** in Search Console — which does affect eligibility for any rich result treatment (not ranking directly, but it's a real, visible penalty flag on the property) and is exactly the failure mode the brief already warned about in principle. Right now, in `concept-1a.html`, this violation exists in fact: the FAQPage JSON-LD has six Q&A pairs and there is no FAQ HTML section anywhere in the page body.

**Why it happens:** the design file was handed off mid-build with the schema written first (easy, one JSON block) and the matching visible section deferred ("still to build" per the README) — a completely reasonable build order, but a real gap if the "recreate the design" instruction is followed literally without noticing the visible section was never actually built.

**Prevention:** Treat "add the visible FAQ section with text that matches the schema Q&A verbatim" as a hard release-blocking checklist item, not an enhancement. The visible answer text must match the schema `text` field — not paraphrase it, not shorten it for readability while leaving schema untouched. If copy reconciliation (Pitfall 3) changes an answer's wording to fix a claim, update both the visible text and the JSON-LD together, in the same commit.

**Warning signs:** Grep the final page for each of the six schema question strings — if any doesn't appear as visible `<h3>`/`<p>` text on the page, this is unresolved. Google's Rich Results Test will still often report success for the *schema syntax* even when there's no matching visible text — the tool does not check for text-parity, so passing Rich Results Test is not sufficient verification.

**Phase to address:** Same content-reconciliation / FAQ-build phase as Pitfall 4 — build the visible section and the schema from one shared data source (e.g., a single array of `{question, answer}` objects rendered both into JSX and into the JSON-LD `<script>`), so they can never drift apart by construction.

---

### Pitfall 6: OG image fails to render on LinkedIn — the one channel with a proven track record here

**What goes wrong:**
A prior LinkedIn post about this exact project got 151 reactions with a *bare, preview-less* link — meaning LinkedIn's crawler either found no `og:image`/`og:title` or failed to fetch what was there. This is the single highest-leverage fix in the whole project per the project's own history, and there are several independent ways to still get it wrong even after "adding" Open Graph tags.

**Specific failure modes, verified:**
1. **Relative image URL.** `next/og` or a manually-authored `<meta property="og:image">` using a relative path (`/og-image.png`) instead of an absolute one. Social scrapers (LinkedIn, X, Slack) do not resolve relative URLs against the page origin the way browsers do — they require a fully-qualified URL. In Next.js this is specifically what `metadataBase` in the root layout exists to fix: without it, a relative `openGraph.images` path either build-errors or silently fails to resolve to an absolute URL depending on how it's declared.
2. **LinkedIn's aggressive cache.** LinkedIn caches a link's preview for roughly a week. If the page is shared, tweaked, and reshared before the cache expires, the old (possibly broken) preview persists. The fix is the **LinkedIn Post Inspector** (linkedin.com/post-inspector) — submitting the URL there forces a re-scrape; sometimes it needs to be run twice before the new image/title/description actually replaces the cached one.
3. **Image size/format.** LinkedIn recommends images at least 1200×627 (this project's spec of 1200×630 clears that), under roughly 5MB. `og:image:width`/`og:image:height` should be set to the actual rendered dimensions (1200×630) so crawlers don't have to fetch-and-measure, which some crawlers skip entirely if the declared dimensions are missing or wrong.
4. **Crawler blocked.** If `robots.txt` or a Vercel deployment-protection setting blocks the LinkedIn/X crawler user-agent (or blocks all bots on preview URLs and the wrong URL gets shared), the scraper gets nothing to work with and falls back to a bare link — reproducing exactly the failure that happened before.

**Prevention:**
- Set `metadataBase: new URL('https://overlay-notes.kalebnim.dev')` in the root layout; author all OG/Twitter image fields as relative paths so Next.js resolves them consistently, or as fully-qualified absolute URLs — never mix conventions across fields.
- Explicitly set `openGraph.images[0].width = 1200`, `.height = 630` in the Metadata object (this isn't automatic even when the image itself is 1200×630).
- Before any LinkedIn share (including the first real one), run the URL through **Post Inspector** proactively, not reactively — treat "verified in Post Inspector" as a release-blocking checklist item, and re-run it after any og-image or metadata change even post-launch.
- Test with a generic OG-debugging tool too (e.g., opengraph.xyz or metatags.io) since Post Inspector is LinkedIn-specific but Slack/X/Discord have their own (less aggressive) caches and crawlers.

**Warning signs:** Pasting the live URL into a private LinkedIn message/draft post shows no image or a stale one. `curl` the page and grep for `og:image` — confirm it starts with `https://overlay-notes.kalebnim.dev`, not a relative path, and that the image URL itself 200s when fetched directly (not just that the tag exists).

**Phase to address:** SEO/OG-image build phase, with a required manual verification step (Post Inspector) before the phase is marked done — this is one of the few pitfalls in this document where automated checks are insufficient and a live external tool run is the actual verification.

---

### Pitfall 7: Preview deployments (and the subdomain itself) getting indexed before launch is intentional

**What goes wrong:**
Vercel's default protection — `X-Robots-Tag: noindex` on preview deployments — only applies to the auto-generated `*.vercel.app` preview URLs. **The moment a custom domain is assigned to a non-production branch/deployment, that noindex header is not set.** If `overlay-notes.kalebnim.dev` (or any custom subdomain) is ever pointed at a preview/staging deployment during development — a common thing to do to show work-in-progress to a human reviewer — that URL is fully crawlable and indexable with zero protection, and it's the *actual production domain*, meaning anything indexed there before launch becomes the canonical entry Google has on file, complete with placeholder copy, broken links, or unreconciled claims.

**Prevention:**
- Do not attach the production custom domain to any deployment before content, copy reconciliation, and OG/schema are final. Preview and iterate on the `*.vercel.app` URL (which is noindex-protected by default) until ready to go live.
- If a custom domain must be attached early for stakeholder review, explicitly set a `noindex` response header via `next.config` headers or middleware for that environment, and verify it with `curl -I` before the domain goes live — don't rely on Vercel's default, since it's known not to apply here.
- Once genuinely ready to launch, remove any manual noindex override and verify the production response has no `X-Robots-Tag: noindex` and no `<meta name="robots" content="noindex">` left over from testing — the inverse mistake (shipping to production with a leftover noindex flag) is just as damaging and more common than it sounds, since it fails silently: the page looks fine to a human, builds fine, deploys fine, and simply never appears in Search Console.

**Warning signs:** `curl -I https://overlay-notes.kalebnim.dev/ | grep -i robots` — should return nothing at launch. In Search Console's URL Inspection tool, "Indexing allowed? No: 'noindex' detected" is the exact diagnostic string to watch for.

**Phase to address:** Deployment/infrastructure phase — the domain-attachment step specifically, with this check written directly into that phase's done-criteria.

---

### Pitfall 8: Design-fidelity drift when recreating a hand-tuned CSS prototype in Next.js

**What goes wrong:**
`concept-1a.html` is inline CSS, hand-tuned to the pixel (documented as "high-fidelity... recreate pixel-faithfully" in the README). Recreating it inside a component framework introduces several specific, well-known drift points that are easy to miss because each individually looks "close enough":

1. **CSS reset differences.** The prototype has no explicit reset — it relies on browser defaults plus its own rules (`*{box-sizing:border-box}`, `img{max-width:100%;display:block}`). A Next.js/Tailwind setup typically layers Tailwind's Preflight (or another reset) on top, which changes default margins on headings, list styles, form elements, and `img` baseline behavior in ways that can shift the ruled-paper background grid alignment (`repeating-linear-gradient` every 32px) or the exact vertical rhythm of the hero if any implicit browser margin the prototype was quietly relying on gets zeroed out differently.
2. **`next/font` vs. Google Fonts CDN metrics.** The prototype loads Shantell Sans, Public Sans, and Space Grotesk via `fonts.googleapis.com` with `display=swap`. `next/font/google` self-hosts the same font files but computes different fallback-font metrics (`size-adjust`, `ascent-override`, etc.) to minimize swap-induced layout shift. The *rendered glyph metrics of the real webfont are identical* either way (same font file), but the **fallback-period layout** differs — next/font's calculated fallback is deliberately tuned to approximate the *target* font's metrics, whereas the CDN version's fallback is whatever the browser's default sans-serif happens to be, with no override. This means comparing a next/font build against the original prototype screenshot during a period before the webfont loads can show real, small positional differences (line-height, letter width) — this is expected and is in fact the correct, *better* behavior, not a regression to chase down.
3. **Rotated elements and overflow clipping.** Nearly every decorative element in this design has a `transform: rotate()` (pill badge -1.5deg, cards alternating ±1deg, hero frame 2deg, tape -6deg, chips alternating ±1deg). Rotation changes an element's visual bounding box without changing its layout box, which is a classic source of unexpected clipping when a parent has `overflow: hidden` (common in component-library card/container primitives) or when the rotated element sits near a section boundary — the prototype was tuned by eye in a single static file where this was never an issue; component composition can introduce a clipping parent without anyone intending to.
4. **Absolutely-positioned decorative elements at breakpoints.** The hero's `.tape`, `.note-r`, `.arrow`, `.note-b` are all `position: absolute` with hand-tuned percentage/pixel offsets (`right:-6px;top:44%`, `left:-14px;bottom:6px`, etc.) calibrated against the *specific* two-column desktop hero layout. The prototype's own responsive rule collapses the hero to one column at ≤760px but never repositions or hides these absolutely-positioned annotations — meaning even the *reference* design likely has these elements drifting or overlapping oddly on mobile, and a faithful recreation needs to decide (and the design spec doesn't say) whether to hide them, reposition them, or accept the same drift the prototype has. This is a decision to surface explicitly, not silently inherit.
5. **Variable-font axis defaults.** Shantell Sans and Public Sans are requested with specific numeric weights (`400;500;600;700`, plus italic 500) via the CDN `@import`-style URL. If `next/font/google` is configured with a subset of weights that doesn't exactly match (e.g., missing italic 500, which the origin-story tag and "the story" card specifically use), the browser will synthetically bold/italicize as a fallback, which looks visibly different (faux-italic slant, faux-bold weight) from the true drawn italic in the hand-tuned original.

**Prevention:**
- Do the fidelity comparison against **rendered screenshots of `concept-1a.html` opened directly in a browser**, not against the design tokens table alone — several of the above (rotation clipping, absolute-position drift at breakpoints) only show up visually, not in a token diff.
- Explicitly request every weight/style actually used (`400,500,600,700` roman + `500` italic for Shantell Sans; same pattern for Public Sans) in the `next/font/google` config — cross-check against every `font:` shorthand in the prototype's `<style>` block, not just the documented tokens list.
- Decide and document what happens to the four absolutely-positioned hero annotations at ≤760px before building the responsive breakpoint, rather than discovering it during review.
- If using Tailwind, either disable Preflight's heading/list resets selectively or explicitly re-verify the ruled-paper background's 32px rhythm and hero vertical spacing pixel-for-pixel against the prototype after Preflight is applied.

**Warning signs:** Side-by-side screenshot diff (even a manual one) at three breakpoints (desktop, 760px, 360px) showing any rotated/absolute element clipped, overlapping text, or shifted more than a couple of pixels from the reference. Faux-bold/faux-italic rendering on the origin-story card or the "made for margin-scribblers" kicker is a dead giveaway of a missing font weight/style.

**Phase to address:** The design-fidelity build phase itself — budget explicit time for a three-breakpoint visual diff against the prototype as a phase-exit check, not just a subjective "looks right" pass.

---

### Pitfall 9: Core Web Vitals regressions from the hero image, font swap, and load-triggered SVG animation

**What goes wrong, by metric:**

- **LCP.** The hero's 1280×800 screenshot inside the "taped-up polaroid" frame is very likely the LCP element. Common regressions when this gets recreated with `next/image`: forgetting `priority` (Next.js otherwise lazy-loads below-the-fold-adjacent images, and even near-the-fold images can be deprioritized without an explicit hint), serving the full 1280×800 source at a much smaller rendered size without a properly configured `sizes` prop (wasting bytes and decode time), and not setting `fetchPriority="high"`. Recommended target is LCP < 2.5s.
- **CLS from font swap.** Already covered by `next/font`'s automatic fallback-metric matching (Pitfall 8) if configured correctly — but only if the developer accepts the framework default rather than manually overriding `display` to `'block'` or `'optional'` in a way that reintroduces FOIT/FOUT behavior the automatic fallback was designed to prevent.
- **CLS from rotated/absolutely-positioned hero decorations.** The tape, arrows, and handwritten notes are positioned relative to the polaroid frame, whose own size depends on the hero image's rendered dimensions. If the image doesn't have explicit `width`/`height` (or an `aspect-ratio` reserved via `next/image`'s automatic sizing), the frame — and everything absolutely positioned against it — will jump when the image finishes loading, potentially the single largest CLS contributor on the page given how many elements are anchored to that frame's edges.
- **INP / reduced motion on the SVG stroke animation.** The marker-squiggle underline animates via `stroke-dashoffset` on page load — this is a one-shot CSS `@keyframes` animation, not a continuous or scroll-linked one, so its INP risk is low (it doesn't run on an input handler). The real gap: there's no `prefers-reduced-motion` guard anywhere in the current CSS. For a user with reduced-motion preferences set, the animation should be disabled or reduced to an instant draw rather than the 1.1s eased stroke, both as an accessibility best practice and because unguarded CSS animations are a common Lighthouse/axe accessibility-audit flag.
- **What Vercel Speed Insights will flag:** real-user LCP driven by the hero image on slower connections/devices (Speed Insights reports field data — actual visitor experience — not just a lab score), and any CLS spikes correlated with the hero-frame-plus-decorations load sequence. Speed Insights data is near-real-time in its own dashboard even though Google's own CWV data in Search Console lags by about 28 days, so use Speed Insights as the fast feedback loop during the build and Search Console as the lagging confirmation post-launch.

**Prevention:**
- `next/image` with `priority` on the hero image, explicit `width`/`height` (1280×800) or a fixed `aspect-ratio` wrapper so the polaroid frame and its absolutely-positioned children never resize post-load.
- Preload the hero image is handled by `priority`; do not also hand-add a manual `<link rel="preload">` for the same asset (redundant, can double-fetch in some setups).
- Wrap the squiggle `@keyframes` rule in `@media (prefers-reduced-motion: no-preference) { ... }`, with a static (fully drawn, `stroke-dashoffset: 0`) fallback for reduced-motion users.
- Since the video (7.8MB) is explicitly out of scope for v1 (`PROJECT.md`), there's no autoplay-media CLS/bandwidth risk to worry about this milestone — but if it's added later, confirm it doesn't reintroduce this exact class of problem.

**Warning signs:** Lighthouse/PageSpeed Insights flags "Largest Contentful Paint element" pointing at the hero `<img>` with a load time exceeding target; DevTools' Layout Shift Regions overlay showing a shift coincident with image decode; axe/Lighthouse accessibility audit flagging "no prefers-reduced-motion alternative."

**Phase to address:** Performance/Core-Web-Vitals phase (or folded into the design-fidelity build phase if there isn't a separate one) — should have Lighthouse and a manual reduced-motion toggle check as explicit exit criteria.

---

### Pitfall 10: Keyword list treated as a literal checklist instead of natural copy

**What goes wrong:**
The brief lists roughly 13 target keyword phrases across primary/secondary/long-tail tiers for a single short page. Treating this as "make sure each phrase appears" produces copy that reads as written for an algorithm rather than a person — several of Google's own examples of keyword stuffing are exactly this pattern (unnatural repetition, phrases jammed into sentences where they don't fit grammatically).

**What the actual policy says (verified, no fixed limit exists):** Google does not publish a hard cap on keyword count or density. The spam policy language is behavior-based: "filling a web page with keywords... in an attempt to manipulate rankings," assessed by whether it reads as written for users or for search engines. The June 2026 spam update did not add new stuffing rules — it refined enforcement of the existing ones. So the real constraint isn't a number, it's readability: if a human reading the page out loud would notice the phrasing is off, that's the signal, not a keyword count threshold.

**Prevention:**
- Write the page copy first for a human reader (matching STORE-LISTING.md claims, per Pitfall 3), then check which of the 13 phrases naturally already occur — don't reverse the order.
- The brief itself already flags the one phrase that must appear verbatim by design (`excalidraw chrome extension`, for competitive/keyword reasons) — treat that as the single non-negotiable insertion, and let the rest occur naturally or not at all rather than forcing all 13.
- Read the finished page aloud (or have a fresh pair of eyes read it) as the actual acceptance test — not a keyword-density calculator.

**Warning signs:** Any sentence where a target phrase is grammatically awkward, redundant with an adjacent sentence, or clearly inserted after the fact (e.g., a sentence that restates the previous one's meaning using a different keyword variant).

**Phase to address:** Content/copy phase, as a copy-review step alongside the claim-traceability check (Pitfall 3) — these two checks should happen in the same pass since both operate on the same draft copy.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|-----------------|------------------|
| Copying `concept-1a.html`'s `<head>` block verbatim into Next.js metadata "to save time" | Fast — the SEO block is already fully written | Ships every stale GitHub Pages URL into production (Pitfall 1) | Never — always rebuild from `BASE_URL` |
| Reaching all 13 brief keywords into copy for "SEO completeness" | Feels thorough against the brief's checklist | Reads as stuffed, risks Google spam policy and Chrome Web Store's own tone scrutiny (Pitfall 10) | Never — natural occurrence only |
| Hardcoding the hero image at its native size without `next/image`/explicit dimensions, "it looks right on my screen" | Faster to wire up | LCP regression + CLS from the frame/decorations resizing post-load (Pitfall 9) | Never for the LCP element specifically |
| Deferring the reduced-motion guard on the squiggle animation to "polish later" | One fewer CSS rule now | Accessibility audit flag; cheap to add correctly the first time (a few lines) so there's little reason to defer | Acceptable only if tracked as a must-fix-before-launch item, not silently dropped |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|-----------------|-------------------|
| Vercel custom subdomain DNS | Adding an A record for `www` or the subdomain when Vercel expects a CNAME, or leaving a conflicting existing record from when the apex was set up elsewhere | Use a CNAME record for the `overlay-notes` subdomain pointed at Vercel's target; verify no competing record exists on the same hostname before adding it; if the apex zone is on Cloudflare, set the record to "DNS only" (grey cloud), not proxied |
| Vercel preview deployments + custom domain | Assuming the default `X-Robots-Tag: noindex` protection applies once a custom domain is attached | It doesn't, for non-production branches on a custom domain — verify with `curl -I` and add an explicit noindex header if a custom domain must be attached before launch (Pitfall 7) |
| LinkedIn Post Inspector | Sharing the link once, seeing a broken preview, "fixing" the tags, and resharing without re-running Post Inspector — the cache (~7 days) serves the old broken preview again | Always re-run Post Inspector after any OG/metadata change, and be prepared to run it twice if the first pass doesn't pick up the change |
| Google Rich Results Test | Treating a "pass" as proof the FAQ is fully correct | Rich Results Test validates JSON-LD syntax/eligibility, not whether the answer text matches visible page content (Pitfall 5) — that check has to be done separately (e.g., a grep/diff against rendered HTML) |
| Bun as the Next.js runtime | Assuming Bun is a drop-in Node replacement for every dependency the project might add later (native bindings like `bcrypt`, `canvas`, older `better-sqlite3` builds break under Bun's JavaScriptCore engine) | For this project's dependency surface (Next.js, Tailwind, no native-binding packages expected), Bun is fine; if any future dependency needs native bindings, verify Bun compatibility (or WASM fallback availability) before adding it, and keep `bun install`/build steps in CI matching local dev exactly |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|-----------------|
| Hero image without `priority`/explicit dimensions | LCP > 2.5s in Speed Insights field data, visible layout jump when the image finishes decoding | `next/image` with `priority`, explicit width/height matching the 1280×800 source | Immediately, on any real visitor — this isn't a scale issue, it's a day-one config issue |
| `next/font` fallback overridden to a display mode that reintroduces FOIT/FOUT | CLS spikes on first visit (uncached fonts) | Use `next/font/google` defaults (`display: 'swap'` with automatic fallback metrics) rather than hand-tuning `display` | Any cold-cache visit, i.e., every new visitor until fonts are cached |
| Rotated/absolute decorative elements without reserved space | CLS spikes tied to hero-frame load, worse on mobile at the 760px/360px breakpoints where positions were never explicitly re-verified | Reserve space via aspect-ratio wrapper on the frame; explicitly test and document decoration behavior at each breakpoint (Pitfall 8) | Any visit before the hero image is fully decoded |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Fabricating `aggregateRating`/`review` structured data to make the `SoftwareApplication` schema look more complete | Violates Google's structured-data policy directly (marking up content — ratings — that doesn't exist/isn't visible) and is a Chrome-Web-Store-adjacent honesty problem, not just an SEO one | Already correctly excluded per `PROJECT.md` — keep it that way until real ratings exist, and don't let a later "improve rich results" pass reintroduce it as a shortcut |
| Overly broad `robots.txt`/sitemap exposing the privacy-policy GitHub Pages URL to indexing signals it shouldn't inherit | Low risk here since that page is intentionally kept indexable as-is, but worth confirming the new site's `robots.txt`/sitemap don't inadvertently reference or crawl the old domain's paths | Keep `robots.txt`/`sitemap.xml` scoped strictly to `overlay-notes.kalebnim.dev` paths; the only cross-domain reference should be the footer's plain `<a>` link, not a sitemap entry |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-------------------|
| Absolutely-positioned hero annotations (tape, arrows, handwritten labels) drifting or overlapping at mobile widths, inherited unchanged from the desktop-tuned prototype | Confusing/cluttered mobile hero, text overlapping the screenshot, at the exact viewport size most visitors from a shared LinkedIn link will use | Explicitly design (not just inherit) mobile behavior for these elements — hide, reposition, or simplify below 760px, and verify at 360px specifically since that's the brief's stated no-horizontal-scroll requirement |
| Load-triggered SVG animation with no reduced-motion fallback | Motion-sensitive users get an animation they didn't opt into, with no way to avoid it | `prefers-reduced-motion` media query guard (Pitfall 9) |
| CTA pointing at a placeholder/dead link if the Chrome Web Store URL isn't wired up correctly | Visitor arrives specifically to install, cannot | Already resolved per `PROJECT.md` — the real store URL exists (`chromewebstore.google.com/detail/overlay-notes/...`); just confirm it's the one actually used in the Next.js build, not the GitHub-repo fallback the original brief specified as a stopgap |

## "Looks Done But Isn't" Checklist

- [ ] **Canonical/OG/JSON-LD URLs:** Often still contain the old GitHub Pages domain somewhere (verify by grepping rendered HTML for `github.io` outside the footer link — Pitfall 1)
- [ ] **FAQ section:** Often exists only as JSON-LD with no matching visible text, or visible text that doesn't match the schema `text` field word-for-word (Pitfall 5)
- [ ] **OG image:** Often "added" as a relative path that resolves fine in a local browser (because the browser fills in the origin) but breaks for every external scraper that requires an absolute URL (Pitfall 6)
- [ ] **Claim discipline:** Often "done" after one read-through, but a live grep for the explicit banned-term list (PDF, Firefox, Safari, sync, account, export, search across, dashboard, collaborat) is the only reliable check (Pitfall 3)
- [ ] **Reduced-motion support:** Often skipped because the animation "looks fine" to the person building it, who isn't testing with `prefers-reduced-motion` enabled
- [ ] **Preview-deployment indexing protection:** Often assumed to be automatic ("Vercel handles this") when it specifically stops applying the moment a custom domain is attached to a non-production deployment (Pitfall 7)

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|----------------|------------------|
| Stale old-domain URLs shipped to production (Pitfall 1) | LOW | Fix the metadata constant, redeploy, resubmit the URL in LinkedIn Post Inspector and Google's URL Inspection tool to force a re-crawl; no lasting damage if caught within days |
| Preview/staging accidentally indexed on the production custom domain before launch (Pitfall 7) | MEDIUM | Fix the noindex leak or attach the domain to the correct deployment, then use Search Console's URL Inspection → Request Indexing on the corrected version; expect a delay (days to a couple of weeks) for Google to fully replace what it crawled |
| Schema/visible-text FAQ mismatch discovered post-launch (Pitfall 5) | LOW | Update both the visible copy and JSON-LD in the same deploy; re-run Rich Results Test (informational only now, given Pitfall 4) and, more importantly, re-verify with a manual text-diff since no external tool checks this automatically |
| Out-of-scope claim discovered live on the page (Pitfall 3) | MEDIUM–HIGH depending on whether it's been flagged externally | Remove/rewrite immediately; if it has already drawn Chrome Web Store attention (e.g., a policy email), respond promptly citing the correction — proactive correction before any enforcement action is materially better than reactive correction after one |
| LinkedIn still showing a stale/broken preview after fixing OG tags (Pitfall 6) | LOW | Re-run Post Inspector, potentially twice; if still stale after ~7 days and two Inspector runs, check for a Vercel edge-cache or CDN layer serving a stale HTML snapshot to LinkedIn's crawler specifically |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| Stale old-domain URLs in metadata (P1) | SEO `<head>`/Metadata build phase | Grep rendered HTML for `github.io` outside the footer link; must return zero matches |
| Canonical/trailing-slash self-consistency (P2) | SEO `<head>`/Metadata build phase | `curl -I` served URL matches canonical value exactly, including trailing slash |
| Chrome Web Store claim discipline (P3) | Content/copy-reconciliation phase, before design-fidelity build | Claim-traceability table complete; banned-term grep returns zero matches |
| FAQ rich-results expectation reset (P4) | Content/copy phase (roadmap success-criteria wording) | Roadmap/success metrics reference "long-tail visible-copy coverage," not "rich result" |
| Visible FAQ text matches schema verbatim (P5) | Content/copy + FAQ-build phase | Each of the 6 schema questions has an exact-match visible counterpart on the page |
| OG image / LinkedIn preview (P6) | SEO/OG-image build phase | Manual pass through LinkedIn Post Inspector shows correct title/description/image before first real share |
| Preview-deployment indexing leak (P7) | Deployment/infrastructure phase | `curl -I` production domain shows no `noindex` at launch; no `noindex` was ever exposed on the attached custom domain during build |
| Design-fidelity drift (P8) | Design-fidelity build phase | Three-breakpoint (desktop/760px/360px) visual diff against `concept-1a.html` screenshots as phase-exit check |
| Core Web Vitals regressions (P9) | Performance phase (or folded into fidelity build phase) | Lighthouse LCP < 2.5s, CLS < 0.1 on the built page; manual reduced-motion toggle check |
| Keyword stuffing (P10) | Content/copy phase | Read-aloud review pass; no forced keyword insertion beyond natural occurrence + the one required verbatim phrase |

## Sources

- [FAQ Rich Results Deprecated: Google's May 2026 Change](https://www.getpassionfruit.com/blog/what-changed-with-google-drops-faq-rich-results-and-what-to-do-now) — HIGH confidence, corroborated across multiple independent outlets
- [Google Drops FAQ Rich Results From Search — Search Engine Journal](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/) — HIGH confidence, established SEO trade publication
- [Google Officially Kills FAQ Rich Results](https://nobsmarketplace.com/blog/google-officially-kills-faq-rich-results) — MEDIUM-HIGH, corroborating source
- [General Structured Data Guidelines — Google Search Central](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) — HIGH confidence, primary Google documentation
- [Manual actions report — Search Console Help](https://support.google.com/webmasters/answer/9044175) — HIGH confidence, primary Google documentation
- [Spam policies for Google Web Search — Google Search Central](https://developers.google.com/search/docs/essentials/spam-policies) — HIGH confidence, primary Google documentation
- [Google's June 2026 Spam Update](https://cliquestudios.com/university/resources/google-june-2026-spam-update) — MEDIUM confidence, secondary analysis of a primary policy update
- [Functions: generateMetadata — Next.js docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) — HIGH confidence, primary framework documentation
- [Are Vercel Preview Deployments indexed by search engines? — Vercel Knowledge Base](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines) — HIGH confidence, primary vendor documentation
- [Google selects Vercel deployment URL even with noindex set — Google Search Central Community](https://support.google.com/webmasters/thread/279188341/) — MEDIUM confidence, community thread but consistent with the documented custom-domain exception
- [Working with domains — Vercel docs](https://vercel.com/docs/domains/working-with-domains) — HIGH confidence, primary vendor documentation
- [Troubleshooting Chrome Web Store violations — Chrome for Developers](https://developer.chrome.com/docs/webstore/troubleshooting) — HIGH confidence, primary vendor documentation
- [Chrome Web Store — Program Policies](https://developer.chrome.com/docs/webstore/program-policies/policies) — HIGH confidence, primary vendor documentation
- [Chrome Web Store Policy Updates — Chrome for Developers blog](https://developer.chrome.com/blog/cws-policy-revamp-jan23) — HIGH confidence, primary vendor documentation
- [LinkedIn Post Inspector: Fix Broken Link Previews](https://www.joinvalley.co/blog/linkedin-post-inspector-how-to-fix-your-link-previews-fast) — MEDIUM confidence, third-party guide, consistent across multiple similar sources
- [Fixing layout shifts caused by web fonts — Vincent Bernat](https://vincent.bernat.ch/en/blog/2024-cls-webfonts) — MEDIUM-HIGH confidence, well-regarded independent technical writeup
- [RFC: Font fallbacks in NextJS — vercel/next.js Discussion #40112](https://github.com/vercel/next.js/discussions/40112) — HIGH confidence, primary framework source discussion
- [Speed Insights Metrics — Vercel docs](https://vercel.com/docs/speed-insights/metrics) — HIGH confidence, primary vendor documentation
- [Bun Compatibility in 2026 — DEV Community](https://dev.to/alexcloudstar/bun-compatibility-in-2026-what-actually-works-what-does-not-and-when-to-switch-23eb) — MEDIUM confidence, community technical writeup, directionally consistent with Bun's own docs
- [Node.js Compatibility — Bun docs](https://bun.com/docs/runtime/nodejs-compat) — HIGH confidence, primary vendor documentation
- [Google indexed exactly ZERO of my pages after 2 weeks — Indie Hackers](https://www.indiehackers.com/post/google-indexed-exactly-zero-of-my-pages-after-2-weeks-is-this-normal-or-am-i-doing-something-stupid-8fed9e8d9b) — LOW-MEDIUM confidence, anecdotal but consistent with broader guidance on new-domain indexing timelines
- Direct inspection of `.planning/design-handoff/concept-1a.html`, `.planning/design-handoff/README.md`, `.planning/design-handoff/LANDING-PAGE-SEO-BRIEF.md`, and `.planning/PROJECT.md` — HIGH confidence, primary project source (this is how Pitfalls 1 and 5 were identified as *current*, not hypothetical)

---
*Pitfalls research for: SEO-critical Next.js/Vercel landing page recreating a hand-authored HTML prototype, Chrome extension marketing site under strict claim-discipline rules*
*Researched: 2026-07-24*

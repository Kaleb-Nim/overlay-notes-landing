# Feature Research — Landing Page Elements

**Domain:** Marketing landing page for a free Chrome extension (Overlay Notes) — SEO + Chrome Web Store conversion
**Researched:** 2026-07-24
**Confidence:** MEDIUM overall (web-search-only sourcing; individual claims tagged LOW per source hierarchy, but corroborated across 3+ independent competitor examples and industry data points)

Scope note: keyword research and section outline are done (SEO brief §9/§10). This file
answers a narrower question: what does a *complete, competitive* extension landing page
contain in 2026, and — critically — what is the current `concept-1a.html` design missing.

---

## 1. Conversion elements — what actually drives install click-through

**Table stakes**, grounded in the pages actually reviewed (Hypothesis, Glasp, Weava,
Raindrop.io, Obsidian Web Clipper) plus CRO research:

- **Hero = headline + one-sentence value prop + CTA, all above the fold, zero scroll.** Every
  competitor reviewed does this. `concept-1a.html` already does this correctly (H1 → subhead →
  CTA row, all in the first viewport above 760px). No change needed.
- **Contrasting-color primary button + a visibly secondary button.** Present already (`#5b3df5`
  fill vs. dashed outline). Good.
- **Repeat the CTA below the fold**, not just once in the hero — pages that read past the hero
  and still have to scroll back up to install lose intent. `concept-1a.html` has only ONE Add-to-
  Chrome button on the whole page (in the hero). This is a table-stakes gap (see §7).

**Social proof for a pre-traction extension (the actual hard problem here).** Real examples
diverge sharply by traction stage:

- Hypothesis and Weava lean on *numbers* (300+ institutions, 2M+ users, quantified outcome
  stats, testimonial quotes) — not usable here, this extension has zero installs/ratings and
  fabricating any of it is explicitly out of scope (PROJECT.md).
- What pre-traction/indie pages substitute instead, seen across smaller extensions and generally
  recommended in landing-page research:
  - **Specificity over scale.** A named, concrete origin story ("built while cramming for NUS
    CS2030") reads as more credible than a vague claim, precisely *because* it can't be faked.
    `concept-1a.html` already has this (the origin card) — keep it, it is doing real trust work.
  - **Named, verifiable affiliation.** Footer/copy attribution to a known open-source project
    (Excalidraw, MIT-licensed) already present — borrows credibility without claiming anything
    about the extension itself.
  - **Concrete, unfaked mechanism claims** ("100% local," "no account," "works offline") stand
    in for social proof when there's no crowd to point to. Raindrop.io's landing copy is the
    clearest real-world analog: instead of a review count, it leads with a specific, checkable
    technical claim ("access only when you click it," "no background data collection") right
    next to the feature description — precision as the trust signal.
  - **Open-source visibility** — a live GitHub link (already present) lets a skeptical visitor
    verify the claims themselves. This is a legitimate substitute for star counts/ratings and
    costs nothing to add since the repo already exists.
- Complexity: LOW (all of the above are copy/placement changes, not new components).

**Trust signals for `<all_urls>`-style broad access** — see §2, this is a dedicated problem.

---

## 2. The permissions/trust problem — do good extension pages address it head-on?

**Yes, the better-executed pages address it explicitly, not just with a generic privacy
blurb.** Two patterns, seen in the research:

1. **Narrow the ask and say so.** Raindrop.io's landing page states, in plain language, that
   the extension "only requires minimal permissions — it can access the current tab only when
   you click it, with no background data collection," and that additional permissions are
   requested only when an optional feature needs them. This directly defuses the "why does this
   need access to everything" objection by naming the specific, narrower mechanism.
2. **Explain *why* the broad grant is unavoidable, in the visitor's terms**, when the product
   genuinely needs it (which Overlay Notes does — it draws an overlay canvas on *any* page by
   design, so it cannot use `activeTab`-only the way a bookmarklet-style tool can). Obsidian Web
   Clipper's page pairs the permission reality with a concrete, falsifiable claim: "saved locally
   to your vault... data is not collected, no usage metrics gathered." The pattern is: (a) name
   the permission, (b) say plainly why the product's core feature requires it, (c) state exactly
   what is and isn't collected, in the same breath.

**This is a genuine gap in the current design**, not just a thin section. The design-handoff
README confirms a `Privacy` section exists only as a plan (brief §10: "Privacy (100% local, no
account, offline) → link to /privacy.html"), and `concept-1a.html` as built has **no Privacy
section at all** — only a footer link to `privacy.html`. Recommendation:

- **v1 (should-have, not just nice-to-have):** Build the Privacy section per brief §10, and
  explicitly add one sentence addressing the permission itself — something like: "Overlay Notes
  draws directly on the page you're viewing, so it needs to run on the sites you visit. It
  never reads, transmits, or collects your browsing data — nothing leaves your browser." This
  is fully supportable by the certified privacy statement already in scope; it just needs the
  "why it needs to run everywhere" sentence added, which is a copy-only change.
- Complexity: LOW (copy + one section, no new components; the section is already planned in
  the brief, just not yet built in the design file).

---

## 3. Demo media — static screenshot vs. GIF vs. video vs. interactive demo

Industry data corroborates the project's existing decision, with one nuance:

- **LCP is a real, measured conversion lever, not just an SEO nicety.** Pages with LCP under
  2.5s show materially higher median conversion (~5.1%) than pages over 4s (~3.4%); one cited
  case study reports up to 61% conversion lift from LCP improvement. A 1280×800 hero image is
  already the single biggest asset on this page — the static-screenshot decision (deferring the
  7.8MB video) is the *correct* call for a hero, not a compromise. **Confidence: MEDIUM** (numbers
  come from marketing-industry blog posts, not a peer-reviewed source — directionally reliable,
  treat exact percentages as illustrative).
- **Video's conversion upside is real but conditional.** Video can lift conversion significantly,
  but every source agrees: never autoplay, especially never with sound, and it must not replace
  the headline/CTA in the first viewport. A 7.8MB autoplay-style asset as the *hero* would be
  the wrong move regardless of format; a click-to-play video *below* the hero (after LCP has
  already fired) avoids the CWV cost entirely. This validates the project's plan to defer it
  rather than reject it outright.
- **GIF is a genuine middle ground the current design doesn't use anywhere.** GIFs carry the
  "clicking X does Y" comprehension benefit of video (visible motion, low cognitive load) without
  blocking the main paint the way a large video does, since a GIF can be lazy-loaded below the
  fold or deferred without affecting hero LCP. A short (2–4s), small (<500KB), looping GIF of the
  draw-and-scroll interaction placed in the "What you can do" or "How it works" section — never
  the hero — is a reasonable v1.x addition once the static hero has proven itself.
- **Interactive demos** (Arcade/Storylane-style embedded product tours) are a differentiator
  category some SaaS landing pages use, but they require third-party embed scripts, add JS
  weight and a privacy/tracking surface that directly contradicts the "100% local, nothing
  collected" positioning of this specific product. **Anti-feature for this project** — the
  privacy claim is the differentiator; adding a third-party demo-tracking embed undermines it.

Recommendation: keep static screenshot for v1 hero (validated, don't change). Candidate v1.x:
one small looping GIF in a secondary section. Effort: LOW (screen-record + `gifsicle`/`ffmpeg`
compress, no code). Do not build an interactive demo embed — conflicts with the privacy claim.

---

## 4. SEO/content surface area — does a single page suffice?

**A single page is correct for v1** (explicitly scoped that way in PROJECT.md — no blog, no
docs site). But the research surfaces two concrete, low-effort v2 patterns worth flagging now
so they aren't reinvented later:

- **Use-case / "[X] + [feature]" pages are the highest-leverage long-tail pattern for a
  single-feature extension**, evidenced by a directly analogous real case: **NightEye** (a dark-
  mode browser extension) grew to 2,500 paying customers largely by publishing one short page
  per major website that lacked native dark mode, targeting queries like `"[website] + dark
  mode"`. The exact same pattern maps onto Overlay Notes: pages like "annotate MDN docs",
  "draw on GitHub pull requests", "sketch on Wikipedia" — each a short page reusing the existing
  screenshot assets plus 150–250 words of unique copy, targeting a long-tail query with near-zero
  competition. This is the single best-corroborated SEO opportunity found in this research.
  - Effort: LOW per page (template + one screenshot + copy), but volume matters — 5–10 pages is
    a MEDIUM-effort v2 project, not a one-off.
- **Comparison pages ("Overlay Notes vs. Excalidraw", "vs. Hypothesis", "vs. Weava") capture
  high-intent switching/comparison searches.** This is a well-established SaaS SEO pattern
  (comparison pages target users already evaluating alternatives). For this project specifically,
  the brief already identifies `excalidraw chrome extension` as the single most winnable keyword
  with no maintained direct competitor — a dedicated "vs. Excalidraw" page would double down on
  that exact opportunity with more depth than the single paragraph the current design allocates
  to it.
  - Effort: MEDIUM (needs careful, claim-verified comparison content — get this wrong and it
    reads as unfair/dishonest, which actively damages trust for a privacy-positioned product).
- **A blog is explicitly out of scope and this research does not recommend reversing that.**
  Blogs are a maintenance liability for a solo, no-revenue side project (the "success metric" in
  PROJECT.md is installs + Search Console impressions, not content marketing reach) and the
  use-case/comparison-page pattern above captures most of the same long-tail value at a fraction
  of the ongoing cost.

Recommendation: keep single-page v1. Flag use-case pages as the **top v2 SEO candidate**
(LOW effort/page, well-corroborated pattern), comparison pages as **secondary v2 candidate**
(MEDIUM effort, higher payoff on the one keyword that matters most), blog as **not
recommended**.

---

## 5. Accessibility + theme — dark mode, reduced motion, keyboard, focus

**This is the most concrete gap category found**, because it can be checked directly against
`concept-1a.html`'s actual CSS rather than inferred from competitors.

- **`prefers-reduced-motion` is table stakes, not optional, for the squiggle animation.**
  WCAG Success Criterion 2.3.3 (Animation from Interactions) and the broader "Pause, Stop, Hide"
  guidance both treat unconditional decorative animation as a conformance issue when it can't be
  disabled. `concept-1a.html`'s `.sq path` rule runs a `stroke-dashoffset` animation unconditionally
  on every page load with **no `@media (prefers-reduced-motion: reduce)` guard anywhere in the
  stylesheet** (confirmed — the CSS has exactly one `@keyframes` block and zero
  `prefers-reduced-motion` queries). This is a genuine, verifiable gap, not a hypothetical one.
  - Fix is trivial: wrap the animation in `@media (prefers-reduced-motion: no-preference)` or add
    a `reduce` override that sets `stroke-dashoffset: 0` immediately. Effort: LOW (a few lines
    of CSS).
- **Dark mode: the design has no `prefers-color-scheme` handling at all.** The entire palette
  (`--paper`, `--ink`, etc.) is hardcoded to one light "paper" theme with no dark variant. PROJECT.md's
  active requirement is "readable in light and dark browser themes" — as built, the page will
  render identically regardless of the visitor's OS/browser theme (it doesn't invert or go
  unreadable, since colors are absolute, not inherited from system defaults), so the literal
  "readable" bar is technically met. But this is worth flagging as an open question for
  requirements: does "readable in dark browser themes" mean *not broken* (already true) or
  *visually adapted* (not built, and a real gap if that's the intent)? No competitor site
  reviewed treats this as mandatory — light-only marketing pages are still the norm even at
  major players (Hypothesis, Raindrop, Obsidian's own site) — so this is MEDIUM priority, not
  a blocker.
- **Keyboard focus states: not removed, but not enhanced either.** Scanning the full stylesheet,
  there is no `outline: none` anywhere — so native browser focus rings will still appear on the
  nav links, buttons, and GitHub link, meaning keyboard nav is not actually broken. There is
  also no custom `:focus-visible` styling to match the hand-drawn brand (e.g., a marker-style
  focus ring), which every competitor site reviewed also lacks — this is a differentiator
  opportunity, not a table-stakes gap.
- **Dead in-page nav — a real, confirmed bug, not a11y-adjacent nice-to-have.** The nav in
  `concept-1a.html` renders "Features · How it works · FAQ" as three bare `<span>` elements with
  **no `href` and no matching in-page anchor** (there is no `#features`, `#how-it-works`, or
  `#faq` id anywhere in the HTML, and the sections themselves — How it works, FAQ — don't exist
  yet in the design). This isn't an accessibility nicety, it's non-functional UI: those nav items
  currently do nothing when clicked, keyboard or not. Fix requires the missing sections to exist
  first (see §7), then wiring the nav to real `#id` anchors.

Recommendation: `prefers-reduced-motion` guard is v1 table stakes (LOW effort, direct WCAG
relevance, zero design cost). Dark-mode *adaptation* (vs. just not-broken) is a requirements
question to resolve, not an automatic gap — flag it upstream rather than building silently.
Custom focus styling is a v1.x/v2 differentiator. The dead nav links are a build-blocking bug
once "How it works" and "FAQ" exist as real sections — they must be wired together in the same
pass.

---

## 6. Anti-features — what commonly hurts extension landing pages

None of the reviewed extension pages (Hypothesis, Glasp, Weava, Raindrop, Obsidian Web
Clipper) use the aggressive patterns below, which is itself a signal that this category of
product (privacy/utility tool, not a funded SaaS with a growth team) tends to avoid them:

| Anti-feature | Why it seems appealing | Why it actively hurts here | Verdict |
|---|---|---|---|
| Cookie consent banner | "Legally required" reflex | Center-modal consent overlays measurably raise bounce (25–40% in cited research); more importantly, a page with no third-party tracking/cookies has **nothing to get consent for** — a banner would be actively dishonest scaffolding for a privacy-first product | Do not build. Confirm analytics setup (Vercel Analytics/Speed Insights per PROJECT.md) doesn't require one; if it does, a minimal, non-blocking, bottom-bar notice only — never a center modal |
| Newsletter signup modal | Capture emails for later marketing | No email list exists or is planned for this project (no revenue model, no CRM); an interruption modal for a nonexistent list is friction with zero payoff | Do not build |
| Chat widget / support bubble | "Looks professional" | Adds JS weight, a third-party script, and a support channel nobody staffs for a free side project; directly works against LCP goals | Do not build |
| Fake urgency ("Limited spots", countdown timers) | Common CRO trick | Nothing is actually limited (free, unlimited installs); fabricated urgency is a credibility risk for a product whose only asset *is* credibility (privacy claims) | Do not build |
| Fabricated ratings/review stars | Social proof reflex | Explicitly out of scope per PROJECT.md and a Google structured-data policy violation (`aggregateRating` without real data) | Already correctly excluded — no action needed, just don't reintroduce it later |
| Autoplay video/audio | "More engaging" | Directly contradicts the LCP-protecting screenshot-hero decision already made, and autoplay video is called out by name as a CWV/UX anti-pattern across every source reviewed | Already correctly avoided (no video in v1) — preserve this if a demo GIF/video is added later: click-to-play only |

---

## 7. Gap analysis — what a competitive 2026 extension page has that this design does not

Cross-referenced directly against `.planning/design-handoff/README.md` (§1–7) and
`concept-1a.html`. Ordered by how confirmed/severe each gap is.

| # | Gap | Confirmed how | v1 or v2 | Effort |
|---|---|---|---|---|
| 1 | **No visible "How it works" section.** Brief §10 calls for an H2 walkthrough (toggle → grab pill → draw → autosaves); nav even advertises a "How it works" link. `concept-1a.html` has zero matching section, and README's "Still to build" list only names FAQ + Privacy — this section is missing from *both* the design and the README's own gap list. | Read `concept-1a.html` end to end: sections are nav, hero, who, band, diff+origin, footer — no "How it works" heading anywhere. | **v1** — it's in the approved brief's page structure, so it's not a new scope, it's an unbuilt requirement. | LOW–MEDIUM (4-step visual list reusing existing copy from STORE-LISTING.md's "HOW TO USE" section per brief §11) |
| 2 | **No visible Privacy section.** README explicitly flags this as "still to build." Currently only a footer link to `privacy.html` exists — the strongest trust asset this product has (a certified "nothing is collected" statement) is one click removed from the page instead of stated on it. | README "Still to build" item 2; `concept-1a.html` footer has only `<a href="privacy.html">Privacy</a>`, no on-page section. | **v1** — already planned in brief §10, just not built. | LOW (copy-only, verbatim statement already certified) |
| 3 | **No explicit permission-scope explanation** ("why does this run on every page"). Not called out in the brief's outline at all — this is this research's own recommended addition, layered into the Privacy section once built. | Not present anywhere in `concept-1a.html`; brief §10 Privacy bullet says only "100% local, no account, offline," no permission-specific language. | **v1** (fold into gap #2's build, one extra sentence) | LOW |
| 4 | **No visible FAQ section.** README flags this explicitly; the FAQPage JSON-LD exists in `concept-1a.html`'s `<head>` but none of the 6 questions appear as page text — a direct Google guideline violation risk (schema-only FAQs) already flagged in the brief itself. | `concept-1a.html` `<script type="application/ld+json">` FAQPage block exists; no `<section>` with matching visible Q&A text anywhere in the `<body>`. | **v1** — brief-mandated, not new scope. | LOW (content already written in the JSON-LD, just needs a visible wrapper) |
| 5 | **Dead in-page nav links.** `<span>Features</span><span>How it works</span><span>FAQ</span>` have no `href` and no matching `id` exists on the page. Functionally broken navigation, not a style nit. | Read the nav markup directly; grepped the file for `id=` — no `#features`/`#how-it-works`/`#faq` anchors exist. | **v1** — must be fixed once gaps #1 and #4 are built (wire the nav to the new sections). | LOW (once sections exist) |
| 6 | **No `prefers-reduced-motion` handling** on the squiggle animation. | Confirmed by reading the full `<style>` block — one `@keyframes scribble`, zero `prefers-reduced-motion` queries. | **v1** — direct WCAG relevance, trivial fix, called out by name in the milestone brief. | LOW |
| 7 | **Only one CTA on the whole page** (in the hero). No repeated "Add to Chrome" further down after the visitor has read the differentiation/origin content — the exact point research says a second conversion opportunity should exist. | Grepped `concept-1a.html` for `chromewebstore.google.com` — appears exactly once. | **v1.x** (nice lift, not launch-blocking since the page is short enough that the hero CTA stays reachable) | LOW (repeat the existing button markup near the footer or after the origin card) |
| 8 | **No dark-mode (`prefers-color-scheme`) adaptation.** Palette is hardcoded; page won't invert for OS/browser dark-theme users. | Confirmed via `:root` variables — all absolute hex values, no `@media (prefers-color-scheme: dark)` block. | **Ambiguous — flag to requirements**, not an automatic v1 build. PROJECT.md's "readable in ... dark browser themes" is arguably already met (nothing breaks) even without adapting. No competitor reviewed treats this as mandatory. | MEDIUM if a real dark palette is required (new color set + testing); LOW if "readable, not adapted" is confirmed sufficient |
| 9 | **No custom focus-visible styling** for keyboard users (native outlines still work, just unbranded). | Confirmed no `outline` or `:focus` rule anywhere in the stylesheet. | **v2 differentiator** — not broken, just unpolished; matches competitor norm. | LOW |
| 10 | **No social-proof/trust substitute beyond the existing "Free · Chrome · 100% local" pill and origin story.** Competitors at real traction lean on numbers this project can't ethically use; the cheaper substitutes (explicit "open source, verify it yourself" framing, linking the permission claim directly to the GitHub source) aren't used yet. | Compared design's `.pill` + `.origin` content against the patterns in §1/§2 above — no permission-specific or "verify it yourself" copy exists. | **v1.x** — cheap copy addition once the Privacy section (#2/#3) exists. | LOW |
| 11 | **No use-case or comparison pages** (multi-page SEO surface). Single page only, as intentionally scoped. | PROJECT.md Out of Scope explicitly limits to a single page for v1. | **v2**, see §4 for effort breakdown per pattern. | LOW per use-case page; MEDIUM for comparison pages |
| 12 | **No demo GIF/video anywhere** — deliberate v1 scope decision, validated by CWV research, not a gap to fix blindly. | PROJECT.md Out of Scope: "Demo video... stays out of v1." | **v1.x candidate**: a small looping GIF (not the deferred 7.8MB video) in a secondary section, once the static hero has shipped and LCP is confirmed healthy. | LOW |

**Net read:** gaps #1, #2, #3, #4, #5, #6 are not really "new features" at all — they're the
brief's own page structure (§10) and the README's own "still to build" list, not yet
implemented in `concept-1a.html`. The requirements-definition step downstream should treat
these six as core v1 scope, not optional polish. Gaps #8–#12 are genuinely new findings from
this research and should be triaged as noted (mostly v1.x/v2, one needs a requirements
decision rather than an automatic build).

---

## Feature Landscape Summary

### Table Stakes (must have or the page underperforms)

| Feature | Why Expected | Complexity | Notes |
|---|---|---|---|
| Above-the-fold hero: headline + value prop + CTA | Universal across every competitor reviewed | LOW | Already built correctly |
| Visible FAQ text matching FAQPage schema | Google guideline compliance + brief-mandated | LOW | Gap #4 |
| Visible Privacy section (not footer-only) | Strongest trust asset for a privacy-positioned product | LOW | Gap #2 |
| Permission-scope explanation ("why every page") | Defuses the #1 objection to `<all_urls>`-style extensions | LOW | Gap #3 |
| `prefers-reduced-motion` guard on decorative animation | WCAG 2.3.3 conformance | LOW | Gap #6 |
| Working in-page nav anchors | Basic functional UI, currently broken | LOW | Gap #5 |
| "How it works" walkthrough section | Brief §10 requirement, reduces install friction by setting expectations | LOW–MEDIUM | Gap #1 |
| No fabricated social proof (ratings, install counts, urgency) | Chrome Web Store + Google policy; also just honest | N/A | Already correctly excluded |

### Differentiators (competitive advantage)

| Feature | Value Proposition | Complexity | Notes |
|---|---|---|---|
| Named, specific origin story (NUS CS2030) | Unfakeable credibility substitute for a pre-traction product | LOW | Already built — keep |
| "Verify it yourself" framing tied to the open GitHub repo | Turns the lack of ratings into a transparency asset instead of a weakness | LOW | Not yet written into copy |
| `excalidraw chrome extension` positioning in "How it's different" | Only unmaintained direct competitor in this exact niche | LOW | Already built |
| Repeated CTA below the fold | Second conversion opportunity after the visitor is convinced | LOW | Gap #7 |
| Small looping demo GIF (not the deferred video) | Shows the draw+scroll mechanic without the CWV cost of video | LOW | v1.x candidate |
| Use-case pages ("annotate MDN docs", etc.) | Best-corroborated long-tail SEO pattern for single-feature extensions (NightEye precedent) | LOW per page | v2 — see §4 |
| Comparison page vs. Excalidraw | Doubles down on the single most winnable keyword | MEDIUM | v2 — see §4 |

### Anti-Features (commonly added, actively hurts here)

| Feature | Why Requested | Why Problematic | Alternative |
|---|---|---|---|
| Cookie consent banner | "Legally required" reflex | Nothing to consent to on a no-tracking page; center-modal versions measurably raise bounce | Confirm analytics needs no banner; if it does, a non-blocking bottom bar only |
| Newsletter signup modal | Capture emails | No email program exists or is planned | Skip entirely |
| Chat widget | "Looks supported" | JS weight, unstaffed channel, hurts LCP | Skip; GitHub Issues already exists as a support channel |
| Fake urgency / countdown | CRO trick | Nothing is actually scarce (free, unlimited) | Skip |
| Fabricated ratings/reviews | Social-proof reflex | Explicit policy violation + already out of scope | Skip — already correctly excluded |
| Autoplay video | "More engaging" | Contradicts the LCP-protecting hero decision already made | Click-to-play only, if/when video is added |
| Third-party interactive-demo embed (Arcade/Storylane-style) | "Modern SaaS" pattern | Adds tracking scripts that contradict the "100% local, nothing collected" positioning | Skip — GIF is the right middle ground for this product |

---

## MVP Definition

### Launch With (v1)

- [ ] "How it works" section built and nav-linked (Gap #1)
- [ ] Privacy section built as visible content, including the permission-scope sentence (Gaps #2, #3)
- [ ] FAQ section built as visible text matching the existing JSON-LD (Gap #4)
- [ ] In-page nav anchors wired to real sections (Gap #5)
- [ ] `prefers-reduced-motion` guard added to the squiggle animation (Gap #6)

### Add After Launch (v1.x)

- [ ] Second "Add to Chrome" CTA lower on the page (Gap #7)
- [ ] "Verify it yourself" / open-source trust copy near the Privacy section (Gap #10)
- [ ] Small looping demo GIF in a secondary section, once static-hero LCP is confirmed healthy (Gap #12)
- [ ] Custom focus-visible styling matching the hand-drawn brand (Gap #9)

### Future Consideration (v2+)

- [ ] Use-case pages targeting "annotate [popular site]" long-tail queries (Gap #11)
- [ ] Comparison page: Overlay Notes vs. Excalidraw (Gap #11)
- [ ] Dark-mode palette adaptation — pending a requirements decision on whether "readable in dark themes" means adapted or merely not-broken (Gap #8)
- [ ] Additional comparison pages (vs. Hypothesis, vs. Weava) if the Excalidraw comparison page performs

---

## Sources

- Hypothesis / hypothes.is landing page (web.hypothes.is) — social annotation platform,
  reviewed for social-proof and CTA patterns. Confidence: LOW-MEDIUM (fetched page summary).
- Glasp (glasp.co) — social web highlighter, reviewed via search results (direct fetch blocked,
  HTTP 403). Confidence: LOW.
- Weava Highlighter — reviewed via search results for testimonial/social-proof placement.
  Confidence: LOW.
- Raindrop.io — reviewed via search results for permission-minimization and trust-copy pattern
  (the strongest, most directly applicable example found for the permissions question).
  Confidence: LOW-MEDIUM (multiple corroborating snippets).
- Obsidian Web Clipper — reviewed via search results for privacy-copy pattern. Confidence: LOW.
- Excalidraw / Excalidraw+ — reviewed via search results, general design/positioning reference
  only (not an extension, so not used for permission/CTA specifics). Confidence: LOW.
- NightEye case study (browser extension, dark-mode) — cited in a marketing blog as the source
  of the use-case-page SEO pattern. Confidence: LOW (single secondary source, but the mechanism
  described — one page per target site/keyword — is a well-understood, independently verifiable
  SEO pattern regardless of the specific numbers cited).
- Industry CRO/CWV research on LCP-conversion correlation, cookie-banner bounce impact, and
  video/GIF conversion behavior — aggregated from multiple marketing-industry blog posts via
  web search. Confidence: LOW (directional, not peer-reviewed; treated as illustrative rather
  than exact in this document).
- WCAG 2.3.3 / `prefers-reduced-motion` guidance — MDN, CSS-Tricks, A11Y Collective. Confidence:
  MEDIUM (standards-adjacent documentation sources, higher reliability than general marketing
  blogs).
- `concept-1a.html` and `.planning/design-handoff/README.md` — read directly, in full, as the
  primary source for the entire Gap Analysis section (§7). Confidence: HIGH (first-party,
  directly inspected).

---
*Feature research for: browser-extension landing page (Overlay Notes)*
*Researched: 2026-07-24*

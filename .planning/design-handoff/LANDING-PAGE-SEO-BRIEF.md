# Handoff Brief — Overlay Notes Landing Page (SEO)

**For:** the agent building the landing page
**Written:** 2026-07-23
**Status:** ready to execute — research is done, do not redo it

---

## 1. Mission

`https://kaleb-nim.github.io/overlay-notes/` is currently a **privacy policy**. It is the
project's only web-indexable property, and it is optimized for nothing — no meta
description, no Open Graph tags, no structured data, no sitemap, `<title>` is
`Overlay Notes — Privacy Policy`.

Turn it into a real landing page for the Chrome extension, and move the privacy policy
to its own URL. The product is a Chrome MV3 extension that overlays a transparent,
Excalidraw-style sketch canvas on any webpage so you can handwrite notes on top of what
you're reading; notes pin to the content, save per URL locally, and reappear on revisit.

**Why this matters more than the other SEO levers:** the Chrome Web Store listing is
gated behind store-side ranking you don't control. This page you fully control, it can
rank in Google for long-tail queries, and it's what renders when the author shares the
project on LinkedIn (a prior post got 151 reactions against a bare, preview-less link).

---

## 2. BLOCKING CONSTRAINT — read this before you move anything

`store/STORE-LISTING.md` declares this exact URL as the extension's **privacy policy URL**
in the Chrome Web Store Developer Dashboard:

```
https://kaleb-nim.github.io/overlay-notes/
```

If you turn `/` into a marketing page, that field points at a page with no privacy policy.
A missing or non-responsive privacy policy URL is a Chrome Web Store **policy violation**
and a review-rejection risk for an extension that runs on `<all_urls>`.

So the move is only complete when all three of these happen:

1. The full privacy policy is live at a new URL — use `/privacy.html`. Do not abridge it;
   move the existing content verbatim.
2. `store/STORE-LISTING.md` § "Privacy policy URL" is updated to the new URL.
3. The brief flags to the human that they must update the URL field in the Developer
   Dashboard. **You cannot do this step** — it is a dashboard action. Put it in your
   summary as a required human follow-up.

Also link the privacy page from the landing page footer. Never leave the policy
reachable only by direct URL.

---

## 3. Deployment facts (verified 2026-07-23)

| Fact | Value |
|---|---|
| Pages source | branch **`pages`**, path **`/docs`** |
| Build type | `legacy` (plain static, no Jekyll config, no build step) |
| Live URL | `https://kaleb-nim.github.io/overlay-notes/` |
| HTTPS enforced | yes |
| Custom domain | none |

**The publishing gotcha:** the working branch is currently **20 commits ahead of
`origin/pages`**. Committing to the working branch does **not** deploy. Getting `docs/`
onto the `pages` branch is a separate step — surface it explicitly in your summary rather
than assuming a commit went live.

**The publish root is `/docs`.** Anything outside it is unreachable. The current page
already trips on this: it references `../public/icon/128.png`, which **404s in production**
(confirmed). An `onerror` handler hides it, so the live page silently renders with no
logo. Copy any asset you need into `docs/` — do not reach outward with `../`.

---

## 4. Current-state audit

| Item | State |
|---|---|
| `<title>` | `Overlay Notes — Privacy Policy` — wrong page identity |
| `<meta name="description">` | absent |
| canonical | absent |
| Open Graph / Twitter card | absent — LinkedIn shares render bare |
| JSON-LD structured data | absent |
| `robots.txt` | **404** |
| `sitemap.xml` | **404** |
| `H1` | `Overlay Notes` — brand only, no keyword |
| Header logo | **404** in production (`../public/` is outside the publish root) |
| Screenshots | reachable — `/overlay-notes/screenshots/*.png` returns 200 |

---

## 5. Deliverables

```
docs/index.html      ← landing page (new content, replaces privacy policy)
docs/privacy.html    ← the existing privacy policy, content moved verbatim
docs/robots.txt      ← allow all + sitemap pointer
docs/sitemap.xml     ← both URLs
docs/icon-128.png    ← copy of public/icon/128.png (fixes the 404)
docs/og-image.png    ← 1200×630 social card — see §8, must be created
```

Keep it a single self-contained static page. No build step, no framework, no CDN
dependencies — inline the CSS. The existing page's visual style (purple `#5b3df5`
accent, system font stack, 720px content column) is a reasonable starting point;
you may widen and restyle for a landing page, but stay lightweight.

---

## 6. The `<head>` block — exact values

```html
<title>Draw & Annotate Notes on Any Webpage — Overlay Notes</title>
```
52 chars. Google truncates around 60. Keyword-first, brand last — deliberate, the brand
has no search volume yet.

```html
<meta name="description" content="Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to the content and save per page, 100% local.">
```
158 chars. Leads with the search terms, states the price (free), names the platform.

```html
<link rel="canonical" href="https://kaleb-nim.github.io/overlay-notes/">
<meta name="viewport" content="width=device-width, initial-scale=1">
<html lang="en">
```

Open Graph + Twitter (this is what fixes LinkedIn previews):

```html
<meta property="og:type"        content="website">
<meta property="og:url"         content="https://kaleb-nim.github.io/overlay-notes/">
<meta property="og:title"       content="Draw & Annotate Notes on Any Webpage — Overlay Notes">
<meta property="og:description" content="A free Chrome extension that puts an Excalidraw-style sketch canvas on any website. Handwrite notes over what you're reading — they scroll with the page and save locally.">
<meta property="og:image"       content="https://kaleb-nim.github.io/overlay-notes/og-image.png">
<meta property="og:image:width"  content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card"        content="summary_large_image">
```
`og:image` **must be an absolute URL** — relative paths break on every scraper.

---

## 7. Structured data (JSON-LD)

Two blocks, both in `<head>`. Validate against Google's Rich Results Test before finishing.

**`SoftwareApplication`** — makes the page eligible for app rich results:

```
@type            SoftwareApplication
name             Overlay Notes
applicationCategory  BrowserApplication
operatingSystem  Chrome
description      <same as meta description>
url              https://kaleb-nim.github.io/overlay-notes/
image            https://kaleb-nim.github.io/overlay-notes/og-image.png
offers           { @type: Offer, price: "0", priceCurrency: "USD" }
```

Do **not** include `aggregateRating` or `review`. The extension has no ratings yet;
fabricating them is both a Google structured-data violation and dishonest. Add it later
when real ratings exist.

**`FAQPage`** — this is the long-tail play. Each question must also appear as visible
text on the page (schema-only FAQs violate Google's guidelines). Use questions people
actually type:

- How do I draw on a webpage in Chrome?
- Can I annotate a website and save my notes?
- Is there an Excalidraw extension for Chrome?
- Do my notes stay on the page when I scroll?
- Are my notes private / stored anywhere online?
- Does it work offline?

---

## 8. The OG image — you must create this

No suitable asset exists. Every screenshot is 1280×800 (16:10); the social card needs
**1200×630** (1.91:1). Cropping 1280×800 to 1200×630 loses the top or bottom of the UI.

Build a proper card: product name, the one-line value proposition, and a cropped canvas
screenshot showing sketch marks over real page text. `docs/screenshots/01-annotate-example.png`
is the best source frame. Save as `docs/og-image.png`.

---

## 9. Keyword targets

Derived from competitor listing names and search results — these are the terms with
demand, in priority order.

**Primary** (must appear in title, H1, or first paragraph):
`draw on webpage` · `annotate webpage` · `web annotation chrome extension` ·
`handwritten notes on webpage`

**Secondary** (section headings and body copy):
`website highlighter` · `study notes chrome extension` · `annotate articles` ·
`active reading` · `mark up a web page` · `annotate research papers`

**Long-tail / low competition — the winnable ones:**
`excalidraw chrome extension` · `draw on any website` · `notes that scroll with the page` ·
`annotate a webpage and save it` · `sketch on top of a website`

**`excalidraw chrome extension` is the single most winnable keyword.** The only direct
competitor in that niche (`lukesmurray/scrawl` on GitHub) is unmaintained and has no
store listing. Make that exact phrase appear verbatim in visible page copy.

**Do not keyword-stuff.** Each term once, in a natural sentence. Chrome Web Store policy
and Google's spam policies both penalize stuffing, and it reads badly to humans.

---

## 10. Page structure

```
H1   Draw and annotate notes on any webpage
     └ subhead: the value prop in one sentence
     └ primary CTA: "Add to Chrome" → Chrome Web Store listing URL
     └ secondary CTA: "View on GitHub"
     └ hero: annotate-mode screenshot or the demo video

H2   What you can do              (feature list — pull from STORE-LISTING.md)
H2   Who it's for                 (students, researchers, self-learners, devs reading docs)
H2   How it's different           (vs highlighter extensions / vs Excalidraw / vs screenshot tools)
H2   How it works                 (toggle → grab pill → draw → autosaves per URL)
H2   Privacy                      (100% local, no account, offline) → link to /privacy.html
H2   Frequently asked questions   (the §7 FAQ questions, visible)
footer  GitHub · Privacy · Excalidraw (MIT) attribution
```

**The CTA problem:** the Chrome Web Store listing is currently **Unlisted** and has no
public URL recorded anywhere in the repo. If the human hasn't supplied a store URL, do
not invent one and do not ship a dead button — point the primary CTA at the GitHub repo
and flag in your summary that the store URL must be swapped in once the listing goes
public.

---

## 11. Copy — source of truth

**Use `store/STORE-LISTING.md` as the canonical copy source.** It was rewritten on
2026-07-23 specifically for search relevance and is claim-verified. Its `WHAT YOU CAN DO`,
`WHO IT'S FOR`, `HOW IT'S DIFFERENT`, `HOW TO USE`, and `PRIVACY` sections map almost
one-to-one onto the page structure above.

`README.md` § "Why I built this" is the source for the origin story (built while studying
for NUS CS2030) — good for an about/story block, and genuinely differentiating.

**Do not use README.md for UI mechanics.** It still describes the older two-mode
annotate/browse pill, which was superseded by the single-mode grab pill. `STORE-LISTING.md`
has the accurate current behavior.

### Claim discipline — non-negotiable

Every claim must be traceable to `STORE-LISTING.md` or `README.md`. These are **explicitly
out of scope** and must not appear anywhere on the page:

> PDF annotation · Firefox · Safari · cloud sync · accounts · export to PNG/SVG ·
> search across notes · a dashboard of annotated pages · collaboration or sharing

Inventing any of them is a Chrome Web Store policy problem and misleads users. Do not
soften or embellish the privacy claims either — "nothing is collected, transmitted, sold,
or shared" is a certified statement in the Developer Dashboard and must stay exact.

---

## 12. Assets

| Path | Size | Use |
|---|---|---|
| `docs/screenshots/01-annotate-example.png` | 1280×800 | hero / OG source |
| `docs/screenshots/02-browse-example.png` | 1280×800 | click-through demo |
| `docs/screenshots/03-strict-csp-github.png` | 1280×800 | "works everywhere" |
| `docs/screenshots/04-popup.png` | 496×300 | popup / per-page management |
| `store/screenshots/0{1,2,3}-*.png` | 1280×800 | real-world study contexts (MDN, blog) |
| `public/icon/128.png` | 128×128 | logo — **copy into `docs/`** |
| `store/video/overlay-notes-launch.mp4` | 7.8 MB | demo video |

Two cautions. `store/` is **outside the Pages publish root** — copy anything you use into
`docs/`. And `store/video/` is currently **untracked in git**; at 7.8 MB, confirm with the
human before committing it. A poster-image-plus-click-to-play beats autoplay for both
performance and Core Web Vitals.

Every `<img>` needs descriptive, keyword-natural alt text. Not `"screenshot"` —
`"Handwritten notes and arrows drawn over an MDN JavaScript article"`.

---

## 13. Acceptance checklist

Verify each of these before declaring done. Report actual results, not assumptions.

- [ ] `/` is the landing page; `/privacy.html` returns the full policy verbatim
- [ ] `store/STORE-LISTING.md` privacy URL updated to `/privacy.html`
- [ ] No `../` asset references anywhere; logo renders in production
- [ ] `robots.txt` and `sitemap.xml` both return 200
- [ ] Title ≤60 chars, meta description ≤160 chars
- [ ] `og:image` is an absolute URL and the file is exactly 1200×630
- [ ] Both JSON-LD blocks pass Google's Rich Results Test
- [ ] Every FAQ in the schema also appears as visible page text
- [ ] No `aggregateRating` / fabricated reviews
- [ ] Every image has descriptive alt text
- [ ] No out-of-scope feature claims (§11) — grep for: PDF, Firefox, Safari, sync, export
- [ ] Page is responsive; no horizontal scroll at 360px
- [ ] Renders in both light and dark browser themes
- [ ] Primary CTA points somewhere live (not a dead store link)

---

## 14. Human follow-ups (you cannot do these — list them in your summary)

1. **Update the privacy policy URL in the Chrome Web Store Developer Dashboard** to
   `/privacy.html`. The repo change alone does not update the dashboard.
2. **Deploy** — get `docs/` onto the `pages` branch. The working branch is 20 commits
   ahead of `origin/pages`; a commit is not a deploy.
3. **Submit to Google Search Console** and request indexing. Nothing ranks until Google
   knows the page exists.
4. **Set the repo's `homepage` field** — currently `null`. Point it at the store listing
   once public, or this page meanwhile.
5. **Add repo topics** — currently `[]`. Suggested: `chrome-extension`, `browser-extension`,
   `manifest-v3`, `excalidraw`, `annotation`, `web-annotation`, `note-taking`, `study-tool`,
   `active-reading`, `highlighter`, `wxt`, `indexeddb`, `react`, `typescript`.
6. **Swap the CTA to the real store URL** once the listing flips from Unlisted to Public.

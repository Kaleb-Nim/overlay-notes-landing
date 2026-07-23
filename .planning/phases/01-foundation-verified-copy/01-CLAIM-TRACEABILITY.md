# Phase 1: Claim Traceability

Every visible-copy claim locked for this project maps to a named source line in
`/Users/kalebnim/Documents/GitHub/overlay-notes/store/STORE-LISTING.md` or
`.../README.md` (CONT-01), or is explicitly documented as an author-supplied fact
where no such line exists. This artifact is checked programmatically by
`scripts/verify-claims.ts` (`bun scripts/verify-claims.ts`), which reads this file
and asserts the required phrases are present, in addition to running the banned-term
scan against `lib/content.ts`.

## Claim → Source Table

| Claim (verbatim) | Source | Notes |
|---|---|---|
| "nothing is collected, transmitted, sold, or shared" | `store/STORE-LISTING.md` PRIVACY section, sentence 2 (certified Chrome Web Store Developer Dashboard text) | CONT-03. Must not be reworded/reordered anywhere it appears, including inside `lib/content.ts`'s privacy FAQ answer. Case at sentence start is expected to vary ("Nothing…" vs "nothing…"). |
| "excalidraw chrome extension" | `.planning/design-handoff/concept-1a.html` line 210 ("vs. Excalidraw" diff copy), corroborated by `store/STORE-LISTING.md` "HOW IT'S DIFFERENT" | CONT-04. Appears lowercase in the design source — must appear lowercase in Phase 2's rendered JSX. Lives in Phase 2's diff-column copy, NOT in `lib/content.ts` (see Note below). |
| "free and always will be" | `concept-1a.html` line 228, corroborated by the absence of any paid tier or pricing anywhere in `store/STORE-LISTING.md` | CONT-08. Not a literal STORE-LISTING.md quote — a reasonable inference from the $0/no-tier fact (the extension has no purchase flow, no subscription, no paid feature gate). Documented as an inference, not a verbatim source match. |
| "no accounts, no ads, nothing tracked" | `concept-1a.html` line 228, corroborated by `README.md` "Local-first & private — your notes live only in your browser" and `store/STORE-LISTING.md` "No account, no backend" | CONT-08. Contains the word "accounts" as a negation ("no accounts") — this is one of the two documented whitelist exceptions the banned-term scan intentionally skips (see below). |
| Solo developer covers hosting/build costs | `concept-1a.html` line 228 ("I'm a solo developer covering the hosting and build costs myself") | CONT-08. New-to-the-landing-page framing, not present verbatim in STORE-LISTING.md/README.md (both describe the extension, not the landing page's own hosting arrangement) — documented as an author-supplied fact about the landing page itself, out of scope for extension-repo traceability. |
| FAQ (6 pairs) — see `lib/content.ts` `faqs[]` | Each entry individually source-tagged in `lib/content.ts` | CONT-06. Verified against `store/STORE-LISTING.md` and `README.md` this session — see `lib/content.ts` for the per-entry `source` field. |
| Origin story (verbatim NUS CS2030 paragraph) | `concept-1a.html` line 216 `.origin p`, corroborated by `README.md` "Why I built this" — "This started while I was studying for NUS CS2030." | CONT-07. Verbatim from the design handoff, which is this project's source of truth for exact wording. |

**Note on CONT-04:** "excalidraw chrome extension" is not one of the two content-module
items `lib/content.ts` holds (`faqs[]` and `originStory`). It lives in Phase 2's
"vs. Excalidraw" diff-column JSX (`The excalidraw chrome extension that draws on the
live page — not a blank canvas.`), matching `concept-1a.html` line 210 verbatim. It is
tracked here, independently of `lib/content.ts`, so the traceability artifact still
covers it before Phase 2 renders it.

## CONT-08 Reconciliation — "nothing tracked" vs. this site's own Vercel Analytics

The support-section copy states the extension has "no accounts, no ads, nothing
tracked." Separately, this landing page itself installs `@vercel/analytics` (Plan
01-01) for page-view reporting — a tension worth reconciling explicitly rather than
silently ignoring.

**Resolution:** Vercel Web Analytics is **cookieless** and collects only aggregate
page-view counts with no persistent identifiers, no cross-site tracking, and no
individual user profiles — it cannot re-identify a visitor across sessions or sites.
Under a "no individual/personal tracking" reading (the reading a reasonable visitor
would apply to a privacy-forward product's marketing claim), "nothing tracked" remains
defensible: it describes the *extension's* behavior (which genuinely collects, stores,
and transmits nothing — see the CONT-03 privacy statement above, verified against the
certified Developer Dashboard text), while the *landing page's* own cookieless,
aggregate-only analytics is a materially different, much narrower category of data
collection that does not contradict the claim as a reasonable reader would understand
it. This paragraph is the reconciliation — the locked copy itself is not reworded.

## CONT-05 — SEO Keyword Targets (from `LANDING-PAGE-SEO-BRIEF.md` §9)

Each keyword below is tracked to appear **at most once** across Phase 2's rendered
copy — no keyword stuffing (CLAUDE.md constraint, CONT-05).

```
Primary:    draw on webpage · annotate webpage · web annotation chrome extension ·
            handwritten notes on webpage
Secondary:  website highlighter · study notes chrome extension · annotate articles ·
            active reading · mark up a web page · annotate research papers
Long-tail:  excalidraw chrome extension · draw on any website ·
            notes that scroll with the page · annotate a webpage and save it ·
            sketch on top of a website
```

"excalidraw chrome extension" is both the CONT-04 required verbatim phrase and a
CONT-05 long-tail keyword target — a single occurrence in the diff-column copy
satisfies both requirements simultaneously; it must not be repeated elsewhere.

## Documented Whitelist Exceptions

The banned-term scan (`scripts/verify-claims.ts`) uses case-insensitive whole-word
matching against the list: PDF, Firefox, Safari, sync, accounts, export, cross-note
search, dashboards, collaboration, sharing. Two locked phrases are required copy that
would otherwise false-positive on this list, and are explicitly whitelisted:

1. **"no accounts, no ads, nothing tracked"** — contains the word "accounts" as a
   negation (CONT-08's required support claim). This is the opposite of claiming an
   accounts feature exists.
2. **"…sold, or shared"** — the tail of the CONT-03 certified privacy statement
   ("nothing is collected, transmitted, sold, or shared"). The word "shared" is a
   distinct token from the banned feature-term "sharing"; whole-word matching alone
   resolves this, but the phrase is also explicitly whitelisted for auditability.

No other occurrences of these banned terms are permitted anywhere in `lib/content.ts`.

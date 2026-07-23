# Architecture Research

**Domain:** Single-page Next.js App Router marketing site, static, SEO-critical, deployed to Vercel
**Researched:** 2026-07-24
**Confidence:** HIGH (Next.js file conventions verified against current `/vercel/next.js` docs via Context7; design/content decisions verified against the project's own `PROJECT.md`, design handoff, and `concept-1a.html` prototype)

## System Overview

This is a static-content system with three concerns wired together through one config module. There is no backend, no client-side state, and — with one narrow exception (the squiggle draw-in, which is pure CSS) — no JavaScript runtime behavior at all.

```
┌───────────────────────────────────────────────────────────────────┐
│                      lib/site-config.ts (single source)            │
│   baseUrl · name · tagline · description · links · ogImage path    │
└───────────────┬───────────────────┬───────────────┬────────────────┘
                │                   │               │
                ▼                   ▼               ▼
┌───────────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│ app/layout.tsx         │ │ app/sitemap.ts   │ │ lib/schema.ts         │
│ generateMetadata /     │ │ app/robots.ts    │ │ (SoftwareApplication, │
│ metadataBase           │ │                  │ │  FAQPage builders)    │
└───────────────┬────────┘ └──────────────────┘ └──────────┬────────────┘
                │                                          │
                ▼                                          ▼
┌───────────────────────────────────────────────┐ ┌──────────────────────┐
│ app/page.tsx — 8 section components            │ │ components/json-ld  │
│ Nav · Hero · WhoItsFor · WhatYouCanDo ·         │ │ (renders both        │
│ HowItsDifferent(+OriginStory) · Faq · Footer    │ │  schema blocks)      │
└───────────────┬─────────────────────────────────┘ └──────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│ lib/content.ts — faqs[] (question/answer/source)│
│  consumed by BOTH the visible <Faq> component   │
│  AND lib/schema.ts's FAQPage builder            │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│ app/opengraph-image.tsx (next/og, build-time)   │
│ reads public/annotate-hero.png + reads           │
│ lib/site-config.ts for title text                │
└───────────────────────────────────────────────┘
```

Everything above renders once, at build time, with no `fetch`, no `revalidate`, no route params. Vercel serves the output as static assets from its edge network.

### Component Responsibilities

| Component | Responsibility | Notes |
|-----------|----------------|-------|
| `lib/site-config.ts` | The ONE place `baseUrl` and shared identifiers live | Read by layout, sitemap, robots, schema, OG image |
| `lib/content.ts` | Claim-bearing copy + FAQ data, each with a `source` pointer | Read by `Faq` component and `lib/schema.ts` |
| `lib/schema.ts` | Pure functions that build JSON-LD objects from config + content | No JSX, fully typed, unit-testable in isolation |
| `components/json-ld.tsx` | Generic `<script type="application/ld+json">` renderer | Takes typed `data` prop, used twice in `layout.tsx` |
| `components/sections/*` | One Server Component per visual section | Own their CSS Module; no shared state; no client JS |
| `app/layout.tsx` | Metadata object (`metadataBase`, OG, Twitter), font loading, JSON-LD injection | The only place `generateMetadata`/`metadata` needs to exist — this is not a multi-route site |
| `app/page.tsx` | Composition root — imports and orders the 8 sections | Thin; no logic |
| `app/sitemap.ts`, `app/robots.ts` | File-convention routes, both read `siteConfig.baseUrl` | Auto-served at `/sitemap.xml`, `/robots.txt` |
| `app/opengraph-image.tsx` | Build-time image compositing via `next/og` | Auto-wires into `layout.tsx`'s `og:image` through Next's file convention |

## Recommended Project Structure

```
overlay-notes-landing/
├── app/
│   ├── layout.tsx              # metadata, metadataBase, font loading, JSON-LD injection
│   ├── page.tsx                # composition root — imports the 8 sections in order
│   ├── globals.css             # :root design tokens, reset, ruled-paper background, @font-face fallback
│   ├── icon.png                # Next.js favicon file convention (browser tab icon)
│   ├── opengraph-image.tsx     # next/og — the 1200×630 social card, build-time
│   ├── sitemap.ts              # MetadataRoute.Sitemap, reads siteConfig.baseUrl
│   └── robots.ts               # MetadataRoute.Robots, reads siteConfig.baseUrl
│
├── components/
│   ├── json-ld.tsx             # <JsonLd data={...} /> — generic, typed
│   └── sections/
│       ├── nav.tsx
│       ├── nav.module.css
│       ├── hero.tsx
│       ├── hero.module.css
│       ├── who-its-for.tsx
│       ├── who-its-for.module.css
│       ├── what-you-can-do.tsx
│       ├── what-you-can-do.module.css
│       ├── how-its-different.tsx     # also renders <OriginStory /> as a child — see rationale below
│       ├── how-its-different.module.css
│       ├── origin-story.tsx
│       ├── origin-story.module.css
│       ├── faq.tsx                   # maps lib/content.ts's faqs[] to visible <details>/<dl>
│       ├── faq.module.css
│       ├── footer.tsx
│       └── footer.module.css
│
├── lib/
│   ├── site-config.ts          # THE base-URL / identity single source of truth
│   ├── content.ts               # faqs[] + claim-bearing copy blocks, each with a `source` field
│   └── schema.ts                 # buildSoftwareApplicationSchema(), buildFaqSchema()
│
├── assets/
│   └── og-fonts/                 # raw .ttf buffers for next/og (Satori can't use next/font)
│       ├── ShantellSans-Bold.ttf
│       └── PublicSans-Regular.ttf
│
├── public/
│   ├── icon.png                  # 128×128 app icon — Nav renders this via next/image at 34×34
│   └── annotate-hero.png         # 1280×800 hero screenshot — hero AND og-image source
│
├── next.config.ts
├── package.json                  # bun, not npm
└── tsconfig.json
```

### Structure Rationale

- **`lib/` holds the two things that must never drift**: the base URL and the FAQ/claim copy. Both are read by more than one consumer (metadata + sitemap + robots + schema; visible FAQ + FAQPage schema), which is exactly the condition under which extracting to a shared module earns its keep.
- **`components/sections/` is flat, not nested into atoms/molecules.** Nine files, one level deep. There is no shared design-system layer to build because nothing here is reused — each section appears exactly once on exactly one page. A deeper hierarchy (e.g., splitting each feature card or each chip into its own file) would be over-architecting: those elements have no independent identity, no reuse, and no state.
- **`assets/og-fonts/` is separate from `next/font`.** `next/font` self-hosts fonts for the *rendered HTML page* (a webpack/Turbopack build step); `next/og`'s `ImageResponse` (Satori) needs raw font buffers passed explicitly via its `fonts` option — it cannot consume `next/font`'s output. Keeping them in a clearly-labeled separate folder prevents someone from "helpfully" trying to make the OG image use `next/font` and hitting a runtime error.
- **No `/privacy` route.** PROJECT.md is explicit: the privacy policy stays on GitHub Pages. The footer link is an external `<a>`, not a Next.js route. Do not build a page for content that isn't moving.

## Architectural Patterns

### Pattern 1: Single-source base URL, everything else derives

**What:** One module owns `baseUrl` (and other site-wide identity fields). Every consumer that needs an absolute URL imports from it — nothing hardcodes `overlay-notes.kalebnim.dev` a second time.

**When to use:** Always, for this project. The domain is explicitly called out in PROJECT.md as something that "may change," and there are five independent consumers (canonical, OG, sitemap, robots, two JSON-LD blocks) that must all update in lockstep if it does.

**Trade-offs:** None meaningful here — this is close to zero-cost. The only discipline required is: never write `https://overlay-notes.kalebnim.dev` literally anywhere else in the codebase.

```typescript
// lib/site-config.ts
const rawBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const siteConfig = {
  name: "Overlay Notes",
  tagline: "Draw & Annotate Notes on Any Webpage",
  description:
    "Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to the content and save per page, 100% local.",
  baseUrl: new URL(rawBaseUrl),
  ogImagePath: "/opengraph-image", // Next resolves this against metadataBase automatically
  links: {
    github: "https://github.com/kaleb-nim/overlay-notes",
    chromeWebStore:
      "https://chromewebstore.google.com/detail/overlay-notes/ogekdbffoapphpabjphfgeppildcleck",
    privacyPolicy: "https://kaleb-nim.github.io/overlay-notes/",
    excalidraw: "https://excalidraw.com",
  },
} as const;
```

```typescript
// app/layout.tsx
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/json-ld";
import { buildSoftwareApplicationSchema, buildFaqSchema } from "@/lib/schema";

export const metadata: Metadata = {
  metadataBase: siteConfig.baseUrl,          // every relative URL below resolves against this
  title: `${siteConfig.tagline} — ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: `${siteConfig.tagline} — ${siteConfig.name}`,
    description: siteConfig.description,
    images: [siteConfig.ogImagePath],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <JsonLd data={buildSoftwareApplicationSchema()} />
        <JsonLd data={buildFaqSchema()} />
        {children}
      </body>
    </html>
  );
}
```

```typescript
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.baseUrl.toString(), lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
  ];
}
```

```typescript
// app/robots.ts
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", siteConfig.baseUrl).toString(),
  };
}
```

Note the `NEXT_PUBLIC_SITE_URL ?? VERCEL_URL ?? localhost` fallback chain — this is what makes preview deployments correct without any manual step (see Deployment Topology below).

### Pattern 2: Content-as-data only where duplication is real

**What:** Extract to `lib/content.ts` only the copy that (a) must be traceable to `STORE-LISTING.md`/`README.md` per PROJECT.md's claim-discipline requirement, and (b) appears in more than one place. Do not extract copy that appears exactly once and carries no schema obligation (nav labels, button text, footer links).

**When to use:** The FAQ is the clearest case — it must render as visible page text AND as `FAQPage` JSON-LD, verbatim, or Google's guidelines are violated. A single array is the only way to guarantee those never drift apart. For the rest of the page's claims (hero value prop, chip list, feature-card text, comparison copy, origin story), a lighter version of the same idea earns its keep here specifically because PROJECT.md names "reconcile every claim against STORE-LISTING.md" as an explicit build task — a flat list of `{ text, source }` records is what makes that pass mechanically checkable instead of a manual eyeball pass over JSX.

**Trade-offs:** This is the one place real over-engineering risk exists. Resist the urge to build a generic CMS-shaped content schema, per-section nested types, or nested nav structures. Keep it to plain arrays/records with a `source` string. If a piece of copy has no claim to trace (it's structural — "GitHub", "Add to Chrome"), leave it inline in JSX; don't force it into the module for consistency's sake.

```typescript
// lib/content.ts
export interface Faq {
  question: string;
  answer: string;
  source: string; // pointer into ../overlay-notes/store/STORE-LISTING.md or README.md
}

export const faqs: Faq[] = [
  {
    question: "How do I draw on a webpage in Chrome?",
    answer:
      "Install Overlay Notes, open the grab pill on any page, and draw directly over the content with the marker, shapes, arrows or text tools.",
    source: "STORE-LISTING.md#how-to-use",
  },
  {
    question: "Can I annotate a website and save my notes?",
    answer: "Yes. Notes save automatically per URL in your browser and reappear when you return to the page.",
    source: "STORE-LISTING.md#what-you-can-do",
  },
  // ... 4 more, one array, both consumers read it
];

export interface ClaimBlock {
  text: string;
  source: string;
}

export const featureCards: ClaimBlock[] = [
  { text: "Draw over any website — freehand, arrows, shapes, text.", source: "STORE-LISTING.md#what-you-can-do" },
  { text: "Notes pin to the content, not the screen.", source: "STORE-LISTING.md#what-you-can-do" },
  { text: "Saved per URL, locally. Reappears on revisit — no account.", source: "STORE-LISTING.md#privacy" },
  { text: "Works on strict sites like GitHub. Offline too.", source: "STORE-LISTING.md#what-you-can-do" },
];
```

```tsx
// components/sections/faq.tsx
import { faqs } from "@/lib/content";
import styles from "./faq.module.css";

export function Faq() {
  return (
    <section className={styles.faq} id="faq">
      <h2>Frequently asked questions</h2>
      <dl>
        {faqs.map((f) => (
          <div key={f.question}>
            <dt>{f.question}</dt>
            <dd>{f.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

```typescript
// lib/schema.ts
import { siteConfig } from "./site-config";
import { faqs } from "./content";

export function buildSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome",
    description: siteConfig.description,
    url: siteConfig.baseUrl.toString(),
    image: new URL(siteConfig.ogImagePath, siteConfig.baseUrl).toString(),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  } as const;
}

export function buildFaqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } as const;
}
```

```tsx
// components/json-ld.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

No `schema-dts` dependency is worth adding for two schema shapes on one page — hand-rolled `as const` object literals with a two-function module are enough type safety, and the reconciliation pass has one array to walk (`faqs`) rather than a dependency to learn.

### Pattern 3: Design tokens as plain CSS custom properties, not Tailwind `@theme`

**What:** Port the prototype's `:root` custom properties into `app/globals.css` verbatim, keep the ruled-paper `repeating-linear-gradient` on `body` in the same file, and give each section component a co-located CSS Module (`hero.module.css`, `faq.module.css`, etc.) that mirrors the prototype's already-section-scoped CSS (the prototype's stylesheet is literally organized with `/* nav */`, `/* hero */`, `/* who */` comment dividers — this is a near 1:1 port, not a redesign).

**When to use:** This project, specifically, because a large fraction of the prototype's visual language is one-off transforms and absolute positioning that doesn't map cleanly to a utility-class system: `rotate(-1.5deg)` pill badges, `:nth-child(odd/even)` alternating card rotation, an absolutely-positioned "tape" rectangle and hand-drawn SVG arrow, a hard drop-shadow (`3px 4px 0 var(--ink)`) button. Reproducing these in Tailwind means either arbitrary-value classes for nearly every element (`rotate-[-1.5deg]`, `shadow-[3px_4px_0_#211d2e]`) — which is more verbose than the CSS it replaces and adds a translation step where fidelity can silently drift — or dropping to raw `style=` props anyway, which defeats the point of adopting a utility system. Whatever the Stack research recommends Tailwind for elsewhere (if anything), design tokens and section layout for this page should stay in copy-paste-able CSS.

**Trade-offs:** You lose Tailwind's autocomplete/tree-shaking conveniences and gain nothing from a design-token abstraction layer (`@theme`) that this page's tokens don't need — they're already a flat list of ~13 CSS custom properties with no light/dark theme switching (the brief only requires the page not to *break* under the browser's dark mode, not to re-theme). If a future milestone needs Tailwind for something else, `globals.css`'s `:root` block can be mapped into `@theme` at that point without touching any component — the custom properties are the portable artifact either way.

```css
/* app/globals.css */
:root {
  --paper: #f6f1e7;
  --rule: rgba(91, 61, 245, 0.1);
  --margin-red: rgba(214, 72, 72, 0.35);
  --purple: #5b3df5;
  --purple-dark: #3f27c9;
  --ink: #211d2e;
  --head: #1c1830;
  --body: #4a4560;
  --dark: #211d2e;
  --dark-muted: #a9a4c4;
  --accent-red: #d64848;
  --yellow: #ffc93c;
}

html { scroll-behavior: smooth; }

body {
  margin: 0;
  color: var(--body);
  background:
    repeating-linear-gradient(var(--paper) 0 31px, var(--rule) 31px 32px),
    linear-gradient(var(--paper), var(--paper));
}
```

Each section's `.module.css` imports nothing from `globals.css` explicitly (CSS custom properties cascade globally by design) — it just references `var(--purple)` etc. directly, exactly as the prototype does.

## Data Flow

There is no request flow in the traditional sense — no database, no client fetch, no mutation. The only "flow" is build-time composition:

```
Build time:
  lib/site-config.ts ──┬──> app/layout.tsx (metadata, metadataBase)
                        ├──> app/sitemap.ts
                        ├──> app/robots.ts
                        ├──> lib/schema.ts (JSON-LD builders)
                        └──> app/opengraph-image.tsx (title text)

  lib/content.ts (faqs[]) ──┬──> components/sections/faq.tsx (visible)
                             └──> lib/schema.ts::buildFaqSchema() (structured data)

  public/annotate-hero.png ──┬──> components/sections/hero.tsx (<Image>)
                              └──> app/opengraph-image.tsx (cropped + composited)

Request time (per page view):
  Vercel edge serves the statically generated HTML/CSS/PNG — no server compute runs.
```

### Key Data Flows

1. **Base URL propagation:** `siteConfig.baseUrl` → `metadataBase` (layout) → every relative URL in `openGraph`/`alternates` resolves against it automatically → `sitemap.ts`/`robots.ts`/`schema.ts` read the same object directly (they don't go through `metadataBase`, since they're not part of the Metadata API — hence the explicit `siteConfig.baseUrl.toString()` calls in each).
2. **FAQ single-source:** `content.ts`'s `faqs` array is mapped twice — once into JSX (`<dl>`/`<dt>`/`<dd>`) for the visible section, once into the `FAQPage` schema's `mainEntity` array. Any edit to a question or answer happens in exactly one file and both outputs update together. This is the load-bearing pattern the brief's acceptance checklist depends on ("every FAQ in the schema also appears as visible page text").
3. **OG image compositing:** `app/opengraph-image.tsx` reads `public/annotate-hero.png` from disk at build time, base64-encodes it into a Satori `<img>` with `objectFit: "cover"` to crop 1280×800 down to fill a 1200×630 canvas, and overlays absolutely-positioned text using `siteConfig.tagline`. No separate cropped asset, no `sharp` dependency, no runtime cost — Next statically prerenders this route because it has no dynamic params.

## Scaling Considerations

Not applicable in the normal sense — this is a single static page with no user-generated content and no database. The only "scale" axis is traffic volume, and Vercel's CDN handles that identically at 10 visitors/day or 100k/day with zero architectural change. Do not add caching layers, ISR/ `revalidate` config, or a headless CMS for this page — there is nothing here that benefits from any of them, and adding them would be pure over-engineering for a page whose content changes maybe a few times a year.

The one thing worth planning for architecturally, not for scale but for correctness: if a demo video or a second page (blog, changelog) gets added in a later milestone (both currently out of scope per PROJECT.md), `lib/site-config.ts` and the sitemap/robots pattern already generalize — `sitemap.ts` becomes a small array instead of a single entry, and nothing about the base-URL pattern needs to change.

## Anti-Patterns

### Anti-Pattern 1: One monolithic `page.tsx` with all markup inline

**What people do:** For a "just one page," write all ~230 lines of JSX directly in `app/page.tsx` to avoid "unnecessary" file splitting.
**Why it's wrong:** The prototype's CSS is already cleanly partitioned by section (nav/hero/who/band/diff/origin/footer comment blocks) — collapsing that into one file throws away a structural gift the design handoff already gives you, makes the file that owns the FAQ (which must stay in lockstep with `lib/schema.ts`) hard to isolate for review, and makes future async work (parallel implementation of sections) impossible to parallelize cleanly.
**Do this instead:** 8 leaf Server Components (`Nav`, `Hero`, `WhoItsFor`, `WhatYouCanDo`, `HowItsDifferent` (which renders `OriginStory` as a child), `Faq`, `Footer`), each with a co-located CSS Module, assembled by a thin `page.tsx`. This is the decisive call for this project — do not go further in either direction.

### Anti-Pattern 2: Splitting further into atoms (Chip, Card, Pill, NoteLabel...)

**What people do:** Apply component-library instincts and extract every repeated visual shape (the 4 "who it's for" chips, the 4 feature cards, the pill badge) into its own reusable component with props.
**Why it's wrong:** None of these shapes repeat across sections, and none of them will ever be reused elsewhere — this is a one-page site with content that will not change often. A `<Chip label="📚 Students" rotate="-1deg" />` abstraction adds a prop-typing layer and an indirection cost for zero reuse benefit; the `:nth-child(odd/even)` alternating-rotation trick from the prototype is also simplest to keep as plain CSS rather than re-derive via a `rotate` prop.
**Do this instead:** Map arrays inline within the owning section component (e.g., `whoItsForChips.map(...)` inside `who-its-for.tsx`) using plain `<span className={styles.chip}>`, and let CSS `:nth-child` handle the alternating rotation exactly as the prototype does.

### Anti-Pattern 3: Runtime OG image generation, or hand-cropping a separate asset

**What people do:** Either build the OG image as an on-demand Edge Function route (recomputing the same static image on every social-scraper hit) or manually crop `annotate-hero.png` in an image editor and check in a second static asset.
**Why it's wrong:** There is exactly one OG image needed, ever (no per-page variation, since there's one page). Recomputing it per request wastes a function invocation for output that never changes. Hand-cropping a second asset creates a second thing to keep in sync if the hero screenshot is ever swapped.
**Do this instead:** `app/opengraph-image.tsx` with no dynamic params is automatically statically generated at build time by Next.js — write it once, it behaves like a static file in production, and it derives its crop from the same `public/annotate-hero.png` the hero section already uses.

### Anti-Pattern 4: A generic content/CMS abstraction for one page's copy

**What people do:** Given the "claim traceability" requirement, over-correct into a fully generic content schema — nested section types, a `content/` directory with one JSON file per section, or a markdown-based content pipeline.
**Why it's wrong:** This is a single page that will not be re-authored by a non-developer, has no localization requirement, and has ~6 FAQ entries plus ~4 feature-card blurbs needing traceability. A content pipeline is solving a problem (non-technical editors, multi-locale, frequent copy churn) this project doesn't have.
**Do this instead:** The flat `faqs: Faq[]` and `featureCards: ClaimBlock[]` arrays shown above in `lib/content.ts` — enough structure to make the reconciliation pass mechanical, not a framework.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Chrome Web Store | Static outbound link (`siteConfig.links.chromeWebStore`) | Real URL already exists (per PROJECT.md) — no dead-CTA problem to solve here, unlike the original GitHub Pages brief |
| GitHub Pages (privacy policy) | Static outbound link (`siteConfig.links.privacyPolicy`) | Explicitly out of scope to migrate; footer links out, nothing else touches it |
| Google Search Console | Manual submission, human follow-up | Not a code integration — `sitemap.ts` just needs to return 200 with the right URL |
| Vercel Analytics + Speed Insights | `@vercel/analytics` + `@vercel/speed-insights` packages, mounted in `app/layout.tsx` | Add via `bun add @vercel/analytics @vercel/speed-insights`; render `<Analytics />`/`<SpeedInsights />` inside `<body>` — zero config beyond that on Vercel |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `lib/site-config.ts` ↔ everything else | Direct import, read-only | No consumer ever mutates it; it's a plain constant object |
| `lib/content.ts` ↔ `components/sections/faq.tsx` and `lib/schema.ts` | Direct import of the same `faqs` array | This is the boundary the whole "no drift" requirement hinges on — never copy-paste FAQ text into either consumer |
| `components/sections/*` ↔ `app/page.tsx` | Plain function components, no props needed (no data varies per section) | Sections are pure, zero-prop, server-rendered — there is genuinely nothing to pass down |

## Build Order

Dependency-ordered; each item only needs what's listed before it.

1. **`lib/site-config.ts`** — no dependencies. Everything else needs this to exist first.
2. **`app/globals.css`** (design tokens, reset, ruled-paper background) and **font setup** (`next/font/google` self-hosted `Shantell Sans` + `Public Sans` in `app/layout.tsx`) — independent of site-config, can happen in parallel with step 1.
3. **`app/layout.tsx`** — metadata object using `metadataBase: siteConfig.baseUrl`, font `<html>` class wiring. Depends on (1) and (2).
4. **Copy reconciliation against `../overlay-notes/store/STORE-LISTING.md`** — an explicit pass, done before or alongside writing `lib/content.ts`, per PROJECT.md's claim-discipline requirement. This has to happen before section components are written with real copy, not after.
5. **`lib/content.ts`** (faqs + claim blocks, each `source`-tagged) — depends on (4) having produced verified copy.
6. **Section components** (`Nav`, `Hero`, `WhoItsFor`, `WhatYouCanDo`, `HowItsDifferent`+`OriginStory`, `Faq`, `Footer`) with their CSS Modules — depend on (2) for tokens and (5) for FAQ/claim copy. Can be built in parallel with each other once (2) and (5) exist.
7. **`app/page.tsx`** — imports and orders all of (6). Depends on every section existing (even as a stub) to compile.
8. **`lib/schema.ts`** (`buildSoftwareApplicationSchema`, `buildFaqSchema`) + **`components/json-ld.tsx`**, wired into `app/layout.tsx` — depends on (1) for site identity fields and (5) for the `faqs` array. Order relative to (6)/(7) doesn't matter; it only needs (1) and (5).
9. **`app/sitemap.ts`, `app/robots.ts`** — depend only on (1). Can happen any time after step 1, in parallel with everything else.
10. **Assets into place**: `public/icon.png`, `public/annotate-hero.png`, `assets/og-fonts/*.ttf`, `app/icon.png` (favicon convention) — needed before (11), otherwise can happen early/in parallel.
11. **`app/opengraph-image.tsx`** — depends on (1) for title text and (10) for the hero screenshot + font buffers.
12. **Validation pass**: Google Rich Results Test on both JSON-LD blocks, alt-text audit, 360px responsive check, light/dark browser theme check, grep for out-of-scope claim keywords (PDF, Firefox, Safari, sync, export, etc.) — last, after everything above exists.

## Deployment Topology

Repo → GitHub → Vercel project → custom subdomain, with preview deployments per PR.

1. **Push the repo to GitHub** (new standalone repo, per PROJECT.md's Key Decisions — not a subdirectory of the extension repo).
2. **Import the project into Vercel**, connecting the GitHub repo. Vercel auto-detects Next.js — zero config needed for the framework itself.
3. **First deploy happens immediately on the auto-assigned `*.vercel.app` domain.** This is the critical ordering point: the build succeeding is completely decoupled from DNS. Confirm the site builds and renders correctly here before touching the custom domain — this is what keeps the first deploy from being blocked on DNS propagation.
4. **Add the custom domain** (`overlay-notes.kalebnim.dev`) in the Vercel project's Domains settings. Vercel returns the required DNS record — for a subdomain (not the apex), this is a **CNAME** record pointing at `cname.vercel-dns.com`.
5. **Add that CNAME record** in `kalebnim.dev`'s DNS provider. Propagation and Vercel's automatic SSL certificate issuance happen after this — expect a delay of minutes to a couple hours, not something to block the rest of the checklist on.
6. **Set `NEXT_PUBLIC_SITE_URL=https://overlay-notes.kalebnim.dev`** in Vercel's Production environment variables (Project Settings → Environment Variables, scoped to Production only). Trigger a redeploy so `lib/site-config.ts` picks it up. Do **not** set this for Preview — leave Preview environments to fall back to `VERCEL_URL`, so preview deploys emit correct-for-themselves canonical/OG URLs instead of falsely claiming the production domain.
7. **Add Vercel Analytics + Speed Insights** (`bun add @vercel/analytics @vercel/speed-insights`, mount both in `app/layout.tsx`) — per PROJECT.md's requirement, and per Vercel's own instrumentation, this needs no additional dashboard step beyond enabling Analytics/Speed Insights in the project settings.
8. **Preview deployments are automatic** once the GitHub repo is connected — every PR gets a unique preview URL with no additional configuration. The only thing to verify is that step 6's env-var scoping is correct, so a preview build's `og:url`/canonical don't silently point at production.
9. **Submit the sitemap to Google Search Console** (human follow-up, cannot be automated) — nothing ranks until this happens, per the SEO brief.

## Sources

- Next.js `metadataBase` and `generateMetadata` conventions — `/vercel/next.js` docs via Context7 (canary docs tree, `generate-metadata.mdx`), HIGH confidence, official source.
- Next.js `app/sitemap.ts` / `app/robots.ts` file conventions — `/vercel/next.js` docs via Context7 (`robots.mdx`, static-export test fixture), HIGH confidence, official source.
- Next.js `next/og` `ImageResponse` and file-based `opengraph-image.tsx` conventions, including `<img>` compositing support (`objectFit`/`objectPosition`) and the `fonts` option — `/vercel/next.js` docs via Context7 (`image-response.mdx`, `opengraph-image.mdx`, `metadata-and-og-images.mdx`), HIGH confidence, official source.
- `.planning/PROJECT.md` — project constraints, key decisions, out-of-scope list. Primary source for this document's architectural boundaries.
- `.planning/design-handoff/README.md` and `.planning/design-handoff/concept-1a.html` — design tokens, 7-section structure, and the prototype's own CSS organization (directly informed the CSS Modules per-section pattern and the design-tokens recommendation).
- `.planning/design-handoff/LANDING-PAGE-SEO-BRIEF.md` — §5 deliverables, §6 head block, §7 structured data, §13 acceptance checklist. Directly informed the JSON-LD, sitemap/robots, and OG-image sections of this document.

---
*Architecture research for: single-page Next.js App Router marketing site (Overlay Notes landing page)*
*Researched: 2026-07-24*

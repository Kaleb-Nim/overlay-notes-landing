# Stack Research

**Domain:** SEO-critical, single-page Next.js marketing landing page (App Router) on Vercel, recreating a finished HTML/CSS prototype pixel-faithfully
**Researched:** 2026-07-24
**Confidence:** HIGH (versions/APIs verified directly against npm registry + official Next.js/Vercel docs via Context7 and WebFetch) — MEDIUM on Bun-runtime friction and Shantell Sans axis details (community/GitHub-issue sourced, cross-checked)

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | `16.2.11` (npm `latest` as of 2026-07-23) | App Router framework, Metadata API, `next/font`, `next/image`, `next/og` | Confirmed current stable on the npm registry. Ships the exact APIs this page needs natively — metadata objects, file-convention `robots.ts`/`sitemap.ts`, `next/font/google` self-hosting — with zero extra config. Do not pin to 15.x; there is no reason to run an older major on a greenfield project. |
| React | `19.2.8` | UI runtime | Matches Next 16's peer requirement. No App Router feature used here needs anything beyond what 19 already ships (no experimental APIs required). |
| TypeScript | `^5.9` (project-level pin; latest on npm is a `7.x` prerelease line — see note) | Type safety for metadata objects, `MetadataRoute` types | `npm view typescript version` currently resolves to a `7.0.2` tag, but this is a fresh major still stabilizing on the registry's `latest` dist-tag rotation; Next.js's own toolchain and `create-next-app` templates target the 5.x line. Pin `~5.9.x` deliberately rather than trusting whatever `latest` resolves to on install day — verify against Next.js's own `package.json` peerDependencies before locking. |
| Bun | latest (already installed) | Package manager + script runner | Author preference (global constraint), and works well in that role — see the dedicated Bun section below for the one thing NOT to do with it. |

### Rendering Mode — Decision

**Use default Next.js static rendering. Do not add `export const dynamic = 'force-static'` and do not set `output: 'export'`.**

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

Set once in `app/layout.tsx` (root layout), which is the correct place for `metadataBase` and any site-wide defaults; override per-page fields (title, description) if this ever grows past one route. For a true single-page site, it is simplest and equally correct to put the whole `metadata` object directly in `app/page.tsx` alongside a minimal `metadataBase` export from the layout.

```ts
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://overlay-notes.kalebnim.dev'),
  title: {
    default: 'Draw & Annotate Notes on Any Webpage — Overlay Notes',
    template: '%s — Overlay Notes',
  },
  description:
    "Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to the content and save per page, 100% local.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Draw & Annotate Notes on Any Webpage — Overlay Notes',
    description:
      "A free Chrome extension that puts an Excalidraw-style sketch canvas on any website. Handwrite notes over what you're reading — they scroll with the page and save locally.",
    images: [
      {
        url: '/og-image.png', // resolved to absolute via metadataBase — see note below
        width: 1200,
        height: 630,
        alt: 'Overlay Notes — handwritten annotations drawn over a webpage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Draw & Annotate Notes on Any Webpage — Overlay Notes',
    description:
      "A free Chrome extension that puts an Excalidraw-style sketch canvas on any website.",
    images: ['/og-image.png'],
  },
}
```

**`metadataBase` confirmed behavior (verified against current Next.js docs, HIGH confidence):**
- Relative paths in `openGraph.images`, `twitter.images`, and `alternates.canonical` are resolved against `metadataBase` into fully-qualified absolute URLs at build time. `/og-image.png` + `metadataBase: new URL('https://overlay-notes.kalebnim.dev')` → `https://overlay-notes.kalebnim.dev/og-image.png` in the rendered `<meta property="og:image">` tag. This satisfies the SEO brief's mandatory-absolute-URL requirement without hand-writing the domain into every field.
- If a field is given an already-absolute URL, `metadataBase` is ignored for that field (it never overrides an explicit absolute URL).
- **Do not skip `metadataBase`.** Without it, Next.js throws a build error the moment any metadata field uses a relative URL — so this isn't optional polish, it's required for the file to compile once you use relative asset paths.

## JSON-LD Structured Data — Recommended Pattern

Next.js's own guide (`docs/01-app/02-guides/json-ld.mdx`, HIGH confidence — official, current) is explicit: render a native `<script type="application/ld+json">` with `dangerouslySetInnerHTML`, directly in the page component. **Do not use `next/script`** for this — that component is built for optimizing executable JavaScript loading strategy, and structured data isn't executable JS; using it adds nothing and is explicitly called out as the wrong tool in Next's own docs.

```tsx
// app/page.tsx (or a small component rendered from it)
const softwareApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Overlay Notes',
  applicationCategory: 'BrowserApplication',
  operatingSystem: 'Chrome',
  description:
    'Overlay Notes is a free Chrome extension that lets you draw, annotate, and handwrite notes on any webpage. Notes pin to the content and save per page, 100% local.',
  url: 'https://overlay-notes.kalebnim.dev/',
  image: 'https://overlay-notes.kalebnim.dev/og-image.png',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    /* ...the 6 Q&A pairs, kept in sync with the visible FAQ section text... */
  ],
}

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* page content */}
    </>
  )
}
```

**Gotchas (both confirmed in official docs):**
1. `JSON.stringify` does not sanitize its output — escape `<` to `<` to prevent breaking out of the script tag (there's no user input here, so risk is low, but it's a one-line habit worth keeping since the FAQ copy will be edited by hand later).
2. Since the two blocks are static object literals with no per-request data, there's no reason to compute them in `generateMetadata` — inline them directly in the page component as shown.
3. The two blocks must never drift from the visible page content (FAQ questions, name, description) — since PROJECT.md flags that all copy needs reconciling against `STORE-LISTING.md`, treat the JSON-LD strings and the visible JSX as one edit, not two.

## OG Image Generation — Decision

**Ship a static, pre-composited `public/og-image.png`. Do not generate it at request/build time via `next/og`'s `ImageResponse` in an `opengraph-image.tsx` route.**

Why, given this specific card (a cropped hero screenshot + text composited together):

- `ImageResponse` has a hard **500KB total bundle budget** (JSX + CSS + fonts + images combined) per the official docs. `annotate-hero.png` alone is 278KB; add a self-hosted Shantell Sans weight for the headline text and you are already close to the ceiling before accounting for compression overhead of embedding a `<img>`-referenced binary asset in a Satori render tree. It's *possible* to keep this under budget with aggressive re-compression, but there is no upside to threading that needle for an image that is generated exactly once and never changes.
- `ImageResponse` renders through Satori, which supports flexbox and a **subset** of CSS — no CSS Grid, and cropping an image to an exact region (this card needs a specific crop of the 1280×800 screenshot, not the whole thing) means fighting `object-fit`/`overflow: hidden` behavior inside a renderer that wasn't built for photographic compositing. A one-time export from a real image tool (or a one-off Node script using `sharp`) gets pixel-exact control in less time than debugging Satori's layout subset.
- This page has **one** OG image, for **one** static route, that never varies per-request. The entire value proposition of `ImageResponse` — generating images dynamically per dynamic route (e.g., one per blog post) — doesn't apply here. Using it anyway adds a runtime function (even if edge-cached) for something that could be a zero-cost static file.

**Recommended path:** write a throwaway one-off script (Node/Bun, `sharp` or `satori` + `@resvg/resvg-js` — the same renderer `next/og` uses internally, just run outside the framework's bundle-size constraint) that crops/composites `annotate-hero.png` with the headline text at 1200×630, run it once during the build-asset phase, and commit `public/og-image.png` to the repo like any other static asset. Reference it as `/og-image.png` in metadata (resolved to absolute via `metadataBase`, per above). If the design changes, re-run the script — this is no different in maintenance cost from re-exporting any other static design asset.

## Fonts — `next/font/google`

**Both Shantell Sans and Public Sans are confirmed available in `next/font/google`** — they are standard entries in the Google Fonts catalog that `next/font/google` mirrors and self-hosts at build time (removing the render-blocking third-party request the current prototype's `<link href="fonts.googleapis.com/...">` still has — this is one of the concrete wins of the Next.js migration called out in PROJECT.md's Key Decisions).

Shantell Sans is a **5-axis variable font** (confirmed via the ArrowType/Shantell Martin foundry source, MEDIUM confidence — not first-party Next.js docs, but cross-checked against Google Fonts' own specimen page): `wght` (300–800), `ital` (0–1), `BNCE` (bounce, −100–100), `INFM` (informality, 0–100), `SPAC` (spacing, 0–100). The design only ever needs specific static weights/styles — it does not animate or vary BNCE/INFM/SPAC — so **no `axes` option is needed**. `next/font/google`'s `weight`/`style` parameters alone are sufficient; the non-weight axes stay at their default values (0) automatically, which matches the prototype's rendering exactly.

Because the italic style is only needed at weight 500 (not across all three weights), split into two calls per family rather than one combinatorial `weight: [...] × style: [...]` call — this avoids downloading unused italic-600/700 and italic-500/600/700-of-Public-Sans-at-400-only combinations:

```ts
// app/fonts.ts
import { Shantell_Sans, Public_Sans } from 'next/font/google'

export const shantellSans = Shantell_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal'],
  variable: '--font-shantell',
  display: 'swap',
})

export const shantellSansItalic = Shantell_Sans({
  subsets: ['latin'],
  weight: ['500'],
  style: ['italic'],
  variable: '--font-shantell-italic',
  display: 'swap',
})

export const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  variable: '--font-public',
  display: 'swap',
})

export const publicSansItalic = Public_Sans({
  subsets: ['latin'],
  weight: ['400'],
  style: ['italic'],
  variable: '--font-public-italic',
  display: 'swap',
})
```

Apply the `variable` class names on `<html>`/`<body>` in the root layout, then reference `var(--font-shantell)` / `var(--font-public)` in the global CSS `font-family` declarations that already exist in `concept-1a.html` (swap `'Shantell Sans', cursive` → `var(--font-shantell), cursive`, etc.) — this is a mechanical find-and-replace against the prototype's existing CSS, not a rewrite.

**Note on Space Grotesk:** the design tokens list it as "used for the URL chip in the .dc mock" — the `.dc` (design concepts) exploration file, not `concept-1a.html` itself. It does not appear in the concept-1a stylesheet or markup actually being built. Do not add it as a fourth font family unless a later design pass reintroduces it; importing an unused font family is pure waste on a performance-sensitive page.

## Images — `next/image` for the Hero

**Use `next/image`, not a plain `<img>`, for the 1280×800 hero screenshot** — despite this being "just" a static page, `next/image` is still the right call here, for reasons specific to this being the LCP element:

- Automatic AVIF/WebP re-encoding and responsive `srcset` generation mean the browser downloads a file sized to its actual rendered width (roughly half the 1120px content column on desktop, full-bleed on mobile ≤760px) rather than always fetching the full 1280×800 source PNG (278KB) regardless of viewport.
- `priority` on this single instance disables lazy-loading and adds a `<link rel="preload">` for it, which is exactly the LCP optimization Core Web Vitals rewards — and PROJECT.md explicitly calls out "LCP must not regress" as a constraint.
- Required `width`/`height` (or `fill` inside a sized wrapper) props eliminate the CLS that a raw `<img>` would risk if not equally disciplined about explicit dimensions — `next/image` makes this mandatory rather than a habit you have to remember.

```tsx
import Image from 'next/image'
import heroShot from '../public/annotate-hero.png' // or reference by string path from /public

<Image
  src={heroShot}
  alt="Handwritten notes, arrows and underlines drawn over a CS2030 lecture-notes webpage"
  width={1280}
  height={800}
  priority
  sizes="(max-width: 760px) 90vw, 540px"
  className="frame img" /* match prototype's .frame img styling */
/>
```

Using a static `import` (rather than a string `src`) additionally gets automatic `width`/`height` inference and build-time blur-placeholder generation for free, and guarantees the bundler catches a missing/renamed asset at build time instead of at runtime.

**When a plain `<img>` would be fine instead:** if this were a purely static-HTML export with no Vercel image optimization pipeline behind it (i.e., `output: 'export'` deployed somewhere without Vercel's Image Optimization API), `next/image` would fall back to `unoptimized` mode and buy you nothing over a plain tag with explicit dimensions. That's not this deployment target, so use `next/image`.

## Styling — Decisive Recommendation: Plain Global CSS, Not Tailwind, Not CSS Modules

**Recommendation: a single `app/globals.css` (optionally split into a few `@import`ed section files for readability) that is a near-verbatim port of the `<style>` block already in `concept-1a.html`, using CSS custom properties for the design tokens exactly as the prototype defines them.**

Why this beats Tailwind v4 for this specific job:

- The prototype is **finished, pixel-tested CSS** — every rotation (`rotate(-1.5deg)`, `rotate(2deg)`, alternating `nth-child(odd/even)` rotations), every hard-offset shadow (`3px 4px 0 var(--ink)`), the `repeating-linear-gradient` ruled-paper background, and the exact `clamp()` responsive H1 sizing are already correct and already reviewed as "final" per PROJECT.md's fidelity constraint. Porting this to global CSS is a mechanical translation: copy the `<style>` block, swap font-family values for the `next/font` CSS variables, done. Every value carries over 1:1 with the class names unchanged.
- Rewriting the same rules as Tailwind utility classes means translating one-off, non-scale values (`rotate(-1.5deg)`, `3px 4px 0 #211d2e`, `31px`/`32px` ruled-paper stops, `clamp(38px,5vw,54px)`) into Tailwind's arbitrary-value bracket syntax (`rotate-[-1.5deg]`, `shadow-[3px_4px_0_#211d2e]`, `bg-[repeating-linear-gradient(...)]`) almost everywhere, since none of these are on Tailwind's default scale. At that point Tailwind is contributing zero design-system value (there's no reuse across components to normalize — it's one page, most elements appear once) while adding a translation step where a copy-paste error can silently change the fidelity the whole exercise is trying to preserve.
- **CSS Modules** is a reasonable middle ground (scoped class names, same near-verbatim CSS) but buys nothing over global CSS on a genuinely single-page site with no naming collisions to worry about (no design system consumed by other routes/components). It adds a file-per-section indirection for zero collision risk avoided. Not wrong, just unnecessary ceremony here.
- The design tokens are already expressed as CSS custom properties in the prototype (`--paper`, `--purple`, `--ink`, etc.) — this is already the idiomatic "vanilla CSS design system" pattern; there's no gap Tailwind's `@theme` config would be filling that isn't already solved.

**Bottom line: treat `concept-1a.html`'s `<style>` block as the literal source of truth for `globals.css`. Change only (a) `font-family` values to point at the `next/font` CSS variables and (b) any selector that needs to move from a bare tag/class selector to a Next.js component's className, if JSX structure forces a wrapper `<div>` Next didn't have in the flat HTML file.** Do not introduce Tailwind for this project — there is no future multi-page/design-system need in scope (PROJECT.md explicitly scopes this to a single page, out-of-scope: blog/changelog/docs site).

## Robots & Sitemap — File Conventions

Current (Next.js 16, confirmed against official docs) shape — both are typed via `MetadataRoute` and are automatically statically prerendered with no special config:

```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://overlay-notes.kalebnim.dev/sitemap.xml',
  }
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://overlay-notes.kalebnim.dev',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://overlay-notes.kalebnim.dev/privacy.html',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
```

Both files live at `app/robots.ts` / `app/sitemap.ts` (not `public/`), export a plain (or `async`) default function, and Next.js serves them at `/robots.txt` and `/sitemap.xml` respectively with correct `Content-Type` headers — no manual route handler needed. This satisfies PROJECT.md's "robots.txt and sitemap.xml return 200" requirement with zero custom server code.

**Note:** per PROJECT.md's Out of Scope, the privacy policy stays on GitHub Pages (`kaleb-nim.github.io/overlay-notes/`) — do not include a `/privacy.html` entry pointing at *this* domain in the sitemap; only list routes that actually resolve on `overlay-notes.kalebnim.dev`. If the footer's Privacy link is an external absolute URL to the GH Pages site (as the design doc implies), the sitemap for this domain should contain only the single root route.

## Analytics Integration

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

Both components are enabled from the Vercel project dashboard (Analytics tab → Enable) after first deploy; the package alone doesn't activate collection.

## Bun Compatibility — What Actually Works, What Doesn't

**Use Bun as the package manager and script runner. Do not force the Bun runtime to execute the Next.js CLI itself.**

- `bun install` works cleanly for a Next.js project — `node_modules` produced is identical regardless of which package manager wrote it, since Next.js doesn't care who installed its dependencies. This is the safe, well-trodden 90% of "using Bun with Next.js."
- Friction shows up specifically when the **Bun runtime** (not just Bun-as-installer) is asked to execute Next's own build/dev process — confirmed via multiple open `oven-sh/bun` GitHub issues as recent as Next.js 16.0.x: TypeScript resolution failures in Bun workspaces (`bun#25014`), module-resolution ("Could not resolve") errors on `next build` under `bun --bun` (`bun#24829`, `bun#26244`). These are the `--bun` flag failure mode specifically — i.e., `bun --bun run dev`, which forces Bun to *replace* Node as the JS runtime for the invoked script, not plain `bun run dev` calling out to the ordinary `next` binary under Node.
- **Escape hatch / recommended `package.json` scripts:** keep `"dev": "next dev"`, `"build": "next build"`, `"start": "next start"` as normal, and invoke them with `bun run dev` / `bun run build` — this uses Bun purely as the script runner/installer, and the underlying `next` process still runs under Node's own resolution and API surface, sidestepping every issue above. Do not add `--bun` to these scripts.
- **Production is unaffected regardless:** Vercel's build platform runs `next build` under its own managed Node.js build image — Bun is a local-dev/CI convenience choice only, and has zero bearing on how the deployed build actually executes.

## Vercel Custom Subdomain — `overlay-notes.kalebnim.dev`

Confirmed against Vercel's current "Adding & Configuring a Custom Domain" docs (last updated 2026-02-27):

1. In the **new** project's dashboard → **Settings → Domains**, add `overlay-notes.kalebnim.dev` directly. It does not need to be added to, or removed from, whatever project currently serves the apex `kalebnim.dev`.
2. Because this is a **subdomain** (not an apex domain), Vercel requires a **CNAME record**, not an A record — apex domains need A records specifically because DNS forbids a CNAME at the zone root; subdomains have no such restriction.
3. Vercel issues a **unique CNAME target per project** (docs give the literal example format `d1d4fc829fe7bc7c.vercel-dns-017.com` — copy the exact value Vercel's dashboard shows for this specific project, don't reuse a generic `cname.vercel-dns.com` value from memory or from another project).
4. **Same-account apex domain is the easy case:** if `kalebnim.dev` is already verified under this author's own Vercel account (per PROJECT.md, it is — "a subdomain of the author's existing site"), no TXT ownership-verification step is required. TXT verification only triggers when the domain is currently registered to a *different* Vercel account than the one adding the new project's domain.
5. Where the actual CNAME record gets created depends on where DNS for `kalebnim.dev` is currently managed: if the zone already uses Vercel's own nameservers, add the record directly in Vercel's DNS Records UI for the domain; if DNS is still hosted at an external registrar, add the CNAME there instead. Either path is fine — Vercel's dashboard tells you which one applies once you add the domain and shows its current verification state.
6. Multiple subdomains of the same apex can point at **different, unrelated Vercel projects** simultaneously with no conflict — `overlay-notes.kalebnim.dev` → this project, `kalebnim.dev` (or `www.kalebnim.dev`) → whatever the author's existing personal site project is, coexist without any cross-project configuration.

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

**If a `/privacy.html` route or a `/faq` sub-route is ever added to this Next.js project itself (contradicting the current Out of Scope decision to keep privacy on GH Pages):**
- Add it to `app/sitemap.ts`'s returned array and reconsider whether `app/robots.ts`'s single root-only `sitemap` reference still models the site correctly.
- Because `PROJECT.md` currently locks privacy-policy hosting to GitHub Pages, this is speculative only — do not build it preemptively.

**If the design ever needs a second, per-share-context OG image (e.g., a distinct card for X/Twitter vs. LinkedIn):**
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

---
*Stack research for: SEO-critical Next.js App Router marketing landing page on Vercel*
*Researched: 2026-07-24*

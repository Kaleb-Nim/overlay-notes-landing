# Overlay Notes — Landing Page

The marketing and SEO home for **Overlay Notes**, a Chrome MV3 extension that overlays a
transparent, Excalidraw-style sketch canvas on any webpage so you can handwrite notes on
top of what you're reading. This is a standalone Next.js site deployed to Vercel at
`overlay-notes.kalebnim.dev` — separate from the extension repo. It exists to rank in
Google for long-tail annotation queries, to render a proper preview when the project is
shared on LinkedIn, and to convert visitors into Chrome Web Store installs.

**Core Value:** A visitor who lands here from a search or a shared link immediately understands what
Overlay Notes does and clicks through to install it — and the page is discoverable enough
that those visitors arrive in the first place.

This repo is the marketing/SEO site only. The Chrome extension itself lives at
[`https://github.com/kaleb-nim/overlay-notes`](https://github.com/kaleb-nim/overlay-notes).

Canonical production URL: [`https://overlay-notes.kalebnim.dev`](https://overlay-notes.kalebnim.dev)

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Plain global CSS, ported from the design prototype
- Bun as package manager and script runner
- Deployed on Vercel

## Commands

```bash
bun install                          # install dependencies
bun run dev                          # start the local dev server
bun run build                        # production build
bun run verify:claims                # check page copy against claim-traceability rules
bun run generate:og                  # regenerate the static OG image
bash scripts/test-gate.sh            # run the Playwright E2E gate
bun run verify:deploy <url>          # re-run the deployed-surface verifier against any URL
```

## Testing

See [`TESTING.md`](./TESTING.md) for the full Playwright E2E coverage map and how it
plugs into the project's verification workflow.

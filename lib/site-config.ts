// lib/site-config.ts
//
// Single source of truth for this site's base URL (FOUND-02). Every absolute-URL
// consumer (canonical, og:url, og:image, sitemap, JSON-LD — all Phase 3 concerns)
// derives from this constant so changing the domain is a one-line edit.

export const siteConfig = {
  baseUrl: 'https://overlay-notes.kalebnim.dev',
} as const;

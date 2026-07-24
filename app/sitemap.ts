import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

// Stable last-modified date for the single landing page. Pinned (not `new Date()`) so the
// sitemap does not signal false freshness to crawlers on every deploy — bump this only when
// the page's visible content actually changes.
const LAST_MODIFIED = '2026-07-24';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteConfig.baseUrl, lastModified: LAST_MODIFIED }];
}
